/**
 * Customer portal projection tests (AI-12022).
 *
 * The load-bearing test here is the leak contract: everything served to an
 * unauthenticated share-link holder goes through `toCustomerShipment`, and no
 * internal field may survive that pass. If someone widens the select in
 * `load.ts` or adds a column to the row type, these tests fail rather than the
 * NVOCC's cost data quietly appearing on its customer's screen.
 */
import { describe, it, expect } from 'vitest';
import {
  NEVER_EXPOSED_FIELDS,
  customerStatusLabel,
  generatePortalToken,
  isValidCustomerCode,
  normalizeCustomerCode,
  sortForCustomer,
  summarize,
  toCustomerShipment,
  type PortalSourceShipment,
} from './customer-portal';

const NOW = new Date('2026-05-12T12:00:00Z');

function source(overrides: Partial<PortalSourceShipment> = {}): PortalSourceShipment {
  return {
    id: 'ship-1',
    reference: 'USA142319',
    containerNumber: 'TEMU9638861',
    containerType: "40'RH",
    vesselName: 'CHIQUITA PROGRESS 221S',
    voyageNumber: '221S',
    carrier: 'Chiquita',
    pol: 'Hueneme',
    pod: 'Puerto Quetzal',
    originPort: null,
    destPort: null,
    etd: new Date('2026-05-10T03:00:00Z'),
    eta: new Date('2026-05-18T11:00:00Z'),
    status: 'in_transit',
    currentLocation: 'Pacific',
    goodsDescription: '1600 CTNS GRAPES / Uvas',
    cargoType: 'Grapes',
    quantity: 1600,
    weightKg: 14739,
    updatedAt: new Date('2026-05-12T08:00:00Z'),
    importMeta: {
      customerCode: 'C',
      poNumber: '4526',
      // Internal board data that must not escape.
      temperature: '0.0 Vents Closed',
      aesNumber: 'X20250925038726',
      reviewIssues: [],
    },
    ...overrides,
  };
}

describe('toCustomerShipment — leak contract', () => {
  it('exposes no internal field, even when present on the row', () => {
    // Deliberately dirty the input with fields a widened select could add.
    const row = {
      ...source(),
      valueUsd: '48000.00',
      freightCostUsd: '3200.00',
      orgId: 'org-1',
      userId: 'user-1',
      shipper: 'Sunview',
      consignee: 'Internal Consignee LLC',
      notifyParty: 'Broker',
      bolDocumentId: 'bol-1',
      source: 'workbook_import',
    } as unknown as PortalSourceShipment;

    const projected = toCustomerShipment(row, NOW);
    const serialized = JSON.stringify(projected);

    for (const field of NEVER_EXPOSED_FIELDS) {
      expect(Object.keys(projected)).not.toContain(field);
    }
    expect(serialized).not.toContain('48000.00');
    expect(serialized).not.toContain('3200.00');
    expect(serialized).not.toContain('Internal Consignee LLC');
  });

  it('does not pass importMeta through, but does surface the customer PO', () => {
    const projected = toCustomerShipment(source(), NOW);
    expect(projected).not.toHaveProperty('importMeta');
    expect(JSON.stringify(projected)).not.toContain('X20250925038726'); // AES filing
    expect(JSON.stringify(projected)).not.toContain('Vents Closed'); // setpoint
    expect(projected.poNumber).toBe('4526'); // the customer's own reference
  });

  it('keeps the customer-facing fields intact', () => {
    const p = toCustomerShipment(source(), NOW);
    expect(p.containerNumber).toBe('TEMU9638861');
    expect(p.reference).toBe('USA142319');
    expect(p.origin).toBe('Hueneme');
    expect(p.destination).toBe('Puerto Quetzal');
    expect(p.carrier).toBe('Chiquita');
    expect(p.vesselName).toBe('CHIQUITA PROGRESS 221S');
    expect(p.etd).toBe('2026-05-10T03:00:00.000Z');
    expect(p.eta).toBe('2026-05-18T11:00:00.000Z');
    expect(p.statusLabel).toBe('In Transit');
    expect(p.quantity).toBe(1600);
    expect(p.timeline.steps.length).toBeGreaterThan(0);
  });

  it('falls back to the CSV port columns when BOL ports are absent', () => {
    const p = toCustomerShipment(
      source({ pol: null, pod: null, originPort: 'Long Beach', destPort: 'Yokohama' }),
      NOW
    );
    expect(p.origin).toBe('Long Beach');
    expect(p.destination).toBe('Yokohama');
  });

  it('normalizes blank strings to null rather than rendering empty labels', () => {
    const p = toCustomerShipment(
      source({ vesselName: '   ', carrier: '', reference: null }),
      NOW
    );
    expect(p.vesselName).toBeNull();
    expect(p.carrier).toBeNull();
    expect(p.reference).toBeNull();
  });

  it('survives a row with almost nothing on it', () => {
    const p = toCustomerShipment({ id: 'bare' }, NOW);
    expect(p.id).toBe('bare');
    expect(p.status).toBe('booked');
    expect(p.statusLabel).toBe('Booked');
    expect(p.eta).toBeNull();
    expect(p.poNumber).toBeNull();
  });
});

describe('customerStatusLabel', () => {
  it('uses plain language, not enum values', () => {
    expect(customerStatusLabel('in_transit')).toBe('In Transit');
    expect(customerStatusLabel('customs')).toBe('In Customs');
    expect(customerStatusLabel('booked')).toBe('Booked');
  });

  it('degrades readably on an unknown status instead of showing a raw enum', () => {
    expect(customerStatusLabel('awaiting_release')).toBe('awaiting release');
    expect(customerStatusLabel(null)).toBe('Booked');
  });
});

describe('summarize', () => {
  const build = (overrides: Partial<PortalSourceShipment>[]) =>
    overrides.map((o, i) => toCustomerShipment(source({ id: `s${i}`, ...o }), NOW));

  it('counts active, arrived and delayed', () => {
    const s = summarize(
      build([
        { status: 'in_transit' },
        { status: 'delivered' },
        { status: 'arrived' },
        { status: 'delayed', eta: new Date('2026-05-01T00:00:00Z') },
      ]),
      NOW
    );
    expect(s.total).toBe(4);
    expect(s.inTransit).toBe(2); // in_transit + delayed
    expect(s.arrived).toBe(2);
    expect(s.delayed).toBeGreaterThanOrEqual(1);
  });

  it('reports the soonest FUTURE arrival, ignoring boxes already in', () => {
    const s = summarize(
      build([
        { status: 'in_transit', eta: new Date('2026-05-20T00:00:00Z') },
        { status: 'in_transit', eta: new Date('2026-05-15T00:00:00Z') },
        { status: 'delivered', eta: new Date('2026-05-13T00:00:00Z') },
        { status: 'in_transit', eta: new Date('2026-05-01T00:00:00Z') }, // in the past
      ]),
      NOW
    );
    expect(s.nextArrival).toBe('2026-05-15T00:00:00.000Z');
  });

  it('reports no next arrival when nothing is still on the water', () => {
    expect(summarize(build([{ status: 'delivered' }]), NOW).nextArrival).toBeNull();
    expect(summarize([], NOW).nextArrival).toBeNull();
  });
});

describe('sortForCustomer', () => {
  it('puts active boxes first by soonest arrival, completed ones last by most recent', () => {
    const rows = [
      source({ id: 'delivered-old', status: 'delivered', eta: new Date('2026-04-01T00:00:00Z') }),
      source({ id: 'active-late', status: 'in_transit', eta: new Date('2026-05-25T00:00:00Z') }),
      source({ id: 'delivered-new', status: 'delivered', eta: new Date('2026-05-05T00:00:00Z') }),
      source({ id: 'active-soon', status: 'in_transit', eta: new Date('2026-05-14T00:00:00Z') }),
    ].map((r) => toCustomerShipment(r, NOW));

    expect(sortForCustomer(rows).map((r) => r.id)).toEqual([
      'active-soon',
      'active-late',
      'delivered-new',
      'delivered-old',
    ]);
  });

  it('sorts undated rows last rather than first', () => {
    const rows = [
      source({ id: 'no-eta', status: 'in_transit', eta: null }),
      source({ id: 'dated', status: 'in_transit', eta: new Date('2026-05-30T00:00:00Z') }),
    ].map((r) => toCustomerShipment(r, NOW));
    expect(sortForCustomer(rows).map((r) => r.id)).toEqual(['dated', 'no-eta']);
  });

  it('does not mutate the input array', () => {
    const rows = [
      source({ id: 'b', status: 'delivered' }),
      source({ id: 'a', status: 'in_transit' }),
    ].map((r) => toCustomerShipment(r, NOW));
    sortForCustomer(rows);
    expect(rows[0].id).toBe('b');
  });
});

describe('tokens and codes', () => {
  it('mints a 64-char hex token that does not repeat', () => {
    const a = generatePortalToken();
    const b = generatePortalToken();
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toBe(b);
  });

  it('normalizes customer codes so one customer cannot end up with two portals', () => {
    expect(normalizeCustomerCode(' c ')).toBe('C');
    expect(normalizeCustomerCode('king')).toBe('KING');
    expect(normalizeCustomerCode('C')).toBe(normalizeCustomerCode('c'));
  });

  it('rejects empty and oversized codes', () => {
    expect(isValidCustomerCode('C')).toBe(true);
    expect(isValidCustomerCode('   ')).toBe(false);
    expect(isValidCustomerCode('')).toBe(false);
    expect(isValidCustomerCode(null)).toBe(false);
    expect(isValidCustomerCode(42)).toBe(false);
    expect(isValidCustomerCode('x'.repeat(51))).toBe(false);
  });
});
