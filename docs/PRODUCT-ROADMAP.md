# Shipping Savior — Product Roadmap

**Linear:** AI-5432
**Phase:** 2 — Planning
**Last Updated:** 2026-03-27
**Status:** Planning Complete — Ready for Phase 3 Gate Review
**Author:** AI Acrobatics Engineering

---

## Table of Contents

1. [Vision & North Star](#1-vision--north-star)
2. [Now / Next / Later Framework](#2-now--next--later-framework)
3. [MVP vs. Phase 2 vs. Phase 3 Feature Map](#3-mvp-vs-phase-2-vs-phase-3-feature-map)
4. [RICE Prioritization Matrix](#4-rice-prioritization-matrix)
5. [User Story Map — Core Workflows](#5-user-story-map--core-workflows)
6. [Platform Milestones & Launch Gates](#6-platform-milestones--launch-gates)
7. [Mobile App Roadmap](#7-mobile-app-roadmap)
8. [API & Integration Roadmap](#8-api--integration-roadmap)
9. [Enterprise Feature Roadmap](#9-enterprise-feature-roadmap)
10. [Deprecation & Migration Plans](#10-deprecation--migration-plans)
11. [Risk Register](#11-risk-register)

---

## 1. Vision & North Star

### Vision Statement

**Shipping Savior is the command center for every dollar that moves through international supply chains** — giving freight operators, importers, and FTZ users the analytical infrastructure of a $10M logistics team at a fraction of the cost.

We transform the most opaque, penalty-laden, data-heavy corner of global commerce into a platform where anyone can calculate true landed costs, optimize duty strategy, compare carrier routes, and deploy AI agents to automate the paper-intensive compliance workflow — all without a Bloomberg terminal or a 30-person customs brokerage on retainer.

### North Star Metric

**Monthly Active Calculations (MAC)** — total unique calculator runs, HTS lookups, route comparisons, and FTZ analyses completed per month.

| Horizon | MAC Target |
|---------|-----------|
| M6      | 1,000/month |
| M12     | 10,000/month |
| M18     | 50,000/month |
| M24     | 100,000/month |

### Secondary KPIs

| Metric | M6 | M12 | M18 |
|--------|-----|------|------|
| Registered users | 50 | 500 | 5,000 |
| Paying accounts | 5 | 50 | 500 |
| MRR | $0 (beta) | $5,000 | $50,000 |
| NPS | — | 40+ | 55+ |
| Avg session duration | 4 min | 8 min | 12 min |

---

## 2. Now / Next / Later Framework

The Now/Next/Later framework expresses the roadmap as three planning horizons rather than fixed dates, reflecting the reality that logistics software development depends heavily on API availability, regulatory data freshness, and user validation signals.

---

### NOW — Current Quarter (Weeks 1–12: Foundation + Core MVP)

**Theme: "First Paying User"**

The NOW horizon delivers the minimum viable platform that a real freight operator or importer would pay for. All items in this horizon are actively in flight or gate-approved.

**Gate requirement before sprint start:** Decision 1 (auth provider) and Decision 6 (multi-tenant architecture) must be resolved.

#### NOW Features

| Feature ID | Feature Name | Module | Priority | Sprint |
|------------|-------------|--------|----------|--------|
| F-001 | Email/password authentication | Auth | P0 | Sprint 1 |
| F-002 | 14-day free trial with org creation | Auth | P0 | Sprint 1 |
| F-003 | Onboarding wizard (5-step) | Onboarding | P0 | Sprint 1 |
| F-004 | USITC HTS data pipeline (17K+ codes) | Data | P0 | Sprint 2 |
| F-005 | HTS lookup with Fuse.js search | Calculators | P0 | Sprint 3 |
| F-006 | Real landed cost calculator (15+ cost components) | Calculators | P0 | Sprint 3 |
| F-007 | Container utilization calculator | Calculators | P0 | Sprint 3 |
| F-008 | FTZ Savings Analyzer (PF vs. GPA, OFIS data) | FTZ | P0 | Sprint 3 |
| F-009 | Executive dashboard (shipment kanban) | Dashboard | P0 | Sprint 4 |
| F-010 | Shipment list + detail views | Dashboard | P0 | Sprint 4 |
| F-011 | PDF export for all calculators | Calculators | P1 | Sprint 3 |
| F-012 | Neon PostgreSQL + Drizzle ORM setup | Infra | P0 | Sprint 1 |
| F-013 | Rate limiting (Redis/Vercel KV) | Infra | P0 | Sprint 1 |
| F-014 | Route comparison tool (3-carrier) | Calculators | P1 | Sprint 3 |
| F-015 | ISF compliance checker | Compliance | P1 | Sprint 4 |

#### NOW Success Criteria

- [ ] At least 1 paying user at any price point
- [ ] User runs at least 3 calculations per week without prompting
- [ ] HTS lookup returns accurate rate in < 500ms on 17K+ codes
- [ ] Landed cost includes all 15 cost components
- [ ] Platform stable at 50 concurrent users

---

### NEXT — Next Quarter (Months 4–6: Live Data + Operations)

**Theme: "Live Data, Real Operations"**

The NEXT horizon connects the platform to live external data sources. Mock carrier rates are replaced with real API feeds. Document upload and container tracking are added. The platform transforms from a calculator suite into an operational tool.

**Gate requirement:** NOW milestone achieved — at least 1 paying user running regular calculations. Decision 2 (HTS sync frequency) and Decision 3 (vessel data provider) resolved.

#### NEXT Features

| Feature ID | Feature Name | Module | Priority | Sprint |
|------------|-------------|--------|----------|--------|
| F-101 | Freightos Baltic Index (FBX) carrier rates | Data | P0 | Sprint 5 |
| F-102 | Maersk Spot Rate API integration | Data | P0 | Sprint 5 |
| F-103 | CMA CGM sailing schedule feed | Data | P1 | Sprint 5 |
| F-104 | Rate comparison engine (normalized USD/FEU) | Calculators | P0 | Sprint 5 |
| F-105 | Document upload infrastructure (Vercel Blob) | Documents | P0 | Sprint 5 |
| F-106 | Rule-based document parser (invoice, BOL, packing list) | Documents | P0 | Sprint 5 |
| F-107 | CBP import statistics feed | Data | P1 | Sprint 6 |
| F-108 | Terminal49 container tracking integration | Tracking | P0 | Sprint 6 |
| F-109 | Multi-carrier tracking aggregation | Tracking | P0 | Sprint 6 |
| F-110 | Operations dashboard with kanban + cost tracking | Dashboard | P0 | Sprint 6 |
| F-111 | Alerts & notifications engine (email + in-app) | Alerts | P1 | Sprint 6 |
| F-112 | Interactive shipping route map (MapLibre GL) | Map | P1 | Sprint 5 |
| F-113 | FTZ Site Finder (260+ OFIS locations) | FTZ | P1 | Sprint 6 |
| F-114 | Team member invitations (multi-user org) | Auth | P1 | Sprint 5 |
| F-115 | UFLPA Xinjiang compliance screen | Compliance | P1 | Sprint 6 |

#### NEXT Success Criteria

- [ ] Carrier rates refresh daily via scheduled cron job
- [ ] Route comparison uses real rates for 3+ major carriers
- [ ] Document parser extracts HTS codes from invoices > 80% accuracy
- [ ] Container tracking updates within 2h of Terminal49 event
- [ ] Dashboard handles 50 active shipments in < 2s

---

### LATER — Future Horizon (Months 7–18: AI Intelligence + Scale)

**Theme: "The Platform Thinks With You"**

The LATER horizon deploys AI agents, expands to enterprise accounts, and introduces mobile-first workflows. These features require live data validation from the NEXT horizon before building.

**Gate requirement:** NEXT milestone achieved — platform is operationally sound for at least 10 paying users. AI agent training data collected from real usage patterns.

#### LATER Features — AI Layer (M7–M12)

| Feature ID | Feature Name | Module | Priority |
|------------|-------------|--------|----------|
| F-201 | HTS Classification Agent (Claude AI, 6-step reasoning) | AI | P0 |
| F-202 | CBP ruling cross-reference engine | AI | P0 |
| F-203 | UFLPA forced labor compliance AI screen | AI | P1 |
| F-204 | Classification feedback loop + accuracy tracking | AI | P1 |
| F-205 | Document Intelligence Engine (Claude Vision) | AI | P0 |
| F-206 | Automated compliance checklist generation | AI | P0 |
| F-207 | Certificate of origin validator (FTA eligibility) | AI | P1 |
| F-208 | Document assembly workflow + ZIP export | AI | P1 |
| F-209 | Cost Optimization Agent (duty engineering) | AI | P1 |
| F-210 | Backhaul finder and yield optimizer | AI | P2 |
| F-211 | Rate negotiation AI agent | AI | P2 |
| F-212 | Demand forecasting agent | AI | P2 |

#### LATER Features — Enterprise (M10–M18)

| Feature ID | Feature Name | Module | Priority |
|------------|-------------|--------|----------|
| F-301 | SSO (Google Workspace, Microsoft 365) | Auth | P0 |
| F-302 | Role-based access control (admin/analyst/viewer) | Auth | P0 |
| F-303 | Custom branding + white-label PDF exports | Enterprise | P1 |
| F-304 | Audit log and compliance reporting | Enterprise | P1 |
| F-305 | API access tier (Enterprise plan) | API | P0 |
| F-306 | Webhook event streaming | API | P1 |
| F-307 | ERP integrations (SAP, NetSuite, QuickBooks) | Integrations | P2 |
| F-308 | FTZ consulting workflow module | Consulting | P0 |
| F-309 | Custom HTS ruleset management | Enterprise | P2 |
| F-310 | Dedicated Slack channel support | Enterprise | P2 |

---

## 3. MVP vs. Phase 2 vs. Phase 3 Feature Map

### Feature Classification Criteria

| Tier | Criteria |
|------|---------|
| **MVP** | Required for first paying user. Core value proposition. Without this, platform has no revenue. |
| **Phase 2** | Requires live data from MVP phase to build. Increases retention and ARPU. |
| **Phase 3** | Requires user behavior data to train/validate. Unlocks enterprise and API revenue. |

### Complete Feature Map

| Feature | Module | Tier | Value Driver |
|---------|--------|------|--------------|
| USITC HTS lookup (17K codes) | Data | MVP | Core — replaces USITC.gov |
| Landed cost calculator (15+ components) | Calculators | MVP | Core — first value delivery |
| Container utilization calculator | Calculators | MVP | Quick win for brokers |
| FTZ Savings Analyzer (PF vs. GPA) | FTZ | MVP | Differentiator — nothing like it |
| Route comparison (3-carrier) | Calculators | MVP | Broker use case |
| PDF export | Calculators | MVP | Proposal workflow unlock |
| Auth + org creation + 14-day trial | Auth | MVP | Revenue gate |
| Onboarding wizard | Onboarding | MVP | Activation rate driver |
| Basic shipment dashboard | Dashboard | MVP | Retention driver |
| ISF compliance checker | Compliance | MVP | Risk/penalty hook |
| Live carrier rate feeds (FBX, Maersk) | Data | Phase 2 | Rate accuracy — replaces mock data |
| Document upload + parsing | Documents | Phase 2 | Operational utility |
| Container tracking (Terminal49) | Tracking | Phase 2 | Daily active use driver |
| Full operations dashboard | Dashboard | Phase 2 | Power user retention |
| Alerts engine | Alerts | Phase 2 | Habit formation |
| Interactive shipping map | Map | Phase 2 | Visual differentiation |
| Multi-user org (team invites) | Auth | Phase 2 | Expansion revenue |
| UFLPA compliance screen | Compliance | Phase 2 | Enterprise value |
| HTS Classification Agent (AI) | AI | Phase 3 | $600M CBP penalty market |
| Document Intelligence Engine (AI) | AI | Phase 3 | Hours → minutes workflow |
| Cost Optimization Agent | AI | Phase 3 | ROI amplifier |
| SSO (Google, Microsoft) | Auth | Phase 3 | Enterprise unlock |
| RBAC (role-based access) | Auth | Phase 3 | Enterprise compliance |
| API access tier | API | Phase 3 | Developer ecosystem |
| ERP integrations | Integrations | Phase 3 | Large account stickiness |
| FTZ consulting workflow | Consulting | Phase 3 | $3K–$12K/mo tier |
| White-label PDF export | Enterprise | Phase 3 | MSP/broker resale |

---

## 4. RICE Prioritization Matrix

RICE = (Reach × Impact × Confidence) / Effort

**Scoring guide:**
- **Reach:** Users impacted per quarter (1–10 scale, 10 = all users)
- **Impact:** Value per user (1 = minimal, 2 = low, 3 = medium, 5 = high, 10 = transformative)
- **Confidence:** Certainty in estimates (100% = very confident, 80% = confident, 50% = uncertain)
- **Effort:** Person-weeks (lower = better)

### RICE Scores — MVP Features

| Feature | Reach | Impact | Confidence | Effort (weeks) | RICE Score | Rank |
|---------|-------|--------|------------|----------------|------------|------|
| USITC HTS lookup | 9 | 10 | 90% | 2 | 40.5 | 1 |
| Landed cost calculator | 8 | 10 | 90% | 3 | 24.0 | 2 |
| FTZ Savings Analyzer | 6 | 10 | 80% | 3 | 16.0 | 3 |
| Auth + trial | 10 | 5 | 100% | 2 | 25.0 | — (required) |
| PDF export | 8 | 5 | 90% | 1 | 36.0 | 4 |
| Container calculator | 7 | 5 | 90% | 1 | 31.5 | 5 |
| Route comparison | 7 | 5 | 80% | 2 | 14.0 | 6 |
| ISF checker | 5 | 5 | 80% | 2 | 10.0 | 7 |
| Onboarding wizard | 10 | 3 | 80% | 1 | 24.0 | 8 |
| Basic dashboard | 8 | 3 | 90% | 2 | 10.8 | 9 |

### RICE Scores — Phase 2 Features

| Feature | Reach | Impact | Confidence | Effort (weeks) | RICE Score | Rank |
|---------|-------|--------|------------|----------------|------------|------|
| Live carrier rates (FBX/Maersk) | 8 | 10 | 80% | 3 | 21.3 | 1 |
| Container tracking (Terminal49) | 7 | 10 | 80% | 2 | 28.0 | 2 |
| Document upload + parse | 6 | 10 | 70% | 4 | 10.5 | 3 |
| Operations dashboard (full) | 8 | 5 | 90% | 2 | 18.0 | 4 |
| Alerts engine | 9 | 5 | 90% | 1 | 40.5 | 5 |
| UFLPA compliance screen | 4 | 10 | 80% | 2 | 16.0 | 6 |
| Shipping map (MapLibre) | 7 | 3 | 80% | 2 | 8.4 | 7 |
| Team invites | 6 | 5 | 90% | 2 | 13.5 | 8 |
| FTZ Site Finder | 5 | 5 | 90% | 1 | 22.5 | 9 |

### RICE Scores — Phase 3 Features

| Feature | Reach | Impact | Confidence | Effort (weeks) | RICE Score | Rank |
|---------|-------|--------|------------|----------------|------------|------|
| HTS Classification Agent | 9 | 10 | 70% | 8 | 7.9 | 1 |
| Document Intelligence Engine | 7 | 10 | 70% | 6 | 8.2 | 2 |
| SSO (Google, Microsoft) | 8 | 5 | 90% | 2 | 18.0 | 3 |
| RBAC | 7 | 5 | 90% | 3 | 10.5 | 4 |
| API access tier | 5 | 10 | 80% | 4 | 10.0 | 5 |
| Cost Optimization Agent | 7 | 10 | 60% | 8 | 5.3 | 6 |
| FTZ consulting workflow | 3 | 10 | 80% | 4 | 6.0 | 7 |
| ERP integrations | 3 | 10 | 60% | 10 | 1.8 | 8 |

---

## 5. User Story Map — Core Workflows

A user story map organizes features by the backbone activities users perform, then layers features beneath each activity from top (MVP) to bottom (advanced).

### Workflow 1: HTS Classification & Landed Cost

**Persona:** Import Indie (independent importer from SE Asia)

```
BACKBONE ACTIVITIES:
[Describe Product] → [Find HTS Code] → [Calculate Duty] → [Model Full Cost] → [Export/Share]

WALKING SKELETON (MVP):
[Type product desc]   [Search 17K codes]   [Auto-fill rate]   [15-component calc]   [PDF export]
[Select from results] [See MFN/special]    [Choose origin]    [Add freight/fees]    [Shareable link]

PHASE 2 ADDITIONS:
                      [AI classification]  [Live tariff feed]  [Historical trends]   [Client portal]
                      [CBP ruling lookup]  [301/232 flag]      [FTZ comparison]      [API webhook]

PHASE 3 ADDITIONS:
                      [Binding ruling]     [Rate negotiation]  [Cash flow model]     [ERP sync]
                      [Multi-product]      [UFLPA screen]      [Scenario compare]    [Client delivery]
```

### Workflow 2: Route & Carrier Selection

**Persona:** The Broker (independent freight broker)

```
BACKBONE ACTIVITIES:
[Define Shipment] → [Compare Routes] → [Select Carrier] → [Generate Proposal] → [Win Business]

WALKING SKELETON (MVP):
[Origin/dest/weight] [3-route comparison]  [Cost/time rank]   [PDF proposal]        [Email/download]
[Container type]     [Transit time est.]   [Reliability badge] [Branded export]     [Shareable URL]

PHASE 2 ADDITIONS:
[Live container #]   [Real FBX rates]      [Backhaul flag]    [Booking widget]      [CRM sync]
[BOL upload]         [Vessel schedules]    [Port congestion]  [Template library]    [Client tracking]

PHASE 3 ADDITIONS:
[AI route suggest]   [Rate negotiation]    [Dynamic pricing]  [Auto-proposal]       [Win-rate track]
                     [Benchmark vs. mkt]   [Carrier scorecard] [White-label PDF]   [Pipeline mgmt]
```

### Workflow 3: FTZ Duty Optimization

**Persona:** The Zone Manager (FTZ operator)

```
BACKBONE ACTIVITIES:
[Assess Eligibility] → [Model Scenarios] → [Elect Status] → [Plan Withdrawals] → [Report Savings]

WALKING SKELETON (MVP):
[Commodity + volume] [PF vs. GPA model]   [IRR calculation]  [Monthly schedule]    [Savings summary]
[Current tariff]     [NPV comparison]      [Break-even calc]  [Rate lock timing]    [PDF report]

PHASE 2 ADDITIONS:
[FTZ site finder]    [OFIS integration]    [Multi-zone compare] [Inventory model]   [CBP 214 forms]
[Grantee contacts]   [Distance from port]  [Activation status]  [Pallet batch plan] [Audit trail]

PHASE 3 ADDITIONS:
[AI status advisor]  [Real-time tariff Δ]  [Regulatory alerts] [Portfolio model]   [CFO dashboard]
                     [Rebate tracking]     [Status migration]  [Optimal withdrawal] [Investor export]
```

### Workflow 4: Shipment Compliance & Document Management

**Persona:** Both (importer + broker)

```
BACKBONE ACTIVITIES:
[Upload Documents] → [Validate ISF] → [Check Compliance] → [Assemble Packet] → [Hand Off to Broker]

WALKING SKELETON (MVP):
[Drag/drop upload]   [ISF-10 check]       [HTS match check]   [Manual review]       [Email export]

PHASE 2 ADDITIONS:
[Parse invoice/BOL]  [Real-time checks]   [UFLPA screen]      [Auto-assemble ZIP]   [Broker portal]
[Extract fields]     [Deadline calendar]  [FDA prior notice]  [Missing doc flag]    [Link sharing]

PHASE 3 ADDITIONS:
[AI doc extraction]  [AI cross-validate]  [Certificate gen]   [Auto-filing assist]  [API webhooks]
[Vision OCR]         [Binding ruling]     [FTA eligibility]   [Custom templates]    [ERP push]
```

---

## 6. Platform Milestones & Launch Gates

### Gate Structure

Each gate is a binary pass/fail checkpoint. The next phase cannot start until all gate criteria are met. Gate reviews happen in week N with a 2-week remediation window before blocking.

```
[Gate 0: Architecture] → [Gate 1: MVP Beta] → [Gate 2: First Revenue] → [Gate 3: Operations Ready] → [Gate 4: AI Ready] → [Gate 5: Enterprise Ready]
```

---

### Gate 0 — Architecture (Pre-Sprint 1)

**Gate criteria:**
- [ ] Decision 1 resolved: Auth provider selected (NextAuth v5 with Credentials confirmed)
- [ ] Decision 6 resolved: Multi-tenant architecture pattern confirmed (org-scoped data with orgId FK)
- [ ] Database schema v1 agreed and reviewed
- [ ] CI/CD pipeline configured (GitHub Actions + Vercel)
- [ ] Dev environment documented in README

**Blocking:** Yes — Sprint 1 cannot start without this gate

---

### Gate 1 — MVP Beta (End of Sprint 3, ~Week 6)

**Gate criteria:**
- [ ] All P0 MVP features are functional in staging
- [ ] HTS lookup accuracy validated on 50-code spot check
- [ ] Landed cost calculator passes all 12 unit test scenarios
- [ ] FTZ Analyzer correctly models PF vs. GPA for 5 test commodity sets
- [ ] Authentication works end-to-end (register → verify → login → dashboard)
- [ ] PDF export renders correctly in Chrome, Firefox, Safari
- [ ] All pages pass WCAG 2.1 AA automated checks
- [ ] Lighthouse score ≥ 85 on all core pages

**Blocking:** Yes — cannot invite beta users without this gate

**Output:** Deploy to production. Invite 5–10 design partners.

---

### Gate 2 — First Revenue (End of Sprint 5, ~Week 10)

**Gate criteria:**
- [ ] At least 1 paying customer on any paid tier
- [ ] Stripe integration processes subscriptions without errors
- [ ] Upgrade/downgrade/cancel flows work correctly
- [ ] At least 5 beta users have run 5+ calculations each
- [ ] NPS ≥ 30 from beta cohort
- [ ] Zero P0 bugs open

**Blocking:** Yes — live data integrations (NEXT horizon) cannot be prioritized without revenue signal

---

### Gate 3 — Operations Ready (End of Sprint 6, ~Week 12)

**Gate criteria:**
- [ ] Live carrier rates refreshing daily without manual intervention
- [ ] Container tracking functional for top 6 carriers
- [ ] Document parser tested on 50 real-world invoice samples
- [ ] Alerts delivered to 10 test users without failures
- [ ] Operations dashboard handles 100 concurrent users
- [ ] Runbook documented for all cron jobs and integrations
- [ ] On-call rotation established (PagerDuty or equivalent)

**Blocking:** Yes — AI layer cannot be built until live data infrastructure is stable

---

### Gate 4 — AI Ready (Month 9)

**Gate criteria:**
- [ ] At least 500 real HTS classification events in database (training signal)
- [ ] At least 200 document parse events with quality labels
- [ ] Claude API integration tested with 5 real commercial invoices
- [ ] HTS Classification Agent prototype achieves > 85% accuracy on 50-product test set
- [ ] Agent latency < 15 seconds at p95
- [ ] Cost per classification < $0.05 at current usage levels

**Blocking:** Yes — enterprise features and API tier cannot launch before AI agents are proven

---

### Gate 5 — Enterprise Ready (Month 14)

**Gate criteria:**
- [ ] SSO (Google + Microsoft) functional for at least 1 pilot enterprise account
- [ ] RBAC enforced across all platform features
- [ ] Audit logs capture all data access and mutations
- [ ] API documentation published at api.shippingsavior.com
- [ ] SOC 2 Type I audit initiated (or equivalent security certification)
- [ ] SLA of 99.9% uptime demonstrated over 30-day period
- [ ] At least 3 accounts on Enterprise plan ($1,499+/mo)

**Blocking:** Yes — public API and ERP integrations cannot launch without enterprise security posture

---

## 7. Mobile App Roadmap

### Mobile Strategy

Shipping Savior adopts a **progressive mobile approach**: web-first responsive design for MVP, a Progressive Web App (PWA) for Phase 2, and a native React Native app for Phase 3 when enterprise demand justifies the investment.

The primary mobile use case is **status monitoring**, not data entry. Heavy calculator workflows (HTS classification, FTZ modeling) remain desktop-first. Mobile targets three specific jobs-to-be-done:

1. "Is my container still on schedule?" — tracking notifications
2. "What's my cost exposure on this new shipment?" — quick calculators
3. "Did the customs hold clear?" — alert acknowledgment

---

### Phase M1–M3: Responsive Web (Now)

**Approach:** All platform pages are fully responsive. No separate mobile build. Breakpoints follow Tailwind CSS defaults (sm: 640px, md: 768px, lg: 1024px).

**Mobile-priority pages (must be excellent on mobile):**
- Dashboard kanban (shipment status at-a-glance)
- HTS quick lookup
- Container tracking view
- Notification center

**Desktop-priority pages (mobile is functional but not optimized):**
- FTZ Savings Analyzer (complex multi-input form)
- Route comparison tool
- Document upload/parse
- Analytics and reporting

**Mobile targets:**
- LCP < 2.5s on mobile 4G (Lighthouse mobile score)
- Touch targets ≥ 44x44px
- No horizontal scroll on any page
- Form inputs trigger correct keyboard type (numeric, email, etc.)

---

### Phase M4–M6: Progressive Web App (Next)

**Trigger:** When 20%+ of active sessions come from mobile (tracked via analytics)

**PWA additions:**
- `manifest.json` with app icon set (192px, 512px, splash screens)
- Service worker for offline-capable pages (dashboard, cached HTS data)
- Push notification support (container status events, customs alerts)
- App install prompt on mobile browsers (Add to Home Screen)
- Background sync for queued document uploads

**PWA-specific features:**
- Offline HTS lookup (17K codes cached in IndexedDB — ~8MB)
- Offline-first dashboard (last 7 days cached)
- Background notification for container status changes
- Biometric authentication (Face ID / Touch ID via WebAuthn)

**PWA targets:**
- Offline mode functional for core read workflows
- Install prompt converts ≥ 15% of eligible visitors
- Push notification opt-in ≥ 40% of active users

---

### Phase M7–M12: React Native App (Later)

**Trigger:** Enterprise customer request OR when 30%+ of paying accounts are on mobile

**Platform:** React Native (Expo) — iOS and Android simultaneously

**Mobile-exclusive features:**
- Camera-based document scanner (scan commercial invoice with phone camera)
- Barcode/QR scan for container tracking lookup
- Real-time push for customs holds and vessel departure
- Biometric login (Face ID, Touch ID, fingerprint)
- Offline mode with full sync on reconnect

**Mobile app milestones:**
- M7: Expo project scaffold + navigation shell
- M8: Authentication + dashboard (read-only)
- M9: HTS lookup + quick cost calculator
- M10: Container tracking + push notifications
- M11: Document scanner (camera integration)
- M12: App Store + Play Store submission

**App Store targets:**
- iOS App Store: Productivity category, target 4.3+ rating
- Google Play: Business category, target 4.2+ rating
- First 30 days post-launch: 500+ installs from existing user base
- Conversion to daily active: ≥ 25% of installs

---

### Phase M13–M18: Native Enhancements (Enterprise Mobile)

**Enterprise mobile features:**
- MDM (Mobile Device Management) compatibility
- Managed configuration via Managed App Config
- Custom enterprise app distribution (optional, outside public store)
- Advanced offline: full shipment data sync, not just recent records
- Tablet layout optimization (iPad, Android tablets)

---

## 8. API & Integration Roadmap

### API Strategy

The API layer follows a **consumer-first design** — all platform features are built on internal API routes first, then a public API wrapper is added for enterprise customers. This ensures the public API is a true reflection of platform capabilities, not a bolted-on afterthought.

**API versioning:** URI versioning (`/api/v1/`, `/api/v2/`). Breaking changes require new version. Deprecation window: 12 months.

**Authentication:** API keys for external access. Internal Next.js API routes use JWT session cookies.

---

### Phase 1 — Internal APIs (Now)

All internal APIs supporting the MVP. Not exposed externally. RESTful design using Next.js Route Handlers.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create user + org + trial |
| `/api/auth/login` | POST | Issue JWT tokens |
| `/api/auth/refresh` | POST | Rotate access token |
| `/api/auth/session` | DELETE | Logout |
| `/api/hts/search` | GET | Fuse.js search over 17K HTS codes |
| `/api/hts/lookup` | GET | Single code lookup with rates |
| `/api/calculators/landed-cost` | POST | 15-component landed cost calculation |
| `/api/calculators/container` | POST | Container utilization calculation |
| `/api/calculators/ftz` | POST | FTZ PF vs. GPA savings model |
| `/api/shipments` | GET, POST | Shipment CRUD |
| `/api/shipments/:id` | GET, PATCH, DELETE | Single shipment operations |
| `/api/exports/pdf` | POST | Generate PDF export |
| `/api/compliance/isf` | POST | ISF-10 compliance check |

---

### Phase 2 — Data & Tracking APIs (Next)

External data integrations with caching layer. Still internal-only.

| Integration | Type | Refresh | Notes |
|-------------|------|---------|-------|
| Freightos Baltic Index (FBX) | REST | Daily cron | Standardized container spot rates |
| Maersk Developer Portal | REST | Daily cron | Spot rates + sailing schedules |
| CMA CGM API | REST | Weekly cron | Sailing schedules + bookings |
| USITC DataWeb API | REST | Weekly cron | Import statistics by HTS |
| Terminal49 | REST + Webhooks | Real-time | Container tracking events |
| OFIS Database | Scrape + Cache | Monthly | 260+ FTZ zone data |

**New internal endpoints:**
- `/api/rates/compare` — Normalized carrier rate comparison
- `/api/tracking/:containerId` — Container status + event history
- `/api/documents/upload` — Presigned URL for Vercel Blob upload
- `/api/documents/parse` — Trigger document parsing job
- `/api/alerts/preferences` — Manage notification rules
- `/api/alerts/test` — Test alert delivery

---

### Phase 3 — Public API (Later)

**Launch trigger:** Gate 5 achieved (Enterprise Ready). Minimum 3 enterprise accounts.

**Public API scope:**

| Endpoint Group | Access | Description |
|----------------|--------|-------------|
| `/api/v1/hts/search` | Pro+ | HTS code search and lookup |
| `/api/v1/calculators/*` | Pro+ | All calculator engines |
| `/api/v1/shipments/*` | Pro+ | Shipment CRUD and tracking |
| `/api/v1/compliance/*` | Enterprise | ISF checker, UFLPA screen |
| `/api/v1/agents/classify` | Enterprise | HTS AI classification |
| `/api/v1/agents/document` | Enterprise | Document intelligence |
| `/api/v1/webhooks` | Enterprise | Register event webhooks |

**API rate limits:**

| Plan | Requests/min | Requests/day |
|------|-------------|-------------|
| Pro ($399/mo) | 60 | 10,000 |
| Enterprise ($1,499/mo) | 300 | 100,000 |
| Custom (negotiated) | Unlimited | Unlimited |

**API docs:** Published at `api.shippingsavior.com` using OpenAPI 3.1 spec + Mintlify or Redoc renderer.

---

### Third-Party Integration Roadmap

| Integration | Priority | Phase | Business Value |
|-------------|----------|-------|---------------|
| Stripe | P0 | MVP | Subscription billing |
| Resend (email) | P0 | MVP | Transactional email |
| Terminal49 | P0 | Phase 2 | Container tracking |
| Freightos Baltic Index | P0 | Phase 2 | Live carrier rates |
| Maersk Developer Portal | P0 | Phase 2 | Rate + schedule data |
| Vercel Blob | P0 | Phase 2 | Document storage |
| Anthropic Claude API | P0 | Phase 3 | AI classification + document AI |
| CMA CGM API | P1 | Phase 2 | Schedule data |
| CBP CROSS (rulings) | P1 | Phase 3 | Binding ruling reference |
| Google Workspace SSO | P1 | Phase 3 | Enterprise auth |
| Microsoft 365 SSO | P1 | Phase 3 | Enterprise auth |
| NetSuite | P2 | Phase 3 | ERP shipment sync |
| SAP | P2 | Phase 3 | ERP shipment sync |
| QuickBooks | P2 | Phase 3 | Accounting sync |
| PagerDuty | P2 | Phase 2 | Operations on-call |
| Slack | P2 | Phase 3 | Enterprise notifications |

---

## 9. Enterprise Feature Roadmap

### Enterprise Definition

An enterprise account is any account on the Enterprise tier ($1,499/mo+) or custom negotiated pricing. Enterprise accounts typically have:
- 5+ users within a single organization
- Compliance/audit requirements (SOC 2, data residency)
- ERP or TMS integration requirements
- Custom training and implementation support

### Enterprise Roadmap

#### Phase M10–M12: Enterprise Foundation

**RBAC (Role-Based Access Control)**
- Roles: Owner, Admin, Analyst, Viewer
- Permissions matrix: create, read, update, delete per module
- Role assignment at org level; override at individual user level
- Audit event on every role change

**SSO Integration**
- Google Workspace SAML 2.0 / OAuth 2.0
- Microsoft 365 SAML 2.0 / OAuth 2.0
- JIT (just-in-time) provisioning on first SSO login
- SCIM 2.0 provisioning for bulk user management (M14)
- Enforce SSO (block email/password login for SSO-provisioned accounts)

**Audit Log**
- All data access, mutations, exports, configuration changes
- 90-day retention on Pro, 3-year retention on Enterprise
- Exportable as CSV (compliance officers)
- Filterable by user, action type, resource, date range

#### Phase M13–M15: Enterprise Operations

**API Access Tier**
- API key management (create, rotate, revoke)
- Per-key rate limits and scope restrictions
- API usage dashboard with request volume, latency, error rate
- Webhook management (register, test, pause, replay)
- OpenAPI spec published and versioned

**Custom Branding**
- Logo replacement in PDF exports
- Custom color scheme in exported documents
- Custom sender domain for email notifications (`noreply@client-domain.com`)
- White-label option for MSPs and brokers reselling to clients

**FTZ Consulting Workflow Module**
- Intake form for FTZ consulting engagements
- Deliverable tracker (assessment, PF/GPA recommendation, implementation roadmap)
- Client-facing status portal (subset of internal dashboard)
- Invoice generation for consulting hours
- Document handoff package assembly

#### Phase M16–M18: Enterprise Scale

**ERP Integrations**
- NetSuite: shipment sync, duty expense booking
- SAP S/4HANA: IM/WM module integration
- QuickBooks: import duty expense sync
- Integration model: webhook push from Shipping Savior → Zapier/Make middleware → ERP
- Native connectors for top 3 ERPs (post-Series A priority)

**Data Residency & Security**
- EU data residency option (hosted on Vercel EU region)
- Data processing agreement (DPA) for GDPR compliance
- SOC 2 Type II certification (18-month target)
- Penetration test (annual, external vendor)
- Encryption at rest for all PII (AES-256)

**Dedicated Support**
- Named customer success manager for Enterprise accounts
- Dedicated Slack channel with < 4-hour response SLA
- Monthly business review (MBR) call template
- Training session credit (4 hours onboarding + 2 hours per quarter)

---

## 10. Deprecation & Migration Plans

### Proposal Site → Full Platform Migration

The current Phase 0 proposal site (`/`, `/dashboard`, `/ftz-analyzer`, etc.) uses static JSON datasets and mock calculators with no auth or database. When the full platform launches, this content must be migrated or deprecated cleanly.

#### Migration Plan

| Proposal Site Route | Disposition | Timeline | Migration Path |
|---------------------|-------------|----------|---------------|
| `/` (landing) | Redeploy as marketing landing page | Gate 1 (M3) | New marketing page with "Get Started" CTA to `/register` |
| `/dashboard` (wireframe) | Deprecated | Gate 1 (M3) | Replaced by authenticated `/app/dashboard` |
| `/ftz-analyzer` (static) | Replaced | Gate 1 (M3) | `/app/ftz-modeler` with live OFIS data |
| `/knowledge-base` | Preserved as public | Ongoing | Convert to Markdown-driven public docs |
| `/phases` | Deprecated | Gate 2 (M6) | Roadmap becomes internal `.planning/` only |
| `/six-sigma` | Deprecated | Gate 2 (M6) | Replace with investor brief if needed |
| `/tech-spec` | Deprecated | Gate 2 (M6) | Move to docs/ internal |
| `/monetization` | Deprecated | Gate 2 (M6) | Move to pitch deck, not public |
| `/agreement` | Preserved | Ongoing | Partner agreements stay public |

#### URL Migration Rules

- All redirected routes return HTTP 301 (permanent redirect) — not 404
- `/ftz-analyzer` → `/app/ftz-modeler` (after auth gate)
- `/dashboard` → `/` (landing) with "Log in" CTA
- `/phases` → `/ #roadmap` section (collapsed)
- Redirects implemented in `next.config.ts` `redirects()` array

#### Data Migration

Phase 0 has no user data. No database migration required. Static JSON files in `/data/` are decommissioned as each feature migrates to live API data.

#### Calculator Deprecation

When live data is available:
- Static carrier rate tables (mock data) → deprecated in favor of FBX/Maersk feeds (Gate 3)
- Mock HTS rates → deprecated in favor of USITC pipeline (Gate 1)
- Static FTZ zone list → deprecated in favor of OFIS integration (Gate 1)

Deprecation process: 4-week notice period in `/changelog`, then 301 redirect to replacement page.

---

### API Version Deprecation Policy

When a new API version ships, the previous version enters a 12-month deprecation window:
1. **Month 0:** New version available. Deprecation notice in API changelog.
2. **Month 9:** Email notification to all API key holders with migration guide.
3. **Month 12:** Old version returns HTTP 410 Gone with upgrade instructions in response body.

---

## 11. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Terminal49 rate limits block container tracking at scale | Medium | High | Implement aggressive caching (TTL 1h); negotiate higher tier; build fallback to direct carrier scraping |
| CBP changes HTS file format, breaking parser | Low | High | Subscribe to USITC change notifications; build format-agnostic parser with validation |
| April 2025 executive order expands PF scope, invalidating FTZ models | Medium | High | Flag all FTZ outputs with "rates may change" disclaimer; update OFIS integration monthly |
| Freightos FBX API moves to paid-only tier | Low | Medium | Budget $500/mo for data; negotiate startup rate; fallback to Drewry WCI or Xeneta |
| Maersk Developer Portal API throttles our refresh rate | Medium | Medium | Cache all rates 24h TTL; stagger refresh across carriers |
| AI classification accuracy < 90% at launch | Medium | High | Extended beta test with 100-product labeled set; soft-launch with "high confidence only" flag |
| Stripe payment failures reduce trial conversions | Low | High | Implement retry logic; dunning emails via Resend; 7-day grace period |
| Multi-tenant data isolation bug | Low | Critical | Enforce orgId FK on every query; DB-level row security; pentest before enterprise launch |
