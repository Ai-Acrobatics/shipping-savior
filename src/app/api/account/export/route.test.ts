/**
 * Unit tests for GET /api/account/export — GDPR Art. 15 export (AI-8780).
 *
 * Pins the contract: 401 without a session, passwordHash never leaves the
 * server, a real ZIP with the documented entries is returned, and member-role
 * exports scope the shipments/calculations/contracts/audit queries to the
 * caller's userId while owner/admin exports are org-wide.
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
import { shipments, calculations, contracts, auditLogs, cookieConsents } from '@/lib/db/schema';
import { GET } from './route';

/**
 * Read the file names out of a ZIP by walking local file headers. Deliberately
 * independent of src/lib/zip.ts so a bug there cannot make this test agree with
 * itself.
 */
function zipEntryNames(bytes: Uint8Array): string[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const names: string[] = [];
  let offset = 0;
  while (offset + 30 <= bytes.length && view.getUint32(offset, true) === 0x04034b50) {
    const compressedSize = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    names.push(
      new TextDecoder().decode(bytes.subarray(offset + 30, offset + 30 + nameLength))
    );
    offset += 30 + nameLength + extraLength + compressedSize;
  }
  return names;
}

/** Extract one entry's bytes as text. */
function zipEntryText(bytes: Uint8Array, name: string): string {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 0;
  while (offset + 30 <= bytes.length && view.getUint32(offset, true) === 0x04034b50) {
    const compressedSize = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const entryName = new TextDecoder().decode(
      bytes.subarray(offset + 30, offset + 30 + nameLength)
    );
    const dataStart = offset + 30 + nameLength + extraLength;
    if (entryName === name) {
      return new TextDecoder().decode(bytes.subarray(dataStart, dataStart + compressedSize));
    }
    offset = dataStart + compressedSize;
  }
  throw new Error(`entry not found: ${name}`);
}

async function zipBytes(res: Response): Promise<Uint8Array> {
  return new Uint8Array(await res.arrayBuffer());
}

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

/**
 * Queue chains in route query order:
 * user, org, member, shipments, calcs, contracts, auditLogs, cookieConsents.
 */
function mockExportQueries(overrides: Partial<Record<string, unknown[]>> = {}) {
  const chains = {
    user: selectChain(overrides.user ?? [USER_ROW]),
    org: selectChain(overrides.org ?? [{ id: 'org-1', name: 'BBH' }]),
    member: selectChain(overrides.member ?? [{ orgId: 'org-1', userId: 'user-1', role: 'owner' }]),
    shipments: selectChain(overrides.shipments ?? []),
    calculations: selectChain(overrides.calculations ?? []),
    contracts: selectChain(overrides.contracts ?? []),
    auditLogs: selectChain(overrides.auditLogs ?? []),
    cookieConsents: selectChain(overrides.cookieConsents ?? []),
  };
  (db.select as any)
    .mockReturnValueOnce(chains.user)
    .mockReturnValueOnce(chains.org)
    .mockReturnValueOnce(chains.member)
    .mockReturnValueOnce(chains.shipments)
    .mockReturnValueOnce(chains.calculations)
    .mockReturnValueOnce(chains.contracts)
    .mockReturnValueOnce(chains.auditLogs)
    .mockReturnValueOnce(chains.cookieConsents);
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

  it('returns 401 for a session shell with no user', async () => {
    // auth.js hands back a session object with `user` undefined when the host
    // is untrusted or the JWT fails to decode — that must be a 401, not a 500.
    (auth as any).mockResolvedValue({});
    const res = await GET();
    expect(res.status).toBe(401);
    expect(db.select).not.toHaveBeenCalled();
  });

  it('returns a ZIP attachment and never includes passwordHash', async () => {
    (auth as any).mockResolvedValue({
      user: { id: 'user-1', orgId: 'org-1', role: 'owner' },
    });
    mockExportQueries();

    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/zip');
    expect(res.headers.get('Content-Disposition')).toMatch(
      /^attachment; filename="shipping-savior-export-\d{4}-\d{2}-\d{2}\.zip"$/
    );
    // An export is personal data — it must never be cached by a CDN.
    expect(res.headers.get('Cache-Control')).toContain('no-store');

    const bytes = await zipBytes(res);
    // PK\x03\x04 local file header magic
    expect(Array.from(bytes.slice(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);
    expect(zipEntryNames(bytes)).toEqual([
      'README.txt',
      'profile.json',
      'shipments.csv',
      'calculations.csv',
      'contracts.csv',
      'audit-logs.csv',
      'cookie-consents.csv',
    ]);

    const profile = JSON.parse(zipEntryText(bytes, 'profile.json'));
    expect(profile.exportedAt).toBeTruthy();
    expect(profile.scope).toBe('organization');
    expect(profile.user.email).toBe('blake@bbh-logistics.com');
    expect(profile.user.passwordHash).toBeUndefined();
    expect(profile.org).toEqual({ id: 'org-1', name: 'BBH' });
    expect(profile.orgMember).toEqual({ orgId: 'org-1', userId: 'user-1', role: 'owner' });

    // The hash must not appear anywhere in the archive, not just in profile.json.
    expect(new TextDecoder().decode(bytes)).not.toContain('bcrypt$secret');
  });

  it('writes tabular records as CSV inside the archive', async () => {
    (auth as any).mockResolvedValue({
      user: { id: 'user-1', orgId: 'org-1', role: 'owner' },
    });
    mockExportQueries({
      shipments: [
        { id: 's-1', reference: 'REF-1', notes: 'has, comma' },
        { id: 's-2', reference: 'REF-2', notes: null },
      ],
    });

    const bytes = await zipBytes(await GET());
    const csv = zipEntryText(bytes, 'shipments.csv');
    expect(csv.split('\r\n')[0]).toBe('id,reference,notes');
    expect(csv).toContain('"has, comma"');
    // null becomes an empty cell, not the string "null"
    expect(csv.trim().endsWith('s-2,REF-2,')).toBe(true);
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
    expect(chains.auditLogs.where).toHaveBeenCalledWith(eq(auditLogs.orgId, 'org-1'));
    // Consent history is always personal, never org-wide — even for an owner.
    expect(chains.cookieConsents.where).toHaveBeenCalledWith(
      eq(cookieConsents.userId, 'user-1')
    );
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
    expect(chains.auditLogs.where).toHaveBeenCalledWith(
      and(eq(auditLogs.orgId, 'org-1'), eq(auditLogs.userId, 'user-2'))
    );
  });
});
