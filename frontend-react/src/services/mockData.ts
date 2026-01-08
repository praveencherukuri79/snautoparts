/**
 * Mock Data Service
 * 
 * Centralized mock data for development and testing.
 * Toggled via VITE_ENABLE_MOCK_DATA environment variable.
 */

import type { 
  OrderSummary, 
  OrderStatus, 
  AuthUser,
  OrderDetail,
  OrderItem,
  OrderTimelineEvent,
  Shipment,
} from '@/models';
import type { Address, SavedVehicle, UserProfile } from '@/models';

/**
 * Account Dashboard Stats (NOT in swagger - custom)
 */
export interface AccountDashboardStats {
  totalOrders: number;
  savedVehicles: number;
  cartItems: number;
  addresses: number;
}

/**
 * Quick Action Card (NOT in swagger - UI only)
 */
export interface QuickAction {
  label: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

export const mockAccountDashboardStats: AccountDashboardStats = {
  totalOrders: 24,
  savedVehicles: 3,
  cartItems: 5,
  addresses: 2,
};

export const mockRecentOrders: OrderSummary[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    status: 'DELIVERED' as OrderStatus,
    total: '245.99',
    itemCount: 3,
    createdAt: '2024-01-05T10:30:00Z',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    status: 'SHIPPED' as OrderStatus,
    total: '189.50',
    itemCount: 2,
    createdAt: '2024-01-03T14:15:00Z',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    status: 'PROCESSING' as OrderStatus,
    total: '412.75',
    itemCount: 5,
    createdAt: '2023-12-28T09:00:00Z',
  },
];

export const mockQuickActions: QuickAction[] = [
  {
    label: 'Browse Catalog',
    description: 'Explore our full parts catalog',
    icon: 'Inventory',
    color: 'primary.main',
    route: '/shop',
  },
  {
    label: 'Track Orders',
    description: 'View all your order history',
    icon: 'LocalShipping',
    color: 'info.main',
    route: '/account/orders',
  },
  {
    label: 'My Vehicles',
    description: 'Manage saved vehicles',
    icon: 'DirectionsCar',
    color: 'success.main',
    route: '/account/vehicles',
  },
  {
    label: 'Account Settings',
    description: 'Manage preferences and security',
    icon: 'Settings',
    color: 'text.secondary',
    route: '/account/settings',
  },
];

/**
 * Mock Current User (uses AuthUser model from swagger)
 */
export const mockCurrentUser: AuthUser = {
  id: '1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: null,
  role: 'CUSTOMER',
};

/**
 * Mock User Profile
 */
export const mockUserProfile: UserProfile = {
  id: '1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1 (555) 123-4567',
  role: 'CUSTOMER',
  emailVerified: true,
  createdAt: '2023-06-15T10:30:00Z',
  updatedAt: '2024-01-10T14:20:00Z',
};

/**
 * Mock Addresses
 */
export const mockAddresses: Address[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    company: null,
    address1: '123 Main Street',
    address2: 'Apt 4B',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    country: 'US',
    phone: '+1 (555) 123-4567',
    isDefault: true,
    isBilling: false,
    createdAt: '2023-06-15T10:30:00Z',
  },
  {
    id: '2',
    firstName: 'John',
    lastName: 'Doe',
    company: 'Acme Corp',
    address1: '456 Business Park Dr',
    address2: 'Suite 200',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    country: 'US',
    phone: '+1 (555) 987-6543',
    isDefault: false,
    isBilling: true,
    createdAt: '2023-08-20T15:45:00Z',
  },
];

/**
 * Mock Saved Vehicles
 */
export const mockSavedVehicles: SavedVehicle[] = [
  {
    id: '1',
    nickname: 'Daily Driver',
    year: 2018,
    make: 'Honda',
    model: 'Civic',
    submodel: 'EX',
    engine: '1.5L Turbo',
    isDefault: true,
    createdAt: '2023-06-15T10:30:00Z',
  },
  {
    id: '2',
    nickname: 'Work Truck',
    year: 2015,
    make: 'Ford',
    model: 'F-150',
    submodel: 'XLT',
    engine: '3.5L V6',
    isDefault: false,
    createdAt: '2023-07-22T09:15:00Z',
  },
  {
    id: '3',
    nickname: null,
    year: 2020,
    make: 'Toyota',
    model: 'Camry',
    submodel: 'SE',
    engine: '2.5L 4-Cyl',
    isDefault: false,
    createdAt: '2023-11-05T16:30:00Z',
  },
];

/**
 * Mock Order Items
 */
export const mockOrderItems: OrderItem[] = [
  {
    id: '1',
    productId: 'prod-1',
    productName: 'Premium Brake Pads - Front',
    productSku: 'BP-F-001',
    productImageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=200&q=80',
    quantity: 1,
    unitPrice: '89.99',
    totalPrice: '89.99',
  },
  {
    id: '2',
    productId: 'prod-2',
    productName: 'Oil Filter - Premium',
    productSku: 'OF-001',
    productImageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=200&q=80',
    quantity: 2,
    unitPrice: '12.50',
    totalPrice: '25.00',
  },
  {
    id: '3',
    productId: 'prod-3',
    productName: 'Air Filter',
    productSku: 'AF-002',
    productImageUrl: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=200&q=80',
    quantity: 1,
    unitPrice: '24.99',
    totalPrice: '24.99',
  },
];

/**
 * Mock Order Detail
 */
export const mockOrderDetail: OrderDetail = {
  id: '1',
  orderNumber: 'ORD-2024-001',
  status: 'DELIVERED' as OrderStatus,
  subtotal: '140.98',
  shippingCost: '15.00',
  taxAmount: '12.48',
  total: '168.46',
  shippingMethod: 'Standard Shipping (5-7 business days)',
  paymentMethod: 'Credit Card ending in 4242',
  notes: null,
  createdAt: '2024-01-05T10:30:00Z',
  updatedAt: '2024-01-12T14:20:00Z',
  items: mockOrderItems,
  shippingAddress: mockAddresses[0],
  billingAddress: mockAddresses[1],
};

/**
 * Mock Order Timeline
 */
export const mockOrderTimeline: OrderTimelineEvent[] = [
  {
    id: '1',
    status: 'PENDING',
    title: 'Order Placed',
    description: 'Your order has been received and is being processed',
    createdAt: '2024-01-05T10:30:00Z',
    changedBy: null,
  },
  {
    id: '2',
    status: 'CONFIRMED',
    title: 'Order Confirmed',
    description: 'Payment received and order confirmed',
    createdAt: '2024-01-05T10:35:00Z',
    changedBy: null,
  },
  {
    id: '3',
    status: 'PROCESSING',
    title: 'Processing',
    description: 'Your order is being prepared for shipment',
    createdAt: '2024-01-06T09:00:00Z',
    changedBy: {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Manager',
    },
  },
  {
    id: '4',
    status: 'SHIPPED',
    title: 'Shipped',
    description: 'Your order has been shipped',
    createdAt: '2024-01-08T15:20:00Z',
    changedBy: {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Manager',
    },
  },
  {
    id: '5',
    status: 'DELIVERED',
    title: 'Delivered',
    description: 'Package delivered successfully',
    createdAt: '2024-01-12T14:20:00Z',
    changedBy: null,
  },
];

/**
 * Mock Shipment
 */
export const mockShipment: Shipment = {
  id: '1',
  carrier: 'FedEx',
  trackingNumber: '7890123456789',
  trackingUrl: 'https://www.fedex.com/track?number=7890123456789',
  status: 'delivered',
  estimatedDelivery: '2024-01-12T00:00:00Z',
  shippedAt: '2024-01-08T15:20:00Z',
  deliveredAt: '2024-01-12T14:20:00Z',
};

/**
 * Mock Full Orders List
 */
export const mockAllOrders: OrderSummary[] = [
  ...mockRecentOrders,
  {
    id: '4',
    orderNumber: 'ORD-2023-099',
    status: 'DELIVERED' as OrderStatus,
    total: '89.99',
    itemCount: 1,
    createdAt: '2023-12-15T11:20:00Z',
  },
  {
    id: '5',
    orderNumber: 'ORD-2023-085',
    status: 'DELIVERED' as OrderStatus,
    total: '324.50',
    itemCount: 4,
    createdAt: '2023-11-28T16:45:00Z',
  },
  {
    id: '6',
    orderNumber: 'ORD-2023-072',
    status: 'CANCELLED' as OrderStatus,
    total: '156.75',
    itemCount: 2,
    createdAt: '2023-11-10T09:30:00Z',
  },
];

