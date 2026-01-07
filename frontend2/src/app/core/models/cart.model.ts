/**
 * Cart & Checkout Models
 */

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: CartProduct;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CartProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  imageUrl?: string;
  price: number;
  stockQuantity: number;
  stockStatus: string;
}

// Cart Operations
export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Checkout
export interface CheckoutData {
  shippingAddress: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  sameAsShipping: boolean;
  shippingMethodId: string;
  paymentMethodId?: string;
  notes?: string;
}

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// Shipping Methods
export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays: string;
  carrier?: string;
}

// Payment
export interface PaymentIntent {
  id?: string;
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface CreateOrderRequest {
  shippingAddressId?: string;
  shippingAddress?: CheckoutAddress;
  billingAddressId?: string;
  billingAddress?: CheckoutAddress;
  sameAsShipping?: boolean;
  shippingMethodId: string;
  paymentIntentId?: string;
  paymentClientSecret?: string;
  notes?: string;
  idempotencyKey: string;
}

export interface CreateOrderResponse {
  order: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
  };
  redirectUrl?: string;
}

// Cart Summary (for mini cart / checkout)
export interface CartSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

