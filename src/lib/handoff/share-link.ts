// ============================================================
// Customs broker handoff — time-limited share link (AI-12018)
//
// The link is the security boundary. A handoff package carries the commercial
// value of the shipment, the parties, and the importer of record number — so
// the URL a broker gets emailed has to be unguessable, revocable, and dead on
// a deadline.
//
// Design notes that matter:
//
//   * 256 bits of CSPRNG entropy, base64url. Not a UUID: v4 gives 122 bits and
//     reads like an internal id a recipient might paste into a ticket.
//   * Stored as a SHA-256 hash and looked up by that hash. Deliberately NOT
//     the bcrypt-scan the password-reset flow uses — that pattern is O(n) over
//     outstanding tokens and is called by an anonymous requester here. A fast
//     hash is the right call precisely because the secret is full-entropy
//     random rather than a low-entropy human password.
//   * The ZIP itself is never handed out by its blob URL. Vercel Blob is
//     public-read and permanent, so exposing that URL would make "time-limited"
//     a lie; bytes are streamed back through the token-checked route instead.
// ============================================================

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { HandoffLinkState, HandoffLinkStatus } from "./types";

export const TOKEN_BYTES = 32;
/** Shown in the UI so a user can tell two outstanding links apart. Not a secret. */
export const TOKEN_PREFIX_LENGTH = 8;

export const MIN_EXPIRY_HOURS = 1;
/** 14 days. A customs entry that has not been filed in two weeks needs a new package. */
export const MAX_EXPIRY_HOURS = 24 * 14;
export const DEFAULT_EXPIRY_HOURS = 72;

/** URL-safe share token. Never stored — only its hash is. */
export function generateShareToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashShareToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function tokenPrefix(token: string): string {
  return token.slice(0, TOKEN_PREFIX_LENGTH);
}

/**
 * Constant-time hash comparison. The DB lookup is by hash so this is belt-and-
 * braces, but a route that compares secrets with `===` invites the next change
 * to that route to be the vulnerable one.
 */
export function shareTokenMatches(token: string, storedHash: string): boolean {
  const candidate = Buffer.from(hashShareToken(token), "utf8");
  const stored = Buffer.from(String(storedHash ?? ""), "utf8");
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}

/**
 * Tokens are base64url of exactly TOKEN_BYTES. Anything else never existed, so
 * the route can reject it without a DB round trip.
 */
export function isWellFormedShareToken(token: unknown): token is string {
  if (typeof token !== "string") return false;
  const expectedLength = Math.ceil((TOKEN_BYTES * 4) / 3);
  return token.length === expectedLength && /^[A-Za-z0-9_-]+$/.test(token);
}

export function clampExpiryHours(hours: unknown): number {
  const value = typeof hours === "number" && Number.isFinite(hours) ? hours : DEFAULT_EXPIRY_HOURS;
  return Math.min(Math.max(Math.round(value), MIN_EXPIRY_HOURS), MAX_EXPIRY_HOURS);
}

export function expiryFrom(now: Date, hours: number): Date {
  return new Date(now.getTime() + clampExpiryHours(hours) * 3600_000);
}

/**
 * Resolve a link's state. Revocation beats expiry: a link that was pulled back
 * should say so, because "expired" reads like an accident and "revoked" reads
 * like a decision — and the broker will ask which one it was.
 */
export function resolveLinkState(args: {
  expiresAt: Date | string;
  revokedAt?: Date | string | null;
  now?: Date;
}): HandoffLinkState {
  const now = args.now ?? new Date();
  const expiresAt = args.expiresAt instanceof Date ? args.expiresAt : new Date(args.expiresAt);

  if (args.revokedAt) return { status: "revoked", secondsRemaining: 0 };
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= now.getTime()) {
    return { status: "expired", secondsRemaining: 0 };
  }
  return {
    status: "active",
    secondsRemaining: Math.floor((expiresAt.getTime() - now.getTime()) / 1000),
  };
}

const STATUS_MESSAGES: Record<HandoffLinkStatus, string> = {
  active: "",
  expired:
    "This handoff link has expired. Ask the sender to issue a new one — packages are time-limited on purpose.",
  revoked:
    "This handoff link was revoked by the sender. Contact them before filing anything against an earlier copy.",
};

export function linkStatusMessage(status: HandoffLinkStatus): string {
  return STATUS_MESSAGES[status];
}

/** Human "expires in 2 days" / "expires in 6 hours" for the UI. */
export function formatRemaining(secondsRemaining: number): string {
  if (secondsRemaining <= 0) return "expired";
  const days = Math.floor(secondsRemaining / 86400);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"}`;
  const hours = Math.floor(secondsRemaining / 3600);
  if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const minutes = Math.max(1, Math.floor(secondsRemaining / 60));
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}
