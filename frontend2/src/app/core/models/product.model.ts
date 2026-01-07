/**
 * Product & Catalog Models
 */

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  category: Category;
  brand?: Brand;
  imageUrl?: string;
  images: string[];
  weight?: number;
  weightUnit: string;
  length?: number;
  width?: number;
  height?: number;
  dimensionUnit: string;
  stockQuantity: number;
  lowStockThreshold: number;
  upc?: string;
  fulfillmentType: FulfillmentType;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  fitments?: ProductFitment[];
  createdAt: string;
  updatedAt: string;
}

export type FulfillmentType = 'INVENTORY' | 'DROPSHIP' | 'MIXED';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  productCount?: number;
  isActive: boolean;
  sortOrder: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  isActive: boolean;
}

// Product Listing Filters
export interface ProductFilters {
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  fulfillmentType?: FulfillmentType;
  // Fitment filters
  year?: number;
  make?: string;
  model?: string;
  // Search
  q?: string;
  // Pagination & Sorting
  page?: number;
  limit?: number;
  sortBy?: ProductSortField;
  sortOrder?: 'asc' | 'desc';
}

export type ProductSortField = 'name' | 'price' | 'createdAt' | 'stockQuantity';

// Product Form Data (for create/update)
export interface ProductFormData {
  sku: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  categoryId: string;
  brandId?: string;
  weight?: number;
  weightUnit?: string;
  length?: number;
  width?: number;
  height?: number;
  dimensionUnit?: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
  upc?: string;
  fulfillmentType?: FulfillmentType;
  isActive?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

// Fitment Form Data
export interface FitmentFormData {
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  submodel?: string;
  engine?: string;
  notes?: string;
}

// Fitment Options (for cascading dropdowns)
export interface FitmentOptions {
  years: number[];
  makes: string[];
  models: string[];
}

// Product Card Display (for listings)
export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  imageUrl?: string;
  stockStatus: StockStatus;
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  isOnSale?: boolean;
}

