import { FastifyInstance } from 'fastify';
import { ordersRoutes } from './orders.js';
import { inventoryRoutes } from './inventory.js';
import { productsRoutes } from './products.js';

export const managerRoutes = async (fastify: FastifyInstance) => {
  // All manager routes require MANAGER or ADMIN role
  fastify.addHook('preHandler', fastify.requireRole('MANAGER', 'ADMIN'));

  await fastify.register(ordersRoutes, { prefix: '/orders' });
  await fastify.register(inventoryRoutes, { prefix: '/inventory' });
  await fastify.register(productsRoutes, { prefix: '/products' });
};

