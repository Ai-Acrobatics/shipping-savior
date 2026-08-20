/**
 * Unit tests for the Incoterms 2020 cost-responsibility engine (AI-8869).
 *
 * Pure lookups + arithmetic, no DB. What we're locking down:
 *   - the rules table is complete and internally consistent (11 terms, every
 *     segment assigned, seller obligations monotonically increase E → F → C → D)
 *   - a cost breakdown splits into "ours" and "theirs" correctly for both
 *     trade roles, and the two halves always reconcile to the grand total
 *   - the split is symmetric: what's ours as buyer is theirs as seller
 *   - the trader-facing warnings fire on the exposures they're written for
 */
import { describe, it, expect } from 'vitest';
import {
  COST_SEGMENTS,
  INCOTERMS,
  INCOTERM_PROFILES,
  compareIncotermCost,
  getIncotermProfile,
  incotermWarnings,
  isOurCost,
  parseIncoterm,
  segmentForCostLabel,
  segmentOwner,
  splitCostsByResponsibility,
  type CostLine,
} from './index';

// A realistic 40HC import: $50k of goods, ~$9.6k of everything else.
const breakdown: CostLine[] = [
  { label: 'FOB Unit Cost', amount: 50_000 },
  { label: 'Ocean Freight', amount: 4_200 },
  { label: 'Insurance', amount: 271 },
  { label: 'Duty', amount: 3_250 },
  { label: 'MPF + HMF', amount: 236 },
  { label: 'Customs Broker', amount: 350 },
  { label: 'Drayage', amount: 850 },
  { label: 'Warehousing', amount: 400 },
];

const total = breakdown.reduce((s, l) => s + l.amount, 0);

describe('rules table integrity', () => {
  it('covers all 11 Incoterms 2020 rules', () => {
    expect(INCOTERMS).toHaveLength(11);
    expect(Object.keys(INCOTERM_PROFILES).sort()).toEqual([...INCOTERMS].sort());
  });

  it('assigns an owner to every cost segment for every term', () => {
    for (const term of INCOTERMS) {
      for (const segment of COST_SEGMENTS) {
        expect(['buyer', 'seller']).toContain(segmentOwner(term, segment));
      }
    }
  });

  it('always leaves the goods and post-import costs with the buyer', () => {
    for (const term of INCOTERMS) {
      expect(segmentOwner(term, 'goods')).toBe('buyer');
      expect(segmentOwner(term, 'postImport')).toBe('buyer');
    }
  });

  it('increases the seller obligation monotonically along E → F → C → D', () => {
    const sellerSegmentCount = (term: (typeof INCOTERMS)[number]) =>
      COST_SEGMENTS.filter((s) => segmentOwner(term, s) === 'seller').length;

    // One representative per group, in ascending obligation order. DPU is left
    // out of the ladder deliberately: it carries the same number of seller
    // segments as DDP (it swaps import clearance for unloading), so the two
    // are siblings rather than rungs.
    const ladder = ['EXW', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP'] as const;
    const counts = ladder.map(sellerSegmentCount);
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeGreaterThan(counts[i - 1]);
    }

    // DPU sits between DAP and DDP without being comparable to DDP.
    expect(sellerSegmentCount('DPU')).toBeGreaterThan(sellerSegmentCount('DAP'));
    expect(sellerSegmentCount('DPU')).toBe(sellerSegmentCount('DDP'));
  });

  it('flags exactly the four sea-and-inland-waterway rules', () => {
    const seaOnly = INCOTERMS.filter((t) => INCOTERM_PROFILES[t].seaOnly);
    expect(seaOnly).toEqual(['FAS', 'FOB', 'CFR', 'CIF']);
  });

  it('puts the insurance obligation on the seller only under CIF and CIP', () => {
    const insuring = INCOTERMS.filter(
      (t) => INCOTERM_PROFILES[t].sellerInsuranceObligation !== 'none'
    );
    expect(insuring).toEqual(['CIF', 'CIP']);
    // Incoterms 2020 split the cover levels: CIF stayed at ICC(C), CIP moved to ICC(A).
    expect(getIncotermProfile('CIF').sellerInsuranceObligation).toBe('minimum');
    expect(getIncotermProfile('CIP').sellerInsuranceObligation).toBe('all-risk');
  });

  it('makes DPU the only D-rule where the seller unloads', () => {
    expect(segmentOwner('DPU', 'unloading')).toBe('seller');
    expect(segmentOwner('DAP', 'unloading')).toBe('buyer');
    expect(segmentOwner('DDP', 'unloading')).toBe('buyer');
  });

  it('makes DDP the only rule where the seller pays import duty', () => {
    const dutyPayers = INCOTERMS.filter((t) => segmentOwner(t, 'importCustoms') === 'seller');
    expect(dutyPayers).toEqual(['DDP']);
  });
});

describe('parseIncoterm', () => {
  it('accepts any casing and surrounding whitespace', () => {
    expect(parseIncoterm(' fob ')).toBe('FOB');
    expect(parseIncoterm('DdP')).toBe('DDP');
  });

  it('rejects retired and invented rules', () => {
    // DAT was replaced by DPU in Incoterms 2020.
    expect(parseIncoterm('DAT')).toBeNull();
    expect(parseIncoterm('FOBB')).toBeNull();
    expect(parseIncoterm(42)).toBeNull();
    expect(parseIncoterm(null)).toBeNull();
  });
});

describe('segmentForCostLabel', () => {
  it('maps the landed-cost calculator labels onto segments', () => {
    expect(segmentForCostLabel('Ocean Freight')).toBe('mainCarriage');
    expect(segmentForCostLabel('MPF + HMF')).toBe('importCustoms');
    expect(segmentForCostLabel('Customs Broker')).toBe('importCustoms');
    expect(segmentForCostLabel('Drayage')).toBe('destinationInland');
    expect(segmentForCostLabel('FTZ Storage')).toBe('postImport');
  });

  it('buckets unknown labels into postImport rather than dropping them', () => {
    expect(segmentForCostLabel('Some New Fee We Added')).toBe('postImport');
  });
});

describe('splitCostsByResponsibility', () => {
  it('reconciles our share and the counterparty share to the grand total', () => {
    for (const term of INCOTERMS) {
      for (const role of ['buyer', 'seller'] as const) {
        const split = splitCostsByResponsibility(term, role, breakdown);
        expect(split.ourTotal + split.counterpartyTotal).toBeCloseTo(total, 6);
        expect(split.grandTotal).toBeCloseTo(total, 6);
      }
    }
  });

  it('puts freight, insurance and duty on an FOB buyer', () => {
    const split = splitCostsByResponsibility('FOB', 'buyer', breakdown);
    // Every line is the buyer's under FOB for this breakdown — the seller's
    // costs (packing, origin inland, export clearance, loading) aren't in it.
    expect(split.counterpartyTotal).toBe(0);
    expect(split.ourTotal).toBeCloseTo(total, 6);
  });

  it('moves freight and insurance to the seller under CIF', () => {
    const split = splitCostsByResponsibility('CIF', 'buyer', breakdown);
    expect(split.counterpartyTotal).toBeCloseTo(4_200 + 271, 6);
    expect(split.ourTotal).toBeCloseTo(total - 4_200 - 271, 6);
    expect(split.ourSegments).toContain('importCustoms');
    expect(split.counterpartySegments).toEqual(['mainCarriage', 'insurance']);
  });

  it('leaves duty with the buyer under DAP but not under DDP', () => {
    const dap = splitCostsByResponsibility('DAP', 'buyer', breakdown);
    const ddp = splitCostsByResponsibility('DDP', 'buyer', breakdown);
    const dutyBlock = 3_250 + 236 + 350;
    expect(ddp.ourTotal).toBeCloseTo(dap.ourTotal - dutyBlock, 6);
  });

  it('is symmetric between the two roles', () => {
    for (const term of INCOTERMS) {
      const asBuyer = splitCostsByResponsibility(term, 'buyer', breakdown);
      const asSeller = splitCostsByResponsibility(term, 'seller', breakdown);
      expect(asBuyer.ourTotal).toBeCloseTo(asSeller.counterpartyTotal, 6);
      expect(asBuyer.counterpartyTotal).toBeCloseTo(asSeller.ourTotal, 6);
    }
  });

  it('reports ourShare as 0 on an empty breakdown instead of dividing by zero', () => {
    const split = splitCostsByResponsibility('FOB', 'buyer', []);
    expect(split.ourShare).toBe(0);
    expect(Number.isNaN(split.ourShare)).toBe(false);
  });

  it('keeps zero-cost lines out of the segment lists but still allocates them', () => {
    const withZero: CostLine[] = [
      { label: 'FOB Unit Cost', amount: 50_000 },
      { label: 'Ocean Freight', amount: 4_200 },
      { label: 'FTZ Storage', amount: 0 },
    ];
    const split = splitCostsByResponsibility('FOB', 'buyer', withZero);

    // postImport is the only segment whose lines all net to zero, so it is not
    // reported as a segment we "own a cost in" — but the line is still
    // allocated and still shows up in `lines`.
    expect(split.ourSegments).toEqual(['goods', 'mainCarriage']);
    expect(split.lines.map((l) => l.segment)).toContain('postImport');
  });
});

describe('isOurCost', () => {
  it('answers from the perspective of the role passed in', () => {
    expect(isOurCost('CIF', 'buyer', 'mainCarriage')).toBe(false);
    expect(isOurCost('CIF', 'seller', 'mainCarriage')).toBe(true);
    expect(isOurCost('DDP', 'buyer', 'importCustoms')).toBe(false);
  });
});

describe('compareIncotermCost', () => {
  it('ranks EXW as the most expensive rule for a buyer and DDP the cheapest', () => {
    const ranked = compareIncotermCost('buyer', breakdown);
    expect(ranked[0].term).toBe('DDP');
    expect(ranked[ranked.length - 1].ourTotal).toBeGreaterThanOrEqual(ranked[0].ourTotal);
    // EXW/FCA/FAS/FOB all leave this entire breakdown with the buyer.
    expect(ranked[ranked.length - 1].ourTotal).toBeCloseTo(total, 6);
  });

  it('returns every rule, annotated with its mode restriction', () => {
    const ranked = compareIncotermCost('buyer', breakdown);
    expect(ranked).toHaveLength(11);
    expect(ranked.find((r) => r.term === 'FOB')?.seaOnly).toBe(true);
    expect(ranked.find((r) => r.term === 'FCA')?.seaOnly).toBe(false);
  });
});

describe('incotermWarnings', () => {
  it('warns an EXW buyer about the export-clearance obligation', () => {
    const warnings = incotermWarnings('EXW', 'buyer');
    expect(warnings.some((w) => w.includes('export clearance'))).toBe(true);
  });

  it('warns when a sea-only rule is used for containerised freight', () => {
    const warnings = incotermWarnings('FOB', 'buyer', { containerised: true });
    expect(warnings.some((w) => w.includes('FCA'))).toBe(true);
  });

  it('does not raise the containerised warning for any-mode rules', () => {
    const warnings = incotermWarnings('FCA', 'buyer', { containerised: true });
    expect(warnings.some((w) => w.includes('bulk cargo'))).toBe(false);
  });

  it('warns a CIF buyer that seller cover is only ICC(C)', () => {
    expect(incotermWarnings('CIF', 'buyer').some((w) => w.includes('minimum cover'))).toBe(true);
  });

  it('warns a DDP seller about foreign import VAT', () => {
    expect(incotermWarnings('DDP', 'seller').some((w) => w.includes('VAT'))).toBe(true);
  });

  it('warns about the risk/cost split on C-rules', () => {
    for (const term of ['CFR', 'CPT', 'CIP'] as const) {
      expect(
        incotermWarnings(term, 'buyer').some((w) => w.includes('Risk passes to you at origin'))
      ).toBe(true);
    }
  });
});
