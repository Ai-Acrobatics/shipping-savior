// ============================================================
// UFLPA screening (AI-12017)
//
// The Uyghur Forced Labor Prevention Act creates a *rebuttable presumption*
// that any good mined, produced or manufactured wholly or in part in the
// Xinjiang Uyghur Autonomous Region — or by an entity on the UFLPA Entity
// List — was made with forced labour and is therefore inadmissible under
// 19 U.S.C. 1307.
//
// Three things follow, and they are what this screen is built around:
//
//   1. The presumption is on the importer. There is no de minimis. "Wholly or
//      in part" reaches upstream inputs, which is why an XUAR polysilicon
//      supplier taints a module assembled in a third country.
//   2. Rebutting it requires clear and convincing evidence plus a finding by
//      the Commissioner — an evidence package, not an assertion. So the
//      `hasSupplyChainTraceability` flag downgrades a commodity-risk finding
//      but never clears an Entity List or XUAR-nexus one.
//   3. Detention is the normal outcome, not seizure. The dollar exposure is
//      the entered value tied up plus demurrage, which is why the result
//      carries value-at-risk rather than a duty number.
// ============================================================

import { loadScreeningLists } from "@/lib/data/denied-parties";
import { screenName } from "./denied-party";
import { chapterOf } from "./section301";
import { normalizeName } from "./name-match";
import type {
  ScreeningLineItem,
  ScreeningParty,
  UflpaLineAssessment,
  UflpaRiskBand,
  UflpaScreenResult,
} from "./types";

/**
 * XUAR indicators. Region names and the prefecture/city names that appear on
 * commercial invoices instead of "Xinjiang" — which is the whole point of
 * screening the string rather than a country field.
 */
export const XUAR_INDICATORS = [
  "XINJIANG",
  "XUAR",
  "UYGHUR",
  "UIGHUR",
  "URUMQI",
  "URUMCHI",
  "KASHGAR",
  "KASHI",
  "AKSU",
  "HOTAN",
  "KHOTAN",
  "TURPAN",
  "KORLA",
  "SHIHEZI",
  "KARAMAY",
  "YINING",
  "GHULJA",
  "BINGTUAN",
];

/**
 * High-priority sectors named in the DHS UFLPA enforcement strategy, mapped to
 * the HTS chapters CBP actually detains under. Chapter granularity is coarse
 * on purpose — this screen exists to force a traceability question, and a
 * heading-level table would go stale faster than it would add precision.
 */
export const UFLPA_PRIORITY_SECTORS: {
  sector: string;
  chapters: string[];
  note: string;
}[] = [
  {
    sector: "Cotton and cotton products",
    chapters: ["52", "61", "62", "63"],
    note: "Xinjiang supplies roughly a fifth of world cotton; downstream apparel is the most-detained category.",
  },
  {
    sector: "Polysilicon and solar",
    chapters: ["28", "38", "85"],
    note: "Polysilicon, wafers, cells and modules. Detentions reach modules assembled outside China.",
  },
  {
    sector: "Aluminium",
    chapters: ["76"],
    note: "Added to the enforcement strategy in 2024; reaches automotive and construction parts.",
  },
  {
    sector: "PVC and plastics",
    chapters: ["39"],
    note: "PVC flooring and downstream building products.",
  },
  {
    sector: "Tomato products",
    chapters: ["07", "20"],
    note: "Paste, purée and sauces.",
  },
  {
    sector: "Seafood",
    chapters: ["03", "16"],
    note: "Processing labour transfers, including outside XUAR.",
  },
  {
    sector: "Steel",
    chapters: ["72", "73"],
    note: "Added to the enforcement strategy in 2024.",
  },
];

export function sectorFor(htsCode: string): { sector: string; note: string } | undefined {
  const chapter = chapterOf(htsCode).padStart(2, "0");
  const hit = UFLPA_PRIORITY_SECTORS.find((entry) => entry.chapters.includes(chapter));
  return hit ? { sector: hit.sector, note: hit.note } : undefined;
}

/** Does any free-text field point at the XUAR? */
export function findXuarIndicator(...fields: (string | undefined)[]): string | undefined {
  for (const field of fields) {
    if (!field) continue;
    const normalized = normalizeName(field);
    for (const indicator of XUAR_INDICATORS) {
      if (normalized.includes(indicator)) return indicator;
    }
  }
  return undefined;
}

const BAND_RANK: Record<UflpaRiskBand, number> = {
  low: 0,
  elevated: 1,
  high: 2,
  prohibited: 3,
};

function worse(a: UflpaRiskBand, b: UflpaRiskBand): UflpaRiskBand {
  return BAND_RANK[a] >= BAND_RANK[b] ? a : b;
}

export function screenUflpa(
  lineItems: ScreeningLineItem[],
  parties: ScreeningParty[] = []
): UflpaScreenResult {
  const listEntries = loadScreeningLists().entries;
  const uflpaEntries = listEntries.filter(
    (entry) => entry.source === "DHS-UFLPA-ENTITY-LIST"
  );

  // Party-level XUAR nexus. A shipper in Urumqi taints every line on the
  // shipment even when no individual line names the region.
  const regionNexusParties: UflpaScreenResult["regionNexusParties"] = [];
  parties.forEach((party, partyIndex) => {
    const indicator = findXuarIndicator(party.name, party.address);
    if (indicator) {
      regionNexusParties.push({ partyIndex, partyName: party.name, indicator });
    }
  });

  const lines: UflpaLineAssessment[] = lineItems.map((line, lineIndex) => {
    const reasons: string[] = [];
    let band: UflpaRiskBand = "low";
    let entityListMatch: string | undefined;

    const origin = (line.countryOfOrigin ?? "").trim().toUpperCase();
    const sector = sectorFor(line.htsCode);
    const hasTraceability = Boolean(line.hasSupplyChainTraceability);

    // 1. Entity List — the strongest signal, and the one with no rebuttal
    //    short of the entity being removed from the list.
    if (line.manufacturerName) {
      const [top] = screenName(line.manufacturerName, uflpaEntries);
      if (top && top.strength !== "possible") {
        band = "prohibited";
        entityListMatch = top.entry.name;
        reasons.push(
          `Manufacturer matches UFLPA Entity List record "${top.entry.name}" ` +
            `(${top.scorePct}% — ${top.entry.citation ?? top.entry.program}).`
        );
      }
    }

    // 2. XUAR nexus on the line itself.
    const lineIndicator = findXuarIndicator(
      line.manufacturerRegion,
      line.manufacturerName,
      line.description
    );
    if (lineIndicator) {
      band = worse(band, "prohibited");
      reasons.push(
        `"${lineIndicator}" appears in the manufacturing details — direct XUAR nexus, ` +
          "rebuttable presumption applies."
      );
    }

    // 3. XUAR nexus inherited from a party on the shipment.
    if (regionNexusParties.length > 0 && band !== "prohibited") {
      band = worse(band, "high");
      reasons.push(
        `Shipment party "${regionNexusParties[0].partyName}" has an XUAR indicator ` +
          `("${regionNexusParties[0].indicator}"); upstream inputs on this line have to be traced.`
      );
    }

    // 4. High-priority commodity out of China with no traceability package.
    if (sector && origin === "CN") {
      band = worse(band, hasTraceability ? "elevated" : "high");
      reasons.push(
        `${sector.sector} is a UFLPA high-priority sector. ${sector.note}` +
          (hasTraceability
            ? " A traceability package is on file — keep it entry-ready."
            : " No traceability package on file for this line.")
      );
    } else if (sector && origin !== "CN" && origin !== "US") {
      // The third-country case: the module is assembled in Vietnam, the
      // polysilicon is not. "Wholly or in part" is what makes this live.
      band = worse(band, hasTraceability ? "low" : "elevated");
      reasons.push(
        `${sector.sector} declared ${origin || "unknown origin"}. UFLPA reaches inputs ` +
          `"wholly or in part" from the XUAR, so third-country assembly does not by itself clear it.` +
          (hasTraceability ? " Traceability package on file." : "")
      );
    }

    const atRisk = band === "prohibited" || band === "high";

    return {
      lineIndex,
      description: line.description,
      htsCode: line.htsCode,
      countryOfOrigin: origin,
      band,
      sector: sector?.sector,
      reasons,
      entityListMatch,
      hasTraceability,
      valueAtRiskUsd: atRisk ? Math.max(0, line.valueUsd) : 0,
    };
  });

  const highestBand = lines.reduce<UflpaRiskBand>(
    (acc, line) => worse(acc, line.band),
    "low"
  );

  return {
    lines,
    highestBand,
    valueAtRiskUsd: lines.reduce((sum, line) => sum + line.valueAtRiskUsd, 0),
    regionNexusParties,
  };
}
