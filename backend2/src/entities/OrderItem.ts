import { Entity, PrimaryKey, Property, ManyToOne, Index, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { Order } from './Order.js';
import type { Product } from './Product.js';

@Entity({ tableName: 'order_items' })
@Index({ properties: ['order'] })
export class OrderItem {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne('Order')
  order!: Order;

  @ManyToOne('Product')
  product!: Product;

  // Snapshot of product at time of order
  @Property()
  productName!: string;

  @Property()
  productSku!: string;

  @Property({ nullable: true })
  productImageUrl?: string;

  @Property()
  quantity!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice!: string;

  // For drop-ship tracking
  @Property({ nullable: true })
  supplierId?: string;

  @Property({ nullable: true })
  supplierSku?: string;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();
}

