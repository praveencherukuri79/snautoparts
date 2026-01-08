import { apiGet, apiPost, PaginatedResponse } from './api';
import { API_ENDPOINTS } from '@/utils/constants';
import {
  Product,
  ProductFilters,
  Category,
  FitmentSearchParams,
  VehicleInfo,
} from '@/types';

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  vehicleId?: string;
  make?: string;
  model?: string;
  year?: number;
  engine?: string;
}

export interface CategoryListParams {
  parentId?: string;
  includeProducts?: boolean;
  depth?: number;
}

/**
 * Catalog Service
 * 
 * Handles product catalog, categories, and search API calls.
 */
export const catalogService = {
  // Products
  /**
   * Get paginated list of products with filters
   */
  getProducts: async (params?: ProductListParams): Promise<PaginatedResponse<Product>> => {
    return apiGet<PaginatedResponse<Product>>(API_ENDPOINTS.PRODUCTS.LIST, { params });
  },

  /**
   * Get single product by ID
   */
  getProduct: async (id: string): Promise<Product> => {
    return apiGet<Product>(API_ENDPOINTS.PRODUCTS.DETAIL(id));
  },

  /**
   * Get product by SKU
   */
  getProductBySku: async (sku: string): Promise<Product> => {
    return apiGet<Product>(`${API_ENDPOINTS.PRODUCTS.LIST}/sku/${sku}`);
  },

  /**
   * Get related products
   */
  getRelatedProducts: async (productId: string, limit?: number): Promise<Product[]> => {
    return apiGet<Product[]>(`${API_ENDPOINTS.PRODUCTS.DETAIL(productId)}/related`, {
      params: { limit },
    });
  },

  /**
   * Get products by category
   */
  getProductsByCategory: async (
    categoryId: string,
    params?: ProductListParams
  ): Promise<PaginatedResponse<Product>> => {
    return apiGet<PaginatedResponse<Product>>(API_ENDPOINTS.PRODUCTS.BY_CATEGORY(categoryId), {
      params,
    });
  },

  // Categories
  /**
   * Get all categories (tree structure)
   */
  getCategories: async (params?: CategoryListParams): Promise<Category[]> => {
    return apiGet<Category[]>(API_ENDPOINTS.CATEGORIES.LIST, { params });
  },

  /**
   * Get single category by ID
   */
  getCategory: async (id: string): Promise<Category> => {
    return apiGet<Category>(API_ENDPOINTS.CATEGORIES.DETAIL(id));
  },

  /**
   * Get category by slug
   */
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    return apiGet<Category>(`${API_ENDPOINTS.CATEGORIES.LIST}/slug/${slug}`);
  },

  /**
   * Get category tree (hierarchical)
   */
  getCategoryTree: async (): Promise<Category[]> => {
    return apiGet<Category[]>(API_ENDPOINTS.CATEGORIES.TREE);
  },

  // Search
  /**
   * Search products with filters
   */
  searchProducts: async (
    query: string,
    filters?: ProductFilters
  ): Promise<PaginatedResponse<Product>> => {
    return apiGet<PaginatedResponse<Product>>(API_ENDPOINTS.SEARCH.PRODUCTS, {
      params: { q: query, ...filters },
    });
  },

  /**
   * Get search suggestions/autocomplete
   */
  getSearchSuggestions: async (query: string): Promise<string[]> => {
    return apiGet<string[]>(API_ENDPOINTS.SEARCH.SUGGESTIONS, {
      params: { q: query },
    });
  },

  // Fitment
  /**
   * Search products by vehicle fitment
   */
  searchByFitment: async (params: FitmentSearchParams): Promise<PaginatedResponse<Product>> => {
    return apiGet<PaginatedResponse<Product>>(API_ENDPOINTS.FITMENT.SEARCH, { params });
  },

  /**
   * Get available makes
   */
  getMakes: async (): Promise<string[]> => {
    return apiGet<string[]>(API_ENDPOINTS.FITMENT.MAKES);
  },

  /**
   * Get models for a make
   */
  getModels: async (make: string): Promise<string[]> => {
    return apiGet<string[]>(API_ENDPOINTS.FITMENT.MODELS, { params: { make } });
  },

  /**
   * Get years for a make/model
   */
  getYears: async (make: string, model: string): Promise<number[]> => {
    return apiGet<number[]>(API_ENDPOINTS.FITMENT.YEARS, { params: { make, model } });
  },

  /**
   * Get engines for a make/model/year
   */
  getEngines: async (make: string, model: string, year: number): Promise<string[]> => {
    return apiGet<string[]>(API_ENDPOINTS.FITMENT.ENGINES, {
      params: { make, model, year },
    });
  },

  /**
   * Verify if product fits vehicle
   */
  verifyFitment: async (productId: string, vehicleInfo: VehicleInfo): Promise<boolean> => {
    return apiPost<boolean>(`${API_ENDPOINTS.PRODUCTS.DETAIL(productId)}/verify-fitment`, vehicleInfo);
  },
};

export default catalogService;
