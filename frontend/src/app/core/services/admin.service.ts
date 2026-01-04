import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { MockDataService } from './mock-data.service';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { Product } from '../models/product.model';
import {
  AuditLog,
  AuditLogFilters,
  PaginatedAuditLogs,
  Setting,
  UpdateSettingRequest,
  InventoryAdjustment,
} from '../models/admin.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private api = inject(ApiService);
  private mockData = inject(MockDataService);

  // Users
  getUsers(page = 1, pageSize = 20): Observable<{
    users: User[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    if (environment.enableMockData) {
      return this.mockData.getUsers(page, pageSize);
    }
    return this.api.getPaginated<User, {
      users: User[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>('/admin/users', 'users', { page, limit: pageSize });
  }

  getUserById(userId: string): Observable<User> {
    return this.api.get<User>(`/admin/users/${userId}`);
  }

  updateUserRole(userId: string, role: string): Observable<User> {
    return this.api.patch<User>(`/admin/users/${userId}/role`, { role });
  }

  // Settings
  getSettings(): Observable<Setting[]> {
    if (environment.enableMockData) {
      return this.mockData.getSettings();
    }
    // Backend returns { data: settingsMap, raw: settings[] }
    // Use getRaw to get full response without unwrapping
    return this.api.getRaw<{ data: Record<string, unknown>; raw: Setting[] }>('/admin/settings').pipe(
      map(response => response.raw || [])
    );
  }

  updateSetting(key: string, request: UpdateSettingRequest): Observable<Setting> {
    return this.api.patch<Setting>(`/admin/settings/${key}`, request);
  }

  // Audit Logs
  getAuditLogs(
    filters?: AuditLogFilters,
    page = 1,
    pageSize = 50
  ): Observable<PaginatedAuditLogs> {
    if (environment.enableMockData) {
      return this.mockData.getAuditLogs(filters, page, pageSize);
    }
    const params: Record<string, string | number | boolean> = { page, limit: pageSize };
    if (filters) {
      if (filters.userId) params['userId'] = filters.userId;
      if (filters.action) params['action'] = filters.action;
      if (filters.resource) params['resource'] = filters.resource;
      if (filters.dateFrom) params['dateFrom'] = filters.dateFrom;
      if (filters.dateTo) params['dateTo'] = filters.dateTo;
    }
    return this.api.getPaginated<AuditLog, PaginatedAuditLogs>('/admin/audit', 'logs', params);
  }

  // Inventory (Manager)
  getProducts(page = 1, pageSize = 20): Observable<{
    products: Product[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    return this.api.getPaginated<Product, {
      products: Product[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>('/manager/products', 'products', { page, limit: pageSize });
  }

  getProductById(productId: string): Observable<Product> {
    return this.api.get<Product>(`/manager/products/${productId}`);
  }

  updateProductStock(
    productId: string, 
    quantity: number, 
    reason: string,
    adjustmentType: 'RECEIVED' | 'SOLD' | 'RETURNED' | 'DAMAGED' | 'ADJUSTMENT' | 'TRANSFER' = 'ADJUSTMENT'
  ): Observable<{ product: Product; log: InventoryAdjustment }> {
    return this.api.post<{ product: Product; log: InventoryAdjustment }>('/manager/inventory/adjustments', {
      productId,
      quantity,
      reason,
      adjustmentType,
    });
  }

  getInventoryHistory(
    productId: string,
    page = 1,
    pageSize = 20
  ): Observable<{
    logs: InventoryAdjustment[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    if (environment.enableMockData) {
      return this.mockData.getInventoryAdjustments(productId, page, pageSize);
    }
    return this.api.getPaginated<InventoryAdjustment, {
      logs: InventoryAdjustment[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(`/manager/inventory/${productId}/history`, 'logs', { page, limit: pageSize });
  }

  getLowStockProducts(threshold = 10): Observable<Product[]> {
    return this.api.get<Product[]>('/manager/inventory/low-stock', { threshold });
  }
}

