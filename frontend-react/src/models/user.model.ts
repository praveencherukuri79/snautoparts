/**
 * User/Profile Models
 * Generated from swagger.json - /profile/* endpoints
 */

/**
 * User profile with extended fields
 * GET /profile/ - Response
 */
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * GET /profile/ - Response (200)
 */
export interface GetProfileResponse {
  data: UserProfile;
}

/**
 * PATCH /profile/ - Request body
 */
export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

/**
 * PATCH /profile/ - Response (200)
 */
export interface UpdateUserProfileResponse {
  data: Partial<UserProfile>;
}

/**
 * Address object
 * Used by: /profile/addresses
 */
export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
  isBilling: boolean;
  createdAt?: string;
}

/**
 * GET /profile/addresses - Response (200)
 */
export interface GetAddressesResponse {
  data: Address[];
}

/**
 * POST /profile/addresses - Request body
 */
export interface CreateAddressRequest {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string; // default: "US"
  phone?: string;
  isDefault?: boolean; // default: false
  isBilling?: boolean; // default: false
}

/**
 * POST /profile/addresses - Response (200)
 */
export interface CreateAddressResponse {
  data: Address;
}

/**
 * PATCH /profile/addresses/{id} - Request body
 */
export interface UpdateAddressRequest {
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
  isBilling?: boolean;
}

/**
 * PATCH /profile/addresses/{id} - Response (200)
 */
export interface UpdateAddressResponse {
  data: Address;
}

/**
 * Saved Vehicle object
 * Used by: /profile/vehicles
 */
export interface SavedVehicle {
  id: string;
  nickname: string | null;
  year: number;
  make: string;
  model: string;
  submodel: string | null;
  engine: string | null;
  isDefault: boolean;
  createdAt?: string;
}

/**
 * GET /profile/vehicles - Response (200)
 */
export interface GetVehiclesResponse {
  data: SavedVehicle[];
}

/**
 * POST /profile/vehicles - Request body
 */
export interface CreateVehicleRequest {
  nickname?: string;
  year: number;
  make: string;
  model: string;
  submodel?: string;
  engine?: string;
  isDefault?: boolean; // default: false
}

/**
 * POST /profile/vehicles - Response (200)
 */
export interface CreateVehicleResponse {
  data: SavedVehicle;
}

/**
 * User role type
 */
export type UserRole = 'CUSTOMER' | 'MANAGER' | 'ADMIN';
