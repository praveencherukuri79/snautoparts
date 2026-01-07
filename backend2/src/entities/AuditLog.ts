import { Entity, PrimaryKey, Property, ManyToOne, Index, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { User } from './User.js';

@Entity({ tableName: 'audit_logs' })
@Index({ properties: ['createdAt'] })
@Index({ properties: ['entityType', 'entityId'] })
@Index({ properties: ['user'] })
export class AuditLog {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne('User', { nullable: true })
  user?: User;

  @Property()
  action!: string; // CREATE, UPDATE, DELETE, etc.

  @Property()
  entityType!: string; // Product, Order, User, etc.

  @Property()
  entityId!: string;

  @Property({ type: 'json', nullable: true })
  previousValue?: Record<string, unknown>;

  @Property({ type: 'json', nullable: true })
  newValue?: Record<string, unknown>;

  @Property({ type: 'json', nullable: true })
  details?: Record<string, unknown>; // Additional context for the audit action

  @Property({ nullable: true })
  ipAddress?: string;

  @Property({ nullable: true })
  userAgent?: string;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();
}

