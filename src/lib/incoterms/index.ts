// ============================================================
// Incoterms 2020 — cost-responsibility engine
// AI-8869 (Blake feature ask, sub-feature B)
//
// The landed-cost calculator already knows *what a move costs*. It does not
// know *which side of the deal is on the hook for each piece of it*. That is
// entirely determined by the Incoterm on the contract of sale.
//
// This module encodes the Incoterms 2020 rules as a lookup from
//   (term, our trade role)  ->  per-cost-segment owner
// so the platform can split any cost breakdown into "yours" vs "your
// counterparty's", and flag the segments a customer is silently absorbing.
//
// Deliberately data-first: the rules table is the spec. Everything else in
// here is a pure function over it, which keeps it unit-testable with no DB.
// ============================================================

/** Party to the sale, as encoded by the Incoterm. */
export type IncotermParty = 'seller' | 'buyer';

/**
 * Which side of the transaction *we* are. An importer buying from an overseas
 * supplier is the `buyer`; an exporter shipping to an overseas customer is the
 * `seller`. Everything in this module is symmetric around this flag.
 */
export type TradeRole = IncotermParty;

/** Incoterms 2020. The four sea/inland-waterway-only rules are flagged below. */
export const INCOTERMS = [
  'EXW',
  'FCA',
  'FAS',
  'FOB',
  'CFR',
  'CIF',
  'CPT',
  'CIP',
  'DAP',
  'DPU',
  'DDP',
] as const;

export type Incoterm = (typeof INCOTERMS)[number];

/**
 * The cost segments of an international move, ordered origin -> destination.
 *
 * `goods` and `postImport` are not Incoterm-allocated segments in the ICC text
 * — the buyer always pays for the goods, and warehousing/fulfilment after
 * import clearance is nobody's contractual obligation under the sale. They are
 * modelled here so a full landed-cost breakdown maps 1:1 onto a segment.
 */
export const COST_SEGMENTS = [
  'goods',
  'exportPacking',
  'originInland',
  'exportCustoms',
  'originTerminal',
  'mainCarriage',
  'insurance',
  'destinationTerminal',
  'importCustoms',
  'destinationInland',
  'unloading',
  'postImport',
] as const;

export type CostSegment = (typeof COST_SEGMENTS)[number];

export const SEGMENT_LABELS: Record<CostSegment, string> = {
  goods: 'Goods / purchase price',
  exportPacking: 'Export packing & marking',
  originInland: 'Origin inland haulage',
  exportCustoms: 'Export clearance',
  originTerminal: 'Origin terminal handling / loading',
  mainCarriage: 'Main carriage (ocean / air freight)',
  insurance: 'Cargo insurance',
  destinationTerminal: 'Destination terminal handling',
  importCustoms: 'Import clearance, duty & fees',
  destinationInland: 'Destination inland haulage',
  unloading: 'Unloading at final place',
  postImport: 'Warehousing & fulfilment (post-import)',
};

type SegmentOwners = Record<CostSegment, IncotermParty>;

/** Everything on the buyer — the EXW baseline every other rule is built from. */
const ALL_BUYER: SegmentOwners = {
  goods: 'buyer',
  exportPacking: 'buyer',
  originInland: 'buyer',
  exportCustoms: 'buyer',
  originTerminal: 'buyer',
  mainCarriage: 'buyer',
  insurance: 'buyer',
  destinationTerminal: 'buyer',
  importCustoms: 'buyer',
  destinationInland: 'buyer',
  unloading: 'buyer',
  postImport: 'buyer',
};

const owners = (...sellerSegments: CostSegment[]): SegmentOwners => {
  const next = { ...ALL_BUYER };
  for (const segment of sellerSegments) next[segment] = 'seller';
  return next;
};

export interface IncotermProfile {
  term: Incoterm;
  name: string;
  /** Sea & inland-waterway only (FAS/FOB/CFR/CIF). All others are any-mode. */
  seaOnly: boolean;
  /** Where risk of loss passes from seller to buyer. */
  riskTransfer: string;
  /** What the "named place" in `TERM <place>` actually refers to. */
  namedPlace: string;
  /** Whether the seller is contractually required to buy cargo insurance. */
  sellerInsuranceObligation: 'none' | 'minimum' | 'all-risk';
  segments: SegmentOwners;
  /** Short trader-facing note about the trap in this rule. */
  note: string;
}

/**
 * The rules table. Segment allocation follows ICC Incoterms 2020.
 *
 * Two judgement calls worth naming, because they are the ones traders argue
 * about most and both are defensible readings of the ICC text:
 *
 *  1. Under CFR/CIF the seller's carriage obligation ends at the destination
 *     *port*, so destination terminal handling charges land on the buyer.
 *     Under CPT/CIP carriage runs to a named destination *place*, which in
 *     practice bundles terminal handling into the seller's freight contract.
 *  2. Under DAP/DDP the goods arrive "ready for unloading", so unloading is
 *     the buyer's cost. DPU is the one D-rule where the seller unloads —
 *     that is the entire difference between DPU and DAP.
 */
export const INCOTERM_PROFILES: Record<Incoterm, IncotermProfile> = {
  EXW: {
    term: 'EXW',
    name: 'Ex Works',
    seaOnly: false,
    riskTransfer: "At the seller's premises, once goods are placed at the buyer's disposal",
    namedPlace: "Seller's premises (factory, warehouse)",
    sellerInsuranceObligation: 'none',
    segments: owners('exportPacking'),
    note: 'Maximum buyer obligation. The buyer is on the hook for export clearance in a country it may not be established in — this is why FCA is usually the better rule.',
  },
  FCA: {
    term: 'FCA',
    name: 'Free Carrier',
    seaOnly: false,
    riskTransfer: 'When goods are handed to the carrier the buyer nominated, at the named place',
    namedPlace: 'Where the goods are handed to the buyer-nominated carrier',
    sellerInsuranceObligation: 'none',
    segments: owners('exportPacking', 'originInland', 'exportCustoms'),
    note: 'The containerised replacement for FOB. Incoterms 2020 added the on-board bill of lading option so FCA works with letters of credit.',
  },
  FAS: {
    term: 'FAS',
    name: 'Free Alongside Ship',
    seaOnly: true,
    riskTransfer: 'When goods are placed alongside the vessel at the named port of shipment',
    namedPlace: 'Port of shipment',
    sellerInsuranceObligation: 'none',
    segments: owners('exportPacking', 'originInland', 'exportCustoms'),
    note: 'Bulk and break-bulk only. The buyer pays to lift the cargo aboard.',
  },
  FOB: {
    term: 'FOB',
    name: 'Free On Board',
    seaOnly: true,
    riskTransfer: 'When goods are loaded on board the vessel at the named port of shipment',
    namedPlace: 'Port of shipment',
    sellerInsuranceObligation: 'none',
    segments: owners('exportPacking', 'originInland', 'exportCustoms', 'originTerminal'),
    note: 'Freight, insurance and duty are all the buyer’s. Widely (mis)used for containers, where FCA is the correct rule.',
  },
  CFR: {
    term: 'CFR',
    name: 'Cost and Freight',
    seaOnly: true,
    riskTransfer: 'On board at the port of shipment — risk passes before the seller’s cost obligation ends',
    namedPlace: 'Port of destination',
    sellerInsuranceObligation: 'none',
    segments: owners('exportPacking', 'originInland', 'exportCustoms', 'originTerminal', 'mainCarriage'),
    note: 'Risk and cost split at different points. Cargo in the water is at the buyer’s risk with no seller insurance obligation.',
  },
  CIF: {
    term: 'CIF',
    name: 'Cost, Insurance and Freight',
    seaOnly: true,
    riskTransfer: 'On board at the port of shipment',
    namedPlace: 'Port of destination',
    sellerInsuranceObligation: 'minimum',
    segments: owners(
      'exportPacking',
      'originInland',
      'exportCustoms',
      'originTerminal',
      'mainCarriage',
      'insurance'
    ),
    note: 'Seller insurance is only Institute Cargo Clauses (C) — minimum cover. High-value cargo usually needs the buyer to top it up.',
  },
  CPT: {
    term: 'CPT',
    name: 'Carriage Paid To',
    seaOnly: false,
    riskTransfer: 'When goods are handed to the first carrier',
    namedPlace: 'Named place of destination',
    sellerInsuranceObligation: 'none',
    segments: owners(
      'exportPacking',
      'originInland',
      'exportCustoms',
      'originTerminal',
      'mainCarriage',
      'destinationTerminal'
    ),
    note: 'Risk passes at the first carrier, not at destination — the buyer carries the risk for a leg the seller is paying for.',
  },
  CIP: {
    term: 'CIP',
    name: 'Carriage and Insurance Paid To',
    seaOnly: false,
    riskTransfer: 'When goods are handed to the first carrier',
    namedPlace: 'Named place of destination',
    sellerInsuranceObligation: 'all-risk',
    segments: owners(
      'exportPacking',
      'originInland',
      'exportCustoms',
      'originTerminal',
      'mainCarriage',
      'insurance',
      'destinationTerminal'
    ),
    note: 'Incoterms 2020 raised the CIP insurance floor to Institute Cargo Clauses (A) — all-risk. CIF stayed at (C).',
  },
  DAP: {
    term: 'DAP',
    name: 'Delivered At Place',
    seaOnly: false,
    riskTransfer: 'On arrival at the named place, ready for unloading',
    namedPlace: 'Named place of destination',
    sellerInsuranceObligation: 'none',
    segments: owners(
      'exportPacking',
      'originInland',
      'exportCustoms',
      'originTerminal',
      'mainCarriage',
      'destinationTerminal',
      'destinationInland'
    ),
    note: 'Import clearance and duty stay with the buyer. Unloading at the final place is the buyer’s cost.',
  },
  DPU: {
    term: 'DPU',
    name: 'Delivered at Place Unloaded',
    seaOnly: false,
    riskTransfer: 'Once unloaded at the named place',
    namedPlace: 'Named terminal or place of destination',
    sellerInsuranceObligation: 'none',
    segments: owners(
      'exportPacking',
      'originInland',
      'exportCustoms',
      'originTerminal',
      'mainCarriage',
      'destinationTerminal',
      'destinationInland',
      'unloading'
    ),
    note: 'The only rule where the seller unloads. Replaced DAT in Incoterms 2020.',
  },
  DDP: {
    term: 'DDP',
    name: 'Delivered Duty Paid',
    seaOnly: false,
    riskTransfer: 'On arrival at the named place, ready for unloading, duty paid',
    namedPlace: 'Named place of destination',
    sellerInsuranceObligation: 'none',
    segments: owners(
      'exportPacking',
      'originInland',
      'exportCustoms',
      'originTerminal',
      'mainCarriage',
      'destinationTerminal',
      'importCustoms',
      'destinationInland'
    ),
    note: 'Maximum seller obligation — including import duty in a country the seller may not be able to reclaim VAT in.',
  },
};

/** Case-insensitive parse. Returns null for anything not an Incoterms 2020 rule. */
export function parseIncoterm(value: unknown): Incoterm | null {
  if (typeof value !== 'string') return null;
  const upper = value.trim().toUpperCase();
  return (INCOTERMS as readonly string[]).includes(upper) ? (upper as Incoterm) : null;
}

export function getIncotermProfile(term: Incoterm): IncotermProfile {
  return INCOTERM_PROFILES[term];
}

/** Who pays for `segment` under `term`. */
export function segmentOwner(term: Incoterm, segment: CostSegment): IncotermParty {
  return INCOTERM_PROFILES[term].segments[segment];
}

/** True when *we* pay for `segment`, given the role we play in the sale. */
export function isOurCost(term: Incoterm, role: TradeRole, segment: CostSegment): boolean {
  return segmentOwner(term, segment) === role;
}

// ── Cost breakdown mapping ────────────────────────────────

/**
 * Maps the labels the landed-cost calculator emits onto Incoterm segments.
 * Keys are lowercased for lookup; unknown labels fall back to `postImport`
 * (always ours) rather than silently disappearing from the split.
 */
const LABEL_TO_SEGMENT: Record<string, CostSegment> = {
  'fob unit cost': 'goods',
  'goods': 'goods',
  'export packing': 'exportPacking',
  'origin inland': 'originInland',
  'export clearance': 'exportCustoms',
  'origin thc': 'originTerminal',
  'ocean freight': 'mainCarriage',
  'air freight': 'mainCarriage',
  'freight': 'mainCarriage',
  'insurance': 'insurance',
  'destination thc': 'destinationTerminal',
  'duty': 'importCustoms',
  'mpf + hmf': 'importCustoms',
  'customs broker': 'importCustoms',
  'drayage': 'destinationInland',
  'unloading': 'unloading',
  'warehousing': 'postImport',
  'fulfillment': 'postImport',
  'ftz storage': 'postImport',
};

export function segmentForCostLabel(label: string): CostSegment {
  return LABEL_TO_SEGMENT[label.trim().toLowerCase()] ?? 'postImport';
}

export interface CostLine {
  label: string;
  amount: number;
}

export interface AllocatedCostLine extends CostLine {
  segment: CostSegment;
  segmentLabel: string;
  owner: IncotermParty;
  /** True when the owner is us, given the trade role passed in. */
  ours: boolean;
}

export interface ResponsibilitySplit {
  term: Incoterm;
  role: TradeRole;
  lines: AllocatedCostLine[];
  /** Total of the lines we pay for. */
  ourTotal: number;
  /** Total of the lines the counterparty pays for. */
  counterpartyTotal: number;
  grandTotal: number;
  /** Our share of the grand total, 0–1. `0` when the grand total is 0. */
  ourShare: number;
  /** Segments (deduped, in canonical order) we own that carry a non-zero cost. */
  ourSegments: CostSegment[];
  counterpartySegments: CostSegment[];
}

/**
 * Split a cost breakdown into the portion we carry and the portion our
 * counterparty carries, per the Incoterm on the sale.
 *
 * This is the number a trader actually wants: "of this $48k move, which $31k
 * hits my P&L?" — which is *not* what the landed-cost total tells them when
 * they're buying CIF or selling DDP.
 */
export function splitCostsByResponsibility(
  term: Incoterm,
  role: TradeRole,
  costs: CostLine[]
): ResponsibilitySplit {
  const lines: AllocatedCostLine[] = costs.map((line) => {
    const segment = segmentForCostLabel(line.label);
    const owner = segmentOwner(term, segment);
    return {
      ...line,
      segment,
      segmentLabel: SEGMENT_LABELS[segment],
      owner,
      ours: owner === role,
    };
  });

  const ourTotal = lines.filter((l) => l.ours).reduce((sum, l) => sum + l.amount, 0);
  const counterpartyTotal = lines.filter((l) => !l.ours).reduce((sum, l) => sum + l.amount, 0);
  const grandTotal = ourTotal + counterpartyTotal;

  const segmentsWithCost = (ours: boolean) => {
    const seen = new Set(lines.filter((l) => l.ours === ours && l.amount !== 0).map((l) => l.segment));
    return COST_SEGMENTS.filter((s) => seen.has(s));
  };

  return {
    term,
    role,
    lines,
    ourTotal,
    counterpartyTotal,
    grandTotal,
    ourShare: grandTotal === 0 ? 0 : ourTotal / grandTotal,
    ourSegments: segmentsWithCost(true),
    counterpartySegments: segmentsWithCost(false),
  };
}

/**
 * Compare the same cost breakdown across every Incoterm, sorted cheapest-for-us
 * first. Powers the "what would this move cost us on different terms?" view —
 * the negotiating lever a customer usually doesn't know they have.
 */
export function compareIncotermCost(
  role: TradeRole,
  costs: CostLine[]
): Array<{ term: Incoterm; name: string; ourTotal: number; ourShare: number; seaOnly: boolean }> {
  return INCOTERMS.map((term) => {
    const split = splitCostsByResponsibility(term, role, costs);
    return {
      term,
      name: INCOTERM_PROFILES[term].name,
      ourTotal: split.ourTotal,
      ourShare: split.ourShare,
      seaOnly: INCOTERM_PROFILES[term].seaOnly,
    };
  }).sort((a, b) => a.ourTotal - b.ourTotal);
}

/**
 * Advisory flags for a shipment's Incoterm — the "you are exposed here" notes.
 * Pure and side-effect free so the same list renders on the shipment page and
 * feeds the dashboard risk panel.
 */
export function incotermWarnings(
  term: Incoterm,
  role: TradeRole,
  opts: { containerised?: boolean; cargoValueUsd?: number } = {}
): string[] {
  const profile = INCOTERM_PROFILES[term];
  const warnings: string[] = [];

  if (term === 'EXW' && role === 'buyer') {
    warnings.push(
      'Under EXW you are responsible for export clearance in the supplier’s country. Most buyers cannot legally file it — FCA moves that obligation to the seller at no extra cost.'
    );
  }
  if (opts.containerised && profile.seaOnly) {
    warnings.push(
      `${term} is a sea/inland-waterway rule written for bulk cargo. For containerised freight the equivalent any-mode rule (${
        term === 'FOB' || term === 'FAS' ? 'FCA' : term === 'CFR' ? 'CPT' : 'CIP'
      }) matches how the cargo is actually handed over.`
    );
  }
  if (term === 'CIF' && role === 'buyer') {
    warnings.push(
      'CIF only obliges the seller to buy minimum cover (Institute Cargo Clauses C). If the cargo is high-value, buy your own all-risk policy on top.'
    );
  }
  if ((term === 'CFR' || term === 'CPT' || term === 'CIP') && role === 'buyer') {
    warnings.push(
      'Risk passes to you at origin even though the seller pays the freight. Damage in transit is your claim, not theirs.'
    );
  }
  if (term === 'DDP' && role === 'seller') {
    warnings.push(
      'DDP puts import duty, taxes and clearance on you in the buyer’s country. Confirm you can register for and reclaim import VAT before quoting DDP.'
    );
  }
  if (term === 'DAP' && role === 'buyer') {
    warnings.push(
      'Duty and import clearance are still yours under DAP — only the freight is delivered. Budget the duty line separately.'
    );
  }
  if (profile.sellerInsuranceObligation === 'none' && !isOurCost(term, role, 'insurance')) {
    warnings.push(
      `${term} places no insurance obligation on either party — your counterparty is expected to cover its own risk but is not required to. Confirm a policy actually exists before the cargo sails.`
    );
  }
  return warnings;
}
