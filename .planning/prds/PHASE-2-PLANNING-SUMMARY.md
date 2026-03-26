# Phase 2 Planning Summary — Shipping Savior

**Linear Issue:** [AI-5407](https://linear.app/ai-acrobatics/issue/AI-5407/phase-2-planning-architecture-pipeline-ai-agents-gtm-financial)
**Phase:** 2 — Architecture, Pipeline, AI Agents, GTM, Financial
**Timeline:** Weeks 5–8
**Status:** Planning Complete → Ready for Phase 3 Implementation
**Last Updated:** 2026-03-26

---

## Executive Summary

Phase 2 delivers the full technical and business blueprint for Shipping Savior — a comprehensive logistics intelligence platform targeting freight brokers, importers, and supply chain operators. The platform's core value proposition is systematizing manual freight brokerage workflows through a suite of calculators, data pipelines, AI-assisted intelligence, and a rich operational dashboard.

The planning phase establishes:

- **9 full-stack application PRDs** covering auth, onboarding, HTS lookup, landed cost, FTZ modeling, route comparison, container optimization, executive dashboard, and shipment management
- **5 proposal-phase PRDs** covering landing page, unit economics, FTZ analyzer (static), route comparison, and interactive shipping map
- A complete technical architecture grounded in Next.js 14 (App Router), PostgreSQL (Neon), Drizzle ORM, and Vercel
- A data pipeline strategy for HTS codes, FTZ zone data, vessel schedules, and port statistics — all sourced from public datasets
- A clear differentiation from incumbent platforms (Freightos, Flexport, Xeneta) through FTZ-native strategy, cold chain specialization, and local calculation engines

The platform targets the founder's immediate operational needs while building toward a SaaS offering for other freight brokers and importers in the cold chain and SE Asia import verticals.

---

## Sub-Planning Documents Index

### Proposal Phase PRDs (Phase 1 — Build first, validate with partners)

| Document | Route | Status | Priority |
|----------|-------|--------|----------|
| [PRD-01: Landing / Proposal Page](./PRD-01-landing.md) | `/` | Draft | P0 |
| [PRD-02: Unit Economics Calculator](./PRD-02-unit-economics.md) | `/tools/unit-economics` | Draft | P0 |
| [PRD-03: FTZ Savings Analyzer (Static)](./PRD-03-ftz-analyzer.md) | `/tools/ftz-analyzer` | Draft | P0 |
| [PRD-04: Route Comparison Tool](./PRD-04-route-comparison.md) | `/tools/route-comparison` | Draft | P1 |
| [PRD-05: Shipping Map](./PRD-05-shipping-map.md) | `/map` | Draft | P1 |

### Full Application PRDs (Phase 3 — Post-validation platform build)

| Document | Route | Status | Priority |
|----------|-------|--------|----------|
| PRD-APP-01: Authentication & Registration | `/login`, `/register` | Draft | P0 |
| PRD-APP-02: Onboarding Wizard | `/onboarding` | Draft | P0 |
| PRD-APP-03: HTS Code Lookup | `/tools/hts-lookup` | Draft | P0 |
| PRD-APP-04: Landed Cost Calculator (Full) | `/tools/landed-cost` | Draft | P0 |
| PRD-APP-05: FTZ Savings Modeler (Full) | `/tools/ftz-modeler` | Draft | P0 |
| PRD-APP-06: Route Comparison (Full) | `/tools/routes` | Draft | P1 |
| PRD-APP-07: Container Utilization Calculator | `/tools/container-calc` | Draft | P1 |
| PRD-APP-08: Executive Dashboard | `/dashboard` | Draft | P0 |
| PRD-APP-09: Shipment List & Tracking | `/shipments` | Draft | P1 |

### Supporting Planning Documents

#### Phase 2 Architecture & Strategy Documents

| Document | Linear | Purpose |
|----------|--------|---------|
| [TECHNICAL-ARCHITECTURE.md](./TECHNICAL-ARCHITECTURE.md) | AI-5409 | Full-stack architecture: Next.js 14, Neon/Drizzle, auth, maps, deployment |
| [DATA-PIPELINE.md](./DATA-PIPELINE.md) | AI-5410 | HTS tariff ingestion, FTZ data, carrier schedules, port statistics pipeline |
| [AI-AGENT-PLANS.md](./AI-AGENT-PLANS.md) | AI-5411 | 4 AI agents: HTS classification, route optimization, tariff alerts, compliance |
| [GTM-STRATEGY.md](./GTM-STRATEGY.md) | AI-5412 | Target segments, GTM phases, positioning, pricing model, CAC/LTV targets |
| [FINANCIAL-MODEL.md](./FINANCIAL-MODEL.md) | AI-5413 | Dev cost estimates, infra costs, 18-month revenue projections, break-even |
| [PRODUCT-ROADMAP.md](./PRODUCT-ROADMAP.md) | AI-5408 | Sprint structure, feature prioritization, Phase 3 implementation roadmap |

#### Project Context & Research

| Document | Purpose |
|----------|---------|
| `.planning/PROJECT.md` | Core project context, founder operations, constraints, key decisions |
| `.planning/research/` | Shipping ecosystem map, SE Asia market analysis, public data sources inventory |
| `.planning/diagrams/` | Architecture diagrams, data flow visualizations |
| `.planning/config.json` | Project configuration and metadata |

---

## Technical Architecture Summary

### Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14 App Router + TypeScript | Agency standard; server components for SEO and performance |
| Styling | Tailwind CSS | Consistent with agency portfolio |
| Database | PostgreSQL on Neon | Serverless, scales to zero, agency standard |
| ORM | Drizzle ORM | Type-safe, migration-first, works with Neon |
| Auth | Custom JWT (bcrypt + httpOnly cookies) | No third-party auth dependency; access + refresh token rotation |
| Maps | deck.gl (ScatterplotLayer, PathLayer) | Handles 260+ FTZ zones and global port markers efficiently |
| Charts | Recharts | Lightweight, React-native, sufficient for the use cases |
| Calculations | decimal.js | Mandatory for all financial arithmetic — no native floating-point |
| URL State | nuqs | Shareable calculator URLs |
| Data Tables | @tanstack/react-table | Sortable/filterable withdrawal timelines |
| Deployment | Vercel | Agency standard; Edge Functions for rate limiting |
| Rate Limiting | Vercel KV | Auth endpoint protection |

### Application Structure

```
app/
  (public)/         # Landing page, tools (no auth required)
  (auth)/           # Login, register, reset-password
  (app)/            # Authenticated platform (dashboard, tools, shipments)
  api/              # API routes (auth, calculators, ftz, hts, dashboard)
components/
  landing/          # Proposal page sections
  calculators/      # Shared calculation UI components
  dashboard/        # Dashboard widgets
  shipments/        # Shipment list and detail
  shared/           # Reusable UI primitives
lib/
  calculators/      # Pure calculation functions (unit-economics.ts, ftz-savings.ts, etc.)
  db/               # Drizzle schema and query functions
  auth/             # Session management, middleware
  data/             # Static data loaders (FTZ zones, port codes, HTS snapshots)
data/               # JSON data files (ftz-locations.json, port-codes.json, etc.)
```

### Key Architectural Decisions

1. **Local calculation engine over API calls:** All financial math runs client-side with decimal.js. No per-query API costs, no latency, no external dependency for the core value proposition.
2. **Server Components first:** Only interactive sections (calculators, maps, charts) use `"use client"`. Static content is server-rendered for performance.
3. **URL state sync for all calculators:** All calculator inputs serialize to URL via `nuqs`. Users can share and bookmark specific calculations.
4. **Proposal site first, platform second:** Phase 1 ships a polished static proposal site. Phase 3 builds the authenticated SaaS platform. This de-risks the build by validating the concept before full infrastructure investment.

---

## Data Pipeline Design

### Data Sources and Ingestion

| Dataset | Source | Update Frequency | Storage |
|---------|--------|-----------------|---------|
| HTS Code Database | USITC (hts.usitc.gov) | Quarterly (synchronized with tariff schedule releases) | PostgreSQL `hts_codes` table |
| Historical HTS Rates | USITC historical snapshots | Append-only (new snapshots at each tariff change) | PostgreSQL `hts_codes_historical` |
| FTZ Zone Data | OFIS database (data.gov) | Annual (FTZ Annual Reports + Board orders) | PostgreSQL `ftz_zones`, JSON cache |
| FTZ Subzones | FTZ Board orders (Federal Register) | On new orders | PostgreSQL `ftz_subzones` |
| Port Codes | UN/LOCODE + CBP port schedule | Annual | Static JSON (`data/port-codes.json`) |
| Vessel Schedules | Carrier public schedules (MSC, Maersk, etc.) | Weekly scrape | Static JSON + PostgreSQL `vessel_schedules` |
| Port Statistics | Bureau of Transportation Statistics | Monthly | PostgreSQL `port_stats` |
| SE Asia Trade Data | US Census Bureau FT-900 | Monthly | PostgreSQL `trade_stats` |

### Pipeline Architecture

```
External Sources
    │
    ▼
Ingest Scripts (Node.js CLI, run manually or via Vercel Cron)
    │
    ├── scripts/sync-hts.ts      # Download + parse USITC HTS XML
    ├── scripts/sync-ftz.ts      # Download + parse OFIS FTZ data
    ├── scripts/sync-vessels.ts  # Scrape carrier schedule pages
    └── scripts/sync-ports.ts    # Update port code reference data
    │
    ▼
PostgreSQL (Neon)
    │
    ▼
API Routes
    ├── /api/hts/search          # HTS code lookup with duty rates
    ├── /api/hts/rate-history    # Historical rate lookup by date
    ├── /api/ftz/zones           # FTZ zone list and detail
    └── /api/vessels/schedules   # Vessel schedule query
    │
    ▼
Client Calculators (decimal.js)
```

### Data Freshness Strategy

- **HTS codes:** Stale data is dangerous (tariff changes). Every HTS rate display includes "Rate as of [date]" with link to USITC. Quarterly sync minimum; manual trigger on known tariff events.
- **FTZ zones:** Changes slowly. Annual sync sufficient. Cached at CDN edge.
- **Vessel schedules:** Phase 1 uses published weekly schedules. Phase 3 adds real carrier API integrations.
- **Port statistics:** Used for dashboard analytics only. Monthly update via cron.

---

## AI Agent Development Plans

### Phase 1 AI: Static Intelligence (Proposal Site)

No AI agents required for the proposal site. All calculations are deterministic.

### Phase 3 AI: Intelligent Platform Features

#### Agent 1 — HTS Classification Assistant

- **Purpose:** Suggest HTS codes from natural language product descriptions
- **Model:** Claude 3.5 Sonnet via Anthropic API
- **Input:** Product description, country of origin, materials, intended use
- **Output:** Top 3 HTS code suggestions with confidence scores and duty rates
- **Context window:** Product description + HTS code database excerpt (top candidates from vector search)
- **Human oversight:** User must confirm HTS code selection; tool never auto-submits
- **Compliance note:** "This is a suggestion only. Final HTS classification must be confirmed by a licensed customs broker."

#### Agent 2 — Route Optimization Agent

- **Purpose:** Analyze multiple shipping options and recommend optimal route considering cost, transit time, reliability, and backhaul availability
- **Model:** Claude 3.5 Sonnet
- **Input:** Origin port, destination port, commodity type, timeline constraints, cost priority vs. speed priority
- **Output:** Ranked route options with narrative explanation of tradeoffs
- **Context window:** Route comparison data + historical carrier performance + current vessel schedules
- **Trigger:** User requests "Recommend route" in the Route Comparison tool

#### Agent 3 — Tariff Alert Agent (Async)

- **Purpose:** Monitor Federal Register and USTR publications for tariff changes affecting the user's products
- **Model:** Claude 3 Haiku (cost-efficient for monitoring)
- **Input:** User's tracked HTS codes and countries of origin
- **Output:** Email/notification with plain-language summary of tariff changes and impact estimate
- **Trigger:** Daily cron job; scans new Federal Register entries
- **Human oversight:** Alerts are informational only; no automated actions

#### Agent 4 — Compliance Checklist Generator

- **Purpose:** Generate a product-specific import compliance checklist (documentation requirements, FDA registration, CPSC requirements, labeling rules)
- **Model:** Claude 3.5 Sonnet
- **Input:** HTS code, country of origin, product description, US port of entry
- **Output:** Ordered checklist with deadlines, required documents, agency contacts
- **Context window:** Compliance knowledge base (structured regulatory requirements by HTS chapter)
- **Trigger:** User creates a new shipment or requests compliance check

### AI Infrastructure Requirements

- **Anthropic API key** stored in environment variables (never in code)
- **Rate limiting:** AI endpoints rate-limited separately (10 req/min per org for HTS agent, 5 req/min for route agent)
- **Streaming:** Use streaming responses for the route optimization agent (long narrative outputs)
- **Cost controls:** Log all AI API calls with token counts; alert if monthly spend exceeds threshold
- **Fallback:** If AI API unavailable, fall back to non-AI mode with reduced feature set (calculators still work)

---

## Go-to-Market Strategy

### Target Segments (Priority Order)

1. **The Founder (Immediate):** The primary user of the proposal site and platform. The platform solves his exact operational problems — freight brokerage automation, FTZ strategy, SE Asia import planning.

2. **Cold Chain Freight Brokers:** Independent freight brokers specializing in temperature-controlled cargo. Pain points: manual research, inability to show customers savings projections, no FTZ expertise.

3. **SE Asia Importers:** Small-to-mid-sized importers sourcing from Vietnam, Thailand, Indonesia, Malaysia. Pain points: duty cost uncertainty, no FTZ access, opaque landed cost calculations.

4. **Logistics Managers at Mid-Market Companies:** In-house logistics staff at companies spending $500K-$5M/year on freight. Pain points: no visibility into FTZ savings potential, manual route comparison, reactive tariff management.

### GTM Phases

#### Phase 1: Prove It (Weeks 1-8 — Proposal Site Live)
- Launch the interactive proposal site as a founder presentation tool
- Share via URL in meetings with: potential partners, Lineage terminal contacts, SE Asia sourcing partners
- Goal: 10 qualified conversations, 3 LOIs or pilot commitments

#### Phase 2: Early Adopters (Weeks 9-20 — Platform Beta)
- Invite 5-10 freight brokers and importers to closed beta
- Onboarding call included; white-glove setup
- Goal: weekly active users, NPS > 50, 3 case studies
- Pricing: free during beta

#### Phase 3: SaaS Launch (Months 6-12)
- Public launch with self-serve registration and 14-day free trial
- Content marketing: tariff guides, FTZ explainers, SE Asia sourcing reports
- Goal: 50 paying customers, $15K MRR

### Positioning

**Primary:** "The only logistics intelligence platform built around FTZ strategy and cold chain operations."

**Against Freightos/Flexport:** Those platforms focus on freight booking (marketplace model). Shipping Savior focuses on financial intelligence — what does it cost, how do I reduce duties, what's the optimal route strategy.

**Against Xeneta:** Xeneta sells market rate benchmarking (requires carrier data contracts). Shipping Savior is self-serve with local calculation engines.

### Pricing Model (Phase 3 SaaS)

| Plan | Price | Users | Features |
|------|-------|-------|---------|
| Starter | $149/mo | 1 | All calculators, HTS lookup, 5 saved calculations |
| Professional | $399/mo | 3 | Starter + FTZ modeler, shipment tracking, AI agents, unlimited saved |
| Business | $799/mo | 10 | Professional + API access, team features, compliance center, priority support |
| Enterprise | Custom | Unlimited | Business + white-label, dedicated CSM, SLA |

**Annual discount:** 20% off for annual commitment.

**Target unit economics:**
- CAC: $400-$800 (content marketing + outbound to freight brokers)
- LTV (Professional): $399/mo × 24 months avg = $9,576
- LTV:CAC ratio target: > 10:1

---

## Financial Model

### Development Cost Estimate

| Phase | Effort | Cost (Agency Rates) |
|-------|--------|-------------------|
| Phase 1: Proposal Site (PRDs 01-05) | 40 hours | $8,000 |
| Phase 2: Planning (AI-5407) | 20 hours | $4,000 |
| Phase 3: Platform MVP (PRDs APP-01 to APP-09) | 200 hours | $40,000 |
| Phase 4: AI Agents + Data Pipeline | 80 hours | $16,000 |
| **Total Development** | **340 hours** | **$68,000** |

### Infrastructure Costs (Monthly at Launch)

| Service | Cost |
|---------|------|
| Vercel Pro | $20 |
| Neon PostgreSQL | $19 (Launch plan) |
| Anthropic API (estimated 10K requests/mo) | $50-150 |
| Vercel KV (rate limiting) | $0 (free tier sufficient) |
| Email (Resend) | $20 |
| **Total Infrastructure** | **~$110-210/mo** |

### Revenue Projections (Conservative)

| Month | Customers | MRR | Notes |
|-------|-----------|-----|-------|
| 1-5 | 0 | $0 | Proposal + beta (free) |
| 6 | 5 | $2,000 | Soft launch |
| 9 | 20 | $8,000 | Content marketing kicks in |
| 12 | 50 | $20,000 | Referral flywheel |
| 18 | 120 | $48,000 | — |
| 24 | 250 | $100,000 | Profitable |

### Break-Even Analysis

- Monthly burn at development pace: ~$15,000 (agency time)
- Monthly infrastructure: ~$150
- Break-even MRR: $15,150
- Break-even customer count: ~38 Professional plan customers
- Break-even timeline: Month 10-12 if growth targets met

---

## Cross-Document Dependency Map

```
PRD-01 (Landing)
  └── Embeds mini PRD-02 calculator
  └── Links to PRD-03 (FTZ Analyzer)
  └── References PRD-04, PRD-05 tool pages

PRD-02 (Unit Economics)
  └── Shares lib/calculators/unit-economics.ts with PRD-APP-04
  └── Feeds product cost inputs to PRD-03

PRD-03 (FTZ Analyzer — Static)
  └── Static version of PRD-APP-05 (FTZ Modeler — Full)
  └── Feeds duty rates from PRD-APP-03 (HTS Lookup)

PRD-APP-01 (Auth)
  └── Required by all PRD-APP-02 through PRD-APP-09
  └── JWT middleware gates all /app routes

PRD-APP-02 (Onboarding)
  └── Runs after PRD-APP-01 registration
  └── Sets up initial org configuration for PRD-APP-08 (Dashboard)

PRD-APP-03 (HTS Lookup)
  └── Feeds duty rates into PRD-APP-04, PRD-APP-05, PRD-APP-06
  └── Used by AI Agent 1 (HTS Classification)

PRD-APP-04 (Landed Cost)
  └── Depends on PRD-APP-03 for duty rate
  └── Results stored in saved_calculations (read by PRD-APP-08)

PRD-APP-05 (FTZ Modeler — Full)
  └── Depends on PRD-APP-03 for historical HTS rates
  └── Depends on FTZ zone data pipeline
  └── Results stored in ftz_entries, ftz_withdrawals

PRD-APP-08 (Executive Dashboard)
  └── Aggregates: PRD-APP-04 (costs), PRD-APP-09 (shipments)
  └── Powered by /api/dashboard/kpis, /api/dashboard/trends
  └── Shows activity from all modules

PRD-APP-09 (Shipment List)
  └── Depends on PRD-APP-01 (auth)
  └── Shipment positions feed PRD-APP-08 mini-map
```

---

## Critical Decisions Required Before Phase 3

The following decisions must be made and documented in PROJECT.md before development begins:

### Decision 1: Authentication Provider
- **Options:** (A) Custom JWT implementation as specified in PRD-APP-01, (B) NextAuth v5, (C) Clerk
- **Recommendation:** Custom JWT for full control and no third-party dependency — especially important for compliance and data sovereignty
- **Decision needed by:** Start of Phase 3 Sprint 1
- **Owner:** Julian / Founder

### Decision 2: HTS Data Synchronization Strategy
- **Options:** (A) Manual sync quarterly + on-demand, (B) Automated Vercel Cron weekly, (C) Third-party tariff data API (e.g., Tariff.io)
- **Recommendation:** Option A for Phase 3 MVP (low complexity); migrate to Option C if tariff volatility remains high
- **Decision needed by:** Phase 3 Sprint 2 (Data Pipeline sprint)
- **Owner:** Julian

### Decision 3: Vessel Schedule Data Source
- **Options:** (A) Scrape carrier schedule pages (fragile), (B) Marine Traffic API (paid), (C) SeaRates API (paid), (D) Static weekly-updated JSON (Phase 3 scope only)
- **Recommendation:** Option D for Phase 3 MVP to avoid API cost and complexity; re-evaluate at $10K MRR
- **Decision needed by:** Phase 3 Sprint 2
- **Owner:** Julian

### Decision 4: AI Agents — Build vs. Buy
- **Options:** (A) Build direct Anthropic API integrations, (B) Use LangChain/LangGraph framework, (C) Use hosted agent platform (e.g., Dust, Relevance AI)
- **Recommendation:** Option A — direct Anthropic API. No framework overhead; full control; agents in Phase 3 are simple enough that a framework adds complexity without value
- **Decision needed by:** Phase 3 Sprint 4 (AI sprint)
- **Owner:** Julian

### Decision 5: SaaS Pricing Validation
- **Question:** Are the proposed pricing tiers validated against willingness-to-pay in the target segment?
- **Action required:** Conduct 10 discovery calls with freight brokers and importers before locking pricing
- **Decision needed by:** Month 4 (before Phase 3 SaaS launch planning)
- **Owner:** Julian / Founder

### Decision 6: Multi-Tenant Data Architecture
- **Question:** Does Phase 3 MVP need organization-level data isolation (row-level security) from day one?
- **Recommendation:** Yes — implement org_id scoping on all database tables from the start; retrofitting is expensive
- **Decision needed by:** Phase 3 Sprint 1
- **Owner:** Julian

---

## Open Questions and Assumptions

### Open Questions

1. **Founder's timeline:** Is the founder ready to engage with a beta platform by Month 5-6, or does the proposal site need to generate partner interest first?
2. **FTZ zone data completeness:** The OFIS database is comprehensive but may have gaps in subzone and operator contact data. Is "best effort" acceptable, or must all 260+ zones have complete detail?
3. **Historical HTS rates:** USITC maintains historical tariff schedules, but automated lookup requires scraping or a third-party service. What's the budget for data acquisition?
4. **Vessel AIS tracking:** Is real-time vessel position tracking (via MarineTraffic API) in scope for Phase 3, or is schedule-based ETA sufficient?
5. **Cold chain + general cargo split:** Does the platform need to handle perishable-specific compliance (FDA prior notice, temperature documentation) in Phase 3, or is general import compliance sufficient?
6. **SE Asia market specifics:** Which countries are the primary sourcing targets? Vietnam, Thailand, Indonesia? Tariff rates, FTAs, and compliance requirements differ significantly by country.
7. **Existing tech stack:** Does the founder have any existing tools (TMS, ERP, customs broker software) that the platform needs to integrate with or export data to?

### Assumptions (Need Validation)

| Assumption | Risk if Wrong | Validation Method |
|-----------|--------------|-------------------|
| The founder's freight brokerage presents 3 shipping options per customer (from PROJECT.md context) | If workflow differs, route comparison tool design changes | Confirm with founder in kickoff meeting |
| 500K+ small units per 40ft container is achievable for the target product categories | Affects unit economics defaults and container calc | Verify with freight forwarder or carrier |
| FTZ duty locking provides meaningful savings at current tariff rates (post-2025 executive orders) | If rates equalized, FTZ cash flow benefit is the only differentiator | Model with current USITC rates before shipping |
| The USITC HTS database is freely downloadable in machine-readable format | Affects data pipeline complexity | Test download at hts.usitc.gov before Phase 3 Sprint 2 |
| No live carrier API integrations needed for Phase 3 MVP | If founder requires real schedule data, integration cost increases significantly | Confirm scope with founder |
| Target customers are comfortable with SaaS pricing ($149-$399/mo) | If not, may need to consider usage-based or per-shipment pricing | Conduct 10 discovery calls before pricing finalization |

---

## Phase 2 Completion Checklist

### Planning Artifacts

- [x] PRD-01: Landing Page — Draft complete
- [x] PRD-02: Unit Economics Calculator — Draft complete
- [x] PRD-03: FTZ Savings Analyzer (static) — Draft complete
- [x] PRD-04: Route Comparison Tool — Draft complete
- [x] PRD-05: Shipping Map — Draft complete
- [x] PRD-APP-01: Authentication & Registration — Draft complete
- [x] PRD-APP-02: Onboarding Wizard — Draft complete
- [x] PRD-APP-03: HTS Code Lookup — Draft complete
- [x] PRD-APP-04: Landed Cost Calculator (Full) — Draft complete
- [x] PRD-APP-05: FTZ Savings Modeler (Full) — Draft complete
- [x] PRD-APP-06: Route Comparison (Full) — Draft complete
- [x] PRD-APP-07: Container Utilization Calculator — Draft complete
- [x] PRD-APP-08: Executive Dashboard — Draft complete
- [x] PRD-APP-09: Shipment List & Tracking — Draft complete
- [x] Technical Architecture — [TECHNICAL-ARCHITECTURE.md](./TECHNICAL-ARCHITECTURE.md) (AI-5409) — 1500+ lines
- [x] Data Pipeline Design — [DATA-PIPELINE.md](./DATA-PIPELINE.md) (AI-5410) — 1700+ lines
- [x] AI Agent Plans — [AI-AGENT-PLANS.md](./AI-AGENT-PLANS.md) (AI-5411) — 1450+ lines
- [x] GTM Strategy — [GTM-STRATEGY.md](./GTM-STRATEGY.md) (AI-5412) — 1330+ lines
- [x] Financial Model — [FINANCIAL-MODEL.md](./FINANCIAL-MODEL.md) (AI-5413) — 1180+ lines
- [x] Product Roadmap — [PRODUCT-ROADMAP.md](./PRODUCT-ROADMAP.md) (AI-5408) — 1150+ lines
- [x] Cross-document dependency map — Documented in this summary
- [x] Critical decisions identified — 6 decisions documented above
- [x] Open questions logged — 7 questions documented above
- [x] Phase 2 Planning Summary — This document

### Pre-Phase 3 Gates

- [ ] Decision 1 (Auth provider) resolved
- [ ] Decision 6 (Multi-tenant architecture) resolved
- [ ] USITC HTS download tested and confirmed accessible
- [ ] Founder kickoff meeting completed — assumptions validated
- [ ] Phase 3 sprint plan created in Linear

---

## Transition Plan: Phase 2 → Phase 3 Implementation

### Phase 3 Sprint Structure (Recommended)

#### Sprint 1 — Foundation (Weeks 9-10)
- Project scaffolding (Next.js 14 App Router, Drizzle ORM, Neon connection)
- Authentication system (PRD-APP-01)
- Shared component library (Button, Input, Card, Toast primitives)
- Database schema: users, organizations, sessions, hts_codes, ftz_zones

#### Sprint 2 — Data Pipeline (Weeks 11-12)
- HTS code database ingestion script
- FTZ zone data ingestion script
- Port codes reference data
- `/api/hts/search` and `/api/ftz/zones` endpoints
- PRD-APP-03: HTS Code Lookup page (depends on data pipeline)

#### Sprint 3 — Core Calculators (Weeks 13-14)
- PRD-APP-02: Onboarding Wizard
- PRD-APP-04: Landed Cost Calculator (Full)
- PRD-APP-05: FTZ Savings Modeler (Full)
- PRD-APP-07: Container Utilization Calculator

#### Sprint 4 — Operations (Weeks 15-16)
- PRD-APP-09: Shipment List & Tracking
- PRD-APP-06: Route Comparison (Full)
- PRD-APP-08: Executive Dashboard
- Activity feed and KPI aggregation

#### Sprint 5 — AI Agents (Weeks 17-18)
- AI Agent 1: HTS Classification Assistant
- AI Agent 3: Tariff Alert Agent (async, cron-based)
- AI Agent 4: Compliance Checklist Generator

#### Sprint 6 — Polish & Launch (Weeks 19-20)
- AI Agent 2: Route Optimization Agent
- E2E testing (Playwright)
- Performance optimization (LCP targets)
- Beta user onboarding
- Monitoring and alerting setup

### Handoff Checklist (Planning → Implementation)

1. All PRD documents reviewed by Julian and founder — acceptance criteria agreed
2. Linear issues created for each Phase 3 sprint (sub-issues of the Shipping Savior project)
3. Phase 3 kickoff meeting scheduled
4. Development environment provisioned (Neon database, Vercel project, env vars)
5. GitHub repo structure initialized with Next.js 14 template
6. Decisions 1 and 6 documented in PROJECT.md before Sprint 1 starts

---

*This document consolidates the Phase 2 planning work for Shipping Savior (AI-5407). It is the authoritative reference for transitioning into Phase 3 implementation.*
