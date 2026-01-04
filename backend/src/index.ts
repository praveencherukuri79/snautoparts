// Load environment variables FIRST before any other imports
import 'dotenv/config';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import formbody from '@fastify/formbody';
import sensible from '@fastify/sensible';
import { config } from './config/index.js';
import { prismaPlugin } from './plugins/prisma.js';
import { authPlugin } from './plugins/auth.js';
import { errorHandler } from './plugins/error-handler.js';
import { publicRoutes } from './routes/public/index.js';
import { customerRoutes } from './routes/customer/index.js';
import { managerRoutes } from './routes/manager/index.js';
import { adminRoutes } from './routes/admin/index.js';

const start = async () => {
  const fastify = Fastify({
    logger: {
      level: config.logLevel,
      transport: config.isDev
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    },
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
  });

  // Error handler
  fastify.setErrorHandler(errorHandler);

  // Core plugins
  await fastify.register(sensible);
  await fastify.register(cors, {
    origin: config.frontendUrl,
    credentials: true,
  });
  await fastify.register(cookie);
  await fastify.register(formbody);

  // Custom plugins
  await fastify.register(prismaPlugin);
  await fastify.register(authPlugin);

  // Routes
  await fastify.register(publicRoutes, { prefix: '/api/v1/public' });
  await fastify.register(customerRoutes, { prefix: '/api/v1/customer' });
  await fastify.register(managerRoutes, { prefix: '/api/v1/manager' });
  await fastify.register(adminRoutes, { prefix: '/api/v1/admin' });

  // Health check
  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  try {
    await fastify.listen({ port: config.port, host: config.host });
    fastify.log.info(`Server running at http://${config.host}:${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

