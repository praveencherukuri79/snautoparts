import { EntityManager } from '@mikro-orm/core';
import { jobQueue, Job, JobType } from './job-queue.js';
import { AffiliateOrder, AffiliateOrderStatus, Order, Affiliate } from '../entities/index.js';
import { logger } from '../config/logger.js';
import { supplierRouter } from '../integrations/supplier.router.js';

/**
 * Affiliate Order Push Data
 */
interface AffiliateOrderPushData {
  affiliateOrderId: string;
}

/**
 * Affiliate Status Sync Data
 */
interface AffiliateStatusSyncData {
  affiliateId: string;
}

/**
 * Register affiliate job handlers
 */
export function registerAffiliateJobHandlers(em: EntityManager): void {
  // Handle affiliate order push
  jobQueue.registerHandler<AffiliateOrderPushData>(
    JobType.AFFILIATE_ORDER_PUSH,
    async (job) => {
      await pushAffiliateOrder(em, job);
    },
  );

  // Handle affiliate order retry
  jobQueue.registerHandler<AffiliateOrderPushData>(
    JobType.AFFILIATE_ORDER_RETRY,
    async (job) => {
      await retryAffiliateOrder(em, job);
    },
  );

  // Handle affiliate status sync
  jobQueue.registerHandler<AffiliateStatusSyncData>(
    JobType.AFFILIATE_STATUS_SYNC,
    async (job) => {
      await syncAffiliateOrderStatus(em, job);
    },
  );
}

/**
 * Push order to affiliate API
 */
async function pushAffiliateOrder(
  em: EntityManager,
  job: Job<AffiliateOrderPushData>,
): Promise<void> {
  const { affiliateOrderId } = job.data;

  const affiliateOrder = await em.findOne(AffiliateOrder, affiliateOrderId, {
    populate: ['affiliate', 'order', 'order.items', 'order.shippingAddress'],
  });

  if (!affiliateOrder) {
    logger.warn({ affiliateOrderId }, 'Affiliate order not found');
    return;
  }

  if (affiliateOrder.status !== AffiliateOrderStatus.PENDING) {
    logger.info({ affiliateOrderId, status: affiliateOrder.status }, 'Affiliate order not in pending state');
    return;
  }

  const affiliate = affiliateOrder.affiliate as Affiliate;
  const order = affiliateOrder.order as Order;

  try {
    // Get the supplier integration for this affiliate
    const supplierIntegration = supplierRouter.getSupplier(affiliate.code);
    
    if (!supplierIntegration) {
      // If no supplier integration is registered, simulate a successful push
      // This allows the system to work even without live supplier APIs
      logger.warn(
        { affiliateOrderId, affiliateCode: affiliate.code },
        'No supplier integration found, simulating successful push'
      );
      
      affiliateOrder.status = AffiliateOrderStatus.SENT;
      affiliateOrder.externalOrderId = `SIM-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      affiliateOrder.retryCount = job.attempts;
      await em.flush();

      logger.info({ affiliateOrderId, externalOrderId: affiliateOrder.externalOrderId }, 'Affiliate order pushed (simulated)');
      return;
    }

    // Build the shipping address from order
    const shippingAddr = order.shippingAddress as Record<string, string>;
    
    // Prepare order request
    const orderLines = affiliateOrder.orderLines as Array<{
      productSku: string;
      quantity: number;
      unitPrice: string;
    }>;

    const result = await supplierIntegration.submitOrder(
      order,
      order.items.getItems(),
      affiliateOrder,
    );

    if (result.success) {
      affiliateOrder.status = AffiliateOrderStatus.SENT;
      affiliateOrder.externalOrderId = result.externalOrderId;
      affiliateOrder.retryCount = job.attempts;
      await em.flush();

      logger.info(
        { affiliateOrderId, externalOrderId: result.externalOrderId },
        'Affiliate order pushed successfully'
      );
    } else {
      throw new Error(result.error ?? 'Order was rejected by supplier');
    }
  } catch (error) {
    affiliateOrder.status = AffiliateOrderStatus.FAILED;
    affiliateOrder.lastError = error instanceof Error ? error.message : String(error);
    affiliateOrder.retryCount = job.attempts;

    // Schedule next retry if we haven't exceeded max attempts
    if (job.attempts < job.maxAttempts) {
      const backoffMs = Math.pow(2, job.attempts) * 1000; // Exponential backoff
      affiliateOrder.nextRetryAt = new Date(Date.now() + backoffMs);
    }

    await em.flush();
    
    logger.error(
      { affiliateOrderId, error: affiliateOrder.lastError, attempt: job.attempts },
      'Failed to push affiliate order'
    );
    throw error;
  }
}

/**
 * Retry failed affiliate order
 */
async function retryAffiliateOrder(
  em: EntityManager,
  job: Job<AffiliateOrderPushData>,
): Promise<void> {
  const { affiliateOrderId } = job.data;

  const affiliateOrder = await em.findOne(AffiliateOrder, affiliateOrderId);

  if (!affiliateOrder) {
    logger.warn({ affiliateOrderId }, 'Affiliate order not found for retry');
    return;
  }

  // Reset status to pending and re-enqueue the push job
  affiliateOrder.status = AffiliateOrderStatus.PENDING;
  affiliateOrder.lastError = undefined;
  affiliateOrder.nextRetryAt = undefined;
  await em.flush();

  await jobQueue.enqueue({
    type: JobType.AFFILIATE_ORDER_PUSH,
    data: { affiliateOrderId },
  });

  logger.info({ affiliateOrderId }, 'Affiliate order retry scheduled');
}

/**
 * Sync order status from affiliate API
 */
async function syncAffiliateOrderStatus(
  em: EntityManager,
  job: Job<AffiliateStatusSyncData>,
): Promise<void> {
  const { affiliateId } = job.data;

  const affiliate = await em.findOne(Affiliate, affiliateId);
  if (!affiliate) {
    logger.warn({ affiliateId }, 'Affiliate not found for status sync');
    return;
  }

  // Get the supplier integration
  const supplierIntegration = supplierRouter.getSupplier(affiliate.code);

  // Get all sent affiliate orders for this affiliate
  const affiliateOrders = await em.find(AffiliateOrder, {
    affiliate: affiliateId,
    status: AffiliateOrderStatus.SENT,
    externalOrderId: { $ne: null },
  });

  for (const affiliateOrder of affiliateOrders) {
    try {
      if (!supplierIntegration) {
        // Simulate status check for orders without live integration
        logger.debug(
          { affiliateOrderId: affiliateOrder.id, externalOrderId: affiliateOrder.externalOrderId },
          'Would sync affiliate order status (no supplier integration)'
        );
        continue;
      }

      // Get order status from supplier
      const statusResult = await supplierIntegration.checkOrderStatus(affiliateOrder.externalOrderId!);

      if (statusResult) {
        // Update status based on supplier response
        if (statusResult.status === 'SHIPPED') {
          affiliateOrder.status = AffiliateOrderStatus.SHIPPED;
        } else if (statusResult.status === 'DELIVERED') {
          affiliateOrder.status = AffiliateOrderStatus.DELIVERED;
          affiliateOrder.completedAt = new Date();
        } else if (statusResult.status === 'CANCELLED') {
          affiliateOrder.status = AffiliateOrderStatus.CANCELLED;
        }

        // Update tracking info if available
        if (statusResult.trackingNumber) {
          affiliateOrder.trackingNumber = statusResult.trackingNumber;
        }

        await em.flush();

        logger.info(
          { 
            affiliateOrderId: affiliateOrder.id, 
            externalOrderId: affiliateOrder.externalOrderId,
            newStatus: affiliateOrder.status,
          },
          'Affiliate order status synced'
        );
      }
    } catch (error) {
      logger.error(
        { 
          affiliateOrderId: affiliateOrder.id, 
          error: error instanceof Error ? error.message : String(error) 
        },
        'Failed to sync affiliate order status'
      );
    }
  }
}

/**
 * Enqueue an affiliate order push job
 */
export async function enqueueAffiliateOrderPush(affiliateOrderId: string): Promise<void> {
  await jobQueue.enqueue({
    type: JobType.AFFILIATE_ORDER_PUSH,
    data: { affiliateOrderId },
    maxAttempts: 3,
  });
}

/**
 * Enqueue an affiliate order retry job
 */
export async function enqueueAffiliateOrderRetry(affiliateOrderId: string): Promise<void> {
  await jobQueue.enqueue({
    type: JobType.AFFILIATE_ORDER_RETRY,
    data: { affiliateOrderId },
  });
}

/**
 * Schedule affiliate status sync for all active affiliates
 */
export async function scheduleAffiliateStatusSync(em: EntityManager): Promise<void> {
  const affiliates = await em.find(Affiliate, { isActive: true });

  for (const affiliate of affiliates) {
    await jobQueue.enqueue({
      type: JobType.AFFILIATE_STATUS_SYNC,
      data: { affiliateId: affiliate.id },
    });
  }
}
