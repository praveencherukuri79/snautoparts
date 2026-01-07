import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { Category, Brand } from '../../entities/index.js';
import { createCatalogService } from '../../services/catalog.service.js';
import { buildRouteSchema, Security } from '../../utils/openapi.js';

// ============================================================================
// Schemas
// ============================================================================

const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  isActive: z.boolean(),
  sortOrder: z.number(),
});

const BrandSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
  isActive: z.boolean(),
});

const ProductSummarySchema = z.object({
  id: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  slug: z.string(),
  price: z.string(),
  compareAtPrice: z.string().nullable(),
  imageUrl: z.string().nullable(),
  stockQuantity: z.number(),
  isFeatured: z.boolean(),
});

const ProductDetailSchema = ProductSummarySchema.extend({
  description: z.string().nullable(),
  shortDescription: z.string().nullable(),
  images: z.array(z.string()),
  weight: z.number().nullable(),
  length: z.number().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  upc: z.string().nullable(),
  category: CategorySchema.optional(),
  brand: BrandSchema.nullable(),
  fitments: z.array(z.object({
    make: z.string(),
    model: z.string(),
    yearStart: z.number(),
    yearEnd: z.number(),
  })).optional(),
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

export const catalogRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /catalog/categories
  fastify.get('/categories', {
    schema: buildRouteSchema({
      summary: 'List all categories',
      description: 'Returns all active product categories in hierarchical order',
      tags: ['Catalog'],
      security: Security.public,
      response: {
        200: z.object({ data: z.array(CategorySchema) }),
      },
    }),
  }, async (request) => {
    const categories = await request.em.find(Category, { isActive: true }, {
      orderBy: { sortOrder: 'ASC', name: 'ASC' },
      populate: ['children'],
    });
    return { data: categories };
  });

  // GET /catalog/categories/:slug
  fastify.get<{ Params: { slug: string } }>('/categories/:slug', {
    schema: buildRouteSchema({
      summary: 'Get category by slug',
      description: 'Returns a single category by its URL slug',
      tags: ['Catalog'],
      security: Security.public,
      params: z.object({ slug: z.string() }),
      response: {
        200: z.object({ data: CategorySchema }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request, reply) => {
    const category = await request.em.findOne(Category, { slug: request.params.slug, isActive: true });
    if (!category) {
      return reply.status(404).send({ error: 'Category not found' });
    }
    return { data: category };
  });

  // GET /catalog/brands
  fastify.get('/brands', {
    schema: buildRouteSchema({
      summary: 'List all brands',
      description: 'Returns all active product brands',
      tags: ['Catalog'],
      security: Security.public,
      response: {
        200: z.object({ data: z.array(BrandSchema) }),
      },
    }),
  }, async (request) => {
    const brands = await request.em.find(Brand, { isActive: true }, {
      orderBy: { name: 'ASC' },
    });
    return { data: brands };
  });

  // GET /catalog/products
  fastify.get<{
    Querystring: {
      page?: string;
      limit?: string;
      category?: string;
      brand?: string;
      search?: string;
      featured?: string;
      minPrice?: string;
      maxPrice?: string;
      inStock?: string;
    };
  }>('/products', {
    schema: buildRouteSchema({
      summary: 'List products',
      description: 'Returns paginated list of products with optional filters',
      tags: ['Catalog'],
      security: Security.public,
      querystring: z.object({
        page: z.string().optional().describe('Page number (default: 1)'),
        limit: z.string().optional().describe('Items per page (default: 20, max: 100)'),
        category: z.string().optional().describe('Filter by category slug'),
        brand: z.string().optional().describe('Filter by brand slug'),
        search: z.string().optional().describe('Search query'),
        featured: z.enum(['true', 'false']).optional().describe('Filter featured products only'),
        minPrice: z.string().optional().describe('Minimum price filter'),
        maxPrice: z.string().optional().describe('Maximum price filter'),
        inStock: z.enum(['true', 'false']).optional().describe('Filter in-stock products only'),
      }),
      response: {
        200: z.object({
          data: z.array(ProductSummarySchema),
          meta: PaginationMetaSchema,
        }),
      },
    }),
  }, async (request) => {
    const service = createCatalogService(request.em);
    const result = await service.getProducts({
      categorySlug: request.query.category,
      brandSlug: request.query.brand,
      search: request.query.search,
      featured: request.query.featured === 'true',
      minPrice: request.query.minPrice ? parseFloat(request.query.minPrice) : undefined,
      maxPrice: request.query.maxPrice ? parseFloat(request.query.maxPrice) : undefined,
      inStock: request.query.inStock === 'true',
      page: request.query.page ? parseInt(request.query.page, 10) : 1,
      limit: request.query.limit ? Math.min(parseInt(request.query.limit, 10), 100) : 20,
    });
    return result;
  });

  // GET /catalog/products/featured
  fastify.get('/products/featured', {
    schema: buildRouteSchema({
      summary: 'Get featured products',
      description: 'Returns a list of featured products for homepage display',
      tags: ['Catalog'],
      security: Security.public,
      response: {
        200: z.object({ data: z.array(ProductSummarySchema) }),
      },
    }),
  }, async (request) => {
    const service = createCatalogService(request.em);
    const products = await service.getFeaturedProducts(8);
    return { data: products };
  });

  // GET /catalog/products/:slug
  fastify.get<{ Params: { slug: string } }>('/products/:slug', {
    schema: buildRouteSchema({
      summary: 'Get product by slug',
      description: 'Returns detailed product information including fitment data',
      tags: ['Catalog'],
      security: Security.public,
      params: z.object({ slug: z.string() }),
      response: {
        200: z.object({ data: ProductDetailSchema }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request, reply) => {
    const service = createCatalogService(request.em);
    const product = await service.getProductBySlug(request.params.slug);
    if (!product) {
      return reply.status(404).send({ error: 'Product not found' });
    }
    return { data: product };
  });

  // GET /catalog/search
  fastify.get<{ Querystring: { q: string; limit?: string } }>('/search', {
    schema: buildRouteSchema({
      summary: 'Search products',
      description: 'Search products by name, SKU, or description',
      tags: ['Catalog'],
      security: Security.public,
      querystring: z.object({
        q: z.string().min(2).describe('Search query (minimum 2 characters)'),
        limit: z.string().optional().describe('Maximum results to return'),
      }),
      response: {
        200: z.object({ data: z.array(ProductSummarySchema) }),
      },
    }),
  }, async (request) => {
    const { q, limit } = request.query;
    if (!q || q.length < 2) {
      return { data: [] };
    }

    const service = createCatalogService(request.em);
    const products = await service.searchProducts(q, limit ? parseInt(limit, 10) : 20);
    return { data: products };
  });

  // GET /catalog/fitment/makes
  fastify.get('/fitment/makes', {
    schema: buildRouteSchema({
      summary: 'Get vehicle makes',
      description: 'Returns all vehicle makes available in fitment data',
      tags: ['Catalog'],
      security: Security.public,
      response: {
        200: z.object({ data: z.array(z.string()) }),
      },
    }),
  }, async (request) => {
    const service = createCatalogService(request.em);
    const makes = await service.getFitmentMakes();
    return { data: makes };
  });

  // GET /catalog/fitment/models
  fastify.get<{ Querystring: { make: string } }>('/fitment/models', {
    schema: buildRouteSchema({
      summary: 'Get vehicle models',
      description: 'Returns vehicle models for a given make',
      tags: ['Catalog'],
      security: Security.public,
      querystring: z.object({
        make: z.string().describe('Vehicle make'),
      }),
      response: {
        200: z.object({ data: z.array(z.string()) }),
      },
    }),
  }, async (request) => {
    const { make } = request.query;
    if (!make) {
      return { data: [] };
    }
    const service = createCatalogService(request.em);
    const models = await service.getFitmentModels(make);
    return { data: models };
  });

  // GET /catalog/fitment/years
  fastify.get<{ Querystring: { make?: string; model?: string } }>('/fitment/years', {
    schema: buildRouteSchema({
      summary: 'Get vehicle years',
      description: 'Returns vehicle years for a given make and model',
      tags: ['Catalog'],
      security: Security.public,
      querystring: z.object({
        make: z.string().optional().describe('Vehicle make'),
        model: z.string().optional().describe('Vehicle model'),
      }),
      response: {
        200: z.object({ data: z.array(z.number()) }),
      },
    }),
  }, async (request) => {
    const { make, model } = request.query;
    
    if (make && model) {
      const service = createCatalogService(request.em);
      const years = await service.getFitmentYears(make, model);
      return { data: years };
    }
    
    // Return all years from current down to 1990
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i);
    return { data: years };
  });

  // GET /catalog/fitment/search
  fastify.get<{
    Querystring: { year: string; make: string; model: string; page?: string; limit?: string };
  }>('/fitment/search', {
    schema: buildRouteSchema({
      summary: 'Search by vehicle fitment',
      description: 'Find products that fit a specific vehicle (year, make, model)',
      tags: ['Catalog'],
      security: Security.public,
      querystring: z.object({
        year: z.string().describe('Vehicle year'),
        make: z.string().describe('Vehicle make'),
        model: z.string().describe('Vehicle model'),
        page: z.string().optional().describe('Page number'),
        limit: z.string().optional().describe('Items per page'),
      }),
      response: {
        200: z.object({
          data: z.array(ProductSummarySchema),
          meta: PaginationMetaSchema,
        }),
      },
    }),
  }, async (request) => {
    const { year, make, model, page = '1', limit = '20' } = request.query;
    
    if (!year || !make || !model) {
      return {
        data: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }

    const service = createCatalogService(request.em);
    const products = await service.searchByFitment(parseInt(year, 10), make, model);
    
    // Paginate results
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const offset = (pageNum - 1) * limitNum;
    const paginatedProducts = products.slice(offset, offset + limitNum);

    return {
      data: paginatedProducts,
      meta: {
        page: pageNum,
        limit: limitNum,
        total: products.length,
        totalPages: Math.ceil(products.length / limitNum),
      },
    };
  });
};
