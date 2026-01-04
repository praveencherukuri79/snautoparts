import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { MockDataService } from './mock-data.service';
import { environment } from '../../../environments/environment';
import {
  Order,
  OrderFilters,
  PaginatedOrders,
  CreateOrderRequest,
} from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private api = inject(ApiService);
  private mockData = inject(MockDataService);

  // Customer endpoints
  getMyOrders(page = 1, pageSize = 10): Observable<PaginatedOrders> {
    if (environment.enableMockData) {
      return this.mockData.getOrders(page, pageSize);
    }
    return this.api.getPaginated<Order, PaginatedOrders>('/customer/orders', 'orders', { page, limit: pageSize });
  }

  getOrderById(orderId: string): Observable<Order> {
    if (environment.enableMockData) {
      return this.mockData.getOrderById(orderId);
    }
    return this.api.get<Order>(`/customer/orders/${orderId}`);
  }

  createOrder(request: CreateOrderRequest): Observable<Order> {
    // Order creation is part of checkout flow
    return this.api.post<Order>('/customer/checkout/create-order', request);
  }

  // Manager endpoints
  getAllOrders(filters?: OrderFilters, page = 1, pageSize = 20): Observable<PaginatedOrders> {
    if (environment.enableMockData) {
      return this.mockData.getAllOrders(filters, page, pageSize);
    }
    const params: Record<string, string | number | boolean> = { page, limit: pageSize };
    if (filters) {
      if (filters.status) params['status'] = filters.status;
      if (filters.paymentStatus) params['paymentStatus'] = filters.paymentStatus;
      if (filters.startDate) params['startDate'] = filters.startDate;
      if (filters.endDate) params['endDate'] = filters.endDate;
      if (filters.search) params['search'] = filters.search;
    }
    return this.api.getPaginated<Order, PaginatedOrders>('/manager/orders', 'orders', params);
  }

  getManagerOrderById(orderId: string): Observable<Order> {
    if (environment.enableMockData) {
      return this.mockData.getOrderById(orderId);
    }
    return this.api.get<Order>(`/manager/orders/${orderId}`);
  }

  updateOrderStatus(orderId: string, status: string): Observable<Order> {
    return this.api.patch<Order>(`/manager/orders/${orderId}/status`, { status });
  }

  fulfillOrder(orderId: string, trackingNumber?: string): Observable<Order> {
    return this.api.post<Order>(`/manager/orders/${orderId}/fulfill`, { trackingNumber });
  }

  getOrderStats(): Observable<{
    newOrders: number;
    pendingShipment: number;
    todaysVolume: number;
    statusCounts: Record<string, number>;
  }> {
    if (environment.enableMockData) {
      return this.mockData.getOrderStats();
    }
    return this.api.get('/manager/orders/stats');
  }
}

