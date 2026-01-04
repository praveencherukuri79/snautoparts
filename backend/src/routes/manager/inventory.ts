import { FastifyInstance, FastifyRequest } from 'fastify';
import { paginationSchema, inventoryAdjustmentSchema } from '../../schemas/index.js';

export const inventoryRoutes = async (fastify: FastifyInstance) => {
  // Get inventory levels
  fastify.get('/', async (request: FastifyRequest<{ 
    Querystring: { lowStock?: string; search?: string } 
  }>) => {
    const pagination = paginationSchema.parse(request.query);
    const { lowStock, search } = request.query;

    const where: Record<string, unknown> = {};

    if (lowStock === 'true') {
      where.stockQuantity = { lte: fastify.prisma.product.fields.lowStockThreshold };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [products, total] = await Promise.all([
      fastify.prisma.product.findMany({
        where,
        orderBy: { stockQuantity: 'asc' },
        skip,
        take: pagination.limit,
        select: {
          id: true,
          sku: true,
          name: true,
          imageUrl: true,
          stockQuantity: true,
          lowStockThreshold: true,
          price: true,
          category: { select: { name: true } },
          brand: { select: { name: true } },
        },
      }),
      fastify.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  });

  // Get low stock alerts
  fastify.get('/alerts', async () => {
    const lowStockProducts = await fastify.prisma.$queryRaw`
      SELECT id, sku, name, "stockQuantity", "lowStockThreshold"
      FROM products
      WHERE "stockQuantity" <= "lowStockThreshold" AND "isActive" = true
      ORDER BY "stockQuantity" ASC
      LIMIT 20
    `;

    return { data: lowStockProducts };
  });

  // Create inventory adjustment
  fastify.post('/adjustments', async (request: FastifyRequest) => {
    const managerId = request.user!.id;
    const data = inventoryAdjustmentSchema.parse(request.body);

    const product = await fastify.prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      return fastify.httpErrors.notFound('Product not found');
    }

    const previousQty = product.stockQuantity;
    const newQty = previousQty + data.quantity;

    if (newQty < 0) {
      return fastify.httpErrors.badRequest('Resulting quantity cannot be negative');
    }

    const [updatedProduct, log] = await fastify.prisma.$transaction([
      fastify.prisma.product.update({
        where: { id: data.productId },
        data: { stockQuantity: newQty },
      }),
      fastify.prisma.inventoryLog.create({
        data: {
          productId: data.productId,
          adjustmentType: data.adjustmentType,
          quantity: data.quantity,
          previousQty,
          newQty,
          reason: data.reason,
          referenceId: data.referenceId,
          createdBy: managerId,
        },
      }),
    ]);

    return { data: { product: updatedProduct, log } };
  });

  // Get inventory history for a product
  fastify.get('/:productId/history', async (request: FastifyRequest<{ 
    Params: { productId: string } 
  }>) => {
    const { productId } = request.params;
    const pagination = paginationSchema.parse(request.query);

    const skip = (pagination.page - 1) * pagination.limit;

    const [logs, total] = await Promise.all([
      fastify.prisma.inventoryLog.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
      }),
      fastify.prisma.inventoryLog.count({ where: { productId } }),
    ]);

    return {
      data: logs,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  });
};

