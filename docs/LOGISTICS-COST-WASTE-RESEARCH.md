# Logistics Cost & Waste Research — Product Positioning and Pricing

**Linear:** AI-7282
**Source request:** Julian / Blake Harwell call, 2026-04-07 ([transcript](MEETING-TRANSCRIPT-2026-04-07-BLAKE.md), [analysis](BLAKE-CALL-ANALYSIS-2026-04-07.md))
**Prepared:** 2026-10-21
**Status:** Research only. These are inputs for the pricing decision. Nothing has been approved.

---

## 1. The question we were asked

From the 2026-04-07 call (Julian, 00:23:50):

> "We should do research on the waste that happens in this industry: who the top players are, and how much they're potentially losing by not having something more optimized. Is it a real issue, or is it a small niche few? If it's the niche, this has to be a premium, high-tier insider product instead of an everyday product."

Blake framed the same thing as **"the sunk cost of having incomplete information and making business decisions."**

That breaks into four sub-questions:

1. How large is the waste and cost leakage in containerized and cold-chain logistics?
2. Is it spread across the market, or concentrated in a few buyers?
3. What does that mean for positioning and tiered pricing (free / premium / "Cadillac")?
4. Is Alibaba a realistic partner, and where does Kingsco fit?

## 2. Short answer

- **The waste is large and real.** The categories Shipping Savior can see or influence add up to tens of billions of dollars a year worldwide. Detention and demurrage, billing errors, schedule unreliability, empty repositioning and cold-chain spoilage are each in the $10B+ range.
- **The pain is concentrated.** Every shipper leaks money, but the companies that can measure the leak and will pay to stop it are mid-size and large importers/exporters, NVOCCs and forwarders, and reefer shippers such as Kingsco and Chiquita. That is a few thousand serious buyers, not millions. Julian's instinct was right: this is not a Spotify-style volume play.
- **Recommendation: value-based B2B pricing with a free tool as lead generation.** Keep the free tier as a calculator/funnel, without ads. Anchor Enterprise pricing to documented savings (target the customer keeping roughly 10x the fee). Add a reefer/cold-chain tier aimed at Kingsco-type operators, where a single avoided claim pays for the year.
- **Alibaba already books freight** (Cainiao container booking since 2021, plus Alibaba.com Freight on Freightos). Pitch Alibaba on visibility, D&D avoidance and decision support for its sellers and product managers. Don't pitch it on booking.

## 3. Where the money leaks: sized categories

Confidence key: **High** = regulator or primary-research source. **Medium** = widely cited industry study I couldn't check against the primary document. **Low** = vendor or marketing benchmark, useful only as a range.

| # | Leak | Size | Confidence | Shipping Savior lever |
|---|---|---|---|---|
| 1 | **Detention & demurrage (D&D)** | FMC: ~**$13.8B** collected from US shippers by 9 carriers, Apr 2020 to Sep 2023. Container xChange: average D&D per container **$585 (2020), $868 (2021), $664 (2022)**, down ~25% in 2023. | High (FMC); Medium (per-box averages) | Free-time countdowns, arrival/ETA alerts, cheapest pickup/return planning, dispute evidence |
| 2 | **Schedule unreliability** | Sea-Intelligence: global on-time reliability **61-66% through 2025** (62.8% in Dec 2025). Late vessels average **~4.8-5.0 days** late. About 1 in 3 sailings arrives late. | High | Predictive ETA, rolling inventory and labor plans, fewer expedite and air-freight rescues |
| 3 | **Freight billing errors** | Audit-industry benchmarks: **5-10% of invoices** contain errors, worth **~1-5% of freight spend** (some vendors say up to 7-9%). Shippers must dispute within **180 days** under US law. | Low (vendor data) | Rate-vs-invoice reconciliation, accessorial and D&D charge validation, dispute deadlines |
| 4 | **Empty container repositioning** | BCG (2015): **$15-20B per year**, or **5-8% of a typical carrier's operating cost**. Roughly 60M empty moves a year. | Medium (dated) | Street-turn and match-back suggestions for NVOCC and drayage customers |
| 5 | **Cold-chain food loss** | FAO/UNEP: lack of refrigeration caused loss of **~12% of global food production (526M tonnes, 2017)**. IIR puts it at 13%. Developing countries refrigerate ~20% of perishables, developed countries ~60%. | High | Reefer-specific monitoring, routing and transshipment risk scoring (Kingsco / Chiquita use case) |
| 6 | **Reefer cargo claims** | Swedish Club: average reefer claim **~$38K after deductible**. **69%** of reefer incidents happen during the voyage, 22% at the discharge port, 5% at loading. | Medium | Voyage-leg risk visibility, carrier/vessel scoring, claim evidence packs |
| 7 | **Pharma cold-chain excursions** | IQVIA (widely cited): **~$35B per year** lost to temperature-controlled logistics failures. Most of it comes from human error or lack of visibility, not equipment. | Medium (no primary doc verified) | Future vertical. Blake listed pharma as a target market. |
| 8 | **Disruption shocks** | McKinsey (2020): shocks of a month or longer hit **about every 3.7 years** and cost **~42% of one year's EBITDA per decade**. Often misquoted as "45% of profits". Better-prepared companies lose ~23 points less. | Medium | Scenario planning, alternate-port and carrier comparisons |

**Macro context:** CSCMP/Kearney State of Logistics put US business logistics costs at **$2.58T (~8.7-8.8% of GDP) in 2024**. That is above the pre-pandemic range of 7.4-7.8%. Logistics is a large and growing line item, so a 1% improvement matters to a CFO.

### What we could not verify

- A published **destination rejection rate for produce reefer containers**. No credible public number exists. Kingsco's own load data (rejected or downgraded loads, local-market liquidation percentage) would be stronger than any public figure. **Ask Blake for it.**
- The "$15B global D&D per year (Drewry 2025)" figure that circulates in forwarder blogs. I couldn't find it in a Drewry publication, so don't use it in investor materials.

## 4. Turning this into a per-customer value case

The numbers below are an illustration, not customer data. Every assumption is shown so Blake can replace it with real Kingsco or customer figures.

### Profile A: Mid-size dry-cargo importer, 1,000 FEU a year

| Assumption | Value |
|---|---|
| Ocean freight spend | $3,000 per FEU → **$3.0M a year** |
| Cargo value | $50,000 per FEU |
| Containers that incur D&D | 20% at $664 average → **$133K a year** |
| Late arrivals | ~37% of containers, about 5 days late each |
| Inventory carrying cost | 25% a year (common rule of thumb, not sourced above) |

| Leak | Annual exposure | Plausible capture | Value |
|---|---|---|---|
| D&D | $133K | 40-60% | $53-80K |
| Billing errors (1-3% of spend) | $30-90K | 50-70% recovered | $15-63K |
| Delay carrying cost (370 boxes × 5 days × $50K × 25%/365) | ~$63K | 20-30% (better planning, fewer expedites) | $13-19K |
| **Total** | **~$226-286K** | | **~$81-162K a year** |

**Pricing implication:** Current Enterprise is $1,499 a month ($17,988 a year), about 11-22% of modeled value. That is already defensible. A value-based Enterprise at **$2,500-4,000 a month** still leaves the customer roughly 3-5x ROI. The FTZ consulting tiers ($36-144K a year) fit the top of this curve.

### Profile B: Reefer exporter or 3PL (Kingsco / Chiquita pattern)

- One avoided reefer claim is about **$38K**. Avoiding 2-3 claims a year is **$76-114K**, before counting spoilage, downgrades and local-market liquidation losses. Blake described Chiquita deducting those losses off the top of each load.
- High volume: Kingsco ships 95% of Chiquita's European exports and grew by 150 loads last year. 6M lbs of apples moved through the Netherlands in 8 weeks.
- **Implication:** a **Cold Chain tier** priced against claim avoidance ($2,000-5,000 a month), sold first to Kingsco as the design partner and reference customer.

## 5. Is it widespread or a niche?

Both, and the difference matters for positioning.

- **The leak is everywhere.** Every container that moves is exposed to the problems in section 3: D&D, delays and invoice errors.
- **The willingness to pay is concentrated.** Small and occasional shippers rarely measure the leak. They pay it as a cost of doing business. Buyers who measure it and act on it:
  1. Importers and exporters moving roughly **250+ containers a year**
  2. **NVOCCs and freight forwarders**, who pass D&D and visibility through to their own customers (this fits the AI-12022 NVOCC white-label portal)
  3. **Reefer and cold-chain shippers**, where one failure costs tens of thousands
  4. **Platform operators** (Alibaba-type marketplaces) that need their sellers' goods to arrive

**Positioning statement (draft):**
> Shipping Savior shows importers, exporters and forwarders the money they lose between booking and delivery to detention, delays, billing errors and spoilage, and it pays for itself in the first quarter.

That fits Julian's "premium insider product" and Blake's "foundational decision tool," and it rules out an ad-supported consumer play.

## 6. Pricing recommendations

| Tier | Current model | Recommendation | Why |
|---|---|---|---|
| Free | $0 (Blake suggested ads) | Keep at $0 with **no ads**. Free calculators (landed cost, D&D exposure, FTZ savings) as lead generation. | Ad revenue in a niche B2B audience is tiny and makes the product look cheaper. The free tier's job is to surface a dollar figure that leads to a sales conversation. |
| Starter / Pro | $149 / $399 a month | Keep. Add a **seat bundle** (Pro includes 5 seats, Enterprise packs of 8 or 20, per Blake). | Matches the self-serve buyer. Seat packs were what Blake asked for. |
| Enterprise ("Cadillac") | $1,499 a month | Move toward **$2,500-4,000 a month**, or a **savings-share option** (e.g. 10-15% of documented D&D and billing recoveries, with a floor). | The value model supports it. A savings share takes away procurement objections. |
| Cold Chain (new) | — | **$2,000-5,000 a month**, with Kingsco as design partner at a reduced rate in exchange for data and a case study. | Claim avoidance alone justifies the price. Creates the flagship reference customer. |
| Consulting | $3-12K a month | Keep. | Already value-anchored. |

**Proof assets to build before raising prices:**

1. A **D&D exposure calculator** on the marketing site, using the per-container averages above.
2. A **Kingsco baseline**: 90 days of real loads, delays, D&D and claims, measured before and after.
3. A one-page **ROI sheet** per profile (A and B above) for trade-conference booth demos.

## 7. Alibaba angle

- **Alibaba already sells freight booking.** Cainiao launched a container-booking service in January 2021 covering more than 200 ports in 50 countries, with rates 30-40% below market and compensation for missed departures. Alibaba.com Freight, powered by Freightos, lets B2B buyers compare, book and track LCL/FCL and air freight.
- **So don't pitch booking.** Pitch what Blake described: a tool for Alibaba's internal product managers and its sellers' logistics teams that shows goods moving through the chain and flags D&D, delay and spoilage risk before it costs money.
- **Route:** Julian's mentor (a friend of Jack Ma) is a warm intro. Get the Kingsco case study done first so the pitch is backed by real numbers.

## 8. Next actions

| # | Action | Owner |
|---|---|---|
| 1 | Get Kingsco load data: rejection/downgrade %, D&D paid, reefer claims, delay days (12 months) | Blake |
| 2 | Re-run the section 4 value model with real Kingsco numbers | Agent |
| 3 | Decide whether to drop ads from the free tier and adopt seat bundles | Julian + Blake |
| 4 | Build the D&D exposure calculator (free tier lead magnet) | Agent (new Linear issue) |
| 5 | Decide Enterprise repricing / savings-share option | Julian + Blake |
| 6 | Draft Alibaba one-pager once the Kingsco case study exists | Julian |

## Sources

- FMC — D&D collections by carriers: https://fmc.gov/?p=759
- Container xChange D&D benchmark: https://container-news.com/container-xchanges-annual-report-demurrage-and-detention-charges-benchmark-report-2023/ ; https://www.hellenicshippingnews.com/?p=992202
- Sea-Intelligence schedule reliability (via Container News): https://container-news.com/sea-intelligence-global-schedule-reliability-drops-to-62-8-in-december-2025 ; https://container-news.com/sea-intelligence-global-schedule-reliability-drops-to-61-4
- Freight audit benchmarks (vendor): https://shipware.com/?p=6480 ; https://www.intellitrans.com/resources/what-freight-audit-catches-rail-billing-errors ; https://gingercontrol.com/blog/freight-invoice-audit-guide
- BCG empty repositioning: https://www.bcg.com/publications/2015/transportation-travel-logistics-think-outside-your-boxes-solving-global-container-repositioning-puzzle.aspx ; https://www.uirr.com/web-news/repositioning-empty-containers-transinfo
- FAO/UNEP sustainable food cold chains: https://www.downtoearth.org.in/news/food/sustainable-cold-chains-can-address-climate-food-crises-unep-fao-report-85966
- IIR role of refrigeration in worldwide nutrition (2020): https://iifiir.org/en/fridoc/the-role-of-refrigeration-in-worldwide-nutrition-2020-142029
- Reefer claims (Swedish Club data via Identec): https://www.identecsolutions.com/reefer-claim-handling-industry-knowledge-hub
- IQVIA cold chain losses (via FreightWaves): https://www.freightwaves.com/news/35-billion-saved-the-digital-shift-in-pharma-logistics
- McKinsey disruption cost: https://www.consulting.us/news/4743/billions-in-profits-evaporate-due-to-supply-chain-disruptions
- CSCMP State of Logistics 2025: https://www.dcvelocity.com/logistics/state-of-logistics-report-2025
- Cainiao container booking: https://www.aircargonews.net/cainiao-launches-cargo-container-booking-service/1038174.article
- Alibaba.com Freight / Freightos: https://www.supplychaindive.com/news/alibaba-freight-procurement-freightos/578982/
