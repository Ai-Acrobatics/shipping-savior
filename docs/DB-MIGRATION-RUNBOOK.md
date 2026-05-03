# DB Migration Runbook (AI-9199)

## Stack

- **DB:** Supabase Postgres (`postgres` database, `shipping_app` role)
- **ORM:** Drizzle ORM with `drizzle-kit` migrator
- **Connection envs in `.env.local`:**
  - `DATABASE_URL` — pooled (Supabase pgbouncer, port 6543), used by app runtime
  - `DIRECT_DATABASE_URL` — direct (port 5432), used by `drizzle-kit` migrator

## Migration Tracking Table

The `shipping_app` Postgres role does **not** have permission to `CREATE SCHEMA` on the
`postgres` database, so Drizzle's default `drizzle.__drizzle_migrations` table cannot be
created. We use `public.__drizzle_migrations` instead — configured in `drizzle.config.ts`
via `migrationsSchema: 'public'`.

Schema:

```
public.__drizzle_migrations
  id          serial PRIMARY KEY
  hash        text   NOT NULL   -- sha256(migration_file_content)
  created_at  bigint            -- matches `_journal.json` `when` field
```

The migrator looks at the most recent `created_at`, then applies any migration whose
`folderMillis` (from `drizzle/meta/_journal.json` `when`) is greater. So you must
INSERT a row before ever running `db:migrate` against a schema that was originally
populated via `db:push`.

## How AI-9199 Bootstrapped

When this runbook was created (May 2026), migrations 0001 + 0002 had not been applied
to production. The 0000 schema was applied months earlier via `db:push`, which does
not touch the migration tracking table. So three things were done in one `psql`
transaction against `DIRECT_DATABASE_URL`:

1. Applied `drizzle/0001_tranquil_synch.sql` (Stripe billing columns + 2 enums on `organizations`)
2. Applied `drizzle/0002_acoustic_spirit.sql` (`email_verified_at` on `users`, plus `email_verifications` and `password_reset_tokens` tables)
3. Created `public.__drizzle_migrations` and inserted rows for `0000`, `0001`, `0002`
   using each file's sha256 hash and the `when` value from `_journal.json`

After the transaction committed, `npm run db:migrate` was idempotent (same row count,
no errors).

## Future Migrations — Standard Workflow

```bash
# 1. Edit src/lib/db/schema.ts
# 2. Generate the migration SQL
npx drizzle-kit generate
# 3. Inspect the generated drizzle/000N_*.sql file before applying
# 4. Apply it
npm run db:migrate
# 5. Verify
psql "$DIRECT_DATABASE_URL" -c "SELECT id, substring(hash for 16) AS hash, created_at FROM public.__drizzle_migrations ORDER BY id;"
```

`db:migrate` will:
- Skip migrations whose `folderMillis` <= the most recent `created_at` in the tracking table
- Apply any newer migration in a single transaction
- Insert a tracking row with the file's sha256 hash + folderMillis on success

## Recovery — If db:migrate Fails Mid-Migration

Drizzle's PG migrator wraps each call to `migrate(...)` in a single transaction, so a
failed migration rolls back cleanly. After a failure:

1. Read the error in the spinner output
2. Inspect the offending migration SQL in `drizzle/000N_*.sql`
3. Check what's already in the DB: `psql "$DIRECT_DATABASE_URL" -c "\dt" \\d <table>"`
4. If the migration partially conflicts with existing schema (e.g., column already exists
   from a prior `db:push`), you have two options:
   - **Option A:** Edit the migration SQL to be idempotent (`CREATE TABLE IF NOT EXISTS`,
     `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`) — but this changes the file hash, so
     also update the tracking row
   - **Option B:** Apply the missing pieces by hand in a `psql` transaction, then
     INSERT a tracking row with the file's sha256 hash to mark it applied

**Never** run `npm run db:push` or `drizzle-kit push --force` against production. That
bypasses the migration history and creates drift.

## Backups Before Schema Changes

Take a schema-only dump before any DDL:

```bash
set -a; source .env.local; set +a
pg_dump --schema-only --no-owner --no-acl --schema=public "$DIRECT_DATABASE_URL" \
  > .planning/db-backup-$(date +%Y%m%d-%H%M%S)-schema.sql
```

`.planning/db-backup-*.sql` is gitignored.

## Connection Quirks

- **pgbouncer pooler** (`DATABASE_URL`, port 6543) does NOT support transactions across
  multiple statements with prepared statement reuse. The app's `postgres` client is
  configured with `prepare: false` to avoid the related cache bug. Use the direct
  connection (`DIRECT_DATABASE_URL`) for migrations and pg_dump.
- The Supabase admin schemas (`auth`, `extensions`, `graphql`, `realtime`, `storage`,
  `vault`) are owned by `supabase_admin` and are not touched by Drizzle migrations.

## References

- Drizzle config: `drizzle.config.ts`
- Migration files: `drizzle/000N_*.sql` + `drizzle/meta/_journal.json`
- Schema definition: `src/lib/db/schema.ts`
- DB client: `src/lib/db/index.ts`
- Linear: AI-9199 (this runbook), AI-8776 (auth columns), AI-8777 (Stripe columns)
