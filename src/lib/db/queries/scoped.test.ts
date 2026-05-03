/**
 * Unit tests for the org-scoping query helpers (AI-8783).
 *
 * `withOrgScope` and `scopedWhere` are the security-critical primitives that
 * every multi-tenant DB read MUST use. We don't talk to a real DB here — we
 * walk the Drizzle SQL chunk graph (avoiding the circular `table` ref that
 * trips JSON.stringify) so we can confirm:
 *   - The org_id filter is always present
 *   - Additional conditions are AND-ed, not OR-ed
 *   - The orgId value is parameterized, not interpolated
 */
import { describe, it, expect } from 'vitest';
import { eq, SQL } from 'drizzle-orm';
import { withOrgScope, scopedWhere } from './scoped';
import { calculations, auditLogs } from '../schema';

const ORG_ID = '00000000-0000-0000-0000-000000000001';
const OTHER_ORG = '00000000-0000-0000-0000-000000000002';
const CALC_ID = '11111111-1111-1111-1111-111111111111';

/**
 * Walk a Drizzle SQL graph collecting:
 *   - column.name strings (e.g. "org_id", "id")
 *   - parameter values
 *   - any "operator" hint (and/eq/or) we can sniff from chunk class names
 *
 * Drizzle chunk types we care about: Param (has .value), Column (has .name),
 * SQL (has .queryChunks — recurse).
 */
type Probe = { columns: string[]; params: unknown[]; operators: string[] };

function probe(sql: unknown, out: Probe = { columns: [], params: [], operators: [] }, seen = new WeakSet<object>()): Probe {
  if (sql === null || sql === undefined) return out;
  if (typeof sql !== 'object') {
    if (typeof sql === 'string') {
      // String chunk — sometimes contains operator keywords like " and ".
      const lower = sql.toLowerCase();
      if (lower.includes(' and ')) out.operators.push('and');
      if (lower.includes(' or ')) out.operators.push('or');
    }
    return out;
  }
  if (seen.has(sql as object)) return out;
  seen.add(sql as object);

  const obj = sql as Record<string, unknown>;

  // Column chunk
  if (typeof obj.name === 'string' && (obj as any).table) {
    out.columns.push(obj.name);
  }
  // Param chunk
  if ('value' in obj && obj.encoder) {
    out.params.push((obj as any).value);
  }
  // SQL chunk
  if (Array.isArray(obj.queryChunks)) {
    for (const c of obj.queryChunks) probe(c, out, seen);
  }
  // Constructor name hint (and/eq/or wrappers leave a class fingerprint)
  const ctor = (obj as any).constructor?.name;
  if (typeof ctor === 'string') {
    const lower = ctor.toLowerCase();
    if (lower === 'and') out.operators.push('and');
    if (lower === 'or') out.operators.push('or');
  }

  return out;
}

describe('withOrgScope', () => {
  it('emits a SQL fragment that references the org_id column', () => {
    const sql = withOrgScope(calculations.orgId, ORG_ID);
    const result = probe(sql);
    expect(result.columns).toContain('org_id');
  });

  it('parameterizes the orgId value (no SQL-injection-shaped interpolation)', () => {
    const sql = withOrgScope(calculations.orgId, ORG_ID);
    const result = probe(sql);
    expect(result.params).toContain(ORG_ID);
  });

  it('works against the auditLogs table too', () => {
    const sql = withOrgScope(auditLogs.orgId, ORG_ID);
    const result = probe(sql);
    expect(result.columns).toContain('org_id');
    expect(result.params).toContain(ORG_ID);
  });

  it('produces different bound params for different orgIds', () => {
    const a = probe(withOrgScope(calculations.orgId, ORG_ID));
    const b = probe(withOrgScope(calculations.orgId, OTHER_ORG));
    expect(a.params).toContain(ORG_ID);
    expect(b.params).toContain(OTHER_ORG);
    expect(a.params).not.toContain(OTHER_ORG);
  });

  it('returns a Drizzle SQL instance', () => {
    const sql = withOrgScope(calculations.orgId, ORG_ID);
    expect(sql).toBeInstanceOf(SQL);
  });
});

describe('scopedWhere', () => {
  it('AND-combines org scope with a single extra condition', () => {
    const combined = scopedWhere(
      calculations.orgId,
      ORG_ID,
      eq(calculations.id, CALC_ID)
    );
    const result = probe(combined);
    // org_id MUST appear; the extra condition's column (id) MUST appear.
    expect(result.columns).toContain('org_id');
    expect(result.columns).toContain('id');
    // No 'or' should sneak in.
    expect(result.operators).not.toContain('or');
  });

  it('binds both the orgId AND the extra-condition value', () => {
    const combined = scopedWhere(
      calculations.orgId,
      ORG_ID,
      eq(calculations.id, CALC_ID)
    );
    const result = probe(combined);
    expect(result.params).toContain(ORG_ID);
    expect(result.params).toContain(CALC_ID);
  });

  it('returns a defined SQL fragment even with zero extra conditions', () => {
    const combined = scopedWhere(calculations.orgId, ORG_ID);
    expect(combined).toBeDefined();
    const result = probe(combined);
    expect(result.columns).toContain('org_id');
    expect(result.params).toContain(ORG_ID);
  });
});
