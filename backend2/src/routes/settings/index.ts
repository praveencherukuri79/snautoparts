import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireFeature } from '../../plugins/passport-auth.js';
import { createSettingsService } from '../../services/settings.service.js';
import { buildRouteSchema, Security } from '../../utils/openapi.js';

// ============================================================================
// Schemas
// ============================================================================

const SettingSchema = z.object({
  key: z.string(),
  value: z.string(),
  category: z.string().nullable(),
  description: z.string().nullable(),
  isPublic: z.boolean(),
});

const UpdateSettingSchema = z.object({
  value: z.string(),
  category: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

const BulkUpdateSchema = z.object({
  updates: z.array(z.object({
    key: z.string(),
    value: z.string(),
  })),
});

// ============================================================================
// Routes
// ============================================================================

export const settingsRoutes: FastifyPluginAsync = async (fastify) => {
  // NOTE: No module-level requireAuth hook here because /settings/public must be public

  // GET /settings/public - PUBLIC endpoint (no auth required)
  // Must be defined BEFORE /:key to avoid route conflict
  fastify.get('/public', {
    schema: buildRouteSchema({
      summary: 'Get public settings',
      description: 'Returns settings marked as public (no auth required)',
      tags: ['Settings'],
      security: Security.public,
      response: {
        200: z.object({ data: z.array(SettingSchema) }),
      },
    }),
  }, async (request) => {
    const service = createSettingsService(request.em);
    const data = await service.getPublicSettings();
    return { data };
  });

  // GET /settings
  fastify.get<{ Querystring: { category?: string } }>('/', {
    preHandler: [requireAuth, requireFeature('settings.view')],
    schema: buildRouteSchema({
      summary: 'List settings',
      description: 'Returns all settings, optionally filtered by category',
      tags: ['Settings'],
      security: Security.authenticated,
      querystring: z.object({
        category: z.string().optional(),
      }),
      response: {
        200: z.object({ data: z.array(SettingSchema) }),
      },
    }),
  }, async (request) => {
    const service = createSettingsService(request.em);
    
    if (request.query.category) {
      const data = await service.getSettingsByCategory(request.query.category);
      return { data };
    }
    
    const data = await service.getAllSettings();
    return { data };
  });

  // GET /settings/:key
  fastify.get<{ Params: { key: string } }>('/:key', {
    preHandler: [requireAuth, requireFeature('settings.view')],
    schema: buildRouteSchema({
      summary: 'Get setting by key',
      description: 'Returns a single setting by key',
      tags: ['Settings'],
      security: Security.authenticated,
      params: z.object({ key: z.string() }),
      response: {
        200: z.object({ data: SettingSchema }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request, reply) => {
    const service = createSettingsService(request.em);
    const data = await service.getSetting(request.params.key);
    if (!data) {
      return reply.status(404).send({ error: 'Setting not found' });
    }
    return { data };
  });

  // PUT /settings/:key
  fastify.put<{
    Params: { key: string };
    Body: z.infer<typeof UpdateSettingSchema>;
  }>('/:key', {
    preHandler: [requireAuth, requireFeature('settings.update')],
    schema: buildRouteSchema({
      summary: 'Update or create setting',
      description: 'Update an existing setting or create a new one',
      tags: ['Settings'],
      security: Security.authenticated,
      params: z.object({ key: z.string() }),
      body: UpdateSettingSchema,
      response: {
        200: z.object({ data: SettingSchema }),
      },
    }),
  }, async (request) => {
    const service = createSettingsService(request.em);
    const data = await service.upsertSetting(request.params.key, request.body.value, {
      category: request.body.category,
      description: request.body.description,
      isPublic: request.body.isPublic,
    });
    return { data };
  });

  // POST /settings/bulk
  fastify.post<{ Body: z.infer<typeof BulkUpdateSchema> }>('/bulk', {
    preHandler: [requireAuth, requireFeature('settings.update')],
    schema: buildRouteSchema({
      summary: 'Bulk update settings',
      description: 'Update multiple settings at once',
      tags: ['Settings'],
      security: Security.authenticated,
      body: BulkUpdateSchema,
      response: {
        200: z.object({ data: z.array(SettingSchema) }),
      },
    }),
  }, async (request) => {
    const service = createSettingsService(request.em);
    const data = await service.bulkUpdate(request.body.updates);
    return { data };
  });
};
