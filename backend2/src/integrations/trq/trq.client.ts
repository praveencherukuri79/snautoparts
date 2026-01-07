import { config } from '../../config/index.js';
import { logger } from '../../config/logger.js';
import type {
  TRQOrderRequest,
  TRQOrderResponse,
  TRQCatalogSearchRequest,
  TRQCatalogSearchResponse,
  TRQOrderStatusResponse,
} from './trq.types.js';

/**
 * TRQ API Client
 * 
 * Low-level HTTP client for TRQ supplier API.
 */
export class TRQClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor() {
    this.baseUrl = config.suppliers.trq.apiUrl;
    this.apiKey = config.suppliers.trq.apiKey;
    this.timeout = config.suppliers.trq.timeoutMs;
  }

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return !!this.baseUrl && !!this.apiKey;
  }

  /**
   * Make authenticated request to TRQ API
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown,
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('TRQ API not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApiKey ${this.apiKey}`,
          'Accept': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        logger.error({ endpoint, status: response.status, error }, 'TRQ API error');
        throw new Error(`TRQ API error: ${response.status} - ${error}`);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === 'AbortError') {
        throw new Error('TRQ API request timeout');
      }
      throw error;
    }
  }

  /**
   * Search catalog
   */
  async searchCatalog(params: TRQCatalogSearchRequest): Promise<TRQCatalogSearchResponse> {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.set('q', params.query);
    if (params.sku) queryParams.set('sku', params.sku);
    if (params.vehicleMake) queryParams.set('make', params.vehicleMake);
    if (params.vehicleModel) queryParams.set('model', params.vehicleModel);
    if (params.vehicleYear) queryParams.set('year', params.vehicleYear.toString());
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());

    return this.request<TRQCatalogSearchResponse>(
      'GET',
      `/catalog/search?${queryParams.toString()}`,
    );
  }

  /**
   * Create a new order
   */
  async createOrder(order: TRQOrderRequest): Promise<TRQOrderResponse> {
    logger.info({ poNumber: order.poNumber, itemCount: order.items.length }, 'Creating TRQ order');
    return this.request<TRQOrderResponse>('POST', '/orders', order);
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<TRQOrderStatusResponse> {
    return this.request<TRQOrderStatusResponse>('GET', `/orders/${orderId}`);
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<TRQOrderResponse> {
    return this.request<TRQOrderResponse>('POST', `/orders/${orderId}/cancel`, { reason });
  }
}

// Singleton instance
export const trqClient = new TRQClient();

