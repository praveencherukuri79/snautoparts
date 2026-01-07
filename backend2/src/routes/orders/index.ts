import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireFeature } from '../../plugins/passport-auth.js';
import { createOrderService } from '../../services/order.service.js';
import { Order, OrderStatus, OrderTimeline, Shipment } from '../../entities/index.js';
import { NotFoundError, ForbiddenError } from '../../plugins/error-handler.js';
import { buildRouteSchema, Security } from '../../utils/openapi.js';

// ============================================================================
// Schemas
// ============================================================================

const OrderSummarySchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  status: z.nativeEnum(OrderStatus),
  total: z.string(),
  itemCount: z.number(),
  createdAt: z.date(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  }).optional(),
});

const OrderItemSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid().nullable(),
  productName: z.string(),
  productSku: z.string(),
  productImageUrl: z.string().nullable(),
  quantity: z.number(),
  unitPrice: z.string(),
  totalPrice: z.string(),
});

const OrderDetailSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  status: z.nativeEnum(OrderStatus),
  subtotal: z.string(),
  shippingCost: z.string(),
  taxAmount: z.string(),
  total: z.string(),
  shippingMethod: z.string().nullable(),
  paymentMethod: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  items: z.array(OrderItemSchema),
  shippingAddress: z.record(z.unknown()).nullable(),
  billingAddress: z.record(z.unknown()).nullable(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  }).optional(),
});

const TimelineEventSchema = z.object({
  id: z.string().uuid(),
  status: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  changedBy: z.object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
  }).nullable(),
});

const ShipmentSchema = z.object({
  id: z.string().uuid(),
  carrier: z.string(),
  trackingNumber: z.string(),
  trackingUrl: z.string().nullable(),
  status: z.string(),
  estimatedDelivery: z.date().nullable(),
  shippedAt: z.date().nullable(),
  deliveredAt: z.date().nullable(),
});

const PaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

// ============================================================================
// Routes
// ============================================================================

export const ordersRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /orders - List orders (own orders for customers, all for manager/admin)
  fastify.get<{
    Querystring: {
      page?: string;
      limit?: string;
      status?: string;
      userId?: string;
    };
  }>('/', {
    preHandler: [requireAuth, requireFeature('orders.viewOwn|orders.viewAll')],
    schema: buildRouteSchema({
      summary: 'List orders',
      description: 'Returns a paginated list of orders. Customers see their own orders, managers/admins see all.',
      tags: ['Orders'],
      security: Security.authenticated,
      querystring: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        status: z.nativeEnum(OrderStatus).optional(),
        userId: z.string().uuid().optional(),
      }),
      response: {
        200: z.object({
          data: z.array(OrderSummarySchema),
          meta: PaginationMetaSchema,
        }),
      },
    }),
  }, async (request) => {
    const orderService = createOrderService(request.em);
    const { page = '1', limit = '20', status, userId } = request.query;

    let targetUserId: string | undefined;
    if (request.dataScope === 'own') {
      targetUserId = request.user!.id;
    } else if (userId) {
      targetUserId = userId;
    }

    const result = await orderService.getOrders(
      targetUserId ?? null,
      request.dataScope as 'own' | 'all',
      {
        page: parseInt(page, 10),
        limit: Math.min(parseInt(limit, 10), 100),
        status: status as OrderStatus | undefined,
      },
    );

    return {
      data: result.data.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status as OrderStatus,
        total: order.total,
        itemCount: order.itemCount,
        createdAt: new Date(order.createdAt),
        user: order.customerName ? {
          id: order.id,
          email: order.customerEmail ?? '',
          firstName: order.customerName.split(' ')[0] ?? '',
          lastName: order.customerName.split(' ').slice(1).join(' ') ?? '',
        } : undefined,
      })),
      meta: result.meta,
    };
  });

  // GET /orders/statistics
  fastify.get('/statistics', {
    preHandler: [requireAuth, requireFeature('orders.viewStatistics')],
    schema: buildRouteSchema({
      summary: 'Get order statistics',
      description: 'Returns order statistics and metrics (manager/admin only)',
      tags: ['Orders'],
      security: Security.authenticated,
      response: {
        200: z.object({ data: z.record(z.unknown()) }),
      },
    }),
  }, async (request) => {
    const orderService = createOrderService(request.em);
    const stats = await orderService.getOrderStatistics();
    return { data: stats };
  });

  // GET /orders/pending-count
  fastify.get('/pending-count', {
    preHandler: [requireAuth, requireFeature('orders.viewAll')],
    schema: buildRouteSchema({
      summary: 'Get pending orders count',
      description: 'Returns the count of pending orders (for nav badge)',
      tags: ['Orders'],
      security: Security.authenticated,
      response: {
        200: z.object({ data: z.object({ count: z.number() }) }),
      },
    }),
  }, async (request) => {
    const count = await request.em.count(Order, { status: OrderStatus.PENDING });
    return { data: { count } };
  });

  // GET /orders/:id
  fastify.get<{ Params: { id: string } }>('/:id', {
    preHandler: [requireAuth, requireFeature('orders.viewOwn|orders.viewAll')],
    schema: buildRouteSchema({
      summary: 'Get order by ID',
      description: 'Returns detailed order information',
      tags: ['Orders'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: z.object({ data: OrderDetailSchema }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request) => {
    const orderService = createOrderService(request.em);
    const { id } = request.params;

    const order = await orderService.getOrderById(
      id,
      request.dataScope === 'own' ? request.user!.id : null,
      request.dataScope as 'own' | 'all',
    );

    return {
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status as OrderStatus,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        taxAmount: order.taxAmount,
        total: order.total,
        shippingMethod: order.shippingMethod ?? null,
        paymentMethod: null,
        notes: order.customerNotes ?? null,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.createdAt),
        items: order.items.map(item => ({
          id: item.id,
          productId: item.productId ?? null,
          productName: item.name,
          productSku: item.sku,
          productImageUrl: null,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.lineTotal,
        })),
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress ?? null,
      },
    };
  });

  // PATCH /orders/:id/status
  fastify.patch<{
    Params: { id: string };
    Body: { status: OrderStatus; notes?: string };
  }>('/:id/status', {
    preHandler: [requireAuth, requireFeature('orders.updateStatus')],
    schema: buildRouteSchema({
      summary: 'Update order status',
      description: 'Update the status of an order (manager/admin only)',
      tags: ['Orders'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      body: z.object({
        status: z.nativeEnum(OrderStatus),
        notes: z.string().optional(),
      }),
      response: {
        200: z.object({
          data: z.object({
            id: z.string().uuid(),
            orderNumber: z.string(),
            status: z.nativeEnum(OrderStatus),
            updatedAt: z.date(),
          }),
        }),
      },
    }),
  }, async (request) => {
    const orderService = createOrderService(request.em);
    const { id } = request.params;
    const { status, notes } = request.body;

    const order = await orderService.updateOrderStatus(
      id,
      { status, internalNotes: notes },
      request.user!.id,
    );

    return {
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status as OrderStatus,
        updatedAt: new Date(order.createdAt),
      },
    };
  });

  // POST /orders/:id/cancel
  fastify.post<{
    Params: { id: string };
    Body: { reason?: string };
  }>('/:id/cancel', {
    preHandler: [requireAuth, requireFeature('orders.cancel|orders.viewOwn')],
    schema: buildRouteSchema({
      summary: 'Cancel order',
      description: 'Cancel an order. Customers can only cancel pending orders.',
      tags: ['Orders'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      body: z.object({ reason: z.string().optional() }),
      response: {
        200: z.object({
          data: z.object({
            id: z.string().uuid(),
            orderNumber: z.string(),
            status: z.nativeEnum(OrderStatus),
            cancelledAt: z.date().nullable(),
          }),
        }),
      },
    }),
  }, async (request) => {
    const orderService = createOrderService(request.em);
    const { id } = request.params;
    const { reason } = request.body;

    if (request.dataScope === 'own') {
      const existingOrder = await orderService.getOrderById(id, request.user!.id, 'own');
      if (existingOrder.status !== 'PENDING') {
        throw new ForbiddenError('Cannot cancel order in current status');
      }
    }

    const order = await orderService.cancelOrder(id, request.user!.id);

    return {
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status as OrderStatus,
        cancelledAt: null,
      },
    };
  });

  // GET /orders/:id/timeline
  fastify.get<{ Params: { id: string } }>('/:id/timeline', {
    preHandler: [requireAuth, requireFeature('orders.viewOwn|orders.viewAll')],
    schema: buildRouteSchema({
      summary: 'Get order timeline',
      description: 'Returns the status history timeline for an order',
      tags: ['Orders'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: z.object({ data: z.array(TimelineEventSchema) }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request) => {
    const { id } = request.params;

    const order = await request.em.findOne(Order, {
      id,
      ...(request.dataScope === 'own' ? { user: request.user!.id } : {}),
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const timeline = await request.em.find(OrderTimeline, { order: id }, {
      orderBy: { createdAt: 'DESC' },
      populate: ['changedBy'],
    });

    return {
      data: timeline.map(event => ({
        id: event.id,
        status: event.status,
        title: event.title,
        description: event.description,
        createdAt: event.createdAt,
        changedBy: event.changedBy ? {
          id: event.changedBy.id,
          firstName: event.changedBy.firstName,
          lastName: event.changedBy.lastName,
        } : null,
      })),
    };
  });

  // GET /orders/:id/shipments
  fastify.get<{ Params: { id: string } }>('/:id/shipments', {
    preHandler: [requireAuth, requireFeature('orders.viewOwn|orders.viewAll')],
    schema: buildRouteSchema({
      summary: 'Get order shipments',
      description: 'Returns shipment tracking information for an order',
      tags: ['Orders'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: z.object({ data: z.array(ShipmentSchema) }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request) => {
    const { id } = request.params;

    const order = await request.em.findOne(Order, {
      id,
      ...(request.dataScope === 'own' ? { user: request.user!.id } : {}),
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const shipments = await request.em.find(Shipment, { order: id }, {
      orderBy: { createdAt: 'DESC' },
    });

    return {
      data: shipments.map(shipment => ({
        id: shipment.id,
        carrier: shipment.carrier,
        trackingNumber: shipment.trackingNumber,
        trackingUrl: shipment.trackingUrl,
        status: shipment.status,
        estimatedDelivery: shipment.estimatedDeliveryAt,
        shippedAt: shipment.shippedAt,
        deliveredAt: shipment.deliveredAt,
      })),
    };
  });

  // GET /orders/track/:trackingNumber
  fastify.get<{ Params: { trackingNumber: string } }>('/track/:trackingNumber', {
    schema: buildRouteSchema({
      summary: 'Track shipment',
      description: 'Public endpoint to track a shipment by tracking number',
      tags: ['Orders'],
      security: Security.public,
      params: z.object({ trackingNumber: z.string() }),
      response: {
        200: z.object({ data: ShipmentSchema.extend({ orderNumber: z.string() }) }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request) => {
    const { trackingNumber } = request.params;

    const shipment = await request.em.findOne(Shipment, { trackingNumber }, {
      populate: ['order'],
    });

    if (!shipment) {
      throw new NotFoundError('Shipment not found');
    }

    return {
      data: {
        orderNumber: shipment.order.orderNumber,
        carrier: shipment.carrier,
        trackingNumber: shipment.trackingNumber,
        trackingUrl: shipment.trackingUrl,
        status: shipment.status,
        estimatedDelivery: shipment.estimatedDeliveryAt,
        shippedAt: shipment.shippedAt,
        deliveredAt: shipment.deliveredAt,
      },
    };
  });
};
