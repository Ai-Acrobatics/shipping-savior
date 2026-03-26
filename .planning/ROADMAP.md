# Roadmap — v1.0 M1 Foundation

## Milestone Goal

Turn Shipping Savior from a static proposal site into a real platform with authentication, multi-tenant database, calculator persistence, and audit logging.

---

## Phase 1: Database Schema & Drizzle Setup
**Goal:** Stand up Neon PostgreSQL with Drizzle ORM and all M1 tables.
**Research needed:** No — standard Drizzle + Neon pattern.
**Requirements:** R3

**Success criteria:**
- [ ] Drizzle config connects to Neon via DATABASE_URL
- [ ] All tables created: organizations, users, org_members, calculations, audit_logs
- [ ] `npx drizzle-kit push` runs clean on empty database
- [ ] All tables have org_id, created_at, updated_at where applicable

---

## Phase 2: Authentication (NextAuth v5)
**Goal:** Users can register, log in, log out with email/password. JWT sessions.
**Research needed:** No — NextAuth v5 Credentials provider is well-documented.
**Requirements:** R1, R5 (audit log writes on auth events)
**Depends on:** Phase 1 (users table, audit_logs table)

**Success criteria:**
- [ ] Registration creates user + org + org_member records
- [ ] Login returns JWT session (30-day expiry)
- [ ] Protected /platform/* routes redirect to /login if unauthenticated
- [ ] Audit log entries written for login, registration, logout, failed login
- [ ] Passwords stored as bcrypt hashes

---

## Phase 3: Organization Model & Invites
**Goal:** Multi-tenant org model with role-based access and invite flow.
**Research needed:** No — standard RBAC pattern.
**Requirements:** R2
**Depends on:** Phase 2 (auth must work first)

**Success criteria:**
- [ ] Org owner can generate invite link with role assignment
- [ ] Invited user joins existing org (not creates new)
- [ ] All queries filter by session user's org_id
- [ ] 4 roles enforced: owner / admin / member / viewer
- [ ] Audit log entries for invite sent and accepted

---

## Phase 4: Platform Shell & Navigation
**Goal:** Authenticated app shell with sidebar, separated from public proposal site.
**Research needed:** No — standard Next.js layout groups.
**Requirements:** R6
**Depends on:** Phase 2 (needs auth context for user info in sidebar)

**Success criteria:**
- [ ] /platform/* renders authenticated layout with sidebar
- [ ] Sidebar: Dashboard, Calculators, History, Settings
- [ ] User name + avatar in sidebar with logout
- [ ] Mobile-responsive (collapsible sidebar)
- [ ] Existing proposal site at / unchanged

---

## Phase 5: Calculator Persistence
**Goal:** All 6 calculators save results to database. Users can view history and reload.
**Research needed:** No — CRUD operations on calculations table.
**Requirements:** R4
**Depends on:** Phase 1 (calculations table), Phase 2 (auth for user context), Phase 4 (platform shell for history page)

**Success criteria:**
- [ ] Save button on each calculator stores inputs + outputs + type + user-defined name
- [ ] /platform/history shows all saved calculations for user's org
- [ ] Click a saved calculation → loads it back into the calculator with all inputs pre-filled
- [ ] All 6 calculator types supported (landed cost, unit economics, FTZ, PF/NPF, container util, tariff scenario)
- [ ] Calculations scoped to org_id (no cross-tenant access)

---

## Requirement Coverage

| Requirement | Phase | Covered |
|-------------|-------|---------|
| R1: User Authentication | Phase 2 | ✅ |
| R2: Organization Model | Phase 3 | ✅ |
| R3: Database Schema | Phase 1 | ✅ |
| R4: Calculator Persistence | Phase 5 | ✅ |
| R5: Audit Logging | Phase 2, 3 | ✅ |
| R6: App Shell & Navigation | Phase 4 | ✅ |

**Orphaned requirements:** None
**All v1 requirements mapped:** Yes

---

## Dependency Graph

```
Phase 1 (DB Schema)
  └── Phase 2 (Auth)
        ├── Phase 3 (Org Model)
        └── Phase 4 (App Shell)
              └── Phase 5 (Calculator Persistence)
```

Phases 3 and 4 can run in parallel after Phase 2.

---
*Created: 2026-03-26*
