import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireFeature } from '../../plugins/passport-auth.js';
import { createInventoryService } from '../../services/inventory.service.js';
import { inventoryAdjustmentSchema } from '../../schemas/inventory.schema.js';
import { Product, InventoryAdjustmentType } from '../../entities/index.js';
import { NotFoundError } from '../../plugins/error-handler.js';
import { buildRouteSchema, Security } from '../../utils/openapi.js';
import multipart from '@fastify/multipart';

// ============================================================================
// Schemas
// ============================================================================

const InventoryItemSchema = z.object({
  id: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  stockQuantity: z.number(),
  stockStatus: z.string(),
  lowStockThreshold: z.number(),
  fulfillmentType: z.string(),
  category: z.string().nullable(),
  brand: z.string().nullable(),
  price: z.string(),
});

const InventoryLogSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  quantityChange: z.number(),
  quantityBefore: z.number(),
  quantityAfter: z.number(),
  reason: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  createdBy: z.object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
  }).nullable(),
});

const LowStockAlertSchema = z.object({
  id: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  stockQuantity: z.number(),
  lowStockThreshold: z.number(),
  category: z.string().nullable(),
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

export const inventoryRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', requireAuth);
  await fastify.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

  // GET /inventory
  fastify.get<{
    Querystring: {
      page?: string;
      limit?: string;
      search?: string;
      category?: string;
      brand?: string;
      stockStatus?: string;
    };
  }>('/', {
    preHandler: [requireFeature('inventory.view')],
    schema: buildRouteSchema({
      summary: 'List inventory items',
      description: 'Returns a paginated list of inventory items with stock levels',
      tags: ['Inventory'],
      security: Security.authenticated,
      querystring: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        category: z.string().optional(),
        brand: z.string().optional(),
        stockStatus: z.enum(['in_stock', 'low_stock', 'out_of_stock']).optional(),
      }),
      response: {
        200: z.object({
          data: z.array(InventoryItemSchema),
          meta: PaginationMetaSchema,
        }),
      },
    }),
  }, async (request) => {
    const inventoryService = createInventoryService(request.em);
    const { page = '1', limit = '20', search, category, brand, stockStatus } = request.query;
    
    const result = await inventoryService.getInventory({
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limit, 10), 100),
      search,
      category,
      stockStatus: stockStatus as 'in_stock' | 'low_stock' | 'out_of_stock' | undefined,
    });

    return {
      data: result.data.map(p => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        stockQuantity: p.stockQuantity,
        stockStatus: p.stockStatus,
        lowStockThreshold: p.lowStockThreshold,
        fulfillmentType: p.fulfillmentType,
        category: p.category?.name ?? null,
        brand: p.brand?.name ?? null,
        price: p.price,
      })),
      meta: result.meta,
    };
  });

  // GET /inventory/alerts
  fastify.get('/alerts', {
    preHandler: [requireFeature('inventory.viewAlerts')],
    schema: buildRouteSchema({
      summary: 'Get low stock alerts',
      description: 'Returns products with stock below threshold',
      tags: ['Inventory'],
      security: Security.authenticated,
      response: {
        200: z.object({ data: z.array(LowStockAlertSchema) }),
      },
    }),
  }, async (request) => {
    const inventoryService = createInventoryService(request.em);
    const alerts = await inventoryService.getLowStockAlerts();
    return { data: alerts };
  });

  // GET /inventory/has-alerts
  fastify.get('/has-alerts', {
    preHandler: [requireFeature('inventory.viewAlerts')],
    schema: buildRouteSchema({
      summary: 'Check for alerts',
      description: 'Returns whether there are any low stock alerts (for nav badge)',
      tags: ['Inventory'],
      security: Security.authenticated,
      response: {
        200: z.object({ data: z.object({ hasAlerts: z.boolean() }) }),
      },
    }),
  }, async (request) => {
    const inventoryService = createInventoryService(request.em);
    const hasAlerts = await inventoryService.hasLowStockAlerts();
    return { data: { hasAlerts } };
  });

  // GET /inventory/:productId
  fastify.get<{ Params: { productId: string } }>('/:productId', {
    preHandler: [requireFeature('inventory.view')],
    schema: buildRouteSchema({
      summary: 'Get inventory details',
      description: 'Returns detailed inventory information for a product',
      tags: ['Inventory'],
      security: Security.authenticated,
      params: z.object({ productId: z.string().uuid() }),
      response: {
        200: z.object({ data: InventoryItemSchema }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request) => {
    const { productId } = request.params;

    const product = await request.em.findOne(Product, { id: productId }, {
      populate: ['category', 'brand'],
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return {
      data: {
        id: product.id,
        sku: product.sku,
        name: product.name,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        stockStatus: product.stockStatus,
        fulfillmentType: product.fulfillmentType,
        category: product.category?.name ?? null,
        brand: product.brand?.name ?? null,
        price: product.price,
      },
    };
  });

  // GET /inventory/:productId/history
  fastify.get<{
    Params: { productId: string };
    Querystring: { page?: string; limit?: string };
  }>('/:productId/history', {
    preHandler: [requireFeature('inventory.viewHistory')],
    schema: buildRouteSchema({
      summary: 'Get inventory history',
      description: 'Returns inventory adjustment history for a product',
      tags: ['Inventory'],
      security: Security.authenticated,
      params: z.object({ productId: z.string().uuid() }),
      querystring: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
      }),
      response: {
        200: z.object({
          data: z.array(InventoryLogSchema),
          meta: PaginationMetaSchema,
        }),
      },
    }),
  }, async (request) => {
    const inventoryService = createInventoryService(request.em);
    const { productId } = request.params;
    const { page = '1', limit = '20' } = request.query;

    const product = await request.em.findOne(Product, { id: productId });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const result = await inventoryService.getInventoryHistory(
      productId,
      parseInt(page, 10),
      Math.min(parseInt(limit, 10), 100),
    );

    return {
      data: result.data.map(log => ({
        id: log.id,
        type: log.type,
        quantityChange: log.quantityChange,
        quantityBefore: log.quantityBefore,
        quantityAfter: log.quantityAfter,
        reason: log.reason,
        notes: log.notes,
        createdAt: log.createdAt,
        createdBy: log.createdBy ? {
          id: log.createdBy.id,
          firstName: log.createdBy.firstName,
          lastName: log.createdBy.lastName,
        } : null,
      })),
      meta: result.meta,
    };
  });

  // POST /inventory/adjustments
  fastify.post('/adjustments', {
    preHandler: [requireFeature('inventory.adjust')],
    schema: buildRouteSchema({
      summary: 'Create inventory adjustment',
      description: 'Adjust inventory levels for a product',
      tags: ['Inventory'],
      security: Security.authenticated,
      body: inventoryAdjustmentSchema,
      response: {
        200: z.object({
          data: z.object({
            id: z.string().uuid(),
            productId: z.string().uuid(),
            type: z.string(),
            quantityChange: z.number(),
            quantityBefore: z.number(),
            quantityAfter: z.number(),
            currentStock: z.number(),
            stockStatus: z.string(),
          }),
        }),
      },
    }),
  }, async (request) => {
    const inventoryService = createInventoryService(request.em);
    const input = inventoryAdjustmentSchema.parse(request.body);
    const user = request.user!;

    const product = await request.em.findOne(Product, { id: input.productId });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const log = await inventoryService.adjustInventory(
      input.productId,
      user.id,
      {
        type: input.type as InventoryAdjustmentType,
        quantity: input.quantity,
        reason: input.reason,
        reference: input.referenceId,
      },
    );

    return {
      data: {
        id: log.id,
        productId: product.id,
        type: log.type,
        quantityChange: log.quantityChange,
        quantityBefore: log.quantityBefore,
        quantityAfter: log.quantityAfter,
        currentStock: product.stockQuantity,
        stockStatus: product.stockStatus,
      },
    };
  });

  // POST /inventory/import
  fastify.post('/import', {
    preHandler: [requireFeature('inventory.import')],
    schema: buildRouteSchema({
      summary: 'Import inventory from XLSX',
      description: 'Import inventory data from an Excel file',
      tags: ['Inventory'],
      security: Security.authenticated,
      response: {
        200: z.object({
          data: z.object({
            message: z.string(),
            processed: z.number(),
            updated: z.number(),
            created: z.number(),
            failed: z.number(),
            errors: z.array(z.object({
              row: z.number(),
              error: z.string(),
            })),
          }),
        }),
        400: z.object({ error: z.string() }),
      },
    }),
  }, async (request, reply) => {
    const inventoryService = createInventoryService(request.em);
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    const validMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (!validMimes.includes(data.mimetype)) {
      return reply.status(400).send({ error: 'Only XLSX/XLS files are supported' });
    }

    const buffer = await data.toBuffer();
    const result = await inventoryService.importFromXlsx(buffer, request.user!.id);

    return {
      data: {
        message: 'Inventory import completed',
        processed: result.totalRows,
        updated: result.successfulRows,
        created: 0,
        failed: result.errors.length,
        errors: result.errors.map(e => ({ row: e.row, error: e.message })),
      },
    };
  });
};
