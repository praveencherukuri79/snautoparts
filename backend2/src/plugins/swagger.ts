/**
 * Swagger/OpenAPI Plugin
 * 
 * Configures Fastify Swagger for API documentation.
 * Serves OpenAPI spec at /docs and Swagger UI at /docs/ui
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from '../config/index.js';

async function swaggerPlugin(fastify: FastifyInstance): Promise<void> {
  // Register Swagger for OpenAPI spec generation
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'SN Auto Parts API',
        description: `
Feature-config driven e-commerce API for auto parts.

## Authentication
All authenticated endpoints require a session token passed via:
- Cookie: \`auth-token=<token>\`
- Header: \`Authorization: Bearer <token>\`

## Authorization
APIs are generic - authorization is determined by the authenticated user's role 
and feature configuration. The same endpoint may return different data or 
permissions based on the user's role.

## Feature-Based Access
Each endpoint requires specific features to be enabled in the user's role configuration.
If a user lacks the required feature, they receive a 403 Forbidden response.
        `.trim(),
        version: '1.0.0',
        contact: {
          name: 'SN Auto Parts',
          email: 'support@snautoparts.com',
        },
        license: {
          name: 'Proprietary',
        },
      },
      servers: [
        {
          url: `http://localhost:${config.port}/api/v1`,
          description: 'Development server',
        },
        {
          url: 'https://api.snautoparts.com/api/v1',
          description: 'Production server',
        },
      ],
      tags: [
        { name: 'Auth', description: 'Authentication and session management' },
        { name: 'Catalog', description: 'Public product catalog' },
        { name: 'Cart', description: 'Shopping cart operations' },
        { name: 'Checkout', description: 'Checkout and payment' },
        { name: 'Orders', description: 'Order management' },
        { name: 'Products', description: 'Product management' },
        { name: 'Inventory', description: 'Inventory management' },
        { name: 'Dropship', description: 'Drop-shipping and affiliates' },
        { name: 'Users', description: 'User management' },
        { name: 'Profile', description: 'User profile and addresses' },
        { name: 'Settings', description: 'System settings' },
        { name: 'Audit', description: 'Audit logging' },
        { name: 'Reports', description: 'Analytics and reports' },
        { name: 'Webhooks', description: 'Webhook endpoints' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Session token from login',
          },
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'auth-token',
            description: 'Session token cookie',
          },
        },
      },
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] },
      ],
    },
  });

  // Register Swagger UI
  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      tryItOutEnabled: true,
    },
    uiHooks: {
      onRequest: function (_request: FastifyRequest, _reply: FastifyReply, next: () => void) {
        next();
      },
      preHandler: function (_request: FastifyRequest, _reply: FastifyReply, next: () => void) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header: string) => header,
    transformSpecification: (swaggerObject: Record<string, unknown>) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });

  fastify.log.info('Swagger UI available at /docs');
}

export default fp(swaggerPlugin, {
  name: 'swagger',
});

