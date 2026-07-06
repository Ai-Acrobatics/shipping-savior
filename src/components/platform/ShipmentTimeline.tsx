"use client";

import {
  CheckCircle2,
  Circle,
  Ship,
  AlertTriangle,
  PackageCheck,
  Anchor,
} from "lucide-react";
import {
  deriveShipmentTimeline,
  type ShipmentLike,
  type StepKey,
} from "@/lib/shipments/timeline";

/**
 * Visual vertical journey timeline for a single shipment (AI-8055).
 *
 * Renders the milestones derived by `deriveShipmentTimeline` with a progress
 * bar, completion icons, dates, and a delayed flag. One of the named
 * investor-demo core features (timeline visualization).
 */

const STEP_ICON: Record<StepKey, typeof Ship> = {
  booked: Circle,
  departed: Anchor,
  in_transit: Ship,
  arrived: PackageCheck,
  delivered: CheckCircle2,
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ShipmentTimeline({
  shipment,
}: {
  shipment: ShipmentLike;
}) {
  const timeline = deriveShipmentTimeline(shipment);

  return (
    <div className="card rounded-2xl p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-navy-500">
          Shipment Journey
        </h2>
        <div className="flex items-center gap-2">
          {timeline.delayed && (
            <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
              <AlertTriangle className="h-3 w-3" />
              Delayed
            </span>
          )}
          <span className="text-xs font-semibold text-navy-600">
            {timeline.progressPercent}% complete
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-navy-100">
        <div
          className={`h-full rounded-full transition-all ${
            timeline.delayed ? "bg-red-500" : "bg-ocean-500"
          }`}
          style={{ width: `${timeline.progressPercent}%` }}
          role="progressbar"
          aria-valuenow={timeline.progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Shipment progress"
        />
      </div>

      {/* Milestones */}
      <ol className="relative">
        {timeline.steps.map((step, index) => {
          const Icon = STEP_ICON[step.key];
          const isLast = index === timeline.steps.length - 1;
          const complete = step.state === "complete";
          const current = step.state === "current";

          const ringClasses = complete
            ? "border-ocean-500 bg-ocean-500 text-white"
            : current
            ? step.delayed
              ? "border-red-500 bg-red-50 text-red-600"
              : "border-ocean-500 bg-white text-ocean-600"
            : "border-navy-200 bg-white text-navy-300";

          const lineClasses = complete ? "bg-ocean-500" : "bg-navy-200";

          return (
            <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
              {/* connector line */}
              {!isLast && (
                <span
                  className={`absolute left-[15px] top-8 h-[calc(100%-1rem)] w-0.5 ${lineClasses}`}
                  aria-hidden="true"
                />
              )}

              {/* node */}
              <span
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${ringClasses}`}
              >
                <Icon className="h-4 w-4" />
              </span>

              {/* content */}
              <div className="flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <p
                    className={`text-sm font-semibold ${
                      step.state === "upcoming"
                        ? "text-navy-400"
                        : "text-navy-800"
                    }`}
                  >
                    {step.label}
                  </p>
                  {current && (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        step.delayed
                          ? "bg-red-100 text-red-700"
                          : "bg-ocean-100 text-ocean-700"
                      }`}
                    >
                      {step.delayed ? "Delayed" : "Current"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-navy-500">{step.description}</p>
                {step.date && (
                  <p className="mt-0.5 text-xs font-medium text-navy-400">
                    {formatDate(step.date)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
