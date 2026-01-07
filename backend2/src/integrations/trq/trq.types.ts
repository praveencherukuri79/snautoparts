/**
 * TRQ API Types
 */

export interface TRQOrderRequest {
  poNumber: string;
  items: TRQOrderItem[];
  shipping: TRQShippingInfo;
  specialInstructions?: string;
}

export interface TRQOrderItem {
  sku: string;
  qty: number;
  unitCost: number;
}

export interface TRQShippingInfo {
  recipientName: string;
  companyName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  countryCode: string;
  phoneNumber?: string;
  shippingMethod?: 'ground' | 'express' | 'overnight';
}

export interface TRQOrderResponse {
  success: boolean;
  data?: {
    orderId: string;
    poNumber: string;
    status: 'received' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    totalCost: number;
    trackingInfo?: TRQTrackingInfo;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface TRQTrackingInfo {
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  estimatedDelivery?: string;
}

export interface TRQCatalogSearchRequest {
  query?: string;
  sku?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  page?: number;
  pageSize?: number;
}

export interface TRQCatalogSearchResponse {
  success: boolean;
  data?: {
    items: TRQCatalogItem[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface TRQCatalogItem {
  sku: string;
  name: string;
  description: string;
  cost: number;
  msrp: number;
  inStock: boolean;
  stockQty: number;
  leadTimeDays: number;
  brand: string;
  category: string;
}

export interface TRQOrderStatusResponse {
  success: boolean;
  data?: {
    orderId: string;
    status: string;
    tracking?: TRQTrackingInfo;
    lastUpdated: string;
  };
}

