// ============================================================
// Compliance score, verdict and dollar exposure (AI-12017)
//
// The score exists so a shipper can triage a queue of bookings. The verdict
// exists so a single shipment gets a yes/no. They are computed from the same
// findings but they are not the same statement, and conflating them is how a
// "92/100" ships a container that was always going to be seized.
//
// Rule: one blocking finding is BLOCKED at any score. The score describes how
// much work the shipment needs; the verdict describes whether it may sail.
// ============================================================

import type {
  ComplianceFinding,
  ComplianceGrade,
  ComplianceVerdict,
  ExposureModel,
} from "./types";

/**
 * Penalty exposure under 19 U.S.C. 1592 scales with culpability, not with a
 * flat rate: negligence is capped at 2x the duty loss, gross negligence at 4x,
 * fraud at the domestic value of the merchandise. A shipment that sails with a
 * known, documented finding is not arguing negligence, so the model uses the
 * gross-negligence multiple for anything already flagged here.
 */
export const PENALTY_MULTIPLE_GROSS_NEGLIGENCE = 4;

/**
 * Cost of a container sitting while a hold is resolved. Demurrage plus
 * per-diem detention plus exam fees, per container per incident. Deliberately
 * conservative — the point of the number is to make the finding legible next
 * to the cost of fixing it, not to win an argument.
 */
export const HOLD_COST_PER_INCIDENT_USD = 12_500;

/** Statutory ISF liquidated damages claim. Fixed by regulation. */
export const ISF_LIQUIDATED_DAMAGES_USD = 5_000;

const SEVERITY_PENALTY: Record<ComplianceFinding["severity"], number> = {
  block: 34,
  warn: 9,
  advisory: 2,
};

export function scoreFindings(findings: ComplianceFinding[]): number {
  const deduction = findings.reduce(
    (sum, finding) => sum + SEVERITY_PENALTY[finding.severity],
    0
  );
  return Math.max(0, Math.min(100, Math.round(100 - deduction)));
}

export function gradeFor(score: number): ComplianceGrade {
  if (score >= 90) return "A";
  if (score >= 78) return "B";
  if (score >= 65) return "C";
  if (score >= 50) return "D";
  return "F";
}

export function verdictFor(findings: ComplianceFinding[]): ComplianceVerdict {
  if (findings.some((finding) => finding.severity === "block")) return "BLOCKED";
  if (findings.some((finding) => finding.severity === "warn")) return "REVIEW";
  return "CLEAR";
}

export function buildExposure(params: {
  additionalDutyUsd: number;
  uflpaValueAtRiskUsd: number;
  holdIncidents: number;
  isfShortfall: boolean;
  transshipmentDutyUsd: number;
}): ExposureModel {
  const basis: string[] = [];

  const additionalDutyUsd = round(params.additionalDutyUsd);
  if (additionalDutyUsd > 0) {
    basis.push(
      `Section 301 additional duty of ${usd(additionalDutyUsd)} on the covered lines.`
    );
  }

  // Penalty exposure only attaches where origin is in question. Paying a 301
  // rate you correctly declared is a cost, not a penalty — modelling it as one
  // would inflate every China shipment and make the number meaningless.
  let penaltyUsd = round(params.transshipmentDutyUsd * PENALTY_MULTIPLE_GROSS_NEGLIGENCE);
  if (penaltyUsd > 0) {
    basis.push(
      `19 U.S.C. 1592 exposure at ${PENALTY_MULTIPLE_GROSS_NEGLIGENCE}x the ${usd(
        round(params.transshipmentDutyUsd)
      )} duty loss on the origin-flagged lines (gross negligence band).`
    );
  }
  if (params.isfShortfall) {
    penaltyUsd += ISF_LIQUIDATED_DAMAGES_USD;
    basis.push(
      `ISF liquidated damages of ${usd(ISF_LIQUIDATED_DAMAGES_USD)} for a late or missing 10+2 filing.`
    );
  }

  const holdCostUsd = round(params.holdIncidents * HOLD_COST_PER_INCIDENT_USD);
  if (holdCostUsd > 0) {
    basis.push(
      `${params.holdIncidents} likely hold${params.holdIncidents === 1 ? "" : "s"} at ` +
        `${usd(HOLD_COST_PER_INCIDENT_USD)} in demurrage, detention and exam costs each.`
    );
  }

  const valueAtRiskUsd = round(params.uflpaValueAtRiskUsd);
  if (valueAtRiskUsd > 0) {
    basis.push(
      `${usd(valueAtRiskUsd)} of entered value exposed to UFLPA detention and exclusion.`
    );
  }

  return {
    additionalDutyUsd,
    penaltyUsd: round(penaltyUsd),
    holdCostUsd,
    valueAtRiskUsd,
    totalUsd: round(additionalDutyUsd + penaltyUsd + holdCostUsd + valueAtRiskUsd),
    basis,
  };
}

function round(value: number): number {
  return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
}

function usd(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}
