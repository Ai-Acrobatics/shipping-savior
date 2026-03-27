# Stack Research: International Shipping/Logistics Platform

**Domain:** International Shipping/Logistics Platform
**Researched:** 2026-03-26
**Overall Confidence:** MEDIUM (strong on frontend/visualization stack, moderate on data sources due to API access variability)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js 14 | 14.x (App Router) | Full-stack framework | **Project constraint.** App Router enables server components for heavy data tables, API routes for calculation engines, and ISR for tariff data caching. |
| TypeScript | 5.x | Type safety | Non-negotiable for logistics — HTS codes, duty rates, container dimensions, and currency calculations demand strict typing to prevent costly errors. |
| Tailwind CSS | 3.4+ | Styling | **Project constraint.** Utility-first works well for data-dense dashboard layouts. |
| Vercel | N/A | Deployment | **Project constraint.** Edge functions useful for calculator APIs. Serverless functions for PDF generation. |

### Mapping & Route Visualization

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| **react-map-gl** | 8.1.0 | React wrapper for map rendering | The standard React binding for both Mapbox GL and MapLibre GL. Rewritten in v7 — bundle dropped from 219k to 57k. Integrates natively with deck.gl. **HIGH confidence.** |
| **MapLibre GL JS** | 4.x | Vector tile map renderer | Free, open-source fork of Mapbox GL (BSD-2-Clause license). Zero licensing cost vs. Mapbox's pay-per-load model. Use with free tile providers (MapTiler free tier, or self-hosted PMTiles). **HIGH confidence.** |
| **deck.gl** | 9.2.x | Advanced route visualization layers | ArcLayer for origin-destination shipping routes, TripsLayer for animated vessel movement, GeoJsonLayer for port polygons and FTZ boundaries. WebGL2-powered, handles thousands of routes without performance issues. Used by Uber, Kepler.gl. **HIGH confidence.** |
| **searoute-js** | 0.1.0 | Maritime route calculation (offline) | Open-source (MPL-2.0) based on Eurostat's marnet dataset. Calculates shortest sea routes as GeoJSON LineStrings between any two coordinates. Returns distance in nautical miles. Perfect for Phase 1 offline route visualization — no API costs. **MEDIUM confidence** (low npm downloads, but functional for visualization purposes). |

**Recommended Map Architecture:**
```
react-map-gl (React bindings)
  -> MapLibre GL JS (free renderer, no API key needed for rendering)
  -> deck.gl overlays (ArcLayer for routes, ScatterplotLayer for ports)
  -> searoute-js (offline route polyline generation)
  -> MapTiler free tier OR Protomaps (free tile hosting for base map)
```

### Data Visualization (Dashboard Charts)

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| **Recharts** | 3.8.x | Dashboard charts (bar, line, area, pie) | Most popular React charting library (24.8K GitHub stars). Built on D3. Declarative API fits React paradigm perfectly. Use for: cost breakdowns, duty rate comparisons, container utilization visualizations, unit economics charts. **HIGH confidence.** |
| **@tremor/react** | 3.x | Pre-built dashboard components | Built on Recharts + Tailwind CSS + Radix UI. Provides ready-made KPI cards, metric displays, and chart wrappers that match Tailwind styling. Excellent for rapid dashboard prototyping. Use for: high-level KPI displays, tracking dashboards. **HIGH confidence.** |

**Why Recharts over Nivo:** Recharts has better Tailwind integration (via Tremor), simpler API for standard chart types, and is what Tremor is built on top of. Nivo is better for exotic chart types we don't need.

### PDF Document Generation

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| **@react-pdf/renderer** | 4.3.x | Bill of Lading, commercial invoices, landed cost reports | React component model for PDF generation. Server-side rendering in API routes. Supports styled layouts, tables, images — everything needed for shipping documents. 1.4M weekly npm downloads. **HIGH confidence.** |

### Calculation Engine Libraries

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| **decimal.js** | 10.x | Precise financial calculations | Avoids floating-point errors in duty/tariff/cost calculations. Critical for landed cost math where fractions of cents matter at scale. |
| **currency.js** | 2.x | Currency formatting and arithmetic | Handles multi-currency display (USD, VND, THB, IDR) with proper rounding. |
| **convert-units** | 3.x | Unit conversion (CBM, ft3, kg, lbs) | Container dimensions, weight calculations, volume conversions between metric and imperial. |
| **date-fns** | 3.x | Date handling for vessel schedules | ETAs, transit times, schedule parsing. Lighter than moment.js, tree-shakeable. |

### Data Tables

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| **@tanstack/react-table** | 8.x | Sortable, filterable data tables | HTS code lookup tables, carrier comparison grids, shipment tracking lists. Headless — styles with Tailwind. The standard for complex React tables. **HIGH confidence.** |

### Form Handling

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| **react-hook-form** | 7.x | Calculator input forms | Landed cost calculator, container configurator, FTZ analyzer all need complex multi-step forms. Minimal re-renders, great validation. |
| **zod** | 3.x | Schema validation | Validates HTS codes (format: XXXX.XX.XXXX), container dimensions, weight limits, duty rate ranges. |

---

## Data Sources & APIs

### Tariff & Duty Data

| Source | Access | Cost | Data Provided | Confidence |
|--------|--------|------|---------------|------------|
| **USITC HTS REST API** | REST API (JSON) `hts.usitc.gov/reststop/search?keyword=X` | **Free** | US Harmonized Tariff Schedule — HTS codes, duty rates, special program rates, unit of quantity. Returns up to 100 results per query. | **HIGH** — official US government source, verified endpoint exists |
| **USITC HTS Data Downloads** | CSV/JSON/Excel download from `hts.usitc.gov` | **Free** | Complete HTS schedule for offline/cached use. Better for Phase 1 — download full dataset, index locally. | **HIGH** — confirmed multiple download formats available |
| **USITC DataWeb** | Web interface + data export at `dataweb.usitc.gov` | **Free** | Historical trade statistics, tariff rates by country, import/export volumes. | **HIGH** — official USITC resource |
| **Zonos Landed Cost API** | GraphQL API | **$2/order + 10% of duties** | Calculates duties, taxes, fees for 200+ countries. HS code classification. Guaranteed landed cost. | **MEDIUM** — verified pricing and API docs, but expensive for Phase 1 |
| **Descartes CustomsInfo** | Enterprise API | **Paid (enterprise pricing)** | Global trade content, HS codes, rulings, compliance. Used by major freight platforms. | **LOW** — no public pricing found |

**Phase 1 Recommendation:** Download the full HTS schedule as JSON from USITC, build a local search index with Fuse.js or FlexSearch. This gives instant HTS code lookup with zero API costs. Store duty rates for SE Asian countries (Vietnam, Thailand, Indonesia, Cambodia) in a local JSON dataset compiled from USITC DataWeb exports.

### Vessel Tracking & AIS Data

| Source | Access | Cost | Data Provided | Confidence |
|--------|--------|------|---------------|------------|
| **MarineTraffic / Kpler** | REST API | **Paid** (tiered, starts ~$100/mo) | Largest AIS network globally (13,000+ receivers). Real-time vessel positions, port calls, ETAs. | **HIGH** — industry standard |
| **Datalastic** | REST API | **Freemium** (limited free tier) | Real-time + historical AIS data, vessel details, port data. | **MEDIUM** — verified API exists |
| **AISHub** | Data exchange (JSON/XML) | **Free** (contribute AIS data to receive) | Community-sourced AIS vessel positions. Coverage gaps. | **MEDIUM** — free but unreliable coverage |
| **VesselFinder API** | REST API | **Paid** (tiered) | AIS positions, voyage data, port calls. | **MEDIUM** — verified API exists |

**Phase 1 Recommendation:** Use static/mock vessel position data for the tracking dashboard. For route visualization, use `searoute-js` to generate realistic polylines between ports. Live AIS integration is a Phase 2+ concern — all providers are paid and require partnership agreements.

### Carrier Schedules

| Source | Access | Cost | Data Provided | Confidence |
|--------|--------|------|---------------|------------|
| **Maersk Developer Portal** | REST API at `developer.maersk.com` | **Free** (registration required) | Scheduling API, tracking API, booking API. Self-service portal. | **HIGH** — verified portal and API catalogue |
| **CMA CGM API Portal** | REST API at `api-portal.cma-cgm.com` | **Free** (registration required) | Schedule search, tracking, booking. | **HIGH** — verified API portal |
| **Searoutes API** | REST API at `developer.searoutes.com` | **Paid** (tiered) | Port-to-port routes with distance/duration, considers vessel dimensions, SECA zones, canal transits. Up to 20 waypoints. UN/LOCODE support. | **HIGH** — verified comprehensive API docs |
| **GoComet** | Aggregator platform | **Paid** | Aggregates schedules from Maersk, MSC, CMA CGM, COSCO, ONE, Evergreen, Yang Ming. | **MEDIUM** — verified as aggregator |

**Phase 1 Recommendation:** Compile a static dataset of major SE Asia -> US West Coast / East Coast routes from publicly available carrier schedule pages. Store as JSON with port pairs, transit times, transshipment points, and typical vessel types. This avoids API costs while providing realistic data for the comparison tool.

### Container Tracking APIs (Phase 2+)

| Source | Access | Cost | Data Provided | Confidence |
|--------|--------|------|---------------|------------|
| **Terminal49** | REST API (webhooks) | **Free tier** (100 containers) | All US terminals + major steamship lines. Push-based updates via webhooks. Clean JSON. | **HIGH** — verified free developer tier |
| **Vizion API** | REST API | **Paid** | API-first container tracking. Multi-source data (EDI, AIS, port/terminal). 6-hour refresh. | **HIGH** — verified API docs |

### Foreign Trade Zone (FTZ) Data

| Source | Access | Cost | Data Provided | Confidence |
|--------|--------|------|---------------|------------|
| **OFIS (Online FTZ Information System)** | Web database at `ofis.trade.gov/Zones` | **Free** | All 260+ FTZ projects, ~400 subzones. Contact info, site details, Federal Register notices. | **HIGH** — official ITA/Commerce Dept source |
| **FTZ Board (trade.gov)** | Web + PDF downloads | **Free** | FTZ regulations (15 CFR Part 400), FTZ Act (19 U.S.C. 81a-81u), annual reports, board orders. | **HIGH** — official source |
| **NAFTZ** | Web resources at `naftz.org` | **Free** | Industry resources, FTZ production database, links. | **MEDIUM** |

**Phase 1 Recommendation:** Scrape/compile FTZ location data from OFIS into a structured JSON dataset with zone numbers, locations, operators, and subzone details. Build the FTZ savings analyzer using static duty rate data + user-inputted current vs. FTZ rates.

### Port & Terminal Data

| Source | Access | Cost | Data Provided | Confidence |
|--------|--------|------|---------------|------------|
| **UN/LOCODE** | Download from UNECE | **Free** | Standard port codes used globally. ~100K locations. | **HIGH** |
| **World Port Index (NGA)** | Download from NGA | **Free** | 3,700+ ports with coordinates, facilities, depths. | **HIGH** |
| **APM Terminals API** | REST API at `developer.apmterminals.com` | **Free** (registration) | Vessel schedules for APM Terminals (Maersk subsidiary). | **MEDIUM** |

---

## Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Fuse.js** or **FlexSearch** | Client-side fuzzy search for HTS codes | FlexSearch is faster for large datasets (100K+ HTS entries). Fuse.js has better fuzzy matching for typo-tolerant search. |
| **Zustand** | State management for calculator tools | Lightweight, works well with Next.js App Router. Stores calculator state, comparison selections, saved scenarios. |
| **nuqs** | URL query state sync | Keeps calculator inputs in URL for shareability. Users can share specific landed cost calculations via URL. |
| **next-intl** | i18n (if multilingual needed) | Trade documents may need multilingual support. |
| **Vitest** | Unit testing | Test calculation engines (duty rates, landed costs, container math) thoroughly — financial calculations must be exact. |

---

## Installation

```bash
# Core (already in project constraint)
# Next.js 14, TypeScript, Tailwind CSS

# Mapping & Visualization
npm install react-map-gl maplibre-gl deck.gl @deck.gl/core @deck.gl/layers @deck.gl/geo-layers @deck.gl/react
npm install searoute-js

# Charts & Dashboard
npm install recharts @tremor/react

# PDF Generation
npm install @react-pdf/renderer

# Calculation Libraries
npm install decimal.js currency.js convert-units date-fns

# Data Tables & Forms
npm install @tanstack/react-table react-hook-form zod @hookform/resolvers

# Search & State
npm install fuse.js zustand nuqs

# Dev Dependencies
npm install -D vitest @testing-library/react @types/maplibre-gl
```

---

## Alternatives Considered

| Category | Recommended | Alternative | When to Use Alternative |
|----------|-------------|-------------|------------------------|
| Map Renderer | MapLibre GL JS (free) | Mapbox GL JS | If you need Mapbox's geocoding, directions, or hosted tile services and budget allows ($0.50-$2.00 per 1K map loads) |
| Route Polylines | searoute-js (offline) | Searoutes API (paid) | When you need vessel-specific routes considering draft/beam, real-time ECA zones, canal fees. Phase 2+. |
| Charts | Recharts + Tremor | Nivo | If you need unusual chart types (Sankey diagrams for supply chain flows, chord diagrams). Nivo has better exotic chart support. |
| PDF Generation | @react-pdf/renderer | Puppeteer + HTML template | If PDFs need pixel-perfect HTML fidelity (e.g., exact BOL layout reproduction). Puppeteer is heavier but renders any HTML. |
| Tariff Data | USITC HTS downloads (free) | Zonos API | When you need guaranteed landed cost calculations for live e-commerce transactions. Not needed for Phase 1 analysis tools. |
| Container Tracking | Terminal49 (free tier) | Vizion API | When you need multi-source tracking (EDI + AIS + terminal) and don't mind paying. Vizion has richer data fusion. |
| State Management | Zustand | Jotai | If you prefer atomic state model. Both are excellent — Zustand has more community adoption. |
| Search | Fuse.js | FlexSearch / MiniSearch | FlexSearch for speed on 100K+ HTS entries; MiniSearch for better relevance ranking. Test with actual HTS dataset to decide. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Google Maps API** | Expensive per-load pricing for a data-heavy dashboard that gets heavy internal use. No maritime-specific layers. | MapLibre GL JS + deck.gl (free + maritime-focused) |
| **Leaflet (alone)** | No WebGL acceleration for complex route overlays. Struggles with 500+ simultaneous route polylines. Raster-only rendering. | react-map-gl + MapLibre (vector tiles, WebGL, deck.gl integration) |
| **D3.js (directly)** | Too low-level for dashboards. Massive development time for standard charts. Not React-native. | Recharts (built on D3, React-native API) |
| **moment.js** | Deprecated, enormous bundle size (300KB+). | date-fns (tree-shakeable, modern) |
| **Puppeteer for PDFs** | Requires Chrome binary on server. Expensive on serverless (Vercel). Cold start issues. | @react-pdf/renderer (pure Node.js, works in Vercel serverless functions) |
| **Full TMS platforms (SAP TM, Oracle OTM)** | Enterprise software. Not relevant for a web-based proposal/analysis platform. Overkill. | Custom calculators built on the stack above |
| **Zonos API in Phase 1** | $2/calculation + 10% of duties. No reason to pay for live API when building analysis/proposal tools with researched data. | Static HTS dataset from USITC + custom calculation engine |
| **AIS live tracking in Phase 1** | All providers charge significant fees. Not needed for a proposal/analysis platform. | Mock vessel data + searoute-js for realistic route visualization |

---

## Architecture Notes for Roadmap

### Data Strategy (Phase 1: Static Data + Local Computation)

```
/data/
  hts-schedule.json          # Full HTS downloaded from USITC (free)
  duty-rates-sea.json        # SE Asia duty rates compiled from DataWeb
  ftz-locations.json         # Compiled from OFIS
  carrier-routes.json        # Major routes scraped from carrier schedule pages
  ports.json                 # From UN/LOCODE + World Port Index
  container-specs.json       # Standard container dimensions (20ft, 40ft, 40ft HC, reefer)
```

### Calculation Architecture

All calculators should be pure TypeScript functions (no side effects) for testability:

```
/lib/calculators/
  landed-cost.ts             # Unit cost + shipping + duties + fulfillment
  unit-economics.ts          # Origin -> landed -> wholesale -> retail pipeline
  duty-tariff.ts             # HTS lookup + duty rate calculation
  ftz-savings.ts             # FTZ vs. non-FTZ comparison, incremental withdrawal
  container-utilization.ts   # Units per container by dimensions + weight limits
  route-comparison.ts        # Transit time, cost, transshipment analysis
```

### Map Component Architecture

```
/components/maps/
  ShippingRouteMap.tsx        # Main route visualization (deck.gl ArcLayer)
  PortMap.tsx                 # Port locations with details (ScatterplotLayer)
  FTZMap.tsx                  # FTZ zone boundaries on US map
  VesselTracker.tsx           # Phase 2: Live vessel positions
```

---

## Sources

### HIGH Confidence (Official / Verified)
- [USITC HTS Search & API](https://hts.usitc.gov/) — Official US tariff data with REST API endpoint
- [USITC DataWeb](https://dataweb.usitc.gov/) — Tariff database and trade statistics
- [USITC HTS REST API (data.gov)](https://catalog.data.gov/dataset/harmonized-tariff-schedule-of-the-united-states-2020/resource/0299a864-7434-4833-bc24-ba909ee8a295) — API documentation
- [Maersk Developer Portal](https://developer.maersk.com/api-catalogue) — Carrier API access
- [CMA CGM API Portal](https://api-portal.cma-cgm.com/products/schedules) — Carrier schedule API
- [OFIS FTZ Database](https://ofis.trade.gov/Zones) — Official FTZ zone information
- [FTZ Board (trade.gov)](https://www.trade.gov/foreign-trade-zones-board) — FTZ regulations and resources
- [deck.gl npm](https://www.npmjs.com/package/deck.gl) — v9.2.11, actively maintained
- [react-map-gl](https://visgl.github.io/react-map-gl/) — v8.1.0, official docs
- [Recharts npm](https://www.npmjs.com/package/recharts) — v3.8.1, actively maintained
- [@react-pdf/renderer npm](https://www.npmjs.com/package/@react-pdf/renderer) — v4.3.2, 1.4M weekly downloads
- [Terminal49 Container Tracking API](https://terminal49.com/container-tracking-api) — Free tier for 100 containers

### MEDIUM Confidence (Verified API exists, details may vary)
- [Searoutes API](https://developer.searoutes.com/reference/getsearoute) — Maritime routing API documentation
- [Zonos Landed Cost API](https://zonos.com/docs/supply-chain/landed-cost) — GraphQL API with pricing details
- [MapLibre GL JS](https://maplibre.org/) — Open-source map renderer
- [Vizion Container Tracking API](https://www.vizionapi.com/) — API-first visibility provider
- [MarineTraffic / Kpler Data Services](https://www.kpler.com/product/maritime/data-services) — AIS network
- [Datalastic Vessel Tracking](https://datalastic.com/) — AIS data API
- [NavAPI Maritime APIs](https://navapi.com/) — AIS positions, routing, maps

### LOW Confidence (Needs validation before committing)
- [searoute-js npm](https://www.npmjs.com/package/searoute-js) — Low download count (306/week), test thoroughly before relying on it
- [AISHub free AIS data](https://www.aishub.net/) — Community-sourced, coverage gaps likely
- Descartes CustomsInfo — Enterprise pricing not publicly available
