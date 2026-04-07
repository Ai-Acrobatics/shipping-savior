# Roadmap — Shipping Savior Platform

## Vision

The command center for global trade intelligence — consolidating fragmented shipping schedules, carrier performance, contract management, and tariff data into one B2B platform so importers can make well-informed decisions in seconds instead of hours.

**Business Model:** Tiered B2B SaaS (Free/Premium/Enterprise) with per-user pricing
**Target Market:** 10,000+ NVOCCs, freight forwarders, importers/exporters
**Beachhead:** Cold chain (perishable goods) — highest willingness to pay
**Key Deadline:** May 11, 2026 — Investor pitch (Larry, Canadian billionaire)

---

## M1: Foundation (COMPLETE — March 2026) ✅

**Goal:** Turn static proposal site into a real platform with auth, database, and calculator persistence.
**Cost:** $2,000

### Delivered
- ✅ Drizzle ORM + Neon PostgreSQL (5 tables, 2 enums)
- ✅ NextAuth v5 (Credentials, JWT, bcryptjs, audit logging)
- ✅ Multi-tenant RBAC (org model, invite flow, tenant isolation)
- ✅ Platform shell (sidebar, dashboard, calculators hub, history, settings)
- ✅ 6 calculator persistence (save/load/history)
- ✅ AI Chatbot with Claude tool-use
- ✅ Contract Manager with DB schema/CRUD/UI
- ✅ Executive Dashboard
- ✅ 3,700+ ports, 200+ HTS codes, 260+ FTZ zones

---

## M2: Carrier Intelligence (IN PROGRESS — Target: April 15, 2026)

**Goal:** Aggregate carrier schedules, enable port-to-port discovery, and score carrier reliability.
**Cost:** $1,500
**Requirements:** R-CARRIER-1 through R-CARRIER-5

### Phase 1: Schedule Aggregation
- [ ] Build carrier schedule scraper for Maersk (public 8-week schedule data)
- [ ] Build carrier schedule scraper for MSC
- [ ] Build carrier schedule scraper for CMA CGM
- [ ] Build carrier schedule scraper for ONE, Hapag-Lloyd, Evergreen
- [ ] Create unified `shipping-schedules` schema (carrier, vessel, route, departure, arrival, transit_days)
- [ ] **NEW:** Add Jones Act carrier data (Matson, Pasha Hawaii) for domestic US routes

### Phase 2: Carrier Discovery & Comparison
- [ ] Build carrier-to-port mapping for top 50 global ports
- [ ] Port-to-port carrier discovery — input 2 ports, see overlapping carriers
- [ ] Side-by-side carrier comparison (transit time, reliability, cost tier)
- [ ] **NEW:** Jones Act vs non-Jones Act carrier distinction flag
- [ ] **NEW:** Multi-modal transport type indicator (ocean/rail/air/drayage)

### Phase 3: Reliability Scoring
- [ ] Seed schedule reliability data from Sea-Intelligence/industry reports
- [ ] On-time arrival % per carrier per route
- [ ] Average delay tracking and carrier performance scoring
- [ ] VSA/alliance membership data (2M, Ocean Alliance, THE Alliance)

**Success criteria:**
- [ ] User can search schedules by origin port, destination port, carrier, date range
- [ ] User can discover which carriers serve both ports in a pair
- [ ] Each carrier shows reliability score and on-time %
- [ ] Jones Act carriers shown separately for domestic US routes

---

## M3: Contract Management MVP (Target: April 25, 2026)

**Goal:** Digitize ocean contracts, visualize lanes, detect tariff booking situations.
**Cost:** $1,500
**Requirements:** R-CONTRACT-1 through R-CONTRACT-4
**Depends on:** M2 (carrier data needed for context)

### Deliverables
- [ ] Contract upload and digital storage (spot, 90-day, 180-day, 365-day)
- [ ] Lane visibility across all active contracts
- [ ] "Booking on tariff" detection ($7K market vs $4K contracted rate alerts)
- [ ] Automated lane addition request email templates
- [ ] **NEW:** Cross-dock facility tracking concept (Port of Wainimi use case)

**Success criteria:**
- [ ] User can upload/view contract with lanes, rates, expiry dates
- [ ] System flags when user queries a lane without a contract
- [ ] Lane overlap visualization across multiple contracts

---

## M4: Investor Demo Ready (Target: May 8, 2026)

**Goal:** Polish platform for Larry's investor pitch at Las Vegas golf tournament May 11.
**Cost:** $1,500
**Depends on:** M2, M3

### Demo Scenarios (4 routes)
- [ ] **Qingdao → Port of LA** — Blake's original demo route (ocean freight)
- [ ] **NEW: Port of Wainimi cross-dock** — Trader Joe's/Hall Pass use case (drayage + cross-dock)
- [ ] **NEW: LA → Hawaii (Jones Act)** — Matson/Pasha Hawaii domestic shipping
- [ ] **NEW: Netherlands → Central America via Chiquita** — Blake's apple export program

### Platform Polish
- [ ] Guided investor demo walkthrough flow
- [ ] Executive dashboard with real analytics and KPIs
- [ ] PDF export for carrier comparison and landed cost reports
- [ ] Mobile responsiveness pass on all features
- [ ] **NEW:** Tiered pricing page (Free/Premium/Enterprise with per-user bundles)
- [ ] **NEW:** Industry vertical selector (cold chain, automotive, personal care)

### UX Critical Fixes (from April 7 audit)
- [ ] Fix /login route (currently 404)
- [ ] Fix /platform redirect to working auth
- [ ] Update dashboard dates from 2024 to 2026
- [ ] Reduce nav from 11 items to 5-6
- [ ] Server-render hero stat counters
- [ ] Add OG image for link sharing
- [ ] Add robots.txt and sitemap.xml

### Deploy & Test
- [ ] End-to-end testing of full demo flow
- [ ] Production deployment with all features
- [ ] Pre-load all demo route data

**Success criteria:**
- [ ] 5-minute guided demo covers all 4 scenarios without friction
- [ ] No broken pages or 404s encountered during demo
- [ ] Mobile-responsive across all demo screens
- [ ] Pricing page clearly communicates B2B value proposition

---

## M5: Post-Investment (Q3 2026 — Funded by Investment)

**Goal:** Scale platform from demo to production-grade B2B SaaS.
**Cost:** TBD — funded by investment capital

### Core Features
- [ ] Real-time vessel tracking (AIS/MarineTraffic integration)
- [ ] Geopolitical alert system (route disruptions, port congestion, sanctions)
- [ ] Freightos-style guided booking flow (step-by-step)
- [ ] Scale to 50+ port pairs globally

### Multi-Modal Expansion (from April 7 call)
- [ ] Full rail intermodal support (CMA CGM rail routing through Cajon Pass etc.)
- [ ] Air freight integration (airway bill tracking)
- [ ] Drayage management (final mile from port/rail terminal)
- [ ] Cross-dock/warehouse facility management module
- [ ] Bill type handling: airway bill, seaway bill, ocean bill with unique identifiers

### Business Scaling
- [ ] NVOCC white-label portal (customer-facing tool for 10,000+ NVOCCs)
- [ ] Advertiser/sponsor integration for free tier
- [ ] Trade conference demo kit and booth strategy
- [ ] Enterprise API for large company integrations
- [ ] Alibaba/e-commerce platform internal tool angle

---

## Key People

| Person | Role | Relationship |
|--------|------|-------------|
| Julian Bradley | Co-Founder, Technology | AI Acrobatics CEO |
| Blake Harwell | Co-Founder, Industry | 10yr cold chain, Kingsco Logistics |
| Larry | Target Investor | Hall Pass owner, 30+ M&A exits, Trader Joe's logistics |
| Steve Hutchins | Larry's hire | Blake's close confidant, 1.5yr at Hall Pass |
| Chiquita CEO | Strategic partner | Blake meets twice/year, quarterly calls |

## Key Dates

| Date | Event |
|------|-------|
| April 14-16 | Blake visiting LA / Port of Wainimi (possible SD meetup) |
| April 15 | M2 Carrier Intelligence target |
| April 25 | M3 Contract Management target |
| May 8 | M4 Demo Ready target |
| May 11 | Investor pitch — Las Vegas golf tournament |

---
*Updated: 2026-04-07 — Incorporating Blake call intel (Hall Pass deal, multi-modal expansion, pricing model, Jones Act carriers)*
