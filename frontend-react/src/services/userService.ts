import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type {
  UserProfile,
  Address,
  SavedVehicle,
  GetProfileResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  GetAddressesResponse,
  CreateAddressRequest,
  CreateAddressResponse,
  UpdateAddressRequest,
  UpdateAddressResponse,
  GetVehiclesResponse,
  CreateVehicleRequest,
  CreateVehicleResponse,
} from '@/models';

// API Endpoints matching swagger paths
const PROFILE_ENDPOINTS = {
  BASE: '/profile/',
  ADDRESSES: '/profile/addresses',
  ADDRESS: (id: string) => `/profile/addresses/${id}`,
  VEHICLES: '/profile/vehicles',
  VEHICLE: (id: string) => `/profile/vehicles/${id}`,
};

/**
 * User Service
 * 
 * Handles user profile, addresses, and saved vehicles API calls.
 * Types match swagger.json exactly.
 */
export const userService = {
  // Profile
  /**
   * GET /profile/
   * Returns the current user's profile information
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiGet<GetProfileResponse>(PROFILE_ENDPOINTS.BASE);
    return response.data;
  },

  /**
   * PATCH /profile/
   * Update the current user's profile information
   */
  updateProfile: async (data: UpdateUserProfileRequest): Promise<Partial<UserProfile>> => {
    const response = await apiPatch<UpdateUserProfileResponse>(PROFILE_ENDPOINTS.BASE, data);
    return response.data;
  },

  // Addresses
  /**
   * GET /profile/addresses
   * Returns all saved addresses for the current user
   */
  getAddresses: async (): Promise<Address[]> => {
    const response = await apiGet<GetAddressesResponse>(PROFILE_ENDPOINTS.ADDRESSES);
    return response.data;
  },

  /**
   * POST /profile/addresses
   * Create a new saved address
   */
  createAddress: async (data: CreateAddressRequest): Promise<Address> => {
    const response = await apiPost<CreateAddressResponse>(PROFILE_ENDPOINTS.ADDRESSES, data);
    return response.data;
  },

  /**
   * PATCH /profile/addresses/{id}
   * Update an existing saved address
   */
  updateAddress: async (id: string, data: UpdateAddressRequest): Promise<Address> => {
    const response = await apiPatch<UpdateAddressResponse>(PROFILE_ENDPOINTS.ADDRESS(id), data);
    return response.data;
  },

  /**
   * DELETE /profile/addresses/{id}
   * Delete a saved address
   */
  deleteAddress: async (id: string): Promise<void> => {
    await apiDelete(PROFILE_ENDPOINTS.ADDRESS(id));
  },

  // Vehicles
  /**
   * GET /profile/vehicles
   * Returns all saved vehicles for the current user
   */
  getVehicles: async (): Promise<SavedVehicle[]> => {
    const response = await apiGet<GetVehiclesResponse>(PROFILE_ENDPOINTS.VEHICLES);
    return response.data;
  },

  /**
   * POST /profile/vehicles
   * Save a vehicle for quick fitment selection
   */
  createVehicle: async (data: CreateVehicleRequest): Promise<SavedVehicle> => {
    const response = await apiPost<CreateVehicleResponse>(PROFILE_ENDPOINTS.VEHICLES, data);
    return response.data;
  },

  /**
   * DELETE /profile/vehicles/{id}
   * Remove a saved vehicle
   */
  deleteVehicle: async (id: string): Promise<void> => {
    await apiDelete(PROFILE_ENDPOINTS.VEHICLE(id));
  },
};

// Re-export types for convenience
export type {
  UserProfile,
  Address,
  SavedVehicle,
  UpdateUserProfileRequest,
  CreateAddressRequest,
  UpdateAddressRequest,
  CreateVehicleRequest,
};

export default userService;
