import { EntityManager } from '@mikro-orm/core';
import { Product, Category, Brand, ProductFitment, FulfillmentType } from '../entities/index.js';
import { NotFoundError, BadRequestError } from '../plugins/error-handler.js';
import { slugify, generateUniqueSlug } from '../utils/slug.js';

/**
 * Product creation input
 */
export interface CreateProductInput {
  sku: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price: string;
  compareAtPrice?: string;
  costPrice?: string;
  categoryId: string;
  brandId?: string;
  imageUrl?: string;
  images?: string[];
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  upc?: string;
  fulfillmentType?: FulfillmentType;
  isActive?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * Product update input
 */
export interface UpdateProductInput extends Partial<Omit<CreateProductInput, 'sku'>> {
  sku?: string;
}

/**
 * Product Service
 * 
 * Handles product CRUD operations for managers/admins.
 */
export class ProductService {
  constructor(private em: EntityManager) {}

  /**
   * Get all products (including inactive for management)
   */
  async getProducts(options: {
    search?: string;
    categoryId?: string;
    brandId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: Product[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (options.search) {
      where.$or = [
        { name: { $like: `%${options.search}%` } },
        { sku: { $like: `%${options.search}%` } },
      ];
    }

    if (options.categoryId) {
      where.category = options.categoryId;
    }

    if (options.brandId) {
      where.brand = options.brandId;
    }

    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    const [products, total] = await this.em.findAndCount(Product, where, {
      populate: ['category', 'brand'],
      orderBy: { updatedAt: 'DESC' },
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

  /**
   * Get product by ID (with all details)
   */
  async getProductById(id: string): Promise<Product | null> {
    return this.em.findOne(Product, { id }, {
      populate: ['category', 'brand', 'fitments', 'affiliateMappings'],
    });
  }

  /**
   * Create a new product
   */
  async createProduct(input: CreateProductInput): Promise<Product> {
    // Check for duplicate SKU
    const existing = await this.em.findOne(Product, { sku: input.sku });
    if (existing) {
      throw new BadRequestError('SKU already exists');
    }

    // Get category
    const category = await this.em.findOne(Category, { id: input.categoryId });
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Get brand if provided
    let brand: Brand | undefined;
    if (input.brandId) {
      brand = await this.em.findOne(Brand, { id: input.brandId }) ?? undefined;
    }

    // Generate slug
    const slug = await this.generateUniqueSlug(input.name);

    const product = new Product();
    product.sku = input.sku;
    product.name = input.name;
    product.slug = slug;
    product.description = input.description;
    product.shortDescription = input.shortDescription;
    product.price = input.price;
    product.compareAtPrice = input.compareAtPrice;
    product.costPrice = input.costPrice;
    product.category = category;
    product.brand = brand;
    product.imageUrl = input.imageUrl;
    product.images = input.images ?? [];
    if (input.weight !== undefined) product.weight = String(input.weight);
    if (input.length !== undefined) product.length = String(input.length);
    if (input.width !== undefined) product.width = String(input.width);
    if (input.height !== undefined) product.height = String(input.height);
    product.stockQuantity = input.stockQuantity ?? 0;
    product.lowStockThreshold = input.lowStockThreshold ?? 10;
    product.upc = input.upc;
    product.fulfillmentType = input.fulfillmentType ?? FulfillmentType.INVENTORY;
    product.isActive = input.isActive ?? true;
    product.isFeatured = input.isFeatured ?? false;
    product.metaTitle = input.metaTitle;
    product.metaDescription = input.metaDescription;

    await this.em.persistAndFlush(product);
    return product;
  }

  /**
   * Update a product
   */
  async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    const product = await this.em.findOne(Product, { id });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check for duplicate SKU if changing
    if (input.sku && input.sku !== product.sku) {
      const existing = await this.em.findOne(Product, { sku: input.sku });
      if (existing) {
        throw new BadRequestError('SKU already exists');
      }
      product.sku = input.sku;
    }

    // Update category if provided
    if (input.categoryId) {
      const category = await this.em.findOne(Category, { id: input.categoryId });
      if (!category) {
        throw new NotFoundError('Category not found');
      }
      product.category = category;
    }

    // Update brand if provided
    if (input.brandId !== undefined) {
      if (input.brandId) {
        const brand = await this.em.findOne(Brand, { id: input.brandId });
        product.brand = brand ?? undefined;
      } else {
        product.brand = undefined;
      }
    }

    // Update name and regenerate slug if needed
    if (input.name && input.name !== product.name) {
      product.name = input.name;
      product.slug = await this.generateUniqueSlug(input.name, product.id);
    }

    // Update other fields
    if (input.description !== undefined) product.description = input.description;
    if (input.shortDescription !== undefined) product.shortDescription = input.shortDescription;
    if (input.price !== undefined) product.price = input.price;
    if (input.compareAtPrice !== undefined) product.compareAtPrice = input.compareAtPrice;
    if (input.costPrice !== undefined) product.costPrice = input.costPrice;
    if (input.imageUrl !== undefined) product.imageUrl = input.imageUrl;
    if (input.images !== undefined) product.images = input.images;
    if (input.weight !== undefined) product.weight = String(input.weight);
    if (input.length !== undefined) product.length = String(input.length);
    if (input.width !== undefined) product.width = String(input.width);
    if (input.height !== undefined) product.height = String(input.height);
    if (input.stockQuantity !== undefined) product.stockQuantity = input.stockQuantity;
    if (input.lowStockThreshold !== undefined) product.lowStockThreshold = input.lowStockThreshold;
    if (input.upc !== undefined) product.upc = input.upc;
    if (input.fulfillmentType !== undefined) product.fulfillmentType = input.fulfillmentType;
    if (input.isActive !== undefined) product.isActive = input.isActive;
    if (input.isFeatured !== undefined) product.isFeatured = input.isFeatured;
    if (input.metaTitle !== undefined) product.metaTitle = input.metaTitle;
    if (input.metaDescription !== undefined) product.metaDescription = input.metaDescription;

    await this.em.flush();
    return product;
  }

  /**
   * Delete a product (soft delete by setting isActive = false)
   */
  async deleteProduct(id: string): Promise<void> {
    const product = await this.em.findOne(Product, { id });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    product.isActive = false;
    await this.em.flush();
  }

  /**
   * Add fitment to product
   */
  async addFitment(
    productId: string,
    fitment: { make: string; model: string; yearStart: number; yearEnd: number; submodel?: string; engine?: string; notes?: string },
  ): Promise<ProductFitment> {
    const product = await this.em.findOne(Product, { id: productId });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const productFitment = this.em.create(ProductFitment, {
      product,
      ...fitment,
    });

    await this.em.persistAndFlush(productFitment);
    return productFitment;
  }

  /**
   * Remove fitment from product
   */
  async removeFitment(productId: string, fitmentId: string): Promise<void> {
    const fitment = await this.em.findOne(ProductFitment, { id: fitmentId, product: productId });
    if (!fitment) {
      throw new NotFoundError('Fitment not found');
    }

    await this.em.removeAndFlush(fitment);
  }

  /**
   * Get fitments for a product
   */
  async getProductFitments(productId: string): Promise<ProductFitment[]> {
    return this.em.find(ProductFitment, { product: productId }, {
      orderBy: { make: 'ASC', model: 'ASC', yearStart: 'ASC' },
    });
  }

  /**
   * Generate unique slug for a product
   */
  private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    let slug = slugify(name);
    let counter = 0;

    while (true) {
      const testSlug = counter === 0 ? slug : `${slug}-${counter}`;
      const where: Record<string, unknown> = { slug: testSlug };
      if (excludeId) {
        where.id = { $ne: excludeId };
      }

      const existing = await this.em.findOne(Product, where);
      if (!existing) {
        return testSlug;
      }
      counter++;
    }
  }
}

export function createProductService(em: EntityManager): ProductService {
  return new ProductService(em);
}

