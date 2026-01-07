import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),

  // Database configuration
  DB_TYPE: z.enum(['postgresql', 'mssql']).default('postgresql'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).optional(),
  DB_NAME: z.string().default('snautoparts'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default(''),

  // Auth
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),

  // Stripe
  STRIPE_PUBLIC_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Resend
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),

  // Feature Config
  FEATURE_CONFIG_CACHE_TTL: z.string().transform(Number).default('300'),

  // Supplier Integrations - A-Premium
  APREMIUM_API_URL: z.string().url().optional(),
  APREMIUM_API_KEY: z.string().optional(),
  APREMIUM_TIMEOUT_MS: z.string().transform(Number).default('8000'),

  // Supplier Integrations - BuyAutoParts
  BUYAUTOPARTS_API_URL: z.string().url().optional(),
  BUYAUTOPARTS_API_KEY: z.string().optional(),
  BUYAUTOPARTS_TIMEOUT_MS: z.string().transform(Number).default('8000'),

  // Supplier Integrations - TRQ
  TRQ_API_URL: z.string().url().optional(),
  TRQ_API_KEY: z.string().optional(),
  TRQ_TIMEOUT_MS: z.string().transform(Number).default('8000'),

  // Other
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  JOB_QUEUE_REDIS_URL: z.string().url().optional(),
  WEBHOOK_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.format());
  // Don't exit in development - use defaults
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const env = parsed.success ? parsed.data : {
  NODE_ENV: 'development' as const,
  PORT: 3000,
  DB_TYPE: 'postgresql' as const,
  DB_HOST: 'localhost',
  DB_NAME: 'snautoparts',
  DB_USER: 'postgres',
  DB_PASSWORD: '',
  FEATURE_CONFIG_CACHE_TTL: 300,
  LOG_LEVEL: 'info' as const,
  APREMIUM_TIMEOUT_MS: 8000,
  BUYAUTOPARTS_TIMEOUT_MS: 8000,
  TRQ_TIMEOUT_MS: 8000,
};

/**
 * Check if host is a cloud database that requires SSL
 * Common cloud PostgreSQL providers that require SSL connections
 */
function isCloudDatabase(host: string): boolean {
  const cloudPatterns = [
    'neon.tech',
    'supabase.co', 
    'aws.com',
    'azure.com',
    'cloud.google.com',
    'elephantsql.com',
    'render.com',
    'railway.app',
    'planetscale.com',
    'cockroachlabs.cloud',
    'digitalocean.com',
    'heroku.com',
  ];
  return cloudPatterns.some(pattern => host.includes(pattern));
}

/**
 * Construct DATABASE_URL from individual fields
 */
function buildDatabaseUrl(host: string, port: number, name: string, user: string, password: string, ssl: boolean): string {
  const sslParam = ssl ? '?sslmode=require' : '';
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${name}${sslParam}`;
}

// Determine SSL requirement based on host
const dbHost = env.DB_HOST;
const dbPort = env.DB_PORT ?? (env.DB_TYPE === 'postgresql' ? 5432 : 1433);
const requiresSsl = isCloudDatabase(dbHost);

// Construct the database URL from individual fields
const databaseUrl = buildDatabaseUrl(
  dbHost,
  dbPort,
  env.DB_NAME,
  env.DB_USER,
  env.DB_PASSWORD,
  requiresSsl
);

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',

  // Database configuration from individual fields
  db: {
    url: databaseUrl,
    type: env.DB_TYPE,
    host: dbHost,
    port: dbPort,
    name: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    ssl: requiresSsl,
  },

  // Auth
  auth: {
    secret: env.BETTER_AUTH_SECRET ?? 'development-secret-key-min-32-chars!!',
    url: env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  },

  // Stripe
  stripe: {
    publicKey: env.STRIPE_PUBLIC_KEY ?? '',
    secretKey: env.STRIPE_SECRET_KEY ?? '',
    webhookSecret: env.STRIPE_WEBHOOK_SECRET ?? '',
  },

  // Email
  email: {
    apiKey: env.RESEND_API_KEY ?? '',
    fromEmail: env.RESEND_FROM_EMAIL ?? 'noreply@snautoparts.com',
  },

  // Feature Config
  featureConfigCacheTtl: env.FEATURE_CONFIG_CACHE_TTL,

  // Supplier Integrations
  suppliers: {
    apremium: {
      apiUrl: env.APREMIUM_API_URL ?? '',
      apiKey: env.APREMIUM_API_KEY ?? '',
      timeoutMs: env.APREMIUM_TIMEOUT_MS,
    },
    buyautoparts: {
      apiUrl: env.BUYAUTOPARTS_API_URL ?? '',
      apiKey: env.BUYAUTOPARTS_API_KEY ?? '',
      timeoutMs: env.BUYAUTOPARTS_TIMEOUT_MS,
    },
    trq: {
      apiUrl: env.TRQ_API_URL ?? '',
      apiKey: env.TRQ_API_KEY ?? '',
      timeoutMs: env.TRQ_TIMEOUT_MS,
    },
  },

  // Job Queue
  jobQueue: {
    redisUrl: env.JOB_QUEUE_REDIS_URL ?? '',
  },

  // Webhooks
  webhookSecret: env.WEBHOOK_SECRET ?? '',

  // CORS
  corsOrigin: env.NODE_ENV === 'production'
    ? ['https://snautoparts.com']
    : ['http://localhost:4200', 'http://localhost:3000'],

  // Cookies
  cookieSecret: env.BETTER_AUTH_SECRET ?? 'development-cookie-secret-32chars!',

  // Logging
  logLevel: env.LOG_LEVEL,
} as const;

export type Config = typeof config;

