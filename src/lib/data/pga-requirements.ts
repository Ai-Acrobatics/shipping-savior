// ============================================================
// HTS → Partner Government Agency routing (AI-12017)
//
// Roughly 30 federal agencies have a say in what crosses the border, and CBP
// enforces for all of them. Missing PGA data is the single most common reason
// an otherwise clean entry sits on the dock: the classification is right, the
// duty is paid, and the container still does not move because nobody filed
// the FDA Prior Notice.
//
// Matching is chapter- and heading-level. Headings win over chapters, so
// 8517 (radio-frequency devices → FCC) can be more specific than chapter 85.
//
// `leadTimeDays` is business days before arrival that the filing has to
// exist — that is the number that decides whether a shipment is still fixable
// or already late, and it is why this screen runs pre-departure.
// ============================================================

export interface PgaRequirement {
  /** Stable code used by `pgaDocumentsOnFile` on a line item. */
  code: string;
  agency: string;
  agencyName: string;
  programme: string;
  /** The filing or data set CBP expects to see. */
  filing: string;
  form?: string;
  leadTimeDays: number;
  mandatory: boolean;
  /** Two-digit HTS chapters this applies to. */
  chapters?: string[];
  /** Four-digit headings. More specific than a chapter; both can match. */
  headings?: string[];
  /** Description keywords that trigger the requirement regardless of chapter. */
  keywords?: string[];
  notes?: string;
}

export const PGA_REQUIREMENTS: PgaRequirement[] = [
  // ── FDA ────────────────────────────────────────────────
  {
    code: "FDA_PRIOR_NOTICE",
    agency: "FDA",
    agencyName: "Food and Drug Administration",
    programme: "Bioterrorism Act prior notice",
    filing: "FDA Prior Notice of imported food",
    leadTimeDays: 1,
    mandatory: true,
    chapters: ["02","03","04","05","07","08","09","10","11","12","15","16","17","18","19","20","21","22"],
    notes:
      "Required for human and animal food. Must be submitted no more than 30 days and no less than 4 hours (ocean: 8 hours) before arrival — file at booking, not at arrival.",
  },
  {
    code: "FDA_FSVP",
    agency: "FDA",
    agencyName: "Food and Drug Administration",
    programme: "Foreign Supplier Verification Program",
    filing: "FSVP importer identification (FSV affirmation of compliance)",
    leadTimeDays: 5,
    mandatory: true,
    chapters: ["02","03","04","07","08","09","10","11","12","15","16","17","18","19","20","21"],
    notes:
      "The FSVP importer must be named on the entry and hold the verification records. A US agent alone is not enough.",
  },
  {
    code: "FDA_DEVICE",
    agency: "FDA",
    agencyName: "Food and Drug Administration",
    programme: "Medical device entry",
    filing: "FDA device listing / 510(k) or PMA affirmation",
    form: "FDA 2877 (radiation-emitting devices)",
    leadTimeDays: 10,
    mandatory: true,
    chapters: ["90"],
    keywords: ["medical", "device", "diagnostic", "surgical", "catheter", "syringe", "thermometer"],
    notes: "Registration and listing numbers must be transmitted in the PGA message set.",
  },
  {
    code: "FDA_COSMETIC",
    agency: "FDA",
    agencyName: "Food and Drug Administration",
    programme: "MoCRA cosmetic facility registration",
    filing: "Cosmetic facility registration and product listing",
    leadTimeDays: 5,
    mandatory: true,
    chapters: ["33"],
    notes: "MoCRA made facility registration and product listing mandatory; unregistered facilities draw refusals.",
  },
  {
    code: "FDA_DRUG",
    agency: "FDA",
    agencyName: "Food and Drug Administration",
    programme: "Drug import",
    filing: "Drug listing / NDC and establishment registration",
    leadTimeDays: 10,
    mandatory: true,
    chapters: ["30"],
    notes: "Includes API and finished dosage. Unapproved-drug refusals are not curable at the port.",
  },
  // ── USDA ───────────────────────────────────────────────
  {
    code: "APHIS_PPQ",
    agency: "USDA-APHIS",
    agencyName: "Animal and Plant Health Inspection Service",
    programme: "Plant Protection and Quarantine",
    filing: "Phytosanitary certificate and PPQ permit",
    form: "PPQ 587 / PPQ 505",
    leadTimeDays: 15,
    mandatory: true,
    chapters: ["06", "07", "08", "12", "14", "44"],
    notes:
      "Permits are issued on a multi-week clock. Solid wood packing material must also meet ISPM 15 regardless of the commodity.",
  },
  {
    code: "FSIS_IMPORT",
    agency: "USDA-FSIS",
    agencyName: "Food Safety and Inspection Service",
    programme: "Meat, poultry and egg products",
    filing: "FSIS import inspection application",
    form: "FSIS 9540-1",
    leadTimeDays: 5,
    mandatory: true,
    chapters: ["02", "16"],
    notes: "Only eligible foreign establishments in listed countries. Reinspection happens at an I-house, not the port.",
  },
  {
    code: "LACEY_ACT",
    agency: "USDA-APHIS",
    agencyName: "Animal and Plant Health Inspection Service",
    programme: "Lacey Act plant declaration",
    filing: "Lacey Act declaration (genus, species, harvest country, value)",
    form: "PPQ 505",
    leadTimeDays: 3,
    mandatory: true,
    chapters: ["44", "47", "48", "92", "94"],
    notes: "Phase-in schedule keeps expanding. Species and harvest country must be on the declaration, not 'various'.",
  },
  // ── EPA / DOT ──────────────────────────────────────────
  {
    code: "EPA_VEHICLE",
    agency: "EPA",
    agencyName: "Environmental Protection Agency",
    programme: "Motor vehicle and engine emissions",
    filing: "EPA declaration of imported motor vehicles and engines",
    form: "EPA 3520-1",
    leadTimeDays: 5,
    mandatory: true,
    chapters: ["87"],
    headings: ["8407", "8408", "8409"],
    notes: "Engines in equipment count too — a generator set needs the same declaration as a vehicle.",
  },
  {
    code: "DOT_VEHICLE",
    agency: "DOT-NHTSA",
    agencyName: "National Highway Traffic Safety Administration",
    programme: "FMVSS conformance",
    filing: "Importer declaration for motor vehicle safety standards",
    form: "HS-7",
    leadTimeDays: 5,
    mandatory: true,
    chapters: ["87"],
    notes: "Non-conforming vehicles require a registered importer and a bond. Tyres are covered separately.",
  },
  {
    code: "EPA_TSCA",
    agency: "EPA",
    agencyName: "Environmental Protection Agency",
    programme: "Toxic Substances Control Act",
    filing: "TSCA import certification (positive or negative)",
    leadTimeDays: 2,
    mandatory: true,
    chapters: ["28", "29", "32", "34", "38"],
    notes: "Every chemical entry needs a TSCA certification, including a negative one. Formaldehyde (TSCA Title VI) adds composite-wood requirements.",
  },
  {
    code: "EPA_TSCA_VI",
    agency: "EPA",
    agencyName: "Environmental Protection Agency",
    programme: "TSCA Title VI formaldehyde",
    filing: "TSCA Title VI compliance statement for composite wood",
    leadTimeDays: 5,
    mandatory: true,
    chapters: ["44", "94"],
    keywords: ["plywood", "particleboard", "mdf", "composite wood", "cabinet", "laminate"],
    notes: "Applies to finished goods containing composite wood, not just the panel itself.",
  },
  // ── FCC / CPSC / TTB / FWS ─────────────────────────────
  {
    code: "FCC_RF",
    agency: "FCC",
    agencyName: "Federal Communications Commission",
    programme: "Radio frequency device authorisation",
    filing: "Equipment authorisation (SDoC or certification) with FCC ID",
    leadTimeDays: 10,
    mandatory: true,
    chapters: ["85"],
    headings: ["8517", "8525", "8526", "8527", "8528", "8543"],
    keywords: ["wireless", "bluetooth", "wi-fi", "wifi", "radio", "transmitter", "router"],
    notes: "Form 740 was eliminated; the authorisation record still has to exist and be producible on demand.",
  },
  {
    code: "CPSC_CPC",
    agency: "CPSC",
    agencyName: "Consumer Product Safety Commission",
    programme: "CPSIA certification",
    filing: "Children's Product Certificate or General Certificate of Conformity",
    leadTimeDays: 10,
    mandatory: true,
    chapters: ["94", "95"],
    keywords: ["toy", "children", "infant", "crib", "stroller", "mattress", "juvenile"],
    notes:
      "Children's products need third-party CPSC-accepted lab testing behind the certificate. The certificate must accompany the shipment.",
  },
  {
    code: "TTB_COLA",
    agency: "TTB",
    agencyName: "Alcohol and Tobacco Tax and Trade Bureau",
    programme: "Alcohol import",
    filing: "Certificate of Label Approval and importer basic permit",
    form: "TTB F 5100.31",
    leadTimeDays: 30,
    mandatory: true,
    chapters: ["22"],
    notes: "COLA turnaround runs weeks. The basic permit is per-importer and has to predate the first entry.",
  },
  {
    code: "FWS_DECLARATION",
    agency: "FWS",
    agencyName: "US Fish and Wildlife Service",
    programme: "Wildlife declaration",
    filing: "Declaration for importation of fish or wildlife",
    form: "3-177",
    leadTimeDays: 5,
    mandatory: true,
    chapters: ["01", "03", "05", "41", "42", "43", "96"],
    keywords: ["leather", "fur", "skin", "python", "crocodile", "coral", "ivory", "feather", "shell"],
    notes: "Must clear a designated port. CITES species need the export permit before the goods move.",
  },
  {
    code: "ATF_IMPORT",
    agency: "ATF",
    agencyName: "Bureau of Alcohol, Tobacco, Firearms and Explosives",
    programme: "Firearms and ammunition import",
    filing: "Import permit",
    form: "ATF Form 6",
    leadTimeDays: 60,
    mandatory: true,
    chapters: ["93", "36"],
    notes: "Permit approval takes months. Nothing about this is fixable at the port.",
  },
  // ── CBP-adjacent programmes ────────────────────────────
  {
    code: "AD_CVD_CHECK",
    agency: "CBP",
    agencyName: "US Customs and Border Protection",
    programme: "Antidumping / countervailing duty",
    filing: "AD/CVD case check and cash deposit rate confirmation",
    leadTimeDays: 5,
    mandatory: false,
    chapters: ["72", "73", "76", "39", "94", "70", "68"],
    notes:
      "Scope rulings reach goods that look out of scope. A missed AD/CVD case is a retroactive liability measured in multiples of the entered value.",
  },
  {
    code: "ISF_10_2",
    agency: "CBP",
    agencyName: "US Customs and Border Protection",
    programme: "Importer Security Filing (10+2)",
    filing: "ISF-10 transmitted before lading",
    leadTimeDays: 2,
    mandatory: true,
    notes:
      "Due no later than 24 hours before the cargo is laden aboard the vessel. Late filing is a $5,000 liquidated-damages claim per violation and is the single most common pre-departure miss.",
    keywords: [],
  },
];

/** Every requirement that applies to one HTS code + description. */
export function requirementsFor(htsCode: string, description = ""): PgaRequirement[] {
  const digits = (htsCode ?? "").replace(/[^0-9]/g, "");
  const chapter = digits.slice(0, 2).padStart(2, "0");
  const heading = digits.slice(0, 4);
  const haystack = description.toLowerCase();

  return PGA_REQUIREMENTS.filter((requirement) => {
    // ISF applies to every ocean line regardless of commodity.
    if (requirement.code === "ISF_10_2") return true;

    if (requirement.headings?.includes(heading)) return true;

    const keywordHit =
      (requirement.keywords?.length ?? 0) > 0 &&
      requirement.keywords!.some((keyword) => haystack.includes(keyword));

    // A heading-scoped requirement must not fire on its whole chapter — that
    // is the point of listing headings. Keywords can still rescue it.
    if (requirement.headings?.length && !keywordHit) return false;

    if (requirement.chapters?.includes(chapter)) return true;

    return keywordHit;
  });
}
