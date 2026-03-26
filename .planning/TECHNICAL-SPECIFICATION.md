# Technical Specification — Shipping Savior Platform

**Version:** 1.0
**Date:** 2026-03-26
**Status:** Reference Document
**Linear:** AI-5424

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

### 1.1 Authentication (`/api/auth/*`)

#### `POST /api/auth/register`

Create a new user account with organization and 14-day free trial.

```typescript
// Request
{
  fullName: string;         // max 100 chars
  email: string;            // valid email, max 255 chars
  companyName: string;      // max 200 chars
  password: string;         // min 8 chars, 1 uppercase, 1 number, 1 special
  confirmPassword: string;
  acceptTerms: boolean;     // must be true
}

// Response 201
{
  user: {
    id: string;             // uuid
    email: string;
    fullName: string;
    organizationId: string;
    role: "owner";
    trialEndsAt: string;    // ISO 8601, 14 days from now
  };
  message: "Verification email sent";
}

// Response 409
{ error: "ACCOUNT_EXISTS", message: "An account with this email already exists." }

// Response 422
{ error: "VALIDATION_ERROR", message: string, fields: Record<string, string> }
```

#### `POST /api/auth/login`

Authenticate with email and password. Returns JWT in httpOnly cookie.

```typescript
// Request
{
  email: string;
  password: string;
  rememberMe?: boolean;     // extends session to 30 days (default 24h)
}

// Response 200
{
  user: {
    id: string;
    email: string;
    fullName: string;
    organizationId: string;
    role: "owner" | "admin" | "member" | "viewer";
    plan: "trial" | "starter" | "professional" | "enterprise";
  };
}

// Response 401
{ error: "INVALID_CREDENTIALS", message: "Invalid email or password" }

// Response 423
{ error: "ACCOUNT_LOCKED", message: "Account temporarily locked. Try again in 15 minutes.", retryAfter: 900 }
```

#### `POST /api/auth/logout`

Clear session cookie and invalidate token.

```typescript
// Request: no body (uses httpOnly cookie)
// Response 200
{ message: "Logged out" }
```

#### `POST /api/auth/reset-password`

Request password reset email.

```typescript
// Request
{ email: string }

// Response 200 (always — no email enumeration)
{ message: "If an account exists, a reset link has been sent." }
```

#### `POST /api/auth/reset-password/confirm`

Set new password using reset token.

```typescript
// Request
{
  token: string;            // from email link
  password: string;
  confirmPassword: string;
}

// Response 200
{ message: "Password updated. Please log in." }

// Response 400
{ error: "TOKEN_EXPIRED", message: "Reset link has expired. Request a new one." }
```

#### `POST /api/auth/verify-email`

Verify email address using magic link token.

```typescript
// Request
{ token: string }

// Response 200
{ message: "Email verified", redirectTo: "/onboarding" }
```

---

### 1.2 Calculation Endpoints (`/api/calculate/*`)

#### `POST /api/calculate/landed-cost`

Calculate complete landed cost for an import shipment.

```typescript
// Request
{
  productDescription: string;
  htsCode: string;                       // e.g. "4202.92.30"
  countryOfOrigin: CountryCode;          // e.g. "VN", "CN", "TH"
  unitCostFOB: number;                   // USD per unit at origin
  totalUnits: number;                    // integer >= 1
  containerType: ContainerType;          // "20GP" | "40GP" | "40HC" | "20RF" | "40RF" | "LCL"
  originPort: string;                    // UNLOCODE e.g. "VNSGN"
  destPort: string;                      // UNLOCODE e.g. "USLAX"
  shippingMode: ShippingMode;            // "ocean-fcl" | "ocean-lcl" | "air" | "ground"
  freightCostTotal: number;              // USD total freight
  customsBrokerFee: number;              // USD flat fee (typical: $150-500)
  insuranceRate: number;                 // % of CIF value (typical: 0.3-0.5)
  drayageCost: number;                   // USD port-to-warehouse
  warehousingPerUnit?: number;           // USD per unit (default: 0)
  fulfillmentPerUnit?: number;           // USD per unit (default: 0)
  useFTZ: boolean;
  ftzStorageMonths?: number;             // months in FTZ (default: 0)
  ftzStorageFeePerUnit?: number;         // USD/unit/month (default: 0)
}

// Response 200
{
  perUnit: {
    fob: number;
    freight: number;
    insurance: number;
    dutyMPF: number;          // duty + MPF + HMF combined
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
    mpf: number;              // Merchandise Processing Fee (0.3464%, min $31.67, max $614.35)
    hmf: number;              // Harbor Maintenance Fee (0.125%)
    customsBroker: number;
    drayage: number;
    warehousing: number;
    fulfillment: number;
    ftzStorage: number;
    grandTotal: number;
  };
  effectiveDutyRate: number;  // actual % paid
  dutyRate: number;           // base + section 301
  mpfRate: number;            // 0.3464
  hmfRate: number;            // 0.125
  breakdown: CostBreakdownItem[];
}
```

**Calculation Constants:**
| Constant | Value | Source |
|----------|-------|--------|
| MPF Rate | 0.3464% | 19 CFR 24.23 |
| MPF Minimum | $31.67/entry | CBP |
| MPF Maximum | $614.35/entry | CBP |
| HMF Rate | 0.125% | 26 USC 4461 |
| Packing Efficiency | 85% | Industry standard |

#### `POST /api/calculate/unit-economics`

Calculate full import-to-retail pipeline economics.

```typescript
// Request
{
  productDescription: string;
  htsCode: string;
  countryOfOrigin: CountryCode;
  originCostPerUnit: number;             // $0.10 example (factory gate)
  unitsPerContainer: number;
  containerType: ContainerType;
  containerFreight: number;
  dutyRate?: number;                     // override, or auto-lookup from HTS
  insuranceRate: number;
  customsBrokerFee: number;
  drayageCost: number;
  warehousingPerUnit: number;
  fulfillmentPerUnit: number;
  wholesaleMarkup: number;               // multiplier e.g. 4.0 ($0.50 → $2.00)
  retailMarkup: number;                  // multiplier e.g. 2.5 ($2.00 → $5.00)
  endBuyerMargin: number;                // % e.g. 50
}

// Response 200
{
  pipeline: {
    originCost: number;                  // $0.10
    landedCost: number;                  // $0.50
    wholesalePrice: number;              // $2.00
    retailPrice: number;                 // $5.00
    endBuyerPrice: number;              // after their margin
  };
  margins: {
    importerGrossMargin: number;         // %
    importerNetMargin: number;           // %
    wholesalerMargin: number;            // %
    retailerMargin: number;              // %
  };
  perContainer: {
    totalCost: number;
    totalRevenue: number;
    grossProfit: number;
    units: number;
  };
  breakeven: {
    unitsToBreakeven: number;
    containersToBreakeven: number;
  };
}
```

#### `POST /api/calculate/container-utilization`

Optimize container loading by volume and weight constraints.

```typescript
// Request
{
  containerType: ContainerType;
  unitLengthCm: number;
  unitWidthCm: number;
  unitHeightCm: number;
  unitWeightKg: number;
  masterCasePcs?: number;               // units per master carton
  masterCaseLengthCm?: number;
  masterCaseWidthCm?: number;
  masterCaseHeightCm?: number;
  masterCaseWeightKg?: number;
  palletPattern?: boolean;
  palletType?: "standard" | "euro";
}

// Response 200
{
  container: ContainerSpec;
  byVolume: {
    unitsPerContainer: number;
    volumeUsedCBM: number;
    volumeCapacityCBM: number;
    utilizationPct: number;
    wastedCBM: number;
  };
  byWeight: {
    unitsPerContainer: number;
    weightUsedKg: number;
    weightCapacityKg: number;
    utilizationPct: number;
    remainingKg: number;
  };
  bindingConstraint: "volume" | "weight";
  optimalUnits: number;
  costPerUnit?: number;
}
```

#### `POST /api/calculate/ftz-savings`

Compare FTZ vs. non-FTZ cost scenarios with incremental withdrawal modeling.

```typescript
// Request
{
  htsCode: string;
  countryOfOrigin: CountryCode;
  cargoValueUSD: number;
  totalUnits: number;
  storageDurationMonths: number;
  ftzStorageFeePerUnit: number;
  withdrawalSchedule: Array<{
    month: number;                       // 1-indexed
    units: number;
    dutyRateAtWithdrawal?: number;       // optional override (rate locking)
  }>;
  nonFTZStorageFeePerUnit: number;
  nonFTZBondCost: number;
}

// Response 200
{
  ftzScenario: {
    totalDutyPaid: number;
    totalStorageCost: number;
    totalCost: number;
    dutyDeferralSavings: number;         // time-value-of-money benefit
    rateLockSavings: number;             // if rates increased during storage
    withdrawalDetails: Array<{
      month: number;
      units: number;
      dutyRate: number;
      dutyPaid: number;
    }>;
  };
  nonFTZScenario: {
    totalDutyPaid: number;               // full duty at import
    totalStorageCost: number;
    bondCost: number;
    totalCost: number;
  };
  netSavings: number;
  savingsPct: number;
  recommendation: "ftz" | "non-ftz";
  breakEvenMonths: number;               // months of FTZ storage before savings offset costs
}
```

#### `GET /api/calculate/duty-estimate`

Quick HTS code lookup with effective duty rate.

```typescript
// Query params
?htsCode=4202.92.30&country=VN

// Response 200
{
  htsCode: string;
  description: string;
  generalRate: string;
  countryOfOrigin: CountryCode;
  baseRate: number;                      // % (e.g. 17.6)
  section301Rate: number;               // % (e.g. 0 for VN, 7.5 for CN)
  effectiveRate: number;                // baseRate + section301Rate
  freeTradeAgreement?: string;
  gspEligible: boolean;
  notes: string[];
  dataDate: string;                     // when HTS data was last updated
}
```

---

### 1.3 Freight Rate Endpoints (`/api/freight/*`)

#### `POST /api/freight/ocean-estimate`

Estimate ocean freight cost by trade lane.

```typescript
// Request
{
  originCountry: string;                 // ISO 3166-1 alpha-2
  destRegion: "USWC" | "USEC";
  containerType: ContainerType;
  options?: {
    includeBAF?: boolean;                // Bunker Adjustment Factor (default: true)
    includeCAF?: boolean;                // Currency Adjustment Factor (default: false)
    includeISPS?: boolean;               // Security surcharge (default: true)
    includeDocFee?: boolean;             // B/L processing (default: true)
    includeDTHC?: boolean;               // Destination Terminal Handling (default: true)
    includeOTHC?: boolean;               // Origin Terminal Handling (default: false)
    includeISF?: boolean;                // ISF filing fee (default: true)
    includeAMS?: boolean;                // AMS filing fee (default: true)
  };
}

// Response 200
{
  baseRate: number;                      // USD
  surcharges: Array<{ name: string; code: string; amount: number }>;
  totalFreight: number;
  perTEU: number;
  transitDays: { min: number; max: number };
  tradeLane: string;
  notes: string[];
}
```

**Surcharge Reference:**
| Code | Name | Typical Range |
|------|------|---------------|
| BAF | Bunker Adjustment Factor | $150–600 |
| CAF | Currency Adjustment Factor | $50–250 |
| ISPS | International Ship & Port Security | $15–45 |
| DOC | Documentation Fee | $50–150 |
| AMS | Automated Manifest System | $25–75 |
| ISF | Importer Security Filing | $35–100 |
| DTHC | Destination Terminal Handling | $200–450 |
| OTHC | Origin Terminal Handling | $150–300 |

#### `POST /api/freight/air-estimate`

Estimate air freight cost with volumetric weight calculation.

```typescript
// Request
{
  originAirport: string;                 // IATA code
  destAirport: string;                   // IATA code
  weightKg: number;
  volumeCBM: number;
  service: "standard" | "express" | "economy";
  cargoType: "general" | "perishable" | "dangerous" | "valuable";
}

// Response 200
{
  chargeableWeightKg: number;            // max(actual, volumetric)
  actualWeightKg: number;
  volumetricWeightKg: number;            // CBM * 1M / 6000
  ratePerKg: number;
  baseFreight: number;
  surcharges: Array<{ name: string; amount: number }>;
  totalFreight: number;
  transitDays: { min: number; max: number };
  notes: string[];
}
```

**Air Volumetric Divisor:** 6000 cm³/kg (IATA standard)

**Cargo Type Multipliers:**
| Type | Multiplier |
|------|-----------|
| general | 1.0x |
| perishable | 1.4x |
| dangerous | 1.8x |
| valuable | 1.3x |

#### `POST /api/freight/ground-estimate`

Estimate domestic ground freight (LTL/FTL).

```typescript
// Request
{
  originZip: string;
  destZip: string;
  weightLbs: number;
  pallets: number;
  service: "standard" | "expedited" | "white-glove";
  liftgateOrigin: boolean;
  liftgateDest: boolean;
  insideDelivery: boolean;
}

// Response 200
{
  mode: "FTL (Full Truckload)" | "LTL (Less-Than-Truckload)";
  transitDays: { min: number; max: number };
  baseFreight: number;
  accessorials: Array<{ name: string; amount: number }>;
  totalFreight: number;
  costPerPallet: number;
  costPerLb: number;
  notes: string[];
}
```

**FTL vs LTL threshold:** >= 14 pallets OR >= 40,000 lbs = FTL

**LTL Rate Table (per CWT):**
| Weight Bracket | Rate/CWT |
|---------------|----------|
| < 500 lbs | $32.00 |
| 500–1,000 | $26.00 |
| 1,000–2,000 | $22.00 |
| 2,000–5,000 | $18.00 |
| 5,000–10,000 | $15.00 |
| > 10,000 | $12.00 |

#### `POST /api/freight/compare-modes`

Compare ocean, air, and ground options for a shipment.

```typescript
// Request
{
  weightKg: number;
  volumeCBM: number;
  originCountry: string;
  urgency: "low" | "medium" | "high";
  cargoValue: number;
}

// Response 200
{
  comparisons: Array<{
    mode: string;
    transitDays: string;
    totalCost: number;
    costPerKg: number;
    recommended: boolean;
    reason: string;
  }>;
}
```

---

### 1.4 HTS Code Endpoints (`/api/hts/*`)

#### `GET /api/hts/search`

Search HTS codes by description or code.

```typescript
// Query params
?q=backpack&limit=20&chapter=42

// Response 200
{
  results: Array<{
    htsCode: string;
    description: string;
    unit: string;
    generalRate: string;
    specialRate: string;
    col2Rate: string;
    chapter: number;
    section: string;
    notes?: string;
  }>;
  total: number;
  query: string;
}
```

#### `GET /api/hts/code/:code`

Get full details for a specific HTS code.

```typescript
// Response 200
{
  htsCode: string;
  description: string;
  unit: string;
  generalRate: string;
  specialRate: string;
  col2Rate: string;
  chapter: number;
  section: string;
  notes?: string;
  dutyRatesByCountry: Array<{
    country: CountryCode;
    label: string;
    baseRate: number;
    section301: number;
    effective: number;
  }>;
}
```

#### `GET /api/hts/chapters`

List all HTS chapters with counts.

```typescript
// Response 200
{
  chapters: Array<{
    chapter: number;
    description: string;
    codeCount: number;
  }>;
}
```

---

### 1.5 Route & Port Endpoints (`/api/routes/*`)

#### `GET /api/routes`

List shipping routes with optional filters.

```typescript
// Query params
?origin=VNSGN&dest=USLAX&carrier=Maersk&direct=true

// Response 200
{
  routes: Array<{
    id: string;
    originCode: string;
    destCode: string;
    carrier: string;
    mode: ShippingMode;
    transitDays: { min: number; max: number };
    costPerTEU: number;
    direct: boolean;
    transshipmentCode?: string;
    frequency: string;
    serviceRoute: string;
    backhaulDiscount: number;           // %
    reliability: number;                // % on-time
  }>;
}
```

#### `GET /api/ports`

List ports with optional filters.

```typescript
// Query params
?country=US&role=destination&coldChain=true&tier=1

// Response 200
{
  ports: Array<{
    unlocode: string;
    name: string;
    city: string;
    country: CountryCode;
    lat: number;
    lng: number;
    type: "seaport" | "airport" | "inland";
    role: PortRole;
    tier: 1 | 2 | 3;
    coldChainCapable: boolean;
    ftzNearby: boolean;
    ftzName?: string;
    congestionLevel: "low" | "medium" | "high";
    avgDwellDays: number;
    demurrageRate: number;              // $/day
    detentionRate: number;              // $/day
    freeDays: number;
  }>;
}
```

#### `GET /api/ports/:unlocode`

Get detailed info for a specific port.

```typescript
// Response 200
{
  port: Port;
  nearbyFTZ?: FTZLocation;
  availableRoutes: RouteSegment[];
  carriers: string[];
}
```

---

### 1.6 Export Endpoints (`/api/export/*`)

#### `POST /api/export/pdf`

Generate a PDF report from calculation results.

```typescript
// Request
{
  type: "landed-cost" | "ftz-comparison" | "unit-economics" | "route-comparison" | "bill-of-lading";
  data: Record<string, any>;            // calculation result payload
  options?: {
    includeLogo?: boolean;              // default: true
    includeDisclaimer?: boolean;        // default: true
    currency?: "USD" | "EUR" | "GBP";  // default: "USD"
    dateFormat?: "US" | "EU" | "ISO";   // default: "US"
  };
}

// Response 200
// Content-Type: application/pdf
// Content-Disposition: attachment; filename="shipping-savior-{type}-{date}.pdf"
```

---

### 1.7 Shipment Tracking Endpoints (`/api/shipments/*`)

#### `GET /api/shipments`

List shipments for the authenticated organization.

```typescript
// Query params
?status=in-transit&sort=eta&order=asc&page=1&limit=20

// Response 200
{
  shipments: Array<{
    id: string;
    reference: string;
    origin: { port: string; city: string; country: string };
    destination: { port: string; city: string; country: string };
    carrier: string;
    containerType: ContainerType;
    containerNumber?: string;
    status: ShipmentStatus;
    eta: string;                         // ISO 8601
    etd: string;
    cargoValue: number;
    cargoType: "general" | "cold-chain";
    lastUpdate: string;
  }>;
  pagination: { page: number; limit: number; total: number; pages: number };
}

type ShipmentStatus =
  | "booked"
  | "at-origin-port"
  | "in-transit"
  | "transshipment"
  | "at-dest-port"
  | "customs-hold"
  | "cleared"
  | "in-ftz"
  | "out-for-delivery"
  | "delivered"
  | "exception";
```

#### `POST /api/shipments`

Create a new shipment to track.

```typescript
// Request
{
  reference: string;                     // user's internal reference
  originPort: string;                    // UNLOCODE
  destPort: string;                      // UNLOCODE
  carrier: string;
  containerType: ContainerType;
  containerNumber?: string;              // e.g. "MSCU-4821937"
  bookingNumber?: string;
  billOfLading?: string;
  etd: string;                           // ISO 8601
  eta: string;                           // ISO 8601
  cargoDescription: string;
  cargoValue: number;
  cargoType: "general" | "cold-chain";
  htsCode?: string;
  countryOfOrigin?: CountryCode;
}

// Response 201
{ shipment: Shipment }
```

#### `GET /api/shipments/:id`

Full shipment detail including timeline and costs.

```typescript
// Response 200
{
  shipment: Shipment;
  timeline: Array<{
    timestamp: string;
    event: string;
    location: string;
    status: ShipmentStatus;
  }>;
  costs: {
    freight: number;
    duty: number;
    insurance: number;
    drayage: number;
    storage: number;
    fees: number;
    total: number;
  };
  documents: Array<{
    type: string;                        // "BOL", "commercial-invoice", "packing-list"
    name: string;
    url: string;
    uploadedAt: string;
  }>;
  temperatureLog?: Array<{              // cold chain only
    timestamp: string;
    tempCelsius: number;
    humidity: number;
    location: string;
  }>;
}
```

#### `PATCH /api/shipments/:id`

Update shipment status or details.

```typescript
// Request
{
  status?: ShipmentStatus;
  eta?: string;
  containerNumber?: string;
  notes?: string;
}

// Response 200
{ shipment: Shipment }
```

---

### 1.8 Analytics Endpoints (`/api/analytics/*`)

#### `GET /api/analytics/dashboard`

Aggregated KPIs for the executive dashboard.

```typescript
// Query params
?period=30d  // 30d | 60d | 90d | 12m

// Response 200
{
  kpis: {
    activeShipments: { value: number; trend: number; trendDirection: "up" | "down" };
    monthlyRevenue: { value: number; trend: number; trendDirection: "up" | "down" };
    avgLandedCost: { value: number; trend: number; trendDirection: "up" | "down" };
    onTimeRate: { value: number; trend: number; trendDirection: "up" | "down" };
  };
  costTrends: Array<{
    month: string;
    freight: number;
    duties: number;
    drayage: number;
    storage: number;
    insurance: number;
    fees: number;
  }>;
  topRoutes: Array<{
    origin: string;
    destination: string;
    volume: number;
    avgCost: number;
  }>;
  carrierPerformance: Array<{
    carrier: string;
    shipments: number;
    onTimeRate: number;
    avgDelay: number;
    avgCost: number;
  }>;
}
```

---

### 1.9 Organization & Settings Endpoints (`/api/org/*`)

#### `GET /api/org/profile`

Get organization profile and subscription details.

```typescript
// Response 200
{
  id: string;
  name: string;
  plan: "trial" | "starter" | "professional" | "enterprise";
  trialEndsAt?: string;
  members: Array<{
    id: string;
    email: string;
    fullName: string;
    role: "owner" | "admin" | "member" | "viewer";
    lastActive: string;
  }>;
  settings: {
    defaultCurrency: string;
    defaultOriginCountry: CountryCode;
    defaultDestPort: string;
    defaultContainerType: ContainerType;
    notificationPreferences: {
      etaChanges: boolean;
      tariffUpdates: boolean;
      complianceAlerts: boolean;
      ftzReminders: boolean;
    };
  };
}
```

#### `PATCH /api/org/settings`

Update organization settings.

```typescript
// Request
{
  defaultCurrency?: string;
  defaultOriginCountry?: CountryCode;
  defaultDestPort?: string;
  defaultContainerType?: ContainerType;
  notificationPreferences?: Partial<NotificationPreferences>;
}

// Response 200
{ settings: OrgSettings }
```

---

## 2. Database Tables

### Database: PostgreSQL (Neon) via Drizzle ORM

### 2.1 `users`

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,           -- bcrypt
  full_name       VARCHAR(100) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  role            VARCHAR(20) NOT NULL DEFAULT 'member'
                  CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  email_verified  BOOLEAN NOT NULL DEFAULT false,
  locked_until    TIMESTAMPTZ,                     -- account lockout
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_org ON users(organization_id);
```

### 2.2 `organizations`

```sql
CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(200) NOT NULL,
  plan            VARCHAR(20) NOT NULL DEFAULT 'trial'
                  CHECK (plan IN ('trial', 'starter', 'professional', 'enterprise')),
  trial_ends_at   TIMESTAMPTZ,
  stripe_customer_id VARCHAR(100),
  settings        JSONB NOT NULL DEFAULT '{}',     -- org-level settings (defaults, preferences)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.3 `shipments`

```sql
CREATE TABLE shipments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  reference       VARCHAR(50) NOT NULL,            -- user's internal ref
  origin_port     VARCHAR(10) NOT NULL,            -- UNLOCODE
  dest_port       VARCHAR(10) NOT NULL,            -- UNLOCODE
  carrier         VARCHAR(100),
  container_type  VARCHAR(5) NOT NULL
                  CHECK (container_type IN ('20GP', '40GP', '40HC', '20RF', '40RF', 'LCL')),
  container_number VARCHAR(20),                    -- e.g. "MSCU-4821937"
  booking_number  VARCHAR(50),
  bill_of_lading  VARCHAR(50),
  status          VARCHAR(20) NOT NULL DEFAULT 'booked'
                  CHECK (status IN (
                    'booked', 'at-origin-port', 'in-transit', 'transshipment',
                    'at-dest-port', 'customs-hold', 'cleared', 'in-ftz',
                    'out-for-delivery', 'delivered', 'exception'
                  )),
  etd             TIMESTAMPTZ,                     -- estimated time of departure
  eta             TIMESTAMPTZ,                     -- estimated time of arrival
  actual_departure TIMESTAMPTZ,
  actual_arrival  TIMESTAMPTZ,
  cargo_description VARCHAR(500),
  cargo_value     DECIMAL(12,2),                   -- USD
  cargo_type      VARCHAR(15) NOT NULL DEFAULT 'general'
                  CHECK (cargo_type IN ('general', 'cold-chain')),
  hts_code        VARCHAR(15),
  country_of_origin VARCHAR(5),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipments_org ON shipments(organization_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_eta ON shipments(eta);
CREATE INDEX idx_shipments_org_status ON shipments(organization_id, status);
```

### 2.4 `shipment_events`

Timeline events for shipment tracking.

```sql
CREATE TABLE shipment_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id     UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  event_type      VARCHAR(30) NOT NULL
                  CHECK (event_type IN (
                    'booked', 'gate-in', 'departed', 'transshipment-arrived',
                    'transshipment-departed', 'arrived', 'customs-hold',
                    'customs-cleared', 'ftz-admitted', 'ftz-withdrawn',
                    'out-for-delivery', 'delivered', 'exception', 'note'
                  )),
  description     VARCHAR(500) NOT NULL,
  location        VARCHAR(100),
  occurred_at     TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipment_events_shipment ON shipment_events(shipment_id);
CREATE INDEX idx_shipment_events_occurred ON shipment_events(occurred_at);
```

### 2.5 `shipment_costs`

Per-shipment cost breakdown.

```sql
CREATE TABLE shipment_costs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id     UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  category        VARCHAR(20) NOT NULL
                  CHECK (category IN (
                    'freight', 'duty', 'mpf', 'hmf', 'insurance',
                    'customs-broker', 'drayage', 'warehousing', 'fulfillment',
                    'ftz-storage', 'demurrage', 'detention', 'exam-fee',
                    'bond', 'isf-fee', 'other'
                  )),
  amount          DECIMAL(10,2) NOT NULL,
  currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
  description     VARCHAR(200),
  invoice_ref     VARCHAR(50),
  incurred_at     DATE NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipment_costs_shipment ON shipment_costs(shipment_id);
CREATE INDEX idx_shipment_costs_category ON shipment_costs(category);
```

### 2.6 `shipment_documents`

Uploaded shipping documents.

```sql
CREATE TABLE shipment_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id     UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  doc_type        VARCHAR(30) NOT NULL
                  CHECK (doc_type IN (
                    'bill-of-lading', 'commercial-invoice', 'packing-list',
                    'certificate-of-origin', 'isf-filing', 'customs-entry',
                    'ftz-admission', 'ftz-withdrawal', 'inspection-report',
                    'temperature-log', 'insurance-certificate', 'other'
                  )),
  file_name       VARCHAR(255) NOT NULL,
  file_url        VARCHAR(500) NOT NULL,            -- Vercel Blob URL
  file_size_bytes INTEGER NOT NULL,
  mime_type       VARCHAR(50) NOT NULL,
  uploaded_by     UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipment_docs_shipment ON shipment_documents(shipment_id);
```

### 2.7 `temperature_readings`

Cold chain temperature monitoring data.

```sql
CREATE TABLE temperature_readings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id     UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  temp_celsius    DECIMAL(5,2) NOT NULL,
  humidity_pct    DECIMAL(5,2),
  location        VARCHAR(100),
  sensor_id       VARCHAR(50),
  recorded_at     TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_temp_readings_shipment ON temperature_readings(shipment_id);
CREATE INDEX idx_temp_readings_time ON temperature_readings(recorded_at);
-- Partition by month for high-volume cold chain data
```

### 2.8 `saved_calculations`

Persisted calculator scenarios.

```sql
CREATE TABLE saved_calculations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  calc_type       VARCHAR(30) NOT NULL
                  CHECK (calc_type IN (
                    'landed-cost', 'unit-economics', 'container-util',
                    'ftz-comparison', 'tariff-scenario', 'freight-estimate'
                  )),
  name            VARCHAR(100) NOT NULL,
  inputs          JSONB NOT NULL,
  results         JSONB NOT NULL,
  is_favorite     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_saved_calcs_org ON saved_calculations(organization_id);
CREATE INDEX idx_saved_calcs_user ON saved_calculations(user_id);
CREATE INDEX idx_saved_calcs_type ON saved_calculations(calc_type);
```

### 2.9 `hts_codes` (Denormalized Cache)

Cached HTS tariff schedule for fast lookups.

```sql
CREATE TABLE hts_codes (
  hts_code        VARCHAR(15) PRIMARY KEY,
  description     TEXT NOT NULL,
  unit            VARCHAR(20),
  general_rate    VARCHAR(50),
  special_rate    TEXT,
  col2_rate       VARCHAR(50),
  chapter         INTEGER NOT NULL,
  section         VARCHAR(10),
  notes           TEXT,
  last_updated    DATE NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hts_chapter ON hts_codes(chapter);
CREATE INDEX idx_hts_description_trgm ON hts_codes USING gin(description gin_trgm_ops);
```

### 2.10 `duty_rates`

Country-specific duty rates per HTS code.

```sql
CREATE TABLE duty_rates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hts_code        VARCHAR(15) NOT NULL REFERENCES hts_codes(hts_code),
  country_code    VARCHAR(5) NOT NULL,
  base_rate       DECIMAL(6,3) NOT NULL,            -- percentage
  section_301_rate DECIMAL(6,3) NOT NULL DEFAULT 0,
  effective_rate  DECIMAL(6,3) NOT NULL,
  fta_agreement   VARCHAR(20),
  fta_rate        DECIMAL(6,3),
  gsp_eligible    BOOLEAN NOT NULL DEFAULT false,
  effective_date  DATE NOT NULL,
  expiry_date     DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_duty_rates_code_country ON duty_rates(hts_code, country_code);
CREATE INDEX idx_duty_rates_country ON duty_rates(country_code);
```

### 2.11 `ftz_locations`

Free Trade Zone directory.

```sql
CREATE TABLE ftz_locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ftz_number      INTEGER NOT NULL UNIQUE,
  name            VARCHAR(200) NOT NULL,
  city            VARCHAR(100) NOT NULL,
  state           VARCHAR(2) NOT NULL,
  lat             DECIMAL(9,6) NOT NULL,
  lng             DECIMAL(9,6) NOT NULL,
  nearest_port    VARCHAR(10),                     -- UNLOCODE
  distance_to_port DECIMAL(6,1),                   -- miles
  subzones        INTEGER NOT NULL DEFAULT 0,
  active_since    INTEGER,                         -- year
  grantee         VARCHAR(200),
  operator        VARCHAR(200),
  warehouses      INTEGER NOT NULL DEFAULT 0,
  status          VARCHAR(20) NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'inactive', 'pending')),
  last_updated    DATE NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ftz_state ON ftz_locations(state);
CREATE INDEX idx_ftz_port ON ftz_locations(nearest_port);
CREATE INDEX idx_ftz_location ON ftz_locations USING gist(
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)
);
```

### 2.12 `notifications`

User notification feed.

```sql
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id         UUID REFERENCES users(id),       -- NULL = org-wide
  title           VARCHAR(200) NOT NULL,
  message         TEXT NOT NULL,
  type            VARCHAR(20) NOT NULL
                  CHECK (type IN ('info', 'warning', 'success', 'error')),
  category        VARCHAR(20) NOT NULL
                  CHECK (category IN (
                    'shipment', 'tariff', 'ftz', 'compliance',
                    'billing', 'system', 'document'
                  )),
  reference_type  VARCHAR(20),                     -- 'shipment', 'calculation', etc.
  reference_id    UUID,                            -- FK to related entity
  read            BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_org ON notifications(organization_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(organization_id, read);
```

### 2.13 `audit_log`

Audit trail for compliance-sensitive actions.

```sql
CREATE TABLE audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id         UUID REFERENCES users(id),
  action          VARCHAR(50) NOT NULL,            -- 'shipment.created', 'ftz.withdrawn', etc.
  entity_type     VARCHAR(30) NOT NULL,
  entity_id       UUID,
  details         JSONB,                           -- before/after state
  ip_address      INET,
  user_agent      VARCHAR(500),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_org ON audit_log(organization_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_time ON audit_log(created_at);
-- 5-year retention per CBP requirements (19 CFR 163.4)
```

---

## 3. Search Configurations

### 3.1 Client-Side Search (Phase 1-2)

**Engine:** Fuse.js (fuzzy search for < 10K entries) / FlexSearch (for 100K+ entries)

#### HTS Code Search Index

```typescript
// Fuse.js configuration
const fuseOptions = {
  keys: [
    { name: "htsCode", weight: 0.4 },
    { name: "description", weight: 0.5 },
    { name: "notes", weight: 0.1 },
  ],
  threshold: 0.3,                        // 0 = exact, 1 = anything
  distance: 100,
  minMatchCharLength: 2,
  includeScore: true,
  includeMatches: true,
  shouldSort: true,
};
```

#### FlexSearch Configuration (Production — 100K+ entries)

```typescript
// FlexSearch index for high-volume HTS search
const index = new FlexSearch.Document({
  document: {
    id: "htsCode",
    index: [
      {
        field: "description",
        tokenize: "forward",
        resolution: 9,
        optimize: true,
      },
      {
        field: "htsCode",
        tokenize: "strict",
        resolution: 9,
      },
    ],
    store: ["htsCode", "description", "unit", "generalRate", "chapter"],
  },
  charset: "latin:advanced",
  language: "en",
  cache: 100,
});
```

### 3.2 Server-Side Search (Phase 3+)

**Engine:** Typesense (self-hosted or Typesense Cloud)

#### HTS Codes Collection

```json
{
  "name": "hts_codes",
  "fields": [
    { "name": "hts_code", "type": "string", "facet": false },
    { "name": "description", "type": "string" },
    { "name": "chapter", "type": "int32", "facet": true },
    { "name": "section", "type": "string", "facet": true },
    { "name": "general_rate", "type": "string", "facet": false },
    { "name": "unit", "type": "string", "facet": true },
    { "name": "notes", "type": "string", "optional": true }
  ],
  "default_sorting_field": "chapter",
  "token_separators": [".", "-"]
}
```

**Search Synonyms:**
```json
{
  "synonyms": [
    { "root": "t-shirt", "synonyms": ["tee", "tshirt", "t shirt", "singlet", "vest"] },
    { "root": "backpack", "synonyms": ["rucksack", "knapsack", "daypack", "bag"] },
    { "root": "phone", "synonyms": ["smartphone", "cellphone", "mobile", "handset"] },
    { "root": "laptop", "synonyms": ["notebook", "portable computer", "data processing"] },
    { "root": "furniture", "synonyms": ["furnishings", "chairs", "tables", "desks"] },
    { "root": "shoes", "synonyms": ["footwear", "sneakers", "boots", "sandals"] }
  ]
}
```

**Ranking Rules:**
1. Text match score (BM25)
2. Exact HTS code match (boost 10x)
3. Chapter match (boost 2x if user filtered by chapter)
4. Sort by relevance score descending

#### Ports Collection

```json
{
  "name": "ports",
  "fields": [
    { "name": "unlocode", "type": "string" },
    { "name": "name", "type": "string" },
    { "name": "city", "type": "string" },
    { "name": "country", "type": "string", "facet": true },
    { "name": "type", "type": "string", "facet": true },
    { "name": "role", "type": "string", "facet": true },
    { "name": "tier", "type": "int32", "facet": true },
    { "name": "cold_chain_capable", "type": "bool", "facet": true },
    { "name": "ftz_nearby", "type": "bool", "facet": true },
    { "name": "location", "type": "geopoint" }
  ],
  "default_sorting_field": "tier"
}
```

#### Knowledge Base Collection

```json
{
  "name": "knowledge_base",
  "fields": [
    { "name": "title", "type": "string" },
    { "name": "content", "type": "string" },
    { "name": "category", "type": "string", "facet": true },
    { "name": "tags", "type": "string[]", "facet": true }
  ]
}
```

---

## 4. Cron Schedules

| Job Name | Schedule | Timeout | Retry | Dependencies | Description |
|----------|----------|---------|-------|-------------|-------------|
| `hts-tariff-refresh` | `0 6 * * *` (daily 6am UTC) | 300s | 3x exponential | USITC API | Download latest HTS schedule, diff against cache, update `hts_codes` and `duty_rates` tables |
| `carrier-schedule-sync` | `0 8 * * 1` (weekly Mon 8am UTC) | 600s | 3x exponential | Maersk API, CMA CGM API | Sync carrier schedules, update route transit times and frequencies |
| `ftz-status-check` | `0 9 1 * *` (monthly 1st, 9am UTC) | 180s | 2x exponential | OFIS (trade.gov) | Check for FTZ zone status changes, new activations, closures |
| `vessel-position-update` | `*/15 * * * *` (every 15 min) | 60s | 1x | Carrier tracking APIs | Update in-transit shipment positions and ETAs |
| `isf-deadline-alerts` | `0 */6 * * *` (every 6 hours) | 30s | 1x | Internal DB | Check shipments with ISF due within 48h, send notification if ISF not filed |
| `eta-change-notifications` | `0 */4 * * *` (every 4 hours) | 60s | 2x | Carrier APIs | Compare current ETAs with stored values, notify on changes > 12h |
| `tariff-change-alert` | `0 10 * * 1` (weekly Mon 10am) | 120s | 2x | USTR, Federal Register | Scan for new tariff actions, Section 301 updates, executive orders |
| `demurrage-reminder` | `0 7 * * *` (daily 7am UTC) | 30s | 1x | Internal DB | Alert on shipments nearing free-day expiration (< 1 day remaining) |
| `trial-expiry-warning` | `0 14 * * *` (daily 2pm UTC) | 30s | 1x | Internal DB | Send reminder emails at 7d, 3d, 1d before trial expiration |
| `analytics-aggregation` | `0 2 * * *` (daily 2am UTC) | 300s | 2x | Internal DB | Pre-compute dashboard KPIs, cost trends, carrier performance metrics |
| `stale-data-audit` | `0 3 * * 0` (weekly Sun 3am) | 120s | 1x | Internal DB | Flag datasets older than threshold: HTS (90d), ports (180d), routes (30d) |
| `db-backup` | `0 4 * * *` (daily 4am UTC) | 600s | 3x | Neon | Create point-in-time backup, verify integrity, clean backups > 30d |
| `audit-log-cleanup` | `0 5 1 1 *` (yearly Jan 1st, 5am) | 300s | 1x | Internal DB | Archive audit logs > 5 years (CBP retention requirement) |

### Cron Job Error Handling

```typescript
interface CronJobConfig {
  name: string;
  schedule: string;
  handler: () => Promise<void>;
  timeoutMs: number;
  maxRetries: number;
  retryStrategy: "exponential" | "fixed";
  retryDelayMs: number;
  onFailure: "alert" | "alert-and-disable" | "silent";
  alertChannels: ("email" | "slack" | "webhook")[];
  deadLetterQueue?: string;
}
```

**Retry Strategy:**
- Exponential backoff: delay × 2^attempt (base delay 30s → 30s, 60s, 120s)
- Max 3 retries for external APIs, 1 retry for internal jobs
- After max retries: log to `cron_failures` table, send alert

---

## 5. Environment Variables

### 5.1 Application Core

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_APP_URL` | Yes | — | Base URL of the application (e.g. `https://shippingsavior.com`) |
| `NEXT_PUBLIC_VERCEL_ENV` | No | `development` | Vercel deployment environment |
| `NODE_ENV` | Yes | `development` | `development` / `production` / `test` |

### 5.2 Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | Neon PostgreSQL connection string (`postgres://...@...neon.tech/...?sslmode=require`) |
| `DATABASE_POOL_SIZE` | No | `10` | Max connections in pool |
| `DATABASE_SSL` | No | `true` | Enable SSL for database connections |

### 5.3 Authentication

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXTAUTH_SECRET` | Yes | — | Secret for JWT signing (min 32 chars, random) |
| `NEXTAUTH_URL` | Yes | — | Canonical URL for auth callbacks |
| `JWT_MAX_AGE` | No | `86400` | JWT expiry in seconds (24h default, 30d with rememberMe) |
| `BCRYPT_ROUNDS` | No | `12` | bcrypt salt rounds |
| `LOCKOUT_THRESHOLD` | No | `5` | Failed attempts before lockout |
| `LOCKOUT_DURATION_MINUTES` | No | `15` | Account lockout duration |

### 5.4 External Data APIs

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `USITC_API_BASE_URL` | No | `https://hts.usitc.gov/api` | USITC HTS API base URL (free, no key needed) |
| `MAERSK_API_KEY` | No | — | Maersk Developer Portal API key (free tier) |
| `MAERSK_API_BASE_URL` | No | `https://api.maersk.com` | Maersk API base URL |
| `CMA_CGM_API_KEY` | No | — | CMA CGM API Portal key (free tier) |
| `CMA_CGM_API_BASE_URL` | No | `https://api.cma-cgm.com` | CMA CGM API base URL |
| `TERMINAL49_API_KEY` | No | — | Terminal49 container tracking API key (free: 100 containers) |
| `SEAROUTES_API_KEY` | No | — | Searoutes.com API for route polylines (paid, Phase 3+) |

### 5.5 File Storage

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BLOB_READ_WRITE_TOKEN` | Yes | — | Vercel Blob storage token |
| `MAX_UPLOAD_SIZE_MB` | No | `10` | Maximum file upload size in MB |

### 5.6 Email

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RESEND_API_KEY` | Yes | — | Resend API key for transactional emails |
| `EMAIL_FROM` | No | `noreply@shippingsavior.com` | From address for system emails |

### 5.7 Payments (Phase 3+)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STRIPE_SECRET_KEY` | No | — | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | No | — | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | No | — | Stripe webhook signing secret |

### 5.8 Search (Phase 3+)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TYPESENSE_HOST` | No | — | Typesense server host |
| `TYPESENSE_PORT` | No | `8108` | Typesense port |
| `TYPESENSE_API_KEY` | No | — | Typesense admin API key |
| `TYPESENSE_SEARCH_KEY` | No | — | Typesense search-only key (safe for client) |

### 5.9 Maps

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_MAPTILER_KEY` | No | — | MapTiler API key for vector tiles (free tier: 100K loads/mo) |

### 5.10 Monitoring

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENTRY_DSN` | No | — | Sentry error tracking DSN |
| `SENTRY_AUTH_TOKEN` | No | — | Sentry auth token for source maps |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | — | PostHog analytics key |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | `https://us.i.posthog.com` | PostHog API host |

---

## 6. Third-Party Integrations

### 6.1 USITC HTS API

| Property | Value |
|----------|-------|
| **Provider** | US International Trade Commission |
| **Base URL** | `https://hts.usitc.gov/api` |
| **Auth** | None (public API) |
| **Cost** | Free |
| **Rate Limit** | Not published — respect 1 req/sec |
| **Data** | 17,000+ HTS codes, duty rates, special program rates |
| **Format** | JSON |
| **Update Frequency** | Quarterly (Jan, Apr, Jul, Oct) + ad-hoc tariff actions |
| **SDK** | None — direct HTTP fetch |
| **Webhook** | None — poll via cron |

### 6.2 Maersk Developer Portal

| Property | Value |
|----------|-------|
| **Provider** | Maersk |
| **Base URL** | `https://api.maersk.com` |
| **Auth** | API key (header: `Consumer-Key`) |
| **Cost** | Free tier (basic schedules), paid for tracking |
| **Rate Limit** | 100 req/min (free) |
| **Data** | Vessel schedules, port-pair transit times, service routes |
| **SDK** | None — REST API |
| **Endpoints Used** | `GET /schedules/port-pairs`, `GET /schedules/vessel` |

### 6.3 CMA CGM API Portal

| Property | Value |
|----------|-------|
| **Provider** | CMA CGM |
| **Base URL** | `https://api.cma-cgm.com` |
| **Auth** | API key |
| **Cost** | Free tier |
| **Rate Limit** | 60 req/min |
| **Data** | Vessel schedules, sailing routes |
| **SDK** | None — REST API |
| **Endpoints Used** | `GET /schedules`, `GET /routes` |

### 6.4 Terminal49

| Property | Value |
|----------|-------|
| **Provider** | Terminal49 |
| **Base URL** | `https://api.terminal49.com/v2` |
| **Auth** | Bearer token |
| **Cost** | Free: 100 containers. Pro: $0.15/container/month |
| **Rate Limit** | 100 req/min |
| **Data** | Real-time container tracking, milestone events |
| **SDK** | None — REST API |
| **Webhook** | `POST` to configured URL on container status change |
| **Webhook Events** | `container.transport.vessel_arrived`, `container.transport.vessel_departed`, `container.transport.customs_cleared`, `container.transport.delivered` |

### 6.5 Vercel Blob Storage

| Property | Value |
|----------|-------|
| **Provider** | Vercel |
| **SDK** | `@vercel/blob` |
| **Cost** | Included with Vercel Pro ($20/mo) |
| **Max File Size** | 500 MB |
| **Use Cases** | PDF reports, uploaded shipping documents |

### 6.6 Resend (Email)

| Property | Value |
|----------|-------|
| **Provider** | Resend |
| **SDK** | `resend` npm package |
| **Cost** | Free: 100 emails/day. Pro: $20/mo for 50K emails |
| **Use Cases** | Verification emails, password resets, ISF deadline alerts, trial expiry warnings |
| **Templates** | React Email templates in `/lib/email/templates/` |

### 6.7 Stripe (Payments — Phase 3+)

| Property | Value |
|----------|-------|
| **Provider** | Stripe |
| **SDK** | `stripe` npm package |
| **Cost** | 2.9% + $0.30 per transaction |
| **Use Cases** | Subscription billing for Starter/Professional/Enterprise plans |
| **Webhook Events** | `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed` |

### 6.8 Sentry (Error Tracking)

| Property | Value |
|----------|-------|
| **Provider** | Sentry |
| **SDK** | `@sentry/nextjs` |
| **Cost** | Free: 5K errors/mo. Team: $26/mo |
| **Use Cases** | Client + server error tracking, performance monitoring |

### 6.9 MapTiler (Map Tiles)

| Property | Value |
|----------|-------|
| **Provider** | MapTiler |
| **Use** | Vector tile source for MapLibre GL |
| **Cost** | Free: 100K tile loads/mo |
| **Fallback** | Self-hosted Protomaps PMTiles if free tier exceeded |

---

## 7. File Storage

### 7.1 Bucket Structure (Vercel Blob)

```
shipping-savior/
├── documents/
│   ├── {org_id}/
│   │   ├── {shipment_id}/
│   │   │   ├── bol-{uuid}.pdf                  # Bill of Lading
│   │   │   ├── commercial-invoice-{uuid}.pdf
│   │   │   ├── packing-list-{uuid}.pdf
│   │   │   ├── certificate-of-origin-{uuid}.pdf
│   │   │   ├── isf-filing-{uuid}.pdf
│   │   │   ├── customs-entry-{uuid}.pdf
│   │   │   ├── ftz-admission-{uuid}.pdf
│   │   │   ├── inspection-report-{uuid}.pdf
│   │   │   └── other-{uuid}.{ext}
│   │   └── ...
├── reports/
│   ├── {org_id}/
│   │   ├── landed-cost-{date}-{uuid}.pdf
│   │   ├── ftz-comparison-{date}-{uuid}.pdf
│   │   ├── unit-economics-{date}-{uuid}.pdf
│   │   └── route-comparison-{date}-{uuid}.pdf
├── exports/
│   ├── {org_id}/
│   │   ├── shipments-export-{date}.csv
│   │   └── analytics-report-{date}.pdf
└── temp/
    └── {uuid}.pdf                               # Ephemeral (TTL: 24h)
```

### 7.2 Naming Conventions

- **Documents:** `{doc_type}-{uuid}.{ext}`
- **Reports:** `{report_type}-{YYYY-MM-DD}-{uuid}.pdf`
- **Exports:** `{entity}-export-{YYYY-MM-DD}.{ext}`
- **Temp files:** `{uuid}.{ext}` with 24-hour TTL

### 7.3 Access Policies

| Path Pattern | Access | Auth Required |
|-------------|--------|---------------|
| `documents/{org_id}/**` | Org members only | Yes — JWT + org membership check |
| `reports/{org_id}/**` | Org members only | Yes — JWT + org membership check |
| `exports/{org_id}/**` | Org admin/owner | Yes — JWT + admin role |
| `temp/**` | Anyone with URL | No — signed URL with 24h expiry |

### 7.4 Upload Constraints

| Constraint | Value |
|-----------|-------|
| Max file size | 10 MB (configurable via env) |
| Allowed MIME types | `application/pdf`, `image/png`, `image/jpeg`, `text/csv`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| Max files per shipment | 50 |
| Virus scanning | Vercel Blob built-in (Basic tier) |
| Retention | Documents: indefinite. Temp: 24h auto-delete. |

---

## 8. WebSocket Events

### 8.1 Connection

**Protocol:** WebSocket over Vercel (using `socket.io` with Vercel's Edge Functions or a dedicated real-time provider)

**Connection URL:** `wss://api.shippingsavior.com/ws`

**Authentication:** JWT token passed as query parameter or in first message.

```typescript
// Client connection
const socket = io("wss://api.shippingsavior.com", {
  auth: { token: jwtToken },
  transports: ["websocket"],
});
```

### 8.2 Event Types

#### Shipment Events (Channel: `shipment:{shipment_id}`)

```typescript
// Server → Client: Shipment status changed
{
  event: "shipment.status_changed",
  payload: {
    shipmentId: string;
    previousStatus: ShipmentStatus;
    newStatus: ShipmentStatus;
    timestamp: string;                   // ISO 8601
    location?: string;
    description: string;
  }
}

// Server → Client: ETA updated
{
  event: "shipment.eta_updated",
  payload: {
    shipmentId: string;
    previousETA: string;
    newETA: string;
    deltaHours: number;                  // positive = delay, negative = ahead
    reason?: string;
  }
}

// Server → Client: Temperature alert (cold chain)
{
  event: "shipment.temperature_alert",
  payload: {
    shipmentId: string;
    currentTemp: number;                 // Celsius
    threshold: number;                   // configured max/min
    direction: "above" | "below";
    sensorId: string;
    location: string;
    timestamp: string;
  }
}

// Server → Client: Document uploaded
{
  event: "shipment.document_added",
  payload: {
    shipmentId: string;
    document: {
      type: string;
      name: string;
      url: string;
      uploadedBy: string;
    };
  }
}
```

#### Organization Events (Channel: `org:{organization_id}`)

```typescript
// Server → Client: New notification
{
  event: "notification.created",
  payload: {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "success" | "error";
    category: string;
    referenceType?: string;
    referenceId?: string;
    timestamp: string;
  }
}

// Server → Client: Tariff rate change detected
{
  event: "tariff.rate_changed",
  payload: {
    htsCode: string;
    description: string;
    previousRate: number;
    newRate: number;
    effectiveDate: string;
    source: string;                      // "USTR", "Federal Register"
  }
}

// Server → Client: FTZ withdrawal processed
{
  event: "ftz.withdrawal_processed",
  payload: {
    shipmentId: string;
    ftzNumber: number;
    units: number;
    dutyRate: number;
    dutyPaid: number;
    timestamp: string;
  }
}
```

#### Dashboard Events (Channel: `dashboard:{organization_id}`)

```typescript
// Server → Client: KPI update (sent every 5 minutes when dashboard is open)
{
  event: "dashboard.kpi_update",
  payload: {
    activeShipments: number;
    monthlyRevenue: number;
    avgLandedCost: number;
    onTimeRate: number;
    lastUpdated: string;
  }
}

// Server → Client: Activity feed item
{
  event: "dashboard.activity",
  payload: {
    id: string;
    action: string;
    detail: string;
    category: "shipment" | "tariff" | "ftz" | "document";
    timestamp: string;
  }
}
```

### 8.3 Subscription Patterns

```typescript
// Client subscribes to channels after auth
socket.on("connect", () => {
  // Subscribe to org-wide events
  socket.emit("subscribe", { channel: `org:${orgId}` });

  // Subscribe to dashboard updates (only when on dashboard page)
  socket.emit("subscribe", { channel: `dashboard:${orgId}` });

  // Subscribe to specific shipment updates
  activeShipmentIds.forEach((id) => {
    socket.emit("subscribe", { channel: `shipment:${id}` });
  });
});

// Unsubscribe when navigating away
socket.emit("unsubscribe", { channel: `dashboard:${orgId}` });
```

### 8.4 Reconnection Strategy

- Initial reconnect delay: 1 second
- Max reconnect delay: 30 seconds
- Backoff multiplier: 2x
- Max reconnect attempts: unlimited
- On reconnect: re-subscribe to all channels, request missed events since last received timestamp

---

## 9. Error Codes

### 9.1 Standard Error Response Format

```typescript
interface ErrorResponse {
  error: string;                         // machine-readable code
  message: string;                       // human-readable message
  statusCode: number;                    // HTTP status code
  details?: Record<string, any>;         // additional context
  requestId: string;                     // for support/debugging
}
```

### 9.2 Authentication Errors (1xxx)

| Code | HTTP | Error Key | User Message |
|------|------|-----------|-------------|
| 1001 | 401 | `INVALID_CREDENTIALS` | Invalid email or password |
| 1002 | 423 | `ACCOUNT_LOCKED` | Account temporarily locked. Try again in {minutes} minutes. |
| 1003 | 401 | `TOKEN_EXPIRED` | Your session has expired. Please log in again. |
| 1004 | 401 | `TOKEN_INVALID` | Invalid authentication token |
| 1005 | 403 | `EMAIL_NOT_VERIFIED` | Please verify your email address to continue |
| 1006 | 409 | `ACCOUNT_EXISTS` | An account with this email already exists |
| 1007 | 400 | `RESET_TOKEN_EXPIRED` | Password reset link has expired. Request a new one. |
| 1008 | 403 | `INSUFFICIENT_ROLE` | You don't have permission to perform this action |

### 9.3 Validation Errors (2xxx)

| Code | HTTP | Error Key | User Message |
|------|------|-----------|-------------|
| 2001 | 422 | `VALIDATION_ERROR` | {field}: {specific validation message} |
| 2002 | 422 | `INVALID_HTS_CODE` | HTS code format invalid. Expected format: XXXX.XX.XX |
| 2003 | 422 | `INVALID_UNLOCODE` | Port code not found. Use UN/LOCODE format (e.g. USLAX) |
| 2004 | 422 | `INVALID_COUNTRY` | Country code not recognized. Use ISO 3166-1 alpha-2 |
| 2005 | 422 | `NEGATIVE_VALUE` | {field} must be a positive number |
| 2006 | 422 | `UNITS_REQUIRED` | Total units must be at least 1 |
| 2007 | 422 | `CONTAINER_TYPE_INVALID` | Container type must be one of: 20GP, 40GP, 40HC, 20RF, 40RF, LCL |

### 9.4 Calculation Errors (3xxx)

| Code | HTTP | Error Key | User Message |
|------|------|-----------|-------------|
| 3001 | 404 | `HTS_CODE_NOT_FOUND` | HTS code {code} not found in database. Try searching for a similar product. |
| 3002 | 422 | `DUTY_RATE_UNAVAILABLE` | Duty rate not available for {country} + {htsCode} combination |
| 3003 | 422 | `CONTAINER_OVERFLOW` | Unit dimensions exceed container capacity |
| 3004 | 422 | `ROUTE_NOT_FOUND` | No route found between {origin} and {destination} |
| 3005 | 500 | `CALCULATION_ERROR` | Unable to complete calculation. Please try again. |

### 9.5 Shipment Errors (4xxx)

| Code | HTTP | Error Key | User Message |
|------|------|-----------|-------------|
| 4001 | 404 | `SHIPMENT_NOT_FOUND` | Shipment not found |
| 4002 | 409 | `DUPLICATE_REFERENCE` | A shipment with this reference already exists |
| 4003 | 422 | `INVALID_STATUS_TRANSITION` | Cannot change status from {current} to {requested} |
| 4004 | 422 | `ISF_NOT_FILED` | ISF filing required before shipment can depart (24h before departure) |
| 4005 | 409 | `SHIPMENT_FINALIZED` | This shipment has been delivered and cannot be modified |

### 9.6 File/Document Errors (5xxx)

| Code | HTTP | Error Key | User Message |
|------|------|-----------|-------------|
| 5001 | 413 | `FILE_TOO_LARGE` | File exceeds maximum size of {maxMB} MB |
| 5002 | 415 | `UNSUPPORTED_FILE_TYPE` | File type not supported. Allowed: PDF, PNG, JPEG, CSV, XLSX |
| 5003 | 422 | `MAX_DOCUMENTS_EXCEEDED` | Maximum of 50 documents per shipment |
| 5004 | 404 | `DOCUMENT_NOT_FOUND` | Document not found |
| 5005 | 500 | `PDF_GENERATION_FAILED` | Unable to generate PDF report. Please try again. |

### 9.7 Organization Errors (6xxx)

| Code | HTTP | Error Key | User Message |
|------|------|-----------|-------------|
| 6001 | 403 | `TRIAL_EXPIRED` | Your free trial has ended. Upgrade to continue. |
| 6002 | 403 | `PLAN_LIMIT_REACHED` | Your plan allows {limit} {resource}. Upgrade for more. |
| 6003 | 404 | `ORG_NOT_FOUND` | Organization not found |
| 6004 | 409 | `MEMBER_ALREADY_EXISTS` | This user is already a member of your organization |

### 9.8 External API Errors (7xxx)

| Code | HTTP | Error Key | User Message |
|------|------|-----------|-------------|
| 7001 | 503 | `USITC_API_UNAVAILABLE` | Tariff data service temporarily unavailable. Using cached data. |
| 7002 | 503 | `CARRIER_API_UNAVAILABLE` | Carrier schedule data temporarily unavailable |
| 7003 | 503 | `TRACKING_API_UNAVAILABLE` | Container tracking service temporarily unavailable |
| 7004 | 429 | `EXTERNAL_RATE_LIMIT` | External data source rate limit reached. Try again in {seconds}s. |

### 9.9 System Errors (9xxx)

| Code | HTTP | Error Key | User Message |
|------|------|-----------|-------------|
| 9001 | 500 | `INTERNAL_ERROR` | Something went wrong. Please try again. |
| 9002 | 503 | `SERVICE_UNAVAILABLE` | Service temporarily unavailable. Please try again later. |
| 9003 | 429 | `RATE_LIMIT_EXCEEDED` | Too many requests. Please slow down. |
| 9004 | 408 | `REQUEST_TIMEOUT` | Request timed out. Please try again. |

---

## 10. Rate Limits

### 10.1 Global Limits

| Tier | Requests/Minute | Requests/Hour | Burst (10s window) |
|------|----------------|---------------|---------------------|
| Unauthenticated | 20 | 200 | 10 |
| Trial | 60 | 1,000 | 30 |
| Starter | 120 | 5,000 | 60 |
| Professional | 300 | 15,000 | 100 |
| Enterprise | 1,000 | 50,000 | 300 |

### 10.2 Per-Endpoint Limits

| Endpoint Pattern | Auth Required | Limit/Min | Limit/Hour | Notes |
|-----------------|---------------|-----------|------------|-------|
| `POST /api/auth/login` | No | 5 | 20 | Per IP. Anti-brute-force. |
| `POST /api/auth/register` | No | 3 | 10 | Per IP. Anti-bot. |
| `POST /api/auth/reset-password` | No | 3 | 10 | Per IP. Anti-abuse. |
| `POST /api/calculate/*` | Yes | 30 | 500 | Computational cost. |
| `GET /api/hts/search` | Yes | 60 | 2,000 | Search can be heavy on FlexSearch. |
| `POST /api/export/pdf` | Yes | 10 | 100 | PDF generation is CPU-intensive. |
| `GET /api/routes` | Yes | 60 | 2,000 | Cached responses. |
| `GET /api/ports` | Yes | 60 | 2,000 | Cached responses. |
| `POST /api/shipments` | Yes | 20 | 200 | Write operation. |
| `GET /api/shipments` | Yes | 60 | 2,000 | Read operation. |
| `GET /api/analytics/*` | Yes | 30 | 500 | Pre-computed but data-heavy. |
| `POST /api/freight/*` | Yes | 30 | 500 | Computational. |

### 10.3 Per-User Limits (Beyond Endpoint Limits)

| Resource | Trial | Starter | Professional | Enterprise |
|----------|-------|---------|-------------|-----------|
| Saved calculations | 10 | 50 | 500 | Unlimited |
| Active shipments | 5 | 25 | 100 | Unlimited |
| PDF exports/month | 10 | 50 | 500 | Unlimited |
| Document storage | 100 MB | 1 GB | 10 GB | 100 GB |
| Team members | 1 | 3 | 10 | Unlimited |
| API key access | No | No | Yes | Yes |

### 10.4 Rate Limit Response Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1711468800        # Unix timestamp
Retry-After: 30                       # seconds (only on 429)
```

### 10.5 Rate Limit Implementation

```typescript
// Using Upstash Redis for distributed rate limiting
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const rateLimits = {
  // Sliding window algorithm
  global: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    prefix: "rl:global",
  }),

  // Fixed window for auth endpoints
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(5, "1 m"),
    prefix: "rl:auth",
  }),

  // Token bucket for calculation endpoints
  calculate: new Ratelimit({
    redis,
    limiter: Ratelimit.tokenBucket(30, "1 m", 30),
    prefix: "rl:calc",
  }),
};
```

---

## Appendix A: Type Definitions Reference

### Country Codes (ISO 3166-1 alpha-2, supported)

```
CN (China), VN (Vietnam), TH (Thailand), ID (Indonesia), KH (Cambodia),
MY (Malaysia), PH (Philippines), MM (Myanmar), IN (India), BD (Bangladesh),
US (United States), MX (Mexico), CA (Canada), DE (Germany), JP (Japan),
KR (South Korea), TW (Taiwan), AU (Australia), GB (United Kingdom),
FR (France), IT (Italy), BR (Brazil), TR (Turkey), PK (Pakistan),
EG (Egypt), OTHER
```

### Container Types

| Code | Label | Volume (CBM) | Weight (kg) | TEUs | Cold Chain |
|------|-------|-------------|-------------|------|-----------|
| 20GP | 20' General Purpose | 33.2 | 21,770 | 1 | No |
| 40GP | 40' General Purpose | 67.7 | 26,680 | 2 | No |
| 40HC | 40' High Cube | 76.3 | 26,460 | 2 | No |
| 20RF | 20' Reefer | 24.8 | 20,320 | 1 | Yes |
| 40RF | 40' Reefer | 57.8 | 26,460 | 2 | Yes |
| LCL | Less than Container Load | N/A | N/A | 0 | No |

### Shipping Modes

```
ocean-fcl, ocean-lcl, air, air-express, ground, rail
```

### Shipment Statuses

```
booked → at-origin-port → in-transit → transshipment → at-dest-port →
customs-hold → cleared → in-ftz → out-for-delivery → delivered | exception
```

---

## Appendix B: Reference Freight Rates

### Ocean FCL (Asia → US, per container, 2024 market benchmarks)

| Container | West Coast | East Coast | North Europe |
|-----------|-----------|-----------|-------------|
| 20GP | $2,200 | $4,100 | $3,800 |
| 40GP | $4,200 | $7,800 | $7,200 |
| 40HC | $4,400 | $8,200 | $7,600 |
| 20RF | $5,800 | $9,200 | $8,800 |
| 40RF | $9,500 | $14,500 | $13,200 |
| LCL | $45/CBM | $65/CBM | $55/CBM |

### Trade Lane Multipliers (vs. CN-USWC base)

| Lane | Multiplier | Transit Days |
|------|-----------|-------------|
| CN → USWC | 1.00x | 14-21 |
| CN → USEC | 1.85x | 28-35 |
| VN → USWC | 1.10x | 16-23 |
| VN → USEC | 1.95x | 28-38 |
| TH → USWC | 1.15x | 18-25 |
| ID → USWC | 1.20x | 18-26 |
| KH → USWC | 1.25x | 20-30 |

### Air Freight Rates (per kg, Asia → US)

| Lane | Standard | Express | Economy |
|------|----------|---------|---------|
| CN → US | $5.50 | $9.00 | $3.80 |
| VN → US | $6.20 | $10.50 | $4.50 |
| TH → US | $6.00 | $10.00 | $4.30 |
| ID → US | $6.50 | $11.00 | $4.80 |
| KH → US | $7.00 | $12.00 | $5.20 |

---

## Appendix C: Section 301 Tariff Rates (China)

| HTS Chapter | Category | Additional Rate |
|-------------|----------|----------------|
| 73 | Articles of iron/steel | 25% (List 1) |
| 84 | Machinery | 25% (List 3) |
| 85 | Electronics | 25% (List 3) |
| 87 | Vehicles | 25% (List 1) |
| 90 | Optical/medical instruments | 25% (List 1) |
| 94 | Furniture | 25% (List 3) |
| 39 | Plastics | 7.5% (List 4A) |
| 42 | Leather/handbags | 7.5% (List 4A) |
| 61 | Knit apparel | 7.5% (List 4A) |
| 62 | Woven apparel | 7.5% (List 4A) |
| 64 | Footwear | 7.5% (List 4A) |
| 95 | Toys/games | 7.5% (List 4A) |
| 44 | Wood | 0% |
| 48 | Paper | 0% |
