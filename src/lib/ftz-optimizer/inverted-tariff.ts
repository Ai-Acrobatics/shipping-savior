// ============================================================
// FTZ Optimizer — inverted tariff detection (AI-12021)
//
// An "inverted tariff" is a duty structure where the finished article carries
// a LOWER rate than the parts that go into it. Outside a zone that costs you
// money: you import parts at the high rate and sell an article that would have
// entered cheaply. Inside a zone with production authority you elect
// Non-Privileged Foreign status and pay the finished-article rate at
// withdrawal instead — which is where the headline 15–40% duty reductions in
// zone manufacturing come from.
//
// Two things block the benefit and both are modelled here:
//   1. No CBP production authority — nothing is "manufactured", so there is no
//      new classification to withdraw under.
//   2. Section 301 / 232 merchandise — must be admitted PF, so its value stays
//      on the component rate no matter what the rest of the BOM does.
// ============================================================

import type { DutyProfile, InvertedTariffFinding } from "./types";

export function detectInvertedTariff(
  duty: DutyProfile,
  manufacturingInZone: boolean
): InvertedTariffFinding {
  const spreadPct = duty.weightedComponentRatePct - duty.finishedGoodRatePct;
  const spreadExists = spreadPct > 0.0001;

  const contributors = duty.components
    .map((c) => {
      const componentSpread = c.effectiveRatePct - duty.finishedGoodRatePct;
      const capturable = !c.pfForced && manufacturingInZone && componentSpread > 0;
      return {
        id: c.id,
        description: c.description,
        htsCode: c.htsCode,
        componentRatePct: c.effectiveRatePct,
        spreadPct: componentSpread,
        annualValueUsd: c.annualValueUsd,
        annualSavingsUsd: capturable
          ? c.annualValueUsd * (componentSpread / 100)
          : 0,
        pfForced: c.pfForced,
      };
    })
    .sort((a, b) => b.annualSavingsUsd - a.annualSavingsUsd);

  const capturableValueUsd = duty.components
    .filter((c) => !c.pfForced && c.effectiveRatePct > duty.finishedGoodRatePct)
    .reduce((sum, c) => sum + c.annualValueUsd, 0);

  const annualSavingsUsd = manufacturingInZone
    ? contributors.reduce((sum, c) => sum + c.annualSavingsUsd, 0)
    : 0;

  let blocked = false;
  let blockedReason: string | null = null;

  if (spreadExists && !manufacturingInZone) {
    blocked = true;
    blockedReason =
      "The BOM is inverted, but inverted-tariff relief requires CBP production authority in the zone. Warehouse/distribution-only zones cannot change the classification at withdrawal.";
  } else if (spreadExists && capturableValueUsd <= 0) {
    blocked = true;
    blockedReason =
      "Every inverted line is Section 301 or Section 232 merchandise, which must be admitted in Privileged Foreign status. None of it can withdraw at the finished-good rate.";
  }

  return {
    spreadPct,
    isInverted: spreadExists && !blocked,
    blocked,
    blockedReason,
    capturableValueUsd,
    annualSavingsUsd,
    contributors,
  };
}
