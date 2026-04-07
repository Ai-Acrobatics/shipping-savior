# Plan: Phase 7 — Carrier Discovery & Comparison

---
wave: 1
depends_on: [6]
files_modified:
  - src/lib/data/carrier-ports.ts
  - src/app/api/carriers/ports/route.ts
  - src/app/api/carriers/compare/route.ts
  - src/components/platform/CarrierDiscovery.tsx
  - src/components/platform/CarrierComparison.tsx
  - src/app/platform/carrier-discovery/page.tsx
autonomous: true
---

## Goal
Enable users to input two ports and discover which carriers serve both, with side-by-side comparison including transit times, reliability, and transport modes.

## Tasks

<task id="7.1" effort="3h">
<title>Build carrier-to-port mapping data</title>
<description>
Create comprehensive carrier-port mapping for top 50 global ports.

Data structure per mapping:
- `carrier_code`, `port_code`, `port_name`, `services` (array of service strings/routes)
- `frequency` (weekly, bi-weekly, monthly)
- `is_jones_act` flag

Include Port of Wainimi (USWAI) with:
- Great White Fleet (Chiquita services)
- Dole (Network Shipping)
- Hall Pass drayage operations

Create at `src/lib/data/carrier-ports.ts`.
Also create `/api/carriers/ports` endpoint to query mappings.
</description>
</task>

<task id="7.2" effort="4h" depends_on="7.1">
<title>Build port-to-port carrier discovery component</title>
<description>
Create `CarrierDiscovery` page at `/platform/carrier-discovery`:

UI:
- Two port selector inputs (origin + destination) with autocomplete from port data
- "Find Carriers" button
- Results: list of carriers that serve BOTH ports
- Each carrier card shows: name, transit time range, frequency, alliance, mode
- Jones Act carriers shown in separate section for domestic port pairs
- Venn-style overlap count ("X carriers serve both ports")

Wire to `/api/carriers/ports` for data.
</description>
</task>

<task id="7.3" effort="4h" depends_on="7.1">
<title>Build carrier comparison component</title>
<description>
Create `CarrierComparison` component for side-by-side comparison:

UI:
- Select 2-4 carriers from discovery results
- Comparison table: transit time, reliability %, average delay, alliance, cost tier, mode
- Chart visualization (bar chart comparing transit times)
- Multi-modal indicator icons (ship, train, plane, truck)
- "Jones Act" badge on domestic carriers

Add to carrier discovery page as expandable section.
</description>
</task>

<task id="7.4" effort="2h" depends_on="7.2">
<title>Add multi-modal transport indicators</title>
<description>
Add visual mode indicators across the platform:

- Transport mode icons: ship (ocean), train (rail), plane (air), truck (drayage)
- Bill type labels where relevant
- CMA CGM intermodal example: ocean LA → rail Cajon Pass → drayage Salt Lake City
- Mode filter on carrier discovery (show only ocean, or include rail options)

Create shared icon components in `src/components/shared/TransportModeIcon.tsx`.
</description>
</task>

## Verification
- [ ] Selecting "Qingdao" and "Los Angeles" shows Maersk, MSC, CMA CGM, ONE, etc.
- [ ] Selecting "Los Angeles" and "Honolulu" shows Matson, Pasha Hawaii in Jones Act section
- [ ] Carrier comparison table renders correctly with 2-4 carriers selected
- [ ] Multi-modal icons appear on all carrier/schedule displays
- [ ] Port of Wainimi appears in port list with Great White Fleet carrier
- [ ] `npm run build` succeeds

## must_haves
- Port-to-port discovery works for Blake's demo route
- Jones Act carriers separated from international carriers
- Visual transport mode indicators on all displays
- Carrier comparison allows side-by-side evaluation
