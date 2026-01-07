import { Entity, PrimaryKey, Property, ManyToOne, Index, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { Order } from './Order.js';
import type { User } from './User.js';

@Entity({ tableName: 'order_timeline' })
@Index({ properties: ['order'] })
export class OrderTimeline {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne('Order')
  order!: Order;

  @Property()
  status!: string;

  @Property()
  title!: string; // "Order Placed", "Payment Confirmed", etc.

  @Property({ nullable: true, type: 'text' })
  description?: string;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown>; // Additional context (tracking info, etc.)

  @ManyToOne('User', { nullable: true })
  changedBy?: User; // Who made the change (null if system)

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();
}

