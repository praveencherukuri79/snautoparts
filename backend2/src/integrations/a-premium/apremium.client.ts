import { config } from '../../config/index.js';
import { logger } from '../../config/logger.js';
import type {
  APremiumOrderRequest,
  APremiumOrderResponse,
  APremiumOfferSearchRequest,
  APremiumOfferSearchResponse,
  APremiumOrderStatusResponse,
} from './apremium.types.js';

/**
 * A-Premium API Client
 * 
 * Low-level HTTP client for A-Premium supplier API.
 */
export class APremiumClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor() {
    this.baseUrl = config.suppliers.apremium.apiUrl;
    this.apiKey = config.suppliers.apremium.apiKey;
    this.timeout = config.suppliers.apremium.timeoutMs;
  }

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return !!this.baseUrl && !!this.apiKey;
  }

  /**
   * Make authenticated request to A-Premium API
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown,
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('A-Premium API not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Api-Version': '1.0',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        logger.error({ endpoint, status: response.status, error }, 'A-Premium API error');
        throw new Error(`A-Premium API error: ${response.status} - ${error}`);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === 'AbortError') {
        throw new Error('A-Premium API request timeout');
      }
      throw error;
    }
  }

  /**
   * Search for available offers
   */
  async searchOffers(params: APremiumOfferSearchRequest): Promise<APremiumOfferSearchResponse> {
    const queryParams = new URLSearchParams();
    if (params.sku) queryParams.set('sku', params.sku);
    if (params.make) queryParams.set('make', params.make);
    if (params.model) queryParams.set('model', params.model);
    if (params.year) queryParams.set('year', params.year.toString());
    if (params.category) queryParams.set('category', params.category);

    return this.request<APremiumOfferSearchResponse>(
      'GET',
      `/offers/search?${queryParams.toString()}`,
    );
  }

  /**
   * Create a new order
   */
  async createOrder(order: APremiumOrderRequest): Promise<APremiumOrderResponse> {
    logger.info({ orderNumber: order.orderNumber, itemCount: order.items.length }, 'Creating A-Premium order');
    return this.request<APremiumOrderResponse>('POST', '/orders', order);
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<APremiumOrderStatusResponse> {
    return this.request<APremiumOrderStatusResponse>('GET', `/orders/${orderId}/status`);
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<APremiumOrderResponse> {
    return this.request<APremiumOrderResponse>('POST', `/orders/${orderId}/cancel`, { reason });
  }
}

// Singleton instance
export const apremiumClient = new APremiumClient();

