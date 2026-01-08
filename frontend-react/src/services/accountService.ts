/**
 * Account Service
 * 
 * Handles account/profile API calls with mock data toggle
 */

import { apiGet } from './api';
import { env } from '@/config';
import {
  mockAccountDashboardStats,
  mockRecentOrders,
  mockQuickActions,
  mockCurrentUser,
  type AccountDashboardStats,
  type QuickAction,
} from './mockData';
import type { OrderSummary, AuthUser } from '@/models';

/**
 * Account dashboard data structure
 */
export interface AccountDashboardData {
  stats: AccountDashboardStats;
  recentOrders: OrderSummary[];
  quickActions: QuickAction[];
  user: AuthUser; // Using AuthUser model from swagger
}

/**
 * Account Service
 */
export const accountService = {
  /**
   * Get account dashboard data
   * Combines stats, recent orders, and quick actions
   */
  getDashboardData: async (): Promise<AccountDashboardData> => {
    if (env.enableMockData) {
      // Return mock data
      return {
        stats: mockAccountDashboardStats,
        recentOrders: mockRecentOrders,
        quickActions: mockQuickActions,
        user: mockCurrentUser,
      };
    }

    // Real API calls - swagger compliant
    try {
      // Parallel requests for better performance
      const [ordersResponse, meResponse] = await Promise.all([
        apiGet<{ data: OrderSummary[]; meta: any }>('/orders/?limit=3'),
        apiGet<{ data: AuthUser }>('/auth/me'),
      ]);

      // For now, we'll use basic stats from the orders response
      // TODO: Add proper stats endpoint when backend implements it
      const stats: AccountDashboardStats = {
        totalOrders: ordersResponse.meta?.total || ordersResponse.data.length,
        savedVehicles: 0, // Will be fetched separately if needed
        cartItems: 0, // Will be fetched from cart endpoint
        addresses: 0, // Will be fetched from profile/addresses
      };

      return {
        stats,
        recentOrders: ordersResponse.data,
        quickActions: mockQuickActions, // These are static UI config
        user: meResponse.data,
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Fallback to mock data on error
      return {
        stats: mockAccountDashboardStats,
        recentOrders: mockRecentOrders,
        quickActions: mockQuickActions,
        user: mockCurrentUser,
      };
    }
  },
};

export default accountService;

