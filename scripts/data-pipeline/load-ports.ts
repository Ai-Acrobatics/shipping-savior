/**
 * Load port data — curated dataset of major world ports
 * Focus on SE Asia → US trade routes and transshipment hubs
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'ports.json');

interface Port {
  locode: string;
  name: string;
  country: string;
  country_code: string;
  lat: number;
  lng: number;
  port_type: 'seaport' | 'river_port' | 'inland_port' | 'dry_port';
  size: 'mega' | 'large' | 'medium' | 'small';
  annual_teu?: number; // Twenty-foot equivalent units
  region: string;
  timezone: string;
}

function getPorts(): Port[] {
  return [
    // ===== SE ASIA ORIGIN PORTS =====
    { locode: 'VNSGN', name: 'Ho Chi Minh City (Cat Lai)', country: 'Vietnam', country_code: 'VN', lat: 10.7626, lng: 106.7432, port_type: 'seaport', size: 'mega', annual_teu: 8500000, region: 'SE Asia', timezone: 'Asia/Ho_Chi_Minh' },
    { locode: 'VNHPH', name: 'Hai Phong', country: 'Vietnam', country_code: 'VN', lat: 20.8449, lng: 106.6881, port_type: 'seaport', size: 'large', annual_teu: 5800000, region: 'SE Asia', timezone: 'Asia/Ho_Chi_Minh' },
    { locode: 'VNVUT', name: 'Vung Tau', country: 'Vietnam', country_code: 'VN', lat: 10.3460, lng: 107.0843, port_type: 'seaport', size: 'medium', annual_teu: 1200000, region: 'SE Asia', timezone: 'Asia/Ho_Chi_Minh' },
    { locode: 'THBKK', name: 'Bangkok (Laem Chabang)', country: 'Thailand', country_code: 'TH', lat: 13.0796, lng: 100.8828, port_type: 'seaport', size: 'mega', annual_teu: 8900000, region: 'SE Asia', timezone: 'Asia/Bangkok' },
    { locode: 'THLCH', name: 'Laem Chabang', country: 'Thailand', country_code: 'TH', lat: 13.0833, lng: 100.8833, port_type: 'seaport', size: 'mega', annual_teu: 8900000, region: 'SE Asia', timezone: 'Asia/Bangkok' },
    { locode: 'IDJKT', name: 'Jakarta (Tanjung Priok)', country: 'Indonesia', country_code: 'ID', lat: -6.1000, lng: 106.8833, port_type: 'seaport', size: 'large', annual_teu: 7600000, region: 'SE Asia', timezone: 'Asia/Jakarta' },
    { locode: 'IDSUB', name: 'Surabaya (Tanjung Perak)', country: 'Indonesia', country_code: 'ID', lat: -7.2028, lng: 112.7350, port_type: 'seaport', size: 'medium', annual_teu: 3500000, region: 'SE Asia', timezone: 'Asia/Jakarta' },
    { locode: 'KHPNH', name: 'Phnom Penh', country: 'Cambodia', country_code: 'KH', lat: 11.5564, lng: 104.9282, port_type: 'river_port', size: 'medium', annual_teu: 350000, region: 'SE Asia', timezone: 'Asia/Phnom_Penh' },
    { locode: 'KHSHV', name: 'Sihanoukville', country: 'Cambodia', country_code: 'KH', lat: 10.6093, lng: 103.5296, port_type: 'seaport', size: 'medium', annual_teu: 700000, region: 'SE Asia', timezone: 'Asia/Phnom_Penh' },
    { locode: 'MMRGN', name: 'Yangon', country: 'Myanmar', country_code: 'MM', lat: 16.8409, lng: 96.1735, port_type: 'seaport', size: 'medium', annual_teu: 600000, region: 'SE Asia', timezone: 'Asia/Yangon' },
    { locode: 'PHMNL', name: 'Manila', country: 'Philippines', country_code: 'PH', lat: 14.5176, lng: 120.9820, port_type: 'seaport', size: 'large', annual_teu: 5500000, region: 'SE Asia', timezone: 'Asia/Manila' },
    { locode: 'MYPEN', name: 'Penang', country: 'Malaysia', country_code: 'MY', lat: 5.4164, lng: 100.3467, port_type: 'seaport', size: 'large', annual_teu: 1600000, region: 'SE Asia', timezone: 'Asia/Kuala_Lumpur' },
    { locode: 'BDCGP', name: 'Chittagong', country: 'Bangladesh', country_code: 'BD', lat: 22.3280, lng: 91.8017, port_type: 'seaport', size: 'large', annual_teu: 3400000, region: 'South Asia', timezone: 'Asia/Dhaka' },

    // ===== TRANSSHIPMENT HUBS =====
    { locode: 'SGSIN', name: 'Singapore', country: 'Singapore', country_code: 'SG', lat: 1.2644, lng: 103.8222, port_type: 'seaport', size: 'mega', annual_teu: 37200000, region: 'SE Asia', timezone: 'Asia/Singapore' },
    { locode: 'MYPKG', name: 'Port Klang', country: 'Malaysia', country_code: 'MY', lat: 2.9975, lng: 101.3833, port_type: 'seaport', size: 'mega', annual_teu: 13200000, region: 'SE Asia', timezone: 'Asia/Kuala_Lumpur' },
    { locode: 'MYTPP', name: 'Tanjung Pelepas', country: 'Malaysia', country_code: 'MY', lat: 1.3625, lng: 103.5481, port_type: 'seaport', size: 'mega', annual_teu: 11200000, region: 'SE Asia', timezone: 'Asia/Kuala_Lumpur' },
    { locode: 'LKCMB', name: 'Colombo', country: 'Sri Lanka', country_code: 'LK', lat: 6.9508, lng: 79.8466, port_type: 'seaport', size: 'large', annual_teu: 7250000, region: 'South Asia', timezone: 'Asia/Colombo' },
    { locode: 'KRPUS', name: 'Busan', country: 'South Korea', country_code: 'KR', lat: 35.1028, lng: 129.0403, port_type: 'seaport', size: 'mega', annual_teu: 22700000, region: 'East Asia', timezone: 'Asia/Seoul' },
    { locode: 'TWKHH', name: 'Kaohsiung', country: 'Taiwan', country_code: 'TW', lat: 22.6149, lng: 120.2881, port_type: 'seaport', size: 'mega', annual_teu: 9750000, region: 'East Asia', timezone: 'Asia/Taipei' },
    { locode: 'PABLB', name: 'Balboa (Panama Canal)', country: 'Panama', country_code: 'PA', lat: 8.9556, lng: -79.5639, port_type: 'seaport', size: 'large', annual_teu: 3500000, region: 'Central America', timezone: 'America/Panama' },
    { locode: 'PACOL', name: 'Colon (Panama Canal)', country: 'Panama', country_code: 'PA', lat: 9.3547, lng: -79.9006, port_type: 'seaport', size: 'large', annual_teu: 4500000, region: 'Central America', timezone: 'America/Panama' },
    { locode: 'COCTG', name: 'Cartagena', country: 'Colombia', country_code: 'CO', lat: 10.3910, lng: -75.5144, port_type: 'seaport', size: 'large', annual_teu: 3300000, region: 'South America', timezone: 'America/Bogota' },
    { locode: 'AEAUH', name: 'Abu Dhabi (Khalifa Port)', country: 'UAE', country_code: 'AE', lat: 24.8029, lng: 54.6451, port_type: 'seaport', size: 'large', annual_teu: 2500000, region: 'Middle East', timezone: 'Asia/Dubai' },
    { locode: 'AEJEA', name: 'Jebel Ali (Dubai)', country: 'UAE', country_code: 'AE', lat: 25.0112, lng: 55.0640, port_type: 'seaport', size: 'mega', annual_teu: 14500000, region: 'Middle East', timezone: 'Asia/Dubai' },
    { locode: 'OMSLL', name: 'Salalah', country: 'Oman', country_code: 'OM', lat: 16.9486, lng: 54.0072, port_type: 'seaport', size: 'large', annual_teu: 4100000, region: 'Middle East', timezone: 'Asia/Muscat' },

    // ===== CHINA PORTS (for comparison) =====
    { locode: 'CNSHA', name: 'Shanghai', country: 'China', country_code: 'CN', lat: 31.3500, lng: 121.5000, port_type: 'seaport', size: 'mega', annual_teu: 47000000, region: 'East Asia', timezone: 'Asia/Shanghai' },
    { locode: 'CNSZX', name: 'Shenzhen (Yantian)', country: 'China', country_code: 'CN', lat: 22.5431, lng: 114.0579, port_type: 'seaport', size: 'mega', annual_teu: 28700000, region: 'East Asia', timezone: 'Asia/Shanghai' },
    { locode: 'CNNGB', name: 'Ningbo-Zhoushan', country: 'China', country_code: 'CN', lat: 29.8683, lng: 121.5440, port_type: 'seaport', size: 'mega', annual_teu: 33500000, region: 'East Asia', timezone: 'Asia/Shanghai' },
    { locode: 'CNQIN', name: 'Qingdao', country: 'China', country_code: 'CN', lat: 36.0861, lng: 120.3833, port_type: 'seaport', size: 'mega', annual_teu: 25000000, region: 'East Asia', timezone: 'Asia/Shanghai' },
    { locode: 'CNTXG', name: 'Tianjin (Xingang)', country: 'China', country_code: 'CN', lat: 38.9867, lng: 117.7000, port_type: 'seaport', size: 'mega', annual_teu: 21000000, region: 'East Asia', timezone: 'Asia/Shanghai' },
    { locode: 'CNCAN', name: 'Guangzhou (Nansha)', country: 'China', country_code: 'CN', lat: 22.7208, lng: 113.5583, port_type: 'seaport', size: 'mega', annual_teu: 24000000, region: 'East Asia', timezone: 'Asia/Shanghai' },
    { locode: 'CNXMN', name: 'Xiamen', country: 'China', country_code: 'CN', lat: 24.4333, lng: 118.0833, port_type: 'seaport', size: 'large', annual_teu: 12000000, region: 'East Asia', timezone: 'Asia/Shanghai' },

    // ===== US DESTINATION PORTS =====
    { locode: 'USLGB', name: 'Long Beach', country: 'United States', country_code: 'US', lat: 33.7542, lng: -118.2150, port_type: 'seaport', size: 'mega', annual_teu: 9100000, region: 'North America', timezone: 'America/Los_Angeles' },
    { locode: 'USLAX', name: 'Los Angeles', country: 'United States', country_code: 'US', lat: 33.7400, lng: -118.2700, port_type: 'seaport', size: 'mega', annual_teu: 9900000, region: 'North America', timezone: 'America/Los_Angeles' },
    { locode: 'USOAK', name: 'Oakland', country: 'United States', country_code: 'US', lat: 37.7954, lng: -122.2786, port_type: 'seaport', size: 'large', annual_teu: 2500000, region: 'North America', timezone: 'America/Los_Angeles' },
    { locode: 'USSEA', name: 'Seattle', country: 'United States', country_code: 'US', lat: 47.5810, lng: -122.3482, port_type: 'seaport', size: 'large', annual_teu: 3200000, region: 'North America', timezone: 'America/Los_Angeles' },
    { locode: 'USTAC', name: 'Tacoma', country: 'United States', country_code: 'US', lat: 47.2668, lng: -122.4233, port_type: 'seaport', size: 'large', annual_teu: 2100000, region: 'North America', timezone: 'America/Los_Angeles' },
    { locode: 'USSAV', name: 'Savannah', country: 'United States', country_code: 'US', lat: 32.0835, lng: -81.0998, port_type: 'seaport', size: 'mega', annual_teu: 5800000, region: 'North America', timezone: 'America/New_York' },
    { locode: 'USNYC', name: 'New York / New Jersey', country: 'United States', country_code: 'US', lat: 40.6667, lng: -74.0333, port_type: 'seaport', size: 'mega', annual_teu: 8900000, region: 'North America', timezone: 'America/New_York' },
    { locode: 'USHOU', name: 'Houston', country: 'United States', country_code: 'US', lat: 29.7344, lng: -95.2710, port_type: 'seaport', size: 'large', annual_teu: 3800000, region: 'North America', timezone: 'America/Chicago' },
    { locode: 'USCHS', name: 'Charleston', country: 'United States', country_code: 'US', lat: 32.7876, lng: -79.9403, port_type: 'seaport', size: 'large', annual_teu: 2800000, region: 'North America', timezone: 'America/New_York' },
    { locode: 'USNOR', name: 'Norfolk', country: 'United States', country_code: 'US', lat: 36.9092, lng: -76.3312, port_type: 'seaport', size: 'large', annual_teu: 3400000, region: 'North America', timezone: 'America/New_York' },
    { locode: 'USBOS', name: 'Boston', country: 'United States', country_code: 'US', lat: 42.3519, lng: -71.0484, port_type: 'seaport', size: 'medium', annual_teu: 300000, region: 'North America', timezone: 'America/New_York' },
    { locode: 'USMIA', name: 'Miami', country: 'United States', country_code: 'US', lat: 25.7742, lng: -80.1697, port_type: 'seaport', size: 'large', annual_teu: 1200000, region: 'North America', timezone: 'America/New_York' },
    { locode: 'USJAX', name: 'Jacksonville', country: 'United States', country_code: 'US', lat: 30.3978, lng: -81.6183, port_type: 'seaport', size: 'medium', annual_teu: 1500000, region: 'North America', timezone: 'America/New_York' },
    { locode: 'USMOB', name: 'Mobile', country: 'United States', country_code: 'US', lat: 30.7041, lng: -88.0260, port_type: 'seaport', size: 'medium', annual_teu: 500000, region: 'North America', timezone: 'America/Chicago' },
    { locode: 'USNOL', name: 'New Orleans', country: 'United States', country_code: 'US', lat: 29.9392, lng: -90.0561, port_type: 'seaport', size: 'medium', annual_teu: 650000, region: 'North America', timezone: 'America/Chicago' },
    { locode: 'USBAL', name: 'Baltimore', country: 'United States', country_code: 'US', lat: 39.2631, lng: -76.5800, port_type: 'seaport', size: 'medium', annual_teu: 1000000, region: 'North America', timezone: 'America/New_York' },
    { locode: 'USPHL', name: 'Philadelphia', country: 'United States', country_code: 'US', lat: 39.8866, lng: -75.1237, port_type: 'seaport', size: 'medium', annual_teu: 700000, region: 'North America', timezone: 'America/New_York' },
    { locode: 'USWIL', name: 'Wilmington, NC', country: 'United States', country_code: 'US', lat: 34.1832, lng: -77.9437, port_type: 'seaport', size: 'medium', annual_teu: 400000, region: 'North America', timezone: 'America/New_York' },

    // ===== EUROPE =====
    { locode: 'NLRTM', name: 'Rotterdam', country: 'Netherlands', country_code: 'NL', lat: 51.9036, lng: 4.4936, port_type: 'seaport', size: 'mega', annual_teu: 14500000, region: 'Europe', timezone: 'Europe/Amsterdam' },
    { locode: 'DEHAM', name: 'Hamburg', country: 'Germany', country_code: 'DE', lat: 53.5333, lng: 9.9667, port_type: 'seaport', size: 'mega', annual_teu: 8700000, region: 'Europe', timezone: 'Europe/Berlin' },
    { locode: 'BEANR', name: 'Antwerp', country: 'Belgium', country_code: 'BE', lat: 51.2333, lng: 4.4000, port_type: 'seaport', size: 'mega', annual_teu: 12000000, region: 'Europe', timezone: 'Europe/Brussels' },
    { locode: 'GBFXT', name: 'Felixstowe', country: 'United Kingdom', country_code: 'GB', lat: 51.9500, lng: 1.3500, port_type: 'seaport', size: 'large', annual_teu: 3800000, region: 'Europe', timezone: 'Europe/London' },
    { locode: 'ESVLC', name: 'Valencia', country: 'Spain', country_code: 'ES', lat: 39.4333, lng: -0.3167, port_type: 'seaport', size: 'large', annual_teu: 5600000, region: 'Europe', timezone: 'Europe/Madrid' },
    { locode: 'GRPIR', name: 'Piraeus', country: 'Greece', country_code: 'GR', lat: 37.9428, lng: 23.6383, port_type: 'seaport', size: 'large', annual_teu: 5400000, region: 'Europe', timezone: 'Europe/Athens' },

    // ===== INDIA / SOUTH ASIA =====
    { locode: 'INNSA', name: 'Nhava Sheva (JNPT)', country: 'India', country_code: 'IN', lat: 18.9500, lng: 72.9333, port_type: 'seaport', size: 'mega', annual_teu: 5700000, region: 'South Asia', timezone: 'Asia/Kolkata' },
    { locode: 'INMUN', name: 'Mundra', country: 'India', country_code: 'IN', lat: 22.8398, lng: 69.7253, port_type: 'seaport', size: 'large', annual_teu: 6500000, region: 'South Asia', timezone: 'Asia/Kolkata' },
    { locode: 'INCHE', name: 'Chennai', country: 'India', country_code: 'IN', lat: 13.0827, lng: 80.2707, port_type: 'seaport', size: 'large', annual_teu: 1800000, region: 'South Asia', timezone: 'Asia/Kolkata' },

    // ===== JAPAN =====
    { locode: 'JPTYO', name: 'Tokyo', country: 'Japan', country_code: 'JP', lat: 35.6528, lng: 139.8397, port_type: 'seaport', size: 'large', annual_teu: 4400000, region: 'East Asia', timezone: 'Asia/Tokyo' },
    { locode: 'JPYOK', name: 'Yokohama', country: 'Japan', country_code: 'JP', lat: 35.4500, lng: 139.6500, port_type: 'seaport', size: 'large', annual_teu: 2900000, region: 'East Asia', timezone: 'Asia/Tokyo' },
    { locode: 'JPKOB', name: 'Kobe', country: 'Japan', country_code: 'JP', lat: 34.6833, lng: 135.1833, port_type: 'seaport', size: 'large', annual_teu: 2800000, region: 'East Asia', timezone: 'Asia/Tokyo' },

    // ===== AFRICA =====
    { locode: 'EGPSD', name: 'Port Said (Suez Canal)', country: 'Egypt', country_code: 'EG', lat: 31.2589, lng: 32.3019, port_type: 'seaport', size: 'large', annual_teu: 3800000, region: 'Middle East', timezone: 'Africa/Cairo' },
    { locode: 'MAPTM', name: 'Tanger Med', country: 'Morocco', country_code: 'MA', lat: 35.8831, lng: -5.4928, port_type: 'seaport', size: 'large', annual_teu: 7200000, region: 'Africa', timezone: 'Africa/Casablanca' },
    { locode: 'ZADUR', name: 'Durban', country: 'South Africa', country_code: 'ZA', lat: -29.8681, lng: 31.0500, port_type: 'seaport', size: 'large', annual_teu: 2900000, region: 'Africa', timezone: 'Africa/Johannesburg' },
  ];
}

async function main() {
  console.log('=== Port Data Loader ===\n');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const ports = getPorts();

  // Validate
  const locodes = new Set<string>();
  for (const port of ports) {
    if (locodes.has(port.locode)) {
      console.warn(`WARNING: Duplicate LOCODE: ${port.locode}`);
    }
    locodes.add(port.locode);
  }

  // Write JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(ports, null, 2));

  // Summary by region
  const regionCounts: Record<string, number> = {};
  for (const port of ports) {
    regionCounts[port.region] = (regionCounts[port.region] || 0) + 1;
  }

  console.log(`Loaded ${ports.length} ports to ${OUTPUT_FILE}\n`);
  console.log('By region:');
  for (const [region, count] of Object.entries(regionCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${region}: ${count} ports`);
  }

  // Key SE Asia → US ports
  const seAsiaPorts = ports.filter(p => p.region === 'SE Asia');
  const usPorts = ports.filter(p => p.country_code === 'US');
  const transshipment = ports.filter(p => (p.annual_teu || 0) > 5000000);

  console.log(`\nKey stats:`);
  console.log(`  SE Asia origin ports: ${seAsiaPorts.length}`);
  console.log(`  US destination ports: ${usPorts.length}`);
  console.log(`  Mega hubs (>5M TEU): ${transshipment.length}`);
}

main().catch(console.error);
