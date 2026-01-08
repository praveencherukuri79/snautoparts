import { apiGet } from './api';
import type {
  GetCategoriesResponse,
  GetCategoryResponse,
  GetBrandsResponse,
  GetProductsResponse,
  GetFeaturedProductsResponse,
  GetProductDetailResponse,
  SearchProductsResponse,
  GetFitmentMakesResponse,
  GetFitmentModelsResponse,
  GetFitmentYearsResponse,
  FitmentSearchResponse,
  GetProductsParams,
  GetFitmentModelsParams,
  GetFitmentYearsParams,
  FitmentSearchParams,
  SearchProductsParams,
  ProductSummary,
  ProductDetail,
  Category,
  Brand,
} from '@/models';

// API Endpoints matching swagger paths
const CATALOG_ENDPOINTS = {
  CATEGORIES: '/catalog/categories',
  CATEGORY_BY_SLUG: (slug: string) => `/catalog/categories/${slug}`,
  BRANDS: '/catalog/brands',
  PRODUCTS: '/catalog/products',
  PRODUCTS_FEATURED: '/catalog/products/featured',
  PRODUCT_BY_SLUG: (slug: string) => `/catalog/products/${slug}`,
  SEARCH: '/catalog/search',
  FITMENT_MAKES: '/catalog/fitment/makes',
  FITMENT_MODELS: '/catalog/fitment/models',
  FITMENT_YEARS: '/catalog/fitment/years',
  FITMENT_SEARCH: '/catalog/fitment/search',
};

/**
 * Catalog Service
 * 
 * Handles product catalog, categories, brands, and fitment API calls.
 * Types match swagger.json exactly.
 */
export const catalogService = {
  // Categories
  /**
   * GET /catalog/categories
   * Returns all active product categories
   */
  getCategories: async (): Promise<Category[]> => {
    const response = await apiGet<GetCategoriesResponse>(CATALOG_ENDPOINTS.CATEGORIES);
    return response.data;
  },

  /**
   * GET /catalog/categories/{slug}
   * Returns a single category by its URL slug
   */
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await apiGet<GetCategoryResponse>(CATALOG_ENDPOINTS.CATEGORY_BY_SLUG(slug));
    return response.data;
  },

  // Brands
  /**
   * GET /catalog/brands
   * Returns all active product brands
   */
  getBrands: async (): Promise<Brand[]> => {
    const response = await apiGet<GetBrandsResponse>(CATALOG_ENDPOINTS.BRANDS);
    return response.data;
  },

  // Products
  /**
   * GET /catalog/products
   * Returns paginated list of products with optional filters
   */
  getProducts: async (params?: GetProductsParams): Promise<GetProductsResponse> => {
    return apiGet<GetProductsResponse>(CATALOG_ENDPOINTS.PRODUCTS, { params });
  },

  /**
   * GET /catalog/products/featured
   * Returns a list of featured products for homepage display
   */
  getFeaturedProducts: async (): Promise<ProductSummary[]> => {
    const response = await apiGet<GetFeaturedProductsResponse>(CATALOG_ENDPOINTS.PRODUCTS_FEATURED);
    return response.data;
  },

  /**
   * GET /catalog/products/{slug}
   * Returns detailed product information including fitment data
   */
  getProductBySlug: async (slug: string): Promise<ProductDetail> => {
    const response = await apiGet<GetProductDetailResponse>(CATALOG_ENDPOINTS.PRODUCT_BY_SLUG(slug));
    return response.data;
  },

  // Search
  /**
   * GET /catalog/search
   * Search products by name, SKU, or description
   */
  searchProducts: async (params: SearchProductsParams): Promise<ProductSummary[]> => {
    const response = await apiGet<SearchProductsResponse>(CATALOG_ENDPOINTS.SEARCH, { params });
    return response.data;
  },

  // Fitment
  /**
   * GET /catalog/fitment/makes
   * Returns all vehicle makes available in fitment data
   */
  getFitmentMakes: async (): Promise<string[]> => {
    const response = await apiGet<GetFitmentMakesResponse>(CATALOG_ENDPOINTS.FITMENT_MAKES);
    return response.data;
  },

  /**
   * GET /catalog/fitment/models
   * Returns vehicle models for a given make
   */
  getFitmentModels: async (params: GetFitmentModelsParams): Promise<string[]> => {
    const response = await apiGet<GetFitmentModelsResponse>(CATALOG_ENDPOINTS.FITMENT_MODELS, { params });
    return response.data;
  },

  /**
   * GET /catalog/fitment/years
   * Returns vehicle years for a given make and model
   */
  getFitmentYears: async (params?: GetFitmentYearsParams): Promise<number[]> => {
    const response = await apiGet<GetFitmentYearsResponse>(CATALOG_ENDPOINTS.FITMENT_YEARS, { params });
    return response.data;
  },

  /**
   * GET /catalog/fitment/search
   * Find products that fit a specific vehicle (year, make, model)
   */
  searchByFitment: async (params: FitmentSearchParams): Promise<FitmentSearchResponse> => {
    return apiGet<FitmentSearchResponse>(CATALOG_ENDPOINTS.FITMENT_SEARCH, { params });
  },
};

// Re-export types for convenience
export type {
  GetCategoriesResponse,
  GetCategoryResponse,
  GetBrandsResponse,
  GetProductsResponse,
  GetFeaturedProductsResponse,
  GetProductDetailResponse,
  SearchProductsResponse,
  GetFitmentMakesResponse,
  GetFitmentModelsResponse,
  GetFitmentYearsResponse,
  FitmentSearchResponse,
  GetProductsParams,
  GetFitmentModelsParams,
  GetFitmentYearsParams,
  FitmentSearchParams,
  SearchProductsParams,
  ProductSummary,
  ProductDetail,
  Category,
  Brand,
};

export default catalogService;
