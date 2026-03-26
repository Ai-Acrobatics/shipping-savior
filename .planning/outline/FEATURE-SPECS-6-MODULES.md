# Feature Specifications: 6 Core Platform Modules

**Project:** Shipping Savior
**Document type:** User-facing feature specifications
**Last Updated:** 2026-03-26
**Status:** Draft — Pre-development reference

---

## Overview

This document defines user-facing feature specifications for the six core calculation and analysis modules that form the analytical engine of the Shipping Savior platform. Each specification describes what the module does, who uses it, what goes in, what comes out, how success is measured, and how the interface is laid out.

These modules collectively move a user from raw product cost at origin through every cost layer to final sale price — and identify structural advantages like FTZ duty optimization along the way.

---

## Module Index

| # | Module | Route | Priority | Primary User |
|---|--------|-------|----------|-------------|
| 1 | [Landed Cost Calculator](#module-1-landed-cost-calculator) | `/tools/landed-cost` | P0 | Importer, Freight Broker |
| 2 | [Unit Economics Analyzer](#module-2-unit-economics-analyzer) | `/tools/unit-economics` | P0 | Importer, Investor |
| 3 | [Tariff & Duty Calculator](#module-3-tariff--duty-calculator) | `/tools/tariff-duty` | P0 | Importer, Customs Preparer |
| 4 | [FTZ Savings Analyzer](#module-4-ftz-savings-analyzer) | `/tools/ftz-analyzer` | P0 | Importer, Supply Chain Strategist |
| 5 | [Container Utilization Calculator](#module-5-container-utilization-calculator) | `/tools/container-utilization` | P1 | Freight Broker, Importer |
| 6 | [Carrier Route Comparison](#module-6-carrier-route-comparison) | `/tools/route-comparison` | P1 | Freight Broker, Importer |

---

## Module 1: Landed Cost Calculator

### What It Does

The Landed Cost Calculator computes the true per-unit cost of importing a product from a foreign origin point to a US destination. It accounts for all 15 cost components that importers routinely miss or underestimate — from the factory price through customs clearance, warehousing, and final delivery. The output is a precise per-unit landed cost and a full margin analysis against wholesale and retail price targets.

This is the platform's foundational calculator. Every other module either feeds into it or builds on top of it.

### Who Uses It

**Primary:** Importers sourcing consumer goods from SE Asia (Vietnam, Thailand, Indonesia, Cambodia) who need to calculate true product cost before committing to a purchase order.

**Secondary:** Freight brokers who need to present cost breakdowns to clients. Supply chain managers modeling cost scenarios before a buying cycle. Investors evaluating import business unit economics.

### Key Inputs

The calculator accepts 15 cost components organized into four groups:

**Product Costs**
- Unit cost at origin (FOB price from factory)
- Warranty reserve per unit (set-aside for product defect returns)
- Returns reserve per unit (estimated return rate × cost to process)
- Marketing allocation per unit (amortized campaign cost per unit sold)
- Overhead allocation per unit (amortized warehouse/ops overhead per unit)

**Freight & Logistics**
- Ocean freight per container (full container cost, 20ft or 40ft)
- Units per container (determines per-unit freight cost)
- Cargo insurance rate (% of CIF value; typical 0.35–0.75%)
- Inland drayage (port-to-warehouse trucking; typical $500–$1,500/container)
- Warehouse handling per unit (receiving, put-away; typical $0.15–$0.50/unit)
- Storage cost per unit per month × expected months of inventory hold

**Customs & Compliance**
- Duty rate (% of FOB value; from HTS code lookup)
- Customs broker fee (flat per-entry; typical $150–$250)
- Merchandise Processing Fee (MPF; 0.3464% of goods value, min $31.67, max $614.35)
- Harbor Maintenance Fee (HMF; 0.125% of cargo value for ocean shipments)
- Exam fee reserve (CBP inspection risk; typical $300–$1,000 if selected)
- ISF filing fee (Importer Security Filing; typical $25–$75)

**Delivery**
- Last-mile delivery cost per unit (if shipping direct-to-consumer)

**Margin Targets**
- Wholesale price per unit
- Retail price per unit

*Default values are pre-populated using the canonical SE Asia consumer goods scenario: $0.10 origin cost, 500,000 units per 40ft container, 6.5% duty rate, $3,500 ocean freight.*

### Key Outputs

**Per-Unit Cost Breakdown Table**

A line-item table showing each cost component in absolute dollar terms and as a percentage of total landed cost. Example:

| Cost Component | Per Unit | % of Landed |
|----------------|----------|-------------|
| Product (FOB) | $0.1000 | 52.4% |
| Ocean Freight | $0.0070 | 3.7% |
| Duty (6.5%) | $0.0065 | 3.4% |
| Insurance | $0.0004 | 0.2% |
| MPF | $0.0001 | 0.1% |
| HMF | $0.0001 | 0.1% |
| Customs Broker | $0.0004 | 0.2% |
| Exam Reserve | $0.0006 | 0.3% |
| Drayage | $0.0016 | 0.8% |
| Handling | $0.0300 | 15.7% |
| Storage | $0.0100 | 5.2% |
| Warranty Reserve | $0.0050 | 2.6% |
| Returns Reserve | $0.0075 | 3.9% |
| Marketing Alloc | $0.0200 | 10.5% |
| Overhead Alloc | $0.0017 | 0.9% |
| **Total Landed** | **$0.1909** | **100%** |

**Margin Analysis**

| Metric | Value |
|--------|-------|
| Landed Cost per Unit | $0.1909 |
| Wholesale Price | $2.00 |
| Wholesale Margin | $1.8091 / 90.5% |
| Wholesale Markup | 10.5× |
| Retail Price | $5.00 |
| Retail Margin | $4.8091 / 96.2% |
| Retail Markup | 26.2× |

**Container-Level Summary**

| Metric | Value |
|--------|-------|
| Total Units | 500,000 |
| Total Landed Cost (container) | $95,450 |
| Revenue at Wholesale | $1,000,000 |
| Gross Profit (Wholesale) | $904,550 |
| ROI (Wholesale) | 947% |

**Cost Composition Chart**

A donut chart showing the proportion of landed cost attributed to each component. Highlights the cost categories that dominate (product cost, handling) vs. those commonly overestimated (duty, freight).

### Success Criteria

- Per-unit costs computed using `decimal.js` — no floating-point rounding errors across 15 components
- All 15 components display with accurate values and percentage of total
- Total landed cost = arithmetic sum of all components (verified to 4 decimal places)
- Margin warning displayed in amber when landed cost exceeds wholesale price
- Negative-margin warning displayed in red when landed cost exceeds retail price
- URL state sync: all inputs persist in query string for sharing calculations
- PDF export generates a clean single-page report with all inputs and outputs
- Page loads and calculates in under 2 seconds; recalculates in under 50ms on input change

### UI Wireframe Description

**Layout:** Two-column on desktop (inputs left, results right). Single column stacked on mobile.

**Left panel — Inputs:**
- Input groups organized into labeled sections: Product Costs, Freight & Logistics, Customs & Compliance, Delivery, Margin Targets
- Each input has a label, unit indicator ($ prefix or % suffix), and brief tooltip explaining what it represents
- Currency fields formatted with thousands separators
- "Reset to Defaults" button at the bottom
- "Import Duty Rate from HTS Lookup" link that opens the Tariff & Duty Calculator module in a modal or navigates to Module 3

**Right panel — Results:**
- Top summary card: large-print landed cost per unit, wholesale margin %, retail margin %
- Collapsible cost breakdown table showing all 15 line items
- Donut chart below the table
- Container-level summary section at the bottom
- "Export PDF" button
- "Copy shareable link" button (copies URL with current inputs)

**Warning states:**
- If landed cost > wholesale price: amber banner "Landed cost exceeds wholesale price — negative margin at wholesale"
- If landed cost > retail price: red banner "Landed cost exceeds retail price — losing money at every price point"
- If MPF exceeds its statutory cap ($614.35): show "MPF capped — maximum $614.35 applies"

---

## Module 2: Unit Economics Analyzer

### What It Does

The Unit Economics Analyzer models the complete import value chain from the moment a product is purchased at origin through every step to final sale. It answers the question: "If I buy goods at $0.10/unit in SE Asia, what does the full journey look like at $0.50 landed, $2.00 wholesale, and $5.00 retail?"

Where the Landed Cost Calculator focuses on cost decomposition, the Unit Economics Analyzer focuses on the business story — showing how a $0.10 item becomes a $5.00 retail product, who captures margin at each step, and what a full container of goods is worth at each stage of the chain.

### Who Uses It

**Primary:** Importers evaluating whether a new product category is worth pursuing. Anyone presenting the economics of an import business to a partner, investor, or buyer.

**Secondary:** Investors assessing ROI on import operations. Buyers negotiating wholesale purchase prices. Founders stress-testing their business model before committing to a first container.

### Key Inputs

| Input | Default | Notes |
|-------|---------|-------|
| Unit cost at origin (FOB) | $0.10 | What you pay the factory |
| Landed cost per unit | $0.50 | Output from Module 1, or manual entry |
| Wholesale price per unit | $2.00 | What you sell to distributors/retailers |
| Retail price per unit | $5.00 | What end consumers pay |
| Units per container | 500,000 | For container-level totals |
| Break-even volume (units) | 250,000 | Volume required to cover fixed costs |

The landed cost input can be manually entered or populated automatically from Module 1's output via a "Use Landed Cost from Calculator" button that carries state from Module 1.

### Key Outputs

**Value Chain Visualization**

The primary output is a horizontal segmented bar showing all four price points in context:

```
|--Origin--|----Landed----|-------------Wholesale------------|-----Retail-----|
  $0.10       $0.50              $2.00                            $5.00
  (Cost)    (+$0.40)          (+$1.50 margin)                  (+$3.00 margin)
```

Each segment is color-coded: red segments for cost, green segments for margin. Percentages labeled on each segment. The visual makes the value chain intuitively clear — cost is a tiny fraction of end-consumer price.

**P&L per SKU Table**

| Stage | Price | Cost | Margin $ | Margin % | Markup |
|-------|-------|------|----------|----------|--------|
| Origin | — | $0.10 | — | — | — |
| Landed | $0.50 | $0.10 | — | — | 5.0× |
| Wholesale | $2.00 | $0.50 | $1.50 | 75.0% | 4.0× |
| Retail | $5.00 | $0.50 | $4.50 | 90.0% | 10.0× |

**Break-Even Analysis**

| Metric | Value |
|--------|-------|
| Break-Even Volume | 250,000 units |
| Revenue at Break-Even (Wholesale) | $500,000 |
| Total Fixed Cost to Break-Even | $125,000 |
| Units per Container | 500,000 |
| Containers to Break-Even | 0.5 containers |

**Volume Scenarios Table**

Shows P&L at different order quantities (one of the most useful outputs for planning):

| Volume | Containers | Total Cost | Wholesale Revenue | Wholesale Profit | ROI |
|--------|-----------|------------|-----------------|----------------|-----|
| 100,000 units | 0.2 | $50,000 | $200,000 | $150,000 | 300% |
| 250,000 units | 0.5 | $125,000 | $500,000 | $375,000 | 300% |
| 500,000 units | 1.0 | $250,000 | $1,000,000 | $750,000 | 300% |
| 1,000,000 units | 2.0 | $500,000 | $2,000,000 | $1,500,000 | 300% |
| 5,000,000 units | 10.0 | $2,500,000 | $10,000,000 | $7,500,000 | 300% |

**Container-Level P&L**

| Metric | Value |
|--------|-------|
| Units per Container | 500,000 |
| Total Cost (1 container) | $250,000 |
| Wholesale Revenue | $1,000,000 |
| Wholesale Profit | $750,000 |
| Wholesale ROI | 300% |
| Retail Revenue | $2,500,000 |
| Retail Profit | $2,250,000 |
| Retail ROI | 900% |

### Success Criteria

- Value chain bar renders correctly for any combination of origin, landed, wholesale, and retail prices
- Bar segments adjust proportionally when inputs change (no hard-coded widths)
- Break-even calculation is accurate: break-even volume = total fixed cost / (wholesale price − landed cost per unit)
- Volume scenarios table generates rows dynamically for 5 predefined volume tiers
- Warning displayed if wholesale price is less than landed cost
- If landed cost input is left at $0, a prompt appears: "Enter landed cost or use Module 1 to calculate it"
- All calculations use `decimal.js` — no floating-point errors in margin percentages
- URL state sync for all inputs

### UI Wireframe Description

**Layout:** Full-width on desktop. Value chain visualization at top, analysis tables below.

**Top section — Value chain:**
- Large horizontal segmented bar spanning full width
- Four labeled price points above the bar: Origin, Landed, Wholesale, Retail
- Segments color-coded: gray for cost, green for margin
- Each segment shows the dollar amount and percentage of retail price
- Inputs directly above the bar (four currency fields + units input) — changing inputs redraws the bar in real time

**Middle section — Tables:**
- Two-column layout on desktop: P&L per SKU table on left, Container-Level P&L on right
- Break-even analysis card in its own row below the two-column section

**Bottom section — Volume scenarios:**
- Full-width table with 5 rows
- Rows highlighted at the break-even volume level
- "Add custom volume" button to append an extra row with user-specified volume

**Interaction notes:**
- "Use Landed Cost from Module 1" button appears next to the landed cost input — clicking it pulls the most recently computed landed cost from Module 1 (via URL params or shared state)
- "Export PDF" button generates a one-page P&L summary

---

## Module 3: Tariff & Duty Calculator

### What It Does

The Tariff & Duty Calculator enables users to look up the correct HTS (Harmonized Tariff Schedule) code for their product, retrieve the applicable duty rate based on country of origin, apply any Section 301 tariff overlays for Chinese imports, and compute the total duty owed at the per-unit and container level.

This module is the data gateway for the entire platform. Accurate duty rates feed directly into Module 1 (Landed Cost) and Module 4 (FTZ Savings). Getting this number right is the most consequential part of import cost modeling.

### Who Uses It

**Primary:** Importers who need to determine their duty rate before committing to a purchase order. Anyone new to importing who doesn't know their product's HTS code.

**Secondary:** Freight brokers presenting cost estimates to clients. Customs compliance personnel verifying classifications. Business owners comparing sourcing countries to find the lowest-duty origin.

### Key Inputs

**HTS Code Lookup**
- Product description search (fuzzy text search across 100,000+ HTS entries)
- Direct HTS code entry (for users who already know their code)
- The lookup returns: HTS code, product description, MFN (Most Favored Nation) general duty rate, special program rates (GSP, CAFTA, etc.), unit of quantity

**Country of Origin**
- Dropdown with all countries, filtered for quick access to: Vietnam, Thailand, Indonesia, Cambodia, Malaysia, China (Mainland), Bangladesh, India
- Country selection determines which duty rate column applies and whether Section 301 overlays apply

**Section 301 / Additional Tariffs**
- Auto-detected when country of origin is China — displays the applicable Section 301 list (List 1, 2, 3, or 4A/4B) and the additional tariff rate
- Manual override field for users who have received a Section 301 exclusion

**Volume Inputs (for totals)**
- Unit cost at origin (FOB) — to compute the duty base
- Number of units — for per-unit and container-level totals
- Number of containers — for full-shipment duty totals

### Key Outputs

**Classification Result Card**

Displayed immediately after a successful HTS lookup:

```
HTS Code:          6302.21.90
Description:       Bed linen, of cotton, printed
MFN Duty Rate:     6.5%
Section 301:       N/A (Vietnam origin — no Section 301)
Special Rates:     VN: 0% (Vietnam Trade Agreement)
Unit of Quantity:  Kg
```

**Duty Calculation Summary**

| Metric | Value |
|--------|-------|
| HTS Code | 6302.21.90 |
| Country of Origin | Vietnam |
| MFN Duty Rate | 6.5% |
| Section 301 Overlay | None |
| Effective Duty Rate | 6.5% |
| Unit FOB Value | $0.10 |
| Duty per Unit | $0.0065 |
| Units in Shipment | 500,000 |
| Shipment FOB Value | $50,000 |
| Total Duty Owed | $3,250 |

**Country Comparison Table**

When a product is looked up, the tool automatically shows duty rates for the primary SE Asia sourcing countries side-by-side:

| Country | MFN Rate | Section 301 | Effective Rate | Duty on $50K Shipment |
|---------|----------|-------------|---------------|-----------------------|
| Vietnam | 6.5% | None | 6.5% | $3,250 |
| Thailand | 6.5% | None | 6.5% | $3,250 |
| Indonesia | 6.5% | None | 6.5% | $3,250 |
| Cambodia | 6.5% | None | 6.5% | $3,250 |
| China | 6.5% | +25% (List 3) | 31.5% | $15,750 |

This comparison table is a key differentiator — it immediately shows the financial benefit of sourcing from SE Asia vs. China when Section 301 tariffs are in effect.

**Section 301 Overlay Detail** (China origin only)

When China is selected as origin, an expandable section appears:

- Lists which Section 301 list the HTS code falls under (1, 2, 3, 4A, or 4B)
- Shows the additional tariff rate for that list
- Calculates the total effective rate (MFN + Section 301)
- Links to the USTR exclusion request portal
- Notes: "Check with a licensed customs broker for exclusion eligibility"

### Success Criteria

- HTS code search returns relevant results within 300ms using client-side fuzzy search across the full 100K+ entry dataset
- Typing a partial HTS code (e.g., "6302") returns all codes under that chapter
- Typing a product description (e.g., "bed linen cotton") returns the top 5–10 matching HTS codes
- Country comparison table populates automatically after any successful HTS lookup
- Section 301 overlay correctly appears only for China origin, with accurate list assignment
- "Use this rate in Landed Cost Calculator" button pre-fills Module 1 with the effective duty rate
- "Use this rate in Unit Economics Analyzer" button pre-fills Module 2
- All duty calculations use `decimal.js` — no rounding errors on percentage arithmetic
- Compliance disclaimer present: "For informational purposes only. Classifications are not legally binding. Consult a licensed customs broker for binding rulings."
- Data source date clearly displayed: "HTS data as of [date]. Rates subject to change."

### UI Wireframe Description

**Layout:** Search bar at top, full-width. Results below in two-column layout (classification detail on left, duty calculations on right). Country comparison table full-width below.

**Top section — Search:**
- Large, prominent search input: "Search by product description or HTS code..."
- Two lookup modes toggled by tabs: "Describe your product" (fuzzy text search) and "Enter HTS code" (direct lookup)
- In description mode: autocomplete suggestions appear as you type, showing HTS code + truncated description
- In HTS code mode: enter code and hit Enter to look up

**Left column — Classification result:**
- Classification result card with HTS code, full description, rates, unit of quantity
- "Is this the right code?" expandable section showing similar HTS codes (for verification)
- Link to the official HTS entry on hts.usitc.gov

**Right column — Duty calculation:**
- Volume inputs (unit FOB value, number of units, number of containers)
- Duty calculation summary card
- Section 301 detail (visible only for China origin)
- Action buttons: "Use in Landed Cost Calculator" / "Use in Unit Economics Analyzer"

**Full-width below — Country comparison:**
- Table comparing effective duty rates across SE Asia sourcing countries for the current HTS code
- China row highlighted in amber to draw attention to Section 301 premium
- "Save comparison" button saves to localStorage for later reference

---

## Module 4: FTZ Savings Analyzer

### What It Does

The FTZ (Foreign Trade Zone) Savings Analyzer models the financial benefit of importing goods through a US Foreign Trade Zone versus entering them directly through standard customs. FTZs allow importers to lock duty rates on the date goods enter the zone, pay duties only on goods withdrawn (not the entire shipment upfront), and base duty calculations on FOB origin value rather than US market value.

This module is the platform's primary differentiator. No comparable consumer-facing tool exists that makes FTZ savings concrete and computable. The analyzer models both the duty-locking benefit (protection against tariff increases) and the incremental withdrawal benefit (cash flow optimization), and shows the net savings after storage costs.

### Who Uses It

**Primary:** Importers who regularly bring in large shipments and want to evaluate whether routing through an FTZ makes financial sense for their situation.

**Secondary:** Supply chain strategists comparing import strategies. Investors evaluating the duty optimization capability of an import business. Anyone whose goods are subject to volatile tariff rates (e.g., goods currently under Section 301 tariffs).

### Key Inputs

**Shipment Parameters**
- Unit value at origin (FOB price — this is the duty basis in an FTZ)
- Total units entering the FTZ

**Rate Inputs**
- Locked duty rate (the rate at the time goods enter the FTZ — this rate is preserved)
- Current/future duty rate (the rate that would apply without FTZ protection, or anticipated future rate)

**Zone Status Election**

Two options with explanations inline:
- **PF (Privileged Foreign):** Locks both the tariff classification and the rate at time of admission. The duty rate paid on withdrawal will always be the locked rate, regardless of future rate changes. Best strategy when rates are expected to increase.
- **NPF (Non-Privileged Foreign):** Does not lock the classification or rate. At withdrawal, the importer pays the lower of the rate at admission or the rate at the time of withdrawal. Best strategy when rates are expected to decrease or are uncertain.

**Cash Flow & Storage Inputs**
- Monthly storage cost per unit (FTZ warehousing fee; typical $0.005–$0.02/unit/month)
- Withdrawal frequency: Weekly / Biweekly / Monthly / Quarterly
- Units withdrawn per period
- Analysis duration (1–60 months)

### Key Outputs

**Savings Summary Card** (most prominent output — large font, high visual contrast)

| Metric | Example Value |
|--------|-------------|
| Total Duty Without FTZ | $6,000 |
| Total Duty With FTZ | $3,250 |
| Gross Duty Savings | $2,750 |
| Total Storage Costs | $600 |
| Net Savings After Storage | $2,150 |
| Savings as % of No-FTZ Duty | 35.8% |
| Break-Even Storage Month | Month 4 |

The net savings figure is the number that matters — it answers "is this worth it?"

**Withdrawal Timeline Table**

A period-by-period table showing the duty and storage economics for each withdrawal:

| Period | Units Out | Units Left | Duty (No FTZ) | Duty (FTZ) | Period Savings | Cum. Savings | Storage Cost |
|--------|-----------|------------|---------------|------------|----------------|-------------|-------------|
| Month 1 | 50,000 | 450,000 | $600 | $325 | $275 | $275 | $50 |
| Month 2 | 50,000 | 400,000 | $600 | $325 | $275 | $550 | $45 |
| ... | ... | ... | ... | ... | ... | ... | ... |

The "Units Left" column decreasing to zero confirms that the model correctly tracks inventory drawdown. Table is scrollable for analyses beyond 12 months.

**Cumulative Savings Chart**

A line chart with two series:
1. Cumulative duty paid without FTZ (steps up with each withdrawal period)
2. Cumulative duty paid with FTZ (lower curve, same step cadence)

The shaded area between the two lines is the accumulated savings. The break-even point (where storage costs equal accumulated savings) is marked with a vertical dashed line.

**Cash Flow Comparison Chart**

A bar chart comparing the cash flow timing difference:
- Without FTZ: duty paid in a single upfront payment when goods clear customs
- With FTZ: duty paid incrementally across all withdrawal periods

This chart makes the cash flow benefit of FTZ immediately legible — even when the locked rate equals the current rate, the cash flow advantage of spreading duty payments across months is real and valuable.

**Rate Differential Visual**

A side-by-side gauge or comparison bar showing:
- Locked rate (e.g., 6.5%)
- Current/future rate (e.g., 12.0%)
- Rate difference (e.g., 5.5 percentage points)
- Savings per unit from rate differential alone (e.g., $0.0055/unit)

If the two rates are equal, a message replaces the visual: "No rate differential benefit — FTZ cash flow advantage still applies."

### Success Criteria

- PF status: duty always calculated at locked rate, regardless of current rate input
- NPF status: duty calculated at `min(locked rate, current rate)` — correctly benefits from rate decreases
- Withdrawal timeline correctly drains units to zero — never models negative inventory
- All period savings sum exactly to total gross savings (decimal-precise)
- Break-even month correctly identified as the period where cumulative storage costs first exceed cumulative savings
- Warning banner displayed when storage costs exceed duty savings: "Storage costs have exceeded duty savings at this duration"
- Warning displayed when locked rate ≥ current rate in PF mode: "No duty-locking benefit — FTZ value is cash flow only"
- Required compliance disclaimers are present and visible:
  - "For informational purposes only. Not legal, customs, or trade compliance advice."
  - "PF/NPF zone status elections are irrevocable. Consult a licensed customs broker before making an election."
  - "Tariff rates are subject to change. Past rates do not guarantee future rates."
- All monetary values computed with `decimal.js`
- URL state sync for all inputs

### UI Wireframe Description

**Layout:** Input panel on left (desktop) or top (mobile). Results panel on right (desktop) or below (mobile).

**Left panel — Inputs:**
- Top group: Shipment Parameters (FOB value, total units)
- Middle group: Rate Inputs (two percentage fields with a visual "lock" icon connecting them)
- Zone status election: two large radio buttons with inline explanation of PF vs NPF in plain language ("Lock my rate" vs "Stay flexible")
- Bottom group: Cash Flow & Storage Inputs (storage cost, withdrawal frequency, units per period, duration)

**Right panel — Results:**
- Savings summary card at the very top, occupying ~30% of the panel height. Net savings figure in very large green text.
- Rate differential visual below the summary card
- Timeline table in a scrollable container, visible by default (not collapsed)
- Charts below the table — two charts stacked vertically

**Compliance section:**
- Info-blue banner at the top of the page (above the inputs): "Educational tool. Not legal or customs advice."
- Collapsible "Full Disclaimer" at the bottom of the page with the three required disclaimer texts

---

## Module 5: Container Utilization Calculator

### What It Does

The Container Utilization Calculator determines how many units of a product fit inside a standard shipping container, computes the cost-per-unit at different load quantities, and recommends the optimal container type for a given product. For multi-SKU shipments, it models a mixed load and shows the utilization and cost breakdown for each SKU.

This is the most operationally concrete calculator on the platform — it answers the everyday question: "How many of my product can I fit in a container, and what does each one cost me in freight?"

### Who Uses It

**Primary:** Freight brokers advising importers on container selection and order quantity optimization. Importers planning a purchase order and needing to right-size their order to fill (or share) a container.

**Secondary:** Supply chain planners modeling freight cost per unit at different order volumes. Anyone deciding between a 20ft and 40ft container.

### Key Inputs

**Product Dimensions & Weight**
- Length (cm or inches) — single unit
- Width (cm or inches)
- Height (cm or inches)
- Weight per unit (kg or lbs)
- Packing carton dimensions (optional — if units are packed in master cartons before loading)
- Units per carton (optional)

**Shipment Parameters**
- Number of units to ship
- Container type preference: Auto (recommended) / 20ft Standard / 40ft Standard / 40ft High Cube / 40ft Reefer
- Cargo type: General Cargo / Refrigerated / Hazardous
- Ocean freight cost per container (to compute cost per unit)

**Multi-SKU mode (optional)**
- Toggle: "I'm shipping multiple products in one container"
- When enabled: adds rows for up to 5 SKUs, each with their own dimensions, weight, units, and freight allocation

### Key Outputs

**Container Recommendation**

The primary output card:

```
Recommended Container: 40ft High Cube

Why:                  Your product dimensions are tall (58cm).
                      Standard 40ft height (2.39m) would reduce stacking by 30%.
                      40ft HC provides 2.70m internal height — full utilization.

Container Internal Dimensions (40ft HC):
  Length:     12.03 m
  Width:       2.35 m
  Height:      2.70 m
  Max Payload: 26,470 kg

Units per Container:  84,000 units
Load Factor:          97.2% (volume)
Weight Utilization:   72.4% (18,480 kg / 26,470 kg max)
```

The load factor is the lower of volume utilization and weight utilization — it shows whether the container is volume-limited or weight-limited.

**Cost per Unit at Scale**

| Order Quantity | Containers | Freight per Unit | Total Freight |
|---------------|-----------|-----------------|---------------|
| 10,000 units | 0.12 (LCL) | $0.82 | $8,200 |
| 42,000 units | 0.5 × 40ft | $0.42 | $17,500 |
| 84,000 units | 1 × 40ft HC | $0.042 | $3,500 |
| 168,000 units | 2 × 40ft HC | $0.042 | $7,000 |
| 420,000 units | 5 × 40ft HC | $0.042 | $17,500 |

This table shows the freight cost per unit dropping dramatically at full-container quantities — a key insight for purchase order sizing decisions.

**Container Utilization Visual**

A 3D-style or 2D isometric representation of the container showing how units are stacked. Not a photorealistic render — a simple diagrammatic representation showing:
- The container outline
- Filled and empty space differentiated by color (filled = blue, empty = gray)
- A utilization percentage overlaid on the diagram

**Stacking Diagram**

Shows how units are oriented and stacked within the container:
- Units per layer (floor footprint)
- Layers high (given ceiling height and unit height)
- Total units = units per layer × layers
- Notes if units must be laid on their side to fit (if height > available stacking)

**Multi-SKU Breakdown** (when multi-SKU mode is enabled)

| SKU | Units | Volume per Unit | Total Volume | % of Container | Freight Allocation |
|-----|-------|----------------|-------------|---------------|-------------------|
| SKU-A | 20,000 | 0.0024 m³ | 48 m³ | 65% | $2,275 |
| SKU-B | 5,000 | 0.0096 m³ | 48 m³ | 35% | $1,225 |
| Total | 25,000 | — | 96 m³ | ~100% | $3,500 |

### Success Criteria

- Container recommendation is correct for any combination of product dimensions and quantity
- Weight-limited cargo (dense goods like canned food, liquids) correctly limits utilization — never recommends packing more units than the max payload allows
- Volume-limited cargo (light bulky goods) correctly identifies volume as the binding constraint
- Cost per unit scale table shows correct arithmetic: (ocean freight / units per container) × (units in order / units per container)
- For partial containers (LCL shipments), freight estimate uses a per-cubic-meter rate rather than a flat per-container rate, and the output card labels this as "LCL estimate"
- Multi-SKU mode correctly allocates container space proportionally and does not exceed container volume or weight limits
- Unit conversion works: inputs in inches are correctly converted to cm for internal calculations
- Stacking diagram matches the actual units-per-container output
- Tooltip on load factor explains weight-limited vs volume-limited distinction

### UI Wireframe Description

**Layout:** Input form on left (or top on mobile). Results on right (or below on mobile).

**Left panel — Inputs:**
- Product dimensions section: length/width/height in a compact 3-field grid with a unit toggle (cm/in)
- Weight input below dimensions
- Carton dimensions section (collapsed by default, expandable)
- Shipment parameters: units to ship, container preference dropdown, cargo type, freight cost per container
- Multi-SKU toggle at the bottom of the input panel — when enabled, expands a table to add additional SKUs

**Right panel — Results:**
- Container recommendation card at top — bold, high contrast
- Container utilization visual (the colored box diagram) — medium size, centered
- Cost per unit scale table below the visual
- Stacking notes text block (e.g., "48 layers of 1,750 units per layer")
- Multi-SKU breakdown table (visible only when multi-SKU mode is on)

**Container selector tabs:**
- Four tabs above the results panel: 20ft / 40ft / 40ft HC / 40ft Reefer
- Clicking any tab re-runs the calculation for that container type, allowing the user to compare
- The "Auto" recommendation highlights the recommended tab

---

## Module 6: Carrier Route Comparison

### What It Does

The Carrier Route Comparison tool shows three carrier options for a given origin-to-destination port pair, with pricing tiers, transit times, transshipment details, service reliability ratings, and backhaul availability. It replicates and scales the founder's manual workflow of researching vessel options and presenting three choices to clients.

Every route shown includes the full transshipment chain — not just origin and destination. Understanding that a "direct" Ho Chi Minh City to Long Beach shipment actually routes through Singapore is essential operational knowledge that this tool makes explicit.

### Who Uses It

**Primary:** Freight brokers who need to present 3 carrier/route options to a client, with professional formatting and complete route details.

**Secondary:** Importers researching their options before engaging a broker. Anyone planning a shipment and needing to understand the tradeoffs between speed, cost, and reliability.

### Key Inputs

| Input | Default | Options |
|-------|---------|---------|
| Origin port | Ho Chi Minh City (VNSGN) | All SE Asia ports: Vietnam, Thailand, Indonesia, Cambodia + major China southern ports |
| Destination port | Long Beach (USLGB) | Major US ports: Long Beach, Los Angeles, Oakland, Seattle/Tacoma, Savannah, Newark, Houston, Charleston, Miami |
| Cargo type | General Cargo | General Cargo / Refrigerated |
| Container type | 40ft Standard | 20ft Standard / 40ft Standard / 40ft High Cube / 40ft Reefer |

Port selectors are searchable by city name or UN/LOCODE code (e.g., searching "VNSGN" or "Ho Chi Minh" both work).

### Key Outputs

**Three Route Option Cards**

Results are presented as three cards, sorted by default as: Economy (lowest cost) / Standard (best value) / Express (fastest). Each card contains:

```
[ECONOMY]                               [BACKHAUL AVAILABLE]
Maersk — AE7 Service
Ho Chi Minh City → Singapore → Long Beach
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Transit Time:       28 days
                    (incl. 2-day Singapore dwell)
Estimated Cost:     $3,200 – $3,800 USD
Container:          40ft Standard
Service Frequency:  Weekly
Vessel Size:        13,000 TEU
On-Time Rate:       92%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[View on Map]    [Use in Landed Cost Calculator]
```

Key card details:
- **Tier label** (Economy / Standard / Express) in a colored badge — green for economy, blue for standard, amber for express
- **Full route string** with every transshipment port named — never just "Origin → Destination"
- **Transit time** includes transshipment dwell time, so it reflects real door-to-door ocean transit
- **Cost as a range** — never a single point estimate, because rates fluctuate
- **Backhaul badge** appears on routes where the return-leg pricing advantage is available (typically 30–50% lower than the outbound rate)
- **Direct route badge** (gold) when there are no transshipments
- **On-time rate** — percentage of sailings that arrive within 2 days of scheduled arrival, based on historical data

**Refrigerated cargo overlay** (when cargo type = Refrigerated):
- Reefer surcharge displayed on each card ($2,000–$5,000 typical premium over dry cargo)
- Compatibility note: "This route supports reefer containers — Singapore hub has full reefer plug availability"
- Routes that don't support reefer are hidden from results

**Route Comparison Table**

A detailed comparison table below the cards, sortable by any column:

| Attribute | Economy | Standard | Express |
|-----------|---------|----------|---------|
| Carrier | Maersk | CMA CGM | Evergreen |
| Service | AE7 | FAL1 | AUE |
| Transit Time | 28 days | 24 days | 18 days |
| Transshipments | 1 (Singapore) | 1 (Busan) | 0 (Direct) |
| Cost Range | $3,200–$3,800 | $3,800–$4,500 | $5,000–$6,200 |
| Frequency | Weekly | Weekly | Bi-weekly |
| Backhaul | Yes | No | No |
| Reliability | 92% | 89% | 95% |

The "Best Value" option (lowest cost per transit day) is highlighted with a subtle indicator.

**Transshipment Diagram**

A visual diagram below the comparison table showing the hub-and-spoke routing model:
- Central hub ports (Singapore, Busan, Panama, Cartagena) shown as larger nodes
- Origin and destination shown as smaller nodes
- Route lines connecting through hubs, with transit time labeled on each leg
- Analogous to an airline route map — gives users an intuitive model of how container routing works

**Backhaul Explainer**

A collapsible info section below the diagram:
- Explains what backhaul means: "Backhaul routes travel in the opposite direction of peak demand. Asia→US is high demand (head-haul); US→Asia is lower demand (backhaul)."
- Notes the typical rate advantage: "Backhaul rates are typically 30–50% lower than head-haul rates on the same lane"
- Notes variability: "Availability varies by season and carrier"

### Success Criteria

- Every route card shows the full transshipment chain — no card shows only "origin → destination" without naming intermediate ports
- Backhaul badge appears on all and only routes with `backhaul: true` in the data
- Refrigerated cargo type correctly filters out routes that don't support reefer and adds the surcharge to eligible routes
- Comparison table values match the card values (no discrepancy between card and table)
- "View on Map" button navigates to Module 5's shipping map page with the selected route highlighted
- "Use in Landed Cost Calculator" button navigates to Module 1 with the ocean freight cost pre-populated
- Port search finds results by both city name and UN/LOCODE code
- Mobile layout stacks cards vertically with readable text
- Data source disclaimer present: "Route data based on carrier schedules as of [date]. Rates and schedules subject to change. Verify with carrier before booking."
- A "sort by" control above the cards allows re-sorting by: Cheapest / Fastest / Most Reliable / Best Value

### UI Wireframe Description

**Layout:** Input bar at the very top, full-width. Three route cards in a row below (desktop) or stacked (mobile). Comparison table and diagram below the cards.

**Top section — Input bar:**
- Horizontal bar with four inputs side by side: Origin port (searchable select), arrow icon, Destination port (searchable select), Cargo type (dropdown), Container type (dropdown)
- "Compare Routes" button to the right of the inputs
- The input bar is sticky — it stays visible while scrolling through results

**Middle section — Route cards:**
- Three cards in a 3-column grid on desktop, stacked on mobile
- Each card has a distinct top-border color (green / blue / amber) indicating the tier
- Backhaul badge in the top-right corner of qualifying cards
- Action buttons at the bottom of each card
- Sort control above the cards: segmented button group (Cheapest / Fastest / Most Reliable / Best Value)
- "Expand details" toggle on each card reveals the full route string with transshipment dwell time details

**Bottom section — Detailed comparison:**
- Comparison table with sortable headers
- Transshipment hub-and-spoke diagram below the table (medium height, full-width)
- Backhaul explainer in a collapsible info box
- Data source disclaimer at the bottom

---

## Cross-Module Integration

The six modules are designed to chain together. Data flows naturally from one module to the next:

```
Module 3: Tariff & Duty Calculator
  "Use this rate" →
    Module 1: Landed Cost Calculator
    Module 4: FTZ Savings Analyzer

Module 1: Landed Cost Calculator
  "Use landed cost" →
    Module 2: Unit Economics Analyzer
    Module 4: FTZ Savings Analyzer

Module 6: Carrier Route Comparison
  "Use in Landed Cost Calculator" →
    Module 1 (ocean freight cost pre-populated)

Module 5: Container Utilization Calculator
  "Use freight cost" →
    Module 1 (cost per unit pre-populated)

Module 6: Carrier Route Comparison
  "View on Map" →
    Interactive Shipping Map (route highlighted)
```

All cross-module data passing happens via URL query parameters. No backend session state is needed. A user can bookmark any state in any calculator and return to it exactly.

---

## Shared Constraints (All Modules)

**Arithmetic precision:** All modules use `decimal.js` for every calculation involving currency, percentages, or unit costs. Native JavaScript floating-point arithmetic is never used for financial calculations.

**URL state sync:** All input values in all modules are synchronized to URL query parameters via `nuqs`. Any calculator state can be shared via a URL.

**Compliance disclaimers:** All modules display appropriate disclaimers. Modules 3 and 4, which touch regulated subjects (tariff classification, FTZ elections), display prominent non-advice disclaimers and link to authoritative sources (hts.usitc.gov for tariff data; OFIS for FTZ data).

**Data freshness:** All modules using static rate data (HTS rates, carrier schedules) display a "data as of [date]" timestamp and a note that rates are subject to change.

**Accessibility:** All modules are designed to WCAG 2.1 AA standards — keyboard-navigable inputs, screen-reader-friendly tables, sufficient color contrast.

**Responsive design:** All modules work on desktop (1440px), tablet (1024px — meeting use case), and mobile (375px). On mobile, two-column layouts collapse to single-column with inputs above and results below.

**PDF export:** All six modules support PDF export of the current calculation state, generated via `/api/export/[module]` API routes.

**No real-time data:** Phase 1 uses curated static datasets. No live carrier API calls, no real-time tariff feeds. Data freshness is maintained by periodic manual updates to the underlying JSON data files.
