import { Entity, PrimaryKey, Property, ManyToOne, Enum, Index, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { Order } from './Order.js';
import type { Affiliate } from './Affiliate.js';

export enum AffiliateOrderStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity({ tableName: 'affiliate_orders' })
@Index({ properties: ['order'] })
@Index({ properties: ['affiliate'] })
@Index({ properties: ['status'] })
export class AffiliateOrder {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne('Order')
  order!: Order;

  @ManyToOne('Affiliate')
  affiliate!: Affiliate;

  @Enum(() => AffiliateOrderStatus)
  status: AffiliateOrderStatus = AffiliateOrderStatus.PENDING;

  @Property({ nullable: true })
  externalOrderId?: string;

  @Property({ type: 'json', nullable: true })
  orderLines?: Array<{
    productId: string;
    productSku: string;
    productName: string;
    quantity: number;
    unitPrice: string;
  }>;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalAmount?: string;

  @Property({ nullable: true })
  trackingNumber?: string;

  @Property({ type: 'json', nullable: true })
  requestPayload?: Record<string, unknown>;

  @Property({ type: 'json', nullable: true })
  responsePayload?: Record<string, unknown>;

  @Property({ nullable: true, type: 'text' })
  lastError?: string;

  @Property({ default: 0 })
  retryCount: number = 0;

  @Property({ nullable: true })
  nextRetryAt?: Date;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();

  @Property({ nullable: true })
  completedAt?: Date;
}

