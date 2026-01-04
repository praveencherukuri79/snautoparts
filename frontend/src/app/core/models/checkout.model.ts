import { ShippingAddress } from './order.model';

export interface CheckoutState {
  step: CheckoutStep;
  shippingAddress?: ShippingAddress;
  shippingMethod?: ShippingMethod;
  paymentIntentId?: string;
  clientSecret?: string;
}

export type CheckoutStep = 'address' | 'shipping' | 'payment' | 'review';

/**
 * Shipping method from backend
 */
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  freeThreshold: number | null;
}

/**
 * Payment intent response from backend /customer/checkout/create-payment-intent
 */
export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
}

/**
 * Request to create payment intent - backend expects idempotencyKey
 */
export interface CreatePaymentIntentRequest {
  idempotencyKey: string;
}

