# PRD: Shipment List

## Overview
- **Purpose:** Display all shipments in a filterable, sortable, searchable table with status-based tabs. Serves as the operational hub for tracking and managing the full portfolio of import/export shipments.
- **User persona:** Operations managers monitoring shipment status daily, freight brokers tracking multiple client shipments, logistics coordinators identifying delays and exceptions.
- **Entry points:** Main navigation "Shipments" link, dashboard "Active Shipments" KPI card click, dashboard activity feed event clicks, direct URL `/shipments`.

## Page Layout

### Desktop (1280px+)
- **Top bar:** Page title "Shipments" with "New Shipment" primary action button (top right). Search bar (search by reference number, carrier, origin/destination).
- **Status tabs:** Horizontal tab bar: All (count), In Transit (count), At Port (count), Customs (count), FTZ (count), Delivered (count), Delayed (count). Active tab highlighted.
- **Filter bar:** Below tabs: Cargo Type dropdown (All, General, Cold Chain), Carrier dropdown, Date Range picker, "More Filters" expandable (origin port, destination port, value range).
- **Data table:** Full-width table with columns: Reference #, Origin -> Destination, Carrier, Status (badge), Cargo Type, ETA, Declared Value. Sortable headers. Row hover highlight. Row click navigates to detail.
- **Bulk actions bar:** Appears when rows are selected via checkboxes. Actions: Export CSV, Update Status, Print Labels.
- **Pagination:** Bottom: "Showing 1-50 of 234 shipments" with page navigation.

### Tablet (768px-1279px)
- Search bar full-width. Tabs scrollable horizontally. Table columns reduced: Reference #, Origin->Dest, Status, ETA. Filters in collapsible drawer.

### Mobile (< 768px)
- Tabs as horizontal scrollable pills. Search as expandable icon. List view (card per shipment) instead of table. Each card: Reference, status badge, origin->dest, ETA. Tap card for detail. Filters in bottom sheet.

## Features & Functionality

### Feature: Filterable Data Table
- **Description:** Interactive data table built with @tanstack/react-table supporting multi-column sort, column visibility toggles, and persistent filter state.
- **Columns:**
  | Column | Type | Sortable | Default Visible |
  |--------|------|----------|-----------------|
  | Checkbox | select | No | Yes |
  | Reference # | string | Yes | Yes |
  | Origin -> Destination | string (port codes) | Yes (by origin) | Yes |
  | Carrier | string + logo | Yes | Yes |
  | Status | badge | Yes | Yes |
  | Cargo Type | badge | Yes | Yes |
  | Container Count | number | Yes | Desktop only |
  | ETA | date | Yes | Yes |
  | Declared Value | currency | Yes | Desktop only |
  | Last Update | relative time | Yes | Desktop only |
- **User interaction flow:**
  1. Table loads with default view (All tab, sorted by Last Update descending)
  2. Click column header to sort (toggle asc/desc)
  3. Use status tabs to filter by shipment phase
  4. Use cargo type dropdown for general vs. cold chain
  5. Search by reference number (real-time filter)
  6. Click row to navigate to shipment detail
- **Edge cases:**
  - No shipments match filters: "No shipments found matching your filters. [Clear filters]"
  - Very long reference numbers: truncate with ellipsis, full value on hover
  - Missing ETA: show "TBD" in gray
  - Overdue shipment (past ETA, not delivered): red text on ETA, "DELAYED" status
- **Validation rules:** Search query: max 100 chars. Date range: end date >= start date.

### Feature: Status Filter Tabs
- **Description:** Quick-filter tabs showing shipment counts by lifecycle stage.
- **Statuses:**
  - **All:** Total count, no filter
  - **In Transit:** Vessel departed, not yet arrived at destination port
  - **At Port:** Arrived at destination port, awaiting customs clearance
  - **Customs:** In customs clearance process (ISF filed, duties being assessed)
  - **FTZ:** Goods entered into Foreign Trade Zone
  - **Delivered:** Final delivery completed
  - **Delayed:** Past expected ETA or customs hold
- **Behavior:** Tab shows count badge. Clicking tab filters table. Counts update in real-time (via polling). "Delayed" tab has red count badge when > 0.

### Feature: Bulk Actions
- **Description:** Perform actions on multiple selected shipments.
- **Actions:**
  - **Export CSV:** Download selected shipments as CSV file with all visible columns
  - **Update Status:** Open modal to change status for all selected shipments (with confirmation)
  - **Print Labels:** Generate shipping labels for selected shipments (PDF)
- **User interaction flow:**
  1. Select rows via checkboxes (individual or "Select All" header checkbox)
  2. Bulk action bar slides up from bottom with selected count and action buttons
  3. Click action -> execute or show confirmation modal
  4. After action: deselect all, show success toast
- **Edge cases:**
  - Select all across pages: "Select all 234 shipments" option appears
  - Mixed-status bulk update: warn "Selected shipments have different statuses. This will override all."
  - CSV export of 1000+ rows: generate async, download when ready

### Feature: Search
- **Description:** Real-time search across reference numbers, carrier names, and port names.
- **Behavior:** 300ms debounce. Filters table to matching rows. Search persists across tab switches. Clear button resets search.
- **Edge cases:** No results: "No shipments match '[query]'" with suggestion to check reference number format.

### Feature: Pagination
- **Description:** Server-side pagination with 50 items per page.
- **Behavior:** Page numbers, previous/next buttons. "Go to page" input for large datasets. "Items per page" selector: 25, 50, 100.
- **Edge cases:** Single page of results: pagination hidden. Last page with fewer items: show actual count.

## Usability Requirements
- **Accessibility (WCAG 2.1 AA):** Table uses proper `<table>`, `<thead>`, `<tbody>`, `<th scope>` markup. Sort state indicated via `aria-sort`. Tabs use `role="tablist"` and `role="tab"`. Checkboxes labeled with row reference. Bulk action bar uses `aria-live`.
- **Keyboard navigation:** Tab to search, tabs, filters, table. Arrow keys navigate table rows. Space toggles checkbox. Enter opens shipment detail. Shift+Click for range selection.
- **Loading states:** Initial: skeleton table rows (10 rows). Tab switch: subtle loading indicator on table body. Search: inline spinner in search bar.
- **Error states:** Table load failure: "Unable to load shipments. [Retry]" with cached data fallback. Bulk action failure: toast with error and affected row count.
- **Empty states:** No shipments at all: illustration + "No shipments yet" + "Create your first shipment" CTA. Filtered empty: "No shipments match your filters" + "Clear filters" link.
- **Performance targets:** LCP < 2.0s. Table render < 500ms for 50 rows. Sort/filter < 200ms. Search response < 300ms.

## API Endpoints

### GET /api/shipments
- **Description:** List shipments with filtering, sorting, and pagination.
- **Authentication required:** Yes
- **Request parameters:**
  - `status` (string, optional): "in_transit" | "at_port" | "customs" | "ftz" | "delivered" | "delayed"
  - `cargo` (string, optional): "general" | "reefer"
  - `carrier` (string, optional): carrier code
  - `search` (string, optional): search query
  - `originPort` (string, optional): port LOCODE
  - `destPort` (string, optional): port LOCODE
  - `dateFrom` (ISO date, optional): ETA from date
  - `dateTo` (ISO date, optional): ETA to date
  - `valueMin` (number, optional): minimum declared value
  - `valueMax` (number, optional): maximum declared value
  - `sort` (string, optional): column name (default: "updatedAt")
  - `order` (string, optional): "asc" | "desc" (default: "desc")
  - `page` (number, optional, default 1)
  - `limit` (number, optional, default 50, max 100)
- **Response (200):**
  ```json
  {
    "shipments": [
      {
        "id": "uuid",
        "reference": "SS-2026-0042",
        "origin": { "locode": "VNSGN", "name": "Ho Chi Minh City" },
        "destination": { "locode": "USLGB", "name": "Long Beach" },
        "carrier": { "code": "MAEU", "name": "Maersk", "logo": "/images/carriers/maersk.svg" },
        "status": "in_transit",
        "cargoType": "reefer",
        "containerCount": 3,
        "eta": "2026-04-12T00:00:00Z",
        "declaredValue": 150000,
        "currency": "USD",
        "lastUpdate": "2026-03-26T08:30:00Z",
        "isDelayed": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "totalItems": 234,
      "totalPages": 5
    },
    "statusCounts": {
      "all": 234,
      "in_transit": 12,
      "at_port": 3,
      "customs": 5,
      "ftz": 8,
      "delivered": 198,
      "delayed": 2
    }
  }
  ```
- **Error responses:**
  - 400: `{ "error": "invalid_filter", "details": {...} }`
  - 401: Unauthorized
- **Rate limiting:** 60 requests per minute.

### PATCH /api/shipments/:id
- **Description:** Update a shipment's status or details.
- **Authentication required:** Yes (admin or editor role)
- **Request body:**
  ```json
  {
    "status": "delivered",
    "notes": "Delivered to warehouse at 14:00 local time"
  }
  ```
- **Response (200):**
  ```json
  {
    "id": "uuid",
    "reference": "SS-2026-0042",
    "status": "delivered",
    "updatedAt": "2026-03-26T14:00:00Z"
  }
  ```
- **Error responses:**
  - 400: `{ "error": "invalid_status_transition", "message": "Cannot move from 'delivered' to 'in_transit'" }`
  - 403: `{ "error": "forbidden", "message": "Viewer role cannot update shipments" }`
  - 404: `{ "error": "not_found" }`

### POST /api/shipments/export
- **Description:** Export shipments to CSV.
- **Authentication required:** Yes
- **Request body:**
  ```json
  {
    "shipmentIds": ["uuid1", "uuid2"],
    "columns": ["reference", "origin", "destination", "carrier", "status", "eta", "value"],
    "format": "csv"
  }
  ```
- **Response (200):** CSV file stream with `Content-Type: text/csv`.

## Data Requirements
- **Database tables read/written:**
  - `shipments` (read/write) — id, orgId, reference, originPort, destPort, carrierId, status, cargoType, containerCount, eta, declaredValue, currency, notes, createdAt, updatedAt
  - `containers` (read) — shipmentId, containerNumber, type, status, sealNumber
- **External data sources:** Carrier tracking APIs for automatic status updates (if connected). AIS for vessel position.
- **Caching strategy:** Shipment list cached 1 minute per filter combination per org. Status counts cached 1 minute. Invalidated on any shipment write.

## Component Breakdown
- **Server Components:** `ShipmentListPage` (layout, initial data fetch with URL params).
- **Client Components:** `ShipmentTable` (tanstack/react-table), `StatusTabs`, `ShipmentFilters`, `SearchBar`, `BulkActionBar`, `ShipmentRow`, `StatusBadge`, `CargoTypeBadge`, `PaginationControls`, `ShipmentCardMobile`.
- **Shared components used:** `Table`, `Input`, `Select`, `Button`, `Badge`, `Checkbox`, `DatePicker`, `Pagination`, `Skeleton`, `Toast`, `Modal`.
- **New components needed:** `StatusTabs`, `ShipmentFilters`, `BulkActionBar`, `StatusBadge`, `CargoTypeBadge`, `ShipmentCardMobile`.

## Acceptance Criteria
- [ ] Table displays all shipments with correct data in each column
- [ ] Column sorting works (click header to toggle asc/desc)
- [ ] Status tabs filter table and show accurate counts
- [ ] Search filters by reference number, carrier, and port names
- [ ] Cargo type filter distinguishes general vs cold chain shipments
- [ ] Row click navigates to shipment detail page
- [ ] Bulk select via checkboxes works (individual + select all)
- [ ] CSV export downloads correct data for selected shipments
- [ ] Bulk status update changes status for all selected shipments
- [ ] Pagination shows correct page info and navigates correctly
- [ ] Delayed shipments show red ETA and appear in Delayed tab
- [ ] Empty state for no shipments shows creation CTA
- [ ] Empty state for filtered view shows "Clear filters" link
- [ ] Mobile view uses card layout instead of table
- [ ] Table renders 50 rows in < 500ms
- [ ] All table elements use proper semantic HTML for accessibility
- [ ] Status transitions are validated (can't go backward in pipeline)

## Dependencies
- **This page depends on:** Authentication (PRD-APP-01) with role-based access. Carrier data for logos and names. Port data for origin/destination display.
- **Pages that depend on this:** Shipment Detail (PRD-APP-10) — accessed by clicking a row. Executive Dashboard (PRD-APP-08) links to filtered views. Analytics (PRD-APP-11) reads shipment data. Compliance Center (PRD-APP-13) references shipments for alerts.
