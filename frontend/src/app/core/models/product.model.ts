/**
 * Product models - aligned with backend API responses
 * 
 * IMPORTANT: Backend returns:
 * - price as string (Prisma Decimal)
 * - brand as object { id, name, slug } or null
 * - images as string[] (URLs) and imageUrl as primary
 */

export interface ProductBrand {
  id: string;
  name: string;
  slug: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductFitment {
  id: string;
  productId: string;
  yearStart: number;
  yearEnd: number;
  make: string;
  model: string;
  submodel?: string | null;
  engine?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription?: string | null;
  price: number | string; // Backend returns Decimal as string
  compareAtPrice?: number | string | null;
  costPrice?: number | string | null;
  categoryId: string;
  brandId?: string | null;
  imageUrl: string | null; // Primary image URL
  images: string[]; // Array of additional image URLs
  weight?: number | string | null;
  weightUnit?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt: string;
  updatedAt: string;
  // Included relations
  category?: ProductCategory;
  brand?: ProductBrand | null;
  fitments?: ProductFitment[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  parent?: Category;
  children?: Category[];
  _count?: { products: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  categoryId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'name' | 'newest' | 'popularity';
  limit?: number;
  page?: number;
  featured?: boolean;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

