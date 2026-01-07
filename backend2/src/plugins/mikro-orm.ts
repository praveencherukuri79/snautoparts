import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { MikroORM, EntityManager } from '@mikro-orm/core';
import config from '../../mikro-orm.config.js';

declare module 'fastify' {
  interface FastifyRequest {
    em: EntityManager;
  }
  interface FastifyInstance {
    orm: MikroORM;
  }
}

/**
 * MikroORM plugin for Fastify
 * 
 * Wrapped with fastify-plugin to break encapsulation - this ensures
 * the 'orm' decorator and 'em' request property are available in all
 * child contexts (routes registered with prefixes).
 */
const mikroOrmPluginImpl: FastifyPluginAsync = async (fastify) => {
  const orm = await MikroORM.init(config);

  // Store ORM instance on fastify
  fastify.decorate('orm', orm);

  // Decorate request with em (will be set per-request in hook)
  fastify.decorateRequest('em', null);

  // Run migrations on startup (optional - comment out in production)
  if (process.env.NODE_ENV !== 'production') {
    const migrator = orm.getMigrator();
    await migrator.up();
  }

  // Add EntityManager to each request - fork creates an isolated context
  fastify.addHook('onRequest', async (request) => {
    request.em = orm.em.fork();
  });

  // Clear the entity manager after each request
  fastify.addHook('onResponse', async (request) => {
    if (request.em) {
      request.em.clear();
    }
  });

  // Cleanup on shutdown
  fastify.addHook('onClose', async () => {
    await orm.close();
  });

  fastify.log.info('MikroORM initialized');
};

// Export wrapped plugin to break encapsulation
export const mikroOrmPlugin = fp(mikroOrmPluginImpl, {
  name: 'mikro-orm',
});

