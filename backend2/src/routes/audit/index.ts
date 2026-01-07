import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireFeature } from '../../plugins/passport-auth.js';
import { createAuditService, AuditAction } from '../../services/audit.service.js';
import { buildRouteSchema, Security } from '../../utils/openapi.js';

// ============================================================================
// Schemas
// ============================================================================

const AuditLogSchema = z.object({
  id: z.string().uuid(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string().nullable(),
  userId: z.string().uuid().nullable(),
  userName: z.string().nullable(),
  details: z.record(z.unknown()).nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.date(),
});

const AuditStatisticsSchema = z.object({
  totalActions: z.number(),
  actionsByType: z.record(z.number()),
  actionsByEntity: z.record(z.number()),
  topUsers: z.array(z.object({
    userId: z.string(),
    userName: z.string(),
    actionCount: z.number(),
  })),
});

const PaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

// ============================================================================
// Routes
// ============================================================================

export const auditRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', requireAuth);

  // GET /audit
  fastify.get<{
    Querystring: {
      userId?: string;
      action?: string;
      entityType?: string;
      entityId?: string;
      startDate?: string;
      endDate?: string;
      page?: string;
      limit?: string;
    };
  }>('/', {
    preHandler: [requireFeature('audit.view')],
    schema: buildRouteSchema({
      summary: 'List audit logs',
      description: 'Returns a paginated list of audit log entries with filters',
      tags: ['Audit'],
      security: Security.authenticated,
      querystring: z.object({
        userId: z.string().uuid().optional(),
        action: z.string().optional(),
        entityType: z.string().optional(),
        entityId: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
      }),
      response: {
        200: z.object({
          data: z.array(AuditLogSchema),
          meta: PaginationMetaSchema,
        }),
      },
    }),
  }, async (request) => {
    const service = createAuditService(request.em);
    const data = await service.getLogs({
      userId: request.query.userId,
      action: request.query.action as AuditAction,
      entityType: request.query.entityType,
      entityId: request.query.entityId,
      startDate: request.query.startDate ? new Date(request.query.startDate) : undefined,
      endDate: request.query.endDate ? new Date(request.query.endDate) : undefined,
      page: request.query.page ? parseInt(request.query.page, 10) : 1,
      limit: request.query.limit ? parseInt(request.query.limit, 10) : 50,
    });
    return data;
  });

  // GET /audit/statistics
  fastify.get<{
    Querystring: { startDate?: string; endDate?: string };
  }>('/statistics', {
    preHandler: [requireFeature('audit.view')],
    schema: buildRouteSchema({
      summary: 'Get audit statistics',
      description: 'Returns aggregate audit statistics',
      tags: ['Audit'],
      security: Security.authenticated,
      querystring: z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
      }),
      response: {
        200: z.object({ data: AuditStatisticsSchema }),
      },
    }),
  }, async (request) => {
    const service = createAuditService(request.em);
    const startDate = request.query.startDate ? new Date(request.query.startDate) : undefined;
    const endDate = request.query.endDate ? new Date(request.query.endDate) : undefined;
    const data = await service.getStatistics(startDate, endDate);
    return { data };
  });

  // POST /audit/export
  fastify.post<{
    Body: { startDate?: string; endDate?: string; format?: 'json' | 'csv' };
  }>('/export', {
    preHandler: [requireFeature('audit.export')],
    schema: buildRouteSchema({
      summary: 'Export audit logs',
      description: 'Export audit logs as JSON or CSV',
      tags: ['Audit'],
      security: Security.authenticated,
      body: z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        format: z.enum(['json', 'csv']).optional().default('json'),
      }),
      response: {
        200: z.unknown(), // File download
      },
    }),
  }, async (request, reply) => {
    const service = createAuditService(request.em);
    const startDate = request.body.startDate ? new Date(request.body.startDate) : undefined;
    const endDate = request.body.endDate ? new Date(request.body.endDate) : undefined;
    const format = request.body.format || 'json';
    
    const data = await service.exportLogs({ startDate, endDate, format });
    
    if (format === 'csv') {
      reply.header('Content-Type', 'text/csv');
      reply.header('Content-Disposition', 'attachment; filename="audit-log.csv"');
    } else {
      reply.header('Content-Type', 'application/json');
      reply.header('Content-Disposition', 'attachment; filename="audit-log.json"');
    }
    
    return data;
  });
};
