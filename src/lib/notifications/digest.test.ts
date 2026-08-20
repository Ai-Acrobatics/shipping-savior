/**
 * Unit tests for digest rendering (AI-12013).
 *
 * The behaviours worth locking down are the ones that decide whether a user
 * keeps the emails or filters the sender: never send an empty digest, lead
 * with what's urgent, and don't inject raw user content into HTML.
 */
import { describe, it, expect } from 'vitest';
import {
  digestSubject,
  groupForDigest,
  renderDigest,
  type DigestNotification,
} from './digest';

const n = (overrides: Partial<DigestNotification> = {}): DigestNotification => ({
  id: 'n-1',
  type: 'cutoff',
  severity: 'info',
  title: 'Reefer cutoff approaching',
  message: 'MSCU1234567 reefer cutoff is in 18 hours.',
  actionUrl: '/platform/shipments/abc',
  actionLabel: 'View shipment',
  createdAt: '2026-05-12T10:00:00Z',
  ...overrides,
});

const OPTS = { baseUrl: 'https://shippingsavior.com' };

describe('groupForDigest', () => {
  it('groups by type', () => {
    const groups = groupForDigest([
      n({ id: 'a', type: 'cutoff' }),
      n({ id: 'b', type: 'customs' }),
      n({ id: 'c', type: 'cutoff' }),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups.find((g) => g.type === 'cutoff')?.items).toHaveLength(2);
  });

  it('floats the group containing a critical to the top', () => {
    const groups = groupForDigest([
      n({ id: 'a', type: 'cost' }),
      n({ id: 'b', type: 'cost' }),
      n({ id: 'c', type: 'cost' }),
      n({ id: 'd', type: 'customs', severity: 'critical' }),
    ]);
    // The customs group is smaller but carries the critical.
    expect(groups[0].type).toBe('customs');
  });

  it('sorts critical first inside a group, then newest first', () => {
    const groups = groupForDigest([
      n({ id: 'old', severity: 'info', createdAt: '2026-05-10T10:00:00Z' }),
      n({ id: 'new', severity: 'info', createdAt: '2026-05-12T10:00:00Z' }),
      n({ id: 'crit', severity: 'critical', createdAt: '2026-05-09T10:00:00Z' }),
    ]);
    expect(groups[0].items.map((i) => i.id)).toEqual(['crit', 'new', 'old']);
  });

  it('labels each group with its human-readable type name', () => {
    expect(groupForDigest([n({ type: 'margin' })])[0].label).toBe('Margin alerts');
  });
});

describe('digestSubject', () => {
  it('leads with the critical count when there is one', () => {
    const subject = digestSubject([n({ severity: 'critical' }), n({ id: 'b' })], 'day');
    expect(subject).toContain('1 needs attention');
    expect(subject).toContain('2 updates');
  });

  it('omits the critical clause when nothing is urgent', () => {
    expect(digestSubject([n()], 'day')).toBe('Shipping Savior — 1 update this day');
  });

  it('singularises correctly', () => {
    expect(digestSubject([n()], 'week')).toContain('1 update this week');
    expect(digestSubject([n(), n({ id: 'b' })], 'week')).toContain('2 updates');
  });
});

describe('renderDigest', () => {
  it('returns null for an empty set — an empty digest is not an email', () => {
    expect(renderDigest([], OPTS)).toBeNull();
  });

  it('counts by severity', () => {
    const digest = renderDigest(
      [
        n({ id: 'a', severity: 'critical' }),
        n({ id: 'b', severity: 'warning' }),
        n({ id: 'c', severity: 'info' }),
        n({ id: 'd', severity: 'info' }),
      ],
      OPTS
    );
    expect(digest!.counts).toEqual({ total: 4, critical: 1, warning: 1, info: 2 });
  });

  it('returns the ids it included so the caller can stamp them emailed', () => {
    const digest = renderDigest([n({ id: 'a' }), n({ id: 'b' })], OPTS);
    expect(digest!.notificationIds.sort()).toEqual(['a', 'b']);
  });

  it('makes relative action URLs absolute against the base URL', () => {
    const digest = renderDigest([n({ actionUrl: '/platform/shipments/abc' })], OPTS);
    expect(digest!.html).toContain('https://shippingsavior.com/platform/shipments/abc');
    expect(digest!.text).toContain('https://shippingsavior.com/platform/shipments/abc');
  });

  it('leaves absolute action URLs alone', () => {
    const digest = renderDigest([n({ actionUrl: 'https://example.com/x' })], OPTS);
    expect(digest!.html).toContain('https://example.com/x');
    expect(digest!.html).not.toContain('shippingsavior.com/https');
  });

  it('tolerates a base URL with a trailing slash', () => {
    const digest = renderDigest([n()], { baseUrl: 'https://shippingsavior.com/' });
    expect(digest!.html).not.toContain('.com//platform');
  });

  it('escapes HTML in titles and messages', () => {
    const digest = renderDigest(
      [n({ title: '<script>alert(1)</script>', message: 'a & b "quoted"' })],
      OPTS
    );
    expect(digest!.html).not.toContain('<script>');
    expect(digest!.html).toContain('&lt;script&gt;');
    expect(digest!.html).toContain('a &amp; b');
  });

  it('omits the action link when there is no URL', () => {
    const digest = renderDigest([n({ actionUrl: null, actionLabel: null })], OPTS);
    expect(digest!.html).not.toContain('View shipment');
  });

  it('greets by name when one is supplied and generically otherwise', () => {
    expect(renderDigest([n()], { ...OPTS, recipientName: 'Blake' })!.html).toContain('Hi Blake,');
    expect(renderDigest([n()], OPTS)!.html).toContain('Hi,');
  });

  it("labels an immediate digest as as-it-happens, not daily", () => {
    const digest = renderDigest([n()], { ...OPTS, period: 'hour' })!;
    expect(digest.html).toContain('as-it-happens digest');
    expect(digest.text).toContain('as-it-happens digest');
    expect(digest.html).not.toContain('daily digest');
  });

  it('labels the period as weekly when asked', () => {
    const digest = renderDigest([n()], { ...OPTS, period: 'week' });
    expect(digest!.html).toContain('weekly digest');
    expect(digest!.subject).toContain('this week');
  });

  it('always links to the notification centre for unsubscribing/tuning', () => {
    const digest = renderDigest([n()], OPTS);
    expect(digest!.html).toContain('/platform/notifications');
    expect(digest!.text).toContain('/platform/notifications');
  });
});
