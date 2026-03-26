# Phase 2 Planning Summary — Shipping Savior
**Linear Issues:** AI-5455, AI-5431
**Phase:** 2 — Architecture, Pipeline, AI Agents, GTM, Financial
**Status:** Planning Complete → Ready for Phase 3 Implementation
**Last Updated:** 2026-03-26

> **Note:** The full detailed planning document lives at `.planning/prds/PHASE-2-PLANNING-SUMMARY.md` (AI-5407). This root-level document is the master index and executive brief for Phase 2 planning as a whole.

---

## Phase 2 Overview

Phase 2 delivers the complete technical and business blueprint for Shipping Savior — a logistics intelligence SaaS platform targeting freight brokers, importers, and supply chain operators. The phase converts the Phase 1 proposal concept into a buildable, investable plan across five workstreams:

1. **Technical Architecture** — Full-stack system design, application structure, database schema, auth, maps, deployment
2. **Data Pipeline** — HTS tariff ingestion, FTZ zone data, vessel schedules, port statistics — all public datasets
3. **AI Agents** — Four Claude-powered agents for HTS classification, route optimization, tariff alerts, and compliance
4. **Go-to-Market Strategy** — Target segments, pricing model, GTM phases, positioning vs. incumbents
5. **Financial Model** — Development cost estimates, infrastructure costs, 18-month revenue projections, break-even analysis

### Phase 2 Objectives

- [ ] Produce complete PRDs for all 14 platform screens (5 proposal + 9 full-app)
- [ ] Design the full technical architecture and make the critical pre-build decisions
- [ ] Map all public data sources and design the ingestion pipeline
- [ ] Define the 4 AI agents' scope, models, inputs/outputs, and compliance guardrails
- [ ] Establish GTM phasing, pricing model, and competitive positioning
- [ ] Build a defensible financial model with dev cost estimates and break-even projections
- [ ] Document all cross-workstream dependencies and critical gate decisions for Phase 3

---

## Planning Workstream Summaries

### 1. Technical Architecture
**Document:** `.planning/prds/TECHNICAL-ARCHITECTURE.md` (AI-5409, 1500+ lines)

**Stack:**

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 App Router + TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL on Neon (serverless) |
| ORM | Drizzle ORM |
| Auth | Custom JWT (bcrypt + httpOnly cookies) |
| Maps | deck.gl (ScatterplotLayer, PathLayer) |
| Charts | Recharts |
| Financial Math | decimal.js (mandatory — no native floats) |
| URL State | nuqs (shareable calculator URLs) |
| Deployment | Vercel |
| Rate Limiting | Vercel KV |

**Key Architectural Decisions:**
- **Local calculation engine:** All financial math runs client-side with decimal.js. No per-query API costs, no latency, no external dependency for core value.
- **Server Components first:** Only interactive sections (calculators, maps, charts) use `"use client"`. Static content is server-rendered.
- **URL state sync:** All calculator inputs serialize to URL via `nuqs` for shareable, bookmarkable calculations.
- **Monolith through Phase 3:** Next.js monolith for all phases. AI workers extractable to Railway if needed for cost isolation — no premature service decomposition.
- **Proposal site first, platform second:** Phase 1 proposal site de-risks the build. Phase 3 builds the authenticated SaaS.

**Application Structure:**
```
app/
  (public)/     # Landing page, tools (no auth)
  (auth)/       # Login, register, reset-password
  (app)/        # Authenticated platform (dashboard, tools, shipments)
  api/          # API routes (auth, calculators, ftz, hts, dashboard)
components/
  landing/      # Proposal page sections
  calculators/  # Shared calculation UI
  dashboard/    # Dashboard widgets
  shipments/    # Shipment list and detail
  shared/       # Reusable UI primitives
lib/
  calculators/  # Pure calculation functions
  db/           # Drizzle schema and queries
  auth/         # Session management, middleware
  data/         # Static data loaders
data/           # JSON data files (ftz-locations.json, port-codes.json, etc.)
```

---

### 2. Data Pipeline
**Document:** `.planning/prds/DATA-PIPELINE.md` (AI-5410, 1700+ lines)

**Data Sources and Ingestion:**

| Dataset | Source | Update Frequency | Storage |
|---------|--------|-----------------|---------|
| HTS Code Database | USITC (hts.usitc.gov) | Quarterly | PostgreSQL `hts_codes` |
| Historical HTS Rates | USITC historical snapshots | Append-only on tariff changes | PostgreSQL `hts_codes_historical` |
| FTZ Zone Data | OFIS database (data.gov) | Annual | PostgreSQL `ftz_zones`, JSON cache |
| FTZ Subzones | FTZ Board orders (Federal Register) | On new orders | PostgreSQL `ftz_subzones` |
| Port Codes | UN/LOCODE + CBP port schedule | Annual | Static JSON |
| Vessel Schedules | Carrier public schedules | Weekly scrape | Static JSON + PostgreSQL `vessel_schedules` |
| Port Statistics | Bureau of Transportation Statistics | Monthly | PostgreSQL `port_stats` |
| SE Asia Trade Data | US Census Bureau FT-900 | Monthly | PostgreSQL `trade_stats` |

**Pipeline Architecture:**
```
External Sources
    │
    ▼
Ingest Scripts (Node.js CLI / Vercel Cron)
    ├── scripts/sync-hts.ts      # USITC HTS XML
    ├── scripts/sync-ftz.ts      # OFIS FTZ data
    ├── scripts/sync-vessels.ts  # Carrier schedule scrape
    └── scripts/sync-ports.ts    # Port code reference
    │
    ▼
PostgreSQL (Neon)
    │
    ▼
API Routes
    ├── /api/hts/search
    ├── /api/hts/rate-history
    ├── /api/ftz/zones
    └── /api/vessels/schedules
    │
    ▼
Client Calculators (decimal.js)
```

**Data Freshness Strategy:**
- HTS codes: Every display shows "Rate as of [date]" with USITC link. Quarterly sync minimum + manual trigger on tariff events.
- FTZ zones: Annual sync sufficient. CDN-cached at edge.
- Vessel schedules: Phase 1 uses published weekly schedules; Phase 3 adds real carrier API integrations.
- Port statistics: Monthly cron for dashboard analytics only.

---

### 3. AI Agents
**Document:** `.planning/prds/AI-AGENT-PLANS.md` (AI-5411, 1450+ lines)

Four Claude-powered agents are planned for Phase 3:

| Agent | Model | Purpose | Trigger |
|-------|-------|---------|---------|
| HTS Classification Assistant | Claude 3.5 Sonnet | Suggest HTS codes from product descriptions | User enters description in HTS Lookup tool |
| Route Optimization Agent | Claude 3.5 Sonnet | Rank shipping routes with narrative tradeoff explanation | User clicks "Recommend Route" in Route Comparison |
| Tariff Alert Agent | Claude 3 Haiku | Monitor Federal Register for tariff changes | Daily cron; scans new entries |
| Compliance Checklist Generator | Claude 3.5 Sonnet | Generate product-specific import compliance checklist | User creates shipment or requests compliance check |

**Key AI Infrastructure Decisions:**
- **Direct Anthropic API** — no LangChain/framework overhead for Phase 3 (agents simple enough to not need it)
- **Human oversight required** — HTS agent never auto-submits; user must confirm code selection
- **Compliance disclaimer** on all AI outputs: "This is a suggestion only. Final classification must be confirmed by a licensed customs broker."
- **Streaming** for Route Optimization Agent (long narrative outputs)
- **Rate limiting** — AI endpoints rate-limited separately (10 req/min/org for HTS, 5 req/min for Route)
- **Cost controls** — all AI API calls logged with token counts; monthly spend alerting
- **Graceful fallback** — if Anthropic API unavailable, calculators still work without AI

---

### 4. Go-to-Market Strategy
**Document:** `.planning/prds/GTM-STRATEGY.md` (AI-5412, 1330+ lines)

**Target Segments (Priority Order):**
1. **The Founder (Immediate)** — Primary user; platform solves his exact operational problems
2. **Cold Chain Freight Brokers** — Independent brokers in temperature-controlled cargo
3. **SE Asia Importers** — Small-to-mid importers from Vietnam, Thailand, Indonesia, Malaysia
4. **Mid-Market Logistics Managers** — In-house logistics staff at $500K-$5M/year freight spend

**GTM Phases:**

| Phase | Timeline | Goal |
|-------|----------|------|
| Phase 1: Prove It | Weeks 1-8 (Proposal Site) | 10 qualified conversations, 3 LOIs or pilot commitments |
| Phase 2: Early Adopters | Weeks 9-20 (Platform Beta) | 5-10 beta users, NPS > 50, 3 case studies; free |
| Phase 3: SaaS Launch | Months 6-12 | 50 paying customers, $15K MRR |

**Positioning:**
- **Primary:** "The only logistics intelligence platform built around FTZ strategy and cold chain operations."
- **vs. Freightos/Flexport:** Those platforms focus on freight booking (marketplace). Shipping Savior focuses on financial intelligence — costs, duty reduction, route strategy.
- **vs. Xeneta:** Xeneta sells market rate benchmarking (requires carrier data contracts). Shipping Savior is self-serve with local calculation engines.

**Pricing Model (Phase 3 SaaS):**

| Plan | Price | Users | Key Features |
|------|-------|-------|-------------|
| Starter | $149/mo | 1 | All calculators, HTS lookup, 5 saved calculations |
| Professional | $399/mo | 3 | FTZ modeler, shipment tracking, AI agents, unlimited saved |
| Business | $799/mo | 10 | API access, team features, compliance center, priority support |
| Enterprise | Custom | Unlimited | White-label, dedicated CSM, SLA |

**Target Unit Economics:**
- CAC: $400-$800 (content marketing + outbound)
- LTV (Professional): $399/mo × 24 months avg = $9,576
- LTV:CAC ratio target: >10:1

---

### 5. Financial Model
**Document:** `.planning/prds/FINANCIAL-MODEL.md` (AI-5413, 1180+ lines)

**Development Cost Estimate:**

| Phase | Effort | Cost |
|-------|--------|------|
| Phase 1: Proposal Site (PRDs 01-05) | 40 hours | $8,000 |
| Phase 2: Planning | 20 hours | $4,000 |
| Phase 3: Platform MVP (PRDs APP-01 to APP-09) | 200 hours | $40,000 |
| Phase 4: AI Agents + Data Pipeline | 80 hours | $16,000 |
| **Total** | **340 hours** | **$68,000** |

**Infrastructure Costs (Monthly at Launch):**

| Service | Monthly Cost |
|---------|-------------|
| Vercel Pro | $20 |
| Neon PostgreSQL | $19 |
| Anthropic API (~10K requests/mo) | $50-150 |
| Email (Resend) | $20 |
| **Total** | **~$110-210/mo** |

**Revenue Projections (Conservative):**

| Month | Customers | MRR |
|-------|-----------|-----|
| 1-5 | 0 | $0 |
| 6 | 5 | $2,000 |
| 9 | 20 | $8,000 |
| 12 | 50 | $20,000 |
| 18 | 120 | $48,000 |
| 24 | 250 | $100,000 |

**Break-Even Analysis:**
- Monthly agency burn: ~$15,000
- Monthly infra: ~$150
- Break-even MRR: $15,150
- Break-even customer count: ~38 Professional plan customers
- Break-even timeline: Month 10-12 if growth targets met

---

## Cross-Workstream Dependencies

```
Technical Architecture
  └── Required by: Data Pipeline (DB schema), AI Agents (API routes), GTM (SaaS pricing justification)

Data Pipeline
  └── Feeds: HTS Lookup → Landed Cost → FTZ Modeler (all depend on live duty rates)
  └── Enables: AI Agent 1 (HTS Classification needs live duty rate data)
  └── Enables: AI Agent 3 (Tariff Alerts monitor against user's tracked HTS codes)

AI Agents
  └── Depend on: Data Pipeline operational (HTS + FTZ data in DB)
  └── Depend on: Auth system (rate limiting per org)
  └── Drive: GTM differentiation (AI features justify Professional/Business pricing)

GTM Strategy
  └── Informs: Financial Model (pricing tiers, CAC/LTV assumptions, revenue projections)
  └── Validates: Technical Architecture scope (which features justify which pricing tier)

Financial Model
  └── Gate for: Phase 3 implementation budget approval
  └── Informs: Data Pipeline vendor decisions (buy vs. build for HTS/vessel data)
```

**Critical Path:** Auth system → Data pipeline → Core calculators → AI agents → SaaS launch

---

## Phase 2 Completion Criteria

All the following must be complete before Phase 3 implementation begins:

### Planning Artifacts (All Complete)
- [x] PRD-01: Landing Page
- [x] PRD-02: Unit Economics Calculator
- [x] PRD-03: FTZ Savings Analyzer (static)
- [x] PRD-04: Route Comparison Tool
- [x] PRD-05: Shipping Map
- [x] PRD-APP-01: Authentication & Registration
- [x] PRD-APP-02: Onboarding Wizard
- [x] PRD-APP-03: HTS Code Lookup
- [x] PRD-APP-04: Landed Cost Calculator (Full)
- [x] PRD-APP-05: FTZ Savings Modeler (Full)
- [x] PRD-APP-06: Route Comparison (Full)
- [x] PRD-APP-07: Container Utilization Calculator
- [x] PRD-APP-08: Executive Dashboard
- [x] PRD-APP-09: Shipment List & Tracking
- [x] Technical Architecture (AI-5409)
- [x] Data Pipeline Design (AI-5410)
- [x] AI Agent Plans (AI-5411)
- [x] GTM Strategy (AI-5412)
- [x] Financial Model (AI-5413)
- [x] Product Roadmap (AI-5408)
- [x] Cross-workstream dependency map
- [x] Critical gate decisions documented
- [x] Risk register compiled

### Pre-Phase 3 Gates (Pending)
- [ ] **Decision 1:** Auth provider confirmed (Custom JWT vs. NextAuth v5 vs. Clerk)
- [ ] **Decision 6:** Multi-tenant architecture confirmed (row-level security from day one — recommended yes)
- [ ] USITC HTS database download tested and accessible at hts.usitc.gov
- [ ] Founder kickoff meeting completed — core assumptions validated
- [ ] Phase 3 sprint plan created in Linear

---

## Transition Plan to Phase 3

### Recommended Sprint Structure

| Sprint | Weeks | Deliverables |
|--------|-------|-------------|
| Sprint 1 — Foundation | 9-10 | Project scaffolding, auth system (PRD-APP-01), shared component library, core DB schema |
| Sprint 2 — Data Pipeline | 11-12 | HTS ingestion script, FTZ data ingestion, port codes reference, `/api/hts/*` + `/api/ftz/*` endpoints, PRD-APP-03 |
| Sprint 3 — Core Calculators | 13-14 | Onboarding wizard, Landed Cost calc, FTZ Modeler, Container Utilization calc |
| Sprint 4 — Operations | 15-16 | Shipment List & Tracking, Route Comparison (Full), Executive Dashboard |
| Sprint 5 — AI Agents | 17-18 | HTS Classification Agent, Tariff Alert Agent (cron), Compliance Checklist Generator |
| Sprint 6 — Polish & Launch | 19-20 | Route Optimization Agent, E2E tests (Playwright), performance optimization, beta onboarding |

### Handoff Checklist (Planning → Implementation)

1. All 14 PRDs reviewed and acceptance criteria agreed by Julian and founder
2. Linear issues created for each Phase 3 sprint
3. Phase 3 kickoff meeting scheduled with founder
4. Development environment provisioned (Neon DB, Vercel project, env vars set)
5. GitHub repo initialized with Next.js 14 App Router template
6. Decisions 1 (auth) and 6 (multi-tenant) documented in PROJECT.md before Sprint 1

---

## Risk Register (Top 5)

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|-----------|
| 1 | USITC HTS data not machine-readable or download blocked | Medium | High — kills data pipeline plan | Test download before Sprint 2; fallback: purchase Tariff.io API ($200-500/mo) |
| 2 | Founder disengages before platform beta | Medium | High — primary user gone, no case study | Lock in LOI/pilot commitment during proposal site phase; show clear ROI |
| 3 | Tariff volatility makes FTZ savings projections stale | High (current political climate) | Medium — erodes confidence in calculators | Always display "Rate as of [date]"; rebuild FTZ calc to accept manual rate input |
| 4 | SaaS pricing doesn't match willingness-to-pay | Medium | High — revenue model invalid | Conduct 10 discovery calls before pricing launch; start with usage-based option |
| 5 | Multi-tenant architecture not scoped from day one | Medium | High — expensive retrofit | Enforce org_id on all DB tables in Sprint 1 schema; RLS policies from day one |

---

## Success Metrics for Launch (Month 6-12)

### Platform Adoption
- 5+ active beta users by end of Phase 3 (Month 5-6)
- NPS > 50 from beta cohort
- Weekly active usage by founder within 30 days of launch

### Revenue
- $2,000 MRR by Month 6 (soft launch)
- $8,000 MRR by Month 9
- $15,000+ MRR by Month 12 (break-even)

### Product Quality
- LCP < 2.5s on all calculator pages
- Zero calculation errors on decimal arithmetic
- HTS lookup returns results in < 500ms (p95)
- All AI agent responses include compliant disclaimer copy

### GTM
- 10 qualified discovery calls completed before pricing finalization
- 3 written case studies from beta users
- Content marketing producing 5+ organic leads/month by Month 9

---

## Related Documents

| Document | Location | Linear |
|----------|----------|--------|
| Full Phase 2 Planning Summary | `.planning/prds/PHASE-2-PLANNING-SUMMARY.md` | AI-5407 |
| Technical Architecture | `.planning/prds/TECHNICAL-ARCHITECTURE.md` | AI-5409 |
| Data Pipeline Design | `.planning/prds/DATA-PIPELINE.md` | AI-5410 |
| AI Agent Plans | `.planning/prds/AI-AGENT-PLANS.md` | AI-5411 |
| GTM Strategy | `.planning/prds/GTM-STRATEGY.md` | AI-5412 |
| Financial Model | `.planning/prds/FINANCIAL-MODEL.md` | AI-5413 |
| Product Roadmap | `.planning/prds/PRODUCT-ROADMAP.md` | AI-5408 |
| Project Context | `.planning/PROJECT.md` | — |
| Research Directory | `.planning/research/` | — |

---

*Phase 2 planning complete. All workstreams documented. Ready for Phase 3 gate review and implementation kickoff.*
