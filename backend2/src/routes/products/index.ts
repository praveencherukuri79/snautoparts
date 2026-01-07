import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireFeature } from '../../plugins/passport-auth.js';
import { Product, Category, Brand, ProductFitment } from '../../entities/index.js';
import {
  createProductSchema,
  updateProductSchema,
  productFitmentSchema,
  productsQuerySchema,
} from '../../schemas/product.schema.js';
import { idParamSchema } from '../../schemas/common.schema.js';
import { NotFoundError, ConflictError } from '../../plugins/error-handler.js';
import { slugify, generateUniqueSlug } from '../../utils/slug.js';
import { calculateOffset, paginatedResponse } from '../../utils/pagination.js';
import { buildRouteSchema, Security } from '../../utils/openapi.js';

// ============================================================================
// Schemas
// ============================================================================

const ProductSchema = z.object({
  id: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  shortDescription: z.string().nullable(),
  price: z.string(),
  compareAtPrice: z.string().nullable(),
  costPrice: z.string().nullable(),
  imageUrl: z.string().nullable(),
  images: z.array(z.string()),
  stockQuantity: z.number(),
  stockStatus: z.string(),
  lowStockThreshold: z.number(),
  fulfillmentType: z.string(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  category: z.object({ id: z.string(), name: z.string(), slug: z.string() }).nullable(),
  brand: z.object({ id: z.string(), name: z.string(), slug: z.string() }).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const FitmentSchema = z.object({
  id: z.string().uuid(),
  make: z.string(),
  model: z.string(),
  yearStart: z.number(),
  yearEnd: z.number(),
  submodel: z.string().nullable(),
  engine: z.string().nullable(),
  notes: z.string().nullable(),
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

export const productsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', requireAuth);

  // GET /products (Manager view - includes inactive)
  fastify.get('/', {
    preHandler: [requireFeature('products.update')],
    schema: buildRouteSchema({
      summary: 'List products (management)',
      description: 'Returns a paginated list of products including inactive ones (manager/admin)',
      tags: ['Products'],
      security: Security.authenticated,
      querystring: productsQuerySchema,
      response: {
        200: z.object({
          data: z.array(ProductSchema),
          meta: PaginationMetaSchema,
        }),
      },
    }),
  }, async (request) => {
    const query = productsQuerySchema.parse(request.query);
    const offset = calculateOffset(query.page, query.limit);

    const where: Record<string, unknown> = {};

    if (query.active !== undefined) {
      where.isActive = query.active;
    }
    if (query.featured) {
      where.isFeatured = true;
    }
    if (query.inStock) {
      where.stockQuantity = { $gt: 0 };
    }
    if (query.category) {
      where['category.slug'] = query.category;
    }
    if (query.brand) {
      where['brand.slug'] = query.brand;
    }

    const [products, total] = await request.em.findAndCount(
      Product,
      where,
      {
        orderBy: { [query.sortBy]: query.sortOrder },
        limit: query.limit,
        offset,
        populate: ['category', 'brand'],
      }
    );

    const data = products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDescription: p.shortDescription,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      costPrice: p.costPrice,
      imageUrl: p.imageUrl,
      images: p.images,
      stockQuantity: p.stockQuantity,
      stockStatus: p.stockStatus,
      lowStockThreshold: p.lowStockThreshold,
      fulfillmentType: p.fulfillmentType,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
      brand: p.brand ? { id: p.brand.id, name: p.brand.name, slug: p.brand.slug } : null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return paginatedResponse(data, query.page, query.limit, total);
  });

  // GET /products/:id
  fastify.get<{ Params: { id: string } }>('/:id', {
    preHandler: [requireFeature('products.update')],
    schema: buildRouteSchema({
      summary: 'Get product by ID',
      description: 'Returns detailed product information including fitments',
      tags: ['Products'],
      security: Security.authenticated,
      params: idParamSchema,
      response: {
        200: z.object({
          data: ProductSchema.extend({ fitments: z.array(FitmentSchema) }),
        }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request) => {
    const { id } = idParamSchema.parse(request.params);

    const product = await request.em.findOne(Product, { id }, {
      populate: ['category', 'brand', 'fitments'],
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return {
      data: {
        id: product.id,
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        costPrice: product.costPrice,
        imageUrl: product.imageUrl,
        images: product.images,
        weight: product.weight,
        weightUnit: product.weightUnit,
        length: product.length,
        width: product.width,
        height: product.height,
        dimensionUnit: product.dimensionUnit,
        stockQuantity: product.stockQuantity,
        stockStatus: product.stockStatus,
        lowStockThreshold: product.lowStockThreshold,
        upc: product.upc,
        fulfillmentType: product.fulfillmentType,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        category: product.category ? { id: product.category.id, name: product.category.name, slug: product.category.slug } : null,
        brand: product.brand ? { id: product.brand.id, name: product.brand.name, slug: product.brand.slug } : null,
        fitments: product.fitments.getItems().map((f) => ({
          id: f.id,
          make: f.make,
          model: f.model,
          yearStart: f.yearStart,
          yearEnd: f.yearEnd,
          submodel: f.submodel,
          engine: f.engine,
          notes: f.notes,
        })),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      },
    };
  });

  // POST /products
  fastify.post('/', {
    preHandler: [requireFeature('products.create')],
    schema: buildRouteSchema({
      summary: 'Create product',
      description: 'Create a new product',
      tags: ['Products'],
      security: Security.authenticated,
      body: createProductSchema,
      response: {
        200: z.object({
          data: z.object({
            id: z.string().uuid(),
            sku: z.string(),
            name: z.string(),
            slug: z.string(),
          }),
        }),
      },
    }),
  }, async (request) => {
    const input = createProductSchema.parse(request.body);

    const existingSku = await request.em.findOne(Product, { sku: input.sku });
    if (existingSku) {
      throw new ConflictError('SKU already exists');
    }

    const category = await request.em.findOne(Category, { id: input.categoryId });
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const brand = input.brandId ? await request.em.findOne(Brand, { id: input.brandId }) : undefined;

    let slug = slugify(input.name);
    const existingSlug = await request.em.findOne(Product, { slug });
    if (existingSlug) {
      slug = generateUniqueSlug(input.name, input.sku);
    }

    const product = new Product();
    product.sku = input.sku;
    product.name = input.name;
    product.slug = slug;
    product.description = input.description;
    product.shortDescription = input.shortDescription;
    product.price = input.price.toString();
    product.compareAtPrice = input.compareAtPrice?.toString();
    product.costPrice = input.costPrice?.toString();
    product.category = category;
    product.brand = brand ?? undefined;
    product.imageUrl = input.imageUrl;
    product.images = input.images ?? [];
    if (input.weight) product.weight = input.weight.toString();
    if (input.weightUnit) product.weightUnit = input.weightUnit;
    if (input.length) product.length = input.length.toString();
    if (input.width) product.width = input.width.toString();
    if (input.height) product.height = input.height.toString();
    if (input.dimensionUnit) product.dimensionUnit = input.dimensionUnit;
    if (input.stockQuantity !== undefined) product.stockQuantity = input.stockQuantity;
    if (input.lowStockThreshold !== undefined) product.lowStockThreshold = input.lowStockThreshold;
    product.upc = input.upc;
    if (input.fulfillmentType) product.fulfillmentType = input.fulfillmentType as any;
    if (input.isActive !== undefined) product.isActive = input.isActive;
    if (input.isFeatured !== undefined) product.isFeatured = input.isFeatured;
    product.metaTitle = input.metaTitle;
    product.metaDescription = input.metaDescription;

    await request.em.persistAndFlush(product);

    return {
      data: {
        id: product.id,
        sku: product.sku,
        name: product.name,
        slug: product.slug,
      },
    };
  });

  // PATCH /products/:id
  fastify.patch<{ Params: { id: string } }>('/:id', {
    preHandler: [requireFeature('products.update')],
    schema: buildRouteSchema({
      summary: 'Update product',
      description: 'Update an existing product',
      tags: ['Products'],
      security: Security.authenticated,
      params: idParamSchema,
      body: updateProductSchema,
      response: {
        200: z.object({
          data: z.object({
            id: z.string().uuid(),
            sku: z.string(),
            name: z.string(),
            slug: z.string(),
            updatedAt: z.string(),
          }),
        }),
      },
    }),
  }, async (request) => {
    const { id } = idParamSchema.parse(request.params);
    const input = updateProductSchema.parse(request.body);

    const product = await request.em.findOne(Product, { id });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (input.sku && input.sku !== product.sku) {
      const existingSku = await request.em.findOne(Product, { sku: input.sku });
      if (existingSku) {
        throw new ConflictError('SKU already exists');
      }
      product.sku = input.sku;
    }

    if (input.categoryId) {
      const category = await request.em.findOne(Category, { id: input.categoryId });
      if (!category) {
        throw new NotFoundError('Category not found');
      }
      product.category = category;
    }

    if (input.brandId !== undefined) {
      if (input.brandId) {
        const brand = await request.em.findOne(Brand, { id: input.brandId });
        if (!brand) {
          throw new NotFoundError('Brand not found');
        }
        product.brand = brand;
      } else {
        product.brand = undefined;
      }
    }

    if (input.name !== undefined) product.name = input.name;
    if (input.description !== undefined) product.description = input.description;
    if (input.shortDescription !== undefined) product.shortDescription = input.shortDescription;
    if (input.price !== undefined) product.price = input.price.toString();
    if (input.compareAtPrice !== undefined) product.compareAtPrice = input.compareAtPrice?.toString();
    if (input.costPrice !== undefined) product.costPrice = input.costPrice?.toString();
    if (input.imageUrl !== undefined) product.imageUrl = input.imageUrl;
    if (input.images !== undefined) product.images = input.images;
    if (input.weight !== undefined) product.weight = input.weight?.toString();
    if (input.weightUnit !== undefined) product.weightUnit = input.weightUnit;
    if (input.length !== undefined) product.length = input.length?.toString();
    if (input.width !== undefined) product.width = input.width?.toString();
    if (input.height !== undefined) product.height = input.height?.toString();
    if (input.dimensionUnit !== undefined) product.dimensionUnit = input.dimensionUnit;
    if (input.stockQuantity !== undefined) product.stockQuantity = input.stockQuantity;
    if (input.lowStockThreshold !== undefined) product.lowStockThreshold = input.lowStockThreshold;
    if (input.upc !== undefined) product.upc = input.upc;
    if (input.fulfillmentType !== undefined) product.fulfillmentType = input.fulfillmentType as any;
    if (input.isActive !== undefined) product.isActive = input.isActive;
    if (input.isFeatured !== undefined) product.isFeatured = input.isFeatured;
    if (input.metaTitle !== undefined) product.metaTitle = input.metaTitle;
    if (input.metaDescription !== undefined) product.metaDescription = input.metaDescription;

    await request.em.flush();

    return {
      data: {
        id: product.id,
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        updatedAt: product.updatedAt.toISOString(),
      },
    };
  });

  // DELETE /products/:id
  fastify.delete<{ Params: { id: string } }>('/:id', {
    preHandler: [requireFeature('products.delete')],
    schema: buildRouteSchema({
      summary: 'Delete product',
      description: 'Soft delete a product (sets isActive to false)',
      tags: ['Products'],
      security: Security.authenticated,
      params: idParamSchema,
      response: {
        200: z.object({ data: z.object({ message: z.string() }) }),
      },
    }),
  }, async (request) => {
    const { id } = idParamSchema.parse(request.params);

    const product = await request.em.findOne(Product, { id });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    product.isActive = false;
    await request.em.flush();

    return { data: { message: 'Product deleted' } };
  });

  // POST /products/:id/fitments
  fastify.post<{ Params: { id: string } }>('/:id/fitments', {
    preHandler: [requireFeature('products.manageFitment')],
    schema: buildRouteSchema({
      summary: 'Add fitment',
      description: 'Add a vehicle fitment to a product',
      tags: ['Products'],
      security: Security.authenticated,
      params: idParamSchema,
      body: productFitmentSchema,
      response: {
        200: z.object({ data: FitmentSchema }),
      },
    }),
  }, async (request) => {
    const { id } = idParamSchema.parse(request.params);
    const input = productFitmentSchema.parse(request.body);

    const product = await request.em.findOne(Product, { id });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const fitment = request.em.create(ProductFitment, {
      product,
      make: input.make,
      model: input.model,
      yearStart: input.yearStart,
      yearEnd: input.yearEnd,
      submodel: input.submodel,
      engine: input.engine,
      notes: input.notes,
    });

    await request.em.persistAndFlush(fitment);

    return {
      data: {
        id: fitment.id,
        make: fitment.make,
        model: fitment.model,
        yearStart: fitment.yearStart,
        yearEnd: fitment.yearEnd,
        submodel: fitment.submodel,
        engine: fitment.engine,
        notes: fitment.notes,
      },
    };
  });

  // DELETE /products/:id/fitments/:fitmentId
  fastify.delete<{ Params: { id: string; fitmentId: string } }>('/:id/fitments/:fitmentId', {
    preHandler: [requireFeature('products.manageFitment')],
    schema: buildRouteSchema({
      summary: 'Remove fitment',
      description: 'Remove a vehicle fitment from a product',
      tags: ['Products'],
      security: Security.authenticated,
      params: z.object({
        id: z.string().uuid(),
        fitmentId: z.string().uuid(),
      }),
      response: {
        200: z.object({ data: z.object({ message: z.string() }) }),
      },
    }),
  }, async (request) => {
    const { id, fitmentId } = request.params;

    const fitment = await request.em.findOne(ProductFitment, { id: fitmentId, product: id });
    if (!fitment) {
      throw new NotFoundError('Fitment not found');
    }

    await request.em.removeAndFlush(fitment);

    return { data: { message: 'Fitment removed' } };
  });

  // POST /products/:id/images
  fastify.post<{ Params: { id: string } }>('/:id/images', {
    preHandler: [requireFeature('products.manageImages')],
    schema: buildRouteSchema({
      summary: 'Add product image',
      description: 'Add an image URL to a product',
      tags: ['Products'],
      security: Security.authenticated,
      params: idParamSchema,
      body: z.object({ url: z.string().url() }),
      response: {
        200: z.object({ data: z.object({ images: z.array(z.string()) }) }),
        400: z.object({ error: z.string() }),
      },
    }),
  }, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const body = request.body as { url?: string };

    if (!body.url) {
      return reply.status(400).send({ error: 'Image URL is required' });
    }

    const product = await request.em.findOne(Product, { id });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    product.images = [...product.images, body.url];
    await request.em.flush();

    return { data: { images: product.images } };
  });

  // DELETE /products/:id/images/:imageId
  fastify.delete<{ Params: { id: string; imageId: string } }>('/:id/images/:imageId', {
    preHandler: [requireFeature('products.manageImages')],
    schema: buildRouteSchema({
      summary: 'Remove product image',
      description: 'Remove an image from a product by index',
      tags: ['Products'],
      security: Security.authenticated,
      params: z.object({
        id: z.string().uuid(),
        imageId: z.string().describe('Image index'),
      }),
      response: {
        200: z.object({ data: z.object({ images: z.array(z.string()) }) }),
      },
    }),
  }, async (request) => {
    const { id, imageId } = request.params;
    const imageIndex = parseInt(imageId, 10);

    const product = await request.em.findOne(Product, { id });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= product.images.length) {
      throw new NotFoundError('Image not found');
    }

    product.images = product.images.filter((_, i) => i !== imageIndex);
    await request.em.flush();

    return { data: { images: product.images } };
  });
};
