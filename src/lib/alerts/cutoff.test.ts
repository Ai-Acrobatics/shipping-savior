/**
 * Unit tests for the cutoff alarm selection logic (Tier 0 item 2).
 * Pure functions — no DB, no network.
 */
import { describe, it, expect } from 'vitest';
import {
  findDueCutoffs,
  parseCutoff,
  cutoffMessage,
  type CutoffShipmentRow,
} from './cutoff';

const NOW = new Date('2026-07-06T12:00:00Z');

function row(overrides: Partial<CutoffShipmentRow>): CutoffShipmentRow {
  return {
    id: 'ship-1',
    orgId: 'org-1',
    containerNumber: 'MSCU1234567',
    reference: 'RICFJP621700',
    pol: 'Port Hueneme',
    status: 'planned',
    importMeta: {},
    ...overrides,
  };
}

describe('parseCutoff', () => {
  it('parses ISO strings (Excel-date path)', () => {
    expect(parseCutoff('2026-07-07T02:00:00.000Z')?.toISOString()).toBe(
      '2026-07-07T02:00:00.000Z'
    );
  });

  it('parses US-style workbook text', () => {
    expect(parseCutoff('Sep 30 2026 16:00')).not.toBeNull();
    expect(parseCutoff('09/29/2026 12:00')).not.toBeNull();
  });

  it('rejects junk, empties, and non-strings', () => {
    expect(parseCutoff('TBD')).toBeNull();
    expect(parseCutoff('')).toBeNull();
    expect(parseCutoff(null)).toBeNull();
    expect(parseCutoff(42)).toBeNull();
  });
});

describe('findDueCutoffs', () => {
  it('flags a reefer cutoff inside the 24h window', () => {
    const due = findDueCutoffs(
      [row({ importMeta: { reeferCutoff: '2026-07-07T02:00:00Z' } })],
      NOW
    );
    expect(due).toHaveLength(1);
    expect(due[0]).toMatchObject({
      shipmentId: 'ship-1',
      orgId: 'org-1',
      kind: 'reefer',
      hoursLeft: 14,
      label: 'MSCU1234567',
    });
  });

  it('flags both kinds independently', () => {
    const due = findDueCutoffs(
      [
        row({
          importMeta: {
            reeferCutoff: '2026-07-07T02:00:00Z',
            documentCutoff: '2026-07-06T20:00:00Z',
          },
        }),
      ],
      NOW
    );
    expect(due.map((d) => d.kind).sort()).toEqual(['document', 'reefer']);
  });

  it('skips cutoffs already passed or beyond the window', () => {
    const due = findDueCutoffs(
      [
        row({ id: 'past', importMeta: { reeferCutoff: '2026-07-06T11:00:00Z' } }),
        row({ id: 'far', importMeta: { reeferCutoff: '2026-07-09T12:00:00Z' } }),
      ],
      NOW
    );
    expect(due).toHaveLength(0);
  });

  it('dedupes via cutoffAlertsSent markers per kind', () => {
    const due = findDueCutoffs(
      [
        row({
          importMeta: {
            reeferCutoff: '2026-07-07T02:00:00Z',
            documentCutoff: '2026-07-07T04:00:00Z',
            cutoffAlertsSent: { reefer: '2026-07-06T11:30:00Z' },
          },
        }),
      ],
      NOW
    );
    expect(due).toHaveLength(1);
    expect(due[0].kind).toBe('document');
  });

  it('skips delivered/cancelled shipments and rows without an org', () => {
    const meta = { reeferCutoff: '2026-07-07T02:00:00Z' };
    const due = findDueCutoffs(
      [
        row({ id: 'a', status: 'delivered', importMeta: meta }),
        row({ id: 'b', status: 'cancelled', importMeta: meta }),
        row({ id: 'c', orgId: null, importMeta: meta }),
      ],
      NOW
    );
    expect(due).toHaveLength(0);
  });

  it('ignores unparseable cutoff text (TBD rows)', () => {
    const due = findDueCutoffs(
      [row({ importMeta: { reeferCutoff: 'TBD', documentCutoff: 'pending' } })],
      NOW
    );
    expect(due).toHaveLength(0);
  });

  it('falls back to booking reference when no container number', () => {
    const due = findDueCutoffs(
      [
        row({
          containerNumber: null,
          importMeta: { reeferCutoff: '2026-07-07T02:00:00Z' },
        }),
      ],
      NOW
    );
    expect(due[0].label).toBe('RICFJP621700');
  });
});

describe('cutoffMessage', () => {
  it('renders an actionable title + body with port', () => {
    const [d] = findDueCutoffs(
      [row({ importMeta: { reeferCutoff: '2026-07-07T02:00:00Z' } })],
      NOW
    );
    const msg = cutoffMessage(d, 'Port Hueneme');
    expect(msg.title).toContain('Reefer cutoff');
    expect(msg.title).toContain('MSCU1234567');
    expect(msg.body).toContain('Port Hueneme');
  });
});
