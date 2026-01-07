import { EntityManager } from '@mikro-orm/core';
import { trqClient } from './trq.client.js';
import { mapOrderToTRQRequest } from './trq.mapper.js';
import { logger } from '../../config/logger.js';
import type { SupplierService, SupplierSubmitResult, SupplierProduct } from '../supplier.interface.js';
import { Order, OrderItem, AffiliateProductMapping, AffiliateOrder } from '../../entities/index.js';

/**
 * TRQ Supplier Service
 * 
 * Implements the SupplierService interface for TRQ.
 */
export class TRQService implements SupplierService {
  readonly code = 'TRQ';
  readonly name = 'TRQ Auto Parts';

  constructor(private em: EntityManager) {}

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return trqClient.isConfigured();
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
      const response = await trqClient.searchCatalog({
        sku: query.sku,
        vehicleMake: query.make,
        vehicleModel: query.model,
        vehicleYear: query.year,
      });

      if (!response.success || !response.data) {
        return [];
      }

      return response.data.items.map((item) => ({
        supplierCode: this.code,
        supplierSku: item.sku,
        name: item.name,
        description: item.description,
        price: item.cost,
        inStock: item.inStock,
        stockQuantity: item.stockQty,
      }));
    } catch (error) {
      logger.error({ error, query }, 'Failed to search TRQ products');
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
        error: 'TRQ API not configured',
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
      const request = mapOrderToTRQRequest(order, items, skuMap);
      const response = await trqClient.createOrder(request);

      if (response.success && response.data) {
        return {
          success: true,
          externalOrderId: response.data.orderId,
          trackingNumber: response.data.trackingInfo?.trackingNumber,
          estimatedDelivery: response.data.trackingInfo?.estimatedDelivery,
        };
      } else {
        return {
          success: false,
          error: response.error?.message ?? 'Unknown error',
          errorCode: response.error?.code,
        };
      }
    } catch (error) {
      logger.error({ error, orderId: order.id }, 'Failed to submit order to TRQ');
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
      const response = await trqClient.getOrderStatus(externalOrderId);
      if (response.success && response.data) {
        return {
          status: response.data.status,
          trackingNumber: response.data.tracking?.trackingNumber,
          trackingUrl: response.data.tracking?.trackingUrl,
        };
      }
      return null;
    } catch (error) {
      logger.error({ error, externalOrderId }, 'Failed to check TRQ order status');
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
      const response = await trqClient.cancelOrder(externalOrderId, reason);
      return response.success;
    } catch (error) {
      logger.error({ error, externalOrderId }, 'Failed to cancel TRQ order');
      return false;
    }
  }
}

export function createTRQService(em: EntityManager): TRQService {
  return new TRQService(em);
}

