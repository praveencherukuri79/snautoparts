import { FastifyInstance } from 'fastify';
import { cartRoutes } from './cart.js';
import { checkoutRoutes } from './checkout.js';
import { orderRoutes } from './orders.js';
import { profileRoutes } from './profile.js';

export const customerRoutes = async (fastify: FastifyInstance) => {
  // All customer routes require authentication
  fastify.addHook('preHandler', fastify.authenticate);

  await fastify.register(cartRoutes, { prefix: '/cart' });
  await fastify.register(checkoutRoutes, { prefix: '/checkout' });
  await fastify.register(orderRoutes, { prefix: '/orders' });
  await fastify.register(profileRoutes, { prefix: '/profile' });
};

