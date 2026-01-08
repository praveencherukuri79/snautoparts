/**
 * Common API Types
 */

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * API Error Response
 */
export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
  details?: Record<string, string[]>;
}

/**
 * API Success Response
 */
export interface ApiSuccess<T = void> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * List Query Params
 */
export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * ID Param
 */
export interface IdParam {
  id: string;
}
