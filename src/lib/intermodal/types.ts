// ============================================================
// Multi-modal route markers (AI-12015) — types
//
// The existing route model (lib/data/routes.ts) is port-to-port: one carrier,
// one mode, an optional transshipment code. That is enough to answer "which
// vessel service moves this box across the Pacific" and nothing else.
//
// It cannot express the routing Blake actually quotes. "CMA CGM to Salt Lake
// City" is not an ocean route — it is an ocean leg to Los Angeles, a Union
// Pacific rail leg to the Salt Lake City ramp, and a drayage leg to the door.
// Three carriers, three modes, three cost lines, and two interchange points
// where the box sits still and someone starts charging storage.
//
// So a route here is a SEQUENCE of legs between typed nodes. Everything a
// quote needs — total transit, total cost, where the free time runs out — is
// derived from that sequence rather than stored as a single flattened number,
// because the flattened number is what hides the 3-day ramp dwell that made
// the delivery late.
// ============================================================

/** Modes a leg can move under. Distinct from `ShippingMode` in lib/types,
 *  which describes a whole shipment's headline service level. */
export type TransportMode =
  | "ocean-fcl"
  | "ocean-lcl"
  | "air"
  | "rail"
  | "drayage"
  | "barge";

/** What kind of place a leg starts or ends at. */
export type NodeKind = "seaport" | "rail_ramp" | "airport" | "inland_point";

export interface RouteNode {
  /** UN/LOCODE where one exists, otherwise a stable internal code. */
  code: string;
  name: string;
  city: string;
  /** ISO-3166-1 alpha-2. */
  country: string;
  region?: string;
  kind: NodeKind;
  lat: number;
  lng: number;
  /**
   * Days a container typically sits here between legs before the next one
   * lifts. This is the number that turns an on-paper 24-day routing into a
   * 30-day one, so it is modelled per node rather than buried in a leg.
   */
  interchangeDwellDays: number;
  /** Free time at this node before storage/demurrage starts accruing. */
  freeDays: number;
  /** Storage or demurrage per container per day once free time is used. */
  storagePerDayUsd: number;
  /** Rail carriers or ocean carriers that serve this node, for filtering. */
  servedBy?: string[];
}

export interface RouteLeg {
  id: string;
  mode: TransportMode;
  /** Node codes. Must chain: leg[n].toCode === leg[n+1].fromCode. */
  fromCode: string;
  toCode: string;
  carrier: string;
  /** Named service, rail lane or trucking product. */
  service?: string;
  transitDays: { min: number; max: number };
  /** Per 40ft container. TEU-priced tariffs are converted at source. */
  costUsd: number;
  frequency: "daily" | "weekly" | "bi-weekly" | "on-demand";
  /** On-time percentage for this leg alone. */
  reliability: number;
  /** kg CO2e per 40ft container for this leg. */
  co2Kg?: number;
  notes?: string;
}

export interface IntermodalRoute {
  id: string;
  /** Ocean/air carrier that sells the through-routing, when one does. */
  sellingCarrier: string;
  /**
   * True when the selling carrier issues a single through bill of lading. On
   * a through bill the carrier owns the inland leg and the delay; on a
   * merchant haulage routing the shipper does. That is a liability
   * distinction, not a label.
   */
  throughBillOfLading: boolean;
  legs: RouteLeg[];
  /** Free-text lane label for lists, e.g. "Shanghai → Salt Lake City". */
  label: string;
  notes?: string;
}

// ─── Derived ──────────────────────────────────────────────

export interface LegCostLine {
  legId: string;
  mode: TransportMode;
  carrier: string;
  costUsd: number;
}

export interface RouteTotals {
  /** Moving time only — the sum of leg transits. */
  transitDays: { min: number; max: number };
  /** Days sitting at interchange nodes between legs. */
  dwellDays: number;
  /** transitDays + dwellDays. The number that answers "when does it arrive". */
  doorToDoorDays: { min: number; max: number };
  freightCostUsd: number;
  /** Storage accrued if the container overstays free time at each interchange. */
  worstCaseStorageUsd: number;
  totalCostUsd: number;
  costByMode: Record<string, number>;
  costLines: LegCostLine[];
  /** Product of per-leg reliabilities — a chain is only as good as all of it. */
  reliability: number;
  co2Kg: number | null;
  modes: TransportMode[];
  /** e.g. "Ocean → Rail → Drayage". */
  modeSequence: string;
  legCount: number;
}

export interface RouteValidationIssue {
  code: string;
  message: string;
  legId?: string;
}
