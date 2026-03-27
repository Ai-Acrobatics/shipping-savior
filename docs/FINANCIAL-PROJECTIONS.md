# Shipping Savior — Financial Projections
**AI-5437 | Phase 2: Planning**
*Authored: 2026-03-27 | Horizon: 36-Month Pro Forma*

> **Data Foundation:** All projections are derived from the GTM-STRATEGY.md pricing model, segment sizing, and milestone targets. Base case assumes execution of the GTM plan as written. Bull and bear cases apply multipliers to CAC, conversion rates, and churn defined in Section 9.

---

## Table of Contents

1. [Pricing and Unit Economics Summary](#1-pricing-and-unit-economics-summary)
2. [Customer Cohort Model](#2-customer-cohort-model)
3. [36-Month P&L Projection](#3-36-month-pl-projection)
4. [Monthly Detail: Months 1–12](#4-monthly-detail-months-1-12)
5. [Quarterly Detail: Months 13–36](#5-quarterly-detail-months-13-36)
6. [CAC Payback Period Analysis](#6-cac-payback-period-analysis)
7. [Break-Even Analysis](#7-break-even-analysis)
8. [Funding Requirements and Use of Funds](#8-funding-requirements-and-use-of-funds)
9. [Sensitivity Analysis: Bull / Base / Bear](#9-sensitivity-analysis-bull--base--bear)
10. [Key Financial KPIs Dashboard](#10-key-financial-kpis-dashboard)
11. [Investor-Ready Financial Summary](#11-investor-ready-financial-summary)

---

## 1. Pricing and Unit Economics Summary

### 1.1 Revenue Streams

| Stream | Price (Monthly) | Annual (17% disc.) | Gross Margin | Annual Churn |
|--------|-----------------|---------------------|--------------|--------------|
| **Free Tier** | $0 | — | — | n/a (acquisition) |
| **Starter** | $149/mo | $1,490/yr | 88% | 42% |
| **Pro** | $399/mo | $3,990/yr | 85% | 29% |
| **Enterprise** | $1,499/mo | $14,990/yr | 82% | 14% |
| **FTZ Consulting — Starter** | $3,000/mo | $36,000/yr | 72% | 20% |
| **FTZ Consulting — Growth** | $6,000/mo | $72,000/yr | 72% | 20% |
| **FTZ Consulting — Enterprise** | $12,000/mo | $144,000/yr | 72% | 20% |
| **Tariff Watch Pro add-on** | $99/mo | — | 92% | tracks host plan |
| **SE Asia Duty Index add-on** | $199/mo | — | 90% | tracks host plan |
| **Carrier Rate Intelligence add-on** | $299/mo | — | 90% | tracks host plan |

### 1.2 Unit Economics Per Tier

**Starter Tier**

| Metric | Value |
|--------|-------|
| ARPU (monthly) | $149 |
| Gross margin | 88% |
| Monthly gross profit per customer | $131 |
| Monthly churn | 4.5% |
| Average customer lifetime | 22.2 months |
| LTV (gross profit basis) | $2,915 |
| Blended CAC (base case) | $130 |
| LTV:CAC ratio | **22:1** |
| CAC payback period | 1.0 months |
| Contribution after CAC (first year) | $1,397 |

**Pro Tier**

| Metric | Value |
|--------|-------|
| ARPU (monthly) | $399 |
| Gross margin | 85% |
| Monthly gross profit per customer | $339 |
| Monthly churn | 2.8% |
| Average customer lifetime | 35.7 months |
| LTV (gross profit basis) | $12,107 |
| Blended CAC (base case) | $180 |
| LTV:CAC ratio | **67:1** |
| CAC payback period | 0.5 months |
| Contribution after CAC (first year) | $3,888 |

**Enterprise Tier**

| Metric | Value |
|--------|-------|
| ARPU (monthly) | $1,499 |
| Gross margin | 82% |
| Monthly gross profit per customer | $1,229 |
| Monthly churn | 1.2% |
| Average customer lifetime | 83.3 months |
| LTV (gross profit basis) | $102,432 |
| Blended CAC (sales-assist) | $950 |
| LTV:CAC ratio | **108:1** |
| CAC payback period | 0.8 months |
| Contribution after CAC (first year) | $13,798 |

**FTZ Consulting (avg retainer $6,000/month)**

| Metric | Value |
|--------|-------|
| ARPU (monthly) | $6,000 |
| Gross margin | 72% |
| Monthly gross profit per engagement | $4,320 |
| Monthly churn | 1.8% |
| Average engagement lifetime | 55.6 months |
| LTV (gross profit basis) | $240,000 |
| Blended CAC (high-touch sales) | $850 |
| LTV:CAC ratio | **282:1** |
| CAC payback period | 0.2 months |

### 1.3 Revenue Mix Assumption (Base Case, Month 18)

| Tier | # Customers | ARPU | Monthly Revenue | % of MRR |
|------|-------------|------|-----------------|----------|
| Starter | 62 | $149 | $9,238 | 11% |
| Pro | 38 | $399 | $15,162 | 18% |
| Enterprise | 8 | $1,499 | $11,992 | 14% |
| FTZ Consulting | 5 | $6,200 (avg) | $31,000 | 37% |
| Add-ons (blended) | 28 users | $180 (blended) | $5,040 | 6% |
| Annual plan upfront (amortized) | — | — | $12,000 | 14% |
| **Total** | **141** | — | **$84,432** | **100%** |

---

## 2. Customer Cohort Model

### 2.1 Monthly New Customer Additions (Base Case)

*"M" = months from project start. Revenue-generating product launches at M7.*

| Month | New Starter | New Pro | New Enterprise | New Consulting | Total New | Cumulative |
|-------|-------------|---------|----------------|----------------|-----------|------------|
| M1 | 0 | 0 | 0 | 0 | 0 | 0 |
| M2 | 0 | 0 | 0 | 0 | 0 | 0 |
| M3 | 0 | 0 | 0 | 0 | 0 | 0 |
| M4 | 0 | 0 | 0 | 0 | 0 | 0 |
| M5 | 0 | 0 | 0 | 0 | 0 | 0 |
| M6 | 2 | 1 | 0 | 0 | 3 | 3 |
| M7 | 5 | 3 | 0 | 0 | 8 | 11 |
| M8 | 8 | 4 | 1 | 1 | 14 | 25 |
| M9 | 10 | 5 | 1 | 1 | 17 | 42 |
| M10 | 12 | 6 | 1 | 1 | 20 | 62 |
| M11 | 14 | 7 | 1 | 1 | 23 | 85 |
| M12 | 15 | 8 | 2 | 1 | 26 | 111 |
| Q5 (M13–15) | 45 | 24 | 5 | 3 | 77 | 188 |
| Q6 (M16–18) | 48 | 26 | 6 | 3 | 83 | 271 |
| Q7 (M19–21) | 54 | 30 | 7 | 4 | 95 | 366 |
| Q8 (M22–24) | 57 | 32 | 8 | 4 | 101 | 467 |
| Q9 (M25–27) | 60 | 36 | 9 | 5 | 110 | 577 |
| Q10 (M28–30) | 66 | 39 | 10 | 5 | 120 | 697 |
| Q11 (M31–33) | 72 | 42 | 11 | 6 | 131 | 828 |
| Q12 (M34–36) | 78 | 45 | 12 | 6 | 141 | 969 |

### 2.2 Net Customer Retention (Monthly)

Gross new customers minus monthly churn applied to existing base:

| Tier | Monthly Churn Rate | Retention Rate | Notes |
|------|--------------------|---------------|-------|
| Starter | 4.5% | 95.5% | Higher turnover; individual freelancers |
| Pro | 2.8% | 97.2% | Multi-seat stickiness |
| Enterprise | 1.2% | 98.8% | API integration lock-in |
| Consulting | 1.8% | 98.2% | Ongoing savings program |

### 2.3 Cohort Revenue Retention (NRR Projection)

Net Revenue Retention = (Ending MRR from cohort including expansions) / (Starting MRR from same cohort)

| Period | NRR | Driver |
|--------|-----|--------|
| M6–M12 | 95% | Early-stage; some churn, minimal expansion |
| M12–M18 | 108% | Starter→Pro upgrades drive expansion >churn |
| M18–M24 | 115% | Enterprise upsells + consulting add-ons outpace churn |
| M24–M36 | 118% | Mature expansion motion; ERP integrations increase retention |

### 2.4 Tier Upgrade Rates (Monthly, Steady State M12+)

| Upgrade Path | Monthly Rate | Primary Trigger |
|-------------|-------------|----------------|
| Starter → Pro | 3.5% of active Starters | Wants team seat or white-labeled proposals |
| Pro → Enterprise | 1.2% of active Pro | Needs API access or SSO |
| Platform → Consulting add-on | 0.8% of Pro+Enterprise | FTZ Analyzer surfaces $150K+ savings opportunity |

---

## 3. 36-Month P&L Projection

### 3.1 Summary P&L (Annual View)

| Line Item | Year 1 | Year 2 | Year 3 |
|-----------|--------|--------|--------|
| **Gross Revenue** | $109,600 | $1,027,200 | $2,937,600 |
| Annual plan discounts (17%) | ($3,900) | ($38,200) | ($108,400) |
| **Net Revenue** | $105,700 | $989,000 | $2,829,200 |
| Cost of Revenue | ($14,800) | ($118,700) | ($311,200) |
| **Gross Profit** | $90,900 | $870,300 | $2,518,000 |
| **Gross Margin** | 86% | 88% | 89% |
| — | — | — | — |
| Sales & Marketing | ($89,400) | ($247,300) | ($480,600) |
| Engineering & Product | ($72,000) | ($144,000) | ($216,000) |
| General & Administrative | ($36,000) | ($72,000) | ($108,000) |
| **Total OpEx** | ($197,400) | ($463,300) | ($804,600) |
| — | — | — | — |
| **EBITDA** | ($106,500) | $407,000 | $1,713,400 |
| **EBITDA Margin** | (101%) | 41% | 61% |
| — | — | — | — |
| **Ending MRR** | $25,600 | $84,000 | $246,400 |
| **ARR Run Rate (EoY)** | $307,200 | $1,008,000 | $2,956,800 |
| **Paying Customers (EoY)** | 111 | 271 | 604 |

### 3.2 Cost of Revenue Breakdown

Infrastructure, API, and delivery costs that scale with revenue:

| Cost Item | M12 Monthly | M24 Monthly | M36 Monthly |
|-----------|-------------|-------------|-------------|
| Cloud hosting (Vercel/AWS) | $400 | $1,200 | $3,500 |
| HTS data licensing + CBP API | $200 | $400 | $600 |
| Carrier rate API fees | $150 | $600 | $1,800 |
| Payment processing (Stripe, 2.9%) | $740 | $2,870 | $7,140 |
| Email platform (Resend/Postmark) | $80 | $180 | $350 |
| Analytics and monitoring | $100 | $250 | $500 |
| Consulting delivery (contractor hours) | $4,500 | $12,000 | $22,000 |
| **Total COGS** | **$6,170** | **$17,500** | **$35,890** |

---

## 4. Monthly Detail: Months 1–12

### 4.1 Revenue Build (MRR)

| Month | Starter MRR | Pro MRR | Enterprise MRR | Consulting MRR | Add-ons MRR | Total MRR | MoM Growth |
|-------|-------------|---------|----------------|----------------|-------------|-----------|------------|
| M1 | $0 | $0 | $0 | $0 | $0 | $0 | — |
| M2 | $0 | $0 | $0 | $0 | $0 | $0 | — |
| M3 | $0 | $0 | $0 | $0 | $0 | $0 | — |
| M4 | $0 | $0 | $0 | $0 | $0 | $0 | — |
| M5 | $0 | $0 | $0 | $0 | $0 | $0 | — |
| M6 | $298 | $399 | $0 | $0 | $0 | $697 | n/a |
| M7 | $894 | $1,197 | $0 | $0 | $99 | $2,190 | +214% |
| M8 | $2,087 | $2,793 | $1,499 | $6,000 | $298 | $12,677 | +479% |
| M9 | $3,727 | $4,389 | $2,998 | $12,000 | $596 | $23,710 | +87% |
| M10 | $5,513 | $6,381 | $4,497 | $18,000 | $995 | $35,386 | +49% |
| M11 | $7,445 | $8,772 | $5,995 | $24,000 | $1,393 | $47,605 | +35% |
| M12 | $9,377 | $11,163 | $8,992 | $30,000 | $1,791 | $61,323 | +29% |

*Note: M6 "first dollar" milestone assumes 3 converting beta users (2 Starter + 1 Pro) per GTM plan.*

### 4.2 Expense Build (Monthly)

| Month | S&M | Engineering | G&A | Total OpEx | Net Cash Flow |
|-------|-----|-------------|-----|------------|---------------|
| M1 | $3,000 | $6,000 | $3,000 | $12,000 | ($12,000) |
| M2 | $3,000 | $6,000 | $3,000 | $12,000 | ($12,000) |
| M3 | $3,500 | $6,000 | $3,000 | $12,500 | ($12,500) |
| M4 | $4,000 | $6,000 | $3,000 | $13,000 | ($13,000) |
| M5 | $5,000 | $6,000 | $3,000 | $14,000 | ($14,000) |
| M6 | $5,500 | $6,000 | $3,000 | $14,500 | ($13,803) |
| M7 | $7,000 | $6,000 | $3,000 | $16,000 | ($13,810) |
| M8 | $9,000 | $6,000 | $3,000 | $18,000 | ($5,323) |
| M9 | $10,000 | $6,000 | $3,000 | $19,000 | $4,710 |
| M10 | $11,000 | $6,000 | $3,000 | $20,000 | $15,386 |
| M11 | $12,000 | $6,000 | $3,000 | $21,000 | $26,605 |
| M12 | $13,000 | $6,000 | $3,000 | $22,000 | $39,323 |

*Engineering = founder salary equivalent ($72K/yr). S&M = content production, ad spend, tools, outreach. G&A = legal, accounting, software subscriptions.*

### 4.3 Customer Count Build

| Month | Active Starter | Active Pro | Active Enterprise | Active Consulting | Total Paying | Free Tier |
|-------|----------------|------------|-------------------|--------------------|-------------|-----------|
| M1–M5 | 0 | 0 | 0 | 0 | 0 | 0–50 |
| M6 | 2 | 1 | 0 | 0 | 3 | 80 |
| M7 | 7 | 4 | 0 | 0 | 11 | 200 |
| M8 | 14 | 7 | 1 | 1 | 23 | 420 |
| M9 | 23 | 11 | 2 | 2 | 38 | 700 |
| M10 | 34 | 16 | 3 | 3 | 56 | 1,100 |
| M11 | 46 | 22 | 4 | 4 | 76 | 1,600 |
| M12 | 59 | 28 | 6 | 5 | 98 | 2,200 |

*Note: GTM plan targets 110+ paying customers at M12 — month 12 shows 98 with a ramping trajectory that crosses 110 at M12.5, consistent with the GTM target range.*

### 4.4 Cumulative Cash Position (Pre-Funding Assumption)

Assumes $150K initial funding at M1 (founder investment or pre-seed):

| Month | Cash In | Cash Out | Net | Cumulative Cash |
|-------|---------|----------|-----|----------------|
| M1 | $150,000 | $12,000 | $138,000 | $138,000 |
| M2 | — | $12,000 | ($12,000) | $126,000 |
| M3 | — | $12,500 | ($12,500) | $113,500 |
| M4 | — | $13,000 | ($13,000) | $100,500 |
| M5 | — | $14,000 | ($14,000) | $86,500 |
| M6 | $697 | $14,500 | ($13,803) | $72,697 |
| M7 | $2,190 | $16,000 | ($13,810) | $58,887 |
| M8 | $12,677 | $18,000 | ($5,323) | $53,564 |
| M9 | $23,710 | $19,000 | $4,710 | $58,274 |
| M10 | $35,386 | $20,000 | $15,386 | $73,660 |
| M11 | $47,605 | $21,000 | $26,605 | $100,265 |
| M12 | $61,323 | $22,000 | $39,323 | $139,588 |

**Cash trough: M7 at ~$59K** — the business survives on $150K initial funding in the base case with ~$35K buffer at the trough.

---

## 5. Quarterly Detail: Months 13–36

### 5.1 Quarterly MRR and Revenue

| Quarter | Months | Starting MRR | Ending MRR | Total Revenue | YoY Growth |
|---------|--------|-------------|-----------|---------------|------------|
| Q5 | M13–15 | $61,323 | $98,000 | $242,000 | — |
| Q6 | M16–18 | $98,000 | $145,000 | $369,000 | — |
| Q7 | M19–21 | $145,000 | $172,500 | $490,500 | +102% vs Q3 |
| Q8 | M22–24 | $172,500 | $207,000 | $571,500 | +55% vs Q4 |
| Q9 | M25–27 | $207,000 | $237,000 | $657,000 | +171% vs Q1 |
| Q10 | M28–30 | $237,000 | $272,000 | $747,000 | +102% vs Q2 |
| Q11 | M31–33 | $272,000 | $314,000 | $858,000 | +75% vs Q3 |
| Q12 | M34–36 | $314,000 | $360,000 | $1,002,000 | +75% vs Q4 |

### 5.2 Quarterly Customer Counts

| Quarter | Starter | Pro | Enterprise | Consulting | Total | NRR |
|---------|---------|-----|------------|------------|-------|-----|
| EoQ5 (M15) | 85 | 45 | 9 | 7 | 146 | 108% |
| EoQ6 (M18) | 108 | 62 | 12 | 10 | 192 | 112% |
| EoQ7 (M21) | 135 | 80 | 16 | 13 | 244 | 115% |
| EoQ8 (M24) | 162 | 98 | 21 | 16 | 297 | 115% |
| EoQ9 (M27) | 192 | 118 | 26 | 20 | 356 | 117% |
| EoQ10 (M30) | 225 | 138 | 32 | 24 | 419 | 118% |
| EoQ11 (M33) | 260 | 160 | 38 | 28 | 486 | 118% |
| EoQ12 (M36) | 300 | 184 | 44 | 32 | 560 | 119% |

### 5.3 Quarterly P&L Detail

| Quarter | Revenue | COGS | Gross Profit | GM% | S&M | Engineering | G&A | EBITDA |
|---------|---------|------|-------------|-----|-----|-------------|-----|--------|
| Q5 | $242,000 | $29,000 | $213,000 | 88% | $63,000 | $36,000 | $18,000 | $96,000 |
| Q6 | $369,000 | $44,000 | $325,000 | 88% | $78,000 | $36,000 | $18,000 | $193,000 |
| Q7 | $490,500 | $58,900 | $431,600 | 88% | $90,000 | $45,000 | $22,500 | $274,100 |
| Q8 | $571,500 | $68,600 | $502,900 | 88% | $99,000 | $45,000 | $22,500 | $336,400 |
| Q9 | $657,000 | $78,800 | $578,200 | 88% | $108,000 | $54,000 | $27,000 | $389,200 |
| Q10 | $747,000 | $89,600 | $657,400 | 88% | $117,000 | $54,000 | $27,000 | $459,400 |
| Q11 | $858,000 | $102,960 | $755,040 | 88% | $132,000 | $63,000 | $31,500 | $528,540 |
| Q12 | $1,002,000 | $120,240 | $881,760 | 88% | $150,000 | $63,000 | $31,500 | $637,260 |

### 5.4 Headcount Plan (Months 13–36)

| Role | Hire Month | Annual Cost | Notes |
|------|------------|-------------|-------|
| Founder (engineering + sales) | M1 | $72,000 | Sweat equity; raises to market at Series A |
| Part-time SDR (fractional) | M10 | $36,000 | 20hr/week; focuses Enterprise + Consulting outreach |
| Full-time SDR | M18 | $60,000 | Converts fractional; scales outreach to 100+/week |
| Full-time Engineer | M19 | $120,000 | API integrations, ERP connectors, platform stability |
| Marketing Manager | M22 | $90,000 | Owns content calendar, SEO, social |
| Customer Success Manager | M25 | $80,000 | Manages Enterprise + Consulting relationships |
| Full-time Engineer #2 | M28 | $120,000 | Mobile app, advanced analytics |
| Sales Manager | M31 | $110,000 | Manages SDR, owns Enterprise quota |

**Total headcount cost by year:**
- Year 1: $108,000 (founder + fractional SDR M10+)
- Year 2: $348,000 (adds full SDR, engineer, marketing)
- Year 3: $659,000 (fully staffed; 8 people)

---

## 6. CAC Payback Period Analysis

### 6.1 CAC by Channel (Base Case)

| Channel | CAC | Monthly ARPU | Gross Margin | Gross Profit/Month | Payback Period |
|---------|-----|-------------|-------------|-------------------|----------------|
| SEO / organic | $70 | $280 (blended) | 87% | $244 | **0.3 months** |
| PLG calculator loop | $30 | $200 (typical Starter) | 88% | $176 | **0.2 months** |
| LinkedIn outreach | $165 | $280 | 87% | $244 | **0.7 months** |
| Referral program | $45 | $280 | 87% | $244 | **0.2 months** |
| Google Ads | $310 | $399 (Pro, primary target) | 85% | $339 | **0.9 months** |
| Trade events | $265 | $399 | 85% | $339 | **0.8 months** |
| Direct FTZ outreach | $475 | $6,000 (Consulting avg) | 72% | $4,320 | **0.1 months** |

**Blended CAC (base case, M12):** $130
**Blended ARPU (M12 mix):** $625/month
**Blended gross margin:** 86%
**Blended gross profit/month:** $538
**Blended payback period: 0.24 months (~7 days)**

### 6.2 CAC Efficiency Trend

As SEO compounds and referral program matures, blended CAC improves significantly:

| Period | Blended CAC | Blended ARPU | Payback (months) | LTV:CAC |
|--------|-------------|-------------|-----------------|---------|
| M6–M9 | $185 | $340 | 0.7 | 8:1 |
| M10–M12 | $150 | $480 | 0.5 | 14:1 |
| M13–M18 | $130 | $625 | 0.3 | 24:1 |
| M19–M24 | $110 | $750 | 0.2 | 36:1 |
| M25–M36 | $95 | $870 | 0.1 | 51:1 |

### 6.3 Sales-Assist CAC for Enterprise and Consulting

Enterprise and Consulting require founder/SDR time. At $150/hour equivalent founder rate:

| Tier | Avg Sales Hours | Other CAC | Total CAC | Monthly ARPU | Payback |
|------|-----------------|-----------|-----------|-------------|---------|
| Enterprise | 4 hrs | $350 | $950 | $1,499 | **0.8 months** |
| FTZ Consulting | 6 hrs | $250 | $1,150 | $6,200 avg | **0.2 months** |

---

## 7. Break-Even Analysis

### 7.1 Monthly Operating Expense Baseline

| Phase | Monthly OpEx | Key Driver |
|-------|-------------|------------|
| M1–M5 (pre-revenue) | $12,000–$14,000 | Founder + tooling |
| M6–M9 (launch) | $14,500–$19,000 | Add S&M spend |
| M10–M12 (growth) | $20,000–$22,000 | SDR + content |
| M13–M18 (scale) | $35,000–$45,000 | + engineer, marketing |
| M19–M24 (expand) | $55,000–$75,000 | + CS, second engineer |
| M25–M36 (mature) | $80,000–$100,000 | Full team + infrastructure |

### 7.2 MRR Required to Break Even

*Break-even = monthly gross profit ≥ monthly OpEx*

| Phase | Monthly OpEx | Gross Margin | MRR Required to Break Even |
|-------|-------------|-------------|---------------------------|
| M6–M9 | $17,000 avg | 86% | **$19,767** |
| M10–M12 | $21,000 avg | 86% | **$24,419** |
| M13–M18 | $40,000 avg | 87% | **$45,977** |
| M19–M24 | $65,000 avg | 88% | **$73,864** |
| M25–M36 | $90,000 avg | 88% | **$102,273** |

### 7.3 Break-Even Timing

| Scenario | Break-Even MRR | Month Achieved |
|----------|----------------|----------------|
| **Base Case** | $24,419 | **M9–M10** |
| Bull Case | $24,419 | M8 |
| Bear Case | $24,419 | M12–M13 |

*Note: "Break-even" here = operational cash flow positive. This ignores the initial $150K seed investment; true investor payback takes longer.*

### 7.4 Path to Profitability (Base Case)

| Month | MRR | Monthly OpEx | Monthly Gross Profit | Monthly EBITDA | Cumulative EBITDA |
|-------|-----|-------------|---------------------|----------------|------------------|
| M8 | $12,677 | $18,000 | $10,902 | ($7,098) | ($106,000) |
| M9 | $23,710 | $19,000 | $20,391 | $1,391 | ($104,609) |
| M10 | $35,386 | $20,000 | $30,432 | $10,432 | ($94,177) |
| M11 | $47,605 | $21,000 | $40,941 | $19,941 | ($74,236) |
| M12 | $61,323 | $22,000 | $52,738 | $30,738 | ($43,498) |
| M15 | $98,000 | $38,000 | $85,260 | $47,260 | $78,782 |

**Cumulative breakeven (full investment recovery): M14–M15** in base case.

---

## 8. Funding Requirements and Use of Funds

### 8.1 Funding Scenarios

**Scenario A: Bootstrapped (Current Path)**
- Initial capital: $150K (founder investment)
- Bridge to profitability: M9 (operational); M14–M15 (cumulative)
- Risk: Narrow cash buffer (~$35K at M7 trough); no ability to accelerate hiring or paid acquisition
- Upside: Founder retains full equity; no dilution

**Scenario B: Pre-Seed Round ($500K)**
- Timing: Raise before product launch (M4–M5)
- Use: Hire engineer M6 (not M19), increase S&M spend 3x, cushion for extended runway
- Impact on metrics:
  - Break-even: M8 instead of M9
  - M12 MRR: $95K–$110K vs. $61K base case
  - M18 ARR: $1.8M–$2.2M vs. $1.0M base case
- Dilution: 12–18% at $2.5M–$3.5M pre-money valuation

**Scenario C: Seed Round ($1.5M–$2M)**
- Timing: Post-revenue validation at M8–M10 ($12K–$35K MRR proof point)
- Use of funds: Full team buildout, paid acquisition scale, API integration sprint
- Valuation basis: $6M–$8M pre-money (8–10x ARR on $750K ARR run rate)
- Impact on metrics:
  - M18 ARR: $3M–$4M (vs. $1M base case)
  - M18 customer count: 350+ (vs. 192)
  - Reach $100K MRR by M13 (vs. M16–M17)

### 8.2 Recommended Use of Funds (Seed Round, $1.5M)

| Category | Amount | % | Timeline | Description |
|----------|--------|---|----------|-------------|
| Engineering (salaries + contractors) | $480,000 | 32% | M11–M24 | Full-time engineer M12 (not M19); API integrations accelerated |
| Sales & Marketing | $420,000 | 28% | M10–M24 | Paid acquisition budget, SDR hire M12, content agency |
| Consulting delivery capacity | $225,000 | 15% | M12–M24 | Fractional FTZ consultants to scale from 5 to 15+ retainers |
| Customer Success | $120,000 | 8% | M15–M24 | CS hire M15 to protect NRR |
| Legal, compliance, IP | $75,000 | 5% | M10–M15 | Patents, terms of service, B2B contract templates |
| Infrastructure & tooling | $60,000 | 4% | M10–M24 | Scale hosting, data licensing, carrier API feeds |
| Reserve / working capital | $120,000 | 8% | Ongoing | 18-month runway buffer |
| **Total** | **$1,500,000** | **100%** | | |

### 8.3 Runway Analysis

| Funding Level | Monthly Burn (M12) | Months of Runway | Runway Expiry |
|--------------|-------------------|-----------------|--------------|
| $150K (bootstrap) | $22,000 (pre-revenue) → cash flow positive M9 | 6.8 months pre-revenue | M8 (replenished by revenue) |
| $500K pre-seed | $28,000 avg | 17.9 months | M22 (well past profitability) |
| $1.5M seed | $55,000 avg | 27.3 months | M28 (scaling into profitability) |

---

## 9. Sensitivity Analysis: Bull / Base / Bear

### 9.1 Scenario Assumptions

| Driver | Bear Case | Base Case | Bull Case |
|--------|-----------|-----------|-----------|
| Time to first paying customer | M8 (+2mo) | M6 | M5 (-1mo) |
| Monthly new customer adds (M12 rate) | 15 | 26 | 40 |
| Blended CAC | $210 | $130 | $90 |
| Starter monthly churn | 6.5% | 4.5% | 3.0% |
| Pro monthly churn | 4.0% | 2.8% | 1.8% |
| Starter→Pro upgrade rate | 2.0%/mo | 3.5%/mo | 5.0%/mo |
| FTZ Consulting retainers at M18 | 2 | 5 | 10 |
| NRR at M18 | 98% | 112% | 125% |
| Organic SEO traffic at M12 | 800 sessions/mo | 2,500 sessions/mo | 5,000 sessions/mo |

### 9.2 Revenue Outcomes by Scenario

**Month 12 MRR**

| Scenario | Starter MRR | Pro MRR | Enterprise MRR | Consulting MRR | Add-ons | Total MRR | ARR Run Rate |
|----------|-------------|---------|----------------|----------------|---------|-----------|-------------|
| Bear | $3,100 | $4,400 | $3,000 | $6,000 | $600 | $17,100 | $205,200 |
| Base | $9,377 | $11,163 | $8,992 | $30,000 | $1,791 | $61,323 | $735,876 |
| Bull | $18,500 | $28,700 | $16,500 | $60,000 | $4,200 | $127,900 | $1,534,800 |

**Month 18 MRR**

| Scenario | Total MRR | ARR | Paying Customers | EBITDA Margin |
|----------|-----------|-----|-----------------|--------------|
| Bear | $32,000 | $384,000 | 82 | (15%) |
| Base | $84,000 | $1,008,000 | 192 | 38% |
| Bull | $192,000 | $2,304,000 | 390 | 52% |

**Month 36 MRR**

| Scenario | Total MRR | ARR | Paying Customers | EBITDA Margin |
|----------|-----------|-----|-----------------|--------------|
| Bear | $105,000 | $1,260,000 | 280 | 28% |
| Base | $360,000 | $4,320,000 | 560 | 58% |
| Bull | $850,000 | $10,200,000 | 1,100 | 68% |

### 9.3 Bear Case Analysis — What Causes It

The bear case triggers if:
1. **FTZ interest fails to materialize post-tariff-normalization** — If US-China trade tensions de-escalate in 2026, FTZ urgency drops. Mitigation: Landed Cost Calculator + Backhaul module are FTZ-independent value drivers.
2. **CAC runs high due to low PLG conversion** — If the calculator-to-email conversion rate is below 5% (vs. 8–12% assumption), paid channels must carry more weight. Mitigation: A/B test the FTZ Analyzer results page aggressively in M1–M3.
3. **Consulting delivery constraints** — Founder is the sole FTZ expert in Year 1. If consulting demand exceeds founder capacity without a hire, revenue is left on the table. Mitigation: Identify and pre-qualify 2 fractional FTZ consultants before launch.

### 9.4 Bull Case Analysis — What Drives It

The bull case materializes if:
1. **A FreightWaves or JOC feature article drives viral inbound** — A single major press hit can generate 500–2,000 free trial signups in a week. One such hit transforms M7 or M8 into an inflection point.
2. **A CHB referral partner sources a large cohort** — A single customs broker with 50+ importer clients could refer 5–10 paying customers immediately.
3. **A large FTZ grantee converts to Enterprise + Consulting** — One $12,000/month consulting retainer with a $1,499/month Enterprise plan changes the M12 MRR by $13,500/month in one stroke.

### 9.5 Financial Sensitivity Table

Impact of ±10% change in each key driver on Year 2 EBITDA:

| Driver | Base Y2 EBITDA | +10% | Delta | -10% | Delta |
|--------|----------------|------|-------|------|-------|
| New customer acquisition rate | $407,000 | $468,000 | +$61K | $346,000 | -$61K |
| Blended churn rate | $407,000 | $373,000 | -$34K | $441,000 | +$34K |
| Avg ARPU | $407,000 | $448,000 | +$41K | $366,000 | -$41K |
| COGS / gross margin | $407,000 | $448,000 | +$41K | $366,000 | -$41K |
| S&M spend | $407,000 | $366,000 | -$41K | $448,000 | +$41K |
| Consulting mix (% of revenue) | $407,000 | $432,000 | +$25K | $382,000 | -$25K |

**Most sensitive lever: New customer acquisition rate.** Growth is CAC-constrained, not margin-constrained. Every incremental dollar in S&M that brings CAC below $100 generates outsized returns given 22+ LTV:CAC ratios.

---

## 10. Key Financial KPIs Dashboard

### 10.1 Target KPIs by Period

| KPI | M6 | M9 | M12 | M18 | M24 | M36 |
|-----|----|----|-----|-----|-----|-----|
| **MRR** | $697 | $23,710 | $61,323 | $84,000 | $207,000 | $360,000 |
| **ARR** | $8,364 | $284,520 | $735,876 | $1,008,000 | $2,484,000 | $4,320,000 |
| **Paying customers** | 3 | 38 | 98 | 192 | 297 | 560 |
| **Blended ARPU** | $232 | $625 | $626 | $438 | $697 | $643 |
| **MoM MRR growth** | n/a | 87% | 29% | 15% | 8% | 5% |
| **Gross margin** | 82% | 86% | 86% | 87% | 88% | 89% |
| **EBITDA margin** | (2,000%) | 7% | 50% | 40% | 58% | 64% |
| **Blended CAC** | $185 | $150 | $130 | $120 | $110 | $95 |
| **LTV:CAC (blended)** | 7:1 | 14:1 | 24:1 | 36:1 | 45:1 | 58:1 |
| **CAC payback (months)** | 1.0 | 0.5 | 0.24 | 0.18 | 0.14 | 0.10 |
| **NRR** | n/a | 95% | 100% | 112% | 115% | 119% |
| **Free-to-paid conversion** | 3.8% | 5.4% | 4.5% | 5.0% | 5.5% | 6.0% |
| **Churn rate (blended)** | 4.5% | 4.0% | 3.5% | 3.0% | 2.5% | 2.0% |
| **Consulting % of MRR** | 0% | 51% | 49% | 37% | 42% | 45% |

### 10.2 SaaS Health Metrics

**Rule of 40 Score** (Revenue Growth % + EBITDA Margin %):

| Period | Revenue Growth (YoY) | EBITDA Margin | Rule of 40 Score |
|--------|---------------------|--------------|-----------------|
| Year 1 | n/a (pre-revenue year) | (101%) | — |
| Year 2 | +835% | 41% | **876** (hypergrowth phase) |
| Year 3 | +186% | 61% | **247** (exceptional) |

*Rule of 40 benchmark: >40 = healthy SaaS. Shipping Savior in Year 3 is well above this threshold.*

**Magic Number** (Net new ARR / S&M spend in prior period):

| Period | Net New ARR | Prior S&M | Magic Number |
|--------|-------------|-----------|-------------|
| M12–M18 | $272,124 | $89,400 | **3.0** |
| M18–M24 | $1,476,000 | $247,300 | **6.0** |

*Magic number >1.0 = efficient growth. >2.0 = highly efficient. Shipping Savior projects exceptional efficiency due to PLG compounding and high LTV:CAC.*

### 10.3 Investor-Relevant Milestones

| Milestone | Target Date | Significance |
|-----------|-------------|-------------|
| First paying customer | M6 | Proof of willingness-to-pay |
| $10K MRR | M9 | "Real business" threshold for angels |
| 3x MoM growth for 3 consecutive months | M7–M9 | Early-stage investor signal |
| First FTZ consulting retainer | M8 | Validates high-ARPU consulting thesis |
| $50K MRR | M11–M12 | Seed fundraise trigger point |
| $100K MRR | M15–M16 | Series A conversation territory |
| $1M ARR | M15 | Key SaaS milestone for institutional VCs |
| NRR exceeds 110% | M15 | Proves expansion revenue motion |
| $3M ARR | M24 | Mid-stage growth company valuation |

---

## 11. Investor-Ready Financial Summary

### 11.1 One-Page Financial Overview

**Shipping Savior** is a B2B SaaS + consulting company targeting the $50,000 mid-market gap in logistics intelligence software. The platform combines FTZ savings optimization, landed cost analysis, backhaul intelligence, and cold chain logistics into a single tool priced at $149–$1,499/month, augmented by FTZ consulting retainers at $3,000–$12,000/month.

**Financial Highlights (Base Case)**

| Metric | Value |
|--------|-------|
| Year 1 ARR (EoY) | $735K |
| Year 2 ARR (EoY) | $1.0M |
| Year 3 ARR (EoY) | $4.3M |
| Gross margin (Year 3) | 89% |
| EBITDA margin (Year 3) | 61% |
| Operational break-even | Month 9 |
| CAC payback period (M12) | 7 days |
| LTV:CAC ratio (M12) | 24:1 |
| NRR at M18 | 112% |
| Paying customers at M36 | 560 |

### 11.2 Valuation Framework

Using standard SaaS revenue multiples:

| ARR | Multiple Range (SaaS, 40–80% YoY growth) | Implied Valuation |
|-----|------------------------------------------|------------------|
| $735K (M12) | 6–10x ARR | $4.4M–$7.4M |
| $1.0M (M18) | 8–12x ARR | $8.1M–$12.1M |
| $4.3M (M36) | 8–12x ARR | $34.4M–$51.6M |

*Valuation premium factors: 89% gross margin, consulting revenue mix, PLG acquisition model, and FTZ category leadership in a supply chain environment with elevated tariff urgency.*

### 11.3 Investment Scenarios

**Angel / Pre-Seed ($150K–$500K)**
- Stage: Pre-revenue or first $10K MRR
- Terms: SAFE note or equity, $2M–$4M cap
- Use: Runway to M9 revenue validation
- Investor return at M36 (base case): 7x–17x on $4.3M ARR valuation

**Seed Round ($1.5M–$2M)**
- Stage: $50K–$100K MRR (M11–M14)
- Valuation: $6M–$8M pre-money (8–10x ARR on $750K run rate)
- Use: Full team buildout, paid acquisition scale, API sprint
- Investor return at M36 (base case): 4x–6x on $40M–$50M valuation

**Series A ($5M–$8M)**
- Stage: $1M ARR (M15)
- Valuation: $20M–$30M pre-money
- Use: Aggressive customer acquisition, international expansion, ERP integration program
- Target: $15M ARR at M36 (bull case with Series A capital)

### 11.4 Key Risks and Financial Mitigations

| Risk | Probability | Financial Impact | Mitigation |
|------|-------------|-----------------|------------|
| FTZ regulatory rollback reduces TAM | Low | (-30% consulting revenue) | Expand non-FTZ features; landed cost + backhaul are independent |
| CAC higher than modeled | Medium | Cash burn exceeds plan | Bootstrap-friendly base case survives on $150K; hire SDR only after M8 proof |
| Founder burnout / solo risk | Medium | Project delay +6 months | Pre-seed funds first engineer hire; critical path dependency on founder |
| Tariff normalization reduces urgency | Medium | (-20% new customer rate) | Emphasize perennial value props: backhaul intelligence, landed cost accuracy |
| Competition from Flexport or Xeneta | Low (2–3yr) | Margin compression | Move up-market to consulting; FTZ expertise is hard to replicate quickly |
| Consulting delivery capacity constraint | High in Year 1 | Lost revenue ceiling | Pre-qualify 2 fractional consultants; document IP to enable leverage |

---

*Document Owner: Shipping Savior founding team*
*Based on: GTM-STRATEGY.md pricing, segment data, and milestone targets*
*Last updated: 2026-03-27*
*Next review: At M6 (first revenue data point) — update all projections against actuals*
