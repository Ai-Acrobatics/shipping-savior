# State

## Current Position

Phase: JV Formation + Pre-Investor Demo Sprint
Plan: M2 Carrier Intelligence — in progress
Status: Active development toward May 11 investor demo
Last activity: 2026-04-07 — JV agreement created, Telegram group established, UX audit initiated

## Joint Venture Structure

- **Julian Bradley / AI Acrobatics** — Technology, AI/ML, platform engineering (50%)
- **Blake Harwell** — Cold chain logistics, carrier relationships, sales/BD (50%)
- **Investor (Larry)** — May 11, 2026 pitch at Las Vegas golf tournament
- **Ownership:** 50/50 pre-investment, target thirds post-investment
- **JV Agreement:** shipping-savior.vercel.app/agreement
- **Whimsical Diagram:** https://whimsical.com/shipping-savior-platform-architecture-and-jv-roadmap-Hix3eXGqZwqv9dho8tC1mA

## Milestone Status

### M1: Foundation (COMPLETE)
- ✅ Phase 1: Database schema (Drizzle + Neon, 5 tables, 2 enums)
- ✅ Phase 2: Authentication (NextAuth v5, Credentials, JWT, bcryptjs, audit logging)
- ✅ Phase 3: Organization model (RBAC, invite flow, tenant isolation)
- ✅ Phase 4: Platform shell (sidebar, dashboard, calculators hub, history, settings)
- ✅ Phase 5: Calculator persistence (save/load/history for all 6 calculators)
- ✅ AI Chatbot with Claude tool-use
- ✅ Contract Manager with DB schema/CRUD/UI
- ✅ Executive Dashboard
- ✅ 3,700+ ports, 200+ HTS codes, 260+ FTZ zones

### M2: Carrier Intelligence (IN PROGRESS — Target: April 15)
- [ ] Shipping line schedule aggregator (Maersk, MSC, CMA CGM)
- [ ] Port-to-port carrier discovery
- [ ] Carrier performance/reliability scoring

### M3: Contract Management MVP (Target: April 25)
- [ ] Contract upload and digitization
- [ ] Lane visibility across contracts
- [ ] "Booking on tariff" detection

### M4: Investor Demo Ready (Target: May 8)
- [ ] Guided demo flow (Qingdao → LA route)
- [ ] Executive dashboard with real analytics
- [ ] PDF export capabilities
- [ ] Mobile responsiveness pass

### M5: Post-Investment (Q3 2026)
- [ ] Vessel tracking (AIS integration)
- [ ] Geopolitical alerts
- [ ] Freightos-style booking flow
- [ ] Scale to 50+ port pairs

## Communications

- **Telegram Group:** Shipping Savior — AI Acrobatics (with sub-topics)
- **Blake Harwell Phone:** 760-271-6295 (preferred: text)
- **Blake Harwell DISC:** D/I — action-oriented, pitch-focused

## Blockers

- 2 pre-existing TS errors in `src/app/api/hts/search/route.ts` and `src/app/api/routes/compare/route.ts` (Set iteration)
- `src/app/api-old/` directory cleanup pending
- Need to finalize carrier data source strategy (scraping vs API partnerships)

## Key Dates

- **April 15, 2026** — M2 Carrier Intelligence target
- **April 25, 2026** — M3 Contract Management target
- **May 8, 2026** — M4 Demo Ready target
- **May 11, 2026** — Investor pitch (Las Vegas golf tournament with Larry)

## Pending Decisions

- Carrier data acquisition strategy (public scraping vs API access)
- Post-investment equity restructuring details
- Cold chain beachhead market entry approach
