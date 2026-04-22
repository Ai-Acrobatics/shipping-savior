# Shipping Logistics Platform

## What This Is

A comprehensive logistics platform and interactive proposal for an international freight/cold chain business. Includes a client-facing proposal website with wireframes, calculators, and research — plus the underlying tools for freight brokerage, import/export operations, tariff optimization, and supply chain management. The founder currently dominates cold chain exports through a Lineage terminal (96-97% of volume) and is expanding into SE Asia consumer goods imports.

## Core Value

Give the founder a complete digital toolkit that turns manual freight brokerage workflows into systematized, data-driven operations — and a polished proposal site that communicates this vision to partners and investors.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Proposal & Presentation**
- [ ] Interactive proposal website (Next.js) showcasing the logistics platform vision
- [ ] Wireframes for all major platform screens (dashboard, calculators, route planner, knowledge base)
- [ ] Platform capability overview with visual architecture diagrams
- [ ] Revenue model and unit economics visualization

**Calculators & Tools**
- [ ] Landed cost calculator (unit cost + shipping + duties + fulfillment = landed cost per unit)
- [ ] Unit economics calculator ($0.10 origin → $0.50 landed → $2.00 wholesale → $5.00 retail with margin analysis)
- [ ] Duty/tariff estimator (HTS code lookup, tariff rates by country of origin, calculate per-unit duty)
- [ ] FTZ savings analyzer (compare duty-locked vs. current rates, show savings over time with incremental withdrawal modeling)
- [ ] Container utilization calculator (units per container by product dimensions, cost-per-unit at scale)

**Freight Brokerage Workflow**
- [ ] Carrier/route comparison tool (origin → destination, 3 options with pricing tiers)
- [ ] Backhaul availability indicator (return-leg pricing advantages)
- [ ] Transshipment route mapping (Panama, Cartagena, major hub ports — hub-and-spoke visualization)
- [ ] Bill of lading document generator/tracker
- [ ] Vessel schedule aggregator from public carrier data

**Knowledge Base & SOPs**
- [ ] Import process documentation (step-by-step from sourcing to fulfillment)
- [ ] FTZ/bonded warehouse operational guide
- [ ] Compliance checklist by product category and country of origin
- [ ] Documentation requirements matrix (bill of lading, commercial invoice, packing list, ISF, etc.)
- [ ] Tariff classification guide (HTS code determination)

**Research & Intelligence**
- [ ] International shipping ecosystem map (carriers, ports, FTZs, APIs, data sources)
- [ ] SE Asia sourcing market analysis (apparel, CPG — key countries, trade routes, duty schedules)
- [ ] Public shipping data sources inventory (CBP, carrier schedules, port statistics)
- [ ] Competitive landscape of logistics tech platforms (Freightos, Flexport, Xeneta, etc.)

**Dashboard**
- [ ] Shipment tracking overview (containers in transit, at port, in FTZ, delivered)
- [ ] Cost/margin dashboard per shipment and per product line
- [ ] Cold chain vs. general cargo split view
- [ ] Partner/fulfillment center status

### Out of Scope

- Live carrier API integrations (Phase 1 is research + mock data) — real integrations after platform validated
- Payment processing / invoicing — separate system, not core to logistics operations
- Warehouse management system (WMS) — use existing Lineage/3PL systems
- Customer-facing e-commerce storefront — the online selling channel is a separate project

## Context

**Current Operations:**
- Founder handles 96-97% of exports through a major Lineage cold storage terminal
- Operations partner based in Costa Rica
- Core expertise is cold chain (perishables, temperature-controlled cargo)
- Freight brokerage workflow is manual: research vessels, present 3 options to customers with pricing tiers based on backhaul availability and transshipment routes

**Expansion Strategy:**
- SE Asia trips planned to source high-quality consumer products (apparel, CPG)
- Model: bankroll container purchase → import to US → pay duties → partner with fulfillment center → sell online
- Unit economics target: $0.10/unit origin cost, $0.50 landed, $2.00 wholesale, $5.00 retail (50% end-buyer margin)
- 500K+ small units per container, supply chain costs amortized across units

**Tariff/FTZ Strategy:**
- Foreign Trade Zones lock duty rates on date of entry regardless of future increases
- Incremental pallet withdrawal (e.g., 100 units at a time) — pay duties only on what leaves bonded warehouse
- Tariffs calculated on unit price at origin, NOT retail price
- FTZ strategy is a key competitive advantage worth showcasing in the platform

**Shipping Industry Context:**
- Bill of lading and much shipping data is public information (not behind firewalls)
- Transshipment works like airline hub-and-spoke (Panama, Cartagena as major hubs)
- Container logistics at terminals is still very manual
- The "first on the Silk Road" advantage — finding high-quality products before competitors

## Constraints

- **Stack**: Next.js 14 (App Router), Tailwind CSS, TypeScript — consistent with agency standards
- **Data**: Phase 1 uses researched real-world data + mock operational data (no live API integrations yet)
- **Design**: Premium proposal aesthetic matching agency portfolio (done-with-debt template style)
- **Deployment**: Vercel
- **Timeline**: Build proposal site and wireframes first, then research/tools in subsequent phases

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Proposal site first, platform later | Need to communicate vision before building full platform | — Pending |
| Mock data for Phase 1 calculators | Real API integrations require carrier partnerships; validate UX first | — Pending |
| FTZ strategy as hero feature | Unique competitive advantage, complex enough to warrant dedicated tooling | — Pending |
| Hub-and-spoke route visualization | Makes transshipment intuitive for customers unfamiliar with ocean freight | — Pending |
| Cold chain as primary, general cargo as expansion | Reflects founder's current expertise and revenue base | — Pending |

---

## Current Milestone: v1.1 Investor Demo Sprint

**Goal:** Ship an investor-grade public home + platform dashboard ready for Larry's pitch on May 11, consolidating M2 (Carrier Intelligence) + M3 (Contract Management MVP) + M4 (Investor Demo) into one sprint.

**Investor pitch:** 2026-05-11 in Las Vegas (golf tournament w/ Larry, Hall Pass owner)
**Code freeze target:** 2026-05-08

**Target features:**

*Public marketing surface (new)*
- [x] Hero AI chat ("What can we help you ship?") with Claude tool-use
- [x] Interactive 3D globe showing real shipping lanes (Qingdao→LB, Rotterdam→Balboa, Jones Act domestic, etc.)
- [ ] Animated counter metrics strip (3,700 ports · 200+ HTS · 260 FTZs · 8 carriers)
- [ ] Logo marquee (Chiquita · Kingsco · Hall Pass · Great White Fleet · Lineage · Trader Joe's · Maersk · Matson · Pasha Hawaii)
- [ ] Industries vertical pages: cold-chain · automotive · personal-care
- [ ] Tiered pricing page (Free with ads / Premium / Enterprise · 8 / 20 / unlimited user bundles per Blake's April 7)

*M2 Carrier Intelligence*
- [ ] Shipping line schedule aggregator (Maersk, MSC, CMA CGM, ONE, Hapag-Lloyd)
- [ ] Port-to-port carrier discovery with overlap detection
- [ ] Carrier performance/reliability scoring (VSA alliance + on-time history)
- [ ] Jones Act carrier support (Matson, Pasha Hawaii)
- [ ] Multi-modal indicator (ocean/rail/air/drayage)

*M3 Contract Management MVP*
- [ ] Contract upload with Claude vision PDF parsing
- [ ] Lane visibility across contracts
- [ ] Booking-on-tariff detection
- [ ] Cross-dock facility tracking concept (Hall Pass/Port Hueneme use case)

*M4 Investor Demo polish*
- [x] Dashboard AI command bar ("What can we help you ship?")
- [ ] Guided demo flow — Qingdao→LA + Trader Joe's/Hall Pass use cases
- [ ] Executive dashboard with real analytics from DB
- [ ] PDF export capabilities
- [ ] Mobile responsiveness pass

*Navigation redesign*
- [ ] Platform sidebar reorganized: Plan (Carrier/Route/Multi-modal) · Find (Port/HTS/FTZ) · Price (6 calculators) · Operate (Contracts/Shipments/Cross-dock)

**Success criteria:**
- Investors can hit the home page and immediately understand the product via hero chat + rotating globe
- Demo flow walks through Qingdao→LA + Trader Joe's use cases with real data
- All 23 test cases in `.planning/template-analysis/v0-terra/DESIGN-STANDARD.json` pass via `/template-analyzer --mode verify`
- Mobile responsive at 375px
- Pricing page live with three tiers
- At least 3 industries pages live

## Key Decisions (v1.1)

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Consolidate M2+M3+M4 into v1.1 Investor Demo Sprint | May 11 deadline too tight for 3 separate milestones; one unified sprint with hard freeze May 8 | ✓ Decided 2026-04-22 |
| Home audience = both investor + B2B customer | Hero AI chat works for either; content hedges neither | ✓ Decided 2026-04-22 |
| Industries scope: cold-chain + automotive + personal-care only | Matches Blake's pitch verticals; avoid scope creep | ✓ Decided 2026-04-22 |
| Contract upload MVP uses Claude vision PDF parsing | Matches Blake's "contracts in one place" vision; Anthropic SDK already integrated | ✓ Decided 2026-04-22 |
| Pricing = Free (ads) / Premium / Enterprise, 8 / 20 / unlimited users | Per Blake April 7 framing — tested with real buyers | ✓ Decided 2026-04-22 |
| Platform nav: Plan / Find / Price / Operate | Job-to-be-done grouping beats current tool-type grouping for B2B users | ✓ Decided 2026-04-22 |
| Use v0 Terra template patterns as the visual spec | Blake and Larry are visual-first; Terra's animation polish gives investor-grade feel | ✓ 23 test cases in DESIGN-STANDARD.json |
| Include Chiquita, Kingsco, Hall Pass, Great White Fleet, Lineage as logos | Real Blake relationships per April 1 + 7 meeting transcripts | ✓ Built into globe markers + marquee plan |

---

## Milestone History

| Milestone | Status | Notes |
|-----------|--------|-------|
| Phase 1: Proposal Site | **Complete** | Interactive proposal with 6 calculators, route map, knowledge base, wireframes |
| Phase 2: Planning | **Complete** | Architecture, pipeline, AI agents, GTM, financial model docs |
| v1.0 M1 Foundation | **Complete** | Auth, DB, org model, calculator persistence — shipped Mar 2026 |
| v1.1 Investor Demo Sprint | **In Progress** | Home redesign + M2/M3/M4 consolidated, target May 8 freeze for May 11 pitch |

---
*Last updated: 2026-04-22 — Milestone v1.1 Investor Demo Sprint started (consolidates M2+M3+M4)*
