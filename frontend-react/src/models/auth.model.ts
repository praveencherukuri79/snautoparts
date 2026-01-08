/**
 * Authentication Models
 * Generated from swagger.json - /auth/* endpoints
 */

/**
 * User object returned in auth responses
 * Used by: /auth/login, /auth/register, /auth/session, /auth/profile, /auth/me
 */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
}

/**
 * POST /auth/login - Request body
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * POST /auth/login - Response (200)
 */
export interface LoginResponse {
  success: boolean;
  user: AuthUser;
}

/**
 * POST /auth/register - Request body
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * POST /auth/register - Response (200)
 */
export interface RegisterResponse {
  success: boolean;
  user: AuthUser;
}

/**
 * POST /auth/logout - Response (200)
 */
export interface LogoutResponse {
  success: boolean;
}

/**
 * GET /auth/session - Response (200)
 */
export interface SessionResponse {
  authenticated: boolean;
  user: AuthUser | null;
}

/**
 * POST /auth/change-password - Request body
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * POST /auth/change-password - Response (200)
 */
export interface ChangePasswordResponse {
  success: boolean;
}

/**
 * PATCH /auth/profile - Request body
 */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
}

/**
 * PATCH /auth/profile - Response (200)
 * GET /auth/me - Response (200) returns { data: AuthUser }
 */
export interface UpdateProfileResponse extends AuthUser {}

/**
 * GET /auth/me - Response (200)
 */
export interface GetMeResponse {
  data: AuthUser;
}

/**
 * GET /auth/feature-config - Response (200)
 */
export interface FeatureConfigResponse {
  data: Record<string, unknown>;
}

/**
 * Role object
 * Used by: GET /auth/roles
 */
export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
}

/**
 * GET /auth/roles - Response (200)
 */
export interface RolesResponse {
  data: Role[];
}

/**
 * POST /auth/forgot-password - Request body (not in swagger but commonly needed)
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * POST /auth/reset-password - Request body (not in swagger but commonly needed)
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
