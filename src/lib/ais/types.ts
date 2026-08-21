// ── AIS types (AI-12012) ──────────────────────────────────────────────

/** A normalized AIS position report, provider-agnostic. */
export interface AisPosition {
  /** Maritime Mobile Service Identity — the AIS primary key. */
  mmsi?: string | null;
  /** IMO number when the provider reports it. */
  imo?: string | null;
  /** Vessel name as broadcast (upper-case, may be padded by the transponder). */
  name: string;
  lat: number;
  lng: number;
  /** Speed over ground, knots. */
  sogKnots?: number | null;
  /** Course over ground, degrees true. */
  cogDegrees?: number | null;
  /** True heading, degrees. Falls back to COG for map rotation. */
  headingDegrees?: number | null;
  /** ISO-8601 timestamp of the position report. */
  timestamp: string | null;
  /** Which provider produced this fix. */
  source: string;
}

export interface AisProvider {
  readonly id: string;
  /**
   * Fetch the most recent position for each requested vessel.
   * Implementations must resolve (never reject) — a provider outage degrades
   * the map to schedule-estimated positions, it does not fail the request.
   */
  fetchPositions(vessels: AisVesselQuery[]): Promise<AisPosition[]>;
}

/** What we know about a vessel from our own shipment data. */
export interface AisVesselQuery {
  name: string;
  imo?: string | null;
  mmsi?: string | null;
}
