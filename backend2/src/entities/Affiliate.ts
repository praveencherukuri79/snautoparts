import { Entity, PrimaryKey, Property, OneToMany, Collection, Opt } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import type { AffiliateProductMapping } from './AffiliateProductMapping.js';
import type { AffiliateOrder } from './AffiliateOrder.js';

@Entity({ tableName: 'affiliates' })
export class Affiliate {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  name!: string;

  @Property({ unique: true })
  code!: string; // e.g., "APREMIUM", "BUYAUTOPARTS", "TRQ"

  @Property()
  baseUrl!: string;

  @Property()
  apiKey!: string; // encrypted

  @Property({ nullable: true })
  apiSecret?: string; // encrypted

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ type: 'json' })
  retryPolicy!: { maxRetries: number; backoffMs: number[] };

  @Property({ type: 'json', nullable: true })
  mappingRules?: Record<string, unknown>;

  @Property({ type: 'json', nullable: true })
  headers?: Record<string, string>; // Custom headers for API calls

  @Property({ default: 8000 })
  timeoutMs: number = 8000;

  @Property({ type: 'date', defaultRaw: 'now()' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'date', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();

  // Relations
  @OneToMany('AffiliateProductMapping', 'affiliate')
  productMappings = new Collection<AffiliateProductMapping>(this);

  @OneToMany('AffiliateOrder', 'affiliate')
  orders = new Collection<AffiliateOrder>(this);
}

