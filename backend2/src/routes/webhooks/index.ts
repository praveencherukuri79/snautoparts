import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireFeature } from '../../plugins/passport-auth.js';
import { Webhook, PaymentEvent, PaymentEventType, PaymentEventStatus, Order, OrderStatus } from '../../entities/index.js';
import { getStripeService, handleStripeWebhook } from '../../integrations/payments/index.js';
import { logger } from '../../config/logger.js';
import { buildRouteSchema, Security } from '../../utils/openapi.js';

// ============================================================================
// Schemas
// ============================================================================

const WebhookSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  url: z.string().url(),
  events: z.array(z.string()),
  secret: z.string().optional(),
  isActive: z.boolean(),
  lastTriggeredAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const CreateWebhookSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

const UpdateWebhookSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  events: z.array(z.string()).optional(),
  secret: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// Routes
// ============================================================================

export const webhooksRoutes: FastifyPluginAsync = async (fastify) => {
  const stripeService = getStripeService();

  // ============ PUBLIC WEBHOOK ENDPOINTS (no auth) ============

  // POST /webhooks/stripe
  fastify.post('/stripe', {
    config: { rawBody: true },
    schema: buildRouteSchema({
      summary: 'Stripe webhook endpoint',
      description: 'Receives and processes Stripe webhook events (payment_intent.succeeded, payment_intent.payment_failed, charge.refunded, etc.)',
      tags: ['Webhooks'],
      security: Security.public,
      response: {
        200: z.object({ received: z.boolean() }),
        400: z.object({ error: z.string() }),
      },
    }),
  }, async (request, reply) => {
    const signature = request.headers['stripe-signature'] as string;
    if (!signature) {
      return reply.status(400).send({ error: 'Missing stripe-signature header' });
    }

    const rawBody = (request as { rawBody?: string | Buffer }).rawBody || JSON.stringify(request.body);
    const event = stripeService.verifyWebhook(rawBody, signature);
    
    if (!event) {
      return reply.status(400).send({ error: 'Invalid webhook signature' });
    }

    // Process the webhook using the centralized handler
    try {
      const result = await handleStripeWebhook(request.em, event);
      logger.info(
        { eventId: event.id, type: event.type, handled: result.handled, action: result.action },
        'Stripe webhook processed',
      );
    } catch (error) {
      logger.error(
        { eventId: event.id, type: event.type, error },
        'Stripe webhook processing failed',
      );
      // Still return 200 to acknowledge receipt (Stripe will retry otherwise)
    }

    return { received: true };
  });

  // POST /webhooks/supplier/:id
  fastify.post<{ Params: { id: string } }>('/supplier/:id', {
    schema: buildRouteSchema({
      summary: 'Supplier webhook endpoint',
      description: 'Receives webhooks from supplier integrations (order status updates, tracking, etc.)',
      tags: ['Webhooks'],
      security: Security.public,
      params: z.object({ id: z.string().describe('Supplier ID') }),
      response: {
        200: z.object({ received: z.boolean() }),
      },
    }),
  }, async (request) => {
    const supplierId = request.params.id;
    const payload = request.body as Record<string, unknown>;
    
    logger.info({ supplierId, payload }, 'Received supplier webhook');
    
    // Supplier webhook handling is done per-supplier integration
    // Each supplier module registers its own webhook processor
    
    return { received: true };
  });

  // ============ WEBHOOK MANAGEMENT ENDPOINTS (admin only) ============

  // GET /webhooks
  fastify.get('/', {
    preHandler: [requireAuth, requireFeature('settings.update')],
    schema: buildRouteSchema({
      summary: 'List all webhooks',
      description: 'Returns all configured outgoing webhooks',
      tags: ['Webhooks'],
      security: Security.authenticated,
      response: {
        200: z.object({ data: z.array(WebhookSchema) }),
      },
    }),
  }, async (request) => {
    const webhooks = await request.em.find(Webhook, {}, {
      orderBy: { createdAt: 'DESC' },
    });
    return { data: webhooks };
  });

  // POST /webhooks
  fastify.post<{
    Body: z.infer<typeof CreateWebhookSchema>;
  }>('/', {
    preHandler: [requireAuth, requireFeature('settings.update')],
    schema: buildRouteSchema({
      summary: 'Create webhook',
      description: 'Create a new outgoing webhook configuration',
      tags: ['Webhooks'],
      security: Security.authenticated,
      body: CreateWebhookSchema,
      response: {
        201: z.object({ data: WebhookSchema }),
      },
    }),
  }, async (request, reply) => {
    const webhook = new Webhook();
    webhook.name = request.body.name;
    webhook.url = request.body.url;
    webhook.events = request.body.events;
    webhook.secret = request.body.secret;
    webhook.isActive = request.body.isActive ?? true;
    await request.em.persistAndFlush(webhook);
    return reply.status(201).send({ data: webhook });
  });

  // GET /webhooks/:id
  fastify.get<{ Params: { id: string } }>('/:id', {
    preHandler: [requireAuth, requireFeature('settings.update')],
    schema: buildRouteSchema({
      summary: 'Get webhook by ID',
      description: 'Returns a single webhook configuration',
      tags: ['Webhooks'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: z.object({ data: WebhookSchema }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request, reply) => {
    const webhook = await request.em.findOne(Webhook, { id: request.params.id });
    if (!webhook) {
      return reply.status(404).send({ error: 'Webhook not found' });
    }
    return { data: webhook };
  });

  // PATCH /webhooks/:id
  fastify.patch<{
    Params: { id: string };
    Body: z.infer<typeof UpdateWebhookSchema>;
  }>('/:id', {
    preHandler: [requireAuth, requireFeature('settings.update')],
    schema: buildRouteSchema({
      summary: 'Update webhook',
      description: 'Update an existing webhook configuration',
      tags: ['Webhooks'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      body: UpdateWebhookSchema,
      response: {
        200: z.object({ data: WebhookSchema }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request, reply) => {
    const webhook = await request.em.findOne(Webhook, { id: request.params.id });
    if (!webhook) {
      return reply.status(404).send({ error: 'Webhook not found' });
    }

    if (request.body.name !== undefined) webhook.name = request.body.name;
    if (request.body.url !== undefined) webhook.url = request.body.url;
    if (request.body.events !== undefined) webhook.events = request.body.events;
    if (request.body.secret !== undefined) webhook.secret = request.body.secret;
    if (request.body.isActive !== undefined) webhook.isActive = request.body.isActive;

    await request.em.flush();
    return { data: webhook };
  });

  // DELETE /webhooks/:id
  fastify.delete<{ Params: { id: string } }>('/:id', {
    preHandler: [requireAuth, requireFeature('settings.update')],
    schema: buildRouteSchema({
      summary: 'Delete webhook',
      description: 'Delete a webhook configuration',
      tags: ['Webhooks'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: z.object({ data: z.object({ message: z.string() }) }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request, reply) => {
    const webhook = await request.em.findOne(Webhook, { id: request.params.id });
    if (!webhook) {
      return reply.status(404).send({ error: 'Webhook not found' });
    }
    await request.em.removeAndFlush(webhook);
    return { data: { message: 'Webhook deleted' } };
  });

  // POST /webhooks/:id/test
  fastify.post<{ Params: { id: string } }>('/:id/test', {
    preHandler: [requireAuth, requireFeature('settings.update')],
    schema: buildRouteSchema({
      summary: 'Test webhook',
      description: 'Send a test payload to the webhook URL',
      tags: ['Webhooks'],
      security: Security.authenticated,
      params: z.object({ id: z.string().uuid() }),
      response: {
        200: z.object({
          data: z.object({
            success: z.boolean(),
            status: z.number().optional(),
            statusText: z.string().optional(),
            error: z.string().optional(),
          }),
        }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request, reply) => {
    const webhook = await request.em.findOne(Webhook, { id: request.params.id });
    if (!webhook) {
      return reply.status(404).send({ error: 'Webhook not found' });
    }

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhook.secret ? { 'X-Webhook-Secret': webhook.secret } : {}),
        },
        body: JSON.stringify({
          event: 'test',
          timestamp: new Date().toISOString(),
          data: { message: 'This is a test webhook' },
        }),
      });

      webhook.lastTriggeredAt = new Date();
      await request.em.flush();

      return {
        data: {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
        },
      };
    } catch (error) {
      return {
        data: {
          success: false,
          error: (error as Error).message,
        },
      };
    }
  });
};
