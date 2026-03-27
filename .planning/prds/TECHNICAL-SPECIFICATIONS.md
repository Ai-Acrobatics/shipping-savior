# Shipping Savior — Technical Specifications

> **Linear:** AI-5472
> **Status:** Living document — update as implementation evolves
> **Last Updated:** 2026-03-26
> **Phase Coverage:** Phase 0 (current) through Phase 4 (planned)

---

## Table of Contents

1. [API Endpoints](#1-api-endpoints)
2. [Database Tables](#2-database-tables)
3. [Search Configurations](#3-search-configurations)
4. [Cron Schedules](#4-cron-schedules)
5. [Environment Variables](#5-environment-variables)
6. [Third-Party Integrations](#6-third-party-integrations)
7. [File Storage](#7-file-storage)
8. [WebSocket Events](#8-websocket-events)
9. [Error Codes](#9-error-codes)
10. [Rate Limits](#10-rate-limits)

---

## 1. API Endpoints

All API routes use Next.js 14 App Router conventions (`src/app/api/`). Phase 0 routes are `GET`-only, reading from static JSON files in `/data/`. Phase 1+ routes add mutations, authentication, and database-backed storage.

### 1.1 Phase 0 — Current (Static Data APIs)

#### `GET /api/hts/search`

**Purpose:** Fuzzy search HTS tariff codes by description, chapter, or country.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | Yes (if no `chapter`) | — | Search term (description or code fragment) |
| `chapter` | number | No | — | Filter by HTS chapter number (1–99) |
| `country` | string | No | — | ISO 3166-1 alpha-2 country code to attach duty rates |
| `limit` | number | No | 20 | Max results (capped at 100) |

**Response `200`:**
```json
{
  "query": "backpack",
  "chapter": null,
  "country": "CN",
  "count": 5,
  "results": [
    {
      "hts_code": "4202923000",
      "formatted_code": "4202.92.30",
      "description": "Travel, sports and similar bags with outer surface of sheeting of plastics or textile materials",
      "general_rate": "17.6%",
      "special_rates": "Free (A+,AU,BH,CA,CL,CO,D,E,IL,JO,KR,MA,MX,OM,P,PA,PE,SG)",
      "unit_of_quantity": "No.",
      "chapter": 42,
      "indent_level": 2,
      "country_rates": {
        "CN": {
          "general_rate_pct": 17.6,
          "section_301_pct": 7.5,
          "effective_rate_pct": 25.1,
          "ad_cvd_flag": false
        }
      },
      "available_country_rates": ["CN", "VN", "TH", "ID", "KH"]
    }
  ]
}
```

**Search Engine:** Fuse.js — keys: `description` (weight 0.7), `hts_code` (weight 0.3), threshold 0.4.
**Data Sources:** `data/hts-schedule.json` + `data/duty-rates-sea.json`

---

#### `GET /api/hts/[code]`

**Purpose:** Look up a single HTS code with full duty rate detail.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` (path) | string | Yes | HTS code — dots stripped, zero-padded to 10 digits |

**Response `200`:**
```json
{
  "hts_code": "4202923000",
  "formatted_code": "4202.92.30",
  "description": "Travel, sports and similar bags...",
  "general_rate": "17.6%",
  "special_rates": "Free (A+,AU,BH,CA,...)",
  "unit_of_quantity": "No.",
  "chapter": 42,
  "country_rates": {
    "CN": [{ "category": "Leather Goods", "general_rate_pct": 17.6, "section_301_pct": 7.5, "effective_rate_pct": 25.1 }],
    "VN": [{ "category": "Leather Goods", "general_rate_pct": 17.6, "section_301_pct": 0, "effective_rate_pct": 17.6 }]
  }
}
```

**Error `404`:**
```json
{ "error": "HTS code 9999999999 not found" }
```

---

#### `GET /api/ports/search`

**Purpose:** Search world ports by name, LOCODE, country, or attributes.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | No | — | Fuzzy search (name, LOCODE, country) |
| `region` | string | No | — | Filter: `"SE Asia"`, `"North America"`, `"East Asia"`, `"South Asia"` |
| `country` | string | No | — | ISO country code (e.g., `US`, `VN`) |
| `size` | string | No | — | Port size: `"mega"`, `"large"`, `"medium"`, `"small"` |
| `limit` | number | No | 20 | Max results (capped at 100) |

**Response `200`:**
```json
{
  "query": "ho chi minh",
  "filters": { "region": null, "country": null, "size": null },
  "count": 1,
  "total": 1,
  "results": [
    {
      "locode": "VNSGN",
      "name": "Ho Chi Minh City (Cat Lai)",
      "country": "Vietnam",
      "country_code": "VN",
      "lat": 10.7626,
      "lng": 106.7432,
      "port_type": "seaport",
      "size": "mega",
      "annual_teu": 8500000,
      "region": "SE Asia",
      "timezone": "Asia/Ho_Chi_Minh"
    }
  ]
}
```

**Search Engine:** Fuse.js — keys: `name` (0.5), `locode` (0.3), `country` (0.2), threshold 0.3.

---

#### `GET /api/ports/[locode]`

**Purpose:** Single port detail with nearby FTZ zones.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `locode` (path) | string | Yes | UN/LOCODE (e.g., `USLGB`) |

**Response `200`:**
```json
{
  "locode": "USLGB",
  "name": "Long Beach",
  "country": "United States",
  "country_code": "US",
  "lat": 33.7542,
  "lng": -118.2150,
  "port_type": "seaport",
  "size": "mega",
  "annual_teu": 9100000,
  "region": "North America",
  "timezone": "America/Los_Angeles",
  "nearby_ftz_zones": [
    {
      "zone_number": 50,
      "name": "Long Beach Foreign-Trade Zone",
      "city": "Long Beach",
      "state": "California",
      "distance_miles": 1
    }
  ]
}
```

**Error `404`:** `{ "error": "Port XXXXX not found" }`

---

#### `GET /api/routes/compare`

**Purpose:** Compare shipping routes between ports, sorted by transit time, cost, or CO₂ emissions.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `origin` | string | Yes* | — | Origin port LOCODE |
| `dest` | string | Yes* | — | Destination port LOCODE |
| `carrier` | string | No | `"all"` | Filter by carrier name or SCAC code |
| `cargo` | string | No | — | Container type for cost sort: `"20ft"`, `"40ft"`, `"40hc"` |
| `sort` | string | No | `"transit_days"` | Sort: `"transit_days"`, `"cost"`, `"co2"` |

*At least one of `origin` or `dest` is required.

**Response `200`:**
```json
{
  "origin": "VNSGN",
  "destination": "USLGB",
  "carrier": "all",
  "sort": "transit_days",
  "count": 4,
  "summary": {
    "cheapest_20ft": "$2450",
    "cheapest_40ft": "$4600",
    "fastest_transit": "18 days",
    "carriers": ["Maersk", "MSC", "Evergreen", "COSCO"]
  },
  "results": [
    {
      "id": "MAE-TP6-VNSGN-USLGB",
      "carrier": "Maersk",
      "carrier_code": "MAEU",
      "service_name": "TP6 / Elephant",
      "origin": "VNSGN",
      "origin_name": "Ho Chi Minh City",
      "destination": "USLGB",
      "destination_name": "Long Beach",
      "transit_days": 18,
      "frequency": "weekly",
      "transshipment_ports": [],
      "direct": true,
      "backhaul_available": true,
      "estimated_cost_20ft": 2850,
      "estimated_cost_40ft": 5400,
      "estimated_cost_40hc": 5800,
      "route_type": "transpacific",
      "via": "direct",
      "vessel_size_teu": 15000,
      "co2_per_teu_kg": 180,
      "cost_premium_20ft": 0,
      "cost_premium_40ft": 0,
      "transit_premium_days": 0
    }
  ]
}
```

**Error `400`:** `{ "error": "At least one of \"origin\" or \"dest\" query params is required" }`

---

#### `GET /api/containers/specs`

**Purpose:** ISO container specifications with filtering.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `type` | string | No | — | Partial match on container type (e.g., `"20ft"`, `"reefer"`) |
| `reefer` | string | No | — | `"true"` or `"false"` for refrigerated filter |

**Response `200`:**
```json
{
  "count": 6,
  "results": [
    {
      "type": "20ft_standard",
      "iso_code": "22G1",
      "description": "20-foot Standard Dry Container",
      "length_m": 5.89,
      "width_m": 2.35,
      "height_m": 2.39,
      "length_ft": 19.33,
      "width_ft": 7.71,
      "height_ft": 7.84,
      "max_payload_kg": 28200,
      "tare_weight_kg": 2300,
      "max_gross_weight_kg": 30480,
      "cubic_capacity_cbm": 33.2,
      "door_opening_width_m": 2.34,
      "door_opening_height_m": 2.28,
      "temperature_range": null,
      "common_use": ["general cargo", "heavy goods"],
      "stackable": true,
      "max_stack_weight_kg": 216960
    }
  ]
}
```

---

#### `GET /api/ftz/zones`

**Purpose:** List US Foreign Trade Zones with filters.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `state` | string | No | — | 2-letter state code (e.g., `CA`, `TX`) |
| `near_port` | string | No | — | Filter by nearest port LOCODE |
| `industry` | string | No | — | Keyword match in `key_industries` array |

**Response `200`:**
```json
{
  "filters": { "state": "CA", "near_port": null, "industry": null },
  "count": 4,
  "results": [
    {
      "zone_number": 50,
      "name": "Long Beach Foreign-Trade Zone",
      "city": "Long Beach",
      "state": "California",
      "state_code": "CA",
      "operator": "Port of Long Beach",
      "grantee": "Board of Harbor Commissioners, City of Long Beach",
      "lat": 33.7542,
      "lng": -118.215,
      "status": "active",
      "activated_year": 1980,
      "nearest_port": "USLGB",
      "port_distance_miles": 1,
      "key_industries": ["consumer electronics", "apparel", "automotive", "furniture", "toys"],
      "annual_merchandise_value_usd": 20000000000,
      "subzones": [
        {
          "designation": "50A",
          "name": "Toyota Motor Manufacturing",
          "type": "manufacturing",
          "products": ["automotive parts"]
        }
      ]
    }
  ]
}
```

---

### 1.2 Phase 1 — Authentication & User Management

#### `POST /api/auth/register`

**Purpose:** Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "name": "Maya Chen",
  "company": "Chen Imports LLC",
  "role": "importer"
}
```

**Validation:**
- `email`: valid email format, unique
- `password`: min 12 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
- `name`: 2–100 characters
- `company`: optional, max 200 characters
- `role`: `"importer"` | `"broker"` | `"ftz_operator"`

**Response `201`:**
```json
{
  "id": "uuid-v4",
  "email": "user@example.com",
  "name": "Maya Chen",
  "role": "importer",
  "email_verified": false,
  "created_at": "2026-03-26T00:00:00Z"
}
```

**Errors:**
- `400` — validation failure (details in `errors[]`)
- `409` — email already registered
- `429` — rate limited (5 attempts per IP per hour)

---

#### `POST /api/auth/login`

**Purpose:** Authenticate and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

**Response `200`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 900,
  "user": {
    "id": "uuid-v4",
    "email": "user@example.com",
    "name": "Maya Chen",
    "role": "importer"
  }
}
```

**Token Details:**
- Access token: 15-minute TTL, signed with `JWT_SECRET` (HS256)
- Refresh token: 30-day TTL, stored in `refresh_tokens` table
- Both tokens include: `sub` (user ID), `email`, `role`, `iat`, `exp`

**Errors:**
- `401` — invalid credentials
- `423` — account locked (10 failed attempts in 15 minutes → 30-minute lockout)
- `429` — rate limited

---

#### `POST /api/auth/refresh`

**Purpose:** Exchange refresh token for new access token.

**Request Body:**
```json
{ "refresh_token": "eyJhbGciOiJIUzI1NiIs..." }
```

**Response `200`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 900
}
```

**Errors:**
- `401` — expired or revoked refresh token

---

#### `POST /api/auth/logout`

**Purpose:** Revoke refresh token.

**Headers:** `Authorization: Bearer <access_token>`

**Response `204`:** No content.

---

#### `GET /api/auth/me`

**Purpose:** Get current authenticated user profile.

**Headers:** `Authorization: Bearer <access_token>`

**Response `200`:**
```json
{
  "id": "uuid-v4",
  "email": "user@example.com",
  "name": "Maya Chen",
  "company": "Chen Imports LLC",
  "role": "importer",
  "email_verified": true,
  "subscription_tier": "starter",
  "calculations_used": 23,
  "calculations_limit": 100,
  "created_at": "2026-03-26T00:00:00Z"
}
```

---

### 1.3 Phase 1–2 — Core Business APIs

#### `POST /api/calculations/landed-cost`

**Purpose:** Calculate full landed cost for an import shipment.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "product_description": "Cotton t-shirts, men's",
  "hts_code": "6109100012",
  "country_of_origin": "VN",
  "unit_cost_fob": 4.50,
  "total_units": 5000,
  "container_type": "40HC",
  "origin_port": "VNSGN",
  "destination_port": "USLGB",
  "shipping_mode": "ocean-fcl",
  "freight_cost_total": 5400,
  "customs_broker_fee": 350,
  "insurance_rate": 0.005,
  "drayage_cost": 500,
  "warehousing_per_unit": 0.15,
  "fulfillment_per_unit": 1.25,
  "use_ftz": false,
  "ftz_storage_months": 0,
  "ftz_storage_fee_per_unit": 0
}
```

**Response `200`:**
```json
{
  "calculation_id": "calc-uuid-v4",
  "per_unit": {
    "fob": 4.50,
    "freight": 1.08,
    "insurance": 0.028,
    "duty": 0.711,
    "mpf": 0.016,
    "hmf": 0.007,
    "customs_broker": 0.07,
    "drayage": 0.10,
    "warehousing": 0.15,
    "fulfillment": 1.25,
    "ftz_storage": 0,
    "total": 7.892
  },
  "total": {
    "cargo_value": 22500.00,
    "freight": 5400.00,
    "insurance": 139.50,
    "duty": 3555.00,
    "mpf": 97.01,
    "hmf": 34.95,
    "customs_broker": 350.00,
    "drayage": 500.00,
    "warehousing": 750.00,
    "fulfillment": 6250.00,
    "ftz_storage": 0,
    "grand_total": 39576.46
  },
  "effective_duty_rate": 15.8,
  "duty_rate": {
    "base_rate": 15.8,
    "section_301": 0,
    "effective": 15.8,
    "notes": "MFN rate; no Section 301 for Vietnam on this HTS code"
  },
  "mpf_rate": 0.3464,
  "hmf_rate": 0.125,
  "breakdown": [
    { "label": "FOB Cost", "value": 22500.00, "percentage": 56.9 },
    { "label": "Ocean Freight", "value": 5400.00, "percentage": 13.6 },
    { "label": "Duty", "value": 3555.00, "percentage": 9.0 },
    { "label": "Fulfillment", "value": 6250.00, "percentage": 15.8 }
  ]
}
```

**Business Logic (in `src/lib/calculators/landed-cost.ts`):**
- MPF: 0.3464% of customs value, clamped to [$31.67, $614.35] per entry
- HMF: 0.125% of customs value (ocean shipments only)
- Duty: `getEffectiveDutyRate(htsCode, countryOfOrigin)` — MFN base + Section 301 surcharge
- Section 301 rates by chapter: Ch84/85 = 25%, Ch39/42/61/62/64/95 = 7.5%, Ch94 = 25%
- Insurance: `(cargoValue + freightCost) × insuranceRate`

---

#### `POST /api/calculations/freight-estimate`

**Purpose:** Multi-modal freight cost comparison.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "origin_country": "CN",
  "destination_region": "USWC",
  "container_type": "40HC",
  "weight_kg": 18000,
  "volume_cbm": 60,
  "cargo_type": "general",
  "modes": ["ocean-fcl", "ocean-lcl", "air", "ground"]
}
```

**Response `200`:**
```json
{
  "comparison": [
    {
      "mode": "ocean-fcl",
      "base_rate": 4400,
      "surcharges": {
        "baf": 375, "caf": 150, "isps": 30,
        "doc": 100, "ams": 50, "isf": 67.50,
        "dthc": 325, "othc": 225
      },
      "total": 5722.50,
      "per_teu": 2861.25,
      "transit_days": { "min": 14, "max": 18 },
      "trade_lane": "Asia → US West Coast",
      "recommended": true
    },
    {
      "mode": "air",
      "chargeable_weight_kg": 18000,
      "rate_per_kg": 5.50,
      "base_cost": 99000,
      "fuel_surcharge": 24750,
      "security_fee": 2700,
      "awb_fee": 50,
      "customs_clearance": 75,
      "total": 126575,
      "transit_days": { "min": 3, "max": 5 }
    }
  ]
}
```

**Freight Rate Reference (Ocean FCL):**

| Container | Asia → USWC | Asia → USEC | Asia → N. Europe |
|-----------|-------------|-------------|------------------|
| 20GP | $2,200 | $4,070 | $2,750 |
| 40GP | $3,800 | $7,030 | $4,750 |
| 40HC | $4,400 | $8,140 | $5,500 |

**Trade Lane Multipliers:**
| Lane | Multiplier |
|------|-----------|
| CN → USWC | 1.00 |
| CN → USEC | 1.85 |
| VN → USWC | 1.10 |
| VN → USEC | 1.95 |
| TH → USWC | 1.15 |
| TH → USEC | 2.00 |
| ID → USWC | 1.20 |
| ID → USEC | 2.05 |

**Standard Surcharges (midpoint of typical ranges):**

| Code | Name | Amount (USD) |
|------|------|-------------|
| BAF | Bunker Adjustment Factor | $150–$600 |
| CAF | Currency Adjustment Factor | $50–$250 |
| ISPS | Security | $15–$45 |
| DOC | Documentation | $50–$150 |
| AMS | Automated Manifest System | $25–$75 |
| ISF | Importer Security Filing | $35–$100 |
| DTHC | Destination Terminal Handling | $200–$450 |
| OTHC | Origin Terminal Handling | $150–$300 |

---

#### `POST /api/calculations/container-utilization`

**Purpose:** Optimize container loading.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "product": {
    "length_cm": 40,
    "width_cm": 30,
    "height_cm": 25,
    "weight_kg": 2.5,
    "units_per_carton": 24,
    "carton_length_cm": 62,
    "carton_width_cm": 42,
    "carton_height_cm": 52
  },
  "container_type": "40HC",
  "compare_all": true
}
```

**Response `200`:**
```json
{
  "optimal_container": "40HC",
  "units_per_container": 4800,
  "cartons_per_container": 200,
  "binding_constraint": "volume",
  "volume_utilization_pct": 82.3,
  "weight_utilization_pct": 43.1,
  "packing_efficiency_factor": 0.85,
  "comparison": [
    {
      "type": "20GP",
      "units": 2160,
      "volume_util": 84.1,
      "weight_util": 19.1,
      "cost_per_unit": 1.02
    },
    {
      "type": "40GP",
      "units": 4320,
      "volume_util": 83.5,
      "weight_util": 38.3,
      "cost_per_unit": 0.88
    },
    {
      "type": "40HC",
      "units": 4800,
      "volume_util": 82.3,
      "weight_util": 43.1,
      "cost_per_unit": 0.92
    }
  ],
  "lcl_breakeven": {
    "fcl_cost": 4400,
    "lcl_rate_per_cbm": 85,
    "breakeven_cbm": 51.8,
    "recommendation": "FCL is more cost-effective at your volume (60 CBM)"
  }
}
```

---

#### `POST /api/calculations/ftz-analysis`

**Purpose:** Compare FTZ Privileged Foreign (PF) vs Non-Privileged Foreign (NPF) status.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "hts_code_imported": "8471300180",
  "hts_code_finished": "8471300100",
  "country_of_origin": "CN",
  "cargo_value": 500000,
  "annual_shipments": 12,
  "ftz_zone_number": 50,
  "storage_months": 3,
  "assembly_in_ftz": true
}
```

**Response `200`:**
```json
{
  "pf_status": {
    "duty_rate": 2.5,
    "total_duty": 12500,
    "description": "Duty assessed on finished good HTS (lower rate)"
  },
  "npf_status": {
    "duty_rate": 25.0,
    "total_duty": 125000,
    "description": "Duty assessed on imported component HTS (includes Section 301)"
  },
  "savings": 112500,
  "savings_pct": 90.0,
  "recommendation": "PF",
  "ftz_zone": {
    "zone_number": 50,
    "name": "Long Beach Foreign-Trade Zone",
    "annual_storage_cost": 45000
  },
  "annual_projection": {
    "total_savings": 1350000,
    "net_after_ftz_costs": 1305000
  }
}
```

---

#### `GET /api/shipments`

**Purpose:** List user's shipments with filtering and pagination.

**Headers:** `Authorization: Bearer <access_token>`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | — | Filter: `"in_transit"`, `"at_port"`, `"customs"`, `"delivered"` |
| `origin` | string | — | Origin port LOCODE |
| `destination` | string | — | Destination port LOCODE |
| `carrier` | string | — | Carrier SCAC code |
| `page` | number | 1 | Page number |
| `per_page` | number | 20 | Items per page (max 100) |
| `sort` | string | `"-eta"` | Sort field (prefix `-` for descending) |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "shp-uuid",
      "booking_ref": "MAEU-12345678",
      "container_number": "MSKU1234567",
      "status": "in_transit",
      "origin_port": "VNSGN",
      "destination_port": "USLGB",
      "carrier": "Maersk",
      "etd": "2026-03-20T00:00:00Z",
      "eta": "2026-04-07T00:00:00Z",
      "last_event": {
        "timestamp": "2026-03-26T08:00:00Z",
        "description": "Vessel departed Singapore",
        "location": "SGSIN"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 47,
    "total_pages": 3
  }
}
```

---

#### `GET /api/shipments/[id]`

**Purpose:** Full shipment detail with event timeline and cost breakdown.

**Headers:** `Authorization: Bearer <access_token>`

**Response `200`:**
```json
{
  "id": "shp-uuid",
  "booking_ref": "MAEU-12345678",
  "container_number": "MSKU1234567",
  "status": "in_transit",
  "origin_port": { "locode": "VNSGN", "name": "Ho Chi Minh City" },
  "destination_port": { "locode": "USLGB", "name": "Long Beach" },
  "carrier": "Maersk",
  "vessel_name": "Maersk Elba",
  "voyage_number": "GH2-VNSGN-USLGB",
  "etd": "2026-03-20T00:00:00Z",
  "eta": "2026-04-07T00:00:00Z",
  "events": [
    {
      "timestamp": "2026-03-19T14:00:00Z",
      "event_type": "gate_in",
      "description": "Container gated in at Cat Lai terminal",
      "location": "VNSGN"
    },
    {
      "timestamp": "2026-03-20T06:00:00Z",
      "event_type": "vessel_departure",
      "description": "Vessel departed Ho Chi Minh City",
      "location": "VNSGN"
    }
  ],
  "costs": {
    "freight": 5400,
    "duty": 3555,
    "customs_broker": 350,
    "drayage": 500,
    "total": 9805
  },
  "documents": [
    {
      "type": "bill_of_lading",
      "filename": "BOL-MAEU12345678.pdf",
      "uploaded_at": "2026-03-18T10:00:00Z"
    }
  ]
}
```

---

### 1.4 Phase 2–3 — Advanced APIs

#### `POST /api/ai/classify-hts`

**Purpose:** AI-powered HTS code classification using 6-step reasoning chain.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "product_description": "Men's cotton t-shirt with screen printing, knitted, 100% cotton",
  "material_composition": "100% cotton",
  "country_of_origin": "VN",
  "intended_use": "retail sale",
  "images": ["https://storage.example.com/product-123.jpg"]
}
```

**Response `200`:**
```json
{
  "classification_id": "cls-uuid",
  "primary": {
    "hts_code": "6109100012",
    "formatted": "6109.10.00.12",
    "description": "T-shirts, singlets, tank tops, of cotton, men's or boys'",
    "confidence": 0.94
  },
  "alternatives": [
    {
      "hts_code": "6109100040",
      "description": "T-shirts, singlets, of cotton, women's or girls'",
      "confidence": 0.72
    }
  ],
  "reasoning": [
    "Step 1: Material — 100% cotton → natural fiber textile",
    "Step 2: Construction — knitted → Chapter 61 (not Chapter 62 woven)",
    "Step 3: Garment type — T-shirt → Heading 6109",
    "Step 4: Subheading — cotton → 6109.10",
    "Step 5: Statistical suffix — men's → .00.12",
    "Step 6: Verification — screen printing does not change classification"
  ],
  "duty_impact": {
    "base_rate": 16.5,
    "section_301": 0,
    "effective_rate": 16.5
  },
  "model": "claude-sonnet-4-20250514",
  "tokens_used": 1847
}
```

**AI Pipeline:**
1. Product description → Claude Sonnet structured prompt
2. Embedding comparison via `text-embedding-3-small` + `pgvector`
3. 6-step GRI reasoning chain
4. Cross-reference with USITC rulings database
5. Confidence scoring (>0.85 = auto-accept, 0.60–0.85 = human review, <0.60 = manual)

---

#### `GET /api/tracking/[container]`

**Purpose:** Real-time container tracking via Terminal49.

**Headers:** `Authorization: Bearer <access_token>`

| Parameter | Type | Description |
|-----------|------|-------------|
| `container` (path) | string | Container number (e.g., `MSKU1234567`) |

**Response `200`:**
```json
{
  "container_number": "MSKU1234567",
  "carrier": "Maersk",
  "status": "in_transit",
  "vessel": "Maersk Elba",
  "voyage": "GH2",
  "current_location": {
    "lat": 15.8700,
    "lng": 109.3500,
    "description": "South China Sea"
  },
  "origin": { "locode": "VNSGN", "name": "Ho Chi Minh City" },
  "destination": { "locode": "USLGB", "name": "Long Beach" },
  "etd": "2026-03-20T06:00:00Z",
  "eta": "2026-04-07T14:00:00Z",
  "milestones": [
    { "event": "gate_in", "actual": "2026-03-19T14:00:00Z", "location": "VNSGN" },
    { "event": "loaded", "actual": "2026-03-20T02:00:00Z", "location": "VNSGN" },
    { "event": "departed", "actual": "2026-03-20T06:00:00Z", "location": "VNSGN" },
    { "event": "arrived", "estimated": "2026-04-07T14:00:00Z", "location": "USLGB" },
    { "event": "discharged", "estimated": "2026-04-08T08:00:00Z", "location": "USLGB" }
  ],
  "source": "terminal49"
}
```

---

### 1.5 API Authentication Specification

All Phase 1+ endpoints require JWT authentication:

```
Authorization: Bearer <access_token>
```

**Token Structure (HS256):**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "importer",
  "org_id": "org-uuid",
  "tier": "professional",
  "iat": 1711411200,
  "exp": 1711412100
}
```

**Middleware Chain:**
1. Extract `Authorization` header
2. Verify JWT signature with `JWT_SECRET`
3. Check token expiration
4. Load user from database (cache in Redis for 5 minutes)
5. Attach `user` to request context
6. Check tier-based feature access

**Public Endpoints (no auth):** All Phase 0 `/api/hts/*`, `/api/ports/*`, `/api/routes/*`, `/api/containers/*`, `/api/ftz/*`

---

## 2. Database Tables

### 2.1 Technology Stack

- **Database:** Neon PostgreSQL (serverless)
- **ORM:** Drizzle ORM with `drizzle-kit` for migrations
- **Connection:** Single `DATABASE_URL` with connection pooling via Neon's built-in pooler
- **Precision:** All monetary values use `DECIMAL(12,4)` — enforced by `decimal.js` in application layer

### 2.2 Schema Definition

#### `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(200),
  role VARCHAR(50) NOT NULL DEFAULT 'importer',  -- importer | broker | ftz_operator | admin
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  subscription_tier VARCHAR(50) NOT NULL DEFAULT 'free',  -- free | starter | professional | enterprise
  calculations_used INTEGER NOT NULL DEFAULT 0,
  avatar_url TEXT,
  last_login_at TIMESTAMPTZ,
  locked_until TIMESTAMPTZ,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_tier ON users(subscription_tier);
```

**Constraints:**
- `role` CHECK: `IN ('importer', 'broker', 'ftz_operator', 'admin')`
- `subscription_tier` CHECK: `IN ('free', 'starter', 'professional', 'enterprise')`
- `email` must be lowercase (enforced via trigger or application layer)

---

#### `organizations`

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  subscription_tier VARCHAR(50) NOT NULL DEFAULT 'free',
  max_members INTEGER NOT NULL DEFAULT 1,
  features JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orgs_slug ON organizations(slug);
CREATE INDEX idx_orgs_owner ON organizations(owner_id);
```

---

#### `organization_members`

```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member',  -- owner | admin | member | viewer
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(org_id, user_id)
);
```

---

#### `refresh_tokens`

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
```

---

#### `hts_codes`

```sql
CREATE TABLE hts_codes (
  id SERIAL PRIMARY KEY,
  hts_code VARCHAR(10) NOT NULL UNIQUE,
  formatted_code VARCHAR(15) NOT NULL,
  description TEXT NOT NULL,
  general_rate VARCHAR(100),
  special_rates TEXT,
  unit_of_quantity VARCHAR(50),
  chapter INTEGER NOT NULL,
  heading INTEGER,
  subheading INTEGER,
  indent_level INTEGER DEFAULT 0,
  parent_code VARCHAR(10),
  embedding VECTOR(1536),  -- pgvector for semantic search (Phase 3)
  last_updated DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hts_code ON hts_codes(hts_code);
CREATE INDEX idx_hts_chapter ON hts_codes(chapter);
CREATE INDEX idx_hts_heading ON hts_codes(heading);
CREATE INDEX idx_hts_embedding ON hts_codes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

---

#### `duty_rates`

```sql
CREATE TABLE duty_rates (
  id SERIAL PRIMARY KEY,
  hts_code VARCHAR(10) NOT NULL,
  country_code CHAR(2) NOT NULL,
  general_rate_pct DECIMAL(8,4) NOT NULL,
  section_301_pct DECIMAL(8,4) DEFAULT 0,
  effective_rate_pct DECIMAL(8,4) NOT NULL,
  ad_cvd_flag BOOLEAN NOT NULL DEFAULT FALSE,
  ad_cvd_pct DECIMAL(8,4),
  ad_cvd_details TEXT,
  gsp_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  fta_agreement VARCHAR(100),
  effective_date DATE NOT NULL,
  expiration_date DATE,
  source VARCHAR(100) NOT NULL DEFAULT 'usitc',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hts_code, country_code, effective_date)
);

CREATE INDEX idx_duty_hts ON duty_rates(hts_code);
CREATE INDEX idx_duty_country ON duty_rates(country_code);
CREATE INDEX idx_duty_effective ON duty_rates(effective_date);
```

---

#### `shipments`

```sql
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  org_id UUID REFERENCES organizations(id),
  booking_ref VARCHAR(100),
  container_number VARCHAR(20),
  carrier VARCHAR(100),
  carrier_scac CHAR(4),
  vessel_name VARCHAR(200),
  voyage_number VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  origin_port VARCHAR(10) NOT NULL,
  destination_port VARCHAR(10) NOT NULL,
  etd TIMESTAMPTZ,
  eta TIMESTAMPTZ,
  ata TIMESTAMPTZ,  -- actual time of arrival
  commodity_description TEXT,
  hts_code VARCHAR(10),
  cargo_value DECIMAL(12,4),
  total_weight_kg DECIMAL(10,2),
  total_volume_cbm DECIMAL(10,2),
  container_type VARCHAR(10),
  incoterm VARCHAR(10) DEFAULT 'FOB',
  country_of_origin CHAR(2),
  customs_status VARCHAR(50) DEFAULT 'pending',
  tracking_source VARCHAR(50),  -- terminal49 | manual | carrier_api
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shipments_user ON shipments(user_id);
CREATE INDEX idx_shipments_org ON shipments(org_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_container ON shipments(container_number);
CREATE INDEX idx_shipments_eta ON shipments(eta);
```

**Status Values:** `'draft'`, `'booked'`, `'in_transit'`, `'at_port'`, `'customs_hold'`, `'customs_cleared'`, `'delivered'`, `'cancelled'`

---

#### `shipment_events`

```sql
CREATE TABLE shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(10),  -- port LOCODE
  location_name VARCHAR(200),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  occurred_at TIMESTAMPTZ NOT NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'system',
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_shipment ON shipment_events(shipment_id);
CREATE INDEX idx_events_type ON shipment_events(event_type);
CREATE INDEX idx_events_occurred ON shipment_events(occurred_at);
```

**Event Types:** `'gate_in'`, `'loaded'`, `'vessel_departure'`, `'transshipment_arrival'`, `'transshipment_departure'`, `'vessel_arrival'`, `'discharged'`, `'customs_hold'`, `'customs_released'`, `'gate_out'`, `'delivered'`, `'exception'`

---

#### `shipment_costs`

```sql
CREATE TABLE shipment_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  cost_type VARCHAR(50) NOT NULL,
  description TEXT,
  amount DECIMAL(12,4) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  vendor VARCHAR(200),
  invoice_ref VARCHAR(100),
  paid BOOLEAN NOT NULL DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_costs_shipment ON shipment_costs(shipment_id);
CREATE INDEX idx_costs_type ON shipment_costs(cost_type);
```

**Cost Types:** `'freight'`, `'duty'`, `'mpf'`, `'hmf'`, `'insurance'`, `'customs_broker'`, `'drayage'`, `'demurrage'`, `'detention'`, `'warehousing'`, `'fumigation'`, `'inspection'`, `'other'`

---

#### `shipment_documents`

```sql
CREATE TABLE shipment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  filename VARCHAR(500) NOT NULL,
  storage_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_by UUID REFERENCES users(id),
  ocr_text TEXT,  -- extracted text (Phase 3 AI)
  ocr_confidence DECIMAL(5,4),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_docs_shipment ON shipment_documents(shipment_id);
CREATE INDEX idx_docs_type ON shipment_documents(document_type);
```

**Document Types:** `'bill_of_lading'`, `'commercial_invoice'`, `'packing_list'`, `'certificate_of_origin'`, `'isf_filing'`, `'customs_entry'`, `'arrival_notice'`, `'delivery_order'`, `'insurance_certificate'`, `'fumigation_certificate'`, `'other'`

---

#### `saved_calculations`

```sql
CREATE TABLE saved_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  org_id UUID REFERENCES organizations(id),
  calculation_type VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  input JSONB NOT NULL,
  result JSONB NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_template BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_calcs_user ON saved_calculations(user_id);
CREATE INDEX idx_calcs_type ON saved_calculations(calculation_type);
CREATE INDEX idx_calcs_tags ON saved_calculations USING gin(tags);
```

**Calculation Types:** `'landed_cost'`, `'freight_estimate'`, `'container_utilization'`, `'ftz_analysis'`, `'tariff_scenario'`, `'duty_comparison'`

---

#### `ftz_locations`

```sql
CREATE TABLE ftz_locations (
  id SERIAL PRIMARY KEY,
  zone_number INTEGER NOT NULL UNIQUE,
  name VARCHAR(300) NOT NULL,
  city VARCHAR(200) NOT NULL,
  state VARCHAR(100) NOT NULL,
  state_code CHAR(2) NOT NULL,
  operator VARCHAR(300),
  grantee VARCHAR(300),
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  activated_year INTEGER,
  nearest_port VARCHAR(10),
  port_distance_miles DECIMAL(6,1),
  key_industries TEXT[] DEFAULT '{}',
  annual_merchandise_value_usd BIGINT,
  subzones JSONB DEFAULT '[]',
  last_updated DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ftz_state ON ftz_locations(state_code);
CREATE INDEX idx_ftz_port ON ftz_locations(nearest_port);
CREATE INDEX idx_ftz_industries ON ftz_locations USING gin(key_industries);
```

---

#### `api_keys`

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  org_id UUID REFERENCES organizations(id),
  name VARCHAR(200) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  key_prefix VARCHAR(12) NOT NULL,  -- first 12 chars for identification
  permissions JSONB NOT NULL DEFAULT '["read"]',
  rate_limit INTEGER NOT NULL DEFAULT 100,  -- requests per minute
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
```

---

#### `audit_logs`

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  org_id UUID REFERENCES organizations(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(100),
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Partition by month for performance
-- CREATE TABLE audit_logs_2026_03 PARTITION OF audit_logs FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
```

**Action Values:** `'login'`, `'logout'`, `'register'`, `'calculation.create'`, `'calculation.save'`, `'shipment.create'`, `'shipment.update'`, `'document.upload'`, `'document.download'`, `'api_key.create'`, `'api_key.revoke'`, `'settings.update'`

---

### 2.3 Migration Strategy

```bash
# Generate migration from Drizzle schema changes
npx drizzle-kit generate

# Apply migrations to Neon
npx drizzle-kit migrate

# Push schema directly (development only)
npx drizzle-kit push

# View database in Drizzle Studio
npx drizzle-kit studio
```

**Migration Naming:** `XXXX_descriptive_name.sql` (auto-numbered by drizzle-kit)

**Rollback Strategy:** Each migration includes both `up` and `down` SQL. Critical migrations are tested against a Neon branch before applying to production.

---

## 3. Search Configurations

### 3.1 Phase 0–1: Fuse.js (Client-Side Fuzzy Search)

Fuse.js runs server-side in API route handlers. Two search instances:

#### HTS Code Search

```typescript
const htsSearchIndex = new Fuse(htsData, {
  keys: [
    { name: 'description', weight: 0.7 },
    { name: 'hts_code', weight: 0.3 }
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
  shouldSort: true,
  findAllMatches: false,
  ignoreLocation: true
});
```

**Behavior:** Lazy-loaded on first request. Held in module-level variable for serverless function lifetime.

#### Port Search

```typescript
const portSearchIndex = new Fuse(portData, {
  keys: [
    { name: 'name', weight: 0.5 },
    { name: 'locode', weight: 0.3 },
    { name: 'country', weight: 0.2 }
  ],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 2,
  shouldSort: true
});
```

### 3.2 Phase 3: Typesense (Production Search)

**Why Typesense over alternatives:**
- Algolia rejected: expensive at scale ($1/1K searches)
- Elasticsearch rejected: operational overhead (JVM, cluster management)
- Typesense: self-hosted or Typesense Cloud, sub-50ms latency, typo tolerance built-in

#### HTS Codes Collection

```json
{
  "name": "hts_codes",
  "fields": [
    { "name": "hts_code", "type": "string", "facet": false },
    { "name": "formatted_code", "type": "string", "facet": false },
    { "name": "description", "type": "string" },
    { "name": "chapter", "type": "int32", "facet": true },
    { "name": "heading", "type": "int32", "facet": true },
    { "name": "general_rate", "type": "string", "facet": false },
    { "name": "general_rate_pct", "type": "float", "facet": true },
    { "name": "unit_of_quantity", "type": "string", "facet": true },
    { "name": "indent_level", "type": "int32", "facet": false },
    { "name": "section_301_applicable", "type": "bool", "facet": true },
    { "name": "popularity_score", "type": "int32", "optional": true }
  ],
  "default_sorting_field": "popularity_score",
  "token_separators": [".", "-"]
}
```

**Synonyms:**
```json
{
  "synonyms": [
    { "id": "t-shirt", "synonyms": ["t-shirt", "tee shirt", "tshirt", "t shirt"] },
    { "id": "electronics", "synonyms": ["electronics", "electronic devices", "electronic goods"] },
    { "id": "footwear", "synonyms": ["footwear", "shoes", "boots", "sneakers", "sandals"] },
    { "id": "apparel", "synonyms": ["apparel", "clothing", "garments", "textiles"] },
    { "id": "furniture", "synonyms": ["furniture", "furnishings", "home goods"] }
  ]
}
```

**Ranking Rules (priority order):**
1. Text match score
2. Typo tolerance (max 2 typos)
3. `popularity_score` descending (based on search frequency)
4. `chapter` ascending

**Search Parameters:**
```json
{
  "q": "cotton t-shirt",
  "query_by": "description,hts_code",
  "query_by_weights": "7,3",
  "filter_by": "chapter:=[61,62] && general_rate_pct:>0",
  "sort_by": "_text_match:desc,popularity_score:desc",
  "per_page": 20,
  "typo_tokens_threshold": 2,
  "drop_tokens_threshold": 1,
  "highlight_full_fields": "description"
}
```

#### Ports Collection

```json
{
  "name": "ports",
  "fields": [
    { "name": "locode", "type": "string", "facet": false },
    { "name": "name", "type": "string" },
    { "name": "country", "type": "string", "facet": true },
    { "name": "country_code", "type": "string", "facet": true },
    { "name": "region", "type": "string", "facet": true },
    { "name": "size", "type": "string", "facet": true },
    { "name": "port_type", "type": "string", "facet": true },
    { "name": "annual_teu", "type": "int64", "facet": false },
    { "name": "lat", "type": "float" },
    { "name": "lng", "type": "float" }
  ],
  "default_sorting_field": "annual_teu"
}
```

**Geo-Search Support:** Typesense natively supports `geo_distance_km` filtering for "ports near me" queries.

### 3.3 Phase 3: pgvector Semantic Search

For AI-powered HTS classification, embeddings stored directly in Neon PostgreSQL:

```sql
-- Semantic similarity search for HTS codes
SELECT hts_code, description, general_rate,
       1 - (embedding <=> $1::vector) AS similarity
FROM hts_codes
WHERE embedding IS NOT NULL
ORDER BY embedding <=> $1::vector
LIMIT 10;
```

**Embedding Model:** `text-embedding-3-small` (1536 dimensions, $0.02/1M tokens)
**Index Type:** IVFFlat with 100 lists (optimal for ~17K HTS codes)

---

## 4. Cron Schedules

### 4.1 Phase 0 — Manual Data Pipeline

Currently all data loading is manual via npm scripts. No automated scheduling.

| Script | Command | Purpose | Frequency |
|--------|---------|---------|-----------|
| HTS Code Load | `npm run load:hts` | Fetch from USITC API | Manual (run on HTS updates) |
| Port Data | `npm run load:ports` | Regenerate ports.json | Manual (quarterly) |
| FTZ Zones | `npm run load:ftz` | Regenerate ftz-zones.json | Manual (quarterly) |
| Carrier Routes | `npm run load:routes` | Update route/rate data | Manual (monthly) |
| Duty Rates | `npm run load:duties` | Update SE Asia duty rates | Manual (on trade policy changes) |
| Container Specs | `npm run load:containers` | Update ISO specs | Manual (rarely) |
| Seed Verify | `npm run seed` | Verify all data files exist | CI/CD (pre-build) |

### 4.2 Phase 1–2 — Vercel Cron Jobs

**Infrastructure:** Vercel Cron Jobs (via `vercel.json` configuration)

```json
{
  "crons": [
    {
      "path": "/api/cron/hts-sync",
      "schedule": "30 6 * * *"
    },
    {
      "path": "/api/cron/carrier-rates",
      "schedule": "0 8,20 * * *"
    },
    {
      "path": "/api/cron/tariff-updates",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/port-congestion",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/ftz-inventory",
      "schedule": "0 7 * * *"
    },
    {
      "path": "/api/cron/tracking-updates",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/weather-risk",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/cleanup-expired-tokens",
      "schedule": "0 3 * * *"
    }
  ]
}
```

#### Cron Job Specifications

| Job | Schedule | Timeout | Retry | Dependencies |
|-----|----------|---------|-------|-------------|
| **HTS Code Sync** | Daily 06:30 UTC | 120s | 3× with exponential backoff (30s, 90s, 270s) | USITC API |
| **Carrier Rate Ingestion** | Twice daily 08:00+20:00 UTC | 180s | 3× | Maersk API, CMA CGM API |
| **Tariff Schedule Updates** | Daily midnight UTC | 60s | 2× | USITC, Federal Register |
| **Port Congestion Feed** | Every 6 hours | 90s | 2× | MarineTraffic, port APIs |
| **FTZ Inventory Reconciliation** | Daily 07:00 UTC | 60s | 1× | Internal DB |
| **Shipment Position Updates** | Every 15 minutes | 30s | 1× | Terminal49 API |
| **Weather & Risk Feed** | Hourly | 45s | 2× | Weather APIs, risk data providers |
| **Expired Token Cleanup** | Daily 03:00 UTC | 30s | 1× | Internal DB |

#### Cron Security

All cron endpoints validate the `CRON_SECRET` header:

```typescript
// src/app/api/cron/[job]/route.ts
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... job logic
}
```

---

## 5. Environment Variables

### 5.1 Complete Variable Reference

#### Core Application

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Runtime environment: `development`, `production`, `test` |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` | Public application URL |
| `JWT_SECRET` | Yes (Phase 1+) | — | HS256 signing key for JWT tokens (min 256 bits) |
| `CRON_SECRET` | Yes (Phase 1+) | — | Bearer token for cron endpoint authentication |

#### Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes (Phase 2+) | — | Neon PostgreSQL connection string with pooling |
| `DATABASE_URL_UNPOOLED` | No | — | Direct connection for migrations (bypasses pooler) |

#### Cache & Session

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `UPSTASH_REDIS_REST_URL` | Yes (Phase 2+) | — | Upstash Redis HTTP endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Yes (Phase 2+) | — | Upstash Redis auth token |

#### AI & Embeddings

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes (Phase 3) | — | Claude API key for HTS classification |
| `OPENAI_API_KEY` | Yes (Phase 3) | — | OpenAI API key for text-embedding-3-small |

#### Carrier APIs

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TERMINAL49_API_KEY` | Yes (Phase 2) | — | Terminal49 container tracking API |
| `MAERSK_API_CLIENT_ID` | No (Phase 2) | — | Maersk Developer Portal client ID |
| `MAERSK_API_CLIENT_SECRET` | No (Phase 2) | — | Maersk Developer Portal client secret |
| `CMACGM_API_KEY` | No (Phase 2) | — | CMA CGM API key |

#### Payments & Email

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STRIPE_SECRET_KEY` | Yes (Phase 1 M3) | — | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes (Phase 1 M3) | — | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes (Phase 1 M3) | — | Stripe publishable key (client-side) |
| `RESEND_API_KEY` | Yes (Phase 1 M3) | — | Resend transactional email API key |

#### Maps & Visualization

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_MAPTILER_API_KEY` | Yes (Phase 1 M2) | — | MapTiler tile server API key |

#### Error Tracking

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENTRY_DSN` | Yes (Phase 1) | — | Sentry error tracking DSN |
| `SENTRY_AUTH_TOKEN` | No | — | Sentry source map upload token |

#### Search

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TYPESENSE_HOST` | Yes (Phase 3) | — | Typesense server host |
| `TYPESENSE_PORT` | No | `8108` | Typesense server port |
| `TYPESENSE_API_KEY` | Yes (Phase 3) | — | Typesense admin API key |
| `NEXT_PUBLIC_TYPESENSE_SEARCH_KEY` | Yes (Phase 3) | — | Typesense search-only key (client-side) |

### 5.2 `.env.example`

```bash
# === Core ===
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# === Auth (Phase 1+) ===
JWT_SECRET=your-256-bit-secret-here
CRON_SECRET=your-cron-secret-here

# === Database (Phase 2+) ===
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/shipping_savior?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/shipping_savior?sslmode=require

# === Redis (Phase 2+) ===
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxx

# === AI (Phase 3) ===
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx

# === Carrier APIs (Phase 2) ===
TERMINAL49_API_KEY=t49_xxx
MAERSK_API_CLIENT_ID=xxx
MAERSK_API_CLIENT_SECRET=xxx
CMACGM_API_KEY=xxx

# === Payments (Phase 1 M3) ===
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# === Email (Phase 1 M3) ===
RESEND_API_KEY=re_xxx

# === Maps (Phase 1 M2) ===
NEXT_PUBLIC_MAPTILER_API_KEY=xxx

# === Error Tracking (Phase 1) ===
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# === Search (Phase 3) ===
TYPESENSE_HOST=xxx.a1.typesense.net
TYPESENSE_PORT=443
TYPESENSE_API_KEY=xxx
NEXT_PUBLIC_TYPESENSE_SEARCH_KEY=xxx
```

---

## 6. Third-Party Integrations

### 6.1 Current Integrations (Phase 0)

| Service | Package | Version | Purpose |
|---------|---------|---------|---------|
| Fuse.js | `fuse.js` | ^7.1.0 | Fuzzy search for HTS codes and ports |
| Recharts | `recharts` | ^3.8.1 | Dashboard charts and data visualization |
| Lucide React | `lucide-react` | ^1.7.0 | Icon library |
| USITC REST API | `node-fetch` (build-time) | ^3.3.2 | HTS code data pipeline |
| Cheerio | `cheerio` | ^1.2.0 | HTML parsing for data scraping |
| CSV Parse | `csv-parse` | ^6.2.1 | CSV data ingestion |

### 6.2 Planned Integrations by Phase

#### Phase 1 — Foundation

| Service | Package | Auth Method | Webhook | Purpose |
|---------|---------|-------------|---------|---------|
| **Sentry** | `@sentry/nextjs` | DSN string | No | Error tracking, performance monitoring |
| **MapTiler** | `@maptiler/sdk` | API key (query param) | No | Map tile server for deck.gl base maps |
| **Stripe** | `stripe` + `@stripe/stripe-js` | Secret key + webhook signing | Yes (`/api/webhooks/stripe`) | Subscription billing |
| **Resend** | `resend` | API key (header) | Yes (`/api/webhooks/resend`) | Transactional email |

**Stripe Webhook Events:**
- `checkout.session.completed` — new subscription created
- `invoice.payment_succeeded` — subscription renewal
- `invoice.payment_failed` — payment failure → alert user
- `customer.subscription.updated` — plan change
- `customer.subscription.deleted` — cancellation

**Stripe Webhook Verification:**
```typescript
const event = stripe.webhooks.constructEvent(
  body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

#### Phase 2 — Data Platform

| Service | Package | Auth Method | Rate Limit | Purpose |
|---------|---------|-------------|-----------|---------|
| **Neon PostgreSQL** | `@neondatabase/serverless` + `drizzle-orm` | Connection string | Pooler: 10K conn/s | Primary database |
| **Upstash Redis** | `@upstash/redis` | REST token | 10K req/s | Cache, sessions, rate limiting |
| **Terminal49** | REST API | API key (header) | 100 req/min | Universal container tracking |
| **Maersk API** | REST API | OAuth2 (client credentials) | 50 req/min | Vessel schedules, spot rates |
| **CMA CGM API** | REST API | API key (header) | 30 req/min | Vessel schedules |
| **Vercel Blob** | `@vercel/blob` | Auto (Vercel env) | — | PDF storage, document uploads |

**Terminal49 Integration:**
```typescript
// Container tracking
const response = await fetch('https://api.terminal49.com/v2/containers', {
  headers: {
    'Authorization': `Token ${process.env.TERMINAL49_API_KEY}`,
    'Content-Type': 'application/json'
  }
});
```

**Maersk OAuth2 Flow:**
```typescript
// 1. Get access token
const tokenResponse = await fetch('https://api.maersk.com/oauth2/access_token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: `grant_type=client_credentials&client_id=${MAERSK_CLIENT_ID}&client_secret=${MAERSK_CLIENT_SECRET}`
});

// 2. Use token for API calls
const schedules = await fetch('https://api.maersk.com/schedules/vessel-schedules', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

#### Phase 3 — Intelligence

| Service | Package | Auth Method | Cost Model | Purpose |
|---------|---------|-------------|-----------|---------|
| **Anthropic Claude** | `@anthropic-ai/sdk` | API key (header) | $3/$15 per 1M tokens (Sonnet) | HTS classification, document OCR |
| **OpenAI Embeddings** | `openai` | API key (header) | $0.02/1M tokens | Semantic search embeddings |
| **pgvector** | Neon extension | N/A | Included with Neon | Vector similarity search |

**Claude Classification Prompt Template:**
```typescript
const classificationPrompt = `You are an expert US customs broker classifying products under the Harmonized Tariff Schedule.

Product: ${description}
Material: ${material}
Country of Origin: ${country}
Intended Use: ${use}

Apply the 6-step General Rules of Interpretation (GRI):
1. Determine primary material composition
2. Identify construction method (knitted vs woven, etc.)
3. Classify by garment/product type → correct Chapter and Heading
4. Apply subheading rules for specificity
5. Determine statistical suffix
6. Verify classification doesn't conflict with any Notes to Section/Chapter

Return JSON: { hts_code, confidence, reasoning[], alternatives[] }`;
```

### 6.3 SDK Version Pinning

All third-party SDKs are pinned to exact major versions in `package.json`:

```json
{
  "fuse.js": "^7.1.0",
  "recharts": "^3.8.1",
  "stripe": "^14.0.0",
  "@sentry/nextjs": "^8.0.0",
  "@anthropic-ai/sdk": "^0.30.0",
  "drizzle-orm": "^0.34.0",
  "@upstash/redis": "^1.34.0",
  "@vercel/blob": "^0.24.0",
  "resend": "^4.0.0"
}
```

---

## 7. File Storage

### 7.1 Static Data Files (Phase 0)

All data is stored as flat JSON files in the `/data/` directory at the project root:

| File | Size (approx) | Records | Purpose |
|------|--------------|---------|---------|
| `hts-schedule.json` | ~2 MB | ~5,000+ codes | HTS tariff schedule |
| `hts-schedule.sql` | ~3 MB | SQL export | Database seed file |
| `ports.json` | ~50 KB | ~60 ports | World port data |
| `ftz-zones.json` | ~80 KB | ~25 zones | US Foreign Trade Zones |
| `carrier-routes.json` | ~40 KB | ~50 routes | Shipping route definitions |
| `duty-rates-sea.json` | ~100 KB | ~300 rates | SE Asia duty rate matrix |
| `container-specs.json` | ~15 KB | 6 specs | ISO container specifications |

**Access Pattern:** Loaded lazily on first API request → held in module-level variable for the serverless function's lifetime.

### 7.2 Vercel Blob Storage (Phase 2+)

**Purpose:** User-uploaded documents and generated PDFs.

**Bucket Structure:**
```
shipping-savior/
├── documents/
│   ├── {org_id}/
│   │   ├── {shipment_id}/
│   │   │   ├── bol/
│   │   │   │   └── BOL-{booking_ref}-{timestamp}.pdf
│   │   │   ├── invoices/
│   │   │   │   └── INV-{invoice_number}-{timestamp}.pdf
│   │   │   ├── packing-lists/
│   │   │   │   └── PL-{shipment_id}-{timestamp}.pdf
│   │   │   ├── certificates/
│   │   │   │   └── COO-{shipment_id}-{timestamp}.pdf
│   │   │   └── other/
│   │   │       └── {document_type}-{timestamp}.{ext}
│   │   └── calculations/
│   │       └── CALC-{calc_id}-{timestamp}.pdf
├── exports/
│   ├── {org_id}/
│   │   └── {export_type}-{date}.{csv|xlsx|pdf}
└── temp/
    └── {upload_id}.{ext}  (auto-deleted after 24h)
```

**Naming Conventions:**
- All lowercase with hyphens
- Timestamps in ISO 8601 compact format: `YYYYMMDD-HHmmss`
- File extensions: `.pdf`, `.csv`, `.xlsx`, `.jpg`, `.png`
- Max filename length: 200 characters

**Access Policies:**
- Documents are private by default — accessed only via signed URLs
- Signed URL TTL: 15 minutes for downloads, 5 minutes for uploads
- Max file size: 25 MB per upload
- Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`, `text/csv`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Upload Flow:**
```typescript
// 1. Client requests upload URL
POST /api/uploads/presign
{ "filename": "commercial-invoice.pdf", "content_type": "application/pdf", "shipment_id": "shp-uuid" }

// 2. Server generates Vercel Blob upload URL
{ "upload_url": "https://xxx.public.blob.vercel-storage.com/...", "blob_path": "documents/org-uuid/shp-uuid/invoices/INV-xxx.pdf" }

// 3. Client uploads directly to Vercel Blob
PUT {upload_url} with file body

// 4. Server records in shipment_documents table
```

**Retention Policy:**
- Shipment documents: 5 years (per 19 USC 1508 CBP record-keeping requirement)
- Generated exports: 90 days
- Temp uploads: 24 hours (auto-cleanup via cron)
- Calculation PDFs: matches user subscription retention (free=30d, starter=1yr, pro=3yr, enterprise=5yr)

---

## 8. WebSocket Events

### 8.1 Phase 0–1 — No WebSocket (Polling)

Phase 0 has no real-time features. Phase 1 uses polling for dashboard updates:

```typescript
// Client-side polling (Phase 1)
const { data, mutate } = useSWR('/api/shipments?status=in_transit', fetcher, {
  refreshInterval: 60000  // 60-second polling
});
```

### 8.2 Phase 2 — Server-Sent Events (SSE)

For Phase 2, SSE provides one-way real-time updates without WebSocket complexity:

**Endpoint:** `GET /api/events/stream`

**Headers:**
```
Authorization: Bearer <access_token>
Accept: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Event Types:**

#### `shipment.position_update`
```
event: shipment.position_update
data: {"shipment_id":"shp-uuid","container":"MSKU1234567","lat":15.87,"lng":109.35,"speed_knots":18.5,"heading":45,"timestamp":"2026-03-26T08:00:00Z"}
```

#### `shipment.status_change`
```
event: shipment.status_change
data: {"shipment_id":"shp-uuid","old_status":"in_transit","new_status":"at_port","port":"USLGB","timestamp":"2026-03-26T14:00:00Z"}
```

#### `shipment.eta_update`
```
event: shipment.eta_update
data: {"shipment_id":"shp-uuid","old_eta":"2026-04-07T14:00:00Z","new_eta":"2026-04-06T10:00:00Z","reason":"favorable_weather","confidence":0.87}
```

#### `rate.change`
```
event: rate.change
data: {"trade_lane":"CN-USWC","container_type":"40HC","old_rate":4400,"new_rate":4650,"change_pct":5.7,"effective_date":"2026-03-27"}
```

#### `tariff.update`
```
event: tariff.update
data: {"hts_code":"8471300180","country":"CN","old_rate":25.0,"new_rate":27.5,"type":"section_301","effective_date":"2026-04-01","source":"federal_register"}
```

#### `alert.threshold`
```
event: alert.threshold
data: {"alert_id":"alt-uuid","type":"cost_spike","description":"Ocean freight CN-USWC up 12% this week","severity":"warning","shipments_affected":3}
```

#### `document.processed`
```
event: document.processed
data: {"document_id":"doc-uuid","shipment_id":"shp-uuid","type":"bill_of_lading","ocr_status":"complete","extracted_fields":{"booking_ref":"MAEU-12345678","shipper":"Chen Imports LLC"}}
```

### 8.3 Phase 3 — Full WebSocket (Socket.io)

For bi-directional communication needs (collaborative features, AI chat):

**Namespace:** `/ws`

**Connection:**
```typescript
const socket = io('/ws', {
  auth: { token: accessToken },
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});
```

**Client → Server Events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `subscribe:shipment` | `{ shipment_id: string }` | Subscribe to shipment updates |
| `unsubscribe:shipment` | `{ shipment_id: string }` | Unsubscribe from shipment |
| `subscribe:rates` | `{ trade_lanes: string[] }` | Subscribe to rate changes |
| `ai:classify` | `{ description: string, images?: string[] }` | Start AI classification (streaming response) |
| `ai:chat` | `{ message: string, context?: object }` | AI assistant chat |
| `calculation:run` | `{ type: string, input: object }` | Run calculation (streaming progress) |

**Server → Client Events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `shipment:update` | `ShipmentEvent` | Real-time shipment event |
| `rate:update` | `RateChange` | Freight rate change |
| `tariff:update` | `TariffChange` | Tariff/duty rate change |
| `ai:classify:progress` | `{ step: number, total: 6, description: string }` | Classification progress |
| `ai:classify:result` | `ClassificationResult` | Final classification |
| `ai:chat:token` | `{ token: string }` | Streaming chat token |
| `alert:new` | `Alert` | New alert notification |
| `error` | `{ code: string, message: string }` | Error message |

**Heartbeat:** Server sends `ping` every 25 seconds; client responds with `pong`. Connection dropped after 3 missed pongs (75 seconds).

---

## 9. Error Codes

### 9.1 Error Response Format

All API errors follow a consistent JSON structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error description",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format",
        "value": "not-an-email"
      }
    ],
    "request_id": "req-uuid",
    "timestamp": "2026-03-26T14:00:00Z",
    "documentation_url": "https://docs.shippingsavior.com/errors/VALIDATION_ERROR"
  }
}
```

### 9.2 Error Code Taxonomy

#### Authentication Errors (1xxx)

| Code | HTTP Status | Constant | User-Facing Message |
|------|------------|----------|-------------------|
| 1001 | 401 | `AUTH_INVALID_CREDENTIALS` | "Invalid email or password" |
| 1002 | 401 | `AUTH_TOKEN_EXPIRED` | "Your session has expired. Please log in again" |
| 1003 | 401 | `AUTH_TOKEN_INVALID` | "Invalid authentication token" |
| 1004 | 401 | `AUTH_TOKEN_REVOKED` | "This session has been revoked" |
| 1005 | 403 | `AUTH_INSUFFICIENT_PERMISSIONS` | "You don't have permission to perform this action" |
| 1006 | 423 | `AUTH_ACCOUNT_LOCKED` | "Account temporarily locked due to too many failed attempts. Try again in 30 minutes" |
| 1007 | 403 | `AUTH_EMAIL_NOT_VERIFIED` | "Please verify your email address before continuing" |
| 1008 | 409 | `AUTH_EMAIL_EXISTS` | "An account with this email already exists" |
| 1009 | 429 | `AUTH_RATE_LIMITED` | "Too many attempts. Please try again later" |

#### Validation Errors (2xxx)

| Code | HTTP Status | Constant | User-Facing Message |
|------|------------|----------|-------------------|
| 2001 | 400 | `VALIDATION_REQUIRED_FIELD` | "{field} is required" |
| 2002 | 400 | `VALIDATION_INVALID_FORMAT` | "{field} has an invalid format" |
| 2003 | 400 | `VALIDATION_OUT_OF_RANGE` | "{field} must be between {min} and {max}" |
| 2004 | 400 | `VALIDATION_INVALID_HTS_CODE` | "Invalid HTS code format. Must be 4–10 digits" |
| 2005 | 400 | `VALIDATION_INVALID_LOCODE` | "Invalid UN/LOCODE format" |
| 2006 | 400 | `VALIDATION_INVALID_COUNTRY` | "Unknown country code: {code}" |
| 2007 | 400 | `VALIDATION_INVALID_CONTAINER` | "Unknown container type. Must be one of: 20GP, 40GP, 40HC, 20RF, 40RF, LCL" |
| 2008 | 400 | `VALIDATION_NEGATIVE_VALUE` | "{field} cannot be negative" |
| 2009 | 400 | `VALIDATION_PASSWORD_WEAK` | "Password must be at least 12 characters with uppercase, lowercase, number, and special character" |

#### Resource Errors (3xxx)

| Code | HTTP Status | Constant | User-Facing Message |
|------|------------|----------|-------------------|
| 3001 | 404 | `RESOURCE_NOT_FOUND` | "{resource} not found" |
| 3002 | 404 | `HTS_CODE_NOT_FOUND` | "HTS code {code} not found in the tariff schedule" |
| 3003 | 404 | `PORT_NOT_FOUND` | "Port {locode} not found" |
| 3004 | 404 | `SHIPMENT_NOT_FOUND` | "Shipment not found or you don't have access" |
| 3005 | 404 | `ROUTE_NOT_FOUND` | "No routes found between {origin} and {destination}" |
| 3006 | 404 | `FTZ_NOT_FOUND` | "FTZ zone {number} not found" |
| 3007 | 404 | `CALCULATION_NOT_FOUND` | "Saved calculation not found" |
| 3008 | 404 | `DOCUMENT_NOT_FOUND` | "Document not found" |

#### Calculation Errors (4xxx)

| Code | HTTP Status | Constant | User-Facing Message |
|------|------------|----------|-------------------|
| 4001 | 400 | `CALC_INVALID_ROUTE` | "No shipping routes exist between {origin} and {destination}" |
| 4002 | 400 | `CALC_WEIGHT_EXCEEDS_LIMIT` | "Total weight ({weight}kg) exceeds container capacity ({capacity}kg)" |
| 4003 | 400 | `CALC_VOLUME_EXCEEDS_LIMIT` | "Total volume ({volume}cbm) exceeds container capacity ({capacity}cbm)" |
| 4004 | 400 | `CALC_DUTY_RATE_UNAVAILABLE` | "Duty rate data not available for HTS {code} from {country}" |
| 4005 | 422 | `CALC_FTZ_NOT_APPLICABLE` | "FTZ analysis not applicable for domestic shipments" |
| 4006 | 422 | `CALC_INCOMPATIBLE_MODE` | "Container type {type} not available for {mode} shipping" |
| 4007 | 422 | `CALC_INSUFFICIENT_DATA` | "Cannot calculate: missing {fields}" |

#### Subscription & Quota Errors (5xxx)

| Code | HTTP Status | Constant | User-Facing Message |
|------|------------|----------|-------------------|
| 5001 | 402 | `SUBSCRIPTION_REQUIRED` | "This feature requires a paid subscription" |
| 5002 | 402 | `SUBSCRIPTION_UPGRADE_REQUIRED` | "This feature requires the {tier} plan or higher" |
| 5003 | 429 | `QUOTA_CALCULATIONS_EXCEEDED` | "You've used all {limit} calculations this month. Upgrade for more" |
| 5004 | 429 | `QUOTA_API_CALLS_EXCEEDED` | "API rate limit exceeded. {limit} requests per {window}" |
| 5005 | 402 | `SUBSCRIPTION_PAYMENT_FAILED` | "Your payment method failed. Please update your billing info" |
| 5006 | 429 | `QUOTA_STORAGE_EXCEEDED` | "Storage limit exceeded. Upgrade for more document storage" |

#### Integration Errors (6xxx)

| Code | HTTP Status | Constant | User-Facing Message |
|------|------------|----------|-------------------|
| 6001 | 502 | `INTEGRATION_CARRIER_UNAVAILABLE` | "Unable to reach {carrier} tracking service. Data may be delayed" |
| 6002 | 502 | `INTEGRATION_USITC_UNAVAILABLE` | "USITC HTS database temporarily unavailable. Using cached data" |
| 6003 | 502 | `INTEGRATION_PAYMENT_GATEWAY_ERROR` | "Payment processing temporarily unavailable. Please try again" |
| 6004 | 502 | `INTEGRATION_AI_SERVICE_ERROR` | "AI classification service temporarily unavailable" |
| 6005 | 504 | `INTEGRATION_TIMEOUT` | "External service timed out. Please try again" |
| 6006 | 502 | `INTEGRATION_EMAIL_FAILED` | "Failed to send email notification. We'll retry automatically" |

#### Server Errors (9xxx)

| Code | HTTP Status | Constant | User-Facing Message |
|------|------------|----------|-------------------|
| 9001 | 500 | `INTERNAL_SERVER_ERROR` | "An unexpected error occurred. Our team has been notified" |
| 9002 | 503 | `SERVICE_MAINTENANCE` | "Shipping Savior is undergoing maintenance. We'll be back shortly" |
| 9003 | 500 | `DATABASE_ERROR` | "A database error occurred. Please try again" |
| 9004 | 500 | `CALCULATION_ENGINE_ERROR` | "An error occurred during calculation. Please try again" |

### 9.3 Error Handling Middleware

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    public userMessage: string,
    public details?: unknown
  ) {
    super(userMessage);
  }
}

// Usage in API routes
export function withErrorHandler(handler: Function) {
  return async (request: Request, context: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof AppError) {
        return Response.json({
          error: {
            code: error.code,
            message: error.userMessage,
            details: error.details,
            request_id: crypto.randomUUID(),
            timestamp: new Date().toISOString()
          }
        }, { status: error.statusCode });
      }

      // Unexpected error → log to Sentry, return generic message
      Sentry.captureException(error);
      return Response.json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred. Our team has been notified',
          request_id: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        }
      }, { status: 500 });
    }
  };
}
```

---

## 10. Rate Limits

### 10.1 Architecture

**Backend:** Upstash Redis with sliding window rate limiting via `@upstash/ratelimit`

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

// Per-tier rate limiters
const rateLimiters = {
  free: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '1 m') }),
  starter: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, '1 m') }),
  professional: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, '1 m') }),
  enterprise: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(500, '1 m') }),
};
```

### 10.2 Per-Endpoint Limits

#### Public Endpoints (Phase 0 — no auth required)

| Endpoint | Rate Limit | Window | Key |
|----------|-----------|--------|-----|
| `GET /api/hts/search` | 60 req | 1 minute | IP address |
| `GET /api/hts/[code]` | 120 req | 1 minute | IP address |
| `GET /api/ports/search` | 60 req | 1 minute | IP address |
| `GET /api/ports/[locode]` | 120 req | 1 minute | IP address |
| `GET /api/routes/compare` | 30 req | 1 minute | IP address |
| `GET /api/containers/specs` | 60 req | 1 minute | IP address |
| `GET /api/ftz/zones` | 60 req | 1 minute | IP address |

#### Authentication Endpoints

| Endpoint | Rate Limit | Window | Key | Notes |
|----------|-----------|--------|-----|-------|
| `POST /api/auth/register` | 5 req | 1 hour | IP address | Prevent spam registrations |
| `POST /api/auth/login` | 10 req | 15 minutes | IP + email | Account lockout after 10 failures |
| `POST /api/auth/refresh` | 30 req | 1 minute | User ID | Token refresh |
| `POST /api/auth/forgot-password` | 3 req | 1 hour | Email | Prevent email spam |

#### Authenticated Endpoints — Per Subscription Tier

| Tier | Calculations/Month | API Requests/Min | Concurrent | Burst |
|------|-------------------|-----------------|------------|-------|
| **Free** | 5 | 5 | 1 | 10 |
| **Starter** ($49/mo) | 100 | 30 | 3 | 60 |
| **Professional** ($199/mo) | Unlimited | 100 | 10 | 200 |
| **Enterprise** ($999/mo) | Unlimited | 500 | 50 | 1000 |

#### Per-Endpoint Authenticated Limits

| Endpoint | Free | Starter | Professional | Enterprise |
|----------|------|---------|-------------|-----------|
| `POST /api/calculations/*` | 5/mo | 100/mo | ∞ | ∞ |
| `POST /api/ai/classify-hts` | 0 (blocked) | 10/mo | 100/mo | ∞ |
| `GET /api/tracking/*` | 0 (blocked) | 50/day | 500/day | ∞ |
| `POST /api/uploads/*` | 0 (blocked) | 10/mo | 100/mo | ∞ |
| `GET /api/events/stream` | 0 (blocked) | 1 conn | 5 conn | 50 conn |

#### API Key Limits

| Tier | Keys Allowed | Default Rate/Key | Max Rate/Key |
|------|-------------|-----------------|-------------|
| Free | 0 | — | — |
| Starter | 2 | 30/min | 60/min |
| Professional | 10 | 100/min | 300/min |
| Enterprise | 50 | 500/min | 2000/min |

### 10.3 Rate Limit Headers

All API responses include rate limit headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1711411260
Retry-After: 42
```

### 10.4 Rate Limit Response

When rate limited, the API returns:

```json
{
  "error": {
    "code": "QUOTA_API_CALLS_EXCEEDED",
    "message": "API rate limit exceeded. 100 requests per minute",
    "retry_after": 42,
    "limit": 100,
    "window": "1m",
    "upgrade_url": "https://app.shippingsavior.com/settings/billing"
  }
}
```

HTTP Status: `429 Too Many Requests`

### 10.5 DDoS Protection

- **Vercel Edge Network:** Automatic DDoS mitigation at the CDN layer
- **Global rate limit:** 1000 requests/minute per IP across all endpoints (before per-endpoint limits)
- **Suspicious pattern detection:** Automatic IP blocking for >5000 requests in 5 minutes
- **Geographic rate limiting:** Configurable per-region limits for abuse prevention

---

## Appendix A: Type Reference

### Core Types (`src/lib/types.ts`)

```typescript
// Country codes for all supported origins/destinations
type CountryCode =
  | "CN" | "VN" | "TH" | "ID" | "KH" | "MY" | "PH" | "MM" | "IN" | "BD"  // Asia
  | "US" | "MX" | "CA"  // North America
  | "TR" | "PK" | "LK" | "TW" | "KR" | "JP"  // Other trade partners
  | "DE" | "IT" | "FR" | "GB" | "NL" | "BE" | "ES" | "PL";  // Europe

type ContainerType = "20GP" | "40GP" | "40HC" | "20RF" | "40RF" | "LCL";

type ShippingMode = "ocean-fcl" | "ocean-lcl" | "air" | "air-express" | "ground" | "rail";

type SubscriptionTier = "free" | "starter" | "professional" | "enterprise";

type UserRole = "importer" | "broker" | "ftz_operator" | "admin";

type ShipmentStatus = "draft" | "booked" | "in_transit" | "at_port" | "customs_hold" | "customs_cleared" | "delivered" | "cancelled";

interface LandedCostInput {
  productDescription: string;
  htsCode: string;
  countryOfOrigin: CountryCode;
  unitCostFOB: number;
  totalUnits: number;
  containerType: ContainerType;
  originPort: string;
  destPort: string;
  shippingMode: ShippingMode;
  freightCostTotal: number;
  customsBrokerFee: number;
  insuranceRate: number;
  drayageCost: number;
  warehousingPerUnit?: number;
  fulfillmentPerUnit?: number;
  useFTZ: boolean;
  ftzStorageMonths?: number;
  ftzStorageFeePerUnit?: number;
}

interface LandedCostResult {
  perUnit: {
    fob: number;
    freight: number;
    insurance: number;
    duty: number;
    mpf: number;
    hmf: number;
    customsBroker: number;
    drayage: number;
    warehousing: number;
    fulfillment: number;
    ftzStorage: number;
    total: number;
  };
  total: {
    cargoValue: number;
    freight: number;
    insurance: number;
    duty: number;
    mpf: number;
    hmf: number;
    customsBroker: number;
    drayage: number;
    warehousing: number;
    fulfillment: number;
    ftzStorage: number;
    grandTotal: number;
  };
  effectiveDutyRate: number;
  dutyRate: { baseRate: number; section301: number; effective: number; notes: string };
  mpfRate: number;
  hmfRate: number;
  breakdown: CostBreakdownItem[];
}

interface CostBreakdownItem {
  label: string;
  value: number;
  percentage: number;
}

interface ContainerSpec {
  type: ContainerType;
  label: string;
  internalLength: number;
  internalWidth: number;
  internalHeight: number;
  volumeCapacity: number;
  weightCapacity: number;
  teus: number;
  coldChain: boolean;
}

interface Port {
  unlocode: string;
  name: string;
  city: string;
  country: string;
  countryCode: CountryCode;
  lat: number;
  lng: number;
  type: "seaport" | "airport";
  role: "origin" | "destination" | "transshipment" | "dual";
  tier: 1 | 2 | 3;
  coldChainCapable: boolean;
  ftzNearby: boolean;
  ftzName?: string;
  congestionLevel: "low" | "moderate" | "high" | "severe";
  avgDwellDays: number;
  demurrageRate: number;
  detentionRate: number;
  freeDays: number;
}

interface DutyRate {
  htsChapter: number;
  category: string;
  subcategory: string;
  htsRange: string;
  country: string;
  countryCode: CountryCode;
  generalRate: string;
  generalRatePct: number;
  section301Rate?: string;
  section301Pct?: number;
  effectiveRatePct: number;
  gspEligible: boolean;
  gspStatus?: string;
  ldcPreference: boolean;
  ftaApplicable?: string;
  adCvdFlag: boolean;
  adCvdDetails?: string;
  notes?: string;
}

interface Surcharge {
  code: string;
  name: string;
  amount: number;
  unit: "per_container" | "per_teu" | "per_bl" | "per_shipment";
  required: boolean;
}
```

---

## Appendix B: Data Pipeline Source URLs

| Data Source | URL / API | Auth | Rate Limit |
|------------|-----------|------|-----------|
| USITC HTS Schedule | `https://hts.usitc.gov/reststop/getChapter?chapter={N}` | None | ~2 req/s recommended |
| Federal Register (tariff notices) | `https://www.federalregister.gov/api/v1/` | None | 1000/hour |
| CBP CROSS Rulings | `https://rulings.cbp.gov/api/` | None | Unknown |
| OFIS FTZ Database | `https://ofis.trade.gov/` | None | Manual scrape |
| UN/LOCODE | `https://unece.org/trade/uncefact/unlocode` | None | Bulk download |
| Terminal49 Tracking | `https://api.terminal49.com/v2/` | API Key | 100/min |
| Maersk Schedules | `https://api.maersk.com/schedules/` | OAuth2 | 50/min |
| CMA CGM Schedules | `https://api.cma-cgm.com/` | API Key | 30/min |

---

## Appendix C: Regulatory Constants

| Constant | Value | Source |
|----------|-------|--------|
| US CBP MPF Rate | 0.3464% of customs value | 19 USC 58c |
| US CBP MPF Minimum | $31.67 per entry | Annual CBP adjustment |
| US CBP MPF Maximum | $614.35 per entry | Annual CBP adjustment |
| US CBP HMF Rate | 0.125% of customs value | 19 USC 2401 |
| ISF Filing Window | 24 hours before vessel loading | 19 CFR 149 |
| CBP Record Retention | 5 years | 19 USC 1508 |
| FTZ Weekly Entry | Must file within 10 business days | 19 CFR 146 |
| Section 301 (China Lists 1-3) | 25% additional | USTR |
| Section 301 (China List 4a) | 7.5% additional | USTR |
| UFLPA Compliance | Rebuttable presumption for Xinjiang goods | Pub.L. 117–78 |

---

*End of Technical Specifications*
