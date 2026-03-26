# PRD-06: Shipment Tracking Dashboard

**Status:** Draft
**Priority:** P1
**Route:** `/dashboard`
**Last Updated:** 2026-03-26

---

## 1. Overview & Purpose

The Shipment Tracking Dashboard provides a high-level operational overview of active shipments, key performance indicators, cost metrics, and margin analysis. It demonstrates what the full platform would look like in production, using realistic mock data that represents the founder's cold chain export business and SE Asia import expansion.

This is a demonstration dashboard for the proposal -- it uses mock data, not live integrations. The purpose is to show partners and investors what daily operations would look like with the platform.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|------------|
| US-06-01 | Operations manager | See all active shipments and their statuses at a glance | I know what needs attention |
| US-06-02 | Business owner | See monthly revenue and margin KPIs | I understand business performance |
| US-06-03 | Operations manager | Filter shipments by status, cargo type, or route | I can focus on specific segments |
| US-06-04 | Business owner | See cold chain vs. general cargo split | I can compare business lines |
| US-06-05 | Investor | See a professional, data-rich dashboard | I'm confident in the platform's capabilities |
| US-06-06 | Operations manager | Click into a shipment for details | I can see the full timeline and costs |

---

## 3. Functional Requirements

### 3.1 KPI Bar (Top Section)

Four primary KPI cards displayed horizontally:

| KPI | Example Value | Trend | Notes |
|-----|-------------|-------|-------|
| Active Shipments | 23 | +3 vs last month | In-transit + at-port + in-FTZ |
| Monthly Revenue | $1.24M | +12% MoM | Invoiced revenue |
| Avg Landed Cost / Unit | $0.17 | -2% MoM | Lower is better |
| On-Time Delivery Rate | 94% | +1% vs last month | Delivered within 3 days of ETA |

- Each KPI card shows: metric name, current value, trend arrow (up/down), trend percentage, sparkline chart (last 6 months)
- Built with @tremor/react Card + Metric components

### 3.2 Shipment Table

Primary data view -- sortable, filterable table of all shipments:

| Column | Type | Notes |
|--------|------|-------|
| Shipment ID | String | e.g., "SS-2026-0342" |
| Status | Badge | Booked / In Transit / At Port / In FTZ / Customs / Delivered |
| Origin | Port name + flag | e.g., "Ho Chi Minh City" |
| Destination | Port name + flag | e.g., "Long Beach" |
| Cargo Type | Badge | General / Cold Chain |
| Container | String | e.g., "40ft Reefer" |
| ETD | Date | Estimated departure |
| ETA | Date | Estimated arrival |
| Days Remaining | Number | Calculated from ETA |
| Carrier | String | e.g., "Maersk" |
| Value | Currency | Total shipment value |

- Built with @tanstack/react-table
- Sortable by any column
- Filterable by: Status, Cargo Type, Carrier, Origin Country, Destination Port
- Searchable by Shipment ID
- Pagination: 10/25/50 rows per page
- Row click opens shipment detail (slide-in panel or modal)

### 3.3 Shipment Detail Panel

When a shipment row is clicked, show:

- **Timeline:** Visual timeline showing shipment milestones
  - Booked -> Loaded -> Departed -> At Transshipment -> Departed Transshipment -> Arrived -> Customs Cleared -> Delivered
  - Completed steps in green, current step highlighted, future steps in gray
- **Cost breakdown:** Per-unit costs (same format as PRD-02 output)
- **Documents:** List of associated documents (BOL, commercial invoice, packing list) -- mock data
- **Route:** Mini map showing the route (reuse map component from PRD-05)
- **Alerts:** Any exceptions (delayed, customs hold, etc.)

### 3.4 Map Overview

Mini map widget showing all active shipments as dots on their routes:

- Simplified version of PRD-05 map
- No filters or detailed interactions
- Color-coded by status: In Transit (blue), At Port (orange), Delivered (green)
- "Open Full Map" link to `/map`

### 3.5 Cost & Margin Charts

#### 3.5.1 Monthly Revenue & Cost Chart

- Bar chart (Recharts) showing last 6 months:
  - Revenue (blue bars)
  - Landed cost (red bars)
  - Profit margin overlay (green line)
- X-axis: months, Y-axis: USD

#### 3.5.2 Cost Breakdown Donut

- Donut chart showing aggregate cost composition across all active shipments:
  - Product, Shipping, Duty, Insurance, Brokerage, Inland, Fulfillment
- Same chart type as PRD-02 but aggregated

#### 3.5.3 Cold Chain vs General Cargo

- Side-by-side comparison:
  - Revenue split (pie chart or stacked bar)
  - Margin comparison (bar chart)
  - Shipment volume (bar chart)
- Demonstrates the cold chain dominance (96-97%) and import expansion

### 3.6 Recent Activity Feed

Chronological list of recent events:

```
[3h ago] Shipment SS-2026-0342 departed Ho Chi Minh City
[8h ago] Shipment SS-2026-0338 cleared customs at Long Beach
[1d ago] Shipment SS-2026-0335 arrived at Singapore (transshipment)
[2d ago] New booking: SS-2026-0345 - 40ft Reefer, Bangkok to Savannah
```

- Last 10 events
- Each event has a timestamp, shipment ID (clickable), and description
- Auto-generated from mock shipment data and status history

---

## 4. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Page load | < 2s | Server components for static structure, client components for interactive table/charts |
| Table rendering | < 500ms for 100 rows | @tanstack/react-table with virtualization if needed |
| Chart rendering | < 300ms per chart | Recharts with animation |
| Responsive | 375px - 2560px | Dashboard grid reflows, table scrolls horizontally |
| Accessibility | WCAG 2.1 AA | Table navigable by keyboard, charts have aria labels |

---

## 5. Data Requirements

### Mock Shipment Data

Generate 30-50 realistic mock shipments in `/data/mock-shipments.json`:

```json
{
  "id": "SS-2026-0342",
  "status": "in-transit",
  "origin": { "code": "VNSGN", "name": "Ho Chi Minh City" },
  "destination": { "code": "USLGB", "name": "Long Beach" },
  "cargoType": "cold-chain",
  "containerType": "40ft-reefer",
  "carrier": "Maersk",
  "service": "AE7",
  "etd": "2026-03-15",
  "eta": "2026-04-12",
  "currentPosition": { "lat": 5.2, "lng": 103.8 },
  "value": 45000,
  "units": 500000,
  "unitCost": 0.09,
  "route": "maersk-ae7-vnsgn-uslgb",
  "milestones": [
    { "event": "booked", "date": "2026-03-10", "completed": true },
    { "event": "loaded", "date": "2026-03-14", "completed": true },
    { "event": "departed", "date": "2026-03-15", "completed": true },
    { "event": "transshipment-arrived", "date": "2026-03-22", "completed": false },
    { "event": "transshipment-departed", "date": null, "completed": false },
    { "event": "arrived", "date": null, "completed": false },
    { "event": "customs-cleared", "date": null, "completed": false },
    { "event": "delivered", "date": null, "completed": false }
  ]
}
```

### Data Distribution

- Status distribution: 5 booked, 10 in-transit, 3 at-port, 2 in-FTZ, 3 customs, 7 delivered
- Cargo type: 70% cold chain (exports), 30% general cargo (imports from SE Asia)
- Carriers: Maersk (40%), CMA CGM (25%), MSC (20%), Others (15%)
- Routes: Primarily US exports (cold chain) and SE Asia -> US imports

### Mock KPI Data

6 months of historical data for charts, showing growth trend aligned with the business narrative (cold chain dominant, import line growing).

---

## 6. UI/UX Specifications

- **Layout:** Dashboard grid with responsive breakpoints
  - Desktop: KPI bar full-width, then 2-column (table left/large, charts right), map below
  - Tablet: KPI bar wraps to 2x2, rest stacks
  - Mobile: Everything stacks vertically
- **KPI cards:** White/light cards on dark background, large numbers, colored trend indicators
- **Shipment table:** Alternating row colors, status badges color-coded (blue=transit, green=delivered, orange=port, red=hold)
- **Charts:** Consistent color palette across all charts (tremor defaults work well with Tailwind)
- **Map widget:** Fixed height (300px), rounded corners, subtle border
- **Activity feed:** Scrollable, time-relative labels ("3h ago"), compact layout
- **Overloading prevention (Pitfall 11):** Dashboard shows overview only. Detailed tools are on separate pages.

---

## 7. Technical Implementation Notes

### Component Breakdown

```
app/dashboard/page.tsx                     # Server component
components/dashboard/
  KPIBar.tsx                              # Client component (@tremor/react)
  ShipmentTable.tsx                       # Client component (@tanstack/react-table)
  ShipmentDetailPanel.tsx                 # Client component
  ShipmentTimeline.tsx                    # Client component
  MiniMapWidget.tsx                       # Client component (simplified map)
  RevenueChart.tsx                        # Client component (Recharts)
  CostBreakdownDonut.tsx                  # Client component (Recharts)
  ColdChainComparison.tsx                 # Client component (Recharts)
  ActivityFeed.tsx                        # Server component with date-fns
lib/data/
  shipments.ts                            # Load and query mock-shipments.json
  dashboard-kpis.ts                       # Aggregate KPIs from shipment data
```

### Server vs Client Split

- `page.tsx`: Server component that loads mock data and passes as props
- KPI calculations: Done server-side (aggregate from mock data)
- Table and charts: Client components for interactivity
- Activity feed: Server component (no interactivity needed)
- Map widget: Client component (deck.gl requires browser)

---

## 8. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-06-01 | All 4 KPI cards display with correct values, trends, and sparklines | Visual inspection + cross-reference with mock data |
| AC-06-02 | Shipment table shows all mock shipments with correct data | Count rows, verify data |
| AC-06-03 | Table is sortable by every column | Click each column header |
| AC-06-04 | Table filters work (status, cargo type, carrier) | Apply each filter, verify results |
| AC-06-05 | Clicking a shipment row opens detail panel | Click row, verify panel opens |
| AC-06-06 | Shipment timeline shows correct milestone states | Verify completed/pending states match data |
| AC-06-07 | Mini map shows dots for active shipments | Visual inspection |
| AC-06-08 | Revenue chart shows 6 months of data | Verify chart renders with correct month labels |
| AC-06-09 | Cold chain vs general cargo charts show 70/30 split | Verify proportions |
| AC-06-10 | Activity feed shows recent events in chronological order | Verify timestamps |
| AC-06-11 | Dashboard is not overloaded (Pitfall 11) | No calculator tools embedded on this page |
| AC-06-12 | Responsive layout works at 375px, 768px, 1440px | DevTools responsive mode |

---

## 9. Dependencies

| Dependency | Type | PRD |
|-----------|------|-----|
| carrier-routes.json | Route data for shipments | PRD-04 |
| ports.json | Port names for display | PRD-04, PRD-05 |
| Mini map component | Simplified version of main map | PRD-05 |
| Unit economics output format | Cost breakdown in shipment detail | PRD-02 |

---

## 10. Known Pitfalls (from PITFALLS.md)

| Pitfall | Relevance | Mitigation |
|---------|-----------|------------|
| Pitfall 11: Overloading the dashboard | Keep dashboard as overview only | No calculators on this page. Links to tool pages for deep analysis. |
| Pitfall 12: Missing units | KPI values, table columns, charts | Every value labeled: $, %, days, units, containers |
| Pitfall 4: Transshipment | Shipment detail should show full route | Include transshipment ports in shipment timeline |
