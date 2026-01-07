import { EntityManager } from '@mikro-orm/core';
import { apremiumClient } from './apremium.client.js';
import { mapOrderToAPremiumRequest } from './apremium.mapper.js';
import { logger } from '../../config/logger.js';
import type { SupplierService, SupplierSubmitResult, SupplierProduct } from '../supplier.interface.js';
import { Order, OrderItem, AffiliateProductMapping, AffiliateOrder, AffiliateOrderStatus } from '../../entities/index.js';

/**
 * A-Premium Supplier Service
 * 
 * Implements the SupplierService interface for A-Premium.
 */
export class APremiumService implements SupplierService {
  readonly code = 'APREMIUM';
  readonly name = 'A-Premium Auto Parts';

  constructor(private em: EntityManager) {}

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return apremiumClient.isConfigured();
  }

  /**
   * Search for products
   */
  async searchProducts(query: {
    sku?: string;
    make?: string;
    model?: string;
    year?: number;
  }): Promise<SupplierProduct[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const response = await apremiumClient.searchOffers(query);
      return response.items.map((item) => ({
        supplierCode: this.code,
        supplierSku: item.sku,
        name: item.name,
        description: item.description,
        price: item.price,
        inStock: item.inStock,
        stockQuantity: item.stockQuantity,
        estimatedShipDate: item.estimatedShipDate,
      }));
    } catch (error) {
      logger.error({ error, query }, 'Failed to search A-Premium products');
      return [];
    }
  }

  /**
   * Submit order to supplier
   */
  async submitOrder(
    order: Order,
    items: OrderItem[],
    affiliateOrder: AffiliateOrder,
  ): Promise<SupplierSubmitResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'A-Premium API not configured',
      };
    }

    try {
      // Get affiliate SKU mappings for these items
      const productIds = items.map((i) => i.product?.id).filter(Boolean) as string[];
      const mappings = await this.em.find(AffiliateProductMapping, {
        affiliate: affiliateOrder.affiliate,
        product: { $in: productIds },
      });

      const skuMap = new Map(mappings.map((m) => [m.product.id, m.affiliateSku]));

      // Map and submit order
      const request = mapOrderToAPremiumRequest(order, items, skuMap);
      const response = await apremiumClient.createOrder(request);

      if (response.success) {
        return {
          success: true,
          externalOrderId: response.orderId,
          trackingNumber: response.trackingNumber,
          estimatedDelivery: response.estimatedDelivery,
        };
      } else {
        return {
          success: false,
          error: response.error?.message ?? 'Unknown error',
          errorCode: response.error?.code,
        };
      }
    } catch (error) {
      logger.error({ error, orderId: order.id }, 'Failed to submit order to A-Premium');
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Check order status
   */
  async checkOrderStatus(externalOrderId: string): Promise<{
    status: string;
    trackingNumber?: string;
    trackingUrl?: string;
  } | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const response = await apremiumClient.getOrderStatus(externalOrderId);
      return {
        status: response.status,
        trackingNumber: response.trackingNumber,
        trackingUrl: response.trackingUrl,
      };
    } catch (error) {
      logger.error({ error, externalOrderId }, 'Failed to check A-Premium order status');
      return null;
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(externalOrderId: string, reason?: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const response = await apremiumClient.cancelOrder(externalOrderId, reason);
      return response.success;
    } catch (error) {
      logger.error({ error, externalOrderId }, 'Failed to cancel A-Premium order');
      return false;
    }
  }
}

export function createAPremiumService(em: EntityManager): APremiumService {
  return new APremiumService(em);
}

