import { Entity, PrimaryKey, Property, ManyToOne, Index, Enum, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { Order } from './Order.js';

/**
 * Payment Event Status
 */
export enum PaymentEventStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED',
}

/**
 * Payment Event Type
 */
export enum PaymentEventType {
  PAYMENT_INTENT_CREATED = 'PAYMENT_INTENT_CREATED',
  PAYMENT_SUCCEEDED = 'PAYMENT_SUCCEEDED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REFUND_INITIATED = 'REFUND_INITIATED',
  REFUND_COMPLETED = 'REFUND_COMPLETED',
  DISPUTE_CREATED = 'DISPUTE_CREATED',
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
}

/**
 * Payment Event Entity
 * 
 * Tracks all payment-related events for an order from Stripe.
 */
@Entity({ tableName: 'payment_events' })
@Index({ properties: ['order'] })
@Index({ properties: ['stripePaymentIntentId'] })
export class PaymentEvent {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Order)
  order!: Order;

  @Enum(() => PaymentEventType)
  type!: PaymentEventType;

  @Enum(() => PaymentEventStatus)
  status!: PaymentEventStatus;

  @Property({ nullable: true })
  stripePaymentIntentId?: string;

  @Property({ nullable: true })
  stripeChargeId?: string;

  @Property({ nullable: true })
  stripeRefundId?: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amount!: string;

  @Property({ default: 'USD' })
  currency: string = 'USD';

  @Property({ nullable: true })
  errorCode?: string;

  @Property({ nullable: true })
  errorMessage?: string;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown>;

  @Property({ type: 'json', nullable: true })
  stripeEventPayload?: Record<string, unknown>;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();
}

