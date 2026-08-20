/**
 * Unit tests for the dependency-free ZIP writer (AI-8780).
 *
 * The GDPR export is only useful if the archive actually opens. These tests pin
 * the byte-level structure against the PKZIP spec rather than against our own
 * reader, and Node's zlib-free `unzip` is not assumed to be installed.
 */
import { describe, it, expect } from 'vitest';
import { createZip, crc32, toCsv } from './zip';

const FIXED_DATE = new Date('2026-08-20T12:34:56Z');

function view(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

describe('crc32', () => {
  it('matches the reference value for a known input', () => {
    // "123456789" → 0xCBF43926 is the standard CRC-32 check value.
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });

  it('returns 0 for empty input', () => {
    expect(crc32(new Uint8Array(0))).toBe(0);
  });
});

describe('createZip', () => {
  it('writes local headers, a central directory, and an EOCD record', () => {
    const zip = createZip(
      [
        { name: 'a.txt', content: 'hello' },
        { name: 'b.json', content: '{"x":1}' },
      ],
      FIXED_DATE
    );
    const dv = view(zip);

    expect(dv.getUint32(0, true)).toBe(0x04034b50); // first local header

    // End of central directory sits in the last 22 bytes (no archive comment).
    const eocd = zip.length - 22;
    expect(dv.getUint32(eocd, true)).toBe(0x06054b50);
    expect(dv.getUint16(eocd + 8, true)).toBe(2); // entries on this disk
    expect(dv.getUint16(eocd + 10, true)).toBe(2); // total entries

    const centralSize = dv.getUint32(eocd + 12, true);
    const centralOffset = dv.getUint32(eocd + 16, true);
    expect(centralOffset + centralSize).toBe(eocd);
    expect(dv.getUint32(centralOffset, true)).toBe(0x02014b50); // central header
  });

  it('stores content uncompressed with a correct CRC and size', () => {
    const content = 'shipment,ref\r\n1,REF-1';
    const zip = createZip([{ name: 'shipments.csv', content }], FIXED_DATE);
    const dv = view(zip);
    const expected = new TextEncoder().encode(content);

    expect(dv.getUint16(8, true)).toBe(0); // compression method 0 = stored
    expect(dv.getUint32(14, true)).toBe(crc32(expected));
    expect(dv.getUint32(18, true)).toBe(expected.length); // compressed size
    expect(dv.getUint32(22, true)).toBe(expected.length); // uncompressed size

    const nameLength = dv.getUint16(26, true);
    const extraLength = dv.getUint16(28, true);
    const data = zip.subarray(30 + nameLength + extraLength, 30 + nameLength + extraLength + expected.length);
    expect(new TextDecoder().decode(data)).toBe(content);
  });

  it('flags filenames as UTF-8 so non-ASCII names survive', () => {
    const zip = createZip([{ name: 'rapport-données.csv', content: 'x' }], FIXED_DATE);
    const dv = view(zip);
    expect(dv.getUint16(6, true) & 0x0800).toBe(0x0800);

    const nameLength = dv.getUint16(26, true);
    const name = new TextDecoder().decode(zip.subarray(30, 30 + nameLength));
    expect(name).toBe('rapport-données.csv');
  });

  it('is deterministic for the same input and timestamp', () => {
    const build = () => createZip([{ name: 'a.txt', content: 'hello' }], FIXED_DATE);
    expect(Array.from(build())).toEqual(Array.from(build()));
  });

  it('produces a valid empty archive', () => {
    const zip = createZip([], FIXED_DATE);
    expect(zip.length).toBe(22);
    expect(view(zip).getUint32(0, true)).toBe(0x06054b50);
  });
});

describe('toCsv', () => {
  it('returns an empty string for no rows', () => {
    expect(toCsv([])).toBe('');
  });

  it('quotes commas, quotes, and newlines per RFC 4180', () => {
    const csv = toCsv([{ a: 'x,y', b: 'say "hi"', c: 'line1\nline2' }]);
    const [header, row] = csv.split('\r\n');
    expect(header).toBe('a,b,c');
    expect(row).toBe('"x,y","say ""hi""","line1\nline2"');
  });

  it('renders null/undefined as empty cells and objects as JSON', () => {
    const csv = toCsv([{ a: null, b: undefined, c: { nested: true } }]);
    expect(csv.split('\r\n')[1]).toBe(',,"{""nested"":true}"');
  });

  it('unions keys across rows so a sparse row does not shift columns', () => {
    const csv = toCsv([{ a: 1 }, { a: 2, b: 3 }]);
    expect(csv).toBe('a,b\r\n1,\r\n2,3');
  });

  it('serializes dates as ISO strings', () => {
    const csv = toCsv([{ createdAt: FIXED_DATE }]);
    expect(csv.split('\r\n')[1]).toBe('2026-08-20T12:34:56.000Z');
  });
});
