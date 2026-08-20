/**
 * Unit tests for the notification delivery rules (AI-12013).
 *
 * These decide whether a human gets interrupted, so the behaviours that
 * matter are the suppression ones — getting them wrong either buries a
 * customs hold or wakes someone up at 2am for an FYI.
 */
import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PREFERENCES,
  digestIntervalMs,
  isDigestDue,
  isDigestMode,
  isQuietHours,
  isTypeMuted,
  localHour,
  meetsSeverityFloor,
  resolvePreferences,
  shouldDeliver,
  type EffectivePreferences,
} from './preferences';

const prefs = (overrides: Partial<EffectivePreferences> = {}): EffectivePreferences => ({
  ...DEFAULT_PREFERENCES,
  ...overrides,
});

// 2026-05-12 is a Tuesday. 06:00 UTC = 23:00 the previous day in LA.
const UTC_0600 = new Date('2026-05-12T06:00:00Z');
const UTC_2000 = new Date('2026-05-12T20:00:00Z'); // 13:00 LA

describe('resolvePreferences', () => {
  it('returns the defaults when nothing is stored', () => {
    expect(resolvePreferences(null)).toEqual(DEFAULT_PREFERENCES);
    expect(resolvePreferences(undefined)).toEqual(DEFAULT_PREFERENCES);
  });

  it('overlays stored values on the defaults', () => {
    const resolved = resolvePreferences({ emailDigest: 'weekly', minSeverity: 'critical' });
    expect(resolved.emailDigest).toBe('weekly');
    expect(resolved.minSeverity).toBe('critical');
    expect(resolved.inAppEnabled).toBe(DEFAULT_PREFERENCES.inAppEnabled);
  });

  it('preserves an explicitly stored empty mute list', () => {
    expect(resolvePreferences({ mutedTypes: [] }).mutedTypes).toEqual([]);
  });

  it('does not let a stored null clobber a default', () => {
    const resolved = resolvePreferences({ timezone: null as unknown as string });
    expect(resolved.timezone).toBe(DEFAULT_PREFERENCES.timezone);
  });

  it('keeps `false` for booleans instead of treating it as absent', () => {
    expect(resolvePreferences({ pushEnabled: false }).pushEnabled).toBe(false);
  });
});

describe('severity floor and mutes', () => {
  it('drops types the user muted', () => {
    expect(isTypeMuted(prefs({ mutedTypes: ['cost'] }), 'cost')).toBe(true);
    expect(isTypeMuted(prefs({ mutedTypes: ['cost'] }), 'cutoff')).toBe(false);
  });

  it('admits only severities at or above the floor', () => {
    const strict = prefs({ minSeverity: 'warning' });
    expect(meetsSeverityFloor(strict, 'info')).toBe(false);
    expect(meetsSeverityFloor(strict, 'warning')).toBe(true);
    expect(meetsSeverityFloor(strict, 'critical')).toBe(true);
  });

  it('admits everything at the default floor', () => {
    expect(meetsSeverityFloor(prefs(), 'info')).toBe(true);
  });
});

describe('localHour', () => {
  it('converts UTC into the preference timezone', () => {
    // 20:00 UTC on 2026-05-12 is 13:00 in Los Angeles (PDT).
    expect(localHour(UTC_2000, 'America/Los_Angeles')).toBe(13);
    expect(localHour(UTC_2000, 'UTC')).toBe(20);
  });

  it('falls back to UTC on an invalid zone rather than throwing', () => {
    expect(localHour(UTC_2000, 'Not/AZone')).toBe(20);
  });
});

describe('isQuietHours', () => {
  it('handles an overnight window that wraps midnight', () => {
    const p = prefs({ quietHoursStart: 21, quietHoursEnd: 7, timezone: 'America/Los_Angeles' });
    // 06:00 UTC = 23:00 LA — inside 21:00-07:00.
    expect(isQuietHours(p, UTC_0600)).toBe(true);
    // 20:00 UTC = 13:00 LA — outside.
    expect(isQuietHours(p, UTC_2000)).toBe(false);
  });

  it('handles a same-day window', () => {
    const p = prefs({ quietHoursStart: 9, quietHoursEnd: 17, timezone: 'UTC' });
    expect(isQuietHours(p, new Date('2026-05-12T10:00:00Z'))).toBe(true);
    expect(isQuietHours(p, new Date('2026-05-12T18:00:00Z'))).toBe(false);
  });

  it('is off when either bound is unset', () => {
    expect(isQuietHours(prefs({ quietHoursStart: 21, quietHoursEnd: null }), UTC_0600)).toBe(false);
    expect(isQuietHours(prefs(), UTC_0600)).toBe(false);
  });

  it('treats start === end as no quiet hours, not always quiet', () => {
    const p = prefs({ quietHoursStart: 9, quietHoursEnd: 9, timezone: 'UTC' });
    expect(isQuietHours(p, new Date('2026-05-12T09:30:00Z'))).toBe(false);
  });

  it('excludes the end hour and includes the start hour', () => {
    const p = prefs({ quietHoursStart: 9, quietHoursEnd: 17, timezone: 'UTC' });
    expect(isQuietHours(p, new Date('2026-05-12T09:00:00Z'))).toBe(true);
    expect(isQuietHours(p, new Date('2026-05-12T17:00:00Z'))).toBe(false);
  });
});

describe('shouldDeliver', () => {
  const info = { type: 'cost', severity: 'info' } as const;
  const critical = { type: 'cutoff', severity: 'critical' } as const;

  it('suppresses a muted type on every channel', () => {
    const p = prefs({ mutedTypes: ['cost'] });
    for (const channel of ['inApp', 'push', 'email'] as const) {
      expect(shouldDeliver(p, info, channel, UTC_2000)).toBe(false);
    }
  });

  it('suppresses below-floor severities on every channel', () => {
    const p = prefs({ minSeverity: 'critical' });
    for (const channel of ['inApp', 'push', 'email'] as const) {
      expect(shouldDeliver(p, info, channel, UTC_2000)).toBe(false);
    }
  });

  it('respects per-channel switches independently', () => {
    const p = prefs({ pushEnabled: false });
    expect(shouldDeliver(p, info, 'push', UTC_2000)).toBe(false);
    expect(shouldDeliver(p, info, 'inApp', UTC_2000)).toBe(true);
    expect(shouldDeliver(p, info, 'email', UTC_2000)).toBe(true);
  });

  it('suppresses email entirely when the digest is off', () => {
    expect(shouldDeliver(prefs({ emailDigest: 'off' }), info, 'email', UTC_2000)).toBe(false);
  });

  it('holds non-critical push and email during quiet hours', () => {
    const p = prefs({ quietHoursStart: 21, quietHoursEnd: 7, timezone: 'America/Los_Angeles' });
    expect(shouldDeliver(p, info, 'push', UTC_0600)).toBe(false);
    expect(shouldDeliver(p, info, 'email', UTC_0600)).toBe(false);
  });

  it('still delivers critical alerts during quiet hours', () => {
    const p = prefs({ quietHoursStart: 21, quietHoursEnd: 7, timezone: 'America/Los_Angeles' });
    expect(shouldDeliver(p, critical, 'push', UTC_0600)).toBe(true);
    expect(shouldDeliver(p, critical, 'email', UTC_0600)).toBe(true);
  });

  it('never suppresses in-app for quiet hours — the bell is pull, not interrupt', () => {
    const p = prefs({ quietHoursStart: 21, quietHoursEnd: 7, timezone: 'America/Los_Angeles' });
    expect(shouldDeliver(p, info, 'inApp', UTC_0600)).toBe(true);
  });

  it('honours the in-app switch even for critical alerts', () => {
    const p = prefs({ inAppEnabled: false });
    expect(shouldDeliver(p, critical, 'inApp', UTC_2000)).toBe(false);
  });
});

describe('isDigestMode', () => {
  it('emails on every frequency except off', () => {
    expect(isDigestMode('daily')).toBe(true);
    expect(isDigestMode('weekly')).toBe(true);
    // `immediate` is offered in the settings UI; excluding it here meant a
    // user who picked it silently received no email at all.
    expect(isDigestMode('immediate')).toBe(true);
    expect(isDigestMode('off')).toBe(false);
  });
});

describe('digestIntervalMs', () => {
  it('gives immediate a zero interval so it rides every cron run', () => {
    expect(digestIntervalMs('immediate')).toBe(0);
    expect(digestIntervalMs('daily')).toBe(24 * 60 * 60 * 1000);
    expect(digestIntervalMs('weekly')).toBe(7 * 24 * 60 * 60 * 1000);
  });
});

describe('isDigestDue', () => {
  it('is never due when email is off', () => {
    expect(isDigestDue(prefs({ emailDigest: 'off' }), UTC_2000)).toBe(false);
  });

  it('is due on every run for immediate, however recently it last sent', () => {
    const p = prefs({
      emailDigest: 'immediate',
      digestLastSentAt: new Date(UTC_2000.getTime() - 60 * 1000),
    });
    expect(isDigestDue(p, UTC_2000)).toBe(true);
  });

  it('still holds immediate email during quiet hours', () => {
    const p = prefs({
      emailDigest: 'immediate',
      digestLastSentAt: new Date('2026-05-11T06:00:00Z'),
      quietHoursStart: 21,
      quietHoursEnd: 7,
      timezone: 'America/Los_Angeles',
    });
    expect(isDigestDue(p, UTC_0600)).toBe(false);
    expect(isDigestDue(p, UTC_2000)).toBe(true);
  });

  it('is due immediately for a user who has never received one', () => {
    expect(isDigestDue(prefs({ emailDigest: 'daily', digestLastSentAt: null }), UTC_2000)).toBe(true);
  });

  it('waits a full day between daily digests', () => {
    const p = prefs({
      emailDigest: 'daily',
      digestLastSentAt: new Date('2026-05-12T08:00:00Z'),
    });
    expect(isDigestDue(p, new Date('2026-05-12T20:00:00Z'))).toBe(false);
    expect(isDigestDue(p, new Date('2026-05-13T09:00:00Z'))).toBe(true);
  });

  it('waits a full week between weekly digests', () => {
    const p = prefs({
      emailDigest: 'weekly',
      digestLastSentAt: new Date('2026-05-05T20:00:00Z'),
    });
    expect(isDigestDue(p, new Date('2026-05-11T20:00:00Z'))).toBe(false);
    expect(isDigestDue(p, new Date('2026-05-13T20:00:00Z'))).toBe(true);
  });

  it('holds a due digest until quiet hours end rather than mailing at 2am', () => {
    const p = prefs({
      emailDigest: 'daily',
      digestLastSentAt: new Date('2026-05-11T06:00:00Z'),
      quietHoursStart: 21,
      quietHoursEnd: 7,
      timezone: 'America/Los_Angeles',
    });
    // 06:00 UTC = 23:00 LA — interval elapsed, but inside quiet hours.
    expect(isDigestDue(p, UTC_0600)).toBe(false);
    // 20:00 UTC = 13:00 LA — send it.
    expect(isDigestDue(p, UTC_2000)).toBe(true);
  });
});
