// ============================================================
// Customs broker handoff — manifest assembly (AI-12018)
//
// Turns a validated, reconciled document set into the single object the cover
// sheet, the ZIP and the broker-facing page all render from. Pure: no DB, no
// network, no clock of its own.
//
// The one rule that governs everything here: where documents disagree about a
// value, the manifest reports nothing rather than a guess. Reconciliation has
// already raised the disagreement as a finding; silently promoting one
// document's number to "the" number would bury the exact discrepancy the
// broker needs to see, and the entry can only carry one figure.
// ============================================================

import { getDocumentSpec } from "@/lib/documents/registry";
import type { TradeDocumentType } from "@/lib/documents/types";
import type {
  BuildManifestInput,
  HandoffActionItem,
  HandoffDocumentEntry,
  HandoffManifest,
  HandoffShipmentSummary,
  HandoffSourceDocument,
} from "./types";

/**
 * Documents are read in the order a broker works them: what the carrier
 * carried, what it is worth, how it is packed, then the filings and
 * certificates that let it in.
 */
const TYPE_ORDER: TradeDocumentType[] = [
  "bill_of_lading",
  "commercial_invoice",
  "packing_list",
  "isf",
  "certificate_of_origin",
  "phytosanitary_certificate",
  "fda_prior_notice",
];

export function documentSortIndex(type: TradeDocumentType): number {
  const index = TYPE_ORDER.indexOf(type);
  return index === -1 ? TYPE_ORDER.length : index;
}

// ─── Consensus helpers ────────────────────────────────────

function normalizeForCompare(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Return the value every document that has an opinion agrees on, or null.
 *
 * `keys` lets one logical field be read from the different names documents
 * give it — the consignee is `consignee` on a BOL, `importer` on a
 * certificate of origin and `buyer` on an invoice.
 */
export function consensusString(
  documents: HandoffSourceDocument[],
  keys: string[]
): string | null {
  const values: string[] = [];
  for (const doc of documents) {
    for (const key of keys) {
      const raw = doc.fields?.[key];
      if (typeof raw === "string" && raw.trim()) values.push(raw.trim());
    }
  }
  if (!values.length) return null;
  const distinct = new Set(values.map(normalizeForCompare));
  return distinct.size === 1 ? values[0] : null;
}

export function consensusNumber(
  documents: HandoffSourceDocument[],
  keys: string[],
  tolerancePct = 0
): number | null {
  const values: number[] = [];
  for (const doc of documents) {
    for (const key of keys) {
      const raw = doc.fields?.[key];
      if (typeof raw === "number" && Number.isFinite(raw)) values.push(raw);
    }
  }
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const denominator = Math.max(Math.abs(min), Math.abs(max));
  const diffPct = denominator === 0 ? 0 : (Math.abs(max - min) / denominator) * 100;
  if (diffPct > tolerancePct) return null;
  // Within tolerance the documents are saying the same thing; report the one a
  // broker would key, which is the larger figure for weights and values.
  return max;
}

/** Union of a list-valued field across the set, de-duplicated, order-stable. */
export function unionStrings(
  documents: HandoffSourceDocument[],
  keys: string[]
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const doc of documents) {
    for (const key of keys) {
      const raw = doc.fields?.[key];
      const list = Array.isArray(raw) ? raw : raw === undefined || raw === null ? [] : [raw];
      for (const item of list) {
        if (typeof item !== "string") continue;
        const value = item.trim();
        if (!value) continue;
        const key2 = value.toUpperCase();
        if (seen.has(key2)) continue;
        seen.add(key2);
        out.push(value);
      }
    }
  }
  return out;
}

function isoOrNull(value: unknown): string | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value.trim() : parsed.toISOString();
  }
  return null;
}

function consensusDate(documents: HandoffSourceDocument[], keys: string[]): string | null {
  const values: string[] = [];
  for (const doc of documents) {
    for (const key of keys) {
      const iso = isoOrNull(doc.fields?.[key]);
      if (iso) values.push(iso);
    }
  }
  if (!values.length) return null;
  return new Set(values).size === 1 ? values[0] : null;
}

// ─── Shipment summary ─────────────────────────────────────

export function buildShipmentSummary(
  documents: HandoffSourceDocument[],
  reference: string | null
): HandoffShipmentSummary {
  return {
    reference: reference?.trim() || null,
    blNumber: consensusString(documents, ["bl_number"]),
    invoiceNumber: consensusString(documents, ["invoice_number"]),
    containerNumbers: unionStrings(documents, ["container_numbers"]),
    vesselName: consensusString(documents, ["vessel_name"]),
    voyageNumber: consensusString(documents, ["voyage_number"]),
    carrier: consensusString(documents, ["carrier"]),
    portOfLoading: consensusString(documents, ["port_of_loading"]),
    portOfDischarge: consensusString(documents, ["port_of_discharge", "port_of_arrival"]),
    etd: consensusDate(documents, ["etd"]),
    eta: consensusDate(documents, ["eta"]),
    shipper: consensusString(documents, ["shipper", "seller", "exporter"]),
    consignee: consensusString(documents, ["consignee", "importer", "buyer"]),
    countryOfOrigin: consensusString(documents, ["country_of_origin"]),
    incoterm: consensusString(documents, ["incoterm"]),
    declaredValue: consensusNumber(documents, ["total_value"], 1),
    currency: consensusString(documents, ["currency"]),
    htsCodes: unionStrings(documents, ["hts_codes"]),
    grossWeightKg: consensusNumber(documents, ["gross_weight_kg"], 2),
    packageCount: consensusNumber(documents, ["package_count"]),
  };
}

// ─── Action items ─────────────────────────────────────────

/**
 * Flatten per-document validation issues and cross-document findings into one
 * list, blockers first. Info-level notes are dropped: the cover sheet is a
 * work list, and padding it with hygiene notes is how the two items that
 * actually stop the entry get skimmed past.
 */
export function buildActionItems(
  documents: HandoffSourceDocument[],
  reconciliation: BuildManifestInput["reconciliation"]
): HandoffActionItem[] {
  const items: HandoffActionItem[] = [];

  for (const doc of documents) {
    for (const issue of doc.validation?.issues ?? []) {
      if (issue.severity === "info") continue;
      const label = getDocumentSpec(doc.type).label;
      items.push({
        severity: issue.severity,
        code: issue.code,
        message: issue.authority
          ? `${label}: ${issue.message} (${issue.authority})`
          : `${label}: ${issue.message}`,
        documents: [doc.type],
      });
    }
  }

  for (const finding of reconciliation.findings) {
    if (finding.severity === "info") continue;
    const detail = finding.values
      .map((v) => `${getDocumentSpec(v.type).label} = ${v.value}`)
      .join("; ");
    items.push({
      severity: finding.severity,
      code: finding.code,
      message: detail ? `${finding.message} ${detail}.` : finding.message,
      documents: finding.documents,
    });
  }

  for (const type of reconciliation.missingDocuments) {
    const spec = getDocumentSpec(type);
    items.push({
      severity: "blocker",
      code: "handoff.missing_document",
      message: `${spec.label} is required for this cargo and is not in the package. ${spec.authority}`,
      documents: [type],
    });
  }

  return items.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "blocker" ? -1 : 1));
}

// ─── Manifest ─────────────────────────────────────────────

export function buildHandoffManifest(input: BuildManifestInput): HandoffManifest {
  const documents = [...input.documents].sort(
    (a, b) => documentSortIndex(a.type) - documentSortIndex(b.type)
  );

  const entries: HandoffDocumentEntry[] = documents.map((doc) => {
    const spec = getDocumentSpec(doc.type);
    const key = doc.documentId ?? doc.fileName ?? doc.type;
    const archivePath = input.archivePaths[key] ?? null;
    return {
      documentId: doc.documentId,
      type: doc.type,
      label: spec.label,
      fileName: doc.fileName,
      archivePath,
      omissionReason: archivePath
        ? null
        : input.omissionReasons?.[key] ??
          doc.omissionReason ??
          "The original file is not attached — only the extracted data is available.",
      valid: doc.validation?.valid ?? false,
      blockerCount: doc.validation?.issues.filter((i) => i.severity === "blocker").length ?? 0,
      warningCount: doc.validation?.issues.filter((i) => i.severity === "warning").length ?? 0,
      completeness: doc.validation?.completeness ?? 0,
      missingRequired: doc.validation?.missingRequired ?? [],
      lowConfidenceFields: doc.validation?.lowConfidenceFields ?? [],
      fields: doc.fields ?? {},
    };
  });

  const actionItems = buildActionItems(documents, input.reconciliation);
  const blockerCount = actionItems.filter((i) => i.severity === "blocker").length;
  const warningCount = actionItems.filter((i) => i.severity === "warning").length;

  return {
    version: 1,
    packageId: input.packageId,
    generatedAt: input.generatedAt.toISOString(),
    expiresAt: input.expiresAt.toISOString(),
    preparedBy: {
      organization: input.organizationName?.trim() || null,
      user: input.userName?.trim() || null,
    },
    broker: {
      name: input.brokerName?.trim() || null,
      email: input.brokerEmail?.trim() || null,
    },
    shipment: buildShipmentSummary(documents, input.reference ?? null),
    profile: input.profile,
    documents: entries,
    missingDocuments: input.reconciliation.missingDocuments,
    actionItems,
    clearedToFile: blockerCount === 0,
    blockerCount,
    warningCount,
    releasedWithBlockers: !!input.releasedWithBlockers && blockerCount > 0,
    notes: input.notes?.trim() || null,
    reconciliation: input.reconciliation,
  };
}
