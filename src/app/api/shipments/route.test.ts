/**
 * Unit tests for /api/shipments auth-gating + org scoping (AI-10777).
 *
 * The 2026-05-31 production-readiness audit flagged GET /api/shipments as
 * publicly readable and POST as accepting an attacker-supplied orgId. These
 * tests pin the fixed contract: both verbs 401 without a session, GET scopes
 * to the session org, POST takes orgId/userId from the session only.
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
  },
}));

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { GET, POST } from './route';

const SESSION = {
  user: { id: 'user-1', orgId: 'org-1', role: 'owner' },
} as never;

function mockSelectChain(rows: unknown[], total = 0) {
  // First select() call is the row query, second is the count query.
  const rowChain: any = {
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockResolvedValue(rows),
  };
  const countChain: any = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([{ total }]),
  };
  (db.select as any)
    .mockReturnValueOnce(rowChain)
    .mockReturnValueOnce(countChain);
  return { rowChain, countChain };
}

function mockInsertChain(returned: unknown) {
  const values = vi.fn().mockReturnValue({
    returning: vi.fn().mockResolvedValue([returned]),
  });
  (db.insert as any).mockReturnValue({ values });
  return values;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/shipments', () => {
  it('returns 401 without a session', async () => {
    (auth as any).mockResolvedValue(null);
    const res = await GET(new NextRequest('http://test/api/shipments'));
    expect(res.status).toBe(401);
  });

  it('returns org shipments with pagination metadata', async () => {
    (auth as any).mockResolvedValue(SESSION);
    mockSelectChain([{ id: 's-1', orgId: 'org-1' }], 1);

    const res = await GET(new NextRequest('http://test/api/shipments'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.shipments).toHaveLength(1);
    expect(body.pagination).toEqual({ total: 1, limit: 50, offset: 0 });
  });

  it('clamps limit to the 200 maximum', async () => {
    (auth as any).mockResolvedValue(SESSION);
    const { rowChain } = mockSelectChain([], 0);

    const res = await GET(
      new NextRequest('http://test/api/shipments?limit=9999&offset=10')
    );
    const body = await res.json();
    expect(body.pagination).toEqual({ total: 0, limit: 200, offset: 10 });
    expect(rowChain.limit).toHaveBeenCalledWith(200);
  });
});

describe('POST /api/shipments', () => {
  it('returns 401 without a session', async () => {
    (auth as any).mockResolvedValue(null);
    const res = await POST(
      new NextRequest('http://test/api/shipments', {
        method: 'POST',
        body: JSON.stringify({ carrier: 'MSC' }),
      })
    );
    expect(res.status).toBe(401);
  });

  it('ignores body orgId and uses the session org + user', async () => {
    (auth as any).mockResolvedValue(SESSION);
    const values = mockInsertChain({ id: 's-new', orgId: 'org-1' });

    const res = await POST(
      new NextRequest('http://test/api/shipments', {
        method: 'POST',
        body: JSON.stringify({
          orgId: 'attacker-org',
          carrier: 'MSC',
          status: 'not-a-real-status',
          source: 'csv_import',
        }),
      })
    );

    expect(res.status).toBe(201);
    const inserted = values.mock.calls[0][0];
    expect(inserted.orgId).toBe('org-1');
    expect(inserted.userId).toBe('user-1');
    // invalid status falls back, valid source passes through
    expect(inserted.status).toBe('in_transit');
    expect(inserted.source).toBe('csv_import');
  });

  it('returns 400 on malformed JSON', async () => {
    (auth as any).mockResolvedValue(SESSION);
    const res = await POST(
      new NextRequest('http://test/api/shipments', {
        method: 'POST',
        body: 'not-json',
      })
    );
    expect(res.status).toBe(400);
  });
});
