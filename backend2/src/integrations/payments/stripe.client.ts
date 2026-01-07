/**
 * Stripe Client
 * 
 * Low-level client for Stripe API interactions.
 * Uses the official Stripe SDK when configured.
 */

import Stripe from 'stripe';
import { logger } from '../../config/logger.js';
import type {
  StripeConfig,
  CreatePaymentIntentRequest,
  PaymentIntent,
  CreateRefundRequest,
  Refund,
  CreateCustomerRequest,
  Customer,
  StripeWebhookEvent,
} from './stripe.types.js';

export class StripeClient {
  private stripe: Stripe | null = null;
  private readonly webhookSecret: string;
  private readonly isConfigured: boolean;

  constructor(config: StripeConfig) {
    this.webhookSecret = config.webhookSecret;
    this.isConfigured = !!config.secretKey;

    if (this.isConfigured) {
      this.stripe = new Stripe(config.secretKey, {
        apiVersion: '2023-10-16',
        typescript: true,
      });
    } else {
      logger.warn('Stripe not configured - running in mock mode');
    }
  }

  /**
   * Check if Stripe is configured
   */
  configured(): boolean {
    return this.isConfigured;
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    if (!this.stripe) {
      return this.mockPaymentIntent(request);
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: request.amount,
        currency: request.currency || 'usd',
        metadata: request.metadata,
        customer: request.customerId,
        description: request.description,
        statement_descriptor_suffix: request.statementDescriptor?.substring(0, 22),
        automatic_payment_methods: { enabled: true },
      });

      logger.info(
        { paymentIntentId: paymentIntent.id, amount: request.amount },
        'Payment intent created',
      );

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        status: paymentIntent.status as PaymentIntent['status'],
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata as Record<string, string>,
      };
    } catch (error) {
      logger.error({ error, request }, 'Failed to create payment intent');
      throw error;
    }
  }

  /**
   * Retrieve a payment intent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent | null> {
    if (!this.stripe) {
      return null;
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        status: paymentIntent.status as PaymentIntent['status'],
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata as Record<string, string>,
      };
    } catch (error) {
      logger.error({ error, paymentIntentId }, 'Failed to retrieve payment intent');
      return null;
    }
  }

  /**
   * Cancel a payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<boolean> {
    if (!this.stripe) {
      return true; // Mock success
    }

    try {
      await this.stripe.paymentIntents.cancel(paymentIntentId);
      logger.info({ paymentIntentId }, 'Payment intent cancelled');
      return true;
    } catch (error) {
      logger.error({ error, paymentIntentId }, 'Failed to cancel payment intent');
      return false;
    }
  }

  /**
   * Create a refund
   */
  async createRefund(request: CreateRefundRequest): Promise<Refund> {
    if (!this.stripe) {
      return this.mockRefund(request);
    }

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: request.paymentIntentId,
        amount: request.amount,
        reason: request.reason,
      });

      logger.info(
        { refundId: refund.id, paymentIntentId: request.paymentIntentId },
        'Refund created',
      );

      return {
        id: refund.id,
        status: refund.status as Refund['status'],
        amount: refund.amount,
        currency: refund.currency,
        paymentIntentId: request.paymentIntentId,
      };
    } catch (error) {
      logger.error({ error, request }, 'Failed to create refund');
      throw error;
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(request: CreateCustomerRequest): Promise<Customer> {
    if (!this.stripe) {
      return {
        id: `cus_mock_${Date.now()}`,
        email: request.email,
        name: request.name,
      };
    }

    try {
      const customer = await this.stripe.customers.create({
        email: request.email,
        name: request.name,
        metadata: request.metadata,
      });

      return {
        id: customer.id,
        email: customer.email!,
        name: customer.name ?? undefined,
      };
    } catch (error) {
      logger.error({ error, request }, 'Failed to create customer');
      throw error;
    }
  }

  /**
   * Verify webhook signature and parse event
   */
  verifyWebhook(payload: string | Buffer, signature: string): StripeWebhookEvent | null {
    if (!this.stripe || !this.webhookSecret) {
      logger.warn('Webhook verification skipped - not configured');
      try {
        const body = typeof payload === 'string' ? payload : payload.toString();
        return JSON.parse(body) as StripeWebhookEvent;
      } catch {
        return null;
      }
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );

      return {
        id: event.id,
        type: event.type as StripeWebhookEvent['type'],
        data: event.data as StripeWebhookEvent['data'],
        created: event.created,
      };
    } catch (error) {
      logger.error({ error }, 'Webhook signature verification failed');
      return null;
    }
  }

  /**
   * Mock payment intent for development
   */
  private mockPaymentIntent(request: CreatePaymentIntentRequest): PaymentIntent {
    const id = `pi_mock_${Date.now()}`;
    logger.debug({ id, amount: request.amount }, 'Created mock payment intent');

    return {
      id,
      clientSecret: `${id}_secret_${Math.random().toString(36).substring(7)}`,
      status: 'requires_payment_method',
      amount: request.amount,
      currency: request.currency || 'usd',
      metadata: request.metadata,
    };
  }

  /**
   * Mock refund for development
   */
  private mockRefund(request: CreateRefundRequest): Refund {
    const id = `re_mock_${Date.now()}`;
    logger.debug({ id, paymentIntentId: request.paymentIntentId }, 'Created mock refund');

    return {
      id,
      status: 'succeeded',
      amount: request.amount || 0,
      currency: 'usd',
      paymentIntentId: request.paymentIntentId,
    };
  }
}

