import 'dotenv/config'; // Load .env before reading environment variables

import { Options } from '@mikro-orm/core';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { MsSqlDriver } from '@mikro-orm/mssql';

// Runtime database switching - change DB_TYPE env var to switch databases
const DB_TYPE = (process.env.DB_TYPE ?? 'postgresql') as 'postgresql' | 'mssql';

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
 * Get the default port based on database type
 */
function getDefaultPort(): number {
  return DB_TYPE === 'postgresql' ? 5432 : 1433;
}

// Read database config from environment
const dbHost = process.env.DB_HOST ?? 'localhost';
const dbPort = Number(process.env.DB_PORT ?? getDefaultPort());
const dbName = process.env.DB_NAME ?? 'snautoparts';
const dbUser = process.env.DB_USER ?? (DB_TYPE === 'postgresql' ? 'postgres' : 'sa');
const dbPassword = process.env.DB_PASSWORD ?? '';

// Determine if SSL is required (cloud databases need SSL)
const requiresSsl = isCloudDatabase(dbHost);

/**
 * MikroORM Configuration
 * 
 * Supports:
 * - Individual DB_* environment variables (DB_HOST, DB_USER, DB_PASSWORD, etc.)
 * - Runtime switching between PostgreSQL and SQL Server via DB_TYPE
 * - Automatic SSL for cloud databases (Neon, Supabase, etc.)
 */
const config: Options = {
  // Runtime database switching - using Options type for generic driver support
  driver: DB_TYPE === 'mssql' ? MsSqlDriver : PostgreSqlDriver,

  // Use TsMorphMetadataProvider to read types from source files
  // This works with tsx and ts-node without emitDecoratorMetadata
  metadataProvider: TsMorphMetadataProvider,

  entities: ['./dist/src/entities/**/*.js'],
  entitiesTs: ['./src/entities/**/*.ts'],

  // Database connection from individual fields
  dbName,
  user: dbUser,
  password: dbPassword,
  host: dbHost,
  port: dbPort,

  // SSL configuration for cloud databases (Neon, Supabase, etc.)
  // PostgreSQL and SQL Server have different SSL option formats
  driverOptions: requiresSsl
    ? DB_TYPE === 'mssql'
      ? { options: { encrypt: true, trustServerCertificate: true } } // SQL Server format
      : { connection: { ssl: { rejectUnauthorized: false } } } // PostgreSQL format
    : undefined,

  // Recommended settings
  debug: process.env.NODE_ENV === 'development',
  allowGlobalContext: true,

  // Schema generation - disable FK handling for cloud databases (Neon, Supabase, etc.)
  schemaGenerator: {
    disableForeignKeys: false, // Cloud DBs don't allow session_replication_role
    createForeignKeyConstraints: true,
  },

  // Migrations
  migrations: {
    path: './dist/src/migrations',
    pathTs: './src/migrations',
    glob: '!(*.d).{js,ts}',
    transactional: true,
    disableForeignKeys: true,
    allOrNothing: true,
    snapshot: true,
  },

  // Seeders
  seeder: {
    path: './dist/src/seeders',
    pathTs: './src/seeders',
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{js,ts}',
  },
};

export default config;

// Export DB_TYPE for other modules that need it
export { DB_TYPE };

