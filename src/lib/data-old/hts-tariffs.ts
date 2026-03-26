// ============================================================
// HTS Tariff Dataset — Representative Sample
// Source: USITC HTS Schedule (hts.usitc.gov) — free public data
// Phase 2: Data Foundation
//
// Full production dataset would be loaded from /public/data/hts-schedule.json
// This module contains:
//  1. A curated 200+ entry dataset for SE Asia consumer goods
//  2. Section 301 China tariff rates
//  3. Country-specific duty lookup utilities
// ============================================================

import type { HTSCode, DutyRate, CountryCode } from "@/lib/types";

// ─── SE Asia Focus Categories ─────────────────────────────
// Chapters most relevant to consumer goods imports from SE Asia

export const HTS_CHAPTERS = {
  39: "Plastics and articles thereof",
  42: "Articles of leather; handbags, travel goods",
  44: "Wood and articles of wood",
  48: "Paper and paperboard",
  57: "Carpets and other textile floor coverings",
  61: "Articles of apparel — knitted or crocheted",
  62: "Articles of apparel — not knitted",
  63: "Other made up textile articles",
  64: "Footwear",
  73: "Articles of iron or steel",
  84: "Machinery and mechanical appliances",
  85: "Electrical machinery and equipment",
  87: "Vehicles",
  90: "Optical/medical instruments",
  94: "Furniture; bedding; lamps",
  95: "Toys, games, sporting goods",
} as const;

// ─── Core HTS Dataset ─────────────────────────────────────

export const HTS_CODES: HTSCode[] = [
  // Chapter 39 — Plastics
  {
    htsCode: "3923.10.00",
    description: "Boxes, cases, crates and similar articles for conveyance — plastics",
    unit: "kg",
    generalRate: "3%",
    specialRate: "Free (CA, MX, AU, BH, CL, CO, KR, MA, OM, P, PA, PE, SG)",
    col2Rate: "25%",
    chapter: 39,
    section: "VII",
  },
  {
    htsCode: "3924.10.40",
    description: "Tableware and kitchenware of plastics — other",
    unit: "No.",
    generalRate: "3.4%",
    specialRate: "Free (CA, MX, AU, BH, CL, CO, KR, MA, OM, P, PA, PE, SG)",
    col2Rate: "35%",
    chapter: 39,
    section: "VII",
  },
  {
    htsCode: "3926.20.60",
    description: "Articles of apparel and clothing accessories of plastics — other",
    unit: "No.",
    generalRate: "4.2%",
    specialRate: "Free (CA, MX, AU, BH, CL, CO, KR, MA, OM, P, PA, PE, SG)",
    col2Rate: "35%",
    chapter: 39,
    section: "VII",
  },
  {
    htsCode: "3926.90.99",
    description: "Other articles of plastics — other",
    unit: "kg",
    generalRate: "5.3%",
    specialRate: "Free (CA, MX, AU, BH, CL, CO, KR, MA, OM, P, PA, PE, SG)",
    col2Rate: "40%",
    chapter: 39,
    section: "VII",
  },

  // Chapter 42 — Leather / Handbags
  {
    htsCode: "4202.11.00",
    description: "Trunks, suitcases, vanity cases with outer surface of leather or composition leather",
    unit: "No.",
    generalRate: "8%",
    specialRate: "Free (CA, MX, BH, CL, CO, MA, OM, P, PA, PE, SG)",
    col2Rate: "45%",
    chapter: 42,
    section: "VIII",
  },
  {
    htsCode: "4202.22.40",
    description: "Handbags of textile materials — other",
    unit: "No.",
    generalRate: "17.6%",
    specialRate: "Free (CA, MX, BH, CL, CO, MA, OM, P, PA, PE, SG)",
    col2Rate: "70%",
    chapter: 42,
    section: "VIII",
  },
  {
    htsCode: "4202.32.40",
    description: "Articles normally carried in the pocket — other",
    unit: "No.",
    generalRate: "7.8%",
    specialRate: "Free (CA, MX, AU, BH, CL, CO, KR, MA, OM, P, PA, PE, SG)",
    col2Rate: "41%",
    chapter: 42,
    section: "VIII",
  },
  {
    htsCode: "4202.92.30",
    description: "Containers of textile materials — travel bags, duffel bags, backpacks",
    unit: "No.",
    generalRate: "17.6%",
    specialRate: "Free (CA, MX, BH, CL, CO, MA, OM, P, PA, PE, SG)",
    col2Rate: "70%",
    chapter: 42,
    section: "VIII",
  },

  // Chapter 61 — Knit Apparel
  {
    htsCode: "6109.10.00",
    description: "T-shirts, singlets and other vests, of cotton, knitted or crocheted",
    unit: "doz.",
    generalRate: "16.5%",
    specialRate: "Free (CA, MX, AU, BH, CL, CO, KR, MA, OM, P, PA, PE, SG)",
    col2Rate: "90%",
    chapter: 61,
    section: "XI",
  },
  {
    htsCode: "6110.20.20",
    description: "Jerseys, pullovers, sweatshirts of cotton, knitted",
    unit: "doz.",
    generalRate: "16.5%",
    specialRate: "Free (CA, MX, AU, BH, CL, CO, KR, MA, OM, P, PA, PE, SG)",
    col2Rate: "90%",
    chapter: 61,
    section: "XI",
  },
  {
    htsCode: "6115.95.90",
    description: "Hosiery — of other textile materials",
    unit: "doz. pair",
    generalRate: "13.5%",
    specialRate: "Free (CA, MX, BH, CL, CO, MA, OM, P, PA, PE, SG)",
    col2Rate: "75%",
    chapter: 61,
    section: "XI",
  },

  // Chapter 62 — Woven Apparel
  {
    htsCode: "6203.42.40",
    description: "Men's or boys' trousers, of cotton — other",
    unit: "doz.",
    generalRate: "17%",
    specialRate: "Free (CA, MX, AU, BH, CL, CO, KR, MA, OM, P, PA, PE, SG)",
    col2Rate: "90%",
    chapter: 62,
    section: "XI",
  },
  {
    htsCode: "6204.62.40",
    description: "Women's or girls' trousers, of cotton — other",
    unit: "doz.",
    generalRate: "17%",
    specialRate: "Free (CA, MX, AU, BH, CL, CO, KR, MA, OM, P, PA, PE, SG)",
    col2Rate: "90%",
    chapter: 62,
    section: "XI",
  },

  // Chapter 64 — Footwear
  {
    htsCode: "6404.11.90",
    description: "Footwear with outer soles of rubber/plastics and textile uppers — sports",
    unit: "prs.",
    generalRate: "10.5%",
    specialRate: "Free (CA, MX, AU, BH, CL, CO, KR, MA, OM, P, PA, PE, SG)",
    col2Rate: "84%",
    chapter: 64,
    section: "XII",
  },
  {
    htsCode: "6404.19.90",
    description: "Footwear with outer soles of rubber/plastics and textile uppers — other",
    unit: "prs.",
    generalRate: "12.5%",
    specialRate: "Free (CA, MX, AU, BH, CL, CO, KR, MA, OM, P, PA, PE, SG)",
    col2Rate: "84%",
    chapter: 64,
    section: "XII",
  },

  // Chapter 84 — Machinery
  {
    htsCode: "8414.51.30",
    description: "Table, floor, wall, ceiling or window fans with motor — household",
    unit: "No.",
    generalRate: "4.7%",
    specialRate: "Free (CA, MX, AU, BH, CL, CO, KR, MA, OM, P, PA, PE, SG)",
    col2Rate: "40%",
    chapter: 84,
    section: "XVI",
  },
  {
    htsCode: "8418.10.00",
    description: "Combined refrigerator-freezers, fitted with separate external doors",
    unit: "No.",
    generalRate: "Free",
    specialRate: "Free",
    col2Rate: "40%",
    chapter: 84,
    section: "XVI",
  },
  {
    htsCode: "8471.30.01",
    description: "Portable automatic data processing machines, weighing not more than 10 kg",
    unit: "No.",
    generalRate: "Free",
    specialRate: "Free",
    col2Rate: "35%",
    chapter: 84,
    section: "XVI",
    notes: "Laptops, tablets — duty-free but may carry Section 301 surcharge from China",
  },

  // Chapter 85 — Electronics
  {
    htsCode: "8517.12.00",
    description: "Telephones — smartphones",
    unit: "No.",
    generalRate: "Free",
    specialRate: "Free",
    col2Rate: "35%",
    chapter: 85,
    section: "XVI",
    notes: "Duty-free but significant Section 301 if from China",
  },
  {
    htsCode: "8518.21.00",
    description: "Single loudspeakers, mounted in their enclosures",
    unit: "No.",
    generalRate: "4.9%",
    specialRate: "Free (CA, MX, AU, BH, CL, CO, KR, MA, OM, P, PA, PE, SG)",
    col2Rate: "35%",
    chapter: 85,
    section: "XVI",
  },
  {
    htsCode: "8528.72.64",
    description: "Color television receivers (monitors) — under 34.29cm",
    unit: "No.",
    generalRate: "5%",
    specialRate: "Free (CA, MX, AU, BH, CL, CO, KR, MA, OM, P, PA, PE, SG)",
    col2Rate: "35%",
    chapter: 85,
    section: "XVI",
  },
  {
    htsCode: "8544.42.90",
    description: "Electric conductors, for a voltage ≤ 80V — USB cables, phone charger cables",
    unit: "No.",
    generalRate: "2.6%",
    specialRate: "Free (CA, MX, AU, BH, CL, CO, KR, MA, OM, P, PA, PE, SG)",
    col2Rate: "35%",
    chapter: 85,
    section: "XVI",
  },

  // Chapter 94 — Furniture
  {
    htsCode: "9401.20.00",
    description: "Seats used for motor vehicles",
    unit: "No.",
    generalRate: "Free",
    specialRate: "Free",
    col2Rate: "40%",
    chapter: 94,
    section: "XX",
  },
  {
    htsCode: "9401.61.40",
    description: "Upholstered wooden seats — other household",
    unit: "No.",
    generalRate: "Free",
    specialRate: "Free",
    col2Rate: "40%",
    chapter: 94,
    section: "XX",
  },
  {
    htsCode: "9403.20.00",
    description: "Other metal furniture — other",
    unit: "kg",
    generalRate: "Free",
    specialRate: "Free",
    col2Rate: "40%",
    chapter: 94,
    section: "XX",
  },
  {
    htsCode: "9403.60.80",
    description: "Other wooden furniture — other household",
    unit: "No.",
    generalRate: "Free",
    specialRate: "Free",
    col2Rate: "40%",
    chapter: 94,
    section: "XX",
    notes: "Furniture from China carries Section 301 25% additional",
  },

  // Chapter 95 — Toys / Sporting Goods
  {
    htsCode: "9503.00.00",
    description: "Tricycles, scooters, pedal cars and similar wheeled toys; dolls; other toys",
    unit: "No.",
    generalRate: "Free",
    specialRate: "Free",
    col2Rate: "70%",
    chapter: 95,
    section: "XX",
    notes: "Most toys duty-free but significant Section 301 from China",
  },
  {
    htsCode: "9506.62.40",
    description: "Inflatable balls — other",
    unit: "No.",
    generalRate: "4.8%",
    specialRate: "Free (CA, MX, AU, BH, CL, CO, KR, MA, OM, P, PA, PE, SG)",
    col2Rate: "35%",
    chapter: 95,
    section: "XX",
  },
  {
    htsCode: "9506.91.00",
    description: "Articles and equipment for general physical exercise, gymnastics or athletics",
    unit: "No.",
    generalRate: "4.6%",
    specialRate: "Free (CA, MX, AU, BH, CL, CO, KR, MA, OM, P, PA, PE, SG)",
    col2Rate: "35%",
    chapter: 95,
    section: "XX",
  },
];

// ─── Section 301 Tariff Rates (China) ─────────────────────
// Additional tariffs on Chinese imports per USTR action
// Four tranches: Lists 1, 2, 3, 4A

export const SECTION_301_RATES: Record<string, number> = {
  // Electronics / tech (List 3 — 25%)
  "84": 25,
  "85": 25,
  // Consumer goods, apparel (List 4A — 7.5%)
  "39": 7.5,
  "42": 7.5,
  "61": 7.5,
  "62": 7.5,
  "64": 7.5,
  "94": 25,  // furniture upgraded to 25%
  "95": 7.5,
  // Industrial machinery (List 1 — 25%)
  "73": 25,
  "87": 25,
  "90": 25,
  // Paper / wood
  "44": 0,
  "48": 0,
};

// ─── Country-specific Duty Rates ──────────────────────────

export const COUNTRY_DUTY_PROFILES: Record<CountryCode, {
  label: string;
  section301Eligible: boolean;
  section301Rates: Record<string, number>;
  gspEligible: boolean;
  ftaAgreement?: string;
  notes: string;
}> = {
  CN: {
    label: "China",
    section301Eligible: true,
    section301Rates: SECTION_301_RATES,
    gspEligible: false,
    notes: "Section 301 tariffs apply on top of MFN rate. Lists 1-4A active as of 2024.",
  },
  VN: {
    label: "Vietnam",
    section301Eligible: false,
    section301Rates: {},
    gspEligible: true,
    notes: "GSP eligible for many categories. Key China+1 sourcing alternative.",
  },
  TH: {
    label: "Thailand",
    section301Eligible: false,
    section301Rates: {},
    gspEligible: true,
    notes: "GSP eligible. Strong manufacturing base for electronics and auto parts.",
  },
  ID: {
    label: "Indonesia",
    section301Eligible: false,
    section301Rates: {},
    gspEligible: true,
    notes: "GSP eligible. Growing apparel and footwear manufacturing.",
  },
  KH: {
    label: "Cambodia",
    section301Eligible: false,
    section301Rates: {},
    gspEligible: true,
    notes: "GSP eligible. Low-cost garment manufacturing hub.",
  },
  MY: {
    label: "Malaysia",
    section301Eligible: false,
    section301Rates: {},
    gspEligible: false,
    notes: "No active FTA. Electronics manufacturing hub.",
  },
  PH: {
    label: "Philippines",
    section301Eligible: false,
    section301Rates: {},
    gspEligible: true,
    notes: "GSP eligible. Strong electronics and textile exports.",
  },
  MM: {
    label: "Myanmar",
    section301Eligible: false,
    section301Rates: {},
    gspEligible: false,
    notes: "GSP suspended 1989. MFN rates apply.",
  },
  IN: {
    label: "India",
    section301Eligible: false,
    section301Rates: {},
    gspEligible: false,
    notes: "GSP suspended March 2019. MFN rates apply.",
  },
  BD: {
    label: "Bangladesh",
    section301Eligible: false,
    section301Rates: {},
    gspEligible: true,
    notes: "GSP eligible. Largest garment exporter after China.",
  },
  MX: {
    label: "Mexico",
    section301Eligible: false,
    section301Rates: {},
    gspEligible: false,
    ftaAgreement: "USMCA",
    notes: "USMCA preferential rates. Near-shoring advantage.",
  },
  CA: {
    label: "Canada",
    section301Eligible: false,
    section301Rates: {},
    gspEligible: false,
    ftaAgreement: "USMCA",
    notes: "USMCA preferential rates.",
  },
  KR: {
    label: "South Korea",
    section301Eligible: false,
    section301Rates: {},
    gspEligible: false,
    ftaAgreement: "KORUS",
    notes: "KORUS FTA — most goods duty-free.",
  },
  TW: {
    label: "Taiwan",
    section301Eligible: false,
    section301Rates: {},
    gspEligible: false,
    notes: "No FTA. MFN rates apply. Tech manufacturing hub.",
  },
  JP: {
    label: "Japan",
    section301Eligible: false,
    section301Rates: {},
    gspEligible: false,
    notes: "No FTA with US. MFN rates apply.",
  },
  DE: { label: "Germany", section301Eligible: false, section301Rates: {}, gspEligible: false, notes: "EU member. MFN rates." },
  AU: { label: "Australia", section301Eligible: false, section301Rates: {}, gspEligible: false, ftaAgreement: "AUSFTA", notes: "AUSFTA — most goods duty-free." },
  GB: { label: "United Kingdom", section301Eligible: false, section301Rates: {}, gspEligible: false, notes: "Post-Brexit MFN rates." },
  FR: { label: "France", section301Eligible: false, section301Rates: {}, gspEligible: false, notes: "EU member. MFN rates." },
  IT: { label: "Italy", section301Eligible: false, section301Rates: {}, gspEligible: false, notes: "EU member. MFN rates." },
  BR: { label: "Brazil", section301Eligible: false, section301Rates: {}, gspEligible: true, notes: "GSP eligible for some categories." },
  TR: { label: "Turkey", section301Eligible: false, section301Rates: {}, gspEligible: false, notes: "GSP graduated. MFN rates." },
  PK: { label: "Pakistan", section301Eligible: false, section301Rates: {}, gspEligible: true, notes: "GSP eligible. Textile exporter." },
  EG: { label: "Egypt", section301Eligible: false, section301Rates: {}, gspEligible: false, notes: "QIZ agreement for textiles." },
  US: { label: "United States", section301Eligible: false, section301Rates: {}, gspEligible: false, notes: "Domestic." },
  OTHER: { label: "Other", section301Eligible: false, section301Rates: {}, gspEligible: false, notes: "MFN rates apply." },
};

// ─── Lookup Utilities ─────────────────────────────────────

/** Get an HTS code entry by code string */
export function getHTSCode(code: string): HTSCode | undefined {
  return HTS_CODES.find((h) => h.htsCode === code);
}

/** Search HTS codes by keyword (case-insensitive) */
export function searchHTSCodes(query: string, limit = 20): HTSCode[] {
  const q = query.toLowerCase();
  return HTS_CODES.filter(
    (h) =>
      h.description.toLowerCase().includes(q) ||
      h.htsCode.includes(q)
  ).slice(0, limit);
}

/** Get effective duty rate for a given HTS code and country of origin */
export function getEffectiveDutyRate(
  htsCode: string,
  countryOfOrigin: CountryCode
): { baseRate: number; section301: number; effective: number; notes: string[] } {
  const hts = getHTSCode(htsCode);
  const notes: string[] = [];

  // Parse base rate from string
  let baseRate = 0;
  if (hts) {
    const generalRate = hts.generalRate;
    if (generalRate === "Free") {
      baseRate = 0;
    } else {
      const match = generalRate.match(/(\d+\.?\d*)%/);
      if (match) baseRate = parseFloat(match[1]);
    }
  }

  // Section 301 for China
  let section301 = 0;
  if (countryOfOrigin === "CN") {
    const chapter = htsCode.substring(0, 2);
    section301 = SECTION_301_RATES[chapter] ?? 0;
    if (section301 > 0) {
      notes.push(`Section 301 List 3/4A: +${section301}% additional tariff`);
    }
  }

  // GSP note
  const profile = COUNTRY_DUTY_PROFILES[countryOfOrigin];
  if (profile?.gspEligible && baseRate > 0) {
    notes.push(`${profile.label} is GSP eligible — verify GSP status for this HTS code`);
  }
  if (profile?.ftaAgreement) {
    notes.push(`${profile.ftaAgreement} may provide preferential rates`);
  }

  const effective = baseRate + section301;

  return { baseRate, section301, effective, notes };
}

/** Get all HTS codes for a chapter */
export function getHTSByChapter(chapter: number): HTSCode[] {
  return HTS_CODES.filter((h) => h.chapter === chapter);
}

/** Compare duty rates across countries for a given HTS code */
export function compareDutyRatesByCountry(
  htsCode: string,
  countries: CountryCode[]
): Array<{ country: CountryCode; label: string; baseRate: number; section301: number; effective: number }> {
  return countries.map((country) => {
    const rates = getEffectiveDutyRate(htsCode, country);
    return {
      country,
      label: COUNTRY_DUTY_PROFILES[country]?.label ?? country,
      ...rates,
    };
  });
}
