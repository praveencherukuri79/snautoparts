/**
 * Application Constants
 */

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    SESSION: '/auth/session',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    FEATURE_CONFIG: '/auth/feature-config',
    REFRESH_TOKEN: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },
  // Catalog
  CATALOG: {
    PRODUCTS: '/products',
    PRODUCT: (id: string) => `/products/${id}`,
    CATEGORIES: '/categories',
    CATEGORY: (id: string) => `/categories/${id}`,
    BRANDS: '/brands',
    SEARCH: '/products/search',
  },
  // Products (aliases for backward compatibility)
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    BY_CATEGORY: (categoryId: string) => `/categories/${categoryId}/products`,
    SEARCH: '/products/search',
    FEATURED: '/products/featured',
  },
  // Categories (aliases for backward compatibility)
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id: string) => `/categories/${id}`,
    TREE: '/categories/tree',
  },
  // Search
  SEARCH: {
    PRODUCTS: '/products/search',
    SUGGESTIONS: '/products/search/suggestions',
  },
  // Fitment
  FITMENT: {
    YEARS: '/fitment/years',
    MAKES: '/fitment/makes',
    MODELS: '/fitment/models',
    SEARCH: '/fitment/search',
    ENGINES: '/fitment/engines',
  },
  // Cart
  CART: {
    BASE: '/cart',
    GET: '/cart',
    ADD: '/cart/items',
    UPDATE: (id: string) => `/cart/items/${id}`,
    REMOVE: (id: string) => `/cart/items/${id}`,
    CLEAR: '/cart/clear',
    ITEMS: '/cart/items',
    ITEM: (id: string) => `/cart/items/${id}`,
    COUNT: '/cart/count',
    APPLY_COUPON: '/cart/coupon',
    REMOVE_COUPON: '/cart/coupon',
  },
  // Orders
  ORDERS: {
    BASE: '/orders',
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    ORDER: (id: string) => `/orders/${id}`,
    MY_ORDERS: '/orders/my',
    TRACK: (orderNumber: string) => `/orders/track/${orderNumber}`,
    STATISTICS: '/orders/statistics',
  },
  // Checkout
  CHECKOUT: {
    BASE: '/checkout',
    SHIPPING_RATES: '/checkout/shipping-rates',
    PAYMENT_INTENT: '/checkout/payment-intent',
    CALCULATE: '/checkout/calculate',
  },
  // Addresses
  ADDRESSES: {
    BASE: '/addresses',
    LIST: '/addresses',
    DETAIL: (id: string) => `/addresses/${id}`,
    ADDRESS: (id: string) => `/addresses/${id}`,
  },
  // Vehicles
  VEHICLES: {
    BASE: '/vehicles',
    LIST: '/vehicles',
    DETAIL: (id: string) => `/vehicles/${id}`,
    VEHICLE: (id: string) => `/vehicles/${id}`,
  },
  // Inventory
  INVENTORY: {
    BASE: '/inventory',
    ITEM: (id: string) => `/inventory/${id}`,
    ADJUSTMENTS: '/inventory/adjustments',
    ALERTS: '/inventory/alerts',
    IMPORT: '/inventory/import',
  },
  // Users
  USERS: {
    BASE: '/users',
    USER: (id: string) => `/users/${id}`,
  },
  // Settings
  SETTINGS: {
    GENERAL: '/settings/general',
    SHIPPING: '/settings/shipping',
    TAX: '/settings/tax',
    PAYMENT: '/settings/payment',
    INTEGRATIONS: '/settings/integrations',
  },
  // Reports
  REPORTS: {
    SALES: '/reports/sales',
    INVENTORY: '/reports/inventory',
    GMV: '/reports/gmv',
    TOP_PRODUCTS: '/reports/top-products',
    CATEGORIES: '/reports/categories',
  },
  // Audit
  AUDIT: {
    LOGS: '/audit/logs',
    STATISTICS: '/audit/statistics',
  },
  // Wishlist
  WISHLIST: {
    LIST: '/wishlist',
    ADD: '/wishlist',
    REMOVE: (productId: string) => `/wishlist/${productId}`,
  },
} as const;

/**
 * Route Paths
 */
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Catalog
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  CATEGORIES: '/categories',
  CATEGORY: (slug: string) => `/category/${slug}`,
  
  // Cart & Checkout
  CART: '/cart',
  CHECKOUT: '/checkout',
  CHECKOUT_SHIPPING: '/checkout/shipping',
  CHECKOUT_PAYMENT: '/checkout/payment',
  CHECKOUT_REVIEW: '/checkout/review',
  CHECKOUT_CONFIRMATION: '/checkout/confirmation',
  
  // Account
  ACCOUNT: '/account',
  ACCOUNT_PROFILE: '/account/profile',
  ACCOUNT_ADDRESSES: '/account/addresses',
  ACCOUNT_VEHICLES: '/account/vehicles',
  ACCOUNT_CHANGE_PASSWORD: '/account/change-password',
  
  // Orders
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  ORDER_TRACKING: '/order-tracking',
  
  // Dashboard (Manager/Admin)
  DASHBOARD: '/dashboard',
  
  // Inventory
  INVENTORY: '/inventory',
  INVENTORY_DETAIL: (id: string) => `/inventory/${id}`,
  INVENTORY_IMPORT: '/inventory/import',
  INVENTORY_ALERTS: '/inventory/alerts',
  
  // Products Management
  PRODUCTS_MANAGE: '/products-manage',
  PRODUCT_CREATE: '/products-manage/create',
  PRODUCT_EDIT: (id: string) => `/products-manage/${id}/edit`,
  FITMENT_EDITOR: '/products-manage/fitment',
  
  // Users (Admin)
  USERS: '/users',
  USER_DETAIL: (id: string) => `/users/${id}`,
  USER_CREATE: '/users/create',
  
  // Settings (Admin)
  SETTINGS: '/settings',
  SETTINGS_GENERAL: '/settings/general',
  SETTINGS_SHIPPING: '/settings/shipping',
  SETTINGS_TAX: '/settings/tax',
  SETTINGS_PAYMENT: '/settings/payment',
  SETTINGS_INTEGRATIONS: '/settings/integrations',
  
  // Reports
  REPORTS: '/reports',
  REPORTS_SALES: '/reports/sales',
  REPORTS_INVENTORY: '/reports/inventory',
  REPORTS_GMV: '/reports/gmv',
  
  // Audit
  AUDIT: '/audit',
  AUDIT_STATISTICS: '/audit/statistics',
  
  // Affiliates/Dropship
  DROPSHIP: '/dropship',
  AFFILIATES: '/affiliates',
  AFFILIATE_DETAIL: (id: string) => `/affiliates/${id}`,
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  LIMITS: [10, 20, 50, 100],
} as const;

/**
 * Date formats
 */
export const DATE_FORMATS = {
  DATE: 'MMM D, YYYY',
  DATE_SHORT: 'MM/DD/YY',
  DATE_LONG: 'MMMM D, YYYY',
  DATE_TIME: 'MMM D, YYYY h:mm A',
  TIME: 'h:mm A',
  ISO: 'YYYY-MM-DD',
} as const;

/**
 * Order statuses
 */
export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'confirmed', label: 'Confirmed', color: 'info' },
  { value: 'processing', label: 'Processing', color: 'primary' },
  { value: 'shipped', label: 'Shipped', color: 'info' },
  { value: 'delivered', label: 'Delivered', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'error' },
  { value: 'refunded', label: 'Refunded', color: 'secondary' },
] as const;

/**
 * Stock statuses
 */
export const STOCK_STATUSES = [
  { value: 'in_stock', label: 'In Stock', color: 'success' },
  { value: 'low_stock', label: 'Low Stock', color: 'warning' },
  { value: 'out_of_stock', label: 'Out of Stock', color: 'error' },
] as const;

/**
 * User roles
 */
export const USER_ROLES = [
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN', label: 'Administrator' },
] as const;

/**
 * Breakpoints (matching MUI defaults)
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

/**
 * Z-index layers
 */
export const Z_INDEX = {
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
} as const;

/**
 * Animation durations (ms)
 */
export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;
