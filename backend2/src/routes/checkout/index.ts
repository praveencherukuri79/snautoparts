import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireFeature } from '../../plugins/passport-auth.js';
import { createCheckoutService } from '../../services/checkout.service.js';
import { createCartService } from '../../services/cart.service.js';
import { Address } from '../../entities/index.js';
import { buildRouteSchema, Security } from '../../utils/openapi.js';

// ============================================================================
// Schemas
// ============================================================================

const ShippingMethodSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.string(),
  estimatedDays: z.number(),
});

const CheckoutSummarySchema = z.object({
  cart: z.object({
    itemCount: z.number(),
    subtotal: z.string(),
  }),
  subtotal: z.string(),
  shippingCost: z.string(),
  taxRate: z.string(),
  taxAmount: z.string(),
  total: z.string(),
});

const PaymentIntentSchema = z.object({
  clientSecret: z.string(),
  amount: z.string(),
  currency: z.string(),
});

const OrderCreatedSchema = z.object({
  orderId: z.string().uuid(),
  orderNumber: z.string(),
  total: z.string(),
  status: z.string(),
});

const CreatePaymentIntentBody = z.object({
  shippingMethodId: z.string(),
  shippingAddressId: z.string().uuid(),
});

const CreateOrderBody = z.object({
  shippingMethodId: z.string(),
  shippingAddressId: z.string().uuid(),
  billingAddressId: z.string().uuid().optional(),
  paymentIntentId: z.string(),
  notes: z.string().optional(),
});

// ============================================================================
// Routes
// ============================================================================

export const checkoutRoutes: FastifyPluginAsync = async (fastify) => {
  // All checkout routes require authentication and cart.checkout permission
  fastify.addHook('preHandler', requireAuth);
  fastify.addHook('preHandler', requireFeature('cart.checkout'));

  // GET /checkout/shipping-methods
  fastify.get('/shipping-methods', {
    schema: buildRouteSchema({
      summary: 'Get available shipping methods',
      description: 'Returns available shipping methods based on cart contents and user location',
      tags: ['Checkout'],
      security: Security.authenticated,
      response: {
        200: z.object({ data: z.array(ShippingMethodSchema) }),
      },
    }),
  }, async (request) => {
    const service = createCheckoutService(request.em);
    const methods = await service.getShippingMethods(request.user!.id);
    return { data: methods };
  });

  // GET /checkout/summary
  fastify.get<{
    Querystring: { shippingMethodId?: string; shippingAddressId?: string };
  }>('/summary', {
    schema: buildRouteSchema({
      summary: 'Get checkout summary',
      description: 'Returns order summary with subtotal, shipping, tax, and total',
      tags: ['Checkout'],
      security: Security.authenticated,
      querystring: z.object({
        shippingMethodId: z.string().optional(),
        shippingAddressId: z.string().uuid().optional(),
      }),
      response: {
        200: z.object({ data: CheckoutSummarySchema }),
      },
    }),
  }, async (request) => {
    const cartService = createCartService(request.em);
    const checkoutService = createCheckoutService(request.em);
    
    const cart = await cartService.getCartData(request.user!.id);
    const subtotal = parseFloat(cart.subtotal);

    // Get shipping cost if method selected
    let shippingCost = 0;
    if (request.query.shippingMethodId) {
      const methods = await checkoutService.getShippingMethods(request.user!.id);
      const selected = methods.find(m => m.id === request.query.shippingMethodId);
      if (selected) {
        shippingCost = parseFloat(selected.price);
      }
    }

    // Calculate tax based on shipping address
    let taxRate = 0.08; // Default 8%
    if (request.query.shippingAddressId) {
      const address = await request.em.findOne(Address, { 
        id: request.query.shippingAddressId, 
        user: request.user!.id 
      });
      if (address) {
        taxRate = 0.08;
      }
    }

    const taxAmount = subtotal * taxRate;
    const total = subtotal + shippingCost + taxAmount;

    return {
      data: {
        cart: {
          itemCount: cart.itemCount,
          subtotal: cart.subtotal,
        },
        subtotal: subtotal.toFixed(2),
        shippingCost: shippingCost.toFixed(2),
        taxRate: (taxRate * 100).toFixed(2) + '%',
        taxAmount: taxAmount.toFixed(2),
        total: total.toFixed(2),
      },
    };
  });

  // POST /checkout/payment-intent
  fastify.post<{ Body: z.infer<typeof CreatePaymentIntentBody> }>('/payment-intent', {
    schema: buildRouteSchema({
      summary: 'Create payment intent',
      description: 'Creates a Stripe payment intent for the current cart',
      tags: ['Checkout'],
      security: Security.authenticated,
      body: CreatePaymentIntentBody,
      response: {
        200: z.object({ data: PaymentIntentSchema }),
        400: z.object({ error: z.string() }),
      },
    }),
  }, async (request, reply) => {
    const cartService = createCartService(request.em);
    const cart = await cartService.getCartData(request.user!.id);

    if (cart.itemCount === 0) {
      return reply.status(400).send({ error: 'Cart is empty' });
    }

    const checkoutService = createCheckoutService(request.em);
    const result = await checkoutService.createPaymentIntent(
      request.user!.id,
      request.body.shippingMethodId,
      request.body.shippingAddressId,
    );

    return {
      data: {
        clientSecret: result.clientSecret,
        amount: (result.amount / 100).toFixed(2),
        currency: 'usd',
      },
    };
  });

  // POST /checkout/orders
  fastify.post<{ Body: z.infer<typeof CreateOrderBody> }>('/orders', {
    schema: buildRouteSchema({
      summary: 'Create order',
      description: 'Creates an order from the current cart after successful payment',
      tags: ['Checkout'],
      security: Security.authenticated,
      body: CreateOrderBody,
      response: {
        200: z.object({ data: OrderCreatedSchema }),
      },
    }),
  }, async (request) => {
    const checkoutService = createCheckoutService(request.em);

    const order = await checkoutService.createOrder(request.user!.id, {
      shippingMethodId: request.body.shippingMethodId,
      shippingAddressId: request.body.shippingAddressId,
      billingAddressId: request.body.billingAddressId,
      paymentIntentId: request.body.paymentIntentId,
      notes: request.body.notes,
    });

    return {
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
      },
    };
  });
};
