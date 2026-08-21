# Vessel Map (AI-12012)

Route arcs and vessel positions for the org's active ocean lanes, at
`/platform/vessel-map`.

## What it shows

- **Lane arcs** — a true great-circle path between each shipment's load and
  discharge port, coloured by shipment status (in transit / delayed / arrived /
  pending).
- **Port markers** — amber for origin, cyan for destination, labelled by LOCODE.
- **Vessel markers** — one per lane. A **white ring** means a live AIS fix; a
  **slate ring** means the position was interpolated from the ETD → ETA
  schedule. Clicking a vessel opens a popup with reference, container, carrier,
  voyage, lane, ETA, progress and (when live) speed over ground.
- **Unmapped shipments** — anything whose ports could not be resolved is listed
  under the map with the reason, instead of being silently dropped.

## Architecture

| Piece | Path | Responsibility |
|---|---|---|
| Geometry | `src/lib/vessel-map/geo.ts` | Great-circle interpolation, distance, bearing, antimeridian-safe paths |
| Port resolution | `src/lib/vessel-map/ports.ts` | Free-text / LOCODE → coordinates against `data/ports.json` (707 ports) |
| Lane model | `src/lib/vessel-map/lanes.ts` | Shipments → lanes, schedule progress, AIS overlay |
| GeoJSON builders | `src/lib/vessel-map/features.ts` | Lane / port / vessel FeatureCollections + popup HTML |
| AIS normalization | `src/lib/ais/normalize.ts` | Vendor payloads → one `AisPosition` shape |
| AIS providers | `src/lib/ais/provider.ts` | `none` \| `aishub` \| `http`, all fail-soft |
| API | `src/app/api/vessels/positions/route.ts` | Org-scoped `GET`, returns lanes + meta |
| Map | `src/components/vessel-map/VesselMap.tsx` | MapLibre GL rendering (client-only) |
| Page | `src/app/(platform)/platform/vessel-map/` | Auth gate + stats, table, refresh |

## API

```
GET /api/vessels/positions[?all=1][&limit=N]
```

- Requires a session with an `orgId`; 401 otherwise.
- Defaults to `in_transit` + `delayed` shipments. `?all=1` includes arrived and
  pending. `limit` defaults to 200, capped at 500.
- Response: `{ lanes, unresolved, meta }`. `meta` carries `aisProvider`,
  `livePositions`, `estimatedPositions` and `unresolvedCount` — the UI banner
  and stat strip read straight from it.

Coordinates are GeoJSON `[lng, lat]`. Lane paths use **continuous** longitudes,
so a trans-Pacific lane runs 121° → 241° rather than wrapping at ±180. This is
deliberate and legal for MapLibre; re-wrapping each vertex is what draws a line
straight back across Eurasia.

## Configuration

All optional — the map works with none of it set.

| Var | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_MAP_STYLE_URL` | MapLibre demo tiles | Basemap style. Point at MapTiler / Protomaps / Stadia for production tiles. |
| `AIS_PROVIDER` | `none` | `none` \| `aishub` \| `http` |
| `AISHUB_USERNAME` | — | Required when `AIS_PROVIDER=aishub` |
| `AIS_API_URL` | — | Required when `AIS_PROVIDER=http`. Supports `{vessels}`, `{mmsi}`, `{imo}` placeholders. |
| `AIS_API_KEY` | — | Sent per `AIS_API_KEY_HEADER` |
| `AIS_API_KEY_HEADER` | `Authorization` | `Authorization` sends `Bearer <key>`; anything else sends the raw key |

With `AIS_PROVIDER=none` every vessel is positioned from its schedule and
labelled "Estimated" in both the map legend and the lane table, and the page
shows a banner explaining why. Adding a provider upgrades matched vessels to
live fixes with no other change.

## Failure behaviour

- A provider outage, non-200, or timeout resolves to zero positions — the map
  degrades to estimates rather than erroring.
- AIS fixes older than 12 hours are dropped as stale.
- A port that is not in `data/ports.json` produces an `unresolved` entry, never
  a marker at (0, 0).
- A basemap style that fails to load shows an inline warning; lanes and vessels
  still render.

## Adding ports

Port resolution reads `data/ports.json`. Names are matched tolerantly —
`"Port of Los Angeles"`, `"SHANGHAI, CN"`, `"New York"` (catalog name is
`"New York/New Jersey"`) and `"Norfolk"` (catalog name is `"Norfolk (Virginia)"`)
all resolve. If a lane shows up as unmapped, add the port to `data/ports.json`
with `locode`, `name`, `country`, `country_code`, `lat` and `lng`.

## Tests

```bash
npx vitest run src/lib/vessel-map src/lib/ais src/app/api/vessels
```

101 unit tests cover the geometry (including antimeridian continuity), port
resolution against the real catalog, schedule progress, AIS normalization for
both AISHub and camelCase REST payloads, provider fail-soft behaviour, and the
API route's auth gating, org scoping and status filtering.
