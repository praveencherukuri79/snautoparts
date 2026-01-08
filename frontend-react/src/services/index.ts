// Services barrel export
export { api, apiGet, apiPost, apiPut, apiPatch, apiDelete, type ApiResponse, type PaginatedResponse, type ApiError } from './api';
export { authService } from './authService';
export { catalogService } from './catalogService';
export { cartService } from './cartService';
export { orderService } from './orderService';
export { userService } from './userService';
export { accountService } from './accountService';
export { default as profileService } from './profileService';

// Re-export types from models
export type * from '@/models';
