import { Entity, PrimaryKey, Property, OneToMany, Collection, Index, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { Product } from './Product.js';

@Entity({ tableName: 'brands' })
@Index({ properties: ['slug'] })
export class Brand {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  name!: string;

  @Property({ unique: true })
  slug!: string;

  @Property({ nullable: true, type: 'text' })
  description?: string;

  @Property({ nullable: true })
  logoUrl?: string;

  @Property({ nullable: true })
  websiteUrl?: string;

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();

  // Relations
  @OneToMany('Product', 'brand')
  products = new Collection<Product>(this);
}

