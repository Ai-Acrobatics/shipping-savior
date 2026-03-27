# Shipping Savior — Phase 1 Research Document Index
**AI-5449 | Phase 1: Research — Market, Data Sources, Technology, Compliance**
*Authored: 2026-03-27 | Status: Complete*

> **Purpose:** Comprehensive index and cross-reference map of all research documents produced in Phase 1 (Weeks 1–4) and Phase 2 (Weeks 5–8). Use this document to find the right source for any research question, understand research gaps, and navigate the full knowledge base as a new team member.

---

## Table of Contents

1. [Document Inventory — All Research Artifacts](#1-document-inventory--all-research-artifacts)
2. [Document Summaries with Key Findings](#2-document-summaries-with-key-findings)
3. [Research Gaps Identified](#3-research-gaps-identified)
4. [Cross-Reference Matrix](#4-cross-reference-matrix)
5. [Recommended Reading Order for New Team Members](#5-recommended-reading-order-for-new-team-members)
6. [Document Status: Active vs. Archived](#6-document-status-active-vs-archived)

---

## 1. Document Inventory — All Research Artifacts

### 1.1 Phase 1 Research Documents (`.planning/research/`)

These documents were produced in Weeks 1–4 before any build work began.

| File | Linear | Topic | Lines | Status |
|------|--------|-------|-------|--------|
| `PHASE-1-RESEARCH-SUMMARY.md` | AI-5401 | Cross-cutting synthesis of all Phase 1 research | ~500 | Active — authoritative Phase 1 synthesis |
| `COMPETITOR-TRACKING.md` | AI-5402 | Competitive landscape, 10 competitor profiles, market gaps | ~700 | Active |
| `DATA-SOURCE-VALIDATION.md` | AI-5403 | Public data sources, scraping strategy, AI services, legal considerations | ~600 | Active |
| `STACK.md` | AI-5404 | Frontend/backend libraries, mapping stack, visualization, PDF, calculation engine | ~280 | Active |
| `ARCHITECTURE.md` | AI-5404 | Component boundaries, data flows, patterns, anti-patterns, scalability roadmap | ~244 | Active |
| `FEATURES.md` | AI-5404 | Table stakes, differentiators, anti-features, feature dependencies, MVP recommendation | ~94 | Active |
| `REGULATORY-COMPLIANCE.md` | AI-5405 | ISF 10+2, FTZ regs (19 CFR 146), Section 301/232, bonding, record retention, UFLPA | ~300+ | Active — primary compliance reference |
| `PITFALLS.md` | AI-5406 | 12 domain-specific pitfalls with prevention strategies and detection methods | ~128 | Active |
| `TECHNOLOGY-VALIDATION.md` | AI-5404 | Detailed library benchmarks, performance comparisons, stack decisions | ~200+ | Active |
| `USER-RESEARCH.md` | AI-5407 | Blake's operational workflow, customer segment profiles, pain points, ICP definition | ~200+ | Active |
| `MARKET-INTELLIGENCE-FINAL.md` | AI-5402 | Market sizing methodology, segment breakdown, competitive positioning map | ~300+ | Active |
| `SUMMARY.md` | AI-5401 | Cross-cutting synthesis, phase ordering rationale, research flags | ~150 | Active — see also PHASE-1-RESEARCH-SUMMARY.md |
| `MONITORING-AI-AGENT-PERFORMANCE.md` | — | Agent evaluation metrics and monitoring design | ~200 | Active — Phase 3 reference |
| `MONITORING-BUSINESS-KPI-DASHBOARD.md` | — | Business KPI definitions, dashboard design, success metrics | ~200 | Active — Phase 3 reference |
| `MONITORING-PLATFORM-HEALTH.md` | — | Infrastructure health monitoring, alerting, SLA definitions | ~200 | Active — Phase 3 reference |

### 1.2 Phase 2 Planning Documents (`docs/`)

These documents were produced in Weeks 5–8 as the planning layer that translates Phase 1 research into an executable build plan.

| File | Linear | Topic | Lines | Status |
|------|--------|-------|-------|--------|
| `PHASE2-MASTER-PLAN.md` | AI-5455 | Master planning document — architecture, data pipeline, AI agents, GTM, financial overviews + document index | ~500 | Active — Phase 2 gate artifact |
| `PHASE2-SPRINT-PLAN.md` | AI-5431 | Sprint-by-sprint Phase 3 execution plan — tasks, acceptance criteria, velocity, retrospective process | ~600 | Active — Phase 3 execution reference |
| `PHASE1-RESEARCH-SUMMARY.md` | AI-5425 | Synthesis of all Phase 1 research — market, data sources, tech, compliance, risks, recommendations | ~500 | **Active — this document's companion** |
| `PHASE1-RESEARCH-INDEX.md` | AI-5449 | This document — index and cross-reference map of all research artifacts | — | **Active — this document** |
| `MARKET-SIZING.md` | AI-5450 | TAM/SAM/SOM analysis, FTZ market breakdown, international trade corridor analysis, tariff impact modeling | ~700 | Active |
| `COMPETITOR-DEEP-DIVE.md` | AI-5426 | 10 competitor profiles, feature matrix, pricing comparison, competitive gaps, partnership ecosystems | ~700 | Active |
| `GTM-STRATEGY.md` | AI-5460 | 18-month go-to-market strategy — segments, ICP, channels, pricing, sales motion, content/SEO | ~600 | Active |
| `GTM-LAUNCH-PLAYBOOK.md` | AI-5436 | Tactical 90-day launch execution — week-by-week, outreach scripts, content calendar, beta plan | ~500 | Active |
| `FINANCIAL-PROJECTIONS.md` | AI-5437 | 36-month P&L, unit economics, CAC/LTV analysis, break-even, funding requirements, bull/base/bear scenarios | ~700 | Active |
| `INVESTOR-BRIEF.md` | AI-5461 | Investor-facing narrative, market evidence, financial highlights, due diligence materials | ~500 | Active |
| `PRODUCT-ROADMAP.md` | AI-5432 | Vision, North Star metric, Now/Next/Later framework, RICE prioritization, milestone gates | ~600 | Active |
| `PRODUCT-ROADMAP-DETAILED.md` | AI-5456 | Engineering-ready feature specifications — acceptance criteria, UX requirements, technical dependencies, A/B testing | ~800 | Active |
| `AI-AGENTS-PLAN.md` | AI-5435 | Seven-agent business plan — agent ROI, development timeline, cost estimates, agent architecture | ~600 | Active |
| `AI-AGENTS-TECHNICAL-SPEC.md` | AI-5459 | Agent technical implementation specs — API design, vector DB, RAG pipeline, agent memory, evaluation metrics | ~700 | Active |

### 1.3 Planning Architecture Documents (`.planning/prds/`)

Technical planning artifacts feeding directly into Phase 3 engineering.

| File | Linear | Topic | Status |
|------|--------|-------|--------|
| `TECHNICAL-ARCHITECTURE.md` | AI-5409 | System architecture, frontend patterns, calculation engine, deployment, security | Active |
| `DATA-PIPELINE.md` | AI-5410 | 26+ data source specifications, ingestion layer, processing pipeline, storage schemas | Active |
| `AI-AGENT-PLANS.md` | AI-5411 | Agent orchestration design, RAG pipeline, training data strategy | Active |
| `FINANCIAL-MODEL.md` | AI-5413 | Financial model backing `docs/FINANCIAL-PROJECTIONS.md` | Active |
| `GTM-STRATEGY.md` | AI-5412 | GTM strategy backing `docs/GTM-STRATEGY.md` | Active |
| `PRODUCT-ROADMAP.md` | AI-5408 | Product roadmap backing `docs/PRODUCT-ROADMAP.md` | Active |
| `TECHNICAL-SPECIFICATIONS.md` | — | Detailed technical specifications for Phase 3 build | Active |
| `PHASE-2-PLANNING-SUMMARY.md` | — | Planning phase wrap-up summary | Active |
| `PRD-01-landing.md` | — | Proposal site landing page PRD | Active |
| `PRD-02-unit-economics.md` | — | Unit Economics Calculator PRD | Active |
| `PRD-03-ftz-analyzer.md` | — | FTZ Savings Analyzer PRD (static version) | Active |
| `PRD-04-route-comparison.md` | — | Route Comparison Tool PRD | Active |
| `PRD-05-shipping-map.md` | — | Shipping Map PRD | Active |
| `full-app/` | — | 9 full platform PRDs (auth, onboarding, HTS, landed cost, FTZ modeler, routes, container, dashboard, shipments) | Active |

### 1.4 Project Foundation Documents (`.planning/`)

| File | Topic | Status |
|------|-------|--------|
| `PROJECT.md` | Original project scope, Blake's operation, business context | Active |
| `REQUIREMENTS.md` | Functional and non-functional requirements | Active |
| `ROADMAP.md` | High-level phase roadmap | Active |
| `STATE.md` | Current project state, decisions made, next actions | Active — updated each session |
| `TECHNICAL-ARCHITECTURE.md` | Root-level architecture reference | Active |
| `MILESTONES.md` | Phase milestones and gate criteria | Active |

---

## 2. Document Summaries with Key Findings

### Phase 1 Research Core

**`.planning/research/PHASE-1-RESEARCH-SUMMARY.md`** (AI-5401)
The master synthesis document from Phase 1. Start here.
- Phase 1 produced 9 structured research documents covering the full pre-build scope
- Five confirmed competitive white spaces: FTZ analysis, cold chain + brokerage, backhaul pricing, integrated intelligence, mid-market SE Asia analytics
- All critical data is free from US government sources — zero paid API contracts needed for Phase 1
- Stack is settled with no risky bets; decimal.js is non-negotiable

**`.planning/research/COMPETITOR-TRACKING.md`** (AI-5402)
Competitive landscape across 10 platforms.
- Tier 1 enterprise (project44, FourKites): no FTZ, no cold chain, no mid-market pricing
- Tier 2 marketplace (Freightos): rate quotes only, no landed cost depth, no FTZ
- Tier 3 integrated forwarder (Flexport): ecosystem lock-in; added Customs Technology Suite in 2025 but tied to Flexport ops
- Tier 4 compliance legacy (Descartes/QuestaWeb): only FTZ software in market; $30K–$200K/year enterprise-only
- Clear positioning: mid-market white space at $149–$1,499/month

**`.planning/research/DATA-SOURCE-VALIDATION.md`** (AI-5403)
All data source options with access methods, costs, and integration complexity.
- USITC HTS JSON: free direct download, 17K codes at 10-digit level, no key required
- CBP CROSS: 220K+ rulings, public data, scraping required; primary AI classification training corpus
- OFIS FTZ zones: 260+ general-purpose zones; data.gov download + OFIS web
- All top-4 carriers now have free DCSA-compliant schedule APIs (Maersk, CMA CGM, Hapag-Lloyd, MSC)
- JSONCargo as unified carrier aggregator: $200–500/month; evaluate as Phase 2 option

**`.planning/research/REGULATORY-COMPLIANCE.md`** (AI-5405)
Primary compliance reference for platform design decisions.
- ISF deadline is 24h before vessel departure from last foreign port (not US arrival — widely misunderstood)
- EO 14257 mandates PF status for all reciprocal-tariff-scope goods; NPF advantage effectively eliminated for SE Asia imports
- PF status is irrevocable; platform must enforce confirmation before any election
- Hidden import costs add 15–25% beyond freight + duty (MPF, HMF, demurrage, detention, chassis, exams)
- 5-year record retention required under 19 USC 1508 — document storage is a compliance feature

### Market Intelligence

**`docs/MARKET-SIZING.md`** (AI-5450)
Bottom-up + top-down market sizing with authoritative primary sources.
- US freight brokerage market: $89B freight under management; ~$1.1–1.6B annual tech spend
- ~17,000 licensed US freight brokers; 65% use spreadsheets as primary rate calculation tool
- FTZ grantees: 3,502 active; ~80% using customs broker consultation or spreadsheets for FTZ analysis
- Post-April 2025: ~8,500 importers with $500K+ Chinese-origin goods need FTZ re-analysis
- Pricing validated: $149–$999/month within stated WTP of 73% of solo/small brokers (TIA survey)

**`docs/COMPETITOR-DEEP-DIVE.md`** (AI-5426)
Detailed profiles of 10 primary competitors with feature matrices.
- Flexport: best-in-class analytics — but only inside their forwarder ecosystem; no FTZ, no backhaul
- Freightos: answers "how much does it cost to ship?" not "how much to import and optimize?"; no FTZ
- project44: enterprise visibility platform; $50K+ entry; no FTZ, no cold chain, no backhaul
- Descartes FTZ (QuestaWeb): the only FTZ tool; $30K–$200K/year; not modernized since acquisition
- Key positioning message: "Flexport's analytics are great if you're locked into Flexport. We give you the same depth for your own carrier relationships."

### Strategy and Planning

**`docs/GTM-STRATEGY.md`** (AI-5460)
18-month go-to-market strategy with channel details and financial targets.
- Product-led growth core + founder-led sales layer
- Free FTZ Savings Analyzer as viral acquisition loop (no login required; PDF export carries branding)
- Primary ICP: independent freight broker-operator, FMC-licensed, $1.5M–$8M GMV, solo to 5 people
- M7 first paying customers; M12 110+ paying accounts; M18 $1.1–2.0M ARR (base case)
- Channel priority: organic SEO (M4+) → LinkedIn founder outreach (M1–M9) → association channels (M6+) → referral (M7+)

**`docs/FINANCIAL-PROJECTIONS.md`** (AI-5437)
36-month P&L with three scenarios; unit economics per tier.
- Starter ($149/mo): LTV $2,915; LTV:CAC 22:1; CAC payback 1.0 months
- Pro ($399/mo): LTV $12,107; LTV:CAC 67:1; CAC payback 0.5 months
- Enterprise ($1,499/mo): LTV $102,432; LTV:CAC 108:1; CAC payback 0.8 months
- FTZ Consulting ($6,000/mo avg): LTV $240,000; LTV:CAC 282:1
- Break-even: M11 on base case; $500K pre-seed ask covers 12 months of runway to first revenue at M7

**`docs/PRODUCT-ROADMAP.md`** (AI-5432)
Vision, North Star metric, feature prioritization via RICE scores.
- North Star: Monthly Active Calculations (MAC) — calculator runs + HTS lookups + route comparisons per month
- NOW priorities: auth (F-001), 14-day trial (F-002), USITC HTS pipeline (F-004), HTS lookup (F-005), FTZ analyzer (F-007), landed cost calculator (F-008)
- M6 targets: 1,000 MAC, 50 registered users, 5 paying accounts; M12: 10,000 MAC, 500 users, 50 paying

### Technical Architecture

**`.planning/TECHNICAL-ARCHITECTURE.md`** (AI-5409)
System architecture with component responsibility matrix and patterns.
- Next.js 14 monolith deployed on Vercel — microservices deferred until Phase 3 AI workers
- Serving layer: RSC for HTS tables and knowledge base; client components for calculators and maps
- Data layer: Neon PostgreSQL + Upstash Redis in Phase 2; static JSON in Phase 1
- Critical rule: ALL map components must use `dynamic(() => ..., { ssr: false })` — deck.gl requires WebGL not available in SSR
- URL state sync via nuqs: every calculator input serializes to URL for shareability

**`.planning/prds/DATA-PIPELINE.md`** (AI-5410)
Complete specification for 26+ external data sources with ingestion architecture.
- Three-phase pipeline: Phase 1 (static JSON), Phase 2 (batch cron), Phase 3 (real-time AIS + port congestion)
- Ingestion scripts: `scripts/sync-hts.ts`, `scripts/sync-ftz.ts`, `scripts/sync-vessels.ts`, `scripts/sync-ports.ts`
- HTS codes: ~17K rows, ~15 MB JSON per revision; quarterly sync minimum; stale data = penalty risk
- CBP CROSS: 220K records, ~500 MB text; embeddings at 1536 dimensions add ~1.6 GB to pgvector table
- Phase 1 zero-cost strategy confirmed: all calculators run on downloaded government data

**`docs/AI-AGENTS-PLAN.md`** (AI-5435)
Seven-agent architecture with business value framing and development timeline.
- 7 specialized agents replacing one broad "freight intelligence" agent — enables domain-specific data, independent metrics, incremental rollout
- Rate Negotiation: 15–25% freight cost savings through carrier leverage identification — $28K–$42K dev
- FTZ Classification: auto-classify goods for FTZ eligibility — $22K–$32K dev
- Document Processing: parse BOLs, invoices, customs forms — $18K–$28K dev
- Total estimated development cost: $175K–$263K over 18 months for all 7 agents

**`docs/AI-AGENTS-TECHNICAL-SPEC.md`** (AI-5459)
Agent infrastructure design with API specs and evaluation frameworks.
- Event bus architecture — agents communicate through shared state, not direct calls
- Agent Gateway: Zod validation + auth + rate limiting + BullMQ async dispatch
- Vector DB: pgvector for CBP rulings semantic search; pgvector table with 1536-dimension embeddings
- Cost controls: all AI calls logged with token counts; monthly spend alerting configured
- Testing: every agent has accuracy benchmarks and regression test suites before production

---

## 3. Research Gaps Identified

The following areas were identified as requiring additional research before or during Phase 3 build.

### Gap 1: Backhaul Pricing Data Source (Critical)

**What's missing:** No research document identifies an API, database, or structured source for backhaul carrier capacity pricing. Blake's backhaul intelligence is currently entirely manual and relationship-based.

**Why it matters:** The Backhaul Pricing Module is one of the five core competitive differentiators. Without a data source, the feature must rely on manual data input from Blake and his network.

**Resolution path:** Investigate TIA member data sharing programs; explore whether any DCSA carrier APIs include capacity utilization signals; consider a Phase 2 proprietary data collection strategy (Blake's network as seed data).

**Documents to update when resolved:** `DATA-SOURCE-VALIDATION.md`, `DATA-PIPELINE.md`

---

### Gap 2: Blake's Exact Workflow (High Priority)

**What's missing:** The user research (`USER-RESEARCH.md`) inferred Blake's workflow from the project description. No formal user interview or workflow walkthrough has been conducted.

**Why it matters:** Proposal site design and calculator feature priority depend on accurately reflecting his real daily workflow. Incorrect assumptions here waste sprint capacity.

**Resolution path:** Walk Blake through the Phase 1 proposal site as soon as it ships. Document exact workflow: how does he currently research vessels? What's his 3-option framework? What does his proposal to customers actually look like?

**Documents to update when resolved:** `USER-RESEARCH.md`, `GTM-STRATEGY.md` Section 2

---

### Gap 3: HTS JSON Field Structure (Blocks Data Pipeline)

**What's missing:** The USITC HTS JSON download has not been inspected. Field names, nesting, duty rate column completeness, and Section 301 overlay structure are unknown.

**Why it matters:** All calculator accuracy depends on correctly parsing and normalizing this file. Building the adapter layer without knowing the actual structure is not possible.

**Resolution path:** Phase 2 first action — download the file, inspect it, build the normalization adapter before any sprint work begins.

**Documents to update when resolved:** `DATA-PIPELINE.md` (add schema documentation), `TECHNICAL-ARCHITECTURE.md` (add data model)

---

### Gap 4: searoute-js Real-World Accuracy (Blocks Map Feature)

**What's missing:** The offline maritime route calculation library has 306 weekly npm downloads and no published accuracy benchmarks for SE Asia → US routes.

**Why it matters:** The route comparison map visualization is a key proposal tool feature. Incorrect route polylines undermine credibility.

**Resolution path:** Test with 10 real port pairs (HCMC → Long Beach, Bangkok → Seattle, Jakarta → New York, Costa Rica → Miami, etc.) against published carrier transit times. If accuracy is off by >10%, switch to Searoutes API (paid, ~$100–300/month).

**Documents to update when resolved:** `STACK.md` (confirm or replace library), `TECHNOLOGY-VALIDATION.md`

---

### Gap 5: UFLPA SE Asia Transshipment Scope (Legal Risk)

**What's missing:** The compliance research flagged UFLPA as a legal risk area but did not fully scope the enforcement boundaries for SE Asia transshipment scenarios (goods manufactured in Vietnam using Chinese-origin inputs).

**Why it matters:** Building a UFLPA compliance classification feature without understanding the current enforcement interpretation creates legal liability for the platform.

**Resolution path:** Review current CBP UFLPA enforcement guidance; consult a customs attorney before building any feature that evaluates UFLPA compliance; scope feature to educational content + documentation checklists with clear disclaimers.

**Documents to update when resolved:** `REGULATORY-COMPLIANCE.md`, relevant PRD

---

### Gap 6: MSC DCSA API Access Requirements

**What's missing:** The carrier API research confirmed MSC adopted DCSA standards mid-2025 but did not clarify whether access requires DCSA consortium membership or is available via MSC's standard developer portal.

**Why it matters:** MSC is the world's largest container shipping line by fleet size. Excluding them degrades route comparison feature coverage.

**Resolution path:** Contact MSC API support and check the DCSA developer portal.

**Documents to update when resolved:** `DATA-SOURCE-VALIDATION.md`

---

### Gap 7: Actual WTP from Blake's Lineage Network

**What's missing:** The financial model uses TIA survey data for willingness to pay. No direct price validation has been done with Blake's existing cold chain / Lineage terminal contacts.

**Why it matters:** The commercial model is built on $149–$999/month pricing. Validation from the target market before spending on build reduces financial risk.

**Resolution path:** Present Phase 1 proposal site to 5–10 Lineage terminal contacts; ask explicit price questions ("What would you pay per month for this?").

**Documents to update when resolved:** `FINANCIAL-PROJECTIONS.md` (update WTP assumptions if different), `GTM-STRATEGY.md`

---

## 4. Cross-Reference Matrix

This matrix maps which research documents inform which major decisions and features.

### Decision: Auth Provider (Custom JWT vs. NextAuth v5)

| Document | Relevant Section | Finding |
|----------|----------------|---------|
| `.planning/TECHNICAL-ARCHITECTURE.md` | Section 11 (Security) | Custom JWT recommended for full control |
| `PHASE2-MASTER-PLAN.md` | Section 12, Decision 1 | Gate decision — must resolve before Sprint 1 |
| `.planning/research/ARCHITECTURE.md` | Auth patterns section | NextAuth v5 adds OAuth at cost of third-party dep |

### Decision: Multi-Tenant Architecture

| Document | Relevant Section | Finding |
|----------|----------------|---------|
| `PHASE2-MASTER-PLAN.md` | Section 12, Decision 6 | Gate decision — affects database schema and all API routes |
| `.planning/prds/full-app/PRD-APP-01-auth.md` | Registration flow | Org creation flow depends on this decision |
| `.planning/TECHNICAL-ARCHITECTURE.md` | Data layer section | Schema design must be finalized before Sprint 2 |

### Feature: FTZ Savings Analyzer

| Document | Relevant Section | Finding |
|----------|----------------|---------|
| `REGULATORY-COMPLIANCE.md` | Section 3 (FTZ Regulations) | PF vs. NPF legal framework; mandatory PF under EO 14257 |
| `MARKET-SIZING.md` | Section 3 (FTZ Market Analysis) | 3,502 active grantees; post-April 2025 compliance driver |
| `DATA-SOURCE-VALIDATION.md` | OFIS section | 260+ zones, OFIS download, data structure |
| `DATA-PIPELINE.md` | Section 2.5 (FTZ Data) | OFIS ingestion plan |
| `.planning/prds/PRD-03-ftz-analyzer.md` | — | Static version PRD (Phase 1 proposal site) |
| `.planning/prds/full-app/PRD-APP-05-ftz-modeler.md` | — | Full platform version PRD |
| `PRODUCT-ROADMAP-DETAILED.md` | Section 7 | Engineering-ready acceptance criteria |

### Feature: Landed Cost Calculator

| Document | Relevant Section | Finding |
|----------|----------------|---------|
| `REGULATORY-COMPLIANCE.md` | Section 6.5 (Hidden Costs) | 15+ cost components including MPF, HMF, demurrage |
| `DATA-SOURCE-VALIDATION.md` | USITC HTS section | Duty rate data source for calculations |
| `.planning/TECHNICAL-ARCHITECTURE.md` | Section 3 (Calculation Engine) | decimal.js mandatory; pure TypeScript functions |
| `.planning/prds/full-app/PRD-APP-04-landed-cost.md` | — | Full platform PRD |

### Feature: HTS Lookup and Classification

| Document | Relevant Section | Finding |
|----------|----------------|---------|
| `DATA-SOURCE-VALIDATION.md` | USITC HTS section | JSON download structure; 17K codes |
| `DATA-PIPELINE.md` | Section 2.1.1 (USITC HTS) | Ingestion plan; normalization approach |
| `DATA-PIPELINE.md` | Section 2.1.2 (CBP CROSS) | 220K rulings as AI training data |
| `AI-AGENTS-TECHNICAL-SPEC.md` | Section 4 (HTS Classification Agent) | Vector search implementation |
| `AI-AGENTS-PLAN.md` | Agent 2 (FTZ Classification) | Business value and ROI framing |
| `.planning/prds/full-app/PRD-APP-03-hts-lookup.md` | — | Platform HTS lookup PRD |

### Feature: Route Comparison + Map Visualization

| Document | Relevant Section | Finding |
|----------|----------------|---------|
| `STACK.md` | Mapping section | MapLibre + deck.gl + searoute-js stack |
| `.planning/TECHNICAL-ARCHITECTURE.md` | Section 5 (Map Layer) | deck.gl layer architecture |
| `DATA-PIPELINE.md` | Section 2.2 (Carrier Data) | Carrier APIs; JSONCargo aggregator |
| `DATA-SOURCE-VALIDATION.md` | Carrier APIs section | Free DCSA API portals |
| `.planning/prds/PRD-04-route-comparison.md` | — | Static version PRD |
| `.planning/prds/full-app/PRD-APP-06-route-comparison.md` | — | Full platform PRD |

### Feature: Cold Chain Rate Overlay

| Document | Relevant Section | Finding |
|----------|----------------|---------|
| `REGULATORY-COMPLIANCE.md` | Section 5 (Product-Specific) | FSMA Safe Food Transport Rule |
| `MARKET-SIZING.md` | Section (cold chain) | $361B market, 4,200 US operators |
| `GTM-STRATEGY.md` | Section 2.4 (Segment 3) | Cold chain operator profile and acquisition channel |
| `USER-RESEARCH.md` | Blake's operation section | Lineage terminal dominance; reefer expertise |

### GTM Strategy Inputs

| Document | What It Informs | Key Data |
|----------|---------------|---------|
| `MARKET-SIZING.md` | Segment sizing, ARPU assumptions | 17K brokers; 25K importers; $149–$999/mo WTP |
| `COMPETITOR-DEEP-DIVE.md` | Positioning, messaging | White spaces, competitive differentiation |
| `FINANCIAL-PROJECTIONS.md` | Fundraising, runway | $500K pre-seed ask; break-even M11 |
| `USER-RESEARCH.md` | ICP definition, channel selection | Blake's profile; secondary ICPs |
| `GTM-LAUNCH-PLAYBOOK.md` | Launch execution | 90-day week-by-week plan |

### Financial Model Inputs

| Document | What It Informs | Key Data |
|----------|---------------|---------|
| `MARKET-SIZING.md` | Segment sizing, ARPU benchmarks | ~50K US target operators |
| `GTM-STRATEGY.md` | CAC by channel, sales motion | PLG CAC $85–$145; sales-assist CAC $180–$950 |
| `COMPETITOR-DEEP-DIVE.md` | Pricing comparables | Market rate context for $149–$1,499/mo |

---

## 5. Recommended Reading Order for New Team Members

### For Product Managers / Designers

1. `docs/PHASE1-RESEARCH-SUMMARY.md` (AI-5425) — Start here. 30-minute read. Full Phase 1 synthesis.
2. `.planning/research/PHASE-1-RESEARCH-SUMMARY.md` (AI-5401) — Companion Phase 1 synthesis with more technical detail.
3. `docs/PRODUCT-ROADMAP.md` (AI-5432) — Vision, North Star, feature prioritization.
4. `docs/GTM-STRATEGY.md` (AI-5460) — Target segments, ICP, acquisition channels.
5. `.planning/research/USER-RESEARCH.md` (AI-5407) — Blake's workflow and pain points.
6. `docs/COMPETITOR-DEEP-DIVE.md` (AI-5426) — Competitive positioning and gaps.
7. `.planning/research/FEATURES.md` (AI-5404) — Table stakes vs. differentiators vs. anti-features.

### For Engineers

1. `docs/PHASE1-RESEARCH-SUMMARY.md` (AI-5425) — Full context in one document.
2. `.planning/TECHNICAL-ARCHITECTURE.md` (AI-5409) — System architecture; component responsibility matrix; critical rules (decimal.js, SSR map guard).
3. `.planning/prds/DATA-PIPELINE.md` (AI-5410) — All 26+ data source specs with field structures, ingestion plans, and cost.
4. `.planning/research/STACK.md` (AI-5404) — Library decisions with performance benchmarks and alternatives.
5. `docs/PRODUCT-ROADMAP-DETAILED.md` (AI-5456) — Engineering-ready acceptance criteria for every feature.
6. `docs/PHASE2-SPRINT-PLAN.md` (AI-5431) — Sprint breakdown, velocity assumptions, Definition of Done.
7. `docs/AI-AGENTS-TECHNICAL-SPEC.md` (AI-5459) — AI agent infrastructure design (Phase 2+).

### For Investors / Stakeholders

1. `docs/INVESTOR-BRIEF.md` (AI-5461) — One-page executive summary, market, model, traction, ask.
2. `docs/MARKET-SIZING.md` (AI-5450) — TAM/SAM/SOM with primary source citations.
3. `docs/FINANCIAL-PROJECTIONS.md` (AI-5437) — 36-month P&L with unit economics.
4. `docs/COMPETITOR-DEEP-DIVE.md` (AI-5426) — Competitive moat and positioning.
5. `docs/GTM-STRATEGY.md` (AI-5460) — Go-to-market strategy and milestone targets.

### For Compliance/Legal Review

1. `.planning/research/REGULATORY-COMPLIANCE.md` (AI-5405) — Primary regulatory reference (ISF, FTZ, Section 301, UFLPA, record retention).
2. `docs/PHASE1-RESEARCH-SUMMARY.md` Section 5 — Compliance summary with platform design implications.
3. `docs/PRODUCT-ROADMAP-DETAILED.md` — Feature specs that surface compliance decisions to users.

### Quick Orientation (15 minutes)

1. `docs/PHASE2-MASTER-PLAN.md` (AI-5455) — Read Section 1 (Executive Summary) and Section 13 (Document Index). This gives you the full project in ~5 minutes.
2. `docs/PHASE1-RESEARCH-SUMMARY.md` (AI-5425) — Read Section 1 (Executive Summary) and Section 7 (Critical Risks). Another 5 minutes.
3. `.planning/STATE.md` — What's been built, what's next, current blockers.

---

## 6. Document Status: Active vs. Archived

### Active Documents (Current — Use These)

All documents listed in Sections 1.1 through 1.4 above are active. The most recently produced documents supersede earlier versions where overlap exists.

**Superseding relationships:**
- `docs/PHASE1-RESEARCH-SUMMARY.md` (AI-5425) supersedes `.planning/research/SUMMARY.md` as the authoritative Phase 1 synthesis
- `docs/COMPETITOR-DEEP-DIVE.md` (AI-5426) supersedes `.planning/research/COMPETITOR-TRACKING.md` for detailed profiles; the older doc retains value for the original competitive matrix format
- `docs/GTM-STRATEGY.md` (AI-5460) supersedes `.planning/GO-TO-MARKET.md` as the authoritative GTM document; the `.planning/` version is the internal working draft
- `docs/PRODUCT-ROADMAP.md` (AI-5432) supersedes `.planning/PRODUCT-ROADMAP.md` as the authoritative roadmap

### Documents Requiring Update

| Document | What Needs Updating | Trigger |
|---------|-------------------|---------|
| `.planning/STATE.md` | Current sprint, completed tasks, next actions | After every work session |
| `docs/GTM-LAUNCH-PLAYBOOK.md` | Beta partner list, outreach scripts | When first design partners are identified |
| `docs/FINANCIAL-PROJECTIONS.md` | WTP assumptions | When direct price validation is done with Blake's network |
| `.planning/research/USER-RESEARCH.md` | Blake's actual workflow | After Phase 1 site client review |
| `DATA-PIPELINE.md` | HTS JSON field structure | After first HTS download is inspected |

### Not Yet Produced (Gaps in Documentation)

| Document | Purpose | When Needed |
|----------|---------|-------------|
| Backhaul Data Source Research | Identify API or data partnership for backhaul pricing | Before Sprint 6 (Backhaul Module) |
| UFLPA Legal Scope Analysis | Clarify SE Asia transshipment enforcement scope | Before Phase 3 compliance features |
| Beta User Interview Transcripts | Validate workflow assumptions and pricing | After Phase 1 site review with Blake |
| API Key Registration Status | Track which carrier portals have been registered and approved | Before Sprint 2 (Data Pipeline) |

---

*Document generated: 2026-03-27 | Linear: AI-5449 | Phase: Phase 1 Research Complete*
