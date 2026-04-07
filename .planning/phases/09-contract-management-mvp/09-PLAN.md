# Plan: Phase 9 — Contract Management MVP

---
wave: 2
depends_on: [6]
files_modified:
  - src/lib/db/schema.ts
  - src/app/api/contracts/route.ts
  - src/app/api/contracts/[id]/route.ts
  - src/app/api/contracts/lanes/route.ts
  - src/components/platform/ContractUpload.tsx
  - src/components/platform/LaneVisibility.tsx
  - src/components/platform/TariffAlert.tsx
  - src/app/platform/contracts/page.tsx
autonomous: true
---

## Goal
Allow users to digitize ocean freight contracts, view all lanes, and get alerted when booking at tariff rates instead of contracted rates.

## Tasks

<task id="9.1" effort="3h">
<title>Extend database schema for contracts</title>
<description>
Add to Drizzle schema (`src/lib/db/schema.ts`):

Table `contracts`:
- id, org_id, name, carrier_code, contract_type (spot|90day|180day|365day)
- effective_date, expiry_date, status (active|expired|pending)
- notes, created_at, updated_at

Table `contract_lanes`:
- id, contract_id, origin_port, destination_port
- contracted_rate, currency, rate_unit (per_container|per_teu|per_kg)
- min_volume, equipment_type (20ft|40ft|40hc|reefer)
- created_at, updated_at

Run `drizzle-kit push` or generate migration.
</description>
</task>

<task id="9.2" effort="3h" depends_on="9.1">
<title>Build contract CRUD API</title>
<description>
Create API routes:

`/api/contracts` (GET, POST):
- GET: List all contracts for user's org, with lane counts and status
- POST: Create new contract with metadata

`/api/contracts/[id]` (GET, PUT, DELETE):
- GET: Single contract with all lanes
- PUT: Update contract metadata
- DELETE: Soft delete (mark inactive)

`/api/contracts/lanes` (GET, POST):
- GET: All lanes across all active contracts (for cross-contract visibility)
- POST: Add lane to a contract

All routes scoped to org_id.
</description>
</task>

<task id="9.3" effort="4h" depends_on="9.2">
<title>Build contract management UI</title>
<description>
Create `/platform/contracts` page:

Components:
1. `ContractUpload` — Form to create contract (carrier, type, dates, notes)
2. `LaneVisibility` — Table showing ALL lanes across ALL active contracts
   - Columns: origin, destination, carrier, rate, equipment, contract name, expiry
   - Sort/filter by carrier, route, expiry date
   - Color-code: green (>90 days), amber (30-90 days), red (<30 days to expiry)
3. `TariffAlert` — When user searches a route, check if they have a contracted rate
   - If no contract: show "Booking at Tariff" warning with estimated market rate
   - If contract exists: show contracted rate with savings vs tariff

Add "Contracts" to sidebar navigation.
</description>
</task>

<task id="9.4" effort="2h" depends_on="9.3">
<title>Seed demo contract data</title>
<description>
Pre-load demo contracts for investor pitch:

Contract 1: "Kingsco-CMA CGM Annual" (365-day)
- Lane: Rotterdam → Buenaventura (reefer, $3,200/40ft)
- Lane: Qingdao → Los Angeles ($2,800/40ft)

Contract 2: "Hall Pass Drayage" (spot)
- Lane: Port of Wainimi → Palmdale ($850/load)
- Lane: Port of LA → Palmdale ($1,200/load, longer route = higher cost)

Contract 3: "Matson Hawaii" (180-day, Jones Act)
- Lane: Los Angeles → Honolulu ($4,500/40ft)
- Lane: Oakland → Honolulu ($4,200/40ft)

Show tariff rates ~40% higher than contracted rates for demo impact.
</description>
</task>

## Verification
- [ ] Can create a contract with type, dates, and carrier
- [ ] Can add lanes to a contract with rate and route info
- [ ] Lane visibility table shows all lanes across contracts
- [ ] Tariff alert fires when querying route without contract
- [ ] Expiry color coding works (green/amber/red)
- [ ] Demo data loads correctly for investor scenarios
- [ ] `npm run build` succeeds

## must_haves
- Contract CRUD works with org_id scoping
- Lane visibility shows cross-contract view
- "Booking on tariff" detection works for demo routes
- Demo data includes Kingsco, Hall Pass, and Matson contracts
