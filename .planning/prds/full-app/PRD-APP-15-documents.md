# PRD: Document Center

## Overview
- **Purpose:** Centralized hub for creating, managing, and tracking all shipping documents. Provides templates for standard shipping documents (BOL, ISF, Commercial Invoice, Packing List, Certificate of Origin), supports generation from shipment data, and tracks document status through a review pipeline.
- **User persona:** Operations coordinators preparing shipping documents, compliance officers reviewing document accuracy, customs brokers managing filing workflows.
- **Entry points:** Main navigation "Documents" link, "File ISF" from Compliance Center countdown, "Upload document" from Shipment Detail, direct URL `/documents`.

## Page Layout

### Desktop (1280px+)
- **Top bar:** Page title "Document Center" with "New Document" primary action button and filter controls.
- **Tab bar:** All Documents, Templates, By Shipment.
- **"All Documents" tab:** Filterable table of all documents across shipments. Columns: Document Name, Type, Shipment Reference, Status (pipeline badge), Created By, Last Updated, Actions.
- **"Templates" tab:** Grid of document template cards (6 templates). Each card: template icon, name, description, "Generate" button.
- **"By Shipment" tab:** Grouped view — expandable rows per shipment showing all documents for that shipment with completeness indicator.
- **Right panel (on document selection):** Document preview pane — inline PDF viewer. Below preview: version history, status pipeline, action buttons.

### Tablet (768px-1279px)
- Tabs full-width. Table with fewer columns. Preview opens as full-page overlay instead of side panel.

### Mobile (< 768px)
- Tabs as pills. Document list as cards. Templates as vertical list. Preview opens as full-screen modal.

## Features & Functionality

### Feature: Template Grid
- **Description:** Pre-built templates for standard international shipping documents.
- **Templates:**
  1. **Bill of Lading (BOL)** — Shipper, consignee, notify party, vessel, port of loading/discharge, cargo description, container numbers, marks & numbers
  2. **Importer Security Filing (ISF/10+2)** — Importer of record, consignee, seller, buyer, ship-to, manufacturer, country of origin, HTS numbers, container stuffing location, consolidator
  3. **Commercial Invoice** — Seller, buyer, invoice number, date, description of goods, quantity, unit price, total, currency, country of origin, Incoterm, payment terms
  4. **Packing List** — Shipment reference, number of packages, package type, dimensions, gross/net weight per package, total weight, marks & numbers
  5. **Certificate of Origin** — Exporter, producer, importer, goods description, HTS classification, origin criteria, blanket period
  6. **Customs Entry Summary (7501)** — Entry type, port of entry, entry date, importer number, importing carrier, HTS classification, duty rates, value
- **Card details:** Template icon, name, description ("Standard ocean freight bill of lading"), "Generate" button, "View blank" link, last used date.

### Feature: Generate from Template
- **Description:** Create a new document from a template, pre-filling fields from shipment data.
- **User interaction flow:**
  1. Click "Generate" on a template card
  2. Modal: Select shipment to link (dropdown of active shipments)
  3. System pre-fills template fields from shipment data (origin, destination, carrier, containers, cargo, HTS codes, value)
  4. User reviews and edits pre-filled fields in a form layout matching the document structure
  5. Click "Generate PDF" to create the document
  6. Document appears in preview pane
  7. Status set to "Draft"
- **Edge cases:**
  - No shipment selected: generate blank template with all fields empty
  - Incomplete shipment data: pre-fill what's available, highlight missing fields in yellow
  - Template not applicable for shipment (e.g., Certificate of Origin for a shipment without preferential treatment): show note "This document may not be required for this shipment"

### Feature: Upload Existing Documents
- **Description:** Upload externally created documents and associate them with shipments.
- **User interaction flow:**
  1. Click "Upload Document" or drag files onto the page
  2. Select document type from dropdown
  3. Select associated shipment (optional)
  4. Upload file (PDF, PNG, JPG, max 25MB)
  5. Document added to list with "Uploaded" badge
  6. Status set to "Draft" (needs review) or "Approved" (if user has admin role)
- **Edge cases:**
  - Bulk upload: accept multiple files, assign type to each
  - Duplicate detection: warn if document type already exists for shipment
  - File validation: reject non-supported formats with clear error

### Feature: Document Status Pipeline
- **Description:** Track each document through a 4-stage review workflow.
- **Stages:**
  1. **Draft** — Document created/uploaded, not yet reviewed
  2. **Review** — Submitted for review by compliance officer or manager
  3. **Approved** — Reviewed and approved, ready for use
  4. **Filed** — Submitted to CBP or relevant authority
- **Interaction:**
  - Status badge on each document (color-coded: gray/blue/green/purple)
  - "Submit for Review" action moves Draft -> Review
  - "Approve" action moves Review -> Approved (admin/editor only)
  - "Mark as Filed" action moves Approved -> Filed (with filing reference number input)
  - "Reject" action moves Review -> Draft with rejection notes
- **Edge cases:**
  - Rejection: status reverts to Draft with rejection reason displayed. User must edit and resubmit.
  - Skip review: admin can move Draft directly to Approved
  - Filed document edited: creates new version, resets to Draft

### Feature: Version History
- **Description:** Track all versions of a document with the ability to view or restore previous versions.
- **Details:**
  - Each save creates a new version (v1, v2, v3...)
  - Version history list: version number, saved by, date, change summary
  - Click version to preview that version
  - "Restore" action on any previous version creates a new version with that content
  - Compare versions: side-by-side diff (for text-based fields)
- **Edge cases:** First version: no compare option. Restore: creates new version (v4 = copy of v2), does not overwrite.

### Feature: PDF Preview
- **Description:** Inline PDF viewer for reviewing documents without downloading.
- **Details:**
  - Embedded PDF viewer (react-pdf or iframe)
  - Zoom controls, page navigation, fit-to-width
  - "Download" button for local save
  - "Print" button for physical copies
  - Annotations/highlights (Phase 2)
- **Edge cases:** PDF render failure: download fallback. Very large PDF (>50 pages): paginate with page selector. Image-only uploads: show image preview instead of PDF viewer.

## Usability Requirements
- **Accessibility (WCAG 2.1 AA):** Template cards have `aria-label` with template name and description. Status pipeline uses text labels alongside colors. Upload zone has keyboard alternative (Enter to open file picker). PDF preview has "Download accessible version" link. Form fields in generate flow have proper labels.
- **Keyboard navigation:** Tab through tabs, template cards, document rows, action buttons. Enter opens template generator or document preview. Escape closes modals/panels.
- **Loading states:** Template generation: progress bar "Generating document..." PDF preview: loading spinner. Upload: progress bar per file.
- **Error states:** Upload failure: "Upload failed. Check file size and format." PDF generation failure: "Unable to generate PDF. Missing required fields: [list]." Preview load failure: "Unable to preview. [Download instead]."
- **Empty states:** No documents: "No documents yet. Generate from a template or upload existing documents." Per shipment: "No documents for this shipment."
- **Performance targets:** LCP < 2.0s. Template generation < 3s. PDF preview load < 2s. Upload progress shown in real-time.

## API Endpoints

### GET /api/documents
- **Description:** List all documents with filtering.
- **Authentication required:** Yes
- **Request parameters:**
  - `type` (string, optional): "bol" | "isf" | "commercial_invoice" | "packing_list" | "certificate_of_origin" | "entry_summary"
  - `shipment` (string, optional): shipment ID
  - `status` (string, optional): "draft" | "review" | "approved" | "filed"
  - `search` (string, optional): search by document name or shipment reference
  - `page` (number, optional, default 1)
  - `limit` (number, optional, default 25)
- **Response (200):**
  ```json
  {
    "documents": [
      {
        "id": "doc-uuid",
        "name": "BOL - SS-2026-0042",
        "type": "bol",
        "typeName": "Bill of Lading",
        "shipment": { "id": "ship-uuid", "reference": "SS-2026-0042" },
        "status": "approved",
        "version": 2,
        "createdBy": { "id": "user-uuid", "name": "Blake Johnson" },
        "createdAt": "2026-03-15T10:00:00Z",
        "updatedAt": "2026-03-18T14:00:00Z",
        "fileSize": 245000,
        "previewUrl": "/api/documents/doc-uuid/preview"
      }
    ],
    "pagination": { "page": 1, "limit": 25, "total": 48 },
    "statusCounts": { "draft": 5, "review": 3, "approved": 30, "filed": 10 }
  }
  ```
- **Rate limiting:** 60 requests per minute.

### POST /api/documents/generate
- **Description:** Generate a document from a template.
- **Authentication required:** Yes
- **Request body:**
  ```json
  {
    "template": "bol",
    "shipmentId": "ship-uuid",
    "fields": {
      "shipper": { "name": "VN Export Co", "address": "123 Nguyen Hue, HCMC" },
      "consignee": { "name": "Cold Chain Logistics LLC", "address": "..." },
      "notifyParty": { "name": "...", "address": "..." },
      "vesselName": "Maersk Singapore",
      "voyage": "123E",
      "portOfLoading": "Ho Chi Minh City",
      "portOfDischarge": "Long Beach",
      "containers": [
        { "number": "MAEU1234567", "type": "40ft_reefer", "sealNumber": "SL-001" }
      ],
      "cargoDescription": "Frozen shrimp, 50,000 lbs",
      "grossWeight": "22,680 kg",
      "measurement": "59.3 CBM"
    }
  }
  ```
- **Response (201):**
  ```json
  {
    "id": "doc-uuid",
    "name": "BOL - SS-2026-0042",
    "type": "bol",
    "status": "draft",
    "version": 1,
    "previewUrl": "/api/documents/doc-uuid/preview",
    "downloadUrl": "/api/documents/doc-uuid/download"
  }
  ```
- **Error responses:**
  - 400: `{ "error": "missing_required_fields", "fields": ["shipper", "consignee"] }`

### PUT /api/documents/:id
- **Description:** Update document status or content.
- **Authentication required:** Yes (admin/editor for approve/filed status)
- **Request body:**
  ```json
  {
    "status": "approved",
    "notes": "Reviewed and approved for filing",
    "filingReference": null
  }
  ```
- **Response (200):**
  ```json
  {
    "id": "doc-uuid",
    "status": "approved",
    "version": 2,
    "updatedAt": "2026-03-26T14:00:00Z"
  }
  ```
- **Error responses:**
  - 400: `{ "error": "invalid_transition", "message": "Cannot approve a document in Draft status. Submit for review first." }`
  - 403: `{ "error": "forbidden", "message": "Only admin/editor can approve documents" }`

### GET /api/documents/:id/preview
- **Description:** Get PDF preview of document.
- **Authentication required:** Yes
- **Response (200):** PDF binary stream.

### GET /api/documents/:id/versions
- **Description:** Get version history for a document.
- **Authentication required:** Yes
- **Response (200):**
  ```json
  {
    "versions": [
      { "version": 2, "savedBy": "Blake Johnson", "savedAt": "2026-03-18T14:00:00Z", "changes": "Updated consignee address" },
      { "version": 1, "savedBy": "Blake Johnson", "savedAt": "2026-03-15T10:00:00Z", "changes": "Initial generation" }
    ]
  }
  ```

## Data Requirements
- **Database tables read/written:**
  - `shipment_documents` (read/write) — id, orgId, shipmentId, type, name, status, version, fileUrl, fields (JSONB), createdBy, createdAt, updatedAt
  - `document_versions` (read/write) — documentId, version, fields (JSONB), fileUrl, savedBy, savedAt, changes
  - `document_templates` (read, static) — type, name, description, requiredFields, optionalFields, layout
  - `shipments` (read) — for pre-filling template fields
- **External data sources:** Vercel Blob or S3 for PDF file storage. @react-pdf/renderer for server-side PDF generation.
- **Caching strategy:** Document list cached 1 minute per org. Template list cached indefinitely (static). PDF previews cached at CDN with document version in cache key. Version history cached 5 minutes.

## Component Breakdown
- **Server Components:** `DocumentCenterPage` (layout, initial data fetch), `TemplateGrid` (static template list).
- **Client Components:** `DocumentTable`, `TemplateCard`, `DocumentGenerator` (form for template fields), `DocumentPreview` (PDF viewer), `DocumentUploader`, `StatusPipeline` (visual status indicator), `VersionHistory`, `DocumentFilters`, `BulkActionBar`, `ShipmentGroupView`.
- **Shared components used:** `Table`, `Card`, `Badge`, `Button`, `Modal`, `FileUpload`, `Select`, `Input`, `Tabs`, `Skeleton`, `Toast`.
- **New components needed:** `TemplateCard`, `DocumentGenerator`, `DocumentPreview`, `StatusPipeline`, `VersionHistory`, `ShipmentGroupView`.

## Acceptance Criteria
- [ ] Template grid shows all 6 document templates with descriptions
- [ ] "Generate" creates a new document pre-filled from shipment data
- [ ] Generated PDF renders correctly with all filled fields
- [ ] Upload accepts PDF, PNG, JPG files up to 25MB
- [ ] Document status pipeline: Draft -> Review -> Approved -> Filed works correctly
- [ ] Only admin/editor roles can Approve or mark as Filed
- [ ] Rejection sends document back to Draft with reason displayed
- [ ] Version history tracks all saves with author and timestamp
- [ ] Previous versions can be previewed and restored
- [ ] PDF preview renders inline without download
- [ ] "By Shipment" tab groups documents by shipment with completeness indicator
- [ ] Search filters documents by name and shipment reference
- [ ] Status filter counts are accurate
- [ ] Empty states show appropriate messages with CTAs
- [ ] Mobile view uses card layout and full-screen preview modal
- [ ] Template generation completes in < 3 seconds

## Dependencies
- **This page depends on:** Authentication (PRD-APP-01) with role-based access. Shipment data (PRD-APP-09/10) for pre-filling templates. File storage service (Vercel Blob/S3). PDF generation library (@react-pdf/renderer).
- **Pages that depend on this:** Shipment Detail (PRD-APP-10) shows documents tab linked to this center. Compliance Center (PRD-APP-13) "File ISF" action links here. Knowledge Base (PRD-APP-14) links to document guides.
