import { z } from 'zod';

// ============================================
// COMMON SCHEMAS
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

// ============================================
// AUTH SCHEMAS
// ============================================

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
});

// ============================================
// ADDRESS SCHEMAS
// ============================================

export const addressSchema = z.object({
  label: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  street: z.string().min(1, 'Street address is required'),
  apartment: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'Valid zip code is required'),
  country: z.string().default('US'),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// ============================================
// PRODUCT SCHEMAS
// ============================================

export const productFilterSchema = z.object({
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest', 'bestselling']).default('newest'),
});

export const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.coerce.number().positive('Price must be positive'),
  compareAtPrice: z.coerce.number().positive().optional(),
  costPrice: z.coerce.number().positive().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().optional(),
  imageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).default([]),
  weight: z.coerce.number().positive().optional(),
  weightUnit: z.string().default('lb'),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(10),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

// ============================================
// CART SCHEMAS
// ============================================

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.coerce.number().int().positive('Quantity must be positive').default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0, 'Quantity must be 0 or greater'),
});

// ============================================
// ORDER SCHEMAS
// ============================================

export const createOrderSchema = z.object({
  addressId: z.string().optional(),
  shippingAddress: addressSchema.optional(),
  shippingMethod: z.string().min(1, 'Shipping method is required'),
  idempotencyKey: z.string().optional(),
  notes: z.string().optional(),
});

export const createPaymentIntentSchema = z.object({
  idempotencyKey: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  trackingNumber: z.string().optional(),
  shippingCarrier: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================
// INVENTORY SCHEMAS
// ============================================

export const inventoryAdjustmentSchema = z.object({
  productId: z.string().min(1),
  adjustmentType: z.enum(['RECEIVED', 'SOLD', 'RETURNED', 'DAMAGED', 'ADJUSTMENT', 'TRANSFER']),
  quantity: z.coerce.number().int(),
  reason: z.string().optional(),
  referenceId: z.string().optional(),
});

// ============================================
// ADMIN SCHEMAS
// ============================================

export const updateUserRoleSchema = z.object({
  role: z.enum(['CUSTOMER', 'MANAGER', 'ADMIN']),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['CUSTOMER', 'MANAGER', 'ADMIN']).default('CUSTOMER'),
});

export const settingSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
  category: z.string().default('general'),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductFilter = z.infer<typeof productFilterSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type InventoryAdjustmentInput = z.infer<typeof inventoryAdjustmentSchema>;

