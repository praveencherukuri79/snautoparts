import { Entity, PrimaryKey, Property, ManyToOne, Index, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { Product } from './Product.js';

@Entity({ tableName: 'product_fitments' })
@Index({ properties: ['product'] })
@Index({ properties: ['make', 'model', 'yearStart', 'yearEnd'] })
export class ProductFitment {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne('Product')
  product!: Product;

  @Property()
  make!: string;

  @Property()
  model!: string;

  @Property()
  yearStart!: number;

  @Property()
  yearEnd!: number;

  @Property({ nullable: true })
  submodel?: string;

  @Property({ nullable: true })
  engine?: string;

  @Property({ nullable: true })
  notes?: string;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();
}

