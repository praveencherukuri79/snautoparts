import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import { FastifyInstance } from 'fastify';
import { config } from '../config/index.js';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export const prismaPlugin = fp(async (fastify: FastifyInstance) => {
  const databaseUrl = config.databaseUrl;

  if (!databaseUrl) {
    throw new Error(
      'Database connection not configured. Set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME.'
    );
  }

  const prisma = new PrismaClient({
    log: fastify.log.level === 'debug' ? ['query', 'info', 'warn', 'error'] : ['error'],
    datasources: {
      db: { url: databaseUrl },
    },
  });

  await prisma.$connect();
  fastify.log.info('Database connected successfully');

  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
});

