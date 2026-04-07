# Plan: Phase 6 — Carrier Schedule Aggregation

---
wave: 1
depends_on: []
files_modified:
  - src/lib/types/schedules.ts
  - src/lib/data/carrier-schedules.ts
  - src/lib/data/jones-act-carriers.ts
  - src/app/api/schedules/search/route.ts
  - data/schedules/*.json
autonomous: true
---

## Goal
Create a unified carrier schedule database with search API covering international ocean carriers and domestic Jones Act carriers.

## Tasks

<task id="6.1" effort="3h">
<title>Define unified schedule schema and types</title>
<description>
Create TypeScript types for the carrier schedule system:
- `CarrierSchedule`: carrier, vessel, origin_port, dest_port, departure_date, arrival_date, transit_days, mode (ocean|rail|air|drayage), is_jones_act
- `Carrier`: name, code, alliance, is_jones_act, headquarters, fleet_size
- `TransportMode`: enum (ocean, rail, air, drayage, intermodal)
- `BillType`: enum (ocean_bill, airway_bill, seaway_bill, rail_bill)

Update existing `src/lib/types/schedules.ts` or create if missing.
</description>
</task>

<task id="6.2" effort="4h" depends_on="6.1">
<title>Build international carrier schedule data</title>
<description>
Create schedule data files for top carriers on key routes. Seed with realistic 8-week rolling data.

Carriers to include:
- Maersk (2M Alliance)
- MSC (2M Alliance)  
- CMA CGM (Ocean Alliance)
- ONE (THE Alliance)
- Hapag-Lloyd (THE Alliance)
- Evergreen (Ocean Alliance)
- Cosco (Ocean Alliance)

Priority routes (from Blake's requirements):
- Qingdao → Port of LA (Blake's demo route)
- Shanghai → Long Beach
- Rotterdam → Port of LA
- Buenaventura → Port of Wainimi (Chiquita)
- Netherlands ports → Central America (Blake's apple program)

Create at `src/lib/data/carrier-schedules.ts` with typed data.
</description>
</task>

<task id="6.3" effort="2h" depends_on="6.1">
<title>Build Jones Act carrier data</title>
<description>
Create schedule data for domestic US Jones Act carriers:

Carriers:
- Matson (Hawaii, Alaska, Guam, Pacific)
- Pasha Hawaii (Hawaii)

Routes:
- Los Angeles → Honolulu (Julian's client use case)
- Seattle → Honolulu
- Seattle → Anchorage
- Oakland → Honolulu
- Port Everglades → San Juan, Puerto Rico
- Port Everglades → St. Thomas, USVI

Flag: `is_jones_act: true`, `customs_required: false` for domestic moves.
Create at `src/lib/data/jones-act-carriers.ts`.
</description>
</task>

<task id="6.4" effort="3h" depends_on="6.2,6.3">
<title>Build schedule search API</title>
<description>
Create `/api/schedules/search` endpoint:

Query params:
- `origin` (port code or name, fuzzy match)
- `destination` (port code or name, fuzzy match)
- `carrier` (optional, filter by carrier code)
- `mode` (optional: ocean, rail, air, drayage)
- `jones_act` (optional: true/false to filter)
- `from_date`, `to_date` (date range)

Response: sorted by departure_date, includes transit_days, carrier info, mode, reliability score.

Add to existing API structure in `src/app/api/`.
</description>
</task>

## Verification
- [ ] `GET /api/schedules/search?origin=Qingdao&destination=Los Angeles` returns Maersk, MSC, CMA CGM schedules
- [ ] `GET /api/schedules/search?origin=Los Angeles&destination=Honolulu&jones_act=true` returns Matson, Pasha Hawaii only
- [ ] All schedules have valid transport mode and bill type
- [ ] TypeScript compiles with no errors on new types
- [ ] `npm run build` succeeds

## must_haves
- Unified schema covers both international and Jones Act carriers
- Search API returns correct results for Blake's demo route (Qingdao → LA)
- Jones Act carriers clearly flagged and filterable
- Multi-modal transport type field present on all schedule records
