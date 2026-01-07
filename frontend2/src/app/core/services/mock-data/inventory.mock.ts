/**
 * Mock data generators for Inventory
 */

export interface MockInventoryItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productImage: string;
  brandName: string;
  categoryName: string;
  stockQuantity: number;
  lowStockThreshold: number;
  costPrice: number;
  retailPrice: number;
  totalCostValue: number;
  totalRetailValue: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  lastAdjustmentAt?: string;
}

export interface MockInventoryAdjustment {
  id: string;
  productId: string;
  type: 'RESTOCK' | 'SALE' | 'ADJUSTMENT' | 'RETURN' | 'DAMAGED' | 'AUDIT';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  reference?: string;
  createdBy: string;
  createdAt: string;
}

export interface MockLowStockAlert {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  brandName: string;
  categoryName: string;
  currentStock: number;
  threshold: number;
  deficit: number;
  severity: 'warning' | 'critical';
  lastRestockedAt?: string;
}

const PRODUCT_NAMES = [
  'Performance Brake Pads', 'Alternator 12V 120A', 'Coil Spring Kit (Rear)',
  'V6 Engine Block Assembly', 'Spark Plug Iridium', 'Oil Filter Premium',
  'Air Filter Universal', 'Water Pump Assembly', 'Radiator Hose Kit',
  'Oxygen Sensor', 'Ignition Coil Pack', 'Fuel Pump Module',
];

const BRANDS = ['Brembo', 'Bosch', 'Bilstein', 'OEM Ford', 'NGK', 'Denso', 'ACDelco', 'Moog'];
const CATEGORIES = ['Brakes', 'Electrical', 'Suspension', 'Engine', 'Filters', 'Cooling System'];
const ADJUSTMENT_TYPES: MockInventoryAdjustment['type'][] = ['RESTOCK', 'SALE', 'ADJUSTMENT', 'RETURN', 'DAMAGED', 'AUDIT'];

// Unsplash product images (auto parts themed)
const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1541348263662-e068662d82af?w=400&h=400&fit=crop',
];

export function generateInventoryItems(count: number = 20): MockInventoryItem[] {
  return Array.from({ length: count }, (_, i) => {
    const stockQuantity = Math.floor(Math.random() * 200);
    const lowStockThreshold = 10 + Math.floor(Math.random() * 15);
    const costPrice = 20 + Math.random() * 200;
    const retailPrice = costPrice * (1.4 + Math.random() * 0.6);

    return {
      id: `inv-${i + 1}`,
      productId: `prod-${i + 1}`,
      productName: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
      productSku: `SKU-${(1000 + i).toString()}`,
      productImage: PRODUCT_IMAGES[i % PRODUCT_IMAGES.length],
      brandName: BRANDS[i % BRANDS.length],
      categoryName: CATEGORIES[i % CATEGORIES.length],
      stockQuantity,
      lowStockThreshold,
      costPrice: Math.round(costPrice * 100) / 100,
      retailPrice: Math.round(retailPrice * 100) / 100,
      totalCostValue: Math.round(costPrice * stockQuantity * 100) / 100,
      totalRetailValue: Math.round(retailPrice * stockQuantity * 100) / 100,
      isLowStock: stockQuantity > 0 && stockQuantity <= lowStockThreshold,
      isOutOfStock: stockQuantity === 0,
      lastAdjustmentAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
}

export function generateInventoryHistory(productId: string, count: number = 10): MockInventoryAdjustment[] {
  let currentQty = 50 + Math.floor(Math.random() * 100);

  return Array.from({ length: count }, (_, i) => {
    const type = ADJUSTMENT_TYPES[i % ADJUSTMENT_TYPES.length];
    const isIncrease = type === 'RESTOCK' || type === 'RETURN';
    const change = Math.floor(1 + Math.random() * 20);
    const quantity = isIncrease ? change : -change;
    const previousQuantity = currentQty;
    currentQty = Math.max(0, currentQty + quantity);

    const reasons: Record<string, string> = {
      'RESTOCK': 'Received shipment from supplier',
      'SALE': 'Sold to customer',
      'ADJUSTMENT': 'Inventory count correction',
      'RETURN': 'Customer return',
      'DAMAGED': 'Item damaged in warehouse',
      'AUDIT': 'Physical inventory audit',
    };

    return {
      id: `adj-${i + 1}`,
      productId,
      type,
      quantity,
      previousQuantity,
      newQuantity: currentQty,
      reason: reasons[type],
      reference: type === 'SALE' ? `Order #SN-${100000 + i}` : undefined,
      createdBy: ['System', 'John Manager', 'Admin User'][i % 3],
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
}

export function generateLowStockAlerts(): MockLowStockAlert[] {
  const items = generateInventoryItems(20).filter(i => i.isLowStock || i.isOutOfStock);

  return items.slice(0, 12).map((item, i) => ({
    id: `alert-${i + 1}`,
    productId: item.productId,
    productName: item.productName,
    productSku: item.productSku,
    brandName: item.brandName,
    categoryName: item.categoryName,
    currentStock: item.stockQuantity,
    threshold: item.lowStockThreshold,
    deficit: Math.max(0, item.lowStockThreshold - item.stockQuantity),
    severity: item.stockQuantity === 0 ? 'critical' : 'warning',
    lastRestockedAt: item.lastAdjustmentAt,
  }));
}

export function generateInventoryStats() {
  return {
    totalProducts: 450,
    totalCostValue: 845000,
    totalRetailValue: 1200000,
    lowStockCount: 12,
    outOfStockCount: 3,
    avgValuePerItem: 1877.77,
    costChange: 2.4,
    retailChange: 1.8,
  };
}

export function generateInventoryByCategory() {
  return [
    { category: 'Engine', value: 350000, percentage: 100 },
    { category: 'Suspension', value: 280000, percentage: 80 },
    { category: 'Brakes', value: 120000, percentage: 35 },
    { category: 'Transmission', value: 80000, percentage: 25 },
    { category: 'Electrical', value: 45000, percentage: 15 },
  ];
}

