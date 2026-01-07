/**
 * BuyAutoParts API Types
 */

export interface BuyAutoPartsOrderRequest {
  referenceNumber: string;
  lineItems: BuyAutoPartsLineItem[];
  shipTo: BuyAutoPartsAddress;
  billTo?: BuyAutoPartsAddress;
  notes?: string;
}

export interface BuyAutoPartsLineItem {
  partNumber: string;
  quantity: number;
  price: number;
}

export interface BuyAutoPartsAddress {
  name: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface BuyAutoPartsOrderResponse {
  status: 'success' | 'error';
  orderId?: string;
  confirmationNumber?: string;
  tracking?: {
    carrier: string;
    number: string;
    url: string;
  };
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
}

export interface BuyAutoPartsInventoryRequest {
  partNumbers: string[];
}

export interface BuyAutoPartsInventoryResponse {
  status: 'success' | 'error';
  items: BuyAutoPartsInventoryItem[];
}

export interface BuyAutoPartsInventoryItem {
  partNumber: string;
  available: boolean;
  quantity: number;
  price: number;
  warehouse: string;
  estimatedShipDate: string;
}

export interface BuyAutoPartsOrderStatusResponse {
  status: 'success' | 'error';
  order?: {
    id: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    tracking?: {
      carrier: string;
      number: string;
      url: string;
    };
    updatedAt: string;
  };
}

