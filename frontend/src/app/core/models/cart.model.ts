/**
 * Cart models - aligned with backend API responses
 * See api.types.ts for the raw API response types
 */

/** Product info returned in cart items - subset of full product */
export interface CartProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: number | string; // Backend returns Decimal as string
  compareAtPrice?: number | string | null;
  imageUrl?: string | null;
  stockQuantity: number;
}

export interface CartItem {
  id: string;
  cartId?: string;
  productId: string;
  product: CartProduct;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
  // Computed fields (added by frontend service)
  price: number;
  total: number;
}

export interface Cart {
  id: string;
  userId?: string | null;
  sessionId?: string | null;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

