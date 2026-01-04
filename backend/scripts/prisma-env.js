#!/usr/bin/env node
// Helper script to set DATABASE_URL from individual DB_* variables for Prisma CLI
import 'dotenv/config';
import { spawn } from 'child_process';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.error('Missing required DB environment variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
  process.exit(1);
}

// Construct DATABASE_URL (matching Neon format)
const DATABASE_URL = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?sslmode=require&channel_binding=require`;

// Get the Prisma command from arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/prisma-env.js <prisma-command>');
  console.error('Example: node scripts/prisma-env.js db push');
  process.exit(1);
}

// Run Prisma with DATABASE_URL set
const child = spawn('npx', ['prisma', ...args], {
  env: { ...process.env, DATABASE_URL },
  stdio: 'inherit',
  shell: true,
});

child.on('close', (code) => {
  process.exit(code);
});

