import { FastifyPluginAsync } from 'fastify';
import { authRoutes } from './auth/index.js';
import { catalogRoutes } from './catalog/index.js';
import { cartRoutes } from './cart/index.js';
import { checkoutRoutes } from './checkout/index.js';
import { ordersRoutes } from './orders/index.js';
import { productsRoutes } from './products/index.js';
import { inventoryRoutes } from './inventory/index.js';
import { dropshipRoutes } from './dropship/index.js';
import { usersRoutes } from './users/index.js';
import { profileRoutes } from './profile/index.js';
import { settingsRoutes } from './settings/index.js';
import { auditRoutes } from './audit/index.js';
import { reportsRoutes } from './reports/index.js';
import { webhooksRoutes } from './webhooks/index.js';

export const registerRoutes: FastifyPluginAsync = async (fastify) => {
  // Public routes
  await fastify.register(authRoutes, { prefix: '/auth' });
  await fastify.register(catalogRoutes, { prefix: '/catalog' });

  // Authenticated routes
  await fastify.register(cartRoutes, { prefix: '/cart' });
  await fastify.register(checkoutRoutes, { prefix: '/checkout' });
  await fastify.register(ordersRoutes, { prefix: '/orders' });
  await fastify.register(profileRoutes, { prefix: '/profile' });

  // Manager/Admin routes
  await fastify.register(productsRoutes, { prefix: '/products' });
  await fastify.register(inventoryRoutes, { prefix: '/inventory' });
  await fastify.register(dropshipRoutes, { prefix: '/dropship' });
  await fastify.register(reportsRoutes, { prefix: '/reports' });

  // Admin routes
  await fastify.register(usersRoutes, { prefix: '/users' });
  await fastify.register(settingsRoutes, { prefix: '/settings' });
  await fastify.register(auditRoutes, { prefix: '/audit' });
  await fastify.register(webhooksRoutes, { prefix: '/webhooks' });

  fastify.log.info('All routes registered');
};

