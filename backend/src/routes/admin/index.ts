import { FastifyInstance } from 'fastify';
import { usersRoutes } from './users.js';
import { settingsRoutes } from './settings.js';
import { auditRoutes } from './audit.js';

export const adminRoutes = async (fastify: FastifyInstance) => {
  // All admin routes require ADMIN role
  fastify.addHook('preHandler', fastify.requireRole('ADMIN'));

  await fastify.register(usersRoutes, { prefix: '/users' });
  await fastify.register(settingsRoutes, { prefix: '/settings' });
  await fastify.register(auditRoutes, { prefix: '/audit' });
};

