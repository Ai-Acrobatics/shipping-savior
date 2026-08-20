"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Bell, Check, Info, Settings } from "lucide-react";
import type { NotificationSeverity, NotificationType } from "@/lib/db/schema";

/**
 * Notification bell + dropdown (AI-12013).
 *
 * Replaces the placeholder bell that linked to the review queue. Polls for
 * the unread count rather than holding a socket open — the feed's producers
 * are hourly crons, so a 60s poll is well inside the resolution anyone
 * needs, and it costs one cheap indexed count per minute per open tab.
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
}

const POLL_MS = 60_000;

const SEVERITY_ICON: Record<NotificationSeverity, typeof Bell> = {
  critical: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

const SEVERITY_CLASS: Record<NotificationSeverity, string> = {
  critical: "text-red-600",
  warning: "text-amber-600",
  info: "text-ocean-600",
};

export function relativeTime(value: string, now: Date = new Date()): string {
  const then = new Date(value);
  if (Number.isNaN(then.getTime())) return "";
  const seconds = Math.round((now.getTime() - then.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchFeed = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=15");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications ?? []);
      setUnread(data.unreadCount ?? 0);
    } catch {
      // A failed poll is not worth surfacing — the next one is 60s away and
      // an error toast every minute on a flaky connection is worse than
      // a stale badge.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
    const timer = setInterval(fetchFeed, POLL_MS);
    return () => clearInterval(timer);
  }, [fetchFeed]);

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markRead = async (id: string) => {
    // Optimistic: the badge should drop the instant it's clicked. A failed
    // PATCH is corrected by the next poll.
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((prev) => Math.max(prev - 1, 0));
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    }).catch(() => {});
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    await fetch("/api/notifications/read-all", { method: "POST" }).catch(() => {});
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) fetchFeed();
        }}
        className="p-2 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded-lg transition-colors relative"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-semibold flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-2rem)] bg-white border border-navy-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-navy-200">
            <p className="text-sm font-semibold text-navy-900">
              Notifications
              {unread > 0 && <span className="text-navy-400 font-normal"> · {unread} unread</span>}
            </p>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs text-ocean-600 hover:text-ocean-700 px-2 py-1 rounded"
                >
                  Mark all read
                </button>
              )}
              <Link
                href="/platform/notifications"
                onClick={() => setOpen(false)}
                className="p-1.5 text-navy-400 hover:text-navy-600 rounded"
                aria-label="Notification settings"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {isLoading && items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-navy-500">Loading…</p>
            ) : items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Check className="w-6 h-6 text-navy-300 mx-auto" />
                <p className="text-sm text-navy-600 font-medium mt-2">You&apos;re all caught up.</p>
                <p className="text-xs text-navy-500 mt-1">
                  Cutoff deadlines and shipment alerts land here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-navy-100">
                {items.map((item) => {
                  const Icon = SEVERITY_ICON[item.severity];
                  const body = (
                    <div className="flex gap-3 px-4 py-3 hover:bg-navy-50/60 transition-colors">
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${SEVERITY_CLASS[item.severity]}`} />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm truncate ${
                            item.read ? "text-navy-600" : "text-navy-900 font-semibold"
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-xs text-navy-500 mt-0.5 line-clamp-2">{item.message}</p>
                        <p className="text-[11px] text-navy-400 mt-1">
                          {relativeTime(item.createdAt)}
                        </p>
                      </div>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-ocean-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                  );

                  return (
                    <li key={item.id}>
                      {item.actionUrl ? (
                        <Link
                          href={item.actionUrl}
                          onClick={() => {
                            markRead(item.id);
                            setOpen(false);
                          }}
                          className="block"
                        >
                          {body}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => markRead(item.id)}
                          className="block w-full text-left"
                        >
                          {body}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-navy-200 px-4 py-2.5">
            <Link
              href="/platform/notifications"
              onClick={() => setOpen(false)}
              className="text-sm text-ocean-600 hover:text-ocean-700 font-medium"
            >
              See all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
