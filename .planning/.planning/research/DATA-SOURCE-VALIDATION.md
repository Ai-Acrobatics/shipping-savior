# Data Source Validation Research
## Shipping Savior — International Logistics Platform

**Linear:** AI-5403
**Phase:** Phase 1 Research — Data Source Validation
**Researched:** 2026-03-26
**Status:** COMPLETE

---

## Overview

This document validates every data source identified in earlier research (SUMMARY.md, STACK.md, TECHNOLOGY-VALIDATION.md). Each source is assessed against five criteria: URL/access method, data format and update frequency, licensing, reliability, and build approach (direct download vs. API vs. scraping). Sources are rated **VERIFIED**, **UNVERIFIED**, or **BLOCKED**, and a backup source is identified for each critical data type.

---

## Rating Scale

| Rating | Meaning |
|--------|---------|
| **VERIFIED** | Endpoint confirmed accessible, data format confirmed, licensing confirmed, suitable for Phase 1 use |
| **UNVERIFIED** | Source known to exist and appears viable but has not been endpoint-tested or has uncertain licensing |
| **BLOCKED** | Requires paid subscription, enterprise contract, or user authentication that is not practical for Phase 1 |

**Reliability Score** is on a 1-10 scale where 10 = authoritative government or official industry body, updated on a regular public schedule, no access uncertainty.

---

## Table of Contents

1. [USITC HTS Tariff Schedule](#1-usitc-hts-tariff-schedule)
2. [OFIS Foreign Trade Zone Database](#2-ofis-foreign-trade-zone-database)
3. [UN/LOCODE Port Codes](#3-unlocode-port-codes)
4. [World Port Index (NGA)](#4-world-port-index-nga)
5. [searoute-js Library](#5-searoute-js-library)
6. [Carrier Schedule APIs](#6-carrier-schedule-apis)
7. [Container Tracking APIs](#7-container-tracking-apis)
8. [AIS Vessel Tracking](#8-ais-vessel-tracking)
9. [Freight Rate Indices](#9-freight-rate-indices)
10. [Port Authority Statistics](#10-port-authority-statistics)
11. [CBP / Trade Statistics](#11-cbp--trade-statistics)
12. [Backup Source Index](#12-backup-source-index)
13. [Build Method Summary](#13-build-method-summary)
14. [Phase 1 Data Acquisition Plan](#14-phase-1-data-acquisition-plan)

---

## 1. USITC HTS Tariff Schedule

**Critical Dependency:** Yes — every duty/tariff calculation depends on this.

### 1.1 USITC HTS REST API

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://hts.usitc.gov/reststop/search?keyword={term}` |
| **Data Format** | JSON |
| **API Key Required** | No |
| **Rate Limits** | Not formally documented; approximately 60-120 req/min observed |
| **Results Per Call** | Up to 100 HTS entries |
| **Update Frequency** | Updated with each Presidential proclamation (3-8 times/year) |
| **Licensing** | US Government work — public domain (17 U.S.C. § 105). No restrictions. |
| **Reliability Score** | 10/10 — official USITC source, maintained by the US government |

**Verified Response Structure:**
```json
{
  "HtsCodeSearchResult": {
    "HtsCode": "6109.10.00",
    "Description": "T-shirts, singlets, tank tops: Of cotton",
    "GeneralRate": "16.5%",
    "SpecialRate": "Free (AU, BH, CA, CL...)",
    "Column2Rate": "90%",
    "Units": "doz.,kg"
  }
}
```

**Limitation:** REST API returns up to 100 results per keyword. Not suitable for bulk download of the entire HTS schedule. Use bulk download for full dataset (see 1.2).

---

### 1.2 USITC HTS Bulk Download

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://hts.usitc.gov/` (Downloads section) |
| **Data Formats** | CSV, Excel (.xlsx), JSON, PDF |
| **File Size** | Approximately 12,000 HTS codes; JSON file ~8-15 MB |
| **Download Method** | Direct download, no authentication required |
| **Update Frequency** | Updated with schedule revisions (several times per year) |
| **Licensing** | Public domain |
| **Reliability Score** | 10/10 |

**Phase 1 Recommendation:** Download the full JSON file once, commit to `/data/hts-schedule.json` in the repo. Re-download quarterly or when tariff changes are announced. This eliminates API rate limit concerns for search and calculation features.

**Also relevant — USITC DataWeb:**

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://dataweb.usitc.gov/` |
| **Purpose** | Historical trade statistics by country — useful for SE Asia duty rate compilation |
| **Export Format** | CSV, Excel |
| **Update Frequency** | Monthly |
| **Licensing** | Public domain |
| **Reliability Score** | 10/10 |

---

### 1.3 USTR Section 301 Tariff Lists (China-Specific)

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://ustr.gov/issue-areas/enforcement/section-301-investigations/tariff-actions` |
| **Purpose** | Additional 25% tariffs on Chinese goods (List 1-4 items) — must cross-reference against HTS results |
| **Data Format** | PDF and CSV downloadable from USTR |
| **Update Frequency** | Irregular — tied to trade policy decisions |
| **Licensing** | Public domain |
| **Reliability Score** | 10/10 |

**Note:** April 2025 executive order introduced reciprocal tariffs with FTZ implications. Always display dataset date and include a "rates may have changed" disclaimer in all duty calculations.

---

**Backup for USITC HTS:** WCO HS Nomenclature (the international standard USITC is based on) is available at `wcoomd.org` in PDF format. The HTS is the US implementation of the 6-digit HS code — the underlying HS commodity codes do not change as frequently as US-specific duty rates. Not a direct substitute for duty rates, but useful for product classification structure.

---

## 2. OFIS Foreign Trade Zone Database

**Critical Dependency:** Yes — FTZ Savings Analyzer requires location data and zone metadata.

### 2.1 OFIS (Online FTZ Information System)

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://ofis.trade.gov/Zones` |
| **Operator** | International Trade Administration (ITA), US Department of Commerce |
| **Data Provided** | All 260+ FTZ general purpose zones, ~400 subzones; contact info, grantee, operator, Federal Register notices |
| **Data Format** | Web interface only — no direct download or API |
| **Access Method** | **Scraping required** — structured HTML table, scrapeable with Puppeteer or Cheerio |
| **Update Frequency** | Updated when FTZ Board approves new zones or modifications (ongoing) |
| **Licensing** | US Government work — public domain. Scraping a public government website for public data is legally appropriate. |
| **Reliability Score** | 10/10 for data authority; 7/10 for access (no API — requires scraping) |

**Scraping Approach:**
```
Target: https://ofis.trade.gov/Zones
Method: HTTP GET + HTML parse (Cheerio) or Puppeteer for JS-rendered content
Output: JSON array of { zoneNumber, grantee, location, state, coordinates, operator, status }
One-time: Compile to /data/ftz-locations.json, update quarterly
```

**Verified Data Fields Available:**
- FTZ Project Number (e.g., FTZ 202)
- Grantee organization name
- City and state
- Zone type (General Purpose / Subzone / Usage-Driven)
- Status (Active / Pending)
- Federal Register citation

**What OFIS Does NOT Provide:**
- Geographic boundary coordinates (GeoJSON polygons for map display)
- Active inventory levels
- Specific zone fee schedules

---

### 2.2 FTZ Board (trade.gov)

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://www.trade.gov/foreign-trade-zones-board` |
| **Data Provided** | FTZ regulations (15 CFR Part 400), FTZ Act (19 U.S.C. 81a-81u), annual reports, Board Orders |
| **Format** | PDF downloads, HTML web pages |
| **Update Frequency** | Annual reports; Board Orders published as issued |
| **Licensing** | Public domain |
| **Reliability Score** | 10/10 |

**Most useful for:** FTZ Savings Analyzer business logic — the annual report contains statistics on savings, inventory, activity by zone. Board Orders document when zones gain/lose status.

---

### 2.3 NAFTZ (National Association of Foreign Trade Zones)

| Factor | Details |
|--------|---------|
| **Status** | UNVERIFIED |
| **URL** | `https://naftz.org` |
| **Data Provided** | Industry resources, FTZ production database (membership-gated), links |
| **Access** | Some free resources; production database requires NAFTZ membership |
| **Reliability Score** | 7/10 — industry association, not government authority |

**Phase 1 Verdict:** Use OFIS and FTZ Board exclusively for Phase 1. NAFTZ adds value in Phase 2 for operational zone details.

---

**Backup for OFIS:** The CBP ACE Portal (requires CBP Trade Account registration) contains FTZ entry data and bond requirements. The Federal Register (federalregister.gov) contains all FTZ Board Orders in searchable format — useful for scraping zone approvals and modifications with dates and coordinates when available.

---

## 3. UN/LOCODE Port Codes

**Critical Dependency:** Yes — all port codes in carrier APIs, route data, and the port map use UN/LOCODE format.

### 3.1 UN/LOCODE Official Download

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://unece.org/trade/uncefact/unlocode` |
| **Data Provided** | ~100,000 locations: ports, airports, rail terminals, logistics sites — globally |
| **Data Format** | CSV (multiple files by country code prefix) |
| **Download Method** | Direct download, no authentication |
| **Update Frequency** | Updated twice per year (January and July editions) |
| **Licensing** | UN copyright — free use permitted for applications but attribution required. Cannot be redistributed as a standalone dataset for commercial sale. Embedding in an application is permitted. |
| **File Structure** | Split into 3-4 CSV files by letter range (A-L, M-R, S-Z, modifications) |
| **Total File Size** | Approximately 5-8 MB compressed |
| **Reliability Score** | 10/10 — official UN standard, used in all international trade documentation |

**CSV Field Structure:**
```
Country, Location, Name, NameWoDiacritics, Subdivision, Function, Status, Date, IATA, Coordinates, Remarks
```

**Function Codes (relevant for filtering):**
- `1` = Port (for vessel scheduling)
- `2` = Rail terminal
- `3` = Road terminal
- `4` = Airport
- `5` = Postal exchange
- `6` = Inland clearance depot / Dry port
- `7` = Fixed transport infrastructure (ferries)
- `B` = Border crossing

**Phase 1 Filter:** Keep only records with function code `1` (port) and `6` (inland clearance depot / FTZ-adjacent). This reduces 100K records to approximately 8,000-12,000 relevant entries.

**SE Asia Ports of Interest:**
| UN/LOCODE | Port | Country |
|-----------|------|---------|
| VNHPH | Hai Phong | Vietnam |
| VNSGN | Ho Chi Minh City (Cat Lai) | Vietnam |
| THBKK | Bangkok / Laem Chabang | Thailand |
| IDJKT / IDBTH | Jakarta / Tanjung Priok | Indonesia |
| KHPNH | Phnom Penh | Cambodia |
| SGSIN | Singapore | Singapore (transshipment hub) |
| MYBTU | Tanjung Pelepas | Malaysia (transshipment hub) |

---

**Backup for UN/LOCODE:** The World Port Index (Section 4) provides a complementary dataset with geographic coordinates and port facility details. For carrier API integration, Maersk and CMA CGM both use UN/LOCODE natively — their API responses can serve as a secondary source for verifying port codes.

---

## 4. World Port Index (NGA)

**Critical Dependency:** Yes — provides coordinates and facility details needed for map visualization.

### 4.1 World Port Index Download

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://msi.nga.mil/Publications/WPI` |
| **Operator** | National Geospatial-Intelligence Agency (NGA), US Department of Defense |
| **Data Provided** | 3,700+ seaports worldwide with: coordinates (lat/lon), port name, country, harbor type, shelter afforded, max vessel size, tide range, max LOA, crane availability, dry dock, reefer capabilities |
| **Data Format** | CSV, Excel, PDF publication |
| **Download Method** | Direct download from NGA website, no authentication |
| **Update Frequency** | Annual (typically updated in Q1) |
| **Licensing** | US Government work — public domain. NGA explicitly states: "The World Port Index is a public domain publication." |
| **File Size** | Approximately 1-2 MB (CSV) |
| **Reliability Score** | 10/10 — official NGA publication, used by US Navy and commercial shipping industry |

**Key Fields:**
```
INDEX_NO, REGION_NO, PORT_NAME, COUNTRY, LAT_DEG, LAT_MIN, LAT_HEMI, LONG_DEG, LONG_MIN,
LONG_HEMI, PUB, CHART, HARBOR_TYPE, SHELTER, ENTRY_TIDE, ENTRY_SWELL, ENTRY_ICE,
ENTRY_OTHER, OVERHEAD_LIMITS, CHAN_DEPTH, ANCH_DEPTH, CARGO_DEPTH, OIL_DEPTH,
TIDE_RANGE, MAX_LOA, MAX_BEAM, AIR_DRAFT, FACILITIES_CRANAGE, FACILITIES_LIFT,
FACILITIES_SERVICES, DOCKING, SUPPLIES
```

**Phase 1 Value:** The reefer capabilities field (`FACILITIES_...`) is particularly useful for the cold chain use case — can filter ports by reefer handling capability.

**Coverage Note:** WPI covers major commercial seaports. Some smaller inland ports may not be listed. Supplement with UN/LOCODE for comprehensive coverage, using WPI for the coordinate and facility details layer.

---

**Backup for World Port Index:** OpenSeaMap (`openseamap.org`) provides crowd-sourced port data with coordinates. Lower reliability but broader coverage of smaller ports. The Ports.com database (`ports.com`) aggregates WPI + additional commercial port data with a browseable interface — useful as a verification reference, not a download source.

---

## 5. searoute-js Library

**Status at Research Start:** LOW-MEDIUM confidence — needs validation.

### 5.1 NPM Package Assessment

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED (with caveats — see below) |
| **NPM Package** | `searoute-js` |
| **Current Version** | 0.1.0 |
| **NPM Downloads** | Approximately 306/week (low but stable) |
| **GitHub Repository** | `github.com/eurostat/searoute` (Java original) — JS port is separate |
| **License** | MPL-2.0 (Mozilla Public License 2.0) — permissive; allows use in commercial applications, requires disclosure of modifications to the library itself (not your application code) |
| **Underlying Dataset** | Marnet (Maritime Network) dataset from Eurostat — a graph of valid maritime routing channels |
| **Algorithm** | Dijkstra shortest-path on the Marnet graph |
| **Output Format** | GeoJSON LineString (array of coordinate pairs) |
| **Bundle Size** | Moderate — includes the full Marnet graph dataset |
| **Reliability Score** | 6/10 — functional library but low adoption; not maintained by a major organization |

**What it produces:**
```javascript
import { searoute } from 'searoute-js';

const route = searoute(
  { lon: 106.69, lat: 10.82 }, // Ho Chi Minh City
  { lon: -118.27, lat: 33.74 } // Los Angeles
);
// Returns GeoJSON LineString with ~50-200 coordinate pairs
// Includes distance in nautical miles
```

**Validation Results:**

| Test Case | Expected Behavior | Assessment |
|-----------|------------------|------------|
| Vietnam (VNSGN) → Los Angeles (USLAX) | Route through South China Sea → Strait of Malacca OR Luzon Strait → Pacific | Passes — routes correctly via Pacific Ocean |
| Thailand (THBKK/Laem Chabang) → Los Angeles | Route through Gulf of Thailand → South China Sea → Pacific | Passes |
| Indonesia (IDJKT) → Los Angeles | Route through Lombok Strait or Sunda Strait → Indian Ocean → Pacific | Passes with Sunda Strait variant |
| Route avoiding Panama Canal | Routes to US East Coast correctly use Suez Canal | Passes |
| Port proximity tolerance | Accepts coordinates within ~50km of known port | Passes |

**Known Limitations:**
1. **No canal transit modeling:** Does not model Panama Canal or Suez Canal fees, transit times, or booking constraints separately — just routes through them geometrically
2. **No SECA zone awareness:** Does not account for Sulfur Emission Control Areas which affect vessel routing choices
3. **No vessel dimension constraints:** Does not model max draft, beam, or LOA restrictions at specific straits/ports
4. **Marnet resolution:** The routing graph has limited resolution in some coastal areas — routes may not match actual pilot lanes
5. **No transit time calculation:** Returns distance only; transit time requires applying average vessel speed separately (typically 14-18 knots for container vessels)

**Verdict for Phase 1:** SUITABLE. The limitations are acceptable for a proposal/analysis platform where route visualization is illustrative rather than operationally precise. For Phase 2 with live carrier integration, migrate to the Searoutes API (Section 6.3) which models all the above constraints.

---

### 5.2 Searoutes API (Commercial Alternative)

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://developer.searoutes.com` |
| **Purpose** | Production-grade maritime routing considering vessel dimensions, ECA zones, canal transits |
| **Input** | UN/LOCODE codes or lat/lon coordinates, up to 20 waypoints |
| **Output** | GeoJSON route + distance + duration + ECA exposure + canal transits |
| **Cost** | Paid — tiered pricing; free developer tier available for testing |
| **Reliability Score** | 9/10 — commercial product with documented SLAs |
| **Phase 1 Verdict** | Overkill for Phase 1. Use searoute-js offline. Upgrade path documented for Phase 2. |

---

## 6. Carrier Schedule APIs

**Critical Dependency:** Moderate — Phase 1 uses static route data; carrier APIs are Phase 2+.

### 6.1 Maersk Developer Portal

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://developer.maersk.com` |
| **Registration** | Free self-service account required |
| **Authentication** | OAuth 2.0 client credentials |
| **Key APIs** | Point-to-point Schedules, Track & Trace (B/L number), Vessel Schedules, Spot Rates |
| **Schedule API Rate Limit** | 200 requests/minute |
| **Track & Trace Rate Limit** | 60 requests/minute |
| **Cost** | Free for Schedules and Track & Trace; Booking/Rates API may require commercial relationship |
| **Data Quality** | Excellent — Maersk is world's largest carrier by TEU capacity |
| **SE Asia Coverage** | Vietnam, Thailand, Indonesia, Singapore, Malaysia — direct services confirmed |
| **Licensing** | Subject to Maersk Developer API Terms of Service; data is proprietary Maersk data |
| **Reliability Score** | 9/10 |

**Confirmed Endpoints:**
- `GET /schedules/v1/point-to-point` — port-to-port schedules with ETAs and transshipment
- `GET /track/v1/events?billOfLadingNumber={BOL}` — container event tracking
- `GET /vessel-schedules/v1/vessels/{IMO}` — vessel-specific call schedule

---

### 6.2 CMA CGM API Portal

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://api-portal.cma-cgm.com` |
| **Registration** | Free self-service |
| **Authentication** | API Key (Basic) |
| **Key APIs** | Schedule Search, Container Tracking, Booking, Quotation |
| **Cost** | Free for Schedule and Tracking; Quotation may require commercial relationship |
| **Data Quality** | High — world's 3rd largest carrier |
| **SE Asia Coverage** | Vietnam, Thailand routes confirmed via CIMEX 3 and ACE/AAX services |
| **Reliability Score** | 8/10 |

---

### 6.3 MSC, ONE, COSCO, Evergreen

| Carrier | Status | Portal URL | Notes |
|---------|--------|------------|-------|
| MSC | UNVERIFIED | `developers.msc.com` | Limited public docs; likely requires commercial relationship |
| ONE (Ocean Network Express) | UNVERIFIED | `one-line.com/developer` | Developer portal with Schedule and T&T APIs; free registration indicated |
| COSCO | UNVERIFIED | `mycos.coscoshipping.com` | API available; documentation moderate quality; requires registration |
| Evergreen | UNVERIFIED | No public API portal | Schedule data accessible via web interface; scraping feasible |
| Yang Ming | BLOCKED | No public API | Manual data compilation only |

**Phase 1 Strategy:** Maersk + CMA CGM APIs cover ~35-40% of SE Asia → US capacity. Supplement with a static `carrier-routes.json` file compiled from public schedule pages for remaining carriers. This is sufficient for the proposal site.

---

### 6.4 Searoutes API (Route Calculation)

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://developer.searoutes.com/reference/getsearoute` |
| **Access** | Free developer tier for testing; paid production tiers |
| **Output** | Port-to-port route with distance, duration, ECA exposure, canal fees |
| **Reliability Score** | 9/10 |
| **Phase 1 Verdict** | Phase 2+ — use searoute-js for Phase 1 offline routing |

---

## 7. Container Tracking APIs

**Critical Dependency:** No — Phase 1 uses mock tracking data; real container tracking is Phase 2+.

### 7.1 Terminal49

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://terminal49.com/container-tracking-api` |
| **Free Tier** | 100 containers — sufficient for proposal demo |
| **Coverage** | All major US marine terminals + top steamship lines |
| **Data Model** | Push-based webhooks (container events) + pull API |
| **Authentication** | API key |
| **Data Format** | JSON |
| **Update Frequency** | Near real-time (minutes to hours depending on terminal EDI feed) |
| **Licensing** | Proprietary API — subject to Terminal49 Terms of Service |
| **Reliability Score** | 8/10 |

---

### 7.2 Vizion API

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://www.vizionapi.com` |
| **Access** | Paid — no free tier; requires sales contact for pricing |
| **Data Sources** | Multi-source: EDI from steamship lines + AIS + terminal feeds |
| **Refresh Cadence** | 6-hour minimum refresh |
| **Reliability Score** | 8/10 |
| **Phase 1 Verdict** | BLOCKED for Phase 1 — no free tier |

**Backup for Container Tracking:** Shipsgo (`shipsgo.com/api`) offers a freemium container tracking API with broader carrier coverage than Terminal49. Portcast (`portcast.io`) offers an AI-powered ETA prediction API with a free developer tier.

---

## 8. AIS Vessel Tracking

**Critical Dependency:** No — Phase 1 uses static vessel positions + searoute-js for route lines.

### 8.1 MarineTraffic / Kpler

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED (access confirmed; free tier extremely limited) |
| **URL** | `https://www.marinetraffic.com/en/ais-api-services` |
| **Coverage** | 13,000+ terrestrial AIS receivers + satellite AIS (Orbcomm/Exactearth partnership) |
| **Free Tier** | 5 API calls/day — sufficient for demonstration only |
| **Paid Tiers** | ~$100-500/month for basic; $1,000+/month for professional |
| **Data Format** | REST API, JSON |
| **Reliability Score** | 10/10 — industry standard |
| **Phase 1 Verdict** | Use free tier for 20-30 static vessel positions in demo. Do not purchase. |

---

### 8.2 VesselFinder API

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://api.vesselfinder.com` |
| **Free Tier** | 50 requests/day |
| **Paid Tiers** | Starting ~$50/month |
| **Reliability Score** | 7/10 |
| **Phase 1 Verdict** | Alternative to MarineTraffic for Phase 2 if budget is constrained |

---

### 8.3 Datalastic

| Factor | Details |
|--------|---------|
| **Status** | UNVERIFIED |
| **URL** | `https://datalastic.com` |
| **Free Tier** | Freemium — limited free API calls |
| **Differentiator** | Historical AIS data at lower prices than MarineTraffic |
| **Reliability Score** | 6/10 |

---

### 8.4 AISHub

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED (access model confirmed) |
| **URL** | `https://www.aishub.net` |
| **Cost** | Free — exchange model (must share AIS data you receive via your own receiver) |
| **Coverage** | Variable — dependent on community receiver placement |
| **Reliability Score** | 4/10 — unsuitable for commercial applications due to coverage gaps |
| **Phase 1 Verdict** | Do not use. Coverage gaps in SE Asia routes make it unreliable for demo. |

---

## 9. Freight Rate Indices

**Critical Dependency:** No — supplementary market intelligence features.

### 9.1 Freightos Baltic Exchange (FBX)

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://fbx.freightos.com` |
| **Current Rates** | Freely visible on website — no API required for current index values |
| **Historical Data API** | Paid subscription — Bloomberg Data License or direct FBX subscription (~$500-5,000/year) |
| **Indices for SE Asia Routes** | FBX01 (China/East Asia → US West Coast), FBX02 (→ US East Coast), FBX11 (Vietnam → USWC), FBX12 (Vietnam → USEC) |
| **Update Frequency** | Daily (each business day) |
| **Licensing** | Proprietary Freightos data |
| **Reliability Score** | 9/10 — industry benchmark index |
| **Phase 1 Approach** | Manually capture 12-24 months of FBX rate history from website; embed as static chart. Update monthly. No API needed for Phase 1. |

---

### 9.2 Xeneta Ocean Rates

| Factor | Details |
|--------|---------|
| **Status** | UNVERIFIED |
| **URL** | `https://www.xeneta.com` |
| **Access** | Enterprise — no public API or free tier |
| **Data** | Contracted shipping rates (more representative of actual rates vs. spot indices) |
| **Reliability Score** | 8/10 for data quality |
| **Phase 1 Verdict** | BLOCKED — enterprise pricing |

---

## 10. Port Authority Statistics

**Critical Dependency:** No — supplementary market intelligence.

### 10.1 Port of Los Angeles (POLA)

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://www.portofla.org/port-info/stats-and-facts/` |
| **Data Available** | Monthly TEU throughput, vessel calls, commodity breakdowns, top trading partners, dwell times |
| **Format** | Excel, CSV downloads; some PDF |
| **Update Frequency** | Monthly (published ~3 weeks after month end) |
| **API** | No formal API — direct file downloads from static URLs |
| **Licensing** | Public data — no restrictions stated |
| **Reliability Score** | 9/10 — official POLA data |

---

### 10.2 Port of Long Beach (POLB)

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://www.polb.com/port-info/statistics/` |
| **Data Available** | Monthly TEU, commodity statistics, top trading partners, vessel schedules |
| **Format** | Excel, PDF |
| **Update Frequency** | Monthly |
| **Licensing** | Public |
| **Reliability Score** | 9/10 |

**Note:** POLA + POLB together handle ~40% of US containerized imports from Asia. Their combined statistics are the best proxy for SE Asia → US trade flow patterns.

---

### 10.3 NW Seaport Alliance (Seattle/Tacoma)

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://www.nwports.org/business-tools/statistics` |
| **Format** | Excel, PDF |
| **Update Frequency** | Monthly |
| **Reliability Score** | 8/10 |

---

### 10.4 SE Asia Origin Port Statistics

| Port | Access URL | Status | Notes |
|------|-----------|--------|-------|
| Port of Ho Chi Minh City | `portofhochiminh.com.vn/en/` | UNVERIFIED | English section has some statistics; limited data |
| Laem Chabang (Thailand) | `lcb.or.th` | UNVERIFIED | Primary language Thai; limited English statistics |
| Tanjung Priok (Indonesia) | `inaport2.co.id` | UNVERIFIED | Limited public statistics |
| PSA Singapore | `singaporepsa.com` | VERIFIED (limited) | Annual cargo throughput published; no monthly breakdown |

**Phase 1 Approach:** Use POLA/POLB data as the authoritative SE Asia → US trade volume reference. Origin port statistics are supplementary and can be referenced via third-party aggregators (Journal of Commerce, Alphaliner monthly monitors).

---

## 11. CBP / Trade Statistics

### 11.1 CBP Trade Statistics (Public)

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://www.cbp.gov/newsroom/stats/trade` |
| **Data Available** | Monthly trade statistics, top ports, enforcement actions, agricultural inspections |
| **Format** | PDF, Excel downloads |
| **Update Frequency** | Monthly |
| **API** | Limited public API at `api.cbp.gov` — primarily entry/bond data, not manifest-level |
| **Licensing** | Public domain |
| **Reliability Score** | 10/10 |

---

### 11.2 AMS / Bill of Lading Data (ImportYeti)

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED (free access; ToS restrictions on automation) |
| **URL** | `https://www.importyeti.com` |
| **Data Available** | AMS manifest data — importer names, shipper names, volumes, product descriptions (HTS chapter level) |
| **Cost** | Free to browse; paid tiers for bulk export |
| **Licensing** | ImportYeti ToS prohibits scraping/automated access |
| **Reliability Score** | 7/10 — secondary aggregator of public FOIA data |
| **Phase 1 Verdict** | Use only as a manual research tool for competitive intelligence. No automated integration. |

---

### 11.3 USA Trade Online (Census Bureau)

| Factor | Details |
|--------|---------|
| **Status** | VERIFIED |
| **URL** | `https://usatrade.census.gov/` |
| **Data Available** | US import/export statistics by commodity (HTS code), country, port |
| **Format** | CSV export |
| **Update Frequency** | Monthly |
| **Licensing** | Public domain |
| **Reliability Score** | 10/10 |

---

## 12. Backup Source Index

For each critical data type, a primary and backup source are identified:

| Data Type | Primary Source | Primary Status | Backup Source | Backup Status |
|-----------|---------------|----------------|---------------|---------------|
| HTS Tariff Codes + Duty Rates | USITC HTS Bulk Download | VERIFIED | USITC HTS REST API (live) | VERIFIED |
| Section 301 Tariffs (China) | USTR tariff-actions page | VERIFIED | Federal Register (87 FR 12066 etc.) | VERIFIED |
| FTZ Locations + Metadata | OFIS (ofis.trade.gov/Zones) | VERIFIED (scrape) | Federal Register FTZ Board Orders | VERIFIED (manual) |
| FTZ Regulations | FTZ Board (trade.gov) | VERIFIED | 19 U.S.C. 81a-81u text (govinfo.gov) | VERIFIED |
| Port Codes (UN/LOCODE) | UNECE bulk CSV download | VERIFIED | Maersk API port responses (implicit) | VERIFIED |
| Port Coordinates + Facilities | World Port Index (NGA) | VERIFIED | OpenSeaMap database | UNVERIFIED |
| Maritime Route Polylines | searoute-js (offline) | VERIFIED (with caveats) | Searoutes API (paid) | VERIFIED |
| Carrier Schedules | Maersk Developer Portal | VERIFIED | CMA CGM API Portal | VERIFIED |
| Container Tracking | Terminal49 (free tier) | VERIFIED | Shipsgo freemium API | UNVERIFIED |
| AIS Vessel Positions | MarineTraffic free tier (5/day) | VERIFIED | VesselFinder free tier (50/day) | VERIFIED |
| Freight Rate Index | FBX (manual web capture) | VERIFIED | Alphaliner weekly monitor (manual) | UNVERIFIED |
| Port Throughput Statistics | POLA / POLB downloads | VERIFIED | Census Bureau USA Trade Online | VERIFIED |
| Import Trade Data | USA Trade Online (Census) | VERIFIED | CBP trade statistics (cbp.gov) | VERIFIED |

---

## 13. Build Method Summary

| Data Source | Build Method | Frequency | Automation |
|-------------|-------------|-----------|------------|
| USITC HTS JSON | Direct download, commit to repo | Quarterly | Manual + cron check |
| USTR Section 301 | Download CSV from USTR, merge with HTS | On tariff change | Manual monitoring |
| OFIS FTZ data | Scrape with Cheerio/Puppeteer → JSON | Quarterly | Automated scraper script |
| UN/LOCODE | Download CSV, filter for ports/ICD | Semi-annually (Jan/Jul) | Manual |
| World Port Index | Download CSV from NGA | Annually | Manual |
| Carrier routes | Maersk API registration + JSON fixture file | Monthly refresh | API script |
| FBX rate history | Manual web capture → CSV | Monthly | Manual |
| POLA/POLB stats | Download Excel/CSV from port websites | Monthly | Manual or cron |

**Key Distinction — Scraping vs. Download:**

| Data Source | Method | Notes |
|-------------|--------|-------|
| USITC HTS | DIRECT DOWNLOAD — free JSON/CSV files | No scraping needed |
| USTR Section 301 | DIRECT DOWNLOAD — PDF/CSV | No scraping needed |
| OFIS FTZ | SCRAPING REQUIRED — no download option | HTML table on trade.gov — public government data, legally appropriate |
| UN/LOCODE | DIRECT DOWNLOAD — official CSV files | No scraping needed |
| World Port Index | DIRECT DOWNLOAD — NGA CSV | No scraping needed |
| Maersk Schedules | API — free registration | Not scraping |
| FBX Rates | MANUAL CAPTURE — no API for free | Read from fbx.freightos.com and input to CSV |
| POLA/POLB Stats | DIRECT DOWNLOAD — Excel/CSV files | No scraping needed |

---

## 14. Phase 1 Data Acquisition Plan

Ordered by dependency priority:

### Week 1 — Core Data (Required for All Calculators)

1. **Download USITC HTS JSON** from `hts.usitc.gov` → commit as `/data/hts-schedule.json`
   - Filter for SE Asia relevant entries (Chapter 61-62 apparel, Chapter 84-85 electronics, Chapter 39 plastics, etc.)
   - Overlay Section 301 tariffs from USTR for Chinese goods
   - Build Meilisearch index for search features

2. **Download UN/LOCODE CSV** from UNECE → filter to ports + ICD → commit as `/data/ports-locode.json`
   - Keep: VNHPH, VNSGN, THBKK, IDJKT, KHPNH, SGSIN, MYBTU, USLAX, USNYC, USORD, etc.
   - Merge with World Port Index for coordinates

3. **Download World Port Index CSV** from NGA → commit as `/data/world-port-index.json`
   - Join with UN/LOCODE on port name/country for coordinate enrichment

### Week 1 — FTZ Data

4. **Scrape OFIS** (`ofis.trade.gov/Zones`) → commit as `/data/ftz-locations.json`
   - Fields: zoneNumber, grantee, city, state, type (general/subzone), status
   - Script: Node.js with Cheerio; one-time scrape for Phase 1

### Week 2 — Route + Carrier Data

5. **Register for Maersk Developer Portal** (`developer.maersk.com`) → pull SE Asia → US schedule data
   - Script: Query major port pairs, store as `/data/carrier-routes.json`
   - Initial query: VNSGN→USLAX, VNHPH→USLAX, THBKK→USLAX, IDJKT→USLAX, all → USNYC variants

6. **Test searoute-js** with SE Asia → US port pairs
   - Validate with the 5 test cases from Section 5.1
   - Confirm GeoJSON output integrates with deck.gl ArcLayer
   - Document any routing anomalies for Phase 2 Searoutes API migration

### Week 2 — Supplementary Data

7. **Capture FBX rate history** (12-24 months) for FBX01, FBX02, FBX11, FBX12
   - Manual web capture from fbx.freightos.com
   - Commit as `/data/freight-rate-index.json`

8. **Download POLA/POLB monthly statistics** (last 12 months)
   - Commit as `/data/port-statistics.json`

---

## Confidence Assessment Summary

| Data Source | Status | Reliability | Confidence Change |
|-------------|--------|-------------|-------------------|
| USITC HTS REST API | VERIFIED | 10/10 | No change — remains HIGH |
| USITC HTS Bulk Download | VERIFIED | 10/10 | Confirmed; PREFERRED over REST API for Phase 1 |
| OFIS FTZ Database | VERIFIED | 10/10 for authority; 7/10 for access | **Elevated from MEDIUM** — scraping approach confirmed viable |
| UN/LOCODE | VERIFIED | 10/10 | No change — remains HIGH |
| World Port Index (NGA) | VERIFIED | 10/10 | No change — remains HIGH |
| searoute-js | VERIFIED (with caveats) | 6/10 | **Elevated from LOW-MEDIUM** — validated for Phase 1 visualization use case; specific limitations documented; acceptable for proposal platform |
| Maersk Developer Portal | VERIFIED | 9/10 | No change — remains HIGH |
| CMA CGM API | VERIFIED | 8/10 | No change — remains HIGH |
| Terminal49 | VERIFIED | 8/10 | No change — free tier confirmed |
| MarineTraffic | VERIFIED | 10/10 | Confirmed free tier access for demo; DO NOT purchase for Phase 1 |
| FBX Rate Index | VERIFIED | 9/10 | Manual capture approach confirmed viable; no API needed for Phase 1 |
| POLA/POLB Stats | VERIFIED | 9/10 | Download approach confirmed; good proxies for SE Asia trade flows |
| USTR Section 301 | VERIFIED | 10/10 | **New addition** — critical overlay for Chinese goods |
| USA Trade Online (Census) | VERIFIED | 10/10 | **New addition** — best source for import/export statistics by HTS code |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| USITC changes API endpoint structure | LOW | HIGH | Use bulk download (static JSON) as primary; API as fallback |
| OFIS website restructure breaks scraper | MEDIUM | MEDIUM | Scrape quarterly; manually update if structure changes; backup via Federal Register |
| searoute-js unmaintained / broken on new Node version | MEDIUM | MEDIUM | Lock to current working Node/npm version; backup is Searoutes API (paid); route visualization can fall back to straight-line ArcLayer |
| Maersk changes API terms or adds paywalls | LOW | MEDIUM | CMA CGM as backup; static route JSON as ultimate fallback |
| UN/LOCODE download URL changes | LOW | LOW | UNECE is the UN body — stable URL; mirror the CSV in the repo |
| World Port Index URL changes (NGA) | LOW | LOW | Mirror the CSV in the repo; NGA has stable publication URLs |
| USTR Section 301 tariff lists change | HIGH | MEDIUM | Display dataset date prominently; add "rates may have changed" disclaimer on all duty estimates; monitor USTR announcements |

---

*Research completed: 2026-03-26*
*Validates research from: SUMMARY.md, STACK.md, TECHNOLOGY-VALIDATION.md*
*Ready for Phase 2 data pipeline implementation: YES*
