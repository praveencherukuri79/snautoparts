/**
 * Catalog Models
 * Generated from swagger.json - /catalog/* endpoints
 */

import type { PaginationMeta } from './api.model';

/**
 * Category object
 * Used by: /catalog/categories, /catalog/products/{slug}
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

/**
 * GET /catalog/categories - Response (200)
 */
export interface GetCategoriesResponse {
  data: Category[];
}

/**
 * GET /catalog/categories/{slug} - Response (200)
 */
export interface GetCategoryResponse {
  data: Category;
}

/**
 * Brand object
 * Used by: /catalog/brands, /catalog/products/{slug}
 */
export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
}

/**
 * GET /catalog/brands - Response (200)
 */
export interface GetBrandsResponse {
  data: Brand[];
}

/**
 * Product summary (list view)
 * Used by: /catalog/products, /catalog/products/featured, /catalog/search, /catalog/fitment/search
 */
export interface ProductSummary {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: string;
  compareAtPrice: string | null;
  imageUrl: string | null;
  stockQuantity: number;
  isFeatured: boolean;
}

/**
 * Product fitment info
 * Used in product detail
 */
export interface ProductFitment {
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
}

/**
 * Product detail (single product view)
 * GET /catalog/products/{slug} - Response
 */
export interface ProductDetail extends ProductSummary {
  description: string | null;
  shortDescription: string | null;
  images: string[];
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  upc: string | null;
  category?: Category;
  brand: Brand | null;
  fitments?: ProductFitment[];
}

/**
 * GET /catalog/products - Query params
 */
export interface GetProductsParams {
  page?: string;
  limit?: string;
  category?: string;
  brand?: string;
  search?: string;
  featured?: 'true' | 'false';
  minPrice?: string;
  maxPrice?: string;
  inStock?: 'true' | 'false';
}

/**
 * GET /catalog/products - Response (200)
 */
export interface GetProductsResponse {
  data: ProductSummary[];
  meta: PaginationMeta;
}

/**
 * GET /catalog/products/featured - Response (200)
 */
export interface GetFeaturedProductsResponse {
  data: ProductSummary[];
}

/**
 * GET /catalog/products/{slug} - Response (200)
 */
export interface GetProductDetailResponse {
  data: ProductDetail;
}

/**
 * GET /catalog/search - Query params
 */
export interface SearchProductsParams {
  q: string;
  limit?: string;
}

/**
 * GET /catalog/search - Response (200)
 */
export interface SearchProductsResponse {
  data: ProductSummary[];
}

/**
 * GET /catalog/fitment/makes - Response (200)
 */
export interface GetFitmentMakesResponse {
  data: string[];
}

/**
 * GET /catalog/fitment/models - Query params
 */
export interface GetFitmentModelsParams {
  make: string;
}

/**
 * GET /catalog/fitment/models - Response (200)
 */
export interface GetFitmentModelsResponse {
  data: string[];
}

/**
 * GET /catalog/fitment/years - Query params
 */
export interface GetFitmentYearsParams {
  make?: string;
  model?: string;
}

/**
 * GET /catalog/fitment/years - Response (200)
 */
export interface GetFitmentYearsResponse {
  data: number[];
}

/**
 * GET /catalog/fitment/search - Query params
 */
export interface FitmentSearchParams {
  year: string;
  make: string;
  model: string;
  page?: string;
  limit?: string;
}

/**
 * GET /catalog/fitment/search - Response (200)
 */
export interface FitmentSearchResponse {
  data: ProductSummary[];
  meta: PaginationMeta;
}
