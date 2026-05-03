/**
 * Unit tests for tier-based usage limits (AI-8783, depends on AI-8777).
 *
 * `getOrgLimits` is pure — straightforward to assert.
 * `enforceLimit` and `getCurrentUsage` touch the DB; we mock `@/lib/db` so
 * tests stay hermetic. We're verifying the *enforcement logic* — the count
 * comparison + the LimitExceededError shape — not the SQL itself (that's
 * exercised by the scoped-query tests + the integration test layer).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @/lib/db BEFORE importing the module under test. Vitest hoists vi.mock
// calls to the top of the file so this is order-safe.
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

import { db } from '@/lib/db';
import {
  getOrgLimits,
  enforceLimit,
  LimitExceededError,
} from './limits';

const ORG_ID = 'org-test-123';

/**
 * Build a chained query mock that ends with a one-row result.
 * Drizzle's API: db.select().from().where().limit() / .where() returning array.
 */
function mockQueryReturning(rows: unknown[]) {
  const chain: any = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(rows),
  };
  // Make the chain awaitable too (so .where() alone works).
  chain.then = (resolve: (v: unknown[]) => unknown) => resolve(rows);
  (db.select as any).mockReturnValue(chain);
  return chain;
}

describe('getOrgLimits', () => {
  it('returns the free-tier shape', () => {
    const limits = getOrgLimits('free');
    expect(limits).toEqual({
      users: 1,
      calculations: 10,
      bolUploads: 5,
      contractUploads: 0,
    });
  });

  it('returns premium-tier shape with unlimited calculations', () => {
    const limits = getOrgLimits('premium');
    expect(limits.users).toBe(8);
    expect(limits.calculations).toBe(Infinity);
    expect(limits.bolUploads).toBe(100);
    expect(limits.contractUploads).toBe(25);
  });

  it('returns enterprise-tier shape with mostly unlimited resources', () => {
    const limits = getOrgLimits('enterprise');
    expect(limits.users).toBe(20);
    expect(limits.calculations).toBe(Infinity);
    expect(limits.bolUploads).toBe(Infinity);
    expect(limits.contractUploads).toBe(Infinity);
  });

  it('falls back to free when plan is null/undefined (defensive for legacy rows)', () => {
    expect(getOrgLimits(null)).toEqual(getOrgLimits('free'));
    expect(getOrgLimits(undefined)).toEqual(getOrgLimits('free'));
  });
});

describe('enforceLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('short-circuits without a usage query when the cap is Infinity (premium calculations)', async () => {
    // First call (getOrgPlan) → premium
    mockQueryReturning([{ planTier: 'premium' }]);
    await expect(enforceLimit(ORG_ID, 'calculations')).resolves.toBeUndefined();
    // Only the plan-lookup select should have happened (1 call), no count query.
    expect(db.select).toHaveBeenCalledTimes(1);
  });

  it('passes when usage is below the cap (free tier, 5/10 calculations used)', async () => {
    // 1st call: getOrgPlan → free
    // 2nd call: getCurrentUsage → 5
    let call = 0;
    (db.select as any).mockImplementation(() => {
      call += 1;
      if (call === 1) {
        return {
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([{ planTier: 'free' }]),
        };
      }
      // Count query
      return {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ value: 5 }]),
      };
    });

    await expect(enforceLimit(ORG_ID, 'calculations')).resolves.toBeUndefined();
  });

  it('throws LimitExceededError when usage equals the cap (free tier, 10/10 calculations)', async () => {
    // Mock loops on every db.select() call by inspecting which table-shape the
    // call is going against — we key off the call counter modulo 2 so repeat
    // invocations of enforceLimit in the same test still get a consistent
    // (planTier, count) sequence.
    (db.select as any).mockImplementation(() => {
      const idx = (db.select as any).mock.calls.length;
      // odd call → plan lookup; even call → usage count
      if (idx % 2 === 1) {
        return {
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([{ planTier: 'free' }]),
        };
      }
      return {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ value: 10 }]),
      };
    });

    await expect(enforceLimit(ORG_ID, 'calculations')).rejects.toThrow(LimitExceededError);

    // Re-invoke to capture the typed error instance for shape assertions.
    let captured: LimitExceededError | null = null;
    try {
      await enforceLimit(ORG_ID, 'calculations');
    } catch (e) {
      captured = e as LimitExceededError;
    }
    expect(captured).toBeInstanceOf(LimitExceededError);
    expect(captured?.code).toBe('LIMIT_EXCEEDED');
    expect(captured?.resource).toBe('calculations');
    expect(captured?.limit).toBe(10);
    expect(captured?.used).toBe(10);
    expect(captured?.plan).toBe('free');
  });

  it('throws LimitExceededError when usage exceeds the cap (free tier, 11/10)', async () => {
    let call = 0;
    (db.select as any).mockImplementation(() => {
      call += 1;
      if (call === 1) {
        return {
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([{ planTier: 'free' }]),
        };
      }
      return {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ value: 11 }]),
      };
    });

    await expect(enforceLimit(ORG_ID, 'calculations')).rejects.toThrow(/LIMIT_EXCEEDED|Plan limit exceeded/);
  });

  it('treats a missing org row as a free-tier org (legacy / migration safety)', async () => {
    // 1st call: getOrgPlan → no rows
    // 2nd call: getCurrentUsage('contractUploads') → 0
    let call = 0;
    (db.select as any).mockImplementation(() => {
      call += 1;
      if (call === 1) {
        return {
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([]),
        };
      }
      return {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ value: 0 }]),
      };
    });

    // Free tier has contractUploads cap of 0, used=0 → 0 >= 0 → throws.
    await expect(enforceLimit(ORG_ID, 'contractUploads')).rejects.toThrow(LimitExceededError);
  });
});

describe('LimitExceededError', () => {
  it('carries structured metadata for API error responses', () => {
    const err = new LimitExceededError('bolUploads', 5, 5, 'free');
    expect(err.code).toBe('LIMIT_EXCEEDED');
    expect(err.resource).toBe('bolUploads');
    expect(err.limit).toBe(5);
    expect(err.used).toBe(5);
    expect(err.plan).toBe('free');
    expect(err.name).toBe('LimitExceededError');
    expect(err.message).toContain('5/5');
    expect(err.message).toContain('bolUploads');
    expect(err.message).toContain('free');
  });
});
