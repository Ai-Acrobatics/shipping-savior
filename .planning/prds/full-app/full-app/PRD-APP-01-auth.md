# PRD: Authentication & Registration

## Overview
- **Purpose:** Secure user authentication, account creation, and session management for the Shipping Savior platform. Gate all platform features behind login while offering a frictionless free trial onboarding path.
- **User persona:** New users evaluating the platform (importers, freight brokers, logistics managers), returning authenticated users, organization admins managing team access.
- **Entry points:** Direct URL (`/login`, `/register`), redirect from any protected route, marketing site CTA buttons, invitation email links.

## Page Layout

### Login Page (`/login`)
- **Desktop:** Centered card (max-w-md) on full-bleed background with subtle shipping/logistics imagery. Logo top-center, form fields, "Remember me" checkbox, "Forgot password?" link, social login dividers, registration CTA at bottom.
- **Tablet:** Same centered card, slightly wider padding.
- **Mobile:** Full-width card, no background imagery, stacked layout.

### Registration Page (`/register`)
- **Desktop:** Two-column layout. Left column: value proposition bullets, trust badges (data sources, security). Right column: registration form.
- **Tablet/Mobile:** Single column, value prop collapsed into expandable accordion above form.

### Password Reset Pages (`/reset-password`, `/reset-password/confirm`)
- **Desktop/Tablet/Mobile:** Centered card with email input (request page) or new password fields (confirm page). Progress indicator showing step 1/2.

### Components
- `AuthCard` — Container card with logo, heading, form slot
- `LoginForm` — Email/password fields, remember me, submit
- `RegisterForm` — Name, email, company name, password, confirm password, terms checkbox
- `ResetPasswordForm` — Email input for request; new password + confirm for reset
- `SocialLoginButtons` — Google and Microsoft OAuth buttons (Phase 2: disabled with "Coming Soon" badge)
- `PasswordStrengthMeter` — Real-time strength indicator during registration

## Features & Functionality

### Feature: Email/Password Login
- **Description:** Standard credential-based authentication using bcrypt-hashed passwords and JWT sessions.
- **User interaction flow:**
  1. User enters email and password
  2. Client-side validation (email format, password not empty)
  3. Submit POST /api/auth/login
  4. Server verifies credentials against bcrypt hash
  5. On success: issue JWT (httpOnly cookie, 30-day expiry), redirect to `/dashboard` or original requested URL
  6. On failure: show inline error "Invalid email or password" (no indication of which is wrong)
- **Edge cases:**
  - Account locked after 5 failed attempts in 15 minutes (show "Account temporarily locked. Try again in 15 minutes or reset your password.")
  - Unverified email: redirect to verification prompt page
  - Expired session: redirect to login with `?expired=true` query param, show toast
- **Validation rules:**
  - Email: valid format, max 255 chars
  - Password: required, no length limit on login (only on registration)

### Feature: Registration with Free Trial
- **Description:** Create a new user account and organization, automatically start a 14-day free trial of Professional plan.
- **User interaction flow:**
  1. User fills in: full name, work email, company name, password, confirm password
  2. Checks "I agree to Terms of Service and Privacy Policy"
  3. Submit POST /api/auth/register
  4. Server creates user + organization + starts 14-day trial
  5. Send verification email with magic link
  6. Redirect to `/verify-email` page with instructions
  7. On email click: verify account, redirect to `/onboarding`
- **Edge cases:**
  - Duplicate email: "An account with this email already exists. Log in or reset your password."
  - Disposable email domains: block registration with error
  - Email delivery failure: show "Didn't receive the email?" resend link (rate-limited to 1 per 60 seconds)
- **Validation rules:**
  - Full name: 2-100 chars, no special characters except hyphens and apostrophes
  - Email: valid format, not a disposable domain, max 255 chars
  - Company name: 2-200 chars
  - Password: minimum 8 chars, at least 1 uppercase, 1 lowercase, 1 number
  - Confirm password: must match
  - Terms checkbox: required

### Feature: Password Reset Flow
- **Description:** Self-service password reset via email.
- **User interaction flow:**
  1. User clicks "Forgot password?" on login page
  2. Enters email address on `/reset-password`
  3. Submit POST /api/auth/reset-password
  4. Server sends reset email with time-limited token (1 hour expiry)
  5. **Always** show "If an account exists with that email, we've sent reset instructions." (prevent email enumeration)
  6. User clicks link in email, lands on `/reset-password/confirm?token=xxx`
  7. Enters new password + confirm
  8. Submit POST /api/auth/reset-password/confirm
  9. On success: redirect to login with "Password updated successfully" toast
- **Edge cases:**
  - Invalid/expired token: "This reset link has expired. Request a new one."
  - Token already used: same message as expired
  - User tries to reuse old password: "New password must be different from your current password."

### Feature: SSO (Google, Microsoft) — Future Phase
- **Description:** OAuth 2.0 login via Google Workspace and Microsoft 365. Buttons visible but disabled in Phase 1.
- **User interaction flow:** Buttons show "Coming Soon" tooltip on hover. No functionality.

### Feature: JWT Session Management
- **Description:** Stateless JWT sessions stored in httpOnly secure cookies.
- **Details:**
  - JWT payload: `{ userId, orgId, role, email, iat, exp }`
  - Access token: 15-minute expiry, stored in httpOnly cookie
  - Refresh token: 30-day expiry, stored in httpOnly cookie, rotated on use
  - `verifySession()` middleware on all protected routes (server-side)
  - Client-side: `useSession()` hook provides user info and loading state
  - Logout: DELETE /api/auth/session — clears cookies, invalidates refresh token in DB

## Usability Requirements
- **Accessibility (WCAG 2.1 AA):**
  - All form inputs have associated `<label>` elements
  - Error messages linked to inputs via `aria-describedby`
  - Focus management: auto-focus first field on page load, focus error field on validation failure
  - Color is not the only indicator of errors (icons + text + border)
  - Minimum 4.5:1 contrast ratio for all text
- **Keyboard navigation:** Tab order follows visual layout. Enter submits forms. Escape closes modals.
- **Loading states:** Submit button shows spinner + "Signing in..." / "Creating account..." text. Disable button during submission.
- **Error states:** Inline field-level errors below each input. Toast notifications for server errors. Network error: "Unable to connect. Check your internet connection."
- **Empty states:** N/A for auth pages.
- **Performance targets:** LCP < 1.5s, FID < 50ms. No heavy JS on auth pages — minimal client components.

## API Endpoints

### POST /api/auth/register
- **Description:** Create a new user account and organization.
- **Authentication required:** No
- **Request body:**
  ```json
  {
    "fullName": "string (2-100 chars)",
    "email": "string (valid email)",
    "companyName": "string (2-200 chars)",
    "password": "string (min 8 chars)",
    "acceptedTerms": "boolean (must be true)"
  }
  ```
- **Response (201):**
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "blake@example.com",
      "fullName": "Blake Johnson",
      "role": "admin",
      "emailVerified": false
    },
    "organization": {
      "id": "uuid",
      "name": "Cold Chain Logistics LLC",
      "plan": "trial",
      "trialEndsAt": "2026-04-09T00:00:00Z"
    }
  }
  ```
- **Error responses:**
  - 400: `{ "error": "validation_error", "details": { "email": "Invalid email format" } }`
  - 409: `{ "error": "email_exists", "message": "An account with this email already exists" }`
  - 429: `{ "error": "rate_limited", "retryAfter": 60 }`
- **Rate limiting:** 5 registrations per IP per hour.

### POST /api/auth/login
- **Description:** Authenticate user and issue JWT tokens.
- **Authentication required:** No
- **Request body:**
  ```json
  {
    "email": "string",
    "password": "string",
    "rememberMe": "boolean (optional, default false)"
  }
  ```
- **Response (200):** Sets httpOnly cookies (`access_token`, `refresh_token`). Body:
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "blake@example.com",
      "fullName": "Blake Johnson",
      "role": "admin",
      "orgId": "uuid",
      "orgName": "Cold Chain Logistics LLC"
    }
  }
  ```
- **Error responses:**
  - 401: `{ "error": "invalid_credentials", "message": "Invalid email or password" }`
  - 423: `{ "error": "account_locked", "message": "Account temporarily locked", "retryAfter": 900 }`
  - 403: `{ "error": "email_not_verified", "message": "Please verify your email" }`
- **Rate limiting:** 10 attempts per email per 15 minutes. 20 attempts per IP per 15 minutes.

### POST /api/auth/reset-password
- **Description:** Request a password reset email.
- **Authentication required:** No
- **Request body:**
  ```json
  {
    "email": "string"
  }
  ```
- **Response (200):** Always returns success (prevents email enumeration):
  ```json
  {
    "message": "If an account exists with that email, we've sent reset instructions."
  }
  ```
- **Rate limiting:** 3 requests per email per hour. 10 requests per IP per hour.

### POST /api/auth/reset-password/confirm
- **Description:** Set new password using reset token.
- **Authentication required:** No
- **Request body:**
  ```json
  {
    "token": "string",
    "newPassword": "string (min 8 chars)"
  }
  ```
- **Response (200):**
  ```json
  {
    "message": "Password updated successfully"
  }
  ```
- **Error responses:**
  - 400: `{ "error": "invalid_token", "message": "This reset link has expired or is invalid" }`
  - 400: `{ "error": "same_password", "message": "New password must be different" }`

### POST /api/auth/refresh
- **Description:** Rotate access token using refresh token.
- **Authentication required:** Valid refresh token cookie
- **Response (200):** Sets new httpOnly cookies. Body:
  ```json
  { "success": true }
  ```
- **Error responses:**
  - 401: `{ "error": "invalid_refresh_token" }`

### DELETE /api/auth/session
- **Description:** Log out — clear cookies and invalidate refresh token.
- **Authentication required:** Yes (access token)
- **Response (200):**
  ```json
  { "success": true }
  ```

### GET /api/auth/verify-email?token=xxx
- **Description:** Verify email address from magic link.
- **Authentication required:** No
- **Response:** 302 redirect to `/onboarding` on success, `/verify-email?error=invalid` on failure.

## Data Requirements
- **Database tables:**
  - `users` — id, email, fullName, passwordHash, role, emailVerified, emailVerifyToken, orgId, createdAt, updatedAt
  - `organizations` — id, name, plan, trialEndsAt, createdAt, updatedAt
  - `sessions` — id, userId, refreshToken, expiresAt, createdAt (for refresh token invalidation)
  - `password_resets` — id, userId, token, expiresAt, usedAt, createdAt
  - `login_attempts` — id, email, ipAddress, success, createdAt (for rate limiting)
- **External data sources:** Email delivery service (Resend or SendGrid) for verification and reset emails.
- **Caching strategy:** No caching on auth endpoints. Rate limit counters in Redis or in-memory (Vercel KV).

## Component Breakdown
- **Server Components:** Auth page layouts (`/login/page.tsx`, `/register/page.tsx`, `/reset-password/page.tsx`) — render shell, check if already authenticated (redirect to dashboard).
- **Client Components:** `LoginForm`, `RegisterForm`, `ResetPasswordForm`, `PasswordStrengthMeter`, `SocialLoginButtons`.
- **Shared components used:** `Button`, `Input`, `Label`, `Card`, `Toast`, `Spinner`.
- **New components needed:** `AuthCard`, `PasswordStrengthMeter`, `SocialLoginButtons`, `EmailVerificationPrompt`.

## Acceptance Criteria
- [ ] User can register with email/password and receives verification email
- [ ] User can log in with verified email and correct password
- [ ] User is redirected to originally requested URL after login
- [ ] Invalid credentials show generic error (no email enumeration)
- [ ] Account locks after 5 failed attempts in 15 minutes
- [ ] Password reset flow works end-to-end (request, email, new password)
- [ ] Reset tokens expire after 1 hour and are single-use
- [ ] JWT access tokens expire after 15 minutes and auto-refresh
- [ ] Refresh tokens rotate on use (old token invalidated)
- [ ] Logout clears all cookies and invalidates refresh token
- [ ] All form fields have proper labels and aria attributes
- [ ] Tab order is logical on all auth pages
- [ ] Loading spinners show during form submission
- [ ] SSO buttons are visible but disabled with "Coming Soon" badge
- [ ] Registration creates organization with 14-day trial
- [ ] All auth pages render in < 1.5s LCP

## Dependencies
- **This page depends on:** Email delivery service (Resend/SendGrid), database (Neon PostgreSQL), rate limiting store (Vercel KV or Redis).
- **Pages that depend on this:** Every authenticated page. Onboarding wizard (PRD-APP-02) is the immediate next step after registration. All protected routes use `verifySession()` middleware from this system.
