import { Entity, PrimaryKey, Property, OneToOne, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { Role } from './Role.js';

@Entity({ tableName: 'role_feature_configs' })
export class RoleFeatureConfig {
  @PrimaryKey()
  id: string = uuid();

  @OneToOne('Role', { owner: true })
  role!: Role;

  @Property({ type: 'json' })
  config!: Record<string, unknown>; // Full feature configuration

  @Property({ default: 1 })
  version: number = 1;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}

