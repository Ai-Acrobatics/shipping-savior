// ============================================================
// Notification delivery rules
// AI-12013
//
// Pure decision functions: given a user's preferences and a notification,
// should it be delivered on a given channel right now?
//
// Kept free of DB and clock dependencies (the caller passes `now`) so the
// rules are unit-testable and behave identically in the cron, the API and
// any future producer.
// ============================================================

import type {
  DigestFrequency,
  NotificationSeverity,
  NotificationType,
} from '@/lib/db/schema';

export type DeliveryChannel = 'inApp' | 'push' | 'email';

/** Severity ordering, low to high. Used for the `minSeverity` floor. */
const SEVERITY_RANK: Record<NotificationSeverity, number> = {
  info: 0,
  warning: 1,
  critical: 2,
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  shipment: 'Shipment milestones',
  cutoff: 'Cutoff deadlines',
  demurrage: 'Demurrage & detention',
  customs: 'Customs & compliance',
  cost: 'Cost & rate changes',
  margin: 'Margin alerts',
  partner: 'Partner & carrier updates',
  system: 'Account & system',
};

export const SEVERITY_LABELS: Record<NotificationSeverity, string> = {
  critical: 'Critical only',
  warning: 'Warning and above',
  info: 'Everything',
};

export const DIGEST_LABELS: Record<DigestFrequency, string> = {
  off: 'No email',
  // The producers behind these emails are hourly crons, so "as alerts happen"
  // is the honest ceiling — promising "immediately" would oversell a rail
  // that cannot beat its own upstream cadence.
  immediate: 'Email as alerts happen',
  daily: 'Daily digest',
  weekly: 'Weekly digest',
};

/**
 * What a user gets before they have ever touched the settings page.
 *
 * Deliberately not written to the database on signup: keeping defaults in
 * code means changing them changes behaviour for every user who hasn't
 * opted out, without a backfill migration.
 */
export interface EffectivePreferences {
  mutedTypes: NotificationType[];
  minSeverity: NotificationSeverity;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  emailDigest: DigestFrequency;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  timezone: string;
  digestLastSentAt: Date | null;
}

export const DEFAULT_PREFERENCES: EffectivePreferences = {
  mutedTypes: [],
  minSeverity: 'info',
  inAppEnabled: true,
  pushEnabled: true,
  emailDigest: 'daily',
  quietHoursStart: null,
  quietHoursEnd: null,
  timezone: 'America/Los_Angeles',
  digestLastSentAt: null,
};

/** Merge a partial stored row over the defaults. */
export function resolvePreferences(
  stored: Partial<EffectivePreferences> | null | undefined
): EffectivePreferences {
  if (!stored) return { ...DEFAULT_PREFERENCES };
  return {
    ...DEFAULT_PREFERENCES,
    ...Object.fromEntries(
      Object.entries(stored).filter(([, value]) => value !== undefined && value !== null)
    ),
    // A stored empty array is meaningful (nothing muted) and must survive the
    // null-filter above, which would otherwise be fine — but an explicitly
    // stored `[]` and an absent value must not be conflated.
    mutedTypes: stored.mutedTypes ?? DEFAULT_PREFERENCES.mutedTypes,
  } as EffectivePreferences;
}

export interface DeliverableNotification {
  type: NotificationType;
  severity: NotificationSeverity;
}

/** The user has silenced this type outright. */
export function isTypeMuted(
  prefs: EffectivePreferences,
  type: NotificationType
): boolean {
  return prefs.mutedTypes.includes(type);
}

/** The notification clears the user's severity floor. */
export function meetsSeverityFloor(
  prefs: EffectivePreferences,
  severity: NotificationSeverity
): boolean {
  return SEVERITY_RANK[severity] >= SEVERITY_RANK[prefs.minSeverity];
}

/**
 * Current local hour in the preference's timezone.
 *
 * Uses Intl rather than manual offset maths so DST is handled by the runtime
 * — a hand-rolled UTC offset silently drifts by an hour twice a year, which
 * is the kind of bug nobody reports and everybody notices.
 */
export function localHour(now: Date, timezone: string): number {
  try {
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    }).format(now);
    const hour = Number(formatted);
    return Number.isFinite(hour) ? hour % 24 : now.getUTCHours();
  } catch {
    // An invalid IANA zone shouldn't suppress alerts — fall back to UTC.
    return now.getUTCHours();
  }
}

/**
 * True when `now` falls inside the user's quiet hours.
 *
 * Handles the overnight case (start 21, end 7) as well as the same-day case
 * (start 9, end 17). start === end is treated as "no quiet hours" rather
 * than "always quiet", because the latter would silently disable alerts.
 */
export function isQuietHours(prefs: EffectivePreferences, now: Date): boolean {
  const { quietHoursStart: start, quietHoursEnd: end } = prefs;
  if (start === null || end === null || start === end) return false;
  const hour = localHour(now, prefs.timezone);
  return start < end ? hour >= start && hour < end : hour >= start || hour < end;
}

/**
 * The delivery decision.
 *
 * Rules, in order:
 *  1. Muted type or below the severity floor -> nothing, on any channel.
 *  2. Channel disabled -> nothing on that channel.
 *  3. Critical always goes out, quiet hours or not. A customs hold at 2am is
 *     still a 2am problem, and a user who set quiet hours did not ask to
 *     find out about it at 9.
 *  4. Otherwise, quiet hours suppress push and email. In-app is never
 *     suppressed — it's pull, not interrupt: it sits in the bell until the
 *     user looks.
 */
export function shouldDeliver(
  prefs: EffectivePreferences,
  notification: DeliverableNotification,
  channel: DeliveryChannel,
  now: Date = new Date()
): boolean {
  if (isTypeMuted(prefs, notification.type)) return false;
  if (!meetsSeverityFloor(prefs, notification.severity)) return false;

  if (channel === 'inApp') return prefs.inAppEnabled;
  if (channel === 'push' && !prefs.pushEnabled) return false;
  if (channel === 'email' && prefs.emailDigest === 'off') return false;

  if (notification.severity === 'critical') return true;
  return !isQuietHours(prefs, now);
}

/** `off` is the only setting that never produces an email. */
export function isDigestMode(frequency: DigestFrequency): boolean {
  return frequency !== 'off';
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Minimum gap between two digest emails.
 *
 * `immediate` is zero — it rides the same hourly cron as the producers, so
 * the user gets each batch on the next run rather than waiting out a period.
 * It is not a separate send-at-insert path: the alerts themselves are only
 * ever as fresh as the hourly cron that raises them, and a per-insert mailer
 * would add an email-storm failure mode for no extra freshness.
 */
export function digestIntervalMs(frequency: DigestFrequency): number {
  if (frequency === 'weekly') return 7 * DAY_MS;
  if (frequency === 'daily') return DAY_MS;
  return 0;
}

/**
 * Whether a digest is due for this user.
 *
 * A user who has never received one is due immediately, so turning the
 * setting on doesn't mean waiting a full period for the first email. The
 * interval is measured from the last send, not from a fixed wall-clock slot,
 * which keeps the cadence stable if the cron runs late.
 */
export function isDigestDue(prefs: EffectivePreferences, now: Date = new Date()): boolean {
  if (!isDigestMode(prefs.emailDigest)) return false;
  if (!prefs.digestLastSentAt) return true;

  const elapsed = now.getTime() - new Date(prefs.digestLastSentAt).getTime();
  if (elapsed < digestIntervalMs(prefs.emailDigest)) return false;

  // Don't drop a digest into the middle of the night just because the timer
  // expired there — hold it until quiet hours end.
  return !isQuietHours(prefs, now);
}
