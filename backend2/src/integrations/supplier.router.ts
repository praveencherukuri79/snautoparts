import { EntityManager } from '@mikro-orm/core';
import { Order, AffiliateProductMapping, OrderItem, AffiliateOrder } from '../entities/index.js';
import {
  SupplierService,
  SupplierSubmitResult,
  SupplierAddress,
} from './supplier.interface.js';
import { logger } from '../config/logger.js';
import { APremiumService } from './a-premium/apremium.service.js';
import { BuyAutoPartsService } from './buyautoparts/buyautoparts.service.js';
import { TRQService } from './trq/trq.service.js';

/**
 * Order line with supplier information
 */
interface OrderLineWithSupplier {
  supplierId: string;
  supplierSku: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
}

/**
 * Supplier Router
 * 
 * Routes orders to the appropriate supplier integration based on
 * product-affiliate mappings. Handles order splitting when products
 * are from different suppliers.
 */
export class SupplierRouter {
  private suppliers: Map<string, SupplierService> = new Map();
  private initialized = false;

  /**
   * Initialize supplier integrations with EntityManager
   */
  initialize(em: EntityManager): void {
    if (this.initialized) {
      return;
    }

    // Register A-Premium integration
    const aPremium = new APremiumService(em);
    if (aPremium.isAvailable()) {
      this.suppliers.set(aPremium.code, aPremium);
      logger.info({ code: aPremium.code, name: aPremium.name }, 'Registered supplier integration');
    } else {
      logger.warn({ code: 'APREMIUM' }, 'Supplier integration not available (missing configuration)');
    }

    // Register BuyAutoParts integration
    const buyAutoParts = new BuyAutoPartsService(em);
    if (buyAutoParts.isAvailable()) {
      this.suppliers.set(buyAutoParts.code, buyAutoParts);
      logger.info({ code: buyAutoParts.code, name: buyAutoParts.name }, 'Registered supplier integration');
    } else {
      logger.warn({ code: 'BUYAUTOPARTS' }, 'Supplier integration not available (missing configuration)');
    }

    // Register TRQ integration
    const trq = new TRQService(em);
    if (trq.isAvailable()) {
      this.suppliers.set(trq.code, trq);
      logger.info({ code: trq.code, name: trq.name }, 'Registered supplier integration');
    } else {
      logger.warn({ code: 'TRQ' }, 'Supplier integration not available (missing configuration)');
    }

    this.initialized = true;
    logger.info(
      { suppliers: this.getRegisteredSuppliers() },
      'Supplier integrations initialized',
    );
  }

  /**
   * Register a supplier service
   */
  register(service: SupplierService): void {
    if (!service.isAvailable()) {
      logger.warn(
        { code: service.code },
        'Supplier integration not available (missing configuration)',
      );
      return;
    }

    this.suppliers.set(service.code, service);
    logger.info(
      { code: service.code, name: service.name },
      'Registered supplier integration',
    );
  }

  /**
   * Get a registered supplier service
   */
  getSupplier(code: string): SupplierService | undefined {
    return this.suppliers.get(code);
  }

  /**
   * Get all registered supplier codes
   */
  getRegisteredSuppliers(): string[] {
    return Array.from(this.suppliers.keys());
  }

  /**
   * Submit order to appropriate supplier
   */
  async submitOrderToSupplier(
    order: Order,
    items: OrderItem[],
    affiliateOrder: AffiliateOrder,
    supplierCode: string,
  ): Promise<SupplierSubmitResult> {
    const supplier = this.suppliers.get(supplierCode);

    if (!supplier) {
      logger.error(
        { supplierCode, orderNumber: order.orderNumber },
        'Unknown supplier - cannot submit order',
      );
      return {
        success: false,
        error: `Unknown supplier: ${supplierCode}`,
      };
    }

    try {
      const result = await supplier.submitOrder(order, items, affiliateOrder);
      
      logger.info(
        {
          supplierCode,
          externalOrderId: result.externalOrderId,
          success: result.success,
          orderNumber: order.orderNumber,
        },
        'Submitted order to supplier',
      );

      return result;
    } catch (error) {
      logger.error(
        {
          supplierCode,
          orderNumber: order.orderNumber,
          error: error instanceof Error ? error.message : String(error),
        },
        'Failed to submit order to supplier',
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check order status with supplier
   */
  async checkOrderStatus(
    supplierCode: string,
    externalOrderId: string,
  ): Promise<{ status: string; trackingNumber?: string; trackingUrl?: string } | null> {
    const supplier = this.suppliers.get(supplierCode);

    if (!supplier) {
      logger.warn({ supplierCode, externalOrderId }, 'Unknown supplier for status check');
      return null;
    }

    try {
      return await supplier.checkOrderStatus(externalOrderId);
    } catch (error) {
      logger.error(
        { supplierCode, externalOrderId, error: error instanceof Error ? error.message : String(error) },
        'Failed to check supplier order status',
      );
      return null;
    }
  }

  /**
   * Cancel order with supplier
   */
  async cancelOrder(
    supplierCode: string,
    externalOrderId: string,
    reason?: string,
  ): Promise<boolean> {
    const supplier = this.suppliers.get(supplierCode);

    if (!supplier) {
      logger.warn({ supplierCode, externalOrderId }, 'Unknown supplier for cancellation');
      return false;
    }

    try {
      return await supplier.cancelOrder(externalOrderId, reason);
    } catch (error) {
      logger.error(
        { supplierCode, externalOrderId, error: error instanceof Error ? error.message : String(error) },
        'Failed to cancel supplier order',
      );
      return false;
    }
  }
}

// Global supplier router instance
export const supplierRouter = new SupplierRouter();

/**
 * Initialize supplier integrations
 * 
 * Call this during server startup with the EntityManager
 */
export async function initializeSupplierIntegrations(em: EntityManager): Promise<void> {
  supplierRouter.initialize(em);
}
