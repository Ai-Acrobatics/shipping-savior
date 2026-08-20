/**
 * Unit tests for POST /api/account/delete — GDPR Art. 17 erasure (AI-8780).
 *
 * Pins the contract: 401 without a session, 400 on a wrong/missing confirm
 * phrase, 409 for an owner who still has other members, and the sole-member
 * happy path purging the org graph inside a transaction with an audit entry
 * written first. Also pins the AI-8780 rule that a live Stripe subscription is
 * cancelled BEFORE the purge, and that a Stripe failure aborts the deletion
 * rather than orphaning a billable subscription.
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

vi.mock('@/lib/stripe/server', () => ({
  stripe: { subscriptions: { cancel: vi.fn() } },
  isStripeConfigured: vi.fn(() => true),
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
import { stripe, isStripeConfigured } from '@/lib/stripe/server';
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

/**
 * Mock the pre-transaction queries: membership lookup, member count, and — on
 * the sole-member path only — the org's Stripe subscription id.
 */
function mockMembership(
  role: string,
  totalMembers: number,
  subscriptionId: string | null = null
) {
  (db.select as any)
    .mockReturnValueOnce(selectChain([{ orgId: 'org-1', userId: 'user-1', role }]))
    .mockReturnValueOnce(selectChain([{ total: totalMembers }]));
  if (totalMembers <= 1) {
    (db.select as any).mockReturnValueOnce(selectChain([{ subscriptionId }]));
  }
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
  (isStripeConfigured as any).mockReturnValue(true);
  (stripe.subscriptions.cancel as any).mockResolvedValue({ id: 'sub_1', status: 'canceled' });
});

describe('POST /api/account/delete', () => {
  it('returns 401 without a session', async () => {
    (auth as any).mockResolvedValue(null);
    const res = await POST(req({ confirm: 'DELETE MY ACCOUNT' }));
    expect(res.status).toBe(401);
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it('returns 401 for a session shell with no user', async () => {
    (auth as any).mockResolvedValue({});
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

  it('cancels the Stripe subscription before purging the org', async () => {
    (auth as any).mockResolvedValue(SESSION);
    mockMembership('owner', 1, 'sub_live_1');
    mockTransaction();

    const res = await POST(req({ confirm: 'DELETE MY ACCOUNT' }));
    expect(res.status).toBe(200);
    expect(stripe.subscriptions.cancel).toHaveBeenCalledWith('sub_live_1');
    // Cancellation has to precede the purge — afterwards we no longer know the id.
    expect((stripe.subscriptions.cancel as any).mock.invocationCallOrder[0]).toBeLessThan(
      (db.transaction as any).mock.invocationCallOrder[0]
    );
  });

  it('aborts the deletion when Stripe cancellation fails', async () => {
    (auth as any).mockResolvedValue(SESSION);
    mockMembership('owner', 1, 'sub_live_1');
    mockTransaction();
    (stripe.subscriptions.cancel as any).mockRejectedValue(new Error('card_declined'));

    const res = await POST(req({ confirm: 'DELETE MY ACCOUNT' }));
    expect(res.status).toBe(502);
    // Nothing was erased — the user can retry without having lost data.
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it('treats an already-cancelled Stripe subscription as success', async () => {
    (auth as any).mockResolvedValue(SESSION);
    mockMembership('owner', 1, 'sub_gone');
    mockTransaction();
    (stripe.subscriptions.cancel as any).mockRejectedValue(
      Object.assign(new Error('No such subscription'), { code: 'resource_missing' })
    );

    const res = await POST(req({ confirm: 'DELETE MY ACCOUNT' }));
    expect(res.status).toBe(200);
    expect(db.transaction).toHaveBeenCalled();
  });

  it('does not call Stripe when the org has no subscription', async () => {
    (auth as any).mockResolvedValue(SESSION);
    mockMembership('owner', 1, null);
    mockTransaction();

    const res = await POST(req({ confirm: 'DELETE MY ACCOUNT' }));
    expect(res.status).toBe(200);
    expect(stripe.subscriptions.cancel).not.toHaveBeenCalled();
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
