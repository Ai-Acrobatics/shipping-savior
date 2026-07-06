/**
 * Unit tests for POST /api/account/delete — GDPR Art. 17 erasure (AI-8780).
 *
 * Pins the contract: 401 without a session, 400 on a wrong/missing confirm
 * phrase, 409 for an owner who still has other members, and the sole-member
 * happy path purging the org graph inside a transaction with an audit entry
 * written first.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    transaction: vi.fn(),
  },
}));

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  users,
  organizations,
  orgMembers,
  shipments,
  calculations,
  contracts,
  contractLanes,
  invites,
  bolDocuments,
  auditLogs,
} from '@/lib/db/schema';
import { POST } from './route';

const SESSION = {
  user: { id: 'user-1', orgId: 'org-1', role: 'owner' },
} as never;

function req(body: unknown) {
  return new NextRequest('http://test/api/account/delete', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

// Awaitable select chain supporting .from().where().limit().
function selectChain(rows: unknown[]) {
  const chain: any = {
    from: vi.fn(() => chain),
    where: vi.fn(() => chain),
    limit: vi.fn(() => Promise.resolve(rows)),
    then: (resolve: any, reject: any) => Promise.resolve(rows).then(resolve, reject),
  };
  return chain;
}

/** Mock the pre-transaction queries: membership lookup then member count. */
function mockMembership(role: string, totalMembers: number) {
  (db.select as any)
    .mockReturnValueOnce(selectChain([{ orgId: 'org-1', userId: 'user-1', role }]))
    .mockReturnValueOnce(selectChain([{ total: totalMembers }]));
}

/** Transaction mock: db.transaction(fn) → fn(mockTx). */
function mockTransaction(orgContractIds: { id: string }[] = []) {
  const tx = {
    insert: vi.fn((_table: unknown) => ({ values: vi.fn().mockResolvedValue(undefined) })),
    select: vi.fn(() => selectChain(orgContractIds)),
    delete: vi.fn((_table: unknown) => ({ where: vi.fn().mockResolvedValue(undefined) })),
  };
  (db.transaction as any).mockImplementation(async (fn: (t: typeof tx) => Promise<void>) =>
    fn(tx)
  );
  return tx;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/account/delete', () => {
  it('returns 401 without a session', async () => {
    (auth as any).mockResolvedValue(null);
    const res = await POST(req({ confirm: 'DELETE MY ACCOUNT' }));
    expect(res.status).toBe(401);
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it('returns 400 on a wrong confirmation phrase', async () => {
    (auth as any).mockResolvedValue(SESSION);
    const res = await POST(req({ confirm: 'delete my account' }));
    expect(res.status).toBe(400);
    expect(db.select).not.toHaveBeenCalled();
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it('returns 400 on malformed JSON', async () => {
    (auth as any).mockResolvedValue(SESSION);
    const res = await POST(req('not-json'));
    expect(res.status).toBe(400);
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it('returns 409 when an owner still has other members', async () => {
    (auth as any).mockResolvedValue(SESSION);
    mockMembership('owner', 3);

    const res = await POST(req({ confirm: 'DELETE MY ACCOUNT' }));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe(
      'Transfer ownership before deleting your account'
    );
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it('purges the org graph and user for a sole member, audit-logging first', async () => {
    (auth as any).mockResolvedValue(SESSION);
    mockMembership('owner', 1);
    const tx = mockTransaction([{ id: 'contract-1' }]);

    const res = await POST(req({ confirm: 'DELETE MY ACCOUNT' }));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);

    // Audit entry written with the deletion event metadata.
    expect(tx.insert).toHaveBeenCalledWith(auditLogs);
    const auditValues = tx.insert.mock.results[0].value.values.mock.calls[0][0];
    expect(auditValues.metadata).toMatchObject({ event: 'account_deleted' });
    expect(auditValues.userId).toBe('user-1');
    expect(auditValues.orgId).toBe('org-1');

    // Children → membership → org → user, all inside the transaction.
    const deletedTables = tx.delete.mock.calls.map((c) => c[0]);
    expect(deletedTables).toEqual([
      contractLanes,
      contracts,
      shipments,
      calculations,
      invites,
      bolDocuments,
      orgMembers,
      organizations,
      users,
    ]);
  });

  it('deletes only the membership and user rows for a non-owner member', async () => {
    (auth as any).mockResolvedValue({
      user: { id: 'user-2', orgId: 'org-1', role: 'member' },
    });
    (db.select as any)
      .mockReturnValueOnce(selectChain([{ orgId: 'org-1', userId: 'user-2', role: 'member' }]))
      .mockReturnValueOnce(selectChain([{ total: 3 }]));
    const tx = mockTransaction();

    const res = await POST(req({ confirm: 'DELETE MY ACCOUNT' }));
    expect(res.status).toBe(200);

    const deletedTables = tx.delete.mock.calls.map((c) => c[0]);
    expect(deletedTables).toEqual([orgMembers, users]);
    expect(deletedTables).not.toContain(organizations);
  });
});
