/**
 * Unit tests for POST /api/consent — cookie-consent audit trail (AI-8780).
 *
 * Pins the contract a regulator would care about: the choice is validated, the
 * server-readable cookie is set with a 12-month lifetime, an audit row is
 * written with the policy version, and an audit-write failure still honors the
 * visitor's choice rather than re-prompting them forever.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db', () => ({ db: { insert: vi.fn() } }));

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_SECONDS,
  CONSENT_POLICY_VERSION,
  VISITOR_COOKIE,
} from '@/lib/legal/consent';
import { POST } from './route';

function request(body: unknown, cookies: Record<string, string> = {}) {
  const headers = new Headers({
    'content-type': 'application/json',
    'x-forwarded-for': '203.0.113.7, 70.41.3.18',
    'user-agent': 'vitest',
  });
  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
  if (cookieHeader) headers.set('cookie', cookieHeader);

  return new NextRequest('https://shipping-savior.vercel.app/api/consent', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

/** Capture the values handed to db.insert(...).values(...). */
function captureInsert() {
  const values = vi.fn().mockResolvedValue(undefined);
  (db.insert as any).mockReturnValue({ values });
  return values;
}

beforeEach(() => {
  vi.clearAllMocks();
  (auth as any).mockResolvedValue(null);
});

describe('POST /api/consent', () => {
  it('rejects a choice outside the allowed set', async () => {
    captureInsert();
    const res = await POST(request({ choice: 'marketing' }));
    expect(res.status).toBe(400);
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('rejects a malformed body without throwing', async () => {
    captureInsert();
    const res = await POST(request('not json'));
    expect(res.status).toBe(400);
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('sets the server-readable consent cookie for 12 months', async () => {
    captureInsert();
    const res = await POST(request({ choice: 'all' }));
    expect(res.status).toBe(200);

    const consent = res.cookies.get(CONSENT_COOKIE);
    expect(consent?.value).toBe('all');
    expect(consent?.maxAge).toBe(CONSENT_MAX_AGE_SECONDS);
    expect(consent?.sameSite).toBe('lax');
    // The banner has to read it client-side to decide whether to re-prompt.
    expect(consent?.httpOnly).toBe(false);

    expect(res.cookies.get(VISITOR_COOKIE)?.value).toBeTruthy();
  });

  it('writes an auditable row with the policy version and client IP', async () => {
    const values = captureInsert();
    await POST(request({ choice: 'essential' }));

    expect(values).toHaveBeenCalledTimes(1);
    const row = values.mock.calls[0][0];
    expect(row.choice).toBe('essential');
    expect(row.policyVersion).toBe(CONSENT_POLICY_VERSION);
    // First hop of x-forwarded-for is the client, not the proxy.
    expect(row.ipAddress).toBe('203.0.113.7');
    expect(row.userAgent).toBe('vitest');
    expect(row.userId).toBeNull();
    expect(row.orgId).toBeNull();
  });

  it('attributes the consent to the signed-in user when there is a session', async () => {
    (auth as any).mockResolvedValue({
      user: { id: 'user-1', orgId: 'org-1', role: 'owner' },
    });
    const values = captureInsert();
    await POST(request({ choice: 'all' }));

    const row = values.mock.calls[0][0];
    expect(row.userId).toBe('user-1');
    expect(row.orgId).toBe('org-1');
  });

  it('reuses an existing visitor id instead of minting a new one', async () => {
    const values = captureInsert();
    const res = await POST(request({ choice: 'all' }, { [VISITOR_COOKIE]: 'visitor-abc' }));

    expect(values.mock.calls[0][0].visitorId).toBe('visitor-abc');
    expect(res.cookies.get(VISITOR_COOKIE)?.value).toBe('visitor-abc');
  });

  it('still honors the choice when the audit write fails', async () => {
    (db.insert as any).mockReturnValue({
      values: vi.fn().mockRejectedValue(new Error('db down')),
    });
    const res = await POST(request({ choice: 'essential' }));

    expect(res.status).toBe(200);
    expect(res.cookies.get(CONSENT_COOKIE)?.value).toBe('essential');
  });
});
