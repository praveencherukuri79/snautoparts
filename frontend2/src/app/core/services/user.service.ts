import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import {
  User,
  Address,
  AddressFormData,
  SavedVehicle,
  SavedVehicleFormData,
  ProfileUpdateRequest,
  UserListItem,
  UserFormData,
  UserFilters,
  Role,
  PaginatedResponse,
} from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);

  // ============================================
  // Profile (Current User)
  // ============================================

  async getProfile(): Promise<User> {
    return this.api.get<User>('/profile');
  }

  async updateProfile(data: ProfileUpdateRequest): Promise<User> {
    return this.api.patch<User>('/profile', data);
  }

  // ============================================
  // Addresses
  // ============================================

  async getAddresses(): Promise<Address[]> {
    const response = await this.api.get<{ data: Address[] }>('/profile/addresses');
    return response.data;
  }

  async createAddress(data: AddressFormData): Promise<Address> {
    return this.api.post<Address>('/profile/addresses', data);
  }

  async updateAddress(addressId: string, data: Partial<AddressFormData>): Promise<Address> {
    return this.api.patch<Address>(`/profile/addresses/${addressId}`, data);
  }

  async deleteAddress(addressId: string): Promise<void> {
    await this.api.delete(`/profile/addresses/${addressId}`);
  }

  async setDefaultAddress(addressId: string): Promise<Address> {
    return this.api.patch<Address>(`/profile/addresses/${addressId}/default`, {});
  }

  // ============================================
  // Saved Vehicles
  // ============================================

  async getSavedVehicles(): Promise<SavedVehicle[]> {
    const response = await this.api.get<{ data: SavedVehicle[] }>('/profile/vehicles');
    return response.data;
  }

  async saveVehicle(data: SavedVehicleFormData): Promise<SavedVehicle> {
    return this.api.post<SavedVehicle>('/profile/vehicles', data);
  }

  async deleteSavedVehicle(vehicleId: string): Promise<void> {
    await this.api.delete(`/profile/vehicles/${vehicleId}`);
  }

  async setDefaultVehicle(vehicleId: string): Promise<SavedVehicle> {
    return this.api.patch<SavedVehicle>(`/profile/vehicles/${vehicleId}/default`, {});
  }

  // ============================================
  // User Management (Admin)
  // ============================================

  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<UserListItem>> {
    const params = this.buildQueryParams(filters);
    return this.api.get<PaginatedResponse<UserListItem>>(`/users?${params}`);
  }

  async getUser(userId: string): Promise<User> {
    return this.api.get<User>(`/users/${userId}`);
  }

  async createUser(data: UserFormData): Promise<User> {
    return this.api.post<User>('/users', data);
  }

  async updateUser(userId: string, data: Partial<UserFormData>): Promise<User> {
    return this.api.patch<User>(`/users/${userId}`, data);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.api.delete(`/users/${userId}`);
  }

  async getRoles(): Promise<Role[]> {
    const response = await this.api.get<{ data: Role[] }>('/users/roles');
    return response.data;
  }

  // Build query params
  private buildQueryParams<T extends object>(params?: T): string {
    if (!params) return '';

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  }
}

