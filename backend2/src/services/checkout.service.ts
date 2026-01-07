import { EntityManager } from '@mikro-orm/core';
import { Cart, CartItem, Order, OrderItem, OrderStatus, Product, Address, User, OrderTimeline, AffiliateOrder, AffiliateOrderStatus, Affiliate, AffiliateProductMapping } from '../entities/index.js';
import { config } from '../config/index.js';
import { BadRequestError, NotFoundError } from '../plugins/error-handler.js';
import { enqueueOrderConfirmationEmail } from '../jobs/email-jobs.js';
import { enqueueAffiliateOrderPush } from '../jobs/affiliate-jobs.js';
import Stripe from 'stripe';

/**
 * Shipping method option
 */
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: string;
  estimatedDays: string;
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
  // Default for other states
  DEFAULT: 0.05,
};

/**
 * Checkout Service
 * 
 * Handles the checkout flow: shipping methods, payment intent, order creation.
 */
export class CheckoutService {
  private stripe: Stripe | null = null;

  constructor(private em: EntityManager) {
    // Initialize Stripe client if secret key is configured
    if (config.stripe.secretKey) {
      this.stripe = new Stripe(config.stripe.secretKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  /**
   * Get available shipping methods
   */
  async getShippingMethods(userId: string): Promise<ShippingMethod[]> {
    // Get cart to calculate shipping based on items
    const cart = await this.em.findOne(Cart, { user: userId }, {
      populate: ['items', 'items.product'],
    });

    if (!cart || cart.items.length === 0) {
      return [];
    }

    // Calculate total weight for shipping estimation
    let totalWeight = 0;
    for (const item of cart.items) {
      const product = item.product as Product;
      totalWeight += (parseFloat(product.weight as string) || 1) * item.quantity;
    }

    // Return shipping options based on weight/location
    // In production, integrate with shipping carriers API (UPS, FedEx, USPS)
    return [
      {
        id: 'standard',
        name: 'Standard Shipping',
        description: '5-7 business days',
        price: totalWeight > 50 ? '14.99' : '9.99',
        estimatedDays: '5-7',
      },
      {
        id: 'express',
        name: 'Express Shipping',
        description: '2-3 business days',
        price: totalWeight > 50 ? '29.99' : '19.99',
        estimatedDays: '2-3',
      },
      {
        id: 'overnight',
        name: 'Overnight Shipping',
        description: 'Next business day',
        price: totalWeight > 50 ? '49.99' : '39.99',
        estimatedDays: '1',
      },
    ];
  }

  /**
   * Calculate tax rate based on shipping state
   */
  private getTaxRate(state: string): number {
    return STATE_TAX_RATES[state.toUpperCase()] ?? STATE_TAX_RATES.DEFAULT;
  }

  /**
   * Create Stripe payment intent
   */
  async createPaymentIntent(
    userId: string,
    shippingMethodId: string,
    shippingAddressId: string,
  ): Promise<{ clientSecret: string; amount: number }> {
    // Get cart
    const cart = await this.em.findOne(Cart, { user: userId }, {
      populate: ['items', 'items.product'],
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    // Get shipping address
    const shippingAddress = await this.em.findOne(Address, { id: shippingAddressId, user: userId });
    if (!shippingAddress) {
      throw new NotFoundError('Shipping address not found');
    }

    // Get shipping method
    const shippingMethods = await this.getShippingMethods(userId);
    const shippingMethod = shippingMethods.find(m => m.id === shippingMethodId);
    if (!shippingMethod) {
      throw new BadRequestError('Invalid shipping method');
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of cart.items) {
      const product = item.product as Product;
      subtotal += parseFloat(product.price as unknown as string) * item.quantity;
    }

    const shippingCost = parseFloat(shippingMethod.price);
    const taxRate = this.getTaxRate(shippingAddress.state);
    const taxAmount = subtotal * taxRate;
    const total = subtotal + shippingCost + taxAmount;
    const amountInCents = Math.round(total * 100);

    // Create Stripe payment intent if Stripe is configured
    if (this.stripe) {
      const user = await this.em.findOneOrFail(User, { id: userId });
      
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: {
          userId,
          cartId: cart.id,
          userEmail: user.email,
        },
        receipt_email: user.email,
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        amount: paymentIntent.amount,
      };
    }

    // Mock payment intent for development (when Stripe is not configured)
    return {
      clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
      amount: amountInCents,
    };
  }

  /**
   * Create order from cart
   */
  async createOrder(
    userId: string,
    input: {
      shippingMethodId: string;
      shippingAddressId: string;
      billingAddressId?: string;
      paymentIntentId: string;
      notes?: string;
    },
  ): Promise<Order> {
    // Get cart with items
    const cart = await this.em.findOne(Cart, { user: userId }, {
      populate: ['items', 'items.product', 'items.product.category', 'items.product.brand'],
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    // Get user
    const user = await this.em.findOneOrFail(User, { id: userId });

    // Get shipping address
    const shippingAddress = await this.em.findOne(Address, { id: input.shippingAddressId, user: userId });
    if (!shippingAddress) {
      throw new NotFoundError('Shipping address not found');
    }

    // Get billing address
    let billingAddress = shippingAddress;
    if (input.billingAddressId && input.billingAddressId !== input.shippingAddressId) {
      const billing = await this.em.findOne(Address, { id: input.billingAddressId, user: userId });
      if (billing) {
        billingAddress = billing;
      }
    }

    // Get shipping method
    const shippingMethods = await this.getShippingMethods(userId);
    const shippingMethod = shippingMethods.find(m => m.id === input.shippingMethodId);
    if (!shippingMethod) {
      throw new BadRequestError('Invalid shipping method');
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of cart.items) {
      const product = item.product as Product;
      subtotal += parseFloat(product.price as unknown as string) * item.quantity;
    }

    const shippingCost = parseFloat(shippingMethod.price);
    const taxRate = this.getTaxRate(shippingAddress.state);
    const taxAmount = subtotal * taxRate;
    const total = subtotal + shippingCost + taxAmount;

    // Generate order number
    const orderNumber = `SN${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    // Create order
    const order = new Order();
    order.orderNumber = orderNumber;
    order.user = user;
    order.status = OrderStatus.PENDING;
    order.subtotal = subtotal.toFixed(2);
    order.shippingCost = shippingCost.toFixed(2);
    order.taxAmount = taxAmount.toFixed(2);
    order.discountAmount = '0';
    order.total = total.toFixed(2);
    order.shippingAddress = {
      firstName: shippingAddress.firstName,
      lastName: shippingAddress.lastName,
      company: shippingAddress.company,
      address1: shippingAddress.address1,
      address2: shippingAddress.address2,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zipCode: shippingAddress.zipCode,
      country: shippingAddress.country,
      phone: shippingAddress.phone,
    };
    order.billingAddress = {
      firstName: billingAddress.firstName,
      lastName: billingAddress.lastName,
      company: billingAddress.company,
      address1: billingAddress.address1,
      address2: billingAddress.address2,
      city: billingAddress.city,
      state: billingAddress.state,
      zipCode: billingAddress.zipCode,
      country: billingAddress.country,
      phone: billingAddress.phone,
    };
    order.shippingMethod = shippingMethod.name;
    order.paymentMethod = 'card';
    order.paymentIntentId = input.paymentIntentId;
    order.customerNotes = input.notes;
    order.isPaid = false;

    this.em.persist(order);

    // Track dropship items by affiliate
    const dropshipItemsByAffiliate = new Map<string, OrderItem[]>();

    // Create order items
    for (const cartItem of cart.items) {
      const product = cartItem.product as Product;
      const orderItem = this.em.create(OrderItem, {
        order,
        product,
        productName: product.name,
        productSku: product.sku,
        productImageUrl: product.imageUrl,
        quantity: cartItem.quantity,
        unitPrice: product.price,
        totalPrice: (parseFloat(product.price as unknown as string) * cartItem.quantity).toFixed(2),
      });
      this.em.persist(orderItem);

      // Handle stock reduction for inventory items
      if (product.fulfillmentType === 'INVENTORY') {
        product.stockQuantity -= cartItem.quantity;
      } else if (product.fulfillmentType === 'DROPSHIP' || product.fulfillmentType === 'MIXED') {
        // Find affiliate mapping for this product
        const mapping = await this.em.findOne(AffiliateProductMapping, { product: product.id });
        if (mapping) {
          const affiliateId = mapping.affiliate.id;
          if (!dropshipItemsByAffiliate.has(affiliateId)) {
            dropshipItemsByAffiliate.set(affiliateId, []);
          }
          dropshipItemsByAffiliate.get(affiliateId)!.push(orderItem);
        }
      }
    }

    // Create initial timeline entry
    const timeline = this.em.create(OrderTimeline, {
      order,
      status: OrderStatus.PENDING,
      title: 'Order Placed',
      description: 'Your order has been received and is being processed.',
    });
    this.em.persist(timeline);

    // Clear cart
    for (const item of cart.items) {
      this.em.remove(item);
    }

    await this.em.flush();

    // Queue background jobs
    await enqueueOrderConfirmationEmail(order.id);

    // Create affiliate orders for dropship items
    for (const [affiliateId, items] of dropshipItemsByAffiliate) {
      const affiliate = await this.em.findOne(Affiliate, { id: affiliateId });
      if (!affiliate || !affiliate.isActive) continue;

      // Calculate affiliate order total
      const affiliateTotal = items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);

      // Create affiliate order
      const affiliateOrder = new AffiliateOrder();
      affiliateOrder.order = order;
      affiliateOrder.affiliate = affiliate;
      affiliateOrder.status = AffiliateOrderStatus.PENDING;
      affiliateOrder.orderLines = items.map(item => ({
        productId: item.product.id,
        productSku: item.productSku,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));
      affiliateOrder.totalAmount = affiliateTotal.toFixed(2);
      affiliateOrder.retryCount = 0;

      this.em.persist(affiliateOrder);
      await this.em.flush();

      // Enqueue affiliate order push job
      await enqueueAffiliateOrderPush(affiliateOrder.id);
    }

    return order;
  }
}

export function createCheckoutService(em: EntityManager): CheckoutService {
  return new CheckoutService(em);
}
