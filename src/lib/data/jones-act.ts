// ============================================================
// Jones Act / Domestic Lane Classifier — AI-12014
//
// Blake's ask, verbatim from the 2026-04-07 call:
//   "Just like we can't compare Del Monte to Maersk, we need to
//    signify Jones Act vs non-Jones Act carriers."
//
// Two rules that look like one but are NOT the same set:
//
//   1. The Jones Act (46 U.S.C. Sec. 55102) restricts carriage between
//      two US "coastwise points" to US-built / US-flagged / US-crewed
//      vessels. It reaches Hawaii, Alaska, Puerto Rico and Guam.
//      The US Virgin Islands, American Samoa and the Northern Mariana
//      Islands are statutorily EXEMPT.
//
//   2. The customs territory of the United States is the 50 states, DC
//      and Puerto Rico ONLY. Guam, the USVI, American Samoa and the CNMI
//      sit outside it, so cargo moving from them to the mainland still
//      needs a CBP entry even though it never left US soil.
//
// Conflating the two is how a quote ends up with $40k of phantom duty on
// an LA -> Honolulu move, or with duty silently zeroed on a Guam lane
// that genuinely owes it. Everything below keeps them separate.
// ============================================================

import type {
  CustomsBasis,
  JonesActCarrier,
  JonesActTrade,
  LaneClassification,
} from "@/lib/types/lanes";

export type { JonesActCarrier, JonesActTrade, LaneClassification };

// ─── Carriers ─────────────────────────────────────────────────
// Jones Act qualified operators. Aliases cover the spellings that show
// up in schedule feeds, BOLs and hand-typed contract lanes.

export const JONES_ACT_CARRIERS: JonesActCarrier[] = [
  {
    name: "Matson",
    code: "MATS",
    aliases: ["matson", "mats", "matson navigation", "matson navigation company", "matu"],
    trades: ["hawaii", "alaska", "guam", "coastwise"],
  },
  {
    name: "Pasha Hawaii",
    code: "PASH",
    aliases: ["pasha", "pasha hawaii", "the pasha group", "pash", "phlx"],
    trades: ["hawaii", "coastwise"],
  },
  {
    name: "TOTE Maritime",
    code: "TOTE",
    aliases: ["tote", "tote maritime", "tote maritime puerto rico", "tote maritime alaska"],
    trades: ["puerto-rico", "alaska"],
  },
  {
    name: "Crowley",
    code: "CROW",
    aliases: ["crowley", "crowley maritime", "crowley liner", "cmcu"],
    trades: ["puerto-rico", "alaska", "coastwise"],
  },
  {
    name: "Sea Star Line",
    code: "SEAS",
    aliases: ["sea star", "sea star line", "seastar"],
    trades: ["puerto-rico"],
  },
  {
    name: "Alaska Marine Lines",
    code: "AKML",
    aliases: ["alaska marine lines", "aml", "lynden"],
    trades: ["alaska"],
  },
  {
    name: "Samson Tug and Barge",
    code: "SMSN",
    aliases: ["samson", "samson tug", "samson tug and barge"],
    trades: ["alaska"],
  },
];

// ─── Ports ────────────────────────────────────────────────────
// Offshore US points served by domestic ocean carriers. Keyed by
// UN/LOCODE, matching `data/ports.json`.

export const DOMESTIC_OFFSHORE_PORTS: Record<string, { name: string; trade: JonesActTrade }> = {
  // Hawaii
  USHNL: { name: "Honolulu", trade: "hawaii" },
  USOGG: { name: "Kahului", trade: "hawaii" },
  USITO: { name: "Hilo", trade: "hawaii" },
  USLIH: { name: "Nawiliwili", trade: "hawaii" },
  USBSF: { name: "Kalaeloa Barbers Point", trade: "hawaii" },
  // Alaska
  USANC: { name: "Anchorage", trade: "alaska" },
  USKDK: { name: "Kodiak", trade: "alaska" },
  USDUT: { name: "Dutch Harbor", trade: "alaska" },
  USJNU: { name: "Juneau", trade: "alaska" },
  USSDP: { name: "Sand Point", trade: "alaska" },
  // Puerto Rico
  PRSJU: { name: "San Juan", trade: "puerto-rico" },
  PRPSE: { name: "Ponce", trade: "puerto-rico" },
  // Guam
  GUDTM: { name: "Guam (Apra Harbor)", trade: "guam" },
  // US Virgin Islands — Jones Act EXEMPT, outside the customs territory
  VISTT: { name: "Charlotte Amalie (St. Thomas)", trade: "usvi" },
  VISTX: { name: "St. Croix (Limetree Bay)", trade: "usvi" },
  // Other territories — Jones Act exempt, outside the customs territory
  ASPPG: { name: "Pago Pago", trade: "other-territory" },
  MPSPN: { name: "Saipan", trade: "other-territory" },
};

/**
 * Locode prefixes for US soil. `US` covers the 50 states plus Hawaii and
 * Alaska; the rest are territories with their own ISO country codes.
 */
const US_SOIL_PREFIXES = ["US", "PR", "VI", "GU", "AS", "MP"] as const;

/** Prefixes inside the US customs territory. Puerto Rico is in; the rest are not. */
const US_CUSTOMS_TERRITORY_PREFIXES = ["US", "PR"] as const;

/** Trades the Jones Act reaches. USVI / American Samoa / CNMI are exempt. */
const JONES_ACT_TRADES: ReadonlySet<JonesActTrade> = new Set<JonesActTrade>([
  "hawaii",
  "alaska",
  "puerto-rico",
  "guam",
  "coastwise",
]);

const TRADE_LABELS: Record<JonesActTrade, string> = {
  hawaii: "Hawaii",
  alaska: "Alaska",
  "puerto-rico": "Puerto Rico",
  guam: "Guam",
  usvi: "US Virgin Islands",
  "other-territory": "US Territory",
  coastwise: "Coastwise",
};

// ─── Primitives ───────────────────────────────────────────────

function normalizePort(code: string | null | undefined): string {
  return (code ?? "").trim().toUpperCase();
}

/** Is this locode on US soil — states, DC, or any US territory? */
export function isUsPort(code: string | null | undefined): boolean {
  const port = normalizePort(code);
  if (port.length < 2) return false;
  return US_SOIL_PREFIXES.some((prefix) => port.startsWith(prefix));
}

/**
 * Is this locode inside the customs territory of the United States?
 * 50 states + DC + Puerto Rico. Guam, USVI, American Samoa and the CNMI
 * are US soil but sit OUTSIDE it, so shipments from them still clear CBP.
 */
export function isInUsCustomsTerritory(code: string | null | undefined): boolean {
  const port = normalizePort(code);
  if (port.length < 2) return false;
  return US_CUSTOMS_TERRITORY_PREFIXES.some((prefix) => port.startsWith(prefix));
}

/** Is this an offshore (non-contiguous) US point served by domestic carriers? */
export function isDomesticOffshorePort(code: string | null | undefined): boolean {
  return normalizePort(code) in DOMESTIC_OFFSHORE_PORTS;
}

/** The domestic trade a port belongs to, or `null` if it is not offshore US. */
export function getPortTrade(code: string | null | undefined): JonesActTrade | null {
  return DOMESTIC_OFFSHORE_PORTS[normalizePort(code)]?.trade ?? null;
}

/**
 * Look up a Jones Act carrier by display name, internal code or alias.
 * Matching is case-insensitive and tolerant of the punctuation that shows
 * up in feeds ("Pasha Hawaii, Inc." -> Pasha Hawaii).
 */
export function findJonesActCarrier(
  nameOrCode: string | null | undefined
): JonesActCarrier | null {
  const needle = (nameOrCode ?? "")
    .trim()
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ");
  if (!needle) return null;

  for (const carrier of JONES_ACT_CARRIERS) {
    if (carrier.code.toLowerCase() === needle) return carrier;
    if (carrier.name.toLowerCase() === needle) return carrier;
    if (carrier.aliases.includes(needle)) return carrier;
  }

  // Substring fallback so "Matson Navigation Co" and "MATSON LINES" resolve.
  for (const carrier of JONES_ACT_CARRIERS) {
    if (needle.includes(carrier.name.toLowerCase())) return carrier;
    if (carrier.aliases.some((alias) => alias.length > 3 && needle.includes(alias))) {
      return carrier;
    }
  }

  return null;
}

/** Convenience predicate over {@link findJonesActCarrier}. */
export function isJonesActCarrier(nameOrCode: string | null | undefined): boolean {
  return findJonesActCarrier(nameOrCode) !== null;
}

// ─── Classifier ───────────────────────────────────────────────

export interface ClassifyLaneParams {
  originPort: string | null | undefined;
  destPort: string | null | undefined;
  /** Carrier name, code or alias. Optional — the lane classifies without it. */
  carrier?: string | null;
}

/**
 * Classify a lane for Jones Act eligibility and customs treatment.
 *
 * The two are decided independently:
 *   - Jones Act:  both ends coastwise points AND the trade is not exempt.
 *   - Customs:    both ends inside the US customs territory => no entry.
 */
export function classifyLane(params: ClassifyLaneParams): LaneClassification {
  const originPort = normalizePort(params.originPort);
  const destPort = normalizePort(params.destPort);

  const originIsUs = isUsPort(originPort);
  const destIsUs = isUsPort(destPort);
  const isDomestic = originIsUs && destIsUs;

  const originTrade = getPortTrade(originPort);
  const destTrade = getPortTrade(destPort);

  // The offshore end defines the trade. Mainland-to-mainland water moves
  // are coastwise, which is still Jones Act cargo.
  let trade: JonesActTrade | null = null;
  if (isDomestic) {
    trade = destTrade ?? originTrade ?? "coastwise";
  }

  const isJonesActLane = isDomestic && trade !== null && JONES_ACT_TRADES.has(trade);

  // ─── Customs treatment ──────────────────────────────────────
  const originInCustoms = isInUsCustomsTerritory(originPort);
  const destInCustoms = isInUsCustomsTerritory(destPort);

  let customsBasis: CustomsBasis;
  if (originInCustoms && destInCustoms) {
    customsBasis = "domestic-no-entry";
  } else if (isDomestic) {
    // US soil on both ends, but one of them is outside the customs
    // territory (Guam, USVI, American Samoa, CNMI) — entry still required.
    customsBasis = "territory-entry";
  } else if (destInCustoms || destIsUs) {
    customsBasis = "import-entry";
  } else if (originIsUs) {
    customsBasis = "export";
  } else {
    customsBasis = "foreign-to-foreign";
  }

  const customsEntryRequired =
    customsBasis === "territory-entry" || customsBasis === "import-entry";
  // Duty / MPF / HMF only attach where an entry is filed inbound to the US.
  const dutiable = customsEntryRequired;

  // ─── Carrier eligibility ────────────────────────────────────
  const carrier = findJonesActCarrier(params.carrier);
  const carrierSupplied = Boolean((params.carrier ?? "").trim());
  const carrierIsJonesActQualified = carrierSupplied ? carrier !== null : null;

  // ─── Warnings ───────────────────────────────────────────────
  const warnings: string[] = [];

  if (isJonesActLane && carrierIsJonesActQualified === false) {
    warnings.push(
      `${params.carrier} is not a Jones Act qualified carrier. Coastwise carriage between ` +
        `${originPort} and ${destPort} requires a US-built, US-flagged, US-crewed vessel ` +
        `(46 U.S.C. Sec. 55102).`
    );
  }

  if (isJonesActLane && carrier && trade && !carrier.trades.includes(trade)) {
    warnings.push(
      `${carrier.name} is Jones Act qualified but does not publish service in the ` +
        `${TRADE_LABELS[trade]} trade. Verify the routing before quoting.`
    );
  }

  if (customsBasis === "domestic-no-entry") {
    warnings.push(
      "Domestic movement inside the US customs territory - no CBP entry, no duty, no MPF or HMF, no customs broker."
    );
  }

  if (customsBasis === "territory-entry" && trade) {
    warnings.push(
      `${TRADE_LABELS[trade]} sits outside the US customs territory. A CBP entry is still ` +
        `required on arrival in the mainland US even though the cargo never leaves US soil.`
    );
  }

  if (isDomestic && trade && !JONES_ACT_TRADES.has(trade)) {
    warnings.push(
      `${TRADE_LABELS[trade]} is exempt from the Jones Act coastwise requirement - ` +
        `foreign-flag vessels may lawfully carry this cargo.`
    );
  }

  // ─── Label ──────────────────────────────────────────────────
  let label: string;
  if (isJonesActLane && trade) {
    label = `Jones Act - Domestic (${TRADE_LABELS[trade]})`;
  } else if (isDomestic && trade) {
    label = `Domestic (${TRADE_LABELS[trade]}) - Jones Act exempt`;
  } else if (customsBasis === "import-entry") {
    label = "International import";
  } else if (customsBasis === "export") {
    label = "Export from US";
  } else {
    label = "International";
  }

  return {
    originPort,
    destPort,
    isDomestic,
    isJonesActLane,
    requiresUsFlagVessel: isJonesActLane,
    trade,
    customsEntryRequired,
    dutiable,
    customsBasis,
    carrier,
    carrierIsJonesActQualified,
    label,
    warnings,
  };
}

/**
 * Narrow helper for callers that only need the customs question answered,
 * e.g. "should this quote carry duty at all?".
 */
export function laneRequiresCustomsEntry(
  originPort: string | null | undefined,
  destPort: string | null | undefined
): boolean {
  return classifyLane({ originPort, destPort }).customsEntryRequired;
}
