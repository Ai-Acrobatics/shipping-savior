/**
 * Unit tests for GET /api/vessels/positions (AI-12012).
 *
 * Pins the contract the vessel map depends on: auth gating, org scoping,
 * active-status filtering, real port resolution against data/ports.json,
 * AIS overlay when a provider returns a fix, and graceful degradation to
 * schedule estimates when it does not.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: { select: vi.fn() } }));
vi.mock("@/lib/ais/provider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ais/provider")>();
  return { ...actual, getAisProvider: vi.fn() };
});

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAisProvider } from "@/lib/ais/provider";
import { GET } from "./route";

const SESSION = { user: { id: "user-1", orgId: "org-1", role: "owner" } } as never;

const ROW = {
  id: "ship-1",
  reference: "PO-9001",
  containerNumber: "MSCU1234567",
  vesselName: "MSC OSCAR",
  voyageNumber: "24W",
  carrier: "MSC",
  pol: "CNSHA",
  pod: "Long Beach",
  originPort: null,
  destPort: null,
  etd: new Date("2026-08-01T00:00:00.000Z"),
  eta: new Date("2026-09-01T00:00:00.000Z"),
  status: "in_transit",
  progress: 50,
};

function mockRows(rows: unknown[]) {
  const chain: any = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(rows),
  };
  (db.select as any).mockReturnValue(chain);
  return chain;
}

function mockProvider(id: string, positions: unknown[] = []) {
  const fetchPositions = vi.fn().mockResolvedValue(positions);
  (getAisProvider as any).mockReturnValue({ id, fetchPositions });
  return fetchPositions;
}

const req = (url = "http://test/api/vessels/positions") => new NextRequest(url);

/**
 * Collect the *bound parameter* values out of a Drizzle SQL condition.
 *
 * Only `queryChunks` and `Param.value` are walked — following column
 * references would drag in the whole table schema (including every enum
 * value), which makes "is `in_transit` in this WHERE clause?" always true.
 */
function boundParams(node: unknown, depth = 0): string[] {
  if (!node || typeof node !== "object" || depth > 8) return [];
  const obj = node as Record<string, unknown>;
  const out: string[] = [];

  if (Array.isArray(node)) {
    for (const entry of node) out.push(...boundParams(entry, depth + 1));
    return out;
  }
  if ("value" in obj && (typeof obj.value === "string" || typeof obj.value === "number")) {
    out.push(String(obj.value));
  }
  if (Array.isArray(obj.queryChunks)) {
    for (const chunk of obj.queryChunks) out.push(...boundParams(chunk, depth + 1));
  }
  return out;
}

beforeEach(() => {
  vi.clearAllMocks();
  (auth as any).mockResolvedValue(SESSION);
  mockProvider("none");
});

describe("GET /api/vessels/positions", () => {
  it("401s without a session", async () => {
    (auth as any).mockResolvedValue(null);
    expect((await GET(req())).status).toBe(401);
  });

  it("401s when the session has no org", async () => {
    (auth as any).mockResolvedValue({ user: { id: "user-1" } } as never);
    expect((await GET(req())).status).toBe(401);
  });

  it("returns a lane with a real great-circle path and resolved ports", async () => {
    mockRows([ROW]);
    const body = await (await GET(req())).json();

    expect(body.lanes).toHaveLength(1);
    const lane = body.lanes[0];
    expect(lane.origin.locode).toBe("CNSHA");
    expect(lane.destination.locode).toBe("USLGB");
    expect(lane.path.length).toBeGreaterThan(50);
    expect(lane.distanceKm).toBeGreaterThan(9000);
    expect(lane.progress).toBeCloseTo(0.5, 6);
    expect(lane.vessel.live).toBe(false);
    expect(lane.vessel.positionSource).toBe("schedule");
  });

  it("reports meta the UI banner depends on", async () => {
    mockRows([ROW]);
    const body = await (await GET(req())).json();
    expect(body.meta).toMatchObject({
      shipmentsConsidered: 1,
      laneCount: 1,
      unresolvedCount: 0,
      aisProvider: "none",
      livePositions: 0,
      estimatedPositions: 1,
    });
  });

  it("overlays a live AIS fix onto the matching lane", async () => {
    mockRows([ROW]);
    mockProvider("aishub", [
      {
        name: "MSC OSCAR",
        lat: 35.5,
        lng: -150.25,
        sogKnots: 19.1,
        cogDegrees: 88,
        headingDegrees: 90,
        timestamp: new Date().toISOString(),
        source: "aishub",
      },
    ]);

    const body = await (await GET(req())).json();
    expect(body.lanes[0].vessel).toMatchObject({
      live: true,
      lat: 35.5,
      lng: -150.25,
      sogKnots: 19.1,
      positionSource: "aishub",
    });
    expect(body.meta.livePositions).toBe(1);
  });

  it("ignores a stale AIS fix and keeps the schedule estimate", async () => {
    mockRows([ROW]);
    mockProvider("aishub", [
      {
        name: "MSC OSCAR",
        lat: 35.5,
        lng: -150.25,
        timestamp: "2020-01-01T00:00:00.000Z",
        source: "aishub",
      },
    ]);

    const body = await (await GET(req())).json();
    expect(body.lanes[0].vessel.live).toBe(false);
    expect(body.meta.livePositions).toBe(0);
  });

  it("reports unmappable shipments instead of dropping them", async () => {
    mockRows([{ ...ROW, id: "ship-2", pol: "Atlantis" }]);
    const body = await (await GET(req())).json();
    expect(body.lanes).toHaveLength(0);
    expect(body.unresolved[0]).toMatchObject({ shipmentId: "ship-2", reason: "unknown_origin" });
    expect(body.meta.unresolvedCount).toBe(1);
  });

  it("filters to active statuses unless ?all=1 is passed", async () => {
    const chain = mockRows([ROW]);
    await GET(req());
    const activeWhere = boundParams(chain.where.mock.calls[0][0]);
    expect(activeWhere).toContain("in_transit");
    expect(activeWhere).toContain("delayed");
    expect(activeWhere).toContain("org-1");

    vi.clearAllMocks();
    mockProvider("none");
    const allChain = mockRows([ROW]);
    await GET(req("http://test/api/vessels/positions?all=1"));
    const allWhere = boundParams(allChain.where.mock.calls[0][0]);
    expect(allWhere).not.toContain("in_transit");
    // Org scoping survives ?all=1 — it is not a status filter.
    expect(allWhere).toContain("org-1");
  });

  it("clamps ?limit to the documented bounds", async () => {
    const chain = mockRows([ROW]);
    await GET(req("http://test/api/vessels/positions?limit=99999"));
    expect(chain.limit).toHaveBeenCalledWith(500);

    vi.clearAllMocks();
    mockProvider("none");
    const chain2 = mockRows([ROW]);
    await GET(req("http://test/api/vessels/positions?limit=notanumber"));
    expect(chain2.limit).toHaveBeenCalledWith(200);
  });

  it("500s with a generic message when the query throws", async () => {
    (db.select as any).mockImplementation(() => {
      throw new Error("db down");
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await GET(req());
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("Failed to load vessel positions");
  });
});
