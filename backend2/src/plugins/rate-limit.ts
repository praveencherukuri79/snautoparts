import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';

async function rateLimitPlugin(fastify: FastifyInstance) {
  await fastify.register(rateLimit, {
    max: 100, // Max requests per window
    timeWindow: '1 minute',
    
    // Custom key generator (use IP by default, user ID if authenticated)
    keyGenerator: (request) => {
      return request.user?.id || request.ip;
    },

    // Custom error response
    errorResponseBuilder: (request, context) => {
      return {
        statusCode: 429,
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil(context.ttl / 1000)} seconds.`,
        retryAfter: Math.ceil(context.ttl / 1000),
      };
    },

    // Skip rate limiting for certain routes
    allowList: (request) => {
      // Skip rate limiting for health check
      if (request.url === '/health') {
        return true;
      }
      return false;
    },

    // Add headers to response
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true,
    },
  });

  // Register stricter rate limits for auth endpoints
  fastify.register(async (authInstance) => {
    await authInstance.register(rateLimit, {
      max: 10,
      timeWindow: '1 minute',
      keyGenerator: (request) => request.ip,
    });
  }, { prefix: '/api/v1/auth' });
}

export default fp(rateLimitPlugin, {
  name: 'rate-limit',
});

