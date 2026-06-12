// ============================================================
// Cold-Chain Shelf-Life Calculator (AI-10777 / AI-6541)
//
// Quantifies the "faster transit = more selling days" story for
// refrigerated produce exports (e.g. Matson 14d vs Pasha 17d out
// of Port Hueneme → Latin America).
//
// Model assumptions (documented per-function below):
//   - Each commodity has an approximate post-harvest life at its
//     optimal storage temperature (industry rule-of-thumb values,
//     NOT lab data — directional, for planning/demo purposes).
//   - Senescence follows a Q10 = 2 temperature coefficient: the
//     rate of quality loss doubles for every +10°C above optimal.
//   - Time at optimal temp consumes shelf life 1:1 (1 day of
//     transit = 1 day of shelf life).
//   - Temperature excursions consume EXTRA shelf life on top of
//     the 1:1 baseline:
//       extraDaysConsumed = (deviationHours / 24) * (2^(tempDeviationC / 10) - 1)
//     e.g. 24h at +10°C above optimal consumes exactly 1 extra day.
// ============================================================

/** Commodity preset keys supported out of the box. */
export type CommodityKey =
  | "table_grapes"
  | "apples"
  | "pears"
  | "strawberries"
  | "blueberries"
  | "citrus"
  | "bananas"
  | "avocados";

export interface CommodityPreset {
  /** Human-readable name for UI display. */
  label: string;
  /** Approximate post-harvest life (days) when held at optimal temp. */
  baselineDays: number;
  /** Optimal storage temperature (°C). */
  optimalTempC: number;
}

/**
 * Approximate post-harvest life at optimal storage temperature.
 * Rule-of-thumb planning values (UC Davis Postharvest-style ranges),
 * not guarantees — actual life varies by cultivar, harvest maturity,
 * and pre-cooling quality.
 */
export const COMMODITY_PRESETS: Record<CommodityKey, CommodityPreset> = {
  table_grapes: { label: "Table Grapes", baselineDays: 56, optimalTempC: -0.5 },
  apples: { label: "Apples", baselineDays: 180, optimalTempC: 0 },
  pears: { label: "Pears", baselineDays: 120, optimalTempC: -1 },
  strawberries: { label: "Strawberries", baselineDays: 7, optimalTempC: 0 },
  blueberries: { label: "Blueberries", baselineDays: 14, optimalTempC: 0 },
  citrus: { label: "Citrus", baselineDays: 56, optimalTempC: 5 },
  bananas: { label: "Bananas", baselineDays: 28, optimalTempC: 13 },
  avocados: { label: "Avocados", baselineDays: 30, optimalTempC: 5 },
};

export interface CustomCommodity {
  /** Post-harvest life (days) at optimal temp. Must be > 0. */
  baselineDays: number;
  /** Optimal storage temperature (°C). Informational. */
  optimalTempC: number;
}

export interface ShelfLifeInput {
  /** Preset commodity key. Takes precedence over `custom` if both given. */
  commodity?: CommodityKey;
  /** Custom commodity definition; required when `commodity` is omitted. */
  custom?: CustomCommodity;
  /** Days of shelf life already consumed before loading (harvest → vessel). Must be >= 0. */
  daysAlreadyElapsed: number;
  /** Ocean transit days, port to port. Must be >= 0. */
  transitDays: number;
  /** Average °C ABOVE optimal during temperature excursions. Must be >= 0. */
  tempDeviationC: number;
  /** Total hours spent at the deviated temperature during transit. Must be >= 0. */
  deviationHours: number;
  /** Shelf-life days the buyer needs after discharge. Must be >= 0. */
  targetShelfDaysAtDestination: number;
}

/** Risk bands by % of baseline shelf life remaining at destination. */
export type RiskLevel = "low" | "moderate" | "high" | "critical";

export interface ShelfLifeResult {
  /** Baseline post-harvest life used (days). */
  baselineDays: number;
  /** Optimal storage temperature used (°C). */
  optimalTempC: number;
  /** Extra days consumed by temperature excursions (Q10 model). */
  extraDaysConsumed: number;
  /** Total shelf-life days consumed: elapsed + transit + excursion penalty. */
  totalDaysConsumed: number;
  /** Shelf-life days remaining at destination, floored at 0. */
  remainingShelfLifeDays: number;
  /** Remaining life as % of baseline, 0–100. */
  remainingPct: number;
  /** True when remaining days >= targetShelfDaysAtDestination. */
  meetsTarget: boolean;
  /** remainingShelfLifeDays - target; negative = shortfall. */
  bufferDays: number;
  /** low: >50% remaining; moderate: 25–50%; high: 10–25%; critical: <10%. */
  riskLevel: RiskLevel;
}

const Q10 = 2;

function assertNonNegative(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number, got ${value}`);
  }
  if (value < 0) {
    throw new Error(`${name} must be >= 0, got ${value}`);
  }
}

/** Resolve preset or custom commodity. Throws on missing/invalid definitions. */
function resolveCommodity(input: ShelfLifeInput): CommodityPreset {
  if (input.commodity) {
    const preset = COMMODITY_PRESETS[input.commodity];
    if (!preset) {
      throw new Error(
        `Unknown commodity "${input.commodity}". Valid keys: ${Object.keys(COMMODITY_PRESETS).join(", ")}`
      );
    }
    return preset;
  }
  if (input.custom) {
    if (!Number.isFinite(input.custom.baselineDays) || input.custom.baselineDays <= 0) {
      throw new Error(
        `custom.baselineDays must be > 0, got ${input.custom.baselineDays}`
      );
    }
    if (!Number.isFinite(input.custom.optimalTempC)) {
      throw new Error(`custom.optimalTempC must be a finite number`);
    }
    return {
      label: "Custom",
      baselineDays: input.custom.baselineDays,
      optimalTempC: input.custom.optimalTempC,
    };
  }
  throw new Error("Provide either a commodity preset key or a custom {baselineDays, optimalTempC}");
}

/** Map remaining % of baseline to a risk band. Boundary rule: a band's lower bound is inclusive. */
export function riskLevelForRemainingPct(remainingPct: number): RiskLevel {
  if (remainingPct > 50) return "low";
  if (remainingPct >= 25) return "moderate";
  if (remainingPct >= 10) return "high";
  return "critical";
}

/**
 * Calculate remaining shelf life at destination for a refrigerated shipment.
 *
 * Q10 = 2 senescence model: quality-loss rate doubles per +10°C above
 * optimal. Excursion penalty is the EXTRA consumption beyond the 1:1
 * baseline already counted in transitDays:
 *
 *   extraDaysConsumed = (deviationHours / 24) * (2^(tempDeviationC / 10) - 1)
 *
 * Guard policy: invalid inputs THROW with a clear message (no silent
 * clamping) — negative durations/deviations, non-positive custom
 * baseline, or missing commodity definition.
 */
export function calculateShelfLife(input: ShelfLifeInput): ShelfLifeResult {
  const { baselineDays, optimalTempC } = resolveCommodity(input);

  assertNonNegative(input.daysAlreadyElapsed, "daysAlreadyElapsed");
  assertNonNegative(input.transitDays, "transitDays");
  assertNonNegative(input.tempDeviationC, "tempDeviationC");
  assertNonNegative(input.deviationHours, "deviationHours");
  assertNonNegative(input.targetShelfDaysAtDestination, "targetShelfDaysAtDestination");

  const extraDaysConsumed =
    (input.deviationHours / 24) * (Math.pow(Q10, input.tempDeviationC / 10) - 1);

  const totalDaysConsumed =
    input.daysAlreadyElapsed + input.transitDays + extraDaysConsumed;

  const remainingShelfLifeDays = Math.max(0, baselineDays - totalDaysConsumed);
  const remainingPct = (remainingShelfLifeDays / baselineDays) * 100;
  const bufferDays = remainingShelfLifeDays - input.targetShelfDaysAtDestination;

  return {
    baselineDays,
    optimalTempC,
    extraDaysConsumed,
    totalDaysConsumed,
    remainingShelfLifeDays,
    remainingPct,
    meetsTarget: bufferDays >= 0,
    bufferDays,
    riskLevel: riskLevelForRemainingPct(remainingPct),
  };
}

export interface RouteComparisonResult {
  /** Result for the route with transitDaysA. */
  routeA: ShelfLifeResult;
  /** Result for the route with transitDaysB. */
  routeB: ShelfLifeResult;
  /** Which route is faster (fewer transit days); "tie" when equal. */
  faster: "A" | "B" | "tie";
  /**
   * % more shelf life the faster route delivers at destination vs the
   * slower one: (fasterRemaining - slowerRemaining) / slowerRemaining * 100.
   * `null` when the slower route arrives with zero remaining life
   * (lift would be undefined/infinite).
   */
  shelfLifeLiftPct: number | null;
}

/**
 * Compare two transit times on otherwise-identical shipments — the
 * "Matson 14d vs Pasha 17d" story. The lift is relative to the slower
 * route's remaining shelf life.
 *
 * Same guard policy as calculateShelfLife: invalid inputs throw.
 */
export function compareRoutes(
  baseInputs: Omit<ShelfLifeInput, "transitDays">,
  transitDaysA: number,
  transitDaysB: number
): RouteComparisonResult {
  const routeA = calculateShelfLife({ ...baseInputs, transitDays: transitDaysA });
  const routeB = calculateShelfLife({ ...baseInputs, transitDays: transitDaysB });

  let faster: "A" | "B" | "tie";
  if (transitDaysA < transitDaysB) faster = "A";
  else if (transitDaysB < transitDaysA) faster = "B";
  else faster = "tie";

  const fasterRemaining =
    faster === "B" ? routeB.remainingShelfLifeDays : routeA.remainingShelfLifeDays;
  const slowerRemaining =
    faster === "B" ? routeA.remainingShelfLifeDays : routeB.remainingShelfLifeDays;

  const shelfLifeLiftPct =
    slowerRemaining > 0
      ? ((fasterRemaining - slowerRemaining) / slowerRemaining) * 100
      : null;

  return { routeA, routeB, faster, shelfLifeLiftPct };
}
