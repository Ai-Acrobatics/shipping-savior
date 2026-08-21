// ============================================================
// Multi-modal route markers (AI-12015) — intermodal route dataset
//
// The routings a shipper actually books to an inland US destination, expressed
// as leg sequences rather than a single port-to-port hop.
//
// Each inland market gets more than one option on purpose, because the choice
// is never obvious:
//
//   * IPI on a through bill — the ocean carrier owns the rail leg and the
//     delay. Simplest to book, and the carrier's rail allocation is what you
//     get.
//   * Merchant haulage — the shipper arranges the rail or truck themselves.
//     Usually cheaper, sometimes faster, and the delay is now the shipper's.
//   * All-truck from the port — expensive per mile, but no ramp dwell and no
//     stack-train wait, which on a short lane can beat rail door-to-door.
//
// Costs are per 40ft container and are indicative mid-market figures, not
// quoted tariffs. Rail transits are lane-typical for the named railroad.
// ============================================================

import type { IntermodalRoute, RouteLeg } from "./types";

// ─── Reusable ocean legs ──────────────────────────────────
//
// The same vessel leg feeds several inland routings, so it is defined once.
// Duplicating it per destination is how the Shanghai→LA transit ends up
// different on two rows of the same comparison table.

function oceanLeg(args: {
  id: string;
  from: string;
  to: string;
  carrier: string;
  service: string;
  min: number;
  max: number;
  cost: number;
  reliability: number;
  co2Kg: number;
  frequency?: RouteLeg["frequency"];
}): RouteLeg {
  return {
    id: args.id,
    mode: "ocean-fcl",
    fromCode: args.from,
    toCode: args.to,
    carrier: args.carrier,
    service: args.service,
    transitDays: { min: args.min, max: args.max },
    costUsd: args.cost,
    frequency: args.frequency ?? "weekly",
    reliability: args.reliability,
    co2Kg: args.co2Kg,
  };
}

function railLeg(args: {
  id: string;
  from: string;
  to: string;
  carrier: string;
  service: string;
  min: number;
  max: number;
  cost: number;
  reliability: number;
  co2Kg: number;
  notes?: string;
}): RouteLeg {
  return {
    id: args.id,
    mode: "rail",
    fromCode: args.from,
    toCode: args.to,
    carrier: args.carrier,
    service: args.service,
    transitDays: { min: args.min, max: args.max },
    costUsd: args.cost,
    frequency: "daily",
    reliability: args.reliability,
    co2Kg: args.co2Kg,
    notes: args.notes,
  };
}

function drayLeg(args: {
  id: string;
  from: string;
  to: string;
  carrier: string;
  min: number;
  max: number;
  cost: number;
  reliability: number;
  co2Kg: number;
  service?: string;
  notes?: string;
}): RouteLeg {
  return {
    id: args.id,
    mode: "drayage",
    fromCode: args.from,
    toCode: args.to,
    carrier: args.carrier,
    service: args.service ?? "Ramp to door",
    transitDays: { min: args.min, max: args.max },
    costUsd: args.cost,
    frequency: "on-demand",
    reliability: args.reliability,
    co2Kg: args.co2Kg,
    notes: args.notes,
  };
}

const CMA_SHA_LAX = oceanLeg({
  id: "cma-cnsha-uslax",
  from: "CNSHA",
  to: "USLAX",
  carrier: "CMA CGM",
  service: "Pearl River Express",
  min: 15,
  max: 19,
  cost: 4100,
  reliability: 89,
  co2Kg: 1240,
});

const MAERSK_SHA_LGB = oceanLeg({
  id: "mae-cnsha-uslgb",
  from: "CNSHA",
  to: "USLGB",
  carrier: "Maersk",
  service: "TP6 Transpacific",
  min: 14,
  max: 18,
  cost: 4400,
  reliability: 94,
  co2Kg: 1210,
});

const ONE_NBO_SEA = oceanLeg({
  id: "one-cnnbo-ussea",
  from: "CNNBO",
  to: "USSEA",
  carrier: "ONE",
  service: "PN3 Pacific North",
  min: 13,
  max: 17,
  cost: 3900,
  reliability: 90,
  co2Kg: 1090,
});

const MSC_SGN_LAX = oceanLeg({
  id: "msc-vnsgn-uslax",
  from: "VNSGN",
  to: "USLAX",
  carrier: "MSC",
  service: "Sentosa Express",
  min: 20,
  max: 24,
  cost: 4650,
  reliability: 91,
  co2Kg: 1480,
});

const EVG_SHE_SAV = oceanLeg({
  id: "evg-cnshe-ussav",
  from: "CNSHE",
  to: "USSAV",
  carrier: "Evergreen",
  service: "AUE Suez Express",
  min: 30,
  max: 36,
  cost: 5200,
  reliability: 86,
  co2Kg: 2050,
});

const COSCO_BKK_LGB = oceanLeg({
  id: "cos-thbkk-uslgb",
  from: "THBKK",
  to: "USLGB",
  carrier: "COSCO",
  service: "PS3 Pacific South",
  min: 21,
  max: 26,
  cost: 4150,
  reliability: 84,
  co2Kg: 1520,
});

// ─── Routes ───────────────────────────────────────────────

export const INTERMODAL_ROUTES: IntermodalRoute[] = [
  // ── Salt Lake City — the lane on the ticket ──
  {
    id: "cma-cnsha-usslc-ipi",
    sellingCarrier: "CMA CGM",
    throughBillOfLading: true,
    label: "Shanghai → Salt Lake City (CMA CGM IPI)",
    notes:
      "Store-door IPI on a single CMA CGM bill. The carrier owns the rail leg, so a stack-train delay is the carrier's problem — but the carrier's rail allocation out of LA is what you get.",
    legs: [
      CMA_SHA_LAX,
      railLeg({
        id: "cma-uslax-usslc-rail",
        from: "USLAX",
        to: "USSLC",
        carrier: "Union Pacific",
        service: "LA Basin → Salt Lake City stack train",
        min: 3,
        max: 5,
        cost: 1150,
        reliability: 88,
        co2Kg: 310,
        notes: "Carrier haulage under the CMA CGM through bill.",
      }),
      drayLeg({
        id: "cma-usslc-door",
        from: "USSLC",
        to: "USSLC-DOOR",
        carrier: "Local drayage",
        min: 1,
        max: 1,
        cost: 425,
        reliability: 96,
        co2Kg: 45,
      }),
    ],
  },
  {
    id: "mae-cnsha-usslc-merchant",
    sellingCarrier: "Maersk",
    throughBillOfLading: false,
    label: "Shanghai → Salt Lake City (Maersk to LGB + merchant rail)",
    notes:
      "Port-to-port ocean, then the shipper's own rail booking. Usually cheaper than IPI and the ocean leg is the most reliable on the lane — but the ramp dwell and any rail delay are now yours.",
    legs: [
      MAERSK_SHA_LGB,
      railLeg({
        id: "mer-uslgb-usslc-rail",
        from: "USLGB",
        to: "USSLC",
        carrier: "Union Pacific",
        service: "Merchant haulage — shipper's rail contract",
        min: 3,
        max: 6,
        cost: 980,
        reliability: 85,
        co2Kg: 315,
      }),
      drayLeg({
        id: "mer-usslc-door",
        from: "USSLC",
        to: "USSLC-DOOR",
        carrier: "Local drayage",
        min: 1,
        max: 1,
        cost: 425,
        reliability: 96,
        co2Kg: 45,
      }),
    ],
  },
  {
    id: "one-cnnbo-usslc-ipi",
    sellingCarrier: "ONE",
    throughBillOfLading: true,
    label: "Ningbo → Salt Lake City (ONE via Seattle)",
    notes:
      "The Pacific Northwest routing. Two days less ocean and less port dwell than the LA basin, paid back by a longer rail leg.",
    legs: [
      ONE_NBO_SEA,
      railLeg({
        id: "one-ussea-usslc-rail",
        from: "USSEA",
        to: "USSLC",
        carrier: "Union Pacific",
        service: "PNW → Salt Lake City stack train",
        min: 3,
        max: 5,
        cost: 1080,
        reliability: 87,
        co2Kg: 275,
      }),
      drayLeg({
        id: "one-usslc-door",
        from: "USSLC",
        to: "USSLC-DOOR",
        carrier: "Local drayage",
        min: 1,
        max: 1,
        cost: 425,
        reliability: 96,
        co2Kg: 45,
      }),
    ],
  },
  {
    id: "msc-vnsgn-usslc-truck",
    sellingCarrier: "MSC",
    throughBillOfLading: false,
    label: "Ho Chi Minh City → Salt Lake City (MSC to LA + all-truck)",
    notes:
      "All-truck inland instead of rail. Roughly double the inland cost, but it skips the stack-train wait entirely — on a deadline this is the routing that saves the order.",
    legs: [
      MSC_SGN_LAX,
      drayLeg({
        id: "msc-uslax-usslc-truck",
        from: "USLAX",
        to: "USSLC-DOOR",
        carrier: "Regional trucking",
        service: "Port to door, team drivers",
        min: 2,
        max: 3,
        cost: 2350,
        reliability: 95,
        co2Kg: 1180,
        notes: "No ramp interchange — the box never leaves the chassis.",
      }),
    ],
  },

  // ── Chicago ──
  {
    id: "cma-cnsha-uschi-ipi",
    sellingCarrier: "CMA CGM",
    throughBillOfLading: true,
    label: "Shanghai → Chicago (CMA CGM IPI via LA)",
    notes:
      "The classic transpacific IPI. Chicago's ramps are the most congested in North America, which is where the two-day interchange dwell comes from.",
    legs: [
      CMA_SHA_LAX,
      railLeg({
        id: "cma-uslax-uschi-rail",
        from: "USLAX",
        to: "USCHI",
        carrier: "BNSF",
        service: "Transcon stack train",
        min: 4,
        max: 6,
        cost: 1320,
        reliability: 87,
        co2Kg: 470,
      }),
      drayLeg({
        id: "cma-uschi-door",
        from: "USCHI",
        to: "USCHI-DOOR",
        carrier: "Local drayage",
        min: 1,
        max: 2,
        cost: 495,
        reliability: 93,
        co2Kg: 55,
      }),
    ],
  },
  {
    id: "evg-cnshe-uschi-usec",
    sellingCarrier: "Evergreen",
    throughBillOfLading: true,
    label: "Shenzhen → Chicago (Evergreen all-water to Savannah + rail)",
    notes:
      "All-water to the US East Coast, then a short rail leg. Two weeks longer on the water and it still wins when the West Coast ramps are backed up — the rail leg is a third of the transcon.",
    legs: [
      EVG_SHE_SAV,
      railLeg({
        id: "evg-ussav-uschi-rail",
        from: "USSAV",
        to: "USCHI",
        carrier: "Norfolk Southern",
        service: "Mason Mega Rail → Chicago",
        min: 3,
        max: 4,
        cost: 1050,
        reliability: 90,
        co2Kg: 330,
      }),
      drayLeg({
        id: "evg-uschi-door",
        from: "USCHI",
        to: "USCHI-DOOR",
        carrier: "Local drayage",
        min: 1,
        max: 2,
        cost: 495,
        reliability: 93,
        co2Kg: 55,
      }),
    ],
  },
  {
    id: "air-cnhkg-uschi",
    sellingCarrier: "Cathay Cargo",
    throughBillOfLading: true,
    label: "Hong Kong → Chicago (air + drayage)",
    notes:
      "The expedite option, priced per 40ft-equivalent for comparability. Three days door-to-door against three weeks, at roughly six times the freight and nine times the carbon.",
    legs: [
      {
        id: "cx-cnhkg-usord-air",
        mode: "air",
        fromCode: "CNHKG-AIR",
        toCode: "USORD-AIR",
        carrier: "Cathay Cargo",
        service: "HKG–ORD freighter",
        transitDays: { min: 1, max: 2 },
        costUsd: 26500,
        frequency: "daily",
        reliability: 93,
        co2Kg: 14800,
      },
      drayLeg({
        id: "cx-usord-door",
        from: "USORD-AIR",
        to: "USCHI-DOOR",
        carrier: "Local drayage",
        service: "Airport to door",
        min: 1,
        max: 1,
        cost: 640,
        reliability: 96,
        co2Kg: 40,
      }),
    ],
  },

  // ── Denver ──
  {
    id: "cos-thbkk-usden-ipi",
    sellingCarrier: "COSCO",
    throughBillOfLading: true,
    label: "Laem Chabang → Denver (COSCO IPI via Long Beach)",
    legs: [
      COSCO_BKK_LGB,
      railLeg({
        id: "cos-uslgb-usden-rail",
        from: "USLGB",
        to: "USDEN",
        carrier: "Union Pacific",
        service: "LA Basin → Denver",
        min: 3,
        max: 5,
        cost: 1210,
        reliability: 86,
        co2Kg: 340,
      }),
      drayLeg({
        id: "cos-usden-door",
        from: "USDEN",
        to: "USDEN-DOOR",
        carrier: "Local drayage",
        min: 1,
        max: 1,
        cost: 450,
        reliability: 95,
        co2Kg: 48,
      }),
    ],
  },

  // ── Atlanta ──
  {
    id: "evg-cnshe-usatl-ipi",
    sellingCarrier: "Evergreen",
    throughBillOfLading: true,
    label: "Shenzhen → Atlanta (Evergreen via Savannah)",
    notes:
      "The shortest inland leg in the set. Savannah lifts to the train on-terminal, so the interchange dwell is a port-side wait rather than a ramp transfer.",
    legs: [
      EVG_SHE_SAV,
      railLeg({
        id: "evg-ussav-usatl-rail",
        from: "USSAV",
        to: "USATL",
        carrier: "Norfolk Southern",
        service: "Savannah → Inman Yard",
        min: 1,
        max: 2,
        cost: 620,
        reliability: 92,
        co2Kg: 95,
      }),
      drayLeg({
        id: "evg-usatl-door",
        from: "USATL",
        to: "USATL-DOOR",
        carrier: "Local drayage",
        min: 1,
        max: 1,
        cost: 440,
        reliability: 95,
        co2Kg: 42,
      }),
    ],
  },
];

// ─── Lookups ──────────────────────────────────────────────

export function getIntermodalRoute(id: string): IntermodalRoute | undefined {
  return INTERMODAL_ROUTES.find((route) => route.id === id);
}
