# Milestones

## Completed

### Phase 1: Proposal Site
- Interactive proposal website with 6 calculators (landed cost, unit economics, FTZ savings, PF/NPF, container utilization, tariff scenarios)
- HTS code lookup (200+ SE Asia codes)
- Interactive route map (MapLibre + deck.gl)
- Dashboard wireframes (shipment tracking, analytics, KPIs, data pipeline, monitoring)
- Knowledge base & SOPs
- Proposal content (architecture, Six Sigma, revenue model, roadmap)

### Phase 2: Planning
- Technical architecture document
- Data pipeline design
- AI agent plans
- Go-to-market strategy
- Financial model

## Completed (continued)

### v1.0 M1 Foundation (2026-03-26 → 2026-04 complete)
- NextAuth v5 authentication (email/password, bcrypt, JWT, audit logging)
- Neon PostgreSQL + Drizzle ORM migrations
- Multi-tenant organization model with RBAC
- Calculator data persistence for all 6 calculators
- Audit logging of all auth events
- 3,700+ ports, 200+ HTS codes, 260+ FTZ zones seeded
- AI Chatbot with Claude tool-use
- Contract Manager (schema + CRUD + UI)
- Executive Dashboard

## In Progress

### v1.1 Investor Demo Sprint (started 2026-04-22 — target May 8 freeze / May 11 pitch)

**Scope:** consolidates M2 Carrier Intelligence + M3 Contract Mgmt MVP + M4 Investor Demo + nav redesign + public home redesign.

**Shipped 2026-04-22:**
- v0 Terra template analyzed (23 testable assertions in `.planning/template-analysis/v0-terra/DESIGN-STANDARD.json`)
- Hero redesigned: added `VercelV0Chat` ("What can we help you ship?") with shipping-themed action buttons
- New Global Trade Lanes section with interactive 3D `GlobeFlights` component (real Qingdao→LB, Rotterdam→Balboa, Seattle→HNL lanes)
- Operations Dashboard: compact AI command bar at top
- 4 reusable components + 4 standalone demo routes

**Still to do:**
- Chat onSubmit → Claude API
- Logo marquee (real partners: Chiquita, Kingsco, Hall Pass, Great White Fleet, Lineage, Trader Joe's, Maersk, Matson, Pasha Hawaii)
- Animated counter metrics strip
- Industries pages (cold-chain, automotive, personal-care)
- Pricing page (Free/Premium/Enterprise, 8/20/unlimited user bundles)
- Platform nav IA redesign (Plan/Find/Price/Operate)
- M2 carrier schedule aggregator + reliability scoring
- M3 contract upload with Claude vision
- M4 guided demo flow + PDF export + mobile responsiveness
