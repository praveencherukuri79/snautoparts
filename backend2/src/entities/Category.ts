import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection, Index, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { Product } from './Product.js';

@Entity({ tableName: 'categories' })
@Index({ properties: ['slug'] })
export class Category {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  name!: string;

  @Property({ unique: true })
  slug!: string;

  @Property({ nullable: true, type: 'text' })
  description?: string;

  @Property({ nullable: true })
  imageUrl?: string;

  @Property({ nullable: true })
  icon?: string; // Material icon name

  @ManyToOne('Category', { nullable: true })
  parent?: Category;

  @Property({ default: 0 })
  sortOrder: number = 0;

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();

  // Relations
  @OneToMany('Category', 'parent')
  children = new Collection<Category>(this);

  @OneToMany('Product', 'category')
  products = new Collection<Product>(this);
}

