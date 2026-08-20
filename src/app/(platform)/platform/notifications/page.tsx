"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, Info, Save, Settings2 } from "lucide-react";
import { relativeTime } from "@/components/platform/NotificationBell";
import type {
  DigestFrequency,
  NotificationSeverity,
  NotificationType,
} from "@/lib/db/schema";

/**
 * /platform/notifications — the full feed plus the per-user alert rules
 * (AI-12013).
 *
 * Settings live on the same page as the feed on purpose: the moment a user
 * wants to change what reaches them is the moment they're annoyed by
 * something in the list right above.
 */

interface NotificationItem {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  actionLabel: string | null;
  actionUrl: string | null;
  createdAt: string;
  read: boolean;
  orgWide: boolean;
}

interface Preferences {
  mutedTypes: NotificationType[];
  minSeverity: NotificationSeverity;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  emailDigest: DigestFrequency;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  timezone: string;
}

interface PrefOptions {
  types: NotificationType[];
  typeLabels: Record<NotificationType, string>;
  severities: NotificationSeverity[];
  severityLabels: Record<NotificationSeverity, string>;
  frequencies: DigestFrequency[];
  frequencyLabels: Record<DigestFrequency, string>;
}

const SEVERITY_ICON: Record<NotificationSeverity, typeof Info> = {
  critical: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};
const SEVERITY_CLASS: Record<NotificationSeverity, string> = {
  critical: "text-red-600",
  warning: "text-amber-600",
  info: "text-ocean-600",
};

const HOURS = Array.from({ length: 24 }, (_, h) => h);
const hourLabel = (h: number) =>
  `${((h + 11) % 12) + 1}:00 ${h < 12 ? "AM" : "PM"}`;

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [options, setOptions] = useState<PrefOptions | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fetchFeed = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/notifications?limit=100${showUnreadOnly ? "&unread=1" : ""}`);
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load notifications");
      const data = await res.json();
      setItems(data.notifications ?? []);
      setUnread(data.unreadCount ?? 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [showUnreadOnly]);

  const fetchPrefs = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/preferences");
      if (!res.ok) return;
      const data = await res.json();
      setPrefs(data.preferences);
      setOptions(data.options);
    } catch {
      // Non-fatal: the feed is still usable without the settings panel.
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);
  useEffect(() => {
    fetchPrefs();
  }, [fetchPrefs]);

  const markRead = async (id: string, read: boolean) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read } : n)));
    setUnread((prev) => Math.max(prev + (read ? -1 : 1), 0));
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    }).catch(() => {});
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    await fetch("/api/notifications/read-all", { method: "POST" }).catch(() => {});
    if (showUnreadOnly) fetchFeed();
  };

  const savePrefs = async () => {
    if (!prefs) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to save preferences");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const toggleMuted = (type: NotificationType) => {
    if (!prefs) return;
    setSaved(false);
    setPrefs({
      ...prefs,
      mutedTypes: prefs.mutedTypes.includes(type)
        ? prefs.mutedTypes.filter((t) => t !== type)
        : [...prefs.mutedTypes, type],
    });
  };

  const quietHoursOn = prefs?.quietHoursStart !== null && prefs?.quietHoursEnd !== null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Notifications</h1>
          <p className="text-navy-500 mt-1">
            {unread > 0 ? `${unread} unread` : "You're all caught up"} · alerts also reach the
            mobile app and your email digest.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUnreadOnly((v) => !v)}
            className={`text-sm border rounded-lg px-3 py-2 transition-colors ${
              showUnreadOnly
                ? "border-ocean-300 bg-ocean-50 text-ocean-700"
                : "border-navy-200 text-navy-700 hover:bg-navy-50"
            }`}
          >
            {showUnreadOnly ? "Showing unread" : "Show unread only"}
          </button>
          {unread > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-sm border border-navy-200 rounded-lg px-3 py-2 text-navy-700 hover:bg-navy-50"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {/* Feed */}
      <div className="bg-white border border-navy-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-sm text-navy-500">Loading…</p>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <Check className="w-7 h-7 text-navy-300 mx-auto" />
            <p className="text-navy-700 font-medium mt-3">
              {showUnreadOnly ? "Nothing unread." : "No notifications yet."}
            </p>
            <p className="text-sm text-navy-500 mt-1 max-w-md mx-auto">
              Cutoff deadlines, customs holds and margin alerts land here as they happen.
              Adjust what reaches you in the settings below.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-navy-100">
            {items.map((item) => {
              const Icon = SEVERITY_ICON[item.severity];
              return (
                <li
                  key={item.id}
                  className={`flex gap-3 px-5 py-4 ${item.read ? "" : "bg-ocean-50/40"}`}
                >
                  <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${SEVERITY_CLASS[item.severity]}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p
                        className={`text-sm ${
                          item.read ? "text-navy-700" : "text-navy-900 font-semibold"
                        }`}
                      >
                        {item.title}
                      </p>
                      {options && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded border border-navy-200 text-navy-500">
                          {options.typeLabels[item.type]}
                        </span>
                      )}
                      {item.orgWide && (
                        <span className="text-[11px] text-navy-400">whole team</span>
                      )}
                    </div>
                    <p className="text-sm text-navy-600 mt-1">{item.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-navy-400">{relativeTime(item.createdAt)}</span>
                      {item.actionUrl && (
                        <Link
                          href={item.actionUrl}
                          onClick={() => !item.read && markRead(item.id, true)}
                          className="text-xs text-ocean-600 hover:text-ocean-700 font-medium"
                        >
                          {item.actionLabel || "Open"} →
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => markRead(item.id, !item.read)}
                        className="text-xs text-navy-400 hover:text-navy-600"
                      >
                        Mark {item.read ? "unread" : "read"}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Preferences */}
      {prefs && options && (
        <div className="bg-white border border-navy-200 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-navy-400" />
            <h2 className="text-base font-semibold text-navy-900">What reaches you</h2>
          </div>

          <div>
            <p className="text-sm font-medium text-navy-800 mb-2">Alert types</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {options.types.map((type) => {
                const muted = prefs.mutedTypes.includes(type);
                return (
                  <label
                    key={type}
                    className="flex items-center gap-2.5 text-sm text-navy-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={!muted}
                      onChange={() => toggleMuted(type)}
                      className="rounded border-navy-300"
                    />
                    {options.typeLabels[type]}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="minSeverity"
                className="block text-sm font-medium text-navy-800 mb-1.5"
              >
                Minimum severity
              </label>
              <select
                id="minSeverity"
                value={prefs.minSeverity}
                onChange={(e) => {
                  setSaved(false);
                  setPrefs({ ...prefs, minSeverity: e.target.value as NotificationSeverity });
                }}
                className="w-full text-sm border border-navy-200 rounded-lg px-3 py-2 bg-white"
              >
                {options.severities.map((s) => (
                  <option key={s} value={s}>
                    {options.severityLabels[s]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="emailDigest"
                className="block text-sm font-medium text-navy-800 mb-1.5"
              >
                Email digest
              </label>
              <select
                id="emailDigest"
                value={prefs.emailDigest}
                onChange={(e) => {
                  setSaved(false);
                  setPrefs({ ...prefs, emailDigest: e.target.value as DigestFrequency });
                }}
                className="w-full text-sm border border-navy-200 rounded-lg px-3 py-2 bg-white"
              >
                {options.frequencies.map((f) => (
                  <option key={f} value={f}>
                    {options.frequencyLabels[f]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2.5 text-sm text-navy-700 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.inAppEnabled}
                onChange={(e) => {
                  setSaved(false);
                  setPrefs({ ...prefs, inAppEnabled: e.target.checked });
                }}
                className="rounded border-navy-300"
              />
              In-app bell
            </label>
            <label className="flex items-center gap-2.5 text-sm text-navy-700 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.pushEnabled}
                onChange={(e) => {
                  setSaved(false);
                  setPrefs({ ...prefs, pushEnabled: e.target.checked });
                }}
                className="rounded border-navy-300"
              />
              Mobile push
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2.5 text-sm font-medium text-navy-800 cursor-pointer">
              <input
                type="checkbox"
                checked={quietHoursOn}
                onChange={(e) => {
                  setSaved(false);
                  setPrefs({
                    ...prefs,
                    quietHoursStart: e.target.checked ? 21 : null,
                    quietHoursEnd: e.target.checked ? 7 : null,
                  });
                }}
                className="rounded border-navy-300"
              />
              Quiet hours
            </label>
            <p className="text-xs text-navy-500 mt-1">
              Holds push and email during these hours. Critical alerts always go out — a customs
              hold at 2am is still a 2am problem.
            </p>
            {quietHoursOn && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <select
                  value={prefs.quietHoursStart ?? 21}
                  onChange={(e) => {
                    setSaved(false);
                    setPrefs({ ...prefs, quietHoursStart: Number(e.target.value) });
                  }}
                  aria-label="Quiet hours start"
                  className="text-sm border border-navy-200 rounded-lg px-3 py-2 bg-white"
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {hourLabel(h)}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-navy-500">to</span>
                <select
                  value={prefs.quietHoursEnd ?? 7}
                  onChange={(e) => {
                    setSaved(false);
                    setPrefs({ ...prefs, quietHoursEnd: Number(e.target.value) });
                  }}
                  aria-label="Quiet hours end"
                  className="text-sm border border-navy-200 rounded-lg px-3 py-2 bg-white"
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {hourLabel(h)}
                    </option>
                  ))}
                </select>
                <input
                  value={prefs.timezone}
                  onChange={(e) => {
                    setSaved(false);
                    setPrefs({ ...prefs, timezone: e.target.value });
                  }}
                  aria-label="Timezone"
                  placeholder="America/Los_Angeles"
                  className="text-sm border border-navy-200 rounded-lg px-3 py-2 w-56"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-navy-100">
            <button
              type="button"
              onClick={savePrefs}
              disabled={saving}
              className="inline-flex items-center gap-2 text-sm bg-ocean-600 text-white rounded-lg px-4 py-2 hover:bg-ocean-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save preferences"}
            </button>
            {saved && <span className="text-sm text-emerald-600">Saved.</span>}
          </div>
        </div>
      )}
    </div>
  );
}
