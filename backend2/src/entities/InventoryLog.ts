import { Entity, PrimaryKey, Property, ManyToOne, Enum, Index, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { Product } from './Product.js';
import type { User } from './User.js';

export enum InventoryAdjustmentType {
  IMPORT = 'IMPORT',
  SALE = 'SALE',
  RETURN = 'RETURN',
  ADJUSTMENT = 'ADJUSTMENT',
  RECOUNT = 'RECOUNT',
  DAMAGED = 'DAMAGED',
  RECEIVED = 'RECEIVED',
}

@Entity({ tableName: 'inventory_logs' })
@Index({ properties: ['product'] })
@Index({ properties: ['createdAt'] })
export class InventoryLog {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne('Product')
  product!: Product;

  @Enum(() => InventoryAdjustmentType)
  type!: InventoryAdjustmentType;

  @Property()
  quantityChange!: number; // Can be positive or negative

  @Property()
  quantityBefore!: number;

  @Property()
  quantityAfter!: number;

  @Property({ nullable: true })
  reason?: string;

  @Property({ nullable: true, type: 'text' })
  notes?: string;

  @Property({ nullable: true })
  referenceId?: string; // Order ID, Import batch ID, etc.

  @ManyToOne('User', { nullable: true })
  createdBy?: User;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();
}

