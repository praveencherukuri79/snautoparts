/**
 * Supplier Integration Interface
 * 
 * Common interface for all supplier/affiliate integrations.
 * Each supplier (A-Premium, BuyAutoParts, TRQ, etc.) implements this interface.
 */

/**
 * Supplier search parameters
 */
export interface SupplierSearchParams {
  sku?: string;
  keyword?: string;
  category?: string;
  brand?: string;
  make?: string;
  model?: string;
  year?: number;
  limit?: number;
  offset?: number;
}

/**
 * Supplier offer/product result
 */
export interface SupplierOffer {
  supplierId: string;
  supplierSku: string;
  description: string;
  brand: string;
  price: number;
  currency: string;
  availableQty: number;
  leadTimeDays?: number;
  imageUrl?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
}

/**
 * Shipping address for supplier orders
 */
export interface SupplierAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

/**
 * Order line for supplier orders
 */
export interface SupplierOrderLine {
  supplierSku: string;
  quantity: number;
  unitPrice?: number;
  notes?: string;
}

/**
 * Supplier order request
 */
export interface SupplierOrderRequest {
  purchaseOrderNumber: string;
  shipTo: SupplierAddress;
  lines: SupplierOrderLine[];
  shipMethod: string;
  notes?: string;
  expedite?: boolean;
}

/**
 * Supplier order result
 */
export interface SupplierOrderResult {
  supplierId: string;
  supplierOrderId: string;
  status: 'ACCEPTED' | 'REJECTED' | 'PENDING';
  estimatedShipDate?: string;
  totalAmount?: number;
  errorMessage?: string;
  errorCode?: string;
}

/**
 * Tracking information
 */
export interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string;
  shippedAt?: string;
  estimatedDelivery?: string;
}

/**
 * Supplier order status result
 */
export interface SupplierStatusResult {
  supplierOrderId: string;
  status: string;
  shipped: boolean;
  trackingNumbers: TrackingInfo[];
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

/**
 * Supplier integration interface
 * 
 * All supplier integrations must implement this interface
 */
export interface SupplierIntegration {
  /**
   * Unique supplier identifier (e.g., 'APREMIUM', 'BUYAUTOPARTS', 'TRQ')
   */
  readonly supplierId: string;

  /**
   * Human-readable supplier name
   */
  readonly supplierName: string;

  /**
   * Check if the integration is available/configured
   */
  isAvailable(): boolean;

  /**
   * Search for products/offers from this supplier
   */
  searchOffers(params: SupplierSearchParams): Promise<SupplierOffer[]>;

  /**
   * Get availability for a specific SKU
   */
  getAvailability(supplierSku: string): Promise<SupplierOffer | null>;

  /**
   * Create an order with this supplier
   */
  createOrder(request: SupplierOrderRequest): Promise<SupplierOrderResult>;

  /**
   * Get the status of an existing order
   */
  getOrderStatus(supplierOrderId: string): Promise<SupplierStatusResult>;

  /**
   * Cancel an order (if supported and possible)
   */
  cancelOrder?(supplierOrderId: string, reason?: string): Promise<boolean>;

  /**
   * Validate the integration credentials
   */
  validateCredentials(): Promise<boolean>;
}

/**
 * Base configuration for supplier integrations
 */
export interface SupplierConfig {
  apiUrl: string;
  apiKey: string;
  apiSecret?: string;
  timeoutMs?: number;
  retryAttempts?: number;
}

/**
 * Simplified supplier product for search results
 */
export interface SupplierProduct {
  supplierCode: string;
  supplierSku: string;
  name: string;
  description?: string;
  price: number;
  inStock: boolean;
  stockQuantity?: number;
  estimatedShipDate?: string;
}

/**
 * Simplified order result for service layer
 */
export interface SupplierSubmitResult {
  success: boolean;
  externalOrderId?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  error?: string;
  errorCode?: string;
}

/**
 * Service interface for supplier integrations (used by new services)
 */
export interface SupplierService {
  readonly code: string;
  readonly name: string;

  isAvailable(): boolean;

  searchProducts(query: {
    sku?: string;
    make?: string;
    model?: string;
    year?: number;
  }): Promise<SupplierProduct[]>;

  submitOrder(
    order: unknown,
    items: unknown[],
    affiliateOrder: unknown,
  ): Promise<SupplierSubmitResult>;

  checkOrderStatus(externalOrderId: string): Promise<{
    status: string;
    trackingNumber?: string;
    trackingUrl?: string;
  } | null>;

  cancelOrder(externalOrderId: string, reason?: string): Promise<boolean>;
}

