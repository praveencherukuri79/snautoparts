import { Entity, PrimaryKey, Property, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

@Entity({ tableName: 'webhooks' })
export class Webhook {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  name!: string;

  @Property()
  url!: string;

  @Property({ type: 'json' })
  events!: string[]; // ['order.created', 'order.shipped', etc.]

  @Property({ nullable: true })
  secret?: string; // For signature verification

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ nullable: true })
  lastTriggeredAt?: Date;

  @Property({ nullable: true })
  lastStatus?: number; // Last HTTP status code

  @Property({ default: 0 })
  failureCount: number = 0;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}

