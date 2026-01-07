import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Enum, Index, Collection, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { Category } from './Category.js';
import type { Brand } from './Brand.js';
import type { ProductFitment } from './ProductFitment.js';
import type { CartItem } from './CartItem.js';
import type { OrderItem } from './OrderItem.js';
import type { InventoryLog } from './InventoryLog.js';
import type { AffiliateProductMapping } from './AffiliateProductMapping.js';

export enum FulfillmentType {
  INVENTORY = 'INVENTORY',
  DROPSHIP = 'DROPSHIP',
  MIXED = 'MIXED',
}

export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
}

@Entity({ tableName: 'products' })
@Index({ properties: ['category'] })
@Index({ properties: ['brand'] })
@Index({ properties: ['sku'] })
@Index({ properties: ['slug'] })
@Index({ properties: ['fulfillmentType'] })
export class Product {
  @PrimaryKey()
  id: string = uuid();

  @Property({ unique: true })
  sku!: string;

  @Property()
  name!: string;

  @Property({ unique: true })
  slug!: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ nullable: true })
  shortDescription?: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  price!: string; // Use string for decimals with MikroORM

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  compareAtPrice?: string;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice?: string;

  @ManyToOne('Category')
  category!: Category;

  @ManyToOne('Brand', { nullable: true })
  brand?: Brand;

  @Property({ nullable: true })
  imageUrl?: string;

  @Property({ type: 'json', default: [] })
  images: string[] = [];

  // Dimensions
  @Property({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight?: string;

  @Property({ default: 'lb' })
  weightUnit: string = 'lb';

  @Property({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  length?: string;

  @Property({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  width?: string;

  @Property({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  height?: string;

  @Property({ default: 'in' })
  dimensionUnit: string = 'in';

  // Inventory
  @Property({ default: 0 })
  stockQuantity: number = 0;

  @Property({ default: 10 })
  lowStockThreshold: number = 10;

  @Property({ nullable: true })
  upc?: string;

  // Fulfillment
  @Enum(() => FulfillmentType)
  fulfillmentType: FulfillmentType = FulfillmentType.INVENTORY;

  // Status
  @Property({ default: true })
  isActive: boolean = true;

  @Property({ default: false })
  isFeatured: boolean = false;

  // SEO
  @Property({ nullable: true })
  metaTitle?: string;

  @Property({ nullable: true, type: 'text' })
  metaDescription?: string;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();

  // Relations
  @OneToMany('CartItem', 'product')
  cartItems = new Collection<CartItem>(this);

  @OneToMany('OrderItem', 'product')
  orderItems = new Collection<OrderItem>(this);

  @OneToMany('ProductFitment', 'product')
  fitments = new Collection<ProductFitment>(this);

  @OneToMany('InventoryLog', 'product')
  inventoryLogs = new Collection<InventoryLog>(this);

  @OneToMany('AffiliateProductMapping', 'product')
  affiliateMappings = new Collection<AffiliateProductMapping>(this);

  // Computed
  get stockStatus(): StockStatus {
    if (this.stockQuantity === 0) return StockStatus.OUT_OF_STOCK;
    if (this.stockQuantity <= this.lowStockThreshold) return StockStatus.LOW_STOCK;
    return StockStatus.IN_STOCK;
  }
}

