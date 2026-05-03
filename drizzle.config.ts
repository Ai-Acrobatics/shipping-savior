import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// AI-9199: Production Postgres role (`shipping_app`) cannot CREATE SCHEMA on
// the Supabase `postgres` database, so the migrator's tracking table lives in
// `public.__drizzle_migrations` instead of the default `drizzle.__drizzle_migrations`.
// Bootstrap rows for 0000/0001/0002 were inserted manually after the SQL was
// applied directly via psql in a single transaction (see PR description / docs/DB-MIGRATION-RUNBOOK.md).
//
// `migrationsSchema` and `migrationsTable` are runtime-supported by drizzle-kit's
// migrator but missing from `defineConfig`'s public types in this drizzle-kit version,
// so the config is built as a plain object and cast — the runtime reads the fields
// just fine (verified by `npm run db:migrate` running idempotently against production).
const config = {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql' as const,
  dbCredentials: {
    url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL!,
  },
  migrationsSchema: 'public',
  migrationsTable: '__drizzle_migrations',
};

export default defineConfig(config as Parameters<typeof defineConfig>[0]);
