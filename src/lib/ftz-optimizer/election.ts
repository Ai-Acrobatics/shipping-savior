// ============================================================
// FTZ Optimizer — PF vs NPF election (AI-12021)
//
// The election is made per admission and cannot be reversed, so it is the one
// decision in zone operations worth modelling properly.
//
//   Privileged Foreign (PF)
//     Elected before manufacturing. Classification and rate freeze in the
//     merchandise's *admitted* (component) condition, at the rate in effect on
//     the day of admission. A hedge: whatever tariffs do while the goods sit
//     in the zone, you already know the number.
//
//   Non-Privileged Foreign (NPF)
//     Duty is assessed at withdrawal, on the article's condition *as it leaves
//     the zone* — the finished-good classification, at the rate then in
//     effect. The only route to inverted-tariff relief, and the only election
//     exposed to rate movement during storage.
//
// The comparison below is therefore a straight fight between two forces:
// the inverted spread (pushes NPF) and the tariff trajectory over the storage
// window (pushes PF). Section 301/232 value sits out the fight entirely — it
// is PF-forced under either election, which is what produces a MIXED outcome.
// ============================================================

import { projectRate } from "./duty";
import type {
  DutyProfile,
  ElectionRecommendation,
  ElectionYear,
  FtzElection,
  InvertedTariffFinding,
} from "./types";

export interface ElectionContext {
  horizonYears: number;
  storageMonths: number;
  tariffTrajectoryPctPerYear: number;
  volumeGrowthPctPerYear: number;
  /** Share of admitted value withdrawn into US commerce (0–1). */
  domesticEntryShare: number;
  manufacturingInZone: boolean;
}

/** Build the year-by-year duty schedule under each option. */
export function buildElectionSchedule(
  duty: DutyProfile,
  ctx: ElectionContext
): ElectionYear[] {
  const storageYears = ctx.storageMonths / 12;
  const schedule: ElectionYear[] = [];

  for (let year = 1; year <= ctx.horizonYears; year++) {
    const growth = Math.pow(1 + ctx.volumeGrowthPctPerYear / 100, year - 1);
    // Admissions happen through year `year`; withdrawal lands storageYears later.
    const admissionAge = year - 1;
    const withdrawalAge = admissionAge + storageYears;

    let baselineDutyUsd = 0;
    let pfDutyUsd = 0;
    let npfDutyUsd = 0;

    for (const component of duty.components) {
      const value = component.annualValueUsd * growth;
      const rateAtAdmission = projectRate(
        component.effectiveRatePct,
        ctx.tariffTrajectoryPctPerYear,
        admissionAge
      );

      // No zone: duty falls due on arrival, on every unit, at that day's rate.
      baselineDutyUsd += value * (rateAtAdmission / 100);

      // PF: component rate, frozen at admission. Re-exports and scrap never
      // enter US commerce, so they are outside the dutiable base.
      pfDutyUsd += value * ctx.domesticEntryShare * (rateAtAdmission / 100);

      if (component.pfForced) {
        // Section 301/232 value is PF under either election.
        npfDutyUsd += value * ctx.domesticEntryShare * (rateAtAdmission / 100);
      } else if (ctx.manufacturingInZone) {
        // Withdrawn as the finished article, at the rate then in effect.
        const finishedRateAtWithdrawal = projectRate(
          duty.finishedGoodRatePct,
          ctx.tariffTrajectoryPctPerYear,
          withdrawalAge
        );
        npfDutyUsd += value * ctx.domesticEntryShare * (finishedRateAtWithdrawal / 100);
      } else {
        // No production authority: the merchandise leaves in the condition it
        // arrived, so NPF just exposes the component rate to rate movement.
        const componentRateAtWithdrawal = projectRate(
          component.effectiveRatePct,
          ctx.tariffTrajectoryPctPerYear,
          withdrawalAge
        );
        npfDutyUsd += value * ctx.domesticEntryShare * (componentRateAtWithdrawal / 100);
      }
    }

    schedule.push({ year, baselineDutyUsd, pfDutyUsd, npfDutyUsd });
  }

  return schedule;
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

export function recommendElection(
  duty: DutyProfile,
  inversion: InvertedTariffFinding,
  ctx: ElectionContext
): ElectionRecommendation {
  const schedule = buildElectionSchedule(duty, ctx);
  const pfTotal = sum(schedule.map((y) => y.pfDutyUsd));
  const npfTotal = sum(schedule.map((y) => y.npfDutyUsd));

  const npfWins = npfTotal < pfTotal - 0.01;
  const hasPfForcedValue = duty.pfForcedValueUsd > 0;

  let election: FtzElection;
  if (npfWins) {
    election = hasPfForcedValue ? "MIXED" : "NPF";
  } else {
    election = "PF";
  }

  const recommendedDutyUsd = npfWins ? npfTotal : pfTotal;
  const alternativeDutyUsd = npfWins ? pfTotal : npfTotal;
  const electionAdvantageUsd = Math.max(0, alternativeDutyUsd - recommendedDutyUsd);

  // Relative advantage drives confidence: a 0.4% edge is inside the noise of
  // any real BOM, and telling someone to make an irreversible election on it
  // would be malpractice.
  const denominator = Math.min(pfTotal, npfTotal);
  const relativeAdvantage =
    denominator > 0 ? (electionAdvantageUsd / denominator) * 100 : 0;

  const overriddenRates = duty.components.filter((c) => c.rateOverridden).length;
  const unresolvedRates = duty.components.filter(
    (c) => !c.rateOverridden && c.effectiveRatePct === 0
  ).length;

  let confidence: ElectionRecommendation["confidence"];
  if (relativeAdvantage < 3 || unresolvedRates > 0) {
    confidence = "low";
  } else if (relativeAdvantage < 15 || overriddenRates > 0) {
    confidence = "medium";
  } else {
    confidence = "high";
  }

  const rationale: string[] = [];

  if (npfWins && inversion.isInverted) {
    rationale.push(
      `Inverted duty structure: components average ${duty.weightedComponentRatePct.toFixed(2)}% against a ${duty.finishedGoodRatePct.toFixed(2)}% finished-good rate, a ${inversion.spreadPct.toFixed(2)}pt spread. NPF withdraws at the lower finished rate.`
    );
  } else if (!npfWins && ctx.tariffTrajectoryPctPerYear > 0) {
    rationale.push(
      `Rates are modelled to climb ${ctx.tariffTrajectoryPctPerYear}%/yr. PF freezes the rate at admission, so the ${ctx.storageMonths}-month storage window is hedged rather than exposed.`
    );
  } else if (!npfWins) {
    rationale.push(
      `No usable inversion: the finished-good rate (${duty.finishedGoodRatePct.toFixed(2)}%) is at or above the weighted component rate (${duty.weightedComponentRatePct.toFixed(2)}%). PF costs nothing extra and removes rate risk during storage.`
    );
  }

  if (election === "MIXED") {
    rationale.push(
      `${formatUsd(duty.pfForcedValueUsd)} of annual value is Section 301/232 merchandise and must be admitted PF regardless. Elect NPF only on the remaining ${formatUsd(duty.npfEligibleValueUsd)}.`
    );
  }

  if (inversion.blocked && inversion.blockedReason) {
    rationale.push(inversion.blockedReason);
  }

  if (ctx.tariffTrajectoryPctPerYear > 0 && npfWins) {
    rationale.push(
      `The inversion outweighs the rate-escalation risk: even with rates climbing ${ctx.tariffTrajectoryPctPerYear}%/yr over a ${ctx.storageMonths}-month window, NPF stays ${formatUsd(electionAdvantageUsd)} cheaper across ${ctx.horizonYears} years.`
    );
  }

  if (confidence === "low" && relativeAdvantage < 3) {
    rationale.push(
      `The two elections are within ${relativeAdvantage.toFixed(1)}% of each other. Treat this as a tie and decide on operational grounds — the election is irreversible per admission.`
    );
  }

  return {
    election,
    recommendedDutyUsd,
    alternativeDutyUsd,
    electionAdvantageUsd,
    confidence,
    rationale,
    schedule,
  };
}

function formatUsd(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}
