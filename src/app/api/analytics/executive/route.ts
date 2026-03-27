import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculations, auditLogs, users, organizations, orgMembers } from '@/lib/db/schema';
import { sql, count, eq, gte, lte, and, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Build date filters
    const dateFilters = [];
    if (from) dateFilters.push(gte(calculations.createdAt, new Date(from)));
    if (to) dateFilters.push(lte(calculations.createdAt, new Date(to)));

    const auditDateFilters = [];
    if (from) auditDateFilters.push(gte(auditLogs.createdAt, new Date(from)));
    if (to) auditDateFilters.push(lte(auditLogs.createdAt, new Date(to)));

    // 1. Calculations by type
    const calcsByType = await db
      .select({
        type: calculations.calculatorType,
        count: count(),
      })
      .from(calculations)
      .where(dateFilters.length > 0 ? and(...dateFilters) : undefined)
      .groupBy(calculations.calculatorType);

    // 2. Recent audit logs with user info
    const recentActivity = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        metadata: auditLogs.metadata,
        ipAddress: auditLogs.ipAddress,
        createdAt: auditLogs.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(auditDateFilters.length > 0 ? and(...auditDateFilters) : undefined)
      .orderBy(desc(auditLogs.createdAt))
      .limit(50);

    // 3. Cost savings from calculation outputs (extract from JSONB)
    const allCalcs = await db
      .select({
        calculatorType: calculations.calculatorType,
        inputs: calculations.inputs,
        outputs: calculations.outputs,
        createdAt: calculations.createdAt,
      })
      .from(calculations)
      .where(dateFilters.length > 0 ? and(...dateFilters) : undefined)
      .orderBy(desc(calculations.createdAt));

    // Extract savings from outputs
    let totalSavings = 0;
    let ftzSavings = 0;
    let tariffSavings = 0;
    let containerOptSavings = 0;
    const savingsByMonth: Record<string, number> = {};

    for (const calc of allCalcs) {
      const outputs = calc.outputs as Record<string, unknown>;
      const monthKey = calc.createdAt
        ? new Date(calc.createdAt).toISOString().slice(0, 7)
        : 'unknown';

      let saving = 0;

      if (calc.calculatorType === 'ftz_savings') {
        saving = (outputs?.totalSavings as number) || (outputs?.annualSavings as number) || (outputs?.savings as number) || 0;
        ftzSavings += saving;
      } else if (calc.calculatorType === 'tariff_scenario') {
        saving = (outputs?.potentialSavings as number) || (outputs?.savings as number) || 0;
        tariffSavings += saving;
      } else if (calc.calculatorType === 'container_utilization') {
        saving = (outputs?.costSaved as number) || (outputs?.savings as number) || 0;
        containerOptSavings += saving;
      } else if (calc.calculatorType === 'landed_cost') {
        saving = (outputs?.savings as number) || 0;
      }

      totalSavings += saving;
      savingsByMonth[monthKey] = (savingsByMonth[monthKey] || 0) + saving;
    }

    // 4. Organization usage stats
    const orgStats = await db
      .select({
        orgId: organizations.id,
        orgName: organizations.name,
        plan: organizations.plan,
        memberCount: sql<number>`(SELECT COUNT(*) FROM org_members WHERE org_id = ${organizations.id})`,
        calcCount: sql<number>`(SELECT COUNT(*) FROM calculations WHERE org_id = ${organizations.id})`,
      })
      .from(organizations);

    // 5. Top HTS codes from calculation inputs
    const htsCalcs = await db
      .select({
        inputs: calculations.inputs,
        calculatorType: calculations.calculatorType,
      })
      .from(calculations)
      .where(dateFilters.length > 0 ? and(...dateFilters) : undefined);

    const htsCounts: Record<string, { code: string; description: string; count: number }> = {};
    for (const calc of htsCalcs) {
      const inputs = calc.inputs as Record<string, unknown>;
      const htsCode = (inputs?.htsCode as string) || (inputs?.hsCode as string) || (inputs?.tariffCode as string);
      if (htsCode) {
        if (!htsCounts[htsCode]) {
          htsCounts[htsCode] = {
            code: htsCode,
            description: (inputs?.productDescription as string) || (inputs?.description as string) || '',
            count: 0,
          };
        }
        htsCounts[htsCode].count++;
      }
    }
    const topHtsCodes = Object.values(htsCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 6. Route comparison trends
    const routeCounts: Record<string, { origin: string; destination: string; count: number; avgCost: number; totalCost: number }> = {};
    for (const calc of allCalcs) {
      const inputs = calc.inputs as Record<string, unknown>;
      const outputs = calc.outputs as Record<string, unknown>;
      const origin = (inputs?.originPort as string) || (inputs?.origin as string) || '';
      const dest = (inputs?.destinationPort as string) || (inputs?.destination as string) || '';
      if (origin && dest) {
        const routeKey = `${origin}→${dest}`;
        if (!routeCounts[routeKey]) {
          routeCounts[routeKey] = { origin, destination: dest, count: 0, avgCost: 0, totalCost: 0 };
        }
        routeCounts[routeKey].count++;
        const cost = (outputs?.totalLandedCost as number) || (outputs?.totalCost as number) || 0;
        routeCounts[routeKey].totalCost += cost;
      }
    }
    const routeTrends = Object.values(routeCounts)
      .map((r) => ({ ...r, avgCost: r.count > 0 ? Math.round(r.totalCost / r.count) : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 7. Summary stats
    const totalCalcs = allCalcs.length;
    const totalUsers = await db.select({ count: count() }).from(users);
    const totalOrgs = await db.select({ count: count() }).from(organizations);

    // Calculations trend by month
    const calcsByMonth: Record<string, Record<string, number>> = {};
    for (const calc of allCalcs) {
      const monthKey = calc.createdAt
        ? new Date(calc.createdAt).toISOString().slice(0, 7)
        : 'unknown';
      if (!calcsByMonth[monthKey]) calcsByMonth[monthKey] = {};
      calcsByMonth[monthKey][calc.calculatorType] = (calcsByMonth[monthKey][calc.calculatorType] || 0) + 1;
    }

    const calcsTrend = Object.entries(calcsByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, types]) => ({
        month,
        ...types,
        total: Object.values(types).reduce((s, v) => s + v, 0),
      }));

    return NextResponse.json({
      summary: {
        totalCalculations: totalCalcs,
        totalUsers: totalUsers[0]?.count || 0,
        totalOrganizations: totalOrgs[0]?.count || 0,
        totalSavings,
      },
      calculationsByType: calcsByType.map((c) => ({
        type: c.type,
        label: formatCalcType(c.type),
        count: Number(c.count),
      })),
      calculationsTrend: calcsTrend,
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        actionLabel: formatAuditAction(a.action),
        metadata: a.metadata,
        ipAddress: a.ipAddress,
        createdAt: a.createdAt,
        userName: a.userName || 'System',
        userEmail: a.userEmail,
      })),
      savings: {
        total: totalSavings,
        ftz: ftzSavings,
        tariff: tariffSavings,
        containerOptimization: containerOptSavings,
        byMonth: Object.entries(savingsByMonth)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, amount]) => ({ month, amount })),
      },
      organizationStats: orgStats.map((o) => ({
        id: o.orgId,
        name: o.orgName,
        plan: o.plan,
        memberCount: Number(o.memberCount),
        calcCount: Number(o.calcCount),
      })),
      topHtsCodes,
      routeTrends,
    });
  } catch (error) {
    console.error('Executive analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

function formatCalcType(type: string): string {
  const labels: Record<string, string> = {
    landed_cost: 'Landed Cost',
    unit_economics: 'Unit Economics',
    ftz_savings: 'FTZ Savings',
    pf_npf_comparison: 'PF/NPF Comparison',
    container_utilization: 'Container Utilization',
    tariff_scenario: 'Tariff Scenario',
  };
  return labels[type] || type;
}

function formatAuditAction(action: string): string {
  const labels: Record<string, string> = {
    login: 'Logged in',
    register: 'Registered',
    logout: 'Logged out',
    failed_login: 'Failed login',
    invite_sent: 'Sent invite',
    invite_accepted: 'Accepted invite',
    calculation_saved: 'Saved calculation',
    calculation_deleted: 'Deleted calculation',
  };
  return labels[action] || action;
}
