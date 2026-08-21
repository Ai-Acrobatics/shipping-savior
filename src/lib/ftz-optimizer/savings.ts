// ============================================================
// FTZ Optimizer — non-duty zone savings (AI-12021)
//
// Duty is the headline, but three smaller lines decide marginal cases:
//
//   Weekly entry     An activated zone files ONE CBP entry per week covering
//                    every withdrawal in that week. MPF is charged per entry
//                    and capped at $614.35, so an importer filing 400 entries
//                    a year collapses to 52 and stops paying the cap 348 times.
//
//   Duty deferral    Duty is not owed until withdrawal. Money that would have
//                    sat with CBP earns the shipper's cost of capital instead.
//
//   Re-export/scrap  Merchandise that never enters US commerce never owes
//                    duty. Outside a zone the same relief needs a drawback
//                    claim: 99% recovery, but 1–2 years later and only if
//                    somebody actually files it.
//
// HMF is deliberately NOT counted as a saving — it is still assessed
// quarterly on zone withdrawals.
// ============================================================

import { MPF_MAX, MPF_MIN, MPF_RATE } from "@/lib/calculators/landed-cost";
import type { AncillarySavings } from "./types";

/** Weekly entry ceiling: 52 CBP entries per year, one per week. */
export const FTZ_WEEKLY_ENTRIES_PER_YEAR = 52;

/** MPF for a single entry, clamped to the statutory floor and cap. */
export function mpfForEntry(entryValueUsd: number): number {
  const advalorem = entryValueUsd * MPF_RATE;
  return Math.max(MPF_MIN, Math.min(MPF_MAX, advalorem));
}

/** Annual MPF across `entries` evenly-sized entries of `annualValueUsd` total. */
export function annualMpf(annualValueUsd: number, entries: number): number {
  const entryCount = Math.max(1, Math.round(entries));
  return mpfForEntry(annualValueUsd / entryCount) * entryCount;
}

export interface AncillaryContext {
  annualValueUsd: number;
  entriesPerYear: number;
  storageMonths: number;
  costOfCapitalPct: number;
  reExportSharePct: number;
  scrapSharePct: number;
  /** Annual duty owed under the recommended election, used for the float. */
  annualDutyUsd: number;
  /** Annual duty owed with no zone, used for the re-export/scrap exemption. */
  baselineAnnualDutyUsd: number;
}

export function computeAncillarySavings(ctx: AncillaryContext): AncillarySavings {
  const reExportShare = clampShare(ctx.reExportSharePct / 100);
  const scrapShare = clampShare(ctx.scrapSharePct / 100);
  const domesticEntryShare = Math.max(0, 1 - reExportShare - scrapShare);

  const mpfWithoutFtzUsd = annualMpf(ctx.annualValueUsd, ctx.entriesPerYear);
  const ftzEntries = Math.min(
    Math.max(1, Math.round(ctx.entriesPerYear)),
    FTZ_WEEKLY_ENTRIES_PER_YEAR
  );
  const mpfWithFtzUsd = annualMpf(ctx.annualValueUsd * domesticEntryShare, ftzEntries);

  // Float: the duty bill is outstanding for the storage window rather than
  // paid on arrival, so the shipper keeps that cash for storageMonths.
  const dutyDeferralValueUsd =
    ctx.annualDutyUsd * (ctx.costOfCapitalPct / 100) * (ctx.storageMonths / 12);

  return {
    mpfWithoutFtzUsd,
    mpfWithFtzUsd,
    mpfSavingsUsd: Math.max(0, mpfWithoutFtzUsd - mpfWithFtzUsd),
    dutyDeferralValueUsd,
    reExportSavingsUsd: ctx.baselineAnnualDutyUsd * reExportShare,
    scrapSavingsUsd: ctx.baselineAnnualDutyUsd * scrapShare,
    domesticEntryShare,
  };
}

function clampShare(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
