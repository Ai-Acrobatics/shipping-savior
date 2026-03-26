# Data Pipeline Design — Shipping Savior Platform

**Linear:** AI-5410
**Phase:** 2 — Architecture & Planning
**Author:** AI Acrobatics Engineering
**Date:** 2026-03-26
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Data Sources Inventory](#2-data-sources-inventory)
3. [Ingestion Layer](#3-ingestion-layer)
4. [Processing Pipeline](#4-processing-pipeline)
5. [Storage Architecture](#5-storage-architecture)
6. [Data Models](#6-data-models)
7. [Transformation Logic](#7-transformation-logic)
8. [Internal API Design](#8-internal-api-design)
9. [Data Quality & Monitoring](#9-data-quality--monitoring)
10. [Compliance & Data Governance](#10-compliance--data-governance)
11. [Failover & Resilience](#11-failover--resilience)
12. [Scaling & Cost Projections](#12-scaling--cost-projections)
13. [Development Phases](#13-development-phases)
14. [Scheduling Matrix](#14-scheduling-matrix)

---

## 1. Executive Summary

Shipping Savior's core value proposition rests on a single premise: aggregate fragmented global logistics data into a unified, queryable intelligence layer that powers accurate calculators, proactive compliance alerts, and AI-driven recommendations. This document defines the complete pipeline from raw data ingestion to serving internal and external consumers.

### Architecture Philosophy

The pipeline is designed in three concentric layers:

```
┌─────────────────────────────────────────────────────┐
│  SERVING LAYER (API routes, search, calculators)    │
├─────────────────────────────────────────────────────┤
│  PROCESSING LAYER (ETL, normalize, enrich, index)   │
├─────────────────────────────────────────────────────┤
│  INGESTION LAYER (connectors, scrapers, schedulers) │
└─────────────────────────────────────────────────────┘
         ↑ 26+ external data sources below
```

**Phase 1 (Mock):** Static JSON files seeded with researched real-world data. No live integrations. Full calculator and AI functionality operates on mock data. This validates UX before committing to integration costs.

**Phase 2 (Batch):** Real data via cron-based scrapers and REST API connectors. 24-hour freshness on critical data. All government sources (free) integrated first.

**Phase 3 (Real-Time):** AIS vessel tracking, port congestion APIs, live carrier schedule polling. Sub-4-hour freshness on operational data.

---

## 2. Data Sources Inventory

### 2.1 Tariff & Duty Data (Priority: P0)

#### 2.1.1 USITC Harmonized Tariff Schedule (HTS)

| Attribute | Value |
|-----------|-------|
| URL | https://hts.usitc.gov/download |
| Format | JSON, CSV, XLS |
| Access | Direct download — no API key |
| Update Frequency | Multiple revisions/year (2026 Rev 4 current) |
| Ingestion Method | Scheduled download |
| Target Freshness | Weekly |
| Storage | PostgreSQL `hts_codes` table |
| Cost | Free (US government, public domain) |

The HTS JSON export is machine-readable and well-structured. Approximately 17,000 HTS code entries at the 10-digit statistical suffix level. Each revision is versioned (e.g., "Revision 4") enabling deterministic change detection by diffing new downloads against stored revision. No HTML scraping required.

**Data volume:** ~17K rows, ~15 MB uncompressed JSON per revision.

---

#### 2.1.2 CBP CROSS Rulings Database

| Attribute | Value |
|-----------|-------|
| URL | https://rulings.cbp.gov/ |
| Format | HTML (scraping) → structured |
| Access | No public API — web scraping |
| Total Records | 220,294+ rulings (March 2026) |
| Update Frequency | ~67 new rulings per batch, multiple times/week |
| Ingestion Method | Scraper (Playwright/Puppeteer or HTTPX) |
| Target Freshness | Daily new rulings; full historical sync in Phase 2 |
| Storage | PostgreSQL `customs_rulings` + pgvector embeddings |
| Cost | Free (public government data) |

The CROSS database is the primary training corpus for the Tariff Classification AI. Each ruling contains: ruling number, date, product description, assigned HTS code(s), and legal reasoning text. The ATLAS benchmark (2025) built a dataset of 18,731 rulings mapped to 2,992 HTS codes — validating the data structure for classification model training.

**Data volume:** ~220K records, ~500 MB structured text. Embeddings at 1536 dimensions (OpenAI text-embedding-3-large) add ~1.6 GB to pgvector table.

---

#### 2.1.3 Section 301 / 201 / 232 Tariff Lists

| Attribute | Value |
|-----------|-------|
| Primary Source | USTR.gov Federal Register notices |
| Format | PDF tariff lists with HTS codes |
| Access | Download + PDF parse |
| Update Frequency | Irregular — executive-order driven |
| Ingestion Method | Federal Register API trigger + PDF extraction |
| Target Freshness | <24 hours after Federal Register publication |
| Storage | PostgreSQL `tariff_changes` table |
| Cost | Free |

Current Section 301 status (as of March 2026): Multiple rounds of modifications on China goods. September 2024 USTR modifications increased duties on 14 strategic sectors. Pipeline must track effective-date logic (some rates phase in over multiple years).

**Data volume:** ~500 active HTS code entries with special duty rates.

---

#### 2.1.4 Anti-Dumping / Countervailing Duty (AD/CVD) Orders

| Attribute | Value |
|-----------|-------|
| URL | https://trade.cbp.dhs.gov/ace/adcvd/adcvd-public/ |
| Supplementary | https://access.trade.gov/ADCVD_Search.aspx |
| Format | HTML (scraping) |
| Access | Web scraping — no bulk download API |
| Update Frequency | Ongoing — new orders and rate changes weekly |
| Ingestion Method | Chapter-by-chapter systematic scraper |
| Target Freshness | Weekly |
| Storage | PostgreSQL `ad_cvd_orders` table |
| Cost | Free |

Critical for SE Asia cold chain imports — many food and consumer product categories are subject to AD/CVD orders. Every import's HTS code must be cross-referenced against this database automatically. AD rates can exceed 200% of product value in some categories.

---

#### 2.1.5 Federal Register — Trade Policy Feed

| Attribute | Value |
|-----------|-------|
| URL | https://www.federalregister.gov/ |
| API | https://www.federalregister.gov/developers/documentation/api/v1 |
| Format | JSON (documented REST API) |
| Access | Free, no API key required |
| Update Frequency | Daily (business days) |
| Ingestion Method | Daily cron polling relevant agency codes |
| Target Freshness | <24 hours |
| Storage | PostgreSQL `regulatory_notices` table |
| Cost | Free |

This is the authoritative trigger for all tariff changes. Relevant agencies: CBP (Customs & Border Protection), USTR, ITA (International Trade Administration), USITC, FDA, USDA APHIS. Filter by document type (rule, proposed rule, notice) and full-text keyword matching for trade-relevant content.

---

### 2.2 Carrier & Vessel Data (Priority: P0–P2)

#### 2.2.1 Maersk Schedule API

| Attribute | Value |
|-----------|-------|
| Portal | https://developer.maersk.com/ |
| Format | REST API / JSON |
| Access | Self-service portal registration |
| APIs Available | Point-to-Point Schedules, Track & Trace, Vessel Schedules |
| DCSA Compliant | Yes |
| Update Frequency | Near real-time |
| Target Freshness | Daily (Phase 2), Hourly (Phase 3) |
| Cost | Currently free; paid tiers may be introduced |

---

#### 2.2.2 CMA CGM API

| Attribute | Value |
|-----------|-------|
| Portal | https://api-portal.cma-cgm.com/ |
| Format | REST API / JSON |
| Access | Web account registration required |
| APIs Available | Schedules, booking, tracking, demurrage tariffs |
| DCSA Compliant | Yes |
| Update Frequency | Daily schedule updates |
| Target Freshness | Daily |
| Cost | Free tier available |

---

#### 2.2.3 Hapag-Lloyd API

| Attribute | Value |
|-----------|-------|
| Portal | https://api-portal.hlag.com/ |
| Format | REST API / JSON |
| Access | Account registration |
| APIs Available | Route options, tracking, transport events |
| DCSA Compliant | Yes |
| Update Frequency | Daily |
| Target Freshness | Daily |
| Cost | Free |

---

#### 2.2.4 MSC (via DCSA Commercial Schedules API)

| Attribute | Value |
|-----------|-------|
| Standard | DCSA Commercial Schedules API v1 |
| Format | REST API / JSON (DCSA OpenAPI spec) |
| Access | DCSA consortium membership or carrier portal |
| DCSA Compliant | Yes (adopted mid-2025) |
| Update Frequency | Daily |
| Cost | TBD — contact MSC |

---

#### 2.2.5 Non-API Carriers (Evergreen, ONE, Yang Ming, COSCO)

| Carrier | URL | Method |
|---------|-----|--------|
| Evergreen | https://ss.shipmentlink.com/ | Web scraping (ShipmentLink) |
| ONE | One-line.com schedule search | Web scraping |
| Yang Ming | yanmingusa.com | Web scraping |
| COSCO | cop.lines.coscoshipping.com | Web portal + partial scraping |

Scraper approach: Use Playwright for schedule search forms. Input standard origin/destination port pairs covering Blake's key trade lanes (SE Asia → US West Coast, Costa Rica → US East Coast). Parse tabular results into the standard carrier schedule schema.

**Alternative:** JSONCargo (https://jsoncargo.com/) provides a unified API covering 95%+ of shipping lines. Evaluate as a paid aggregator to avoid maintaining 4+ individual scrapers. Estimated cost: ~$200-500/month at production volumes.

---

#### 2.2.6 AIS Vessel Tracking

| Provider | Access Method | Pricing | Coverage |
|----------|--------------|---------|----------|
| AISHub | Free (contribute AIS data to receive) | Free | Terrestrial only |
| Datalastic | REST API | 199–679 EUR/month | Global + satellite |
| VesselFinder | REST API (credit-based) | Per-position | Global |
| MarineTraffic | REST API (enterprise) | Contact sales | Global — gold standard |

**Phase 2 strategy:** Start with AISHub free tier. Scrape VesselFinder web interface for specific vessels.
**Phase 3 strategy:** Upgrade to Datalastic Starter (199 EUR/month) for reliable satellite AIS on Blake's active shipments.

Fields captured per vessel update: MMSI, vessel name, IMO, lat/lng, speed over ground, heading, destination port, ETA, timestamp.

---

### 2.3 Port & Terminal Data (Priority: P1)

#### 2.3.1 US Port Statistics (MARAD / Army Corps)

| Source | URL | Data | Frequency |
|--------|-----|------|-----------|
| MARAD | https://www.maritime.dot.gov/data-reports/ports | Port performance, vessel calls, cargo throughput | Annual/periodic |
| Army Corps WCSC | https://ndc.ops.usace.army.mil/wcsc/webpub/ | Waterborne commerce, vessel trips, tonnage | Annual |

Free government data. Used for baseline port capacity and throughput benchmarking. Not real-time.

---

#### 2.3.2 Port Congestion (Real-Time — Phase 3)

| Provider | Data | Pricing |
|----------|------|---------|
| Portcast | 1,000+ ports — vessels berthed/waiting, dwell times, congestion score | Contact sales |
| GoComet | 45K+ containers tracked, real-time geofencing + container events | Contact sales |
| Vizion TradeView | Real-time port metrics, container dwell trends | Contact sales |
| BTS Freight Indicators | Government freight flow indicators | Free |

**Phase 2 fallback:** BTS Freight Indicators (free, monthly data). Build congestion model from AIS clustering (vessels anchored near port = congestion signal).

---

#### 2.3.3 Demurrage & Detention Tariffs

| Source | URL | Method | Frequency |
|--------|-----|--------|-----------|
| CMA CGM | https://www.cma-cgm.com/ebusiness/tariffs/demurrage-detention | Scrape | Monthly |
| Maersk | developer.maersk.com tariff APIs | API | Monthly |
| Hapag-Lloyd | API portal — tariff endpoints | API | Monthly |
| ONE Line | one-line.com demurrage pages | Scrape | Monthly |

Current industry rates (2026): Import detention $185–$285/day (ONE Line). Average $150–$300/day demurrage, $100–$250/day detention. Rates increased 12–18% YoY. FMC mandates minimum 10 free-time days for imports.

---

### 2.4 Trade Intelligence Data (Priority: P1–P2)

#### 2.4.1 Census Bureau Foreign Trade API

| Attribute | Value |
|-----------|-------|
| URL | https://www.census.gov/data/developers/data-sets/international-trade.html |
| Format | REST API / JSON |
| Access | Free API key |
| Data | US imports/exports by HS code, country, NAICS, end-use |
| Coverage | Monthly data from 2013+, annual from 2005+ |
| Ingestion Method | Monthly cron + historical backfill |
| Cost | Free |

---

#### 2.4.2 UN Comtrade

| Attribute | Value |
|-----------|-------|
| URL | https://comtrade.un.org/ |
| Format | REST API / JSON |
| Access | Free tier + premium for bulk |
| Data | International trade flows, 200+ countries, since 1962 |
| Library | `comtradeapicall` Python package |
| Cost | Free tier: limited requests/day; Premium: $500+/year |

---

#### 2.4.3 Bill of Lading Databases

| Provider | Coverage | Access | Cost |
|----------|----------|--------|------|
| ImportGenius | US customs BOL records, multi-continent | Self-service subscription | ~$200–300/month |
| Panjiva (S&P Global) | 2B+ shipment records, 22 customs sources | Enterprise contract | $5,000+/year |
| CBP FOIA Data | US imports post-FOIA processing | FOIA request | Free (slow, 3–6 months) |

US bill of lading data is public record under FOIA. ImportGenius and Panjiva are value-added aggregators. **Phase 2:** Use CBP FOIA for historical baseline. **Phase 3:** Integrate ImportGenius for competitive intelligence features.

---

### 2.5 FTZ Data (Priority: P1)

#### 2.5.1 OFIS (Online FTZ Information System)

| Attribute | Value |
|-----------|-------|
| URL | https://ofis.trade.gov/ |
| data.gov | https://catalog.data.gov/dataset/online-ftz-information-system-ofis |
| Data | All 260+ FTZ zones, subzones, sites, grantee contacts, Federal Register notices 1980-present |
| Format | Downloadable dataset + web search |
| Ingestion | Download + supplement with web scraping |
| Frequency | Monthly refresh |
| Cost | Free |

---

### 2.6 Regulatory & Compliance Data (Priority: P0 for Cold Chain)

#### 2.6.1 FDA Import Alerts

| Attribute | Value |
|-----------|-------|
| URL | https://www.fda.gov/industry/actions-enforcement/import-alerts |
| API | https://open.fda.gov/apis/food/enforcement/ |
| Format | REST API (openFDA) + web scraping for alerts not in API |
| Data | Active import alerts by product/country, DWPE (detention without physical examination) |
| Ingestion | Daily cron |
| Target Freshness | <24 hours |
| Cost | Free |

**Critical for Blake's cold chain business.** FDA import alerts are the primary compliance risk for food imports from SE Asia. Detained shipments face immediate financial impact. The platform must cross-reference every planned shipment against active alerts.

---

#### 2.6.2 USDA APHIS (Phytosanitary Requirements)

| Attribute | Value |
|-----------|-------|
| URL | https://www.aphis.usda.gov/plant-imports |
| Databases | ACIR (Agricultural Commodity Import Requirements), FAVIR (Fruits and Vegetables Import Requirements) |
| Format | Web scraping (no public API found) |
| Data | Treatments, inspection schedules, prohibited items by country/commodity |
| Ingestion | Weekly Playwright scraper |
| Cost | Free |

---

#### 2.6.3 CBP CSMS (Cargo Systems Messaging Service)

| Attribute | Value |
|-----------|-------|
| URL | https://www.cbp.gov/trade/automated/cargo-systems-messaging-service |
| Archive | https://www.cbp.gov/document/guidance/csms-archive |
| Format | Email subscription + web archive |
| Data | ACE system updates, filing requirement changes, trade partner notifications |
| Ingestion | Email parsing (inbound webhook) + web scrape archive |
| Frequency | Daily |
| Cost | Free |

---

### 2.7 Weather & Environmental Data (Priority: P3)

| Source | URL | Data | Cost |
|--------|-----|------|------|
| NOAA Weather API | https://api.weather.gov/ | Marine weather forecasts, storm tracking | Free |
| OpenWeatherMap | https://openweathermap.org/api | Marine layer, wind, waves | Free tier + paid |
| Stormglass | https://stormglass.io/ | Ocean weather, wave height, swell | $29+/month |

Used by the Route Optimization Agent to flag weather disruption risk on candidate routes. Phase 3 feature.

---

### 2.8 World Bank Logistics Data (Priority: P2)

| Source | URL | Data | Cost |
|--------|-----|------|------|
| World Bank LPI | https://lpi.worldbank.org/ | Logistics Performance Index by country | Free |
| World Bank Open Data | https://data.worldbank.org/ | GDP, trade facilitation metrics | Free |
| WITS | https://wits.worldbank.org/ | Trade data, tariffs, NTMs | Free |

Used for country-level risk scoring in the Route Optimization and FTZ Strategy agents.

---

## 3. Ingestion Layer

### 3.1 Connector Architecture

All connectors are isolated microservices (Node.js workers or Python scripts) that run on schedule via cron. Each connector is responsible for a single data source and outputs to a standardized staging table before validation.

```
┌─────────────────────────────────────────────────────────────────┐
│                     INGESTION ORCHESTRATOR                       │
│              (node-cron / GitHub Actions / Railway Jobs)         │
└────────┬───────────────────────────────────────────────────────-┘
         │  Triggers on schedule or Federal Register webhook
         │
    ┌────▼───────────────────────────────────────────────────┐
    │              CONNECTOR POOL (parallel workers)          │
    │                                                         │
    │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
    │  │ HTSConnector │  │ CrossScraper │  │ FedRegPoll  │  │
    │  │ (download)   │  │ (Playwright) │  │ (REST API)  │  │
    │  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘  │
    │         │                 │                  │         │
    │  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼──────┐  │
    │  │ CarrierAPIs  │  │ AISConnector │  │ FDAAlert    │  │
    │  │ (Maersk/CMA) │  │ (AISHub/API) │  │ (openFDA)   │  │
    │  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘  │
    │         │                 │                  │         │
    └─────────┼─────────────────┼──────────────────┼─────────┘
              │                 │                  │
              └─────────────────▼──────────────────┘
                         STAGING TABLES
                    (raw_ingestion_log, raw_*_staging)
```

### 3.2 Connector Types

#### Type A: REST API Connectors

Used for: Federal Register, Census Bureau, openFDA, Maersk, CMA CGM, Hapag-Lloyd, AIS providers.

```typescript
// Connector interface
interface ApiConnector {
  sourceId: string;           // e.g., "federal_register"
  baseUrl: string;
  authType: "none" | "apiKey" | "oauth2" | "bearerToken";
  rateLimitRpm: number;       // requests per minute ceiling
  retryConfig: RetryConfig;   // exponential backoff settings

  fetch(params: FetchParams): Promise<RawRecord[]>;
  validate(raw: RawRecord): ValidationResult;
  transform(raw: RawRecord): StagingRecord;
}

interface RetryConfig {
  maxAttempts: number;        // default: 3
  baseDelayMs: number;        // default: 1000
  maxDelayMs: number;         // default: 30000
  backoffMultiplier: number;  // default: 2
}
```

#### Type B: Web Scrapers

Used for: CROSS rulings, CBP AD/CVD database, USDA APHIS, carrier demurrage pages, Evergreen/ONE schedules.

**Technology stack:** Playwright (TypeScript) for JavaScript-rendered pages; HTTPX + BeautifulSoup (Python) for static HTML. Scrapers run in isolated browser contexts with randomized user agents and request throttling (1–3 second delays between requests).

```typescript
interface ScraperConnector {
  sourceId: string;
  targetUrl: string;
  renderJs: boolean;          // true for SPA-rendered content
  sessionPersist: boolean;    // maintain login session
  throttleMs: [number, number]; // min/max delay between requests

  navigate(page: Page): Promise<void>;
  extractRecords(page: Page): Promise<RawRecord[]>;
  handlePagination(page: Page): Promise<boolean>; // returns false when done
}
```

#### Type C: File Download Connectors

Used for: HTS Schedule JSON, OFIS/FTZ bulk datasets, Army Corps WCSC annual data.

```typescript
interface DownloadConnector {
  sourceId: string;
  downloadUrl: string;
  format: "json" | "csv" | "xls" | "pdf";
  checksumVerify: boolean;

  download(): Promise<Buffer>;
  parse(buffer: Buffer): Promise<RawRecord[]>;
  detectChanges(newData: RawRecord[], stored: RawRecord[]): ChangeReport;
}
```

#### Type D: Email Parser

Used for: CBP CSMS messages.

Inbound email webhook (via Postmark or SendGrid inbound parse) receives CSMS subscription emails. Parser extracts: message date, subject, CSMS number, body text, affected systems, effective dates.

### 3.3 Scraping Strategy Details

**CROSS Rulings (220K+ records, Phase 2 full sync):**

Full historical sync is a one-time operation — estimate 3–5 days of gentle scraping at 1 request/3 seconds to avoid rate limiting. Thereafter, daily incremental scraping picks up new rulings by querying with `date >= yesterday`.

Scraping approach:
1. Query search endpoint with date range
2. Parse result list for ruling numbers
3. Fetch individual ruling detail pages
4. Extract structured fields via CSS selectors
5. Store raw HTML to S3 for replay/reprocessing
6. Parse into `customs_rulings` table

**CBP AD/CVD (chapter-by-chapter, ~99 HTS chapters):**

Systematic scrape: loop chapters 01–99, query AD/CVD database per chapter, paginate through results. Estimated 2,000–5,000 active orders. Run weekly. Track `last_seen_date` to detect orders that disappear (expired/revoked).

**Carrier Schedule Scrapers:**

For Evergreen and ONE (no API): Playwright clicks through schedule search forms with pre-defined origin/destination port pairs covering Blake's key trade lanes:
- Shanghai (CNSHA) → Los Angeles (USLAX)
- Shanghai (CNSHA) → Long Beach (USLGB)
- Bangkok (THBKK) → Los Angeles (USLAX)
- San José (CRSJR) → Miami (USMIA)
- San José (CRSJR) → Houston (USHOU)

Results parsed into the standard `carrier_schedules` schema.

### 3.4 Data Frequency Matrix

| Source | Phase 1 | Phase 2 | Phase 3 |
|--------|---------|---------|---------|
| HTS Schedule | Static JSON | Weekly download | Weekly download |
| CROSS Rulings | Sample (~500 records) | Daily incremental | Daily incremental |
| Federal Register | Static JSON | Daily poll | Daily poll |
| Section 301 Lists | Static JSON | FR-triggered | FR-triggered |
| AD/CVD Orders | Static JSON | Weekly scrape | Weekly scrape |
| Maersk API | Static JSON | Daily | Hourly |
| CMA CGM API | Static JSON | Daily | Hourly |
| Hapag-Lloyd API | Static JSON | Daily | Hourly |
| Carrier Scrapers | Static JSON | Daily | Daily |
| AIS Vessel Tracking | None | Daily snapshot | Real-time (15 min) |
| Port Congestion | None | Daily aggregate | 4-hour updates |
| Census Trade Stats | Static JSON | Monthly | Monthly |
| UN Comtrade | None | Monthly | Monthly |
| FTZ/OFIS Data | Static JSON | Monthly | Monthly |
| FDA Import Alerts | Static JSON | Daily | Daily |
| USDA APHIS | Static JSON | Weekly | Weekly |
| CSMS Messages | None | Daily email parse | Daily email parse |
| Demurrage Tariffs | Static JSON | Monthly scrape | Monthly scrape |
| Weather (NOAA) | None | None | 6-hour marine forecast |
| World Bank LPI | Static JSON | Annual | Annual |

---

## 4. Processing Pipeline

### 4.1 ETL Workflow Overview

```
EXTRACT                   TRANSFORM                    LOAD
────────                  ─────────                    ────
Raw data pulled      →    Validate schema         →    Staging tables
from source               Normalize values             (raw_*)
                          Deduplicate records
                          Enrich with lookups
                          Compute derived fields
                                ↓
                          Quality gate check
                          (reject if critical fields
                          missing or out of bounds)
                                ↓
                          Upsert to production
                          tables with versioning
                                ↓
                          Invalidate cache
                          (Redis TTL reset)
                                ↓
                          Update search index
                          (Typesense re-index)
                                ↓
                          Trigger downstream
                          alerts (compliance monitor)
```

### 4.2 Staging → Production Flow

Every connector writes to a source-specific staging table first:

```sql
-- Example staging table pattern
CREATE TABLE raw_hts_staging (
  id          SERIAL PRIMARY KEY,
  ingested_at TIMESTAMPTZ DEFAULT now(),
  source_id   TEXT NOT NULL,          -- "usitc_hts"
  batch_id    UUID NOT NULL,          -- groups all records from one ingestion run
  raw_json    JSONB NOT NULL,         -- original API response
  status      TEXT DEFAULT 'pending', -- pending → validated → loaded → failed
  error_msg   TEXT
);
```

A separate validation worker reads from staging, applies schema validation and business rules, then upserts to production tables. Failed records are flagged for human review in the ops dashboard.

### 4.3 Deduplication Strategy

**HTS codes:** Deduplicate by `(hts_code, effective_date, revision_number)`. If a code exists at the same revision, skip (idempotent). If revision number is newer, create a new version record and mark the old one as `superseded`.

**CROSS Rulings:** Deduplicate by `ruling_number`. Rulings are immutable once published — a ruling with an existing number is always a duplicate. Skip silently.

**Carrier Schedules:** Deduplicate by `(carrier, service_code, vessel_name, voyage_number, origin_port, dest_port, departure_date)`. Update `arrival_date` and `transit_days` if changed (schedules can shift).

**AD/CVD Orders:** Deduplicate by `case_number`. Flag updates when duty rates change within the same case number.

**Vessel Positions:** No deduplication — time-series append. Compress positions older than 90 days to hourly averages.

### 4.4 Enrichment Pipeline

After basic normalization, enrichment adds computed fields that join across tables:

```
Raw carrier schedule record
  → Enrich with port data (lat/lng, timezone, country from ports table)
  → Compute: transit_days (if not provided by carrier)
  → Enrich: port congestion score (join on port_code + date)
  → Compute: reliability_score (historical on-time % from past shipments)
  → Enrich: weather risk flag (NOAA marine forecast for route, Phase 3)
  → Output: enriched carrier schedule record
```

```
Raw HTS code record
  → Enrich with tariff_changes (join on hts_code)
  → Enrich with ad_cvd_orders (join on hts_code)
  → Compute: effective_total_duty (general + section_301 + ad_cvd if applicable)
  → Enrich with trade_statistics (import volume, country distribution)
  → Output: enriched HTS record
```

### 4.5 PDF Extraction Pipeline (Section 301 Lists, AD/CVD Notices)

Federal Register and USTR publish tariff lists as PDFs. Extraction pipeline:

1. Download PDF to S3 raw bucket
2. OCR with `pdf-parse` (Node.js) or `pdfplumber` (Python)
3. Pass extracted text to Claude API with extraction prompt:
   ```
   Extract all HTS code entries from this Federal Register notice.
   For each entry return: hts_code, description, duty_rate, effective_date, action_type.
   If the HTS code is partial (e.g., chapter-level), expand to all 10-digit codes in that chapter.
   ```
4. Validate Claude output against known HTS code format (regex: `^\d{4}\.\d{2}\.\d{4}$`)
5. Human review queue for any entries with confidence < 0.8
6. Load validated entries to `tariff_changes` table

---

## 5. Storage Architecture

### 5.1 Overview

```
┌───────────────────────────────────────────────────────────┐
│                    STORAGE LAYERS                          │
│                                                           │
│  HOT (ms latency)    WARM (s latency)   COLD (min latency)│
│  ─────────────────   ──────────────     ───────────────── │
│  Redis Cache         PostgreSQL         S3 Raw Archive     │
│  - Calculator        - All production   - Raw API responses│
│    results           tables             - Downloaded PDFs  │
│  - Search results    - Staging tables   - Historical       │
│  - Rate lookups      - Vector store       snapshots        │
│  - Session data        (pgvector)       - Backup dumps     │
│                      Typesense          - Audit logs       │
│                      - HTS search                         │
│                      - Port search                        │
│                      - Route search                       │
└───────────────────────────────────────────────────────────┘
```

### 5.2 PostgreSQL (Primary Structured Store)

**Provider:** Neon (serverless Postgres) — consistent with Hafnia Financial stack. Neon's branching feature enables production-safe schema migrations.

**Extensions required:**
```sql
CREATE EXTENSION IF NOT EXISTS pgvector;     -- vector embeddings for semantic search
CREATE EXTENSION IF NOT EXISTS pg_trgm;      -- trigram fuzzy text search
CREATE EXTENSION IF NOT EXISTS timescaledb;  -- time-series for vessel positions (optional)
CREATE EXTENSION IF NOT EXISTS uuid-ossp;    -- UUID generation
```

**Connection pooling:** PgBouncer via Neon's built-in pooler. Target: 20 connections max per Vercel function instance.

**Estimated database size at Phase 2 steady state:**
- HTS codes: ~10 MB
- CROSS rulings (text): ~500 MB
- CROSS rulings (pgvector embeddings): ~1.6 GB
- Carrier schedules (90-day rolling): ~200 MB
- Trade statistics: ~2 GB
- Regulatory notices: ~500 MB
- All other tables: ~300 MB
- **Total: ~5.1 GB** — well within Neon's free tier limits (~0.5 GB) at Phase 1; upgrade to Launch plan ($19/month) for Phase 2.

### 5.3 S3 Raw Archive (AWS or Cloudflare R2)

**Purpose:** Store every raw response before parsing. This enables:
- Replay/reprocess when parsing logic changes
- Audit trail for regulatory data
- Debugging parser failures
- Historical snapshots for trend analysis

**Structure:**
```
s3://shipping-savior-raw/
├── hts/
│   ├── 2026-03-26-revision-4.json        # Weekly HTS downloads
│   ├── 2026-03-19-revision-3.json
│   └── ...
├── cross-rulings/
│   ├── 2026-03-26/
│   │   ├── H123456789.html               # Individual ruling HTML
│   │   └── H123456790.html
│   └── ...
├── carrier-schedules/
│   ├── maersk/
│   │   └── 2026-03-26T06:00:00Z.json
│   └── cma-cgm/
│       └── ...
├── regulatory-notices/
│   ├── federal-register/
│   └── csms/
└── tariff-pdfs/
    ├── section-301/
    └── ad-cvd/
```

**Provider choice:** Cloudflare R2 preferred (zero egress cost — important for frequent reads during enrichment pipeline). AWS S3 Standard as fallback.

**Estimated storage:** ~50 GB at Phase 2 (growing ~5 GB/month with daily snapshots). R2 cost: ~$0.75/month.

### 5.4 Redis Cache

**Provider:** Upstash Redis (serverless, per-request pricing — ideal for Vercel).

**Cache strategy: Cache-Aside pattern.** The application checks Redis first; on miss, queries PostgreSQL and stores result in Redis with TTL.

**Cache key patterns and TTLs:**

| Cache Key Pattern | TTL | Description |
|-------------------|-----|-------------|
| `hts:{code}` | 24h | Individual HTS code lookup |
| `hts:search:{query_hash}` | 1h | HTS search results |
| `tariff:effective:{hts}:{country}` | 24h | Total effective duty rate |
| `carrier:schedules:{origin}:{dest}:{date}` | 4h | Schedule query results |
| `port:{code}:congestion` | 4h | Port congestion score |
| `vessel:{mmsi}:position` | 15min | Current vessel position |
| `calc:landed:{hash}` | 30min | Calculator result |
| `ftz:zones:{state}` | 24h | FTZ zones by state |
| `fda:alerts:{product}:{country}` | 12h | FDA import alert lookup |

**Cache invalidation triggers:**
- HTS rate change detected → invalidate all `hts:*` and `tariff:effective:*` keys
- Carrier schedule update → invalidate `carrier:schedules:*` keys for affected ports
- New AD/CVD order → invalidate `tariff:effective:*` for affected HTS codes

**Estimated Upstash cost:** ~$10/month at Phase 2 volumes (10K–50K requests/day).

### 5.5 Typesense (Search Index)

**Provider:** Typesense Cloud (managed) or self-hosted on Railway.

**Collections indexed:**

```
hts_codes_index:
  - fields: code, description, section, chapter, heading
  - searchable: description (weighted 3x), code (weighted 1x)
  - filterable: section, chapter, has_301_duty, has_adcvd

ports_index:
  - fields: code, name, country, region, lat, lng
  - searchable: name, code

carrier_routes_index:
  - fields: carrier, origin_port, dest_port, service_name, transit_days
  - filterable: carrier, transit_days range

customs_rulings_index:
  - fields: ruling_number, product_description, hts_codes, date
  - searchable: product_description
  - filterable: hts_codes, date range
```

**Update frequency:** Near real-time via pipeline hooks — Typesense re-indexes records within 30 seconds of PostgreSQL upsert.

---

## 6. Data Models

### 6.1 Shipment Schema

```typescript
interface Shipment {
  id: string;                         // UUID
  clientId: string;                   // Foreign key to clients table
  referenceNumber: string;            // Blake's internal reference
  status: ShipmentStatus;             // enum: planned | in_transit | at_port | in_ftz | delivered

  // Cargo
  cargoType: "cold_chain" | "general" | "hazmat";
  products: ShipmentProduct[];        // see below
  containerType: "20GP" | "40GP" | "40HC" | "45HC" | "20RF" | "40RF"; // RF = reefer
  containerCount: number;
  totalWeightKg: number;
  totalVolumeM3: number;

  // Origin
  originCountry: string;              // ISO 3166-1 alpha-2
  originPort: string;                 // UN/LOCODE
  originAddress?: string;

  // Destination
  destCountry: string;
  destPort: string;                   // UN/LOCODE
  destFtzZone?: string;               // FTZ zone number if applicable
  destWarehouse?: string;

  // Routing
  carrierId: string;
  voyageId?: string;
  transshipmentPorts: string[];       // UN/LOCODEs

  // Dates
  etd: Date;                          // estimated time of departure
  eta: Date;                          // estimated time of arrival
  actualDeparture?: Date;
  actualArrival?: Date;
  ftzEntryDate?: Date;

  // Costs
  freightCost: Money;
  dutyEstimate: Money;
  landedCostEstimate: Money;
  actualLandedCost?: Money;           // populated post-delivery

  // Compliance
  isfFilingDate?: Date;
  customsEntryNumber?: string;
  fdaExamRequired: boolean;
  adCvdFlag: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

interface ShipmentProduct {
  description: string;
  htsCode: string;                    // 10-digit
  htsSuffixNote?: string;
  quantity: number;
  unitOfMeasure: string;
  unitCostUSD: number;
  countryOfOrigin: string;
  adCvdCaseNumbers: string[];        // applicable AD/CVD cases
  section301Applicable: boolean;
  effectiveDutyRate: number;          // percentage (total of all applicable duties)
}

type ShipmentStatus =
  | "planned"
  | "booking_confirmed"
  | "cargo_loaded"
  | "in_transit"
  | "transshipment"
  | "at_port"
  | "customs_hold"
  | "in_ftz"
  | "ftz_withdrawal"
  | "delivered";

interface Money {
  amount: number;
  currency: string;                   // ISO 4217 (USD, EUR, etc.)
}
```

### 6.2 Carrier Rate Schema

```typescript
interface CarrierSchedule {
  id: string;
  carrierId: string;                  // e.g., "MAEU" (Maersk SCAC code)
  carrierName: string;
  serviceCode: string;                // e.g., "AX1" (Maersk service name)
  vesselName: string;
  voyageNumber: string;

  // Route
  originPort: string;                 // UN/LOCODE
  destPort: string;                   // UN/LOCODE
  transshipmentPorts: string[];       // empty for direct service

  // Schedule
  departureDate: Date;
  arrivalDate: Date;
  transitDays: number;
  cutoffDate: Date;                   // cargo cutoff (typically 3-4 days before ETD)

  // Equipment
  containerTypes: ContainerType[];    // what this service carries
  reeferCapable: boolean;

  // Data provenance
  source: "api" | "scraper" | "manual";
  sourceCarrierId: string;            // carrier's internal voyage ID
  lastVerified: Date;
  validUntil: Date;
}

interface CarrierRate {
  id: string;
  scheduleId: string;                 // links to CarrierSchedule
  carrierId: string;

  // Pricing
  baseRateUSD: number;               // per container
  containerType: ContainerType;

  // Surcharges
  bafUSD: number;                    // Bunker Adjustment Factor
  eafUSD: number;                    // Emergency Action Factor
  cafUSD: number;                    // Currency Adjustment Factor
  psscUSD: number;                   // Peak Season Surcharge (if applicable)
  warRiskUSD: number;                // War risk surcharge (if applicable)

  totalRateUSD: number;              // computed: base + all surcharges

  // Validity
  effectiveDate: Date;
  expiryDate: Date;

  // Data provenance
  source: "api" | "quote" | "tariff_page" | "manual";
  lastUpdated: Date;
}
```

### 6.3 Tariff / HTS Schema

```typescript
interface HtsCode {
  id: string;

  // Code hierarchy
  code: string;                       // 10-digit: e.g., "0801.32.0000"
  chapter: string;                    // 2-digit: "08"
  heading: string;                    // 4-digit: "0801"
  subheading: string;                 // 6-digit: "0801.32"
  statisticalSuffix: string;          // last 4 digits: "0000"

  // Description
  description: string;
  parentCode?: string;                // hierarchical parent
  indentLevel: number;                // 0-8, higher = more specific

  // Duty rates
  generalDutyRate: string;            // stored as string — can be "Free", "6.5%", "$0.25/kg"
  generalDutyRateNumeric?: number;    // parsed numeric value (null if non-ad-valorem)
  dutyType: "ad_valorem" | "specific" | "compound" | "free" | "complex";

  // Special programs (embedded in HTS schedule)
  specialRates: HtsSpecialRate[];

  // Additional duties (from separate sources)
  section301Rate?: number;            // percentage
  section301Applicable: boolean;
  adCvdApplicable: boolean;
  adCvdCases: string[];              // case numbers

  // Effective total duty
  effectiveDutyRateByCountry: Record<string, number>; // ISO country code → total %

  // Metadata
  unitOfQuantity: string;             // e.g., "No." (number), "kg", "m2"
  revisionNumber: string;             // HTS revision (e.g., "Revision 4")
  effectiveDate: Date;
  supersededBy?: string;              // if this entry was replaced
  active: boolean;
}

interface HtsSpecialRate {
  programCode: string;               // e.g., "CA" (USMCA), "P" (GSP)
  programName: string;
  dutyRate: string;
  conditions?: string;               // rules of origin, etc.
}

interface TariffChange {
  id: string;
  htsCode: string;

  // Change details
  changeType: "section_301" | "ad_cvd" | "trade_agreement" | "general" | "ftz_rates";
  affectedCountries: string[];        // which origin countries affected

  // Rate change
  previousRate?: number;
  newRate: number;
  rateUnit: "percent" | "per_unit";

  // Legal basis
  federalRegisterCitation: string;
  effectiveDate: Date;

  // Status
  status: "proposed" | "interim" | "final" | "revoked";

  // Metadata
  sourceUrl: string;
  parsedAt: Date;
}
```

### 6.4 Port Schedule Schema

```typescript
interface Port {
  id: string;
  locode: string;                     // UN/LOCODE — primary identifier
  name: string;
  alternateNames: string[];
  country: string;                    // ISO 3166-1 alpha-2
  region: string;                     // state/province

  // Geospatial
  lat: number;
  lng: number;
  timezoneTz: string;                 // IANA timezone identifier

  // Port type
  portType: ("container" | "bulk" | "ro-ro" | "tanker")[];
  isTransshipmentHub: boolean;
  majorHubs: string[];                // nearest major transshipment ports

  // Infrastructure
  maxVesselDraftM: number;
  maxVesselLengthM: number;
  terminalCount: number;

  // Connectivity
  railConnected: boolean;
  nearestAirportCode: string;
  ftzZones: string[];                 // FTZ zone numbers near this port
}

interface PortCongestion {
  id: string;
  portLocode: string;
  measuredAt: Date;

  // Vessel metrics
  vesselsAtBerth: number;
  vesselsAtAnchor: number;
  avgWaitTimeHours: number;
  avgDwellTimeDays: number;

  // Computed
  congestionScore: number;            // 0-100 composite score
  congestionLevel: "low" | "moderate" | "high" | "critical";

  // Source
  dataSource: "portcast" | "ais_derived" | "bts" | "manual";
}

interface TerminalSchedule {
  id: string;
  portLocode: string;
  terminalCode: string;
  terminalName: string;
  operatedBy: string;

  // Gate hours (stored as weekly schedule)
  gateHours: {
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;  // 0 = Sunday
    openTime: string;                  // "06:00"
    closeTime: string;                 // "18:00"
    closed: boolean;
  }[];

  // Chassis pools
  chassisPools: string[];              // pool names: "DCLI", "TRAC", "Flexi-Van"

  // Free time and D&D
  importFreeTimeDays: number;          // typically 10 per FMC minimum
  exportFreeTImeDays: number;
  demurrageSchedule: DemurrageSchedule;

  lastUpdated: Date;
}

interface DemurrageSchedule {
  carrierId: string;
  containerType: ContainerType;
  tiers: {
    dayStart: number;
    dayEnd: number | null;             // null = open-ended (e.g., "Day 11+")
    rateUSD: number;
  }[];
  effectiveDate: Date;
}
```

---

## 7. Transformation Logic

### 7.1 Currency Normalization

All monetary values are stored in USD. Conversion pipeline:

1. Store original value + original currency on receipt
2. On ingestion, look up exchange rate for the ingestion date
3. Exchange rate source: European Central Bank (ECB) daily reference rates — free API at `https://data-api.ecb.europa.eu/service/data/EXR`
4. Cache exchange rates in Redis with 24-hour TTL (key: `fx:{from}:USD:{date}`)
5. Store both: `amount_original`, `currency_original`, `amount_usd`, `fx_rate_used`, `fx_rate_date`

```typescript
function normalizeToUSD(amount: number, currency: string, date: Date): Promise<Money> {
  if (currency === "USD") return { amount, currency: "USD" };

  const fxRate = await getFxRate(currency, "USD", date);
  return {
    amount: amount * fxRate.rate,
    currency: "USD",
    originalAmount: amount,
    originalCurrency: currency,
    fxRate: fxRate.rate,
    fxRateDate: fxRate.date,
  };
}
```

### 7.2 Unit Conversion

HTS codes use different units of quantity (kg, number, m², liters, dozen, etc.). The landed cost calculator must handle unit conversions for per-unit duty calculations.

Conversion tables stored in `unit_conversions` table:
- Weight: kg → lb → short ton → metric ton → long ton
- Volume: m³ → ft³ → liters → gallons
- Linear: m → ft → inches → yards
- Area: m² → ft²
- Count: gross (144) → dozen (12) → each

```typescript
// Duty calculation for compound rate example:
// HTS duty: "6.5% + $0.25/kg" — requires knowing shipment weight
function calculateDuty(
  cif_value_usd: number,          // customs value (cost + insurance + freight)
  weight_kg: number,
  hts_duty_string: string,        // e.g., "6.5% + $0.25/kg"
  country_of_origin: string,
): DutyCalculation {
  const parsed = parseDutyString(hts_duty_string);

  let base_duty = 0;
  if (parsed.ad_valorem_pct) {
    base_duty += cif_value_usd * (parsed.ad_valorem_pct / 100);
  }
  if (parsed.specific_rate_per_kg) {
    base_duty += weight_kg * parsed.specific_rate_per_kg;
  }

  // Apply Section 301 additional duty if applicable
  const section_301_rate = lookupSection301Rate(hts_code, country_of_origin);
  const section_301_duty = cif_value_usd * (section_301_rate / 100);

  // Apply AD/CVD if applicable
  const adcvd_rate = lookupAdCvdRate(hts_code, country_of_origin);
  const adcvd_duty = cif_value_usd * (adcvd_rate / 100);

  return {
    base_duty,
    section_301_duty,
    adcvd_duty,
    total_duty: base_duty + section_301_duty + adcvd_duty,
    effective_rate_pct: ((base_duty + section_301_duty + adcvd_duty) / cif_value_usd) * 100,
  };
}
```

### 7.3 Tariff Calculation Logic

**CIF value computation** (customs value for duty basis):
```
CIF = (unit_cost × quantity) + ocean_freight + insurance
```

**Total landed cost computation:**
```
Landed Cost =
  Unit Cost (origin)
  + Ocean Freight
  + BAF (Bunker Adjustment Factor)
  + Terminal Handling (origin)
  + ISF Filing Fee ($35–75 fixed)
  + Customs Duty (CIF × effective_duty_rate)
  + Section 301 Duty (CIF × section_301_rate)
  + AD/CVD Duty (CIF × adcvd_rate if applicable)
  + Customs Brokerage (~$150–250/entry)
  + Terminal Handling (destination)
  + Drayage (fixed by port/inland destination)
  + Insurance (0.5–1% of cargo value)
  + Demurrage Risk (P(congestion) × avg_demurrage_cost)
  + FDA/USDA Exam Risk (P(exam) × avg_exam_cost)
  + FTZ Savings Credit (if applicable, negative value)
```

### 7.4 FTZ Savings Calculation

```typescript
function calculateFtzSavings(
  currentTariffRate: number,        // locked rate at FTZ entry
  projectedTariffRate: number,      // expected future rate at time of withdrawal
  cargoValueUSD: number,
  monthlyWithdrawalUnits: number,
  totalUnits: number,
  storageCostPerMonthUSD: number,
): FtzSavingsAnalysis {
  const months = totalUnits / monthlyWithdrawalUnits;

  // Duties paid under FTZ (locked rate at entry)
  const dutiesWithFtz = cargoValueUSD * (currentTariffRate / 100);

  // Duties paid without FTZ (market rate at withdrawal time)
  const dutiesWithoutFtz = cargoValueUSD * (projectedTariffRate / 100);

  // FTZ storage cost
  const totalStorageCost = storageCostPerMonthUSD * months;

  const grossSavings = dutiesWithoutFtz - dutiesWithFtz;
  const netSavings = grossSavings - totalStorageCost;

  return {
    months_to_deplete: months,
    duties_with_ftz: dutiesWithFtz,
    duties_without_ftz: dutiesWithoutFtz,
    gross_savings: grossSavings,
    storage_cost: totalStorageCost,
    net_savings: netSavings,
    roi_pct: (netSavings / totalStorageCost) * 100,
    break_even_tariff_rate: currentTariffRate + (totalStorageCost / cargoValueUSD) * 100,
  };
}
```

---

## 8. Internal API Design

### 8.1 API Architecture Overview

Internal API routes (`/api/data/*`) serve as the interface between the storage layer and:
- Calculator components (client-side React)
- AI agents (tariff classification, route optimization, compliance monitor)
- Server components (data tables, dashboards)
- External integrations (future webhooks, GHL sync)

All endpoints return JSON. Authentication via JWT bearer token (NextAuth session) for portal-gated endpoints. Public endpoints for calculator tools used on the proposal site.

### 8.2 Tariff & HTS Endpoints

```
GET  /api/data/hts/search
     ?q={query}                       # Product description or HTS code prefix
     &limit={n}                       # Max 50
     Returns: HtsSearchResult[]

GET  /api/data/hts/{code}
     Returns: HtsCode (enriched — includes Section 301, AD/CVD, effective rates by country)

GET  /api/data/hts/{code}/duty-rate
     ?country={iso2}                  # Country of origin
     ?cif_value={usd}                 # For calculating absolute duty amount
     Returns: DutyCalculation

GET  /api/data/tariff-changes
     ?since={ISO8601_date}
     ?hts_code={code}                 # Optional filter
     ?change_type={type}              # Optional filter
     Returns: TariffChange[]

GET  /api/data/customs-rulings/search
     ?q={product_description}         # Semantic search via pgvector
     &limit={n}
     Returns: CustomsRuling[] (ranked by relevance)
```

### 8.3 Calculator Endpoints

```
POST /api/calculate/landed-cost
     Body: {
       products: { hts_code, quantity, unit_cost_usd, weight_kg, country_of_origin }[],
       origin_port: string,           # UN/LOCODE
       dest_port: string,
       container_type: ContainerType,
       freight_cost_usd?: number,     # if known; else estimated from schedules
       use_ftz: boolean,
     }
     Returns: LandedCostResult (itemized by cost component + probability ranges)

POST /api/calculate/ftz-savings
     Body: {
       cargo_value_usd: number,
       hts_codes: string[],
       current_tariff_rate: number,
       projected_tariff_rate: number,
       monthly_withdrawal_units: number,
       total_units: number,
       storage_cost_per_month_usd: number,
     }
     Returns: FtzSavingsAnalysis

POST /api/calculate/container-utilization
     Body: {
       product_dimensions: { length_cm, width_cm, height_cm, weight_kg },
       units_per_shipment: number,
       container_type: ContainerType,
     }
     Returns: ContainerUtilizationResult

GET  /api/calculate/duty-estimate
     ?hts={code}
     &country={iso2}
     &value={usd}
     Returns: DutyEstimate (quick, cached)
```

### 8.4 Carrier & Route Endpoints

```
GET  /api/data/carrier-schedules
     ?origin={locode}
     &dest={locode}
     &date_from={YYYY-MM-DD}
     &date_to={YYYY-MM-DD}
     &carrier={scac_code}            # Optional filter
     &container_type={type}
     &reefer_required={bool}
     Returns: CarrierSchedule[] (sorted by departure date)

GET  /api/data/routes/compare
     ?origin={locode}
     &dest={locode}
     &etd={YYYY-MM-DD}
     &cargo_type={cold_chain|general}
     Returns: RouteComparison[] (top 3 routes with scoring)

GET  /api/data/ports
     ?q={search}                     # Name or LOCODE search
     &country={iso2}
     Returns: Port[]

GET  /api/data/ports/{locode}/congestion
     Returns: PortCongestion (current)

GET  /api/data/vessels/{mmsi}/position
     Returns: VesselPosition (current)
```

### 8.5 Compliance & Alert Endpoints

```
GET  /api/data/compliance/fda-alerts
     ?product_category={category}
     ?country={iso2}
     Returns: FdaImportAlert[] (active alerts)

GET  /api/data/compliance/adcvd
     ?hts_code={code}
     ?country={iso2}
     Returns: AdCvdOrder[] (active orders affecting this HTS/country)

GET  /api/data/compliance/shipment-check
     ?shipment_id={id}               # Full compliance check for a planned shipment
     Returns: ComplianceCheckResult {
       fda_alerts: FdaImportAlert[],
       adcvd_orders: AdCvdOrder[],
       tariff_changes_pending: TariffChange[],
       risk_level: "low" | "medium" | "high" | "critical",
       recommended_actions: string[],
     }

GET  /api/data/regulatory-notices
     ?since={ISO8601_date}
     ?limit={n}
     Returns: RegulatoryNotice[] (latest Federal Register, CSMS, FDA alerts)
```

### 8.6 FTZ Endpoints

```
GET  /api/data/ftz/zones
     ?state={state_code}
     ?near_port={locode}
     Returns: FtzZone[]

GET  /api/data/ftz/zones/{zone_number}
     Returns: FtzZone (with subzones, operator contacts, manufacturing approvals)
```

### 8.7 AI Agent Endpoints (Internal)

```
POST /api/agents/classify-hts
     Body: { product_description: string, product_images?: string[] }
     Returns: {
       predictions: { hts_code, confidence, reasoning }[],
       similar_rulings: CustomsRuling[],
       requires_human_review: boolean,
     }

POST /api/agents/compliance-monitor/check-notice
     Body: { notice_text: string, notice_source: string, notice_date: string }
     Returns: {
       is_trade_relevant: boolean,
       affected_hts_codes: string[],
       affected_countries: string[],
       effective_date: string,
       action_type: string,
       summary: string,
     }
```

---

## 9. Data Quality & Monitoring

### 9.1 Validation Rules

**HTS Code validation:**
- Code must match regex `^\d{4}\.\d{2}\.\d{4}$` (10-digit format)
- Code must exist in the HTS hierarchy (parent heading must be present)
- Duty rate must be parseable as percentage, specific rate, or "Free"
- Revision number must be numeric and >= current stored revision

**Carrier schedule validation:**
- Departure date must be >= today (reject stale schedules)
- Arrival date must be > departure date
- Transit days must match date difference (± 1 day for timezone edge cases)
- Port LOCODEs must exist in the ports reference table
- Carrier SCAC code must exist in carriers reference table

**Vessel position validation:**
- Lat must be between -90 and 90
- Lng must be between -180 and 180
- Speed must be between 0 and 30 knots (flag if > 25 knots — likely data error)
- MMSI must be 9 digits and match known vessel registry

**Tariff change validation:**
- Effective date must be a valid date and not impossibly far in future (> 5 years = flag)
- Duty rate change must be > 0 (a change to 0% is valid; a negative duty rate is not)
- HTS code must exist in `hts_codes` table
- Federal Register citation must match known citation format

### 9.2 Freshness Monitoring

A dedicated monitoring service checks data freshness every hour and writes to `data_freshness_log`:

```typescript
interface DataFreshnessCheck {
  sourceId: string;
  lastIngestedAt: Date;
  expectedFreshnessHours: number;     // SLA from ingestion schedule
  ageHours: number;                   // how old is the freshest record
  status: "fresh" | "stale" | "critical";
  alertSent: boolean;
}
```

**Alert thresholds:**

| Source | Warning | Critical |
|--------|---------|----------|
| HTS rates | 72h stale | 168h (1 week) |
| Federal Register | 48h | 96h |
| FDA alerts | 36h | 72h |
| Carrier schedules | 36h | 72h |
| AD/CVD orders | 168h (1 week) | 336h (2 weeks) |
| Port congestion | 8h | 24h |

Alerts go to: Slack webhook → `#shipping-savior-ops` channel. Also write to `ops_alerts` table for the ops dashboard.

### 9.3 Anomaly Detection

After each ingestion batch, run statistical checks to catch anomalous data:

**Rate anomalies:** If a duty rate changes by >20 percentage points in a single update (not during a known tariff change event), flag for human review. Example: HTS code showing a jump from 6.5% to 35% when no Federal Register notice was published.

**Volume anomalies:** If a scraper returns 0 records when it typically returns 50+, flag the connector as potentially blocked or the source site as changed.

**Schedule anomalies:** If a carrier shows transit time change > 7 days on an existing route (e.g., 14 days → 28 days), flag as a possible data error or an extraordinary disruption (Suez Canal closure, etc.).

**Position anomalies:** If a vessel jumps > 200 nautical miles between position updates (15-min interval), flag as a likely duplicate MMSI or AIS data error.

Detection runs as a post-ETL job using z-score analysis on a rolling 30-day window of historical values.

### 9.4 Data Lineage Tracking

Every record in production tables carries provenance metadata:

```sql
-- Added to all production tables
source_id         TEXT NOT NULL,    -- which connector produced this
batch_id          UUID NOT NULL,    -- ingestion run that produced this
ingested_at       TIMESTAMPTZ,      -- when we received it
source_url        TEXT,             -- URL or API endpoint
raw_archive_key   TEXT,             -- S3 key for raw response
confidence_score  NUMERIC(3,2),     -- 0.00-1.00 for AI-parsed records
human_reviewed    BOOLEAN DEFAULT FALSE,
```

---

## 10. Compliance & Data Governance

### 10.1 Data Classification

| Data Category | Classification | Retention | Notes |
|---------------|---------------|-----------|-------|
| HTS rates / tariff data | Public | Indefinite | Government public domain |
| CROSS rulings | Public | Indefinite | Government public domain |
| Carrier schedules | Licensed | 1 year rolling | Check each carrier ToS |
| AIS vessel positions | Licensed | 90 days | Per AISHub/Datalastic ToS |
| Bill of lading data | Public (FOIA) | 3 years | Aggregated public records |
| Client shipment data | Confidential | 7 years | Business records |
| Client company profiles | Confidential | Duration of relationship + 3 years | CCPA-subject if CA-based businesses |

### 10.2 GDPR / CCPA Considerations

This platform primarily handles **business-to-business trade data**, not consumer personal data. However:

- **Client portal users** (Blake and any sub-users he adds) are natural persons whose email, name, and usage data is CCPA-covered if CA residents.
- **Shipment data** linked to specific clients may constitute personal data under GDPR if EU clients are added.
- **Bill of lading data** can contain shipper/consignee names — treat as potentially personal data.

**Implementation requirements:**
- Client account deletion must cascade to remove personal identifiers from shipment records (replace name with `[DELETED]`, retain aggregate business metrics)
- Data access logs maintained for 1 year (who queried what)
- Privacy policy must disclose third-party data sources (carrier APIs, government databases)
- Data Processing Agreement template ready for any EU clients

### 10.3 Carrier API Terms of Service

Before production integration, verify ToS compliance for each carrier API:

| Carrier | Key Restrictions to Check |
|---------|--------------------------|
| Maersk | Rate limiting, commercial use rights, data resale prohibition |
| CMA CGM | Attribution requirements, commercial use |
| Hapag-Lloyd | Commercial use rights, derivative product restrictions |
| AISHub | Requires contributing AIS data in exchange for receiving data |
| ImportGenius | Data resale strictly prohibited — platform must not re-expose raw BOL data |

**Rule:** Do not build features that expose raw carrier API responses to end-users without transformation and aggregation. Show derived insights, not raw data dumps.

### 10.4 Scraping Compliance

For web-scraped sources (CROSS, AD/CVD, USDA APHIS):
- All are US government websites — no ToS restrictions on scraping public data
- Implement polite crawling: 1–3 second delays, off-peak hours (2–6 AM UTC)
- Use descriptive User-Agent: `ShippingSavior-DataBot/1.0 (+https://shipping-savior.com/bot)`
- Respect `robots.txt` (government sites typically have permissive robots.txt)
- Store raw responses for audit trail

---

## 11. Failover & Resilience

### 11.1 Source-Level Failover

| Source | Primary | Fallback | Notes |
|--------|---------|----------|-------|
| Carrier schedules | Direct carrier API | JSONCargo aggregator | JSONCargo covers 95%+ carriers |
| HTS rates | USITC direct download | data.gov mirror | Identical data, different CDN |
| Federal Register | FR API | federalregister.gov web scrape | API occasionally has lag |
| Port congestion | Portcast API | AIS-derived congestion estimate | Less accurate but never down |
| AIS tracking | Datalastic API | AISHub free feed | Terrestrial coverage only |
| FDA alerts | openFDA API | Direct web scrape | openFDA sometimes lags website |

### 11.2 Pipeline-Level Resilience

**Dead letter queue:** Failed ingestion jobs are written to `failed_jobs` table with full error context. A nightly retry worker replays failed jobs from the previous 24 hours.

**Partial failure handling:** If a batch partially fails (e.g., 800 of 1,000 CROSS rulings scraped before a timeout), the pipeline records the watermark (last successful ruling number) and resumes from there on next run — never re-scraping what's already loaded.

**Stale-while-revalidate:** The serving layer never blocks on a failed ingestion. If the carrier schedule ingestion fails, the API continues serving the previous day's schedules with a `data_staleness_warning` flag in the response.

**Circuit breaker:** If a source fails 3 consecutive times, the connector enters a "cooling off" period (1 hour), then retries. After 10 consecutive failures, escalate to ops alert and disable the connector until manually re-enabled.

### 11.3 Database Resilience

- **Neon branching:** Use Neon's branching feature to create a point-in-time snapshot before each major ingestion run (e.g., HTS revision update). Enables instant rollback if a bad batch corrupts production data.
- **Read replicas:** Neon auto-scales read replicas — configure read-heavy AI agent queries to hit replicas, write operations to primary.
- **Redis failover:** Upstash Redis is serverless with automatic failover. If Redis is unavailable, the serving layer degrades gracefully — falls through to PostgreSQL directly (higher latency but correct data).

---

## 12. Scaling & Cost Projections

### 12.1 Data Volume Estimates

| Metric | Phase 1 | Phase 2 | Phase 3 |
|--------|---------|---------|---------|
| Total DB size | ~10 MB (static JSON) | ~5 GB | ~20 GB |
| Records ingested/day | 0 (static) | ~10,000 | ~100,000+ |
| S3 raw archive/month | 0 | ~5 GB | ~20 GB |
| Redis requests/day | ~1K | ~50K | ~500K |
| API calls served/day | ~500 | ~10K | ~100K |

### 12.2 Cost Projections

**Phase 2 Monthly Infrastructure Costs:**

| Service | Tier | Cost/Month |
|---------|------|-----------|
| Neon PostgreSQL | Launch (10 GB) | $19 |
| Cloudflare R2 (raw archive) | Pay-as-go | ~$1 |
| Upstash Redis | Pay-as-go (~50K req/day) | ~$10 |
| Typesense Cloud | Basic (search) | ~$20 |
| Railway (cron workers) | Starter | $5 |
| Datalastic AIS | Not yet (Phase 3) | $0 |
| Carrier APIs (Maersk, CMA, Hapag) | Free tiers | $0 |
| openFDA, Census, Federal Register | Free | $0 |
| **Phase 2 Total** | | **~$55/month** |

**Phase 3 Additions:**

| Service | Addition | Monthly |
|---------|---------|---------|
| Datalastic AIS | Starter plan | +$220 |
| Port congestion API | Portcast | +$200 (est.) |
| JSONCargo (carrier aggregator) | If needed | +$300 (est.) |
| Neon PostgreSQL | Scale tier | +$50 |
| **Phase 3 Total** | | **~$825/month** |

**Break-even:** Phase 3 costs are justified at 5+ paying customers at $500/month subscription pricing.

### 12.3 Query Performance Targets

| Query Type | Target P50 | Target P95 | Strategy |
|-----------|-----------|-----------|----------|
| HTS code lookup | <10ms | <50ms | Redis cache |
| HTS search | <100ms | <300ms | Typesense |
| Landed cost calculation | <200ms | <500ms | Redis cache + fast SQL |
| Carrier schedule query | <150ms | <400ms | Redis cache + indexed query |
| Semantic ruling search | <300ms | <800ms | pgvector HNSW index |
| Compliance check | <500ms | <1500ms | Parallel sub-queries |

---

## 13. Development Phases

### Phase 1: Mock Data Foundation (Weeks 1–4)

**Goal:** Full calculator and AI functionality operates on carefully researched static data. Validate UX before any integration cost.

**Deliverables:**
- `/data/hts-sample.json` — 500 HTS codes covering Blake's key product categories (cold chain, CPG, apparel)
- `/data/carrier-schedules.json` — 2 weeks of schedules for 4 carriers on 5 key trade lanes
- `/data/ports.json` — 50 major ports with full metadata
- `/data/ftz-zones.json` — All 260+ FTZ zones from OFIS download
- `/data/tariff-rates.json` — Current duty rates with Section 301 and AD/CVD flags
- All calculator API routes working on mock data
- HTS search working via Fuse.js on client-side index

**Mock data seeding:** Use real-world researched data, not made-up numbers. Source from USITC, OFIS, and carrier public schedules. Mock data should be accurate enough that real calculations produce correct results for Blake's known shipments.

### Phase 2: Government Data Integration (Weeks 5–10)

**Goal:** Replace mock data with live government sources. No carrier API costs yet.

**Integration order (by risk/value):**
1. HTS Schedule (USITC download) — highest value, zero risk, no auth needed
2. Federal Register API — daily monitoring, free API key, high compliance value
3. FDA Import Alerts (openFDA) — critical for cold chain, free API
4. CROSS Rulings scraper — enables AI classification, free government data
5. Census Bureau trade stats — enriches market intelligence features
6. AD/CVD scraper — completes duty rate accuracy
7. OFIS FTZ data — already researched, just needs bulk download automation

**Infrastructure stood up this phase:**
- PostgreSQL on Neon (Launch tier)
- S3/R2 raw archive bucket
- Redis (Upstash)
- Typesense search index
- Railway cron job runner
- Ops alerting (Slack webhook)

### Phase 3: Carrier API + Real-Time (Weeks 11–18)

**Goal:** Live carrier schedules, vessel tracking, port congestion. Full production pipeline.

**Integration order:**
1. Maersk API (most developer-friendly, free)
2. Hapag-Lloyd API
3. CMA CGM API
4. AISHub free tier → Datalastic (upgrade when vessel tracking is a paid feature)
5. Evergreen/ONE scrapers (or JSONCargo aggregator)
6. Port congestion API (evaluate Portcast vs GoComet)
7. Demurrage/detention scraper (monthly cron)
8. USDA APHIS scraper (weekly cron)
9. CSMS email parser

**Real-time features unlocked:**
- Live vessel tracking on shipments
- Dynamic congestion warnings in route comparison
- Proactive tariff change alerts (Federal Register → webhook → client notification)

---

## 14. Scheduling Matrix

The following table captures the complete cron schedule for all data ingestion jobs at Phase 2/3 steady state. All times in UTC.

| Job Name | Cron Expression | Phase | Duration Est. | Priority |
|----------|----------------|-------|--------------|----------|
| `ingest-hts-schedule` | `0 2 * * 1` (Mon 2 AM) | 2 | 10 min | P0 |
| `ingest-federal-register` | `0 6 * * 1-5` (Weekdays 6 AM) | 2 | 5 min | P0 |
| `ingest-fda-alerts` | `0 7 * * *` (Daily 7 AM) | 2 | 15 min | P0 |
| `ingest-cross-rulings-incremental` | `0 3 * * *` (Daily 3 AM) | 2 | 30 min | P0 |
| `ingest-carrier-maersk` | `0 1 * * *` (Daily 1 AM) | 3 | 20 min | P0 |
| `ingest-carrier-cma-cgm` | `30 1 * * *` (Daily 1:30 AM) | 3 | 20 min | P0 |
| `ingest-carrier-hapag` | `0 2 * * *` (Daily 2 AM) | 3 | 20 min | P0 |
| `ingest-carrier-scrapers` | `0 4 * * *` (Daily 4 AM) | 3 | 45 min | P1 |
| `ingest-adcvd-orders` | `0 5 * * 1` (Mon 5 AM) | 2 | 60 min | P1 |
| `ingest-census-trade-stats` | `0 6 5 * *` (5th of month) | 2 | 30 min | P1 |
| `ingest-ftz-data` | `0 4 1 * *` (1st of month) | 2 | 15 min | P1 |
| `ingest-demurrage-tariffs` | `0 3 1 * *` (1st of month) | 2 | 30 min | P1 |
| `ingest-usda-aphis` | `0 5 * * 1` (Mon 5 AM) | 2 | 45 min | P1 |
| `ingest-un-comtrade` | `0 8 10 * *` (10th of month) | 2 | 30 min | P2 |
| `ingest-ais-snapshot` | `0 * * * *` (Hourly) | 3 | 5 min | P2 |
| `ingest-port-congestion` | `0 */4 * * *` (Every 4h) | 3 | 10 min | P2 |
| `ingest-world-bank-lpi` | `0 6 1 1 *` (Jan 1 annually) | 2 | 10 min | P3 |
| `cross-rulings-full-sync` | `0 0 * * 0` (Sun midnight) | 2 | 480 min | P0 (one-time then weekly diff) |
| `freshness-monitor` | `0 * * * *` (Hourly) | 2 | 2 min | P0 |
| `anomaly-detector` | `30 * * * *` (Every hour, :30) | 2 | 5 min | P1 |
| `dead-letter-retry` | `0 5 * * *` (Daily 5 AM) | 2 | 30 min | P1 |
| `cache-warmup` | `45 0 * * *` (Daily 12:45 AM) | 2 | 15 min | P1 |
| `typesense-reindex` | Triggered by ETL hooks | 2 | On-demand | P0 |
| `exchange-rate-refresh` | `0 16 * * 1-5` (ECB publish time) | 2 | 2 min | P1 |

**Total estimated compute time per day (Phase 3):** ~5.5 hours. Easily fits within Railway Starter plan ($5/month) with time to spare. Scale to Railway Pro ($20/month) if jobs exceed 8 hours/day.

---

*Document version: 1.0 — Initial design*
*Next review: After Phase 2 integration begins*
*Owner: AI Acrobatics Engineering*
*Linear: AI-5410*
