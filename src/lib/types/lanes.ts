// ============================================================
// Lane Classification Types — AI-12014
//
// Pure types, no runtime dependencies. Lives apart from
// `@/lib/types` so both the classifier (`@/lib/data/jones-act`)
// and the calculator types can import it without a cycle.
// ============================================================

/**
 * A US domestic ocean trade. `coastwise` covers mainland-to-mainland
 * water moves (e.g. Gulf → East Coast) which are also Jones Act cargo.
 */
export type JonesActTrade =
  | "hawaii"
  | "alaska"
  | "puerto-rico"
  | "guam"
  | "usvi"
  | "other-territory"
  | "coastwise";

/** Why a lane is or is not subject to a CBP consumption entry. */
export type CustomsBasis =
  | "domestic-no-entry"      // both ends inside the US customs territory
  | "territory-entry"        // US flag/soil but outside the customs territory
  | "import-entry"           // ordinary international import
  | "export"                 // US origin, foreign destination
  | "foreign-to-foreign";    // neither end is US

export interface JonesActCarrier {
  /** Canonical display name, e.g. "Matson". */
  name: string;
  /** Short internal code used across schedule data, e.g. "MATS". */
  code: string;
  /** Alternate names / SCACs seen in carrier feeds and BOLs. */
  aliases: string[];
  /** Domestic trades this carrier actually serves. */
  trades: JonesActTrade[];
}

export interface LaneClassification {
  originPort: string;
  destPort: string;

  /** Both endpoints are US soil (states, DC, or a US territory). */
  isDomestic: boolean;
  /**
   * Cargo moving between two US coastwise points, so it must travel on a
   * US-built, US-flagged, US-crewed vessel (46 U.S.C. § 55102).
   */
  isJonesActLane: boolean;
  /** Same as {@link isJonesActLane} — the vessel restriction that follows from it. */
  requiresUsFlagVessel: boolean;

  /** Which domestic trade this is, when it is one. */
  trade: JonesActTrade | null;

  /** A CBP entry must be filed for this move. */
  customsEntryRequired: boolean;
  /** Duty, MPF and HMF are assessable on this move. */
  dutiable: boolean;
  /** Machine-readable reason behind the two flags above. */
  customsBasis: CustomsBasis;

  /** Matched Jones Act carrier, when the caller supplied one we recognise. */
  carrier: JonesActCarrier | null;
  /**
   * `true` / `false` when a carrier was supplied, `null` when it was not.
   * `false` on a Jones Act lane is a hard problem — see {@link warnings}.
   */
  carrierIsJonesActQualified: boolean | null;

  /** Short human label, e.g. "Jones Act - Domestic (Hawaii)". */
  label: string;
  /** Operator-facing notes: eligibility conflicts, entry obligations, etc. */
  warnings: string[];
}
