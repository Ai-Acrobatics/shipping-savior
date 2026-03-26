/**
 * Benchmark 01: searoute-js — SE Asia Port Pairs
 * Tests accuracy of maritime route distance calculations
 * Compares against known reference distances from sea-distances.org
 */

import searouteFn from 'searoute-js';

// SE Asia -> US port pairs with known reference distances (nautical miles)
// Reference data from sea-distances.org and marinetraffic.com
const portPairs = [
  {
    name: 'Ho Chi Minh City (Cat Lai) → Los Angeles',
    origin: [106.7614, 10.7352],      // Cat Lai Terminal, HCMC
    destination: [-118.2510, 33.7480], // Port of LA
    referenceNM: 7280,                  // ~7,200-7,400 NM via Pacific
  },
  {
    name: 'Ho Chi Minh City (Cat Lai) → Long Beach',
    origin: [106.7614, 10.7352],
    destination: [-118.1891, 33.7540],
    referenceNM: 7290,
  },
  {
    name: 'Bangkok (Laem Chabang) → Los Angeles',
    origin: [100.8821, 13.0827],       // Laem Chabang, Thailand
    destination: [-118.2510, 33.7480],
    referenceNM: 7560,
  },
  {
    name: 'Singapore → Los Angeles',
    origin: [103.8198, 1.2644],        // Port of Singapore
    destination: [-118.2510, 33.7480],
    referenceNM: 7850,
  },
  {
    name: 'Singapore → New York/New Jersey',
    origin: [103.8198, 1.2644],
    destination: [-74.1448, 40.6689],  // Port Newark
    referenceNM: 9530,                 // Via Suez Canal
  },
  {
    name: 'Shanghai → Los Angeles',
    origin: [121.8438, 31.3464],       // Shanghai Port
    destination: [-118.2510, 33.7480],
    referenceNM: 5780,
  },
  {
    name: 'Busan → Los Angeles',
    origin: [129.0403, 35.0796],       // Port of Busan
    destination: [-118.2510, 33.7480],
    referenceNM: 5530,
  },
  {
    name: 'Jakarta (Tanjung Priok) → Los Angeles',
    origin: [106.8823, -6.0989],       // Tanjung Priok, Jakarta
    destination: [-118.2510, 33.7480],
    referenceNM: 8250,
  },
  {
    name: 'Manila → Los Angeles',
    origin: [120.9496, 14.5840],       // Port of Manila
    destination: [-118.2510, 33.7480],
    referenceNM: 6540,
  },
  {
    name: 'Hai Phong → Long Beach',
    origin: [106.7512, 20.8453],       // Hai Phong, Vietnam
    destination: [-118.1891, 33.7540],
    referenceNM: 7450,
  },
  {
    name: 'Ho Chi Minh City → Panama Canal → Miami',
    origin: [106.7614, 10.7352],
    destination: [-80.1340, 25.7706],  // Port of Miami
    referenceNM: 10200,                // Via Pacific + Panama Canal
  },
  {
    name: 'Singapore → Savannah',
    origin: [103.8198, 1.2644],
    destination: [-81.0854, 32.0835],  // Port of Savannah
    referenceNM: 9800,
  },
];

console.log('=== BENCHMARK: searoute-js — SE Asia Port Pairs ===\n');
console.log('Testing route accuracy against known reference distances...\n');

const results = [];
let totalError = 0;
let successCount = 0;
let failCount = 0;

for (const pair of portPairs) {
  const startTime = performance.now();

  try {
    // searoute-js takes raw coordinate arrays [lon, lat]
    const route = searouteFn(pair.origin, pair.destination);
    const elapsed = performance.now() - startTime;

    // searoute-js returns distance — check units property
    const units = route.properties?.units || 'nm';
    const rawLength = route.properties?.length || 0;
    const distanceNM = units === 'km' ? rawLength / 1.852 : rawLength;
    const errorPct = Math.abs(distanceNM - pair.referenceNM) / pair.referenceNM * 100;
    const coordinateCount = route.geometry?.coordinates?.length || 0;

    results.push({
      route: pair.name,
      calculatedNM: Math.round(distanceNM),
      referenceNM: pair.referenceNM,
      errorPct: errorPct.toFixed(1),
      timeMs: elapsed.toFixed(1),
      waypoints: coordinateCount,
      status: errorPct < 15 ? 'PASS' : 'WARN',
    });

    totalError += errorPct;
    if (errorPct < 15) successCount++;
    else failCount++;

    console.log(`✓ ${pair.name}`);
    console.log(`  Calculated: ${Math.round(distanceNM)} NM | Reference: ${pair.referenceNM} NM | Error: ${errorPct.toFixed(1)}% | Time: ${elapsed.toFixed(1)}ms | Waypoints: ${coordinateCount}`);
    console.log();
  } catch (error) {
    const elapsed = performance.now() - startTime;
    results.push({
      route: pair.name,
      calculatedNM: 'ERROR',
      referenceNM: pair.referenceNM,
      errorPct: 'N/A',
      timeMs: elapsed.toFixed(1),
      waypoints: 0,
      status: 'FAIL',
      error: error.message,
    });
    failCount++;
    console.log(`✗ ${pair.name}: ${error.message}\n`);
  }
}

const avgError = totalError / results.filter(r => r.status !== 'FAIL').length;

console.log('\n=== SUMMARY ===');
console.log(`Routes tested: ${results.length}`);
console.log(`Pass (<15% error): ${successCount}`);
console.log(`Warn/Fail: ${failCount}`);
console.log(`Average error: ${avgError.toFixed(1)}%`);
console.log(`\nVerdict: ${avgError < 10 ? 'RECOMMENDED — acceptable accuracy for Phase 1' : avgError < 20 ? 'ACCEPTABLE — use with accuracy caveats' : 'NOT RECOMMENDED — accuracy too low'}`);

// Output JSON for report compilation
const output = {
  benchmark: 'searoute-js',
  timestamp: new Date().toISOString(),
  summary: {
    totalRoutes: results.length,
    passCount: successCount,
    failCount,
    avgErrorPct: parseFloat(avgError.toFixed(1)),
    verdict: avgError < 10 ? 'RECOMMENDED' : avgError < 20 ? 'ACCEPTABLE' : 'NOT_RECOMMENDED',
  },
  results,
};

await import('fs').then(fs => {
  fs.writeFileSync('benchmarks/results/01-searoute.json', JSON.stringify(output, null, 2));
  console.log('\nResults written to benchmarks/results/01-searoute.json');
});
