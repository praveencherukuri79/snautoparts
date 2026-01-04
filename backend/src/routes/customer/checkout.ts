import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Stripe from 'stripe';
import { config } from '../../config/index.js';
import { createOrderSchema, createPaymentIntentSchema } from '../../schemas/index.js';

const stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2023-10-16' });

// Generate order number
const generateOrderNumber = (): string => {
  const prefix = 'SN';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
};

export const checkoutRoutes = async (fastify: FastifyInstance) => {
  // Create payment intent
  fastify.post('/create-payment-intent', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.id;
    const { idempotencyKey } = createPaymentIntentSchema.parse(request.body);

    // Get cart with items
    const cart = await fastify.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Cart is empty',
      });
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
    const shippingAmount = subtotal >= 50 ? 0 : 9.99; // Free shipping over $50
    const taxAmount = subtotal * 0.075; // 7.5% tax
    const totalAmount = Math.round((subtotal + shippingAmount + taxAmount) * 100); // Convert to cents

    // Check stock availability
    for (const item of cart.items) {
      if (item.product.stockQuantity < item.quantity) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: `Insufficient stock for ${item.product.name}`,
        });
      }
    }

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: totalAmount,
        currency: 'usd',
        metadata: {
          userId,
          cartId: cart.id,
        },
        automatic_payment_methods: { enabled: true },
      },
      { idempotencyKey }
    );

    return {
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: totalAmount / 100,
        subtotal,
        shippingAmount,
        taxAmount,
      },
    };
  });

  // Create order after successful payment
  fastify.post('/create-order', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.id;
    const data = createOrderSchema.parse(request.body);

    // Get cart with items
    const cart = await fastify.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Cart is empty',
      });
    }

    // Check idempotency
    if (data.idempotencyKey) {
      const existingOrder = await fastify.prisma.order.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
      });
      if (existingOrder) {
        return { data: existingOrder };
      }
    }

    // Get or create shipping address
    let shippingAddress = data.shippingAddress;
    if (data.addressId) {
      const address = await fastify.prisma.address.findFirst({
        where: { id: data.addressId, userId },
      });
      if (address) {
        shippingAddress = {
          firstName: address.firstName,
          lastName: address.lastName,
          street: address.street,
          apartment: address.apartment || undefined,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country,
          phone: address.phone || undefined,
        };
      }
    }

    if (!shippingAddress) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Shipping address is required',
      });
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
    const shippingAmount = subtotal >= 50 ? 0 : 9.99;
    const taxAmount = subtotal * 0.075;
    const totalAmount = subtotal + shippingAmount + taxAmount;

    // Create order in transaction
    const order = await fastify.prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          addressId: data.addressId,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          subtotal,
          shippingAmount,
          taxAmount,
          totalAmount,
          shippingMethod: data.shippingMethod,
          notes: data.notes,
          idempotencyKey: data.idempotencyKey,
          shippingFirstName: shippingAddress.firstName,
          shippingLastName: shippingAddress.lastName,
          shippingStreet: shippingAddress.street,
          shippingApartment: shippingAddress.apartment,
          shippingCity: shippingAddress.city,
          shippingState: shippingAddress.state,
          shippingZipCode: shippingAddress.zipCode,
          shippingCountry: shippingAddress.country,
          shippingPhone: shippingAddress.phone,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              sku: item.product.sku,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              totalPrice: Number(item.product.price) * item.quantity,
            })),
          },
          timeline: {
            create: {
              status: 'PENDING',
              message: 'Order placed',
            },
          },
        },
        include: { items: true },
      });

      // Update inventory
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            adjustmentType: 'SOLD',
            quantity: -item.quantity,
            previousQty: item.product.stockQuantity,
            newQty: item.product.stockQuantity - item.quantity,
            reason: `Sold via order ${newOrder.orderNumber}`,
            referenceId: newOrder.id,
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return { data: order };
  });

  // Get shipping methods
  fastify.get('/shipping-methods', async () => {
    return {
      data: [
        {
          id: 'standard',
          name: 'Standard Shipping',
          description: '5-7 business days',
          price: 9.99,
          freeThreshold: 50,
        },
        {
          id: 'express',
          name: 'Express Shipping',
          description: '2-3 business days',
          price: 19.99,
          freeThreshold: null,
        },
        {
          id: 'overnight',
          name: 'Overnight Shipping',
          description: 'Next business day',
          price: 29.99,
          freeThreshold: null,
        },
      ],
    };
  });
};

