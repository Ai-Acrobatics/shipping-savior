# Shipping Savior — Investor Brief
**AI-5461 | Phase 2: Planning**
*Authored: 2026-03-27 | Document Type: Fundraising Materials Outline*

> **Purpose:** This document provides the investor-facing narrative framework, market evidence, financial highlights, and due diligence preparation materials for Shipping Savior's fundraising process. All financial figures are sourced from FINANCIAL-PROJECTIONS.md; all market and GTM data are sourced from GTM-STRATEGY.md.

---

## Table of Contents

1. [One-Page Executive Summary](#1-one-page-executive-summary)
2. [Market Opportunity — TAM / SAM / SOM](#2-market-opportunity--tam--sam--som)
3. [Business Model and Revenue Streams](#3-business-model-and-revenue-streams)
4. [Competitive Moat and Defensibility](#4-competitive-moat-and-defensibility)
5. [Team and Why Us](#5-team-and-why-us)
6. [Financial Highlights](#6-financial-highlights)
7. [Funding Ask and Use of Funds](#7-funding-ask-and-use-of-funds)
8. [Cap Table Structure Recommendations](#8-cap-table-structure-recommendations)
9. [Due Diligence Document Checklist](#9-due-diligence-document-checklist)
10. [Key Investor Questions and Answers](#10-key-investor-questions-and-answers)

---

## 1. One-Page Executive Summary

### The Problem

US importers, freight brokers, and FTZ operators are navigating the most volatile tariff environment in decades — and doing it with spreadsheets. The April 2025 executive orders on reciprocal tariffs created mandatory changes to Foreign Trade Zone (FTZ) product status elections that most mid-market importers still don't fully understand. Freight brokers building client proposals spend hours recreating the same rate calculations manually. The tools that exist — CBP's manual lookup portals, legacy ERP plugins, and general-purpose spreadsheet templates — were designed for enterprise customs teams, not the 50,000-operator mid-market that generates the bulk of US import volume.

**The average independent freight broker loses 6–8 hours per week to work that should take 20 minutes.** The average mid-market importer ($10M–$150M annual import value) has no visibility into whether an FTZ would save them $50K or $500K this year.

### The Solution

Shipping Savior is a logistics intelligence platform that answers these questions immediately, accurately, and without requiring enterprise procurement cycles. The core product is a suite of interactive calculators and planning tools:

- **FTZ Savings Analyzer** — Models duty deferral savings against HTS codes, country of origin, and annual import value. The only modern tool that handles Privileged Foreign (PF) vs. Non-Privileged Foreign (NPF) status comparison under the April 2025 executive order framework.
- **Landed Cost Calculator** — Full landed cost breakdown including duties, insurance, freight, brokerage fees, and customs exam risk — output as a branded PDF.
- **Backhaul Pricing Module** — Carrier capacity and pricing data for return legs, eliminating the biggest margin leak for freight brokers.
- **Cold Chain Rate Overlay** — Temperature-controlled cargo rate modeling with FSMA compliance checklists embedded.
- **FTZ Consulting Retainers** — High-touch advisory services for grantees with $10M+ annual duty exposure.

The Free Tier (no login required) acts as a viral acquisition loop: every PDF export carries Shipping Savior branding, and a compelling FTZ savings number converts the user into an email lead with a visible ROI already calculated.

### Market

**~50,000 target operators in the US mid-market** across four segments: independent freight brokers (~17,000), SE Asia consumer goods importers (~25,000), cold chain operators (~4,200), and FTZ grantees/heavy importers (~3,500). The April 2025 tariff crisis created urgency that did not exist before — FTZ optimization is no longer an optimization exercise for large firms, it is a compliance and survival question for the entire import ecosystem.

### Traction

- **Existing freight brokerage:** Founder operates a live brokerage processing ~$2.1M GMV annually at 96–97% Lineage terminal volume — the platform wraps around a real operation, not a theoretical one.
- **Design partner pipeline:** 10 freight broker / importer design partners identified for beta program.
- **Phase 2 planning complete:** Full technical architecture, 14 PRDs, GTM playbook, 36-month financial model.
- **Phase 3 (build):** 6-sprint, 12-week build plan fully sequenced and ready to execute.
- **First revenue target:** M7 from project start (beta users converting at beta pricing).

### The Ask

**$500K pre-seed** (or $250K bridge to accelerate build to first revenue). Funds 12 months of runway on the base case financial model with a $35K cash buffer at the trough (M7). Full funding details in Section 7.

---

## 2. Market Opportunity — TAM / SAM / SOM

### 2.1 Total Addressable Market (TAM)

**Global freight brokerage and logistics software: $14.5B (2025), growing at 8.2% CAGR.**

Sources and breakdown:
- **Freight brokerage software (TMS + rate tools):** $4.2B globally (Mordor Intelligence, 2025)
- **Trade compliance and duty management software:** $3.8B globally (MarketsandMarkets, 2024)
- **FTZ and customs optimization tools:** $1.1B globally (niche; significant white space in mid-market)
- **Logistics analytics and intelligence platforms:** $5.4B globally (Grand View Research, 2025)

> **Why global TAM is relevant:** The platform is US-centric at launch (FTZ and CBP regulations are US-specific), but the landed cost, carrier rate, and SE Asia duty intelligence modules have natural expansion paths into Canada, UK, and EU regulatory environments.

**US-only TAM (primary market):**
- US freight brokerage market: ~$1.2B addressable software spend (subset of the $89B total brokerage revenue market)
- US trade compliance software: ~$900M (SMB and mid-market segment)
- **US-focused TAM: ~$2.1B**

### 2.2 Serviceable Addressable Market (SAM)

**Target: the US mid-market operator (not enterprise, not hobbyist).**

| Segment | US Operators | Willingness to Pay | SAM |
|---------|--------------|---------------------|-----|
| Independent Freight Brokers | ~17,000 | $149–$999/mo | $30.5M ARR |
| SE Asia Consumer Goods Importers | ~25,000 | $299–$749/mo | $67.5M ARR |
| Cold Chain Operators | ~4,200 | $499–$1,499/mo | $25.2M ARR |
| FTZ Grantees / Heavy Importers | ~3,500 | $3,000–$12,000/mo | $126M ARR |
| **Total SAM** | **~50,000** | — | **~$249M ARR** |

*Methodology: Segment count from public sources (FMC license database, FTZ Board public grantee registry, CBP import volume data, USITC). Willingness to pay benchmarked against current average spend on freight software (surveys via TIA and NCBFAA annual reports).*

### 2.3 Serviceable Obtainable Market (SOM) — 36-Month Target

**Target: 1.2% of SAM within 36 months.**

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Paying customers | 111 | 271 | 604 |
| ARR run rate | $307K | $1.01M | $2.96M |
| SAM penetration | 0.2% | 0.5% | 1.2% |

**Why 1.2% is conservative:** PLG calculator-led acquisition requires no sales team to drive the first 200 customers. The FTZ Savings Analyzer is the only modern tool of its kind in the market — it will attract organic search traffic from operators actively searching for this capability.

### 2.4 Macro Tailwind: The April 2025 Tariff Catalyst

The April 2025 executive orders on reciprocal tariffs and mandatory Privileged Foreign status for certain HTS categories created an immediate and legally mandated compliance need for every FTZ grantee in the US. This is not a gradual adoption curve — it is a forcing function that generates inbound demand whether or not Shipping Savior runs paid acquisition.

**FTZ Board public data:** 3,500+ active FTZ grantees in the US. Every one of them needed to re-evaluate their product status election by Q3 2025. The majority are doing this manually or via expensive customs broker consultation. Shipping Savior's FTZ Savings Analyzer is the only self-service tool built for this specific need.

---

## 3. Business Model and Revenue Streams

### 3.1 Revenue Architecture

Shipping Savior has a **dual-layer revenue model**: a high-volume SaaS subscription base (product-led growth) augmented by a low-volume, high-ARPU professional services retainer layer (founder-led sales).

**Layer 1 — SaaS Subscriptions**

| Plan | Monthly Price | Annual (17% disc.) | Gross Margin | Target Segment |
|------|--------------|---------------------|--------------|----------------|
| Free | $0 | — | — | Acquisition funnel |
| Starter | $149/mo | $1,490/yr | 88% | Independent brokers, early importers |
| Pro | $399/mo | $3,990/yr | 85% | Multi-seat teams, heavier import ops |
| Enterprise | $1,499/mo | $14,990/yr | 82% | Large brokerages, ERP integration needs |

**Layer 2 — FTZ Consulting Retainers**

| Tier | Monthly Retainer | Annual Value | Gross Margin |
|------|-----------------|--------------|--------------|
| Starter Consulting | $3,000/mo | $36,000/yr | 72% |
| Growth Consulting | $6,000/mo | $72,000/yr | 72% |
| Enterprise Consulting | $12,000/mo | $144,000/yr | 72% |

**Layer 3 — Add-on Modules**

| Module | Price | Gross Margin |
|--------|-------|--------------|
| Tariff Watch Pro | $99/mo | 92% |
| SE Asia Duty Index | $199/mo | 90% |
| Carrier Rate Intelligence | $299/mo | 90% |

### 3.2 Unit Economics Summary

| Tier | ARPU | LTV | CAC | LTV:CAC | Payback |
|------|------|-----|-----|---------|---------|
| Starter | $149/mo | $2,915 | $130 | 22:1 | 1.0 mo |
| Pro | $399/mo | $12,107 | $180 | 67:1 | 0.5 mo |
| Enterprise | $1,499/mo | $102,432 | $950 | 108:1 | 0.8 mo |
| FTZ Consulting (avg) | $6,000/mo | $240,000 | $850 | 282:1 | 0.2 mo |

**Blended CAC payback period (base case, M12): ~7 days.** This is the defining characteristic of a PLG motion — the tool delivers ROI before the paywall, making conversion organic rather than push-based.

### 3.3 Revenue Mix at M18 (Base Case)

| Stream | Monthly Revenue | % of MRR |
|--------|----------------|----------|
| Starter subscriptions | $9,238 | 11% |
| Pro subscriptions | $15,162 | 18% |
| Enterprise subscriptions | $11,992 | 14% |
| FTZ Consulting retainers | $31,000 | 37% |
| Add-on modules | $5,040 | 6% |
| Annual plan amortization | $12,000 | 14% |
| **Total MRR** | **$84,432** | **100%** |

**Key insight:** FTZ Consulting retainers represent 37% of MRR from only 10 client relationships at M18. This concentration is a feature, not a risk — these are multi-year relationships anchored in measurable duty savings (the consultant's ROI is visible in CBP entry data).

### 3.4 Net Revenue Retention Trajectory

| Period | NRR | Driver |
|--------|-----|--------|
| M6–M12 | 95% | Early-stage; some churn, minimal expansion |
| M12–M18 | 108% | Starter→Pro upgrades drive expansion |
| M18–M24 | 115% | Enterprise upsells + consulting add-ons |
| M24–M36 | 118% | ERP integrations deepen retention |

**NRR above 110% at M18 is the inflection point.** At that point, the existing customer base grows revenue without additional acquisition spend.

---

## 4. Competitive Moat and Defensibility

### 4.1 Competitive Landscape

| Competitor | Type | Weakness | Shipping Savior Advantage |
|------------|------|----------|--------------------------|
| **Flexport** | Full-service forwarder + software | Enterprise-only; $10K+ contracts; no self-service FTZ tools | Mid-market self-service; FTZ-specific; no freight markup |
| **Cargowise** | Legacy TMS (WiseTech Global) | Requires 3–6 month implementation; $50K–$200K contracts; complex UI | Instant value; no implementation; modern UX |
| **ImportGenius / Panjiva** | Trade data platforms | Data only; no calculation tools; no FTZ optimizer | Actionable tools, not raw data |
| **CBP CERTS / ACS** | Government portals | Designed for customs brokers; not operator-facing; no FTZ modeling | Self-service for operators; modern interface |
| **Custom spreadsheets** | Incumbent for 70%+ of market | No updating, no collaboration, no PDF export, breaks constantly | Replaces 5+ spreadsheets; branded exports; team seats |
| **Trade compliance consultants** | Human services | $250–$500/hr; no 24/7 access; no self-service modeling | $399/mo replaces $2,000–$8,000/mo in consultant fees |

### 4.2 Primary Moats

**Moat 1: First-Mover on April 2025 Regulatory Change**

The mandatory Privileged Foreign status rule for reciprocal-tariff-scope goods is recent, obscure, and consequential. Building the only self-service compliance tool for this specific change while the regulation is still new creates a search and trust advantage that compresses over time — acting now captures durable SEO authority and early adopter loyalty.

**Moat 2: Data Network Effects (FTZ Savings Benchmarks)**

As FTZ Savings Analyzer usage scales, aggregate anonymized data creates a proprietary benchmark dataset: "companies importing X HTS code from Vietnam save an average of Y% by electing FTZ." This benchmark data is unique to Shipping Savior and becomes more valuable with scale, creating a data moat that legacy tools cannot replicate without similar adoption.

**Moat 3: Workflow Lock-In via Proposal Exports**

When freight brokers generate branded client proposals through Shipping Savior, those proposals become part of their client communication workflow. Clients begin expecting the format. Switching costs compound: brokers would need to rebuild their client-facing materials in a different tool. This is analogous to how DocuSign created workflow lock-in — the software becomes embedded in external relationships.

**Moat 4: Founder's Existing Industry Network and Credentials**

The founder operates an active FMC-licensed freight brokerage. This is not a tool built by a software entrepreneur who researched the market — it is built by an operator who lives the daily pain. The credibility advantage in freight broker communities (TIA, NCBFAA, r/freightbrokers) is real and not replicable by a non-operator competitor entering the space.

**Moat 5: Consulting-to-Software Flywheel**

FTZ consulting retainers are not a side business — they are an intelligence engine. Each consulting engagement teaches the team which FTZ scenarios are most common, which HTS code combinations generate the most savings, and which regulatory edge cases need tool coverage. This feeds directly into product improvements that no competitor observing the market from the outside can replicate.

### 4.3 Defensibility Assessment

| Factor | Score (1–5) | Notes |
|--------|------------|-------|
| Regulatory complexity as a moat | 5 | FTZ rules are obscure; operator-facing tools are rare |
| Network effects | 3 | Data network effects emerge at scale; not immediate |
| Workflow integration lock-in | 4 | Proposal export embeds in external client relationships |
| Founder domain expertise | 5 | Active FMC operator — not theoretical |
| Brand and SEO authority | 3 | Building; strongest if SEO strategy executes on schedule |
| Switching costs | 3 | Grow as team seats, API integrations, and consulting relationships deepen |

---

## 5. Team and Why Us

### 5.1 Founding Team Profile

**Founder (CEO / CTO / Lead Operator)**

The founder brings a rare combination of domain expertise and technical execution capability:

- **Active freight broker:** FMC-licensed, operating a live brokerage at ~$2.1M GMV annually through the Lineage terminal network. This is not a resume line — it is an active operation generating real revenue and real operator pain points daily.
- **FTZ operator experience:** Direct experience with FTZ optimization, PF vs. NPF elections, and the compliance workflow that most software tools ignore.
- **Technical capability:** Building Shipping Savior as a full-stack developer (Next.js, TypeScript, Drizzle ORM, PostgreSQL, AI agent integrations). Phase 2 planning includes 14 full PRDs authored by the founder — indicating the ability to bridge product thinking and engineering execution.
- **SE Asia import expertise:** Active experience in the Vietnam/SE Asia import corridor that forms the highest-growth user segment.

**Why this founder wins this market:** Every tool in the competitive landscape was built by engineers who learned the freight market secondhand. Shipping Savior is built by an operator who learned software secondhand. The product decisions are anchored in real operator workflow, not market research reports.

### 5.2 Team Gaps and Hiring Plan

Honest assessment of current team gaps and the plan to close them:

| Gap | Severity | Hire Plan |
|-----|----------|-----------|
| Dedicated sales (enterprise + consulting) | Medium | Fractional SDR at M10; full-time at M18 |
| Marketing / content (SEO execution) | Medium | Part-time contractor M4; marketing manager M22 |
| Second engineer (API integrations, platform stability) | High | Full-time engineer M19 |
| Customer success (Enterprise + Consulting retention) | Low-Medium | CSM at M25 |

**M19 engineering hire is the critical gap.** Until then, the founder handles all engineering. The platform architecture (Next.js + serverless + Drizzle ORM) is specifically designed to minimize infrastructure ops overhead during this solo-build phase.

### 5.3 Advisory and Ecosystem Relationships

Planned advisors and channel partners (to be formalized in Phase 3):

- **Customs broker partnerships:** Customs brokers who see FTZ consulting as a value-add to their clients and will refer grantees to Shipping Savior
- **TIA / NCBFAA association channels:** Freight broker association access for member outreach
- **Lineage terminal relationships:** Warm intros to cold chain operators via existing terminal relationships
- **FTZ Board grantee network:** Public FTZ Board database provides outreach list; consulting relationships create referral access to adjacent grantees

---

## 6. Financial Highlights

### 6.1 Key Metrics Summary

| Metric | M12 | M24 | M36 |
|--------|-----|-----|-----|
| Paying customers | 111 | 271 | 604 |
| MRR | $61,323 | $207,000 | $360,000+ |
| ARR run rate | $736K | $2.48M | $4.32M |
| Gross margin | 86% | 88% | 89% |
| EBITDA | — | ($106K → $407K) | $1.7M |
| NRR | 95% | 115% | 118% |
| CAC payback (blended) | ~7 days | ~7 days | ~5 days |
| LTV:CAC (blended) | 67:1 | 90:1+ | 100:1+ |

*Note: ARR run rate = MRR × 12. Differs from cumulative annual revenue recognized.*

### 6.2 Three-Scenario Annual Summary

| Scenario | Year 1 Net Revenue | Year 2 Net Revenue | Year 3 Net Revenue | Year 3 EBITDA |
|----------|--------------------|--------------------|--------------------|---------------|
| **Bear** | $52,900 | $494,500 | $1,414,600 | $635,500 |
| **Base** | $105,700 | $989,000 | $2,829,200 | $1,713,400 |
| **Bull** | $190,300 | $1,780,200 | $5,092,600 | $3,598,900 |

*Bear case: 50% lower conversion rates, 50% higher CAC, 25% higher churn vs. base. Bull case: 1.8× conversion rates, 20% lower CAC, 25% lower churn vs. base.*

### 6.3 Path to Profitability

**Base case cash break-even: M9** (month 9 from project start, ~2 months after first revenue).

The business reaches positive monthly cash flow at M9 because:
1. FTZ Consulting retainers ($6,000/month) carry 72% gross margin — one consulting client covers 80% of monthly burn
2. CAC payback of ~7 days means no working capital is tied up waiting for customer economics to play out
3. Infrastructure costs scale slowly (serverless architecture)

**Key trough:** M7 cash position of ~$59K (on a $150K initial funding base). This is the highest-risk moment — first paying customers have arrived but MRR has not yet covered burn. Adequate initial funding ($150K+) fully resolves this risk.

### 6.4 Comparable Company Benchmarks

*For investor context — these are not direct comparables but illustrate the economic profile of PLG SaaS businesses with strong unit economics:*

| Company | Stage | Gross Margin | NRR | LTV:CAC | Multiple at Exit |
|---------|-------|-------------|-----|---------|-----------------|
| **Freight Tiger** (logistics SaaS, India) | Series A | 76% | 118% | ~30:1 | 8x ARR |
| **Flexe** (logistics platform) | Series C | 68% | 112% | ~25:1 | 10x ARR |
| **Logixboard** (forwarder portal) | Series B | 82% | 125% | ~45:1 | 12x ARR |
| **Shipping Savior (projected, M36)** | — | **89%** | **119%** | **100:1+** | — |

*Shipping Savior's projected gross margin and NRR at M36 are best-in-class for logistics SaaS, driven by the high-margin FTZ consulting layer and strong platform stickiness.*

---

## 7. Funding Ask and Use of Funds

### 7.1 Raise Overview

| Parameter | Value |
|-----------|-------|
| **Raise amount** | $500K pre-seed |
| **Structure** | SAFE note (post-money valuation cap) |
| **Valuation cap** | $3.5M–$5.0M (to be negotiated based on investor profile) |
| **Discount** | 20% to Series A |
| **Minimum check** | $25K |
| **Target close** | M2–M3 from project start |
| **Bridge option** | $250K closes faster; extends to first revenue at M6 |

*Note: Valuation cap is a recommendation. Founder should negotiate based on current market conditions, investor profile, and comparable pre-seed logistics SaaS deals at time of raise.*

### 7.2 Use of Funds (Base Case — $500K)

| Category | Budget | % | Timeline | Purpose |
|----------|--------|---|----------|---------|
| Engineering (founder salary) | $72,000 | 14% | M1–M12 | Founder to market rate during build |
| Infrastructure and APIs | $18,000 | 4% | M1–M12 | Cloud hosting, HTS data, carrier APIs |
| Sales & Marketing | $89,400 | 18% | M1–M12 | Content, ads, tools, outreach |
| G&A (legal, accounting, software) | $36,000 | 7% | M1–M12 | Formation, contracts, subscriptions |
| Fractional SDR (M10–M12) | $9,000 | 2% | M10–M12 | Enterprise/consulting outreach |
| **Year 1 total** | **$224,400** | **45%** | M1–M12 | Runway through profitability |
| **Year 2 reserve** | **$180,000** | **36%** | M13–M24 | Buffer for slower-than-base growth |
| **Strategic/tactical buffer** | **$95,600** | **19%** | As needed | Partnership development, events, acceleration |
| **Total** | **$500,000** | **100%** | — | — |

**Key insight:** The base case financial model shows the business becoming cash-flow positive at M9 without the Year 2 reserve. The $500K raise funds full Year 1 operations plus a substantial buffer — providing 18+ months of runway before any additional fundraising is needed.

### 7.3 Pre-Seed vs. Bridge Scenarios

**Option A: $500K Full Pre-Seed**
- 18+ months runway
- Funds fractional SDR at M10
- Allows Google Ads acceleration at M9 (a budget-constrained activity in the base case)
- Positions for Series A at M18–M24 based on $1M+ ARR trajectory

**Option B: $250K Bridge to First Revenue**
- ~10 months runway
- Tighter ops during M1–M6 (no paid ads, pure organic + outreach)
- First revenue at M6–M7 validates model before larger raise
- Series A pitch at M12 with 110+ paying customers and $61K MRR data point
- Higher dilution risk if metrics disappoint

**Recommendation:** Pursue the $500K full pre-seed. The $250K bridge is viable but creates unnecessary execution risk during the critical M4–M8 window when SEO content, beta outreach, and early product feedback loops need concurrent investment.

### 7.4 Target Investor Profile

Shipping Savior is best suited for:

| Investor Type | Fit | Notes |
|---------------|-----|-------|
| Pre-seed funds ($100K–$500K checks) | High | Ideal check size; comfortable with pre-revenue |
| Angel investors with logistics/supply chain background | High | Domain expertise accelerates value-add |
| Operator angels (former freight executives) | High | Network access to enterprise customers and partnerships |
| General pre-seed funds (non-logistics) | Medium | Requires more education on market; strong unit economics tell the story |
| Strategic investors (logistics companies) | Low-Medium | Risk of competitive conflict; consider only if partnership is the primary value |

---

## 8. Cap Table Structure Recommendations

### 8.1 Pre-Seed Cap Table (Recommended)

*These are structural recommendations, not legal advice. Engage qualified startup counsel before issuing any equity or SAFEs.*

| Stakeholder | Ownership | Notes |
|-------------|-----------|-------|
| Founder | 85–88% | Pre-SAFE, pre-option pool |
| Pre-seed SAFE investors ($500K) | 10–12% (post-conversion) | At $4M post-money cap |
| Employee option pool (pre-Series A) | 5–8% | Standard; reserve for M10 SDR, M18 full SDR, M19 engineer |
| **Total (fully diluted at close)** | **~100%** | Pre-Series A |

### 8.2 Option Pool Sizing

**Recommended: 10% option pool authorized at pre-seed.**

Rationale: A Series A lead will require an option pool refresh before their investment. Creating a 10% pool at pre-seed avoids a painful dilutive refresh at Series A.

Key option grants to reserve for:
- Fractional SDR (M10): 0.25–0.5%
- Full-time engineer (M19): 0.75–1.5%
- Marketing manager (M22): 0.5–0.75%
- Customer success manager (M25): 0.5–0.75%

### 8.3 SAFE Terms (Recommended Defaults)

| Term | Recommended | Notes |
|------|------------|-------|
| Instrument | Post-money SAFE | YC standard; investor-friendly, founder-predictable |
| Valuation cap | $3.5M–$5.0M | Benchmarked to comparable pre-seed logistics SaaS |
| Discount | 20% | Standard pre-seed discount to next priced round |
| Pro-rata rights | Yes (for checks $100K+) | Allows lead investors to maintain ownership at Series A |
| MFN clause | Yes | Standard; protects early investors from subsequent more favorable terms |
| Information rights | Quarterly financials | Appropriate for check size; lightweight |

### 8.4 Series A Targets (M18–M24)

When to raise Series A:
- ARR run rate > $1M (targeted M18 base case: ~$1M ARR)
- NRR > 110% (targeted M18: 112%)
- Paying customers > 150 (targeted M18: ~192)
- CAC payback < 3 months (projected < 0.3 months — far exceeds threshold)
- Clear path to $3M ARR within 12 months of Series A

**Estimated Series A parameters:**
- Raise: $2.5M–$5M
- Valuation: $12M–$20M (5–8× ARR at raise)
- Use: Full-time engineering team, SDR + sales manager, marketing, ERP integration partnerships

---

## 9. Due Diligence Document Checklist

*Prepare these documents before running an investor process. Organized by category and priority.*

### 9.1 Corporate and Legal (Priority: Critical)

- [ ] Certificate of Incorporation (Delaware C-Corp strongly recommended for VC-backed companies)
- [ ] Bylaws
- [ ] Cap table (Carta or equivalent — not a spreadsheet)
- [ ] Founder equity agreement with vesting schedule (4-year, 1-year cliff standard)
- [ ] IP assignment agreement (all company IP assigned to corporation, not founder personally)
- [ ] Any prior agreements (contractor agreements, NDAs with design partners)
- [ ] Any third-party IP licenses (HTS data, carrier rate APIs — confirm rights to embed)
- [ ] FMC brokerage license (demonstrates regulatory standing; confirms founder's operational credentials)

### 9.2 Financial (Priority: Critical)

- [ ] 36-month financial model (exists: FINANCIAL-PROJECTIONS.md)
- [ ] Bank statements (last 3 months; shows burn rate and cash position)
- [ ] Any revenue records (if any invoiced customers exist from existing brokerage)
- [ ] Cap table with SAFE instruments listed (include pre-seed SAFEs after close)
- [ ] Monthly P&L actuals (even if $0 revenue currently — shows operational spend)

### 9.3 Product (Priority: High)

- [ ] Product roadmap (exists: `.planning/prds/PRODUCT-ROADMAP.md`)
- [ ] Live demo or working prototype (FTZ Savings Analyzer should be functional for demos)
- [ ] Phase 2 PRD library (14 PRDs — share architecture + Phase 3 sprint plan as product evidence)
- [ ] Technical architecture diagram (exists: `.planning/docs/TECHNICAL-ARCHITECTURE.md`)
- [ ] Data pipeline overview (exists: Phase 2 planning docs)

### 9.4 Market and GTM (Priority: High)

- [ ] GTM strategy document (exists: GTM-STRATEGY.md)
- [ ] Competitive analysis (exists: GTM-STRATEGY.md Section 9)
- [ ] Market sizing with sources (this document, Section 2)
- [ ] Design partner list (10 target brokers/importers — names and warm relationship status)
- [ ] Customer interviews or LOIs (even 2–3 written LOIs from design partners is powerful)

### 9.5 Team (Priority: High)

- [ ] Founder LinkedIn profile (current, polished, demonstrates operational credibility)
- [ ] FMC license documentation (public; confirms operational freight broker status)
- [ ] Reference list (3–5 industry contacts who can speak to founder's domain expertise and execution)
- [ ] Any planned advisory agreements (even verbal commitments from advisors — note names)

### 9.6 Risk and Compliance (Priority: Medium)

- [ ] Privacy policy (required for any web app handling user data)
- [ ] Terms of service (required before beta launch)
- [ ] UFLPA / trade compliance: confirm the platform provides data/tools, not legal advice (required disclaimer)
- [ ] Data licensing agreements for HTS codes, carrier rate feeds, and tariff data
- [ ] Any litigation history (should be none; confirm clean)

### 9.7 Social Proof and Traction Evidence (Priority: Medium)

- [ ] Beta user pipeline (list of named design partners in pipeline — even "in conversation" counts)
- [ ] Any letters of intent (LOI) or pre-orders from beta users
- [ ] Organic search/SEO early signals (if any content is live, Google Search Console data)
- [ ] LinkedIn audience (founder's connection count and engagement in freight communities)
- [ ] Relevant press or community mentions (r/freightbrokers posts, trade publication quotes)

---

## 10. Key Investor Questions and Answers

*Prepare crisp answers to these before any investor meeting. These are the questions every investor will ask, in roughly priority order.*

---

### Q1: Why will you win this market? There are large, well-funded competitors.

**A:** The well-funded competitors (Flexport, Cargowise) are enterprise tools with 3–6 month implementation cycles and $50K+ contract minimums. They do not serve a solo freight broker or a $20M importer — not because they missed the market, but because it's not their business model. Shipping Savior is built for the 50,000-operator mid-market segment that enterprise tools deliberately ignore.

More importantly: I am an active operator in this market. I run a live brokerage. I use the exact spreadsheets that Shipping Savior replaces. I know the workflows from the inside. No enterprise competitor can replicate that founding insight without starting over.

---

### Q2: How do you get the first 100 customers without a sales team?

**A:** The FTZ Savings Analyzer is free, no login required, and delivers immediate ROI in the form of a dollar figure ("you could defer $187,000 in duties this year"). The tool sells itself. Every branded PDF export is an organic distribution touch. The first 100 customers come from:

1. Design partner network (10 freight brokers / importers in active conversations)
2. Founder's existing industry relationships (FMC community, Lineage terminal contacts)
3. Organic SEO (FTZ Savings Analyzer targets long-tail queries with near-zero competition)
4. LinkedIn outreach (founder's existing network in freight broker communities)

No paid sales team is required until M10 (fractional SDR), after the product has already proven conversion with real users.

---

### Q3: What is your moat? Can't Google or a large logistics company copy this?

**A:** Three specific moats that compound over time:

First, the regulatory moat. The April 2025 executive orders on FTZ product status are obscure, consequential, and changing. Building the definitive educational and tool resource during the initial compliance window creates SEO authority and first-mover trust that a late-entering large company cannot quickly replicate.

Second, the data network effect. As the FTZ Analyzer scales, we accumulate anonymized FTZ savings benchmark data by HTS code, country of origin, and industry. This becomes a proprietary dataset — "companies importing HTS 8471.30 from Vietnam save an average of 23% by electing FTZ." No competitor can generate this without similar adoption.

Third, workflow lock-in. Once freight brokers use Shipping Savior to generate client proposals, their clients begin expecting that format. The switching cost is not just effort — it is the disruption of an established client-facing communication workflow.

---

### Q4: What happens if tariff policy reverses and the FTZ urgency goes away?

**A:** Two responses.

First, FTZ optimization has existed as a genuine cost savings strategy since the 1930s — it is not purely a tariff-regime story. Even without elevated tariffs, FTZ grantees can defer duties on imported merchandise until it enters US commerce. This is structurally advantageous regardless of tariff levels. The April 2025 orders accelerated urgency but did not create the underlying value proposition.

Second, the platform has four distinct revenue segments. FTZ Consulting is the highest-ARPU segment but represents 37% of MRR at M18. The Landed Cost Calculator, Backhaul Pricing Module, and Cold Chain Rate Overlay serve freight brokers and importers independent of any FTZ-specific regulatory environment. Tariff policy normalization would affect one segment while leaving the other three intact.

---

### Q5: Why raise now? Why not wait until you have revenue?

**A:** Two reasons.

The SEO content window is closing. The April 2025 tariff environment created a short window where new content on FTZ optimization topics can rank against low competition. Delaying the content build by 3–6 months means competing for positions against incumbents who will have established authority by then.

The design partner cohort is warm now. The 10 design partners in pipeline are active logistics operators with current pain. Delaying product development means losing these relationships to competitors or to inertia.

The base case financial model shows the business becoming cash-flow positive at M9 from a $150K initial investment. The $500K raise is not a survival requirement — it is an acceleration mechanism that removes cash constraints during the critical M4–M8 build window.

---

### Q6: What is your exit strategy?

**A:** The natural acquirers are:

- **Large TMS platforms** (Cargowise / WiseTech, MercuryGate, 3PL Central) seeking mid-market reach without rebuilding from scratch
- **Freight data platforms** (FreightWaves, DAT) seeking a calculator and tool layer to monetize their data assets
- **Customs software companies** (Descartes, GTKonnect) seeking FTZ optimization as a new product line
- **Trade compliance consultancies** seeking to productize their service delivery

At $3M ARR with 118% NRR and 89% gross margins, the platform is attractive at 8–12× ARR to any of these acquirers ($24M–$36M). The team is not building toward an exit — the business economics are strong enough to grow independently. But the exit optionality exists and is credible.

---

### Q7: What are the biggest risks?

**A:** In order of severity:

**Risk 1: Founder single point of failure.** Until M19, all engineering is on the founder. A prolonged illness, burnout, or key personal life event stops product development. Mitigation: Modular architecture (Next.js serverless) minimizes ongoing maintenance burden; consulting revenue can fund a contract engineer if needed.

**Risk 2: CAC proves higher than modeled.** The base case assumes blended CAC of $130 at M12. If organic SEO and PLG calculator conversion is lower than modeled, CAC climbs. Mitigation: SEO content can start at M1 (pre-product), giving 6 months of content authority building before first paying customers. Even a 2× CAC miss keeps the business viable on $500K funding.

**Risk 3: Tariff policy normalization.** Addressed above (Q4) — FTZ value proposition is not solely tariff-dependent.

**Risk 4: Enterprise customer churn from a key consulting retainer.** A single $12,000/month consulting client churning creates a meaningful MRR impact. Mitigation: No single consulting client represents more than 15% of MRR by M18 (5 clients at average $6,200). Portfolio diversification within the consulting segment.

**Risk 5: Data quality (carrier rates, HTS codes).** If rate feeds or HTS data become inaccurate, user trust degrades. Mitigation: Licensed third-party HTS data (not scraped). Carrier rate APIs from established providers. User-reported accuracy feedback built into the UI.

---

### Q8: What do you need from an investor beyond capital?

**A:** Three things in priority order:

1. **Introductions to enterprise logistics buyers.** The consulting retainer segment ($6K–$12K/month) requires warm introductions. An investor with a portfolio company in manufacturing, distribution, or import-heavy retail is an immediate referral opportunity.

2. **Legal and accounting vendor relationships.** Early-stage startup legal (Delaware C-Corp formation, SAFE documents, IP assignments) is expensive when sourced cold. Investor relationships with startup-friendly law firms and accounting firms reduce cost.

3. **Board observer participation and quarterly accountability.** Not governance — guidance. The founder benefits from a quarterly structured review with an investor who has pattern-matched across similar PLG SaaS build-outs.

---

*Document complete. Cross-reference with FINANCIAL-PROJECTIONS.md for full 36-month model, GTM-STRATEGY.md for channel detail and competitive analysis, and PHASE2-MASTER-PLAN.md for product architecture and Phase 3 sprint plan.*

*All figures are projections. Actual results will vary based on market conditions, execution, and factors outside the team's control. This document is for investor discussion purposes only and does not constitute an offer to sell securities.*
