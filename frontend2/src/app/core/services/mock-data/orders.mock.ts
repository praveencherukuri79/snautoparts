/**
 * Mock data generators for Orders
 */

export interface MockOrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface MockOrderTimeline {
  id: string;
  status: string;
  title: string;
  description: string;
  createdAt: string;
  changedBy?: string;
}

export interface MockOrder {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  userId: string;
  customerName: string;
  customerEmail: string;
  items: MockOrderItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  shippingMethod: string;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  timeline: MockOrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

const ORDER_STATUSES: MockOrder['status'][] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const CUSTOMER_NAMES = [
  'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson',
  'Jessica Martinez', 'Christopher Anderson', 'Amanda Taylor', 'Matthew Thomas', 'Ashley Garcia',
];

const PRODUCT_NAMES = [
  'Performance Brake Pads', 'Premium Oil Filter', 'Spark Plug Set', 'Air Filter',
  'Alternator 12V', 'Coil Spring Kit', 'Shock Absorber', 'Water Pump',
];

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

function generateOrderItems(count: number): MockOrderItem[] {
  return Array.from({ length: count }, (_, i) => {
    const unitPrice = 20 + Math.random() * 150;
    const quantity = Math.floor(1 + Math.random() * 3);
    return {
      id: `item-${i + 1}`,
      productId: `prod-${i + 1}`,
      productName: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
      productSku: `SKU-${1000 + i}`,
      productImage: PRODUCT_IMAGES[i % PRODUCT_IMAGES.length],
      quantity,
      unitPrice: Math.round(unitPrice * 100) / 100,
      total: Math.round(unitPrice * quantity * 100) / 100,
    };
  });
}

function generateTimeline(status: MockOrder['status'], createdAt: Date): MockOrderTimeline[] {
  const timeline: MockOrderTimeline[] = [];
  const statusFlow: MockOrder['status'][] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentIndex = statusFlow.indexOf(status);

  const titles: Record<string, string> = {
    'PENDING': 'Order Placed',
    'CONFIRMED': 'Payment Confirmed',
    'PROCESSING': 'Order Processing',
    'SHIPPED': 'Order Shipped',
    'DELIVERED': 'Order Delivered',
  };

  const descriptions: Record<string, string> = {
    'PENDING': 'Your order has been received and is awaiting payment confirmation.',
    'CONFIRMED': 'Payment has been confirmed. Your order is being prepared.',
    'PROCESSING': 'Your order is being picked and packed.',
    'SHIPPED': 'Your order has been shipped and is on its way.',
    'DELIVERED': 'Your order has been delivered.',
  };

  for (let i = 0; i <= currentIndex; i++) {
    const s = statusFlow[i];
    const eventDate = new Date(createdAt.getTime() + i * 24 * 60 * 60 * 1000);
    timeline.push({
      id: `timeline-${i + 1}`,
      status: s,
      title: titles[s],
      description: descriptions[s],
      createdAt: eventDate.toISOString(),
      changedBy: i > 0 ? 'System' : undefined,
    });
  }

  return timeline;
}

export function generateOrders(count: number = 20): MockOrder[] {
  return Array.from({ length: count }, (_, i) => {
    const status = ORDER_STATUSES[i % ORDER_STATUSES.length];
    const items = generateOrderItems(1 + Math.floor(Math.random() * 4));
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const shippingCost = subtotal > 100 ? 0 : 9.99;
    const taxAmount = Math.round(subtotal * 0.08 * 100) / 100;
    const createdAt = new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000);
    const customerName = CUSTOMER_NAMES[i % CUSTOMER_NAMES.length];

    return {
      id: `order-${i + 1}`,
      orderNumber: `SN-${(100000 + i).toString()}`,
      status,
      userId: `user-${(i % 10) + 1}`,
      customerName,
      customerEmail: `${customerName.toLowerCase().replace(' ', '.')}@email.com`,
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      shippingCost,
      taxAmount,
      total: Math.round((subtotal + shippingCost + taxAmount) * 100) / 100,
      shippingAddress: {
        firstName: customerName.split(' ')[0],
        lastName: customerName.split(' ')[1],
        address1: `${100 + i} Main Street`,
        city: 'Detroit',
        state: 'MI',
        postalCode: '48201',
        country: 'US',
        phone: '(555) 123-4567',
      },
      shippingMethod: subtotal > 100 ? 'Free Standard Shipping' : 'Standard Shipping',
      trackingNumber: status === 'SHIPPED' || status === 'DELIVERED' ? `1Z999AA10123456784` : undefined,
      trackingUrl: status === 'SHIPPED' || status === 'DELIVERED' ? 'https://www.ups.com/track' : undefined,
      timeline: generateTimeline(status, createdAt),
      createdAt: createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

export function generateOrderStats() {
  return {
    totalOrders: 1247,
    pendingOrders: 23,
    processingOrders: 45,
    shippedOrders: 89,
    deliveredOrders: 1056,
    cancelledOrders: 34,
    totalRevenue: 189450.00,
    averageOrderValue: 151.92,
    ordersToday: 12,
    revenueToday: 1823.50,
  };
}

export function generateOrderTrackingResult(orderNumber: string): MockOrder | null {
  const orders = generateOrders(20);
  const order = orders.find(o => o.orderNumber === orderNumber);
  if (order) return order;

  // If not found by exact match, return first order with modified order number
  if (orderNumber.startsWith('SN-')) {
    const mockOrder = orders[0];
    return { ...mockOrder, orderNumber };
  }

  return null;
}

