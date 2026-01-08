/**
 * Cart Models
 * Generated from swagger.json - /cart/* endpoints
 */

/**
 * Cart item object
 */
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productImageUrl: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

/**
 * Cart object
 */
export interface Cart {
  id: string;
  items: CartItem[];
  itemCount: number;
  subtotal: string;
}

/**
 * GET /cart/ - Response (200)
 */
export interface GetCartResponse {
  data: Cart;
}

/**
 * DELETE /cart/ - Response (200)
 */
export interface ClearCartResponse {
  data: {
    message: string;
  };
}

/**
 * GET /cart/count - Response (200)
 */
export interface GetCartCountResponse {
  data: {
    count: number;
  };
}

/**
 * POST /cart/items - Request body
 */
export interface AddToCartRequest {
  productId: string;
  quantity?: number; // default: 1
}

/**
 * POST /cart/items - Response (200)
 */
export interface AddToCartResponse {
  data: Cart;
}

/**
 * PATCH /cart/items/{id} - Request body
 */
export interface UpdateCartItemRequest {
  quantity: number;
}

/**
 * PATCH /cart/items/{id} - Response (200)
 */
export interface UpdateCartItemResponse {
  data: Cart;
}

/**
 * DELETE /cart/items/{id} - Response (200)
 */
export interface RemoveCartItemResponse {
  data: Cart;
}
