/**
 * Mock data generators for Affiliates / Drop-shipping
 */

export interface MockAffiliate {
  id: string;
  name: string;
  code: string;
  baseUrl: string;
  isActive: boolean;
  totalOrders: number;
  pendingOrders: number;
  failedOrders: number;
  lastSyncAt: string;
  createdAt: string;
}

export interface MockAffiliateOrder {
  id: string;
  orderId: string;
  orderNumber: string;
  affiliateId: string;
  affiliateName: string;
  status: 'PENDING' | 'SENT' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';
  externalOrderId?: string;
  itemCount: number;
  total: number;
  lastError?: string;
  retryCount: number;
  nextRetryAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockAffiliateProductMapping {
  id: string;
  affiliateId: string;
  productId: string;
  productName: string;
  productSku: string;
  affiliateSku: string;
  affiliateProductId?: string;
  priceMultiplier: number;
  isActive: boolean;
}

const AFFILIATE_DATA = [
  { name: 'A-Premium', code: 'APREMIUM', baseUrl: 'https://api.a-premium.com' },
  { name: 'BuyAutoParts', code: 'BAP', baseUrl: 'https://api.buyautoparts.com' },
  { name: 'TRQ Parts', code: 'TRQ', baseUrl: 'https://api.trqparts.com' },
  { name: 'RockAuto', code: 'ROCKAUTO', baseUrl: 'https://api.rockauto.com' },
];

export function generateAffiliates(): MockAffiliate[] {
  return AFFILIATE_DATA.map((aff, i) => ({
    id: `aff-${i + 1}`,
    name: aff.name,
    code: aff.code,
    baseUrl: aff.baseUrl,
    isActive: i < 3, // First 3 are active
    totalOrders: Math.floor(100 + Math.random() * 500),
    pendingOrders: Math.floor(Math.random() * 10),
    failedOrders: Math.floor(Math.random() * 5),
    lastSyncAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

export function generateAffiliate(affiliateId: string): MockAffiliate {
  const affiliates = generateAffiliates();
  return affiliates.find(a => a.id === affiliateId) || affiliates[0];
}

export function generateAffiliateOrders(status?: 'PENDING' | 'FAILED'): MockAffiliateOrder[] {
  const affiliates = generateAffiliates();
  const statuses: MockAffiliateOrder['status'][] = status ? [status] : ['PENDING', 'SENT', 'CONFIRMED', 'FAILED'];

  return Array.from({ length: 20 }, (_, i) => {
    const affiliate = affiliates[i % affiliates.length];
    const orderStatus = statuses[i % statuses.length];
    const isFailed = orderStatus === 'FAILED';

    return {
      id: `aff-order-${i + 1}`,
      orderId: `order-${i + 1}`,
      orderNumber: `SN-${100000 + i}`,
      affiliateId: affiliate.id,
      affiliateName: affiliate.name,
      status: orderStatus,
      externalOrderId: orderStatus === 'CONFIRMED' ? `EXT-${200000 + i}` : undefined,
      itemCount: Math.floor(1 + Math.random() * 5),
      total: Math.round((50 + Math.random() * 300) * 100) / 100,
      lastError: isFailed ? ['Connection timeout', 'Invalid SKU mapping', 'Out of stock at supplier', 'API rate limit exceeded'][i % 4] : undefined,
      retryCount: isFailed ? Math.floor(1 + Math.random() * 3) : 0,
      nextRetryAt: isFailed ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : undefined,
      createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }).filter(o => !status || o.status === status);
}

export function generatePendingDropshipOrders(): MockAffiliateOrder[] {
  return generateAffiliateOrders('PENDING');
}

export function generateFailedDropshipOrders(): MockAffiliateOrder[] {
  return generateAffiliateOrders('FAILED');
}

export function generateAffiliateProductMappings(affiliateId: string): MockAffiliateProductMapping[] {
  const productNames = [
    'Performance Brake Pads', 'Alternator 12V', 'Coil Spring Kit',
    'Spark Plug Set', 'Oil Filter Premium', 'Air Filter',
  ];

  return Array.from({ length: 10 }, (_, i) => ({
    id: `mapping-${i + 1}`,
    affiliateId,
    productId: `prod-${i + 1}`,
    productName: productNames[i % productNames.length],
    productSku: `SKU-${1000 + i}`,
    affiliateSku: `AFF-SKU-${2000 + i}`,
    affiliateProductId: `AFF-PROD-${3000 + i}`,
    priceMultiplier: 1 + (Math.random() * 0.1), // 1.00 to 1.10
    isActive: Math.random() > 0.2,
  }));
}

export function generateDropshipStats() {
  return {
    totalAffiliates: 4,
    activeAffiliates: 3,
    pendingOrders: 12,
    failedOrders: 3,
    ordersToday: 8,
    successRate: 94.5,
  };
}

