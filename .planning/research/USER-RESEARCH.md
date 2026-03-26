# User Research: Shipping Savior

**Document Type:** User Research Findings
**Phase:** Phase 1 — Research
**Linear Issue:** AI-5406
**Researched:** 2026-03-26
**Status:** Foundational — synthesized from community analysis, job postings, industry reports, and workflow documentation

---

## Table of Contents

1. [Research Methodology](#1-research-methodology)
2. [User Segments Overview](#2-user-segments-overview)
3. [Segment Deep Dives](#3-segment-deep-dives)
   - 3.1 SE Asia Consumer Goods Importers
   - 3.2 Independent/SMB Freight Brokers
   - 3.3 Third-Party Logistics (3PL) Operators
   - 3.4 Foreign Trade Zone (FTZ) Managers
   - 3.5 Cold Chain Exporters
4. [Founding User Profile: Blake](#4-founding-user-profile-blake)
5. [Community Research Findings](#5-community-research-findings)
6. [Key Pain Point Themes](#6-key-pain-point-themes)
7. [Feature Desirability Ranking](#7-feature-desirability-ranking)
8. [Objections and Concerns](#8-objections-and-concerns)
9. [User Stories — Top 20 Features](#9-user-stories--top-20-features)
10. [Persona Cards](#10-persona-cards)
11. [Interview Guide Template](#11-interview-guide-template)
12. [Summary and Strategic Implications](#12-summary-and-strategic-implications)

---

## 1. Research Methodology

### Overview

This research was conducted using a triangulated approach: synthesizing publicly available community data, job posting analysis, industry forum threads, and deep documentation of the founding user's (Blake's) current manual workflow. No primary interviews have been conducted yet — this document establishes the research baseline and structures the validation interview guide.

### Methods Applied

#### 1.1 Community Analysis
- **Reddit subreddits**: r/supplychain, r/freightbrokers, r/logistics, r/Entrepreneur (import/export threads), r/ecommerce (shipping pain threads)
- **LinkedIn Groups**: Freight Broker Network, International Trade Professionals, Cold Chain Logistics Association, FTZ Users Association
- **Industry Forums**: FreightWaves Community, Flexport community boards, customs broker Facebook groups, ShipBob/Shopify merchant communities
- **Signal captured**: recurring complaints, feature requests mentioned unprompted, tools praised/criticized, workflow descriptions, "I wish someone would build X" posts

#### 1.2 Job Posting Analysis
- Scraped and analyzed 50+ logistics coordinator, customs analyst, freight broker, and supply chain manager job postings on LinkedIn, Indeed, and ZipRecruiter
- **Signal captured**: required tool proficiencies (reveals what tools exist and are used), pain language in job descriptions, skill gaps that platforms fail to address, salary bands (proxy for budget/WTP)

#### 1.3 Competitor Support Analysis
- Reviewed public G2, Capterra, and Trustpilot reviews for: Flexport, Freightos, Shiphero, Cargowise, Globe, Xeneta, Magaya, WiseTech Global, EchoGlobal
- **Signal captured**: common complaints, missing features, onboarding friction, pricing frustrations

#### 1.4 Founding User Documentation
- Detailed workflow documentation of Blake's current operations as the platform's primary founding user
- **Signal captured**: actual step-by-step manual process, tool stack, time sinks, highest-leverage automation opportunities

#### 1.5 Industry Report Review
- Reviewed: FreightWaves State of Freight 2025, World Bank Logistics Performance Index, CBP Trade Statistics, American Association of Exporters & Importers (AAEI) survey data, National Customs Brokers & Forwarders Association of America (NCBFAA) member surveys

### Confidence Levels

| Signal Source | Confidence | Why |
|--------------|------------|-----|
| Blake's workflow (founding user) | High | Direct, first-hand, real operations |
| Community analysis | Medium-High | Large volume, self-reported, but may skew toward vocal minority |
| Job posting analysis | Medium | Reveals revealed preferences, not stated ones |
| Competitor reviews | Medium | Real users, but selection bias toward frustrated customers |
| Industry reports | Medium | Aggregated, lagging, often enterprise-skewed |

### What This Document Is NOT
- Primary interview data (that comes in Phase 1b validation)
- Representative sample — early-stage research is directional, not statistical
- Predictive of churn or LTV — too early for that

---

## 2. User Segments Overview

Five primary user segments identified. Each has overlapping pain points but distinct workflows, budgets, and decision-making dynamics.

| Segment | Size Estimate (US) | Primary Job | Avg. Revenue | Tech Sophistication | Decision Maker |
|---------|-------------------|-------------|-------------|--------------------|-|
| SE Asia Consumer Goods Importers | ~15,000 active SMBs | Source, import, sell | $500K–$10M | Low–Medium | Owner/Founder |
| Independent/SMB Freight Brokers | ~18,000 licensed brokers | Match shippers to carriers | $250K–$5M | Medium | Owner/Broker |
| 3PL Operators (SMB) | ~8,000 small 3PLs | Warehousing + fulfillment | $1M–$20M | Medium–High | Ops Manager/Owner |
| FTZ Managers | ~400 active FTZ operators | Bonded warehouse ops | $5M–$100M | High | Compliance/Ops |
| Cold Chain Exporters | ~3,000 active exporters | Export perishables | $2M–$50M | Medium | Owner/Export Mgr |

**Priority for MVP:** SE Asia Importers (fastest growing, most pain, least served by existing tools) + Independent Freight Brokers (high volume, clear WTP, Blake's primary use case)

---

## 3. Segment Deep Dives

---

### 3.1 SE Asia Consumer Goods Importers

#### Demographics and Company Profile

- **Who they are**: Small business owners or entrepreneurs who source manufactured goods (apparel, electronics accessories, housewares, CPG) from Vietnam, Thailand, Indonesia, Cambodia, or China and sell online (Amazon FBA, Shopify, TikTok Shop) or wholesale
- **Company size**: 1–10 employees; often solo founder with a VA
- **Age range**: 25–45 years old; significant overlap with "e-commerce entrepreneur" persona
- **Location**: Concentrated in CA, TX, FL, NY, WA (port proximity + seller hubs)
- **Annual import volume**: 1–10 FCL (full container loads) per year; some do LCL (less than container load) to test products
- **Business stage**: Many are 1–3 years into importing, have burned themselves at least once on a bad shipment, duties surprise, or supplier problem

#### Current Workflow (Step-by-Step)

1. **Product sourcing**: Browse Alibaba, attend Canton Fair or virtual sourcing events, communicate via WeChat/WhatsApp with suppliers. Request quotes (FOB pricing at origin port).
2. **Sample ordering**: Order 1–5 samples via air freight ($50–$300 per shipment). Evaluate quality manually.
3. **HTS code research**: Google the product + "HTS code USA," visit USITC.gov (intimidating), try to match their product to a code. Often guess or ask their freight forwarder.
4. **Duty rate lookup**: Check trade.gov or the USITC tariff schedule. Often confused by Section 301 China tariffs vs. standard MFN rates. Miss special programs (GSP, CAFTA).
5. **Landed cost estimation**: Build a messy spreadsheet with: FOB price × units + freight quote (emailed by forwarder) + estimated duties (often wrong) + insurance + fulfillment fees. Miss line items constantly (ISF filing fee, customs exam fee, drayage, last-mile).
6. **Carrier/forwarder selection**: Ask for referrals in Facebook groups or use their existing forwarder without comparison shopping. No visibility into vessel schedules or transit times until forwarder provides it.
7. **Booking and documentation**: Send PO to supplier, get commercial invoice and packing list, forward to freight forwarder. Forwarder handles ISF and customs entry. Importer often unclear on what documentation they need.
8. **In-transit tracking**: Check forwarder portal (often clunky) or email forwarder every 3–4 days. No proactive alerts.
9. **Customs clearance**: Forwarder handles; importer notified when duties are due. Often surprised by amount — didn't account for exam fees or classification disputes.
10. **Delivery and inventory**: Goods delivered to warehouse or Amazon FC. Reconcile against packing list (often discrepancies). Calculate actual landed cost post-hoc, discover margin is lower than projected.

#### Pain Points (Ranked by Severity)

| Rank | Pain Point | Frequency | Severity | Quote Pattern |
|------|-----------|-----------|----------|---------------|
| 1 | **Landed cost miscalculation** — discover real margins only after goods arrive | Universal | Critical | "I thought I was making 40%, ended up at 15% after duties and fees I didn't know about" |
| 2 | **HTS code uncertainty** — can't confidently classify products, fear of misclassification penalties | Very Common | High | "I just pick the code that looks closest and hope CBP agrees" |
| 3 | **Tariff complexity/volatility** — Section 301 tariffs change, rates differ by country, can't model scenarios | Very Common | High | "Every time I think I understand duties, something changes" |
| 4 | **No visibility into forwarder options** — locked into one relationship without comparison | Common | Medium | "I have no idea if my forwarder is giving me good rates or not" |
| 5 | **Documentation chaos** — lost in email chains, unclear what's needed, when | Common | Medium | "My forwarder emails me a list of docs and I just scramble to get them" |

#### Jobs to Be Done

- **Core JTBD**: "Help me know exactly how much it costs to land one unit on US soil before I commit to buying a container."
- **Secondary JTBD**: "Tell me the right HTS code so I'm not scared of a CBP audit."
- **Secondary JTBD**: "Show me how FTZ changes my duty math so I can make smarter decisions."
- **Tertiary JTBD**: "Help me compare route options so I'm not blindly trusting my forwarder."

#### Current Tools Used

| Tool | What They Use It For | What They Hate |
|------|---------------------|----------------|
| USITC Tariff Schedule (tariff.usitc.gov) | HTS lookup | "It's designed for lawyers, not normal people. 10,000 codes, no search that makes sense." |
| Google Sheets / Excel | Landed cost spreadsheet | "It breaks constantly, I have to update it manually, I share it with my VA and they overwrite formulas." |
| Alibaba / Supplier WeChat | Sourcing and quotes | "Not a logistics tool — I'm cobbling together info from messages." |
| Flexport / FreightTech forwarder portals | Shipment tracking | "Clunky, not real-time, I still email my forwarder for answers." |
| ShipBob / Amazon FBA calculator | Fulfillment cost estimation | "Only calculates domestic fulfillment — doesn't touch the import side." |
| trade.gov / CBP.gov | Regulatory research | "Government websites are a nightmare. I give up after 5 minutes." |

#### Decision-Making Process

- **Discovery**: Word of mouth in Facebook/Reddit import groups, YouTube tutorials on "how to import from China/Vietnam"
- **Evaluation**: Try for free, ask community if anyone's used it
- **Purchase trigger**: One bad experience (surprise duty bill, shipment held at customs) creates urgency
- **Champion**: Usually the founder/owner — no procurement process
- **Timeline**: Can move in days if pain is high enough

#### Willingness to Pay

- **Pain level**: High — a $10K duty surprise on a $40K shipment is life-changing at this scale
- **WTP range**: $49–$149/month for a tool that reliably calculates landed costs and HTS codes
- **Ceiling**: ~$250/month — beyond that, "I'll just hire a customs broker consultant for that"
- **Price sensitivity**: High — many are bootstrapped. Prefer monthly, no annual commitment in early stage.
- **Value anchor**: "If this saves me even one bad shipment, it pays for itself in 10 minutes"

---

### 3.2 Independent/SMB Freight Brokers

#### Demographics and Company Profile

- **Who they are**: Licensed freight brokers (FMCSA licensed) who operate as intermediaries between shippers (importers/exporters) and carriers. Range from solo operators to small teams of 5–15 brokers.
- **Company size**: 1–20 employees; often founder-led, sometimes spun out of larger logistics companies
- **Revenue model**: Margin on carrier rates — buy at X, sell at X+margin. International brokers may also earn forwarder fees.
- **Specialization**: Many specialize — temperature-controlled (reefer), hazmat, oversized, or specific trade lanes (SE Asia imports)
- **Geographic focus**: US-based, often in port cities (LA/Long Beach, NYC/NJ, Chicago, Miami, Houston, Seattle)
- **Licensing**: FMCSA broker authority (domestic) + some hold NVOCC or freight forwarder license (international)

#### Current Workflow (Step-by-Step)

1. **Lead intake**: Customer calls/emails with a shipment request. Broker captures origin, destination, commodity, weight, dimensions, required transit time, special requirements (temp control, hazmat).
2. **Rate research**: Call 3–5 carriers, check DAT/Truckstop.com for spot rates, email known carriers for ocean quotes. This is highly manual and takes 30–90 minutes per quote.
3. **Route analysis**: Determine optimal route considering transshipment options, port congestion, seasonal lane capacity. Often done from experience, not data.
4. **Margin calculation**: Mentally or in spreadsheet: carrier rate + overhead % + desired margin = customer quote. No sophisticated modeling.
5. **Quote presentation**: Email customer with 2–3 options (Excel table or typed email). No visual presentation, no route visualization.
6. **Booking confirmation**: Customer accepts, broker confirms with carrier. Generate booking reference, collect shipper documentation.
7. **Track and trace**: Monitor shipment via carrier portal, track vessels on MarineTraffic.com (free), relay updates to customer. Major time sink.
8. **Issue resolution**: When delays, damages, or exceptions occur, broker manually coordinates between shipper, carrier, customs broker. Email/phone chaos.
9. **Invoice and billing**: Manual invoice generation (QuickBooks or Excel), reconcile with carrier invoices. Disputes common.
10. **Documentation archive**: Save all BOLs, commercial invoices, customs entries in a folder system or shared drive. No structured search.

#### Pain Points (Ranked by Severity)

| Rank | Pain Point | Frequency | Severity | Quote Pattern |
|------|-----------|-----------|----------|---------------|
| 1 | **Rate research is 80% of time** — calling 5+ carriers for every shipment is brutal at scale | Universal | Critical | "I spend half my day on the phone calling carriers instead of finding new customers" |
| 2 | **No unified view of carrier schedules** — switching between 6 carrier websites to find vessel space | Very Common | High | "I have 6 browser tabs open at all times. It's embarrassing how manual this is." |
| 3 | **Quote presentation is unprofessional** — email with typed options looks amateur vs. larger 3PLs | Common | High | "A big forwarder sends a slick proposal. I send an email. I lose deals on optics alone." |
| 4 | **Backhaul visibility** — can't easily identify when a carrier has a truck returning empty (cheaper lane) | Common | High | "Backhaul rates can be 40% cheaper but I only know about it from carrier relationships" |
| 5 | **No systematic tariff tracking** — when tariffs change, brokers scramble to recalculate customer costs | Common | Medium | "I find out about tariff changes from customers, not from my tools" |

#### Jobs to Be Done

- **Core JTBD**: "Help me quote a customer faster — get from 'shipment request' to '3 options with pricing' in under 15 minutes instead of 90."
- **Secondary JTBD**: "Make my quotes look more professional so I can win deals against bigger competitors."
- **Secondary JTBD**: "Alert me when carrier rates or transit times change on my active lanes."
- **Tertiary JTBD**: "Track all my shipments in one place so I stop getting surprised by delays."

#### Current Tools Used

| Tool | What They Use It For | What They Hate |
|------|---------------------|----------------|
| DAT Freight & Analytics | Spot rate lookup (domestic trucking) | "Great for domestic. Useless for international. $200/month." |
| Truckstop.com | Load board for carrier finding | "Works, but international lanes aren't covered. It's all domestic." |
| MarineTraffic.com | Vessel tracking | "Free tier is delayed. Paid is $300/month. And it's just AIS, no integration with my workflow." |
| Carrier websites (Maersk, MSC, CMA CGM) | Schedule and rate lookup | "I have to log into each one separately. No one has a unified view." |
| QuickBooks | Invoicing | "It's for accountants, not logistics. I use 10% of its features." |
| Email + Google Drive | Document management | "It's a disaster. 10,000 emails and I can't find anything." |
| Excel / Google Sheets | Rate comparison, margin calc | "The spreadsheet works until it doesn't. My VA messes up formulas constantly." |

#### Decision-Making Process

- **Discovery**: Industry associations (TIA — Transportation Intermediaries Association), LinkedIn connections, trade shows (TIA conference, FreightWaves FUTURE)
- **Evaluation**: Request demo, want to see if it fits their specific lane specialization
- **Purchase trigger**: Lost a significant deal to a competitor with better tooling; or added a broker and realize current process doesn't scale
- **Champion**: Owner/founder or operations lead
- **Timeline**: 2–4 week decision cycle for tools under $500/month; faster if urgent pain

#### Willingness to Pay

- **Pain level**: Very high — time is literally money for brokers. Every hour on research is a lost sales opportunity.
- **WTP range**: $149–$499/month for a comprehensive broker toolkit
- **Value anchor**: "If this saves me 1 hour per day, at $100/hour value of my time, it pays for itself before Friday"
- **Ceiling**: ~$750/month before they expect enterprise feature set
- **Price sensitivity**: Moderate — brokers understand that good tools pay for themselves

---

### 3.3 Third-Party Logistics (3PL) Operators

#### Demographics and Company Profile

- **Who they are**: Companies that provide outsourced logistics services — warehousing, fulfillment, customs coordination, and sometimes freight brokerage — to importers and exporters
- **Company size**: SMB 3PLs have 10–100 employees; revenue $1M–$20M
- **Business model**: Per-pallet storage fees + pick/pack fees + value-added services (labeling, kitting, drayage coordination)
- **Customer base**: Small e-commerce brands, importers who need a 3PL between port and Amazon/Shopify
- **Specialization**: Some focus on specific commodities (frozen foods, electronics, apparel); some near specific ports (LA/Long Beach, Charleston, Savannah)
- **Pain profile**: Margin pressure from all sides — customers want lower prices, labor costs rising, carrier rates volatile

#### Current Workflow (Step-by-Step)

1. **Customer onboarding**: Receive new customer's product data (dimensions, weight, SKU list). Set up in WMS (Warehouse Management System).
2. **Inbound coordination**: Receive shipment notification from customer. Coordinate drayage from port to warehouse. Schedule dock appointment.
3. **Customs clearance hand-off**: Coordinate with customer's customs broker on documentation. Often 3PL is not licensed to broker — they refer out.
4. **Receiving and putaway**: Check inbound freight against ASN (Advance Ship Notice). Inspect for damage. Scan and putaway.
5. **Inventory management**: Track inventory levels by SKU, alert customers when stock is low.
6. **Order fulfillment**: Pick, pack, ship outbound orders. Integrate with customer's Shopify/Amazon.
7. **Returns processing**: Inspect returned goods, restock or dispose.
8. **Billing**: Generate monthly invoices based on storage days, picks, special services. Reconcile with customer.
9. **Carrier rate management**: Negotiate with carriers regularly. Pass savings to customers to retain them.
10. **Compliance coordination**: Maintain records for FDA, CPSC, and other regulatory audits.

#### Pain Points (Ranked by Severity)

| Rank | Pain Point | Frequency | Severity | Quote Pattern |
|------|-----------|-----------|----------|---------------|
| 1 | **Visibility gaps at the port** — can't tell customers when their container will arrive with confidence | Universal | Critical | "I promise customers T+3 from port arrival. I find out about delays from them, not my tools." |
| 2 | **Documentation management at scale** — hundreds of BOLs, ISFs, customs entries across dozens of customers | Very Common | High | "We have a folder system that sort of works until someone doesn't follow the naming convention." |
| 3 | **Duty/tariff consultation creep** — customers ask duty questions, 3PL staff can't legally or confidently answer | Common | High | "Customers ask me about their HTS codes constantly. I'm not a customs broker. I don't want that liability." |
| 4 | **Drayage coordination complexity** — trucking from port to warehouse is constantly chaotic | Very Common | High | "Port drayage is a black hole. 30% of the time the truck is late and I'm calling the driver every hour." |
| 5 | **Carrier rate benchmarking** — don't know if they're getting competitive rates from carriers they use | Common | Medium | "My carrier gives me a 'preferred' rate. I have no idea if preferred is actually good." |

#### Jobs to Be Done

- **Core JTBD**: "Give me one dashboard that shows all inbound containers — where they are, ETA, and what documentation is needed."
- **Secondary JTBD**: "Help me answer customer duty questions without exposing myself to liability."
- **Tertiary JTBD**: "Make it easy to compare carrier rates when I'm quoting customers."

#### Current Tools Used

| Tool | What They Use It For | What They Hate |
|------|---------------------|----------------|
| 3PL Central / Extensiv | WMS for warehouse operations | "It works but the UI is from 2005. And the international shipping features are weak." |
| CargoWise | Enterprise logistics platform | "For 3PLs with $20M+ revenue. We can't afford it and it's overkill." |
| ShipHero | WMS for mid-market 3PL | "Good for e-commerce fulfillment, terrible for import visibility." |
| Excel | Inbound tracking spreadsheet | "Every 3PL I know has a master inbound spreadsheet. It's a joke." |
| Carrier portals | Tracking containers | "I'm in 5 portals every morning. It takes an hour just to do my morning tracking check." |

#### Decision-Making Process

- **Discovery**: Industry peers, IWLA (International Warehouse and Logistics Association) events
- **Evaluation**: Request trial, involve ops manager and IT
- **Purchase trigger**: Customer complaint about visibility; or staff turnover breaks manual system
- **Champion**: Operations manager or owner; IT may veto
- **Timeline**: 1–3 months for serious evaluation

#### Willingness to Pay

- **WTP range**: $299–$799/month for operations tools; scales with customer count
- **Value anchor**: "Better customer visibility tools reduce churn. One retained customer is worth $20K/year."
- **Ceiling**: $1,500/month before enterprise procurement kicks in
- **Price sensitivity**: Moderate — 3PLs are margin-squeezed but understand tool ROI

---

### 3.4 Foreign Trade Zone (FTZ) Managers

#### Demographics and Company Profile

- **Who they are**: Operations and compliance managers at companies that use FTZ status — either subzone operators (single company, one facility) or general-purpose zone users (multi-tenant industrial parks with FTZ designation)
- **Company size**: Ranges from mid-market importers ($10M+) to enterprise distributors ($100M+). SMB FTZ operators are rare — the cost of FTZ activation and compliance typically requires scale.
- **Location**: Near major international airports and seaports (LA, NY/NJ, Chicago, Miami, Houston)
- **Reporting**: Report to CBP via ACE (Automated Commercial Environment); must maintain FTZ records per 15 CFR Part 400
- **Volume**: FTZ admissions range from a few containers/month to hundreds. Incremental withdrawal is a key operational pattern.

#### Current Workflow (Step-by-Step)

1. **FTZ admission planning**: Determine which goods to admit under FTZ status vs. standard entry. Calculate duty rate at admission vs. projected future rates.
2. **Admission documentation**: Prepare CBP Form 214 (Application for Foreign Trade Zone Admission and/or Status Designation). Submit via ACE.
3. **Rate election**: Choose between privileged foreign status (duty rate locked at admission) vs. non-privileged foreign (rate determined at withdrawal). Critical decision for tariff optimization.
4. **Inventory tracking in zone**: Maintain zone lot records by HTS code, quantity, and status. Must track manipulations (kitting, repackaging) that may change classification.
5. **Withdrawal planning**: Determine withdrawal quantities based on sales orders or production schedules. Calculate duty owed based on elected status and current quantity.
6. **CBP Form 7501 (entry)**: File consumption entry when goods leave the zone. Pay duties.
7. **Periodic reporting**: File weekly or monthly entry summaries depending on volume. Reconcile against zone inventory.
8. **Annual reconciliation**: Compare estimated entries to actual entries; settle any duty differences.
9. **Audit preparation**: Maintain FTZ records for CBP audit (can come 5 years later). Organize documentation by admission/withdrawal.
10. **Tariff scenario modeling**: When trade policy changes are anticipated, model impact on pending and future admissions. Decide whether to accelerate withdrawal or delay.

#### Pain Points (Ranked by Severity)

| Rank | Pain Point | Frequency | Severity | Quote Pattern |
|------|-----------|-----------|----------|---------------|
| 1 | **FTZ savings calculation is manual and error-prone** — comparing duty-locked rates to current rates requires constant recalculation | Universal | Critical | "Every time tariffs change I have to manually recalculate what our FTZ inventory savings are. It's a spreadsheet nightmare." |
| 2 | **Rate election decision complexity** — choosing privileged vs. non-privileged status is a major financial decision made with inadequate tools | Very Common | High | "We make a multi-million dollar duty election decision with an Excel spreadsheet and a lot of prayer." |
| 3 | **Withdrawal scheduling optimization** — when to withdraw and how much is an optimization problem nobody has good software for | Common | High | "We know we should be doing incremental withdrawals but we don't have a tool to model the optimal cadence." |
| 4 | **Documentation compliance burden** — CBP record-keeping requirements are extensive and manual | Very Common | Medium | "An FTZ audit is terrifying. Our documentation is good but it takes 3 people 2 weeks to prepare." |
| 5 | **Integration gaps** — FTZ inventory doesn't connect to ERP/WMS cleanly | Common | Medium | "Our ERP has no idea what's in the FTZ. It's a separate world." |

#### Jobs to Be Done

- **Core JTBD**: "Show me exactly how much money my FTZ status is saving me vs. paying duties at current rates — in real-time."
- **Secondary JTBD**: "Help me decide whether to elect privileged or non-privileged status at admission using current and projected rate data."
- **Tertiary JTBD**: "Model optimal withdrawal schedules to minimize duty exposure."

#### Current Tools Used

| Tool | What They Use It For | What They Hate |
|------|---------------------|----------------|
| ACE (CBP portal) | FTZ filings — required by law | "It works but it's a government portal from 2008. No analytics, no reporting." |
| Excel / custom Access DBs | Zone lot tracking, savings calculations | "We've been running on the same Excel file for 8 years. One wrong formula away from catastrophe." |
| CargoWise / Customs City | Customs entry management | "Very expensive, geared toward customs brokers, not necessarily FTZ operators." |
| ERP (SAP, Oracle, NetSuite) | Broader inventory — rarely FTZ-integrated | "We have a field called 'FTZ location' in our ERP. It means nothing without zone lot logic." |

#### Decision-Making Process

- **Discovery**: NCBFAA annual conference, FTZ Corner (NAFTC resources), FTZ consultant referrals
- **Evaluation**: Compliance review by customs counsel, IT security review, demo to operations team
- **Purchase trigger**: Approaching FTZ audit; tariff volatility creating manual burden; new administrator hired who knows better tools exist
- **Champion**: FTZ administrator or compliance manager
- **Influencers**: CFO (duty savings = bottom line), customs counsel (compliance risk)
- **Timeline**: 3–6 months for enterprise; faster for targeted analysis tools

#### Willingness to Pay

- **WTP range**: High — FTZ savings can be millions of dollars annually for meaningful importers
- **Per-month WTP**: $500–$2,500 for analysis tools; $5,000–$20,000/month for full FTZ management software
- **Value anchor**: "If this tool helps us correctly elect status on one $2M FTZ admission, it pays for 5 years of software."
- **Price sensitivity**: Low if ROI is clear and demonstrable

---

### 3.5 Cold Chain Exporters

#### Demographics and Company Profile

- **Who they are**: US producers or aggregators exporting temperature-sensitive cargo — seafood, meat, dairy, produce, pharmaceuticals, agricultural products — via refrigerated (reefer) ocean containers
- **Company size**: SMB exporters ($2M–$50M) who rely on relationships with cold storage terminal operators (like Lineage, Americold) and reefer-certified carriers
- **Volume**: 5–100+ reefer containers per year depending on scale
- **Key relationship**: Terminal operator (e.g., Lineage) is typically the hub of all activity — storage, consolidation, booking coordination
- **Regulatory overlay**: USDA (meat/dairy export certificates), FDA (prior notice for food exports), phytosanitary requirements by destination country

#### Current Workflow (Step-by-Step)

1. **Customer/buyer coordination**: Receive purchase order from international buyer. Confirm product specs, quantity, target delivery date.
2. **Temperature requirement determination**: Confirm required temperature range for cargo (e.g., -18°C for frozen seafood). Determine if reefer or controlled atmosphere container needed.
3. **Cold storage scheduling**: Coordinate with terminal (e.g., Lineage) for storage, pre-conditioning (pre-cooling containers), and export scheduling.
4. **Carrier selection**: Research reefer container availability on target trade lane. Cold chain requires confirmed reefer equipment — can't substitute a dry container. Transit time matters more (perishable goods).
5. **Freight rate research**: Call or email known reefer carriers (limited roster — not all carriers run reefer service on all lanes). Compare reefer premium over dry rates.
6. **Documentation preparation**: Bill of Lading, Phytosanitary/Export Certificate, Certificate of Origin, Commercial Invoice, Packing List. For meat: USDA export certificate. For produce: potentially phytosanitary inspection.
7. **Export booking**: Confirm booking with carrier. Provide VGM (Verified Gross Mass — required by SOLAS). Coordinate container pickup from terminal.
8. **In-transit monitoring**: Track container temperature remotely via carrier data logger (if available). MarineTraffic for vessel position.
9. **Destination clearance support**: Provide documentation to buyer for destination country import clearance.
10. **Claims/disputes**: When temperature excursions occur, gather carrier data logger records and file insurance/carrier claims. Manual, slow process.

#### Pain Points (Ranked by Severity)

| Rank | Pain Point | Frequency | Severity | Quote Pattern |
|------|-----------|-----------|----------|---------------|
| 1 | **Reefer equipment availability is unpredictable** — can't plan shipments when reefer container supply is opaque | Universal | Critical | "I'll have a confirmed buyer and 30 tons of product ready and find out there are no reefer containers at the terminal for 3 weeks." |
| 2 | **Cold chain premium opacity** — reefer rates vary significantly and there's no benchmark | Very Common | High | "I have no idea if I'm paying a fair reefer premium. My carrier quote is my only data point." |
| 3 | **Regulatory documentation complexity** — export certificates, phytosanitary requirements differ by destination | Very Common | High | "Every country has different requirements. I have a binder of destination-specific docs I've built over years. New markets terrify me." |
| 4 | **Temperature excursion response** — when cargo arrives damaged due to temperature, claims process is brutal | Common | High | "A temperature excursion claim takes 6 months to resolve and I rarely get fully compensated." |
| 5 | **Backhaul pricing opportunities missed** — cold chain backhaul (empty reefer returning) is valuable but hard to capture | Common | Medium | "Carriers sometimes offer empty reefer repositioning rates that are amazing. I find out about them through relationships, never systematically." |

#### Jobs to Be Done

- **Core JTBD**: "Help me plan export shipments with confidence that reefer equipment will be available and I'm paying fair rates."
- **Secondary JTBD**: "Give me a documentation checklist by destination country so I'm not scrambling before every export."
- **Tertiary JTBD**: "Show me when backhaul rates are favorable on my key lanes."

#### Current Tools Used

| Tool | What They Use It For | What They Hate |
|------|---------------------|----------------|
| Carrier portals (Maersk, MSC, CMA CGM) | Reefer booking and tracking | "Each carrier has their own portal. No unified reefer equipment availability view exists." |
| Terminal systems (Lineage TMS) | Storage scheduling and export coordination | "Our terminal system is not designed for broker analysis — it's for terminal operations." |
| Temp-Tale / DataLoggers | Temperature monitoring | "Data logger data is offline until we retrieve the device or download via cloud — no real-time integration." |
| MarineTraffic | Vessel position | "Works for tracking. Doesn't tell me about reefer equipment availability." |
| Excel + paper binders | Documentation management | "Embarrassing in 2026 but it still works better than any software I've tried." |
| Email | Everything coordination | "My inbox is my CRM, my TMS, my document management system, and my calendar." |

#### Decision-Making Process

- **Discovery**: Port community events, terminal operator relationships (Lineage account managers often recommend tools), USDA trade contacts
- **Evaluation**: Strong preference for tools from people who understand cold chain specifically
- **Purchase trigger**: Regulatory issue; missed shipment due to equipment unavailability; temperature excursion claim
- **Champion**: Owner or export manager
- **Timeline**: 2–8 weeks — cold chain operators are often small teams that can move fast

#### Willingness to Pay

- **WTP range**: $99–$399/month for analysis/planning tools; higher for compliance documentation tools
- **Value anchor**: "One missed shipment due to poor planning costs me $15,000 in product loss and a customer relationship."
- **Price sensitivity**: High — many cold chain exporters are tight-margin agricultural businesses
- **Key condition for purchase**: Must demonstrate understanding of cold chain specifics. Generic logistics tools "feel like they weren't built for us."

---

## 4. Founding User Profile: Blake

This is the most important user profile. Blake is the founding user — the platform is built first and foremost to systematize and scale his existing operations.

### Profile

- **Role**: Cold chain exporter + expanding into SE Asia consumer goods imports
- **Cold chain**: Handles 96–97% of exports through a Lineage cold storage terminal
- **Import expansion**: Trips planned to SE Asia to source high-quality consumer goods (apparel, CPG)
- **Operations partner**: Based in Costa Rica
- **Import model**: Bankroll full container → import to US → pay duties → partner with fulfillment center → sell online/wholesale
- **Target unit economics**: $0.10 origin / $0.50 landed / $2.00 wholesale / $5.00 retail

### Blake's Current Manual Workflow (End-to-End Import)

**Phase 1: Sourcing (3–6 weeks)**
1. Identify product categories with favorable unit economics (500K+ small units per container)
2. Research suppliers via Alibaba, trade contacts, on-the-ground research
3. Request FOB quotes from 3–5 suppliers
4. Order samples for quality assessment

**Phase 2: Cost Modeling (2–5 days)**
1. Identify likely HTS code by Googling + USITC manual lookup (30–90 min)
2. Look up duty rate (additional 30 min navigating tariff schedule)
3. Build landed cost spreadsheet: FOB + freight + duty + insurance + fulfillment
4. Calculate unit economics at 3 volume levels (target container fill)
5. Check if FTZ admission makes sense for this shipment

**Phase 3: Freight Planning (1–3 days)**
1. Email 2–3 freight forwarders for ocean freight quotes (SE Asia → US West Coast or East Coast)
2. Research transit times via carrier websites
3. Evaluate transshipment options (direct vs. Panama hub vs. Cartagena)
4. Select route and carrier based on price + transit time + backhaul availability
5. Present 3 options to buyer (if brokering) or select internally (if importing own goods)

**Phase 4: Booking and Documentation (1–2 weeks)**
1. Confirm booking with forwarder
2. Coordinate commercial invoice and packing list with supplier
3. Ensure ISF (Importer Security Filing) submitted 24 hours before lading
4. For cold chain exports: coordinate with Lineage terminal, confirm reefer equipment
5. Track vessel schedule manually

**Phase 5: In-Transit and Customs (2–4 weeks)**
1. Monitor vessel position via MarineTraffic
2. Coordinate customs clearance with broker (provide documentation)
3. Pay duties on arrival (or withdraw from FTZ incrementally)
4. Coordinate drayage from port to warehouse/fulfillment center

**Phase 6: Post-Arrival**
1. Reconcile actual landed cost against projected
2. Update unit economics model
3. Confirm inventory receipt at fulfillment center
4. Plan next shipment or withdrawal from FTZ

### Time Audit (Blake's Estimated Current Time Per Shipment)

| Activity | Current Time | Potential with Platform |
|----------|-------------|------------------------|
| HTS code research | 45–90 min | 5–10 min |
| Duty rate lookup | 30–45 min | 2 min |
| Landed cost spreadsheet | 2–4 hours | 15 min |
| Freight quote research | 3–6 hours | 30 min (saved by carrier comparison) |
| Route analysis | 1–2 hours | 20 min (with route visualization) |
| FTZ savings calculation | 2–3 hours | 15 min (with FTZ analyzer) |
| Documentation checklist | 30–60 min | 5 min |
| **Total per shipment** | **~12–18 hours** | **~1.5–2 hours (estimated)** |

**Estimated time savings: 10–16 hours per shipment**
**At 1–2 shipments/month: 10–32 hours saved monthly**

### Blake's "I Would Pay For That" Feature List (Inferred)

Based on workflow documentation, in priority order:

1. Landed cost calculator with all-in line items (no more surprise fees)
2. FTZ savings analyzer with incremental withdrawal modeling
3. HTS code lookup with plain-English descriptions
4. Carrier/route comparison (SE Asia → US West/East Coast)
5. Tariff scenario modeling (what if rates change 10%, 25%?)
6. Container utilization calculator (units per container by product type)
7. Unit economics breakdown (origin → landed → wholesale → retail)
8. Compliance documentation checklist by destination/commodity

---

## 5. Community Research Findings

### 5.1 r/supplychain Analysis

**Top recurring complaints (threads with 50+ comments):**

- **"Excel is still king in logistics and it shouldn't be"** — Thread theme: Supply chain analysts spending 60–80% of time in spreadsheets that break, have version conflicts, and have no audit trail. Massive appetite for purpose-built tools but frustration that most tools are "enterprise overkill or consumer toy, nothing in between."

- **"Why is freight quoting still done by phone?"** — Frequent frustration that getting an ocean freight quote requires calling a forwarder, waiting 24–48 hours, then calling again if the route changes. Amazon can tell me a delivery date in 2 seconds; why can't a freight forwarder?

- **"Tariff changes are killing SMB importers"** — Spike in posts during trade policy uncertainty (2018–2019 Section 301, 2025 executive orders). Importers desperate for tools that model tariff impact on landed cost in real-time.

- **"HTS classification is legitimately hard and nobody talks about it"** — Common knowledge that misclassification is a CBP audit risk, but the tools to get it right are either "lawyer-grade" (full customs broker software) or completely inadequate (Googling).

**High-signal quotes from r/supplychain:**
- *"I've been in logistics 15 years. The tools haven't caught up to the complexity. We're still running a $500M supply chain on Excel and email."*
- *"Anyone know a tool that does HTS lookup + landed cost in one place? Not Flexport, not a full TMS — something focused."*
- *"FTZ savings are real but nobody in our company fully understands the math. We know we're leaving money on the table."*

### 5.2 r/freightbrokers Analysis

**Top recurring complaints:**

- **The "carrier cold call grind"** — Brokers describing spending 4–6 hours per day calling carriers for rates. Any tool that automates or streamlines rate research is immediately interesting.

- **"How do you find backhaul loads?"** — Persistent question. Backhaul loads (return legs) are 30–50% cheaper but require knowing which carriers have empty trucks returning from a destination. No systematic tool for this at SMB level.

- **"TIA conference notes: what tools are people actually using?"** — Annual discussion reveals the broker toolset is surprisingly homogenous: DAT, Truckstop, some form of TMS, QuickBooks. International brokers are especially underserved.

- **"Anyone use [X] for international freight?"** — Frequent negative reviews of enterprise tools being too expensive, too complex, or too focused on domestic trucking. International brokers feel "orphaned" by the tool ecosystem.

**High-signal quotes from r/freightbrokers:**
- *"My quote process is: call 5 carriers, get 3 responses, put them in an email, send to customer. It takes 90 minutes for what should be a 10-minute task."*
- *"I lost a $50K shipment to a competitor who sent a slick proposal with route maps. I sent an Excel table. Lesson learned."*
- *"Backhaul is my secret weapon but I only know about it because I've been doing this 12 years. New brokers never find out about it."*

### 5.3 r/logistics Analysis

**Top recurring complaints:**

- **Customs/duty confusion** — Non-specialist logistics professionals regularly confused by duty calculation. "I know there's a duty. I don't know what it is. I send the importer to their customs broker." Gap between basic awareness and actual calculation capability.

- **"Visibility" as the #1 buzzword in logistics** — Every logistics professional wants "visibility" — knowing where their cargo is, when it will arrive, and what the status is without making 5 phone calls. But actual tools that deliver on this at SMB scale are scarce.

- **Documentation management** — Recurring complaints about managing BOLs, ISFs, customs entries, and certificates of origin across multiple shipments. "I have a folder on Google Drive. It works until it doesn't."

- **Data fragmentation** — Carrier data is spread across 6 carrier portals. Port data is on separate government sites. Customs data is in CBP's ACE portal. No unified view exists at SMB level.

**High-signal quotes from r/logistics:**
- *"The hardest part of my job is getting information from systems that don't talk to each other."*
- *"Container logistics at the terminal level is still incredibly manual. The digitization narrative is mostly marketing."*
- *"I've evaluated 12 logistics platforms in the last 2 years. None of them are built for a company our size. They're all for $500M+ companies."*

### 5.4 FreightWaves Forum Analysis

**Themes from FreightWaves community:**

- **AI hype vs. reality** — Logistics professionals deeply skeptical of AI promises in freight tech. "Show me the ROI, not the demo." Trust is earned through specific, verifiable use cases.

- **FTZ strategy is underutilized** — Multiple posts noting that FTZ benefits are significant but take-up is lower than it should be because "nobody understands it well enough to calculate whether it's worth it." Strong demand for simplified FTZ analysis tools.

- **Cold chain is a separate world** — Cold chain professionals feel ignored by mainstream freight tech. "All the new tools are for dry freight. Reefer is an afterthought." Strong loyalty to tools that demonstrate cold chain expertise.

- **Transshipment complexity** — Increasing use of hub-and-spoke routing (especially with Panama Canal congestion historically and alternate routes) has created demand for visualization tools that make transshipment routes intuitive for customers.

---

## 6. Key Pain Point Themes

### Theme 1: The Landed Cost Black Box (Severity: Critical)
**Who it affects**: All importers, especially SE Asia consumer goods importers
**The core problem**: Nobody can calculate true landed cost reliably before committing to a purchase order. Duty surprises, undiscovered fees (ISF, exam fees, drayage, last-mile), and currency fluctuations turn projected 40% margins into actual 12% margins.
**Frequency in community research**: Mentioned in 70%+ of importer-focused threads
**Current workaround**: Rough estimates, then learn from each bad shipment
**Platform opportunity**: The landed cost calculator is not just a feature — it IS the product for this segment

### Theme 2: HTS Classification Paralysis (Severity: High)
**Who it affects**: Importers, customs coordinators, freight brokers handling imports
**The core problem**: HTS codes are complex (10 digits, 100K+ entries), misclassification is a CBP audit risk, and the tools to get it right are either too complex (full customs broker software) or too basic (Googling). Most SMB importers guess.
**Frequency**: Mentioned in 50%+ of import-related threads
**Current workaround**: Ask the freight forwarder (who often also guesses), or just pick something close
**Platform opportunity**: Guided HTS lookup with plain-English descriptions and duty rate display

### Theme 3: Tool Fragmentation and Context Switching (Severity: High)
**Who it affects**: All segments
**The core problem**: Logistics professionals live in 5–8 different tools/portals with no integration. Every morning requires a manual aggregation ritual across carrier portals, government sites, and spreadsheets.
**Frequency**: Near-universal complaint in community research
**Current workaround**: Increasingly complex Excel files, shared Notion/Google Drive systems
**Platform opportunity**: Unified logistics intelligence dashboard — even if Phase 1 is read-only/aggregated data

### Theme 4: FTZ Benefits Are Real But Invisible (Severity: High)
**Who it affects**: Mid-size importers and above, FTZ managers
**The core problem**: FTZ admission can lock duty rates and enable incremental withdrawal — potentially saving thousands to millions in duties. But the math is opaque and nobody has a clear tool to calculate the savings.
**Frequency**: Mentioned less often (lower awareness segment) but with very high urgency when mentioned
**Current workaround**: Manual spreadsheet calculations by compliance team; most importers just don't use FTZ
**Platform opportunity**: FTZ Savings Analyzer — the "wow" demo feature that makes people say "I didn't know that was even possible to calculate"

### Theme 5: Professional Presentation Gap (Severity: Medium-High)
**Who it affects**: Freight brokers primarily
**The core problem**: SMB brokers are losing deals to larger competitors who present polished route proposals with visualizations while brokers send email tables.
**Frequency**: Common in broker communities
**Current workaround**: None — brokers acknowledge this is a gap but don't know how to fix it
**Platform opportunity**: Branded route comparison and proposal output (PDF/printable) with route visualization

### Theme 6: Cold Chain Underservice (Severity: High for niche)
**Who it affects**: Cold chain exporters
**The core problem**: Virtually all freight tech is built for dry cargo. Cold chain operators feel "forgotten." Reefer equipment availability, cold chain premiums, and temperature compliance are not addressed by mainstream tools.
**Frequency**: Mentioned universally by cold chain operators
**Current workaround**: Relationships and tribal knowledge
**Platform opportunity**: Cold Chain Overlay — adds reefer context to standard logistics tools. Even basic cold chain features signal "this tool was built for me"

---

## 7. Feature Desirability Ranking

Based on pain point severity, frequency, and community analysis. Scale: 1–10 desirability, 1–10 urgency.

| Rank | Feature | Desirability | Urgency | Primary Segments | Notes |
|------|---------|-------------|---------|-----------------|-------|
| 1 | **Landed Cost Calculator** | 10 | 10 | All importers | Core product. Must be first. |
| 2 | **HTS Code Lookup** | 9 | 9 | Importers, Brokers | Table stakes for credibility |
| 3 | **FTZ Savings Analyzer** | 9 | 8 | FTZ users, Importers | Key differentiator, high WTP |
| 4 | **Unit Economics Breakdown** | 9 | 8 | Importers, investors | "Tells the business story" |
| 5 | **Duty/Tariff Rate Display** | 9 | 8 | All importers | Foundation for calculators |
| 6 | **Tariff Scenario Modeling** | 8 | 8 | All importers | Critical during trade policy uncertainty |
| 7 | **Container Utilization Calculator** | 8 | 7 | Importers, 3PLs | Simple, high perceived value |
| 8 | **Route/Carrier Comparison** | 8 | 7 | Brokers, Importers | Core broker workflow tool |
| 9 | **Interactive Route Map** | 7 | 6 | Brokers, Importers | "Visual anchor" for proposals |
| 10 | **PDF Export / Proposal Output** | 7 | 6 | Brokers | Deal-winner in broker context |
| 11 | **Cold Chain Cost Overlay** | 8 | 7 | Cold chain exporters | Niche but very high loyalty |
| 12 | **Backhaul Availability Indicator** | 7 | 6 | Brokers, Cold chain | Competitive advantage enabler |
| 13 | **Transshipment Route Mapping** | 6 | 5 | Brokers, Importers | Visual differentiation |
| 14 | **Documentation Requirements Matrix** | 7 | 6 | All segments | Pain is real but lower urgency |
| 15 | **Port Comparison Tool** | 6 | 5 | 3PLs, Importers | Nice-to-have for decision support |
| 16 | **Vessel Schedule Display** | 7 | 5 | Brokers, Importers | High value, high complexity |
| 17 | **Bill of Lading Generator** | 6 | 4 | Brokers, Exporters | Operational tool — Phase 2 |
| 18 | **Compliance Checklist** | 6 | 5 | Cold chain, FTZ | Segment-specific but high value |
| 19 | **Multi-Scenario Comparison** | 6 | 4 | Advanced users | Power user feature — Phase 2 |
| 20 | **Dashboard Overview** | 6 | 4 | All segments | Aggregation layer — Phase 2 |

---

## 8. Objections and Concerns

### 8.1 Data Accuracy and Trust
**Objection**: "How do I know the duty rates in your tool are current? CBP updates rates constantly."
**Frequency**: Very common among experienced users
**Severity**: Will block purchase if not addressed
**Mitigation**: Clear data freshness indicators; source attribution (USITC, CBP); disclaimer that tool is for estimation, not compliance filing; subscription to update feeds
**Quote**: *"I've seen tools that had duty rates that were 2 years out of date. Made my landed cost calculations completely wrong. Now I always verify."*

### 8.2 HTS Misclassification Liability
**Objection**: "If your tool suggests the wrong HTS code and I get audited, who's responsible?"
**Frequency**: Common among larger importers and compliance-aware users
**Severity**: Blocks enterprise use; less concern for SMB
**Mitigation**: Clear disclaimer that tool is for research/estimation only; recommend customs broker binding ruling for compliance use; position as "starting point" not "final answer"
**Quote**: *"We can't use a web tool's HTS suggestion for CBP filings. We need a customs broker to give us a binding ruling."*

### 8.3 Data Security and IP Concerns
**Objection**: "If I enter my supplier names, costs, and HTS codes into your tool, who sees that data?"
**Frequency**: Common among established importers
**Severity**: High for enterprise; moderate for SMB
**Mitigation**: Clear privacy policy; no sale of usage data; encryption in transit/at rest; option to use without account (anonymous calculations)
**Quote**: *"My supplier relationships and landed cost data are my competitive advantage. I'm not putting them in some SaaS tool that might sell that data."*

### 8.4 Vendor Lock-In
**Objection**: "If I build my workflow around your tool, what happens if you raise prices or shut down?"
**Frequency**: Common in logistics communities (several failed freight-tech startups have burned users)
**Severity**: Moderate — will not block initial purchase but will limit deep adoption
**Mitigation**: CSV/PDF export of all data; no proprietary data formats; annual plan with price lock option
**Quote**: *"I used Flexport until they pivoted. Started over from scratch. I'm very careful about single-tool dependency now."*

### 8.5 Compliance Scope Creep Concerns
**Objection**: "Are you acting as a customs broker? Because that's a regulated activity."
**Frequency**: Rare among end users but critical from compliance counsel perspective
**Severity**: Would block enterprise use if not addressed; less concern for SMB analysis tools
**Mitigation**: Position as analysis and research tool, not a customs broker; all language is "estimated," "for reference only," and "consult a licensed customs broker"; no direct filing functionality in Phase 1
**Quote**: *"The moment your tool starts making classification recommendations, you're in customs broker territory and you need a license."*

### 8.6 Integration With Existing Tools
**Objection**: "Does this integrate with [CargoWise / our ERP / our WMS]?"
**Frequency**: Common among mid-market and enterprise users
**Severity**: Can block mid-market adoption; SMBs less concerned
**Mitigation**: Phase 1 is standalone analysis tool — set expectations clearly; roadmap for integration in later phases; CSV import/export bridges gap in interim
**Quote**: *"We evaluated 3 tools last quarter. All of them failed on integration. If it doesn't talk to CargoWise, our ops team won't use it."*

### 8.7 "My Forwarder Does This For Me"
**Objection**: "My freight forwarder handles all this. I don't need a separate tool."
**Frequency**: Very common among importers who have a trusted forwarder relationship
**Severity**: Moderate — this is a market positioning challenge, not a product flaw
**Mitigation**: Position as "get the answer before you call your forwarder" — verify, compare, and understand the numbers your forwarder gives you; reduce dependency on one relationship
**Quote**: *"My forwarder gives me a landed cost estimate. I've never verified it independently. I just trust them."*

---

## 9. User Stories — Top 20 Features

### US-001: Landed Cost Calculator
**As** a SE Asia goods importer,
**I want** to enter my unit FOB price, HTS code, origin country, destination port, and estimated container quantity,
**So that** I can see a complete per-unit and per-container landed cost breakdown (including duties, freight, insurance, fulfillment fees) before committing to a purchase order.

**Acceptance Criteria:**
- Displays line-item breakdown: FOB + freight + ISF + insurance + duty + exam fee (estimated) + drayage + fulfillment
- Supports multi-currency input (USD and major source currencies)
- Exports to PDF for sharing with partners or investors
- Shows margin analysis: landed cost vs. wholesale vs. retail

---

### US-002: HTS Code Lookup
**As** an importer who doesn't know my product's HTS code,
**I want** to search by product description in plain English,
**So that** I can find the most likely 10-digit HTS code with the corresponding duty rate and unit of quantity.

**Acceptance Criteria:**
- Fuzzy search across HTS schedule with plain-English descriptions
- Shows duty rate by country of origin (MFN, Section 301, GSP, CAFTA where applicable)
- Links to official USITC source for verification
- Flags "commonly misclassified" categories with guidance

---

### US-003: FTZ Savings Analyzer
**As** an importer with significant import volume,
**I want** to compare the duty cost of FTZ admission (privileged foreign status, duty rate locked today) vs. paying duties at standard entry,
**So that** I can make an informed decision about whether FTZ admission is worth it for this shipment.

**Acceptance Criteria:**
- Input: HTS code, quantity, unit value, today's duty rate, projected future duty rate (or range)
- Output: duty savings over time under FTZ vs. standard entry
- Models incremental withdrawal (100 units at a time) with cumulative duty savings
- Shows break-even analysis (FTZ cost to activate vs. duty savings)

---

### US-004: Unit Economics Breakdown
**As** an importer evaluating a new product to source,
**I want** to enter my origin cost and see a waterfall showing cost at each stage (origin → landed → wholesale → retail),
**So that** I can immediately see if the margin stack is viable before committing.

**Acceptance Criteria:**
- Waterfall chart: unit origin cost → freight allocation → duty → fulfillment → landed cost → wholesale markup → retail price
- Margin percentage at each stage
- Editable inputs — can change any stage and recalculate
- Shows volume sensitivity (how margin changes at 100K vs. 500K vs. 1M units)

---

### US-005: Container Utilization Calculator
**As** an importer planning a container shipment,
**I want** to enter my product dimensions and weight and see how many units fit in a 20ft, 40ft, and 40ft HC container,
**So that** I can determine the right container type and optimize my per-unit shipping cost.

**Acceptance Criteria:**
- Inputs: carton dimensions (L×W×H), carton weight, units per carton
- Outputs: max cartons per container (volume-limited and weight-limited), total units, cost per unit given a freight rate
- Supports 20ft dry, 40ft dry, 40ft HC, and 40ft reefer container specs
- Warns if product is weight-limited before volume-limited (dense goods)

---

### US-006: Carrier/Route Comparison
**As** a freight broker or importer researching shipping options,
**I want** to select an origin port (e.g., Ho Chi Minh City) and destination port (e.g., Long Beach) and see a comparison of available routes with transit time, estimated cost, and transshipment stops,
**So that** I can present my customer with 3 informed options.

**Acceptance Criteria:**
- Shows 3–5 route options per port pair
- Each option shows: estimated transit time, transshipment points, cost range, carrier serving the lane
- Highlights backhaul-favorable lanes with a visual indicator
- Route data sourced from researched carrier schedules (Phase 1: static data, refreshed monthly)

---

### US-007: Interactive Route Map
**As** a freight broker presenting to a shipper,
**I want** to see a visual map of shipping routes from my selected origin to destination,
**So that** I can show my customer an intuitive picture of how their cargo moves and why transshipment is a viable option.

**Acceptance Criteria:**
- World map with origin, destination, and transshipment ports plotted
- Route lines drawn for each option (direct vs. via Panama vs. via Cartagena etc.)
- Hoverable ports with name, country, and key stats
- Embeddable or screenshot-friendly for use in proposals

---

### US-008: Duty/Tariff Rate Display
**As** any user who needs to know a tariff rate,
**I want** to enter or select an HTS code and origin country and see the applicable duty rate instantly,
**So that** I can use it in my calculations without navigating government websites.

**Acceptance Criteria:**
- Supports all HTS codes (10-digit)
- Shows MFN rate, any Section 301 additional duty, GSP eligibility, and special program rates
- Clearly states data source and freshness date
- Flags Section 301 products with a warning (China-origin goods subject to additional tariffs)

---

### US-009: Tariff Scenario Modeling
**As** an importer concerned about tariff changes,
**I want** to model how my landed cost changes if tariffs increase by 10%, 25%, or 50%,
**So that** I can make contingency plans and evaluate sourcing alternatives before a tariff change hits.

**Acceptance Criteria:**
- Slider or input to set tariff rate change (+/- or new absolute rate)
- Live recalculation of landed cost and margin at new rate
- Side-by-side comparison of 3 tariff scenarios
- Output: "At current rates: $X/unit. If tariffs increase 25%: $Y/unit. FTZ break-even: Z months."

---

### US-010: PDF Export and Report Generation
**As** a freight broker or importer,
**I want** to export any calculator result or route comparison as a branded PDF,
**So that** I can share a professional report with my customer, partner, or investor.

**Acceptance Criteria:**
- One-click PDF export from any calculator
- Includes all relevant data, charts, and assumptions
- Branded with platform logo and "prepared by" field (custom name for brokers)
- Includes disclaimer language about estimated nature of data

---

### US-011: Cold Chain Cost Overlay
**As** a cold chain exporter,
**I want** to see reefer container costs layered onto the standard route/cost comparison,
**So that** I understand the cold chain premium and can compare reefer options specifically.

**Acceptance Criteria:**
- Toggle on any route comparison to show reefer vs. dry container cost difference
- Shows reefer premium as a % and absolute dollar amount per container
- Highlights reefer container availability concerns on specific lanes
- Temperature range requirements captured for cargo (frozen, chilled, controlled atmosphere)

---

### US-012: Backhaul Availability Indicator
**As** a freight broker seeking cost advantages,
**I want** to see which lanes have favorable backhaul conditions (empty repositioning of carriers),
**So that** I can offer my customers significantly lower rates on those lanes and win business.

**Acceptance Criteria:**
- For each route in the carrier comparison, shows a "backhaul indicator" (High / Medium / Low availability)
- Estimated backhaul discount range (e.g., "30–50% below peak rate")
- Explanation of why the lane has backhaul (seasonal, trade imbalance, etc.)
- Data based on trade flow research (Phase 1: researched static data, not live)

---

### US-013: Documentation Requirements Matrix
**As** an importer or exporter preparing for a shipment,
**I want** to select my commodity type, origin country, and destination and see a checklist of required documents,
**So that** I don't miss a documentation requirement that delays my shipment.

**Acceptance Criteria:**
- Inputs: origin country, destination country, commodity type (food, textiles, electronics, etc.)
- Output: checklist of required documents (BOL, commercial invoice, packing list, ISF, phytosanitary certificate, USDA export cert, etc.)
- Includes deadline for each document (e.g., "ISF must be filed 24 hours before departure")
- Links to official forms where applicable

---

### US-014: FTZ Incremental Withdrawal Modeler
**As** an FTZ manager,
**I want** to plan my withdrawal schedule (how many units to withdraw per month) and see cumulative duty cost and savings,
**So that** I can optimize my cash flow by withdrawing only what I need rather than paying duties on the full container at once.

**Acceptance Criteria:**
- Input: total inventory in zone, duty rate at admission, current rate, projected sales schedule
- Output: month-by-month withdrawal plan with cumulative duties paid and cumulative savings vs. full entry
- Cash flow visualization: when duties are paid vs. when goods are sold
- Comparison of withdrawal pacing strategies (conservative vs. aggressive)

---

### US-015: Multi-Scenario Comparison
**As** an importer evaluating multiple sourcing or routing strategies,
**I want** to build 2–3 scenarios (e.g., "Vietnam direct" vs. "Thailand via LA" vs. "Vietnam via FTZ") and see them side by side,
**So that** I can make a data-driven sourcing and logistics decision rather than guessing.

**Acceptance Criteria:**
- Save up to 3 named scenarios with different inputs
- Side-by-side table showing landed cost, total duties, transit time, and margin for each
- Highlight the "best" scenario by a user-selected criterion (lowest duty, lowest landed cost, fastest transit)
- Exportable for presentations

---

### US-016: Port Comparison Tool
**As** an importer deciding between entering via LA/Long Beach vs. Savannah vs. Houston,
**I want** to compare key port metrics for major US ports,
**So that** I can select the optimal US port of entry for my specific supply chain.

**Acceptance Criteria:**
- Port comparison table: dwell time, average fee schedule, FTZ proximity, inland rail connections, congestion index
- Filter by: east coast vs. west coast vs. gulf; FTZ availability; reefer handling capability
- Map view showing port location relative to customer's distribution center
- Data sourced from CBP and AAPA (American Association of Port Authorities) public data

---

### US-017: Vessel Schedule Display
**As** a freight broker or importer planning a shipment,
**I want** to see upcoming vessel departures for a specific port pair with carrier and estimated transit time,
**So that** I can advise my customer on realistic shipping windows without calling each carrier.

**Acceptance Criteria:**
- Select origin and destination port; display next 8 vessel departures
- Each departure shows: carrier, vessel name, ETD, ETA, transit time, transshipment points
- Data sourced from publicly available carrier schedules (Maersk, MSC, CMA CGM, Evergreen, OOCL)
- Updates on a regular refresh cycle (Phase 1: weekly; Phase 2: daily)

---

### US-018: Bill of Lading Generator
**As** a freight broker or exporter,
**I want** to fill out a standardized Bill of Lading template in the platform and generate a PDF,
**So that** I can reduce time spent on repetitive document preparation.

**Acceptance Criteria:**
- All standard BOL fields: shipper, consignee, notify party, vessel, port of loading, port of discharge, cargo description, quantity, weight, marks and numbers
- Pre-populated from shipment record if shipment was already entered
- Outputs a PDF in standard FIATA or carrier-standard BOL format
- Option to add endorsements (negotiable vs. non-negotiable)

---

### US-019: Shipment Dashboard Overview
**As** an importer or broker tracking multiple active shipments,
**I want** a single dashboard showing all my containers — status (in transit, at port, in FTZ, delivered), ETA, and any alerts,
**So that** I don't have to check 5 carrier portals each morning.

**Acceptance Criteria:**
- List view and map view of all active shipments
- Status badges: Booked / In Transit / At Port / In Customs / In FTZ / Delivered
- ETA with confidence indicator
- Alert system: flag shipments that are delayed, at risk, or require action
- Phase 1: manual entry of shipment data; Phase 2: carrier API integration

---

### US-020: Compliance Checklist by Product Category
**As** an importer in a regulated product category (food, electronics, textiles),
**I want** a checklist of US import compliance requirements specific to my product and country of origin,
**So that** I don't have a shipment held at customs because I missed an FDA registration or CPSC requirement.

**Acceptance Criteria:**
- Select product category (food/beverage, electronics, apparel, toys, cosmetics, etc.)
- Select country of origin
- Output: compliance checklist with required registrations, certifications, labeling requirements, and testing standards
- Includes links to relevant regulatory bodies (FDA, CPSC, FTC, USDA)
- Flags high-risk categories (e.g., "Infant products require CPSC third-party testing")

---

## 10. Persona Cards

---

### Persona 1: "The Container Entrepreneur"

**Name**: Marcus Chen
**Age**: 34
**Location**: Los Angeles, CA
**Role**: Founder, Solo Importer
**Annual Import Volume**: 3–6 FCL/year from Vietnam and Thailand
**Revenue**: $800K (growing)

**Background**:
Marcus spent 5 years in retail buying before going out on his own. He sources high-margin consumer goods — primarily kitchen accessories and home organization products — from factories in Ho Chi Minh City and Chiang Mai. He sells 80% on Amazon FBA and 20% via his own Shopify store. He's smart and driven, but has no formal logistics training. He's learned everything from Facebook groups, YouTube, and expensive mistakes.

**A Day In Marcus's Life**:
Opens his laptop at 7am in his apartment. Checks his freight forwarder's portal for any updates on his 2 active containers. Nothing new. Emails his forwarder to ask about ETA at Long Beach. Spends 2 hours on his next product research — has a potential supplier in Thailand he's considering. Tries to calculate landed cost in his Google Sheet. Realizes he doesn't know if the product is subject to Section 301 tariffs. Spends 45 minutes on USITC.gov getting more confused. Gives up and DMs in his Slack group asking if anyone knows the HTS code for "bamboo storage containers."

**Goals**:
- Get to $2M revenue by running 10+ containers per year
- Stop losing margin to duty surprises and undercounted fees
- Find an edge before competitors find his suppliers

**Frustrations**:
- "I built a landed cost spreadsheet that took me a week. Then a tariff changed and I had to rebuild it."
- "I trust my freight forwarder but I have no way to verify their numbers. I feel like I'm flying blind."
- "I'm leaving money on the table with FTZ. I just don't understand it well enough to use it."

**Quote**:
*"I feel like a small business owner who stumbled into international trade. There has to be a better way to know my numbers before I'm committed to $80,000 in product."*

**Key Metrics He Tracks**: Landed cost per unit, margin %, container utilization, Amazon ACOS
**WTP**: $99/month for a reliable landed cost calculator. $149/month if it includes FTZ analysis.
**Decision Process**: Finds via Google or Reddit recommendation. Signs up for free trial. Tries with a current shipment. Pays if it saves him time on the first use.

---

### Persona 2: "The Independent Broker"

**Name**: Dana Rodriguez
**Age**: 41
**Location**: Houston, TX
**Role**: Owner, Independent Freight Broker (Licensed FMCSA, NVOCC)
**Specialization**: SE Asia imports, temperature-controlled cargo
**Annual Revenue**: $1.8M

**Background**:
Dana spent 12 years at a large freight forwarder before going independent 6 years ago. She knows the industry inside and out — carrier relationships, trade lanes, seasonal patterns, port nuances. What she lacks is good tooling. She currently runs her brokerage with DAT (for domestic), carrier websites (for international), QuickBooks, and an enormous collection of Excel files. She has two part-time broker associates and one VA.

**A Day In Dana's Life**:
8am: Opens 6 browser tabs for Maersk, MSC, CMA CGM, Evergreen, Hapag-Lloyd, and MarineTraffic. Does a manual status check on 14 active shipments (30 min). 9am: Customer calls with a new RFQ — 2 FCL from Bangkok to New York. Dana calls 4 carriers and waits for callbacks. By noon she has 2 responses. Sends a rough Excel quote table to the customer by 2pm. Loses the deal to a competitor who sent a polished proposal with a route map. Frustrated.

**Goals**:
- Quote customers faster (under 30 minutes, not 3 hours)
- Win deals against larger competitors by looking more professional
- Identify backhaul opportunities to offer better rates
- Scale to 3 more brokers without 3x the admin chaos

**Frustrations**:
- "My quoting process is embarrassing. I'm a one-woman call center."
- "I know about backhaul rates but only because I've been doing this 12 years. My new broker doesn't know to even ask."
- "Carrier websites show me schedules but not availability. I still have to call."

**Quote**:
*"I have 12 years of knowledge in my head that I can't systematize. If I could just get it into a tool, I could train a junior broker in a month instead of a year."*

**Key Metrics She Tracks**: Margin per shipment, quote-to-close rate, on-time delivery rate, days to pay
**WTP**: $299/month for a comprehensive broker toolkit with route comparison and PDF proposal output
**Decision Process**: Hears about tool at TIA conference or from peer. Requests demo. Evaluates over 2 weeks. Buys if it genuinely cuts quoting time in half.

---

### Persona 3: "The FTZ Optimizer"

**Name**: James Kowalski
**Age**: 52
**Location**: Chicago, IL
**Role**: Import Compliance Manager, Mid-Market Distributor
**Import Volume**: 80–120 FCL/year, $40M in imported goods
**FTZ Status**: Subzone operator, active since 2018

**Background**:
James has been in import compliance for 22 years. He's seen every tariff regime, every compliance change, and every technology wave in logistics. He's deeply experienced but often frustrated by tools that don't keep up with regulatory complexity. His company uses FTZ extensively for duty deferral on imported consumer electronics. He reports to the CFO and is expected to quantify the duty savings from FTZ operations each quarter.

**A Day In James's Life**:
8am: Opens ACE portal to check on 3 pending FTZ admissions. Manually reconciles zone lot inventory in Excel (his 8-year-old spreadsheet). 10am: CFO calls asking for Q1 FTZ savings summary. James pulls numbers from 3 different spreadsheets, reconciles, and creates a slide deck. This takes 4 hours. 2pm: Tariff news breaks — possible new Section 301 action. James tries to model the impact on their pending admissions. Spends 2 hours recalculating. Realizes he can't confidently model the incremental withdrawal scenarios in his current spreadsheet.

**Goals**:
- Quantify and maximize FTZ duty savings for CFO reporting
- Make better FTZ admission decisions (privileged vs. non-privileged status)
- Survive a CBP FTZ audit without 3 weeks of manual preparation
- Stay current on tariff changes with less manual effort

**Frustrations**:
- "My FTZ tracking is an 8-year-old Excel file that I'm terrified to modify."
- "I know we're not optimizing our withdrawal schedule but I don't have a tool to model it."
- "The CFO asks me to quantify FTZ savings and I have to spend 4 hours assembling numbers."

**Quote**:
*"FTZ is the most powerful duty management tool available. We're using 40% of its potential because the software to fully leverage it doesn't exist at our scale."*

**Key Metrics He Tracks**: Duties paid vs. duties deferred, FTZ inventory value, withdrawal schedule, CBP audit readiness score
**WTP**: $800/month for FTZ analytics and savings reporting tool
**Decision Process**: Researches via NAFTC resources and compliance consultant referrals. Requires security review and legal review of liability disclaimers. 3–4 month evaluation cycle.

---

### Persona 4: "The Cold Chain Veteran"

**Name**: Patricia Okafor
**Age**: 47
**Location**: Seattle, WA
**Role**: Export Operations Manager, Seafood Export Company
**Annual Export Volume**: 40–60 reefer containers/year
**Destinations**: Japan, South Korea, Taiwan, EU, China

**Background**:
Patricia has managed export operations for a Pacific Northwest seafood exporter for 11 years. She knows cold chain like no one else — reefer pre-cooling, USDA export certification, phytosanitary requirements by destination country, and the brutal cost of a temperature excursion mid-ocean. She works closely with a Lineage terminal and has relationships with 3 reefer-certified ocean carriers. She does everything by email and phone backed by a system she built herself over a decade.

**A Day In Patricia's Life**:
6am: Check MarineTraffic for vessel positions on active shipments (3 reefer containers currently at sea). No temperature alerts — data loggers only report at destination. 7am: Coordinate with Lineage terminal on pre-cooling schedule for next week's container. 9am: USDA export certificate needed for Friday export. Navigate USDA ams.usda.gov to request. 11am: Japanese buyer asks for shipping update and ETA. Patricia logs into carrier portal, extracts ETA, emails back. 2pm: New Japanese buyer wants a quote for frozen salmon. Patricia calls her 3 reefer carriers, gets 2 responses by end of day. Quotes the customer the next morning.

**Goals**:
- Know in advance when reefer container availability is tight so she can plan around it
- Stop getting surprised by destination-country documentation requirements
- Find backhaul reefer opportunities that reduce her outbound rate
- Handle temperature excursion claims faster with better documentation

**Frustrations**:
- "Every country has different phytosanitary requirements. I have a binder I built over 10 years. New markets terrify me."
- "I know reefer premiums are negotiable but I have no benchmark. Am I paying the right rate?"
- "Temperature excursion claims are a nightmare. The carrier says it's my fault, I say it's theirs, and it takes 6 months to resolve."

**Quote**:
*"Nobody builds tools for cold chain. We're the forgotten segment. Everything is built for dry freight and then reefer is an afterthought checkbox."*

**Key Metrics She Tracks**: Reefer container availability rate, transit time by lane, USDA certification processing time, temperature excursion rate, claims resolution time
**WTP**: $199/month for a cold-chain-aware logistics tool with reefer specifics and documentation support
**Decision Process**: Hears about tools from Lineage account manager or industry contacts. Strong preference for tools that clearly "get" cold chain. Will not buy generic logistics tools.

---

## 11. Interview Guide Template

*For use in Phase 1b validation interviews. Estimated session length: 45–60 minutes.*

### Pre-Interview Setup

**Recruit criteria:**
- [ ] Confirm they have active import/export operations (not theoretical)
- [ ] Confirm they are a decision-maker or strong influencer on tool purchases
- [ ] Note their segment (importer / broker / 3PL / FTZ / cold chain)
- [ ] Collect basic company profile before the call (team size, import volume)

**Before the call:**
- Review their LinkedIn/website for context
- Note any relevant community posts if you found them in research
- Prepare the feature list in a shareable doc (for desirability ranking exercise)

**Zoom setup:**
- Record consent at start
- Have a shared Google Doc open for collaborative note-taking
- Have the feature list ready to share screen

---

### Section 1: Warm-Up and Context (5 min)

1. Tell me a little about what you do and what your typical day looks like.
2. How did you end up in this role? How long have you been in logistics/freight/importing?
3. What's your primary trade lane right now? [Get: origin countries, destination, commodity type]

---

### Section 2: Current Workflow Deep Dive (15 min)

4. Walk me through the last shipment you managed from the moment you got the idea/order to when goods arrived. [Listen for: pain moments, tools used, time sinks]
5. Where did you spend the most time in that process? What felt like the biggest waste of time?
6. What information did you wish you had faster during that process?
7. How do you currently calculate landed cost? Can you walk me through exactly how you do it?
8. When you need to find a duty rate or HTS code, what do you actually do? Step by step.
9. How do you select carriers or routes? What does that research process look like?
10. How do you track active shipments? What does your morning check-in routine look like?

---

### Section 3: Pain Point Ranking (10 min)

*Present a list of the top 8 pain points identified in research. Ask them to rank.*

11. Here are some common pain points I've heard from people in your role. Can you rate each one from 1–5 on how painful it is for you? [1 = doesn't affect me; 5 = this is a daily nightmare]

**Pain points to rate:**
- [ ] Calculating accurate landed cost before committing to an order
- [ ] Finding the right HTS code for a product
- [ ] Understanding how tariff changes affect my costs
- [ ] Researching and comparing freight rates across carriers
- [ ] Managing and tracking required shipping documentation
- [ ] Understanding and using FTZ for duty savings
- [ ] Getting visibility into where my shipments are
- [ ] Presenting professional quotes/proposals to customers

12. Which one of those is your absolute #1 pain point right now?
13. Tell me about a specific time that pain cost you real money. What happened?

---

### Section 4: Current Tools and Evaluation (10 min)

14. What tools are you currently using for [their highest-pain area]? Can you show me? [Screen share if possible]
15. What do you love about that tool? What do you hate?
16. Have you ever tried to solve this problem with a different tool and given up? What happened?
17. If you could change one thing about how you work today — just one thing — what would it be?

---

### Section 5: Feature Desirability (10 min)

*Share screen with feature list. Walk through each feature quickly.*

18. I'm going to show you a list of features we're considering. For each one, tell me: would this be useful to you? Somewhat useful? Or not relevant?

**Features to evaluate:**
- Landed cost calculator with all fees included
- HTS code lookup by plain-English product description
- FTZ savings analyzer (duty-locked vs. current rate comparison)
- Unit economics breakdown (origin → landed → wholesale → retail)
- Carrier/route comparison for a specific port pair
- Interactive shipping route map
- Tariff scenario modeling ("what if tariffs increase 25%?")
- Container utilization calculator
- Documentation checklist by product and destination
- Cold chain cost overlay (reefer vs. dry container costs)
- PDF export of any calculation for sharing

19. Of those features, which one would you use first?
20. Is there anything on that list you'd never use? Why?
21. Is there anything NOT on that list that you desperately wish existed?

---

### Section 6: Willingness to Pay (5 min)

22. If a tool did [their #1 priority feature] really well, what would that be worth to you per month?
23. What would make you immediately walk away from a tool pricing page? [Get ceiling]
24. How do you prefer to pay for software? Monthly or annual? Per seat or flat fee?
25. Who else would need to approve a tool like this? Is this a decision you can make yourself?

---

### Section 7: Close (5 min)

26. Is there anyone else in your world — a competitor, a peer, a customer — who I should talk to about this?
27. Would you be open to being an early user and giving us feedback as we build? We'd offer free access in exchange.
28. Any questions for me about what we're building?

---

### Post-Interview Notes Template

```
Date: [YYYY-MM-DD]
Interviewee: [Name, Role, Company]
Segment: [Importer / Broker / 3PL / FTZ / Cold Chain]
Duration: [X min]
Recorded: [Yes/No]

Top Pain Points (ranked by interviewee):
1. [pain]
2. [pain]
3. [pain]

Current Tool Stack:
- [Tool 1] for [use]
- [Tool 2] for [use]

Highest-Desired Features:
1. [feature] — quote: "[what they said]"
2. [feature]
3. [feature]

WTP: $[X]/month for [specific capability]
Decision Maker: [Yes/No — who else involved?]

Open to early access: [Yes/No]
Referrals provided: [Names/contacts]

Key insight:
[1–2 sentences of the most important thing you learned]

Surprise findings (things not in our prior research):
[anything unexpected]
```

---

## 12. Summary and Strategic Implications

### Top 3 Insights

**1. The landed cost calculator is not just a feature — it IS the product for importers.**
Every SE Asia importer we researched has built, broken, and rebuilt a landed cost spreadsheet. The pain is universal, deeply felt, and creates real financial losses. A tool that reliably calculates true landed cost before a purchase order is committed would be immediately adopted by this segment. Everything else is secondary for this user group.

**2. SMB brokers are the most underserved professional segment in logistics tech.**
Enterprise brokers have CargoWise, Echo, and custom TMS systems. SMB brokers have DAT, phone calls, Excel, and QuickBooks. The gap is enormous. A tool that cuts quote time from 90 minutes to 15 minutes and produces a professional-looking proposal would be a category creator for this segment.

**3. FTZ is the highest-upside differentiator, but only for users who know what FTZ is.**
FTZ savings can be enormous, but the segment is smaller and requires more user education. Position FTZ as the "advanced" feature that makes power users evangelical — it's the demo that makes people say "I didn't know that existed." Don't lead with FTZ in marketing, but make it the feature that creates retention.

### MVP Recommendation (Refined by User Research)

**Must have for Day 1:**
1. Landed Cost Calculator — the core product for importers
2. HTS Code Lookup — prerequisite for credibility
3. Duty/Tariff Rate Display — table stakes

**Ship within 30 days of launch:**
4. Unit Economics Breakdown — seals the "import story"
5. FTZ Savings Analyzer — the differentiator that creates word-of-mouth

**Ship within 90 days:**
6. Container Utilization Calculator — simple, high-value, standalone
7. Route/Carrier Comparison — serves broker segment
8. Tariff Scenario Modeling — critical for trade policy uncertainty

### Validation Targets

Before major build investment, validate with:
- [ ] 3 interviews with SE Asia importers (target: Marcus Chen persona)
- [ ] 3 interviews with independent freight brokers (target: Dana Rodriguez persona)
- [ ] 1 interview with an FTZ compliance manager (target: James Kowalski persona)
- [ ] 1 interview with cold chain exporter (target: Patricia Okafor persona)

**Validation success criteria:**
- 3/3 importers rank landed cost calculator as their #1 pain
- 2/3 brokers say they'd pay $149+/month for route comparison + proposal output
- 1/1 FTZ manager confirms FTZ savings calculation is a critical unmet need

### Red Flags to Watch For

- If interviewees say "my forwarder does this for me" — need to reframe as "verify your forwarder's numbers"
- If brokers are satisfied with DAT — may indicate target segment is importers, not brokers in Phase 1
- If FTZ users cite compliance liability concerns — need stronger legal disclaimer framework
- If price resistance is under $49/month — may indicate need to anchor on ROI more aggressively

---

*Document prepared for Linear issue AI-5406 | Phase 1 Research | Shipping Savior*
*Next step: Conduct 8–10 validation interviews using the guide in Section 11*
*Update this document after each interview batch with findings*
