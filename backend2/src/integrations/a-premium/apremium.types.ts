/**
 * A-Premium API Types
 */

export interface APremiumOrderRequest {
  orderNumber: string;
  items: APremiumOrderItem[];
  shippingAddress: APremiumAddress;
  billingAddress?: APremiumAddress;
  metadata?: Record<string, string>;
}

export interface APremiumOrderItem {
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface APremiumAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface APremiumOrderResponse {
  success: boolean;
  orderId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  estimatedDelivery?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface APremiumOfferSearchRequest {
  sku?: string;
  make?: string;
  model?: string;
  year?: number;
  category?: string;
}

export interface APremiumOfferSearchResponse {
  success: boolean;
  items: APremiumOffer[];
  total: number;
}

export interface APremiumOffer {
  sku: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  inStock: boolean;
  estimatedShipDate?: string;
}

export interface APremiumOrderStatusResponse {
  success: boolean;
  orderId: string;
  status: string;
  trackingNumber?: string;
  trackingUrl?: string;
  lastUpdate?: string;
}

