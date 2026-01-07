import { Entity, PrimaryKey, Property, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

@Entity({ tableName: 'features' })
export class Feature {
  @PrimaryKey()
  id: string = uuid();

  @Property({ unique: true })
  code!: string; // e.g., "catalog.browse", "orders.manage"

  @Property()
  name!: string;

  @Property({ nullable: true, type: 'text' })
  description?: string;

  @Property()
  category!: string; // catalog, orders, inventory, admin

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}

