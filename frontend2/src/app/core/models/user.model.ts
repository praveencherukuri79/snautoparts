/**
 * User & Authentication Models
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Role {
  id: string;
  name: RoleName;
  displayName: string;
  description?: string;
}

export type RoleName = 'CUSTOMER' | 'MANAGER' | 'ADMIN';

// Authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// Address
export interface Address {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  addressLine1?: string; // Alias for address1
  addressLine2?: string; // Alias for address2
  city: string;
  state: string;
  zipCode: string;
  postalCode?: string; // Alias for zipCode
  country: string;
  phone?: string;
  isDefault: boolean;
  type: AddressType;
  createdAt: string;
  updatedAt: string;
}

export type AddressType = 'SHIPPING' | 'BILLING' | 'BOTH';

export interface AddressFormData {
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
  type?: AddressType;
}

// Saved Vehicle
export interface SavedVehicle {
  id: string;
  userId: string;
  nickname?: string;
  year: number;
  make: string;
  model: string;
  submodel?: string;
  engine?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface SavedVehicleFormData {
  nickname?: string;
  year: number;
  make: string;
  model: string;
  submodel?: string;
  engine?: string;
}

// User Profile Update
export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

