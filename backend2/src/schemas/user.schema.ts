import { z } from 'zod';

/**
 * User query schema
 */
export const usersQuerySchema = z.object({
  search: z.string().optional(),
  roleId: z.string().uuid().optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

/**
 * Create user schema
 */
export const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  roleId: z.string().uuid(),
  phone: z.string().max(20).optional(),
  isActive: z.boolean().default(true),
});

/**
 * Update user schema
 */
export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().max(20).optional(),
  roleId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Assign role schema
 */
export const assignRoleSchema = z.object({
  roleId: z.string().uuid(),
});

export type UsersQueryInput = z.infer<typeof usersQuerySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;

