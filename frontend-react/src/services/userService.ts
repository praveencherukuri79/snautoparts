import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { API_ENDPOINTS } from '@/utils/constants';
import { User, Address, SavedVehicle, PaymentMethod } from '@/types';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface CreateAddressRequest {
  name: string;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
  type?: 'shipping' | 'billing' | 'both';
}

export interface CreateVehicleRequest {
  name: string;
  make: string;
  model: string;
  year: number;
  engine?: string;
  vin?: string;
  licensePlate?: string;
  isDefault?: boolean;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
    salePrice?: number;
    imageUrl?: string;
    inStock: boolean;
  };
  addedAt: string;
}

/**
 * User Service
 * 
 * Handles user account management API calls.
 */
export const userService = {
  // Profile
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    return apiGet<User>(API_ENDPOINTS.AUTH.PROFILE);
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    return apiPut<User>(API_ENDPOINTS.AUTH.PROFILE, data);
  },

  /**
   * Upload profile avatar
   */
  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiPost<{ avatarUrl: string }>(`${API_ENDPOINTS.AUTH.PROFILE}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Delete user account
   */
  deleteAccount: async (password: string): Promise<void> => {
    return apiDelete<void>(API_ENDPOINTS.AUTH.PROFILE, {
      data: { password },
    });
  },

  // Addresses
  /**
   * Get all user addresses
   */
  getAddresses: async (): Promise<Address[]> => {
    return apiGet<Address[]>(API_ENDPOINTS.ADDRESSES.LIST);
  },

  /**
   * Create new address
   */
  createAddress: async (data: CreateAddressRequest): Promise<Address> => {
    return apiPost<Address>(API_ENDPOINTS.ADDRESSES.LIST, data);
  },

  /**
   * Update address
   */
  updateAddress: async (id: string, data: Partial<CreateAddressRequest>): Promise<Address> => {
    return apiPut<Address>(API_ENDPOINTS.ADDRESSES.DETAIL(id), data);
  },

  /**
   * Delete address
   */
  deleteAddress: async (id: string): Promise<void> => {
    return apiDelete<void>(API_ENDPOINTS.ADDRESSES.DETAIL(id));
  },

  /**
   * Set default address
   */
  setDefaultAddress: async (id: string, type: 'shipping' | 'billing'): Promise<Address> => {
    return apiPost<Address>(`${API_ENDPOINTS.ADDRESSES.DETAIL(id)}/set-default`, { type });
  },

  // Vehicles
  /**
   * Get all saved vehicles
   */
  getVehicles: async (): Promise<SavedVehicle[]> => {
    return apiGet<SavedVehicle[]>(API_ENDPOINTS.VEHICLES.LIST);
  },

  /**
   * Create new saved vehicle
   */
  createVehicle: async (data: CreateVehicleRequest): Promise<SavedVehicle> => {
    return apiPost<SavedVehicle>(API_ENDPOINTS.VEHICLES.LIST, data);
  },

  /**
   * Update saved vehicle
   */
  updateVehicle: async (id: string, data: Partial<CreateVehicleRequest>): Promise<SavedVehicle> => {
    return apiPut<SavedVehicle>(API_ENDPOINTS.VEHICLES.DETAIL(id), data);
  },

  /**
   * Delete saved vehicle
   */
  deleteVehicle: async (id: string): Promise<void> => {
    return apiDelete<void>(API_ENDPOINTS.VEHICLES.DETAIL(id));
  },

  /**
   * Set default vehicle
   */
  setDefaultVehicle: async (id: string): Promise<SavedVehicle> => {
    return apiPost<SavedVehicle>(`${API_ENDPOINTS.VEHICLES.DETAIL(id)}/set-default`);
  },

  // Wishlist
  /**
   * Get wishlist items
   */
  getWishlist: async (): Promise<WishlistItem[]> => {
    return apiGet<WishlistItem[]>(API_ENDPOINTS.WISHLIST.LIST);
  },

  /**
   * Add item to wishlist
   */
  addToWishlist: async (productId: string): Promise<WishlistItem> => {
    return apiPost<WishlistItem>(API_ENDPOINTS.WISHLIST.ADD, { productId });
  },

  /**
   * Remove item from wishlist
   */
  removeFromWishlist: async (productId: string): Promise<void> => {
    return apiDelete<void>(API_ENDPOINTS.WISHLIST.REMOVE(productId));
  },

  /**
   * Check if product is in wishlist
   */
  isInWishlist: async (productId: string): Promise<boolean> => {
    return apiGet<boolean>(`${API_ENDPOINTS.WISHLIST.LIST}/check/${productId}`);
  },

  // Payment Methods (if storing payment methods)
  /**
   * Get saved payment methods
   */
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    return apiGet<PaymentMethod[]>(`${API_ENDPOINTS.AUTH.PROFILE}/payment-methods`);
  },

  /**
   * Delete payment method
   */
  deletePaymentMethod: async (id: string): Promise<void> => {
    return apiDelete<void>(`${API_ENDPOINTS.AUTH.PROFILE}/payment-methods/${id}`);
  },

  /**
   * Set default payment method
   */
  setDefaultPaymentMethod: async (id: string): Promise<PaymentMethod> => {
    return apiPost<PaymentMethod>(`${API_ENDPOINTS.AUTH.PROFILE}/payment-methods/${id}/set-default`);
  },
};

export default userService;
