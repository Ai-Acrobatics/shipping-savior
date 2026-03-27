# Domain Pitfalls: International Shipping/Logistics Platform

**Domain:** International freight/cold chain logistics analysis platform
**Researched:** 2026-03-26

---

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Floating-Point Arithmetic in Financial Calculations

**What goes wrong:** Using JavaScript native numbers for duty/tariff calculations produces rounding errors. $0.10 * 50000 units * 6.5% duty rate can drift by pennies, which compounds across containers and shipments.
**Why it happens:** JavaScript floats are IEEE 754 doubles. 0.1 + 0.2 !== 0.3.
**Consequences:** Incorrect landed cost calculations. Duty estimates off by dollars on large shipments. Loss of credibility with logistics professionals who verify numbers manually.
**Prevention:** Use `decimal.js` for ALL financial arithmetic. Never use native `*`, `/`, `+`, `-` for money. Format output with `currency.js`.
**Detection:** Unit tests that verify calculations against hand-computed examples with known exact results.

### Pitfall 2: Stale Tariff Data Presented as Current

**What goes wrong:** HTS duty rates change. Section 301 tariffs on China/SE Asia products shift with policy. Using a downloaded dataset from 6 months ago without indicating the date makes the tool unreliable.
**Why it happens:** HTS data is downloaded once and forgotten. No update mechanism or date display.
**Consequences:** Users make business decisions based on outdated duty rates. Legal/compliance risk if used for actual import cost planning.
**Prevention:**
  1. Always display the HTS dataset date prominently (e.g., "HTS rates as of March 2026")
  2. Add a disclaimer: "For informational purposes only. Verify current rates at hts.usitc.gov"
  3. Build a data refresh script that re-downloads from USITC periodically
**Detection:** Compare displayed rates against current USITC website spot-checks.

### Pitfall 3: Treating Container Weight Limits as Optional

**What goes wrong:** Container utilization calculator only considers volume (cubic capacity) and ignores weight limits. A 40ft container holds 67.7 CBM but has a ~28,000 kg payload limit. Dense goods (liquids, metals, frozen foods) hit weight limits long before volume limits.
**Why it happens:** Developers think of containers as "boxes" and calculate how many product boxes fit.
**Consequences:** Calculator shows 50,000 units per container when weight limit allows only 20,000. Shipping costs per unit are underestimated by 2.5x.
**Prevention:** Always calculate BOTH volume utilization AND weight utilization, then use the LOWER number. Display both limits clearly.
**Detection:** Test with dense product scenarios (e.g., frozen seafood at ~1000 kg/CBM).

### Pitfall 4: Ignoring Transshipment in Route Comparisons

**What goes wrong:** Showing "Ho Chi Minh City -> Long Beach: 18 days" without mentioning that most services transship in Singapore or Busan, adding 3-7 days and risk.
**Why it happens:** Simplified route data that only shows origin and destination ports.
**Consequences:** Transit time estimates are wrong. Users do not understand the real routing. Competitive comparisons are misleading.
**Prevention:** Route data must include transshipment ports. Display them on the map and in the comparison table. Direct vs. transshipment should be a filterable attribute.
**Detection:** Verify sample routes against actual carrier schedule pages.

---

## Moderate Pitfalls

Mistakes that cause delays or technical debt.

### Pitfall 5: Map Performance with Many Routes

**What goes wrong:** Rendering 50+ shipping routes with deck.gl ArcLayer without optimization causes frame drops on mid-range devices.
**Prevention:**
  - Use `pickable: false` on layers that do not need click interaction
  - Implement level-of-detail: show fewer routes when zoomed out, all routes when zoomed in
  - Use `getFilterValue` + `filterRange` on deck.gl layers for GPU-side filtering
  - Pre-compute searoute-js polylines at build time, not on every render

### Pitfall 6: HTS Code Format Inconsistency

**What goes wrong:** HTS codes have multiple formats: "6402.99.40", "6402994040", "6402.99.4000". Different data sources use different formats. Search fails because format does not match.
**Prevention:** Normalize all HTS codes to a canonical format (digits only, 10 characters) on import. Search should strip dots and match partial codes. Display should always include dots for readability.

### Pitfall 7: PDF Generation Timeout on Vercel

**What goes wrong:** Complex PDFs (multi-page landed cost reports with charts) take >10 seconds to generate, hitting Vercel's serverless function timeout.
**Prevention:**
  - Keep PDFs simple in Phase 1 (tables and text, no embedded charts)
  - For chart images in PDFs, pre-render charts as static images and embed them
  - If timeouts persist, use Vercel's Pro plan (60s timeout) or offload to background job

### Pitfall 8: Currency Conversion Complexity

**What goes wrong:** Origin costs are in VND/THB/IDR, shipping in USD, duties calculated on USD value. Converting between currencies at different stages introduces errors and confusion.
**Prevention:**
  - Establish a clear "base currency" (USD) for all calculations
  - Convert origin costs to USD as the FIRST step
  - Display conversions transparently with exchange rate and date used
  - Store exchange rate used so calculations are reproducible

### Pitfall 9: Confusing FOB, CIF, and DDP Incoterms

**What goes wrong:** Landed cost calculator does not specify which Incoterm applies. Different Incoterms determine who pays for what -- insurance, freight, duties all shift between buyer and seller.
**Prevention:**
  - Make Incoterm selection explicit in the calculator UI
  - Default to FOB (most common for SE Asia exports) but allow CIF, DDP
  - Show a tooltip explaining what each Incoterm includes/excludes
  - Adjust which cost line items are editable based on Incoterm selection

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable.

### Pitfall 10: Map Projection Distortion

**What goes wrong:** Mercator projection makes shipping routes across the Pacific look unrealistically long. Great circle routes appear as straight lines when they should curve.
**Prevention:** deck.gl ArcLayer handles great circle arcs natively with the `greatCircle: true` option. Use it.

### Pitfall 11: Overloading the Dashboard

**What goes wrong:** Putting all calculators and the map on one page creates cognitive overload and performance issues.
**Prevention:** Separate tools into individual pages (`/tools/landed-cost`, `/tools/container-calc`, etc.) with a navigation sidebar. Use the main dashboard page for high-level overview/KPIs only.

### Pitfall 12: Missing Units and Labels

**What goes wrong:** Numbers displayed without context. Is "3,500" in USD or VND? Is "18" days or hours? Is "67.7" cubic meters or cubic feet?
**Prevention:** Every displayed number must have a unit label. Use `currency.js` for money formatting. Use `convert-units` for physical measurements. Never display a bare number.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Data collection (HTS, ports, routes) | HTS dataset is large (~100K entries), may slow build | Lazy-load the search index. Do not import full dataset in page bundle. |
| Calculator engine | Floating point math | Use decimal.js from day one. Write tests first. |
| Map visualization | searoute-js low adoption, may have bugs | Test with 10+ real port pairs before committing. Have Searoutes API as fallback. |
| FTZ analyzer | FTZ regulations are complex and state-specific | Scope to federal FTZ benefits only. Add state-specific detail later. |
| PDF generation | Vercel timeout for complex reports | Start with simple table-based PDFs. Add complexity incrementally. |
| Container calculator | Weight vs. volume limit confusion | Always show both utilization percentages. Use the limiting factor. |
| Route comparison | Carrier data accuracy | Cross-reference 3+ carrier schedule pages for each route. Note data date. |
| Cold chain features | Reefer costs vary wildly by season and route | Present ranges, not exact numbers. Add "premium over dry container" as a percentage. |
