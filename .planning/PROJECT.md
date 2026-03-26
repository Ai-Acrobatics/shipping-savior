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

## Current Milestone: v1.0 M1 Foundation

**Goal:** Turn the demo into a real platform with authentication, multi-tenant database, calculator persistence, and audit logging.

**Target features:**
- [ ] NextAuth v5 with email/password (bcrypt) — register, login, logout
- [ ] Organization model — multi-tenant from day one with org_id on all rows
- [ ] Role-based access: owner / admin / member / viewer
- [ ] Invite-only registration (beta access control)
- [ ] Neon PostgreSQL + Drizzle ORM migrations
- [ ] Tables: organizations, users, shipments, calculations, audit_logs, hts_lookups
- [ ] All calculator data persists to database (landed cost, FTZ, unit economics, container util, tariff scenarios)
- [ ] Audit log captures all auth events
- [ ] JWT sessions with 30-day expiry

**Success criteria:**
- Users can register, log in, and log out
- Org owner can invite team members
- All calculator results save to database and reload
- Audit log captures every auth event

---

## Milestone History

| Milestone | Status | Notes |
|-----------|--------|-------|
| Phase 1: Proposal Site | **Complete** | Interactive proposal with 6 calculators, route map, knowledge base, wireframes |
| Phase 2: Planning | **Complete** | Architecture, pipeline, AI agents, GTM, financial model docs |
| v1.0 M1 Foundation | **In Progress** | Auth, DB, org model, calculator persistence |

---
*Last updated: 2026-03-26 — Milestone v1.0 M1 Foundation started*
