import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import {
  Order,
  OrderFilters,
  OrderStatusUpdate,
  OrderStatistics,
  OrderTrackingResult,
  AffiliateOrder,
  Shipment,
  OrderNote,
  PaginatedResponse,
} from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private api = inject(ApiService);

  // State for current order detail
  private currentOrder = signal<Order | null>(null);
  private isLoading = signal(false);

  readonly order = computed(() => this.currentOrder());
  readonly loading = computed(() => this.isLoading());

  // Get paginated orders list
  async getOrders(filters?: OrderFilters): Promise<PaginatedResponse<Order>> {
    const params = this.buildQueryParams(filters);
    return this.api.get<PaginatedResponse<Order>>(`/orders?${params}`);
  }

  // Get single order by ID
  async getOrder(orderId: string): Promise<Order> {
    this.isLoading.set(true);
    try {
      const order = await this.api.get<Order>(`/orders/${orderId}`);
      this.currentOrder.set(order);
      return order;
    } finally {
      this.isLoading.set(false);
    }
  }

  // Get order timeline
  async getOrderTimeline(orderId: string): Promise<Order['timeline']> {
    const response = await this.api.get<{ data: Order['timeline'] }>(`/orders/${orderId}/timeline`);
    return response.data;
  }

  // Get order shipments
  async getOrderShipments(orderId: string): Promise<Shipment[]> {
    const response = await this.api.get<{ data: Shipment[] }>(`/orders/${orderId}/shipments`);
    return response.data;
  }

  // Update order status (Manager/Admin)
  async updateOrderStatus(orderId: string, update: OrderStatusUpdate | string): Promise<Order> {
    const data = typeof update === 'string' ? { status: update } : update;
    const order = await this.api.patch<Order>(`/orders/${orderId}/status`, data);
    this.currentOrder.set(order);
    return order;
  }

  // Cancel order (Manager/Admin)
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const order = await this.api.post<Order>(`/orders/${orderId}/cancel`, { reason });
    this.currentOrder.set(order);
    return order;
  }

  // Get order statistics (Manager/Admin)
  async getOrderStatistics(startDate?: string, endDate?: string): Promise<OrderStatistics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return this.api.get<OrderStatistics>(`/orders/statistics?${params}`);
  }

  // Get pending orders count (for nav badge)
  async getPendingOrdersCount(): Promise<number> {
    const response = await this.api.get<{ count: number }>('/orders/pending-count');
    return response.count;
  }

  // Get dashboard statistics (Manager/Admin)
  async getDashboardStats(): Promise<{
    pendingOrders: number;
    lowStockItems: number;
    shippedToday: number;
    todayRevenue: number;
    ordersToday: number;
    totalUsers: number;
    totalProducts: number;
  }> {
    try {
      return await this.api.get('/orders/dashboard-stats');
    } catch {
      // Return defaults if endpoint not available
      return {
        pendingOrders: 0,
        lowStockItems: 0,
        shippedToday: 0,
        todayRevenue: 0,
        ordersToday: 0,
        totalUsers: 0,
        totalProducts: 0,
      };
    }
  }

  // Public order tracking (no auth required)
  async trackOrder(orderNumber: string): Promise<OrderTrackingResult> {
    return this.api.get<OrderTrackingResult>(`/orders/track/${orderNumber}`, { skipAuth: true });
  }

  // Affiliate Orders (Drop-ship)
  async getAffiliateOrders(filters?: {
    status?: string;
    affiliateId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AffiliateOrder>> {
    const params = this.buildQueryParams(filters);
    return this.api.get<PaginatedResponse<AffiliateOrder>>(`/dropship/orders?${params}`);
  }

  // Get single affiliate order
  async getAffiliateOrder(affiliateOrderId: string): Promise<AffiliateOrder> {
    return this.api.get<AffiliateOrder>(`/dropship/orders/${affiliateOrderId}`);
  }

  // Retry failed affiliate order push
  async retryAffiliateOrder(affiliateOrderId: string): Promise<AffiliateOrder> {
    return this.api.post<AffiliateOrder>(`/dropship/orders/${affiliateOrderId}/retry`, {});
  }

  // Add note to order
  async addOrderNote(orderId: string, content: string): Promise<OrderNote> {
    return this.api.post<OrderNote>(`/orders/${orderId}/notes`, { content });
  }

  // Get order notes
  async getOrderNotes(orderId: string): Promise<OrderNote[]> {
    const response = await this.api.get<{ data: OrderNote[] }>(`/orders/${orderId}/notes`);
    return response.data;
  }

  // Clear current order
  clearOrder(): void {
    this.currentOrder.set(null);
  }

  // Build query params from filters
  private buildQueryParams<T extends object>(filters?: T): string {
    if (!filters) return '';

    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  }
}

