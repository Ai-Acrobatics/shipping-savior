/**
 * AI-12014 — the "signify" element Blake asked for.
 * Renders against real classifier output rather than hand-built fixtures,
 * so a change in classification semantics surfaces here too.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import JonesActBadge from './JonesActBadge';
import { classifyLane } from '@/lib/data/jones-act';

afterEach(cleanup);

describe('JonesActBadge', () => {
  it('labels a Jones Act Hawaii lane', () => {
    render(<JonesActBadge lane={classifyLane({ originPort: 'USLAX', destPort: 'USHNL' })} />);
    expect(screen.getByText('Jones Act - Domestic (Hawaii)')).toBeDefined();
  });

  it('labels an international import differently', () => {
    render(<JonesActBadge lane={classifyLane({ originPort: 'CNSHA', destPort: 'USLAX' })} />);
    expect(screen.getByText('International import')).toBeDefined();
  });

  it('states that no customs costs apply on a domestic lane', () => {
    render(
      <JonesActBadge
        lane={classifyLane({ originPort: 'USSEA', destPort: 'USANC' })}
        showDetail
      />
    );
    expect(screen.getAllByText(/no CBP entry/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/US-built, US-flagged, US-crewed vessel/i)).toBeDefined();
  });

  it('states that customs costs DO apply on an import', () => {
    render(
      <JonesActBadge
        lane={classifyLane({ originPort: 'CNSHA', destPort: 'USLAX' })}
        showDetail
      />
    );
    expect(screen.getByText(/CBP entry required/i)).toBeDefined();
  });

  it('surfaces the eligibility conflict when a foreign carrier is quoted coastwise', () => {
    render(
      <JonesActBadge
        lane={classifyLane({ originPort: 'USLAX', destPort: 'USHNL', carrier: 'Maersk' })}
        showDetail
      />
    );
    expect(screen.getByText(/not a Jones Act qualified carrier/i)).toBeDefined();
  });

  it('omits detail copy unless asked', () => {
    render(<JonesActBadge lane={classifyLane({ originPort: 'USLAX', destPort: 'USHNL' })} />);
    expect(screen.queryAllByText(/no CBP entry/i)).toHaveLength(0);
  });
});
