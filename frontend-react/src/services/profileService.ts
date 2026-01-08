/**
 * Profile Service
 * 
 * Handles user profile, addresses, and saved vehicles API calls.
 * Conditionally uses mock data based on env.enableMockData.
 */

import { api } from './api';
import { env } from '@/config/env';
import {
  mockUserProfile,
  mockAddresses,
  mockSavedVehicles,
} from './mockData';
import type {
  UserProfile,
  GetProfileResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  Address,
  GetAddressesResponse,
  CreateAddressRequest,
  CreateAddressResponse,
  UpdateAddressRequest,
  UpdateAddressResponse,
  SavedVehicle,
  GetVehiclesResponse,
  CreateVehicleRequest,
  CreateVehicleResponse,
} from '@/models';

/**
 * Profile Service
 */
export const profileService = {
  /**
   * Get user profile
   */
  getProfile: async (): Promise<UserProfile> => {
    if (env.enableMockData) {
      return mockUserProfile;
    }

    try {
      const response = await api.get<GetProfileResponse>('/profile/');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch profile, using mock data:', error);
      return mockUserProfile;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateUserProfileRequest): Promise<Partial<UserProfile>> => {
    if (env.enableMockData) {
      return { ...mockUserProfile, ...data };
    }

    const response = await api.patch<UpdateUserProfileResponse>('/profile/', data);
    return response.data.data;
  },

  /**
   * Get all addresses
   */
  getAddresses: async (): Promise<Address[]> => {
    if (env.enableMockData) {
      return mockAddresses;
    }

    try {
      const response = await api.get<GetAddressesResponse>('/profile/addresses');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch addresses, using mock data:', error);
      return mockAddresses;
    }
  },

  /**
   * Create new address
   */
  createAddress: async (data: CreateAddressRequest): Promise<Address> => {
    if (env.enableMockData) {
      const newAddress: Address = {
        id: `${Date.now()}`,
        ...data,
        company: data.company || null,
        address2: data.address2 || null,
        country: data.country || 'US',
        phone: data.phone || null,
        isDefault: data.isDefault || false,
        isBilling: data.isBilling || false,
        createdAt: new Date().toISOString(),
      };
      return newAddress;
    }

    const response = await api.post<CreateAddressResponse>('/profile/addresses', data);
    return response.data.data;
  },

  /**
   * Update address
   */
  updateAddress: async (id: string, data: UpdateAddressRequest): Promise<Address> => {
    if (env.enableMockData) {
      const existingAddress = mockAddresses.find(a => a.id === id) || mockAddresses[0];
      return { ...existingAddress, ...data };
    }

    const response = await api.patch<UpdateAddressResponse>(`/profile/addresses/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete address
   */
  deleteAddress: async (id: string): Promise<void> => {
    if (env.enableMockData) {
      return Promise.resolve();
    }

    await api.delete(`/profile/addresses/${id}`);
  },

  /**
   * Get all saved vehicles
   */
  getVehicles: async (): Promise<SavedVehicle[]> => {
    if (env.enableMockData) {
      return mockSavedVehicles;
    }

    try {
      const response = await api.get<GetVehiclesResponse>('/profile/vehicles');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch vehicles, using mock data:', error);
      return mockSavedVehicles;
    }
  },

  /**
   * Create new vehicle
   */
  createVehicle: async (data: CreateVehicleRequest): Promise<SavedVehicle> => {
    if (env.enableMockData) {
      const newVehicle: SavedVehicle = {
        id: `${Date.now()}`,
        ...data,
        nickname: data.nickname || null,
        submodel: data.submodel || null,
        engine: data.engine || null,
        isDefault: data.isDefault || false,
        createdAt: new Date().toISOString(),
      };
      return newVehicle;
    }

    const response = await api.post<CreateVehicleResponse>('/profile/vehicles', data);
    return response.data.data;
  },

  /**
   * Update vehicle
   */
  updateVehicle: async (id: string, data: Partial<CreateVehicleRequest>): Promise<SavedVehicle> => {
    if (env.enableMockData) {
      const existingVehicle = mockSavedVehicles.find(v => v.id === id) || mockSavedVehicles[0];
      return { ...existingVehicle, ...data };
    }

    const response = await api.patch<CreateVehicleResponse>(`/profile/vehicles/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete vehicle
   */
  deleteVehicle: async (id: string): Promise<void> => {
    if (env.enableMockData) {
      return Promise.resolve();
    }

    await api.delete(`/profile/vehicles/${id}`);
  },
};

export default profileService;

