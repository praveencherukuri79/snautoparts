import { EntityManager } from '@mikro-orm/core';
import { Category, Brand, Product, ProductFitment } from '../entities/index.js';
import { cacheService } from './cache.service.js';

const CACHE_TTL = 600; // 10 minutes

/**
 * Catalog Service
 * 
 * Handles public catalog queries (categories, brands, products, search, fitment).
 */
export class CatalogService {
  constructor(private em: EntityManager) {}

  // ============ CATEGORIES ============

  async getAllCategories(): Promise<Category[]> {
    const cached = cacheService.get<Category[]>('catalog:categories');
    if (cached) return cached;

    const categories = await this.em.find(Category, { isActive: true }, {
      orderBy: { sortOrder: 'ASC', name: 'ASC' },
    });

    cacheService.set('catalog:categories', categories, CACHE_TTL);
    return categories;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return this.em.findOne(Category, { slug, isActive: true });
  }

  async getCategoryTree(): Promise<Category[]> {
    const categories = await this.em.find(Category, { isActive: true, parent: null }, {
      populate: ['children'],
      orderBy: { sortOrder: 'ASC', name: 'ASC' },
    });
    return categories;
  }

  // ============ BRANDS ============

  async getAllBrands(): Promise<Brand[]> {
    const cached = cacheService.get<Brand[]>('catalog:brands');
    if (cached) return cached;

    const brands = await this.em.find(Brand, { isActive: true }, {
      orderBy: { name: 'ASC' },
    });

    cacheService.set('catalog:brands', brands, CACHE_TTL);
    return brands;
  }

  async getBrandBySlug(slug: string): Promise<Brand | null> {
    return this.em.findOne(Brand, { slug, isActive: true });
  }

  // ============ PRODUCTS ============

  async getProducts(options: {
    categorySlug?: string;
    brandSlug?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    featured?: boolean;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'price' | 'createdAt';
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ data: Product[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const { page = 1, limit = 20, sortBy = 'name', sortOrder = 'ASC' } = options;
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = { isActive: true };

    if (options.categorySlug) {
      const category = await this.getCategoryBySlug(options.categorySlug);
      if (category) {
        where.category = category.id;
      }
    }

    if (options.brandSlug) {
      const brand = await this.getBrandBySlug(options.brandSlug);
      if (brand) {
        where.brand = brand.id;
      }
    }

    if (options.search) {
      where.$or = [
        { name: { $like: `%${options.search}%` } },
        { sku: { $like: `%${options.search}%` } },
        { description: { $like: `%${options.search}%` } },
      ];
    }

    if (options.minPrice !== undefined) {
      where.price = { ...((where.price as object) || {}), $gte: options.minPrice };
    }

    if (options.maxPrice !== undefined) {
      where.price = { ...((where.price as object) || {}), $lte: options.maxPrice };
    }

    if (options.inStock) {
      where.stockQuantity = { $gt: 0 };
    }

    if (options.featured) {
      where.isFeatured = true;
    }

    const [products, total] = await this.em.findAndCount(Product, where, {
      populate: ['category', 'brand'],
      orderBy: { [sortBy]: sortOrder },
      limit,
      offset,
    });

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return this.em.findOne(Product, { slug, isActive: true }, {
      populate: ['category', 'brand', 'fitments'],
    });
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.em.findOne(Product, { id }, {
      populate: ['category', 'brand', 'fitments'],
    });
  }

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    return this.em.find(Product, { isActive: true, isFeatured: true }, {
      populate: ['category', 'brand'],
      limit,
      orderBy: { createdAt: 'DESC' },
    });
  }

  // ============ SEARCH ============

  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    return this.em.find(Product, {
      isActive: true,
      $or: [
        { name: { $like: `%${query}%` } },
        { sku: { $like: `%${query}%` } },
        { description: { $like: `%${query}%` } },
      ],
    }, {
      populate: ['category', 'brand'],
      limit,
    });
  }

  // ============ FITMENT ============

  async getFitmentMakes(): Promise<string[]> {
    const cached = cacheService.get<string[]>('catalog:fitment:makes');
    if (cached) return cached;

    const fitments = await this.em.find(ProductFitment, {}, {
      fields: ['make'],
    });

    const makes = [...new Set(fitments.map(f => f.make))].sort();
    cacheService.set('catalog:fitment:makes', makes, 3600); // 1 hour
    return makes;
  }

  async getFitmentModels(make: string): Promise<string[]> {
    const cacheKey = `catalog:fitment:models:${make}`;
    const cached = cacheService.get<string[]>(cacheKey);
    if (cached) return cached;

    const fitments = await this.em.find(ProductFitment, { make }, {
      fields: ['model'],
    });

    const models = [...new Set(fitments.map(f => f.model))].sort();
    cacheService.set(cacheKey, models, 3600);
    return models;
  }

  async getFitmentYears(make: string, model: string): Promise<number[]> {
    const fitments = await this.em.find(ProductFitment, { make, model }, {
      fields: ['yearStart', 'yearEnd'],
    });

    const years = new Set<number>();
    for (const f of fitments) {
      for (let y = f.yearStart; y <= f.yearEnd; y++) {
        years.add(y);
      }
    }

    return [...years].sort((a, b) => b - a); // Descending
  }

  async searchByFitment(year: number, make: string, model: string): Promise<Product[]> {
    const fitments = await this.em.find(ProductFitment, {
      make,
      model,
      yearStart: { $lte: year },
      yearEnd: { $gte: year },
    }, {
      populate: ['product', 'product.category', 'product.brand'],
    });

    return fitments
      .map(f => f.product)
      .filter((p): p is Product => p !== undefined && p.isActive);
  }

  // ============ CACHE INVALIDATION ============

  invalidateCategoriesCache(): void {
    cacheService.delete('catalog:categories');
  }

  invalidateBrandsCache(): void {
    cacheService.delete('catalog:brands');
  }

  invalidateFitmentCache(): void {
    cacheService.invalidate('catalog:fitment:');
  }
}

export function createCatalogService(em: EntityManager): CatalogService {
  return new CatalogService(em);
}

