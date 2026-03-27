# Phase 1: Database Schema & Drizzle Setup

## Objective
Stand up Neon PostgreSQL with Drizzle ORM and all M1 tables for the Shipping Savior platform.

## Deliverables

### 1. Dependencies
- `drizzle-orm` + `@neondatabase/serverless` (runtime)
- `drizzle-kit` (dev tooling)

### 2. Configuration
- `drizzle.config.ts` — Drizzle Kit config pointing to schema file, using `@neondatabase/serverless` driver
- `.env.example` — DATABASE_URL placeholder for Neon connection string

### 3. Database Connection
- `src/lib/db/index.ts` — Singleton drizzle instance using neon() HTTP driver

### 4. Schema (src/lib/db/schema.ts)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| organizations | Multi-tenant orgs | id, name, slug, plan |
| users | Auth users | id, email, password_hash, name |
| org_members | Org membership (join) | org_id, user_id, role, unique(org_id, user_id) |
| calculations | Saved calculator results | org_id, user_id, type, inputs (jsonb), outputs (jsonb) |
| audit_logs | Security/compliance trail | org_id, user_id, action, metadata (jsonb), ip_address |
| invites | Org invite tokens | org_id, email, role, token, expires_at |

All tables use:
- UUID primary keys with `gen_random_uuid()` default
- `created_at` / `updated_at` timestamps with timezone
- Foreign key references with appropriate cascade rules

### 5. Relations
Full Drizzle ORM relation definitions for type-safe queries with `with` clause.

### 6. Query Helpers (src/lib/db/queries.ts)
- CRUD for organizations, users, org_members
- saveCalculation / getCalculationsByOrg / deleteCalculation
- writeAuditLog / getAuditLogs
- All functions are type-safe using schema infer types

### 7. Type Exports
- Inferred select/insert types for all tables
- Union types for Plan, OrgRole, CalculationType, AuditAction

## Success Criteria
- [ ] TypeScript compiles with no errors
- [ ] All 6 tables defined with correct column types
- [ ] Relations correctly map foreign keys
- [ ] Query helpers cover all basic CRUD operations
- [ ] Type exports available for downstream consumers
- [ ] `drizzle-kit generate` would produce valid SQL (validated by TS compilation)
