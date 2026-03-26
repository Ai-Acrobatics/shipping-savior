# PRD: Settings & Billing

## Overview
- **Purpose:** Centralized management of user profile, organization settings, team members, API integrations, subscription plans, billing, and notification preferences. The control panel for platform administration.
- **User persona:** Account administrators managing organization settings and team access, individual users updating their profile and preferences, billing contacts managing subscription and payment.
- **Entry points:** User avatar dropdown "Settings" link, "Manage Plan" from usage limit warnings, "Connect carriers" redirect from onboarding, direct URL `/settings`.

## Page Layout

### Desktop (1280px+)
- **Left sidebar (220px):** Vertical navigation tabs: Profile, Organization, Team, API Keys, Plan & Billing, Notifications. Active tab highlighted with left border.
- **Main content area (right):** Content for the selected settings tab. Each tab has its own form layout with "Save Changes" button fixed at bottom-right.

### Tablet (768px-1279px)
- Sidebar collapses to horizontal tab bar at top. Content full-width below.

### Mobile (< 768px)
- Tab navigation as a dropdown selector at top. Content full-width. Save button full-width sticky at bottom.

## Features & Functionality

### Feature: Profile Settings
- **Description:** Manage personal user information and credentials.
- **Fields:**
  - Full name (text input, pre-filled)
  - Email address (read-only display with "Change email" link opening a verification flow)
  - Phone number (text input, optional)
  - Job title (text input, optional)
  - Profile photo (upload, max 5MB, circular crop)
  - Time zone (dropdown, auto-detected default)
  - Language (dropdown: English only in Phase 1)
- **Password Change section:**
  - Current password (required)
  - New password (min 8 chars, strength meter)
  - Confirm new password
  - "Update Password" button
- **Edge cases:**
  - Email change: requires re-verification via email link. Old email remains until new one is verified.
  - Password mismatch: inline error on confirm field.
  - Profile photo upload failure: retain previous photo.

### Feature: Organization Settings
- **Description:** Manage company-level information that affects the entire organization.
- **Fields:**
  - Company name (text)
  - Company address (street, city, state, zip, country)
  - Company phone (text)
  - Company website (URL)
  - Tax ID / EIN (text, masked display)
  - Customs bond number (text)
  - Customs bond expiration date (date picker — feeds into Compliance Center alerts)
  - Customs broker name and contact (text)
  - Primary business type (dropdown, same as onboarding)
  - Industry vertical (dropdown, same as onboarding)
  - Default currency (dropdown: USD, EUR, GBP)
- **Edge cases:**
  - Only admin role can edit organization settings. Editor/viewer see read-only view.
  - Customs bond expiration in the past: warning badge "Bond expired — renew immediately."

### Feature: Team Management
- **Description:** Invite, manage, and remove team members with role-based access control.
- **Team member list:** Table with: Name, Email, Role, Status (Active/Pending), Last Active, Actions (Edit Role, Remove).
- **Roles:**
  - **Admin:** Full access. Can manage team, billing, org settings. Can approve documents.
  - **Editor:** Can create/edit shipments, run calculators, upload documents. Cannot manage team or billing.
  - **Viewer:** Read-only access to all data. Can run calculators but cannot save or edit.
- **Invite flow:**
  1. Click "Invite Team Member"
  2. Enter email address and select role
  3. Send invitation email
  4. Invitee receives email with link to accept and create account
  5. Status shows "Pending" until accepted
- **Edge cases:**
  - Invite to existing user (different org): "This email is already associated with another organization"
  - Reinvite: "Resend invitation" action for pending invites
  - Remove self: "You cannot remove yourself. Transfer admin role first."
  - Last admin: cannot be removed or downgraded — "Organization must have at least one admin"
  - Plan limits: Starter (3 users), Professional (10 users), Enterprise (unlimited). Show "Upgrade plan" when limit reached.

### Feature: API Key Management
- **Description:** Manage carrier API credentials and view platform API keys.
- **Carrier API Keys:**
  - Card per carrier: Maersk, CMA CGM, Hapag-Lloyd, MSC
  - Each card: carrier logo, connection status (Connected/Disconnected), Client ID (masked), "Edit", "Test", "Disconnect" buttons
  - "Edit" opens modal with Client ID and Client Secret fields
  - "Test" validates credentials against carrier API
  - "Disconnect" removes credentials (with confirmation)
- **Platform API Key (Phase 2):**
  - Generate API key for programmatic access to Shipping Savior APIs
  - Key displayed once on creation (copy button)
  - Regenerate key (invalidates previous)
  - Rate limit display per key
- **Edge cases:**
  - Carrier API credentials stored encrypted (AES-256). Never displayed in full after save.
  - Test fails: show carrier-specific error message and troubleshooting link.
  - Multiple keys per carrier: not supported (one set of credentials per carrier per org).

### Feature: Plan & Billing
- **Description:** View current subscription, change plans, manage payment methods, and access billing history.
- **Current Plan section:**
  - Plan name (Starter/Professional/Enterprise) with badge
  - Monthly price
  - Feature list with checkmarks
  - Usage stats: shipments tracked (X / limit), team members (X / limit), classifications (X / limit), saved calculations (X / limit)
  - "Change Plan" button
  - Trial countdown (if applicable): "14 days remaining in free trial"
- **Change Plan flow:**
  1. Show plan comparison table (same as onboarding Step 4)
  2. Upgrade: immediate effect, prorated charge
  3. Downgrade: takes effect at end of billing period
  4. Warning if downgrade would exceed new plan limits
- **Payment Method:**
  - Current card on file (last 4 digits, brand, expiry)
  - "Update Payment Method" opens Stripe Elements card input
  - "Add backup payment method" option
- **Billing History:**
  - Table: Date, Description, Amount, Status (Paid/Pending/Failed), Invoice link
  - Click "Invoice" to download PDF invoice
  - Filter by date range
- **Edge cases:**
  - Failed payment: banner "Payment failed. Update your payment method to avoid service interruption." with retry button.
  - Downgrade with over-limit usage: warning listing what will be restricted (e.g., "Your 8 team members exceed the Starter plan limit of 3. You'll need to remove team members before the downgrade takes effect.")
  - Annual/monthly toggle: show savings for annual.
  - Enterprise: "Contact Sales" instead of self-service billing.

### Feature: Notification Preferences
- **Description:** Control which notifications the user receives and through which channels.
- **Notification categories:**
  | Category | Email | In-App | Options |
  |----------|-------|--------|---------|
  | Shipment status updates | toggle | toggle | All updates / Delays only |
  | Compliance alerts | toggle | toggle | Critical only / All |
  | ISF deadline reminders | toggle | toggle | 48h / 24h / 6h before |
  | Tariff change notifications | toggle | toggle | My HTS codes / All changes |
  | Team activity | toggle | toggle | On / Off |
  | Billing & account | toggle | always on | — |
  | Weekly digest report | toggle | — | — |
- **Alert thresholds:**
  - Cost alert: notify when landed cost per unit exceeds $X (configurable)
  - Delay alert: notify when shipment is delayed by more than X days (configurable)
  - Bond expiry: days before expiration to alert (configurable: 60/30/14/7)
- **Edge cases:**
  - All email notifications off: show warning "You won't receive critical alerts via email. In-app notifications will still appear."
  - Unsubscribe via email link: respects preference, updates settings page.

## Usability Requirements
- **Accessibility (WCAG 2.1 AA):** All form inputs labeled. Toggle switches have `aria-checked`. Role descriptions in team management have tooltips. Card/table components use proper semantics. Masked fields have "Show" toggle with `aria-label`.
- **Keyboard navigation:** Tab through sidebar tabs, then form fields. Enter saves forms. Escape cancels modals. Sidebar tabs accessible via arrow keys.
- **Loading states:** Settings load: skeleton forms. Save: button spinner + "Saving..." Team invite: "Sending invitation..." API test: "Testing connection..."
- **Error states:** Save failure: toast "Unable to save changes. Try again." with field-level errors if validation. Invite failure: "Unable to send invitation. Check email address." Payment failure: prominent banner.
- **Empty states:** Team: only current user shown with "Invite your first team member" CTA. API keys: all carriers disconnected with "Connect a carrier to enable live schedule data."
- **Performance targets:** LCP < 1.5s. Settings save < 1s. API key test < 3s. Plan change < 2s.

## API Endpoints

### GET /api/settings/profile
- **Description:** Get current user's profile.
- **Authentication required:** Yes
- **Response (200):**
  ```json
  {
    "id": "user-uuid",
    "fullName": "Blake Johnson",
    "email": "blake@coldchainlogistics.com",
    "phone": "+1-555-123-4567",
    "jobTitle": "Founder & CEO",
    "photoUrl": "/api/settings/profile/photo",
    "timeZone": "America/Los_Angeles",
    "language": "en"
  }
  ```

### PUT /api/settings/profile
- **Description:** Update user profile.
- **Authentication required:** Yes
- **Request body:**
  ```json
  {
    "fullName": "Blake Johnson",
    "phone": "+1-555-123-4567",
    "jobTitle": "Founder & CEO",
    "timeZone": "America/Los_Angeles"
  }
  ```
- **Response (200):** Updated profile object.
- **Error responses:**
  - 400: `{ "error": "validation_error", "details": {...} }`

### PUT /api/settings/profile/password
- **Description:** Change password.
- **Authentication required:** Yes
- **Request body:**
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```
- **Response (200):** `{ "success": true, "message": "Password updated" }`
- **Error responses:**
  - 400: `{ "error": "incorrect_password", "message": "Current password is incorrect" }`
  - 400: `{ "error": "same_password", "message": "New password must be different" }`
  - 400: `{ "error": "weak_password", "message": "Password must be at least 8 characters with..." }`

### GET /api/settings/org
- **Description:** Get organization settings.
- **Authentication required:** Yes
- **Response (200):**
  ```json
  {
    "id": "org-uuid",
    "name": "Cold Chain Logistics LLC",
    "address": { "street": "...", "city": "...", "state": "...", "zip": "...", "country": "US" },
    "phone": "+1-555-000-0000",
    "website": "https://coldchainlogistics.com",
    "taxId": "**-***1234",
    "customsBond": { "number": "CB-123456", "expirationDate": "2026-12-31", "surety": "..." },
    "customsBroker": { "name": "...", "phone": "...", "email": "..." },
    "businessType": "both",
    "industry": "food_beverage",
    "defaultCurrency": "USD"
  }
  ```

### PUT /api/settings/org
- **Description:** Update organization settings.
- **Authentication required:** Yes (admin only)
- **Request body:** Partial org object (only changed fields).
- **Response (200):** Updated org object.
- **Error responses:**
  - 403: `{ "error": "forbidden", "message": "Only admin can modify organization settings" }`

### GET /api/settings/team
- **Description:** List team members.
- **Authentication required:** Yes (admin only for full list, others see limited info)
- **Response (200):**
  ```json
  {
    "members": [
      {
        "id": "user-uuid",
        "fullName": "Blake Johnson",
        "email": "blake@coldchainlogistics.com",
        "role": "admin",
        "status": "active",
        "lastActive": "2026-03-26T12:00:00Z",
        "invitedAt": "2026-01-01T00:00:00Z"
      }
    ],
    "limits": { "current": 3, "max": 10, "plan": "professional" }
  }
  ```

### POST /api/settings/team
- **Description:** Invite a new team member.
- **Authentication required:** Yes (admin only)
- **Request body:**
  ```json
  {
    "email": "teammate@coldchainlogistics.com",
    "role": "editor"
  }
  ```
- **Response (201):**
  ```json
  {
    "id": "user-uuid",
    "email": "teammate@coldchainlogistics.com",
    "role": "editor",
    "status": "pending",
    "invitedAt": "2026-03-26T12:00:00Z"
  }
  ```
- **Error responses:**
  - 400: `{ "error": "email_exists", "message": "This email is already associated with another organization" }`
  - 403: `{ "error": "plan_limit", "message": "Your plan allows 3 team members. Upgrade to add more." }`

### DELETE /api/settings/team/:userId
- **Description:** Remove a team member.
- **Authentication required:** Yes (admin only)
- **Response (200):** `{ "success": true }`
- **Error responses:**
  - 400: `{ "error": "last_admin", "message": "Cannot remove the last admin" }`
  - 400: `{ "error": "self_removal", "message": "Cannot remove yourself" }`

### GET /api/settings/api-keys
- **Description:** Get carrier API connection status.
- **Authentication required:** Yes (admin only)
- **Response (200):**
  ```json
  {
    "carriers": [
      {
        "carrier": "maersk",
        "carrierName": "Maersk",
        "connected": true,
        "clientIdMasked": "****5678",
        "lastTested": "2026-03-25T10:00:00Z",
        "lastTestResult": "success"
      }
    ]
  }
  ```

### PUT /api/settings/api-keys/:carrier
- **Description:** Update carrier API credentials.
- **Authentication required:** Yes (admin only)
- **Request body:**
  ```json
  {
    "clientId": "string",
    "clientSecret": "string"
  }
  ```
- **Response (200):** `{ "carrier": "maersk", "connected": true, "testResult": "success" }`

### GET /api/settings/billing
- **Description:** Get current plan and billing information.
- **Authentication required:** Yes (admin only)
- **Response (200):**
  ```json
  {
    "plan": {
      "name": "professional",
      "price": 149,
      "interval": "monthly",
      "trialEndsAt": null,
      "currentPeriodEnd": "2026-04-26"
    },
    "usage": {
      "shipments": { "current": 42, "limit": 500 },
      "teamMembers": { "current": 3, "limit": 10 },
      "classifications": { "current": 15, "limit": 100 },
      "savedCalculations": { "current": 28, "limit": 500 }
    },
    "paymentMethod": {
      "type": "card",
      "brand": "visa",
      "last4": "4242",
      "expMonth": 12,
      "expYear": 2027
    },
    "invoices": [
      {
        "id": "inv-uuid",
        "date": "2026-03-01",
        "amount": 149,
        "status": "paid",
        "pdfUrl": "/api/settings/billing/invoices/inv-uuid/pdf"
      }
    ]
  }
  ```

### PUT /api/settings/billing/plan
- **Description:** Change subscription plan.
- **Authentication required:** Yes (admin only)
- **Request body:**
  ```json
  {
    "plan": "enterprise",
    "interval": "annual"
  }
  ```
- **Response (200):**
  ```json
  {
    "plan": "enterprise",
    "effectiveDate": "2026-03-26",
    "proratedCharge": 250,
    "nextBillingDate": "2027-03-26"
  }
  ```
- **Error responses:**
  - 400: `{ "error": "downgrade_limit", "message": "Current usage exceeds Starter plan limits", "details": { "teamMembers": { "current": 5, "limit": 3 } } }`

### GET /api/settings/notifications
- **Description:** Get notification preferences.
- **Authentication required:** Yes
- **Response (200):**
  ```json
  {
    "preferences": {
      "shipmentUpdates": { "email": true, "inApp": true, "level": "delays_only" },
      "complianceAlerts": { "email": true, "inApp": true, "level": "all" },
      "isfReminders": { "email": true, "inApp": true, "thresholds": ["48h", "24h", "6h"] },
      "tariffChanges": { "email": true, "inApp": true, "scope": "my_codes" },
      "teamActivity": { "email": false, "inApp": true },
      "billing": { "email": true, "inApp": true },
      "weeklyDigest": { "email": true }
    },
    "thresholds": {
      "costAlert": { "enabled": true, "maxCostPerUnit": 0.75, "currency": "USD" },
      "delayAlert": { "enabled": true, "maxDelayDays": 3 },
      "bondExpiry": { "enabled": true, "alertDays": [60, 30, 14, 7] }
    }
  }
  ```

### PUT /api/settings/notifications
- **Description:** Update notification preferences.
- **Authentication required:** Yes
- **Request body:** Same structure as GET response.
- **Response (200):** Updated preferences object.

## Data Requirements
- **Database tables read/written:**
  - `users` (read/write) — profile fields, passwordHash
  - `organizations` (read/write) — org settings, customs bond info
  - `team_members` (read/write) — userId, orgId, role, status, invitedAt
  - `api_keys` (read/write) — orgId, carrier, clientIdEncrypted, clientSecretEncrypted, lastTested
  - `billing_history` (read) — orgId, invoiceId, date, amount, status, stripeInvoiceId
  - `notification_preferences` (read/write) — userId, preferences (JSONB), thresholds (JSONB)
- **External data sources:** Stripe API for payment processing, plan management, and invoice generation. Carrier APIs for credential testing. Email service for team invitations.
- **Caching strategy:** Profile and org settings cached per user session. Team list cached 5 minutes. Billing data fetched from Stripe on demand (no cache — accuracy matters). Notification preferences cached per session.

## Component Breakdown
- **Server Components:** `SettingsPage` (layout + sidebar).
- **Client Components:** `ProfileForm`, `PasswordChangeForm`, `OrganizationForm`, `TeamTable`, `InviteMemberModal`, `RoleSelector`, `CarrierApiCard`, `ApiKeyTestButton`, `PlanComparison`, `UsageMetrics`, `PaymentMethodForm` (Stripe Elements), `BillingHistoryTable`, `NotificationPreferences`, `NotificationToggle`, `ThresholdInput`, `SettingsSidebar`.
- **Shared components used:** `Input`, `Select`, `Button`, `Card`, `Table`, `Modal`, `Toggle`, `Badge`, `Toast`, `FileUpload`, `DatePicker`, `Skeleton`.
- **New components needed:** `ProfileForm`, `PasswordChangeForm`, `OrganizationForm`, `TeamTable`, `InviteMemberModal`, `CarrierApiCard`, `PlanComparison`, `UsageMetrics`, `NotificationPreferences`, `ThresholdInput`, `SettingsSidebar`.

## Acceptance Criteria
- [ ] Profile fields save correctly and display updated values
- [ ] Password change requires current password and validates strength
- [ ] Organization settings are only editable by admin role
- [ ] Team member list shows all members with roles and status
- [ ] Admin can invite new team members with role selection
- [ ] Invitation email is sent and pending status is shown
- [ ] Plan limits enforced for team member count
- [ ] Last admin cannot be removed or downgraded to editor/viewer
- [ ] Carrier API credentials save encrypted and test against live APIs
- [ ] API key masking shows only last 4 characters
- [ ] Current plan and usage stats display correctly
- [ ] Plan change flow handles upgrade (immediate) and downgrade (end of period)
- [ ] Downgrade with over-limit usage shows warning with specifics
- [ ] Stripe payment method can be added/updated
- [ ] Billing history shows all invoices with download links
- [ ] Notification preferences save and affect actual notification delivery
- [ ] Alert thresholds are configurable and respected by compliance system
- [ ] Mobile view uses dropdown tab navigation
- [ ] All settings forms show loading state during save

## Dependencies
- **This page depends on:** Authentication (PRD-APP-01) for session and role verification. Stripe for billing and payment processing. Carrier APIs for credential testing. Email service for invitations.
- **Pages that depend on this:** All pages respect role-based access from team settings. Compliance Center (PRD-APP-13) uses customs bond info and notification thresholds. Onboarding (PRD-APP-02) data can be edited here post-setup. All carrier-dependent features use API keys managed here.
