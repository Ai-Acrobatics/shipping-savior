/**
 * Unit tests for the cold-chain shelf-life calculator (AI-10777 / AI-6541).
 *
 * Pure-function math — no DB, no fixtures.
 *
 * What we're locking down:
 *   - Every commodity preset produces sane values (full life when nothing
 *     has been consumed; presets match the documented planning table)
 *   - Q10 = 2 excursion math is EXACT: 24h at +10°C above optimal consumes
 *     exactly 1 extra day of shelf life
 *   - Risk band boundaries: low >50%, moderate 25–50%, high 10–25%,
 *     critical <10% (lower bound of each band is inclusive)
 *   - compareRoutes lift: grapes, 5d elapsed, 14d vs 17d transit, no
 *     deviation → (37 - 34) / 34 = ~8.82% lift for the faster route
 *   - Custom commodity path works without a preset key
 *   - Guard policy: invalid inputs THROW with clear messages (no clamping)
 */
import { describe, it, expect } from 'vitest';
import {
  calculateShelfLife,
  compareRoutes,
  riskLevelForRemainingPct,
  COMMODITY_PRESETS,
  type CommodityKey,
  type ShelfLifeInput,
} from './shelf-life';

/** Zero-consumption base: nothing elapsed, no transit, no excursions. */
const zeroBase: Omit<ShelfLifeInput, 'commodity' | 'custom'> = {
  daysAlreadyElapsed: 0,
  transitDays: 0,
  tempDeviationC: 0,
  deviationHours: 0,
  targetShelfDaysAtDestination: 0,
};

describe('calculateShelfLife — commodity presets', () => {
  const expected: Record<CommodityKey, { baselineDays: number; optimalTempC: number }> = {
    table_grapes: { baselineDays: 56, optimalTempC: -0.5 },
    apples: { baselineDays: 180, optimalTempC: 0 },
    pears: { baselineDays: 120, optimalTempC: -1 },
    strawberries: { baselineDays: 7, optimalTempC: 0 },
    blueberries: { baselineDays: 14, optimalTempC: 0 },
    citrus: { baselineDays: 56, optimalTempC: 5 },
    bananas: { baselineDays: 28, optimalTempC: 13 },
    avocados: { baselineDays: 30, optimalTempC: 5 },
  };

  (Object.keys(expected) as CommodityKey[]).forEach((key) => {
    it(`${key}: returns full sane shelf life with zero consumption`, () => {
      const result = calculateShelfLife({ commodity: key, ...zeroBase });
      expect(result.baselineDays).toBe(expected[key].baselineDays);
      expect(result.optimalTempC).toBe(expected[key].optimalTempC);
      expect(result.extraDaysConsumed).toBe(0);
      expect(result.totalDaysConsumed).toBe(0);
      expect(result.remainingShelfLifeDays).toBe(expected[key].baselineDays);
      expect(result.remainingPct).toBeCloseTo(100, 10);
      expect(result.meetsTarget).toBe(true);
      expect(result.riskLevel).toBe('low');
    });
  });

  it('exposes presets that match the calculator outputs', () => {
    expect(COMMODITY_PRESETS.table_grapes.baselineDays).toBe(56);
    expect(COMMODITY_PRESETS.pears.optimalTempC).toBe(-1);
    expect(COMMODITY_PRESETS.bananas.optimalTempC).toBe(13);
  });
});

describe('calculateShelfLife — Q10 excursion math', () => {
  it('24h at +10°C above optimal consumes exactly 1 extra day', () => {
    const result = calculateShelfLife({
      custom: { baselineDays: 100, optimalTempC: 0 },
      ...zeroBase,
      tempDeviationC: 10,
      deviationHours: 24,
    });
    expect(result.extraDaysConsumed).toBe(1);
    expect(result.remainingShelfLifeDays).toBe(99);
  });

  it('48h at +20°C consumes exactly 6 extra days (2 days * (2^2 - 1))', () => {
    const result = calculateShelfLife({
      custom: { baselineDays: 100, optimalTempC: 0 },
      ...zeroBase,
      tempDeviationC: 20,
      deviationHours: 48,
    });
    expect(result.extraDaysConsumed).toBe(6);
  });

  it('zero deviation consumes zero extra days regardless of hours', () => {
    const result = calculateShelfLife({
      commodity: 'table_grapes',
      ...zeroBase,
      tempDeviationC: 0,
      deviationHours: 336,
    });
    expect(result.extraDaysConsumed).toBe(0);
  });

  it('stacks elapsed + transit + excursion into totalDaysConsumed', () => {
    const result = calculateShelfLife({
      commodity: 'table_grapes',
      daysAlreadyElapsed: 5,
      transitDays: 14,
      tempDeviationC: 10,
      deviationHours: 24,
      targetShelfDaysAtDestination: 0,
    });
    expect(result.totalDaysConsumed).toBeCloseTo(20, 10);
    expect(result.remainingShelfLifeDays).toBeCloseTo(36, 10);
  });

  it('floors remaining shelf life at 0 when fully consumed', () => {
    const result = calculateShelfLife({
      commodity: 'strawberries', // 7d baseline
      ...zeroBase,
      transitDays: 30,
    });
    expect(result.remainingShelfLifeDays).toBe(0);
    expect(result.remainingPct).toBe(0);
    expect(result.riskLevel).toBe('critical');
  });
});

describe('risk thresholds — band boundaries', () => {
  // Use a 100d custom baseline so consumed days map 1:1 to percentage.
  const at = (consumedDays: number) =>
    calculateShelfLife({
      custom: { baselineDays: 100, optimalTempC: 0 },
      ...zeroBase,
      transitDays: consumedDays,
    }).riskLevel;

  it('>50% remaining is low', () => {
    expect(at(49)).toBe('low'); // 51%
    expect(at(49.999)).toBe('low');
  });

  it('exactly 50% remaining is moderate (low requires strictly >50%)', () => {
    expect(at(50)).toBe('moderate');
  });

  it('exactly 25% remaining is moderate (band lower bound inclusive)', () => {
    expect(at(75)).toBe('moderate');
  });

  it('just under 25% remaining is high', () => {
    expect(at(75.001)).toBe('high'); // 24.999%
  });

  it('exactly 10% remaining is high (band lower bound inclusive)', () => {
    expect(at(90)).toBe('high');
  });

  it('below 10% remaining is critical', () => {
    expect(at(90.001)).toBe('critical');
    expect(at(100)).toBe('critical'); // 0%
  });

  it('riskLevelForRemainingPct agrees at the exact boundaries', () => {
    expect(riskLevelForRemainingPct(50.001)).toBe('low');
    expect(riskLevelForRemainingPct(50)).toBe('moderate');
    expect(riskLevelForRemainingPct(25)).toBe('moderate');
    expect(riskLevelForRemainingPct(24.999)).toBe('high');
    expect(riskLevelForRemainingPct(10)).toBe('high');
    expect(riskLevelForRemainingPct(9.999)).toBe('critical');
  });
});

describe('calculateShelfLife — target & buffer', () => {
  it('meetsTarget true with positive buffer when remaining exceeds target', () => {
    const result = calculateShelfLife({
      commodity: 'table_grapes',
      daysAlreadyElapsed: 5,
      transitDays: 14,
      tempDeviationC: 0,
      deviationHours: 0,
      targetShelfDaysAtDestination: 21,
    });
    expect(result.remainingShelfLifeDays).toBe(37);
    expect(result.bufferDays).toBe(16);
    expect(result.meetsTarget).toBe(true);
  });

  it('meetsTarget false with negative buffer on shortfall', () => {
    const result = calculateShelfLife({
      commodity: 'blueberries', // 14d baseline
      daysAlreadyElapsed: 2,
      transitDays: 10,
      tempDeviationC: 0,
      deviationHours: 0,
      targetShelfDaysAtDestination: 7,
    });
    expect(result.remainingShelfLifeDays).toBe(2);
    expect(result.bufferDays).toBe(-5);
    expect(result.meetsTarget).toBe(false);
  });

  it('meetsTarget true when remaining exactly equals target', () => {
    const result = calculateShelfLife({
      custom: { baselineDays: 30, optimalTempC: 0 },
      ...zeroBase,
      transitDays: 10,
      targetShelfDaysAtDestination: 20,
    });
    expect(result.bufferDays).toBe(0);
    expect(result.meetsTarget).toBe(true);
  });
});

describe('compareRoutes — the Matson vs Pasha story', () => {
  it('grapes, 5d elapsed, 14d vs 17d, no deviation → faster route lifts shelf life by 3/34', () => {
    const comparison = compareRoutes(
      {
        commodity: 'table_grapes',
        daysAlreadyElapsed: 5,
        tempDeviationC: 0,
        deviationHours: 0,
        targetShelfDaysAtDestination: 21,
      },
      14,
      17
    );
    expect(comparison.routeA.remainingShelfLifeDays).toBe(37); // 56 - 5 - 14
    expect(comparison.routeB.remainingShelfLifeDays).toBe(34); // 56 - 5 - 17
    expect(comparison.faster).toBe('A');
    expect(comparison.shelfLifeLiftPct).toBeCloseTo((3 / 34) * 100, 10); // ~8.82%
  });

  it('is symmetric: swapping route order flips faster but keeps the same lift', () => {
    const base = {
      commodity: 'table_grapes' as const,
      daysAlreadyElapsed: 5,
      tempDeviationC: 0,
      deviationHours: 0,
      targetShelfDaysAtDestination: 21,
    };
    const ab = compareRoutes(base, 14, 17);
    const ba = compareRoutes(base, 17, 14);
    expect(ba.faster).toBe('B');
    expect(ba.shelfLifeLiftPct).toBeCloseTo(ab.shelfLifeLiftPct as number, 10);
  });

  it('reports a tie with 0% lift for equal transit times', () => {
    const comparison = compareRoutes(
      { commodity: 'apples', ...zeroBase },
      14,
      14
    );
    expect(comparison.faster).toBe('tie');
    expect(comparison.shelfLifeLiftPct).toBe(0);
  });

  it('returns null lift when the slower route arrives with zero shelf life', () => {
    const comparison = compareRoutes(
      { commodity: 'strawberries', ...zeroBase }, // 7d baseline
      5,
      10 // 10 > 7 → slower route remaining = 0
    );
    expect(comparison.routeB.remainingShelfLifeDays).toBe(0);
    expect(comparison.shelfLifeLiftPct).toBeNull();
  });
});

describe('calculateShelfLife — custom commodity path', () => {
  it('uses custom baseline/optimal temp when no preset key is given', () => {
    const result = calculateShelfLife({
      custom: { baselineDays: 21, optimalTempC: 2 },
      ...zeroBase,
      transitDays: 7,
    });
    expect(result.baselineDays).toBe(21);
    expect(result.optimalTempC).toBe(2);
    expect(result.remainingShelfLifeDays).toBe(14);
    expect(result.remainingPct).toBeCloseTo((14 / 21) * 100, 10);
  });

  it('preset key takes precedence when both commodity and custom are given', () => {
    const result = calculateShelfLife({
      commodity: 'table_grapes',
      custom: { baselineDays: 999, optimalTempC: 20 },
      ...zeroBase,
    });
    expect(result.baselineDays).toBe(56);
    expect(result.optimalTempC).toBe(-0.5);
  });
});

describe('calculateShelfLife — input guards (throw policy)', () => {
  it('throws when neither commodity nor custom is provided', () => {
    expect(() => calculateShelfLife({ ...zeroBase })).toThrow(
      /commodity preset key or a custom/
    );
  });

  it('throws on zero or negative custom baselineDays', () => {
    expect(() =>
      calculateShelfLife({ custom: { baselineDays: 0, optimalTempC: 0 }, ...zeroBase })
    ).toThrow(/baselineDays must be > 0/);
    expect(() =>
      calculateShelfLife({ custom: { baselineDays: -5, optimalTempC: 0 }, ...zeroBase })
    ).toThrow(/baselineDays must be > 0/);
  });

  it('throws on negative daysAlreadyElapsed', () => {
    expect(() =>
      calculateShelfLife({ commodity: 'apples', ...zeroBase, daysAlreadyElapsed: -1 })
    ).toThrow(/daysAlreadyElapsed must be >= 0/);
  });

  it('throws on negative transitDays', () => {
    expect(() =>
      calculateShelfLife({ commodity: 'apples', ...zeroBase, transitDays: -3 })
    ).toThrow(/transitDays must be >= 0/);
  });

  it('throws on negative tempDeviationC', () => {
    expect(() =>
      calculateShelfLife({ commodity: 'apples', ...zeroBase, tempDeviationC: -2 })
    ).toThrow(/tempDeviationC must be >= 0/);
  });

  it('throws on negative deviationHours', () => {
    expect(() =>
      calculateShelfLife({ commodity: 'apples', ...zeroBase, deviationHours: -12 })
    ).toThrow(/deviationHours must be >= 0/);
  });

  it('throws on negative targetShelfDaysAtDestination', () => {
    expect(() =>
      calculateShelfLife({
        commodity: 'apples',
        ...zeroBase,
        targetShelfDaysAtDestination: -7,
      })
    ).toThrow(/targetShelfDaysAtDestination must be >= 0/);
  });

  it('throws on non-finite numeric inputs', () => {
    expect(() =>
      calculateShelfLife({ commodity: 'apples', ...zeroBase, transitDays: NaN })
    ).toThrow(/transitDays must be a finite number/);
  });

  it('compareRoutes applies the same guards to transit days', () => {
    expect(() =>
      compareRoutes({ commodity: 'apples', ...zeroBase }, -1, 17)
    ).toThrow(/transitDays must be >= 0/);
  });
});
