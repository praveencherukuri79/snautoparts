/**
 * Third-Party Integrations
 * 
 * This module exports all external service integrations:
 * - Email (Resend)
 * - Payments (Stripe)
 * - Suppliers (A-Premium, BuyAutoParts, TRQ)
 */

// ============================================================================
// Email Integration (Resend)
// ============================================================================
export * from './email/index.js';

// ============================================================================
// Payments Integration (Stripe)
// ============================================================================
export * from './payments/index.js';

// ============================================================================
// Supplier Integrations
// ============================================================================

// Common interfaces
export {
  SupplierIntegration,
  SupplierConfig,
  SupplierSearchParams,
  SupplierOffer,
  SupplierAddress,
  SupplierOrderLine,
  SupplierOrderRequest,
  SupplierOrderResult,
  SupplierSubmitResult,
  SupplierStatusResult,
  TrackingInfo,
  SupplierService,
  SupplierProduct,
} from './supplier.interface.js';

// Router
export {
  SupplierRouter,
  supplierRouter,
  initializeSupplierIntegrations,
} from './supplier.router.js';

// A-Premium integration
export * from './a-premium/index.js';

// BuyAutoParts integration
export * from './buyautoparts/index.js';

// TRQ integration
export * from './trq/index.js';

