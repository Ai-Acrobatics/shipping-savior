// ============================================================
// Compliance Screening Agent — orchestrator (AI-12017)
//
// screenShipment() is the single entry point. Pure and synchronous apart from
// the one-time screening-list read, so the whole verdict is testable and the
// API route stays a thin auth + validation wrapper.
//
// No LLM anywhere in this path. A hallucinated "no match" on a denied-party
// screen is a strict-liability violation, and a hallucinated PGA requirement
// sends someone chasing a filing that does not exist. Both destroy the trust
// that makes the agent worth running at all.
//
// Pipeline:
//   denied party + jurisdiction → Section 301 → UFLPA → PGA routing
//                              → findings → exposure → score → verdict
// ============================================================

import { loadScreeningLists } from "@/lib/data/denied-parties";
import { isBlockingHit, screenParties } from "./denied-party";
import { isPastLeadTime, screenPga } from "./pga";
import { buildExposure, gradeFor, scoreFindings, verdictFor } from "./scoring";
import { screenSection301, section301RateFor } from "./section301";
import { screenUflpa } from "./uflpa";
import type {
  ComplianceFinding,
  ComplianceScreeningInput,
  ComplianceScreeningResult,
  FindingSubject,
} from "./types";

export * from "./types";
export {
  normalizeName,
  nameTokens,
  nameMatchScore,
  jaroWinkler,
  tokenSetSimilarity,
  strengthFor,
  MATCH_THRESHOLDS,
} from "./name-match";
export { screenName, screenParties, isBlockingHit } from "./denied-party";
export {
  screenSection301,
  section301RateFor,
  section301ListFor,
  detectTransshipmentRisk,
  chapterOf,
} from "./section301";
export {
  screenUflpa,
  sectorFor,
  findXuarIndicator,
  XUAR_INDICATORS,
  UFLPA_PRIORITY_SECTORS,
} from "./uflpa";
export { screenPga, isPastLeadTime, daysBetween } from "./pga";
export {
  scoreFindings,
  gradeFor,
  verdictFor,
  buildExposure,
  HOLD_COST_PER_INCIDENT_USD,
  ISF_LIQUIDATED_DAMAGES_USD,
  PENALTY_MULTIPLE_GROSS_NEGLIGENCE,
} from "./scoring";

export class ComplianceInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ComplianceInputError";
  }
}

export const MAX_PARTIES = 50;
export const MAX_LINE_ITEMS = 500;

/**
 * Guard policy: throw rather than clamp or skip.
 *
 * A screen that silently drops the one party it could not parse returns a
 * clean result for a shipment nobody screened. That failure is invisible and
 * it is exactly the failure this agent exists to prevent.
 */
function validate(input: ComplianceScreeningInput): void {
  if (!input.parties?.length) {
    throw new ComplianceInputError("At least one party is required to screen a shipment.");
  }
  if (input.parties.length > MAX_PARTIES) {
    throw new ComplianceInputError(`A shipment is limited to ${MAX_PARTIES} parties.`);
  }
  if (!input.lineItems?.length) {
    throw new ComplianceInputError("At least one line item is required.");
  }
  if (input.lineItems.length > MAX_LINE_ITEMS) {
    throw new ComplianceInputError(`A shipment is limited to ${MAX_LINE_ITEMS} line items.`);
  }

  for (const party of input.parties) {
    if (!party.name?.trim()) {
      throw new ComplianceInputError("Every party needs a name to screen against.");
    }
  }

  for (const line of input.lineItems) {
    const label = line.description?.trim() || line.htsCode || "(unnamed line)";
    if (!line.htsCode?.trim()) {
      throw new ComplianceInputError(`Line "${label}" is missing an HTS code.`);
    }
    if (!line.countryOfOrigin?.trim()) {
      throw new ComplianceInputError(`Line "${label}" is missing a country of origin.`);
    }
    if (!Number.isFinite(line.valueUsd) || line.valueUsd < 0) {
      throw new ComplianceInputError(`Line "${label}" must have a non-negative entered value.`);
    }
  }
}

const partySubject = (index: number, name: string): FindingSubject => ({
  type: "party",
  index,
  label: name,
});

const lineSubject = (index: number, label: string): FindingSubject => ({
  type: "line",
  index,
  label,
});

const usd = (value: number) => `$${Math.round(value).toLocaleString("en-US")}`;

export function screenShipment(
  input: ComplianceScreeningInput
): ComplianceScreeningResult {
  validate(input);

  const { entries, coverage } = loadScreeningLists();
  const evaluationDate = input.evaluationDate ?? new Date().toISOString();

  const deniedParty = screenParties(input.parties, entries);
  const section301 = screenSection301(input.lineItems, input.parties);
  const uflpa = screenUflpa(input.lineItems, input.parties);
  const pga = screenPga(input.lineItems, {
    departureDate: input.departureDate,
    evaluationDate,
  });

  const findings: ComplianceFinding[] = [];

  // ── 1. Denied parties ───────────────────────────────────
  deniedParty.hits.forEach((hit, i) => {
    const blocking = isBlockingHit(hit);
    findings.push({
      id: `dp-${i}`,
      screen: "denied-party",
      severity: blocking ? "block" : "warn",
      title: blocking
        ? `${hit.partyName} matches ${hit.entry.source} listing "${hit.entry.name}"`
        : `${hit.partyName} possibly matches ${hit.entry.source} listing "${hit.entry.name}"`,
      detail:
        `${hit.scorePct}% name match (${hit.strength}) against "${hit.matchedAgainst}" on ` +
        `${hit.entry.program}.${hit.entry.remarks ? ` ${hit.entry.remarks}` : ""}`,
      authority:
        hit.entry.source === "DHS-UFLPA-ENTITY-LIST"
          ? "UFLPA sec. 2(d)(2)(B); 19 U.S.C. 1307"
          : hit.entry.source.startsWith("BIS")
            ? "15 C.F.R. Part 744 (EAR)"
            : "31 C.F.R. Chapter V (OFAC); IEEPA",
      subject: partySubject(hit.partyIndex, hit.partyName),
      remediation: blocking
        ? "Stop the booking. Do not tender cargo to or from this party without an OFAC/BIS licence. " +
          "Confirm the hit against the primary listing, and if it is a genuine match, file the required blocking or rejection report."
        : "Clear the hit before booking: compare address, country and any identifiers against the primary listing record, and document the false-positive determination.",
      confidencePct: hit.scorePct,
      evidence: [
        hit.entry.citation ?? hit.entry.program,
        `Role on this shipment: ${hit.partyRole}`,
      ],
    });
  });

  deniedParty.jurisdictionHits.forEach((hit, i) => {
    const comprehensive = hit.embargoType !== "targeted";
    findings.push({
      id: `sj-${i}`,
      screen: "sanctioned-jurisdiction",
      severity: comprehensive ? "block" : "warn",
      title: `${hit.partyName} is in a sanctioned jurisdiction (${hit.countryName})`,
      detail:
        hit.embargoType === "region"
          ? `The address references ${hit.countryName}, which carries its own restrictions under ${hit.programme} regardless of the country on the paperwork.`
          : `${hit.countryName} is subject to ${hit.programme} (${hit.embargoType} programme).`,
      authority: hit.programme,
      subject: partySubject(hit.partyIndex, hit.partyName),
      remediation: comprehensive
        ? "Do not proceed without a specific OFAC licence or a documented general-licence authorisation covering this transaction."
        : "Screen the commodity against the sectoral prohibitions and confirm the counterparty is not a blocked entity or 50%-owned by one.",
    });
  });

  // ── 2. Section 301 ──────────────────────────────────────
  if (section301.totalAdditionalDutyUsd > 0) {
    const inScope = section301.lines.filter((line) => line.additionalRatePct > 0);
    findings.push({
      id: "s301-duty",
      screen: "section-301",
      severity: "advisory",
      title: `Section 301 adds ${usd(section301.totalAdditionalDutyUsd)} across ${inScope.length} line${inScope.length === 1 ? "" : "s"}`,
      detail: inScope
        .map(
          (line) =>
            `${line.htsCode} (${line.description}): +${line.additionalRatePct}% — ${line.list}`
        )
        .join("; "),
      authority: "Section 301, Trade Act of 1974; 19 U.S.C. 2411",
      subject: { type: "shipment", index: -1, label: "Shipment" },
      remediation:
        "Confirm the Chapter 99 subheading is on the entry and the duty is in the landed-cost model. " +
        "Check whether an active exclusion covers the classification before paying it.",
      exposureUsd: section301.totalAdditionalDutyUsd,
    });
  }

  section301.lines
    .filter((line) => line.exclusionClaimed && line.additionalRatePct > 0)
    .forEach((line) => {
      findings.push({
        id: `s301-excl-${line.lineIndex}`,
        screen: "section-301",
        severity: "warn",
        title: `Exclusion claimed on ${line.htsCode} — substantiate it before entry`,
        detail:
          `A Section 301 exclusion is claimed on "${line.description}", zeroing ` +
          `${line.additionalRatePct}% of additional duty. Exclusions are product-specific and time-limited.`,
        authority: "USTR exclusion notices; 19 C.F.R. 141",
        subject: lineSubject(line.lineIndex, line.description),
        remediation:
          "Record the exclusion's Chapter 99 subheading and its expiry, and keep the product-match analysis on file. " +
          "An unsupported exclusion is a duty loss plus a penalty, not just a duty loss.",
      });
    });

  // The 1592 duty loss on an origin-flagged line is the duty that *would*
  // apply if the goods were declared China — the declared-origin rate is zero
  // by construction, which is the whole point of the pivot.
  const transshipmentDutyUsd = section301.lines
    .filter((line) => line.transshipmentRisk)
    .reduce((sum, line) => {
      const chinaRate = section301RateFor(line.htsCode, "CN");
      const value = Math.max(0, input.lineItems[line.lineIndex]?.valueUsd ?? 0);
      return sum + (value * chinaRate) / 100;
    }, 0);

  section301.lines
    .filter((line) => line.transshipmentRisk)
    .forEach((line) => {
      findings.push({
        id: `s301-tt-${line.lineIndex}`,
        screen: "section-301",
        severity: "warn",
        title: `Origin needs substantiating on ${line.htsCode} (declared ${line.countryOfOrigin})`,
        detail: line.transshipmentReason ?? "Declared origin differs from the manufacturing footprint.",
        authority: "19 U.S.C. 1592; 19 C.F.R. 134 (country of origin marking)",
        subject: lineSubject(line.lineIndex, line.description),
        remediation:
          "Obtain a manufacturing affidavit and a bill of materials showing the substantial transformation in the declared country. " +
          "If the transformation is assembly only, the origin is China and the 301 rate applies.",
      });
    });

  // ── 3. UFLPA ────────────────────────────────────────────
  uflpa.lines
    .filter((line) => line.band !== "low")
    .forEach((line) => {
      const prohibited = line.band === "prohibited";
      findings.push({
        id: `uflpa-${line.lineIndex}`,
        screen: "uflpa",
        severity: prohibited ? "block" : line.band === "high" ? "warn" : "advisory",
        title: prohibited
          ? `UFLPA rebuttable presumption applies to ${line.description}`
          : `UFLPA ${line.band} risk on ${line.description}`,
        detail: line.reasons.join(" "),
        authority: "Uyghur Forced Labor Prevention Act; 19 U.S.C. 1307",
        subject: lineSubject(line.lineIndex, line.description),
        remediation: prohibited
          ? "Do not ship this line. Entry is presumed prohibited. Rebutting it requires an applicability review or an exception request " +
            "supported by clear and convincing evidence of the full supply chain — that is a documentation project, not a port-side fix."
          : "Assemble the traceability package now: purchase orders, production records and transportation documents tracing every input " +
            "back to its origin. CBP asks for the whole chain, not the last leg.",
        exposureUsd: line.valueAtRiskUsd || undefined,
        evidence: line.entityListMatch ? [`UFLPA Entity List: ${line.entityListMatch}`] : undefined,
      });
    });

  // ── 4. PGA routing ──────────────────────────────────────
  const missingPga = pga.requirements.filter((hit) => !hit.onFile);
  missingPga
    .filter((hit) => hit.mandatory)
    .forEach((hit, i) => {
      const late = isPastLeadTime(hit, pga.daysUntilDeparture);
      findings.push({
        id: `pga-${hit.code}-${hit.lineIndex}-${i}`,
        screen: "pga",
        severity: late ? "block" : "warn",
        title: late
          ? `${hit.agency} ${hit.filing} is past its filing window`
          : `${hit.agency} ${hit.filing} required for ${hit.htsCode}`,
        detail:
          `${hit.agencyName} — ${hit.programme}. Needs ${hit.leadTimeDays} day${hit.leadTimeDays === 1 ? "" : "s"} ` +
          `before arrival${hit.form ? `; form ${hit.form}` : ""}.` +
          (pga.daysUntilDeparture !== null
            ? ` Departure is ${pga.daysUntilDeparture} day${pga.daysUntilDeparture === 1 ? "" : "s"} out.`
            : "") +
          (hit.notes ? ` ${hit.notes}` : ""),
        authority: `${hit.agencyName} — ${hit.programme}`,
        subject: lineSubject(hit.lineIndex, hit.description),
        remediation: late
          ? `Roll the booking or split this line out. ${hit.filing} cannot be filed retroactively inside the window, ` +
            "and arriving without it means a hold at the shipper's cost."
          : `File ${hit.filing} now — start it at least ${hit.leadTimeDays} days before arrival.`,
      });
    });

  const advisoryPga = missingPga.filter((hit) => !hit.mandatory);
  if (advisoryPga.length > 0) {
    findings.push({
      id: "pga-advisory",
      screen: "pga",
      severity: "advisory",
      title: `${advisoryPga.length} conditional agency requirement${advisoryPga.length === 1 ? "" : "s"} to check`,
      detail: advisoryPga
        .map((hit) => `${hit.agency}: ${hit.filing} (${hit.htsCode})`)
        .join("; "),
      authority: "Various — see each requirement",
      subject: { type: "shipment", index: -1, label: "Shipment" },
      remediation:
        "Confirm whether each applies to this specific commodity. AD/CVD scope in particular reaches goods that read as out of scope.",
    });
  }

  // ── Coverage caveat ─────────────────────────────────────
  if (coverage.seedData) {
    findings.push({
      id: "coverage-seed",
      screen: "denied-party",
      severity: "advisory",
      title: "Screening ran against the bundled seed list",
      detail: coverage.caveat,
      authority: "Internal data coverage",
      subject: { type: "shipment", index: -1, label: "Shipment" },
      remediation:
        "Run `npm run load:denied-parties` to pull the consolidated screening list, then re-screen. " +
        "Until then, treat a clean denied-party result as unverified.",
    });
  }

  // ── Exposure, score, verdict ────────────────────────────
  const isfShortfall = missingPga.some(
    (hit) => hit.code === "ISF_10_2" && isPastLeadTime(hit, pga.daysUntilDeparture)
  );

  // One hold per blocking or warning finding that would actually stop a box:
  // UFLPA detentions and missing mandatory PGA filings. Denied-party hits do
  // not produce demurrage — they produce a shipment that never sails.
  const holdIncidents =
    uflpa.lines.filter((line) => line.band === "prohibited" || line.band === "high").length +
    missingPga.filter((hit) => hit.mandatory && isPastLeadTime(hit, pga.daysUntilDeparture)).length;

  const exposure = buildExposure({
    additionalDutyUsd: section301.totalAdditionalDutyUsd,
    uflpaValueAtRiskUsd: uflpa.valueAtRiskUsd,
    holdIncidents,
    isfShortfall,
    transshipmentDutyUsd,
  });

  const score = scoreFindings(findings);
  const verdict = verdictFor(findings);
  const counts = {
    block: findings.filter((f) => f.severity === "block").length,
    warn: findings.filter((f) => f.severity === "warn").length,
    advisory: findings.filter((f) => f.severity === "advisory").length,
  };

  const severityRank = { block: 0, warn: 1, advisory: 2 } as const;
  findings.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  const totalValueUsd = input.lineItems.reduce(
    (sum, line) => sum + Math.max(0, line.valueUsd),
    0
  );

  return {
    verdict,
    score,
    grade: gradeFor(score),
    summary: buildSummary(verdict, counts, exposure.totalUsd, coverage.seedData),
    findings,
    counts,
    exposure,
    screens: { deniedParty, section301, uflpa, pga },
    coverage,
    actionPlan: findings
      .filter((finding) => finding.severity !== "advisory")
      .map((finding) => `${finding.severity === "block" ? "STOP" : "FIX"} — ${finding.remediation}`),
    totalValueUsd,
  };
}

function buildSummary(
  verdict: ComplianceScreeningResult["verdict"],
  counts: { block: number; warn: number; advisory: number },
  exposureUsd: number,
  seedData: boolean
): string {
  const money = usd(exposureUsd);
  const caveat = seedData ? " Screened against the seed list only." : "";

  if (verdict === "BLOCKED") {
    return (
      `Do not sail. ${counts.block} blocking finding${counts.block === 1 ? "" : "s"} ` +
      `and ${money} of exposure if the shipment proceeds as booked.${caveat}`
    );
  }
  if (verdict === "REVIEW") {
    return (
      `Clear ${counts.warn} item${counts.warn === 1 ? "" : "s"} before departure. ` +
      `${money} of exposure is on the table until they are closed.${caveat}`
    );
  }
  return `No blocking or warning findings on the screens run.${caveat}`;
}
