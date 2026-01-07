import { z } from 'zod';

/**
 * Environment variable validation schema
 */
const envSchema = z.object({
  // Node
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),

  // Database (MikroORM)
  DB_TYPE: z.enum(['postgresql', 'mssql']).default('postgresql'),
  DB_HOST: z.string().min(1),
  DB_PORT: z.string().transform(Number).optional(),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASS: z.string().min(1),

  // Auth
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLIC_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Resend
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),

  // Feature Config
  FEATURE_CONFIG_CACHE_TTL: z.string().transform(Number).default('300'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Frontend
  FRONTEND_URL: z.string().url().optional(),

  // Supplier Integrations
  APREMIUM_API_URL: z.string().url().optional(),
  APREMIUM_API_KEY: z.string().optional(),
  APREMIUM_TIMEOUT_MS: z.string().transform(Number).default('8000'),

  BUYAUTOPARTS_API_URL: z.string().url().optional(),
  BUYAUTOPARTS_API_KEY: z.string().optional(),
  BUYAUTOPARTS_TIMEOUT_MS: z.string().transform(Number).default('8000'),

  TRQ_API_URL: z.string().url().optional(),
  TRQ_API_KEY: z.string().optional(),
  TRQ_TIMEOUT_MS: z.string().transform(Number).default('8000'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 */
export function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
}

/**
 * Validated environment variables (call parseEnv() at startup)
 */
let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    _env = parseEnv();
  }
  return _env;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development';
}

/**
 * Get default DB port based on DB type
 */
export function getDbPort(): number {
  const env = getEnv();
  if (env.DB_PORT) {
    return env.DB_PORT;
  }
  return env.DB_TYPE === 'postgresql' ? 5432 : 1433;
}

