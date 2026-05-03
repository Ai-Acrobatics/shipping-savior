-- AI-9205: Add organizations.is_demo column to production Supabase.
--
-- Background: `is_demo boolean NOT NULL DEFAULT false` was declared in
-- src/lib/db/schema.ts and baked into drizzle/0000_milky_hellcat.sql, but the
-- production Supabase `organizations` table predates that initial migration
-- and was bootstrapped by inserting the 0000 hash row directly into
-- public.__drizzle_migrations without executing the CREATE TABLE statement.
-- That left `is_demo` declared in the snapshot and TypeScript schema, but
-- absent from the live table -- drizzle-kit `generate` therefore produced no
-- diff (snapshot already contained the column).
--
-- This custom migration repairs the drift. ALTER ... ADD COLUMN IF NOT EXISTS
-- keeps it idempotent across any other environment that already has the column.
ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "is_demo" boolean DEFAULT false NOT NULL;
