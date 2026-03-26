# Project Research Summary

**Project:** Shipping Logistics Platform
**Domain:** International freight/cold chain logistics analysis + proposal platform
**Researched:** 2026-03-26
**Confidence:** MEDIUM-HIGH

## Executive Summary

This is a logistics analysis and proposal platform for an international freight operator who dominates cold chain exports (96-97% of a major Lineage terminal) and is expanding into SE Asia consumer goods imports. The platform combines interactive calculators (landed cost, unit economics, tariff/duty, FTZ savings, container utilization), carrier route comparison with map visualization, and a comprehensive knowledge base — all wrapped in a premium proposal website.

The recommended approach is a **Next.js 14 monolith with static JSON data** for Phase 1. All critical data sources (USITC HTS tariff schedule, OFIS FTZ database, UN/LOCODE ports, World Port Index) are **free from US government sources**. Calculators run client-side as pure TypeScript functions using `decimal.js` for financial precision. Maps use the free MapLibre GL + deck.gl stack for WebGL-accelerated route visualization. No database, no auth, no paid APIs needed for Phase 1.

The key differentiator is the **FTZ Savings Analyzer with incremental withdrawal modeling** — zero competitors offer this. No existing platform combines FTZ strategy + freight brokerage + cold chain hybrid. The biggest risks are tariff data staleness (HTS rates change with policy), FTZ status election permanence (irrevocable once chosen), and hidden import costs that add 15-25% beyond freight + duty (demurrage, detention, exam fees, MPF, HMF, bond costs).

## Key Findings

### Recommended Stack

Core: Next.js 14 (App Router) + TypeScript + Tailwind CSS on Vercel.

**Key libraries:**
- **MapLibre GL + deck.gl + react-map-gl** — Free WebGL map rendering with ArcLayer for shipping routes. Zero licensing cost.
- **Recharts + @tremor/react** — Dashboard charts and KPI cards, built on Tailwind.
- **decimal.js + currency.js** — Financial calculation precision (critical).
- **@react-pdf/renderer** — PDF documents from React components.
- **@tanstack/react-table** — HTS lookup, carrier comparison tables.
- **searoute-js** — Offline maritime route polylines (LOW-MEDIUM confidence, needs testing).
- **Fuse.js or FlexSearch** — Client-side fuzzy search for 100K+ HTS entries.

**Free data sources (verified):**
- USITC HTS REST API + downloadable JSON — tariff/duty rates
- USITC DataWeb — historical trade statistics by country
- OFIS (trade.gov) — 260+ FTZ locations
- UN/LOCODE — 100K+ port codes
- World Port Index (NGA) — 3,700+ ports with coordinates
- Maersk Developer Portal — free carrier schedule API
- CMA CGM API Portal — free schedule API

### Expected Features

**Must have (table stakes):**
- Landed cost calculator, HTS code lookup, unit economics breakdown
- Container utilization calculator, route/carrier comparison
- Interactive shipping route map, PDF export, data tables

**Differentiators (competitive advantage):**
- FTZ savings analyzer with incremental withdrawal modeling (#1 differentiator — zero competitors)
- Backhaul pricing intelligence (invisible in all competitor platforms)
- Tariff scenario modeling, cold chain cost overlay
- Multi-scenario comparison (side-by-side A vs B vs C)

**Defer (v2+):**
- Live carrier APIs, vessel schedule aggregator, BOL generator, live AIS tracking, auth/multi-tenancy

### Architecture Approach

Monolith-first with 6 logical service components. Pure TypeScript calculators client-side. Static JSON datasets. Server components for data pages, client components for interactive tools. API routes only for PDF generation.

### Critical Pitfalls

1. **Floating-point arithmetic** — MUST use `decimal.js` from day one
2. **Stale tariff data** — Always display dataset date, add disclaimers
3. **FTZ status elections permanent** — April 2025 executive order mandates PF status for reciprocal-tariff-scope goods
4. **Hidden import costs (15-25%)** — 15+ components most platforms miss (demurrage, detention, exam fees, MPF, HMF, bond)
5. **Container weight vs. volume** — Must compute BOTH, use the lower one
6. **ISF penalties** — $5,000 per late filing (24h before vessel DEPARTURE, not arrival)
7. **HTS classification complexity** — 17,000+ codes, CBP collected $600M+ in misclassification penalties

## Implications for Roadmap

### Phase 1: Proposal Site + Wireframes
**Rationale:** Communicate vision first. Zero external dependencies.
**Delivers:** Interactive proposal website, platform wireframes, architecture diagrams, revenue model
**Addresses:** Proposal & Presentation requirements

### Phase 2: Data Foundation + Core Calculators
**Rationale:** Tariff Engine is the foundation — every calculator depends on it.
**Delivers:** Static JSON datasets, landed cost calculator, unit economics, container utilization, HTS lookup
**Uses:** USITC HTS data, decimal.js, @tanstack/react-table, Fuse.js

### Phase 3: Visualization Layer
**Rationale:** Maps and charts need data from Phase 2.
**Delivers:** Interactive route map, port visualization, route comparison, dashboard charts
**Implements:** MapLibre + deck.gl + react-map-gl, Recharts dashboards

### Phase 4: FTZ Analyzer + Tariff Scenarios
**Rationale:** Most specialized feature, depends on tariff engine. #1 differentiator.
**Delivers:** FTZ savings analyzer, tariff scenario modeling, multi-scenario comparison

### Phase 5: Knowledge Base + Documents
**Rationale:** SOPs and compliance checklists need earlier phases' context.
**Delivers:** Import process knowledge base, compliance checklists, PDF export

### Phase 6: Dashboard + Tracking
**Rationale:** Aggregates all tools — needs everything else first.
**Delivers:** Shipment tracking, cost/margin dashboard, cold chain views

### Phase Ordering Rationale
- Data before tools: every calculator needs HTS/port/route data
- Calculators before visualization: maps need validated route data
- FTZ after tariff engine: savings comparison requires duty rate calculations
- Knowledge base after calculators: SOPs reference the same data
- Dashboard last: aggregates everything

### Research Flags
- **Phase 2:** HTS dataset structure needs inspection after download
- **Phase 3:** searoute-js needs testing with SE Asia port pairs
- **Phase 4:** FTZ regulations complex — scope to federal only initially

Standard patterns (skip research):
- **Phase 1:** Standard Next.js proposal site
- **Phase 5:** PDF generation and content — straightforward
- **Phase 6:** Dashboard with Recharts/Tremor — established patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All libraries verified current, active maintenance |
| Data Sources | HIGH | USITC, OFIS, UN/LOCODE verified free and official |
| Features | MEDIUM-HIGH | Competitor analysis cross-referenced; FTZ gap confirmed |
| Architecture | HIGH | Standard Next.js patterns |
| Pitfalls | HIGH | Verified against CBP.gov, 19 CFR, official sources |
| Mapping | MEDIUM | deck.gl/MapLibre verified; searoute-js needs testing |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address
- SE Asia country-specific duty rates need manual compilation from USITC DataWeb
- searoute-js needs testing with real SE Asia → US port pairs
- HTS JSON field structure needs inspection after download
- Cold chain reefer container cost premiums need industry research
- UFLPA compliance depth for SE Asia sourcing needs legal guidance

## Sources

### Primary (HIGH confidence)
- USITC HTS API (hts.usitc.gov), OFIS FTZ Database (ofis.trade.gov), CBP.gov
- deck.gl v9.2.11, react-map-gl v8.1.0, Terminal49 container tracking

### Secondary (MEDIUM confidence)
- Flexport/Freightos product analysis, Searoutes API docs, MarineTraffic/Kpler

### Tertiary (LOW confidence)
- searoute-js (306/week npm), Descartes CustomsInfo (pricing unknown)

---
*Research completed: 2026-03-26*
*Ready for roadmap: yes*
