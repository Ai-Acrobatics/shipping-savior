# Requirements — v1.0 M1 Foundation

## v1 Requirements

### R1: User Authentication
**Priority:** P0
**Source:** PRODUCT-ROADMAP.md M1

Users can register with email/password, log in, and log out. Sessions persist via JWT (30-day expiry). Passwords hashed with bcrypt.

**Acceptance criteria:**
- [ ] R1.1: Registration form with email + password + name
- [ ] R1.2: Login form with email + password
- [ ] R1.3: Logout clears session
- [ ] R1.4: JWT sessions with 30-day maxAge
- [ ] R1.5: Protected routes redirect to login
- [ ] R1.6: Passwords stored as bcrypt hashes (never plaintext)

### R2: Organization Model (Multi-Tenant)
**Priority:** P0
**Source:** PRODUCT-ROADMAP.md M1

Every user belongs to an organization. All data rows carry org_id for tenant isolation. Org owner can invite team members.

**Acceptance criteria:**
- [ ] R2.1: Organization created on first user registration
- [ ] R2.2: org_id foreign key on all data tables
- [ ] R2.3: Queries scoped to user's org_id (no cross-tenant data leaks)
- [ ] R2.4: Role-based access: owner / admin / member / viewer
- [ ] R2.5: Org owner can generate invite links
- [ ] R2.6: Invited users join existing org (not create new one)

### R3: Database Schema
**Priority:** P0
**Source:** PRODUCT-ROADMAP.md M1

Neon PostgreSQL with Drizzle ORM. Schema supports multi-tenancy from day one.

**Acceptance criteria:**
- [ ] R3.1: Neon PostgreSQL connection via DATABASE_URL
- [ ] R3.2: Drizzle ORM with migration support (drizzle-kit)
- [ ] R3.3: Tables: organizations, users, org_members, calculations, audit_logs
- [ ] R3.4: All tables have created_at, updated_at timestamps
- [ ] R3.5: Migrations run cleanly on fresh database

### R4: Calculator Persistence
**Priority:** P1
**Source:** PRODUCT-ROADMAP.md M1

All calculator results save to database. Users can view their calculation history and reload past calculations.

**Acceptance criteria:**
- [ ] R4.1: Save calculation result with inputs + outputs + calculator type
- [ ] R4.2: Calculation history page showing all saved calculations
- [ ] R4.3: Load a saved calculation back into the calculator
- [ ] R4.4: Calculations scoped to user's org (R2.3)
- [ ] R4.5: User can name/label saved calculations
- [ ] R4.6: Support all 6 calculator types (landed cost, unit economics, FTZ, PF/NPF, container util, tariff scenario)

### R5: Audit Logging
**Priority:** P1
**Source:** PRODUCT-ROADMAP.md M1

All auth events captured in audit_logs table for compliance and debugging.

**Acceptance criteria:**
- [ ] R5.1: Log on successful login (user_id, timestamp, IP)
- [ ] R5.2: Log on failed login attempt (email, timestamp, IP)
- [ ] R5.3: Log on registration
- [ ] R5.4: Log on logout
- [ ] R5.5: Log on password change
- [ ] R5.6: Log on invite sent / accepted

### R6: App Shell & Navigation
**Priority:** P1
**Source:** Implied — platform needs authenticated layout

Authenticated users see a platform shell with sidebar navigation. Unauthenticated users see the existing proposal site.

**Acceptance criteria:**
- [ ] R6.1: Platform layout at /platform/* with sidebar navigation
- [ ] R6.2: Sidebar links: Dashboard, Calculators, History, Settings
- [ ] R6.3: User avatar/name in sidebar with logout option
- [ ] R6.4: Mobile-responsive sidebar (collapsible)
- [ ] R6.5: Existing proposal site unchanged at /

## Traceability

| Requirement | Phase(s) |
|-------------|----------|
| R1: User Authentication | Phase 2 |
| R2: Organization Model | Phase 3 |
| R3: Database Schema | Phase 1 |
| R4: Calculator Persistence | Phase 5 |
| R5: Audit Logging | Phase 2, Phase 3 |
| R6: App Shell & Navigation | Phase 4 |
