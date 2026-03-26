# User Personas, Target Markets & Research Insights

**Project:** Shipping Savior — Logistics Technology Platform
**Created:** 2026-03-26
**Linear:** AI-5423
**Status:** Complete
**Confidence:** HIGH (backed by industry data, market reports, and government statistics)

---

## Table of Contents

1. [Primary User Personas](#1-primary-user-personas)
2. [Target Market Segments](#2-target-market-segments)
3. [User Research Insights](#3-user-research-insights)
4. [Jobs-to-be-Done Framework](#4-jobs-to-be-done-framework)
5. [Sources](#5-sources)

---

## 1. Primary User Personas

### Persona A: "Blake" — The Freight Broker / Founder

| Attribute | Detail |
|-----------|--------|
| **Name** | Blake Mercer |
| **Role** | Founder & Principal Broker |
| **Company Size** | 3-8 employees (brokerage + ops coordinator + partner in Costa Rica) |
| **Age Range** | 32-45 |
| **Revenue** | $2M-$8M annually |
| **Tech Comfort** | Moderate-High. Uses spreadsheets heavily, comfortable with web apps, but not a developer. Will adopt new tools if ROI is clear within 2 weeks. |
| **Decision Authority** | Full — owns the business, makes all technology and vendor decisions |

**Background:**
Blake dominates cold chain exports through a major Lineage Logistics terminal, handling 96-97% of the facility's volume. This gives him deep relationships with carriers, terminal operators, and produce/protein exporters. He is now expanding into SE Asia consumer goods imports (apparel, CPG), leveraging his logistics expertise to bankroll container purchases, import to the US, and partner with fulfillment centers for online sales. He has an operations partner in Costa Rica who helps coordinate Central American trade lanes.

**Daily Workflow:**
1. **6:00-7:00 AM** — Check overnight carrier emails and vessel schedule updates. Review any customs holds or exceptions from the previous day.
2. **7:00-9:00 AM** — Research vessels and routes for active client requests. Pull carrier rate sheets, check transshipment options, calculate backhaul pricing advantages.
3. **9:00-11:00 AM** — Build quotes for customers. For each inquiry, Blake researches 3 carrier options at different price/speed tiers, manually calculates landed costs in Excel, and assembles a proposal email or PDF.
4. **11:00 AM-1:00 PM** — Client calls. Discuss shipment status, new sourcing opportunities, pricing negotiations. Coordinate with Costa Rica partner on Central American lanes.
5. **1:00-3:00 PM** — Track active shipments across multiple carrier websites. Log into Maersk, MSC, CMA CGM portals separately to check container status. Update clients by email.
6. **3:00-5:00 PM** — Administrative work: invoicing, document prep (BOL, commercial invoices), customs filing coordination with licensed customs broker. Research FTZ options for import strategy.
7. **Evening** — SE Asia sourcing research: Alibaba, trade directories, supplier outreach for apparel and CPG products.

**Pain Points (ranked by severity):**

1. **Quote generation takes 2-4 hours per client** — Researching 3 carrier options with accurate landed costs is manual, error-prone, and time-consuming. Each quote requires visiting multiple carrier websites, checking rate sheets (often in different formats), calculating duties using USITC lookup tools, and assembling everything in Excel.

2. **No single source of truth for shipment status** — Tracking 15-25 active shipments means logging into 5+ carrier portals daily. Status information is inconsistent across carriers (different terminology, different update frequencies). Clients call asking for updates he doesn't have yet.

3. **FTZ strategy analysis is opaque** — Blake knows FTZ can save significantly on duties (especially with tariff rates hitting 19-20% on ASEAN goods and up to 145% on some Chinese imports), but modeling the actual savings requires understanding complex regulations, duty rate lock-in timing, and incremental withdrawal economics. No existing tool does this.

4. **Landed cost calculations miss hidden fees** — His Excel models capture freight + duty + insurance, but consistently miss 15-25% in additional costs: demurrage ($150-350/day per container), detention fees, customs exam fees ($300-$1,200), Merchandise Processing Fee (0.3464%), Harbor Maintenance Fee (0.125%), and customs bond costs.

5. **Scaling is limited by his personal capacity** — Every quote, every shipment track, every customs coordination runs through Blake personally. He cannot hire someone to do quotes because the tribal knowledge (carrier relationships, backhaul intelligence, route preferences) lives in his head, not in a system.

6. **SE Asia sourcing is a knowledge gap** — Cold chain exports are his comfort zone. Import compliance for apparel and CPG (CPSC regulations, textile labeling, country of origin requirements, UFLPA forced labor compliance) is unfamiliar territory.

**Tools Currently Used:**
- Microsoft Excel (landed cost calculations, rate sheets, client proposals)
- Carrier websites (Maersk.com, MSC.com, CMA-CGM.com — manual tracking)
- USITC HTS lookup (hts.usitc.gov — tariff rate research)
- Email + phone (primary client communication)
- WhatsApp (Costa Rica partner coordination)
- Google Sheets (shared shipment tracking with team)
- QuickBooks or FreshBooks (invoicing)
- Alibaba / TradeIndia / GlobalSources (supplier sourcing)

**What Blake Would Pay For:**
| Feature | Willingness to Pay | Rationale |
|---------|-------------------|-----------|
| Automated 3-option quote generator with accurate landed costs | $300-500/mo | Saves 10-15 hours/week, his most expensive time |
| Unified shipment tracking across carriers | $100-200/mo | Replaces daily portal-hopping, improves client communication |
| FTZ savings analyzer with scenario modeling | $200-400/mo | Could save clients $50K-$500K+ on duty strategies |
| HTS code lookup with duty calculator | $50-100/mo | Table stakes, but integrated with quote workflow is high value |
| Container utilization optimizer | $50-100/mo | Reduces per-unit costs, improves margin per container |
| Professional client portal for proposals | $100-200/mo | Wins more business, looks more professional than PDF emails |
| **Total platform willingness** | **$500-1,200/mo** | Must show ROI within first month |

**Key Metrics Blake Tracks:**
- Revenue per container
- Margin per shipment (target: 12-18% on brokerage, 50%+ on own imports)
- Quote-to-close ratio
- Average transit time per lane
- Duty costs as % of landed cost
- Container utilization rate (target: >85% of volume OR weight capacity)
- Number of active shipments
- Days sales outstanding (DSO) on invoices

---

### Persona B: "Maria" — The Operations Manager

| Attribute | Detail |
|-----------|--------|
| **Name** | Maria Chen |
| **Role** | Operations Manager / Import Coordinator |
| **Company Size** | Works for a mid-size importer or brokerage (10-50 employees) |
| **Age Range** | 28-40 |
| **Revenue Responsibility** | Manages $5M-$20M in annual shipment value |
| **Tech Comfort** | High. Daily user of TMS systems, comfortable with data entry and reporting tools. Prefers structured workflows over ad-hoc processes. |
| **Decision Authority** | Recommender — evaluates tools and makes recommendations to owner/VP. Can approve tools under $200/mo independently. |

**Background:**
Maria is the operational backbone of a growing import operation. She coordinates between suppliers (SE Asia factories), freight forwarders, customs brokers, FTZ operators, and domestic fulfillment partners. She manages the document flow that keeps shipments moving — and when something goes wrong (a customs hold, a misclassified HTS code, a missed ISF filing deadline), she is the one who fixes it. Maria has 5-8 years of experience in logistics and knows that most problems stem from bad data or missed deadlines.

**Daily Workflow:**
1. **7:00-8:00 AM** — Review exception reports: customs holds, late vessels, documentation gaps. Prioritize by financial impact (demurrage accruing = highest priority).
2. **8:00-10:00 AM** — Document preparation and filing. Ensure ISF (Importer Security Filing) is submitted 24 hours before vessel departure. Verify commercial invoices match purchase orders. Coordinate with customs broker on classification questions.
3. **10:00-12:00 PM** — Shipment tracking and client/partner updates. Check carrier portals for ETAs. Update internal tracking spreadsheets. Email status updates to sales team and clients.
4. **12:00-2:00 PM** — Vendor coordination. Confirm booking details with carriers. Coordinate container pick-up/drop-off with trucking companies. Manage FTZ entries and withdrawals.
5. **2:00-4:00 PM** — Cost reconciliation. Compare actual costs to quoted costs. Flag shipments where actual landed cost exceeded estimates. Document reasons (exam fees, demurrage, rate changes).
6. **4:00-5:00 PM** — Reporting. Update weekly shipment status report. Flag upcoming deadlines (bond renewals, license expirations, tariff rate changes).

**Pain Points (ranked by severity):**

1. **Document management is chaos** — Each shipment generates 8-15 documents (bill of lading, commercial invoice, packing list, ISF, customs entry, certificate of origin, phytosanitary certificate for cold chain, insurance certificate, arrival notice, delivery order, etc.). These arrive via email from different parties at different times in different formats. Missing one document can hold up an entire container, accruing $150-350/day in demurrage.

2. **HTS classification errors are expensive** — CBP collected over $600M in misclassification penalties. Maria spends significant time verifying HTS codes, especially for new product categories (e.g., classifying a "moisture-wicking athletic shirt" vs. a "knit pullover" vs. a "sports garment" — each has different duty rates). Getting it wrong can mean a 10-20% duty difference plus penalties.

3. **No visibility into true costs until weeks after delivery** — Final landed cost includes charges that arrive 30-60 days after delivery: customs exam fees, demurrage adjustments, carrier surcharge corrections, MPF and HMF reconciliations. Maria cannot tell the sales team what a shipment actually cost until well after the goods have been sold.

4. **Deadline tracking is manual and high-stakes** — ISF must be filed 24 hours before vessel departure ($5,000 penalty per late filing). Customs entries must be filed within 15 days of arrival. FTZ admissions have specific timing requirements. Maria tracks these in a spreadsheet with color-coded due dates — one missed deadline can cost thousands.

5. **Carrier communication is fragmented** — Each carrier has its own portal, its own terminology, its own notification system. MSC might say "discharged" while Maersk says "unloaded." Vessel delay notifications come via email but aren't integrated with her tracking system.

6. **FTZ withdrawal paperwork is time-consuming** — Incremental withdrawal from FTZ (e.g., pulling 100 units at a time as needed) requires a customs entry for each withdrawal. Tracking which lots are in the FTZ, what duty rate was locked, and when to withdraw requires meticulous record-keeping.

**Tools Currently Used:**
- CargoWise or Descartes (enterprise TMS — if at a larger company)
- Excel / Google Sheets (if at a smaller company — primary tracking tool)
- Carrier portals (Maersk, MSC, CMA CGM — manual checks)
- USITC HTS lookup tool
- Email (primary communication with all parties)
- ACE (Automated Commercial Environment — CBP portal for customs entries)
- Shared drives / Dropbox (document storage)
- Slack or Teams (internal communication)

**What Maria Would Pay For (recommends to boss):**
| Feature | Value to Maria | Priority |
|---------|---------------|----------|
| Automated deadline tracking with alerts | Critical — prevents $5K+ penalties | P0 |
| Unified document checklist per shipment | Eliminates missed documents | P0 |
| Multi-carrier tracking in one dashboard | Saves 1-2 hours/day | P1 |
| Landed cost variance report (quoted vs. actual) | Improves future quoting accuracy | P1 |
| HTS lookup with classification guidance | Reduces misclassification risk | P1 |
| FTZ inventory tracking with withdrawal scheduler | Enables incremental withdrawal strategy | P2 |

**Key Metrics Maria Tracks:**
- On-time delivery rate
- Documentation accuracy rate (target: 99%+)
- Customs exam rate (lower = better compliance reputation)
- Average dwell time at port (days from discharge to delivery)
- ISF filing compliance rate (target: 100%)
- Cost variance (quoted vs. actual landed cost, target: <5%)
- Number of customs holds per month
- FTZ inventory levels and duty liability exposure

---

### Persona C: "David" — The Client / Shipper

| Attribute | Detail |
|-----------|--------|
| **Name** | David Park |
| **Role** | Owner / Director of Sourcing at an e-commerce or wholesale brand |
| **Company Size** | 5-25 employees, $1M-$10M annual revenue |
| **Age Range** | 30-50 |
| **Revenue** | Imports $500K-$5M in goods annually from SE Asia |
| **Tech Comfort** | Moderate. Uses Shopify/Amazon Seller Central daily. Comfortable with dashboards and reports. Not interested in complex logistics software — wants simple answers to simple questions. |
| **Decision Authority** | Full for supplier/logistics vendor selection. Budget-conscious. |

**Background:**
David runs a DTC (direct-to-consumer) apparel brand or CPG company that sources products from Vietnam, Thailand, and Indonesia. He is the person hiring Blake's freight brokerage to move his goods from factory to fulfillment center. David's core competency is product selection, branding, and sales — not logistics. He relies on his freight broker to handle the complexity but needs enough visibility to make good sourcing decisions. His unit economics are tight: $0.10/unit at origin, $0.50 landed, $2.00 wholesale, $5.00 retail — so every cent in shipping, duties, and fees directly impacts margin.

**Daily Workflow:**
1. **Morning** — Check sales dashboards (Shopify, Amazon). Review inventory levels. Identify reorder needs.
2. **Mid-morning** — Supplier communication (WeChat, email). Negotiate pricing, confirm production timelines, request samples.
3. **Afternoon** — Review freight quotes when received. Compare options (usually 2-3 from broker). Make shipping decisions based on cost, speed, and reliability.
4. **Ongoing** — Track inbound shipments (asks broker for updates). Plan marketing around expected inventory arrival. Coordinate with 3PL fulfillment partner.

**Pain Points (ranked by severity):**

1. **Cannot predict true landed cost before committing to a purchase order** — David needs to know: "If I buy 50,000 units at $0.10 each from Vietnam, what will they actually cost me when they arrive at my fulfillment center?" Currently, the answer involves multiple conversations with his broker, customs broker, and fulfillment partner — and it is still wrong 30-40% of the time because hidden fees are missed.

2. **Tariff uncertainty destroys planning** — With ASEAN tariffs at 19-20% and potential for increases, David cannot confidently calculate margins 6 months out. He needs scenario modeling: "What happens to my margin if tariffs go to 25%? 30%? If I use an FTZ?"

3. **Transit time uncertainty impacts sales** — If a container is delayed 2-3 weeks, David runs out of stock, loses Amazon ranking, and his marketing spend is wasted. He needs realistic transit time expectations per route and proactive delay notifications.

4. **Comparing broker proposals is difficult** — When David gets quotes from multiple brokers, each one formats them differently. One shows freight + duty, another shows freight only, a third includes insurance but not customs clearance. David cannot make apples-to-apples comparisons.

5. **FTZ strategy is invisible to him** — David has heard FTZs can save money on duties but has no idea how to evaluate whether an FTZ strategy makes sense for his volume and product mix. No broker has ever quantified this for him.

6. **Minimum order quantities create cash flow pressure** — Containers require large upfront purchases ($15K-$50K+). David needs to understand exactly how many units fit per container and what the per-unit cost will be at different order sizes to optimize cash flow.

**Tools Currently Used:**
- Shopify / Amazon Seller Central (sales management)
- Google Sheets (basic landed cost estimation)
- Email (freight broker communication)
- WeChat (supplier communication)
- Alibaba (supplier discovery)
- ShipStation or similar (domestic fulfillment)
- QuickBooks (accounting)

**What David Would Pay For:**
| Feature | Willingness to Pay | Rationale |
|---------|-------------------|-----------|
| Instant landed cost calculator for sourcing decisions | Would choose broker who provides this — indirect WTP | Major buying criteria when selecting freight broker |
| Professional visual proposal from broker | Expects this as part of service | Differentiator between brokers, not a separate line item |
| Real-time shipment tracking dashboard | $50-100/mo if standalone, prefers broker-provided | Saves constant "where's my container?" emails |
| Tariff scenario modeling | $50-100/mo if standalone | Would pay more if it includes FTZ savings analysis |
| Container utilization optimizer | Would choose broker who provides this | Directly impacts per-unit cost |
| **As standalone platform** | **$100-250/mo** | Only if it replaces existing broker communication overhead |
| **As broker-provided portal** | **$0 (included in brokerage fee)** | Expects this as value-add from a modern broker |

**Key Metrics David Tracks:**
- Cost of goods landed (per unit)
- Gross margin per product line
- Inventory turnover rate
- Days of inventory remaining
- Container cost vs. per-unit cost
- Duty rate per product category
- Transit time (order placed to goods received)
- Stock-out frequency

---

### Persona D: "Rachel" — The Investor / Strategic Partner

| Attribute | Detail |
|-----------|--------|
| **Name** | Rachel Torres |
| **Role** | Angel investor, logistics industry LP, or potential strategic partner (e.g., FTZ operator, fulfillment center owner, Costa Rica operations partner) |
| **Age Range** | 40-60 |
| **Revenue** | Personal portfolio: $500K-$5M in logistics-adjacent investments |
| **Tech Comfort** | Low-Moderate. Uses financial dashboards and pitch decks. Not interested in using the tool herself — wants to see the business case and market opportunity. |
| **Decision Authority** | Investment decision maker. Evaluates based on TAM, unit economics, competitive moat, and founder capability. |

**Background:**
Rachel is evaluating Shipping Savior either as an investment opportunity or a strategic partnership. She may be an angel investor who knows logistics, a fulfillment center operator who could offer warehouse space, or the Costa Rica partner evaluating the import business expansion. She needs to understand the market opportunity, the platform's competitive advantage, and the founder's ability to execute. She has seen many logistics tech pitches and is skeptical of "yet another TMS" — she needs to understand what makes this different.

**Evaluation Workflow:**
1. **Initial Review (10-15 minutes)** — Scan landing page, understand the value proposition, assess visual quality and professionalism.
2. **Deep Dive (30-60 minutes)** — Review unit economics (does the $0.10 to $5.00 chain actually work?), explore FTZ savings model (is this a real competitive advantage?), examine market size data.
3. **Technical Assessment (15-30 minutes)** — Look at platform architecture (is this scalable?), data sources (are they defensible?), and feature roadmap (is the vision realistic?).
4. **Due Diligence (ongoing)** — Competitive landscape review, founder background check, customer pipeline assessment, regulatory risk evaluation.

**Pain Points (in this context):**

1. **Most logistics tech pitches lack specificity** — She sees vague claims about "disrupting logistics" without concrete unit economics, TAM calculations, or competitive moat analysis.

2. **Hard to assess market timing** — Is the tariff environment making FTZ strategy more or less valuable? Is the SE Asia import boom sustainable given new tariffs?

3. **Execution risk is high in logistics tech** — Many startups build beautiful UIs but cannot get carrier data, customs compliance, or operational workflows right. She needs evidence of domain expertise.

4. **Revenue model clarity** — Is this a SaaS platform (recurring revenue) or a brokerage tool (transaction-based)? The business model determines valuation methodology.

**What Rachel Wants to See:**
| Element | Why It Matters |
|---------|---------------|
| Total addressable market (TAM) with segmentation | Sizes the opportunity |
| Unit economics walkthrough with real numbers | Validates the business model |
| FTZ savings calculator with real scenarios | Demonstrates competitive moat |
| Competitive landscape comparison | Shows awareness of alternatives |
| Platform roadmap with phase-gating | Proves execution discipline |
| Architecture diagram showing data sources | Assesses technical defensibility |
| Revenue per customer projections | Validates SaaS economics |
| Cold chain expertise demonstration | Confirms founder's domain advantage |

**Key Metrics Rachel Evaluates:**
- Total addressable market (TAM / SAM / SOM)
- Customer acquisition cost (CAC) and lifetime value (LTV)
- Monthly recurring revenue (MRR) trajectory
- Gross margin on SaaS vs. brokerage revenue
- Customer retention / churn rate
- Competitive differentiation (features competitors lack)
- Regulatory risk exposure
- Market timing indicators (tariff trends, SE Asia trade flows)

---

## 2. Target Market Segments

### Segment 1: Small-to-Mid Freight Brokers (1-50 employees)

| Attribute | Detail |
|-----------|--------|
| **Market Size** | ~30,000 active FMCSA-registered brokerages in the US. ~80% have fewer than 20 employees. Top 3% generate 80% of revenue, leaving 97% as potential SMB customers. Total US freight brokerage market: **$19.68B (2025)**, growing to $21.28B in 2026. |
| **Addressable Market** | ~24,000 brokerages with <50 employees. At $500-1,200/mo average platform spend, the SMB brokerage SaaS TAM is approximately **$144M-$346M/year**. |
| **Current Tool Landscape** | **Fragmented.** 16% still use Excel + phone calls. 61% use partially automated systems. Leading TMS platforms include Tai Software, AscendTMS (free tier), Alvys ($514/mo), Logistically ($330-400/mo), and Aljex. Enterprise players (CargoWise, Descartes) are too expensive and complex for this segment. |
| **Willingness to Pay** | $300-1,200/month for an integrated platform. Price sensitivity is HIGH — most SMB brokers evaluate ROI monthly. Per-load pricing ($2-5/load) is preferred by low-volume brokers; flat subscription by higher-volume ones. Hybrid models with low base + per-transaction are gaining traction. |
| **Key Buying Criteria** | 1. Time saved on quoting (hours/week), 2. Ease of use (learning curve < 1 week), 3. Landed cost accuracy, 4. Multi-carrier tracking, 5. No long-term contracts, 6. Mobile-friendly |
| **Growth Trajectory** | Small business freight brokerage tech adoption is growing at **10.19% CAGR** (2026-2031). Digital freight brokerage overall is projected at 16.75% CAGR. The segment is rapidly digitizing as younger operators enter the industry. |

**Why Shipping Savior Wins Here:**
- FTZ analyzer is unique — no competitor offers this
- 3-option quote generation maps directly to how freight brokers work
- Landed cost calculator includes hidden fees that Excel models miss
- Lower price point than enterprise TMS, more capable than free tools
- Cold chain expertise built in (differentiator for perishable-cargo brokers)

**Competitive Landscape for This Segment:**

| Competitor | Pricing | Strengths | Gaps Shipping Savior Fills |
|-----------|---------|-----------|---------------------------|
| AscendTMS | Free (basic), $50-200/mo (pro) | Free tier, large user base | No landed cost calculator, no FTZ analysis, no route mapping |
| Tai Software | $200-500/mo | Full TMS features, dispatch | No import/duty calculation, domestic-focused |
| Alvys | $514/mo+ | Modern UI, unlimited users | No HTS lookup, no FTZ modeling, no cold chain features |
| Logistically | $330-400/mo | Flat rate, all features | Domestic trucking focus, no international import tools |
| CargoWise | $1,000+/mo | Enterprise-grade, global | Too expensive/complex for SMB, per-transaction pricing causing 20-50% cost increases |
| Freightos | Marketplace model | Instant quotes from many forwarders | Marketplace for shippers, not a tool for brokers |
| Flexport | Full-service forwarder | End-to-end service, AI tools | Not a tool — a competitor to the broker. Access only to Flexport rates |

---

### Segment 2: Import/Export Businesses Doing SE Asia Sourcing

| Attribute | Detail |
|-----------|--------|
| **Market Size** | US goods imports from ASEAN totaled **$453.7B in 2025**, up 28.9% ($101.6B) from 2024. Approximately 1.3 million small businesses are engaged in exporting, with 97% of ~288,000 exporting firms being SMBs. The SE Asia import segment is growing as firms reroute supply chains away from China (US import share from China fell 4.4pp while ASEAN share rose 2.5pp). |
| **Addressable Market** | Estimated 50,000-100,000 US businesses actively importing from SE Asia. At $100-400/mo for import tools, the addressable SaaS TAM is approximately **$60M-$480M/year**. |
| **Current Tool Landscape** | **Highly manual.** Most SMB importers use Google Sheets for landed cost estimation, USITC website for tariff lookup, and email for freight broker communication. Larger importers may use Zonos ($$$), Descartes CustomsInfo, iCustoms, or DHL MyGTS for duty calculation. Most tools are point solutions — no integrated platform combines duty lookup + landed cost + route comparison + FTZ modeling. |
| **Willingness to Pay** | $100-400/month for import planning tools. **Higher WTP during tariff uncertainty** — when ASEAN tariffs hit 19-20% in August 2025, demand for duty optimization tools spiked. One-time FTZ analysis consulting commands $5,000-$15,000; a SaaS tool replacing this has strong value prop. |
| **Key Buying Criteria** | 1. Accuracy of landed cost calculation (within 5% of actual), 2. Coverage of SE Asia origins (Vietnam, Thailand, Indonesia, Cambodia, Philippines), 3. Tariff scenario modeling ("what if rates go to 25%?"), 4. Speed (answer in seconds, not days), 5. Plain language (not customs jargon) |
| **Growth Trajectory** | ASEAN's share of US imports is rising structurally as supply chains diversify from China. The DTC market is growing at **13.4% CAGR** (2025-2033, reaching $482.3B). 81% of e-commerce leaders say tariffs could disrupt their international strategy — they need tools to navigate this. |

**Why Shipping Savior Wins Here:**
- Unit economics calculator ($0.10 to $5.00) speaks this segment's language
- FTZ savings analyzer is a $5K-$15K consulting engagement replaced by a $200/mo tool
- Tariff scenario modeling addresses their #1 anxiety (tariff uncertainty)
- Container utilization calculator directly answers "how many units per container?"
- Knowledge base demystifies import process for non-experts

---

### Segment 3: FTZ-Focused Importers

| Attribute | Detail |
|-----------|--------|
| **Market Size** | 197 active FTZ programs across the US, with ~1,300 active operations employing ~550,000 people. Businesses in FTZs exported **$149B** in merchandise (2023 data). FTZ usage is surging in the current tariff environment — with tariffs up to 145% on some imports, FTZ duty deferral and rate-lock strategies are more valuable than ever. |
| **Addressable Market** | ~1,300 active FTZ operators + estimated 5,000-10,000 businesses considering FTZ strategy. High-value segment: annual FTZ savings per business range from $50K to $10M+. At $300-600/mo for FTZ management tools, addressable TAM is approximately **$22M-$79M/year** for software, plus **consulting/advisory revenue** at $5K-$25K per engagement. |
| **Current Tool Landscape** | **Near-zero dedicated tooling.** FTZ operations are managed with spreadsheets, customs broker consultations, and ERP bolt-ons. No standalone SaaS product exists that models FTZ savings with incremental withdrawal analysis. This is Shipping Savior's #1 competitive gap to exploit. Descartes and Thomson Reuters ONESOURCE have some FTZ features but are enterprise-priced and not focused on FTZ strategy modeling. |
| **Willingness to Pay** | **Highest WTP of any segment.** FTZ decisions are high-stakes (FTZ status elections are irrevocable) and high-value ($50K-$10M+ in annual savings). Businesses regularly pay $5K-$25K for one-time FTZ feasibility studies. A SaaS tool at $300-600/mo that provides ongoing FTZ optimization is compelling. High-volume importers saving $194K/year on MPF alone can justify significant software spend. |
| **Key Buying Criteria** | 1. Accuracy of duty savings calculations (regulatory compliance is non-negotiable), 2. Incremental withdrawal modeling, 3. Rate-lock scenario analysis, 4. Compliance guardrails (FTZ elections are permanent), 5. Integration with customs entry workflow, 6. Audit trail for CBP |
| **Growth Trajectory** | FTZ usage is growing rapidly in the current tariff environment. The "central pillars of duty deferral, export duty exemption, and operational efficiency remain intact and, for many importers, more valuable than ever." As tariffs increase, FTZ becomes a must-have strategy rather than a nice-to-have. |

**Why Shipping Savior Wins Here:**
- **Zero direct competitors** in FTZ savings modeling for SMBs
- Incremental withdrawal modeling is a feature no existing platform offers
- Rate-lock analysis becomes critical when tariffs change frequently
- Domain expertise (founder actually uses FTZ strategy) creates authentic product-market fit

---

### Segment 4: Cold Chain Logistics Companies

| Attribute | Detail |
|-----------|--------|
| **Market Size** | US Cold Chain Logistics Market: **$97.13B (2026)**, growing at 6.63% CAGR to $133.87B by 2031. North America cold chain market: $71.9B (2024) to $127.6B by 2033. The US accounts for ~31% of global cold storage capacity with 1,200+ temperature-controlled warehouses. Lineage Logistics alone commands 32.9% North American market share. |
| **Addressable Market** | Estimated 3,000-5,000 cold chain-focused logistics companies and freight brokers in the US. At $300-800/mo for cold chain-specific features, addressable TAM is approximately **$10.8M-$48M/year**. Niche but high-value — cold chain companies have higher margins and lower price sensitivity than general cargo operators. |
| **Current Tool Landscape** | Enterprise cold chain platforms (Controlant, Emerson, Carrier Transicold) focus on temperature monitoring and IoT telemetry, not on financial analysis or landed cost. Cold chain brokers use the same fragmented tools as general brokers (Excel, carrier portals) but with added complexity of reefer container premiums, spoilage risk, and temperature compliance. |
| **Willingness to Pay** | $300-800/month. Cold chain operators have higher margins (reefer containers command 2-3x general container rates) and handle higher-value cargo. They are less price-sensitive than general cargo brokers. Spoilage prevention (even 1% spoilage reduction on a $500K container) justifies significant tool investment. |
| **Key Buying Criteria** | 1. Reefer container cost modeling (premiums vary by route and season), 2. Temperature compliance documentation, 3. Spoilage risk factors in landed cost, 4. Vessel schedule accuracy (critical for perishables), 5. Port dwell time data (perishables cannot wait), 6. Backhaul intelligence (reefer containers often deadhead) |
| **Growth Trajectory** | Strong and structural. Global cold chain market growing at **20.5% CAGR** (2026-2033). Air transportation in cold chain growing at 13.23% CAGR through 2031. Protein exports, pharmaceutical logistics, and fresh produce trade are all expanding. |

**Why Shipping Savior Wins Here:**
- Founder's lived experience (96-97% of Lineage terminal volume) creates authentic domain expertise
- Cold chain cost overlay (reefer premiums, spoilage factors) is not available in any general logistics platform
- Backhaul pricing intelligence is "invisible in all competitor platforms" (per competitive analysis)
- Port dwell time data is critical for perishables — and a differentiator in the platform

---

### Segment 5: E-Commerce Brands Importing Directly

| Attribute | Detail |
|-----------|--------|
| **Market Size** | DTC market: **$175.6B (2025)**, projected to reach $482.3B by 2033 at 13.4% CAGR. DTC logistics projected to climb from $25.37B (2024) to $75.0B by 2035. 67% of supply chain leaders have increased DTC fulfillment investment since 2020. An estimated 150,000-300,000 US e-commerce brands import directly from Asia. |
| **Addressable Market** | Of the 150K-300K direct importers, perhaps 20-30% (30,000-90,000) are large enough to benefit from a logistics platform (>$100K annual imports). At $100-300/mo, addressable TAM is approximately **$36M-$324M/year**. |
| **Current Tool Landscape** | Most use Shopify + a 3PL (ShipBob, Deliverr, ShipStation) for fulfillment but have zero visibility into the import/landed-cost side. Freight is typically handled by a broker or forwarder. Tools like Flexport offer end-to-end visibility but at a price and complexity that excludes small brands. Zonos and SimplyDuty handle duty calculations for cross-border e-commerce but not full import logistics. |
| **Willingness to Pay** | $100-300/month for import visibility tools. **Price sensitivity is VERY HIGH** — these brands operate on thin margins and measure everything against customer acquisition cost. However, they will pay if the tool directly prevents margin erosion from hidden import costs. 81% say tariffs could disrupt their international strategy — the pain is real and growing. |
| **Key Buying Criteria** | 1. Simplicity (no logistics jargon), 2. Per-unit landed cost that feeds into their P&L, 3. Speed (decision-ready data in minutes, not days), 4. Tariff alerts for their specific product categories, 5. Integration with Shopify / Amazon, 6. Mobile-friendly |
| **Growth Trajectory** | Fastest-growing segment by user count. Asia-Pacific DTC is growing at 16.2% CAGR. 75% of brands now rely on 3PLs for fulfillment — they are outsourcing logistics but still need to understand costs. As more brands shift from Alibaba dropshipping to container-load imports, they need professional import tools. |

**Why Shipping Savior Wins Here:**
- Unit economics calculator ($0.10 to $5.00) is literally this persona's daily question
- Plain-language knowledge base eliminates the "I don't know what an ISF is" barrier
- Container utilization optimizer helps brands right-size orders to fill containers efficiently
- Tariff scenario modeling addresses the #1 fear in DTC importing right now
- Future Shopify integration would be a massive channel

---

### Segment Summary Matrix

| Segment | Market Size | WTP/mo | Competitive Gap | Entry Difficulty | Priority |
|---------|------------|--------|-----------------|-----------------|----------|
| SMB Freight Brokers | $144M-$346M TAM | $500-1,200 | Medium (vs. existing TMS) | Medium | **Primary** |
| SE Asia Importers | $60M-$480M TAM | $100-400 | High (no integrated tool) | Low | **Primary** |
| FTZ-Focused Importers | $22M-$79M TAM | $300-600 | **Very High** (zero competitors) | Low | **Primary** |
| Cold Chain Logistics | $10.8M-$48M TAM | $300-800 | High (no financial analysis) | Medium | Secondary |
| E-Commerce Direct Importers | $36M-$324M TAM | $100-300 | Medium (simpler need) | High (volume play) | Secondary |

**Recommended Go-To-Market Order:**
1. **FTZ-Focused Importers** — Smallest segment but highest WTP, zero competition, and the founder's FTZ expertise creates immediate credibility. Win early customers here to fund growth.
2. **SMB Freight Brokers** — Largest reliable TAM, natural expansion from founder's existing network. The 3-option quote generator is the hook.
3. **SE Asia Importers** — Converges with the founder's own import expansion. Build the tool he needs, and the market follows.
4. **Cold Chain Logistics** — Leverage founder's Lineage terminal dominance as proof of domain expertise. Cold chain overlay features differentiate from general logistics platforms.
5. **E-Commerce Direct Importers** — Largest potential user base but lowest WTP and highest support burden. Enter after platform is mature and self-serve onboarding is solid.

---

## 3. User Research Insights

### What Makes Logistics Professionals Switch Tools?

Based on industry surveys, market data, and the 2025 CargoWise pricing crisis (which triggered "unprecedented user unrest"), logistics professionals switch tools due to:

| Trigger | Impact Level | Evidence |
|---------|-------------|----------|
| **Unexpected price increases** | Critical | CargoWise's transition to per-transaction "Value Pack" model caused 20-50% cost increases, driving mass evaluation of alternatives. Variable pricing makes budget forecasting impossible. |
| **Operational bottleneck** | High | When a tool's limitation directly costs money — e.g., missing a customs deadline because the system didn't alert them, or a misclassified HTS code because the lookup was wrong. |
| **Business model change** | High | Expanding from domestic to international, or from general cargo to cold chain. Existing tools often cannot accommodate new workflows. |
| **Competitive pressure** | Medium | Seeing a competitor use a better tool to win business. "They sent the client a beautiful proposal with route maps and I sent an Excel spreadsheet." |
| **New hire brings knowledge** | Medium | A new operations manager who used a better tool at a previous company advocates for switching. |
| **Contract renewal timing** | Medium | Annual contract renewals are natural evaluation points. Month-to-month contracts lower switching friction. |
| **Poor customer support** | Medium | Ticket-based support frustrates users who need real-time help. Alternatives offering dedicated customer success managers win. |

**Key Insight:** The biggest switching trigger in 2025-2026 is the **tariff environment**. When tariff rates jump to 19-20% (ASEAN) or 145% (some China goods), businesses suddenly need tools they never needed before — FTZ modeling, tariff scenario analysis, and duty optimization. This creates a **market-timing window** for Shipping Savior.

---

### Top Frustrations with Existing Platforms

| Rank | Frustration | % of Users Affected | Platform Example |
|------|-------------|-------------------|------------------|
| 1 | **Too complex / steep learning curve** | ~60% | CargoWise: "The system is too complex. You can't proceed even if you make a small mistake." |
| 2 | **Unpredictable pricing** | ~40% | CargoWise per-transaction model; hidden add-on fees across most platforms |
| 3 | **Poor integration between modules** | ~50% | Fragmented solutions where accounting, operations, and tracking don't talk to each other |
| 4 | **No landed cost accuracy** | ~70% of SMBs | Most tools miss 15-25% of actual costs (demurrage, exam fees, MPF, HMF, bond) |
| 5 | **International trade is an afterthought** | ~65% of SMBs | Most TMS platforms are domestic-trucking-first; import/export features are bolt-ons |
| 6 | **Mobile experience is poor** | ~45% | Enterprise platforms built for desktop; 70%+ of digital freight transactions are mobile-initiated |
| 7 | **No FTZ or duty optimization** | ~90%+ of SMBs | Zero SMB-focused platforms offer FTZ modeling |
| 8 | **Slow/poor customer support** | ~35% | Ticket-based support with multi-day response times |

**Key Insight:** The convergence of frustrations #4 (no landed cost accuracy), #5 (international trade as afterthought), and #7 (no FTZ optimization) defines Shipping Savior's exact positioning. These are the gaps that no existing platform fills for SMBs.

---

### Feature Prioritization for SMB Importers

Based on synthesis of market research, survey data, and persona analysis:

| Priority | Feature | User Value | Build Complexity | Revenue Impact |
|----------|---------|-----------|-----------------|----------------|
| **P0** | Landed cost calculator (with ALL hidden fees) | Answers the #1 question: "What will it actually cost?" | Medium | Table stakes — must have to compete |
| **P0** | HTS code lookup with duty rates | Foundation for every calculation | Medium | Enables all other features |
| **P0** | Unit economics breakdown | Tells the business story ($0.10 to $5.00) | Low | Core value prop for importers and investors |
| **P1** | FTZ savings analyzer | #1 differentiator, zero competitors | High | Premium feature, justifies higher pricing |
| **P1** | 3-option route/carrier comparison | Maps to how freight brokers actually work | Medium | Saves 2-4 hours per quote |
| **P1** | Multi-carrier shipment tracking | Replaces daily portal-hopping | Medium | High daily-use value, drives retention |
| **P1** | Tariff scenario modeling | Addresses #1 anxiety in current market | Medium | Converts trial users during tariff events |
| **P2** | Container utilization calculator | Direct cost optimization | Low | Nice-to-have but low switching trigger |
| **P2** | Interactive route map | Visual differentiator in proposals | Medium | Helps win client presentations |
| **P2** | PDF export / professional proposals | Business deliverable | Medium | Differentiates from competitors' basic reports |
| **P3** | Document checklist per shipment | Prevents missed deadlines/docs | Low | High value for ops managers, not brokers |
| **P3** | Knowledge base / compliance guides | Reduces learning curve for new importers | Low | Attracts SE Asia importer segment |
| **P3** | Cold chain cost overlay | Niche differentiator | Medium | Valuable for cold chain segment only |

---

### Pricing Sensitivity for Logistics Software

| Price Tier | Target Segment | Features Included | Conversion Likelihood |
|------------|---------------|-------------------|----------------------|
| **Free / Freemium** | E-commerce importers doing research | HTS lookup, basic landed cost calculator, knowledge base | High trial, low conversion to paid |
| **$99-199/mo (Starter)** | Solo operators, small importers | Full landed cost calculator, unit economics, container optimizer, 5 shipment tracking | 15-25% conversion from free |
| **$299-499/mo (Professional)** | Growing brokers, active importers | Everything in Starter + FTZ analyzer, tariff scenarios, route comparison, PDF reports, 25 shipments | Core revenue tier — target 60% of paying users |
| **$599-999/mo (Business)** | Mid-size brokerages, FTZ-heavy importers | Everything in Professional + unlimited shipments, team access, client portal, priority support, API access | 25% of paying users, highest LTV |
| **$1,200+/mo (Enterprise)** | Large brokerages, multi-location operations | Custom integrations, SLA, dedicated support, white-label options | Case-by-case pricing |

**Pricing Benchmarks:**
- Logistically: $330-400/mo flat rate
- Alvys: $514/mo starting
- AscendTMS: Free to $200/mo
- CargoWise: $1,000+/mo (causing mass defections at higher rates)
- Per-load pricing: $2-5/load (preferred by low-volume brokers)

**Key Insight:** The **$299-499/mo Professional tier** is the sweet spot. It is above the free/cheap TMS tools that lack import features, below the enterprise platforms that are too complex/expensive, and positioned at a price where SMB brokers can justify ROI if the platform saves even 5 hours/week.

---

### Mobile vs. Desktop Usage Patterns

| Context | Platform | Reasoning |
|---------|----------|-----------|
| **Rate research / quote building** | Desktop (80%) | Complex calculations, multiple data sources, document formatting |
| **Shipment tracking** | Mobile (70%) | Quick status checks throughout the day, often on-the-go |
| **Client communication** | Mobile (60%) | Calls, texts, WhatsApp — especially for international partners |
| **Document review** | Desktop (75%) | PDFs, BOLs, commercial invoices require larger screens |
| **Dashboard / KPIs** | Split (50/50) | Quick glances on mobile, deep analysis on desktop |
| **HTS code lookup** | Desktop (65%) | Often done alongside other research tasks |
| **FTZ analysis** | Desktop (90%) | Complex, multi-variable analysis |

**Industry Data:**
- 70%+ of all North American digital freight transactions in 2024 were initiated via mobile
- Mobile app-based platforms dominate with 61.3% market share in 2025
- 56% of logistics professionals use smartphones as primary information endpoint
- 16% still rely on Excel spreadsheets and manual phone calls

**Key Insight:** Build **mobile-first for tracking and status features**, **desktop-first for calculators and analysis tools**. The landing page and onboarding must work on mobile, but complex tools like FTZ Analyzer can be desktop-optimized. Responsive design is essential, but do not force mobile optimization on features that are inherently desktop activities.

---

### Decision-Making Timeline for New Software Adoption

| Phase | Duration | Activities | Who's Involved |
|-------|----------|-----------|----------------|
| **Awareness** | 1-4 weeks | Encounters tool via referral, search, or social media. Browses landing page. | Individual contributor or owner |
| **Evaluation** | 2-6 weeks | Signs up for free trial. Runs first calculation. Compares to current workflow. Involves operations team if applicable. | Owner + ops manager |
| **Pilot** | 4-8 weeks | Uses tool on 2-3 real shipments alongside existing workflow. Compares results. | Ops team (daily), owner (weekly review) |
| **Decision** | 1-2 weeks | ROI assessment. "Did this save time? Did it catch costs I would have missed?" Budget approval if needed. | Owner (final decision) |
| **Adoption** | 4-8 weeks | Full transition from Excel/legacy tool. Data migration. Team training. | Full team |
| **Total** | **3-6 months** | From first encounter to full adoption | — |

**Accelerants (shorten timeline):**
- Free trial with real data (not demo data) — removes "is this real?" doubt
- Single impressive calculation (FTZ savings showing $50K+ in annual savings) — creates urgency
- Tariff event (new tariffs announced) — forces immediate tool evaluation
- Referral from trusted peer — skips awareness phase, starts at evaluation
- No long-term contract — reduces commitment anxiety

**Blockers (lengthen timeline):**
- Data migration requirements (historical shipment data, rate sheets)
- Team resistance ("we've always used Excel")
- Integration requirements with existing systems (QuickBooks, ERP)
- Concerns about data accuracy for customs compliance
- Cost of adoption (license + training + workflow disruption)

**Key Insight for Shipping Savior:** The **free tier must deliver an "aha moment" within 3 minutes** (per the onboarding journey map). The most effective conversion path is: free HTS lookup + landed cost calculator → the user discovers their current estimates are missing 15-25% in hidden costs → they upgrade to Professional for the full calculator + FTZ analyzer. The FTZ savings analysis is the strongest single conversion trigger because the dollar amounts are so large ($50K-$500K+/year) that the tool pays for itself with one analysis.

---

## 4. Jobs-to-be-Done Framework

### JTBD 1: Calculate True Landed Cost Before Committing to a Shipment

**Job Statement:** "When I am evaluating a sourcing opportunity from SE Asia, I want to know the exact per-unit landed cost including ALL fees, so I can determine if the margin justifies the purchase order."

| Dimension | Detail |
|-----------|--------|
| **Functional Job** | Calculate total cost per unit from factory gate to fulfillment center, including: product cost, inland freight (origin), ocean freight, insurance, customs duties (by HTS code), MPF (0.3464%), HMF (0.125%), customs broker fee, exam fees (probability-weighted), container drayage, FTZ admission (if applicable), domestic freight to fulfillment, unloading/receiving costs |
| **Emotional Job** | Feel confident that the number is accurate before committing $15K-$50K+ to a container order. Eliminate the anxiety of "what costs am I missing?" |
| **Social Job** | Present a credible, professional cost analysis to partners, investors, or clients that demonstrates financial rigor |
| **Current Solutions** | Excel spreadsheet (misses 15-25% of costs), broker's verbal estimate (varies wildly), Zonos/SimplyDuty (duty only, not full landed cost), Flexport (only if using their forwarding service) |
| **Success Criteria** | Calculated landed cost is within 5% of actual final cost. Calculation takes < 2 minutes. All 15+ cost components are visible and adjustable. |
| **Underserved Needs** | Hidden fee inclusion (demurrage probability, exam fee probability), tariff scenario overlay ("what if duties go up 5%?"), FTZ vs. non-FTZ comparison in the same view |

**Feature Map:**
- Landed Cost Calculator (P0)
- HTS Code Lookup (P0)
- Unit Economics Breakdown (P0)
- Hidden Fee Estimator (P0 — within landed cost calculator)

---

### JTBD 2: Compare Carrier Options Quickly

**Job Statement:** "When a client asks for a freight quote, I want to compare 3 carrier options with different price/speed/reliability tradeoffs within 30 minutes, so I can present professional options and win the business."

| Dimension | Detail |
|-----------|--------|
| **Functional Job** | For a given origin-destination port pair and cargo type (general/reefer), retrieve or calculate: carrier name, vessel schedule, transit time, transshipment points, freight rate per container, total cost including surcharges, reliability score, and backhaul availability |
| **Emotional Job** | Feel prepared and professional when presenting to clients. Eliminate the stress of manually researching carriers across 3-5 websites |
| **Social Job** | Appear knowledgeable and thorough to clients. The 3-option format demonstrates that you researched the market, not just offered the first available option |
| **Current Solutions** | Manual research on Maersk.com, MSC.com, CMA-CGM.com (2-4 hours per quote). Rate sheets in email/PDF. Broker's memory of carrier preferences per lane. Phone calls to carrier sales reps. |
| **Success Criteria** | 3 options with pricing in < 30 minutes (vs. 2-4 hours today). Each option includes transit time, cost, transshipment details, and a recommendation. Output is client-ready (PDF or shareable link). |
| **Underserved Needs** | Backhaul pricing intelligence (rates drop when carriers need to reposition containers), transshipment risk quantification, historical reliability data per carrier per lane, reefer container availability by route |

**Feature Map:**
- Route/Carrier Comparison Tool (P1)
- Interactive Route Map (P2)
- Backhaul Pricing Intelligence (differentiator)
- PDF Export for Client Proposals (P2)

---

### JTBD 3: Evaluate FTZ Strategy Savings

**Job Statement:** "When I am deciding whether to route imports through a Foreign Trade Zone, I want to model the exact dollar savings under different scenarios, so I can make an informed decision on a strategy that is irrevocable once elected."

| Dimension | Detail |
|-----------|--------|
| **Functional Job** | Model FTZ vs. non-FTZ costs including: duty rate at time of FTZ admission vs. current rate, incremental withdrawal schedule (units withdrawn per week/month), cash flow impact of duty deferral, MPF savings from consolidated entries, re-export duty elimination, break-even analysis (at what volume does FTZ pay for itself?) |
| **Emotional Job** | Feel confident making a permanent decision (FTZ status elections are irrevocable). Reduce fear of making a costly mistake. Have data to defend the decision to partners/auditors. |
| **Social Job** | Demonstrate sophisticated trade strategy to clients, partners, and investors. FTZ expertise positions the broker as a strategic advisor, not just a transaction processor. |
| **Current Solutions** | Customs broker consultation ($2K-$5K one-time), Big 4 trade advisory ($10K-$25K), Excel modeling (error-prone, doesn't account for regulatory nuance), or simply not evaluating FTZ at all (most common) |
| **Success Criteria** | Side-by-side FTZ vs. non-FTZ cost comparison. Multiple withdrawal scenarios. Cash flow timeline. Break-even volume calculation. Exportable report for decision documentation. |
| **Underserved Needs** | Incremental withdrawal modeling (unique to Shipping Savior), rate-lock timing optimization ("when should I admit goods to lock the current rate?"), multi-product FTZ portfolio analysis, regulatory guardrails (warn about irrevocable decisions), April 2025 executive order impact modeling |

**Feature Map:**
- FTZ Savings Analyzer (P1 — #1 differentiator)
- Tariff Scenario Modeling (P1)
- Rate-Lock Timing Optimizer (differentiator)
- FTZ Regulatory Knowledge Base (P3)

---

### JTBD 4: Generate Professional Proposals for Clients

**Job Statement:** "When presenting shipping options to a prospective client, I want to generate a polished, branded proposal document in minutes, so I can win business against larger competitors who have marketing departments."

| Dimension | Detail |
|-----------|--------|
| **Functional Job** | Produce a PDF or web-based proposal that includes: company branding, 3 route/carrier options with pricing, landed cost breakdown, route map visualization, transit timeline, terms and conditions, and a clear call-to-action |
| **Emotional Job** | Feel proud of the deliverable. Eliminate embarrassment of sending plain-text emails or basic Excel attachments when competing against Flexport-level presentations |
| **Social Job** | Signal professionalism and capability. A polished proposal communicates "this broker is organized and competent." |
| **Current Solutions** | Email with Excel attachment (most common), Word document with manual formatting, PowerPoint for large clients, Canva for one-off designs |
| **Success Criteria** | Professional PDF generated from quote data in < 5 minutes. Includes route map, cost breakdown chart, and carrier details. Brandable (company logo, colors). Shareable via link or PDF. |
| **Underserved Needs** | Template library for different proposal types (spot quote, annual contract, cold chain), comparison format that matches the 3-option standard, automatic chart generation from quote data, proposal tracking (did the client view it?) |

**Feature Map:**
- PDF Export / Professional Proposals (P2)
- Interactive Route Map (embedded in proposal) (P2)
- Branded Proposal Templates (P2)
- Client Portal for Proposal Sharing (P3)

---

### JTBD 5: Track Shipment Status Across Carriers

**Job Statement:** "When managing 15-25 active shipments across multiple carriers, I want a single dashboard showing all container statuses, so I can proactively communicate with clients and address exceptions before they become problems."

| Dimension | Detail |
|-----------|--------|
| **Functional Job** | Aggregate container tracking data from multiple carriers (Maersk, MSC, CMA CGM, Hapag-Lloyd, etc.) into a unified view showing: container number, vessel name, current location, ETA, status (in transit / at port / customs / delivered), exceptions/delays, and key milestones |
| **Emotional Job** | Feel in control of operations. Replace the anxiety of "am I missing something?" with the confidence of "I can see everything at a glance." |
| **Social Job** | Be the first to tell the client about a delay — not the other way around. Proactive communication builds trust and justifies brokerage fees. |
| **Current Solutions** | Logging into 3-5 carrier portals daily (30-60 minutes), Google Sheets with manual updates, some brokers use Terminal49 or project44 for multi-carrier tracking |
| **Success Criteria** | All active shipments visible in one view. Status updates at least every 6 hours. Exception alerts (delay, customs hold) push to email/SMS within 1 hour. Client-shareable tracking links. |
| **Underserved Needs** | Proactive delay prediction (not just current status but predicted delays based on port congestion), financial impact of delays (demurrage accruing, stock-out risk), cold chain temperature compliance status, FTZ admission deadline tracking |

**Feature Map:**
- Multi-Carrier Shipment Dashboard (P1)
- Exception Alert System (P1)
- Client-Shareable Tracking Links (P2)
- Delay Prediction / Port Congestion Data (P3)

---

### JTBD 6: Comply with Customs Requirements

**Job Statement:** "When importing goods into the US, I want a clear checklist of every required document and deadline per shipment, so I can avoid penalties ($5,000+ per ISF violation) and customs holds that accrue demurrage."

| Dimension | Detail |
|-----------|--------|
| **Functional Job** | For a given shipment type and country of origin, produce: required document list (BOL, commercial invoice, packing list, ISF, certificate of origin, phytosanitary certificate if perishable, etc.), filing deadlines with countdown timers, HTS classification guidance, country-specific compliance requirements (UFLPA for SE Asia, CPSC for consumer goods, FDA for food/cold chain) |
| **Emotional Job** | Eliminate the fear of missing a deadline or document. Feel confident that compliance is handled, even for unfamiliar product categories or origins. |
| **Social Job** | Demonstrate professionalism and regulatory knowledge to clients and customs officials. A clean compliance record means fewer exams and faster clearance (C-TPAT benefits). |
| **Current Solutions** | Customs broker handles most compliance (but charges per entry), Maria's color-coded deadline spreadsheet, CBP's ACE portal for filing, general knowledge from years of experience |
| **Success Criteria** | Zero missed ISF deadlines (100% filing compliance). Complete document checklist per shipment. Automatic reminders 72h, 48h, and 24h before each deadline. Country-of-origin specific requirements clearly displayed. |
| **Underserved Needs** | Product-category-specific compliance (textiles vs. food vs. CPG each have different requirements), UFLPA forced labor compliance screening for SE Asia origins, tariff rate change alerts for specific HTS codes, integration with ACE filing workflow |

**Feature Map:**
- Document Checklist per Shipment (P3)
- Deadline Tracking with Alerts (P3)
- Knowledge Base / Compliance Guides (P3)
- Country-of-Origin Requirements Matrix (P3)

---

### JTBD 7: Optimize Container Utilization to Reduce Per-Unit Costs

**Job Statement:** "When planning a container shipment of 50,000+ small consumer goods units, I want to calculate exactly how many units fit per container type and what the per-unit freight cost will be, so I can optimize order quantities and minimize cost per unit."

| Dimension | Detail |
|-----------|--------|
| **Functional Job** | For a given product (dimensions, weight, packaging type) and container type (20ft, 40ft, 40ft HC, reefer), calculate: maximum units per container (by volume AND weight — use the lower number), palletization pattern, cubic utilization percentage, weight utilization percentage, cost per unit at different order quantities, break-even order quantity for container economics |
| **Emotional Job** | Feel confident that the container is optimally loaded. Avoid the frustration of paying for a full container that is only 60% utilized. |
| **Social Job** | Demonstrate logistics expertise to clients and suppliers. "I can get 52,000 units per 40ft HC at $0.09 per unit freight" is a powerful statement. |
| **Current Solutions** | Supplier's estimate (often inaccurate), freight forwarder's rough calculation, specialized container loading software (expensive), trial and error |
| **Success Criteria** | Accurate unit count within 5% of actual loading. Both volume and weight constraints considered. Multiple container type comparison. Clear recommendation on optimal container type. Cost-per-unit at different order quantities. |
| **Underserved Needs** | Mixed-product container optimization (e.g., apparel + CPG in one container), reefer container capacity adjustments (internal dimensions differ from dry containers), palletization pattern visualization, weight distribution requirements for ocean shipping |

**Feature Map:**
- Container Utilization Calculator (P2)
- Multi-Product Container Optimizer (P3)
- Cost-per-Unit Scaling Chart (P2)
- Container Type Comparison (P2)

---

### JTBD Summary Matrix

| JTBD | Primary Persona | Frequency | Current Satisfaction | Platform Priority |
|------|----------------|-----------|---------------------|-------------------|
| Calculate true landed cost | Blake, David | Every shipment (daily-weekly) | LOW — missing 15-25% of costs | **P0** |
| Compare carrier options | Blake | 3-5x per week | LOW — takes 2-4 hours each | **P1** |
| Evaluate FTZ savings | Blake, David | Monthly-quarterly | VERY LOW — no tool exists | **P1** |
| Generate professional proposals | Blake | 3-5x per week | LOW — Excel/email only | **P2** |
| Track shipments across carriers | Blake, Maria | Daily | MEDIUM — multiple portals work but slowly | **P1** |
| Comply with customs requirements | Maria | Every shipment | MEDIUM — customs broker handles but expensive | **P3** |
| Optimize container utilization | Blake, David | Per order (weekly-monthly) | MEDIUM — rough estimates work | **P2** |

---

## 5. Sources

### Industry Market Data
- [FreightWaves: How freight brokers can succeed in 2026](https://www.freightwaves.com/news/how-freight-brokers-can-succeed-in-2026-a-strategic-guide-to-resilience)
- [SkyQuest: Freight Brokerage Market Analysis 2026-2033](https://www.skyquestt.com/report/freight-brokerage-market)
- [Mordor Intelligence: US Freight Brokerage Market](https://www.mordorintelligence.com/industry-reports/united-states-freight-brokerage-market)
- [Verified Market Research: Freight Broker Software Market](https://www.verifiedmarketresearch.com/product/freight-broker-software-market/)
- [GM Insights: Digital Freight Brokerage Market](https://www.gminsights.com/industry-analysis/digital-freight-brokerage-market)
- [Freight Caviar: The $160B Freight Brokerage Industry](https://www.freightcaviar.com/freight-broker-statistics/)

### Cold Chain & Lineage Logistics
- [Grand View Research: Cold Chain Market](https://www.grandviewresearch.com/industry-analysis/cold-chain-market)
- [Mordor Intelligence: US Cold Chain Logistics](https://www.mordorintelligence.com/industry-reports/united-states-cold-chain-logistics-market)
- [Precedence Research: Cold Chain Logistics Market](https://www.precedenceresearch.com/cold-chain-logistics-market)
- [Lineage Wikipedia](https://en.wikipedia.org/wiki/Lineage_(company))
- [Verified Market Research: Top Cold Chain Companies](https://www.verifiedmarketresearch.com/blog/top-cold-chain-logistics-companies/)

### SE Asia Trade & Imports
- [USTR: ASEAN Trade](https://ustr.gov/countries-regions/southeast-asia-pacific/association-southeast-asian-nations-asean)
- [Census.gov: Trade in Goods with Asia](https://www.census.gov/foreign-trade/balance/c0016.html)
- [McKinsey: Geopolitics and Global Trade 2026](https://www.mckinsey.com/mgi/our-research/geopolitics-and-the-geometry-of-global-trade-2026-update)
- [East Asia Forum: US-SE Asia Trade Uncertainty](https://eastasiaforum.org/2026/01/14/spectre-of-uncertainty-haunts-us-southeast-asia-trade/)
- [CSIS: US-SE Asia Trade Relations](https://www.csis.org/analysis/us-southeast-asia-trade-relations-age-disruption)

### FTZ Data
- [Logistics Viewpoints: FTZs in Today's Trade Policy](https://logisticsviewpoints.com/2025/12/11/foreign-trade-zones-in-todays-trade-policy-environment/)
- [Logistics Management: FTZs in 2025](https://www.logisticsmgmt.com/article/u.s_foreign_trade_zones_in_2025_how_new_tariffs_and_proclamations_are_changing_the_playbook)
- [Descartes: FTZs as Strategic Advantage 2025](https://www.descartes.com/resources/knowledge-center/five-reasons-foreign-trade-zones-ftz-are-strategic-advantage-2025)
- [NAFTZ: Basics & Benefits](https://www.naftz.org/basics-benefits/)
- [trade.gov: About FTZs](https://www.trade.gov/about-ftzs)

### Logistics Software & Pain Points
- [GoFreight: CargoWise Alternatives 2026](https://gofreight.com/blog/cargowise-alternative)
- [NewAge Global: Logistics Pain Points](https://www.newage-global.com/blog/what-are-the-biggest-pain-points-in-the-logistics-industry)
- [Aljex: TMS Software Cost Guide](https://www.aljex.com/news/tms-software-cost/)
- [Denim Blog: Best TMS for Brokers 2025](https://www.denim.com/blog/best-tms-software-for-brokers)
- [tech.co: Logistics Report 2025](https://tech.co/logistics/logistics-report-2025)
- [S&P Global: Logistics Digital Transformation Survey](https://www.spglobal.com/market-intelligence/en/news-insights/research/logistics-sector-prioritizes-digital-transformation-but-needs-technology-leadership-skills)
- [FreightWaves: Freight Industry Lags in Tech Adoption](https://www.freightwaves.com/news/freight-industry-still-lags-in-technology-adoption)

### DTC / E-Commerce Import Market
- [Business Research Insights: DTC Market](https://www.businessresearchinsights.com/market-reports/direct-to-customer-dtc-market-120420)
- [Passport: 2025 Global Ecommerce Shift](https://passportglobal.com/blog/inside-the-2025-global-ecommerce-shift-how-dtc-brands-are-navigating-tariffs-rethinking-fulfillment-investing-in-advertising-and-protecting-profitability/)
- [inBeat: DTC Brand Statistics 2025](https://inbeat.agency/blog/direct-to-consumer-dtc-brand-statistics-trends)

### Landed Cost & HTS Tools
- [Zonos: Duties and Taxes Calculator](https://zonos.com/cross-border-ecommerce-tools-calculators/duties-and-taxes-calculator)
- [iCustoms: Landed Cost Calculator](https://www.icustoms.ai/landed-cost-calculator/)
- [DHL MyGTS](https://www.dhl.com/global-en/microsites/express/mygts.html)
- [USITC: Harmonized Tariff Schedule](https://hts.usitc.gov/)
- [Descartes CustomsInfo](https://www.customsinfo.com/)

### Small Business Export/Import Data
- [SBA: Small Business Exports Issue Brief](https://advocacy.sba.gov/wp-content/uploads/2024/03/Issue-Brief-No.-19-Small-Business-Exports.pdf)
- [US Chamber: Growing Small Business Exports](https://www.uschamber.com/technology/growing-small-business-exports)
- [Census: Demographic Profile of Exporting Firms](https://www.census.gov/library/stories/2021/11/who-are-the-owners-of-exporting-firms.html)
- [EXIM: State of Small Business Technology Adoption](https://grow.exim.gov/blog/the-state-of-small-business-technology-adoption)

### Costa Rica / Central America
- [Coyol FZ: Nearshoring Trends 2025](https://coyolfz.com/nearshoring-trends-2025-how-costa-rica-leads-logistics-innovation-in-latin-america/)
- [Aconisa: Trade and Logistics in Central America 2025](https://www.aconisa.com.ni/en/blog/logistics-industry-data-for-central-america-2025)
- [Atlantic Council: Secure Supply Chains](https://www.atlanticcouncil.org/in-depth-research-reports/issue-brief/secure-supply-chains-for-the-us-run-through-its-closest-neighbors/)

### Flexport / Freightos Comparison
- [Capterra: Freightos vs Flexport 2025](https://www.capterra.com/freight-software/compare/159808-155657/Flexport-vs-Freightos)
- [Contrary Research: Flexport Business Breakdown](https://research.contrary.com/company/flexport)
- [Freightos: Flexport vs Freightos](https://www.freightos.com/should-i-ship-with-freightos-or-flexport/)

---

*Research completed: 2026-03-26*
*Total data sources consulted: 40+*
*Confidence level: HIGH*
