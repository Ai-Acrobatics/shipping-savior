# Technology Validation Report: Shipping/Logistics Platform

**Date:** 2026-03-26
**Methodology:** Live npm registry checks, API endpoint testing, web research, bundle analysis
**Overall Verdict:** Stack is VIABLE with specific caveats noted below

---

## Table of Contents

1. [Library Validations](#1-library-validations)
2. [API Validations](#2-api-validations)
3. [Architecture Considerations](#3-architecture-considerations)
4. [Risk Matrix](#4-risk-matrix)
5. [Final Recommendations](#5-final-recommendations)

---

## 1. Library Validations

### 1.1 searoute-js -- Maritime Route Calculation (Offline)

| Attribute | Finding |
|-----------|---------|
| **npm Version** | 0.1.0 |
| **Last Published** | ~6 years ago (circa 2020) |
| **Weekly Downloads** | ~306/week (very low) |
| **GitHub** | [johnx25bd/searoute](https://github.com/johnx25bd/searoute) |
| **License** | MPL-2.0 |
| **Dependencies** | Turf.js libraries + geojson-path-finder |
| **TypeScript** | No native types |

**Key Findings:**
- The package is essentially **abandoned** -- no updates in 6 years, zero npm dependents
- Based on Eurostat's marnet maritime network dataset (Oak Ridge National Labs Global Shipping Lane Network from 2000)
- Returns GeoJSON LineString features with distance calculations (nautical miles, km, etc.)
- The underlying maritime network data is 25+ years old -- shipping lanes have changed
- Explicitly states it was "developed for visualization, NOT for mariners to route ships"
- SE Asia to US port pairs: Should work for major routes (Singapore Strait, Malacca Strait, Pacific crossing) since these are well-established lanes, but accuracy for secondary ports is unverified

**TypeScript Alternative -- searoute-ts:**

| Attribute | Finding |
|-----------|---------|
| **npm Version** | Latest (TypeScript rewrite) |
| **Weekly Downloads** | ~62/week (even lower) |
| **GitHub** | [mayurrawte/searoute-ts](https://github.com/mayurrawte/searoute-ts) |
| **Last Published** | ~1 year ago |

Also low activity. Same underlying Eurostat marnet dataset.

**Searoutes Commercial API Alternative:**

| Attribute | Finding |
|-----------|---------|
| **Provider** | [searoutes.com](https://searoutes.com/routing-api/) |
| **Pricing** | Starting from EUR 400/month for 5,000 calls/month |
| **Free Trial** | 7-day trial, 100 calls |
| **Features** | Real-time ECA zones, canal transits, vessel-specific routing, CO2 estimates, up to 20 waypoints, UN/LOCODE support |

**VERDICT: YELLOW -- Use with Caution**

searoute-js is acceptable for Phase 1 visualization purposes only. The maritime network data is outdated and the library is unmaintained. For anything beyond basic route visualization, budget for the Searoutes commercial API in Phase 2. Consider forking searoute-js or searoute-ts and updating the marnet dataset from the current Eurostat source if cost is a primary concern.

---

### 1.2 deck.gl -- WebGL Map Visualization

| Attribute | Finding |
|-----------|---------|
| **npm Version** | **9.2.11** (confirmed current) |
| **Last Published** | ~3 weeks ago (actively maintained) |
| **Weekly Downloads** | High (major project by vis.gl/OpenJS Foundation) |
| **GitHub** | [visgl/deck.gl](https://github.com/visgl/deck.gl) |
| **License** | MIT |

**ArcLayer Compatibility:**
- Import: `import {ArcLayer} from '@deck.gl/layers'`
- Renders raised arcs joining source/target coordinates -- perfect for origin-destination shipping routes
- Supports color interpolation, width, height ratio, and great circle arcs
- Works natively with react-map-gl via `MapboxOverlay` or `DeckGL` component

**TripsLayer Compatibility:**
- Import: `import {TripsLayer} from '@deck.gl/geo-layers'` (moved to geo-layers in v9)
- Renders animated paths representing vehicle/vessel trips
- Requires `@deck.gl/core`, `@deck.gl/layers`, and `@deck.gl/geo-layers`

**react-map-gl Integration:**
- react-map-gl is the **recommended** companion library for deck.gl + React
- v9.0 added MapLibre v5 globe view support for all three integration modes (interleaved, overlaid, reverse-controlled)
- react-map-gl/maplibre supports maplibre-gl >= 4.x
- v9.1 added React widget components via `useWidget` hook

**Bundle Size:**
- deck.gl uses a modular architecture with tree-shaking support
- Sub-packages: `@deck.gl/core` (GPU rendering), `@deck.gl/layers` (primitive layers), `@deck.gl/geo-layers` (geo layers), `@deck.gl/aggregation-layers` (heatmaps), `@deck.gl/mesh-layers` (3D)
- Only imported modules are bundled -- shipping-specific setup (ArcLayer + TripsLayer + GeoJsonLayer) will be significantly smaller than the full bundle
- Maintainers actively track bundle size impact of each release

**Performance with 100+ Routes:**
- deck.gl is optimized to handle "close to 100 layers" without performance issues
- Important distinction: 100 routes rendered as data within a single ArcLayer is trivially fast (thousands of arcs per layer). 100 separate Layer instances is different but still manageable
- For this use case (100-500 shipping routes as arcs in 1-2 layers), performance will be excellent
- WebGL2-powered rendering handles millions of data points
- Used in production by Uber, Kepler.gl, and other large-scale geospatial applications

**VERDICT: GREEN -- Strong Choice**

deck.gl v9.2 is actively maintained, battle-tested at scale, and has first-class MapLibre + react-map-gl integration. The modular architecture minimizes bundle impact. No concerns for this use case.

---

### 1.3 MapLibre GL JS -- Free Map Renderer

| Attribute | Finding |
|-----------|---------|
| **npm Version** | **5.21.1** (confirmed, published within hours of this research) |
| **Last Published** | Actively maintained (multiple releases per month) |
| **GitHub** | [maplibre/maplibre-gl-js](https://github.com/maplibre/maplibre-gl-js) |
| **License** | BSD-3-Clause |

**Free Tile Provider Options:**

| Provider | Free Tier | Commercial Use | Limits |
|----------|-----------|---------------|--------|
| **MapTiler** | Free plan available | Yes (with attribution) | Monthly session + request caps; maps **pause for the rest of the month** when limits hit (no overage charges on free plan) |
| **Protomaps** | Free up to **1M requests/month** (soft cap) | Requires GitHub Sponsorship for commercial use | PMTiles format -- single static file on CDN, no server needed. Hosted on Cloudflare CDN |
| **Stadia Maps** | Free for non-commercial use under **200K tiles/month** | Commercial plans start at $20/month | Credit-based metering system |
| **MapLibre Demo Tiles** | Free (demo only) | Not for production | Limited styles, intended for development |
| **Self-hosted PMTiles** | Free (hosting costs only) | Yes | Host on S3/R2/GCS. One company reported **90% cost reduction** vs Google Maps by using Protomaps + Cloudflare |

**Mapbox GL JS Pricing Comparison:**

| Metric | MapLibre GL JS | Mapbox GL JS |
|--------|---------------|--------------|
| **Library Cost** | Free (BSD-3) | Free (proprietary license) |
| **Tile Cost** | Free with above providers | 50K free loads/month, then tiered pricing ($0.50-$2.00 per 1K loads) |
| **Vendor Lock-in** | None | High -- requires Mapbox tiles |
| **Geocoding** | Not included (use Nominatim/Photon free) | Included in Mapbox ecosystem |
| **Directions** | Not included | Included in Mapbox ecosystem |

**VERDICT: GREEN -- Excellent Choice**

MapLibre GL JS v5 is extremely actively maintained and completely free. Combined with Protomaps (1M free requests/month) or MapTiler free tier, this provides a zero-cost mapping solution that is functionally equivalent to Mapbox GL JS for rendering purposes. For a shipping dashboard with internal/professional use, the free tiers should be more than sufficient.

---

### 1.4 @react-pdf/renderer -- PDF Generation

| Attribute | Finding |
|-----------|---------|
| **npm Version** | **4.3.2** |
| **Last Published** | ~3 months ago |
| **Weekly Downloads** | ~1.4M/week |
| **GitHub** | [diegomura/react-pdf](https://github.com/diegomura/react-pdf) |
| **License** | MIT |
| **npm Dependents** | 486 packages |

**Vercel Serverless Compatibility -- CRITICAL ISSUES FOUND:**

| Concern | Details |
|---------|---------|
| **Bundle Size** | Users report hitting Vercel's **50MB compressed / 250MB uncompressed** serverless function size limit. react-pdf v7+ has caused build errors on Vercel due to this. |
| **Memory Leaks** | **Confirmed bug**: Every PDF render increases memory usage that never returns to baseline. Issue [#2848](https://github.com/diegomura/react-pdf/issues/2848) and [#718](https://github.com/diegomura/react-pdf/issues/718) document this. Generating many PDFs in sequence causes OOM errors. |
| **Yoga Layout Errors** | Fast sequential PDF generation triggers EventEmitter memory leak warnings from yoga-layout |
| **Vercel Timeout** | Hobby plan: 10s timeout (300s with Fluid Compute). Pro plan: 60s timeout (800s with Fluid Compute). Complex PDFs with tables may exceed Hobby limits. |
| **Vercel Memory** | Hobby plan: 1024MB max. Pro plan: configurable up to 3008MB |

**Complex Table Support:**
- Supports `<View>`, `<Text>`, and flexbox-based table layouts
- No built-in `<Table>` component -- tables must be constructed from Views/Text with manual styling
- Community packages like `@david.kucsai/react-pdf-table` add table abstractions
- Complex multi-page tables with dynamic row heights are challenging but possible

**Mitigation Strategies for Vercel:**
1. Deploy PDF generation as a **separate microservice** (e.g., on Railway, Render, or a dedicated Lambda)
2. Use **dynamic imports** to code-split the PDF renderer from main bundles
3. Process PDFs **asynchronously** -- generate in background, return download URL
4. Consider Vercel **Pro plan** for 60s timeout and higher memory
5. For very complex PDFs, consider **Puppeteer on a dedicated service** as fallback

**VERDICT: YELLOW -- Viable with Mitigations Required**

The library itself is mature and well-maintained with 1.4M weekly downloads. However, the Vercel serverless environment creates real constraints around memory leaks, bundle size, and timeouts. For a shipping platform generating Bills of Lading, commercial invoices, and landed cost reports, plan for either: (a) Vercel Pro plan with careful resource management, or (b) a dedicated PDF microservice.

---

### 1.5 decimal.js -- Financial Math Precision

| Attribute | Finding |
|-----------|---------|
| **npm Version** | **10.6.0** |
| **Last Published** | ~8 months ago |
| **npm Dependents** | 3,732 packages |
| **GitHub** | [MikeMcl/decimal.js](https://github.com/MikeMcl/decimal.js/) |
| **License** | MIT |
| **Notable Users** | Prisma ORM (uses decimal.js for its Decimal datatype) |

**Performance for Batch Calculations:**
- decimal.js provides **arbitrary-precision** arithmetic -- precision is unlimited by default but configurable
- Performance degrades exponentially with increasing digit precision (not relevant for standard financial calculations which need 2-4 decimal places)
- For standard duty rate / landed cost calculations at 1000+ items:
  - Setting `Decimal.precision = 20` (more than enough for financial math) keeps operations fast
  - Each operation is ~10-100x slower than native Number math, but at 1000 items this means microseconds vs nanoseconds -- negligible in a request cycle
  - The bottleneck will be I/O (database, API calls), never decimal.js math
- Used in production by Prisma for database decimal handling across millions of applications

**Alternatives Considered:**

| Library | Size | Precision | Use Case |
|---------|------|-----------|----------|
| **decimal.js** | ~32KB min | Arbitrary | General-purpose, most features |
| **decimal.js-light** | ~15KB min | Arbitrary | Subset of decimal.js, smaller |
| **big.js** | ~6KB min | Arbitrary | Simpler API, fewer methods |
| **bignumber.js** | ~20KB min | Arbitrary | Same author as decimal.js |
| **currency.js** | ~1KB min | 2 decimal | Currency-specific, fastest |

**VERDICT: GREEN -- Excellent Choice**

decimal.js is the industry standard for JavaScript financial math. Performance at 1000+ batch calculations is not a concern -- the overhead per operation is negligible relative to I/O costs. Pair with currency.js for formatting/display.

---

### 1.6 FlexSearch vs Fuse.js -- HTS Code Search (100K+ Entries)

#### FlexSearch

| Attribute | Finding |
|-----------|---------|
| **npm Version** | **0.8.212** |
| **Weekly Downloads** | ~567K-751K/week |
| **GitHub** | [nextapps-de/flexsearch](https://github.com/nextapps-de/flexsearch) |
| **License** | Apache-2.0 |
| **Bundle Size (full)** | ~2.33MB (unpacked). Modular -- production builds use specific entry points that are much smaller |
| **Approach** | Pre-built index with contextual search scoring algorithm |

#### Fuse.js

| Attribute | Finding |
|-----------|---------|
| **npm Version** | **7.1.0** |
| **Last Published** | ~1 year ago |
| **Weekly Downloads** | High (3,252 dependents) |
| **GitHub** | [krisk/Fuse](https://github.com/krisk/Fuse) |
| **License** | Apache-2.0 |
| **Bundle Size** | ~12KB minified |
| **Approach** | Runtime fuzzy matching using Bitap algorithm |

#### MiniSearch (Third Alternative)

| Attribute | Finding |
|-----------|---------|
| **npm Version** | Latest stable |
| **GitHub** | [lucaong/minisearch](https://github.com/lucaong/minisearch) |
| **Bundle Size** | Tiny (no external dependencies) |
| **Approach** | In-memory full-text search with prefix search in microseconds |

#### Head-to-Head Comparison for 100K+ HTS Entries

| Criteria | FlexSearch | Fuse.js | MiniSearch |
|----------|-----------|---------|-----------|
| **Index Build Time** | Fast (pre-built index) | No index (scans at query time) | Fast (pre-built index) |
| **Search Speed at 100K** | Excellent -- designed for this scale | **POOR** -- degrades significantly on large datasets | Good -- microsecond prefix searches |
| **Fuzzy Matching** | Basic fuzzy support | **Best** -- sophisticated fuzzy with configurable threshold | Good -- fuzzy + prefix + boosting |
| **Memory Usage** | Higher (maintains index) | Lower (no index) | Moderate |
| **Bundle Size** | Larger (modular helps) | ~12KB (smallest) | Tiny |
| **Relevance Ranking** | Good (contextual scoring) | Good (weighted fields) | **Best** (BM25-based scoring) |
| **TypeScript** | Community types (@types/flexsearch) | Built-in types | Built-in types |

**Critical Finding for HTS Search:**

Fuse.js performs a linear scan on every query -- at 100K+ HTS entries, this means scanning all entries for every keystroke. Multiple sources confirm Fuse.js "can be slow on huge datasets" and "doesn't work well with large datasets." This is a dealbreaker for real-time search-as-you-type on 100K+ entries.

FlexSearch pre-builds an index and uses a contextual search algorithm that is specifically optimized for large datasets. It is consistently benchmarked as the fastest JavaScript search library.

MiniSearch is a strong middle ground -- smaller bundle than FlexSearch, better relevance ranking than both, handles 100K entries well, and has excellent TypeScript support.

**VERDICT: FlexSearch for SPEED, MiniSearch for RELEVANCE, NOT Fuse.js**

For HTS code search specifically:
- **FlexSearch** if raw search speed is the priority and you want the fastest possible keystroke response
- **MiniSearch** if relevance ranking and TypeScript DX are priorities (recommended)
- **Fuse.js is NOT recommended** for 100K+ entries -- it will be noticeably slow for real-time search

Recommendation: Start with **MiniSearch** for HTS lookup. It offers the best balance of speed, relevance, bundle size, and developer experience. If search speed is insufficient, switch to FlexSearch. Test with the actual HTS dataset (download from USITC) during development.

---

## 2. API Validations

### 2.1 USITC HTS REST API

| Attribute | Finding |
|-----------|---------|
| **Base URL** | `https://hts.usitc.gov/reststop/` |
| **Authentication** | **None required** -- fully open |
| **Rate Limits** | **No documented rate limits** (no rate limit headers in response) |
| **Response Format** | JSON (UTF-8) |
| **Status** | **CONFIRMED WORKING** -- live tested on 2026-03-26 |

**Endpoint Tested:**

```
GET https://hts.usitc.gov/reststop/search?keyword={term}
```

**Live Test Results:**

| Query | Results Returned | Notes |
|-------|-----------------|-------|
| `keyword=copper` | Multiple results | Returned HTS codes, descriptions, duty rates, special program rates |
| `keyword=electronics` | 74 results | Comprehensive coverage |
| `keyword=shipping+container` | **1,665 results** | Contradicts documentation claiming "up to 100 results" -- actually returns all matches |

**Response Schema (confirmed via live test):**

```json
{
  "htsno": "2603.00.00",
  "statisticalSuffix": "",
  "description": "Copper ores and concentrates",
  "indent": "0",
  "footnotes": [{ "columns": ["units"], "marker": "1", "value": "...", "type": "endnote" }],
  "units": ["Cu kg"],
  "general": "1.7c/kg on lead content",
  "other": "8.8c/kg on copper content + 3.3c/kg on lead content + 3.7c/kg on zinc content",
  "special": "Free (A,AU,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)",
  "selector": "htsno"
}
```

**Key fields for the platform:** `htsno`, `description`, `general` (MFN duty rate), `special` (FTA/GSP rates), `other` (Column 2 rate), `units`

**Other endpoints tested:**
- `getChapter`, `getSection`, `getHeading` -- returned 404 errors (may be deprecated or renamed)
- `/export` endpoint returns an HTML page (browser-based export tool, not a REST endpoint)

**Bulk Data Downloads:**
- Full HTS schedule available at `hts.usitc.gov/download` in JSON, CSV, XLS, PDF formats
- 2026 HTS Basic Edition released December 31, 2025
- Multiple revisions per year (2026 Revision 4 current as of March 2026)
- **Recommendation:** Download the full JSON dataset and index locally rather than relying solely on the search API

**VERDICT: GREEN -- Confirmed Working, Excellent Data Quality**

The USITC HTS REST API is free, requires no authentication, has no apparent rate limits, and returns rich JSON data including duty rates and special program eligibility. The bulk download option makes it ideal for building a local search index. This is the best possible data source for HTS lookup.

---

### 2.2 Maersk Developer Portal

| Attribute | Finding |
|-----------|---------|
| **Portal URL** | [developer.maersk.com](https://developer.maersk.com/api-catalogue) |
| **Cost** | **Free** (currently; Maersk reserves right to charge in future) |
| **Registration** | Self-service at developer.maersk.com |
| **API Format** | REST (JSON) |

**Available APIs (confirmed via portal catalogue):**

| API | Data Provided |
|-----|---------------|
| **Track and Trace Plus** | Real-time shipment tracking by booking/container/BL number |
| **Point-to-Point Schedules** | Vessel schedules between port pairs with transit times, transshipments, vessel names |
| **Ocean Booking v2 (DCSA)** | Programmatic booking (DCSA standard) |
| **Routes & Schedules** | Detailed route info for priced offers -- segments, vessels, ETAs |

**Registration Process:**
- Self-service portal -- create account, request API access
- Public APIs: API key delivered within **2-3 business days**
- Private APIs (booking, etc.): Token delivered within **1 week** (requires additional verification)

**Key Consideration:** Maersk's FAQ explicitly states they "reserve the right to implement a payment plan in the future." For Phase 1, this free access is valuable for real schedule data, but don't build a business-critical dependency on it remaining free.

**VERDICT: GREEN -- Free, Well-Documented, Register Early**

The Maersk Developer Portal is self-service, free, and provides the exact data needed (schedules, tracking, routes). Register now to start the 2-3 day API key process. The DCSA-standard APIs suggest good interoperability with other carriers adopting the same standard.

---

### 2.3 CMA CGM API Portal

| Attribute | Finding |
|-----------|---------|
| **Portal URL** | [api-portal.cma-cgm.com](https://api-portal.cma-cgm.com/) |
| **Cost** | **Free trial** -- 1 month of production access |
| **Registration** | Portal-based, requires CMA CGM account |
| **API Format** | REST |

**Available APIs:**
- Schedule search
- Container tracking
- Booking
- Free referential APIs (port codes, vessel info, etc.)

**Registration Process:**
- Account creation on the API portal
- **Public APIs:** Access + API key within **2-3 days**
- **Private APIs:** Setup + token within **1 week**
- Technical documentation available once connected
- Free trial limited to **1 month** of production access

**Key Difference from Maersk:** CMA CGM's free access is explicitly a **1-month trial**, not ongoing free access. After the trial, pricing is unclear -- likely requires a commercial relationship or booking volume.

**VERDICT: YELLOW -- Trial Only, Plan for Alternatives**

CMA CGM's API portal exists and is accessible, but the 1-month free trial is limiting. For Phase 1, use the trial to validate data quality and format, then transition to either: (a) static schedule data compiled from their public website, or (b) a commercial relationship if the business justifies it.

---

### 2.4 Terminal49

| Attribute | Finding |
|-----------|---------|
| **URL** | [terminal49.com](https://terminal49.com/) |
| **API Format** | REST + Webhooks (push-based) |
| **Free Options** | Two tiers available |

**Free Tier Details:**

| Tier | Containers | Features | Cost |
|------|-----------|----------|------|
| **Developer Key** | Up to **100 containers** | Shipment manifest data, container milestones | Free (then minimum 100 pc/mo commitment) |
| **Terminal49 Free** | Up to **50 shipments/month** | Core tracking, multi-carrier/terminal consolidation | Free (freemium) |

**Paid Pricing:** Starting at **$350/month**

**Data Coverage:**
- All US terminals + major steamship lines
- Push-based updates via webhooks (event-driven)
- Clean JSON API

**VERDICT: GREEN -- Good Free Tier for Phase 1**

100 free containers or 50 free shipments/month is more than sufficient for development and early Phase 1. The webhook-based architecture is efficient for real-time tracking dashboards. Plan for the $350/month jump when scaling beyond free tier limits.

---

### 2.5 OFIS FTZ Database

| Attribute | Finding |
|-----------|---------|
| **URL** | [ofis.trade.gov](https://ofis.trade.gov/) |
| **Operator** | International Trade Administration (ITA), Dept. of Commerce |
| **Data** | 260+ FTZ projects, ~400 subzones |

**Data Availability Assessment:**

| Format | Available? | Details |
|--------|-----------|---------|
| **Web UI** | Yes | DataTables-based zone listing at ofis.trade.gov/Zones |
| **REST API** | Partial | data.gov catalog references an API; the FTZ Board manufacturing approvals database has API access |
| **JSON Download** | Possible | data.gov catalog has metadata record on Commerce Data Hub indicating JSON availability |
| **CSV Download** | Not confirmed | No direct CSV export found |
| **Scraping Feasibility** | HIGH | Site uses jQuery DataTables (1.10.20) with server-side data. Zone detail pages have structured HTML (54KB per page) with consistent layout |

**Scraping Architecture (if needed):**
- Zone list page loads data via DataTables AJAX -- intercept the data source call
- Zone detail pages at `ofis.trade.gov/Zones/Details/{id}` follow consistent structure
- IDs appear sequential (tested ID 1, 103, 127, 177 -- all returned valid data)
- No visible anti-scraping measures (no CAPTCHA, no aggressive rate limiting detected)
- Government website -- generally permissive on data reuse

**data.gov Dataset:**
- Listed at [catalog.data.gov/dataset/online-ftz-information-system-ofis](https://catalog.data.gov/dataset/online-ftz-information-system-ofis)
- Also available via Commerce Data Hub: [data.commerce.gov/foreign-trade-zones-zone-and-site-information](https://data.commerce.gov/foreign-trade-zones-zone-and-site-information)
- JSON metadata confirmed available -- investigate the data.gov API endpoint for machine-readable access before resorting to scraping

**VERDICT: YELLOW -- Data Available, Extraction Required**

The FTZ data is public and accessible, but there is no single clean "download all" endpoint. The recommended approach:
1. First, check the data.gov/Commerce Data Hub API for structured JSON access
2. If that fails, scrape the OFIS DataTables AJAX endpoint for the zone listing
3. Then scrape individual zone detail pages for full records
4. Store as a static JSON dataset (~260 records, small and manageable)

---

## 3. Architecture Considerations

### 3.1 Next.js 14 App Router + Large Static JSON (100K+ HTS Entries)

**The Problem:** The full HTS schedule contains 100K+ line items. Loading all of this into the client would create massive bundle sizes and slow initial page loads.

**Recommended Strategy: Layered Approach**

| Strategy | When to Use | How |
|----------|-------------|-----|
| **Static JSON + ISR** | Full HTS dataset for server-side search API | Download HTS JSON from USITC, place in `/data/`. Create an API route (`/api/hts/search`) that loads the dataset server-side and returns paginated results. Use ISR with `revalidate: 86400` (daily) to cache. |
| **Server Components** | HTS lookup page, search results | Render search results in Server Components -- zero client-side JavaScript for the data table. Only the search input is a Client Component. |
| **Client-Side Index** | Real-time search-as-you-type | Load a **compressed index** (not raw data) to the client. FlexSearch/MiniSearch can serialize their index to a fraction of the raw data size. Lazy-load the index only when the user opens the HTS search feature. |
| **API Route + Streaming** | Large result sets | Use Next.js streaming with `ReadableStream` to progressively send search results without buffering the entire response |
| **On-Demand Revalidation** | When USITC publishes a new HTS revision | Use `revalidatePath('/api/hts/...')` or `revalidateTag('hts-data')` to bust the cache when new tariff data is available |

**What NOT to Do:**
- Do NOT `import` a 100MB JSON file in a Client Component
- Do NOT use `getStaticProps` to pass the full dataset as page props (serialization cost is enormous)
- Do NOT rely on SSG for pages with dynamic search -- use Server Components + API routes

**Real-World Optimization Reference:** A documented case showed Next.js SSR times dropping from 3s to 400ms by switching from full SSR to ISR + caching + Server Components with minimal client-side hydration.

**Recommended Architecture:**

```
/data/
  hts-2026-rev4.json           # Full HTS schedule (~100K entries, ~50-80MB)

/lib/search/
  hts-index.ts                 # Build MiniSearch/FlexSearch index at startup
  hts-search.ts                # Search function against pre-built index

/app/api/hts/
  search/route.ts              # API route: loads index once, handles search queries
                               # Uses Node.js module caching (index built once per cold start)

/app/(tools)/hts-lookup/
  page.tsx                     # Server Component: renders page shell
  SearchInput.tsx              # Client Component: search input with debounce
  ResultsTable.tsx             # Server Component: renders results table
```

### 3.2 Vercel Serverless Limits for PDF Generation

| Limit | Hobby Plan | Pro Plan |
|-------|-----------|----------|
| **Timeout** | 10s (300s with Fluid Compute) | 60s (800s with Fluid Compute) |
| **Memory** | 1024MB | Up to 3008MB |
| **Bundle Size** | 250MB uncompressed / 50MB compressed | Same |
| **Function Count** | 12 per deployment | Unlimited |

**PDF Generation Strategy:**

For a shipping platform generating Bills of Lading, commercial invoices, and landed cost reports:

1. **Simple PDFs (1-3 pages, basic tables):** Vercel Hobby plan is sufficient. Generate in API route, return as blob. Target < 5s generation time.

2. **Complex PDFs (multi-page reports, many tables):** Use Vercel Pro plan with Fluid Compute enabled (60s+ timeout, higher memory). Set `maxDuration` in the route config:
   ```typescript
   export const maxDuration = 60; // seconds
   ```

3. **High-Volume PDF Generation:** Deploy a dedicated PDF microservice on Railway/Render/Fly.io. Queue PDF jobs via the main Next.js app, generate asynchronously, store in Vercel Blob or S3, return download URL.

4. **Memory Leak Mitigation:** Re-use a single `renderToBuffer` call pattern rather than creating many sequential renders in one function invocation. Monitor memory usage. Consider Lambda concurrency to isolate renders.

### 3.3 Client-Side Search Performance for Large Datasets

**Key Principle:** Never send raw 100K+ entries to the client.

**Option A: Server-Side Search (Recommended for Phase 1)**
- Build search index server-side in API route
- Client sends search query, server returns top 50 results
- Latency: ~50-200ms per query (network + search)
- Zero client-side memory overhead

**Option B: Client-Side Index (Recommended for Phase 2)**
- Pre-build a compressed search index at build time
- Serve as a static asset (~5-15MB compressed, depending on index type)
- Lazy-load index when user opens HTS search
- Search is instant (< 1ms) after index loads
- Initial index load takes 1-3 seconds

**Option C: Hybrid (Best Overall)**
- Server-side search for initial results
- Progressive client-side index loading in background
- Switch to client-side search once index is loaded
- Provides instant results while maintaining fast initial page load

---

## 4. Risk Matrix

| Technology | Risk Level | Primary Risk | Mitigation |
|-----------|-----------|--------------|------------|
| **searoute-js** | MEDIUM | Unmaintained, outdated maritime network | Fork and update dataset; plan for Searoutes API in Phase 2 |
| **deck.gl** | LOW | Bundle size if not tree-shaken properly | Use modular imports, verify webpack/turbopack tree-shaking |
| **MapLibre GL JS** | LOW | Tile provider free tier limits | Start with Protomaps (1M/month free), upgrade if needed |
| **@react-pdf/renderer** | MEDIUM-HIGH | Memory leaks + Vercel serverless constraints | Use Pro plan; plan for dedicated PDF microservice |
| **decimal.js** | LOW | None significant | Standard choice, battle-tested |
| **FlexSearch** | LOW | Large unpacked size, incomplete TypeScript types | Use modular builds; consider MiniSearch as alternative |
| **Fuse.js** | HIGH | **Fails at 100K+ entries** -- linear scan too slow | **Do not use** for HTS search. Use FlexSearch or MiniSearch |
| **USITC HTS API** | LOW | Government API could change without notice | Download bulk data as primary; use API as supplement |
| **Maersk API** | LOW-MEDIUM | May become paid in future | Use for Phase 1; maintain static fallback data |
| **CMA CGM API** | MEDIUM | 1-month free trial only | Extract and cache data during trial; use static data after |
| **Terminal49** | LOW | 100-container free limit | Sufficient for Phase 1; budget $350/month for scale |
| **OFIS FTZ** | MEDIUM | No clean bulk download | One-time scraping effort; data changes slowly (~yearly) |

---

## 5. Final Recommendations

### Immediately Actionable

1. **Register for Maersk Developer Portal** -- 2-3 day lead time for API key
2. **Register for CMA CGM API Portal** -- start the 1-month free trial strategically (when ready to extract and cache schedule data)
3. **Download the 2026 HTS JSON** from hts.usitc.gov -- this is the foundation for the HTS lookup tool
4. **Register for Terminal49 Developer Key** -- get the 100-container free tier set up

### Technology Swaps to Consider

| Original Choice | Recommended Swap | Reason |
|----------------|-----------------|--------|
| Fuse.js (for HTS search) | **MiniSearch** | Fuse.js is unacceptably slow at 100K+ entries. MiniSearch offers better relevance + adequate speed |
| searoute-js | **searoute-ts** (or forked searoute-js) | TypeScript types, slightly more recent. Still plan for Searoutes API in Phase 2 |
| @react-pdf/renderer on Vercel Hobby | **@react-pdf/renderer on Vercel Pro** or **dedicated microservice** | Memory leaks and timeouts are real risks on Hobby plan |

### Phase 1 Data Architecture

```
Phase 1: Static Data + Local Computation
  - HTS data: Downloaded JSON from USITC (100K+ entries, indexed with MiniSearch)
  - Carrier schedules: Static JSON compiled from Maersk/CMA CGM APIs
  - FTZ data: One-time scrape from OFIS, stored as static JSON (~260 records)
  - Port data: UN/LOCODE + World Port Index downloads (free)
  - Routes: searoute-js/ts for offline route polylines
  - Maps: MapLibre GL JS + Protomaps (zero cost)
  - Charts: Recharts + Tremor (zero cost)
  - Calculations: decimal.js + currency.js (zero cost)
  - PDFs: @react-pdf/renderer (monitor memory, upgrade plan if needed)
```

### Estimated Monthly Costs (Phase 1)

| Item | Cost |
|------|------|
| Vercel Pro (for PDF generation headroom) | $20/month |
| Map tiles (Protomaps/MapTiler free tier) | $0 |
| USITC HTS data | $0 |
| Maersk API | $0 |
| Terminal49 (100 containers) | $0 |
| Domain / DNS | ~$12/year |
| **Total** | **~$20/month** |

---

## Sources

### Libraries
- [searoute-js npm](https://www.npmjs.com/package/searoute-js) -- v0.1.0, last published 6 years ago
- [searoute-ts GitHub](https://github.com/mayurrawte/searoute-ts) -- TypeScript alternative
- [Searoutes API Pricing](https://searoutes.com/pricing/) -- from EUR 400/month
- [deck.gl npm](https://www.npmjs.com/package/deck.gl) -- v9.2.11
- [deck.gl ArcLayer docs](https://deck.gl/docs/api-reference/layers/arc-layer)
- [deck.gl TripsLayer docs](https://deck.gl/docs/api-reference/geo-layers/trips-layer)
- [deck.gl + MapLibre guide](https://deck.gl/docs/developer-guide/base-maps/using-with-maplibre)
- [deck.gl Performance guide](https://deck.gl/docs/developer-guide/performance)
- [maplibre-gl npm](https://www.npmjs.com/package/maplibre-gl) -- v5.21.1
- [MapLibre GL JS docs](https://maplibre.org/maplibre-gl-js/docs/)
- [react-map-gl docs](https://visgl.github.io/react-map-gl/)
- [@react-pdf/renderer npm](https://www.npmjs.com/package/@react-pdf/renderer) -- v4.3.2
- [react-pdf memory leak issue #2848](https://github.com/diegomura/react-pdf/issues/2848)
- [react-pdf memory leak issue #718](https://github.com/diegomura/react-pdf/issues/718)
- [decimal.js npm](https://www.npmjs.com/package/decimal.js) -- v10.6.0
- [decimal.js API docs](https://mikemcl.github.io/decimal.js/)
- [FlexSearch GitHub](https://github.com/nextapps-de/flexsearch) -- v0.8.212
- [Fuse.js npm](https://www.npmjs.com/package/fuse.js) -- v7.1.0
- [MiniSearch GitHub](https://github.com/lucaong/minisearch)
- [FlexSearch vs Fuse.js vs MiniSearch comparison](https://npm-compare.com/elasticlunr,flexsearch,fuse.js,minisearch)

### APIs & Data Sources
- [USITC HTS](https://hts.usitc.gov/) -- confirmed REST API at `/reststop/search`
- [USITC HTS External User Guide](https://www.usitc.gov/documents/hts_external_guide.pdf)
- [2026 HTS Basic Edition](https://www.usitc.gov/2026_hts_basic_edition)
- [Maersk Developer Portal](https://developer.maersk.com/api-catalogue)
- [Maersk API FAQ (pricing)](https://www.maersk.com/support/faqs/do-i-need-to-pay-to-use-your-api)
- [CMA CGM API Portal](https://api-portal.cma-cgm.com/)
- [CMA CGM API Starting Guide](https://services.cmacgm-group.com/API-Solutions_Starting-Guide)
- [Terminal49 API Pricing](https://terminal49.com/api-pricing)
- [Terminal49 Free Plan](https://help.terminal49.com/articles/2160671086-lite-plan)
- [OFIS FTZ Database](https://ofis.trade.gov/)
- [OFIS on data.gov](https://catalog.data.gov/dataset/online-ftz-information-system-ofis)
- [Commerce Data Hub FTZ](https://data.commerce.gov/foreign-trade-zones-zone-and-site-information)

### Infrastructure & Hosting
- [Vercel Functions Limits](https://vercel.com/docs/functions/limitations)
- [Vercel Hobby Plan](https://vercel.com/docs/plans/hobby)
- [MapTiler Pricing](https://www.maptiler.com/cloud/pricing/)
- [Protomaps Free Tier](https://protomaps.com/blog/free-tier-maps)
- [Stadia Maps Pricing](https://stadiamaps.com/pricing/)
- [Mapbox GL JS Pricing](https://docs.mapbox.com/mapbox-gl-js/guides/pricing/)

### Performance & Architecture
- [Fixing Next.js Performance Bottleneck (3s to 400ms)](https://dev.to/mina_golzari_dalir/fixing-a-major-nextjs-performance-bottleneck-ssr-hydration-large-datasets-47g9)
- [Handling Large JSON in Next.js](https://medium.com/@mohantaankit2002/handling-large-json-data-in-next-js-without-slowing-down-the-ui-78e6dc17b169)
- [Next.js ISR Guide](https://nextjs.org/docs/pages/guides/incremental-static-regeneration)
- [Protomaps + Cloudflare 90% cost reduction](https://bonitotech.com/2024/03/19/how-we-reduced-our-mapping-costs-by-90-using-protomaps-and-cloudflare/)
