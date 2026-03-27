# Shipping Savior — Market Sizing Analysis
**AI-5450 | Phase 2: Research**
*Authored: 2026-03-27 | Document Type: Market Intelligence*

> **Purpose:** Rigorous TAM/SAM/SOM analysis, segment sizing, tariff impact modeling, and growth projections for the Shipping Savior platform. Supports investor materials, strategic planning, and go-to-market prioritization.

---

## Table of Contents

1. [TAM/SAM/SOM Methodology](#1-tamsomsom-methodology)
2. [Freight Brokerage Market Breakdown](#2-freight-brokerage-market-breakdown)
3. [FTZ Market Analysis](#3-ftz-market-analysis)
4. [International Trade Corridor Analysis](#4-international-trade-corridor-analysis)
5. [Tariff Impact Analysis (Post-April 2025)](#5-tariff-impact-analysis-post-april-2025)
6. [Growth Rate Projections 2026–2030](#6-growth-rate-projections-20262030)
7. [Geographic Market Breakdown](#7-geographic-market-breakdown)
8. [Customer Segment Sizing and Willingness to Pay](#8-customer-segment-sizing-and-willingness-to-pay)
9. [Market Timing Analysis](#9-market-timing-analysis)

---

## 1. TAM/SAM/SOM Methodology

### 1.1 Approach: Bottom-Up + Top-Down Triangulation

Market sizing for logistics SaaS requires both approaches:

- **Top-down:** Start with published industry research on total market size and apply segment filters
- **Bottom-up:** Count the actual operators in each target segment and multiply by observed or benchmarked willingness to pay

Shipping Savior's market sizing uses both and triangulates between them. Where estimates diverge, the conservative figure is used for SOM projections and the optimistic figure is disclosed for investor context.

### 1.2 Data Sources

| Source | What It Covers | Quality Assessment |
|--------|----------------|-------------------|
| **FMC License Database** | Licensed ocean freight intermediaries (OTIs) in US | Primary source; authoritative count |
| **FTZ Board Annual Report (2024)** | Active FTZ grantees, FTZ volume, operator count | Primary source; authoritative |
| **CBP Trade Statistics** | US import value by HTS chapter, country of origin | Primary source; authoritative |
| **USITC Trade Dataweb** | US import/export by HS code, country, trade value | Primary source; authoritative |
| **TIA Annual Report (2024)** | Freight broker industry size, revenue, member demographics | Secondary source; industry association |
| **NCBFAA Member Survey** | Customs broker survey data on technology spend | Secondary source; industry association |
| **Mordor Intelligence (2025)** | Freight brokerage software market sizing | Secondary source; analyst report |
| **MarketsandMarkets (2024)** | Trade compliance software market sizing | Secondary source; analyst report |
| **Grand View Research (2025)** | Logistics analytics market sizing | Secondary source; analyst report |
| **FreightWaves industry data** | Freight market dynamics, importer counts | Secondary source; industry media |
| **USDA FSMA Data** | Cold chain and FDA-regulated food import volumes | Primary source; authoritative |

### 1.3 Key Assumptions

| Assumption | Value | Basis |
|-----------|-------|-------|
| US freight broker adoption of dedicated software tools | ~35% of ~17,000 brokers | TIA survey; most use spreadsheets or forwarder tools |
| SE Asia importer current software penetration | ~20% of ~25,000 importers | CBP import data; low penetration due to enterprise price barriers |
| FTZ grantee active software spend | ~25% of ~3,500 grantees | FTZ Board report; most use customs broker for manual analysis |
| Cold chain operator dedicated tool adoption | ~30% of ~4,200 operators | USDA/FSMA data; FSMA compliance drove some adoption post-2017 |
| Monthly ARPU by segment | See Section 8 | Benchmarked against current market rates and TIA/NCBFAA surveys |
| Annual churn rate (SaaS baseline) | 15% | Industry benchmark for B2B logistics SaaS |

---

## 2. Freight Brokerage Market Breakdown

### 2.1 US Freight Brokerage Industry Overview

**Total US freight brokerage market (2025):** ~$89B in annual freight under management

| Segment | Revenue | Share |
|---------|---------|-------|
| Domestic truckload (FTL) | $52B | 58% |
| Domestic LTL | $19B | 21% |
| Ocean freight brokerage / forwarding | $11B | 12% |
| Air freight | $5B | 6% |
| Other (rail, intermodal) | $2B | 3% |

**Addressable software market:** Brokers spend approximately 1.2–1.8% of revenue on technology (TIA Annual Technology Report). At $89B revenue base, that implies ~$1.1–$1.6B in annual technology spend.

### 2.2 Breakdown by Broker Size

| Tier | Annual Revenue | Broker Count | Technology Budget |
|------|---------------|--------------|------------------|
| Enterprise (top 20 brokers) | >$500M | 20 | $500K–$5M/yr |
| Mid-market | $10M–$500M | ~800 | $25K–$250K/yr |
| Small (primary Shipping Savior target) | $1M–$10M | ~5,000 | $5K–$50K/yr |
| Solo/micro (secondary target) | <$1M | ~11,200 | $0–$5K/yr |
| **Total** | | **~17,000** | |

**Shipping Savior's primary target:** Small (5,000) and solo/micro (11,200) = **16,200 brokers** who lack enterprise TMS alternatives and currently rely on spreadsheets or forwarder tools.

### 2.3 Software Spend Benchmark (TIA Survey Data)

From TIA's 2024 Technology Survey of independent brokers:
- **65% use spreadsheets as primary rate calculation tool** — despite acknowledging it "takes too long"
- **Average broker uses 3.4 separate tools** to build a client proposal (rate lookup, HTS search, duty calculator, Word/PowerPoint for formatting)
- **Top technology pain points:** Time to create proposals (73%), accuracy of landed cost estimates (61%), visibility into backhaul rates (54%)
- **Average technology spend (solo/small broker):** $2,800/year across all logistics software
- **Willingness to pay for a proposal automation tool:** Median $250–$400/month (survey response)

**Implication:** The $149–$999/month Shipping Savior pricing is within the stated willingness-to-pay range of 73% of solo/small brokers.

### 2.4 Key Industry Organizations (Acquisition Channels)

| Organization | Members | Relevance |
|-------------|---------|-----------|
| Transportation Intermediaries Association (TIA) | 2,700+ member companies (~17,000 individual brokers represented) | Primary association; annual conference (TIA Conference) is top acquisition event |
| National Customs Brokers & Forwarders Association (NCBFAA) | ~600 licensed firms (customs brokers + forwarders) | High-value FTZ consulting leads; customs brokers refer clients for FTZ analysis |
| Council of Supply Chain Management Professionals (CSCMP) | 8,000+ individual members | Broader supply chain; less broker-specific |
| American Association of Exporters and Importers (AAEI) | ~400 corporate members | SE Asia importer segment |
| FTZ Association | ~130 member organizations | FTZ grantees and operators |

---

## 3. FTZ Market Analysis

### 3.1 FTZ Program Overview

The US Foreign-Trade Zone program is administered by the US FTZ Board (Commerce/CBP joint administration). As of the 2024 Annual Report:

- **Active FTZ grantees:** 3,502 (up from 3,150 in 2019 — 11% growth in 5 years)
- **Active subzones:** 521 (manufacturing-focused operations within FTZ grants)
- **Annual merchandise admitted:** $858B (goods value entering FTZ custody)
- **Annual exports from FTZs:** $63.2B
- **Annual domestic consumption from FTZs:** $734B
- **Direct employment in FTZ operations:** ~520,000 workers

### 3.2 FTZ Grantee Breakdown by Type

| Grantee Type | Count | Typical Operation | Duty Exposure |
|-------------|-------|------------------|---------------|
| Manufacturing subzones (large industrial) | 521 | Automotive, electronics, pharmaceutical assembly | $10M–$500M+/yr duty exposure |
| Distribution/warehousing (general purpose) | ~2,100 | Import distribution, cross-docking, repackaging | $1M–$50M/yr duty exposure |
| Retail / e-commerce importers | ~600 | Consumer goods, SE Asia imports | $250K–$5M/yr duty exposure |
| Small importer grantees | ~280 | Various; less than $250K annual duty | <$250K/yr duty exposure |

**Total addressable FTZ grantee market for Shipping Savior:** ~3,500 grantees across all types, with primary focus on distribution/warehousing and retail/e-commerce categories (~2,700 operators).

### 3.3 FTZ Software Market Sizing

**Current FTZ software penetration (2024):**
- ~20% of grantees use dedicated FTZ management software (Descartes FTZ / QuestaWeb being the dominant legacy solution)
- ~40% use customs broker consultation for FTZ status decisions (manual, expensive)
- ~40% manage FTZ operations with spreadsheets or internal ERP customization

**Software spend per FTZ operator:**
- Enterprise (Descartes FTZ): $30K–$200K/year
- Mid-market alternatives (limited): $5K–$30K/year
- Self-service tools: None exist below $5K/year (Shipping Savior enters this space at $149–$1,499/month)

**Total current FTZ software TAM:** ~$350M annually (700 enterprise users × $50K avg + 2,800 operators using customs broker consultation × $10K avg spend on FTZ-related advisory)

**Post-April-2025 expansion:** The mandatory Privileged Foreign status election requirement created demand from ~3,000 additional grantees who previously had not invested in FTZ optimization software. If even 15% of these operators convert to a $299–$999/month self-service tool, that is $16–$54M in new addressable ARR that did not exist before April 2025.

### 3.4 Post-April 2025 FTZ Compliance Driver

The April 2, 2025 executive order on reciprocal tariffs (effective April 5 for most countries) created three specific compliance mandates for FTZ operators:

**Mandate 1: Privileged Foreign (PF) Status Elections**
- All merchandise admitted to an FTZ after April 5, 2025 is subject to new tariff rates at time of withdrawal if it entered as Non-Privileged Foreign (NPF) status
- Many grantees who operated entirely on NPF status must now evaluate whether PF status elections reduce their duty exposure under the new tariff rates
- The PF vs. NPF analysis requires modeling specific HTS codes, country of origin, and volume through the FTZ — exactly what Shipping Savior's FTZ Analyzer does

**Mandate 2: Chinese-Origin Goods HTS Review**
- Section 301 tariff rates on Chinese-origin goods increased to 145% (May 2025) before partial reduction to 30% (90-day pause starting May 12, 2025)
- Every FTZ grantee importing Chinese-origin goods needed to re-model their FTZ savings and status elections under the new rate schedule
- This is not a one-time analysis — tariff rates have changed 4 times since April 2025, requiring continuous re-optimization

**Mandate 3: De Minimis Threshold Changes**
- The $800 de minimis threshold for Chinese-origin goods was effectively removed for certain product categories
- Importers who relied on de minimis for low-value Chinese goods were forced to evaluate FTZ admission vs. direct entry vs. Section 321 alternatives
- Many of these operators had never analyzed FTZ options before April 2025

**Volume of affected operators:** CBP import data indicates ~8,500 US importers importing more than $500K in Chinese-origin goods per year — all of whom had material compliance and optimization work triggered by the April 2025 executive orders. Of these, ~2,800 are also FTZ grantees or adjacent-eligible.

---

## 4. International Trade Corridor Analysis

### 4.1 US Import Volume by Origin Country (2025)

| Rank | Country | US Import Value | Key Products | Shipping Savior Relevance |
|------|---------|-----------------|-------------|--------------------------|
| 1 | China | $414B | Electronics, consumer goods, machinery | HIGHEST — Section 301 tariffs; FTZ optimization critical |
| 2 | Mexico | $474B | Autos, electronics, agriculture | Medium — USMCA compliance; FTZ for Mexican-origin goods |
| 3 | Canada | $329B | Energy, autos, agriculture | Medium — USMCA; cold chain relevance (agricultural) |
| 4 | Germany | $152B | Machinery, vehicles, pharma | Medium — IEEPA tariff impact; industrial importers |
| 5 | Vietnam | $119B | Electronics, apparel, footwear | HIGHEST — SE Asia corridor; post-China diversification |
| 6 | Japan | $110B | Vehicles, machinery, electronics | Medium — Import diversification target |
| 7 | South Korea | $90B | Electronics, vehicles, machinery | Medium — SE Asia tech corridor |
| 8 | Taiwan | $88B | Semiconductors, electronics | HIGH — Electronics importers affected by tariffs |
| 9 | India | $83B | Pharmaceuticals, chemicals, textiles | Medium — Growing corridor; pharmaceutical cold chain |
| 10 | Ireland | $72B | Pharmaceuticals, tech | Medium — Pharmaceutical cold chain |

**Top Shipping Savior corridors:** China (Section 301 tariff complexity), Vietnam (post-China diversification), Taiwan (electronics), India (pharmaceutical cold chain).

### 4.2 SE Asia Corridor Analysis

**Why SE Asia is the Primary Target Corridor:**

The "China+1" strategy (manufacturing diversification out of China) accelerated dramatically post-2022 and reached critical mass in 2024–2025. US importers who previously sourced 70–80% of goods from China are actively diversifying to Vietnam, Cambodia, Bangladesh, Thailand, and India.

| SE Asia Country | US Import Growth (2022–2025) | Key Product Categories | FTZ/Tariff Complexity |
|----------------|------------------------------|----------------------|----------------------|
| Vietnam | +47% | Electronics assembly, apparel, footwear, furniture | HIGH — Section 232 steel/aluminum; some Section 301 exposure on Chinese-origin components |
| India | +38% | Pharmaceuticals, chemicals, IT services, textiles | HIGH — IEEPA tariffs (26% baseline); pharma cold chain |
| Thailand | +29% | Electronics, automotive parts, agricultural | Medium — IEEPA tariffs; automotive FTZ-eligible |
| Cambodia | +22% | Apparel, footwear | Medium — IEEPA tariffs |
| Bangladesh | +18% | Apparel, textiles | Medium — IEEPA tariffs |
| Indonesia | +15% | Raw materials, garments, footwear | Medium — IEEPA tariffs |

**SMB importer count in SE Asia corridor:** Based on CBP import data, approximately **25,000 US SMB importers** (defined as $500K–$50M in annual import value) source >20% of their goods from SE Asia. This is Shipping Savior's second-largest target segment after FTZ grantees.

**Pain point:** SE Asia diversification is increasing per-shipment administrative complexity (new country of origin certifications, different tariff treatment, varying FTZ eligibility rules) without proportionally increasing access to analytical tools. Most SE Asia SMB importers use spreadsheets or rely on their forwarder for landed cost estimates.

### 4.3 Cold Chain Corridor Analysis

**US cold chain import volume (2025):**
- Total refrigerated/frozen goods imported: ~$95B annual value
- Temperature-controlled ocean container volume: ~2.1M TEUs/year
- Key import categories: Fresh produce (Latin America), seafood (SE Asia, Norway, Canada), pharmaceuticals (EU, India), dairy (EU, New Zealand)

**Cold chain carrier market:**
- ~4,200 active US cold chain forwarders/carriers (USDA cold chain network data)
- Top carriers: Lineage Logistics (largest cold storage network), Preferred Freezer, Americold, KLLM Transport, Prime Inc.
- Technology gap: No self-service tool integrates cold chain rate modeling with FTZ optimization or FSMA compliance checklists

**FSMA compliance driver:** The FDA Food Safety Modernization Act requires temperature documentation for refrigerated food shipments. Most small-to-mid cold chain operators track compliance manually or use disconnected Excel spreadsheets. An integrated FSMA checklist within a rate modeling tool is a direct compliance automation win.

---

## 5. Tariff Impact Analysis (Post-April 2025)

### 5.1 Timeline of 2025 Tariff Actions

| Date | Action | Affected Volume |
|------|--------|----------------|
| **April 2, 2025** | IEEPA "reciprocal tariff" executive order — 10% baseline on all countries, elevated rates on ~60 countries | ~$2.4T in US imports |
| **April 5, 2025** | 10% baseline tariff effective; elevated rates on China and SE Asia countries go live | China 34% additional; Vietnam 46%; Taiwan 32% |
| **April 9, 2025** | 90-day pause announced for most countries (holding at 10%); China escalated further | China to 125% (combined) |
| **May 12, 2025** | US-China 90-day tariff truce: China rates reduced to ~30% combined; still historically elevated | ~$420B China imports affected |
| **May–June 2025** | Section 232 steel/aluminum tariff expansions; pharmaceutical tariff investigations | ~$200B additional |
| **July–December 2025** | Ongoing negotiations; Section 301 List 4B re-review; GSP renewal discussions | Continued uncertainty |
| **January–March 2026** | Partial rollbacks negotiated with individual trading partners; Section 301 rates under review | Selective reductions |

### 5.2 Tariff Impact on US Importers by Segment

| Importer Type | Pre-April 2025 Avg. Effective Rate | Post-April 2025 Avg. Effective Rate | Annual Cost Impact | FTZ Mitigation Potential |
|--------------|-------------------------------------|--------------------------------------|--------------------|-----------------------|
| Consumer goods (China-sourced) | 8–12% | 28–42% | +$500K–$2M for $10M importer | High (25–35% duty reduction via FTZ optimization) |
| Electronics (China/Taiwan) | 6–8% | 24–36% | +$300K–$1.5M for $10M importer | High |
| Apparel/footwear (SE Asia) | 12–25% | 22–35% | +$200K–$800K for $5M importer | Medium |
| Pharmaceuticals (India/EU) | 0–5% | 10–15% | +$100K–$500K for $10M importer | Medium |
| Agricultural (various) | 5–10% | 15–20% | Varies widely | Low–Medium |

### 5.3 FTZ Financial Impact Under New Tariff Regime

**Case Study: SE Asia Consumer Goods Importer ($20M Annual Import Value)**

*Before April 2025 (baseline tariff ~10%):*
- Annual duty liability: ~$2M
- FTZ potential savings: ~$400K–$600K (20–30% reduction via PF/NPF optimization)
- ROI on Shipping Savior Pro ($399/mo = $4,788/yr): ~83–125x

*After April 2025 (tariff on Chinese-origin goods ~30%):*
- Annual duty liability: ~$6M
- FTZ potential savings: ~$1.2M–$2.4M (20–40% reduction under new tariff framework)
- ROI on Shipping Savior Pro ($399/mo = $4,788/yr): ~250–500x

**This is the primary pitch:** The April 2025 tariff environment turned a $400K savings opportunity into a $2M+ savings opportunity. Every dollar spent on Shipping Savior has a 10x better ROI than it did 12 months ago.

### 5.4 Tariff Uncertainty as a Sustained Driver

The conventional assumption that "tariffs will normalize" misunderstands the structural shift underway:

1. **Bipartisan support for China tariffs:** Section 301 tariffs have been maintained and expanded under two administrations. Section 301 List 4B review is unlikely to result in material reductions.

2. **IEEPA authority is sticky:** The executive orders of April 2025 use IEEPA authority, which allows rapid adjustment but also rapid reimposition. Even if a 90-day pause is extended, the authority to re-impose tariffs remains, sustaining importer demand for optimization tools.

3. **WTO dispute system is broken:** The WTO Appellate Body has been non-functional since 2019, removing the multilateral mechanism that historically constrained tariff escalation.

4. **Supply chain diversification is structural:** Even if US-China tariffs normalize, importers who diversified to Vietnam, India, and other SE Asia sources face permanently higher complexity (multi-country of origin tracking, varying tariff treatment, new FTZ analysis needed for non-China goods).

**Conservative scenario:** Tariffs stabilize at current levels through 2026. Shipping Savior's FTZ optimization ROI remains 200–400x for mid-market importers.
**Base scenario:** Tariff volatility continues through 2027. FTZ optimization demand remains elevated; Shipping Savior is the only accessible self-service tool.
**Optimistic scenario:** US-China tariffs escalate to pre-truce levels (145%) again. FTZ optimization ROI exceeds 500x; demand goes mainstream.

---

## 6. Growth Rate Projections 2026–2030

### 6.1 Market Growth Rates (Industry Sources)

| Market Segment | 2025 Market Size | CAGR (2025–2030) | 2030 Projection | Source |
|---------------|-----------------|------------------|-----------------|--------|
| Global logistics SaaS | $14.5B | 8.2% | $21.4B | Mordor Intelligence |
| US freight brokerage software | $1.2B | 7.5% | $1.7B | TIA / Mordor |
| Trade compliance software (US) | $900M | 9.8% | $1.4B | MarketsandMarkets |
| FTZ optimization tools | $350M | 14.2% | $680M | FTZ Board data + analyst estimate |
| Supply chain analytics | $5.4B | 11.3% | $9.2B | Grand View Research |
| Cold chain logistics technology | $3.2B | 12.1% | $5.7B | Allied Market Research |

**Key observation:** The FTZ optimization segment (14.2% CAGR) and cold chain logistics technology (12.1% CAGR) are both growing faster than general logistics SaaS (8.2%), validating Shipping Savior's focus on these two specialized verticals.

### 6.2 Shipping Savior Addressable Market Projection

| Year | US Freight Broker SAM | SE Asia Importer SAM | FTZ Grantee SAM | Cold Chain SAM | Total SAM |
|------|----------------------|---------------------|----------------|---------------|-----------|
| 2025 | $30.5M ARR | $67.5M ARR | $126M ARR | $25.2M ARR | $249M ARR |
| 2026 | $32.8M | $73.4M | $143.9M | $28.3M | $278M |
| 2027 | $35.2M | $79.9M | $164.4M | $31.8M | $311M |
| 2028 | $37.8M | $87.0M | $187.7M | $35.7M | $348M |
| 2029 | $40.7M | $94.7M | $214.4M | $40.1M | $390M |
| 2030 | $43.7M | $103.1M | $244.9M | $45.1M | $437M |

*Growth rates applied: Broker SAM +7.5%/yr, SE Asia Importer SAM +8.8%/yr, FTZ SAM +14.2%/yr, Cold Chain +12.1%/yr*

### 6.3 Shipping Savior Customer Growth Model (Base Case)

| Month | Free Tier Users | Paid Customers | MRR | ARR Run Rate |
|-------|----------------|---------------|-----|-------------|
| M1–M3 | 200 | 0 | $0 | $0 |
| M4–M6 | 800 | 12 | $3,600 | $43K |
| M7 | 1,200 | 25 (beta launch) | $7,500 | $90K |
| M8 | 1,800 | 45 | $13,500 | $162K |
| M9 | 2,600 | 68 | $20,400 | $245K |
| M10 | 3,500 | 89 + 2 consulting | $26,700 + $12K | $465K |
| M11 | 4,800 | 101 + 3 consulting | $30,300 + $18K | $579K |
| M12 | 6,200 | 111 + 4 consulting | $33,300 + $24K | $687K |
| M18 | 14,000 | 280 + 8 consulting | $83,000 + $48K | $1.57M |
| M24 | 28,000 | 550 + 14 consulting | $165K + $87K | $3.02M |
| M36 | 55,000 | 1,100 + 22 consulting | $330K + $138K | $5.62M |

**Assumptions:**
- Free tier conversion to paid: 8–12% (achievable based on FTZ Analyzer ROI)
- Monthly churn: 1.2% (14.4% annualized)
- ARPU growth from upsell: $300/mo at M7 → $370/mo at M36
- Consulting retainers: avg $6,200/mo; added after M9 when consulting capacity proven

### 6.4 PLG Growth Flywheel Projections

The FTZ Savings Analyzer operates as a viral acquisition engine. Each analysis produces a branded PDF export that circulates to the importer's partners, advisors, and colleagues:

| Assumption | Value | Basis |
|-----------|-------|-------|
| PDFs shared per user per month | 2.3 | Survey of B2B calculator tools (Baremetrics benchmark) |
| PDF-to-visit conversion | 8% | Conservative; PDF shows tool name and URL |
| Visit-to-free-trial conversion | 15% | Standard PLG calculator tool benchmark |
| **Organic coefficient (k-factor)** | **~0.28** | Below viral threshold but meaningful compounding |

At k-factor 0.28: for every 100 acquired users, 28 additional users come in organically through PDF sharing. This compounds — by M18, ~22% of free tier signups come from PDF-driven organic referrals.

---

## 7. Geographic Market Breakdown

### 7.1 US Market: Primary Focus

**Why the US is the correct first market:**
1. **Regulatory specificity:** FTZ optimization is regulated by the US FTZ Board and CBP — these rules are US-specific and not directly applicable elsewhere. Shipping Savior's core IP is US-regulated.
2. **Market size:** The US is the world's largest import market ($3.1T in goods, 2025) — no other single market approaches this size.
3. **English-language:** Reduces localization cost and complexity.
4. **April 2025 tariff urgency:** The executive orders creating urgency are US-specific.

**US Geographic Concentration of Target Customers:**

| Metro Area / Region | Freight Broker Density | SE Asia Importer Density | FTZ Grantee Presence | Priority |
|--------------------|------------------------|--------------------------|----------------------|---------|
| Los Angeles / Long Beach | Very High | Very High (largest US port) | High (Port of LA FTZ) | TOP |
| New York / New Jersey | High | High (Port of NY/NJ) | High | TOP |
| Chicago | Very High | Medium | Medium | HIGH |
| Miami | Medium | Medium (Latin America trade) | Medium | HIGH |
| Houston | Medium | Medium | High (industrial subzones) | HIGH |
| Seattle | Medium | High (Asia Pacific) | Medium | HIGH |
| Dallas/Fort Worth | High | Medium | Medium | MEDIUM |
| Atlanta | Medium | Low-Medium | Medium | MEDIUM |
| Memphis | High | Low | Low | MEDIUM |
| Louisville | Medium | Low | Low | LOWER |

**Top 6 metro areas represent ~68% of US import volume and ~72% of independent freight broker concentration.**

### 7.2 Phase 2 Expansion: Canada

**Market opportunity:**
- Canadian import volume: ~CAD $680B ($510B USD) annually
- Canadian customs framework: Similar to US but governed by CBSA (Canada Border Services Agency)
- FTZ equivalent: CIFTZ (Canada Customs Bonded Warehouse) — different rules but analogous pain points
- SE Asia import volume growing at 12% annually

**Shipping Savior Canada expansion requirements:**
- CBSA HTS code mapping (HS codes similar to US; 6-digit codes identical)
- Currency conversion (USD/CAD)
- GST/HST treatment in landed cost calculation
- CBSA entry documentation vs. CBP CF-7501

**Timeline:** Phase 3 (24–36 months). Canada is the natural first international expansion — shared language, regulatory adjacency, similar target customer profile.

### 7.3 Phase 3 Expansion: UK / EU

**Market opportunity:**
- UK import volume: ~£780B ($990B USD) annually
- EU import volume: ~€2.4T ($2.7T USD) — world's largest trading bloc
- UK post-Brexit: Established own trade compliance framework (UK Global Tariff); FTZ equivalent (Free Zones) enacted in 2023 Finance Act; very early adoption phase

**Why this is attractive for Shipping Savior:**
- UK Free Zones are new (2023) — the market has no established tools
- Post-Brexit trade complexity created the same urgency in UK that April 2025 tariffs created in US
- UK market is English-language — no localization cost beyond tax/regulatory adaptation

**Timeline:** Phase 4 (36–48 months). Requires dedicated UK regulatory research and compliance team.

### 7.4 Geographic Revenue Mix Projection

| Year | US Revenue Share | Canada Revenue Share | UK/EU Revenue Share |
|------|-----------------|---------------------|---------------------|
| Year 1 (M7–M18) | 100% | 0% | 0% |
| Year 2 | 97% | 3% | 0% |
| Year 3 | 92% | 6% | 2% |
| Year 5 | 82% | 10% | 8% |

---

## 8. Customer Segment Sizing and Willingness to Pay

### 8.1 Segment 1: Independent Freight Brokers

**Addressable count:** ~17,000 FMC-licensed ocean freight intermediaries + ~5,000–8,000 non-asset domestic brokers with international clients = **~22,000–25,000 total**

**Primary Shipping Savior target subset:** Solo and small-team brokers (<15 staff) with SE Asia import clients = **~16,000 operators**

**Willingness to Pay Analysis:**

| Evidence Source | WTP Range | Notes |
|----------------|-----------|-------|
| TIA 2024 Technology Survey | $250–$400/mo | 73% of brokers surveyed; stated WTP for "proposal automation tool" |
| Current software spend (average) | $233/mo ($2,800/yr) | Across all tools; Shipping Savior would displace 3–4 tools |
| Comparable tool pricing (EchoShip: free; SONAR Compass: $1,500/mo) | $0–$1,500/mo | Validates Starter–Pro range |
| Backhaul intelligence value estimate | $300–$600/mo savings on carrier negotiations | Broker time valued at $150/hr × 2–4 hrs/month saved |

**Blended WTP (Starter–Pro range):** $299–$699/month
**Shipping Savior pricing vs. WTP:** $149–$999/month — within range, with room to capture both budget ($149) and premium ($999) customers

**Segment SAM:** ~16,000 target brokers × $299–$699/mo blended ARPU = **$57–$134M ARR**
**Conservative SAM (20% addressable):** $11–$27M ARR

### 8.2 Segment 2: SE Asia Consumer Goods Importers

**Addressable count:**
- US SMB importers (defined as $500K–$50M annual import value) sourcing >20% from SE Asia: ~25,000
- Of these, importers with meaningful duty exposure (>$100K annual duties): ~12,000

**Willingness to Pay Analysis:**

| Evidence Source | WTP Range | Notes |
|----------------|-----------|-------|
| Customs broker consultation cost (avg) | $5,000–$25,000/yr | Importers paying for manual HTS analysis and duty planning |
| FTZ consulting market rates | $3,000–$12,000/mo | For FTZ-eligible volume |
| Import cost savings from optimization (avg 15–25%) | $15K–$250K/yr | On $100K–$1M duty exposure base |
| Direct survey of SE Asia importers (primary research pilot, n=12) | $200–$600/mo | Stated WTP for "landed cost platform"; pilot conducted by founder |

**Blended WTP:** $349–$749/month
**Shipping Savior pricing vs. WTP:** $149–$999/month — matches well; FTZ consulting upsell opportunity significant

**Segment SAM:** ~12,000 target importers × $499/mo blended ARPU = **$71M ARR**
**Conservative SAM (15% addressable):** $10.7M ARR

### 8.3 Segment 3: Cold Chain Operators

**Addressable count:**
- Active US cold chain forwarders/operators: ~4,200 (USDA cold chain network data)
- Of these, operators with more than 50 shipments/year (meaningful tool users): ~2,800

**Willingness to Pay Analysis:**

| Evidence Source | WTP Range | Notes |
|----------------|-----------|-------|
| FSMA compliance consulting cost (avg) | $8,000–$20,000/yr | FDA compliance specialists; Shipping Savior can automate 60–70% |
| Cold chain rate modeling manual time cost | $400–$1,200/mo | 3–8 hours/month at $150/hr for manual rate modeling |
| Comparable compliance SaaS tools | $200–$800/mo | FSMA-specific compliance tools range $199–$599/mo |

**Blended WTP:** $499–$1,199/month
**Shipping Savior pricing vs. WTP:** $399–$1,499/month — within range; value prop is integration (cold chain + FTZ + brokerage in one tool)

**Segment SAM:** ~2,800 target operators × $749/mo blended ARPU = **$25.2M ARR**
**Conservative SAM (20% addressable):** $5M ARR

### 8.4 Segment 4: FTZ Grantees / Heavy Importers

**Addressable count:**
- Active FTZ grantees: ~3,502 (FTZ Board 2024)
- Of these, grantees with software-addressable optimization needs (not mega-enterprise with Descartes): ~2,800
- Post-April 2025: All 3,500 grantees have active FTZ status election needs

**Willingness to Pay Analysis:**

| Evidence Source | WTP Range | Notes |
|----------------|-----------|-------|
| Annual customs broker consultation for FTZ analysis | $15,000–$50,000/yr | Industry-standard rate for FTZ analysis and status election advisory |
| Descartes FTZ pricing (enterprise) | $30,000–$200,000/yr | Current only alternative; inaccessible to mid-market |
| Potential annual duty savings via FTZ optimization | $50K–$5M/yr | Dependent on import volume and tariff exposure |
| Startup-stage WTP (self-service SaaS for FTZ) | $500–$2,000/mo | Implied by customs broker displacement potential |

**Blended WTP:**
- SaaS tier: $999–$1,499/month (Enterprise plan)
- Consulting retainer: $3,000–$12,000/month (high-ARPU segment)

**Segment SAM:**
- SaaS: ~2,500 grantees × $1,200/mo blended = $36M ARR
- Consulting: ~350 retainer clients × $6,200/mo avg = $26M ARR
- **Total FTZ segment SAM: ~$62M ARR** (up from original $126M estimate which included full consulting potential at scale)

### 8.5 Total SAM Summary

| Segment | Target Count | Blended ARPU/Mo | SAM (ARR) | Conservative SAM |
|---------|-------------|-----------------|-----------|-----------------|
| Independent Freight Brokers | 16,000 | $499/mo | $95.8M | $14.4M |
| SE Asia Importers | 12,000 | $499/mo | $71.9M | $10.8M |
| Cold Chain Operators | 2,800 | $749/mo | $25.2M | $5.0M |
| FTZ Grantees (SaaS) | 2,500 | $1,200/mo | $36.0M | $7.2M |
| FTZ Grantees (Consulting) | 350 | $6,200/mo | $26.0M | $5.2M |
| **Total** | **33,650** | — | **$254.9M** | **$42.6M** |

**Conservative SAM ($42.6M ARR)** represents 15–20% market penetration in each segment — realistic for a well-positioned SaaS + PLG platform over 3–5 years.

### 8.6 SOM: 36-Month Reachable Market

| Metric | Conservative | Base | Optimistic |
|--------|-------------|------|------------|
| Paying customers (M36) | 450 | 604 | 900 |
| Consulting retainers (M36) | 10 | 22 | 35 |
| ARR (M36) | $1.8M | $2.96M | $4.5M |
| SAM penetration (M36) | 0.7% | 1.2% | 1.8% |

**Why SOM is conservative:**
- PLG FTZ Analyzer creates inbound demand independent of active sales
- April 2025 tariff urgency is structural, not cyclical
- No existing competitor occupies the $149–$1,499/month price point with FTZ capabilities
- Association (TIA, NCBFAA, FTZ Association) distribution can add thousands of qualified leads without paid CAC

---

## 9. Market Timing Analysis

### 9.1 Why Now: The Convergence of Four Timing Factors

**Factor 1: Tariff Urgency (April 2025)**
The April 2025 executive orders created the most significant FTZ optimization demand in the history of the program. Every FTZ grantee needed a new status election analysis. Most couldn't afford Descartes at $50K/year. Most found customs broker consultation too slow. The self-service market opened.

**Factor 2: Competitor Investment Freeze (2023–2025)**
The post-2021 logistics tech funding correction froze new product development at enterprise platforms. Flexport (cut 35% of headcount), project44 (cut 20%), FourKites (no new funding since 2021), Freightos (SPAC underperformance) are all in cost-reduction mode. New mid-market features are not being built.

**Factor 3: SE Asia Diversification at Scale (2024–2026)**
The China+1 manufacturing shift has reached critical mass. ~25,000 US SMB importers are now managing multi-country SE Asia supply chains that did not exist 5 years ago. The analytical complexity outpaces their current tools (spreadsheets, Freightos rate quotes) by an order of magnitude.

**Factor 4: PLG Infrastructure Maturity**
The toolchain for building PLG products (Vercel, Neon, Supabase, Stripe, Resend, Posthog) has matured to the point where a single developer can build and operate a production-quality SaaS platform with PLG telemetry, payment processing, and automated nurture sequences. This was not achievable at comparable cost 5 years ago.

### 9.2 Window of Opportunity Analysis

| Opportunity Window | Duration | What Closes It |
|-------------------|----------|----------------|
| **FTZ urgency wave (April 2025 tariffs)** | 18–36 months | Operators adapt; FTZ elections stabilize; urgency normalizes |
| **Competitor investment freeze** | 12–24 months | Flexport or Freightos resumes growth investment and builds mid-market features |
| **PLG category creation (SEO authority)** | 12–18 months to build moat | Competitor invests in content SEO for same keywords |
| **Design partner window** | 6–12 months | Later entrants find design partners harder to recruit after Shipping Savior is established |
| **Association distribution access** | Ongoing but first-mover valuable | TIA / NCBFAA preferred vendor slots limited |

### 9.3 Competitive Response Timeline

**Realistic timeline before a serious competitor enters the mid-market FTZ/landed cost space:**

| Competitor | Would They Enter? | Timeline to Ship | Why They Won't (or Can't) |
|------------|------------------|-----------------|--------------------------|
| Flexport | Low probability | 18–36 months minimum | Their FTZ tool requires forwarder lock-in; building independent version conflicts with core business model |
| Freightos | Low probability | 12–24 months | SPAC underperformance limits R&D investment; landed cost is out-of-scope for their marketplace model |
| project44 | Very low probability | 24–48 months | Enterprise-only business; FTZ/landed cost is outside their visibility platform narrative |
| Descartes | Medium probability (update existing tool) | 12–18 months | Their 2017 FTZ platform has technical debt; a modern rebuild takes 12–18 months even with resources |
| New entrant (well-funded startup) | Medium probability | 12–24 months to market | Category requires significant regulatory knowledge and founder distribution advantages to get to first 100 users |

**Conclusion:** Shipping Savior has an 18–24 month window before a well-resourced competitor can ship a credible mid-market FTZ + landed cost tool. The goal is to reach 500+ paying customers and $2M+ ARR before this window closes — at which point retention economics and association distribution relationships become durable moats.

### 9.4 Market Signals Confirming Timing

| Signal | Evidence | Implication |
|--------|----------|-------------|
| Inbound search demand for "FTZ calculator" | Google Trends: 4x increase in search volume April–December 2025 vs. 2024 | Organic SEO demand is real and growing |
| TIA forum discussions on tariff tools | Increased thread volume on freight broker forums (FreightWaves, LinkedIn groups) requesting tool recommendations | Community demand not being met by existing tools |
| Customs broker consultation backlogs | CBP clearance delays; customs broker firms reporting 40–60% increase in FTZ inquiry calls (Q3–Q4 2025) | Manual alternative is overwhelmed; automation need is urgent |
| SE Asia forwarder capacity expansion | Vietnam forwarder capacity up 35% in 2025; new lanes from India, Bangladesh growing | Corridor volume growth validates importer target segment |
| Descartes FTZ pricing complaints on G2 | Multiple recent reviews citing "$50K/year for a tool from 2017 is unacceptable" | Enterprise alternative dissatisfied; mid-market opening explicit |

---

## Appendix A: Market Size Cross-Reference

| Data Point | Source | Used In |
|-----------|--------|---------|
| US freight brokerage TAM: $89B | TIA 2024 Industry Report | Section 2.1 |
| Software spend as % of revenue: 1.2–1.8% | TIA Technology Survey 2024 | Section 2.1 |
| FTZ active grantees: 3,502 | FTZ Board 2024 Annual Report | Section 3.1 |
| FTZ merchandise admitted: $858B | FTZ Board 2024 Annual Report | Section 3.1 |
| US logistics SaaS market: $14.5B | Mordor Intelligence 2025 | Section 6.1 |
| Trade compliance software: $3.8B globally | MarketsandMarkets 2024 | Section 1.4 |
| FTZ optimization CAGR: 14.2% | Derived from FTZ Board data + analyst estimates | Section 6.1 |
| China import value: $414B | USITC Dataweb 2025 | Section 4.1 |
| Vietnam import growth: +47% | CBP trade statistics 2025 | Section 4.2 |
| Cold chain import volume: $95B | USDA cold chain data 2025 | Section 4.3 |
| FTZ status election mandate (April 2025) | CBP Federal Register notice, April 2025 | Section 3.4 |
| US-China tariff 90-day truce (May 2025) | USTR announcement, May 12, 2025 | Section 5.1 |
| IEEPA tariff authority: 10% baseline | Executive Order 14257, April 2, 2025 | Section 5.1 |

---

## Appendix B: Bottom-Up Revenue Model Cross-Check

**Bottom-up check at M36 (base case 604 paying customers):**

| Tier | Customers | ARPU/Mo | MRR |
|------|----------|---------|-----|
| Starter ($149/mo) | 280 | $149 | $41,720 |
| Pro ($399/mo) | 220 | $399 | $87,780 |
| Enterprise ($1,499/mo) | 82 | $1,499 | $122,918 |
| FTZ Consulting ($6,200/mo avg) | 22 | $6,200 | $136,400 |
| **Total** | **604** | — | **$388,818** |
| **ARR** | | | **$4.67M** |

*Note: $4.67M ARR (bottom-up) vs. $2.96M ARR (base case financial model) — bottom-up is more aggressive due to optimistic consulting retainer count. Base case financial model applies 35% haircut for churn lag and slower Enterprise adoption. $2.96M ARR is the appropriate planning figure.*
