/**
 * Common API Response Models
 * Generated from swagger.json
 */

/**
 * Standard paginated response meta
 * Used by: /catalog/products, /orders/, /catalog/fitment/search
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated API response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Standard data response wrapper
 * Most endpoints return { data: T }
 */
export interface DataResponse<T> {
  data: T;
}

/**
 * Array data response wrapper
 */
export interface ArrayDataResponse<T> {
  data: T[];
}

/**
 * API Error response
 */
export interface ApiErrorResponse {
  error: string;
}

/**
 * Success response (logout, etc.)
 */
export interface SuccessResponse {
  success: boolean;
}

/**
 * Message response (delete operations, clear cart, etc.)
 */
export interface MessageResponse {
  data: {
    message: string;
  };
}

/**
 * Count response (cart count, pending orders count)
 */
export interface CountResponse {
  data: {
    count: number;
  };
}
