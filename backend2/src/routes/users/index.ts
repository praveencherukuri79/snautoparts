import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireFeature } from '../../plugins/passport-auth.js';
import { createUserService } from '../../services/user.service.js';
import { buildRouteSchema, Security } from '../../utils/openapi.js';

// ============================================================================
// Schemas
// ============================================================================

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullable(),
  role: z.object({
    id: z.string().uuid(),
    name: z.string(),
    displayName: z.string(),
  }).nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  displayName: z.string(),
  description: z.string().nullable(),
});

const CreateUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  roleId: z.string().uuid(),
  phone: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

const UpdateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  roleId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
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

export const usersRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', requireAuth);

  // GET /users
  fastify.get<{
    Querystring: {
      search?: string;
      roleId?: string;
      isActive?: string;
      page?: string;
      limit?: string;
    };
  }>('/', {
    preHandler: [requireFeature('users.viewAll')],
    schema: buildRouteSchema({
      summary: 'List users',
      description: 'Returns a paginated list of users (admin only)',
      tags: ['Users'],
      security: Security.authenticated,
      querystring: z.object({
        search: z.string().optional(),
        roleId: z.string().uuid().optional(),
        isActive: z.enum(['true', 'false']).optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
      }),
      response: {
        200: z.object({
          data: z.array(UserSchema),
          meta: PaginationMetaSchema,
        }),
      },
    }),
  }, async (request) => {
    const service = createUserService(request.em);
    const data = await service.getUsers({
      search: request.query.search,
      roleId: request.query.roleId,
      isActive: request.query.isActive === 'true' ? true : request.query.isActive === 'false' ? false : undefined,
      page: request.query.page ? parseInt(request.query.page, 10) : 1,
      limit: request.query.limit ? parseInt(request.query.limit, 10) : 20,
    });
    return data;
  });

  // GET /users/roles
  fastify.get('/roles', {
    preHandler: [requireFeature('users.viewAll')],
    schema: buildRouteSchema({
      summary: 'List roles',
      description: 'Returns all available roles',
      tags: ['Users'],
      security: Security.authenticated,
      response: {
        200: z.object({ data: z.array(RoleSchema) }),
      },
    }),
  }, async (request) => {
    const service = createUserService(request.em);
    const data = await service.getRoles();
    return { data };
  });

  // GET /users/:id
  fastify.get<{ Params: { id: string } }>('/:id', {
    preHandler: [requireFeature('users.viewAll')],
    schema: buildRouteSchema({
      summary: 'Get user by ID',
      description: 'Returns detailed user information',
      tags: ['Users'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: z.object({ data: UserSchema }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request, reply) => {
    const service = createUserService(request.em);
    const data = await service.getUserById(request.params.id);
    if (!data) {
      return reply.status(404).send({ error: 'User not found' });
    }
    return { data };
  });

  // POST /users
  fastify.post<{ Body: z.infer<typeof CreateUserSchema> }>('/', {
    preHandler: [requireFeature('users.create')],
    schema: buildRouteSchema({
      summary: 'Create user',
      description: 'Create a new user (admin only)',
      tags: ['Users'],
      security: Security.authenticated,
      body: CreateUserSchema,
      response: {
        201: z.object({ data: UserSchema }),
      },
    }),
  }, async (request, reply) => {
    const service = createUserService(request.em);
    const data = await service.createUser(request.body);
    return reply.status(201).send({ data });
  });

  // PATCH /users/:id
  fastify.patch<{
    Params: { id: string };
    Body: z.infer<typeof UpdateUserSchema>;
  }>('/:id', {
    preHandler: [requireFeature('users.updateRole')],
    schema: buildRouteSchema({
      summary: 'Update user',
      description: 'Update user information (admin only)',
      tags: ['Users'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      body: UpdateUserSchema,
      response: {
        200: z.object({ data: UserSchema }),
      },
    }),
  }, async (request) => {
    const service = createUserService(request.em);
    const data = await service.updateUser(request.params.id, request.body);
    return { data };
  });

  // DELETE /users/:id
  fastify.delete<{ Params: { id: string } }>('/:id', {
    preHandler: [requireFeature('users.delete')],
    schema: buildRouteSchema({
      summary: 'Delete user',
      description: 'Delete a user (admin only)',
      tags: ['Users'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: z.object({ data: z.object({ message: z.string() }) }),
      },
    }),
  }, async (request) => {
    const service = createUserService(request.em);
    await service.deleteUser(request.params.id);
    return { data: { message: 'User deleted' } };
  });

  // PATCH /users/:id/role
  fastify.patch<{
    Params: { id: string };
    Body: { roleId: string };
  }>('/:id/role', {
    preHandler: [requireFeature('users.updateRole')],
    schema: buildRouteSchema({
      summary: 'Assign role to user',
      description: 'Assign a role to a user (admin only)',
      tags: ['Users'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      body: z.object({ roleId: z.string().uuid() }),
      response: {
        200: z.object({ data: UserSchema }),
      },
    }),
  }, async (request) => {
    const service = createUserService(request.em);
    const data = await service.assignRole(request.params.id, request.body.roleId);
    return { data };
  });
};
