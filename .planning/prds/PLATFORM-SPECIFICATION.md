# Complete Platform Specification — Shipping Savior

**Linear:** AI-5420
**Version:** 1.0
**Date:** 2026-03-26
**Status:** Phase 4 — Complete

---

## Executive Summary

Shipping Savior is a logistics intelligence platform for freight brokers, importers, and FTZ operators. It transforms manual freight brokerage workflows into systematized, data-driven operations through a suite of calculators, operational dashboards, AI-powered classification, and compliance tools.

The platform wraps software around an existing revenue-generating freight brokerage operation. The founder currently dominates cold chain exports through a Lineage terminal (96-97% of volume) and is expanding into SE Asia consumer goods imports. This is not a cold start — Phase 1 technology investment directly augments existing shipment GMV.

**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, PostgreSQL (Neon), Drizzle ORM, Vercel
**Target Users:** Independent importers, freight brokers, FTZ operators
**Revenue Model:** SaaS (Trial -> Starter $49/mo -> Professional $199/mo -> Enterprise $999/mo) + Freight Brokerage Commissions + FTZ Consulting + Data Intelligence
**North Star Metric:** Monthly Active Calculations (MAC) — 10K/mo by M12
**18-Month ARR Target (Base):** $1,970,000

---

## Specification Index

This document is the master index for the complete platform specification. Each section links to the authoritative document for that domain. Read this document first, then drill into sub-documents as needed.

### Phase 4 Deliverables (This Phase)

| Document | Purpose | Status |
|----------|---------|--------|
| [PLATFORM-ARCHITECTURE.md](./PLATFORM-ARCHITECTURE.md) | Unified system architecture, component design, data layer, security, deployment | New |
| [FEATURE-SPECIFICATIONS.md](./FEATURE-SPECIFICATIONS.md) | 6-module feature specs with 40+ features, acceptance criteria, API mappings | New |
| [USER-JOURNEY-MAPS.md](./USER-JOURNEY-MAPS.md) | 14 user journeys across 3 personas, onboarding flows, error recovery | New |
| This document | Master index, platform overview, implementation guide | New |

### Phase 2 Planning Documents (Existing)

| Document | Linear | Purpose |
|----------|--------|---------|
| [PRODUCT-ROADMAP.md](./PRODUCT-ROADMAP.md) | AI-5408 | 18-month roadmap, Phase 0-4, feature prioritization, milestones |
| [TECHNICAL-ARCHITECTURE.md](./TECHNICAL-ARCHITECTURE.md) | AI-5409 | Full-stack architecture: Next.js 14, Neon/Drizzle, auth, maps, caching, AI/ML layer |
| [DATA-PIPELINE.md](./DATA-PIPELINE.md) | AI-5410 | HTS tariff ingestion, FTZ data, carrier schedules, port statistics pipeline (26+ sources) |
| [AI-AGENT-PLANS.md](./AI-AGENT-PLANS.md) | AI-5411 | 7 AI agents: HTS classification, cost optimization, compliance, document, forecast, anomaly, FTZ strategy |
| [GTM-STRATEGY.md](./GTM-STRATEGY.md) | AI-5412 | Go-to-market: PLG motion, positioning, channels, pricing, 90-day launch plan |
| [FINANCIAL-MODEL.md](./FINANCIAL-MODEL.md) | AI-5413 | Revenue projections ($1.09M cumulative by M18 base), unit economics, CAC/LTV, break-even M11 |
| [PHASE-2-PLANNING-SUMMARY.md](./PHASE-2-PLANNING-SUMMARY.md) | AI-5407 | Phase 2 planning summary with all sub-document links |

### Phase 1 Research Documents

| Document | Linear | Purpose |
|----------|--------|---------|
| [PHASE-1-RESEARCH-SUMMARY.md](../research/PHASE-1-RESEARCH-SUMMARY.md) | AI-5401 | Research findings synthesis across 8 research documents |
| [TECHNOLOGY-VALIDATION.md](../research/TECHNOLOGY-VALIDATION.md) | AI-5404 | Tech stack validation and benchmarks |
| [REGULATORY-COMPLIANCE.md](../research/REGULATORY-COMPLIANCE.md) | AI-5405 | CBP, FTZ (19 CFR 146), HTS, ISF 10+2, UFLPA regulatory requirements |
| [USER-RESEARCH.md](../research/USER-RESEARCH.md) | — | User interviews, persona validation, pain points |
| [COMPETITOR-TRACKING.md](../research/COMPETITOR-TRACKING.md) | — | 10 competitor deep-dives: Freightos, Flexport, Xeneta, and 7 others |
| [DATA-SOURCE-VALIDATION.md](../research/DATA-SOURCE-VALIDATION.md) | — | Public API availability and data quality for 26+ sources |
| [MARKET-INTELLIGENCE-FINAL.md](../research/MARKET-INTELLIGENCE-FINAL.md) | — | Market sizing ($22B logistics software, 9.2% CAGR), opportunity analysis |

### Proposal PRDs (Phase 0)

| Document | Route | Purpose |
|----------|-------|---------|
| [PRD-01-landing.md](./PRD-01-landing.md) | `/` | Landing page with unit economics calculator |
| [PRD-02-unit-economics.md](./PRD-02-unit-economics.md) | `/tools/unit-economics` | Unit economics breakdown tool |
| [PRD-03-ftz-analyzer.md](./PRD-03-ftz-analyzer.md) | `/tools/ftz-analyzer` | FTZ savings analyzer (static) |
| [PRD-04-route-comparison.md](./PRD-04-route-comparison.md) | `/tools/route-comparison` | Route comparison tool |
| [PRD-05-shipping-map.md](./PRD-05-shipping-map.md) | `/map` | Interactive shipping map |

Additional research documents are available in `../research/`: [ARCHITECTURE.md](../research/ARCHITECTURE.md), [FEATURES.md](../research/FEATURES.md), [PITFALLS.md](../research/PITFALLS.md), [STACK.md](../research/STACK.md), [SUMMARY.md](../research/SUMMARY.md).

---

## Platform Overview

### User Personas

Three primary personas drive every product decision. All feature prioritization, user journeys, and pricing tiers are built around these three archetypes.

| Persona | Name | Description | Pain Threshold | WTP |
|---------|------|-------------|----------------|-----|
| A | Import Indie | Small-to-mid importer, SE Asia consumer goods, self-funded, no logistics team | Does not know true landed cost until container arrives | $49-$199/mo |
| B | The Broker | Independent freight broker, 20-200 shipments/month, spreadsheet-based, needs competitive edge | Carrier comparison quotes are manual and slow | $199-$499/mo |
| C | The Zone Manager | FTZ/bonded warehouse operator, fluent in regulations, needs modeling tools | PF vs. GPA status election is irrevocable; wrong choice is catastrophic | $499-$1,500/mo |

Full persona definitions with jobs-to-be-done: [PRODUCT-ROADMAP.md, Section 2](./PRODUCT-ROADMAP.md#2-user-personas)

### 6 Platform Modules

| # | Module | Feature Count | Routes | Primary Phase | Primary Persona |
|---|--------|---------------|--------|---------------|-----------------|
| 1 | Identity & Access | 6 | `/login`, `/register`, `/onboarding` | 1 | All |
| 2 | Calculation & Analysis Tools | 8 | `/tools/*` | 0-2 | A, B |
| 3 | Shipment Operations | 7 | `/dashboard`, `/shipments/*` | 1-2 | B, C |
| 4 | AI Intelligence | 6 | `/tools/ai-classifier`, `/compliance` | 3 | A, B |
| 5 | Documents & Knowledge | 6 | `/documents`, `/knowledge` | 1-3 | A, B, C |
| 6 | Administration & Analytics | 7 | `/analytics`, `/settings` | 1-3 | B, C |

**Total: 40 features across 6 modules.**

Full feature specifications with acceptance criteria: [FEATURE-SPECIFICATIONS.md](./FEATURE-SPECIFICATIONS.md)

### Data Model Overview

13 database tables power the platform. Key entities and their relationships:

```
users ──────────────────┐
  │                     │
  ├── organizations ────┤
  │     │               │
  │     ├── shipments ──┤
  │     │     ├── shipment_events
  │     │     ├── shipment_costs
  │     │     └── shipment_documents
  │     │
  │     ├── saved_calculations
  │     │
  │     └── api_keys
  │
  └── audit_logs

hts_codes ──── duty_rates
ftz_locations
carriers ──── carrier_schedules
```

**Key entities:**
- `users` / `organizations` — Multi-tenant with org-level isolation
- `shipments` / `shipment_events` / `shipment_costs` — Core operational data
- `saved_calculations` — Persistent calculator results (landed cost, FTZ, container)
- `hts_codes` / `duty_rates` — 17,000+ HTS codes with MFN, Column 2, and special rates
- `ftz_locations` — 260+ OFIS-listed Foreign Trade Zones
- `carriers` / `carrier_schedules` — Vessel schedule aggregation

Full schema definitions: [TECHNICAL-ARCHITECTURE.md, Section 4](./TECHNICAL-ARCHITECTURE.md#4-database-schema)

### API Surface

~40 API endpoints organized across 8 route groups:

| Route Group | Endpoints | Auth | Purpose |
|-------------|-----------|------|---------|
| `/api/calculate/*` | 4 | Optional (free tier) | Landed cost, FTZ savings, container utilization, unit economics |
| `/api/hts/*` | 3 | Optional | HTS search, lookup, classify |
| `/api/carriers/*` | 3 | Required | Schedules, rates, comparison |
| `/api/shipments/*` | 6 | Required | CRUD, track, events, costs |
| `/api/export/*` | 3 | Required | PDF, CSV, BOL generation |
| `/api/ai/*` | 4 | Required (paid tier) | HTS classify, rate query, route optimize, compliance check |
| `/api/auth/*` | 5 | Public | Register, login, refresh, logout, verify |
| `/api/admin/*` | ~12 | Admin | User management, analytics, system config |

Full API specification: [TECHNICAL-ARCHITECTURE.md, Section 3](./TECHNICAL-ARCHITECTURE.md#3-backend-api-architecture)

### Integration Map

9 third-party services integrated progressively across phases:

| Service | Category | Phase | Free/Paid | Purpose |
|---------|----------|-------|-----------|---------|
| USITC HTS API | Government Data | 1 | Free | 17,000+ tariff codes, duty rates |
| OFIS FTZ Database | Government Data | 1 | Free | 260+ FTZ locations and metadata |
| CBP DataWeb | Government Data | 2 | Free | Trade statistics, ruling database |
| Maersk Developer Portal | Carrier API | 2 | Free tier | Vessel schedules, rate indices |
| CMA CGM API | Carrier API | 2 | Free tier | Vessel schedules, container tracking |
| Terminal49 | Tracking | 2 | Paid | Universal container tracking |
| Anthropic Claude | AI | 3 | Paid | HTS classification, document processing, compliance |
| Stripe | Payments | 1 | Paid | Subscription billing |
| Resend | Email | 1 | Free tier | Transactional email, alerts |
| MapTiler | Maps | 1 | Free tier | Tile server for deck.gl base maps |
| Sentry | Monitoring | 1 | Free tier | Error tracking and performance |
| Vercel Blob | Storage | 2 | Included | PDF storage, document uploads |

Full integration architecture: [TECHNICAL-ARCHITECTURE.md, Section 7](./TECHNICAL-ARCHITECTURE.md#7-integration-layer)

---

## Technology Stack

### Core Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | Next.js (App Router) | 14.x | Server Components for SEO, API Routes for backend, agency standard |
| Language | TypeScript | 5.x | Type safety across full stack, Drizzle type inference |
| Styling | Tailwind CSS | 3.x | Utility-first, consistent with agency portfolio |
| Database | PostgreSQL on Neon | 16 | Serverless scaling, connection pooling, no vendor lock-in |
| ORM | Drizzle ORM | Latest | Type-safe, migration-first, excellent Neon integration |
| Auth | Custom JWT | — | bcrypt + httpOnly cookies, access + refresh token rotation |
| Maps | deck.gl + MapLibre GL | Latest | Open-source, handles 260+ FTZ zones, free |
| Charts | Recharts | 2.x | Lightweight, React-native, sufficient for dashboard |
| Calculations | decimal.js | Latest | Zero tolerance for floating-point drift in financial math |
| URL State | nuqs | Latest | Shareable calculator URLs, bookmark-friendly |
| Data Tables | @tanstack/react-table | 8.x | Sortable, filterable, virtualized for 17K HTS codes |
| Client State | Zustand | 4.x | Lightweight, no boilerplate, sufficient for calculator state |
| Search | Fuse.js (Phase 1) -> Typesense (Phase 3) | Latest | Start simple, scale when needed; 17K codes fine client-side |
| Deployment | Vercel | — | Edge Functions, ISR, zero-config deploys |
| Rate Limiting | Vercel KV | — | Auth endpoint protection, API throttling |

### AI/ML Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| HTS Classification | Claude API (Sonnet) | 6-step reasoning chain for tariff code classification |
| Document Processing | Claude Vision | OCR + structured extraction from BOL, commercial invoices |
| Compliance Checking | Claude Haiku + rules engine | Fast regulatory validation against CBP requirements |
| Embedding Search | text-embedding-3-small | Semantic HTS code search for classification agent |
| Vector Store | pgvector (Neon) | HTS embeddings stored alongside relational data |

Full AI agent architecture: [AI-AGENT-PLANS.md](./AI-AGENT-PLANS.md)

---

## Data Pipeline Architecture

The platform's core value depends on aggregating fragmented global logistics data into a unified intelligence layer. The pipeline operates in three concentric layers:

```
SERVING LAYER     API routes, search indices, calculator engines
                  ───────────────────────────────────────────
PROCESSING LAYER  ETL, normalization, enrichment, indexing
                  ───────────────────────────────────────────
INGESTION LAYER   Connectors, scrapers, schedulers (26+ sources)
```

### Data Source Categories

| Category | Sources | Refresh Rate | Phase |
|----------|---------|--------------|-------|
| Tariff & Duty (P0) | USITC HTS, CBP DataWeb, Federal Register | Daily | 1 |
| FTZ & Customs (P0) | OFIS Database, 19 CFR 146, ACE Portal | Weekly | 1 |
| Carrier & Vessel (P1) | Maersk API, CMA CGM API, World Port Index | 4-hourly (Phase 3) | 2 |
| Port & Terminal (P1) | AIS data, MarineTraffic, port authority feeds | Daily | 2 |
| Trade Statistics (P2) | Census trade data, ITC Trade Map | Monthly | 2 |
| Market Intelligence (P2) | Freightos Baltic Index, Drewry WCI | Weekly | 3 |

### Phase 1 Data Strategy

Phase 1 uses static JSON files seeded with researched real-world data. No live integrations. Full calculator functionality operates on mock data — this validates UX before committing to integration costs. Static data is stored in `/data/` at the project root and loaded via server components.

Full pipeline design: [DATA-PIPELINE.md](./DATA-PIPELINE.md)

---

## Implementation Guide

### Phase 0: Proposal Site (Current -- Complete)

**Goal:** Interactive proposal website with static data calculators
**Duration:** Built and live
**Linear:** AI-5400 series

10 routes live: `/`, `/dashboard`, `/ftz-analyzer`, `/knowledge-base`, `/data-intelligence`, `/phases`, `/agreement`, `/six-sigma`, `/tech-spec`, `/monetization`. Includes unit economics calculator, landed cost calculator, FTZ savings analyzer (PF vs. GPA with withdrawal modeling), container utilization, route/carrier comparison, and knowledge base.

**Limitations:** All data is static/mock. No auth, no persistence, no document upload, no AI classification, no real-time tariff rates.

---

### Phase 1: Core Platform MVP (M1-M3)

**Goal:** First paying user
**Theme:** Replace mock data with real government datasets. Add the features that unlock first recurring revenue.
**Definition of Done:** 1 paying user at any price point, running 3+ calculations/week

#### M1 -- Data Foundation + Real Calculators

| Feature | ID | Description |
|---------|----|-------------|
| USITC HTS Data Pipeline | F-101 | Parse full HTS schedule (17K+ codes), Fuse.js search, duty rates by country |
| Real Landed Cost Calculator | F-102 | All 15+ cost components: freight, duty, MPF (0.3464%), HMF (0.125%), ISF bond, customs broker, port exams, demurrage, inland freight |
| Container Utilization (Enhanced) | F-103 | Weight vs. volume constraints, 20ft/40ft/40HC, reefer premium overlay |
| HTS Lookup Table | F-104 | Full 17K-code searchable table with @tanstack/react-table |

**M1 Success Criteria:**
- HTS lookup returns accurate rate in < 500ms on 17K+ codes
- Landed cost calculator includes all 15 cost components
- All calculations pass decimal precision tests (no floating-point drift)

#### M2 -- Route Comparison + Map Visualization

| Feature | ID | Description |
|---------|----|-------------|
| Interactive Shipping Route Map | F-201 | MapLibre GL + deck.gl ArcLayer, World Port Index (3,700+ ports), transshipment hubs |
| Route Comparison Tool | F-202 | Side-by-side 3 routes/carriers, transit time, cost, reliability, backhaul indicator |
| Vessel Schedule Aggregator | F-203 | Maersk + CMA CGM API, next 4 sailings per route (static refresh) |
| Port Intelligence Cards | F-204 | Congestion status, dwell time, terminal operators, FTZ proximity |

**M2 Success Criteria:**
- Map renders SE Asia -> US routes in < 2s on mobile 4G
- Route comparison exports correct PDF in < 3s

#### M3 -- FTZ Analyzer (Production) + Basic Dashboard

| Feature | ID | Description |
|---------|----|-------------|
| FTZ Savings Analyzer (Production) | F-301 | Real OFIS data (260+ zones), PF vs. GPA modeling, April 2025 EO compliance, incremental withdrawal, NPV/IRR |
| FTZ Site Finder | F-302 | Map of all FTZ locations, filter by state/grantee, distance from ports |
| Basic Persistent Dashboard | F-303 | User-created shipments with status tracking (manual updates) |
| User Authentication | F-304 | Custom JWT with bcrypt, access + refresh tokens, httpOnly cookies |

**M3 Success Criteria:**
- At least 1 paying user at any price point
- FTZ NPV calculation matches manual spreadsheet within 0.1%

---

### Phase 2: Data Integration (M4-M6)

**Goal:** Live data, real operations
**Theme:** Replace static data with live feeds. Build the operational backbone.

- **M4:** Live rate feeds (Freightos Baltic Index, Maersk spot rates, CMA CGM API, rate normalization engine)
- **M5:** CBP ruling database integration, document upload + OCR parsing (BOL, invoices, packing lists), cross-document validation, compliance pre-check (ISF 10+2, UFLPA, Section 301/232)
- **M6:** Terminal49 container tracking, full operations dashboard (in-transit/at-port/in-FTZ/delivered), alert system (demurrage, schedule changes, duty rate changes), notification engine (Resend + in-app)

**Phase 2 Success Criteria:** 50 registered users, 5 paying accounts, 1,000 MAC, live rate data refreshed within 24 hours

---

### Phase 3: AI Intelligence Layer (M7-M12)

**Goal:** Platform thinks with you
**Theme:** Deploy AI agents that automate the most time-consuming broker workflows.

#### M7-M8 -- HTS Classification Agent

The flagship AI feature. A 6-step reasoning chain that classifies products into HTS codes:

1. Product description parsing and normalization
2. Chapter-level classification (broad category)
3. Heading-level narrowing (specific product type)
4. Subheading determination (material, use, origin)
5. Statistical suffix selection
6. Confidence scoring with alternative suggestions

**Architecture:** Claude Sonnet + text-embedding-3-small + pgvector + rules engine
**Target accuracy:** 85% at 8-digit level, 95% at 6-digit level

#### M9-M10 -- Document Processing Agent

- Claude Vision for OCR on scanned trade documents
- Structured extraction: parties, quantities, values, HTS codes, terms
- Cross-document validation (BOL vs. commercial invoice vs. packing list)
- Exception flagging with human-in-the-loop review

#### M11-M12 -- Compliance Automation + Predictive Analytics

- Real-time compliance monitoring against CBP requirements
- Federal Register tariff change alerts
- Predictive duty rate modeling (scenario analysis)
- Trade lane risk scoring

**Phase 3 Success Criteria:**
- 500 registered users, 50 paying accounts
- $5,000 MRR
- 10,000 Monthly Active Calculations
- HTS Classification Agent at 85%+ accuracy (8-digit)
- NPS 40+

---

### Phase 4: Scale & Enterprise (M13-M18)

**Goal:** Multi-tenant SaaS at scale
**Theme:** Enterprise features, white-label, and platform maturity.

**Key Deliverables:**
- White-label portal for freight brokerages
- Enterprise SSO (SAML/OIDC)
- Custom API integrations for TMS/ERP systems
- Mobile app (React Native or PWA)
- Multi-organization billing and permissions
- Advanced analytics and reporting
- SLA-backed uptime guarantees

**Phase 4 Success Criteria:**
- 5,000 registered users, 500 paying accounts
- $50,000 MRR
- 100,000 Monthly Active Calculations
- NPS 55+

---

## Key Decisions Log

Architectural and strategic decisions that constrain the implementation. Each decision includes the rationale and explicitly rejected alternatives to prevent relitigating settled questions.

| # | Decision | Rationale | Alternatives Rejected |
|---|----------|-----------|----------------------|
| 1 | Next.js monolith over microservices | Velocity over premature scaling; Vercel handles infra; single deploy unit | Separate API + frontend (complexity), NestJS (overkill for Phase 1) |
| 2 | Neon PostgreSQL over Supabase | Drizzle compatibility, serverless scaling, no vendor lock-in on auth | Supabase (auth bundle creates dependency), PlanetScale (MySQL) |
| 3 | Custom JWT over NextAuth providers | Control over token lifecycle, no third-party auth dependency for trade data | Auth0 (cost), Clerk (vendor lock-in), Supabase Auth (bundled) |
| 4 | deck.gl over Mapbox GL JS | Free, open-source, handles 260+ FTZ zones + global ports efficiently | Mapbox (paid, proprietary), Leaflet (slower at scale) |
| 5 | decimal.js for all financial math | Zero tolerance for floating-point drift in duty calculations; $0.01 matters | Native Number (unsafe), Big.js (less feature-rich) |
| 6 | Static JSON for Phase 0-1 data | Zero API costs, instant response, works offline, validates UX first | Database-first (premature), live API-first (expensive before validation) |
| 7 | Vercel over Railway | Edge Functions, ISR, agency standard, zero-config deploys | Railway (manual config), Fly.io (more ops), AWS (overkill) |
| 8 | Zustand over Redux | Lightweight, no boilerplate, sufficient for calculator state management | Redux Toolkit (over-engineered), Jotai (atom model less intuitive here) |
| 9 | Fuse.js -> Typesense search progression | Start simple, scale when needed; 17K HTS codes fine for client-side initially | Algolia (expensive), Elasticsearch (heavy infrastructure) |
| 10 | Proposal site first, platform later | Validate vision with partners/investors before engineering investment | Build full platform immediately (risky, expensive) |
| 11 | 7 specialized AI agents over 1 general agent | Domain-specific training data, independent evaluation, incremental rollout, cost control | Single "freight intelligence" LLM (too broad, expensive, hard to evaluate) |
| 12 | pgvector over Pinecone | Co-located with relational data in Neon, no separate vector DB to manage | Pinecone (another service), Weaviate (self-hosted complexity) |

---

## Revenue Model

Four revenue pillars, progressively unlocked across phases:

### Pillar 1: Freight Brokerage Commissions (Existing)

2-5% of shipment GMV. This is the founder's existing core business. The platform systematizes the quoting and comparison workflow that currently happens in spreadsheets.

### Pillar 2: SaaS Platform Subscriptions (Phase 1+)

| Tier | Price | Features | Target Persona |
|------|-------|----------|----------------|
| Free | $0 | 5 calculations/month, basic HTS lookup, read-only knowledge base | Lead generation |
| Starter | $49/mo | Unlimited calculations, PDF export, saved calculations, email support | Import Indie (Persona A) |
| Professional | $199/mo | Everything in Starter + live rate feeds, operations dashboard, carrier comparison, priority support | Broker (Persona B) |
| Enterprise | $999/mo | Everything in Pro + AI classification, document processing, compliance automation, white-label, API access, dedicated CSM | Zone Manager (Persona C) |

### Pillar 3: FTZ Consulting Retainers (Phase 2+)

$3,000-$12,000/month. Premium service combining platform tooling with expert advisory for PF/GPA status election, incremental withdrawal planning, and FTZ setup.

### Pillar 4: Data Intelligence Subscriptions (Phase 3+)

$299-$999/month. Tariff change alerts, market intelligence feeds, competitor benchmarking, predictive rate analytics.

### Financial Projections (Base Case)

| Metric | M6 | M12 | M18 |
|--------|-----|-----|-----|
| MRR | $0 (beta) | $5,000 | $50,000 |
| Cumulative Revenue | — | — | $1,094,000 |
| Gross Margin | — | 71% | 71% |
| Break-Even | — | M11 | — |
| Required Funding | — | — | $380,000 |

Full financial model with sensitivity analysis: [FINANCIAL-MODEL.md](./FINANCIAL-MODEL.md)

---

## Success Metrics

| Metric | M6 | M12 | M18 |
|--------|-----|-----|-----|
| Registered Users | 50 | 500 | 5,000 |
| Paying Accounts | 5 | 50 | 500 |
| MRR | $0 (beta) | $5,000 | $50,000 |
| Monthly Active Calculations | 1,000 | 10,000 | 100,000 |
| HTS Lookups/Month | 500 | 5,000 | 50,000 |
| Avg Session Duration | 4 min | 8 min | 12 min |
| NPS | — | 40+ | 55+ |
| HTS Classification Accuracy (8-digit) | — | 85%+ | 90%+ |
| PDF Export Success Rate | 99%+ | 99.5%+ | 99.9%+ |
| API Response Time (p95) | < 500ms | < 300ms | < 200ms |

---

## Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| 1 | HTS data staleness | Medium | High | Daily USITC sync + data freshness indicators on every calculation; disclaimer on every output |
| 2 | Carrier API deprecation | Medium | Medium | Abstract behind adapter layer; static fallback data; multi-carrier redundancy |
| 3 | Tariff policy volatility (Section 301/232, reciprocal tariffs) | High | High | Real-time Federal Register monitoring; scenario modeling tool; FTZ strategy as hedge |
| 4 | FTZ regulation changes (April 2025 EO precedent) | Medium | High | Regulatory compliance monitoring agent; legal disclaimer on all FTZ calculations |
| 5 | Low initial adoption | High | Medium | Free tier generous enough for organic growth; broker partnership channel; PLG motion |
| 6 | CBP penalty from bad classification | Low | Critical | Confidence thresholds (never show < 70%); disclaimers; binding ruling recommendations; human-in-the-loop |
| 7 | Floating-point drift in financial calculations | Low | High | decimal.js mandatory for all money math; automated precision tests in CI |
| 8 | Single-carrier data dependency | Medium | Medium | Normalize all carrier data behind adapter interface; minimum 2 carriers per lane |
| 9 | AI classification hallucination | Medium | High | RAG with verified HTS data; confidence scoring; alternative suggestions; audit trail |
| 10 | Regulatory liability for platform-generated classifications | Medium | Critical | Clear disclaimers ("informational only, not legal advice"); recommend binding rulings for high-value shipments |

---

## Compliance & Regulatory Context

The platform operates in a heavily regulated domain. Key regulatory frameworks that constrain the product:

| Regulation | Agency | Impact on Platform |
|------------|--------|-------------------|
| HTS Classification (19 USC 1202) | CBP | All tariff calculations must use official USITC rates; disclaimer required |
| ISF 10+2 Rule | CBP | Document processing must validate ISF filing requirements |
| FTZ Regulations (19 CFR 146) | CBP/FTZ Board | FTZ Analyzer must correctly model PF vs. GPA status and April 2025 EO |
| Section 301 Tariffs | USTR | Additional duties on China-origin goods; scenario modeling required |
| Section 232 Tariffs | Commerce | Steel/aluminum tariffs affect landed cost calculations |
| UFLPA (Uyghur Forced Labor Prevention Act) | CBP | Compliance checker must flag Xinjiang-region supply chain risk |
| Record Retention (19 USC 1508) | CBP | 5-year retention requirement for import records |
| Data Privacy | Various | Trade data is commercially sensitive; encryption at rest and in transit |

**Platform disclaimers (required on every calculation output):**
- "For informational purposes only. Not a substitute for professional customs brokerage advice."
- "Tariff rates shown are based on USITC published data and may not reflect recent changes."
- "Consult a licensed customs broker before making classification or entry decisions."

Full regulatory analysis: [REGULATORY-COMPLIANCE.md](../research/REGULATORY-COMPLIANCE.md)

---

## Go-to-Market Summary

**Core GTM Thesis:** Free tools drive discovery. Calculators convert visitors into users. Vertical depth converts users into paying customers. Partner integrations create retention and expansion revenue.

### Launch Sequence

| Phase | Timeline | Focus | Target |
|-------|----------|-------|--------|
| Warm Network | Days 1-30 | Private beta with founder's existing clients and freight contacts | 25 beta accounts |
| Outbound Sales | Days 31-60 | Direct outreach to freight brokers and 3PLs via trade associations | 5 paid customers |
| Inbound Engine | Days 61-90 | Content, SEO, community generating self-qualified leads | 200 free tool users, $8,500 MRR |

### Channel Strategy

1. **Product-Led Growth (Primary):** Free calculators -> organic search traffic -> self-serve onboarding
2. **Trade Association Partnerships:** NCBFAA, TIA, IANA memberships and co-marketing
3. **Content Marketing:** HTS classification guides, FTZ strategy articles, tariff change analysis
4. **Direct Sales:** Enterprise accounts via founder's existing broker network

Full GTM strategy: [GTM-STRATEGY.md](./GTM-STRATEGY.md)

---

## Application Structure

```
src/
  app/
    (public)/              # No auth: landing, tools/*, map/, knowledge/
    (auth)/                # Auth pages: login/, register/, onboarding/
    (app)/                 # Auth required: dashboard/, shipments/, documents/,
                           #   compliance/, analytics/, settings/
    api/                   # calculate/, hts/, carriers/, shipments/, export/,
                           #   ai/, auth/, admin/
  components/              # calculators/, maps/, dashboard/, shared/
  lib/                     # calculations/, data/, db/, auth/, integrations/, ai/
  data/                    # Static JSON: hts-schedule, duty-rates, ports, routes,
                           #   ftz-locations, carriers
```

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | < 1.2s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Time to Interactive | < 3.5s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| HTS Search (17K codes) | < 500ms | Client-side Fuse.js |
| Landed Cost Calculation | < 200ms | Server-side decimal.js |
| Map Initial Render | < 2s on 4G | deck.gl with progressive loading |
| PDF Export | < 3s | @react-pdf/renderer |
| API Response (p95) | < 500ms | Vercel analytics |
| AI Classification (p95) | < 5s | Claude API latency + processing |

---

## Development Workflow

- **Branching:** `main` (production) + feature branches per Linear issue
- **CI/CD:** GitHub Actions -> Vercel preview deployments on PR, production on merge to main
- **Testing:** Vitest for unit tests, Playwright for E2E, decimal precision tests mandatory for all financial math
- **Code Review:** All PRs require review before merge
- **Deployment:** Vercel auto-deploy on push to main; manual `vercel build --prod && vercel deploy --prebuilt --prod` as fallback
- **Monitoring:** Sentry for errors, Vercel Analytics for performance, custom dashboard for business metrics

---

## What to Read Next

If you are joining this project, read documents in this order:

1. **This document** (you are here) — Platform overview, architecture decisions, implementation phases
2. **[PRODUCT-ROADMAP.md](./PRODUCT-ROADMAP.md)** — Detailed feature breakdown by phase and month
3. **[TECHNICAL-ARCHITECTURE.md](./TECHNICAL-ARCHITECTURE.md)** — System architecture, database schema, API design
4. **[FEATURE-SPECIFICATIONS.md](./FEATURE-SPECIFICATIONS.md)** — Detailed acceptance criteria for every feature
5. **[DATA-PIPELINE.md](./DATA-PIPELINE.md)** — Data source inventory and ingestion pipeline
6. **[AI-AGENT-PLANS.md](./AI-AGENT-PLANS.md)** — AI agent architecture and development plans

For business context:
- **[GTM-STRATEGY.md](./GTM-STRATEGY.md)** — Go-to-market strategy and channel plan
- **[FINANCIAL-MODEL.md](./FINANCIAL-MODEL.md)** — Revenue projections and unit economics

For domain knowledge:
- **[REGULATORY-COMPLIANCE.md](../research/REGULATORY-COMPLIANCE.md)** — US import/export regulations
- **[PHASE-1-RESEARCH-SUMMARY.md](../research/PHASE-1-RESEARCH-SUMMARY.md)** — Market research findings

---

*This specification was produced as part of Phase 4 (AI-5420) of the Shipping Savior project planning. It represents the complete blueprint for building the platform and serves as the single entry point for any engineering team to understand and build the entire system.*
