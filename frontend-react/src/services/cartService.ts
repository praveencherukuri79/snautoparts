import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type {
  Cart,
  CartItem,
  GetCartResponse,
  GetCartCountResponse,
  AddToCartRequest,
  AddToCartResponse,
  UpdateCartItemRequest,
  UpdateCartItemResponse,
  RemoveCartItemResponse,
  ClearCartResponse,
} from '@/models';

// API Endpoints matching swagger paths
const CART_ENDPOINTS = {
  BASE: '/cart/',
  COUNT: '/cart/count',
  ITEMS: '/cart/items',
  ITEM: (id: string) => `/cart/items/${id}`,
};

/**
 * Cart Service
 * 
 * Handles shopping cart API calls.
 * Types match swagger.json exactly.
 */
export const cartService = {
  /**
   * GET /cart/
   * Returns the current user's shopping cart with all items
   */
  getCart: async (): Promise<Cart> => {
    const response = await apiGet<GetCartResponse>(CART_ENDPOINTS.BASE);
    return response.data;
  },

  /**
   * GET /cart/count
   * Returns the total number of items in the cart (for nav badge)
   */
  getCartCount: async (): Promise<number> => {
    const response = await apiGet<GetCartCountResponse>(CART_ENDPOINTS.COUNT);
    return response.data.count;
  },

  /**
   * POST /cart/items
   * Add a product to the shopping cart
   */
  addItem: async (data: AddToCartRequest): Promise<Cart> => {
    const response = await apiPost<AddToCartResponse>(CART_ENDPOINTS.ITEMS, data);
    return response.data;
  },

  /**
   * PATCH /cart/items/{id}
   * Update the quantity of an item in the cart
   */
  updateItem: async (itemId: string, data: UpdateCartItemRequest): Promise<Cart> => {
    const response = await apiPatch<UpdateCartItemResponse>(CART_ENDPOINTS.ITEM(itemId), data);
    return response.data;
  },

  /**
   * DELETE /cart/items/{id}
   * Remove an item from the shopping cart
   */
  removeItem: async (itemId: string): Promise<Cart> => {
    const response = await apiDelete<RemoveCartItemResponse>(CART_ENDPOINTS.ITEM(itemId));
    return response.data;
  },

  /**
   * DELETE /cart/
   * Remove all items from the shopping cart
   */
  clearCart: async (): Promise<string> => {
    const response = await apiDelete<ClearCartResponse>(CART_ENDPOINTS.BASE);
    return response.data.message;
  },
};

// Re-export types for convenience
export type {
  Cart,
  CartItem,
  GetCartResponse,
  GetCartCountResponse,
  AddToCartRequest,
  AddToCartResponse,
  UpdateCartItemRequest,
  UpdateCartItemResponse,
  RemoveCartItemResponse,
  ClearCartResponse,
};

export default cartService;
