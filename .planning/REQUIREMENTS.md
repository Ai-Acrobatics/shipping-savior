# Requirements — Shipping Savior Platform

## M1 Requirements (COMPLETE)

### R1: User Authentication ✅
### R2: Organization Model (Multi-Tenant) ✅
### R3: Database Schema ✅
### R4: Calculator Persistence ✅
### R5: Audit Logging ✅
### R6: App Shell & Navigation ✅

---

## M2 Requirements: Carrier Intelligence

### R7: Carrier Schedule Aggregation
**Priority:** P0
**Source:** Blake call 2026-04-01, updated 2026-04-07
**Phase:** 6

Aggregate shipping line schedules from major carriers into a unified searchable database. Include both international ocean carriers and domestic Jones Act carriers.

**Acceptance criteria:**
- [ ] R7.1: Schedule data for Maersk, MSC, CMA CGM (top 3 by market share)
- [ ] R7.2: Schedule data for ONE, Hapag-Lloyd, Evergreen (next tier)
- [ ] R7.3: Jones Act carrier data for Matson and Pasha Hawaii (domestic US routes)
- [ ] R7.4: Unified schema: carrier, vessel, origin_port, dest_port, departure, arrival, transit_days, mode
- [ ] R7.5: Multi-modal transport type field (ocean, rail, air, drayage)
- [ ] R7.6: Jones Act vs non-Jones Act flag on carrier records
- [ ] R7.7: 8-week rolling schedule window (matching carrier public data)
- [ ] R7.8: `/api/schedules/search` endpoint with origin, destination, carrier, date range filters

### R8: Port-to-Port Carrier Discovery
**Priority:** P0
**Source:** Blake call 2026-04-01 (manual CargoRouter.com workflow)
**Phase:** 7

Given two ports, show which carriers serve both and compare them side-by-side.

**Acceptance criteria:**
- [ ] R8.1: Carrier-to-port mapping for top 50 global ports
- [ ] R8.2: Input two ports → see overlapping carriers with transit times
- [ ] R8.3: Side-by-side comparison view (transit time, reliability, cost tier)
- [ ] R8.4: Jones Act carriers shown separately for domestic US port pairs
- [ ] R8.5: `/api/carriers/ports` endpoint returning carrier-port mappings
- [ ] R8.6: Venn-style overlap visualization for shared carriers

### R9: Carrier Reliability Scoring
**Priority:** P0
**Source:** Blake call 2026-04-01 ("schedule reliability or percentage they hit on-time arrival")
**Phase:** 8

Score carriers on schedule reliability so users can make informed choices.

**Acceptance criteria:**
- [ ] R9.1: On-time arrival percentage per carrier per route
- [ ] R9.2: Average delay in days per carrier per route
- [ ] R9.3: Overall carrier performance score (composite metric)
- [ ] R9.4: VSA/alliance membership data (2M, Ocean Alliance, THE Alliance)
- [ ] R9.5: Historical trend (improving/declining reliability)
- [ ] R9.6: Data seeded from Sea-Intelligence/industry published reports

### R10: Multi-Modal Transport Indicators
**Priority:** P1
**Source:** Blake call 2026-04-07 ("airway bill, ocean bill, seaway bill — all have identifying markers")
**Phase:** 7

Distinguish between transport modes and bill types across the platform.

**Acceptance criteria:**
- [ ] R10.1: Transport mode enum: ocean, rail, air, drayage, intermodal
- [ ] R10.2: Bill type enum: ocean_bill, airway_bill, seaway_bill, rail_bill
- [ ] R10.3: CMA CGM rail intermodal example supported (ocean → rail through Cajon Pass)
- [ ] R10.4: Visual mode indicator on all schedule/route displays

---

## M3 Requirements: Contract Management

### R11: Contract Upload & Digitization
**Priority:** P1
**Source:** Blake call 2026-04-01 ("sit there like a general and go boop boop boop")
**Phase:** 9

Digitize ocean freight contracts so users can manage lanes and rates.

**Acceptance criteria:**
- [ ] R11.1: Upload contract with metadata (type: spot/90-day/180-day/365-day)
- [ ] R11.2: Define lanes within a contract (origin, destination, rate, effective dates)
- [ ] R11.3: View all lanes across all active contracts
- [ ] R11.4: "Booking on tariff" detection — flag when user queries lane without contract
- [ ] R11.5: Contract expiry alerts (30/60/90 day warnings)
- [ ] R11.6: Lane addition request email template generation

### R12: Cross-Dock Facility Tracking
**Priority:** P2
**Source:** Blake call 2026-04-07 (Port of Wainimi / Hall Pass deal)
**Phase:** 9

Concept-level cross-dock facility awareness for demo purposes.

**Acceptance criteria:**
- [ ] R12.1: Port of Wainimi cross-dock scenario in demo data
- [ ] R12.2: Facility location + capabilities shown in port detail view
- [ ] R12.3: Drayage route visualization (Wainimi → Palmdale via 126/Fillmore bypass)

---

## M4 Requirements: Investor Demo

### R13: Demo Scenarios
**Priority:** P0
**Source:** Blake calls 2026-04-01 and 2026-04-07
**Phase:** 11

Four pre-loaded demo scenarios covering different use cases for investor pitch.

**Acceptance criteria:**
- [ ] R13.1: Qingdao → Port of LA (ocean freight, Blake's original demo route)
- [ ] R13.2: Port of Wainimi cross-dock (Trader Joe's/Hall Pass drayage + cross-dock)
- [ ] R13.3: LA → Hawaii Jones Act (Matson/Pasha Hawaii domestic shipping)
- [ ] R13.4: Netherlands → Central America via Chiquita (backhaul/export program)
- [ ] R13.5: Guided walkthrough flow connecting all 4 scenarios
- [ ] R13.6: Each scenario pre-loaded with realistic carrier/schedule/rate data

### R14: Tiered Pricing Page
**Priority:** P0
**Source:** Blake call 2026-04-07 (tiered pricing discussion)
**Phase:** 11

B2B pricing page with Free/Premium/Enterprise tiers and per-user bundles.

**Acceptance criteria:**
- [ ] R14.1: Three tiers displayed: Free, Premium, Enterprise
- [ ] R14.2: Per-user bundle pricing (1 user, up to 8, up to 20, unlimited)
- [ ] R14.3: Feature comparison matrix across tiers
- [ ] R14.4: "Contact Sales" CTA (not fake "Start Free Trial")
- [ ] R14.5: Value proposition framing: cost of incomplete information

### R15: UX Critical Fixes
**Priority:** P0
**Source:** UX audit 2026-04-07
**Phase:** 10

Fix all critical and high-severity UX issues before investor demo.

**Acceptance criteria:**
- [ ] R15.1: /login route works (not 404)
- [ ] R15.2: /platform route works (not redirect to broken login)
- [ ] R15.3: Dashboard dates updated to 2026 (not 2024)
- [ ] R15.4: Nav reduced from 11 items to 5-6
- [ ] R15.5: Hero stat counters server-rendered (not client-only animation)
- [ ] R15.6: OG image added (1200x630) for link sharing
- [ ] R15.7: robots.txt and sitemap.xml present
- [ ] R15.8: Twitter card upgraded to summary_large_image

---

## Traceability

| Requirement | Phase | Milestone | Status |
|-------------|-------|-----------|--------|
| R1-R6 | 1-5 | M1 | ✅ Complete |
| R7: Schedule Aggregation | 6 | M2 | Planned |
| R8: Carrier Discovery | 7 | M2 | Planned |
| R9: Reliability Scoring | 8 | M2 | Planned |
| R10: Multi-Modal Indicators | 7 | M2 | Planned |
| R11: Contract Management | 9 | M3 | Planned |
| R12: Cross-Dock Tracking | 9 | M3 | Planned |
| R13: Demo Scenarios | 11 | M4 | Planned |
| R14: Tiered Pricing | 11 | M4 | Planned |
| R15: UX Fixes | 10 | M4 | Planned |
