# PRD-05: Interactive Shipping Route Map

**Status:** Draft
**Priority:** P1
**Route:** `/map`
**Last Updated:** 2026-03-26

---

## 1. Overview & Purpose

The Interactive Shipping Route Map provides a visual, explorable representation of maritime routes, port locations, and US FTZ zones. It serves as both an analytical tool (understanding routing options) and a presentation piece (visually impressive in partner/investor meetings).

The map is the visual anchor of the platform. It must be performant, interactive, and information-dense without being cluttered.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|------------|
| US-05-01 | Viewer | See shipping routes on a world map | I understand the geographic scope of operations |
| US-05-02 | Importer | Click a route to see details (carrier, transit time, cost) | I can explore options visually |
| US-05-03 | Importer | Filter routes by carrier, origin country, or cargo type | I see only relevant routes |
| US-05-04 | Importer | See port details (throughput, facilities, FTZ proximity) | I can evaluate ports |
| US-05-05 | Presenter | Show the map fullscreen in a meeting | It serves as a compelling visual |
| US-05-06 | Importer | See FTZ locations on the US map | I can identify nearby FTZs for my destination port |
| US-05-07 | Importer | Navigate to the map from a route comparison card | I see my selected route highlighted on the map |

---

## 3. Functional Requirements

### 3.1 Base Map

- **Renderer:** MapLibre GL JS (free, open-source)
- **React wrapper:** react-map-gl v8
- **Tile provider:** MapTiler free tier or Protomaps (self-hosted PMTiles)
- **Style:** Dark ocean theme (dark blue water, muted land masses, subtle borders)
- **Initial view:** Centered on Pacific Ocean showing SE Asia and US West Coast
- **Zoom range:** 2 (world view) to 12 (port detail)
- **Projection:** Mercator (standard for web maps; deck.gl ArcLayer handles great circle arcs)

### 3.2 Route Layer (deck.gl ArcLayer)

- Display shipping routes as curved arcs (great circle arcs, not straight lines -- Pitfall 10)
- **ArcLayer properties:**
  - `greatCircle: true`
  - Color: coded by carrier or by transit time (gradient from green=fast to orange=slow)
  - Width: 2-4px, thicker for main services
  - Opacity: 0.7 default, 1.0 on hover
  - `pickable: true` for click interaction
- **Route polylines:** Pre-computed using `searoute-js` at build time and stored in `/data/route-polylines.json`
  - Do NOT compute polylines at runtime (Pitfall 5)
  - Each polyline is a GeoJSON LineString following realistic sea lanes
- **Click interaction:** Clicking a route opens a detail panel (sidebar or bottom sheet) showing:
  - Carrier, service name
  - Origin -> transshipment(s) -> destination
  - Transit time, cost range
  - Container types supported
  - "Open in Route Comparison" link

### 3.3 Port Layer (deck.gl ScatterplotLayer)

- Display ports as circles on the map
- **Size:** Proportional to port throughput (TEU volume) or fixed size with labels
- **Color:** Differentiate origin ports (SE Asia) vs. destination ports (US) vs. transshipment hubs
  - Origin: teal/green
  - Destination: blue
  - Transshipment: orange/amber
- **Click interaction:** Clicking a port shows a detail card:
  - Port name, UN/LOCODE, country
  - Annual throughput (TEU)
  - Key terminals
  - Nearest FTZ (for US ports)
  - Typical dwell time
  - Routes passing through this port
- **Hover:** Tooltip with port name and code

### 3.4 FTZ Layer (deck.gl GeoJsonLayer)

- Display US Foreign Trade Zone locations
- **Data:** Compiled from OFIS (zone number, location, coordinates)
- **Visualization:** Point markers (not polygons -- FTZ boundaries are complex and not publicly available as GeoJSON)
- **Zoom-dependent visibility:** Only show FTZ markers when zoomed to US level (zoom >= 5)
- **Click interaction:** Zone number, name, operator, location
- **Color:** Distinct from ports (purple/violet markers)

### 3.5 Filter Controls

Floating control panel (top-right or sidebar):

| Filter | Type | Options |
|--------|------|---------|
| Carrier | Multi-select checkboxes | Maersk, CMA CGM, MSC, Evergreen, COSCO, ONE |
| Origin Country | Multi-select | Vietnam, Thailand, Indonesia, Cambodia, China |
| Destination Region | Toggle | US West Coast / US East Coast / US Gulf |
| Cargo Type | Toggle | General / Refrigerated |
| Route Type | Toggle | Direct / Transshipment |
| Show FTZ Zones | Checkbox | On/Off |

- Filters apply via deck.gl `getFilterValue` + `filterRange` for GPU-side filtering (Pitfall 5)
- Filter state synced to URL via `nuqs`

### 3.6 Route Highlighting

- When navigating from PRD-04 (Route Comparison) with a route ID in the URL:
  - Dim all other routes (opacity 0.2)
  - Highlight the selected route (opacity 1.0, thicker line, pulsing animation)
  - Auto-zoom to fit the selected route
  - Open the route detail panel automatically

### 3.7 Animated Route Visualization (Stretch Goal)

- deck.gl TripsLayer showing goods moving along routes (animated dots traveling the sea lane)
- Toggled on/off via a control
- Used for presentation effect in meetings

---

## 4. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Initial load | < 3s | Lazy-load map component, defer deck.gl layers |
| Frame rate | 60fps during pan/zoom | GPU-side filtering, pre-computed polylines |
| Route rendering | 50+ routes without frame drops | Pitfall 5 mitigations |
| Mobile | Touch-friendly pan/zoom | Disable tilt on mobile for simplicity |
| Bundle size | Map chunk < 300KB gzipped | Dynamic import for map component |
| Accessibility | Screen reader alternative | Provide a text-based route list as alternative to map |
| Fullscreen | Fullscreen toggle button | For presentation mode |

---

## 5. Data Requirements

### Pre-computed Data Files

| File | Contents | Source | Size Estimate |
|------|----------|--------|---------------|
| `/data/route-polylines.json` | GeoJSON LineStrings for all routes | Pre-computed from searoute-js | ~200KB |
| `/data/ports.json` | Port locations, names, codes, throughput | UN/LOCODE + World Port Index | ~50KB (filtered to relevant ports) |
| `/data/ftz-locations.json` | FTZ zone numbers, coordinates, operators | OFIS database | ~30KB |
| `/data/carrier-routes.json` | Route metadata (shared with PRD-04) | Compiled from carrier schedules | ~20KB |

### Build-Time Route Computation

```
Script: scripts/compute-routes.ts
Input: carrier-routes.json (origin/destination port pairs)
Process: For each route, call searoute-js with origin/destination coordinates
Output: route-polylines.json with GeoJSON LineStrings
Run: At build time via `npm run compute-routes`
```

This script runs once during development and when routes change. Output is committed to the repo. It does NOT run at runtime (Pitfall 5).

---

## 6. UI/UX Specifications

- **Map fills viewport:** Map takes full width and height minus navigation header
- **Dark theme:** Dark ocean (#0a1628), muted land (#1a2744), subtle coastline borders
- **Control panel:** Semi-transparent dark glass panel, floating top-right
- **Detail panel:** Slide-in panel from right side (desktop) or bottom sheet (mobile)
- **Route colors:** Gradient from cool (blue = 15-20 days) to warm (orange = 30+ days)
- **Port labels:** Show on hover, persistent labels for major hubs at lower zoom levels
- **Legend:** Collapsible legend in bottom-left showing color scale and marker types
- **Fullscreen button:** Top-left, toggles browser fullscreen API
- **Loading state:** Skeleton map with spinning loader while deck.gl initializes

---

## 7. Technical Implementation Notes

### Component Breakdown

```
app/map/page.tsx                          # Server component - layout + metadata
components/maps/
  ShippingMap.tsx                         # Client component - main map container
  RouteArcLayer.tsx                      # deck.gl ArcLayer configuration
  PortScatterLayer.tsx                   # deck.gl ScatterplotLayer configuration
  FTZMarkerLayer.tsx                     # deck.gl layer for FTZ points
  MapFilterPanel.tsx                     # Client component - filter controls
  RouteDetailPanel.tsx                   # Client component - route info panel
  PortDetailCard.tsx                     # Client component - port info card
  MapLegend.tsx                          # Client component - color legend
  MapLoadingState.tsx                    # Loading skeleton
lib/data/
  ports.ts                               # Port data access
  routes.ts                              # Route data access (shared with PRD-04)
  ftz.ts                                 # FTZ data access
```

### Dynamic Import

The map component must be dynamically imported to avoid SSR issues with MapLibre/deck.gl:

```typescript
// app/map/page.tsx
import dynamic from 'next/dynamic';
const ShippingMap = dynamic(() => import('@/components/maps/ShippingMap'), {
  ssr: false,
  loading: () => <MapLoadingState />
});
```

### Layer Composition Pattern

```typescript
// components/maps/ShippingMap.tsx
<DeckGL layers={[
  new ArcLayer({ ...routeLayerProps }),
  new ScatterplotLayer({ ...portLayerProps }),
  new GeoJsonLayer({ ...ftzLayerProps }),
]} />
```

Each layer is configured in its own file and composed in the main map component. Layers are independent and can be toggled on/off via filter state.

### Zustand Store for Map State

```typescript
interface MapState {
  filters: {
    carriers: string[];
    originCountries: string[];
    destinationRegion: 'west' | 'east' | 'gulf' | 'all';
    cargoType: 'general' | 'refrigerated' | 'all';
    routeType: 'direct' | 'transshipment' | 'all';
    showFTZ: boolean;
  };
  selectedRoute: string | null;
  selectedPort: string | null;
  viewState: { longitude: number; latitude: number; zoom: number; };
}
```

---

## 8. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-05-01 | Map renders with dark ocean theme and visible land masses | Visual inspection |
| AC-05-02 | Routes display as curved arcs (great circle), not straight lines | Visual inspection on Pacific routes |
| AC-05-03 | Clicking a route opens detail panel with full info | Click any route arc |
| AC-05-04 | Clicking a port shows port detail card | Click any port marker |
| AC-05-05 | Filters reduce visible routes in real-time | Toggle carrier filter, verify routes hide/show |
| AC-05-06 | FTZ markers appear when zoomed to US level | Zoom in on US, verify FTZ markers visible |
| AC-05-07 | URL param highlighting works | Navigate with `?route=maersk-ae7`, verify highlighted |
| AC-05-08 | Map maintains 60fps during pan/zoom with all routes visible | Chrome DevTools FPS meter |
| AC-05-09 | Map loads in < 3s on desktop | Lighthouse audit |
| AC-05-10 | Fullscreen toggle works | Click fullscreen, verify |
| AC-05-11 | Mobile: touch pan/zoom functional | Test on mobile device or emulator |
| AC-05-12 | Screen reader alternative exists | Verify text-based route list is present |

---

## 9. Dependencies

| Dependency | Type | PRD |
|-----------|------|-----|
| carrier-routes.json | Shared route data | PRD-04 |
| ports.json | Shared port data | PRD-04 |
| ftz-locations.json | FTZ coordinates | PRD-03 (context) |
| Route detail links to route comparison | Cross-navigation | PRD-04 |
| Build-time route computation script | Pre-processing | Infrastructure |

---

## 10. Known Pitfalls (from PITFALLS.md)

| Pitfall | Relevance | Mitigation |
|---------|-----------|------------|
| Pitfall 4: Ignoring transshipment | Route detail must show transshipment ports | Include transshipment ports in route detail panel and as visible waypoints on arcs |
| Pitfall 5: Map performance | 50+ routes with deck.gl | Pre-compute polylines, GPU-side filtering, level-of-detail, `pickable: false` on non-interactive layers |
| Pitfall 10: Map projection distortion | Pacific routes look wrong on Mercator | Use `greatCircle: true` on ArcLayer |
| Phase warning: searoute-js reliability | Low npm downloads | Test with all port pairs before committing. Fallback to Searoutes API or manual polylines |
