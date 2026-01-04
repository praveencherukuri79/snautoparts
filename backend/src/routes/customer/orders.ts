import { FastifyInstance, FastifyRequest } from 'fastify';
import { paginationSchema, idParamSchema } from '../../schemas/index.js';

export const orderRoutes = async (fastify: FastifyInstance) => {
  // Get order history
  fastify.get('/', async (request: FastifyRequest<{ Querystring: unknown }>) => {
    const userId = request.user!.id;
    const pagination = paginationSchema.parse(request.query);

    const skip = (pagination.page - 1) * pagination.limit;

    const [orders, total] = await Promise.all([
      fastify.prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
      fastify.prisma.order.count({ where: { userId } }),
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

  // Get single order
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const userId = request.user!.id;
    const { id } = idParamSchema.parse(request.params);

    const order = await fastify.prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                slug: true,
              },
            },
          },
        },
        timeline: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return fastify.httpErrors.notFound('Order not found');
    }

    return { data: order };
  });

  // Track order (public endpoint with order number)
  fastify.get('/track/:orderNumber', async (request: FastifyRequest<{ Params: { orderNumber: string } }>) => {
    const { orderNumber } = request.params;

    const order = await fastify.prisma.order.findUnique({
      where: { orderNumber },
      select: {
        orderNumber: true,
        status: true,
        shippingCarrier: true,
        trackingNumber: true,
        createdAt: true,
        timeline: {
          orderBy: { createdAt: 'desc' },
          select: {
            status: true,
            message: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      return fastify.httpErrors.notFound('Order not found');
    }

    return { data: order };
  });
};

