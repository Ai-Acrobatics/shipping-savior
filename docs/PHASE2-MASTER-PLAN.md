# Shipping Savior — Phase 2 Master Plan

**Linear:** AI-5455
**Phase:** 2 — Planning (Architecture, Pipeline, AI Agents, GTM, Financial)
**Timeline:** Weeks 5–8
**Status:** Planning Complete — Ready for Phase 3 Gate Review
**Last Updated:** 2026-03-27
**Author:** AI Acrobatics Engineering

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Phase 2 Scope & Deliverables](#2-phase-2-scope--deliverables)
3. [Technical Architecture Overview](#3-technical-architecture-overview)
4. [Data Pipeline Overview](#4-data-pipeline-overview)
5. [AI Agents Development Plan Overview](#5-ai-agents-development-plan-overview)
6. [Go-to-Market Strategy Overview](#6-go-to-market-strategy-overview)
7. [Financial Model Overview](#7-financial-model-overview)
8. [Phase 2 Timeline with Dependencies](#8-phase-2-timeline-with-dependencies)
9. [Resource Requirements](#9-resource-requirements)
10. [Success Criteria for Phase 2 Completion](#10-success-criteria-for-phase-2-completion)
11. [Risk Register](#11-risk-register)
12. [Critical Decisions Before Phase 3](#12-critical-decisions-before-phase-3)
13. [Document Index](#13-document-index)

---

## 1. Executive Summary

Phase 2 delivers the complete technical and business blueprint required to execute the Shipping Savior platform build with confidence. Over Weeks 5–8, the planning effort produced six comprehensive strategy documents, fourteen application PRDs (five for the proposal site, nine for the full SaaS platform), and a cross-document dependency map governing the Phase 3 implementation sequence.

**What Shipping Savior Is:**
A logistics intelligence platform that transforms manual freight brokerage, FTZ duty strategy, and SE Asia import workflows into systematized, data-driven operations. The platform targets small and mid-market importers, exporters, and independent freight brokers who lack the analytical infrastructure of a large logistics enterprise.

**Why Phase 2 Matters:**
The founder already operates a live freight brokerage handling ~$2.1M GMV annually at 96–97% of Lineage terminal volume. Phase 2 planning ensures that software investment wraps around this existing operation rather than replacing it — maximizing ROI by augmenting what already works.

**Phase 2 Output Summary:**
- 6 strategy and architecture documents (1,150–1,700 lines each)
- 14 full product requirements documents
- Complete 18-month financial model with three scenarios
- GTM strategy with 90-day launch playbook
- 7 AI agent specifications across 3 capability tiers
- 6 pre-Phase 3 critical decisions identified
- Phase 3 sprint structure (6 sprints over 12 weeks) fully planned

**Gate Condition:**
Phase 3 implementation MUST NOT start until Decisions 1 (auth provider) and 6 (multi-tenant architecture) are resolved. All other gate items are tracked in Section 12.

---

## 2. Phase 2 Scope & Deliverables

### Planning Sub-Issues Covered

| Linear ID | Sub-Issue | Status | Document |
|-----------|-----------|--------|----------|
| AI-5408 | Planning — Product Roadmap | Complete | `.planning/prds/PRODUCT-ROADMAP.md` |
| AI-5409 | Planning — Technical Architecture | Complete | `.planning/TECHNICAL-ARCHITECTURE.md` |
| AI-5410 | Planning — Data Pipeline Design | Complete | `.planning/prds/DATA-PIPELINE.md` |
| AI-5411 | Planning — AI Agent Development Plans | Complete | `.planning/prds/AI-AGENT-PLANS.md` |
| AI-5412 | Planning — Go-to-Market Strategy | Complete | `.planning/GO-TO-MARKET.md`, `docs/GTM-STRATEGY.md` |
| AI-5413 | Planning — Financial Model | Complete | `.planning/FINANCIAL-MODEL.md` |

### PRD Suite Produced

**Proposal Site (Phase 1 — builds first):**

| PRD | Route | Priority |
|-----|-------|----------|
| PRD-01: Landing / Proposal Page | `/` | P0 |
| PRD-02: Unit Economics Calculator | `/tools/unit-economics` | P0 |
| PRD-03: FTZ Savings Analyzer (static) | `/tools/ftz-analyzer` | P0 |
| PRD-04: Route Comparison Tool | `/tools/route-comparison` | P1 |
| PRD-05: Shipping Map | `/map` | P1 |

**Full Platform (Phase 3 — post-validation build):**

| PRD | Route | Priority |
|-----|-------|----------|
| PRD-APP-01: Authentication & Registration | `/login`, `/register` | P0 |
| PRD-APP-02: Onboarding Wizard | `/onboarding` | P0 |
| PRD-APP-03: HTS Code Lookup | `/tools/hts-lookup` | P0 |
| PRD-APP-04: Landed Cost Calculator | `/tools/landed-cost` | P0 |
| PRD-APP-05: FTZ Savings Modeler (Full) | `/tools/ftz-modeler` | P0 |
| PRD-APP-06: Route Comparison (Full) | `/tools/routes` | P1 |
| PRD-APP-07: Container Utilization Calculator | `/tools/container-calc` | P1 |
| PRD-APP-08: Executive Dashboard | `/dashboard` | P0 |
| PRD-APP-09: Shipment List & Tracking | `/shipments` | P1 |

---

## 3. Technical Architecture Overview

**Full Document:** `.planning/TECHNICAL-ARCHITECTURE.md` (AI-5409, 1,500+ lines)

### Architecture Decision: Next.js 14 Monolith

Shipping Savior runs as a Next.js 14 App Router monolith deployed on Vercel. The decision against microservices is deliberate and phased:

| Phase | Architecture | Data | Auth |
|-------|-------------|------|------|
| Phase 1 (Proposal) | Monolith, all static | JSON files in `/data/` | None |
| Phase 2 (Platform MVP) | Monolith + Neon DB + Redis | Live gov APIs + DB | Custom JWT |
| Phase 3 (AI Layer) | Monolith + Railway AI workers | Vector search + audit log | JWT + OAuth |

### Core Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14 App Router + TypeScript | Agency standard; RSC for SEO |
| Styling | Tailwind CSS | Consistent with agency portfolio |
| Database | PostgreSQL on Neon | Serverless, scales to zero |
| ORM | Drizzle ORM | Type-safe, migration-first |
| Auth | Custom JWT (bcrypt + httpOnly cookies) | Full control, no third-party dependency |
| Maps | deck.gl | Handles 260+ FTZ zones and global ports |
| Charts | Recharts | Lightweight, React-native |
| Financial Math | decimal.js | Mandatory — no native floating-point for money |
| URL State | nuqs | Shareable calculator URLs |
| Data Tables | @tanstack/react-table | Sortable/filterable data grids |
| Deployment | Vercel | Agency standard |
| Rate Limiting | Vercel KV (Upstash Redis) | Auth endpoint protection |

### Application Directory Structure

```
app/
  (public)/         # Landing page, tools (no auth)
  (auth)/           # Login, register, reset-password
  (app)/            # Authenticated platform
  api/              # Route handlers (auth, calculators, ftz, hts, ai)
components/
  landing/          # Proposal page sections
  calculators/      # Shared calculation UI
  dashboard/        # Dashboard widgets
  shipments/        # Shipment list and detail
  shared/           # Reusable UI primitives
lib/
  calculators/      # Pure calculation functions
  db/               # Drizzle schema + queries
  auth/             # Session management, middleware
  data/             # Static data loaders
data/               # JSON reference files
```

### Key Architectural Decisions

1. **Local calculation engine:** All financial math runs client-side with decimal.js. No per-query API costs, no latency, no external dependency on core value.
2. **Server Components first:** Only interactive UI uses `"use client"`. Static content (knowledge base, tables) is server-rendered.
3. **URL state sync:** All calculator inputs serialize to URL via `nuqs` — users can share and bookmark calculations.
4. **Proposal site first:** Phase 1 validates the concept before full infrastructure investment.

---

## 4. Data Pipeline Overview

**Full Document:** `.planning/prds/DATA-PIPELINE.md` (AI-5410, 1,700+ lines)

### Architecture Philosophy

Three concentric layers that expand across build phases:

```
SERVING LAYER   (API routes, search, calculators)
PROCESSING LAYER (ETL, normalize, enrich, index)
INGESTION LAYER  (connectors, scrapers, schedulers)
                  ↑ 26+ external data sources
```

**Phase 1:** Static JSON seeded with researched real-world data. No live integrations. Full calculator functionality on mock data.
**Phase 2 (Batch):** Real data via cron-based scrapers and REST API connectors. 24-hour freshness on critical data. Government sources (free) first.
**Phase 3 (Real-Time):** AIS vessel tracking, port congestion APIs, live carrier schedule polling. Sub-4-hour freshness on operational data.

### Data Sources by Priority

| Dataset | Source | Frequency | Storage | Priority |
|---------|--------|-----------|---------|----------|
| HTS Code Database | USITC (hts.usitc.gov) | Quarterly | PostgreSQL `hts_codes` | P0 |
| Historical HTS Rates | USITC snapshots | Append-only | PostgreSQL `hts_codes_historical` | P0 |
| FTZ Zone Data | OFIS / data.gov | Annual | PostgreSQL `ftz_zones` + JSON cache | P0 |
| FTZ Subzones | FTZ Board / Federal Register | On new orders | PostgreSQL `ftz_subzones` | P1 |
| Port Codes | UN/LOCODE + CBP | Annual | Static JSON | P1 |
| Vessel Schedules | Carrier public schedules | Weekly scrape | JSON + PostgreSQL | P1 |
| Port Statistics | Bureau of Transportation Stats | Monthly | PostgreSQL `port_stats` | P2 |
| SE Asia Trade Data | US Census FT-900 | Monthly | PostgreSQL `trade_stats` | P2 |

### Pipeline Flow

```
External Sources
    ↓
Ingest Scripts (Node.js CLI / Vercel Cron)
    ├── scripts/sync-hts.ts      # USITC HTS XML
    ├── scripts/sync-ftz.ts      # OFIS FTZ data
    ├── scripts/sync-vessels.ts  # Carrier schedules
    └── scripts/sync-ports.ts    # Port reference data
    ↓
PostgreSQL (Neon)
    ↓
API Routes
    ├── /api/hts/search          # HTS lookup with duty rates
    ├── /api/hts/rate-history    # Historical rate lookup
    ├── /api/ftz/zones           # FTZ zone list + detail
    └── /api/vessels/schedules   # Vessel schedule query
    ↓
Client Calculators (decimal.js)
```

### Data Freshness Rules

- **HTS codes:** Stale data = penalty risk. Every display includes "Rate as of [date]" with USITC link. Quarterly minimum sync; manual trigger on tariff events.
- **FTZ zones:** Annual sync sufficient. CDN edge-cached.
- **Vessel schedules:** Phase 1 uses published weekly schedules; Phase 3 adds carrier API integrations.

---

## 5. AI Agents Development Plan Overview

**Full Document:** `.planning/prds/AI-AGENT-PLANS.md` (AI-5411, 1,450+ lines)

### Design Philosophy: Seven Specialized Agents

A single broad "freight intelligence" agent would be too diffuse to be accurate, expensive on every interaction, and impossible to evaluate rigorously. Seven specialized agents allow domain-specific data, independent evaluation metrics, incremental rollout, and failure isolation.

### Tiered Model Approach

| Tier | Capability | Agents | Stack |
|------|-----------|--------|-------|
| Tier 1 | Semantic search + embeddings | HTS Classification, Document | OpenAI embeddings + vector search |
| Tier 2 | RAG + LLM structured output | Cost Optimization, Compliance, FTZ Strategy | Claude claude-sonnet-4-6 + retrieval |
| Tier 3 | Hybrid ML + LLM | Forecast, Anomaly Detection | XGBoost / time-series + LLM explainer |

### Agent Roadmap

| Agent | Primary Goal | MVP Target | v1 Target |
|-------|-------------|------------|-----------|
| HTS Classification | Auto-classify products to 10-digit HTS codes | Q3 2026 | Q4 2026 |
| Cost Optimization | Route + cost optimization recommendations | Q4 2026 | Q1 2027 |
| Compliance | Real-time regulatory compliance checking | Q4 2026 | Q1 2027 |
| Document | OCR + extraction from shipping documents | Q3 2026 | Q4 2026 |
| FTZ Strategy | PF/NPF status election, duty locking, withdrawal scheduling | Q4 2026 | Q1 2027 |
| Forecast | Rate and demand forecasting | Q1 2027 | Q2 2027 |
| Anomaly | Shipment anomaly detection and alerting | Q2 2027 | Q3 2027 |

### Agent Infrastructure Requirements

- **Anthropic API key** in environment variables — never in code
- **Rate limiting:** AI endpoints rate-limited separately (10 req/min per org for HTS, 5 req/min for route)
- **Streaming:** Route optimization agent uses SSE streaming for long narrative outputs
- **Cost controls:** All AI calls logged with token counts; monthly spend alerting configured
- **Fallback:** AI unavailability degrades gracefully — calculators remain fully functional
- **Human oversight:** No agent takes automated action. All outputs require explicit user confirmation.

### Phase 1 AI (Proposal Site)

No AI agents required. All calculations are deterministic. AI is a Phase 3 feature.

---

## 6. Go-to-Market Strategy Overview

**Full Documents:**
- `.planning/GO-TO-MARKET.md` (AI-5412)
- `docs/GTM-STRATEGY.md` (AI-5460)
- `docs/GTM-LAUNCH-PLAYBOOK.md` (AI-5436)

### GTM Thesis

> Free tools drive discovery. Calculators convert visitors into users. Vertical depth converts users into paying customers. Partner integrations create retention and expansion revenue.

The FTZ Savings Analyzer is the free self-service hook — no login required. It converts to brokerage clients and SaaS subscribers through demonstrated ROI. The April 2025 tariff executive orders created an urgent, unsatisfied market demand for exactly this tool.

### Target Segments (Priority Order)

| Segment | Description | Volume | Entry Channel |
|---------|-------------|--------|---------------|
| 1. The Founder | Primary user — platform solves his exact workflow | 1 user | Direct |
| 2. Cold Chain Freight Brokers | Independent brokers doing temp-controlled cargo | ~2,000 in US | Outbound + associations |
| 3. SE Asia Importers | SMBs importing from Vietnam, Thailand, Indonesia | ~15,000 in US | Content + SEO |
| 4. Mid-Market Logistics Managers | In-house staff at $500K–$5M/yr freight spenders | ~50,000 in US | Content + LinkedIn |

### Market Sizing

- **TAM:** ~$4.2B (US importers/exporters + freight brokers needing analytics)
- **SAM:** ~$480M (SMB segment + independent brokers)
- **SOM (Year 1):** ~$2.4M (SE Asia-US corridor focus)

### GTM Phase Sequence

| Phase | Timing | Milestone | Key Actions |
|-------|--------|-----------|-------------|
| Phase 1: Prove It | Weeks 1–8 (proposal site live) | 10 qualified conversations, 3 LOIs | Share proposal URL in founder meetings; Lineage terminal contacts |
| Phase 2: Early Adopters | Weeks 9–20 (platform beta) | Weekly active users, NPS > 50, 3 case studies | Invite 5–10 freight brokers; white-glove onboarding |
| Phase 3: SaaS Launch | Months 6–12 | 50 paying customers, $15K MRR | Public launch; 14-day free trial; content marketing |

### 90-Day Targets (Day 1 = Platform Public Launch)

- 200 free tool users
- 25 private beta accounts
- 5 paid customers (SMB or broker tier)
- $8,500 MRR by Day 90

### Pricing Model

| Plan | Price/mo | Users | Key Features |
|------|----------|-------|-------------|
| Starter | $149 | 1 | All calculators, HTS lookup, 5 saved calculations |
| Professional | $399 | 3 | + FTZ modeler, shipment tracking, AI agents, unlimited saved |
| Business | $799 | 10 | + API access, team features, compliance center, priority support |
| Enterprise | Custom | Unlimited | + White-label, dedicated CSM, SLA |

Annual discount: 20% off.

### Competitive Positioning

| Platform | Focus | Shipping Savior Advantage |
|----------|-------|--------------------------|
| Freightos | Freight booking marketplace | We focus on financial intelligence, not booking |
| Flexport | End-to-end logistics services | We are self-serve analytics, not a managed service |
| Xeneta | Market rate benchmarking | We use local calculation engines — no carrier data contracts needed |

**Primary positioning:** "The only logistics intelligence platform built around FTZ strategy and cold chain operations."

---

## 7. Financial Model Overview

**Full Document:** `.planning/FINANCIAL-MODEL.md` (AI-5413, 1,180+ lines)

### Four Revenue Pillars

```
FREIGHT BROKERAGE (Core)          SAAS PLATFORM (Growth)
────────────────────────────      ──────────────────────────────────
• Carrier route research          • Landed cost calculator
• 3-option pricing tiers          • HTS duty estimator
• Cold chain + general cargo      • FTZ savings analyzer
• Commission: 2–5% of GMV        • Subscription: $149–$1,499/mo

FTZ CONSULTING (Premium)          DATA INTELLIGENCE (Recurring)
────────────────────────────      ──────────────────────────────────
• Status election strategy        • Tariff change alerts
• Incremental withdrawal model    • SE Asia market intelligence
• Duty rate locking               • Shipping rate benchmarks
• Retainer: $3,000–$12,000/mo   • Subscription: $299–$999/mo
```

### Key Financial Highlights (18-Month Projections)

| Metric | Conservative | Base | Optimistic |
|--------|-------------|------|------------|
| Total Revenue (M18) | $87,400/mo | $164,200/mo | $298,500/mo |
| Gross Margin at M18 | 62% | 71% | 78% |
| Break-Even Month | M14 | M11 | M8 |
| Required Funding | $480,000 | $380,000 | $280,000 |
| Cumulative Revenue (18 mo) | $621,000 | $1,094,000 | $1,847,000 |
| ARR at M18 | $1,049,000 | $1,970,000 | $3,582,000 |

### Development Cost Breakdown

| Phase | Effort | Cost |
|-------|--------|------|
| Phase 1: Proposal Site (PRDs 01–05) | 40 hrs | $8,000 |
| Phase 2: Planning (AI-5407) | 20 hrs | $4,000 |
| Phase 3: Platform MVP (PRDs APP-01–09) | 200 hrs | $40,000 |
| Phase 4: AI Agents + Data Pipeline | 80 hrs | $16,000 |
| **Total** | **340 hrs** | **$68,000** |

### Monthly Infrastructure Costs

| Service | Monthly Cost |
|---------|-------------|
| Vercel Pro | $20 |
| Neon PostgreSQL | $19 |
| Anthropic API (est. 10K req/mo) | $50–$150 |
| Email (Resend) | $20 |
| Vercel KV (rate limiting) | $0 (free tier) |
| **Total** | **~$110–$210/mo** |

### Brokerage Revenue (Existing Business)

The founder's current operation provides an immediate revenue floor:

| Month | Shipments/Mo | Avg Commission | Monthly Revenue |
|-------|-------------|----------------|-----------------|
| M1–M3 | 15 (existing) | $1,235 | $18,525 |
| M7–M9 | 35 | $1,320 | $46,200 |
| M10–M12 | 55 | $1,380 | $75,900 |
| M13–M18 | 90 | $1,430 | $128,700 |

**Why this model works:** The platform wraps software around an already-profitable freight brokerage. There is no cold start — revenue exists on Day 1. SaaS subscriptions layer on top of the brokerage foundation.

### Unit Economics (SaaS)

- **CAC target:** $400–$800 (content marketing + outbound)
- **LTV (Professional):** $399/mo × 24 months = $9,576
- **LTV:CAC target:** > 10:1

---

## 8. Phase 2 Timeline with Dependencies

### Weeks 5–8 — Planning Phase (Complete)

```
Week 5 ──────────────────────────────────────────────────────
  AI-5408  Product Roadmap document                [DONE]
  AI-5409  Technical Architecture document         [DONE]

Week 6 ──────────────────────────────────────────────────────
  AI-5410  Data Pipeline Design document           [DONE]
  AI-5411  AI Agent Development Plans document     [DONE]

Week 7 ──────────────────────────────────────────────────────
  AI-5412  GTM Strategy document                   [DONE]
  AI-5436  GTM Launch Playbook document            [DONE]

Week 8 ──────────────────────────────────────────────────────
  AI-5413  Financial Model document                [DONE]
  AI-5407  Phase 2 Planning Summary                [DONE]
  AI-5455  Phase 2 Master Plan (this document)     [DONE]
```

### Phase 3 Sprint Plan (Post-Gate Approval)

```
GATE: Decision 1 (Auth) + Decision 6 (Multi-tenant) must be resolved first.

Sprint 1 — Foundation (Weeks 9–10)
  ├── Project scaffolding (Next.js 14, Drizzle, Neon)
  ├── Authentication system (PRD-APP-01)
  ├── Shared component library
  └── Database schema: users, orgs, sessions, hts_codes, ftz_zones

Sprint 2 — Data Pipeline (Weeks 11–12)
  ├── HTS ingestion script (USITC XML)
  ├── FTZ ingestion script (OFIS data)
  ├── Port codes reference data
  └── /api/hts/search + /api/ftz/zones endpoints

Sprint 3 — Core Calculators (Weeks 13–14)
  ├── PRD-APP-02: Onboarding Wizard
  ├── PRD-APP-04: Landed Cost Calculator
  ├── PRD-APP-05: FTZ Savings Modeler
  └── PRD-APP-07: Container Utilization Calculator

Sprint 4 — Operations (Weeks 15–16)
  ├── PRD-APP-09: Shipment List & Tracking
  ├── PRD-APP-06: Route Comparison (Full)
  ├── PRD-APP-08: Executive Dashboard
  └── Activity feed and KPI aggregation

Sprint 5 — AI Agents (Weeks 17–18)
  ├── Agent 1: HTS Classification Assistant
  ├── Agent 3: Tariff Alert Agent (async cron)
  └── Agent 4: Compliance Checklist Generator

Sprint 6 — Polish & Launch (Weeks 19–20)
  ├── Agent 2: Route Optimization Agent
  ├── E2E testing (Playwright)
  ├── Performance optimization (LCP targets)
  ├── Beta user onboarding
  └── Monitoring and alerting setup
```

### Dependency Map

```
PRD-APP-01 (Auth) ─────────────────── Required by ALL platform PRDs
PRD-APP-02 (Onboarding) ───────────── Requires APP-01
PRD-APP-03 (HTS Lookup) ───────────── Requires Data Pipeline Sprint
PRD-APP-04 (Landed Cost) ──────────── Requires APP-03 for duty rates
PRD-APP-05 (FTZ Modeler) ──────────── Requires APP-03 + FTZ pipeline
PRD-APP-08 (Dashboard) ────────────── Aggregates APP-04 + APP-09
PRD-APP-09 (Shipments) ─────────────── Feeds APP-08 mini-map
AI Agents (Sprint 5) ──────────────── Require APP-03 + vector search
```

---

## 9. Resource Requirements

### Team

| Role | Allocation | Phases | Notes |
|------|-----------|--------|-------|
| Engineering Lead (agency) | Full-time equivalent | Phase 3 all sprints | Next.js + DB |
| Frontend Engineer | Part-time | Sprints 3–4 | Calculator UI, maps |
| AI/ML Engineer | Part-time | Sprint 5 | Claude API integration + vector search |
| Founder / PM | ~10 hrs/week | All phases | Decision-maker, domain expert |
| Julian (agency) | Oversight | All phases | Delivery management |

### Tools & Infrastructure

| Tool | Purpose | Monthly Cost |
|------|---------|-------------|
| Vercel Pro | Deployment + edge functions | $20 |
| Neon PostgreSQL | Primary database | $19 |
| Upstash Redis (KV) | Session cache + rate limiting | $0 (free tier) |
| Anthropic Claude API | AI agent inference | $50–$150 |
| Resend | Transactional email | $20 |
| Playwright | E2E testing | $0 |
| Linear | Issue tracking | Included |
| GitHub | Source control | Included |

### Budget Summary

| Category | One-Time | Monthly |
|----------|----------|---------|
| Development (Phase 3) | $40,000 | — |
| AI Agents + Pipeline | $16,000 | — |
| Infrastructure (launch) | — | $110–$210 |
| Content marketing | — | $500–$1,000 |
| **Total to Break-Even** | **$56,000** | **$610–$1,210** |

---

## 10. Success Criteria for Phase 2 Completion

### Planning Artifacts (All Required)

- [x] PRD-01 through PRD-05 (proposal site) — complete
- [x] PRD-APP-01 through PRD-APP-09 (full platform) — complete
- [x] Technical Architecture document — complete (AI-5409)
- [x] Data Pipeline Design document — complete (AI-5410)
- [x] AI Agent Development Plans — complete (AI-5411)
- [x] GTM Strategy document — complete (AI-5412, AI-5460)
- [x] GTM Launch Playbook — complete (AI-5436)
- [x] Financial Model document — complete (AI-5413)
- [x] Product Roadmap document — complete (AI-5408)
- [x] Phase 2 Planning Summary — complete (AI-5407)
- [x] Cross-document dependency map — documented
- [x] Critical decisions identified — 6 decisions logged
- [x] Open questions logged — 7 questions documented
- [x] Phase 2 Master Plan (this document) — complete (AI-5455)

### Pre-Phase 3 Gates (Required Before Implementation)

- [ ] **Decision 1:** Auth provider selected (Custom JWT vs. NextAuth v5 vs. Clerk)
- [ ] **Decision 6:** Multi-tenant architecture confirmed (org_id scoping from Day 1)
- [ ] USITC HTS download tested and confirmed accessible at hts.usitc.gov
- [ ] Founder kickoff meeting completed — open questions validated
- [ ] Phase 3 sprint issues created in Linear
- [ ] Development environment provisioned (Neon DB, Vercel project, env vars)

---

## 11. Risk Register

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| R1 | USITC HTS data not machine-readable or download blocked | Medium | High | Test download before Sprint 2; fallback to Tariff.io third-party API ($200/mo) |
| R2 | Founder unavailable for kickoff/validation — assumptions unverified | Medium | High | Schedule kickoff within 2 weeks of Phase 3 start; document all assumptions for async review |
| R3 | SaaS pricing unvalidated — willingness to pay lower than modeled | Medium | High | Conduct 10 discovery calls before pricing lock; model downside at $99/mo Starter |
| R4 | Tariff volatility subsides — reduces FTZ urgency | Low | Medium | Platform value extends beyond tariff arbitrage; cold chain and operational tools remain relevant |
| R5 | Auth implementation introduces security vulnerabilities | Low | Critical | Use battle-tested bcrypt + httpOnly cookie pattern; OWASP checklist before launch |
| R6 | deck.gl performance with 260+ FTZ zones + global ports | Low | Medium | Benchmark early in Sprint 1; fallback to Mapbox GL JS if performance unacceptable |
| R7 | AI agent costs exceed budget at scale | Medium | Medium | Per-org rate limits (10 req/min); response caching in Redis; monitor token costs |
| R8 | Vessel schedule scraping breaks when carrier sites update | High | Low | Phase 1 uses static data; scraping only introduced in Phase 3 — mitigated by timeline |
| R9 | Competitor ships FTZ analytics tool before launch | Low | High | Speed advantage; founder's FTZ operational expertise creates moat that pure software cannot replicate |
| R10 | Multi-tenant retrofit is expensive if skipped in Sprint 1 | High | High | **Resolved by Decision 6 gate** — org_id scoping mandatory from Sprint 1 |
| R11 | Cold chain compliance requirements (FDA prior notice) expand scope | Medium | Medium | Phase 3 MVP scoped to general import compliance; cold chain-specific compliance is Phase 4 |
| R12 | Financial model depends on 3x shipment growth — may not materialize | Medium | High | Brokerage floor ($18K/mo existing) covers infra + partial dev costs; SaaS subscription is additive |

---

## 12. Critical Decisions Before Phase 3

These six decisions must be made and documented in `PROJECT.md` before Phase 3 development begins. Decisions 1 and 6 are hard gates for Sprint 1.

### Decision 1 — Authentication Provider (HARD GATE)

**Options:**
- A) Custom JWT implementation (bcrypt + httpOnly cookies, access + refresh rotation)
- B) NextAuth v5
- C) Clerk

**Recommendation:** Option A. Full control, no third-party dependency — especially important for compliance and data sovereignty. The implementation is well-specified in PRD-APP-01.

**Owner:** Julian / Founder
**Deadline:** Before Sprint 1 starts

### Decision 2 — HTS Data Synchronization Strategy

**Options:**
- A) Manual sync quarterly + on-demand
- B) Automated Vercel Cron weekly
- C) Third-party tariff API (e.g., Tariff.io)

**Recommendation:** Option A for MVP; migrate to C if tariff volatility remains high post-launch.

**Owner:** Julian
**Deadline:** Before Sprint 2

### Decision 3 — Vessel Schedule Data Source

**Options:**
- A) Scrape carrier schedule pages (fragile)
- B) Marine Traffic API (paid, ~$500/mo)
- C) SeaRates API (paid, ~$300/mo)
- D) Static weekly-updated JSON (MVP only)

**Recommendation:** Option D for Phase 3 MVP — avoid API cost and complexity; re-evaluate at $10K MRR.

**Owner:** Julian
**Deadline:** Before Sprint 2

### Decision 4 — AI Agents: Build vs. Buy

**Options:**
- A) Direct Anthropic API integrations
- B) LangChain/LangGraph framework
- C) Hosted agent platform (Dust, Relevance AI)

**Recommendation:** Option A — direct Anthropic API. No framework overhead. Sprint 5 agents are simple enough that a framework adds complexity without value.

**Owner:** Julian
**Deadline:** Before Sprint 5

### Decision 5 — SaaS Pricing Validation

**Action required:** Conduct 10 discovery calls with freight brokers and importers before locking pricing. Current model ($149–$1,499/mo) is research-based, not validated.

**Owner:** Founder
**Deadline:** Month 4 (before Phase 3 SaaS launch planning)

### Decision 6 — Multi-Tenant Data Architecture (HARD GATE)

**Recommendation:** Yes — implement org_id scoping on ALL database tables from Sprint 1. Retrofitting is expensive and risky.

**Impact:** Every database table (users, shipments, calculations, ftz_entries, hts_lookups) needs `org_id` column and row-level security policies from Day 1.

**Owner:** Julian
**Deadline:** Before Sprint 1 starts

---

## 13. Document Index

### Primary Planning Documents

| Document | Linear | Location | Lines |
|----------|--------|----------|-------|
| Phase 2 Master Plan (this doc) | AI-5455 | `docs/PHASE2-MASTER-PLAN.md` | — |
| Phase 2 Planning Summary | AI-5407 | `.planning/prds/PHASE-2-PLANNING-SUMMARY.md` | ~540 |
| Product Roadmap | AI-5408 | `.planning/prds/PRODUCT-ROADMAP.md` | ~1,150 |
| Technical Architecture | AI-5409 | `.planning/TECHNICAL-ARCHITECTURE.md` | ~1,500 |
| Data Pipeline Design | AI-5410 | `.planning/prds/DATA-PIPELINE.md` | ~1,700 |
| AI Agent Development Plans | AI-5411 | `.planning/prds/AI-AGENT-PLANS.md` | ~1,450 |
| GTM Strategy (Planning) | AI-5412 | `.planning/GO-TO-MARKET.md` | ~1,330 |
| GTM Strategy (Docs) | AI-5460 | `docs/GTM-STRATEGY.md` | — |
| GTM Launch Playbook | AI-5436 | `docs/GTM-LAUNCH-PLAYBOOK.md` | — |
| Financial Model | AI-5413 | `.planning/FINANCIAL-MODEL.md` | ~1,180 |
| Technical Specifications | — | `.planning/TECHNICAL-SPECIFICATIONS.md` | — |
| Project Context | — | `.planning/PROJECT.md` | — |

### PRD Documents

| Document | Location |
|----------|----------|
| PRD-01: Landing Page | `.planning/prds/PRD-01-landing.md` |
| PRD-02: Unit Economics | `.planning/prds/PRD-02-unit-economics.md` |
| PRD-03: FTZ Analyzer (Static) | `.planning/prds/PRD-03-ftz-analyzer.md` |
| PRD-04: Route Comparison | `.planning/prds/PRD-04-route-comparison.md` |
| PRD-05: Shipping Map | `.planning/prds/PRD-05-shipping-map.md` |
| PRD-APP-01 through PRD-APP-09 | `.planning/prds/full-app/` |

### Research & Context

| Document | Location |
|----------|----------|
| Shipping ecosystem map | `.planning/research/` |
| SE Asia market analysis | `.planning/research/` |
| Public data sources inventory | `.planning/research/` |
| Architecture diagrams | `.planning/diagrams/` |
| Project configuration | `.planning/config.json` |

---

*This document is the authoritative Phase 2 orchestration reference for Shipping Savior (AI-5455). It synthesizes all Phase 2 planning artifacts and governs the transition into Phase 3 implementation. Do not begin Phase 3 Sprint 1 until Decisions 1 and 6 are documented in PROJECT.md.*
