/**
 * Admin models - aligned with backend API responses
 */

/**
 * Audit log from backend /admin/audit
 */
export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  oldData: unknown | null;
  newData: unknown | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  resource?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedAuditLogs {
  logs: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Setting from backend /admin/settings
 */
export interface Setting {
  id: string;
  key: string;
  value: unknown; // JSON value
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingRequest {
  value: unknown;
  category?: string;
}

/**
 * Inventory log from backend /manager/inventory
 */
export type InventoryAdjustmentType = 'RECEIVED' | 'SOLD' | 'RETURNED' | 'DAMAGED' | 'ADJUSTMENT' | 'TRANSFER';

export interface InventoryAdjustment {
  id: string;
  productId: string;
  adjustmentType: InventoryAdjustmentType;
  quantity: number;
  previousQty: number;
  newQty: number;
  reason: string | null;
  referenceId: string | null;
  createdBy: string | null;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface CreateInventoryAdjustmentRequest {
  productId: string;
  adjustmentType: InventoryAdjustmentType;
  quantity: number;
  reason?: string;
  referenceId?: string;
}

