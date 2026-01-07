/**
 * OpenAPI Utilities
 * 
 * Helpers for converting Zod schemas to JSON Schema for OpenAPI integration.
 */

import { z, ZodType } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { FastifySchema } from 'fastify';

/**
 * Convert a Zod schema to JSON Schema for Fastify/OpenAPI
 */
export function zodToJsonSchemaOpenApi<T extends ZodType>(
  schema: T,
  name?: string,
): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonSchema = (zodToJsonSchema as any)(schema, {
    name,
    target: 'openApi3',
    $refStrategy: 'none',
  }) as Record<string, unknown>;

  // Remove $schema key as it's not needed for OpenAPI
  if (typeof jsonSchema === 'object' && jsonSchema !== null) {
    const { $schema, ...rest } = jsonSchema as Record<string, unknown>;
    return rest;
  }

  return jsonSchema as Record<string, unknown>;
}

/**
 * Build a Fastify schema from Zod schemas
 */
export interface RouteSchemaOptions {
  summary?: string;
  description?: string;
  tags?: string[];
  security?: Array<Record<string, string[]>>;
  body?: ZodType;
  querystring?: ZodType;
  params?: ZodType;
  headers?: ZodType;
  response?: Record<number, ZodType>;
}

export function buildRouteSchema(options: RouteSchemaOptions): FastifySchema {
  const schema: FastifySchema = {};

  if (options.body) {
    schema.body = zodToJsonSchemaOpenApi(options.body);
  }

  if (options.querystring) {
    schema.querystring = zodToJsonSchemaOpenApi(options.querystring);
  }

  if (options.params) {
    schema.params = zodToJsonSchemaOpenApi(options.params);
  }

  if (options.headers) {
    schema.headers = zodToJsonSchemaOpenApi(options.headers);
  }

  if (options.response) {
    schema.response = {} as Record<number, unknown>;
    for (const [statusCode, zodSchema] of Object.entries(options.response)) {
      (schema.response as Record<number, unknown>)[Number(statusCode)] = zodToJsonSchemaOpenApi(zodSchema);
    }
  }

  // Add OpenAPI-specific extensions
  const openApiSchema = schema as FastifySchema & {
    summary?: string;
    description?: string;
    tags?: string[];
    security?: Array<Record<string, string[]>>;
  };

  if (options.summary) {
    openApiSchema.summary = options.summary;
  }

  if (options.description) {
    openApiSchema.description = options.description;
  }

  if (options.tags) {
    openApiSchema.tags = options.tags;
  }

  if (options.security) {
    openApiSchema.security = options.security;
  }

  return openApiSchema;
}

/**
 * Common response schemas
 */
export const CommonSchemas = {
  /** Standard error response */
  Error: z.object({
    statusCode: z.number(),
    error: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
  }),

  /** Pagination metadata */
  PaginationMeta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),

  /** UUID parameter */
  IdParam: z.object({
    id: z.string().uuid(),
  }),

  /** Pagination query */
  PaginationQuery: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),

  /** Success response wrapper */
  successResponse: <T extends ZodType>(dataSchema: T) =>
    z.object({
      data: dataSchema,
    }),

  /** Paginated response wrapper */
  paginatedResponse: <T extends ZodType>(itemSchema: T) =>
    z.object({
      data: z.array(itemSchema),
      meta: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
      }),
    }),
};

/**
 * Security definitions for protected routes
 */
export const Security: {
  authenticated: Array<Record<string, string[]>>;
  public: Array<Record<string, string[]>>;
} = {
  /** Requires authentication */
  authenticated: [{ bearerAuth: [] as string[] }, { cookieAuth: [] as string[] }],
  
  /** No authentication required */
  public: [],
};

