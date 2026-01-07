import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireFeature } from '../../plugins/passport-auth.js';
import { createDropshipService } from '../../services/dropship.service.js';
import { createAffiliateService } from '../../services/affiliate.service.js';
import { AffiliateOrderStatus } from '../../entities/index.js';
import { buildRouteSchema, Security } from '../../utils/openapi.js';

// ============================================================================
// Schemas
// ============================================================================

const AffiliateOrderSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  orderNumber: z.string(),
  affiliateId: z.string().uuid(),
  affiliateName: z.string(),
  status: z.nativeEnum(AffiliateOrderStatus),
  externalOrderId: z.string().nullable(),
  lastError: z.string().nullable(),
  retryCount: z.number(),
  nextRetryAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const AffiliateSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  baseUrl: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const AffiliateProductMappingSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string(),
  productSku: z.string(),
  affiliateSku: z.string(),
  affiliateProductId: z.string().nullable(),
  priceMultiplier: z.number().nullable(),
  isActive: z.boolean(),
});

const DropshipStatisticsSchema = z.object({
  totalOrders: z.number(),
  pendingOrders: z.number(),
  failedOrders: z.number(),
  successRate: z.number(),
  ordersByAffiliate: z.array(z.object({
    affiliateId: z.string(),
    affiliateName: z.string(),
    orderCount: z.number(),
    successCount: z.number(),
  })),
});

const PaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

const CreateAffiliateSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).max(50),
  baseUrl: z.string().url(),
  apiKey: z.string(),
  apiSecret: z.string().optional(),
  retryPolicy: z.object({
    maxRetries: z.number().min(0).max(10),
    backoffMs: z.array(z.number()),
  }).optional(),
  mappingRules: z.record(z.unknown()).optional(),
});

const UpdateAffiliateSchema = z.object({
  name: z.string().min(1).optional(),
  baseUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  retryPolicy: z.object({
    maxRetries: z.number().min(0).max(10),
    backoffMs: z.array(z.number()),
  }).optional(),
  mappingRules: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

const AddProductMappingSchema = z.object({
  productId: z.string().uuid(),
  affiliateSku: z.string(),
  affiliateProductId: z.string().optional(),
  priceMultiplier: z.number().min(0).optional(),
});

// ============================================================================
// Routes
// ============================================================================

export const dropshipRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', requireAuth);

  // GET /dropship/orders
  fastify.get<{
    Querystring: {
      affiliateId?: string;
      status?: string;
      orderId?: string;
      page?: string;
      limit?: string;
    };
  }>('/orders', {
    preHandler: [requireFeature('dropship.viewOrders')],
    schema: buildRouteSchema({
      summary: 'List affiliate orders',
      description: 'Returns a paginated list of drop-ship orders',
      tags: ['Dropship'],
      security: Security.authenticated,
      querystring: z.object({
        affiliateId: z.string().uuid().optional(),
        status: z.nativeEnum(AffiliateOrderStatus).optional(),
        orderId: z.string().uuid().optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
      }),
      response: {
        200: z.object({
          data: z.array(AffiliateOrderSchema),
          meta: PaginationMetaSchema,
        }),
      },
    }),
  }, async (request) => {
    const service = createDropshipService(request.em);
    const data = await service.getAffiliateOrders({
      affiliateId: request.query.affiliateId,
      status: request.query.status as AffiliateOrderStatus,
      orderId: request.query.orderId,
      page: request.query.page ? parseInt(request.query.page, 10) : 1,
      limit: request.query.limit ? parseInt(request.query.limit, 10) : 20,
    });
    return data;
  });

  // GET /dropship/orders/:id
  fastify.get<{ Params: { id: string } }>('/orders/:id', {
    preHandler: [requireFeature('dropship.viewOrders')],
    schema: buildRouteSchema({
      summary: 'Get affiliate order',
      description: 'Returns detailed affiliate order information',
      tags: ['Dropship'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: z.object({ data: AffiliateOrderSchema }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request, reply) => {
    const service = createDropshipService(request.em);
    const data = await service.getAffiliateOrderById(request.params.id);
    if (!data) {
      return reply.status(404).send({ error: 'Affiliate order not found' });
    }
    return { data };
  });

  // POST /dropship/orders/:id/retry
  fastify.post<{ Params: { id: string } }>('/orders/:id/retry', {
    preHandler: [requireFeature('dropship.retryPush')],
    schema: buildRouteSchema({
      summary: 'Retry failed order',
      description: 'Retry pushing a failed affiliate order',
      tags: ['Dropship'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: z.object({ data: AffiliateOrderSchema }),
      },
    }),
  }, async (request) => {
    const service = createDropshipService(request.em);
    const data = await service.retryAffiliateOrder(request.params.id);
    return { data };
  });

  // GET /dropship/statistics
  fastify.get('/statistics', {
    preHandler: [requireFeature('dropship.viewOrders')],
    schema: buildRouteSchema({
      summary: 'Get dropship statistics',
      description: 'Returns aggregate statistics for drop-ship operations',
      tags: ['Dropship'],
      security: Security.authenticated,
      response: {
        200: z.object({ data: DropshipStatisticsSchema }),
      },
    }),
  }, async (request) => {
    const service = createDropshipService(request.em);
    const data = await service.getStatistics();
    return { data };
  });

  // ============ AFFILIATE MANAGEMENT (Admin only) ============

  // GET /dropship/affiliates
  fastify.get<{
    Querystring: { isActive?: string; page?: string; limit?: string };
  }>('/affiliates', {
    preHandler: [requireFeature('dropship.manageAffiliates')],
    schema: buildRouteSchema({
      summary: 'List affiliates',
      description: 'Returns a list of configured affiliates',
      tags: ['Dropship'],
      security: Security.authenticated,
      querystring: z.object({
        isActive: z.enum(['true', 'false']).optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
      }),
      response: {
        200: z.object({
          data: z.array(AffiliateSchema),
          meta: PaginationMetaSchema,
        }),
      },
    }),
  }, async (request) => {
    const service = createAffiliateService(request.em);
    const data = await service.getAffiliates({
      isActive: request.query.isActive === 'true' ? true : request.query.isActive === 'false' ? false : undefined,
      page: request.query.page ? parseInt(request.query.page, 10) : 1,
      limit: request.query.limit ? parseInt(request.query.limit, 10) : 20,
    });
    return data;
  });

  // GET /dropship/affiliates/:id
  fastify.get<{ Params: { id: string } }>('/affiliates/:id', {
    preHandler: [requireFeature('dropship.manageAffiliates')],
    schema: buildRouteSchema({
      summary: 'Get affiliate',
      description: 'Returns affiliate configuration details',
      tags: ['Dropship'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: z.object({ data: AffiliateSchema }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request, reply) => {
    const service = createAffiliateService(request.em);
    const data = await service.getAffiliateById(request.params.id);
    if (!data) {
      return reply.status(404).send({ error: 'Affiliate not found' });
    }
    return { data };
  });

  // POST /dropship/affiliates
  fastify.post<{ Body: z.infer<typeof CreateAffiliateSchema> }>('/affiliates', {
    preHandler: [requireFeature('dropship.manageAffiliates')],
    schema: buildRouteSchema({
      summary: 'Create affiliate',
      description: 'Create a new affiliate configuration',
      tags: ['Dropship'],
      security: Security.authenticated,
      body: CreateAffiliateSchema,
      response: {
        201: z.object({ data: AffiliateSchema }),
      },
    }),
  }, async (request, reply) => {
    const service = createAffiliateService(request.em);
    const data = await service.createAffiliate(request.body);
    return reply.status(201).send({ data });
  });

  // PATCH /dropship/affiliates/:id
  fastify.patch<{
    Params: { id: string };
    Body: z.infer<typeof UpdateAffiliateSchema>;
  }>('/affiliates/:id', {
    preHandler: [requireFeature('dropship.manageAffiliates')],
    schema: buildRouteSchema({
      summary: 'Update affiliate',
      description: 'Update an affiliate configuration',
      tags: ['Dropship'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      body: UpdateAffiliateSchema,
      response: {
        200: z.object({ data: AffiliateSchema }),
      },
    }),
  }, async (request) => {
    const service = createAffiliateService(request.em);
    const data = await service.updateAffiliate(request.params.id, request.body);
    return { data };
  });

  // DELETE /dropship/affiliates/:id
  fastify.delete<{ Params: { id: string } }>('/affiliates/:id', {
    preHandler: [requireFeature('dropship.manageAffiliates')],
    schema: buildRouteSchema({
      summary: 'Delete affiliate',
      description: 'Delete an affiliate configuration',
      tags: ['Dropship'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: z.object({ data: z.object({ message: z.string() }) }),
      },
    }),
  }, async (request) => {
    const service = createAffiliateService(request.em);
    await service.deleteAffiliate(request.params.id);
    return { data: { message: 'Affiliate deleted' } };
  });

  // GET /dropship/affiliates/:id/products
  fastify.get<{
    Params: { id: string };
    Querystring: { page?: string; limit?: string };
  }>('/affiliates/:id/products', {
    preHandler: [requireFeature('dropship.manageAffiliates')],
    schema: buildRouteSchema({
      summary: 'List affiliate product mappings',
      description: 'Returns products mapped to an affiliate',
      tags: ['Dropship'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      querystring: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
      }),
      response: {
        200: z.object({
          data: z.array(AffiliateProductMappingSchema),
          meta: PaginationMetaSchema,
        }),
      },
    }),
  }, async (request) => {
    const service = createAffiliateService(request.em);
    const data = await service.getProductMappings(
      request.params.id,
      request.query.page ? parseInt(request.query.page, 10) : 1,
      request.query.limit ? parseInt(request.query.limit, 10) : 20,
    );
    return data;
  });

  // POST /dropship/affiliates/:id/products
  fastify.post<{
    Params: { id: string };
    Body: z.infer<typeof AddProductMappingSchema>;
  }>('/affiliates/:id/products', {
    preHandler: [requireFeature('dropship.manageAffiliates')],
    schema: buildRouteSchema({
      summary: 'Add product mapping',
      description: 'Map a product to an affiliate',
      tags: ['Dropship'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      body: AddProductMappingSchema,
      response: {
        201: z.object({ data: AffiliateProductMappingSchema }),
      },
    }),
  }, async (request, reply) => {
    const service = createAffiliateService(request.em);
    const data = await service.addProductMapping(request.params.id, request.body.productId, {
      affiliateSku: request.body.affiliateSku,
      affiliateProductId: request.body.affiliateProductId,
      priceMultiplier: request.body.priceMultiplier,
    });
    return reply.status(201).send({ data });
  });

  // DELETE /dropship/affiliates/:id/products/:mappingId
  fastify.delete<{
    Params: { id: string; mappingId: string };
  }>('/affiliates/:id/products/:mappingId', {
    preHandler: [requireFeature('dropship.manageAffiliates')],
    schema: buildRouteSchema({
      summary: 'Remove product mapping',
      description: 'Remove a product mapping from an affiliate',
      tags: ['Dropship'],
      security: Security.authenticated,
      params: z.object({
        id: z.string().uuid(),
        mappingId: z.string().uuid(),
      }),
      response: {
        200: z.object({ data: z.object({ message: z.string() }) }),
      },
    }),
  }, async (request) => {
    const service = createAffiliateService(request.em);
    await service.removeProductMapping(request.params.id, request.params.mappingId);
    return { data: { message: 'Product mapping removed' } };
  });
};
