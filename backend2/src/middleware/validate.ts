import type { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema, ZodError } from 'zod';

/**
 * Request validation middleware factory
 * Validates request body, params, and/or query against Zod schemas
 */
interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const errors: Record<string, unknown> = {};

    // Validate body
    if (schemas.body) {
      const result = schemas.body.safeParse(request.body);
      if (!result.success) {
        errors.body = formatZodError(result.error);
      } else {
        request.body = result.data;
      }
    }

    // Validate params
    if (schemas.params) {
      const result = schemas.params.safeParse(request.params);
      if (!result.success) {
        errors.params = formatZodError(result.error);
      } else {
        (request.params as unknown) = result.data;
      }
    }

    // Validate query
    if (schemas.query) {
      const result = schemas.query.safeParse(request.query);
      if (!result.success) {
        errors.query = formatZodError(result.error);
      } else {
        (request.query as unknown) = result.data;
      }
    }

    // If any validation errors, return 400
    if (Object.keys(errors).length > 0) {
      reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        details: errors,
      });
      return;
    }
  };
}

/**
 * Format Zod error into a more readable structure
 */
function formatZodError(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }

  return formatted;
}

/**
 * Validate body only - convenience function
 */
export function validateBody(schema: ZodSchema) {
  return validate({ body: schema });
}

/**
 * Validate params only - convenience function
 */
export function validateParams(schema: ZodSchema) {
  return validate({ params: schema });
}

/**
 * Validate query only - convenience function
 */
export function validateQuery(schema: ZodSchema) {
  return validate({ query: schema });
}

