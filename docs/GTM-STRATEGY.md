# Shipping Savior — Go-to-Market Strategy
**AI-5460 | Phase 2: Planning**
*Authored: 2026-03-27 | Horizon: 18-Month Execution Roadmap*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Target Market Segments](#2-target-market-segments)
3. [Ideal Customer Profile (ICP)](#3-ideal-customer-profile-icp)
4. [Customer Acquisition Channels](#4-customer-acquisition-channels)
5. [Pricing Strategy](#5-pricing-strategy)
6. [Sales Motion: PLG + Sales-Assist Hybrid](#6-sales-motion-plg--sales-assist-hybrid)
7. [Launch Phases and Milestones](#7-launch-phases-and-milestones)
8. [Key Partnerships](#8-key-partnerships)
9. [Competitive Positioning](#9-competitive-positioning)
10. [Success Metrics (CAC, LTV, Churn)](#10-success-metrics-cac-ltv-churn)
11. [Content and SEO Strategy](#11-content-and-seo-strategy)
12. [Risks and Mitigations](#12-risks-and-mitigations)

---

## 1. Executive Summary

Shipping Savior is a logistics intelligence and analysis platform purpose-built for the operators who sit at the intersection of freight brokerage, FTZ optimization, and SE Asia import complexity. The GTM motion is a **product-led growth core augmented by a founder-led sales layer** — the FTZ Savings Analyzer works as a free self-service hook, with high-value brokerage and consulting relationships closing above the paywall.

### GTM Thesis in Three Sentences

The April 2025 tariff environment has made FTZ optimization urgent for thousands of US importers who previously ignored it. No modern, accessible tool exists to answer the question "how much would an FTZ save me?" Shipping Savior ships that tool first — free, with no login required — and converts users to paid subscribers and brokerage clients through demonstrated ROI.

### Key Numbers at a Glance

| Metric | Target |
|--------|--------|
| Launch date (first paying customers) | M7 from project start |
| Design partners (beta) | 10 freight brokers / importers |
| Paying customers at M12 | 110+ (all tiers) |
| ARR at M18 | $1.1M–$2.0M (base case) |
| Primary CAC (PLG channel) | $85–$145 blended |
| Target LTV:CAC ratio | 6:1 or better |
| Primary positioning hook | FTZ Savings Analyzer — "the only modern FTZ tool for mid-market" |

---

## 2. Target Market Segments

### 2.1 Segment Overview

Shipping Savior targets four distinct but overlapping operator segments. Each segment has a different entry point, a different primary feature, and a different conversion path.

| Segment | Size (US) | Primary Pain | Entry Feature | ARPU Target |
|---------|-----------|-------------|--------------|-------------|
| **Independent Freight Brokers** | ~17,000 licensed brokers | Manual proposal creation; backhaul pricing opacity | Route Comparison + Backhaul Module | $499–$999/mo |
| **SE Asia Consumer Goods Importers** | ~25,000 SMBs | Unpredictable duty costs; FTZ ignorance | Landed Cost + FTZ Analyzer | $299–$749/mo |
| **Cold Chain Operators** | ~4,200 active US cold chain forwarders | No integrated cold chain rate + compliance tool | Cold Chain Calculator + FSMA Checklist | $499–$1,499/mo |
| **FTZ-Eligible Manufacturers / Distributors** | ~3,500 active FTZ grantees | Legacy or manual FTZ optimization | FTZ Savings Analyzer + Consulting | $3,000–$12,000/mo (consulting) |

**Total serviceable market across segments**: ~50,000 operators in the US alone.

---

### 2.2 Segment 1: Independent Freight Brokers

**Who they are:** Licensed freight brokers (FMC-bonded) managing 50–500 shipments per year for importer clients. Typically solo operators or small teams (2–8 people). Revenue comes from commissions on shipment value (2–5%).

**Current workflow (manual and painful):**
- Spreadsheet-based rate calculations
- Manual HTS code lookups on USITC.gov
- Informal backhaul pricing from carrier relationships
- Word/PowerPoint proposals to clients

**Why they buy Shipping Savior:**
- Professionalizes client proposals (branded PDF exports)
- Speeds up the quote-to-proposal cycle from hours to minutes
- Backhaul pricing module gives them a defensible competitive advantage with clients
- Calculator suite replaces 5 separate manual spreadsheets

**Primary acquisition channel:** LinkedIn outreach + referral from the founding user's network. Freight broker associations (TIA, NCBFAA).

**Target number at M18:** 180 paying Starter/Pro subscribers.

---

### 2.3 Segment 2: SE Asia Consumer Goods Importers

**Who they are:** US-based importers of apparel, electronics, CPG, and home goods sourced from Vietnam, Thailand, Indonesia, and Cambodia. Revenue typically $5M–$200M. Import volume 20–200 FCL containers per year. They use a freight forwarder but do their own supply chain optimization.

**Current workflow (manual and painful):**
- Rely on forwarder to tell them duty rates — rarely verified
- No FTZ analysis even when FTZ would save 15–40% on duties
- UFLPA compliance (Chinese-origin input risk) tracked manually if at all
- Tariff change notifications come from news, not a dedicated tool

**Why they buy Shipping Savior:**
- Landed cost calculator catches the "hidden 15–25%" above freight + duty
- FTZ Savings Analyzer shows exact duty deferral opportunity per shipment
- Tariff scenario modeling for the current 2025–2026 volatile environment
- Country-of-origin tracking for UFLPA compliance

**Primary acquisition channel:** Google SEO (long-tail duty/tariff/FTZ queries) + LinkedIn ads targeting supply chain / import operations job titles at companies in target industries.

**Target number at M18:** 220 paying Starter/Pro subscribers.

---

### 2.4 Segment 3: Cold Chain Operators

**Who they are:** Freight brokers and forwarders specializing in temperature-controlled cargo (seafood, produce, pharmaceuticals, biotech). Often work through major terminals (Lineage, Americold, Preferred Freezer). Revenue driven by reefer premium over dry cargo rates.

**Current workflow (manual and painful):**
- No unified tool for cold chain rate comparison + FSMA compliance checklist
- Temperature zone requirements tracked manually (per-commodity, per-carrier)
- FDA prior notice and FSMA Safe Food Transport rules in separate reference documents
- Backhaul availability for reefer equipment on return legs is completely ad hoc

**Why they buy Shipping Savior:**
- Cold chain cost overlay on route comparison (reefer premium modeling)
- FSMA Safe Food Transport rule checklist embedded in shipment planning
- Container utilization for reefer dimensions (not one-size-fits-all like dry cargo)
- Backhaul intelligence specific to cold chain lanes

**Primary acquisition channel:** Cold Chain Federation events + trade publications (Food Logistics, The Packer). Founder's existing network at the Lineage terminal is the seed channel.

**Target number at M18:** 65 paying Pro/Enterprise subscribers (smaller segment, higher ARPU).

---

### 2.5 Segment 4: FTZ Grantees and Heavy Importers

**Who they are:** US manufacturers or distributors with an active FTZ grant from the FTZ Board (CBP), or large-volume importers ($10M+ annual duty liability) evaluating FTZ activation. Often have a customs broker but no dedicated FTZ optimization software — they rely on the CBP Manual and their broker's judgment.

**Current workflow (manual and painful):**
- Incremental withdrawal modeling done manually in Excel (or not at all)
- Privileged Foreign (PF) vs. Non-Privileged Foreign (NPF) election made once and never revisited
- April 2025 executive order compliance (mandatory PF for reciprocal-tariff-scope goods) not systematically tracked
- No break-even analysis for FTZ entry cost vs. duty deferral benefit

**Why they buy Shipping Savior:**
- FTZ Savings Analyzer is the only modern tool that handles PF vs. NPF comparison
- Incremental withdrawal modeling tool (unique — not offered anywhere else)
- Mandatory PF status alert for reciprocal-tariff-scope goods (April 2025 EO)
- FTZ consulting retainer for ongoing optimization strategy

**Primary acquisition channel:** Direct outreach to FTZ grantees (public FTZ Board database), customs broker referral partnerships, trade compliance consultancy channels.

**Target number at M18:** 15 active FTZ consulting retainers + 40 platform subscribers.

---

## 3. Ideal Customer Profile (ICP)

### Primary ICP: The Independent Freight Broker-Operator

**The person:**
- Founder/operator of a small freight brokerage (solo to 5-person team)
- Licensed with FMC ($75K bond), processing 80–300 shipments/year
- Currently billing $1.5M–$8M GMV annually
- Technically fluent but not a developer; uses Cargowise, Flexport, or nothing
- Knows backhaul pricing is an advantage but has no tool for it
- Frustrated by the time it takes to generate client proposals

**Firmographics:**
- US-based, any geography
- Specialization in one of: SE Asia imports, cold chain, or CPG

**Behavioral signals:**
- Posting in r/freightbrokers about rate calculation tools
- Searching for "landed cost calculator," "FTZ savings calculator," "HTS code lookup"
- Attending TIA Conference or NCBFAA events
- Has a proposal template in Google Docs or a custom spreadsheet

**Why they convert:** The FTZ Savings Analyzer or Landed Cost Calculator generates a result that directly represents money — for themselves or for a client. The ROI is immediate and visible. They convert because the tool already proved its value before they saw a paywall.

---

### Secondary ICP: The Import Operations Manager

**The person:**
- Director or Manager of Import Operations at a US importer ($20M–$150M revenue)
- Manages 100–500 FCL shipments per year from SE Asia
- Has a freight forwarder but verifies numbers independently
- Responsible for duty cost forecasting, country-of-origin compliance, and cost per unit accuracy
- Reports to VP Supply Chain or CFO

**Pain:**
- Caught off-guard by duty changes (Section 301, UFLPA enforcement)
- Can't model FTZ scenarios without hiring a customs consultant
- Landed cost reports from forwarder are black-box and don't show all cost components

**Why they convert:** They plug in a real shipment and the Landed Cost Calculator finds $12,000 in missed costs their forwarder didn't include. That's a 20-minute demo that sells itself.

---

## 4. Customer Acquisition Channels

### 4.1 Channel Mix Overview

| Channel | Phase | CAC | Volume | Strategic Role |
|---------|-------|-----|--------|---------------|
| **Organic SEO (content)** | M4+ | $45–$95 | High | Long-term compounding growth driver |
| **FTZ Calculator as acquisition tool** | M1+ | ~$0 (viral) | Medium | Direct PLG loop — tool usage → signup |
| **LinkedIn founder outreach** | M1–M9 | $120–$200 | Low-Medium | Seed the early adopter / design partner cohort |
| **Freight broker association channels** | M6+ | $180–$350 | Medium | Trust-based, mid-funnel acceleration |
| **Referral / word of mouth** | M7+ | $25–$65 | Medium | Natural viral loop from proposal exports |
| **Google Ads (targeted)** | M9+ | $200–$400 | Medium | Accelerate SEO gaps for high-intent queries |
| **Content partnerships / trade press** | M10+ | $85–$150 | Medium | Authority building, backlinks |
| **Direct FTZ outreach (grantee list)** | M8+ | $350–$600 | Low | High-value consulting conversion |

---

### 4.2 Channel 1: SEO-First Content Engine

**Rationale:** The majority of high-intent Shipping Savior searches are long-tail queries with low competition and high commercial intent. "FTZ savings calculator," "landed cost formula SE Asia," "HTS code lookup Vietnam tariff," "Section 301 tariff modeler" — these are queries where a domain with 20 well-crafted pages can rank in the top 3 within 6–9 months.

**Content pillars:**

1. **FTZ Strategy** — "How to use a Foreign Trade Zone to defer duties," "FTZ vs. bonded warehouse comparison," "Mandatory PF status after April 2025 executive order"
2. **SE Asia Duty Intelligence** — "Vietnam tariff rates by HTS code," "UFLPA compliance checklist for SE Asia importers," "Section 301 tariff exclusion request guide"
3. **Freight Brokerage Operations** — "How to build a client proposal for ocean freight," "Backhaul pricing explained," "How to calculate landed cost accurately"
4. **Cold Chain Compliance** — "FSMA Safe Food Transport rule requirements," "Reefer container specifications by carrier," "Cold chain cost modeling"
5. **Tariff news + analysis** — Fast-turnaround articles on Section 301 changes, executive orders, HTS reclassifications

**Content production targets:**
- M1–M3: 5 foundational pillar pages (these rank fastest because they're comprehensive)
- M4–M6: 2 articles/week (topical authority build)
- M7+: 3–4 articles/week + quarterly data reports (FTZ savings benchmarks, SE Asia duty cost index)

**SEO KPIs:**
- 500 organic sessions/month by M6
- 2,500 organic sessions/month by M12
- 10,000 organic sessions/month by M18
- Calculator tool page in top 5 for "FTZ savings calculator" by M9

---

### 4.3 Channel 2: The FTZ Calculator as a Viral Acquisition Loop

**How it works:**
1. User lands on the FTZ Savings Analyzer (free, no login)
2. They input their HTS code, country of origin, and annual import value
3. The tool outputs estimated duty deferral savings in dollars
4. A compelling savings number (e.g., "$187,000/year in deferred duties") triggers social sharing / word-of-mouth
5. The results page has a CTA: "Get a full FTZ strategy report — start free trial"
6. Conversion to email signup or trial

**Why this works in 2026:** The April 2025 tariff environment means FTZ savings are not hypothetical — they're urgent. An importer who discovers they could defer $200K in duties this year has strong motivation to convert. The tool is a self-qualifying lead magnet.

**Virality mechanism:** Freight brokers send calculator outputs to their clients as attachments. Each output has Shipping Savior branding + "Created with Shipping Savior — shippingsavior.com." Every PDF export is an acquisition touch.

---

### 4.4 Channel 3: Founder-Led LinkedIn Outreach

**Target audience:**
- Freight brokers: Search "freight broker" + "FTZ" or "SE Asia" or "cold chain" on LinkedIn
- Import ops managers: Search "import manager" + "consumer goods" + "Vietnam"
- Custom brokers: Natural referral partners — identify and recruit

**Outreach message framework:**

*"Hi [Name] — I'm building a tool that does [specific thing relevant to their profile]. Ran a quick [FTZ estimate / landed cost calculation / backhaul analysis] for your lane and found [specific number]. Happy to share the full output if useful — no sales pitch, just trying to get real feedback from operators."*

**Why this works:** The outreach is value-first. Sending a real output (not a demo request) demonstrates the product immediately. Cold response rates for value-first outreach in logistics are 15–25% — 3–5x higher than generic SaaS cold messages.

**Volume targets:**
- M1–M3: 20 outreach/week (founder-led design partner recruitment)
- M4–M6: 40 outreach/week (beta conversion)
- M7–M12: 60 outreach/week (scaled SDR process or part-time hire)

---

### 4.5 Channel 4: Referral Program (Broker-Driven)

**Mechanism:** Every Shipping Savior Pro and Enterprise subscriber gets a referral link. When a referred user converts to a paying plan, the referrer gets 2 months free.

**Why freight brokers are powerful referrers:** They're connective tissue in the industry. A broker who uses Shipping Savior to build client proposals will naturally recommend it to other brokers they know — because it makes their own proposals look more professional and they want the industry to standardize on tools they already use.

**Target referral rate:** 25% of new paying customers come via referral by M12.

---

### 4.6 Channel 5: Trade Association and Media

**Priority associations:**
- **TIA (Transportation Intermediaries Association)** — 1,000+ member freight brokers; annual conference + newsletter
- **NCBFAA (National Customs Brokers & Forwarders Association)** — customs brokers who become referral partners
- **Cold Chain Federation** — Cold chain operators in the target segment
- **FTZ Association (NAFTZ)** — FTZ grantees are direct targets for consulting retainers

**Media targets:**
- *FreightWaves* — Dominant logistics trade media; product review or sponsored content
- *Journal of Commerce* (JOC) — Industry authority; news coverage of FTZ tools during tariff season
- *Supply Chain Dive* — Reader base overlaps with Import Ops Manager ICP
- *Food Logistics* — Cold chain-specific readership

**Goal:** At least 3 trade press mentions by M9, one of which is a feature story on the FTZ analyzer timing.

---

## 5. Pricing Strategy

### 5.1 Pricing Philosophy

Shipping Savior uses a **freemium-to-paid conversion model** anchored on demonstrated ROI. The free tier provides enough value to generate trust and show the product works. The paid tier unlocks the workflow features that save time at scale. The consulting tier prices on value delivered (not hours).

The pricing is calibrated to sit in confirmed white space between:
- SMB freight marketplaces: free to $200/month (too simple for our ICP)
- Enterprise platforms (Xeneta, project44, Descartes): $50,000–$500,000/year (inaccessible to our ICP)

**Shipping Savior targets $300–$1,500/month** — affordable for a solo freight broker or mid-size import operation, but priced high enough to signal professional-grade tooling.

---

### 5.2 SaaS Subscription Tiers

#### Free Tier (Freemium — Permanent)
**Price:** $0
**Access:**
- FTZ Savings Analyzer (limited: 3 calculations/month)
- Landed Cost Calculator (limited: 5 calculations/month)
- HTS Code Lookup (limited: 10 lookups/month)
- Route Comparison (limited: 2 routes/month)
- No PDF export, no saved history, no team sharing

**Purpose:** Acquisition hook. Convert on demonstrated value, not on trial urgency.

---

#### Starter Tier
**Price:** $149/month (or $1,490/year — 17% discount)
**Access:**
- All calculators, unlimited usage
- PDF proposal exports (branded with Shipping Savior)
- Calculation history (90-day retention)
- HTS code lookup, unlimited
- 1 user seat

**Target customer:** Solo freight broker or individual import analyst using the platform for their own shipments.

**Conversion trigger:** User hits the free-tier calculator limit and wants to save or export results.

---

#### Pro Tier
**Price:** $399/month (or $3,990/year — 17% discount)
**Access:**
- Everything in Starter
- Up to 5 user seats
- White-labeled PDF exports (client's logo on proposals)
- Calculation history, unlimited retention
- Tariff change alerts (HTS code watchlist, up to 50 codes)
- Backhaul pricing module (full access)
- Cold chain cost overlay
- Priority email support

**Target customer:** Freight brokerage with 2–5 team members building client proposals. Import operations team at a mid-size importer.

**Conversion trigger:** Broker wants to add a team member or brand proposals with their own logo.

---

#### Enterprise Tier
**Price:** $1,499/month (or $14,990/year — 17% discount)
**Access:**
- Everything in Pro
- Unlimited user seats
- API access (full calculation API for ERP/TMS integration)
- Custom FTZ zone data integration
- Dedicated account manager
- SLA: 4-hour response time
- Single Sign-On (SSO)
- Custom data retention policies
- Quarterly strategy call with founder

**Target customer:** Multi-team import operation ($50M+ revenue) or large freight brokerage with enterprise clients.

**Conversion trigger:** Needs team-wide access, API integration with internal systems, or compliance data export.

---

### 5.3 FTZ Consulting Retainers

Consulting is priced on value delivered (duty deferral achieved), not time.

| Tier | Monthly Retainer | Scope |
|------|-----------------|-------|
| **FTZ Starter** | $3,000/month | Initial status election analysis, monthly withdrawal strategy review, 1 FTZ zone |
| **FTZ Growth** | $6,000/month | Multi-zone strategy, incremental withdrawal modeling, April 2025 EO compliance, quarterly CBP prep |
| **FTZ Enterprise** | $12,000/month | Full FTZ program management, multi-zone multi-port strategy, annual FTZ Board report support, direct CBP liaison coordination |

**Positioning:** "If we don't save you more than our retainer in duties within 60 days, we'll refund the first month." This is credible because FTZ optimization on $5M+ annual import value almost always yields >$30K/month in duty deferral benefit.

---

### 5.4 Data Intelligence Add-ons

Optional add-ons purchasable at any tier:

| Add-on | Price | Description |
|--------|-------|-------------|
| **Tariff Watch Pro** | $99/month | Daily HTS tariff change alerts for up to 500 codes; Section 301 exclusion deadline tracking |
| **SE Asia Duty Index** | $199/month | Quarterly duty rate benchmark reports for Vietnam, Thailand, Indonesia, Cambodia — by HTS chapter |
| **Carrier Rate Intelligence** | $299/month | Monthly benchmark data for Pacific and Atlantic container rates; reefer vs. dry premium trends |

---

### 5.5 Freemium Conversion Economics

Expected conversion funnel (steady state):
- Free calculator users → email signup: 8–12%
- Email signup → free tier account: 60%
- Free tier account → Starter trial: 15%
- Starter trial → Starter paid: 65%
- Starter paid → Pro upgrade: 22% (within 6 months)

**Blended CAC from PLG channel:** $85–$145 (calculator acquisition + email nurture + conversion)

---

## 6. Sales Motion: PLG + Sales-Assist Hybrid

### 6.1 The Motion

Shipping Savior uses a **Product-Led Growth core with a Sales-Assist layer** for mid-market and enterprise conversion. The motion is:

```
CALCULATOR (free, no auth)
        ↓
    Email capture
        ↓
   Free tier account
        ↓
   In-product usage
        ↓
  Paywall trigger (limit hit)
        ↓
   Self-serve upgrade (Starter/Pro)
        ↓
  Usage signals → Sales-assist outreach (Enterprise/Consulting)
```

**Why PLG first:** Freight operators are skeptical of SaaS sales. They've been burned by expensive platforms that didn't deliver ROI. A tool that proves its value before asking for a credit card removes the primary objection. PLG also scales without proportional headcount.

**Why Sales-assist for high-value conversions:** The FTZ consulting retainer ($3,000–$12,000/month) and Enterprise tier ($1,499/month) are not self-serve purchases. They require a conversation. Sales-assist kicks in when:
- A user has run 10+ calculations (high engagement signal)
- A user has looked at the FTZ Analyzer with a result showing $100K+ in savings
- A company email domain maps to a company with $50M+ import revenue

---

### 6.2 Self-Serve Track (Starter and Pro)

- User discovers Shipping Savior via SEO, LinkedIn, or referral
- Runs a free calculation — sees real output with their numbers
- Hits the free-tier limit or wants to save/export the result
- Clicks "Upgrade" → credit card flow → active subscription
- Onboarding: 5-email sequence (one per calculator feature, one on backhaul module, one on FTZ advanced usage)
- No sales involvement needed

**Target: 80% of Starter and Pro conversions are fully self-serve.**

---

### 6.3 Sales-Assist Track (Enterprise and Consulting)

**Trigger criteria:**
- Signed up for free tier + ran 10+ calculations within 7 days
- FTZ Analyzer result showed $150K+ in potential annual savings
- Company domain matches known FTZ grantee in CBP database
- Pro subscriber asking about API access or team-wide SSO

**Sales-assist process:**
1. Automated alert to founder (or SDR at M10+) when trigger fires
2. Personalized outreach: "I saw you modeled FTZ savings for [HTS chapter] — I had a thought on the incremental withdrawal strategy for your volume. Have 20 minutes?"
3. 30-minute strategy call (not a demo — a strategic conversation)
4. Consulting proposal within 48 hours if fit is confirmed
5. 30-day consulting pilot with monthly fee waived if they're already a platform subscriber

**Sales cycle:** 2–4 weeks for Enterprise SaaS; 4–8 weeks for consulting retainers.

---

### 6.4 Expansion Revenue Motion

Once a customer is on Starter, the expansion path is:

- **Starter → Pro:** Adding team members OR white-labeling proposals (triggered when broker wants to send branded proposals to a new client)
- **Pro → Enterprise:** Needing API access OR SSO OR custom FTZ data
- **Platform subscriber → Consulting add-on:** FTZ Analyzer surfaces a large savings opportunity; sales-assist proposes retainer

**Net Revenue Retention target:** 115%+ by M18. This means existing customers grow their spend faster than any churn.

---

## 7. Launch Phases and Milestones

### Phase 0: Foundation (M1–M3) — Build and Validate

**Goal:** Get to a shippable MVP and validate with 3–5 real operators.

**Key milestones:**
- [ ] M1: Platform MVP live at shipping-savior.vercel.app (proposal site already live)
- [ ] M1: FTZ Savings Analyzer functional with real HTS data
- [ ] M2: All 6 calculators functional and tested
- [ ] M2: HTS Schedule integration (100K+ codes from USITC)
- [ ] M2: Country-specific duty rates for Vietnam, Thailand, Indonesia, Cambodia
- [ ] M3: 3 design partners using the platform (Blake + 2 external recruits)
- [ ] M3: 10 long-form SEO articles published

**Success criteria:** 3 operators have each run at least 20 real calculations. At least one non-Blake operator says "I would pay for this today."

---

### Phase 1: Beta (M4–M6) — Design Partner Cohort

**Goal:** Recruit 10 design partners, refine product, build content foundation.

**Key milestones:**
- [ ] M4: 10 design partners recruited (free access, weekly feedback calls)
- [ ] M4: Calculation save + history feature live (drives conversion to paid)
- [ ] M4: PDF export live (the proposal-branded export is the viral loop)
- [ ] M5: Referral program infrastructure live
- [ ] M5: Tariff change alert system live (HTS watchlist)
- [ ] M5: 25 SEO articles published; first 5 ranking for target queries
- [ ] M6: 3 of 10 design partners convert to paying (proof of willingness-to-pay)
- [ ] M6: MRR target: $2,500–$5,000 (from early converters)

**Success criteria:** 3+ paying customers, 1 FTZ consulting pilot started, organic search traffic reaching 500 sessions/month.

---

### Phase 2: Launch (M7–M9) — Public Launch and First Growth

**Goal:** Open registration, hit first meaningful ARR milestone, validate acquisition channels.

**Key milestones:**
- [ ] M7: Public launch — Product Hunt submission, FreightWaves press pitch
- [ ] M7: LinkedIn campaign live (targeting freight brokers + import ops titles)
- [ ] M7: First paying non-referral customer acquired via SEO
- [ ] M8: 50+ SEO articles published; "FTZ savings calculator" ranking top 10
- [ ] M8: 2 FTZ consulting retainers active
- [ ] M8: LinkedIn outreach scaled to 40/week
- [ ] M9: MRR target: $15,000–$22,000
- [ ] M9: 50+ registered users; 20+ paying customers

**Success criteria:** MRR growing 25%+ month-over-month, 2+ acquisition channels each contributing paying customers, 1 trade press feature.

---

### Phase 3: Growth (M10–M18) — Scale and Expand

**Goal:** Reach $100K MRR, build content engine to compounding organic acquisition, launch data intelligence add-ons.

**Key milestones:**
- [ ] M10: Hire SDR (part-time or fractional) for Enterprise and consulting outreach
- [ ] M10: Launch "SE Asia Duty Index" quarterly report as lead magnet + premium add-on
- [ ] M11: API access live for Enterprise tier (critical for ERP integration sales)
- [ ] M11: MRR crosses $25,000
- [ ] M12: 110+ paying customers across all tiers
- [ ] M12: 5+ FTZ consulting retainers active; consulting revenue > $20,000/month
- [ ] M13: Google Ads campaign live for highest-intent queries
- [ ] M14: Carrier rate intelligence add-on live
- [ ] M15: White-label partnership program (customs brokers can offer Shipping Savior to their clients under their own brand)
- [ ] M18: MRR target: $85,000–$165,000

**Success criteria:** 115%+ NRR, $1M ARR crossed, 3+ enterprise accounts on annual contracts.

---

## 8. Key Partnerships

### 8.1 Carrier Partnerships

**Strategic goal:** Data access and distribution.

| Carrier | Partnership Type | Value to Shipping Savior | Value to Carrier |
|---------|-----------------|------------------------|-----------------|
| **Maersk** | API rate data integration (DCSA standard) | Real-time container rate data for route comparison | Distribution of Maersk quotes to new SMB customer segment |
| **MSC** | Same as Maersk | Route schedule data (vessel ETA accuracy) | Same |
| **CMA CGM** | Same as Maersk | Pacific lane rate intelligence | Same |
| **Hapag-Lloyd** | Same as Maersk | Atlantic + Europe lane coverage | Same |

**Execution approach:** All 4 carriers adopted DCSA standard APIs in 2024–2025. This means no custom EDI integration needed — standard OAuth2 API keys available through each carrier's developer portal. Target M6 for first carrier integration (Maersk as the most developer-friendly), M9 for all 4.

**Lineage Logistics (cold chain specific):**
- Blake already has operational relationships at Lineage terminals
- Goal: Data partnership for terminal scheduling and availability
- Phase 3+ opportunity: Lineage white-label integration for cold chain operators who route through Lineage

---

### 8.2 ERP and TMS Integrations

**Target integrations (in priority order):**

| System | User Base Overlap | Integration Type | Phase |
|--------|-----------------|-----------------|-------|
| **CargoWise** | Legacy TMS used by mid-large forwarders | API data sync | M12+ |
| **GoFreight** | Modern TMS for SMB freight forwarders | Two-way integration (they complement, not compete) | M10+ |
| **NetSuite** | Import operations teams at $20M–$150M companies | Landed cost sync to GL | M14+ |
| **Shopify / WooCommerce** | E-commerce brands importing from SE Asia | Duty cost at-checkout integration | M18+ |

**Strategic rationale:** ERP/TMS integrations create deep customer lock-in (switching cost increases dramatically once data flows bidirectionally). They also open enterprise sales channels — ERP consultants recommend tools that integrate with the ERP they've already sold.

---

### 8.3 Customs Broker Referral Network

**Who they are:** Licensed CHBs (Customs House Brokers) who file CBP entries on behalf of importers. There are ~10,000 licensed CHBs in the US.

**Why they're valuable:**
- Direct relationship with every importer they file for
- Regularly asked "should I use an FTZ?" — they need a tool to answer this
- Not competitive with Shipping Savior (we analyze, they file)

**Partnership structure:**
- CHB partners get a white-labeled version of the FTZ Analyzer and Landed Cost Calculator to share with their importer clients (under the CHB's brand)
- CHB gets a 25% revenue share on any importer who converts to a paying Shipping Savior subscription via their referral
- CHBs in the partner network get listed in the Shipping Savior "Find a Customs Broker" directory (SEO benefit for them)

**Target M18:** 50 active CHB referral partners.

---

### 8.4 3PL and Freight Forwarder Partnerships

**Structure:** Non-competing 3PLs (asset-based, focused on warehousing) that need an analysis tool to offer their import clients without building one themselves.

**Target partners:**
- 3PLs with FTZ warehouse operations (they want to attract FTZ-eligible importers)
- Freight forwarders focused on SE Asia that want to differentiate from Flexport on analytical depth

**Partnership type:** Co-marketing + referral. 3PL includes Shipping Savior in their onboarding package for new import clients. Shipping Savior provides a white-labeled calculator set. Revenue share on conversions.

---

### 8.5 Data Provider Partnerships

| Provider | Data Type | Current Source | Partnership Upgrade |
|----------|-----------|---------------|-------------------|
| **USITC** | HTS Schedule (100K codes) | Free public data | Already integrated (no partnership needed) |
| **CBP** | CROSS rulings database | Free public data | Direct API relationship for faster updates |
| **Freightos Baltic Index (FBX)** | Container rate index | Free public API | Premium data licensing for real-time rates |
| **PIERS (IHS Markit)** | US import shipment data | $50K+/year enterprise license | Explore at M12+ (expensive but high-value for competitive intelligence) |

---

## 9. Competitive Positioning

### 9.1 Positioning Statement

**"Shipping Savior is the FTZ optimization platform for freight brokers and SE Asia importers — the only modern, accessible alternative to legacy enterprise tools built for the 2025 tariff environment."**

This statement:
- Claims a specific, defensible category (FTZ optimization for a specific customer)
- Stakes out a clear enemy (legacy enterprise tools)
- Anchors to a timely, credible narrative (2025 tariff environment)
- Implies the competition is the wrong alternative (too expensive, too old)

---

### 9.2 Competitive Differentiation Matrix

| Differentiator | Why It Matters | Who Doesn't Have It |
|---------------|---------------|---------------------|
| **Modern FTZ Savings Analyzer** | Only current-generation FTZ tool; all others are legacy (Descartes) or absent | All competitors except Descartes (whose tool is 2017-era) |
| **Incremental withdrawal modeling** | Allows optimization of exactly when and how much inventory leaves FTZ | Nobody — unique to Shipping Savior |
| **Backhaul pricing intelligence module** | Freight brokers' primary competitive advantage, systematized as software | Nobody — completely absent from all 10 competitors researched |
| **Cold chain + FTZ + brokerage in one platform** | No competitor has integrated these three capabilities | Nobody — exists in fragments across multiple platforms |
| **Mid-market pricing ($149–$1,499/month)** | Sits in confirmed white space between SMB tools ($0–$200) and enterprise ($50K+) | Nobody occupies this price point with comparable features |
| **Independent of any forwarder** | Not locked to Flexport's ecosystem; works regardless of which forwarder the customer uses | Flexport (locked), all enterprise tools (also locked) |

---

### 9.3 Positioning vs. Key Competitors

**vs. Flexport:**
"Flexport's 2025 tariff tools are good — if you only use Flexport. We give you the same analytical depth without locking you into one forwarder's ecosystem. Your carrier relationships stay yours."

**vs. Descartes / QuestaWeb:**
"Descartes has FTZ software from 2017. It wasn't built for Privileged Foreign status elections under the April 2025 executive order. We were."

**vs. Freightos:**
"Freightos tells you what freight costs. We tell you what importing actually costs — after duties, FTZ optimization, cold chain premiums, and the 15–25% in hidden costs most importers miss."

**vs. Xeneta:**
"Xeneta starts at $25,000/year and gives you market rate benchmarks. We start at $149/month and include the analysis layer that tells you what to do with those rate benchmarks."

**vs. project44 / FourKites:**
"Visibility tells you where your shipment is after you've committed. We help you make better decisions before you book — FTZ strategy, route comparison, landed cost accuracy."

---

### 9.4 Positioning by Segment

| Segment | Primary Message | Proof Point |
|---------|----------------|-------------|
| **Freight Brokers** | "Build professional proposals in 10 minutes, not 3 hours" | Before/after time comparison; sample proposal PDF |
| **SE Asia Importers** | "Find the 20% of import costs your forwarder isn't telling you about" | Landed cost calculator output showing hidden costs |
| **Cold Chain Operators** | "The only tool that models cold chain costs, not just dry cargo rates" | Cold chain premium calculation on a real lane |
| **FTZ Grantees** | "Modern FTZ optimization built for the April 2025 tariff environment" | FTZ savings output for a real HTS code and volume |

---

## 10. Success Metrics (CAC, LTV, Churn)

### 10.1 North Star Metric

**Monthly Recurring Revenue (MRR)** — simple, directly tied to business health, measurable at any stage.

Secondary north star: **Active operator-months** (number of unique users who ran at least one calculation in a rolling 30-day window). This separates real engagement from signup churn.

---

### 10.2 Customer Acquisition Cost (CAC) Targets

| Channel | Target CAC | Notes |
|---------|-----------|-------|
| SEO / organic | $45–$95 | Content cost amortized over expected lifetime of organic traffic |
| PLG calculator loop | $0–$55 | Calculator is already built; cost is email nurture sequences only |
| LinkedIn founder outreach | $120–$200 | Founder time valued at $150/hour |
| Referral program | $25–$65 | 2 months free credit; value at plan ARPU |
| Association/trade events | $180–$350 | Event cost divided by attributed conversions |
| Google Ads | $200–$400 | Competitive queries; test first, scale if LTV:CAC > 4:1 |
| Direct FTZ outreach | $350–$600 | High-touch for high-value consulting conversion |

**Blended CAC target (M12):** $110–$150 across all channels.

---

### 10.3 Lifetime Value (LTV) Targets

LTV calculation: `(ARPU × Gross Margin) / Monthly Churn Rate`

| Tier | ARPU | Gross Margin | Monthly Churn | LTV |
|------|------|-------------|--------------|-----|
| Starter | $149 | 88% | 4.5% | $2,915 |
| Pro | $399 | 85% | 2.8% | $12,107 |
| Enterprise | $1,499 | 82% | 1.2% | $102,432 |
| FTZ Consulting | $6,000 (avg) | 72% | 1.8% | $240,000 |

**LTV:CAC targets:**
- Starter: 6:1 minimum (LTV $2,915 vs. target CAC $150 blended = 19:1 — well above minimum)
- Pro: 8:1 minimum
- Enterprise: 10:1 minimum (given sales-assist cost)

---

### 10.4 Churn Targets

| Tier | Target Monthly Churn | Mechanism to Achieve It |
|------|---------------------|------------------------|
| Starter | <4.5% | Calculation history lock-in (losing data hurts); HTS watchlist with saved codes |
| Pro | <2.8% | Multi-seat lock-in; white-labeled proposals part of workflow |
| Enterprise | <1.2% | API integration = deep tech dependency; dedicated account manager |
| Consulting | <1.8% (monthly) | Duty deferral is ongoing — canceling retainer = stopping a savings program |

**Annual churn equivalents:** Starter 42%, Pro 29%, Enterprise 14%, Consulting 20%.

**Churn reduction playbook:**
- 30-day inactivity alert → personalized email with "here's a calculation based on your saved HTS codes"
- Pre-renewal survey at M11 for annual subscribers
- Quarterly business reviews for Enterprise and Consulting customers (proactive, not reactive)

---

### 10.5 Revenue Milestones

| Milestone | Target Month | MRR | Notes |
|-----------|-------------|-----|-------|
| First dollar | M6 | $598 | First 2 converting beta users |
| $5K MRR | M8 | $5,000 | Proof of repeatable acquisition |
| $10K MRR | M9–M10 | $10,000 | Stable growth pattern |
| $25K MRR | M11–M12 | $25,000 | Near break-even (base case) |
| $50K MRR | M13–M14 | $50,000 | 5:1 LTV:CAC confirmed |
| $100K MRR | M16–M17 | $100,000 | $1.2M ARR run rate |

---

### 10.6 Leading Indicators Dashboard

These metrics predict future revenue and health before MRR changes:

| Metric | Target (M12) | Why It Matters |
|--------|-------------|---------------|
| Free calculator uses/month | 2,000+ | Top of funnel volume |
| Email signups/month | 150+ | PLG loop conversion quality |
| Trial → paid conversion rate | 15%+ | Product-market fit signal |
| Time-to-first-value (minutes to run first calculation) | <5 min | UX quality signal |
| NPS score | 45+ | Word-of-mouth propensity |
| Free-to-paid conversion rate (30-day) | 8%+ | Freemium model efficiency |
| Calculation-to-export rate | 30%+ | Engagement depth signal |
| Broker-sent proposal exports/month | 500+ | Viral loop activation |

---

## 11. Content and SEO Strategy

### 11.1 Content Pillars and Key Articles

**Pillar 1: FTZ Strategy (primary)**
- "What is a Foreign Trade Zone and How Does It Save You Money on Duties?"
- "FTZ Privileged Foreign vs. Non-Privileged Foreign Status: Which Should You Choose?"
- "The April 2025 Executive Order That Made FTZ Mandatory for Some Importers"
- "How to Calculate FTZ Savings for Your Specific HTS Code"
- "FTZ vs. Bonded Warehouse: The Complete Comparison for 2026"

**Pillar 2: Landed Cost Accuracy**
- "The 15–25% of Import Costs Your Freight Forwarder Isn't Telling You About"
- "Complete Landed Cost Formula: All 22 Components for Accurate Import Cost Modeling"
- "Why Your HTS Code Assignment Could Be Costing You Thousands in Overpaid Duties"

**Pillar 3: SE Asia Import Intelligence**
- "Vietnam Import Duty Rates by HTS Chapter: 2026 Guide"
- "UFLPA Compliance Checklist for SE Asia Consumer Goods Importers"
- "Section 301 Tariff Exclusion Request: Step-by-Step Guide for 2026"
- "SE Asia vs. China Supply Chain: The Full Duty Cost Comparison"

**Pillar 4: Cold Chain**
- "FSMA Safe Food Transport Rule: Complete Compliance Checklist for Importers"
- "Reefer Container Specifications by Ocean Carrier: 2026 Guide"
- "Cold Chain Freight Cost Modeling: Why Standard Rate Quotes Underestimate Your Costs"

**Pillar 5: Freight Brokerage Operations**
- "How to Build a Professional Ocean Freight Proposal (With Free Template)"
- "Backhaul Pricing Explained: How Smart Brokers Use Return-Leg Pricing as a Competitive Advantage"
- "HTS Code Lookup for Freight Brokers: The Complete Guide"

---

### 11.2 SEO Technical Requirements

- Fast load time: Calculator pages <1.5s LCP (critical — Google uses Core Web Vitals as ranking factor)
- Structured data: HowTo schema for calculator pages; FAQ schema for educational content
- Internal linking: Every article links to at least 2 calculator tools (converts readers to users)
- Image optimization: Diagrams for FTZ workflows, duty calculation breakdowns (ranks in image search)
- Open Graph: All calculator output pages generate shareable images with the savings number

---

### 11.3 Content Production Timeline

| Phase | Articles/Month | Cumulative | Focus |
|-------|---------------|------------|-------|
| M1–M3 | 4/month | 12 | Pillar pages (comprehensive, rank-worthy) |
| M4–M6 | 8/month | 36 | Topical cluster build |
| M7–M9 | 12/month | 72 | Scale + news commentary |
| M10–M18 | 16/month | 216 | Automated + AI-assisted production |

**Note:** Content production can be partially AI-assisted using structured outlines, but all FTZ and compliance content must be reviewed by a domain expert (founder or a CHB partner) before publication.

---

## 12. Risks and Mitigations

### 12.1 Market Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Tariff volatility normalizes (2025 urgency fades) | Medium | High | Build durable product value beyond tariff moment; FTZ value persists at any tariff level |
| Flexport opens Customs Tools to non-Flexport customers | Low | Medium | Differentiate on backhaul intelligence and FTZ incremental withdrawal — Flexport won't build these (counter to their business model) |
| Well-funded startup enters FTZ analytics | Medium | High | Speed to market; build moat on data (HTS history, FTZ grantee profiles) and founder domain expertise |
| Descartes modernizes QuestaWeb | Low | Medium | 2–3 year window; Descartes moves slowly via acquisition. Ship and establish brand before this happens |

### 12.2 Execution Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| HTS Schedule data becomes stale | Medium | High | Automated weekly refresh from USITC; monitoring alerts for HTS reclassifications |
| Floating-point errors in duty calculations | Medium | High | Use integer arithmetic for all money calculations (cents, not dollars); tested against known CBP entries |
| Churn higher than projected (PLG doesn't convert) | Medium | High | Monitor time-to-first-value aggressively; if >8 minutes, redesign onboarding |
| Founder bandwidth bottleneck (consulting + product + sales) | High | Medium | Hire part-time SDR at M9; delegate consulting execution to a CHB partner by M12 |

### 12.3 Regulatory Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| CBP changes FTZ regulations materially | Low | High | Regulatory monitoring; FTZ Association (NAFTZ) membership for early notice |
| UFLPA enforcement scope expands unexpectedly | Medium | Opportunity | Build UFLPA tracking as a feature, not a risk — broader enforcement = more demand for compliance tools |
| Data privacy concerns from enterprise customers | Low | Medium | SOC 2 Type II certification roadmap starting M10; data processing agreement templates ready at launch |

---

## Appendix A: TAM / SAM / SOM Summary

| Market | 2026 Value | Shipping Savior Addressable |
|--------|-----------|---------------------------|
| Digital supply chain & logistics tech (TAM) | $72B | — |
| US mid-market importers + freight brokers (SAM) | $3–6B | Primary target |
| Year 1–2 reachable market (SOM) | $15–50M | ~0.1% achievable |

---

## Appendix B: Key Definitions

- **FTZ (Foreign Trade Zone):** US government-designated zone where goods can be stored, assembled, or manufactured without paying duties until they enter US commerce
- **HTS (Harmonized Tariff Schedule):** The US classification system for all imported goods; the 10-digit code determines the duty rate
- **PF (Privileged Foreign) Status:** FTZ election that locks in the duty rate at the time goods enter the FTZ (useful when rates might increase)
- **NPF (Non-Privileged Foreign) Status:** FTZ election that pays duty based on the final product's rate when it enters commerce (useful when manufacturing transforms goods into a lower-duty category)
- **Incremental Withdrawal:** A strategy of removing goods from the FTZ in tranches over time to defer duty payments and match cash flow to inventory turns
- **Section 301 Tariffs:** Tariffs imposed by the USTR on Chinese-origin goods; the primary tariff avoiding tool driving supply chain migration to SE Asia
- **UFLPA (Uyghur Forced Labor Prevention Act):** Law creating a rebuttable presumption that goods with any input from Xinjiang were made with forced labor; requires country-of-origin tracing for SE Asia goods with Chinese inputs

---

*Document: GTM-STRATEGY.md*
*AI Issue: AI-5460*
*Created: 2026-03-27*
*Status: Complete — ready for execution*
