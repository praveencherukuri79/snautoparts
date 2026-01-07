import { EntityManager } from '@mikro-orm/core';
import { Product, InventoryLog, InventoryAdjustmentType, User } from '../entities/index.js';
import { NotFoundError } from '../plugins/error-handler.js';
import { parseInventoryXlsx, ParseResult } from '../utils/xlsx-parser.js';

/**
 * Low stock alert
 */
export interface LowStockAlert {
  productId: string;
  productName: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
}

/**
 * Inventory Service
 * 
 * Handles inventory operations: view, adjust, import, alerts.
 */
export class InventoryService {
  constructor(private em: EntityManager) {}

  /**
   * Get inventory list with stock status
   */
  async getInventory(options: {
    search?: string;
    category?: string;
    stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
    page?: number;
    limit?: number;
  }): Promise<{ data: Product[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (options.search) {
      where.$or = [
        { name: { $like: `%${options.search}%` } },
        { sku: { $like: `%${options.search}%` } },
      ];
    }

    if (options.category) {
      where.category = options.category;
    }

    if (options.stockStatus === 'out_of_stock') {
      where.stockQuantity = 0;
    } else if (options.stockStatus === 'low_stock') {
      where.$and = [
        { stockQuantity: { $gt: 0 } },
        { $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] } },
      ];
    } else if (options.stockStatus === 'in_stock') {
      where.$expr = { $gt: ['$stockQuantity', '$lowStockThreshold'] };
    }

    const [products, total] = await this.em.findAndCount(Product, where, {
      populate: ['category', 'brand'],
      orderBy: { stockQuantity: 'ASC' },
      limit,
      offset,
    });

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get product inventory details
   */
  async getProductInventory(productId: string): Promise<Product | null> {
    return this.em.findOne(Product, { id: productId }, {
      populate: ['category', 'brand'],
    });
  }

  /**
   * Get inventory history for a product
   */
  async getInventoryHistory(
    productId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: InventoryLog[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const offset = (page - 1) * limit;

    const [logs, total] = await this.em.findAndCount(
      InventoryLog,
      { product: productId },
      {
        populate: ['createdBy'],
        orderBy: { createdAt: 'DESC' },
        limit,
        offset,
      },
    );

    return {
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Adjust inventory for a product
   */
  async adjustInventory(
    productId: string,
    userId: string,
    adjustment: {
      type: InventoryAdjustmentType;
      quantity: number;
      reason?: string;
      reference?: string;
    },
  ): Promise<InventoryLog> {
    const product = await this.em.findOne(Product, { id: productId });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const user = await this.em.findOneOrFail(User, { id: userId });

    const previousQuantity = product.stockQuantity;
    let newQuantity: number;

    switch (adjustment.type) {
      case InventoryAdjustmentType.RECEIVED:
      case InventoryAdjustmentType.RETURN:
      case InventoryAdjustmentType.ADJUSTMENT:
      case InventoryAdjustmentType.IMPORT:
        newQuantity = previousQuantity + adjustment.quantity;
        break;
      case InventoryAdjustmentType.SALE:
      case InventoryAdjustmentType.DAMAGED:
      case InventoryAdjustmentType.RECOUNT:
        newQuantity = previousQuantity - adjustment.quantity;
        break;
      default:
        newQuantity = previousQuantity + adjustment.quantity;
    }

    // Ensure non-negative
    newQuantity = Math.max(0, newQuantity);

    // Update product stock
    product.stockQuantity = newQuantity;

    // Create inventory log
    const log = this.em.create(InventoryLog, {
      product,
      createdBy: user,
      type: adjustment.type,
      quantityChange: adjustment.type === InventoryAdjustmentType.SALE ||
        adjustment.type === InventoryAdjustmentType.DAMAGED
        ? -adjustment.quantity
        : adjustment.quantity,
      quantityBefore: previousQuantity,
      quantityAfter: newQuantity,
      reason: adjustment.reason,
      referenceId: adjustment.reference,
    });

    this.em.persist(log);
    await this.em.flush();

    return log;
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(): Promise<LowStockAlert[]> {
    // Find products where stock is at or below threshold
    const products = await this.em.find(Product, { isActive: true });
    
    // Filter in memory since MikroORM doesn't support comparing two columns directly
    const lowStockProducts = products.filter(
      (p) => p.stockQuantity <= p.lowStockThreshold
    );

    return lowStockProducts.map((p) => ({
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      stockQuantity: p.stockQuantity,
      lowStockThreshold: p.lowStockThreshold,
    }));
  }

  /**
   * Check if there are any low stock alerts
   */
  async hasLowStockAlerts(): Promise<boolean> {
    const alerts = await this.getLowStockAlerts();
    return alerts.length > 0;
  }

  /**
   * Import inventory from XLSX file
   */
  async importFromXlsx(buffer: Buffer, userId: string): Promise<ParseResult> {
    const result = await parseInventoryXlsx(buffer);

    const user = await this.em.findOneOrFail(User, { id: userId });

    // Process each parsed product
    for (const parsed of result.products) {
      // Find or create product
      let product = await this.em.findOne(Product, { sku: parsed.sku });

      if (product) {
        // Update existing product
        const previousQuantity = product.stockQuantity;

        product.name = parsed.name;
        product.description = parsed.description;
        product.stockQuantity = parsed.stockQuantity;

        if (parsed.upc) product.upc = parsed.upc;
        if (parsed.length !== undefined) product.length = String(parsed.length);
        if (parsed.width !== undefined) product.width = String(parsed.width);
        if (parsed.height !== undefined) product.height = String(parsed.height);
        if (parsed.weight !== undefined) product.weight = String(parsed.weight);
        if (parsed.costPrice !== undefined) product.costPrice = String(parsed.costPrice);
        if (parsed.sellPrice) product.price = parsed.sellPrice.toString();

        // Create inventory log if quantity changed
        if (previousQuantity !== parsed.stockQuantity) {
          const log = this.em.create(InventoryLog, {
            product,
            createdBy: user,
            type: InventoryAdjustmentType.IMPORT,
            quantityChange: parsed.stockQuantity - previousQuantity,
            quantityBefore: previousQuantity,
            quantityAfter: parsed.stockQuantity,
            reason: 'XLSX Import',
          });
          this.em.persist(log);
        }
      }
      // Note: Product creation would require category/brand handling
      // which is more complex and would be handled separately
    }

    await this.em.flush();

    return result;
  }
}

export function createInventoryService(em: EntityManager): InventoryService {
  return new InventoryService(em);
}

