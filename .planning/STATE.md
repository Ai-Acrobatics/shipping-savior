# State

## Current Position

Phase: JV Formation + Pre-Investor Demo Sprint
Plan: M2 Carrier Intelligence — in progress
Status: Active development toward May 11 investor demo
Last activity: 2026-04-07 — JV agreement deployed, Telegram group live, UX audit complete, Blake call (new intel)

## Joint Venture Structure

- **Julian Bradley / AI Acrobatics** — Technology, AI/ML, platform engineering (50%)
- **Blake Harwell** — Cold chain logistics, carrier relationships, sales/BD (50%)
- **Investor (Larry)** — Owner of Hall Pass (20,000 Trader Joe's loads/year, Allegiant Stadium, Raiders, F1, NASCAR logistics)
- **Ownership:** 50/50 pre-investment, target thirds post-investment
- **Development Budget:** $7,500 estimated (M1-M4)
- **JV Agreement:** shipping-savior.vercel.app/jv-agreement
- **Whimsical Diagram:** https://whimsical.com/shipping-savior-platform-architecture-and-jv-roadmap-Hix3eXGqZwqv9dho8tC1mA

## New Intel from April 7 Call

### Hall Pass / Larry Update
- Hall Pass has EXCLUSIVE contract for 20,000 Trader Joe's loads (all CA + Reno NV)
- Larry hired Steve Hutchins (Blake's close confidant) 1.5 years ago
- Opened 25,000 sq ft facility in North Las Vegas
- Secured contracts: Allegiant Stadium, Raiders, Formula One, NASCAR logistics
- THIS WEEK: Breaking monopoly at Port of Wainimi — Great White Fleet partnering with Hall Pass for cross-dock operations
- Hall Pass getting interchange agreements + chassis access at Port of Wainimi

### Chiquita Relationship (Major Asset)
- Kingsco (Blake's company) = 95% of Chiquita's European exports
- Shipped 6 million pounds of apples in 8 weeks last year
- Blake meets Chiquita CEO twice/year, quarterly calls with commercial team
- Chiquita rearranged vessels to accommodate Kingsco shipments
- Built ex-works program shipping through Netherlands → Central America via Chiquita ports

### Product Vision Expanded
- **Multi-modal:** Not just ocean — also rail, air freight, drayage
- **Jones Act carriers:** Matson, Pasha Hawaii for domestic US routes (Hawaii, Alaska, Puerto Rico, USVI)
- **Universal application:** Cold chain, automotive, personal care, general cargo
- **B2B product** — NOT B2C
- **Cross-dock integration:** Track facility operations alongside shipping
- **Bill types:** Airway bill, seaway bill, ocean bill — all have unique identifiers per transport mode

### Pricing Model (From Blake)
- **Tiered:** Free (with ads/credits), Premium, Enterprise
- **Per-user with bundles:** Up to 8 users, up to 20 users, unlimited
- **Value-based premium:** Charge based on cost savings from better information
- **Key insight from Julian:** "If a company has a $100M problem and we cost $5M, it's worth it"
- **Blake's framing:** "What's the sunk cost of making decisions with incomplete information?"

### GTM Strategy (From Blake)
- Trade conference booth presence (cold chain, automotive, personal care conferences)
- NVOCCs as target customers (10,000+ in the market)
- Enterprise companies integrating platform into daily operations
- "Spotify Premium" model — tool they can't live without

### Blake Visiting LA — April 14-16
- Tuesday April 14: Meetings at Port of Wainimi (cross-dock facility tour)
- Needs to be back by April 16 morning
- May come to San Diego — Julian invited him

## Milestone Status

### M1: Foundation (COMPLETE)
- ✅ Database schema (Drizzle + Neon, 5 tables, 2 enums)
- ✅ Authentication (NextAuth v5, Credentials, JWT, bcryptjs, audit logging)
- ✅ Organization model (RBAC, invite flow, tenant isolation)
- ✅ Platform shell (sidebar, dashboard, calculators hub, history, settings)
- ✅ Calculator persistence (save/load/history for all 6 calculators)
- ✅ AI Chatbot with Claude tool-use
- ✅ Contract Manager with DB schema/CRUD/UI
- ✅ Executive Dashboard
- ✅ 3,700+ ports, 200+ HTS codes, 260+ FTZ zones

### M2: Carrier Intelligence (IN PROGRESS — Target: April 15)
- [ ] Shipping line schedule aggregator (Maersk, MSC, CMA CGM, ONE, Hapag-Lloyd)
- [ ] Port-to-port carrier discovery with overlap detection
- [ ] Carrier performance/reliability scoring
- [ ] **NEW:** Jones Act carrier support (Matson, Pasha Hawaii) for domestic routes
- [ ] **NEW:** Multi-modal indicator (ocean vs rail vs air vs drayage)

### M3: Contract Management MVP (Target: April 25)
- [ ] Contract upload and digitization
- [ ] Lane visibility across contracts
- [ ] "Booking on tariff" detection
- [ ] **NEW:** Cross-dock facility tracking integration concept

### M4: Investor Demo Ready (Target: May 8)
- [ ] Guided demo flow — **UPDATED:** Include Trader Joe's/Hall Pass use case alongside Qingdao → LA
- [ ] Executive dashboard with real analytics
- [ ] PDF export capabilities
- [ ] Mobile responsiveness pass
- [ ] **NEW:** Tiered pricing page (Free/Premium/Enterprise with per-user bundles)
- [ ] **NEW:** Industry vertical demos (cold chain, automotive, personal care)

### M5: Post-Investment (Q3 2026)
- [ ] Vessel tracking (AIS integration)
- [ ] Geopolitical alerts
- [ ] Freightos-style booking flow
- [ ] Scale to 50+ port pairs
- [ ] **NEW:** Full multi-modal support (rail intermodal, air freight, drayage)
- [ ] **NEW:** Cross-dock/warehouse facility management module
- [ ] **NEW:** NVOCC customer portal (white-label for 10,000+ NVOCCs)
- [ ] **NEW:** Advertiser/sponsor integration for free tier

## Communications

- **Telegram Group:** Shipping Savior — AI Acrobatics (Chat ID: -1003715282485)
  - Topics: General (11), Deliverables (12), Development (13), Meetings (14), Investor Prep (15), Blake Comms (16)
  - Invite: https://t.me/+hF5XxAKmeu83NjEx
- **Blake Harwell Phone:** 760-271-6295 (preferred: text)
- **Blake Harwell DISC:** D/I — action-oriented, pitch-focused

## Blockers

- 2 pre-existing TS errors in `src/app/api/hts/search/route.ts` and `src/app/api/routes/compare/route.ts` (Set iteration)
- `src/app/api-old/` directory cleanup pending
- Need to finalize carrier data source strategy (scraping vs API partnerships)
- UX audit identified 4 critical issues (broken /login, /platform routes) — must fix before demo

## Key Dates

- **April 14-16, 2026** — Blake visiting LA/Port of Wainimi (possible San Diego meetup)
- **April 15, 2026** — M2 Carrier Intelligence target
- **April 25, 2026** — M3 Contract Management target
- **May 8, 2026** — M4 Demo Ready target
- **May 11, 2026** — Investor pitch (Las Vegas golf tournament with Larry)

## Pending Decisions

- Carrier data acquisition strategy (public scraping vs API access)
- Post-investment equity restructuring details
- Pricing tier structure (free/premium/enterprise — needs market research on willingness to pay)
- Jones Act carrier data sourcing (Matson, Pasha Hawaii schedules)
- Multi-modal transport support scope for MVP vs post-funding
- Trade conference booth strategy and budget
- Whether to pursue Alibaba/e-commerce platform integration angle
