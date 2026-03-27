# Shipping Savior — Product Roadmap: Detailed Feature Specifications

**Linear:** AI-5456
**Phase:** 2 — Planning
**Last Updated:** 2026-03-27
**Status:** Planning Complete — Ready for Engineering Review
**Author:** AI Acrobatics Engineering
**Companion Document:** [PRODUCT-ROADMAP.md](./PRODUCT-ROADMAP.md) — strategic framework, RICE scores, milestones

---

## Table of Contents

1. [Document Purpose](#1-document-purpose)
2. [Authentication & Session Management](#2-authentication--session-management)
3. [Onboarding Wizard](#3-onboarding-wizard)
4. [HTS Lookup & Classification](#4-hts-lookup--classification)
5. [Landed Cost Calculator](#5-landed-cost-calculator)
6. [Container Utilization Calculator](#6-container-utilization-calculator)
7. [FTZ Savings Analyzer](#7-ftz-savings-analyzer)
8. [Route Comparison Tool](#8-route-comparison-tool)
9. [Executive Dashboard](#9-executive-dashboard)
10. [Shipment List & Detail](#10-shipment-list--detail)
11. [Document Upload & Processing](#11-document-upload--processing)
12. [Container Tracking](#12-container-tracking)
13. [Alerts & Notifications](#13-alerts--notifications)
14. [HTS Classification AI Agent](#14-hts-classification-ai-agent)
15. [Document Intelligence AI Engine](#15-document-intelligence-ai-engine)
16. [A/B Testing Plan](#16-ab-testing-plan)
17. [Analytics & Instrumentation Requirements](#17-analytics--instrumentation-requirements)
18. [Accessibility Requirements](#18-accessibility-requirements)
19. [Performance Budgets](#19-performance-budgets)

---

## 1. Document Purpose

This document provides engineering-ready specifications for every feature in the Shipping Savior platform. For each feature it defines:

- **Acceptance criteria** — binary pass/fail tests that confirm "done"
- **UX/design requirements** — layout, component behavior, responsive rules
- **Technical dependencies** — services, APIs, libraries, other features
- **A/B testing hooks** — experiment flags and success metrics
- **Analytics instrumentation** — events to fire and properties to capture
- **Accessibility requirements** — WCAG 2.1 AA checklist per feature
- **Performance budget** — LCP, FID, CLS targets per page

Features are ordered by MVP sprint priority (P0 first, then P1, then Phase 2, then Phase 3).

---

## 2. Authentication & Session Management

**Feature ID:** F-001 through F-004
**Sprint:** 1
**Priority:** P0 (required for all subsequent features)
**PRD Reference:** `/planning/prds/full-app/full-app/PRD-APP-01-auth.md`

### Acceptance Criteria

- [ ] User can register with email, full name, company name, and password
- [ ] Verification email sent within 60 seconds of registration
- [ ] User cannot log in until email is verified
- [ ] Verified user can log in and receive JWT httpOnly cookies (access + refresh)
- [ ] Access token expires after 15 minutes and auto-refreshes using refresh token
- [ ] Refresh token rotates on each use (old token invalidated)
- [ ] Account locks after 5 failed login attempts within 15 minutes
- [ ] Locked account shows exact lockout duration remaining
- [ ] Password reset flow works end-to-end (request → email → new password)
- [ ] Reset tokens are single-use and expire after 1 hour
- [ ] Logout clears all cookies and invalidates refresh token in database
- [ ] User is redirected to originally requested URL after login (via `callbackUrl` query param)
- [ ] "Remember me" checkbox extends refresh token to 30 days (default: session-only)
- [ ] Disposable email domains are blocked at registration
- [ ] Duplicate email shows helpful error (no enumeration on login/reset)
- [ ] Registration creates organization with 14-day trial of Professional plan
- [ ] SSO buttons visible but disabled with "Coming Soon" tooltip
- [ ] All auth pages pass WCAG 2.1 AA automated checks

### UX / Design Requirements

**Login page (`/login`):**
- Centered card (max-width: 448px) on full-bleed background
- Logo (48px height) centered above card
- Form: email field → password field → "Remember me" checkbox → submit button
- "Forgot password?" link below password field (right-aligned)
- Social login dividers below submit: "— or —" + disabled Google/Microsoft buttons
- "Don't have an account? Sign up" link at bottom of card
- Error banner above form fields for server errors
- Field-level inline errors below each input on blur

**Register page (`/register`):**
- Desktop: Two-column layout. Left (48%): value prop bullets + trust badges. Right (52%): registration form
- Mobile: Single column. Value prop collapsed to 3-bullet summary above form
- Fields: Full name, Work email, Company name, Password, Confirm password, Terms checkbox
- Password strength meter: 4-segment bar (red → orange → yellow → green) with label text
- Submit button: "Create Account →"
- "Already have an account? Log in" link below button

**Password reset pages:**
- `/reset-password`: Centered card. Email input + submit. Always show success message regardless of email existence.
- `/reset-password/confirm`: Two-field card (new password + confirm). Progress indicator "Step 2 of 2."

**Component list:**
- `<AuthCard>` — Container with logo, heading, form slot
- `<LoginForm>` — Email, password, remember me, submit
- `<RegisterForm>` — All registration fields + strength meter
- `<ResetPasswordForm>` — Email input (request) or password fields (confirm)
- `<PasswordStrengthMeter>` — 4-segment real-time indicator
- `<SocialLoginButtons>` — Google/Microsoft buttons, disabled state with tooltip
- `<AuthDivider>` — "— or —" separator

### Technical Dependencies

- **NextAuth v5** with Credentials provider
- **bcrypt** (password hashing, cost factor 12)
- **Neon PostgreSQL** via Drizzle ORM — tables: `users`, `organizations`, `sessions`, `password_resets`, `login_attempts`
- **Resend** (or SendGrid) — verification email + password reset email templates
- **Vercel KV** (or Redis) — rate limit counters for login attempts and registrations
- **nanoid** — token generation for email verification and password reset
- **zod** — input validation schemas
- No dependencies on other features (all other features depend on this)

### A/B Testing Hooks

See Section 16 for full A/B plan. Auth-specific experiment flags:
- `auth.register_layout` — Two-column vs. single-column registration page
- `auth.trial_length` — 14-day vs. 21-day trial for cohort comparison
- `auth.onboarding_prompt` — Inline onboarding prompt vs. dedicated page after registration

### Analytics Events

See Section 17 for full schema. Auth-specific events:
- `auth.register_started` — User lands on `/register`
- `auth.register_completed` — Registration form submitted successfully
- `auth.email_verified` — User clicks verification link
- `auth.login_success` — Successful login
- `auth.login_failed` — Failed login attempt (property: `reason`)
- `auth.password_reset_requested` — Reset email sent
- `auth.password_reset_completed` — New password set

### Accessibility Requirements

- All inputs have associated `<label>` elements (not placeholder-only)
- Error messages linked to inputs via `aria-describedby`
- Focus auto-set to first field on page load
- Focus moves to first error field on validation failure
- Submit button announces loading state to screen readers (`aria-busy="true"`)
- Password fields have show/hide toggle with `aria-label="Show password"`
- Color is never the sole error indicator (icon + border + text)
- Minimum 4.5:1 contrast on all text and icons
- Full keyboard navigation with logical tab order
- "Forgot password?" link accessible via keyboard

### Performance Budget

| Page | LCP | FID | CLS | JS Bundle |
|------|-----|-----|-----|-----------|
| `/login` | < 1.5s | < 50ms | < 0.05 | < 80KB |
| `/register` | < 1.5s | < 50ms | < 0.05 | < 90KB |
| `/reset-password` | < 1.5s | < 50ms | < 0.05 | < 70KB |

---

## 3. Onboarding Wizard

**Feature ID:** F-003
**Sprint:** 1
**Priority:** P0
**PRD Reference:** `/planning/prds/full-app/full-app/PRD-APP-02-onboarding.md`

### Acceptance Criteria

- [ ] Wizard activates automatically after email verification (redirect to `/onboarding`)
- [ ] Wizard has exactly 5 steps with a persistent progress bar
- [ ] Step 1: User selects primary role (Importer / Freight Broker / FTZ Operator / Other)
- [ ] Step 2: User selects primary workflow (HTS classification / Landed cost / FTZ modeling / Route comparison)
- [ ] Step 3: User provides company details (country of operation, typical shipment volume, primary origin country)
- [ ] Step 4: Platform demo — interactive preview of the primary workflow they selected
- [ ] Step 5: Confirmation with "Go to Dashboard" CTA
- [ ] "Skip for now" link on every step (skips to dashboard; wizard can be resumed from settings)
- [ ] Wizard progress persists across sessions (not lost on browser close)
- [ ] Completion event fires analytics event `onboarding.completed`
- [ ] Skipped users are tracked with `onboarding.skipped` at the step they left

### UX / Design Requirements

- Full-page wizard layout (no sidebar, no top nav — focused experience)
- Progress bar at top: 5 dots + connecting line, filled dots for completed steps
- Step number label: "Step 2 of 5" above heading
- Each step max width: 600px centered
- Step transitions: horizontal slide animation (200ms ease-in-out)
- Back button on steps 2–5
- "Skip for now" text link (not a button) — bottom left of card
- Primary CTA button always right-aligned

**Step 4 (demo) special behavior:**
- If role = Importer: show Landed Cost Calculator pre-filled with sample data (Vietnamese garment, $12,000 CIF, HTS 6204.42.30)
- If role = Broker: show Route Comparison pre-filled (Shenzhen → Los Angeles, 1x40HC)
- If role = FTZ Operator: show FTZ Savings Analyzer with sample FTZ scenario
- Demo is fully interactive — users can modify inputs and see real outputs

### Technical Dependencies

- Auth (F-001) — must be logged in
- HTS lookup (F-005) — for Importer demo step
- Route comparison (F-014) — for Broker demo step
- FTZ Analyzer (F-008) — for Zone Manager demo step
- Wizard progress stored in `users.onboardingStep` (int, 0–5) in PostgreSQL

### Analytics Events

- `onboarding.step_viewed` — property: `step` (1–5)
- `onboarding.role_selected` — property: `role`
- `onboarding.workflow_selected` — property: `workflow`
- `onboarding.demo_interacted` — property: `calculator`, `inputsModified` (bool)
- `onboarding.completed`
- `onboarding.skipped` — property: `at_step` (1–5)
- `onboarding.resumed` — user returned to finish wizard

### Accessibility Requirements

- Each step is a single `<section>` with a visible heading (`h1`)
- Progress bar uses `<nav aria-label="Onboarding progress">` with step labels
- Active step marked with `aria-current="step"`
- Role selection uses `<fieldset>` + `<legend>` + radio buttons (not styled divs)
- Back/Skip/Continue buttons have clear `aria-label` attributes

### Performance Budget

| Page | LCP | FID | CLS |
|------|-----|-----|-----|
| `/onboarding` | < 2.0s | < 100ms | < 0.1 |

---

## 4. HTS Lookup & Classification

**Feature ID:** F-005, F-006
**Sprint:** 3
**Priority:** P0
**PRD Reference:** `/planning/prds/full-app/full-app/PRD-APP-03-hts-lookup.md`

### Acceptance Criteria

- [ ] Search field accepts free-text product descriptions and returns ranked results in < 500ms
- [ ] Search returns results from all 17,000+ USITC HTS codes
- [ ] Each result shows: HTS code (10-digit), description, MFN rate, special rate, country-specific rate
- [ ] Clicking a result opens detail view with full rate table (all countries of origin)
- [ ] Detail view shows current rate effective date and "rates may change" disclaimer
- [ ] Link to CBP binding ruling search (CROSS) for each code
- [ ] User can save HTS codes to "My Codes" library (requires auth)
- [ ] Saved codes persist across sessions
- [ ] Table view allows filtering by Chapter (2-digit), Heading (4-digit), Subheading (6-digit)
- [ ] Table view shows 50 results per page with pagination
- [ ] Search result relevance: exact code match ranked first, then keyword match
- [ ] Dataset date displayed in footer with link to USITC source
- [ ] Country-specific rate selector: dropdown of top 20 import origin countries

### UX / Design Requirements

**Layout:**
- Desktop: Two-column. Left 35%: search + filters sidebar. Right 65%: results table or detail view.
- Mobile: Single column. Filters in collapsible accordion above results.

**Search input:**
- Prominent search bar at top (full width on mobile, 100% width in left panel on desktop)
- Placeholder: "Search by product description or HTS code..."
- Keyboard shortcut: `Cmd+K` / `Ctrl+K` opens search from anywhere in the app
- Live results below input as user types (debounced 200ms)
- Search result item: HTS code (bold) + truncated description + MFN rate badge

**Results table columns:**
- HTS Code (sortable, fixed width 140px)
- Description (flexible, truncated with tooltip)
- MFN Rate (sortable, 80px)
- Special Rate (80px)
- Selected Origin Rate (sortable, 80px)
- Actions: Save / View Detail (icon buttons)

**Detail panel:**
- Slide-in panel (right side on desktop, full-page on mobile)
- Header: 10-digit code + description
- Rate table: all origin countries with effective dates
- "Used in X calculations" badge (from saved calculations)
- CROSS link button: "Search CBP Rulings →"
- Copy code button (copies HTS code to clipboard)

### Technical Dependencies

- USITC HTS JSON dataset (downloaded and parsed at build time or via scheduled job)
- **Fuse.js** (client-side fuzzy search over pre-indexed dataset)
- **@tanstack/react-table** (table rendering with sorting/pagination)
- **decimal.js** (duty rate arithmetic, prevents floating-point drift)
- PostgreSQL — `user_hts_codes` table (saves/favorites per user)
- No external API dependency at runtime (dataset cached in-app)
- AI Classification Agent (F-201, Phase 3) — extends this feature with AI suggestions

### A/B Testing Hooks

- `hts.search_placement` — Search bar at top vs. search bar prominently in left sidebar

### Analytics Events

- `hts.search_performed` — property: `query` (anonymized/hashed), `results_count`
- `hts.code_viewed` — property: `hts_code`, `source` (search | browse | direct)
- `hts.code_saved` — property: `hts_code`
- `hts.code_used_in_calc` — property: `hts_code`, `calculator_type`
- `hts.export_clicked` — property: `hts_code`

### Accessibility Requirements

- Search input has `role="combobox"`, results have `role="listbox"` with `role="option"` per item
- Keyboard: arrow keys navigate results, Enter selects, Escape closes
- Table has proper `<thead>`, `<tbody>`, `<th scope="col">` structure
- Sortable columns indicate sort direction via `aria-sort`
- Detail panel announced to screen readers via `aria-live="polite"` or focus management

### Performance Budget

| Page | LCP | FID | CLS | Search Latency |
|------|-----|-----|-----|----------------|
| `/app/hts-lookup` | < 2.0s | < 100ms | < 0.1 | < 500ms p95 |

---

## 5. Landed Cost Calculator

**Feature ID:** F-006
**Sprint:** 3
**Priority:** P0
**PRD Reference:** `/planning/prds/full-app/full-app/PRD-APP-04-landed-cost.md`

### Acceptance Criteria

- [ ] Calculator accepts: product description, HTS code (or lookup), country of origin, CIF value, freight cost, unit quantity
- [ ] Calculator outputs all 15+ cost components itemized
- [ ] Required components: import duty, MPF (0.3464% of customs value, min $32.71, max $641.15), HMF (0.125%), ISF bond, customs broker fee, destination charge, drayage/inland freight, demurrage risk estimate, warehouse transfer, cargo insurance, port exam fee (if flagged), Section 301 tariff (if applicable), AD/CVD assessment (if applicable)
- [ ] "Hidden cost" warnings flag items users typically miss (demurrage, port exam risk)
- [ ] Total landed cost displayed prominently with cost-per-unit and cost-as-%-of-MSRP
- [ ] User can adjust any input and calculator recalculates instantly (< 50ms)
- [ ] All arithmetic uses decimal.js (no floating-point errors on duty rate × value calculations)
- [ ] PDF export includes all inputs, all 15 cost components, totals, and source citations for each rate
- [ ] Calculation can be saved to user account with custom name and notes
- [ ] Saved calculations appear in "My Calculations" history
- [ ] "Compare" mode: run two scenarios side-by-side (e.g., US vs. Vietnam origin)
- [ ] Section 301/232/201 tariff flag with current rate and date enacted

### UX / Design Requirements

**Layout:**
- Desktop: Two-column. Left (40%): input form. Right (60%): live results panel.
- Tablet: Stacked. Inputs above, results below.
- Mobile: Single column. Results scroll below inputs. "Jump to results" anchor link.

**Input form:**
- Section 1: Product (HTS code field with inline search, product description, country of origin dropdown, CIF value)
- Section 2: Freight & Logistics (freight cost, Incoterms selector, destination port, delivery address)
- Section 3: Advanced Options (cargo insurance %, customs broker fee type, warehouse fee, deductible demurrage estimate)
- Each section collapsible with expand/collapse arrow

**Results panel:**
- Sticky on desktop (stays visible while scrolling inputs)
- Top summary card: "Total Landed Cost: $X,XXX.XX" (large font, primary color)
- Cost per unit: "Per Unit: $XX.XX"
- Landed-to-MSRP ratio: "X.X× your MSRP" (if MSRP entered)
- Itemized cost table: line item name | rate/basis | amount | % of total
- "Hidden cost" items highlighted with amber warning icon
- Section 301 tariff row highlighted in red if applicable
- "Export PDF" and "Save Calculation" buttons below results

### Technical Dependencies

- HTS lookup (F-005) — inline code lookup within calculator
- **decimal.js** — all monetary arithmetic
- **@react-pdf/renderer** — PDF generation
- USITC HTS dataset — for duty rate lookup
- Section 301 tariff dataset (USTR published JSON, refreshed quarterly)
- AD/CVD dataset (CBP published, monthly refresh)
- MPF/HMF rates hardcoded with effective dates, updated via env variable when CBP changes

### A/B Testing Hooks

- `landed_cost.input_layout` — Tabbed inputs (Section 1/2/3 as tabs) vs. long-form scroll
- `landed_cost.hidden_cost_presentation` — Separate "Hidden Costs" section vs. inline warnings
- `landed_cost.compare_mode_prompt` — Proactive prompt to compare origins vs. hidden behind button

### Analytics Events

- `calculator.landed_cost.started` — User opens calculator
- `calculator.landed_cost.completed` — User reaches results (all required inputs filled)
- `calculator.landed_cost.exported_pdf`
- `calculator.landed_cost.saved`
- `calculator.landed_cost.compare_opened`
- `calculator.landed_cost.section301_flagged` — property: `hts_code`, `tariff_rate`

### Accessibility Requirements

- Each input section is a `<fieldset>` with `<legend>`
- All inputs labeled, with `aria-describedby` for help text
- Calculated results region has `aria-live="polite"` — screen readers announce updates
- Results table: `<caption>` describing the table purpose
- Warning icons have `aria-label="Hidden cost — often overlooked"`
- PDF export button: `aria-label="Export calculation as PDF"`

### Performance Budget

| Page | LCP | Input → Result | PDF Export |
|------|-----|----------------|------------|
| `/app/landed-cost` | < 2.0s | < 50ms | < 3s |

---

## 6. Container Utilization Calculator

**Feature ID:** F-007
**Sprint:** 3
**Priority:** P0

### Acceptance Criteria

- [ ] Calculator accepts: product dimensions (L×W×H in cm or inches), weight per unit, units to ship
- [ ] User selects container type: 20ft Dry, 40ft Dry, 40ft HC, 20ft Reefer, 40ft Reefer
- [ ] Calculator computes: total volume (CBM), weight limit check, units per container, number of containers needed
- [ ] Volume constraint and weight constraint calculated independently; calculator uses whichever is binding
- [ ] Reefer container premium applied as $ uplift per container/day
- [ ] Output: "X units per container", "Y containers needed", "Z% container utilization"
- [ ] Cost-per-unit breakdown: freight-per-container ÷ units
- [ ] Side-by-side comparison of 20ft vs. 40ft vs. 40HC for same cargo
- [ ] "Dimensional weight" calculation for air freight comparison
- [ ] Unit system toggle: metric (cm, kg) ↔ imperial (inches, lbs)

### UX / Design Requirements

- Compact two-section layout: inputs on left, container visualization on right
- Container visualization: top-down 2D schematic showing packing utilization as a filled bar
- Color coding: green (< 80% full), amber (80–95%), red (95%+ — consider splitting)
- Comparison table below: all 3 container types side-by-side

### Technical Dependencies

- **decimal.js** — volume and weight arithmetic
- Container dimension constants (hardcoded, per ISO 668 standard)

### Analytics Events

- `calculator.container.started`
- `calculator.container.completed` — property: `container_type`, `utilization_pct`, `units_count`
- `calculator.container.reefer_selected`
- `calculator.container.comparison_viewed`

### Accessibility Requirements

- Unit toggle uses `<fieldset role="radiogroup">` with radio buttons, not a toggle switch without label
- Container visualization has text fallback (table) for screen readers
- Color-coded utilization also communicated via text label ("Good fill", "High fill", "Overfull")

### Performance Budget

| Page | LCP | Input → Result |
|------|-----|----------------|
| `/app/container-calculator` | < 2.0s | < 50ms |

---

## 7. FTZ Savings Analyzer

**Feature ID:** F-008
**Sprint:** 3
**Priority:** P0
**PRD Reference:** `/planning/prds/full-app/full-app/PRD-APP-05-ftz-modeler.md`

### Acceptance Criteria

- [ ] Calculator accepts: commodity (HTS code + description), annual import volume (units), current duty rate (auto-filled from HTS), projected duty rate (user editable), FTZ setup cost (user input or default $25,000)
- [ ] Calculator models two scenarios: PF (Production-Foreign) and GPA (General-Purpose Area) status
- [ ] NPV comparison rendered for both scenarios over 5-year horizon
- [ ] IRR calculation: break-even on FTZ setup cost vs. cumulative duty savings
- [ ] April 2025 executive order scope: flag if selected HTS chapter is in reciprocal-tariff scope (PF status election irrevocable — show red warning banner)
- [ ] Incremental withdrawal modeling: user inputs monthly withdrawal quantities; calculator shows month-by-month duty timing advantage
- [ ] FTZ Site Finder integration: list nearest 5 OFIS-listed FTZ sites by ZIP code
- [ ] Output summary: "Estimated 5-year NPV savings under PF: $XXX,XXX" with confidence range
- [ ] Export as PDF with disclaimer: "This is an estimate only. Consult a licensed customs broker."
- [ ] Calculation saved to user account

### UX / Design Requirements

- Three-tab layout: (1) Inputs → (2) PF vs. GPA Model → (3) Withdrawal Schedule
- Tab 1 inputs: Commodity, Volume, Tariff Rates, FTZ Cost, Discount Rate
- Tab 2 output: Side-by-side NPV chart (bar chart, 5-year horizon) + IRR callout box
- Tab 3 output: Month-by-month table with duty rate locked vs. projected + cumulative savings
- Red warning banner (full-width, dismissible) if PF election is irrevocable for this HTS scope
- "PF status election is irrevocable for goods in this tariff scope. Consult a customs attorney before proceeding."

### Technical Dependencies

- HTS lookup (F-005) — for duty rate auto-fill
- OFIS database (FTZ zone data, 260+ zones) — for site finder
- **recharts** — NPV bar chart
- **decimal.js** — NPV and IRR calculations
- April 2025 executive order HTS chapter scope list (hardcoded from USTR FR notice)

### A/B Testing Hooks

- `ftz.irr_prominence` — IRR displayed as primary metric vs. NPV as primary metric

### Analytics Events

- `calculator.ftz.started`
- `calculator.ftz.pf_gpa_viewed`
- `calculator.ftz.warning_shown` — property: `hts_chapter`
- `calculator.ftz.site_finder_used`
- `calculator.ftz.completed`
- `calculator.ftz.exported_pdf`

### Accessibility Requirements

- Warning banner has `role="alert"` so screen readers announce it immediately
- Tab navigation: `role="tablist"`, `role="tab"`, `role="tabpanel"` with `aria-selected`
- Charts have text alternative tables below them
- IRR percentage has a label: "Break-even in X years" as text below numeric display

### Performance Budget

| Page | LCP | Input → Result | PDF Export |
|------|-----|----------------|------------|
| `/app/ftz-modeler` | < 2.5s | < 200ms | < 4s |

---

## 8. Route Comparison Tool

**Feature ID:** F-014
**Sprint:** 3
**Priority:** P1
**PRD Reference:** `/planning/prds/full-app/full-app/PRD-APP-06-route-comparison.md`

### Acceptance Criteria

- [ ] User inputs: origin port (UN/LOCODE or city search), destination port, container type, cargo weight/volume, desired departure window
- [ ] Tool returns: 3 route options (at least 2 carriers, may include direct and transshipment options)
- [ ] Each option shows: carrier name, total transit time, estimated cost (USD/FEU), reliability score, transshipment count, next sailing date
- [ ] "Backhaul available" badge on routes where backhaul pricing exists (triggers discount flag)
- [ ] Export as PDF: formatted comparison table suitable for client delivery
- [ ] Shareable URL: unique URL that pre-fills the same comparison for link recipients
- [ ] Phase 1: mock carrier rates with static data. Phase 2: live FBX/Maersk feeds.
- [ ] Map visualization: show route arcs on MapLibre GL map (toggle on/off)

### UX / Design Requirements

- Full-width input bar at top (origin → destination → container → dates)
- Three result cards below, side-by-side on desktop, stacked on mobile
- Each card: carrier logo (placeholder), transit time (large badge), cost (large), reliability stars (1–5)
- "Winner" badge on lowest total cost card
- "Fastest" badge on shortest transit card
- Map tab: toggle to see route arcs on world map (MapLibre GL, dark style)

### Technical Dependencies

- Port database (World Port Index — 3,700+ ports with lat/long and UN/LOCODE)
- **MapLibre GL** + **deck.gl** — route map rendering
- **searoute-js** — sea route calculation between port pairs
- Carrier rate mock data (Phase 1) → FBX + Maersk API (Phase 2)

### Analytics Events

- `calculator.route.search_performed` — property: `origin_port`, `dest_port`, `container_type`
- `calculator.route.result_viewed` — property: `carrier`, `selected` (bool)
- `calculator.route.map_opened`
- `calculator.route.exported_pdf`
- `calculator.route.link_shared`
- `calculator.route.backhaul_flag_viewed`

### Performance Budget

| Page | LCP | Search → Results | Map Load |
|------|-----|-----------------|----------|
| `/app/route-comparison` | < 2.5s | < 1.5s | < 3s |

---

## 9. Executive Dashboard

**Feature ID:** F-009
**Sprint:** 4
**Priority:** P0
**PRD Reference:** `/planning/prds/full-app/full-app/PRD-APP-08-executive-dashboard.md`

### Acceptance Criteria

- [ ] Dashboard loads in < 2s for up to 50 active shipments
- [ ] Four KPI cards at top: Total Active Shipments, Total Duty Exposure ($), Avg Cost Per Shipment, Shipments Due This Week
- [ ] Shipment kanban with 5 columns: Booked, In Transit, At Port, In FTZ, Delivered
- [ ] Each kanban card shows: shipment name, origin/destination, ETA, cost-to-date
- [ ] Clicking a kanban card opens Shipment Detail drawer (F-010)
- [ ] Cost trend chart: 12-week rolling chart of total shipped cost by week (bar or line)
- [ ] "My Calculations" recent list: last 5 calculator outputs, each linkable
- [ ] Alerts widget: last 3 unread notifications with "View All" link
- [ ] Dashboard is personalized by user role (phase 3: admin sees org-wide, analyst sees own)
- [ ] Empty state: first-time user sees "Add your first shipment" CTA, not empty kanban

### UX / Design Requirements

- Sidebar nav (collapsible on mobile)
- Sticky header with breadcrumb and user menu
- KPI cards: 4-column grid (desktop), 2-column (tablet), 1-column (mobile)
- Kanban board: horizontal scroll on mobile; full-width on desktop
- Charts: recharts with branded colors (#0061FF primary, slate for neutral data)
- Recent calculations list: table with columns (Name, Type, Date, Cost, Link)

### Technical Dependencies

- Auth (F-001) — must be logged in
- Shipments (F-010) — kanban data
- Calculators (F-005 through F-014) — recent calculations list
- **recharts** — cost trend chart
- Container tracking (F-108, Phase 2) — ETA data for kanban cards
- Alerts (F-111, Phase 2) — notifications widget

### Analytics Events

- `dashboard.viewed`
- `dashboard.shipment_card_clicked`
- `dashboard.calculator_link_clicked` — property: `calculator_type`
- `dashboard.alert_clicked`
- `dashboard.kpi_viewed` — fires once per session

### Accessibility Requirements

- Kanban columns have `role="list"` and each card `role="listitem"`
- "Move to [column]" action available via keyboard/screen reader (drag-and-drop has keyboard alternative)
- KPI cards have `<h3>` headings and `aria-label` on the metric value
- Charts have data table fallback accessible via "View data" button

### Performance Budget

| Page | LCP | Data Load (50 shipments) | CLS |
|------|-----|--------------------------|-----|
| `/app/dashboard` | < 2.0s | < 1.5s | < 0.1 |

---

## 10. Shipment List & Detail

**Feature ID:** F-010
**Sprint:** 4
**Priority:** P0
**PRD Reference:** `/planning/prds/full-app/full-app/PRD-APP-09-shipment-list.md`, `PRD-APP-10-shipment-detail.md`

### Acceptance Criteria

**Shipment List:**
- [ ] Paginated table of all shipments (20 per page)
- [ ] Columns: Name, Origin, Destination, Status, HTS Code, Duty Exposure, ETA, Created
- [ ] Sortable by all columns
- [ ] Filterable by status, origin country, date range
- [ ] Search by shipment name or container number
- [ ] Bulk actions: export selected as CSV, archive selected
- [ ] "Create Shipment" button opens creation form (modal or page)

**Shipment Detail:**
- [ ] All shipment fields editable (name, reference, HTS codes, value, origin, destination, vessel)
- [ ] Status progression timeline (visual steps: Booked → In Transit → At Port → Delivered)
- [ ] Linked calculations: show all calculator runs associated with this shipment
- [ ] Document library: uploaded files for this shipment
- [ ] Compliance checklist: per-shipment checklist (ISF, invoice, BOL, etc.)
- [ ] Audit trail: who changed what, when (user name + timestamp)

### Technical Dependencies

- Auth (F-001)
- HTS lookup (F-005) — HTS code association
- Calculators (F-005 through F-014) — linked calculation history
- Document upload (F-105, Phase 2) — document library
- Container tracking (F-108, Phase 2) — live status
- PostgreSQL: `shipments`, `shipment_documents`, `shipment_calculations`, `shipment_audit_log`

### Analytics Events

- `shipment.list_viewed`
- `shipment.created`
- `shipment.updated` — property: `field_changed`
- `shipment.deleted`
- `shipment.detail_viewed`
- `shipment.export_csv`

### Performance Budget

| Page | LCP | Table Load (100 rows) |
|------|-----|-----------------------|
| `/app/shipments` | < 2.0s | < 1.0s |
| `/app/shipments/:id` | < 1.5s | < 0.5s |

---

## 11. Document Upload & Processing

**Feature ID:** F-105, F-106
**Sprint:** 5 (Phase 2)
**Priority:** P0

### Acceptance Criteria

- [ ] Drag-and-drop upload zone accepts PDF, XLSX, CSV, JPG, PNG
- [ ] File size limit enforced: 25MB per file, 500MB per organization
- [ ] Upload completes (presigned URL + Vercel Blob) within 5 seconds for 10MB PDF
- [ ] Document type auto-detected from filename and content analysis
- [ ] Supported types: Commercial Invoice, Packing List, Bill of Lading, ISF, CBP Entry Summary (7501), Certificate of Origin
- [ ] Parser extracts key fields per document type (defined below)
- [ ] Extracted fields shown in review UI — user can correct any field before saving
- [ ] Cross-document validation: flag if invoice value mismatches BOL declared value
- [ ] Parsed documents linked to parent shipment

**Extracted fields per document type:**
- Commercial Invoice: seller, buyer, HTS codes (all line items), unit quantities, unit prices, total value, Incoterms, currency
- Packing List: carton count, total CBM, gross weight, net weight, marks and numbers
- Bill of Lading: carrier, vessel name, voyage, port of loading, port of discharge, container numbers, ETA
- ISF: all 10 required data elements (manufacturer, seller, buyer, ship-to, container stuffing location, consolidator, importer of record, consignee, country of origin, HTS codes)

### Technical Dependencies

- Auth (F-001)
- Shipments (F-010) — documents linked to shipment
- **Vercel Blob** — file storage
- **pdf-parse** — text extraction from PDFs
- **tesseract.js** — OCR for scanned/image PDFs (Phase 3: replaced by Claude Vision)
- **zod** — extracted field validation schemas

### Analytics Events

- `document.upload_started` — property: `doc_type`, `file_size_mb`
- `document.upload_completed` — property: `doc_type`, `parse_success` (bool)
- `document.field_corrected` — property: `field_name`
- `document.cross_validation_failed` — property: `conflict_type`

### Accessibility Requirements

- Drag-and-drop zone has `role="button"` and keyboard fallback ("or click to browse")
- Upload progress communicated via `aria-live="polite"` region
- Extracted field form: standard labeled inputs with correction affordance

### Performance Budget

| Action | Target |
|--------|--------|
| 10MB PDF upload | < 5s |
| Field extraction from 3-page invoice | < 10s |
| Page LCP (`/app/documents`) | < 2.5s |

---

## 12. Container Tracking

**Feature ID:** F-108, F-109
**Sprint:** 6 (Phase 2)
**Priority:** P0

### Acceptance Criteria

- [ ] User enters container number (format: ABCU1234567) or BOL number to initiate tracking
- [ ] Tracking data pulled from Terminal49 API within 30 seconds of request
- [ ] Supported carriers: Maersk, MSC, CMA CGM, Hapag-Lloyd, Evergreen, COSCO
- [ ] Events shown: gate-out, vessel-loaded, in-transit (with current position if available), arrived, available, picked-up
- [ ] Estimated vs. actual arrival comparison with variance in days
- [ ] Last-updated timestamp shown on every tracking view
- [ ] If Terminal49 unavailable: show cached last-known state with "as of [date]" label
- [ ] Push notification on status change (email + in-app)
- [ ] Tracking linked to parent shipment automatically when container number matches

### UX / Design Requirements

- Event timeline: vertical stepper with completed steps (green check), current step (blue pulse), future steps (gray)
- Map overlay: vessel position on world map when in-transit (if Terminal49 provides coordinates)
- ETA card: large display with "On time" / "Delayed X days" badge

### Technical Dependencies

- **Terminal49 API** — container events
- Alerts engine (F-111) — status change notifications
- Shipments (F-010) — automatic linking
- Caching layer (Vercel KV) — last-known-good state on Terminal49 outage

### Analytics Events

- `tracking.lookup_performed` — property: `carrier`, `found` (bool)
- `tracking.delay_detected` — property: `carrier`, `delay_days`
- `tracking.notification_sent` — property: `event_type`

### Performance Budget

| Action | Target |
|--------|--------|
| Container lookup (API call) | < 3s p95 |
| Dashboard tracking widget | < 500ms (cached) |

---

## 13. Alerts & Notifications

**Feature ID:** F-111
**Sprint:** 6 (Phase 2)
**Priority:** P1

### Acceptance Criteria

- [ ] User can configure alert rules: vessel departure, container available, customs hold, CBP exam, shipment delay
- [ ] Per-rule settings: email on/off, in-app on/off, threshold (e.g., "alert if delay > 2 days")
- [ ] Email notification delivered within 5 minutes of triggering event
- [ ] In-app notification center: bell icon in nav, unread count badge
- [ ] Notification center: list of all notifications with read/unread state, timestamp, action link
- [ ] "Mark all read" action
- [ ] Critical holds (customs examination) always trigger email regardless of user setting
- [ ] Alert digest option: daily summary email instead of individual alerts

### Technical Dependencies

- Container tracking (F-108) — event source
- **Resend** — email delivery
- PostgreSQL: `notifications`, `notification_preferences` tables
- Background job (Vercel Cron or Bull) — alert processing queue

### Analytics Events

- `alert.configured` — property: `alert_type`, `channels` (email/in-app)
- `alert.triggered` — property: `alert_type`, `shipment_id`
- `alert.notification_opened` — property: `source` (email/in-app)

### Performance Budget

| Action | Target |
|--------|--------|
| Notification center open | < 300ms |
| Email delivery | < 5 min p95 |

---

## 14. HTS Classification AI Agent

**Feature ID:** F-201
**Sprint:** 5 (Phase 3)
**Priority:** P0
**PRD Reference:** `/planning/prds/full-app/full-app/PRD-APP-12-ai-classifier.md`

### Acceptance Criteria

- [ ] User inputs natural-language product description (minimum 20 words recommended)
- [ ] Agent returns primary HTS code + 2 alternative codes, each with confidence percentage
- [ ] Reasoning narrative explains each step of GRI application (6-step chain)
- [ ] Classification completes in < 15 seconds at p95
- [ ] Confidence threshold: results below 70% confidence display "Low confidence — request binding ruling" warning
- [ ] CBP CROSS ruling search linked from every result: "View similar CBP rulings →"
- [ ] UFLPA screen: flag if country of origin + HTS chapter triggers Xinjiang forced labor scrutiny
- [ ] User can mark classification as Correct or Incorrect (feedback loop)
- [ ] Incorrect classifications queue for human expert review
- [ ] Monthly accuracy report available to admin: % correct on first pass, avg confidence score
- [ ] Agent cost per classification < $0.05 at Anthropic API rates
- [ ] Feature only available on Pro and Enterprise plans (paywall for Starter)

### UX / Design Requirements

- Input: Large textarea with character count ("Describe your product in detail: material, function, end use, packaging")
- Progress stepper during classification (visible while waiting): "Analyzing product... → Applying GRI rules... → Cross-referencing codes... → Complete"
- Results: Primary result card (large, prominent) + 2 alternative cards (smaller, below)
- Each result card: HTS code, description, confidence bar, rate, CBP ruling count
- Reasoning accordion: collapsed by default, "Show reasoning" expands full 6-step narrative
- Feedback buttons: thumbs up / thumbs down with optional text comment
- UFLPA warning: full-width amber banner when applicable

### Technical Dependencies

- Anthropic Claude API (claude-3-5-sonnet) — classification reasoning chain
- USITC HTS dataset — code validation
- CBP CROSS database — ruling reference (linked out, not scraped)
- UFLPA Entity List (CBP published JSON, daily refresh)
- PostgreSQL: `classification_requests`, `classification_feedback` tables
- Feature flag: `agents.hts_classification` (Pro/Enterprise gating)

### A/B Testing Hooks

- `hts_agent.confidence_threshold` — 70% vs. 80% threshold for binding ruling warning

### Analytics Events

- `agent.hts.classification_requested` — property: `description_length`, `plan`
- `agent.hts.classification_completed` — property: `primary_confidence`, `time_ms`
- `agent.hts.feedback_given` — property: `correct` (bool), `primary_code`
- `agent.hts.uflpa_flagged` — property: `hts_chapter`
- `agent.hts.binding_ruling_prompt_shown`

### Accessibility Requirements

- Progress stepper uses `role="status"` region so screen readers announce step changes
- Results communicated via `aria-live="polite"` on the results region
- Confidence bar has `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Reasoning accordion uses `<details>`/`<summary>` or proper ARIA `aria-expanded`

### Performance Budget

| Action | Target |
|--------|--------|
| Classification (API call) | < 15s p95, < 8s p50 |
| Page LCP | < 2.0s |
| Result render after API return | < 100ms |

---

## 15. Document Intelligence AI Engine

**Feature ID:** F-205
**Sprint:** 6 (Phase 3)
**Priority:** P0

### Acceptance Criteria

- [ ] Claude Vision API processes uploaded PDFs and image documents
- [ ] Extraction accuracy: > 90% on typed PDFs, > 75% on scanned images
- [ ] Cross-document validation: flag discrepancies between Commercial Invoice value and BOL value
- [ ] Automated compliance checklist generated per-shipment from: origin country, destination port, commodity HTS, import value
- [ ] Required documents auto-identified (Commercial Invoice, Packing List, BOL, ISF, Certificate of Origin, FDA prior notice if food/pharma)
- [ ] Checklist tracks upload and validation status per document
- [ ] Document assembly workflow: collect + validate + ZIP export
- [ ] Certificate of origin validator: check FTA eligibility (US-Korea, US-Singapore, US-Australia, CAFTA-DR)
- [ ] Shareable link to assembled document set (secure, time-limited URL)
- [ ] Customs broker handoff package: assembled ZIP with cover sheet listing doc status

### Technical Dependencies

- Document upload (F-105) — input layer
- Anthropic Claude API (claude-3-5-sonnet with vision) — extraction
- Shipments (F-010) — checklist linked to shipment
- Vercel Blob — document storage
- FTA eligibility rules (USTR, hardcoded per agreement with quarterly review)
- Feature flag: `agents.document_intelligence` (Enterprise only)

### Analytics Events

- `agent.document.extraction_started` — property: `doc_type`, `is_scanned` (bool)
- `agent.document.extraction_completed` — property: `field_count`, `accuracy_estimate`
- `agent.document.cross_validation_conflict` — property: `conflict_type`
- `agent.document.checklist_generated`
- `agent.document.zip_exported`
- `agent.document.fta_eligible_found` — property: `fta_name`

### Performance Budget

| Action | Target |
|--------|--------|
| Extraction (typed PDF, 5 pages) | < 20s |
| Extraction (scanned image) | < 30s |
| ZIP assembly | < 10s |

---

## 16. A/B Testing Plan

### Testing Framework

- **Tool:** Vercel Edge Flags (or PostHog feature flags for analytics integration)
- **Bucketing:** User ID-based (consistent experience per user across sessions)
- **Minimum sample size:** 200 users per variant before declaring winner (calculated at 80% power, 5% significance)
- **Test duration:** Minimum 2 weeks to capture weekly usage patterns

### Experiment Catalog

| Experiment ID | Feature | Variants | Primary Metric | Secondary Metric |
|---------------|---------|----------|---------------|-----------------|
| `EXP-001` | auth.register_layout | A: Two-column, B: Single-column | Registration completion rate | Time-to-complete |
| `EXP-002` | auth.trial_length | A: 14-day, B: 21-day | Trial-to-paid conversion | MAU during trial |
| `EXP-003` | onboarding.skip_placement | A: Bottom-left text, B: Top-right button | Onboarding completion rate | First calculation within 7 days |
| `EXP-004` | hts.search_placement | A: Top bar, B: Sidebar | HTS searches per session | Code-to-calculation rate |
| `EXP-005` | landed_cost.input_layout | A: Tabbed sections, B: Long-form scroll | Calculator completion rate | Time to first result |
| `EXP-006` | landed_cost.hidden_cost_presentation | A: Separate section, B: Inline warnings | Hidden cost acknowledgment rate | Support tickets about missed costs |
| `EXP-007` | ftz.irr_prominence | A: IRR primary, B: NPV primary | FTZ analyzer completion rate | Trial-to-paid on FTZ segment |
| `EXP-008` | dashboard.empty_state_cta | A: "Add your first shipment", B: "Import from spreadsheet" | First shipment created | Onboarding completion |
| `EXP-009` | hts_agent.confidence_threshold | A: 70% threshold, B: 80% threshold | Binding ruling clicks | User-reported accuracy |
| `EXP-010` | pricing.trial_cta | A: "Start free trial", B: "Try free for 14 days" | Registration click-through | |

### Testing Protocol

1. **Hypothesis:** Documented before launch (e.g., "We believe single-column registration will reduce form abandonment by 15% because it reduces visual complexity")
2. **Instrumentation:** Both variants fire identical analytics events — variant is a property
3. **Analysis:** Frequentist statistical test (chi-squared for conversion rates, t-test for continuous metrics)
4. **Rollout:** Winner rolled out to 100% within 1 week of declaring significance
5. **Anti-patterns to avoid:** Never run experiments that change pricing display, compliance warnings, or duty rate accuracy — only UX/copy tests

---

## 17. Analytics & Instrumentation Requirements

### Analytics Stack

- **Primary tool:** PostHog (self-hosted on Neon or cloud)
- **Fallback / marketing:** Google Analytics 4 (GA4) for SEO and marketing attribution
- **Error monitoring:** Sentry (JavaScript + server-side)
- **Performance:** Vercel Analytics (built-in) + custom Web Vitals reporting

### Event Schema

All events follow this structure:

```typescript
interface AnalyticsEvent {
  event: string;              // e.g., "calculator.landed_cost.completed"
  userId?: string;            // undefined for anonymous users
  orgId?: string;
  sessionId: string;
  timestamp: string;          // ISO 8601
  properties: {
    plan?: 'free' | 'starter' | 'pro' | 'enterprise' | 'trial';
    role?: 'owner' | 'admin' | 'analyst' | 'viewer';
    [key: string]: unknown;
  };
}
```

### Core Events (Required on Day 1)

| Event | Trigger | Key Properties |
|-------|---------|----------------|
| `app.page_viewed` | Every page navigation | `path`, `referrer`, `plan` |
| `app.session_started` | Session begins | `plan`, `role` |
| `auth.register_completed` | Successful registration | `org_created`, `trial_start` |
| `auth.login_success` | Successful login | `plan`, `days_since_register` |
| `onboarding.completed` | Wizard complete | `role`, `primary_workflow` |
| `onboarding.skipped` | Wizard skipped | `at_step` |
| `calculator.*.started` | Calculator opened | `calculator_type`, `plan` |
| `calculator.*.completed` | Result generated | `calculator_type`, `time_ms` |
| `calculator.*.exported_pdf` | PDF download | `calculator_type` |
| `hts.search_performed` | HTS search | `results_count` |
| `shipment.created` | New shipment | `status` |
| `billing.trial_started` | Trial activation | `plan`, `trial_days` |
| `billing.upgraded` | Plan upgrade | `from_plan`, `to_plan`, `mrr_delta` |
| `billing.churned` | Cancellation | `plan`, `days_active`, `reason` |

### Funnel Definitions

**Activation Funnel:** Register → Verify Email → Complete Onboarding → Run First Calculation
- Target: 60% activation rate (register → first calculation within 7 days)
- Alert if < 40% (investigate onboarding friction)

**Retention Funnel:** Activated → Active Week 2 → Active Week 4 → Active Month 3
- Target: 40% retained at Week 4
- Cohort analysis by acquisition channel and primary workflow

**Conversion Funnel:** Trial Start → First Calculation → 5th Calculation → Upgrade to Paid
- Target: 15% trial-to-paid conversion by Day 14

### User Properties (Identify)

Set on login and update when changed:
- `plan`, `role`, `org_id`, `org_size`, `days_since_register`, `total_calculations`, `primary_workflow`, `onboarding_completed`

### Web Vitals Instrumentation

Custom `reportWebVitals` in Next.js root layout — send LCP, FID, CLS, TTFB to PostHog and Sentry:

```typescript
// app/layout.tsx
export function reportWebVitals(metric: NextWebVitalsMetric) {
  posthog.capture('web_vital', {
    metric_name: metric.name,
    value: metric.value,
    rating: metric.rating,
    path: window.location.pathname,
  });
  if (metric.rating === 'poor') {
    Sentry.captureMessage(`Poor ${metric.name}: ${metric.value}ms`, 'warning');
  }
}
```

---

## 18. Accessibility Requirements

### Standard

All platform pages must meet **WCAG 2.1 Level AA**. Pages targeting enterprise procurement must also meet Section 508 (functionally equivalent to WCAG 2.1 AA for US federal compliance).

### Testing Protocol

1. **Automated scan:** Run `axe-core` or `@axe-core/playwright` on every page in CI — block merge if new violations introduced
2. **Manual keyboard test:** Tab through every form, every modal, every data table on each PR
3. **Screen reader smoke test:** VoiceOver (macOS) + NVDA (Windows) quarterly
4. **Color contrast check:** `color-contrast-checker` on all new color pairs before design sign-off

### Global Requirements (All Pages)

| Requirement | Standard | Notes |
|-------------|---------|-------|
| Color contrast (normal text) | ≥ 4.5:1 | WCAG 1.4.3 |
| Color contrast (large text 18pt+) | ≥ 3:1 | WCAG 1.4.3 |
| Color contrast (UI components, icons) | ≥ 3:1 | WCAG 1.4.11 |
| Keyboard accessibility | All interactive elements reachable | WCAG 2.1.1 |
| Focus visible | Visible focus indicator on all interactive elements | WCAG 2.4.7 |
| No keyboard trap | User can navigate out of all components | WCAG 2.1.2 |
| Skip link | "Skip to main content" as first focusable element | WCAG 2.4.1 |
| Page title | Unique, descriptive `<title>` on every page | WCAG 2.4.2 |
| Language | `lang="en"` on `<html>` | WCAG 3.1.1 |
| Labels | All inputs have associated labels | WCAG 1.3.1 |
| Error identification | All form errors identified in text | WCAG 3.3.1 |
| Error suggestion | Field-level error messages suggest correction | WCAG 3.3.3 |
| Resize text | Layout intact at 200% browser zoom | WCAG 1.4.4 |
| Reflow | No horizontal scroll at 320px viewport width | WCAG 1.4.10 |
| Non-text contrast | Icons/borders/focus rings ≥ 3:1 against background | WCAG 1.4.11 |
| Pointer gestures | No multi-finger gestures without keyboard alternative | WCAG 2.5.1 |

### Component-Level Requirements

**Data tables (HTS lookup, shipment list, analytics):**
- `<caption>` or `aria-label` describing table content
- `<th scope="col">` for column headers
- `<th scope="row">` for row headers where applicable
- `aria-sort` on sortable column headers
- Keyboard: arrow keys navigate cells when `role="grid"`

**Charts (recharts, cost trends, FTZ NPV):**
- `aria-label` on chart container describing what it shows
- Data table alternative accessible via "View data table" button below chart
- Color is not the only data differentiation — use patterns or labels for color-blind users

**Modals and drawers:**
- Focus trapped inside when open
- Escape key closes
- Focus returns to trigger element on close
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to modal title

**Toast notifications:**
- `role="alert"` for error toasts (immediate announcement)
- `role="status"` for success/info toasts (polite announcement)
- Auto-dismiss not shorter than 5 seconds
- Manual dismiss button

**Drag and drop (kanban, document upload):**
- All drag-and-drop interactions have a keyboard alternative
- Kanban: "Move shipment to [column]" button/menu accessible via keyboard
- Document upload: "Browse files" button as fallback for drag zone

### Disability-Specific Considerations

**Visual impairment:**
- All images have meaningful `alt` text or `alt=""` if decorative
- PDF exports include tagged PDF structure (accessibility tree in @react-pdf/renderer)
- Icon-only buttons always have `aria-label`

**Motor impairment:**
- Touch targets minimum 44×44px (WCAG 2.5.5)
- No time-limited interactions except session timeout (which has a 5-minute warning)
- Sticky keyboard focus indicators (not reset on hover)

**Cognitive impairment:**
- Plain language in error messages (no jargon like "HTTP 422 Unprocessable Entity")
- Consistent navigation and layout across all pages
- Progress saved automatically (no loss of input on accidental navigation)

---

## 19. Performance Budgets

### Budget Philosophy

Performance budgets are enforced in CI via Lighthouse CI with budget.json. PRs that exceed budgets require explicit sign-off from the engineering lead.

### Global Performance Targets

| Metric | Good | Needs Improvement | Poor (Block Merge) |
|--------|------|------------------|--------------------|
| LCP | < 2.5s | 2.5–4.0s | > 4.0s |
| FID / INP | < 100ms | 100–300ms | > 300ms |
| CLS | < 0.1 | 0.1–0.25 | > 0.25 |
| TTFB | < 800ms | 800ms–1.8s | > 1.8s |
| Total JS (compressed) | < 150KB | 150–300KB | > 300KB |
| Total page weight | < 1MB | 1–2MB | > 2MB |

### Per-Page Performance Budgets

| Page | LCP Target | JS Budget | Critical Path Notes |
|------|-----------|-----------|---------------------|
| `/login` | < 1.5s | < 80KB | No heavy calculators. Auth card only. |
| `/register` | < 1.5s | < 90KB | Two-column layout. PasswordStrengthMeter adds ~5KB. |
| `/onboarding` | < 2.0s | < 120KB | Wizard imports calculator previews lazily. |
| `/app/dashboard` | < 2.0s | < 200KB | recharts loaded async. Data server-streamed via Suspense. |
| `/app/hts-lookup` | < 2.0s | < 180KB | Fuse.js index (~800KB JSON) loaded async post-mount. |
| `/app/landed-cost` | < 2.0s | < 150KB | decimal.js + react-pdf loaded async on first export. |
| `/app/ftz-modeler` | < 2.5s | < 200KB | recharts + MapLibre lazy. |
| `/app/route-comparison` | < 2.5s | < 250KB | MapLibre GL lazy-loaded on map tab activation. |
| `/app/container-calculator` | < 2.0s | < 100KB | Simple calculator, minimal JS. |
| `/app/shipments` | < 2.0s | < 160KB | tanstack/react-table lazy. 20-row pagination. |
| `/app/shipments/:id` | < 1.5s | < 130KB | Detail view. Documents loaded lazily. |
| `/app/documents` | < 2.5s | < 150KB | Dropzone lazy. Extraction results streamed. |
| `/app/hts-classify` | < 2.0s | < 120KB | AI response streamed. No heavy libs on initial load. |

### Bundle Optimization Strategy

**Code splitting rules:**
- All calculator engines loaded lazily (route-level split via Next.js dynamic imports)
- `recharts` — dynamic import, only loaded on pages with charts
- `MapLibre GL` — dynamic import with `ssr: false`, only loaded on map activation
- `@react-pdf/renderer` — dynamic import, only loaded when user clicks "Export PDF"
- `Fuse.js` index — streamed after initial render, not blocking
- `decimal.js` — included in calculator bundle (small, ~8KB gzipped)

**Image optimization:**
- All images via `next/image` with explicit `width` and `height` (prevents CLS)
- WebP format for all static images
- Blur placeholder (`placeholder="blur"`) for above-fold hero images
- Icons: Lucide React (tree-shakeable, SVG-based)

**Caching strategy:**
- Static assets (JS, CSS, images): `Cache-Control: public, max-age=31536000, immutable`
- API routes with static data (HTS dataset): `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800`
- API routes with user data: `Cache-Control: private, no-store`
- HTS JSON dataset: Vercel CDN-cached with 24h TTL

**Performance CI gate:**
- Lighthouse CI runs on every PR against staging deployment
- Budgets enforced via `lighthouserc.json`
- Slack alert if any page drops below "Good" threshold in production (measured via Vercel Analytics weekly report)
