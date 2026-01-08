import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { API_ENDPOINTS } from '@/utils/constants';
import { CartItem } from '@/types';

export interface CartResponse {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  vehicleId?: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface ApplyCouponRequest {
  code: string;
}

export interface CouponResponse {
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  description: string;
}

/**
 * Cart Service
 * 
 * Handles shopping cart API calls.
 */
export const cartService = {
  /**
   * Get current cart
   */
  getCart: async (): Promise<CartResponse> => {
    return apiGet<CartResponse>(API_ENDPOINTS.CART.GET);
  },

  /**
   * Add item to cart
   */
  addItem: async (data: AddToCartRequest): Promise<CartResponse> => {
    return apiPost<CartResponse>(API_ENDPOINTS.CART.ADD, data);
  },

  /**
   * Update cart item quantity
   */
  updateItem: async (itemId: string, data: UpdateCartItemRequest): Promise<CartResponse> => {
    return apiPut<CartResponse>(API_ENDPOINTS.CART.UPDATE(itemId), data);
  },

  /**
   * Remove item from cart
   */
  removeItem: async (itemId: string): Promise<CartResponse> => {
    return apiDelete<CartResponse>(API_ENDPOINTS.CART.REMOVE(itemId));
  },

  /**
   * Clear entire cart
   */
  clearCart: async (): Promise<void> => {
    return apiDelete<void>(API_ENDPOINTS.CART.CLEAR);
  },

  /**
   * Apply coupon code
   */
  applyCoupon: async (data: ApplyCouponRequest): Promise<CartResponse & { coupon: CouponResponse }> => {
    return apiPost<CartResponse & { coupon: CouponResponse }>(API_ENDPOINTS.CART.APPLY_COUPON, data);
  },

  /**
   * Remove applied coupon
   */
  removeCoupon: async (): Promise<CartResponse> => {
    return apiDelete<CartResponse>(API_ENDPOINTS.CART.REMOVE_COUPON);
  },

  /**
   * Get saved for later items
   */
  getSavedItems: async (): Promise<CartItem[]> => {
    return apiGet<CartItem[]>(`${API_ENDPOINTS.CART.GET}/saved`);
  },

  /**
   * Move item to saved for later
   */
  saveForLater: async (itemId: string): Promise<void> => {
    return apiPost<void>(`${API_ENDPOINTS.CART.GET}/items/${itemId}/save`);
  },

  /**
   * Move saved item back to cart
   */
  moveToCart: async (itemId: string): Promise<CartResponse> => {
    return apiPost<CartResponse>(`${API_ENDPOINTS.CART.GET}/saved/${itemId}/move-to-cart`);
  },
};

export default cartService;
