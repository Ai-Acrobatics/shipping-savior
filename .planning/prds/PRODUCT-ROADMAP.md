# Shipping Savior — Product Roadmap

**Linear:** AI-5408
**Created:** 2026-03-26
**Status:** Planning
**Owner:** Ai Acrobatics / Shipping Savior Project
**Horizon:** 18 Months (Phase 0 → Phase 4)

---

## Table of Contents

1. [Vision & North Star](#1-vision--north-star)
2. [User Personas](#2-user-personas)
3. [Phase 0 — Proposal Site (Current)](#3-phase-0--proposal-site-current)
4. [Phase 1 — Core Platform MVP (M1–M3)](#4-phase-1--core-platform-mvp-m1m3)
5. [Phase 2 — Data Integration (M4–M6)](#5-phase-2--data-integration-m4m6)
6. [Phase 3 — AI Intelligence Layer (M7–M12)](#6-phase-3--ai-intelligence-layer-m7m12)
7. [Phase 4 — Scale & Enterprise (M13–M18)](#7-phase-4--scale--enterprise-m13m18)
8. [Feature Prioritization Matrix](#8-feature-prioritization-matrix)
9. [User Journey Maps](#9-user-journey-maps)
10. [Key Milestones & Success Criteria](#10-key-milestones--success-criteria)
11. [Technical Debt & Infrastructure](#11-technical-debt--infrastructure)
12. [Mobile Strategy](#12-mobile-strategy)
13. [Integration Roadmap](#13-integration-roadmap)
14. [Risk Register](#14-risk-register)

---

## 1. Vision & North Star

### Vision Statement

**Shipping Savior is the command center for every dollar that moves through international supply chains** — giving freight operators, importers, and FTZ users the analytical infrastructure of a $10M logistics team at a fraction of the cost.

We transform the most opaque, penalty-laden, data-heavy corner of global commerce into a platform where anyone can calculate true landed costs, optimize duty strategy, compare carrier routes, and deploy AI agents to automate the paper-intensive compliance workflow — all without a Bloomberg terminal or a 30-person customs brokerage on retainer.

### North Star Metric

**Monthly Active Calculations (MAC)** — the total number of unique calculator runs, HTS lookups, route comparisons, and FTZ analyses completed per month.

**Why MAC:** Every value-generating action on the platform flows through a calculation. MAC aggregates engagement across all tools and correlates directly with platform stickiness, pricing leverage (seat-based or usage-based billing), and the feedback loop that improves AI classification accuracy over time. A user who calculates more is a user who trusts the platform more.

**Year 1 MAC Target:** 10,000/month by M12
**Year 2 MAC Target:** 100,000/month by M24

### Secondary Metrics

| Metric | M6 Target | M12 Target | M18 Target |
|--------|-----------|------------|------------|
| Registered users | 50 | 500 | 5,000 |
| Paying accounts | 5 | 50 | 500 |
| MRR | $0 (beta) | $5,000 | $50,000 |
| HTS lookups / month | 500 | 5,000 | 50,000 |
| NPS score | — | 40+ | 55+ |
| Avg session duration | 4 min | 8 min | 12 min |

---

## 2. User Personas

### Persona A — The Independent Importer ("Import Indie")

**Profile:** Small-to-mid business owner importing consumer goods from SE Asia (apparel, CPG, electronics accessories). Self-funded. Handles their own supply chain without a dedicated logistics team.

**Pain Points:**
- Does not know their true landed cost until the container arrives and the duty bill appears
- Has been stung by misclassified HTS codes ($5K–$50K penalties)
- Cannot evaluate whether FTZ entry is worth the setup cost
- Has no way to compare carrier pricing without calling 3 brokers manually
- Does not know about backhaul pricing or transshipment advantages

**Jobs to Be Done:**
- Calculate exact landed cost before committing to a supplier
- Validate the HTS code their supplier quoted
- Model the FTZ savings on their next 6 containers
- Get 3 carrier quotes in < 5 minutes

**Willingness to Pay:** $49–$199/month for a tool that saves one penalty event per year

---

### Persona B — The Freight Broker ("The Broker")

**Profile:** Independent or small-shop freight broker managing 20–200 shipments/month. Knows the industry deeply but relies on spreadsheets and carrier portals. Wants to win business by presenting smarter analysis than the competition.

**Pain Points:**
- Creating professional-looking carrier comparison quotes is manual and slow
- Clients ask questions about FTZ and tariff mitigation that require hours of research
- No tool surfaces backhaul availability to quote dynamic pricing
- BOL tracking is fragmented across 5 carrier portals

**Jobs to Be Done:**
- Generate polished, PDF-exportable carrier comparison quotes in < 10 minutes
- Answer client questions about tariff exposure instantly during calls
- Track all active shipments in one view

**Willingness to Pay:** $199–$499/month (recoups after 1 saved research hour/week)

---

### Persona C — The FTZ Operator ("The Zone Manager")

**Profile:** Warehouse or logistics operator managing a Foreign Trade Zone or bonded warehouse. Fluent in FTZ regulations but needs better tooling for duty deferral modeling, PF vs. GPA status analysis, and incremental withdrawal planning.

**Pain Points:**
- April 2025 executive order mandated PF status for reciprocal-tariff-scope goods — status election is irrevocable; wrong choice is catastrophic
- No existing tool models incremental pallet withdrawal with locked vs. current duty rate comparison
- OFIS database is free but hard to query programmatically for site selection

**Jobs to Be Done:**
- Model the NPV difference between PF and GPA status for a given commodity
- Plan incremental withdrawal schedule to optimize duty timing against cash flow
- Pull FTZ-eligible sites near a new distribution center

**Willingness to Pay:** $499–$1,500/month or enterprise contract

---

## 3. Phase 0 — Proposal Site (Current)

### Status: Built and Live

Phase 0 is the interactive proposal website that communicates the platform vision before any live data integrations exist. It uses static JSON datasets and client-side TypeScript calculators. No auth, no database, no paid APIs.

### What Is Already Built

| Route | Component | Status |
|-------|-----------|--------|
| `/` | Landing page with Unit Economics Calculator inline | Live |
| `/dashboard` | Shipment tracking overview, savings dashboard, analytics, notifications | Live |
| `/ftz-analyzer` | FTZ Savings Analyzer with incremental withdrawal modeling | Live |
| `/knowledge-base` | Import process SOPs, compliance checklists, documentation matrix | Live |
| `/data-intelligence` | Market intelligence views | Live |
| `/phases` | Platform roadmap visualization | Live |
| `/agreement` | Partner/client agreement pages | Live |
| `/six-sigma` | Six Sigma analysis views | Live |
| `/tech-spec` | Technical specification pages | Live |
| `/monetization` | Revenue model and pricing visualization | Live |

### Phase 0 Capabilities

- **Unit Economics Calculator:** $0.10 origin → $0.50 landed → $2.00 wholesale → $5.00 retail margin chain
- **Landed Cost Calculator:** Freight + duty + fulfillment + hidden costs (demurrage, MPF, HMF, bond)
- **FTZ Savings Analyzer:** PF vs. GPA status comparison with incremental withdrawal modeling
- **Container Utilization:** Units/container by product dimensions, cost-per-unit at scale
- **Route/Carrier Comparison:** Three-option presentation with pricing tiers
- **Knowledge Base:** Import SOPs, HTS classification guide, compliance checklists
- **Dashboard Wireframes:** Shipment tracking, cost/margin views, cold chain overlay

### Phase 0 Limitations (Known)

- All data is static/mock — no live carrier rates, no real HTS lookup
- No user authentication or data persistence
- No document upload or processing
- No AI classification assistance
- Calculators use illustrative figures, not real-time tariff rates

### Phase 0 → Phase 1 Transition Criteria

- [ ] Proposal has been presented to the founder and at least 3 external prospects
- [ ] Feedback collected from at least 5 users who ran calculations
- [ ] Decision made on monetization tier structure
- [ ] Domain secured and production deployment live

---

## 4. Phase 1 — Core Platform MVP (M1–M3)

### Theme: "First Paying User"

**Goal:** Ship the minimum viable platform that a real freight operator or importer would pay for. Replace mock data with real (but static) government datasets. Add the features that unlock the first recurring revenue.

**Definition of Done:** At least 1 paying user at any price point, running at least 3 calculations per week.

### M1 — Data Foundation + Real Calculators

**Objective:** Replace mock data with real USITC HTS data. Make calculations trustworthy and defensible.

#### Features

**F-101: USITC HTS Data Pipeline**
- Download and parse the full USITC HTS schedule JSON (17,000+ codes)
- Build client-side Fuse.js search index for instant lookup by keyword or code
- Display tariff rates by country of origin (MFN, Column 2, special rates)
- Always display dataset date with disclaimer about staleness
- *Libraries:* Fuse.js, decimal.js

**F-102: Real Landed Cost Calculator**
- Integrate actual HTS duty rates into landed cost engine
- Surface all 15+ cost components: freight, duty, MPF (0.3464%), HMF (0.125%), ISF bond, customs broker fee, port exam fees, demurrage risk, inland freight
- Show "hidden cost" warnings for commonly missed line items
- Export calculation as PDF with source citations
- *Libraries:* decimal.js, @react-pdf/renderer

**F-103: Container Utilization Calculator (Enhanced)**
- Weight vs. volume constraint — compute both, use lower
- 20ft vs. 40ft vs. 40HC container options
- Reefer container premium overlay for cold chain cargo
- CBM calculation with dimensional weight comparison

**F-104: HTS Lookup Table**
- Full 17,000-code searchable table with @tanstack/react-table
- Filter by chapter, heading, subheading
- Show MFN rate, special rate, country-specific rate
- Link each code to CBP ruling database

#### M1 Success Criteria
- HTS lookup returns accurate rate in < 500ms on 17K+ codes
- Landed cost calculator includes all 15 cost components
- All calculations pass decimal precision tests (no floating-point drift)
- PDF export renders correctly in Chrome, Firefox, Safari

---

### M2 — Route Comparison + Map Visualization

**Objective:** Make carrier route comparison visual, fast, and exportable. This is the feature most requested by freight brokers.

#### Features

**F-201: Interactive Shipping Route Map**
- MapLibre GL + deck.gl ArcLayer rendering SE Asia → US Pacific routes
- Port database from World Port Index (3,700+ ports with lat/long)
- UN/LOCODE port codes for programmatic reference
- Show transshipment hubs: Panama, Cartagena, Singapore, Port Klang
- Toggle between direct and transshipment routing
- *Libraries:* MapLibre GL, deck.gl, react-map-gl

**F-202: Route Comparison Tool**
- Side-by-side comparison of 3 routes/carriers
- Variables: transit time, estimated cost (based on published rate indices), reliability score, transshipment risk
- Backhaul availability indicator (surfaced as pricing advantage badge)
- Export as PDF or shareable link

**F-203: Vessel Schedule Aggregator (Static)**
- Aggregated from Maersk Developer Portal and CMA CGM API (both free)
- Show next 4 sailings per route
- Transit time estimates by carrier and service
- Note: Static refresh, not real-time in M2

**F-204: Port Intelligence Cards**
- Congestion status (manually updated weekly)
- Average dwell time
- Primary terminal operators
- FTZ proximity (link to F-302)

#### M2 Success Criteria
- Map renders SE Asia → US routes in < 2s on mobile 4G
- Route comparison exports correct PDF in < 3s
- Vessel schedule data refreshed weekly via cron
- searoute-js validated on 10 real SE Asia → US port pairs

---

### M3 — FTZ Analyzer (Production Grade) + Basic Dashboard

**Objective:** Elevate the FTZ Analyzer from wireframe to production-grade tool. Add basic persistent dashboard.

#### Features

**F-301: FTZ Savings Analyzer (Production)**
- Real OFIS database integration (260+ zones)
- PF (Production-Foreign) vs. GPA (General-Purpose Area) status election modeling
- April 2025 executive order compliance — flag reciprocal-tariff-scope goods
- Incremental withdrawal scheduling (model 100-unit batches over 12 months)
- NPV comparison: duty-locked rate vs. projected future rate
- IRR on FTZ setup cost ($15K–$50K typical) vs. duty savings

**F-302: FTZ Site Finder**
- Map of all 260+ OFIS-listed FTZ locations
- Filter by state, grantee, activated subzone count
- Distance from major ports
- Contact info for grantee organizations

**F-303: Basic Persistent Dashboard**
- User creates "shipments" with route, commodity, HTS code, and timeline
- Dashboard shows: in-transit, at-port, in-FTZ, delivered status
- Manual status updates (no live tracking in Phase 1)
- Requires user account (first auth requirement)

**F-304: User Authentication (Phase 1 Minimum)**
- NextAuth v5 with email/password
- JWT sessions
- Single user tier — no role separation yet
- Dashboard data persisted in Neon PostgreSQL via Drizzle ORM

#### M3 Success Criteria
- FTZ Analyzer correctly models PF vs. GPA for 5 test scenarios
- April 2025 executive order scope correctly flags 90%+ of affected HS chapters
- Dashboard loads shipment list in < 1s with up to 50 active shipments
- First paying beta user by end of M3

---

## 5. Phase 2 — Data Integration (M4–M6)

### Theme: "Live Data, Real Operations"

**Goal:** Connect the platform to live external data sources. Replace static mock rates with real carrier rate feeds. Add document upload and container tracking. Transform the platform from a calculator suite into a genuine operational tool.

### M4 — Live Carrier Rate Feeds

**Objective:** Surface real-time (or near-real-time) freight rate data so users can get actual market quotes, not estimates.

#### Features

**F-401: Freightos Baltic Index Integration**
- FBX (Freightos Baltic Exchange) API — standardized container spot rates
- Route: China → USWC, China → USEC, SE Asia → US
- Weekly rate trend chart (13-week rolling)
- Surcharge breakout: BAF, PSS, EBS, GRI

**F-402: Maersk Spot Rate API**
- Maersk Developer Portal (free tier) — real sailing schedules + spot rates
- Origin/destination lookup by UN/LOCODE
- Rate in $/FEU with included surcharges
- Cache with 24h TTL to respect rate limits

**F-403: CMA CGM Schedule Feed**
- CMA CGM API Portal (free) — sailing schedules and booking availability
- Map to internal carrier comparison schema
- Weekly refresh via server-side cron

**F-404: Rate Comparison Engine**
- Normalize all carrier rates to USD/FEU and USD/TEU
- Apply surcharge adjustments (fuel, security, port congestion)
- Rank by total cost, transit time, and reliability composite score
- Flag routes with backhaul availability for discounted pricing

#### M4 Success Criteria
- Carrier rates refresh daily via scheduled job
- Route comparison uses real rates for at least 3 major carriers
- Rate data latency < 24h for major SE Asia → US routes
- Error graceful fallback to cached data when API unavailable

---

### M5 — CBP Data Integration + Document Upload

**Objective:** Integrate official CBP import data and add document processing capabilities. Allow users to upload their own documents for parsing and validation.

#### Features

**F-501: CBP Import Data Feed**
- USITC DataWeb API — historical import statistics by country and HTS
- Import volume trends: top countries of origin per commodity
- Duty collected by chapter (validates that duty rates are being applied correctly)
- Trade war tariff action history (Section 301, 232, 201)

**F-502: Document Upload Infrastructure**
- Vercel Blob storage for uploaded documents
- Supported formats: PDF, XLSX, CSV, JPG/PNG (scanned documents)
- File size limit: 25MB per document, 500MB per account
- Document types: Commercial Invoice, Packing List, Bill of Lading, ISF filing, CBP Entry Summary (7501)

**F-503: Document Parser (Rule-Based)**
- Extract key fields from Commercial Invoice: seller, buyer, HTS codes, unit quantities, unit prices, total value
- Extract from Packing List: carton count, CBM, weight, marks
- Extract from Bill of Lading: port of loading, port of discharge, container numbers, vessel name, ETA
- Validation: flag discrepancies between invoice value and packing list weight

**F-504: ISF Compliance Checker**
- Validate ISF-10 filing requirements against uploaded documents
- Flag missing required fields (manufacturer, seller, buyer, ship-to party, country of origin, HTS codes, container stuffing location, consolidator)
- 24h-before-departure deadline calculator (not arrival — common mistake)
- Penalty risk estimator: $5,000 per missing element

#### M5 Success Criteria
- Document parser extracts HTS codes from Commercial Invoice with > 80% accuracy
- ISF compliance check flags all 10 required elements
- File upload completes in < 5s for 10MB PDF
- CBP import statistics refresh weekly

---

### M6 — Container Tracking + Operations Dashboard

**Objective:** Add real-time container tracking so users can monitor active shipments without logging into 5 carrier portals.

#### Features

**F-601: Container Tracking Integration**
- Terminal49 API (container tracking aggregator — free tier available)
- Track by container number or BOL number
- Events: gate-out, vessel-loaded, in-transit, arrived, available, picked-up
- Push notifications on status change (email + in-app)

**F-602: Multi-Carrier Tracking Aggregation**
- Map Terminal49 events to internal status schema
- Support: Maersk, MSC, CMA CGM, Hapag-Lloyd, Evergreen, COSCO
- Fallback: direct carrier portal scraping if Terminal49 unavailable
- Display estimated vs. actual arrival with variance tracking

**F-603: Operations Dashboard (Full)**
- Multi-shipment view with status kanban (In Transit / At Port / In FTZ / Delivered)
- Cost-per-shipment running total vs. budget
- Cold chain vs. general cargo split view
- Partner/fulfillment center status indicators
- Monthly cost trend chart by shipment type

**F-604: Alerts & Notifications**
- Configurable alert rules: vessel departure, container available, customs hold, CBP exam
- Email notification engine (Resend or SendGrid)
- In-app notification center with read/unread state
- Alert escalation: critical customs holds trigger immediate email regardless of user settings

#### M6 Success Criteria
- Container tracking updates within 2h of Terminal49 event
- Dashboard renders 50 active shipments in < 2s
- Email notifications delivered in < 5 minutes of trigger event
- System handles Terminal49 outages gracefully with last-known-good state

---

## 6. Phase 3 — AI Intelligence Layer (M7–M12)

### Theme: "The Platform Thinks With You"

**Goal:** Deploy AI agents that handle the high-complexity, penalty-prone tasks that currently require expensive human expertise. The HTS Classification Agent eliminates the single largest source of customs penalties. The Document Processing Agent automates the most manual part of every shipment.

### M7–M8 — HTS Classification Agent

**Objective:** Build a multi-step AI agent that classifies goods to the correct 10-digit HTS code — a task where human errors generate $600M+ in CBP penalties annually.

#### Features

**F-701: HTS Classification Agent (Core)**
- Claude API backbone with structured multi-step reasoning chain
- Step 1: Product description analysis — extract material, function, end use
- Step 2: GRI (General Rules of Interpretation) application — composite goods, kits, retail packaging
- Step 3: Section/Chapter identification with confidence scoring
- Step 4: Heading narrowing — evaluate competing headings with exclusion logic
- Step 5: Subheading selection — apply legal note hierarchy
- Step 6: 10-digit national subdivision — US-specific statistical suffixes
- Output: Primary code + 2 alternative codes with confidence percentages + reasoning narrative

**F-702: CBP Ruling Cross-Reference**
- Search CBP ruling database (CROSS) for the classified HTS code
- Surface rulings for similar product descriptions
- Flag when CBP has overruled importers on similar goods
- Link to binding ruling request process when confidence < 85%

**F-703: UFLPA Compliance Screen**
- Xinjiang forced labor risk screening against UFLPA Entity List
- Flag goods where country of origin + HTS chapter triggers enhanced scrutiny
- SE Asia transshipment risk assessment (goods routed through Vietnam/Cambodia to circumvent origin rules)
- Documentation requirements when UFLPA rebuttable presumption may apply

**F-704: Classification Feedback Loop**
- Users can mark classifications as correct or incorrect
- Incorrect classifications feed into agent improvement queue
- Monthly accuracy report: % correct on first pass, distribution of confidence scores
- Escalation path for contested classifications (flag for human expert review)

#### M7–M8 Success Criteria
- HTS classification > 90% accuracy at 6-digit level on 100-product test set
- Classification completes in < 10 seconds
- UFLPA Entity List updated within 24h of CBP publication
- Users who use Classification Agent run 3x more calculations than non-users

---

### M9–M10 — Document Processing Agent

**Objective:** Automate extraction, validation, and cross-checking of the 7–12 documents required for every international shipment.

#### Features

**F-801: Document Intelligence Engine**
- Claude Vision API for scanned/image documents (JPG, PNG, PDF with images)
- Structured extraction schema per document type
- Cross-document validation: invoice value matches BOL declared value, HTS codes consistent across all docs
- Discrepancy report with severity classification (critical vs. advisory)

**F-802: Automated Compliance Checklist**
- Per-shipment checklist generated from: origin country, destination port, commodity HTS, import value
- Required documents auto-identified: Commercial Invoice, Packing List, BOL, ISF, CBP Entry Summary, Certificate of Origin, phytosanitary certificates (produce), FDA prior notice (food/pharma)
- Checklist tracks which docs have been uploaded and validated

**F-803: Certificate of Origin Validator**
- GSP eligibility check (Generalized System of Preferences — currently suspended, but watch list)
- USMCA rules of origin for Mexico/Canada content
- FTA eligibility: US-Korea, US-Singapore, US-Australia, CAFTA-DR
- Substantial transformation test for goods processed through third countries

**F-804: Document Assembly Workflow**
- Generate compliant document packets: collect + validate + assemble in correct order
- Flag missing or expired documents before vessel departure
- Export complete document set as ZIP archive or single merged PDF
- Shareable link for customs broker handoff

#### M9–M10 Success Criteria
- Document extraction accuracy > 85% on typed PDFs, > 70% on scanned images
- Cross-document validation catches discrepancies that would trigger CBP exams
- Compliance checklist correctly identifies required documents for 50 test shipments
- Users report 50%+ reduction in document preparation time

---

### M11–M12 — Route Optimization Agent + Tariff Scenario Modeling

**Objective:** Deploy the route optimization agent that evaluates multi-variable trade-offs and provides a ranked recommendation. Add political/tariff scenario modeling for strategic planning.

#### Features

**F-901: Route Optimization Agent**
- Multi-variable optimization across: total cost, transit time, reliability, carbon footprint, transshipment risk
- User sets priority weights (e.g., cost 50%, speed 30%, reliability 20%)
- Agent explains trade-offs in plain language ("Route B costs $800 more but arrives 12 days earlier — at $2/unit margin, you need to sell 400 units in those 12 days to break even")
- Seasonal adjustment: monsoon risk, Chinese New Year shutdowns, West Coast port labor actions
- Historical on-time performance by carrier and route (scraped from public sources)

**F-902: Tariff Scenario Modeling**
- Section 301 tariff escalation scenarios: what if rates go from 25% → 45% → 60%?
- De minimis threshold change modeling (potential elimination from $800 → $0)
- Country-of-origin pivot analysis: if Chinese tariffs increase, what does shifting to Vietnam/India cost?
- FTZ lock-in scenario: how much do you save by entering FTZ at today's rates vs. waiting 6 months?

**F-903: Cold Chain Overlay**
- Reefer container cost premium by route and season
- Temperature-controlled drayage availability by port
- Cold storage FTZ mapping (which FTZs have temperature-controlled facilities)
- Spoilage risk modeling based on transit time and known reefer reliability by carrier

**F-904: AI Insights Feed**
- Daily digest: rate changes > 10%, new tariff actions, CBP enforcement trends
- Weekly port congestion outlook
- Quarterly tariff strategy review recommendations
- Push to email or in-app notification center

#### M11–M12 Success Criteria
- Route optimization agent produces ranked recommendation in < 15 seconds
- Tariff scenario modeling covers all active Section 301 and 232 actions
- Cold chain overlay available for 20+ major reefer routes
- AI insights feed has 40%+ open rate on weekly digest emails

---

## 7. Phase 4 — Scale & Enterprise (M13–M18)

### Theme: "Platform, Not Tool"

**Goal:** Transform Shipping Savior from a single-user tool into a multi-tenant enterprise platform with API access, partner integrations, and white-label capability.

### M13–M14 — Multi-Tenant Architecture

#### Features

**F-1001: Organization Accounts**
- Team workspaces with shared shipments, calculations, and documents
- Role-based access: Owner, Admin, Analyst, Viewer
- Audit log: who ran what calculation, when, with what inputs
- SSO via Google Workspace and Microsoft Entra (SAML 2.0)

**F-1002: Data Isolation & Compliance**
- Row-level security in PostgreSQL — tenants cannot see each other's data
- SOC 2 Type I readiness (access controls, encryption at rest, audit logs)
- Data retention policies: configurable per organization (30 days → 7 years)
- GDPR-compliant data deletion workflow

**F-1003: Team Collaboration Features**
- Shared saved searches and calculation templates
- Comments on shipments and calculations
- @mentions with in-app and email notification
- Shared FTZ strategy workbooks (multi-scenario comparisons across team)

---

### M15–M16 — Enterprise Features + API Marketplace

#### Features

**F-1101: Public API**
- REST API for all core calculators (landed cost, HTS lookup, FTZ analyzer, route comparison)
- Rate limits: 100 req/day (free), 10,000 req/day (pro), unlimited (enterprise)
- API key management in account dashboard
- OpenAPI 3.0 specification + interactive docs (Scalar or Redoc)
- Webhooks for container tracking events

**F-1102: ERP/TMS Integrations**
- NetSuite: sync landed cost calculations to purchase orders
- SAP TM: export route comparisons and carrier assignments
- Shopify: import product catalog for automatic HTS classification
- QuickBooks Online: sync duty payments to COA

**F-1103: Customs Broker Portal**
- White-label interface for customs brokers to run calculations on behalf of importer clients
- Client management: multiple importer accounts under one broker login
- Bulk document processing queue
- Compliance report generation for client audits

**F-1104: Carrier Partner Integrations**
- Direct rate feed partnerships with Maersk, MSC, Hapag-Lloyd
- Booking capability: submit booking request directly from route comparison view
- Carrier confirmation received in dashboard
- Automated BOL number capture into tracking system

---

### M17–M18 — AI Platform Maturity + International Expansion

#### Features

**F-1201: AI Agent Marketplace**
- Plug-in architecture for third-party AI agents
- Community-contributed classification models for niche commodity categories
- Partner data feeds: Panjiva/ImportGenius for competitor trade intelligence
- Agent performance leaderboard by accuracy and speed

**F-1202: International Customs Coverage**
- EU customs tariff (TARIC) integration — covering EU27 import classification
- UK Global Tariff post-Brexit rules
- Canada CBSA tariff schedule
- Mexico LIGIE tariff schedule (USMCA sourcing strategies)
- Cross-border routing: optimize duty liability across multiple destination countries

**F-1203: Predictive Analytics**
- ML-based rate forecasting: predict spot rate direction 30/60/90 days out
- Demand seasonality modeling: when to book containers for peak season (Q3/Q4)
- Supplier risk scoring based on trade flow data
- Portfolio-level duty exposure dashboard for multi-product importers

**F-1204: Mobile Applications**
- iOS and Android native apps (React Native)
- Core features: container tracking, duty estimates, document scan + upload
- Biometric auth
- Offline mode for saved calculations and documents

---

## 8. Feature Prioritization Matrix

**Scoring:** Impact (1–5) × User Demand (1–5) ÷ Effort (1–5). Higher score = higher priority.

| # | Feature | Impact | Demand | Effort | Score | Phase |
|---|---------|--------|--------|--------|-------|-------|
| 1 | HTS Lookup with real USITC data | 5 | 5 | 2 | 12.5 | P1/M1 |
| 2 | Landed Cost Calculator (all 15 components) | 5 | 5 | 2 | 12.5 | P1/M1 |
| 3 | FTZ Savings Analyzer (PF vs. GPA) | 5 | 4 | 3 | 6.7 | P1/M3 |
| 4 | Route/Carrier Comparison (3-up) | 4 | 5 | 2 | 10.0 | P1/M2 |
| 5 | PDF Export of calculations | 4 | 5 | 1 | 20.0 | P1/M1 |
| 6 | User authentication + dashboard persistence | 4 | 4 | 2 | 8.0 | P1/M3 |
| 7 | Container Tracking (Terminal49) | 5 | 4 | 2 | 10.0 | P2/M6 |
| 8 | Live carrier rate feeds (FBX) | 5 | 4 | 3 | 6.7 | P2/M4 |
| 9 | Document upload + parser | 4 | 3 | 3 | 4.0 | P2/M5 |
| 10 | ISF compliance checker | 5 | 3 | 2 | 7.5 | P2/M5 |
| 11 | Interactive shipping route map | 3 | 4 | 3 | 4.0 | P1/M2 |
| 12 | HTS Classification Agent (AI) | 5 | 4 | 4 | 5.0 | P3/M7 |
| 13 | UFLPA compliance screen | 4 | 3 | 3 | 4.0 | P3/M7 |
| 14 | Vessel schedule aggregator | 3 | 4 | 3 | 4.0 | P1/M2 |
| 15 | CBP ruling cross-reference | 4 | 3 | 3 | 4.0 | P3/M8 |
| 16 | Document Processing Agent (AI) | 5 | 3 | 4 | 3.8 | P3/M9 |
| 17 | Tariff scenario modeling | 4 | 4 | 3 | 5.3 | P3/M11 |
| 18 | Route Optimization Agent (AI) | 4 | 3 | 4 | 3.0 | P3/M11 |
| 19 | Cold chain reefer overlay | 3 | 3 | 3 | 3.0 | P3/M12 |
| 20 | Email notifications / alerts | 3 | 4 | 1 | 12.0 | P2/M6 |
| 21 | AI insights feed (daily digest) | 3 | 3 | 3 | 3.0 | P3/M12 |
| 22 | Organization/team accounts | 4 | 3 | 4 | 3.0 | P4/M13 |
| 23 | Public REST API | 4 | 3 | 3 | 4.0 | P4/M15 |
| 24 | ERP integrations (NetSuite, SAP) | 4 | 2 | 4 | 2.0 | P4/M15 |
| 25 | Customs broker white-label portal | 4 | 3 | 3 | 4.0 | P4/M16 |
| 26 | Certificate of origin validator | 4 | 3 | 2 | 6.0 | P2/M5 |
| 27 | FTZ site finder map | 3 | 3 | 2 | 4.5 | P1/M3 |
| 28 | Container utilization (enhanced) | 3 | 4 | 1 | 12.0 | P1/M1 |
| 29 | International customs coverage (EU/UK) | 4 | 2 | 4 | 2.0 | P4/M18 |
| 30 | Mobile app (iOS/Android) | 3 | 3 | 5 | 1.8 | P4/M18 |

**Priority Tiers:**
- **Critical (Score > 8):** Features 1, 2, 4, 5, 6, 7, 20, 28 — ship in Phase 1–2
- **High (Score 4–8):** Features 3, 8, 10, 11, 12, 13, 14, 17, 23, 26, 27 — ship in Phase 2–3
- **Medium (Score 2–4):** Features 9, 15, 16, 18, 19, 21, 22, 24, 25 — ship in Phase 3–4
- **Low (Score < 2):** Features 29, 30 — Phase 4 or deprioritize

---

## 9. User Journey Maps

### Journey A — Importer: "First-Time Landed Cost"

**Scenario:** An independent importer considering a new apparel supplier in Vietnam. They want to know if the margins work before committing to a container.

```
DISCOVERY
  ↓
1. Finds Shipping Savior via Google ("landed cost calculator Vietnam apparel")
2. Lands on homepage — sees Unit Economics Calculator embedded above fold
3. Enters: Origin cost $3.50/unit, 8,000 units, 40ft container, $4,200 freight, 12.5% duty (HTS 6109.10)
4. Calculator returns: $1.02 landed cost — margin of 58% to $2.45 wholesale. Decision viable.
   → AHA MOMENT: sees breakdown of all 15 cost components, realizes they forgot MPF ($0.08/unit)

EXPLORATION
  ↓
5. Clicks "Verify your HTS code" → HTS Lookup
6. Searches "cotton t-shirts" → gets HTS 6109.10.00 confirmed, 16.5% rate not 12.5% (flag!)
7. Re-runs landed cost with corrected rate → margin drops to 54% — still viable
8. Clicks "Check if FTZ saves you money" → FTZ Analyzer

FTZ EVALUATION
  ↓
9. Enters: 8,000 units × 12 containers/year, current duty rate 16.5%, FTZ entry cost $20K/year
10. FTZ Analyzer: saves $18,400/year at current rates — borderline
11. Runs tariff escalation scenario: if rates rise to 25%, FTZ saves $47,200/year — clear win
12. Downloads PDF of FTZ analysis for accountant

ACTION
  ↓
13. Creates free account to save calculation
14. Adds first shipment to dashboard (Pre-Production status)
15. Returns 3 weeks later when container is booked to upload Commercial Invoice for ISF check
```

**Failure Points & Mitigations:**
- Incorrect HTS code → HTS Lookup immediately adjacent to calculator, prominent "verify" CTA
- Overwhelmed by 15-component breakdown → progressive disclosure — show 4 main costs first, expandable details
- Cannot interpret FTZ analysis → plain-language recommendation ("At current rates, FTZ breaks even in 13 months. If tariffs rise 5%+, it's an immediate win.")

---

### Journey B — Freight Broker: "Client Proposal in 10 Minutes"

**Scenario:** A freight broker has a client asking for a quote on importing 500 CBM of ceramic tiles from Guangzhou to Los Angeles. Client wants 3 options by EOD.

```
PROFESSIONAL WORKFLOW
  ↓
1. Broker logs into Shipping Savior dashboard
2. Navigates to Route Comparison tool
3. Enters: Guangzhou (CNGGZ) → Los Angeles (USLAX), 500 CBM, 33,000kg, FCL
4. System returns 3 carrier options with live FBX-adjusted rates:
   - Option A: Maersk (direct) — 14 days, $4,800/FEU, reliability 94%
   - Option B: CMA CGM (via Singapore) — 19 days, $3,900/FEU, reliability 88%
   - Option C: COSCO (direct) — 16 days, $4,200/FEU, reliability 91%

ENHANCEMENT
  ↓
5. Broker notes ceramic tiles fall under HTS 6907.21 — runs HTS lookup
6. Adds antidumping duty (ADD) — ceramic tiles from China have 330% ADD rate (!)
7. Landed cost with ADD: total duty + ADD = 342% — makes China sourcing economically unviable
8. Broker pivots: re-runs for India (INMAA → USLAX) — 4.5% duty, no ADD
9. India route comparison: 22 days, $5,600/FEU — still significantly cheaper with 342% savings on ADD

DELIVERY
  ↓
10. Selects India route option, generates 3-option PDF proposal
11. PDF includes: route comparison table, cost breakdown, HTS code + duty calculation, ADD disclaimer
12. Sends to client within 8 minutes of starting
13. Saves proposal as template "Ceramics - India Import" for future quotes
```

**Key Differentiators Demonstrated:**
- ADD/CVD detection — most brokers miss this; avoiding it is worth thousands per container
- India route pivot — platform makes alternative sourcing analysis trivial
- PDF export — professional enough to send directly to client without reformatting

---

### Journey C — FTZ Operator: "PF vs. GPA Status Election"

**Scenario:** A 3PL operating an FTZ subzone is helping a client decide between Production-Foreign (PF) and General-Purpose Area (GPA) status for a new commodity line — electronic components from China subject to reciprocal tariffs.

```
REGULATORY CONTEXT
  ↓
1. FTZ manager opens FTZ Analyzer
2. Enters commodity: HTS 8542.31 (electronic integrated circuits)
3. Platform flags: "April 2025 executive order applies — this HTS falls within reciprocal tariff scope. PF status mandatory for goods subject to this order."
4. System disables GPA option for this HTS — removes decision ambiguity entirely

ECONOMIC MODELING
  ↓
5. Enters inventory parameters:
   - Weekly receipts: 50,000 units
   - Unit cost: $4.20 (tariff assessed on this value)
   - Current duty rate: 145% (Section 301 + reciprocal tariff stacked)
   - Projected withdrawal pace: 40,000 units/week
6. PF election locks rate at 145% on date of admission
7. Scenario A: rates rise to 200% in 6 months → PF saves $0.235/unit on units still in zone
8. Scenario B: rates fall to 80% after trade deal → PF costs $0.273/unit premium vs. current market rate
9. Platform calculates: probability-weighted NPV of PF election given 3 rate scenarios with user-set weights

WITHDRAWAL PLANNING
  ↓
10. Clicks "Withdrawal Scheduler" tab
11. Plans 40K units/week withdrawal over 8 months (320K total)
12. Platform generates week-by-week withdrawal calendar with:
    - Duty owed at locked rate per week
    - Cash flow forecast
    - Cumulative savings vs. duty-at-import strategy
13. Downloads withdrawal plan as XLSX for finance team
14. Creates recurring dashboard reminder to review plan quarterly
```

**Key Value:** No existing platform offers mandatory PF status flagging based on executive order scope, withdrawal scheduling, or probability-weighted NPV modeling. This is the FTZ operator's primary decision support tool.

---

## 10. Key Milestones & Success Criteria

### Phase 1 Milestones

| Milestone | Date | Success Criteria | Owner |
|-----------|------|-----------------|-------|
| M1: Data Foundation Live | M1 end | HTS lookup returns real USITC rates; landed cost includes all 15 components | Engineering |
| M2: Route Map + Comparison | M2 end | Interactive route map renders; PDF export complete; 3 carrier options shown | Engineering |
| M3: First Paying User | M3 end | ≥1 user paying at any price point; running ≥3 calcs/week | Product + Sales |
| Phase 1 Gate | M3 end | MAC ≥ 500/month; NPS ≥ 30; 0 critical bugs | Product |

### Phase 2 Milestones

| Milestone | Date | Success Criteria | Owner |
|-----------|------|-----------------|-------|
| M4: Live Rates | M4 end | FBX + Maersk + CMA CGM rates refresh daily; < 24h data latency | Engineering |
| M5: Document Intelligence | M5 end | Parser extracts HTS from invoice with > 80% accuracy; ISF checker flags all 10 elements | Engineering |
| M6: Container Tracking | M6 end | Terminal49 integration live; alerts delivered in < 5min; 5+ test shipments tracked | Engineering |
| Phase 2 Gate | M6 end | MAC ≥ 2,500/month; ≥10 paying accounts; ≥1 freight broker customer | Product |

### Phase 3 Milestones

| Milestone | Date | Success Criteria | Owner |
|-----------|------|-----------------|-------|
| M8: HTS Agent Accuracy | M8 end | > 90% 6-digit accuracy on 100-product test set | AI/ML |
| M10: Document Agent | M10 end | > 85% extraction accuracy; cross-doc validation works on 50 test shipments | AI/ML |
| M12: Route Optimizer | M12 end | Recommendation in < 15s; covers 20+ reefer routes; tariff scenarios include all active 301/232 | Engineering |
| Phase 3 Gate | M12 end | MAC ≥ 10,000/month; MRR ≥ $5,000; NPS ≥ 40 | Product |

### Phase 4 Milestones

| Milestone | Date | Success Criteria | Owner |
|-----------|------|-----------------|-------|
| M14: Multi-Tenant | M14 end | Row-level security validated; SSO works with Google + Microsoft; audit logs complete | Engineering |
| M16: API + Integrations | M16 end | Public API documented with OpenAPI spec; NetSuite integration tested with 2 customers | Engineering |
| M18: Scale | M18 end | MAC ≥ 100,000/month; MRR ≥ $50,000; ≥ 500 paying accounts | Product |

### Go/No-Go Gates

Each phase gate requires a formal review:
- **Technical:** Zero Sev-1 bugs, all success criteria met, load test passed at 10x projected users
- **Product:** User research sessions completed, NPS measured, at least 3 user interviews per persona
- **Business:** Revenue target met or clear path to meet within 30 days of gate

---

## 11. Technical Debt & Infrastructure Considerations

### Current Technical Debt (Phase 0)

| Item | Severity | Phase to Resolve |
|------|----------|-----------------|
| All data is static/mock — no validation against real sources | HIGH | P1/M1 |
| No floating-point precision library (risk of calculation drift) | HIGH | P1/M1 |
| No error boundary handling for calculator edge cases | MEDIUM | P1/M1 |
| searoute-js untested on SE Asia port pairs | MEDIUM | P1/M2 |
| No accessibility audit (WCAG 2.1 AA) | MEDIUM | P2/M4 |
| No automated test suite (unit, integration, E2E) | HIGH | P1/M1 |
| No rate limiting on API routes | MEDIUM | P2/M5 |
| No content security policy headers | LOW | P2/M5 |

### Infrastructure Roadmap

**Phase 1 Infrastructure:**
- PostgreSQL on Neon (free tier → pro as users grow)
- Drizzle ORM with typed migrations
- Vercel deployment with Edge middleware for auth
- Cron jobs via Vercel Cron (weekly rate data refresh)
- Vercel Blob for document storage (Phase 2 ready)

**Phase 2 Infrastructure Additions:**
- Redis (Upstash) for rate-limited API caching (carrier rate feeds)
- Background job queue (Inngest or Trigger.dev) for document processing
- Structured logging (Axiom or Baselime)
- Error monitoring (Sentry)
- Uptime monitoring (Better Uptime)

**Phase 3 Infrastructure Additions:**
- AI agent orchestration: LangGraph or custom state machine
- Vector database (Pinecone or pgvector) for HTS embedding search
- Model fine-tuning pipeline for classification accuracy improvements
- Streaming responses for AI agent outputs (SSE or WebSocket)

**Phase 4 Infrastructure Additions:**
- Multi-region deployment (US East, US West, EU) for < 200ms latency globally
- SOC 2 audit preparation: formal access controls, encryption key management, vendor reviews
- API gateway (Kong or AWS API Gateway) for partner API management
- CDN for static assets and heavy datasets (HTS JSON, port database)

### Scaling Assumptions

| Users | Database | API Calls/day | Infrastructure Cost |
|-------|----------|---------------|---------------------|
| 50 | Neon free | 1,000 | $0/month |
| 500 | Neon Pro | 10,000 | ~$200/month |
| 5,000 | Neon Pro + read replicas | 100,000 | ~$800/month |
| 50,000 | Neon Scale or RDS | 1,000,000 | ~$3,000/month |

---

## 12. Mobile Strategy

### Recommendation: PWA First, Native Second

**Rationale:** The primary user workflow — running a calculation, uploading a document, checking container status — is well-suited to a responsive web app with PWA capabilities. Native apps are expensive to maintain and require App Store approval cycles that slow feature velocity.

**Phase 1–3: Responsive Web + PWA**
- Mobile-first responsive design from day one (Tailwind breakpoints)
- PWA manifest: installable, app icon, splash screen
- Service Worker: cache static assets and last-used calculations offline
- Offline mode: saved calculations accessible without internet
- Push notifications: container tracking alerts via Web Push API
- Target: 90+ Lighthouse mobile performance score

**Phase 4: Native Mobile Apps (React Native)**
- Only after PWA achieves > 20% of sessions from mobile
- Priority features for native: document scanning (camera), biometric auth, push reliability
- Shared business logic between web and native via shared TypeScript modules
- Platform: React Native (reuses existing React knowledge, Expo for faster iteration)
- iOS first (enterprise users skew iOS), Android 3 months later

**Mobile-Critical Features:**
- Container tracking: primary mobile use case — field teams checking container status
- Document capture: photograph physical BOLs and invoices at port
- Quick duty estimate: broker needs a number while on the phone with a client

---

## 13. Integration Roadmap

### Carrier API Priority Order

| Priority | Carrier/Source | Data | API Type | Cost | Phase |
|----------|---------------|------|----------|------|-------|
| 1 | Maersk Developer Portal | Sailing schedules + spot rates | REST (free) | $0 | P2/M4 |
| 2 | CMA CGM API Portal | Schedules + rates | REST (free) | $0 | P2/M4 |
| 3 | Freightos Baltic Index (FBX) | Market rate indices | REST (paid) | ~$500/mo | P2/M4 |
| 4 | Terminal49 | Container tracking | REST (free tier) | $0–$200/mo | P2/M6 |
| 5 | Hapag-Lloyd Developer | Schedules + B/L tracking | REST (free) | $0 | P3/M9 |
| 6 | MSC APIs | Schedules | REST (contact required) | TBD | P3/M9 |
| 7 | Evergreen Line | Schedules | Scraping (no API) | $0 | P3/M10 |
| 8 | COSCO | Schedules | Scraping (no API) | $0 | P3/M10 |

### Government Data Sources

| Source | Data | Integration Method | Phase |
|--------|------|--------------------|-------|
| USITC HTS API | 17K+ tariff codes + rates | REST + JSON download | P1/M1 |
| OFIS (trade.gov) | 260+ FTZ locations | JSON download | P1/M3 |
| UN/LOCODE | 100K+ port codes | CSV download | P1/M2 |
| World Port Index (NGA) | 3,700+ ports + coordinates | CSV download | P1/M2 |
| USITC DataWeb | Trade statistics | REST API | P2/M5 |
| CBP CROSS | Binding rulings database | Web scraping | P3/M8 |
| UFLPA Entity List | Forced labor enforcement | CSV download (CBP) | P3/M7 |

### Third-Party SaaS Integrations

| System | Integration Type | Value | Phase |
|--------|-----------------|-------|-------|
| Resend / SendGrid | Email notifications | Container alerts, digest emails | P2/M6 |
| Anthropic Claude | AI classification + document processing | Core AI features | P3/M7 |
| Pinecone or pgvector | Vector search for HTS embeddings | Classification accuracy | P3/M7 |
| Inngest | Background job queue | Document processing, rate refresh | P2/M5 |
| Sentry | Error monitoring | Production stability | P2/M4 |
| NetSuite REST API | ERP sync | Enterprise landed cost data | P4/M15 |
| Shopify Admin API | Product catalog import | Auto-classification | P4/M15 |

### Integration Principles

1. **Free government data first** — USITC, OFIS, UN/LOCODE, World Port Index are free and reliable. Use them before any paid API.
2. **Carrier APIs before scrapers** — official APIs are more stable. Scraping only when no API exists.
3. **Cache aggressively** — carrier rates expire in 24h; HTS rates change with policy announcements (flag, don't auto-refresh mid-session)
4. **Always show data provenance** — every piece of data must display its source and last-updated timestamp
5. **Graceful degradation** — if a live feed is down, show cached data with a staleness warning rather than an error state

---

## 14. Risk Register

### R-01: Tariff Policy Volatility
**Description:** US tariff rates are changing faster than at any point since the Smoot-Hawley era. Section 301, Section 232, and reciprocal tariff executive orders have each changed rates multiple times within a single year. Static HTS data becomes stale within weeks of a major policy event.
**Probability:** HIGH
**Impact:** HIGH — calculations using wrong duty rates damage user trust and could cause real financial harm
**Mitigation:**
- Subscribe to USITC change notifications and Federal Register alerts
- Display data currency prominently ("Tariff data as of [date]. Executive order changes may not be reflected.")
- Build manual override field so users can input confirmed rate
- Partner with a customs attorney for rate validation on major policy changes
- Phase 3: AI agent monitors Federal Register for tariff actions and flags affected HTS codes within 24h

---

### R-02: HTS Classification Errors (AI Hallucination)
**Description:** The HTS Classification Agent could produce incorrect 10-digit codes with high confidence. An importer who acts on an incorrect classification faces CBP penalties of $5,000+ per entry.
**Probability:** MEDIUM (AI classification is genuinely hard for edge cases)
**Impact:** VERY HIGH — legal and financial liability for users
**Mitigation:**
- Prominent disclaimer: "Shipping Savior classification suggestions are for research purposes only. CBP binding rulings are the only legally reliable classification. Consult a licensed customs broker for import transactions."
- Always show 2–3 alternative codes with confidence percentages
- Link every classification to CBP CROSS ruling database for cross-reference
- Flag when confidence < 85% with explicit "seek professional review" warning
- Do not market the tool as a replacement for a customs broker
- Consider liability disclaimer acceptance flow before AI classification results display

---

### R-03: FTZ Status Election Irreversibility
**Description:** FTZ PF vs. GPA status election is irrevocable once made with CBP. A wrong recommendation could cost an operator hundreds of thousands of dollars in excess duty.
**Probability:** LOW (user is the decision-maker, not the platform)
**Impact:** CATASTROPHIC — could be existential reputational event
**Mitigation:**
- FTZ Analyzer always ends with: "Status elections are irrevocable. This analysis is for planning purposes only. File elections only after review with a licensed customs attorney and your FTZ grantee."
- Require checkbox confirmation before showing final recommendation
- The platform provides modeling, not advice — language reviewed by counsel before launch
- April 2025 executive order PF mandate flag prevents users from modeling GPA for in-scope goods

---

### R-04: Carrier API Rate Limits and Pricing Changes
**Description:** Maersk and CMA CGM may change their free API tier terms, restrict access, or introduce paid tiers. The Freightos Baltic Index API is already paid.
**Probability:** MEDIUM
**Impact:** MEDIUM — live rates become unavailable, falls back to static estimates
**Mitigation:**
- Architect carrier integration as pluggable adapters — swapping one carrier for another takes < 1 day
- Maintain static published rate schedules as fallback (less accurate but functional)
- Evaluate Xeneta or Shifl as FBX alternatives
- Budget $500–$2,000/month for data licensing by M6

---

### R-05: searoute-js Reliability for SE Asia Routes
**Description:** searoute-js (306 weekly npm downloads) is a low-traffic library and may have bugs or missing route segments for specific SE Asia port pairs.
**Probability:** MEDIUM
**Impact:** LOW-MEDIUM — map routes display incorrectly or fall back to straight lines
**Mitigation:**
- Test searoute-js against 20 real SE Asia → US port pairs in M2
- Fallback: great-circle arc rendering (always works, less accurate)
- Alternative: Searoutes commercial API (paid but reliable)
- If searoute-js fails < 50% of test cases, switch to great-circle arcs before launch

---

### R-06: UFLPA Compliance Scope Expansion
**Description:** The Uyghur Forced Labor Prevention Act Entity List is actively expanding. New entities are added with no advance notice. Goods already in transit may become non-importable.
**Probability:** HIGH (Entity List has grown every quarter since 2022)
**Impact:** HIGH — users who source from entity-listed suppliers face rebuttable presumption of forced labor (effectively an import ban)
**Mitigation:**
- UFLPA Entity List refreshed daily via CBP automated download
- Alert system: notify users tracking shipments whose suppliers appear on newly added entities
- Clear educational content on what happens when rebuttable presumption applies
- Link to CBP's rebuttal documentation requirements

---

### R-07: Data Privacy and Document Security
**Description:** Users upload sensitive commercial documents — invoices with pricing, packing lists with quantities, BOLs with counterparty information. This is competitively sensitive trade data.
**Probability:** LOW (security is engineered in from day one)
**Impact:** HIGH — data breach of trade data destroys user trust instantly
**Mitigation:**
- All documents encrypted at rest (Vercel Blob AES-256) and in transit (TLS 1.3)
- Document access scoped strictly to the uploading account (row-level security)
- No document data used for training AI models without explicit opt-in consent
- Data retention policy: documents auto-deleted after 90 days unless user opts into extended retention
- SOC 2 Type I preparation begins in Phase 4

---

### R-08: Market Timing — Tariff Volatility May Freeze Import Decisions
**Description:** Extreme tariff uncertainty (145% China rates, potential de minimis elimination) may cause importers to pause or reduce orders, shrinking the total addressable market in the near term.
**Probability:** MEDIUM
**Impact:** MEDIUM — fewer active shipments = fewer users needing the tool
**Mitigation:**
- Uncertainty is actually a tailwind for the platform — importers need better analysis tools when rates are volatile, not when they're stable
- Tariff scenario modeling (F-902) is specifically designed for high-volatility environments
- FTZ strategy becomes more valuable as duties rise — directly monetizable insight
- Freight brokers who serve clients through uncertainty are high-value customers

---

### R-09: Competition from Flexport / Freightos Feature Expansion
**Description:** Flexport, Freightos, and Xeneta could expand into the analytical tools space, bundling calculator features into their existing freight platforms.
**Probability:** MEDIUM
**Impact:** MEDIUM — these platforms serve enterprise shippers, not the mid-market importer or independent broker
**Mitigation:**
- FTZ Analyzer with incremental withdrawal modeling is zero-overlap with any existing product
- AI HTS classification agent + compliance screen is not available in any logistics platform
- Speed advantage: ship features in weeks, not quarters
- SMB focus: Flexport targets 7-figure shippers; our sweet spot is $50K–$2M annual duty spend

---

### Risk Heat Map

```
         │ LOW Impact │ MED Impact │ HIGH Impact │ V.HIGH Impact │
─────────┼────────────┼────────────┼─────────────┼───────────────┤
HIGH     │            │  R-08      │  R-01       │               │
Prob     │            │  R-09      │  R-06       │               │
─────────┼────────────┼────────────┼─────────────┼───────────────┤
MEDIUM   │  R-05      │  R-04      │             │  R-02         │
Prob     │            │  R-08      │             │               │
─────────┼────────────┼────────────┼─────────────┼───────────────┤
LOW      │            │            │  R-07       │  R-03         │
Prob     │            │            │             │               │
─────────┴────────────┴────────────┴─────────────┴───────────────┘

Priority order: R-02 → R-03 → R-01 → R-06 → R-07 → R-04 → R-05 → R-08 → R-09
```

---

## Beta Program Structure

### Beta Cohort Design

**Size:** 15–20 users across 3 persona types
- 8 independent importers (Persona A)
- 5 freight brokers (Persona B)
- 3–4 FTZ operators / customs brokers (Persona C)

**Duration:** 8 weeks per cohort, starting at M3 (Phase 1 complete)

**Selection Criteria:**
- At least 1 active import shipment in the last 6 months
- Willingness to do a 30-minute weekly feedback call for 4 weeks
- Representative geography: West Coast (LA/Long Beach port), East Coast (NY/NJ), Midwest (Chicago)

### Feedback Loops

| Loop | Frequency | Format | Owner |
|------|-----------|--------|-------|
| In-app feedback widget | Continuous | NPS + 1 open question per session | Product |
| Weekly call (first 4 weeks) | Weekly | 30-min structured interview | Product |
| Beta Slack channel | Ongoing | Async discussion and bug reports | Product + Engineering |
| Calculation accuracy review | Monthly | 10-calculation sample audited by customs expert | Product + Compliance |
| Churn debrief | On event | 30-min exit interview if user stops using | Product |

### Beta Monetization

- Beta cohort: $0 for first 8 weeks
- Week 9: offer founding member pricing ($49/month, locked for 12 months)
- Exit survey for non-converters: what would make you pay?

### Iteration Cycle

- **Week 1–2:** Deploy and onboard
- **Week 3–4:** First feedback synthesis, ship critical fixes (< 48h SLA for Sev-1)
- **Week 5–6:** Ship 2–3 features from beta feedback prioritization
- **Week 7–8:** Final polish, pricing validation, prepare for GA launch

---

*Document created: 2026-03-26*
*Linear: AI-5408*
*Parent: AI-5379 (Phase 2: Planning)*
*Next: AI-5409 or equivalent — Architecture Planning*
