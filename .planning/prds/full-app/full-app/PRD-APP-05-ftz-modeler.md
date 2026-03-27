# PRD: FTZ Savings Modeler

## Overview
- **Purpose:** Model the financial savings of using a Foreign Trade Zone (FTZ) versus direct customs entry. Compares locked duty rates vs. current rates, models incremental withdrawal schedules, and calculates break-even points. This is the platform's key differentiator — few tools provide this level of FTZ analysis.
- **User persona:** Importers evaluating whether FTZ usage is worth the overhead, logistics managers planning FTZ operations, financial analysts modeling cash flow scenarios for import programs.
- **Entry points:** Main navigation "FTZ Modeler" link, "Compare FTZ savings" action from Landed Cost Calculator, dashboard quick action, direct URL `/tools/ftz-modeler`.

## Page Layout

### Desktop (1280px+)
- **Top bar:** FTZ zone selector (map + dropdown combo) spanning full width. Selected zone details card showing zone number, grantee, location, operator contact.
- **Left column (55%):** Configuration panel with sections: Product & Duty Setup, FTZ Entry Parameters, Withdrawal Schedule, Scenario Comparison.
- **Right column (45%, sticky):** Results dashboard with: cumulative savings chart (line graph), cash flow comparison panel (FTZ vs direct side-by-side), break-even analysis card, compliance warnings section.
- **Below fold:** FTZ educational sidebar with PF vs NPF explainer, regulation references, disclaimer.

### Tablet (768px-1279px)
- Zone selector full-width. Single column layout. Results panel below form with sticky summary bar at bottom.

### Mobile (< 768px)
- Zone selector as searchable dropdown (no map). Form sections as accordions. Results on separate tab. Charts simplified to key numbers.

## Features & Functionality

### Feature: FTZ Zone Selector
- **Description:** Interactive selection of one of 260+ US Foreign Trade Zones with map visualization and searchable dropdown.
- **User interaction flow:**
  1. Map shows all FTZ zones as markers across the US (deck.gl ScatterplotLayer)
  2. User can click a marker to select a zone OR use the searchable dropdown
  3. Dropdown supports search by: zone number, city, state, grantee name, port of entry
  4. On selection: zone details card populates with zone number, grantee organization, physical location, nearest port, operator contact info, activation date, annual throughput (if available from FTZ Annual Reports)
- **Edge cases:**
  - Zone with no subzone data: show zone-level info only
  - Zone not yet activated: show "Pending Activation" badge
  - Multiple sites within a zone: show site list in expandable section
- **Validation rules:** Zone selection is optional (user can model without a specific zone for general analysis).

### Feature: PF vs NPF Status Election Explainer
- **Description:** Interactive education on Privileged Foreign (PF) vs Non-Privileged Foreign (NPF) status, which determines how duty rates are locked.
- **Details:**
  - PF status: duty rate locked at the rate applicable to the foreign component when goods enter the FTZ. Irrevocable once elected.
  - NPF status (default): goods can be entered as either the foreign article or the finished product at time of withdrawal — whichever has the lower duty rate (inverted tariff benefit).
  - Toggle between PF and NPF in the modeler to compare outcomes
  - Warning banner: "PF election is permanent and irrevocable. Consult a licensed customs broker before electing PF status."
- **User interaction flow:**
  1. Radio toggle: PF Status / NPF Status
  2. On PF: duty rate locks to the rate at entry date. Modeler uses entry date rate for all withdrawals.
  3. On NPF: modeler uses the lower of foreign article rate or finished product rate at withdrawal date.
  4. Info cards explain each option in plain language.

### Feature: Locked Rate vs Current Rate Comparison
- **Description:** Side-by-side comparison showing duty paid under FTZ (locked rate) vs. direct entry (current rate) for the same goods.
- **User interaction flow:**
  1. User enters HTS code (auto-fills duty rate from HTS lookup)
  2. User enters FTZ entry date (determines locked rate from historical HTS data)
  3. System looks up the duty rate on the entry date (locked rate)
  4. System shows current duty rate
  5. Difference displayed as: dollar amount per unit, percentage difference, total savings per container
  6. If current rate > locked rate: green "SAVINGS" indicator
  7. If current rate < locked rate: red "LOCKED RATE IS HIGHER" warning
- **Edge cases:**
  - No rate change between entry and now: show "No savings — rates unchanged"
  - Section 301 tariff applied after FTZ entry: show significant savings scenario
  - HTS code reclassified between entry and now: warn "HTS code may have been reclassified. Verify with customs broker."

### Feature: Incremental Withdrawal Scheduler
- **Description:** Model when and how many units to withdraw from the FTZ, paying duties only on withdrawn goods. Drag timeline or set frequency.
- **User interaction flow:**
  1. Total units in FTZ entry (from product setup)
  2. Withdrawal options:
     a. **Fixed schedule:** Every N days, withdraw X units (e.g., 1000 units every 7 days)
     b. **Custom schedule:** Add individual withdrawal events on a timeline (date + quantity)
     c. **Demand-driven:** Enter monthly demand forecast, system generates optimal withdrawal schedule
  3. Timeline visualization: horizontal gantt-style bar showing FTZ inventory level over time
  4. Drag handles on timeline to adjust withdrawal dates/quantities
  5. Duties calculated per withdrawal at the applicable rate
- **Edge cases:**
  - Total withdrawals exceed entry quantity: error "Cannot withdraw more than entered quantity"
  - Withdrawal date before entry date: error
  - Zero withdrawal scheduled: show carrying cost warning
  - Overlapping withdrawal on same day: merge automatically

### Feature: Cumulative Savings Chart
- **Description:** Line chart showing cumulative savings (FTZ vs direct entry) over the withdrawal period.
- **Details:**
  - X-axis: time (weeks or months depending on schedule length)
  - Y-axis: cumulative savings in USD
  - Two lines: "FTZ total duties paid" and "Direct entry total duties paid"
  - Shaded area between lines represents savings
  - Break-even point marked with vertical dashed line and label
  - Hover shows exact values at any point in time
- **Edge cases:** If no savings (FTZ costs more due to overhead): chart shows negative savings with explanation.

### Feature: Break-Even Analysis
- **Description:** Calculate when FTZ overhead costs (activation, annual fees, inventory carrying cost) are offset by duty savings.
- **Inputs (pre-filled with defaults, editable):**
  - FTZ activation/setup cost ($5,000 default)
  - Annual FTZ operator fee ($12,000 default)
  - Weekly FTZ handling fee ($/unit, $0.02 default)
  - Inventory carrying cost (%/year, 12% default)
  - Customs bond differential (if applicable)
- **Output:** Break-even point in months/units, displayed as card with prominent number.
- **Edge cases:** Break-even never reached within 5 years: show "FTZ may not be cost-effective for this product at these volumes."

### Feature: Cash Flow Comparison
- **Description:** Side-by-side monthly cash flow showing duty payment timing: FTZ (pay duties incrementally on withdrawal) vs. direct entry (pay all duties at customs entry).
- **Details:**
  - Direct entry: large upfront duty payment at import
  - FTZ: smaller payments spread across withdrawal schedule
  - Chart: grouped bar chart showing monthly outflows for each scenario
  - Cash flow advantage: dollar value of deferred payments
  - Time value of money calculation (using user-entered discount rate, default 8%)

### Feature: Compliance Warnings
- **Description:** Automated alerts about FTZ regulatory requirements relevant to the modeled scenario.
- **Warnings displayed (as applicable):**
  - "FTZ entries require a Customs Bond"
  - "PF status election is permanent — cannot be reversed"
  - "Goods must be admitted to FTZ under CBP supervision"
  - "Weekly entry filings required for FTZ withdrawals"
  - "Cold chain products in FTZ may require FDA registration"
  - "Zone operator must maintain inventory management system"
- **Disclaimer at bottom:** "This tool provides estimates for planning purposes only. Consult a licensed customs broker for FTZ compliance requirements. Not legal or customs advice."

## Usability Requirements
- **Accessibility (WCAG 2.1 AA):** Map has keyboard alternative (dropdown selector). Charts have tabular data alternatives. Drag timeline has keyboard input alternative (date + quantity input fields). All warnings use `role="alert"`.
- **Keyboard navigation:** Tab from zone selector to configuration form to results. Enter on zone dropdown opens search. Arrow keys on timeline (if keyboard mode) adjust quantities.
- **Loading states:** Zone data loading: skeleton map + spinner. Rate lookup: inline spinner next to rate field. Chart rendering: skeleton chart.
- **Error states:** Historical rate not found: "Rate data unavailable for [date]. Using current rate." Zone data unavailable: "FTZ zone database temporarily unavailable."
- **Empty states:** Before configuration: "Select a product and FTZ zone to model savings" with illustrative diagram of FTZ concept.
- **Performance targets:** LCP < 2.5s. Chart updates < 200ms on schedule change. Zone map renders < 1s with 260+ markers.

## API Endpoints

### GET /api/ftz/zones
- **Description:** List all FTZ zones with basic info for map and dropdown.
- **Authentication required:** Yes
- **Request parameters:**
  - `search` (string, optional): search by zone number, city, state, grantee
  - `state` (string, optional): filter by state code
  - `nearPort` (string, optional): filter by nearest port code
- **Response (200):**
  ```json
  {
    "totalZones": 263,
    "zones": [
      {
        "zoneNumber": 202,
        "name": "Los Angeles FTZ",
        "grantee": "Port of Los Angeles",
        "city": "Los Angeles",
        "state": "CA",
        "latitude": 33.7405,
        "longitude": -118.2723,
        "nearestPort": "USLAX",
        "activationDate": "1980-05-15",
        "status": "active",
        "subzoneCount": 12
      }
    ]
  }
  ```
- **Rate limiting:** 30 requests per minute.

### GET /api/ftz/zones/:id
- **Description:** Get detailed information for a specific FTZ zone.
- **Authentication required:** Yes
- **Response (200):**
  ```json
  {
    "zoneNumber": 202,
    "name": "Los Angeles FTZ",
    "grantee": "Port of Los Angeles",
    "granteeContact": { "name": "...", "phone": "...", "email": "..." },
    "operator": "...",
    "city": "Los Angeles",
    "state": "CA",
    "address": "...",
    "latitude": 33.7405,
    "longitude": -118.2723,
    "nearestPort": "USLAX",
    "activationDate": "1980-05-15",
    "status": "active",
    "sites": [
      {
        "siteNumber": 1,
        "type": "general_purpose",
        "address": "...",
        "acreage": 450
      }
    ],
    "subzones": [
      {
        "subzoneNumber": "202A",
        "company": "...",
        "product": "...",
        "approvalDate": "..."
      }
    ],
    "annualReport": {
      "year": 2025,
      "totalValue": 2500000000,
      "employeesInZone": 1200
    }
  }
  ```
- **Error responses:**
  - 404: `{ "error": "not_found", "message": "FTZ zone not found" }`

### POST /api/calculate/ftz-savings
- **Description:** Calculate FTZ savings based on configuration.
- **Authentication required:** Yes
- **Request body:**
  ```json
  {
    "product": {
      "htsCode": "6402994060",
      "countryOfOrigin": "VN",
      "unitCostOrigin": 0.10,
      "totalUnits": 50000
    },
    "ftzConfig": {
      "zoneNumber": 202,
      "entryDate": "2026-01-15",
      "statusElection": "npf",
      "setupCost": 5000,
      "annualOperatorFee": 12000,
      "weeklyHandlingFeePerUnit": 0.02,
      "carryingCostRate": 0.12
    },
    "withdrawalSchedule": {
      "type": "fixed",
      "frequency": "weekly",
      "unitsPerWithdrawal": 5000
    },
    "directEntryComparison": {
      "entryDate": "2026-01-15",
      "currentDutyRate": 0.20
    },
    "discountRate": 0.08
  }
  ```
- **Response (200):**
  ```json
  {
    "summary": {
      "totalDutySavings": 12500,
      "cashFlowBenefit": 3200,
      "breakEvenMonths": 4.2,
      "breakEvenUnits": 21000,
      "ftzOverheadTotal": 8500,
      "netSavings": 4000,
      "recommendation": "FTZ entry is cost-effective for this scenario"
    },
    "timeline": [
      {
        "week": 1,
        "date": "2026-01-22",
        "unitsWithdrawn": 5000,
        "dutyPaidFtz": 100,
        "dutyPaidDirect": 200,
        "cumulativeSavings": 100,
        "inventoryRemaining": 45000
      }
    ],
    "cashFlow": {
      "ftz": {
        "months": [
          { "month": "2026-01", "dutiesOutflow": 400, "ftzFees": 1200, "total": 1600 }
        ]
      },
      "directEntry": {
        "months": [
          { "month": "2026-01", "dutiesOutflow": 10000, "total": 10000 }
        ]
      }
    },
    "rates": {
      "lockedRate": 0.15,
      "lockedRateDate": "2026-01-15",
      "currentRate": 0.20,
      "rateDifference": 0.05,
      "rateDifferencePercent": 25
    },
    "warnings": [
      "PF status election is permanent and irrevocable"
    ],
    "metadata": {
      "calculatedAt": "2026-03-26T12:00:00Z",
      "htsDataDate": "2026-03-15"
    }
  }
  ```
- **Error responses:**
  - 400: `{ "error": "validation_error", "details": {...} }`
- **Rate limiting:** 30 requests per minute.

## Data Requirements
- **Database tables read/written:**
  - `ftz_zones` (read) — zoneNumber, name, grantee, granteeContact, location, sites, subzones, status
  - `hts_codes` (read) — for current duty rates
  - `hts_codes_historical` (read) — for locked rate lookup by date (rate snapshots)
  - `ftz_entries` (write) — modeled FTZ entries (optional, for tracking)
  - `ftz_withdrawals` (write) — modeled withdrawals
  - `saved_calculations` (write) — save FTZ model configurations
- **External data sources:**
  - OFIS database (data.gov download) for FTZ zone info
  - FTZ Annual Reports for utilization statistics
  - USITC HTS historical snapshots for locked rate lookup
  - Federal Register for FTZ Board orders
- **Caching strategy:** FTZ zone list cached at CDN (changes rarely). Zone details cached with 7-day TTL. Historical HTS rates cached indefinitely (immutable). Calculation results not cached.

## Component Breakdown
- **Server Components:** `FtzModelerPage` (layout, fetch zone list for initial render).
- **Client Components:** `FtzModeler` (main orchestrator), `FtzZoneSelector` (map + dropdown), `FtzZoneCard` (zone details), `PfNpfToggle` (status election), `RateComparisonPanel`, `WithdrawalScheduler` (timeline + inputs), `WithdrawalTimeline` (visual gantt-style), `CumulativeSavingsChart` (Recharts line), `CashFlowComparison` (grouped bar), `BreakEvenCard`, `ComplianceWarnings`, `FtzEducationPanel`.
- **Shared components used:** `Card`, `Select`, `Input`, `RadioGroup`, `Button`, `Tooltip`, `Badge`, `Accordion`, `Chart` (Recharts), `Map` (deck.gl).
- **New components needed:** All FTZ-specific components listed above.

## Acceptance Criteria
- [ ] Zone selector shows 260+ FTZ zones on map and in searchable dropdown
- [ ] Zone selection populates detail card with grantee, location, sites, and subzones
- [ ] PF/NPF toggle changes calculation logic (locked rate vs. lower-of comparison)
- [ ] Rate comparison shows accurate locked rate for the selected entry date
- [ ] Withdrawal scheduler supports fixed, custom, and demand-driven modes
- [ ] Timeline visualization updates in real-time as schedule changes
- [ ] Cumulative savings chart shows FTZ vs direct entry duty payments over time
- [ ] Break-even analysis accounts for all FTZ overhead costs
- [ ] Cash flow comparison shows monthly outflow differences
- [ ] Compliance warnings appear contextually (PF warning when PF selected, etc.)
- [ ] Disclaimer appears on every view
- [ ] Historical HTS rate lookup works for dates within the last 5 years
- [ ] All charts have tabular data alternatives for screen readers
- [ ] Save and share functionality works for FTZ models
- [ ] Mobile view uses tab toggle and simplified charts

## Dependencies
- **This page depends on:** HTS Lookup (PRD-APP-03) for current and historical duty rates. Authentication (PRD-APP-01). FTZ zone data pipeline (OFIS download + processing). Historical HTS rate snapshots.
- **Pages that depend on this:** Analytics (PRD-APP-11) aggregates FTZ savings data. Shipment Detail (PRD-APP-10) links to FTZ entries. Compliance Center (PRD-APP-13) monitors FTZ-related compliance.
