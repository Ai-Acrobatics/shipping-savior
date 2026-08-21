// ============================================================
// Multi-document trade OCR — validation (AI-12016)
//
// Completeness plus the statutory gates that actually stop a shipment. The
// timing rules are the point of this module: ISF and FDA Prior Notice are
// both "filed by the deadline or the cargo does not move", and both deadlines
// are arithmetic on two timestamps that are already on the document.
//
// Severity discipline:
//   blocker — the document cannot be used as-is; a filing on it would fail
//   warning — legal but risky, or varies by importing country
//   info    — worth a human glance, nothing more
//
// Where a limit varies by jurisdiction (the phytosanitary issue-to-departure
// window is the main one) it is a warning with the reason stated, not a
// blocker asserted as if it were federal law.
// ============================================================

import { getDocumentSpec } from "./registry";
import type {
  DocumentExtraction,
  DocumentValidation,
  TradeDocumentType,
  ValidationIssue,
} from "./types";

/** Below this, a field is surfaced for human review even when populated. */
export const LOW_CONFIDENCE_THRESHOLD = 0.6;

/** 19 CFR 149.2(b) — ISF must be filed 24 hours before lading. */
export const ISF_LEAD_HOURS = 24;

/** 21 CFR 1.279(a) — minimum prior-notice lead time by mode of transport. */
export const FDA_LEAD_HOURS_BY_MODE: Record<string, number> = {
  water: 8,
  air: 4,
  rail: 4,
  road: 2,
  truck: 2,
};

/** 21 CFR 1.279(a) — prior notice may not be submitted more than 15 days out. */
export const FDA_MAX_LEAD_DAYS = 15;

/**
 * Common importing-country limit on how stale a phytosanitary certificate may
 * be at departure. Not universal — hence a warning, not a blocker.
 */
export const PHYTO_ISSUE_WINDOW_DAYS = 14;

const INCOTERMS_2020 = new Set([
  "EXW", "FCA", "CPT", "CIP", "DAP", "DPU", "DDP",
  "FAS", "FOB", "CFR", "CIF",
]);

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

function ms(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? null : t;
}

function hoursBetween(laterMs: number, earlierMs: number): number {
  return (laterMs - earlierMs) / HOUR_MS;
}

function fmtHours(hours: number): string {
  const abs = Math.abs(hours);
  if (abs < 1) return `${Math.round(abs * 60)} minutes`;
  if (abs < 48) return `${abs.toFixed(1)} hours`;
  return `${(abs / 24).toFixed(1)} days`;
}

// ─── Per-type rules ───────────────────────────────────────

type RuleFn = (
  fields: Record<string, unknown>,
  ctx: { now: number; authority: string }
) => ValidationIssue[];

const RULES: Partial<Record<TradeDocumentType, RuleFn>> = {
  isf: (fields, { authority }) => {
    const issues: ValidationIssue[] = [];
    const filed = ms(fields.filing_datetime);
    const laden = ms(fields.lading_datetime);

    if (filed !== null && laden !== null) {
      const lead = hoursBetween(laden, filed);
      if (lead < 0) {
        issues.push({
          severity: "blocker",
          code: "isf.filed_after_lading",
          message: `ISF was transmitted ${fmtHours(lead)} AFTER the cargo was laden. This is a late filing and exposes the importer to the $5,000 liquidated-damages claim.`,
          fields: ["filing_datetime", "lading_datetime"],
          authority,
        });
      } else if (lead < ISF_LEAD_HOURS) {
        issues.push({
          severity: "blocker",
          code: "isf.filed_late",
          message: `ISF was filed only ${fmtHours(lead)} before lading. CBP requires at least ${ISF_LEAD_HOURS} hours — this filing is ${fmtHours(ISF_LEAD_HOURS - lead)} short.`,
          fields: ["filing_datetime", "lading_datetime"],
          authority,
        });
      }
    }

    const hts = fields.hts_codes;
    if (Array.isArray(hts) && hts.length > 0) {
      const tooShort = hts.filter(
        (code) => typeof code === "string" && code.replace(/\D/g, "").length < 6
      );
      if (tooShort.length > 0) {
        issues.push({
          severity: "warning",
          code: "isf.hts_below_six_digits",
          message: `${tooShort.length} HTS number(s) are shorter than the 6 digits ISF requires: ${tooShort.join(", ")}.`,
          fields: ["hts_codes"],
          authority,
        });
      }
    }

    return issues;
  },

  fda_prior_notice: (fields, { authority }) => {
    const issues: ValidationIssue[] = [];
    const submitted = ms(fields.submission_datetime);
    const arrival = ms(fields.arrival_datetime);
    const mode = typeof fields.mode_of_transport === "string"
      ? fields.mode_of_transport.trim().toLowerCase()
      : null;

    if (submitted !== null && arrival !== null) {
      const lead = hoursBetween(arrival, submitted);
      const requiredLead = mode ? FDA_LEAD_HOURS_BY_MODE[mode] : undefined;

      if (lead < 0) {
        issues.push({
          severity: "blocker",
          code: "fda.submitted_after_arrival",
          message: `Prior notice was submitted ${fmtHours(lead)} after arrival. FDA refuses admission for an article that arrives without prior notice.`,
          fields: ["submission_datetime", "arrival_datetime"],
          authority,
        });
      } else if (requiredLead !== undefined && lead < requiredLead) {
        issues.push({
          severity: "blocker",
          code: "fda.prior_notice_late",
          message: `Prior notice gives only ${fmtHours(lead)} of lead time. Arrival by ${mode} requires at least ${requiredLead} hours — this is ${fmtHours(requiredLead - lead)} short and the article is refusable.`,
          fields: ["submission_datetime", "arrival_datetime", "mode_of_transport"],
          authority,
        });
      } else if (requiredLead === undefined) {
        issues.push({
          severity: "warning",
          code: "fda.mode_unrecognised",
          message: `Mode of transport ${mode ? `"${mode}"` : "was not read"}, so the minimum lead time could not be checked. FDA requires 8h by water, 4h by air or rail, 2h by road.`,
          fields: ["mode_of_transport"],
          authority,
        });
      }

      if (lead > FDA_MAX_LEAD_DAYS * 24) {
        issues.push({
          severity: "blocker",
          code: "fda.submitted_too_early",
          message: `Prior notice was submitted ${fmtHours(lead)} before arrival. FDA will not accept a notice filed more than ${FDA_MAX_LEAD_DAYS} calendar days out — it has to be resubmitted closer to arrival.`,
          fields: ["submission_datetime", "arrival_datetime"],
          authority,
        });
      }
    }

    const registration = fields.manufacturer_registration_number;
    if (typeof registration === "string" && !/^\d{6,11}$/.test(registration.replace(/\D/g, ""))) {
      issues.push({
        severity: "warning",
        code: "fda.registration_format",
        message: `Manufacturer FDA registration number "${registration}" does not look like an 11-digit food facility registration. Confirm before filing.`,
        fields: ["manufacturer_registration_number"],
        authority,
      });
    }

    return issues;
  },

  phytosanitary_certificate: (fields, { now, authority }) => {
    const issues: ValidationIssue[] = [];
    const issued = ms(fields.issue_date);
    const departure = ms(fields.departure_date);
    const treated = ms(fields.treatment_date);

    if (issued !== null && issued > now + DAY_MS) {
      issues.push({
        severity: "blocker",
        code: "phyto.issued_in_future",
        message: "The certificate's issue date is in the future. Either the date was misread or the document is not genuine — do not present it.",
        fields: ["issue_date"],
        authority,
      });
    }

    if (issued !== null && departure !== null) {
      if (issued > departure) {
        issues.push({
          severity: "blocker",
          code: "phyto.issued_after_departure",
          message: "The certificate was issued after the consignment departed. Inspection has to precede export, so this certificate will not be accepted.",
          fields: ["issue_date", "departure_date"],
          authority,
        });
      } else {
        const ageDays = (departure - issued) / DAY_MS;
        if (ageDays > PHYTO_ISSUE_WINDOW_DAYS) {
          issues.push({
            severity: "warning",
            code: "phyto.issue_window_exceeded",
            message: `The certificate was issued ${ageDays.toFixed(0)} days before departure. Many importing NPPOs will not accept a certificate older than ${PHYTO_ISSUE_WINDOW_DAYS} days at export — confirm the destination's limit before shipping.`,
            fields: ["issue_date", "departure_date"],
            authority,
          });
        }
      }
    }

    if (treated !== null && issued !== null && treated > issued) {
      issues.push({
        severity: "warning",
        code: "phyto.treatment_after_issue",
        message: "Treatment is dated after the certificate was issued. The certifying officer cannot attest to a treatment that had not yet happened — check both dates.",
        fields: ["treatment_date", "issue_date"],
        authority,
      });
    }

    if (isEmpty(fields.additional_declaration)) {
      issues.push({
        severity: "info",
        code: "phyto.no_additional_declaration",
        message: "No additional declaration was read. Most destination markets require a specific AD wording for the commodity — confirm none is required for this lane.",
        fields: ["additional_declaration"],
        authority,
      });
    }

    return issues;
  },

  commercial_invoice: (fields, { authority }) => {
    const issues: ValidationIssue[] = [];

    const total = fields.total_value;
    if (typeof total === "number" && total <= 0) {
      issues.push({
        severity: "blocker",
        code: "invoice.non_positive_value",
        message: `Invoice total is ${total}. A customs value has to be a positive number; a free-of-charge shipment still needs a stated value for duty purposes.`,
        fields: ["total_value"],
        authority,
      });
    }

    const currency = fields.currency;
    if (typeof currency === "string" && !/^[A-Za-z]{3}$/.test(currency.trim())) {
      issues.push({
        severity: "warning",
        code: "invoice.currency_format",
        message: `Currency "${currency}" is not a 3-letter ISO 4217 code. Entry software will reject it.`,
        fields: ["currency"],
        authority,
      });
    }

    const incoterm = fields.incoterm;
    if (typeof incoterm === "string") {
      // Take the first whitespace-delimited token so "FOB Ningbo" resolves to
      // FOB — but compare the WHOLE token, never a 3-char slice, or "FOBB"
      // silently passes as FOB.
      const code = incoterm.trim().toUpperCase().split(/\s+/)[0] ?? "";
      if (!INCOTERMS_2020.has(code)) {
        issues.push({
          severity: "warning",
          code: "invoice.incoterm_unrecognised",
          message: `"${incoterm}" is not an Incoterms 2020 rule. Valid codes: ${[...INCOTERMS_2020].join(", ")}.`,
          fields: ["incoterm"],
          authority,
        });
      } else if (isEmpty(fields.incoterm_place)) {
        issues.push({
          severity: "info",
          code: "invoice.incoterm_place_missing",
          message: `${code} is incomplete without a named place. "${code} Shanghai" is a term; "${code}" on its own is ambiguous about where risk transfers.`,
          fields: ["incoterm_place"],
          authority,
        });
      }
    }

    if (isEmpty(fields.hts_codes)) {
      issues.push({
        severity: "warning",
        code: "invoice.no_hts",
        message: "No HTS classification was read from the invoice. Entry can proceed without it, but the broker will have to classify from the description, which is slower and less accurate.",
        fields: ["hts_codes"],
        authority,
      });
    }

    return issues;
  },

  packing_list: (fields, { authority }) => {
    const issues: ValidationIssue[] = [];
    const net = fields.net_weight_kg;
    const gross = fields.gross_weight_kg;

    if (typeof net === "number" && typeof gross === "number" && net > gross) {
      issues.push({
        severity: "blocker",
        code: "packing.net_exceeds_gross",
        message: `Net weight (${net} kg) is greater than gross weight (${gross} kg), which is physically impossible. One of the two was misread or the columns are swapped.`,
        fields: ["net_weight_kg", "gross_weight_kg"],
        authority,
      });
    }

    const packages = fields.package_count;
    if (typeof packages === "number" && packages <= 0) {
      issues.push({
        severity: "blocker",
        code: "packing.no_packages",
        message: "Package count is zero or negative. A packing list has to account for at least one package.",
        fields: ["package_count"],
        authority,
      });
    }

    return issues;
  },

  certificate_of_origin: (fields, { now, authority }) => {
    const issues: ValidationIssue[] = [];
    const issued = ms(fields.issue_date);
    const blanketEnd = ms(fields.blanket_period_end);

    if (issued !== null && issued > now + DAY_MS) {
      issues.push({
        severity: "blocker",
        code: "coo.issued_in_future",
        message: "The certificate's issue date is in the future. Confirm the date before presenting it.",
        fields: ["issue_date"],
        authority,
      });
    }

    if (blanketEnd !== null) {
      if (issued !== null && blanketEnd < issued) {
        issues.push({
          severity: "blocker",
          code: "coo.blanket_period_inverted",
          message: "The blanket period ends before the certificate was issued, so it covers nothing.",
          fields: ["blanket_period_end", "issue_date"],
          authority,
        });
      } else if (blanketEnd < now) {
        issues.push({
          severity: "blocker",
          code: "coo.blanket_period_expired",
          message: "The blanket period has already ended. A preference claim on this certificate will be denied.",
          fields: ["blanket_period_end"],
          authority,
        });
      }
    }

    const agreement = fields.trade_agreement;
    if (typeof agreement === "string" && /usmca|cusma|t-mec/i.test(agreement) && isEmpty(fields.origin_criterion)) {
      issues.push({
        severity: "warning",
        code: "coo.usmca_missing_criterion",
        message: "A USMCA certification has to state the origin criterion (A through E). Without it the claim is incomplete.",
        fields: ["origin_criterion", "trade_agreement"],
        authority,
      });
    }

    return issues;
  },
};

// ─── Entry point ──────────────────────────────────────────

export function validateDocument(
  extraction: DocumentExtraction,
  options: { now?: Date } = {}
): DocumentValidation {
  const spec = getDocumentSpec(extraction.type);
  const now = (options.now ?? new Date()).getTime();
  const fields = extraction.fields ?? {};
  const confidence = extraction.confidence ?? {};

  const requiredFields = spec.fields.filter((f) => f.required);
  const missingRequired = requiredFields
    .filter((f) => isEmpty(fields[f.key]))
    .map((f) => f.key);

  const issues: ValidationIssue[] = [];

  for (const key of missingRequired) {
    const field = spec.fields.find((f) => f.key === key);
    issues.push({
      severity: "blocker",
      code: "field.required_missing",
      message: `${field?.label ?? key} is required on a ${spec.label} and was not found.`,
      fields: [key],
      authority: spec.authority,
    });
  }

  const lowConfidenceFields = spec.fields
    .filter((f) => {
      if (isEmpty(fields[f.key])) return false;
      const score = confidence[f.key];
      return typeof score === "number" && score < LOW_CONFIDENCE_THRESHOLD;
    })
    .map((f) => f.key);

  for (const key of lowConfidenceFields) {
    const field = spec.fields.find((f) => f.key === key);
    issues.push({
      severity: field?.required ? "warning" : "info",
      code: "field.low_confidence",
      message: `${field?.label ?? key} was read with ${Math.round((confidence[key] ?? 0) * 100)}% confidence. Check it against the document before filing.`,
      fields: [key],
    });
  }

  const rule = RULES[extraction.type];
  if (rule) {
    issues.push(...rule(fields, { now, authority: spec.authority }));
  }

  const completeness =
    requiredFields.length === 0
      ? 1
      : (requiredFields.length - missingRequired.length) / requiredFields.length;

  return {
    type: extraction.type,
    valid: !issues.some((i) => i.severity === "blocker"),
    issues: sortIssues(issues),
    completeness: Number(completeness.toFixed(4)),
    missingRequired,
    lowConfidenceFields,
  };
}

const SEVERITY_ORDER: Record<ValidationIssue["severity"], number> = {
  blocker: 0,
  warning: 1,
  info: 2,
};

function sortIssues(issues: ValidationIssue[]): ValidationIssue[] {
  return [...issues].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );
}
