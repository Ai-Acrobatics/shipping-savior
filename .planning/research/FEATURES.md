# Feature Landscape: International Shipping/Logistics Platform

**Domain:** International freight/cold chain logistics analysis and proposal platform
**Researched:** 2026-03-26

---

## Table Stakes

Features users expect from any logistics analysis/proposal platform. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Landed Cost Calculator | Core value prop — everyone in import/export needs this | Medium | Unit cost + shipping + duties + insurance + fulfillment. Must handle multi-currency. |
| HTS Code Lookup | Required to determine duty rates | Medium | Fuzzy search across 100K+ entries. Must show duty rate, unit of quantity, special program rates. |
| Duty/Tariff Rate Display | Foundation for all cost calculations | Low | Rates by HTS code + country of origin. SE Asia focus (VN, TH, ID, KH). |
| Container Utilization Calculator | Standard logistics planning tool | Low | Units per 20ft/40ft/40ft HC/reefer by product dimensions + weight limits. |
| Unit Economics Breakdown | Shows the value chain clearly | Low | Origin cost -> landed cost -> wholesale -> retail with margins at each step. |
| Route/Carrier Comparison Table | Users expect to compare options | Medium | Transit time, cost, transshipment points, reliability for major routes. |
| Interactive Shipping Route Map | Visual context for route decisions | Medium | Show origin -> transshipment -> destination with ports labeled. |
| Responsive Dashboard Layout | Modern web expectation | Low | Works on tablet (client meetings) and desktop. |
| PDF Export/Reports | Business deliverable | Medium | Landed cost reports, comparison summaries, proposal documents. |
| Data Tables with Sort/Filter | Expected for any data-heavy tool | Low | HTS lookup results, route comparisons, carrier schedules. |

## Differentiators

Features that set this platform apart. Not expected, but high-value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| FTZ Savings Analyzer | Few tools show FTZ vs non-FTZ comparison with real numbers | High | Duty-locked vs. current rates, incremental withdrawal modeling, break-even analysis. Requires FTZ regulation knowledge. |
| Animated Route Visualization | Makes proposals visually compelling | Medium | deck.gl TripsLayer showing goods moving along sea routes. Client presentation differentiator. |
| Tariff Scenario Modeling | "What if tariffs change?" analysis | Medium | Model duty rate changes on landed cost. Especially relevant with shifting trade policy. |
| Cold Chain Cost Overlay | Specific to cold chain logistics | Medium | Reefer container premiums, temperature monitoring costs, spoilage risk factors. |
| Bill of Lading Document Generator | Saves time in actual operations | High | Template-based BOL with shipper/consignee/cargo details. PDF output. |
| Vessel Schedule Aggregator | Consolidates info from multiple carriers | High | Unified view of Maersk/MSC/CMA CGM schedules for specific port pairs. |
| Port Comparison Tool | Beyond just routes — compare ports themselves | Medium | Port fees, dwell time, congestion data, FTZ proximity for major US ports. |
| Multi-Scenario Comparison | Side-by-side "Scenario A vs B vs C" | Medium | Compare different sourcing countries, routes, or FTZ strategies. |

## Anti-Features

Features to explicitly NOT build. Common mistakes in logistics platforms.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Live API integrations in Phase 1 | Expensive, fragile, unnecessary for proposal tool. AIS APIs cost $100+/mo, carrier APIs need partnership agreements. | Use curated static datasets that represent real-world data. Add live integrations in later phases. |
| Full TMS (Transportation Management System) | Scope creep. TMS is a multi-year, multi-million dollar product category. | Build focused analysis/calculator tools. Not an operational system. |
| Real-time booking/quoting | Requires carrier partnerships, payment processing, compliance — massive scope. | Display rate comparisons from researched data. Link to carrier booking pages. |
| User authentication system (Phase 1) | Adds complexity without value for a proposal/analysis platform. | Build as public tools or simple password protection if needed. Add auth when multi-tenant features are needed. |
| Customs broker workflow | Regulated activity (licensed customs brokers). Compliance risk. | Provide educational duty/tariff information with clear disclaimers. |
| Warehouse Management features | Different product category entirely. | Focus on transit/import analysis. Reference WMS integrations as future possibility. |
| Complex pricing/subscription model | Premature monetization distracts from building value. | Focus on making the tools genuinely useful. Monetization decisions come later. |

## Feature Dependencies

```
HTS Code Lookup
  -> Duty/Tariff Rate Display (needs HTS codes to show rates)
  -> Landed Cost Calculator (needs duty rates as input)
     -> Unit Economics Breakdown (needs landed cost as input)
     -> FTZ Savings Analyzer (compares FTZ vs non-FTZ landed costs)
     -> Tariff Scenario Modeling (varies duty rates, recalculates landed cost)

Port Data (coordinates, names, codes)
  -> Shipping Route Map (needs port locations)
  -> Route/Carrier Comparison (needs port pairs)
  -> Vessel Schedule Display (organized by port pairs)

Container Specs (dimensions, weight limits)
  -> Container Utilization Calculator
  -> Shipping Cost Calculation (cost per container -> cost per unit)

All Calculators
  -> PDF Export (generates reports from calculator outputs)
  -> Multi-Scenario Comparison (runs calculators with different inputs)
```

## MVP Recommendation

For MVP, prioritize:

1. **Landed Cost Calculator** — Core value, touches all other features
2. **HTS Code Lookup + Duty Rates** — Foundation data layer
3. **Unit Economics Breakdown** — Tells the business story (origin to retail)
4. **Container Utilization Calculator** — Simple, high-value, standalone
5. **Interactive Route Map** — Visual anchor for the platform
6. **FTZ Savings Analyzer** — Key differentiator, unique value

Defer to post-MVP:
- **Vessel Schedule Aggregator**: Requires carrier API partnerships or complex scraping
- **Bill of Lading Generator**: Operational tool, not analysis tool
- **Live vessel tracking**: Requires paid AIS APIs
- **Cold Chain Cost Overlay**: Specialized layer that can be added to existing calculators later
