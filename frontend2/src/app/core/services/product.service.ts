import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import {
  Product,
  ProductFormData,
  ProductFitment,
  FitmentFormData,
  ProductFilters,
  PaginatedResponse,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = inject(ApiService);

  // State for current product (detail/edit view)
  private currentProduct = signal<Product | null>(null);
  private isLoading = signal(false);

  readonly product = computed(() => this.currentProduct());
  readonly loading = computed(() => this.isLoading());

  // ============================================
  // Product CRUD (Manager/Admin)
  // ============================================

  // Get paginated products (manager view with inactive)
  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const params = this.buildQueryParams(filters);
    return this.api.get<PaginatedResponse<Product>>(`/products?${params}`);
  }

  // Get single product by ID
  async getProduct(productId: string): Promise<Product> {
    this.isLoading.set(true);
    try {
      const product = await this.api.get<Product>(`/products/${productId}`);
      this.currentProduct.set(product);
      return product;
    } finally {
      this.isLoading.set(false);
    }
  }

  // Create new product
  async createProduct(data: ProductFormData): Promise<Product> {
    return this.api.post<Product>('/products', data);
  }

  // Update product
  async updateProduct(productId: string, data: Partial<ProductFormData>): Promise<Product> {
    const product = await this.api.patch<Product>(`/products/${productId}`, data);
    this.currentProduct.set(product);
    return product;
  }

  // Delete product
  async deleteProduct(productId: string): Promise<void> {
    await this.api.delete(`/products/${productId}`);
    this.currentProduct.set(null);
  }

  // ============================================
  // Fitment Management
  // ============================================

  // Add fitment to product
  async addFitment(productId: string, data: FitmentFormData): Promise<ProductFitment> {
    const fitment = await this.api.post<ProductFitment>(`/products/${productId}/fitments`, data);
    
    // Update current product fitments
    const product = this.currentProduct();
    if (product && product.id === productId) {
      this.currentProduct.set({
        ...product,
        fitments: [...(product.fitments || []), fitment],
      });
    }
    
    return fitment;
  }

  // Remove fitment from product
  async removeFitment(productId: string, fitmentId: string): Promise<void> {
    await this.api.delete(`/products/${productId}/fitments/${fitmentId}`);
    
    // Update current product fitments
    const product = this.currentProduct();
    if (product && product.id === productId) {
      this.currentProduct.set({
        ...product,
        fitments: (product.fitments || []).filter(f => f.id !== fitmentId),
      });
    }
  }

  // ============================================
  // Image Management
  // ============================================

  // Upload product images
  async uploadImages(productId: string, files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const response = await this.api.upload<{ urls: string[] }>(`/products/${productId}/images`, formData);
    
    // Update current product images
    const product = this.currentProduct();
    if (product && product.id === productId) {
      this.currentProduct.set({
        ...product,
        images: [...product.images, ...response.urls],
      });
    }
    
    return response.urls;
  }

  // Delete product image
  async deleteImage(productId: string, imageUrl: string): Promise<void> {
    const encodedUrl = encodeURIComponent(imageUrl);
    await this.api.delete(`/products/${productId}/images?url=${encodedUrl}`);
    
    // Update current product images
    const product = this.currentProduct();
    if (product && product.id === productId) {
      this.currentProduct.set({
        ...product,
        images: product.images.filter(img => img !== imageUrl),
      });
    }
  }

  // Reorder product images
  async reorderImages(productId: string, imageUrls: string[]): Promise<void> {
    await this.api.patch(`/products/${productId}/images/order`, { imageUrls });
    
    // Update current product images
    const product = this.currentProduct();
    if (product && product.id === productId) {
      this.currentProduct.set({
        ...product,
        images: imageUrls,
      });
    }
  }

  // Clear current product
  clearProduct(): void {
    this.currentProduct.set(null);
  }

  // Build query params
  private buildQueryParams<T extends object>(params?: T): string {
    if (!params) return '';

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  }
}

