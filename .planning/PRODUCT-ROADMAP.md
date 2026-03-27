# Shipping Savior — Product Roadmap

**Linear:** AI-5456
**Created:** 2026-03-26
**Status:** Planning
**Owner:** Ai Acrobatics / Shipping Savior Project
**Horizon:** 18 Months (Phase 0 → Phase 4)

---

## Table of Contents

1. [Vision Statement](#1-vision-statement)
2. [Phase 1: MVP — What's Already Built](#2-phase-1-mvp--whats-already-built)
3. [Phase 2: Core Features (M1–M6)](#3-phase-2-core-features-m1m6)
4. [Phase 3: AI Features (M7–M12)](#4-phase-3-ai-features-m7m12)
5. [Phase 4: Enterprise (M13–M18)](#5-phase-4-enterprise-m13m18)
6. [Quarterly Milestone Targets](#6-quarterly-milestone-targets)
7. [Feature Prioritization Framework](#7-feature-prioritization-framework)
8. [Success Metrics Per Phase](#8-success-metrics-per-phase)
9. [User Personas](#9-user-personas)
10. [Risk Register](#10-risk-register)

---

## 1. Vision Statement

**Shipping Savior is the command center for every dollar that moves through international supply chains** — giving freight operators, importers, and FTZ users the analytical infrastructure of a $10M logistics team at a fraction of the cost.

We transform the most opaque, penalty-laden, data-heavy corner of global commerce into a platform where anyone can calculate true landed costs, optimize duty strategy, compare carrier routes, and deploy AI agents to automate the paper-intensive compliance workflow — all without a Bloomberg terminal or a 30-person customs brokerage on retainer.

### North Star Metric

**Monthly Active Calculations (MAC)** — the total number of unique calculator runs, HTS lookups, route comparisons, and FTZ analyses completed per month.

Every value-generating action on the platform flows through a calculation. MAC correlates directly with platform stickiness, pricing leverage, and the feedback loop that improves AI classification accuracy.

| Milestone | MAC Target |
|-----------|-----------|
| Phase 2 complete (M6) | 1,000 / month |
| Phase 3 complete (M12) | 10,000 / month |
| Phase 4 complete (M18) | 100,000 / month |

---

## 2. Phase 1: MVP — What's Already Built

**Status: Live**
**URL:** shipping-savior.vercel.app

Phase 1 is the interactive proposal/demo platform. It uses static JSON datasets and client-side TypeScript calculators. No auth, no database, no paid APIs. The goal was to validate the UX and communicate the platform vision.

### Built Features

#### Calculators (Client-Side, Zero Latency)
- **Unit Economics Calculator** — $0.10 origin → $0.50 landed → $2.00 wholesale → $5.00 retail margin chain with per-unit and container-level totals
- **Landed Cost Calculator** — Handles FOB/CIF/DDP incoterms, MPF, HMF, Section 301 tariffs, insurance, brokerage fees, inland freight
- **FTZ Savings Analyzer** — PF vs. GPA status comparison; rate lock modeling; incremental pallet withdrawal scheduling; NPV of duty deferral
- **PF/Non-PF Calculator** — April 2025 executive order impact; irrevocable status election analysis
- **Container Utilization Calculator** — Units per container by product dimensions; volume AND weight limits (uses the lower); cost-per-unit at scale
- **Tariff Scenario Builder** — Multi-scenario tariff rate comparison; saved scenarios

#### Data Tools
- **HTS Code Lookup** — Fuse.js search over 200+ representative SE Asia consumer goods codes with duty rates
- **Port Comparison Tool** — Side-by-side port analysis with annual TEU, infrastructure notes
- **Interactive Route Map** — MapLibre + deck.gl: arc layers for shipping routes, scatter plot for ports, FTZ boundary overlays

#### Dashboard Wireframes
- **Shipment Tracking** — Kanban board: sourcing → transit → customs → FTZ → delivered
- **Analytics Dashboard** — Cost/margin per shipment, cold chain vs. general cargo split
- **Business KPI Dashboard** — Unit economics, duty exposure, FTZ savings YTD
- **Data Pipeline View** — Data freshness indicators, source status
- **Monitoring View** — Platform health, AI agent performance

#### Knowledge Base & SOPs
- Import process documentation (step-by-step from sourcing to fulfillment)
- FTZ/bonded warehouse operational guide
- Compliance checklist by product category and country of origin
- Documentation requirements matrix (BOL, commercial invoice, packing list, ISF, etc.)
- Tariff classification guide (HTS code determination)
- SE Asia market intelligence (Vietnam, Thailand, Indonesia, Cambodia)

#### Proposal Content
- Platform architecture visualization
- Six Sigma process analysis
- Revenue model and pricing visualization
- Phase roadmap visualization
- Partnership agreement framework

### Phase 1 Known Gaps

- No user authentication or data persistence — nothing saves between sessions
- HTS data is representative sample (~200 codes), not full USITC schedule (~100K codes)
- Carrier rates are static/illustrative, not real-time
- No document upload or processing
- No AI assistance for HTS classification
- No PDF export of calculation results
- Mobile experience is usable but not optimized

---

## 3. Phase 2: Core Features (M1–M6)

**Goal:** Turn the demo into a real working platform with auth, real data, and persistent workflows.

**Gate criteria:** 5 paying customers before unlocking Phase 3 budget.

### M1 (Month 1) — Foundation

**Authentication & User Management**
- NextAuth v5 with email/password (bcrypt)
- Organization model (multi-tenant from day one)
- Role-based access: owner / admin / member / viewer
- Invite-only registration (beta access control)
- JWT sessions, 30-day expiry

**Database Bootstrap**
- Neon PostgreSQL + Drizzle ORM migrations
- Tables: organizations, users, shipments, calculations, audit_logs, hts_lookups
- Schema supports multi-tenancy with org_id on all rows

**Deliverables:**
- [ ] Users can register, log in, and log out
- [ ] Org owner can invite team members
- [ ] All calculator data persists to database
- [ ] Audit log captures all auth events

---

### M2 (Month 2) — Real HTS Data

**Full HTS Schedule Integration**
- Download full USITC HTS schedule (~100K entries) via `scripts/build-hts-index.ts`
- Build Fuse.js search index at deploy time (~15-20MB)
- Three-layer lazy loading: build-time → route-level → search-time
- HTS detail pages: description, general rate, special rates (FTAs), Column 2, Section 301
- Country-specific duty lookup: enter HTS + origin country → get effective rate

**SE Asia Duty Rate Dataset**
- Vietnam, Thailand, Indonesia, Cambodia, Philippines, Malaysia, Myanmar
- MFN rate, Section 301 rate, GSP status per HTS code
- Section 301 China rates with AD/CVD flags
- Source: USITC DataWeb (free public data)

**Deliverables:**
- [ ] Full HTS search (100K codes) with <100ms response after index load
- [ ] Country + HTS → effective duty rate in <200ms
- [ ] HTS lookup history saved per user
- [ ] Monthly automated HTS data refresh (cron script)

---

### M3 (Month 3) — Calculation Persistence & Export

**Saved Scenarios**
- Save any calculator run with a user-defined name ("Vietnam T-Shirts Q3 2026")
- Load saved scenarios from dashboard
- Shareable URLs: `?token=<uuid>` loads a read-only snapshot
- Scenario comparison: side-by-side diff of two saved calculations

**PDF Export**
- Export any calculation to a formatted PDF report via `@react-pdf/renderer`
- PDF includes: inputs, results, cost breakdown chart, regulatory disclaimers
- Reports stored in Vercel Blob; download URL returned to client
- Reports retained 30 days, then auto-deleted

**CSV Export**
- Export calculation data as CSV for Excel workflows
- Bulk export: all calculations in a date range

**Deliverables:**
- [ ] Users can save, load, and share calculator scenarios
- [ ] PDF export for: landed cost, FTZ savings, unit economics, route comparison
- [ ] CSV export for all calculators
- [ ] Shareable links work without auth (read-only public snapshot)

---

### M4 (Month 4) — Shipment Tracking

**Shipment Records**
- Create shipment record: origin, destination, carrier, container type, HTS code, units, FOB value
- Shipment status board: sourcing → transit → customs → FTZ → delivered
- Timeline events log (manual entry in Phase 2; automated in Phase 3)
- Cost tracking per shipment: freight, duty paid, FTZ costs, brokerage fees
- Attach calculation snapshots to a shipment record

**Cold Chain Overlay**
- Flag shipments as cold chain (reefer container)
- Temperature requirement field (e.g., -18°C for frozen, 2-8°C for pharmaceuticals)
- Cold chain vs. general cargo split in dashboard KPIs

**Deliverables:**
- [ ] Create and manage shipment records
- [ ] Status transitions with timestamp log
- [ ] Attach landed cost calculation to a shipment
- [ ] Dashboard shows: active shipments by status, total duty exposure, FTZ savings YTD

---

### M5 (Month 5) — Route & Carrier Comparison

**Live Route Data**
- Integration with `/api/routes/compare` using real carrier schedule data
- Three-tier presentation: backhaul (cheapest), standard, express
- Transshipment routing: identify hub ports (Panama, Cartagena, Singapore, Hong Kong)
- Backhaul availability indicator (return-leg pricing advantages)
- Transit time distributions (not just averages — show variance)

**Port Database**
- Full UN/LOCODE database (~3,700 ports)
- Annual TEU throughput, infrastructure type, reefer plug capacity
- FTZ zones within 50km radius of each port

**Deliverables:**
- [ ] Route comparison returns 3 real carrier options for any port pair
- [ ] Backhaul indicator with pricing delta
- [ ] Transshipment route visualization on map
- [ ] Port detail page with nearby FTZ zones

---

### M6 (Month 6) — Billing & Beta Launch

**Billing**
- Stripe integration: subscription management
- Three tiers:
  - **Starter** ($49/mo): 1 user, 50 calculations/month, no PDF export
  - **Pro** ($149/mo): 5 users, unlimited calculations, PDF export, API access
  - **Business** ($499/mo): 25 users, everything + priority support, white-label reports
- Usage metering for calculations (for future usage-based pricing)
- 14-day free trial on all paid plans

**Launch Readiness**
- Error tracking: Sentry integration
- Uptime monitoring: Better Uptime (10 checks/month free)
- Performance: Vercel Analytics + Core Web Vitals dashboard
- Onboarding flow: 5-step guided setup for new orgs

**Deliverables:**
- [ ] Stripe billing live with all three tiers
- [ ] Usage limits enforced per plan
- [ ] 14-day trial flow
- [ ] Production error tracking live
- [ ] 5 paying customers before EOD M6

---

## 4. Phase 3: AI Features (M7–M12)

**Goal:** Layer AI intelligence on top of the core platform — automated HTS classification, predictive rate optimization, and agent-driven compliance workflows.

**Gate criteria:** $5,000 MRR before Phase 3 budget unlock.

### M7 (Month 7) — AI HTS Classification

**Product Description → HTS Code**
- User describes product in plain English → Claude suggests top 3 matching HTS codes
- Each suggestion: code, description, duty rate, confidence score, reasoning
- User accepts or rejects → feedback stored for model improvement
- Classification history: track which suggestions were accepted

**Compliance Risk Flagging**
- For any HTS code: flag if there are active AD/CVD orders (anti-dumping / countervailing duties)
- Flag Section 301 applicability for China-origin goods
- Flag if product description is ambiguous between two classifications

**AI Cost Controls**
- All Claude responses cached in Redis (24h TTL, keyed by description hash)
- Rate limit: 10 AI requests/minute per user
- Streaming responses with progress indicator (user sees tokens as they arrive)

**Deliverables:**
- [ ] AI HTS classifier live in Landed Cost Calculator
- [ ] Confidence scoring with top-3 suggestions
- [ ] Compliance risk flags on HTS detail page
- [ ] Acceptance rate tracking in admin analytics

---

### M8 (Month 8) — Predictive Rate Modeling

**Tariff Trend Analysis**
- Historical Section 301 rate changes stored in database
- Trend visualization: duty rate over time per HTS code
- Scenario modeling: "What if rate increases to X%?" → recalculates all affected shipments

**Freight Rate Intelligence**
- Integration with Freightos API for spot rate data
- Rate trend chart: 30/60/90-day historical spot rates for a route
- Rate anomaly detection: alert when rates deviate >20% from 30-day average

**Deliverables:**
- [ ] Historical duty rate charts per HTS code
- [ ] "What-if tariff" scenario tool
- [ ] Freight rate trends with Freightos API
- [ ] Rate anomaly alerts

---

### M9 (Month 9) — Document Intelligence

**Document Upload & Parsing**
- Upload: commercial invoice, packing list, bill of lading, ISF filing
- Claude Vision extracts: HTS codes, declared values, unit counts, shipper/consignee
- Auto-populate shipment record from uploaded BOL
- Flag discrepancies: declared value vs. calculated landed cost

**Document Generation**
- Generate draft commercial invoice from shipment record
- Generate packing list from container utilization calculation
- Generate ISF (Importer Security Filing) data sheet
- Export as PDF via Vercel Blob

**Deliverables:**
- [ ] BOL upload → auto-populate shipment fields
- [ ] Commercial invoice generation
- [ ] Discrepancy flagging with confidence scores

---

### M10 (Month 10) — AI Agent: Shipment Monitor

**Automated Shipment Tracking**
- AI agent polls carrier vessel schedule APIs on schedule (every 6 hours)
- Detects: departure confirmed, port arrival, customs hold, delivery
- Posts timeline events to shipment record automatically
- Alerts: email/SMS when status changes or ETA shifts >2 days

**Proactive Tariff Alerts**
- Monitor Federal Register RSS for Section 301 / reciprocal tariff changes
- Alert users when a tariff change affects their saved HTS codes
- Recalculate landed cost automatically with new rates

**Deliverables:**
- [ ] Automated shipment status polling (6-hour cadence)
- [ ] ETA deviation alerts
- [ ] Tariff change monitoring with affected-shipment recalculation

---

### M11 (Month 11) — ML Rate Prediction

**Freight Rate Prediction**
- Train lightweight ML model on historical Freightos spot rates
- Predict rate for a route 30/60/90 days forward with confidence interval
- "Book now vs. wait" recommendation based on predicted rate direction

**Optimal Booking Window**
- Based on historical rate patterns: identify lowest-cost booking windows per route
- Seasonal patterns: Chinese New Year capacity crunch, post-holiday capacity surplus

**Deliverables:**
- [ ] 30/60/90-day rate forecast per route with confidence bands
- [ ] "Book now vs. wait" recommendation with reasoning
- [ ] Seasonal rate calendar visualization

---

### M12 (Month 12) — AI Agent: FTZ Optimizer

**Withdrawal Schedule Optimization**
- Given: total units in FTZ, cash flow constraints, projected tariff changes
- Claude generates optimal withdrawal schedule: date, units, estimated duty cost
- Compares: aggressive withdrawal (minimize storage) vs. deferred withdrawal (minimize duty risk)
- PF vs. GPA election recommendation based on commodity + tariff trajectory

**Deliverables:**
- [ ] AI-generated FTZ withdrawal schedule
- [ ] PF/GPA election recommendation engine
- [ ] Cash flow impact modeling for withdrawal scenarios

---

## 5. Phase 4: Enterprise (M13–M18)

**Goal:** Serve freight brokerages, customs brokers, and logistics teams with 10–100 users, multi-org management, API access, and white-label capabilities.

**Gate criteria:** $25,000 MRR before Phase 4 budget unlock.

### M13–M14 — Team Features

**Multi-User Workflow**
- Shared shipment boards across org members
- Assignment: shipments and action items assigned to specific users
- Comment threads on shipment records
- Activity feed: team-level timeline of all changes

**Advanced RBAC**
- Custom roles: define permission sets per org
- Field-level permissions: hide duty cost data from certain roles
- Audit log with filterable search: who did what, when

**Deliverables:**
- [ ] Shipment assignment + commenting
- [ ] Custom role builder
- [ ] Filterable audit log with CSV export

---

### M15–M16 — External API Access

**REST API (Pro tier)**
- API key management: create, rotate, revoke keys per org
- Rate-limited endpoints: calculations, HTS lookup, shipment CRUD
- Webhook support: `shipment.status_changed`, `tariff.rate_changed`
- OpenAPI 3.0 documentation at `/api/docs`

**Use Cases:**
- ERP integration: sync shipments from SAP/NetSuite
- TMS integration: pull route comparison data into transportation management system
- Custom dashboards: pull KPI data into Tableau / Power BI

**Deliverables:**
- [ ] API key management UI
- [ ] /api/v1/* external endpoints with auth
- [ ] Webhook delivery with retry logic
- [ ] OpenAPI spec + developer docs

---

### M17–M18 — White-Label & Multi-Org

**White-Label Reports**
- Custom logo + branding on all PDF exports
- Custom domain support: `logistics.clientdomain.com` pointing to Shipping Savior
- Remove "Powered by Shipping Savior" branding (Enterprise plan only)

**Multi-Org Management (Agency/Broker Tier)**
- One account manages multiple client orgs
- Switch between client orgs without re-login
- Consolidated billing: pay for all client orgs from one account
- Cross-org analytics: aggregate KPIs across all managed clients

**Deliverables:**
- [ ] White-label PDF with custom logo
- [ ] Custom subdomain routing
- [ ] Multi-org switcher UI
- [ ] Consolidated billing portal

---

## 6. Quarterly Milestone Targets

| Quarter | Phase | Key Deliverables | Revenue Target |
|---------|-------|-----------------|----------------|
| Q1 2026 (M1–M3) | Phase 2 | Auth, real HTS data, calculation persistence, PDF export | $0 (beta) |
| Q2 2026 (M4–M6) | Phase 2 | Shipment tracking, route comparison, billing launch | $2,500 MRR |
| Q3 2026 (M7–M9) | Phase 3 | AI HTS classifier, rate prediction, document intelligence | $5,000 MRR |
| Q4 2026 (M10–M12) | Phase 3 | AI shipment monitor, ML rate prediction, FTZ optimizer | $10,000 MRR |
| Q1 2027 (M13–M15) | Phase 4 | Team features, external API | $25,000 MRR |
| Q2 2027 (M16–M18) | Phase 4 | White-label, multi-org | $50,000 MRR |

---

## 7. Feature Prioritization Framework

Features are scored on three dimensions:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| **User Impact** | 40% | How many users benefit, and how significantly? (1–5) |
| **Revenue Leverage** | 35% | Does this unlock a new paid tier or reduce churn? (1–5) |
| **Build Effort** | 25% | How many eng-weeks? Inverse-scored — low effort = high score (1–5) |

**Priority Score** = (User Impact × 0.40) + (Revenue Leverage × 0.35) + (Effort Inverse × 0.25)

### Example Scoring (Phase 2 Features)

| Feature | User Impact | Revenue Leverage | Effort (inv.) | Score |
|---------|-------------|-----------------|----------------|-------|
| Full HTS data (100K codes) | 5 | 4 | 4 | 4.35 |
| PDF export | 4 | 5 | 3 | 4.10 |
| Auth + org model | 5 | 5 | 2 | 4.25 |
| Stripe billing | 3 | 5 | 3 | 3.70 |
| Shipment tracking board | 4 | 3 | 3 | 3.35 |
| Carrier API integration | 3 | 3 | 1 | 2.40 |

### Tiebreaker Rules

1. **Unblocking features first** — auth must ship before any personalization feature
2. **Revenue before optimization** — billing before performance tuning
3. **User-visible before infrastructure** — things users can see/click over backend plumbing
4. **Small bets first** — if two features have similar scores, pick the shorter build

---

## 8. Success Metrics Per Phase

### Phase 1 (MVP — Built)

| Metric | Current | Target |
|--------|---------|--------|
| Demo sessions completed | Unknown | Track from Phase 2 analytics |
| Unique visitors | Unknown | 500/month |
| Calculator interactions / session | Unknown | 3+ |
| Avg session duration | Unknown | 5+ min |

### Phase 2 (Core Platform — M1–M6)

| Metric | M3 Target | M6 Target |
|--------|-----------|-----------|
| Registered users | 25 | 100 |
| Paying accounts | 0 | 5 |
| MRR | $0 | $2,500 |
| Monthly Active Calculations | 200 | 1,000 |
| HTS lookups / month | 100 | 500 |
| PDF exports / month | 10 | 50 |
| Avg session duration | 5 min | 8 min |
| Calculation save rate | 20% | 40% |

### Phase 3 (AI Features — M7–M12)

| Metric | M9 Target | M12 Target |
|--------|-----------|------------|
| Registered users | 300 | 500 |
| Paying accounts | 15 | 50 |
| MRR | $5,000 | $10,000 |
| Monthly Active Calculations | 3,000 | 10,000 |
| AI HTS classification acceptance rate | — | 65%+ |
| Document uploads processed / month | — | 200 |
| NPS score | — | 40+ |
| Avg session duration | 10 min | 12 min |

### Phase 4 (Enterprise — M13–M18)

| Metric | M15 Target | M18 Target |
|--------|------------|------------|
| Registered users | 2,000 | 5,000 |
| Paying accounts | 150 | 500 |
| MRR | $25,000 | $50,000 |
| Monthly Active Calculations | 50,000 | 100,000 |
| Enterprise accounts (10+ seats) | 5 | 20 |
| API calls / month | 100,000 | 1,000,000 |
| Churn rate (monthly) | <5% | <3% |
| NPS score | 45+ | 55+ |

---

## 9. User Personas

### Persona A — The Independent Importer ("Import Indie")

- Small-to-mid business importing consumer goods from SE Asia (apparel, CPG)
- Self-funded, no dedicated logistics team
- Pain: doesn't know true landed cost until container arrives + duty bill appears
- Job: calculate exact landed cost before committing to supplier; validate HTS code; model FTZ savings
- Willingness to pay: $49–$199/month

### Persona B — The Freight Broker ("The Broker")

- Independent broker managing 20–200 shipments/month
- Relies on spreadsheets and carrier portals
- Pain: creating professional carrier comparison quotes is manual and slow
- Job: generate polished PDF carrier comparison quotes in <10 minutes; answer tariff questions during client calls
- Willingness to pay: $199–$499/month

### Persona C — The FTZ Operator ("The Zone Manager")

- Warehouse or logistics operator managing a Foreign Trade Zone or bonded warehouse
- Fluent in FTZ regulations but needs better modeling tools
- Pain: April 2025 executive order mandated irrevocable PF status election; wrong choice = catastrophic
- Job: model NPV difference between PF and GPA status; plan incremental withdrawal schedule
- Willingness to pay: $499–$1,500/month

### Persona D — The Enterprise Logistics Team ("The Ops Lead")

- Supply chain or logistics lead at a mid-market importer ($50M+ revenue)
- Manages a team of 5–20 people across sourcing, compliance, shipping
- Pain: team data is fragmented across spreadsheets, email, and 3+ portals
- Job: centralize shipment visibility; give team standardized calculation workflows; generate compliant export reports for customs broker
- Willingness to pay: $500–$2,000/month (seat-based)

---

## 10. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Carrier API access denied / expensive | High | High | Use Freightos aggregator; fallback to static rate estimates |
| HTS data becomes stale (tariff changes) | High | Medium | Monthly cron refresh + Federal Register alert monitoring |
| Claude API cost escalates | Medium | Medium | Aggressive caching (24h TTL); rate limiting; batch processing |
| Neon free tier limits hit early | Medium | Low | Clear upgrade path ($19/mo Scale plan); monitor query counts |
| FTZ regulatory changes (April 2025 executive order) | High | High | Legal disclaimer on all FTZ calculations; dated data warnings |
| AI HTS classification accuracy too low | Medium | High | Confidence thresholds; always show top 3 with human review step |
| MapTiler free tier exceeded | Low | Low | 100K views/month; upgrade at $50/mo when needed |
| Competition (Flexport, Freightos) builds similar tool | Medium | High | Focus on FTZ + tariff optimization niche — not covered by general logistics platforms |
| Section 301 tariff rates become unstable | High | Medium | Model multiple scenarios; clearly label rate assumptions with dates |
| User adoption slower than targets | Medium | Medium | Phase 2 beta launch with 5 design partners; iterate on onboarding |
