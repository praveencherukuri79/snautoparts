import { Entity, PrimaryKey, Property, Index, Enum, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

/**
 * Verification Token Type
 */
export enum VerificationType {
  EMAIL = 'EMAIL',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TWO_FACTOR = 'TWO_FACTOR',
}

/**
 * Verification Entity
 * 
 * Used by Better Auth to store email verification and password reset tokens.
 */
@Entity({ tableName: 'verifications' })
@Index({ properties: ['token'] })
@Index({ properties: ['identifier'] })
export class Verification {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  identifier!: string; // Usually email address

  @Property({ unique: true })
  token!: string;

  @Enum(() => VerificationType)
  type: VerificationType = VerificationType.EMAIL;

  @Property()
  expiresAt!: Date;

  @Property({ default: false })
  used: boolean = false;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}

