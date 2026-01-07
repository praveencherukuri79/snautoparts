/**
 * Email Job Handlers
 * 
 * Background job handlers for sending emails.
 */

import type { EntityManager } from '@mikro-orm/core';
import { jobQueue, Job, JobType } from './job-queue.js';
import { Order, User, Shipment } from '../entities/index.js';
import { logger } from '../config/logger.js';
import { getEmailService } from '../integrations/email/index.js';
import type { OrderConfirmationData, OrderShippedData } from '../integrations/email/index.js';

/**
 * Email Job Data
 */
interface OrderEmailData {
  orderId: string;
}

interface WelcomeEmailData {
  userId: string;
}

interface LowStockEmailData {
  alerts: Array<{
    sku: string;
    name: string;
    currentQuantity: number;
    threshold: number;
  }>;
  recipientEmails: string[];
}

/**
 * Register email job handlers
 */
export function registerEmailJobHandlers(em: EntityManager): void {
  const emailService = getEmailService();

  // Handle order confirmation email
  jobQueue.registerHandler<OrderEmailData>(
    JobType.ORDER_CONFIRMATION_EMAIL,
    async (job) => {
      await sendOrderConfirmationEmail(em, emailService, job);
    },
  );

  // Handle order shipped email
  jobQueue.registerHandler<OrderEmailData>(
    JobType.ORDER_SHIPPED_EMAIL,
    async (job) => {
      await sendOrderShippedEmail(em, emailService, job);
    },
  );
}

/**
 * Send order confirmation email
 */
async function sendOrderConfirmationEmail(
  em: EntityManager,
  emailService: ReturnType<typeof getEmailService>,
  job: Job<OrderEmailData>,
): Promise<void> {
  const { orderId } = job.data;

  const order = await em.findOne(Order, orderId, {
    populate: ['user', 'items', 'items.product'],
  });

  if (!order) {
    logger.warn({ orderId }, 'Order not found for confirmation email');
    return;
  }

  const user = order.user as User;
  const items = order.items.getItems();
  const shippingAddr = order.shippingAddress as Record<string, string>;

  const data: OrderConfirmationData = {
    customerName: user.firstName,
    orderNumber: order.orderNumber,
    orderDate: order.createdAt,
    items: items.map((item) => ({
      name: item.productName,
      sku: item.productSku,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
      totalPrice: String(item.totalPrice),
    })),
    subtotal: String(order.subtotal),
    shipping: String(order.shippingCost),
    tax: String(order.taxAmount),
    total: String(order.total),
    shippingAddress: {
      firstName: shippingAddr.firstName || '',
      lastName: shippingAddr.lastName || '',
      address1: shippingAddr.address1 || '',
      address2: shippingAddr.address2,
      city: shippingAddr.city || '',
      state: shippingAddr.state || '',
      zipCode: shippingAddr.zipCode || '',
      country: shippingAddr.country || 'US',
    },
  };

  try {
    await emailService.sendOrderConfirmation(user.email, data);
    logger.info(
      { orderId, orderNumber: order.orderNumber, email: user.email },
      'Order confirmation email sent',
    );
  } catch (error) {
    logger.error(
      { orderId, error: error instanceof Error ? error.message : String(error) },
      'Failed to send order confirmation email',
    );
    throw error;
  }
}

/**
 * Send order shipped email
 */
async function sendOrderShippedEmail(
  em: EntityManager,
  emailService: ReturnType<typeof getEmailService>,
  job: Job<OrderEmailData>,
): Promise<void> {
  const { orderId } = job.data;

  const order = await em.findOne(Order, orderId, {
    populate: ['user', 'shipments'],
  });

  if (!order) {
    logger.warn({ orderId }, 'Order not found for shipped email');
    return;
  }

  const user = order.user as User;
  const shipments = (order.shipments?.getItems() as Shipment[]) ?? [];

  const data: OrderShippedData = {
    customerName: user.firstName,
    orderNumber: order.orderNumber,
    shipments: shipments.map((s) => ({
      carrier: s.carrier,
      trackingNumber: s.trackingNumber,
      trackingUrl: s.trackingUrl,
      estimatedDelivery: s.estimatedDeliveryAt,
    })),
  };

  try {
    await emailService.sendOrderShipped(user.email, data);
    logger.info(
      { orderId, orderNumber: order.orderNumber, email: user.email },
      'Order shipped email sent',
    );
  } catch (error) {
    logger.error(
      { orderId, error: error instanceof Error ? error.message : String(error) },
      'Failed to send order shipped email',
    );
    throw error;
  }
}

/**
 * Enqueue order confirmation email job
 */
export async function enqueueOrderConfirmationEmail(orderId: string): Promise<void> {
  await jobQueue.enqueue({
    type: JobType.ORDER_CONFIRMATION_EMAIL,
    data: { orderId },
    maxAttempts: 3,
  });
}

/**
 * Enqueue order shipped email job
 */
export async function enqueueOrderShippedEmail(orderId: string): Promise<void> {
  await jobQueue.enqueue({
    type: JobType.ORDER_SHIPPED_EMAIL,
    data: { orderId },
    maxAttempts: 3,
  });
}
