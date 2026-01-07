import { EntityManager } from '@mikro-orm/core';
import { Order, OrderItem, OrderStatus, Product, Category } from '../entities/index.js';

/**
 * Reports Service
 * 
 * Handles sales reports, inventory value, GMV, and other analytics.
 */
export class ReportsService {
  constructor(private em: EntityManager) {}

  /**
   * Get sales report with daily, weekly, monthly breakdown
   */
  async getSalesReport(startDate?: Date, endDate?: Date): Promise<{
    daily: Array<{ date: string; total: string; orders: number }>;
    weekly: Array<{ week: string; total: string; orders: number }>;
    monthly: Array<{ month: string; total: string; orders: number }>;
  }> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const orders = await this.em.find(Order, {
      createdAt: { $gte: start, $lte: end },
      status: { $ne: OrderStatus.CANCELLED },
    });

    // Group by day
    const dailyMap = new Map<string, { total: number; orders: number }>();
    const weeklyMap = new Map<string, { total: number; orders: number }>();
    const monthlyMap = new Map<string, { total: number; orders: number }>();

    for (const order of orders) {
      const date = order.createdAt.toISOString().split('T')[0];
      const week = this.getWeekKey(order.createdAt);
      const month = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;

      const total = parseFloat(order.total);

      // Daily
      const daily = dailyMap.get(date) || { total: 0, orders: 0 };
      daily.total += total;
      daily.orders += 1;
      dailyMap.set(date, daily);

      // Weekly
      const weekly = weeklyMap.get(week) || { total: 0, orders: 0 };
      weekly.total += total;
      weekly.orders += 1;
      weeklyMap.set(week, weekly);

      // Monthly
      const monthly = monthlyMap.get(month) || { total: 0, orders: 0 };
      monthly.total += total;
      monthly.orders += 1;
      monthlyMap.set(month, monthly);
    }

    return {
      daily: Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, total: data.total.toFixed(2), orders: data.orders }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      weekly: Array.from(weeklyMap.entries())
        .map(([week, data]) => ({ week, total: data.total.toFixed(2), orders: data.orders }))
        .sort((a, b) => a.week.localeCompare(b.week)),
      monthly: Array.from(monthlyMap.entries())
        .map(([month, data]) => ({ month, total: data.total.toFixed(2), orders: data.orders }))
        .sort((a, b) => a.month.localeCompare(b.month)),
    };
  }

  /**
   * Get sales by category
   */
  async getSalesByCategory(startDate?: Date, endDate?: Date): Promise<
    Array<{ categoryId: string; categoryName: string; total: string; orders: number; items: number }>
  > {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const orders = await this.em.find(Order, {
      createdAt: { $gte: start, $lte: end },
      status: { $ne: OrderStatus.CANCELLED },
    }, { populate: ['items', 'items.product', 'items.product.category'] });

    const categoryMap = new Map<string, { name: string; total: number; orders: Set<string>; items: number }>();

    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product as Product;
        const category = product?.category as Category;
        if (!category) continue;

        const cat = categoryMap.get(category.id) || { name: category.name, total: 0, orders: new Set(), items: 0 };
        cat.total += parseFloat(item.totalPrice);
        cat.orders.add(order.id);
        cat.items += item.quantity;
        categoryMap.set(category.id, cat);
      }
    }

    return Array.from(categoryMap.entries())
      .map(([id, data]) => ({
        categoryId: id,
        categoryName: data.name,
        total: data.total.toFixed(2),
        orders: data.orders.size,
        items: data.items,
      }))
      .sort((a, b) => parseFloat(b.total) - parseFloat(a.total));
  }

  /**
   * Get inventory value report
   */
  async getInventoryValue(): Promise<{
    totalValue: string;
    totalRetailValue: string;
    totalItems: number;
    byCategory: Array<{ categoryId: string; categoryName: string; value: string; items: number }>;
  }> {
    const products = await this.em.find(Product, { isActive: true }, {
      populate: ['category'],
    });

    let totalCostValue = 0;
    let totalRetailValue = 0;
    let totalItems = 0;

    const categoryMap = new Map<string, { name: string; value: number; items: number }>();

    for (const product of products) {
      const cost = parseFloat(product.costPrice as string) || 0;
      const retail = parseFloat(product.price as string);
      const qty = product.stockQuantity;

      totalCostValue += cost * qty;
      totalRetailValue += retail * qty;
      totalItems += qty;

      const category = product.category as Category;
      if (category) {
        const cat = categoryMap.get(category.id) || { name: category.name, value: 0, items: 0 };
        cat.value += (parseFloat(product.costPrice as string) || 0) * qty;
        cat.items += qty;
        categoryMap.set(category.id, cat);
      }
    }

    return {
      totalValue: totalCostValue.toFixed(2),
      totalRetailValue: totalRetailValue.toFixed(2),
      totalItems,
      byCategory: Array.from(categoryMap.entries())
        .map(([id, data]) => ({
          categoryId: id,
          categoryName: data.name,
          value: data.value.toFixed(2),
          items: data.items,
        }))
        .sort((a, b) => parseFloat(b.value) - parseFloat(a.value)),
    };
  }

  /**
   * Get GMV (Gross Merchandise Value) report
   */
  async getGMV(startDate?: Date, endDate?: Date): Promise<{
    gmv: string;
    previousGmv: string;
    growth: number;
    orders: number;
    averageOrderValue: string;
  }> {
    const end = endDate || new Date();
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const periodLength = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodLength);
    const previousEnd = start;

    // Current period
    const currentOrders = await this.em.find(Order, {
      createdAt: { $gte: start, $lte: end },
      status: { $nin: [OrderStatus.CANCELLED] },
    });

    // Previous period
    const previousOrders = await this.em.find(Order, {
      createdAt: { $gte: previousStart, $lte: previousEnd },
      status: { $nin: [OrderStatus.CANCELLED] },
    });

    const currentGmv = currentOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
    const previousGmv = previousOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
    const growth = previousGmv > 0 ? ((currentGmv - previousGmv) / previousGmv) * 100 : 0;

    return {
      gmv: currentGmv.toFixed(2),
      previousGmv: previousGmv.toFixed(2),
      growth: Math.round(growth * 100) / 100,
      orders: currentOrders.length,
      averageOrderValue: currentOrders.length > 0 ? (currentGmv / currentOrders.length).toFixed(2) : '0.00',
    };
  }

  /**
   * Get daily GMV breakdown
   */
  async getDailyGMV(days: number = 30): Promise<Array<{ date: string; gmv: string; orders: number }>> {
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const orders = await this.em.find(Order, {
      createdAt: { $gte: start, $lte: end },
      status: { $nin: [OrderStatus.CANCELLED] },
    });

    const dailyMap = new Map<string, { gmv: number; orders: number }>();

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      dailyMap.set(date, { gmv: 0, orders: 0 });
    }

    for (const order of orders) {
      const date = order.createdAt.toISOString().split('T')[0];
      const daily = dailyMap.get(date) || { gmv: 0, orders: 0 };
      daily.gmv += parseFloat(order.total);
      daily.orders += 1;
      dailyMap.set(date, daily);
    }

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, gmv: data.gmv.toFixed(2), orders: data.orders }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get top selling products
   */
  async getTopProducts(limit: number = 10, startDate?: Date, endDate?: Date): Promise<
    Array<{ productId: string; productName: string; sku: string; unitsSold: number; revenue: string }>
  > {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const orders = await this.em.find(Order, {
      createdAt: { $gte: start, $lte: end },
      status: { $nin: [OrderStatus.CANCELLED] },
    }, { populate: ['items'] });

    const productMap = new Map<string, { name: string; sku: string; units: number; revenue: number }>();

    for (const order of orders) {
      for (const item of order.items) {
        const existing = productMap.get(item.product?.id || item.productSku) || {
          name: item.productName,
          sku: item.productSku,
          units: 0,
          revenue: 0,
        };
        existing.units += item.quantity;
        existing.revenue += parseFloat(item.totalPrice);
        productMap.set(item.product?.id || item.productSku, existing);
      }
    }

    return Array.from(productMap.entries())
      .map(([id, data]) => ({
        productId: id,
        productName: data.name,
        sku: data.sku,
        unitsSold: data.units,
        revenue: data.revenue.toFixed(2),
      }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, limit);
  }

  /**
   * Get low performing products (in stock but not selling)
   */
  async getLowPerformingProducts(limit: number = 10, days: number = 30): Promise<
    Array<{ productId: string; productName: string; sku: string; stockQuantity: number; unitsSold: number }>
  > {
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const products = await this.em.find(Product, {
      isActive: true,
      stockQuantity: { $gt: 0 },
    });

    const orders = await this.em.find(Order, {
      createdAt: { $gte: start },
      status: { $nin: [OrderStatus.CANCELLED] },
    }, { populate: ['items'] });

    const salesMap = new Map<string, number>();
    for (const order of orders) {
      for (const item of order.items) {
        const id = item.product?.id || '';
        salesMap.set(id, (salesMap.get(id) || 0) + item.quantity);
      }
    }

    return products
      .map((p) => ({
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        stockQuantity: p.stockQuantity,
        unitsSold: salesMap.get(p.id) || 0,
      }))
      .filter((p) => p.unitsSold === 0)
      .sort((a, b) => b.stockQuantity - a.stockQuantity)
      .slice(0, limit);
  }

  /**
   * Export sales data to CSV
   */
  async exportSalesReport(startDate?: Date, endDate?: Date): Promise<string> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const orders = await this.em.find(Order, {
      createdAt: { $gte: start, $lte: end },
    }, { populate: ['user', 'items'] });

    const headers = ['Order Number', 'Date', 'Customer', 'Status', 'Items', 'Subtotal', 'Shipping', 'Tax', 'Total'];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.createdAt.toISOString().split('T')[0],
      o.user?.email || 'Guest',
      o.status,
      o.items.length.toString(),
      o.subtotal,
      o.shippingCost,
      o.taxAmount,
      o.total,
    ]);

    return [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
  }

  private getWeekKey(date: Date): string {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
  }
}

export function createReportsService(em: EntityManager): ReportsService {
  return new ReportsService(em);
}

