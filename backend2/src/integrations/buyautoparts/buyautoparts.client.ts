import { config } from '../../config/index.js';
import { logger } from '../../config/logger.js';
import type {
  BuyAutoPartsOrderRequest,
  BuyAutoPartsOrderResponse,
  BuyAutoPartsInventoryRequest,
  BuyAutoPartsInventoryResponse,
  BuyAutoPartsOrderStatusResponse,
} from './buyautoparts.types.js';

/**
 * BuyAutoParts API Client
 * 
 * Low-level HTTP client for BuyAutoParts supplier API.
 */
export class BuyAutoPartsClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor() {
    this.baseUrl = config.suppliers.buyautoparts.apiUrl;
    this.apiKey = config.suppliers.buyautoparts.apiKey;
    this.timeout = config.suppliers.buyautoparts.timeoutMs;
  }

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return !!this.baseUrl && !!this.apiKey;
  }

  /**
   * Make authenticated request to BuyAutoParts API
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown,
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('BuyAutoParts API not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        logger.error({ endpoint, status: response.status, error }, 'BuyAutoParts API error');
        throw new Error(`BuyAutoParts API error: ${response.status} - ${error}`);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === 'AbortError') {
        throw new Error('BuyAutoParts API request timeout');
      }
      throw error;
    }
  }

  /**
   * Check inventory availability
   */
  async checkInventory(partNumbers: string[]): Promise<BuyAutoPartsInventoryResponse> {
    return this.request<BuyAutoPartsInventoryResponse>('POST', '/inventory/check', { partNumbers });
  }

  /**
   * Create a new order
   */
  async createOrder(order: BuyAutoPartsOrderRequest): Promise<BuyAutoPartsOrderResponse> {
    logger.info({ referenceNumber: order.referenceNumber, itemCount: order.lineItems.length }, 'Creating BuyAutoParts order');
    return this.request<BuyAutoPartsOrderResponse>('POST', '/orders', order);
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<BuyAutoPartsOrderStatusResponse> {
    return this.request<BuyAutoPartsOrderStatusResponse>('GET', `/orders/${orderId}`);
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<BuyAutoPartsOrderResponse> {
    return this.request<BuyAutoPartsOrderResponse>('DELETE', `/orders/${orderId}`, { reason });
  }
}

// Singleton instance
export const buyAutoPartsClient = new BuyAutoPartsClient();

