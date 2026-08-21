// ============================================================
// Customs broker handoff package (AI-12018) — public surface
//
// Everything exported here is pure. The API routes own auth, blob reads and
// the database; the decisions — what goes in the package, what the cover sheet
// says, whether a link is still good — are all unit-testable functions.
// ============================================================

export * from "./types";
export {
  createZip,
  crc32,
  toDosDateTime,
  normalizeZipPath,
  ZIP_MAX_BYTES,
  ZIP_MAX_ENTRIES,
  type ZipEntryInput,
} from "./zip";
export {
  buildHandoffManifest,
  buildShipmentSummary,
  buildActionItems,
  consensusString,
  consensusNumber,
  unionStrings,
  documentSortIndex,
} from "./manifest";
export {
  renderCoverSheetText,
  renderCoverSheetHtml,
  renderCoverSheetBodyHtml,
  formatTimestamp,
} from "./cover-sheet";
export {
  buildHandoffZip,
  planArchive,
  handoffFileName,
  documentKey,
  slugForType,
  extensionFor,
  MAX_ORIGINAL_BYTES,
  MAX_PACKAGE_BYTES,
  type PlannedArchive,
} from "./package";
export {
  generateShareToken,
  hashShareToken,
  tokenPrefix,
  shareTokenMatches,
  isWellFormedShareToken,
  clampExpiryHours,
  expiryFrom,
  resolveLinkState,
  linkStatusMessage,
  formatRemaining,
  TOKEN_BYTES,
  TOKEN_PREFIX_LENGTH,
  MIN_EXPIRY_HOURS,
  MAX_EXPIRY_HOURS,
  DEFAULT_EXPIRY_HOURS,
} from "./share-link";
