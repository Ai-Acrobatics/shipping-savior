// ============================================================
// Compliance Screening Agent — types (AI-12017)
//
// Screens a shipment BEFORE it departs, against the four things that
// actually strand containers on a US dock:
//
//   1. Denied parties  — OFAC SDN / BIS Entity List / DPL / sanctioned
//                        jurisdictions. Strict liability, no de minimis.
//   2. Section 301     — China-origin additional duty, and the origin-
//                        engineering pattern that turns a duty bill into a
//                        19 U.S.C. 1592 penalty case.
//   3. UFLPA           — rebuttable presumption of forced labour on XUAR
//                        nexus or UFLPA Entity List parties.
//   4. PGA routing     — which agency owns the entry, and what has to be on
//                        file before the vessel sails.
//
// Convention matches the rest of the codebase: money is USD, rates are
// percentages (7.5 means 7.5%), country codes are ISO 3166-1 alpha-2.
//
// Deliberately NOT here: an entry filing. This agent tells a shipper what
// will happen at the border. It does not transmit anything to CBP.
// ============================================================

// ─── Input ────────────────────────────────────────────────

export type PartyRole =
  | "shipper"
  | "consignee"
  | "ultimate-consignee"
  | "notify"
  | "manufacturer"
  | "supplier"
  | "carrier"
  | "forwarder";

export const PARTY_ROLE_LABELS: Record<PartyRole, string> = {
  shipper: "Shipper / Exporter",
  consignee: "Consignee",
  "ultimate-consignee": "Ultimate Consignee",
  notify: "Notify Party",
  manufacturer: "Manufacturer",
  supplier: "Supplier",
  carrier: "Carrier",
  forwarder: "Freight Forwarder",
};

export interface ScreeningParty {
  /** Stable id for UI row tracking. Generated when absent. */
  id?: string;
  name: string;
  role: PartyRole;
  /** ISO 3166-1 alpha-2. Free-form string because sanctioned jurisdictions
   *  (IR, KP, CU, SY, RU, BY) are outside the sourcing-focused CountryCode union. */
  country?: string;
  /** Street address. Screened for region indicators (XUAR, Crimea, etc). */
  address?: string;
}

export interface ScreeningLineItem {
  id?: string;
  description: string;
  htsCode: string;
  /** ISO 3166-1 alpha-2 country of origin as it will be declared to CBP. */
  countryOfOrigin: string;
  /** Entered value of this line, USD. Drives the duty and penalty exposure. */
  valueUsd: number;
  /** Factory name, when it differs from the shipper. Screened separately —
   *  the entity that made the goods is the one UFLPA cares about. */
  manufacturerName?: string;
  /** Province / region of manufacture. The single strongest UFLPA signal. */
  manufacturerRegion?: string;
  /**
   * Does the importer hold an applicability review / clear-and-convincing
   * traceability package for this line? Downgrades a UFLPA high-priority
   * commodity finding from block to warning.
   */
  hasSupplyChainTraceability?: boolean;
  /** PGA data sets already prepared, by requirement code (see pga-requirements). */
  pgaDocumentsOnFile?: string[];
  /** Section 301 exclusion claimed for this line, if any. */
  section301ExclusionClaimed?: boolean;
}

export interface ComplianceScreeningInput {
  parties: ScreeningParty[];
  lineItems: ScreeningLineItem[];
  /** ISO date the vessel sails. Used to check PGA filing lead times. */
  departureDate?: string;
  /** ISO date to evaluate lead times against. Defaults to now. Injectable so
   *  the engine stays deterministic under test. */
  evaluationDate?: string;
  portOfEntry?: string;
}

// ─── Findings ─────────────────────────────────────────────

/**
 * block    — do not sail. Entry will be refused, seized, or penalised.
 * warn     — will sail, but carries a real detention / duty / penalty risk.
 * advisory — worth knowing; no independent hold risk.
 */
export type FindingSeverity = "block" | "warn" | "advisory";

export type ComplianceScreen =
  | "denied-party"
  | "sanctioned-jurisdiction"
  | "section-301"
  | "uflpa"
  | "pga";

export const SCREEN_LABELS: Record<ComplianceScreen, string> = {
  "denied-party": "Denied Party",
  "sanctioned-jurisdiction": "Sanctioned Jurisdiction",
  "section-301": "Section 301",
  uflpa: "UFLPA",
  pga: "Agency Routing",
};

export interface FindingSubject {
  type: "party" | "line" | "shipment";
  index: number;
  label: string;
}

export interface ComplianceFinding {
  id: string;
  screen: ComplianceScreen;
  severity: FindingSeverity;
  title: string;
  detail: string;
  /** The statute / regulation that makes this a real obligation, not an opinion. */
  authority: string;
  subject: FindingSubject;
  /** The next concrete action. Never "consult counsel" alone. */
  remediation: string;
  /** Dollar exposure if this finding is ignored. Summed into the exposure model. */
  exposureUsd?: number;
  /** Match / detection confidence, 0-100. Absent when the finding is categorical. */
  confidencePct?: number;
  evidence?: string[];
}

// ─── Screen results ───────────────────────────────────────

export type ScreeningListSource =
  | "OFAC-SDN"
  | "OFAC-CONSOLIDATED"
  | "BIS-ENTITY-LIST"
  | "BIS-DENIED-PERSONS"
  | "BIS-UNVERIFIED"
  | "DHS-UFLPA-ENTITY-LIST"
  | "STATE-DEBARRED";

export interface ScreeningListEntry {
  id: string;
  name: string;
  aliases?: string[];
  source: ScreeningListSource;
  /** Sanctions program or list part, e.g. "IRAN", "RUSSIA-EO14024", "UFLPA-1". */
  program: string;
  countries?: string[];
  /** Federal Register cite or listing date, so a hit is traceable. */
  citation?: string;
  remarks?: string;
}

export type MatchStrength = "exact" | "strong" | "probable" | "possible";

export interface DeniedPartyHit {
  partyIndex: number;
  partyName: string;
  partyRole: PartyRole;
  entry: ScreeningListEntry;
  /** 0-100. 100 is a normalized-exact match. */
  scorePct: number;
  strength: MatchStrength;
  /** Which string on the list record produced the hit (name or an alias). */
  matchedAgainst: string;
}

export interface DeniedPartyScreenResult {
  hits: DeniedPartyHit[];
  partiesScreened: number;
  /** Jurisdiction-level (not name-level) sanctions exposure. */
  jurisdictionHits: {
    partyIndex: number;
    partyName: string;
    country: string;
    countryName: string;
    programme: string;
    embargoType: "comprehensive" | "targeted" | "region";
  }[];
}

export interface Section301LineAssessment {
  lineIndex: number;
  description: string;
  htsCode: string;
  countryOfOrigin: string;
  /** "List 1" … "List 4A", or null when the origin/HTS is out of scope. */
  list: string | null;
  additionalRatePct: number;
  additionalDutyUsd: number;
  exclusionClaimed: boolean;
  /** Set when the declared origin looks engineered around a 301 action. */
  transshipmentRisk: boolean;
  transshipmentReason?: string;
}

export interface Section301ScreenResult {
  lines: Section301LineAssessment[];
  totalAdditionalDutyUsd: number;
  linesInScope: number;
  transshipmentFlags: number;
}

export type UflpaRiskBand = "prohibited" | "high" | "elevated" | "low";

export interface UflpaLineAssessment {
  lineIndex: number;
  description: string;
  htsCode: string;
  countryOfOrigin: string;
  band: UflpaRiskBand;
  /** Named high-priority sector under the UFLPA enforcement strategy. */
  sector?: string;
  reasons: string[];
  /** Entity List party driving the finding, when there is one. */
  entityListMatch?: string;
  hasTraceability: boolean;
  /** Value at risk of detention on this line. */
  valueAtRiskUsd: number;
}

export interface UflpaScreenResult {
  lines: UflpaLineAssessment[];
  highestBand: UflpaRiskBand;
  valueAtRiskUsd: number;
  /** XUAR nexus found on a party address rather than a line. */
  regionNexusParties: { partyIndex: number; partyName: string; indicator: string }[];
}

export interface PgaRequirementHit {
  lineIndex: number;
  description: string;
  htsCode: string;
  code: string;
  agency: string;
  agencyName: string;
  programme: string;
  /** The filing or data set CBP expects, e.g. "FDA Prior Notice". */
  filing: string;
  form?: string;
  /** Business days before arrival the filing has to exist. */
  leadTimeDays: number;
  mandatory: boolean;
  onFile: boolean;
  notes?: string;
}

export interface PgaScreenResult {
  requirements: PgaRequirementHit[];
  agencies: string[];
  missingMandatory: number;
  /** Longest lead time across missing filings — the real "when do we start" number. */
  maxLeadTimeDays: number;
  /** Null when no departure date was supplied. */
  daysUntilDeparture: number | null;
}

// ─── Exposure + verdict ───────────────────────────────────

export interface ExposureModel {
  /** Section 301 and other additional duty already owed if the entry proceeds. */
  additionalDutyUsd: number;
  /** Statutory penalty exposure (1592 negligence / gross negligence bands). */
  penaltyUsd: number;
  /** Demurrage + detention + storage while a hold is worked out. */
  holdCostUsd: number;
  /** Entered value that could be excluded or seized outright. */
  valueAtRiskUsd: number;
  totalUsd: number;
  basis: string[];
}

export type ComplianceVerdict = "CLEAR" | "REVIEW" | "BLOCKED";
export type ComplianceGrade = "A" | "B" | "C" | "D" | "F";

/**
 * What the screening lists actually covered. Carried on every result because
 * "no hits" against a 40-name seed list is not the same statement as "no hits"
 * against the full consolidated list, and a shipper must not read it as one.
 */
export interface ScreeningCoverage {
  listRecordCount: number;
  sources: ScreeningListSource[];
  /** True when running on the bundled seed list rather than a refreshed export. */
  seedData: boolean;
  listVersion: string;
  /** Rendered verbatim in the UI next to any CLEAR verdict. */
  caveat: string;
}

export interface ComplianceScreeningResult {
  verdict: ComplianceVerdict;
  score: number;
  grade: ComplianceGrade;
  summary: string;
  findings: ComplianceFinding[];
  counts: { block: number; warn: number; advisory: number };
  exposure: ExposureModel;
  screens: {
    deniedParty: DeniedPartyScreenResult;
    section301: Section301ScreenResult;
    uflpa: UflpaScreenResult;
    pga: PgaScreenResult;
  };
  coverage: ScreeningCoverage;
  /** Ordered next actions, blockers first. */
  actionPlan: string[];
  totalValueUsd: number;
}
