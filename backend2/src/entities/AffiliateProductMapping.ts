import { Entity, PrimaryKey, Property, ManyToOne, Unique, Index, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { Affiliate } from './Affiliate.js';
import type { Product } from './Product.js';

@Entity({ tableName: 'affiliate_product_mappings' })
@Unique({ properties: ['affiliate', 'product'] })
@Index({ properties: ['affiliate'] })
@Index({ properties: ['product'] })
export class AffiliateProductMapping {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne('Affiliate')
  affiliate!: Affiliate;

  @ManyToOne('Product')
  product!: Product;

  @Property()
  affiliateSku!: string;

  @Property({ nullable: true })
  affiliateProductId?: string;

  @Property({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  priceMultiplier?: string; // e.g., "1.0500" = 5% markup

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}

