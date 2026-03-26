# PRD: Onboarding Wizard

## Overview
- **Purpose:** Guide new users through a 4-step setup wizard that configures their organization profile, trade preferences, carrier integrations, and subscription plan. Ensures the platform is personalized before first use.
- **User persona:** Newly registered user (importer, freight broker, logistics manager) who has just verified their email and is entering the platform for the first time.
- **Entry points:** Automatic redirect after email verification, redirect when authenticated user has `onboardingComplete: false`, direct URL `/onboarding`.

## Page Layout

### Wizard Container (`/onboarding`)
- **Desktop:** Full-page layout with progress stepper at top (horizontal, 4 steps with labels). Active step content in centered card (max-w-2xl). "Back" and "Continue" buttons at bottom-right. Step indicators show completed (checkmark), active (filled), upcoming (outlined).
- **Tablet:** Same layout, slightly condensed padding.
- **Mobile:** Progress stepper collapses to "Step X of 4" text with progress bar. Full-width content area. Buttons full-width and stacked.

### Step 1: Company Information
- Company name (pre-filled from registration)
- Company size dropdown (1-10, 11-50, 51-200, 201-500, 500+)
- Primary business type radio group: Importer, Exporter, Both, Freight Broker, 3PL Provider
- Industry vertical dropdown: Food & Beverage, Apparel & Textiles, Consumer Goods, Electronics, Chemicals, Other
- Country of operation (default: United States)

### Step 2: Trade Preferences
- Primary trade lanes: multi-select origin countries (Vietnam, Thailand, Indonesia, Cambodia, China, India, Bangladesh, Philippines, Other)
- Primary destination ports: multi-select US ports (Long Beach, Los Angeles, New York/Newark, Savannah, Houston, Seattle, Oakland, Other)
- Cargo types: checkboxes (General Dry, Cold Chain/Reefer, Hazardous, Oversized)
- HTS chapter interests: searchable multi-select of top-level HTS chapters (01-99) with descriptions
- Average monthly container volume: dropdown (1-5, 6-20, 21-50, 51-100, 100+)

### Step 3: Connect Carrier Accounts (Optional)
- Card per carrier: Maersk, CMA CGM, Hapag-Lloyd, MSC
- Each card has: carrier logo, "Connect" button, API key input fields (Client ID + Client Secret)
- "Test Connection" button per carrier that verifies API credentials
- Status indicator: Not Connected (gray), Connected (green checkmark), Error (red X with message)
- "Skip for now" link at bottom (can connect later in Settings)

### Step 4: Choose Plan
- Three plan cards side by side: Starter ($49/mo), Professional ($149/mo), Enterprise ($399/mo)
- Feature comparison table below cards
- Professional card highlighted as "Most Popular" with accent border
- Current trial badge on the plan matching the trial tier
- "Start Free Trial" / "Subscribe" CTA per card
- Monthly/Annual toggle (annual = 2 months free)
- "All plans include a 14-day free trial" note

## Features & Functionality

### Feature: Step-by-Step Wizard Navigation
- **Description:** Linear wizard with back/forward navigation. Progress persists server-side per step so users can resume if they leave.
- **User interaction flow:**
  1. User lands on Step 1 (or their last incomplete step)
  2. Fills in fields, clicks "Continue"
  3. Client-side validation runs; if valid, PUT /api/onboarding/step/1 saves data
  4. Advance to Step 2
  5. "Back" returns to previous step (data preserved)
  6. Steps 1-2 required, Step 3 skippable, Step 4 required
  7. After Step 4 completion: POST /api/onboarding/complete, redirect to `/dashboard`
- **Edge cases:**
  - User refreshes mid-wizard: GET /api/onboarding/status returns current step + saved data
  - User navigates directly to `/onboarding/step/3` but hasn't completed step 1: redirect to step 1
  - User tries to skip required step: "Continue" button disabled until required fields filled
  - User completed onboarding but visits `/onboarding`: redirect to `/dashboard`
- **Validation rules:** Per-step, detailed below in each step's feature.

### Feature: Company Information (Step 1)
- **Description:** Capture organizational context to personalize the platform.
- **Validation rules:**
  - Company name: 2-200 chars, required
  - Company size: required selection
  - Primary business type: required selection
  - Industry vertical: required selection
  - Country: required, defaults to "United States"

### Feature: Trade Preferences (Step 2)
- **Description:** Configure default trade lanes, cargo types, and HTS interests to pre-filter calculators and route tools.
- **Validation rules:**
  - At least 1 origin country selected
  - At least 1 destination port selected
  - At least 1 cargo type selected
  - HTS chapters: optional (but show tooltip "Select chapters relevant to your products for faster HTS lookups")
  - Container volume: required selection

### Feature: Carrier Account Connection (Step 3)
- **Description:** Optional integration with carrier APIs for schedule data and tracking.
- **User interaction flow:**
  1. User clicks "Connect" on a carrier card
  2. Card expands to show Client ID and Client Secret inputs
  3. User pastes credentials, clicks "Test Connection"
  4. System calls POST /api/onboarding/test-carrier with credentials
  5. On success: green checkmark, "Connected" status
  6. On failure: red X, error message ("Invalid credentials" or "Unable to reach carrier API")
  7. User can skip entire step
- **Edge cases:**
  - Carrier API is down: show "Carrier API temporarily unavailable. You can connect later in Settings."
  - Invalid credentials: allow retry, don't lock out
  - User connects then wants to disconnect: "Remove" button appears after connection

### Feature: Plan Selection (Step 4)
- **Description:** Choose subscription tier. All plans start with 14-day free trial.
- **User interaction flow:**
  1. Three plan cards displayed with feature lists
  2. User selects a plan card (radio-style selection)
  3. Clicks "Start Free Trial" (no payment required for trial)
  4. For paid plans after trial: redirect to Stripe Checkout (Phase 2)
  5. Plan is saved to organization record
- **Edge cases:**
  - User already has a trial running (from registration): show current trial end date
  - Enterprise plan: "Contact Sales" button instead of self-service

## Usability Requirements
- **Accessibility (WCAG 2.1 AA):** All form controls labeled. Radio groups use `role="radiogroup"` with `aria-labelledby`. Multi-select uses combobox pattern with `aria-expanded`. Progress stepper uses `aria-current="step"`.
- **Keyboard navigation:** Tab through fields in order. Enter advances to next step from last field. Escape does not close wizard (no modal). Arrow keys navigate radio groups.
- **Loading states:** "Continue" button shows spinner during save. Carrier "Test Connection" shows "Testing..." with spinner. Plan selection shows "Setting up..." after final step.
- **Error states:** Field-level inline errors. Network failure: toast "Unable to save. Check your connection and try again." with retry.
- **Empty states:** Step 3 starts with all carriers "Not Connected" — this is the default, not an error.
- **Performance targets:** LCP < 2.0s. Step transitions < 500ms (save + render next step). HTS chapter search responds < 100ms (client-side filtering).

## API Endpoints

### GET /api/onboarding/status
- **Description:** Get the user's current onboarding progress and saved data.
- **Authentication required:** Yes
- **Request parameters:** None (uses session userId)
- **Response (200):**
  ```json
  {
    "currentStep": 2,
    "completed": false,
    "steps": {
      "1": {
        "completed": true,
        "data": {
          "companyName": "Cold Chain Logistics LLC",
          "companySize": "11-50",
          "businessType": "both",
          "industry": "food_beverage",
          "country": "US"
        }
      },
      "2": {
        "completed": false,
        "data": null
      },
      "3": { "completed": false, "data": null },
      "4": { "completed": false, "data": null }
    }
  }
  ```
- **Error responses:**
  - 401: Unauthorized
- **Rate limiting:** 30 requests per minute.

### PUT /api/onboarding/step/:n
- **Description:** Save data for a specific onboarding step.
- **Authentication required:** Yes
- **Request parameters:** `n` — step number (1-4)
- **Request body (Step 1):**
  ```json
  {
    "companyName": "string",
    "companySize": "1-10 | 11-50 | 51-200 | 201-500 | 500+",
    "businessType": "importer | exporter | both | broker | 3pl",
    "industry": "food_beverage | apparel | consumer_goods | electronics | chemicals | other",
    "country": "string (ISO 3166-1 alpha-2)"
  }
  ```
- **Request body (Step 2):**
  ```json
  {
    "originCountries": ["VN", "TH", "ID"],
    "destinationPorts": ["USLGB", "USLAX"],
    "cargoTypes": ["general", "reefer"],
    "htsChapters": [6, 8, 16, 61, 62],
    "monthlyVolume": "6-20"
  }
  ```
- **Request body (Step 3):**
  ```json
  {
    "carriers": [
      {
        "carrier": "maersk",
        "clientId": "string",
        "clientSecret": "string",
        "connected": true
      }
    ]
  }
  ```
- **Request body (Step 4):**
  ```json
  {
    "plan": "starter | professional | enterprise"
  }
  ```
- **Response (200):**
  ```json
  {
    "step": 2,
    "saved": true,
    "nextStep": 3
  }
  ```
- **Error responses:**
  - 400: `{ "error": "validation_error", "details": {...} }`
  - 401: Unauthorized
  - 409: `{ "error": "step_not_sequential", "message": "Complete step 1 first" }`

### POST /api/onboarding/test-carrier
- **Description:** Test carrier API credentials.
- **Authentication required:** Yes
- **Request body:**
  ```json
  {
    "carrier": "maersk | cma_cgm | hapag_lloyd | msc",
    "clientId": "string",
    "clientSecret": "string"
  }
  ```
- **Response (200):**
  ```json
  {
    "carrier": "maersk",
    "status": "connected",
    "message": "Successfully authenticated with Maersk API"
  }
  ```
- **Error responses:**
  - 400: `{ "error": "invalid_credentials", "carrier": "maersk", "message": "Authentication failed" }`
  - 502: `{ "error": "carrier_unavailable", "carrier": "maersk", "message": "Carrier API is temporarily unavailable" }`
- **Rate limiting:** 10 tests per carrier per hour.

### POST /api/onboarding/complete
- **Description:** Mark onboarding as complete.
- **Authentication required:** Yes
- **Response (200):**
  ```json
  {
    "completed": true,
    "redirectTo": "/dashboard"
  }
  ```
- **Error responses:**
  - 400: `{ "error": "incomplete_steps", "missingSteps": [1, 4] }`

## Data Requirements
- **Database tables read/written:**
  - `organizations` — update companySize, businessType, industry, country, plan, onboardingComplete
  - `user_preferences` — write originCountries, destinationPorts, cargoTypes, htsChapters, monthlyVolume
  - `api_keys` — write carrier credentials (encrypted at rest with AES-256)
  - `onboarding_progress` — write stepNumber, stepData, completedAt per step (for resume capability)
- **External data sources:** Carrier APIs (Maersk, CMA CGM, Hapag-Lloyd, MSC) for credential testing. HTS chapter list from static `/data/hts-chapters.json`.
- **Caching strategy:** HTS chapter list cached indefinitely (static data). Onboarding progress cached per session (invalidate on step save).

## Component Breakdown
- **Server Components:** `/onboarding/page.tsx` — layout shell, fetch onboarding status, determine starting step.
- **Client Components:** `OnboardingWizard` (state machine for step navigation), `CompanyInfoStep`, `TradePreferencesStep`, `CarrierConnectionStep`, `PlanSelectionStep`, `ProgressStepper`, `CarrierCard`, `PlanCard`, `HtsChapterSearch`.
- **Shared components used:** `Button`, `Input`, `Select`, `Checkbox`, `RadioGroup`, `MultiSelect`, `Card`, `Badge`, `Toast`, `Spinner`.
- **New components needed:** `ProgressStepper`, `CarrierCard`, `PlanCard`, `HtsChapterSearch`, `OnboardingWizard`.

## Acceptance Criteria
- [ ] New users are redirected to onboarding after email verification
- [ ] Progress stepper accurately reflects completed/active/upcoming steps
- [ ] Step 1 saves company info and pre-fills company name from registration
- [ ] Step 2 allows multi-selection of countries, ports, cargo types, and HTS chapters
- [ ] Step 3 carrier connection is fully optional (can skip)
- [ ] Step 3 "Test Connection" validates credentials against live carrier APIs
- [ ] Step 4 displays three plan tiers with feature comparison
- [ ] Wizard progress persists across page refreshes and browser sessions
- [ ] Users cannot skip to step 3 without completing steps 1-2
- [ ] Completed onboarding redirects to dashboard; revisiting /onboarding also redirects
- [ ] All form fields meet WCAG 2.1 AA accessibility requirements
- [ ] Carrier API credentials are encrypted at rest
- [ ] Step transitions complete in < 500ms
- [ ] Mobile layout stacks all elements vertically with full-width buttons

## Dependencies
- **This page depends on:** Authentication system (PRD-APP-01) — user must be authenticated. Carrier APIs for connection testing. Stripe for plan billing (Phase 2).
- **Pages that depend on this:** Executive Dashboard (PRD-APP-08) uses trade preferences to personalize KPIs. HTS Lookup (PRD-APP-03) uses HTS chapter interests to pre-filter. Route Comparison (PRD-APP-06) uses origin/destination preferences as defaults. Settings (PRD-APP-16) allows editing all onboarding data post-setup.
