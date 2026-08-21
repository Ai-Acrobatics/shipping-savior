import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { and, desc, eq, inArray, type SQL } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { shipments } from "@/lib/db/schema";
import { dropStalePositions, getAisProvider } from "@/lib/ais/provider";
import { buildPortIndex, resolvePort, type PortIndex, type PortRecord } from "@/lib/vessel-map/ports";
import { buildLanes, mergeAisPositions, vesselQueries, type LaneShipment } from "@/lib/vessel-map/lanes";

// Live AIS positions must never be served from the CDN cache.
export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;
/** Statuses that put a vessel on the water — everything else is noise on a map. */
const ACTIVE_STATUSES = ["in_transit", "delayed"] as const;

let portIndex: PortIndex | null = null;

function getPortIndex(): PortIndex {
  if (!portIndex) {
    const portsPath = path.join(process.cwd(), "data", "ports.json");
    const ports: PortRecord[] = fs.existsSync(portsPath)
      ? JSON.parse(fs.readFileSync(portsPath, "utf-8"))
      : [];
    portIndex = buildPortIndex(ports);
  }
  return portIndex;
}

/**
 * GET /api/vessels/positions — org-scoped lanes + vessel positions (AI-12012).
 *
 * Query params:
 *   ?all=1     include arrived/pending shipments (default: in_transit + delayed)
 *   ?limit=N   cap the number of shipments considered (default 200, max 500)
 *
 * Response is map-ready: great-circle arcs in GeoJSON [lng, lat] order plus one
 * vessel marker per lane. Markers are live AIS fixes when a provider is
 * configured and matched, otherwise schedule estimates flagged `live: false`.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { orgId } = session.user;

  const { searchParams } = new URL(request.url);
  const includeAll = searchParams.get("all") === "1";
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") ?? `${DEFAULT_LIMIT}`, 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );

  try {
    const conditions: SQL[] = [eq(shipments.orgId, orgId)];
    if (!includeAll) {
      conditions.push(inArray(shipments.status, [...ACTIVE_STATUSES]));
    }

    const rows = await db
      .select({
        id: shipments.id,
        reference: shipments.reference,
        containerNumber: shipments.containerNumber,
        vesselName: shipments.vesselName,
        voyageNumber: shipments.voyageNumber,
        carrier: shipments.carrier,
        pol: shipments.pol,
        pod: shipments.pod,
        originPort: shipments.originPort,
        destPort: shipments.destPort,
        etd: shipments.etd,
        eta: shipments.eta,
        status: shipments.status,
        progress: shipments.progress,
      })
      .from(shipments)
      .where(and(...conditions))
      .orderBy(desc(shipments.eta))
      .limit(limit);

    const index = getPortIndex();
    const { lanes, unresolved } = buildLanes(
      rows as LaneShipment[],
      (raw) => resolvePort(index, raw)
    );

    const provider = getAisProvider();
    let positions = await provider.fetchPositions(vesselQueries(lanes));
    positions = dropStalePositions(positions);
    const merged = mergeAisPositions(lanes, positions);
    const liveCount = merged.filter((lane) => lane.vessel.live).length;

    return NextResponse.json({
      lanes: merged,
      unresolved,
      meta: {
        generatedAt: new Date().toISOString(),
        shipmentsConsidered: rows.length,
        laneCount: merged.length,
        unresolvedCount: unresolved.length,
        aisProvider: provider.id,
        livePositions: liveCount,
        estimatedPositions: merged.length - liveCount,
      },
    });
  } catch (error) {
    console.error("[vessels/positions] failed:", error);
    return NextResponse.json({ error: "Failed to load vessel positions" }, { status: 500 });
  }
}
