/**
 * Unit tests for /api/org/members/[id] (AI-5582).
 *
 * Pins the member-management contract:
 * - 401 without a session
 * - 403 when an admin tries to modify an owner
 * - 409 when demoting/removing the last owner
 * - successful role change persists via org-scoped update
 * - 403 when a user tries to remove themselves
 *
 * Mocks @/lib/auth + @/lib/db per the src/app/api/shipments/route.test.ts
 * pattern (the query helpers in @/lib/db/queries/org run for real against the
 * mocked db).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/lib/auth/audit', () => ({
  writeAuditLog: vi.fn().mockResolvedValue(undefined),
}));

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PATCH, DELETE } from './route';

const OWNER_SESSION = {
  user: { id: 'user-1', orgId: 'org-1', role: 'owner' },
} as never;

const ADMIN_SESSION = {
  user: { id: 'user-1', orgId: 'org-1', role: 'admin' },
} as never;

/**
 * Queue results for successive db.select() calls. Each select() returns a
 * thenable chain where every builder method returns the chain itself, so the
 * real query helpers (getOrgMembership, getOrgMembers, countOrgOwners) resolve
 * to the queued rows regardless of chain depth.
 */
function queueSelects(...results: unknown[][]) {
  let i = 0;
  (db.select as any).mockImplementation(() => {
    const result = results[i++] ?? [];
    const chain: any = {
      from: vi.fn(() => chain),
      innerJoin: vi.fn(() => chain),
      where: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      then: (resolve: any, reject: any) =>
        Promise.resolve(result).then(resolve, reject),
    };
    return chain;
  });
}

function mockUpdateChain(returned: unknown[]) {
  const returning = vi.fn().mockResolvedValue(returned);
  const where = vi.fn().mockReturnValue({ returning });
  const set = vi.fn().mockReturnValue({ where });
  (db.update as any).mockReturnValue({ set });
  return { set, where, returning };
}

function mockDeleteChain(returned: unknown[]) {
  const returning = vi.fn().mockResolvedValue(returned);
  const where = vi.fn().mockReturnValue({ returning });
  (db.delete as any).mockReturnValue({ where });
  return { where, returning };
}

function patchReq(targetId: string, body: unknown) {
  return PATCH(
    new NextRequest(`http://test/api/org/members/${targetId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: targetId }) }
  );
}

function deleteReq(targetId: string) {
  return DELETE(
    new NextRequest(`http://test/api/org/members/${targetId}`, {
      method: 'DELETE',
    }),
    { params: Promise.resolve({ id: targetId }) }
  );
}

const member = (userId: string, role: string) => ({
  memberId: `m-${userId}`,
  userId,
  email: `${userId}@example.com`,
  name: userId,
  role,
  joinedAt: new Date('2026-01-01'),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PATCH /api/org/members/[id]', () => {
  it('returns 401 without a session', async () => {
    (auth as any).mockResolvedValue(null);
    const res = await patchReq('user-2', { role: 'admin' });
    expect(res.status).toBe(401);
  });

  it('returns 403 when an admin tries to modify an owner', async () => {
    (auth as any).mockResolvedValue(ADMIN_SESSION);
    queueSelects(
      [{ id: 'm-1', orgId: 'org-1', userId: 'user-1', role: 'admin' }], // caller membership
      [member('user-1', 'admin'), member('user-2', 'owner')] // org members
    );

    const res = await patchReq('user-2', { role: 'member' });
    expect(res.status).toBe(403);
    expect(db.update).not.toHaveBeenCalled();
  });

  it('returns 403 when an admin tries to grant the owner role', async () => {
    (auth as any).mockResolvedValue(ADMIN_SESSION);
    queueSelects(
      [{ id: 'm-1', orgId: 'org-1', userId: 'user-1', role: 'admin' }],
      [member('user-1', 'admin'), member('user-2', 'member')]
    );

    const res = await patchReq('user-2', { role: 'owner' });
    expect(res.status).toBe(403);
    expect(db.update).not.toHaveBeenCalled();
  });

  it('returns 409 when demoting the last owner', async () => {
    (auth as any).mockResolvedValue(OWNER_SESSION);
    queueSelects(
      [{ id: 'm-1', orgId: 'org-1', userId: 'user-1', role: 'owner' }], // caller membership
      [member('user-1', 'owner'), member('user-2', 'member')], // org members
      [{ id: 'm-user-1' }] // countOrgOwners -> 1 owner
    );

    const res = await patchReq('user-1', { role: 'member' });
    expect(res.status).toBe(409);
    expect(db.update).not.toHaveBeenCalled();
  });

  it('changes a member role successfully', async () => {
    (auth as any).mockResolvedValue(OWNER_SESSION);
    queueSelects(
      [{ id: 'm-1', orgId: 'org-1', userId: 'user-1', role: 'owner' }],
      [member('user-1', 'owner'), member('user-2', 'member')]
    );
    const { returning } = mockUpdateChain([
      { id: 'm-user-2', orgId: 'org-1', userId: 'user-2', role: 'admin' },
    ]);

    const res = await patchReq('user-2', { role: 'admin' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.member).toEqual({ userId: 'user-2', role: 'admin' });
    expect(returning).toHaveBeenCalled();
  });

  it('returns 400 on an invalid role', async () => {
    (auth as any).mockResolvedValue(OWNER_SESSION);
    queueSelects([
      { id: 'm-1', orgId: 'org-1', userId: 'user-1', role: 'owner' },
    ]);

    const res = await patchReq('user-2', { role: 'superadmin' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/org/members/[id]', () => {
  it('returns 401 without a session', async () => {
    (auth as any).mockResolvedValue(null);
    const res = await deleteReq('user-2');
    expect(res.status).toBe(401);
  });

  it('returns 403 when a user tries to remove themselves', async () => {
    (auth as any).mockResolvedValue(OWNER_SESSION);
    queueSelects([
      { id: 'm-1', orgId: 'org-1', userId: 'user-1', role: 'owner' },
    ]);

    const res = await deleteReq('user-1');
    expect(res.status).toBe(403);
    expect(db.delete).not.toHaveBeenCalled();
  });

  it('returns 403 when an admin tries to remove an owner', async () => {
    (auth as any).mockResolvedValue(ADMIN_SESSION);
    queueSelects(
      [{ id: 'm-1', orgId: 'org-1', userId: 'user-1', role: 'admin' }],
      [member('user-1', 'admin'), member('user-2', 'owner')]
    );

    const res = await deleteReq('user-2');
    expect(res.status).toBe(403);
    expect(db.delete).not.toHaveBeenCalled();
  });

  it('returns 409 when removing the last owner', async () => {
    // Caller is owner user-3; target user-2 is the only remaining owner per
    // the count query.
    (auth as any).mockResolvedValue({
      user: { id: 'user-3', orgId: 'org-1', role: 'owner' },
    });
    queueSelects(
      [{ id: 'm-3', orgId: 'org-1', userId: 'user-3', role: 'owner' }], // caller membership (owner)
      [member('user-3', 'owner'), member('user-2', 'owner')], // org members
      [{ id: 'm-user-2' }] // countOrgOwners -> 1
    );

    const res = await deleteReq('user-2');
    expect(res.status).toBe(409);
    expect(db.delete).not.toHaveBeenCalled();
  });

  it('removes a member successfully', async () => {
    (auth as any).mockResolvedValue(OWNER_SESSION);
    queueSelects(
      [{ id: 'm-1', orgId: 'org-1', userId: 'user-1', role: 'owner' }],
      [member('user-1', 'owner'), member('user-2', 'viewer')]
    );
    const { returning } = mockDeleteChain([{ id: 'm-user-2' }]);

    const res = await deleteReq('user-2');
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(returning).toHaveBeenCalled();
  });
});
