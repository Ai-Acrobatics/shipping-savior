# Shipping/Logistics Platform: Data Sources, Scraping Strategy & AI Services

**Project:** Shipping Savior (working name)
**Context:** Blake's cold chain logistics business — 96-97% exports through Lineage terminal, expanding to SE Asia imports
**Researched:** 2026-03-26
**Overall Confidence:** MEDIUM-HIGH (most government sources verified, some carrier APIs need hands-on testing)

---

## Table of Contents

1. [Public Shipping Data Sources](#1-public-shipping-data-sources)
2. [Scraping & Storage Strategy](#2-scraping--storage-strategy)
3. [AI Services Architecture](#3-ai-services-architecture)
4. [Tech Stack for Data Pipeline](#4-tech-stack-for-data-pipeline)
5. [Legal Considerations](#5-legal-considerations)
6. [Phase Recommendations](#6-phase-recommendations)

---

## 1. Public Shipping Data Sources

### 1.1 Tariff & Duty Data

#### USITC Harmonized Tariff Schedule (HTS)

| Attribute | Detail |
|-----------|--------|
| **URL** | https://hts.usitc.gov/ |
| **Download URL** | https://hts.usitc.gov/download |
| **Export URL** | https://hts.usitc.gov/export |
| **Data Formats** | JSON, CSV, XLS, PDF |
| **Update Frequency** | Multiple revisions per year (2026 HTS Revision 4 is current as of March 2026) |
| **Access Method** | Direct download — no API key needed |
| **Data Contents** | Full HTS schedule with tariff rates, duty columns, units of quantity, special program indicators |
| **Also on data.gov** | https://catalog.data.gov/dataset/harmonized-tariff-schedule-of-the-united-states-2025 |
| **Legal** | Public domain — US government data, freely usable |
| **Confidence** | HIGH |

**Scraping strategy:** Download the JSON export on a weekly cron job. Parse into PostgreSQL with columns for HTS code (hierarchical), description, general duty rate, special duty rates, unit of quantity. Build a change-detection layer that diffs new revisions against stored data and flags changes.

**Key insight:** The HTS JSON export is well-structured and machine-readable. No scraping needed — this is a clean download. The revision numbering system (e.g., "Revision 4") makes change tracking straightforward.

---

#### CBP CROSS Rulings Database

| Attribute | Detail |
|-----------|--------|
| **URL** | https://rulings.cbp.gov/ |
| **Total Rulings** | 220,294+ (as of March 2026) |
| **Update Frequency** | ~67 new rulings per batch, updated multiple times per week |
| **Access Method** | Web scraping (no public API) |
| **Search Capabilities** | Keyword, HTS number, ruling number, date range |
| **Data Contents** | Ruling number, date, HTS classification, product description, legal reasoning |
| **Also on data.gov** | https://catalog.data.gov/dataset/cbp-customs-rulings-online-search-system-cross |
| **Legal** | Public government data — freely scrapable |
| **Confidence** | HIGH |

**Scraping strategy:** This is the crown jewel for AI training data. Scrape all 220K+ rulings into a structured database. Each ruling contains:
- Product description (input for classification model)
- HTS code assigned (label for training)
- Legal reasoning (context for RAG)
- Cross-references to other rulings

Run a daily scraper to pick up new rulings (typically dozens per week). Store full text for vector embedding + structured fields for filtering.

**AI training note:** The ATLAS benchmark paper (2025) created a dataset of 18,731 rulings mapped to 2,992 unique HTS codes from CROSS. Their fine-tuned LLaMA-3.3-70B model ("Atlas") achieved 40% accuracy at 10-digit HTS level and 57.5% at 6-digit level — significantly outperforming GPT-5-Thinking (25%) and Gemini-2.5-Pro (13.5%). This validates that CROSS data is suitable for training tariff classification models.

---

#### Section 301/201/232 Tariff Lists

| Attribute | Detail |
|-----------|--------|
| **Section 301 (China)** | https://ustr.gov/issue-areas/enforcement/section-301-investigations/tariff-actions |
| **Federal Register Notices** | PDFs at https://ustr.gov/sites/default/files/enforcement/301Investigations/ |
| **Congressional Research** | https://www.congress.gov/crs-product/R48549 — timeline and status tracker |
| **Update Frequency** | Irregular — driven by executive orders and USTR reviews |
| **Data Format** | PDF tariff lists with HTS codes and duty rates |
| **Legal** | Public government data |
| **Confidence** | HIGH |

**Current state (as of March 2026):** Section 301 tariffs on China have undergone multiple modifications. The September 2024 USTR modifications increased duties on 14 strategic sectors (batteries, EVs, semiconductors, solar cells, steel/aluminum, etc.) effective September 2024, January 2025, and January 2026.

**Scraping strategy:** Federal Register monitoring (see below) is the best approach. Parse Federal Register notices for HTS code lists and duty rate changes. The USTR PDFs are structured enough to extract HTS codes programmatically, though some manual QA will be needed for complex notices.

---

#### Anti-Dumping/Countervailing Duty (AD/CVD) Orders

| Attribute | Detail |
|-----------|--------|
| **CBP AD/CVD Database** | https://trade.cbp.dhs.gov/ace/adcvd/adcvd-public/# |
| **Commerce Dept Search** | https://access.trade.gov/ADCVD_Search.aspx |
| **CBP Info Page** | https://www.cbp.gov/trade/priority-issues/adcvd/data |
| **Update Frequency** | Ongoing — new orders and rate changes published regularly |
| **Data Contents** | AD/CVD messages from 1992-present, searchable by keyword/Boolean |
| **Legal** | Public government data |
| **Confidence** | HIGH |

**Scraping strategy:** The CBP AD/CVD public database is searchable but not bulk-downloadable. Build a scraper that systematically queries by HTS chapter and stores all AD/CVD orders with case numbers, countries, products, duty rates, and effective dates. Run weekly to catch new orders and rate modifications.

**Critical for Blake's business:** Cold chain products (especially from SE Asia) may be subject to AD/CVD orders. The platform should cross-reference every import's HTS code against the AD/CVD database and flag matches automatically.

---

#### Trade Agreement Preferential Rates

| Attribute | Detail |
|-----------|--------|
| **USMCA** | Tracked via USTR.gov and CBP guidance |
| **CAFTA-DR** | Central America free trade preferences |
| **KORUS, AUSFTA, etc.** | Various bilateral/multilateral agreements |
| **ITA Trade Agreements** | https://www.trade.gov/data |
| **CBP Trade Agreement Info** | Country-specific guidance on cbp.gov |
| **Confidence** | MEDIUM (data scattered across sources) |

**Scraping strategy:** Trade agreement preferential rates are embedded in the HTS schedule itself (the "Special" duty column with program indicators like "CA" for Canada/USMCA, "P" for GSP, etc.). The HTS JSON download includes these. Cross-reference with rules of origin requirements from each agreement's text.

---

#### Federal Register — Trade Policy Monitoring

| Attribute | Detail |
|-----------|--------|
| **URL** | https://www.federalregister.gov/ |
| **API** | https://www.federalregister.gov/developers/documentation/api/v1 |
| **Update Frequency** | Daily (business days) |
| **Data Format** | JSON API, XML |
| **Relevant Agencies** | CBP, USTR, Commerce (ITA/BIS), USITC, FDA, USDA |
| **CBP Trade FR Notices** | https://www.cbp.gov/trade/rulings/cbp-trade-related-federal-register-notices-2025 |
| **Legal** | Public domain — free API |
| **Confidence** | HIGH |

**This is essential.** The Federal Register API is one of the most important data sources for the compliance monitoring agent. It provides programmatic access to:
- Tariff change notices
- AD/CVD preliminary and final determinations
- Trade agreement modifications
- FDA/USDA import requirement changes
- Section 301/201/232 actions

**Scraping strategy:** Use the Federal Register API (documented, free, JSON) to monitor specific agencies and document types daily. Filter for trade-relevant notices using keyword matching and agency codes. Store full notice text for AI analysis and extract structured data (HTS codes, effective dates, duty rates).

---

### 1.2 Carrier & Vessel Data

#### Carrier Schedule APIs

| Carrier | API Portal | Access Method | Free? | DCSA Compliant? | Notes |
|---------|-----------|---------------|-------|-----------------|-------|
| **Maersk** | https://developer.maersk.com/ | REST API (self-service portal) | Yes (currently) | Yes | Point-to-Point Schedules API, Track & Trace. May implement paid tiers in future |
| **MSC** | Via DCSA Commercial Schedules API | REST API | TBD | Yes (adopted 2025) | MSC adopted DCSA standard in mid-2025 |
| **CMA CGM** | https://api-portal.cma-cgm.com/ | REST API (account required) | Free tier available | Yes | Schedules, booking, tracking. Register for web account to access |
| **Hapag-Lloyd** | https://api-portal.hlag.com/ | REST API | Yes | Yes | Route options, tracking, transport events |
| **COSCO** | https://cop.lines.coscoshipping.com/ | Web portal + limited API | Partial | Partial | Less developer-friendly than Western carriers |
| **Evergreen** | https://ss.shipmentlink.com/ | Web scraping required | N/A | No | ShipmentLink for schedules — no public API |
| **ONE** | Limited public API | Web scraping likely needed | N/A | Partial | |
| **Yang Ming** | Limited public API | Web scraping likely needed | N/A | Partial | |

**Confidence:** MEDIUM (API availability verified via search, but hands-on testing needed for rate limits, data quality, and actual response formats)

**Key development: DCSA Standards**

The Digital Container Shipping Association (https://dcsa.org/) has published standardized APIs for:
- Commercial Schedules
- Track & Trace
- Booking
- Electronic Bill of Lading
- Operational Vessel Schedules
- Just-in-Time Port Calls

DCSA represents ~75% of global container trade. Their OpenAPI specs are on GitHub: https://github.com/dcsaorg/DCSA-OpenAPI

**Strategy:** For the top 4 carriers (Maersk, MSC, CMA CGM, Hapag-Lloyd) — use their native APIs. For carriers without APIs (Evergreen, Yang Ming) — scrape their schedule search pages. Consider third-party aggregators like JSONCargo (https://jsoncargo.com/) which covers 95%+ of shipping lines via a single API (paid).

---

#### AIS Vessel Tracking

| Provider | URL | Access | Pricing | Coverage |
|----------|-----|--------|---------|----------|
| **AISHub** | https://www.aishub.net/ | Free AIS data sharing network | Free (contribute data to receive) | Terrestrial AIS only |
| **Datalastic** | https://datalastic.com/ | REST API | 199-679 EUR/month (20K-unlimited requests) | Global AIS + satellite |
| **VesselFinder** | https://api.vesselfinder.com/ | REST API (credit-based) | 1 credit/terrestrial position, 10 credits/satellite | Global |
| **MarineTraffic** | https://www.marinetraffic.com/ | REST API | Enterprise pricing (contact sales) | Global — industry leader |

**Confidence:** HIGH (pricing verified via search)

**Strategy for Blake's platform:** Start with AISHub (free) for basic vessel position tracking. Upgrade to Datalastic Starter (199 EUR/month) when real-time tracking becomes a paid feature. MarineTraffic is the gold standard but expensive — save for enterprise tier.

**Use cases:**
- Track vessels carrying Blake's clients' cargo
- Monitor port approach and anchorage wait times
- Feed vessel ETA predictions into the route optimization AI
- Detect congestion patterns from vessel clustering

---

#### Port Congestion Data

| Provider | URL | Access | Data |
|----------|-----|--------|------|
| **Portcast** | https://www.portcast.io/ | REST API | Daily/weekly congestion for 1,000+ ports — vessels berthed, waiting, dwell times |
| **GoComet** | https://www.gocomet.com/ | REST API | Real-time congestion from AIS + geofencing + container events (45K+ containers) |
| **Vizion TradeView** | https://www.vizionapi.com/ | REST API | Real-time port metrics, container dwell trends |
| **MarineTraffic** | Terminal Congestion API | REST API | Terminal-level congestion data |
| **BTS Freight Indicators** | https://www.bts.gov/freight-indicators | Download | Government freight indicators (free but less real-time) |

**Confidence:** MEDIUM (verified providers exist, pricing requires sales contact)

**Strategy:** BTS freight indicators are free and good for baseline. For real-time data, evaluate Portcast (seems most comprehensive at 1,000+ ports). This is a premium data layer — monetize accordingly.

---

### 1.3 Port & Terminal Data

#### US Port Statistics

| Source | URL | Data | Format | Frequency |
|--------|-----|------|--------|-----------|
| **MARAD** | https://www.maritime.dot.gov/data-reports/ports | Port performance, vessel calls, investment data | Downloadable datasets, dashboards | Varies (annual reports, periodic updates) |
| **Army Corps WCSC** | https://ndc.ops.usace.army.mil/wcsc/webpub/ | Waterborne commerce statistics, vessel trips, cargo data | Downloadable reports | Annual reports, monthly indicators |
| **MARAD Data Hub** | https://www.maritime.dot.gov/data-reports | Links to BTS, Army Corps, and other federal data | Mixed | Ongoing |

**Confidence:** HIGH (government sources verified)

#### Terminal Operating Data

| Data Type | Source | Access | Notes |
|-----------|--------|--------|-------|
| **Gate hours** | Individual terminal websites | Scrape | Varies by terminal — most post hours on their websites |
| **Chassis availability** | Pool of record (DCLI, TRAC, Flexi-Van) | Scrape/API varies | Some pools have real-time availability tools |
| **Demurrage/detention fees** | Carrier tariff pages | Scrape | CMA CGM: https://www.cma-cgm.com/ebusiness/tariffs/demurrage-detention |
| **Free time** | Carrier tariff pages | Scrape | FMC mandates minimum 10-day import free time |

**Demurrage/Detention Rate Ranges (2025-2026):**
- Import detention: $185-$285/day (ONE Line schedule)
- Industry average: $150-$300/day demurrage, $100-$250/day detention
- Rates surged 12-18% year-over-year per Container xChange 2025 data
- Maersk updating US tariffs effective January 2026 (+$20-$40/tier)

**Strategy:** Scrape carrier demurrage/detention tariff pages monthly. Store by carrier, terminal, equipment type, and effective date. This data is extremely valuable for the cost prediction AI — demurrage is one of the biggest hidden costs in shipping.

---

### 1.4 Trade Intelligence

#### Bill of Lading Databases

| Provider | URL | Coverage | Pricing | API? |
|----------|-----|----------|---------|------|
| **ImportGenius** | https://www.importgenius.com/ | US customs import/export records (BOL level), multi-continent | Starts ~$200-300/month (pricing published, subscribe online) | Unknown — contact for API |
| **Panjiva (S&P Global)** | https://panjiva.com/ | 2B+ shipment records from 22 customs sources | Enterprise — contact sales | Likely API available for enterprise |
| **CBP FOIA Data** | Via FOIA request to CBP | US import records (public after FOIA processing) | Free (but slow) | No — bulk data dumps |

**Confidence:** MEDIUM (pricing approximate, API availability unconfirmed)

**Strategy:** For MVP, use CBP FOIA data (free but delayed). For competitive intelligence features, integrate ImportGenius (more accessible pricing, self-service signup). Panjiva is enterprise-grade — evaluate later.

**Legal note:** US bill of lading data is public record under FOIA. ImportGenius and Panjiva aggregate this public data. However, some importers request confidentiality treatment from CBP — those records are excluded.

---

#### Government Trade Statistics

| Source | URL | Access | Data | Format |
|--------|-----|--------|------|--------|
| **Census Bureau Foreign Trade** | https://www.census.gov/foreign-trade/ | Free API | US imports/exports by HS code, country, NAICS, end-use | JSON API |
| **USA Trade Online** | https://usatrade.census.gov/ | Free (no login needed — "Reimagined" version) | Custom reports, downloadable | Excel, CSV |
| **Census API** | https://www.census.gov/data/developers/data-sets/international-trade.html | Free API key | Monthly data from 2013+, annual from 2005+ | JSON |
| **UN Comtrade** | https://comtrade.un.org/ | Free API (premium for bulk) | International trade flows, 200 countries, since 1962 | JSON API |
| **UN Comtrade Developer** | https://comtradedeveloper.un.org/ | Free + premium tiers | API definitions, testing, keys | JSON |
| **USITC DataWeb** | https://dataweb.usitc.gov/ | Free | US trade and tariff data explorer | Web + download |
| **World Bank WITS** | https://wits.worldbank.org/ | Free | Trade data, tariffs, NTMs | Various |

**Confidence:** HIGH (government APIs verified)

**Strategy:** Census Bureau API is the primary source for US trade statistics — free, well-documented, JSON format. Supplement with UN Comtrade for international flows. USITC DataWeb for tariff-specific analysis. All free and legal.

**Python libraries available:** `comtradeapicall` (GitHub: https://github.com/uncomtrade/comtradeapicall) for UN Comtrade access.

---

### 1.5 FTZ (Foreign Trade Zone) Data

| Source | URL | Data | Format |
|--------|-----|------|--------|
| **OFIS** | https://ofis.trade.gov/ | All FTZ zones, subzones, sites, grantee contacts, Federal Register notices (1980-present) | Web-based search + data.gov dataset |
| **OFIS on data.gov** | https://catalog.data.gov/dataset/online-ftz-information-system-ofis | Zone/site info, contacts, approvals | Downloadable |
| **FTZ Manufacturing DB** | https://data.commerce.gov/foreign-trade-zones-manufacturing-t/im-database | FTZ Board manufacturing approvals | Searchable/downloadable |
| **FTZ Annual Reports** | https://catalog.data.gov/dataset/foreign-trade-zones-annual-report-to-congress | Annual utilization statistics | PDF/data |
| **FTZ Board** | https://www.trade.gov/foreign-trade-zones-board | Orders, applications, policy | Web |

**Confidence:** HIGH (government data, verified URLs)

**Strategy:** Download the OFIS dataset from data.gov for bulk zone/site information. Scrape OFIS web interface for real-time updates on new zones and subzones. Monitor Federal Register for FTZ Board orders and applications. Cross-reference with FTZ Annual Reports for utilization data.

**Critical for FTZ Strategy Optimizer AI:** The platform needs to know which FTZs are near which ports, what products they handle, who the operators are, and what manufacturing approvals exist. OFIS has all of this.

---

### 1.6 Regulatory & Compliance

#### FDA Import Requirements (Cold Chain Critical)

| Source | URL | Data | Access |
|--------|-----|------|--------|
| **FDA Import Alerts** | https://www.fda.gov/industry/actions-enforcement/import-alerts | Active import alerts by product/country | Web scraping |
| **FDA Data Dashboard** | https://datadashboard.fda.gov/ | Public FDA data, customizable graphics, API | API + dashboard |
| **openFDA API** | https://open.fda.gov/apis/food/enforcement/ | Food enforcement/recall data (2004-present) | Free REST API (JSON) |
| **FDA OASIS** | Part of import entry processing | Charge codes, violation categories | Referenced in import alerts |
| **FSMA Data Search** | https://datadashboard.fda.gov/oii/fd/ | FSMA compliance data | Dashboard |

**Confidence:** HIGH

**Critical for Blake's cold chain business:** FDA import alerts are THE regulatory risk for food/cold chain imports from SE Asia. Build a scraper that monitors import alerts by product category and country. Cross-reference against Blake's clients' shipments.

---

#### USDA APHIS (Phytosanitary)

| Source | URL | Data | Access |
|--------|-----|------|--------|
| **APHIS Plant Imports** | https://www.aphis.usda.gov/plant-imports | Import requirements by commodity | Web-based search (no public API found) |
| **ACIR Database** | Accessible via APHIS | Agricultural Commodity Import Requirements — treatments, facilities, schedules | Web search tool |
| **FAVIR Database** | Accessible via APHIS | Fruits and Vegetables Import Requirements | Web search tool |
| **APHIS Trade Manuals** | https://www.aphis.usda.gov/trade-management-manuals | Commodity import/export manuals | PDF downloads |

**Confidence:** MEDIUM (databases confirmed to exist but no API found — web scraping required)

**Strategy:** Scrape ACIR and FAVIR databases by product category and country of origin. Store requirements locally for instant lookup. Monitor Federal Register for APHIS regulatory changes. This is especially important for SE Asia cold chain imports — phytosanitary requirements vary significantly by product and country.

---

#### CBP Systems & Notifications

| Source | URL | Data | Access |
|--------|-----|------|--------|
| **CSMS** | https://www.cbp.gov/trade/automated/cargo-systems-messaging-service | ACE system updates, trade partner notifications | Email subscription |
| **CSMS Archive** | https://www.cbp.gov/document/guidance/csms-archive | Historical CSMS messages | Web scraping |
| **ACE Portal** | https://www.cbp.gov/trade/automated | Automated Commercial Environment — entry processing | Requires CBP partnership |

**Confidence:** HIGH (verified)

**Strategy:** Subscribe to CSMS email notifications programmatically (parse incoming emails). Scrape the CSMS archive for historical messages. CSMS provides critical system-level updates about ACE changes, filing deadlines, and system outages that affect all imports.

---

#### ITA Developer Portal

| Attribute | Detail |
|-----------|--------|
| **URL** | https://developer.trade.gov/apis |
| **Access** | Free API key registration |
| **Data** | US exporting info, trade leads, market intelligence, tariff data |
| **Format** | JSON endpoints |
| **Confidence** | HIGH |

**Strategy:** Register for free API keys. The ITA APIs provide supplementary trade intelligence including market research and trade leads. Lower priority than primary sources but useful for the Trade Intelligence AI agent.

---

## 2. Scraping & Storage Strategy

### 2.1 Data Source Classification

| Source | Method | Frequency | Format | Storage | Priority |
|--------|--------|-----------|--------|---------|----------|
| **HTS Schedule** | Download (JSON) | Weekly | JSON | PostgreSQL | P0 |
| **CROSS Rulings** | Web scrape | Daily | HTML -> structured | PostgreSQL + pgvector | P0 |
| **Federal Register** | REST API | Daily | JSON | PostgreSQL | P0 |
| **Section 301 Lists** | Download + parse | On Federal Register trigger | PDF -> structured | PostgreSQL | P1 |
| **AD/CVD Orders** | Web scrape | Weekly | HTML -> structured | PostgreSQL | P1 |
| **Carrier Schedules (Maersk, CMA CGM, Hapag-Lloyd)** | REST API | Daily | JSON | PostgreSQL | P0 |
| **Carrier Schedules (others)** | Web scrape | Daily | HTML -> structured | PostgreSQL | P1 |
| **AIS Vessel Tracking** | REST API (paid) | Real-time / hourly | JSON | PostgreSQL + TimescaleDB | P2 |
| **Port Congestion** | REST API (paid) | Daily | JSON | PostgreSQL | P2 |
| **Census Trade Stats** | REST API | Monthly | JSON | PostgreSQL | P1 |
| **UN Comtrade** | REST API | Monthly | JSON | PostgreSQL | P2 |
| **OFIS/FTZ Data** | Download + scrape | Monthly | Mixed | PostgreSQL | P1 |
| **FDA Import Alerts** | Web scrape | Daily | HTML -> structured | PostgreSQL | P0 (cold chain) |
| **USDA APHIS** | Web scrape | Weekly | HTML -> structured | PostgreSQL | P1 (cold chain) |
| **Demurrage/Detention Tariffs** | Web scrape | Monthly | HTML/PDF -> structured | PostgreSQL | P1 |
| **CSMS Messages** | Email parse + scrape | Daily | Email/HTML | PostgreSQL | P1 |
| **BOL Data (ImportGenius)** | Paid API (if available) | Daily/weekly | JSON/CSV | PostgreSQL | P2 |

### 2.2 Database Schema Strategy

**Primary Database: PostgreSQL (on Neon or Supabase)**

```
Core Tables:
├── hts_codes (hierarchical — chapter/heading/subheading/stat suffix)
│   ├── code, description, general_duty, special_duty, unit_qty
│   ├── effective_date, revision_number
│   └── section_301_additional_duty, ad_cvd_flag
│
├── customs_rulings (from CROSS)
│   ├── ruling_number, date, hts_codes[], product_description
│   ├── ruling_text, legal_reasoning
│   └── embedding (pgvector — for semantic search)
│
├── tariff_changes (from Federal Register monitoring)
│   ├── federal_register_citation, effective_date
│   ├── affected_hts_codes[], old_rate, new_rate
│   └── change_type (301, AD/CVD, general, trade_agreement)
│
├── carrier_schedules
│   ├── carrier, service_code, vessel_name, voyage
│   ├── origin_port, dest_port, departure_date, arrival_date
│   └── transit_days, transshipment_ports[]
│
├── vessel_positions (time-series — consider TimescaleDB extension)
│   ├── mmsi, vessel_name, lat, lng, speed, heading
│   ├── destination, eta, timestamp
│   └── port_proximity_flag
│
├── port_congestion
│   ├── port_code, date, vessels_at_berth, vessels_at_anchor
│   ├── avg_wait_time, avg_dwell_time
│   └── congestion_score
│
├── ftz_zones
│   ├── zone_number, grantee, operator, location
│   ├── sites[], subzones[]
│   └── manufacturing_approvals[]
│
├── fda_import_alerts
│   ├── alert_number, product_category, country
│   ├── alert_type, description, affected_firms[]
│   └── active_flag
│
├── ad_cvd_orders
│   ├── case_number, country, product_description
│   ├── hts_codes[], duty_rate, order_type (AD/CVD)
│   └── active_flag, effective_date
│
├── demurrage_tariffs
│   ├── carrier, terminal, equipment_type
│   ├── free_time_days, daily_rate_tiers[]
│   └── effective_date
│
└── trade_statistics
    ├── hs_code, country, direction (import/export)
    ├── period (monthly/annual), value, quantity
    └── source (census/comtrade)
```

**Extensions needed:**
- `pgvector` — vector embeddings for semantic search on rulings and product descriptions
- `pg_trgm` — trigram fuzzy text search for HTS code descriptions
- Consider `TimescaleDB` extension for vessel position time-series data

**Search Layer: Typesense (recommended over Meilisearch)**

Use Typesense for the user-facing HTS code search. Reasons:
- Built-in typo tolerance (critical for HTS code descriptions with technical terms)
- Query-time parameter configuration (adjust search behavior per query without re-indexing)
- Fast enough for instant search as users type product descriptions
- Self-hostable, open-source (C++)

Meilisearch is also good (Rust-based, slightly faster indexing) but Typesense's query-time flexibility is more valuable for trade data where the same index needs to be searched in different ways (by code number, by description, by duty rate range).

### 2.3 Data Freshness SLAs

| Data Category | Target Freshness | Consequence of Staleness |
|---------------|-----------------|--------------------------|
| HTS rates / tariff changes | < 24 hours after Federal Register publication | Wrong duty calculations — compliance risk |
| Carrier schedules | < 24 hours | Stale booking recommendations |
| FDA import alerts | < 24 hours | Compliance risk — detained shipments |
| AD/CVD orders | < 48 hours | Wrong duty calculations |
| CROSS rulings | < 48 hours | Classification model slightly stale (acceptable) |
| Port congestion | < 4 hours (real-time tier) / < 24 hours (standard) | Suboptimal routing |
| Trade statistics | < 30 days | Market intelligence slightly stale (acceptable) |
| FTZ data | < 30 days | Unlikely to change rapidly |
| Demurrage tariffs | < 30 days | Cost predictions may be off |

---

## 3. AI Services Architecture

### 3.1 AI Service 1: Tariff Classification Agent

**What it does:** Takes a product description (plain English or technical) and returns the most likely HTS codes with confidence scores.

**Training data:**
- 220K+ CROSS rulings (product description -> HTS code pairs)
- HTS schedule descriptions (hierarchical classification logic)
- Historical classification corrections

**Architecture:**
```
User Input (product description)
    ↓
Embedding → Vector Search (pgvector on CROSS rulings)
    ↓
Top-K similar rulings retrieved
    ↓
Claude API (with rulings as context + HTS hierarchy)
    ↓
Predicted HTS code(s) + confidence score + reasoning
    ↓
If confidence < threshold → flag for human review
```

**Key technical decisions:**
- Use Claude API (not fine-tuned model) with RAG over CROSS rulings — this outperforms fine-tuning for regulatory reasoning tasks
- The ATLAS benchmark shows even specialized fine-tuned models only hit 40% at 10-digit level — Claude with good retrieval can likely match or exceed this
- Embed rulings using `text-embedding-3-large` (OpenAI) or Claude embeddings
- Store embeddings in pgvector alongside structured ruling data
- Confidence scoring: based on number of similar rulings found, consistency of HTS codes across similar products, and distance metrics

**Monitoring for changes:**
- When Federal Register publishes tariff changes, the agent re-evaluates all active classifications against new rates
- Alert affected clients proactively

**Revenue model:** Per-classification fee or monthly subscription with classification volume tiers.

---

### 3.2 AI Service 2: Route Optimization Agent

**What it does:** Recommends optimal carrier/route combinations based on cost, transit time, reliability, and current conditions.

**Data inputs:**
- Carrier schedule APIs (all routes, transit times, transshipment options)
- Historical transit time data (actual vs. scheduled — build over time)
- Port congestion data (current dwell times, vessel wait times)
- AIS vessel tracking (real-time vessel positions and ETAs)
- Weather data (optional — NOAA API is free)
- Seasonal patterns (historical analysis)

**Architecture:**
```
Origin + Destination + Cargo Type + Deadline
    ↓
Query carrier schedules (all viable routes)
    ↓
For each route:
  - Base transit time (from schedule)
  - Congestion adjustment (from port data)
  - Historical reliability score (from past shipments)
  - Current vessel position/delay (from AIS)
  - Cost estimate (base rate + surcharges + congestion risk)
    ↓
Score and rank routes
    ↓
Present top 3 options with tradeoff analysis
```

**Key insight:** The real value isn't just finding routes — it's predicting delays. If the platform tracks enough shipments, it can build a historical database of actual vs. scheduled transit times by carrier/route/season and predict delays with increasing accuracy.

**Revenue model:** Included in platform subscription — this is a core differentiator.

---

### 3.3 AI Service 3: Cost Prediction Agent (Landed Cost Calculator)

**What it does:** Predicts total landed cost including all hidden fees, duties, and risks.

**Cost components to model:**
1. Ocean freight (base rate — from carrier quotes or market indices)
2. Fuel surcharges (BAF — from carrier tariffs)
3. Terminal handling charges (from terminal tariff schedules)
4. Customs duties (from HTS classification + tariff data)
5. Section 301/AD/CVD additional duties (from tariff change monitoring)
6. Customs brokerage fees (known fixed rates)
7. ISF filing fees (known)
8. Demurrage risk (probability-weighted based on congestion data)
9. Detention risk (probability-weighted based on historical patterns)
10. CBP exam probability (based on product type, origin country, importer history)
11. FDA/USDA inspection probability (for cold chain — based on import alert status)
12. Drayage (known rates by terminal/destination)
13. Warehouse handling (known rates)
14. Insurance (percentage of cargo value)

**Architecture:**
```
Shipment Details (product, origin, destination, value, quantity)
    ↓
Tariff Classification Agent → duty rates
    ↓
Route Optimization Agent → freight costs, transit time
    ↓
Historical data analysis:
  - Demurrage probability at destination port
  - Exam probability for this product/origin
  - Typical detention duration
    ↓
Monte Carlo simulation or probabilistic model:
  - Best case landed cost
  - Expected landed cost
  - Worst case landed cost (95th percentile)
    ↓
Anomaly detection: compare against historical benchmarks
  - Flag if any component is >2 std dev from historical
```

**Revenue model:** Premium feature — this is extremely high-value for importers who currently get surprised by hidden costs.

---

### 3.4 AI Service 4: Compliance Monitoring Agent

**What it does:** Continuously monitors regulatory sources and alerts clients about changes affecting their shipments.

**Monitoring sources (all scrapable/API-accessible):**
1. Federal Register (API) — tariff changes, regulatory notices
2. CBP CSMS — system changes, filing requirements
3. FDA Import Alerts — detention without physical examination (DWPE) alerts
4. USDA APHIS — phytosanitary requirement changes
5. USTR notices — Section 301 exclusions and modifications
6. AD/CVD — new cases, rate changes

**Architecture:**
```
Daily cron jobs scrape/poll all sources
    ↓
New notices ingested and parsed by Claude API:
  - Extract: affected HTS codes, countries, effective dates, action type
  - Classify: tariff change, compliance requirement, system update, etc.
    ↓
Cross-reference against client profiles:
  - What products do they import?
  - From which countries?
  - Through which ports?
    ↓
Generate targeted alerts:
  - "New Section 301 tariff increase on HTS 8507.60 (lithium batteries)
     effective Jan 1, 2026. Your Q1 shipments from China affected.
     Estimated additional duty: $X per container."
    ↓
Dashboard + email + SMS notifications
```

**Revenue model:** Core platform feature — this is what keeps users engaged daily. Include in subscription.

---

### 3.5 AI Service 5: FTZ Strategy Optimizer

**What it does:** Analyzes whether using an FTZ would save money vs. direct entry, and optimizes withdrawal timing.

**Data inputs:**
- OFIS FTZ zone/site data (locations, operators, capabilities)
- HTS duty rates (current and historical trends)
- Client's import patterns (products, volumes, timing)
- Inverted tariff analysis (component vs. finished product rates)
- FTZ admission, handling, and storage costs

**Architecture:**
```
Client import profile (products, origins, volumes, timing)
    ↓
For each product line:
  - Current duty rate on components vs. finished product
  - Section 301/AD/CVD exposure
  - Volume and frequency of imports
  - Nearest FTZ with appropriate capabilities
    ↓
Calculate:
  - Direct entry total duty cost (annualized)
  - FTZ entry with weekly withdrawal
  - FTZ entry with monthly withdrawal
  - FTZ entry with demand-based withdrawal
  - FTZ manufacturing (if inverted tariff benefit exists)
    ↓
Factor in FTZ costs:
  - Admission fees, handling, storage, customs entry per withdrawal
    ↓
Recommend optimal strategy + projected annual savings
```

**Revenue model:** Consulting-style engagement for setup, then ongoing optimization as subscription feature.

---

### 3.6 AI Service 6: Trade Intelligence Agent

**What it does:** Analyzes market trends, competitor patterns, and trade lane intelligence.

**Data inputs:**
- Census Bureau trade statistics (HS code x country x month)
- UN Comtrade (international flows)
- BOL data (from ImportGenius or CBP FOIA)
- Tariff change trends

**Capabilities:**
1. **Competitor import analysis** — who's importing what, from where, in what volumes (from BOL data)
2. **Trade lane trending** — identify growing/shrinking trade corridors
3. **Product category sizing** — how big is the market for X from Y country
4. **Supplier discovery** — identify factories/exporters in SE Asia by product category
5. **Tariff impact modeling** — "if Section 301 tariffs increase to X%, what happens to import volumes from China vs. Vietnam"

**Revenue model:** Premium analytics tier — this is competitive intelligence that companies pay serious money for.

---

## 4. Tech Stack for Data Pipeline

### 4.1 Recommended Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Web Scraping** | **Crawlee** (TypeScript) with PlaywrightCrawler | Best-in-class for scheduled scraping — autoscaling pool, proxy rotation, session management, anti-detection. Hybrid mode: CheerioCrawler for static pages (10-50x faster), PlaywrightCrawler for JS-heavy sites |
| **API Client** | Custom TypeScript clients per carrier | Type-safe, testable, carrier-specific response handling |
| **Pipeline Orchestration** | **Inngest** | Event-driven, step functions with sleep/retry, managed cloud with generous free tier (50K runs/mo). Better workflow orchestration than Trigger.dev. Works with Vercel/serverless |
| **Primary Database** | **PostgreSQL** (Neon) | Already in Blake's stack. Add pgvector for embeddings, pg_trgm for fuzzy text search |
| **Vector Search** | **pgvector** (PostgreSQL extension) | Keep vectors co-located with structured data. Avoids separate Pinecone/Weaviate cost. Good enough for 200K+ ruling embeddings |
| **Full-Text Search** | **Typesense** (self-hosted or cloud) | Typo-tolerant instant search for HTS codes and product descriptions |
| **Time-Series** | **TimescaleDB** extension on PostgreSQL | For vessel position tracking and historical transit time analysis |
| **AI/LLM** | **Claude API** (Anthropic) | Best reasoning for regulatory/classification tasks. Use claude-sonnet-4 for most tasks, claude-opus-4 for complex tariff analysis |
| **Embeddings** | **OpenAI text-embedding-3-large** or **Voyage AI** | High-quality embeddings for semantic search on trade rulings |
| **Monitoring** | **Inngest dashboard** + custom freshness checks | Track scraper health, data freshness, API response times |
| **Alerting** | **Resend** (email) + **Twilio** (SMS) | Multi-channel notifications for compliance alerts |

### 4.2 Alternative Considered and Rejected

| Category | Rejected | Why |
|----------|----------|-----|
| Scraping | Scrapy (Python) | Crawlee's TypeScript integration is better if the main app is TypeScript/Next.js |
| Scraping | Puppeteer | Crawlee wraps Playwright and adds crawling-specific features (queue, autoscale, proxy rotation) |
| Orchestration | Trigger.dev | Smaller free tier (5K vs 50K runs), less advanced step functions |
| Orchestration | Cron jobs (raw) | No retry, no observability, no step function composition |
| Vector DB | Pinecone | Additional service to manage + cost. pgvector is sufficient for this scale (< 1M vectors) |
| Search | Elasticsearch | Overkill for this use case, operational overhead. Typesense is simpler and faster for instant search |
| Search | Meilisearch | Good alternative but Typesense's query-time configuration is more flexible for trade data |

### 4.3 Pipeline Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    INNGEST ORCHESTRATOR                   │
│  (Event-driven pipelines with retry, scheduling, steps)  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  HTS Scraper │  │ CROSS Scraper│  │ Fed Register │   │
│  │  (weekly)    │  │  (daily)     │  │  API (daily) │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                  │                  │           │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐   │
│  │Carrier APIs  │  │ FDA Alerts   │  │ Port Data    │   │
│  │(daily)       │  │ (daily)      │  │ (hourly)     │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                  │                  │           │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐   │
│  │USDA APHIS    │  │ AD/CVD DB    │  │ Census API   │   │
│  │(weekly)      │  │ (weekly)     │  │ (monthly)    │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         └──────────────────┼──────────────────┘           │
│                            ▼                              │
│              ┌──────────────────────┐                     │
│              │   CHANGE DETECTION   │                     │
│              │  (diff against DB)   │                     │
│              └──────────┬───────────┘                     │
│                         │                                 │
│              ┌──────────▼───────────┐                     │
│              │    PostgreSQL (Neon) │                     │
│              │  + pgvector          │                     │
│              │  + pg_trgm           │                     │
│              │  + TimescaleDB       │                     │
│              └──────────┬───────────┘                     │
│                         │                                 │
│    ┌────────────────────┼────────────────────┐           │
│    ▼                    ▼                    ▼           │
│ Typesense          AI Services         Alert Engine      │
│ (HTS Search)   (Classification,     (Email + SMS)        │
│                 Route, Cost, etc)                         │
└─────────────────────────────────────────────────────────┘
```

### 4.4 Estimated Infrastructure Costs (Monthly)

| Service | Tier | Monthly Cost |
|---------|------|-------------|
| PostgreSQL (Neon) | Pro | $19-69 |
| Inngest | Pro (100K runs) | $50 |
| Typesense Cloud | Starter | $29 |
| Claude API | Usage-based | $50-200 (depends on classification volume) |
| OpenAI Embeddings | Usage-based | $10-30 |
| Datalastic (AIS) | Starter | ~$199 EUR (~$215) |
| Crawlee hosting (VPS) | 4GB RAM | $20-40 |
| Resend (email) | Starter | $20 |
| **Total (Phase 1)** | | **~$200-400/mo** (without AIS/port data) |
| **Total (Full)** | | **~$450-700/mo** |

---

## 5. Legal Considerations

### 5.1 Government Data (Free and Clear)

All US government data sources are public domain and freely usable:
- HTS Schedule (USITC)
- CROSS Rulings (CBP)
- Federal Register
- Census Bureau trade data
- OFIS/FTZ data
- FDA import alerts
- USDA APHIS requirements
- AD/CVD orders
- CSMS messages

**No legal risk** in scraping, storing, or redistributing this data.

### 5.2 Carrier Data (Check Terms of Service)

- **Maersk, CMA CGM, Hapag-Lloyd APIs:** Free to use currently. Check each carrier's API License Terms for redistribution restrictions. Maersk reserves right to implement paid tiers.
- **Scraping carrier websites** (for those without APIs): Check robots.txt and Terms of Service. Generally, publicly displayed schedule data is factual and not copyrightable, but ToS violations could lead to IP blocks.

### 5.3 Third-Party Paid Data

- **AIS data** (Datalastic, VesselFinder): Subject to license agreements. Typically cannot redistribute raw AIS data — can use for derived insights.
- **ImportGenius/Panjiva:** Subscription-based access to aggregated public (FOIA) data. Redistribution typically restricted by terms.
- **Port congestion APIs:** License-dependent.

### 5.4 Bill of Lading Data

US import BOL data is public record under FOIA. However:
- Some importers have filed for confidentiality with CBP
- Aggregators like ImportGenius add value through organization/search
- Building your own BOL database from FOIA requests is legal but slow

---

## 6. Phase Recommendations for Roadmap

### Phase 1: Data Foundation (Weeks 1-4)
Build the core data pipeline with free government sources:
- HTS schedule ingestion (JSON download -> PostgreSQL)
- CROSS rulings scraping (220K+ rulings -> PostgreSQL + pgvector embeddings)
- Federal Register API monitoring (daily trade-relevant notices)
- Typesense index for HTS code search
- Basic Inngest pipelines for scheduling

**Delivers:** Searchable HTS database, tariff change monitoring, ruling knowledge base

### Phase 2: AI Classification + Compliance (Weeks 5-8)
Build the first two AI services:
- Tariff Classification Agent (RAG over CROSS rulings + Claude API)
- Compliance Monitoring Agent (Federal Register + FDA alerts -> client notifications)
- AD/CVD database integration
- FDA import alert monitoring (critical for cold chain)

**Delivers:** Auto-classify products to HTS codes, get alerts when tariffs change

### Phase 3: Carrier & Route Intelligence (Weeks 9-12)
Add carrier schedule data and routing:
- Maersk, CMA CGM, Hapag-Lloyd API integrations
- Web scraping for remaining carriers
- Route Optimization Agent
- Basic landed cost calculator

**Delivers:** Multi-carrier schedule search, route recommendations, cost estimates

### Phase 4: Advanced Analytics (Weeks 13-16)
Premium features:
- AIS vessel tracking integration
- Port congestion monitoring
- Cost Prediction Agent (with probabilistic modeling)
- FTZ Strategy Optimizer
- Demurrage/detention risk modeling

**Delivers:** Real-time shipment tracking, advanced cost prediction, FTZ optimization

### Phase 5: Trade Intelligence (Weeks 17-20)
Market intelligence layer:
- Census Bureau + UN Comtrade integration
- BOL data analysis (ImportGenius or FOIA)
- Trade Intelligence Agent
- Competitor import analysis
- Market sizing tools

**Delivers:** Competitive intelligence, market analysis, supplier discovery

---

## Sources

### Government (HIGH confidence)
- [USITC HTS Schedule](https://hts.usitc.gov/)
- [CBP CROSS Rulings](https://rulings.cbp.gov/)
- [Federal Register](https://www.federalregister.gov/)
- [USTR Section 301](https://ustr.gov/issue-areas/enforcement/section-301-investigations/tariff-actions)
- [CBP AD/CVD Data](https://www.cbp.gov/trade/priority-issues/adcvd/data)
- [Census Bureau Foreign Trade API](https://www.census.gov/data/developers/data-sets/international-trade.html)
- [USA Trade Online](https://usatrade.census.gov/)
- [UN Comtrade](https://comtrade.un.org/)
- [OFIS FTZ Database](https://ofis.trade.gov/)
- [FDA Import Alerts](https://www.fda.gov/industry/actions-enforcement/import-alerts)
- [openFDA API](https://open.fda.gov/apis/food/enforcement/)
- [USDA APHIS Plant Imports](https://www.aphis.usda.gov/plant-imports)
- [CBP CSMS](https://www.cbp.gov/trade/automated/cargo-systems-messaging-service)
- [MARAD Port Data](https://www.maritime.dot.gov/data-reports/ports)
- [Army Corps WCSC](https://ndc.ops.usace.army.mil/wcsc/webpub/)
- [ITA Developer Portal](https://developer.trade.gov/apis)
- [USITC DataWeb](https://dataweb.usitc.gov/)

### Carrier APIs (MEDIUM confidence — verified portals, need hands-on testing)
- [Maersk Developer](https://developer.maersk.com/)
- [CMA CGM API Portal](https://api-portal.cma-cgm.com/)
- [Hapag-Lloyd API Portal](https://api-portal.hlag.com/)
- [DCSA Standards](https://dcsa.org/standards)
- [DCSA OpenAPI (GitHub)](https://github.com/dcsaorg/DCSA-OpenAPI)

### Third-Party Data (MEDIUM confidence — pricing/access needs verification)
- [Datalastic AIS API](https://datalastic.com/)
- [VesselFinder API](https://api.vesselfinder.com/)
- [AISHub (free)](https://www.aishub.net/)
- [Portcast Port Congestion](https://www.portcast.io/)
- [GoComet Congestion](https://www.gocomet.com/)
- [Vizion TradeView](https://www.vizionapi.com/)
- [ImportGenius](https://www.importgenius.com/)
- [Panjiva (S&P Global)](https://panjiva.com/)
- [JSONCargo Multi-Carrier API](https://jsoncargo.com/)

### AI/ML Research (MEDIUM confidence)
- [ATLAS HTS Classification Benchmark](https://arxiv.org/html/2509.18400v1)
- [Zonos Classify](https://zonos.com/classify)

### Tech Stack (HIGH confidence — verified docs)
- [Crawlee](https://crawlee.dev/)
- [Inngest](https://www.inngest.com/)
- [Typesense](https://typesense.org/)
- [pgvector](https://github.com/pgvector/pgvector)
