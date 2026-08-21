// ============================================================
// Multi-modal route markers (AI-12015) — inland nodes
//
// The port dataset (lib/data/ports.ts) only knows seaports and three
// airports, because until now a route ended at the quay. An intermodal
// routing does not: it ends at a rail ramp in Salt Lake City or a door in
// Denver, and the ramp is where the box waits.
//
// `interchangeDwellDays` is the load-bearing field. A container that lands in
// Long Beach on an IPI booking does not go straight onto a train — it waits
// for the next stack train on its lane. Two to four days at LA/LGB is normal
// and is the single most common reason an intermodal quote misses its
// promised date. Modelling it as zero would make every rail routing look
// faster than it is.
//
// Free time and storage rates are ramp-typical figures, not published tariffs;
// they move by terminal and by contract. They are here to size the exposure,
// not to invoice from.
// ============================================================

import type { RouteNode } from "./types";

/** Seaport nodes that intermodal legs interchange at. Mirrors the seaports in
 *  lib/data/ports.ts, with the interchange fields the port record has no
 *  concept of. */
const SEAPORT_NODES: RouteNode[] = [
  {
    code: "USLAX",
    name: "Port of Los Angeles",
    city: "Los Angeles",
    country: "US",
    region: "CA",
    kind: "seaport",
    lat: 33.7395,
    lng: -118.2659,
    // On-dock rail exists but stack trains build to a lane, not to a vessel.
    interchangeDwellDays: 3,
    freeDays: 4,
    storagePerDayUsd: 155,
    servedBy: ["BNSF", "Union Pacific"],
  },
  {
    code: "USLGB",
    name: "Port of Long Beach",
    city: "Long Beach",
    country: "US",
    region: "CA",
    kind: "seaport",
    lat: 33.7543,
    lng: -118.2162,
    interchangeDwellDays: 3,
    freeDays: 4,
    storagePerDayUsd: 150,
    servedBy: ["BNSF", "Union Pacific"],
  },
  {
    code: "USSEA",
    name: "Port of Seattle/Tacoma (NWSA)",
    city: "Seattle",
    country: "US",
    region: "WA",
    kind: "seaport",
    lat: 47.5615,
    lng: -122.3378,
    interchangeDwellDays: 2,
    freeDays: 4,
    storagePerDayUsd: 130,
    servedBy: ["BNSF", "Union Pacific"],
  },
  {
    code: "USNYC",
    name: "Port of New York/New Jersey",
    city: "New York",
    country: "US",
    region: "NJ",
    kind: "seaport",
    lat: 40.6635,
    lng: -74.0636,
    interchangeDwellDays: 2,
    freeDays: 5,
    storagePerDayUsd: 165,
    servedBy: ["Norfolk Southern", "CSX"],
  },
  {
    code: "USSAV",
    name: "Port of Savannah",
    city: "Savannah",
    country: "US",
    region: "GA",
    kind: "seaport",
    lat: 32.0835,
    lng: -81.0998,
    // Garden City's on-terminal Mason Mega Rail lifts direct to the train.
    interchangeDwellDays: 2,
    freeDays: 5,
    storagePerDayUsd: 120,
    servedBy: ["Norfolk Southern", "CSX"],
  },
  {
    code: "USHOU",
    name: "Port of Houston",
    city: "Houston",
    country: "US",
    region: "TX",
    kind: "seaport",
    lat: 29.7272,
    lng: -95.0278,
    interchangeDwellDays: 2,
    freeDays: 5,
    storagePerDayUsd: 125,
    servedBy: ["Union Pacific", "BNSF"],
  },
];

/** Interior Point Intermodal ramps — where an inland routing actually ends
 *  before the final truck move. */
const RAIL_RAMP_NODES: RouteNode[] = [
  {
    code: "USSLC",
    name: "Salt Lake City Intermodal Ramp",
    city: "Salt Lake City",
    country: "US",
    region: "UT",
    kind: "rail_ramp",
    lat: 40.7608,
    lng: -111.891,
    interchangeDwellDays: 1,
    freeDays: 2,
    storagePerDayUsd: 95,
    servedBy: ["Union Pacific"],
  },
  {
    code: "USCHI",
    name: "Chicago Intermodal Ramps (Joliet / Logistics Park)",
    city: "Chicago",
    country: "US",
    region: "IL",
    kind: "rail_ramp",
    lat: 41.8781,
    lng: -87.6298,
    // The largest inland hub in North America, and the most congested.
    interchangeDwellDays: 2,
    freeDays: 2,
    storagePerDayUsd: 110,
    servedBy: ["BNSF", "Union Pacific", "Norfolk Southern", "CSX"],
  },
  {
    code: "USDAL",
    name: "Dallas/Fort Worth Intermodal Ramp (Alliance)",
    city: "Dallas",
    country: "US",
    region: "TX",
    kind: "rail_ramp",
    lat: 32.7767,
    lng: -96.797,
    interchangeDwellDays: 1,
    freeDays: 2,
    storagePerDayUsd: 100,
    servedBy: ["BNSF", "Union Pacific"],
  },
  {
    code: "USMEM",
    name: "Memphis Intermodal Ramp",
    city: "Memphis",
    country: "US",
    region: "TN",
    kind: "rail_ramp",
    lat: 35.1495,
    lng: -90.049,
    interchangeDwellDays: 1,
    freeDays: 2,
    storagePerDayUsd: 95,
    servedBy: ["BNSF", "Union Pacific", "Norfolk Southern", "CSX"],
  },
  {
    code: "USDEN",
    name: "Denver Intermodal Ramp",
    city: "Denver",
    country: "US",
    region: "CO",
    kind: "rail_ramp",
    lat: 39.7392,
    lng: -104.9903,
    interchangeDwellDays: 1,
    freeDays: 2,
    storagePerDayUsd: 95,
    servedBy: ["Union Pacific", "BNSF"],
  },
  {
    code: "USATL",
    name: "Atlanta Intermodal Ramp (Inman / Austell)",
    city: "Atlanta",
    country: "US",
    region: "GA",
    kind: "rail_ramp",
    lat: 33.749,
    lng: -84.388,
    interchangeDwellDays: 1,
    freeDays: 2,
    storagePerDayUsd: 100,
    servedBy: ["Norfolk Southern", "CSX"],
  },
  {
    code: "USCMH",
    name: "Columbus Intermodal Ramp (Rickenbacker)",
    city: "Columbus",
    country: "US",
    region: "OH",
    kind: "rail_ramp",
    lat: 39.9612,
    lng: -82.9988,
    interchangeDwellDays: 1,
    freeDays: 2,
    storagePerDayUsd: 90,
    servedBy: ["Norfolk Southern", "CSX"],
  },
];

/** Final delivery markets — the door the cargo is actually going to. */
const INLAND_POINT_NODES: RouteNode[] = [
  {
    code: "USSLC-DOOR",
    name: "Salt Lake City delivery area",
    city: "Salt Lake City",
    country: "US",
    region: "UT",
    kind: "inland_point",
    lat: 40.7608,
    lng: -111.891,
    interchangeDwellDays: 0,
    freeDays: 0,
    storagePerDayUsd: 0,
  },
  {
    code: "USCHI-DOOR",
    name: "Chicago delivery area",
    city: "Chicago",
    country: "US",
    region: "IL",
    kind: "inland_point",
    lat: 41.8781,
    lng: -87.6298,
    interchangeDwellDays: 0,
    freeDays: 0,
    storagePerDayUsd: 0,
  },
  {
    code: "USDEN-DOOR",
    name: "Denver delivery area",
    city: "Denver",
    country: "US",
    region: "CO",
    kind: "inland_point",
    lat: 39.7392,
    lng: -104.9903,
    interchangeDwellDays: 0,
    freeDays: 0,
    storagePerDayUsd: 0,
  },
  {
    code: "USATL-DOOR",
    name: "Atlanta delivery area",
    city: "Atlanta",
    country: "US",
    region: "GA",
    kind: "inland_point",
    lat: 33.749,
    lng: -84.388,
    interchangeDwellDays: 0,
    freeDays: 0,
    storagePerDayUsd: 0,
  },
];

/** Origin seaports and airports referenced by intermodal legs. */
const ORIGIN_NODES: RouteNode[] = [
  { code: "CNSHA", name: "Port of Shanghai", city: "Shanghai", country: "CN", kind: "seaport", lat: 31.3497, lng: 121.5213, interchangeDwellDays: 0, freeDays: 7, storagePerDayUsd: 60 },
  { code: "CNSHE", name: "Port of Shenzhen (Yantian)", city: "Shenzhen", country: "CN", kind: "seaport", lat: 22.5593, lng: 114.2683, interchangeDwellDays: 0, freeDays: 7, storagePerDayUsd: 55 },
  { code: "CNNBO", name: "Port of Ningbo-Zhoushan", city: "Ningbo", country: "CN", kind: "seaport", lat: 29.8683, lng: 121.6538, interchangeDwellDays: 0, freeDays: 7, storagePerDayUsd: 55 },
  { code: "VNSGN", name: "Tan Cang-Cat Lai Terminal", city: "Ho Chi Minh City", country: "VN", kind: "seaport", lat: 10.7626, lng: 106.7533, interchangeDwellDays: 0, freeDays: 7, storagePerDayUsd: 45 },
  { code: "THBKK", name: "Laem Chabang Port", city: "Laem Chabang", country: "TH", kind: "seaport", lat: 13.0844, lng: 100.8881, interchangeDwellDays: 0, freeDays: 7, storagePerDayUsd: 45 },
  { code: "CNHKG-AIR", name: "Hong Kong International Airport (HKG)", city: "Hong Kong", country: "HK", kind: "airport", lat: 22.308, lng: 113.9185, interchangeDwellDays: 0, freeDays: 2, storagePerDayUsd: 180 },
  { code: "USORD-AIR", name: "O'Hare International Airport (ORD)", city: "Chicago", country: "US", region: "IL", kind: "airport", lat: 41.9742, lng: -87.9073, interchangeDwellDays: 1, freeDays: 2, storagePerDayUsd: 190 },
  { code: "USLAX-AIR", name: "Los Angeles International Airport (LAX)", city: "Los Angeles", country: "US", region: "CA", kind: "airport", lat: 33.9425, lng: -118.4081, interchangeDwellDays: 1, freeDays: 2, storagePerDayUsd: 200 },
];

export const ROUTE_NODES: RouteNode[] = [
  ...ORIGIN_NODES,
  ...SEAPORT_NODES,
  ...RAIL_RAMP_NODES,
  ...INLAND_POINT_NODES,
];

const NODES_BY_CODE = new Map(ROUTE_NODES.map((n) => [n.code, n]));

export function getNode(code: string): RouteNode | undefined {
  return NODES_BY_CODE.get(code);
}

export function getNodesByKind(kind: RouteNode["kind"]): RouteNode[] {
  return ROUTE_NODES.filter((n) => n.kind === kind);
}

/** Every inland ramp and delivery point — the destinations that were not
 *  expressible before this feature. */
export function getInlandDestinations(): RouteNode[] {
  return ROUTE_NODES.filter((n) => n.kind === "rail_ramp" || n.kind === "inland_point");
}
