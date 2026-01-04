/**
 * API Types - Shared contracts between frontend and backend
 * These types match the exact response structure from the backend API
 * 
 * IMPORTANT: When updating backend responses, update these types first.
 * TypeScript will then flag all places that need updates.
 */

// ============================================
// COMMON TYPES
// ============================================

/** Standard paginated response wrapper from backend */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Standard single item response wrapper from backend */
export interface ApiResponse<T> {
  data: T;
}

// ============================================
// AUTH TYPES (/public/auth)
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  name: string | null;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'CUSTOMER' | 'MANAGER' | 'ADMIN';
  image?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: AuthUserResponse;
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// ============================================
// CATALOG TYPES (/public/catalog)
// ============================================

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
  children?: CategoryResponse[];
}

export interface BrandResponse {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: string; // Decimal comes as string from Prisma
  compareAtPrice: string | null;
  costPrice: string | null;
  categoryId: string;
  brandId: string | null;
  imageUrl: string | null;
  images: string[]; // Array of image URLs
  weight: string | null;
  weightUnit: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; slug: string };
  brand?: { id: string; name: string; slug: string } | null;
  fitments?: ProductFitmentResponse[];
}

export interface ProductFitmentResponse {
  id: string;
  productId: string;
  yearStart: number;
  yearEnd: number;
  make: string;
  model: string;
  submodel: string | null;
  engine: string | null;
  notes: string | null;
  createdAt: string;
}

// ============================================
// CART TYPES (/customer/cart)
// ============================================

/** Product info returned in cart - subset of full product */
export interface CartProductResponse {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: string;
  compareAtPrice: string | null;
  imageUrl: string | null;
  stockQuantity: number;
}

export interface CartItemResponse {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: CartProductResponse;
}

export interface CartResponse {
  id: string;
  userId: string | null;
  sessionId: string | null;
  createdAt: string;
  updatedAt: string;
  items: CartItemResponse[];
  subtotal: number;
  itemCount: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// ============================================
// CHECKOUT TYPES (/customer/checkout)
// ============================================

export interface ShippingMethodResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  freeThreshold: number | null;
}

export interface CreatePaymentIntentRequest {
  idempotencyKey: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
}

export interface CreateOrderRequest {
  addressId?: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  shippingMethod: string;
  paymentIntentId?: string;
  idempotencyKey?: string;
  notes?: string;
}

// ============================================
// ORDER TYPES (/customer/orders, /manager/orders)
// ============================================

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface OrderItemResponse {
  id: string;
  orderId: string;
  productId: string;
  sku: string;
  name: string;
  price: string;
  quantity: number;
  totalPrice: string;
  product?: {
    id: string;
    name: string;
    imageUrl: string | null;
    slug: string;
  };
}

export interface OrderTimelineResponse {
  id: string;
  orderId: string;
  status: string;
  message: string | null;
  createdAt: string;
  createdBy: string | null;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  userId: string;
  addressId: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: string;
  shippingAmount: string;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  shippingMethod: string | null;
  shippingCarrier: string | null;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Shipping address snapshot
  shippingFirstName: string | null;
  shippingLastName: string | null;
  shippingStreet: string | null;
  shippingApartment: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZipCode: string | null;
  shippingCountry: string | null;
  shippingPhone: string | null;
  items: OrderItemResponse[];
  timeline?: OrderTimelineResponse[];
}

// ============================================
// PROFILE TYPES (/customer/profile)
// ============================================

export interface AddressResponse {
  id: string;
  userId: string;
  label: string | null;
  firstName: string;
  lastName: string;
  street: string;
  apartment: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface CreateAddressRequest {
  label?: string;
  firstName: string;
  lastName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}

// ============================================
// ADMIN TYPES (/admin)
// ============================================

export interface AdminUserResponse {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  role: 'CUSTOMER' | 'MANAGER' | 'ADMIN';
  image: string | null;
  createdAt: string;
  lastActive?: string | null;
}

export interface UpdateUserRoleRequest {
  role: 'CUSTOMER' | 'MANAGER' | 'ADMIN';
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'MANAGER' | 'ADMIN';
}

export interface SettingResponse {
  id: string;
  key: string;
  value: unknown; // JSON value
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingRequest {
  value: unknown;
}

export interface AuditLogResponse {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  oldData: unknown | null;
  newData: unknown | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
  } | null;
}

// ============================================
// MANAGER TYPES (/manager)
// ============================================

export type InventoryAdjustmentType = 'RECEIVED' | 'SOLD' | 'RETURNED' | 'DAMAGED' | 'ADJUSTMENT' | 'TRANSFER';

export interface InventoryLogResponse {
  id: string;
  productId: string;
  adjustmentType: InventoryAdjustmentType;
  quantity: number;
  previousQty: number;
  newQty: number;
  reason: string | null;
  referenceId: string | null;
  createdBy: string | null;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface AdjustInventoryRequest {
  adjustment: number;
  reason: string;
  adjustmentType?: InventoryAdjustmentType;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface FulfillOrderRequest {
  trackingNumber?: string;
  carrier?: string;
}

export interface OrderStatsResponse {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

