import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireFeature } from '../../plugins/passport-auth.js';
import { createReportsService } from '../../services/reports.service.js';
import { buildRouteSchema, Security } from '../../utils/openapi.js';

// ============================================================================
// Schemas
// ============================================================================

const DateRangeQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const SalesReportSchema = z.object({
  totalRevenue: z.number(),
  orderCount: z.number(),
  averageOrderValue: z.number(),
  dailySales: z.array(z.object({
    date: z.string(),
    revenue: z.number(),
    orders: z.number(),
  })),
});

const CategoryReportSchema = z.array(z.object({
  categoryId: z.string(),
  categoryName: z.string(),
  revenue: z.number(),
  orderCount: z.number(),
  itemCount: z.number(),
  percentage: z.number(),
}));

const InventoryValueSchema = z.object({
  totalValue: z.number(),
  totalItems: z.number(),
  byCategory: z.array(z.object({
    categoryId: z.string(),
    categoryName: z.string(),
    value: z.number(),
    itemCount: z.number(),
  })),
});

const GMVReportSchema = z.object({
  totalGMV: z.number(),
  previousPeriodGMV: z.number(),
  growthRate: z.number(),
  byMonth: z.array(z.object({
    month: z.string(),
    gmv: z.number(),
  })),
});

const TopProductSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  sku: z.string(),
  revenue: z.number(),
  quantity: z.number(),
});

// ============================================================================
// Routes
// ============================================================================

export const reportsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', requireAuth);

  // GET /reports/sales
  fastify.get<{ Querystring: z.infer<typeof DateRangeQuerySchema> }>('/sales', {
    preHandler: [requireFeature('reports.salesByDay')],
    schema: buildRouteSchema({
      summary: 'Get sales report',
      description: 'Returns sales data with daily breakdown',
      tags: ['Reports'],
      security: Security.authenticated,
      querystring: DateRangeQuerySchema,
      response: {
        200: z.object({ data: SalesReportSchema }),
      },
    }),
  }, async (request) => {
    const service = createReportsService(request.em);
    const startDate = request.query.startDate ? new Date(request.query.startDate) : undefined;
    const endDate = request.query.endDate ? new Date(request.query.endDate) : undefined;
    const data = await service.getSalesReport(startDate, endDate);
    return { data };
  });

  // GET /reports/sales/export
  fastify.get<{ Querystring: z.infer<typeof DateRangeQuerySchema> }>('/sales/export', {
    preHandler: [requireFeature('reports.salesByDay')],
    schema: buildRouteSchema({
      summary: 'Export sales report',
      description: 'Export sales report as CSV',
      tags: ['Reports'],
      security: Security.authenticated,
      querystring: DateRangeQuerySchema,
      response: {
        200: z.unknown(), // CSV file
      },
    }),
  }, async (request, reply) => {
    const service = createReportsService(request.em);
    const startDate = request.query.startDate ? new Date(request.query.startDate) : undefined;
    const endDate = request.query.endDate ? new Date(request.query.endDate) : undefined;
    const csv = await service.exportSalesReport(startDate, endDate);
    
    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', 'attachment; filename="sales-report.csv"');
    return csv;
  });

  // GET /reports/categories
  fastify.get<{ Querystring: z.infer<typeof DateRangeQuerySchema> }>('/categories', {
    preHandler: [requireFeature('reports.salesByCategory')],
    schema: buildRouteSchema({
      summary: 'Get sales by category',
      description: 'Returns sales breakdown by product category',
      tags: ['Reports'],
      security: Security.authenticated,
      querystring: DateRangeQuerySchema,
      response: {
        200: z.object({ data: CategoryReportSchema }),
      },
    }),
  }, async (request) => {
    const service = createReportsService(request.em);
    const startDate = request.query.startDate ? new Date(request.query.startDate) : undefined;
    const endDate = request.query.endDate ? new Date(request.query.endDate) : undefined;
    const data = await service.getSalesByCategory(startDate, endDate);
    return { data };
  });

  // GET /reports/inventory-value
  fastify.get('/inventory-value', {
    preHandler: [requireFeature('reports.inventoryValue')],
    schema: buildRouteSchema({
      summary: 'Get inventory value',
      description: 'Returns total inventory value and breakdown by category',
      tags: ['Reports'],
      security: Security.authenticated,
      response: {
        200: z.object({ data: InventoryValueSchema }),
      },
    }),
  }, async (request) => {
    const service = createReportsService(request.em);
    const data = await service.getInventoryValue();
    return { data };
  });

  // GET /reports/gmv
  fastify.get<{ Querystring: z.infer<typeof DateRangeQuerySchema> }>('/gmv', {
    preHandler: [requireFeature('reports.gmv')],
    schema: buildRouteSchema({
      summary: 'Get GMV report',
      description: 'Returns Gross Merchandise Value with growth metrics (admin only)',
      tags: ['Reports'],
      security: Security.authenticated,
      querystring: DateRangeQuerySchema,
      response: {
        200: z.object({ data: GMVReportSchema }),
      },
    }),
  }, async (request) => {
    const service = createReportsService(request.em);
    const startDate = request.query.startDate ? new Date(request.query.startDate) : undefined;
    const endDate = request.query.endDate ? new Date(request.query.endDate) : undefined;
    const data = await service.getGMV(startDate, endDate);
    return { data };
  });

  // GET /reports/gmv/daily
  fastify.get<{ Querystring: { days?: string } }>('/gmv/daily', {
    preHandler: [requireFeature('reports.gmv')],
    schema: buildRouteSchema({
      summary: 'Get daily GMV',
      description: 'Returns daily GMV for the specified number of days',
      tags: ['Reports'],
      security: Security.authenticated,
      querystring: z.object({
        days: z.string().optional().describe('Number of days to include (default: 30)'),
      }),
      response: {
        200: z.object({
          data: z.array(z.object({
            date: z.string(),
            gmv: z.number(),
          })),
        }),
      },
    }),
  }, async (request) => {
    const service = createReportsService(request.em);
    const days = request.query.days ? parseInt(request.query.days, 10) : 30;
    const data = await service.getDailyGMV(days);
    return { data };
  });

  // GET /reports/top-products
  fastify.get<{
    Querystring: { limit?: string; startDate?: string; endDate?: string };
  }>('/top-products', {
    preHandler: [requireFeature('reports.salesByDay')],
    schema: buildRouteSchema({
      summary: 'Get top selling products',
      description: 'Returns top selling products by revenue',
      tags: ['Reports'],
      security: Security.authenticated,
      querystring: z.object({
        limit: z.string().optional().describe('Number of products to return (default: 10)'),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
      }),
      response: {
        200: z.object({ data: z.array(TopProductSchema) }),
      },
    }),
  }, async (request) => {
    const service = createReportsService(request.em);
    const limit = request.query.limit ? parseInt(request.query.limit, 10) : 10;
    const startDate = request.query.startDate ? new Date(request.query.startDate) : undefined;
    const endDate = request.query.endDate ? new Date(request.query.endDate) : undefined;
    const data = await service.getTopProducts(limit, startDate, endDate);
    return { data };
  });

  // GET /reports/low-performing
  fastify.get<{
    Querystring: { limit?: string; days?: string };
  }>('/low-performing', {
    preHandler: [requireFeature('reports.salesByDay')],
    schema: buildRouteSchema({
      summary: 'Get low performing products',
      description: 'Returns products with lowest sales',
      tags: ['Reports'],
      security: Security.authenticated,
      querystring: z.object({
        limit: z.string().optional().describe('Number of products to return (default: 10)'),
        days: z.string().optional().describe('Number of days to analyze (default: 30)'),
      }),
      response: {
        200: z.object({ data: z.array(TopProductSchema) }),
      },
    }),
  }, async (request) => {
    const service = createReportsService(request.em);
    const limit = request.query.limit ? parseInt(request.query.limit, 10) : 10;
    const days = request.query.days ? parseInt(request.query.days, 10) : 30;
    const data = await service.getLowPerformingProducts(limit, days);
    return { data };
  });
};
