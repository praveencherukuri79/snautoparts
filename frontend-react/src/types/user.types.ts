/**
 * User Types
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
}

export type UserRole = 'CUSTOMER' | 'MANAGER' | 'ADMIN';

/**
 * Address Types
 */
export interface Address {
  id: string;
  userId: string;
  label: string;
  firstName: string;
  lastName: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

/**
 * Saved Vehicle Types
 */
export interface SavedVehicle {
  id: string;
  userId: string;
  year: number;
  make: string;
  model: string;
  submodel?: string;
  engine?: string;
  nickname?: string;
  isDefault: boolean;
}
