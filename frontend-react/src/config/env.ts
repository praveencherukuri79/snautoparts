/**
 * Environment Configuration
 * 
 * Centralized environment variables and feature toggles
 */

interface EnvironmentConfig {
  apiUrl: string;
  production: boolean;
  enableMockData: boolean;
  stripePublicKey: string | null;
  featureConfigRefreshInterval: number;
}

export const env: EnvironmentConfig = {
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  production: import.meta.env.VITE_PRODUCTION === 'true' || import.meta.env.PROD || false,
  enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true' || false,
  stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || null,
  featureConfigRefreshInterval: Number(import.meta.env.VITE_FEATURE_CONFIG_REFRESH_INTERVAL) || 300000, // 5 minutes
};

export default env;

