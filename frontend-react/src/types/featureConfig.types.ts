/**
 * Feature Configuration Types
 * Determines what features are available to each role
 */
export interface FeatureConfig {
  role: string;
  version: number;
  features: {
    catalog: {
      browse: boolean;
      search: boolean;
      viewDetail: boolean;
      fitmentFilter: boolean;
    };
    cart: {
      view: boolean;
      modify: boolean;
      checkout: boolean;
    };
    orders: {
      viewOwn: boolean;
      viewAll: boolean;
      updateStatus: boolean;
      cancel: boolean;
      viewStatistics: boolean;
    };
    inventory: {
      view: boolean;
      adjust: boolean;
      import: boolean;
      viewHistory: boolean;
      viewAlerts: boolean;
    };
    products: {
      create: boolean;
      update: boolean;
      delete: boolean;
      manageFitment: boolean;
      manageImages: boolean;
    };
    dropship: {
      viewOrders: boolean;
      retryPush: boolean;
      manageAffiliates: boolean;
    };
    users: {
      viewAll: boolean;
      create: boolean;
      updateRole: boolean;
      delete: boolean;
    };
    settings: {
      view: boolean;
      update: boolean;
    };
    audit: {
      view: boolean;
      export: boolean;
    };
    reports: {
      salesByDay: boolean;
      salesByCategory: boolean;
      inventoryValue: boolean;
      gmv: boolean;
    };
  };
  navigation: {
    primary: NavigationItem[];
    secondary?: NavigationItem[];
    account: NavigationItem[];
  };
  ui: {
    dashboardLayout: 'customer' | 'operations' | 'admin';
    showPriceHistory: boolean;
    showCostPrice: boolean;
    showAuditInfo: boolean;
  };
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  children?: NavigationItem[];
  badge?: {
    type: 'count' | 'dot';
    source: string;
  };
}

/**
 * Feature check helper type
 */
export type FeatureCategory = keyof FeatureConfig['features'];
export type FeatureName<T extends FeatureCategory> = keyof FeatureConfig['features'][T];
