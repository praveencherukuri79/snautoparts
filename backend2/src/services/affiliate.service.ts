import { EntityManager } from '@mikro-orm/core';
import { Affiliate, AffiliateProductMapping, Product } from '../entities/index.js';
import { NotFoundError, BadRequestError } from '../plugins/error-handler.js';

/**
 * Affiliate Service
 * 
 * Handles affiliate management for admin users.
 */
export class AffiliateService {
  constructor(private em: EntityManager) {}

  /**
   * Get all affiliates
   */
  async getAffiliates(options: {
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: Affiliate[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    const [affiliates, total] = await this.em.findAndCount(Affiliate, where, {
      orderBy: { name: 'ASC' },
      limit,
      offset,
    });

    return {
      data: affiliates,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get affiliate by ID
   */
  async getAffiliateById(id: string): Promise<Affiliate | null> {
    return this.em.findOne(Affiliate, { id });
  }

  /**
   * Create a new affiliate
   */
  async createAffiliate(input: {
    name: string;
    code: string;
    baseUrl: string;
    apiKey: string;
    apiSecret?: string;
    retryPolicy?: { maxRetries: number; backoffMs: number[] };
    mappingRules?: Record<string, unknown>;
  }): Promise<Affiliate> {
    // Check for duplicate code
    const existing = await this.em.findOne(Affiliate, { code: input.code });
    if (existing) {
      throw new BadRequestError('Affiliate code already exists');
    }

    const affiliate = this.em.create(Affiliate, {
      name: input.name,
      code: input.code.toUpperCase(),
      baseUrl: input.baseUrl,
      apiKey: input.apiKey,
      apiSecret: input.apiSecret,
      retryPolicy: input.retryPolicy ?? { maxRetries: 3, backoffMs: [1000, 5000, 15000] },
      mappingRules: input.mappingRules,
      timeoutMs: 8000,
      isActive: true,
    });

    await this.em.persistAndFlush(affiliate);
    return affiliate;
  }

  /**
   * Update an affiliate
   */
  async updateAffiliate(
    id: string,
    input: {
      name?: string;
      baseUrl?: string;
      apiKey?: string;
      apiSecret?: string;
      retryPolicy?: { maxRetries: number; backoffMs: number[] };
      mappingRules?: Record<string, unknown>;
      isActive?: boolean;
    },
  ): Promise<Affiliate> {
    const affiliate = await this.em.findOne(Affiliate, { id });
    if (!affiliate) {
      throw new NotFoundError('Affiliate not found');
    }

    if (input.name !== undefined) affiliate.name = input.name;
    if (input.baseUrl !== undefined) affiliate.baseUrl = input.baseUrl;
    if (input.apiKey !== undefined) affiliate.apiKey = input.apiKey;
    if (input.apiSecret !== undefined) affiliate.apiSecret = input.apiSecret;
    if (input.retryPolicy !== undefined) affiliate.retryPolicy = input.retryPolicy;
    if (input.mappingRules !== undefined) affiliate.mappingRules = input.mappingRules;
    if (input.isActive !== undefined) affiliate.isActive = input.isActive;

    await this.em.flush();
    return affiliate;
  }

  /**
   * Delete an affiliate (soft delete)
   */
  async deleteAffiliate(id: string): Promise<void> {
    const affiliate = await this.em.findOne(Affiliate, { id });
    if (!affiliate) {
      throw new NotFoundError('Affiliate not found');
    }

    affiliate.isActive = false;
    await this.em.flush();
  }

  /**
   * Get product mappings for an affiliate
   */
  async getProductMappings(
    affiliateId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: AffiliateProductMapping[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const offset = (page - 1) * limit;

    const [mappings, total] = await this.em.findAndCount(
      AffiliateProductMapping,
      { affiliate: affiliateId },
      {
        populate: ['product'],
        orderBy: { affiliateSku: 'ASC' },
        limit,
        offset,
      },
    );

    return {
      data: mappings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Add product mapping to affiliate
   */
  async addProductMapping(
    affiliateId: string,
    productId: string,
    mapping: {
      affiliateSku: string;
      affiliateProductId?: string;
      priceMultiplier?: number;
    },
  ): Promise<AffiliateProductMapping> {
    const affiliate = await this.em.findOne(Affiliate, { id: affiliateId });
    if (!affiliate) {
      throw new NotFoundError('Affiliate not found');
    }

    const product = await this.em.findOne(Product, { id: productId });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check for existing mapping
    const existing = await this.em.findOne(AffiliateProductMapping, {
      affiliate: affiliateId,
      product: productId,
    });

    if (existing) {
      throw new BadRequestError('Product mapping already exists');
    }

    const productMapping = this.em.create(AffiliateProductMapping, {
      affiliate,
      product,
      affiliateSku: mapping.affiliateSku,
      affiliateProductId: mapping.affiliateProductId,
      priceMultiplier: mapping.priceMultiplier?.toFixed(4),
      isActive: true,
    });

    await this.em.persistAndFlush(productMapping);
    return productMapping;
  }

  /**
   * Remove product mapping
   */
  async removeProductMapping(affiliateId: string, mappingId: string): Promise<void> {
    const mapping = await this.em.findOne(AffiliateProductMapping, {
      id: mappingId,
      affiliate: affiliateId,
    });

    if (!mapping) {
      throw new NotFoundError('Product mapping not found');
    }

    await this.em.removeAndFlush(mapping);
  }
}

export function createAffiliateService(em: EntityManager): AffiliateService {
  return new AffiliateService(em);
}

