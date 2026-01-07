import { Entity, PrimaryKey, Property, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

@Entity({ tableName: 'settings' })
export class Setting {
  @PrimaryKey()
  id: string = uuid();

  @Property({ unique: true })
  key!: string;

  @Property({ type: 'json' })
  value!: unknown;

  @Property({ nullable: true })
  description?: string;

  @Property()
  category!: string; // general, shipping, tax, payment, email

  @Property({ default: false })
  isPublic: boolean = false; // Whether this setting is exposed to the frontend

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}

