/**
 * Stripe Webhook Handlers
 * 
 * Handlers for various Stripe webhook events.
 */

import type { EntityManager } from '@mikro-orm/core';
import { logger } from '../../config/logger.js';
import { Order, PaymentEvent, PaymentEventType, PaymentEventStatus, OrderStatus } from '../../entities/index.js';
import type { StripeWebhookEvent, WebhookHandlerResult } from './stripe.types.js';

/**
 * Handle Stripe webhook event
 */
export async function handleStripeWebhook(
  em: EntityManager,
  event: StripeWebhookEvent,
): Promise<WebhookHandlerResult> {
  logger.info({ eventId: event.id, type: event.type }, 'Processing Stripe webhook');

  // Route to appropriate handler
  switch (event.type) {
    case 'payment_intent.succeeded':
      return handlePaymentIntentSucceeded(em, event);

    case 'payment_intent.payment_failed':
      return handlePaymentIntentFailed(em, event);

    case 'payment_intent.canceled':
      return handlePaymentIntentCanceled(em, event);

    case 'charge.refunded':
      return handleChargeRefunded(em, event);

    case 'charge.dispute.created':
      return handleDisputeCreated(em, event);

    default:
      logger.debug({ type: event.type }, 'Unhandled webhook event type');
      return { handled: false };
  }
}

/**
 * Log payment event to database
 */
async function logPaymentEvent(
  em: EntityManager,
  order: Order,
  eventType: PaymentEventType,
  status: PaymentEventStatus,
  paymentIntentId: string | undefined,
  amount: string,
  event: StripeWebhookEvent,
): Promise<PaymentEvent> {
  const paymentEvent = em.create(PaymentEvent, {
    order,
    type: eventType,
    status,
    stripePaymentIntentId: paymentIntentId,
    amount,
    currency: 'USD',
    stripeEventPayload: event.data.object as Record<string, unknown>,
  });

  em.persist(paymentEvent);
  return paymentEvent;
}

/**
 * Handle successful payment
 */
async function handlePaymentIntentSucceeded(
  em: EntityManager,
  event: StripeWebhookEvent,
): Promise<WebhookHandlerResult> {
  const data = event.data.object as Record<string, unknown>;
  const paymentIntentId = data.id as string;
  const amount = data.amount as number;

  const order = await em.findOne(Order, { paymentIntentId });

  if (!order) {
    logger.warn({ paymentIntentId }, 'No order found for payment intent');
    return { handled: false, error: 'Order not found' };
  }

  // Log payment event
  await logPaymentEvent(
    em,
    order,
    PaymentEventType.PAYMENT_SUCCEEDED,
    PaymentEventStatus.SUCCEEDED,
    paymentIntentId,
    String(amount / 100),
    event,
  );

  // Update order status
  order.isPaid = true;
  order.paidAt = new Date();
  if (order.status === OrderStatus.PENDING) {
    order.status = OrderStatus.CONFIRMED;
  }

  em.persist(order);
  await em.flush();

  logger.info(
    { orderId: order.id, orderNumber: order.orderNumber },
    'Payment succeeded - order confirmed',
  );

  return { handled: true, action: 'order_confirmed' };
}

/**
 * Handle failed payment
 */
async function handlePaymentIntentFailed(
  em: EntityManager,
  event: StripeWebhookEvent,
): Promise<WebhookHandlerResult> {
  const data = event.data.object as Record<string, unknown>;
  const paymentIntentId = data.id as string;
  const lastError = data.last_payment_error as Record<string, unknown> | undefined;
  const amount = data.amount as number;

  const order = await em.findOne(Order, { paymentIntentId });

  if (!order) {
    return { handled: false, error: 'Order not found' };
  }

  // Log payment event
  const paymentEvent = await logPaymentEvent(
    em,
    order,
    PaymentEventType.PAYMENT_FAILED,
    PaymentEventStatus.FAILED,
    paymentIntentId,
    String((amount || 0) / 100),
    event,
  );

  // Store error details
  if (lastError) {
    paymentEvent.errorCode = lastError.code as string | undefined;
    paymentEvent.errorMessage = lastError.message as string | undefined;
  }

  await em.flush();

  logger.warn(
    { orderId: order.id, error: lastError?.message },
    'Payment failed',
  );

  return { handled: true, action: 'payment_failed' };
}

/**
 * Handle canceled payment intent
 */
async function handlePaymentIntentCanceled(
  em: EntityManager,
  event: StripeWebhookEvent,
): Promise<WebhookHandlerResult> {
  const data = event.data.object as Record<string, unknown>;
  const paymentIntentId = data.id as string;
  const amount = data.amount as number;

  const order = await em.findOne(Order, { paymentIntentId });

  if (!order) {
    return { handled: false, error: 'Order not found' };
  }

  // Log payment event
  await logPaymentEvent(
    em,
    order,
    PaymentEventType.PAYMENT_FAILED,
    PaymentEventStatus.CANCELLED,
    paymentIntentId,
    String((amount || 0) / 100),
    event,
  );

  if (order.status === OrderStatus.PENDING) {
    order.status = OrderStatus.CANCELLED;
  }

  em.persist(order);
  await em.flush();

  logger.info({ orderId: order.id }, 'Payment cancelled');

  return { handled: true, action: 'payment_cancelled' };
}

/**
 * Handle refund
 */
async function handleChargeRefunded(
  em: EntityManager,
  event: StripeWebhookEvent,
): Promise<WebhookHandlerResult> {
  const data = event.data.object as Record<string, unknown>;
  const paymentIntentId = data.payment_intent as string;
  const chargeId = data.id as string;
  const refunded = data.refunded as boolean;
  const amountRefunded = data.amount_refunded as number;

  const order = await em.findOne(Order, { paymentIntentId });

  if (!order) {
    return { handled: false, error: 'Order not found' };
  }

  // Log refund event
  const paymentEvent = await logPaymentEvent(
    em,
    order,
    PaymentEventType.REFUND_COMPLETED,
    PaymentEventStatus.REFUNDED,
    paymentIntentId,
    String(amountRefunded / 100),
    event,
  );
  paymentEvent.stripeChargeId = chargeId;

  if (refunded) {
    order.status = OrderStatus.REFUNDED;
  }

  em.persist(order);
  await em.flush();

  logger.info(
    { orderId: order.id, amountRefunded: amountRefunded / 100 },
    'Charge refunded',
  );

  return { handled: true, action: 'refund_processed' };
}

/**
 * Handle dispute created
 */
async function handleDisputeCreated(
  em: EntityManager,
  event: StripeWebhookEvent,
): Promise<WebhookHandlerResult> {
  const data = event.data.object as Record<string, unknown>;
  const charge = data.charge as string;

  logger.warn({ charge, disputeId: data.id }, 'Dispute created - requires attention');

  // Disputes are flagged in logs and should be monitored via dashboard
  // Admin notifications can be configured via webhooks settings

  return { handled: true, action: 'dispute_flagged' };
}
