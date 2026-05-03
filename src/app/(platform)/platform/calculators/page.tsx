import Link from "next/link";
import {
  DollarSign,
  BarChart3,
  Shield,
  Scale,
  Box,
  FileText,
  ArrowRight,
} from "lucide-react";
import HelpHint from "@/components/ui/HelpHint";

const calculators = [
  {
    title: "Landed Cost Calculator",
    description: "Calculate total landed cost including duties, freight, insurance, and handling fees.",
    icon: DollarSign,
    href: "/platform/calculators/landed-cost",
    color: "ocean",
  },
  {
    title: "Unit Economics Calculator",
    description: "Analyze per-unit profitability across different shipping methods and routes.",
    icon: BarChart3,
    href: "/platform/calculators/unit-economics",
    color: "indigo",
  },
  {
    title: "FTZ Savings Analyzer",
    description: "Compare Foreign Trade Zone vs direct import costs and identify savings opportunities.",
    icon: Shield,
    href: "/platform/calculators/ftz-savings",
    color: "cargo",
  },
  {
    title: "PF/NPF Comparison",
    description: "Privileged vs Non-Privileged Foreign status analysis for duty optimization.",
    icon: Scale,
    href: "/platform/calculators/pf-npf",
    color: "ocean",
  },
  {
    title: "Container Utilization",
    description: "Optimize container loading patterns and maximize space utilization efficiency.",
    icon: Box,
    href: "/platform/calculators/container",
    color: "indigo",
  },
  {
    title: "Tariff Scenario Builder",
    description: "Model tariff changes and their cost impact across your supply chain.",
    icon: FileText,
    href: "/platform/calculators/tariff-scenario",
    color: "cargo",
  },
];

const iconBg: Record<string, string> = {
  ocean: "from-ocean-500 to-ocean-700",
  indigo: "from-indigo-500 to-indigo-700",
  cargo: "from-cargo-500 to-cargo-700",
};

export default function CalculatorsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Calculators</h1>
          <p className="text-navy-500 mt-1">
            Powerful trade and logistics calculators to optimize your supply chain costs.
          </p>
        </div>
        <HelpHint
          articleSlug="what-is-an-ftz"
          label="New to FTZs? Read what they are and when they pay off."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {calculators.map((calc) => {
          const Icon = calc.icon;
          return (
            <Link
              key={calc.href}
              href={calc.href}
              data-tour-step={calc.href === "/platform/calculators/ftz-savings" ? "5" : undefined}
              className="group bg-white border border-navy-200 rounded-xl p-6 hover:border-ocean-300 hover:shadow-card-hover transition-all"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                  iconBg[calc.color]
                } flex items-center justify-center mb-4`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">
                {calc.title}
              </h3>
              <p className="text-sm text-navy-500 leading-relaxed mb-4">
                {calc.description}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-ocean-600 group-hover:text-ocean-700 transition-colors">
                Open Calculator
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
