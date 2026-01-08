/**
 * Order Service
 * 
 * Handles order-related API calls.
 * Conditionally uses mock data based on env.enableMockData.
 */

import { api } from './api';
import { env } from '@/config/env';
import {
  mockAllOrders,
  mockOrderDetail,
  mockOrderTimeline,
  mockShipment,
} from './mockData';
import type {
  OrderSummary,
  OrderDetail,
  OrderTimelineEvent,
  Shipment,
  GetOrdersParams,
  GetOrdersResponse,
  GetOrderDetailResponse,
  GetOrderTimelineResponse,
  GetOrderShipmentsResponse,
  CancelOrderRequest,
  CancelOrderResponse,
} from '@/models';

/**
 * Order Service
 */
export const orderService = {
  /**
   * Get all orders with optional filters
   */
  getOrders: async (params?: GetOrdersParams): Promise<{ orders: OrderSummary[]; total: number }> => {
    if (env.enableMockData) {
      // Filter mock data if status provided
      let filteredOrders = [...mockAllOrders];
      if (params?.status) {
        filteredOrders = filteredOrders.filter(order => order.status === params.status);
      }
      
      return {
        orders: filteredOrders,
        total: filteredOrders.length,
      };
    }

    try {
      const response = await api.get<GetOrdersResponse>('/orders/', { params });
      return {
        orders: response.data.data,
        total: response.data.meta.total,
      };
    } catch (error) {
      console.error('Failed to fetch orders, using mock data:', error);
      return {
        orders: mockAllOrders,
        total: mockAllOrders.length,
      };
    }
  },

  /**
   * Get single order details
   */
  getOrderDetail: async (orderId: string): Promise<OrderDetail> => {
    if (env.enableMockData) {
      // Find the matching order from mockAllOrders to get the correct orderNumber
      const matchingOrder = mockAllOrders.find(o => o.id === orderId);
      return { 
        ...mockOrderDetail, 
        id: orderId,
        orderNumber: matchingOrder?.orderNumber || mockOrderDetail.orderNumber,
      };
    }

    try {
      const response = await api.get<GetOrderDetailResponse>(`/orders/${orderId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch order detail, using mock data:', error);
      return { ...mockOrderDetail, id: orderId };
    }
  },

  /**
   * Get order timeline/history
   */
  getOrderTimeline: async (orderId: string): Promise<OrderTimelineEvent[]> => {
    if (env.enableMockData) {
      return mockOrderTimeline;
    }

    try {
      const response = await api.get<GetOrderTimelineResponse>(`/orders/${orderId}/timeline`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch order timeline, using mock data:', error);
      return mockOrderTimeline;
    }
  },

  /**
   * Get order shipments
   */
  getOrderShipments: async (orderId: string): Promise<Shipment[]> => {
    if (env.enableMockData) {
      return [mockShipment];
    }

    try {
      const response = await api.get<GetOrderShipmentsResponse>(`/orders/${orderId}/shipments`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch shipments, using mock data:', error);
      return [mockShipment];
    }
  },

  /**
   * Cancel order
   */
  cancelOrder: async (orderId: string, reason?: string): Promise<void> => {
    if (env.enableMockData) {
      return Promise.resolve();
    }

    const data: CancelOrderRequest = { reason };
    await api.post<CancelOrderResponse>(`/orders/${orderId}/cancel`, data);
  },

  /**
   * Track shipment by tracking number (public endpoint)
   */
  trackShipment: async (trackingNumber: string): Promise<Shipment & { orderNumber: string }> => {
    if (env.enableMockData) {
      return {
        ...mockShipment,
        trackingNumber,
        orderNumber: 'ORD-2024-001',
      };
    }

    try {
      const response = await api.get(`/orders/track/${trackingNumber}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to track shipment, using mock data:', error);
      return {
        ...mockShipment,
        trackingNumber,
        orderNumber: 'ORD-2024-001',
      };
    }
  },
};

export default orderService;
