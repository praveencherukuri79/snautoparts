/**
 * Admin & Management Models
 */

// Inventory
export interface InventoryItem {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  productImage?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  stockStatus: string;
  lastAdjustedAt?: string;
  lastAdjustedBy?: string;
}

export interface InventoryAdjustment {
  productId: string;
  quantityChange: number;
  reason: InventoryAdjustmentReason;
  notes?: string;
}

export type InventoryAdjustmentReason = 
  | 'IMPORT'
  | 'SALE'
  | 'RETURN'
  | 'ADJUSTMENT'
  | 'RECOUNT'
  | 'DAMAGED'
  | 'RECEIVED';

export interface InventoryLog {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  previousQuantity: number;
  newQuantity: number;
  quantityChange: number;
  type: string;
  reason: InventoryAdjustmentReason | string;
  reference?: string;
  notes?: string;
  userId?: string;
  userName?: string;
  adjustedBy?: {
    id?: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface StockAdjustment {
  productId: string;
  type: string;
  quantity: number;
  reason: string;
  date?: string;
  reference?: string;
}

export interface LowStockAlert {
  productId: string;
  productSku: string;
  productName: string;
  productImage?: string;
  currentQuantity: number;
  threshold: number;
  deficit: number;
}

// Inventory Import
export interface InventoryImportResult {
  success: boolean;
  totalRows: number;
  processedRows: number;
  createdProducts: number;
  updatedProducts: number;
  errors: InventoryImportError[];
}

export interface InventoryImportError {
  row: number;
  field?: string;
  message: string;
}

// Affiliates
export interface Affiliate {
  id: string;
  name: string;
  code: string;
  baseUrl?: string;
  isActive: boolean;
  isEnabled: boolean;
  integrationType: AffiliateIntegrationType;
  retryPolicy?: RetryPolicy;
  productMappingCount?: number;
  orderCount?: number;
  createdAt: string;
  updatedAt: string;
  // Extended fields for management
  apiUrl?: string;
  apiKey?: string;
  email?: string;
  ftpHost?: string;
  ftpUsername?: string;
  lastSyncAt?: string;
  lastError?: string;
  lowStockThreshold?: number;
  autoReorder?: boolean;
  priority?: number;
  notes?: string;
}

export type AffiliateIntegrationType = 'API' | 'EDI' | 'EMAIL' | 'FTP';

export interface AdminAffiliateOrder {
  id: string;
  orderId: string;
  orderNumber: string;
  affiliateId: string;
  affiliateName: string;
  affiliateOrderId?: string;
  status: AdminAffiliateOrderStatus;
  errorMessage?: string;
  retryCount: number;
  lastAttemptAt?: string;
  confirmedAt?: string;
  createdAt: string;
}

export type AdminAffiliateOrderStatus = 'PENDING' | 'SENT' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'FAILED' | 'CANCELLED';

export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number[];
}

export interface AffiliateFormData {
  name: string;
  code: string;
  integrationType: AffiliateIntegrationType;
  baseUrl?: string;
  apiUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  email?: string;
  ftpHost?: string;
  ftpUsername?: string;
  ftpPassword?: string;
  isEnabled?: boolean;
  isActive?: boolean;
  retryPolicy?: RetryPolicy;
  lowStockThreshold?: number;
  autoReorder?: boolean;
  priority?: number;
  notes?: string;
}

export interface AffiliateProductMapping {
  id: string;
  affiliateId: string;
  productId: string;
  productSku: string;
  productName: string;
  affiliateSku: string;
  affiliateProductId?: string;
  priceMultiplier?: number;
  isActive: boolean;
}

// Settings
export interface AppSetting {
  key: string;
  value: string | number | boolean | object;
  type: SettingType;
  category: SettingCategory;
  label: string;
  description?: string;
  isEditable: boolean;
}

// Simplified Setting interface for components
export interface Setting {
  key: string;
  value: string;
  type: SettingType;
  category: string;
  description?: string;
}

export type SettingType = 'string' | 'number' | 'boolean' | 'json';
export type SettingCategory = 'general' | 'shipping' | 'tax' | 'payment' | 'email' | 'integration';

export interface SettingUpdate {
  key: string;
  value: string | number | boolean | object;
}

// Audit Log
export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditStatistics {
  totalLogs: number;
  logsByAction: Record<string, number>;
  logsByEntity: Record<string, number>;
  recentActivity: AuditLog[];
}

// Reports
export interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  itemsSold: number;
  revenueChange: number;
  ordersChange: number;
  aovChange: number;
  itemsChange: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  ordersByStatus: Record<string, number>;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  dailyBreakdown: Array<{
    date: string;
    orders: number;
    revenue: number;
    avgOrderValue: number;
    topCategory: string;
    status: 'completed' | 'pending';
  }>;
}

export interface SalesDataPoint {
  date: string;
  orders: number;
  revenue: number;
  averageOrderValue: number;
}

export interface SalesSummary {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  growthPercentage: number;
}

export interface CategoryReport {
  categories: CategorySalesData[];
  totalRevenue: number;
}

export interface CategorySalesData {
  categoryId: string;
  categoryName: string;
  orderCount: number;
  revenue: number;
  percentage: number;
}

export interface InventoryValueReport {
  totalCostValue: number;
  totalRetailValue: number;
  totalProducts: number;
  lowStockAlerts: number;
  avgValuePerItem: number;
  costChange: number;
  retailChange: number;
  valueByCategory: Array<{ category: string; value: number; percentage: number }>;
  items: Array<{
    id: string;
    name: string;
    brand: string;
    sku: string;
    category: string;
    categoryColor: string;
    stock: number;
    costPrice: number;
    retailPrice: number;
    totalCost: number;
    totalRetail: number;
    isLowStock: boolean;
  }>;
}

export interface InventoryValueByCategory {
  categoryId: string;
  categoryName: string;
  itemCount: number;
  totalValue: number;
  percentage: number;
}

export interface GMVReport {
  period: string;
  totalGMV: number;
  data: GMVDataPoint[];
  comparison?: GMVComparison;
}

export interface GMVDataPoint {
  date: string;
  gmv: number;
  orders: number;
}

export interface GMVComparison {
  previousPeriodGMV: number;
  growthPercentage: number;
}

export interface TopProductsReport {
  products: TopProductData[];
  period: string;
}

export interface TopProductData {
  productId: string;
  productSku: string;
  productName: string;
  productImage?: string;
  unitsSold: number;
  revenue: number;
}

// User Management
export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleName: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface UserFormData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleId: string;
  isActive?: boolean;
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  q?: string;
  page?: number;
  limit?: number;
}

// Webhooks
export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
  lastTriggeredAt?: string;
  createdAt: string;
}

export interface WebhookFormData {
  name: string;
  url: string;
  events: string[];
  secret?: string;
  isActive?: boolean;
}

export const WEBHOOK_EVENTS = [
  'order.created',
  'order.status.changed',
  'order.shipped',
  'order.delivered',
  'order.cancelled',
  'inventory.low_stock',
  'product.created',
  'product.updated',
] as const;

// Order Statistics Report
export interface OrderStatisticsReport {
  totalOrders: number;
  ordersChange: number;
  avgOrderValue: number;
  aovChange: number;
  fulfillmentRate: number;
  fulfillmentChange: number;
  returnRate: number;
  returnChange: number;
  ordersByDay: Array<{ day: string; orders: number }>;
  ordersByStatus: Array<{ status: string; count: number; percentage: number; color: string }>;
  customerStats: Array<{ day: string; newCustomers: number; returning: number }>;
  topProducts: Array<{ name: string; sku: string; price: number; sold: number }>;
}

// Shipping Settings
export interface ShippingZone {
  id: string;
  name: string;
  type: 'domestic' | 'international';
  regions: string[];
  isDefault: boolean;
}

export interface AdminShippingMethod {
  id: string;
  name: string;
  description: string;
  costType: ShippingCostType;
  price: number;
  pricePerUnit?: number;
  zone: string;
  isActive: boolean;
}

export type ShippingCostType = 'flat' | 'weight' | 'free';

// Tax Settings
export interface TaxRate {
  id: string;
  name: string;
  region: string;
  regionType: TaxRegionType;
  rate: number;
  priority: number;
  isActive: boolean;
}

export type TaxRegionType = 'country' | 'state' | 'province' | 'zip';

// Integration Settings
export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  status: IntegrationStatus;
  lastVerified?: string;
  lastSync?: string;
  features?: string[];
  type: IntegrationType;
}

export type IntegrationStatus = 'connected' | 'disconnected' | 'error';
export type IntegrationType = 'core' | 'supplier' | 'third-party';

// Extended Inventory Item for Detail View
export interface InventoryItemDetail {
  id: string;
  productId: string;
  sku: string;
  name: string;
  slug?: string;
  images?: string[];
  stockQuantity: number;
  lowStockThreshold: number;
  stockStatus: string;
  brand?: string;
  category?: {
    id: string;
    name: string;
  };
  price?: number;
  costPrice?: number;
  weight?: number;
  dimensions?: string;
  reorderPoint?: number;
  reorderQuantity?: number;
  leadTimeDays?: number;
  salesVelocity?: number;
  velocityChange?: number;
  supplier?: {
    id: string;
    name: string;
  };
  locations?: Array<{
    id: string;
    name: string;
    quantity: number;
    isDefault: boolean;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

