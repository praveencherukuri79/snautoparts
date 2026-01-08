/**
 * Product Types
 */
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  category?: Category;
  brandId?: string;
  brand?: Brand;
  price: number;
  salePrice?: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  stockStatus: StockStatus;
  fulfillmentType: FulfillmentType;
  upc?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  images: ProductImage[];
  fitments: ProductFitment[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export type FulfillmentType = 'inventory' | 'dropship' | 'mixed';

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductFitment {
  id: string;
  productId: string;
  yearStart: number;
  yearEnd: number;
  make: string;
  model: string;
  submodel?: string;
  engine?: string;
  notes?: string;
}

/**
 * Category Types
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  imageUrl?: string;
  iconName?: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
}

/**
 * Brand Types
 */
export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  isActive: boolean;
}

/**
 * Product List Params
 */
export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: StockStatus;
  fulfillmentType?: FulfillmentType;
  isFeatured?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'stockQuantity';
  sortOrder?: 'asc' | 'desc';
  // Fitment filters
  year?: number;
  make?: string;
  model?: string;
}

/**
 * Fitment Selector Data
 */
export interface FitmentYear {
  year: number;
}

export interface FitmentMake {
  make: string;
}

export interface FitmentModel {
  model: string;
}

/**
 * Product Filters for catalog service
 */
export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: StockStatus;
  fulfillmentType?: FulfillmentType;
  isFeatured?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'stockQuantity';
  sortOrder?: 'asc' | 'desc';
  year?: number;
  make?: string;
  model?: string;
}

/**
 * Search Results
 */
export interface SearchResults<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Fitment Search Parameters
 */
export interface FitmentSearchParams {
  year?: number;
  make?: string;
  model?: string;
  submodel?: string;
  engine?: string;
}

/**
 * Vehicle Information
 */
export interface VehicleInfo {
  id: string;
  year: number;
  make: string;
  model: string;
  submodel?: string;
  engine?: string;
}
