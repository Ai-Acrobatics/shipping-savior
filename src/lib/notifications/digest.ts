// ============================================================
// Email digest rendering
// AI-12013
//
// Pure: takes notifications in, returns a subject + HTML + text body. No DB,
// no Resend, no clock — the cron does the I/O so this stays testable.
// ============================================================

import type { NotificationSeverity, NotificationType } from '@/lib/db/schema';
import { NOTIFICATION_TYPE_LABELS } from './preferences';

export interface DigestNotification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  actionUrl?: string | null;
  actionLabel?: string | null;
  createdAt: Date | string;
}

export interface DigestGroup {
  type: NotificationType;
  label: string;
  items: DigestNotification[];
}

export interface RenderedDigest {
  subject: string;
  html: string;
  text: string;
  notificationIds: string[];
  counts: { total: number; critical: number; warning: number; info: number };
}

const SEVERITY_ORDER: NotificationSeverity[] = ['critical', 'warning', 'info'];

const SEVERITY_COLOR: Record<NotificationSeverity, string> = {
  critical: '#dc2626',
  warning: '#d97706',
  info: '#0284c7',
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Group by type, critical-first within each group.
 *
 * Grouping by type rather than by time because a digest is read as a
 * to-do list — "three cutoffs, one customs hold" is actionable, a reverse
 * chronological blur is not.
 */
export function groupForDigest(notifications: DigestNotification[]): DigestGroup[] {
  const byType = new Map<NotificationType, DigestNotification[]>();
  for (const n of notifications) {
    const bucket = byType.get(n.type);
    if (bucket) bucket.push(n);
    else byType.set(n.type, [n]);
  }

  const groups: DigestGroup[] = [];
  for (const [type, items] of byType) {
    items.sort((a, b) => {
      const bySeverity =
        SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
      if (bySeverity !== 0) return bySeverity;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    groups.push({ type, label: NOTIFICATION_TYPE_LABELS[type], items });
  }

  // Groups containing a critical float to the top, then by size.
  return groups.sort((a, b) => {
    const aCrit = a.items.some((i) => i.severity === 'critical') ? 1 : 0;
    const bCrit = b.items.some((i) => i.severity === 'critical') ? 1 : 0;
    if (aCrit !== bCrit) return bCrit - aCrit;
    return b.items.length - a.items.length;
  });
}

/**
 * Subject line. Leads with the count and the worst severity, because that is
 * all a subject line gets read for.
 */
export function digestSubject(notifications: DigestNotification[], period: string): string {
  const total = notifications.length;
  const critical = notifications.filter((n) => n.severity === 'critical').length;
  if (total === 0) return `Shipping Savior — nothing needs you this ${period}`;
  const noun = total === 1 ? 'update' : 'updates';
  return critical > 0
    ? `Shipping Savior — ${critical} needs attention, ${total} ${noun} this ${period}`
    : `Shipping Savior — ${total} ${noun} this ${period}`;
}

/**
 * Render the digest.
 *
 * Returns `null` when there is nothing to send. An empty digest is not an
 * email — sending "you have 0 notifications" on a schedule is the fastest
 * way to teach a user to filter the sender.
 */
export type DigestPeriod = 'hour' | 'day' | 'week';

/** How the period reads in a header line. */
const PERIOD_LABEL: Record<DigestPeriod, string> = {
  hour: 'as-it-happens',
  day: 'daily',
  week: 'weekly',
};

export function renderDigest(
  notifications: DigestNotification[],
  opts: { baseUrl: string; period?: DigestPeriod; recipientName?: string | null }
): RenderedDigest | null {
  if (notifications.length === 0) return null;

  const period = opts.period ?? 'day';
  const groups = groupForDigest(notifications);
  const base = opts.baseUrl.replace(/\/$/, '');

  const counts = {
    total: notifications.length,
    critical: notifications.filter((n) => n.severity === 'critical').length,
    warning: notifications.filter((n) => n.severity === 'warning').length,
    info: notifications.filter((n) => n.severity === 'info').length,
  };

  const absolute = (url?: string | null) =>
    !url ? null : url.startsWith('http') ? url : `${base}${url.startsWith('/') ? '' : '/'}${url}`;

  const greeting = opts.recipientName ? `Hi ${escapeHtml(opts.recipientName)},` : 'Hi,';

  const htmlGroups = groups
    .map((group) => {
      const items = group.items
        .map((item) => {
          const href = absolute(item.actionUrl);
          const link = href
            ? `<div style="margin-top:6px"><a href="${escapeHtml(href)}" style="color:#0284c7;font-size:13px;text-decoration:none">${escapeHtml(
                item.actionLabel || 'Open'
              )} &rarr;</a></div>`
            : '';
          return `
            <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0">
              <div style="font-size:14px;font-weight:600;color:#0f172a">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${
                  SEVERITY_COLOR[item.severity]
                };margin-right:8px"></span>${escapeHtml(item.title)}
              </div>
              <div style="font-size:13px;color:#475569;margin-top:3px">${escapeHtml(item.message)}</div>
              ${link}
            </td></tr>`;
        })
        .join('');

      return `
        <div style="margin-top:24px">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;font-weight:600">
            ${escapeHtml(group.label)} (${group.items.length})
          </div>
          <table style="width:100%;border-collapse:collapse">${items}</table>
        </div>`;
    })
    .join('');

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f8fafc">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
    <div style="font-size:18px;font-weight:700;color:#0f172a">Shipping Savior</div>
    <div style="font-size:13px;color:#64748b;margin-top:2px">Your ${PERIOD_LABEL[period]} digest</div>

    <p style="font-size:14px;color:#334155;margin-top:24px">${greeting}</p>
    <p style="font-size:14px;color:#334155">
      ${counts.total} update${counts.total === 1 ? '' : 's'} since your last digest${
        counts.critical > 0
          ? `, <strong style="color:#dc2626">${counts.critical} needing attention</strong>`
          : ''
      }.
    </p>

    ${htmlGroups}

    <div style="margin-top:32px">
      <a href="${escapeHtml(base)}/platform/notifications"
         style="display:inline-block;background:#0284c7;color:#fff;font-size:14px;font-weight:600;padding:10px 18px;border-radius:8px;text-decoration:none">
        Open notification centre
      </a>
    </div>

    <p style="font-size:12px;color:#94a3b8;margin-top:32px;border-top:1px solid #e2e8f0;padding-top:16px">
      Change what lands here — frequency, quiet hours, which alerts you care about — in
      <a href="${escapeHtml(base)}/platform/notifications" style="color:#64748b">notification settings</a>.
    </p>
  </div>
</body></html>`;

  const text = [
    `Shipping Savior — your ${PERIOD_LABEL[period]} digest`,
    '',
    `${counts.total} update${counts.total === 1 ? '' : 's'}${
      counts.critical > 0 ? `, ${counts.critical} needing attention` : ''
    }.`,
    '',
    ...groups.flatMap((group) => [
      `${group.label.toUpperCase()} (${group.items.length})`,
      ...group.items.map((item) => {
        const href = absolute(item.actionUrl);
        return `  [${item.severity}] ${item.title} — ${item.message}${href ? `\n    ${href}` : ''}`;
      }),
      '',
    ]),
    `Open the notification centre: ${base}/platform/notifications`,
  ].join('\n');

  return {
    subject: digestSubject(notifications, period),
    html,
    text,
    notificationIds: notifications.map((n) => n.id),
    counts,
  };
}
