# PRD: Shipment Detail

## Overview
- **Purpose:** Provide a comprehensive view of a single shipment including its timeline, current position, documents, cost breakdown, containers, FTZ entries, and communication thread. This is the operational detail page where day-to-day shipment management happens.
- **User persona:** Operations coordinators managing individual shipments, compliance officers reviewing documentation, freight brokers updating clients on shipment status.
- **Entry points:** Click row in Shipment List, click shipment in Activity Feed, click map marker on Dashboard, direct URL `/shipments/:id`, shipment reference link from Compliance alerts.

## Page Layout

### Desktop (1280px+)
- **Header:** Shipment reference (large), carrier logo + name, status badge, origin -> destination with port names, "Edit" and "Print" action buttons.
- **Row 1 (Status Timeline):** Full-width horizontal progress bar showing shipment lifecycle: Booked -> Departed -> Transshipment(s) -> Arrived -> Customs -> Delivered. Active step highlighted, completed steps checkmarked, future steps outlined. Dates below each step.
- **Row 2 (65/35 split):**
  - Left: Route map showing current vessel position on the route path. Origin, destination, and transshipment ports marked.
  - Right: Key details card (Carrier, Vessel, Voyage, Container Count, Cargo Type, Declared Value, ETA, Last Update).
- **Tabbed content area below:**
  - **Documents** tab: Upload/view/download BOL, ISF, Commercial Invoice, Packing List, Certificate of Origin
  - **Containers** tab: Table of containers with tracking numbers and individual status
  - **Cost Breakdown** tab: Landed cost breakdown for this shipment (linked to calculator)
  - **FTZ** tab: Related FTZ entries if goods entered FTZ (conditional — only shown if applicable)
  - **Notes** tab: Comments/communication thread for internal collaboration
- **Right sidebar (collapsible):** Quick info panel with shipment metadata.

### Tablet (768px-1279px)
- Header stacked. Timeline scrollable horizontally. Map reduced height. Tabs full-width. Sidebar hidden (info in header).

### Mobile (< 768px)
- Header stacked with compact layout. Timeline as vertical stepper. Map collapsed (tap to expand). Tabs as accordion sections. Notes tab as primary focus.

## Features & Functionality

### Feature: Status Timeline/Progress Bar
- **Description:** Visual representation of the shipment's journey through its lifecycle stages.
- **Stages:**
  1. **Booked** — Shipment created and booking confirmed
  2. **Departed** — Vessel left origin port
  3. **Transshipment** — At hub port (if applicable, shows port name)
  4. **Arrived** — Arrived at destination port
  5. **Customs** — In customs clearance process
  6. **Delivered** — Final delivery to warehouse/consignee
- **Visual details:**
  - Completed stages: green checkmark, solid line between
  - Active stage: blue pulsing dot, bold label
  - Future stages: gray outlined circle, dashed line
  - Dates below each completed/active stage
  - Click on a stage to see detailed events for that phase (e.g., Departed: vessel name, departure time, port)
- **Edge cases:**
  - Multiple transshipments: show each as a sub-step with port name
  - Customs hold: "Customs" stage shows amber warning indicator with hold reason
  - Shipment returned/rejected: show reverse flow with red indicators
  - Unknown current status: "Status Unknown — Last updated [date]" with warning

### Feature: Route Map with Current Position
- **Description:** Interactive map showing the shipment's route and current position.
- **Details:**
  - Route path: dashed line from origin to destination following sea lanes
  - Completed portion: solid colored line
  - Current position: animated vessel icon (or marker)
  - Origin and destination: large markers with port names
  - Transshipment ports: medium markers
  - Hover vessel: show speed, heading, last AIS update time
- **Edge cases:**
  - No AIS data available: show estimated position based on departure date and transit time
  - Vessel at port: show vessel icon at port marker with "At Port" label
  - Multiple vessels (if transshipped): show different colored markers for each leg

### Feature: Document Management
- **Description:** Upload, view, download, and manage shipment documents.
- **Document types:**
  - Bill of Lading (BOL) — required
  - Importer Security Filing (ISF) — required for US imports
  - Commercial Invoice — required
  - Packing List — required
  - Certificate of Origin — if claiming preferential rates
  - Customs Entry Summary (CBP Form 7501) — post-clearance
  - Arrival Notice — from carrier
  - Delivery Order — from carrier/terminal
- **User interaction flow:**
  1. Document grid shows all document types as cards
  2. Each card: document type icon, status (Missing / Uploaded / Approved / Filed), filename, upload date
  3. "Upload" button on missing/replace existing: drag-and-drop or file picker
  4. Click uploaded document: inline PDF preview
  5. "Download" button for each document
  6. "Approve" action (admin only) for compliance workflow
- **Edge cases:**
  - Unsupported file type: "Only PDF, PNG, JPG files are accepted"
  - File too large (>25MB): "Maximum file size is 25MB"
  - Upload failure: retry with previous file preserved
  - Multiple versions: show version history with dates

### Feature: Container List
- **Description:** Table of all containers in this shipment with individual tracking status.
- **Columns:** Container Number, Type (20ft/40ft/HC/Reefer), Status, Seal Number, Weight, Last Event, Tracking Link.
- **Interaction:** Click container to expand detailed event history. External tracking link opens carrier's tracking page. Highlight containers with exceptions (e.g., temperature alert for reefer).
- **Edge cases:** Single container: show as detail card instead of table. No tracking data: show "Tracking data unavailable" with carrier customer service link.

### Feature: Cost Breakdown
- **Description:** Landed cost calculation specific to this shipment (not generic — uses actual shipment data).
- **Details:**
  - Pre-filled from shipment data: origin cost, container type, carrier costs, duties paid
  - Displays same breakdown as Landed Cost Calculator (PRD-APP-04)
  - Shows actual vs. estimated comparison if original estimate exists
  - "Open in Calculator" link to modify parameters and re-run
- **Edge cases:** Cost data incomplete: show what's available with "Pending" labels for missing components.

### Feature: FTZ Entries (Conditional Tab)
- **Description:** If any goods from this shipment were entered into an FTZ, show FTZ entry details.
- **Details:**
  - FTZ zone number and name
  - Entry date and status election (PF/NPF)
  - Units entered, duty rate locked at entry
  - Withdrawal history: table of withdrawals with dates, quantities, duties paid
  - Remaining inventory in FTZ
  - Link to FTZ Modeler with this entry's data
- **Edge cases:** No FTZ entries: tab hidden entirely. Partial FTZ entry (some goods entered, some went direct): show both paths.

### Feature: Notes/Comments Section
- **Description:** Internal communication thread for shipment-related discussions.
- **User interaction flow:**
  1. Text input at bottom of notes section
  2. User types note and clicks "Add Note" (or Enter)
  3. Note appears in chronological thread with: author name, timestamp, content
  4. Support for @mentions (team members)
  5. Markdown formatting for links and emphasis
- **Edge cases:** Long notes: truncate with "Show more" link. Empty thread: "No notes yet. Add a note to start the conversation."

## Usability Requirements
- **Accessibility (WCAG 2.1 AA):** Timeline uses `aria-describedby` for step descriptions. Map has text-based position summary. Document cards have `aria-label` with type and status. Notes thread uses semantic list with time elements.
- **Keyboard navigation:** Tab through timeline steps, map controls, tab list, document cards. Enter activates buttons and opens detail views. Escape closes modals/previews.
- **Loading states:** Timeline: skeleton steps. Map: gray placeholder with spinner. Documents: skeleton cards. Tabs: content-area skeleton per tab.
- **Error states:** Shipment not found (invalid ID): 404 page. Document upload failure: inline error with retry. Map data unavailable: static route image fallback.
- **Empty states:** Per tab — documents: "No documents uploaded yet. Upload your first document." Containers: "No container data available." Notes: "No notes yet."
- **Performance targets:** LCP < 2.5s. Document preview < 3s. Map renders < 1s. Tab switch < 200ms.

## API Endpoints

### GET /api/shipments/:id
- **Description:** Get full shipment details.
- **Authentication required:** Yes
- **Response (200):**
  ```json
  {
    "id": "uuid",
    "reference": "SS-2026-0042",
    "origin": { "locode": "VNSGN", "name": "Ho Chi Minh City" },
    "destination": { "locode": "USLGB", "name": "Long Beach" },
    "carrier": { "code": "MAEU", "name": "Maersk", "logo": "..." },
    "vessel": "Maersk Singapore",
    "voyage": "123E",
    "status": "in_transit",
    "cargoType": "reefer",
    "containerCount": 3,
    "declaredValue": 150000,
    "currency": "USD",
    "eta": "2026-04-12T00:00:00Z",
    "currentPosition": {
      "latitude": 15.5,
      "longitude": 135.2,
      "speed": 18.5,
      "heading": 72,
      "lastUpdated": "2026-03-26T08:00:00Z"
    },
    "routeGeometry": { "type": "LineString", "coordinates": [...] },
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-03-26T08:30:00Z"
  }
  ```
- **Error responses:**
  - 404: `{ "error": "not_found" }`
  - 403: `{ "error": "forbidden" }`

### GET /api/shipments/:id/timeline
- **Description:** Get shipment timeline events.
- **Authentication required:** Yes
- **Response (200):**
  ```json
  {
    "stages": [
      {
        "stage": "booked",
        "status": "completed",
        "date": "2026-03-01T10:00:00Z",
        "details": "Booking confirmed with Maersk"
      },
      {
        "stage": "departed",
        "status": "completed",
        "date": "2026-03-08T06:00:00Z",
        "details": "Departed Ho Chi Minh City on Maersk Singapore, Voyage 123E"
      },
      {
        "stage": "arrived",
        "status": "upcoming",
        "estimatedDate": "2026-04-12T00:00:00Z",
        "details": null
      }
    ],
    "events": [
      {
        "timestamp": "2026-03-08T06:00:00Z",
        "event": "vessel_departed",
        "location": "VNSGN",
        "description": "Vessel departed origin port"
      },
      {
        "timestamp": "2026-03-15T12:00:00Z",
        "event": "position_update",
        "location": "Pacific Ocean",
        "description": "In transit, speed 18.5 knots"
      }
    ]
  }
  ```

### GET /api/shipments/:id/documents
- **Description:** List all documents for a shipment.
- **Authentication required:** Yes
- **Response (200):**
  ```json
  {
    "documents": [
      {
        "id": "doc-uuid",
        "type": "bill_of_lading",
        "typeName": "Bill of Lading",
        "status": "uploaded",
        "filename": "BOL-SS-2026-0042.pdf",
        "fileSize": 245000,
        "mimeType": "application/pdf",
        "uploadedBy": "Blake Johnson",
        "uploadedAt": "2026-03-02T14:00:00Z",
        "url": "/api/documents/doc-uuid/download",
        "versions": [
          { "version": 1, "uploadedAt": "2026-03-02T14:00:00Z", "uploadedBy": "Blake Johnson" }
        ]
      }
    ],
    "requiredDocuments": [
      { "type": "bill_of_lading", "status": "uploaded" },
      { "type": "isf", "status": "missing" },
      { "type": "commercial_invoice", "status": "uploaded" },
      { "type": "packing_list", "status": "missing" }
    ]
  }
  ```

### POST /api/shipments/:id/documents
- **Description:** Upload a document to a shipment.
- **Authentication required:** Yes (admin or editor)
- **Request:** Multipart form data with `file` (binary) and `type` (string).
- **Response (201):**
  ```json
  {
    "id": "doc-uuid",
    "type": "isf",
    "filename": "ISF-SS-2026-0042.pdf",
    "status": "uploaded",
    "uploadedAt": "2026-03-26T14:00:00Z"
  }
  ```
- **Error responses:**
  - 400: `{ "error": "invalid_file_type", "message": "Only PDF, PNG, JPG files accepted" }`
  - 413: `{ "error": "file_too_large", "message": "Maximum file size is 25MB" }`

### POST /api/shipments/:id/notes
- **Description:** Add a note to a shipment.
- **Authentication required:** Yes
- **Request body:**
  ```json
  {
    "content": "Customs broker confirmed ISF filing. Waiting for arrival notice.",
    "mentions": ["user-uuid-1"]
  }
  ```
- **Response (201):**
  ```json
  {
    "id": "note-uuid",
    "content": "Customs broker confirmed ISF filing. Waiting for arrival notice.",
    "author": { "id": "user-uuid", "name": "Blake Johnson" },
    "createdAt": "2026-03-26T15:00:00Z"
  }
  ```

## Data Requirements
- **Database tables read/written:**
  - `shipments` (read) — core shipment data
  - `containers` (read) — container details per shipment
  - `shipment_timeline` (read) — lifecycle events
  - `shipment_documents` (read/write) — uploaded documents with metadata
  - `shipment_notes` (read/write) — notes/comments thread
  - `ftz_entries` (read) — if goods entered FTZ
  - `ftz_withdrawals` (read) — withdrawal history
  - `saved_calculations` (read) — linked cost calculations
- **External data sources:** Carrier tracking API for vessel position and status updates. AIS for real-time vessel position. Vercel Blob or S3 for document file storage.
- **Caching strategy:** Shipment details cached 1 minute. Timeline cached 5 minutes. Documents list cached 1 minute (invalidate on upload). Vessel position cached 5 minutes.

## Component Breakdown
- **Server Components:** `ShipmentDetailPage` (layout, parallel data fetch for shipment + timeline + documents).
- **Client Components:** `ShipmentHeader`, `StatusTimeline`, `ShipmentMap`, `ShipmentDetailsCard`, `DocumentGrid`, `DocumentCard`, `DocumentUploader`, `DocumentPreview`, `ContainerTable`, `ContainerEventHistory`, `CostBreakdownPanel`, `FtzEntriesPanel`, `NotesThread`, `NoteInput`, `TabContainer`.
- **Shared components used:** `Card`, `Badge`, `Button`, `Table`, `Tabs`, `Modal`, `Tooltip`, `Skeleton`, `Map`, `FileUpload`.
- **New components needed:** `StatusTimeline`, `ShipmentHeader`, `DocumentGrid`, `DocumentCard`, `DocumentUploader`, `DocumentPreview`, `ContainerTable`, `FtzEntriesPanel`, `NotesThread`, `NoteInput`.

## Acceptance Criteria
- [ ] Shipment header displays reference, carrier, status, and origin->destination
- [ ] Timeline accurately shows completed, active, and future stages
- [ ] Timeline dates are correct for completed events
- [ ] Map shows vessel position on the route path
- [ ] Map falls back to estimated position when AIS data unavailable
- [ ] Documents tab shows all required document types with status
- [ ] Document upload accepts PDF, PNG, JPG files up to 25MB
- [ ] Uploaded documents can be previewed inline (PDF viewer)
- [ ] Container table shows all containers with tracking numbers
- [ ] Cost breakdown matches the Landed Cost Calculator output format
- [ ] FTZ tab only appears when goods have FTZ entries
- [ ] Notes section supports adding and viewing comments
- [ ] Notes show author name and timestamp
- [ ] Tab switching is instant (< 200ms) with content caching
- [ ] Mobile view uses vertical timeline and accordion tabs
- [ ] 404 page shown for invalid shipment IDs

## Dependencies
- **This page depends on:** Authentication (PRD-APP-01). Shipment List (PRD-APP-09) for navigation. Carrier APIs for tracking. Document storage service. Port data for display. FTZ data (PRD-APP-05) for FTZ tab. Landed Cost Calculator logic (PRD-APP-04) for cost breakdown.
- **Pages that depend on this:** Compliance Center (PRD-APP-13) links to shipment detail from alerts. Analytics (PRD-APP-11) reads shipment data. Document Center (PRD-APP-15) shows shipment-linked documents.
