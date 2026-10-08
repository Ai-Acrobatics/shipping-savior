import { describe, it, expect } from "vitest";
import {
  ACE_LINKS,
  aceLinksFor,
  aesIssueResolved,
  aesNeedsAttention,
  applyAesUpdate,
  isItn,
  normalizeAesNumber,
  readAesFiling,
} from "./aes";

const NOW = new Date("2026-10-07T12:00:00Z");

describe("normalizeAesNumber / isItn", () => {
  it("strips labels and whitespace and uppercases", () => {
    expect(normalizeAesNumber("AES# x2025 0930 123456")).toBe("X20250930123456");
    expect(normalizeAesNumber("ITN: X20250930123456")).toBe("X20250930123456");
    expect(normalizeAesNumber("   ")).toBeNull();
    expect(normalizeAesNumber(null)).toBeNull();
  });

  it("recognises the ITN shape only", () => {
    expect(isItn("X20250930123456")).toBe(true);
    expect(isItn("X2025093012345")).toBe(false);
    expect(isItn("20250930123456")).toBe(false);
    expect(isItn(undefined)).toBe(false);
  });
});

describe("readAesFiling", () => {
  it("is TBD with no AES number and no explicit status", () => {
    const f = readAesFiling({ aesNumber: null });
    expect(f.status).toBe("tbd");
    expect(f.explicit).toBe(false);
    expect(aesNeedsAttention(f)).toBe(true);
  });

  it("infers accepted from an ITN on legacy rows", () => {
    expect(readAesFiling({ aesNumber: "X20250930123456" }).status).toBe("accepted");
  });

  it("infers filed from a non-ITN AES number", () => {
    expect(readAesFiling({ aesNumber: "PENDING-77" }).status).toBe("filed");
  });

  it("prefers an explicit status and ignores junk ones", () => {
    expect(readAesFiling({ aesStatus: "rejected", aesNumber: null }).status).toBe("rejected");
    expect(readAesFiling({ aesStatus: "teleporting", aesNumber: null }).status).toBe("tbd");
    expect(readAesFiling(null).status).toBe("tbd");
  });

  it("treats exempt as resolving the review issue", () => {
    expect(aesIssueResolved({ status: "exempt", aesNumber: null })).toBe(true);
    expect(aesIssueResolved({ status: "tbd", aesNumber: null })).toBe(false);
    expect(aesIssueResolved({ status: "accepted", aesNumber: "X20250930123456" })).toBe(true);
  });
});

describe("applyAesUpdate", () => {
  it("stamps filedAt on the move to filed and keeps it on re-save", () => {
    const first = applyAesUpdate({}, { aesStatus: "filed" }, NOW);
    expect(first.ok && first.meta.aesFiledAt).toBe(NOW.toISOString());
    const later = new Date("2026-10-09T00:00:00Z");
    const again = applyAesUpdate(first.ok ? first.meta : {}, { aesStatus: "filed" }, later);
    expect(again.ok && again.meta.aesFiledAt).toBe(NOW.toISOString());
  });

  it("requires an ITN to accept", () => {
    const bad = applyAesUpdate({}, { aesStatus: "accepted" }, NOW);
    expect(bad.ok).toBe(false);
    const good = applyAesUpdate(
      {},
      { aesStatus: "accepted", aesNumber: "x20250930123456" },
      NOW
    );
    expect(good.ok).toBe(true);
    if (good.ok) {
      expect(good.meta.aesNumber).toBe("X20250930123456");
      expect(good.meta.aesAcceptedAt).toBe(NOW.toISOString());
      expect(good.meta.aesFiledAt).toBe(NOW.toISOString());
    }
  });

  it("requires a citation to mark exempt", () => {
    expect(applyAesUpdate({}, { aesStatus: "exempt" }, NOW).ok).toBe(false);
    const ok = applyAesUpdate({}, { aesStatus: "exempt", aesExemption: "NOEEI 30.37(a)" }, NOW);
    expect(ok.ok && ok.meta.aesExemption).toBe("NOEEI 30.37(a)");
  });

  it("clears timestamps when dropped back to TBD", () => {
    const res = applyAesUpdate(
      { aesStatus: "filed", aesFiledAt: NOW.toISOString() },
      { aesStatus: "tbd" },
      NOW
    );
    expect(res.ok && res.meta.aesFiledAt).toBeNull();
  });

  it("rejects unknown statuses and non-string numbers", () => {
    expect(applyAesUpdate({}, { aesStatus: "teleporting" }, NOW).ok).toBe(false);
    expect(applyAesUpdate({}, { aesNumber: 42 }, NOW).ok).toBe(false);
  });

  it("does not mutate the input meta", () => {
    const meta = { week: "Week 40" };
    applyAesUpdate(meta, { aesStatus: "filed" }, NOW);
    expect(meta).toEqual({ week: "Week 40" });
  });
});

describe("aceLinksFor", () => {
  it("leads with exactly one primary next action for every status", () => {
    for (const status of ["tbd", "filed", "accepted", "rejected", "exempt"] as const) {
      const links = aceLinksFor({ status });
      expect(links[0].primary).toBe(true);
      expect(links.filter((l) => l.primary)).toHaveLength(1);
      for (const l of links) expect(l.href).toMatch(/^https:\/\/(ace\.cbp\.dhs\.gov|www\.cbp\.gov|www\.census\.gov)\//);
    }
  });

  it("sends unfiled shipments to the ACE portal", () => {
    expect(aceLinksFor({ status: "tbd" })[0].href).toBe(ACE_LINKS.acePortal);
  });
});
