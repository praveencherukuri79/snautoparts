/**
 * Cart Types
 */
export interface CartItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number;
  salePrice?: number;
  quantity: number;
  imageUrl?: string;
  maxQuantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
