import { FastifyInstance, FastifyRequest } from 'fastify';
import { paginationSchema, productSchema, idParamSchema } from '../../schemas/index.js';

export const productsRoutes = async (fastify: FastifyInstance) => {
  // Get all products (with more details for managers)
  fastify.get('/', async (request: FastifyRequest<{ Querystring: unknown }>) => {
    const pagination = paginationSchema.parse(request.query);
    const skip = (pagination.page - 1) * pagination.limit;

    const [products, total] = await Promise.all([
      fastify.prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
        },
      }),
      fastify.prisma.product.count(),
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

  // Create product
  fastify.post('/', async (request: FastifyRequest) => {
    const managerId = request.user!.id;
    const data = productSchema.parse(request.body);

    const product = await fastify.prisma.product.create({
      data,
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
      },
    });

    await fastify.prisma.auditLog.create({
      data: {
        userId: managerId,
        action: 'CREATE_PRODUCT',
        resource: 'Product',
        resourceId: product.id,
        newData: data,
        ipAddress: request.ip,
      },
    });

    return { data: product };
  });

  // Update product
  fastify.patch('/:id', async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const managerId = request.user!.id;
    const { id } = idParamSchema.parse(request.params);
    const data = productSchema.partial().parse(request.body);

    const existing = await fastify.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return fastify.httpErrors.notFound('Product not found');
    }

    const product = await fastify.prisma.product.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
      },
    });

    await fastify.prisma.auditLog.create({
      data: {
        userId: managerId,
        action: 'UPDATE_PRODUCT',
        resource: 'Product',
        resourceId: id,
        oldData: existing,
        newData: data,
        ipAddress: request.ip,
      },
    });

    return { data: product };
  });

  // Delete product (soft delete by setting isActive = false)
  fastify.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const managerId = request.user!.id;
    const { id } = idParamSchema.parse(request.params);

    const existing = await fastify.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return fastify.httpErrors.notFound('Product not found');
    }

    await fastify.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    await fastify.prisma.auditLog.create({
      data: {
        userId: managerId,
        action: 'DELETE_PRODUCT',
        resource: 'Product',
        resourceId: id,
        oldData: existing,
        ipAddress: request.ip,
      },
    });

    return { success: true };
  });
};

