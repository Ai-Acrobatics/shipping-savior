# Shipping Savior — Phase 2 Sprint Execution Plan

**Linear:** AI-5431
**Companion Document To:** `docs/PHASE2-MASTER-PLAN.md` (AI-5455)
**Phase:** 2 — Planning → 3 Execution Handoff
**Created:** 2026-03-27
**Status:** Ready for Gate Review

> This document provides the detailed sprint execution plan for Phase 3 of Shipping Savior. PHASE2-MASTER-PLAN.md defines the *what*. This document defines the *how* — sprint task breakdown, acceptance criteria, capacity planning, velocity assumptions, and retrospective process. Phase 3 MUST NOT begin until Decisions 1 and 6 from PHASE2-MASTER-PLAN.md Section 12 are resolved.

---

## Table of Contents

1. [Sprint Overview & Calendar](#1-sprint-overview--calendar)
2. [Velocity Assumptions](#2-velocity-assumptions)
3. [Team Capacity Planning](#3-team-capacity-planning)
4. [Definition of Done (Global)](#4-definition-of-done-global)
5. [Sprint 1 — Foundation (Weeks 9–10)](#5-sprint-1--foundation-weeks-910)
6. [Sprint 2 — Data Pipeline (Weeks 11–12)](#6-sprint-2--data-pipeline-weeks-1112)
7. [Sprint 3 — Core Calculators (Weeks 13–14)](#7-sprint-3--core-calculators-weeks-1314)
8. [Sprint 4 — Operations (Weeks 15–16)](#8-sprint-4--operations-weeks-1516)
9. [Sprint 5 — AI Agents (Weeks 17–18)](#9-sprint-5--ai-agents-weeks-1718)
10. [Sprint 6 — Polish & Launch (Weeks 19–20)](#10-sprint-6--polish--launch-weeks-1920)
11. [Cross-Sprint Dependency Map](#11-cross-sprint-dependency-map)
12. [Tech Debt & Buffer Budget](#12-tech-debt--buffer-budget)
13. [Sprint Retrospective Template](#13-sprint-retrospective-template)
14. [Pre-Phase 3 Checklist](#14-pre-phase-3-checklist)

---

## 1. Sprint Overview & Calendar

```
GATE: Decision 1 (auth) + Decision 6 (multi-tenant) → before Sprint 1
GATE: Decision 2 (HTS sync) + Decision 3 (vessel data) → before Sprint 2

Week  9–10: Sprint 1 — Foundation
Week 11–12: Sprint 2 — Data Pipeline
Week 13–14: Sprint 3 — Core Calculators
Week 15–16: Sprint 4 — Operations
Week 17–18: Sprint 5 — AI Agents
Week 19–20: Sprint 6 — Polish & Launch
```

| Sprint | Name | Weeks | PRDs Shipped | Risk Level |
|--------|------|-------|-------------|------------|
| 1 | Foundation | 9–10 | APP-01 (auth), APP-02 (onboarding) | High — all other sprints depend on this |
| 2 | Data Pipeline | 11–12 | None (infra) | High — data quality determines calculator accuracy |
| 3 | Core Calculators | 13–14 | APP-03, APP-04, APP-05, APP-07 | Medium |
| 4 | Operations | 15–16 | APP-06, APP-08, APP-09 | Medium |
| 5 | AI Agents | 17–18 | 3 of 7 agents (MVP subset) | High — LLM unpredictability |
| 6 | Polish & Launch | 19–20 | All remaining agents, E2E, infra | Medium |

**Total wall-clock time:** 12 weeks (3 months from gate approval to launch-ready)

---

## 2. Velocity Assumptions

### Story Point Baseline

All estimates use **T-shirt sizing mapped to story points**:

| Size | Points | Effort Equivalent |
|------|--------|------------------|
| XS | 1 | < 2 hours, trivial change |
| S | 2 | Half-day, self-contained |
| M | 3 | Full day, single concern |
| L | 5 | 2–3 days, complex feature with tests |
| XL | 8 | Full sprint slice (4–5 days), complex integration |
| XXL | 13 | Must be broken down — not plannable at this size |

### Team Velocity (per 2-week sprint)

| Role | Capacity Points | Assumption Basis |
|------|----------------|-----------------|
| Engineering Lead | 40 pts | Full-time, 8 pts/day, 5 days/week × 2 weeks × 0.75 efficiency |
| Frontend Engineer (part-time) | 16 pts | ~4 days per sprint effective |
| AI/ML Engineer (part-time) | 12 pts | Sprints 5–6 only; ~3 days per sprint |
| **Team Total (Sprints 1–4)** | **56 pts** | Engineering Lead + Frontend |
| **Team Total (Sprints 5–6)** | **68 pts** | All three roles active |

### Efficiency Factor

- **0.75 efficiency** applied to account for: code review, meetings, context switching, async founder communication
- **15% sprint buffer** reserved in every sprint for unexpected scope (see Section 12)
- **Planned velocity:** 48 pts (Sprints 1–4), 58 pts (Sprints 5–6) after buffer

### Velocity Guardrails

1. No sprint exceeds 90% of capacity. If planning hits 90%, descope to next sprint.
2. If Sprint 1 velocity comes in below 35 pts, re-baseline all downstream sprint plans before Sprint 2 planning.
3. Founder review gates (end of each sprint) must not compress into next sprint start. Allow 2 days.

---

## 3. Team Capacity Planning

### Roles and Responsibilities

| Role | Person | Commitment | Sprints Active | Primary Responsibilities |
|------|--------|-----------|----------------|--------------------------|
| Engineering Lead | Agency (TBD) | 40 hrs/week | 1–6 | Architecture, auth, DB schema, CI/CD, code review, integration |
| Frontend Engineer | Agency (TBD) | 20 hrs/week | 3–6 | Calculator UI, dashboard components, maps, accessibility |
| AI/ML Engineer | Agency (TBD) | 15 hrs/week | 5–6 | Claude API integration, vector search, embedding pipelines, agent evaluation |
| Founder / PM | Blake | ~10 hrs/week | 1–6 | Decision-maker, domain validation, UAT, content review |
| Agency Oversight | Julian | ~5 hrs/week | 1–6 | Delivery management, client comms, sprint reviews |

### Onboarding Time Budget

New engineers need ramp-up time. Budget these hours as non-velocity before Sprint 1:

| Activity | Hours | Timing |
|---------|-------|--------|
| Repo and codebase tour | 2 hrs | Day 1 Sprint 1 |
| Development environment setup | 3 hrs | Day 1 Sprint 1 |
| PRD-APP-01 through APP-09 read-through | 4 hrs | Days 1–2 Sprint 1 |
| Domain briefing with Founder (freight brokerage, FTZ, cold chain) | 2 hrs | Day 2 Sprint 1 |
| Architecture document review | 2 hrs | Day 2 Sprint 1 |
| **Total onboarding budget** | **13 hrs** | Excluded from Sprint 1 velocity |

### Communication Cadence

| Meeting | Frequency | Attendees | Duration |
|---------|-----------|-----------|---------|
| Sprint Planning | Start of each sprint (bi-weekly) | Eng Lead + Julian + Founder | 60 min |
| Daily Standup | Async (Linear comment) | Engineering team | 15 min written |
| Founder Demo | End of each sprint | All | 45 min |
| Sprint Retrospective | End of each sprint | Agency team | 30 min internal |
| Blocker escalation | As needed | Julian + Eng Lead | 15 min Slack/iMessage |

### Tooling Required Before Sprint 1 Starts

- [ ] Linear project with Sprint 1–6 issue structure created
- [ ] GitHub repository with branch protection on `main`
- [ ] Vercel project connected to GitHub with preview deployments
- [ ] Neon PostgreSQL project provisioned (dev + prod environments)
- [ ] `.env.local.example` committed with all required variable names
- [ ] Founder added to Vercel project (preview URL access for review)
- [ ] Founder added to Linear project (sprint visibility)

---

## 4. Definition of Done (Global)

These criteria apply to **every task and every sprint**. A story is not done until all boxes are checked.

### Code-Level Definition of Done

- [ ] Feature works as described in the acceptance criteria
- [ ] All edge cases from the PRD handled (empty state, error state, loading state)
- [ ] TypeScript compiles with zero errors (`tsc --noEmit` passes)
- [ ] ESLint passes with zero errors
- [ ] No `console.log` statements in committed code (use structured logger)
- [ ] All new API routes have input validation (Zod schema)
- [ ] All new API routes return consistent error shapes `{ error: string, code: string }`
- [ ] Sensitive data never logged (auth tokens, org IDs in plain text)
- [ ] Unit tests written for all pure calculation functions (lib/calculators/)
- [ ] PR reviewed and approved by Engineering Lead before merge

### Database Definition of Done

- [ ] Migration file created via `drizzle-kit generate` (never hand-edit migrations)
- [ ] Every new table includes: `id`, `org_id`, `created_at`, `updated_at` (multi-tenant from Day 1)
- [ ] Row-level indexes created for `org_id` on every new table
- [ ] Cascading delete behavior explicitly specified (not left as default)
- [ ] Drizzle schema types exported and used in API routes (no raw SQL strings)

### UI Definition of Done

- [ ] Component renders correctly in Chromium at 1440px (desktop) and 375px (mobile)
- [ ] Loading and error states implemented for all async operations
- [ ] Empty state UI implemented (not just a blank screen)
- [ ] Keyboard navigation works for all interactive elements
- [ ] Color contrast passes WCAG AA minimum (4.5:1 for body text)
- [ ] No hardcoded colors — use Tailwind CSS classes only

### Sprint-Level Definition of Done

- [ ] All planned stories completed OR consciously descoped with documentation
- [ ] Vercel preview deployment URL shared with Founder for review
- [ ] Sprint demo conducted with Founder sign-off
- [ ] Unresolved issues logged in Linear for next sprint
- [ ] Sprint retrospective completed (see Section 13)
- [ ] PHASE2-SPRINT-PLAN.md updated with actual vs. planned velocity
- [ ] Any architectural deviations documented in `.planning/PROJECT.md`

---

## 5. Sprint 1 — Foundation (Weeks 9–10)

### Goal

Stand up the full application skeleton: working authentication, org-scoped database schema, shared component library, and CI/CD. Every subsequent sprint builds on Sprint 1. It must be rock-solid.

### Pre-Sprint Gate Checklist (REQUIRED)

- [ ] Decision 1: Auth provider selected → documented in PROJECT.md
- [ ] Decision 6: Multi-tenant architecture confirmed → documented in PROJECT.md
- [ ] Development tooling provisioned (see Section 3 tooling checklist)
- [ ] PRD-APP-01 (auth) and PRD-APP-02 (onboarding) reviewed by Eng Lead

### Stories

| ID | Story | Points | Owner | Notes |
|----|-------|--------|-------|-------|
| S1-01 | Project scaffold: Next.js 14 App Router with TypeScript, Tailwind, ESLint, Prettier | M (3) | Eng Lead | Use `create-next-app` with `--typescript --tailwind --eslint --app` |
| S1-02 | Drizzle ORM + Neon connection, migration tooling, CI migration runner | M (3) | Eng Lead | Confirm `drizzle-kit push` vs `migrate` strategy |
| S1-03 | Database schema: `users`, `orgs`, `sessions`, `org_members` tables with org_id scoping | L (5) | Eng Lead | Includes RLS policy setup, bcrypt password column |
| S1-04 | Database schema: `hts_codes`, `ftz_zones`, `ftz_subzones` tables (empty, ready for pipeline) | M (3) | Eng Lead | Foreign key to `orgs` via `org_id` where applicable |
| S1-05 | Auth: POST /api/auth/register — email + password, bcrypt hash, JWT issue | L (5) | Eng Lead | Per PRD-APP-01; rate limit 5 req/min via KV |
| S1-06 | Auth: POST /api/auth/login — credential verify, access token + httpOnly refresh token | L (5) | Eng Lead | Access token 15min TTL; refresh token 7d TTL |
| S1-07 | Auth: POST /api/auth/logout — clear httpOnly cookie | S (2) | Eng Lead | |
| S1-08 | Auth: POST /api/auth/refresh — rotate refresh token | M (3) | Eng Lead | Invalidate old refresh token on rotation |
| S1-09 | Middleware: auth guard for `(app)/*` routes — redirect to `/login` if no valid session | M (3) | Eng Lead | Use Next.js middleware.ts |
| S1-10 | PRD-APP-01: Login page `/login` — email + password form, error handling, loading state | M (3) | Eng Lead | |
| S1-11 | PRD-APP-01: Register page `/register` — org name + email + password | M (3) | Eng Lead | |
| S1-12 | PRD-APP-02: Onboarding wizard `/onboarding` — 4-step flow (org profile, freight type, SE Asia routes, preferences) | L (5) | Eng Lead | Per PRD-APP-02; stores to `org_profiles` table |
| S1-13 | Shared component library: Button, Input, Label, Select, Card, Badge, Alert, Modal, Table (headless) | L (5) | Eng Lead | Tailwind-based; no external UI library dependency |
| S1-14 | Shared layout: app shell — sidebar nav, top header, breadcrumb, responsive mobile nav | M (3) | Eng Lead | |
| S1-15 | CI/CD: GitHub Actions workflow — lint + typecheck + test on every PR | M (3) | Eng Lead | Block merge if any step fails |
| S1-16 | CI/CD: Vercel preview deployment on every PR branch | S (2) | Eng Lead | Configure `vercel.json` with scope |
| **Sprint 1 Total** | | **57 pts** | | Planned against 48 pt capacity — push S1-16 if needed |

**Notes on Sprint 1 Overload:** S1 is intentionally slightly above planned velocity because foundation work cannot slip. If velocity tracks below 40 pts by Day 7, descope S1-12 (onboarding wizard) to Sprint 2.

### Sprint 1 Acceptance Criteria

1. A new user can register with email + password and land on the onboarding wizard.
2. After onboarding, user lands on a placeholder `/dashboard` page — authenticated, behind auth guard.
3. Refreshing the page while authenticated does not log the user out.
4. Accessing `/dashboard` while unauthenticated redirects to `/login`.
5. All database tables exist in Neon dev environment with correct schema.
6. `npm run typecheck` and `npm run lint` pass with zero errors.
7. GitHub Actions CI runs green on the Sprint 1 PR.
8. Vercel preview deployment URL is accessible to Founder for review.

### Sprint 1 Risks

| Risk | Mitigation |
|------|------------|
| JWT implementation has security flaw | Follow PRD-APP-01 exactly; OWASP auth checklist review before Sprint 1 demo |
| Neon connection pooling issues with Drizzle + Next.js | Use `@neondatabase/serverless` driver + Drizzle adapter; test in Vercel serverless env early |
| Onboarding wizard scope expands mid-sprint | Freeze scope at Day 3; any additions go to backlog |

---

## 6. Sprint 2 — Data Pipeline (Weeks 11–12)

### Goal

Populate the database with real government data. No UI this sprint — all backend. By end of Sprint 2, the HTS and FTZ APIs return real data, and the calculators in Sprint 3 have real inputs to work with.

### Pre-Sprint Gate Checklist (REQUIRED)

- [ ] Decision 2: HTS synchronization strategy selected → documented in PROJECT.md
- [ ] Decision 3: Vessel schedule data source selected → documented in PROJECT.md
- [ ] Sprint 1 auth accepted by Founder
- [ ] USITC HTS download tested: `curl -o hts.xml https://hts.usitc.gov/reststop/exportHtsToXml` returns valid XML

### Stories

| ID | Story | Points | Owner | Notes |
|----|-------|--------|-------|-------|
| S2-01 | HTS ingestion script: download USITC XML, parse to normalized rows, upsert to `hts_codes` | XL (8) | Eng Lead | Handle ~18,000 HTS codes; idempotent upsert on `hts_code` PK |
| S2-02 | HTS historical rates: snapshot current rates to `hts_codes_historical` with effective date | M (3) | Eng Lead | Append-only; never overwrite historical records |
| S2-03 | GET /api/hts/search — fulltext search by HTS code or product description | L (5) | Eng Lead | Postgres `tsvector` index; return top 10 matches |
| S2-04 | GET /api/hts/rate-history?hts_code=XXXXXXXXXX — return sorted duty rate history | M (3) | Eng Lead | |
| S2-05 | FTZ ingestion script: download OFIS/data.gov FTZ JSON, upsert to `ftz_zones` + `ftz_subzones` | L (5) | Eng Lead | Parse 260+ zones; validate zone_number uniqueness |
| S2-06 | GET /api/ftz/zones — paginated list of FTZ zones with coordinates | M (3) | Eng Lead | Edge-cache via Vercel Cache-Control: 86400 |
| S2-07 | GET /api/ftz/zones/[zone_number] — single zone detail with subzones | M (3) | Eng Lead | |
| S2-08 | Port codes reference data: load UN/LOCODE JSON to `ports` table | M (3) | Eng Lead | Filter to US + SE Asia ports for MVP (< 2,000 records) |
| S2-09 | GET /api/ports/search — search ports by name or LOCODE | M (3) | Eng Lead | Used by route comparison calculator |
| S2-10 | Vessel schedules: load static weekly JSON to `vessel_schedules` table | M (3) | Eng Lead | Per Decision 3 recommendation (static JSON for MVP) |
| S2-11 | GET /api/vessels/schedules — query by origin port + destination port | M (3) | Eng Lead | Return list of carriers, transit days, frequency |
| S2-12 | Vercel Cron: weekly trigger for HTS sync script (automated refresh) | S (2) | Eng Lead | Only if Decision 2 selects Option B; skip otherwise |
| S2-13 | Data quality: seed script for local development (subset of real data) | M (3) | Eng Lead | `npm run db:seed` populates 100 HTS codes, 20 FTZ zones, 50 ports |
| **Sprint 2 Total** | | **47 pts** | | Within 48 pt capacity |

### Sprint 2 Acceptance Criteria

1. `GET /api/hts/search?q=frozen+shrimp` returns at least one result with a non-zero duty rate.
2. `GET /api/ftz/zones` returns at least 200 zones with valid lat/lng coordinates.
3. `GET /api/vessels/schedules?origin=CNSHA&destination=USLAX` returns at least one carrier result.
4. `npm run db:seed` completes without error in a fresh database.
5. All API routes return within 500ms at p95 on Vercel (test via Vercel Analytics).
6. All API routes return proper 400 error shapes for invalid input.
7. Historical HTS snapshot table has at least one record (verifying append-only logic).

### Sprint 2 Risks

| Risk | Mitigation |
|------|------------|
| USITC XML format changed since planning | Test download before Sprint 2 starts (pre-sprint gate); build schema validation into parser |
| FTZ zone data has gaps or format inconsistencies | Log parse errors to a `pipeline_errors` table; partial success is acceptable for MVP |
| Port data too large for Postgres full-table scan at search time | Add `GIN` index on port name tsvector before launch; benchmark with 10,000 records |

---

## 7. Sprint 3 — Core Calculators (Weeks 13–14)

### Goal

Ship the four P0 calculators that form the core value proposition of the platform. These are the tools users pay for. Calculator logic runs entirely client-side using `decimal.js`. APIs from Sprint 2 provide the reference data inputs.

### Pre-Sprint Checklist

- [ ] Sprint 2 HTS and FTZ APIs accepted by Engineering Lead
- [ ] `decimal.js` installed and calculation helper functions scaffolded in `lib/calculators/`
- [ ] Frontend Engineer onboarded and ready (if separate from Eng Lead)

### Stories

| ID | Story | Points | Owner | Notes |
|----|-------|--------|-------|-------|
| S3-01 | PRD-APP-03: HTS Code Lookup page `/tools/hts-lookup` — search UI + result display with duty rate + date | L (5) | Frontend | Calls `/api/hts/search`; rate history expandable panel |
| S3-02 | PRD-APP-03: HTS lookup shareable URL state via `nuqs` | S (2) | Frontend | `?q=frozen+shrimp` pre-fills search |
| S3-03 | lib/calculators/landed-cost.ts — pure calculation functions for total landed cost | M (3) | Eng Lead | Unit-tested; inputs: unit price, quantity, freight cost, duty rate, insurance rate |
| S3-04 | PRD-APP-04: Landed Cost Calculator page `/tools/landed-cost` — full interactive calculator UI | L (5) | Frontend | Multi-section form; results panel updates on input change |
| S3-05 | PRD-APP-04: Landed cost URL state serialization — all inputs preserved in URL | M (3) | Frontend | `nuqs` for all calculator fields |
| S3-06 | PRD-APP-04: Landed cost PDF export — print-ready results sheet | M (3) | Frontend | Browser `window.print()` with print CSS; no server-side PDF |
| S3-07 | lib/calculators/ftz-savings.ts — pure calculation for PF/NPF election comparison, duty-deferred value | L (5) | Eng Lead | Unit-tested; inputs: HTS duty rate, merchandise quantity, weekly vs. monthly withdrawal |
| S3-08 | PRD-APP-05: FTZ Savings Modeler page `/tools/ftz-modeler` — full interactive calculator | XL (8) | Frontend | Three-panel layout: inputs / NPF vs PF comparison / annual savings summary |
| S3-09 | PRD-APP-05: FTZ zone selector — search FTZ zones by location; show nearest zones | M (3) | Frontend | Calls `/api/ftz/zones`; simple list picker (map view is Sprint 4) |
| S3-10 | lib/calculators/container-utilization.ts — pure calculation for CBM, weight utilization, mix optimization | M (3) | Eng Lead | Unit-tested |
| S3-11 | PRD-APP-07: Container Utilization Calculator page `/tools/container-calc` | M (3) | Frontend | 20/40/40HC container profiles; multiple cargo line items |
| S3-12 | Calculation history: save calculator results to DB per org (requires Sprint 1 auth) | M (3) | Eng Lead | `calculations` table: `id, org_id, type, inputs_json, results_json, created_at` |
| S3-13 | GET /api/calculations/history — return last 20 saved calculations per org | S (2) | Eng Lead | Ordered by created_at DESC |
| **Sprint 3 Total** | | **49 pts** | | 1 pt over 48 — Eng Lead reviews before sprint start |

### Sprint 3 Acceptance Criteria

1. HTS Lookup: entering "frozen shrimp" returns results within 500ms; duty rate is non-zero; sharing the URL pre-fills the search.
2. Landed Cost Calculator: entering a product at $10/unit × 1,000 units with a 5% duty rate produces a correct total landed cost matching manual calculation.
3. `lib/calculators/landed-cost.ts` unit tests all pass (zero rounding errors, confirmed with decimal.js).
4. FTZ Savings Modeler: selecting NPF vs PF status produces different duty calculations; "Annual Savings" figure is correct against hand-calculated value.
5. Container Utilization Calculator: a 20ft container filled to 25 CBM shows correct utilization percentage.
6. All calculator pages serialize state to URL; loading the URL in a fresh browser tab restores all inputs.
7. Calculation history: a logged-in user's saved results appear in the history panel.

### Sprint 3 Risks

| Risk | Mitigation |
|------|------------|
| FTZ savings calculation complexity higher than estimated | Eng Lead pairs with Frontend Engineer during S3-07/S3-08; schedule mid-sprint check-in with Founder for domain validation |
| decimal.js edge cases with very large import volumes | Write unit tests for values > $10M; test scientific notation handling |
| Calculator URL state getting stale after schema changes | Add URL schema version field (`?v=1`); on version mismatch, clear state gracefully |

---

## 8. Sprint 4 — Operations (Weeks 15–16)

### Goal

Build the operational tools: shipment tracking, route comparison, and the executive dashboard. These features turn Shipping Savior from a calculator suite into an operations platform.

### Pre-Sprint Checklist

- [ ] Sprint 3 calculators accepted by Founder in demo
- [ ] Decision on whether PRD-APP-09 shipment data is manual-entry only (MVP) or live API integration (confirm with Founder before Sprint 4 planning)

### Stories

| ID | Story | Points | Owner | Notes |
|----|-------|--------|-------|-------|
| S4-01 | Database schema: `shipments` table — `id, org_id, reference_number, origin_port, destination_port, status, carrier, vessel, est_arrival, actual_arrival, cargo_value, hts_code, created_at` | M (3) | Eng Lead | Multi-tenant from Day 1 |
| S4-02 | POST /api/shipments — create new shipment | S (2) | Eng Lead | Zod schema validation |
| S4-03 | PATCH /api/shipments/[id] — update shipment status and fields | M (3) | Eng Lead | Validate org_id ownership before update |
| S4-04 | GET /api/shipments — paginated list, sortable by status/arrival/value | M (3) | Eng Lead | Default sort: est_arrival ASC |
| S4-05 | PRD-APP-09: Shipment List page `/shipments` — table with filter/sort controls | L (5) | Frontend | Status badges (In Transit, At Port, Delivered, Delayed); bulk actions |
| S4-06 | PRD-APP-09: Shipment detail panel — inline slide-over with full shipment record | M (3) | Frontend | Click row → slide-over (no full page reload) |
| S4-07 | PRD-APP-09: New shipment form — modal form, calls POST /api/shipments | M (3) | Frontend | |
| S4-08 | lib/calculators/route-comparison.ts — calculate cost, transit days, and emissions across routes | M (3) | Eng Lead | Uses vessel schedule API; unit-tested |
| S4-09 | PRD-APP-06: Route Comparison page `/tools/routes` — multi-route comparison table | L (5) | Frontend | Up to 4 routes; sortable by cost, transit days, CO2 estimate |
| S4-10 | PRD-APP-06: Route comparison URL state and shareable link | S (2) | Frontend | |
| S4-11 | Database: KPI aggregation queries — total cargo value, avg transit days, active shipment count, monthly savings by org | M (3) | Eng Lead | Materialized or computed on-demand per org |
| S4-12 | PRD-APP-08: Executive Dashboard `/dashboard` — KPI cards + mini shipment map + recent activity feed | XL (8) | Frontend | KPI cards call aggregation API; activity feed = last 10 shipment events |
| S4-13 | PRD-APP-08: Mini shipment map — deck.gl static map with shipment origin/destination pins | L (5) | Frontend | deck.gl; only current active shipments; not interactive (interactive map is Phase 4) |
| **Sprint 4 Total** | | **48 pts** | | At capacity — no buffer |

**If Sprint 4 is at risk:** Descope S4-13 (mini map) to Sprint 6. Dashboard without map is acceptable for MVP.

### Sprint 4 Acceptance Criteria

1. A logged-in user can create a new shipment and see it appear in the shipment list immediately.
2. Shipment status can be updated from "In Transit" to "At Port" and the change persists on refresh.
3. Route Comparison: entering Port of Shanghai to Port of Los Angeles returns at least two carrier options with cost and transit day estimates.
4. Executive Dashboard shows correct KPI values that match the underlying data (verify with direct DB query).
5. Dashboard activity feed shows the last 10 shipment events in reverse chronological order.
6. All shipment API endpoints return 403 if request org_id does not match authenticated user's org_id.

### Sprint 4 Risks

| Risk | Mitigation |
|------|------------|
| deck.gl mini map integration time underestimated | If blocking Sprint 4 demo, ship dashboard without map; add in Sprint 6 Polish |
| Founder wants shipment import from CSV — scope creep | Defer to Phase 4; log in Linear backlog |
| Aggregation queries slow on large org shipment volumes | Add `EXPLAIN ANALYZE` benchmarks; add composite indexes on `(org_id, created_at)` |

---

## 9. Sprint 5 — AI Agents (Weeks 17–18)

### Goal

Ship three of the seven planned AI agents as an MVP subset. These agents were selected because they provide immediate value and have well-defined inputs/outputs. The remaining four agents target Phase 4.

### Pre-Sprint Gate Checklist (REQUIRED)

- [ ] Decision 4: AI agents build vs. buy selected → documented in PROJECT.md
- [ ] Anthropic API key configured in Vercel environment variables
- [ ] AI/ML Engineer onboarded and has reviewed `.planning/prds/AI-AGENT-PLANS.md`
- [ ] Vector search infrastructure selected (Neon pgvector vs. Pinecone vs. Upstash Vector)

### Agents in Scope for Sprint 5

| Agent | Tier | MVP Capability | Input | Output |
|-------|------|----------------|-------|--------|
| HTS Classification | Tier 1 | Suggest 5 probable HTS codes from product description | Text description | Ranked HTS codes with confidence |
| Tariff Alert | Tier 2 | Weekly cron: detect HTS rate changes, notify affected orgs | Saved HTS watchlist | Email digest via Resend |
| Compliance Checklist | Tier 2 | Generate custom import compliance checklist by HTS + origin country | HTS code + origin | Structured checklist JSON |

### Stories

| ID | Story | Points | Owner | Notes |
|----|-------|--------|-------|-------|
| S5-01 | pgvector extension enabled in Neon; `hts_embeddings` table created | S (2) | AI/ML Eng | `CREATE EXTENSION vector;`; 1536-dim for OpenAI embeddings |
| S5-02 | HTS embedding pipeline: generate embeddings for all 18K HTS descriptions; store to `hts_embeddings` | L (5) | AI/ML Eng | Batch OpenAI embeddings; rate-limited; idempotent |
| S5-03 | POST /api/ai/hts-classify — cosine similarity search, return top 5 HTS codes with confidence scores | L (5) | AI/ML Eng | Rate limit: 10 req/min per org; cache identical queries 1 hour |
| S5-04 | HTS Classifier UI: text input + "Classify" button + result panel on `/tools/hts-lookup` | M (3) | Frontend | Non-blocking — appears below existing search; uses streaming |
| S5-05 | `hts_watchlist` table: `id, org_id, hts_code, created_at` | S (2) | Eng Lead | Users "watch" specific HTS codes for rate changes |
| S5-06 | POST/DELETE /api/hts/watchlist/[hts_code] — add/remove from watchlist | S (2) | Eng Lead | |
| S5-07 | Watchlist UI: star/unstar HTS codes on lookup results | S (2) | Frontend | Optimistic UI update; sync to API |
| S5-08 | Tariff Alert agent: Vercel Cron weekly — compare current HTS rates to previous snapshot, detect changes | L (5) | AI/ML Eng | Queries `hts_codes_historical`; diff detection |
| S5-09 | Tariff Alert: email digest via Resend — list changed HTS codes with rate delta | M (3) | AI/ML Eng | Only send to orgs with affected watchlist items |
| S5-10 | POST /api/ai/compliance-checklist — Claude claude-sonnet-4-6 with RAG from OFIS/CBP knowledge base | XL (8) | AI/ML Eng | Structured checklist JSON; streaming response via SSE |
| S5-11 | Compliance Checklist UI: HTS code + origin country inputs + streaming checklist display | L (5) | Frontend | SSE reader; checklist items render as they stream |
| S5-12 | AI cost monitoring: log all Anthropic API calls to `ai_usage_log` table with token counts | M (3) | AI/ML Eng | `id, org_id, agent, input_tokens, output_tokens, cost_usd, created_at` |
| **Sprint 5 Total** | | **51 pts** | | Within 58 pt capacity (3-person sprint) |

### Sprint 5 Acceptance Criteria

1. HTS Classifier: entering "frozen shrimp fillets" returns at least 3 HTS codes with the correct top result (0304.89 or similar) at > 80% confidence.
2. HTS Classifier API returns 429 after 10 requests per minute from the same org.
3. Tariff Alert cron: manually triggering the cron with a simulated rate change generates an email to the test org's email address.
4. Compliance Checklist: entering HTS 0304.89 + origin Vietnam generates a checklist with at least 5 items including FDA prior notice.
5. Compliance Checklist streams response — first checklist item appears within 2 seconds.
6. `ai_usage_log` has a record for every Anthropic API call made during testing.
7. No Anthropic API key appears in any client-side bundle (verify with `npm run build` and bundle analyzer).

### Sprint 5 Risks

| Risk | Mitigation |
|------|------------|
| HTS embedding pipeline takes > 8 hours at OpenAI rate limits | Pre-run pipeline before Sprint 5 starts; cache results; use batch API if available |
| Compliance checklist hallucinations for obscure HTS codes | System prompt explicitly scoped to CBP/OFIS sources; add "Sources" section to output; human review disclaimer in UI |
| SSE streaming not working on Vercel Edge Functions | Test SSE with `/api/ai/*` on Node.js runtime (not Edge); add `export const runtime = "nodejs"` |

---

## 10. Sprint 6 — Polish & Launch (Weeks 19–20)

### Goal

Reach launch-ready quality. E2E test coverage, performance optimization, beta user onboarding, and monitoring setup. No major new features — Sprint 6 is about confidence and reliability.

### Pre-Sprint Checklist

- [ ] Sprint 5 AI agents accepted in demo
- [ ] At least 3 beta users identified and confirmed for onboarding during Sprint 6
- [ ] Founder has completed 5 discovery calls (Decision 5 validation progress check)
- [ ] Production Neon database provisioned (separate from dev)
- [ ] Vercel production environment variables set

### Stories

| ID | Story | Points | Owner | Notes |
|----|-------|--------|-------|-------|
| S6-01 | Agent 2: Route Optimization Agent (Claude claude-sonnet-4-6) — given shipment profile, recommend optimal route with cost/time tradeoff narrative | XL (8) | AI/ML Eng | SSE streaming; uses vessel schedule data |
| S6-02 | Route optimization UI integration — "Optimize" button on Route Comparison page | M (3) | Frontend | Optional AI enhancement to existing tool |
| S6-03 | E2E test suite: Playwright — auth flow (register, login, logout, session expiry) | M (3) | Eng Lead | CI pipeline integration |
| S6-04 | E2E test suite: Playwright — Landed Cost Calculator end-to-end with known values | M (3) | Eng Lead | Assert specific output values |
| S6-05 | E2E test suite: Playwright — FTZ Savings Modeler end-to-end | M (3) | Eng Lead | |
| S6-06 | E2E test suite: Playwright — Shipment create + status update flow | M (3) | Eng Lead | |
| S6-07 | Performance: LCP < 2.5s on dashboard and calculator pages (Vercel Speed Insights) | M (3) | Frontend | Image optimization, RSC maximization, bundle splitting |
| S6-08 | Performance: calculator pages score > 90 on Lighthouse Performance | M (3) | Frontend | Focus: reduce unused JS; preload critical fonts |
| S6-09 | Error monitoring: Sentry integration — uncaught errors + API 500s | M (3) | Eng Lead | Org ID attached to Sentry context (no PII) |
| S6-10 | Uptime monitoring: Vercel cron pings `/api/health` every 5 minutes | S (2) | Eng Lead | Alert to Julian via email on 2 consecutive failures |
| S6-11 | Beta user onboarding: create accounts for 3 beta users, white-glove walkthrough | M (3) | Julian + Founder | Per GTM Launch Playbook |
| S6-12 | Feedback widget: in-app NPS prompt after 3rd calculator use (via localStorage gate) | M (3) | Frontend | Simple 1–10 NPS + freeform text; stores to `nps_responses` table |
| S6-13 | Public launch checklist: robots.txt, sitemap.xml, OG meta tags on all public pages | M (3) | Frontend | SEO basics before any public URL sharing |
| S6-14 | Security review: OWASP Top 10 checklist pass for auth routes and AI endpoints | M (3) | Eng Lead | Document findings in `.planning/SECURITY-REVIEW.md` |
| S6-15 | Production deployment: prebuilt Vercel deploy to production; smoke test all P0 flows | M (3) | Eng Lead | Follow deployment procedure from PHASE2-MASTER-PLAN.md |
| **Sprint 6 Total** | | **54 pts** | | Within 58 pt capacity |

### Sprint 6 Acceptance Criteria

1. All 6 Playwright E2E tests pass on CI against the staging environment.
2. Dashboard LCP < 2.5s measured via Vercel Speed Insights (3 consecutive measurements).
3. Lighthouse Performance score > 90 on `/tools/landed-cost` and `/tools/ftz-modeler`.
4. Sentry is receiving error events (verified by triggering a test error in staging).
5. 3 beta users have completed onboarding and run at least one calculation.
6. Production deployment is live and all P0 pages load without errors.
7. OWASP security review checklist is complete with no Critical or High findings unresolved.
8. Founder sign-off received on final demo.

### Sprint 6 Risks

| Risk | Mitigation |
|------|------------|
| E2E test flakiness delays CI | Use `playwright.config.ts` retries: 2; mark known-flaky tests as skipped until stabilized |
| Performance optimization requires architectural change | Start performance work at Sprint 6 Day 1; do not leave for Day 8 |
| Beta user onboarding reveals critical UX bugs | Sprint 6 has 15% buffer explicitly for this; prioritize over S6-01 (route optimization agent) |

---

## 11. Cross-Sprint Dependency Map

```
Sprint 1: Auth + DB Schema
    │
    ├── REQUIRED BY: All authenticated platform features
    │
Sprint 2: Data Pipeline
    │
    ├── S2-01 HTS Codes ──────────────────────────────────────┐
    │   S2-05 FTZ Zones ──────────────────────────────────┐   │
    │   S2-10 Vessel Schedules ───────────────────────┐   │   │
    │                                                  │   │   │
Sprint 3: Core Calculators                             │   │   │
    │   S3-01 HTS Lookup ◄──────────────────────────────────┘│
    │   S3-07 FTZ Savings Modeler ◄──────────────────────────┘
    │   S3-08 Route Comparison Lib ◄─────────────────────────┘
    │   S3-12 Calculation History (requires S1 auth)
    │
Sprint 4: Operations
    │   S4-01 Shipments DB ◄──── S1-03 Schema
    │   S4-09 Route Comparison ◄── S2-10 Vessel Schedules
    │   S4-11 KPI Aggregation ◄─── S4-01 Shipments
    │   S4-12 Dashboard ◄───────── S4-11 KPIs + S3-12 Calc History
    │
Sprint 5: AI Agents
    │   S5-02 HTS Embeddings ◄──── S2-01 HTS Codes
    │   S5-08 Tariff Alerts ◄────── S2-01 HTS Historical Rates
    │   S5-10 Compliance ◄──────── S2-01 HTS Codes (RAG source)
    │
Sprint 6: Polish & Launch
        S6-01 Route Optimization ◄── S2-10 Vessel Schedules + S5 AI infra
        S6-03-06 E2E Tests ◄──── All prior sprints
        S6-09 Sentry ◄──────── All prior sprints
```

### Hard Dependencies (cannot start story without prerequisite)

| Story | Requires | Sprint Boundary |
|-------|----------|-----------------|
| Any authenticated feature | S1-05 (auth working) | Sprint 2+ |
| S3-01 HTS Lookup | S2-01 (HTS data seeded) | Sprint 3 |
| S3-07 FTZ Modeler | S2-05 (FTZ data seeded) | Sprint 3 |
| S4-09 Route Comparison | S2-10 (vessel schedules) | Sprint 4 |
| S4-12 Dashboard | S4-11 (KPI aggregation) | Same sprint |
| S5-02 Embeddings | S2-01 (18K HTS codes in DB) | Sprint 5 |
| S5-08 Tariff Alerts | S2-02 (historical rates table) | Sprint 5 |
| S5-10 Compliance | S5-01 (pgvector extension) | Sprint 5 |
| S6-01 Route Optimization | S5 AI infra + S2-10 vessel data | Sprint 6 |

### Parallel Work Opportunities

Within each sprint, these work streams can proceed in parallel without blocking each other:

- **Sprints 3–4:** Eng Lead owns calculation libraries and API routes; Frontend Engineer owns UI. Can work concurrently once API contract is agreed.
- **Sprint 5:** AI/ML Engineer owns agent logic independently. Frontend Engineer can build UI with mock API responses before S5-03 is complete.
- **Sprint 6:** E2E testing (Eng Lead) and performance optimization (Frontend) are independent work streams.

---

## 12. Tech Debt & Buffer Budget

### Per-Sprint Buffer Allocation

Every sprint reserves **15% of planned velocity** (approximately 7–8 points) for:

1. Bug fixes from prior sprint discovered during demo
2. Unplanned complexity discovered mid-sprint
3. PR review feedback requiring rework
4. Founder feedback requiring quick pivots

**This buffer is not optional.** If a sprint is planned above 85% capacity, it must be descoped before planning is finalized.

### Tech Debt Accumulation Budget

Deliberate tech debt is acceptable when time-boxed and logged. Track all intentional shortcuts in Linear under the label `tech-debt`.

| Acceptable Debt | Payback Sprint | Not Acceptable |
|-----------------|----------------|----------------|
| Hardcoded per-page limits (e.g., 20 results) | Sprint 4 | Security shortcuts |
| Non-streaming AI response (polling) | Sprint 5 | Missing org_id scoping |
| Manual vessel schedule JSON updates | Phase 4 | Missing input validation |
| Mock email in development | Sprint 1 | Broken auth rotation |

### Post-Sprint 4 Tech Debt Sprint

After Sprint 4 demo, schedule a **half-sprint (1 week) tech debt window** before Sprint 5 begins:

- Address any `tech-debt` labeled Linear issues from Sprints 1–4
- Performance profiling of Sprint 3 calculators under load
- Database index review with EXPLAIN ANALYZE
- Dependency updates (minor versions only)

This window is already budgeted within the 12-week timeline (counted as part of Sprint 5's 2-week block).

### Bug Fix SLA

| Severity | Definition | Response | Resolution Target |
|---------|-----------|----------|------------------|
| P0 Critical | Auth bypass, data leak, data loss | Immediate escalation | Same day |
| P1 High | Feature broken for all users | Engineering Lead notified in 1 hour | Within 48 hours |
| P2 Medium | Feature degraded for some users | Logged in Linear, current sprint | Next sprint |
| P3 Low | Cosmetic, minor UX | Linear backlog | Future sprint |

---

## 13. Sprint Retrospective Template

Run this retrospective at the end of every sprint. Keep it to 30 minutes.

---

### Sprint [N] Retrospective

**Date:**
**Sprint:** [N] — [Name]
**Attendees:**

---

#### 1. Velocity Review (5 min)

| Metric | Planned | Actual | Delta |
|--------|---------|--------|-------|
| Story points committed | | | |
| Story points completed | | | |
| Stories completed | | | |
| Stories carried over | | | |

**Carry-over stories (list each):**
- [Story ID]: [Reason for carry-over]

---

#### 2. What Went Well (10 min)

*(Each person adds 1–3 items)*

-
-
-

---

#### 3. What Could Be Improved (10 min)

*(Be specific — name the process, not the person)*

-
-
-

---

#### 4. Action Items (5 min)

*(Max 2 actions per retro — more than 2 means none get done)*

| Action | Owner | Due |
|--------|-------|-----|
| | | |
| | | |

---

#### 5. Velocity Calibration

- Did assumptions hold for this sprint?
- Should next sprint's planned velocity be adjusted? If so, by how much and why?
- Any sprint scope changes needed based on this retro?

---

#### 6. Founder Feedback Summary

*(Items from sprint demo that need engineering response)*

-
-

---

*Save this file as `.planning/retros/sprint-[N]-retro.md`*

---

## 14. Pre-Phase 3 Checklist

This checklist must be complete before any Sprint 1 code is written.

### Hard Gates (Sprint 1 cannot start without these)

- [ ] **Decision 1 resolved:** Auth provider documented in `PROJECT.md` — Custom JWT (recommended), NextAuth v5, or Clerk
- [ ] **Decision 6 resolved:** Multi-tenant org_id scoping confirmed — org_id on all tables, RLS policies from Day 1
- [ ] Vercel project created and connected to GitHub repo
- [ ] Neon dev + prod databases provisioned
- [ ] Engineering Lead assigned and has full repo access
- [ ] Founder kickoff meeting completed — open questions from `.planning/prds/PHASE-2-PLANNING-SUMMARY.md` reviewed and answered

### Soft Gates (Sprint 2 cannot start without these)

- [ ] **Decision 2 resolved:** HTS sync strategy documented (Manual / Cron / Third-party API)
- [ ] **Decision 3 resolved:** Vessel schedule data source documented (Static JSON recommended for MVP)
- [ ] USITC HTS XML download tested and confirmed accessible
- [ ] Sprint 1 accepted by Founder in demo

### Planning Gates (Sprint 5 cannot start without these)

- [ ] **Decision 4 resolved:** AI agents build vs. buy documented (Direct Anthropic API recommended)
- [ ] Anthropic API key in Vercel production environment
- [ ] Vector search infrastructure selected and provisioned (pgvector in Neon recommended)
- [ ] AI/ML Engineer assigned and has reviewed AI Agent Plans PRD

### Launch Gates (Sprint 6 cannot start without these)

- [ ] **Decision 5 progress:** At least 5 discovery calls completed; willingness to pay data collected
- [ ] 3 beta users identified and agreed to onboard
- [ ] Production Neon database provisioned with separate credentials from dev
- [ ] Sentry project created

---

*This document governs Phase 3 sprint execution for Shipping Savior (AI-5431). It is the operational companion to `docs/PHASE2-MASTER-PLAN.md` (AI-5455). Update actual velocity figures in Section 2 after each sprint.*
