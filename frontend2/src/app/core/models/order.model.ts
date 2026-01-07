/**
 * Order Models
 */

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerId?: string;
  user?: OrderUser;
  customer?: OrderUser;
  customerEmail?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  shippingMethod?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  shippingCost: number;
  subtotal: number;
  tax?: number;
  taxRate?: number;
  taxAmount?: number;
  discount?: number;
  discountAmount?: number;
  total: number;
  notes?: OrderNote[];
  internalNotes?: string;
  timeline?: OrderTimelineEntry[];
  shipments?: Shipment[];
  affiliateOrders?: AffiliateOrder[];
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
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
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productSku: string;
  productSlug?: string;
  productName: string;
  productImage?: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  fulfillmentType?: string;
  affiliateId?: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    images?: string[];
  };
}

export interface OrderUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  company?: string;
  street?: string;
  apartment?: string;
  address1?: string;
  address2?: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode?: string;
  postalCode?: string;
  country: string;
  phone?: string;
}

export interface OrderTimelineEntry {
  id: string;
  orderId: string;
  status: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  changedBy?: string;
  createdAt: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string;
  status: ShipmentStatus;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

export type ShipmentStatus = 
  | 'PENDING'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'EXCEPTION';

// Affiliate/Drop-ship Order
export interface AffiliateOrder {
  id: string;
  orderId: string;
  orderNumber?: string;
  affiliateId: string;
  affiliateName: string;
  affiliateOrderId?: string;
  status: AffiliateOrderStatus;
  externalOrderId?: string;
  lastError?: string;
  errorMessage?: string;
  retryCount: number;
  nextRetryAt?: string;
  lastAttemptAt?: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

export type AffiliateOrderStatus = 
  | 'PENDING'
  | 'SENT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED';

// Order Filters (for manager/admin listing)
export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  userId?: string;
  startDate?: string;
  endDate?: string;
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: OrderSortField;
  sortOrder?: 'asc' | 'desc';
}

export type OrderSortField = 'orderNumber' | 'total' | 'createdAt' | 'status';

// Order Status Update
export interface OrderStatusUpdate {
  status: OrderStatus;
  notes?: string;
}

// Order Statistics
export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersToday: number;
  revenueToday: number;
}

// Public Order Tracking
export interface OrderTrackingResult {
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  timeline: OrderTimelineEntry[];
  shipments: Shipment[];
  estimatedDelivery?: string;
  createdAt?: string;
  items?: OrderItem[];
  total?: number;
  shippingAddress?: OrderAddress;
  shippingCarrier?: string;
  trackingNumber?: string;
}

// Type alias for OrderTimelineEntry
export type OrderTimeline = OrderTimelineEntry;

// Order Notes (internal notes by staff)
export interface OrderNote {
  id: string;
  orderId: string;
  author: string;
  authorId?: string;
  content: string;
  createdAt: string;
}

