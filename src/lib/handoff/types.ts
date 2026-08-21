// ============================================================
// Customs broker handoff package — types (AI-12018)
//
// The last mile of the document pipeline. OCR (AI-12016) reads the documents,
// validation checks each one against the rule that governs it, reconciliation
// checks the set agrees with itself — and then a human customs broker has to
// receive all of it in a form they can act on without logging into anything.
//
// That form is: one ZIP, one cover sheet at the top of it, and a link that
// stops working. The link expiring is the point — a handoff package contains
// the commercial value, the parties and the importer of record number for a
// shipment, and those do not belong in a URL that lives forever in an inbox.
// ============================================================

import type {
  DocumentValidation,
  ReconciliationReport,
  ShipmentProfile,
  TradeDocumentType,
} from "@/lib/documents/types";

// ─── Manifest ─────────────────────────────────────────────

export interface HandoffDocumentEntry {
  /** Stored trade_documents id, when the document came from the library. */
  documentId: string | null;
  type: TradeDocumentType;
  label: string;
  /** Original upload name, e.g. "invoice-8841.pdf". */
  fileName: string | null;
  /** Path of the original inside the ZIP, or null when it could not be attached. */
  archivePath: string | null;
  /** Why the original is missing, when it is. */
  omissionReason: string | null;
  valid: boolean;
  blockerCount: number;
  warningCount: number;
  completeness: number;
  missingRequired: string[];
  lowConfidenceFields: string[];
  /** Extraction, so the broker can key an entry without re-reading the PDF. */
  fields: Record<string, unknown>;
}

/**
 * The identity of the shipment as the document set agrees it is. Every value
 * here is one the documents concur on — where they disagree, reconciliation
 * has already raised a finding and the field is left null rather than the
 * package silently picking a winner.
 */
export interface HandoffShipmentSummary {
  reference: string | null;
  blNumber: string | null;
  invoiceNumber: string | null;
  containerNumbers: string[];
  vesselName: string | null;
  voyageNumber: string | null;
  carrier: string | null;
  portOfLoading: string | null;
  portOfDischarge: string | null;
  etd: string | null;
  eta: string | null;
  shipper: string | null;
  consignee: string | null;
  countryOfOrigin: string | null;
  incoterm: string | null;
  declaredValue: number | null;
  currency: string | null;
  htsCodes: string[];
  grossWeightKg: number | null;
  packageCount: number | null;
}

export interface HandoffActionItem {
  severity: "blocker" | "warning";
  code: string;
  message: string;
  /** Document types the item concerns, for the broker to pull the right page. */
  documents: TradeDocumentType[];
}

export interface HandoffManifest {
  /** Schema version — a broker may keep a package for years. */
  version: 1;
  packageId: string;
  generatedAt: string;
  expiresAt: string;
  preparedBy: {
    organization: string | null;
    user: string | null;
  };
  broker: {
    name: string | null;
    email: string | null;
  };
  shipment: HandoffShipmentSummary;
  profile: ShipmentProfile;
  documents: HandoffDocumentEntry[];
  /** Document types the profile requires that the set does not contain. */
  missingDocuments: TradeDocumentType[];
  /** Blockers and warnings from per-document validation and reconciliation. */
  actionItems: HandoffActionItem[];
  /** No blockers anywhere and nothing required missing. */
  clearedToFile: boolean;
  blockerCount: number;
  warningCount: number;
  /**
   * Set when the package was released over unresolved blockers. The broker
   * sees this at the top of the cover sheet — an acknowledged blocker is still
   * a blocker.
   */
  releasedWithBlockers: boolean;
  notes: string | null;
  reconciliation: ReconciliationReport;
}

// ─── Build inputs ─────────────────────────────────────────

/** One document as handed to the package builder. */
export interface HandoffSourceDocument {
  documentId: string | null;
  type: TradeDocumentType;
  fileName: string | null;
  fileType: string | null;
  fields: Record<string, unknown>;
  validation: DocumentValidation | null;
  /** Original bytes. Null when the file was never persisted to blob storage. */
  original: Buffer | null;
  omissionReason?: string | null;
}

export interface BuildManifestInput {
  packageId: string;
  documents: HandoffSourceDocument[];
  reconciliation: ReconciliationReport;
  profile: ShipmentProfile;
  archivePaths: Record<string, string | null>;
  /** documentKey → why the original is not attached, from `planArchive`. */
  omissionReasons?: Record<string, string>;
  generatedAt: Date;
  expiresAt: Date;
  organizationName?: string | null;
  userName?: string | null;
  brokerName?: string | null;
  brokerEmail?: string | null;
  reference?: string | null;
  notes?: string | null;
  releasedWithBlockers?: boolean;
}

// ─── Share-link status ────────────────────────────────────

export type HandoffLinkStatus = "active" | "expired" | "revoked";

export interface HandoffLinkState {
  status: HandoffLinkStatus;
  /** Whole seconds until expiry; 0 once expired or revoked. */
  secondsRemaining: number;
}
