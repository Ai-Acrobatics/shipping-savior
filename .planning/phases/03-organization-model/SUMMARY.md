# Phase 3: Organization Model & Invites — SUMMARY

**Status:** COMPLETE
**Completed:** 2026-03-26

## What Was Built

### Pre-existing (from earlier sessions)
- DB schema with organizations, users, org_members, invites tables
- Invite create API: `POST /api/orgs/invite`
- Invite accept API: `POST /api/orgs/invite/[token]/accept`
- Invite landing page: `/(auth)/invite/[token]/page.tsx` + `AcceptInviteClient.tsx`
- DB queries: `src/lib/db/queries/org.ts` (getOrgMembers, getInviteByToken, etc.)
- Permissions: `src/lib/auth/permissions.ts` (role hierarchy, hasPermission, requirePermission, outranks)
- Register route with invite token support

### Built This Session

1. **RBAC Convenience Module** (`src/lib/auth/rbac.ts`)
   - `requireRole(permission)` — single-call auth + org membership + permission check for API routes
   - `isAuthError()` — type guard for error vs auth context
   - Convenience helpers: `canInvite()`, `canManageMembers()`, `canEditCalculations()`, `canViewCalculations()`, `canManageOrg()`, `canViewAuditLogs()`

2. **Members API** (`src/app/api/org/members/route.ts`)
   - GET: List org members (any role)
   - DELETE: Remove member (admin/owner only, protects last owner, prevents self-removal, admins can't remove owners)

3. **Org Settings API** (`src/app/api/org/route.ts`)
   - GET: Current org details (any role)
   - PATCH: Update org name/slug (owner only, with slug sanitization and unique constraint handling)

4. **Invites API** (`src/app/api/org/invites/route.ts`)
   - GET: List pending invites (admin/owner)
   - DELETE: Revoke pending invite (admin/owner)

5. **Additional DB Queries** (added to `src/lib/db/queries/org.ts`)
   - `removeOrgMember(orgId, userId)`
   - `countOrgOwners(orgId)` — for last-owner protection
   - `updateOrganization(orgId, data)`
   - `revokeInvite(inviteId, orgId)`

6. **Team Members Page** (`src/app/(platform)/platform/settings/members/page.tsx`)
   - Full client component with member list, role badges (owner=purple, admin=blue, member=green, viewer=gray)
   - Invite form with email + role select (admin/owner only)
   - Invite URL generation with copy-to-clipboard
   - Remove member button with confirmation dialog
   - Pending invites list with revoke capability

7. **Settings Page Upgrade** (`src/app/(platform)/platform/settings/page.tsx`)
   - Now fetches real org data from DB
   - Shows actual member count with preview list (up to 5)
   - Shows user's actual role badge
   - Link to full members management page

8. **Middleware Update** (`src/middleware.ts`)
   - Added `/invite/:path*` to matcher
   - Auth redirect preserves invite tokens (login/register with `?invite=` redirects to `/invite/{token}`)

## Success Criteria Verification

- [x] Org owner can generate invite link with role assignment — via POST /api/orgs/invite
- [x] Invited user joins existing org (not creates new) — register with inviteToken skips org creation, accept invite adds to existing org
- [x] All queries filter by session user's org_id — requireRole() verifies org membership, all APIs scope by orgId
- [x] 4 roles enforced: owner / admin / member / viewer — via permissions.ts hierarchy + rbac.ts requireRole()
- [x] Audit log entries for invite sent and accepted — writeAuditLog called in both invite and accept APIs

## Files Modified/Created

| File | Action |
|------|--------|
| `src/lib/auth/rbac.ts` | Created |
| `src/app/api/org/route.ts` | Created |
| `src/app/api/org/members/route.ts` | Created |
| `src/app/api/org/invites/route.ts` | Created |
| `src/app/(platform)/platform/settings/members/page.tsx` | Created |
| `src/lib/db/queries/org.ts` | Updated (added 4 functions) |
| `src/app/(platform)/platform/settings/page.tsx` | Updated (real data) |
| `src/middleware.ts` | Updated (invite route support) |
