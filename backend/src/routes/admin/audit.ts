import { FastifyInstance, FastifyRequest } from 'fastify';
import { paginationSchema } from '../../schemas/index.js';

export const auditRoutes = async (fastify: FastifyInstance) => {
  // Get audit logs
  fastify.get('/', async (request: FastifyRequest<{
    Querystring: {
      userId?: string;
      action?: string;
      resource?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  }>) => {
    const pagination = paginationSchema.parse(request.query);
    const { userId, action, resource, dateFrom, dateTo } = request.query;

    const where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (resource) where.resource = resource;
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      };
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [logs, total] = await Promise.all([
      fastify.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      fastify.prisma.auditLog.count({ where }),
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

  // Get audit log statistics
  fastify.get('/stats', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const [todayCount, weekCount, byAction, byResource] = await Promise.all([
      fastify.prisma.auditLog.count({
        where: { createdAt: { gte: today } },
      }),
      fastify.prisma.auditLog.count({
        where: { createdAt: { gte: lastWeek } },
      }),
      fastify.prisma.auditLog.groupBy({
        by: ['action'],
        _count: true,
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),
      fastify.prisma.auditLog.groupBy({
        by: ['resource'],
        _count: true,
        orderBy: { _count: { resource: 'desc' } },
      }),
    ]);

    return {
      data: {
        todayCount,
        weekCount,
        byAction: byAction.map((a) => ({ action: a.action, count: a._count })),
        byResource: byResource.map((r) => ({ resource: r.resource, count: r._count })),
      },
    };
  });
};

