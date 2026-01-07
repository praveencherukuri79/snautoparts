import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection, Index, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { Role } from './Role.js';
import type { Address } from './Address.js';
import type { Cart } from './Cart.js';
import type { Order } from './Order.js';
import type { SavedVehicle } from './SavedVehicle.js';

@Entity({ tableName: 'users' })
@Index({ properties: ['email'] })
export class User {
  @PrimaryKey()
  id: string = uuid();

  @Property({ unique: true })
  email!: string;

  @Property()
  passwordHash!: string;

  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property({ nullable: true })
  phone?: string;

  @Property({ nullable: true })
  avatarUrl?: string;

  @ManyToOne('Role', { nullable: true })
  role?: Role;

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ default: false })
  emailVerified: boolean = false;

  @Property({ nullable: true })
  lastLoginAt?: Date;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();

  // Relations
  @OneToMany('Address', 'user')
  addresses = new Collection<Address>(this);

  @OneToMany('Cart', 'user')
  carts = new Collection<Cart>(this);

  @OneToMany('Order', 'user')
  orders = new Collection<Order>(this);

  @OneToMany('SavedVehicle', 'user')
  savedVehicles = new Collection<SavedVehicle>(this);

  // Computed
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

