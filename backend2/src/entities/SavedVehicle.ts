import { Entity, PrimaryKey, Property, ManyToOne, Index, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { User } from './User.js';

@Entity({ tableName: 'saved_vehicles' })
@Index({ properties: ['user'] })
export class SavedVehicle {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne('User')
  user!: User;

  @Property({ nullable: true })
  nickname?: string; // e.g., "My Truck"

  @Property()
  year!: number;

  @Property()
  make!: string;

  @Property()
  model!: string;

  @Property({ nullable: true })
  submodel?: string;

  @Property({ nullable: true })
  engine?: string;

  @Property({ default: false })
  isDefault: boolean = false;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();
}

