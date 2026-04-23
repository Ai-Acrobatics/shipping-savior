import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contracts, contractLanes, shipments } from "@/lib/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import carrierRoutes from "@/../data/carrier-routes.json";

interface CarrierRoute {
  origin: string;
  destination: string;
  estimated_cost_40ft: number;
}

interface ShipmentAnalysis {
  shipmentId: string;
  containerNumber: string | null;
  route: string;
  carrier: string | null;
  hasContract: boolean;
  contractRate: number | null;
  tariffRate: number;
  savings: number;
  status: "contract" | "tariff" | "unknown";
}

function normalizePort(raw: string | null): string | null {
  if (!raw) return null;
  return raw.slice(0, 10).toUpperCase().replace(/\s+/g, "");
}

function tariffRateFor(origin: string, destination: string): number {
  const matches = (carrierRoutes as CarrierRoute[]).filter(
    (r) => r.origin === origin && r.destination === destination,
  );
  if (matches.length === 0) return 5000;
  return Math.round(
    matches.reduce((sum, r) => sum + r.estimated_cost_40ft, 0) / matches.length,
  );
}

// GET /api/contracts/savings-summary
// Returns month-to-date savings analysis across active shipments, using
// real contract-vs-tariff deltas (not a blanket % estimate).
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orgId } = session.user;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    // Pull recent shipments scoped to this org (up to 50 for aggregation).
    const recentShipments = await db
      .select({
        id: shipments.id,
        containerNumber: shipments.containerNumber,
        pol: shipments.pol,
        pod: shipments.pod,
        carrier: shipments.carrier,
        createdAt: shipments.createdAt,
      })
      .from(shipments)
      .where(eq(shipments.orgId, orgId))
      .orderBy(desc(shipments.createdAt))
      .limit(50);

    // Pull all active contract lanes for this org in one query.
    const activeLanes = await db
      .select({
        originPort: contractLanes.originPort,
        destPort: contractLanes.destPort,
        rate40ft: contractLanes.rate40ft,
        carrier: contracts.carrier,
        contractId: contracts.id,
      })
      .from(contractLanes)
      .innerJoin(contracts, eq(contractLanes.contractId, contracts.id))
      .where(and(eq(contracts.orgId, orgId), gte(contracts.endDate, now)));

    // Build a lookup map: "ORIGIN|DEST" → best contract rate.
    const laneMap = new Map<
      string,
      { rate: number; carrier: string }
    >();
    for (const lane of activeLanes) {
      if (lane.rate40ft == null) continue;
      const key = `${lane.originPort}|${lane.destPort}`;
      const existing = laneMap.get(key);
      if (!existing || lane.rate40ft < existing.rate) {
        laneMap.set(key, { rate: lane.rate40ft, carrier: lane.carrier });
      }
    }

    // Analyze each shipment.
    const analyses: ShipmentAnalysis[] = [];
    for (const shipment of recentShipments) {
      const origin = normalizePort(shipment.pol);
      const destination = normalizePort(shipment.pod);
      if (!origin || !destination) continue;

      const routeKey = `${origin}|${destination}`;
      const tariffRate = tariffRateFor(origin, destination);
      const contractMatch = laneMap.get(routeKey);

      if (contractMatch) {
        const savings = Math.max(0, tariffRate - contractMatch.rate);
        analyses.push({
          shipmentId: shipment.id,
          containerNumber: shipment.containerNumber,
          route: `${origin} → ${destination}`,
          carrier: contractMatch.carrier,
          hasContract: true,
          contractRate: contractMatch.rate,
          tariffRate,
          savings,
          status: "contract",
        });
      } else {
        // No contract — best matching carrier route gives a floor/ceiling.
        const routesForLane = (carrierRoutes as CarrierRoute[]).filter(
          (r) => r.origin === origin && r.destination === destination,
        );
        const minRate =
          routesForLane.length > 0
            ? Math.min(...routesForLane.map((r) => r.estimated_cost_40ft))
            : tariffRate;
        // Potential savings = average (tariff) minus best-available rate.
        const potentialSavings = Math.max(0, tariffRate - minRate);
        analyses.push({
          shipmentId: shipment.id,
          containerNumber: shipment.containerNumber,
          route: `${origin} → ${destination}`,
          carrier: shipment.carrier,
          hasContract: false,
          contractRate: null,
          tariffRate,
          savings: potentialSavings,
          status: "tariff",
        });
      }
    }

    // Monthly figures use shipments created this month.
    const monthlyAnalyses = analyses.filter((a) => {
      const match = recentShipments.find((s) => s.id === a.shipmentId);
      return match && match.createdAt >= monthStart;
    });

    const monthlySavingsRealized = monthlyAnalyses
      .filter((a) => a.status === "contract")
      .reduce((sum, a) => sum + a.savings, 0);

    const monthlySavingsPotential = monthlyAnalyses
      .filter((a) => a.status === "tariff")
      .reduce((sum, a) => sum + a.savings, 0);

    const tariffBookings = analyses.filter((a) => a.status === "tariff").length;
    const contractBookings = analyses.filter(
      (a) => a.status === "contract",
    ).length;

    return NextResponse.json({
      monthlySavingsRealized,
      monthlySavingsPotential,
      totalSavingsIdentified:
        monthlySavingsRealized + monthlySavingsPotential,
      tariffBookings,
      contractBookings,
      totalAnalyzed: analyses.length,
      activeLaneCount: activeLanes.length,
      analyses,
    });
  } catch (error) {
    console.error("savings-summary failed:", error);
    return NextResponse.json(
      {
        monthlySavingsRealized: 0,
        monthlySavingsPotential: 0,
        totalSavingsIdentified: 0,
        tariffBookings: 0,
        contractBookings: 0,
        totalAnalyzed: 0,
        activeLaneCount: 0,
        analyses: [],
        error: "Failed to compute savings summary",
      },
      { status: 200 },
    );
  }
}
