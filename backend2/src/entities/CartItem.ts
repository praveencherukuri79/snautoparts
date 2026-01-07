import { Entity, PrimaryKey, Property, ManyToOne, Index, Unique, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { Cart } from './Cart.js';
import type { Product } from './Product.js';

@Entity({ tableName: 'cart_items' })
@Index({ properties: ['cart'] })
@Unique({ properties: ['cart', 'product'] })
export class CartItem {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne('Cart')
  cart!: Cart;

  @ManyToOne('Product')
  product!: Product;

  @Property()
  quantity: number = 1;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}

