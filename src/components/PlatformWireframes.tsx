"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Calculator,
  Map,
  Shield,
  FileText,
  BarChart3,
  TrendingUp,
  Ship,
  Package,
  Clock,
  DollarSign,
  Globe,
  Anchor,
  Truck,
  Search,
  Bell,
  ChevronRight,
  Filter,
  ArrowRight,
} from "lucide-react";

interface WireframeScreen {
  id: string;
  title: string;
  description: string;
  icon: typeof LayoutDashboard;
  color: string;
}

const screens: WireframeScreen[] = [
  {
    id: "dashboard",
    title: "Operations Dashboard",
    description:
      "Real-time shipment tracking, KPI cards, cost/margin analysis, cargo mix breakdown, and partner status — all on one screen.",
    icon: LayoutDashboard,
    color: "from-ocean-600 to-ocean-800",
  },
  {
    id: "calculators",
    title: "Calculator Suite",
    description:
      "Landed cost, unit economics, container utilization, and FTZ savings — all interconnected with shared parameters.",
    icon: Calculator,
    color: "from-cargo-600 to-cargo-800",
  },
  {
    id: "routes",
    title: "Route Planner",
    description:
      "Interactive map with carrier comparison, transit times, backhaul pricing, and transshipment hub visualization.",
    icon: Map,
    color: "from-teal-600 to-teal-800",
  },
  {
    id: "ftz",
    title: "FTZ Analyzer",
    description:
      "Full-scenario FTZ modeling with withdrawal scheduling, duty rate locking, and multi-scenario comparison.",
    icon: Shield,
    color: "from-green-600 to-green-800",
  },
  {
    id: "knowledge",
    title: "Knowledge Base",
    description:
      "Import SOPs, compliance checklists, documentation matrix, and tariff classification guides.",
    icon: FileText,
    color: "from-purple-600 to-purple-800",
  },
  {
    id: "reports",
    title: "Reports & Export",
    description:
      "PDF generation for landed cost analyses, route comparisons, and FTZ savings reports — client-ready output.",
    icon: BarChart3,
    color: "from-blue-600 to-blue-800",
  },
];

function DashboardWireframe() {
  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-ocean-500/30 flex items-center justify-center">
            <Ship className="w-3.5 h-3.5 text-ocean-400" />
          </div>
          <div className="h-2 w-24 rounded bg-white/10" />
          <div className="flex gap-1.5">
            {["Dashboard", "Shipments", "Routes", "FTZ"].map((tab) => (
              <div
                key={tab}
                className={`text-[9px] px-2 py-1 rounded ${
                  tab === "Dashboard"
                    ? "bg-ocean-500/20 text-ocean-300"
                    : "text-navy-500"
                }`}
              >
                {tab}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="w-3 h-3 text-navy-600" />
          <div className="w-5 h-5 rounded-full bg-ocean-700/50" />
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Active", value: "14", icon: Ship, color: "text-ocean-400" },
          { label: "Revenue", value: "$2.4M", icon: DollarSign, color: "text-green-400" },
          { label: "Landed", value: "$4.82", icon: TrendingUp, color: "text-cargo-400" },
          { label: "On-Time", value: "87.5%", icon: Clock, color: "text-purple-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white/[0.03] rounded-lg p-2">
            <kpi.icon className={`w-3 h-3 ${kpi.color} mb-1`} />
            <div className="text-xs font-bold text-white">{kpi.value}</div>
            <div className="text-[8px] text-navy-500">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Shipment List */}
      <div className="space-y-1.5">
        {[
          { id: "SS-0041", route: "Hanoi > LA", status: "In Transit", pct: 67, color: "bg-ocean-400" },
          { id: "SS-0040", route: "Seattle > AK", status: "In Transit", pct: 78, color: "bg-ocean-400" },
          { id: "SS-0039", route: "Bangkok > LB", status: "Customs", pct: 90, color: "bg-cargo-400" },
        ].map((s) => (
          <div key={s.id} className="bg-white/[0.03] rounded-lg p-2 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-medium text-white">{s.id}</span>
                <span className="text-[8px] text-navy-400">{s.status}</span>
              </div>
              <div className="text-[8px] text-navy-500 mb-1">{s.route}</div>
              <div className="w-full h-1 rounded-full bg-white/5">
                <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
            <ChevronRight className="w-3 h-3 text-navy-600 flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* Side cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/[0.03] rounded-lg p-2">
          <div className="text-[8px] text-navy-400 mb-1">Cost Breakdown</div>
          <div className="flex gap-0.5 h-2 rounded overflow-hidden">
            <div className="bg-ocean-500 w-[42%]" />
            <div className="bg-cargo-400 w-[17%]" />
            <div className="bg-blue-400 w-[10%]" />
            <div className="bg-purple-500 w-[8%]" />
            <div className="bg-green-500 w-[23%]" />
          </div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-2">
          <div className="text-[8px] text-navy-400 mb-1">Cargo Mix</div>
          <div className="flex items-center gap-2">
            <div className="text-[9px] text-blue-300">Cold: 3</div>
            <div className="text-[9px] text-cargo-300">Gen: 3</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalculatorsWireframe() {
  return (
    <div className="space-y-3">
      {/* Tab Bar */}
      <div className="flex gap-1">
        {["Landed Cost", "Unit Econ", "Container", "FTZ"].map((tab, i) => (
          <div
            key={tab}
            className={`text-[9px] px-2 py-1 rounded ${
              i === 0
                ? "bg-cargo-500/20 text-cargo-300"
                : "text-navy-500"
            }`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-2 gap-2">
        {["Unit Cost", "Qty/Container", "Shipping Cost", "Duty Rate %", "Fulfillment", "Markup %"].map(
          (field) => (
            <div key={field} className="space-y-0.5">
              <div className="text-[8px] text-navy-500">{field}</div>
              <div className="h-5 rounded bg-white/[0.04] border border-white/5" />
            </div>
          )
        )}
      </div>

      {/* Cost Breakdown Bar */}
      <div>
        <div className="text-[8px] text-navy-400 mb-1">Cost Breakdown</div>
        <div className="flex gap-0.5 h-4 rounded overflow-hidden">
          <div className="bg-ocean-600 w-[30%] flex items-center justify-center text-[7px] text-white">30%</div>
          <div className="bg-ocean-500 w-[15%] flex items-center justify-center text-[7px] text-white">15%</div>
          <div className="bg-cargo-600 w-[20%] flex items-center justify-center text-[7px] text-white">20%</div>
          <div className="bg-cargo-500 w-[35%] flex items-center justify-center text-[7px] text-white">35%</div>
        </div>
        <div className="flex gap-3 mt-1">
          {[
            { label: "Origin", color: "bg-ocean-600" },
            { label: "Shipping", color: "bg-ocean-500" },
            { label: "Duty", color: "bg-cargo-600" },
            { label: "Fulfillment", color: "bg-cargo-500" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1 text-[7px] text-navy-400">
              <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Value Chain */}
      <div className="bg-white/[0.03] rounded-lg p-2">
        <div className="flex items-center justify-between text-center">
          {[
            { label: "Origin", value: "$0.10" },
            { label: "Landed", value: "$0.28" },
            { label: "Wholesale", value: "$1.12" },
            { label: "Retail", value: "$5.00" },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-1">
              {i > 0 && <ArrowRight className="w-2.5 h-2.5 text-navy-600" />}
              <div>
                <div className="text-[7px] text-navy-500">{step.label}</div>
                <div className="text-[10px] font-bold text-white">{step.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROI Card */}
      <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-2">
        <div className="text-[8px] text-green-400 font-medium mb-0.5">Container Profit</div>
        <div className="text-sm font-bold text-green-400">$420,000</div>
        <div className="text-[8px] text-navy-400">300% return on landed cost</div>
      </div>
    </div>
  );
}

function RoutesWireframe() {
  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white/[0.04] rounded-lg px-2 py-1.5 border border-white/5">
          <Search className="w-3 h-3 text-navy-500" />
          <div className="text-[9px] text-navy-500">Search origin port...</div>
        </div>
        <div className="flex-1 flex items-center gap-2 bg-white/[0.04] rounded-lg px-2 py-1.5 border border-white/5">
          <Search className="w-3 h-3 text-navy-500" />
          <div className="text-[9px] text-navy-500">Search destination...</div>
        </div>
        <div className="px-2 py-1.5 bg-ocean-500/20 rounded-lg">
          <Filter className="w-3 h-3 text-ocean-400" />
        </div>
      </div>

      {/* Map area */}
      <div className="relative bg-navy-900/50 rounded-lg overflow-hidden" style={{ height: 100 }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Globe className="w-12 h-12 text-navy-800" />
        </div>
        {/* Route lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
          <path d="M 160 50 Q 100 20 40 40" stroke="#00bcd4" strokeWidth="1" fill="none" strokeDasharray="4,2" opacity="0.6" />
          <path d="M 155 55 Q 100 30 45 45" stroke="#ffc81a" strokeWidth="1" fill="none" strokeDasharray="4,2" opacity="0.4" />
          <circle cx="160" cy="50" r="3" fill="#ffc81a" opacity="0.8" />
          <circle cx="40" cy="40" r="3" fill="#00bcd4" opacity="0.8" />
          <circle cx="120" cy="55" r="2" fill="#a855f7" opacity="0.6" />
        </svg>
        <div className="absolute bottom-1 right-1 flex gap-1">
          {[
            { label: "Origin", color: "bg-cargo-400" },
            { label: "Hub", color: "bg-purple-400" },
            { label: "Dest", color: "bg-ocean-400" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-0.5 text-[7px] text-navy-400 bg-navy-950/80 px-1 py-0.5 rounded">
              <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Carrier cards */}
      <div className="space-y-1.5">
        {[
          { carrier: "COSCO", days: "26d", cost: "$2,600", discount: "18% backhaul", best: true },
          { carrier: "Evergreen", days: "24d", cost: "$2,850", discount: "12% backhaul", best: false },
          { carrier: "Maersk", days: "21d", cost: "$3,400", discount: "5% backhaul", best: false },
        ].map((c) => (
          <div
            key={c.carrier}
            className={`flex items-center justify-between bg-white/[0.03] rounded-lg p-2 ${
              c.best ? "border border-green-500/20" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              {c.best && <div className="w-1 h-6 rounded bg-green-500" />}
              <div>
                <div className="text-[9px] font-medium text-white">{c.carrier}</div>
                <div className="text-[8px] text-purple-300">{c.discount}</div>
              </div>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <div className="text-[10px] font-medium text-ocean-300">{c.days}</div>
                <div className="text-[7px] text-navy-500">Transit</div>
              </div>
              <div>
                <div className="text-[10px] font-medium text-cargo-300">{c.cost}</div>
                <div className="text-[7px] text-navy-500">per TEU</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FTZWireframe() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Shield className="w-3.5 h-3.5 text-green-400" />
        <div className="text-[10px] font-medium text-green-300">FTZ Savings Analyzer</div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-2">
        {["Unit Value", "Total Units", "Locked Rate %", "Current Rate %"].map((field) => (
          <div key={field} className="space-y-0.5">
            <div className="text-[8px] text-navy-500">{field}</div>
            <div className="h-5 rounded bg-white/[0.04] border border-white/5" />
          </div>
        ))}
      </div>

      {/* Months slider */}
      <div>
        <div className="text-[8px] text-navy-500 mb-1">Months in FTZ: 8</div>
        <div className="h-1 rounded-full bg-white/10">
          <div className="h-full w-1/3 rounded-full bg-ocean-500" />
        </div>
      </div>

      {/* Big savings card */}
      <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 text-center">
        <div className="text-[8px] text-navy-400 mb-0.5">Total Duty Savings with FTZ</div>
        <div className="text-lg font-bold text-green-400">$13,750</div>
        <div className="text-[9px] text-green-300">45.8% reduction</div>
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5">
          <div>
            <div className="text-[8px] text-red-300">Without FTZ</div>
            <div className="text-[10px] font-semibold text-red-400">$30,000</div>
          </div>
          <div>
            <div className="text-[8px] text-green-300">With FTZ</div>
            <div className="text-[10px] font-semibold text-green-400">$16,250</div>
          </div>
        </div>
      </div>

      {/* Withdrawal timeline */}
      <div className="bg-white/[0.03] rounded-lg p-2">
        <div className="text-[8px] text-navy-400 mb-1.5">Withdrawal Schedule</div>
        <div className="space-y-1">
          {[1, 2, 3, 4].map((m) => (
            <div key={m} className="flex items-center justify-between text-[8px]">
              <span className="text-navy-500">Mo {m}</span>
              <span className="text-navy-400">62,500 units</span>
              <span className="text-green-400">+${(m * 1718).toLocaleString()} saved</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KnowledgeWireframe() {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="flex items-center gap-2 bg-white/[0.04] rounded-lg px-2 py-1.5 border border-white/5">
        <Search className="w-3 h-3 text-navy-500" />
        <div className="text-[9px] text-navy-500">Search SOPs, guides, compliance...</div>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { title: "Import Process", count: "8 guides", icon: Ship, color: "text-ocean-400" },
          { title: "FTZ Operations", count: "5 guides", icon: Shield, color: "text-green-400" },
          { title: "Compliance", count: "12 checklists", icon: FileText, color: "text-cargo-400" },
          { title: "Documentation", count: "6 templates", icon: Package, color: "text-purple-400" },
        ].map((cat) => (
          <div key={cat.title} className="bg-white/[0.03] rounded-lg p-2">
            <cat.icon className={`w-3.5 h-3.5 ${cat.color} mb-1.5`} />
            <div className="text-[9px] font-medium text-white">{cat.title}</div>
            <div className="text-[8px] text-navy-500">{cat.count}</div>
          </div>
        ))}
      </div>

      {/* Article list */}
      <div className="space-y-1.5">
        {[
          "Step-by-Step: First Container Import",
          "HTS Code Classification Guide",
          "FTZ Entry & Withdrawal Process",
          "ISF Filing Requirements",
          "Customs Bond Setup Guide",
        ].map((article) => (
          <div
            key={article}
            className="flex items-center justify-between bg-white/[0.03] rounded-lg p-2"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3 h-3 text-navy-500" />
              <span className="text-[9px] text-navy-300">{article}</span>
            </div>
            <ChevronRight className="w-3 h-3 text-navy-600" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsWireframe() {
  return (
    <div className="space-y-3">
      {/* Report templates */}
      <div className="text-[9px] text-navy-400 font-medium">Report Templates</div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { title: "Landed Cost Report", desc: "Full cost breakdown PDF" },
          { title: "Route Comparison", desc: "Carrier analysis export" },
          { title: "FTZ Savings Report", desc: "Scenario comparison PDF" },
          { title: "Monthly Operations", desc: "KPI summary report" },
        ].map((report) => (
          <div
            key={report.title}
            className="bg-white/[0.03] rounded-lg p-2 border border-white/5 hover:border-ocean-500/20 cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5 text-ocean-400 mb-1.5" />
            <div className="text-[9px] font-medium text-white">{report.title}</div>
            <div className="text-[7px] text-navy-500">{report.desc}</div>
          </div>
        ))}
      </div>

      {/* Recent exports */}
      <div className="text-[9px] text-navy-400 font-medium">Recent Exports</div>
      <div className="space-y-1.5">
        {[
          { name: "Vietnam Electronics — Landed Cost.pdf", date: "2h ago", size: "124 KB" },
          { name: "Bangkok FTZ Scenario Analysis.pdf", date: "Yesterday", size: "89 KB" },
          { name: "Q1 2024 Operations Summary.pdf", date: "3 days ago", size: "256 KB" },
        ].map((file) => (
          <div
            key={file.name}
            className="flex items-center justify-between bg-white/[0.03] rounded-lg p-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-7 rounded bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[6px] font-bold text-red-400">PDF</span>
              </div>
              <div className="min-w-0">
                <div className="text-[9px] text-white truncate">{file.name}</div>
                <div className="text-[7px] text-navy-500">
                  {file.date} &middot; {file.size}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const wireframeComponents: Record<string, () => JSX.Element> = {
  dashboard: DashboardWireframe,
  calculators: CalculatorsWireframe,
  routes: RoutesWireframe,
  ftz: FTZWireframe,
  knowledge: KnowledgeWireframe,
  reports: ReportsWireframe,
};

export default function PlatformWireframes() {
  const [activeScreen, setActiveScreen] = useState("dashboard");

  const ActiveWireframe = wireframeComponents[activeScreen];
  const activeScreenData = screens.find((s) => s.id === activeScreen);

  return (
    <div className="space-y-8">
      {/* Screen selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {screens.map((screen) => (
          <button
            key={screen.id}
            onClick={() => setActiveScreen(screen.id)}
            className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl transition-all ${
              activeScreen === screen.id
                ? "bg-white/10 text-white border border-white/20"
                : "glass text-navy-300 hover:text-white"
            }`}
          >
            <screen.icon className="w-4 h-4" />
            {screen.title}
          </button>
        ))}
      </div>

      {/* Wireframe display */}
      <div className="grid lg:grid-cols-5 gap-8 items-start">
        {/* Left: description */}
        <div className="lg:col-span-2 space-y-4">
          {activeScreenData && (
            <>
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activeScreenData.color} flex items-center justify-center`}
              >
                <activeScreenData.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {activeScreenData.title}
              </h3>
              <p className="text-sm text-navy-300 leading-relaxed">
                {activeScreenData.description}
              </p>

              {/* Key capabilities for each screen */}
              <div className="space-y-2 pt-4">
                <div className="text-xs font-medium text-navy-400 uppercase tracking-wide">
                  Key Capabilities
                </div>
                {activeScreen === "dashboard" && (
                  <>
                    <Capability label="Real-time shipment progress tracking" />
                    <Capability label="Cold chain vs. general cargo split view" />
                    <Capability label="Cost/margin analysis per shipment" />
                    <Capability label="Partner status and performance ratings" />
                  </>
                )}
                {activeScreen === "calculators" && (
                  <>
                    <Capability label="Landed cost with all hidden fees included" />
                    <Capability label="Unit economics from origin to retail" />
                    <Capability label="Container optimization by volume & weight" />
                    <Capability label="Exportable PDF reports for clients" />
                  </>
                )}
                {activeScreen === "routes" && (
                  <>
                    <Capability label="Multi-carrier comparison with backhaul data" />
                    <Capability label="Transshipment hub-and-spoke visualization" />
                    <Capability label="Transit time vs. cost optimization" />
                    <Capability label="Port congestion and dwell time alerts" />
                  </>
                )}
                {activeScreen === "ftz" && (
                  <>
                    <Capability label="Duty rate locking date simulation" />
                    <Capability label="Incremental withdrawal scheduling" />
                    <Capability label="Multi-scenario comparison (FTZ vs. direct)" />
                    <Capability label="260+ US FTZ location database" />
                  </>
                )}
                {activeScreen === "knowledge" && (
                  <>
                    <Capability label="Step-by-step import process guides" />
                    <Capability label="Compliance checklists by product category" />
                    <Capability label="Documentation requirements matrix" />
                    <Capability label="HTS tariff classification guide" />
                  </>
                )}
                {activeScreen === "reports" && (
                  <>
                    <Capability label="Client-ready PDF landed cost reports" />
                    <Capability label="Route comparison export with charts" />
                    <Capability label="FTZ savings analysis documents" />
                    <Capability label="Monthly operations KPI summaries" />
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: wireframe */}
        <div className="lg:col-span-3">
          <div className="relative">
            {/* Browser chrome */}
            <div className="bg-navy-800/50 rounded-t-xl px-4 py-2 flex items-center gap-2 border border-white/5 border-b-0">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
              </div>
              <div className="flex-1 bg-navy-900/50 rounded-md px-3 py-1 text-[9px] text-navy-500 text-center">
                app.shippingsavior.com/{activeScreen === "dashboard" ? "" : activeScreen}
              </div>
            </div>

            {/* Wireframe content */}
            <div className="bg-navy-950/80 border border-white/5 border-t-0 rounded-b-xl p-5 min-h-[320px]">
              <ActiveWireframe />
            </div>

            {/* Decorative glow */}
            <div
              className="absolute -inset-1 rounded-xl opacity-20 blur-xl -z-10"
              style={{
                background:
                  activeScreen === "dashboard"
                    ? "linear-gradient(135deg, #00bcd4, #0048e5)"
                    : activeScreen === "calculators"
                    ? "linear-gradient(135deg, #e6a800, #ffc81a)"
                    : activeScreen === "routes"
                    ? "linear-gradient(135deg, #0d9488, #14b8a6)"
                    : activeScreen === "ftz"
                    ? "linear-gradient(135deg, #22c55e, #16a34a)"
                    : activeScreen === "knowledge"
                    ? "linear-gradient(135deg, #a855f7, #7c3aed)"
                    : "linear-gradient(135deg, #3b82f6, #2563eb)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Capability({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-navy-200">
      <div className="w-1.5 h-1.5 rounded-full bg-ocean-400 flex-shrink-0" />
      {label}
    </div>
  );
}
