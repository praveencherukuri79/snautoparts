/**
 * Stripe Service
 * 
 * @deprecated Use `getStripeService()` from '@/integrations/payments' instead.
 * This file is kept for backwards compatibility.
 */

export {
  StripeService,
  getStripeService,
  stripeService,
} from '../integrations/payments/index.js';

export type {
  PaymentIntent,
  Refund,
  Customer,
  RefundReason,
} from '../integrations/payments/index.js';
