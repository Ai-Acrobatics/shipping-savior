# PRD: Route Comparison Tool

## Overview
- **Purpose:** Compare shipping routes between origin and destination ports with carrier options, transit times, costs, and transshipment details. Helps importers and freight brokers select optimal routes based on speed, cost, reliability, and cargo requirements.
- **User persona:** Freight brokers presenting route options to clients (typically 3 options), importers evaluating trade lanes for new sourcing relationships, logistics managers optimizing existing routes.
- **Entry points:** Main navigation "Routes" link, "Compare routes" action from Shipment creation, dashboard quick action, direct URL `/tools/route-comparison`.

## Page Layout

### Desktop (1280px+)
- **Top section:** Origin/destination port pickers (two large autocomplete inputs with port code + city display) flanking a directional arrow. Cargo type selector and filter buttons below.
- **Map section (40% height):** Interactive map showing the selected routes as colored arcs. Transshipment ports marked. Route paths follow sea lanes (via searoute-js).
- **Results section:** 3 route option cards in a row. Each card shows: carrier logo, transit time, estimated cost, transshipment points, departure dates, reliability score, backhaul indicator. Cards are comparable and selectable.
- **Below cards:** Detailed comparison table with all route attributes side by side.
- **Filter bar:** Direct only, Fastest, Cheapest, Most Reliable toggles.

### Tablet (768px-1279px)
- Port pickers stacked. Map reduced to 30% height. Route cards in a scrollable horizontal row. Comparison table below.

### Mobile (< 768px)
- Port pickers full-width stacked. Map hidden (show "View on map" expandable). Route cards full-width stacked vertically. Filters as bottom sheet.

## Features & Functionality

### Feature: Port Autocomplete Search
- **Description:** Fast search across 3,700+ world ports by port name, UN/LOCODE, city, or country. Shows recently used ports at top.
- **User interaction flow:**
  1. User types in origin port field (minimum 2 characters)
  2. Dropdown shows matching ports: port name, UN/LOCODE, country flag, port type icon (sea/river/inland)
  3. Recent ports shown first when field is focused but empty
  4. User selects port — field displays "[Port Name] ([LOCODE])"
  5. Repeat for destination port
  6. Swap button between origin and destination for return-leg analysis
- **Edge cases:**
  - Ambiguous port name (e.g., "Long Beach" exists in multiple countries): show country flags and full location
  - Port not in database: "Port not found. Try searching by UN/LOCODE or city name."
  - Same origin and destination: "Origin and destination cannot be the same port"
- **Validation rules:** Both origin and destination required before route search. Must be valid ports from database.

### Feature: Cargo Type Selector
- **Description:** Select cargo type to filter routes by equipment availability and show cargo-specific pricing.
- **Options:**
  - General (dry container) — default
  - Cold Chain / Reefer (temperature-controlled)
  - Hazardous (DG cargo)
  - Oversized / OOG (out-of-gauge)
- **Behavior:** Reefer selection filters to routes with reefer availability and shows reefer premium pricing. Hazardous filters to carriers certified for DG. Oversized shows flat-rack/open-top options.
- **Edge cases:** No routes available for selected cargo type: "No [cargo type] routes found between these ports. Try General cargo or contact us for special arrangements."

### Feature: Route Option Cards
- **Description:** Display 3 recommended route options as comparable cards (matching the founder's current workflow of presenting 3 options to clients).
- **Card contents:**
  - Carrier name + logo
  - Service name (e.g., "AE7 — Asia-Europe Express")
  - Transit time in days (port-to-port)
  - Estimated cost per container (20ft and 40ft)
  - Transshipment points (port names, number of transshipments)
  - Next departure date(s)
  - Reliability score (% on-time, based on historical data)
  - Backhaul indicator: green badge "BACKHAUL AVAILABLE" when return-leg pricing advantage detected
  - Route type: "Direct" or "1 Transshipment" or "2 Transshipments"
- **User interaction flow:**
  1. After port selection, system auto-searches available routes
  2. Top 3 routes displayed as cards (sorted by recommendation score: blend of cost, time, reliability)
  3. User can click card to expand detailed view
  4. "Show more routes" button loads additional options (up to 10)
  5. "Select route" action on card saves route for shipment creation
- **Edge cases:**
  - Fewer than 3 routes available: show available routes with note "Limited service on this route"
  - No routes found: "No direct or transshipment routes found. This port pair may require multi-leg booking."

### Feature: Hub-and-Spoke Transshipment Visualization
- **Description:** Map visualization showing how transshipment routes work, with hub ports (Panama, Singapore, Busan, Colombo, Cartagena) clearly marked.
- **Details:**
  - Direct routes: single arc from origin to destination
  - Transshipment routes: segmented arcs through hub ports with markers at each stop
  - Hub port markers larger than regular port markers, with throughput data on hover
  - Animated dots showing direction of travel (optional, performant with deck.gl TripsLayer)
  - Route color coding: green (direct/fast), yellow (1 transshipment), orange (2+ transshipments)
- **Edge cases:** Great circle routes rendered correctly using `greatCircle: true` on deck.gl ArcLayer. Routes crossing antimeridian (Pacific routes) handled without visual artifacts.

### Feature: Route Filters
- **Description:** Filter displayed routes by attributes.
- **Filters:**
  - **Direct Only:** Remove all transshipment routes
  - **Fastest:** Sort by transit time ascending
  - **Cheapest:** Sort by estimated cost ascending
  - **Most Reliable:** Sort by on-time percentage descending
  - **Carrier:** Filter by specific carrier(s)
  - **Max Transshipments:** 0, 1, 2+
  - **Departure Window:** Date range for next departure
- **Interaction:** Toggle filters; results update in real-time. Active filter count shown as badge.

### Feature: Carrier Schedule Integration
- **Description:** Show upcoming departure dates from carrier APIs (Maersk, CMA CGM, Hapag-Lloyd, MSC) or static schedule data.
- **Details:**
  - Next 3 departure dates shown per route
  - "View full schedule" expands to show 4-week calendar
  - If carrier API connected (from onboarding): real-time data with "Live" badge
  - If no carrier API: static schedule data with "Estimated" badge and data date
- **Edge cases:** Carrier API unavailable: fall back to static schedule data with note. Schedule data older than 30 days: warning badge.

## Usability Requirements
- **Accessibility (WCAG 2.1 AA):** Port autocomplete uses combobox ARIA pattern. Route cards are focusable with descriptive `aria-label` (e.g., "Maersk AE7 route, 18 days, $3,500"). Map has text-based route list alternative. Filters have `aria-pressed` state.
- **Keyboard navigation:** Tab from origin to destination to cargo type to filters to route cards. Arrow keys navigate cards. Enter selects/expands a card. Escape closes expanded card.
- **Loading states:** Route search: skeleton cards with animated pulse. Map: loading overlay with spinner. Port search: inline spinner in dropdown.
- **Error states:** Route search failure: "Unable to search routes. Try again." Carrier API error: degrade to static data with note. Map load failure: show route list without map.
- **Empty states:** Before port selection: map centered on world view with "Select origin and destination ports to compare routes" overlay. Major trade lanes shown as faded arcs for visual interest.
- **Performance targets:** LCP < 2.5s. Port autocomplete results < 100ms. Route search < 2s. Map renders < 1s with up to 10 routes. 60fps map interaction.

## API Endpoints

### GET /api/ports/search
- **Description:** Search ports by name, UN/LOCODE, city, or country.
- **Authentication required:** Yes
- **Request parameters:**
  - `q` (string, required): search query (min 2 chars)
  - `type` (string, optional): "sea" | "river" | "inland" | "all" (default: "sea")
  - `limit` (number, optional, default 10, max 50)
- **Response (200):**
  ```json
  {
    "results": [
      {
        "locode": "VNSGN",
        "name": "Ho Chi Minh City (Saigon)",
        "city": "Ho Chi Minh City",
        "country": "VN",
        "countryName": "Vietnam",
        "type": "sea",
        "latitude": 10.7769,
        "longitude": 106.7009,
        "throughputTeu": 8500000
      }
    ]
  }
  ```
- **Rate limiting:** 60 requests per minute.

### GET /api/routes/compare
- **Description:** Find and compare shipping routes between two ports.
- **Authentication required:** Yes
- **Request parameters:**
  - `origin` (string, required): origin port LOCODE (e.g., "VNSGN")
  - `destination` (string, required): destination port LOCODE (e.g., "USLGB")
  - `cargo` (string, optional): "general" | "reefer" | "hazardous" | "oversized" (default: "general")
  - `direct` (boolean, optional): filter to direct routes only
  - `carrier` (string, optional): filter by carrier code
  - `departureFrom` (date, optional): earliest departure date
  - `departureTo` (date, optional): latest departure date
  - `sort` (string, optional): "recommended" | "fastest" | "cheapest" | "reliable" (default: "recommended")
  - `limit` (number, optional, default 3, max 10)
- **Response (200):**
  ```json
  {
    "origin": { "locode": "VNSGN", "name": "Ho Chi Minh City" },
    "destination": { "locode": "USLGB", "name": "Long Beach" },
    "cargo": "general",
    "totalRoutes": 8,
    "routes": [
      {
        "id": "route-uuid",
        "carrier": {
          "code": "MAEU",
          "name": "Maersk",
          "logo": "/images/carriers/maersk.svg"
        },
        "serviceName": "TP6 — Transpacific 6",
        "transitDays": 18,
        "routeType": "direct",
        "transshipments": [],
        "estimatedCost": {
          "20ft": 2800,
          "40ft": 3500,
          "40ftHC": 3700,
          "reefer40ft": 5200
        },
        "departures": [
          { "date": "2026-04-01", "vessel": "Maersk Singapore", "voyageNumber": "123E" },
          { "date": "2026-04-08", "vessel": "Maersk Singapore", "voyageNumber": "124E" }
        ],
        "reliability": {
          "onTimePercent": 87,
          "avgDelayDays": 1.2,
          "dataPoints": 52
        },
        "backhaul": {
          "available": true,
          "discount": "15-20% below headhaul rates"
        },
        "routeGeometry": {
          "type": "LineString",
          "coordinates": [[106.70, 10.77], [120.0, 15.0], [-118.27, 33.74]]
        },
        "recommendationScore": 92,
        "dataSource": "carrier_api",
        "lastUpdated": "2026-03-25"
      },
      {
        "id": "route-uuid-2",
        "carrier": { "code": "CMDU", "name": "CMA CGM", "logo": "..." },
        "serviceName": "Pearl River Express",
        "transitDays": 22,
        "routeType": "1_transshipment",
        "transshipments": [
          { "port": { "locode": "SGSIN", "name": "Singapore" }, "dwellDays": 2 }
        ],
        "estimatedCost": { "20ft": 2400, "40ft": 3000, "40ftHC": 3200 },
        "departures": [...],
        "reliability": { "onTimePercent": 82, "avgDelayDays": 2.1 },
        "backhaul": { "available": false },
        "routeGeometry": { "type": "LineString", "coordinates": [...] },
        "recommendationScore": 78
      }
    ],
    "metadata": {
      "searchedAt": "2026-03-26T12:00:00Z",
      "dataDate": "2026-03-25",
      "disclaimer": "Rates are estimates based on historical data. Actual rates may vary."
    }
  }
  ```
- **Error responses:**
  - 400: `{ "error": "validation_error", "message": "Both origin and destination are required" }`
  - 404: `{ "error": "no_routes", "message": "No routes found between these ports" }`
- **Rate limiting:** 30 requests per minute.

## Data Requirements
- **Database tables read/written:**
  - `ports` (read) — locode, name, city, country, type, lat, lng, throughputTeu
  - `carriers` (read) — code, name, logo, apiConnected
  - `carrier_routes` (read) — carrierId, origin, destination, serviceName, transitDays, routeType, transshipments (JSONB), estimatedCost (JSONB), reliability (JSONB), routeGeometry (JSONB)
  - `carrier_schedules` (read) — carrierRouteId, departureDate, vessel, voyageNumber
  - `search_history` (write) — log route searches for analytics
- **External data sources:**
  - Carrier schedule APIs (Maersk, CMA CGM, Hapag-Lloyd, MSC) — DCSA standard format
  - UN/LOCODE port database (download from UNECE)
  - searoute-js for route geometry generation
  - Static carrier schedule data (scraped/researched) as fallback
- **Caching strategy:** Port search index cached at CDN (updated monthly). Route results cached 24 hours per port pair + cargo type. Carrier schedules cached 6 hours (if from live API). Map tiles cached at CDN.

## Component Breakdown
- **Server Components:** `RouteComparisonPage` (layout), server-side route prefetch for common port pairs.
- **Client Components:** `PortAutocomplete` (combobox with search), `CargoTypeSelector`, `RouteMap` (deck.gl ArcLayer + ScatterplotLayer), `RouteCard`, `RouteDetailPanel`, `RouteFilterBar`, `ComparisonTable`, `ScheduleCalendar`, `BackhaulBadge`, `SwapPortsButton`.
- **Shared components used:** `Input`, `Select`, `Button`, `Card`, `Badge`, `Tooltip`, `Skeleton`, `Table`, `Map`.
- **New components needed:** `PortAutocomplete`, `RouteCard`, `RouteMap`, `RouteFilterBar`, `ComparisonTable`, `ScheduleCalendar`, `BackhaulBadge`, `CargoTypeSelector`.

## Acceptance Criteria
- [ ] Port autocomplete searches 3,700+ ports with results in < 100ms
- [ ] Port search matches on name, UN/LOCODE, city, and country
- [ ] Route comparison returns top 3 recommendations within 2 seconds
- [ ] Each route card shows carrier, transit time, cost, transshipments, reliability, and departures
- [ ] Map displays routes with sea-lane-accurate geometry (not straight lines)
- [ ] Transshipment ports are clearly marked on map and in route cards
- [ ] Backhaul availability indicator appears when applicable
- [ ] Cargo type filter (reefer, hazardous, oversized) correctly filters routes
- [ ] Direct-only filter removes all transshipment routes
- [ ] Sort options (fastest, cheapest, most reliable) reorder cards correctly
- [ ] "View more routes" loads additional options up to 10
- [ ] Great circle arcs render correctly for Pacific routes
- [ ] Mobile view hides map and shows cards vertically
- [ ] Carrier schedule shows next 3 departure dates per route
- [ ] Data source ("Live" vs "Estimated") clearly labeled per route

## Dependencies
- **This page depends on:** Authentication (PRD-APP-01). Port database (UN/LOCODE data pipeline). Carrier route data (static + API). searoute-js for geometry. Map tile provider (MapLibre + free tiles).
- **Pages that depend on this:** Shipment creation flows use selected routes. Landed Cost Calculator (PRD-APP-04) references shipping costs from route data. Analytics (PRD-APP-11) tracks route performance. Executive Dashboard (PRD-APP-08) shows top routes by volume.
