# Workflow-Based User Journey Maps — Shipping Savior

**Linear:** AI-5447
**Version:** 1.0
**Date:** 2026-03-26
**Companion doc:** `USER-JOURNEY-MAPS.md` (persona-based journeys, AI-5420)

---

## Overview

This document maps **six primary workflows** end-to-end across all personas. Where the companion persona-based journey maps show how each user type experiences the platform, these workflow maps show how each **workflow** progresses from trigger to completion — regardless of which persona initiates it.

Each workflow includes:
- Step-by-step flow with decision points
- Screens/pages visited at each step
- Data inputs and outputs at each step
- Error states and recovery paths
- Time estimates per step
- Success metrics

### Workflow Index

| # | Workflow | Primary Trigger | Personas | Estimated Duration |
|---|---------|----------------|----------|-------------------|
| 1 | [Onboarding](#1-onboarding) | First visit / signup | All | 4-8 min |
| 2 | [Freight Quote](#2-freight-quote) | Need landed cost / route comparison | Importer, Broker | 6-15 min |
| 3 | [Import Workflow](#3-import-workflow) | Container booked | Importer, Broker | 14-35 days (lifecycle) |
| 4 | [FTZ Strategy](#4-ftz-strategy) | Duty optimization inquiry | Broker, FTZ Operator | 10-25 min |
| 5 | [Daily Dashboard](#5-daily-dashboard) | Morning login | Broker, FTZ Operator | 10-20 min |
| 6 | [AI Agent Interaction](#6-ai-agent-interaction) | Question or classification need | All | 1-5 min |

---

## 1. Onboarding

**Trigger:** User discovers Shipping Savior via search, referral, or ad.
**Goal:** Account created, profile configured, first calculation completed, "aha moment" reached.
**Exit criteria:** User has saved at least one calculation and understands their primary tool.

### Flow Diagram

```
[Google/Referral] → [Landing Page /] → [Try Calculator (anonymous)]
        ↓                                        ↓
  Scan hero section              Enter first calculation (no account needed)
        ↓                                        ↓
                         ← ← ← ← ← ←  See 15-component cost breakdown ← AHA MOMENT
                                                 ↓
                                    [Decision] Save results?
                                   /                        \
                              Yes                           No (continue anonymous)
                               ↓                                 ↓
                     [Register /auth/register]         localStorage persists
                               ↓                       (lost on tab close)
                     [Role Selection /onboarding/role]
                               ↓
                     [Profile Setup /onboarding/profile]
                               ↓
                     [Goal Selection /onboarding/goals]
                               ↓
                     [Optional Data Import /onboarding/import]
                               ↓
                     [Interactive Tour /onboarding/tour]
                               ↓
                     [Personalized Dashboard /dashboard]
                               ↓
                     [Complete first checklist item]
```

### Step-by-Step Detail

| Step | Route | Action | Inputs | Outputs | Time Est. | Error State |
|------|-------|--------|--------|---------|-----------|-------------|
| 1 | `/` | Land on homepage | — | Hero section with calculator preview | 5s | Slow load → skeleton UI, retry |
| 2 | `/` | Scroll to embedded calculator | — | Pre-filled example visible | 10s | — |
| 3 | `/` | Enter first calculation | FOB cost, quantity, container type | Real-time validation, green checkmarks | 30-60s | Invalid input → inline error, suggest range |
| 4 | `/` | Enter freight estimate | Freight cost per container | Added to cost model | 15s | — |
| 5 | `/` | **Decision:** Know duty rate? | — | — | — | — |
| 5a | `/tools/hts-lookup` | If no → HTS lookup | Product description (plain English) | 3 HTS code options with confidence scores | 30-45s | No results → refine description / browse chapters / request review |
| 5b | `/` | If yes → enter duty rate manually | Duty rate % | Validated against HTS range | 10s | Rate outside expected range → warning tooltip |
| 6 | `/` | Review 15-component cost breakdown | — | Per-unit landed cost, margin analysis, fee explanations | 30s | **AHA MOMENT** — user sees fees they didn't know existed |
| 7 | `/` | Hover fee tooltips | — | Plain-English fee explanations (MPF, HMF, ISF, etc.) | 15s | — |
| 8 | `/` | **Decision:** Save results? | — | — | — | — |
| 8a | `/auth/register` | If yes → register | Email, password, company name (optional) | Account created, localStorage calculations migrated | 45-60s | Duplicate email → "Account exists, sign in" |
| 8b | `/` | If no → continue anonymous | — | localStorage persistence, bottom banner: "Calculations lost on tab close" | — | — |
| 9 | `/onboarding/role` | Select role | "Importer" / "Freight Broker" / "FTZ Manager" / "Other" | Persona type stored, UI tailored | 10s | — |
| 10 | `/onboarding/profile` | Enter profile details | Products, countries of origin, annual volume, shipments/month | Default HTS chapters, common routes, regulatory flags pre-configured | 30-45s | Skip allowed → generic defaults |
| 11 | `/onboarding/goals` | Select top 3 goals | From: landed cost, tracking, duty strategy, proposals, FTZ ops | Dashboard widget prioritization, sidebar order | 15s | Must select at least 1 |
| 12 | `/onboarding/import` | Optional data import | CSV/XLSX of past shipments OR skip | Shipment history created or blank slate | 0-60s | Parse error → show failed rows, allow manual correction |
| 13 | `/onboarding/tour` | Interactive feature tour | — | 5 highlight tooltips (persona-tailored), each with "Try it" CTA | 60-90s | Dismissible at any point |
| 14 | `/dashboard` | Land on personalized dashboard | — | Layout matches persona + goals; "Getting Started" checklist (5 items) | 5s | — |
| 15 | `/dashboard` | Complete first checklist item | Varies (e.g., "Run your first calculation") | Checklist progress 1/5, micro-animation, encouragement copy | 30-60s | — |

### Decision Points

| Decision | Options | Routing Logic | Default |
|----------|---------|---------------|---------|
| Know duty rate? | Yes → manual entry / No → HTS lookup | User clicks "Don't know? Look up HTS code" link | Show HTS lookup CTA prominently |
| Save results? | Yes → register / No → continue | Soft prompt after 2nd calculation; hard prompt on "Save" click | Dismiss = continue anonymous |
| Role selection | Importer / Broker / FTZ Manager / Other | Determines dashboard layout, onboarding tour content, default tools | Importer (most common) |
| Import data? | Upload CSV / Connect portal / Skip | All optional; skip = blank slate | Skip |

### Error States & Recovery

| Error | Trigger | User-Facing Message | Recovery |
|-------|---------|---------------------|----------|
| HTS classification fails | No results above 40% confidence | "We couldn't confidently classify this product." | Refine description / Browse chapters / Request manual review |
| Registration email taken | Existing account | "An account with this email already exists." | Link to sign-in page with email pre-filled |
| CSV import parse error | Malformed spreadsheet | "We couldn't read rows 5, 12, 18." | Show failed rows, allow edit or skip |
| Onboarding tour skipped | User clicks "Skip Tour" | — | Tour accessible later from Help menu |
| Calculator input out of range | e.g., $0 FOB, 0 units | Inline validation: "FOB cost must be greater than $0" | Field highlights red, tooltip with expected range |

### Time Estimates

| Phase | Duration | Notes |
|-------|----------|-------|
| Anonymous exploration | 2-4 min | First calculation to aha moment |
| Registration | 45-60s | Email + password |
| Onboarding wizard | 2-3 min | Role + profile + goals + tour |
| First checklist item | 30-60s | Confirms core tool understanding |
| **Total to aha moment** | **3-5 min** | Before registration |
| **Total to dashboard** | **5-8 min** | Including registration + onboarding |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to first calculation | < 2 min | Analytics: page load → first result rendered |
| Anonymous → registered conversion | > 25% | Registrations / unique visitors |
| Onboarding completion rate | > 70% | Users completing all wizard steps / registrations |
| Checklist item 1 completion | > 60% | Within first session |
| 7-day retention | > 40% | Return visit within 7 days of registration |
| Aha moment proxy | > 80% see full breakdown | Users who view 15-component cost breakdown / first calc |

---

## 2. Freight Quote

**Trigger:** User needs to determine total landed cost for a product/shipment and optionally compare routes.
**Goal:** Accurate landed cost calculated, routes compared, results saved or exported as PDF.
**Exit criteria:** User has a per-unit landed cost and/or a professional proposal document.

### Flow Diagram

```
[Dashboard or Homepage] → [Select calculation type]
                                   ↓
                     ┌─────────────┼─────────────┐
                     ↓             ↓             ↓
              Landed Cost    Unit Economics    Route Comparison
                     ↓             ↓             ↓
              [Enter product details: FOB, quantity, container]
                                   ↓
                     [Decision] Know HTS code / duty rate?
                    /                                      \
              Yes → enter rate                    No → HTS Lookup
                    \                                      /
                     ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
                                   ↓
              [Full 15-component calculation runs]
                                   ↓
                     [Decision] Compare scenarios?
                    /              |               \
             Add origin       Tariff slider      Compare carriers
                  ↓                ↓                    ↓
         Side-by-side       Scenario modeling    Route Comparison
              comparison           ↓                    ↓
                     ↓ ← ← ← ← ← ← ← ← ← ← ← ← ← ←
                                   ↓
                     [Decision] Check FTZ viability?
                    /                              \
              Yes → FTZ Analyzer                No → skip
                    ↓                              ↓
              FTZ recommendation         ← ← ← ← ←
                                   ↓
                     [Save / Export PDF / Send to client]
```

### Step-by-Step Detail

| Step | Route | Action | Inputs | Outputs | Time Est. | Error State |
|------|-------|--------|--------|---------|-----------|-------------|
| 1 | `/dashboard` | Click "New Calculation" or "New Quote" | — | Calculation type selector modal | 5s | — |
| 2 | `/tools/landed-cost` | Select calculation type | Landed Cost / Unit Economics / Route Comparison | Appropriate calculator loads | 5s | — |
| 3 | `/tools/landed-cost` | Enter product basics | FOB price/unit, quantity, container type (20ft/40ft/40HC) | Input validation, container capacity check | 30s | Quantity > container max → warning + suggest splitting |
| 4 | `/tools/landed-cost` | Enter freight details | Freight cost/container, insurance rate, drayage estimate | Added to cost model | 20s | Missing fields → defaults provided with "estimated" badge |
| 5 | `/tools/landed-cost` | **Decision:** Know HTS/duty rate? | — | — | — | — |
| 5a | `/tools/hts-lookup` | If no → search HTS | Product description | 3 HTS options with confidence, duty rates, Section 301/ADD/CVD flags | 30-45s | See AI Agent Interaction workflow |
| 5b | `/tools/landed-cost` | If yes → enter manually | HTS code or duty % | Validated against tariff database | 10s | Unknown HTS → "Code not found, check format" |
| 6 | `/tools/landed-cost` | Review full cost breakdown | — | 15-component table: FOB, freight, duty, MPF (0.3464%), HMF (0.125%), insurance, customs broker, ISF, drayage, handling, storage, warranty, returns, marketing, overhead | 30s | — |
| 7 | `/tools/landed-cost` | Explore fee tooltips | Hover/click any line item | Plain-English explanation + typical range | 15-30s | — |
| 8 | `/tools/landed-cost` | **Decision:** Compare scenarios? | — | — | — | — |
| 8a | `/tools/unit-economics` | Add comparison scenario | Second set of inputs (different origin/supplier/rate) | Side-by-side delta table, color-coded advantages | 60s | — |
| 8b | `/tools/landed-cost` | Tariff scenario slider | Drag to 5%/10%/25%/50% rate increase | Recalculated costs, margin impact banner | 15s | — |
| 8c | `/tools/route-comparison` | Compare carriers/routes | Origin port, destination port | 3 carrier options per route with cost, transit, reliability | 30s | No routes found → suggest nearby ports |
| 9 | `/tools/landed-cost` | **Decision:** Check FTZ viability? | — | — | — | — |
| 9a | `/tools/ftz-analyzer` | If yes → run FTZ analysis | Annual volume, storage duration, zone preference | FTZ savings projection, recommendation (viable/not viable), threshold for viability | 45-60s | See FTZ Strategy workflow |
| 10 | `/tools/landed-cost` | Save calculation | Scenario name | Saved to account with timestamp | 5s | Not logged in → prompt registration |
| 11 | `/tools/landed-cost` | Export PDF | — | Professional PDF: cover page, cost breakdown, route map, duty analysis, recommendation | 10-15s | PDF generation timeout → retry with simplified template |
| 12 | Email (off-platform) | Send to client/partner | — | — | — | — |

### Decision Points

| Decision | Options | Routing Logic | Default |
|----------|---------|---------------|---------|
| Calculation type | Landed Cost / Unit Economics / Route Comparison | User selects; Brokers default to Route Comparison, Importers to Landed Cost | Based on persona |
| Know HTS/duty? | Yes → manual / No → lookup | "Don't know?" link next to duty field | Show lookup CTA |
| Compare scenarios? | Add origin / tariff slider / carriers / skip | CTAs below result: "What if tariffs change?", "Compare routes", "Add scenario" | Show all CTAs |
| Check FTZ? | Yes → FTZ Analyzer / No → skip | CTA: "Could FTZ save you money?" appears if annual volume > 50K units | Show if plausible |
| Save or export? | Save / PDF / Both / Neither | Buttons below result | Save (logged in), PDF (broker persona) |

### Error States & Recovery

| Error | Trigger | User-Facing Message | Recovery |
|-------|---------|---------------------|----------|
| ADD/CVD detected | HTS + origin triggers antidumping flag | "ALERT: [HTS] from [country] subject to Antidumping Duty of X%-Y%." | Show alternative origins without ADD, link to detail |
| Section 301 applies | HTS on Section 301 list | "Additional 25% tariff applies to goods from [country]." | Include in calculation automatically, show in breakdown |
| Container overweight | Quantity × unit weight > container max | "Total weight exceeds [container type] limit by X kg." | Suggest splitting across containers, show cost delta |
| Route not found | No carrier data for origin-destination pair | "No direct routes found for this lane." | Suggest transshipment options or nearby ports |
| PDF generation fails | Timeout or rendering error | "Report generation is taking longer than expected." | Retry button, option to download CSV instead |

### Time Estimates

| Phase | Duration | Notes |
|-------|----------|-------|
| Enter basics + get result | 1-2 min | Core landed cost calculation |
| HTS lookup (if needed) | 30-60s | AI classification + selection |
| Scenario comparison | 1-3 min | Optional but common for brokers |
| FTZ check | 1-2 min | Optional, triggered by CTA |
| Save + export PDF | 15-30s | — |
| **Total (simple)** | **2-4 min** | Single origin, known HTS |
| **Total (full comparison)** | **8-15 min** | Multiple scenarios + routes + FTZ + PDF |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Calculation completion rate | > 85% | Finished calc / started calc |
| HTS lookup → rate transfer | > 70% | Users who complete HTS lookup and use the rate |
| Scenario comparison usage | > 40% | Users who add at least one comparison |
| PDF export rate (brokers) | > 60% | PDF downloads / broker calculations |
| Calculation saved | > 50% | Saved / completed (logged-in users) |
| Avg time to complete quote | < 10 min | For broker persona with full comparison |

---

## 3. Import Workflow

**Trigger:** User has a container booked and wants to track it from departure through customs clearance to delivery.
**Goal:** Full shipment lifecycle visibility with document management, compliance checking, and cost reconciliation.
**Exit criteria:** Container delivered, actual vs. estimated costs reconciled, insights captured.

### Flow Diagram

```
[Dashboard /dashboard] → [Add Shipment]
         ↓
[Enter BOL + Container #] → Auto-detect carrier
         ↓
[Enter origin/destination/ETA]
         ↓
[Shipment Created — Status: Booked]
         ↓
    ┌────┴────────────────────────────────────┐
    ↓                                         ↓
[Tracking Timeline]                   [Document Management]
    ↓                                         ↓
Gate Out → Vessel Loaded →          Upload Commercial Invoice
In Transit → At Port →              Upload Packing List
Customs Hold? → Released →          ISF compliance check
Picked Up → Delivered               Assemble document packet
    ↓                                         ↓
    └──────────────┬──────────────────────────┘
                   ↓
         [Cost Reconciliation]
                   ↓
         Actual vs. Estimated comparison
                   ↓
         Variance report + margin impact
                   ↓
         [Decision] Adjust future estimates?
                   ↓
         Update calculator defaults
```

### Step-by-Step Detail

| Step | Route | Action | Inputs | Outputs | Time Est. | Error State |
|------|-------|--------|--------|---------|-----------|-------------|
| 1 | `/dashboard` | Click "Add Shipment" | — | New shipment modal | 5s | — |
| 2 | `/dashboard` | Enter shipment identifiers | BOL number, container number | Carrier auto-detected from container prefix (e.g., MSCU → MSC) | 15s | Invalid format → "Container numbers are 4 letters + 7 digits" |
| 3 | `/dashboard` | Enter routing details | Origin port, destination port, estimated arrival | Shipment record created, status: Booked | 20s | Unknown port code → port search/autocomplete |
| 4 | `/dashboard` | Link to existing calculation (optional) | Select from saved calculations | Estimated costs attached to shipment for later reconciliation | 10s | No saved calculations → skip |
| 5 | `/dashboard/tracking` | Monitor — Gate Out | — (automatic via Terminal49) | "Container loaded at [terminal], [date] [time]" | — | No tracking data → "Carrier hasn't reported gate-out yet" |
| 6 | `/dashboard/tracking` | Monitor — Vessel Loaded | — (automatic) | Vessel name, departure date, ETA | — | — |
| 7 | `/dashboard/tracking` | Monitor — In Transit | — (automatic) | Vessel position on map, updated ETA | — | Position data unavailable → "Last known position: [date]" |
| 8 | `/dashboard/tracking` | Upload documents | Commercial invoice PDF, packing list PDF | OCR extraction: seller, buyer, HTS codes, quantity, value, incoterm | 2-3 min | OCR misread → editable field review, manual correction |
| 9 | `/dashboard/tracking` | Review extracted fields | Confirm/correct OCR results | Cross-reference validation against shipment data | 30s | Value mismatch → yellow warning with discrepancy detail |
| 10 | `/dashboard/tracking` | ISF compliance check | — (automatic from uploaded docs) | ISF-10 checklist: X/10 elements populated, missing items highlighted | 15s | Missing elements → list what to get from supplier, deadline countdown |
| 11 | `/dashboard/tracking` | Enter missing ISF data | Container stuffing location, consolidator | ISF checklist complete, "Ready for Filing" badge | 30s | — |
| 12 | `/dashboard/tracking` | Assemble document packet | Click "Assemble" | ZIP: invoice, packing list, BOL, ISF data, cover page. Shareable link. | 10s | — |
| 13 | `/dashboard/tracking` | Share with customs broker | Enter broker email or copy link | Read-only access link (30-day expiry) sent | 10s | — |
| 14 | `/dashboard/tracking` | **Event:** Customs Hold | — (automatic alert) | Alert banner: exam type, expected delay, explainer article | — | — |
| 15 | `/dashboard/tracking` | Read customs hold explainer | Click "What does this mean?" | Inline knowledge base: exam types, fees, not an indication of wrongdoing | 30s | — |
| 16 | `/dashboard/tracking` | **Event:** Exam Complete / Released | — (automatic) | Status: Released, available for pickup at [terminal] | — | — |
| 17 | `/dashboard/tracking` | Schedule drayage pickup | Pickup date, delivery address | Drayage request created | 20s | No available dates → suggest alternatives |
| 18 | `/dashboard/tracking` | **Event:** Delivered | — (automatic or manual confirmation) | Status: Delivered, shipment lifecycle complete | — | — |
| 19 | `/dashboard/tracking` | Reconcile costs | Actual freight, duty, exam fee, drayage, demurrage | Variance report: actual vs. estimated per component, total delta, margin impact | 3-5 min | — |
| 20 | `/dashboard/tracking` | **Decision:** Adjust future estimates? | System suggests contingency additions | Calculator defaults updated (e.g., add exam contingency) | 10s | — |

### Decision Points

| Decision | Options | Routing Logic | Default |
|----------|---------|---------------|---------|
| Link to calculation? | Select saved calc / Skip | Enables cost reconciliation at delivery | Skip if no saved calcs |
| Customs hold action | Wait / Contact broker / Escalate | Based on exam type and hold duration | Show explainer, suggest patience |
| ISF data missing | Get from supplier / Enter manually / Flag for broker | Checklist shows exactly what's missing | Prompt to contact supplier |
| Reconcile costs? | Yes → enter actuals / Skip | Prompt appears on delivery, dismissible | Show prompt |
| Adjust estimates? | Accept suggestion / Modify / Decline | Based on variance analysis | Accept if variance > 10% |

### Error States & Recovery

| Error | Trigger | User-Facing Message | Recovery |
|-------|---------|---------------------|----------|
| Container not found | Terminal49 returns no data | "We can't find tracking data for this container yet." | Manual status updates, retry in 24h, check BOL/container number |
| Carrier not recognized | Non-standard container prefix | "We couldn't auto-detect the carrier." | Manual carrier selection dropdown |
| Document OCR fails | Low-quality scan, handwritten docs | "We couldn't read this document clearly." | Manual field entry form, suggest re-scan at higher quality |
| ISF deadline approaching | < 48 hours to deadline, incomplete | Red banner: "ISF filing deadline in [X hours]. [N] elements still missing." | Priority contact list for missing data sources |
| Customs hold extended | Hold > 7 business days | "This hold is longer than typical. Consider contacting your customs broker." | Broker contact card, knowledge base article on extended holds |
| Tracking data stale | No update in 72+ hours | "Tracking hasn't updated in 3 days." | Manual status toggle, contact carrier link |

### Time Estimates

| Phase | Duration | Notes |
|-------|----------|-------|
| Create shipment | 1-2 min | BOL + container + routing |
| Upload + validate documents | 3-5 min | Per document set |
| ISF compliance check | 2-5 min | Depends on missing data |
| Monitoring (passive) | 14-35 days | Automatic updates, occasional check |
| Cost reconciliation | 3-5 min | After delivery |
| **Total active time** | **10-20 min** | Spread across shipment lifecycle |
| **Total calendar time** | **14-35 days** | Full ocean transit cycle |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Shipments tracked to delivery | > 80% | Delivered status / created shipments |
| Document upload rate | > 60% | Shipments with at least 2 docs uploaded |
| ISF compliance rate | 100% | ISF filed before deadline / shipments |
| Cost reconciliation completion | > 40% | Reconciled / delivered shipments |
| Estimate accuracy | < 15% variance | Avg (actual - estimated) / estimated |
| Customs hold resolution time | < 5 business days | Avg hold duration for platform users |

---

## 4. FTZ Strategy

**Trigger:** User (broker or FTZ operator) wants to evaluate whether Foreign Trade Zone strategies can reduce duty costs for a product or client.
**Goal:** Data-driven FTZ recommendation with scenario modeling, withdrawal schedule, and exportable presentation.
**Exit criteria:** Clear recommendation (viable/not viable) with supporting analysis, exported as PDF/XLSX.

### Flow Diagram

```
[Entry: Dashboard CTA or direct navigation]
         ↓
[Enter product details: HTS, origin, volume, unit value]
         ↓
[Regulatory Check]
    ↓              ↓
PF Mandatory    PF vs. GPA election available
(executive order)        ↓
    ↓           [Decision] PF or GPA?
    ↓          /                      \
    ↓     PF (rate lock)         GPA (current rate)
    ↓          \                      /
    ← ← ← ← ← ← ← ← ← ← ← ← ← ←
                   ↓
         [Scenario Modeling]
         - Rates stable
         - Rates increase
         - Rates decrease
                   ↓
         [Probability-weighted NPV]
                   ↓
         [Decision] FTZ viable?
        /          |            \
  Yes (strong)  Marginal     No (not viable)
      ↓            ↓              ↓
  Withdrawal   Show threshold   Show volume/rate
  Schedule     for viability    targets for future
      ↓            ↓              ↓
  Compare FTZ   ← ← ←       ← ← ←
  Sites              ↓
      ↓         [Save Analysis]
  [Generate Deliverables]
      ↓
  PDF Executive Summary + XLSX Withdrawal Schedule
      ↓
  [Send to client / Save to record]
```

### Step-by-Step Detail

| Step | Route | Action | Inputs | Outputs | Time Est. | Error State |
|------|-------|--------|--------|---------|-----------|-------------|
| 1 | `/tools/ftz-analyzer` | Open FTZ Analyzer | — | Input panel with guided fields | 5s | — |
| 2 | `/tools/ftz-analyzer` | Enter product details | HTS code, country of origin, unit value (FOB), annual volume | Validated inputs, regulatory database check initiated | 30s | Invalid HTS → search/lookup link |
| 3 | `/tools/ftz-analyzer` | Regulatory analysis (automatic) | — | Executive order check: PF mandatory or PF/GPA election available. Tariff stack breakdown (MFN + Section 301 + reciprocal + ADD/CVD) | 10s | HTS not in regulatory DB → manual rate entry |
| 4 | `/tools/ftz-analyzer` | **Decision:** PF or GPA? | User selects (or PF auto-selected if mandatory) | Rate lock details (PF) or current-rate flexibility (GPA) explained | 15s | Mandatory PF → GPA toggle disabled with explanation |
| 5 | `/tools/ftz-analyzer` | Enter FTZ parameters | Annual FTZ cost, withdrawal pace (units/week or month) | Inventory projection chart | 20s | — |
| 6 | `/tools/ftz-analyzer` | Define tariff scenarios | 3 scenarios with probability weights: stable/increase/decrease | Scenario cards with rate details and probabilities | 45s | Probabilities don't sum to 100% → auto-normalize with warning |
| 7 | `/tools/ftz-analyzer` | Review NPV analysis | — | Per-scenario NPV, probability-weighted NPV, breakeven timeline, ROI % | 15s | — |
| 8 | `/tools/ftz-analyzer` | Sensitivity analysis | — | Tornado chart: most sensitive variables, breakeven thresholds | 15s | — |
| 9 | `/tools/ftz-analyzer` | **Decision:** FTZ viable? | — | System recommendation: viable / marginal / not viable | 5s | — |
| 9a | `/tools/ftz-analyzer` | If viable → withdrawal scheduler | Withdrawal pace, cycle (weekly/monthly) | Week-by-week or month-by-month calendar: units, duty, cash flow | 30s | — |
| 9b | `/tools/ftz-analyzer` | If not viable → view thresholds | — | "FTZ becomes viable at [X] units/year or [Y]% duty rate" | 15s | — |
| 10 | `/tools/ftz-analyzer` | Compare FTZ sites (if viable) | User location or port | Map: nearby FTZ sites with fees, capacity, activation timeline, distance | 30s | No FTZ sites nearby → suggest alternatives or subzone application |
| 11 | `/tools/ftz-analyzer` | Generate compliance documentation | — | PF application summary, reconciliation template, withdrawal log template, audit checklist | 15s | — |
| 12 | `/tools/ftz-analyzer` | Export deliverables | Select format(s) | PDF executive summary (8-12 pages) + XLSX withdrawal schedule + compliance package | 15-30s | — |
| 13 | `/tools/ftz-analyzer` | Save analysis to client record | Client name, analysis title | Saved with timestamp, audit log entry | 10s | — |
| 14 | Email (off-platform) | Send to client | — | — | — | — |

### Decision Points

| Decision | Options | Routing Logic | Default |
|----------|---------|---------------|---------|
| PF or GPA? | PF (rate lock) / GPA (current rate) | Mandatory PF → auto-select. Otherwise user chooses with recommendation. | System recommends based on tariff volatility score |
| Scenario weights | Slider: 0-100% per scenario | Must sum to 100% (auto-normalize if not) | Equal weights (33/33/34) |
| FTZ viable? | Viable / Marginal / Not viable | NPV > 0 + breakeven < 18mo = viable. NPV > 0 + breakeven > 18mo = marginal. NPV < 0 = not viable. | — |
| FTZ site selection | Map-based selection from available zones | Distance + cost + capacity ranking | Nearest zone with capacity |
| Export format | PDF / XLSX / Both / Compliance package | All available simultaneously | PDF + XLSX bundle |

### Error States & Recovery

| Error | Trigger | User-Facing Message | Recovery |
|-------|---------|---------------------|----------|
| Executive order applicability unclear | HTS on boundary of reciprocal tariff scope | "This HTS code may be affected by the April 2025 executive order. Consult your compliance team." | Show both PF and GPA analyses for comparison |
| No FTZ sites found | Remote location | "No activated FTZ zones within 50 miles." | Suggest subzone application process, show nearest zone |
| Negative NPV in all scenarios | FTZ costs exceed savings in every case | "FTZ is not cost-effective at current volume and rates." | Show exact thresholds: "Viable at X units or Y% duty" |
| Rate data stale | Tariff schedule not updated in 30+ days | "Duty rates were last updated [date]. Verify current rates." | Link to USITC for verification |

### Time Estimates

| Phase | Duration | Notes |
|-------|----------|-------|
| Enter product + regulatory check | 1-2 min | — |
| PF/GPA selection + parameters | 1-2 min | — |
| Scenario modeling + NPV review | 2-5 min | Depends on complexity |
| Withdrawal scheduling | 1-3 min | If FTZ viable |
| FTZ site comparison | 1-2 min | If FTZ viable |
| Export deliverables | 15-30s | — |
| **Total (not viable)** | **5-8 min** | Quick determination |
| **Total (full analysis)** | **10-25 min** | With withdrawal schedule + site comparison + exports |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| FTZ analysis completion rate | > 75% | Completed / started analyses |
| Export/download rate | > 50% | Exports / completed analyses |
| Client presentation generated | > 30% | PDF presentations / analyses (broker/FTZ personas) |
| FTZ recommendation accuracy | > 85% | User-confirmed correct recommendations / total |
| Avg analysis time | < 15 min | For full viable analysis |
| FTZ adoption rate | > 20% | Users who proceed with FTZ after "viable" recommendation |

---

## 5. Daily Dashboard

**Trigger:** User logs in (typically morning) to review status and take actions on active shipments and operations.
**Goal:** Triage all urgent items, update clients, and plan the day — in under 20 minutes.
**Exit criteria:** All alerts addressed, clients notified, priority actions scheduled.

### Flow Diagram

```
[Login /dashboard]
         ↓
[Dashboard Overview — Kanban View]
  Booked | In Transit | At Port | In FTZ | Delivered
         ↓
[Check Alert Badges (red = urgent)]
         ↓
    ┌────┴────────────────────────────┐
    ↓                                 ↓
[Customs Holds]                [Vessel Delays]
    ↓                                 ↓
Review docs → Notify client    Review delay impact → Notify client
    ↓                                 ↓
    └──────────────┬──────────────────┘
                   ↓
         [Review "At Port" shipments]
                   ↓
         [Check demurrage risk (5+ days)]
                   ↓
         [Schedule pickups if needed]
                   ↓
         [Review FTZ operations (if FTZ persona)]
                   ↓
         [Process pending withdrawals]
                   ↓
         [Check analytics / KPIs]
                   ↓
         [Triage complete — all items addressed]
```

### Step-by-Step Detail

| Step | Route | Action | Inputs | Outputs | Time Est. | Error State |
|------|-------|--------|--------|---------|-----------|-------------|
| 1 | `/dashboard` | Login / open dashboard | Credentials or active session | Overview: shipment kanban, alert badges, KPI summary | 5-10s | Auth expired → re-login with "Remember me" option |
| 2 | `/dashboard` | Scan kanban overview | — | Shipment counts by status: Booked (N), In Transit (N), At Port (N), In FTZ (N), Delivered This Week (N) | 10s | — |
| 3 | `/dashboard` | Click alert badge (if any) | — | Alert panel: list of items requiring attention, sorted by priority | 10s | No alerts → green "All clear" badge |
| 4 | `/dashboard/tracking` | Review customs hold alert | Click into affected shipment | Shipment detail: hold type, document status, explainer, expected delay | 30-60s | — |
| 5 | `/dashboard/tracking` | Notify client about hold | Click "Notify Client" | Pre-drafted notification (editable): hold details, documentation status, expected timeline | 30s | Client email missing → prompt to add |
| 6 | `/dashboard/tracking` | Review vessel delay alert | Click into affected shipment | Delay details: original vs. new ETA, reason, impact analysis (cold chain risk if reefer) | 30-60s | — |
| 7 | `/dashboard/tracking` | Notify client about delay | Click "Notify Client" | Pre-drafted notification with delay details and new ETA | 30s | — |
| 8 | `/dashboard` | Filter by "At Port" status | Click status filter | Shipments at port, sorted by dwell time descending | 10s | — |
| 9 | `/dashboard` | Check demurrage risk | — | Flag shipments with 4+ days dwell. Show: free time remaining, demurrage rate, estimated cost if not picked up today. | 15s | — |
| 10 | `/dashboard` | Schedule pickup (if urgent) | Preferred date, delivery address | Drayage request created | 30s | No available slots → suggest alternatives |
| 11 | `/dashboard` | Review FTZ operations (FTZ persona) | — | Pending withdrawals, compliance status, inventory snapshot | 30-60s | — |
| 12 | `/dashboard` | Process withdrawals (FTZ persona) | Confirm withdrawal quantities | Duty calculated, documentation generated, audit log updated | 2-5 min | Calculation discrepancy → manual review flag |
| 13 | `/dashboard/analytics` | Check KPIs (optional) | — | Cost trends, carrier performance, savings opportunities | 1-3 min | — |
| 14 | `/dashboard` | Review triage summary | — | Actions taken: N alerts resolved, N clients notified, N pickups scheduled. Time spent. | 10s | — |

### Decision Points

| Decision | Options | Routing Logic | Default |
|----------|---------|---------------|---------|
| Alert priority | Customs holds first / Delays first / By client | Sorted by severity: customs hold > delay > demurrage risk | Severity order |
| Client notification | Send pre-drafted / Edit first / Skip | "Notify Client" button with editable template | Send pre-drafted |
| Demurrage action | Schedule pickup / Contact client / Wait | Based on free time remaining and drayage availability | Schedule if < 1 day free time remaining |
| Process withdrawals? | Process now / Defer to later | Based on withdrawal schedule and due dates | Process if due this week |
| Check analytics? | Full review / Quick glance / Skip | Based on day of week (full review Monday, quick other days) | Quick glance |

### Error States & Recovery

| Error | Trigger | User-Facing Message | Recovery |
|-------|---------|---------------------|----------|
| Dashboard data stale | API timeout or data source delay | "Data last updated [time]. Refresh?" | Manual refresh button, auto-retry in 60s |
| Alert notification fails | Email delivery failure | "Notification couldn't be sent to [email]." | Retry, copy text to clipboard for manual send |
| Demurrage calculation wrong | Free time policy changed | "Verify free time with carrier — policies may have changed." | Link to carrier free time lookup |
| FTZ withdrawal discrepancy | Inventory count mismatch | "Withdrawal quantity exceeds recorded inventory by [N] units." | Inventory reconciliation flow |

### Time Estimates

| Phase | Duration | Notes |
|-------|----------|-------|
| Overview scan | 30s-1 min | Kanban + alerts |
| Alert triage | 2-5 min | Per alert: review + notify |
| At-port review | 1-3 min | Demurrage check + pickups |
| FTZ operations | 3-8 min | FTZ persona only |
| Analytics review | 1-3 min | Optional, quick on most days |
| **Total (no alerts)** | **3-5 min** | Quick check, all clear |
| **Total (typical)** | **10-15 min** | 2-3 alerts + at-port review |
| **Total (heavy day)** | **15-20 min** | Multiple alerts + FTZ + analytics |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily active users | > 70% of registered | DAU / total users |
| Alert response time | < 30 min | Alert created → acknowledged |
| Client notification rate | > 90% | Notifications sent / alerts requiring client update |
| Demurrage incidents prevented | > 80% | Pickups scheduled before free time expires / at-risk containers |
| Morning triage duration | < 15 min | Login → last action timestamp |
| Dashboard session frequency | 1-3x/day | Avg sessions per active user per day |

---

## 6. AI Agent Interaction

**Trigger:** User has a question, needs classification, or wants an AI-generated recommendation at any point in the platform.
**Goal:** Get an accurate AI answer, verify it against authoritative sources, and accept, override, or provide feedback.
**Exit criteria:** User has an answer they trust (AI-generated or manually overridden) and the system has learned from the interaction.

### Flow Diagram

```
[User asks question or triggers AI agent]
         ↓
    ┌────┴────────────────────────────────────┐
    ↓             ↓              ↓             ↓
HTS Classify  Cost Optimize  Compliance    Document
  Agent         Agent         Agent        Agent
    ↓             ↓              ↓             ↓
[AI processes with confidence score]
         ↓
[Present result with confidence + sources]
         ↓
[Decision] User trusts result?
    /         |            \
Accept     Verify       Override
   ↓          ↓             ↓
Use result  View sources  Enter manual value
   ↓       / review        ↓
   ↓    Accept/Override     ↓
   ↓          ↓             ↓
   └──────────┴─────────────┘
              ↓
[Decision] Provide feedback?
    /                    \
Yes → rate accuracy     No → continue
   ↓                       ↓
Feedback stored for       ← ←
model improvement
```

### Agent Types & Interaction Patterns

| Agent | Trigger | Input | Output | Confidence Display |
|-------|---------|-------|--------|-------------------|
| **HTS Classification** | Product description entered in HTS lookup | Natural language product description | Top 3 HTS codes with confidence %, duty rates, CBP ruling references | Green (>80%), Yellow (60-80%), Red (<60%) |
| **Cost Optimization** | Completed calculation with "Get recommendations" | Calculation data, historical shipments | Optimization suggestions: carrier switch, route change, timing, volume consolidation | "Estimated savings: $X/year" with confidence range |
| **Compliance** | HTS code entered or shipment created | HTS, origin, value, volume | ADD/CVD flags, Section 301 status, UFLPA risk, ISF requirements, FDA/USDA flags | Pass/Fail/Warning badges |
| **Document Processing** | Document uploaded | PDF/image file | Extracted fields: seller, buyer, HTS, quantity, value, incoterm | Extraction confidence per field |
| **Forecast** (future) | Route selected with "See trends" | Route, commodity, date range | Rate forecast, seasonal patterns, recommended booking windows | Forecast range (low/mid/high) |
| **Anomaly Detection** (future) | Shipment tracking data | Tracking events, expected patterns | Anomaly alerts: unusual delay, unexpected route, cost outlier | Anomaly severity score |
| **FTZ Strategy** | FTZ analysis initiated | Product details, volumes, scenarios | PF/GPA recommendation, NPV analysis, withdrawal optimization | Recommendation strength |

### Step-by-Step Detail (Generic AI Interaction Pattern)

| Step | Route | Action | Inputs | Outputs | Time Est. | Error State |
|------|-------|--------|--------|---------|-----------|-------------|
| 1 | Various | Trigger AI agent | Product description / document / question | Loading state: "Analyzing..." with progress indicator | 2-5s | — |
| 2 | Various | AI processes request | — | Result card: answer + confidence score + source references | 3-15s | Timeout → retry with simplified query |
| 3 | Various | Review result | — | Confidence badge (green/yellow/red), source links (CBP rulings, CFR, tariff schedule), explanation text | 15-30s | — |
| 4 | Various | **Decision:** Trust result? | — | — | — | — |
| 4a | Various | If accept → use result | Click "Use this" / "Accept" | Value flows into calculator/form/record | 5s | — |
| 4b | Various | If verify → check sources | Click source links | CBP CROSS rulings, USITC data, carrier data shown inline | 30-60s | Source unavailable → "Source offline, cached data from [date]" |
| 4c | Various | If override → enter manual value | Type alternative value | System accepts with "User override" flag for audit trail | 15s | — |
| 5 | Various | **Decision:** Provide feedback? | — | — | — | — |
| 5a | Various | Rate accuracy | Thumbs up/down + optional comment | Stored for model retraining and accuracy metrics | 10s | — |
| 5b | Various | Skip feedback | — | Implicit signal (accept = positive, override = negative) | 0s | — |

### Confidence Thresholds & Behavior

| Confidence Level | Badge | Behavior | User Expectation |
|-----------------|-------|----------|-----------------|
| **High (>80%)** | Green | Result shown as primary recommendation | "This is likely correct. Verify if high-value shipment." |
| **Medium (60-80%)** | Yellow | Result shown with "Verify recommended" note | "Review the sources. This product may have edge cases." |
| **Low (40-60%)** | Orange | Multiple options shown, no primary recommendation | "We found some options but aren't confident. Please review." |
| **Very Low (<40%)** | Red / None | Fallback to manual workflow | "We couldn't classify this confidently. Try refining or browse manually." |

### Error States & Recovery

| Error | Trigger | User-Facing Message | Recovery |
|-------|---------|---------------------|----------|
| AI timeout | Processing > 30s | "This is taking longer than expected. We're still working..." | Retry button after 60s; suggest manual entry as alternative |
| No results | Agent returns empty | "We couldn't find a match for this query." | Refine input prompt, manual entry, request human review |
| Conflicting results | Agent returns multiple high-confidence contradictory options | "We found multiple possible classifications. CBP rulings are conflicting on this product." | Show all options with ruling references, suggest binding ruling |
| Stale data | Source data > 30 days old | "Using cached data from [date]. Live verification recommended." | Link to authoritative source for manual check |
| Extraction error (docs) | OCR confidence < 50% on a field | "We couldn't read [field] clearly. Please verify." | Editable field with OCR attempt pre-filled, re-upload option |

### Feedback Loop Architecture

```
User Interaction → AI Result → User Decision
                                    ↓
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
                 Accept          Override        Explicit
                 (implicit       (implicit        Feedback
                  positive)       negative)       (thumbs + comment)
                    ↓               ↓               ↓
                    └───────────────┴───────────────┘
                                    ↓
                         Feedback Database
                                    ↓
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
              Accuracy          Retraining      Product
              Metrics           Queue           Improvement
              Dashboard         (weekly)        Roadmap
```

### Time Estimates

| Interaction | Duration | Notes |
|-------------|----------|-------|
| HTS classification | 30-60s | Including result review |
| Compliance check | 10-20s | Mostly automatic, review flags |
| Document extraction | 2-3 min | Upload + review + corrections |
| Cost optimization | 30-60s | Review recommendations |
| **Accept path** | **15-30s** | Quick confidence check + accept |
| **Verify path** | **1-3 min** | Review sources then accept/override |
| **Override path** | **30-60s** | Enter manual value |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| AI acceptance rate | > 70% | Accepted results / total AI results shown |
| Override rate | < 20% | Overridden / total |
| Classification accuracy (HTS) | > 85% | Verified correct / total classifications |
| Document extraction accuracy | > 90% | Fields correct without edit / total fields |
| Avg interaction time | < 60s | From trigger to accept/override |
| Feedback submission rate | > 15% | Explicit feedback given / interactions |
| User confidence growth | Increasing over time | Acceptance rate trend per user (should increase as trust builds) |

---

## Cross-Workflow Integration Points

### Workflow Handoffs

| From Workflow | To Workflow | Trigger | Data Transferred |
|---------------|-------------|---------|-----------------|
| Onboarding | Freight Quote | User completes first calculation | Saved calculation, persona, defaults |
| Freight Quote | Import Workflow | "Track this shipment" after quote | Calculation data → estimated costs for reconciliation |
| Freight Quote | FTZ Strategy | "Check FTZ savings" CTA | HTS, duty rate, annual volume, unit value |
| Import Workflow | Daily Dashboard | Shipment events (hold, delay) | Alerts with shipment context |
| FTZ Strategy | Import Workflow | FTZ site selected, withdrawal scheduled | FTZ status, locked rate, withdrawal calendar |
| AI Agent | Freight Quote | HTS classified, rate transferred | HTS code, duty rate, compliance flags |
| AI Agent | Import Workflow | Document extracted | Extracted fields → shipment record |
| Daily Dashboard | Import Workflow | Alert → action (schedule pickup, notify client) | Action request with shipment context |

### Shared Data Dependencies

| Data Entity | Created By | Used By | Storage |
|-------------|-----------|---------|---------|
| HTS classification | AI Agent / Manual | Freight Quote, FTZ Strategy, Compliance | User account + global cache |
| Saved calculation | Freight Quote | Import Workflow (reconciliation), FTZ Strategy | User account |
| Shipment record | Import Workflow | Daily Dashboard, Analytics | Database |
| FTZ analysis | FTZ Strategy | Import Workflow, Daily Dashboard | User/client account |
| Document extractions | AI Agent | Import Workflow, Compliance | Shipment record |
| User preferences | Onboarding | All workflows | User profile |

---

## Appendix: Screen Inventory

All screens referenced across workflows with their primary role.

| Route | Primary Workflow(s) | Purpose |
|-------|-------------------|---------|
| `/` | Onboarding, Freight Quote | Landing page, anonymous calculator |
| `/auth/register` | Onboarding | Account creation |
| `/auth/login` | Daily Dashboard | Authentication |
| `/onboarding/role` | Onboarding | Persona selection |
| `/onboarding/profile` | Onboarding | Profile configuration |
| `/onboarding/goals` | Onboarding | Goal-based personalization |
| `/onboarding/import` | Onboarding | Data migration |
| `/onboarding/tour` | Onboarding | Feature introduction |
| `/dashboard` | Daily Dashboard, Import Workflow | Operations hub, kanban view |
| `/dashboard/tracking` | Import Workflow, Daily Dashboard | Shipment detail + timeline |
| `/dashboard/analytics` | Daily Dashboard | KPIs, trends, recommendations |
| `/dashboard/business-kpi` | Daily Dashboard | Business metrics monitoring |
| `/dashboard/monitoring` | Daily Dashboard | Platform health |
| `/dashboard/data-pipeline` | Daily Dashboard | Data ingestion health |
| `/tools/landed-cost` | Freight Quote | 15-component cost calculator |
| `/tools/unit-economics` | Freight Quote | Per-unit margin analysis |
| `/tools/hts-lookup` | AI Agent, Freight Quote | HTS classification + search |
| `/tools/route-comparison` | Freight Quote | Carrier/route comparison |
| `/tools/ftz-analyzer` | FTZ Strategy | FTZ modeling + analysis |
| `/knowledge-base` | Onboarding, Import Workflow | Educational articles |
