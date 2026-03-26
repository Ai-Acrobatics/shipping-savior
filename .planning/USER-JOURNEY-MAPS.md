# User Journey Maps — Shipping Savior

**Created:** 2026-03-26
**Linear:** AI-5423
**Status:** Complete

---

## Table of Contents

1. [Onboarding Journey](#1-onboarding-journey)
2. [Freight Quote Journey](#2-freight-quote-journey)
3. [Import Workflow Journey](#3-import-workflow-journey)
4. [FTZ Strategy Journey](#4-ftz-strategy-journey)
5. [Daily Dashboard Journey](#5-daily-dashboard-journey)
6. [AI Agent Interaction Journey](#6-ai-agent-interaction-journey)

---

## 1. Onboarding Journey

**Goal:** New user discovers the platform, understands its value, runs their first calculation, and reaches the "aha moment."

**Persona:** Freight broker or importer evaluating the platform for their logistics operations.

**Success Metrics:**
- Time to first calculation < 3 minutes
- Completion rate of first calculator > 60%
- Bounce rate on landing page < 40%
- Progression to FTZ Analyzer or Dashboard > 25%

### Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  1. Land on /    │────▶│ 2. Scan hero +   │────▶│ 3. Review stats bar │
│  (referral/link) │     │    value prop     │     │    (100K+ HTS, etc) │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
                                                            │
        ┌───────────────────────────────────────────────────┘
        ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│ 4. Browse 2×3        │────▶│ 5. Scroll to live    │────▶│ 6. Enter first   │
│    feature grid      │     │    calculator preview │     │    calculation ★  │
└──────────────────────┘     └──────────────────────┘     └──────────────────┘
                                                            │
        ┌───────────────────────────────────────────────────┘
        ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│ 7. See cost breakdown│────▶│ 8. Explore import    │────▶│ 9. View roadmap  │
│    + margins (AHA!)  │     │    pipeline flow      │     │    & architecture │
└──────────────────────┘     └──────────────────────┘     └──────────────────┘
                                                            │
        ┌───────────────────────────────────────────────────┘
        ▼
┌──────────────────────────────────────────────────────────────────┐
│ 10. Choose next action:                                          │
│     → /ftz-analyzer (deep FTZ analysis)                          │
│     → /knowledge-base (learn import process)                     │
│     → /dashboard (explore operational tools)                     │
└──────────────────────────────────────────────────────────────────┘
```

### Step Details

| Step | Screen/Page | User Action | Data In | Data Out | Time Est. |
|------|------------|-------------|---------|----------|-----------|
| 1 | `/` Landing | Arrives via shared link, email, or direct URL | — | Page view event | 0s |
| 2 | `/` Hero section | Reads headline + value proposition | — | Comprehension of platform purpose | 10s |
| 3 | `/` Stats bar | Scans social proof numbers (100K+ HTS, 3700+ ports, 260+ FTZ, $0 cost) | — | Trust signal absorbed | 5s |
| 4 | `/` Feature grid | Reviews 6 capability cards | — | Understanding of feature set | 20s |
| 5 | `/` Calculator preview | Scrolls to embedded Unit Economics Calculator | — | Sees interactive tool | 10s |
| 6 | `/` Calculator (inline) | Enters origin cost, units/container, shipping rate, duty rate | Origin cost ($), units, freight rate, duty % | — | 60s |
| 7 | `/` Calculator results | Views cost breakdown chart + value chain (Origin→Landed→Wholesale→Retail) | — | Per-unit margin, container profit, ROI | 30s |
| 8 | `/` Import pipeline | Reviews 6-step import flow visualization | — | Understanding of end-to-end process | 20s |
| 9 | `/` Roadmap section | Scans platform roadmap + architecture diagram | — | Confidence in platform maturity | 15s |
| 10 | `/` Navigation | Clicks CTA to deeper tool | — | Navigation event | 5s |

### Decision Points

| Point | Options | Criteria |
|-------|---------|----------|
| After step 7 (first calc) | Continue exploring vs. leave | Was the margin calculation relevant to their business? |
| After step 9 (roadmap) | FTZ Analyzer vs. Knowledge Base vs. Dashboard | User's primary need: savings optimization, learning, or operations |
| Any step | Leave site | Content not relevant, too complex, or missing needed feature |

### Error States & Recovery

| Error | Cause | Recovery |
|-------|-------|----------|
| Calculator shows $0 margin | Unrealistic input values | Show tooltip with typical ranges (e.g., "SE Asia origin costs typically $0.05-$0.50/unit") |
| Page loads slowly | Large initial JS bundle | Skeleton loaders on calculator sections; hero renders first |
| User confusion at stats bar | Unfamiliar with HTS/FTZ terminology | Stats bar links to Knowledge Base glossary |
| No clear next step after hero | CTA not visible above fold | Sticky CTA bar appears on scroll |

---

## 2. Freight Quote Journey

**Goal:** User enters shipment details, calculates full landed cost, compares routes/carriers, and saves or shares the quote.

**Persona:** Importer evaluating costs for a specific product shipment from SE Asia to US.

**Success Metrics:**
- Landed cost calculation completion rate > 75%
- Route comparison engagement (≥2 routes compared) > 50%
- Scenario saved to localStorage > 30%
- Time from start to complete quote < 10 minutes

### Flow

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│ 1. Open Unit Econ   │────▶│ 2. Enter product     │────▶│ 3. Configure        │
│    Calculator        │     │    parameters         │     │    shipping details  │
└─────────────────────┘     └──────────────────────┘     └─────────────────────┘
                                                            │
        ┌───────────────────────────────────────────────────┘
        ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│ 4. Review landed     │────▶│ 5. Compare routes    │────▶│ 6. Evaluate port │
│    cost breakdown    │     │    (direct vs trans.) │     │    options        │
└──────────────────────┘     └──────────────────────┘     └──────────────────┘
                                                            │
        ┌───────────────────────────────────────────────────┘
        ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│ 7. Check tariff      │────▶│ 8. Build scenarios   │────▶│ 9. Save/share    │
│    rates by country  │     │    (up to 6)          │     │    quote          │
└──────────────────────┘     └──────────────────────┘     └──────────────────┘
```

### Step Details

| Step | Screen/Page | User Action | Data In | Data Out | Time Est. |
|------|------------|-------------|---------|----------|-----------|
| 1 | `/` or `/ftz-analyzer` | Opens calculator (inline on landing or via FTZ page) | — | Calculator loaded | 5s |
| 2 | Unit Economics Calculator | Enters origin cost per unit, units per container, markup percentages | Origin cost ($0.01-$50), units/container (100-500K), markups | — | 45s |
| 3 | Unit Economics Calculator | Configures shipping rate, insurance, customs broker fee, drayage | Freight $/container, insurance %, broker flat fee, drayage $ | — | 30s |
| 4 | Calculator results panel | Reviews 12-component landed cost breakdown: FOB, freight, insurance, duty, MPF (0.3464%), HMF (0.125%), broker, drayage, warehousing, fulfillment, FTZ storage | — | Per-unit landed cost, total container cost, margin analysis | 60s |
| 5 | Route Comparison / Shipping Map | Selects origin port (e.g., VNSGN) and destination (e.g., USLAX), compares 3 route options | Origin UNLOCODE, destination UNLOCODE | Transit days, cost per route, transshipment details | 90s |
| 6 | Port Comparison Tool | Compares ports via radar chart (congestion, fees, cold chain, FTZ proximity) | Port selections (2-3) | Radar comparison, demurrage rates, free days | 60s |
| 7 | HTS Code Lookup (`/ftz-analyzer` step 1) | Searches HTS code for product, views duty rates by country of origin | Product keyword or HTS code | General rate, Section 301 rate, effective rate | 45s |
| 8 | Tariff Scenario Builder (`/ftz-analyzer` step 2) | Creates up to 6 side-by-side scenarios with different countries/policies | Country, HTS code, policy preset | Side-by-side duty comparison | 120s |
| 9 | Saved Scenarios Manager | Names and saves scenario set to localStorage; loads trade policy presets | Scenario name | Persisted scenario set | 15s |

### Decision Points

| Point | Options | Criteria |
|-------|---------|----------|
| Step 2: Product type | Consumer goods vs. cold chain vs. raw materials | Determines HTS chapter, duty rates, container type |
| Step 5: Route selection | Direct ocean vs. transshipment vs. air freight | Transit time urgency, cost sensitivity, cargo type |
| Step 6: Port choice | LA/Long Beach vs. Oakland vs. Seattle vs. East Coast | Proximity to fulfillment, congestion level, FTZ access |
| Step 7: Country of origin | Vietnam vs. Thailand vs. Indonesia vs. Cambodia | Duty rate differential, Section 301 exposure, FTA eligibility |
| Step 8: Policy scenario | Current rates vs. 301 expansion vs. trade war vs. nearshoring | Risk tolerance, planning horizon |

### Error States & Recovery

| Error | Cause | Recovery |
|-------|-------|----------|
| HTS code not found | Product not in 200-entry database | Show "Try broader category" hint; link to USITC full database |
| Unrealistic landed cost | Input error (e.g., $50/unit origin for t-shirts) | Show industry benchmark ranges per HTS chapter |
| Route comparison empty | Selected ports have no matching routes | Suggest alternative port pairs; show nearest available routes |
| localStorage full | Too many saved scenarios | Prompt to delete old scenarios; show storage usage |
| Scenario name conflict | Duplicate name on save | Auto-append number; prompt to rename or overwrite |

---

## 3. Import Workflow Journey

**Goal:** User manages a shipment end-to-end: creates it, tracks progress, handles documentation, clears customs, and confirms delivery.

**Persona:** Operations manager tracking active imports through the supply chain.

**Success Metrics:**
- Shipment detail view engagement > 80% of tracked shipments
- Alert response rate (action taken within 24h) > 70%
- Document checklist completion per shipment > 90%
- Time spent on tracking page per session: 5-15 minutes

### Flow

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│ 1. Open Dashboard   │────▶│ 2. View active       │────▶│ 3. Select shipment  │
│    /dashboard       │     │    shipments list     │     │    for detail        │
└─────────────────────┘     └──────────────────────┘     └─────────────────────┘
                                                            │
        ┌───────────────────────────────────────────────────┘
        ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│ 4. Review shipment   │────▶│ 5. Check timeline    │────▶│ 6. Monitor temp  │
│    detail panel      │     │    events             │     │    (cold chain)   │
└──────────────────────┘     └──────────────────────┘     └──────────────────┘
                                                            │
        ┌───────────────────────────────────────────────────┘
        ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│ 7. Review docs via   │────▶│ 8. Handle customs    │────▶│ 9. Track last    │
│    Knowledge Base    │     │    alerts/holds       │     │    mile delivery  │
└──────────────────────┘     └──────────────────────┘     └──────────────────┘
                                                            │
        ┌───────────────────────────────────────────────────┘
        ▼
┌──────────────────────────────────────────────────────────────────┐
│ 10. Confirm delivery → Review cost breakdown → Archive shipment  │
└──────────────────────────────────────────────────────────────────┘
```

### Step Details

| Step | Screen/Page | User Action | Data In | Data Out | Time Est. |
|------|------------|-------------|---------|----------|-----------|
| 1 | `/dashboard` | Logs in, views KPI cards (active shipments, revenue, landed cost avg, on-time rate) | — | Overview metrics | 15s |
| 2 | `/dashboard` Shipment list | Filters by cargo type tab (Cold Chain / General / All), scans status badges | Filter selection | Filtered shipment list | 20s |
| 3 | `/dashboard/tracking` | Clicks shipment row to open detail panel | Shipment ID | Detail panel loaded | 5s |
| 4 | `/dashboard/tracking` Detail panel | Reviews: vessel/voyage, origin→destination, ETD/ETA, container type, status | — | Current shipment state | 30s |
| 5 | `/dashboard/tracking` Timeline | Scrolls timeline events: booking confirmed → container loaded → vessel departed → in transit → port arrival → customs → delivered | — | Progress understanding | 30s |
| 6 | `/dashboard/tracking` Temperature | Views SVG temperature chart with min/max/avg; checks for excursions outside range | — | Temperature compliance status | 20s |
| 7 | `/knowledge-base` Docs Matrix tab | Cross-references required documents for shipment type; checks compliance checklists | Product category, origin country | Required docs list, checklist status | 120s |
| 8 | `/dashboard/notifications` | Reviews customs-related alerts (hold, exam, missing docs); takes action | — | Alert acknowledgment, action items | 60s |
| 9 | `/dashboard/tracking` | Monitors last-mile status: cleared customs → drayage → warehouse arrival | — | Delivery ETA, drayage status | 30s |
| 10 | `/dashboard/tracking` Cost panel | Reviews final cost breakdown: freight, duty paid, demurrage, drayage, warehousing | — | Actual vs. estimated cost comparison | 45s |

### Decision Points

| Point | Options | Criteria |
|-------|---------|----------|
| Step 2: Cargo filter | Cold chain vs. general cargo vs. all | User's portfolio focus |
| Step 6: Temperature alert | Acceptable excursion vs. file claim | Duration and severity of temperature breach |
| Step 8: Customs hold | Provide additional docs vs. request exam vs. escalate to broker | Type of hold (random exam vs. missing ISF vs. restricted goods) |
| Step 9: Drayage | Direct to warehouse vs. FTZ entry vs. bonded warehouse | Duty payment strategy, storage needs |
| Step 10: Cost variance | Accept vs. investigate discrepancy | Variance > 10% from estimate triggers review |

### Error States & Recovery

| Error | Cause | Recovery |
|-------|-------|----------|
| Shipment not found | Incorrect tracking number or not yet in system | Search suggestions; manual entry form |
| Temperature data gap | Reefer monitor offline during transit | Show "data unavailable" segment; flag for carrier follow-up |
| Customs hold alert missed | Notification not seen in time | Critical alerts escalate to dashboard banner + email (future) |
| Document missing at customs | Incomplete pre-filing | Link to Knowledge Base docs matrix; show exactly which doc is needed |
| Delivery delayed | Port congestion or drayage scheduling | Show updated ETA; display congestion level from port data |

---

## 4. FTZ Strategy Journey

**Goal:** User enters product details, calculates FTZ savings across withdrawal strategies, and generates a recommendation they can act on.

**Persona:** Importer exploring Foreign Trade Zones to reduce duty exposure on recurring imports.

**Success Metrics:**
- 3-step flow completion rate (HTS → Scenarios → FTZ Modeler) > 40%
- Savings calculation engagement (adjusted at least 1 parameter) > 70%
- Scenario saved > 35%
- Time to complete full analysis: 8-15 minutes

### Flow

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│ 1. Navigate to      │────▶│ 2. STEP 1: Search    │────▶│ 3. Select HTS code  │
│    /ftz-analyzer    │     │    HTS codes          │     │    + "Use Rate"      │
└─────────────────────┘     └──────────────────────┘     └─────────────────────┘
                                                            │
        ┌───────────────────────────────────────────────────┘
        ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│ 4. STEP 2: Build     │────▶│ 5. Add scenarios     │────▶│ 6. Compare duty  │
│    tariff scenarios  │     │    (up to 6)          │     │    rates side-by-side│
└──────────────────────┘     └──────────────────────┘     └──────────────────┘
                                                            │
        ┌───────────────────────────────────────────────────┘
        ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│ 7. STEP 3: Configure │────▶│ 8. Choose withdrawal │────▶│ 9. Review savings│
│    FTZ parameters    │     │    pattern             │     │    + break-even   │
└──────────────────────┘     └──────────────────────┘     └──────────────────┘
                                                            │
        ┌───────────────────────────────────────────────────┘
        ▼
┌──────────────────────────────────────────────────────────────────┐
│ 10. Save scenario set → Load presets → Share/export (future)     │
└──────────────────────────────────────────────────────────────────┘
```

### Step Details

| Step | Screen/Page | User Action | Data In | Data Out | Time Est. |
|------|------------|-------------|---------|----------|-----------|
| 1 | `/ftz-analyzer` | Navigates from landing CTA or direct URL | — | 3-step wizard loaded | 5s |
| 2 | `/ftz-analyzer` Step 1: HTS Lookup | Types product keyword (e.g., "cotton t-shirt") into search | Search keyword | Filtered HTS results table (200+ codes) | 20s |
| 3 | `/ftz-analyzer` Step 1: HTS Lookup | Selects matching HTS code row, clicks "Use Rate" button | HTS code selection | Duty rate passed to Step 2 (callback) | 10s |
| 4 | `/ftz-analyzer` Step 2: Scenario Builder | Selects country of origin, reviews auto-populated base + Section 301 rates | Country code (26 options) | Scenario card created | 15s |
| 5 | `/ftz-analyzer` Step 2: Scenario Builder | Adds additional scenarios for comparison (different countries or policy presets) | Additional country/policy combos | Up to 6 scenario cards | 60s |
| 6 | `/ftz-analyzer` Step 2: Scenario Builder | Reviews side-by-side comparison: base rate, 301 rate, effective rate, FTA rate | — | Optimal sourcing country identified | 30s |
| 7 | `/ftz-analyzer` Step 3: FTZ Modeler | Searches and selects FTZ zone; enters shipment value, annual volume | FTZ zone, shipment value ($), annual containers | — | 30s |
| 8 | `/ftz-analyzer` Step 3: FTZ Modeler | Selects withdrawal pattern: Uniform (equal monthly), Front-loaded (80% first 6mo), Back-loaded (80% last 6mo) | Pattern selection | Withdrawal schedule table | 15s |
| 9 | `/ftz-analyzer` Step 3: FTZ Modeler | Reviews: total savings, locked vs. current rate delta, storage cost impact, break-even point, ROI | — | Annual savings $, break-even months, net ROI % | 30s |
| 10 | Saved Scenarios Manager | Saves scenario set with name; can load from 5 trade policy presets | Scenario name | Persisted to localStorage | 15s |

### Decision Points

| Point | Options | Criteria |
|-------|---------|----------|
| Step 3: HTS code | Multiple codes may match product | Choose most specific classification; check general vs. special rates |
| Step 5: # of scenarios | 1 baseline vs. 2-6 comparisons | How many sourcing countries or policy scenarios to evaluate |
| Step 6: Country selection | Vietnam (low 301) vs. China (high 301) vs. Cambodia (GSP eligible) | Effective duty rate after all programs applied |
| Step 8: Withdrawal pattern | Uniform vs. front-loaded vs. back-loaded | Cash flow needs, seasonal demand, tariff increase timing |
| Step 9: FTZ decision | Worth the storage cost vs. pay duty immediately | Break-even period acceptable? Storage cost < duty savings? |

### Error States & Recovery

| Error | Cause | Recovery |
|-------|-------|----------|
| HTS search returns 0 results | Too specific or misspelled query | Suggest broader terms; show "Browse by chapter" option |
| Rate not passed between steps | State management issue | Manual rate entry fallback in Step 2; re-select in Step 1 |
| FTZ zone not found | Zone number not in database | Show all 260+ zones; suggest nearest to selected destination port |
| Negative savings shown | Storage cost exceeds duty savings for small volumes | Display "FTZ not recommended" message with minimum volume threshold |
| Scenario limit reached (6) | User wants more comparisons | Prompt to save current set and start new comparison |

---

## 5. Daily Dashboard Journey

**Goal:** Operations user logs in, gets a quick health check of all shipments, reviews and acts on alerts, and reports key metrics.

**Persona:** Daily user (ops manager or freight broker) running the business.

**Success Metrics:**
- Time to situational awareness < 2 minutes
- Alert acknowledgment rate > 85%
- Dashboard pages visited per session ≥ 3
- Session duration: 5-20 minutes (daily), 30+ minutes (weekly review)

### Flow

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│ 1. Login / Open     │────▶│ 2. Scan 4 KPI cards  │────▶│ 3. Review shipment  │
│    /dashboard       │     │    (health check)     │     │    list + status     │
└─────────────────────┘     └──────────────────────┘     └─────────────────────┘
                                                            │
        ┌───────────────────────────────────────────────────┘
        ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│ 4. Check             │────▶│ 5. Triage alerts     │────▶│ 6. Drill into    │
│    notifications     │     │    by severity        │     │    problem shipment│
└──────────────────────┘     └──────────────────────┘     └──────────────────┘
                                                            │
        ┌───────────────────────────────────────────────────┘
        ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│ 7. Review cost       │────▶│ 8. Check savings     │────▶│ 9. Log out /     │
│    analytics          │     │    & FTZ ROI          │     │    plan actions   │
└──────────────────────┘     └──────────────────────┘     └──────────────────┘
```

### Step Details

| Step | Screen/Page | User Action | Data In | Data Out | Time Est. |
|------|------------|-------------|---------|----------|-----------|
| 1 | `/dashboard` | Opens app (future: authenticates) | Credentials (future) | Session established | 10s |
| 2 | `/dashboard` KPI row | Scans: Active Shipments count, Monthly Revenue $, Avg Landed Cost $/unit, On-Time % with sparkline trends | — | Quick health assessment | 15s |
| 3 | `/dashboard` Shipment list | Switches tabs (Cold Chain / General / All), scans status badges, notes any delayed/held shipments | Tab selection | Prioritized attention list | 30s |
| 4 | `/dashboard/notifications` | Navigates to notifications via sidebar; sees unread count badge | — | Notification list with severity filters | 10s |
| 5 | `/dashboard/notifications` | Filters by severity (Critical first), reviews and marks as read | Severity filter | Triaged notification queue | 60s |
| 6 | `/dashboard/tracking` | Clicks through to problem shipment; reviews timeline, alerts, cost breakdown | Shipment ID | Root cause understanding + action plan | 120s |
| 7 | `/dashboard/analytics` | Reviews cost trends: 6-month spend area chart, cost distribution donut, cost-per-unit trend, monthly volume bars | — | Cost trajectory understanding | 90s |
| 8 | `/dashboard/savings` | Checks: total savings KPI, FTZ ROI analysis (3 zones), quarterly savings bar chart, breakdown table | — | Savings validation, FTZ performance | 60s |
| 9 | Dashboard | Logs out or queues follow-up actions based on findings | — | Action items for the day | 30s |

### Decision Points

| Point | Options | Criteria |
|-------|---------|----------|
| Step 3: Which shipment to review | By status (delayed > at-risk > on-time) or by value | Critical alerts and high-value shipments first |
| Step 5: Alert triage | Act now vs. monitor vs. dismiss | Severity level + financial impact + time sensitivity |
| Step 6: Problem resolution | Contact carrier vs. contact broker vs. file claim vs. wait | Type of issue (delay, customs hold, temperature excursion, cost overrun) |
| Step 7: Cost trend response | Acceptable vs. needs optimization | Cost-per-unit trending up > 5% month-over-month |
| Step 8: FTZ strategy adjustment | Continue current zones vs. explore new vs. reduce usage | ROI per zone; break-even met? |

### Error States & Recovery

| Error | Cause | Recovery |
|-------|-------|----------|
| Dashboard shows stale data | No live API refresh (current: static mock data) | Show "last updated" timestamp; manual refresh button |
| Notification count wrong | Read/unread state mismatch | Re-sync on page load; pull from server (future) |
| Analytics charts empty | No data for selected period | Show "No data for this period" with date range adjuster |
| Savings report shows 0 | No FTZ shipments in period | Link to FTZ Analyzer to evaluate FTZ strategy |
| Sidebar navigation broken on mobile | Overlay state issue | Tap outside to close; hamburger toggle always visible |

---

## 6. AI Agent Interaction Journey

**Goal:** User asks a logistics question, gets an AI-powered answer with source references, verifies accuracy, and provides feedback.

**Persona:** Any platform user needing quick answers about tariffs, compliance, FTZ rules, or shipping procedures.

**Status:** *Planned — not yet built. This maps the intended future experience.*

**Success Metrics:**
- Question-to-answer time < 5 seconds
- User acceptance rate (answer deemed helpful) > 75%
- Override/correction rate < 15%
- Knowledge Base deflection (answered by existing content) > 40%

### Flow

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│ 1. Trigger AI       │────▶│ 2. Type or voice     │────▶│ 3. AI processes    │
│    (chat widget /   │     │    logistics question │     │    against KB +     │
│    command bar)     │     │                       │     │    data sources     │
└─────────────────────┘     └──────────────────────┘     └─────────────────────┘
                                                            │
        ┌───────────────────────────────────────────────────┘
        ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│ 4. Review AI answer  │────▶│ 5. Check cited       │────▶│ 6. Accept answer │
│    with sources      │     │    sources/references │     │    OR override    │
└──────────────────────┘     └──────────────────────┘     └──────────────────┘
                                                            │
        ┌───────────────────────────────────────────────────┘
        ▼
┌──────────────────────┐     ┌──────────────────────┐
│ 7. Provide feedback  │────▶│ 8. AI learns from    │
│    (thumbs up/down)  │     │    correction (RLHF)  │
└──────────────────────┘     └──────────────────────┘
```

### Step Details

| Step | Screen/Page | User Action | Data In | Data Out | Time Est. |
|------|------------|-------------|---------|----------|-----------|
| 1 | Any page (floating widget) | Clicks chat icon or presses keyboard shortcut | — | Chat panel opens | 2s |
| 2 | Chat panel | Types question (e.g., "What's the Section 301 rate for HTS 6109.10 from Vietnam?") | Natural language query | — | 15s |
| 3 | Chat panel (loading) | Waits while AI searches: HTS database, Knowledge Base articles, FTZ data, compliance guides | Query | Matched data sources identified | 3-5s |
| 4 | Chat panel (response) | Reads structured answer with: direct answer, calculation if applicable, source citations | — | Answer + confidence score | 20s |
| 5 | Chat panel (sources) | Clicks source links to verify (e.g., HTS lookup table, Knowledge Base article, CBP regulation) | Source click | Source content in context | 30s |
| 6 | Chat panel | Accepts answer (proceeds with info) OR overrides with correction | Accept/Override + correction text | Decision recorded | 10s |
| 7 | Chat panel | Rates response: thumbs up/down + optional comment | Rating + comment | Feedback stored | 5s |
| 8 | Backend (invisible) | System records feedback for model improvement | Feedback data | Updated model weights (future) | 0s |

### Question Categories & Data Sources

| Category | Example Questions | Data Source |
|----------|------------------|-------------|
| Tariff rates | "What's the duty on cotton shirts from Cambodia?" | `hts-tariffs.ts` (200+ codes), Section 301 rates |
| FTZ rules | "Can I lock the current rate if I enter goods into FTZ 18?" | `knowledge-base-data.ts` FTZ guide articles |
| Compliance | "Do I need FDA prior notice for food imports?" | Compliance guides, regulatory data |
| Shipping | "What's the transit time from Ho Chi Minh to Long Beach?" | `routes.ts`, carrier schedules |
| Costs | "What are typical demurrage fees at LA?" | `ports.ts` port data, fee schedules |
| Process | "What documents do I need for ISF filing?" | Documentation matrix, customs forms |

### Decision Points

| Point | Options | Criteria |
|-------|---------|----------|
| Step 2: Query type | Factual lookup vs. calculation vs. recommendation vs. process guidance | Nature of the question |
| Step 4: Answer confidence | High confidence (direct data match) vs. low confidence (inference) | Show confidence indicator; caveat uncertain answers |
| Step 6: Accept vs. override | Trust AI vs. user has better info | User expertise level; answer matches their knowledge |
| Step 7: Feedback detail | Quick rating vs. detailed correction | User willingness to invest time in feedback |

### Error States & Recovery

| Error | Cause | Recovery |
|-------|-------|----------|
| "I don't know" response | Question outside knowledge base scope | Suggest relevant Knowledge Base section; offer to search web (future) |
| Incorrect tariff rate | Stale data or misclassified HTS code | Show data timestamp; link to USITC for verification; flag for admin review |
| Slow response (>10s) | Complex query requiring multiple lookups | Show progressive loading ("Searching HTS database... Checking compliance...") |
| Ambiguous question | Multiple interpretations possible | Ask clarifying question before answering; show "Did you mean...?" |
| Chat history lost | Session timeout or page refresh | Persist chat history in localStorage; show recent conversations |

---

## Cross-Journey Integration Points

These are the key handoffs where one journey feeds into another:

```
                    ┌──────────────────────┐
                    │     ONBOARDING       │
                    │    (Entry Point)      │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │ FREIGHT      │  │ FTZ          │  │ KNOWLEDGE    │
   │ QUOTE        │  │ STRATEGY     │  │ BASE         │
   │              │◀─▶│              │  │ (Reference)  │
   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
          │                 │                  │
          │    ┌────────────┘                  │
          ▼    ▼                               │
   ┌──────────────┐                            │
   │ DAILY        │◀───────────────────────────┘
   │ DASHBOARD    │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ IMPORT       │
   │ WORKFLOW     │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ AI AGENT     │
   │ (Any Journey)│
   └──────────────┘
```

### Key Integration Handoffs

| From | To | Trigger | Data Passed |
|------|----|---------|-------------|
| Onboarding | Freight Quote | User clicks calculator CTA | None (starts fresh) |
| Onboarding | FTZ Strategy | User clicks "Explore FTZ Analyzer" CTA | None (starts fresh) |
| Freight Quote | FTZ Strategy | User wants to evaluate FTZ for quoted shipment | HTS code, duty rate, shipment value |
| FTZ Strategy | Freight Quote | FTZ savings calculated, needs route comparison | Optimal country of origin, effective duty rate |
| Freight Quote | Import Workflow | Quote accepted, shipment created (future) | All shipment parameters |
| Import Workflow | Dashboard | Shipment in progress | Shipment ID, tracking events |
| Dashboard | Import Workflow | Alert triggers drill-down | Shipment ID |
| Knowledge Base | Any Journey | User looks up reference info | Context link back to originating tool |
| AI Agent | Any Journey | Answer includes link to tool/page | Relevant query parameters |

---

## Screen Reference Map

Maps each journey step to Stitch wireframe screens for design alignment:

| Journey | Steps | Primary Screen(s) | Stitch Screen ID |
|---------|-------|--------------------|-----------------|
| Onboarding | 1-9 | Landing/Proposal Page | `d58af36e1c3b4641bbff2eff41e40c5a` |
| Onboarding | 6-7 | Unit Economics Calculator | `725328c6212940888a4ee09720bfa7f4` |
| Freight Quote | 1-4 | Unit Economics Calculator | `725328c6212940888a4ee09720bfa7f4` |
| Freight Quote | 5 | Route Comparison Tool | `82f181456042408e8bed280455f3da89` |
| Freight Quote | 5 | Interactive Shipping Route Map | `70451a20f57c454b8a8c7301efc669aa` |
| Freight Quote | 7-9 | HTS Code Lookup & Tariff Estimator | `794de18354924a2fbc5ff8ae4c5d5ab4` |
| Import Workflow | 1-3 | Shipment Tracking Dashboard | `96adc16bb8694ea4a903516349bf6eb5` |
| Import Workflow | 4-6,9-10 | Shipment Tracking Dashboard (detail) | `96adc16bb8694ea4a903516349bf6eb5` |
| Import Workflow | 7 | Knowledge Base | `de9af48afa86462fa6103711f70615fd` |
| FTZ Strategy | 1-3 | HTS Code Lookup & Tariff Estimator | `794de18354924a2fbc5ff8ae4c5d5ab4` |
| FTZ Strategy | 4-6 | HTS Code Lookup & Tariff Estimator | `794de18354924a2fbc5ff8ae4c5d5ab4` |
| FTZ Strategy | 7-10 | FTZ Savings Analyzer | `a065abb0ead348d0999942ec540a5542` |
| Daily Dashboard | 1-3 | Shipment Tracking Dashboard | `96adc16bb8694ea4a903516349bf6eb5` |
| Daily Dashboard | 7-8 | Shipment Tracking Dashboard | `96adc16bb8694ea4a903516349bf6eb5` |
| AI Agent | All | Floating widget (no dedicated screen yet) | — |
