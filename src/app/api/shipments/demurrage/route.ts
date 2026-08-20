import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { shipments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  assessDemurrageRisk,
  readMilestones,
  readTariffOverride,
  type DemurrageRisk,
  type RiskLevel,
} from "@/lib/alerts/demurrage";

export const dynamic = "force-dynamic";

const RISK_ORDER: Record<RiskLevel, number> = {
  accruing: 0,
  critical: 1,
  warning: 2,
  safe: 3,
  clear: 4,
};

/**
 * GET /api/shipments/demurrage — the org's demurrage / detention exposure.
 *
 * Sorted worst-first so the caller can render a "what is costing me money
 * right now" board without re-sorting. `?atRisk=1` drops everything that is
 * neither accruing nor close to it.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { orgId } = session.user;

  const atRiskOnly = new URL(request.url).searchParams.get("atRisk") === "1";

  try {
    const rows = await db
      .select({
        id: shipments.id,
        reference: shipments.reference,
        containerNumber: shipments.containerNumber,
        carrier: shipments.carrier,
        containerCount: shipments.containerCount,
        pod: shipments.pod,
        eta: shipments.eta,
        status: shipments.status,
        importMeta: shipments.importMeta,
      })
      .from(shipments)
      .where(eq(shipments.orgId, orgId));

    const assessed = rows
      .map((r) => {
        const risk: DemurrageRisk = assessDemurrageRisk(
          readMilestones(r.importMeta, r.eta),
          {
            tariff: readTariffOverride(r.importMeta, r.carrier),
            containerCount: r.containerCount ?? 1,
          }
        );
        return {
          shipmentId: r.id,
          status: r.status,
          label: r.containerNumber ?? r.reference ?? r.id.slice(0, 8),
          carrier: r.carrier,
          pod: r.pod,
          clock: risk.clock,
          riskLevel: risk.riskLevel,
          daysRemaining: risk.daysRemaining,
          chargeableDays: risk.chargeableDays,
          accruedUsd: risk.accruedUsd,
          projectedUsd7d: risk.projectedUsd7d,
          perDiemUsd: risk.perDiemUsd,
          freeTimeExpiresAt: risk.freeTimeExpiresAt,
          estimated: risk.estimated,
          headline: risk.headline,
        };
      })
      // A `delivered` shipment can still be burning detention, so status is
      // not a filter here — only a closed-out or not-yet-arrived container is.
      .filter((a) => a.clock !== "clear" && a.clock !== "pending")
      .filter((a) =>
        atRiskOnly
          ? a.riskLevel === "accruing" ||
            a.riskLevel === "critical" ||
            a.riskLevel === "warning"
          : true
      )
      .sort(
        (a, b) =>
          RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel] ||
          b.accruedUsd - a.accruedUsd ||
          (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999)
      );

    return NextResponse.json({
      count: assessed.length,
      totalAccruedUsd: assessed.reduce((sum, a) => sum + a.accruedUsd, 0),
      totalProjected7dUsd: assessed.reduce((sum, a) => sum + a.projectedUsd7d, 0),
      accruingCount: assessed.filter((a) => a.riskLevel === "accruing").length,
      results: assessed,
    });
  } catch (error) {
    console.error("Failed to assess demurrage exposure:", error);
    return NextResponse.json(
      { error: "Failed to assess demurrage exposure" },
      { status: 500 }
    );
  }
}
