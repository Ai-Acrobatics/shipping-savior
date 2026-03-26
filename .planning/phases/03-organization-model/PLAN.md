# Phase 3: Organization Model & Invites

**Requirement:** R2 (Organization Model)
**Goal:** Multi-tenant org model with role-based access and invite flow.
**Depends on:** Phase 2 (auth must work first — need session context, users table, audit logging)
**Status:** COMPLETE (2026-03-26)

## Success Criteria

- [x] Org owner can generate invite link with role assignment
- [x] Invited user joins existing org (not creates new)
- [x] All queries filter by session user's `org_id`
- [x] 4 roles enforced: owner / admin / member / viewer
- [x] Audit log entries for `invite_sent` and `invite_accepted`

---

## Task 1: Add `org_invites` Table to Schema

**File:** `src/lib/db/schema.ts` (edit — append new table)

Add the `orgInvites` table after the existing `auditLogs` table:

```typescript
// ── Org Invites ───────────────────────────────────────

export const orgInvites = pgTable('org_invites', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  role: orgRoleEnum('role').notNull().default('member'),
  token: varchar('token', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  invitedBy: uuid('invited_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

**Design decisions:**
- `token` is `varchar(64)` with a unique constraint — generated via `crypto.randomBytes(32).toString('hex')` (URL-safe, 256-bit entropy)
- `expiresAt` — invites expire after 7 days (enforced at application layer)
- `acceptedAt` nullable — null means pending, non-null means accepted
- `invitedBy` FK to `users.id` — tracks who sent the invite (cascades on user delete)
- `onDelete: 'cascade'` on `orgId` — if org is deleted, invites are cleaned up
- No `updatedAt` — invites are immutable after creation (only `acceptedAt` gets set once)
- `email` is NOT unique — same email can be invited to multiple orgs, or re-invited after expiry

**After editing:** Run `npm run db:push` to sync schema to Neon.

---

## Task 2: Create Role Permission Matrix

**File:** `src/lib/auth/permissions.ts` (new)

```typescript
export const OrgRole = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
} as const;

export type OrgRoleType = (typeof OrgRole)[keyof typeof OrgRole];

/**
 * Permission definitions.
 * Each permission maps to the minimum role required.
 * Role hierarchy: owner > admin > member > viewer
 */
const ROLE_HIERARCHY: Record<OrgRoleType, number> = {
  owner: 40,
  admin: 30,
  member: 20,
  viewer: 10,
};

export type Permission =
  | 'org:manage'          // Update org settings, delete org
  | 'org:invite'          // Send invites
  | 'org:remove_member'   // Remove members from org
  | 'org:change_role'     // Change member roles
  | 'calc:create'         // Create/save calculations
  | 'calc:edit'           // Edit own calculations
  | 'calc:delete'         // Delete own calculations
  | 'calc:view'           // View calculations in org
  | 'audit:view';         // View audit logs

const PERMISSION_MIN_ROLE: Record<Permission, OrgRoleType> = {
  'org:manage': 'owner',
  'org:invite': 'admin',
  'org:remove_member': 'admin',
  'org:change_role': 'owner',
  'calc:create': 'member',
  'calc:edit': 'member',
  'calc:delete': 'member',
  'calc:view': 'viewer',
  'audit:view': 'admin',
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: OrgRoleType, permission: Permission): boolean {
  const roleLevel = ROLE_HIERARCHY[role];
  const requiredLevel = ROLE_HIERARCHY[PERMISSION_MIN_ROLE[permission]];
  return roleLevel >= requiredLevel;
}

/**
 * Assert a role has permission — throws if not.
 * Use in API routes for guard checks.
 */
export function requirePermission(role: OrgRoleType, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Forbidden: role '${role}' lacks permission '${permission}'`);
  }
}

/**
 * Check if roleA outranks roleB in the hierarchy.
 * Used to prevent members from escalating their own role.
 */
export function outranks(roleA: OrgRoleType, roleB: OrgRoleType): boolean {
  return ROLE_HIERARCHY[roleA] > ROLE_HIERARCHY[roleB];
}
```

**Design decisions:**
- Numeric hierarchy levels allow simple comparison (no array index lookups)
- `hasPermission` is a pure function — easy to test, no DB calls
- `requirePermission` throws — designed for early-return guard pattern in API routes
- `outranks` prevents privilege escalation (admin can't invite as owner, member can't change roles)
- Permissions are string literals, not enums — easier to extend without migrations
- Owner is the only role that can change roles or manage org settings
- Admin can invite and remove members but not change roles
- Member can create/edit/delete own calculations
- Viewer is read-only

---

## Task 3: Create Org-Scoped Query Helpers

**File:** `src/lib/db/queries/scoped.ts` (new)

```typescript
import { eq, and, SQL } from 'drizzle-orm';
import { db } from '../index';
import { calculations, auditLogs } from '../schema';

/**
 * Adds org_id filter to a where clause.
 * Usage: db.select().from(calculations).where(withOrgScope(calculations.orgId, orgId))
 */
export function withOrgScope(
  orgIdColumn: typeof calculations.orgId | typeof auditLogs.orgId,
  orgId: string
): SQL {
  return eq(orgIdColumn, orgId);
}

/**
 * Combine org scope with additional conditions.
 * Usage: db.select().from(calculations).where(scopedWhere(calculations.orgId, orgId, eq(calculations.id, calcId)))
 */
export function scopedWhere(
  orgIdColumn: typeof calculations.orgId | typeof auditLogs.orgId,
  orgId: string,
  ...conditions: SQL[]
): SQL {
  return and(eq(orgIdColumn, orgId), ...conditions)!;
}
```

**Design decisions:**
- Lightweight composable helpers, not a query builder wrapper — keeps Drizzle's API surface intact
- Forces caller to explicitly pass the org_id column — prevents accidentally scoping the wrong table
- `scopedWhere` uses rest params for additional conditions — flexible without being over-abstracted
- Does NOT wrap entire queries — just provides the WHERE clause fragment

---

## Task 4: Create Org Query Functions

**File:** `src/lib/db/queries/org.ts` (new)

```typescript
import { eq } from 'drizzle-orm';
import { db } from '../index';
import { organizations, orgMembers, users, orgInvites } from '../schema';
import type { OrgRoleType } from '../../auth/permissions';

/** Get org by ID */
export async function getOrgById(orgId: string) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);
  return org ?? null;
}

/** Get all members of an org with user details */
export async function getOrgMembers(orgId: string) {
  return db
    .select({
      memberId: orgMembers.id,
      userId: users.id,
      email: users.email,
      name: users.name,
      role: orgMembers.role,
      joinedAt: orgMembers.createdAt,
    })
    .from(orgMembers)
    .innerJoin(users, eq(orgMembers.userId, users.id))
    .where(eq(orgMembers.orgId, orgId));
}

/** Get a user's membership in an org (returns role or null) */
export async function getOrgMembership(orgId: string, userId: string) {
  const [membership] = await db
    .select()
    .from(orgMembers)
    .where(
      and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, userId))
    )
    .limit(1);
  return membership ?? null;
}

/** Get pending (non-expired, non-accepted) invites for an org */
export async function getPendingInvites(orgId: string) {
  return db
    .select()
    .from(orgInvites)
    .where(
      and(
        eq(orgInvites.orgId, orgId),
        isNull(orgInvites.acceptedAt),
        gt(orgInvites.expiresAt, new Date())
      )
    );
}

/** Get invite by token (for accept flow) */
export async function getInviteByToken(token: string) {
  const [invite] = await db
    .select()
    .from(orgInvites)
    .where(eq(orgInvites.token, token))
    .limit(1);
  return invite ?? null;
}
```

**Notes:**
- Missing imports (`and`, `isNull`, `gt`) must be added from `drizzle-orm`
- All queries return typed results via Drizzle inference — no manual type casting needed
- `getOrgMembership` is critical for permission checks in API routes (look up caller's role)

---

## Task 5: Create Invite API Route (Generate Invite Link)

**File:** `src/app/api/orgs/invite/route.ts` (new)

```typescript
// POST /api/orgs/invite
// Body: { email: string, role: 'admin' | 'member' | 'viewer' }
// Auth: requires session with org_id
// Permission: org:invite (admin or owner only)
//
// Logic:
// 1. Verify session — extract userId, orgId from JWT
// 2. Look up caller's role via getOrgMembership(orgId, userId)
// 3. requirePermission(callerRole, 'org:invite')
// 4. Validate: role !== 'owner' (can't invite as owner), email format valid
// 5. Validate: caller outranks the invited role (admin can't invite admin)
// 6. Check if email already has active (non-expired, non-accepted) invite for this org — reject with 409
// 7. Check if email is already a member of this org — reject with 409
// 8. Generate token: crypto.randomBytes(32).toString('hex')
// 9. Insert into org_invites with 7-day expiry
// 10. Write audit log: event_type='invite_sent', metadata={ email, role, token }
// 11. Return { inviteUrl: `${NEXT_PUBLIC_URL}/invite/${token}`, expiresAt }
//
// Response: 201 { inviteUrl, expiresAt }
// Errors: 401 (no session), 403 (insufficient role), 409 (already invited/member), 400 (invalid input)
```

**Design decisions:**
- Owners cannot be invited — ownership transfer is a separate, more guarded operation (future)
- `outranks()` check prevents privilege escalation: admin can invite member/viewer but not admin
- Active invite check prevents spamming the same email
- Token is in the URL path, not query string — cleaner UX, no accidental leaking in referrer headers
- Email sending is NOT in scope for this phase — the API returns the invite URL for manual sharing
- Audit log captures the token so it can be correlated with the accept event

---

## Task 6: Create Accept Invite Page

**File:** `src/app/(auth)/invite/[token]/page.tsx` (new)

```
// Server component page for /invite/[token]
//
// Logic:
// 1. Extract token from params
// 2. Fetch invite by token via getInviteByToken(token)
// 3. Validate:
//    - Invite exists → otherwise show "Invalid invite link" error
//    - Not expired (expiresAt > now) → otherwise show "This invite has expired"
//    - Not already accepted (acceptedAt is null) → otherwise show "Already accepted"
// 4. If user is logged in (session exists):
//    - Show confirmation: "You've been invited to join {orgName} as {role}. Accept?"
//    - Accept button calls POST /api/orgs/invite/[token]/accept
// 5. If user is NOT logged in:
//    - Show: "You've been invited to join {orgName}. Create an account or log in to accept."
//    - "Create Account" button → /register?invite={token} (preserves token through registration)
//    - "Log In" button → /login?invite={token} (preserves token through login)
//    - After auth, redirect back to /invite/[token]
//
// UI: Centered card layout matching auth pages. Shows org name, inviter name, role badge.
```

**Design decisions:**
- Server component for initial data fetch (validate invite before rendering)
- Supports both existing users and new users (invite-then-register flow)
- Token preserved in query param during auth redirect — Phase 2 auth routes need a minor update to handle `?invite=` redirect
- No client-side token validation — all checks happen server-side

---

## Task 7: Create Accept Invite API Endpoint

**File:** `src/app/api/orgs/invite/[token]/accept/route.ts` (new)

```typescript
// POST /api/orgs/invite/[token]/accept
// Auth: requires session (user must be logged in)
// No body needed — token is in URL
//
// Logic:
// 1. Verify session — extract userId from JWT
// 2. Fetch invite by token via getInviteByToken(token)
// 3. Validate:
//    - Invite exists → 404
//    - Not expired → 410 Gone
//    - Not already accepted → 409 Conflict
//    - Invite email matches session user email → 403 (invite is for a different email)
// 4. Check user is not already a member of this org → 409
// 5. Transaction:
//    a. Insert into org_members (orgId, userId, role from invite)
//    b. Update org_invites: set acceptedAt = now()
//    c. Insert audit log: event_type='invite_accepted', metadata={ orgId, role, inviteId }
// 6. Return 200 { orgId, role, orgName }
//
// Errors: 401, 403, 404, 409, 410
```

**Design decisions:**
- Email matching check ensures invite can only be accepted by the intended recipient
- Uses a database transaction — membership and invite update are atomic (no partial state)
- Returns orgId so the client can redirect to the org's dashboard
- `410 Gone` for expired invites (semantically correct — resource existed but is no longer available)
- Separate endpoint from the generate route — clean REST semantics (`/invite` to create, `/invite/[token]/accept` to accept)

---

## Task 8: Update Auth Registration to Support Invite Flow

**File:** `src/lib/auth/config.ts` (edit) and/or `src/app/api/auth/register/route.ts` (edit)

```
// Modification needed for invite-based registration:
//
// Current behavior (Phase 2):
//   Register → create user + create NEW org + add as owner
//
// New behavior when `?invite=<token>` is present:
//   Register → create user ONLY (no org creation)
//   → redirect to /invite/[token] after login
//   → user accepts invite there, which adds them to existing org
//
// Changes:
// 1. Registration page: detect `invite` query param, pass to register API
// 2. Register API: if invite token provided, skip org creation
// 3. After registration + login, redirect to /invite/[token] instead of /dashboard
//
// This keeps the accept flow in one place (Task 7) and avoids
// creating orphan orgs for invited users.
```

**Design decisions:**
- Invited users should NOT get a personal org created — they join the inviting org
- The invite acceptance is still a separate step (Task 7) — keeps the flow explicit
- If a user registers without an invite, the existing behavior (create org) is preserved

---

## Task 9: Write Audit Log Helper for Invite Events

**File:** `src/lib/db/queries/audit.ts` (edit — add to existing audit helper if it exists, or create)

```typescript
// Add two new audit event types to the existing audit logging utility:
//
// 1. logInviteSent(orgId, userId, { email, role, token })
//    - event_type: 'invite_sent'
//    - metadata: { email, role, inviteToken: token }
//
// 2. logInviteAccepted(orgId, userId, { inviteId, role })
//    - event_type: 'invite_accepted'
//    - metadata: { inviteId, role }
//
// Both insert into audit_logs table with orgId, userId, eventType, metadata, ipAddress.
// ipAddress extracted from request headers (x-forwarded-for or remoteAddress).
```

**Notes:**
- If Phase 2 created a generic `writeAuditLog(orgId, userId, eventType, metadata, ip)` function, these are just thin wrappers
- If no audit helper exists yet, create a generic one first, then add invite-specific wrappers

---

## Execution Order

```
Task 1  (org_invites schema)           — no dependencies (Phase 1/2 schema exists)
Task 2  (permissions.ts)               — no dependencies
Task 3  (scoped query helpers)         — depends on Task 1 (needs schema import)
Task 4  (org query functions)          — depends on Task 1 (needs orgInvites table)
Task 9  (audit log helper)            — depends on Task 1

Task 5  (invite API route)            — depends on Tasks 2, 4, 9
Task 6  (accept invite page)          — depends on Task 4
Task 7  (accept invite endpoint)      — depends on Tasks 2, 4, 9
Task 8  (auth registration update)    — depends on Task 7 (needs accept flow to exist)
```

**Parallel wave 1:** Tasks 1, 2
**Parallel wave 2:** Tasks 3, 4, 9 (all depend on schema)
**Parallel wave 3:** Tasks 5, 6, 7 (depend on permissions + queries)
**Parallel wave 4:** Task 8 (depends on accept flow)

---

## Verification

After all tasks complete, verify:

```bash
# 1. Schema pushes clean
npm run db:push

# 2. TypeScript compiles
npx tsc --noEmit

# 3. Permission matrix works
# Manual test: hasPermission('admin', 'org:invite') → true
# Manual test: hasPermission('member', 'org:invite') → false
# Manual test: hasPermission('viewer', 'calc:view') → true
# Manual test: outranks('admin', 'member') → true
# Manual test: outranks('member', 'admin') → false

# 4. API flow (manual or via curl)
# a. Login as org owner
# b. POST /api/orgs/invite { email: "test@example.com", role: "member" }
#    → 201 with inviteUrl
# c. Open inviteUrl in browser → shows invite page
# d. Login/register as invited user
# e. POST /api/orgs/invite/[token]/accept
#    → 200, user is now member of org
# f. Check audit_logs: should have invite_sent and invite_accepted entries
# g. Check org_members: invited user should appear with 'member' role

# 5. Scope enforcement
# Login as user in org A → query calculations → only org A results
# Cannot see org B's data
```

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/lib/db/schema.ts` | Edit | Add `orgInvites` table |
| `src/lib/auth/permissions.ts` | Create | Role hierarchy + permission matrix |
| `src/lib/db/queries/scoped.ts` | Create | `withOrgScope` / `scopedWhere` helpers |
| `src/lib/db/queries/org.ts` | Create | Org & member query functions |
| `src/lib/db/queries/audit.ts` | Create/Edit | Audit log helpers for invite events |
| `src/app/api/orgs/invite/route.ts` | Create | Generate invite link endpoint |
| `src/app/(auth)/invite/[token]/page.tsx` | Create | Accept invite UI page |
| `src/app/api/orgs/invite/[token]/accept/route.ts` | Create | Accept invite API endpoint |
| `src/lib/auth/config.ts` | Edit | Support invite token in registration flow |

**Total tasks:** 9 (4 parallel waves)
**Estimated effort:** ~3 hours execution time

---
*Created: 2026-03-26*
