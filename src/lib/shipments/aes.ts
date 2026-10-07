/**
 * AES / EEI filing tracker (AI-12006).
 *
 * Every export shipment over the EEI threshold needs an Electronic Export
 * Information filing in AESDirect (inside CBP's ACE portal). When CBP accepts
 * the filing it returns an Internal Transaction Number (ITN) — that ITN is the
 * "AES #" on Blake's board. 64 of 204 real rows were missing it in the audit,
 * which made it the single biggest review-queue gap.
 *
 * State lives in shipments.importMeta (alongside the existing aesNumber) rather
 * than in new columns, so the tracker works on the current prod schema with no
 * migration:
 *
 *   importMeta.aesStatus      "tbd" | "filed" | "accepted" | "rejected" | "exempt"
 *   importMeta.aesNumber      the ITN (already used by the review queue)
 *   importMeta.aesFiledAt     ISO timestamp, stamped on the move to filed
 *   importMeta.aesAcceptedAt  ISO timestamp, stamped on the move to accepted
 *   importMeta.aesExemption   FTR exemption citation, e.g. "NOEEI 30.37(a)"
 *
 * Rows imported before this tracker carry no aesStatus; their status is derived
 * from the AES # alone (see readAesFiling).
 */

export const AES_STATUSES = ["tbd", "filed", "accepted", "rejected", "exempt"] as const;
export type AesStatus = (typeof AES_STATUSES)[number];

export const AES_STATUS_LABELS: Record<AesStatus, string> = {
  tbd: "TBD",
  filed: "Filed",
  accepted: "Accepted",
  rejected: "Rejected",
  exempt: "Exempt",
};

/** The happy path the progress tracker renders. */
export const AES_PROGRESS: readonly AesStatus[] = ["tbd", "filed", "accepted"];

/** ITN: "X" + filing date (YYYYMMDD) + 6-digit sequence, e.g. X20250930123456. */
const ITN_PATTERN = /^X\d{14}$/;

export function isItn(value: unknown): boolean {
  return typeof value === "string" && ITN_PATTERN.test(value);
}

/**
 * Normalise a pasted AES number: trim, uppercase, drop whitespace and a leading
 * "AES"/"ITN" label ("AES# x2025 0930 123456" -> "X20250930123456").
 * Returns null for blanks.
 */
export function normalizeAesNumber(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value
    .trim()
    .toUpperCase()
    .replace(/^(AES|ITN)\s*[#:]?\s*/, "")
    .replace(/\s+/g, "");
  return cleaned.length ? cleaned : null;
}

export function isAesStatus(value: unknown): value is AesStatus {
  return typeof value === "string" && (AES_STATUSES as readonly string[]).includes(value);
}

export interface AesFiling {
  status: AesStatus;
  /** True when status came from importMeta.aesStatus rather than being inferred. */
  explicit: boolean;
  aesNumber: string | null;
  filedAt: string | null;
  acceptedAt: string | null;
  exemption: string | null;
}

const str = (v: unknown) => (typeof v === "string" && v.trim().length ? v.trim() : null);

/**
 * Read the filing state out of importMeta. Without an explicit status, an ITN
 * means CBP accepted the filing (an ITN is only issued on acceptance); any
 * other recorded AES # is treated as filed-but-unconfirmed; nothing at all is
 * TBD.
 */
export function readAesFiling(importMeta: unknown): AesFiling {
  const meta =
    importMeta && typeof importMeta === "object" ? (importMeta as Record<string, unknown>) : {};
  const aesNumber = str(meta.aesNumber);
  const base = {
    aesNumber,
    filedAt: str(meta.aesFiledAt),
    acceptedAt: str(meta.aesAcceptedAt),
    exemption: str(meta.aesExemption),
  };
  if (isAesStatus(meta.aesStatus)) {
    return { status: meta.aesStatus, explicit: true, ...base };
  }
  const status: AesStatus = !aesNumber ? "tbd" : isItn(aesNumber) ? "accepted" : "filed";
  return { status, explicit: false, ...base };
}

/** Whether the shipment still needs AES attention (drives the review queue). */
export function aesNeedsAttention(filing: AesFiling): boolean {
  return filing.status === "tbd" || filing.status === "filed" || filing.status === "rejected";
}

/** Whether the "missing AES filing number" review issue is resolved. */
export function aesIssueResolved(filing: Pick<AesFiling, "status" | "aesNumber">): boolean {
  return Boolean(filing.aesNumber) || filing.status === "exempt";
}

export interface AesUpdateInput {
  aesStatus?: unknown;
  aesNumber?: unknown;
  aesExemption?: unknown;
}

export type AesUpdateResult =
  | { ok: true; meta: Record<string, unknown> }
  | { ok: false; error: string };

/**
 * Apply an AES edit to a copy of importMeta. Only keys present in `input` are
 * touched. Enforces the invariants the tracker depends on:
 *
 *   - accepted requires an ITN (that is what acceptance produces)
 *   - exempt requires an FTR exemption citation
 *   - filed/accepted stamp their timestamps once; dropping back to TBD clears them
 */
export function applyAesUpdate(
  currentMeta: Record<string, unknown>,
  input: AesUpdateInput,
  now: Date = new Date()
): AesUpdateResult {
  const meta = { ...currentMeta };

  if ("aesNumber" in input) {
    if (input.aesNumber !== null && typeof input.aesNumber !== "string") {
      return { ok: false, error: "aesNumber must be a string" };
    }
    meta.aesNumber = normalizeAesNumber(input.aesNumber);
  }

  if ("aesExemption" in input) {
    if (input.aesExemption !== null && typeof input.aesExemption !== "string") {
      return { ok: false, error: "aesExemption must be a string" };
    }
    meta.aesExemption = str(input.aesExemption);
  }

  if (!("aesStatus" in input)) return { ok: true, meta };

  const status = input.aesStatus;
  if (!isAesStatus(status)) {
    return {
      ok: false,
      error: `Invalid aesStatus. Expected one of: ${AES_STATUSES.join(", ")}`,
    };
  }

  const stamp = now.toISOString();
  if (status === "accepted") {
    if (!isItn(meta.aesNumber)) {
      return {
        ok: false,
        error: "An accepted filing needs its ITN (e.g. X20250930123456) as the AES number",
      };
    }
    meta.aesFiledAt = str(meta.aesFiledAt) ?? stamp;
    meta.aesAcceptedAt = str(meta.aesAcceptedAt) ?? stamp;
  } else if (status === "filed" || status === "rejected") {
    meta.aesFiledAt = str(meta.aesFiledAt) ?? stamp;
    meta.aesAcceptedAt = null;
  } else if (status === "exempt") {
    if (!str(meta.aesExemption)) {
      return {
        ok: false,
        error: "An exempt shipment needs its FTR exemption citation (e.g. NOEEI 30.37(a))",
      };
    }
    meta.aesFiledAt = null;
    meta.aesAcceptedAt = null;
  } else {
    meta.aesFiledAt = null;
    meta.aesAcceptedAt = null;
  }
  meta.aesStatus = status;
  return { ok: true, meta };
}

// ── CBP ACE deep links ────────────────────────────────────────────────────────
//
// ACE is login-gated and has no per-ITN URL, so the links point at the right
// entry point for the next action and the card offers the ITN for copy/paste.

export const ACE_LINKS = {
  acePortal: "https://ace.cbp.dhs.gov/",
  aesDirect: "https://www.cbp.gov/trade/aes/aesdirect",
  aesOverview: "https://www.cbp.gov/trade/aes",
  censusAes: "https://www.census.gov/foreign-trade/aes/index.html",
  ftrRegulations: "https://www.census.gov/foreign-trade/regulations/index.html",
} as const;

export interface AceLink {
  label: string;
  href: string;
  primary?: boolean;
}

/** The next-action links for a filing, primary action first. */
export function aceLinksFor(filing: Pick<AesFiling, "status">): AceLink[] {
  switch (filing.status) {
    case "tbd":
      return [
        { label: "File EEI in AESDirect (ACE)", href: ACE_LINKS.acePortal, primary: true },
        { label: "AESDirect filing guide", href: ACE_LINKS.aesDirect },
        { label: "Do I need to file? (FTR)", href: ACE_LINKS.ftrRegulations },
      ];
    case "filed":
      return [
        { label: "Check filing response in ACE", href: ACE_LINKS.acePortal, primary: true },
        { label: "AESDirect filing guide", href: ACE_LINKS.aesDirect },
      ];
    case "rejected":
      return [
        { label: "Correct & resubmit in AESDirect", href: ACE_LINKS.acePortal, primary: true },
        { label: "AES response codes & help", href: ACE_LINKS.censusAes },
      ];
    case "accepted":
      return [
        { label: "View filing in ACE", href: ACE_LINKS.acePortal, primary: true },
        { label: "AES program overview", href: ACE_LINKS.aesOverview },
      ];
    case "exempt":
      return [
        { label: "FTR exemption rules", href: ACE_LINKS.ftrRegulations, primary: true },
        { label: "AES program overview", href: ACE_LINKS.aesOverview },
      ];
  }
}
