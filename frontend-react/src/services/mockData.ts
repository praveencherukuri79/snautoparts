/**
 * Mock Data Service
 * 
 * Centralized mock data for development and testing.
 * Toggled via VITE_ENABLE_MOCK_DATA environment variable.
 */

import type { OrderSummary, OrderStatus, AuthUser } from '@/models';

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
    description: 'Update your profile',
    icon: 'Settings',
    color: 'text.secondary',
    route: '/account/profile',
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

