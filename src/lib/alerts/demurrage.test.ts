/**
 * AI-12011 — demurrage / detention risk meter.
 *
 * The assertion this file exists to protect: demurrage and detention are two
 * separate clocks that hand off at gate-out. A container picked up inside its
 * demurrage free time is NOT safe — it is now burning detention.
 */
import { describe, it, expect } from 'vitest';
import {
  assessDemurrageRisk,
  addFreeDays,
  chargeForDays,
  perDiemOnDay,
  getTariff,
  readMilestones,
  readTariffOverride,
  findDueDemurrageAlerts,
  demurrageMessage,
  DEFAULT_TARIFF,
  CARRIER_TARIFFS,
  type ContainerMilestones,
  type DemurrageShipmentRow,
} from './demurrage';

const d = (iso: string) => new Date(iso);

/** Discharged Jan 1, nothing else. Default tariff: 4 free demurrage days. */
function milestones(over: Partial<ContainerMilestones> = {}): ContainerMilestones {
  return {
    dischargedAt: d('2026-01-01T12:00:00Z'),
    gateOutAt: null,
    emptyReturnedAt: null,
    dischargeIsEstimated: false,
    ...over,
  };
}

describe('addFreeDays', () => {
  it('adds calendar days straight through the weekend', () => {
    // Thu Jan 1 2026 + 4 calendar days => Mon Jan 5
    expect(addFreeDays(d('2026-01-01T00:00:00Z'), 4, 'calendar').toISOString())
      .toBe('2026-01-05T00:00:00.000Z');
  });

  it('skips weekends on a working-day basis', () => {
    // Thu Jan 1 2026 + 4 working days => Fri 2, Mon 5, Tue 6, Wed 7
    expect(addFreeDays(d('2026-01-01T00:00:00Z'), 4, 'working').toISOString())
      .toBe('2026-01-07T00:00:00.000Z');
  });

  it('returns the start instant for zero days', () => {
    const start = d('2026-01-01T09:30:00Z');
    expect(addFreeDays(start, 0, 'calendar').getTime()).toBe(start.getTime());
    expect(addFreeDays(start, 0, 'working').getTime()).toBe(start.getTime());
  });
});

describe('chargeForDays — tiers are cumulative, not flat', () => {
  const tiers = DEFAULT_TARIFF.demurrageTiers; // 1-5 @175, 6-10 @275, 11+ @400

  it('charges nothing inside free time', () => {
    expect(chargeForDays(tiers, 0)).toBe(0);
    expect(chargeForDays(tiers, -3)).toBe(0);
  });

  it('charges the first tier for early days', () => {
    expect(chargeForDays(tiers, 1)).toBe(175);
    expect(chargeForDays(tiers, 5)).toBe(875);
  });

  it('day 7 pays 5 days at tier 1 plus 2 at tier 2 — not 7 at tier 2', () => {
    expect(chargeForDays(tiers, 7)).toBe(5 * 175 + 2 * 275);
  });

  it('spans into the open-ended top tier', () => {
    // 5*175 + 5*275 + 2*400
    expect(chargeForDays(tiers, 12)).toBe(875 + 1375 + 800);
  });

  it('is monotonically increasing', () => {
    for (let i = 1; i < 30; i++) {
      expect(chargeForDays(tiers, i)).toBeGreaterThan(chargeForDays(tiers, i - 1));
    }
  });
});

describe('perDiemOnDay', () => {
  const tiers = DEFAULT_TARIFF.demurrageTiers;

  it('is zero inside free time', () => {
    expect(perDiemOnDay(tiers, 0)).toBe(0);
  });

  it('picks the tier covering the day', () => {
    expect(perDiemOnDay(tiers, 1)).toBe(175);
    expect(perDiemOnDay(tiers, 5)).toBe(175);
    expect(perDiemOnDay(tiers, 6)).toBe(275);
    expect(perDiemOnDay(tiers, 11)).toBe(400);
    expect(perDiemOnDay(tiers, 400)).toBe(400);
  });
});

describe('getTariff', () => {
  it('resolves known carriers, including the Jones Act lines', () => {
    expect(getTariff('Maersk').carrier).toBe('Maersk');
    expect(getTariff('MSC').demurrageFreeDays).toBe(5);
    expect(getTariff('Matson').carrier).toBe('Matson');
    expect(getTariff('Pasha Hawaii').carrier).toBe('Pasha Hawaii');
  });

  it('matches case-insensitively and on substrings', () => {
    expect(getTariff('MAERSK LINE').carrier).toBe('Maersk');
    expect(getTariff('cma cgm s.a.').carrier).toBe('CMA CGM');
  });

  it('falls back to the market default for unknown or missing carriers', () => {
    expect(getTariff('Some Regional Feeder').carrier).toBe('Default');
    expect(getTariff(null).carrier).toBe('Default');
    expect(getTariff('').carrier).toBe('Default');
  });

  it('labels every built-in tariff as an estimate, not a contract', () => {
    for (const t of Object.values(CARRIER_TARIFFS)) {
      expect(t.source).toBe('default-estimate');
    }
  });
});

describe('assessDemurrageRisk — the demurrage clock', () => {
  it('counts down free time before charges start', () => {
    // Discharged Jan 1, 4 free days => expires Jan 5. On Jan 2, 3 days left.
    const risk = assessDemurrageRisk(milestones(), {}, d('2026-01-02T12:00:00Z'));

    expect(risk.clock).toBe('demurrage');
    expect(risk.daysRemaining).toBe(3);
    expect(risk.chargeableDays).toBe(0);
    expect(risk.accruedUsd).toBe(0);
  });

  it('escalates safe -> warning -> critical -> accruing as the days burn down', () => {
    const at = (iso: string) => assessDemurrageRisk(milestones(), {}, d(iso)).riskLevel;

    // Free time expires Jan 5 12:00. daysRemaining floors to whole days, so
    // the meter escalates early rather than late — the safe failure mode.
    expect(at('2026-01-01T12:00:00Z')).toBe('safe');     // 4 whole days left
    expect(at('2026-01-02T13:00:00Z')).toBe('warning');  // 2 left
    expect(at('2026-01-04T13:00:00Z')).toBe('critical'); // 0 left
    expect(at('2026-01-06T13:00:00Z')).toBe('accruing'); // past expiry
  });

  it('accrues the tiered charge once free time lapses', () => {
    // Expires Jan 5 12:00. On Jan 8 12:00 that is 3 chargeable days.
    const risk = assessDemurrageRisk(milestones(), {}, d('2026-01-08T12:00:00Z'));

    expect(risk.riskLevel).toBe('accruing');
    expect(risk.chargeableDays).toBe(3);
    expect(risk.accruedUsd).toBe(3 * 175);
    expect(risk.perDiemUsd).toBe(175);
    expect(risk.projectedUsd7d).toBe(chargeForDays(DEFAULT_TARIFF.demurrageTiers, 10));
  });

  it('multiplies exposure by the container count', () => {
    const one = assessDemurrageRisk(milestones(), { containerCount: 1 }, d('2026-01-08T12:00:00Z'));
    const four = assessDemurrageRisk(milestones(), { containerCount: 4 }, d('2026-01-08T12:00:00Z'));

    expect(four.accruedUsd).toBe(one.accruedUsd * 4);
    expect(four.projectedUsd7d).toBe(one.projectedUsd7d * 4);
    // Per diem is quoted per container, so it does NOT scale.
    expect(four.perDiemUsd).toBe(one.perDiemUsd);
  });

  it('treats a missing container count as one box', () => {
    const risk = assessDemurrageRisk(milestones(), { containerCount: 0 }, d('2026-01-08T12:00:00Z'));
    expect(risk.containerCount).toBe(1);
  });
});

describe('assessDemurrageRisk — the handoff to detention', () => {
  it('switches clocks at gate-out and restarts free time', () => {
    // Picked up Jan 3 (inside demurrage free time). Detention free time is 5
    // days from gate-out => expires Jan 8, NOT Jan 5.
    const risk = assessDemurrageRisk(
      milestones({ gateOutAt: d('2026-01-03T12:00:00Z') }),
      {},
      d('2026-01-06T12:00:00Z')
    );

    expect(risk.clock).toBe('detention');
    expect(risk.daysRemaining).toBe(2);
    expect(risk.chargeableDays).toBe(0);
  });

  it('a box picked up early still runs up detention — the bug this closes', () => {
    // Gate-out Jan 3, still on the street Jan 20. Under a single
    // "countdown from arrival" model this would read as long since resolved.
    const risk = assessDemurrageRisk(
      milestones({ gateOutAt: d('2026-01-03T12:00:00Z') }),
      {},
      d('2026-01-20T12:00:00Z')
    );

    expect(risk.clock).toBe('detention');
    expect(risk.riskLevel).toBe('accruing');
    expect(risk.chargeableDays).toBe(12);
    expect(risk.accruedUsd).toBe(chargeForDays(DEFAULT_TARIFF.detentionTiers, 12));
    expect(risk.accruedUsd).toBeGreaterThan(0);
  });

  it('uses the detention tariff, not the demurrage one', () => {
    const risk = assessDemurrageRisk(
      milestones({ gateOutAt: d('2026-01-03T12:00:00Z') }),
      {},
      d('2026-01-10T12:00:00Z')
    );
    // 2 chargeable detention days @ $150, vs $175 on the demurrage schedule.
    expect(risk.perDiemUsd).toBe(150);
  });
});

describe('assessDemurrageRisk — terminal and pending states', () => {
  it('stops everything once the empty is back', () => {
    const risk = assessDemurrageRisk(
      milestones({
        gateOutAt: d('2026-01-03T12:00:00Z'),
        emptyReturnedAt: d('2026-01-06T12:00:00Z'),
      }),
      {},
      d('2026-02-01T12:00:00Z')
    );

    expect(risk.clock).toBe('clear');
    expect(risk.riskLevel).toBe('clear');
    expect(risk.accruedUsd).toBe(0);
    expect(risk.projectedUsd7d).toBe(0);
  });

  it('reports pending when nothing has arrived', () => {
    const risk = assessDemurrageRisk(
      milestones({ dischargedAt: null }),
      {},
      d('2026-01-02T12:00:00Z')
    );

    expect(risk.clock).toBe('pending');
    expect(risk.riskLevel).toBe('clear');
    expect(risk.freeTimeExpiresAt).toBeNull();
  });

  it('flags an ETA-derived countdown as estimated in the copy', () => {
    const risk = assessDemurrageRisk(
      milestones({ dischargeIsEstimated: true }),
      {},
      d('2026-01-02T12:00:00Z')
    );

    expect(risk.estimated).toBe(true);
    expect(risk.detail).toMatch(/based on ETA/i);
  });
});

describe('readMilestones', () => {
  it('reads discharge from any of the feed spellings', () => {
    for (const key of ['dischargedAt', 'availableAt', 'ata', 'actualArrival']) {
      const m = readMilestones({ [key]: '2026-01-01T00:00:00Z' }, null);
      expect(m.dischargedAt?.toISOString()).toBe('2026-01-01T00:00:00.000Z');
      expect(m.dischargeIsEstimated).toBe(false);
    }
  });

  it('falls back to ETA and says so', () => {
    const m = readMilestones({}, '2026-01-01T00:00:00Z');
    expect(m.dischargedAt?.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(m.dischargeIsEstimated).toBe(true);
  });

  it('prefers a real discharge event over ETA', () => {
    const m = readMilestones({ dischargedAt: '2026-01-03T00:00:00Z' }, '2026-01-01T00:00:00Z');
    expect(m.dischargedAt?.toISOString()).toBe('2026-01-03T00:00:00.000Z');
    expect(m.dischargeIsEstimated).toBe(false);
  });

  it('survives junk input', () => {
    expect(readMilestones(null, null).dischargedAt).toBeNull();
    expect(readMilestones('not an object', null).dischargedAt).toBeNull();
    expect(readMilestones({ dischargedAt: 'not a date' }, null).dischargedAt).toBeNull();
  });
});

describe('readTariffOverride', () => {
  it('uses the carrier tariff when nothing is overridden', () => {
    const t = readTariffOverride({}, 'Maersk');
    expect(t.carrier).toBe('Maersk');
    expect(t.source).toBe('default-estimate');
  });

  it('accepts contracted free time and marks it as a contract', () => {
    const t = readTariffOverride(
      { demurrageTariff: { demurrageFreeDays: 10, detentionFreeDays: 14 } },
      'Maersk'
    );
    expect(t.demurrageFreeDays).toBe(10);
    expect(t.detentionFreeDays).toBe(14);
    expect(t.source).toBe('contract');
  });

  it('accepts a bare freeDays shorthand', () => {
    expect(readTariffOverride({ freeDays: 7 }, 'Maersk').demurrageFreeDays).toBe(7);
  });

  it('accepts a working-day basis', () => {
    expect(readTariffOverride({ demurrageTariff: { dayBasis: 'working' } }, null).dayBasis)
      .toBe('working');
  });

  it('ignores negative and non-numeric overrides', () => {
    const t = readTariffOverride({ demurrageTariff: { demurrageFreeDays: -5 } }, null);
    expect(t.demurrageFreeDays).toBe(DEFAULT_TARIFF.demurrageFreeDays);
    const t2 = readTariffOverride({ demurrageTariff: { demurrageFreeDays: 'ten' } }, null);
    expect(t2.demurrageFreeDays).toBe(DEFAULT_TARIFF.demurrageFreeDays);
  });
});

describe('findDueDemurrageAlerts', () => {
  function row(over: Partial<DemurrageShipmentRow> = {}): DemurrageShipmentRow {
    return {
      id: 'ship-1',
      orgId: 'org-1',
      containerNumber: 'MSKU1234567',
      reference: 'REF-1',
      carrier: 'Maersk',
      containerCount: 1,
      eta: null,
      status: 'in_transit',
      importMeta: { dischargedAt: '2026-01-01T12:00:00Z' },
      ...over,
    };
  }

  it('raises nothing while free time is comfortable', () => {
    // Maersk: 4 free days from discharge Jan 1 12:00 => 4 whole days left.
    expect(findDueDemurrageAlerts([row()], d('2026-01-01T12:00:00Z'))).toHaveLength(0);
  });

  it('raises a warning as free time runs short', () => {
    const due = findDueDemurrageAlerts([row()], d('2026-01-02T13:00:00Z'));
    expect(due).toHaveLength(1);
    expect(due[0].riskLevel).toBe('warning');
    expect(due[0].stage).toBe('demurrage:warning');
    expect(due[0].label).toBe('MSKU1234567');
  });

  it('raises again when the same box escalates — the warning must not swallow the bill', () => {
    // Already warned. Now it is actually accruing.
    const warned = row({
      importMeta: {
        dischargedAt: '2026-01-01T12:00:00Z',
        demurrageAlertsSent: { 'demurrage:warning': '2026-01-03T13:00:00Z' },
      },
    });
    const due = findDueDemurrageAlerts([warned], d('2026-01-08T13:00:00Z'));

    expect(due).toHaveLength(1);
    expect(due[0].stage).toBe('demurrage:accruing');
  });

  it('does not repeat the same stage twice', () => {
    const alerted = row({
      importMeta: {
        dischargedAt: '2026-01-01T12:00:00Z',
        demurrageAlertsSent: { 'demurrage:accruing': '2026-01-08T13:00:00Z' },
      },
    });
    expect(findDueDemurrageAlerts([alerted], d('2026-01-09T13:00:00Z'))).toHaveLength(0);
  });

  it('tracks the demurrage and detention stages independently', () => {
    const gated = row({
      importMeta: {
        dischargedAt: '2026-01-01T12:00:00Z',
        gateOutAt: '2026-01-03T12:00:00Z',
        demurrageAlertsSent: { 'demurrage:warning': '2026-01-03T13:00:00Z' },
      },
    });
    // Gate-out Jan 3 12:00 + 5 detention free days => expires Jan 8 12:00.
    const due = findDueDemurrageAlerts([gated], d('2026-01-05T13:00:00Z'));

    expect(due).toHaveLength(1);
    expect(due[0].clock).toBe('detention');
    expect(due[0].stage).toBe('detention:warning');
  });

  it('skips org-less rows', () => {
    expect(findDueDemurrageAlerts([row({ orgId: null })], d('2026-01-08T13:00:00Z'))).toHaveLength(0);
  });

  it('still alerts a DELIVERED shipment whose empty is not back', () => {
    // Delivered to the consignee, but the carrier's box is still off-dock.
    // Detention runs until the empty is returned, so this must not be skipped.
    const delivered = row({
      status: 'delivered',
      importMeta: {
        dischargedAt: '2026-01-01T12:00:00Z',
        gateOutAt: '2026-01-03T12:00:00Z',
      },
    });
    const due = findDueDemurrageAlerts([delivered], d('2026-01-20T13:00:00Z'));

    expect(due).toHaveLength(1);
    expect(due[0].clock).toBe('detention');
    expect(due[0].riskLevel).toBe('accruing');
  });

  it('does NOT alert a delivered row whose countdown is only an ETA guess', () => {
    // No discharge or gate-out event — nothing to stand an alert on, and every
    // historical row with a past ETA would otherwise page someone forever.
    const stale = row({
      status: 'delivered',
      eta: '2025-06-01T12:00:00Z',
      importMeta: {},
    });
    expect(findDueDemurrageAlerts([stale], d('2026-01-20T13:00:00Z'))).toHaveLength(0);
  });

  it('skips containers whose empty is already back', () => {
    const returned = row({
      importMeta: {
        dischargedAt: '2026-01-01T12:00:00Z',
        gateOutAt: '2026-01-02T12:00:00Z',
        emptyReturnedAt: '2026-01-04T12:00:00Z',
      },
    });
    expect(findDueDemurrageAlerts([returned], d('2026-02-01T13:00:00Z'))).toHaveLength(0);
  });

  it('falls back to the reference when there is no container number', () => {
    const due = findDueDemurrageAlerts(
      [row({ containerNumber: null })],
      d('2026-01-03T13:00:00Z')
    );
    expect(due[0].label).toBe('REF-1');
  });
});

describe('demurrageMessage', () => {
  it('leads with the money once charges are running', () => {
    const due = findDueDemurrageAlerts(
      [
        {
          id: 's', orgId: 'o', containerNumber: 'MSKU1', reference: null,
          carrier: 'Maersk', containerCount: 2, eta: null, status: 'in_transit',
          importMeta: { dischargedAt: '2026-01-01T12:00:00Z' },
        },
      ],
      d('2026-01-08T13:00:00Z')
    );

    const { title, body } = demurrageMessage(due[0]);
    expect(title).toMatch(/Demurrage accruing/);
    expect(title).toContain('MSKU1');
    expect(body).toMatch(/\$/);
  });

  it('leads with the countdown while there is still time to act', () => {
    const due = findDueDemurrageAlerts(
      [
        {
          id: 's', orgId: 'o', containerNumber: 'MSKU1', reference: null,
          carrier: 'Maersk', containerCount: 1, eta: null, status: 'in_transit',
          importMeta: { dischargedAt: '2026-01-01T12:00:00Z' },
        },
      ],
      d('2026-01-03T13:00:00Z')
    );

    const { title } = demurrageMessage(due[0]);
    expect(title).toMatch(/free time left/);
  });
});
