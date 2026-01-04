/**
 * Order models - aligned with backend API responses
 * 
 * IMPORTANT: Backend returns:
 * - Decimal fields as strings (subtotal, shippingAmount, etc.)
 * - Shipping address fields prefixed with "shipping" on Order
 */

/**
 * Order item from backend
 */
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  sku: string;
  name: string;
  price: number | string;
  quantity: number;
  totalPrice: number | string;
  product?: {
    id: string;
    name: string;
    imageUrl: string | null;
    slug: string;
  };
}

/**
 * Order timeline event from backend
 */
export interface OrderTimeline {
  id: string;
  orderId: string;
  status: string;
  message: string | null;
  createdAt: string;
  createdBy: string | null;
}

/**
 * Order from backend - shipping address is denormalized as individual fields
 */
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  addressId: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number | string;
  shippingAmount: number | string;
  taxAmount: number | string;
  discountAmount?: number | string;
  totalAmount: number | string;
  shippingMethod: string | null;
  shippingCarrier: string | null;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Denormalized shipping address
  shippingFirstName: string | null;
  shippingLastName: string | null;
  shippingStreet: string | null;
  shippingApartment: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZipCode: string | null;
  shippingCountry: string | null;
  shippingPhone: string | null;
  items: OrderItem[];
  timeline?: OrderTimeline[];
}

/**
 * Shipping address from backend /customer/profile/addresses
 */
export interface ShippingAddress {
  id: string;
  userId?: string;
  label?: string | null;
  firstName: string;
  lastName: string;
  street: string;
  apartment?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string | null;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 
  | 'PENDING' 
  | 'AUTHORIZED' 
  | 'PAID'
  | 'CAPTURED' 
  | 'FAILED' 
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

/**
 * Create order request - backend expects these fields
 */
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

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface PaginatedOrders {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

