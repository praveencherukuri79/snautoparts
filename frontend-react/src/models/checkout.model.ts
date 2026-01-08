/**
 * Checkout Models
 * Generated from swagger.json - /checkout/* endpoints
 */

/**
 * Shipping method object
 * GET /checkout/shipping-methods - Response item
 */
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: string;
  estimatedDays: number;
}

/**
 * GET /checkout/shipping-methods - Response (200)
 */
export interface GetShippingMethodsResponse {
  data: ShippingMethod[];
}

/**
 * GET /checkout/summary - Query params
 */
export interface GetCheckoutSummaryParams {
  shippingMethodId?: string;
  shippingAddressId?: string;
}

/**
 * Checkout summary cart info
 */
export interface CheckoutSummaryCart {
  itemCount: number;
  subtotal: string;
}

/**
 * Checkout summary object
 */
export interface CheckoutSummary {
  cart: CheckoutSummaryCart;
  subtotal: string;
  shippingCost: string;
  taxRate: string;
  taxAmount: string;
  total: string;
}

/**
 * GET /checkout/summary - Response (200)
 */
export interface GetCheckoutSummaryResponse {
  data: CheckoutSummary;
}

/**
 * POST /checkout/payment-intent - Request body
 */
export interface CreatePaymentIntentRequest {
  shippingMethodId: string;
  shippingAddressId: string;
}

/**
 * Payment intent object
 */
export interface PaymentIntent {
  clientSecret: string;
  amount: string;
  currency: string;
}

/**
 * POST /checkout/payment-intent - Response (200)
 */
export interface CreatePaymentIntentResponse {
  data: PaymentIntent;
}

/**
 * POST /checkout/orders - Request body
 */
export interface CreateOrderRequest {
  shippingMethodId: string;
  shippingAddressId: string;
  billingAddressId?: string;
  paymentIntentId: string;
  notes?: string;
}

/**
 * Created order result
 */
export interface CreatedOrder {
  orderId: string;
  orderNumber: string;
  total: string;
  status: string;
}

/**
 * POST /checkout/orders - Response (200)
 */
export interface CreateOrderResponse {
  data: CreatedOrder;
}
