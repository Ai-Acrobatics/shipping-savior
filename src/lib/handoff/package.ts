// ============================================================
// Customs broker handoff — package assembly (AI-12018)
//
// Assembles the ZIP the broker downloads. Pure: takes already-fetched bytes,
// returns bytes. Nothing here touches the network, the DB or the clock.
//
// Layout, and why:
//
//   COVER-SHEET.txt      first thing alphabetically and first thing to read
//   COVER-SHEET.html     same content, printable
//   manifest.json        machine-readable, for a broker's own system
//   reconciliation.json  the cross-document findings in full
//   documents/01-bill-of-lading.pdf ...   originals, numbered in filing order
//   documents/01-bill-of-lading.json ...  the extraction for that document
//
// Originals are numbered rather than kept under their upload names because the
// upload name is whatever the shipper called it. `03-packing-list.pdf` tells
// the broker what it is before they open it.
// ============================================================

import { createZip, type ZipEntryInput } from "./zip";
import { renderCoverSheetHtml, renderCoverSheetText } from "./cover-sheet";
import type { HandoffManifest, HandoffSourceDocument } from "./types";

/** Per-file ceiling, matching the OCR upload cap in /api/documents. */
export const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024;
/** Whole-archive ceiling — an email-able package, not a data dump. */
export const MAX_PACKAGE_BYTES = 45 * 1024 * 1024;

const EXTENSION_BY_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/tiff": "tif",
};

export function extensionFor(fileType: string | null, fileName: string | null): string {
  const byMime = fileType ? EXTENSION_BY_MIME[fileType.toLowerCase()] : undefined;
  if (byMime) return byMime;
  const match = /\.([a-z0-9]{1,8})$/i.exec(fileName ?? "");
  return match ? match[1].toLowerCase() : "bin";
}

/** `bill_of_lading` → `bill-of-lading`. */
export function slugForType(type: string): string {
  return type.replace(/_/g, "-");
}

/** Stable key a source document is addressed by across the build. */
export function documentKey(doc: HandoffSourceDocument): string {
  return doc.documentId ?? doc.fileName ?? doc.type;
}

export interface PlannedArchive {
  /** documentKey → path inside the ZIP, or null when no original is attached. */
  archivePaths: Record<string, string | null>;
  /** Documents dropped from the archive, with the reason. */
  omissions: Array<{ key: string; reason: string }>;
  /**
   * Same reasons keyed by documentKey. The manifest needs the *specific*
   * reason ("2.4MB over the per-file limit"), not a generic "not attached" —
   * a broker deciding whether to chase the sender needs to know which.
   */
  omissionReasons: Record<string, string>;
  /** Bytes of originals that will be embedded. */
  originalBytes: number;
}

/**
 * Decide which originals make it into the archive.
 *
 * A document too large for the archive is dropped rather than the whole build
 * failing — the broker still gets the cover sheet, the extraction and an
 * explicit note that the original was too large, which is strictly better than
 * no package at all. What is never silent is the omission itself.
 */
export function planArchive(
  documents: HandoffSourceDocument[],
  options: { maxOriginalBytes?: number; maxPackageBytes?: number } = {}
): PlannedArchive {
  const maxOriginal = options.maxOriginalBytes ?? MAX_ORIGINAL_BYTES;
  const maxPackage = options.maxPackageBytes ?? MAX_PACKAGE_BYTES;

  const archivePaths: Record<string, string | null> = {};
  const omissions: Array<{ key: string; reason: string }> = [];
  const omissionReasons: Record<string, string> = {};
  let originalBytes = 0;
  let index = 0;

  const omit = (key: string, reason: string) => {
    archivePaths[key] = null;
    omissions.push({ key, reason });
    omissionReasons[key] = reason;
  };

  for (const doc of documents) {
    index += 1;
    const key = documentKey(doc);
    const prefix = String(index).padStart(2, "0");

    if (!doc.original) {
      omit(
        key,
        doc.omissionReason ??
          "The original file was not stored for this document — only the extracted data is available."
      );
      continue;
    }
    if (doc.original.length > maxOriginal) {
      omit(
        key,
        `The original is ${(doc.original.length / 1024 / 1024).toFixed(1)}MB, over the ${(
          maxOriginal /
          1024 /
          1024
        ).toFixed(0)}MB per-file limit, and was not attached. Request it directly.`
      );
      continue;
    }
    if (originalBytes + doc.original.length > maxPackage) {
      omit(
        key,
        `The package reached its ${(maxPackage / 1024 / 1024).toFixed(
          0
        )}MB limit before this file. Request it directly.`
      );
      continue;
    }

    archivePaths[key] = `documents/${prefix}-${slugForType(doc.type)}.${extensionFor(
      doc.fileType,
      doc.fileName
    )}`;
    originalBytes += doc.original.length;
  }

  return { archivePaths, omissions, omissionReasons, originalBytes };
}

/**
 * Build the ZIP. `documents` must be in the same order used to plan the
 * archive, so the numbering on disk matches the numbering on the cover sheet.
 */
export function buildHandoffZip(args: {
  manifest: HandoffManifest;
  documents: HandoffSourceDocument[];
  archivePaths: Record<string, string | null>;
  generatedAt?: Date;
}): Buffer {
  const modifiedAt = args.generatedAt ?? new Date(args.manifest.generatedAt);

  const entries: ZipEntryInput[] = [
    { path: "COVER-SHEET.txt", data: renderCoverSheetText(args.manifest), modifiedAt },
    { path: "COVER-SHEET.html", data: renderCoverSheetHtml(args.manifest), modifiedAt },
    { path: "manifest.json", data: JSON.stringify(args.manifest, null, 2), modifiedAt },
    {
      path: "reconciliation.json",
      data: JSON.stringify(args.manifest.reconciliation, null, 2),
      modifiedAt,
    },
  ];

  let index = 0;
  for (const doc of args.documents) {
    index += 1;
    const key = documentKey(doc);
    const prefix = String(index).padStart(2, "0");
    const base = `documents/${prefix}-${slugForType(doc.type)}`;

    const path = args.archivePaths[key];
    if (path && doc.original) {
      entries.push({ path, data: doc.original, modifiedAt });
    }

    const entry = args.manifest.documents.find(
      (d) => (d.documentId ?? d.fileName ?? d.type) === key
    );
    entries.push({
      path: `${base}.json`,
      data: JSON.stringify(
        {
          documentType: doc.type,
          originalFileName: doc.fileName,
          originalIncluded: !!path,
          omissionReason: entry?.omissionReason ?? null,
          extracted: doc.fields ?? {},
          validation: doc.validation,
        },
        null,
        2
      ),
      modifiedAt,
    });
  }

  return createZip(entries);
}

/**
 * Filename the broker's browser sees. Built from the B/L or reference so a
 * broker handling twelve entries a day can tell two downloads apart.
 */
export function handoffFileName(manifest: HandoffManifest): string {
  const stem =
    manifest.shipment.blNumber ||
    manifest.shipment.reference ||
    manifest.shipment.invoiceNumber ||
    manifest.packageId;
  const safe = String(stem)
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const date = manifest.generatedAt.slice(0, 10);
  return `customs-handoff-${safe || "package"}-${date}.zip`;
}
