# PRD-02: Unit Economics Calculator

**Status:** Draft
**Priority:** P0 (Core value proposition)
**Route:** `/tools/unit-economics`
**Last Updated:** 2026-03-26

---

## 1. Overview & Purpose

The Unit Economics Calculator models the complete import value chain from product origin to retail sale. It answers the founder's core question: "If I buy goods at $0.10/unit in SE Asia, what does it actually cost me landed, and what margins do I get at wholesale and retail?"

This is the single most important calculator in the platform. It ties together shipping costs, duties, fulfillment, and markup into a clear financial picture. The output should make a compelling business case that is instantly understandable in a partner meeting.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|------------|
| US-02-01 | Importer | Input my unit cost and see the full cost breakdown | I know my true landed cost per unit |
| US-02-02 | Importer | Adjust shipping, duty, and fulfillment costs | I can model different scenarios |
| US-02-03 | Importer | See margins at wholesale and retail price points | I can evaluate profitability |
| US-02-04 | Importer | See total container-level profit | I understand the per-shipment economics |
| US-02-05 | Importer | Share a specific calculation via URL | I can send it to a partner or investor |
| US-02-06 | Importer | Export the calculation as a PDF | I have a document for meetings |
| US-02-07 | Importer | See a visual breakdown of where costs go | I understand the cost composition intuitively |

---

## 3. Functional Requirements

### 3.1 Input Panel

All inputs in a single form panel (left side on desktop, top on mobile):

| Input | Type | Default | Validation | Notes |
|-------|------|---------|------------|-------|
| Unit Cost (Origin) | Currency input | $0.10 | > 0, max $10,000 | FOB price at origin factory |
| Units per Container | Number input | 500,000 | > 0, max 2,000,000 | Depends on product size/weight |
| Container Shipping Cost | Currency input | $3,500 | > 0, max $50,000 | Ocean freight for one container |
| Duty Rate (%) | Percentage slider + input | 6.5% | 0-100% | From HTS code lookup |
| Insurance Rate (%) | Percentage input | 0.5% | 0-5% | Cargo insurance on CIF value |
| Customs Broker Fee | Currency input | $200 | >= 0, max $2,000 | Per-entry fee |
| Inland Freight | Currency input | $800 | >= 0, max $10,000 | Drayage from port to warehouse |
| Fulfillment Cost per Unit | Currency input | $0.05 | >= 0, max $50 | Pick, pack, ship |
| Wholesale Price | Currency input | $2.00 | >= 0 | B2B selling price |
| Retail Price | Currency input | $5.00 | >= 0 | B2C / end-buyer price |

- Form validation via `zod` schema
- All currency inputs formatted with `currency.js`
- "Reset to Defaults" button
- "Use HTS Rate" button that opens HTS Lookup modal or links to PRD-07

### 3.2 Output Panel

Results displayed in a structured panel (right side on desktop, below on mobile):

#### 3.2.1 Per-Unit Cost Breakdown

Table showing each cost component per unit:

| Line Item | Per Unit | % of Landed |
|-----------|----------|-------------|
| Product (FOB) | $0.1000 | 58.8% |
| Shipping | $0.0070 | 4.1% |
| Duty | $0.0065 | 3.8% |
| Insurance | $0.0005 | 0.3% |
| Brokerage | $0.0004 | 0.2% |
| Inland Freight | $0.0016 | 0.9% |
| Fulfillment | $0.0500 | 29.4% |
| **Landed Cost** | **$0.1700** | **100%** |

- All values calculated with `decimal.js`
- Shipping per unit = Container shipping cost / units per container
- Duty per unit = Unit cost * duty rate
- Insurance per unit = (Unit cost + shipping per unit) * insurance rate
- Brokerage per unit = Broker fee / units per container
- Inland per unit = Inland freight / units per container

#### 3.2.2 Value Chain Visualization

Horizontal bar or Sankey-style visualization showing:

```
Origin ($0.10) -> Landed ($0.17) -> Wholesale ($2.00) -> Retail ($5.00)
```

- Color-coded segments showing cost vs. margin at each step
- Percentages labeled on each segment
- Animated transition when inputs change

#### 3.2.3 Margin Analysis

| Metric | Value |
|--------|-------|
| Wholesale Margin | $1.83/unit (91.5%) |
| Retail Margin | $4.83/unit (96.6%) |
| Wholesale Markup | 11.8x |
| Retail Markup | 29.4x |
| Margin for End Buyer (Retail - Wholesale) | $3.00 (60%) |

#### 3.2.4 Container-Level Summary

| Metric | Value |
|--------|-------|
| Units per Container | 500,000 |
| Total Container Cost | $85,000 |
| Revenue at Wholesale | $1,000,000 |
| Revenue at Retail | $2,500,000 |
| Gross Profit (Wholesale) | $915,000 |
| Gross Profit (Retail) | $2,415,000 |
| ROI | 1,076% (wholesale) / 2,841% (retail) |

#### 3.2.5 Cost Breakdown Chart

- Donut chart (Recharts) showing cost composition
- Segments: Product, Shipping, Duty, Insurance, Brokerage, Inland, Fulfillment
- Interactive: hover shows exact amount and percentage
- Responsive: works on mobile

### 3.3 URL State Sync

- All input values persisted in URL query parameters via `nuqs`
- Changing inputs updates URL in real-time (debounced 300ms)
- Visiting a URL with params populates the form
- Example: `/tools/unit-economics?uc=0.10&upc=500000&sc=3500&dr=6.5&wp=2.00&rp=5.00`

### 3.4 PDF Export

- "Export PDF" button generates a single-page PDF report
- Includes: Inputs summary, per-unit breakdown table, margin analysis, container summary
- Generated via API route `/api/export/unit-economics` using `@react-pdf/renderer`
- Header: "Shipping Savior - Unit Economics Report" with date
- Footer: Disclaimer text

### 3.5 Scenario Comparison (Stretch)

- "Save Scenario" button stores current inputs as a named scenario
- Compare up to 3 scenarios side-by-side
- Stored in Zustand + localStorage (no backend needed)

---

## 4. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Calculation latency | < 50ms per recalculation | All client-side, no network calls |
| Input responsiveness | No perceptible lag when typing/sliding | Debounce chart updates, not calculations |
| Number precision | Exact to 4 decimal places for per-unit costs | decimal.js required |
| Accessibility | WCAG 2.1 AA | All inputs labeled, keyboard-navigable, focus indicators |
| Responsive | 375px - 2560px | Two-column on desktop, stacked on mobile |
| Print-friendly | Clean output when browser prints | CSS `@media print` rules |

---

## 5. Data Requirements

- No external data fetching
- Default values sourced from PROJECT.md context:
  - Unit cost: $0.10 (SE Asia CPG/apparel)
  - Units per container: 500,000 (small consumer goods)
  - Shipping cost: $3,500 (SE Asia to US West Coast, 40ft container)
  - Duty rate: 6.5% (typical for consumer goods from Vietnam/Thailand)
- HTS duty rate can be fed in from PRD-07 (HTS Lookup) via URL params or cross-page state

---

## 6. UI/UX Specifications

- **Layout:** Two-column on desktop (inputs left, results right). Single column on mobile.
- **Input styling:** Clean form with input groups. Currency fields have "$" prefix. Percentage fields have "%" suffix. Number inputs have up/down arrows.
- **Duty rate slider:** Range slider (0-50%) with a text input override for exact values
- **Results styling:** Card-based sections. Cost breakdown in a clean table. Charts in a separate card below.
- **Value chain:** Horizontal segmented bar chart, color-coded (green for margin, red-ish for costs)
- **Animations:** Results update smoothly on input change. Chart transitions via Recharts animation props.
- **Empty/zero states:** If wholesale or retail price is $0, margin section shows "N/A" instead of negative numbers
- **Warning states:** If landed cost > wholesale price, show a yellow warning: "Landed cost exceeds wholesale price -- negative margin"

---

## 7. Technical Implementation Notes

### Component Breakdown

```
app/tools/unit-economics/page.tsx      # Server component - layout + metadata
components/calculators/
  UnitEconomicsCalculator.tsx          # Client component - main calculator
  UnitEconomicsInputs.tsx              # Client component - input form
  UnitEconomicsResults.tsx             # Client component - results display
  CostBreakdownChart.tsx               # Client component - donut chart
  ValueChainBar.tsx                    # Client component - horizontal bar
  MarginAnalysis.tsx                   # Client component - margin table
  ContainerSummary.tsx                 # Client component - container-level numbers
lib/calculators/
  unit-economics.ts                    # Pure calculation function
  types.ts                             # Shared TypeScript interfaces
```

### Calculator Function Signature

```typescript
// lib/calculators/unit-economics.ts
import Decimal from 'decimal.js';

export interface UnitEconomicsInput {
  unitCostOrigin: number;
  unitsPerContainer: number;
  containerShippingCost: number;
  dutyRate: number;          // percentage as decimal (6.5% = 0.065)
  insuranceRate: number;     // percentage as decimal
  customsBrokerFee: number;
  inlandFreight: number;
  fulfillmentCostPerUnit: number;
  wholesalePrice: number;
  retailPrice: number;
}

export interface UnitEconomicsResult {
  perUnit: {
    product: string;         // decimal string for display precision
    shipping: string;
    duty: string;
    insurance: string;
    brokerage: string;
    inlandFreight: string;
    fulfillment: string;
    totalLanded: string;
  };
  percentages: {
    product: string;
    shipping: string;
    duty: string;
    insurance: string;
    brokerage: string;
    inlandFreight: string;
    fulfillment: string;
  };
  margins: {
    wholesaleMarginPerUnit: string;
    wholesaleMarginPercent: string;
    retailMarginPerUnit: string;
    retailMarginPercent: string;
    wholesaleMarkup: string;
    retailMarkup: string;
    endBuyerMarginPerUnit: string;
    endBuyerMarginPercent: string;
  };
  container: {
    totalCost: string;
    wholesaleRevenue: string;
    retailRevenue: string;
    wholesaleProfit: string;
    retailProfit: string;
    wholesaleROI: string;
    retailROI: string;
  };
}

export function calculateUnitEconomics(input: UnitEconomicsInput): UnitEconomicsResult;
```

### Zod Validation Schema

```typescript
const unitEconomicsSchema = z.object({
  unitCostOrigin: z.number().positive().max(10000),
  unitsPerContainer: z.number().int().positive().max(2000000),
  containerShippingCost: z.number().positive().max(50000),
  dutyRate: z.number().min(0).max(1),
  insuranceRate: z.number().min(0).max(0.05),
  customsBrokerFee: z.number().min(0).max(2000),
  inlandFreight: z.number().min(0).max(10000),
  fulfillmentCostPerUnit: z.number().min(0).max(50),
  wholesalePrice: z.number().min(0),
  retailPrice: z.number().min(0),
});
```

### State Management

- `nuqs` for URL-synced state (primary)
- Local `useState` for transient UI state (which result tab is active, etc.)
- No Zustand needed unless scenario comparison is built

---

## 8. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-02-01 | All 10 inputs render with correct defaults | Load page, verify pre-populated values |
| AC-02-02 | Changing any input recalculates all outputs within 100ms | Adjust input, measure re-render time |
| AC-02-03 | Per-unit costs sum exactly to total landed cost (no floating-point drift) | Verify with decimal.js: sum of components === total |
| AC-02-04 | Container profit = (wholesale price - landed cost) * units per container | Hand-calculate and compare |
| AC-02-05 | URL updates when inputs change; visiting URL restores inputs | Copy URL, open in new tab, verify inputs match |
| AC-02-06 | Negative margin triggers warning message | Set wholesale < landed cost, verify warning |
| AC-02-07 | PDF export generates valid PDF with all calculator data | Click export, open PDF, verify content |
| AC-02-08 | All currency values display with "$" prefix and correct decimal places | Visual inspection |
| AC-02-09 | All percentage values display with "%" suffix | Visual inspection |
| AC-02-10 | Works on mobile (375px) -- inputs and results accessible | DevTools responsive mode |
| AC-02-11 | Weight-limited container scenario shows realistic numbers | Set units to 20,000 (dense goods), verify container profit is lower |

---

## 9. Dependencies

| Dependency | Type | PRD |
|-----------|------|-----|
| HTS duty rate feed | Optional input | PRD-07 ("Use this rate" button) |
| Landing page calculator demo | Reuses calculation logic | PRD-01 |
| FTZ Analyzer | Can compare with FTZ-adjusted landed cost | PRD-03 |
| PDF export API route | Server-side generation | Shared infrastructure |

---

## 10. Known Pitfalls (from PITFALLS.md)

| Pitfall | Relevance | Mitigation |
|---------|-----------|------------|
| Pitfall 1: Floating-point arithmetic | ALL calculations on this page | Use decimal.js for every arithmetic operation. Unit tests with hand-verified results. |
| Pitfall 3: Weight limits | Units per container may be unrealistic for dense goods | Add a helper tooltip: "For dense goods (frozen food, liquids), typical units are 10,000-30,000 per container" |
| Pitfall 8: Currency conversion | Origin costs may be in VND/THB | Phase 1: all inputs in USD. Phase 2: add currency selector with conversion. |
| Pitfall 9: Incoterms confusion | Users may not know if their price is FOB/CIF/DDP | Label the unit cost input as "FOB Origin Price" with a tooltip explaining FOB. Phase 2: add Incoterm selector. |
| Pitfall 12: Missing units | Every number on this page | Every displayed value has a unit: $, %, x (markup), units |

---

## 11. Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Unit cost = $0 | All cost components = $0, margin = 100%, show info message |
| Units per container = 1 | Per-unit shipping = full container cost, brokerage = full fee |
| Duty rate = 0% | Duty line shows $0.00, still included in breakdown table |
| Wholesale price < landed cost | Negative margin highlighted in red with warning |
| Retail price = $0 | Retail margin section shows "N/A" |
| Very large units (2M) | Per-unit costs very small -- display 4+ decimal places |
| Very high duty (100%) | Duty dominates cost breakdown -- chart adjusts proportionally |
