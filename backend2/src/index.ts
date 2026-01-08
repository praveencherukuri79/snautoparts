import 'dotenv/config'; // Load environment variables from .env file

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';

import { config } from './config/index.js';
import { logger } from './config/logger.js';
import { mikroOrmPlugin } from './plugins/mikro-orm.js';
import { errorHandler } from './plugins/error-handler.js';
import { passportAuthPlugin } from './plugins/passport-auth.js';
import swaggerPlugin from './plugins/swagger.js';
import { registerRoutes } from './routes/index.js';

async function bootstrap() {
  const app = Fastify({
    logger: logger as unknown as boolean,
  });

  // Register plugins
  await app.register(cors, {
    origin: (origin, cb) => {
      // In development, allow all origins dynamically
      if (!config.isProduction) {
        // If origin header exists, use it
        if (origin) {
          cb(null, origin);
          return;
        }
        // No origin (same-origin or non-browser), allow all
        cb(null, true);
        return;
      }
      // Production: strict origin check
      if (!origin || config.corsOrigin.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Referer'],
  });

  // In development: add hook to handle referer-based origin for CORS
  if (!config.isProduction) {
    app.addHook('onRequest', async (request, reply) => {
      // If no origin but has referer, extract origin from referer
      if (!request.headers.origin && request.headers.referer) {
        try {
          const refererUrl = new URL(request.headers.referer);
          const derivedOrigin = refererUrl.origin;
          // Set CORS headers manually for this case
          reply.header('Access-Control-Allow-Origin', derivedOrigin);
          reply.header('Access-Control-Allow-Credentials', 'true');
        } catch {
          // Invalid referer URL, ignore
        }
      }
    });
  }

  await app.register(helmet, {
    // Allow Swagger UI to load
    contentSecurityPolicy: config.isProduction ? undefined : false,
  });

  await app.register(cookie, {
    secret: config.cookieSecret,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // OpenAPI / Swagger documentation
  await app.register(swaggerPlugin);

  // Database
  await app.register(mikroOrmPlugin);

  // Passport.js authentication
  await app.register(passportAuthPlugin);

  // Error handling
  app.setErrorHandler(errorHandler);

  // Health check
  app.get('/health', async () => ({
    status: 'ok',
    version: '1.0.0',
    database: 'connected',
    timestamp: new Date().toISOString(),
  }));

  // Register API routes
  await app.register(registerRoutes, { prefix: '/api/v1' });

  // Start server
  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    logger.info(`Server listening on port ${config.port}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

bootstrap();

