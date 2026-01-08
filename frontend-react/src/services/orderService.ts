import { apiGet, apiPost, PaginatedResponse } from './api';
import { API_ENDPOINTS } from '@/utils/constants';
import { Order } from '@/types';

export interface OrderListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export interface CreateOrderRequest {
  shippingAddressId: string;
  billingAddressId?: string;
  paymentMethodId: string;
  shippingMethod: string;
  notes?: string;
  couponCode?: string;
}

export interface OrderResponse {
  order: Order;
  paymentUrl?: string;
}

export interface ShippingRate {
  id: string;
  name: string;
  carrier: string;
  estimatedDays: number;
  price: number;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Order Service
 * 
 * Handles order-related API calls including checkout.
 */
export const orderService = {
  // Orders
  /**
   * Get paginated list of user's orders
   */
  getOrders: async (params?: OrderListParams): Promise<PaginatedResponse<Order>> => {
    return apiGet<PaginatedResponse<Order>>(API_ENDPOINTS.ORDERS.LIST, { params });
  },

  /**
   * Get single order by ID
   */
  getOrder: async (id: string): Promise<Order> => {
    return apiGet<Order>(API_ENDPOINTS.ORDERS.DETAIL(id));
  },

  /**
   * Get order by order number
   */
  getOrderByNumber: async (orderNumber: string): Promise<Order> => {
    return apiGet<Order>(`${API_ENDPOINTS.ORDERS.LIST}/number/${orderNumber}`);
  },

  /**
   * Create new order (checkout)
   */
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    return apiPost<OrderResponse>(API_ENDPOINTS.ORDERS.CREATE, data);
  },

  /**
   * Cancel order
   */
  cancelOrder: async (id: string, reason?: string): Promise<Order> => {
    return apiPost<Order>(`${API_ENDPOINTS.ORDERS.DETAIL(id)}/cancel`, { reason });
  },

  /**
   * Track order
   */
  trackOrder: async (id: string): Promise<{
    status: string;
    trackingNumber?: string;
    carrier?: string;
    trackingUrl?: string;
    events: Array<{ date: string; status: string; location?: string }>;
  }> => {
    return apiGet(`${API_ENDPOINTS.ORDERS.DETAIL(id)}/tracking`);
  },

  // Checkout
  /**
   * Get available shipping rates for cart
   */
  getShippingRates: async (addressId: string): Promise<ShippingRate[]> => {
    return apiGet<ShippingRate[]>(API_ENDPOINTS.CHECKOUT.SHIPPING_RATES, {
      params: { addressId },
    });
  },

  /**
   * Calculate order totals preview
   */
  calculateTotals: async (data: {
    shippingMethod: string;
    couponCode?: string;
  }): Promise<{
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
  }> => {
    return apiPost(`${API_ENDPOINTS.CHECKOUT.BASE}/calculate`, data);
  },

  /**
   * Create payment intent for Stripe
   */
  createPaymentIntent: async (orderId: string): Promise<PaymentIntentResponse> => {
    return apiPost<PaymentIntentResponse>(API_ENDPOINTS.CHECKOUT.PAYMENT_INTENT, { orderId });
  },

  /**
   * Confirm payment completion
   */
  confirmPayment: async (orderId: string, paymentIntentId: string): Promise<Order> => {
    return apiPost<Order>(`${API_ENDPOINTS.ORDERS.DETAIL(orderId)}/confirm-payment`, {
      paymentIntentId,
    });
  },

  // Guest checkout
  /**
   * Track order as guest
   */
  guestTrackOrder: async (orderNumber: string, email: string): Promise<Order> => {
    return apiGet<Order>(`${API_ENDPOINTS.ORDERS.LIST}/guest/track`, {
      params: { orderNumber, email },
    });
  },
};

export default orderService;
