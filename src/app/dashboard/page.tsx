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
    color: "from-ocean-600 to-ocean-800",
    subtitle: "Across 3 lanes",
  },
  {
    label: "Monthly Revenue",
    value: "$2.41M",
    change: 8.3,
    icon: DollarSign,
    color: "from-green-600 to-green-800",
    subtitle: "vs. $2.23M last mo.",
  },
  {
    label: "Avg Landed Cost",
    value: "$4.82/unit",
    change: -3.1,
    icon: TrendingDown,
    color: "from-cargo-600 to-cargo-800",
    subtitle: "Down from $4.97/unit",
  },
  {
    label: "On-Time Rate",
    value: "87.5%",
    change: -2.1,
    icon: Clock,
    color: "from-purple-600 to-purple-800",
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
    "in-transit": { label: "In Transit", className: "bg-ocean-500/20 text-ocean-300 border-ocean-500/30", icon: Ship },
    "at-port": { label: "At Port", className: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: Anchor },
    customs: { label: "Customs", className: "bg-cargo-500/20 text-cargo-300 border-cargo-500/30", icon: Shield },
    delivered: { label: "Delivered", className: "bg-green-500/20 text-green-300 border-green-500/30", icon: CheckCircle2 },
    delayed: { label: "Delayed", className: "bg-red-500/20 text-red-300 border-red-500/30", icon: AlertTriangle },
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
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
      <Thermometer className="w-3 h-3" />
      Cold Chain
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-navy-700/50 text-navy-300 border border-white/10">
      <Box className="w-3 h-3" />
      General
    </span>
  );
}

function ProgressBar({ progress, status }: { progress: number; status: ShipmentStatus }) {
  const color =
    status === "delayed" ? "bg-red-500" :
    status === "delivered" ? "bg-green-500" :
    status === "customs" ? "bg-cargo-400" :
    "bg-ocean-400";
  return (
    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function PartnerStatusDot({ status }: { status: Partner["status"] }) {
  const color = status === "active" ? "bg-green-400" : status === "alert" ? "bg-red-400" : "bg-navy-500";
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
    <div className="min-h-screen bg-[#020a17]">
      {/* Top Nav */}
      <header className="glass border-b border-white/5 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center">
                <Ship className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm">
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
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    item.active
                      ? "bg-ocean-500/20 text-ocean-300"
                      : "text-navy-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {alertCount > 0 && (
              <button className="relative p-2 rounded-lg glass glass-hover">
                <Bell className="w-4 h-4 text-navy-300" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {alertCount}
                </span>
              </button>
            )}
            <button className="flex items-center gap-2 text-xs glass glass-hover px-3 py-2 rounded-lg text-navy-300">
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Last updated: 2 min ago</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-600 to-ocean-800 flex items-center justify-center text-xs font-bold text-white">
              JS
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-8">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Operations Dashboard</h1>
            <p className="text-sm text-navy-400 mt-1">
              Real-time view of all shipments, costs, and partner activity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-sm glass glass-hover px-4 py-2 rounded-lg text-navy-300">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 text-sm glass glass-hover px-4 py-2 rounded-lg text-navy-300">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-navy-400 font-medium uppercase tracking-wide">
                  {kpi.label}
                </span>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                  <kpi.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                    kpi.change >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {kpi.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(kpi.change)}%
                </span>
                <span className="text-xs text-navy-500">{kpi.subtitle}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: Shipment List (2/3) */}
          <div className="lg:col-span-2 space-y-4">

            {/* Cargo Type Tabs */}
            <div className="flex items-center gap-1 glass rounded-xl p-1 w-fit">
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
                      ? "bg-ocean-500/30 text-ocean-300"
                      : "text-navy-400 hover:text-navy-200"
                  }`}
                >
                  {tab.key === "cold-chain" && <Thermometer className="w-3.5 h-3.5" />}
                  {tab.key === "general" && <Box className="w-3.5 h-3.5" />}
                  {tab.key === "all" && <Package className="w-3.5 h-3.5" />}
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? "bg-ocean-500/30 text-ocean-200" : "bg-white/5 text-navy-500"
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
                  className={`glass rounded-xl p-5 cursor-pointer transition-all ${
                    selectedShipment?.id === shipment.id
                      ? "border-ocean-500/40 bg-ocean-500/5"
                      : "glass-hover"
                  }`}
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{shipment.id}</span>
                        <CargoBadge type={shipment.cargoType} />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-navy-400">
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
                    <div className="flex items-center justify-between text-xs text-navy-400 mb-1">
                      <span>{shipment.currentLocation}</span>
                      <span>{shipment.progress}%</span>
                    </div>
                    <ProgressBar progress={shipment.progress} status={shipment.status} />
                  </div>

                  {/* Meta Row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-navy-400">
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
                    <div className="mt-3 flex items-center gap-2 text-xs bg-red-500/10 text-red-300 border border-red-500/20 rounded-lg px-3 py-2">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      {shipment.alerts}
                    </div>
                  )}

                  {/* Expanded Detail */}
                  {selectedShipment?.id === shipment.id && (
                    <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Reference", value: shipment.reference },
                        { label: "Weight", value: shipment.weight },
                        { label: "Cargo Value", value: shipment.value },
                        { label: "Containers", value: String(shipment.containers) },
                      ].map((detail) => (
                        <div key={detail.label}>
                          <div className="text-xs text-navy-500 mb-1">{detail.label}</div>
                          <div className="text-sm font-medium text-white">{detail.value}</div>
                        </div>
                      ))}
                      <div className="col-span-2 md:col-span-4 flex gap-3 mt-2">
                        <button className="flex items-center gap-1.5 text-xs bg-ocean-500/20 hover:bg-ocean-500/30 text-ocean-300 px-3 py-2 rounded-lg transition-colors">
                          <MapPin className="w-3.5 h-3.5" />
                          Track on Map
                        </button>
                        <button className="flex items-center gap-1.5 text-xs glass glass-hover text-navy-300 px-3 py-2 rounded-lg transition-colors">
                          <BarChart3 className="w-3.5 h-3.5" />
                          Cost Breakdown
                        </button>
                        <button className="flex items-center gap-1.5 text-xs glass glass-hover text-navy-300 px-3 py-2 rounded-lg transition-colors">
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
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Cost vs. Margin</h3>
                <span className="text-xs text-navy-500">March 2024</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Ocean Freight", amount: "$284,200", pct: 42, color: "bg-ocean-500" },
                  { label: "Duties & Tariffs", amount: "$118,400", pct: 17, color: "bg-cargo-400" },
                  { label: "Cold Storage", amount: "$67,800", pct: 10, color: "bg-blue-400" },
                  { label: "Drayage & Port", amount: "$54,200", pct: 8, color: "bg-purple-500" },
                  { label: "Gross Margin", amount: "$156,900", pct: 23, color: "bg-green-500" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-navy-300">{item.label}</span>
                      <span className="text-white font-medium">{item.amount}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-navy-400">Total Revenue</span>
                <span className="text-sm font-bold text-white">$681,500</span>
              </div>
            </div>

            {/* Cold Chain vs General */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-ocean-400" />
                <h3 className="text-sm font-semibold text-white">Cargo Mix</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <Thermometer className="w-5 h-5 text-blue-400 mb-2" />
                  <div className="text-xl font-bold text-white">
                    {coldCount}
                  </div>
                  <div className="text-xs text-blue-300 font-medium">Cold Chain</div>
                  <div className="text-xs text-navy-500 mt-1">
                    {Math.round((coldCount / shipments.length) * 100)}% of volume
                  </div>
                </div>
                <div className="bg-cargo-500/10 border border-cargo-500/20 rounded-xl p-4">
                  <Box className="w-5 h-5 text-cargo-400 mb-2" />
                  <div className="text-xl font-bold text-white">
                    {generalCount}
                  </div>
                  <div className="text-xs text-cargo-300 font-medium">General Cargo</div>
                  <div className="text-xs text-navy-500 mt-1">
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
                    <span className="text-navy-400">{stat.label}</span>
                    <span className={stat.positive ? "text-green-400" : "text-cargo-400"}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Partner Status */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-ocean-400" />
                  <h3 className="text-sm font-semibold text-white">Partners</h3>
                </div>
                <span className="text-xs text-navy-500">{partners.length} total</span>
              </div>
              <div className="space-y-2">
                {partners.map((partner) => (
                  <div
                    key={partner.name}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PartnerStatusDot status={partner.status} />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white truncate">
                          {partner.name}
                        </div>
                        <div className="text-[10px] text-navy-500">{partner.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-cargo-400 fill-cargo-400" />
                        <span className="text-xs text-navy-300">{partner.rating}</span>
                      </div>
                      {partner.activeShipments > 0 && (
                        <span className="text-xs bg-ocean-500/20 text-ocean-300 px-1.5 py-0.5 rounded">
                          {partner.activeShipments}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { icon: Ship, label: "New Shipment", color: "text-ocean-400" },
                  { icon: BarChart3, label: "Generate Report", color: "text-cargo-400" },
                  { icon: Shield, label: "FTZ Analysis", color: "text-green-400" },
                  { icon: MapPin, label: "Track Shipment", color: "text-purple-400" },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg glass glass-hover group"
                  >
                    <div className="flex items-center gap-2.5">
                      <action.icon className={`w-4 h-4 ${action.color}`} />
                      <span className="text-sm text-navy-300 group-hover:text-white transition-colors">
                        {action.label}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-navy-600 group-hover:text-navy-300 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Saved Calculations */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">Saved Calculations</h2>
              <p className="text-xs text-navy-400 mt-0.5">Your recent quotes and landed cost models</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs bg-ocean-500/20 hover:bg-ocean-500/30 text-ocean-300 px-3 py-2 rounded-lg transition-colors">
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
                className="glass glass-hover rounded-xl p-4 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    calc.status === "ftz" ? "bg-green-500/20" :
                    calc.status === "tariff" ? "bg-cargo-500/20" :
                    calc.status === "route" ? "bg-purple-500/20" :
                    "bg-ocean-500/20"
                  }`}>
                    <calc.icon className={`w-4 h-4 ${
                      calc.status === "ftz" ? "text-green-400" :
                      calc.status === "tariff" ? "text-cargo-400" :
                      calc.status === "route" ? "text-purple-400" :
                      "text-ocean-400"
                    }`} />
                  </div>
                  <span className="text-[10px] text-navy-500">{calc.savedAt}</span>
                </div>
                <div className="mb-1">
                  <div className="text-sm font-medium text-white group-hover:text-ocean-300 transition-colors line-clamp-1">
                    {calc.name}
                  </div>
                  <div className="text-xs text-navy-500 mt-0.5">{calc.type}</div>
                </div>
                <div className="text-xs text-navy-400 mb-3">{calc.origin}</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold text-white">{calc.result}</div>
                    <div className="text-[10px] text-navy-500">{calc.resultLabel}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-navy-600 group-hover:text-ocean-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Proposal */}
        <div className="flex items-center justify-center pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-navy-400 hover:text-ocean-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Proposal
          </Link>
        </div>
      </div>
    </div>
  );
}
