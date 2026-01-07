import { Entity, PrimaryKey, Property, ManyToOne, Index, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { User } from './User.js';

@Entity({ tableName: 'addresses' })
@Index({ properties: ['user'] })
export class Address {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne('User')
  user!: User;

  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property({ nullable: true })
  company?: string;

  @Property()
  address1!: string;

  @Property({ nullable: true })
  address2?: string;

  @Property()
  city!: string;

  @Property()
  state!: string;

  @Property()
  zipCode!: string;

  @Property({ default: 'US' })
  country: string = 'US';

  @Property({ nullable: true })
  phone?: string;

  @Property({ default: false })
  isDefault: boolean = false;

  @Property({ default: false })
  isBilling: boolean = false;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}

