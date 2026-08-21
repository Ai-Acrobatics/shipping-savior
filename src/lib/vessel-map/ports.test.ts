import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  buildPortIndex,
  looksLikeLocode,
  normalizePortKey,
  portNameAliases,
  resolvePort,
  type PortRecord,
} from "./ports";

const FIXTURES: PortRecord[] = [
  { locode: "CNSHA", name: "Shanghai", country: "China", country_code: "CN", lat: 31.2304, lng: 121.4737 },
  { locode: "CNNBO", name: "Ningbo-Zhoushan", country: "China", country_code: "CN", lat: 29.8683, lng: 121.544 },
  { locode: "USLGB", name: "Long Beach", country: "United States", country_code: "US", lat: 33.7542, lng: -118.2165 },
  { locode: "USLAX", name: "Los Angeles", country: "United States", country_code: "US", lat: 33.7395, lng: -118.2659 },
  { locode: "NLRTM", name: "Rotterdam", country: "Netherlands", country_code: "NL", lat: 51.9244, lng: 4.4777 },
  { locode: "MXZLO", name: "Manzanillo", country: "Mexico", country_code: "MX", lat: 19.0525, lng: -104.3158 },
  // Deliberately invalid — must be skipped by the index builder.
  { locode: "XXBAD", name: "Broken", country: "Nowhere", country_code: "XX", lat: NaN, lng: 0 },
];

const index = buildPortIndex(FIXTURES);

describe("normalizePortKey", () => {
  it("uppercases and collapses punctuation", () => {
    expect(normalizePortKey("Long  Beach, CA")).toBe("LONG BEACH CA");
  });

  it("strips port qualifier words", () => {
    expect(normalizePortKey("Port of Los Angeles")).toBe("LOS ANGELES");
    expect(normalizePortKey("Rotterdam Terminal")).toBe("ROTTERDAM");
  });

  it("folds accents", () => {
    expect(normalizePortKey("Manzanìllo")).toBe("MANZANILLO");
  });
});

describe("looksLikeLocode", () => {
  it("accepts well-formed codes", () => {
    expect(looksLikeLocode("CNSHA")).toBe(true);
    expect(looksLikeLocode("uslgb")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(looksLikeLocode("SHANGHAI")).toBe(false);
    expect(looksLikeLocode("CNSH")).toBe(false);
    expect(looksLikeLocode("1NSHA")).toBe(false);
  });
});

describe("resolvePort", () => {
  it("resolves by LOCODE, case-insensitively", () => {
    expect(resolvePort(index, "CNSHA")?.locode).toBe("CNSHA");
    expect(resolvePort(index, "uslgb")?.locode).toBe("USLGB");
  });

  it("resolves by plain name", () => {
    expect(resolvePort(index, "Shanghai")?.locode).toBe("CNSHA");
    expect(resolvePort(index, "rotterdam")?.locode).toBe("NLRTM");
  });

  it("resolves 'Port of X' phrasing", () => {
    expect(resolvePort(index, "Port of Los Angeles")?.locode).toBe("USLAX");
  });

  it("resolves name + country qualifier from BOL text", () => {
    expect(resolvePort(index, "SHANGHAI, CN")?.locode).toBe("CNSHA");
    expect(resolvePort(index, "Long Beach, CA USA")?.locode).toBe("USLGB");
  });

  it("finds a LOCODE embedded in a longer string", () => {
    expect(resolvePort(index, "SHANGHAI (CNSHA)")?.locode).toBe("CNSHA");
  });

  it("resolves either component of a hyphenated port", () => {
    expect(resolvePort(index, "Ningbo")?.locode).toBe("CNNBO");
    expect(resolvePort(index, "Zhoushan")?.locode).toBe("CNNBO");
  });

  it("returns null instead of guessing on unknown input", () => {
    expect(resolvePort(index, "Atlantis")).toBeNull();
    expect(resolvePort(index, "ZZZZZ")).toBeNull();
  });

  it("returns null for empty-ish input", () => {
    expect(resolvePort(index, null)).toBeNull();
    expect(resolvePort(index, undefined)).toBeNull();
    expect(resolvePort(index, "   ")).toBeNull();
  });

  it("skips catalog rows with invalid coordinates", () => {
    expect(resolvePort(index, "XXBAD")).toBeNull();
    expect(resolvePort(index, "Broken")).toBeNull();
  });
});

describe("portNameAliases", () => {
  it("indexes both halves of a slashed compound name", () => {
    expect(portNameAliases("New York/New Jersey")).toEqual(
      expect.arrayContaining(["NEW YORK NEW JERSEY", "NEW YORK", "NEW JERSEY"])
    );
  });

  it("strips parentheticals", () => {
    expect(portNameAliases("Norfolk (Virginia)")).toContain("NORFOLK");
    expect(portNameAliases("Miami (PortMiami)")).toContain("MIAMI");
  });

  it("indexes both halves of a hyphenated name", () => {
    expect(portNameAliases("Ningbo-Zhoushan")).toEqual(
      expect.arrayContaining(["NINGBO ZHOUSHAN", "NINGBO", "ZHOUSHAN"])
    );
  });

  it("drops fragments shorter than 3 characters", () => {
    expect(portNameAliases("A/Barcelona")).not.toContain("A");
  });
});

describe("resolvePort against the real data/ports.json catalog", () => {
  const portsPath = path.join(process.cwd(), "data", "ports.json");
  const ports: PortRecord[] = JSON.parse(fs.readFileSync(portsPath, "utf-8"));
  const realIndex = buildPortIndex(ports);

  it("indexes the shipped catalog", () => {
    expect(ports.length).toBeGreaterThan(100);
    expect(realIndex.byLocode.size).toBeGreaterThan(100);
  });

  it("resolves the lanes Blake's demo uses", () => {
    expect(resolvePort(realIndex, "CNSHA")?.name).toContain("Shanghai");
    expect(resolvePort(realIndex, "Long Beach")?.locode).toBe("USLGB");
    expect(resolvePort(realIndex, "Rotterdam")?.locode).toBe("NLRTM");
    expect(resolvePort(realIndex, "Manzanillo")).not.toBeNull();
  });

  it("resolves the compound and parenthetical catalog names shippers shorten", () => {
    // Catalog: "New York/New Jersey", "Norfolk (Virginia)", "Miami (PortMiami)".
    expect(resolvePort(realIndex, "New York")?.locode).toBe("USNYC");
    expect(resolvePort(realIndex, "New Jersey")?.locode).toBe("USNYC");
    expect(resolvePort(realIndex, "Norfolk")?.locode).toBe("USNFK");
    expect(resolvePort(realIndex, "Miami")?.locode).toBe("USMIA");
    expect(resolvePort(realIndex, "Ningbo")?.locode).toBe("CNNBO");
  });

  it("gives every resolved port finite coordinates", () => {
    for (const raw of ["CNSHA", "Long Beach", "Rotterdam", "Yokohama", "Singapore"]) {
      const port = resolvePort(realIndex, raw);
      if (!port) continue;
      expect(Number.isFinite(port.lat)).toBe(true);
      expect(Number.isFinite(port.lng)).toBe(true);
      expect(Math.abs(port.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(port.lng)).toBeLessThanOrEqual(180);
    }
  });
});
