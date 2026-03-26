# Data Pipeline Design — Shipping Savior

**Linear:** AI-5458, AI-5434
**Phase:** 2 — Architecture & Planning
**Status:** Complete
**Last Updated:** 2026-03-26

---

## Table of Contents

1. [Data Sources Inventory](#1-data-sources-inventory)
2. [Ingestion Pipelines](#2-ingestion-pipelines)
3. [Data Transformation Layer](#3-data-transformation-layer)
4. [Storage Strategy](#4-storage-strategy)
5. [Carrier Rate Caching Strategy](#5-carrier-rate-caching-strategy)
6. [HTS Database Sync](#6-hts-database-sync)
7. [Data Quality and Validation Rules](#7-data-quality-and-validation-rules)
8. [Pipeline Monitoring and Alerting](#8-pipeline-monitoring-and-alerting)
9. [Schema Diagrams](#9-schema-diagrams)

---

## 1. Data Sources Inventory

### 1.1 Tariff & Duty Data

| Source | URL / Access | Format | Update Cadence | Priority |
|--------|-------------|--------|---------------|---------|
| USITC Harmonized Tariff Schedule (HTS) | https://hts.usitc.gov/download — no API key | JSON / CSV / XLS | Multiple revisions/year | P0 |
| CBP CROSS Rulings Database | https://rulings.cbp.gov/ — web scraping | HTML → structured | ~67 new rulings per batch, multiple/week | P0 |
| Section 301 / 201 / 232 Tariff Lists | USTR.gov Federal Register notices | PDF → parsed | Irregular (executive-order driven) | P0 |
| Anti-Dumping / CVD Orders | https://trade.cbp.dhs.gov/ace/adcvd/ | HTML scraping | Weekly | P1 |
| Federal Register Trade Feed | https://www.federalregister.gov/api/v1 | REST JSON | Daily (business days) | P1 |

**Data volumes:**
- HTS schedule: ~17,000 10-digit codes, ~15 MB per revision
- CBP rulings: ~220,000 historical records, ~500 MB text; pgvector embeddings add ~1.6 GB
- Section 301 active list: ~500 HTS entries with special rates
- AD/CVD orders: several thousand active orders

### 1.2 Carrier & Vessel APIs

| Carrier / Source | Access Method | DCSA Compliant | Freshness Target | Phase |
|-----------------|--------------|----------------|-----------------|-------|
| Maersk Schedule API | developer.maersk.com — self-service registration | Yes | Daily (P2), Hourly (P3) | P2 |
| CMA CGM API | api-portal.cma-cgm.com — account registration | Yes | Daily | P2 |
| Hapag-Lloyd API | api-portal.hlag.com — account registration | Yes | Daily | P2 |
| MSC (DCSA Commercial Schedules) | DCSA consortium / carrier portal | Yes | Daily | P2 |
| Evergreen (ShipmentLink) | ss.shipmentlink.com — web scraping | No | Daily | P2 |
| ONE (Ocean Network Express) | one-line.com — web scraping | No | Daily | P2 |
| Yang Ming | yanmingusa.com — web scraping | No | Daily | P2 |
| COSCO | cop.lines.coscoshipping.com — partial scraping | No | Daily | P2 |
| JSONCargo (aggregator) | jsoncargo.com REST API (~$200–500/mo) | Yes | Real-time | P2 alt |
| AISHub (AIS vessel tracking) | Free — requires reciprocal data contribution | N/A | ~5 min position updates | P2 |
| Datalastic (satellite AIS) | REST API — 199–679 EUR/month | N/A | Real-time | P3 |
| MarineTraffic | Enterprise REST API | N/A | Real-time | P3 |

**Key vessel fields per AIS update:** MMSI, vessel name, IMO, lat/lng, speed over ground, heading, destination port, ETA, timestamp.

### 1.3 Exchange Rate Data

| Source | URL | Format | Cadence | Cost |
|--------|-----|--------|---------|------|
| ECB Euro FX Reference Rates | https://www.ecb.europa.eu/stats/eurofxref/ | XML / CSV | Daily (business days) | Free |
| Open Exchange Rates | openexchangerates.org | REST JSON | Hourly (free tier: daily) | Free / ~$12/mo |
| Fixer.io | fixer.io | REST JSON | Hourly | ~$12/mo |

All three sources provide sufficient coverage. ECB is authoritative for EUR pairs; Open Exchange Rates or Fixer for USD-based crosses. Store end-of-day snapshots in `exchange_rates` table; use intraday fallback from cached rates within acceptable drift threshold (0.5%).

### 1.4 Port & Terminal Data

| Source | URL | Format | Cadence | Priority |
|--------|-----|--------|---------|---------|
| MARAD Port Statistics | marad.dot.gov/data | CSV / XLS | Monthly | P1 |
| Army Corps Waterborne Commerce | iwr.usace.army.mil | CSV | Quarterly | P2 |
| Port authority websites (LA/LB, Miami, Savannah, Seattle) | Varies — web scraping | HTML / PDF | Weekly congestion | P1 |
| Global Port Congestion API (MarineTraffic or Portcast) | portcast.io | REST JSON | Daily | P2 |
| UN LOCODE Database | unece.org/trade/cefact/unlocode | CSV | Quarterly | P1 |

### 1.5 Shipment & Customer Data (Internal)

| Entity | Source | Format | Cadence |
|--------|--------|--------|---------|
| Shipment records | Platform UI / manual entry | DB rows | Real-time write |
| Customer product catalogs | Upload / API | JSON / CSV | On-demand |
| FTZ inventory positions | Manual entry + FTZ operator sync | DB rows | Daily sync |
| Partner / fulfillment center status | Webhook or polling | JSON | Event-driven |
| Bill of lading documents | Upload (PDF) | Binary → parsed text | On-demand |

---

## 2. Ingestion Pipelines

### 2.1 Pipeline Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        INGESTION LAYER                            │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Cron Jobs   │  │  Webhook     │  │  On-Demand Triggers   │  │
│  │  (pg-cron /  │  │  Receivers   │  │  (user upload, API    │  │
│  │   Vercel     │  │  (Federal    │  │   request, manual     │  │
│  │   cron)      │  │   Register,  │  │   refresh)            │  │
│  └──────┬───────┘  │   carriers)  │  └──────────┬────────────┘  │
│         │          └──────┬───────┘             │               │
│         └────────────────┼─────────────────────┘               │
│                          ▼                                       │
│                  ┌───────────────┐                              │
│                  │  Job Queue    │                              │
│                  │  (pg-boss /   │                              │
│                  │   Redis BullMQ)│                              │
│                  └───────┬───────┘                              │
│                          ▼                                       │
│               ┌─────────────────────┐                           │
│               │   Worker Processes  │                           │
│               │  (Next.js API route │                           │
│               │   or Railway worker)│                           │
│               └─────────┬───────────┘                           │
└─────────────────────────┼────────────────────────────────────────┘
                          ▼
              Processing + Storage Layers
```

### 2.2 Real-Time Ingestion (Phase 3)

| Pipeline | Trigger | Latency Target | Technology |
|----------|---------|---------------|-----------|
| AIS vessel position updates | AISHub WebSocket / polling | < 5 min | WebSocket consumer → Postgres write |
| Federal Register new notices | FR API webhook or hourly poll | < 1 hour | Cron → diff detection → alert |
| Partner status webhooks | Inbound HTTP POST | < 30 sec | Next.js `/api/webhooks/partner` |
| Carrier booking confirmations | Carrier webhook | < 1 min | Next.js `/api/webhooks/carrier` |

### 2.3 Batch Ingestion (Phase 2)

| Pipeline | Schedule | Estimated Duration | Retry Policy |
|----------|----------|--------------------|-------------|
| HTS schedule download + diff | Weekly, Sunday 02:00 UTC | ~5 min | 3 retries, exponential backoff |
| CBP CROSS new rulings scraper | Daily 03:00 UTC | ~15 min | 3 retries, 5 min backoff |
| AD/CVD order scraper | Weekly, Monday 04:00 UTC | ~30 min | 2 retries |
| Section 301 / Federal Register | Daily 06:00 UTC | ~10 min | 3 retries |
| Carrier schedule fetch (API carriers) | Daily 07:00 UTC | ~20 min total | Per-carrier retry |
| Non-API carrier scraper | Daily 07:30 UTC | ~45 min | Per-carrier retry, skip on block |
| Exchange rate snapshot | Daily 16:00 UTC (after ECB publishes) | < 1 min | 5 retries (time-sensitive) |
| Port congestion data | Daily 08:00 UTC | ~5 min | 2 retries |
| MARAD port statistics | Monthly, 1st 09:00 UTC | ~10 min | 2 retries |

### 2.4 On-Demand Ingestion

| Trigger | Pipeline | Response Mode |
|---------|---------|--------------|
| User submits product for HTS lookup | AI classification → CBP CROSS search | Synchronous (< 3 sec) |
| User uploads bill of lading PDF | PDF text extraction → field parsing | Async (< 30 sec) |
| User requests route comparison | Carrier API spot-query (Phase 3) | Async with loading state |
| User adds product to catalog | Product schema validation | Synchronous |
| Admin manual refresh | Any pipeline via admin panel trigger | Async with status display |

---

## 3. Data Transformation Layer

### 3.1 Normalization

All ingested data passes through a normalization layer before storage. Goals: eliminate source-specific quirks, enforce consistent field names and types, and flag anomalies for manual review.

**HTS Code Normalization:**
```
Raw USITC format:  "6403.99.60.45" (varies by revision)
Canonical format:  10-digit zero-padded string: "6403996045"
Display format:    "6403.99.60.45"
Chapter field:     integer(64)
```

**Duty Rate Normalization:**
```
Raw:    "5.6%" or "5.6¢/kg + 3.2%" or "Free"
Stored: { ad_valorem_pct: 5.6, specific_cents_per_unit: null, unit: null, is_free: false }
        { ad_valorem_pct: 3.2, specific_cents_per_unit: 5.6, unit: "kg", is_free: false }
        { ad_valorem_pct: 0, is_free: true }
```

**Carrier Rate Normalization:**
```
Raw Maersk:     { "oceanFreight": 2150, "currency": "USD", "validUntil": "2026-04-15" }
Raw CMA CGM:    { "totalAmount": 2280, "curr": "USD", "expiryDate": "15-Apr-2026" }
Canonical:      { carrier: "maersk", origin_unlocode: "CNSHA", dest_unlocode: "USLAX",
                  container_type: "40HC", base_rate_usd: 2150, all_in_rate_usd: 2420,
                  surcharges: [...], valid_from: Date, valid_until: Date, fetched_at: Date }
```

**Port/UNLOCODE Normalization:**
All port references resolve to the 5-character UN/LOCODE standard (e.g., `CNSHA` = Shanghai). Carrier APIs use inconsistent naming — a lookup table maps aliases to canonical LOCODEs.

### 3.2 Enrichment

After normalization, records are enriched with computed or joined data:

| Enrichment | Input → Output | Timing |
|-----------|---------------|--------|
| Country-of-origin duty rate join | HTS code + COO → effective rate including Section 301 | At query time (computed), cached |
| AD/CVD flag | HTS code → is_adcvd, adcvd_rate | At HTS ingest |
| GSP eligibility | HTS code + COO → gsp_eligible | At HTS ingest |
| FTZ savings delta | Current rate vs. FTZ lock-in rate → savings_pct | At calculation request |
| Carrier schedule transit time | Origin port + dest port + vessel ETA → transit_days | At schedule fetch |
| Exchange rate conversion | Amount + currency pair + date → USD equivalent | At query time |
| AI HTS classification embeddings | Product description → 1536-dim vector | On classification request |

### 3.3 Transformation Pipeline Steps

Each batch job follows this standard sequence:

```
1. EXTRACT    → Fetch raw data (HTTP, scraper, file download)
2. VALIDATE   → Schema check, required fields, range checks
3. NORMALIZE  → Canonical field names, types, formats
4. DEDUPLICATE → Check existing records; skip or update on match
5. ENRICH     → Join with reference data, compute derived fields
6. LOAD       → Upsert to Postgres with conflict resolution
7. INDEX      → Rebuild search indexes, invalidate Redis cache
8. LOG        → Write pipeline_runs record with row counts, errors
```

---

## 4. Storage Strategy

### 4.1 Hot / Warm / Cold Tiers

```
┌─────────────────────────────────────────────────────────────────┐
│  HOT TIER — Redis (Upstash)                                      │
│  • Carrier rate cache (TTL: 4–24 hours)                         │
│  • HTS search result cache (TTL: 1 hour)                        │
│  • Exchange rate current snapshot (TTL: 6 hours)                │
│  • Session tokens, rate limiting counters                       │
│  Storage: < 500 MB                                              │
├─────────────────────────────────────────────────────────────────┤
│  WARM TIER — Neon PostgreSQL (primary operational DB)           │
│  • All shipment records, customer data, product catalogs        │
│  • Current HTS schedule (latest revision only, indexed)         │
│  • Current carrier rates (rolling 30-day window)                │
│  • Current exchange rates (rolling 90-day)                      │
│  • CBP rulings + pgvector embeddings (full corpus)              │
│  • AD/CVD orders, Section 301 lists                             │
│  • Pipeline run logs, audit trail                               │
│  Storage: 5–20 GB operational                                   │
├─────────────────────────────────────────────────────────────────┤
│  COLD TIER — Vercel Blob / S3-compatible                         │
│  • Historical HTS revisions (all past versions as JSON)         │
│  • Raw scraped HTML archives (for replay / debugging)           │
│  • Bill of lading PDFs (original uploads)                       │
│  • Carrier rate historical archives (> 30 days)                 │
│  • Exchange rate history (> 90 days)                            │
│  Storage: 10–50 GB growing                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Postgres Schema Design

#### Core Tables

**`hts_codes`** — HTS schedule (current revision)
```sql
CREATE TABLE hts_codes (
  id               SERIAL PRIMARY KEY,
  hts_code         CHAR(10) NOT NULL,           -- 10-digit zero-padded
  description      TEXT NOT NULL,
  general_rate     TEXT,                          -- raw text from USITC
  general_rate_pct NUMERIC(6,2),                  -- parsed ad valorem %
  general_specific JSONB,                          -- specific/compound rates
  special_rates    TEXT,                           -- GSP, FTA codes
  chapter          SMALLINT NOT NULL,
  heading          CHAR(4),
  subheading       CHAR(6),
  indent_level     SMALLINT DEFAULT 0,
  unit_of_quantity VARCHAR(50),
  is_adcvd         BOOLEAN DEFAULT FALSE,
  gsp_eligible     BOOLEAN DEFAULT FALSE,
  revision         VARCHAR(20) NOT NULL,           -- e.g. "2026 Rev 4"
  effective_date   DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (hts_code, revision)
);

CREATE INDEX idx_hts_codes_chapter ON hts_codes(chapter);
CREATE INDEX idx_hts_codes_heading ON hts_codes(heading);
CREATE INDEX idx_hts_codes_description_fts ON hts_codes USING gin(to_tsvector('english', description));
```

**`duty_rates`** — Country-specific duty rates per HTS
```sql
CREATE TABLE duty_rates (
  id                SERIAL PRIMARY KEY,
  hts_code          CHAR(10) REFERENCES hts_codes(hts_code),
  country_code      CHAR(2) NOT NULL,             -- ISO 3166-1 alpha-2
  country_name      VARCHAR(100),
  effective_rate_pct NUMERIC(6,2),
  section_301_rate  NUMERIC(6,2),
  section_201_rate  NUMERIC(6,2),
  section_232_rate  NUMERIC(6,2),
  ad_cvd_rate       NUMERIC(8,2),
  ad_cvd_order_id   INTEGER REFERENCES ad_cvd_orders(id),
  is_free           BOOLEAN DEFAULT FALSE,
  gsp_eligible      BOOLEAN DEFAULT FALSE,
  mfn_rate_pct      NUMERIC(6,2),                  -- Most Favored Nation base
  effective_from    DATE,
  effective_until   DATE,
  source            VARCHAR(50),                   -- 'usitc', 'ustr', 'cbp'
  notes             TEXT,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_duty_rates_hts ON duty_rates(hts_code);
CREATE INDEX idx_duty_rates_country ON duty_rates(country_code);
CREATE UNIQUE INDEX idx_duty_rates_unique ON duty_rates(hts_code, country_code, effective_from);
```

**`customs_rulings`** — CBP CROSS rulings corpus
```sql
CREATE TABLE customs_rulings (
  id              SERIAL PRIMARY KEY,
  ruling_number   VARCHAR(20) UNIQUE NOT NULL,     -- e.g. "NY N339012"
  issue_date      DATE NOT NULL,
  hts_code        CHAR(10),
  product_description TEXT NOT NULL,
  ruling_text     TEXT,
  tariff_basis    TEXT,
  port_of_entry   VARCHAR(100),
  importer        VARCHAR(200),
  classification_reasoning TEXT,
  embedding       VECTOR(1536),                    -- pgvector for semantic search
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rulings_hts ON customs_rulings(hts_code);
CREATE INDEX idx_rulings_date ON customs_rulings(issue_date DESC);
CREATE INDEX idx_rulings_embedding ON customs_rulings USING ivfflat (embedding vector_cosine_ops);
```

**`ad_cvd_orders`** — Anti-Dumping / CVD orders
```sql
CREATE TABLE ad_cvd_orders (
  id              SERIAL PRIMARY KEY,
  case_number     VARCHAR(30) UNIQUE NOT NULL,
  order_type      VARCHAR(10) NOT NULL,            -- 'AD' or 'CVD'
  country_code    CHAR(2) NOT NULL,
  product_desc    TEXT NOT NULL,
  hts_codes       TEXT[],                          -- array of affected codes
  rate_pct        NUMERIC(8,2),
  effective_date  DATE,
  revocation_date DATE,
  is_active       BOOLEAN DEFAULT TRUE,
  federal_register_cite VARCHAR(50),
  notes           TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_adcvd_country ON ad_cvd_orders(country_code);
CREATE INDEX idx_adcvd_active ON ad_cvd_orders(is_active);
```

**`carrier_schedules`** — Normalized ocean carrier vessel schedules
```sql
CREATE TABLE carrier_schedules (
  id                  SERIAL PRIMARY KEY,
  carrier_code        VARCHAR(10) NOT NULL,        -- 'maersk', 'cmacgm', etc.
  service_name        VARCHAR(100),
  vessel_name         VARCHAR(100),
  voyage_number       VARCHAR(30),
  origin_unlocode     CHAR(5) NOT NULL,
  dest_unlocode       CHAR(5) NOT NULL,
  etd                 TIMESTAMPTZ,                 -- Estimated Time of Departure
  eta                 TIMESTAMPTZ,                 -- Estimated Time of Arrival
  transit_days        SMALLINT,
  transshipment_ports TEXT[],                      -- intermediate hub ports
  container_types     TEXT[],                      -- ['20GP','40HC','45HC']
  cutoff_date         TIMESTAMPTZ,                 -- cargo cutoff
  fetched_at          TIMESTAMPTZ DEFAULT NOW(),
  data_source         VARCHAR(20),                 -- 'api' | 'scraper'
  UNIQUE (carrier_code, voyage_number, origin_unlocode, dest_unlocode)
);

CREATE INDEX idx_schedules_route ON carrier_schedules(origin_unlocode, dest_unlocode);
CREATE INDEX idx_schedules_etd ON carrier_schedules(etd);
CREATE INDEX idx_schedules_carrier ON carrier_schedules(carrier_code);
```

**`carrier_rates`** — Freight rate quotes per carrier/route
```sql
CREATE TABLE carrier_rates (
  id                SERIAL PRIMARY KEY,
  carrier_code      VARCHAR(10) NOT NULL,
  origin_unlocode   CHAR(5) NOT NULL,
  dest_unlocode     CHAR(5) NOT NULL,
  container_type    VARCHAR(10) NOT NULL,          -- '20GP', '40HC', '45HC'
  base_rate_usd     NUMERIC(10,2),
  all_in_rate_usd   NUMERIC(10,2),
  surcharges        JSONB,                          -- [{code, name, amount_usd}]
  valid_from        DATE,
  valid_until       DATE,
  fetched_at        TIMESTAMPTZ DEFAULT NOW(),
  cache_key         VARCHAR(100) UNIQUE,
  data_source       VARCHAR(20)                    -- 'api' | 'scraped' | 'mock'
);

CREATE INDEX idx_rates_route ON carrier_rates(origin_unlocode, dest_unlocode, container_type);
CREATE INDEX idx_rates_valid ON carrier_rates(valid_until);
```

**`exchange_rates`** — Daily FX rate snapshots
```sql
CREATE TABLE exchange_rates (
  id              SERIAL PRIMARY KEY,
  base_currency   CHAR(3) NOT NULL DEFAULT 'USD',
  quote_currency  CHAR(3) NOT NULL,
  rate            NUMERIC(16,8) NOT NULL,
  rate_date       DATE NOT NULL,
  source          VARCHAR(30),                     -- 'ecb', 'openexchangerates'
  fetched_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (base_currency, quote_currency, rate_date)
);

CREATE INDEX idx_fx_pair ON exchange_rates(base_currency, quote_currency);
CREATE INDEX idx_fx_date ON exchange_rates(rate_date DESC);
```

**`shipments`** — Core shipment records (internal)
```sql
CREATE TABLE shipments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES users(id),
  reference_number    VARCHAR(50),
  status              VARCHAR(30) NOT NULL,        -- 'planned','in_transit','at_port','in_ftz','delivered'
  origin_unlocode     CHAR(5),
  dest_unlocode       CHAR(5),
  carrier_code        VARCHAR(10),
  vessel_name         VARCHAR(100),
  voyage_number       VARCHAR(30),
  container_type      VARCHAR(10),
  container_count     SMALLINT DEFAULT 1,
  bill_of_lading      VARCHAR(50),
  etd                 TIMESTAMPTZ,
  eta                 TIMESTAMPTZ,
  actual_departure    TIMESTAMPTZ,
  actual_arrival      TIMESTAMPTZ,
  freight_cost_usd    NUMERIC(12,2),
  is_cold_chain       BOOLEAN DEFAULT FALSE,
  is_ftz              BOOLEAN DEFAULT FALSE,
  ftz_entry_date      DATE,
  ftz_lock_rate_pct   NUMERIC(6,2),               -- duty rate at FTZ entry
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipments_user ON shipments(user_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_eta ON shipments(eta);
```

**`shipment_products`** — Products within a shipment
```sql
CREATE TABLE shipment_products (
  id              SERIAL PRIMARY KEY,
  shipment_id     UUID REFERENCES shipments(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id),
  hts_code        CHAR(10),
  country_of_origin CHAR(2),
  quantity        INTEGER NOT NULL,
  unit_cost_usd   NUMERIC(10,4),
  total_cost_usd  NUMERIC(12,2),
  duty_rate_pct   NUMERIC(6,2),
  duty_amount_usd NUMERIC(10,2),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**`products`** — Customer product catalog
```sql
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  sku             VARCHAR(100),
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  hts_code        CHAR(10),
  hts_confidence  NUMERIC(4,3),                   -- AI classification confidence 0-1
  country_of_origin CHAR(2),
  unit_cost_usd   NUMERIC(10,4),
  weight_kg       NUMERIC(8,3),
  dimensions_cm   JSONB,                           -- {l, w, h}
  category        VARCHAR(100),
  is_cold_chain   BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_products_hts ON products(hts_code);
```

**`pipeline_runs`** — Audit log for all pipeline executions
```sql
CREATE TABLE pipeline_runs (
  id              SERIAL PRIMARY KEY,
  pipeline_name   VARCHAR(100) NOT NULL,
  started_at      TIMESTAMPTZ NOT NULL,
  completed_at    TIMESTAMPTZ,
  status          VARCHAR(20),                     -- 'running','success','failed','partial'
  rows_fetched    INTEGER,
  rows_inserted   INTEGER,
  rows_updated    INTEGER,
  rows_skipped    INTEGER,
  error_message   TEXT,
  metadata        JSONB                            -- source-specific context
);

CREATE INDEX idx_runs_pipeline ON pipeline_runs(pipeline_name, started_at DESC);
```

---

## 5. Carrier Rate Caching Strategy

### 5.1 Cache Architecture

Carrier rates are the most volatile data in the system and the most expensive to fetch. The caching layer uses a two-level approach:

```
Request → Redis L1 cache (hot) → Postgres L2 cache (warm) → Live carrier API (cold)
           TTL: 4–24 hours         TTL: 30 days window          Only on cache miss
```

### 5.2 Cache Key Design

```
carrier_rate:{origin}:{dest}:{container_type}:{carrier}

Examples:
  carrier_rate:CNSHA:USLAX:40HC:maersk
  carrier_rate:KRPUS:USLAX:40HC:ALL          ← aggregated best-rate key
  carrier_rate:CRCAL:USMIA:40HC:maersk
```

### 5.3 TTL Policy by Data Volatility

| Data Type | Redis TTL | Postgres Window | Invalidation Trigger |
|-----------|-----------|----------------|---------------------|
| Spot rate quotes | 4 hours | 7 days | Carrier API rate change |
| Contract/tariff rates | 24 hours | 30 days | Valid-until expiry + 10% |
| Vessel schedules | 6 hours | 14 days | ETD change > 12 hours |
| Port surcharges (PSS, BAF) | 12 hours | 30 days | Carrier announcement |
| Exchange rates | 6 hours | 90 days | Daily ECB/OER update |
| HTS duty rates | 168 hours (1 week) | Until revision change | New USITC revision |

### 5.4 Invalidation Logic

```typescript
// Cache invalidation waterfall:
// 1. Hard expiry: Redis TTL expires → serve Postgres if fresh enough
// 2. Soft expiry: Postgres row updated_at > TTL threshold → queue background refresh
// 3. Force invalidation: Pipeline detects rate change → DELETE matching Redis keys + mark Postgres stale
// 4. Manual flush: Admin panel trigger → flush all keys matching pattern

async function getCarrierRate(origin: string, dest: string, containerType: string, carrier: string) {
  const cacheKey = `carrier_rate:${origin}:${dest}:${containerType}:${carrier}`;

  // L1: Redis
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // L2: Postgres (within acceptable staleness window)
  const dbRate = await db.query(
    `SELECT * FROM carrier_rates WHERE cache_key = $1 AND valid_until > NOW() AND fetched_at > NOW() - INTERVAL '24 hours'`,
    [cacheKey]
  );
  if (dbRate.rows[0]) {
    await redis.setex(cacheKey, 14400, JSON.stringify(dbRate.rows[0])); // re-warm L1
    return dbRate.rows[0];
  }

  // L3: Live fetch (queued async if non-urgent, inline if urgent)
  return await fetchLiveCarrierRate(origin, dest, containerType, carrier);
}
```

### 5.5 Carrier-Specific Considerations

| Carrier | Rate Refresh Frequency | API Rate Limit | Fallback |
|---------|----------------------|----------------|---------|
| Maersk | Daily | 100 req/day (free tier) | Postgres cache |
| CMA CGM | Daily | Contact for limits | Postgres cache |
| Hapag-Lloyd | Daily | Contact for limits | Postgres cache |
| Scraped carriers | Daily (overnight) | Self-throttled | Postgres cache |
| JSONCargo aggregator | On-demand | Per pricing tier | Carrier fallback |

---

## 6. HTS Database Sync

### 6.1 Revision Detection and Versioning

The USITC publishes the HTS schedule with named revisions (e.g., "2026 Rev 1", "2026 Rev 4"). Each revision is a complete replacement of the schedule, not a diff. The pipeline uses revision names as version keys.

```
Versioning strategy:
  - Store ALL revisions in cold tier (Blob storage) as JSON snapshots
  - Store ONLY current revision in `hts_codes` table (active)
  - Store revision history in `hts_revisions` metadata table
  - On revision change: run diff → log additions, deletions, rate changes → alert users
```

**`hts_revisions`** table:
```sql
CREATE TABLE hts_revisions (
  id              SERIAL PRIMARY KEY,
  revision_name   VARCHAR(30) UNIQUE NOT NULL,    -- "2026 Rev 4"
  effective_date  DATE NOT NULL,
  download_url    TEXT,
  blob_path       TEXT,                           -- cold storage path
  total_codes     INTEGER,
  codes_added     INTEGER,
  codes_modified  INTEGER,
  codes_removed   INTEGER,
  is_current      BOOLEAN DEFAULT FALSE,
  downloaded_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.2 Sync Process

```
1. DETECT   → Weekly cron hits https://hts.usitc.gov/download
               Compare page revision label against hts_revisions.revision_name
               If unchanged → log "no-op", exit

2. DOWNLOAD → Fetch full JSON export (~15 MB)
               Store raw file to Vercel Blob: /hts/{revision-slug}.json

3. PARSE    → Load JSON → normalize all 17K+ entries to canonical schema
               Compute chapter, heading, subheading from hts_code string

4. DIFF     → Compare new codes against current hts_codes table
               Build: {added[], modified[], removed[]} sets

5. LOAD     → Postgres transaction:
               a. INSERT new codes
               b. UPDATE modified codes (rate changes, description changes)
               c. Soft-delete removed codes (set deleted_at, do NOT hard delete)
               d. UPDATE hts_revisions SET is_current = FALSE WHERE is_current
               e. INSERT new hts_revisions row WITH is_current = TRUE

6. ENRICH   → For each changed code:
               a. Re-check AD/CVD cross-reference
               b. Re-compute GSP eligibility
               c. Flag for duty_rates re-derivation

7. ALERT    → If codes_modified > 50 → send admin alert (email / Slack)
               Log diff summary to pipeline_runs
```

### 6.3 CBP CROSS Rulings Sync

CBP adds ~67 new rulings multiple times per week. The sync pipeline focuses on incremental additions:

```
Daily sync flow:
1. Fetch rulings newer than last_sync_date from rulings.cbp.gov
2. Parse: ruling_number, date, HTS code, product description, reasoning text
3. Upsert to customs_rulings (ruling_number is unique key)
4. Generate embedding via OpenAI text-embedding-3-large for ruling_text
5. Store embedding to pgvector column
6. Rebuild IVFFlat index quarterly (or when > 5K new rows added)

Full historical sync (one-time, Phase 2 launch):
- 220K+ rulings processed in batches of 1,000
- Estimated duration: 8–12 hours
- Run as Railway worker job (not Vercel — exceeds function timeout)
- Progress checkpointed to pipeline_runs table
```

### 6.4 HTS Search Index Strategy

The platform supports two search modes for HTS lookup:

| Mode | Technology | Use Case | Latency |
|------|-----------|----------|---------|
| Keyword / fuzzy | PostgreSQL FTS (GIN) + `pg_trgm` | Exact code lookup, chapter browsing | < 50 ms |
| Semantic / AI | pgvector cosine similarity on rulings embeddings | "What HTS code for silicone phone cases?" | 100–300 ms |
| Hybrid | FTS pre-filter → vector re-rank | Best-of-both for classification UI | 200–400 ms |

---

## 7. Data Quality and Validation Rules

### 7.1 Ingest-Time Validation Schema

Every pipeline enforces field-level validation before writing to Postgres. Failures write to `pipeline_errors` table and are surfaced in the admin monitoring dashboard.

| Field | Rule | Action on Failure |
|-------|------|------------------|
| `hts_code` | 10 digits, numeric | Reject row, log error |
| `general_rate_pct` | 0 ≤ rate ≤ 999 | Clamp + flag for review |
| `country_code` | ISO 3166-1 alpha-2 | Reject if unknown |
| `carrier_rate_usd` | > 0, < 50,000 | Flag outlier for review |
| `etd` / `eta` | ETA > ETD; both in future | Reject if illogical |
| `exchange_rate` | > 0, within 20% of previous day | Flag large move for review |
| `hts_code` in duty_rates | Must exist in `hts_codes` | Reject (FK integrity) |
| `ruling_number` | Matches pattern `[A-Z]{1,3} [A-Z]\d{6}` | Warn, store anyway |

### 7.2 Cross-Source Consistency Checks

Run nightly after all daily batch jobs complete:

| Check | Query | Alert Threshold |
|-------|-------|----------------|
| HTS codes with no duty rates | `hts_codes LEFT JOIN duty_rates WHERE duty_rates.id IS NULL` | > 500 codes |
| Carrier rates expiring in < 48h | `carrier_rates WHERE valid_until < NOW() + '48h'` | Any result → refresh |
| Schedules with ETD in past and no actual_departure | orphaned schedule rows | > 10 rows |
| Exchange rate gap | Missing rate_date for any trading day | Any gap |
| AD/CVD cross-reference gap | HTS codes flagged is_adcvd but no matching order | > 0 |

### 7.3 Data Freshness SLAs

| Data Type | Max Acceptable Age | Staleness Alert |
|-----------|------------------|----------------|
| Exchange rates | 26 hours | Slack #data-ops alert |
| HTS schedule | 8 days | Admin email |
| Carrier rates (active) | 36 hours | Admin email |
| AD/CVD orders | 10 days | Admin email |
| Federal Register feed | 26 hours | Slack #data-ops alert |
| AIS vessel positions | 30 minutes (Phase 3) | Dashboard warning |

### 7.4 Anomaly Detection Rules

```typescript
// Carrier rate anomaly: > 30% swing from 7-day moving average
const rateAnomaly = (newRate: number, avg7d: number): boolean =>
  Math.abs(newRate - avg7d) / avg7d > 0.30;

// HTS revision anomaly: > 500 codes changed in one revision (unusual)
const revisionAnomaly = (codesModified: number): boolean =>
  codesModified > 500;

// Exchange rate anomaly: > 5% single-day move
const fxAnomaly = (today: number, yesterday: number): boolean =>
  Math.abs(today - yesterday) / yesterday > 0.05;
```

---

## 8. Pipeline Monitoring and Alerting

### 8.1 Monitoring Stack

| Layer | Tool | Scope |
|-------|------|-------|
| Pipeline execution | `pipeline_runs` table + admin dashboard | All batch jobs |
| Real-time errors | Sentry (Next.js integration) | API errors, scraper failures |
| Uptime & latency | Vercel Analytics + custom `/api/health` | API route performance |
| Cache hit rates | Upstash Redis dashboard | L1 cache efficiency |
| DB performance | Neon console + pg_stat_statements | Slow query detection |
| Alerting | Slack webhook → #data-ops channel | Critical pipeline failures |

### 8.2 Health Check Endpoints

```
GET /api/health
  Response: {
    status: 'healthy' | 'degraded' | 'down',
    checks: {
      database: { ok: boolean, latency_ms: number },
      redis: { ok: boolean, latency_ms: number },
      hts_freshness: { ok: boolean, last_updated: string, age_hours: number },
      exchange_rate_freshness: { ok: boolean, last_updated: string },
      carrier_rates_freshness: { ok: boolean, stale_routes: number }
    }
  }

GET /api/health/pipelines
  Response: [{
    pipeline_name: string,
    last_run: string,
    status: string,
    rows_processed: number,
    duration_seconds: number
  }]
```

### 8.3 Alerting Rules

| Trigger | Severity | Channel | Auto-Retry |
|---------|----------|---------|-----------|
| Any pipeline fails 3+ consecutive runs | Critical | Slack DM to admin + email | No — requires investigation |
| Exchange rate gap detected | High | Slack #data-ops | Yes — retry immediately |
| Carrier rate cache miss rate > 50% | High | Slack #data-ops | Yes — trigger background refresh |
| HTS revision published (new version detected) | Info | Slack #data-ops | N/A — triggers sync |
| AD/CVD rate change on active shipment HTS code | High | Email to affected user | N/A |
| Database connection pool exhausted | Critical | PagerDuty (Phase 3) | Yes — exponential backoff |
| Scraper blocked by carrier website | Medium | Slack #data-ops | Yes — rotate user agent, 30 min delay |

### 8.4 Admin Dashboard — Pipeline View

The internal admin panel (`/admin/pipelines`) surfaces:

- Last run time + status for each pipeline
- Row counts (fetched / inserted / updated / skipped / errors)
- Trend chart: pipeline duration over last 30 runs
- Manual trigger button per pipeline
- Error log with full stack traces
- Data freshness indicators per source (green/yellow/red)
- Cache hit rate gauges per data type

---

## 9. Schema Diagrams

### 9.1 Tariff & Duty Entity Relationships

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   hts_codes     │────<│   duty_rates    │>────│  ad_cvd_orders  │
│─────────────────│     │─────────────────│     │─────────────────│
│ hts_code PK     │     │ hts_code FK     │     │ id PK           │
│ description     │     │ country_code    │     │ case_number     │
│ general_rate_pct│     │ effective_rate  │     │ order_type      │
│ chapter         │     │ section_301_rate│     │ country_code    │
│ revision        │     │ ad_cvd_rate     │     │ rate_pct        │
│ is_adcvd        │     │ gsp_eligible    │     │ hts_codes[]     │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         │ 1:many
         ▼
┌─────────────────┐
│ customs_rulings │
│─────────────────│
│ ruling_number PK│
│ hts_code FK     │
│ product_desc    │
│ ruling_text     │
│ embedding vec   │
└─────────────────┘
```

### 9.2 Shipment & Product Entity Relationships

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│     users       │────<│      shipments        │>────│carrier_schedules│
│─────────────────│     │──────────────────────│     │─────────────────│
│ id PK           │     │ id PK (UUID)          │     │ id PK           │
│ email           │     │ user_id FK            │     │ carrier_code    │
│ role            │     │ status                │     │ origin_unlocode │
└─────────────────┘     │ origin_unlocode       │     │ dest_unlocode   │
                        │ dest_unlocode         │     │ etd / eta       │
                        │ carrier_code          │     └─────────────────┘
                        │ is_ftz                │
                        │ ftz_lock_rate_pct     │
                        └──────────┬────────────┘
                                   │ 1:many
                                   ▼
                        ┌──────────────────────┐     ┌─────────────────┐
                        │  shipment_products   │>────│    products     │
                        │──────────────────────│     │─────────────────│
                        │ shipment_id FK        │     │ id PK (UUID)    │
                        │ product_id FK         │     │ user_id FK      │
                        │ hts_code              │     │ name            │
                        │ country_of_origin     │     │ hts_code        │
                        │ quantity              │     │ hts_confidence  │
                        │ unit_cost_usd         │     │ country_of_origin│
                        │ duty_rate_pct         │     │ unit_cost_usd   │
                        │ duty_amount_usd       │     │ is_cold_chain   │
                        └──────────────────────┘     └─────────────────┘
```

### 9.3 Carrier Rate Data Flow

```
Carrier APIs / Scrapers
        │
        ▼
┌───────────────────┐     ┌─────────────────┐
│  carrier_rates    │────<│carrier_schedules│
│───────────────────│     │─────────────────│
│ carrier_code      │     │ carrier_code    │
│ origin_unlocode   │     │ origin_unlocode │
│ dest_unlocode     │     │ dest_unlocode   │
│ container_type    │     │ etd / eta       │
│ base_rate_usd     │     │ vessel_name     │
│ all_in_rate_usd   │     │ transit_days    │
│ surcharges JSONB  │     └─────────────────┘
│ valid_until       │
│ cache_key         │
└─────────┬─────────┘
          │ cache_key lookup
          ▼
┌─────────────────────────────────┐
│  Redis L1 Cache                 │
│  key: carrier_rate:{o}:{d}:{t}  │
│  TTL: 4–24 hours                │
└─────────────────────────────────┘
          │ on miss
          ▼
┌─────────────────────────────────┐
│  Postgres L2 Cache              │
│  carrier_rates WHERE            │
│  fetched_at > NOW() - 24h       │
└─────────────────────────────────┘
          │ on miss
          ▼
     Live Carrier API
```

### 9.4 Pipeline Execution Flow (End-to-End)

```
[Vercel Cron / pg-boss]
        │
        ▼
┌──────────────────┐     fail     ┌──────────────────┐
│  Job Dispatcher  │ ──────────> │  pipeline_errors  │
└────────┬─────────┘              └──────────────────┘
         │ enqueue
         ▼
┌──────────────────┐
│  Worker Process  │
│  - fetch raw     │
│  - validate      │
│  - normalize     │
│  - deduplicate   │
│  - enrich        │
│  - upsert DB     │
│  - invalidate    │
│    Redis cache   │
└────────┬─────────┘
         │ log result
         ▼
┌──────────────────┐
│  pipeline_runs   │
│  (audit log)     │
└────────┬─────────┘
         │ if anomaly
         ▼
┌──────────────────┐
│  Slack #data-ops │
│  alert webhook   │
└──────────────────┘
```

---

## Phase Implementation Timeline

| Phase | Scope | Pipelines Active |
|-------|-------|-----------------|
| **Phase 1 (Current)** | Static JSON files in `/data/` — no live pipelines. Mock data seeds all calculators and HTS lookup. | None |
| **Phase 2** | Real ingestion via batch cron jobs. Government sources (USITC, Federal Register, CBP) go live first (free). Top-3 carrier APIs integrated. Redis cache activated. | HTS weekly, CBP daily, FX daily, Maersk/CMA/Hapag daily |
| **Phase 3** | Real-time pipelines: AIS vessel tracking, port congestion, intraday FX. Full carrier scraper fleet. Railway worker process for long-running jobs. | All Phase 2 + AIS, port congestion, full carrier fleet |

---

*This document supersedes the preliminary pipeline notes in `.planning/prds/DATA-PIPELINE.md` with complete schema definitions, caching strategy, and operational runbooks.*
