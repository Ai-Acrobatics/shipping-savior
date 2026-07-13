import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { count, desc, eq, and } from "drizzle-orm";
import {
  Calculator,
  DollarSign,
  Users,
  ArrowRight,
  BarChart3,
  Shield,
  Scale,
  Box,
  FileText,
  Ship,
  ScanLine,
  Clock,
} from "lucide-react";
import { db } from "@/lib/db";
import { calculations, orgMembers, shipments } from "@/lib/db/schema";
import { CALCULATOR_TYPE_LABELS } from "@/lib/types/calculations";
import type { CalculatorType } from "@/lib/types/calculations";
import TariffAlertCard from "@/components/platform/TariffAlertCard";
import OnboardingWizard from "@/components/platform/OnboardingWizard";
import HelpHint from "@/components/ui/HelpHint";
import ScenarioBanner from "@/components/demo/ScenarioBanner";
import CommandSearch from "@/components/platform/CommandSearch";
import StatCard from "@/components/ui/stat-card";
import EmptyState from "@/components/ui/empty-state";

const quickActions = [
  { label: "Landed Cost", href: "/platform/calculators/landed-cost", icon: DollarSign },
  { label: "Unit Economics", href: "/platform/calculators/unit-economics", icon: BarChart3 },
  { label: "FTZ Savings", href: "/platform/calculators/ftz-savings", icon: Shield },
  { label: "PF/NPF Compare", href: "/platform/calculators/pf-npf", icon: Scale },
  { label: "Container Util", href: "/platform/calculators/container", icon: Box },
  { label: "Tariff Scenario", href: "/platform/calculators/tariff-scenario", icon: FileText },
];

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userName = session.user.name?.split(" ")[0] ?? "there";
  const orgId = session.user.orgId;

  // Real org-scoped counts (AI-12732 — replaced the hardcoded mock zeros).
  const [calcCount, shipmentCount, activeShipments, memberCount, recentCalcs] =
    orgId
      ? await Promise.all([
          db.select({ n: count() }).from(calculations).where(eq(calculations.orgId, orgId)),
          db.select({ n: count() }).from(shipments).where(eq(shipments.orgId, orgId)),
          db
            .select({ n: count() })
            .from(shipments)
            .where(and(eq(shipments.orgId, orgId), eq(shipments.status, "in_transit"))),
          db.select({ n: count() }).from(orgMembers).where(eq(orgMembers.orgId, orgId)),
          db
            .select({
              id: calculations.id,
              name: calculations.name,
              calculatorType: calculations.calculatorType,
              createdAt: calculations.createdAt,
            })
            .from(calculations)
            .where(eq(calculations.orgId, orgId))
            .orderBy(desc(calculations.createdAt))
            .limit(5),
        ])
      : [[{ n: 0 }], [{ n: 0 }], [{ n: 0 }], [{ n: 0 }], []];

  const stats = [
    {
      label: "Saved Calculations",
      value: calcCount[0]?.n ?? 0,
      icon: Calculator,
      tone: "ocean" as const,
      footer: { label: "View history", href: "/platform/history" },
    },
    {
      label: "Shipments Tracked",
      value: shipmentCount[0]?.n ?? 0,
      icon: Ship,
      tone: "ocean" as const,
      footer: { label: "Open tracker", href: "/platform/shipments" },
    },
    {
      label: "In Transit",
      value: activeShipments[0]?.n ?? 0,
      icon: Clock,
      tone: "amber" as const,
      footer: { label: "Load board", href: "/platform/load-board" },
    },
    {
      label: "Team Members",
      value: memberCount[0]?.n ?? 0,
      icon: Users,
      tone: "default" as const,
      footer: { label: "Manage team", href: "/platform/settings/members" },
    },
  ];

  return (
    <div className="space-y-8">
      {/* First-run onboarding (gated by localStorage on the client) */}
      <OnboardingWizard initialName={userName} />

      {/* AI-6537 — investor demo banner; renders only when ?scenario=<id> is present */}
      <Suspense fallback={null}>
        <ScenarioBanner />
      </Suspense>

      {/* AI-8053 — "Tell us what you're looking to do" hero search.
          Blake's #1 ask: one plain-English bar that routes to the right tool.
          Designed grandmother-simple — type what you want, hit enter. */}
      <section className="rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-ocean-900 px-6 py-10 sm:px-10 sm:py-12 shadow-card">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Hi {userName} — what do you want to do today?
          </h1>
          <p className="text-ocean-200/90 mt-2 text-sm sm:text-base">
            Type it in plain English. We&apos;ll take you straight to the right tool.
          </p>
          <div className="mt-6">
            <CommandSearch />
          </div>
          <p className="text-ocean-300/70 text-xs mt-3">
            Try: “track my container”, “what does it cost to import”, “best route to Rotterdam”
          </p>
        </div>
      </section>

      <div className="flex items-center justify-end">
        <HelpHint
          articleSlug="importing-shipments-csv"
          label="Getting started? Read the import walkthrough."
        />
      </div>

      {/* Stat Cards — real counts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Quick Actions — scan-first (Blake: "just scan your bill of lading") */}
      <div>
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <Link
            href="/platform/shipments?scan=1"
            className="flex flex-col items-center gap-2 rounded-xl bg-ocean-600 p-4 text-white shadow-sm transition-all hover:bg-ocean-700 hover:shadow-card group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 transition-colors group-hover:bg-white/25">
              <ScanLine className="h-5 w-5" />
            </div>
            <span className="text-center text-xs font-semibold">Scan a BOL</span>
          </Link>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 bg-white border border-navy-200 rounded-xl hover:border-ocean-300 hover:shadow-card transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-ocean-50 flex items-center justify-center group-hover:bg-ocean-100 transition-colors">
                  <Icon className="w-5 h-5 text-ocean-600" />
                </div>
                <span className="text-xs font-medium text-navy-700 text-center">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tariff Alert (also a tour anchor when no scenario is loaded) */}
      <div data-tour-step="4">
        <TariffAlertCard />
      </div>

      {/* Recent Activity — real latest calculations */}
      <div>
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Recent Activity</h2>
        {recentCalcs.length === 0 ? (
          <div className="bg-white border border-navy-200 rounded-xl">
            <EmptyState
              title="No calculations yet"
              description="Run any calculator and save the result — your recent work will show up here."
              action={{ label: "Open Calculators", href: "/platform/calculators" }}
            />
          </div>
        ) : (
          <div className="bg-white border border-navy-200 rounded-xl divide-y divide-navy-100 overflow-hidden">
            {recentCalcs.map((c) => (
              <Link
                key={c.id}
                href="/platform/history"
                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-navy-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ocean-50">
                    <Calculator className="h-4 w-4 text-ocean-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-900">{c.name}</p>
                    <p className="text-xs text-navy-400">
                      {CALCULATOR_TYPE_LABELS[c.calculatorType as CalculatorType] ??
                        c.calculatorType}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs text-navy-400">
                  {relativeTime(c.createdAt)}
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
