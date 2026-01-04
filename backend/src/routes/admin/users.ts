import { FastifyInstance, FastifyRequest } from 'fastify';
import { randomBytes, pbkdf2Sync } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { paginationSchema, idParamSchema, updateUserRoleSchema, createUserSchema } from '../../schemas/index.js';

const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

export const usersRoutes = async (fastify: FastifyInstance) => {
  // Get all users
  fastify.get('/', async (request: FastifyRequest<{ 
    Querystring: { role?: string; status?: string; search?: string } 
  }>) => {
    const pagination = paginationSchema.parse(request.query);
    const { role, search } = request.query;

    const where: Record<string, unknown> = {};

    if (role && role !== 'ALL') {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [users, total] = await Promise.all([
      fastify.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          role: true,
          image: true,
          createdAt: true,
          sessions: {
            orderBy: { updatedAt: 'desc' },
            take: 1,
            select: { updatedAt: true },
          },
        },
      }),
      fastify.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        ...u,
        lastActive: u.sessions[0]?.updatedAt || null,
        sessions: undefined,
      })),
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  });

  // Get single user
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const { id } = idParamSchema.parse(request.params);

    const user = await fastify.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { orders: true, addresses: true, sessions: true },
        },
      },
    });

    if (!user) {
      return fastify.httpErrors.notFound('User not found');
    }

    return { data: user };
  });

  // Create user
  fastify.post('/', async (request: FastifyRequest) => {
    const adminId = request.user!.id;
    const data = createUserSchema.parse(request.body);

    const existingUser = await fastify.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return fastify.httpErrors.conflict('User with this email already exists');
    }

    const user = await fastify.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        accounts: {
          create: {
            accountId: uuidv4(),
            providerId: 'credentials',
            password: hashPassword(data.password),
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    await fastify.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'CREATE_USER',
        resource: 'User',
        resourceId: user.id,
        newData: { email: data.email, role: data.role },
        ipAddress: request.ip,
      },
    });

    return { data: user };
  });

  // Update user role
  fastify.patch('/:id/role', async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const adminId = request.user!.id;
    const { id } = idParamSchema.parse(request.params);
    const { role } = updateUserRoleSchema.parse(request.body);

    const existing = await fastify.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return fastify.httpErrors.notFound('User not found');
    }

    // Prevent self-demotion
    if (id === adminId && role !== 'ADMIN') {
      return fastify.httpErrors.badRequest('Cannot demote yourself');
    }

    const user = await fastify.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    await fastify.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'UPDATE_USER_ROLE',
        resource: 'User',
        resourceId: id,
        oldData: { role: existing.role },
        newData: { role },
        ipAddress: request.ip,
      },
    });

    return { data: user };
  });

  // Delete user
  fastify.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const adminId = request.user!.id;
    const { id } = idParamSchema.parse(request.params);

    if (id === adminId) {
      return fastify.httpErrors.badRequest('Cannot delete yourself');
    }

    const existing = await fastify.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return fastify.httpErrors.notFound('User not found');
    }

    await fastify.prisma.user.delete({ where: { id } });

    await fastify.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'DELETE_USER',
        resource: 'User',
        resourceId: id,
        oldData: { email: existing.email, role: existing.role },
        ipAddress: request.ip,
      },
    });

    return { success: true };
  });
};

