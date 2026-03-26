# Phase 1 Research Summary
## Shipping Savior — Logistics Analysis Platform

**Linear Issue:** AI-5401
**Phase:** Phase 1 — Market, Data Sources, Technology, Compliance
**Research Period:** Weeks 1–4 (completed 2026-03-26)
**Summary Author:** Agent — synthesized from 8 research documents
**Overall Confidence:** MEDIUM-HIGH

---

## Table of Contents

1. [What Was Researched](#1-what-was-researched)
2. [Executive Summary](#2-executive-summary)
3. [Market Research Findings](#3-market-research-findings)
4. [Data Sources Findings](#4-data-sources-findings)
5. [Technology Validation Findings](#5-technology-validation-findings)
6. [Regulatory & Compliance Findings](#6-regulatory--compliance-findings)
7. [User Research Findings](#7-user-research-findings)
8. [Key Insights and Surprises](#8-key-insights-and-surprises)
9. [Assumptions Validated vs. Invalidated](#9-assumptions-validated-vs-invalidated)
10. [Critical Unknowns Still to Resolve](#10-critical-unknowns-still-to-resolve)
11. [Recommended Next Steps for Phase 2](#11-recommended-next-steps-for-phase-2)
12. [Research Confidence Ratings](#12-research-confidence-ratings)

---

## 1. What Was Researched

Phase 1 produced 8 structured research documents covering the full pre-build discovery scope:

| Document | Scope | Lines |
|----------|-------|-------|
| `COMPETITOR-ANALYSIS.md` | 10 competitor deep-dives, competitive matrix, 5 market gaps, industry trends | ~700 |
| `DATA-SOURCES.md` | Public data sources, scraping strategy, AI services architecture, legal considerations | ~600 |
| `STACK.md` | Frontend/backend libraries, mapping stack, visualization, PDF, calculation engine | ~280 |
| `ARCHITECTURE.md` | Component boundaries, data flows, patterns, anti-patterns, scalability roadmap | ~244 |
| `FEATURES.md` | Table stakes, differentiators, anti-features, feature dependencies, MVP recommendation | ~94 |
| `PITFALLS.md` | 12 domain-specific pitfalls with prevention strategies and detection methods | ~128 |
| `REGULATORY-COMPLIANCE.md` | ISF 10+2 rule, FTZ regulations 19 CFR 146, Section 301/232 tariffs, bonding | ~300+ |
| `COMPLIANCE-REGULATORY.md` | Record retention (19 USC 1508), data privacy for trade data | ~150+ |
| `SUMMARY.md` | Cross-cutting synthesis, phase ordering rationale, research flags | ~150 |

All research was completed in a single focused session on 2026-03-26 before any build work began.

---

## 2. Executive Summary

Shipping Savior is a logistics analysis and proposal platform for Blake — an international freight operator who dominates cold chain exports through a major Lineage terminal (96–97% of volume) and is expanding into SE Asia consumer goods imports. The platform will provide interactive calculators (landed cost, unit economics, tariff/duty, FTZ savings, container utilization), carrier route comparison with map visualization, and a comprehensive knowledge base — wrapped in a premium proposal website.

**The research verdict is clear and actionable:**

- The competitive landscape has **five confirmed white-space gaps** that no existing platform fills, the most significant being FTZ analysis and cold chain + freight brokerage integration.
- All critical data sources are **free from US government agencies** — no paid API contracts needed for Phase 1.
- The recommended technology stack is **fully validated** with mature, widely-adopted libraries.
- Regulatory requirements are **well-documented** and translate directly into specific software features.
- The biggest risks are operational: stale tariff data, floating-point arithmetic, and underestimating hidden import costs (15–25% above freight + duty).

**Phase 1 recommendation:** Build the proposal site first (Next.js 14 monolith, static JSON data, no auth, no live APIs). Ship to validate the vision with Blake before investing in live data integrations.

---

## 3. Market Research Findings

### 3.1 Market Size

The logistics technology market is large and growing fast:

- **Digital supply chain & logistics tech:** $72B in 2025 → $146.92B by 2031 (12.62% CAGR)
- **Digital freight forwarding segment:** $41–49B in 2025–2026, growing at 19%+ CAGR
- **Cold chain logistics:** $361B market (2025) growing at 6.4% CAGR

The market is fragmented — platforms specialize in narrow verticals (rate benchmarking, visibility, customs, freight forwarding operations) but few offer integrated end-to-end solutions. This fragmentation is both competitive noise and significant opportunity.

### 3.2 Competitive Landscape

Ten competitors were analyzed across two categories:

**Direct Freight Tech Competitors:**

| Competitor | Core Value Prop | Revenue (2025) | Notable Gap |
|------------|-----------------|----------------|-------------|
| **Freightos** (NASDAQ: CRGO) | Freight marketplace + FBX index | $29.5M (+24% YoY) | No customs, no FTZ, no cold chain |
| **Flexport** | Full-stack digital freight forwarder | $2.1B (+30% YoY) | No FTZ, no backhaul intel, no cold chain |
| **Xeneta** | Ocean/air rate benchmarking | Undisclosed | Intel only, no execution, enterprise-only pricing |
| **GoFreight** | Modern TMS for freight forwarders | Undisclosed | No rate intelligence, no compliance |
| **Cargobase** | Multi-quote transport procurement | Undisclosed | No customs/compliance, no cold chain |
| **project44** | Real-time supply chain visibility | ~$125M | No FTZ, no cold chain, no backhaul |
| **FourKites** | AI-powered supply chain visibility | $50M+ | No FTZ, no cold chain brokerage |

**Adjacent Competitors:**

| Competitor | Core Value Prop | Notable Gap |
|------------|-----------------|-------------|
| **Descartes** (NASDAQ: DSGX, $6.17B market cap) | Comprehensive logistics network | Legacy FTZ software (QuestaWeb), no cold chain specialization |
| **Zonos** | Cross-border e-commerce duties/taxes | Parcel-focused, no ocean freight or FTZ |
| **CustomsTrack** | AI customs declaration automation | UK-centric, no broader logistics context |

### 3.3 Five Confirmed Market Gaps

**Gap 1: FTZ Analysis & Optimization (HIGHEST PRIORITY)**
Only Descartes offers FTZ software and it's legacy/enterprise-only. With "unprecedented interest" in FTZ programs due to 2025–2026 tariff volatility, there is a clear opportunity for a modern, accessible FTZ savings analyzer with incremental withdrawal modeling.

**Gap 2: Cold Chain + Freight Brokerage Hybrid**
$361B cold chain market with no platform integrating cold chain monitoring, freight procurement, FDA/FSMA compliance, and rate intelligence in a single product. FourKites does temperature monitoring; Lineage does cold storage; nobody does the integrated layer.

**Gap 3: Backhaul Pricing Intelligence**
No platform provides transparent backhaul pricing data. Freight brokers do this manually. Blake's primary competitive advantage in cold chain exports is knowing backhaul pricing — this is a platform differentiator nobody has built.

**Gap 4: Integrated Shipping Intelligence (Rate + Customs + Visibility + FTZ)**
Users currently need Xeneta for rate intelligence, Flexport for execution, Descartes for customs/FTZ, and project44 for visibility. No single platform integrates all four for mid-market importers.

**Gap 5: Mid-Market SE Asia Import Analytics**
Flexport and Descartes serve large enterprises. Freightos serves SMBs via marketplace. Nobody specifically serves the mid-market operator importing from SE Asia who needs duty optimization, FTZ strategy, and backhaul intelligence in one tool.

### 3.4 Industry Trends Relevant to Build

- **Tariff volatility as tailwind:** Section 301 tariff changes and the April 2025 "Liberation Day" executive order have created urgent demand for tariff modeling and FTZ strategy tools.
- **DCSA API standardization:** Major carriers (Maersk, MSC, CMA CGM, Hapag-Lloyd) have adopted DCSA standard APIs, making carrier data more accessible than ever.
- **AI-powered classification:** ATLAS benchmark paper (2025) showed fine-tuned LLaMA-3.3-70B achieved 40% accuracy on 10-digit HTS classification vs. 25% for GPT-5-Thinking — CBP rulings data is trainable.

---

## 4. Data Sources Findings

### 4.1 Free Government Data Sources (All Verified)

The most important finding: **all critical baseline data is freely available from US government sources.**

| Data Type | Source | Access | Confidence |
|-----------|--------|--------|------------|
| HTS tariff schedule | USITC (hts.usitc.gov) | JSON/CSV download, no key | HIGH |
| Historical trade statistics | USITC DataWeb (dataweb.usitc.gov) | Web export | HIGH |
| CBP customs rulings (220K+) | CBP CROSS (rulings.cbp.gov) | Scrape (public data) | HIGH |
| Section 301 tariff lists | USTR.gov | PDF download | HIGH |
| AD/CVD orders | CBP trade.cbp.dhs.gov | Scrape (public data) | HIGH |
| FTZ locations (260+ zones) | OFIS (ofis.trade.gov/Zones) | Scrape/download | HIGH |
| FTZ regulations | FTZ Board (trade.gov) | PDF/web | HIGH |
| Port database (3,700+) | World Port Index (NGA) | Download | HIGH |
| Port codes (100K+) | UN/LOCODE (UNECE) | Download | HIGH |
| Federal Register trade notices | federalregister.gov | Free REST API | HIGH |
| FDA import alerts | FDA.gov / openFDA API | Free REST API | HIGH |
| USDA APHIS import requirements | APHIS.usda.gov | Scrape (no API) | MEDIUM |
| US port statistics | MARAD, Army Corps WCSC | Download | HIGH |
| US Census trade statistics | Census Bureau API | Free REST API | HIGH |

### 4.2 Carrier Schedule APIs (Free with Registration)

| Carrier | Portal | Notes |
|---------|--------|-------|
| **Maersk** | developer.maersk.com | Free self-service, Point-to-Point Schedules API |
| **CMA CGM** | api-portal.cma-cgm.com | Free tier, registration required |
| **Hapag-Lloyd** | api-portal.hlag.com | Free, DCSA-compliant |
| **MSC** | Via DCSA standard | Adopted mid-2025 |
| Evergreen, ONE, Yang Ming | No public API | Web scraping required |

All top-4 carriers now expose free DCSA-compliant schedule APIs. This is a significant change from 2–3 years ago.

### 4.3 Paid Data Sources (Phase 2+)

| Data Type | Provider | Cost | Priority |
|-----------|---------|------|----------|
| AIS vessel tracking | AISHub (free/community), Datalastic (~$200/mo), MarineTraffic (enterprise) | Varies | Phase 2 |
| Port congestion | Portcast, GoComet, Vizion | Sales contact | Phase 2 |
| Container tracking | Terminal49 (free tier: 100 containers), Vizion (paid) | Varies | Phase 2 |
| Guaranteed landed cost API | Zonos ($2/order + 10% duties) | Per-transaction | Phase 3 |
| CBP rulings classification AI | Descartes CustomsInfo | Enterprise | Phase 3 |

### 4.4 Phase 1 Data Strategy

For Phase 1 (proposal site + static calculators), the strategy is:
1. Download USITC HTS schedule as JSON (free, offline, ~100K entries)
2. Compile SE Asia duty rates from USITC DataWeb exports (Vietnam, Thailand, Indonesia, Cambodia)
3. Compile FTZ location data from OFIS into structured JSON
4. Build static carrier route dataset from carrier schedule pages (manually curated)
5. Use UN/LOCODE + World Port Index for port coordinates
6. All calculations run client-side; no database needed in Phase 1

**Zero API costs required for a fully functional Phase 1 proposal tool.**

### 4.5 Phase 2+ Data Architecture

When the platform needs live data:
- **PostgreSQL** as primary store (with pgvector extension for semantic search on CBP rulings)
- **Typesense** for user-facing HTS code search (better typo tolerance than pgvector for product descriptions)
- **TimescaleDB extension** for vessel position time-series data
- **Federal Register API** as the canonical source for tariff change monitoring

---

## 5. Technology Validation Findings

### 5.1 Core Stack (Validated)

All stack decisions are constrained by the project:

- **Next.js 14 (App Router)** — enables server components for data-heavy pages, client components for calculators, API routes for PDF generation
- **TypeScript 5.x** — essential for logistics domain (HTS codes, duty rates, container dimensions demand strict typing)
- **Tailwind CSS 3.4+** — works well for data-dense dashboard layouts
- **Vercel** — edge functions useful for calculator APIs, serverless for PDF generation

### 5.2 Mapping Stack (HIGH confidence)

The free WebGL mapping stack is a major finding:

```
react-map-gl v8.1.0 (React bindings — bundle dropped to 57k in v7 rewrite)
  + MapLibre GL JS v4.x (free, open-source fork of Mapbox GL — zero licensing cost)
  + deck.gl v9.2.x (ArcLayer for routes, TripsLayer for animated vessels, GeoJsonLayer for FTZ boundaries)
  + searoute-js v0.1.0 (offline maritime route calculation — MEDIUM confidence, needs testing)
```

**Key insight:** Mapbox GL costs $0.50–$2.00 per 1,000 map loads. MapLibre is free with identical API surface. For an internal proposal/analysis tool this difference is irrelevant on cost, but the MapTiler free tier provides free base tiles. Use MapLibre.

### 5.3 Calculation Engine (HIGH confidence)

Financial calculations in JavaScript require `decimal.js` — this is non-negotiable. Native IEEE 754 floats drift in duty/tariff calculations compounding across containers. Every monetary operation must use `decimal.js`.

Validated library set for calculators:
- `decimal.js` — precise arithmetic
- `currency.js` — formatting + currency arithmetic
- `convert-units` — CBM/ft³/kg/lbs conversions
- `date-fns` — transit time and ETA calculations

### 5.4 Data Layer (HIGH confidence)

- `@tanstack/react-table v8` — standard for sortable/filterable HTS lookup and route comparison tables
- `Fuse.js` or `FlexSearch` — client-side fuzzy search for 100K+ HTS entries (FlexSearch is faster at scale)
- `Zustand` — calculator state management (lightweight, works with App Router)
- `nuqs` — URL query state sync for shareable calculator links
- `react-hook-form` + `zod` — calculator input forms with HTS code format validation

### 5.5 PDF Generation (HIGH confidence)

`@react-pdf/renderer v4.3.x` — 1.4M weekly downloads, React component model, works in Vercel serverless. Pure Node.js, no Chrome binary needed. **Caution:** Complex multi-page PDFs with charts may hit Vercel's serverless timeout. Start with table-based PDFs only.

### 5.6 Architecture Pattern (HIGH confidence)

Monolith-first is the right call for Phase 1:

```
Browser
  |
  +-- Next.js App Router (Vercel)
       |
       +-- Server Components (HTS lookup tables, static content, port data)
       |     +-- /data/*.json (HTS, duty rates, ports, routes, FTZ — all static)
       |
       +-- Client Components (calculators, maps, interactive tools)
       |     +-- Zustand stores + nuqs (URL state)
       |
       +-- API Routes (/api/calculate/*, /api/export/pdf, /api/hts/search)
```

**Anti-patterns explicitly avoided:** Database for static data; server-only calculations; monolithic map component; live API calls on page load; microservices/message queues.

### 5.7 Risks and Unknowns in the Stack

| Risk | Severity | Mitigation |
|------|----------|------------|
| `searoute-js` low adoption (306 downloads/week) | MEDIUM | Test with 10+ real SE Asia → US port pairs before committing. Fallback: Searoutes API (paid) |
| HTS JSON structure unknown until download | LOW | Inspect after download, build adapter layer |
| Vercel PDF generation timeout for complex reports | MEDIUM | Start with simple table-based PDFs; add complexity incrementally |
| MapLibre free tile quota limits | LOW | MapTiler free tier is 100K tile requests/month — sufficient for Phase 1 |

---

## 6. Regulatory & Compliance Findings

### 6.1 ISF (Importer Security Filing) — "10+2" Rule

**Critical finding:** The 24-hour ISF deadline runs from vessel **departure** from the last foreign port — not 24 hours before US arrival. This is widely misunderstood and the software must model it correctly.

Key facts for platform design:
- **ISF-10** required for all standard ocean imports into US commerce
- **$5,000 penalty per late filing** (per bill of lading, per shipment)
- Filing must include 6-digit HTS minimum; entry requires full 10-digit
- ISF must be matched to a subsequent CBP Entry Number within a defined window
- ISF-5 applies only for FROB, T&E, IE, and FTZ-admission-without-consumption entries

**Software implication:** ISF deadline tracker must calculate 24 hours before vessel departure, not arrival. Flag shipments at 48h and 24h windows.

### 6.2 Foreign Trade Zone (FTZ) Regulations

The most legally complex area researched. Key regulatory framework:

- **Statute:** Foreign Trade Zones Act of 1934 (19 U.S.C. §§ 81a–81u)
- **Regulations:** 19 CFR Part 146
- **Bodies:** FTZ Board (Commerce), CBP (enforcement), OFIS (database)
- **Scale:** 260+ general-purpose zones, 500+ subzones nationwide

**Privileged Foreign (PF) vs. Non-Privileged Foreign (NPF) Status** — the single most important FTZ decision:

| Status | Duty Rate Applied | When to Use |
|--------|-----------------|-------------|
| PF | Rate on **admission date** (locks in current rate) | When tariff increases are anticipated |
| NPF | Rate on **entry/withdrawal date** (floats with market) | When rates may decrease, or manufacturing changes classification |

**Critical 2025 regulatory change:** Executive Order 14257 ("Liberation Day," April 2025) mandated that goods subject to reciprocal tariffs **must** elect PF status upon FTZ admission. NPF is no longer available for reciprocal-tariff-scope goods. The FTZ Savings Analyzer must model this mandatory PF requirement.

**PF status is irrevocable** once elected — the platform must surface this clearly and prevent users from making uninformed FTZ strategy decisions.

### 6.3 Section 301 Tariffs (China/SE Asia Trade War)

Current state (March 2026):
- Multiple tariff modifications since original 2018 orders
- September 2024 USTR modifications increased duties on 14 strategic sectors
- Section 301 tariffs on China goods remain in effect; SE Asia tariffs differ by country
- Vietnam, Thailand, Indonesia, Cambodia have different baseline rates and Section 301 exposure

**Software implication:** The tariff scenario modeling tool must allow users to model rate changes. Tariff data must display the dataset date prominently with disclaimer to verify at hts.usitc.gov.

### 6.4 Record Retention Requirements

Under 19 USC 1508 and 19 CFR Part 163:
- **5-year retention** required for all import records from date of entry
- Records subject to CBP demand include: entry summaries (CBP Form 7501), commercial invoices, packing lists, bills of lading, ISF filings, HTS classification records, bonds, powers of attorney
- Electronic records acceptable if maintained per 19 CFR 163.5 requirements

**Software implication:** Document storage feature must be designed for 5-year retention with audit trail. This is a compliance requirement, not a nice-to-have.

### 6.5 Hidden Import Costs (The 15–25% Gap)

The biggest surprise in compliance research: most platforms and importers dramatically underestimate total landed costs. Beyond freight + duty, these costs add 15–25%:

| Cost Category | Typical Amount |
|---------------|---------------|
| Merchandise Processing Fee (MPF) | 0.3464% of customs value (min $31.67, max $614.35) |
| Harbor Maintenance Fee (HMF) | 0.1250% of dutiable value |
| ISF filing fee | $25–$75 per shipment |
| Customs broker clearance | $150–$400 per entry |
| Customs bond (continuous) | $500–$2,000/year or single-entry bond per shipment |
| Demurrage | $150–$300/day after free time |
| Detention | $100–$250/day after free time |
| Chassis fee | $20–$40/day |
| Container exam (VACIS, CET, tailgate) | $300–$1,500+ if selected |

**Software implication:** The landed cost calculator must include all 15+ cost components by default. A calculator that shows only freight + duty is misleading for actual business decisions.

---

## 7. User Research Findings

### 7.1 Who We're Building For (Validated from PROJECT.md)

**Primary user: Blake** — the founder/operator:
- Handles 96–97% of cold chain exports through a major Lineage terminal
- Currently performs freight brokerage manually: researches vessels, presents 3 options to customers with pricing tiers based on backhaul availability and transshipment routes
- Expanding into SE Asia consumer goods imports (apparel, CPG)
- Operations partner based in Costa Rica

**Secondary users:** Blake's customers and prospective investors/partners who will see the proposal site.

### 7.2 Key Pain Points (Inferred from Research)

1. **Manual freight brokerage workflow** — researching vessels, pricing tiers, backhaul availability all done manually without tooling support
2. **Complex duty/tariff calculations** — SE Asia import unit economics require HTS lookup + duty rate + FTZ strategy modeling that currently must be done in spreadsheets
3. **FTZ strategy complexity** — PF vs. NPF elections, incremental withdrawal timing, and new mandatory PF requirements under April 2025 EO are difficult to model without dedicated tools
4. **Hidden import costs** — demurrage, detention, exam fees, MPF/HMF are frequently underestimated in initial cost projections
5. **Communicating the platform vision** — needs a polished proposal site to communicate the digital platform vision to partners and investors

### 7.3 The "First on the Silk Road" Advantage

A key strategic insight from the project context: Blake's SE Asia sourcing strategy is about finding high-quality products before competitors discover them. This means the platform needs to support exploratory route and cost analysis for new product categories — not just optimizing known supply chains. The HTS code lookup and landed cost calculator serve this exploratory use case directly.

---

## 8. Key Insights and Surprises

### Insight 1: All Critical Data is Free

The assumption that building a logistics analytics platform would require expensive data subscriptions (MarineTraffic, carrier APIs, Zonos) is wrong for Phase 1. USITC, CBP CROSS, OFIS, Federal Register, and carrier DCSA APIs provide everything needed for a fully functional proposal tool at zero cost.

### Insight 2: FTZ is the Real Moat

Nobody in the market has a modern FTZ analysis tool. Descartes has legacy FTZ software (QuestaWeb) via acquisition, but it's enterprise-only and hasn't been modernized. The April 2025 executive order on reciprocal tariffs created urgent demand for FTZ strategy tools precisely when the market is most hungry for them. This is the #1 competitive differentiator to build first.

### Insight 3: The Stack is Remarkably Settled

There's no real technology debate here. The mapping stack (MapLibre + deck.gl), calculation libraries (decimal.js + currency.js), and data layer (@tanstack/react-table + Fuse.js + Zustand) are well-established, widely-adopted choices with clear advantages over alternatives. Zero risky bets in the stack.

### Insight 4: AI for Tariff Classification is Validated

The ATLAS benchmark paper (2025) demonstrated that fine-tuned models trained on CBP CROSS rulings outperform frontier models (GPT-5-Thinking, Gemini-2.5-Pro) on HTS classification tasks. The training data (220K+ rulings) is public domain. This validates an AI classification layer as a defensible moat for Phase 3+.

### Insight 5: Backhaul Pricing is Blake's Competitive Secret

Blake's current manual workflow centers on presenting customers with "3 options based on backhaul availability and transshipment routes." This backhaul intelligence is the core of his value proposition and it's completely absent from every platform in the market. Building a formalized backhaul pricing tool would codify his existing advantage as a platform feature.

### Insight 6: ISF Deadline is Universally Misunderstood

The ISF filing deadline is 24 hours before vessel departure from the last foreign port — not 24 hours before US arrival. Almost every logistics software description gets this wrong. Correctly modeling this (with 48h and 24h alerts based on departure schedules) is a genuine accuracy differentiator.

### Surprise 1: Flexport Added Customs/Tariff Features in 2025

Flexport launched a "Customs Technology Suite" in 2025 with a tariff simulator, real-time tariff alerts, and landed cost calculations. This is new competitive overlap with our proposed features. However, Flexport is a full-stack freight forwarder — their tools are embedded in their operational platform, not standalone analysis tools available to importers using other forwarders.

### Surprise 2: searoute-js Has Only 306 Weekly Downloads

The offline maritime route calculation library (searoute-js) that underpins the map visualization layer has very low adoption. While it appears functional, it must be validated with real SE Asia → US port pairs before committing to it as the primary route polyline generator. The paid Searoutes API is the production fallback.

### Surprise 3: Cold Chain Market is $361B and Underserved by Tech

Cold chain logistics is a massive, growing market ($361B in 2025) with no dominant technology platform. Incumbents are physical-asset companies (Lineage, Americold) or niche visibility tools. The integrated cold chain + freight brokerage + compliance platform opportunity is larger than initially assumed.

---

## 9. Assumptions Validated vs. Invalidated

### Validated

| Assumption | Evidence |
|------------|---------|
| Free US government data is sufficient for Phase 1 calculators | USITC HTS JSON download confirmed; OFIS FTZ database confirmed; UN/LOCODE confirmed |
| MapLibre + deck.gl is the right free mapping stack | Both libraries confirmed actively maintained and widely used; deck.gl at v9.2.11 |
| FTZ is an underserved market gap | Competitive matrix confirms only Descartes has FTZ software, and it's legacy |
| Cold chain is a genuine market differentiator | $361B market with no integrated cold chain + freight brokerage platform confirmed |
| Major carriers now have public APIs | Maersk, CMA CGM, Hapag-Lloyd all have free self-service API portals |
| decimal.js is necessary for financial calculations | IEEE 754 float issues confirmed; decimal.js is the standard solution |

### Invalidated

| Assumption | Reality |
|------------|---------|
| NPF FTZ status allows duty optimization by waiting | April 2025 EO mandates PF status for reciprocal-tariff-scope goods — NPF advantage is gone for most SE Asia imports |
| ISF deadline is 24h before US port arrival | Deadline is 24h before vessel departure from last foreign port — a meaningful difference for ISF tracker design |
| All platforms miss customs/tariff features | Flexport launched a Customs Technology Suite in 2025 with tariff simulation — partial overlap now exists |
| PDF generation is straightforward on Vercel | Vercel serverless timeout is a real constraint for complex multi-page reports with charts |

### Partially Validated (Needs More Data)

| Assumption | Status |
|------------|--------|
| searoute-js will generate accurate maritime route polylines | Library exists and is functional, but 306/week downloads is concerning; needs hands-on testing |
| SE Asia duty rates can be compiled from USITC DataWeb | Data source confirmed; actual compilation effort unknown until attempted |
| Fuse.js performs adequately on 100K+ HTS entries | FlexSearch may be needed; test with actual HTS dataset before committing |

---

## 10. Critical Unknowns Still to Resolve

### Unknown 1: HTS JSON Structure
**Risk:** MEDIUM. The USITC HTS JSON download has not been inspected. The field names, nesting structure, and completeness of the duty rate columns are unknown. This affects the HTS lookup feature and all calculator features.
**Resolution:** Download and inspect the JSON export as Phase 2 first action. Build adapter layer to normalize before importing.
**Owner:** Phase 2 data foundation task.

### Unknown 2: searoute-js Real-World Accuracy
**Risk:** MEDIUM. The library has 306 weekly npm downloads and no published accuracy benchmarks for SE Asia → US routes. Route accuracy affects the route comparison tool and map visualization.
**Resolution:** Test with 10+ real port pairs (HCMC → Long Beach, Bangkok → Seattle, Jakarta → New York) and compare against published carrier transit times. If results are off by >10%, switch to Searoutes API (paid).
**Owner:** Phase 3 visualization task.

### Unknown 3: SE Asia Duty Rate Data Quality
**Risk:** LOW-MEDIUM. SE Asia duty rates need manual compilation from USITC DataWeb for Vietnam, Thailand, Indonesia, and Cambodia. The effort required and completeness of the resulting dataset are unknown.
**Resolution:** Attempt compilation in Phase 2. Scope to the top 50 HTS codes most common in SE Asia apparel and CPG if full compilation is too large.
**Owner:** Phase 2 data foundation task.

### Unknown 4: Blake's Actual Workflow Details
**Risk:** MEDIUM. Research inferred Blake's pain points from the project description. We do not have a formal user interview. The proposal site's effectiveness depends on accurately reflecting his workflow.
**Resolution:** Walk Blake through the Phase 1 proposal site and collect feedback before Phase 2 planning. This is the primary validation mechanism.
**Owner:** Post-Phase-1 client review.

### Unknown 5: UFLPA Compliance Depth for SE Asia
**Risk:** HIGH (legal). The Uyghur Forced Labor Prevention Act creates rebuttable presumption rules for goods from Xinjiang, China — but its enforcement against goods transiting through SE Asia (e.g., goods manufactured in Vietnam from Chinese inputs) is an evolving area. The platform needs a clear compliance posture.
**Resolution:** Scope the compliance checklist feature to educational guidance with disclaimers; recommend customs attorneys for UFLPA determinations. This is not a legal risk we can eliminate through software.
**Owner:** Phase 5 knowledge base task.

### Unknown 6: Cold Chain Reefer Premium Ranges
**Risk:** LOW. Reefer container cost premiums over dry containers vary significantly by season, route, and capacity. The data needed for the cold chain cost overlay is not publicly available in structured form.
**Resolution:** Present ranges with methodology disclosure, not exact numbers. Source from industry publications (DREWRY, Container xChange). Label prominently as "indicative ranges."
**Owner:** Phase 3+ cold chain feature.

---

## 11. Recommended Next Steps for Phase 2

Phase 2 planning should begin immediately after the Phase 1 proposal site is shipped and validated. The recommended Phase 2 scope is the **data foundation + core calculators** — specifically:

### Immediate Pre-Phase-2 Actions
1. **Download and inspect USITC HTS JSON export** — understand the schema, field names, and revision structure before planning the HTS lookup feature
2. **Test searoute-js** with 10+ SE Asia → US West Coast / East Coast port pairs
3. **Register for Maersk and CMA CGM API portals** — these are free but require account creation; start the registration before Phase 2 begins
4. **Walk Blake through the Phase 1 proposal site** — collect feedback to validate priorities before Phase 2 planning

### Phase 2 Feature Priorities (in dependency order)

1. **HTS Code Lookup + Static Duty Rate Dataset** — foundation for everything else
2. **Landed Cost Calculator** — core value prop; uses HTS + duty rates + all hidden cost components
3. **Unit Economics Breakdown** — tells the business story from origin to retail
4. **Container Utilization Calculator** — standalone tool, high value, low complexity
5. **FTZ Savings Analyzer** — #1 differentiator; build after tariff engine is stable

### Phase 2 Technical Decisions to Resolve
- FlexSearch vs. Fuse.js for 100K+ HTS entries — test with actual dataset
- URL state sync (nuqs) scope — which calculators get shareable URLs first
- PDF report format for landed cost — define template before building @react-pdf/renderer integration

### Phase 2 Data Tasks
- Download USITC HTS JSON, inspect schema, build normalizer
- Compile SE Asia duty rates (Vietnam, Thailand, Indonesia, Cambodia) from USITC DataWeb
- Compile FTZ location dataset from OFIS (260+ zones)
- Curate static carrier route dataset (top 10 SE Asia → US routes with transshipment points)
- Compile container specs dataset (20ft, 40ft, 40ft HC, reefer dimensions and weight limits)

### Phase Ordering Rationale

```
Phase 1: Proposal site (vision communication, no data dependencies)
Phase 2: Data foundation + core calculators (tariff engine first)
Phase 3: Visualization layer (maps and charts need Phase 2 data)
Phase 4: FTZ Analyzer + tariff scenario modeling (depends on tariff engine)
Phase 5: Knowledge base + compliance docs + PDF export
Phase 6: Dashboard + tracking (aggregates everything from Phases 2–5)
```

---

## 12. Research Confidence Ratings

| Research Area | Confidence | Rationale |
|---------------|------------|-----------|
| **Competitive landscape** | HIGH | 10 competitors analyzed with verified sources; competitive matrix cross-referenced; market gaps confirmed by absence of features across all platforms |
| **Market size** | HIGH | Multiple independent market research firms cited with consistent order-of-magnitude findings |
| **Free government data sources** | HIGH | USITC, OFIS, Federal Register, World Port Index, UN/LOCODE all verified with confirmed URLs and access methods |
| **Carrier schedule APIs** | MEDIUM-HIGH | Top 4 carrier API portals verified to exist; hands-on testing of rate limits and response formats not yet done |
| **Core technology stack** | HIGH | All libraries verified with current version numbers, npm download counts, and active maintenance status |
| **Mapping stack (MapLibre + deck.gl)** | HIGH | Both libraries widely adopted, well-documented, confirmed free licensing |
| **searoute-js for route polylines** | MEDIUM | Library exists and is functional; low adoption (306/week) creates risk; needs validation testing |
| **FTZ regulatory framework** | HIGH | Based on current 19 U.S.C. §§ 81a–81u, 19 CFR Part 146, CBP.gov, and FTZ Board guidance |
| **ISF 10+2 requirements** | HIGH | Based on current 19 CFR Part 149 and CBP.gov guidance; departure-not-arrival deadline confirmed |
| **Section 301 tariff current state** | MEDIUM-HIGH | Documented from USTR.gov and Federal Register but tariff policy is actively changing; requires ongoing monitoring |
| **April 2025 EO FTZ impact** | HIGH | Executive Order 14257 and CBP guidance documented; mandatory PF for reciprocal-tariff-scope goods confirmed |
| **Hidden import cost components** | HIGH | MPF/HMF rates confirmed from CBP.gov; demurrage/detention ranges confirmed from Container xChange 2025 data |
| **User pain points (Blake's workflow)** | MEDIUM | Inferred from project description; no formal user interview yet; proposal site validation is the resolution mechanism |
| **Cold chain reefer cost ranges** | LOW | Industry ranges exist but vary significantly by season/route/capacity; structured data not publicly available |
| **AI tariff classification feasibility** | HIGH | ATLAS benchmark paper (2025) provides empirical validation; CBP CROSS training data confirmed public domain |

---

*Phase 1 Research completed: 2026-03-26*
*Prepared for: Phase 2 Planning (Data Foundation + Core Calculators)*
*Ready for roadmap: Yes*
