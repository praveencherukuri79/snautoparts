// Services barrel export
export { api, apiGet, apiPost, apiPut, apiPatch, apiDelete, type ApiResponse, type PaginatedResponse, type ApiError } from './api';
export { authService, type LoginResponse, type RegisterResponse } from './authService';
export { catalogService } from './catalogService';
export { cartService, type CartResponse } from './cartService';
export { orderService, type OrderResponse, type ShippingRate } from './orderService';
export { userService, type WishlistItem } from './userService';
