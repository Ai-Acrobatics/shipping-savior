/**
 * Seed script — runs all data pipeline loaders and reports results
 * Usage: npm run seed
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

interface DataFile {
  name: string;
  file: string;
  countKey?: string;
}

const DATA_FILES: DataFile[] = [
  { name: 'HTS Codes', file: 'hts-schedule.json' },
  { name: 'Ports', file: 'ports.json' },
  { name: 'FTZ Zones', file: 'ftz-zones.json' },
  { name: 'Carrier Routes', file: 'carrier-routes.json' },
  { name: 'Duty Rates (SE Asia)', file: 'duty-rates-sea.json' },
  { name: 'Container Specs', file: 'container-specs.json' },
];

async function main() {
  console.log('=== Shipping Savior Data Seed ===\n');
  console.log(`Data directory: ${DATA_DIR}\n`);

  let totalRecords = 0;
  let filesFound = 0;
  let filesMissing = 0;

  for (const df of DATA_FILES) {
    const filePath = path.join(DATA_DIR, df.file);
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        const count = Array.isArray(data) ? data.length : Object.keys(data).length;
        totalRecords += count;
        filesFound++;
        console.log(`  [OK] ${df.name}: ${count} records (${df.file})`);
      } catch (err: any) {
        console.log(`  [ERR] ${df.name}: Failed to parse ${df.file} — ${err.message}`);
      }
    } else {
      filesMissing++;
      console.log(`  [MISSING] ${df.name}: ${df.file} not found — run the loader script first`);
    }
  }

  // Check for SQL file
  const sqlFile = path.join(DATA_DIR, 'hts-schedule.sql');
  const hasSql = fs.existsSync(sqlFile);

  console.log('\n=== Summary ===');
  console.log(`Data files found: ${filesFound}/${DATA_FILES.length}`);
  console.log(`Data files missing: ${filesMissing}`);
  console.log(`Total records: ${totalRecords}`);
  console.log(`SQL import script: ${hasSql ? 'Available' : 'Not generated'}`);

  if (filesMissing > 0) {
    console.log('\nTo generate missing data, run:');
    console.log('  npm run load:all');
    console.log('\nOr individual loaders:');
    console.log('  npm run load:hts');
    console.log('  npm run load:ports');
    console.log('  npm run load:ftz');
    console.log('  npm run load:routes');
    console.log('  npm run load:duties');
    console.log('  npm run load:containers');
  }

  if (filesFound === DATA_FILES.length) {
    console.log('\nAll data files present — ready for API serving.');
  }
}

main().catch(console.error);
