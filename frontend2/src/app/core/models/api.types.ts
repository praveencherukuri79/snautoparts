/**
 * API Response Types
 * Generic types for API responses
 */

// Base API response wrapper
export interface ApiResponse<T> {
  data: T;
}

// Paginated response with metadata
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Error response from API
export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

// Common query parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams, SortParams {
  q?: string;
}

// Date range filter
export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

