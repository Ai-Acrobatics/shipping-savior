# PRD: AI Compliance Center

## Overview
- **Purpose:** Centralized compliance monitoring hub that tracks regulatory deadlines, tariff changes, filing requirements, and customs alerts. Proactively surfaces compliance risks before they become costly problems (demurrage, penalties, seizures).
- **User persona:** Compliance officers ensuring all filings are on time, operations managers monitoring customs clearance, importers tracking regulatory changes that affect their cost structure.
- **Entry points:** Main navigation "Compliance" link, dashboard compliance alert notifications, alert badges in header, direct URL `/compliance`.

## Page Layout

### Desktop (1280px+)
- **Top bar:** Page title "Compliance Center" with filter controls: severity dropdown (All, Critical, Warning, Info), status dropdown (All, Open, Acknowledged, Resolved), date range.
- **Left column (65%):** Alert feed — scrollable list of compliance notifications, most recent first. Each alert is an expandable card with severity indicator, title, description, affected shipment(s), and action buttons.
- **Right column (35%, sticky):**
  - ISF filing countdown section: list of upcoming ISF deadlines with countdown timers
  - Expiring bonds section: customs bonds approaching expiration
  - Quick stats: Open alerts count, overdue alerts count, resolved this week
- **Below fold:** Tariff change notifications section (from Federal Register monitoring). Resolution history table.

### Tablet (768px-1279px)
- Alert feed full-width. Right column content moves to horizontal cards above feed. Filters as expandable drawer.

### Mobile (< 768px)
- Severity filter as pills at top. Alert feed as full-width cards. ISF countdowns as priority section above alerts. Quick stats in collapsible header.

## Features & Functionality

### Feature: Alert Feed
- **Description:** Real-time list of compliance-related notifications with severity coding and resolution workflow.
- **Alert severities:**
  - **Critical (red):** Immediate action required. Examples: ISF deadline in < 6 hours, customs bond expired, FDA hold on shipment, AD/CVD duty assessment received.
  - **Warning (amber):** Action needed soon. Examples: ISF deadline in 24-48 hours, bond expiring in 30 days, tariff change affecting active shipments, documentation incomplete.
  - **Info (blue):** Awareness only. Examples: new Federal Register notice relevant to user's HTS codes, general tariff change announcement, compliance best practice reminder.
- **Alert card contents:**
  - Severity badge (color-coded)
  - Title (concise, actionable: "ISF Filing Due in 18 Hours for SS-2026-0042")
  - Description (1-2 sentences explaining the issue)
  - Affected shipment reference(s) (clickable links to shipment detail)
  - Affected HTS code(s) (clickable links to HTS lookup)
  - Timestamp (when alert was generated)
  - Action buttons: Acknowledge, Investigate, Resolve, Dismiss
- **User interaction flow:**
  1. Alerts appear in feed in reverse chronological order
  2. Critical alerts auto-surface at top regardless of sort
  3. User clicks alert to expand details
  4. User clicks action button to update status
  5. Status changes: Open -> Acknowledged -> Investigating -> Resolved
  6. Resolved alerts move to history
- **Edge cases:**
  - 100+ open alerts: pagination with "Load more" button. Sticky count at top.
  - Alert for deleted shipment: show alert with note "Associated shipment no longer exists"
  - Duplicate alerts (same issue, same shipment): auto-merge with "Updated" timestamp

### Feature: ISF Filing Countdown Timers
- **Description:** Countdown timers for Importer Security Filing (ISF/10+2) deadlines. ISF must be filed 24 hours before vessel departure from foreign port.
- **Details:**
  - List of upcoming ISF deadlines, sorted by urgency
  - Each entry: shipment reference, vessel departure date/time, countdown (HH:MM:SS for < 24h, days for longer)
  - Color coding: green (>48h), yellow (24-48h), red (<24h), blinking red (<6h)
  - "File ISF" action button links to Document Center with ISF template
  - "Mark as Filed" action when ISF has been submitted
- **Edge cases:**
  - ISF already filed: show as "Filed" with green checkmark
  - Deadline passed without filing: critical alert generated automatically
  - Vessel departure date changes: countdown updates automatically

### Feature: Expiring Customs Bonds Alert
- **Description:** Monitor customs bond expiration dates and alert before they expire.
- **Details:**
  - Annual customs bonds: alert 60 days, 30 days, and 7 days before expiration
  - Single-entry bonds: alert when new shipment needs a bond
  - Bond details: bond number, surety company, coverage amount, expiration date
  - "Renew Bond" action links to external surety website or broker contact
- **Edge cases:** No bonds on file: show informational card "Add your customs bond information in Settings to enable expiration alerts."

### Feature: Tariff Change Notifications
- **Description:** Monitor the Federal Register for tariff-related changes that affect the user's HTS codes and trade lanes.
- **Sources monitored:**
  - Federal Register API (daily): CBP, USTR, Commerce, USITC notices
  - Section 301 tariff modifications
  - AD/CVD preliminary and final determinations
  - HTS schedule revisions
  - Trade agreement modifications
- **Alert details:**
  - Federal Register document number and title
  - Effective date
  - Affected HTS codes (matched against user's trade preferences and shipment history)
  - Summary of change (generated by AI from notice text)
  - Link to full Federal Register notice
  - Impact assessment: estimated cost change per unit for affected products
- **Edge cases:**
  - Change affects codes user doesn't use: filter out (only show relevant changes)
  - Retroactive changes: highlight with "Retroactive to [date]" warning
  - Multiple changes to same code: consolidated alert with timeline

### Feature: FDA Import Alerts (Cold Chain)
- **Description:** For cold chain/reefer shipments, monitor FDA import alerts and detention without physical examination (DWPE) lists.
- **Details:**
  - FDA Import Alert list matched against user's product categories and origin countries
  - Alert: product type, origin country, FDA alert number, detention reason
  - Recommendation: required documentation, testing requirements, prior notice requirements
- **Edge cases:** No cold chain shipments: section hidden. FDA alert list unavailable: show "Unable to check FDA alerts. Verify at fda.gov."

### Feature: Compliance Checklist per Shipment
- **Description:** Pre-flight checklist of compliance requirements for each active shipment.
- **Checklist items (per shipment):**
  - [ ] ISF filed (24h before departure)
  - [ ] Customs bond active and sufficient
  - [ ] HTS classification verified
  - [ ] Country of origin correctly declared
  - [ ] Commercial invoice matches BOL
  - [ ] Packing list complete
  - [ ] FDA prior notice (if applicable)
  - [ ] Fumigation certificate (if required)
  - [ ] AD/CVD deposit calculated (if applicable)
  - [ ] Section 301 duty applicable (if China origin)
- **Auto-populated:** Some items auto-check based on document uploads and shipment data. Others require manual verification.
- **Edge cases:** New shipment with no data: all items unchecked. Shipment already delivered: checklist read-only.

### Feature: Resolution Workflow
- **Description:** Track the lifecycle of compliance alerts from identification to resolution.
- **Statuses:**
  1. **Open** — Alert generated, no action taken
  2. **Acknowledged** — Team member has seen and taken ownership
  3. **Investigating** — Actively working on resolution
  4. **Resolved** — Issue addressed, documented
  5. **Dismissed** — False positive or not applicable (with reason)
- **User interaction flow:**
  1. Click status button on alert card
  2. Modal with: new status selection, assignee (team member), notes field, resolution details (if resolving)
  3. Status change logged with timestamp and user
  4. Resolution history visible in alert detail
- **Edge cases:** Reassignment: alert can be reassigned to different team member. Escalation: unresolved critical alerts auto-escalate after 4 hours.

## Usability Requirements
- **Accessibility (WCAG 2.1 AA):** Severity colors accompanied by icons and text labels (not color alone). Countdown timers have `aria-live="polite"` for screen reader announcements at key thresholds. Alert feed uses semantic list. Action buttons have descriptive labels.
- **Keyboard navigation:** Tab through filter controls, alert cards, sidebar sections. Enter expands alert details. Shortcut keys: A (acknowledge), R (resolve), D (dismiss) when alert is focused.
- **Loading states:** Alert feed: skeleton cards. Countdown timers: skeleton with "Calculating..." ISF section: skeleton list.
- **Error states:** Federal Register API down: "Tariff monitoring temporarily unavailable. Alerts based on cached data." Alert save failure: "Unable to update alert. Try again."
- **Empty states:** No open alerts: green checkmark illustration + "All clear! No compliance issues detected." Per category: "No ISF deadlines upcoming" / "No expiring bonds."
- **Performance targets:** LCP < 2.0s. Alert feed loads < 1s. Countdown timers update in real-time (1s interval). New alerts appear within 60s of generation (polling or SSE).

## API Endpoints

### GET /api/compliance/alerts
- **Description:** Fetch compliance alerts with filtering.
- **Authentication required:** Yes
- **Request parameters:**
  - `severity` (string, optional): "critical" | "warning" | "info"
  - `status` (string, optional): "open" | "acknowledged" | "investigating" | "resolved" | "dismissed"
  - `shipmentId` (string, optional): filter to specific shipment
  - `type` (string, optional): "isf_deadline" | "bond_expiry" | "tariff_change" | "fda_alert" | "documentation" | "customs_hold"
  - `page` (number, optional, default 1)
  - `limit` (number, optional, default 25)
- **Response (200):**
  ```json
  {
    "alerts": [
      {
        "id": "alert-uuid",
        "type": "isf_deadline",
        "severity": "critical",
        "status": "open",
        "title": "ISF Filing Due in 18 Hours for SS-2026-0042",
        "description": "Importer Security Filing must be submitted before vessel departure at 2026-03-27 06:00 UTC.",
        "shipments": [
          { "id": "ship-uuid", "reference": "SS-2026-0042" }
        ],
        "htsCodes": [],
        "deadline": "2026-03-27T06:00:00Z",
        "createdAt": "2026-03-26T12:00:00Z",
        "assignee": null,
        "resolution": null
      }
    ],
    "counts": {
      "open": 8,
      "critical": 2,
      "warning": 4,
      "info": 2
    },
    "pagination": { "page": 1, "limit": 25, "total": 8 }
  }
  ```
- **Rate limiting:** 60 requests per minute.

### PATCH /api/compliance/alerts/:id
- **Description:** Update alert status (acknowledge, resolve, dismiss).
- **Authentication required:** Yes (admin or editor)
- **Request body:**
  ```json
  {
    "status": "resolved",
    "assignee": "user-uuid",
    "notes": "ISF filed via customs broker. Confirmation #CF-12345.",
    "resolution": {
      "action": "ISF filed on time",
      "resolvedAt": "2026-03-26T14:00:00Z"
    }
  }
  ```
- **Response (200):**
  ```json
  {
    "id": "alert-uuid",
    "status": "resolved",
    "updatedAt": "2026-03-26T14:00:00Z",
    "updatedBy": "Blake Johnson"
  }
  ```
- **Error responses:**
  - 400: `{ "error": "invalid_transition", "message": "Cannot resolve an alert that hasn't been acknowledged" }`

### GET /api/compliance/isf-deadlines
- **Description:** Get upcoming ISF filing deadlines with countdown data.
- **Authentication required:** Yes
- **Response (200):**
  ```json
  {
    "deadlines": [
      {
        "shipmentId": "ship-uuid",
        "shipmentReference": "SS-2026-0042",
        "vesselDeparture": "2026-03-27T06:00:00Z",
        "isfDeadline": "2026-03-26T06:00:00Z",
        "isfFiled": false,
        "hoursRemaining": 18.5,
        "urgency": "critical"
      }
    ]
  }
  ```

### GET /api/compliance/tariff-changes
- **Description:** Get recent tariff change notifications from Federal Register monitoring.
- **Authentication required:** Yes
- **Request parameters:**
  - `since` (ISO date, optional, default 30 days ago)
  - `relevantOnly` (boolean, optional, default true): filter to user's HTS codes
- **Response (200):**
  ```json
  {
    "changes": [
      {
        "id": "tc-uuid",
        "source": "federal_register",
        "documentNumber": "2026-06543",
        "title": "Modification of Section 301 Tariffs on Certain Products from China",
        "agency": "USTR",
        "publishedDate": "2026-03-20",
        "effectiveDate": "2026-04-15",
        "summary": "Additional 25% duty on HTS codes 6402-6405 (footwear) from China effective April 15, 2026.",
        "affectedCodes": ["6402", "6403", "6404", "6405"],
        "userImpact": {
          "affectedShipments": 3,
          "estimatedCostIncrease": 12500,
          "affectedProducts": ["Men's athletic shoes", "Women's sandals"]
        },
        "federalRegisterUrl": "https://www.federalregister.gov/documents/2026/03/20/2026-06543/..."
      }
    ]
  }
  ```

## Data Requirements
- **Database tables read/written:**
  - `compliance_alerts` (read/write) — id, orgId, type, severity, status, title, description, shipmentIds, htsCodes, deadline, assignee, resolution (JSONB), createdAt, updatedAt
  - `shipments` (read) — for ISF deadlines, shipment references
  - `tariff_changes` (read/write) — id, source, documentNumber, title, agency, publishedDate, effectiveDate, summary, affectedCodes (JSONB), federalRegisterUrl, createdAt
  - `organizations` (read) — for customs bond info
  - `user_preferences` (read) — for HTS code interests and trade lanes (to filter relevant alerts)
- **External data sources:**
  - Federal Register API (daily monitoring for trade-related notices)
  - FDA Import Alert database (weekly scrape)
  - CBP AD/CVD database (weekly check for new orders)
  - Carrier APIs (for vessel departure times feeding ISF deadlines)
- **Caching strategy:** Alert list cached 1 minute per org. Tariff changes cached 1 hour. ISF deadlines calculated real-time from shipment data. Federal Register data cached 24 hours.

## Component Breakdown
- **Server Components:** `CompliancePage` (layout, initial alert fetch).
- **Client Components:** `AlertFeed`, `AlertCard`, `AlertDetailModal`, `SeverityBadge`, `StatusSelector`, `ISFCountdownList`, `ISFCountdownTimer`, `BondExpiryList`, `TariffChangeList`, `TariffChangeCard`, `ComplianceChecklist`, `ResolutionModal`, `AlertFilters`, `QuickStats`.
- **Shared components used:** `Card`, `Badge`, `Button`, `Select`, `Modal`, `Tooltip`, `Skeleton`, `Table`, `DatePicker`.
- **New components needed:** `AlertCard`, `AlertDetailModal`, `SeverityBadge`, `ISFCountdownTimer`, `TariffChangeCard`, `ComplianceChecklist`, `ResolutionModal`, `QuickStats`.

## Acceptance Criteria
- [ ] Alert feed displays alerts sorted by severity (critical first) then by date
- [ ] Severity badges are color-coded with accompanying icons and text
- [ ] Filters by severity, status, and type work correctly
- [ ] ISF countdown timers show accurate time remaining and update in real-time
- [ ] ISF countdowns change color at threshold points (>48h green, 24-48h yellow, <24h red)
- [ ] Bond expiry alerts trigger at 60, 30, and 7 days before expiration
- [ ] Tariff change notifications match against user's HTS codes and trade preferences
- [ ] Federal Register links open correct notices
- [ ] Resolution workflow transitions: Open -> Acknowledged -> Investigating -> Resolved
- [ ] Resolved alerts move to history and no longer appear in active feed
- [ ] Compliance checklist per shipment shows correct requirements
- [ ] Auto-check items based on uploaded documents and shipment data
- [ ] FDA alerts appear for cold chain shipments from affected origins
- [ ] Critical alerts auto-escalate if unresolved after 4 hours
- [ ] Empty state shows "All clear" when no open alerts
- [ ] New alerts appear within 60 seconds via polling

## Dependencies
- **This page depends on:** Authentication (PRD-APP-01). Shipment data (PRD-APP-09/10) for ISF deadlines and compliance checklists. HTS data (PRD-APP-03) for tariff change matching. User preferences (PRD-APP-02) for relevance filtering. Federal Register API integration. FDA alert database.
- **Pages that depend on this:** Executive Dashboard (PRD-APP-08) shows compliance alert count. Shipment Detail (PRD-APP-10) links from compliance-related alerts. Document Center (PRD-APP-15) receives "File ISF" navigation from countdown timers.
