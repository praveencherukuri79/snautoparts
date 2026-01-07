/**
 * Default feature configurations by role
 * 
 * Used for authorization checks and frontend feature visibility
 */

export type RoleName = 'CUSTOMER' | 'MANAGER' | 'ADMIN';

export interface FeatureConfig {
  role: string;
  version: number;
  features: Record<string, Record<string, boolean>>;
  navigation?: {
    primary: NavigationItem[];
    secondary: NavigationItem[];
    account: NavigationItem[];
  };
  ui?: {
    dashboardLayout: string;
    showPriceHistory: boolean;
    showCostPrice: boolean;
    showAuditInfo: boolean;
  };
}

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: { type: string; source: string };
}

const DEFAULT_CONFIGS: Record<string, FeatureConfig> = {
  CUSTOMER: {
    role: 'CUSTOMER',
    version: 1,
    features: {
      catalog: { browse: true, search: true, viewDetail: true, fitmentFilter: true },
      cart: { view: true, modify: true, checkout: true },
      orders: { viewOwn: true, viewAll: false, updateStatus: false, cancel: false, viewStatistics: false },
      inventory: { view: false, adjust: false, import: false, viewHistory: false, viewAlerts: false },
      products: { create: false, update: false, delete: false, manageFitment: false, manageImages: false },
      dropship: { viewOrders: false, retryPush: false, manageAffiliates: false },
      users: { viewAll: false, create: false, updateRole: false, delete: false },
      settings: { view: false, update: false },
      audit: { view: false, export: false },
      reports: { salesByDay: false, salesByCategory: false, inventoryValue: false, gmv: false },
    },
    navigation: {
      primary: [
        { id: 'home', label: 'Home', icon: 'home', route: '/' },
        { id: 'products', label: 'Products', icon: 'grid', route: '/products' },
        { id: 'cart', label: 'Cart', icon: 'shopping-cart', route: '/cart', badge: { type: 'count', source: '/api/v1/cart/count' } },
      ],
      secondary: [],
      account: [
        { id: 'orders', label: 'My Orders', icon: 'package', route: '/orders' },
        { id: 'profile', label: 'Profile', icon: 'user', route: '/account/profile' },
        { id: 'addresses', label: 'Addresses', icon: 'map-pin', route: '/account/addresses' },
      ],
    },
    ui: {
      dashboardLayout: 'customer',
      showPriceHistory: false,
      showCostPrice: false,
      showAuditInfo: false,
    },
  },
  MANAGER: {
    role: 'MANAGER',
    version: 1,
    features: {
      catalog: { browse: true, search: true, viewDetail: true, fitmentFilter: true },
      cart: { view: false, modify: false, checkout: false },
      orders: { viewOwn: false, viewAll: true, updateStatus: true, cancel: true, viewStatistics: true },
      inventory: { view: true, adjust: true, import: true, viewHistory: true, viewAlerts: true },
      products: { create: true, update: true, delete: true, manageFitment: true, manageImages: true },
      dropship: { viewOrders: true, retryPush: true, manageAffiliates: false },
      users: { viewAll: false, create: false, updateRole: false, delete: false },
      settings: { view: false, update: false },
      audit: { view: false, export: false },
      reports: { salesByDay: true, salesByCategory: true, inventoryValue: true, gmv: false },
    },
    navigation: {
      primary: [
        { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard' },
        { id: 'orders', label: 'Orders', icon: 'package', route: '/orders', badge: { type: 'count', source: '/api/v1/orders/pending-count' } },
        { id: 'inventory', label: 'Inventory', icon: 'warehouse', route: '/inventory', badge: { type: 'dot', source: '/api/v1/inventory/has-alerts' } },
        { id: 'products', label: 'Products', icon: 'box', route: '/products' },
        { id: 'dropship', label: 'Drop Ship', icon: 'truck', route: '/dropship' },
        { id: 'reports', label: 'Reports', icon: 'bar-chart', route: '/reports' },
      ],
      secondary: [],
      account: [
        { id: 'profile', label: 'Profile', icon: 'user', route: '/account/profile' },
      ],
    },
    ui: {
      dashboardLayout: 'operations',
      showPriceHistory: true,
      showCostPrice: true,
      showAuditInfo: false,
    },
  },
  ADMIN: {
    role: 'ADMIN',
    version: 1,
    features: {
      catalog: { browse: true, search: true, viewDetail: true, fitmentFilter: true },
      cart: { view: false, modify: false, checkout: false },
      orders: { viewOwn: false, viewAll: true, updateStatus: true, cancel: true, viewStatistics: true },
      inventory: { view: true, adjust: true, import: true, viewHistory: true, viewAlerts: true },
      products: { create: true, update: true, delete: true, manageFitment: true, manageImages: true },
      dropship: { viewOrders: true, retryPush: true, manageAffiliates: true },
      users: { viewAll: true, create: true, updateRole: true, delete: true },
      settings: { view: true, update: true },
      audit: { view: true, export: true },
      reports: { salesByDay: true, salesByCategory: true, inventoryValue: true, gmv: true },
    },
    navigation: {
      primary: [
        { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard' },
        { id: 'orders', label: 'Orders', icon: 'package', route: '/orders' },
        { id: 'inventory', label: 'Inventory', icon: 'warehouse', route: '/inventory' },
        { id: 'products', label: 'Products', icon: 'box', route: '/products' },
        { id: 'dropship', label: 'Drop Ship', icon: 'truck', route: '/dropship' },
        { id: 'reports', label: 'Reports', icon: 'bar-chart', route: '/reports' },
      ],
      secondary: [
        { id: 'users', label: 'Users', icon: 'users', route: '/users' },
        { id: 'settings', label: 'Settings', icon: 'settings', route: '/settings' },
        { id: 'affiliates', label: 'Affiliates', icon: 'link', route: '/affiliates' },
        { id: 'audit', label: 'Audit Log', icon: 'file-text', route: '/audit' },
      ],
      account: [
        { id: 'profile', label: 'Profile', icon: 'user', route: '/account/profile' },
      ],
    },
    ui: {
      dashboardLayout: 'admin',
      showPriceHistory: true,
      showCostPrice: true,
      showAuditInfo: true,
    },
  },
};

/**
 * Get default feature config for a role
 */
export function getDefaultFeatureConfig(roleName: string): FeatureConfig {
  return DEFAULT_CONFIGS[roleName] ?? DEFAULT_CONFIGS.CUSTOMER;
}

/**
 * Type guard for FeatureConfig
 */
export function isFeatureConfig(obj: unknown): obj is FeatureConfig {
  if (!obj || typeof obj !== 'object') return false;
  const config = obj as Record<string, unknown>;
  return (
    typeof config.role === 'string' &&
    typeof config.version === 'number' &&
    typeof config.features === 'object' &&
    config.features !== null
  );
}

/**
 * Check if feature config has the specified feature enabled
 */
export function checkFeaturePermission(config: FeatureConfig, featurePath: string): boolean {
  const parts = featurePath.split('.');
  let current: Record<string, boolean> | boolean | undefined = config.features[parts[0]];

  for (let i = 1; i < parts.length; i++) {
    if (current === undefined || typeof current === 'boolean') return false;
    current = current[parts[i]];
  }

  return current === true;
}

