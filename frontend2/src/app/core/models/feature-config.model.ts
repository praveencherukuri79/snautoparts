/**
 * Feature Configuration Models
 * Drives the feature-config based UI
 */

export interface RoleFeatureConfig {
  role: string;
  version: number;
  features: FeaturePermissions;
  navigation: NavigationConfig;
  ui: UIConfig;
}

export interface FeaturePermissions {
  catalog: CatalogFeatures;
  cart: CartFeatures;
  orders: OrderFeatures;
  inventory: InventoryFeatures;
  products: ProductFeatures;
  dropship: DropshipFeatures;
  users: UserFeatures;
  settings: SettingsFeatures;
  audit: AuditFeatures;
  reports: ReportFeatures;
}

export interface CatalogFeatures {
  browse: boolean;
  search: boolean;
  viewDetail: boolean;
  fitmentFilter: boolean;
}

export interface CartFeatures {
  view: boolean;
  modify: boolean;
  checkout: boolean;
}

export interface OrderFeatures {
  viewOwn: boolean;
  viewAll: boolean;
  updateStatus: boolean;
  cancel: boolean;
  viewStatistics: boolean;
}

export interface InventoryFeatures {
  view: boolean;
  adjust: boolean;
  import: boolean;
  viewHistory: boolean;
  viewAlerts: boolean;
}

export interface ProductFeatures {
  create: boolean;
  update: boolean;
  delete: boolean;
  manageFitment: boolean;
  manageImages: boolean;
}

export interface DropshipFeatures {
  viewOrders: boolean;
  retryPush: boolean;
  manageAffiliates: boolean;
}

export interface UserFeatures {
  viewAll: boolean;
  create: boolean;
  updateRole: boolean;
  delete: boolean;
}

export interface SettingsFeatures {
  view: boolean;
  update: boolean;
}

export interface AuditFeatures {
  view: boolean;
  export: boolean;
}

export interface ReportFeatures {
  salesByDay: boolean;
  salesByCategory: boolean;
  inventoryValue: boolean;
  gmv: boolean;
}

// Navigation
export interface NavigationConfig {
  primary: NavigationItem[];
  secondary?: NavigationItem[];
  account: NavigationItem[];
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  children?: NavigationItem[];
  badge?: NavigationBadge;
}

export interface NavigationBadge {
  type: 'count' | 'dot';
  source: string; // API endpoint for badge data
}

// UI Configuration
export interface UIConfig {
  dashboardLayout: DashboardLayout;
  showPriceHistory: boolean;
  showCostPrice: boolean;
  showAuditInfo: boolean;
}

export type DashboardLayout = 'customer' | 'operations' | 'admin';

