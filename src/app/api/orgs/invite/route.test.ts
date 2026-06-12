/**
 * Unit tests for POST /api/orgs/invite invite-email behavior (AI-5581).
 *
 * Pins the contract: email failure must NOT fail invite creation — the route
 * returns 201 with emailSent:false and still persists the invite + returns the
 * shareable link.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
  },
}));

vi.mock('@/lib/db/queries/org', () => ({
  getOrgMembership: vi.fn(),
  getActiveInviteByEmail: vi.fn(),
  getExistingMemberByEmail: vi.fn(),
  getOrgById: vi.fn(),
}));

vi.mock('@/lib/auth/audit', () => ({
  writeAuditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/auth/email', () => ({
  sendEmail: vi.fn(),
  renderOrgInviteEmail: vi.fn().mockReturnValue({
    subject: "You've been invited to Acme Freight on Shipping Savior",
    html: '<p>invite</p>',
    text: 'invite',
  }),
  getAppBaseUrl: vi.fn().mockReturnValue('http://test'),
}));

vi.mock('@/lib/billing/limits', () => ({
  enforceLimit: vi.fn().mockResolvedValue(undefined),
  LimitExceededError: class LimitExceededError extends Error {},
}));

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  getOrgMembership,
  getActiveInviteByEmail,
  getExistingMemberByEmail,
  getOrgById,
} from '@/lib/db/queries/org';
import { sendEmail, renderOrgInviteEmail } from '@/lib/auth/email';
import { POST } from './route';

const SESSION = {
  user: {
    id: 'user-1',
    orgId: 'org-1',
    role: 'owner',
    name: 'Jane Owner',
    email: 'jane@acme.test',
  },
} as never;

function postInvite(body: unknown) {
  return POST(
    new NextRequest('http://test/api/orgs/invite', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  (auth as any).mockResolvedValue(SESSION);
  (getOrgMembership as any).mockResolvedValue({
    id: 'm-1',
    orgId: 'org-1',
    userId: 'user-1',
    role: 'owner',
  });
  (getExistingMemberByEmail as any).mockResolvedValue(null);
  (getActiveInviteByEmail as any).mockResolvedValue(null);
  (getOrgById as any).mockResolvedValue({ id: 'org-1', name: 'Acme Freight' });
  (db.insert as any).mockReturnValue({
    values: vi.fn().mockResolvedValue(undefined),
  });
  (renderOrgInviteEmail as any).mockReturnValue({
    subject: "You've been invited to Acme Freight on Shipping Savior",
    html: '<p>invite</p>',
    text: 'invite',
  });
});

describe('POST /api/orgs/invite', () => {
  it('creates the invite with emailSent:false when the email sender throws', async () => {
    (sendEmail as any).mockRejectedValue(new Error('resend is down'));

    const res = await postInvite({ email: 'new@acme.test', role: 'member' });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.emailSent).toBe(false);
    expect(body.inviteUrl).toMatch(/^http:\/\/test\/invite\/[0-9a-f]{64}$/);
    // Invite was still persisted despite the email failure
    expect(db.insert).toHaveBeenCalledTimes(1);
  });

  it('returns emailSent:true and passes org + inviter context to the template', async () => {
    (sendEmail as any).mockResolvedValue({ ok: true, id: 'email-1' });

    const res = await postInvite({ email: 'new@acme.test', role: 'viewer' });

    expect(res.status).toBe(201);
    expect((await res.json()).emailSent).toBe(true);
    expect(renderOrgInviteEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        orgName: 'Acme Freight',
        inviterName: 'Jane Owner',
        role: 'viewer',
        expiresInDays: 7,
      })
    );
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'new@acme.test' })
    );
  });

  it('treats a non-ok sender result as emailSent:false without failing', async () => {
    (sendEmail as any).mockResolvedValue({ ok: false, skipped: true });

    const res = await postInvite({ email: 'new@acme.test', role: 'member' });

    expect(res.status).toBe(201);
    expect((await res.json()).emailSent).toBe(false);
  });

  it('returns 401 without a session and sends nothing', async () => {
    (auth as any).mockResolvedValue(null);

    const res = await postInvite({ email: 'new@acme.test', role: 'member' });

    expect(res.status).toBe(401);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });
});
