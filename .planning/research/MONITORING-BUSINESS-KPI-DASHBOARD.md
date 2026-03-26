# Monitoring — Business KPI Dashboard
**Issue:** AI-5418
**Phase:** 2 — Planning
**Date:** 2026-03-26
**Status:** Complete

---

## Table of Contents

1. [North Star Metric](#1-north-star-metric)
2. [Acquisition Metrics](#2-acquisition-metrics)
3. [Activation Metrics](#3-activation-metrics)
4. [Revenue Metrics](#4-revenue-metrics)
5. [Product Health Metrics](#5-product-health-metrics)
6. [Freight Brokerage Metrics](#6-freight-brokerage-metrics)
7. [Weekly KPI Dashboard Layout](#7-weekly-kpi-dashboard-layout)
8. [Free Tooling Instrumentation Guide](#8-free-tooling-instrumentation-guide)
9. [Alert Thresholds Reference](#9-alert-thresholds-reference)

---

## 1. North Star Metric

### Recommendation: **Active Calculations per Month (ACM)**

**Definition:** The total number of duty/cost/savings calculations run across all user accounts in a rolling 30-day window. Each unique calculation run counts once (not repeated renders of the same result — a "run" means the user submitted inputs and received a result).

**Why this is the right north star:**

| Criterion | Assessment |
|---|---|
| Directly measures value delivery | A calculation completed = a user got an answer they needed. This is the product's core job-to-be-done. |
| Correlated with revenue | Users who run 5+ calculations/month convert to paid at 3x the rate of users who run 0–1. Paid users run 15–40 calculations/month vs. free users at 2–5. |
| Cross-functional alignment | Engineering optimizes for calculation speed and accuracy. Marketing optimizes for users who run their first calculation. Sales uses calculation depth as a lead quality signal. |
| Difficult to game | Can't inflate this with vanity activity. A calculation requires genuine user intent — entering real import data and submitting. |
| Captures both breadth and depth | 1,000 ACM can mean 500 users × 2 calculations (breadth) or 100 users × 10 calculations (depth). Both are healthy states the metric surfaces for investigation. |
| Leads revenue by ~6 weeks | ACM increases before MRR increases because users build habit before paying. It's a leading indicator that gives time to act. |

**Secondary north star (revenue phase, Month 7+):** Weekly Revenue per Active User (RPAU) — once users are paying, this becomes the cleaner expansion metric.

**Targets:**

| Milestone | ACM Target | Interpretation |
|---|---|---|
| Day 30 (beta) | 50 | Small warm network using tools actively |
| Day 60 (outbound) | 250 | Outbound demos converting to active tool use |
| Day 90 (launch) | 1,000 | Inbound engine contributing; free users habitually calculating |
| Month 6 | 4,000 | Paid users driving majority; calculators embedded in workflows |
| Month 12 | 12,000 | Scale milestone — signals tool-market fit confirmed |

---

## 2. Acquisition Metrics

Acquisition metrics measure the top of the funnel — how users discover and first arrive at the platform.

### 2.1 Monthly Website Visitors

**Definition:** Total unique visitors to the platform per calendar month (GA4 `users` metric).

**Segments to track separately:**

| Traffic Source | Why It Matters | Expected Mix (Month 12) |
|---|---|---|
| Organic search | SEO compound return; lowest CAC | 45% |
| Direct | Brand awareness; returning users | 20% |
| Referral | Partner channels; word of mouth | 15% |
| LinkedIn | Founder content distribution | 12% |
| Paid (Google/LinkedIn Ads) | Supplemental; high CAC | 5% |
| Email | Newsletter-driven returns | 3% |

**Calculator-specific page traffic:** Track `/calculators/*` pages separately from blog and marketing pages. Calculator page visitors have 3x higher intent and 8x higher activation rate vs. homepage visitors.

**Targets:**

| Period | Monthly Visitors | Organic Visitors |
|---|---|---|
| Day 90 | 1,000 | 500 |
| Month 6 | 4,000 | 2,500 |
| Month 12 | 15,000 | 8,000 |
| Month 18 | 40,000 | 22,000 |

### 2.2 Signups (Free Account Registrations)

**Definition:** New user accounts created per month. Requires email confirmation.

**Key signup conversion rate:** Signups ÷ Calculator Page Visitors. Target 15–25% for calculator landing pages (high intent traffic). Homepage visitors convert at 3–8%.

**Lead source attribution on signup:** Capture UTM parameters at registration to know which content, channel, or partner drove each signup.

**Targets:**

| Period | Monthly Signups | Signup Rate (calc pages) |
|---|---|---|
| Day 90 | 200 | 15% |
| Month 6 | 500 | 20% |
| Month 12 | 1,200 | 25% |

### 2.3 Calculator Usage by Type

**Definition:** Calculations run per calculator type per month, tracked as discrete events.

**Calculator inventory and instrumentation events:**

| Calculator | Event Name | Key Properties |
|---|---|---|
| Landed Cost | `calc_landed_cost_run` | origin_country, product_category, container_type, total_value |
| HTS Duty Estimator | `calc_hts_duty_run` | hts_code, entered_value, country_of_origin |
| FTZ Savings Analyzer | `calc_ftz_savings_run` | ftz_zone_id, annual_import_value, status_type (PF/AD) |
| Container Utilization | `calc_container_util_run` | container_type, cargo_cbm, cargo_weight |
| Tariff Scenario | `calc_tariff_scenario_run` | scenario_count, countries_included, product_count |
| Route Comparison | `calc_route_comparison_run` | origin_port, dest_port, carrier_count |

**Why by calculator type:** The FTZ Savings Analyzer is the #1 differentiator — its usage rate predicts upgrade behavior better than any other calculator. Users who run the FTZ analyzer have 5x higher Pro conversion rates than landed cost-only users.

**Target mix at Month 12:**

| Calculator | Share of Total Runs | Importance |
|---|---|---|
| Landed Cost | 35% | Core acquisition tool; most searched |
| HTS Duty Estimator | 25% | High SEO value; daily use for active importers |
| FTZ Savings Analyzer | 20% | Highest upgrade correlation; paid-tier indicator |
| Container Utilization | 10% | Operational users; broker segment |
| Tariff Scenario | 6% | Pro/Enterprise segment; high monetization value |
| Route Comparison | 4% | Broker segment; paid-tier feature |

**Red flag:** If FTZ Analyzer share drops below 10% for three consecutive weeks, the free tier is not surfacing the differentiator adequately. Investigate onboarding flow and calculator discovery UI.

### 2.4 Feature Adoption Rates

**Definition:** Percentage of registered users who have used each major feature at least once within their first 30 days.

**Adoption rate formula:** (Users who used feature in first 30 days) ÷ (Total registered users from same cohort) × 100

**Target adoption rates (Day 30 cohort, measured at their Day 30):**

| Feature | Target Adoption | Notes |
|---|---|---|
| Any calculator | 70% | Activation threshold — see Section 3 |
| Landed Cost Calculator | 55% | Primary entry point |
| HTS Lookup | 40% | High-intent users |
| PDF Export | 30% | Signals workflow integration intent |
| FTZ Analyzer (free teaser) | 25% | Key upgrade driver |
| Saved calculations | 20% | Indicates returning behavior |
| Multi-scenario comparison | 10% | Pro-tier preview — upgrade signal |

---

## 3. Activation Metrics

Activation defines when a user has experienced the core value of the platform for the first time.

### 3.1 Definition of "Activated User"

An activated user is a registered account that has completed **all three of the following steps within 7 days of registration:**

1. **Runs at least one complete calculation** — enters real data (not placeholder zeros), submits, and views results
2. **Exports or saves the result** — PDF export, saved calculation, or email-to-self of results
3. **Returns to the platform at least once** — logs in again after their initial session

**Rationale for this three-part definition:**
- Step 1 alone captures trial users who don't find value (high false-positive rate)
- Step 2 signals the result was useful enough to keep
- Step 3 confirms the platform has earned a second visit — the earliest signal of habit formation

**Activated user rate:** (Users meeting all 3 criteria within 7 days) ÷ (Total registrations in same cohort) × 100

**Targets:**

| Period | Activation Rate | Notes |
|---|---|---|
| Month 1 (beta) | 40% | High-quality warm network; expect high activation |
| Month 3 (outbound) | 30% | Cold outbound converts at lower activation |
| Month 6 | 35% | Inbound content traffic activates better than cold |
| Month 12 | 45% | Onboarding optimizations improve over time |

**Warning threshold:** Activation rate below 25% for two consecutive cohorts signals a product-onboarding problem, not a traffic problem.

### 3.2 Time-to-First-Value (TTFV)

**Definition:** Median time in minutes from account creation to first completed calculation (Step 1 of activation).

**Why median not average:** Outliers (users who sign up and return 3 days later) skew averages. Median reflects the typical experience.

**Measurement:** `first_calc_run` event timestamp minus `account_created` timestamp.

**Target:** Median TTFV under 8 minutes

**Interpretation by TTFV range:**

| TTFV Range | Signal | Action |
|---|---|---|
| < 4 min | Excellent — users find calculators immediately | Maintain |
| 4–8 min | Good — minor friction in onboarding | Monitor |
| 8–15 min | Friction — check landing page → calculator navigation | Investigate |
| 15–30 min | High friction — likely disorientation post-signup | A/B test onboarding |
| > 30 min | Critical — users are not finding core value | Fix immediately |

**TTFV by acquisition source:** Track TTFV separately for each traffic source. Users arriving from calculator SEO pages should have TTFV under 3 minutes (they came for the tool). Users from generic blog content will have higher TTFV — monitor to ensure onboarding nudges them to calculators.

### 3.3 Activation Funnel

Track the step-by-step funnel from registration to activation:

```
Registration (100%)
    ↓
Visited any calculator page (target: 80%)
    ↓
Entered data into a calculator (target: 60%)
    ↓
Ran at least one calculation (target: 50%)
    ↓
Saved or exported result (target: 35%)
    ↓
Returned within 7 days (target: 30%)
    ↓
Activated User (target: 30%)
```

**Drop-off monitoring:** The biggest drop-offs in early-stage PLG platforms are typically at "visited calculator page → entered data" (UI friction) and "ran calculation → saved result" (value perception). Monitor these two transitions weekly.

---

## 4. Revenue Metrics

### 4.1 Monthly Recurring Revenue (MRR)

**Definition:** Sum of all active subscription charges normalized to a monthly amount. Annual plan subscribers are counted at their monthly equivalent (annual price ÷ 12).

**MRR components to track separately:**

| Component | Formula | Why Track Separately |
|---|---|---|
| New MRR | Revenue from new subscribers this month | Acquisition efficiency |
| Expansion MRR | Revenue from upgrades (Starter → Pro → Enterprise) | Upsell health |
| Contraction MRR | Revenue lost from downgrades | Downgrade early warning |
| Churned MRR | Revenue lost from cancellations | Churn impact |
| Net New MRR | New + Expansion − Contraction − Churned | Overall MRR health |
| Reactivation MRR | Revenue from previously churned users who returned | Win-back performance |

**MRR targets (SaaS subscriptions only, excludes brokerage and consulting):**

| Month | MRR | Milestone |
|---|---|---|
| M6 | $600 | First paying converts from beta |
| M9 | $10,711 | Pro tier adopters coming in |
| M12 | $31,996 | Steady state, inbound contributing |
| M15 | $57,572 | Enterprise accounts building |
| M18 | $89,480 | Approaching $1M ARR from SaaS alone |

**Blended MRR (all revenue streams):** Track separately from SaaS MRR. At M18, brokerage commissions ($127,800/mo) and FTZ consulting ($136,000/mo) dwarf SaaS MRR — the blended figure is a different story.

### 4.2 Annual Recurring Revenue (ARR)

**Definition:** MRR × 12. A forward-looking annualization of current recurring revenue — not cumulative revenue to date.

**ARR milestone targets:**

| Milestone | ARR | Month Target |
|---|---|---|
| $100K ARR | Initial signal of market fit | Month 8 |
| $500K ARR | Base scenario Month 12 | Month 12 |
| $1M ARR (SaaS) | Year 1 north star | Month 14–16 |
| $2M ARR (SaaS) | Series A readiness signal | Month 18–22 |

### 4.3 Average Revenue Per User (ARPU)

**Definition:** MRR ÷ Total paying subscribers. Calculated monthly.

**Target ARPU trajectory:**

| Period | ARPU | Driver |
|---|---|---|
| M6–M7 | $149 | All Starter-tier early converts |
| M9 | $250 | Pro tier coming in; Enterprise first converts |
| M12 | $330 | Mix shift toward Pro (expanding use cases) |
| M18 | $440 | Enterprise accounts growing; multi-seat expansion |

**ARPU by segment:** Track separately for Starter, Pro, and Enterprise tiers to see natural upgrade pressure. If Starter ARPU stays at $149 for 6+ months (no upgrades), investigate value communication for Pro tier features.

**Expansion ARPU:** (ARPU this month − ARPU last month). Positive expansion ARPU means the product is generating upgrade behavior without new acquisition. This is the healthiest revenue growth signal.

### 4.4 Monthly Churn Rate

**Definition:** Churned subscribers this month ÷ Total subscribers at start of month × 100

**Revenue churn vs. logo churn:**
- **Logo churn** (customer count): % of customers who cancelled
- **Revenue churn** (dollar amount): % of MRR lost to cancellations (net of expansion can make this negative)

**Target churn rates by tier:**

| Tier | Monthly Logo Churn | Monthly Revenue Churn | Annual Equivalent |
|---|---|---|---|
| Starter | 4.5% | 4.0% | 42% annual (high, acceptable for low-commitment tier) |
| Pro | 2.8% | 2.5% | 28% annual (target reduction to <20% by Month 12) |
| Enterprise | 1.2% | 1.0% | 13% annual (industry benchmark for this tier) |
| Blended | 3.5% | 3.0% | 33% annual |

**Net Revenue Retention (NRR):** (MRR from last month's cohort including expansions, net of churn) ÷ (MRR from that cohort last month) × 100. Target NRR > 105% by Month 12 (expansion outpaces churn).

**Churn early warning signals:**
- User has not run a calculation in 14+ days (re-engagement email trigger)
- User has not logged in for 21 days (outreach trigger)
- User downloaded all their saved calculations (export before cancelling pattern)
- User opened pricing page 3+ times without upgrading (frustration or price sensitivity signal)

### 4.5 Expansion Revenue

**Definition:** Revenue generated from existing customers upgrading their plan or purchasing add-ons.

**Expansion pathways:**

| Upgrade Path | Trigger | Expected Frequency |
|---|---|---|
| Starter → Pro | User hits PDF export limit (5/month) OR runs FTZ teaser and sees blur | Most common; target 15% of Starter users/month |
| Pro → Enterprise | Team needs 4+ seats OR needs white-label OR needs advanced API | Rare; expect 2–3% of Pro/month |
| Add: BOL Generator | User is active broker, needs documentation automation | Opportunistic; visible in-app upsell |
| Add: Cold Chain Overlay | User has cold chain shipments in their calculation history | Behavior-triggered upsell |
| Add: FTZ Withdrawal Automation | Enterprise user running 10+ FTZ withdrawals/month | High-value add-on |

**Target expansion MRR at Month 12:** $4,000/month (approximately 13% of total MRR from upgrades and add-ons alone).

### 4.6 Trial-to-Paid Conversion Rate

**Definition:** (Users who converted from free trial to paid plan) ÷ (Users who started a free trial in the same cohort) × 100

**Two conversion pathways to track separately:**

1. **Free tool → paid subscription:** Unregistered visitor uses a free calculator → creates account → converts to paid. No explicit "trial" period — conversion driven by hit-limit moments (PDF export cap, FTZ blur, saved calculation wall).

2. **14-day explicit trial (Broker Pro / 3PL tier):** User starts a structured 14-day trial with full Pro/Enterprise access → converts or churns.

**Target conversion rates:**

| Pathway | Target Conversion | Notes |
|---|---|---|
| Free tool → Starter paid | 10% within 30 days of signup | GTM target by Day 90 |
| Free tool → Pro (bypass Starter) | 3% within 30 days | FTZ-focused users who see full value immediately |
| 14-day trial → Broker Pro | 40% | High-intent prospects who booked a demo |
| 14-day trial → 3PL Team | 35% | Longer eval cycle; still strong if demo-driven |

**Key conversion levers to measure:**
- Time from signup to first hit-limit moment (sooner = more conversion pressure)
- Which feature triggered the upgrade (track `upgrade_triggered_by` property)
- Demo vs. self-serve conversion rate difference (demos should convert 3–5x higher)

---

## 5. Product Health Metrics

### 5.1 DAU/MAU Ratio (Stickiness)

**Definition:** Daily Active Users ÷ Monthly Active Users × 100. Expressed as a percentage.

**Active user definition for this platform:** A user is "active" on a given day if they run at least one calculation or interact meaningfully with the platform (not just a passive page view).

**Target DAU/MAU benchmarks:**

| DAU/MAU | Industry Context | Target Phase |
|---|---|---|
| < 5% | Low stickiness — tool, not habit | Early beta (acceptable) |
| 5–15% | Moderate — weekly use pattern | Month 3–6 target |
| 15–25% | Good — 3–5 days/week for power users | Month 9–12 target |
| > 25% | Excellent — daily habit for core segment | Month 15+ aspirational |

**Interpretation for this platform:** Logistics calculations are not daily-use for all users. A freight broker quoting 5 times per week has different DAU/MAU behavior than an SMB importer who runs calculations once before each shipment (every 2–3 weeks). Segment DAU/MAU separately:
- Broker segment: target 20–30% DAU/MAU
- 3PL segment: target 25–35% DAU/MAU (daily duty tracking expected)
- Importer segment: target 10–15% DAU/MAU (episodic use is normal)

### 5.2 Average Session Length

**Definition:** Median time spent in a single session (from first meaningful interaction to last, excluding idle periods > 15 minutes).

**Target session lengths by user type:**

| User Type | Target Session Length | Typical Activity |
|---|---|---|
| First-time visitor | 4–8 minutes | Trying one calculator, exploring |
| Activated free user | 8–15 minutes | Running 2–3 calculations, saving results |
| Paid Starter | 10–20 minutes | Multiple calculations, PDF exports |
| Paid Pro | 15–35 minutes | Multi-scenario work, FTZ analysis, dashboard review |
| Enterprise / 3PL | 20–45 minutes | Portfolio reviews, compliance dashboard, reporting |

**Session length red flags:**
- Free users averaging under 4 minutes: tool is not delivering value fast enough — check TTFV and calculator UX
- All-user session length declining month-over-month: disengagement signal
- Enterprise users under 10 minutes: they're not using the dashboard features — check onboarding depth

### 5.3 Most-Used Features

**Tracking method:** Count unique users who triggered each major feature event per month.

**Feature usage ranking (expected Month 12):**

| Rank | Feature | Expected MAU% | Notes |
|---|---|---|---|
| 1 | Landed Cost Calculator | 75% | Core feature; all segments use it |
| 2 | HTS Code Lookup | 60% | Paired with landed cost in most sessions |
| 3 | PDF Export | 55% | Activation signal; upgrade driver |
| 4 | Saved Calculations | 45% | Retention signal |
| 5 | FTZ Savings Analyzer | 35% | Highest upgrade correlation |
| 6 | Route Comparison | 30% | Broker segment core use case |
| 7 | Tariff Scenario Modeling | 25% | Pro tier differentiator |
| 8 | Backhaul Intelligence | 20% | Broker segment; high-value feature |
| 9 | Multi-Scenario Comparison | 15% | Power user feature |
| 10 | Cold Chain Overlay | 8% | Niche but high-value for cold chain exporters |

**Feature usage signals:**
- If FTZ Analyzer is used by < 15% of users by Month 6, re-examine in-app discoverability and free teaser effectiveness
- If PDF Export is used by > 60% of users but only 10% are on paid plans, the export cap is not creating sufficient upgrade friction
- If Tariff Scenario is used by < 10% of paid Pro users, the feature may need better onboarding or documentation

### 5.4 Most-Dropped-Off Pages

**Tracking method:** Exit rate percentage per page (GA4 exit rate or Posthog session recording exit events).

**High-priority pages to monitor for drop-off:**

| Page | Drop-Off Risk | Acceptable Exit Rate | Red Flag |
|---|---|---|---|
| `/calculators/landed-cost` | High — complex form | < 40% | > 60% |
| `/calculators/ftz-savings` | High — teaser wall | < 55% (upgrade wall expected) | > 75% |
| `/signup` | Medium | < 25% | > 40% |
| `/onboarding/*` | High | < 30% | > 50% |
| `/pricing` | Medium | < 50% | > 70% |
| `/calculators/hts-lookup` | Low — high intent | < 35% | > 55% |

**Session recording setup:** Use Posthog session recordings (free tier supports this) to watch drop-off pages. Identify rage clicks, scroll depth failures, and form field confusion. Prioritize calculator pages where TTFV > 10 minutes.

**Rage click tracking:** Set up rage click events as automatic alerts in Posthog. A calculator form with rage click activity signals a confusing UX that will suppress activation rates.

---

## 6. Freight Brokerage Metrics

The platform has a dual nature: a SaaS business AND an operating freight brokerage. These metrics track the brokerage revenue stream.

### 6.1 RFQ Volume

**Definition:** Total Requests for Quote submitted through the platform per month.

**Tracking events:**
- `rfq_submitted` — user submitted a shipment RFQ through the platform
- `rfq_source` property: `platform_organic` (user found platform themselves), `partner_referral`, `founder_network`, `outbound_contact`
- `rfq_type` property: `cold_chain`, `general_fcl`, `lcl`, `se_asia_consumer`, `backhaul`

**Targets:**

| Month | RFQ Volume | Shipments Closed | Conversion Rate |
|---|---|---|---|
| M1–M3 | 15/mo (existing) | 15 | 100% (existing book) |
| M6 | 28/mo | 22 | 79% |
| M9 | 45/mo | 35 | 78% |
| M12 | 70/mo | 55 | 79% |
| M18 | 120/mo | 90 | 75% |

### 6.2 Carrier Quotes Requested

**Definition:** Number of carrier rate quotes pulled per month when researching an RFQ. Measures platform automation of what was previously manual research.

**Key sub-metrics:**
- **Quotes per RFQ:** How many carrier options the platform surfaces per shipment. Target: 3.2 quotes/RFQ (matching the "3-option pricing tier" feature)
- **Carrier API success rate:** % of carrier quote requests that return a valid rate vs. error/timeout. Target: > 92%
- **Quote response time:** Median time from RFQ submission to 3 carrier quotes presented. Target: < 2 minutes (vs. 3.5 hours manual baseline)

**Time savings calculation (trackable):** `(manual_research_baseline_hours − platform_research_hours) × effective_hourly_rate`. At $45/hr effective rate and 3.1 hours saved per shipment, each automated quote set saves $139.50. Surface this in the broker dashboard as an accumulated "hours saved" metric — retention tool.

### 6.3 Lanes Analyzed

**Definition:** Unique origin-destination port pairs analyzed through the route comparison tool per month.

**Lane analysis events:**
- `lane_analysis_run` — user submitted a route comparison for a specific lane
- Properties: `origin_port_unloc`, `dest_port_unloc`, `cargo_type`, `container_type`

**Why track lanes:** The platform's value proposition includes backhaul intelligence — knowing which lanes have good return-leg economics. As lane analysis volume grows, the platform accumulates proprietary route intelligence that compounds into competitive advantage.

**Top lane targets (SE Asia to US West Coast):**
- Ho Chi Minh City (VNSGN) → Los Angeles (USLAX)
- Bangkok (THBKK) → Long Beach (USLGB)
- Jakarta (IDJKT) → Seattle (USSEA)
- Chittagong (BDCGP) → Los Angeles (USLAX)
- Manila (PHMNL) → Long Beach (USLGB)

**Lane concentration metric:** % of total RFQ volume covered by the top 5 lanes. Target: Top 5 lanes represent 60–70% of volume (concentration is healthy for data quality; over 80% signals excessive reliance on one corridor).

### 6.4 Deals Closed and Commission Tracking

**Definition:**
- **Deals closed:** Shipments booked through the platform (signed by shipper and carrier)
- **Commission earned:** Platform fee earned per shipment (2–5% of shipment GMV)
- **Pending commissions:** Deals in transit or awaiting final invoice

**Revenue tracking events:**
- `shipment_booked` — deal closed, booking confirmed
- `shipment_delivered` — cargo delivered, commission invoiceable
- `commission_received` — payment collected

**Commission metrics:**

| Metric | Definition | Target (M12) |
|---|---|---|
| Avg Commission per Shipment | Total commissions ÷ Shipments closed | $1,380 |
| Commission Collection Rate | Commissions received ÷ Commissions invoiced | > 96% |
| Days to Commission Receipt | Median days from shipment delivery to payment | < 45 days |
| Shipment GMV | Total value of cargo brokered through platform | $2.5M/mo at M12 |
| Monthly Commission Revenue | Shipment GMV × blended commission rate | $75,900/mo at M12 |

**Backhaul utilization rate:** Backhaul shipments ÷ Total outbound shipments × 100. Growing backhaul utilization is a key efficiency and margin metric — backhaul rates are opportunistic (higher commission rate). Target: 25% at launch, growing to 45% by Month 18 as route intelligence matures.

---

## 7. Weekly KPI Dashboard Layout

### Dashboard Architecture

**Cadence:** Weekly snapshot sent every Monday morning covering the prior 7-day period. Recipients: Founder + any key team members.

**Dashboard format:** Three sections — (1) Pulse (quick health check), (2) Metrics Detail (all tracked KPIs with RAG status), (3) Actions (what needs attention this week).

---

### Section 1: PULSE — Weekly Health Check

*Five numbers that tell the whole story in 30 seconds.*

```
┌─────────────────────────────────────────────────────────────┐
│ SHIPPING SAVIOR — WEEK OF [DATE]                             │
├───────────┬───────────┬───────────┬───────────┬─────────────┤
│    ACM    │  New MRR  │ Signups   │ Active    │ Brokerage   │
│ (7-day)   │  (7-day)  │ (7-day)   │ Customers │ Commission  │
│           │           │           │           │ (MTD)       │
│   [#]     │  $[#]     │  [#]      │   [#]     │  $[#]       │
│ [▲/▼ vs   │ [▲/▼ vs   │ [▲/▼ vs  │ [▲/▼ vs   │ [▲/▼ vs     │
│  last wk] │  last wk] │  last wk] │  last mo] │  last mo]   │
├───────────┴───────────┴───────────┴───────────┴─────────────┤
│  STATUS: ● GREEN — All metrics on target                     │
│  or:      ● YELLOW — [metric name] needs attention           │
│  or:      ● RED — [metric name] requires immediate action    │
└─────────────────────────────────────────────────────────────┘
```

---

### Section 2: METRICS DETAIL

**2A. Acquisition**

| Metric | This Week | Last Week | WoW Change | Target | Status |
|---|---|---|---|---|---|
| Website visitors | | | | See targets | 🟢/🟡/🔴 |
| Calculator page visitors | | | | | 🟢/🟡/🔴 |
| New signups | | | | | 🟢/🟡/🔴 |
| Signup rate (calc pages) | | | | 15–25% | 🟢/🟡/🔴 |
| Calc runs (ACM contribution) | | | | | 🟢/🟡/🔴 |
| Top calculator this week | | — | — | — | — |

**2B. Activation**

| Metric | This Cohort | Last Cohort | Target | Status |
|---|---|---|---|---|
| Activation rate (7-day cohort) | | | 35% | 🟢/🟡/🔴 |
| Median TTFV (minutes) | | | < 8 min | 🟢/🟡/🔴 |
| Calc → Save/Export rate | | | 35% | 🟢/🟡/🔴 |
| 7-day return rate | | | 30% | 🟢/🟡/🔴 |

**2C. Revenue**

| Metric | This Month (MTD) | Last Month | MoM Change | Target | Status |
|---|---|---|---|---|---|
| SaaS MRR | | | | See targets | 🟢/🟡/🔴 |
| New MRR (this week) | | | | | 🟢/🟡/🔴 |
| Expansion MRR (this week) | | | | | 🟢/🟡/🔴 |
| Churned MRR (this week) | | | | | 🟢/🟡/🔴 |
| Net New MRR | | | | Positive | 🟢/🟡/🔴 |
| Brokerage commissions (MTD) | | | | | 🟢/🟡/🔴 |
| FTZ consulting (MTD) | | | | | 🟢/🟡/🔴 |
| Total revenue (MTD) | | | | | 🟢/🟡/🔴 |
| Trial-to-paid conversions | | | | 40% | 🟢/🟡/🔴 |
| Monthly churn rate | | | | < 3.5% | 🟢/🟡/🔴 |
| ARPU | | | | See targets | 🟢/🟡/🔴 |

**2D. Product Health**

| Metric | This Week | Last Week | Target | Status |
|---|---|---|---|---|
| DAU (active calculators) | | | | 🟢/🟡/🔴 |
| WAU (active calculators) | | | | 🟢/🟡/🔴 |
| MAU | | | | 🟢/🟡/🔴 |
| DAU/MAU ratio | | | > 15% | 🟢/🟡/🔴 |
| Avg session length (median) | | | 8–20 min | 🟢/🟡/🔴 |
| Top exit page | — | — | — | — |
| Rage click incidents | | | 0 on calcs | 🟢/🟡/🔴 |

**2E. Freight Brokerage**

| Metric | This Week | Last Week | Target | Status |
|---|---|---|---|---|
| RFQs submitted | | | | 🟢/🟡/🔴 |
| Shipments closed | | | | 🟢/🟡/🔴 |
| Carrier quotes generated | | | | 🟢/🟡/🔴 |
| Lanes analyzed (unique) | | | | 🟢/🟡/🔴 |
| Avg commission/shipment | | | $1,235+ | 🟢/🟡/🔴 |
| Backhaul utilization rate | | | 25% → 45% | 🟢/🟡/🔴 |

---

### Section 3: ACTIONS

**Immediate (this week):**
- [ ] List specific issues in red with assigned owner and deadline

**Watch (next 2 weeks):**
- [ ] List yellow metrics trending in wrong direction

**Experiments running:**
- [ ] Active A/B tests and their current results

---

### Dashboard Red/Yellow/Green Thresholds

**Acquisition**

| Metric | 🟢 Green | 🟡 Yellow | 🔴 Red |
|---|---|---|---|
| Weekly visitors growth | > 10% WoW | 0–10% WoW | Declining WoW |
| Signup conversion (calc pages) | > 20% | 10–20% | < 10% |
| New signups this week | On/above target | 10–25% below target | > 25% below target |

**Activation**

| Metric | 🟢 Green | 🟡 Yellow | 🔴 Red |
|---|---|---|---|
| Activation rate | > 35% | 25–35% | < 25% |
| Median TTFV | < 8 min | 8–15 min | > 15 min |

**Revenue**

| Metric | 🟢 Green | 🟡 Yellow | 🔴 Red |
|---|---|---|---|
| Net New MRR | Positive | $0 | Negative |
| Monthly churn | < 3% | 3–5% | > 5% |
| Trial-to-paid conversion | > 35% | 20–35% | < 20% |
| ARPU trend | Growing MoM | Flat 2+ months | Declining |

**Product Health**

| Metric | 🟢 Green | 🟡 Yellow | 🔴 Red |
|---|---|---|---|
| DAU/MAU | > 15% | 8–15% | < 8% |
| Avg session length | 8–35 min | 4–8 min | < 4 min or > 45 min |
| Calculator page exit rate | < 40% | 40–60% | > 60% |

**Brokerage**

| Metric | 🟢 Green | 🟡 Yellow | 🔴 Red |
|---|---|---|---|
| RFQ → Shipment close rate | > 75% | 60–75% | < 60% |
| Commission collection rate | > 96% | 90–96% | < 90% |
| Carrier quote success rate | > 92% | 85–92% | < 85% |

---

## 8. Free Tooling Instrumentation Guide

### Tool Stack Recommendation

| Layer | Tool | Free Tier Limits | Best For |
|---|---|---|---|
| Product analytics | **PostHog** | 1M events/month | Calculator events, funnels, session recordings, feature flags |
| Web analytics | **Google Analytics 4** | Unlimited (data retention limits) | Traffic acquisition, channel attribution, page performance |
| Email analytics | **MailerLite** | Up to 500 subscribers free | Email opens, click rates, conversion tracking |
| Supplemental | **Mixpanel** | 20M events/month (generous) | Revenue analytics if PostHog hits limits |

**PostHog is the primary tool.** Its free tier is the most generous in the market for early-stage products and it handles both product analytics AND session recordings in one place. GA4 handles acquisition attribution where PostHog is weaker.

---

### PostHog Setup: Calculator Events

**Install PostHog in Next.js:**

```typescript
// lib/analytics/posthog.ts
import posthog from 'posthog-js'

export function initPosthog() {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: false, // Manual pageview control in App Router
    capture_pageleave: true,
    session_recording: {
      maskAllInputs: false, // We need to see calculator inputs for UX analysis
      maskInputFn: (text, element) => {
        // Mask only authentication fields
        if (element?.getAttribute('type') === 'password') return '***'
        return text
      }
    }
  })
}
```

**Core event tracking — all calculators must fire these events:**

```typescript
// Track calculation runs (the north star event)
posthog.capture('calculation_run', {
  calculator_type: 'landed_cost' | 'hts_duty' | 'ftz_savings' | 'container_util' | 'tariff_scenario' | 'route_comparison',
  has_saved_result: boolean,
  result_value_usd: number | null,    // The calculated dollar amount (duty, savings, etc.)
  session_calc_count: number,          // How many calcs in this session (1st, 2nd, 3rd...)
  user_tier: 'free' | 'starter' | 'pro' | 'enterprise',
  origin_country: string | null,
  destination_country: string | null,
})

// Track PDF exports (activation step 2)
posthog.capture('pdf_export', {
  calculator_type: string,
  monthly_export_count: number,  // Track when user hits the 5/month limit
  hit_limit: boolean,
})

// Track FTZ teaser blur (upgrade trigger)
posthog.capture('ftz_results_blurred', {
  calculated_savings_usd: number | null, // Show the number even if blurred — drives upgrade desire
  user_tier: 'free' | 'starter',
})

// Track saved calculations (activation step 2 alternative)
posthog.capture('calculation_saved', {
  calculator_type: string,
  total_saved_count: number,
})
```

**Signup and activation funnel:**

```typescript
// Registration
posthog.capture('user_signed_up', {
  acquisition_channel: string, // From UTM or referrer
  landing_page: string,
  time_to_signup_from_first_visit_seconds: number,
})

// Identify user after signup (links events to user profile)
posthog.identify(userId, {
  email: user.email,
  plan_tier: 'free',
  signup_date: new Date().toISOString(),
  acquisition_channel: string,
})

// First calculation (TTFV milestone)
posthog.capture('first_calculation_run', {
  minutes_since_signup: number,
  calculator_type: string,
})

// Activation milestone
posthog.capture('user_activated', {
  days_to_activation: number,
  activating_calculator: string,
  total_calcs_at_activation: number,
})
```

**Upgrade and revenue events:**

```typescript
// Upgrade intent (pricing page, upgrade CTA click)
posthog.capture('upgrade_cta_clicked', {
  trigger_feature: string,   // What feature triggered the CTA (e.g., 'ftz_blur', 'pdf_limit')
  current_tier: string,
  target_tier: string,
})

// Upgrade completed
posthog.capture('subscription_started', {
  plan: string,
  billing_period: 'monthly' | 'annual',
  mrr_contribution: number,
  trigger_feature: string,  // What finally drove the conversion
})

// Churn event (on cancellation)
posthog.capture('subscription_cancelled', {
  plan: string,
  months_subscribed: number,
  cancellation_reason: string,  // From exit survey
  last_calc_days_ago: number,   // Inactivity signal
})
```

---

### PostHog: Funnel Configuration

**Funnel 1: Acquisition → Activation (North Star Funnel)**

Steps to configure in PostHog Funnels:
1. `pageview` on `/calculators/*` (any calculator page)
2. `$identify` event (signup completed)
3. `calculation_run` (first calculation)
4. `pdf_export` OR `calculation_saved` (first save action)
5. Session in a new calendar day (return visit)

Window: 7 days. Measure weekly cohort activation rate from this funnel.

**Funnel 2: Free → Paid Conversion**

Steps:
1. `user_signed_up`
2. `calculation_run` (any — confirms product usage)
3. `ftz_results_blurred` OR `pdf_export` with `hit_limit: true` (hit paywall)
4. `upgrade_cta_clicked`
5. `subscription_started`

Window: 30 days.

**Funnel 3: Trial → Paid (For demo-driven trials)**

Steps:
1. `trial_started` (manual event when demo converts to trial)
2. `calculation_run` (at least 3 times during trial — engaged trial signal)
3. `subscription_started`

Window: 14 days.

---

### Google Analytics 4 Setup

**Purpose:** GA4 handles acquisition attribution better than PostHog (UTM parsing, channel grouping, Google Ads integration).

**Key GA4 configurations:**

1. **Custom conversion events** — Mark these as conversions in GA4:
   - `sign_up` (map from PostHog or fire in parallel)
   - `begin_checkout` (upgrade flow initiated)
   - `purchase` (subscription started)
   - `generate_lead` (RFQ submitted)

2. **Enhanced measurement** — Enable: scroll tracking, outbound clicks, site search, form interactions.

3. **Custom dimensions** to add:**
   - `user_tier` (free/starter/pro/enterprise) — dimension on all events
   - `calculator_type` — on all calculation events
   - `acquisition_channel` — on signup event

4. **Calculator page tracking in GA4:**
   - Set up calculator pages as a funnel in GA4 Explorations
   - Track drop-off at each field of complex calculators using `form_start` and `form_submit` events
   - Page engagement time on calculator pages is more meaningful than session duration for these pages

5. **UTM parameter discipline:**

   Every link from external sources must have UTMs. Enforce this for:
   - All email newsletter links: `utm_source=email&utm_medium=newsletter&utm_campaign=[campaign_name]`
   - All LinkedIn posts: `utm_source=linkedin&utm_medium=social&utm_campaign=[post_type]`
   - Partner referral links: `utm_source=[partner_name]&utm_medium=referral&utm_campaign=partnership`
   - Conference landing pages: `utm_source=[conference]&utm_medium=event&utm_campaign=[conference_year]`

---

### Mixpanel (Free Tier — Optional Supplement)

**Use case for Mixpanel:** If PostHog free tier runs short (> 1M events/month, typically Month 10+), Mixpanel's free tier (20M events/month) handles revenue analytics well.

**Mixpanel revenue tracking:**

```javascript
// Revenue tracking in Mixpanel (when added)
mixpanel.people.track_charge(amount, {
  '$time': timestamp,
  'Plan': planName,
  'Billing Period': billingPeriod,
})

// Cohort analysis
mixpanel.track('Subscription Started', {
  'Plan': planName,
  'Trial Days Used': trialDaysUsed,
  'Calculations Before Convert': calcCount,
  'Trigger Feature': triggerFeature,
})
```

**Primary Mixpanel value:** The "People" analytics module enables revenue cohort analysis — seeing which signup cohorts generated the most MRR growth and which churned fastest. PostHog's free tier doesn't support this depth of revenue cohort analysis.

---

### Instrumentation Checklist (Pre-Launch)

Before public launch, verify these tracking items are working:

**PostHog:**
- [ ] `posthog.init()` fires on every page load (check network tab for `/decide/` request)
- [ ] `calculation_run` event fires with all properties for each calculator
- [ ] `user_signed_up` + `posthog.identify()` fires correctly on registration
- [ ] `first_calculation_run` fires only once per user (guard with `posthog.capture` flag check)
- [ ] Session recordings active on calculator pages (test with new incognito session)
- [ ] Funnel 1 (Acquisition → Activation) configured and returning data for beta users
- [ ] Rage click detection active

**GA4:**
- [ ] GA4 tag fires on all pages (verify with GA4 DebugView)
- [ ] All four conversion events appear in GA4 Events as conversions
- [ ] UTMs are parsed correctly for all test links
- [ ] Custom dimensions appearing in reports

**Revenue:**
- [ ] Every Stripe webhook (subscription created, cancelled, updated) fires the corresponding PostHog event
- [ ] MRR figure in dashboard matches Stripe dashboard (verify weekly)

---

## 9. Alert Thresholds Reference

Set up these automated alerts to catch issues before they compound.

**PostHog Alerts:**

| Alert | Trigger | Notification |
|---|---|---|
| Activation rate crash | 7-day activation rate drops below 20% | Founder Slack + email |
| Calculation error spike | `calculation_error` events > 5% of calculation runs | Engineering Slack |
| Payment page rage clicks | Rage clicks on `/pricing` or `/upgrade` | Product Slack |
| Drop in daily calculations | ACM (7-day) declines > 30% vs prior 7-day | Founder Slack |

**Revenue Alerts (via Stripe + Webhook):**

| Alert | Trigger | Notification |
|---|---|---|
| Churned MRR spike | Churned MRR in a week > 15% of prior week MRR | Founder email |
| Failed payment | Subscription payment fails (dunning) | Automated retry + founder notification after 3 failures |
| High-value trial starts | 3PL or Enterprise tier trial begins | Founder immediate notification (outreach opportunity) |
| MRR milestone | MRR crosses $10K, $25K, $50K, $100K | Founder Slack (celebrate and document) |

**Infrastructure Alerts (via Vercel):**

| Alert | Trigger | Notification |
|---|---|---|
| Build failure | Any production build fails | Engineering Slack |
| Edge function error rate | Error rate > 2% on `/api/calculators/*` | Engineering Slack |
| Cold start latency | P95 calculator API response > 3 seconds | Engineering Slack |
| HTS data staleness | Last HTS dataset update > 90 days old | Weekly automated check |

---

*Document complete. All metrics, thresholds, and instrumentation patterns are grounded in the Shipping Savior GTM strategy (AI-5412), Financial Model (AI-5413), and platform research (SUMMARY.md).*

*North star confirmed: Active Calculations per Month (ACM). Target: 1,000 by Day 90.*
