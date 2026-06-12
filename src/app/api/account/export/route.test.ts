/**
 * Unit tests for GET /api/account/export — GDPR Art. 15 export (AI-8780).
 *
 * Pins the contract: 401 without a session, passwordHash never leaves the
 * server, attachment headers are set, and member-role exports scope the
 * shipments/calculations/contracts queries to the caller's userId while
 * owner/admin exports are org-wide.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { shipments, calculations, contracts } from '@/lib/db/schema';
import { GET } from './route';

const USER_ROW = {
  id: 'user-1',
  email: 'blake@bbh-logistics.com',
  passwordHash: 'bcrypt$secret',
  name: 'Blake',
};

// Awaitable select chain that also supports .from().where().limit().
function selectChain(rows: unknown[]) {
  const chain: any = {
    from: vi.fn(() => chain),
    where: vi.fn(() => chain),
    limit: vi.fn(() => Promise.resolve(rows)),
    then: (resolve: any, reject: any) => Promise.resolve(rows).then(resolve, reject),
  };
  return chain;
}

/** Queue chains in route query order: user, org, member, shipments, calcs, contracts. */
function mockExportQueries(overrides: Partial<Record<string, unknown[]>> = {}) {
  const chains = {
    user: selectChain(overrides.user ?? [USER_ROW]),
    org: selectChain(overrides.org ?? [{ id: 'org-1', name: 'BBH' }]),
    member: selectChain(overrides.member ?? [{ orgId: 'org-1', userId: 'user-1', role: 'owner' }]),
    shipments: selectChain(overrides.shipments ?? []),
    calculations: selectChain(overrides.calculations ?? []),
    contracts: selectChain(overrides.contracts ?? []),
  };
  (db.select as any)
    .mockReturnValueOnce(chains.user)
    .mockReturnValueOnce(chains.org)
    .mockReturnValueOnce(chains.member)
    .mockReturnValueOnce(chains.shipments)
    .mockReturnValueOnce(chains.calculations)
    .mockReturnValueOnce(chains.contracts);
  return chains;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/account/export', () => {
  it('returns 401 without a session', async () => {
    (auth as any).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    expect(db.select).not.toHaveBeenCalled();
  });

  it('returns a JSON attachment and never includes passwordHash', async () => {
    (auth as any).mockResolvedValue({
      user: { id: 'user-1', orgId: 'org-1', role: 'owner' },
    });
    mockExportQueries();

    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Disposition')).toBe(
      'attachment; filename="account-export.json"'
    );
    expect(res.headers.get('Content-Type')).toContain('application/json');

    const body = await res.json();
    expect(body.exportedAt).toBeTruthy();
    expect(body.user.email).toBe('blake@bbh-logistics.com');
    expect(body.user.passwordHash).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain('bcrypt$secret');
    expect(body.org).toEqual({ id: 'org-1', name: 'BBH' });
    expect(body.orgMember).toEqual({ orgId: 'org-1', userId: 'user-1', role: 'owner' });
  });

  it('scopes owner exports to the whole org', async () => {
    (auth as any).mockResolvedValue({
      user: { id: 'user-1', orgId: 'org-1', role: 'owner' },
    });
    const chains = mockExportQueries({ shipments: [{ id: 's-1' }] });

    const res = await GET();
    expect(res.status).toBe(200);
    expect(chains.shipments.where).toHaveBeenCalledWith(eq(shipments.orgId, 'org-1'));
    expect(chains.calculations.where).toHaveBeenCalledWith(eq(calculations.orgId, 'org-1'));
    expect(chains.contracts.where).toHaveBeenCalledWith(eq(contracts.orgId, 'org-1'));
  });

  it("scopes member-role exports to the caller's own rows", async () => {
    (auth as any).mockResolvedValue({
      user: { id: 'user-2', orgId: 'org-1', role: 'member' },
    });
    const chains = mockExportQueries({
      member: [{ orgId: 'org-1', userId: 'user-2', role: 'member' }],
    });

    const res = await GET();
    expect(res.status).toBe(200);
    expect(chains.shipments.where).toHaveBeenCalledWith(
      and(eq(shipments.orgId, 'org-1'), eq(shipments.userId, 'user-2'))
    );
    expect(chains.calculations.where).toHaveBeenCalledWith(
      and(eq(calculations.orgId, 'org-1'), eq(calculations.userId, 'user-2'))
    );
    expect(chains.contracts.where).toHaveBeenCalledWith(
      and(eq(contracts.orgId, 'org-1'), eq(contracts.userId, 'user-2'))
    );
  });
});
