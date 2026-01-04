import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { MockDataService } from './mock-data.service';
import { environment } from '../../../environments/environment';
import {
  Product,
  Category,
  Brand,
  ProductFilters,
  PaginatedProducts,
} from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private api = inject(ApiService);
  private mockData = inject(MockDataService);

  getCategories(): Observable<Category[]> {
    if (environment.enableMockData) {
      return this.mockData.getCategories();
    }
    return this.api.get<Category[]>('/public/catalog/categories');
  }

  getCategoryBySlug(slug: string): Observable<Category> {
    if (environment.enableMockData) {
      return this.mockData.getCategoryBySlug(slug);
    }
    return this.api.get<Category>(`/public/catalog/categories/${slug}`);
  }

  getProducts(filters?: ProductFilters, page = 1, pageSize = 12): Observable<PaginatedProducts> {
    if (environment.enableMockData) {
      return this.mockData.getProducts(filters, page, pageSize);
    }
    const params: Record<string, string | number | boolean> = { page, limit: pageSize };
    if (filters) {
      if (filters.categoryId) params['categoryId'] = filters.categoryId;
      if (filters.brand) params['brandId'] = filters.brand;
      if (filters.minPrice) params['minPrice'] = filters.minPrice;
      if (filters.maxPrice) params['maxPrice'] = filters.maxPrice;
      if (filters.inStock !== undefined) params['inStock'] = filters.inStock;
      if (filters.search) params['search'] = filters.search;
      if (filters.sortBy) params['sortBy'] = filters.sortBy;
    }
    return this.api.getPaginated<Product, PaginatedProducts>('/public/catalog/products', 'products', params);
  }

  getProductBySlug(slug: string): Observable<Product> {
    if (environment.enableMockData) {
      return this.mockData.getProductBySlug(slug);
    }
    return this.api.get<Product>(`/public/catalog/products/${slug}`);
  }

  getFeaturedProducts(limit = 8): Observable<Product[]> {
    if (environment.enableMockData) {
      return this.mockData.getFeaturedProducts(limit);
    }
    return this.api.get<Product[]>('/public/catalog/products/featured', { limit });
  }

  getRelatedProducts(productId: string, limit = 4): Observable<Product[]> {
    if (environment.enableMockData) {
      return this.mockData.getRelatedProducts(productId, limit);
    }
    // Related products can be fetched by category - for now return empty or implement on backend
    return this.api.get<Product[]>('/public/catalog/products', { limit });
  }

  getBrands(): Observable<Brand[]> {
    if (environment.enableMockData) {
      return this.mockData.getBrands();
    }
    return this.api.get<Brand[]>('/public/catalog/brands');
  }
}

