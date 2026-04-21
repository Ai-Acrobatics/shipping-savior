"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
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
  Shield,
  Activity,
  Star,
  Zap,
  Calculator,
  Navigation,
  Milestone,
  Plus,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ShipmentStatus = "in-transit" | "at-port" | "customs" | "delivered" | "delayed";
type CargoType = "cold-chain" | "general";

interface TimelineMilestone {
  label: string;
  location: string;
  date: string;
  done: boolean;
  active?: boolean;
}

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
  timeline: TimelineMilestone[];
}

interface KPI {
  label: string;
  value: string;
  change: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  colorClass: string;
  iconBg: string;
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
    timeline: [
      { label: "Departed", location: "Hanoi Port", date: "Mar 20", done: true },
      { label: "Transshipment", location: "Singapore", date: "Mar 25", done: true },
      { label: "In Transit", location: "Pacific Ocean", date: "Ongoing", done: false, active: true },
      { label: "Port Arrival", location: "Port of LA", date: "Apr 13", done: false },
      { label: "Customs", location: "CBP Long Beach", date: "Apr 14", done: false },
      { label: "Delivered", location: "Warehouse", date: "Apr 15", done: false },
    ],
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
    timeline: [
      { label: "Loaded", location: "Seattle Terminal", date: "Apr 1", done: true },
      { label: "Departed", location: "Puget Sound", date: "Apr 1", done: true },
      { label: "In Transit", location: "Gulf of Alaska", date: "Ongoing", done: false, active: true },
      { label: "Arrival", location: "Port of Anchorage", date: "Apr 3", done: false },
      { label: "Cold Storage", location: "Lineage Anchorage", date: "Apr 3", done: false },
    ],
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
    timeline: [
      { label: "Departed", location: "Bangkok (LCBKK)", date: "Mar 6", done: true },
      { label: "Transshipment", location: "Kaohsiung, TW", date: "Mar 10", done: true },
      { label: "Pacific Crossing", location: "North Pacific", date: "Mar 12-26", done: true },
      { label: "Port Arrival", location: "Long Beach", date: "Mar 28", done: true },
      { label: "Customs Review", location: "CBP Long Beach", date: "Active", done: false, active: true },
      { label: "Delivered", location: "Warehouse", date: "TBD", done: false },
    ],
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
    timeline: [
      { label: "Picked Up", location: "Seattle Lineage", date: "Mar 26", done: true },
      { label: "In Transit", location: "I-5 Corridor", date: "Mar 27", done: true },
      { label: "Delivered", location: "Portland Cold Storage", date: "Mar 28", done: true },
    ],
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
    timeline: [
      { label: "Departed", location: "Jakarta (IDJKT)", date: "Mar 22", done: true },
      { label: "Transshipment", location: "Singapore", date: "Mar 26 (delayed)", done: false, active: true },
      { label: "Pacific Crossing", location: "North Pacific", date: "TBD", done: false },
      { label: "Port Arrival", location: "Port of LA", date: "Apr 7", done: false },
      { label: "Delivered", location: "Warehouse", date: "Apr 8", done: false },
    ],
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
    timeline: [
      { label: "Departed", location: "Seattle", date: "Mar 30", done: true },
      { label: "In Transit", location: "Pacific Coast", date: "Mar 30-Apr 2", done: true },
      { label: "Arrived", location: "Port of Oakland", date: "Apr 2", done: true },
      { label: "Awaiting Berth", location: "Oakland Terminal", date: "Active", done: false, active: true },
      { label: "Unloaded", location: "Oakland Terminal", date: "Apr 4", done: false },
      { label: "Delivered", location: "Cold Storage", date: "Apr 5", done: false },
    ],
  },
];

const kpis: KPI[] = [
  {
    label: "Active Shipments",
    value: "12",
    change: 2,
    icon: Ship,
    colorClass: "text-ocean-600",
    iconBg: "bg-ocean-50",
    subtitle: "Across 3 lanes",
  },
  {
    label: "In Transit",
    value: "8",
    change: 14.3,
    icon: Navigation,
    colorClass: "text-teal-600",
    iconBg: "bg-teal-50",
    subtitle: "5 ocean · 3 domestic",
  },
  {
    label: "Duty Savings MTD",
    value: "$18,500",
    change: 12.4,
    icon: TrendingUp,
    colorClass: "text-emerald-600",
    iconBg: "bg-emerald-50",
    subtitle: "via FTZ + HTS optimization",
  },
  {
    label: "Active Alerts",
    value: "2",
    change: -33,
    icon: AlertTriangle,
    colorClass: "text-amber-600",
    iconBg: "bg-amber-50",
    subtitle: "Down from 3 last week",
  },
];

interface RecentCalc {
  type: string;
  date: string;
  route: string;
  result: string;
  status: "Saved" | "Draft";
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

const recentCalculations: RecentCalc[] = [
  {
    type: "Landed Cost",
    date: "Mar 25, 2026",
    route: "Shanghai -> Los Angeles",
    result: "$4.92/unit",
    status: "Saved",
    icon: Calculator,
    iconColor: "text-ocean-600",
    iconBg: "bg-ocean-50",
  },
  {
    type: "FTZ Analysis",
    date: "Mar 24, 2026",
    route: "Ho Chi Minh City -> Long Beach",
    result: "21.3% savings",
    status: "Saved",
    icon: Shield,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    type: "Container Util",
    date: "Mar 23, 2026",
    route: "Bangkok -> Oakland",
    result: "82% utilization",
    status: "Draft",
    icon: Box,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
  },
  {
    type: "Landed Cost",
    date: "Mar 22, 2026",
    route: "Jakarta -> Seattle",
    result: "$6.18/unit",
    status: "Saved",
    icon: Calculator,
    iconColor: "text-ocean-600",
    iconBg: "bg-ocean-50",
  },
  {
    type: "FTZ Analysis",
    date: "Mar 20, 2026",
    route: "Taipei -> Los Angeles",
    result: "14.7% savings",
    status: "Draft",
    icon: Shield,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
];

interface ActiveRoute {
  origin: string;
  destination: string;
  rate: string;
  transitDays: number;
  status: "Active" | "Monitoring";
  carrier: string;
}

const activeRoutes: ActiveRoute[] = [
  { origin: "Shanghai", destination: "Los Angeles", rate: "$1,850/TEU", transitDays: 16, status: "Active", carrier: "COSCO / Evergreen" },
  { origin: "Ho Chi Minh City", destination: "Long Beach", rate: "$2,100/TEU", transitDays: 19, status: "Active", carrier: "MSC / ONE" },
  { origin: "Bangkok", destination: "Seattle", rate: "$1,640/TEU", transitDays: 21, status: "Monitoring", carrier: "APL / Hapag-Lloyd" },
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
    status === "at-port" ? "bg-blue-400" :
    "bg-ocean-400";
  return (
    <div className="w-full bg-navy-100 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${progress}%` }} />
    </div>
  );
}

function ShipmentTimeline({ milestones }: { milestones: TimelineMilestone[] }) {
  return (
    <div className="mt-4 pt-4 border-t border-navy-100">
      <div className="text-xs font-semibold text-navy-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <Milestone className="w-3.5 h-3.5" />
        Route Progress
      </div>
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-navy-100" />
        <div
          className="absolute left-[11px] top-2 w-0.5 bg-gradient-to-b from-ocean-400 to-teal-400 transition-all duration-700"
          style={{
            height: `${(milestones.filter(m => m.done).length / Math.max(milestones.length - 1, 1)) * 100}%`,
          }}
        />
        <div className="space-y-2.5 relative">
          {milestones.map((m, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 transition-all ${
                m.done
                  ? "bg-emerald-500 border-emerald-500"
                  : m.active
                  ? "bg-ocean-500 border-ocean-500 animate-pulse"
                  : "bg-white border-navy-200"
              }`}>
                {m.done ? (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                ) : m.active ? (
                  <div className="w-2 h-2 rounded-full bg-white" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-navy-300" />
                )}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <div className={`text-xs font-semibold ${m.done ? "text-navy-700" : m.active ? "text-ocean-600" : "text-navy-400"}`}>
                  {m.label}
                </div>
                <div className="text-[10px] text-navy-400 truncate">{m.location} &bull; {m.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PartnerStatusDot({ status }: { status: Partner["status"] }) {
  const color = status === "active" ? "bg-emerald-400" : status === "alert" ? "bg-red-400" : "bg-navy-300";
  return <span className={`w-2 h-2 rounded-full ${color} inline-block`} />;
}

// Empty state for new users
function EmptyState() {
  return (
    <div className="col-span-2 bg-white border border-dashed border-navy-200 rounded-2xl p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-ocean-50 flex items-center justify-center mx-auto mb-4">
        <Package className="w-8 h-8 text-ocean-400" />
      </div>
      <h3 className="text-base font-semibold text-navy-900 mb-2">No shipments yet</h3>
      <p className="text-sm text-navy-500 max-w-xs mx-auto mb-6">
        Book your first shipment to start tracking routes, managing cargo, and optimizing costs.
      </p>
      <Link
        href="/dashboard/booking"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-ocean-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl text-sm shadow-md hover:shadow-lg hover:shadow-ocean-500/30 transition-all hover:scale-[1.02]"
      >
        <Plus className="w-4 h-4" />
        Book First Shipment
      </Link>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"all" | "cold-chain" | "general">("all");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const filtered = shipments.filter((s) => activeTab === "all" || s.cargoType === activeTab);
  const coldCount = shipments.filter((s) => s.cargoType === "cold-chain").length;
  const generalCount = shipments.filter((s) => s.cargoType === "general").length;
  const alertCount = shipments.filter((s) => s.alerts).length;
  const deliveredCount = shipments.filter((s) => s.status === "delivered").length;
  const inTransitCount = shipments.filter((s) => s.status === "in-transit").length;

  return (
    <div className="min-h-screen bg-navy-50/60">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Operations Dashboard</h1>
          <p className="text-sm text-navy-500 mt-0.5">
            Real-time view of all shipments, costs, and partner activity
            <span className="ml-3 inline-flex items-center gap-1 text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 text-sm bg-white border border-navy-200 hover:bg-navy-50 px-3 py-2 rounded-lg text-navy-600 transition-colors shadow-soft">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
          <button className="flex items-center gap-2 text-sm bg-white border border-navy-200 hover:bg-navy-50 px-3 py-2 rounded-lg text-navy-600 transition-colors shadow-soft">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <Link
            href="/dashboard/booking"
            className="flex items-center gap-2 text-sm bg-gradient-to-r from-ocean-600 to-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-ocean-500/25 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5" />
            New Booking
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-navy-100 rounded-2xl p-5 shadow-soft hover:shadow-card transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                <kpi.icon className={`w-4.5 h-4.5 ${kpi.colorClass}`} />
              </div>
              <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${kpi.change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {kpi.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(kpi.change)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-navy-900 mb-0.5">{kpi.value}</div>
            <div className="text-xs font-semibold text-navy-700">{kpi.label}</div>
            <div className="text-[11px] text-navy-400 mt-0.5">{kpi.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Status summary strip */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {[
          { label: "In Transit", count: inTransitCount, color: "bg-ocean-100 text-ocean-700 border-ocean-200" },
          { label: "At Port", count: shipments.filter(s => s.status === "at-port").length, color: "bg-blue-100 text-blue-700 border-blue-200" },
          { label: "In Customs", count: shipments.filter(s => s.status === "customs").length, color: "bg-amber-100 text-amber-700 border-amber-200" },
          { label: "Delayed", count: shipments.filter(s => s.status === "delayed").length, color: "bg-red-100 text-red-700 border-red-200" },
          { label: "Delivered", count: deliveredCount, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
        ].map((s) => (
          <span key={s.label} className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${s.color}`}>
            {s.label}
            <span className="font-bold">{s.count}</span>
          </span>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left: Shipment List (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cargo Type Tabs */}
          <div className="flex items-center gap-1 bg-white border border-navy-100 rounded-xl p-1 w-fit shadow-soft">
            {[
              { key: "all", label: "All", count: shipments.length },
              { key: "cold-chain", label: "Cold Chain", count: coldCount },
              { key: "general", label: "General", count: generalCount },
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
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {filtered.map((shipment) => (
                <div
                  key={shipment.id}
                  onClick={() => setSelectedShipment(selectedShipment?.id === shipment.id ? null : shipment)}
                  className={`bg-white border rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
                    selectedShipment?.id === shipment.id
                      ? "border-ocean-300 shadow-card bg-ocean-50/20"
                      : "border-navy-100 shadow-soft hover:shadow-card hover:border-navy-200 hover:-translate-y-0.5"
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
                    <div className="flex items-center justify-between text-xs text-navy-500 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        {shipment.currentLocation}
                      </span>
                      <span className="font-semibold text-navy-700">{shipment.progress}%</span>
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
                    <div className="mt-3 flex items-center gap-2 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      {shipment.alerts}
                    </div>
                  )}

                  {/* Expanded: Timeline + Details */}
                  {selectedShipment?.id === shipment.id && (
                    <div>
                      {/* Timeline visualization */}
                      <ShipmentTimeline milestones={shipment.timeline} />

                      {/* Detail grid */}
                      <div className="mt-4 pt-4 border-t border-navy-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: "Reference", value: shipment.reference },
                          { label: "Weight", value: shipment.weight },
                          { label: "Cargo Value", value: shipment.value },
                          { label: "Containers", value: String(shipment.containers) },
                        ].map((detail) => (
                          <div key={detail.label}>
                            <div className="text-[10px] text-navy-400 uppercase tracking-wide mb-1">{detail.label}</div>
                            <div className="text-sm font-semibold text-navy-900">{detail.value}</div>
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
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar (1/3) */}
        <div className="space-y-5">
          {/* Cost/Margin Summary */}
          <div className="bg-white border border-navy-100 rounded-2xl p-5 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-navy-900">Cost Breakdown</h3>
              <span className="text-xs text-navy-400 bg-navy-50 px-2 py-0.5 rounded-full">March 2024</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Ocean Freight", amount: "$284,200", pct: 42, color: "bg-ocean-500" },
                { label: "Duties & Tariffs", amount: "$118,400", pct: 17, color: "bg-amber-400" },
                { label: "Cold Storage", amount: "$67,800", pct: 10, color: "bg-blue-400" },
                { label: "Drayage & Port", amount: "$54,200", pct: 8, color: "bg-purple-400" },
                { label: "Gross Margin", amount: "$156,900", pct: 23, color: "bg-emerald-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-navy-600">{item.label}</span>
                    <span className="text-navy-900 font-semibold">{item.amount}</span>
                  </div>
                  <div className="w-full bg-navy-100 rounded-full h-1.5">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
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
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <Thermometer className="w-4.5 h-4.5 text-blue-600 mb-2" />
                <div className="text-xl font-bold text-navy-900">{coldCount}</div>
                <div className="text-xs text-blue-700 font-medium">Cold Chain</div>
                <div className="text-[10px] text-navy-400 mt-0.5">{Math.round((coldCount / shipments.length) * 100)}% of volume</div>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <Box className="w-4.5 h-4.5 text-amber-600 mb-2" />
                <div className="text-xl font-bold text-navy-900">{generalCount}</div>
                <div className="text-xs text-amber-700 font-medium">General Cargo</div>
                <div className="text-[10px] text-navy-400 mt-0.5">{Math.round((generalCount / shipments.length) * 100)}% of volume</div>
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                { label: "Cold Chain Revenue", value: "$342,800", positive: true },
                { label: "General Revenue", value: "$338,700", positive: true },
                { label: "Cold Chain Margin", value: "28.4%", positive: true },
                { label: "General Margin", value: "19.1%", positive: false },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between text-xs">
                  <span className="text-navy-500">{stat.label}</span>
                  <span className={stat.positive ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Partners */}
          <div className="bg-white border border-navy-100 rounded-2xl p-5 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-ocean-500" />
                <h3 className="text-sm font-semibold text-navy-900">Partners</h3>
              </div>
              <span className="text-xs text-navy-400">{partners.length} total</span>
            </div>
            <div className="space-y-1">
              {partners.map((partner) => (
                <div key={partner.name} className="flex items-center justify-between py-2 border-b border-navy-50 last:border-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <PartnerStatusDot status={partner.status} />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-navy-900 truncate">{partner.name}</div>
                      <div className="text-[10px] text-navy-400">{partner.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-navy-600">{partner.rating}</span>
                    </div>
                    {partner.activeShipments > 0 && (
                      <span className="text-xs bg-ocean-50 text-ocean-700 px-1.5 py-0.5 rounded font-medium">{partner.activeShipments}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-navy-100 rounded-2xl p-5 shadow-soft">
            <h3 className="text-sm font-semibold text-navy-900 mb-3">Quick Actions</h3>
            <div className="space-y-1">
              {[
                { icon: Calculator, label: "Landed Cost Calc", color: "text-ocean-600", href: "/" },
                { icon: Shield, label: "FTZ Analysis", color: "text-emerald-600", href: "/ftz-analyzer" },
                { icon: BarChart3, label: "Route Compare", color: "text-amber-600", href: "/#route-compare" },
                { icon: Box, label: "Container Calc", color: "text-purple-600", href: "/#container-calc" },
              ].map((action) => (
                <Link key={action.label} href={action.href}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-navy-50 border border-transparent hover:border-navy-100 group transition-all">
                  <div className="flex items-center gap-2.5">
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                    <span className="text-sm text-navy-600 group-hover:text-navy-900 transition-colors">{action.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-navy-300 group-hover:text-navy-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Calculations Table */}
      <div className="mt-6 bg-white border border-navy-100 rounded-2xl p-6 shadow-soft">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-navy-900">Recent Calculations</h2>
            <p className="text-xs text-navy-400 mt-0.5">Last 5 calculations run across all tools</p>
          </div>
          <Link href="/" className="flex items-center gap-1.5 text-xs bg-ocean-50 hover:bg-ocean-100 text-ocean-700 border border-ocean-200 px-3 py-2 rounded-lg transition-colors font-medium">
            <Zap className="w-3.5 h-3.5" />
            New Calculation
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-100">
                <th className="text-left text-xs text-navy-400 font-semibold uppercase tracking-wide pb-3 pr-4">Type</th>
                <th className="text-left text-xs text-navy-400 font-semibold uppercase tracking-wide pb-3 pr-4">Date</th>
                <th className="text-left text-xs text-navy-400 font-semibold uppercase tracking-wide pb-3 pr-4">Route</th>
                <th className="text-left text-xs text-navy-400 font-semibold uppercase tracking-wide pb-3 pr-4">Result</th>
                <th className="text-left text-xs text-navy-400 font-semibold uppercase tracking-wide pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentCalculations.map((calc, i) => (
                <tr key={i} className="border-b border-navy-50 last:border-0 hover:bg-navy-50/50 transition-colors cursor-pointer">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${calc.iconBg}`}>
                        <calc.icon className={`w-3.5 h-3.5 ${calc.iconColor}`} />
                      </div>
                      <span className="text-sm font-medium text-navy-900">{calc.type}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-xs text-navy-500 whitespace-nowrap">{calc.date}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1 text-xs text-navy-600">
                      <MapPin className="w-3 h-3 text-navy-300 flex-shrink-0" />
                      {calc.route}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-sm font-semibold text-navy-900">{calc.result}</span>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${
                      calc.status === "Saved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {calc.status === "Saved" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Circle className="w-3 h-3 mr-1" />}
                      {calc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Routes */}
      <div className="mt-6 bg-white border border-navy-100 rounded-2xl p-6 shadow-soft">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-navy-900">Active Routes</h2>
            <p className="text-xs text-navy-400 mt-0.5">Current freight lanes being monitored</p>
          </div>
          <span className="text-xs text-navy-400 bg-navy-50 border border-navy-100 px-2.5 py-1 rounded-full">{activeRoutes.length} lanes</span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {activeRoutes.map((route, i) => (
            <div key={i} className="border border-navy-100 rounded-xl p-4 hover:shadow-card hover:border-navy-200 transition-all duration-300 cursor-pointer group hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-ocean-50 flex items-center justify-center">
                  <Anchor className="w-4 h-4 text-ocean-600" />
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
                  route.status === "Active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${route.status === "Active" ? "bg-emerald-400" : "bg-amber-400"}`} />
                  {route.status}
                </span>
              </div>
              <div className="mb-3">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-navy-900">
                  <span>{route.origin}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-navy-400 flex-shrink-0" />
                  <span>{route.destination}</span>
                </div>
                <div className="text-xs text-navy-400 mt-0.5">{route.carrier}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-navy-100">
                <div>
                  <div className="text-[10px] text-navy-400 uppercase tracking-wide mb-0.5">Rate</div>
                  <div className="text-sm font-bold text-navy-900">{route.rate}</div>
                </div>
                <div>
                  <div className="text-[10px] text-navy-400 uppercase tracking-wide mb-0.5">Transit</div>
                  <div className="text-sm font-bold text-navy-900">{route.transitDays} days</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Back to Proposal */}
      <div className="flex items-center justify-center py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-navy-400 hover:text-ocean-600 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Proposal
        </Link>
      </div>
    </div>
  );
}
