import { useCallback } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { authAtom, AuthState, notificationAtom } from '@/state/atoms';
import { isAuthenticatedSelector, userRoleSelector } from '@/state/selectors';
import { authService } from '@/services';
import { LoginCredentials, RegisterData, User } from '@/types';
import { setStorageItem, removeStorageItem, STORAGE_KEYS } from '@/utils/storage';

export interface UseAuthReturn {
  /** Current user */
  user: User | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** User role */
  role: string | null;
  /** Loading state */
  isLoading: boolean;
  /** Login with credentials */
  login: (credentials: LoginCredentials) => Promise<void>;
  /** Register new account */
  register: (data: RegisterData) => Promise<void>;
  /** Logout current user */
  logout: () => Promise<void>;
  /** Refresh user profile */
  refreshProfile: () => Promise<void>;
  /** Check if user has specific role */
  hasRole: (role: string | string[]) => boolean;
  /** Check if user has specific permission */
  hasPermission: (permission: string) => boolean;
}

/**
 * useAuth Hook
 * 
 * Manages authentication state and provides auth-related functions.
 * 
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 * 
 * if (isAuthenticated) {
 *   return <Dashboard user={user} />;
 * }
 * return <LoginForm onSubmit={login} />;
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [auth, setAuth] = useRecoilState<AuthState>(authAtom);
  const isAuthenticated = useRecoilValue(isAuthenticatedSelector);
  const role = useRecoilValue(userRoleSelector);
  const setNotification = useSetRecoilState(notificationAtom);

  // Login
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setAuth((prev: AuthState) => ({ ...prev, isLoading: true }));
      try {
        const response = await authService.login(credentials);
        
        // Store tokens - handle different response formats
        if ('tokens' in response && response.tokens) {
          setStorageItem(STORAGE_KEYS.AUTH_TOKEN, response.tokens.accessToken);
          if (response.tokens.refreshToken) {
            setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, response.tokens.refreshToken);
          }
        }
        setStorageItem(STORAGE_KEYS.USER, response.user);

        // Map response user to our User type
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          phone: response.user.phone,
          role: response.user.role as User['role'],
        };

        setAuth({
          user,
          featureConfig: null,
          isAuthenticated: true,
          isLoading: false,
        });

        setNotification({
          id: `auth-${Date.now()}`,
          message: `Welcome back, ${user.firstName || user.email}!`,
          type: 'success',
        });
      } catch (error: unknown) {
        setAuth((prev: AuthState) => ({ ...prev, isLoading: false }));
        const errorMessage = error instanceof Error ? error.message : 'Login failed';
        setNotification({
          id: `auth-error-${Date.now()}`,
          message: errorMessage,
          type: 'error',
        });
        throw error;
      }
    },
    [setAuth, setNotification]
  );

  // Register
  const register = useCallback(
    async (data: RegisterData) => {
      setAuth((prev: AuthState) => ({ ...prev, isLoading: true }));
      try {
        const response = await authService.register(data);
        
        // Store tokens - handle different response formats
        if ('tokens' in response && response.tokens) {
          setStorageItem(STORAGE_KEYS.AUTH_TOKEN, response.tokens.accessToken);
          if (response.tokens.refreshToken) {
            setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, response.tokens.refreshToken);
          }
        }
        setStorageItem(STORAGE_KEYS.USER, response.user);

        // Map response user to our User type
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          phone: response.user.phone,
          role: response.user.role as User['role'],
        };

        setAuth({
          user,
          featureConfig: null,
          isAuthenticated: true,
          isLoading: false,
        });

        setNotification({
          id: `auth-${Date.now()}`,
          message: 'Account created successfully!',
          type: 'success',
        });
      } catch (error: unknown) {
        setAuth((prev: AuthState) => ({ ...prev, isLoading: false }));
        const errorMessage = error instanceof Error ? error.message : 'Registration failed';
        setNotification({
          id: `auth-error-${Date.now()}`,
          message: errorMessage,
          type: 'error',
        });
        throw error;
      }
    },
    [setAuth, setNotification]
  );

  // Logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API errors
    } finally {
      // Clear storage
      removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
      removeStorageItem(STORAGE_KEYS.USER);

      setAuth({
        user: null,
        featureConfig: null,
        isAuthenticated: false,
        isLoading: false,
      });

      setNotification({
        id: `auth-${Date.now()}`,
        message: 'You have been logged out',
        type: 'info',
      });
    }
  }, [setAuth, setNotification]);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (!auth.isAuthenticated) return;
    
    try {
      const user = await authService.getProfile();
      setStorageItem(STORAGE_KEYS.USER, user);
      setAuth((prev: AuthState) => ({ ...prev, user }));
    } catch (error) {
      // If profile fetch fails, might mean token is invalid
      console.error('Failed to refresh profile:', error);
    }
  }, [auth.isAuthenticated, setAuth]);

  // Check role
  const hasRole = useCallback(
    (targetRole: string | string[]): boolean => {
      if (!role) return false;
      const roles = Array.isArray(targetRole) ? targetRole : [targetRole];
      return roles.includes(role);
    },
    [role]
  );

  // Check permission (simplified - User doesn't have permissions in our type)
  const hasPermission = useCallback(
    (_permission: string): boolean => {
      // Role-based permission check
      if (!auth.user) return false;
      // Admin has all permissions
      if (auth.user.role === 'ADMIN') return true;
      // For now, return true for managers
      if (auth.user.role === 'MANAGER') return true;
      return false;
    },
    [auth.user]
  );

  return {
    user: auth.user,
    isAuthenticated,
    role,
    isLoading: auth.isLoading,
    login,
    register,
    logout,
    refreshProfile,
    hasRole,
    hasPermission,
  };
}

export default useAuth;
