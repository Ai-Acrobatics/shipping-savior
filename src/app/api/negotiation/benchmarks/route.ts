/**
 * GET /api/negotiation/benchmarks — AI-12020
 *
 * The FBX lane reference the negotiation agent scores against. Exposed so the
 * UI can show what lanes are covered, and so a shipper can sanity-check the
 * benchmark before they take a number into a carrier call.
 *
 * Optional `?containerType=40HC` re-expresses every lane in that container
 * type instead of the published FEU basis.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  FBX_LANES,
  FBX_SNAPSHOT_DATE,
  REGION_LABELS,
} from "@/lib/data/fbx-benchmarks";
import { buildPercentileCurve, CONTAINER_FEU_RATIO, computeTrend } from "@/lib/negotiation";
import type { NegotiableContainerType } from "@/lib/negotiation";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requested = request.nextUrl.searchParams.get("containerType");
  const containerType = (requested ?? "40GP") as NegotiableContainerType;
  const ratio = CONTAINER_FEU_RATIO[containerType];

  if (!ratio) {
    return NextResponse.json(
      {
        error: `Unsupported container type "${requested}". Supported: ${Object.keys(
          CONTAINER_FEU_RATIO
        ).join(", ")}.`,
      },
      { status: 400 }
    );
  }

  const scale = (n: number) => Math.round(n * ratio);

  const lanes = FBX_LANES.map((lane) => {
    const curve = buildPercentileCurve(lane);
    return {
      code: lane.code,
      label: lane.label,
      origin: REGION_LABELS[lane.originRegion],
      destination: REGION_LABELS[lane.destRegion],
      source: lane.source,
      derivedFrom: lane.derivedFrom ?? null,
      derivationNote: lane.derivationNote ?? null,
      asOf: lane.asOf,
      transitDays: lane.transitDays,
      percentiles: {
        p10: scale(curve.p10),
        p25: scale(curve.p25),
        p50: scale(curve.p50),
        p75: scale(curve.p75),
        p90: scale(curve.p90),
      },
      spot: {
        current: scale(lane.spot.current),
        avg4Week: scale(lane.spot.avg4Week),
        avg52Week: scale(lane.spot.avg52Week),
        low52Week: scale(lane.spot.low52Week),
        high52Week: scale(lane.spot.high52Week),
      },
      trend: computeTrend(lane),
    };
  });

  return NextResponse.json({
    containerType,
    feuRatio: ratio,
    snapshotDate: FBX_SNAPSHOT_DATE,
    disclaimer:
      "FBX is a spot index published per 40ft container. These are market references, not quotes, and they move weekly.",
    lanes,
  });
}
