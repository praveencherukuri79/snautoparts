import fp from 'fastify-plugin';
import cors, { FastifyCorsOptions } from '@fastify/cors';
import type { FastifyInstance } from 'fastify';

const corsOptions: FastifyCorsOptions = {
  origin: (origin, cb) => {
    const allowedOrigins = [
      'http://localhost:4200',
      'http://localhost:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      cb(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      cb(null, true);
    } else if (process.env.NODE_ENV === 'development') {
      // In development, allow all origins
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
  maxAge: 86400, // 24 hours
};

async function corsPlugin(fastify: FastifyInstance) {
  await fastify.register(cors, corsOptions);
}

export default fp(corsPlugin, {
  name: 'cors',
});

