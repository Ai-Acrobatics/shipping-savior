# Platform Architecture — Shipping Savior

**Linear:** AI-5420
**Parent:** Phase 4 — Complete Platform Specification
**Version:** 1.0
**Date:** 2026-03-26
**Status:** Definitive Reference
**Supersedes:** `.planning/TECHNICAL-ARCHITECTURE.md` (AI-5409), `.planning/research/ARCHITECTURE.md`, `.planning/research/STACK.md`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [System Architecture](#2-system-architecture)
3. [Component Architecture](#3-component-architecture)
4. [Data Architecture](#4-data-architecture)
5. [Security Architecture](#5-security-architecture)
6. [Integration Architecture](#6-integration-architecture)
7. [Deployment Architecture](#7-deployment-architecture)
8. [Scaling Strategy](#8-scaling-strategy)
9. [Technology Decisions](#9-technology-decisions)

---

## 1. Architecture Overview

### Vision

Shipping Savior is an international freight logistics intelligence platform built as a **Next.js 14 App Router monolith deployed on Vercel**. The platform systematizes manual freight brokerage workflows into data-driven operations — providing calculators, tariff intelligence, route optimization, and FTZ savings analysis for SE Asia-to-US import operations.

The architecture follows a **progressive complexity model** across four phases:

| Phase | Scope | Architecture | Data Layer |
|-------|-------|-------------|------------|
| Phase 0 | Proposal / demo site | Static Next.js | JSON files in `/data/` |
| Phase 1 | Interactive calculators + maps | Next.js with client-side computation | JSON + FlexSearch indexes |
| Phase 2 | Multi-user platform with live data | Next.js + Neon PostgreSQL + Redis | Database + cached API responses |
| Phase 3 | AI agents + SaaS | Monolith + Railway AI workers | PostgreSQL + pgvector + Typesense |

### High-Level Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                          BROWSER / CLIENT                            │
│                                                                      │
│   ┌─────────────┐  ┌─────────────┐  ┌──────────┐  ┌─────────────┐  │
│   │ Calculators  │  │  Maps /     │  │ Dashboard│  │ Knowledge   │  │
│   │ (Zustand +   │  │  Routes     │  │ (Recharts│  │ Base        │  │
│   │  nuqs URL)   │  │  (deck.gl)  │  │  /Tremor)│  │ (Search)    │  │
│   └──────┬───────┘  └──────┬──────┘  └────┬─────┘  └──────┬──────┘  │
└──────────┼─────────────────┼──────────────┼────────────────┼─────────┘
           │                 │              │                │
           ▼                 ▼              ▼                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   NEXT.JS 14 APP ROUTER (Vercel)                     │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐   │
│   │  React Server Components (RSC)                                │   │
│   │  • HTS lookup tables, route comparison grids, knowledge base  │   │
│   │  • Auth guards (verifySession() in platform layout)           │   │
│   └──────────────────────────────────────────────────────────────┘   │
│   ┌──────────────────────────────────────────────────────────────┐   │
│   │  API Routes (/api/*)                                          │   │
│   │  /api/calculate/*  /api/export/*  /api/hts/*  /api/ai/*       │   │
│   └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
         ┌─────────────────┼───────────────────┐
         ▼                 ▼                   ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────────┐
│ Neon PostgreSQL  │ │ Upstash Redis│ │ /data/ directory   │
│ (Phase 2+)       │ │ (Phase 2+)   │ │ (Phase 0-1)        │
│ • users, orgs    │ │ • sessions   │ │ • hts-schedule.json│
│ • shipments      │ │ • rate cache │ │ • duty-rates.json  │
│ • calculations   │ │ • rate limits│ │ • ports.json       │
│ • audit_logs     │ │ • AI cache   │ │ • routes.json      │
│ • hts_codes      │ │              │ │ • ftz-locations.json│
└─────────────────┘ └──────────────┘ └──────────────────┘
         │                                      │
         ▼                                      ▼
┌─────────────────┐                  ┌──────────────────┐
│ External APIs    │                  │ Vercel Blob       │
│ (Phase 2+)       │                  │ • PDF exports     │
│ • Maersk         │                  │ • Document storage│
│ • CMA CGM        │                  └──────────────────┘
│ • Terminal49     │
│ • Anthropic Claude│
│ • Stripe          │
└─────────────────┘
```

### Design Principles

1. **Server Components for data, Client Components for interaction.** HTS tables, knowledge base, and static content render on the server. Calculators, maps, and charts require client-side JavaScript.

2. **Pure TypeScript calculators.** All financial calculation logic lives in `/lib/calculators/` as pure functions (input -> output, no side effects). Runs in both browser and server. Uses `decimal.js` for exact arithmetic — never native floating-point for money.

3. **URL state for shareability.** Calculator inputs persist in URL query parameters via `nuqs`. Users share specific calculations via URL. No backend required for sharing.

4. **Static data first, live data later.** Phase 0-1 operates entirely on static JSON files shipped with the app. Phase 2 introduces databases and APIs without breaking existing functionality.

5. **Progressive enhancement over premature complexity.** No microservices, no message queues, no separate API gateway until measurable cost or performance constraints demand them.

---

## 2. System Architecture

### Layer Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                            │
│                                                                    │
│  React Server Components (RSC)     Client Components               │
│  ├── HTS lookup tables             ├── Calculator forms + results  │
│  ├── Knowledge base articles        ├── Map / route visualizer     │
│  ├── Landing / proposal pages       ├── Dashboard charts           │
│  └── Auth-gated layouts             ├── Shipment tracking board    │
│                                     └── PDF export triggers        │
├──────────────────────────────────────────────────────────────────┤
│                     APPLICATION LAYER                              │
│                                                                    │
│  API Routes (/api/*)               Middleware                      │
│  ├── /api/calculate/*              ├── Auth session verification   │
│  ├── /api/export/pdf               ├── Rate limiting (Redis)       │
│  ├── /api/export/csv               ├── Input validation (zod)      │
│  ├── /api/hts/search               └── Security headers            │
│  ├── /api/ai/classify-hts                                          │
│  ├── /api/ai/optimize-route        Server Actions                  │
│  ├── /api/shipments/*              ├── saveCalculation()           │
│  └── /api/auth/*                   ├── createShipment()            │
│                                     └── updateProfile()            │
├──────────────────────────────────────────────────────────────────┤
│                     DOMAIN LAYER                                   │
│                                                                    │
│  /lib/calculators/                  /lib/data/                     │
│  ├── landed-cost.ts                 ├── hts.ts (search + lookup)   │
│  ├── unit-economics.ts              ├── duty-rates.ts              │
│  ├── duty-tariff.ts                 ├── ports.ts                   │
│  ├── ftz-savings.ts                 ├── routes.ts                  │
│  ├── container-utilization.ts       ├── ftz.ts                     │
│  └── route-comparison.ts           └── containers.ts              │
│                                                                    │
│  /lib/stores/ (Zustand)            /lib/types/                     │
│  ├── calculator.ts                  ├── hts.ts                     │
│  ├── map.ts                         ├── shipping.ts                │
│  └── shipment.ts                    ├── calculator.ts              │
│                                     └── api.ts                     │
├──────────────────────────────────────────────────────────────────┤
│                     INFRASTRUCTURE LAYER                           │
│                                                                    │
│  Database (Neon)      Cache (Upstash)    Storage (Vercel Blob)     │
│  ├── Drizzle ORM      ├── Session mgmt   ├── PDF exports           │
│  ├── Migrations       ├── Rate cache     ├── CSV exports           │
│  └── Connection pool  ├── Rate limiting  └── Document uploads      │
│                       └── AI response                              │
│                          cache            External APIs             │
│                                          ├── Carrier schedules     │
│  Search                                  ├── Container tracking    │
│  ├── FlexSearch (HTS)                    ├── Anthropic Claude      │
│  ├── Fuse.js (ports)                     └── Stripe billing        │
│  └── Typesense (P3)                                               │
└──────────────────────────────────────────────────────────────────┘
```

### Phase Evolution Detail

#### Phase 0 — Static Proposal Site

The initial deployment is a presentation site with no database, no auth, and no live data. All content is pre-rendered at build time.

```
Data:      JSON files in /data/ (shipped with app)
Auth:      None
Compute:   Vercel Serverless (PDF export only)
State:     URL params (nuqs) for calculator sharing
Search:    Client-side FlexSearch for HTS codes
```

#### Phase 1 — Interactive Calculators + Maps

Adds client-side computation, map visualization, and pre-built search indexes. Still no database — all data is static.

```
Data:      JSON files + pre-built FlexSearch indexes
Auth:      None (public tools)
Compute:   Browser-side calculation (decimal.js), Vercel Serverless (PDF)
Maps:      react-map-gl + MapLibre + deck.gl (dynamic import, SSR: false)
Search:    FlexSearch (HTS, 100K entries), Fuse.js (ports, FTZ, <5K entries)
State:     Zustand stores + nuqs URL params
```

#### Phase 2 — Multi-User Platform with Live Data

Introduces authentication, database, caching, and live carrier API integrations. The existing public calculator pages remain accessible — authenticated features live behind `/(platform)` route group.

```
Data:      Neon PostgreSQL (Drizzle ORM) + Upstash Redis cache + JSON fallbacks
Auth:      Custom JWT (bcrypt + httpOnly cookies, access + refresh tokens)
Compute:   Browser + server-side batch calculators
APIs:      Maersk, CMA CGM, Terminal49 (webhooks), USITC HTS REST
Storage:   Vercel Blob (PDFs, documents)
Workers:   Railway (HTS sync monthly, carrier rate refresh hourly)
Search:    FlexSearch (client) + PostgreSQL full-text (server)
```

#### Phase 3 — AI Agents + SaaS

Adds AI-powered classification, tariff monitoring agents, semantic search, and multi-tenant billing.

```
Data:      PostgreSQL + pgvector (embeddings) + Typesense (full-text)
Auth:      Custom JWT + OAuth SSO providers
AI:        Anthropic Claude (HTS classification, tariff advice, route optimization)
Workers:   Railway (Tariff Monitor Agent, Shipment Alert Agent, CBP CROSS sync)
Billing:   Stripe (per-org subscription tiers)
Search:    Typesense (dedicated search, replaces FlexSearch for HTS)
```

---

## 3. Component Architecture

### Route Groups

The Next.js App Router organizes routes into three groups with distinct layouts and access patterns:

| Route Group | Path Prefix | Auth Required | Layout | Purpose |
|-------------|-------------|---------------|--------|---------|
| `(public)/` | `/` | No | Marketing shell | Landing page, public calculators, HTS lookup, map |
| `(auth)/` | `/login`, `/register` | No (redirects if logged in) | Minimal | Authentication flows |
| `(app)/` | `/dashboard/*`, `/tools/*`, `/shipments/*` | Yes | Platform shell (sidebar + header) | Authenticated platform features |

### App Directory Structure

```
src/app/
├── layout.tsx                        # Root layout: fonts, analytics, providers
├── page.tsx                          # Landing page / proposal overview
├── (public)/
│   ├── map/page.tsx                  # Full-page route visualization (deck.gl)
│   ├── hts/
│   │   ├── page.tsx                  # HTS code search interface
│   │   └── [code]/page.tsx           # HTS detail + duty rates by country
│   └── tools/
│       ├── landed-cost/page.tsx      # Public landed cost calculator
│       └── container-calc/page.tsx   # Public container utilization calculator
├── (auth)/
│   ├── layout.tsx                    # Minimal auth layout (centered card)
│   ├── login/page.tsx                # Email + password login
│   └── register/page.tsx             # Invite-only registration
├── (app)/
│   ├── layout.tsx                    # Platform shell: sidebar, header, session guard
│   ├── dashboard/
│   │   ├── page.tsx                  # KPI overview, active shipments, cost summary
│   │   ├── notifications/page.tsx    # Tariff alerts, shipment updates
│   │   └── savings/page.tsx          # FTZ savings dashboard
│   ├── tools/
│   │   ├── landed-cost/page.tsx      # Authenticated landed cost (save scenarios)
│   │   ├── unit-economics/page.tsx   # Unit economics calculator
│   │   ├── ftz-analyzer/page.tsx     # FTZ savings analyzer
│   │   ├── container-calc/page.tsx   # Container utilization calculator
│   │   └── route-comparison/page.tsx # Carrier/route comparison tool
│   ├── shipments/
│   │   ├── page.tsx                  # Shipment list (filterable, sortable)
│   │   ├── new/page.tsx              # Create new shipment
│   │   └── [id]/page.tsx             # Shipment detail + tracking timeline
│   ├── knowledge-base/
│   │   ├── page.tsx                  # Article index with search
│   │   └── [slug]/page.tsx           # Article detail
│   └── settings/
│       ├── page.tsx                  # Organization settings
│       ├── team/page.tsx             # Team member management
│       └── billing/page.tsx          # Subscription management (Stripe)
└── api/
    ├── calculate/
    │   ├── landed-cost/route.ts      # POST: landed cost computation (Node.js runtime)
    │   ├── ftz-savings/route.ts      # POST: FTZ comparison analysis
    │   ├── container-utilization/route.ts
    │   └── unit-economics/route.ts
    ├── export/
    │   ├── pdf/route.ts              # POST: PDF generation (@react-pdf/renderer)
    │   └── csv/route.ts              # POST: CSV export
    ├── hts/
    │   └── search/route.ts           # GET: HTS code search (server-side FlexSearch)
    ├── ai/
    │   ├── classify-hts/route.ts     # POST: AI-powered HTS classification
    │   └── optimize-route/route.ts   # POST: AI route optimization
    ├── shipments/
    │   ├── route.ts                  # GET/POST: shipment CRUD
    │   └── [id]/
    │       ├── route.ts              # GET/PATCH/DELETE: single shipment
    │       └── events/route.ts       # GET: shipment event timeline
    ├── webhooks/
    │   └── terminal49/route.ts       # POST: container tracking webhooks
    ├── auth/
    │   ├── login/route.ts            # POST: authenticate + issue JWT
    │   ├── register/route.ts         # POST: create account (invite-only)
    │   ├── refresh/route.ts          # POST: refresh token rotation
    │   └── logout/route.ts           # POST: invalidate tokens
    └── health/route.ts               # GET: system health check
```

### Component Boundaries

| Component | Responsibility | Dependencies | Rendering |
|-----------|---------------|--------------|-----------|
| `LandedCostCalculator` | Multi-input form, real-time cost breakdown, export actions | `react-hook-form`, `zod`, `decimal.js`, `Recharts`, Zustand store | Client |
| `FTZAnalyzer` | Scenario builder, savings chart, withdrawal timeline | `react-hook-form`, `zod`, `decimal.js`, `Recharts`, Zustand store | Client |
| `RouteComparison` | Origin/dest port selection, 3-tier carrier cards, transit chart | `Fuse.js` (port search), `Recharts`, Zustand store | Client |
| `ContainerCalculator` | Product dimensions input, volume/weight dual constraint | `react-hook-form`, `zod`, `convert-units`, `decimal.js` | Client |
| `UnitEconomicsCalculator` | Full pipeline: origin -> landed -> wholesale -> retail | `decimal.js`, `Recharts`, `nuqs` | Client |
| `ShippingRouteMap` | Main route visualization compositing all map layers | `react-map-gl`, `MapLibre GL`, `deck.gl`, `searoute-js` | Client (SSR: false) |
| `PortMap` | Port-only view for detail pages | `react-map-gl`, `deck.gl` ScatterplotLayer | Client (SSR: false) |
| `FTZMap` | FTZ boundary polygons on US map | `react-map-gl`, `deck.gl` GeoJsonLayer | Client (SSR: false) |
| `HTSLookupTable` | Sortable, filterable HTS search results | `@tanstack/react-table`, `FlexSearch` | Server (search) + Client (table) |
| `KPIDashboard` | Metric tiles, trend charts, shipment board | `@tremor/react`, `Recharts` | Client |
| `ShipmentBoard` | Kanban: sourcing -> transit -> customs -> FTZ -> delivered | `@tanstack/react-table` or custom drag | Client |
| `KnowledgeBase` | Article index, search, detail rendering | MDX content, `Fuse.js` search | Server |
| `PDFReports` | Landed cost, FTZ analysis, route comparison PDF templates | `@react-pdf/renderer` | Server (API route only) |

### Component Hierarchy

```
App Shell (layout.tsx)
├── ThemeProvider (Tailwind dark mode)
├── AuthProvider (JWT session context — Phase 2+)
└── AppLayout
    ├── Sidebar (navigation, org name, user role badge)
    ├── Header (breadcrumb, search, user menu)
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
        │   ├── UnitEconomicsCalculator
        │   │   ├── PipelineInputs (origin -> landed -> wholesale -> retail)
        │   │   ├── MarginWaterfall (Recharts waterfall chart)
        │   │   └── ScaleProjection (cost-per-unit at different volumes)
        │   ├── ContainerCalculator
        │   │   ├── ProductDimensionForm (L x W x H, weight)
        │   │   ├── ContainerSelector (20GP, 40GP, 40HC, 40RF)
        │   │   └── UtilizationResult (volume vs weight dual gauge)
        │   └── RouteComparison
        │       ├── RouteInputPanel (origin port, destination port, cargo type)
        │       ├── CarrierOptionCards (3 tiers: backhaul / standard / express)
        │       └── TransitTimeChart (Recharts grouped bar)
        ├── MapPages
        │   └── ShippingRouteMap
        │       ├── MapLibreBase (vector tiles — MapTiler free tier)
        │       ├── RouteArcLayer (great circle arcs colored by transit time)
        │       ├── PortScatterLayer (ports sized by annual TEU throughput)
        │       ├── FTZGeoJsonLayer (FTZ boundaries — US only in Phase 1)
        │       └── PortDetailPanel (click-to-expand overlay component)
        ├── DashboardPages
        │   ├── KPICards (@tremor/react: cost/shipment, duty rate, FTZ savings)
        │   ├── ShipmentBoard (kanban: sourcing → transit → customs → FTZ → delivered)
        │   ├── CostTrendChart (Recharts LineChart — per-unit landed cost over time)
        │   └── DutyExposureGauge (total duty liability: locked vs. market rates)
        └── KnowledgeBasePages
            ├── ArticleIndex (searchable list with category filters)
            └── ArticleDetail (MDX rendering with compliance disclosures)
```

### State Management

**Zustand stores** handle ephemeral client-side state. Server data flows from Server Components directly — no global server state store.

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
  toggleLayer: (layer: string) => void;
  setSelectedPort: (port: Port | null) => void;
}
```

**URL state with `nuqs`** persists calculator inputs for shareability:

```typescript
// Calculator inputs sync to URL query params
// ?units=500000&origin=VN&hts=6109100060&shippingCost=4800
const [units, setUnits] = useQueryState('units', parseAsInteger.withDefault(500000));
const [originCountry, setOriginCountry] = useQueryState('origin', parseAsString.withDefault('VN'));
const [htsCode, setHtsCode] = useQueryState('hts', parseAsString);
```

### Library Mapping

| Category | Library | Version | Purpose |
|----------|---------|---------|---------|
| Maps | `react-map-gl` | 8.1.0 | React bindings for map rendering (57KB bundle, rewritten in v7) |
| Maps | `maplibre-gl` | 4.x | Free open-source vector tile renderer (BSD-2-Clause, zero API key) |
| Maps | `deck.gl` | 9.2.x | WebGL2 data layers: ArcLayer, ScatterplotLayer, GeoJsonLayer, TripsLayer |
| Maps | `searoute-js` | 0.1.0 | Offline maritime route polylines (Eurostat marnet dataset) |
| Charts | `recharts` | 3.8.x | Dashboard charts: bar, line, area, pie, waterfall (24.8K GitHub stars) |
| Charts | `@tremor/react` | 3.x | Pre-built KPI cards, metric displays (built on Recharts + Tailwind + Radix) |
| Tables | `@tanstack/react-table` | 8.x | Headless sortable/filterable tables for HTS results, shipment lists |
| Search | `fuse.js` | 7.x | Fuzzy search for small datasets (<5K entries): ports, FTZ zones |
| Search | `flexsearch` | 0.7.x | High-performance full-text search for HTS codes (100K+ entries, <100ms) |
| Forms | `react-hook-form` | 7.x | Calculator input forms with minimal re-renders |
| Forms | `zod` | 3.x | Schema validation for all inputs (HTS codes, dimensions, rates) |
| Financial | `decimal.js` | 10.x | Arbitrary-precision arithmetic for duty/tariff/cost calculations |
| Financial | `currency.js` | 2.x | Multi-currency formatting (USD, VND, THB, IDR) |
| Units | `convert-units` | 3.x | CBM/ft3, kg/lbs conversions for container calculations |
| Dates | `date-fns` | 3.x | Transit time calculations, schedule parsing (tree-shakeable) |
| PDF | `@react-pdf/renderer` | 4.3.x | Server-side PDF generation (pure Node.js, no Chrome binary) |
| State | `zustand` | 5.x | Lightweight client state for calculator and map stores |
| URL State | `nuqs` | 2.x | URL query parameter synchronization for calculator shareability |
| ORM | `drizzle-orm` | 0.30.x | Type-safe PostgreSQL ORM (Phase 2+) |
| Auth | Custom JWT | N/A | bcrypt + httpOnly cookies + refresh token rotation (Phase 2+) |

### Server Component vs. Client Component Split

| Component | Type | Rationale |
|-----------|------|-----------|
| HTS lookup result tables | Server | Pure data display — no interactivity needed |
| Knowledge base articles | Server | Static MDX content — no client JS needed |
| Landing / proposal pages | Server | SEO-optimized, no dynamic interaction |
| Calculator forms + results | Client | User input + real-time calculation feedback |
| Map / route visualizer | Client | WebGL requires browser — `dynamic(() => ..., { ssr: false })` |
| Recharts / Tremor charts | Client | DOM measurements required for responsive sizing |
| Shipment tracking board | Client | Polling / SSE for live updates (Phase 2+) |

**Critical rule:** All map components MUST use `dynamic(() => import(...), { ssr: false })`. deck.gl and MapLibre require `window` and `WebGL` which do not exist in the server environment.

---

## 4. Data Architecture

### Database Schema — Neon PostgreSQL with Drizzle ORM (Phase 2+)

13 tables organized by domain:

| Table | Purpose | Phase | Key Columns |
|-------|---------|-------|-------------|
| `organizations` | Multi-tenant root entity (one org = one brokerage company) | 2 | `id`, `name`, `slug`, `plan_tier`, `created_at` |
| `users` | User accounts with role-based access | 2 | `id`, `org_id`, `email`, `password_hash`, `role`, `created_at` |
| `shipments` | Core operational entity (one container movement) | 2 | `id`, `org_id`, `origin_port`, `dest_port`, `hts_code`, `status`, `carrier_id` |
| `shipment_events` | Immutable event log for tracking updates | 2 | `id`, `shipment_id`, `event_type`, `location`, `timestamp`, `source` |
| `carriers` | Ocean carrier registry | 2 | `id`, `name`, `scac_code`, `api_enabled`, `logo_url` |
| `carrier_rates` | Rate cards per lane | 2 | `id`, `carrier_id`, `origin_port`, `dest_port`, `container_type`, `rate_usd`, `valid_until` |
| `hts_codes` | Local mirror of USITC HTS schedule | 2 | `code` (PK), `description`, `general_rate`, `special_rates`, `unit_of_quantity`, `chapter`, `revision` |
| `duty_rates` | Country-specific rates by HTS code | 2 | `id`, `hts_code`, `country_iso`, `mfn_rate`, `section_301_rate`, `gsp_eligible`, `effective_date` |
| `ftz_zones` | FTZ zone database (seeded from OFIS) | 2 | `id`, `zone_number`, `operator`, `city`, `state`, `customs_port`, `lat`, `lng` |
| `calculations` | Saved calculator outputs for history | 2 | `id`, `org_id`, `user_id`, `type`, `inputs` (JSONB), `results` (JSONB), `created_at` |
| `customs_rulings` | CBP CROSS rulings with embeddings | 3 | `id`, `ruling_number`, `date`, `hts_codes`, `description`, `reasoning`, `embedding` (pgvector) |
| `api_keys` | API keys for programmatic access | 2 | `id`, `org_id`, `key_hash`, `prefix`, `permissions`, `last_used_at` |
| `audit_logs` | Immutable compliance audit trail | 2 | `id`, `org_id`, `user_id`, `action`, `resource_type`, `resource_id`, `metadata` (JSONB), `timestamp` |

**Drizzle schema example:**

```typescript
// lib/db/schema.ts
import { pgTable, text, timestamp, jsonb, real, integer, varchar, boolean } from 'drizzle-orm/pg-core';

export const organizations = pgTable('organizations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: varchar('slug', { length: 63 }).notNull().unique(),
  planTier: text('plan_tier', { enum: ['free', 'pro', 'enterprise'] }).default('free'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orgId: text('org_id').references(() => organizations.id).notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['owner', 'admin', 'member', 'viewer'] }).default('member'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const shipments = pgTable('shipments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orgId: text('org_id').references(() => organizations.id).notNull(),
  originPort: varchar('origin_port', { length: 5 }).notNull(), // UN/LOCODE
  destPort: varchar('dest_port', { length: 5 }).notNull(),
  htsCode: varchar('hts_code', { length: 10 }),
  containerType: text('container_type', { enum: ['20GP', '40GP', '40HC', '40RF', '20RF'] }),
  status: text('status', { enum: ['draft', 'booked', 'in_transit', 'at_port', 'customs', 'ftz', 'delivered'] }),
  carrierId: text('carrier_id').references(() => carriers.id),
  declaredValueUsd: real('declared_value_usd'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Caching — Upstash Redis

| Cache Key Pattern | TTL | Purpose |
|-------------------|-----|---------|
| `session:{userId}` | 30 days | JWT session token validation |
| `rate:{carrierId}:{origin}:{dest}:{containerType}` | 1 hour | Carrier rate cache (spot rates) |
| `schedule:{carrierId}:{origin}:{dest}` | 15 minutes | Vessel schedule cache |
| `ai:classify:{hash(description)}` | 24 hours | AI HTS classification cache |
| `ratelimit:{userId}:{endpoint}` | Sliding window | Per-user API rate limiting |
| `tracking:{containerId}` | 30 seconds (floor) | Container tracking position |

**Rate limiting configuration (Upstash sliding window):**

| Tier | Calculator API | Export API | AI API | HTS Search |
|------|---------------|-----------|--------|------------|
| Free | 30 req/min | 5 req/min | 3 req/min | 60 req/min |
| Pro | 120 req/min | 30 req/min | 20 req/min | 300 req/min |
| Enterprise | 600 req/min | 120 req/min | 100 req/min | Unlimited |

### Static Data — `/data/` Directory (Phase 0-1)

All Phase 0-1 data ships with the application as JSON files. Zero API cost, instant response, works offline.

```
/data/
├── hts-schedule.json           # Full HTS from USITC (~100K entries, ~50-80MB raw)
├── hts-index.json              # Pre-built FlexSearch index (~15-20MB, built at deploy time)
├── duty-rates-sea.json         # SE Asia duty rates from USITC DataWeb (~200KB)
│                               # Vietnam, Thailand, Indonesia, Cambodia, Philippines
│                               # Includes MFN rate, Section 301 rate, GSP status
├── ftz-locations.json          # 260+ US FTZ zones from OFIS trade.gov
│                               # Zone number, operator, city, state, customs port, lat/lng
├── carrier-routes.json         # Major SE Asia → US routes
│                               # Port pairs, transit days, transshipment points, carrier
├── ports.json                  # Port database (UN/LOCODE + World Port Index)
│                               # ~3,700 ports with coordinates, annual TEU, type
├── container-specs.json        # Standard container dimensions + payload limits
│                               # 20GP, 40GP, 40HC, 40RF (reefer), 20RF
└── route-polylines.json        # Pre-computed searoute-js GeoJSON LineStrings
                                # Generated at build time, not runtime
```

**HTS Data Loading Strategy (3-layer lazy loading):**

```
Layer 1 — Build-time pre-processing (scripts/build-hts-index.ts):
  • Download full HTS JSON from hts.usitc.gov
  • Normalize: strip non-printable characters, standardize to 10-digit codes
  • Build FlexSearch index → /data/hts-index.json (~15-20MB)
  • Extract SE Asia duty rates → /data/duty-rates-sea.json (~200KB)
  • Commit processed files to repo

Layer 2 — Route-level lazy loading (app/hts/page.tsx):
  • hts-index.json is NOT bundled in the main JS bundle
  • Loaded only when user navigates to /hts or /tools/landed-cost
  • Dynamic import: const { loadHTSIndex } = await import('@/lib/data/hts')
  • Browser caches after first load (Cache-Control: max-age=86400)

Layer 3 — Search-time streaming (lib/data/hts.ts):
  • FlexSearch index initialized once, stored in module scope
  • Subsequent searches reuse initialized index — no re-parse
  • Search executes in <100ms after index is loaded
```

### Search Architecture

| Phase | HTS Search (100K entries) | Port/FTZ Search (<5K entries) |
|-------|--------------------------|-------------------------------|
| Phase 0-1 | FlexSearch (client-side, <100ms after index load) | Fuse.js (client-side fuzzy matching, instant) |
| Phase 2 | FlexSearch (client) + PostgreSQL `tsvector` (server fallback) | Fuse.js (client) + PostgreSQL LIKE (server) |
| Phase 3 | Typesense (dedicated search cluster, semantic + full-text) | Typesense (unified search across all entities) |

**FlexSearch configuration for HTS:**

```typescript
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
```

**Fuse.js configuration for ports:**

```typescript
const portFuse = new Fuse(portData, {
  keys: [
    { name: 'name', weight: 0.6 },
    { name: 'locode', weight: 0.4 },
    { name: 'country', weight: 0.2 },
  ],
  threshold: 0.3,
  minMatchCharLength: 2,
  includeScore: true,
});
```

### File Storage — Vercel Blob

| Content Type | Storage | Access Pattern |
|-------------|---------|----------------|
| Generated PDF reports | Vercel Blob | Signed URL, 24-hour expiry |
| CSV exports | Vercel Blob | Signed URL, 1-hour expiry |
| Uploaded BOL documents (Phase 2) | Vercel Blob | Org-scoped, auth-gated |
| Ebook/guide downloads | Vercel Blob | Public URL with CDN caching |

### HTS Code Normalization

All HTS codes are normalized on import to ensure consistent lookup:

| Source Format | Normalized (storage) | Display Format |
|--------------|---------------------|----------------|
| `6109100060` | `6109100060` | `6109.10.00.60` |
| `6109.10.00.60` | `6109100060` | `6109.10.00.60` |
| `6109.10` | `6109100000` (padded) | `6109.10` |

```typescript
export function normalizeHTSCode(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '');
  return digits.padEnd(10, '0').substring(0, 10);
}

export function displayHTSCode(normalized: string): string {
  return `${normalized.substring(0, 4)}.${normalized.substring(4, 6)}.${normalized.substring(6, 8)}.${normalized.substring(8, 10)}`;
}
```

---

## 5. Security Architecture

### Authentication — Custom JWT (Phase 2+)

**Decision:** Custom JWT implementation with bcrypt + httpOnly cookies. Not NextAuth — full control over token lifecycle, refresh rotation, and session invalidation.

```
Login Flow:
  POST /api/auth/login { email, password }
    → bcrypt.compare(password, stored_hash)
    → Generate access token (JWT, 15 min TTL)
    → Generate refresh token (opaque, 30 day TTL, stored in Redis)
    → Set httpOnly, Secure, SameSite=Strict cookies for both tokens
    → Return { user, org, role }

Token Refresh:
  POST /api/auth/refresh (refresh token in cookie)
    → Validate refresh token against Redis
    → Rotate: issue new access + refresh tokens, invalidate old refresh
    → Set new cookies

Session Verification (defense-in-depth):
  Layer 1: Next.js middleware checks access token on every request to /(app)/*
  Layer 2: Platform layout.tsx calls verifySession() server-side
  Layer 3: Individual API routes validate token + check permissions
```

**Token structure:**

```typescript
interface AccessTokenPayload {
  sub: string;        // user ID
  org: string;        // organization ID
  role: UserRole;     // 'owner' | 'admin' | 'member' | 'viewer'
  iat: number;
  exp: number;        // 15 minutes from iat
}
```

### Authorization — Role-Based Access Control (RBAC)

Four roles with hierarchical permissions:

| Resource | Owner | Admin | Member | Viewer |
|----------|-------|-------|--------|--------|
| Dashboard (read) | Yes | Yes | Yes | Yes |
| Calculators (use) | Yes | Yes | Yes | Yes |
| Calculations (save) | Yes | Yes | Yes | No |
| Shipments (read) | Yes | Yes | Yes | Yes |
| Shipments (create/edit) | Yes | Yes | Yes | No |
| Shipments (delete) | Yes | Yes | No | No |
| HTS lookup (use) | Yes | Yes | Yes | Yes |
| PDF/CSV export | Yes | Yes | Yes | No |
| AI classification | Yes | Yes | Yes | No |
| Team management | Yes | Yes | No | No |
| Billing / subscription | Yes | No | No | No |
| API key management | Yes | Yes | No | No |
| Audit log (read) | Yes | Yes | No | No |
| Organization settings | Yes | No | No | No |

**Data isolation:** All queries include `WHERE org_id = ?` — enforced at the Drizzle query layer, not just at the API route level. No user can access another organization's data.

```typescript
// lib/db/queries.ts — all queries scoped to org
export function getShipments(orgId: string) {
  return db.select().from(shipments).where(eq(shipments.orgId, orgId));
}
```

### Rate Limiting

Upstash Redis sliding window rate limiter applied at the middleware level:

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute default
  analytics: true,
});
```

Per-endpoint rate limits override the default based on user tier (see Caching section above).

### Input Validation

Every API route validates input with zod before processing:

```typescript
// app/api/calculate/landed-cost/route.ts
const landedCostSchema = z.object({
  unitCostOriginUsd: z.number().positive().max(1_000_000),
  unitsPerContainer: z.number().int().positive().max(10_000_000),
  containerShippingCostUsd: z.number().nonnegative().max(100_000),
  dutyRatePercent: z.number().nonnegative().max(500),
  incoterm: z.enum(['FOB', 'CIF', 'DDP']),
  insuranceRatePercent: z.number().nonnegative().max(100).optional(),
  customsBrokerFeeUsd: z.number().nonnegative().max(50_000).optional(),
  inlandFreightUsd: z.number().nonnegative().max(100_000).optional(),
  mpfRatePercent: z.number().nonnegative().max(100).optional(),
  hmfRatePercent: z.number().nonnegative().max(100).optional(),
  sectionTariffRatePercent: z.number().nonnegative().max(500).optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = landedCostSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  // ... proceed with validated data
}
```

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
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",   // unsafe-eval required for deck.gl WebGL
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://api.maptiler.com",
      "connect-src 'self' https://api.anthropic.com https://api.maersk.com https://api-portal.cma-cgm.com",
      "worker-src blob:",                                    // WebGL shader workers
    ].join('; ')
  }
];
```

### Data Classification

| Data | Sensitivity | Treatment |
|------|-------------|-----------|
| HTS codes + duty rates | Public | No protection needed — government data |
| Calculator inputs/outputs | Low | URL-shareable by design |
| Shipment details (Phase 2) | Medium | Org-scoped, auth required |
| BOL numbers, container IDs | Medium | Org-scoped, auth required |
| Declared customs values | High | AES-256-GCM encrypted in JSONB column (Phase 2) |
| User credentials | Critical | bcrypt hash (cost factor 12), never logged, never returned in API responses |
| API keys | Critical | bcrypt-hashed storage, prefix-only display after creation |

---

## 6. Integration Architecture

### Integration Tiers

Integrations are organized by criticality and phase:

#### Tier 1 — Core (Phase 1-2)

| Integration | Purpose | Protocol | Auth | Cost |
|-------------|---------|----------|------|------|
| **USITC HTS API** | HTS code search, duty rate lookup | REST (JSON) | None (public) | Free |
| **USITC HTS Downloads** | Full HTS schedule for offline index | HTTP download (JSON/CSV) | None | Free |
| **OFIS FTZ Database** | FTZ zone locations, operators | Web scrape → JSON | None | Free |
| **Vercel Blob** | PDF/CSV export storage | Vercel SDK | API token | Included in Vercel plan |
| **Resend** | Transactional email (invites, alerts) | REST API | API key | Free tier: 100 emails/day |

#### Tier 2 — Data (Phase 2)

| Integration | Purpose | Protocol | Auth | Cost |
|-------------|---------|----------|------|------|
| **Maersk API** | Vessel schedules, tracking, booking | REST (JSON, DCSA-compliant) | API key (developer portal) | Free |
| **CMA CGM API** | Schedules, tracking, demurrage tariffs | REST (JSON, DCSA-compliant) | API key (web portal) | Free tier |
| **Hapag-Lloyd API** | Route options, tracking, transport events | REST (JSON, DCSA-compliant) | API key | Free |
| **Terminal49** | Container tracking (webhooks) | REST + Webhooks | API key | Free (100 containers) |
| **Federal Register API** | Trade policy change monitoring | REST (JSON) | None | Free |

#### Tier 3 — Intelligence (Phase 3)

| Integration | Purpose | Protocol | Auth | Cost |
|-------------|---------|----------|------|------|
| **Anthropic Claude** | HTS classification, tariff advice, route optimization | REST API | API key | Pay-per-token |
| **CBP CROSS** | Customs rulings database for AI training | Web scrape → PostgreSQL + pgvector | None | Free (public gov data) |
| **MarineTraffic / Kpler** | Real-time AIS vessel positions | REST API | API key | ~$100/mo+ |

#### Tier 4 — Monetization (Phase 3)

| Integration | Purpose | Protocol | Auth | Cost |
|-------------|---------|----------|------|------|
| **Stripe** | Subscription billing, usage metering | REST API + Webhooks | API key + webhook secret | 2.9% + $0.30/txn |

### Integration Pattern

All external API integrations follow the same adapter pattern:

```
External API → Adapter → Cache (Redis) → Normalize → Serve to App
```

```typescript
// lib/integrations/adapter.ts — base pattern

interface APIAdapter<TRaw, TNormalized> {
  fetch(params: Record<string, string>): Promise<TRaw>;
  normalize(raw: TRaw): TNormalized;
  cacheKey(params: Record<string, string>): string;
  cacheTTL: number; // seconds
}

// lib/integrations/maersk.ts — example implementation
export class MaerskScheduleAdapter implements APIAdapter<MaerskScheduleRaw, NormalizedSchedule> {
  async fetch(params: { origin: string; dest: string }) {
    const response = await fetch(
      `https://api.maersk.com/schedules/point-to-point?originPort=${params.origin}&destinationPort=${params.dest}`,
      { headers: { 'Consumer-Key': process.env.MAERSK_API_KEY! } }
    );
    if (!response.ok) throw new IntegrationError('maersk', response.status);
    return response.json();
  }

  normalize(raw: MaerskScheduleRaw): NormalizedSchedule {
    return {
      carrier: 'MAERSK',
      scac: 'MAEU',
      routes: raw.oceanProducts.map(p => ({
        departureDate: p.departureDateTime,
        arrivalDate: p.arrivalDateTime,
        transitDays: p.transitTime,
        vessel: p.vesselName,
        transshipments: p.transshipmentPorts,
      })),
    };
  }

  cacheKey(params: { origin: string; dest: string }) {
    return `schedule:maersk:${params.origin}:${params.dest}`;
  }

  cacheTTL = 900; // 15 minutes
}
```

### Circuit Breaker Pattern

External APIs fail. The circuit breaker prevents cascading failures:

```typescript
// lib/integrations/circuit-breaker.ts

interface CircuitBreakerConfig {
  failureThreshold: number;    // failures before opening circuit (default: 5)
  recoveryTimeout: number;     // ms before attempting recovery (default: 30000)
  monitorWindow: number;       // ms window for counting failures (default: 60000)
}

type CircuitState = 'closed' | 'open' | 'half-open';

class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureCount = 0;
  private lastFailureTime = 0;

  async execute<T>(fn: () => Promise<T>, fallback: () => T): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.config.recoveryTimeout) {
        this.state = 'half-open';
      } else {
        return fallback(); // Use cached/static data
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      return fallback();
    }
  }
}
```

**Fallback strategy per integration:**

| Integration | Fallback When Circuit Open |
|-------------|--------------------------|
| Maersk API | Return last cached schedule from Redis |
| CMA CGM API | Return last cached schedule from Redis |
| Terminal49 | Show "Last updated: X hours ago" with stale data |
| USITC HTS API | Fall back to static `/data/hts-schedule.json` |
| Anthropic Claude | Return "AI classification unavailable — use manual HTS lookup" |
| Stripe | Queue billing events for retry, allow continued platform use |

### Webhook Handling

```typescript
// app/api/webhooks/terminal49/route.ts
export async function POST(req: Request) {
  const signature = req.headers.get('x-terminal49-signature');
  const body = await req.text();

  // Verify webhook signature
  const isValid = verifyWebhookSignature(body, signature, process.env.TERMINAL49_WEBHOOK_SECRET!);
  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(body);

  // Process tracking update
  switch (event.type) {
    case 'tracking.update':
      await processTrackingUpdate(event.data);
      break;
    case 'tracking.milestone':
      await processMilestone(event.data);
      break;
  }

  // Always return 200 quickly — process async if needed
  return new Response('OK', { status: 200 });
}
```

---

## 7. Deployment Architecture

### Vercel Configuration

```
Production: shippingsavior.com (custom domain)
├── Runtime: Node.js 20
├── Serverless Functions: /api/* routes (Node.js runtime, NOT Edge for calculators/PDFs)
├── Edge Functions: Middleware (auth checks, rate limiting, redirects)
├── ISR: Enabled — HTS pages revalidate every 24 hours (revalidate: 86400)
├── CDN: Vercel Edge Network — static assets, ISR pages, /data/*.json
└── Build: npx vercel build --prod && npx vercel deploy --prebuilt --prod --yes --scope ai-acrobatics

Preview: Per-branch preview URLs (automatic)
├── shipping-savior-git-{branch}.vercel.app
└── Neon DB branch per preview env (Phase 2+ — neon-vercel integration)
```

**Known deployment constraint:** Standard `vercel deploy` returns "Unexpected error." Always use the prebuilt workflow:

```bash
npx vercel build --prod && npx vercel deploy --prebuilt --prod --yes --scope ai-acrobatics
```

### Vercel Runtime Constraints

| Route | Runtime | Rationale |
|-------|---------|-----------|
| `/api/calculate/*` | `nodejs` | `decimal.js` requires Node.js — not available in Edge Runtime |
| `/api/export/pdf` | `nodejs` | `@react-pdf/renderer` requires Node.js (no Chrome binary needed) |
| `/api/export/csv` | `nodejs` | File generation |
| `/api/hts/search` | `nodejs` | FlexSearch index in memory |
| `/api/ai/*` | `nodejs` | Anthropic SDK, long-running requests |
| `/api/auth/*` | `nodejs` | bcrypt hash computation |
| Middleware | `edge` | Fast auth checks, rate limiting (Upstash HTTP API), redirects |

**Function size limits:** Vercel serverless functions have a 50MB limit. @react-pdf/renderer fits within this. Puppeteer would not (Chrome binary ~100MB).

### Build Pipeline

```
Developer pushes to feature branch
  │
  ▼
GitHub Actions — CI Checks:
  1. npm ci (cached node_modules)
  2. tsc --noEmit (TypeScript type checking)
  3. eslint . (linting)
  4. vitest run (unit tests — all calculator functions tested)
  5. next build (build validation)
  │
  ▼
Vercel Preview Deployment (automatic per branch)
  ├── Preview URL generated
  └── Neon DB branch provisioned (Phase 2+)
  │
  ▼
PR Review + Approval
  │
  ▼
Merge to main
  │
  ▼
Vercel Production Deployment
  ├── drizzle-kit migrate (Phase 2+: DB schema migrations)
  ├── ISR cache invalidation for updated pages
  └── Sentry release tag
  │
  ▼
Post-Deploy Verification:
  • /api/health smoke test
  • 5-minute Sentry error window monitoring
  • Core Web Vitals check (Vercel Analytics)
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

```bash
# Phase 0-1 (minimal)
NEXTAUTH_SECRET=<32-char-random>           # Placeholder for Phase 2
NEXTAUTH_URL=https://shippingsavior.com
NEXT_PUBLIC_MAPTILER_KEY=<key>             # MapTiler free tier API key

# Phase 2 additions
DATABASE_URL=postgresql://...neon.tech/...  # Neon PostgreSQL connection string
UPSTASH_REDIS_REST_URL=https://...          # Upstash Redis HTTP endpoint
UPSTASH_REDIS_REST_TOKEN=<token>
JWT_ACCESS_SECRET=<64-char-random>          # Access token signing secret
JWT_REFRESH_SECRET=<64-char-random>         # Refresh token signing secret (different from access)
MAERSK_API_KEY=<key>                        # Maersk Developer Portal
CMA_CGM_API_KEY=<key>                       # CMA CGM API Portal
TERMINAL49_API_KEY=<key>
TERMINAL49_WEBHOOK_SECRET=<secret>
RESEND_API_KEY=re_...                       # Transactional email
BLOB_READ_WRITE_TOKEN=<token>               # Vercel Blob storage

# Phase 3 additions
ANTHROPIC_API_KEY=sk-ant-...                # Claude API for HTS classification
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Monitoring (all phases)
SENTRY_DSN=<dsn>
NEXT_PUBLIC_SENTRY_DSN=<dsn>
```

### CDN and Caching Strategy

| Asset Type | Cache-Control | CDN Behavior |
|-----------|---------------|--------------|
| Static JS/CSS bundles | `max-age=31536000, immutable` | Edge-cached globally, content-hashed filenames |
| `/data/*.json` files | `max-age=86400, stale-while-revalidate=3600` | Edge-cached, revalidates daily |
| ISR pages (`/hts/*`) | `s-maxage=86400, stale-while-revalidate` | Vercel ISR — serves stale, revalidates in background |
| API responses | `no-cache` | Not cached at CDN — dynamic per-request |
| Images / fonts | `max-age=31536000, immutable` | Edge-cached globally |

---

## 8. Scaling Strategy

### Phase-by-Phase Scaling

| Concern | Phase 0 (Static) | Phase 1 (Calculators) | Phase 2 (Multi-User) | Phase 3 (SaaS) |
|---------|-------------------|----------------------|---------------------|----------------|
| **Data storage** | JSON files | JSON files + FlexSearch indexes | Neon PostgreSQL + Redis | PostgreSQL + pgvector + Typesense |
| **Concurrent users** | N/A (demo) | 50-100 | 500+ | 5,000+ |
| **HTS search** | N/A | FlexSearch client-side | FlexSearch + DB full-text | Typesense dedicated |
| **Map tiles** | MapTiler free (100K req/mo) | MapTiler free | MapTiler paid | Consider Protomaps self-hosted |
| **Calculations** | Browser-side | Browser-side | Browser + server batch | Worker threads for bulk |
| **PDF generation** | Vercel serverless | Vercel serverless | Vercel serverless | Background queue (Railway) |
| **Authentication** | None | None | Custom JWT | Custom JWT + OAuth SSO |
| **Multi-tenancy** | Single user | Single user | Org-based data isolation | Full RLS + row-level policies |
| **AI** | None | None | None | Claude API + pgvector embeddings |
| **Background workers** | None | None | Railway (HTS sync, rate refresh) | Railway (AI agents, tariff monitor) |
| **Billing** | None | None | None | Stripe subscriptions |
| **Search** | None | FlexSearch + Fuse.js | FlexSearch + Fuse.js + DB | Typesense (all entities) |

### Performance Targets

| Operation | Target | Max Acceptable | Notes |
|-----------|--------|---------------|-------|
| HTS search (index loaded) | <100ms | 300ms | FlexSearch on pre-built index |
| HTS search (cold start — index load) | <500ms | 1,000ms | First load fetches ~15MB index from CDN |
| Calculator (client-side, post-load) | <50ms | 100ms | Pure TypeScript, no network round-trip |
| Map initial render | <500ms after load | 2,000ms | deck.gl WebGL initialization |
| Map interaction (pan/zoom) | 60fps | 30fps | GPU-accelerated via deck.gl |
| PDF export (1-3 pages) | <2s | 5s | @react-pdf/renderer, serverless |
| PDF export (10+ pages with charts) | <5s | 15s | Queue to background worker (Phase 2+) |
| Page LCP (Largest Contentful Paint) | <1.5s | 2.5s | Vercel Edge Network + ISR |
| API response (calculator) | <100ms | 300ms | Server-side calculation route |
| AI HTS classification (Phase 3) | <3s | 6s | Anthropic Claude API |
| Container tracking update | <30s latency | 60s | Terminal49 webhook push |

### Database Scaling — Neon PostgreSQL

| Feature | Configuration |
|---------|--------------|
| **Autoscaling** | Neon auto-scales compute 0.25-4 CU based on load |
| **Connection pooling** | Built-in pgBouncer — max 100 connections per branch |
| **Branching** | Neon DB branches for preview environments (copy-on-write, instant) |
| **Storage** | Up to 50GB on Pro plan, auto-extends |
| **Read replicas** | Available if read-heavy queries need offloading (Phase 3) |
| **pgvector** | Native support for embedding storage (CBP CROSS rulings in Phase 3) |

### Compute Scaling — Vercel Serverless

| Tier | Max Duration | Memory | Concurrent Executions |
|------|-------------|--------|-----------------------|
| Hobby | 10s | 1024 MB | 10 |
| Pro | 60s | 3008 MB | 1000 |
| Enterprise | 300s | 3008 MB | Custom |

**Scaling decision:** Move to Vercel Pro when:
- PDF reports exceed 10 seconds (complex multi-page with charts)
- Concurrent calculator API requests exceed hobby tier limits
- Terminal49 webhook volume requires sustained concurrent processing

### When to Extract Services

The monolith remains the correct architecture through Phase 2. Service extraction triggers:

| Trigger | Extraction Target | Platform |
|---------|------------------|----------|
| AI API costs exceed $500/month | AI worker service | Railway (persistent Node.js) |
| HTS data sync exceeds 60s Vercel timeout | Data sync workers | Railway (cron-based) |
| Carrier rate refresh needs hourly schedule | Rate refresh workers | Railway (cron-based) |
| Federal Register monitoring needs continuous polling | Tariff Monitor Agent | Railway (event-driven) |
| WebSocket real-time tracking needed | Real-time notification service | Railway or Fly.io |

**All other functionality stays in the Next.js monolith.** Calculators, map data, knowledge base, and CRUD operations do not benefit from service isolation.

---

## 9. Technology Decisions

### Decision Log

| # | Decision | Rationale | Alternatives Considered | Status |
|---|----------|-----------|------------------------|--------|
| 1 | **Next.js 14 App Router monolith** | Project constraint. Server components for data-heavy tables, API routes for computation, ISR for caching. Velocity over architecture purity. | Next.js Pages Router, Remix, SvelteKit | Confirmed |
| 2 | **Vercel deployment** | Project constraint. Edge Functions for middleware, serverless for API routes, ISR for HTS pages, CDN for static JSON data. | AWS Amplify, Railway, Fly.io | Confirmed |
| 3 | **Neon PostgreSQL over Supabase** | Neon DB branching pairs perfectly with Vercel preview environments. Copy-on-write branches = instant preview DBs. Better DX for PR-based workflows. | Supabase (PostgreSQL + Auth + Storage), PlanetScale (MySQL) | Confirmed |
| 4 | **Drizzle ORM over Prisma** | Type-safe SQL without Prisma's engine binary. Smaller serverless bundle. SQL-like API is more transparent for complex queries. | Prisma (larger bundle, engine binary), Kysely (less ecosystem) | Confirmed |
| 5 | **Custom JWT over NextAuth** | Full control over token lifecycle, refresh rotation, session invalidation. NextAuth's Credentials provider is intentionally limited. Custom JWT is simpler for invite-only registration. | NextAuth v5 (Credentials), Clerk (hosted auth), Lucia | Confirmed |
| 6 | **deck.gl over Mapbox GL layers** | WebGL2 GPU acceleration renders 1,000+ route polylines at 60fps. Native MapLibre GL layers cap at ~200 complex features before jank. Industry standard (Uber, Kepler.gl). | Mapbox GL layers (requires paid API), Leaflet (no WebGL, raster only) | Confirmed |
| 7 | **MapLibre over Mapbox GL** | Free open-source fork (BSD-2-Clause). Identical API. Zero per-load licensing cost. Mapbox charges $0.50-$2.00 per 1K map loads. Critical savings for data-heavy internal tool. | Mapbox GL (paid per-load), Google Maps (expensive, no maritime layers) | Confirmed |
| 8 | **decimal.js for all financial math** | IEEE 754 floating-point errors compound. `0.1 * 6.5 / 100` = `0.006499999999999999` (not `0.0065`). At 500K units, that's $500 error on a $32.5K duty bill. Non-negotiable. | Native JS arithmetic (unacceptable errors), Big.js (fewer features) | Confirmed — permanent |
| 9 | **FlexSearch over Fuse.js for HTS** | 100K HTS entries. FlexSearch: <100ms search. Fuse.js: 800ms+ on same dataset. 8-10x performance difference. Fuse.js retained for small datasets (<5K). | Fuse.js (too slow for 100K), MiniSearch (good but less tested at scale) | Confirmed |
| 10 | **@react-pdf/renderer over Puppeteer** | Pure Node.js — no Chrome binary. Works in Vercel 50MB serverless limit. Puppeteer Chrome is ~100MB + 5-10s cold starts. React component model matches team patterns. | Puppeteer (requires Chrome), jsPDF (low-level, no React), wkhtmltopdf (binary dependency) | Confirmed |
| 11 | **Upstash Redis over ElastiCache** | HTTP-based API works in Edge and serverless (no persistent TCP connections). Free tier generous. Pay-per-request pricing. | ElastiCache (requires VPC, persistent connections), Vercel KV (same underlying Upstash) | Confirmed |
| 12 | **searoute-js for offline polylines** | Avoids paid Searoutes API ($X/month) for Phase 1 demos. Eurostat marnet data is accurate for major shipping lanes. Pre-computed at build time. | Searoutes API (paid, vessel-specific), OSRM (road routing, not maritime) | Confirmed for Phase 1 |
| 13 | **Static JSON for Phase 0-1 data** | Zero hosting cost, zero API cost, instant performance. HTS schedule updates once/year. Ports data is stable. FTZ changes require regulatory process. | Database from day 1 (unnecessary complexity, hosting cost), Supabase (overkill for static data) | Confirmed |
| 14 | **Zustand over Redux/Jotai** | Lightweight (~1KB), works well with Next.js App Router. Simple API for calculator state and map state. No boilerplate. | Redux Toolkit (overkill for this scale), Jotai (atomic model, less community adoption), React Context (performance issues at scale) | Confirmed |
| 15 | **nuqs for URL state** | Calculator inputs persist in URL for shareability. Users share exact calculation via link. Built for Next.js App Router. | Manual URLSearchParams (error-prone), react-router search params (not Next.js native) | Confirmed |
| 16 | **Recharts + Tremor over Nivo** | Recharts has better Tailwind integration (Tremor is built on it). Simpler API for standard chart types. Nivo better for exotic charts (Sankey, chord) we don't need. | Nivo (better exotic charts), Victory (dated API), D3 directly (too low-level) | Confirmed |
| 17 | **Typesense over Algolia (Phase 3)** | Self-hostable, open source. No per-search pricing. Better for 100K+ document corpus with custom ranking. | Algolia (expensive per-search pricing), Meilisearch (less battle-tested at scale), Elasticsearch (operational overhead) | Planned for Phase 3 |
| 18 | **FTZ rate lock as hero feature** | Zero competitors offer FTZ incremental withdrawal modeling. April 2025 executive order (PF status for reciprocal tariffs) makes this urgent and differentiated. | Generic duty calculator (commodity, no differentiation) | Confirmed — core differentiator |
| 19 | **Resend over SendGrid for email** | Developer-first API. React Email templates. Free tier (100 emails/day) sufficient for Phase 2 invite-only platform. | SendGrid (legacy API), AWS SES (operational overhead), Postmark (expensive) | Confirmed for Phase 2 |
| 20 | **Railway for background workers** | Persistent Node.js processes for jobs exceeding Vercel's 60s timeout. Simple deployment from same repo. ~$5/month for hobby tier. | Inngest (serverless cron), AWS Lambda (cold starts), Vercel Cron (limited to 60s) | Planned for Phase 2 |

### Critical Implementation Rules

1. **Never use native `*`, `/`, `+`, `-` for monetary values.** Always `new Decimal(value)` before arithmetic.

2. **Never use Edge Runtime for calculation or PDF routes.** Always `export const runtime = 'nodejs'`.

3. **Never statically import deck.gl, MapLibre, or map components.** Always `dynamic(() => import('./Map'), { ssr: false })`.

4. **Never statically import the HTS schedule JSON.** Lazy-load the pre-built FlexSearch index on demand.

5. **Always include `org_id` in database queries.** Multi-tenant data isolation is enforced at the query layer.

6. **Always display the HTS dataset date** alongside any duty rate or tariff calculation. Users must know the data vintage.

7. **Always compute BOTH volume AND weight** for container utilization. Use the lower result. Dense cargo (frozen seafood, metals) hits weight limits at ~57% volume capacity.

8. **Pre-compute route polylines at build time.** Never call `searoute-js` on every map render — cache results in `/data/route-polylines.json`.

9. **All calculator functions must be pure.** Input object in, result object out. No API calls, no state, no DOM access. Testable with Vitest, reusable on both client and server.

10. **API routes must validate all inputs with zod** before any processing. Return structured error objects on validation failure.

---

## Appendix A: Installation Commands

```bash
# Core (project constraints)
# Next.js 14, TypeScript, Tailwind CSS — already in project

# Mapping and Visualization
npm install react-map-gl maplibre-gl deck.gl @deck.gl/core @deck.gl/layers @deck.gl/geo-layers @deck.gl/react
npm install searoute-js

# Charts and Dashboard
npm install recharts @tremor/react

# PDF Generation
npm install @react-pdf/renderer

# Calculation Libraries
npm install decimal.js currency.js convert-units date-fns

# Data Tables and Forms
npm install @tanstack/react-table react-hook-form zod @hookform/resolvers

# Search and State
npm install fuse.js flexsearch zustand nuqs

# Database and Cache (Phase 2)
npm install drizzle-orm @neondatabase/serverless @upstash/redis @upstash/ratelimit

# Authentication (Phase 2)
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken

# Email (Phase 2)
npm install resend @react-email/components

# AI (Phase 3)
npm install @anthropic-ai/sdk

# Billing (Phase 3)
npm install stripe

# Dev Dependencies
npm install -D vitest @testing-library/react @types/maplibre-gl drizzle-kit
```

---

## Appendix B: File Structure Summary

```
shipping-savior/
├── src/
│   ├── app/                          # Next.js App Router pages and API routes
│   │   ├── (public)/                 # Public-facing routes (no auth)
│   │   ├── (auth)/                   # Login/register flows
│   │   ├── (app)/                    # Auth-gated platform routes
│   │   └── api/                      # API routes (calculate, export, hts, ai, auth)
│   ├── components/
│   │   ├── calculators/              # Calculator UI components
│   │   ├── maps/                     # Map visualization components
│   │   │   └── layers/               # Individual deck.gl layer wrappers
│   │   ├── dashboard/                # Dashboard layouts, KPI cards, charts
│   │   ├── pdf/                      # @react-pdf/renderer document templates
│   │   │   └── shared/               # Reusable PDF header, footer, table
│   │   └── shared/                   # Buttons, inputs, modals, tables
│   ├── lib/
│   │   ├── calculators/              # Pure TypeScript calculation functions
│   │   │   └── __tests__/            # Vitest unit tests for all calculators
│   │   ├── data/                     # Data access layer (loads + indexes JSON)
│   │   ├── db/                       # Drizzle ORM schema + queries (Phase 2+)
│   │   ├── integrations/             # External API adapters (Phase 2+)
│   │   ├── stores/                   # Zustand state stores
│   │   ├── types/                    # TypeScript interfaces
│   │   ├── utils/                    # Formatting, conversion, normalization
│   │   └── maps/                     # Route polyline generation utilities
│   └── middleware.ts                 # Auth checks, rate limiting, redirects
├── data/                             # Static JSON datasets (Phase 0-1)
│   ├── hts-schedule.json
│   ├── hts-index.json
│   ├── duty-rates-sea.json
│   ├── ftz-locations.json
│   ├── carrier-routes.json
│   ├── ports.json
│   ├── container-specs.json
│   └── route-polylines.json
├── scripts/
│   ├── build-hts-index.ts            # Download + process HTS data → FlexSearch index
│   ├── precompute-routes.ts          # searoute-js polyline pre-computation
│   └── seed-db.ts                    # Seed PostgreSQL from JSON files (Phase 2)
├── .planning/                        # Architecture docs, PRDs, research
├── drizzle/                          # Database migrations (Phase 2+)
├── public/                           # Static assets (images, fonts)
├── next.config.ts
├── tailwind.config.ts
├── drizzle.config.ts                 # Drizzle Kit configuration (Phase 2+)
├── vitest.config.ts
└── tsconfig.json
```

---

## Appendix C: Monitoring and Observability

### Error Tracking — Sentry

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
});
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  // Phase 1: minimal
  const status = { status: 'ok', timestamp: new Date().toISOString() };

  // Phase 2: DB + Redis checks
  if (process.env.DATABASE_URL) {
    const [dbCheck, redisCheck] = await Promise.allSettled([
      db.execute(sql`SELECT 1`),
      redis.ping(),
    ]);
    const healthy = dbCheck.status === 'fulfilled' && redisCheck.status === 'fulfilled';
    return Response.json(
      { ...status, db: dbCheck.status, redis: redisCheck.status },
      { status: healthy ? 200 : 503 }
    );
  }

  return Response.json(status);
}
```

### Key Metrics

| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| Page LCP | Vercel Analytics | >2.5s |
| Calculator API p95 | Vercel Analytics | >500ms |
| PDF generation duration | Sentry Performance | >5s |
| HTS search load time | Browser Performance API | >300ms |
| Redis cache hit rate | Upstash Analytics | <80% (Phase 2) |
| Error rate | Sentry | >1% of requests |
| Serverless function cold starts | Vercel Analytics | >20% of invocations |
| Database query p95 | Neon Dashboard | >200ms |

---

*Document version: 1.0*
*Linear: AI-5420*
*Created: 2026-03-26*
*Author: AI Acrobatics Engineering*
*Next review: Phase 2 kickoff (when builder begins platform implementation)*
