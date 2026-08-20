/**
 * CSV parsing for the container-contents importer (AI-8869).
 *
 * The parser is the thing standing between "export from your ERP and paste
 * it" and "map every ERP by hand", so it needs to be forgiving about column
 * order and naming while still refusing to invent data.
 */
import { describe, it, expect } from 'vitest';
import { parseLineItemCsv } from '@/lib/inventory/csv';

describe('parseLineItemCsv', () => {
  it('maps canonical headers regardless of column order', () => {
    const csv = [
      'unit_cost,qty,sku,hts',
      '8.50,1200,BANANA-40LB,0803.90.00',
    ].join('\n');
    expect(parseLineItemCsv(csv)).toEqual([
      { unitCostUsd: '8.50', quantity: '1200', sku: 'BANANA-40LB', htsCode: '0803.90.00' },
    ]);
  });

  it('recognises the common ERP aliases', () => {
    const csv = [
      'Item Code,Item Description,Tariff Code,Units,Cost,Vendor,PO Number,Country of Origin',
      'MANGO-20,Ataulfo 20lb,0804.50.40,900,6.25,Frutas Peru,PO-9912,PE',
    ].join('\n');
    const [row] = parseLineItemCsv(csv);
    expect(row).toEqual({
      sku: 'MANGO-20',
      description: 'Ataulfo 20lb',
      htsCode: '0804.50.40',
      quantity: '900',
      unitCostUsd: '6.25',
      supplier: 'Frutas Peru',
      poRef: 'PO-9912',
      countryOfOrigin: 'PE',
    });
  });

  it('strips surrounding quotes and whitespace', () => {
    const csv = ['sku, qty ,unit_cost', '"A-1", 10 , "3.50"'].join('\n');
    expect(parseLineItemCsv(csv)[0]).toEqual({ sku: 'A-1', quantity: '10', unitCostUsd: '3.50' });
  });

  it('ignores unrecognised columns instead of failing the import', () => {
    const csv = ['sku,qty,unit_cost,internal_batch_uuid', 'A-1,10,3.50,abc-123'].join('\n');
    expect(parseLineItemCsv(csv)[0]).not.toHaveProperty('internal_batch_uuid');
  });

  it('drops blank cells rather than writing empty strings', () => {
    const csv = ['sku,qty,unit_cost,supplier', 'A-1,10,3.50,'].join('\n');
    expect(parseLineItemCsv(csv)[0]).not.toHaveProperty('supplier');
  });

  it('returns nothing for an empty body or a header-only file', () => {
    expect(parseLineItemCsv('')).toEqual([]);
    expect(parseLineItemCsv('sku,qty,unit_cost')).toEqual([]);
  });

  it('handles CRLF line endings and trailing blank lines', () => {
    const csv = 'sku,qty,unit_cost\r\nA-1,10,3.50\r\n\r\n';
    expect(parseLineItemCsv(csv)).toHaveLength(1);
  });
});
