import { EntityManager } from '@mikro-orm/core';
import { Order, OrderItem, OrderStatus, Cart, CartItem, User, Address, OrderTimeline } from '../entities/index.js';
import { CreateOrderInput, UpdateOrderStatusInput } from '../schemas/order.schema.js';
import { NotFoundError, BadRequestError } from '../plugins/error-handler.js';
import { generateOrderNumber } from '../utils/crypto.js';
import { paginatedResponse, calculateOffset, PaginatedResponse } from '../utils/pagination.js';

export interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  shippingCost: string;
  taxAmount: string;
  discountAmount: string;
  total: string;
  shippingAddress: Record<string, unknown>;
  billingAddress?: Record<string, unknown>;
  shippingMethod?: string;
  isPaid: boolean;
  paidAt?: string;
  customerNotes?: string;
  createdAt: string;
  items: OrderItemData[];
}

export interface OrderItemData {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: string;
  quantity: number;
  lineTotal: string;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  itemCount: number;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
}

// State tax rates (simplified for common US states)
const STATE_TAX_RATES: Record<string, number> = {
  CA: 0.0725, // California
  TX: 0.0625, // Texas
  FL: 0.06,   // Florida
  NY: 0.08,   // New York
  PA: 0.06,   // Pennsylvania
  IL: 0.0625, // Illinois
  OH: 0.0575, // Ohio
  GA: 0.04,   // Georgia
  NC: 0.0475, // North Carolina
  MI: 0.06,   // Michigan
  WA: 0.065,  // Washington
  AZ: 0.056,  // Arizona
  MA: 0.0625, // Massachusetts
  NJ: 0.0663, // New Jersey
  VA: 0.053,  // Virginia
  CO: 0.029,  // Colorado
  DEFAULT: 0.05,
};

// Shipping rates by method and weight tier
const SHIPPING_RATES: Record<string, { base: number; perPound: number }> = {
  standard: { base: 5.99, perPound: 0.50 },
  express: { base: 12.99, perPound: 0.75 },
  overnight: { base: 24.99, perPound: 1.25 },
};

export class OrderService {
  constructor(private em: EntityManager) {}

  /**
   * Calculate shipping cost based on method and cart weight
   */
  private calculateShippingCost(method: string, totalWeight: number = 0): number {
    const rate = SHIPPING_RATES[method.toLowerCase()] ?? SHIPPING_RATES.standard;
    return rate.base + (totalWeight * rate.perPound);
  }

  /**
   * Calculate tax based on shipping address state
   */
  private calculateTax(subtotal: number, state: string): number {
    const taxRate = STATE_TAX_RATES[state.toUpperCase()] ?? STATE_TAX_RATES.DEFAULT;
    return subtotal * taxRate;
  }

  /**
   * Create order from cart
   */
  async createOrder(userId: string, input: CreateOrderInput): Promise<OrderData> {
    // Check for idempotency
    if (input.idempotencyKey) {
      const existing = await this.em.findOne(Order, { idempotencyKey: input.idempotencyKey });
      if (existing) {
        return this.formatOrderData(existing);
      }
    }

    // Get user's cart
    const cart = await this.em.findOne(
      Cart,
      { user: userId },
      { populate: ['items', 'items.product'] }
    );

    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    // Get or build shipping address
    let shippingAddress: Record<string, unknown>;
    let shippingState = 'DEFAULT';
    
    if (input.shippingAddressId) {
      const address = await this.em.findOne(Address, { id: input.shippingAddressId, user: userId });
      if (!address) {
        throw new NotFoundError('Shipping address not found');
      }
      shippingAddress = {
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone,
      };
      shippingState = address.state;
    } else if (input.shippingAddress) {
      shippingAddress = input.shippingAddress;
      shippingState = (input.shippingAddress as Record<string, string>).state ?? 'DEFAULT';
    } else {
      throw new BadRequestError('Shipping address is required');
    }

    // Calculate totals and weight
    let subtotal = 0;
    let totalWeight = 0;
    for (const item of cart.items) {
      const price = parseFloat(item.product.price);
      subtotal += price * item.quantity;
      // Add weight if available (default 1 lb per item)
      totalWeight += (parseFloat(item.product.weight as string) || 1) * item.quantity;
    }

    // Calculate shipping cost based on method and weight
    const shippingCost = this.calculateShippingCost(input.shippingMethod, totalWeight);
    
    // Calculate tax based on shipping state
    const taxAmount = this.calculateTax(subtotal, shippingState);
    
    const total = subtotal + shippingCost + taxAmount;

    // Create order
    const user = await this.em.findOneOrFail(User, { id: userId });
    const order = new Order();
    order.orderNumber = generateOrderNumber();
    order.user = user;
    order.status = OrderStatus.PENDING;
    order.subtotal = subtotal.toFixed(2);
    order.shippingCost = shippingCost.toFixed(2);
    order.taxAmount = taxAmount.toFixed(2);
    order.discountAmount = '0.00';
    order.total = total.toFixed(2);
    order.shippingAddress = shippingAddress as Order['shippingAddress'];
    order.billingAddress = (input.billingAddress ?? shippingAddress) as Order['billingAddress'];
    order.shippingMethod = input.shippingMethod;
    order.customerNotes = input.customerNotes;
    order.paymentIntentId = input.paymentIntentId;
    order.idempotencyKey = input.idempotencyKey;
    order.isPaid = false;

    this.em.persist(order);

    // Create order items
    for (const cartItem of cart.items) {
      const unitPrice = parseFloat(cartItem.product.price);
      const orderItem = this.em.create(OrderItem, {
        order,
        product: cartItem.product,
        productSku: cartItem.product.sku,
        productName: cartItem.product.name,
        productImageUrl: cartItem.product.imageUrl,
        unitPrice: cartItem.product.price,
        totalPrice: (unitPrice * cartItem.quantity).toFixed(2),
        quantity: cartItem.quantity,
      });
      this.em.persist(orderItem);

      // Decrease stock
      cartItem.product.stockQuantity -= cartItem.quantity;
    }

    // Create initial timeline entry
    const timeline = this.em.create(OrderTimeline, {
      order,
      status: OrderStatus.PENDING,
      title: 'Order Placed',
      description: 'Your order has been received',
    });
    this.em.persist(timeline);

    // Clear cart
    for (const item of cart.items) {
      this.em.remove(item);
    }

    await this.em.flush();

    return this.formatOrderData(order);
  }

  /**
   * Get orders with pagination (scoped by role)
   */
  async getOrders(
    userId: string | null,
    scope: 'own' | 'all',
    query: { page: number; limit: number; status?: string; search?: string },
  ): Promise<PaginatedResponse<OrderListItem>> {
    const where: Record<string, unknown> = {};

    if (scope === 'own' && userId) {
      where.user = userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const offset = calculateOffset(query.page, query.limit);

    const [orders, total] = await this.em.findAndCount(
      Order,
      where,
      {
        orderBy: { createdAt: 'DESC' },
        limit: query.limit,
        offset,
        populate: ['items', 'user'],
      }
    );

    const data: OrderListItem[] = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      itemCount: order.items.length,
      createdAt: order.createdAt.toISOString(),
      customerName: scope === 'all' ? order.user.fullName : undefined,
      customerEmail: scope === 'all' ? order.user.email : undefined,
    }));

    return paginatedResponse(data, query.page, query.limit, total);
  }

  /**
   * Get order by ID
   */
  async getOrderById(
    orderId: string,
    userId: string | null,
    scope: 'own' | 'all',
  ): Promise<OrderData> {
    const where: Record<string, unknown> = { id: orderId };
    
    if (scope === 'own' && userId) {
      where.user = userId;
    }

    const order = await this.em.findOne(Order, where, {
      populate: ['items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return this.formatOrderData(order);
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    input: UpdateOrderStatusInput,
    changedByUserId?: string,
  ): Promise<OrderData> {
    const order = await this.em.findOne(Order, { id: orderId });
    
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const previousStatus = order.status;
    order.status = input.status as OrderStatus;

    if (input.internalNotes) {
      order.internalNotes = input.internalNotes;
    }

    // Create timeline entry
    const changedBy = changedByUserId
      ? await this.em.findOne(User, { id: changedByUserId })
      : undefined;

    const timeline = this.em.create(OrderTimeline, {
      order,
      status: input.status,
      title: this.getStatusTitle(input.status),
      description: `Status changed from ${previousStatus} to ${input.status}`,
      changedBy,
    });
    this.em.persist(timeline);

    // Handle payment status for CONFIRMED
    if (input.status === 'CONFIRMED' && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
    }

    await this.em.flush();

    return this.formatOrderData(order);
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, changedByUserId?: string): Promise<OrderData> {
    const order = await this.em.findOne(Order, { id: orderId }, { populate: ['items', 'items.product'] });
    
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      throw new BadRequestError('Cannot cancel shipped or delivered orders');
    }

    // Restore stock
    for (const item of order.items) {
      item.product.stockQuantity += item.quantity;
    }

    order.status = OrderStatus.CANCELLED;

    // Create timeline entry
    const changedBy = changedByUserId
      ? await this.em.findOne(User, { id: changedByUserId })
      : undefined;

    const timeline = this.em.create(OrderTimeline, {
      order,
      status: OrderStatus.CANCELLED,
      title: 'Order Cancelled',
      description: 'Order has been cancelled',
      changedBy,
    });
    this.em.persist(timeline);

    await this.em.flush();

    return this.formatOrderData(order);
  }

  /**
   * Get pending orders count
   */
  async getPendingOrdersCount(): Promise<number> {
    return this.em.count(Order, { status: { $in: [OrderStatus.PENDING, OrderStatus.CONFIRMED] } });
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics(): Promise<Record<string, unknown>> {
    const [totalOrders, pendingOrders, completedOrders] = await Promise.all([
      this.em.count(Order),
      this.em.count(Order, { status: { $in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING] } }),
      this.em.count(Order, { status: OrderStatus.DELIVERED }),
    ]);

    // Calculate total revenue
    const deliveredOrders = await this.em.find(Order, { status: OrderStatus.DELIVERED });
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue.toFixed(2),
    };
  }

  /**
   * Get status title for timeline
   */
  private getStatusTitle(status: string): string {
    const titles: Record<string, string> = {
      PENDING: 'Order Pending',
      CONFIRMED: 'Payment Confirmed',
      PROCESSING: 'Order Processing',
      SHIPPED: 'Order Shipped',
      DELIVERED: 'Order Delivered',
      CANCELLED: 'Order Cancelled',
      REFUNDED: 'Order Refunded',
    };
    return titles[status] ?? status;
  }

  /**
   * Format order data for API response
   */
  private async formatOrderData(order: Order): Promise<OrderData> {
    await this.em.populate(order, ['items', 'items.product']);

    const items: OrderItemData[] = order.items.getItems().map((item) => ({
      id: item.id,
      productId: item.product.id,
      sku: item.productSku,
      name: item.productName,
      price: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.totalPrice,
    }));

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      total: order.total,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      shippingMethod: order.shippingMethod,
      isPaid: order.isPaid,
      paidAt: order.paidAt?.toISOString(),
      customerNotes: order.customerNotes,
      createdAt: order.createdAt.toISOString(),
      items,
    };
  }
}

/**
 * Factory function to create order service
 */
export function createOrderService(em: EntityManager): OrderService {
  return new OrderService(em);
}
