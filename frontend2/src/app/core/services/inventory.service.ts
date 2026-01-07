import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import {
  InventoryItem,
  InventoryItemDetail,
  InventoryAdjustment,
  InventoryLog,
  LowStockAlert,
  InventoryImportResult,
  PaginatedResponse,
  PaginationParams,
  Product,
  StockAdjustment,
} from '../models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private api = inject(ApiService);

  // Get paginated inventory list
  async getInventory(params?: PaginationParams & {
    status?: string;
    categoryId?: string;
    q?: string;
  }): Promise<PaginatedResponse<InventoryItem>> {
    const queryParams = this.buildQueryParams(params);
    return this.api.get<PaginatedResponse<InventoryItem>>(`/inventory?${queryParams}`);
  }

  // Get single product inventory (with extended details)
  async getProductInventory(productId: string): Promise<InventoryItemDetail> {
    return this.api.get<InventoryItemDetail>(`/inventory/${productId}`);
  }

  // Get inventory history for a product
  async getInventoryHistory(productId: string, params?: PaginationParams): Promise<PaginatedResponse<InventoryLog>> {
    const queryParams = this.buildQueryParams(params);
    return this.api.get<PaginatedResponse<InventoryLog>>(`/inventory/${productId}/history?${queryParams}`);
  }

  // Get low stock alerts
  async getLowStockAlerts(): Promise<LowStockAlert[]> {
    const response = await this.api.get<{ data: LowStockAlert[] }>('/inventory/alerts');
    return response.data;
  }

  // Check if there are low stock alerts (for nav badge)
  async hasLowStockAlerts(): Promise<boolean> {
    const response = await this.api.get<{ hasAlerts: boolean }>('/inventory/has-alerts');
    return response.hasAlerts;
  }

  // Create inventory adjustment
  async adjustInventory(adjustment: InventoryAdjustment): Promise<InventoryLog> {
    return this.api.post<InventoryLog>('/inventory/adjustments', adjustment);
  }

  // Bulk inventory adjustment
  async bulkAdjustInventory(adjustments: InventoryAdjustment[]): Promise<InventoryLog[]> {
    return this.api.post<InventoryLog[]>('/inventory/adjustments/bulk', { adjustments });
  }

  // Import inventory from XLSX file
  async importInventory(file: File): Promise<InventoryImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    return this.api.upload<InventoryImportResult>('/inventory/import', formData);
  }

  // Download import template
  async downloadImportTemplate(): Promise<Blob> {
    return this.api.download('/inventory/import/template');
  }

  // Export inventory to XLSX
  async exportInventory(format: 'xlsx' | 'csv' = 'xlsx'): Promise<Blob> {
    return this.api.download(`/inventory/export?format=${format}`);
  }

  // Get low stock products
  async getLowStockProducts(): Promise<Product[]> {
    const response = await this.api.get<{ data: Product[] }>('/inventory/low-stock');
    return response.data;
  }

  // Get recent inventory logs
  async getRecentLogs(): Promise<InventoryLog[]> {
    const response = await this.api.get<{ data: InventoryLog[] }>('/inventory/logs/recent');
    return response.data;
  }

  // Get product adjustment logs
  async getProductAdjustmentLogs(productId: string, params?: PaginationParams): Promise<PaginatedResponse<InventoryLog>> {
    const queryParams = this.buildQueryParams(params);
    return this.api.get<PaginatedResponse<InventoryLog>>(`/inventory/${productId}/adjustments?${queryParams}`);
  }

  // Adjust stock
  async adjustStock(adjustment: StockAdjustment): Promise<InventoryLog> {
    return this.api.post<InventoryLog>('/inventory/adjustments', adjustment);
  }

  // Build query params
  private buildQueryParams<T extends object>(params?: T): string {
    if (!params) return '';

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  }
}

