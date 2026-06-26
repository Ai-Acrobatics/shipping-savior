/**
 * Shipment journey timeline derivation (AI-8055).
 *
 * Pure, dependency-free logic that turns a shipment row into an ordered list of
 * journey milestones with completion state, dates, and an overall progress
 * percentage. Powers the per-shipment timeline visualization on
 * `/platform/shipments/[id]` — one of the core investor-demo features
 * (search/routing, tracking dashboard, **timeline visualization**, AI).
 *
 * Kept pure (no `db`, no React, optional injectable `now`) so it is fully
 * unit-testable and can run on both server and client.
 */

export type ShipmentStatus = "pending" | "in_transit" | "arrived" | "delayed";
export type StepState = "complete" | "current" | "upcoming";

export interface ShipmentLike {
  status?: ShipmentStatus | string | null;
  // Ocean BOL identifiers (preferred for port labels)
  pol?: string | null;
  pod?: string | null;
  // CSV-importable port columns (fallback)
  originPort?: string | null;
  destPort?: string | null;
  etd?: string | Date | null;
  eta?: string | Date | null;
  currentLocation?: string | null;
  carrier?: string | null;
  vesselName?: string | null;
  createdAt?: string | Date | null;
  progress?: number | null;
}

export type StepKey =
  | "booked"
  | "departed"
  | "in_transit"
  | "arrived"
  | "delivered";

export interface TimelineStep {
  key: StepKey;
  label: string;
  description: string;
  /** ISO date string for milestones that have a concrete date, else null. */
  date: string | null;
  state: StepState;
  /** True when this milestone is the one currently overdue. */
  delayed: boolean;
}

export interface ShipmentTimeline {
  steps: TimelineStep[];
  /** 0-100. Prefers the persisted `progress` column when present. */
  progressPercent: number;
  /** True when the shipment is delayed (explicit status or ETA in the past). */
  delayed: boolean;
  currentStepKey: StepKey | null;
}

const STEP_COUNT = 5; // booked, departed, in_transit, arrived, delivered

function toIso(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/**
 * Map a shipment status to the index of the step that is currently "in
 * progress" (its `state` becomes "current"). Steps before it are "complete",
 * steps after it are "upcoming".
 */
function currentIndexForStatus(status: string): number {
  switch (status) {
    case "pending":
      return 1; // booked done, awaiting departure
    case "in_transit":
    case "delayed":
      return 2; // sailing
    case "arrived":
      return 4; // at destination port, awaiting final delivery
    default:
      return 1;
  }
}

/**
 * Derive the ordered journey timeline for a shipment.
 *
 * @param shipment the shipment row (or any shape carrying the relevant fields)
 * @param now      current time, injectable for deterministic tests
 */
export function deriveShipmentTimeline(
  shipment: ShipmentLike,
  now: Date = new Date()
): ShipmentTimeline {
  const status = (shipment.status || "pending").toString();
  const origin = shipment.pol || shipment.originPort || "Origin port";
  const dest = shipment.pod || shipment.destPort || "Destination port";

  const currentIndex = currentIndexForStatus(status);

  const etaIso = toIso(shipment.eta);
  const eta = etaIso ? new Date(etaIso) : null;
  const etaOverdue =
    !!eta && now.getTime() > eta.getTime() && status !== "arrived";
  const delayed = status === "delayed" || etaOverdue;

  const inTransitDescription = shipment.currentLocation
    ? `Currently near ${shipment.currentLocation}`
    : shipment.vesselName
    ? `Aboard ${shipment.vesselName}`
    : "Cargo in transit";

  const blueprint: Array<Omit<TimelineStep, "state" | "delayed">> = [
    {
      key: "booked",
      label: "Booked",
      description: "Shipment created and confirmed",
      date: toIso(shipment.createdAt),
    },
    {
      key: "departed",
      label: `Departed ${origin}`,
      description: shipment.carrier
        ? `Loaded with ${shipment.carrier}`
        : "Departed port of loading",
      date: toIso(shipment.etd),
    },
    {
      key: "in_transit",
      label: "In Transit",
      description: inTransitDescription,
      date: null,
    },
    {
      key: "arrived",
      label: `Arrived ${dest}`,
      description: "Arrived at port of discharge",
      date: etaIso,
    },
    {
      key: "delivered",
      label: "Delivered",
      description: "Cleared customs and delivered",
      date: null,
    },
  ];

  const steps: TimelineStep[] = blueprint.map((step, index) => {
    let state: StepState;
    if (index < currentIndex) state = "complete";
    else if (index === currentIndex) state = "current";
    else state = "upcoming";
    return {
      ...step,
      state,
      delayed: delayed && state === "current",
    };
  });

  // Progress: prefer the persisted column when it's a sane number, else derive
  // from how many milestones are complete.
  let progressPercent: number;
  if (
    typeof shipment.progress === "number" &&
    Number.isFinite(shipment.progress) &&
    shipment.progress >= 0 &&
    shipment.progress <= 100
  ) {
    progressPercent = Math.round(shipment.progress);
  } else {
    const completed = currentIndex; // steps before the current one
    progressPercent = Math.round((completed / STEP_COUNT) * 100);
  }

  const currentStep = steps.find((s) => s.state === "current");

  return {
    steps,
    progressPercent,
    delayed,
    currentStepKey: currentStep ? currentStep.key : null,
  };
}
