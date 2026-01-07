/**
 * Stripe Integration Types
 */

export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
}

/**
 * Payment Intent
 */
export interface CreatePaymentIntentRequest {
  amount: number; // In cents
  currency?: string;
  metadata?: Record<string, string>;
  customerId?: string;
  description?: string;
  statementDescriptor?: string;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  status: PaymentIntentStatus;
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export type PaymentIntentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'canceled'
  | 'succeeded';

/**
 * Refund
 */
export interface CreateRefundRequest {
  paymentIntentId: string;
  amount?: number; // Partial refund amount in cents
  reason?: RefundReason;
}

export type RefundReason = 'duplicate' | 'fraudulent' | 'requested_by_customer';

export interface Refund {
  id: string;
  status: RefundStatus;
  amount: number;
  currency: string;
  paymentIntentId: string;
}

export type RefundStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';

/**
 * Customer
 */
export interface CreateCustomerRequest {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
}

/**
 * Webhook Events
 */
export interface StripeWebhookEvent {
  id: string;
  type: StripeEventType;
  data: {
    object: Record<string, unknown>;
  };
  created: number;
}

export type StripeEventType =
  | 'payment_intent.created'
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'payment_intent.canceled'
  | 'charge.refunded'
  | 'charge.dispute.created'
  | 'charge.dispute.closed'
  | 'customer.created'
  | 'customer.updated';

/**
 * Webhook Handler Result
 */
export interface WebhookHandlerResult {
  handled: boolean;
  action?: string;
  error?: string;
}

