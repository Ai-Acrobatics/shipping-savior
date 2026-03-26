/**
 * Load container specifications
 * Standard ISO container types used in ocean freight
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'container-specs.json');

interface ContainerSpec {
  type: string;
  iso_code: string;
  description: string;
  length_m: number;
  width_m: number;
  height_m: number;
  length_ft: number;
  width_ft: number;
  height_ft: number;
  max_payload_kg: number;
  tare_weight_kg: number;
  max_gross_weight_kg: number;
  cubic_capacity_cbm: number;
  door_opening_width_m: number;
  door_opening_height_m: number;
  temperature_range?: { min_c: number; max_c: number };
  common_use: string[];
  stackable: boolean;
  max_stack_weight_kg: number;
}

function getContainerSpecs(): ContainerSpec[] {
  return [
    {
      type: '20ft_standard',
      iso_code: '22G1',
      description: '20-foot Standard Dry Container',
      length_m: 5.89,
      width_m: 2.35,
      height_m: 2.39,
      length_ft: 19.33,
      width_ft: 7.71,
      height_ft: 7.84,
      max_payload_kg: 28200,
      tare_weight_kg: 2300,
      max_gross_weight_kg: 30480,
      cubic_capacity_cbm: 33.2,
      door_opening_width_m: 2.34,
      door_opening_height_m: 2.28,
      common_use: ['general cargo', 'heavy goods', 'machinery', 'steel products', 'bags of coffee/rice'],
      stackable: true,
      max_stack_weight_kg: 216960,
    },
    {
      type: '40ft_standard',
      iso_code: '42G1',
      description: '40-foot Standard Dry Container',
      length_m: 12.03,
      width_m: 2.35,
      height_m: 2.39,
      length_ft: 39.47,
      width_ft: 7.71,
      height_ft: 7.84,
      max_payload_kg: 28750,
      tare_weight_kg: 3750,
      max_gross_weight_kg: 32500,
      cubic_capacity_cbm: 67.7,
      door_opening_width_m: 2.34,
      door_opening_height_m: 2.28,
      common_use: ['general cargo', 'furniture', 'consumer electronics', 'auto parts', 'plastics'],
      stackable: true,
      max_stack_weight_kg: 216960,
    },
    {
      type: '40ft_high_cube',
      iso_code: '45G1',
      description: '40-foot High Cube Container',
      length_m: 12.03,
      width_m: 2.35,
      height_m: 2.69,
      length_ft: 39.47,
      width_ft: 7.71,
      height_ft: 8.82,
      max_payload_kg: 28600,
      tare_weight_kg: 3900,
      max_gross_weight_kg: 32500,
      cubic_capacity_cbm: 76.3,
      door_opening_width_m: 2.34,
      door_opening_height_m: 2.58,
      common_use: ['lightweight/voluminous cargo', 'apparel', 'toys', 'footwear boxes', 'furniture'],
      stackable: true,
      max_stack_weight_kg: 216960,
    },
    {
      type: '20ft_reefer',
      iso_code: '22R1',
      description: '20-foot Refrigerated Container',
      length_m: 5.44,
      width_m: 2.29,
      height_m: 2.27,
      length_ft: 17.85,
      width_ft: 7.51,
      height_ft: 7.45,
      max_payload_kg: 27400,
      tare_weight_kg: 3080,
      max_gross_weight_kg: 30480,
      cubic_capacity_cbm: 28.3,
      door_opening_width_m: 2.29,
      door_opening_height_m: 2.26,
      temperature_range: { min_c: -30, max_c: 30 },
      common_use: ['frozen seafood', 'fresh produce', 'pharmaceuticals', 'chemicals', 'dairy'],
      stackable: true,
      max_stack_weight_kg: 216960,
    },
    {
      type: '40ft_reefer',
      iso_code: '42R1',
      description: '40-foot Refrigerated Container',
      length_m: 11.56,
      width_m: 2.29,
      height_m: 2.50,
      length_ft: 37.93,
      width_ft: 7.51,
      height_ft: 8.20,
      max_payload_kg: 29520,
      tare_weight_kg: 4800,
      max_gross_weight_kg: 34320,
      cubic_capacity_cbm: 66.6,
      door_opening_width_m: 2.29,
      door_opening_height_m: 2.44,
      temperature_range: { min_c: -30, max_c: 30 },
      common_use: ['frozen seafood', 'fresh fruits/vegetables', 'meat', 'ice cream', 'pharmaceuticals'],
      stackable: true,
      max_stack_weight_kg: 216960,
    },
    {
      type: '40ft_reefer_high_cube',
      iso_code: '45R1',
      description: '40-foot High Cube Refrigerated Container',
      length_m: 11.56,
      width_m: 2.29,
      height_m: 2.55,
      length_ft: 37.93,
      width_ft: 7.51,
      height_ft: 8.37,
      max_payload_kg: 29180,
      tare_weight_kg: 4950,
      max_gross_weight_kg: 34130,
      cubic_capacity_cbm: 67.5,
      door_opening_width_m: 2.29,
      door_opening_height_m: 2.50,
      temperature_range: { min_c: -30, max_c: 30 },
      common_use: ['high-volume frozen goods', 'flowers', 'temperature-sensitive electronics'],
      stackable: true,
      max_stack_weight_kg: 216960,
    },
    {
      type: '20ft_open_top',
      iso_code: '22U1',
      description: '20-foot Open Top Container',
      length_m: 5.89,
      width_m: 2.35,
      height_m: 2.35,
      length_ft: 19.33,
      width_ft: 7.71,
      height_ft: 7.71,
      max_payload_kg: 28100,
      tare_weight_kg: 2380,
      max_gross_weight_kg: 30480,
      cubic_capacity_cbm: 32.5,
      door_opening_width_m: 2.34,
      door_opening_height_m: 2.28,
      common_use: ['oversized cargo', 'machinery', 'timber', 'marble/stone', 'scrap metal'],
      stackable: true,
      max_stack_weight_kg: 216960,
    },
    {
      type: '40ft_open_top',
      iso_code: '42U1',
      description: '40-foot Open Top Container',
      length_m: 12.03,
      width_m: 2.35,
      height_m: 2.35,
      length_ft: 39.47,
      width_ft: 7.71,
      height_ft: 7.71,
      max_payload_kg: 28620,
      tare_weight_kg: 3880,
      max_gross_weight_kg: 32500,
      cubic_capacity_cbm: 66.4,
      door_opening_width_m: 2.34,
      door_opening_height_m: 2.28,
      common_use: ['oversized cargo', 'machinery', 'project cargo', 'large equipment'],
      stackable: true,
      max_stack_weight_kg: 216960,
    },
    {
      type: '20ft_flat_rack',
      iso_code: '22P1',
      description: '20-foot Flat Rack Container',
      length_m: 5.94,
      width_m: 2.35,
      height_m: 2.35,
      length_ft: 19.49,
      width_ft: 7.71,
      height_ft: 7.71,
      max_payload_kg: 27600,
      tare_weight_kg: 2870,
      max_gross_weight_kg: 30480,
      cubic_capacity_cbm: 0, // Open sides
      door_opening_width_m: 0,
      door_opening_height_m: 0,
      common_use: ['heavy machinery', 'vehicles', 'boats', 'pipes/tubes', 'construction equipment'],
      stackable: false,
      max_stack_weight_kg: 0,
    },
    {
      type: '40ft_flat_rack',
      iso_code: '42P1',
      description: '40-foot Flat Rack Container',
      length_m: 12.08,
      width_m: 2.35,
      height_m: 2.10,
      length_ft: 39.63,
      width_ft: 7.71,
      height_ft: 6.89,
      max_payload_kg: 28600,
      tare_weight_kg: 5300,
      max_gross_weight_kg: 34000,
      cubic_capacity_cbm: 0, // Open sides
      door_opening_width_m: 0,
      door_opening_height_m: 0,
      common_use: ['heavy machinery', 'vehicles', 'oversized/odd-shaped cargo', 'project cargo'],
      stackable: false,
      max_stack_weight_kg: 0,
    },
    {
      type: '20ft_tank',
      iso_code: '22T1',
      description: '20-foot Tank Container (ISO)',
      length_m: 6.06,
      width_m: 2.44,
      height_m: 2.59,
      length_ft: 19.88,
      width_ft: 8.00,
      height_ft: 8.50,
      max_payload_kg: 26000,
      tare_weight_kg: 3600,
      max_gross_weight_kg: 36000,
      cubic_capacity_cbm: 26.0, // Liquid capacity
      door_opening_width_m: 0,
      door_opening_height_m: 0,
      common_use: ['liquid chemicals', 'food-grade liquids', 'fuels', 'hazardous materials', 'wine/spirits'],
      stackable: true,
      max_stack_weight_kg: 216960,
    },
  ];
}

async function main() {
  console.log('=== Container Specs Loader ===\n');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const specs = getContainerSpecs();

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(specs, null, 2));

  console.log(`Loaded ${specs.length} container types to ${OUTPUT_FILE}\n`);
  for (const spec of specs) {
    console.log(`  ${spec.type}: ${spec.cubic_capacity_cbm}cbm, max ${spec.max_payload_kg}kg payload`);
  }
}

main().catch(console.error);
