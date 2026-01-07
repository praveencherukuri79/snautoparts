import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection, Index, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { User } from './User.js';
import type { CartItem } from './CartItem.js';

@Entity({ tableName: 'carts' })
@Index({ properties: ['user'] })
export class Cart {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne('User', { nullable: true })
  user?: User;

  @Property({ nullable: true })
  sessionId?: string; // For guest carts

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();

  // Relations
  @OneToMany('CartItem', 'cart')
  items = new Collection<CartItem>(this);
}

