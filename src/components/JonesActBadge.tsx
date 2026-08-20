"use client";

import { Anchor, Globe2, ShieldCheck, AlertTriangle } from "lucide-react";
import type { LaneClassification } from "@/lib/types/lanes";

interface JonesActBadgeProps {
  lane: LaneClassification;
  /** Also render the customs-treatment note and any eligibility warnings. */
  showDetail?: boolean;
  className?: string;
}

/**
 * The "signify" element Blake asked for on the 2026-04-07 call — makes it
 * impossible to read a Jones Act domestic rate as if it were international
 * freight, or vice versa.
 */
export default function JonesActBadge({
  lane,
  showDetail = false,
  className = "",
}: JonesActBadgeProps) {
  const hasConflict = lane.carrierIsJonesActQualified === false && lane.isJonesActLane;

  const tone = hasConflict
    ? "bg-red-50 border-red-200 text-red-700"
    : lane.isJonesActLane
      ? "bg-ocean-50 border-ocean-200 text-ocean-700"
      : lane.isDomestic
        ? "bg-amber-50 border-amber-200 text-amber-700"
        : "bg-navy-50 border-navy-200 text-navy-600";

  const Icon = hasConflict
    ? AlertTriangle
    : lane.isJonesActLane
      ? Anchor
      : lane.isDomestic
        ? ShieldCheck
        : Globe2;

  return (
    <div className={className}>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tone}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {lane.label}
      </span>

      {showDetail && (
        <div className="mt-2 space-y-1.5">
          <p className="text-xs text-navy-500">
            {lane.customsEntryRequired
              ? "CBP entry required — duty, MPF, HMF and broker fees apply."
              : "No CBP entry — duty, MPF, HMF and broker fees do not apply to this move."}
          </p>
          {lane.requiresUsFlagVessel && (
            <p className="text-xs text-navy-500">
              Must move on a US-built, US-flagged, US-crewed vessel (46 U.S.C. § 55102).
            </p>
          )}
          {lane.warnings.map((warning) => (
            <p key={warning} className="text-xs text-navy-400">
              {warning}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
