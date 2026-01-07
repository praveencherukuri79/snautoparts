/**
 * Mock data generators for Settings
 */

export interface MockSetting {
  id: string;
  key: string;
  value: unknown;
  description: string;
  category: 'general' | 'shipping' | 'tax' | 'integrations' | 'notifications';
  type: 'string' | 'number' | 'boolean' | 'json' | 'select';
  options?: string[];
  isEditable: boolean;
}

export interface MockShippingZone {
  id: string;
  name: string;
  regions: string[];
  methods: MockShippingMethod[];
  isActive: boolean;
}

export interface MockShippingMethod {
  id: string;
  name: string;
  carrier: string;
  price: number;
  minDays: number;
  maxDays: number;
  isActive: boolean;
}

export interface MockTaxRate {
  id: string;
  region: string;
  state: string;
  rate: number;
  isActive: boolean;
}

export interface MockIntegration {
  id: string;
  name: string;
  type: 'payment' | 'email' | 'shipping' | 'analytics' | 'supplier';
  isConnected: boolean;
  isActive: boolean;
  icon: string;
  description: string;
  configFields?: Array<{ key: string; label: string; type: string; masked?: boolean }>;
}

export function generateGeneralSettings(): MockSetting[] {
  return [
    { id: '1', key: 'store_name', value: 'SN Auto Parts', description: 'Store name displayed on the website', category: 'general', type: 'string', isEditable: true },
    { id: '2', key: 'store_email', value: 'support@snautoparts.com', description: 'Primary contact email', category: 'general', type: 'string', isEditable: true },
    { id: '3', key: 'store_phone', value: '(555) 123-4567', description: 'Customer support phone number', category: 'general', type: 'string', isEditable: true },
    { id: '4', key: 'store_address', value: '123 Auto Drive, Detroit, MI 48201', description: 'Physical store address', category: 'general', type: 'string', isEditable: true },
    { id: '5', key: 'currency', value: 'USD', description: 'Store currency', category: 'general', type: 'select', options: ['USD', 'CAD', 'EUR', 'GBP'], isEditable: true },
    { id: '6', key: 'timezone', value: 'America/Detroit', description: 'Store timezone', category: 'general', type: 'select', options: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Detroit'], isEditable: true },
    { id: '7', key: 'low_stock_threshold', value: 10, description: 'Default low stock threshold for products', category: 'general', type: 'number', isEditable: true },
    { id: '8', key: 'enable_reviews', value: true, description: 'Allow customers to leave product reviews', category: 'general', type: 'boolean', isEditable: true },
    { id: '9', key: 'enable_wishlist', value: true, description: 'Enable wishlist functionality', category: 'general', type: 'boolean', isEditable: true },
  ];
}

export function generateShippingZones(): MockShippingZone[] {
  return [
    {
      id: 'zone-1',
      name: 'Continental US',
      regions: ['United States (48 states)'],
      methods: [
        { id: 'method-1', name: 'Standard Shipping', carrier: 'USPS', price: 9.99, minDays: 5, maxDays: 7, isActive: true },
        { id: 'method-2', name: 'Express Shipping', carrier: 'UPS', price: 19.99, minDays: 2, maxDays: 3, isActive: true },
        { id: 'method-3', name: 'Overnight', carrier: 'FedEx', price: 34.99, minDays: 1, maxDays: 1, isActive: true },
      ],
      isActive: true,
    },
    {
      id: 'zone-2',
      name: 'Alaska & Hawaii',
      regions: ['Alaska', 'Hawaii'],
      methods: [
        { id: 'method-4', name: 'Standard Shipping', carrier: 'USPS', price: 19.99, minDays: 7, maxDays: 10, isActive: true },
        { id: 'method-5', name: 'Express Shipping', carrier: 'FedEx', price: 39.99, minDays: 3, maxDays: 5, isActive: true },
      ],
      isActive: true,
    },
    {
      id: 'zone-3',
      name: 'Canada',
      regions: ['Canada'],
      methods: [
        { id: 'method-6', name: 'International Standard', carrier: 'UPS', price: 24.99, minDays: 7, maxDays: 14, isActive: true },
      ],
      isActive: false,
    },
  ];
}

export function generateShippingSettings(): MockSetting[] {
  return [
    { id: '10', key: 'free_shipping_threshold', value: 100, description: 'Minimum order amount for free shipping', category: 'shipping', type: 'number', isEditable: true },
    { id: '11', key: 'enable_local_pickup', value: true, description: 'Allow customers to pick up orders locally', category: 'shipping', type: 'boolean', isEditable: true },
    { id: '12', key: 'default_weight_unit', value: 'lb', description: 'Default weight unit for products', category: 'shipping', type: 'select', options: ['lb', 'kg', 'oz'], isEditable: true },
    { id: '13', key: 'default_dimension_unit', value: 'in', description: 'Default dimension unit for products', category: 'shipping', type: 'select', options: ['in', 'cm'], isEditable: true },
  ];
}

export function generateTaxSettings(): MockSetting[] {
  return [
    { id: '14', key: 'enable_tax_calculation', value: true, description: 'Enable automatic tax calculation', category: 'tax', type: 'boolean', isEditable: true },
    { id: '15', key: 'tax_included_in_price', value: false, description: 'Prices include tax', category: 'tax', type: 'boolean', isEditable: true },
    { id: '16', key: 'tax_based_on', value: 'shipping', description: 'Calculate tax based on', category: 'tax', type: 'select', options: ['shipping', 'billing', 'store'], isEditable: true },
    { id: '17', key: 'display_tax_totals', value: 'itemized', description: 'Display tax totals', category: 'tax', type: 'select', options: ['itemized', 'single'], isEditable: true },
  ];
}

export function generateTaxRates(): MockTaxRate[] {
  return [
    { id: 'tax-1', region: 'United States', state: 'Michigan', rate: 6.0, isActive: true },
    { id: 'tax-2', region: 'United States', state: 'California', rate: 7.25, isActive: true },
    { id: 'tax-3', region: 'United States', state: 'New York', rate: 8.0, isActive: true },
    { id: 'tax-4', region: 'United States', state: 'Texas', rate: 6.25, isActive: true },
    { id: 'tax-5', region: 'United States', state: 'Florida', rate: 6.0, isActive: true },
    { id: 'tax-6', region: 'Canada', state: 'Ontario', rate: 13.0, isActive: false },
  ];
}

export function generateTaxExemptions(): Array<{ id: string; name: string; description: string; isActive: boolean }> {
  return [
    { id: 'exempt-1', name: 'Reseller Exemption', description: 'Tax exempt for registered resellers with valid certificate', isActive: true },
    { id: 'exempt-2', name: 'Non-Profit Organization', description: 'Tax exempt for registered 501(c)(3) organizations', isActive: true },
    { id: 'exempt-3', name: 'Government Purchase', description: 'Tax exempt for government purchases', isActive: true },
  ];
}

export function generateIntegrations(): MockIntegration[] {
  return [
    {
      id: 'int-1',
      name: 'Stripe',
      type: 'payment',
      isConnected: true,
      isActive: true,
      icon: 'payment',
      description: 'Accept credit card payments securely',
      configFields: [
        { key: 'public_key', label: 'Publishable Key', type: 'text' },
        { key: 'secret_key', label: 'Secret Key', type: 'password', masked: true },
        { key: 'webhook_secret', label: 'Webhook Secret', type: 'password', masked: true },
      ],
    },
    {
      id: 'int-2',
      name: 'PayPal',
      type: 'payment',
      isConnected: false,
      isActive: false,
      icon: 'account_balance_wallet',
      description: 'Accept PayPal and Venmo payments',
    },
    {
      id: 'int-3',
      name: 'Resend',
      type: 'email',
      isConnected: true,
      isActive: true,
      icon: 'email',
      description: 'Transactional email service',
      configFields: [
        { key: 'api_key', label: 'API Key', type: 'password', masked: true },
        { key: 'from_email', label: 'From Email', type: 'email' },
      ],
    },
    {
      id: 'int-4',
      name: 'UPS',
      type: 'shipping',
      isConnected: true,
      isActive: true,
      icon: 'local_shipping',
      description: 'UPS shipping rates and tracking',
    },
    {
      id: 'int-5',
      name: 'FedEx',
      type: 'shipping',
      isConnected: true,
      isActive: true,
      icon: 'local_shipping',
      description: 'FedEx shipping rates and tracking',
    },
    {
      id: 'int-6',
      name: 'Google Analytics',
      type: 'analytics',
      isConnected: false,
      isActive: false,
      icon: 'analytics',
      description: 'Track website traffic and conversions',
    },
    {
      id: 'int-7',
      name: 'A-Premium',
      type: 'supplier',
      isConnected: true,
      isActive: true,
      icon: 'inventory_2',
      description: 'Drop-ship supplier integration',
    },
  ];
}

export function generateWebhooks() {
  return [
    { id: 'wh-1', name: 'Order Created', url: 'https://api.example.com/webhooks/orders', events: ['order.created'], isActive: true, lastTriggeredAt: new Date().toISOString() },
    { id: 'wh-2', name: 'Order Shipped', url: 'https://api.example.com/webhooks/shipping', events: ['order.shipped'], isActive: true, lastTriggeredAt: new Date().toISOString() },
    { id: 'wh-3', name: 'Inventory Update', url: 'https://api.example.com/webhooks/inventory', events: ['inventory.updated'], isActive: false, lastTriggeredAt: null },
  ];
}

