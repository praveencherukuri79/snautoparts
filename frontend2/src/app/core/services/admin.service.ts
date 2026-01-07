import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import {
  AppSetting,
  Setting,
  SettingUpdate,
  AuditLog,
  AuditLogFilters,
  AuditStatistics,
  Affiliate,
  AffiliateOrder,
  AffiliateFormData,
  AffiliateProductMapping,
  Webhook,
  WebhookFormData,
  SalesReport,
  CategoryReport,
  InventoryValueReport,
  GMVReport,
  TopProductsReport,
  PaginatedResponse,
  DateRangeParams,
} from '../models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = inject(ApiService);

  // ============================================
  // Settings
  // ============================================

  async getSettings(category?: string): Promise<AppSetting[]> {
    const params = category ? `?category=${category}` : '';
    const response = await this.api.get<{ data: AppSetting[] }>(`/settings${params}`);
    return response.data;
  }

  async getSetting(key: string): Promise<AppSetting> {
    return this.api.get<AppSetting>(`/settings/${key}`);
  }

  async updateSetting(key: string, value: unknown): Promise<AppSetting> {
    return this.api.put<AppSetting>(`/settings/${key}`, { value });
  }

  async bulkUpdateSettings(updates: SettingUpdate[]): Promise<AppSetting[]> {
    return this.api.post<AppSetting[]>('/settings/bulk', { updates });
  }

  // ============================================
  // Audit Logs
  // ============================================

  async getAuditLogs(filters?: AuditLogFilters): Promise<PaginatedResponse<AuditLog>> {
    const params = this.buildQueryParams(filters);
    return this.api.get<PaginatedResponse<AuditLog>>(`/audit?${params}`);
  }

  async getAuditStatistics(): Promise<AuditStatistics> {
    return this.api.get<AuditStatistics>('/audit/statistics');
  }

  async exportAuditLogs(filters?: AuditLogFilters): Promise<Blob> {
    const params = this.buildQueryParams(filters);
    return this.api.download(`/audit/export?${params}`);
  }

  // ============================================
  // Affiliates
  // ============================================

  async getAffiliates(): Promise<Affiliate[]> {
    const response = await this.api.get<{ data: Affiliate[] }>('/affiliates');
    return response.data;
  }

  async getAffiliate(affiliateId: string): Promise<Affiliate> {
    return this.api.get<Affiliate>(`/affiliates/${affiliateId}`);
  }

  async createAffiliate(data: AffiliateFormData): Promise<Affiliate> {
    return this.api.post<Affiliate>('/affiliates', data);
  }

  async updateAffiliate(affiliateId: string, data: Partial<AffiliateFormData>): Promise<Affiliate> {
    return this.api.patch<Affiliate>(`/affiliates/${affiliateId}`, data);
  }

  async deleteAffiliate(affiliateId: string): Promise<void> {
    await this.api.delete(`/affiliates/${affiliateId}`);
  }

  async toggleAffiliate(affiliateId: string, enabled: boolean): Promise<Affiliate> {
    return this.api.patch<Affiliate>(`/affiliates/${affiliateId}`, { isEnabled: enabled });
  }

  async getPendingDropshipOrders(): Promise<AffiliateOrder[]> {
    const response = await this.api.get<{ data: AffiliateOrder[] }>('/dropship/orders?status=PENDING');
    return response.data;
  }

  async getFailedDropshipOrders(): Promise<AffiliateOrder[]> {
    const response = await this.api.get<{ data: AffiliateOrder[] }>('/dropship/orders?status=FAILED');
    return response.data;
  }

  async retryDropshipOrder(orderId: string): Promise<AffiliateOrder> {
    return this.api.post<AffiliateOrder>(`/dropship/orders/${orderId}/retry`, {});
  }

  async getAffiliateProducts(affiliateId: string): Promise<AffiliateProductMapping[]> {
    const response = await this.api.get<{ data: AffiliateProductMapping[] }>(
      `/affiliates/${affiliateId}/products`
    );
    return response.data;
  }

  async addAffiliateProductMapping(
    affiliateId: string,
    mapping: Omit<AffiliateProductMapping, 'id' | 'affiliateId'>
  ): Promise<AffiliateProductMapping> {
    return this.api.post<AffiliateProductMapping>(`/affiliates/${affiliateId}/products`, mapping);
  }

  async removeAffiliateProductMapping(affiliateId: string, mappingId: string): Promise<void> {
    await this.api.delete(`/affiliates/${affiliateId}/products/${mappingId}`);
  }

  async syncAffiliate(affiliateId: string): Promise<{ success: boolean; message?: string }> {
    return this.api.post<{ success: boolean; message?: string }>(`/affiliates/${affiliateId}/sync`, {});
  }

  // ============================================
  // Webhooks
  // ============================================

  async getWebhooks(): Promise<Webhook[]> {
    const response = await this.api.get<{ data: Webhook[] }>('/webhooks');
    return response.data;
  }

  async getWebhook(webhookId: string): Promise<Webhook> {
    return this.api.get<Webhook>(`/webhooks/${webhookId}`);
  }

  async createWebhook(data: WebhookFormData): Promise<Webhook> {
    return this.api.post<Webhook>('/webhooks', data);
  }

  async updateWebhook(webhookId: string, data: Partial<WebhookFormData>): Promise<Webhook> {
    return this.api.patch<Webhook>(`/webhooks/${webhookId}`, data);
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    await this.api.delete(`/webhooks/${webhookId}`);
  }

  async testWebhook(webhookId: string): Promise<{ success: boolean; response?: unknown }> {
    return this.api.post<{ success: boolean; response?: unknown }>(`/webhooks/${webhookId}/test`, {});
  }

  // ============================================
  // Reports
  // ============================================

  async getSalesReport(params?: DateRangeParams & { period?: 'day' | 'week' | 'month' }): Promise<SalesReport> {
    const queryParams = this.buildQueryParams(params);
    return this.api.get<SalesReport>(`/reports/sales?${queryParams}`);
  }

  async exportSalesReport(params?: DateRangeParams): Promise<Blob> {
    const queryParams = this.buildQueryParams(params);
    return this.api.download(`/reports/sales/export?${queryParams}`);
  }

  async getCategoryReport(params?: DateRangeParams): Promise<CategoryReport> {
    const queryParams = this.buildQueryParams(params);
    return this.api.get<CategoryReport>(`/reports/categories?${queryParams}`);
  }

  async getInventoryValueReport(): Promise<InventoryValueReport> {
    return this.api.get<InventoryValueReport>('/reports/inventory-value');
  }

  async getGMVReport(params?: DateRangeParams): Promise<GMVReport> {
    const queryParams = this.buildQueryParams(params);
    return this.api.get<GMVReport>(`/reports/gmv?${queryParams}`);
  }

  async getTopProductsReport(params?: DateRangeParams & { limit?: number }): Promise<TopProductsReport> {
    const queryParams = this.buildQueryParams(params);
    return this.api.get<TopProductsReport>(`/reports/top-products?${queryParams}`);
  }

  async getReport(days: number): Promise<{
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    topProducts: Array<{ name: string; quantity: number; revenue: number }>;
    ordersByStatus: Record<string, number>;
    revenueByDay: Array<{ date: string; revenue: number }>;
  }> {
    return this.api.get(`/reports/summary?days=${days}`);
  }

  async updateSettings(updates: Array<{ key: string; value: string }>): Promise<Setting[]> {
    return this.api.post<Setting[]>('/settings/bulk', { updates });
  }

  // ============================================
  // Settings - Shipping
  // ============================================

  async getShippingZones(): Promise<unknown[]> {
    return this.api.get<unknown[]>('/settings/shipping/zones');
  }

  async createShippingZone(data: unknown): Promise<unknown> {
    return this.api.post<unknown>('/settings/shipping/zones', data);
  }

  async updateShippingZone(zoneId: string, data: unknown): Promise<unknown> {
    return this.api.patch<unknown>(`/settings/shipping/zones/${zoneId}`, data);
  }

  async deleteShippingZone(zoneId: string): Promise<void> {
    await this.api.delete(`/settings/shipping/zones/${zoneId}`);
  }

  // ============================================
  // Settings - Tax
  // ============================================

  async getTaxRates(): Promise<unknown[]> {
    return this.api.get<unknown[]>('/settings/tax/rates');
  }

  async getTaxExemptions(): Promise<unknown[]> {
    return this.api.get<unknown[]>('/settings/tax/exemptions');
  }

  async createTaxRate(data: unknown): Promise<unknown> {
    return this.api.post<unknown>('/settings/tax/rates', data);
  }

  async updateTaxRate(rateId: string, data: unknown): Promise<unknown> {
    return this.api.patch<unknown>(`/settings/tax/rates/${rateId}`, data);
  }

  async deleteTaxRate(rateId: string): Promise<void> {
    await this.api.delete(`/settings/tax/rates/${rateId}`);
  }

  // ============================================
  // Settings - Integrations
  // ============================================

  async getIntegrations(): Promise<unknown[]> {
    return this.api.get<unknown[]>('/settings/integrations');
  }

  async updateIntegration(integrationId: string, data: unknown): Promise<unknown> {
    return this.api.patch<unknown>(`/settings/integrations/${integrationId}`, data);
  }

  async testIntegration(integrationId: string): Promise<{ success: boolean; message?: string }> {
    return this.api.post<{ success: boolean; message?: string }>(`/settings/integrations/${integrationId}/test`, {});
  }

  // Build query params - accepts any object with string keys
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

