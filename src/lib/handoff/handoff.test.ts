/**
 * Unit tests for the customs broker handoff package (AI-12018).
 *
 * Pure functions only — no DB, no blob storage, no network. The parts that
 * carry real risk get the most coverage:
 *
 *   * the ZIP writer, because a corrupt archive is a broker who cannot file
 *   * consensus, because silently picking one document's number over another's
 *     is exactly the failure the reconciliation layer exists to surface
 *   * the share link, because it is the only unauthenticated data path in the
 *     product
 */
import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { inflateRawSync } from "node:zlib";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { reconcileDocumentSet, type DocumentExtraction } from "@/lib/documents";
import {
  buildActionItems,
  buildHandoffManifest,
  buildHandoffZip,
  buildShipmentSummary,
  clampExpiryHours,
  consensusNumber,
  consensusString,
  createZip,
  crc32,
  DEFAULT_EXPIRY_HOURS,
  documentKey,
  expiryFrom,
  extensionFor,
  formatRemaining,
  generateShareToken,
  handoffFileName,
  hashShareToken,
  isWellFormedShareToken,
  MAX_EXPIRY_HOURS,
  MIN_EXPIRY_HOURS,
  normalizeZipPath,
  planArchive,
  renderCoverSheetHtml,
  renderCoverSheetText,
  resolveLinkState,
  shareTokenMatches,
  slugForType,
  toDosDateTime,
  tokenPrefix,
  unionStrings,
  type HandoffSourceDocument,
} from "./index";

const NOW = new Date("2026-06-15T12:00:00Z");
const EXPIRES = new Date("2026-06-18T12:00:00Z");

function doc(
  type: HandoffSourceDocument["type"],
  fields: Record<string, unknown>,
  overrides: Partial<HandoffSourceDocument> = {}
): HandoffSourceDocument {
  return {
    documentId: overrides.documentId ?? `id-${type}`,
    type,
    fileName: overrides.fileName ?? `${type}.pdf`,
    fileType: overrides.fileType ?? "application/pdf",
    fields,
    validation:
      overrides.validation === undefined
        ? {
            type,
            valid: true,
            issues: [],
            completeness: 1,
            missingRequired: [],
            lowConfidenceFields: [],
          }
        : overrides.validation,
    original: overrides.original === undefined ? Buffer.from(`pdf-bytes-${type}`) : overrides.original,
    omissionReason: overrides.omissionReason,
  };
}

function extractionsOf(documents: HandoffSourceDocument[]): DocumentExtraction[] {
  return documents.map((d) => ({ type: d.type, fields: d.fields, confidence: {} }));
}

function buildManifestFor(
  documents: HandoffSourceDocument[],
  options: { profile?: Record<string, boolean>; acknowledge?: boolean; notes?: string } = {}
) {
  const profile = options.profile ?? {};
  const reconciliation = reconcileDocumentSet(extractionsOf(documents), profile);
  const plan = planArchive(documents);
  return {
    plan,
    manifest: buildHandoffManifest({
      packageId: "pkg-1",
      documents,
      reconciliation,
      profile,
      archivePaths: plan.archivePaths,
      omissionReasons: plan.omissionReasons,
      generatedAt: NOW,
      expiresAt: EXPIRES,
      organizationName: "Blake Logistics",
      userName: "ops@blake.example",
      brokerName: "Acme Customs",
      brokerEmail: "entry@acmecustoms.example",
      reference: "SS-2026-0412",
      notes: options.notes,
      releasedWithBlockers: options.acknowledge,
    }),
  };
}

// ─────────────────────────────────────────────────────────
// ZIP writer
// ─────────────────────────────────────────────────────────

/** Minimal central-directory reader — enough to assert the archive is well-formed. */
function readZipEntries(zip: Buffer) {
  const eocdOffset = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  expect(eocdOffset).toBeGreaterThan(-1);
  const entryCount = zip.readUInt16LE(eocdOffset + 10);
  let offset = zip.readUInt32LE(eocdOffset + 16);

  const entries: Array<{ name: string; method: number; crc: number; data: Buffer }> = [];
  for (let i = 0; i < entryCount; i++) {
    expect(zip.readUInt32LE(offset)).toBe(0x02014b50);
    const method = zip.readUInt16LE(offset + 10);
    const crc = zip.readUInt32LE(offset + 16);
    const compressedSize = zip.readUInt32LE(offset + 20);
    const uncompressedSize = zip.readUInt32LE(offset + 24);
    const nameLen = zip.readUInt16LE(offset + 28);
    const extraLen = zip.readUInt16LE(offset + 30);
    const commentLen = zip.readUInt16LE(offset + 32);
    const localOffset = zip.readUInt32LE(offset + 42);
    const name = zip.subarray(offset + 46, offset + 46 + nameLen).toString("utf8");

    expect(zip.readUInt32LE(localOffset)).toBe(0x04034b50);
    const localNameLen = zip.readUInt16LE(localOffset + 26);
    const localExtraLen = zip.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLen + localExtraLen;
    const raw = zip.subarray(dataStart, dataStart + compressedSize);
    const data = method === 8 ? inflateRawSync(raw) : Buffer.from(raw);
    expect(data.length).toBe(uncompressedSize);

    entries.push({ name, method, crc, data });
    offset += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

describe("zip writer", () => {
  it("matches the CRC-32 of a known input", () => {
    // The canonical check value for CRC-32/ISO-HDLC.
    expect(crc32(Buffer.from("123456789")).toString(16)).toBe("cbf43926");
  });

  it("round-trips text and binary entries with correct CRCs", () => {
    const text = "cover sheet\n".repeat(200);
    const binary = Buffer.from(Array.from({ length: 512 }, (_, i) => i % 256));
    const zip = createZip([
      { path: "COVER-SHEET.txt", data: text },
      { path: "documents/01-bill-of-lading.pdf", data: binary },
    ]);

    const entries = readZipEntries(zip);
    expect(entries.map((e) => e.name)).toEqual([
      "COVER-SHEET.txt",
      "documents/01-bill-of-lading.pdf",
    ]);
    expect(entries[0].data.toString("utf8")).toBe(text);
    expect(entries[1].data.equals(binary)).toBe(true);
    for (const entry of entries) expect(entry.crc).toBe(crc32(entry.data));
  });

  it("stores rather than deflates when deflate would grow the payload", () => {
    // Deterministic but genuinely high-entropy bytes — deflate cannot beat
    // stored on these, so the writer must fall back rather than grow the file.
    const chunks: Buffer[] = [];
    let seed = createHash("sha256").update("handoff-entropy").digest();
    for (let i = 0; i < 128; i++) {
      chunks.push(seed);
      seed = createHash("sha256").update(seed).digest();
    }
    const incompressible = Buffer.concat(chunks);
    const zip = createZip([{ path: "noise.bin", data: incompressible }]);
    const [entry] = readZipEntries(zip);
    expect(entry.method).toBe(0);
    expect(entry.data.equals(incompressible)).toBe(true);
  });

  it("deflates compressible payloads", () => {
    const zip = createZip([{ path: "a.txt", data: "x".repeat(10_000) }]);
    const [entry] = readZipEntries(zip);
    expect(entry.method).toBe(8);
    expect(zip.length).toBeLessThan(1_000);
  });

  it("refuses an empty archive and duplicate paths", () => {
    expect(() => createZip([])).toThrow(/empty/i);
    expect(() =>
      createZip([
        { path: "a.txt", data: "1" },
        { path: "A.TXT", data: "2" },
      ])
    ).toThrow(/duplicate/i);
  });

  it("strips traversal segments from entry paths", () => {
    expect(normalizeZipPath("/../../etc/passwd")).toBe("etc/passwd");
    expect(normalizeZipPath("documents\\01-isf.pdf")).toBe("documents/01-isf.pdf");
    expect(() => normalizeZipPath("../..")).toThrow();
  });

  it("clamps timestamps to what DOS can represent", () => {
    expect(toDosDateTime(new Date("1970-01-01T00:00:00Z")).date >> 9).toBe(0); // 1980
    const y2k = toDosDateTime(new Date("2000-01-02T03:04:06Z"));
    expect(y2k.date).toBe(((2000 - 1980) << 9) | (1 << 5) | 2);
    expect(y2k.time).toBe((3 << 11) | (4 << 5) | 3);
  });

  it("produces an archive the system unzip accepts", () => {
    let unzipAvailable = true;
    try {
      execFileSync("unzip", ["-v"], { stdio: "ignore" });
    } catch {
      unzipAvailable = false;
    }
    if (!unzipAvailable) return; // interop check only where unzip exists

    const zip = createZip([
      { path: "COVER-SHEET.txt", data: "hello broker\n" },
      { path: "documents/01-isf.pdf", data: Buffer.from("%PDF-1.4 fake") },
    ]);
    const dir = mkdtempSync(path.join(tmpdir(), "handoff-zip-"));
    const file = path.join(dir, "package.zip");
    writeFileSync(file, zip);

    expect(execFileSync("unzip", ["-t", file]).toString()).toMatch(/No errors detected/);
    expect(execFileSync("unzip", ["-p", file, "COVER-SHEET.txt"]).toString()).toBe(
      "hello broker\n"
    );
  });
});

// ─────────────────────────────────────────────────────────
// Consensus
// ─────────────────────────────────────────────────────────

describe("consensus across documents", () => {
  const agreeing = [
    doc("commercial_invoice", { country_of_origin: "China", total_value: 84_000 }),
    doc("packing_list", { country_of_origin: "china " }),
  ];

  it("reports a value every document agrees on, ignoring case and spacing", () => {
    expect(consensusString(agreeing, ["country_of_origin"])).toBe("China");
  });

  it("reports nothing when documents disagree, rather than picking one", () => {
    const conflicting = [
      doc("commercial_invoice", { country_of_origin: "China" }),
      doc("certificate_of_origin", { country_of_origin: "Vietnam" }),
    ];
    expect(consensusString(conflicting, ["country_of_origin"])).toBeNull();
  });

  it("reads one logical field from the different names documents give it", () => {
    const parties = [
      doc("bill_of_lading", { consignee: "Northwind Traders" }),
      doc("commercial_invoice", { buyer: "Northwind Traders" }),
    ];
    expect(consensusString(parties, ["consignee", "importer", "buyer"])).toBe("Northwind Traders");
  });

  it("accepts numbers inside tolerance and rejects them outside it", () => {
    const near = [
      doc("packing_list", { gross_weight_kg: 18_000 }),
      doc("bill_of_lading", { gross_weight_kg: 18_100 }),
    ];
    expect(consensusNumber(near, ["gross_weight_kg"], 2)).toBe(18_100);
    expect(consensusNumber(near, ["gross_weight_kg"], 0)).toBeNull();
  });

  it("unions container numbers across the set without duplicating", () => {
    const containers = [
      doc("bill_of_lading", { container_numbers: ["MSCU1234567", "MSCU7654321"] }),
      doc("packing_list", { container_numbers: ["mscu1234567"] }),
    ];
    expect(unionStrings(containers, ["container_numbers"])).toEqual([
      "MSCU1234567",
      "MSCU7654321",
    ]);
  });
});

// ─────────────────────────────────────────────────────────
// Manifest
// ─────────────────────────────────────────────────────────

describe("handoff manifest", () => {
  const cleanSet = [
    doc("bill_of_lading", {
      bl_number: "MSCUXY123456",
      carrier: "MSC",
      port_of_loading: "Shanghai",
      port_of_discharge: "Long Beach",
      shipper: "Sun Fruit Co",
      consignee: "Northwind Traders",
      container_numbers: ["MSCU1234567"],
      gross_weight_kg: 18_000,
      package_count: 240,
    }),
    doc("commercial_invoice", {
      invoice_number: "INV-8841",
      seller: "Sun Fruit Co",
      buyer: "Northwind Traders",
      currency: "USD",
      total_value: 84_000,
      incoterm: "FOB",
      country_of_origin: "China",
      hts_codes: ["0810.90.40"],
      package_count: 240,
    }),
    doc("packing_list", {
      invoice_number: "INV-8841",
      shipper: "Sun Fruit Co",
      consignee: "Northwind Traders",
      package_count: 240,
      net_weight_kg: 17_400,
      gross_weight_kg: 18_000,
    }),
  ];

  it("orders documents the way a broker works them", () => {
    const shuffled = [cleanSet[2], cleanSet[1], cleanSet[0]];
    const { manifest } = buildManifestFor(shuffled);
    expect(manifest.documents.map((d) => d.type)).toEqual([
      "bill_of_lading",
      "commercial_invoice",
      "packing_list",
    ]);
  });

  it("clears a consistent set to file", () => {
    const { manifest } = buildManifestFor(cleanSet);
    expect(manifest.clearedToFile).toBe(true);
    expect(manifest.blockerCount).toBe(0);
    expect(manifest.shipment.blNumber).toBe("MSCUXY123456");
    expect(manifest.shipment.declaredValue).toBe(84_000);
    expect(manifest.shipment.packageCount).toBe(240);
  });

  it("blanks a disagreeing figure and raises it as an action item instead", () => {
    const mismatched = [
      cleanSet[0],
      cleanSet[1],
      doc("packing_list", {
        invoice_number: "INV-8841",
        shipper: "Sun Fruit Co",
        consignee: "Northwind Traders",
        package_count: 238,
        gross_weight_kg: 18_000,
      }),
    ];
    const { manifest } = buildManifestFor(mismatched);
    expect(manifest.shipment.packageCount).toBeNull();
    expect(manifest.clearedToFile).toBe(false);
    expect(manifest.actionItems.some((i) => i.code === "reconcile.package_count_mismatch")).toBe(
      true
    );
  });

  it("turns a document the cargo requires but the set lacks into a blocker", () => {
    const { manifest } = buildManifestFor(cleanSet, {
      profile: { containsPlantProduct: true },
    });
    expect(manifest.missingDocuments).toContain("phytosanitary_certificate");
    expect(
      manifest.actionItems.some(
        (i) => i.code === "handoff.missing_document" && i.severity === "blocker"
      )
    ).toBe(true);
    expect(manifest.clearedToFile).toBe(false);
  });

  it("carries per-document validation blockers into the action list, blockers first", () => {
    const late = doc(
      "isf",
      { isf_transaction_number: "ISF-1", bl_number: "MSCUXY123456" },
      {
        validation: {
          type: "isf",
          valid: false,
          issues: [
            {
              severity: "warning",
              code: "isf.low_confidence",
              message: "Filing time was read with low confidence.",
              fields: ["filing_datetime"],
            },
            {
              severity: "blocker",
              code: "isf.filed_late",
              message: "The ISF was transmitted after the 24-hour pre-lading deadline.",
              fields: ["filing_datetime"],
              authority: "19 CFR 149",
            },
          ],
          completeness: 0.8,
          missingRequired: ["consolidator"],
          lowConfidenceFields: ["filing_datetime"],
        },
      }
    );
    const { manifest } = buildManifestFor([...cleanSet, late]);
    expect(manifest.actionItems[0].severity).toBe("blocker");
    expect(manifest.actionItems[0].message).toContain("19 CFR 149");
    expect(manifest.blockerCount).toBeGreaterThan(0);
    expect(manifest.clearedToFile).toBe(false);
  });

  it("drops info-level notes so the work list stays a work list", () => {
    const noisy = doc(
      "commercial_invoice",
      { invoice_number: "INV-1" },
      {
        validation: {
          type: "commercial_invoice",
          valid: true,
          issues: [
            { severity: "info", code: "invoice.note", message: "Payment terms not stated.", fields: [] },
          ],
          completeness: 1,
          missingRequired: [],
          lowConfidenceFields: [],
        },
      }
    );
    const items = buildActionItems([noisy], reconcileDocumentSet(extractionsOf([noisy]), {}));
    expect(items.some((i) => i.code === "invoice.note")).toBe(false);
  });

  it("marks a package released over acknowledged blockers", () => {
    const { manifest } = buildManifestFor(cleanSet, {
      profile: { containsFdaRegulatedProduct: true },
      acknowledge: true,
    });
    expect(manifest.releasedWithBlockers).toBe(true);
    expect(renderCoverSheetText(manifest)).toContain("RELEASED WITH UNRESOLVED BLOCKERS");
  });

  it("does not claim a clean package was released over blockers", () => {
    const { manifest } = buildManifestFor(cleanSet, { acknowledge: true });
    expect(manifest.releasedWithBlockers).toBe(false);
  });

  it("builds a shipment summary directly from a document set", () => {
    const summary = buildShipmentSummary(cleanSet, "SS-2026-0412");
    expect(summary.reference).toBe("SS-2026-0412");
    expect(summary.containerNumbers).toEqual(["MSCU1234567"]);
    expect(summary.currency).toBe("USD");
  });
});

// ─────────────────────────────────────────────────────────
// Archive planning + package
// ─────────────────────────────────────────────────────────

describe("archive planning", () => {
  it("numbers originals in filing order with a type-revealing name", () => {
    const documents = [
      doc("bill_of_lading", {}),
      doc("commercial_invoice", {}, { fileType: "image/png", fileName: "scan.png" }),
    ];
    const plan = planArchive(documents);
    expect(plan.archivePaths[documentKey(documents[0])]).toBe("documents/01-bill-of-lading.pdf");
    expect(plan.archivePaths[documentKey(documents[1])]).toBe("documents/02-commercial-invoice.png");
    expect(plan.omissions).toEqual([]);
  });

  it("records why an original is missing instead of dropping it silently", () => {
    const documents = [doc("isf", {}, { original: null })];
    const plan = planArchive(documents);
    expect(plan.archivePaths[documentKey(documents[0])]).toBeNull();
    expect(plan.omissions[0].reason).toMatch(/not stored/i);
  });

  it("omits an oversized original rather than failing the whole package", () => {
    const documents = [doc("bill_of_lading", {}, { original: Buffer.alloc(200) })];
    const plan = planArchive(documents, { maxOriginalBytes: 100 });
    expect(plan.archivePaths[documentKey(documents[0])]).toBeNull();
    expect(plan.omissions[0].reason).toMatch(/per-file limit/i);
  });

  it("stops attaching originals once the package limit is reached", () => {
    const documents = [
      doc("bill_of_lading", {}, { original: Buffer.alloc(80) }),
      doc("commercial_invoice", {}, { original: Buffer.alloc(80) }),
    ];
    const plan = planArchive(documents, { maxPackageBytes: 100 });
    expect(plan.archivePaths[documentKey(documents[0])]).not.toBeNull();
    expect(plan.archivePaths[documentKey(documents[1])]).toBeNull();
    expect(plan.omissions[0].reason).toMatch(/limit before this file/i);
  });

  it("derives an extension from the mime type, falling back to the file name", () => {
    expect(extensionFor("application/pdf", "x")).toBe("pdf");
    expect(extensionFor(null, "invoice.TIFF")).toBe("tiff");
    expect(extensionFor(null, "no-extension")).toBe("bin");
    expect(slugForType("certificate_of_origin")).toBe("certificate-of-origin");
  });
});

describe("handoff package", () => {
  const documents = [
    doc("bill_of_lading", { bl_number: "MSCUXY123456", carrier: "MSC" }),
    doc("commercial_invoice", { invoice_number: "INV-8841", currency: "USD", total_value: 1000 }),
  ];

  it("contains the cover sheet, the manifest and every original", () => {
    const { manifest, plan } = buildManifestFor(documents);
    const zip = buildHandoffZip({ manifest, documents, archivePaths: plan.archivePaths });
    const names = readZipEntries(zip).map((e) => e.name);
    expect(names).toEqual([
      "COVER-SHEET.txt",
      "COVER-SHEET.html",
      "manifest.json",
      "reconciliation.json",
      "documents/01-bill-of-lading.pdf",
      "documents/01-bill-of-lading.json",
      "documents/02-commercial-invoice.pdf",
      "documents/02-commercial-invoice.json",
    ]);
  });

  it("labels a missing original as not attached instead of printing the upload name", () => {
    const withoutOriginal = [doc("isf", { isf_transaction_number: "ISF-1" }, { original: null })];
    const { manifest } = buildManifestFor(withoutOriginal, { acknowledge: true });
    const text = renderCoverSheetText(manifest);
    expect(text).toContain("NOT ATTACHED (uploaded as isf.pdf)");
    expect(text).not.toMatch(/File\s+isf\.pdf/);
  });

  it("still ships the extraction when the original could not be attached", () => {
    const withoutOriginal = [documents[0], doc("isf", { isf_transaction_number: "ISF-1" }, { original: null })];
    const { manifest, plan } = buildManifestFor(withoutOriginal);
    const zip = buildHandoffZip({ manifest, documents: withoutOriginal, archivePaths: plan.archivePaths });
    const entries = readZipEntries(zip);
    expect(entries.map((e) => e.name)).toContain("documents/02-isf.json");
    expect(entries.map((e) => e.name)).not.toContain("documents/02-isf.pdf");

    const payload = JSON.parse(
      entries.find((e) => e.name === "documents/02-isf.json")!.data.toString("utf8")
    );
    expect(payload.originalIncluded).toBe(false);
    expect(payload.omissionReason).toMatch(/not stored/i);
  });

  it("writes a manifest a broker's system can parse back", () => {
    const { manifest, plan } = buildManifestFor(documents);
    const zip = buildHandoffZip({ manifest, documents, archivePaths: plan.archivePaths });
    const entries = readZipEntries(zip);
    const parsed = JSON.parse(entries.find((e) => e.name === "manifest.json")!.data.toString("utf8"));
    expect(parsed.version).toBe(1);
    expect(parsed.packageId).toBe("pkg-1");
    expect(parsed.expiresAt).toBe(EXPIRES.toISOString());
  });

  it("names the download after the bill of lading and the date", () => {
    const { manifest } = buildManifestFor(documents);
    expect(handoffFileName(manifest)).toBe("customs-handoff-MSCUXY123456-2026-06-15.zip");
  });

  it("sanitizes a hostile reference out of the download name", () => {
    const hostile = [doc("commercial_invoice", { invoice_number: "../../etc/passwd" })];
    const { manifest } = buildManifestFor(hostile);
    expect(handoffFileName(manifest)).not.toContain("/");
    expect(handoffFileName(manifest)).not.toContain("..");
  });
});

// ─────────────────────────────────────────────────────────
// Cover sheet
// ─────────────────────────────────────────────────────────

describe("cover sheet", () => {
  const documents = [
    doc("bill_of_lading", { bl_number: "MSCUXY123456", carrier: "MSC" }),
    doc("commercial_invoice", { invoice_number: "INV-8841", currency: "USD", total_value: 84_000 }),
  ];

  it("puts the action list above the enclosure list", () => {
    const { manifest } = buildManifestFor(documents, {
      profile: { containsPlantProduct: true },
      acknowledge: true,
    });
    const text = renderCoverSheetText(manifest);
    expect(text.indexOf("ACTION REQUIRED")).toBeLessThan(text.indexOf("ENCLOSED DOCUMENTS"));
  });

  it("says a value is not agreed rather than showing one document's number", () => {
    const disagreeing = [
      doc("commercial_invoice", { total_value: 84_000, currency: "USD" }),
      doc("packing_list", { total_value: 12_000 }),
    ];
    const { manifest } = buildManifestFor(disagreeing, { acknowledge: true });
    expect(renderCoverSheetText(manifest)).toContain("not agreed across documents");
  });

  it("escapes manifest data in the HTML rendering", () => {
    const hostile = [doc("commercial_invoice", { invoice_number: "INV-1" })];
    const reconciliation = reconcileDocumentSet(extractionsOf(hostile), {});
    const plan = planArchive(hostile);
    const manifest = buildHandoffManifest({
      packageId: "pkg-x",
      documents: hostile,
      reconciliation,
      profile: {},
      archivePaths: plan.archivePaths,
      generatedAt: NOW,
      expiresAt: EXPIRES,
      notes: '<script>alert("xss")</script>',
      brokerName: null,
    });
    const html = renderCoverSheetHtml(manifest);
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("renders a complete HTML document for the printable copy", () => {
    const { manifest } = buildManifestFor(documents);
    const html = renderCoverSheetHtml(manifest);
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("</html>");
  });
});

// ─────────────────────────────────────────────────────────
// Share link
// ─────────────────────────────────────────────────────────

describe("share link", () => {
  it("mints unguessable, well-formed, unique tokens", () => {
    const tokens = new Set(Array.from({ length: 200 }, () => generateShareToken()));
    expect(tokens.size).toBe(200);
    for (const token of tokens) expect(isWellFormedShareToken(token)).toBe(true);
  });

  it("rejects anything that is not a token shape before it reaches the database", () => {
    expect(isWellFormedShareToken("short")).toBe(false);
    expect(isWellFormedShareToken("a".repeat(43) + "+")).toBe(false);
    expect(isWellFormedShareToken(null)).toBe(false);
    expect(isWellFormedShareToken(undefined)).toBe(false);
  });

  it("hashes deterministically and never stores the token", () => {
    const token = generateShareToken();
    const hash = hashShareToken(token);
    expect(hash).toHaveLength(64);
    expect(hash).toBe(hashShareToken(token));
    expect(hash).not.toContain(token);
    expect(tokenPrefix(token)).toBe(token.slice(0, 8));
  });

  it("matches only the token that produced the hash", () => {
    const token = generateShareToken();
    expect(shareTokenMatches(token, hashShareToken(token))).toBe(true);
    expect(shareTokenMatches(generateShareToken(), hashShareToken(token))).toBe(false);
    expect(shareTokenMatches(token, "not-a-hash")).toBe(false);
  });

  it("clamps expiry to the supported window", () => {
    expect(clampExpiryHours(0)).toBe(MIN_EXPIRY_HOURS);
    expect(clampExpiryHours(10_000)).toBe(MAX_EXPIRY_HOURS);
    expect(clampExpiryHours(undefined)).toBe(DEFAULT_EXPIRY_HOURS);
    expect(clampExpiryHours(Number.NaN)).toBe(DEFAULT_EXPIRY_HOURS);
    expect(expiryFrom(NOW, 24).toISOString()).toBe("2026-06-16T12:00:00.000Z");
  });

  it("reports active, expired and revoked distinctly", () => {
    expect(resolveLinkState({ expiresAt: EXPIRES, now: NOW }).status).toBe("active");
    expect(resolveLinkState({ expiresAt: NOW, now: EXPIRES }).status).toBe("expired");
    // Revocation beats expiry — "revoked" reads like a decision, "expired"
    // reads like an accident, and the broker will ask which it was.
    expect(resolveLinkState({ expiresAt: EXPIRES, revokedAt: NOW, now: NOW }).status).toBe("revoked");
    expect(resolveLinkState({ expiresAt: NOW, revokedAt: NOW, now: EXPIRES }).status).toBe("revoked");
  });

  it("counts down in units a person reads", () => {
    expect(resolveLinkState({ expiresAt: EXPIRES, now: NOW }).secondsRemaining).toBe(259_200);
    expect(formatRemaining(259_200)).toBe("3 days");
    expect(formatRemaining(7_200)).toBe("2 hours");
    expect(formatRemaining(90)).toBe("1 minute");
    expect(formatRemaining(0)).toBe("expired");
  });
});
