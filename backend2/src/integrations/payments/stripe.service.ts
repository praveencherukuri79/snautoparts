/**
 * Stripe Payment Service
 * 
 * High-level service for payment operations.
 * Wraps the Stripe client with business logic.
 */

import { config } from '../../config/index.js';
import { logger } from '../../config/logger.js';
import { StripeClient } from './stripe.client.js';
import type {
  PaymentIntent,
  Refund,
  Customer,
  RefundReason,
} from './stripe.types.js';

export class StripeService {
  private client: StripeClient;

  constructor() {
    this.client = new StripeClient({
      secretKey: config.stripe.secretKey,
      publishableKey: config.stripe.publicKey,
      webhookSecret: config.stripe.webhookSecret,
    });
  }

  /**
   * Check if Stripe is configured
   */
  isConfigured(): boolean {
    return this.client.configured();
  }

  /**
   * Create a payment intent for an order
   */
  async createOrderPayment(
    orderId: string,
    orderNumber: string,
    amount: number, // In dollars
    customerEmail?: string,
  ): Promise<PaymentIntent> {
    const amountInCents = Math.round(amount * 100);

    logger.info(
      { orderId, orderNumber, amount: amountInCents },
      'Creating payment intent for order',
    );

    return this.client.createPaymentIntent({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        orderId,
        orderNumber,
        customerEmail: customerEmail || '',
      },
      description: `Order ${orderNumber}`,
      statementDescriptor: 'SNAUTOPARTS',
    });
  }

  /**
   * Get payment intent status
   */
  async getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent | null> {
    return this.client.getPaymentIntent(paymentIntentId);
  }

  /**
   * Cancel a payment intent
   */
  async cancelPayment(paymentIntentId: string): Promise<boolean> {
    logger.info({ paymentIntentId }, 'Cancelling payment intent');
    return this.client.cancelPaymentIntent(paymentIntentId);
  }

  /**
   * Process a refund
   */
  async refundPayment(
    paymentIntentId: string,
    amount?: number, // In dollars, undefined for full refund
    reason?: RefundReason,
  ): Promise<Refund> {
    const amountInCents = amount ? Math.round(amount * 100) : undefined;

    logger.info(
      { paymentIntentId, amount: amountInCents, reason },
      'Processing refund',
    );

    return this.client.createRefund({
      paymentIntentId,
      amount: amountInCents,
      reason,
    });
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(email: string, name?: string): Promise<Customer> {
    return this.client.createCustomer({ email, name });
  }

  /**
   * Verify and parse webhook payload
   */
  verifyWebhook(payload: string | Buffer, signature: string) {
    return this.client.verifyWebhook(payload, signature);
  }

  /**
   * Convert amount to display format
   */
  formatAmount(amountInCents: number): string {
    return (amountInCents / 100).toFixed(2);
  }
}

// Singleton instance
let stripeServiceInstance: StripeService | null = null;

export function getStripeService(): StripeService {
  if (!stripeServiceInstance) {
    stripeServiceInstance = new StripeService();
  }
  return stripeServiceInstance;
}

// Export for backwards compatibility
export const stripeService = new StripeService();

