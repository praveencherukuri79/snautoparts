import { FastifyInstance, FastifyRequest } from 'fastify';
import { updateProfileSchema, addressSchema, idParamSchema } from '../../schemas/index.js';

export const profileRoutes = async (fastify: FastifyInstance) => {
  // Get profile
  fastify.get('/', async (request: FastifyRequest) => {
    const userId = request.user!.id;

    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        image: true,
        createdAt: true,
        _count: {
          select: { orders: true, addresses: true },
        },
      },
    });

    return { data: user };
  });

  // Update profile
  fastify.patch('/', async (request: FastifyRequest) => {
    const userId = request.user!.id;
    const data = updateProfileSchema.parse(request.body);

    const user = await fastify.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        name: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        image: true,
      },
    });

    return { data: user };
  });

  // Get addresses
  fastify.get('/addresses', async (request: FastifyRequest) => {
    const userId = request.user!.id;

    const addresses = await fastify.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return { data: addresses };
  });

  // Add address
  fastify.post('/addresses', async (request: FastifyRequest) => {
    const userId = request.user!.id;
    const data = addressSchema.parse(request.body);

    // If this is the first address or marked as default, update others
    if (data.isDefault) {
      await fastify.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await fastify.prisma.address.create({
      data: {
        userId,
        ...data,
      },
    });

    return { data: address };
  });

  // Update address
  fastify.patch('/addresses/:id', async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const userId = request.user!.id;
    const { id } = idParamSchema.parse(request.params);
    const data = addressSchema.partial().parse(request.body);

    const existing = await fastify.prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return fastify.httpErrors.notFound('Address not found');
    }

    if (data.isDefault) {
      await fastify.prisma.address.updateMany({
        where: { userId, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await fastify.prisma.address.update({
      where: { id },
      data,
    });

    return { data: address };
  });

  // Delete address
  fastify.delete('/addresses/:id', async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const userId = request.user!.id;
    const { id } = idParamSchema.parse(request.params);

    await fastify.prisma.address.deleteMany({
      where: { id, userId },
    });

    return { success: true };
  });
};

