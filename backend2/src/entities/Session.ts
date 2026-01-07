import { Entity, PrimaryKey, Property, ManyToOne, Index, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { User } from './User.js';

@Entity({ tableName: 'sessions' })
@Index({ properties: ['token'] })
@Index({ properties: ['expiresAt'] })
export class Session {
  @PrimaryKey()
  id: string = uuid();

  @Property({ unique: true })
  token!: string;

  @ManyToOne('User')
  user!: User;

  @Property({ nullable: true })
  userAgent?: string;

  @Property({ nullable: true })
  ipAddress?: string;

  @Property()
  expiresAt!: Date;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();
}

