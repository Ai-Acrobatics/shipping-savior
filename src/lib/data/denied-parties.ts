// ============================================================
// Denied Party Screening Lists — seed dataset (AI-12017)
//
// READ THIS BEFORE RELYING ON A "NO HITS" RESULT.
//
// What ships in this file is a *seed* list: a small, illustrative set of
// well-known public listings used so the screening engine has something real
// to match against out of the box. It is NOT the consolidated screening list,
// and a clean result against it is not a compliance clearance.
//
// The production path is the same one the HTS dataset uses:
//
//   npm run load:denied-parties     →  data/denied-parties.json
//
// which pulls the International Trade Administration's Consolidated Screening
// List (OFAC SDN + Non-SDN, BIS Entity/Denied Persons/Unverified, State
// debarred, DHS UFLPA Entity List) — a free public dataset. When that file is
// present it replaces this seed entirely and `seedData` flips to false, which
// is what removes the caveat the UI prints beside a CLEAR verdict.
//
// Sanctions lists change weekly. Treat a stale export as an unscreened
// shipment: `loadScreeningLists()` reports the export date so callers can.
// ============================================================

import * as fs from "fs";
import * as path from "path";
import type {
  ScreeningListEntry,
  ScreeningListSource,
  ScreeningCoverage,
} from "@/lib/compliance/types";

// ─── Sanctioned jurisdictions ─────────────────────────────
//
// Country-level exposure is separate from name-level screening: a party can be
// on no list at all and still be unshippable because of where it sits.

export interface SanctionedJurisdiction {
  code: string;
  name: string;
  programme: string;
  embargoType: "comprehensive" | "targeted" | "region";
  summary: string;
}

export const SANCTIONED_JURISDICTIONS: SanctionedJurisdiction[] = [
  {
    code: "CU",
    name: "Cuba",
    programme: "31 CFR Part 515 (CACR)",
    embargoType: "comprehensive",
    summary:
      "Comprehensive embargo. Exports and re-exports require OFAC authorisation or an established exception.",
  },
  {
    code: "IR",
    name: "Iran",
    programme: "31 CFR Part 560 (ITSR)",
    embargoType: "comprehensive",
    summary:
      "Comprehensive embargo covering goods, services and technology, including transactions by non-US persons that touch US-origin content.",
  },
  {
    code: "KP",
    name: "North Korea",
    programme: "31 CFR Part 510 (NKSR)",
    embargoType: "comprehensive",
    summary:
      "Comprehensive embargo. Goods produced with North Korean labour anywhere are presumed prohibited under CAATSA section 321(b).",
  },
  {
    code: "SY",
    name: "Syria",
    programme: "31 CFR Part 542 (SySR)",
    embargoType: "comprehensive",
    summary: "Broad prohibitions on exports, re-exports and new investment.",
  },
  {
    code: "RU",
    name: "Russia",
    programme: "31 CFR Part 587 / EO 14024 / EAR 746.8",
    embargoType: "targeted",
    summary:
      "Extensive sectoral and entity-based restrictions plus an import ban on specified categories. Screen the counterparty and the commodity, not just the country.",
  },
  {
    code: "BY",
    name: "Belarus",
    programme: "EO 14038 / EAR 746.8",
    embargoType: "targeted",
    summary: "Sectoral restrictions parallel to the Russia programme.",
  },
  {
    code: "AF",
    name: "Afghanistan",
    programme: "EAR 746.x / OFAC counter-terrorism authorities",
    embargoType: "targeted",
    summary:
      "Licence requirements for most items; counterparty screening is mandatory rather than advisory.",
  },
];

/** Region strings that carry their own restrictions independent of the country. */
export const RESTRICTED_REGION_INDICATORS: { indicator: string; label: string; programme: string }[] = [
  { indicator: "CRIMEA", label: "Crimea", programme: "EO 13685" },
  { indicator: "DONETSK", label: "Donetsk (DNR)", programme: "EO 14065" },
  { indicator: "LUHANSK", label: "Luhansk (LNR)", programme: "EO 14065" },
  { indicator: "ZAPORIZHZHIA", label: "Zaporizhzhia", programme: "EO 14065" },
  { indicator: "KHERSON", label: "Kherson", programme: "EO 14065" },
];

// ─── Seed screening list ──────────────────────────────────
//
// Long-standing, widely-reported public listings. Each carries its citation so
// a hit can be traced back to the source rather than trusted on our say-so.

export const SEED_SCREENING_LIST: ScreeningListEntry[] = [
  // ── OFAC SDN — Iran
  {
    id: "sdn-irgc",
    name: "Islamic Revolutionary Guard Corps",
    aliases: ["IRGC", "Iranian Revolutionary Guard Corps", "Sepah-e Pasdaran-e Enghelab-e Islami"],
    source: "OFAC-SDN",
    program: "IRAN / SDGT",
    countries: ["IR"],
    citation: "OFAC SDN — designated 13 Oct 2017 (EO 13224)",
    remarks: "Designated as a Foreign Terrorist Organization in April 2019.",
  },
  {
    id: "sdn-nioc",
    name: "National Iranian Oil Company",
    aliases: ["NIOC"],
    source: "OFAC-SDN",
    program: "IRAN",
    countries: ["IR"],
    citation: "OFAC SDN — EO 13224 designation 20 Oct 2020",
  },
  {
    id: "sdn-islamic-republic-shipping",
    name: "Islamic Republic of Iran Shipping Lines",
    aliases: ["IRISL", "IRISL Group"],
    source: "OFAC-SDN",
    program: "IRAN / NPWMD",
    countries: ["IR"],
    citation: "OFAC SDN — EO 13382",
    remarks: "Carrier-level designation. Screen the vessel operator, not only the shipper.",
  },
  // ── OFAC SDN — Russia
  {
    id: "sdn-sberbank",
    name: "Sberbank of Russia",
    aliases: ["Sberbank", "Public Joint Stock Company Sberbank of Russia"],
    source: "OFAC-SDN",
    program: "RUSSIA-EO14024",
    countries: ["RU"],
    citation: "OFAC SDN — blocked 6 Apr 2022",
  },
  {
    id: "sdn-vtb",
    name: "VTB Bank Public Joint Stock Company",
    aliases: ["VTB Bank", "Bank VTB"],
    source: "OFAC-SDN",
    program: "RUSSIA-EO14024",
    countries: ["RU"],
    citation: "OFAC SDN — blocked 24 Feb 2022",
  },
  {
    id: "sdn-sovcomflot",
    name: "Sovcomflot",
    aliases: ["PAO Sovcomflot", "SCF Group"],
    source: "OFAC-SDN",
    program: "RUSSIA-EO14024",
    countries: ["RU"],
    citation: "OFAC SDN — designated 22 Feb 2024",
    remarks: "State shipping company. Vessel-level identifiers accompany the entity listing.",
  },
  // ── OFAC SDN — North Korea
  {
    id: "sdn-korea-kumsan",
    name: "Korea Kumsan Trading Corporation",
    aliases: ["Korea Kumsan Trading Corp"],
    source: "OFAC-SDN",
    program: "DPRK",
    countries: ["KP"],
    citation: "OFAC SDN — EO 13382",
  },
  // ── BIS Entity List
  {
    id: "el-huawei",
    name: "Huawei Technologies Co., Ltd.",
    aliases: ["Huawei", "Huawei Technologies"],
    source: "BIS-ENTITY-LIST",
    program: "ENTITY LIST — Supplement No. 4 to Part 744",
    countries: ["CN"],
    citation: "84 FR 22961 (21 May 2019)",
    remarks: "Footnote 1 entity; foreign direct product rule applies.",
  },
  {
    id: "el-smic",
    name: "Semiconductor Manufacturing International Corporation",
    aliases: ["SMIC", "Semiconductor Manufacturing International Corp"],
    source: "BIS-ENTITY-LIST",
    program: "ENTITY LIST — Supplement No. 4 to Part 744",
    countries: ["CN"],
    citation: "85 FR 83416 (22 Dec 2020)",
  },
  {
    id: "el-hikvision",
    name: "Hangzhou Hikvision Digital Technology Co., Ltd.",
    aliases: ["Hikvision", "Hangzhou Hikvision"],
    source: "BIS-ENTITY-LIST",
    program: "ENTITY LIST — Supplement No. 4 to Part 744",
    countries: ["CN"],
    citation: "84 FR 54002 (9 Oct 2019)",
  },
  {
    id: "el-dahua",
    name: "Zhejiang Dahua Technology Co., Ltd.",
    aliases: ["Dahua Technology", "Dahua"],
    source: "BIS-ENTITY-LIST",
    program: "ENTITY LIST — Supplement No. 4 to Part 744",
    countries: ["CN"],
    citation: "84 FR 54002 (9 Oct 2019)",
  },
  {
    id: "el-inspur",
    name: "Inspur Group Co., Ltd.",
    aliases: ["Inspur Group", "Inspur"],
    source: "BIS-ENTITY-LIST",
    program: "ENTITY LIST — Supplement No. 4 to Part 744",
    countries: ["CN"],
    citation: "88 FR 12150 (2 Mar 2023)",
  },
  // ── DHS UFLPA Entity List
  {
    id: "uflpa-xpcc",
    name: "Xinjiang Production and Construction Corps",
    aliases: ["XPCC", "Bingtuan"],
    source: "DHS-UFLPA-ENTITY-LIST",
    program: "UFLPA — Section 2(d)(2)(B)(i)",
    countries: ["CN"],
    citation: "87 FR 37524 (21 Jun 2022)",
    remarks: "Cotton, tomato and downstream goods. Rebuttable presumption applies.",
  },
  {
    id: "uflpa-hoshine",
    name: "Hoshine Silicon Industry Co., Ltd.",
    aliases: ["Hoshine Silicon", "Hoshine Silicon Industry (Shanshan)"],
    source: "DHS-UFLPA-ENTITY-LIST",
    program: "UFLPA — Section 2(d)(2)(B)(i)",
    countries: ["CN"],
    citation: "87 FR 37524 (21 Jun 2022)",
    remarks: "Metallurgical-grade silicon; polysilicon and solar supply chain.",
  },
  {
    id: "uflpa-esquel",
    name: "Changji Esquel Textile Co., Ltd.",
    aliases: ["Changji Esquel", "Esquel Textile"],
    source: "DHS-UFLPA-ENTITY-LIST",
    program: "UFLPA — Section 2(d)(2)(B)(i)",
    countries: ["CN"],
    citation: "87 FR 37524 (21 Jun 2022)",
    remarks: "Apparel and cotton yarn.",
  },
  {
    id: "uflpa-ninestar",
    name: "Ninestar Corporation",
    aliases: ["Ninestar", "Zhuhai Ninestar"],
    source: "DHS-UFLPA-ENTITY-LIST",
    program: "UFLPA — Section 2(d)(2)(B)(ii)",
    countries: ["CN"],
    citation: "88 FR 38080 (12 Jun 2023)",
    remarks: "Printer consumables and electronics.",
  },
  {
    id: "uflpa-camel",
    name: "Camel Group Co., Ltd.",
    aliases: ["Camel Group", "Camel Power"],
    source: "DHS-UFLPA-ENTITY-LIST",
    program: "UFLPA — Section 2(d)(2)(B)(ii)",
    countries: ["CN"],
    citation: "88 FR 38080 (12 Jun 2023)",
    remarks: "Lead-acid batteries; automotive supply chain.",
  },
  // ── BIS Denied Persons
  {
    id: "dpl-mahan-air",
    name: "Mahan Airways",
    aliases: ["Mahan Air"],
    source: "BIS-DENIED-PERSONS",
    program: "DENIED PERSONS LIST",
    countries: ["IR"],
    citation: "BIS Denied Persons List — Temporary Denial Order, renewed periodically",
  },
];

// ─── Loader ───────────────────────────────────────────────

interface ScreeningListFile {
  exportedAt?: string;
  source?: string;
  entries: ScreeningListEntry[];
}

let cached: { entries: ScreeningListEntry[]; coverage: ScreeningCoverage } | null = null;

const SEED_CAVEAT =
  "Screened against the bundled seed list only. This is an illustrative subset, " +
  "not the consolidated screening list — run `npm run load:denied-parties` and " +
  "re-screen before treating any party as cleared.";

function buildCoverage(
  entries: ScreeningListEntry[],
  seedData: boolean,
  listVersion: string
): ScreeningCoverage {
  const sources = Array.from(
    new Set(entries.map((entry) => entry.source))
  ) as ScreeningListSource[];
  return {
    listRecordCount: entries.length,
    sources: sources.sort(),
    seedData,
    listVersion,
    caveat: seedData
      ? SEED_CAVEAT
      : `Screened against the consolidated screening list export of ${listVersion}. ` +
        "Sanctions lists change weekly — re-screen if this export is more than seven days old.",
  };
}

/**
 * Load the screening lists, preferring a refreshed export on disk.
 *
 * Cached for the life of the process: the file is a build/cron artefact, not
 * per-request state. Call `resetScreeningListCache()` in tests.
 */
export function loadScreeningLists(): {
  entries: ScreeningListEntry[];
  coverage: ScreeningCoverage;
} {
  if (cached) return cached;

  const filePath = path.join(process.cwd(), "data", "denied-parties.json");
  try {
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8")) as ScreeningListFile;
      if (Array.isArray(parsed.entries) && parsed.entries.length > 0) {
        cached = {
          entries: parsed.entries,
          coverage: buildCoverage(parsed.entries, false, parsed.exportedAt ?? "unknown date"),
        };
        return cached;
      }
    }
  } catch (error) {
    // A malformed export must not silently degrade to "nothing matched" —
    // fall back to the seed and let the caveat say so.
    console.error("[denied-parties] Failed to read data/denied-parties.json:", error);
  }

  cached = {
    entries: SEED_SCREENING_LIST,
    coverage: buildCoverage(SEED_SCREENING_LIST, true, "bundled seed"),
  };
  return cached;
}

export function resetScreeningListCache(): void {
  cached = null;
}

export function getSanctionedJurisdiction(
  countryCode: string | undefined
): SanctionedJurisdiction | undefined {
  if (!countryCode) return undefined;
  const code = countryCode.trim().toUpperCase();
  return SANCTIONED_JURISDICTIONS.find((j) => j.code === code);
}
