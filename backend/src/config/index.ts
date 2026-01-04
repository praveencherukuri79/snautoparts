// Note: dotenv is loaded in src/index.ts at the very top

// Get DATABASE_URL directly or build from DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const name = process.env.DB_NAME;

  if (host && user && password && name) {
    return `postgresql://${user}:${password}@${host}/${name}?sslmode=require&channel_binding=require`;
  }

  return '';
}

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  logLevel: process.env.LOG_LEVEL || 'info',

  // Auth
  authSecret: process.env.AUTH_SECRET || 'super-secret-key-change-me',

  // Database (from DATABASE_URL or built from DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
  databaseUrl: getDatabaseUrl(),

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',

  // Email
  resendApiKey: process.env.RESEND_API_KEY || '',
  emailFrom: process.env.EMAIL_FROM || 'noreply@snautoparts.com',

  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
} as const;

