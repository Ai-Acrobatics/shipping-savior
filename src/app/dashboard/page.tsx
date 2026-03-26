"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import {
  Ship,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Circle,
  BarChart3,
  Thermometer,
  Box,
  Users,
  ArrowRight,
  ArrowLeft,
  Filter,
  Download,
  RefreshCw,
  Bell,
  ChevronRight,
  Anchor,
  Truck,
  Plane,
  Shield,
  Activity,
  Star,
  Zap,
  Calculator,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ShipmentStatus = "in-transit" | "at-port" | "customs" | "delivered" | "delayed";
type CargoType = "cold-chain" | "general";

interface Shipment {
  id: string;
  reference: string;
  origin: string;
  destination: string;
  carrier: string;
  status: ShipmentStatus;
  cargoType: CargoType;
  eta: string;
  containers: number;
  weight: string;
  value: string;
  currentLocation: string;
  progress: number;
  alerts?: string;
}

interface KPI {
  label: string;
  value: string;
  change: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  color: string;
  subtitle: string;
}

interface Partner {
  name: string;
  type: string;
  activeShipments: number;
  status: "active" | "idle" | "alert";
  rating: number;
  lastActivity: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const shipments: Shipment[] = [
  {
    id: "SS-2024-0041",
    reference: "HAN-LAX-0041",
    origin: "Hanoi, Vietnam",
    destination: "Los Angeles, CA",
    carrier: "COSCO",
    status: "in-transit",
    cargoType: "general",
    eta: "Apr 14, 2024",
    containers: 2,
    weight: "42,000 kg",
    value: "$187,400",
    currentLocation: "Pacific Ocean — Day 12 of 18",
    progress: 67,
  },
  {
    id: "SS-2024-0040",
    reference: "SEA-SEA-0040",
    origin: "Seattle, WA",
    destination: "Anchorage, AK",
    carrier: "TOTE Maritime",
    status: "in-transit",
    cargoType: "cold-chain",
    eta: "Apr 3, 2024",
    containers: 1,
    weight: "18,500 kg",
    value: "$94,200",
    currentLocation: "Puget Sound — Day 2 of 3",
    progress: 78,
  },
  {
    id: "SS-2024-0039",
    reference: "BKK-LGB-0039",
    origin: "Bangkok, Thailand",
    destination: "Long Beach, CA",
    carrier: "Evergreen",
    status: "customs",
    cargoType: "general",
    eta: "Apr 2, 2024",
    containers: 3,
    weight: "61,800 kg",
    value: "$312,600",
    currentLocation: "Port of Long Beach — CBP Review",
    progress: 90,
    alerts: "Document requested: ISF amendment",
  },
  {
    id: "SS-2024-0038",
    reference: "SEA-PDX-0038",
    origin: "Seattle, WA",
    destination: "Portland, OR",
    carrier: "Lineage Logistics",
    status: "delivered",
    cargoType: "cold-chain",
    eta: "Mar 28, 2024",
    containers: 1,
    weight: "22,000 kg",
    value: "$78,900",
    currentLocation: "Delivered — Portland Cold Storage",
    progress: 100,
  },
  {
    id: "SS-2024-0037",
    reference: "CGK-LAX-0037",
    origin: "Jakarta, Indonesia",
    destination: "Los Angeles, CA",
    carrier: "MSC",
    status: "delayed",
    cargoType: "general",
    eta: "Apr 8, 2024",
    containers: 2,
    weight: "38,400 kg",
    value: "$156,300",
    currentLocation: "Singapore — Transshipment Delay",
    progress: 35,
    alerts: "3-day delay at transshipment hub",
  },
  {
    id: "SS-2024-0036",
    reference: "SEA-SFO-0036",
    origin: "Seattle, WA",
    destination: "Oakland, CA",
    carrier: "APL",
    status: "at-port",
    cargoType: "cold-chain",
    eta: "Apr 5, 2024",
    containers: 2,
    weight: "35,200 kg",
    value: "$143,700",
    currentLocation: "Port of Oakland — Awaiting Berth",
    progress: 82,
  },
];

const kpis: KPI[] = [
  {
    label: "Active Shipments",
    value: "14",
    change: 2,
    icon: Ship,
    color: "bg-ocean-50 text-ocean-600",
    subtitle: "Across 3 lanes",
  },
  {
    label: "Monthly Revenue",
    value: "$2.41M",
    change: 8.3,
    icon: DollarSign,
    color: "bg-emerald-50 text-emerald-600",
    subtitle: "vs. $2.23M last mo.",
  },
  {
    label: "Avg Landed Cost",
    value: "$4.82/unit",
    change: -3.1,
    icon: TrendingDown,
    color: "bg-amber-50 text-amber-600",
    subtitle: "Down from $4.97/unit",
  },
  {
    label: "On-Time Rate",
    value: "87.5%",
    change: -2.1,
    icon: Clock,
    color: "bg-purple-50 text-purple-600",
    subtitle: "2 delayed shipments",
  },
];

const partners: Partner[] = [
  { name: "Lineage Logistics", type: "Cold Storage", activeShipments: 4, status: "active", rating: 4.9, lastActivity: "2h ago" },
  { name: "COSCO Shipping", type: "Ocean Carrier", activeShipments: 3, status: "active", rating: 4.7, lastActivity: "4h ago" },
  { name: "Evergreen Marine", type: "Ocean Carrier", activeShipments: 2, status: "alert", rating: 4.2, lastActivity: "1d ago" },
  { name: "Pacific Drayage Co.", type: "Drayage", activeShipments: 1, status: "active", rating: 4.6, lastActivity: "6h ago" },
  { name: "Global Customs Inc.", type: "CHB", activeShipments: 5, status: "active", rating: 4.8, lastActivity: "30m ago" },
  { name: "FTZ Zone 202", type: "FTZ Operator", activeShipments: 0, status: "idle", rating: 4.5, lastActivity: "3d ago" },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ShipmentStatus }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config: Record<ShipmentStatus, { label: string; className: string; icon: any }> = {
    "in-transit": { label: "In Transit", className: "bg-ocean-50 text-ocean-700 border-ocean-200", icon: Ship },
    "at-port": { label: "At Port", className: "bg-blue-50 text-blue-700 border-blue-200", icon: Anchor },
    customs: { label: "Customs", className: "bg-amber-50 text-amber-700 border-amber-200", icon: Shield },
    delivered: { label: "Delivered", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    delayed: { label: "Delayed", className: "bg-red-50 text-red-700 border-red-200", icon: AlertTriangle },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${c.className}`}>
      <c.icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

function CargoBadge({ type }: { type: CargoType }) {
  return type === "cold-chain" ? (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
      <Thermometer className="w-3 h-3" />
      Cold Chain
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-navy-50 text-navy-600 border border-navy-200">
      <Box className="w-3 h-3" />
      General
    </span>
  );
}

function ProgressBar({ progress, status }: { progress: number; status: ShipmentStatus }) {
  const color =
    status === "delayed" ? "bg-red-500" :
    status === "delivered" ? "bg-emerald-500" :
    status === "customs" ? "bg-amber-400" :
    "bg-ocean-400";
  return (
    <div className="w-full bg-navy-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function PartnerStatusDot({ status }: { status: Partner["status"] }) {
  const color = status === "active" ? "bg-emerald-400" : status === "alert" ? "bg-red-400" : "bg-navy-300";
  return <span className={`w-2 h-2 rounded-full ${color} inline-block`} />;
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"all" | "cold-chain" | "general">("all");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const filtered = shipments.filter(
    (s) => activeTab === "all" || s.cargoType === activeTab
  );

  const coldCount = shipments.filter((s) => s.cargoType === "cold-chain").length;
  const generalCount = shipments.filter((s) => s.cargoType === "general").length;
  const alertCount = shipments.filter((s) => s.alerts).length;

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Top Nav */}
      <header className="bg-white/90 header-frosted border-b border-navy-100 px-6 py-4 sticky top-0 z-40 shadow-soft">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center shadow-sm">
                <Ship className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm text-navy-900">
                Shipping<span className="gradient-text">Savior</span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: "Dashboard", href: "/dashboard", active: true },
                { label: "Shipments", href: "#" },
                { label: "Routes", href: "#" },
                { label: "FTZ Zones", href: "#" },
                { label: "Reports", href: "#" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors font-medium ${
                    item.active
                      ? "bg-ocean-50 text-ocean-700"
                      : "text-navy-500 hover:text-navy-900 hover:bg-navy-50"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {alertCount > 0 && (
              <button className="relative p-2 rounded-lg hover:bg-navy-50 transition-colors">
                <Bell className="w-4 h-4 text-navy-500" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {alertCount}
                </span>
              </button>
            )}
            <button className="flex items-center gap-2 text-xs border border-navy-200 hover:bg-navy-50 px-3 py-2 rounded-lg text-navy-500 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Last updated: 2 min ago</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              JS
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-8">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Operations Dashboard</h1>
            <p className="text-sm text-navy-500 mt-1">
              Real-time view of all shipments, costs, and partner activity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-sm border border-navy-200 hover:bg-white px-4 py-2 rounded-lg text-navy-600 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 text-sm border border-navy-200 hover:bg-white px-4 py-2 rounded-lg text-navy-600 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white border border-navy-100 rounded-2xl p-5 shadow-soft hover:shadow-card transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-navy-500 font-semibold uppercase tracking-wide">
                  {kpi.label}
                </span>
                <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center`}>
                  <kpi.icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-navy-900 mb-1">{kpi.value}</div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                    kpi.change >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {kpi.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(kpi.change)}%
                </span>
                <span className="text-xs text-navy-400">{kpi.subtitle}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: Shipment List (2/3) */}
          <div className="lg:col-span-2 space-y-4">

            {/* Cargo Type Tabs */}
            <div className="flex items-center gap-1 bg-white border border-navy-100 rounded-xl p-1 w-fit shadow-soft">
              {[
                { key: "all", label: "All Shipments", count: shipments.length },
                { key: "cold-chain", label: "Cold Chain", count: coldCount },
                { key: "general", label: "General Cargo", count: generalCount },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-ocean-50 text-ocean-700 shadow-sm"
                      : "text-navy-500 hover:text-navy-700"
                  }`}
                >
                  {tab.key === "cold-chain" && <Thermometer className="w-3.5 h-3.5" />}
                  {tab.key === "general" && <Box className="w-3.5 h-3.5" />}
                  {tab.key === "all" && <Package className="w-3.5 h-3.5" />}
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? "bg-ocean-100 text-ocean-700" : "bg-navy-100 text-navy-400"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Shipment Cards */}
            <div className="space-y-3">
              {filtered.map((shipment) => (
                <div
                  key={shipment.id}
                  onClick={() => setSelectedShipment(
                    selectedShipment?.id === shipment.id ? null : shipment
                  )}
                  className={`bg-white border rounded-xl p-5 cursor-pointer transition-all duration-300 ${
                    selectedShipment?.id === shipment.id
                      ? "border-ocean-300 shadow-card bg-ocean-50/30"
                      : "border-navy-100 shadow-soft hover:shadow-card hover:border-navy-200"
                  }`}
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-navy-900">{shipment.id}</span>
                        <CargoBadge type={shipment.cargoType} />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-navy-500">
                        <MapPin className="w-3 h-3" />
                        {shipment.origin}
                        <ChevronRight className="w-3 h-3" />
                        {shipment.destination}
                      </div>
                    </div>
                    <StatusBadge status={shipment.status} />
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-navy-500 mb-1">
                      <span>{shipment.currentLocation}</span>
                      <span className="font-medium">{shipment.progress}%</span>
                    </div>
                    <ProgressBar progress={shipment.progress} status={shipment.status} />
                  </div>

                  {/* Meta Row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-navy-500">
                    <span className="flex items-center gap-1">
                      <Ship className="w-3 h-3" />
                      {shipment.carrier}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {shipment.containers} {shipment.containers === 1 ? "container" : "containers"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ETA: {shipment.eta}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {shipment.value}
                    </span>
                  </div>

                  {/* Alert */}
                  {shipment.alerts && (
                    <div className="mt-3 flex items-center gap-2 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      {shipment.alerts}
                    </div>
                  )}

                  {/* Expanded Detail */}
                  {selectedShipment?.id === shipment.id && (
                    <div className="mt-4 pt-4 border-t border-navy-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Reference", value: shipment.reference },
                        { label: "Weight", value: shipment.weight },
                        { label: "Cargo Value", value: shipment.value },
                        { label: "Containers", value: String(shipment.containers) },
                      ].map((detail) => (
                        <div key={detail.label}>
                          <div className="text-xs text-navy-400 mb-1">{detail.label}</div>
                          <div className="text-sm font-medium text-navy-900">{detail.value}</div>
                        </div>
                      ))}
                      <div className="col-span-2 md:col-span-4 flex gap-3 mt-2">
                        <button className="flex items-center gap-1.5 text-xs bg-ocean-50 hover:bg-ocean-100 text-ocean-700 px-3 py-2 rounded-lg transition-colors border border-ocean-200">
                          <MapPin className="w-3.5 h-3.5" />
                          Track on Map
                        </button>
                        <button className="flex items-center gap-1.5 text-xs bg-white hover:bg-navy-50 text-navy-600 px-3 py-2 rounded-lg transition-colors border border-navy-200">
                          <BarChart3 className="w-3.5 h-3.5" />
                          Cost Breakdown
                        </button>
                        <button className="flex items-center gap-1.5 text-xs bg-white hover:bg-navy-50 text-navy-600 px-3 py-2 rounded-lg transition-colors border border-navy-200">
                          <Download className="w-3.5 h-3.5" />
                          Documents
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar (1/3) */}
          <div className="space-y-5">

            {/* Cost/Margin Summary */}
            <div className="bg-white border border-navy-100 rounded-2xl p-5 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-navy-900">Cost vs. Margin</h3>
                <span className="text-xs text-navy-400">March 2024</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Ocean Freight", amount: "$284,200", pct: 42, color: "bg-ocean-500" },
                  { label: "Duties & Tariffs", amount: "$118,400", pct: 17, color: "bg-amber-400" },
                  { label: "Cold Storage", amount: "$67,800", pct: 10, color: "bg-blue-400" },
                  { label: "Drayage & Port", amount: "$54,200", pct: 8, color: "bg-purple-500" },
                  { label: "Gross Margin", amount: "$156,900", pct: 23, color: "bg-emerald-500" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-navy-600">{item.label}</span>
                      <span className="text-navy-900 font-medium">{item.amount}</span>
                    </div>
                    <div className="w-full bg-navy-100 rounded-full h-1.5">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-navy-100 flex items-center justify-between">
                <span className="text-xs text-navy-500">Total Revenue</span>
                <span className="text-sm font-bold text-navy-900">$681,500</span>
              </div>
            </div>

            {/* Cold Chain vs General */}
            <div className="bg-white border border-navy-100 rounded-2xl p-5 shadow-soft">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-ocean-500" />
                <h3 className="text-sm font-semibold text-navy-900">Cargo Mix</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <Thermometer className="w-5 h-5 text-blue-600 mb-2" />
                  <div className="text-xl font-bold text-navy-900">
                    {coldCount}
                  </div>
                  <div className="text-xs text-blue-700 font-medium">Cold Chain</div>
                  <div className="text-xs text-navy-400 mt-1">
                    {Math.round((coldCount / shipments.length) * 100)}% of volume
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <Box className="w-5 h-5 text-amber-600 mb-2" />
                  <div className="text-xl font-bold text-navy-900">
                    {generalCount}
                  </div>
                  <div className="text-xs text-amber-700 font-medium">General Cargo</div>
                  <div className="text-xs text-navy-400 mt-1">
                    {Math.round((generalCount / shipments.length) * 100)}% of volume
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {[
                  { label: "Cold Chain Revenue", value: "$342,800", positive: true },
                  { label: "General Revenue", value: "$338,700", positive: true },
                  { label: "Cold Chain Margin", value: "28.4%", positive: true },
                  { label: "General Margin", value: "19.1%", positive: false },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between text-xs">
                    <span className="text-navy-500">{stat.label}</span>
                    <span className={stat.positive ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Partner Status */}
            <div className="bg-white border border-navy-100 rounded-2xl p-5 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-ocean-500" />
                  <h3 className="text-sm font-semibold text-navy-900">Partners</h3>
                </div>
                <span className="text-xs text-navy-400">{partners.length} total</span>
              </div>
              <div className="space-y-2">
                {partners.map((partner) => (
                  <div
                    key={partner.name}
                    className="flex items-center justify-between py-2 border-b border-navy-100 last:border-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PartnerStatusDot status={partner.status} />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-navy-900 truncate">
                          {partner.name}
                        </div>
                        <div className="text-[10px] text-navy-400">{partner.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs text-navy-600">{partner.rating}</span>
                      </div>
                      {partner.activeShipments > 0 && (
                        <span className="text-xs bg-ocean-50 text-ocean-700 px-1.5 py-0.5 rounded font-medium">
                          {partner.activeShipments}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-navy-100 rounded-2xl p-5 shadow-soft">
              <h3 className="text-sm font-semibold text-navy-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { icon: Ship, label: "New Shipment", color: "text-ocean-600" },
                  { icon: BarChart3, label: "Generate Report", color: "text-amber-600" },
                  { icon: Shield, label: "FTZ Analysis", color: "text-emerald-600" },
                  { icon: MapPin, label: "Track Shipment", color: "text-purple-600" },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-navy-50 border border-transparent hover:border-navy-100 group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <action.icon className={`w-4 h-4 ${action.color}`} />
                      <span className="text-sm text-navy-600 group-hover:text-navy-900 transition-colors">
                        {action.label}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-navy-300 group-hover:text-navy-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Saved Calculations */}
        <div className="bg-white border border-navy-100 rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-navy-900">Saved Calculations</h2>
              <p className="text-xs text-navy-400 mt-0.5">Your recent quotes and landed cost models</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs bg-ocean-50 hover:bg-ocean-100 text-ocean-700 border border-ocean-200 px-3 py-2 rounded-lg transition-colors font-medium">
              <Zap className="w-3.5 h-3.5" />
              New Calculation
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: "Vietnam Electronics — 40' HC",
                type: "Landed Cost",
                origin: "Ho Chi Minh City → Los Angeles",
                savedAt: "2h ago",
                result: "$5.14/unit",
                resultLabel: "Landed cost",
                status: "saved",
                icon: Calculator,
              },
              {
                name: "Bangkok Apparel FTZ Scenario",
                type: "FTZ Analysis",
                origin: "Bangkok → Long Beach (FTZ 202)",
                savedAt: "Yesterday",
                result: "18.4% savings",
                resultLabel: "vs. direct import",
                status: "ftz",
                icon: Shield,
              },
              {
                name: "Cold Chain Seattle–Anchorage",
                type: "Route Comparison",
                origin: "Seattle WA → Anchorage AK",
                savedAt: "2 days ago",
                result: "$0.82/kg",
                resultLabel: "Best rate found",
                status: "route",
                icon: Truck,
              },
              {
                name: "Indonesia Tariff — Section 301",
                type: "Tariff Estimate",
                origin: "Jakarta → Los Angeles",
                savedAt: "3 days ago",
                result: "25%",
                resultLabel: "Effective duty rate",
                status: "tariff",
                icon: BarChart3,
              },
              {
                name: "Thailand Consumer Goods — 20'",
                type: "Landed Cost",
                origin: "Laem Chabang → Oakland",
                savedAt: "4 days ago",
                result: "$3.87/unit",
                resultLabel: "Landed cost",
                status: "saved",
                icon: Package,
              },
              {
                name: "Air Freight vs Ocean — Electronics",
                type: "Mode Comparison",
                origin: "Shenzhen → SFO",
                savedAt: "1 week ago",
                result: "3.2x cost premium",
                resultLabel: "Air vs. ocean",
                status: "route",
                icon: Plane,
              },
            ].map((calc) => (
              <div
                key={calc.name}
                className="bg-white border border-navy-100 rounded-xl p-4 cursor-pointer group hover:shadow-card hover:border-navy-200 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    calc.status === "ftz" ? "bg-emerald-50" :
                    calc.status === "tariff" ? "bg-amber-50" :
                    calc.status === "route" ? "bg-purple-50" :
                    "bg-ocean-50"
                  }`}>
                    <calc.icon className={`w-4 h-4 ${
                      calc.status === "ftz" ? "text-emerald-600" :
                      calc.status === "tariff" ? "text-amber-600" :
                      calc.status === "route" ? "text-purple-600" :
                      "text-ocean-600"
                    }`} />
                  </div>
                  <span className="text-[10px] text-navy-400">{calc.savedAt}</span>
                </div>
                <div className="mb-1">
                  <div className="text-sm font-medium text-navy-900 group-hover:text-ocean-600 transition-colors line-clamp-1">
                    {calc.name}
                  </div>
                  <div className="text-xs text-navy-400 mt-0.5">{calc.type}</div>
                </div>
                <div className="text-xs text-navy-500 mb-3">{calc.origin}</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold text-navy-900">{calc.result}</div>
                    <div className="text-[10px] text-navy-400">{calc.resultLabel}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-navy-300 group-hover:text-ocean-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Proposal */}
        <div className="flex items-center justify-center pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-navy-400 hover:text-ocean-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Proposal
          </Link>
        </div>
      </div>
    </div>
  );
}
