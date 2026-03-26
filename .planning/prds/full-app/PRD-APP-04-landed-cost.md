# PRD: Landed Cost Calculator

## Overview
- **Purpose:** Calculate the true total cost of importing goods from origin to final destination, including all 15+ hidden costs that importers frequently miss. This is the core calculator of the platform and the primary value proposition for users.
- **User persona:** Importers evaluating sourcing decisions, freight brokers quoting to clients, business owners modeling unit economics for new product lines (especially SE Asia consumer goods).
- **Entry points:** Main navigation "Landed Cost" link, "Use this rate" from HTS Lookup, "Calculate" action from Shipment Detail, dashboard quick action "Run Calculator", direct URL `/tools/landed-cost`, shared URL with pre-filled parameters.

## Page Layout

### Desktop (1280px+)
- **Left column (60%):** Multi-section accordion form. Sections: Product Details, Shipping & Freight, Duties & Tariffs, Additional Fees, Fulfillment & Last Mile. Each section collapsible with section total displayed in header.
- **Right column (40%, sticky):** Live results panel. Top: total landed cost per unit (large, bold). Below: donut chart showing cost breakdown by category. Below chart: value chain visualization (horizontal bar showing origin -> landed -> wholesale -> retail with margin percentages). Bottom: action buttons (Save, Export PDF, Share Link).
- **Below form:** Saved calculations table (last 10).

### Tablet (768px-1279px)
- Single column. Form sections stacked. Results panel floats as a sticky bottom bar showing total landed cost; tap to expand full results.

### Mobile (< 768px)
- Single column. Form sections as full-width accordions. Results on a separate tab ("Form" / "Results" tab toggle at top). Donut chart simplified to horizontal stacked bar.

## Features & Functionality

### Feature: Multi-Section Cost Input Form
- **Description:** Structured form covering all cost components of an international import, organized by category. Real-time calculation updates as inputs change.
- **Sections and fields:**

  **Product Details:**
  - Product name/description (text, optional — for saved calculations)
  - HTS code (input with search — links to HTS Lookup. Auto-fills duty rate)
  - Country of origin (dropdown — SE Asia countries prominently listed)
  - Unit cost at origin (currency input, supports USD/VND/THB/IDR with conversion)
  - Units per order (number)
  - Unit weight (kg) and dimensions (L x W x H cm) — optional, for container calc link

  **Shipping & Freight:**
  - Incoterm selector (FOB, CIF, DDP, EXW, FCA) — changes which fields are editable
  - Ocean freight cost per container (currency)
  - Container type (20ft, 40ft, 40ft HC, Reefer) — auto-fills units per container if dimensions provided
  - Units per container (number, auto-calculated or manual override)
  - Inland freight at origin (currency, disabled if Incoterm is CIF/DDP)
  - Insurance rate (% of value, default 0.5%, disabled if Incoterm is CIF/DDP)
  - Drayage at destination (currency, default $800)
  - Chassis fee (currency, default $75/day, number of days input)

  **Duties & Tariffs:**
  - General duty rate (%, auto-filled from HTS lookup)
  - Section 301 additional duty (%, auto-filled based on country)
  - AD/CVD duty (%, manual or auto-filled)
  - Merchandise Processing Fee (MPF): 0.3464% of entered value, min $31.67, max $614.35
  - Harbor Maintenance Fee (HMF): 0.125% of cargo value
  - Customs bond (annual: $50K minimum, single entry: $500 or 10% of duties)

  **Additional Fees:**
  - Customs broker fee (currency, default $175)
  - ISF filing fee (currency, default $35)
  - Exam probability (%, default 5%) and exam cost (currency, default $1,000)
  - Demurrage risk (days x $/day, default 0 days at $250/day)
  - Detention risk (days x $/day, default 0 days at $200/day)
  - Fumigation/treatment (currency, default $0)
  - FDA/USDA inspection fee (currency, if applicable)

  **Fulfillment & Last Mile:**
  - Warehouse receiving fee ($/unit or $/pallet)
  - Storage cost ($/unit/month, number of months)
  - Pick & pack fee ($/order)
  - Last mile shipping ($/unit, average)
  - Returns processing (% return rate, $/return)

- **User interaction flow:**
  1. User fills in Product Details (minimum: HTS code, country, unit cost, units)
  2. Duty rates auto-populate from HTS database
  3. User selects Incoterm — form fields enable/disable accordingly
  4. As each field changes, total recalculates in < 50ms (client-side with decimal.js)
  5. Results panel updates in real-time: per-unit cost, total cost, breakdown chart
  6. User can expand/collapse sections to focus on relevant costs
- **Edge cases:**
  - Zero units: disable calculation, show "Enter quantity to calculate"
  - Negative values: prevent input, minimum 0 for all currency/percentage fields
  - Currency conversion: if origin cost entered in non-USD, convert using stored exchange rate and show both values
  - Incoterm DDP: most shipping/duty fields disabled (seller bears costs), show note "Under DDP, your supplier covers these costs"
  - Missing HTS code: allow manual duty rate entry with warning "For accurate rates, look up your HTS code"
- **Validation rules:**
  - Unit cost: required, >= 0, max 2 decimal places
  - Units: required, integer >= 1
  - Duty rate: 0-100%
  - All currency fields: >= 0, max 2 decimal places
  - All percentage fields: 0-100%, max 4 decimal places

### Feature: Real-Time Cost Breakdown Chart
- **Description:** Interactive donut chart showing cost distribution by category, updating live as inputs change.
- **Categories:** Product Cost, Ocean Freight, Duties & Tariffs, Fees & Compliance, Inland/Drayage, Fulfillment, Insurance.
- **Interaction:** Hover segment to see exact amount and percentage. Click segment to highlight the corresponding form section.
- **Edge cases:** If a category is $0, it's excluded from the chart. If only one category has value, show full circle with label.

### Feature: Value Chain Visualization
- **Description:** Horizontal bar showing the price progression: Origin Cost -> Landed Cost -> Wholesale Price -> Retail Price, with margin percentages at each step.
- **User interaction flow:**
  1. Origin cost and landed cost auto-calculated from form
  2. User optionally enters wholesale price target and retail price target
  3. Visualization shows: margin from landed to wholesale, margin from wholesale to retail
  4. Color coding: green margins (>30%), yellow (15-30%), red (<15%)
- **Edge cases:** If wholesale price < landed cost, show negative margin in red with warning.

### Feature: Incoterm Selector
- **Description:** Dropdown that changes which cost fields are editable based on the selected International Commercial Term.
- **Behavior by Incoterm:**
  - **EXW (Ex Works):** All fields editable — buyer bears all costs from seller's premises
  - **FOB (Free on Board):** Inland freight at origin disabled (seller's responsibility). Default selection.
  - **CIF (Cost, Insurance, Freight):** Ocean freight + insurance disabled (seller's responsibility)
  - **DDP (Delivered Duty Paid):** Most fields disabled — seller bears all costs to destination
  - **FCA (Free Carrier):** Similar to FOB but for multi-modal
- **Each option has an info tooltip explaining the term.**

### Feature: Save/Load Calculations
- **Description:** Persist calculations to user account for future reference and comparison.
- **User interaction flow:**
  1. Click "Save" in results panel
  2. Modal: enter calculation name (default: "HTS [code] - [country] - [date]")
  3. Saved to server via POST /api/calculations
  4. Appears in "Saved Calculations" table below form
  5. Click saved calculation to reload all inputs
  6. "Duplicate" action to create a copy for scenario comparison
- **Edge cases:** Maximum 100 saved calculations per org on Starter plan, 500 on Professional, unlimited on Enterprise.

### Feature: URL Sharing via nuqs
- **Description:** All calculator inputs serialized to URL query parameters for instant sharing.
- **User interaction flow:**
  1. Click "Share Link" button
  2. URL copied to clipboard (e.g., `/tools/landed-cost?hts=6402994060&country=VN&unitCost=0.10&units=50000&...`)
  3. Recipient opens URL — all inputs pre-filled, calculation auto-runs
- **Edge cases:** Very long URLs (>2000 chars): use POST /api/calculations/share to create short link.

### Feature: PDF Export
- **Description:** Generate a professional PDF report of the landed cost calculation.
- **Contents:** Company logo, calculation title, date, all input parameters, cost breakdown table, donut chart (pre-rendered as image), value chain, disclaimer, data sources with dates.
- **Edge cases:** PDF generation timeout (>10s): show progress bar, retry once, then offer CSV fallback.

## Usability Requirements
- **Accessibility (WCAG 2.1 AA):** All form inputs labeled. Currency inputs have `inputmode="decimal"`. Accordion sections use `aria-expanded`. Chart has tabular data alternative accessible via screen reader. Color is not the only indicator in value chain (labels + patterns).
- **Keyboard navigation:** Tab through form fields in section order. Enter expands/collapses accordion sections. Tab from form to results panel. Escape closes save/share modals.
- **Loading states:** Initial page: skeleton form + results panel. PDF generation: progress bar in button. Save: button spinner.
- **Error states:** Calculation error: "Unable to calculate. Check all required fields." API error on save: "Unable to save. Try again." PDF error: "PDF generation failed. Download CSV instead."
- **Empty states:** Fresh calculator: all fields at default values, results panel shows "$0.00" with "Enter product details to calculate landed cost" message.
- **Performance targets:** LCP < 2.0s. Calculation update < 50ms (client-side). PDF generation < 8s. Page interactive (FID) < 100ms.

## API Endpoints

### POST /api/calculate/landed-cost
- **Description:** Server-side landed cost calculation (for PDF generation and batch processing). Client-side calculation handles the interactive form.
- **Authentication required:** Yes
- **Request body:**
  ```json
  {
    "product": {
      "htsCode": "6402994060",
      "countryOfOrigin": "VN",
      "unitCostOrigin": 0.10,
      "unitCostCurrency": "USD",
      "units": 50000,
      "unitWeightKg": 0.3,
      "dimensions": { "lengthCm": 30, "widthCm": 20, "heightCm": 15 }
    },
    "shipping": {
      "incoterm": "FOB",
      "oceanFreightPerContainer": 3500,
      "containerType": "40ft_hc",
      "unitsPerContainer": 50000,
      "inlandFreightOrigin": 0,
      "insuranceRate": 0.005,
      "drayageDestination": 800,
      "chassisFeePerDay": 75,
      "chassisDays": 3
    },
    "duties": {
      "generalDutyRate": 0.20,
      "section301Rate": 0,
      "adcvdRate": 0,
      "bondType": "annual"
    },
    "fees": {
      "customsBrokerFee": 175,
      "isfFilingFee": 35,
      "examProbability": 0.05,
      "examCost": 1000,
      "demurrageDays": 0,
      "demurrageRatePerDay": 250,
      "detentionDays": 0,
      "detentionRatePerDay": 200,
      "fumigationCost": 0,
      "fdaInspectionFee": 0
    },
    "fulfillment": {
      "warehouseReceivingPerUnit": 0.02,
      "storagePerUnitPerMonth": 0.01,
      "storageMonths": 2,
      "pickPackPerOrder": 3.50,
      "lastMilePerUnit": 0.50,
      "returnRate": 0.05,
      "returnCostPerUnit": 1.00
    },
    "pricing": {
      "wholesalePrice": 2.00,
      "retailPrice": 5.00
    }
  }
  ```
- **Response (200):**
  ```json
  {
    "perUnit": {
      "productCost": 0.10,
      "oceanFreight": 0.07,
      "inlandOrigin": 0.00,
      "insurance": 0.0005,
      "drayage": 0.016,
      "chassisFee": 0.0045,
      "generalDuty": 0.02,
      "section301Duty": 0.00,
      "adcvdDuty": 0.00,
      "mpf": 0.0035,
      "hmf": 0.000125,
      "customsBond": 0.001,
      "customsBroker": 0.0035,
      "isfFiling": 0.0007,
      "examRisk": 0.001,
      "demurrageRisk": 0.00,
      "detentionRisk": 0.00,
      "warehouseReceiving": 0.02,
      "storage": 0.02,
      "pickPack": 0.07,
      "lastMile": 0.50,
      "returnsCost": 0.05,
      "totalLandedCost": 0.5607
    },
    "containerTotal": {
      "totalCost": 28035.00,
      "costPerUnit": 0.5607
    },
    "breakdown": {
      "productCost": { "amount": 5000, "percentage": 17.8 },
      "shipping": { "amount": 4325, "percentage": 15.4 },
      "dutiesAndTariffs": { "amount": 1230, "percentage": 4.4 },
      "feesAndCompliance": { "amount": 280, "percentage": 1.0 },
      "fulfillment": { "amount": 17200, "percentage": 61.4 }
    },
    "margins": {
      "landedToWholesale": { "margin": 1.4393, "percentage": 71.97 },
      "wholesaleToRetail": { "margin": 3.00, "percentage": 60.00 },
      "originToRetail": { "margin": 4.4393, "percentage": 88.79 }
    },
    "warnings": [
      "Exam probability adds an average of $0.001/unit in risk cost"
    ],
    "metadata": {
      "calculatedAt": "2026-03-26T12:00:00Z",
      "htsDataDate": "2026-03-15",
      "exchangeRate": null
    }
  }
  ```
- **Error responses:**
  - 400: `{ "error": "validation_error", "details": { "units": "Must be at least 1" } }`
  - 401: Unauthorized
- **Rate limiting:** 60 requests per minute.

### GET /api/calculations/:id
- **Description:** Retrieve a saved calculation by ID.
- **Authentication required:** Yes
- **Response (200):** Full input + output JSON of the saved calculation.
- **Error responses:**
  - 404: `{ "error": "not_found" }`
  - 403: `{ "error": "forbidden", "message": "This calculation belongs to another organization" }`

### POST /api/calculations
- **Description:** Save a calculation to the user's account.
- **Authentication required:** Yes
- **Request body:**
  ```json
  {
    "name": "SE Asia Footwear Import - March 2026",
    "type": "landed_cost",
    "inputs": { "...full input object..." },
    "results": { "...full results object..." }
  }
  ```
- **Response (201):**
  ```json
  {
    "id": "uuid",
    "name": "SE Asia Footwear Import - March 2026",
    "createdAt": "2026-03-26T12:00:00Z",
    "shareUrl": "/tools/landed-cost?calc=uuid"
  }
  ```

### POST /api/export/pdf
- **Description:** Generate a PDF report from a landed cost calculation.
- **Authentication required:** Yes
- **Request body:**
  ```json
  {
    "calculationId": "uuid",
    "includeChart": true,
    "includeValueChain": true,
    "companyLogo": true
  }
  ```
- **Response (200):** Binary PDF stream with `Content-Type: application/pdf`.
- **Error responses:**
  - 408: `{ "error": "timeout", "message": "PDF generation timed out. Try without charts." }`

## Data Requirements
- **Database tables read/written:**
  - `hts_codes` (read) — for auto-fill duty rates
  - `country_rates` (read) — for country-specific rates
  - `saved_calculations` (read/write) — id, orgId, userId, name, type, inputs (JSONB), results (JSONB), createdAt, updatedAt
  - `calculation_history` (write) — anonymous calculation log for analytics (no PII, just parameters and results)
- **External data sources:** HTS duty rates (from data pipeline), exchange rates (if non-USD input — from ECB or similar free API, cached daily).
- **Caching strategy:** Calculation results not cached (real-time). HTS rate lookups cached per session. Exchange rates cached 24 hours. Saved calculations list cached per user with invalidation on save/delete.

## Component Breakdown
- **Server Components:** `LandedCostPage` (layout, fetch saved calculations list).
- **Client Components:** `LandedCostCalculator` (main orchestrator), `ProductDetailsSection`, `ShippingSection`, `DutiesSection`, `FeesSection`, `FulfillmentSection`, `CostBreakdownChart` (Recharts donut), `ValueChainBar`, `IncotermSelector`, `HtsCodeInput` (with search), `CurrencyInput` (with conversion), `PercentageInput`, `ResultsPanel`, `SaveCalculationModal`, `ShareLinkButton`, `PdfExportButton`, `SavedCalculationsTable`.
- **Shared components used:** `Input`, `Select`, `Button`, `Card`, `Accordion`, `Modal`, `Toast`, `Tooltip`, `Skeleton`, `Badge`.
- **New components needed:** All calculator-specific components listed above. `CurrencyInput` with locale formatting. `PercentageInput` with slider option.

## Acceptance Criteria
- [ ] All 15+ cost components are included in the calculation
- [ ] Calculation uses decimal.js for all arithmetic (no floating-point errors)
- [ ] Results update in < 50ms as inputs change (client-side calculation)
- [ ] Incoterm selection correctly enables/disables relevant fields
- [ ] HTS code input searches and auto-fills duty rate from HTS database
- [ ] Country of origin selection shows applicable Section 301/AD/CVD rates
- [ ] MPF calculated correctly with min ($31.67) and max ($614.35) caps
- [ ] HMF calculated correctly at 0.125% of cargo value
- [ ] Donut chart accurately reflects cost breakdown percentages
- [ ] Value chain shows margins from landed to wholesale to retail
- [ ] Save calculation persists to database and appears in saved list
- [ ] URL sharing via nuqs correctly serializes/deserializes all inputs
- [ ] PDF export generates within 8 seconds with all sections
- [ ] Data date disclaimer appears on results panel
- [ ] Currency inputs support 2 decimal places and locale formatting
- [ ] All form sections are collapsible accordions
- [ ] Mobile view uses tab toggle between form and results
- [ ] Screen reader can access chart data via tabular alternative

## Dependencies
- **This page depends on:** HTS Lookup (PRD-APP-03) for duty rate data and HTS code search. Authentication (PRD-APP-01) for saving calculations. Container specs data for auto-calculating units per container.
- **Pages that depend on this:** FTZ Modeler (PRD-APP-05) compares FTZ vs non-FTZ landed costs. Analytics (PRD-APP-11) aggregates calculation history. Shipment Detail (PRD-APP-10) links to calculation for cost breakdown. Executive Dashboard (PRD-APP-08) shows average landed cost KPI.
