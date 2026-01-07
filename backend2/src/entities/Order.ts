import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Enum, Index, Collection, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { User } from './User.js';
import type { Address } from './Address.js';
import type { OrderItem } from './OrderItem.js';
import type { OrderTimeline } from './OrderTimeline.js';
import type { Shipment } from './Shipment.js';
import type { AffiliateOrder } from './AffiliateOrder.js';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

@Entity({ tableName: 'orders' })
@Index({ properties: ['user'] })
@Index({ properties: ['orderNumber'] })
@Index({ properties: ['status'] })
@Index({ properties: ['createdAt'] })
export class Order {
  @PrimaryKey()
  id: string = uuid();

  @Property({ unique: true })
  orderNumber!: string;

  @ManyToOne('User')
  user!: User;

  @Enum(() => OrderStatus)
  status: OrderStatus = OrderStatus.PENDING;

  // Prices
  @Property({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2, default: '0' })
  shippingCost: string = '0';

  @Property({ type: 'decimal', precision: 10, scale: 2, default: '0' })
  taxAmount: string = '0';

  @Property({ type: 'decimal', precision: 10, scale: 2, default: '0' })
  discountAmount: string = '0';

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  total!: string;

  // Shipping Address (snapshot)
  @Property({ type: 'json' })
  shippingAddress!: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };

  // Billing Address (snapshot)
  @Property({ type: 'json', nullable: true })
  billingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };

  // Shipping
  @Property({ nullable: true })
  shippingMethod?: string;

  @Property({ nullable: true })
  shippingCarrier?: string;

  // Payment
  @Property({ nullable: true })
  paymentMethod?: string;

  @Property({ nullable: true })
  paymentIntentId?: string; // Stripe Payment Intent ID

  @Property({ default: false })
  isPaid: boolean = false;

  @Property({ nullable: true })
  paidAt?: Date;

  // Notes
  @Property({ nullable: true, type: 'text' })
  customerNotes?: string;

  @Property({ nullable: true, type: 'text' })
  internalNotes?: string;

  // Idempotency
  @Property({ nullable: true, unique: true })
  idempotencyKey?: string;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();

  // Relations
  @OneToMany('OrderItem', 'order')
  items = new Collection<OrderItem>(this);

  @OneToMany('OrderTimeline', 'order')
  timeline = new Collection<OrderTimeline>(this);

  @OneToMany('Shipment', 'order')
  shipments = new Collection<Shipment>(this);

  @OneToMany('AffiliateOrder', 'order')
  affiliateOrders = new Collection<AffiliateOrder>(this);
}

