# Feature Specifications — Shipping Savior

**Linear:** AI-5420
**Parent:** Phase 4 — Complete Platform Specification
**Version:** 1.0
**Date:** 2026-03-26

---

## Table of Contents

1. [Module 1: Identity & Access](#module-1-identity--access)
2. [Module 2: Calculation & Analysis Tools](#module-2-calculation--analysis-tools)
3. [Module 3: Shipment Operations](#module-3-shipment-operations)
4. [Module 4: AI Intelligence](#module-4-ai-intelligence)
5. [Module 5: Documents & Knowledge](#module-5-documents--knowledge)
6. [Module 6: Administration & Analytics](#module-6-administration--analytics)
7. [Cross-Module Dependencies](#cross-module-dependencies)
8. [Shared Components](#shared-components)
9. [Implementation Priority](#implementation-priority)

---

## Module 1: Identity & Access

**Routes:** `/login`, `/register`, `/reset-password`, `/onboarding`
**Owner:** Platform Engineering
**Phase:** Phase 1 (M3) for basic auth, Phase 2 (M4-M6) for roles and teams

This module governs how users authenticate, create organizations, manage team members, and control access to platform features. It is the foundation on which all persistent, multi-user functionality depends. Every other module requires Module 1 for saved state, personalized views, and data isolation.

---

### F-IAM-01: User Registration

**Description:** New users create an account with email and password. Registration simultaneously creates a personal organization record, provisions default settings, and starts a 14-day free trial. The flow must be fast (< 3 fields on the first screen) and must not require email verification to start using calculators — verification is deferred until the user saves their first calculation.

**Implementation Phase:** Phase 1 / M3 (P0)

**Acceptance Criteria:**

- [ ] User submits email + password (min 8 chars, 1 uppercase, 1 number) and receives a JWT session cookie
- [ ] Password is hashed with bcrypt (cost factor 12) before storage
- [ ] An `organizations` row is created with the user as owner and a 14-day `trialEndsAt` timestamp
- [ ] Duplicate email returns a generic "account may already exist" message (no email enumeration)
- [ ] Registration completes in < 2 seconds on a cold start
- [ ] Rate limited to 5 registration attempts per IP per hour
- [ ] Google reCAPTCHA v3 score must be >= 0.5 to proceed
- [ ] User is redirected to the onboarding wizard (F-IAM-04) after registration

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create user + org, return JWT |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `RegisterForm` | Email, password, confirm password fields with inline validation |
| `PasswordStrengthMeter` | Real-time password strength indicator |
| `SocialAuthButton` | Google OAuth button (Phase 2 addition) |

**Dependencies:**

- None (entry point to the platform)
- Consumed by: F-IAM-02 (Authentication), F-IAM-04 (Onboarding)

**Database Schema:**

```sql
users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
)
```

---

### F-IAM-02: Authentication

**Description:** Returning users authenticate via email + password and receive a JWT session. The system uses httpOnly cookies with separate access (15min) and refresh (30day) tokens. A "remember me" checkbox extends the refresh token to 90 days. All authenticated API routes validate the access token via Edge Middleware before the request reaches the handler.

**Implementation Phase:** Phase 1 / M3 (P0)

**Acceptance Criteria:**

- [ ] Login returns httpOnly, Secure, SameSite=Lax cookies for both access and refresh tokens
- [ ] Access token expires in 15 minutes; refresh token in 30 days (90 days with "remember me")
- [ ] Expired access tokens are silently refreshed via `/api/auth/refresh` if refresh token is valid
- [ ] Failed login returns generic "invalid credentials" (no indication of which field is wrong)
- [ ] Account locks after 10 failed attempts in 15 minutes; unlock after 30 minutes or via password reset
- [ ] Logout invalidates the refresh token server-side (token revocation list in Redis or DB)
- [ ] Session persists across browser tabs via shared cookie

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Validate credentials, issue tokens |
| POST | `/api/auth/refresh` | Refresh access token using refresh token |
| POST | `/api/auth/logout` | Revoke refresh token, clear cookies |
| GET | `/api/auth/session` | Return current user + org context |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `LoginForm` | Email, password, remember me checkbox |
| `SessionProvider` | React context providing `user`, `org`, `isAuthenticated` to client components |
| `AuthGuard` | Layout-level wrapper that redirects unauthenticated users to `/login` |

**Dependencies:**

- F-IAM-01 (Registration creates the user record)
- Consumed by: All authenticated features across every module

---

### F-IAM-03: Password Reset

**Description:** Users who forget their password request a reset link via email. The system generates a cryptographically random token (32 bytes, hex-encoded), stores its hash in the database with a 1-hour expiry, and sends the user an email with a reset link. The reset page validates the token and allows the user to set a new password. The flow must not reveal whether an email exists in the system.

**Implementation Phase:** Phase 1 / M3 (P1)

**Acceptance Criteria:**

- [ ] POST to `/api/auth/forgot-password` always returns 200 OK regardless of whether the email exists
- [ ] Reset token is hashed (SHA-256) before storage — raw token only exists in the email link
- [ ] Token expires after 1 hour; expired tokens return a user-friendly "link expired" message
- [ ] Password reset invalidates all existing refresh tokens for that user (force re-login on all devices)
- [ ] Rate limited to 3 reset requests per email per hour
- [ ] Email is sent via Resend with branded template

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/forgot-password` | Generate and email reset token |
| POST | `/api/auth/reset-password` | Validate token, update password |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `ForgotPasswordForm` | Email input with "check your inbox" confirmation |
| `ResetPasswordForm` | New password + confirm with strength meter |

**Dependencies:**

- F-IAM-01 (user must exist)
- Resend email service integration (F-ADM-06)

---

### F-IAM-04: Onboarding Wizard

**Description:** After registration, users complete a 4-step onboarding wizard that configures their organization profile, trade preferences, carrier accounts, and subscription plan. Each step is independently saveable — users can exit and resume later. The wizard collects the minimum data needed to personalize calculator defaults (preferred trade lanes, default origin country, primary commodity categories) so that subsequent tool usage is faster.

**Implementation Phase:** Phase 1 / M3 (P0)

**Acceptance Criteria:**

- [ ] Wizard has 4 steps: Company Profile, Trade Preferences, Carrier Accounts, Subscription Plan
- [ ] Step 1 (Company): company name, industry (importer/broker/FTZ operator/3PL), annual import volume range
- [ ] Step 2 (Trade): primary origin countries (multi-select), destination ports (multi-select), top HTS chapters (searchable)
- [ ] Step 3 (Carriers): optional Maersk/CMA CGM API key inputs (validated on entry), Terminal49 API key
- [ ] Step 4 (Subscription): display Starter/Professional/Enterprise plans with feature comparison matrix
- [ ] Each step saves independently via PATCH to `/api/onboarding/step/:n`
- [ ] Skip button on every step except Step 1 (company name required)
- [ ] Progress indicator shows completion across all 4 steps
- [ ] Wizard state persisted — user can close browser and resume from last incomplete step

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/onboarding/status` | Return current step + completion state |
| PATCH | `/api/onboarding/step/:n` | Save data for step n |
| POST | `/api/onboarding/complete` | Mark onboarding done, redirect to dashboard |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `OnboardingWizard` | Multi-step form with progress bar |
| `CompanyProfileStep` | Company name, industry select, volume range |
| `TradePreferencesStep` | Country multi-select, port multi-select, HTS chapter search |
| `CarrierAccountsStep` | API key inputs with validation indicators |
| `SubscriptionStep` | Plan comparison cards with Stripe checkout trigger |

**Dependencies:**

- F-IAM-01 (Registration creates the org)
- F-ADM-03 (Stripe subscription, Step 4)
- F-ADM-05 (Carrier API keys, Step 3)

---

### F-IAM-05: Role-Based Access Control

**Description:** Organizations support four roles with hierarchical permissions: Owner, Admin, Member, and Viewer. Roles control access to sensitive operations (billing, team management, data deletion) while ensuring all users can access core calculation tools. Permission checks are enforced both in the UI (hide/disable controls) and in API routes (server-side validation). A single user can belong to multiple organizations with different roles in each.

**Implementation Phase:** Phase 2 / M4 (P1)

**Acceptance Criteria:**

- [ ] Four roles enforced: Owner (full access), Admin (everything except billing/org deletion), Member (CRUD on own data, read team data), Viewer (read-only)
- [ ] Permission matrix implemented as a typed constant in `lib/auth/permissions.ts`
- [ ] Every API route checks permissions via `requireRole('admin')` middleware
- [ ] UI components use `usePermission('shipments.create')` hook to conditionally render actions
- [ ] Owner role cannot be removed — only transferred to another Admin
- [ ] Role changes take effect immediately (no cached stale permissions)
- [ ] Audit log entry created for every role change (F-ADM-07)

**Permissions Matrix:**

| Action | Owner | Admin | Member | Viewer |
|--------|-------|-------|--------|--------|
| Run calculators | Yes | Yes | Yes | Yes |
| Save calculations | Yes | Yes | Yes | No |
| Create shipments | Yes | Yes | Yes | No |
| View all org shipments | Yes | Yes | Yes | Yes |
| Edit any shipment | Yes | Yes | Own only | No |
| Upload documents | Yes | Yes | Yes | No |
| Manage team members | Yes | Yes | No | No |
| Change billing/plan | Yes | No | No | No |
| Delete organization | Yes | No | No | No |
| View audit log | Yes | Yes | No | No |
| Configure carrier APIs | Yes | Yes | No | No |
| Manage API keys | Yes | Yes | No | No |

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/org/:orgId/roles` | List all members and their roles |
| PATCH | `/api/org/:orgId/members/:userId/role` | Update a member's role |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `PermissionGate` | Wrapper component that conditionally renders children based on role |
| `usePermission` | Hook returning boolean for a specific permission string |
| `RoleBadge` | Visual indicator of user role (Owner/Admin/Member/Viewer) |

**Dependencies:**

- F-IAM-01 (user records)
- F-IAM-02 (session contains role context)
- Consumed by: All modules that need access control

---

### F-IAM-06: Team Management

**Description:** Organization Owners and Admins can invite new members via email, assign roles, and remove members. Invitations are sent as email links with a 7-day expiry. Invited users who do not have an account are directed to a streamlined registration flow that auto-joins them to the inviting organization. Removing a member revokes their access immediately but does not delete their data contributions (shipments, calculations).

**Implementation Phase:** Phase 2 / M4 (P1)

**Acceptance Criteria:**

- [ ] Invite form accepts email + role selection (Admin, Member, or Viewer — not Owner)
- [ ] Invitation email contains a signed link with org ID and role embedded in the token payload
- [ ] Existing users who click the invite link are added to the org immediately after login
- [ ] New users who click the invite link go through a shortened registration (email pre-filled, skip onboarding Step 1)
- [ ] Pending invitations are visible in the Team settings page with resend/revoke actions
- [ ] Invitations expire after 7 days; expired invitations show a "request a new invite" message
- [ ] Removing a member clears their org association and revokes their refresh tokens for that org context
- [ ] Maximum 5 members on Starter plan, 25 on Professional, unlimited on Enterprise

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/org/:orgId/invitations` | Send invitation email |
| GET | `/api/org/:orgId/invitations` | List pending invitations |
| DELETE | `/api/org/:orgId/invitations/:id` | Revoke pending invitation |
| POST | `/api/invitations/:token/accept` | Accept invitation (add user to org) |
| DELETE | `/api/org/:orgId/members/:userId` | Remove member from org |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `TeamMemberList` | Table of current members with role badges and action menus |
| `InviteMemberDialog` | Modal with email input and role select |
| `PendingInvitationList` | List of outstanding invites with resend/revoke |
| `InviteAcceptPage` | Landing page for invitation links |

**Dependencies:**

- F-IAM-01 (user creation for new invitees)
- F-IAM-05 (role assignment)
- F-ADM-03 (plan limits on member count)
- Resend email service

---

## Module 2: Calculation & Analysis Tools

**Routes:** `/tools/hts-lookup`, `/tools/landed-cost`, `/tools/ftz-modeler`, `/tools/route-comparison`, `/tools/container-calc`, `/tools/freight-estimator`, `/tools/tariff-scenarios`
**Owner:** Product Engineering
**Phase:** Phase 1 (M1-M3) for core calculators, Phase 2 (M4-M6) for live data, Phase 3 (M7-M12) for AI-enhanced

This is the revenue-generating core of the platform. Every calculator follows the same UX pattern: input panel (left/top) with real-time output panel (right/bottom), PDF export button, and optional save-to-dashboard action. All monetary calculations use `decimal.js` to prevent floating-point drift. The North Star Metric (Monthly Active Calculations) is tracked per calculator.

---

### F-CAL-01: HTS Code Lookup

**Description:** A searchable database of 17,000+ Harmonized Tariff Schedule codes sourced from the USITC. Users search by keyword (e.g., "cotton t-shirt"), HTS code fragment (e.g., "6109"), or description text. Results show the duty rate (MFN General, Special, Column 2), unit of quantity, and applicable special program rates (GSP, USMCA, etc.). This is the foundation data layer that feeds the Landed Cost Calculator, FTZ Analyzer, and AI Classification Agent.

**Implementation Phase:** Phase 1 / M1 (P0)

**Acceptance Criteria:**

- [ ] Full USITC HTS schedule loaded as static JSON (17,000+ 10-digit codes)
- [ ] Fuse.js fuzzy search returns results in < 500ms on the full dataset
- [ ] Search supports: keyword match, HTS code prefix match, chapter/heading filter
- [ ] Each result displays: HTS code, description, MFN rate (%), special rate, Column 2 rate, unit of quantity
- [ ] Chapter filter dropdown (Chapters 1-99) narrows results before text search
- [ ] Heading filter (4-digit) available as secondary refinement
- [ ] Click on a code expands to show: legal notes, section notes, related CBP rulings link
- [ ] "Use in calculator" button pre-fills the duty rate into Landed Cost Calculator (F-CAL-02) or FTZ Modeler (F-CAL-04)
- [ ] Data source date displayed prominently with staleness disclaimer
- [ ] Dataset refreshed on build via USITC JSON endpoint; manual override available for emergency tariff changes
- [ ] Pagination: 25 results per page with "load more" or virtual scroll for large result sets
- [ ] Mobile responsive: table collapses to card layout on screens < 768px

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/hts/search?q=...&chapter=...&heading=...` | Search HTS codes (server-side for SEO) |
| GET | `/api/hts/:code` | Get full detail for a specific HTS code |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `HTSSearchInput` | Search bar with debounced input (300ms) and Fuse.js integration |
| `HTSResultsTable` | DataTable with sortable columns, expandable rows |
| `HTSCodeDetail` | Expanded view with legal notes, special rates, and action buttons |
| `ChapterFilter` | Dropdown of HTS chapters (1-99) with code ranges |
| `DutyRateBadge` | Formatted display of duty rate with visual indicator (free/low/high/prohibitive) |

**Dependencies:**

- USITC HTS JSON data pipeline (build-time download and parse)
- Fuse.js search index (built at app initialization)
- Consumed by: F-CAL-02, F-CAL-04, F-CAL-08, F-AI-01

**Data Source:**

- Primary: USITC HTS JSON — `https://hts.usitc.gov/api/search`
- Fallback: Manually curated JSON in `/data/hts-schedule.json`
- Refresh cadence: Weekly build, with manual trigger for tariff policy changes

---

### F-CAL-02: Landed Cost Calculator

**Description:** The platform's most-used calculator. Models the complete cost of importing goods from FOB (Free On Board) origin price to final landed cost at a US warehouse. Includes 15+ cost components that importers commonly miss: Merchandise Processing Fee (MPF at 0.3464%), Harbor Maintenance Fee (HMF at 0.125%), ISF bond, customs broker fee, port exam risk, demurrage, inland drayage, warehousing, and fulfillment. Output is a detailed cost waterfall showing exactly where each dollar goes, with PDF export for partner meetings.

**Implementation Phase:** Phase 1 / M1 (P0)

**Acceptance Criteria:**

- [ ] Input panel accepts: unit cost (FOB), units per container, HTS code (auto-fills duty rate from F-CAL-01), origin country, destination port
- [ ] 15+ cost components calculated: ocean freight, duty, MPF (0.3464% of entered value, min $31.67, max $614.35 per entry), HMF (0.125% of cargo value), ISF bond ($75-$150), customs broker fee, port exam fee (risk-adjusted), demurrage estimate, chassis rental, inland drayage, warehouse receiving, storage (30-day default), pick/pack/ship, insurance (0.3-0.5% of CIF), miscellaneous surcharges
- [ ] All calculations use `decimal.js` — zero floating-point errors on currency operations
- [ ] "Hidden costs" section highlighted with warning icon for commonly forgotten line items (demurrage, chassis, exam fees)
- [ ] Cost waterfall chart (Recharts BarChart) showing cumulative cost buildup from FOB to landed
- [ ] Per-unit breakdown and per-container totals displayed simultaneously
- [ ] PDF export renders a branded report with inputs, all 15+ line items, waterfall chart, and data source citations
- [ ] Shareable URL encodes all input parameters (base64 encoded query string)
- [ ] Authenticated users can save calculations to their dashboard
- [ ] "Compare scenarios" button opens side-by-side view of two configurations

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/calculate/landed-cost` | Run full landed cost calculation (server-side for precision) |
| POST | `/api/export/landed-cost/pdf` | Generate PDF report |
| POST | `/api/calculations/save` | Save calculation to user dashboard (auth required) |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `LandedCostForm` | Input panel with grouped sections: Product, Shipping, Customs, Inland, Fulfillment |
| `CostWaterfallChart` | Recharts stacked bar showing FOB to landed cost buildup |
| `CostBreakdownTable` | Line-item table with per-unit and per-container columns |
| `HiddenCostWarning` | Alert banner highlighting commonly missed cost components |
| `ScenarioCompare` | Side-by-side layout for comparing two calculation results |
| `CalculatorLayout` | Shared layout wrapper: left panel (inputs) + right panel (results) + export bar |

**Dependencies:**

- F-CAL-01 (HTS duty rate lookup)
- `decimal.js` for all monetary arithmetic
- `@react-pdf/renderer` for PDF export
- Consumed by: F-CAL-03 (Unit Economics), F-CAL-04 (FTZ comparison)

**Calculation Engine:**

```typescript
// Core formula (simplified)
dutyAmount = unitCost * units * dutyRate
mpf = clamp(enteredValue * 0.003464, 31.67, 614.35)
hmf = cargoValue * 0.00125
totalLandedCost = (unitCost * units) + oceanFreight + dutyAmount + mpf + hmf
  + isfBond + brokerFee + examFee + demurrage + chassis
  + drayage + warehouseReceiving + storage + fulfillment + insurance
landedCostPerUnit = totalLandedCost / units
```

---

### F-CAL-03: Unit Economics Calculator

**Description:** Models the complete import value chain from product origin to retail sale. Answers the core business question: "If I buy goods at $0.10/unit in SE Asia, what does it actually cost me landed, and what margins do I get at wholesale and retail?" Integrates with the Landed Cost Calculator for the FOB-to-landed segment, then extends through wholesale and retail price points with margin analysis at each tier. Includes breakeven analysis showing the minimum number of units to recoup container investment.

**Implementation Phase:** Phase 1 / M1 (P0)

**Acceptance Criteria:**

- [ ] Input panel: unit cost (FOB), units per container, container shipping cost, duty rate (%), insurance rate (%), customs broker fee, inland freight, fulfillment cost per unit, wholesale price, retail price
- [ ] Default values pre-loaded: $0.10 origin, 500K units, $3,500 freight, 6.5% duty — matching founder's SE Asia import model
- [ ] Output shows 4-tier waterfall: Origin Cost → Landed Cost → Wholesale → Retail
- [ ] Margin calculated at each tier: gross margin %, gross profit per unit, total profit per container
- [ ] Breakeven analysis: units needed to sell at wholesale to cover container cost
- [ ] Donut chart showing cost composition (product cost vs. shipping vs. duties vs. fulfillment vs. profit)
- [ ] Sensitivity table: how margin changes if duty rate increases by 5%, 10%, 25%
- [ ] PDF export with full breakdown and charts
- [ ] Shareable URL with all inputs encoded

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/calculate/unit-economics` | Run unit economics calculation |
| POST | `/api/export/unit-economics/pdf` | Generate PDF report |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `UnitEconomicsForm` | Input panel with product, shipping, pricing sections |
| `MarginWaterfallChart` | 4-tier stacked bar: origin → landed → wholesale → retail |
| `CostCompositionDonut` | Donut chart of cost breakdown |
| `SensitivityTable` | Grid showing margin impact of duty rate changes |
| `BreakevenIndicator` | Visual showing units-to-breakeven with progress bar |

**Dependencies:**

- F-CAL-02 (Landed Cost calculation engine for the FOB-to-landed segment)
- `decimal.js` for margin calculations
- Consumed by: F-OPS-01 (Dashboard summary cards)

---

### F-CAL-04: FTZ Savings Modeler

**Description:** The platform's primary differentiator. Models the financial advantage of importing goods through a Foreign Trade Zone (FTZ) versus standard customs entry. Compares Privileged Foreign (PF) status versus General-Purpose Area (GPA) status, accounting for the April 2025 executive order that mandated PF status for reciprocal-tariff-scope goods. Includes incremental withdrawal scheduling to model cash flow optimization when goods are withdrawn in batches rather than paying all duties upfront. NPV comparison shows the time-value-of-money benefit of deferred duty payments.

**Implementation Phase:** Phase 1 / M3 (P0)

**Acceptance Criteria:**

- [ ] Input panel: unit value (FOB), total units, locked duty rate (FTZ entry date), current/future duty rate, monthly storage cost, withdrawal frequency (weekly/biweekly/monthly/quarterly), units per withdrawal, analysis duration (1-60 months), zone status (PF/NPF)
- [ ] April 2025 executive order detection: when HTS code falls within reciprocal tariff scope, system flags "PF status mandatory" and disables GPA option with explanation
- [ ] PF vs. GPA comparison table showing duty owed under each status election
- [ ] Incremental withdrawal schedule: week-by-week or month-by-month calendar showing units withdrawn, duty owed per period, cumulative duty paid, remaining inventory
- [ ] NPV comparison: present value of duty-locked FTZ entry vs. duty-at-import, using user-configurable discount rate (default 8%)
- [ ] IRR calculation on FTZ setup cost ($15K-$50K typical) vs. projected duty savings
- [ ] Cumulative savings chart (Recharts AreaChart) showing FTZ vs. non-FTZ cost curves diverging over time
- [ ] Tariff escalation scenario overlay: show savings if duty rate increases by user-specified percentage at month N
- [ ] Break-even month clearly indicated on the savings chart
- [ ] PDF export with full analysis, charts, and regulatory citations
- [ ] OFIS database integration: 260+ FTZ locations searchable by state and proximity to destination port

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/calculate/ftz-savings` | Run FTZ savings analysis |
| GET | `/api/ftz/zones?state=...&near=...` | Search OFIS FTZ database |
| POST | `/api/export/ftz-analysis/pdf` | Generate PDF report |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `FTZInputPanel` | Grouped inputs: Inventory, Duty Rates, Withdrawal Plan, Zone Status |
| `FTZSavingsChart` | Area chart comparing FTZ vs. non-FTZ cumulative costs |
| `WithdrawalScheduleTable` | Period-by-period withdrawal calendar with running totals |
| `PFvsGPAComparison` | Side-by-side comparison cards with mandatory PF flag |
| `FTZSiteFinder` | Map component showing 260+ FTZ locations with filters |
| `ExecutiveOrderBanner` | Alert banner when HTS code triggers April 2025 PF mandate |
| `NPVComparisonCard` | Present value comparison with discount rate slider |

**Dependencies:**

- F-CAL-01 (HTS code lookup for duty rates and executive order scope detection)
- F-CAL-02 (Landed Cost engine for base cost calculation)
- OFIS JSON dataset (260+ zones, build-time download)
- `decimal.js` for NPV/IRR calculations
- Consumed by: F-OPS-03 (Shipment detail FTZ tab)

---

### F-CAL-05: Route Comparison Tool

**Description:** Side-by-side comparison of up to 3 shipping routes or carriers for a given origin-destination pair. Displays transit time, estimated cost, reliability score, number of transshipment points, and backhaul availability. This is the most-requested feature from freight broker users — it replaces the manual process of calling 3 carriers and building a comparison spreadsheet. Output is designed to be sent directly to a client as a polished PDF proposal.

**Implementation Phase:** Phase 1 / M2 (P0)

**Acceptance Criteria:**

- [ ] Input: origin port (UN/LOCODE search), destination port (UN/LOCODE search), cargo type (FCL/LCL), container size (20GP/40GP/40HC), weight (kg), volume (CBM)
- [ ] System returns 3 route options ranked by composite score (cost 40%, speed 30%, reliability 30%)
- [ ] Each option displays: carrier name, service name, transit time (days), estimated cost ($/TEU or $/FEU), reliability score (%), transshipment ports, vessel name (if available), next sailing date
- [ ] Backhaul availability indicator: badge on routes with return-leg pricing advantage
- [ ] Interactive map visualization showing all 3 routes overlaid with color differentiation (F-CAL-05 uses the MapViewer shared component)
- [ ] Comparison table with row highlighting for best-in-category (cheapest, fastest, most reliable)
- [ ] PDF export: professional proposal format with route map, comparison table, and cost breakdown
- [ ] Phase 1: rates from curated static dataset based on published rate indices
- [ ] Phase 2: live rates from Freightos Baltic Index, Maersk, and CMA CGM APIs (F-401/402/403)

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/routes/compare` | Return 3 route options for origin-destination pair |
| GET | `/api/ports/search?q=...` | Search ports by name or UN/LOCODE |
| POST | `/api/export/route-comparison/pdf` | Generate PDF proposal |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `RouteComparisonForm` | Origin/destination port search, cargo details |
| `RouteComparisonTable` | 3-column comparison with best-in-category highlighting |
| `RouteMapOverlay` | MapViewer with 3 colored route arcs |
| `BackhaulBadge` | Visual indicator for backhaul pricing advantage |
| `CarrierCard` | Individual route option card with key metrics |
| `PortSearchInput` | Autocomplete search over 3,700+ World Port Index entries |

**Dependencies:**

- World Port Index dataset (3,700+ ports with lat/long)
- UN/LOCODE port codes dataset
- `searoute-js` for route path generation
- MapViewer shared component (deck.gl + MapLibre)
- Phase 2: F-401 (Freightos), F-402 (Maersk API), F-403 (CMA CGM API)

---

### F-CAL-06: Container Utilization Calculator

**Description:** Calculates how many units of a product fit in a standard shipping container, accounting for both volume and weight constraints. Supports 20GP, 40GP, 40HC, and reefer container types. Shows which constraint (volume or weight) is the binding factor and calculates the cost per unit based on container shipping cost. Includes pallet pattern optimization for palletized cargo and CBM (cubic meter) calculation from product dimensions.

**Implementation Phase:** Phase 1 / M1 (P1)

**Acceptance Criteria:**

- [ ] Input: product dimensions (L x W x H in cm or inches), product weight (kg or lbs), units per carton, carton dimensions, pallet dimensions (optional)
- [ ] Container options: 20GP (33.2 CBM / 21,700 kg), 40GP (67.7 CBM / 26,680 kg), 40HC (76.3 CBM / 26,460 kg), Reefer 40ft (59.3 CBM / 27,700 kg)
- [ ] Calculates: CBM per unit, CBM per carton, total CBM, total weight, units per container (volume-limited), units per container (weight-limited), effective units per container (lower of both)
- [ ] Binding constraint clearly highlighted: "Your shipment is VOLUME-limited" or "WEIGHT-limited"
- [ ] Pallet pattern calculator: cartons per pallet layer, layers per pallet, pallets per container
- [ ] Reefer premium overlay: shows cost difference between standard and temperature-controlled containers
- [ ] Cost per unit calculated: container shipping cost / effective units
- [ ] Visual 3D container loading diagram (simplified — show fill percentage, not actual 3D rendering)
- [ ] Dimensional weight comparison for air freight (factor: 6000 cm3/kg)

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/calculate/container-utilization` | Run container utilization calculation |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `ContainerCalcForm` | Product dimensions, weight, carton details |
| `ContainerTypeSelector` | Visual cards for 20GP/40GP/40HC/Reefer with specs |
| `UtilizationGauge` | Percentage fill indicator (volume and weight bars) |
| `BindingConstraintAlert` | Highlighted indicator showing which constraint limits capacity |
| `PalletPatternTable` | Cartons per layer, layers, pallets per container |
| `CostPerUnitCard` | Shipping cost divided by effective units |

**Dependencies:**

- Container specification constants (`lib/constants/containers.ts`)
- Consumed by: F-CAL-02 (units per container feeds landed cost), F-CAL-03 (unit economics)

---

### F-CAL-07: Freight Rate Estimator

**Description:** Provides estimated freight costs across multiple transport modes: ocean FCL, ocean LCL, air freight, and domestic ground. Breaks out surcharges (BAF, PSS, EBS, GRI, peak season, port congestion) separately from base rates so users understand the true cost composition. Phase 1 uses curated rate data from published indices; Phase 2 integrates live carrier APIs.

**Implementation Phase:** Phase 2 / M4 (P1)

**Acceptance Criteria:**

- [ ] Input: origin, destination, cargo weight, cargo volume, transport mode (ocean FCL, ocean LCL, air, ground), container type (for FCL)
- [ ] Ocean FCL output: base rate ($/FEU), BAF (bunker adjustment), PSS (peak season), EBS (emergency bunker), GRI (general rate increase), port congestion surcharge, total all-in rate
- [ ] Ocean LCL output: rate per CBM or per ton (W/M — whichever is greater), minimum charge
- [ ] Air freight output: rate per kg (actual or volumetric, whichever is greater), fuel surcharge, security surcharge, minimum charge
- [ ] Ground output: rate per mile or flat rate by zone, fuel surcharge, accessorial charges
- [ ] 13-week rate trend chart for ocean routes (FBX index data in Phase 2)
- [ ] Surcharge breakout as stacked bar chart showing base rate vs. surcharges
- [ ] Rate validity period displayed (quotes typically valid 7-15 days)
- [ ] Disclaimer: "Estimates based on published rate indices. Actual rates may vary. Contact carriers for firm quotes."

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/calculate/freight-rate` | Estimate freight rate by mode |
| GET | `/api/rates/trends?route=...&weeks=13` | Rate trend data for chart |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `FreightRateForm` | Mode selector, origin/destination, cargo details |
| `SurchargeBreakoutChart` | Stacked bar showing base rate + individual surcharges |
| `RateTrendChart` | 13-week line chart of spot rate index |
| `ModeComparisonCards` | Side-by-side ocean vs. air vs. ground cost summary |
| `RateValidityBanner` | Shows rate quote validity period and data source |

**Dependencies:**

- Phase 1: curated rate data in `/data/freight-rates.json`
- Phase 2: F-401 (Freightos Baltic Index), F-402 (Maersk API), F-403 (CMA CGM API)
- Consumed by: F-CAL-02 (ocean freight component of landed cost), F-CAL-05 (route comparison)

---

### F-CAL-08: Tariff Scenario Modeler

**Description:** "What if tariffs change?" analysis tool. Models the impact of duty rate changes on landed cost, unit economics, and FTZ savings. Specifically designed for the volatile trade policy environment where Section 301, Section 232, and reciprocal tariff rates change multiple times per year. Allows users to model escalation scenarios (e.g., 25% to 45% to 60%) and country-of-origin pivot analysis (e.g., shift sourcing from China to Vietnam).

**Implementation Phase:** Phase 3 / M11 (P1)

**Acceptance Criteria:**

- [ ] Input: current HTS code + duty rate, up to 5 scenario rate changes with effective dates
- [ ] Scenario types: rate increase, rate decrease, new Section 301 action, de minimis threshold change ($800 to $0), country-of-origin shift
- [ ] Output: side-by-side comparison of current vs. each scenario showing: landed cost per unit, margin impact, annual duty cost difference, FTZ savings change
- [ ] Country-of-origin pivot table: same product sourced from China, Vietnam, India, Cambodia, Thailand with respective duty rates and landed costs
- [ ] De minimis modeling: impact of eliminating the $800 de minimis threshold on direct-to-consumer shipments
- [ ] Timeline visualization: duty rate changes plotted on a timeline with cost impact at each change
- [ ] Integration with FTZ Modeler: show how FTZ entry at current rates protects against each scenario
- [ ] Pre-loaded scenarios: "Section 301 escalation," "Universal baseline tariff," "USMCA nearshoring shift"
- [ ] PDF export with all scenarios compared

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/calculate/tariff-scenario` | Run multi-scenario tariff analysis |
| GET | `/api/tariff/scenarios/presets` | Return pre-configured scenario templates |
| POST | `/api/export/tariff-scenario/pdf` | Generate PDF report |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `ScenarioBuilder` | Add up to 5 rate change scenarios with dates and rates |
| `ScenarioComparisonTable` | Multi-column comparison of all scenarios |
| `CountryPivotTable` | Same-product comparison across 5+ origin countries |
| `TariffTimelineChart` | Timeline showing rate changes with cost impact markers |
| `PresetScenarioCards` | One-click load of common tariff change scenarios |
| `DeMinimisToggle` | Switch to model $800 threshold elimination |

**Dependencies:**

- F-CAL-01 (HTS codes and current duty rates)
- F-CAL-02 (Landed Cost engine for recalculation under each scenario)
- F-CAL-04 (FTZ savings comparison per scenario)
- Consumed by: F-AI-05 (Compliance Monitoring alert triggers)

---

## Module 3: Shipment Operations

**Routes:** `/dashboard`, `/shipments`, `/shipments/:id`
**Owner:** Product Engineering
**Phase:** Phase 1 (M3) for basic dashboard, Phase 2 (M5-M6) for operations

This module manages the lifecycle of a shipment from creation through delivery. It transforms the platform from a calculator suite into an operational tool where users can track containers, monitor costs against budgets, and maintain a centralized view of all active trade activity.

---

### F-OPS-01: Executive Dashboard

**Description:** The authenticated user's landing page after login. Displays high-level KPIs, active shipment summary, monthly cost trends, and quick-action buttons for the most common workflows. Designed to answer "what do I need to know right now?" in under 5 seconds. Cards are role-aware — Viewers see read-only summaries while Owners see actionable alerts.

**Implementation Phase:** Phase 1 / M3 (P0)

**Acceptance Criteria:**

- [ ] KPI row (4 cards): Active Shipments, Monthly Spend (vs. budget), Duty Savings (FTZ), Pending Actions
- [ ] Each KPI card shows: current value, period-over-period change (% delta), sparkline trend (8 weeks)
- [ ] Active shipments by status: horizontal bar showing count in each status (In Transit / At Port / In FTZ / Delivered / Exception)
- [ ] Monthly cost trend chart (Recharts): 12-month view of total landed cost, broken by duty, freight, and other
- [ ] Quick actions panel: "New Calculation", "Track Container", "Upload Document", "Run HTS Lookup"
- [ ] Recent activity feed: last 10 events across all shipments (status changes, document uploads, cost updates)
- [ ] Cold chain vs. general cargo split toggle (shows metrics filtered by cargo type)
- [ ] Dashboard loads in < 1 second with up to 50 active shipments
- [ ] Responsive: 4 KPI cards stack to 2x2 grid on tablet, single column on mobile

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/dashboard/summary` | KPI values + sparkline data |
| GET | `/api/dashboard/cost-trends?months=12` | Monthly cost breakdown |
| GET | `/api/dashboard/activity?limit=10` | Recent activity feed |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `KPICard` | Metric value + delta + sparkline (shared component) |
| `ShipmentStatusBar` | Horizontal segmented bar showing shipment counts by status |
| `CostTrendChart` | 12-month Recharts area chart with duty/freight/other breakdown |
| `QuickActionGrid` | 4 action buttons linking to primary workflows |
| `ActivityFeed` | Chronological list of recent events with icons and timestamps |
| `CargoTypeToggle` | Cold chain / General cargo / All filter |

**Dependencies:**

- F-IAM-02 (authentication required)
- F-OPS-02 (shipment data for status counts)
- F-OPS-07 (activity events for feed)
- Module 2 calculators (for saved calculations count)

---

### F-OPS-02: Shipment List

**Description:** A filterable, sortable table of all shipments in the user's organization. Supports status tabs (All / In Transit / At Port / In FTZ / Delivered / Exception) for quick filtering. Each row shows essential shipment details with click-through to the full shipment detail view. Designed for both the overview user scanning 50 shipments and the operator looking for a specific container.

**Implementation Phase:** Phase 1 / M3 (P0)

**Acceptance Criteria:**

- [ ] Table columns: Shipment ID, Origin, Destination, Status, Carrier, Container #, ETA, Cost (estimated), Last Update
- [ ] Status tabs: All, In Transit, At Port, In FTZ, Delivered, Exception — tab counts shown in badges
- [ ] Column sorting: click header to sort asc/desc on any column
- [ ] Text search: filter by shipment ID, container number, origin, destination, or carrier name
- [ ] Date range filter: show shipments with ETA within selected range
- [ ] Bulk actions (Admin+): mark as delivered, export selected as CSV, archive
- [ ] Pagination: 25 rows per page with page controls
- [ ] Empty state: "No shipments yet" with CTA to create first shipment
- [ ] Row click navigates to `/shipments/:id` (F-OPS-03)
- [ ] Status badge uses color coding: blue (in transit), amber (at port), purple (in FTZ), green (delivered), red (exception)
- [ ] Mobile: table switches to card layout below 768px

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/shipments?status=...&q=...&page=...&sort=...` | List shipments with filters |
| PATCH | `/api/shipments/bulk` | Bulk status update |
| GET | `/api/shipments/export/csv` | Export filtered shipments as CSV |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `ShipmentTable` | DataTable (shared) with shipment-specific columns and row actions |
| `StatusTabs` | Tab bar with count badges for each shipment status |
| `ShipmentSearchBar` | Text search + date range filter |
| `ShipmentRow` | Table row with status badge, carrier logo, and ETA countdown |
| `BulkActionBar` | Appears when rows are selected, shows available bulk actions |
| `EmptyShipmentState` | Illustrated empty state with "Create Shipment" CTA |

**Dependencies:**

- F-IAM-02 (authentication)
- F-IAM-05 (role-based visibility — Members see own, Admin sees all)
- DataTable shared component (@tanstack/react-table)
- Consumed by: F-OPS-01 (dashboard status summary), F-OPS-03 (detail navigation)

---

### F-OPS-03: Shipment Detail

**Description:** The comprehensive view of a single shipment. Organized in tabs: Timeline (status history), Position (map with current location), Documents (linked files), Cost Breakdown (actual vs. estimated), FTZ (zone entries and withdrawals), and Notes (team communication). This is where operators spend most of their time — every piece of information about a shipment is accessible from this single page.

**Implementation Phase:** Phase 2 / M6 (P0)

**Acceptance Criteria:**

- [ ] Header: Shipment ID, origin → destination, carrier, container number, current status badge, ETA countdown
- [ ] Timeline tab: chronological event list (booked, gate-out, vessel-loaded, departed, arrived, customs cleared, delivered) with timestamps and source attribution
- [ ] Position tab: MapViewer showing vessel/container position (Phase 2: live from Terminal49; Phase 1: last known)
- [ ] Documents tab: list of linked documents with type, upload date, validation status; upload action button
- [ ] Cost tab: estimated vs. actual cost comparison table (duty, freight, fees — each line); variance highlighting (red if actual > estimated by > 10%)
- [ ] FTZ tab (if applicable): zone entry date, locked duty rate, withdrawal schedule, remaining inventory, cumulative duty paid
- [ ] Notes tab: threaded comments with @mentions and timestamps; Markdown support
- [ ] Action bar: "Update Status" (manual override), "Add Document", "Add Note", "Export Detail PDF"
- [ ] Responsive: tabs collapse to accordion on mobile

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/shipments/:id` | Full shipment detail with all tabs |
| PATCH | `/api/shipments/:id/status` | Manual status update |
| POST | `/api/shipments/:id/notes` | Add a note/comment |
| GET | `/api/shipments/:id/timeline` | Event timeline |
| GET | `/api/shipments/:id/costs` | Cost breakdown with estimated vs. actual |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `ShipmentHeader` | ID, route, carrier, status, ETA |
| `ShipmentTabs` | Tab navigation: Timeline, Position, Documents, Costs, FTZ, Notes |
| `ShipmentTimeline` | Vertical timeline with event nodes and descriptions |
| `ShipmentMap` | MapViewer centered on vessel/container position |
| `CostComparisonTable` | Estimated vs. actual with variance highlighting |
| `FTZWithdrawalTracker` | Entry details + withdrawal schedule + remaining inventory |
| `ShipmentNotes` | Threaded comment list with input and @mention support |

**Dependencies:**

- F-OPS-02 (navigation from list)
- F-OPS-05 (Terminal49 position data)
- F-DOC-01 (linked documents)
- F-CAL-02 (cost breakdown engine)
- F-CAL-04 (FTZ withdrawal data)
- MapViewer shared component

---

### F-OPS-04: Shipment Creation

**Description:** Users create new shipments manually or by uploading a commercial invoice / bill of lading that triggers document parsing to auto-fill fields. The creation form captures origin, destination, carrier, commodity details (HTS code, quantity, value), and expected timeline. Created shipments appear immediately in the dashboard and shipment list. Phase 2 adds auto-creation from parsed documents.

**Implementation Phase:** Phase 1 / M3 (P1)

**Acceptance Criteria:**

- [ ] Creation form: origin port, destination port, carrier (dropdown), container number (optional), HTS code (searchable from F-CAL-01), quantity, declared value (FOB), expected departure date, expected arrival date
- [ ] "Upload to auto-fill" button: upload Commercial Invoice or BOL, parser extracts fields (Phase 2: F-DOC-02)
- [ ] Validation: HTS code must be valid 10-digit format, dates must be logical (departure before arrival), required fields enforced
- [ ] Created shipment starts in "Booked" status
- [ ] Estimated cost auto-calculated using Landed Cost engine based on HTS code and declared value
- [ ] Success: redirect to new shipment detail page (F-OPS-03)
- [ ] Authenticated users only; shipment belongs to user's active organization

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/shipments` | Create new shipment |
| POST | `/api/shipments/from-document` | Create shipment from parsed document (Phase 2) |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `ShipmentCreateForm` | Multi-section form with port search, HTS lookup, dates |
| `DocumentUploadTrigger` | Upload area that triggers document parsing for auto-fill |
| `ShipmentPreview` | Summary card showing what will be created before submission |

**Dependencies:**

- F-IAM-02 (authentication)
- F-CAL-01 (HTS code search and validation)
- F-CAL-02 (estimated cost calculation)
- Phase 2: F-DOC-02 (document parsing for auto-fill)

---

### F-OPS-05: Container Tracking

**Description:** Real-time container tracking via Terminal49 API integration. Users enter a container number or BOL number and the system returns the current status, vessel position, and event history. Supports multi-carrier aggregation across Maersk, MSC, CMA CGM, Hapag-Lloyd, Evergreen, and COSCO. ETA tracking shows estimated vs. original arrival with variance. Integrated into the shipment detail view (F-OPS-03) and also available as a standalone lookup.

**Implementation Phase:** Phase 2 / M6 (P0)

**Acceptance Criteria:**

- [ ] Input: container number (e.g., MAEU1234567) or BOL number
- [ ] Terminal49 API integration with webhook for status change events
- [ ] Supported events: gate-out, vessel-loaded, in-transit, transshipment, arrived, available, picked-up
- [ ] Map visualization: vessel position on MapViewer with route line
- [ ] ETA tracking: original ETA vs. current ETA with variance displayed
- [ ] Multi-carrier support: at minimum Maersk, MSC, CMA CGM, Hapag-Lloyd, Evergreen, COSCO
- [ ] Automatic linking: when a tracked container matches an existing shipment, auto-link and update shipment status
- [ ] Status polling: every 4 hours for in-transit containers, every 1 hour for arrived containers
- [ ] Graceful degradation: if Terminal49 is unavailable, show last known state with "data may be stale" warning
- [ ] Standalone tracking page at `/track/:containerNumber` (no auth required for basic status)

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/tracking/subscribe` | Subscribe to container tracking events |
| GET | `/api/tracking/:containerId/status` | Current container status + position |
| GET | `/api/tracking/:containerId/events` | Full event history |
| POST | `/api/webhooks/terminal49` | Webhook receiver for Terminal49 push events |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `ContainerTrackingInput` | Container/BOL number input with carrier auto-detect |
| `TrackingStatusCard` | Current status, vessel, position, ETA |
| `TrackingEventTimeline` | Chronological event list from Terminal49 |
| `VesselPositionMap` | MapViewer centered on vessel with route overlay |
| `ETAVarianceIndicator` | Original vs. current ETA with delta highlighting |

**Dependencies:**

- Terminal49 API integration (API key in carrier account settings)
- MapViewer shared component
- F-OPS-03 (embedded in shipment detail)
- F-OPS-07 (triggers status notifications)

---

### F-OPS-06: Cold Chain Monitoring

**Description:** Temperature and humidity monitoring for reefer container shipments. Displays temperature readings over time, alerts when readings exceed thresholds, and tracks humidity for moisture-sensitive cargo. Critical for the founder's cold chain export business (96-97% of Lineage terminal volume). Phase 2 uses manual entry or CSV upload of temperature logger data; Phase 3 integrates IoT sensor APIs.

**Implementation Phase:** Phase 2 / M6 (P1)

**Acceptance Criteria:**

- [ ] Temperature reading input: manual entry, CSV upload (data logger export format), or API integration (Phase 3)
- [ ] Temperature chart: time-series line chart with min/max threshold bands highlighted
- [ ] Threshold configuration per shipment: min temp, max temp, max humidity (defaults by commodity type)
- [ ] Alert generation: when any reading exceeds threshold, create an exception event on the shipment
- [ ] Humidity tracking: separate chart line for humidity percentage
- [ ] Commodity presets: pre-configured thresholds for common cold chain products (produce, dairy, pharmaceuticals, frozen goods)
- [ ] Excursion report: summary of any out-of-range events with duration and severity
- [ ] PDF export of temperature log for compliance documentation

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/shipments/:id/temperature` | Submit temperature readings (manual or CSV) |
| GET | `/api/shipments/:id/temperature` | Retrieve temperature history |
| PATCH | `/api/shipments/:id/cold-chain/thresholds` | Set temperature/humidity thresholds |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `TemperatureChart` | Time-series line chart with threshold bands |
| `HumidityChart` | Humidity percentage over time |
| `ColdChainThresholdForm` | Min/max temp, humidity settings with commodity presets |
| `ExcursionAlert` | Warning card showing out-of-range events |
| `TemperatureUpload` | CSV file upload for data logger exports |

**Dependencies:**

- F-OPS-03 (embedded in shipment detail for reefer shipments)
- F-OPS-07 (threshold exceedances trigger notifications)
- Recharts for time-series visualization

---

### F-OPS-07: Status Notifications

**Description:** Real-time and asynchronous notification system for shipment events. Supports WebSocket push for in-app real-time updates, email alerts via Resend, and configurable notification rules per user. Critical events (customs holds, temperature excursions) trigger immediate notification regardless of user preferences. Users configure which event types generate notifications and at what frequency.

**Implementation Phase:** Phase 2 / M6 (P1)

**Acceptance Criteria:**

- [ ] In-app notification center: bell icon in header with unread count badge
- [ ] Notification list: chronological feed with read/unread state, click to navigate to relevant shipment
- [ ] WebSocket connection for real-time push: new events appear without page refresh
- [ ] Email notifications via Resend: configurable per-event-type (instant, daily digest, weekly digest, off)
- [ ] Configurable rules: user selects which event types trigger notifications (departure, arrival, customs hold, available for pickup, temperature alert, document required)
- [ ] Critical event override: customs holds and temperature excursions always trigger immediate email regardless of user settings
- [ ] Notification preferences page in user settings (F-ADM-06)
- [ ] Email delivery within 5 minutes of trigger event
- [ ] Mark all as read, mark individual as read/unread

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/notifications?unread=true&limit=20` | List notifications |
| PATCH | `/api/notifications/:id/read` | Mark notification as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |
| WebSocket | `/ws/notifications` | Real-time notification push |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `NotificationBell` | Header icon with unread count badge |
| `NotificationPanel` | Dropdown panel with notification list |
| `NotificationItem` | Individual notification with icon, message, time, and action link |
| `NotificationPreferences` | Settings page for event type preferences |

**Dependencies:**

- F-IAM-02 (user context for notification routing)
- F-OPS-05 (container tracking events)
- F-OPS-06 (cold chain threshold alerts)
- Resend email service
- WebSocket server (Vercel Functions with streaming, or Pusher/Ably for managed WebSockets)

---

## Module 4: AI Intelligence

**Routes:** `/tools/ai-classifier`, `/compliance`
**Owner:** AI/ML Engineering
**Phase:** Phase 3 (M7-M12)

This module deploys AI agents to handle the highest-complexity, highest-penalty-risk tasks in international trade. The HTS Classification Agent addresses the $600M+ in annual CBP penalties caused by misclassification. The Document Intelligence engine automates the most manual part of every shipment. All AI outputs include confidence scores, alternative suggestions, and prominent disclaimers that these are research aids, not legal advice.

---

### F-AI-01: HTS Classification Agent

**Description:** A multi-step AI agent powered by Claude API that classifies goods to the correct 10-digit HTS code. Uses a 6-step reasoning chain: (1) product description analysis extracting material, function, and end use; (2) GRI application for composite goods and kits; (3) Section/Chapter identification with confidence scoring; (4) heading narrowing with exclusion logic; (5) subheading selection using legal note hierarchy; (6) US-specific 10-digit national subdivision. Always outputs a primary code plus 2 alternative codes with confidence percentages and a narrative explanation of the reasoning.

**Implementation Phase:** Phase 3 / M7-M8 (P0)

**Acceptance Criteria:**

- [ ] User inputs: product description (free text, 50-500 chars), material composition (optional), end use (optional), country of origin, product images (optional, up to 3)
- [ ] Agent executes 6-step reasoning chain with each step visible to the user as it completes (streaming UI)
- [ ] Output: primary HTS code with confidence %, 2 alternative codes with confidence %, narrative reasoning (500-1000 words)
- [ ] Confidence thresholds: >= 90% green (high confidence), 70-89% amber (moderate — review recommended), < 70% red (low — seek professional review)
- [ ] When confidence < 85%, automatic link to CBP binding ruling request process
- [ ] Classification completes in < 10 seconds
- [ ] Results cross-referenced against USITC HTS database to validate code exists and is active
- [ ] Duty rate automatically populated from F-CAL-01 for each suggested code
- [ ] "Use this classification" button feeds the selected code into Landed Cost Calculator or FTZ Modeler
- [ ] > 90% accuracy at 6-digit level on a 100-product validation test set
- [ ] Prominent disclaimer: "Classification suggestions are for research purposes only. Consult a licensed customs broker for import transactions."

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/classify-hts` | Submit product for HTS classification (streaming response) |
| GET | `/api/ai/classifications/:id` | Retrieve a previous classification result |
| POST | `/api/ai/classify-hts/batch` | Batch classification for multiple products |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `ClassificationForm` | Product description textarea, material/end-use fields, image upload |
| `ReasoningChainDisplay` | 6-step accordion showing agent reasoning as it streams |
| `ClassificationResultCard` | Primary + 2 alternative codes with confidence bars |
| `ConfidenceBadge` | Green/amber/red indicator based on confidence threshold |
| `ClassificationDisclaimer` | Prominent legal disclaimer banner |
| `UseClassificationButton` | Action to feed selected code into calculators |

**Dependencies:**

- Anthropic Claude API (claude-3.5-sonnet or later)
- F-CAL-01 (HTS database for code validation and duty rate lookup)
- F-AI-02 (CBP ruling cross-reference for validation)
- pgvector or Pinecone for HTS embedding search (similar product matching)
- Consumed by: F-CAL-02, F-CAL-04, F-OPS-04

---

### F-AI-02: CBP Ruling Cross-Reference

**Description:** Searches the CBP CROSS (Customs Rulings Online Search System) database for rulings related to a classified HTS code or product description. Surfaces similar rulings that support or challenge the proposed classification, flags instances where CBP has overruled importers on similar goods, and provides guidance on when to request a binding ruling. This is the "second opinion" that gives users confidence in their classification or warns them to seek professional review.

**Implementation Phase:** Phase 3 / M8 (P1)

**Acceptance Criteria:**

- [ ] Input: HTS code (from F-AI-01 or manual entry) and/or product description keywords
- [ ] Search CROSS database for: rulings containing the HTS code, rulings with similar product descriptions (semantic search)
- [ ] Results display: ruling number, date, product description, HTS code ruled, key reasoning excerpt
- [ ] Flag "adversarial rulings" — cases where CBP overruled an importer's proposed classification for a similar product
- [ ] Summarize ruling patterns: "CBP has consistently classified similar products under [code] based on [reasoning]"
- [ ] Link to full ruling text on CBP website
- [ ] When no supporting rulings found and confidence < 85%, display: "Consider requesting a binding ruling from CBP (HQ ruling takes 30-120 days)"
- [ ] CROSS database indexed locally (web-scraped and structured) with weekly refresh

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/cbp/rulings?hts=...&q=...` | Search CBP rulings |
| GET | `/api/cbp/rulings/:rulingNumber` | Get full ruling detail |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `RulingSearchInput` | HTS code or keyword search for rulings |
| `RulingResultsList` | List of matching rulings with relevance scoring |
| `RulingDetail` | Full ruling text with key reasoning highlighted |
| `AdversarialRulingAlert` | Warning when CBP has overruled similar classifications |
| `BindingRulingCTA` | Prompt to request a binding ruling when confidence is low |

**Dependencies:**

- CBP CROSS database (web-scraped, locally indexed)
- F-AI-01 (primary consumer — validates AI classification)
- Semantic search (pgvector embeddings on ruling text)

---

### F-AI-03: UFLPA Compliance Screen

**Description:** Screens shipments and products against the Uyghur Forced Labor Prevention Act (UFLPA) Entity List. Flags goods where the country of origin, manufacturer, or supply chain path triggers enhanced CBP scrutiny under the UFLPA's rebuttable presumption. Specifically relevant for SE Asia imports where goods may be transshipped through Vietnam or Cambodia to circumvent Xinjiang origin rules. Provides documentation requirements when the rebuttable presumption may apply.

**Implementation Phase:** Phase 3 / M7 (P1)

**Acceptance Criteria:**

- [ ] Input: product description, HTS code, country of origin, manufacturer name (optional), supplier name (optional)
- [ ] Screen against UFLPA Entity List (maintained by DHS Forced Labor Enforcement Task Force)
- [ ] Flag when: manufacturer/supplier name matches entity list, country of origin is China + HTS chapter is in high-risk categories (cotton, polysilicon, tomatoes), transshipment through Vietnam/Cambodia from Chinese origin
- [ ] Risk levels: Clear (no flags), Watch (indirect risk — e.g., cotton from Vietnam that may contain Xinjiang inputs), Flagged (direct entity list match or high-risk commodity + origin)
- [ ] Documentation requirements when flagged: supply chain mapping, source verification, independent audit evidence
- [ ] Entity list updated within 24 hours of DHS publication
- [ ] Prominent disclaimer: "UFLPA screening is informational. Consult legal counsel for compliance decisions."
- [ ] Integration with shipment creation: auto-screen new shipments and add compliance flag to shipment detail

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/compliance/uflpa/screen` | Screen product against UFLPA entity list |
| GET | `/api/compliance/uflpa/entity-list` | Current entity list with last update date |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `UFLPAScreenForm` | Product details, origin, manufacturer inputs |
| `UFLPARiskBadge` | Clear/Watch/Flagged indicator with color coding |
| `EntityListMatchCard` | Shows matched entity with details and DHS link |
| `TransshipmentRiskAlert` | Warning for potential origin circumvention via third countries |
| `DocumentationChecklist` | Required docs when rebuttable presumption may apply |

**Dependencies:**

- UFLPA Entity List (CSV download from CBP, refresh daily)
- F-AI-01 (HTS classification provides product context)
- F-OPS-04 (auto-screen at shipment creation)

---

### F-AI-04: Document Intelligence

**Description:** Uses Claude Vision API to extract structured data from scanned and digital shipping documents. Handles Commercial Invoices, Packing Lists, Bills of Lading, and ISF filings. Performs cross-document validation to catch discrepancies that would trigger CBP exams (e.g., invoice value does not match BOL declared value, HTS codes inconsistent across documents). Outputs a structured JSON extraction with confidence scores per field and a discrepancy report.

**Implementation Phase:** Phase 3 / M9-M10 (P0)

**Acceptance Criteria:**

- [ ] Supported document types: Commercial Invoice, Packing List, Bill of Lading, ISF filing, CBP Entry Summary (7501), Certificate of Origin
- [ ] Accepts: PDF (typed and scanned), JPG/PNG (photographs), XLSX, CSV
- [ ] Extraction schema per document type: Commercial Invoice (seller, buyer, HTS codes, quantities, unit prices, total value, incoterms, country of origin), Packing List (carton count, CBM, gross weight, net weight, marks and numbers), BOL (shipper, consignee, notify party, port of loading, port of discharge, vessel, voyage, container numbers, seal numbers, ETA)
- [ ] Claude Vision API for image-based documents (scanned PDFs, photographs)
- [ ] Standard PDF text extraction for typed/digital PDFs
- [ ] Cross-document validation: invoice value vs. BOL declared value, HTS codes consistent across all docs, quantities match between invoice and packing list, port names consistent
- [ ] Discrepancy report: severity classification (Critical — will trigger CBP exam; Advisory — potential issue)
- [ ] Extraction accuracy: > 85% on typed PDFs, > 70% on scanned images
- [ ] Processing time: < 30 seconds per document
- [ ] Human review interface: extracted fields editable by user with "confirm" action

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/documents/:id/extract` | Trigger extraction on uploaded document |
| GET | `/api/documents/:id/extraction` | Get extraction results |
| POST | `/api/shipments/:id/validate-documents` | Cross-document validation for a shipment |
| PATCH | `/api/documents/:id/extraction` | User corrections to extracted fields |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `DocumentViewer` | Side-by-side document image + extracted fields |
| `ExtractionFieldEditor` | Editable field list with confidence indicators per field |
| `CrossDocValidationReport` | Discrepancy list with severity badges and resolution actions |
| `ExtractionConfirmButton` | User confirms extraction is correct (feeds into F-AI-06 feedback loop) |

**Dependencies:**

- Anthropic Claude Vision API
- F-DOC-01 (document storage and upload)
- F-DOC-02 (document parser for rule-based extraction as fallback)
- Vercel Blob storage for document files
- Consumed by: F-OPS-04 (auto-fill shipment from parsed documents), F-DOC-03 (ISF validation)

---

### F-AI-05: Compliance Monitoring

**Description:** Proactive monitoring system that tracks regulatory deadlines, tariff changes, and filing requirements. Generates alerts when action is needed: ISF filing countdown (24 hours before vessel departure), tariff rate changes affecting active shipments, new CBP enforcement actions, and bond/license renewal reminders. Sources data from the Federal Register, CBP announcements, and USITC tariff update feeds.

**Implementation Phase:** Phase 3 / M11-M12 (P1)

**Acceptance Criteria:**

- [ ] ISF filing countdown: for each in-transit shipment, calculate 24-hour-before-departure deadline and generate alert at 48h, 24h, and 12h marks
- [ ] Tariff change detection: monitor USITC feed for rate changes on HTS codes used by the organization; alert within 24 hours of publication
- [ ] CBP enforcement alerts: flag when new UFLPA withhold/release orders, Section 301 actions, or ADD/CVD determinations affect the organization's commodity categories
- [ ] Bond/license renewal tracking: customs bond expiry dates with 90-day, 30-day, and 7-day reminders
- [ ] Regulatory calendar: upcoming tariff action dates, public comment periods, trade agreement milestones
- [ ] Alert severity levels: Info (FYI), Warning (action needed this week), Critical (action needed today)
- [ ] Integration with notification system (F-OPS-07) for delivery via in-app, email, and WebSocket

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/compliance/alerts` | Current active compliance alerts |
| GET | `/api/compliance/calendar` | Upcoming regulatory dates and deadlines |
| GET | `/api/compliance/tariff-changes?since=...` | Recent tariff rate changes |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `ComplianceAlertBanner` | Top-of-page alert for critical compliance items |
| `ISFCountdownTimer` | Countdown to 24h filing deadline per shipment |
| `TariffChangeCard` | Rate change notification with affected HTS codes and cost impact |
| `RegulatoryCalendar` | Calendar view of upcoming regulatory dates |
| `BondRenewalReminder` | Customs bond expiry tracker |

**Dependencies:**

- Federal Register API (tariff and trade action monitoring)
- USITC tariff update feed
- F-OPS-02 (active shipments for ISF tracking)
- F-OPS-07 (notification delivery)
- F-CAL-08 (tariff scenario modeling for impact analysis)

---

### F-AI-06: Classification Feedback Loop

**Description:** Collects user feedback on AI classification accuracy to continuously improve the HTS Classification Agent. Users mark classifications as correct or incorrect, provide the actual code used, and optionally explain why. Incorrect classifications feed into an improvement queue that is reviewed and used to refine prompts, add few-shot examples, and track accuracy metrics over time.

**Implementation Phase:** Phase 3 / M8 (P1)

**Acceptance Criteria:**

- [ ] After each classification, user can mark: Correct, Partially Correct (right chapter/heading, wrong subheading), Incorrect
- [ ] If incorrect, user provides: actual HTS code used, reason for difference (optional free text)
- [ ] Monthly accuracy dashboard: % correct on first pass, distribution of confidence scores vs. actual accuracy, accuracy by HTS chapter
- [ ] Improvement queue: list of incorrect classifications prioritized by frequency and impact
- [ ] Prompt engineering pipeline: incorrect classifications used to add few-shot examples to the agent prompt
- [ ] Accuracy target: 90%+ at 6-digit level by M12 (starting from M7 baseline)
- [ ] Escalation path: classifications with < 70% confidence and no user correction flagged for human expert review

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/classifications/:id/feedback` | Submit feedback on a classification |
| GET | `/api/ai/classifications/accuracy` | Accuracy metrics dashboard data |
| GET | `/api/ai/classifications/improvement-queue` | List of classifications needing review |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `ClassificationFeedbackForm` | Correct/Incorrect toggle with actual code input |
| `AccuracyDashboard` | Charts showing accuracy trends, confidence calibration, chapter breakdown |
| `ImprovementQueue` | Admin view of incorrect classifications to review |

**Dependencies:**

- F-AI-01 (classification results to receive feedback on)
- F-IAM-05 (Admin role for improvement queue access)

---

## Module 5: Documents & Knowledge

**Routes:** `/documents`, `/knowledge`
**Owner:** Product Engineering
**Phase:** Phase 2 (M5) for document upload, Phase 3 (M9-M10) for AI processing

This module handles document storage, parsing, assembly, and the static knowledge base. Documents are the lifeblood of international trade — every shipment requires 7-12 documents, and errors in documentation are the primary cause of customs delays and penalties. The knowledge base provides self-service education on import processes, FTZ operations, and compliance requirements.

---

### F-DOC-01: Document Center

**Description:** Central repository for all shipment-related documents. Users upload, organize, and manage documents by shipment, document type, and status. Includes a template library for common trade documents (Bill of Lading, Commercial Invoice, Packing List) that users can download, fill out, and re-upload. Documents are linked to shipments and accessible from the shipment detail view.

**Implementation Phase:** Phase 2 / M5 (P0)

**Acceptance Criteria:**

- [ ] Upload: drag-and-drop or file picker, supports PDF, XLSX, CSV, JPG, PNG, max 25MB per file
- [ ] Document types: Commercial Invoice, Packing List, Bill of Lading, ISF Filing, CBP Entry Summary, Certificate of Origin, Phytosanitary Certificate, FDA Prior Notice, Other
- [ ] Organization: documents grouped by shipment, filterable by type and status (uploaded/parsed/validated/expired)
- [ ] Template library: downloadable blank templates for BOL, Commercial Invoice, Packing List in PDF and XLSX formats
- [ ] Storage: Vercel Blob with CDN-backed download URLs
- [ ] Per-account storage limit: 500MB (Starter), 5GB (Professional), 50GB (Enterprise)
- [ ] Document versioning: re-upload overwrites with version history (keep last 5 versions)
- [ ] Bulk upload: up to 10 files at once
- [ ] Search: find documents by filename, shipment ID, or document type

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/documents/upload` | Upload one or more documents |
| GET | `/api/documents?shipmentId=...&type=...` | List documents with filters |
| GET | `/api/documents/:id` | Get document metadata + download URL |
| DELETE | `/api/documents/:id` | Soft delete (retain for audit trail) |
| GET | `/api/documents/templates` | List available document templates |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `DocumentUploadArea` | Drag-and-drop zone with file type validation |
| `DocumentList` | Filterable list with type icons, status badges, and actions |
| `DocumentTypeSelector` | Dropdown to tag uploaded files with document type |
| `TemplateLibrary` | Grid of downloadable template cards |
| `StorageUsageBar` | Visual indicator of account storage usage vs. limit |

**Dependencies:**

- F-IAM-02 (authentication required)
- Vercel Blob storage
- Consumed by: F-OPS-03 (documents tab), F-DOC-02 (parser), F-AI-04 (AI extraction)

---

### F-DOC-02: Document Parser

**Description:** Rule-based extraction engine that pulls structured data from uploaded shipping documents. Handles common field layouts for Commercial Invoices (seller, buyer, HTS codes, values), Packing Lists (carton count, CBM, weight), and Bills of Lading (ports, vessel, container numbers). This is the Phase 2 extraction engine; Phase 3 adds AI-powered extraction (F-AI-04) for complex and scanned documents.

**Implementation Phase:** Phase 2 / M5 (P1)

**Acceptance Criteria:**

- [ ] Parse Commercial Invoice: extract seller name, buyer name, invoice number, date, HTS codes, line item quantities, unit prices, total value, currency, incoterms
- [ ] Parse Packing List: extract carton count, gross weight, net weight, CBM, marks and numbers
- [ ] Parse Bill of Lading: extract shipper, consignee, notify party, port of loading, port of discharge, vessel name, voyage number, container numbers, seal numbers
- [ ] Supports typed PDF text extraction (pdf-parse library)
- [ ] XLSX/CSV parsing for tabular invoice and packing list formats
- [ ] Extraction confidence score per field (high/medium/low based on pattern match quality)
- [ ] Extracted fields presented for user review and correction before saving
- [ ] Accuracy target: > 80% on typed PDFs for key fields (HTS code, total value, port names)

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/documents/:id/parse` | Trigger rule-based parsing |
| GET | `/api/documents/:id/parsed` | Get parsed field results |
| PATCH | `/api/documents/:id/parsed` | User corrections to parsed fields |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `ParsedFieldsReview` | Side-by-side document view + extracted fields with edit capability |
| `FieldConfidenceBadge` | Green/amber/red indicator per extracted field |
| `ParseTriggerButton` | "Extract Data" button on uploaded documents |

**Dependencies:**

- F-DOC-01 (uploaded documents to parse)
- `pdf-parse` for PDF text extraction
- Phase 3 upgrade path: F-AI-04 replaces rule-based with AI extraction

---

### F-DOC-03: ISF Compliance Checker

**Description:** Validates Importer Security Filing (ISF-10) requirements against uploaded or manually entered shipment data. Checks all 10 required elements, calculates the 24-hours-before-departure deadline (note: before departure, NOT before arrival — a common and costly mistake), and estimates penalty risk for missing elements ($5,000 per missing element). Generates a compliance checklist that can be shared with customs brokers.

**Implementation Phase:** Phase 2 / M5 (P0)

**Acceptance Criteria:**

- [ ] Validates 10 ISF-10 required elements: (1) Manufacturer/supplier, (2) Seller, (3) Buyer, (4) Ship-to party, (5) Country of origin, (6) HTS code (6-digit minimum), (7) Container stuffing location, (8) Consolidator, (9) Importer of record number, (10) Consignee number
- [ ] Input: manual entry form OR auto-populated from parsed documents (F-DOC-02)
- [ ] Deadline calculator: vessel departure date - 24 hours = ISF filing deadline (displayed prominently)
- [ ] Countdown timer when deadline is within 72 hours
- [ ] Penalty estimator: $5,000 per missing element, displayed as total risk exposure
- [ ] Checklist output: 10-element checklist with complete/incomplete/missing status per element
- [ ] "Send to customs broker" action: generates a sharable link or PDF with current ISF data and missing elements highlighted
- [ ] Integration with shipment detail: ISF status badge on shipment header (Complete / Incomplete / Overdue)

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/compliance/isf/validate` | Validate ISF-10 elements |
| GET | `/api/shipments/:id/isf-status` | ISF completion status for a shipment |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `ISFChecklist` | 10-element checklist with status icons |
| `ISFDeadlineCountdown` | Countdown timer to 24h-before-departure deadline |
| `PenaltyRiskCard` | Dollar amount of potential penalties for missing elements |
| `ISFShareButton` | Generate shareable link/PDF for customs broker |
| `ISFAutoFillButton` | Pull data from parsed documents to auto-fill elements |

**Dependencies:**

- F-DOC-02 (auto-fill from parsed documents)
- F-OPS-03 (embedded in shipment detail)
- F-OPS-07 (deadline alerts)

---

### F-DOC-04: Document Assembly Workflow

**Description:** Collects, validates, and assembles the complete document package required for a shipment. Tracks which documents have been uploaded and validated, flags missing or expired documents, and exports the complete set as a ZIP archive or merged PDF for customs broker handoff. Reduces the most common cause of customs delays — incomplete documentation.

**Implementation Phase:** Phase 3 / M9-M10 (P1)

**Acceptance Criteria:**

- [ ] Per-shipment document checklist auto-generated based on: origin country, destination port, commodity HTS code, import value, cargo type
- [ ] Required documents identified: Commercial Invoice, Packing List, BOL, ISF, CBP Entry Summary, Certificate of Origin (if FTA applies), phytosanitary certificate (produce), FDA prior notice (food/pharma)
- [ ] Checklist tracks: document uploaded (yes/no), parsed (yes/no), validated (yes/no), expired (yes/no)
- [ ] Missing document alerts: warning when any required document is missing and vessel departure is within 7 days
- [ ] Expired document detection: certificates with expiry dates flagged when past due
- [ ] ZIP export: download all shipment documents as a single ZIP archive with organized folder structure
- [ ] Merged PDF: combine all documents into a single PDF with table of contents
- [ ] Shareable link: generate a time-limited URL (7 days) for customs broker to access the document package

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/shipments/:id/document-checklist` | Auto-generated required document list |
| POST | `/api/shipments/:id/documents/export/zip` | Export all docs as ZIP |
| POST | `/api/shipments/:id/documents/export/pdf` | Merge all docs into single PDF |
| POST | `/api/shipments/:id/documents/share` | Generate shareable link |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `DocumentChecklist` | Visual checklist with upload/parse/validate status per required document |
| `MissingDocumentAlert` | Warning banner listing missing documents with deadline |
| `DocumentExportMenu` | ZIP / PDF / Share link export options |
| `BrokerShareDialog` | Generate and copy shareable link with expiry settings |

**Dependencies:**

- F-DOC-01 (document storage)
- F-DOC-02 / F-AI-04 (document parsing and validation)
- F-DOC-03 (ISF compliance check)
- F-OPS-03 (shipment context for document requirements)

---

### F-DOC-05: PDF Export Engine

**Description:** Shared PDF generation engine used across all modules. Generates branded, professional PDF reports from calculation results, carrier comparisons, FTZ analyses, and shipment summaries. Uses @react-pdf/renderer for client-side generation with server-side fallback for large reports. All PDFs include the Shipping Savior logo, data source citations, generation timestamp, and appropriate disclaimers.

**Implementation Phase:** Phase 1 / M1 (P0)

**Acceptance Criteria:**

- [ ] Supported report types: Landed Cost Report, Unit Economics Report, FTZ Analysis Report, Route Comparison Proposal, Shipment Summary, ISF Checklist, Document Package Cover Sheet
- [ ] Branding: Shipping Savior logo, primary blue (#0061FF) accents, professional typography
- [ ] Data source citations: every data point includes source (e.g., "Duty rate per USITC HTS 2026.03") and last-updated timestamp
- [ ] Disclaimers: calculator-specific disclaimers auto-included based on report type
- [ ] Chart embedding: Recharts visualizations rendered as static images in PDF
- [ ] Generation time: < 5 seconds for standard reports, < 15 seconds for reports with charts
- [ ] File naming: `shipping-savior-{report-type}-{date}.pdf`
- [ ] Download triggers browser save dialog; also available as shareable URL (Vercel Blob, 30-day expiry)

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/export/pdf` | Generic PDF generation endpoint (accepts report type + data) |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `PDFExportButton` | Shared button component used across all calculators |
| `PDFPreviewModal` | Optional preview before download |
| `PDFExporter` | Wrapper around @react-pdf/renderer with brand template |

**Dependencies:**

- `@react-pdf/renderer` for PDF generation
- Vercel Blob for shareable PDF storage
- Consumed by: F-CAL-02, F-CAL-03, F-CAL-04, F-CAL-05, F-CAL-07, F-CAL-08, F-OPS-03, F-DOC-03

---

### F-DOC-06: Knowledge Base

**Description:** Static content library providing educational resources on international trade processes. Covers import process SOPs, FTZ operations guides, compliance checklists, HTS classification guides, and documentation requirements matrices. Content is authored in Markdown, rendered as searchable pages with Fuse.js full-text search. Designed as the self-service reference that reduces support burden and establishes the platform as an authority in trade education.

**Implementation Phase:** Phase 1 / M1 (P1)

**Acceptance Criteria:**

- [ ] Content sections: Import Process (step-by-step from sourcing to fulfillment), FTZ Guide (what, why, how, PF vs. GPA), Compliance Checklists (by product category and origin country), HTS Classification Guide (GRI rules, chapter structure, common pitfalls), Documentation Requirements Matrix (which docs needed for which scenarios)
- [ ] Full-text search across all knowledge base articles (Fuse.js)
- [ ] Table of contents sidebar with section navigation
- [ ] Content authored in Markdown files in `/content/knowledge-base/`
- [ ] Each article shows: last updated date, estimated read time, related calculator links
- [ ] "Try it" CTAs embedded in articles linking to relevant calculator tools
- [ ] Mobile responsive: sidebar collapses to hamburger menu
- [ ] SEO optimized: each article is a unique route (`/knowledge/:slug`) with meta tags
- [ ] Printable: articles render cleanly when printed (CSS @media print)

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/knowledge/search?q=...` | Full-text search across knowledge base |
| GET | `/api/knowledge/articles` | List all articles with metadata |
| GET | `/api/knowledge/articles/:slug` | Get single article content |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `KnowledgeBaseSidebar` | Section navigation tree |
| `ArticleRenderer` | Markdown-to-React renderer with custom components for tables, alerts, CTAs |
| `KnowledgeSearchInput` | Search bar with instant results dropdown |
| `RelatedCalculatorCTA` | Card linking to a relevant calculator from within an article |
| `ArticleMetadata` | Last updated, read time, category badge |

**Dependencies:**

- Markdown content files in `/content/knowledge-base/`
- Fuse.js for search
- Consumed by: F-AI-01 (reference material for classification guidance), F-DOC-03 (ISF requirements reference)

---

## Module 6: Administration & Analytics

**Routes:** `/analytics`, `/settings`
**Owner:** Platform Engineering
**Phase:** Phase 2 (M4-M6) for settings and billing, Phase 3 (M11-M12) for analytics

This module provides organizational administration, subscription management, analytics dashboards, and audit logging. It enables self-service account management and provides the operational intelligence that helps users optimize their supply chain spending over time.

---

### F-ADM-01: Analytics Dashboard

**Description:** Aggregate analytics across all shipments, calculations, and trade activity. Shows cost trends over time, carrier performance comparisons, route efficiency metrics, and duty savings tracking. Available in monthly and quarterly views. Designed for the operations manager or CFO who needs to understand total trade spend and identify optimization opportunities.

**Implementation Phase:** Phase 3 / M11-M12 (P1)

**Acceptance Criteria:**

- [ ] Cost trend chart: monthly total spend broken by category (duty, freight, fees, warehousing, fulfillment) over 12-24 months
- [ ] Carrier performance table: on-time delivery rate, average transit time vs. quoted, cost per TEU by carrier
- [ ] Route efficiency: cost per unit by route, identifying the most and least cost-effective trade lanes
- [ ] Duty savings tracker: cumulative FTZ savings, tariff scenario impact, classification corrections that reduced duty
- [ ] Time range selector: last 30 days, last quarter, last 6 months, last year, custom range
- [ ] Export: analytics data as CSV, charts as PNG, full report as PDF
- [ ] Comparison mode: this period vs. previous period with delta highlighting
- [ ] Dashboard loads in < 3 seconds with up to 12 months of data

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/analytics/cost-trends?range=...` | Cost breakdown over time |
| GET | `/api/analytics/carrier-performance` | Carrier comparison metrics |
| GET | `/api/analytics/route-efficiency` | Cost per unit by route |
| GET | `/api/analytics/savings-summary` | FTZ and classification savings |
| GET | `/api/analytics/export/csv` | Export analytics data |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `CostTrendChart` | Multi-series area chart with category breakdown |
| `CarrierPerformanceTable` | Sortable table with on-time rate, transit variance, cost |
| `RouteEfficiencyMap` | MapViewer with routes colored by cost efficiency |
| `SavingsTrackerCard` | Running total of duty savings with contributing factors |
| `TimeRangeSelector` | Preset and custom date range picker |
| `AnalyticsExportMenu` | CSV / PNG / PDF export options |

**Dependencies:**

- F-OPS-02 (shipment data for cost and route analysis)
- F-OPS-05 (carrier performance from tracking data)
- F-CAL-04 (FTZ savings calculations)
- Recharts for all visualizations

---

### F-ADM-02: Organization Settings

**Description:** Organization-level configuration page where Owners and Admins manage company profile, trade preferences, and default values that pre-populate calculators. Includes company logo upload for branded PDF exports, default origin/destination ports, preferred HTS chapters, and currency preferences.

**Implementation Phase:** Phase 2 / M4 (P1)

**Acceptance Criteria:**

- [ ] Company profile: name, address, EIN/tax ID (optional), company logo upload (for branded PDFs)
- [ ] Trade preferences: default origin countries, default destination ports, primary HTS chapters, default incoterms
- [ ] Calculator defaults: pre-fill values for customs broker fee, insurance rate, inland freight, fulfillment cost per unit
- [ ] Currency: primary currency (USD default), display format preferences
- [ ] Timezone: organization timezone for deadline calculations
- [ ] All settings saved via autosave (debounced PATCH) — no explicit save button
- [ ] Settings changes logged in audit trail (F-ADM-07)

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/org/:orgId/settings` | Get all organization settings |
| PATCH | `/api/org/:orgId/settings` | Update organization settings |
| POST | `/api/org/:orgId/logo` | Upload company logo |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `OrgProfileForm` | Company name, address, tax ID, logo upload |
| `TradePreferencesForm` | Country/port/HTS multi-selects |
| `CalculatorDefaultsForm` | Default values for common calculator inputs |
| `SettingsAutoSaveIndicator` | "Saved" / "Saving..." status indicator |

**Dependencies:**

- F-IAM-02 (authentication)
- F-IAM-05 (Owner/Admin role required)
- Vercel Blob for logo storage
- Consumed by: Module 2 calculators (pre-fill defaults)

---

### F-ADM-03: Billing & Subscription

**Description:** Stripe-powered subscription management with three plan tiers: Starter ($49/mo), Professional ($199/mo), and Enterprise ($499/mo + custom). Includes 14-day free trial for all new accounts, plan upgrade/downgrade, payment method management, and invoice history. Feature gating enforced server-side based on active plan.

**Implementation Phase:** Phase 2 / M4 (P0)

**Acceptance Criteria:**

- [ ] Plan tiers with feature gates:
  - **Trial** (14 days): All Professional features, 3 team members, 500MB storage
  - **Starter** ($49/mo): Core calculators, HTS lookup, 5 team members, 500MB storage, 50 saved calculations/mo
  - **Professional** ($199/mo): All calculators + AI classification, 25 team members, 5GB storage, unlimited calculations, API access, PDF export
  - **Enterprise** ($499/mo): All features + dedicated support, unlimited members, 50GB storage, custom integrations, SLA, audit logs
- [ ] Stripe Checkout for initial subscription
- [ ] Stripe Customer Portal for plan changes, payment method updates, and invoice downloads
- [ ] Webhook handler for: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Feature gating: server-side middleware checks plan before allowing access to gated features
- [ ] Grace period: 7 days after payment failure before downgrade to free/limited access
- [ ] Annual billing option: 2 months free (billed annually)
- [ ] Proration: mid-cycle upgrades prorated; downgrades effective at next billing cycle

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/billing/checkout` | Create Stripe checkout session |
| POST | `/api/billing/portal` | Create Stripe customer portal session |
| POST | `/api/webhooks/stripe` | Stripe webhook handler |
| GET | `/api/billing/subscription` | Current plan, status, next billing date |
| GET | `/api/billing/invoices` | Invoice history |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `PlanComparisonTable` | Feature comparison across all tiers |
| `CurrentPlanCard` | Active plan with billing date and usage metrics |
| `UpgradePrompt` | In-context prompt when user hits a feature gate |
| `BillingHistory` | Invoice list with download links |
| `TrialBanner` | Days remaining in trial with upgrade CTA |

**Dependencies:**

- Stripe API (checkout, subscriptions, webhooks, customer portal)
- F-IAM-01 (org creation starts trial)
- F-IAM-06 (member count limits per plan)
- Consumed by: All feature-gated functionality across modules

---

### F-ADM-04: API Key Management

**Description:** Professional and Enterprise plan users can generate API keys to access Shipping Savior calculators programmatically. Keys are displayed once on creation, stored as hashed values, and support usage tracking with rate limits. Enables integration with internal tools, ERP systems, and third-party applications.

**Implementation Phase:** Phase 3 / M11 (P2)

**Acceptance Criteria:**

- [ ] Available to Professional and Enterprise plans only
- [ ] Create API key: generate a random key (sk_live_...), display once, store SHA-256 hash
- [ ] Key metadata: name/label, created date, last used date, request count
- [ ] Rate limits: Professional — 10,000 requests/day; Enterprise — 100,000 requests/day
- [ ] Key revocation: immediate effect, all subsequent requests rejected
- [ ] Usage dashboard: requests per day chart, top endpoints, error rate
- [ ] API documentation link: OpenAPI 3.0 spec at `/api/docs`
- [ ] Maximum 5 keys per organization (Professional), 20 keys (Enterprise)

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/keys` | Create new API key |
| GET | `/api/keys` | List all keys (hashed, with metadata) |
| DELETE | `/api/keys/:keyId` | Revoke an API key |
| GET | `/api/keys/:keyId/usage` | Usage statistics for a key |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `APIKeyList` | Table of keys with name, created, last used, actions |
| `CreateKeyDialog` | Name input + display raw key once with copy button |
| `KeyUsageChart` | Requests per day line chart |
| `RateLimitIndicator` | Current usage vs. daily limit bar |

**Dependencies:**

- F-ADM-03 (plan-based feature gate)
- F-IAM-05 (Owner/Admin role required)
- Redis/Upstash for rate limiting

---

### F-ADM-05: Carrier Account Integration

**Description:** Configuration page where users enter API credentials for carrier services (Maersk Developer Portal, CMA CGM API) and tracking services (Terminal49). Credentials are validated on entry, stored encrypted, and used by the platform to fetch live rates and tracking data. Only available to organizations on Professional or Enterprise plans.

**Implementation Phase:** Phase 2 / M4 (P1)

**Acceptance Criteria:**

- [ ] Supported integrations: Maersk Developer Portal (API key + secret), CMA CGM API Portal (API key), Terminal49 (API key), Freightos Baltic Index (API key — Enterprise only)
- [ ] Credential validation: test API call on submission to verify credentials are valid
- [ ] Encrypted storage: AES-256-GCM encryption at rest, decrypted only at runtime for API calls
- [ ] Status indicators: Connected (green), Invalid Credentials (red), Rate Limited (amber), Not Configured (gray)
- [ ] Connection health check: daily automated test to verify credentials still work
- [ ] Disconnect action: remove stored credentials
- [ ] API key fields masked after entry (show last 4 characters only)

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/org/:orgId/integrations/:carrier` | Save carrier credentials |
| GET | `/api/org/:orgId/integrations` | List all integrations with status |
| DELETE | `/api/org/:orgId/integrations/:carrier` | Remove carrier credentials |
| POST | `/api/org/:orgId/integrations/:carrier/test` | Test credentials |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `CarrierIntegrationList` | Grid of carrier cards with connection status |
| `CarrierCredentialForm` | API key / secret input with validation button |
| `IntegrationStatusBadge` | Connected/Invalid/Limited/NotConfigured indicator |
| `CredentialMask` | Masked display of stored credentials |

**Dependencies:**

- F-ADM-03 (Professional/Enterprise plan gate)
- F-IAM-05 (Owner/Admin role required)
- Consumed by: F-CAL-05 (live carrier rates), F-CAL-07 (freight rate data), F-OPS-05 (container tracking)

---

### F-ADM-06: Notification Preferences

**Description:** User-level configuration for how and when they receive notifications. Controls email digest frequency, alert threshold sensitivity, and channel selection (in-app, email, or both) per event type. Integrated with the notification system (F-OPS-07) to respect user preferences while maintaining critical alert overrides.

**Implementation Phase:** Phase 2 / M6 (P1)

**Acceptance Criteria:**

- [ ] Per-event-type configuration: Shipment Departure, Shipment Arrival, Customs Hold, Container Available, Temperature Alert, ISF Deadline, Tariff Change, Document Required
- [ ] Channel selection per event: In-app only, Email only, Both, Off
- [ ] Email digest frequency: Instant, Daily (9am org timezone), Weekly (Monday 9am), Off
- [ ] Critical events override: Customs Hold and Temperature Alert always send instant email regardless of user settings (with explanatory note in UI)
- [ ] Quiet hours: optional window (e.g., 10pm-7am) where non-critical emails are held for next morning
- [ ] Unsubscribe link in every email (one-click, per event type)
- [ ] Settings apply immediately — no "save" button, uses autosave

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/users/me/notification-preferences` | Get current preferences |
| PATCH | `/api/users/me/notification-preferences` | Update preferences |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `NotificationPreferencesGrid` | Grid of event types with channel toggles |
| `DigestFrequencySelector` | Dropdown for email digest timing |
| `QuietHoursConfig` | Time range picker for quiet hours |
| `CriticalOverrideNote` | Info callout explaining non-overridable critical alerts |

**Dependencies:**

- F-OPS-07 (notification delivery system)
- Resend email service
- F-IAM-02 (user context)

---

### F-ADM-07: Audit Log

**Description:** Compliance-grade audit log tracking all sensitive actions across the platform. Required for customs compliance (CBP 19 CFR 163.4 mandates 5-year record retention for import documentation). Logs who did what, when, from where (IP), and the before/after state for data changes. Queryable by Owners and Admins with full-text search, date range, and action type filters.

**Implementation Phase:** Phase 3 / M11-M12 (P1)

**Acceptance Criteria:**

- [ ] Tracked actions: login/logout, role changes, shipment creation/edit/deletion, document upload/download/deletion, calculation save/share, API key creation/revocation, billing changes, settings changes, classification feedback
- [ ] Log entry fields: timestamp, user ID, user email, action type, resource type, resource ID, IP address, user agent, before state (JSON), after state (JSON)
- [ ] Retention: 5 years minimum (per CBP 19 CFR 163.4)
- [ ] Query interface: filter by date range, action type, user, resource; full-text search on action descriptions
- [ ] Export: CSV download of filtered log entries
- [ ] Immutable: log entries cannot be edited or deleted (append-only table with no DELETE permissions)
- [ ] Performance: query returns in < 2 seconds for 1 million log entries with indexed filters
- [ ] Accessible to Owner and Admin roles only

**API Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/org/:orgId/audit-log?action=...&user=...&from=...&to=...` | Query audit log |
| GET | `/api/org/:orgId/audit-log/export/csv` | Export filtered log as CSV |

**UI Components:**

| Component | Description |
|-----------|-------------|
| `AuditLogTable` | Paginated table with action, user, timestamp, and detail expansion |
| `AuditLogFilters` | Date range, action type, and user filters |
| `AuditLogDetail` | Expanded view showing before/after state diff |
| `AuditLogExport` | CSV export button with filter-aware download |

**Dependencies:**

- F-IAM-02 (user context for log entries)
- F-IAM-05 (Owner/Admin access control)
- All modules contribute log entries via a shared `logAuditEvent()` utility

**Database Schema:**

```sql
audit_log (
  id            BIGSERIAL PRIMARY KEY,
  org_id        UUID NOT NULL REFERENCES organizations(id),
  user_id       UUID NOT NULL REFERENCES users(id),
  user_email    VARCHAR(255) NOT NULL,
  action        VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id   VARCHAR(255),
  ip_address    INET,
  user_agent    TEXT,
  before_state  JSONB,
  after_state   JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
)
-- Indexes: org_id + created_at, org_id + action, org_id + user_id
-- No DELETE or UPDATE permissions granted to application role
```

---

## Cross-Module Dependencies

The following dependency matrix shows how modules connect and which features serve as prerequisites for others.

```
Module 1 (Identity & Access)
  ├── Provides auth context to ALL other modules
  ├── F-IAM-02 (Auth) → Required by every authenticated feature
  └── F-IAM-05 (RBAC) → Controls access in Modules 3, 5, 6

Module 2 (Calculation & Analysis Tools)
  ├── F-CAL-01 (HTS Lookup) → Feeds F-CAL-02, F-CAL-04, F-CAL-08, F-AI-01
  ├── F-CAL-02 (Landed Cost) → Feeds F-CAL-03, F-CAL-04, F-OPS-03
  ├── F-CAL-04 (FTZ Modeler) → Feeds F-OPS-03 (FTZ tab), F-ADM-01 (savings tracking)
  └── F-CAL-05 (Route Comparison) → Feeds F-OPS-04 (carrier selection)

Module 3 (Shipment Operations)
  ├── Depends on Module 1 (Auth for persistence)
  ├── Depends on Module 2 (Calculators for cost estimation)
  ├── F-OPS-02 (Shipment List) → Feeds F-OPS-01 (Dashboard KPIs)
  ├── F-OPS-05 (Container Tracking) → Feeds F-OPS-03 (Position tab), F-OPS-07 (Alerts)
  └── F-OPS-07 (Notifications) → Used by Module 4 (compliance alerts), Module 5 (document deadlines)

Module 4 (AI Intelligence)
  ├── Depends on Module 2 (F-CAL-01 for HTS data validation)
  ├── F-AI-01 (HTS Agent) → Feeds F-CAL-02 (duty rate), F-OPS-04 (auto-classification)
  ├── F-AI-04 (Document Intelligence) → Enhances F-DOC-02 (parser), feeds F-OPS-04
  └── F-AI-05 (Compliance Monitoring) → Feeds F-OPS-07 (alert triggers)

Module 5 (Documents & Knowledge)
  ├── F-DOC-01 (Document Center) → Feeds F-OPS-03 (Documents tab), F-AI-04 (extraction)
  ├── F-DOC-03 (ISF Checker) → Feeds F-OPS-03 (compliance status), F-AI-05 (deadline tracking)
  └── F-DOC-05 (PDF Export) → Used by ALL calculators in Module 2

Module 6 (Administration & Analytics)
  ├── F-ADM-03 (Billing) → Gates features across ALL modules
  ├── F-ADM-05 (Carrier Accounts) → Enables live data in F-CAL-05, F-CAL-07, F-OPS-05
  └── F-ADM-07 (Audit Log) → Receives events from ALL modules
```

### Critical Path

The critical implementation path is:

```
F-IAM-01 (Register) → F-IAM-02 (Auth) → F-CAL-01 (HTS) → F-CAL-02 (Landed Cost)
  → F-DOC-05 (PDF) → F-CAL-04 (FTZ) → F-OPS-01 (Dashboard) → F-OPS-02 (Shipments)
```

Every feature on this path blocks downstream features. Delays here cascade.

---

## Shared Components

The following UI components are used across multiple modules and should be built as reusable primitives in `src/components/shared/`.

### DataTable

**Used by:** F-CAL-01 (HTS results), F-OPS-02 (Shipment list), F-ADM-01 (Carrier performance), F-ADM-07 (Audit log)

| Capability | Implementation |
|------------|---------------|
| Sorting | Column header click, asc/desc toggle |
| Filtering | Text search, dropdown filters, date range |
| Pagination | Page controls, configurable rows per page (10/25/50) |
| Selection | Checkbox column for bulk actions |
| Responsive | Table on desktop, card layout on mobile < 768px |
| Export | CSV export of visible/filtered data |
| Library | `@tanstack/react-table` v8 |

### CalculatorLayout

**Used by:** F-CAL-01 through F-CAL-08

| Capability | Implementation |
|------------|---------------|
| Layout | Left panel (inputs) + Right panel (results) on desktop; stacked on mobile |
| Export bar | PDF export, share URL, save to dashboard buttons |
| Auto-calculate | Results update on input change (debounced 300ms) |
| Responsive | Side-by-side above 1024px, stacked below |

### KPICard

**Used by:** F-OPS-01 (Dashboard), F-ADM-01 (Analytics)

| Capability | Implementation |
|------------|---------------|
| Metric display | Large number + label |
| Delta | Period-over-period change with up/down arrow and color |
| Sparkline | 8-data-point inline chart (Recharts Sparkline) |
| Loading state | Skeleton animation while data fetches |

### StatusBadge

**Used by:** F-OPS-02 (Shipment status), F-DOC-01 (Document status), F-AI-01 (Confidence level)

| Capability | Implementation |
|------------|---------------|
| Variants | info (blue), success (green), warning (amber), error (red), neutral (gray), purple |
| Size | sm, md, lg |
| Dot indicator | Optional leading dot for status |

### MapViewer

**Used by:** F-CAL-05 (Route comparison), F-OPS-03 (Shipment position), F-OPS-05 (Container tracking), F-CAL-04 (FTZ site finder)

| Capability | Implementation |
|------------|---------------|
| Base map | MapLibre GL with open-source tiles |
| Route arcs | deck.gl ArcLayer for shipping routes |
| Markers | Port markers, vessel position, FTZ locations |
| Interactivity | Hover tooltips, click for detail |
| Responsive | Full-width container, min-height 400px |
| Libraries | `react-map-gl`, `deck.gl`, `maplibre-gl` |

### PDFExporter

**Used by:** F-CAL-02, F-CAL-03, F-CAL-04, F-CAL-05, F-CAL-07, F-CAL-08, F-OPS-03, F-DOC-03, F-DOC-04

| Capability | Implementation |
|------------|---------------|
| Template | Branded header, footer with disclaimers, page numbers |
| Chart embedding | Render Recharts to canvas, embed as image |
| Generation | Client-side via `@react-pdf/renderer`, server fallback for large reports |
| Download | Browser save dialog + optional Vercel Blob URL |

### SearchInput

**Used by:** F-CAL-01 (HTS search), F-CAL-05 (Port search), F-DOC-06 (Knowledge base), F-OPS-02 (Shipment search)

| Capability | Implementation |
|------------|---------------|
| Fuzzy search | Fuse.js with configurable threshold |
| Debounce | 300ms input debounce |
| Results dropdown | Instant results below input, keyboard navigable |
| Empty state | "No results" with suggestion |
| Loading state | Spinner during search |

---

## Implementation Priority

The following table maps every feature to its implementation phase, timeline, and priority level.

**Priority Definitions:**
- **P0:** Must ship in the target phase. Blocks revenue or core user workflows.
- **P1:** Should ship in the target phase. Important but not blocking.
- **P2:** Nice to have. Can slip to next phase without impact.

### Phase 1: Core Platform MVP (M1-M3)

| Feature ID | Feature Name | Month | Priority | Dependencies |
|------------|-------------|-------|----------|-------------|
| F-CAL-01 | HTS Code Lookup | M1 | P0 | USITC data pipeline |
| F-CAL-02 | Landed Cost Calculator | M1 | P0 | F-CAL-01 |
| F-CAL-03 | Unit Economics Calculator | M1 | P0 | F-CAL-02 |
| F-CAL-06 | Container Utilization Calculator | M1 | P1 | Container specs |
| F-DOC-05 | PDF Export Engine | M1 | P0 | @react-pdf/renderer |
| F-DOC-06 | Knowledge Base | M1 | P1 | Markdown content |
| F-CAL-05 | Route Comparison Tool | M2 | P0 | Port database, searoute-js |
| F-IAM-01 | User Registration | M3 | P0 | None |
| F-IAM-02 | Authentication | M3 | P0 | F-IAM-01 |
| F-IAM-03 | Password Reset | M3 | P1 | F-IAM-01, Resend |
| F-IAM-04 | Onboarding Wizard | M3 | P0 | F-IAM-01 |
| F-CAL-04 | FTZ Savings Modeler | M3 | P0 | F-CAL-01, OFIS data |
| F-OPS-01 | Executive Dashboard | M3 | P0 | F-IAM-02 |
| F-OPS-02 | Shipment List | M3 | P0 | F-IAM-02 |
| F-OPS-04 | Shipment Creation | M3 | P1 | F-IAM-02, F-CAL-01 |

### Phase 2: Data Integration (M4-M6)

| Feature ID | Feature Name | Month | Priority | Dependencies |
|------------|-------------|-------|----------|-------------|
| F-IAM-05 | Role-Based Access Control | M4 | P1 | F-IAM-02 |
| F-IAM-06 | Team Management | M4 | P1 | F-IAM-05 |
| F-ADM-02 | Organization Settings | M4 | P1 | F-IAM-02 |
| F-ADM-03 | Billing & Subscription | M4 | P0 | Stripe API |
| F-ADM-05 | Carrier Account Integration | M4 | P1 | F-ADM-03 |
| F-CAL-07 | Freight Rate Estimator | M4 | P1 | Carrier APIs |
| F-DOC-01 | Document Center | M5 | P0 | Vercel Blob |
| F-DOC-02 | Document Parser | M5 | P1 | F-DOC-01 |
| F-DOC-03 | ISF Compliance Checker | M5 | P0 | F-DOC-02 |
| F-OPS-03 | Shipment Detail | M6 | P0 | F-OPS-02, F-DOC-01 |
| F-OPS-05 | Container Tracking | M6 | P0 | Terminal49 API |
| F-OPS-06 | Cold Chain Monitoring | M6 | P1 | F-OPS-03 |
| F-OPS-07 | Status Notifications | M6 | P1 | F-OPS-05, Resend |
| F-ADM-06 | Notification Preferences | M6 | P1 | F-OPS-07 |

### Phase 3: AI Intelligence Layer (M7-M12)

| Feature ID | Feature Name | Month | Priority | Dependencies |
|------------|-------------|-------|----------|-------------|
| F-AI-01 | HTS Classification Agent | M7-M8 | P0 | Claude API, F-CAL-01 |
| F-AI-03 | UFLPA Compliance Screen | M7 | P1 | UFLPA Entity List |
| F-AI-02 | CBP Ruling Cross-Reference | M8 | P1 | CBP CROSS database |
| F-AI-06 | Classification Feedback Loop | M8 | P1 | F-AI-01 |
| F-AI-04 | Document Intelligence | M9-M10 | P0 | Claude Vision API |
| F-DOC-04 | Document Assembly Workflow | M9-M10 | P1 | F-DOC-01, F-AI-04 |
| F-CAL-08 | Tariff Scenario Modeler | M11 | P1 | F-CAL-01, F-CAL-02 |
| F-AI-05 | Compliance Monitoring | M11-M12 | P1 | Federal Register API |
| F-ADM-01 | Analytics Dashboard | M11-M12 | P1 | F-OPS-02, F-OPS-05 |
| F-ADM-04 | API Key Management | M11 | P2 | F-ADM-03, Redis |
| F-ADM-07 | Audit Log | M11-M12 | P1 | All modules |

### Priority Summary

| Priority | Phase 1 | Phase 2 | Phase 3 | Total |
|----------|---------|---------|---------|-------|
| P0 | 9 | 5 | 2 | 16 |
| P1 | 4 | 7 | 7 | 18 |
| P2 | 0 | 0 | 1 | 1 |
| **Total** | **13** | **12** | **10** | **35** |

---

## Appendix A: Feature ID Index

| ID | Name | Module | Phase |
|----|------|--------|-------|
| F-IAM-01 | User Registration | 1 | P1/M3 |
| F-IAM-02 | Authentication | 1 | P1/M3 |
| F-IAM-03 | Password Reset | 1 | P1/M3 |
| F-IAM-04 | Onboarding Wizard | 1 | P1/M3 |
| F-IAM-05 | Role-Based Access Control | 1 | P2/M4 |
| F-IAM-06 | Team Management | 1 | P2/M4 |
| F-CAL-01 | HTS Code Lookup | 2 | P1/M1 |
| F-CAL-02 | Landed Cost Calculator | 2 | P1/M1 |
| F-CAL-03 | Unit Economics Calculator | 2 | P1/M1 |
| F-CAL-04 | FTZ Savings Modeler | 2 | P1/M3 |
| F-CAL-05 | Route Comparison Tool | 2 | P1/M2 |
| F-CAL-06 | Container Utilization Calculator | 2 | P1/M1 |
| F-CAL-07 | Freight Rate Estimator | 2 | P2/M4 |
| F-CAL-08 | Tariff Scenario Modeler | 2 | P3/M11 |
| F-OPS-01 | Executive Dashboard | 3 | P1/M3 |
| F-OPS-02 | Shipment List | 3 | P1/M3 |
| F-OPS-03 | Shipment Detail | 3 | P2/M6 |
| F-OPS-04 | Shipment Creation | 3 | P1/M3 |
| F-OPS-05 | Container Tracking | 3 | P2/M6 |
| F-OPS-06 | Cold Chain Monitoring | 3 | P2/M6 |
| F-OPS-07 | Status Notifications | 3 | P2/M6 |
| F-AI-01 | HTS Classification Agent | 4 | P3/M7-M8 |
| F-AI-02 | CBP Ruling Cross-Reference | 4 | P3/M8 |
| F-AI-03 | UFLPA Compliance Screen | 4 | P3/M7 |
| F-AI-04 | Document Intelligence | 4 | P3/M9-M10 |
| F-AI-05 | Compliance Monitoring | 4 | P3/M11-M12 |
| F-AI-06 | Classification Feedback Loop | 4 | P3/M8 |
| F-DOC-01 | Document Center | 5 | P2/M5 |
| F-DOC-02 | Document Parser | 5 | P2/M5 |
| F-DOC-03 | ISF Compliance Checker | 5 | P2/M5 |
| F-DOC-04 | Document Assembly Workflow | 5 | P3/M9-M10 |
| F-DOC-05 | PDF Export Engine | 5 | P1/M1 |
| F-DOC-06 | Knowledge Base | 5 | P1/M1 |
| F-ADM-01 | Analytics Dashboard | 6 | P3/M11-M12 |
| F-ADM-02 | Organization Settings | 6 | P2/M4 |
| F-ADM-03 | Billing & Subscription | 6 | P2/M4 |
| F-ADM-04 | API Key Management | 6 | P3/M11 |
| F-ADM-05 | Carrier Account Integration | 6 | P2/M4 |
| F-ADM-06 | Notification Preferences | 6 | P2/M6 |
| F-ADM-07 | Audit Log | 6 | P3/M11-M12 |

---

*Document generated 2026-03-26. Aligned with PRODUCT-ROADMAP.md (AI-5408) and TECHNICAL-ARCHITECTURE.md (AI-5409).*
