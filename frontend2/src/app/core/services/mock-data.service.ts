/**
 * MockDataService
 *
 * Centralized mock data service that intercepts API requests when
 * `environment.enableMockData` is true.
 *
 * Usage: Inject this service and call `mockEndpoint()` to get mock data
 * for a given endpoint. Returns null if mock data is disabled or no
 * mock handler exists for the endpoint.
 */

import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import * as MockData from './mock-data';

// Helper type for paginated responses
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Helper to create paginated response
function paginate<T>(items: T[], page: number = 1, limit: number = 20): PaginatedResponse<T> {
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedItems = items.slice(start, end);

  return {
    data: paginatedItems,
    meta: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
    },
  };
}

// Helper to wrap in data response
function wrap<T>(data: T): { data: T } {
  return { data };
}

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private readonly useMockData = environment.enableMockData;

  /**
   * Check if mock data is enabled
   */
  isEnabled(): boolean {
    return this.useMockData;
  }

  /**
   * Get mock data for an endpoint
   * Returns null if mock data is disabled or no handler exists
   */
  mockEndpoint<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): T | null {
    if (!this.useMockData) return null;

    // Remove leading slash and query params for matching
    const cleanEndpoint = endpoint.split('?')[0].replace(/^\//, '');

    // Find matching handler
    const handler = this.findHandler(cleanEndpoint, params);
    if (!handler) {
      console.warn(`[MockData] No handler for endpoint: ${endpoint}`);
      return null;
    }

    console.log(`[MockData] Mocking endpoint: ${endpoint}`);
    return handler() as T;
  }

  /**
   * Find the appropriate mock handler for an endpoint
   */
  private findHandler(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): (() => unknown) | null {
    // Static endpoint mappings
    const handlers: Record<string, () => unknown> = {
      // Catalog
      'catalog/categories': () => wrap(MockData.generateCategories()),
      'catalog/brands': () => wrap(MockData.generateBrands()),
      'catalog/products': () => paginate(MockData.generateProducts(50), Number(params?.['page']) || 1, Number(params?.['limit']) || 20),
      'catalog/products/featured': () => wrap(MockData.generateFeaturedProducts()),
      'catalog/fitment/makes': () => wrap(MockData.generateFitmentMakes()),
      'catalog/search': () => paginate(MockData.generateProducts(20)),

      // Orders
      'orders': () => paginate(MockData.generateOrders(50), Number(params?.['page']) || 1, Number(params?.['limit']) || 20),
      'orders/statistics': () => wrap(MockData.generateOrderStatistics()),
      'orders/pending-count': () => wrap({ count: 23 }),

      // Users
      'users': () => paginate(MockData.generateUsers(50), Number(params?.['page']) || 1, Number(params?.['limit']) || 20),
      'users/roles': () => wrap(MockData.generateRoles()),

      // Profile
      'profile': () => wrap(MockData.generateUser('user-1')),
      'profile/addresses': () => wrap([
        { id: 'addr-1', firstName: 'John', lastName: 'Smith', address1: '123 Main St', city: 'Detroit', state: 'MI', postalCode: '48201', country: 'US', isDefault: true },
      ]),
      'profile/vehicles': () => wrap([
        { id: 'vehicle-1', nickname: 'My Truck', year: 2022, make: 'Ford', model: 'F-150', isDefault: true },
        { id: 'vehicle-2', nickname: 'Family Car', year: 2020, make: 'Toyota', model: 'Camry', isDefault: false },
      ]),

      // Inventory
      'inventory': () => paginate(MockData.generateInventoryItems(50), Number(params?.['page']) || 1, Number(params?.['limit']) || 20),
      'inventory/alerts': () => wrap(MockData.generateLowStockAlerts()),
      'inventory/has-alerts': () => wrap({ hasAlerts: true }),

      // Drop-ship / Affiliates
      'dropship/orders': () => {
        const status = params?.['status'] as 'PENDING' | 'FAILED' | undefined;
        return wrap(MockData.generateAffiliateOrders(status));
      },
      'affiliates': () => wrap(MockData.generateAffiliates()),

      // Settings
      'settings': () => {
        const category = params?.['category'] as string | undefined;
        if (category === 'shipping') return wrap(MockData.generateShippingSettings());
        if (category === 'tax') return wrap(MockData.generateTaxSettings());
        return wrap(MockData.generateGeneralSettings());
      },
      'settings/shipping/zones': () => wrap(MockData.generateShippingZones()),
      'settings/tax/rates': () => wrap(MockData.generateTaxRates()),
      'settings/tax/exemptions': () => wrap(MockData.generateTaxExemptions()),
      'settings/integrations': () => wrap(MockData.generateIntegrations()),
      'webhooks': () => wrap(MockData.generateWebhooks()),

      // Reports
      'reports/sales': () => wrap(MockData.generateSalesReport(Number(params?.['days']) || 30)),
      'reports/order-statistics': () => wrap(MockData.generateOrderStatistics()),
      'reports/inventory-value': () => wrap(MockData.generateInventoryReport()),
      'reports/gmv': () => wrap(MockData.generateGMVReport()),

      // Audit
      'audit': () => paginate([
        { id: '1', action: 'order.created', userId: 'user-1', userName: 'John Smith', details: { orderId: 'order-1' }, createdAt: new Date().toISOString() },
        { id: '2', action: 'inventory.adjusted', userId: 'user-3', userName: 'Manager', details: { productId: 'prod-1', change: 10 }, createdAt: new Date().toISOString() },
      ]),
      'audit/statistics': () => wrap({
        totalActions: 1247,
        actionsToday: 45,
        uniqueUsers: 12,
        topActions: [
          { action: 'order.created', count: 456 },
          { action: 'product.viewed', count: 312 },
          { action: 'inventory.adjusted', count: 89 },
        ],
      }),

      // Cart
      'cart': () => wrap({
        id: 'cart-1',
        items: [
          { id: 'item-1', productId: 'prod-1', productName: 'Brake Pads', quantity: 2, unitPrice: 45.99, total: 91.98 },
        ],
        subtotal: 91.98,
        itemCount: 2,
      }),
      'cart/count': () => wrap({ count: 2 }),
    };

    // Check for exact match
    if (handlers[endpoint]) {
      return handlers[endpoint];
    }

    // Check for dynamic routes (e.g., products/:id, orders/:id)
    const dynamicHandlers = this.getDynamicHandlers(endpoint, params);
    if (dynamicHandlers) {
      return dynamicHandlers;
    }

    return null;
  }

  /**
   * Handle dynamic routes with path parameters
   */
  private getDynamicHandlers(
    endpoint: string,
    _params?: Record<string, string | number | boolean>
  ): (() => unknown) | null {
    // Match catalog/products/:slug
    if (endpoint.match(/^catalog\/products\/[\w-]+$/)) {
      return () => wrap(MockData.generateProducts(1)[0]);
    }

    // Match orders/:id
    if (endpoint.match(/^orders\/[\w-]+$/) && !endpoint.includes('statistics')) {
      const orderId = endpoint.split('/')[1];
      return () => {
        const orders = MockData.generateOrders(20);
        return wrap(orders.find(o => o.id === orderId) || orders[0]);
      };
    }

    // Match orders/track/:orderNumber
    if (endpoint.match(/^orders\/track\/[\w-]+$/)) {
      const orderNumber = endpoint.split('/')[2];
      return () => wrap(MockData.generateOrderTrackingResult(orderNumber));
    }

    // Match users/:id
    if (endpoint.match(/^users\/[\w-]+$/)) {
      const userId = endpoint.split('/')[1];
      return () => wrap(MockData.generateUser(userId));
    }

    // Match inventory/:productId
    if (endpoint.match(/^inventory\/[\w-]+$/) && !endpoint.includes('alerts')) {
      return () => {
        const items = MockData.generateInventoryItems(20);
        return wrap(items[0]);
      };
    }

    // Match inventory/:productId/history
    if (endpoint.match(/^inventory\/[\w-]+\/history$/)) {
      const productId = endpoint.split('/')[1];
      return () => wrap(MockData.generateInventoryHistory(productId));
    }

    // Match affiliates/:id
    if (endpoint.match(/^affiliates\/[\w-]+$/)) {
      const affiliateId = endpoint.split('/')[1];
      return () => wrap(MockData.generateAffiliate(affiliateId));
    }

    // Match affiliates/:id/products
    if (endpoint.match(/^affiliates\/[\w-]+\/products$/)) {
      const affiliateId = endpoint.split('/')[1];
      return () => wrap(MockData.generateAffiliateProductMappings(affiliateId));
    }

    // Match catalog/fitment/models (with make param)
    if (endpoint === 'catalog/fitment/models') {
      return () => wrap(MockData.generateFitmentModels('Ford'));
    }

    // Match catalog/fitment/years
    if (endpoint === 'catalog/fitment/years') {
      return () => wrap(MockData.generateFitmentYears());
    }

    return null;
  }
}

