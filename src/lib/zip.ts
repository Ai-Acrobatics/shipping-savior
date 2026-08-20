/**
 * Minimal ZIP writer (AI-8780).
 *
 * The GDPR export has to hand the user a single archive containing several
 * files. Every candidate library (jszip, archiver, adm-zip) pulls in a Node
 * stream/Buffer dependency tree that does not run cleanly on the edge/serverless
 * runtime this app deploys to, for what is ~70 lines of well-specified format.
 *
 * So: STORE method only (no DEFLATE). Exports are a handful of text files that
 * the transport layer already gzips, so compression would buy almost nothing and
 * cost a dependency. Output is a valid PKZIP archive readable by macOS Archive
 * Utility, Windows Explorer, `unzip`, and Python's `zipfile`.
 *
 * Spec: PKWARE APPNOTE 6.3.x, sections 4.3.7 (local header), 4.3.12 (central
 * directory), 4.3.16 (end of central directory).
 */

export type ZipEntry = {
  /** Path inside the archive. Use forward slashes. */
  name: string;
  /** File contents. Strings are encoded as UTF-8. */
  content: string | Uint8Array;
};

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * MS-DOS date/time as used by the ZIP local header (APPNOTE 4.4.6). Seconds
 * have 2-second resolution and the epoch is 1980 — both are format limits, not
 * bugs. Dates before 1980 are clamped so the header stays well-formed.
 */
function dosDateTime(date: Date): { time: number; date: number } {
  const year = Math.max(date.getUTCFullYear(), 1980);
  return {
    time:
      (date.getUTCHours() << 11) |
      (date.getUTCMinutes() << 5) |
      (Math.floor(date.getUTCSeconds() / 2) & 0x1f),
    date:
      ((year - 1980) << 9) | ((date.getUTCMonth() + 1) << 5) | date.getUTCDate(),
  };
}

function toBytes(content: string | Uint8Array): Uint8Array {
  return typeof content === 'string' ? new TextEncoder().encode(content) : content;
}

function u16(value: number): Uint8Array {
  return new Uint8Array([value & 0xff, (value >>> 8) & 0xff]);
}

function u32(value: number): Uint8Array {
  return new Uint8Array([
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  ]);
}

function concat(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/**
 * Build a ZIP archive from in-memory entries.
 *
 * @param entries files to include, in the order they should appear
 * @param modifiedAt timestamp stamped on every entry — pass a fixed value to
 *   get byte-identical output for the same input (useful in tests)
 */
export function createZip(entries: ZipEntry[], modifiedAt: Date = new Date()): Uint8Array {
  const { time, date } = dosDateTime(modifiedAt);
  const localChunks: Uint8Array[] = [];
  const centralChunks: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = new TextEncoder().encode(entry.name);
    const data = toBytes(entry.content);
    const checksum = crc32(data);

    // Bit 11 of the general-purpose flag marks the filename as UTF-8, which is
    // what TextEncoder produced. Without it, non-ASCII names mojibake on Windows.
    const flags = 0x0800;

    const localHeader = concat([
      u32(0x04034b50), // local file header signature
      u16(20), // version needed to extract (2.0)
      u16(flags),
      u16(0), // compression method: 0 = stored
      u16(time),
      u16(date),
      u32(checksum),
      u32(data.length), // compressed size == uncompressed size when stored
      u32(data.length),
      u16(nameBytes.length),
      u16(0), // extra field length
      nameBytes,
    ]);

    localChunks.push(localHeader, data);

    centralChunks.push(
      concat([
        u32(0x02014b50), // central directory header signature
        u16(20), // version made by
        u16(20), // version needed to extract
        u16(flags),
        u16(0), // compression method
        u16(time),
        u16(date),
        u32(checksum),
        u32(data.length),
        u32(data.length),
        u16(nameBytes.length),
        u16(0), // extra field length
        u16(0), // file comment length
        u16(0), // disk number start
        u16(0), // internal file attributes
        u32(0), // external file attributes
        u32(offset), // relative offset of local header
        nameBytes,
      ])
    );

    offset += localHeader.length + data.length;
  }

  const central = concat(centralChunks);
  const endOfCentralDirectory = concat([
    u32(0x06054b50), // end of central directory signature
    u16(0), // number of this disk
    u16(0), // disk where central directory starts
    u16(entries.length),
    u16(entries.length),
    u32(central.length),
    u32(offset), // offset of start of central directory
    u16(0), // comment length
  ]);

  return concat([...localChunks, central, endOfCentralDirectory]);
}

/**
 * Render rows to RFC 4180 CSV. Values containing a comma, quote, or newline are
 * quoted; embedded quotes are doubled. `null`/`undefined` become empty cells and
 * objects are JSON-encoded so a jsonb column survives the round trip.
 */
export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Array.from(
    rows.reduce<Set<string>>((keys, row) => {
      Object.keys(row).forEach((k) => keys.add(k));
      return keys;
    }, new Set())
  );

  const cell = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const raw =
      value instanceof Date
        ? value.toISOString()
        : typeof value === 'object'
          ? JSON.stringify(value)
          : String(value);
    return /[",\r\n]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
  };

  return [
    headers.map(cell).join(','),
    ...rows.map((row) => headers.map((h) => cell(row[h])).join(',')),
  ].join('\r\n');
}
