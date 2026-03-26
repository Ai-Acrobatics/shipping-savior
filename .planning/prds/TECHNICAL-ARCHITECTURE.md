# Shipping Savior — Technical Architecture

**Linear:** AI-5409
**Parent:** Phase 2 — Architecture, Pipeline, AI Agents, GTM, Financial
**Status:** Planning
**Last Updated:** 2026-03-26

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Backend API Architecture](#3-backend-api-architecture)
4. [Database Schema](#4-database-schema)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Caching Strategy](#6-caching-strategy)
7. [Integration Layer](#7-integration-layer)
8. [AI/ML Layer](#8-aiml-layer)
9. [Infrastructure](#9-infrastructure)
10. [Security Architecture](#10-security-architecture)
11. [Deployment Pipeline](#11-deployment-pipeline)
12. [Performance Targets](#12-performance-targets)
13. [Monitoring & Observability](#13-monitoring--observability)
14. [Development Phases](#14-development-phases)
15. [Decision Log](#15-decision-log)

---

## 1. System Architecture Overview

Shipping Savior is a Next.js 14 App Router monolith deployed on Vercel. The system is built in three progressive phases: a static proposal tool (Phase 1), a live-data multi-tenant platform (Phase 2), and an AI-augmented agent layer (Phase 3). This document covers all three phases so architectural decisions made today don't create dead ends.

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BROWSER / CLIENT                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Calculator  │  │  Map / Route │  │  Dashboard   │  │  Knowledge │ │
│  │  Components  │  │  Visualizer  │  │  Charts      │  │  Base      │ │
│  │  (Zustand)   │  │  (deck.gl)   │  │  (Recharts)  │  │  (Search)  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
└─────────┼─────────────────┼─────────────────┼────────────────┼─────────┘
          │  API Routes / RSC fetch            │                │
          ▼                                   ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      NEXT.JS APP ROUTER (Vercel)                        │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Server Components (RSC)                       │   │
│  │  • Data-heavy tables (HTS lookup results, route comparison)      │   │
│  │  • Static content rendering (knowledge base, compliance docs)    │   │
│  │  • Authentication guards (verifySession() in layout.tsx)         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     API Routes (/api/*)                          │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │   │
│  │  │ /api/calculate │  │  /api/export   │  │  /api/ai         │  │   │
│  │  │  landed-cost   │  │    /pdf        │  │  /classify-hts   │  │   │
│  │  │  ftz-savings   │  │    /csv        │  │  /rate-query     │  │   │
│  │  │  container-    │  │    /bol        │  │  /optimize-route │  │   │
│  │  │  utilization   │  └────────────────┘  └──────────────────┘  │   │
│  │  └────────────────┘                                              │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │   │
│  │  │  /api/hts      │  │  /api/carriers │  │  /api/shipments  │  │   │
│  │  │    /search     │  │    /schedules  │  │    (CRUD)        │  │   │
│  │  │    /classify   │  │    /rates      │  │    /track        │  │   │
│  │  └────────────────┘  └────────────────┘  └──────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
           ┌─────────────────┼──────────────────┐
           ▼                 ▼                  ▼
┌──────────────────┐ ┌──────────────┐ ┌────────────────────┐
│  Neon PostgreSQL  │ │ Upstash Redis│ │   Static JSON /    │
│  (Phase 2+)      │ │ (Phase 2+)   │ │   /data/ directory │
│  • shipments     │ │ • carrier    │ │   (Phase 1)        │
│  • users         │ │   rates TTL  │ │   • hts-schedule   │
│  • carriers      │ │ • sessions   │ │   • duty-rates     │
│  • calculations  │ │ • API key    │ │   • ports.json     │
│  • audit_logs    │ │   cache      │ │   • routes.json    │
└──────────────────┘ └──────────────┘ └────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│                     EXTERNAL INTEGRATIONS                     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │  Carrier APIs │  │  CBP / USITC │  │  Anthropic Claude  │ │
│  │  • Maersk     │  │  • HTS REST  │  │  • HTS classify   │ │
│  │  • CMA CGM    │  │  • DataWeb   │  │  • rate summarize │ │
│  │  • Terminal49 │  │  • OFIS FTZ  │  │  • route optimize │ │
│  └──────────────┘  └──────────────┘  └────────────────────┘ │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │  AIS / Vessel │  │  GoHighLevel │                         │
│  │  • MarineTraf │  │  (Phase 3+)  │                         │
│  │  • Datalastic  │  │  CRM Sync   │                         │
│  └──────────────┘  └──────────────┘                         │
└──────────────────────────────────────────────────────────────┘
```

### Component Responsibility Summary

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| Client Components | React 18, Zustand, nuqs | Interactive calculators, maps, real-time inputs |
| Server Components | RSC (Next.js 14) | Data-heavy renders, HTS tables, knowledge base content |
| API Routes | Next.js Route Handlers | PDF generation, heavy calculations, external API proxy |
| Static Data | JSON files in `/data/` | HTS schedule, duty rates, ports, routes, FTZ list |
| Database | Neon PostgreSQL + Drizzle ORM | User data, saved shipments, calculations, audit log |
| Cache | Upstash Redis | Carrier rate TTL cache, session tokens, API rate limiting |
| AI | Anthropic Claude API | HTS classification, tariff advice, route optimization |

---

## 2. Frontend Architecture

### Next.js 14 App Router Structure

```
src/app/
├── layout.tsx                    # Root layout — fonts, analytics, auth provider
├── page.tsx                      # Landing / proposal overview
├── (auth)/
│   ├── login/page.tsx            # Authentication page
│   └── register/page.tsx         # Invite-only registration
├── (platform)/                   # Auth-gated platform routes
│   ├── layout.tsx                # Platform shell (sidebar, header, session guard)
│   ├── dashboard/
│   │   ├── page.tsx              # KPI overview, active shipments, cost summary
│   │   ├── analytics/page.tsx    # Deep analytics with time-series charts
│   │   ├── savings/page.tsx      # FTZ savings + duty optimization reports
│   │   └── tracking/page.tsx     # Container tracking board
│   ├── tools/
│   │   ├── landed-cost/page.tsx  # Landed cost calculator
│   │   ├── unit-economics/page.tsx # Unit economics breakdown
│   │   ├── ftz-analyzer/page.tsx  # FTZ savings analyzer
│   │   ├── container-calc/page.tsx # Container utilization calculator
│   │   └── route-comparison/page.tsx # Carrier/route comparison tool
│   ├── shipments/
│   │   ├── page.tsx              # Shipment list view
│   │   ├── new/page.tsx          # Create shipment
│   │   └── [id]/page.tsx         # Shipment detail + tracking
│   ├── carriers/page.tsx         # Carrier management + rate cards
│   ├── ftz/page.tsx              # FTZ zone management
│   └── knowledge-base/
│       ├── page.tsx              # Knowledge base index
│       └── [slug]/page.tsx       # SOP / guide detail
├── map/page.tsx                  # Full-page route visualization
├── hts/
│   ├── page.tsx                  # HTS code search interface
│   └── [code]/page.tsx           # HTS code detail + duty rates
└── api/
    ├── auth/[...nextauth]/route.ts
    ├── calculate/
    │   ├── landed-cost/route.ts
    │   ├── ftz-savings/route.ts
    │   ├── container-utilization/route.ts
    │   └── unit-economics/route.ts
    ├── export/
    │   ├── pdf/route.ts
    │   └── csv/route.ts
    ├── hts/
    │   ├── search/route.ts
    │   └── classify/route.ts     # AI-powered HTS code classification
    ├── carriers/
    │   ├── schedules/route.ts
    │   └── rates/route.ts
    ├── shipments/
    │   └── route.ts              # CRUD + tracking webhook handler
    └── ai/
        ├── classify-hts/route.ts
        ├── optimize-route/route.ts
        └── tariff-summary/route.ts
```

### Component Hierarchy

```
App Shell (layout.tsx)
├── AuthProvider (NextAuth SessionProvider)
├── ThemeProvider
└── AppLayout
    ├── Sidebar (navigation, user role badge)
    ├── Header (breadcrumb, notifications, user menu)
    └── PageContent
        ├── CalculatorPages
        │   ├── LandedCostCalculator
        │   │   ├── InputForm (react-hook-form + zod)
        │   │   ├── ResultsPanel (animated reveal)
        │   │   ├── BreakdownChart (Recharts BarChart)
        │   │   └── ExportActions (PDF / CSV / Share URL)
        │   ├── FTZAnalyzer
        │   │   ├── ScenarioBuilder
        │   │   ├── SavingsChart (area chart, duty locked vs. market)
        │   │   └── WithdrawalScheduler (incremental pallet planner)
        │   └── RouteComparison
        │       ├── RouteInputPanel
        │       ├── CarrierOptionCards (3 tiers)
        │       └── TransitTimeChart
        ├── MapPages
        │   └── ShippingRouteMap
        │       ├── MapLibreBase
        │       ├── ArcLayer (routes, colored by transit time)
        │       ├── ScatterplotLayer (ports, sized by throughput)
        │       └── PortDetailPanel (click-to-expand overlay)
        └── DashboardPages
            ├── KPICards (Tremor metric tiles)
            ├── ShipmentBoard (kanban: sourcing → transit → customs → delivered)
            ├── CostTrendChart (Recharts LineChart)
            └── DutyExposureGauge
```

### State Management

**Zustand stores** handle client-side ephemeral state. No global state for server data — server components fetch directly.

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

// lib/stores/ui.ts
interface UIStore {
  sidebarCollapsed: boolean;
  activeMapLayers: string[];
  selectedPort: Port | null;
  comparisonMode: boolean;
}
```

**URL state with nuqs** persists calculator inputs for shareability:

```typescript
// Calculator inputs sync to URL: ?units=500000&origin=VN&hts=6109100060
const [units, setUnits] = useQueryState('units', parseAsInteger.withDefault(500000));
const [originCountry, setOriginCountry] = useQueryState('origin', parseAsString.withDefault('VN'));
```

### Real-Time Updates (Phase 2+)

Container tracking updates use **Server-Sent Events** (SSE) via a dedicated API route. SSE is preferred over WebSockets for Vercel Edge compatibility:

```typescript
// app/api/shipments/[id]/stream/route.ts
export async function GET(req: Request) {
  const stream = new TransformStream();
  // Poll Terminal49 webhook cache every 30s, push deltas to client
  return new Response(stream.readable, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' }
  });
}
```

---

## 3. Backend API Architecture

### API Route Structure

All API routes follow a consistent pattern: validate input with Zod, execute business logic, return structured JSON. Rate limiting is applied at the middleware level.

```
/api/
├── calculate/               # Pure calculation endpoints
│   ├── landed-cost          POST  → LandedCostResult
│   ├── ftz-savings          POST  → FTZSavingsResult
│   ├── container-util       POST  → ContainerUtilizationResult
│   └── unit-economics       POST  → UnitEconomicsResult
│
├── export/                  # Document generation endpoints
│   ├── pdf                  POST  → PDF stream (BinaryData)
│   └── csv                  POST  → CSV string
│
├── hts/                     # HTS code endpoints
│   ├── search               GET   → HTSSearchResult[]
│   └── classify             POST  → HTSClassification (AI-powered)
│
├── carriers/                # Carrier data endpoints (Phase 2+)
│   ├── schedules            GET   → Schedule[] (cached Redis TTL 1hr)
│   └── rates                GET   → RateCard[] (cached Redis TTL 1hr)
│
├── shipments/               # Shipment CRUD (Phase 2+)
│   ├── /                    GET (list), POST (create)
│   ├── /[id]                GET (detail), PUT (update), DELETE
│   ├── /[id]/track          GET → TrackingEvent[]
│   └── /[id]/stream         GET → SSE stream
│
├── ai/                      # AI agent endpoints (Phase 3+)
│   ├── classify-hts         POST  → HTS recommendation
│   ├── optimize-route       POST  → RouteOptimization
│   └── tariff-summary       POST  → TariffSummary
│
└── auth/
    └── [...nextauth]        NextAuth handlers
```

### Middleware Stack

```typescript
// middleware.ts — runs on every request
export const config = {
  matcher: ['/api/:path*', '/(platform)/:path*']
};

// Execution order:
// 1. Authentication check (NextAuth session)
// 2. Role-based access (broker, importer, admin)
// 3. Rate limiting (Upstash Redis sliding window)
// 4. Request logging (structured JSON to Vercel logs)
// 5. CORS headers (API routes only)
```

### Rate Limiting

**Upstash Redis sliding window algorithm** — chosen for serverless compatibility (no persistent connection needed):

| Endpoint Category | Limit | Window | Applies To |
|------------------|-------|--------|-----------|
| `/api/calculate/*` | 60 requests | 1 minute | Per user |
| `/api/export/*` | 10 requests | 1 minute | Per user |
| `/api/hts/classify` (AI) | 20 requests | 1 minute | Per user |
| `/api/ai/*` | 30 requests | 1 hour | Per user |
| `/api/auth/*` | 10 requests | 1 minute | Per IP |
| All API routes | 1000 requests | 1 hour | Per API key |

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const calculatorLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  analytics: true,
});
```

### Request/Response Patterns

All API routes return a consistent envelope:

```typescript
// Successful response
{
  "success": true,
  "data": { /* result */ },
  "meta": {
    "calculatedAt": "2026-03-26T12:00:00Z",
    "dataFreshness": "2026-03-26T06:30:00Z", // when source data was last updated
    "version": "1.2"
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "HTS code format invalid — expected XXXX.XX.XXXX",
    "field": "htsCode"
  }
}
```

---

## 4. Database Schema

Phase 1 uses static JSON files. Phase 2 introduces PostgreSQL (Neon) with Drizzle ORM.

### Schema Overview

```sql
-- Core tables (Phase 2+)
users
organizations
shipments
shipment_events
carriers
carrier_rates
calculations
calculation_scenarios
hts_codes               -- cached/extended from USITC
duty_rates
ftz_zones
ports
api_keys
audit_logs
```

### Complete Table Definitions

```sql
-- ─────────────────────────────────────────────
-- ORGANIZATIONS
-- Multi-tenant root. One org = one broker/importer company.
-- ─────────────────────────────────────────────
CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,           -- URL-safe identifier
  plan            TEXT NOT NULL DEFAULT 'free',  -- 'free' | 'pro' | 'enterprise'
  plan_expires_at TIMESTAMPTZ,
  settings        JSONB DEFAULT '{}',             -- org-level feature flags
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email           TEXT UNIQUE NOT NULL,
  email_verified  BOOLEAN DEFAULT FALSE,
  password_hash   TEXT,                           -- null if OAuth-only
  name            TEXT,
  role            TEXT NOT NULL DEFAULT 'broker', -- 'broker' | 'importer' | 'admin'
  avatar_url      TEXT,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_role CHECK (role IN ('broker', 'importer', 'admin'))
);

CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_email ON users(email);

-- ─────────────────────────────────────────────
-- CARRIERS
-- Ocean carriers + freight forwarders.
-- ─────────────────────────────────────────────
CREATE TABLE carriers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scac_code       TEXT UNIQUE,                    -- Standard Carrier Alpha Code (e.g., 'MAEU')
  name            TEXT NOT NULL,                  -- "Maersk Line"
  short_name      TEXT,                           -- "Maersk"
  api_provider    TEXT,                           -- 'maersk' | 'cmacgm' | 'terminal49' | null
  api_enabled     BOOLEAN DEFAULT FALSE,
  logo_url        TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- CARRIER RATES
-- Rate cards per lane. Refreshed from carrier APIs or manual entry.
-- ─────────────────────────────────────────────
CREATE TABLE carrier_rates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id      UUID NOT NULL REFERENCES carriers(id),
  origin_port     TEXT NOT NULL,                  -- UN/LOCODE (e.g., 'VNSGN')
  dest_port       TEXT NOT NULL,                  -- UN/LOCODE (e.g., 'USLAX')
  container_type  TEXT NOT NULL,                  -- '20GP' | '40GP' | '40HC' | '40RF' (reefer)
  rate_usd        DECIMAL(12,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  transit_days    INTEGER,
  transshipment_port TEXT,                        -- null = direct service
  valid_from      DATE NOT NULL,
  valid_to        DATE,
  tier            TEXT DEFAULT 'standard',        -- 'backhaul' | 'standard' | 'express'
  source          TEXT DEFAULT 'manual',          -- 'api' | 'manual' | 'scraped'
  fetched_at      TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_carrier_rates_lane ON carrier_rates(origin_port, dest_port, container_type);
CREATE INDEX idx_carrier_rates_valid ON carrier_rates(valid_from, valid_to);

-- ─────────────────────────────────────────────
-- SHIPMENTS
-- Core operational entity. One shipment = one container movement.
-- ─────────────────────────────────────────────
CREATE TABLE shipments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by      UUID NOT NULL REFERENCES users(id),
  reference_no    TEXT NOT NULL,                  -- Internal reference (e.g., 'SS-2026-001')
  bol_number      TEXT,                           -- Bill of Lading number
  carrier_id      UUID REFERENCES carriers(id),
  container_no    TEXT,                           -- Container identifier
  container_type  TEXT,                           -- '20GP' | '40GP' | '40HC' | '40RF'
  origin_port     TEXT NOT NULL,                  -- UN/LOCODE
  dest_port       TEXT NOT NULL,                  -- UN/LOCODE
  origin_country  TEXT NOT NULL,                  -- ISO 3166-1 alpha-2 (e.g., 'VN')
  product_desc    TEXT,
  hts_code        TEXT,                           -- Harmonized Tariff Schedule code
  declared_value_usd DECIMAL(14,2),
  cargo_type      TEXT DEFAULT 'general',         -- 'general' | 'cold_chain' | 'hazmat'
  status          TEXT NOT NULL DEFAULT 'planned',
  ftz_entry       BOOLEAN DEFAULT FALSE,
  ftz_zone_id     UUID REFERENCES ftz_zones(id),
  eta             DATE,
  etd             DATE,
  ata             DATE,                           -- Actual time of arrival
  atd             DATE,                           -- Actual time of departure
  notes           TEXT,
  metadata        JSONB DEFAULT '{}',             -- Flexible: vessel name, voyage no., ISF filing
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (
    status IN ('planned', 'booked', 'in_transit', 'at_port', 'in_customs',
               'in_ftz', 'delivered', 'cancelled')
  )
);

CREATE INDEX idx_shipments_org_id ON shipments(org_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_bol ON shipments(bol_number);
CREATE INDEX idx_shipments_container ON shipments(container_no);

-- ─────────────────────────────────────────────
-- SHIPMENT EVENTS
-- Immutable event log for each status change / tracking update.
-- ─────────────────────────────────────────────
CREATE TABLE shipment_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id     UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,                  -- 'departed' | 'arrived' | 'customs_cleared' etc.
  location        TEXT,                           -- Port or facility name
  location_code   TEXT,                           -- UN/LOCODE
  description     TEXT,
  occurred_at     TIMESTAMPTZ NOT NULL,
  source          TEXT DEFAULT 'manual',          -- 'terminal49' | 'manual' | 'ais'
  raw_payload     JSONB,                          -- Webhook payload from tracking provider
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shipment_events_shipment_id ON shipment_events(shipment_id);
CREATE INDEX idx_shipment_events_occurred_at ON shipment_events(occurred_at DESC);

-- ─────────────────────────────────────────────
-- HTS CODES
-- Local mirror of USITC HTS schedule, enriched with platform data.
-- ─────────────────────────────────────────────
CREATE TABLE hts_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hts_code        TEXT UNIQUE NOT NULL,           -- '6109.10.00.60' (10-digit US)
  description     TEXT NOT NULL,
  parent_code     TEXT,                           -- 4-digit chapter / heading
  chapter         INTEGER,                        -- 2-digit chapter number
  unit_of_quantity TEXT,                          -- 'DOZ' | 'KG' | 'NO' etc.
  general_rate    TEXT,                           -- 'Free' | '12%' | '27 cents/kg'
  special_rate    TEXT,                           -- GSP, FTA rates
  column2_rate    TEXT,                           -- Non-MFN rate
  effective_date  DATE,
  source_version  TEXT,                           -- HTS edition year
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hts_codes_code ON hts_codes(hts_code);
CREATE INDEX idx_hts_codes_chapter ON hts_codes(chapter);
-- Full-text search index on description
CREATE INDEX idx_hts_codes_description ON hts_codes USING gin(to_tsvector('english', description));

-- ─────────────────────────────────────────────
-- DUTY RATES
-- Country-specific duty rates by HTS code.
-- ─────────────────────────────────────────────
CREATE TABLE duty_rates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hts_code        TEXT NOT NULL REFERENCES hts_codes(hts_code),
  origin_country  TEXT NOT NULL,                  -- ISO 3166-1 alpha-2
  rate_type       TEXT NOT NULL,                  -- 'mfn' | 'section301' | 'gsp' | 'fta'
  rate_percent    DECIMAL(6,4),                   -- e.g., 12.5000 = 12.5%
  rate_specific   TEXT,                           -- e.g., '0.27 cents/kg + 11%'
  effective_date  DATE NOT NULL,
  expiry_date     DATE,
  notes           TEXT,
  source          TEXT,                           -- 'usitc' | 'manual' | 'federal_register'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hts_code, origin_country, rate_type, effective_date)
);

CREATE INDEX idx_duty_rates_lookup ON duty_rates(hts_code, origin_country, rate_type);

-- ─────────────────────────────────────────────
-- FTZ ZONES
-- Foreign Trade Zone database (sourced from OFIS trade.gov)
-- ─────────────────────────────────────────────
CREATE TABLE ftz_zones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_number     INTEGER UNIQUE NOT NULL,        -- Official FTZ number (e.g., 202)
  name            TEXT NOT NULL,
  grantee         TEXT,                           -- Zone operator/grantee
  city            TEXT,
  state           TEXT,
  zip_codes       TEXT[],
  latitude        DECIMAL(9,6),
  longitude       DECIMAL(9,6),
  customs_port    TEXT,                           -- Associated CBP port of entry
  is_active       BOOLEAN DEFAULT TRUE,
  subzones        JSONB DEFAULT '[]',             -- Array of subzone details
  source_url      TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ftz_zones_state ON ftz_zones(state);

-- ─────────────────────────────────────────────
-- PORTS
-- Port database (UN/LOCODE + World Port Index)
-- ─────────────────────────────────────────────
CREATE TABLE ports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locode          TEXT UNIQUE NOT NULL,           -- UN/LOCODE (e.g., 'VNSGN')
  name            TEXT NOT NULL,
  country         TEXT NOT NULL,                  -- ISO 3166-1 alpha-2
  region          TEXT,                           -- State / province
  latitude        DECIMAL(9,6),
  longitude       DECIMAL(9,6),
  type            TEXT[],                         -- ['port', 'rail', 'road', 'airport']
  is_major_hub    BOOLEAN DEFAULT FALSE,
  annual_teu      INTEGER,                        -- Annual TEU throughput (for sizing markers)
  timezone        TEXT
);

CREATE INDEX idx_ports_country ON ports(country);
CREATE INDEX idx_ports_locode ON ports(locode);

-- ─────────────────────────────────────────────
-- CALCULATIONS
-- Saved calculator outputs for history and reporting.
-- ─────────────────────────────────────────────
CREATE TABLE calculations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),
  type            TEXT NOT NULL,                  -- 'landed_cost' | 'ftz_savings' | 'unit_economics' | 'container_util'
  name            TEXT,                           -- User-given scenario name
  input           JSONB NOT NULL,                 -- Calculator input params
  result          JSONB NOT NULL,                 -- Full calculation output
  shipment_id     UUID REFERENCES shipments(id),  -- Linked shipment (if saved from shipment context)
  is_pinned       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_calculations_org_id ON calculations(org_id);
CREATE INDEX idx_calculations_type ON calculations(type);
CREATE INDEX idx_calculations_user_id ON calculations(user_id);

-- ─────────────────────────────────────────────
-- API KEYS
-- For programmatic access and webhook authentication.
-- ─────────────────────────────────────────────
CREATE TABLE api_keys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by      UUID NOT NULL REFERENCES users(id),
  key_hash        TEXT UNIQUE NOT NULL,           -- bcrypt hash of the actual key
  key_prefix      TEXT NOT NULL,                  -- First 8 chars for display (e.g., 'ss_live_')
  name            TEXT NOT NULL,                  -- Human label (e.g., 'Production Integration')
  scopes          TEXT[] NOT NULL DEFAULT '{}',   -- ['read:shipments', 'write:calculations']
  last_used_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_org_id ON api_keys(org_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

-- ─────────────────────────────────────────────
-- AUDIT LOGS
-- Immutable event log for compliance and debugging.
-- ─────────────────────────────────────────────
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id),
  user_id         UUID REFERENCES users(id),
  actor_type      TEXT NOT NULL DEFAULT 'user',   -- 'user' | 'api_key' | 'system'
  actor_id        TEXT,                           -- user UUID or api_key prefix
  action          TEXT NOT NULL,                  -- 'shipment.created' | 'calculation.exported' etc.
  resource_type   TEXT,                           -- 'shipment' | 'calculation' | 'api_key'
  resource_id     TEXT,
  ip_address      INET,
  user_agent      TEXT,
  metadata        JSONB DEFAULT '{}',             -- Additional context
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
-- Partition by month for large audit log tables (Phase 3+)
```

### Drizzle ORM Setup

```typescript
// lib/db/schema.ts — Drizzle table definitions mirror the SQL above
// lib/db/index.ts  — Pool connection via Neon serverless driver
// lib/db/queries/  — Per-entity query functions (no raw SQL in routes)

// drizzle.config.ts
export default {
  schema: './lib/db/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: { connectionString: process.env.DATABASE_URL! },
};
```

---

## 5. Authentication & Authorization

### NextAuth v5 Configuration

```typescript
// auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const user = await getUserByEmail(credentials.email);
        if (!user || !await bcrypt.compare(credentials.password, user.password_hash)) {
          return null;
        }
        return { id: user.id, email: user.email, role: user.role, orgId: user.org_id };
      }
    }),
    // Phase 2+: Google OAuth for SSO
    // Google({ clientId, clientSecret })
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30-day JWT
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.role = user.role; token.orgId = user.orgId; }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      session.user.orgId = token.orgId;
      return session;
    }
  }
});
```

### Role-Based Access Control (RBAC)

| Role | Description | Access |
|------|-------------|--------|
| `broker` | Freight broker staff | Own org shipments, all calculators, rate comparison |
| `importer` | Importer/buyer client | Read-only shipment tracking, landed cost calculator |
| `admin` | Platform admin / founder | All org data, API key management, audit logs |

```typescript
// lib/auth/permissions.ts
export const permissions = {
  broker: [
    'shipments:read', 'shipments:write',
    'calculations:read', 'calculations:write',
    'carriers:read',
    'exports:create',
  ],
  importer: [
    'shipments:read',
    'calculations:read',
  ],
  admin: ['*'], // all permissions
} as const;

// Middleware guard pattern (used in API routes)
export function requireRole(role: UserRole) {
  return async (req: Request) => {
    const session = await auth();
    if (!session || !hasPermission(session.user.role, role)) {
      return new Response('Forbidden', { status: 403 });
    }
  };
}
```

### Defense-in-Depth Auth Strategy

1. **Middleware layer**: Session check on all `/api/*` and `/(platform)/*` routes
2. **Layout layer**: `verifySession()` called in platform layout — forces re-check even if middleware cached
3. **API route layer**: Individual route-level role checks before database operations
4. **Database layer**: Row-level security via `org_id` filtering on all queries (not PostgreSQL RLS in Phase 2, but explicit WHERE clauses in Drizzle queries)

---

## 6. Caching Strategy

### Multi-Layer Cache

```
Request
  │
  ▼
┌──────────────────────────────────────┐
│  Layer 1: CDN / Vercel Edge Cache    │  Static assets, ISR pages (long TTL)
│  TTL: 24hr for static data pages     │
└──────────────────┬───────────────────┘
                   │ Cache miss
                   ▼
┌──────────────────────────────────────┐
│  Layer 2: Next.js fetch() Cache      │  fetch() with revalidate options
│  TTL: Configurable per fetch call    │  (ISR for tariff data: revalidate=3600)
└──────────────────┬───────────────────┘
                   │ Cache miss
                   ▼
┌──────────────────────────────────────┐
│  Layer 3: Upstash Redis              │  Carrier rates, API responses
│  TTL: 1hr for carrier rates          │  Session tokens, rate limit counters
│       15min for carrier schedules    │
└──────────────────┬───────────────────┘
                   │ Cache miss
                   ▼
┌──────────────────────────────────────┐
│  Source: Database or External API    │
└──────────────────────────────────────┘
```

### Cache TTL by Data Type

| Data Type | Storage | TTL | Rationale |
|-----------|---------|-----|-----------|
| HTS code lookup | Static JSON / Redis | Indefinite / build time | HTS schedule updates once/year |
| Duty rates | Static JSON / Redis | 24 hours | Tariff changes require Federal Register notice |
| Carrier rates | Redis | 1 hour | Spot rates fluctuate, but not minute-to-minute |
| Carrier schedules | Redis | 15 minutes | Vessel schedules update several times daily |
| Port data | Static JSON | Indefinite | Ports rarely change |
| FTZ zones | Redis | 7 days | FTZ zone changes require regulatory process |
| Container tracking | Redis | 30 seconds | Terminal49 webhooks push updates; this is refresh floor |
| AI classifications | Redis | 24 hours | Same HTS question = same answer (cost optimization) |

### ISR (Incremental Static Regeneration) Strategy

Pages that display tariff data and HTS lookups use ISR with appropriate revalidation periods:

```typescript
// app/hts/[code]/page.tsx
export const revalidate = 86400; // 24 hours — HTS data is stable

// app/carriers/page.tsx
export const revalidate = 900; // 15 minutes — carrier rates change frequently

// app/map/page.tsx
export const revalidate = 3600; // 1 hour — static route data
```

---

## 7. Integration Layer

### Carrier API Integrations (Phase 2+)

All external API calls are centralized in `/lib/integrations/`. This isolates third-party dependencies and makes mocking straightforward for Phase 1.

```typescript
// lib/integrations/maersk.ts
export class MaerskClient {
  private baseUrl = 'https://api.maersk.com';
  private apiKey: string;

  async getSchedules(origin: string, destination: string): Promise<Schedule[]> {
    // Cache check first (Redis TTL 15min)
    const cacheKey = `maersk:schedules:${origin}:${destination}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const res = await fetch(`${this.baseUrl}/schedules/...`, {
      headers: { 'Consumer-Key': this.apiKey }
    });
    const data = await res.json();
    await redis.setex(cacheKey, 900, JSON.stringify(data));
    return data;
  }
}

// lib/integrations/terminal49.ts
export class Terminal49Client {
  // Webhook handler for push-based container updates
  async handleWebhook(payload: Terminal49Webhook): Promise<void> {
    const event = mapWebhookToShipmentEvent(payload);
    await db.insert(shipmentEvents).values(event);
    // Invalidate container tracking Redis cache
    await redis.del(`tracking:${payload.container_number}`);
    // Emit SSE event to connected clients
    await eventBus.emit(`shipment:${event.shipmentId}:update`, event);
  }
}
```

### CBP / USITC Data Pipeline

```
USITC HTS Data Source
  │
  │ npm run data:sync-hts (monthly cron)
  ▼
/scripts/sync-hts.ts
  │  1. Downloads full HTS schedule JSON from hts.usitc.gov
  │  2. Normalizes to internal schema
  │  3. Upserts into hts_codes table (Phase 2+)
  │  4. Rebuilds FlexSearch index file → /data/hts-index.json
  │  5. Triggers ISR revalidation for HTS pages
  ▼
/data/hts-schedule.json        (Phase 1: bundled static)
/data/hts-index.json           (FlexSearch pre-built index)
hts_codes table                (Phase 2+: database-backed)
```

### FTZ Data Integration

```typescript
// OFIS FTZ database — queried quarterly, stored locally
// lib/integrations/ofis.ts
export async function syncFTZZones(): Promise<void> {
  // Scrape OFIS trade.gov for zone updates
  // Upsert into ftz_zones table
  // Rebuild /data/ftz-locations.json for static use
}
```

### Integration Resilience Patterns

- **Circuit breaker**: If a carrier API fails 5 times in 1 minute, fall back to cached data with a staleness warning in the UI
- **Retry with exponential backoff**: 3 retries, 1s / 2s / 4s delays, jitter
- **Graceful degradation**: All Phase 2 API integrations have a static JSON fallback so the UI is never broken by an API outage

---

## 8. AI/ML Layer

### Claude API Integration

Anthropic Claude 3.5 Sonnet powers three AI capabilities:

| Feature | Prompt Strategy | Expected Latency | Cache Strategy |
|---------|----------------|-----------------|----------------|
| HTS Code Classification | Structured output with HTS context window (top 50 candidates from FlexSearch) | 2-4 seconds | Redis 24hr per input hash |
| Tariff Summary Generator | Summarize duty rate table + FTZ implications for a specific product | 3-5 seconds | Redis 24hr per HTS code |
| Route Optimization | Given origin/destination/timeline/budget, recommend optimal routing | 2-4 seconds | Redis 1hr per input hash |

```typescript
// lib/ai/hts-classifier.ts
export async function classifyHTS(productDescription: string): Promise<HTSClassification> {
  // 1. Get top 50 HTS candidates via FlexSearch
  const candidates = await searchHTS(productDescription, { limit: 50 });

  // 2. Cache check (Redis — same product description = same answer)
  const inputHash = sha256(productDescription.toLowerCase().trim());
  const cached = await redis.get(`ai:hts:${inputHash}`);
  if (cached) return JSON.parse(cached);

  // 3. Claude API call with structured output
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: HTS_CLASSIFIER_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Product: ${productDescription}\n\nTop HTS candidates:\n${JSON.stringify(candidates, null, 2)}`
    }],
  });

  const result = parseHTSClassificationResponse(response.content[0].text);
  await redis.setex(`ai:hts:${inputHash}`, 86400, JSON.stringify(result));
  return result;
}
```

### AI Agent Architecture (Phase 3)

Phase 3 introduces autonomous agents for ongoing tariff monitoring and route optimization. Agents communicate via a lightweight message queue.

```
┌─────────────────────────────────────────────────┐
│                  Agent Orchestrator              │
│  (triggered by cron, user action, or webhook)   │
└──────────────┬──────────────────────────────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
┌──────────┐ ┌─────────┐ ┌──────────────┐
│ Tariff   │ │ Route   │ │  Shipment    │
│ Monitor  │ │ Agent   │ │  Alert Agent │
│ Agent    │ │         │ │              │
│          │ │         │ │              │
│ Watches  │ │Optimizes│ │ Monitors     │
│ Section  │ │routes   │ │ container    │
│ 301 /    │ │ given   │ │ tracking,    │
│ Federal  │ │ current │ │ sends ETA    │
│ Register │ │ rates   │ │ alerts       │
└──────────┘ └─────────┘ └──────────────┘
    │              │              │
    └──────────────┴──────────────┘
                   │
                   ▼
        ┌──────────────────┐
        │  Notification    │
        │  Dispatcher      │
        │  (email / SMS /  │
        │   dashboard)     │
        └──────────────────┘
```

### Vector Search (Phase 3)

For the knowledge base and HTS classification, a vector search index enables semantic search beyond keyword matching:

- **Provider**: pgvector (PostgreSQL extension on Neon) — no separate vector DB needed
- **Embeddings**: text-embedding-3-small (OpenAI) or Claude-based embeddings
- **Use cases**: "Find all knowledge base articles about cold chain compliance", "Find HTS codes similar to this product"

---

## 9. Infrastructure

### Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION INFRASTRUCTURE                │
│                                                             │
│  ┌─────────────────┐  ┌───────────────┐  ┌──────────────┐ │
│  │  Vercel (CDN +  │  │ Neon Postgres │  │ Upstash Redis│ │
│  │  Serverless)    │  │ (Serverless)  │  │ (Serverless) │ │
│  │                 │  │               │  │              │ │
│  │ • Next.js app   │  │ • Main DB     │  │ • Rate limit │ │
│  │ • Edge CDN      │  │ • Branching   │  │ • API cache  │ │
│  │ • ISR cache     │  │   for preview │  │ • Sessions   │ │
│  │ • Serverless fn │  │   envs        │  │              │ │
│  └────────┬────────┘  └───────────────┘  └──────────────┘ │
│           │                                                 │
│  ┌────────┴─────────────────────────────────────────────┐  │
│  │           Background Workers (Phase 2+)               │  │
│  │                                                       │  │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  │  │
│  │  │  Railway   │  │  Railway    │  │  Vercel Cron │  │  │
│  │  │  Worker 1  │  │  Worker 2   │  │  Jobs        │  │  │
│  │  │            │  │             │  │              │  │  │
│  │  │ HTS data   │  │ Carrier rate│  │ Daily HTS    │  │  │
│  │  │ sync cron  │  │ refresh     │  │ sync         │  │  │
│  │  │ (monthly)  │  │ (hourly)    │  │ (6:30am UTC) │  │  │
│  │  └────────────┘  └─────────────┘  └──────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Hosting Decision Matrix

| Service | Provider | Rationale |
|---------|----------|-----------|
| Frontend + API Routes | Vercel | Project constraint. Edge network, ISR, preview environments per branch. |
| PostgreSQL | Neon | Serverless Postgres — scales to zero, per-query billing, DB branching for preview envs matches Vercel preview workflow perfectly. |
| Redis / Queue | Upstash | Serverless Redis — HTTP API works in Vercel Edge Runtime. No connection pooling headaches. |
| Background workers | Railway (Phase 2+) | Persistent Node.js workers for HTS sync, rate refresh cron. Simpler than Vercel Cron for long-running tasks. |
| Static data files | Vercel / CDN | JSON files bundled with the app, served from CDN edge. Zero latency, no database round-trip. |

### Environment Configuration

```
Environment Variables:
────────────────────────────────────────────────
# Database
DATABASE_URL=postgresql://...neon.tech/...

# Auth
NEXTAUTH_SECRET=<32-char random>
NEXTAUTH_URL=https://shippingsavior.com

# Redis
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=<token>

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Carrier APIs (Phase 2+)
MAERSK_API_KEY=<key>
MAERSK_API_URL=https://api.maersk.com
CMACGM_API_KEY=<key>
TERMINAL49_API_KEY=<key>
TERMINAL49_WEBHOOK_SECRET=<secret>

# Monitoring
SENTRY_DSN=<dsn>
SENTRY_AUTH_TOKEN=<token>

# Internal
INTERNAL_API_SECRET=<secret>  # For worker → API auth
```

### Neon Database Branching Strategy

```
main branch (production DB) ──────────────────────── Production
  │
  ├── dev branch (shared dev DB) ─────────────────── Development / Staging
  │
  └── preview/feature-branch (ephemeral) ──────────── Vercel Preview URLs
        • Created automatically by Neon GitHub integration
        • Mirrors main schema + subset of data
        • Deleted when PR is merged
```

---

## 10. Security Architecture

### API Key Management

- API keys are generated as `ss_live_<32-char-random>` (production) or `ss_test_<32-char-random>` (test)
- Only the bcrypt hash is stored in the database — the plaintext key is shown once at creation
- Keys are scoped to specific permissions (`read:shipments`, `write:calculations`, etc.)
- Key rotation: users can create new keys and revoke old ones without downtime

```typescript
// lib/auth/api-keys.ts
export async function generateApiKey(orgId: string, name: string, scopes: string[]) {
  const rawKey = `ss_live_${crypto.randomBytes(32).toString('hex')}`;
  const keyHash = await bcrypt.hash(rawKey, 12);
  const keyPrefix = rawKey.substring(0, 12); // 'ss_live_XXXX'

  await db.insert(apiKeys).values({
    orgId, name, scopes,
    key_hash: keyHash,
    key_prefix: keyPrefix,
  });

  return rawKey; // Returned once, never stored in plaintext
}
```

### Data Encryption

| Data Type | Encryption Method | Notes |
|-----------|------------------|-------|
| Passwords | bcrypt (cost factor 12) | User account passwords |
| API keys | bcrypt hash (cost factor 12) | Only hash stored |
| Database at rest | Neon managed encryption (AES-256) | Platform-level, automatic |
| HTTPS/TLS | TLS 1.3 via Vercel | All traffic in transit |
| Sensitive JSONB fields | Application-level AES-256-GCM | For shipment customs values (Phase 2+) |

### Audit Logging Strategy

All write operations generate audit log entries. This is non-optional for a trade compliance platform:

```typescript
// lib/audit.ts
export async function auditLog(params: {
  orgId: string;
  userId?: string;
  actorType: 'user' | 'api_key' | 'system';
  actorId: string;
  action: string;        // e.g., 'shipment.created'
  resourceType: string;  // e.g., 'shipment'
  resourceId: string;
  metadata?: Record<string, unknown>;
  req?: Request;
}) {
  await db.insert(auditLogs).values({
    ...params,
    ipAddress: params.req ? getClientIp(params.req) : null,
    userAgent: params.req?.headers.get('user-agent'),
  });
}
```

### Security Headers

```typescript
// next.config.ts — Security headers applied globally
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval for deck.gl WebGL
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://tiles.maptiler.com",
      "connect-src 'self' https://api.anthropic.com https://api.maersk.com",
      "worker-src blob:", // WebGL workers
    ].join('; ')
  }
];
```

---

## 11. Deployment Pipeline

### CI/CD Flow

```
Developer pushes to feature branch
  │
  ▼
GitHub Actions — CI
  │  1. Install dependencies (npm ci)
  │  2. TypeScript typecheck (tsc --noEmit)
  │  3. Lint (eslint)
  │  4. Unit tests (vitest run)
  │  5. Build check (next build)
  │
  ▼ All checks pass
Vercel — Preview Deployment
  │  • Unique URL: https://shipping-savior-git-feature-xxx.vercel.app
  │  • Neon preview DB branch created automatically
  │  • Comment posted on PR with preview URL
  │
  ▼ PR reviewed + approved
Merge to main
  │
  ▼
Vercel — Production Deployment
  │  • npx vercel build --prod && npx vercel deploy --prebuilt --prod --yes
  │  • Neon production DB migration runs (drizzle-kit migrate)
  │  • ISR cache invalidated for affected pages
  │  • Sentry release created
  │
  ▼ Deploy complete
Post-deploy verification
   • Smoke test: hit /api/health endpoint
   • Check Sentry for new errors (5-minute window)
   • Vercel Analytics alert if Core Web Vitals degrade
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
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_CI }}
          NEXTAUTH_SECRET: test-secret
```

### Database Migration Strategy

```bash
# During development
npx drizzle-kit generate    # Generate migration SQL from schema changes
npx drizzle-kit migrate     # Apply to dev DB

# In production (via CI/CD post-deploy step)
npx drizzle-kit migrate --config drizzle.production.config.ts

# Emergency rollback
npx drizzle-kit migrate --rollback  # Reverts last migration
```

---

## 12. Performance Targets

### Response Time Targets

| Operation | Target | Acceptable Max | Measurement |
|-----------|--------|---------------|-------------|
| Calculator (client-side) | <50ms | 100ms | Browser performance API |
| Calculator (server API) | <200ms | 500ms | Vercel Analytics p95 |
| HTS search (local index) | <100ms | 300ms | Browser performance API |
| HTS AI classification | <3s | 6s | Server-side timing |
| PDF export | <2s | 5s | Vercel function duration |
| Page load (LCP) | <1.5s | 2.5s | Core Web Vitals |
| Route visualization (map) | <500ms | 1s | Browser performance API |
| Carrier rate lookup (cached) | <50ms | 100ms | Redis GET latency |
| Carrier rate lookup (uncached) | <1s | 2s | External API p95 |

### Data Freshness Targets

| Data Source | Freshness Target | Enforcement |
|-------------|-----------------|-------------|
| HTS rates | Within 24 hours of USITC update | Daily cron sync |
| Carrier rates | Within 1 hour | Redis TTL + hourly worker |
| Carrier schedules | Within 15 minutes | Redis TTL |
| Container tracking | Within 5 minutes | Terminal49 webhooks |
| FTZ zone data | Within 7 days | Weekly cron |
| Port data | Within 30 days | Monthly cron |

### Uptime Target

- **Production uptime**: 99.9% (8.7 hours downtime/year maximum)
- **Achieved via**: Vercel multi-region deployment, Neon auto-failover, Upstash multi-zone replication
- **SLA monitoring**: UptimeRobot (1-minute checks) + Vercel Analytics

### Bundle Size Targets

| Asset | Target | Strategy |
|-------|--------|----------|
| Initial JS bundle | <150KB gzipped | Tree shaking, dynamic imports for deck.gl |
| Map bundle (deck.gl + MapLibre) | Lazy loaded | Dynamic import on map page navigation |
| HTS index (FlexSearch) | <5MB | Lazy loaded, compressed |
| PDF generator | Lazy loaded | Dynamic import on export action |

---

## 13. Monitoring & Observability

### Error Tracking — Sentry

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV,
  tracesSampleRate: 0.1,  // 10% of transactions in production
  replaysSessionSampleRate: 0.05,
  // Tag all errors with org + user context for fast debugging
  beforeSend(event) {
    event.tags = { ...event.tags, org: getCurrentOrgId() };
    return event;
  }
});
```

### Performance Monitoring

| Tool | What it monitors | Alert threshold |
|------|-----------------|-----------------|
| Vercel Analytics | Core Web Vitals (LCP, FID, CLS), p75/p95 latency | LCP > 2.5s: page alert |
| Upstash Analytics | Redis hit rate, latency | Hit rate < 80%: cache tuning needed |
| Neon Metrics | Query duration, connection count, storage | Query p95 > 500ms: index review |
| Sentry Performance | API route durations, database query times | Error rate > 1%: PagerDuty |

### Cost Tracking

External API costs are tracked per organization to enable billing and identify optimization opportunities:

```typescript
// lib/monitoring/cost-tracker.ts
export async function trackAPIUsage(params: {
  orgId: string;
  provider: 'anthropic' | 'maersk' | 'terminal49';
  operation: string;
  tokensUsed?: number;
  estimatedCostUsd: number;
}) {
  await db.insert(apiUsageLogs).values(params);
  // Alert if org exceeds $50/month AI spend
  await checkCostThreshold(params.orgId);
}
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = await Promise.allSettled([
    db.execute(sql`SELECT 1`),      // Database
    redis.ping(),                    // Redis
  ]);

  const healthy = checks.every(c => c.status === 'fulfilled');
  return Response.json({
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: {
      database: checks[0].status === 'fulfilled' ? 'ok' : 'error',
      redis: checks[1].status === 'fulfilled' ? 'ok' : 'error',
    }
  }, { status: healthy ? 200 : 503 });
}
```

### Structured Logging

All API routes emit structured JSON logs for Vercel Log Drains → Datadog / Logtail (Phase 2+):

```typescript
// lib/logger.ts
export const logger = {
  info: (msg: string, ctx?: Record<string, unknown>) =>
    console.log(JSON.stringify({ level: 'info', msg, ...ctx, ts: Date.now() })),
  error: (msg: string, err?: Error, ctx?: Record<string, unknown>) =>
    console.error(JSON.stringify({ level: 'error', msg, error: err?.message, stack: err?.stack, ...ctx, ts: Date.now() })),
};
```

---

## 14. Development Phases

### Phase 1 — Static Proposal Tool (Current)

**Goal**: Ship a polished proposal/demo tool with researched real-world data. No live API integrations. No authentication. No database.

**Architecture**: Next.js 14 App Router monolith → Vercel. All data from JSON files in `/data/`.

```
✅ Static JSON datasets (HTS, ports, routes, FTZ, duty rates)
✅ Client-side calculators (landed cost, FTZ, unit economics, container)
✅ Interactive map (MapLibre + deck.gl + searoute-js)
✅ Knowledge base (MDX/static content)
✅ PDF/CSV export via API routes
✅ URL-shareable calculator state (nuqs)
❌ No authentication
❌ No database
❌ No live carrier APIs
❌ No AI integration
```

**Data flow**: Static JSON → Server Components or Zustand (client) → UI. No network calls to external services.

---

### Phase 2 — Live Data Multi-Tenant Platform

**Goal**: Real carrier rates, container tracking, user accounts, saved shipments. Build for production use by the founder's brokerage.

**New additions**:
- NextAuth authentication (email/password → OAuth in Phase 2.5)
- Neon PostgreSQL database with full schema above
- Upstash Redis caching layer
- Maersk + CMA CGM carrier schedule APIs
- Terminal49 container tracking (webhooks)
- API key management for broker clients
- Shipment CRUD + tracking dashboard
- PDF bill of lading generator
- Background workers (Railway) for data sync crons

**Migration path from Phase 1**:
1. Add NextAuth + database — no breaking changes to existing calculator pages
2. Add `/(platform)` route group with auth guards
3. Migrate static JSON data to database tables (run once import script)
4. Wire up carrier APIs with Redis cache — calculators start using live rates
5. Enable Terminal49 webhooks for container tracking

---

### Phase 3 — AI Agent Layer

**Goal**: Autonomous agents that monitor tariffs, alert on regulatory changes, optimize routes, and classify HTS codes.

**New additions**:
- Anthropic Claude integration for HTS classification + tariff summarization
- Tariff Monitor Agent (watches Federal Register for Section 301 changes)
- Route Optimizer Agent (recommends best routing given current rates + transit times)
- Shipment Alert Agent (container delay detection, customs exception alerts)
- pgvector for semantic knowledge base search
- GoHighLevel CRM sync for brokerage clients

**Agent trigger model**:
- **Cron-triggered**: Tariff Monitor runs daily at 6am UTC
- **Webhook-triggered**: Shipment Alert Agent fires on every Terminal49 update
- **User-triggered**: HTS Classifier fires on-demand from the calculator UI
- **Escalation**: Agents write findings to database; notification dispatcher emails/texts the broker

---

## 15. Decision Log

| Decision | Rationale | Revisit When |
|----------|-----------|-------------|
| Next.js monolith (no microservices) | Velocity. Phase 1 is a proposal tool. Complexity kills speed. | Phase 3 if AI worker costs justify isolation |
| Static JSON for Phase 1 data | Zero hosting cost, zero API cost, instant performance. HTS schedule updates once/year. | Phase 2 when live carrier rates are needed |
| Neon PostgreSQL over Supabase | Neon's DB branching pairs perfectly with Vercel preview environments. Schema migrations map to branches. | If Supabase auth features become relevant |
| Upstash Redis (serverless) over Elasticache | No persistent connections = works in Vercel serverless/Edge functions. HTTP API. Free tier is generous. | If we need Pub/Sub, Streams, or heavy compute |
| Railway for background workers | Vercel serverless functions time out at 60s. Data sync crons need persistent processes. Railway is cheapest option with good DX. | Could move to Render or self-hosted if costs increase |
| NextAuth v5 with Credentials first | Fastest path to auth. Google OAuth in Phase 2.5 — avoid OAuth complexity until user accounts are validated. | Phase 2.5 when broker clients want SSO |
| Terminal49 over Vizion for tracking | Terminal49 free tier (100 containers) is sufficient for Phase 2 launch. Webhook-based (push, not poll). | If tracking volume exceeds 100 containers or data quality issues arise |
| Anthropic Claude over OpenAI for AI | Agency standard. Claude 3.5 Sonnet has excellent structured output for HTS classification tasks. | If OpenAI releases superior trade/compliance models |
| API Design: REST over GraphQL | Simpler to implement, cache, and rate-limit. GraphQL adds complexity not justified at this scale. | If client apps need flexible querying (mobile app, third-party) |
| deck.gl over Mapbox GL layers | deck.gl has superior performance for 1000+ route polylines (WebGL2, GPU-accelerated). Mapbox layers would require paid API. | If we need Mapbox-specific features (geocoding, directions) |

---

*Document version: 1.0*
*Author: AI-5409 Technical Architecture Task*
*Next review: Phase 2 kickoff*
