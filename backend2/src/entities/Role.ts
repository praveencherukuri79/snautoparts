import { Entity, PrimaryKey, Property, OneToMany, OneToOne, Collection, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { User } from './User.js';
import type { RoleFeatureConfig } from './RoleFeatureConfig.js';

@Entity({ tableName: 'roles' })
export class Role {
  @PrimaryKey()
  id: string = uuid();

  @Property({ unique: true })
  name!: string; // CUSTOMER, MANAGER, ADMIN

  @Property()
  displayName!: string;

  @Property({ nullable: true, type: 'text' })
  description?: string;

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();

  // Relations
  @OneToMany('User', 'role')
  users = new Collection<User>(this);

  @OneToOne('RoleFeatureConfig', 'role', { nullable: true })
  featureConfig?: RoleFeatureConfig;
}

