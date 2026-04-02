import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contracts, contractLanes } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import carrierRoutes from "@/../data/carrier-routes.json";

interface CarrierRoute {
  origin: string;
  destination: string;
  estimated_cost_20ft: number;
  estimated_cost_40ft: number;
  estimated_cost_40hc: number;
}

// GET /api/contracts/check-tariff — check if user has a contract for a route
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orgId } = session.user;
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");

  if (!origin || !destination) {
    return NextResponse.json({ error: "origin and destination parameters are required" }, { status: 400 });
  }

  // Get tariff rate from carrier routes data (average across carriers)
  const matchingRoutes = (carrierRoutes as CarrierRoute[]).filter(
    (r) => r.origin === origin && r.destination === destination
  );

  // Average tariff rate for 40ft (most common container)
  const tariffRate = matchingRoutes.length > 0
    ? Math.round(matchingRoutes.reduce((sum, r) => sum + r.estimated_cost_40ft, 0) / matchingRoutes.length)
    : 5000; // Default tariff estimate if no route data

  try {
    // Check for active contract lanes matching this route
    const now = new Date();
    const matchingLanes = await db
      .select({
        rate40ft: contractLanes.rate40ft,
        contractId: contractLanes.contractId,
        carrier: contracts.carrier,
      })
      .from(contractLanes)
      .innerJoin(contracts, eq(contractLanes.contractId, contracts.id))
      .where(
        and(
          eq(contracts.orgId, orgId),
          eq(contractLanes.originPort, origin),
          eq(contractLanes.destPort, destination),
          gte(contracts.endDate, now)
        )
      );

    if (matchingLanes.length > 0) {
      // Find the best (lowest) contracted rate
      const bestLane = matchingLanes.reduce((best, lane) =>
        (lane.rate40ft ?? Infinity) < (best.rate40ft ?? Infinity) ? lane : best
      );
      const contractedRate = bestLane.rate40ft ?? tariffRate;
      const savings = tariffRate - contractedRate;

      return NextResponse.json({
        hasContract: true,
        contractedRate,
        tariffRate,
        savings: savings > 0 ? savings : 0,
        carrier: bestLane.carrier,
      });
    }

    return NextResponse.json({
      hasContract: false,
      tariffRate,
      contractedRate: null,
      savings: null,
    });
  } catch (error) {
    console.error("Failed to check tariff:", error);
    // Gracefully handle DB errors — still return tariff info
    return NextResponse.json({
      hasContract: false,
      tariffRate,
      contractedRate: null,
      savings: null,
      error: "Could not check contracts",
    });
  }
}
