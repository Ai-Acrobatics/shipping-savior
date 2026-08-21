// ============================================================
// Partner Government Agency routing screen (AI-12017)
//
// Answers two questions the entry summary will ask later and the shipper
// would rather answer now:
//
//   1. Which agencies own this shipment?
//   2. Is there still time to file for them before the vessel sails?
//
// The second question is the whole reason this runs pre-departure. An ATF
// Form 6 takes months; an FDA Prior Notice takes hours. Finding out which one
// you are short of after lading is finding out too late.
// ============================================================

import { requirementsFor } from "@/lib/data/pga-requirements";
import type { PgaRequirementHit, PgaScreenResult, ScreeningLineItem } from "./types";

/** Calendar-day difference, floored, UTC-normalised so DST cannot shift it. */
export function daysBetween(fromIso: string, toIso: string): number | null {
  const from = Date.parse(fromIso);
  const to = Date.parse(toIso);
  if (Number.isNaN(from) || Number.isNaN(to)) return null;
  return Math.floor((to - from) / 86_400_000);
}

export function screenPga(
  lineItems: ScreeningLineItem[],
  options: { departureDate?: string; evaluationDate?: string } = {}
): PgaScreenResult {
  const requirements: PgaRequirementHit[] = [];

  lineItems.forEach((line, lineIndex) => {
    const onFile = new Set((line.pgaDocumentsOnFile ?? []).map((code) => code.toUpperCase()));

    for (const requirement of requirementsFor(line.htsCode, line.description)) {
      requirements.push({
        lineIndex,
        description: line.description,
        htsCode: line.htsCode,
        code: requirement.code,
        agency: requirement.agency,
        agencyName: requirement.agencyName,
        programme: requirement.programme,
        filing: requirement.filing,
        form: requirement.form,
        leadTimeDays: requirement.leadTimeDays,
        mandatory: requirement.mandatory,
        onFile: onFile.has(requirement.code),
        notes: requirement.notes,
      });
    }
  });

  const missing = requirements.filter((hit) => !hit.onFile);
  const missingMandatory = missing.filter((hit) => hit.mandatory);

  const daysUntilDeparture =
    options.departureDate && options.evaluationDate
      ? daysBetween(options.evaluationDate, options.departureDate)
      : null;

  return {
    requirements,
    agencies: Array.from(new Set(requirements.map((hit) => hit.agency))).sort(),
    missingMandatory: missingMandatory.length,
    maxLeadTimeDays: missing.reduce((max, hit) => Math.max(max, hit.leadTimeDays), 0),
    daysUntilDeparture,
  };
}

/**
 * Is this filing already out of runway?
 *
 * Null departure date means "unknown", which is treated as not-late rather
 * than late — inventing urgency the shipper cannot verify erodes trust in
 * every other finding on the page.
 */
export function isPastLeadTime(
  hit: PgaRequirementHit,
  daysUntilDeparture: number | null
): boolean {
  if (hit.onFile) return false;
  if (daysUntilDeparture === null) return false;
  return daysUntilDeparture < hit.leadTimeDays;
}
