// ============================================================
// FBX (Freightos Baltic Index) Lane Benchmarks
// AI-12020: Rate Negotiation Agent
//
// The FBX is the industry-standard container spot-rate index. It is
// published PER FEU (40ft equivalent) per trade lane. We use it as the
// market anchor a carrier quote is scored against.
//
// Two kinds of records live here:
//
//   source: "fbx"      — a real published FBX lane code. The numbers are a
//                        point-in-time snapshot (see `asOf`), refreshed by
//                        updating this file or, later, a live feed.
//   source: "derived"  — a lane FBX does not publish separately. Modeled off
//                        a parent FBX lane with an explicit, documented
//                        multiplier. Always carries `derivedFrom` so the UI
//                        can tell the shipper the number is modeled, not
//                        quoted.
//
// IMPORTANT: these are benchmarks, not quotes. Every consumer must surface
// the `asOf` date and the source so nobody negotiates against stale data
// believing it is live.
// ============================================================

/** Coarse geography buckets the FBX publishes against. */
export type TradeRegion =
  | "east-asia"
  | "southeast-asia"
  | "south-asia"
  | "uswc"
  | "usec"
  | "north-europe"
  | "mediterranean";

export type BenchmarkSource = "fbx" | "derived";

export interface FbxSpot {
  /** Latest published index value, USD per FEU. */
  current: number;
  /** Trailing 4-week average, USD per FEU. Used as the p50 anchor. */
  avg4Week: number;
  /** Trailing 52-week average, USD per FEU. */
  avg52Week: number;
  /** 52-week low, USD per FEU. */
  low52Week: number;
  /** 52-week high, USD per FEU. */
  high52Week: number;
}

export interface FbxLane {
  /** FBX lane code (e.g. "FBX01"), or a synthetic code for derived lanes. */
  code: string;
  label: string;
  originRegion: TradeRegion;
  destRegion: TradeRegion;
  source: BenchmarkSource;
  /** Present only when source === "derived". */
  derivedFrom?: string;
  /** Multiplier applied to the parent lane. Present only for derived lanes. */
  derivedMultiplier?: number;
  /** Why the multiplier is what it is — shown in the UI. */
  derivationNote?: string;
  /** ISO date the spot figures were captured. */
  asOf: string;
  spot: FbxSpot;
  transitDays: { min: number; max: number };
}

/** Date every "fbx" record in this file was captured. */
export const FBX_SNAPSHOT_DATE = "2026-08-01";

// ─── Published FBX lanes ──────────────────────────────────────────────────────

const PUBLISHED_LANES: FbxLane[] = [
  {
    code: "FBX01",
    label: "China/East Asia → North America West Coast",
    originRegion: "east-asia",
    destRegion: "uswc",
    source: "fbx",
    asOf: FBX_SNAPSHOT_DATE,
    spot: {
      current: 2650,
      avg4Week: 2780,
      avg52Week: 3420,
      low52Week: 1850,
      high52Week: 6100,
    },
    transitDays: { min: 14, max: 21 },
  },
  {
    code: "FBX02",
    label: "North America West Coast → China/East Asia",
    originRegion: "uswc",
    destRegion: "east-asia",
    source: "fbx",
    asOf: FBX_SNAPSHOT_DATE,
    spot: {
      current: 690,
      avg4Week: 705,
      avg52Week: 760,
      low52Week: 580,
      high52Week: 1050,
    },
    transitDays: { min: 16, max: 24 },
  },
  {
    code: "FBX03",
    label: "China/East Asia → North America East Coast",
    originRegion: "east-asia",
    destRegion: "usec",
    source: "fbx",
    asOf: FBX_SNAPSHOT_DATE,
    spot: {
      current: 4100,
      avg4Week: 4290,
      avg52Week: 4880,
      low52Week: 2950,
      high52Week: 8400,
    },
    transitDays: { min: 28, max: 35 },
  },
  {
    code: "FBX04",
    label: "North America East Coast → China/East Asia",
    originRegion: "usec",
    destRegion: "east-asia",
    source: "fbx",
    asOf: FBX_SNAPSHOT_DATE,
    spot: {
      current: 810,
      avg4Week: 835,
      avg52Week: 890,
      low52Week: 660,
      high52Week: 1180,
    },
    transitDays: { min: 30, max: 40 },
  },
  {
    code: "FBX11",
    label: "China/East Asia → North Europe",
    originRegion: "east-asia",
    destRegion: "north-europe",
    source: "fbx",
    asOf: FBX_SNAPSHOT_DATE,
    spot: {
      current: 3250,
      avg4Week: 3410,
      avg52Week: 3950,
      low52Week: 2200,
      high52Week: 7300,
    },
    transitDays: { min: 25, max: 35 },
  },
  {
    code: "FBX12",
    label: "North Europe → China/East Asia",
    originRegion: "north-europe",
    destRegion: "east-asia",
    source: "fbx",
    asOf: FBX_SNAPSHOT_DATE,
    spot: {
      current: 540,
      avg4Week: 555,
      avg52Week: 610,
      low52Week: 430,
      high52Week: 900,
    },
    transitDays: { min: 28, max: 38 },
  },
  {
    code: "FBX13",
    label: "China/East Asia → Mediterranean",
    originRegion: "east-asia",
    destRegion: "mediterranean",
    source: "fbx",
    asOf: FBX_SNAPSHOT_DATE,
    spot: {
      current: 3600,
      avg4Week: 3760,
      avg52Week: 4310,
      low52Week: 2400,
      high52Week: 7900,
    },
    transitDays: { min: 24, max: 33 },
  },
];

// ─── Derived lanes ────────────────────────────────────────────────────────────
//
// FBX does not publish a Southeast/South Asia origin index. These lanes are
// modeled off the nearest published lane with a multiplier that reflects the
// documented cost delta (longer feeder legs, thinner direct-service coverage,
// lower headhaul volume). Multipliers are aligned with the trade-lane
// multipliers already used by the freight-rate calculator so the two modules
// do not disagree with each other.

interface DerivedSpec {
  code: string;
  label: string;
  originRegion: TradeRegion;
  destRegion: TradeRegion;
  parent: string;
  multiplier: number;
  note: string;
  transitDays: { min: number; max: number };
}

const DERIVED_SPECS: DerivedSpec[] = [
  {
    code: "SS-SEA-USWC",
    label: "Southeast Asia → North America West Coast",
    originRegion: "southeast-asia",
    destRegion: "uswc",
    parent: "FBX01",
    multiplier: 1.12,
    note:
      "Modeled at a 12% premium over FBX01: most SE Asia volume transships " +
      "through a China/Singapore hub, adding a feeder leg and handling.",
    transitDays: { min: 17, max: 26 },
  },
  {
    code: "SS-SEA-USEC",
    label: "Southeast Asia → North America East Coast",
    originRegion: "southeast-asia",
    destRegion: "usec",
    parent: "FBX03",
    multiplier: 1.08,
    note:
      "Modeled at an 8% premium over FBX03. The all-water leg dominates the " +
      "cost, so the feeder premium is smaller than on the WC lane.",
    transitDays: { min: 30, max: 40 },
  },
  {
    code: "SS-SA-USWC",
    label: "South Asia (IN/PK/BD) → North America West Coast",
    originRegion: "south-asia",
    destRegion: "uswc",
    parent: "FBX01",
    multiplier: 1.35,
    note:
      "Modeled at a 35% premium over FBX01: thin direct WC service from the " +
      "subcontinent means most boxes route via Asian hubs.",
    transitDays: { min: 28, max: 40 },
  },
  {
    code: "SS-SA-USEC",
    label: "South Asia (IN/PK/BD) → North America East Coast",
    originRegion: "south-asia",
    destRegion: "usec",
    parent: "FBX03",
    multiplier: 0.92,
    note:
      "Modeled at an 8% discount to FBX03: the Suez routing from the " +
      "subcontinent to the US East Coast is shorter than from East Asia.",
    transitDays: { min: 24, max: 34 },
  },
  {
    code: "SS-SEA-NEUR",
    label: "Southeast Asia → North Europe",
    originRegion: "southeast-asia",
    destRegion: "north-europe",
    parent: "FBX11",
    multiplier: 1.06,
    note: "Modeled at a 6% premium over FBX11 for the feeder leg to a mainline hub.",
    transitDays: { min: 26, max: 36 },
  },
];

function buildDerivedLane(spec: DerivedSpec, parent: FbxLane): FbxLane {
  const m = spec.multiplier;
  const scale = (n: number) => Math.round(n * m);
  return {
    code: spec.code,
    label: spec.label,
    originRegion: spec.originRegion,
    destRegion: spec.destRegion,
    source: "derived",
    derivedFrom: parent.code,
    derivedMultiplier: m,
    derivationNote: spec.note,
    asOf: parent.asOf,
    spot: {
      current: scale(parent.spot.current),
      avg4Week: scale(parent.spot.avg4Week),
      avg52Week: scale(parent.spot.avg52Week),
      low52Week: scale(parent.spot.low52Week),
      high52Week: scale(parent.spot.high52Week),
    },
    transitDays: spec.transitDays,
  };
}

const DERIVED_LANES: FbxLane[] = DERIVED_SPECS.map((spec) => {
  const parent = PUBLISHED_LANES.find((l) => l.code === spec.parent);
  if (!parent) {
    throw new Error(
      `fbx-benchmarks: derived lane ${spec.code} references unknown parent ${spec.parent}`
    );
  }
  return buildDerivedLane(spec, parent);
});

/** Every benchmark lane, published and derived. */
export const FBX_LANES: FbxLane[] = [...PUBLISHED_LANES, ...DERIVED_LANES];

export const FBX_LANES_BY_CODE: Record<string, FbxLane> = Object.fromEntries(
  FBX_LANES.map((lane) => [lane.code, lane])
);

// ─── Country / port → region mapping ──────────────────────────────────────────

/** ISO-3166 alpha-2 country code → trade region. */
export const COUNTRY_TO_REGION: Record<string, TradeRegion> = {
  CN: "east-asia",
  HK: "east-asia",
  TW: "east-asia",
  KR: "east-asia",
  JP: "east-asia",
  VN: "southeast-asia",
  TH: "southeast-asia",
  ID: "southeast-asia",
  MY: "southeast-asia",
  SG: "southeast-asia",
  PH: "southeast-asia",
  KH: "southeast-asia",
  IN: "south-asia",
  PK: "south-asia",
  BD: "south-asia",
  LK: "south-asia",
};

/**
 * UN/LOCODE prefixes for the US ports we care about, split by coast.
 * Anything not listed falls back to the country mapping.
 */
export const US_PORT_COAST: Record<string, "uswc" | "usec"> = {
  USLAX: "uswc",
  USLGB: "uswc",
  USOAK: "uswc",
  USSEA: "uswc",
  USTIW: "uswc",
  USPDX: "uswc",
  USNYC: "usec",
  USEWR: "usec",
  USSAV: "usec",
  USCHS: "usec",
  USORF: "usec",
  USBAL: "usec",
  USMIA: "usec",
  USHOU: "usec",
  USMSY: "usec",
  USJAX: "usec",
};

export const EUROPE_PORT_REGION: Record<string, TradeRegion> = {
  NLRTM: "north-europe",
  DEHAM: "north-europe",
  BEANR: "north-europe",
  GBFXT: "north-europe",
  GBLGP: "north-europe",
  FRLEH: "north-europe",
  ESVLC: "mediterranean",
  ESBCN: "mediterranean",
  ITGOA: "mediterranean",
  ITSPE: "mediterranean",
  GRPIR: "mediterranean",
  TRAMB: "mediterranean",
};

export const REGION_LABELS: Record<TradeRegion, string> = {
  "east-asia": "East Asia (CN/HK/TW/KR/JP)",
  "southeast-asia": "Southeast Asia (VN/TH/ID/MY/SG/PH/KH)",
  "south-asia": "South Asia (IN/PK/BD/LK)",
  uswc: "North America West Coast",
  usec: "North America East Coast",
  "north-europe": "North Europe",
  mediterranean: "Mediterranean",
};
