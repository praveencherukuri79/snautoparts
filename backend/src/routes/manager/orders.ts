import { FastifyInstance, FastifyRequest } from 'fastify';
import { paginationSchema, idParamSchema, updateOrderStatusSchema } from '../../schemas/index.js';
import { OrderStatus } from '@prisma/client';

export const ordersRoutes = async (fastify: FastifyInstance) => {
  // Get orders with filters
  fastify.get('/', async (request: FastifyRequest<{ 
    Querystring: { status?: string; search?: string; dateFrom?: string; dateTo?: string } 
  }>) => {
    const pagination = paginationSchema.parse(request.query);
    const { status, search, dateFrom, dateTo } = request.query;

    const where: Record<string, unknown> = {};

    if (status && status !== 'ALL') {
      where.status = status as OrderStatus;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      };
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [orders, total] = await Promise.all([
      fastify.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          _count: { select: { items: true } },
        },
      }),
      fastify.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  });

  // Get order statistics
  fastify.get('/stats', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      newOrders,
      pendingShipment,
      todaysVolume,
      statusCounts,
    ] = await Promise.all([
      fastify.prisma.order.count({
        where: { createdAt: { gte: today } },
      }),
      fastify.prisma.order.count({
        where: { status: { in: ['CONFIRMED', 'PROCESSING'] } },
      }),
      fastify.prisma.order.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { totalAmount: true },
      }),
      fastify.prisma.order.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    return {
      data: {
        newOrders,
        pendingShipment,
        todaysVolume: todaysVolume._sum.totalAmount || 0,
        statusCounts: statusCounts.reduce((acc, curr) => {
          acc[curr.status] = curr._count;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  });

  // Get single order
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const { id } = idParamSchema.parse(request.params);

    const order = await fastify.prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                imageUrl: true,
              },
            },
          },
        },
        timeline: {
          orderBy: { createdAt: 'desc' },
        },
        events: {
          orderBy: { processedAt: 'desc' },
        },
      },
    });

    if (!order) {
      return fastify.httpErrors.notFound('Order not found');
    }

    return { data: order };
  });

  // Update order status
  fastify.patch('/:id/status', async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const { id } = idParamSchema.parse(request.params);
    const data = updateOrderStatusSchema.parse(request.body);
    const managerId = request.user!.id;

    const order = await fastify.prisma.order.findUnique({ where: { id } });
    if (!order) {
      return fastify.httpErrors.notFound('Order not found');
    }

    const updated = await fastify.prisma.order.update({
      where: { id },
      data: {
        status: data.status,
        trackingNumber: data.trackingNumber,
        shippingCarrier: data.shippingCarrier,
        notes: data.notes,
        timeline: {
          create: {
            status: data.status,
            message: data.notes || `Status changed to ${data.status}`,
            createdBy: managerId,
          },
        },
      },
      include: {
        timeline: { orderBy: { createdAt: 'desc' } },
      },
    });

    // Log audit
    await fastify.prisma.auditLog.create({
      data: {
        userId: managerId,
        action: 'UPDATE_ORDER_STATUS',
        resource: 'Order',
        resourceId: id,
        oldData: { status: order.status },
        newData: { status: data.status },
        ipAddress: request.ip,
      },
    });

    return { data: updated };
  });

  // Cancel and refund order
  fastify.post('/:id/cancel', async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const { id } = idParamSchema.parse(request.params);
    const managerId = request.user!.id;

    const order = await fastify.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return fastify.httpErrors.notFound('Order not found');
    }

    if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
      return fastify.httpErrors.badRequest('Order is already cancelled or refunded');
    }

    // Cancel order and restore inventory
    const updated = await fastify.prisma.$transaction(async (tx) => {
      // Restore inventory
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            adjustmentType: 'RETURNED',
            quantity: item.quantity,
            previousQty: 0, // Will be calculated
            newQty: 0,
            reason: `Order ${order.orderNumber} cancelled`,
            referenceId: order.id,
            createdBy: managerId,
          },
        });
      }

      return tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          timeline: {
            create: {
              status: 'CANCELLED',
              message: 'Order cancelled by manager',
              createdBy: managerId,
            },
          },
        },
      });
    });

    return { data: updated };
  });
};

