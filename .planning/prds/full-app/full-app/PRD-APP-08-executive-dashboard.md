# PRD: Executive Dashboard

## Overview
- **Purpose:** Provide a high-level operational overview of the user's import/export business with key performance indicators, active shipments, cost trends, and quick actions. This is the first page users see after login and should answer "What's happening right now?" at a glance.
- **User persona:** Business owners, logistics managers, and operations directors who need a daily operational snapshot without diving into individual tools.
- **Entry points:** Post-login redirect (default landing page), main navigation "Dashboard" link, logo click from any page, direct URL `/dashboard`.

## Page Layout

### Desktop (1280px+)
- **Row 1 (KPI Cards):** 4 equal-width cards spanning full width: Active Shipments, Monthly Revenue, Avg Landed Cost, On-Time Rate. Each card: metric value (large, bold), trend arrow (up/down vs. previous period), sparkline chart, subtitle with comparison.
- **Row 2 (50/50 split):**
  - Left: Mini-map widget showing vessel/shipment positions with status color coding
  - Right: Revenue/cost trend chart (area chart, 30/60/90 day toggle)
- **Row 3 (60/40 split):**
  - Left: Top Routes by Volume (horizontal bar chart, top 5 routes)
  - Right: Activity Feed (scrollable list of latest events)
- **Row 4 (Quick Actions):** Action button bar: New Shipment, Run Calculator, Check Compliance, View Reports.

### Tablet (768px-1279px)
- KPI cards in 2x2 grid. Map and trend chart stacked. Routes and activity stacked. Quick actions as floating bottom bar.

### Mobile (< 768px)
- KPI cards as horizontal scrollable row. Map collapsed (tap to expand). Trend chart simplified. Activity feed as primary content. Quick actions in bottom nav.

## Features & Functionality

### Feature: KPI Cards
- **Description:** Four primary metrics that summarize business health.
- **Cards:**
  1. **Active Shipments:** Count of shipments in transit + at port + in customs. Trend: vs. same period last month. Tap: navigate to Shipment List filtered to active.
  2. **Monthly Revenue:** Total declared value of shipments this month (USD). Trend: vs. last month. Tap: navigate to Analytics.
  3. **Avg Landed Cost:** Average per-unit landed cost across all calculations this month. Trend: vs. last month. Tap: navigate to Landed Cost Calculator.
  4. **On-Time Rate:** Percentage of shipments delivered within expected transit window. Trend: vs. last month. Tap: navigate to Analytics carrier performance.
- **Edge cases:**
  - New user with no data: show "0" with "Start tracking shipments to see metrics" message
  - Data loading: skeleton cards with pulsing animation
  - Negative trend: red downward arrow for costs going up (bad) or on-time going down
  - Positive trend: green upward arrow

### Feature: Mini-Map Widget
- **Description:** Small interactive map showing current positions of tracked shipments.
- **Details:**
  - Map centered to fit all active shipment positions
  - Markers color-coded: green (on schedule), yellow (slight delay), red (significant delay), blue (at port/customs)
  - Hover marker: tooltip with shipment reference, carrier, ETA
  - Click marker: navigate to Shipment Detail
  - Map controls: zoom only (no pan to keep it compact). "View full map" link.
- **Edge cases:** No active shipments: show world map with "No active shipments" overlay. One shipment: center on that position with appropriate zoom.

### Feature: Revenue/Cost Trend Chart
- **Description:** Dual-axis area chart showing revenue and cost trends over time.
- **Details:**
  - X-axis: time (daily granularity for 30d, weekly for 60/90d)
  - Left Y-axis: revenue (green area)
  - Right Y-axis: total costs (blue area, stacked by category: freight, duty, fees)
  - Toggle buttons: 30 days / 60 days / 90 days
  - Hover: tooltip showing exact values for that date
  - Net margin line overlay (dashed)
- **Edge cases:** Insufficient data for selected range: show available data with note "Showing [X] days of available data." No data: show empty chart with "Track shipments to see trends" message.

### Feature: Top Routes by Volume
- **Description:** Horizontal bar chart showing the user's most-used shipping routes by container count.
- **Details:**
  - Top 5 routes: labeled as "Origin -> Destination" (e.g., "VNSGN -> USLGB")
  - Bar length proportional to container count
  - Each bar shows: container count, total value, avg transit time
  - Click bar: navigate to Route Comparison pre-filled with that port pair
- **Edge cases:** Fewer than 5 routes: show what's available. No routes: show "No route data yet."

### Feature: Activity Feed
- **Description:** Chronological list of recent events across all shipments and platform activity.
- **Event types:**
  - Shipment departed / arrived / in customs / delivered
  - Compliance alert triggered
  - Calculation saved
  - Tariff change notification
  - Team member action
- **Details:**
  - Each event: icon (by type), description, timestamp (relative: "2h ago"), link to relevant page
  - Auto-updates via polling (every 60s) or WebSocket (Phase 2)
  - "View all activity" link to full activity log
  - Maximum 20 items displayed, scrollable
- **Edge cases:** No activity: "No recent activity. Create your first shipment to get started."

### Feature: Quick Actions
- **Description:** One-click access to the most common platform actions.
- **Actions:**
  - **New Shipment:** Navigate to shipment creation form
  - **Run Calculator:** Navigate to Landed Cost Calculator
  - **Check Compliance:** Navigate to Compliance Center
  - **View Reports:** Navigate to Analytics Dashboard
- **Behavior:** Desktop: horizontal button bar. Mobile: 2x2 grid or bottom sheet.

## Usability Requirements
- **Accessibility (WCAG 2.1 AA):** KPI cards have semantic headings. Charts have `aria-label` with summary text. Map has text-based shipment list alternative. Activity feed uses semantic list markup. Quick action buttons have descriptive labels.
- **Keyboard navigation:** Tab through KPI cards (focusable, Enter navigates). Tab to map (Enter opens full map). Tab through chart period toggles. Tab to activity feed items. Tab to quick actions.
- **Loading states:** KPI cards: skeleton with pulse. Map: gray placeholder with spinner. Chart: skeleton axes with loading overlay. Activity feed: skeleton list items (5 rows).
- **Error states:** API failure: individual widget shows "Unable to load" with retry button (other widgets unaffected). Full API failure: page-level error with retry.
- **Empty states:** New user: guided setup prompt replacing dashboard content — "Welcome! Here's how to get started" with steps to create first shipment, run calculator, etc.
- **Performance targets:** LCP < 2.0s (KPI cards should render first). All widgets loaded < 3s. Chart interaction at 60fps. Activity feed updates without full page refresh.

## API Endpoints

### GET /api/dashboard/kpis
- **Description:** Fetch the four primary KPI values with trend data.
- **Authentication required:** Yes
- **Request parameters:**
  - `period` (string, optional): "30d" | "60d" | "90d" (default: "30d")
- **Response (200):**
  ```json
  {
    "activeShipments": {
      "value": 12,
      "previousPeriod": 9,
      "trend": "up",
      "trendPercent": 33.3
    },
    "monthlyRevenue": {
      "value": 2450000,
      "currency": "USD",
      "previousPeriod": 2100000,
      "trend": "up",
      "trendPercent": 16.7
    },
    "avgLandedCost": {
      "value": 0.56,
      "currency": "USD",
      "previousPeriod": 0.62,
      "trend": "down",
      "trendPercent": -9.7,
      "trendDirection": "positive"
    },
    "onTimeRate": {
      "value": 87.5,
      "unit": "percent",
      "previousPeriod": 82.0,
      "trend": "up",
      "trendPercent": 6.7
    },
    "period": "30d",
    "asOf": "2026-03-26T12:00:00Z"
  }
  ```
- **Error responses:**
  - 401: Unauthorized
  - 500: `{ "error": "kpi_calculation_failed" }`
- **Rate limiting:** 30 requests per minute.

### GET /api/dashboard/activity
- **Description:** Fetch recent activity events.
- **Authentication required:** Yes
- **Request parameters:**
  - `limit` (number, optional, default 20, max 50)
  - `after` (ISO date, optional): for pagination/polling
- **Response (200):**
  ```json
  {
    "events": [
      {
        "id": "evt-uuid",
        "type": "shipment_departed",
        "title": "Shipment SS-2026-0042 departed Ho Chi Minh City",
        "description": "Vessel Maersk Singapore, Voyage 123E. ETA Long Beach: April 12",
        "timestamp": "2026-03-26T08:30:00Z",
        "relativeTime": "3h ago",
        "link": "/shipments/ss-2026-0042",
        "icon": "ship",
        "severity": "info"
      }
    ],
    "hasMore": true,
    "nextCursor": "evt-uuid-last"
  }
  ```

### GET /api/dashboard/trends
- **Description:** Fetch revenue/cost trend data for chart.
- **Authentication required:** Yes
- **Request parameters:**
  - `range` (string, required): "30d" | "60d" | "90d"
- **Response (200):**
  ```json
  {
    "range": "30d",
    "granularity": "daily",
    "dataPoints": [
      {
        "date": "2026-03-01",
        "revenue": 85000,
        "costs": {
          "freight": 12000,
          "duty": 8500,
          "fees": 2100,
          "fulfillment": 15000
        },
        "netMargin": 47400
      }
    ],
    "topRoutes": [
      {
        "origin": "VNSGN",
        "originName": "Ho Chi Minh City",
        "destination": "USLGB",
        "destinationName": "Long Beach",
        "containerCount": 24,
        "totalValue": 1200000,
        "avgTransitDays": 19
      }
    ]
  }
  ```

## Data Requirements
- **Database tables read/written:**
  - `shipments` (read) — for active count, positions, status
  - `shipment_timeline` (read) — for activity events and on-time calculation
  - `saved_calculations` (read) — for avg landed cost
  - `calculation_history` (read) — for cost trend aggregation
- **External data sources:** AIS vessel position data (if tracking enabled). Carrier tracking APIs for shipment status updates.
- **Caching strategy:** KPI values cached 5 minutes per org. Activity feed cached 1 minute. Trend data cached 1 hour per range. Map positions cached 5 minutes.

## Component Breakdown
- **Server Components:** `DashboardPage` (layout, parallel data fetching for all widgets via React Suspense).
- **Client Components:** `KpiCard`, `KpiCardGrid`, `MiniMap` (deck.gl), `TrendChart` (Recharts area chart), `TopRoutesChart` (Recharts horizontal bar), `ActivityFeed`, `ActivityItem`, `QuickActions`, `PeriodToggle`, `WelcomeGuide` (for new users).
- **Shared components used:** `Card`, `Badge`, `Button`, `Skeleton`, `Tooltip`, `Map`.
- **New components needed:** `KpiCard`, `MiniMap`, `TrendChart`, `TopRoutesChart`, `ActivityFeed`, `ActivityItem`, `QuickActions`, `PeriodToggle`, `WelcomeGuide`.

## Acceptance Criteria
- [ ] Four KPI cards display correct values with trend indicators
- [ ] KPI trend arrows are color-coded (green = positive, red = negative, considering context)
- [ ] Mini-map shows all active shipment positions with status color coding
- [ ] Map markers are clickable and navigate to shipment detail
- [ ] Revenue/cost trend chart toggles between 30/60/90 day views
- [ ] Top routes chart shows top 5 routes by container volume
- [ ] Activity feed shows last 20 events in chronological order
- [ ] Activity feed auto-refreshes every 60 seconds
- [ ] Quick action buttons navigate to correct pages
- [ ] New user sees welcome guide instead of empty dashboard
- [ ] Each widget loads independently (one failure doesn't block others)
- [ ] Dashboard renders KPI cards within 2 seconds (LCP)
- [ ] All charts have text-based accessibility alternatives
- [ ] Mobile layout stacks widgets vertically with scrollable KPI row
- [ ] Sparklines render in KPI cards on desktop

## Dependencies
- **This page depends on:** Authentication (PRD-APP-01). Shipment data (PRD-APP-09/10). Calculation history (PRD-APP-04). Compliance alerts (PRD-APP-13). User onboarding completion (PRD-APP-02).
- **Pages that depend on this:** None directly — this is a read-only aggregation page. Quick actions link to other pages.
