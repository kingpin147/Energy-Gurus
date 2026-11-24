import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Disable prepared statements for Supabase transaction pooler compatibility
const client = postgres(process.env.DATABASE_URL, { 
  prepare: false,
  ssl: 'require',
  max: 5,
  idle_timeout: 10
});

export const db = drizzle(client, { 
  schema,
  logger: process.env.NODE_ENV !== 'production'
});
