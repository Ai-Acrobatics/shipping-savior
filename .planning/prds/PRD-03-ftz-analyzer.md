# PRD-03: FTZ Savings Analyzer

**Status:** Draft
**Priority:** P0 (Key differentiator)
**Route:** `/tools/ftz-analyzer`
**Last Updated:** 2026-03-26

---

## 1. Overview & Purpose

The FTZ (Foreign Trade Zone) Savings Analyzer models the financial advantage of importing goods through an FTZ versus standard customs entry. FTZs lock duty rates on the date of entry, allow incremental withdrawal (pay duties only on goods removed from the zone), and calculate duties on FOB origin value rather than US retail value.

This tool is the platform's primary differentiator. Most logistics tools ignore FTZ strategy entirely. The analyzer must make the savings concrete and visually compelling while being scrupulously accurate about regulatory limitations.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|------------|
| US-03-01 | Importer | Compare my duty costs with and without an FTZ | I can quantify the FTZ benefit in dollars |
| US-03-02 | Importer | Model a tariff increase scenario | I can see how FTZ duty-locking protects me |
| US-03-03 | Importer | Plan an incremental withdrawal schedule | I can optimize cash flow by paying duties only when I withdraw goods |
| US-03-04 | Importer | See cumulative savings over time | I understand the compounding FTZ benefit |
| US-03-05 | Investor | See a clear savings visualization | I can evaluate the FTZ strategy's financial impact |
| US-03-06 | Importer | Understand PF vs NPF status implications | I can make informed zone status elections |

---

## 3. Functional Requirements

### 3.1 Input Panel

| Input | Type | Default | Validation | Notes |
|-------|------|---------|------------|-------|
| Unit Value (FOB) | Currency input | $0.10 | > 0 | Origin cost per unit |
| Total Units | Number input | 500,000 | > 0, max 5,000,000 | Total units entering FTZ |
| Locked Duty Rate (FTZ Entry) | Percentage | 6.5% | 0-100% | Rate on the date goods enter FTZ |
| Current/Future Duty Rate | Percentage | 12.0% | 0-100% | Rate if importing without FTZ (or after tariff increase) |
| Monthly Storage Cost per Unit | Currency input | $0.01 | >= 0 | FTZ warehousing cost |
| Withdrawal Frequency | Select | Monthly | Weekly / Biweekly / Monthly / Quarterly | How often goods are removed from FTZ |
| Units per Withdrawal | Number input | 50,000 | > 0 | Number of units withdrawn each period |
| Analysis Duration (Months) | Number input | 12 | 1-60 | How long to model |
| Zone Status | Select | NPF | PF (Privileged Foreign) / NPF (Non-Privileged Foreign) | Affects how duty is calculated |

### 3.2 Output Panel

#### 3.2.1 Savings Summary Card

Top-level metrics displayed prominently:

| Metric | Example Value |
|--------|-------------|
| Total Duty (Without FTZ) | $6,000 |
| Total Duty (With FTZ) | $3,250 |
| Total Savings | $2,750 |
| Savings Percentage | 45.8% |
| Net Savings (after storage costs) | $2,150 |
| Break-Even Storage Duration | 8.2 months |

#### 3.2.2 Withdrawal Timeline Table

| Period | Units Withdrawn | Duty (No FTZ) | Duty (FTZ) | Savings | Cumulative Savings | Storage Cost |
|--------|----------------|---------------|------------|---------|-------------------|--------------|
| Month 1 | 50,000 | $600 | $325 | $275 | $275 | $50 |
| Month 2 | 50,000 | $600 | $325 | $275 | $550 | $45 |
| ... | ... | ... | ... | ... | ... | ... |

- Scrollable table if duration > 12 months
- Sortable columns via @tanstack/react-table

#### 3.2.3 Cumulative Savings Chart

- Line chart (Recharts) with two lines:
  - Cumulative duty paid WITHOUT FTZ
  - Cumulative duty paid WITH FTZ
- Shaded area between the two lines represents savings
- X-axis: time periods (months)
- Y-axis: cumulative duty in USD
- Tooltip on hover showing exact values per period

#### 3.2.4 Cash Flow Impact Chart

- Bar chart showing per-period cash flow comparison
- Without FTZ: full duty paid upfront on entire shipment at customs
- With FTZ: duty paid incrementally on each withdrawal
- Demonstrates the cash flow advantage of incremental withdrawal

#### 3.2.5 Duty Rate Comparison Visual

- Side-by-side or before/after visualization
- Shows locked rate vs. current rate with percentage difference
- If rates are equal, shows message: "No rate differential -- FTZ cash flow benefits still apply"

### 3.3 Business Rules

- **Duty locking:** The FTZ duty rate is locked on the date goods are admitted to the zone. Future tariff increases do not affect goods already in the zone.
- **Incremental withdrawal:** Duties are owed only on goods physically removed from the FTZ. Goods remaining in the zone owe no duty.
- **Duty base:** Duties are calculated on the FOB value at origin, NOT the US market value.
- **PF Status (Privileged Foreign):** Locks the tariff classification AND rate at time of admission. Best when rates might increase.
- **NPF Status (Non-Privileged Foreign):** Allows choosing the lower of the rate at admission or withdrawal. Best when rates might decrease.
- **Zone status election is irrevocable** for that admission of goods. Cannot switch PF/NPF after election.
- **Storage costs offset savings:** If goods sit too long, storage costs may exceed duty savings. Show break-even point.

### 3.4 Compliance Warnings & Disclaimers

Required on this page (non-negotiable):

1. **Top banner disclaimer:** "This tool is for informational and educational purposes only. It does not constitute legal, customs, or trade compliance advice."
2. **PF/NPF election warning:** "Zone status elections (PF/NPF) are irrevocable once made. Consult a licensed customs broker before making an election."
3. **Tariff policy notice:** "Tariff rates are subject to change by executive order, legislation, or trade agreements. Past rates do not guarantee future rates."
4. **April 2025 executive order reference:** Note that recent executive orders have significantly altered duty rates for SE Asian imports. Data may not reflect the latest changes.
5. **Footer link:** "For current tariff rates, visit hts.usitc.gov"

### 3.5 URL State Sync

- All inputs synced to URL via `nuqs`
- Shareable calculations via URL

---

## 4. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Calculation latency | < 100ms for full timeline generation | Client-side with decimal.js |
| Chart rendering | < 200ms after calculation | Recharts with animation disabled for instant updates |
| Accessibility | WCAG 2.1 AA | Timeline table readable by screen readers |
| Responsive | 375px - 2560px | Charts resize, table scrolls horizontally on mobile |
| Print | Clean print layout | Charts render as static images in print |

---

## 5. Data Requirements

- No external API calls
- Duty rates: user-inputted (can be pre-populated from PRD-07 HTS Lookup)
- FTZ storage costs: user-inputted with default based on typical US FTZ rates
- FTZ location data: referenced from `/data/ftz-locations.json` (for context, not calculation)

---

## 6. UI/UX Specifications

- **Layout:** Input panel on left, results on right (desktop). Stacked on mobile.
- **Savings emphasis:** The savings number should be the largest, most prominent element. Use green color and large font.
- **Rate comparison:** Use a visual "gauge" or comparison bar showing locked vs. current rate
- **Timeline chart:** Full-width below the summary cards
- **Disclaimer styling:** Visible but not overwhelming. Use a subtle info-blue banner at the top, not a red warning. Full disclaimer in a collapsible section at the bottom.
- **PF/NPF selector:** Radio buttons with inline explanations, not just labels
- **Warning states:**
  - If locked rate >= current rate: "No rate advantage from FTZ duty locking. Consider NPF status for flexibility."
  - If storage costs > savings: "Warning: Storage costs exceed duty savings at this duration."
  - If withdrawal exceeds remaining units: "All units will be withdrawn by month X."

---

## 7. Technical Implementation Notes

### Component Breakdown

```
app/tools/ftz-analyzer/page.tsx          # Server component
components/calculators/
  FTZAnalyzer.tsx                        # Client component - main
  FTZInputs.tsx                          # Client component - input form
  FTZSavingsSummary.tsx                  # Client component - top cards
  FTZWithdrawalTimeline.tsx              # Client component - table
  FTZCumulativeChart.tsx                 # Client component - line chart
  FTZCashFlowChart.tsx                   # Client component - bar chart
  FTZDutyComparison.tsx                  # Client component - rate visual
  FTZDisclaimer.tsx                      # Server component - legal text
lib/calculators/
  ftz-savings.ts                         # Pure calculation function
```

### Calculator Function Signature

```typescript
// lib/calculators/ftz-savings.ts
export interface FTZInput {
  unitValueFOB: number;
  totalUnits: number;
  lockedDutyRate: number;    // decimal (0.065 = 6.5%)
  currentDutyRate: number;   // decimal
  monthlyStorageCostPerUnit: number;
  withdrawalFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  unitsPerWithdrawal: number;
  analysisDurationMonths: number;
  zoneStatus: 'PF' | 'NPF';
}

export interface FTZPeriod {
  period: number;
  periodLabel: string;
  unitsWithdrawn: number;
  unitsRemaining: number;
  dutyWithoutFTZ: string;
  dutyWithFTZ: string;
  periodSavings: string;
  cumulativeSavings: string;
  storageCost: string;
  netSavings: string;
}

export interface FTZResult {
  summary: {
    totalDutyWithoutFTZ: string;
    totalDutyWithFTZ: string;
    totalSavings: string;
    savingsPercentage: string;
    totalStorageCost: string;
    netSavings: string;
    breakEvenMonths: string | null;  // null if storage never exceeds savings
  };
  timeline: FTZPeriod[];
  effectiveDutyRate: string;  // for NPF: min(locked, current)
}

export function calculateFTZSavings(input: FTZInput): FTZResult;
```

### NPF Logic

For NPF status, the effective duty rate at each withdrawal is `Math.min(lockedRate, currentRate)`. This means:
- If tariffs go UP after FTZ entry: importer pays the lower locked rate (benefit)
- If tariffs go DOWN after FTZ entry: importer pays the lower current rate (flexibility)
- For PF status: always uses the locked rate regardless

---

## 8. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-03-01 | Savings summary shows correct difference between FTZ and non-FTZ duty | Hand-calculate: totalUnits * unitValue * (currentRate - lockedRate) |
| AC-03-02 | Timeline periods sum to total savings | Sum all periodSavings, compare to summary.totalSavings |
| AC-03-03 | Units remaining decreases correctly each period and never goes negative | Inspect last periods in timeline |
| AC-03-04 | NPF status uses min(locked, current) rate | Set current < locked, verify FTZ duty uses current rate |
| AC-03-05 | PF status always uses locked rate | Set current < locked, verify FTZ duty still uses locked rate |
| AC-03-06 | Break-even calculation is correct | Storage cumulative = savings cumulative at that month |
| AC-03-07 | All disclaimers are present and visible | Visual inspection |
| AC-03-08 | Charts render and update on input change | Adjust inputs, verify charts redraw |
| AC-03-09 | URL state sync works | Copy URL, open new tab, verify inputs match |
| AC-03-10 | Warning shown when storage > savings | Set high storage cost or long duration, verify warning |
| AC-03-11 | All monetary values use decimal.js | Code review |

---

## 9. Dependencies

| Dependency | Type | PRD |
|-----------|------|-----|
| HTS duty rate lookup | Optional input feed | PRD-07 |
| Unit economics calculator | Shares unit cost inputs | PRD-02 |
| FTZ location data | Context display | PRD-05 (map) |
| Landing page FTZ section | Summary content | PRD-01 |

---

## 10. Known Pitfalls (from PITFALLS.md)

| Pitfall | Relevance | Mitigation |
|---------|-----------|------------|
| Pitfall 1: Floating-point arithmetic | Duty calculations must be exact | decimal.js for all math |
| Pitfall 2: Stale tariff data | Duty rates change with policy | Display prominent "as of [date]" notice; link to official source |
| Pitfall 12: Missing units | All displayed values | Every number labeled with $, %, units, months |
| Phase warning: FTZ regulations complex | FTZ rules vary by zone | Scope to federal FTZ benefits only; disclaimer about state-specific rules |
