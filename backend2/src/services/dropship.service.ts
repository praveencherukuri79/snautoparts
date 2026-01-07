import { EntityManager } from '@mikro-orm/core';
import { AffiliateOrder, AffiliateOrderStatus, Affiliate, Order } from '../entities/index.js';
import { NotFoundError } from '../plugins/error-handler.js';
import { enqueueAffiliateOrderRetry } from '../jobs/affiliate-jobs.js';

/**
 * Dropship Service
 * 
 * Handles drop-ship order management and affiliate order operations.
 */
export class DropshipService {
  constructor(private em: EntityManager) {}

  /**
   * Get affiliate orders with filters
   */
  async getAffiliateOrders(options: {
    affiliateId?: string;
    status?: AffiliateOrderStatus;
    orderId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: AffiliateOrder[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (options.affiliateId) {
      where.affiliate = options.affiliateId;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.orderId) {
      where.order = options.orderId;
    }

    const [orders, total] = await this.em.findAndCount(AffiliateOrder, where, {
      populate: ['affiliate', 'order'],
      orderBy: { createdAt: 'DESC' },
      limit,
      offset,
    });

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get affiliate order by ID
   */
  async getAffiliateOrderById(id: string): Promise<AffiliateOrder | null> {
    return this.em.findOne(AffiliateOrder, { id }, {
      populate: ['affiliate', 'order', 'order.items', 'order.user'],
    });
  }

  /**
   * Retry a failed affiliate order
   */
  async retryAffiliateOrder(id: string): Promise<AffiliateOrder> {
    const affiliateOrder = await this.em.findOne(AffiliateOrder, { id });

    if (!affiliateOrder) {
      throw new NotFoundError('Affiliate order not found');
    }

    if (affiliateOrder.status !== AffiliateOrderStatus.FAILED) {
      throw new Error('Only failed orders can be retried');
    }

    // Reset for retry
    affiliateOrder.status = AffiliateOrderStatus.PENDING;
    affiliateOrder.lastError = undefined;
    affiliateOrder.retryCount = 0;
    affiliateOrder.nextRetryAt = undefined;

    await this.em.flush();

    // Queue the retry job
    await enqueueAffiliateOrderRetry(id);

    return affiliateOrder;
  }

  /**
   * Get failed affiliate orders count
   */
  async getFailedOrdersCount(): Promise<number> {
    return this.em.count(AffiliateOrder, { status: AffiliateOrderStatus.FAILED });
  }

  /**
   * Get affiliate order statistics
   */
  async getStatistics(): Promise<{
    total: number;
    pending: number;
    sent: number;
    confirmed: number;
    failed: number;
    cancelled: number;
  }> {
    const [total, pending, sent, confirmed, failed, cancelled] = await Promise.all([
      this.em.count(AffiliateOrder, {}),
      this.em.count(AffiliateOrder, { status: AffiliateOrderStatus.PENDING }),
      this.em.count(AffiliateOrder, { status: AffiliateOrderStatus.SENT }),
      this.em.count(AffiliateOrder, { status: AffiliateOrderStatus.CONFIRMED }),
      this.em.count(AffiliateOrder, { status: AffiliateOrderStatus.FAILED }),
      this.em.count(AffiliateOrder, { status: AffiliateOrderStatus.CANCELLED }),
    ]);

    return { total, pending, sent, confirmed, failed, cancelled };
  }
}

export function createDropshipService(em: EntityManager): DropshipService {
  return new DropshipService(em);
}

