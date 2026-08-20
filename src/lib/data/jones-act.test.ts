/**
 * AI-12014 — Jones Act lane classification.
 *
 * The load-bearing assertion in this file is that "Jones Act" and
 * "inside the US customs territory" are two different sets. Guam is
 * Jones Act cargo that still clears CBP; the USVI is neither.
 */
import { describe, it, expect } from 'vitest';
import {
  classifyLane,
  findJonesActCarrier,
  isJonesActCarrier,
  isUsPort,
  isInUsCustomsTerritory,
  isDomesticOffshorePort,
  getPortTrade,
  laneRequiresCustomsEntry,
  JONES_ACT_CARRIERS,
  DOMESTIC_OFFSHORE_PORTS,
} from '@/lib/data/jones-act';

describe('port predicates', () => {
  it('treats states and territories alike as US soil', () => {
    expect(isUsPort('USLAX')).toBe(true);
    expect(isUsPort('USHNL')).toBe(true);
    expect(isUsPort('PRSJU')).toBe(true);
    expect(isUsPort('VISTT')).toBe(true);
    expect(isUsPort('GUDTM')).toBe(true);
    expect(isUsPort('CNSHA')).toBe(false);
  });

  it('puts Puerto Rico inside the customs territory but not Guam or the USVI', () => {
    expect(isInUsCustomsTerritory('USLAX')).toBe(true);
    expect(isInUsCustomsTerritory('USHNL')).toBe(true);
    expect(isInUsCustomsTerritory('PRSJU')).toBe(true);
    expect(isInUsCustomsTerritory('GUDTM')).toBe(false);
    expect(isInUsCustomsTerritory('VISTT')).toBe(false);
  });

  it('is case and whitespace insensitive', () => {
    expect(isUsPort(' ushnl ')).toBe(true);
    expect(isDomesticOffshorePort('ushnl')).toBe(true);
  });

  it('resolves a port to its domestic trade', () => {
    expect(getPortTrade('USHNL')).toBe('hawaii');
    expect(getPortTrade('USANC')).toBe('alaska');
    expect(getPortTrade('PRSJU')).toBe('puerto-rico');
    expect(getPortTrade('USLAX')).toBeNull();
  });

  it('handles empty and null input without throwing', () => {
    expect(isUsPort(null)).toBe(false);
    expect(isUsPort('')).toBe(false);
    expect(isInUsCustomsTerritory(undefined)).toBe(false);
    expect(getPortTrade('')).toBeNull();
  });
});

describe('carrier lookup', () => {
  it('finds Matson and Pasha — the two carriers Blake named', () => {
    expect(findJonesActCarrier('Matson')?.code).toBe('MATS');
    expect(findJonesActCarrier('Pasha Hawaii')?.code).toBe('PASH');
  });

  it('matches by code, alias, casing and trailing corporate suffixes', () => {
    expect(findJonesActCarrier('MATS')?.name).toBe('Matson');
    expect(findJonesActCarrier('matson navigation')?.name).toBe('Matson');
    expect(findJonesActCarrier('MATSON NAVIGATION COMPANY')?.name).toBe('Matson');
    expect(findJonesActCarrier('Pasha Hawaii, Inc.')?.name).toBe('Pasha Hawaii');
    expect(findJonesActCarrier('  tote  ')?.name).toBe('TOTE Maritime');
  });

  it('rejects international carriers', () => {
    expect(findJonesActCarrier('Maersk')).toBeNull();
    expect(findJonesActCarrier('Evergreen')).toBeNull();
    expect(isJonesActCarrier('CMA CGM')).toBe(false);
    expect(isJonesActCarrier(null)).toBe(false);
    expect(isJonesActCarrier('')).toBe(false);
  });

  it('gives every registry entry a unique code', () => {
    const codes = JONES_ACT_CARRIERS.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe('classifyLane — AK / HI / PR domestic lanes', () => {
  it('LA -> Honolulu is Jones Act cargo with no customs entry', () => {
    const lane = classifyLane({ originPort: 'USLAX', destPort: 'USHNL', carrier: 'Matson' });

    expect(lane.isDomestic).toBe(true);
    expect(lane.isJonesActLane).toBe(true);
    expect(lane.requiresUsFlagVessel).toBe(true);
    expect(lane.trade).toBe('hawaii');
    expect(lane.customsEntryRequired).toBe(false);
    expect(lane.dutiable).toBe(false);
    expect(lane.customsBasis).toBe('domestic-no-entry');
    expect(lane.carrierIsJonesActQualified).toBe(true);
    expect(lane.label).toBe('Jones Act - Domestic (Hawaii)');
  });

  it('Seattle -> Anchorage is the Alaska trade', () => {
    const lane = classifyLane({ originPort: 'USSEA', destPort: 'USANC', carrier: 'TOTE Maritime' });
    expect(lane.trade).toBe('alaska');
    expect(lane.isJonesActLane).toBe(true);
    expect(lane.customsEntryRequired).toBe(false);
  });

  it('Jacksonville -> San Juan is the Puerto Rico trade with no entry', () => {
    const lane = classifyLane({ originPort: 'USJAX', destPort: 'PRSJU', carrier: 'TOTE Maritime' });
    expect(lane.trade).toBe('puerto-rico');
    expect(lane.isJonesActLane).toBe(true);
    expect(lane.customsEntryRequired).toBe(false);
  });

  it('classifies the return leg the same way', () => {
    const lane = classifyLane({ originPort: 'USHNL', destPort: 'USLAX' });
    expect(lane.isJonesActLane).toBe(true);
    expect(lane.trade).toBe('hawaii');
    expect(lane.customsEntryRequired).toBe(false);
  });

  it('treats mainland-to-mainland water moves as coastwise', () => {
    const lane = classifyLane({ originPort: 'USHOU', destPort: 'USNYC' });
    expect(lane.isDomestic).toBe(true);
    expect(lane.trade).toBe('coastwise');
    expect(lane.isJonesActLane).toBe(true);
    expect(lane.customsEntryRequired).toBe(false);
  });
});

describe('classifyLane — the territory carve-outs', () => {
  it('Guam is Jones Act cargo that STILL needs a CBP entry', () => {
    const lane = classifyLane({ originPort: 'GUDTM', destPort: 'USLAX', carrier: 'Matson' });

    expect(lane.isDomestic).toBe(true);
    expect(lane.isJonesActLane).toBe(true);
    expect(lane.customsEntryRequired).toBe(true);
    expect(lane.dutiable).toBe(true);
    expect(lane.customsBasis).toBe('territory-entry');
    expect(lane.warnings.join(' ')).toMatch(/outside the US customs territory/i);
  });

  it('the USVI is Jones Act EXEMPT and outside the customs territory', () => {
    const lane = classifyLane({ originPort: 'VISTT', destPort: 'USMIA' });

    expect(lane.isDomestic).toBe(true);
    expect(lane.isJonesActLane).toBe(false);
    expect(lane.requiresUsFlagVessel).toBe(false);
    expect(lane.trade).toBe('usvi');
    expect(lane.customsEntryRequired).toBe(true);
    expect(lane.warnings.join(' ')).toMatch(/exempt from the Jones Act/i);
  });
});

describe('classifyLane — international lanes', () => {
  it('Shanghai -> LA is an ordinary import', () => {
    const lane = classifyLane({ originPort: 'CNSHA', destPort: 'USLAX', carrier: 'Maersk' });

    expect(lane.isDomestic).toBe(false);
    expect(lane.isJonesActLane).toBe(false);
    expect(lane.customsEntryRequired).toBe(true);
    expect(lane.dutiable).toBe(true);
    expect(lane.customsBasis).toBe('import-entry');
    expect(lane.label).toBe('International import');
  });

  it('a US export is neither Jones Act nor dutiable at the US end', () => {
    const lane = classifyLane({ originPort: 'USLAX', destPort: 'CNSHA' });
    expect(lane.customsBasis).toBe('export');
    expect(lane.customsEntryRequired).toBe(false);
    expect(lane.isJonesActLane).toBe(false);
  });

  it('foreign-to-foreign touches neither regime', () => {
    const lane = classifyLane({ originPort: 'CNSHA', destPort: 'NLRTM' });
    expect(lane.customsBasis).toBe('foreign-to-foreign');
    expect(lane.isDomestic).toBe(false);
    expect(lane.customsEntryRequired).toBe(false);
  });
});

describe('classifyLane — carrier eligibility warnings', () => {
  it('flags a foreign-flag carrier quoted on a Jones Act lane', () => {
    const lane = classifyLane({ originPort: 'USLAX', destPort: 'USHNL', carrier: 'Maersk' });

    expect(lane.isJonesActLane).toBe(true);
    expect(lane.carrierIsJonesActQualified).toBe(false);
    expect(lane.warnings.join(' ')).toMatch(/not a Jones Act qualified carrier/i);
    expect(lane.warnings.join(' ')).toMatch(/55102/);
  });

  it('flags a qualified carrier that does not serve the trade', () => {
    // Pasha runs Hawaii, not Puerto Rico.
    const lane = classifyLane({ originPort: 'USJAX', destPort: 'PRSJU', carrier: 'Pasha Hawaii' });

    expect(lane.carrierIsJonesActQualified).toBe(true);
    expect(lane.warnings.join(' ')).toMatch(/does not publish service in the Puerto Rico trade/i);
  });

  it('leaves eligibility unknown when no carrier is supplied', () => {
    const lane = classifyLane({ originPort: 'USLAX', destPort: 'USHNL' });
    expect(lane.carrierIsJonesActQualified).toBeNull();
    expect(lane.carrier).toBeNull();
  });
});

describe('laneRequiresCustomsEntry', () => {
  it.each([
    ['USLAX', 'USHNL', false],
    ['USSEA', 'USANC', false],
    ['USJAX', 'PRSJU', false],
    ['GUDTM', 'USLAX', true],
    ['VISTT', 'USMIA', true],
    ['CNSHA', 'USLAX', true],
  ])('%s -> %s => entry required: %s', (origin, dest, expected) => {
    expect(laneRequiresCustomsEntry(origin, dest)).toBe(expected);
  });
});

describe('reference data integrity', () => {
  it('maps every offshore port to a known trade', () => {
    for (const [code, meta] of Object.entries(DOMESTIC_OFFSHORE_PORTS)) {
      expect(code).toMatch(/^[A-Z]{5}$/);
      expect(meta.name.length).toBeGreaterThan(0);
      expect(getPortTrade(code)).toBe(meta.trade);
    }
  });
});
