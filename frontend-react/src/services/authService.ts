import { apiGet, apiPost } from './api';
import { API_ENDPOINTS } from '@/utils/constants';
import { User, LoginCredentials, RegisterData, AuthTokens } from '@/types';

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  passwordConfirmation: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls.
 */
export const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiPost<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  /**
   * Register a new user account
   */
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    return apiPost<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
  },

  /**
   * Logout the current user
   */
  logout: async (): Promise<void> => {
    return apiPost<void>(API_ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    return apiPost<void>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    return apiPost<void>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },

  /**
   * Change password for authenticated user
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    return apiPost<void>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  /**
   * Refresh access token
   */
  refreshToken: async (data: RefreshTokenRequest): Promise<AuthTokens> => {
    return apiPost<AuthTokens>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, data);
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    return apiGet<User>(API_ENDPOINTS.AUTH.PROFILE);
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<void> => {
    return apiPost<void>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
  },

  /**
   * Resend email verification
   */
  resendVerification: async (): Promise<void> => {
    return apiPost<void>(API_ENDPOINTS.AUTH.RESEND_VERIFICATION);
  },
};

export default authService;
