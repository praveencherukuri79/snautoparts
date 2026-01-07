import { Entity, PrimaryKey, Property, ManyToOne, Unique, Index, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { User } from './User.js';

/**
 * Account Entity
 * 
 * Used by Better Auth to store OAuth provider accounts linked to users.
 * For email/password auth, this table may not be heavily used,
 * but is required for the complete Better Auth schema.
 */
@Entity({ tableName: 'accounts' })
@Index({ properties: ['user'] })
@Unique({ properties: ['provider', 'providerAccountId'] })
export class Account {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => User)
  user!: User;

  @Property()
  provider!: string; // e.g., 'credential', 'google', 'github'

  @Property()
  providerAccountId!: string;

  @Property({ nullable: true })
  accessToken?: string;

  @Property({ nullable: true })
  refreshToken?: string;

  @Property({ nullable: true })
  accessTokenExpiresAt?: Date;

  @Property({ nullable: true })
  refreshTokenExpiresAt?: Date;

  @Property({ nullable: true })
  scope?: string;

  @Property({ nullable: true })
  idToken?: string;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown>;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}

