import { FastifyInstance, FastifyRequest } from 'fastify';
import { paginationSchema, productFilterSchema, idParamSchema } from '../../schemas/index.js';

export const catalogRoutes = async (fastify: FastifyInstance) => {
  // Get all categories
  fastify.get('/categories', async () => {
    const categories = await fastify.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
    return { data: categories };
  });

  // Get category by slug
  fastify.get('/categories/:slug', async (request: FastifyRequest<{ Params: { slug: string } }>) => {
    const category = await fastify.prisma.category.findUnique({
      where: { slug: request.params.slug, isActive: true },
      include: {
        children: { where: { isActive: true } },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return fastify.httpErrors.notFound('Category not found');
    }

    return { data: category };
  });

  // Get all brands
  fastify.get('/brands', async () => {
    const brands = await fastify.prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return { data: brands };
  });

  // Get products with filters
  fastify.get('/products', async (request: FastifyRequest<{ Querystring: unknown }>) => {
    const pagination = paginationSchema.parse(request.query);
    const filters = productFilterSchema.parse(request.query);

    const where: Record<string, unknown> = { isActive: true };

    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.brandId) where.brandId = filters.brandId;
    if (filters.inStock) where.stockQuantity = { gt: 0 };
    if (filters.featured) where.isFeatured = true;
    if (filters.minPrice || filters.maxPrice) {
      where.price = {
        ...(filters.minPrice && { gte: filters.minPrice }),
        ...(filters.maxPrice && { lte: filters.maxPrice }),
      };
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Record<string, string> = {};
    switch (filters.sortBy) {
      case 'price_asc': orderBy.price = 'asc'; break;
      case 'price_desc': orderBy.price = 'desc'; break;
      case 'name_asc': orderBy.name = 'asc'; break;
      case 'name_desc': orderBy.name = 'desc'; break;
      case 'newest': orderBy.createdAt = 'desc'; break;
      default: orderBy.createdAt = 'desc';
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [products, total] = await Promise.all([
      fastify.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: pagination.limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
        },
      }),
      fastify.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  });

  // Get featured products (must be before :slug to avoid "featured" being matched as slug)
  fastify.get('/products/featured', async (request: FastifyRequest<{ Querystring: unknown }>) => {
    const pagination = paginationSchema.parse(request.query);

    const products = await fastify.prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: pagination.limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
    });

    return { data: products };
  });

  // Get product by slug
  fastify.get('/products/:slug', async (request: FastifyRequest<{ Params: { slug: string } }>) => {
    const product = await fastify.prisma.product.findUnique({
      where: { slug: request.params.slug, isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        fitments: true,
      },
    });

    if (!product) {
      return fastify.httpErrors.notFound('Product not found');
    }

    return { data: product };
  });

  // Search products
  fastify.get('/search', async (request: FastifyRequest<{ Querystring: { q: string } }>) => {
    const query = request.query.q;
    const pagination = paginationSchema.parse(request.query);

    if (!query || query.length < 2) {
      return { data: [], meta: { total: 0 } };
    }

    const products = await fastify.prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: pagination.limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
    });

    return { data: products };
  });
};

