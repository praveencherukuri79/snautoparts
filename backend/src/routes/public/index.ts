import { FastifyInstance } from 'fastify';
import { catalogRoutes } from './catalog.js';
import { authRoutes } from './auth.js';

export const publicRoutes = async (fastify: FastifyInstance) => {
  await fastify.register(catalogRoutes, { prefix: '/catalog' });
  await fastify.register(authRoutes, { prefix: '/auth' });
};

