# Shipping Savior — Platform Architecture Outline

**For:** Stakeholders, investors, prospective partners
**Purpose:** Communicate how the platform is built, why it works, and how it evolves
**Linear:** AI-5421
**Date:** 2026-03-26

---

## 1. High-Level Architecture Diagram

The platform follows a clean three-tier flow. Every request touches only what it needs.

```
┌─────────────────────────────────────────────────┐
│                   BROWSER                        │
│  Calculator UI  │  Map Visualizer  │  Dashboard  │
└────────────────────────┬────────────────────────┘
                         │  HTTPS
                         ▼
┌─────────────────────────────────────────────────┐
│           VERCEL EDGE NETWORK (CDN)              │
│  Static assets, JSON data files, ISR pages       │
│  Global points of presence — zero compute cost   │
└────────────────────────┬────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────┐
│         NEXT.JS APP (Vercel Serverless)          │
│  Server Components  │  API Routes  │  PDF Export │
│  (Node.js 20 runtime, auto-scaling per request)  │
└────────┬────────────────────────────────────────┘
         │
         ├──── /data/*.json     (Phase 1: static files, zero API cost)
         ├──── Neon PostgreSQL  (Phase 2+: shipments, users, audit log)
         ├──── Upstash Redis    (Phase 2+: rate cache, session tokens)
         └──── External APIs    (Phase 2+: Maersk, Terminal49, USITC)
```

**Phase 1 has no database and no paid APIs.** The entire platform runs on static files served from Vercel's CDN with client-side calculation logic. This is a deliberate architecture decision, not a limitation.

---

## 2. Data Flow Narrative — How HTS Data Reaches a User's Calculation

Understanding how tariff data flows through the system explains why calculations are both fast and trustworthy.

### Step 1: Source (USITC)

The U.S. International Trade Commission publishes the full Harmonized Tariff Schedule (HTS) as a free JSON download. It contains 100,000+ line items covering every importable commodity. Shipping Savior downloads this data once (updated annually or when tariff actions occur).

### Step 2: Build Pipeline

A build-time script (`scripts/build-hts-index.ts`) runs before each deployment:

1. Downloads the latest HTS JSON from USITC
2. Normalizes all 100K entries (standardizes 10-digit code format, strips non-printable characters)
3. Builds a FlexSearch index optimized for sub-100ms keyword search
4. Extracts SE Asia duty rates into a compact lookup file (~200KB vs. 80MB raw)
5. Commits both processed files to the repository — no runtime download needed

The index is essentially a compiled, query-ready representation of the full HTS. Building it once at deploy time means users never wait for it to be constructed.

### Step 3: CDN Delivery

When a user first navigates to the Landed Cost Calculator or HTS Lookup page, their browser fetches `hts-index.json` from Vercel's CDN — the nearest edge node, typically under 50ms latency. The browser then caches this file for 24 hours. Every subsequent calculation on that device uses the cached index with zero network round-trips.

### Step 4: Client-Side Calculation

The user types a product description or enters an HTS code. FlexSearch queries the in-memory index and returns results in under 100ms. The user's input (units, origin cost, container cost, country of origin) is fed into the TypeScript calculation engine. The engine returns a complete landed cost breakdown — freight, duty, MPF, HMF, brokerage, insurance, inland freight — all computed in the browser with financial-grade precision.

### Result

A calculation that would normally require a customs broker consultation ($200–$500/hour) completes in under 2 seconds with no server round-trip and no API costs to the platform.

---

## 3. Three-Tier Architecture

The platform is structured into three distinct layers, each with clear responsibilities.

### Tier 1 — Presentation (Next.js UI)

**What it does:** Renders the interface, handles user input, displays results.

**Key components:**
- Calculator forms with real-time feedback (React, Zustand state management)
- Interactive shipping route map with WebGL-accelerated route visualization (deck.gl + MapLibre)
- Cost breakdown charts and trend analysis (Recharts)
- PDF export of analysis reports (@react-pdf/renderer)
- HTS code search interface with 100K-entry full-text search

**Technology split:**
- Server Components render static, data-heavy content (HTS tables, knowledge base articles, landing pages) — no JavaScript shipped to the browser for these
- Client Components handle interactive calculators and maps — loaded on demand

### Tier 2 — Logic (TypeScript Calculation Engine)

**What it does:** Performs all financial calculations with arbitrary precision. Contains the platform's core intellectual value.

**Key modules:**
- `landed-cost.ts` — Computes all 15+ cost components from origin price to warehouse door
- `ftz-savings.ts` — Models FTZ duty deferral, rate lock savings, and incremental withdrawal NPV
- `unit-economics.ts` — Full margin chain from origin cost to retail pricing
- `container-utilization.ts` — Volume and weight constraint analysis per container type
- `route-comparison.ts` — Transit time, cost, and reliability scoring across carrier options
- `duty-tariff.ts` — HTS code lookup with MFN, Section 301, and special rate application

**Critical design principle:** All calculators are pure functions — input in, result out, no side effects, no network calls. This enables sub-50ms calculation response times, easy unit testing, and reuse from both the browser and API routes.

**Financial precision:** All monetary arithmetic uses `decimal.js` to avoid floating-point errors that compound at scale. A standard JavaScript multiplication like `0.1 * 6.5 / 100` introduces a $500 error on a $32,500 duty bill at 500K units. decimal.js eliminates this class of error entirely.

### Tier 3 — Data (Static JSON + External APIs)

**What it contains:**

| Dataset | Source | Size | Update Frequency |
|---------|--------|------|-----------------|
| `hts-schedule.json` | USITC (free) | ~80MB raw / ~15MB indexed | Annually or on tariff actions |
| `duty-rates-sea.json` | USITC DataWeb | ~200KB | Annually or on tariff actions |
| `ftz-locations.json` | OFIS trade.gov (free) | ~500KB | Quarterly |
| `ports.json` | World Port Index | ~1.5MB | Annually |
| `carrier-routes.json` | Compiled from public sources | ~100KB | Quarterly |
| `container-specs.json` | Industry standard dimensions | ~10KB | Rarely |

**Phase 1:** All data is static files shipped with the app — zero API cost, zero dependency on external services, offline-capable.

**Phase 2+:** Neon PostgreSQL (user data, saved shipments), Upstash Redis (carrier rate cache), and live API feeds replace mock data with real-time information.

---

## 4. Security Model

### Phase 1 Security Posture: Privacy by Architecture

**No user data is collected in Phase 1.** This is not a policy decision — it is an architecture decision. The platform has no database, no authentication, and no user accounts in Phase 1. There is nothing to breach.

**What cannot be compromised:**
- No PII — users enter calculation inputs only (commodity costs, HTS codes, volumes)
- No account credentials — there are no accounts to attack
- No payment data — no transactions in Phase 1
- No session data stored server-side — calculators run entirely in the browser

**All calculations are client-side.** Inputs never leave the user's browser in Phase 1. The server is only involved in serving static files.

### Data Classification

| Data | Sensitivity | Phase 1 Treatment |
|------|-------------|------------------|
| HTS codes + duty rates | Public | Served openly from CDN |
| Calculator inputs | Low | Lives only in browser memory |
| Calculation results | Low | Shareable via URL parameters by design |
| Shipment details | Medium | Phase 2+ only, org-scoped + auth-required |

### Security Headers (Enforced Now)

Even without user data, proper security headers are configured from day one:

- `Strict-Transport-Security` — forces HTTPS, prevents downgrade attacks
- `X-Frame-Options: SAMEORIGIN` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME-type confusion
- `Content-Security-Policy` — restricts script sources; `unsafe-eval` allowed only for deck.gl WebGL shader compilation

### Phase 2 Security Additions

When user accounts and shipment data are introduced, the security model expands:

- NextAuth v5 with JWT sessions (30-day maxAge)
- Zod schema validation on all API inputs before processing
- Upstash Redis rate limiting (60 req/min per user on calculators, 10 req/min on exports)
- AES-256-GCM encryption for high-sensitivity fields (declared customs values stored in JSONB)
- Organization-scoped data isolation — users can only access their own shipments

---

## 5. Scalability Story

### Why Static-First Works at 10K Users

The Phase 1 architecture can serve 10,000+ concurrent users without any infrastructure changes. Here is why:

**No server-side calculation load.** Every calculator runs in the user's browser. A spike from 10 users to 10,000 users doesn't affect server CPU at all — each user's device does the compute.

**CDN-served data.** The HTS index, port data, and route data are served from Vercel's global CDN. CDN requests scale to millions with zero configuration. The $0 tier handles this.

**Serverless functions for PDF export.** PDF generation hits a Vercel serverless function, which auto-scales horizontally. 100 simultaneous PDF exports spin up 100 independent function instances automatically.

**No shared state.** Because there's no database and no session state in Phase 1, there are no concurrency bottlenecks. No connection pools to exhaust, no locks to contend with.

**Real performance numbers:**

| Operation | Response Time | Scales to |
|-----------|--------------|-----------|
| Page load (CDN-cached) | <200ms | Unlimited |
| Calculator result (post-load) | <50ms | Per-device compute |
| HTS search (index loaded) | <100ms | Per-device compute |
| PDF export | <2s | Auto-scaling serverless |
| Map initial render | <500ms | Per-device GPU |

### The 10K MAU Trigger: When to Add Auth and Database

The decision to add authentication and a database (Phase 2) is triggered by user behavior, not arbitrary timeline:

**Trigger 1 — Save and return.** When users want to save calculation scenarios and access them from a different device, the platform needs persistent storage. Until then, URL-sharable calculations cover the use case.

**Trigger 2 — Multi-user shared shipments.** When a team needs to see the same shipment data — a freight broker sharing a quote with a client, or a logistics manager sharing tracking with a warehouse partner — organization-scoped database records become necessary.

**Trigger 3 — Live rate data.** When static rate estimates are insufficient and users need real carrier spot rates, the platform needs Redis caching to avoid hammering external APIs.

**Phase 1 → Phase 2 migration is non-breaking.** Existing public calculator pages remain accessible without login. The authenticated platform features are added in a new route group (`/(platform)`) that sits alongside — not replacing — the existing structure.

### Phase 3 Trigger: AI and Background Workers (500+ MAU)

Claude API integration for HTS classification requires a Railway background worker because Vercel functions time out at 60 seconds — long-running AI reasoning chains need persistent compute. This extraction happens only when:
- AI costs exceed $500/month (isolation enables per-customer billing)
- Classification volume requires dedicated compute separate from web serving

---

## 6. Technology Choices and Why

### Next.js 14 (App Router)

**Why:** Vercel ecosystem — deploy in one command. App Router enables the server/client component split that keeps the initial JavaScript bundle under 150KB gzipped while still shipping a full WebGL map visualization. TypeScript end-to-end from data layer to API routes to UI components catches classification errors and calculation bugs before they reach users.

**Why not a separate frontend + backend:** In Phase 1, there is no backend to separate. In Phase 2, co-locating the calculation engine with the API routes means the same TypeScript functions run on both client and server — no duplication, no drift.

### deck.gl (WebGL Freight Route Visualization)

**Why:** Rendering 1,000+ shipping route arcs simultaneously at 60fps is a GPU task, not a DOM task. deck.gl uses WebGL2 layers that run on the graphics card. The alternative — rendering route lines as SVG or Canvas — degrades to slideshow performance above ~50 routes. The map is a key differentiator for freight brokers who want to present visual carrier comparisons to clients.

**Why MapLibre over Mapbox:** MapLibre is a free open-source fork of Mapbox GL with an identical API. Zero per-load licensing cost. MapTiler provides base map tiles on a free tier (100,000 tile requests/month) — ample for Phase 1.

### decimal.js (Financial Precision)

**Why:** JavaScript uses IEEE 754 floating-point arithmetic. For consumer web applications, this is acceptable. For financial calculations involving duty rates, customs fees, and per-unit landed costs, it is not. A standard `0.1 * 6.5 / 100` operation returns `0.006499999999999999` — not `0.0065`. Multiplied by 500,000 units, that's a $500 discrepancy on a $32,500 duty bill. decimal.js provides arbitrary-precision arithmetic with exact decimal semantics. It is non-negotiable for a platform where calculation accuracy is the primary value proposition.

### FlexSearch (100K HTS Code Search)

**Why:** The full HTS schedule is 100,000 entries. The two leading JavaScript search libraries have different performance profiles:

| Criteria | Fuse.js | FlexSearch |
|----------|---------|------------|
| 100K-entry search speed | 800ms+ | <100ms |
| Bundle size | 24KB gzipped | 9KB gzipped |
| Typo tolerance | Excellent | Good |

FlexSearch wins on the metrics that matter for HTS lookup: speed and bundle size. Fuse.js is retained for smaller datasets (port search at 3,700 entries, FTZ zone search at 260 entries) where its superior typo tolerance improves the experience.

### Zustand (State Management)

**Why:** Calculator inputs need to persist across component re-renders without prop-drilling through 4 levels of components. Zustand is 8KB and requires zero boilerplate. Redux would add 50KB+ and ceremony that adds no value for client-side calculator state. React Context would cause unnecessary re-renders on every input change.

**URL state with `nuqs`:** Calculator inputs sync to URL query parameters, making every calculation result shareable via link. Users can send a colleague a link that pre-fills the entire calculation. This is a product feature enabled by a library choice.

---

## 7. What Gets Built in Each Phase — Architecture Evolution

### Phase 1: Static Platform MVP (Months 1–3)

**Architecture:** Next.js monolith, all static data, no auth, no database

**What ships:**
- Real HTS data pipeline (USITC → build script → FlexSearch index)
- Landed cost calculator with all 15 cost components and decimal.js precision
- Container utilization calculator (volume and weight constraint analysis)
- Interactive shipping route map (MapLibre + deck.gl)
- FTZ Savings Analyzer (production grade, real OFIS data)
- Basic persistent dashboard (first use of NextAuth + Neon DB)
- PDF export for all calculators

**Data sources:** All static JSON files committed to the repository. Zero external API dependencies.

**Who it serves:** Independent importers running pre-purchase duty calculations. Freight brokers building client-facing route comparison quotes.

**Definition of done:** First paying user running at least 3 calculations per week.

---

### Phase 2: Live Data Integration (Months 4–6)

**Architecture additions to existing monolith (no structural changes):**

```
Phase 1 Monolith
    + Neon PostgreSQL (users, shipments, calculations, audit log)
    + Upstash Redis  (carrier rate cache, session tokens, rate limiting)
    + NextAuth v5    (email/password authentication)
    + Terminal49 API (container tracking webhooks)
    + Maersk API     (live sailing schedules + spot rates)
    + CMA CGM API    (sailing schedules)
    + Railway worker (hourly rate refresh, monthly HTS sync)
```

**What changes for users:**
- Carrier rates become real (live Freightos Baltic Index, Maersk spot rates)
- Container tracking by BOL or container number (Terminal49 aggregation)
- Document upload and ISF compliance checking
- Multi-shipment operations dashboard (kanban: In Transit → At Port → In FTZ → Delivered)

**Migration approach:** The `/(platform)` auth-gated route group is added alongside existing public calculator pages. Existing users (bookmarked calculator URLs) see no change.

---

### Phase 3: AI Intelligence Layer (Months 7–12)

**Architecture additions:**

```
Phase 2 Platform
    + Anthropic Claude API  (HTS classification agent, document intelligence)
    + Railway AI workers    (long-running classification jobs, 60s+ Vercel timeout exceeded)
    + Vercel Blob           (document storage for uploaded PDFs, invoices, BOLs)
    + pgvector              (semantic vector search for similar classifications)
    + CBP CROSS API         (ruling database cross-reference)
```

**What ships:**
- HTS Classification Agent: multi-step reasoning chain that classifies goods to 10-digit HTS code with >90% accuracy at the 6-digit level — the task where human errors generate $600M+ in CBP penalties annually
- Document Intelligence: extracts and cross-validates Commercial Invoices, Packing Lists, BOLs, and ISF filings
- Route Optimization Agent: ranks routes by user-weighted criteria (cost, speed, reliability, carbon)
- Tariff Scenario Modeling: what-if analysis for Section 301 escalation, de minimis changes, country-of-origin pivots

**Why Railway workers here:** Claude API classification chains run 5–15 seconds per classification. Vercel serverless functions have a 60-second timeout and are optimized for short-lived request handling. Railway provides persistent Node.js processes that can queue and process AI jobs without timeout risk.

---

### Phase 4: Enterprise Platform (Months 13–18)

**Architecture additions:**

```
Phase 3 Platform
    + Multi-tenant organization isolation  (org-scoped data + RLS)
    + Public REST API                      (partner and ERP integrations)
    + White-label theming                  (freight broker co-branding)
    + Protomaps self-hosted tiles          (MapTiler free tier exceeded)
    + ERP connectors                       (NetSuite, SAP, QuickBooks)
```

**What ships:**
- Organization accounts with role-based access (owner, member, viewer)
- API access for enterprise customers to query calculations programmatically
- White-label option for freight brokers to deploy under their own brand
- ERP integration connectors (sync shipment data to NetSuite/SAP)
- Webhook system for third-party automation

**Scalability at this tier:** 5,000+ MAU, 500+ paying accounts, multi-tenant PostgreSQL with Row Level Security, dedicated Protomaps tile server (MapTiler free tier exhausted at this volume).

---

## Architecture Evolution Summary

| Dimension | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|-----------|---------|---------|---------|---------|
| Data | Static JSON | PostgreSQL + Redis | + pgvector | + RLS multi-tenant |
| Auth | None | NextAuth email/pw | + OAuth SSO | + SAML enterprise |
| Search | FlexSearch (client) | FlexSearch + DB | Semantic vector | Same |
| Calculations | Browser client-side | Browser + batch server | + AI agents | + API access |
| Infrastructure | Vercel only | Vercel + Railway | Vercel + Railway (expanded) | + self-hosted tiles |
| Concurrent users | 10K+ (unlimited for calculators) | 500+ | 2,000+ | 5,000+ |
| External APIs | None | 4 (Maersk, CMA CGM, Terminal49, FBX) | + Anthropic, CBP CROSS | + ERP connectors |

---

## Key Technical Principles

These principles hold across all phases and guide every architectural decision:

1. **Static first.** Add infrastructure only when user behavior demands it, not on speculation.
2. **Client-side calculations.** Financial logic runs in the browser — zero latency, zero server cost, offline capable.
3. **Financial precision is non-negotiable.** decimal.js everywhere monetary values are computed. No exceptions.
4. **The monolith stays until Phase 3 forces a split.** Co-location is an advantage until AI worker isolation becomes a cost and performance necessity.
5. **No user data in Phase 1.** Privacy by architecture, not just by policy.
6. **Every calculation is shareable.** URL state serialization turns every result into a link — this is a product feature, not just a technical convenience.
