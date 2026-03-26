# PRD: Analytics Dashboard

## Overview
- **Purpose:** Provide deep analytical insights into shipping costs, carrier performance, route efficiency, and cost trends over time. Enables data-driven decision-making for sourcing, route selection, and carrier negotiations.
- **User persona:** Business owners reviewing monthly cost trends, logistics managers benchmarking carrier performance, financial analysts building cost projections, freight brokers preparing client reports.
- **Entry points:** Main navigation "Analytics" link, dashboard "Monthly Revenue" KPI click, dashboard "View Reports" quick action, direct URL `/analytics`.

## Page Layout

### Desktop (1280px+)
- **Top bar:** Page title "Analytics" with date range selector (1M, 3M, 6M, 12M, Custom) and "Export" dropdown (PDF, CSV).
- **Row 1 (Full width):** Stacked area chart showing monthly costs by category (freight, duty, FTZ, fulfillment, insurance, drayage). Time on X-axis, cost on Y-axis. Overlay: cost-per-unit trend line (dashed, secondary axis).
- **Row 2 (50/50 split):**
  - Left: Pie/donut chart of cost category breakdown for selected period
  - Right: Carrier performance comparison radar chart (axes: cost, reliability, transit time, coverage, flexibility)
- **Row 3 (Full width):** Route performance table with sortable columns.
- **Bottom:** Export controls and report generation options.

### Tablet (768px-1279px)
- Date range as horizontal scroll pills. Charts stacked vertically (full width each). Table scrolls horizontally.

### Mobile (< 768px)
- Date range as dropdown. Charts simplified (stacked area -> simple line, radar -> horizontal bars). Table as card list per route.

## Features & Functionality

### Feature: Cost Trend Chart (Stacked Area)
- **Description:** Visualize how total shipping costs break down by category over time, with a cost-per-unit overlay for efficiency tracking.
- **Categories (stacked):**
  - Freight (ocean + inland + drayage)
  - Duties & Tariffs (general duty + Section 301 + AD/CVD + MPF + HMF)
  - FTZ Costs (operator fees + handling)
  - Fulfillment (warehousing + pick/pack + last mile)
  - Insurance
  - Fees & Compliance (broker, ISF, exams, bonds)
- **Overlay:** Cost-per-unit line (right Y-axis) calculated as total cost / total units for each period.
- **Interactions:**
  - Hover: tooltip showing exact amounts per category for that data point
  - Click category in legend to toggle visibility
  - Drag to zoom into date range (or use preset buttons)
  - "Compare to previous period" toggle shows faded overlay of previous period data
- **Edge cases:**
  - Insufficient data (< 3 data points): show line chart instead of area. "More data needed for trend analysis."
  - Single category dominates (>90%): still show other categories; add note about dominant category.
  - Zero cost periods: gap in area chart with "No shipments" label.

### Feature: Cost Category Breakdown (Donut Chart)
- **Description:** Percentage breakdown of total costs by category for the selected time period.
- **Details:**
  - Center of donut: total cost in USD
  - Segments: same categories as trend chart
  - Hover segment: exact amount + percentage
  - Click segment: drill down to line-item details in a side panel
  - Below chart: comparison to previous period ("Freight costs +12% vs last period")
- **Edge cases:** Only one category: full donut with that category labeled.

### Feature: Carrier Performance Comparison (Radar Chart)
- **Description:** Multi-axis radar chart comparing carriers across key performance dimensions.
- **Axes (5):**
  1. **Cost Efficiency:** Average cost per TEU (inverted: lower = better = outer)
  2. **Reliability:** On-time delivery percentage
  3. **Transit Time:** Average transit days (inverted: lower = better = outer)
  4. **Route Coverage:** Number of available port pairs
  5. **Flexibility:** Schedule frequency (departures per week)
- **Details:**
  - Up to 4 carriers compared simultaneously
  - Carrier selector dropdown (multi-select)
  - Each carrier is a different colored polygon on the radar
  - Legend with carrier names and colors
  - Click axis label for detailed data
- **Edge cases:**
  - Fewer than 2 carriers used: show single carrier profile instead of comparison. "Use additional carriers to enable comparison."
  - Missing data for an axis: show partial polygon with "Data unavailable" for that axis.

### Feature: Route Performance Table
- **Description:** Sortable table comparing all routes used during the selected period.
- **Columns:**
  | Column | Description |
  |--------|-------------|
  | Route | Origin -> Destination (port names) |
  | Shipments | Number of shipments |
  | Containers | Total TEUs |
  | Avg Transit | Average transit days |
  | On-Time % | Percentage delivered within expected window |
  | Avg Cost/TEU | Average cost per container |
  | Total Cost | Sum of all shipment costs |
  | Carriers | Carrier logos used on this route |
  | Trend | Sparkline showing cost trend |
- **Interactions:**
  - Sort by any column
  - Click row: expand to show monthly breakdown for that route
  - "View Route" action: opens Route Comparison (PRD-APP-06) with pre-filled ports
- **Edge cases:** Single route: table still shown. No routes: "No shipment data for selected period."

### Feature: Date Range Selector
- **Description:** Control the time period for all analytics visualizations.
- **Options:** 1M, 3M, 6M, 12M, Custom (date picker with from/to).
- **Behavior:** Changing range reloads all charts and tables. All widgets respect the same range. URL updates with range param for shareability.
- **Edge cases:** Custom range exceeding available data: show what's available with note. Future dates in range: ignored.

### Feature: Export (PDF / CSV)
- **Description:** Generate downloadable reports of analytics data.
- **PDF Report:** Professional report with company header, date range, all charts (rendered as images), tables, and key insights summary.
- **CSV Export:** Raw data tables for each section (costs, carriers, routes) as separate sheets in a ZIP or multi-sheet CSV.
- **User interaction flow:**
  1. Click "Export" dropdown
  2. Select PDF or CSV
  3. Confirmation modal with options (which sections to include)
  4. Generate → download
- **Edge cases:** PDF timeout: progress bar with retry option. Large CSV (>10K rows): async generation with email delivery.

## Usability Requirements
- **Accessibility (WCAG 2.1 AA):** All charts have tabular data alternatives accessible via "View data table" toggle. Radar chart segments have `aria-label`. Color-blind safe palette (8+ distinct colors). Legend items are focusable and toggle via keyboard.
- **Keyboard navigation:** Tab through date range, charts (legend items), table headers (sort). Enter toggles legend item or sorts column. Chart zoom via keyboard (+/- keys when focused).
- **Loading states:** Per-chart skeleton with animated pulse. Table: skeleton rows. "Loading analytics for [date range]..." overlay.
- **Error states:** Individual chart failure: "Unable to load [chart name]. [Retry]" (other charts unaffected). Full API failure: page-level error.
- **Empty states:** No data for period: illustration + "No shipment data for this period. Adjust the date range or create shipments to start tracking."
- **Performance targets:** LCP < 2.5s. All charts render < 1s after data load. Table sorts < 200ms. Export PDF < 10s.

## API Endpoints

### GET /api/analytics/costs
- **Description:** Fetch cost breakdown data for charts.
- **Authentication required:** Yes
- **Request parameters:**
  - `range` (string, required): "1m" | "3m" | "6m" | "12m"
  - `from` (ISO date, optional): custom range start
  - `to` (ISO date, optional): custom range end
  - `granularity` (string, optional): "daily" | "weekly" | "monthly" (auto-selected based on range)
- **Response (200):**
  ```json
  {
    "range": { "from": "2026-01-01", "to": "2026-03-26" },
    "granularity": "monthly",
    "timeSeries": [
      {
        "period": "2026-01",
        "freight": 45000,
        "duties": 28000,
        "ftzCosts": 5000,
        "fulfillment": 62000,
        "insurance": 3500,
        "feesCompliance": 4200,
        "total": 147700,
        "totalUnits": 250000,
        "costPerUnit": 0.59
      }
    ],
    "totals": {
      "freight": 135000,
      "duties": 84000,
      "ftzCosts": 15000,
      "fulfillment": 186000,
      "insurance": 10500,
      "feesCompliance": 12600,
      "total": 443100
    },
    "previousPeriod": {
      "total": 398000,
      "changePercent": 11.3
    }
  }
  ```

### GET /api/analytics/carriers
- **Description:** Fetch carrier performance comparison data.
- **Authentication required:** Yes
- **Request parameters:** Same range params as `/costs`.
- **Response (200):**
  ```json
  {
    "carriers": [
      {
        "code": "MAEU",
        "name": "Maersk",
        "metrics": {
          "avgCostPerTeu": 3200,
          "onTimePercent": 87.5,
          "avgTransitDays": 18.2,
          "routeCount": 12,
          "weeklyDepartures": 3.5
        },
        "normalized": {
          "costEfficiency": 0.78,
          "reliability": 0.875,
          "transitTime": 0.82,
          "coverage": 0.92,
          "flexibility": 0.70
        },
        "shipmentCount": 24,
        "containerCount": 72
      }
    ]
  }
  ```

### GET /api/analytics/routes
- **Description:** Fetch route performance data.
- **Authentication required:** Yes
- **Request parameters:** Same range params as `/costs`.
- **Response (200):**
  ```json
  {
    "routes": [
      {
        "origin": { "locode": "VNSGN", "name": "Ho Chi Minh City" },
        "destination": { "locode": "USLGB", "name": "Long Beach" },
        "shipmentCount": 18,
        "containerCount": 54,
        "avgTransitDays": 19.2,
        "onTimePercent": 85.0,
        "avgCostPerTeu": 3400,
        "totalCost": 183600,
        "carriers": ["MAEU", "CMDU"],
        "costTrend": [3200, 3400, 3600]
      }
    ]
  }
  ```

## Data Requirements
- **Database tables read/written:**
  - `shipments` (read) — for aggregation
  - `calculation_history` (read) — for cost data
  - `shipment_timeline` (read) — for on-time calculations
  - `saved_calculations` (read) — for per-unit cost data
- **External data sources:** None — all analytics derived from internal platform data.
- **Caching strategy:** Analytics queries cached 1 hour per org per date range. Invalidated on new shipment creation or status update. Aggregation pre-computed nightly for historical ranges.

## Component Breakdown
- **Server Components:** `AnalyticsPage` (layout, parallel data fetch).
- **Client Components:** `CostTrendChart` (Recharts stacked area + line), `CostBreakdownDonut` (Recharts pie), `CarrierRadarChart` (Recharts radar), `RoutePerformanceTable` (tanstack/react-table), `DateRangeSelector`, `ExportMenu`, `ChartLegend`, `DataTableToggle` (accessibility alternative), `PeriodComparison`.
- **Shared components used:** `Card`, `Select`, `Button`, `Table`, `Skeleton`, `Tooltip`, `Badge`.
- **New components needed:** `CostTrendChart`, `CostBreakdownDonut`, `CarrierRadarChart`, `RoutePerformanceTable`, `DateRangeSelector`, `ExportMenu`, `DataTableToggle`.

## Acceptance Criteria
- [ ] Stacked area chart shows costs by category over time with correct data
- [ ] Cost-per-unit overlay line tracks on secondary axis
- [ ] Chart legend toggles individual categories on/off
- [ ] Donut chart shows accurate percentage breakdown with center total
- [ ] Carrier radar chart compares up to 4 carriers across 5 axes
- [ ] Carrier comparison uses normalized scores (0-1) for fair comparison
- [ ] Route performance table is sortable by all columns
- [ ] Date range selector affects all visualizations simultaneously
- [ ] 1M/3M/6M/12M preset ranges work correctly
- [ ] Custom date range with picker works correctly
- [ ] Previous period comparison shows percentage change
- [ ] PDF export generates professional report within 10 seconds
- [ ] CSV export includes all raw data in downloadable format
- [ ] All charts have accessible data table alternatives
- [ ] Empty state shows when no data exists for selected period
- [ ] Charts render within 1 second of data load
- [ ] Mobile view simplifies charts appropriately

## Dependencies
- **This page depends on:** Authentication (PRD-APP-01). Shipment data (PRD-APP-09/10). Calculation history (PRD-APP-04). Carrier data.
- **Pages that depend on this:** Executive Dashboard (PRD-APP-08) shows simplified versions of these charts. No other pages directly depend on analytics.
