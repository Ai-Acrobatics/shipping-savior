// ============================================================
// FTZ Optimizer — duty rate resolution (AI-12021)
//
// Resolves an effective duty rate for every BOM line and for the finished
// article, then splits the admitted value into the slice that can chase the
// finished-good rate and the slice CBP pins to Privileged Foreign status.
//
// The PF-forced split is the part most spreadsheets get wrong. Merchandise
// subject to Section 301 or Section 232 must be admitted in PF status, which
// freezes its classification in the *component* condition. So a shipper with a
// genuinely inverted BOM still pays component rates on that slice — and an
// optimizer that ignores it overstates savings by exactly the §301 share.
// ============================================================

import { getEffectiveDutyRate } from "@/lib/data/hts-tariffs";
import type { CountryCode } from "@/lib/types";
import type {
  DutyProfile,
  FtzComponentInput,
  FtzFinishedGoodInput,
  RatedComponent,
} from "./types";

/**
 * HTS chapters covered by the Section 232 steel and aluminium actions.
 * 72/73 = iron & steel and articles thereof, 76 = aluminium and articles.
 * Chapter-level is deliberately coarse: it over-flags rather than under-flags,
 * and over-flagging only ever makes the savings estimate more conservative.
 */
const SECTION_232_CHAPTERS = new Set(["72", "73", "76"]);

function chapterOf(htsCode: string): string {
  return htsCode.replace(/\D/g, "").slice(0, 2);
}

/** Grow a rate by a compounding relative trajectory. Rates never go negative. */
export function projectRate(
  ratePct: number,
  trajectoryPctPerYear: number,
  years: number
): number {
  const projected = ratePct * Math.pow(1 + trajectoryPctPerYear / 100, years);
  return Math.max(0, projected);
}

/** Resolve one BOM line into a rated component. */
export function rateComponent(
  component: FtzComponentInput,
  index: number
): RatedComponent {
  const lookup = getEffectiveDutyRate(component.htsCode, component.countryOfOrigin);
  const rateOverridden =
    component.dutyRatePctOverride !== undefined && component.dutyRatePctOverride !== null;
  const effectiveRatePct = rateOverridden
    ? Number(component.dutyRatePctOverride)
    : lookup.effective;

  const section301Pct = lookup.section301;
  const chapter = chapterOf(component.htsCode);
  const section232 = SECTION_232_CHAPTERS.has(chapter);

  let pfForcedReason = "";
  if (section301Pct > 0) {
    pfForcedReason = `Section 301 merchandise (+${section301Pct}%) must be admitted in Privileged Foreign status.`;
  } else if (section232) {
    pfForcedReason = `Chapter ${chapter} falls under the Section 232 steel/aluminium action, which requires Privileged Foreign admission.`;
  }

  return {
    id: component.id ?? `component-${index + 1}`,
    description: component.description,
    htsCode: component.htsCode,
    countryOfOrigin: component.countryOfOrigin,
    annualValueUsd: component.annualValueUsd,
    baseRatePct: lookup.baseRate,
    section301Pct,
    effectiveRatePct,
    rateOverridden,
    pfForced: pfForcedReason !== "",
    pfForcedReason,
    notes: lookup.notes,
  };
}

/** Resolve the finished-article rate. Defaults to the US rate column. */
export function rateFinishedGood(finishedGood: FtzFinishedGoodInput): {
  ratePct: number;
  overridden: boolean;
} {
  const overridden =
    finishedGood.dutyRatePctOverride !== undefined &&
    finishedGood.dutyRatePctOverride !== null;
  if (overridden) {
    return { ratePct: Number(finishedGood.dutyRatePctOverride), overridden: true };
  }
  const origin: CountryCode = finishedGood.countryOfOrigin ?? "US";
  return {
    ratePct: getEffectiveDutyRate(finishedGood.htsCode, origin).effective,
    overridden: false,
  };
}

function weightedRate(components: RatedComponent[]): number {
  const value = components.reduce((sum, c) => sum + c.annualValueUsd, 0);
  if (value <= 0) return 0;
  const duty = components.reduce(
    (sum, c) => sum + c.annualValueUsd * (c.effectiveRatePct / 100),
    0
  );
  return (duty / value) * 100;
}

/** Build the full duty profile for a BOM plus its finished article. */
export function buildDutyProfile(
  components: FtzComponentInput[],
  finishedGood: FtzFinishedGoodInput
): DutyProfile {
  const rated = components.map(rateComponent);
  const finished = rateFinishedGood(finishedGood);

  const pfForced = rated.filter((c) => c.pfForced);
  const eligible = rated.filter((c) => !c.pfForced);

  return {
    components: rated,
    finishedGoodRatePct: finished.ratePct,
    finishedRateOverridden: finished.overridden,
    totalAnnualValueUsd: rated.reduce((sum, c) => sum + c.annualValueUsd, 0),
    weightedComponentRatePct: weightedRate(rated),
    npfEligibleValueUsd: eligible.reduce((sum, c) => sum + c.annualValueUsd, 0),
    pfForcedValueUsd: pfForced.reduce((sum, c) => sum + c.annualValueUsd, 0),
    pfForcedWeightedRatePct: weightedRate(pfForced),
    npfEligibleWeightedRatePct: weightedRate(eligible),
  };
}
