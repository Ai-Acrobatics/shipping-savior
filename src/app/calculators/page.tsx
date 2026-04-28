import Link from "next/link";
import { Calculator, Shield, BarChart3, TrendingDown, Box, Globe, ArrowRight, Lock } from "lucide-react";

export const metadata = {
  title: "Calculators | Shipping Savior",
  description:
    "Six logistics calculators: landed cost, unit economics, FTZ savings, PF/NPF, container utilization, tariff scenarios. Sign in to save your work.",
};

const calculators = [
  {
    title: "Landed Cost",
    description: "True per-unit cost across freight, duty, drayage, customs, and storage. Compare lanes side by side.",
    icon: Calculator,
    color: "ocean",
    href: "/dashboard?calc=landed-cost",
  },
  {
    title: "Unit Economics",
    description: "Margin per shipment with COGS, freight allocation, FTZ cycle, and cash conversion.",
    icon: BarChart3,
    color: "emerald",
    href: "/dashboard?calc=unit-economics",
  },
  {
    title: "FTZ Savings Analyzer",
    description: "Compare FTZ vs non-FTZ scenarios. Lock duty rates at entry, model incremental withdrawals.",
    icon: Shield,
    color: "purple",
    href: "/dashboard?calc=ftz-savings",
  },
  {
    title: "PF / NPF Comparison",
    description: "Privileged vs non-privileged FTZ status. Hedge tariff exposure with rate-locking strategy.",
    icon: TrendingDown,
    color: "amber",
    href: "/dashboard?calc=pf-npf",
  },
  {
    title: "Container Utilization",
    description: "Volume + weight optimization. Pallet-level packing for 20ft / 40ft / 40ft HC / 45ft HC.",
    icon: Box,
    color: "blue",
    href: "/dashboard?calc=container",
  },
  {
    title: "Tariff Scenario",
    description: "Section 301 / 232 / antidumping calculations. Run multi-HTS scenarios for sourcing decisions.",
    icon: Globe,
    color: "rose",
    href: "/dashboard?calc=tariff",
  },
];

const colorMap: Record<string, string> = {
  ocean: "bg-ocean-50 text-ocean-600 group-hover:bg-ocean-100",
  emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
  purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
  amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
  blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
  rose: "bg-rose-50 text-rose-600 group-hover:bg-rose-100",
};

export default function CalculatorsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-ocean-50/30 to-white">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass-premium rounded-full px-5 py-2.5 mb-6 shadow-soft">
            <Calculator className="w-4 h-4 text-ocean-600" />
            <span className="text-sm font-medium text-navy-700">Six tools, one decision surface</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4 tracking-tight">
            Trade & Logistics Calculators
          </h1>
          <p className="text-lg text-navy-600 max-w-2xl mx-auto">
            Run scenarios in seconds instead of hours of spreadsheet work. Sign in to save calculations
            and reuse them across shipments.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            return (
              <Link
                key={calc.title}
                href={calc.href}
                className="group bg-white border border-navy-100 rounded-2xl p-6 shadow-soft hover:shadow-card hover:border-ocean-200 transition-all"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors ${colorMap[calc.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-ocean-700 transition-colors">
                  {calc.title}
                </h3>
                <p className="text-sm text-navy-600 leading-relaxed mb-4">{calc.description}</p>
                <div className="flex items-center gap-2 text-sm font-medium text-ocean-600 group-hover:gap-3 transition-all">
                  Open calculator
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 bg-navy-900 text-white rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-ocean-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-ocean-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">Save and share calculations</h3>
              <p className="text-sm text-navy-300">
                Free preview is unlimited. Sign in to save calculations, share links with your team, and pull
                them into shipment workflows.
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link
              href="/register"
              className="px-5 py-2.5 bg-ocean-500 hover:bg-ocean-400 rounded-lg text-sm font-semibold transition-colors"
            >
              Create free account
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 border border-white/20 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
