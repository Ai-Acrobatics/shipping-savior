import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/db', () => ({ db: {} }));

import {
  applyHistoryFilter,
  clampWindowDays,
  summarizeShippingHistory,
  type HistoryShipmentRow,
} from './history-stats';

function row(over: Partial<HistoryShipmentRow> = {}): HistoryShipmentRow {
  return {
    reference: 'REF-1',
    containerNumber: null,
    originPort: 'Port Hueneme',
    destPort: 'Rotterdam',
    pol: null,
    pod: null,
    carrier: 'Maersk',
    status: 'in_transit',
    source: 'manual',
    containerCount: 1,
    weightKg: 20000,
    valueUsd: '50000.00',
    etd: new Date('2026-05-01T00:00:00Z'),
    eta: new Date('2026-05-21T00:00:00Z'),
    createdAt: new Date('2026-05-01T00:00:00Z'),
    ...over,
  };
}

describe('summarizeShippingHistory (AI-8060)', () => {
  it('returns an empty summary with a hint when there is no history', () => {
    const s = summarizeShippingHistory([], 90);
    expect(s.totalShipments).toBe(0);
    expect(s.totalContainers).toBe(0);
    expect(s.avgPlannedTransitDays).toBeNull();
    expect(s.note).toMatch(/No shipments/);
  });

  it('aggregates totals, statuses, sources, lanes and carriers', () => {
    const rows = [
      row(),
      row({ reference: 'REF-2', status: 'delayed', containerCount: 3, valueUsd: 1000 }),
      row({
        reference: 'REF-3',
        carrier: 'MSC',
        originPort: null,
        pol: 'Santos',
        destPort: null,
        pod: 'Antwerp',
        source: 'bol_ocr',
        containerCount: null,
        weightKg: null,
        valueUsd: null,
      }),
    ];
    const s = summarizeShippingHistory(rows, 30);
    expect(s.totalShipments).toBe(3);
    expect(s.totalContainers).toBe(5); // 1 + 3 + (null → 1)
    expect(s.totalWeightKg).toBe(40000);
    expect(s.totalValueUsd).toBe(51000);
    expect(s.byStatus).toEqual({ in_transit: 2, delayed: 1 });
    expect(s.bySource).toEqual({ manual: 2, bol_ocr: 1 });
    expect(s.topLanes[0]).toEqual({ name: 'Port Hueneme → Rotterdam', shipments: 2 });
    expect(s.topLanes[1].name).toBe('Santos → Antwerp'); // falls back to POL/POD
    expect(s.topCarriers[0]).toEqual({ name: 'Maersk', shipments: 2, delayed: 1, delayRatePct: 50 });
    expect(s.avgPlannedTransitDays).toBe(20);
  });

  it('ignores inverted or absurd ETD/ETA pairs in the transit average', () => {
    const s = summarizeShippingHistory(
      [
        row({ etd: new Date('2026-05-10'), eta: new Date('2026-05-01') }),
        row({ etd: new Date('2020-01-01'), eta: new Date('2026-01-01') }),
        row({ etd: new Date('2026-05-01'), eta: new Date('2026-05-11') }),
      ],
      90,
    );
    expect(s.avgPlannedTransitDays).toBe(10);
  });

  it('lists the most recent shipments first, capped at 10', () => {
    const rows = Array.from({ length: 12 }, (_, i) =>
      row({ reference: `R${i}`, createdAt: new Date(Date.UTC(2026, 0, i + 1)) }),
    );
    const s = summarizeShippingHistory(rows, 365);
    expect(s.recent).toHaveLength(10);
    expect(s.recent[0].reference).toBe('R11');
    expect(s.recent[0].etd).toBe('2026-05-01');
  });
});

describe('applyHistoryFilter', () => {
  const rows = [
    row(),
    row({ carrier: 'MSC', destPort: 'Antwerp', status: 'delivered' }),
  ];
  it('filters by carrier substring, lane and status case-insensitively', () => {
    expect(applyHistoryFilter(rows, { carrier: 'msc' })).toHaveLength(1);
    expect(applyHistoryFilter(rows, { lane: 'rotter' })).toHaveLength(1);
    expect(applyHistoryFilter(rows, { lane: 'hueneme' })).toHaveLength(2);
    expect(applyHistoryFilter(rows, { status: 'DELIVERED' })).toHaveLength(1);
    expect(applyHistoryFilter(rows, {})).toHaveLength(2);
  });
});

describe('clampWindowDays', () => {
  it('defaults to 90 and caps at 730', () => {
    expect(clampWindowDays(undefined)).toBe(90);
    expect(clampWindowDays(-5)).toBe(90);
    expect(clampWindowDays('30')).toBe(30);
    expect(clampWindowDays(5000)).toBe(730);
  });
});
