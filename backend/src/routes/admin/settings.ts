import { FastifyInstance, FastifyRequest } from 'fastify';
import { settingSchema } from '../../schemas/index.js';

export const settingsRoutes = async (fastify: FastifyInstance) => {
  // Get all settings
  fastify.get('/', async (request: FastifyRequest<{ Querystring: { category?: string } }>) => {
    const { category } = request.query;

    const where: Record<string, unknown> = {};
    if (category) {
      where.category = category;
    }

    const settings = await fastify.prisma.setting.findMany({
      where,
      orderBy: { key: 'asc' },
    });

    // Convert to key-value object
    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, unknown>);

    return { data: settingsMap, raw: settings };
  });

  // Get single setting
  fastify.get('/:key', async (request: FastifyRequest<{ Params: { key: string } }>) => {
    const { key } = request.params;

    const setting = await fastify.prisma.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      return fastify.httpErrors.notFound('Setting not found');
    }

    return { data: setting };
  });

  // Create or update setting
  fastify.put('/:key', async (request: FastifyRequest<{ Params: { key: string } }>) => {
    const adminId = request.user!.id;
    const { key } = request.params;
    const data = settingSchema.parse({ ...request.body, key });

    const existing = await fastify.prisma.setting.findUnique({ where: { key } });

    const setting = await fastify.prisma.setting.upsert({
      where: { key },
      update: { value: data.value, category: data.category },
      create: { key, value: data.value, category: data.category },
    });

    await fastify.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: existing ? 'UPDATE_SETTING' : 'CREATE_SETTING',
        resource: 'Setting',
        resourceId: key,
        oldData: existing ? { value: existing.value } : null,
        newData: { value: data.value },
        ipAddress: request.ip,
      },
    });

    return { data: setting };
  });

  // Delete setting
  fastify.delete('/:key', async (request: FastifyRequest<{ Params: { key: string } }>) => {
    const adminId = request.user!.id;
    const { key } = request.params;

    const existing = await fastify.prisma.setting.findUnique({ where: { key } });
    if (!existing) {
      return fastify.httpErrors.notFound('Setting not found');
    }

    await fastify.prisma.setting.delete({ where: { key } });

    await fastify.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'DELETE_SETTING',
        resource: 'Setting',
        resourceId: key,
        oldData: existing,
        ipAddress: request.ip,
      },
    });

    return { success: true };
  });

  // Bulk update settings
  fastify.post('/bulk', async (request: FastifyRequest<{ Body: Record<string, unknown> }>) => {
    const adminId = request.user!.id;
    const settings = request.body as Record<string, unknown>;

    const results = await Promise.all(
      Object.entries(settings).map(async ([key, value]) => {
        return fastify.prisma.setting.upsert({
          where: { key },
          update: { value: value as object },
          create: { key, value: value as object, category: 'general' },
        });
      })
    );

    await fastify.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'BULK_UPDATE_SETTINGS',
        resource: 'Setting',
        newData: settings,
        ipAddress: request.ip,
      },
    });

    return { data: results };
  });
};

