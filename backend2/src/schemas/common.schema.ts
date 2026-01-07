import { z } from 'zod';

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// UUID
export const uuidSchema = z.string().uuid();

// ID parameter
export const idParamSchema = z.object({
  id: uuidSchema,
});

export type IdParam = z.infer<typeof idParamSchema>;

// Slug parameter
export const slugParamSchema = z.object({
  slug: z.string().min(1),
});

export type SlugParam = z.infer<typeof slugParamSchema>;

// Sort order
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

// Search query
export const searchQuerySchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters'),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

