// ============================================================
// Customs broker handoff — minimal ZIP writer (AI-12018)
//
// The broker gets one file. Building that file needs a ZIP writer, and the
// repo has no archive dependency — so this is a small, complete, pure
// implementation rather than a new package in the tree.
//
// Scope is deliberately narrow and matches what a handoff package is:
//   * a handful of entries, tens of megabytes at most
//   * deflate, falling back to stored when deflate does not pay
//   * no Zip64, no encryption, no streaming
//
// Anything past those limits throws rather than silently writing an archive
// that some tools open and others reject. A half-readable evidence package is
// worse than a failed build.
// ============================================================

import { deflateRawSync } from "node:zlib";

/** Hard ceiling per entry and for the archive — Zip64 is not implemented. */
export const ZIP_MAX_BYTES = 0xffffffff;

/** EOCD stores the entry count in 16 bits; past this the archive needs Zip64. */
export const ZIP_MAX_ENTRIES = 0xffff;

const LOCAL_SIG = 0x04034b50;
const CENTRAL_SIG = 0x02014b50;
const EOCD_SIG = 0x06054b50;

/** Bit 11 — filename and comment are UTF-8. */
const FLAG_UTF8 = 0x0800;

const METHOD_STORED = 0;
const METHOD_DEFLATE = 8;

export interface ZipEntryInput {
  /** Forward-slash path inside the archive. Leading slashes are stripped. */
  path: string;
  data: Buffer | string;
  /** Defaults to the epoch-clamped DOS minimum so archives are reproducible. */
  modifiedAt?: Date;
}

// ─── CRC-32 ───────────────────────────────────────────────

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

export function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// ─── DOS timestamps ───────────────────────────────────────

/**
 * MS-DOS date/time, which is what ZIP stores. The format cannot represent
 * anything before 1980 or after 2107, so both ends are clamped rather than
 * wrapping into a nonsense date.
 */
export function toDosDateTime(date: Date): { time: number; date: number } {
  const d = Number.isNaN(date.getTime()) ? new Date(0) : date;
  const year = Math.min(Math.max(d.getUTCFullYear(), 1980), 2107);
  const time =
    (d.getUTCHours() << 11) | (d.getUTCMinutes() << 5) | (Math.floor(d.getUTCSeconds() / 2) & 0x1f);
  const dosDate = ((year - 1980) << 9) | ((d.getUTCMonth() + 1) << 5) | d.getUTCDate();
  return { time: time & 0xffff, date: dosDate & 0xffff };
}

// ─── Path hygiene ─────────────────────────────────────────

/**
 * Normalize an entry path. Backslashes become forward slashes, leading
 * slashes and `..` segments are dropped: an archive that can write outside
 * the extraction directory is a Zip Slip, and this one is opened by a customs
 * broker on a machine we do not control.
 */
export function normalizeZipPath(path: string): string {
  const cleaned = String(path ?? "")
    .replace(/\\/g, "/")
    .split("/")
    .filter((segment) => segment !== "" && segment !== "." && segment !== "..")
    .join("/");
  if (!cleaned) throw new Error("ZIP entry path is empty after normalization.");
  if (Buffer.byteLength(cleaned, "utf8") > 0xffff) {
    throw new Error(`ZIP entry path is too long: ${cleaned.slice(0, 64)}…`);
  }
  return cleaned;
}

// ─── Writer ───────────────────────────────────────────────

interface PreparedEntry {
  nameBytes: Buffer;
  method: number;
  crc: number;
  compressed: Buffer;
  uncompressedSize: number;
  time: number;
  date: number;
  offset: number;
}

/**
 * Build a ZIP archive in memory.
 *
 * Duplicate paths are rejected: most extractors silently keep one of them, and
 * for a compliance package "one of the two invoices, we are not saying which"
 * is not an acceptable outcome.
 */
export function createZip(entries: ZipEntryInput[]): Buffer {
  if (!entries.length) throw new Error("Cannot build an empty ZIP archive.");
  if (entries.length > ZIP_MAX_ENTRIES) {
    throw new Error(
      `ZIP archive has ${entries.length} entries, more than the ${ZIP_MAX_ENTRIES} a non-Zip64 archive can index.`
    );
  }

  const seen = new Set<string>();
  const prepared: PreparedEntry[] = [];
  const localChunks: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const path = normalizeZipPath(entry.path);
    const key = path.toLowerCase();
    if (seen.has(key)) throw new Error(`Duplicate ZIP entry path: ${path}`);
    seen.add(key);

    const raw = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(String(entry.data), "utf8");
    if (raw.length > ZIP_MAX_BYTES) {
      throw new Error(`ZIP entry ${path} exceeds the 4GB limit (Zip64 is not supported).`);
    }

    const deflated = raw.length ? deflateRawSync(raw, { level: 9 }) : Buffer.alloc(0);
    // Stored beats deflate on already-compressed payloads (PDF, JPEG) where
    // the deflate stream comes out bigger than the input.
    const useDeflate = raw.length > 0 && deflated.length < raw.length;
    const compressed = useDeflate ? deflated : raw;

    const nameBytes = Buffer.from(path, "utf8");
    const { time, date } = toDosDateTime(entry.modifiedAt ?? new Date(0));
    const crc = crc32(raw);

    const header = Buffer.alloc(30);
    header.writeUInt32LE(LOCAL_SIG, 0);
    header.writeUInt16LE(20, 4); // version needed
    header.writeUInt16LE(FLAG_UTF8, 6);
    header.writeUInt16LE(useDeflate ? METHOD_DEFLATE : METHOD_STORED, 8);
    header.writeUInt16LE(time, 10);
    header.writeUInt16LE(date, 12);
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(compressed.length, 18);
    header.writeUInt32LE(raw.length, 22);
    header.writeUInt16LE(nameBytes.length, 26);
    header.writeUInt16LE(0, 28); // extra field length

    localChunks.push(header, nameBytes, compressed);
    prepared.push({
      nameBytes,
      method: useDeflate ? METHOD_DEFLATE : METHOD_STORED,
      crc,
      compressed,
      uncompressedSize: raw.length,
      time,
      date,
      offset,
    });
    offset += header.length + nameBytes.length + compressed.length;

    if (offset > ZIP_MAX_BYTES) {
      throw new Error("ZIP archive exceeds the 4GB limit (Zip64 is not supported).");
    }
  }

  const centralChunks: Buffer[] = [];
  let centralSize = 0;
  for (const entry of prepared) {
    const header = Buffer.alloc(46);
    header.writeUInt32LE(CENTRAL_SIG, 0);
    header.writeUInt16LE(20, 4); // version made by
    header.writeUInt16LE(20, 6); // version needed
    header.writeUInt16LE(FLAG_UTF8, 8);
    header.writeUInt16LE(entry.method, 10);
    header.writeUInt16LE(entry.time, 12);
    header.writeUInt16LE(entry.date, 14);
    header.writeUInt32LE(entry.crc, 16);
    header.writeUInt32LE(entry.compressed.length, 20);
    header.writeUInt32LE(entry.uncompressedSize, 24);
    header.writeUInt16LE(entry.nameBytes.length, 28);
    header.writeUInt16LE(0, 30); // extra
    header.writeUInt16LE(0, 32); // comment
    header.writeUInt16LE(0, 34); // disk number start
    header.writeUInt16LE(0, 36); // internal attrs
    header.writeUInt32LE(0o644 << 16, 38); // external attrs — rw-r--r--
    header.writeUInt32LE(entry.offset, 42);

    centralChunks.push(header, entry.nameBytes);
    centralSize += header.length + entry.nameBytes.length;
  }

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(EOCD_SIG, 0);
  eocd.writeUInt16LE(0, 4); // this disk
  eocd.writeUInt16LE(0, 6); // disk with central directory
  eocd.writeUInt16LE(prepared.length, 8);
  eocd.writeUInt16LE(prepared.length, 10);
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([...localChunks, ...centralChunks, eocd]);
}
