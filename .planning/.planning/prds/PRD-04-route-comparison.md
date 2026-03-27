# PRD-04: Route Comparison Tool

**Status:** Draft
**Priority:** P1
**Route:** `/tools/route-comparison`
**Last Updated:** 2026-03-26

---

## 1. Overview & Purpose

The Route Comparison Tool allows users to compare carrier and route options for shipping containers between SE Asian origin ports and US destination ports. It presents 3 route options per query with pricing tiers, transit times, transshipment points, and backhaul availability indicators. This mirrors the founder's current manual workflow of researching vessels and presenting 3 options to customers.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|------------|
| US-04-01 | Freight broker | Select origin and destination ports and see 3 route options | I can present options to my customer |
| US-04-02 | Freight broker | See transshipment points for each route | I can explain the full routing to my customer (Pitfall 4) |
| US-04-03 | Freight broker | See backhaul indicators | I can identify cost-saving opportunities |
| US-04-04 | Importer | Compare transit times vs. costs | I can choose speed or savings |
| US-04-05 | Importer | Filter by container type (dry, reefer) | I see pricing relevant to my cargo |
| US-04-06 | Importer | See direct vs. transshipment routes | I can evaluate risk and reliability |

---

## 3. Functional Requirements

### 3.1 Input Panel

| Input | Type | Default | Notes |
|-------|------|---------|-------|
| Origin Port | Searchable select | Ho Chi Minh City (VNSGN) | SE Asia ports from ports.json |
| Destination Port | Searchable select | Long Beach (USLGB) | US ports from ports.json |
| Cargo Type | Select | General Cargo | General Cargo / Refrigerated / Hazardous |
| Container Type | Select | 40ft Standard | 20ft / 40ft / 40ft HC / 40ft Reefer |

- Port selectors: filterable dropdown with UN/LOCODE, city name, and country
- Origin ports limited to SE Asia region: Vietnam, Thailand, Indonesia, Cambodia, China (southern ports)
- Destination ports limited to major US ports: Long Beach, Los Angeles, Oakland, Seattle/Tacoma, Savannah, Newark, Houston, Charleston, Miami

### 3.2 Route Results

Display 3 route options as cards (sorted by cost, fastest, best-value):

#### Route Card Layout

```
[ECONOMY]                                    [BACKHAUL AVAILABLE]
Maersk AE7 Service
Ho Chi Minh City -> Singapore -> Long Beach
----------------------------------------------
Transit Time:     28 days
Estimated Cost:   $3,200 - $3,800
Transshipment:    Singapore (SGSIN) - 2 day dwell
Container:        40ft Standard
Vessel Type:      13,000 TEU
Reliability:      92% on-time
----------------------------------------------
[View on Map]  [Use in Calculator]
```

Each card includes:
- **Tier label:** Economy / Standard / Express (or similar tiering)
- **Carrier and service name**
- **Full route string** with all transshipment ports listed (Pitfall 4)
- **Transit time** in days (including transshipment dwell time)
- **Cost estimate** as a range (not a single number -- rates vary)
- **Transshipment details:** Port name, UN/LOCODE, typical dwell time
- **Backhaul indicator:** Badge if return-leg pricing advantages exist on this route
- **Container type compatibility**
- **Vessel type/size**
- **Reliability score** (on-time percentage from historical data)
- **Action buttons:**
  - "View on Map" -> navigates to PRD-05 map with this route highlighted
  - "Use in Calculator" -> feeds shipping cost into PRD-02 unit economics

### 3.3 Route Comparison Table

Below the cards, a detailed comparison table:

| Attribute | Economy | Standard | Express |
|-----------|---------|----------|---------|
| Carrier | Maersk | CMA CGM | Evergreen |
| Service | AE7 | FAL1 | AUE |
| Transit Time | 28 days | 24 days | 18 days |
| Transshipments | 1 (Singapore) | 1 (Busan) | 0 (Direct) |
| Cost Range | $3,200-$3,800 | $3,800-$4,500 | $5,000-$6,200 |
| Backhaul | Yes | No | No |
| Frequency | Weekly | Weekly | Bi-weekly |
| Vessel Size | 13,000 TEU | 15,000 TEU | 8,000 TEU |

- Table sortable by any column
- Highlight the "recommended" option based on best value (lowest cost per transit day)

### 3.4 Hub-and-Spoke Diagram

- Visual diagram showing the transshipment model
- Central hub ports (Singapore, Busan, Panama, Cartagena) shown as larger nodes
- Origin and destination ports as smaller nodes
- Route lines connecting through hubs
- Analogous to airline route maps
- Rendered as an SVG or mini deck.gl visualization

### 3.5 Backhaul Explanation

- Info section explaining backhaul pricing:
  - "Backhaul routes travel opposite to peak demand direction (e.g., Asia to US is high demand; US to Asia is backhaul)"
  - "Backhaul rates can be 30-50% lower than head-haul rates"
  - "Availability varies by season and trade lane"
- Visual indicator on routes with backhaul advantage

### 3.6 Cold Chain Overlay

- If cargo type is "Refrigerated":
  - Show reefer surcharge per route (typically $2,000-$5,000 premium)
  - Show which routes support reefer containers
  - Temperature control capabilities noted
  - Reefer plug availability at transshipment ports

---

## 4. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Query response | < 200ms | All data from local JSON, no network calls |
| Accessibility | WCAG 2.1 AA | Route cards keyboard-navigable, table screen-reader friendly |
| Responsive | 375px - 2560px | Cards stack on mobile, table scrolls horizontally |

---

## 5. Data Requirements

### carrier-routes.json Structure

```json
{
  "routes": [
    {
      "id": "maersk-ae7-vnsgn-uslgb",
      "carrier": "Maersk",
      "service": "AE7",
      "origin": { "code": "VNSGN", "name": "Ho Chi Minh City", "country": "VN" },
      "destination": { "code": "USLGB", "name": "Long Beach", "country": "US" },
      "transshipments": [
        { "code": "SGSIN", "name": "Singapore", "dwellDays": 2 }
      ],
      "transitDays": 28,
      "costRange": { "min": 3200, "max": 3800 },
      "containerTypes": ["20ft", "40ft", "40ft-hc", "40ft-reefer"],
      "reeferSurcharge": 3500,
      "frequency": "weekly",
      "vesselSizeTEU": 13000,
      "onTimePercent": 92,
      "backhaul": true,
      "cargoTypes": ["general", "refrigerated"]
    }
  ]
}
```

### Required Routes (Minimum Dataset)

Cover these port pairs with 3+ routes each:
- Ho Chi Minh City (VNSGN) -> Long Beach (USLGB)
- Ho Chi Minh City (VNSGN) -> Newark (USNWK)
- Bangkok (THBKK/Laem Chabang THLCH) -> Long Beach (USLGB)
- Jakarta (IDJKT/Tanjung Priok IDTPP) -> Long Beach (USLGB)
- Sihanoukville (KHSHV) -> Long Beach (USLGB)
- Shanghai (CNSHA) -> Long Beach (USLGB)
- Ho Chi Minh City (VNSGN) -> Savannah (USSAV)

### Major Transshipment Hubs

Include these as hub ports:
- Singapore (SGSIN)
- Busan (KRPUS)
- Port Klang (MYPKG)
- Colombo (LKCMB)
- Panama (PACBC - Balboa / PAMIT - Manzanillo)
- Cartagena (COCTG)
- Tanjung Pelepas (MYTPP)

---

## 6. UI/UX Specifications

- **Layout:** Input bar at top (horizontal on desktop), route cards below in a 3-column grid (desktop) or stacked (mobile)
- **Card design:** Each card has a colored top border indicating tier (green=economy, blue=standard, orange=express)
- **Transshipment emphasis:** Transshipment ports shown with a distinct icon and dwell time inline (Pitfall 4)
- **Backhaul badge:** Green pill badge with "Backhaul Available" text
- **Direct route badge:** Gold pill badge with "Direct - No Transshipment"
- **Cost range:** Display as "$3,200 - $3,800" not a single number (rates fluctuate)
- **Sort controls:** Above cards -- sort by: Cheapest, Fastest, Best Value, Most Reliable

---

## 7. Technical Implementation Notes

### Component Breakdown

```
app/tools/route-comparison/page.tsx       # Server component
components/routes/
  RouteComparison.tsx                     # Client component - main
  RouteInputBar.tsx                       # Client component - port/cargo selectors
  RouteCard.tsx                           # Client component - individual route card
  RouteComparisonTable.tsx                # Client component - detailed table
  HubSpokeDiagram.tsx                    # Client component - transshipment visual
  BackhaulExplainer.tsx                   # Server component - info section
lib/calculators/
  route-comparison.ts                     # Route filtering, sorting, scoring
lib/data/
  routes.ts                              # Load and query carrier-routes.json
  ports.ts                               # Load and query ports.json
```

### Route Scoring Algorithm

```typescript
function scoreRoute(route: Route, preferences: { prioritize: 'cost' | 'speed' | 'reliability' }): number {
  // Normalized score 0-100
  // Cost score: inverse of cost (cheaper = higher score)
  // Speed score: inverse of transit time
  // Reliability score: direct from onTimePercent
  // Backhaul bonus: +10 if backhaul available
  // Direct route bonus: +5 if no transshipments
}
```

---

## 8. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-04-01 | Selecting origin + destination returns 3 route options | Select VNSGN -> USLGB, verify 3 cards |
| AC-04-02 | Every route card shows transshipment ports (Pitfall 4) | Verify no route shows only origin/destination |
| AC-04-03 | Backhaul indicator appears on qualifying routes | Check routes with backhaul=true |
| AC-04-04 | Reefer cargo type shows surcharge and reefer compatibility | Select Refrigerated, verify surcharge displayed |
| AC-04-05 | "View on Map" navigates to map page with route highlighted | Click button, verify map shows route |
| AC-04-06 | "Use in Calculator" feeds cost into unit economics | Click button, verify calculator pre-populates |
| AC-04-07 | Comparison table matches card data | Cross-reference all values |
| AC-04-08 | Port selectors are searchable by name and code | Type "Singapore", verify SGSIN appears |
| AC-04-09 | Mobile layout stacks cards vertically | View at 375px |

---

## 9. Dependencies

| Dependency | Type | PRD |
|-----------|------|-----|
| ports.json | Shared data | PRD-05 (map), PRD-04 |
| carrier-routes.json | Primary data source | PRD-04 (owner), PRD-05 (consumer) |
| Unit economics calculator | Feeds shipping cost | PRD-02 |
| Shipping route map | "View on Map" navigation | PRD-05 |

---

## 10. Known Pitfalls (from PITFALLS.md)

| Pitfall | Relevance | Mitigation |
|---------|-----------|------------|
| Pitfall 4: Ignoring transshipment | CRITICAL for this page | Every route MUST show transshipment ports. No route shows just origin->destination. |
| Pitfall 12: Missing units | Transit time, costs, vessel size | Label everything: "28 days", "$3,200-$3,800 USD", "13,000 TEU" |
| Phase warning: Carrier data accuracy | Route data is researched, not live | Note data source date. Cross-reference against carrier schedule pages. |
