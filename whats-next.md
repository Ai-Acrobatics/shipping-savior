# What's Next — Shipping Savior

> **Last updated**: 2026-03-26
> **Accounts**: cli-session
> **Status**: 🟡 M1 Foundation code complete — needs DB setup + deploy
> **Priority**: P1

## Original Task

Build M1 Foundation milestone for the Shipping Savior logistics platform: turn the existing static proposal/demo site into a real platform with authentication, multi-tenant database, calculator persistence, and audit logging.

## Work Completed

### Milestone Setup
- Created REQUIREMENTS.md with 6 requirements (R1-R6), 30+ acceptance criteria
- Created ROADMAP.md with 5 phases, dependency graph, full requirement traceability
- Created MILESTONES.md tracking Phase 1 (proposal) and Phase 2 (planning) as complete

### Phase 1: Database Schema & Drizzle Setup
- Installed drizzle-orm, @neondatabase/serverless, drizzle-kit, dotenv
- Created `drizzle.config.ts` pointing to `src/lib/db/schema.ts`
- Created `src/lib/db/index.ts` — Neon HTTP client + drizzle instance
- Created `src/lib/db/schema.ts` — 5 tables + 2 enums:
  - `organizations` (uuid PK, name, slug unique)
  - `users` (uuid PK, email unique, password_hash, name)
  - `org_members` (uuid PK, org_id FK, user_id FK, role enum, unique composite)
  - `calculations` (uuid PK, org_id FK, user_id FK, calculatorType enum, name, inputs/outputs jsonb)
  - `audit_logs` (uuid PK, org_id FK nullable, user_id FK nullable, eventType, metadata jsonb, ip_address)
- Added npm scripts: `db:push`, `db:studio`, `db:generate`, `db:migrate`
- Created `.env.example` with DATABASE_URL placeholder

### Phase 2: Authentication (NextAuth v5)
- Installed next-auth@beta, bcryptjs, @types/bcryptjs
- Created `src/lib/auth/config.ts` — Credentials provider, JWT strategy, 30-day maxAge
- Created `src/lib/auth/index.ts` — exports auth, signIn, signOut, handlers
- Created `src/lib/auth/audit.ts` — fire-and-forget audit log writer
- Created `src/app/api/auth/[...nextauth]/route.ts` — NextAuth route handler
- Created `src/app/api/auth/register/route.ts` — registration with atomic org+user+org_member creation
- Created `src/middleware.ts` — protects /platform/*, redirects auth pages for logged-in users
- Created `src/app/(auth)/login/page.tsx` and `register/page.tsx`
- Created `src/components/providers/SessionProvider.tsx`
- Created `src/types/next-auth.d.ts` — TypeScript augmentations for userId, orgId, role

### Phase 3: Organization Model & Invites
- Created `src/lib/auth/permissions.ts` — role hierarchy (owner=40 > admin=30 > member=20 > viewer=10), 9 permission types
- Created `src/lib/db/queries/scoped.ts` — withOrgScope/scopedWhere for tenant isolation
- Created `src/lib/db/queries/org.ts` — getOrgById, getOrgMembers, getPendingInvites, getInviteByToken
- Created invite API at `src/app/api/orgs/invite/route.ts` — privilege escalation prevention
- Created accept invite flow: `src/app/(auth)/invite/[token]/page.tsx` + `AcceptInviteClient.tsx`
- Created accept invite API at `src/app/api/orgs/invite/[token]/accept/route.ts`
- Modified register/login pages to preserve invite tokens through auth flow

### Phase 4: Platform Shell & Navigation
- Created `src/components/platform/Sidebar.tsx` — dark collapsible sidebar (240px/68px)
- Created `src/components/platform/UserMenu.tsx` — avatar + dropdown
- Created `src/components/platform/MobileNav.tsx` — overlay slide-in for mobile
- Created `src/app/(platform)/layout.tsx` — server layout with auth redirect
- Created `src/app/(platform)/PlatformShell.tsx` — client shell managing sidebar state
- Created 4 pages: dashboard, calculators hub (6 cards), history, settings
- Added slide-in-left animation to tailwind.config.ts

### Phase 5: Calculator Persistence
- Created `src/lib/types/calculations.ts` — type definitions for all 6 calculator I/O shapes
- Created `src/lib/hooks/useLoadCalculation.ts` — shared hook for ?loadId= URL param
- Created API routes: `src/app/api/calculations/route.ts` (GET/POST), `[id]/route.ts` (GET/PUT/DELETE)
- Created `src/components/platform/SaveCalculationButton.tsx` — reusable save with name modal
- Created `src/components/platform/CalculationHistory.tsx` — table with inline rename, load, delete
- Created platform calculator sub-pages under `src/app/(platform)/platform/calculators/`
- Wired save button + load capability into all 6 calculators via `showSaveButton` prop
- Updated history page with real filtering and CRUD

## Work Remaining

### Immediate (before deploy)
- **Create Neon project** and set `DATABASE_URL` in `.env.local` — trivial
- **Set auth env vars**: `AUTH_SECRET` (run `openssl rand -base64 32`), `AUTH_URL` — trivial
- **Run `npm run db:push`** to create all tables — trivial
- **Clean up `src/app/api-old/`** directory (leftover from Phase 2 agent file permission issue) — trivial
- **Fix 2 pre-existing TS errors** in `src/app/api/hts/search/route.ts` and `src/app/api/routes/compare/route.ts` (Set iteration needs `--downlevelIteration` or `Array.from()`) — trivial
- **Merge branch to main** — 13 unpushed commits on `ai-5472-outline-technical-specifications` — trivial
- **Deploy to Vercel** — `npx vercel build --prod && npx vercel deploy --prebuilt --prod` — trivial

### Cleanup
- **Remove duplicate repos**: `shipping-savior-bench/` and `shipping-savior-sprint1/` in workspace root — trivial
- **Test full auth flow** end-to-end: register → login → save calculation → view history → invite user — moderate

### M2 (Next milestone per PRODUCT-ROADMAP.md)
- Full HTS Schedule Integration (100K codes from USITC) — significant
- Country-specific duty rate lookup — moderate
- HTS lookup history per user — moderate
- Monthly automated HTS data refresh cron — moderate

## Attempted Approaches

- **Sprint1 repo**: A separate `shipping-savior-sprint1/` clone was created earlier with a single foundation commit. Abandoned in favor of working directly in the main repo with GSD framework.
- **Parallel agent execution**: All 5 phase plans were generated simultaneously by 5 background agents. Then phases were executed respecting the dependency graph (1 → 2+4 parallel → 3+5 parallel). Some agents had file permission conflicts when writing to the same schema.ts — resolved by atomic staging.

## Critical Context

- **Branch**: `ai-5472-outline-technical-specifications` — 13 commits ahead of origin/main, not yet pushed
- **Stack**: Next.js 14 (App Router), Tailwind CSS, Drizzle ORM, Neon PostgreSQL, NextAuth v5, bcryptjs
- **No real DB yet**: All code is written but DATABASE_URL is a placeholder. Nothing has been tested against a real database.
- **Existing proposal site untouched**: All platform code lives under `src/app/(platform)/` route group. The public proposal/demo at `/` is unchanged.
- **Calculator state shapes**: Each calculator uses different input/output types defined in `src/lib/types/calculations.ts`. The `SaveCalculationButton` uses `getInputs()`/`getOutputs()` callbacks to stay agnostic.
- **Invite flow**: Invites are 7-day expiry, 64-char hex tokens, email-matched. Registration with invite token skips org creation.
- **PRODUCT-ROADMAP.md**: Full 18-month roadmap exists at `.planning/PRODUCT-ROADMAP.md` with M1-M18 defined

## Current State

- **All 5 M1 phases**: Code complete, TypeScript passes (except 2 pre-existing errors)
- **Git**: 13 unpushed commits on feature branch, not merged to main
- **DB**: Schema defined in code, no real database created
- **Deploy**: Not yet deployed — existing live site at shipping-savior.vercel.app is the Phase 1 proposal
- **Duplicate repos**: `shipping-savior-bench/` and `shipping-savior-sprint1/` still exist in workspace

## Related Projects

- None directly — standalone client project
