# Competitor Tracking — Shipping Savior

**Setup Date:** 2026-03-26
**Linear Issue:** AI-5419
**Review Owner:** Blake (founder)
**Last Updated:** 2026-03-26

---

## Purpose

This document establishes a systematic competitive intelligence program for Shipping Savior. The goal is to detect competitive moves early, inform roadmap decisions, and ensure Shipping Savior's five confirmed market gaps (FTZ analysis, cold chain + freight brokerage hybrid, backhaul pricing intelligence, integrated shipping intelligence, mid-market SE Asia analytics) remain differentiated as the market evolves.

---

## 1. Competitor Watchlist

Ten competitors to monitor across two tiers.

### Tier 1 — Direct Competitors (Highest Priority)

These platforms overlap most directly with Shipping Savior's core features.

| # | Competitor | Ticker / Stage | Core Value Prop | Primary Threat to Shipping Savior |
|---|------------|----------------|-----------------|-----------------------------------|
| 1 | **Freightos** | NASDAQ: CRGO | Freight marketplace + FBX rate index | Rate comparison features, HTS tooling |
| 2 | **Flexport** | Private (~$8B val) | Full-stack digital freight forwarder | Customs Technology Suite (launched 2025), tariff simulator, landed cost |
| 3 | **Xeneta** | Private | Ocean/air rate benchmarking | Rate intelligence layer — could expand into FTZ/landed cost |
| 4 | **project44** | Private (~$125M ARR) | Real-time supply chain visibility | Could add analytics/calculator features to visibility core |
| 5 | **FourKites** | Private ($50M+ ARR) | AI-powered supply chain visibility | Expanding AI features — cold chain visibility overlap |

### Tier 2 — Adjacent Competitors (Standard Priority)

These overlap on specific features but serve different buyers or segments.

| # | Competitor | Ticker / Stage | Core Value Prop | Overlap Area |
|---|------------|----------------|-----------------|--------------|
| 6 | **GoFreight** | Private | Modern TMS for freight forwarders | Operational workflow — could expand analytics |
| 7 | **Cargobase** | Private | Multi-quote transport procurement | Carrier comparison / rate procurement |
| 8 | **Descartes** | NASDAQ: DSGX ($6.17B) | Comprehensive logistics network + QuestaWeb FTZ | FTZ analysis — biggest legacy threat in our #1 differentiator |
| 9 | **Zonos** | Private | Cross-border duties/taxes for e-commerce | Duty/tariff calculation (parcel-focused, but could expand) |
| 10 | **CustomsTrack** | Private (UK-based) | AI customs declaration automation | Customs/compliance automation — UK-centric but expanding |

---

## 2. What to Track Per Competitor

For each competitor, monitor these five signal categories:

### 2.1 Pricing Changes
- New pricing tiers, plan restructures, freemium introductions
- Enterprise vs. self-serve pricing model shifts
- Hidden cost changes (overages, seat limits, API call limits)
- **Why it matters:** If a competitor drops to freemium, they may be commoditizing a feature we're building.

### 2.2 New Feature Launches
- Product changelog pages and release notes
- Product Hunt launches and beta announcements
- Press releases and blog posts announcing features
- **Key features to watch for competitors building into our gaps:**
  - FTZ analysis tools (any competitor — this is our #1 differentiator)
  - Backhaul pricing intelligence (currently in zero platforms)
  - Cold chain + freight brokerage integration
  - SE Asia duty rate calculators and scenario modeling
  - Mid-market positioning pivots

### 2.3 Funding Rounds
- Series A/B/C/D announcements
- Debt financing (signals growth without dilution)
- Public company earnings surprises (Freightos, Descartes)
- IPO filings or SPAC announcements
- **Why it matters:** A fresh $50M+ round signals a competitor is about to hire aggressively and ship features fast.

### 2.4 Hiring Signals
LinkedIn job posts reveal strategic priorities 6–12 months before features ship. Look for:
- "Senior Product Manager — Customs & Compliance" → building FTZ/duty features
- "Software Engineer — Data Pipelines" → expanding data integrations
- "Head of Cold Chain Logistics" → entering cold chain
- "SE Asia Partnerships Manager" → expanding into our geographic focus
- Mass hiring (10+ open roles) → post-funding feature sprint coming
- Mass layoffs → product pivots or contraction

### 2.5 Content and SEO Moves
- New content targeting keywords we rely on (FTZ calculator, landed cost calculator, SE Asia import duty)
- New white papers, guides, or tools that compete with our knowledge base
- Influencer partnerships in the logistics space
- Podcast/webinar presence targeting freight brokers and importers
- **Why it matters:** If Flexport publishes a definitive FTZ guide, it captures SEO ground we need.

---

## 3. Monitoring Cadence

Different signals warrant different check frequencies.

### Weekly (Every Monday — 30 min)

| Signal | Action |
|--------|--------|
| Google Alerts digest | Review email digest for all 10 competitors |
| LinkedIn activity | Check each Tier 1 competitor's LinkedIn page for posts, announcements, job postings |
| ProductHunt | Check for any new competitor launches or updates this week |
| Freightos + Descartes stock news | Check for CRGO/DSGX price movements >5% (signal of major news) |

### Monthly (First Monday of month — 60 min)

| Signal | Action |
|--------|--------|
| Feature changelog review | Visit each Tier 1 competitor's product changelog, release notes, or blog |
| G2 + Capterra reviews | Review new 1-star and 5-star reviews for all 10 competitors — extract pain points and praised features |
| Hiring scan | Count and categorize open roles for all 10 competitors on LinkedIn |
| GitHub scan (open-source competitors) | Check stars, recent commits, and new issues for Freightos FBX repo and any OSS tools |
| SEO competitive overlap | Run a quick keyword gap check for 5 priority keywords |
| Competitor pricing pages | Screenshot and compare against previous month |

### Quarterly (First week of each quarter — 2–3 hours)

| Signal | Action |
|--------|--------|
| Deep product review | Sign up for or demo any significant new competitor features |
| Funding news review | Search Crunchbase and PitchBook alerts for all 10 competitors |
| Earnings review | Review Freightos (CRGO) and Descartes (DSGX) quarterly earnings transcripts |
| Competitive matrix update | Update positioning matrix in Section 6 of this document |
| Strategic roadmap impact | Assess whether any competitive moves require roadmap changes |
| Annual report (Q4 only) | Review Descartes annual report for FTZ product investment signals |

---

## 4. Free Monitoring Tools Setup

### 4.1 Google Alerts

Set up the following alerts at **google.com/alerts** (set to "As it happens," delivered daily digest):

**Company name alerts (for each competitor):**
```
"Freightos" funding OR feature OR launch OR partnership
"Flexport" customs OR FTZ OR "landed cost" OR "cold chain"
"Xeneta" funding OR pricing OR feature OR expansion
"project44" funding OR feature OR "cold chain" OR FTZ
"FourKites" funding OR feature OR "cold chain" OR expansion
"GoFreight" funding OR feature OR launch
"Cargobase" funding OR feature OR launch
"Descartes" FTZ OR "QuestaWeb" OR funding OR acquisition
"Zonos" ocean OR freight OR "HTS" OR expansion
"CustomsTrack" expansion OR funding OR feature
```

**Category / keyword alerts (early warning on market moves):**
```
"FTZ calculator" OR "foreign trade zone calculator" tool
"landed cost calculator" freight new
"backhaul pricing" logistics software
"SE Asia import" duty calculator OR FTZ
"cold chain freight" technology OR platform OR software
"freight visibility" AI OR machine learning launch
"HTS code" automation OR AI OR calculator
```

**Delivery settings:**
- Frequency: At most once a day (digest)
- Sources: News, Blogs
- Region: Any region
- Deliver to: [Blake's email or shared team inbox]

### 4.2 LinkedIn Company Follows

Follow all 10 competitors' official LinkedIn company pages:

| Competitor | LinkedIn URL |
|------------|-------------|
| Freightos | linkedin.com/company/freightos |
| Flexport | linkedin.com/company/flexport |
| Xeneta | linkedin.com/company/xeneta |
| project44 | linkedin.com/company/project44 |
| FourKites | linkedin.com/company/fourkites |
| GoFreight | linkedin.com/company/gofreight |
| Cargobase | linkedin.com/company/cargobase |
| Descartes | linkedin.com/company/descartes-systems |
| Zonos | linkedin.com/company/zonos |
| CustomsTrack | linkedin.com/company/customstrack |

**LinkedIn hiring alert setup:**
For each Tier 1 competitor, set a job alert on LinkedIn with these keywords:
- "product manager" + [company name]
- "FTZ" OR "foreign trade zone" + logistics
- "cold chain" + software engineer OR product
- "customs" + senior engineer OR product manager

**Tip:** Use LinkedIn Sales Navigator free trial quarterly to pull headcount growth data for all 10 companies.

### 4.3 ProductHunt Tracking

1. Create a free ProductHunt account (producthunt.com)
2. Follow these topics: Logistics, Supply Chain, Shipping, Import/Export
3. Search and "upvote" the existing product listings for each competitor to receive update notifications:
   - Search: "Freightos", "Flexport", "FourKites", "project44", "Zonos" on ProductHunt
4. Enable browser notifications or set up a weekly email digest

**ProductHunt Google Alert (supplemental):**
```
site:producthunt.com logistics OR "supply chain" OR freight OR shipping
```

### 4.4 G2 and Capterra Review Monitoring

**G2 (g2.com):**
1. Search each competitor on G2 and bookmark their review page
2. On each page, sort by "Most Recent" — check monthly for new 1-star reviews (pain points) and 5-star reviews (praised features)
3. Key categories to monitor: Freight Forwarding Software, Supply Chain Visibility, Customs Management, Trade Compliance

**Capterra (capterra.com):**
1. Bookmark competitor pages in the "Freight Forwarding Software" and "Trade Compliance" categories
2. Check monthly for recent reviews

**What to look for:**
- Repeated complaints = feature gap we can fill
- Repeated praise = feature we must match (table stakes)
- Recent negative reviews about a specific feature = competitor weakness to exploit
- Sudden spike in reviews = competitor recently pushed a big update or ran a review campaign

**Review tracking shortcut — Google Alert:**
```
site:g2.com OR site:capterra.com "Freightos" OR "Flexport" OR "FourKites" review
```

### 4.5 GitHub Stars (Open Source Competitors)

None of the 10 core competitors are primarily open source, but monitor these adjacent OSS projects that inform the market:

| Repository | What It Signals | Check Cadence |
|------------|-----------------|---------------|
| [freightos/fbx-api-docs](https://github.com/freightos) | FBX API adoption and developer ecosystem | Monthly |
| [project44/api-docs](https://github.com/project44) | Carrier integration breadth | Monthly |
| Maersk/CMA CGM DCSA SDK repos | Carrier API standardization pace | Quarterly |
| [searoute-js](https://npmjs.com/package/searoute-js) | Maritime routing library adoption | Monthly (currently 306/week — watch for growth) |

**GitHub stars as a signal:**
- If an OSS logistics tool hits 1,000+ stars, it may become table stakes
- Stars growing >20%/month = community momentum, monitor closely
- New contributor activity = company may be quietly building on top of it

---

## 5. How to Respond to Competitive Moves

Use this decision tree when a competitor makes a significant move.

### Decision Tree

```
COMPETITIVE MOVE DETECTED
         |
         v
Is this in one of our 5 confirmed market gaps?
(FTZ, cold chain+freight, backhaul pricing, integrated intel, SE Asia mid-market)
         |
    YES  |  NO
     |         |
     v         v
How deep is the  Log in intelligence
competitive        log and continue
execution?         monitoring
     |
     +---> SHALLOW (press release,
     |     blog post, no live product)
     |              |
     |              v
     |         Monitor for 30 days.
     |         If no product ships, no action.
     |
     +---> PARTIAL (feature launched but
     |     limited — missing key components)
     |              |
     |              v
     |         Accelerate our version.
     |         Note their approach.
     |         Add differentiation point.
     |
     +---> FULL (launched, working, marketed)
                    |
                    v
              Is it better than our planned approach?
                    |
              YES   |   NO
               |           |
               v           v
          Read their   Stay the course.
          user reviews  Emphasize our
          immediately.  differentiation
          Identify       in positioning.
          gaps in their
          execution.
               |
               v
          Escalate to roadmap review:
          1. Can we do it better?
          2. Do we have a unique angle they missed?
          3. Do we need to de-prioritize or accelerate?
```

### Response Playbook by Move Type

**Competitor raises funding ($20M+):**
1. Log in intelligence log with amount, investor, stated use of funds
2. Forecast feature sprint: expect 3–6 months to new features
3. Review roadmap — accelerate any features that overlap with their stated direction
4. No immediate action needed unless they explicitly announce competing features

**Competitor launches FTZ-related feature (highest alert):**
1. IMMEDIATE: Try the feature same day
2. Document gaps and weaknesses
3. Publish a comparison or differentiation point within 30 days
4. Fast-track any FTZ features in our backlog that exceed their implementation
5. Alert: This is our #1 differentiator — treat every FTZ move as a priority event

**Competitor launches cold chain features:**
1. Review within one week
2. Assess if they integrated freight brokerage (our differentiator) or just temperature monitoring
3. If they only did temperature monitoring, we're still differentiated
4. If they integrated procurement + cold chain, escalate to roadmap review

**Competitor launches backhaul pricing tool:**
1. IMMEDIATE escalation — this is Blake's core manual advantage being productized
2. Same-day review and documentation
3. Emergency roadmap discussion within 48 hours
4. Note: No competitor currently has this feature — any launch here is a significant threat

**Competitor releases negative PR / major outage / customer exodus:**
1. This is an opportunity — do not exploit publicly, but note it
2. Monitor review sites for newly dissatisfied customers
3. Prepare targeted content addressing their weakness within 30 days

**Competitor acquires adjacent company:**
1. Log the acquisition and analyze what capabilities they gained
2. Map acquired capabilities against our roadmap
3. Assess if acquisition fills one of our 5 market gaps
4. Quarterly review: did the acquisition actually ship new features?

---

## 6. Competitive Intelligence Log Template

Use this table to log every significant competitive event. Add rows at the top (newest first).

### Intelligence Log

| Date | Competitor | Event Type | Summary | Source | Threat Level | Action Taken | Follow-up Date |
|------|------------|------------|---------|--------|--------------|--------------|----------------|
| YYYY-MM-DD | [Name] | [Funding / Feature / Hiring / Pricing / Content / Acquisition] | [1-2 sentence summary] | [URL or source] | [Low / Medium / High / Critical] | [None / Logged / Accelerated feature / Roadmap review] | YYYY-MM-DD |

**Threat Level Guide:**
- **Low** — Unrelated to our 5 market gaps; no immediate action needed
- **Medium** — Adjacent to a market gap; monitor for follow-up
- **High** — Directly overlaps a market gap; response plan needed within 30 days
- **Critical** — Targets our primary differentiator (FTZ or backhaul pricing); immediate escalation

### Seeded Log Entries (Known as of 2026-03-26)

| Date | Competitor | Event Type | Summary | Source | Threat Level | Action Taken | Follow-up Date |
|------|------------|------------|---------|--------|--------------|--------------|----------------|
| 2025-Q3 | Flexport | Feature | Launched "Customs Technology Suite" with tariff simulator, real-time tariff alerts, and landed cost calculations | Flexport blog / Phase 1 research | Medium | Noted during research; confirms tariff simulation market exists | 2026-06-01 |
| 2025-04 | Descartes | Regulatory response | QuestaWeb FTZ software impacted by EO 14257 reciprocal tariff PF mandate — Descartes customer base faces mandatory PF elections | CBP/FTZ Board guidance | Medium | Opportunity: Descartes FTZ software is legacy; modern UX is a gap | 2026-06-01 |
| 2025-04 | Market | Regulatory | EO 14257 ("Liberation Day") mandates PF status for reciprocal-tariff-scope goods — dramatically increases FTZ demand | Federal Register | High | Confirmed FTZ as #1 differentiator; build FTZ Analyzer in Phase 4 | 2026-09-01 |
| 2023 | Descartes | Acquisition | Acquired QuestaWeb (legacy FTZ software) — only major FTZ software in market | Descartes press release | High | Confirmed legacy gap — modern FTZ tool is uncontested | Ongoing |

---

## 7. Competitive Matrix (Snapshot as of 2026-03-26)

Update this table quarterly as part of the quarterly competitive review.

| Feature Category | Shipping Savior | Freightos | Flexport | Xeneta | Descartes | project44 | FourKites | Zonos |
|-----------------|-----------------|-----------|----------|--------|-----------|-----------|-----------|-------|
| **FTZ Savings Analyzer** | Building (Phase 4) | No | No | No | Legacy only | No | No | No |
| **Backhaul Pricing Intelligence** | Building (Phase 2) | No | No | No | No | No | No | No |
| **Cold Chain + Freight Brokerage** | Building (Phase 3+) | No | No | No | No | Partial | Partial | No |
| **Landed Cost Calculator** | Building (Phase 2) | Partial | Yes (2025) | No | Yes | No | No | Parcel only |
| **HTS Code Lookup** | Building (Phase 2) | No | Partial | No | Yes | No | No | Yes |
| **Tariff Scenario Modeling** | Building (Phase 4) | No | Yes (2025) | No | Partial | No | No | No |
| **Carrier Route Comparison** | Building (Phase 3) | Yes | Yes | No | Yes | No | No | No |
| **SE Asia Mid-Market Focus** | Yes (core) | No | No | No | No | No | No | No |
| **Interactive Route Map** | Building (Phase 3) | Partial | Yes | No | Yes | Yes | Yes | No |
| **Regulatory Compliance Checklist** | Building (Phase 5) | No | Partial | No | Yes | No | No | Partial |
| **PDF Export / Proposal Output** | Building (Phase 5) | No | No | No | Yes | No | No | No |
| **Free / Low-Cost Access** | Yes (goal) | Freemium | Enterprise | Enterprise | Enterprise | Enterprise | Enterprise | Parcel only |

**Legend:** Yes = live feature | Partial = limited/basic version | No = not offered | Building = on our roadmap

---

## 8. Priority Keyword Monitoring List

Track these terms monthly for new competitor content and ads:

**High-value keywords (our differentiators):**
- "FTZ calculator"
- "foreign trade zone savings calculator"
- "backhaul pricing freight"
- "landed cost calculator ocean freight"
- "SE Asia import duty calculator"
- "Vietnam import tariff calculator"
- "cold chain freight calculator"

**Market position keywords:**
- "Freightos alternative"
- "Flexport alternative"
- "freight analytics platform"
- "mid-market freight software"
- "import cost calculator"

**Monitoring method:**
1. Monthly Google search for each keyword (incognito mode to avoid personalization)
2. Note any new competitors appearing in the top 10 organic results
3. Note any competitors running paid ads on these terms

---

## 9. Maintenance Instructions

**Who owns this document:** Blake (founder) or designated team member

**When to update:**
- Add a row to the Intelligence Log whenever a signal is detected during weekly monitoring
- Update the Competitive Matrix quarterly
- Revise threat levels if market context changes

**When to escalate to roadmap discussion:**
- Any Critical-level event
- Three or more High-level events targeting the same market gap within 60 days
- A Tier 1 competitor raises $30M+ with logistics analytics in the stated focus

**Annual review:**
- Each January, reassess the watchlist — remove exited competitors, add new entrants
- Update the Competitive Matrix with full annual state of the market

---

*Document created: 2026-03-26*
*Next scheduled quarterly review: 2026-07-01*
*Linear: AI-5419*
