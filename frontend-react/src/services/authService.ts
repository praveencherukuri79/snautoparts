import { apiGet, apiPost, apiPatch } from './api';
import { API_ENDPOINTS } from '@/utils/constants';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  LogoutResponse,
  SessionResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  GetMeResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthUser,
} from '@/models';

/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls.
 * Types are imported from @/models which are generated from swagger.json
 */
export const authService = {
  /**
   * POST /auth/login
   * Login with email and password
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiPost<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  /**
   * POST /auth/register
   * Register a new user account
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    return apiPost<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
  },

  /**
   * POST /auth/logout
   * Logout the current user
   */
  logout: async (): Promise<LogoutResponse> => {
    return apiPost<LogoutResponse>(API_ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * GET /auth/session
   * Check if user is authenticated and get session info
   */
  getSession: async (): Promise<SessionResponse> => {
    return apiGet<SessionResponse>(API_ENDPOINTS.AUTH.SESSION);
  },

  /**
   * POST /auth/change-password
   * Change password for authenticated user
   */
  changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    return apiPost<ChangePasswordResponse>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  /**
   * PATCH /auth/profile
   * Update the current user profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    return apiPatch<UpdateProfileResponse>(API_ENDPOINTS.AUTH.PROFILE, data);
  },

  /**
   * GET /auth/me
   * Get current authenticated user
   */
  getMe: async (): Promise<GetMeResponse> => {
    return apiGet<GetMeResponse>(API_ENDPOINTS.AUTH.ME);
  },

  /**
   * POST /auth/forgot-password
   * Request password reset email
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    return apiPost<void>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  },

  /**
   * POST /auth/reset-password
   * Reset password with token
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    return apiPost<void>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },
};

// Re-export types for convenience
export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  LogoutResponse,
  SessionResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  GetMeResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthUser,
};

export default authService;
