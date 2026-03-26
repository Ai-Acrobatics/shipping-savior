# Architecture Patterns: International Shipping/Logistics Platform

**Domain:** International freight/cold chain logistics analysis platform
**Researched:** 2026-03-26

---

## Recommended Architecture

### Overview

A Next.js 14 App Router monolith with server components for data-heavy pages, client components for interactive calculators/maps, and API routes for PDF generation and calculation endpoints. All data is static JSON in Phase 1 -- no database needed initially.

```
Browser
  |
  +-- Next.js App Router (Vercel)
       |
       +-- Server Components (data tables, HTS lookup, static content)
       |     |
       |     +-- /data/*.json (static datasets: HTS, duty rates, ports, routes, FTZ)
       |
       +-- Client Components (calculators, maps, interactive tools)
       |     |
       |     +-- Zustand stores (calculator state, comparison state)
       |     +-- react-map-gl + deck.gl (map visualization)
       |     +-- Recharts/Tremor (dashboard charts)
       |
       +-- API Routes (/api/*)
             |
             +-- /api/calculate/landed-cost (POST: runs calculator, returns JSON)
             +-- /api/calculate/ftz-savings (POST: FTZ comparison)
             +-- /api/export/pdf (POST: generates PDF via @react-pdf/renderer)
             +-- /api/hts/search (GET: searches HTS index)
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `/data/` directory | Static JSON datasets (HTS, ports, routes, FTZ, carrier data) | Read by server components and API routes |
| `/lib/calculators/` | Pure TypeScript calculation functions | Called by both client components (browser) and API routes (server) |
| `/lib/data/` | Data access layer -- loads, indexes, searches JSON datasets | Called by server components and API routes |
| `/components/calculators/` | Interactive calculator UIs (forms + results) | Uses `/lib/calculators/` + Zustand stores |
| `/components/maps/` | Map visualization components | Uses react-map-gl, deck.gl, searoute-js, port/route data |
| `/components/dashboard/` | Dashboard layouts, KPI cards, charts | Uses Recharts/Tremor, reads from calculator outputs |
| `/app/api/` | Server-side endpoints for heavy computation and PDF generation | Uses `/lib/calculators/` and `@react-pdf/renderer` |

### Data Flow

**Calculator Flow:**
```
User Input (react-hook-form + zod validation)
  -> Zustand store (persists inputs, enables URL sharing via nuqs)
  -> Calculator function (pure TypeScript, runs in browser)
  -> Results rendered in dashboard components
  -> Optional: POST to /api/export/pdf for PDF report
```

**HTS Lookup Flow:**
```
User types search term
  -> Server Component fetches from pre-indexed HTS data
  -> OR: Client-side search via Fuse.js/FlexSearch on loaded index
  -> Results in @tanstack/react-table with sort/filter
  -> Selected HTS code feeds into Landed Cost Calculator
```

**Map Visualization Flow:**
```
Route data loaded from /data/carrier-routes.json
  -> searoute-js generates GeoJSON polylines for each route
  -> deck.gl ArcLayer renders routes on MapLibre base map
  -> Port markers via ScatterplotLayer
  -> User clicks route -> detail panel shows transit time, cost, carriers
```

---

## Patterns to Follow

### Pattern 1: Pure Calculator Functions

**What:** All calculation logic as pure TypeScript functions with zero side effects. Input -> Output. No API calls, no state, no DOM.

**Why:** Enables testing with Vitest, reuse on both client and server, easy to verify correctness of financial calculations.

**Example:**
```typescript
// lib/calculators/landed-cost.ts
interface LandedCostInput {
  unitCostOrigin: number;
  unitsPerContainer: number;
  containerShippingCost: number;
  dutyRate: number;
  insuranceRate: number;
  customsBrokerFee: number;
  inlandFreight: number;
}

interface LandedCostResult {
  perUnitCosts: {
    product: number;
    shipping: number;
    duty: number;
    insurance: number;
    brokerage: number;
    inland: number;
    total: number;
  };
  containerTotal: number;
  marginAnalysis: {
    wholesalePrice: number;
    retailPrice: number;
    wholesaleMargin: number;
    retailMargin: number;
  };
}

export function calculateLandedCost(input: LandedCostInput): LandedCostResult {
  // Pure calculation -- uses decimal.js for precision
}
```

### Pattern 2: Static Data with Search Index

**What:** Download authoritative datasets (HTS, ports, FTZ) as JSON files. Build search indexes at build time or on first load.

**Why:** Zero API costs, instant response times, works offline. Phase 1 does not need live data.

### Pattern 3: Server Components for Data, Client Components for Interaction

**What:** Use React Server Components for data-heavy, non-interactive content. Use Client Components only where interactivity is needed.

**Why:** Reduces client bundle. HTS lookup results, route tables, and static displays do not need client-side JavaScript. Calculators and maps do.

### Pattern 4: URL State for Shareability

**What:** Persist calculator inputs in URL query params using `nuqs`.

**Why:** Users can share specific calculations. Bookmarkable, shareable, no backend needed.

### Pattern 5: Layered Map Architecture

**What:** Base map (MapLibre) + data layers (deck.gl) + UI overlays (React components). Each layer is independent.

**Why:** Separates rendering concerns. Can swap base map tiles without touching route visualization. Can add/remove data layers independently.

```
MapLibre GL (base tiles - ocean, land, borders)
  + deck.gl ArcLayer (shipping routes - colored by transit time)
  + deck.gl ScatterplotLayer (ports - sized by throughput)
  + deck.gl GeoJsonLayer (FTZ boundaries)
  + React overlay (port detail cards, route info panels)
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Database for Static Data

**What:** Putting HTS codes, port data, or route information in PostgreSQL/Supabase for Phase 1.
**Why bad:** Adds hosting cost, cold start latency, migration complexity, and a dependency that is not needed. This data changes infrequently (HTS schedule updates annually).
**Instead:** JSON files in `/data/` directory. Deployed with the app. Zero latency.

### Anti-Pattern 2: Calculation on Server Only

**What:** Making all calculator logic server-side via API routes.
**Why bad:** Adds network latency to every calculation. Users adjusting sliders/inputs get delayed feedback.
**Instead:** Pure TypeScript calculators that run in the browser. Use API routes only for PDF generation and batch calculations.

### Anti-Pattern 3: Monolithic Map Component

**What:** One giant MapComponent that handles routes, ports, FTZ zones, vessel tracking, and all interactions.
**Why bad:** Unmaintainable. deck.gl layers are independent -- combining them in one component creates a god component.
**Instead:** Separate map layer components composed together.

### Anti-Pattern 4: Fetching External APIs on Every Page Load

**What:** Calling carrier schedule APIs, AIS APIs, or tariff APIs on every page render.
**Why bad:** Slow, expensive, rate-limited, and unnecessary for analysis.
**Instead:** Pre-fetch and cache data. Use ISR for data that updates periodically. Static JSON for data that updates rarely.

### Anti-Pattern 5: Over-Engineering for Scale

**What:** Microservices, message queues, separate API gateway for a Phase 1 analysis platform.
**Why bad:** This is a presentation/proposal tool, not a transaction processing system. Complexity kills velocity.
**Instead:** Next.js monolith. All in one repo.

---

## Scalability Considerations

| Concern | Phase 1 (Proposal Tool) | Phase 2 (Multi-Client) | Phase 3 (SaaS Platform) |
|---------|------------------------|----------------------|------------------------|
| Data storage | JSON files in repo | Supabase/Neon PostgreSQL | PostgreSQL + Redis cache |
| HTS search | Fuse.js client-side | Server-side FlexSearch | Dedicated search (Typesense) |
| Map rendering | MapLibre free tiles | MapTiler paid tier | Self-hosted tile server |
| Calculations | Browser-side | Browser + server for batch | Worker threads for batch |
| PDF generation | Vercel serverless | Vercel serverless | Dedicated PDF worker |
| Authentication | None or basic | NextAuth with credentials | NextAuth with OAuth |
| Multi-tenancy | Single tenant | Org-based data separation | Full multi-tenant with RLS |

---

## Directory Structure

```
shipping-logistics/
  /app/
    /page.tsx                          # Landing / dashboard overview
    /tools/
      /landed-cost/page.tsx            # Landed cost calculator
      /unit-economics/page.tsx         # Unit economics breakdown
      /hts-lookup/page.tsx             # HTS code search
      /container-calc/page.tsx         # Container utilization
      /ftz-analyzer/page.tsx           # FTZ savings analyzer
      /route-comparison/page.tsx       # Carrier/route comparison
    /map/page.tsx                      # Full-page route map
    /api/
      /calculate/landed-cost/route.ts
      /calculate/ftz-savings/route.ts
      /export/pdf/route.ts
      /hts/search/route.ts
  /components/
    /calculators/                      # Calculator UI components
    /maps/                             # Map visualization components
    /dashboard/                        # Dashboard layout, KPI cards
    /shared/                           # Buttons, inputs, tables
  /lib/
    /calculators/                      # Pure calculation functions
    /data/                             # Data access layer
    /types/                            # TypeScript interfaces
    /utils/                            # Formatting, conversion helpers
  /data/
    /hts-schedule.json                 # Full HTS dataset
    /duty-rates-sea.json               # SE Asia duty rates
    /ports.json                        # Port database (UN/LOCODE)
    /carrier-routes.json               # Major shipping routes
    /ftz-locations.json                # US FTZ database
    /container-specs.json              # Standard container dimensions
```
