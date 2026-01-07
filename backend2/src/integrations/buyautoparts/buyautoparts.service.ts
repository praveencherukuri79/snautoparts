import { EntityManager } from '@mikro-orm/core';
import { buyAutoPartsClient } from './buyautoparts.client.js';
import { mapOrderToBuyAutoPartsRequest } from './buyautoparts.mapper.js';
import { logger } from '../../config/logger.js';
import type { SupplierService, SupplierSubmitResult, SupplierProduct } from '../supplier.interface.js';
import { Order, OrderItem, AffiliateProductMapping, AffiliateOrder } from '../../entities/index.js';

/**
 * BuyAutoParts Supplier Service
 * 
 * Implements the SupplierService interface for BuyAutoParts.
 */
export class BuyAutoPartsService implements SupplierService {
  readonly code = 'BUYAUTOPARTS';
  readonly name = 'BuyAutoParts';

  constructor(private em: EntityManager) {}

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return buyAutoPartsClient.isConfigured();
  }

  /**
   * Search for products (check inventory)
   */
  async searchProducts(query: {
    sku?: string;
    make?: string;
    model?: string;
    year?: number;
  }): Promise<SupplierProduct[]> {
    if (!this.isAvailable() || !query.sku) {
      return [];
    }

    try {
      const response = await buyAutoPartsClient.checkInventory([query.sku]);
      return response.items.map((item) => ({
        supplierCode: this.code,
        supplierSku: item.partNumber,
        name: item.partNumber, // BuyAutoParts doesn't return name in inventory check
        price: item.price,
        inStock: item.available,
        stockQuantity: item.quantity,
        estimatedShipDate: item.estimatedShipDate,
      }));
    } catch (error) {
      logger.error({ error, query }, 'Failed to search BuyAutoParts products');
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
        error: 'BuyAutoParts API not configured',
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
      const request = mapOrderToBuyAutoPartsRequest(order, items, skuMap);
      const response = await buyAutoPartsClient.createOrder(request);

      if (response.status === 'success') {
        return {
          success: true,
          externalOrderId: response.orderId,
          trackingNumber: response.tracking?.number,
        };
      } else {
        return {
          success: false,
          error: response.error?.message ?? 'Unknown error',
          errorCode: response.error?.code,
        };
      }
    } catch (error) {
      logger.error({ error, orderId: order.id }, 'Failed to submit order to BuyAutoParts');
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
      const response = await buyAutoPartsClient.getOrderStatus(externalOrderId);
      if (response.status === 'success' && response.order) {
        return {
          status: response.order.status,
          trackingNumber: response.order.tracking?.number,
          trackingUrl: response.order.tracking?.url,
        };
      }
      return null;
    } catch (error) {
      logger.error({ error, externalOrderId }, 'Failed to check BuyAutoParts order status');
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
      const response = await buyAutoPartsClient.cancelOrder(externalOrderId, reason);
      return response.status === 'success';
    } catch (error) {
      logger.error({ error, externalOrderId }, 'Failed to cancel BuyAutoParts order');
      return false;
    }
  }
}

export function createBuyAutoPartsService(em: EntityManager): BuyAutoPartsService {
  return new BuyAutoPartsService(em);
}

