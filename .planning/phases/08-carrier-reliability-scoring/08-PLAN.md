# Plan: Phase 8 — Carrier Reliability Scoring

---
wave: 2
depends_on: [6, 7]
files_modified:
  - src/lib/data/carrier-reliability.ts
  - src/lib/data/alliance-data.ts
  - src/components/platform/ReliabilityScorecard.tsx
  - src/app/api/carriers/reliability/route.ts
autonomous: true
---

## Goal
Score carriers on schedule reliability with on-time %, average delay, and alliance membership so users choose carriers with confidence.

## Tasks

<task id="8.1" effort="3h">
<title>Seed carrier reliability data</title>
<description>
Create reliability dataset seeded from industry reports (Sea-Intelligence Global Liner Performance):

Per carrier per route:
- `on_time_pct`: percentage (e.g., 72.3%)
- `avg_delay_days`: average delay when late (e.g., 2.1 days)
- `schedule_changes_30d`: number of schedule changes in last 30 days
- `performance_score`: composite 1-100 score
- `trend`: "improving" | "stable" | "declining"

Seed realistic data based on published 2025-2026 industry averages:
- Maersk: ~75% on-time
- MSC: ~68% on-time
- CMA CGM: ~72% on-time
- ONE: ~70% on-time
- Matson (Jones Act): ~85% on-time (domestic routes more reliable)

Create at `src/lib/data/carrier-reliability.ts`.
</description>
</task>

<task id="8.2" effort="2h">
<title>Build VSA/alliance membership data</title>
<description>
Create alliance and vessel sharing agreement data:

Alliances:
- 2M Alliance: Maersk, MSC
- Ocean Alliance: CMA CGM, Cosco, Evergreen, OOCL
- THE Alliance: ONE, Hapag-Lloyd, Yang Ming, HMM

Per alliance:
- Member carriers
- Shared routes
- Total fleet capacity (TEUs)
- Market share %

Jones Act carriers: independent (no alliances).

Create at `src/lib/data/alliance-data.ts`.
</description>
</task>

<task id="8.3" effort="3h" depends_on="8.1,8.2">
<title>Build reliability scorecard component</title>
<description>
Create `ReliabilityScorecard` component:

UI per carrier:
- Performance score gauge (1-100, color-coded: green >80, amber 60-80, red <60)
- On-time arrival % with trend indicator arrow
- Average delay (days) when late
- Alliance badge
- Schedule changes count (last 30 days)
- Sparkline showing 6-month reliability trend

Integrate into:
- Carrier discovery results (show score next to each carrier)
- Carrier comparison table (add reliability column)
- Schedule search results (show score badge)

Create API: `/api/carriers/reliability?carrier=MAERSK&route=CNQIN-USLAX`
</description>
</task>

## Verification
- [ ] Reliability scores display on carrier discovery page
- [ ] Maersk shows ~75% on-time with "2M Alliance" badge
- [ ] Matson shows ~85% on-time with "Jones Act" badge (no alliance)
- [ ] Comparison table includes reliability column
- [ ] API returns correct reliability data per carrier per route
- [ ] `npm run build` succeeds

## must_haves
- Every carrier in the system has a reliability score
- Scores visible during carrier discovery and comparison
- Alliance membership clearly displayed
- Jones Act carriers show domestic reliability (typically higher)
