/**
 * Who may manage customer portal links (AI-12022).
 *
 * A portal token is a standing, login-free credential to one customer's whole
 * book. Listing links exposes the tokens, so viewers are kept out; minting,
 * rotating and deleting them is limited to admins and owners.
 */
import { describe, it, expect } from 'vitest';
import { hasPermission } from '@/lib/auth/permissions';

describe('customer portal permissions', () => {
  it('lets members list portal links but not viewers', () => {
    expect(hasPermission('viewer', 'portal:view')).toBe(false);
    expect(hasPermission('member', 'portal:view')).toBe(true);
    expect(hasPermission('admin', 'portal:view')).toBe(true);
    expect(hasPermission('owner', 'portal:view')).toBe(true);
  });

  it('limits minting, rotating and deleting links to admins and owners', () => {
    expect(hasPermission('viewer', 'portal:share')).toBe(false);
    expect(hasPermission('member', 'portal:share')).toBe(false);
    expect(hasPermission('admin', 'portal:share')).toBe(true);
    expect(hasPermission('owner', 'portal:share')).toBe(true);
  });
});
