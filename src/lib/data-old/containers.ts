// ============================================================
// Container Specifications Dataset
// ISO standard container dimensions
// Phase 2: Data Foundation
// ============================================================

import type { ContainerSpec, ContainerType } from "@/lib/types";

export const CONTAINER_SPECS: Record<ContainerType, ContainerSpec> = {
  "20GP": {
    type: "20GP",
    label: "20' General Purpose",
    internalLength: 5.898,
    internalWidth: 2.352,
    internalHeight: 2.393,
    volumeCapacity: 33.2,
    weightCapacity: 21770,
    teus: 1,
    description: "Standard 20-foot container. Good for dense/heavy goods. 1 TEU.",
    coldChain: false,
  },
  "40GP": {
    type: "40GP",
    label: "40' General Purpose",
    internalLength: 12.032,
    internalWidth: 2.352,
    internalHeight: 2.393,
    volumeCapacity: 67.7,
    weightCapacity: 26680,
    teus: 2,
    description: "Standard 40-foot container. Double the volume of a 20GP. 2 TEUs.",
    coldChain: false,
  },
  "40HC": {
    type: "40HC",
    label: "40' High Cube",
    internalLength: 12.032,
    internalWidth: 2.352,
    internalHeight: 2.698,
    volumeCapacity: 76.3,
    weightCapacity: 26460,
    teus: 2,
    description: "40-foot high cube. 30cm taller than 40GP — optimal for light, bulky cargo. 2 TEUs.",
    coldChain: false,
  },
  "20RF": {
    type: "20RF",
    label: "20' Reefer",
    internalLength: 5.444,
    internalWidth: 2.270,
    internalHeight: 2.010,
    volumeCapacity: 24.8,
    weightCapacity: 20320,
    teus: 1,
    description: "20-foot refrigerated container. Temp range: -30°C to +30°C. Cold chain.",
    coldChain: true,
  },
  "40RF": {
    type: "40RF",
    label: "40' Reefer",
    internalLength: 11.583,
    internalWidth: 2.270,
    internalHeight: 2.197,
    volumeCapacity: 57.8,
    weightCapacity: 26460,
    teus: 2,
    description: "40-foot refrigerated container. Temp range: -30°C to +30°C. Cold chain.",
    coldChain: true,
  },
  "LCL": {
    type: "LCL",
    label: "LCL (Less than Container Load)",
    internalLength: 0,
    internalWidth: 0,
    internalHeight: 0,
    volumeCapacity: 0,   // N/A — charged per CBM
    weightCapacity: 0,   // N/A — charged per kg or per CBM
    teus: 0,
    description: "Less than Container Load — share a container with other shippers. Priced per CBM.",
    coldChain: false,
  },
};

/** Get container spec by type */
export function getContainerSpec(type: ContainerType): ContainerSpec {
  return CONTAINER_SPECS[type];
}

/** All container types as array (excluding LCL for volume calc) */
export const FCL_CONTAINER_TYPES: ContainerType[] = ["20GP", "40GP", "40HC", "20RF", "40RF"];

/** Cost per TEU reference rates (USD, Asia-USWC mid-market 2024) */
export const REFERENCE_FREIGHT_RATES: Record<ContainerType, {
  asiaUsWestCoast: number;
  asiaUsEastCoast: number;
  asiaNorthEurope: number;
}> = {
  "20GP": {
    asiaUsWestCoast: 2200,
    asiaUsEastCoast: 4100,
    asiaNorthEurope: 3800,
  },
  "40GP": {
    asiaUsWestCoast: 4200,
    asiaUsEastCoast: 7800,
    asiaNorthEurope: 7200,
  },
  "40HC": {
    asiaUsWestCoast: 4400,
    asiaUsEastCoast: 8200,
    asiaNorthEurope: 7600,
  },
  "20RF": {
    asiaUsWestCoast: 5800,
    asiaUsEastCoast: 9200,
    asiaNorthEurope: 8800,
  },
  "40RF": {
    asiaUsWestCoast: 9500,
    asiaUsEastCoast: 14500,
    asiaNorthEurope: 13200,
  },
  "LCL": {
    asiaUsWestCoast: 45,   // per CBM
    asiaUsEastCoast: 65,
    asiaNorthEurope: 55,
  },
};
