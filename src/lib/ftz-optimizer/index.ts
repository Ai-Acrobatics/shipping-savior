// ============================================================
// FTZ Optimizer Agent — orchestrator (AI-12021)
//
// optimizeFtz() is the single entry point. Pure and synchronous: no DB, no
// network, no LLM. That keeps the whole recommendation testable and lets the
// API route stay a thin auth + validation wrapper.
//
// Pipeline:
//   duty profile → inverted-tariff detection → PF/NPF election
//               → ancillary savings → five-year NPV → verdict
// ============================================================

import { buildDutyProfile } from "./duty";
import { recommendElection, type ElectionContext } from "./election";
import { detectInvertedTariff } from "./inverted-tariff";
import { projectNpv } from "./npv";
import { computeAncillarySavings } from "./savings";
import type {
  FtzOptimization,
  FtzOptimizerInput,
  FtzVerdict,
} from "./types";

export * from "./types";
export { buildDutyProfile, rateComponent, rateFinishedGood, projectRate } from "./duty";
export { detectInvertedTariff } from "./inverted-tariff";
export { recommendElection, buildElectionSchedule } from "./election";
export {
  computeAncillarySavings,
  annualMpf,
  mpfForEntry,
  FTZ_WEEKLY_ENTRIES_PER_YEAR,
} from "./savings";
export { projectNpv, computeIrr } from "./npv";

export class FtzInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FtzInputError";
  }
}

export const DEFAULT_HORIZON_YEARS = 5;

/**
 * Guard policy: throw rather than clamp. A silently-clamped BOM value produces
 * a confident wrong NPV, and somebody will take that number to a board.
 */
function validate(input: FtzOptimizerInput): void {
  if (!input.components?.length) {
    throw new FtzInputError("At least one bill-of-materials component is required.");
  }
  if (input.components.length > 200) {
    throw new FtzInputError("Bill of materials is limited to 200 components.");
  }
  if (!input.finishedGood?.htsCode?.trim()) {
    throw new FtzInputError("A finished-good HTS code is required.");
  }

  for (const component of input.components) {
    const label = component.description?.trim() || component.htsCode || "(unnamed)";
    if (!component.htsCode?.trim()) {
      throw new FtzInputError(`Component "${label}" is missing an HTS code.`);
    }
    if (!Number.isFinite(component.annualValueUsd) || component.annualValueUsd < 0) {
      throw new FtzInputError(
        `Component "${label}" must have a non-negative annual value.`
      );
    }
    if (
      component.dutyRatePctOverride !== undefined &&
      component.dutyRatePctOverride !== null &&
      (!Number.isFinite(component.dutyRatePctOverride) ||
        component.dutyRatePctOverride < 0)
    ) {
      throw new FtzInputError(`Component "${label}" has an invalid duty rate override.`);
    }
  }

  const totalValue = input.components.reduce((sum, c) => sum + c.annualValueUsd, 0);
  if (totalValue <= 0) {
    throw new FtzInputError("Total annual admitted value must be greater than zero.");
  }

  if (!Number.isFinite(input.entriesPerYear) || input.entriesPerYear < 1) {
    throw new FtzInputError("Entries per year must be at least 1.");
  }
  if (!Number.isFinite(input.storageMonths) || input.storageMonths < 0) {
    throw new FtzInputError("Storage months must be zero or positive.");
  }
  if (!Number.isFinite(input.costOfCapitalPct) || input.costOfCapitalPct < 0) {
    throw new FtzInputError("Cost of capital must be zero or positive.");
  }
  if (!Number.isFinite(input.activationCostUsd) || input.activationCostUsd < 0) {
    throw new FtzInputError("Activation cost must be zero or positive.");
  }
  if (
    !Number.isFinite(input.annualOperatingCostUsd) ||
    input.annualOperatingCostUsd < 0
  ) {
    throw new FtzInputError("Annual operating cost must be zero or positive.");
  }

  const shareTotal = (input.reExportSharePct ?? 0) + (input.scrapSharePct ?? 0);
  if (shareTotal > 100) {
    throw new FtzInputError(
      "Re-export share plus scrap share cannot exceed 100% of admitted value."
    );
  }

  const horizon = input.horizonYears ?? DEFAULT_HORIZON_YEARS;
  if (!Number.isInteger(horizon) || horizon < 1 || horizon > 20) {
    throw new FtzInputError("Horizon must be a whole number of years between 1 and 20.");
  }
}

export function optimizeFtz(input: FtzOptimizerInput): FtzOptimization {
  validate(input);

  const horizonYears = input.horizonYears ?? DEFAULT_HORIZON_YEARS;
  const volumeGrowthPctPerYear = input.volumeGrowthPctPerYear ?? 0;

  const duty = buildDutyProfile(input.components, input.finishedGood);
  const inversion = detectInvertedTariff(duty, input.manufacturingInZone);

  const reExportShare = clampShare((input.reExportSharePct ?? 0) / 100);
  const scrapShare = clampShare((input.scrapSharePct ?? 0) / 100);
  const domesticEntryShare = Math.max(0, 1 - reExportShare - scrapShare);

  const electionCtx: ElectionContext = {
    horizonYears,
    storageMonths: input.storageMonths,
    tariffTrajectoryPctPerYear: input.tariffTrajectoryPctPerYear ?? 0,
    volumeGrowthPctPerYear,
    domesticEntryShare,
    manufacturingInZone: input.manufacturingInZone,
  };

  const election = recommendElection(duty, inversion, electionCtx);
  const recommendedIsNpf = election.election !== "PF";

  // Year-by-year duty saved versus running no zone at all. The re-export and
  // scrap exemptions are already inside this delta (the zone schedules apply
  // domesticEntryShare, the baseline does not) — they are reported separately
  // in `ancillary` purely as attribution, and must not be added again here.
  const yearlyDutySavingsUsd = election.schedule.map((y) => {
    const zoneDuty = recommendedIsNpf ? y.npfDutyUsd : y.pfDutyUsd;
    return y.baselineDutyUsd - zoneDuty;
  });

  const firstYear = election.schedule[0];
  const baselineAnnualDutyUsd = firstYear?.baselineDutyUsd ?? 0;
  const optimizedAnnualDutyUsd = firstYear
    ? recommendedIsNpf
      ? firstYear.npfDutyUsd
      : firstYear.pfDutyUsd
    : 0;

  const ancillary = computeAncillarySavings({
    annualValueUsd: duty.totalAnnualValueUsd,
    entriesPerYear: input.entriesPerYear,
    storageMonths: input.storageMonths,
    costOfCapitalPct: input.costOfCapitalPct,
    reExportSharePct: input.reExportSharePct ?? 0,
    scrapSharePct: input.scrapSharePct ?? 0,
    annualDutyUsd: optimizedAnnualDutyUsd,
    baselineAnnualDutyUsd,
  });

  // MPF and deferral scale with volume the same way duty does.
  const yearlyMpfSavingsUsd: number[] = [];
  const yearlyDeferralValueUsd: number[] = [];
  for (let year = 1; year <= horizonYears; year++) {
    const growth = Math.pow(1 + volumeGrowthPctPerYear / 100, year - 1);
    yearlyMpfSavingsUsd.push(ancillary.mpfSavingsUsd * growth);
    const zoneDuty = recommendedIsNpf
      ? election.schedule[year - 1].npfDutyUsd
      : election.schedule[year - 1].pfDutyUsd;
    yearlyDeferralValueUsd.push(
      zoneDuty * (input.costOfCapitalPct / 100) * (input.storageMonths / 12)
    );
  }

  const npv = projectNpv({
    yearlyDutySavingsUsd,
    yearlyMpfSavingsUsd,
    yearlyDeferralValueUsd,
    annualOperatingCostUsd: input.annualOperatingCostUsd,
    activationCostUsd: input.activationCostUsd,
    discountRatePct: input.costOfCapitalPct,
  });

  const dutySavingsPct =
    baselineAnnualDutyUsd > 0
      ? ((baselineAnnualDutyUsd - optimizedAnnualDutyUsd) / baselineAnnualDutyUsd) * 100
      : 0;

  const verdict = decideVerdict(npv.npvUsd, npv.paybackMonths, horizonYears);

  return {
    verdict,
    headline: buildHeadline(verdict, election.election, dutySavingsPct, npv.npvUsd),
    duty,
    inversion,
    election,
    ancillary,
    npv,
    baselineAnnualDutyUsd,
    optimizedAnnualDutyUsd,
    dutySavingsPct,
    drivers: buildDrivers({
      inversion,
      ancillary,
      npv,
      dutySavingsPct,
      election: election.election,
    }),
    warnings: buildWarnings(input, duty, inversion, npv, verdict),
    disclaimers: buildDisclaimers(),
  };
}

function clampShare(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function decideVerdict(
  npvUsd: number,
  paybackMonths: number | null,
  horizonYears: number
): FtzVerdict {
  if (npvUsd <= 0) return "SKIP";
  if (paybackMonths === null) return "MARGINAL";
  // Payback landing in the last fifth of the horizon means the case rests on
  // the final year holding up — too thin to call a clear yes.
  if (paybackMonths > horizonYears * 12 * 0.8) return "MARGINAL";
  return "PURSUE";
}

function buildHeadline(
  verdict: FtzVerdict,
  election: string,
  dutySavingsPct: number,
  npvUsd: number
): string {
  const savings = `${dutySavingsPct.toFixed(1)}% of year-one duty`;
  const npv = `${npvUsd >= 0 ? "+" : "−"}$${Math.abs(Math.round(npvUsd)).toLocaleString("en-US")} NPV`;

  switch (verdict) {
    case "PURSUE":
      return `Activate the zone and elect ${election}: ${savings} removed, ${npv}.`;
    case "MARGINAL":
      return `Zone economics are marginal — ${savings} removed but only ${npv}. Re-run with firm activation quotes before committing.`;
    default:
      return `Zone does not pay for itself at this volume: ${npv}. Revisit if volume, tariff exposure or entry count rises.`;
  }
}

function buildDrivers(args: {
  inversion: FtzOptimization["inversion"];
  ancillary: FtzOptimization["ancillary"];
  npv: FtzOptimization["npv"];
  dutySavingsPct: number;
  election: string;
}): string[] {
  const drivers: Array<{ text: string; weight: number }> = [];

  if (args.inversion.isInverted && args.inversion.annualSavingsUsd > 0) {
    drivers.push({
      text: `Inverted tariff relief: ${fmt(args.inversion.annualSavingsUsd)}/yr from withdrawing at the finished-good rate on ${fmt(args.inversion.capturableValueUsd)} of eligible components.`,
      weight: args.inversion.annualSavingsUsd,
    });
  }

  if (args.ancillary.reExportSavingsUsd > 0) {
    drivers.push({
      text: `Re-export exemption: ${fmt(args.ancillary.reExportSavingsUsd)}/yr of duty never accrues, with no drawback claim to file.`,
      weight: args.ancillary.reExportSavingsUsd,
    });
  }

  if (args.ancillary.scrapSavingsUsd > 0) {
    drivers.push({
      text: `Scrap and yield loss: ${fmt(args.ancillary.scrapSavingsUsd)}/yr of duty avoided on material consumed in-zone.`,
      weight: args.ancillary.scrapSavingsUsd,
    });
  }

  if (args.ancillary.mpfSavingsUsd > 0) {
    drivers.push({
      text: `Weekly entry: ${fmt(args.ancillary.mpfSavingsUsd)}/yr of merchandise processing fees collapse into 52 consolidated entries.`,
      weight: args.ancillary.mpfSavingsUsd,
    });
  }

  const firstYearDeferral = args.npv.years[0]?.deferralValueUsd ?? 0;
  if (firstYearDeferral > 0) {
    drivers.push({
      text: `Duty deferral float: ${fmt(firstYearDeferral)}/yr of working capital held back until withdrawal.`,
      weight: firstYearDeferral,
    });
  }

  return drivers.sort((a, b) => b.weight - a.weight).map((d) => d.text);
}

function buildWarnings(
  input: FtzOptimizerInput,
  duty: FtzOptimization["duty"],
  inversion: FtzOptimization["inversion"],
  npv: FtzOptimization["npv"],
  verdict: FtzVerdict
): string[] {
  const warnings: string[] = [];

  const unresolved = duty.components.filter(
    (c) => !c.rateOverridden && c.effectiveRatePct === 0
  );
  if (unresolved.length > 0) {
    warnings.push(
      `${unresolved.length} component${unresolved.length === 1 ? "" : "s"} resolved to a 0% duty rate (${unresolved
        .map((c) => c.htsCode)
        .join(", ")}). Confirm against the current HTS — an unmatched code silently reads as duty-free and understates the savings.`
    );
  }

  if (duty.pfForcedValueUsd > 0) {
    const share = (duty.pfForcedValueUsd / duty.totalAnnualValueUsd) * 100;
    warnings.push(
      `${share.toFixed(0)}% of admitted value is Section 301/232 merchandise that must be admitted in Privileged Foreign status. It cannot take the finished-good rate, and that constraint is already priced into the numbers above.`
    );
  }

  if (inversion.blocked && inversion.blockedReason) {
    warnings.push(inversion.blockedReason);
  }

  if (input.manufacturingInZone) {
    warnings.push(
      "Manufacturing or substantial transformation in a zone needs separate production authority from the FTZ Board. Approval typically runs several months and is not guaranteed."
    );
  }

  if (input.storageMonths > 0 && input.storageMonths < 1) {
    warnings.push(
      "Storage under one month leaves almost no deferral float — the case rests entirely on duty relief and MPF."
    );
  }

  if (verdict !== "SKIP" && npv.paybackMonths !== null && npv.paybackMonths > 24) {
    warnings.push(
      `Payback lands at ${npv.paybackMonths} months. Confirm the activation and operating quotes are firm before committing to a multi-year zone contract.`
    );
  }

  if (duty.finishedRateOverridden || duty.components.some((c) => c.rateOverridden)) {
    warnings.push(
      "One or more duty rates were entered manually rather than resolved from the HTS schedule. Have a licensed customs broker confirm the classification before filing."
    );
  }

  return warnings;
}

function buildDisclaimers(): string[] {
  return [
    "Estimate only — not a customs ruling and not legal advice. Classification and FTZ elections should be confirmed with a licensed customs broker or trade counsel.",
    "Duty rates come from a curated HTS extract plus published Section 301 actions. Rates change; re-run against the live HTS schedule before filing.",
    "Harbor Maintenance Fee is not avoided by a zone — it is assessed quarterly on withdrawals and is excluded from the savings above.",
    "The PF/NPF election is made per admission and cannot be changed once merchandise is manufactured or manipulated in the zone.",
  ];
}

function fmt(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}
