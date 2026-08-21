// ============================================================
// Section 301 screening (AI-12017)
//
// Two separate things wearing one name:
//
//   1. The duty. China-origin goods in a covered HTS chapter carry an
//      additional ad valorem rate on top of the MFN column. That is a cost,
//      not a hold — it only becomes a hold when it is not on the entry.
//   2. The evasion exposure. Goods that route through a third country to shed
//      the 301 rate without a substantial transformation are a false statement
//      of origin under 19 U.S.C. 1592, and the penalty is a multiple of the
//      duty loss, not a percentage of it.
//
// The rate table is shared with lib/data/hts-tariffs so the compliance agent
// and the landed-cost calculator can never quote different numbers.
// ============================================================

import { SECTION_301_RATES } from "@/lib/data/hts-tariffs";
import type {
  Section301LineAssessment,
  Section301ScreenResult,
  ScreeningLineItem,
  ScreeningParty,
} from "./types";
import { normalizeName } from "./name-match";

/**
 * Which tranche a chapter sits in. The rate alone does not identify the list
 * (List 1 and List 3 are both 25%), and shippers ask for the list because the
 * exclusion process and the litigation posture differ per tranche.
 */
const CHAPTER_LISTS: Record<string, string> = {
  "84": "List 1/3 — machinery and mechanical appliances",
  "85": "List 1/3 — electrical machinery",
  "87": "List 1 — vehicles and parts",
  "90": "List 1 — optical and measuring instruments",
  "73": "List 3 — articles of iron or steel",
  "94": "List 3 — furniture and lighting",
  "39": "List 4A — plastics",
  "42": "List 4A — leather goods and travel goods",
  "61": "List 4A — knitted apparel",
  "62": "List 4A — woven apparel",
  "64": "List 4A — footwear",
  "95": "List 4A — toys and sporting goods",
};

/**
 * Chapters where the third-country pivot is common enough that a declared
 * non-China origin deserves an origin-verification prompt. This is not an
 * accusation — it is the list CBP's own EAPA cases cluster in.
 */
const HIGH_DIVERSION_CHAPTERS = new Set(["73", "76", "84", "85", "94", "95", "39"]);

/** Countries that show up as the transit leg in reported EAPA determinations. */
const COMMON_TRANSSHIP_ORIGINS = new Set(["VN", "MY", "TH", "KH", "TW", "ID", "PH", "MX"]);

export function chapterOf(htsCode: string): string {
  return (htsCode ?? "").replace(/[^0-9]/g, "").slice(0, 2);
}

export function section301RateFor(htsCode: string, countryOfOrigin: string): number {
  if ((countryOfOrigin ?? "").trim().toUpperCase() !== "CN") return 0;
  return SECTION_301_RATES[chapterOf(htsCode)] ?? 0;
}

export function section301ListFor(htsCode: string, countryOfOrigin: string): string | null {
  if (section301RateFor(htsCode, countryOfOrigin) <= 0) return null;
  return CHAPTER_LISTS[chapterOf(htsCode)] ?? "Section 301 covered chapter";
}

/**
 * Does the declared origin look engineered around a 301 action?
 *
 * Signal is a Chinese-affiliated manufacturer (or a manufacturer whose name we
 * can tie to a China-based party on the same shipment) paired with a
 * non-China declared origin in a high-diversion chapter. Deliberately narrow:
 * the finding costs an origin affidavit to clear, so a scattergun version
 * would get switched off.
 */
export function detectTransshipmentRisk(
  line: ScreeningLineItem,
  parties: ScreeningParty[]
): { risk: boolean; reason?: string } {
  const origin = (line.countryOfOrigin ?? "").trim().toUpperCase();
  if (origin === "CN" || !COMMON_TRANSSHIP_ORIGINS.has(origin)) return { risk: false };
  if (!HIGH_DIVERSION_CHAPTERS.has(chapterOf(line.htsCode))) return { risk: false };
  if (section301RateFor(line.htsCode, "CN") <= 0) return { risk: false };

  const manufacturer = normalizeName(line.manufacturerName ?? "");

  const chineseParty = parties.find(
    (party) => (party.country ?? "").trim().toUpperCase() === "CN"
  );
  if (chineseParty) {
    return {
      risk: true,
      reason:
        `Declared origin ${origin} on a Section 301 chapter, but ${chineseParty.name} ` +
        `(${chineseParty.role}) is a China-based party on the same shipment.`,
    };
  }

  if (manufacturer && /\b(CHINA|CHINESE|SHENZHEN|GUANGZHOU|NINGBO|SHANGHAI|DONGGUAN|FOSHAN|YIWU|QINGDAO|SUZHOU|XIAMEN)\b/.test(manufacturer)) {
    return {
      risk: true,
      reason:
        `Declared origin ${origin}, but the manufacturer name references a Chinese ` +
        `location. Substantial transformation has to be documented, not assumed.`,
    };
  }

  return { risk: false };
}

export function screenSection301(
  lineItems: ScreeningLineItem[],
  parties: ScreeningParty[] = []
): Section301ScreenResult {
  const lines: Section301LineAssessment[] = lineItems.map((line, lineIndex) => {
    const additionalRatePct = section301RateFor(line.htsCode, line.countryOfOrigin);
    const exclusionClaimed = Boolean(line.section301ExclusionClaimed);
    // An exclusion zeroes the duty but not the classification: the line is
    // still in scope, and the exclusion has to be substantiated on the entry.
    const additionalDutyUsd = exclusionClaimed
      ? 0
      : (Math.max(0, line.valueUsd) * additionalRatePct) / 100;

    const transshipment = detectTransshipmentRisk(line, parties);

    return {
      lineIndex,
      description: line.description,
      htsCode: line.htsCode,
      countryOfOrigin: (line.countryOfOrigin ?? "").toUpperCase(),
      list: section301ListFor(line.htsCode, line.countryOfOrigin),
      additionalRatePct,
      additionalDutyUsd,
      exclusionClaimed,
      transshipmentRisk: transshipment.risk,
      transshipmentReason: transshipment.reason,
    };
  });

  return {
    lines,
    totalAdditionalDutyUsd: lines.reduce((sum, line) => sum + line.additionalDutyUsd, 0),
    linesInScope: lines.filter((line) => line.additionalRatePct > 0).length,
    transshipmentFlags: lines.filter((line) => line.transshipmentRisk).length,
  };
}
