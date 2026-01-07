import { z } from 'zod';

export const createProductSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.coerce.number().min(0.01, 'Price must be positive'),
  compareAtPrice: z.coerce.number().min(0.01).optional(),
  costPrice: z.coerce.number().min(0.01).optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  brandId: z.string().uuid().optional(),
  imageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  weight: z.coerce.number().min(0.01).optional(),
  weightUnit: z.string().default('lb'),
  length: z.coerce.number().min(0.01).optional(),
  width: z.coerce.number().min(0.01).optional(),
  height: z.coerce.number().min(0.01).optional(),
  dimensionUnit: z.string().default('in'),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(10),
  upc: z.string().optional(),
  fulfillmentType: z.enum(['INVENTORY', 'DROPSHIP', 'MIXED']).default('INVENTORY'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const productFitmentSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  yearStart: z.coerce.number().int().min(1900).max(2100),
  yearEnd: z.coerce.number().int().min(1900).max(2100),
  submodel: z.string().optional(),
  engine: z.string().optional(),
  notes: z.string().optional(),
});

export type ProductFitmentInput = z.infer<typeof productFitmentSchema>;

export const productsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  brand: z.string().optional(),
  search: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  active: z.coerce.boolean().optional(),
  inStock: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'stockQuantity']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ProductsQuery = z.infer<typeof productsQuerySchema>;

