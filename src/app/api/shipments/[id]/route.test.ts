/**
 * Unit tests for /api/shipments/[id] — review-queue PATCH endpoint (AI-10777).
 *
 * Pins the contract: 401 without a session, 404 (never 403) for other-org
 * shipments so existence is not leaked, PATCH recomputes
 * importMeta.reviewIssues (clearing only the issues whose field is now
 * filled), 400 on invalid dates, and 400 (rejected, not coerced) on invalid
 * status values.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { GET, PATCH } from './route';

const SESSION = {
  user: { id: 'user-1', orgId: 'org-1', role: 'owner' },
} as never;

const PARAMS = { params: Promise.resolve({ id: 'ship-1' }) };

const BASE_SHIPMENT = {
  id: 'ship-1',
  orgId: 'org-1',
  reference: 'RICFJP621700',
  containerNumber: null,
  vesselName: 'MSC ATHENS',
  voyageNumber: null,
  pol: 'PHILADELPHIA',
  pod: 'CALLAO',
  etd: null,
  eta: new Date('2026-07-21T00:00:00Z'),
  carrier: 'MSC',
  weightKg: null,
  quantity: 1490,
  status: 'booked',
  importMeta: {
    week: 'Week 40',
    aesNumber: null,
    sealNumber: 'FX31870950',
    reviewIssues: [
      'missing container number',
      'missing AES filing number',
      'missing weight',
      'missing/unparseable departure date',
    ],
  },
};

function mockLoad(row: unknown) {
  const chain: any = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(row ? [row] : []),
  };
  (db.select as any).mockReturnValue(chain);
  return chain;
}

function mockUpdateChain(returned: unknown) {
  const set = vi.fn().mockReturnValue({
    where: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([returned]),
    }),
  });
  (db.update as any).mockReturnValue({ set });
  return set;
}

function patchRequest(body: unknown) {
  return new NextRequest('http://test/api/shipments/ship-1', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/shipments/[id]', () => {
  it('returns 401 without a session', async () => {
    (auth as any).mockResolvedValue(null);
    const res = await GET(new NextRequest('http://test/api/shipments/ship-1'), PARAMS);
    expect(res.status).toBe(401);
  });

  it('returns 404 for a shipment in another org', async () => {
    (auth as any).mockResolvedValue(SESSION);
    mockLoad({ ...BASE_SHIPMENT, orgId: 'org-2' });
    const res = await GET(new NextRequest('http://test/api/shipments/ship-1'), PARAMS);
    expect(res.status).toBe(404);
  });

  it('returns the shipment for the session org', async () => {
    (auth as any).mockResolvedValue(SESSION);
    mockLoad(BASE_SHIPMENT);
    const res = await GET(new NextRequest('http://test/api/shipments/ship-1'), PARAMS);
    expect(res.status).toBe(200);
    expect((await res.json()).shipment.id).toBe('ship-1');
  });
});

describe('PATCH /api/shipments/[id]', () => {
  it('returns 401 without a session', async () => {
    (auth as any).mockResolvedValue(null);
    const res = await PATCH(patchRequest({ containerNumber: 'MNBU0334957' }), PARAMS);
    expect(res.status).toBe(401);
    expect(db.update).not.toHaveBeenCalled();
  });

  it('returns 404 for another org without leaking existence', async () => {
    (auth as any).mockResolvedValue(SESSION);
    mockLoad({ ...BASE_SHIPMENT, orgId: 'org-2' });
    const res = await PATCH(patchRequest({ containerNumber: 'MNBU0334957' }), PARAMS);
    expect(res.status).toBe(404);
    // Same body as a genuinely missing shipment — no existence leak.
    expect((await res.json()).error).toBe('Not found');
    expect(db.update).not.toHaveBeenCalled();
  });

  it('returns 404 when the shipment does not exist', async () => {
    (auth as any).mockResolvedValue(SESSION);
    mockLoad(null);
    const res = await PATCH(patchRequest({ containerNumber: 'MNBU0334957' }), PARAMS);
    expect(res.status).toBe(404);
    expect((await res.json()).error).toBe('Not found');
  });

  it('updates fields and clears resolved issues while keeping unresolved ones', async () => {
    (auth as any).mockResolvedValue(SESSION);
    mockLoad(BASE_SHIPMENT);
    const set = mockUpdateChain({ id: 'ship-1' });

    const res = await PATCH(
      patchRequest({
        containerNumber: 'MNBU0334957',
        weightKg: 14739,
        aesNumber: 'X20250930123456',
      }),
      PARAMS
    );

    expect(res.status).toBe(200);
    const updateArgs = set.mock.calls[0][0];
    expect(updateArgs.containerNumber).toBe('MNBU0334957');
    expect(updateArgs.weightKg).toBe(14739);
    expect(updateArgs.importMeta.aesNumber).toBe('X20250930123456');
    // container, weight, and AES issues resolved; ETD still missing.
    expect(updateArgs.importMeta.reviewIssues).toEqual([
      'missing/unparseable departure date',
    ]);
    // untouched meta survives the recompute
    expect(updateArgs.importMeta.week).toBe('Week 40');
    expect(updateArgs.importMeta.sealNumber).toBe('FX31870950');
  });

  it('clears the departure-date issue when etd is set and empties the queue entry', async () => {
    (auth as any).mockResolvedValue(SESSION);
    mockLoad({
      ...BASE_SHIPMENT,
      containerNumber: 'MNBU0334957',
      weightKg: 14739,
      importMeta: {
        ...BASE_SHIPMENT.importMeta,
        aesNumber: 'X20250930123456',
        reviewIssues: ['missing/unparseable departure date'],
      },
    });
    const set = mockUpdateChain({ id: 'ship-1' });

    const res = await PATCH(patchRequest({ etd: '2026-06-30' }), PARAMS);

    expect(res.status).toBe(200);
    const updateArgs = set.mock.calls[0][0];
    expect(updateArgs.etd).toBeInstanceOf(Date);
    expect(updateArgs.importMeta.reviewIssues).toEqual([]);
  });

  it('clears "unparseable weight: …" issues once weightKg is set', async () => {
    (auth as any).mockResolvedValue(SESSION);
    mockLoad({
      ...BASE_SHIPMENT,
      importMeta: {
        ...BASE_SHIPMENT.importMeta,
        reviewIssues: ['unparseable weight: "abc kg"', 'missing AES filing number'],
      },
    });
    const set = mockUpdateChain({ id: 'ship-1' });

    const res = await PATCH(patchRequest({ weightKg: 14288 }), PARAMS);

    expect(res.status).toBe(200);
    const updateArgs = set.mock.calls[0][0];
    expect(updateArgs.importMeta.reviewIssues).toEqual(['missing AES filing number']);
  });

  it('returns 400 on an invalid date instead of writing', async () => {
    (auth as any).mockResolvedValue(SESSION);
    mockLoad(BASE_SHIPMENT);
    const res = await PATCH(patchRequest({ eta: 'not-a-date' }), PARAMS);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/eta/i);
    expect(db.update).not.toHaveBeenCalled();
  });

  it('rejects an invalid status with 400 (no silent coercion)', async () => {
    (auth as any).mockResolvedValue(SESSION);
    mockLoad(BASE_SHIPMENT);
    const res = await PATCH(patchRequest({ status: 'teleporting' }), PARAMS);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/status/i);
    expect(db.update).not.toHaveBeenCalled();
  });

  it('accepts a valid status value', async () => {
    (auth as any).mockResolvedValue(SESSION);
    mockLoad(BASE_SHIPMENT);
    const set = mockUpdateChain({ id: 'ship-1' });
    const res = await PATCH(patchRequest({ status: 'in_transit' }), PARAMS);
    expect(res.status).toBe(200);
    expect(set.mock.calls[0][0].status).toBe('in_transit');
  });

  it('returns 400 on malformed JSON', async () => {
    (auth as any).mockResolvedValue(SESSION);
    const res = await PATCH(
      new NextRequest('http://test/api/shipments/ship-1', {
        method: 'PATCH',
        body: 'not-json',
      }),
      PARAMS
    );
    expect(res.status).toBe(400);
  });
});
