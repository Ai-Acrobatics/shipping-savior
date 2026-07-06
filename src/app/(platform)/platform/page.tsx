import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import {
  Calculator,
  DollarSign,
  MapPin,
  Users,
  ArrowRight,
  BarChart3,
  Shield,
  Scale,
  Box,
  FileText,
} from "lucide-react";
import TariffAlertCard from "@/components/platform/TariffAlertCard";
import OnboardingWizard from "@/components/platform/OnboardingWizard";
import HelpHint from "@/components/ui/HelpHint";
import ScenarioBanner from "@/components/demo/ScenarioBanner";
import CommandSearch from "@/components/platform/CommandSearch";

// AI-8729: KPI cards now carry a trend delta vs. last month.
// Mock values flagged with mock=true so the data layer can swap them in.
const stats = [
  { label: "Total Calculations", value: "0", icon: Calculator, color: "ocean", delta: "+0%", deltaPositive: true, mock: true },
  { label: "Savings Identified", value: "$0", icon: DollarSign, color: "cargo", delta: "+0%", deltaPositive: true, mock: true },
  { label: "Active Routes", value: "0", icon: MapPin, color: "indigo", delta: "+0%", deltaPositive: true, mock: true },
  { label: "Team Members", value: "1", icon: Users, color: "ocean", delta: "+1 this mo.", deltaPositive: true, mock: true },
];

const quickActions = [
  { label: "Landed Cost", href: "/platform/calculators/landed-cost", icon: DollarSign },
  { label: "Unit Economics", href: "/platform/calculators/unit-economics", icon: BarChart3 },
  { label: "FTZ Savings", href: "/platform/calculators/ftz-savings", icon: Shield },
  { label: "PF/NPF Compare", href: "/platform/calculators/pf-npf", icon: Scale },
  { label: "Container Util", href: "/platform/calculators/container", icon: Box },
  { label: "Tariff Scenario", href: "/platform/calculators/tariff-scenario", icon: FileText },
];

const iconColors: Record<string, string> = {
  ocean: "from-ocean-500 to-ocean-700",
  cargo: "from-cargo-500 to-cargo-700",
  indigo: "from-indigo-500 to-indigo-700",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userName = session.user.name?.split(" ")[0] ?? "there";

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
      <section className="rounded-3xl bg-gradient-to-br from-navy-900 via-navy-900 to-ocean-900 px-6 py-10 sm:px-10 sm:py-12 shadow-card">
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-navy-200 rounded-xl p-5 shadow-soft hover:shadow-card transition-shadow"
              data-trend-mock={stat.mock ? "true" : undefined}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-navy-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-navy-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                    iconColors[stat.color]
                  } flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p
                className={`mt-2 text-xs font-medium ${
                  stat.deltaPositive ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {stat.delta} vs last month
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-navy-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-navy-900 mb-4">
          Recent Activity
        </h2>
        <div className="bg-white border border-navy-200 rounded-xl p-8 text-center">
          <Calculator className="w-12 h-12 text-navy-300 mx-auto mb-3" />
          <p className="text-navy-500 font-medium">No calculations yet</p>
          <p className="text-navy-400 text-sm mt-1">
            Try a calculator to get started.
          </p>
          <Link
            href="/platform/calculators"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-ocean-600 to-indigo-500 text-white text-sm font-medium rounded-lg hover:from-ocean-700 hover:to-indigo-600 transition-all"
          >
            Open Calculators
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
