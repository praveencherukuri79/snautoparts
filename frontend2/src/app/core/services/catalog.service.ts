import { Injectable, inject, signal } from '@angular/core';
import { ApiService, PaginatedResponse } from './api.service';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  parentId?: string;
  children?: Category[];
  isActive?: boolean;
  sortOrder?: number;
  productCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  isActive?: boolean;
}

export interface ProductFitment {
  id: string;
  productId: string;
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  submodel?: string;
  engine?: string;
  notes?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  category: Category;
  brand?: Brand;
  imageUrl?: string;
  images: string[];
  stockQuantity: number;
  lowStockThreshold: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  isFeatured: boolean;
  weightUnit?: string;
  dimensionUnit?: string;
  fulfillmentType?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilter {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  search?: string;
  featured?: boolean;
  year?: number;
  make?: string;
  model?: string;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private api = inject(ApiService);

  // Cache
  private categoriesCache = signal<Category[] | null>(null);
  private brandsCache = signal<Brand[] | null>(null);
  private cacheTime = 0;
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  async getCategories(): Promise<Category[]> {
    if (this.categoriesCache() && Date.now() - this.cacheTime < this.CACHE_TTL) {
      return this.categoriesCache()!;
    }

    const categories = await this.api.get<Category[]>('/catalog/categories');
    this.categoriesCache.set(categories);
    this.cacheTime = Date.now();
    return categories;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return this.api.get<Category>(`/catalog/categories/${slug}`);
  }

  async getBrands(): Promise<Brand[]> {
    if (this.brandsCache() && Date.now() - this.cacheTime < this.CACHE_TTL) {
      return this.brandsCache()!;
    }

    const brands = await this.api.get<Brand[]>('/catalog/brands');
    this.brandsCache.set(brands);
    return brands;
  }

  async getProducts(filter: ProductFilter = {}): Promise<PaginatedResponse<Product>> {
    return this.api.getPaginated<Product>('/catalog/products', filter as Record<string, string | number | boolean>);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return this.api.get<Product[]>('/catalog/products/featured');
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return this.api.get<Product>(`/catalog/products/${slug}`);
  }

  async search(query: string): Promise<Product[]> {
    if (query.length < 2) return [];
    return this.api.get<Product[]>('/catalog/search', { q: query });
  }

  // Fitment
  async getFitmentYears(): Promise<number[]> {
    return this.api.get<number[]>('/catalog/fitment/years');
  }

  async getFitmentMakes(year?: number): Promise<string[]> {
    return this.api.get<string[]>('/catalog/fitment/makes', year ? { year } : undefined);
  }

  async getFitmentModels(year: number, make: string): Promise<string[]> {
    return this.api.get<string[]>('/catalog/fitment/models', { year, make });
  }

  async searchByFitment(year: number, make: string, model: string): Promise<PaginatedResponse<Product>> {
    return this.api.getPaginated<Product>('/catalog/fitment/search', { year, make, model });
  }

  async getProductFitments(productId: string): Promise<ProductFitment[]> {
    try {
      const response = await this.api.get<{ data: ProductFitment[] }>(`/catalog/products/${productId}/fitments`);
      return response.data;
    } catch {
      return [];
    }
  }

  async getRelatedProducts(productId: string): Promise<Product[]> {
    try {
      return await this.api.get<Product[]>(`/catalog/products/${productId}/related`);
    } catch {
      return [];
    }
  }

  invalidateCache(): void {
    this.categoriesCache.set(null);
    this.brandsCache.set(null);
  }
}

