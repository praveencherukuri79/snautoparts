import { apiGet, apiPost, apiPatch } from './api';
import type {
  OrderStatus,
  OrderSummary,
  OrderDetail,
  OrderTimelineEvent,
  Shipment,
  ShipmentTracking,
  GetOrdersResponse,
  GetOrdersParams,
  GetOrderDetailResponse,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
  CancelOrderRequest,
  CancelOrderResponse,
  GetOrderTimelineResponse,
  GetOrderShipmentsResponse,
  TrackShipmentResponse,
  GetPendingOrdersCountResponse,
  GetOrderStatisticsResponse,
} from '@/models';
import type {
  ShippingMethod,
  CheckoutSummary,
  PaymentIntent,
  CreatedOrder,
  GetShippingMethodsResponse,
  GetCheckoutSummaryParams,
  GetCheckoutSummaryResponse,
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  CreateOrderRequest,
  CreateOrderResponse,
} from '@/models';

// API Endpoints matching swagger paths
const ORDER_ENDPOINTS = {
  LIST: '/orders/',
  DETAIL: (id: string) => `/orders/${id}`,
  STATUS: (id: string) => `/orders/${id}/status`,
  CANCEL: (id: string) => `/orders/${id}/cancel`,
  TIMELINE: (id: string) => `/orders/${id}/timeline`,
  SHIPMENTS: (id: string) => `/orders/${id}/shipments`,
  TRACK: (trackingNumber: string) => `/orders/track/${trackingNumber}`,
  STATISTICS: '/orders/statistics',
  PENDING_COUNT: '/orders/pending-count',
};

const CHECKOUT_ENDPOINTS = {
  SHIPPING_METHODS: '/checkout/shipping-methods',
  SUMMARY: '/checkout/summary',
  PAYMENT_INTENT: '/checkout/payment-intent',
  ORDERS: '/checkout/orders',
};

/**
 * Order Service
 * 
 * Handles order-related API calls including checkout.
 * Types match swagger.json exactly.
 */
export const orderService = {
  // Orders
  /**
   * GET /orders/
   * Returns a paginated list of orders
   */
  getOrders: async (params?: GetOrdersParams): Promise<GetOrdersResponse> => {
    return apiGet<GetOrdersResponse>(ORDER_ENDPOINTS.LIST, { params });
  },

  /**
   * GET /orders/{id}
   * Returns detailed order information
   */
  getOrder: async (id: string): Promise<OrderDetail> => {
    const response = await apiGet<GetOrderDetailResponse>(ORDER_ENDPOINTS.DETAIL(id));
    return response.data;
  },

  /**
   * GET /orders/statistics
   * Returns order statistics and metrics (manager/admin only)
   */
  getStatistics: async (): Promise<Record<string, unknown>> => {
    const response = await apiGet<GetOrderStatisticsResponse>(ORDER_ENDPOINTS.STATISTICS);
    return response.data;
  },

  /**
   * GET /orders/pending-count
   * Returns the count of pending orders (for nav badge)
   */
  getPendingCount: async (): Promise<number> => {
    const response = await apiGet<GetPendingOrdersCountResponse>(ORDER_ENDPOINTS.PENDING_COUNT);
    return response.data.count;
  },

  /**
   * PATCH /orders/{id}/status
   * Update the status of an order (manager/admin only)
   */
  updateStatus: async (id: string, data: UpdateOrderStatusRequest): Promise<UpdateOrderStatusResponse['data']> => {
    const response = await apiPatch<UpdateOrderStatusResponse>(ORDER_ENDPOINTS.STATUS(id), data);
    return response.data;
  },

  /**
   * POST /orders/{id}/cancel
   * Cancel an order
   */
  cancelOrder: async (id: string, data?: CancelOrderRequest): Promise<CancelOrderResponse['data']> => {
    const response = await apiPost<CancelOrderResponse>(ORDER_ENDPOINTS.CANCEL(id), data);
    return response.data;
  },

  /**
   * GET /orders/{id}/timeline
   * Returns the status history timeline for an order
   */
  getTimeline: async (id: string): Promise<OrderTimelineEvent[]> => {
    const response = await apiGet<GetOrderTimelineResponse>(ORDER_ENDPOINTS.TIMELINE(id));
    return response.data;
  },

  /**
   * GET /orders/{id}/shipments
   * Returns shipment tracking information for an order
   */
  getShipments: async (id: string): Promise<Shipment[]> => {
    const response = await apiGet<GetOrderShipmentsResponse>(ORDER_ENDPOINTS.SHIPMENTS(id));
    return response.data;
  },

  /**
   * GET /orders/track/{trackingNumber}
   * Public endpoint to track a shipment by tracking number
   */
  trackShipment: async (trackingNumber: string): Promise<ShipmentTracking> => {
    const response = await apiGet<TrackShipmentResponse>(ORDER_ENDPOINTS.TRACK(trackingNumber));
    return response.data;
  },

  // Checkout
  /**
   * GET /checkout/shipping-methods
   * Returns available shipping methods based on cart contents and user location
   */
  getShippingMethods: async (): Promise<ShippingMethod[]> => {
    const response = await apiGet<GetShippingMethodsResponse>(CHECKOUT_ENDPOINTS.SHIPPING_METHODS);
    return response.data;
  },

  /**
   * GET /checkout/summary
   * Returns order summary with subtotal, shipping, tax, and total
   */
  getCheckoutSummary: async (params?: GetCheckoutSummaryParams): Promise<CheckoutSummary> => {
    const response = await apiGet<GetCheckoutSummaryResponse>(CHECKOUT_ENDPOINTS.SUMMARY, { params });
    return response.data;
  },

  /**
   * POST /checkout/payment-intent
   * Creates a Stripe payment intent for the current cart
   */
  createPaymentIntent: async (data: CreatePaymentIntentRequest): Promise<PaymentIntent> => {
    const response = await apiPost<CreatePaymentIntentResponse>(CHECKOUT_ENDPOINTS.PAYMENT_INTENT, data);
    return response.data;
  },

  /**
   * POST /checkout/orders
   * Creates an order from the current cart after successful payment
   */
  createOrder: async (data: CreateOrderRequest): Promise<CreatedOrder> => {
    const response = await apiPost<CreateOrderResponse>(CHECKOUT_ENDPOINTS.ORDERS, data);
    return response.data;
  },
};

// Re-export types for convenience
export type {
  OrderStatus,
  OrderSummary,
  OrderDetail,
  OrderTimelineEvent,
  Shipment,
  ShipmentTracking,
  GetOrdersResponse,
  GetOrdersParams,
  UpdateOrderStatusRequest,
  CancelOrderRequest,
  ShippingMethod,
  CheckoutSummary,
  PaymentIntent,
  CreatedOrder,
  GetCheckoutSummaryParams,
  CreatePaymentIntentRequest,
  CreateOrderRequest,
};

export default orderService;
