import { atom } from 'recoil';
import type { User, FeatureConfig } from '@/types';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  featureConfig: FeatureConfig | null;
}

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
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
