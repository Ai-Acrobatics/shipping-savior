"use client";

import { useState } from "react";
import {
  Bell, Ship, Shield, DollarSign, Users, Settings,
  AlertTriangle, Info, CheckCircle2, Clock, Filter,
  ChevronRight, Trash2, Check, MailOpen,
} from "lucide-react";
import {
  notifications as notifData, activityFeed,
  type Notification, type NotificationType, type AlertSeverity,
} from "@/lib/data/dashboard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

const typeIcons: Record<NotificationType, typeof Ship> = {
  shipment: Ship,
  customs: Shield,
  cost: DollarSign,
  partner: Users,
  system: Settings,
};

const severityConfig: Record<AlertSeverity, { icon: typeof AlertTriangle; color: string; bgColor: string }> = {
  critical: { icon: AlertTriangle, color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/20" },
  warning: { icon: AlertTriangle, color: "text-cargo-400", bgColor: "bg-cargo-500/10 border-cargo-500/20" },
  info: { icon: Info, color: "text-ocean-400", bgColor: "bg-ocean-500/10 border-ocean-500/20" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(notifData);
  const [filter, setFilter] = useState<NotificationType | "all">("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filtered = notifications.filter((n) => {
    const matchesType = filter === "all" || n.type === filter;
    const matchesRead = !showUnreadOnly || !n.read;
    return matchesType && matchesRead;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications & Activity</h1>
          <p className="text-sm text-navy-400 mt-1">
            Alerts, updates, and activity feed across all shipments
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 text-xs bg-ocean-500/20 hover:bg-ocean-500/30 text-ocean-300 px-3 py-2 rounded-lg transition-colors"
            >
              <MailOpen className="w-3.5 h-3.5" />
              Mark All Read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1 glass rounded-xl p-1 overflow-x-auto">
          {[
            { key: "all", label: "All", count: notifications.length },
            { key: "shipment", label: "Shipment", count: notifications.filter((n) => n.type === "shipment").length },
            { key: "customs", label: "Customs", count: notifications.filter((n) => n.type === "customs").length },
            { key: "cost", label: "Cost", count: notifications.filter((n) => n.type === "cost").length },
            { key: "partner", label: "Partner", count: notifications.filter((n) => n.type === "partner").length },
            { key: "system", label: "System", count: notifications.filter((n) => n.type === "system").length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as NotificationType | "all")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                filter === tab.key
                  ? "bg-ocean-500/30 text-ocean-300"
                  : "text-navy-400 hover:text-navy-200"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1 py-0.5 rounded ${
                filter === tab.key ? "bg-ocean-500/30" : "bg-white/5"
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            showUnreadOnly
              ? "bg-ocean-500/30 text-ocean-300"
              : "glass text-navy-400 hover:text-navy-200"
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          Unread Only
        </button>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-3 space-y-3">
          {filtered.length === 0 && (
            <div className="glass rounded-xl p-12 text-center">
              <Bell className="w-10 h-10 text-navy-600 mx-auto mb-3" />
              <p className="text-sm text-navy-400">No notifications match your filters</p>
            </div>
          )}

          {filtered.map((notif) => {
            const TypeIcon = typeIcons[notif.type] || Bell;
            const sevConfig = severityConfig[notif.severity];
            const SevIcon = sevConfig.icon;

            return (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`glass rounded-xl p-4 cursor-pointer transition-all hover:bg-white/10 ${
                  !notif.read ? "border-l-2 border-l-ocean-500" : "opacity-70"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${sevConfig.bgColor} border`}>
                    <SevIcon className={`w-4 h-4 ${sevConfig.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{notif.title}</span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-ocean-400 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-navy-500 whitespace-nowrap flex-shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-navy-400 mb-2">{notif.message}</p>

                    <div className="flex items-center gap-3">
                      {/* Type Badge */}
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-navy-400">
                        <TypeIcon className="w-2.5 h-2.5" />
                        {notif.type}
                      </span>

                      {/* Shipment Link */}
                      {notif.shipmentId && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-ocean-400">
                          <Ship className="w-2.5 h-2.5" />
                          {notif.shipmentId}
                        </span>
                      )}

                      {/* Action Button */}
                      {notif.actionLabel && (
                        <button className="text-[10px] text-ocean-400 hover:text-ocean-300 flex items-center gap-0.5">
                          {notif.actionLabel}
                          <ChevronRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Activity Feed Sidebar */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-ocean-400" />
              <h3 className="text-sm font-semibold text-white">Activity Timeline</h3>
            </div>
            <ActivityFeed events={activityFeed} />
          </div>

          {/* Notification Stats */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Summary</h3>
            <div className="space-y-3">
              {[
                { label: "Critical Alerts", count: notifications.filter((n) => n.severity === "critical").length, color: "text-red-400" },
                { label: "Warnings", count: notifications.filter((n) => n.severity === "warning").length, color: "text-cargo-400" },
                { label: "Info", count: notifications.filter((n) => n.severity === "info").length, color: "text-ocean-400" },
                { label: "Unread", count: unreadCount, color: "text-white" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-xs text-navy-400">{stat.label}</span>
                  <span className={`text-sm font-medium ${stat.color}`}>{stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
