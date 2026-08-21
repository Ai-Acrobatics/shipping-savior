/**
 * Unit tests for the compliance screening agent (AI-12017).
 *
 * Pure functions — no DB, no network. The screening lists come from the
 * bundled seed (data/denied-parties.json is absent in CI), so the fixtures
 * name seed entities on purpose; `resetScreeningListCache()` keeps that
 * assumption honest if a refreshed export ever lands in the repo.
 *
 * What is locked down:
 *   - name matching survives legal-form noise, word order and transliteration,
 *     and does NOT collapse distinct companies into each other
 *   - a denied-party hit blocks; a merely "possible" hit does not
 *   - sanctioned jurisdictions block independent of any name match
 *   - Section 301 duty matches the shared rate table, and an exclusion zeroes
 *     the duty without clearing the line
 *   - transshipment detection fires on the pivot pattern and stays quiet
 *     otherwise
 *   - UFLPA Entity List and XUAR nexus are non-rebuttable by a traceability
 *     flag; commodity risk is
 *   - PGA lead times turn into blocks only when the departure date proves it
 *   - verdict is driven by findings, never by the score
 *   - input guards throw instead of silently dropping a party
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  ComplianceInputError,
  buildExposure,
  chapterOf,
  daysBetween,
  findXuarIndicator,
  gradeFor,
  isBlockingHit,
  ISF_LIQUIDATED_DAMAGES_USD,
  nameMatchScore,
  nameTokens,
  normalizeName,
  PENALTY_MULTIPLE_GROSS_NEGLIGENCE,
  screenName,
  screenParties,
  screenPga,
  screenSection301,
  screenShipment,
  screenUflpa,
  scoreFindings,
  section301RateFor,
  sectorFor,
  strengthFor,
  verdictFor,
  type ComplianceFinding,
  type ComplianceScreeningInput,
  type ScreeningLineItem,
  type ScreeningParty,
} from "./index";
import { resetScreeningListCache } from "@/lib/data/denied-parties";

beforeEach(() => {
  resetScreeningListCache();
});

// ─────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────

const cleanParties: ScreeningParty[] = [
  { name: "Mekong Textile Export JSC", role: "shipper", country: "VN" },
  { name: "Harbor Goods LLC", role: "consignee", country: "US" },
];

const cleanLine: ScreeningLineItem = {
  description: "Steel shelving brackets",
  htsCode: "7326.90.86",
  countryOfOrigin: "VN",
  valueUsd: 100_000,
};

function shipment(
  overrides: Partial<ComplianceScreeningInput> = {}
): ComplianceScreeningInput {
  return {
    parties: cleanParties,
    lineItems: [cleanLine],
    evaluationDate: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────
// Name matching
// ─────────────────────────────────────────────────────────

describe("name normalisation", () => {
  it("folds punctuation, case and diacritics", () => {
    expect(normalizeName("Société Générale, S.A.")).toBe("SOCIETE GENERALE S A");
  });

  it("expands ampersands so token matching sees a word", () => {
    expect(normalizeName("Smith & Sons")).toBe("SMITH AND SONS");
  });

  it("drops legal-form tokens but keeps descriptive ones", () => {
    expect(nameTokens("Hoshine Silicon Industry Co., Ltd.")).toEqual([
      "HOSHINE",
      "SILICON",
      "INDUSTRY",
    ]);
  });
});

describe("nameMatchScore", () => {
  it("scores an identical name 100", () => {
    expect(nameMatchScore("Sberbank of Russia", "Sberbank of Russia")).toBe(100);
  });

  it("scores 100 once legal forms are stripped", () => {
    expect(nameMatchScore("Sberbank", "Sberbank Ltd.")).toBe(100);
  });

  it("survives transliteration drift", () => {
    // Sovcomflot / Sovkomflot — one character, mid-string.
    expect(nameMatchScore("Sovkomflot", "Sovcomflot")).toBeGreaterThan(85);
  });

  it("finds a listed name embedded in a longer typed name", () => {
    expect(
      nameMatchScore(
        "Hangzhou Hikvision Digital Technology Company Limited",
        "Hangzhou Hikvision Digital Technology Co., Ltd."
      )
    ).toBeGreaterThanOrEqual(92);
  });

  it("does not collapse two different companies that share a word", () => {
    // The failure mode that makes analysts switch screening off.
    expect(nameMatchScore("Pacific Silicon Trading", "Hoshine Silicon Industry")).toBeLessThan(78);
  });

  it("does not let a generic fragment match a long listed entity", () => {
    expect(
      nameMatchScore("Group", "Xinjiang Production and Construction Corps")
    ).toBeLessThan(78);
  });

  it("returns 0 for an empty query", () => {
    expect(nameMatchScore("", "Sberbank")).toBe(0);
  });
});

describe("strength bands", () => {
  it("maps scores to bands at the documented thresholds", () => {
    expect(strengthFor(100)).toBe("exact");
    expect(strengthFor(95)).toBe("strong");
    expect(strengthFor(86)).toBe("probable");
    expect(strengthFor(79)).toBe("possible");
    expect(strengthFor(60)).toBe("none");
  });
});

// ─────────────────────────────────────────────────────────
// Denied party
// ─────────────────────────────────────────────────────────

describe("denied-party screening", () => {
  it("hits an SDN entity by its primary name", () => {
    const [top] = screenName("Sberbank of Russia");
    expect(top).toBeDefined();
    expect(top.entry.source).toBe("OFAC-SDN");
    expect(top.strength).toBe("exact");
  });

  it("hits by alias, and reports which string matched", () => {
    const [top] = screenName("IRGC");
    expect(top.entry.name).toBe("Islamic Revolutionary Guard Corps");
    expect(top.matchedAgainst).toBe("IRGC");
  });

  it("returns nothing for an unrelated name", () => {
    expect(screenName("Mekong Textile Export JSC")).toHaveLength(0);
  });

  it("blocks on probable-or-better and not on possible", () => {
    expect(
      isBlockingHit({
        partyIndex: 0,
        partyName: "x",
        partyRole: "shipper",
        entry: { id: "a", name: "a", source: "OFAC-SDN", program: "p" },
        scorePct: 86,
        strength: "probable",
        matchedAgainst: "a",
      })
    ).toBe(true);
    expect(
      isBlockingHit({
        partyIndex: 0,
        partyName: "x",
        partyRole: "shipper",
        entry: { id: "a", name: "a", source: "OFAC-SDN", program: "p" },
        scorePct: 79,
        strength: "possible",
        matchedAgainst: "a",
      })
    ).toBe(false);
  });

  it("flags a comprehensively-embargoed jurisdiction with no name hit at all", () => {
    const result = screenParties([
      { name: "Perfectly Ordinary Trading House", role: "consignee", country: "IR" },
    ]);
    expect(result.hits).toHaveLength(0);
    expect(result.jurisdictionHits[0].embargoType).toBe("comprehensive");
  });

  it("catches a restricted region hiding in the address", () => {
    const result = screenParties([
      {
        name: "Black Sea Logistics",
        role: "shipper",
        country: "UA",
        address: "14 Portovaya St, Sevastopol, Crimea",
      },
    ]);
    expect(result.jurisdictionHits[0].embargoType).toBe("region");
    expect(result.jurisdictionHits[0].countryName).toBe("Crimea");
  });
});

// ─────────────────────────────────────────────────────────
// Section 301
// ─────────────────────────────────────────────────────────

describe("Section 301", () => {
  it("derives the chapter from a dotted HTS code", () => {
    expect(chapterOf("8471.30.01")).toBe("84");
  });

  it("applies the shared rate table to China origin", () => {
    expect(section301RateFor("8471.30.01", "CN")).toBe(25);
    expect(section301RateFor("6203.42.40", "CN")).toBe(7.5);
  });

  it("does not apply to a non-China origin", () => {
    expect(section301RateFor("8471.30.01", "VN")).toBe(0);
  });

  it("prices the additional duty on the entered value", () => {
    const result = screenSection301([
      { description: "Servers", htsCode: "8471.50.01", countryOfOrigin: "CN", valueUsd: 400_000 },
    ]);
    expect(result.totalAdditionalDutyUsd).toBe(100_000);
    expect(result.linesInScope).toBe(1);
    expect(result.lines[0].list).toContain("List 1/3");
  });

  it("zeroes the duty on a claimed exclusion but keeps the line in scope", () => {
    const result = screenSection301([
      {
        description: "Servers",
        htsCode: "8471.50.01",
        countryOfOrigin: "CN",
        valueUsd: 400_000,
        section301ExclusionClaimed: true,
      },
    ]);
    expect(result.totalAdditionalDutyUsd).toBe(0);
    expect(result.linesInScope).toBe(1);
    expect(result.lines[0].exclusionClaimed).toBe(true);
  });

  it("flags the pivot: non-China origin on a 301 chapter with a China-based party", () => {
    const result = screenSection301(
      [{ description: "Steel brackets", htsCode: "7326.90.86", countryOfOrigin: "VN", valueUsd: 200_000 }],
      [{ name: "Ningbo Metalworks", role: "supplier", country: "CN" }]
    );
    expect(result.transshipmentFlags).toBe(1);
    expect(result.lines[0].transshipmentReason).toContain("China-based party");
  });

  it("flags the pivot from a Chinese city in the manufacturer name", () => {
    const result = screenSection301([
      {
        description: "Steel brackets",
        htsCode: "7326.90.86",
        countryOfOrigin: "VN",
        valueUsd: 200_000,
        manufacturerName: "Dongguan Precision Metal Works",
      },
    ]);
    expect(result.transshipmentFlags).toBe(1);
  });

  it("stays quiet when the origin is genuinely third-country", () => {
    const result = screenSection301(
      [{ description: "Steel brackets", htsCode: "7326.90.86", countryOfOrigin: "VN", valueUsd: 200_000 }],
      [{ name: "Mekong Metalworks", role: "supplier", country: "VN" }]
    );
    expect(result.transshipmentFlags).toBe(0);
  });

  it("does not flag China-declared goods as transshipment", () => {
    const result = screenSection301(
      [{ description: "Steel brackets", htsCode: "7326.90.86", countryOfOrigin: "CN", valueUsd: 200_000 }],
      [{ name: "Ningbo Metalworks", role: "supplier", country: "CN" }]
    );
    expect(result.transshipmentFlags).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────
// UFLPA
// ─────────────────────────────────────────────────────────

describe("UFLPA", () => {
  it("maps high-priority chapters to their sector", () => {
    expect(sectorFor("6203.42.40")?.sector).toBe("Cotton and cotton products");
    expect(sectorFor("7601.10.30")?.sector).toBe("Aluminium");
    expect(sectorFor("8471.50.01")).toBeUndefined();
  });

  it("finds an XUAR indicator in a city name, not just the province", () => {
    expect(findXuarIndicator("Kashgar Industrial Park")).toBe("KASHGAR");
    expect(findXuarIndicator("Hangzhou Industrial Park")).toBeUndefined();
  });

  it("treats an Entity List manufacturer as prohibited", () => {
    const result = screenUflpa([
      {
        description: "Solar cells",
        htsCode: "8541.43.00",
        countryOfOrigin: "CN",
        valueUsd: 900_000,
        manufacturerName: "Hoshine Silicon Industry Co., Ltd.",
      },
    ]);
    expect(result.highestBand).toBe("prohibited");
    expect(result.lines[0].entityListMatch).toContain("Hoshine");
    expect(result.valueAtRiskUsd).toBe(900_000);
  });

  it("does not let a traceability flag rebut an Entity List match", () => {
    const result = screenUflpa([
      {
        description: "Solar cells",
        htsCode: "8541.43.00",
        countryOfOrigin: "CN",
        valueUsd: 900_000,
        manufacturerName: "Hoshine Silicon Industry Co., Ltd.",
        hasSupplyChainTraceability: true,
      },
    ]);
    expect(result.highestBand).toBe("prohibited");
  });

  it("treats a direct XUAR nexus as prohibited", () => {
    const result = screenUflpa([
      {
        description: "Cotton shirts",
        htsCode: "6205.20.20",
        countryOfOrigin: "CN",
        valueUsd: 250_000,
        manufacturerRegion: "Urumqi, Xinjiang",
      },
    ]);
    expect(result.lines[0].band).toBe("prohibited");
  });

  it("downgrades commodity risk when a traceability package is on file", () => {
    const base = {
      description: "Cotton shirts",
      htsCode: "6205.20.20",
      countryOfOrigin: "CN",
      valueUsd: 250_000,
    };
    expect(screenUflpa([base]).lines[0].band).toBe("high");
    expect(
      screenUflpa([{ ...base, hasSupplyChainTraceability: true }]).lines[0].band
    ).toBe("elevated");
  });

  it("does not clear a third-country assembly of a priority commodity", () => {
    const result = screenUflpa([
      {
        description: "Solar modules",
        htsCode: "8541.43.00",
        countryOfOrigin: "VN",
        valueUsd: 500_000,
      },
    ]);
    expect(result.lines[0].band).toBe("elevated");
    expect(result.lines[0].reasons.join(" ")).toContain("wholly or in part");
  });

  it("propagates an XUAR party nexus onto every line", () => {
    const result = screenUflpa(
      [{ description: "Servers", htsCode: "8471.50.01", countryOfOrigin: "CN", valueUsd: 300_000 }],
      [{ name: "Urumqi Trading Co", role: "shipper", country: "CN" }]
    );
    expect(result.regionNexusParties).toHaveLength(1);
    expect(result.lines[0].band).toBe("high");
  });

  it("leaves an unrelated commodity alone", () => {
    const result = screenUflpa([cleanLine]);
    // Steel is a priority sector but the origin is Vietnam with no other signal.
    expect(result.lines[0].band).toBe("elevated");
    expect(result.valueAtRiskUsd).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────
// PGA routing
// ─────────────────────────────────────────────────────────

describe("PGA routing", () => {
  it("routes food to FDA and always includes ISF", () => {
    const result = screenPga([
      { description: "Canned tomato paste", htsCode: "2002.90.80", countryOfOrigin: "IT", valueUsd: 50_000 },
    ]);
    expect(result.agencies).toContain("FDA");
    expect(result.requirements.some((hit) => hit.code === "ISF_10_2")).toBe(true);
  });

  it("does not fire a heading-scoped requirement on its whole chapter", () => {
    // 8471 is chapter 85's neighbour; FCC is scoped to radio headings only.
    const result = screenPga([
      { description: "Steel brackets", htsCode: "7326.90.86", countryOfOrigin: "VN", valueUsd: 10_000 },
    ]);
    expect(result.requirements.some((hit) => hit.code === "FCC_RF")).toBe(false);
  });

  it("fires FCC on a radio heading", () => {
    const result = screenPga([
      { description: "Wi-Fi router", htsCode: "8517.62.00", countryOfOrigin: "CN", valueUsd: 80_000 },
    ]);
    expect(result.requirements.some((hit) => hit.code === "FCC_RF")).toBe(true);
  });

  it("fires a keyword requirement outside its chapter list", () => {
    const result = screenPga([
      { description: "Children's wooden toy blocks", htsCode: "9503.00.00", countryOfOrigin: "CN", valueUsd: 40_000 },
    ]);
    expect(result.requirements.some((hit) => hit.code === "CPSC_CPC")).toBe(true);
  });

  it("counts a filing as satisfied when it is on file", () => {
    const result = screenPga([
      {
        description: "Canned tomato paste",
        htsCode: "2002.90.80",
        countryOfOrigin: "IT",
        valueUsd: 50_000,
        pgaDocumentsOnFile: ["FDA_PRIOR_NOTICE", "FDA_FSVP", "ISF_10_2", "AD_CVD_CHECK"],
      },
    ]);
    expect(result.missingMandatory).toBe(0);
  });

  it("reports days to departure and the longest missing lead time", () => {
    const result = screenPga(
      [{ description: "Sporting rifle", htsCode: "9303.30.40", countryOfOrigin: "IT", valueUsd: 60_000 }],
      { departureDate: "2026-08-10T00:00:00.000Z", evaluationDate: "2026-08-01T00:00:00.000Z" }
    );
    expect(result.daysUntilDeparture).toBe(9);
    expect(result.maxLeadTimeDays).toBe(60); // ATF Form 6
  });

  it("returns a null departure gap when no date is supplied", () => {
    expect(screenPga([cleanLine]).daysUntilDeparture).toBeNull();
  });

  it("computes calendar days without DST drift", () => {
    expect(daysBetween("2026-03-01T00:00:00.000Z", "2026-03-15T00:00:00.000Z")).toBe(14);
    expect(daysBetween("nonsense", "2026-03-15T00:00:00.000Z")).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────
// Scoring and exposure
// ─────────────────────────────────────────────────────────

describe("scoring", () => {
  const finding = (severity: ComplianceFinding["severity"]): ComplianceFinding => ({
    id: severity,
    screen: "pga",
    severity,
    title: "t",
    detail: "d",
    authority: "a",
    subject: { type: "shipment", index: -1, label: "Shipment" },
    remediation: "r",
  });

  it("never goes below zero", () => {
    expect(scoreFindings(Array.from({ length: 20 }, () => finding("block")))).toBe(0);
  });

  it("is 100 with no findings", () => {
    expect(scoreFindings([])).toBe(100);
  });

  it("grades on the documented bands", () => {
    expect(gradeFor(100)).toBe("A");
    expect(gradeFor(80)).toBe("B");
    expect(gradeFor(66)).toBe("C");
    expect(gradeFor(51)).toBe("D");
    expect(gradeFor(10)).toBe("F");
  });

  it("lets one blocking finding decide the verdict regardless of the score", () => {
    expect(verdictFor([finding("block")])).toBe("BLOCKED");
    expect(scoreFindings([finding("block")])).toBeGreaterThan(50);
  });

  it("orders verdicts block > warn > clear", () => {
    expect(verdictFor([finding("warn"), finding("advisory")])).toBe("REVIEW");
    expect(verdictFor([finding("advisory")])).toBe("CLEAR");
    expect(verdictFor([])).toBe("CLEAR");
  });
});

describe("exposure model", () => {
  it("does not treat correctly-declared 301 duty as a penalty", () => {
    const exposure = buildExposure({
      additionalDutyUsd: 100_000,
      uflpaValueAtRiskUsd: 0,
      holdIncidents: 0,
      isfShortfall: false,
      transshipmentDutyUsd: 0,
    });
    expect(exposure.additionalDutyUsd).toBe(100_000);
    expect(exposure.penaltyUsd).toBe(0);
  });

  it("applies the gross-negligence multiple to an origin-flagged duty loss", () => {
    const exposure = buildExposure({
      additionalDutyUsd: 0,
      uflpaValueAtRiskUsd: 0,
      holdIncidents: 0,
      isfShortfall: false,
      transshipmentDutyUsd: 50_000,
    });
    expect(exposure.penaltyUsd).toBe(50_000 * PENALTY_MULTIPLE_GROSS_NEGLIGENCE);
  });

  it("adds statutory ISF liquidated damages on top", () => {
    const exposure = buildExposure({
      additionalDutyUsd: 0,
      uflpaValueAtRiskUsd: 0,
      holdIncidents: 0,
      isfShortfall: true,
      transshipmentDutyUsd: 0,
    });
    expect(exposure.penaltyUsd).toBe(ISF_LIQUIDATED_DAMAGES_USD);
  });

  it("totals every component and explains each one", () => {
    const exposure = buildExposure({
      additionalDutyUsd: 10_000,
      uflpaValueAtRiskUsd: 200_000,
      holdIncidents: 2,
      isfShortfall: false,
      transshipmentDutyUsd: 0,
    });
    expect(exposure.totalUsd).toBe(
      exposure.additionalDutyUsd +
        exposure.penaltyUsd +
        exposure.holdCostUsd +
        exposure.valueAtRiskUsd
    );
    expect(exposure.basis.length).toBeGreaterThanOrEqual(3);
  });
});

// ─────────────────────────────────────────────────────────
// End-to-end
// ─────────────────────────────────────────────────────────

describe("screenShipment", () => {
  it("blocks on a denied-party hit and says so in the summary", () => {
    const result = screenShipment(
      shipment({
        parties: [
          { name: "Sberbank of Russia", role: "consignee", country: "RU" },
          ...cleanParties,
        ],
      })
    );
    expect(result.verdict).toBe("BLOCKED");
    expect(result.summary).toContain("Do not sail");
    expect(result.findings[0].severity).toBe("block");
  });

  it("blocks on a comprehensively-embargoed jurisdiction alone", () => {
    const result = screenShipment(
      shipment({
        parties: [{ name: "Anonymous Trading House", role: "consignee", country: "IR" }],
      })
    );
    expect(result.verdict).toBe("BLOCKED");
    expect(
      result.findings.some((finding) => finding.screen === "sanctioned-jurisdiction")
    ).toBe(true);
  });

  it("puts a UFLPA Entity List line into BLOCKED with value at risk priced", () => {
    const result = screenShipment(
      shipment({
        lineItems: [
          {
            description: "Solar modules",
            htsCode: "8541.43.00",
            countryOfOrigin: "CN",
            valueUsd: 750_000,
            manufacturerName: "Hoshine Silicon Industry Co Ltd",
          },
        ],
      })
    );
    expect(result.verdict).toBe("BLOCKED");
    expect(result.exposure.valueAtRiskUsd).toBe(750_000);
    expect(result.exposure.totalUsd).toBeGreaterThan(750_000);
  });

  it("blocks a mandatory filing that is already past its window", () => {
    const result = screenShipment(
      shipment({
        lineItems: [
          { description: "Sporting rifle", htsCode: "9303.30.40", countryOfOrigin: "IT", valueUsd: 60_000 },
        ],
        departureDate: "2026-08-05T00:00:00.000Z",
        evaluationDate: "2026-08-01T00:00:00.000Z",
      })
    );
    const atf = result.findings.find((finding) => finding.title.includes("ATF"));
    expect(atf?.severity).toBe("block");
    expect(result.verdict).toBe("BLOCKED");
  });

  it("does not manufacture urgency when the departure date is unknown", () => {
    const result = screenShipment(
      shipment({
        lineItems: [
          { description: "Sporting rifle", htsCode: "9303.30.40", countryOfOrigin: "IT", valueUsd: 60_000 },
        ],
      })
    );
    const atf = result.findings.find((finding) => finding.title.includes("ATF"));
    expect(atf?.severity).toBe("warn");
  });

  it("prices Section 301 duty as an advisory, not a blocker", () => {
    const result = screenShipment(
      shipment({
        lineItems: [
          { description: "Servers", htsCode: "8471.50.01", countryOfOrigin: "CN", valueUsd: 400_000,
            pgaDocumentsOnFile: ["ISF_10_2"] },
        ],
      })
    );
    const duty = result.findings.find((finding) => finding.id === "s301-duty");
    expect(duty?.severity).toBe("advisory");
    expect(result.exposure.additionalDutyUsd).toBe(100_000);
    expect(result.verdict).not.toBe("BLOCKED");
  });

  it("always carries the coverage caveat while running on the seed list", () => {
    const result = screenShipment(shipment());
    expect(result.coverage.seedData).toBe(true);
    expect(result.summary).toContain("seed list");
    expect(
      result.findings.some((finding) => finding.id === "coverage-seed")
    ).toBe(true);
  });

  it("builds an action plan of blockers and fixes, skipping advisories", () => {
    const result = screenShipment(
      shipment({
        parties: [{ name: "Sberbank", role: "consignee", country: "RU" }],
      })
    );
    expect(result.actionPlan[0].startsWith("STOP")).toBe(true);
    expect(result.actionPlan.every((step) => step.startsWith("STOP") || step.startsWith("FIX"))).toBe(true);
  });

  it("totals entered value across the shipment", () => {
    const result = screenShipment(
      shipment({
        lineItems: [
          { ...cleanLine, valueUsd: 100_000 },
          { ...cleanLine, description: "Second line", valueUsd: 50_000 },
        ],
      })
    );
    expect(result.totalValueUsd).toBe(150_000);
  });

  it("throws rather than screening a shipment with an unnamed party", () => {
    expect(() =>
      screenShipment(shipment({ parties: [{ name: "  ", role: "shipper", country: "VN" }] }))
    ).toThrow(ComplianceInputError);
  });

  it("throws on a line without an HTS code", () => {
    expect(() =>
      screenShipment(
        shipment({
          lineItems: [{ description: "Mystery goods", htsCode: "", countryOfOrigin: "VN", valueUsd: 1 }],
        })
      )
    ).toThrow(/HTS code/);
  });

  it("throws on a negative entered value", () => {
    expect(() =>
      screenShipment(shipment({ lineItems: [{ ...cleanLine, valueUsd: -5 }] }))
    ).toThrow(/non-negative/);
  });

  it("throws when there are no parties at all", () => {
    expect(() => screenShipment(shipment({ parties: [] }))).toThrow(ComplianceInputError);
  });

  it("is deterministic for the same input", () => {
    const input = shipment();
    expect(JSON.stringify(screenShipment(input))).toBe(JSON.stringify(screenShipment(input)));
  });
});
