import { z } from 'zod';

export const inventoryAdjustmentSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int('Quantity must be an integer'),
  type: z.enum(['IMPORT', 'SALE', 'RETURN', 'ADJUSTMENT', 'RECOUNT', 'DAMAGED', 'RECEIVED']),
  reason: z.string().min(1, 'Reason is required').max(500),
  notes: z.string().optional(),
  referenceId: z.string().optional(),
});

export type InventoryAdjustmentInput = z.infer<typeof inventoryAdjustmentSchema>;

export const inventoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  lowStock: z.coerce.boolean().optional(),
  outOfStock: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'stockQuantity', 'sku', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type InventoryQuery = z.infer<typeof inventoryQuerySchema>;

