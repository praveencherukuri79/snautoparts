import { atom } from 'recoil';
import type { AuthUser } from '@/models';
import type { FeatureConfig } from '@/types';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  featureConfig: FeatureConfig | null;
}

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: false, // Start as false - don't block UI before checking session
  user: null,
  featureConfig: null,
};

/**
 * Auth Atom
 * Manages authentication state including user info and feature config
 */
export const authAtom = atom<AuthState>({
  key: 'authAtom',
  default: defaultAuthState,
});
