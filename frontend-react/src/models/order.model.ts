/**
 * Order Models
 * Generated from swagger.json - /orders/* endpoints
 */

import type { PaginationMeta } from './api.model';

/**
 * Order status enum
 */
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

/**
 * Order item object
 */
export interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  productSku: string;
  productImageUrl: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

/**
 * Order user info (embedded in order)
 */
export interface OrderUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * Order summary (list view)
 * GET /orders/ - items in data array
 */
export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: string;
  itemCount: number;
  createdAt: string;
  user?: OrderUser;
}

/**
 * Order detail (single order view)
 * GET /orders/{id} - Response
 */
export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: string;
  shippingCost: string;
  taxAmount: string;
  total: string;
  shippingMethod: string | null;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  shippingAddress: Record<string, unknown> | null;
  billingAddress: Record<string, unknown> | null;
  user?: OrderUser;
}

/**
 * GET /orders/ - Query params
 */
export interface GetOrdersParams {
  page?: string;
  limit?: string;
  status?: OrderStatus;
  userId?: string;
}

/**
 * GET /orders/ - Response (200)
 */
export interface GetOrdersResponse {
  data: OrderSummary[];
  meta: PaginationMeta;
}

/**
 * GET /orders/statistics - Response (200)
 */
export interface GetOrderStatisticsResponse {
  data: Record<string, unknown>;
}

/**
 * GET /orders/pending-count - Response (200)
 */
export interface GetPendingOrdersCountResponse {
  data: {
    count: number;
  };
}

/**
 * GET /orders/{id} - Response (200)
 */
export interface GetOrderDetailResponse {
  data: OrderDetail;
}

/**
 * PATCH /orders/{id}/status - Request body
 */
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}

/**
 * PATCH /orders/{id}/status - Response (200)
 */
export interface UpdateOrderStatusResponse {
  data: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    updatedAt: string;
  };
}

/**
 * POST /orders/{id}/cancel - Request body
 */
export interface CancelOrderRequest {
  reason?: string;
}

/**
 * POST /orders/{id}/cancel - Response (200)
 */
export interface CancelOrderResponse {
  data: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    cancelledAt: string | null;
  };
}

/**
 * Order timeline event
 * GET /orders/{id}/timeline - Response item
 */
export interface OrderTimelineEvent {
  id: string;
  status: string;
  title: string;
  description: string | null;
  createdAt: string;
  changedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

/**
 * GET /orders/{id}/timeline - Response (200)
 */
export interface GetOrderTimelineResponse {
  data: OrderTimelineEvent[];
}

/**
 * Shipment object
 * GET /orders/{id}/shipments - Response item
 */
export interface Shipment {
  id: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl: string | null;
  status: string;
  estimatedDelivery: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

/**
 * GET /orders/{id}/shipments - Response (200)
 */
export interface GetOrderShipmentsResponse {
  data: Shipment[];
}

/**
 * Shipment tracking (public endpoint)
 * GET /orders/track/{trackingNumber} - Response
 */
export interface ShipmentTracking extends Shipment {
  orderNumber: string;
}

/**
 * GET /orders/track/{trackingNumber} - Response (200)
 */
export interface TrackShipmentResponse {
  data: ShipmentTracking;
}
