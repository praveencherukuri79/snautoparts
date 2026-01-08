import { selector } from 'recoil';
import { authAtom } from '../atoms/authAtom';

/**
 * Is Authenticated Selector
 */
export const isAuthenticatedSelector = selector<boolean>({
  key: 'isAuthenticatedSelector',
  get: ({ get }) => {
    const auth = get(authAtom);
    return auth.isAuthenticated;
  },
});

/**
 * Current User Selector
 */
export const currentUserSelector = selector({
  key: 'currentUserSelector',
  get: ({ get }) => {
    const auth = get(authAtom);
    return auth.user;
  },
});

/**
 * User Role Selector
 */
export const userRoleSelector = selector<string | null>({
  key: 'userRoleSelector',
  get: ({ get }) => {
    const auth = get(authAtom);
    return auth.user?.role ?? null;
  },
});

/**
 * Feature Config Selector
 */
export const featureConfigSelector = selector({
  key: 'featureConfigSelector',
  get: ({ get }) => {
    const auth = get(authAtom);
    return auth.featureConfig;
  },
});

/**
 * Has Feature Selector Factory
 * Creates a selector to check if a specific feature is enabled
 */
export const createHasFeatureSelector = (category: string, feature: string) => 
  selector<boolean>({
    key: `hasFeature_${category}_${feature}`,
    get: ({ get }) => {
      const featureConfig = get(featureConfigSelector);
      if (!featureConfig?.features) return false;
      
      const categoryFeatures = featureConfig.features[category as keyof typeof featureConfig.features];
      if (!categoryFeatures) return false;
      
      return categoryFeatures[feature as keyof typeof categoryFeatures] ?? false;
    },
  });
