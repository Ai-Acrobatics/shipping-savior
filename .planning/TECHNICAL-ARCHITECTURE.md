# Shipping Savior — Technical Architecture

**Linear:** AI-5409
**Phase:** Phase 2 Planning
**Status:** Complete
**Last Updated:** 2026-03-26

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Calculation Engine Design](#3-calculation-engine-design)
4. [Data Layer](#4-data-layer)
5. [Map and Visualization Layer](#5-map-and-visualization-layer)
6. [PDF Generation Pipeline](#6-pdf-generation-pipeline)
7. [Search Implementation](#7-search-implementation)
8. [Performance Considerations](#8-performance-considerations)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Phase 2+ Scaling Path](#10-phase-2-scaling-path)
11. [Security Architecture](#11-security-architecture)
12. [Monitoring and Observability](#12-monitoring-and-observability)
13. [Decision Log](#13-decision-log)

---

## 1. System Architecture Overview

### Monolith vs. Microservices Decision

**Decision: Next.js 14 monolith for all phases through Phase 2. Revisit at Phase 3.**

Shipping Savior is a Next.js 14 App Router monolith deployed on Vercel. The decision against microservices is deliberate:

- Phase 1 is a proposal/demo tool. Microservice complexity kills velocity with zero benefit.
- Phase 2 adds auth and live data to the same codebase — co-location is an advantage.
- Vercel's serverless functions already provide horizontal scaling per API route without an explicit service boundary.
- If Phase 3 AI agents require cost isolation (long-running Claude jobs), workers can be extracted to Railway without restructuring the main app.

The system evolves in three progressive layers:

| Phase | Architecture | Data | Auth |
|-------|-------------|------|------|
| Phase 1 | Next.js monolith, all static | JSON files in `/data/` | None |
| Phase 2 | Next.js monolith + Neon DB + Redis | Live carrier APIs + DB | NextAuth v5 |
| Phase 3 | Monolith + Railway AI workers | Vector search + audit log | NextAuth + OAuth |

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BROWSER / CLIENT                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  Calculator  │  │  Map / Route │  │  Dashboard   │  │  Knowledge │  │
│  │  Components  │  │  Visualizer  │  │  Charts      │  │  Base      │  │
│  │  (Zustand)   │  │  (deck.gl)   │  │  (Recharts)  │  │  (Search)  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘  │
└─────────┼─────────────────┼─────────────────┼────────────────┼──────────┘
          │  API Routes / RSC fetch            │                │
          ▼                                   ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      NEXT.JS APP ROUTER (Vercel)                        │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Server Components (RSC)                       │    │
│  │  • Data-heavy tables (HTS lookup, route comparison grids)        │    │
│  │  • Static content rendering (knowledge base, compliance docs)    │    │
│  │  • Auth guards (verifySession() in platform layout)              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     API Routes (/api/*)                          │    │
│  │  /api/calculate/*  /api/export/*  /api/hts/*  /api/ai/*          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
           ┌─────────────────┼──────────────────┐
           ▼                 ▼                  ▼
┌──────────────────┐ ┌──────────────┐ ┌────────────────────┐
│  Neon PostgreSQL  │ │ Upstash Redis│ │   /data/ directory  │
│  (Phase 2+)       │ │ (Phase 2+)   │ │   (Phase 1)         │
│  shipments        │ │ carrier rates│ │   hts-schedule.json │
│  users / orgs     │ │ sessions     │ │   duty-rates.json   │
│  calculations     │ │ rate limits  │ │   ports.json        │
│  audit_logs       │ │ AI response  │ │   routes.json       │
└──────────────────┘ └──────────────┘ └────────────────────┘
```

### Component Responsibility Summary

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| Client Components | React 18, Zustand, nuqs | Interactive calculators, maps, real-time input feedback |
| Server Components | RSC (Next.js 14) | Data-heavy renders, HTS tables, knowledge base |
| API Routes | Next.js Route Handlers (Node.js runtime) | PDF generation, heavy computation, external API proxy |
| Static Data | JSON files in `/data/` | HTS schedule, duty rates, ports, routes, FTZ list |
| Database | Neon PostgreSQL + Drizzle ORM | User data, saved shipments, calculations, audit log |
| Cache | Upstash Redis | Carrier rate TTL, session tokens, API rate limiting, AI response cache |
| AI | Anthropic Claude API | HTS classification, tariff advice, route optimization |

---

## 2. Frontend Architecture

### Next.js 14 App Router Structure

```
src/app/
├── layout.tsx                     # Root layout — fonts, analytics, providers
├── page.tsx                       # Landing / proposal overview
├── (auth)/
│   ├── login/page.tsx             # Email + password login
│   └── register/page.tsx          # Invite-only registration
├── (platform)/                    # Auth-gated platform routes
│   ├── layout.tsx                 # Platform shell — sidebar, header, session guard
│   ├── dashboard/page.tsx         # KPI overview, active shipments, cost summary
│   ├── tools/
│   │   ├── landed-cost/page.tsx   # Landed cost calculator
│   │   ├── unit-economics/page.tsx
│   │   ├── ftz-analyzer/page.tsx
│   │   ├── container-calc/page.tsx
│   │   └── route-comparison/page.tsx
│   ├── shipments/
│   │   ├── page.tsx               # Shipment list
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx          # Detail + tracking timeline
│   └── knowledge-base/
│       ├── page.tsx
│       └── [slug]/page.tsx
├── map/page.tsx                   # Full-page route visualization
├── hts/
│   ├── page.tsx                   # HTS code search interface
│   └── [code]/page.tsx            # HTS detail + duty rates by country
└── api/
    ├── calculate/
    │   ├── landed-cost/route.ts
    │   ├── ftz-savings/route.ts
    │   ├── container-utilization/route.ts
    │   └── unit-economics/route.ts
    ├── export/
    │   ├── pdf/route.ts
    │   └── csv/route.ts
    ├── hts/search/route.ts
    └── ai/
        ├── classify-hts/route.ts
        └── optimize-route/route.ts
```

### Component Hierarchy

```
App Shell (layout.tsx)
├── AuthProvider (NextAuth SessionProvider)
├── ThemeProvider
└── AppLayout
    ├── Sidebar (navigation, user role badge, org name)
    ├── Header (breadcrumb, user menu)
    └── PageContent
        ├── CalculatorPages
        │   ├── LandedCostCalculator
        │   │   ├── InputForm (react-hook-form + zod)
        │   │   ├── ResultsPanel (animated reveal on calculate)
        │   │   ├── BreakdownChart (Recharts BarChart — stacked cost components)
        │   │   └── ExportActions (PDF / CSV / Share URL)
        │   ├── FTZAnalyzer
        │   │   ├── ScenarioBuilder (import date, HTS code, volume)
        │   │   ├── SavingsChart (area chart — duty locked vs. current market rate)
        │   │   └── WithdrawalScheduler (incremental pallet withdrawal timeline)
        │   └── RouteComparison
        │       ├── RouteInputPanel (origin port, destination port, cargo type)
        │       ├── CarrierOptionCards (3 tiers: backhaul / standard / express)
        │       └── TransitTimeChart (Recharts grouped bar)
        ├── MapPages
        │   └── ShippingRouteMap
        │       ├── MapLibreBase (vector tiles — MapTiler free tier)
        │       ├── ArcLayer (routes colored by transit time, great circle arcs)
        │       ├── ScatterplotLayer (ports sized by annual TEU throughput)
        │       ├── GeoJsonLayer (FTZ boundaries — US only in Phase 1)
        │       └── PortDetailPanel (click-to-expand overlay component)
        └── DashboardPages
            ├── KPICards (@tremor/react metric tiles — cost/shipment, duty rate, FTZ savings)
            ├── ShipmentBoard (kanban: sourcing → transit → customs → FTZ → delivered)
            ├── CostTrendChart (Recharts LineChart — per-unit landed cost over time)
            └── DutyExposureGauge (total duty liability at current locked vs. market rates)
```

### State Management Strategy

**Zustand stores** handle ephemeral client-side state. Server data flows from server components directly — no global server state store.

```typescript
// lib/stores/calculator.ts
interface CalculatorStore {
  landedCost: LandedCostInput;
  ftzScenario: FTZInput;
  routeSelection: RouteInput;
  savedScenarios: Scenario[];
  setLandedCost: (input: Partial<LandedCostInput>) => void;
  setFTZScenario: (input: Partial<FTZInput>) => void;
  saveScenario: (name: string) => void;
  loadScenario: (id: string) => void;
}

// lib/stores/map.ts
interface MapStore {
  activeRoutes: Route[];
  selectedPort: Port | null;
  activeLayers: ('routes' | 'ports' | 'ftz')[];
  viewState: MapViewState;
}
```

**URL state with `nuqs`** persists calculator inputs for shareability — users can send a link with their exact calculation:

```typescript
// Calculator inputs sync to URL query params
// ?units=500000&origin=VN&hts=6109100060&shippingCost=4800
const [units, setUnits] = useQueryState('units', parseAsInteger.withDefault(500000));
const [originCountry, setOriginCountry] = useQueryState('origin', parseAsString.withDefault('VN'));
const [htsCode, setHtsCode] = useQueryState('hts', parseAsString);
```

### Server Component vs. Client Component Split

| Component | Type | Rationale |
|-----------|------|-----------|
| HTS lookup result tables | Server | No interactivity needed — pure data display |
| Knowledge base articles | Server | Static MDX content, no client JS needed |
| Landing / proposal pages | Server | SEO-optimized, no dynamic interaction |
| Calculator forms + results | Client | User input + real-time calculation feedback |
| Map / route visualizer | Client | WebGL requires browser — `dynamic(() => ..., { ssr: false })` |
| Recharts / Tremor charts | Client | DOM measurements for responsive sizing |
| Shipment tracking board | Client | Polling / SSE for live updates |

**Critical rule:** All map components MUST use `dynamic(() => import(...), { ssr: false })`. deck.gl and MapLibre require `window` and `WebGL` which do not exist in the server environment.

---

## 3. Calculation Engine Design

### Architecture: Client-Side TypeScript with decimal.js

All calculators are **pure TypeScript functions with zero side effects** — input object in, result object out. No API calls, no state, no DOM access.

**Why client-side:**
- No network latency on every slider adjustment or input change
- Easily unit-tested with Vitest
- Reusable on both client and server (API routes can call the same functions)
- Financial logic stays co-located with business domain types

**Why decimal.js is non-negotiable:**
JavaScript's IEEE 754 floating-point arithmetic produces errors that compound in financial calculations:
- `0.1 * 6.5 / 100` = `0.006499999999999999` (not `0.0065`)
- At 500,000 units × $0.10 origin cost × 6.5% duty, that's a $500 error on a $32,500 duty bill
- decimal.js provides arbitrary-precision arithmetic with exact decimal semantics

**Never use native `*`, `/`, `+`, `-` for any monetary value.** Always construct `new Decimal(value)` before any arithmetic.

### Calculator Module Structure

```
lib/calculators/
├── landed-cost.ts           # Core: origin cost → landed cost per unit
├── unit-economics.ts        # Full pipeline: origin → wholesale → retail margins
├── duty-tariff.ts           # HTS lookup + duty rate calculation + Incoterm adjustment
├── ftz-savings.ts           # FTZ vs. non-FTZ comparison + incremental withdrawal model
├── container-utilization.ts # Units per container (volume AND weight — use the lower)
├── route-comparison.ts      # Transit time, cost, transshipment analysis
└── __tests__/               # Vitest unit tests — all calculators verified against hand-computed examples
```

### Landed Cost Calculator

```typescript
// lib/calculators/landed-cost.ts
import Decimal from 'decimal.js';
import { formatCurrency } from 'currency.js';

export interface LandedCostInput {
  unitCostOriginUsd: number;        // FOB origin price per unit (USD)
  unitsPerContainer: number;
  containerShippingCostUsd: number; // Total ocean freight for one container
  dutyRatePercent: number;          // e.g., 6.5 for 6.5%
  incoterm: 'FOB' | 'CIF' | 'DDP'; // Determines what's included
  insuranceRatePercent?: number;    // Default 0.5% of declared value
  customsBrokerFeeUsd?: number;     // Typical: $150-500 flat or per container
  inlandFreightUsd?: number;        // Port to warehouse (per container)
  mpfRatePercent?: number;          // Merchandise Processing Fee (0.3464%, min $29.66, max $575.35)
  hmfRatePercent?: number;          // Harbor Maintenance Fee (0.125%)
  sectionTariffRatePercent?: number; // Section 301 tariff if applicable
}

export interface LandedCostResult {
  perUnit: {
    originCost: string;             // Formatted USD
    oceanFreight: string;
    duty: string;
    sectionTariff: string;
    insurance: string;
    brokerage: string;
    mpf: string;
    hmf: string;
    inlandFreight: string;
    total: string;                  // Sum of all above — the landed cost
  };
  containerTotals: {
    declaredValue: string;
    totalDuty: string;
    totalFreight: string;
    totalLandedCost: string;
  };
  effectiveDutyRate: string;        // Total duty + fees as % of FOB value
  datasetDate: string;              // When HTS data was last updated — always display
}

export function calculateLandedCost(input: LandedCostInput): LandedCostResult {
  const units = new Decimal(input.unitsPerContainer);
  const unitCost = new Decimal(input.unitCostOriginUsd);
  const containerCost = new Decimal(input.containerShippingCostUsd);

  // Per-unit ocean freight (exact division, no float error)
  const freightPerUnit = containerCost.div(units);

  // Declared value for duty basis = FOB unit cost × units
  const declaredValuePerUnit = unitCost; // FOB basis

  // Duty calculation — on FOB value
  const dutyRate = new Decimal(input.dutyRatePercent).div(100);
  const dutyPerUnit = declaredValuePerUnit.mul(dutyRate);

  // Section 301 tariff (separate line item — makes FTZ savings visible)
  const section301Rate = new Decimal(input.sectionTariffRatePercent ?? 0).div(100);
  const section301PerUnit = declaredValuePerUnit.mul(section301Rate);

  // Insurance (on CIF value = FOB + freight)
  const insuranceRate = new Decimal(input.insuranceRatePercent ?? 0.005);
  const insurancePerUnit = unitCost.add(freightPerUnit).mul(insuranceRate);

  // Brokerage, MPF, HMF — per-container fees amortized per unit
  const brokeragePerUnit = new Decimal(input.customsBrokerFeeUsd ?? 300).div(units);
  const mpfRate = new Decimal(input.mpfRatePercent ?? 0.003464);
  const mpfPerUnit = Decimal.min(
    Decimal.max(declaredValuePerUnit.mul(mpfRate), new Decimal(29.66).div(units)),
    new Decimal(575.35).div(units)
  );
  const hmfRate = new Decimal(input.hmfRatePercent ?? 0.00125);
  const hmfPerUnit = declaredValuePerUnit.mul(hmfRate);

  const inlandPerUnit = new Decimal(input.inlandFreightUsd ?? 0).div(units);

  const totalPerUnit = unitCost
    .add(freightPerUnit)
    .add(dutyPerUnit)
    .add(section301PerUnit)
    .add(insurancePerUnit)
    .add(brokeragePerUnit)
    .add(mpfPerUnit)
    .add(hmfPerUnit)
    .add(inlandPerUnit);

  const totalDutyPerUnit = dutyPerUnit.add(section301PerUnit).add(mpfPerUnit).add(hmfPerUnit);
  const effectiveDutyRate = totalDutyPerUnit.div(declaredValuePerUnit).mul(100);

  return {
    perUnit: {
      originCost: fmt(unitCost),
      oceanFreight: fmt(freightPerUnit),
      duty: fmt(dutyPerUnit),
      sectionTariff: fmt(section301PerUnit),
      insurance: fmt(insurancePerUnit),
      brokerage: fmt(brokeragePerUnit),
      mpf: fmt(mpfPerUnit),
      hmf: fmt(hmfPerUnit),
      inlandFreight: fmt(inlandPerUnit),
      total: fmt(totalPerUnit),
    },
    containerTotals: {
      declaredValue: fmt(unitCost.mul(units)),
      totalDuty: fmt(totalDutyPerUnit.mul(units)),
      totalFreight: fmt(containerCost),
      totalLandedCost: fmt(totalPerUnit.mul(units)),
    },
    effectiveDutyRate: `${effectiveDutyRate.toFixed(2)}%`,
    datasetDate: getHTSDatasetDate(), // Always display — see Pitfall #2
  };
}

function fmt(d: Decimal): string {
  return `$${d.toFixed(4)}`; // 4 decimal places for per-unit costs
}
```

### FTZ Savings Analyzer

The FTZ analyzer is the platform's #1 differentiator. Key concepts:

- **Rate lock**: FTZ status elections lock the duty rate on the date of entry, regardless of future increases
- **Incremental withdrawal**: You pay duty only when goods leave the FTZ, not on entry — deferred cash flow
- **Section 301 / reciprocal tariff risk**: April 2025 executive order mandates PF (Privileged Foreign) status for goods subject to reciprocal tariffs — FTZ election is irrevocable

```typescript
// lib/calculators/ftz-savings.ts
export interface FTZInput {
  htsCode: string;
  currentDutyRatePercent: number;         // Today's rate
  projectedDutyRatePercent: number;       // Expected rate if tariffs increase
  ftzEntryDate: string;                   // ISO date — rate lock date
  totalUnits: number;
  unitFobValueUsd: number;
  withdrawalSchedule: WithdrawalBatch[];  // [{date, units}, ...]
  ftzStorageCostPerUnitPerMonth: number;  // FTZ storage premium over regular warehouse
  ftzAdminFeeMonthly: number;             // Zone operator fee
}

export interface FTZSavingsResult {
  nonFtzTotalDuty: string;        // Pay all duty upfront at entry at projected rate
  ftzTotalDuty: string;           // Pay duty per batch at locked rate when withdrawn
  cashFlowSavings: string;        // Deferred payment benefit (NPV)
  rateLockSavings: string;        // Savings from locked rate vs. projected increase
  grossSavings: string;           // Rate lock + cash flow combined
  ftzCosts: string;               // Storage + admin fees
  netSavings: string;             // grossSavings - ftzCosts
  breakEven: string;              // Date when cumulative savings exceed FTZ costs
  withdrawalTimeline: WithdrawalResult[]; // Per-batch breakdown
}
```

### Container Utilization Calculator

**Critical rule: Always compute BOTH volume and weight utilization. Use the lower result.**

Dense goods (frozen seafood, liquids, metals) hit weight limits long before volume limits.
A 40ft HC container: 76.3 CBM capacity, 26,480 kg payload limit.
Frozen seafood at ~800 kg/CBM fills only 33 CBM before hitting the weight limit — 57% volume unused.

```typescript
// lib/calculators/container-utilization.ts
export interface ContainerUtilizationResult {
  byVolume: {
    unitsPerContainer: number;
    utilizationPercent: string;
    limitingFactor: false;
  };
  byWeight: {
    unitsPerContainer: number;
    utilizationPercent: string;
    limitingFactor: boolean; // true if weight is the binding constraint
  };
  recommended: {
    unitsPerContainer: number;   // LOWER of volume and weight
    limitingConstraint: 'volume' | 'weight';
    costPerUnit: string;
  };
  warnings: string[]; // e.g., "Weight limit reached at 43% volume — consider lighter packaging"
}
```

---

## 4. Data Layer

### Phase 1: Static JSON Files — Zero External Dependencies

All Phase 1 data lives in `/data/` and ships with the app. This enables:
- Zero API cost during development and demo
- Instant response times (no network round-trips)
- Offline capability
- Reproducible calculations (data version is known)

```
/data/
├── hts-schedule.json          # Full HTS downloaded from USITC (free)
│                              # ~100K entries, ~50-80MB raw
├── hts-index.json             # Pre-built FlexSearch index (see Section 7)
│                              # ~15-20MB, built at deploy time
├── duty-rates-sea.json        # SE Asia duty rates compiled from USITC DataWeb
│                              # Vietnam, Thailand, Indonesia, Cambodia, Philippines
│                              # Includes MFN rate, Section 301 rate, GSP status
├── ftz-locations.json         # 260+ US FTZ zones compiled from OFIS trade.gov
│                              # Zone number, operator, city, state, customs port, lat/lng
├── carrier-routes.json        # Major SE Asia → US routes
│                              # Port pairs, transit days, transshipment points, carrier
├── ports.json                 # Port database (UN/LOCODE + World Port Index)
│                              # ~3,700 ports with coordinates, annual TEU, type
└── container-specs.json       # Standard container dimensions + payload limits
                               # 20GP, 40GP, 40HC, 40RF (reefer), 20RF
```

### HTS Data Loading Strategy

The full HTS schedule is ~100K entries at ~50-80MB. Loading this naively on page load is unacceptable. Three-layer lazy loading strategy:

```
Layer 1 — Build-time pre-processing (scripts/build-hts-index.ts):
  • Download full HTS JSON from hts.usitc.gov
  • Normalize: strip non-printable characters, standardize code format to 10-digit
  • Build FlexSearch index → /data/hts-index.json (~15-20MB)
  • Extract SE Asia duty rates → /data/duty-rates-sea.json (small, ~200KB)
  • Commit both processed files to repo — no runtime download needed

Layer 2 — Route-level lazy loading (app/hts/page.tsx):
  • hts-index.json is NOT bundled in the main JS bundle
  • Loaded only when user navigates to /hts or /tools/landed-cost
  • Dynamic import: const { loadHTSIndex } = await import('@/lib/data/hts')
  • Browser caches the file after first load (Cache-Control: max-age=86400)

Layer 3 — Search-time streaming (lib/data/hts.ts):
  • FlexSearch index is initialized once, stored in module scope
  • Subsequent searches reuse initialized index — no re-parse
  • Search executes in <100ms after index is loaded
```

```typescript
// lib/data/hts.ts — lazy loading pattern
let htsIndex: Document | null = null;

export async function getHTSIndex(): Promise<Document> {
  if (htsIndex) return htsIndex;

  // Dynamic import — browser loads on demand, not at page load
  const { default: indexData } = await import('@/data/hts-index.json', {
    assert: { type: 'json' }
  });

  htsIndex = new Document({ /* FlexSearch config */ });
  htsIndex.import(indexData);
  return htsIndex;
}

export async function searchHTS(query: string, options?: { limit?: number }): Promise<HTSResult[]> {
  const index = await getHTSIndex();
  return index.search(query, { limit: options?.limit ?? 20, enrich: true });
}
```

### Data Access Layer

```
lib/data/
├── hts.ts             # HTS search + code lookup (uses FlexSearch)
├── duty-rates.ts      # Duty rate lookup by HTS code + origin country
├── ports.ts           # Port search by LOCODE, name, coordinates
├── routes.ts          # Route lookup by origin/destination port pair
├── ftz.ts             # FTZ zone search by state, proximity
└── containers.ts      # Container spec lookup (dimensions, payload limits)
```

Each module:
1. Imports the relevant JSON file
2. Builds an in-memory index (Map or FlexSearch) on first access
3. Exposes typed query functions — no raw JSON access outside lib/data/

### HTS Code Normalization

HTS codes appear in multiple formats across data sources. All codes MUST be normalized on import:

| Source Format | Normalized Format | Display Format |
|--------------|-------------------|---------------|
| `6109100060` | `6109100060` | `6109.10.00.60` |
| `6109.10.00.60` | `6109100060` | `6109.10.00.60` |
| `6109.10` | `6109100000` (padded) | `6109.10` |
| `6109.1000.60` | `6109100060` | `6109.10.00.60` |

```typescript
// lib/data/hts.ts
export function normalizeHTSCode(raw: string): string {
  // Strip all non-digits
  const digits = raw.replace(/[^0-9]/g, '');
  // Pad to 10 digits
  return digits.padEnd(10, '0').substring(0, 10);
}

export function displayHTSCode(normalized: string): string {
  // 6109100060 → 6109.10.00.60
  return `${normalized.substring(0, 4)}.${normalized.substring(4, 6)}.${normalized.substring(6, 8)}.${normalized.substring(8, 10)}`;
}
```

### Phase 2 Database Schema (Preview)

Phase 2 introduces Neon PostgreSQL via Drizzle ORM. Key tables:

```sql
organizations     -- Multi-tenant root (one org = one brokerage company)
users             -- Broker, importer, admin roles
shipments         -- Core operational entity (one container movement)
shipment_events   -- Immutable event log for tracking updates
carriers          -- Ocean carrier registry with SCAC codes
carrier_rates     -- Rate cards per lane (origin_port, dest_port, container_type)
hts_codes         -- Local mirror of USITC HTS schedule
duty_rates        -- Country-specific rates by HTS code
ftz_zones         -- FTZ zone database (seeded from OFIS)
calculations      -- Saved calculator outputs for history
api_keys          -- API keys for programmatic access
audit_logs        -- Immutable compliance audit log
```

Full schema definitions are in `.planning/prds/TECHNICAL-ARCHITECTURE.md`.

---

## 5. Map and Visualization Layer

### Technology Stack

```
react-map-gl v8.1.0           # React bindings — 57KB bundle (down from 219KB in v6)
  ↳ MapLibre GL JS v4.x       # Free open-source renderer (BSD-2-Clause, zero API key)
  ↳ deck.gl v9.2.x            # WebGL2 data layers — routes, ports, FTZ boundaries
  ↳ searoute-js v0.1.0        # Offline maritime route polylines (Eurostat marnet data)
  ↳ MapTiler free tier        # Base map tiles (or Protomaps self-hosted PMTiles)
```

**Why MapLibre over Mapbox:** Zero per-load licensing cost. Identical API to Mapbox GL (fork). Supports same tile formats. No API key for rendering — only needed for MapTiler tile access (free tier: 100,000 tile requests/month).

**Why deck.gl over raw MapLibre layers:** WebGL2 acceleration enables rendering 1,000+ route polylines at 60fps. Mapbox GL layers would require paid API and can't match deck.gl's performance for large datasets.

### Layer Architecture

```
MapLibre GL (base map)
  ├── Ocean tiles (MapTiler or Protomaps)
  ├── Land tiles
  └── Border/label tiles
          ↑ composited by react-map-gl
deck.gl Overlays (WebGL2)
  ├── ArcLayer                 # Shipping routes — great circle arcs
  │   ├── color: transit time  # blue=fast, amber=medium, red=slow
  │   ├── width: container TEU # wider arc = higher volume route
  │   └── greatCircle: true    # Pacific routes arc correctly (not Mercator distortion)
  ├── ScatterplotLayer         # Ports
  │   ├── radius: annual TEU   # Major hubs visually larger
  │   └── color: port type     # cyan=cold chain capable, blue=general
  ├── GeoJsonLayer             # FTZ boundaries (Phase 1: US only)
  │   └── filled + stroked polygon
  └── TripsLayer               # Phase 2+: animated vessel movement (AIS data)
React UI Overlays (DOM)
  ├── PortDetailPanel          # Click-triggered overlay card
  ├── RouteInfoTooltip         # Hover: transit time, carriers, cost range
  └── MapControls              # Zoom, layer toggles, fullscreen
```

### Map Component Structure

```typescript
// components/maps/ShippingRouteMap.tsx
// Must be loaded with: dynamic(() => import('./ShippingRouteMap'), { ssr: false })

interface ShippingRouteMapProps {
  routes?: Route[];           // Defaults to all routes from /data/carrier-routes.json
  selectedPorts?: string[];   // LOCODE array — highlight these ports
  highlightHubs?: boolean;    // Emphasize transshipment hubs (Panama, Singapore, Busan)
  showFTZZones?: boolean;     // Overlay US FTZ boundaries
  onPortClick?: (port: Port) => void;
  onRouteClick?: (route: Route) => void;
}
```

```
components/maps/
├── ShippingRouteMap.tsx    # Main composition — combines all layers
├── PortMap.tsx             # Port-only view (for port detail pages)
├── FTZMap.tsx              # FTZ zone boundaries on US map
└── layers/
    ├── RouteArcLayer.tsx   # deck.gl ArcLayer wrapper
    ├── PortScatterLayer.tsx
    └── FTZGeoJsonLayer.tsx
```

### Route Polyline Generation

searoute-js generates realistic maritime route polylines offline:

```typescript
// lib/maps/route-polylines.ts
import { searoute } from 'searoute-js';

export function getRoutePolyline(
  originLonLat: [number, number],
  destLonLat: [number, number]
): GeoJSON.LineString {
  const route = searoute(originLonLat, destLonLat);
  return route.geometry; // GeoJSON LineString
}

// Pre-compute all route polylines at build time — not on every render
// scripts/precompute-routes.ts → /data/route-polylines.json
```

**Pre-computation is critical.** Calling searoute-js for 50+ routes on every map render wastes CPU and causes jank. Run polyline computation once at build/deploy time and cache results in `route-polylines.json`.

### Performance Optimization

- `pickable: false` on layers that don't need click interaction (route labels, small port dots)
- Level-of-detail: show only major hub routes when zoomed to world view, full route set when zoomed to regional
- `getFilterValue` + `filterRange` on ArcLayer for GPU-side filtering by cargo type / transit time
- Map components loaded with `dynamic(() => ..., { ssr: false })` — never ship deck.gl to server bundle
- `React.memo()` on layer components — prevent re-render when only non-layer state changes

---

## 6. PDF Generation Pipeline

### Technology: @react-pdf/renderer

```
@react-pdf/renderer v4.3.x
├── 1.4M weekly npm downloads
├── React component model — same patterns as UI components
├── Server-side rendering in Vercel Node.js serverless functions
├── No Chrome binary required (unlike Puppeteer)
└── Supports: text, tables, images, custom fonts, page breaks
```

**Why not Puppeteer:** Requires a Chrome binary on the server. Vercel serverless functions have a 50MB limit. Chrome alone is ~100MB. Cold starts would be 5-10 seconds. @react-pdf/renderer is pure Node.js and works in standard serverless functions.

### PDF Generation API Route

```typescript
// app/api/export/pdf/route.ts
export const runtime = 'nodejs'; // NEVER Edge — @react-pdf/renderer needs Node.js

export async function POST(req: Request) {
  const { type, data } = await req.json();

  let pdfDocument: React.ReactElement;

  switch (type) {
    case 'landed-cost':
      pdfDocument = <LandedCostReport data={data} generatedAt={new Date()} />;
      break;
    case 'ftz-analysis':
      pdfDocument = <FTZAnalysisReport data={data} generatedAt={new Date()} />;
      break;
    case 'route-comparison':
      pdfDocument = <RouteComparisonReport data={data} generatedAt={new Date()} />;
      break;
    default:
      return Response.json({ error: 'Unknown report type' }, { status: 400 });
  }

  const stream = await renderToStream(pdfDocument);

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${type}-${Date.now()}.pdf"`,
    }
  });
}
```

### PDF Document Components

```
components/pdf/
├── LandedCostReport.tsx     # Cost breakdown table + per-unit analysis
├── FTZAnalysisReport.tsx    # Savings table + withdrawal timeline
├── RouteComparisonReport.tsx # 3-carrier comparison grid
├── shared/
│   ├── PDFHeader.tsx        # Logo + "Shipping Savior" branding
│   ├── PDFTable.tsx         # Reusable table component
│   ├── PDFFooter.tsx        # Disclaimer: "For informational purposes only"
│   └── PDFStyles.ts         # Shared StyleSheet definitions
```

### Performance Guidelines for PDF Routes

- **Phase 1 PDFs**: Tables and text only, no embedded charts — keeps generation under 2 seconds
- **Charts in PDFs**: Pre-render Recharts components as static PNG/SVG images server-side, embed as base64 — avoids rendering charts inside @react-pdf (not well supported)
- **Large PDFs**: If a report exceeds 50 pages, stream the response rather than buffering — prevents Vercel memory timeout
- **Vercel Pro** (60s function timeout) required if complex multi-page reports are needed in production

### Timeout Mitigation

| Report Type | Estimated Generation Time | Strategy |
|-------------|--------------------------|----------|
| Landed cost (1 page) | 0.5-1s | Standard serverless |
| Route comparison (2 pages) | 1-2s | Standard serverless |
| FTZ analysis with timeline (3-5 pages) | 2-4s | Standard serverless |
| Full shipment report with charts (10+ pages) | 5-15s | Queue via background worker (Phase 2+) |

---

## 7. Search Implementation

### Technology: Fuse.js vs. FlexSearch Decision

| Criteria | Fuse.js | FlexSearch | Recommendation |
|----------|---------|------------|----------------|
| Performance on 100K+ entries | SLOW (800ms+ on full HTS) | FAST (<100ms on full HTS) | FlexSearch |
| Fuzzy matching (typos) | EXCELLENT — Bitap algorithm | GOOD — phonetic matching | Fuse.js slightly better |
| Bundle size | 24KB gzipped | 9KB gzipped | FlexSearch |
| Setup complexity | Simple | Moderate (index schema needed) | Fuse.js |
| Relevance ranking | Good | Excellent for full-text | FlexSearch |

**Decision: FlexSearch for the primary HTS index** (100K entries, performance critical).
**Fuse.js for smaller datasets** where developer ergonomics matter more than speed (port search, FTZ zone search, ~3,000 entries each).

### HTS Search Implementation

```typescript
// lib/data/hts.ts
import { Document } from 'flexsearch';

const HTS_INDEX_CONFIG = {
  document: {
    id: 'code',
    index: [
      { field: 'description', tokenize: 'full', resolution: 9 },
      { field: 'code', tokenize: 'full', resolution: 3 },
    ],
    store: ['code', 'description', 'general_rate', 'unit_of_quantity', 'chapter'],
  }
};

let initialized = false;
let htsIndex: Document;

async function initializeIndex(): Promise<void> {
  if (initialized) return;

  // Load pre-built index export (NOT the raw HTS JSON — much faster)
  const exported = await fetch('/data/hts-index.json').then(r => r.json());
  htsIndex = new Document(HTS_INDEX_CONFIG);

  for (const [key, data] of Object.entries(exported)) {
    await htsIndex.import(key, data);
  }
  initialized = true;
}

export async function searchHTS(
  query: string,
  options?: { limit?: number; chapterFilter?: number }
): Promise<HTSResult[]> {
  await initializeIndex();

  const results = await htsIndex.searchAsync(query, {
    limit: options?.limit ?? 20,
    enrich: true,
  });

  let items = results.flatMap(r => r.result).map(r => r.doc as HTSEntry);

  if (options?.chapterFilter) {
    items = items.filter(item => item.chapter === options.chapterFilter);
  }

  // Normalize code format for consistent display
  return items.map(item => ({
    ...item,
    codeDisplay: displayHTSCode(item.code),
  }));
}
```

### Search UI with @tanstack/react-table

HTS search results are displayed in a sortable, filterable table:

```
HTS Lookup Page:
├── SearchInput (debounced 300ms)
│   └── Calls searchHTS() on input change
├── ChapterFilter (2-digit chapter dropdown)
├── ResultsTable (@tanstack/react-table)
│   ├── Column: HTS Code (formatted, clickable to detail page)
│   ├── Column: Description (highlighted matching terms)
│   ├── Column: General Rate (duty percentage or "Free")
│   ├── Column: Unit of Quantity (DOZ, KG, NO, etc.)
│   └── Column: Actions (Use in Calculator, View Details)
└── SelectedCode state → feeds into Landed Cost Calculator
```

### Port and FTZ Search

Smaller datasets use Fuse.js for its superior fuzzy matching:

```typescript
// lib/data/ports.ts
import Fuse from 'fuse.js';

const portFuse = new Fuse(portData, {
  keys: [
    { name: 'name', weight: 0.6 },
    { name: 'locode', weight: 0.4 },
    { name: 'country', weight: 0.2 },
  ],
  threshold: 0.3,      // Allow moderate typos
  minMatchCharLength: 2,
  includeScore: true,
});

export function searchPorts(query: string, limit = 10): Port[] {
  return portFuse.search(query, { limit }).map(r => r.item);
}
```

---

## 8. Performance Considerations

### Large JSON Files Strategy

The HTS schedule is the most significant performance challenge: ~100K entries, ~50-80MB raw JSON.

**Never do this:**
```typescript
// BAD — imports entire 80MB file into server bundle
import htsData from '@/data/hts-schedule.json';
```

**Correct approach — lazy loading + pre-built index:**

```
Build time:
  scripts/build-hts-index.ts
    ├── Download hts-schedule.json from USITC (one-time setup, then periodic refresh)
    ├── Parse and normalize all 100K entries
    ├── Build FlexSearch index, call index.export()
    └── Save to /data/hts-index.json (~15-20MB, compressed ~3-4MB gzip)

Deploy time:
    /data/hts-index.json committed to repo
    Served from Vercel CDN edge — zero compute on first load
    Browser caches with Cache-Control: max-age=86400

Runtime:
    User navigates to /tools/landed-cost or /hts
    Browser fetches hts-index.json (one fetch, cached after first load)
    FlexSearch.import() re-constitutes index in memory (<500ms)
    Subsequent searches: <100ms
```

### Bundle Size Management

| Asset | Concern | Strategy |
|-------|---------|----------|
| deck.gl + MapLibre (~2.5MB) | Would double initial bundle | `dynamic(() => import('./ShippingRouteMap'), { ssr: false })` — only loaded on map page navigation |
| @react-pdf/renderer (~800KB) | Only needed for export | `dynamic(() => import('@/lib/pdf/generate'), { ssr: false })` — triggered by export button click |
| HTS index (15-20MB) | Catastrophic if bundled | Never imported — fetched from CDN on demand |
| FlexSearch (~9KB) | Minimal | Can be in main bundle |
| Recharts (~200KB) | Moderate | Dynamic import charts that appear only in authenticated platform routes |

**Initial JS bundle target: <150KB gzipped** (page-level code, not including lazy chunks)

### Vercel Edge Runtime Constraints

**CRITICAL: Never use Edge Runtime for financial calculation API routes.**

`decimal.js` requires Node.js runtime. Edge Runtime only supports a subset of Web APIs.

```typescript
// app/api/calculate/landed-cost/route.ts
export const runtime = 'nodejs'; // MANDATORY for all calculation routes

// app/api/export/pdf/route.ts
export const runtime = 'nodejs'; // MANDATORY — @react-pdf/renderer needs Node.js
```

Edge Runtime can be used for:
- Simple proxy routes (no financial math)
- Rate limiting checks (Upstash Redis via HTTP API)
- Authentication middleware

### Caching Strategy by Data Type

| Data Type | Storage | TTL | Rationale |
|-----------|---------|-----|-----------|
| HTS lookup results | Client browser cache | 24 hours | Stable — HTS updates once/year |
| Duty rates | Static JSON + ISR | 24 hours | Tariff changes require Federal Register notice (days notice) |
| Carrier rates (Phase 2) | Upstash Redis | 1 hour | Spot rates fluctuate but not minute-to-minute |
| Carrier schedules (Phase 2) | Upstash Redis | 15 minutes | Vessel schedules update several times daily |
| FTZ zone data | Static JSON | Indefinite | FTZ zone changes require regulatory process |
| AI HTS classifications | Upstash Redis | 24 hours | Same product description = same classification |
| Container tracking (Phase 2) | Upstash Redis + DB | 30 seconds floor | Terminal49 webhooks push updates |

### Response Time Targets

| Operation | Target | Max Acceptable |
|-----------|--------|---------------|
| Calculator (client-side, post-load) | <50ms | 100ms |
| HTS search (FlexSearch, index loaded) | <100ms | 300ms |
| Map initial render | <500ms after load | 1s |
| PDF export (1-3 pages) | <2s | 5s |
| HTS AI classification (Phase 3) | <3s | 6s |
| Page LCP (Largest Contentful Paint) | <1.5s | 2.5s |

---

## 9. Deployment Architecture

### Vercel Configuration

```
Production: shippingsavior.com (or configured custom domain)
  ├── Serverless Functions: Node.js 20 runtime
  ├── ISR: Enabled — HTS pages revalidate: 86400 (24hr)
  ├── Edge Network: Global CDN for static assets
  └── Build Command: npx vercel build --prod

Preview: Per-branch preview URLs (automatic)
  ├── shipping-savior-git-feature-name.vercel.app
  └── Neon DB branch per preview env (Phase 2+)
```

**IMPORTANT — Known Vercel Deployment Issue:**
Standard `vercel deploy` returns "Unexpected error." Use the prebuilt workflow:

```bash
npx vercel build --prod && npx vercel deploy --prebuilt --prod --yes --scope ai-acrobatics
```

### CI/CD Pipeline

```
Developer pushes to feature branch
  ↓
GitHub Actions — CI checks:
  1. npm ci (cached)
  2. tsc --noEmit (TypeScript validation)
  3. eslint . (linting)
  4. vitest run (unit tests — all calculator functions tested)
  5. next build (build validation)
  ↓
Vercel preview deployment (auto)
  ↓
PR review + approval
  ↓
Merge to main
  ↓
Vercel production deployment
  ├── drizzle-kit migrate (Phase 2+: DB migrations)
  ├── ISR cache invalidation for HTS pages
  └── Sentry release tag

Post-deploy:
  • /api/health smoke test
  • 5-minute Sentry error window
  • Core Web Vitals check via Vercel Analytics
```

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx eslint .
      - run: npx vitest run
      - run: npx next build
```

### Environment Variables

```
# Phase 1 (minimal)
NEXTAUTH_SECRET=<32-char random>          # Phase 1: placeholder
NEXTAUTH_URL=https://shippingsavior.com

# Phase 2 additions
DATABASE_URL=postgresql://...neon.tech/...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=<token>
MAERSK_API_KEY=<key>
TERMINAL49_API_KEY=<key>
TERMINAL49_WEBHOOK_SECRET=<secret>
ANTHROPIC_API_KEY=sk-ant-...

# Monitoring
SENTRY_DSN=<dsn>
NEXT_PUBLIC_SENTRY_DSN=<dsn>  # Client-side error reporting
```

---

## 10. Phase 2+ Scaling Path

### When to Add a Backend / Database

The trigger for Phase 2 (introducing a database) is **any of these conditions**:

1. The founder wants to save calculation scenarios and retrieve them later
2. Multiple users need shared access to shipment data
3. Live carrier rates are needed (requires caching in Redis to avoid API rate limits)
4. Container tracking requires storing Terminal49 webhook payloads

**Phase 2 adds (all to the existing monolith — no new services):**

| Addition | Technology | Why Now |
|---------|-----------|---------|
| Database | Neon PostgreSQL + Drizzle ORM | Multi-user data isolation |
| Cache | Upstash Redis | Carrier rate TTL, session tokens |
| Auth | NextAuth v5 (Credentials) | User accounts |
| Container tracking | Terminal49 webhooks | Live shipment visibility |
| Carrier APIs | Maersk + CMA CGM schedule APIs | Real transit times and rates |

**Migration from Phase 1 to Phase 2 is non-breaking:**
- Add `/(platform)` route group behind auth — existing public calculator pages remain accessible
- Seed Neon tables with data from Phase 1 JSON files (one-time import script)
- Wire up carrier APIs with Redis cache — calculators start using live rates transparently
- Zero downtime migration

### When to Add Background Workers

Background workers (Railway, persistent Node.js) are needed when:
- Data sync jobs run longer than 60 seconds (Vercel function timeout)
- Rate refresh needs to happen on schedule without a triggering request
- AI agent monitoring requires continuous polling (Federal Register, carrier rate changes)

**Phase 2 workers (Railway):**
- HTS data sync (monthly, ~5 minutes to download + process 100K entries)
- Carrier rate refresh (hourly, Maersk + CMA CGM schedule APIs)

**Phase 3 workers (Railway, expanded):**
- Tariff Monitor Agent (daily — watches Federal Register for Section 301 changes)
- Shipment Alert Agent (event-driven — reacts to Terminal49 webhook events)

### When to Split into Microservices

**Not before Phase 3, and only if justified by measurable cost or performance constraints.**

The only candidate for extraction is the AI worker layer in Phase 3 — Claude API calls for HTS classification and tariff monitoring could be extracted to a separate service if:
- AI costs exceed $500/month (isolation enables per-customer billing)
- AI response times require dedicated compute (not shared with web serving)
- AI workers need to be scaled independently of the web tier

All other functionality should remain in the Next.js monolith. The calculator engines, map data serving, and knowledge base do not benefit from service isolation.

### Scalability Comparison Table

| Concern | Phase 1 | Phase 2 | Phase 3 |
|---------|---------|---------|---------|
| Data storage | JSON files | Neon PostgreSQL | PostgreSQL + pgvector |
| HTS search | FlexSearch (client) | FlexSearch (client) + DB full-text | Semantic vector search |
| Map tiles | MapTiler free | MapTiler paid | Consider Protomaps self-hosted |
| Calculations | Browser client-side | Browser + server batch | Worker threads for bulk |
| PDF generation | Vercel serverless | Vercel serverless | Background queue (Railway) |
| Authentication | None | NextAuth + Credentials | NextAuth + OAuth SSO |
| Multi-tenancy | Single tenant | Org-based data isolation | Full RLS if needed |
| Concurrent users | 50-100 (demo tool) | 500+ | 5,000+ (SaaS) |

---

## 11. Security Architecture

### API Security

- **Rate limiting**: Upstash Redis sliding window on all API routes (60 req/min per user for calculators, 10 req/min for exports)
- **Input validation**: Zod schemas validate all API inputs before any processing
- **Auth middleware**: NextAuth session checked at middleware layer + layout layer + individual API route (defense-in-depth)
- **API keys** (Phase 2): bcrypt-hashed, scoped permissions, prefix display only (full key shown once at creation)

### Security Headers

```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval required for deck.gl WebGL
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://api.maptiler.com",
      "connect-src 'self' https://api.anthropic.com https://api.maersk.com",
      "worker-src blob:", // WebGL shader workers
    ].join('; ')
  }
];
```

### Data Classification

| Data | Sensitivity | Treatment |
|------|-------------|-----------|
| HTS codes + duty rates | Public | No protection needed |
| Calculator inputs/outputs | Low | URL-shareable by design |
| Shipment details (Phase 2) | Medium | Org-scoped, auth required |
| BOL numbers, container numbers | Medium | Org-scoped |
| Declared customs values | High | AES-256-GCM encryption in JSONB (Phase 2) |
| User credentials | Critical | bcrypt hash, never logged |

---

## 12. Monitoring and Observability

### Error Tracking — Sentry

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV,
  tracesSampleRate: 0.1,
});
```

### Health Check

```typescript
// app/api/health/route.ts
export async function GET() {
  // Phase 1: minimal check
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });

  // Phase 2: DB + Redis check
  const [dbCheck, redisCheck] = await Promise.allSettled([
    db.execute(sql`SELECT 1`),
    redis.ping(),
  ]);
  const healthy = dbCheck.status === 'fulfilled' && redisCheck.status === 'fulfilled';
  return Response.json({ status: healthy ? 'ok' : 'degraded' }, { status: healthy ? 200 : 503 });
}
```

### Key Metrics to Track

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| Page LCP | Vercel Analytics | >2.5s |
| Calculator API p95 | Vercel Analytics | >500ms |
| PDF generation duration | Sentry Performance | >5s |
| HTS search load time | Browser perf API (logged) | >300ms on search |
| Redis cache hit rate | Upstash Analytics | <80% (Phase 2) |
| Error rate | Sentry | >1% |

---

## 13. Decision Log

| Decision | Rationale | Revisit When |
|----------|-----------|-------------|
| Next.js monolith, no microservices | Velocity. Phase 1 is a proposal tool. Complexity kills speed. | Phase 3 if AI worker costs justify isolation |
| Static JSON for Phase 1 | Zero hosting cost, zero API cost, instant performance. HTS updates once/year. | Phase 2 when live carrier rates are needed |
| decimal.js for all financial math | IEEE 754 floating-point errors compound. $500 errors on large shipments are unacceptable. | Never — always use decimal.js |
| FlexSearch over Fuse.js for HTS | 100K entries — FlexSearch is 8-10x faster. Fuse.js acceptable for <5K datasets. | If MiniSearch's relevance ranking proves superior |
| MapLibre over Mapbox GL | Zero per-load licensing cost. Identical API. Critical for a data-heavy app with repeated use. | If Mapbox-specific geocoding or routing APIs are needed |
| deck.gl over native GL layers | WebGL2 GPU acceleration required for 500+ simultaneous route arcs at 60fps. | Never for route viz — deck.gl is the industry standard |
| searoute-js for offline polylines | Avoids $X/month Searoutes API cost for Phase 1 demos. Eurostat marnet data is accurate for major routes. | Phase 2 when vessel-specific routing matters |
| @react-pdf/renderer over Puppeteer | No Chrome binary. Works in Vercel serverless. 50MB function size limit not an issue. | If PDFs require pixel-perfect HTML fidelity |
| Neon PostgreSQL over Supabase (Phase 2) | Neon DB branching pairs perfectly with Vercel preview environments. | If Supabase auth features become compelling |
| Upstash Redis over ElastiCache | No persistent connections. HTTP API works in Edge and serverless. Free tier generous. | If Pub/Sub or Streams are needed |
| Pre-built HTS index at deploy time | Raw 80MB HTS JSON can't be loaded at runtime. Index at build time = instant search after one fetch. | If USITC changes the data format significantly |
| Rate lock as FTZ hero feature | Zero competitors offer FTZ incremental withdrawal modeling. April 2025 executive order makes this urgent. | If CBP changes FTZ election rules significantly |

---

*Document version: 1.0*
*Linear: AI-5409*
*Created: 2026-03-26*
*Next review: Phase 2 kickoff (when builder begins platform implementation)*
