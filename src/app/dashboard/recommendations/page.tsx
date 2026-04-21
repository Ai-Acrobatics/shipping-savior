"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Shield,
  Ship,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Zap,
  BarChart3,
  Package,
  Globe,
  Star,
  Bot,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Recommendation {
  id: string;
  type: "cost-saving" | "compliance" | "efficiency" | "intelligence";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  effort: "low" | "medium" | "high";
  action: string;
  href: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  agentName?: string;
  savings?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const recommendations: Recommendation[] = [
  {
    id: "rec-001",
    type: "cost-saving",
    priority: "high",
    title: "FTZ Entry Could Save $18,400 on SS-2024-0041",
    description: "COSCO shipment HAN-LAX-0041 is approaching LA port. Routing through FTZ Zone 202 (Vernon, CA) could lock current 7.5% duty rate vs. projected 9.2% rate next quarter under pending tariff action.",
    impact: "Save $18,400 in duties on this shipment alone",
    effort: "low",
    action: "Run FTZ Analysis",
    href: "/ftz-analyzer",
    icon: Shield,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    agentName: "FTZ Strategy Agent",
    savings: "$18,400",
  },
  {
    id: "rec-002",
    type: "efficiency",
    priority: "high",
    title: "Consolidate Bangkok + Jakarta Shipments",
    description: "BKK-LGB-0039 (Bangkok) and CGK-LAX-0037 (Jakarta) are both heading to Southern California with overlapping windows. Consolidating into a single transshipment at Singapore could reduce per-TEU cost by $220.",
    impact: "~$1,100 savings across 5 containers",
    effort: "medium",
    action: "Compare Routes",
    href: "/",
    icon: Ship,
    color: "text-ocean-700",
    bgColor: "bg-ocean-50",
    agentName: "Route Optimization Agent",
    savings: "$1,100",
  },
  {
    id: "rec-003",
    type: "compliance",
    priority: "high",
    title: "ISF Amendment Deadline — Act in 4 Hours",
    description: "Shipment BKK-LGB-0039 has a CBP document request for an ISF amendment. CBP has a 4-hour window before potential examination order, which adds $300-3,000 in exam fees.",
    impact: "Avoid $300-3,000 exam fees",
    effort: "low",
    action: "View Shipment",
    href: "/dashboard",
    icon: AlertTriangle,
    color: "text-red-700",
    bgColor: "bg-red-50",
    agentName: "Compliance Monitor Agent",
    savings: "$3,000 avoided",
  },
  {
    id: "rec-004",
    type: "cost-saving",
    priority: "medium",
    title: "Backhaul Pricing Opportunity — Seattle to Anchorage",
    description: "TOTE Maritime offers return-leg pricing on the SEA-ANC lane that is 22% below posted rates. Your cold chain volume qualifies for the Lineage Logistics preferred-carrier discount on this route.",
    impact: "Save $190/container on each Anchorage run",
    effort: "low",
    action: "View Route",
    href: "/",
    icon: TrendingUp,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    agentName: "Route Optimization Agent",
    savings: "$190/container",
  },
  {
    id: "rec-005",
    type: "intelligence",
    priority: "medium",
    title: "SE Asia Tariff Window — Vietnam & Cambodia Best Entry Now",
    description: "USTR proposed rule 202X-0041 would increase MFN duty rates on Vietnamese consumer electronics and textile goods by 2.3% effective Q3 2026. Advance ordering and FTZ entry before June 1 locks current rate.",
    impact: "Rate lock before projected 2.3% increase",
    effort: "medium",
    action: "Model Tariff Scenarios",
    href: "/ftz-analyzer",
    icon: Globe,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    agentName: "Tariff Intelligence Agent",
    savings: "Rate lock before +2.3%",
  },
  {
    id: "rec-006",
    type: "efficiency",
    priority: "medium",
    title: "Container Utilization at 78% — Optimize Load Plan",
    description: "Your current average container utilization across active shipments is 78%. Adjusting pallet stacking for SS-2024-0040 (SEA-ANC) could improve to 88%, saving approximately $140 in chassis fees per run.",
    impact: "Improve utilization to 88%, save ~$140/shipment",
    effort: "low",
    action: "Run Container Calc",
    href: "/",
    icon: Package,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    agentName: "Cost Analysis Agent",
    savings: "$140/shipment",
  },
  {
    id: "rec-007",
    type: "intelligence",
    priority: "low",
    title: "Oakland Port Congestion Forecast — Plan Dwell Time",
    description: "Port of Oakland is forecasting above-average vessel volume in weeks 17-19 (late April). SS-2024-0036 arrival timing overlaps with this window. Recommend pre-arranging chassis and 48h drayage notice to avoid demurrage.",
    impact: "Avoid $150-400/day demurrage exposure",
    effort: "low",
    action: "View Port Data",
    href: "/",
    icon: BarChart3,
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    agentName: "Tariff Intelligence Agent",
    savings: "$400/day avoided",
  },
];

const priorityColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-navy-100 text-navy-600 border-navy-200",
};

const typeLabels = {
  "cost-saving": { label: "Cost Saving", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  compliance: { label: "Compliance", color: "bg-red-100 text-red-700 border-red-200" },
  efficiency: { label: "Efficiency", color: "bg-ocean-100 text-ocean-700 border-ocean-200" },
  intelligence: { label: "Intelligence", color: "bg-purple-100 text-purple-700 border-purple-200" },
};

const effortLabels = {
  low: { label: "Quick win", icon: Zap, color: "text-emerald-600" },
  medium: { label: "Moderate effort", icon: Clock, color: "text-amber-600" },
  high: { label: "High effort", icon: BarChart3, color: "text-navy-500" },
};

// ─── Savings Summary ───────────────────────────────────────────────────────────

function SavingsSummary() {
  const highCount = recommendations.filter(r => r.priority === "high").length;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[
        { label: "Total Recommendations", value: String(recommendations.length), icon: Bot, color: "text-ocean-600", bg: "bg-ocean-50" },
        { label: "High Priority", value: String(highCount), icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
        { label: "Potential Monthly Savings", value: "$22,000+", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Quick Wins Available", value: String(recommendations.filter(r => r.effort === "low").length), icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
      ].map((stat) => (
        <div key={stat.label} className="bg-white border border-navy-100 rounded-2xl p-5 shadow-soft">
          <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
            <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
          </div>
          <div className="text-xl font-bold text-navy-900">{stat.value}</div>
          <div className="text-xs text-navy-500 mt-0.5">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function RecommendationsPage() {
  const highPriority = recommendations.filter(r => r.priority === "high");
  const rest = recommendations.filter(r => r.priority !== "high");

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-navy-400 hover:text-ocean-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-navy-900">Personalized Recommendations</h1>
            <p className="text-sm text-navy-500 mt-1">AI-powered insights from 5 autonomous agents monitoring your operations.</p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-2 text-xs text-indigo-700 font-semibold">
            <Bot className="w-3.5 h-3.5" />
            5 AI Agents Active
          </div>
        </div>
      </div>

      {/* DEMO badge */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-700">
        <Star className="w-4 h-4 flex-shrink-0" />
        <span><strong>DEMO</strong> — These recommendations are AI-generated from your shipment data. Live agent monitoring connects to real carrier APIs and tariff feeds in Phase 3.</span>
      </div>

      <SavingsSummary />

      {/* High Priority */}
      {highPriority.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wide mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            High Priority — Action Required
          </h2>
          <div className="space-y-4">
            {highPriority.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Other Recommendations */}
      <div>
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wide mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-ocean-500" />
          Opportunities
        </h2>
        <div className="space-y-4">
          {rest.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const type = typeLabels[rec.type];
  const effort = effortLabels[rec.effort];

  return (
    <div className={`bg-white border rounded-2xl p-6 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 ${
      rec.priority === "high" ? "border-red-200" : "border-navy-100"
    }`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-11 h-11 rounded-xl ${rec.bgColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <rec.icon className={`w-5 h-5 ${rec.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${type.color}`}>
              {type.label}
            </span>
            <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${priorityColors[rec.priority]}`}>
              {rec.priority} priority
            </span>
            {rec.agentName && (
              <span className="text-[10px] text-navy-400 flex items-center gap-1">
                <Bot className="w-3 h-3" />
                {rec.agentName}
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold text-navy-900 mb-1.5">{rec.title}</h3>
          <p className="text-xs text-navy-500 leading-relaxed mb-3">{rec.description}</p>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-semibold text-emerald-700">{rec.impact}</span>
            </div>
            <div className={`flex items-center gap-1 text-xs ${effort.color}`}>
              <effort.icon className="w-3 h-3" />
              {effort.label}
            </div>
            {rec.savings && (
              <div className="flex items-center gap-1 text-xs font-bold text-navy-900 bg-navy-50 border border-navy-200 px-2 py-0.5 rounded-full">
                <DollarSign className="w-3 h-3 text-emerald-500" />
                {rec.savings}
              </div>
            )}
          </div>

          <Link
            href={rec.href}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ocean-700 bg-ocean-50 border border-ocean-200 px-4 py-2 rounded-lg hover:bg-ocean-100 transition-colors"
          >
            {rec.action}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
