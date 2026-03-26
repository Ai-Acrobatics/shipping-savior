"use client";

import {
  Ship, FileText, DollarSign, CheckCircle2, AlertTriangle,
  Package, Users, Zap,
} from "lucide-react";
import type { ActivityEvent } from "@/lib/data/dashboard";

const eventConfig: Record<ActivityEvent["type"], { icon: typeof Ship; color: string }> = {
  shipment_created: { icon: Package, color: "text-ocean-400 bg-ocean-500/20" },
  status_change: { icon: Ship, color: "text-cargo-400 bg-cargo-500/20" },
  document_uploaded: { icon: FileText, color: "text-purple-400 bg-purple-500/20" },
  cost_alert: { icon: DollarSign, color: "text-red-400 bg-red-500/20" },
  customs_cleared: { icon: CheckCircle2, color: "text-green-400 bg-green-500/20" },
  delivery_confirmed: { icon: CheckCircle2, color: "text-green-400 bg-green-500/20" },
  rate_quote: { icon: Zap, color: "text-cargo-400 bg-cargo-500/20" },
  partner_update: { icon: Users, color: "text-blue-400 bg-blue-500/20" },
};

export default function ActivityFeed({
  events,
  limit,
  compact = false,
}: {
  events: ActivityEvent[];
  limit?: number;
  compact?: boolean;
}) {
  const displayed = limit ? events.slice(0, limit) : events;

  return (
    <div className="space-y-0">
      {displayed.map((event, idx) => {
        const config = eventConfig[event.type] || eventConfig.shipment_created;
        const Icon = config.icon;
        const isLast = idx === displayed.length - 1;

        return (
          <div key={event.id} className="flex gap-3 relative">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-[15px] top-[32px] bottom-0 w-px bg-white/5" />
            )}

            {/* Icon */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}
            >
              <Icon className="w-4 h-4" />
            </div>

            {/* Content */}
            <div className={`flex-1 ${compact ? "pb-3" : "pb-4"}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className={`font-medium text-white ${compact ? "text-xs" : "text-sm"}`}>
                    {event.title}
                  </div>
                  {!compact && (
                    <div className="text-xs text-navy-400 mt-0.5">
                      {event.description}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-navy-500 whitespace-nowrap flex-shrink-0">
                  {event.timestamp}
                </span>
              </div>
              {event.shipmentId && !compact && (
                <span className="inline-flex items-center gap-1 text-[10px] mt-1.5 px-2 py-0.5 rounded-full bg-white/5 text-navy-400">
                  <Ship className="w-2.5 h-2.5" />
                  {event.shipmentId}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
