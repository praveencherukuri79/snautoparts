import { Entity, PrimaryKey, Property, ManyToOne, Enum, Index, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { Order } from './Order.js';

export enum ShipmentStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  EXCEPTION = 'EXCEPTION',
}

@Entity({ tableName: 'shipments' })
@Index({ properties: ['order'] })
@Index({ properties: ['trackingNumber'] })
export class Shipment {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne('Order')
  order!: Order;

  @Property()
  carrier!: string; // UPS, FedEx, USPS, etc.

  @Property()
  trackingNumber!: string;

  @Property({ nullable: true })
  trackingUrl?: string;

  @Property({ nullable: true })
  shippedAt?: Date;

  @Property({ nullable: true })
  estimatedDeliveryAt?: Date;

  @Property({ nullable: true })
  deliveredAt?: Date;

  @Enum(() => ShipmentStatus)
  status: ShipmentStatus = ShipmentStatus.PENDING;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}

