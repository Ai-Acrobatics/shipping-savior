"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import {
  Ship, Package, MapPin, Clock, ChevronRight, ChevronDown,
  AlertTriangle, CheckCircle2, Thermometer, Box, Anchor,
  Shield, Calendar, Search, Filter, ArrowLeft,
  Truck, Globe, BarChart3,
} from "lucide-react";
import {
  dashboardShipments,
  type DashboardShipment,
  type ShipmentStatus,
} from "@/lib/data/dashboard";

// ─── Status Badge ─────────────────────────────────────────────

function StatusBadge({ status }: { status: ShipmentStatus }) {
  const config: Record<ShipmentStatus, { label: string; className: string; icon: typeof Ship }> = {
    "in-transit": { label: "In Transit", className: "bg-ocean-500/20 text-ocean-300 border-ocean-500/30", icon: Ship },
    "at-port": { label: "At Port", className: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: Anchor },
    customs: { label: "Customs", className: "bg-cargo-500/20 text-cargo-300 border-cargo-500/30", icon: Shield },
    delivered: { label: "Delivered", className: "bg-green-500/20 text-green-300 border-green-500/30", icon: CheckCircle2 },
    delayed: { label: "Delayed", className: "bg-red-500/20 text-red-300 border-red-500/30", icon: AlertTriangle },
    booked: { label: "Booked", className: "bg-purple-500/20 text-purple-300 border-purple-500/30", icon: Calendar },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${c.className}`}>
      <c.icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

// ─── Timeline Component ────────────────────────────────────────

function ShipmentTimeline({ shipment }: { shipment: DashboardShipment }) {
  return (
    <div className="space-y-0">
      {shipment.timeline.map((event, idx) => {
        const isLast = idx === shipment.timeline.length - 1;
        const statusColor =
          event.status === "completed" ? "bg-green-500" :
          event.status === "current" ? "bg-ocean-400 animate-pulse" :
          "bg-navy-600";
        const lineColor =
          event.status === "completed" ? "bg-green-500/30" :
          "bg-white/5";

        return (
          <div key={idx} className="flex gap-4 relative">
            {/* Line */}
            {!isLast && (
              <div className={`absolute left-[7px] top-[20px] bottom-0 w-0.5 ${lineColor}`} />
            )}

            {/* Dot */}
            <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${statusColor}`}>
              {event.status === "completed" && (
                <CheckCircle2 className="w-3 h-3 text-white" />
              )}
              {event.status === "current" && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-5 ${event.status === "upcoming" ? "opacity-50" : ""}`}>
              <div className="text-sm font-medium text-white">{event.event}</div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-navy-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </span>
                <span className="text-xs text-navy-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.timestamp}
                </span>
              </div>
              {event.details && (
                <div className="mt-1 text-xs bg-cargo-500/10 text-cargo-300 border border-cargo-500/20 rounded px-2 py-1 inline-block">
                  {event.details}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Temperature Monitor ───────────────────────────────────────

function TemperatureMonitor({ shipment }: { shipment: DashboardShipment }) {
  if (!shipment.temperature) return null;
  const temp = shipment.temperature;
  const isInRange = temp.current >= temp.setPoint - 2 && temp.current <= temp.setPoint + 2;

  // Simple SVG chart for temperature history
  const chartWidth = 260;
  const chartHeight = 60;
  const padding = 4;

  const minVal = Math.min(...temp.history.map((h) => h.value)) - 1;
  const maxVal = Math.max(...temp.history.map((h) => h.value)) + 1;
  const range = maxVal - minVal || 1;

  const points = temp.history.map((h, i) => {
    const x = padding + (i / (temp.history.length - 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - ((h.value - minVal) / range) * (chartHeight - padding * 2);
    return `${x},${y}`;
  }).join(" ");

  const setPointY = chartHeight - padding - ((temp.setPoint - minVal) / range) * (chartHeight - padding * 2);

  return (
    <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white">Temperature Monitor</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          isInRange ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
        }`}>
          {isInRange ? "In Range" : "Out of Range"}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-3">
        <div>
          <div className="text-[10px] text-navy-500">Current</div>
          <div className="text-lg font-bold text-blue-300">{temp.current}°{temp.unit}</div>
        </div>
        <div>
          <div className="text-[10px] text-navy-500">Set Point</div>
          <div className="text-sm font-medium text-white">{temp.setPoint}°{temp.unit}</div>
        </div>
        <div>
          <div className="text-[10px] text-navy-500">Min</div>
          <div className="text-sm font-medium text-white">{temp.min}°{temp.unit}</div>
        </div>
        <div>
          <div className="text-[10px] text-navy-500">Max</div>
          <div className="text-sm font-medium text-white">{temp.max}°{temp.unit}</div>
        </div>
      </div>

      {/* Temperature Chart */}
      <div className="bg-white/5 rounded-lg p-2">
        <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
          {/* Set point line */}
          <line
            x1={padding} y1={setPointY}
            x2={chartWidth - padding} y2={setPointY}
            stroke="#e6a800" strokeWidth="0.5" strokeDasharray="4 2" opacity="0.5"
          />
          {/* Area fill */}
          <polygon
            points={`${padding},${chartHeight - padding} ${points} ${chartWidth - padding},${chartHeight - padding}`}
            fill="url(#tempGrad)" opacity="0.3"
          />
          {/* Line */}
          <polyline
            points={points}
            fill="none" stroke="#3b82f6" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <div className="flex justify-between text-[9px] text-navy-500 mt-1 px-1">
          {temp.history.map((h, i) => (
            <span key={i}>{h.time}</span>
          ))}
        </div>
      </div>

      <div className="text-[10px] text-navy-500 mt-2">
        Last updated: {temp.lastUpdated}
      </div>
    </div>
  );
}

// ─── Route Visualization ────────────────────────────────────────

function RouteVisualization({ shipment }: { shipment: DashboardShipment }) {
  const progressColor =
    shipment.status === "delayed" ? "#ef4444" :
    shipment.status === "delivered" ? "#22c55e" :
    shipment.status === "customs" ? "#e6a800" :
    "#00bcd4";

  return (
    <div className="bg-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-ocean-400" />
        <span className="text-sm font-medium text-white">Route Progress</span>
      </div>

      <div className="relative">
        {/* Route Bar */}
        <div className="flex items-center gap-3 mb-2">
          <div className="text-xs text-navy-300 w-20 text-right truncate">{shipment.originPort}</div>
          <div className="flex-1 relative">
            <div className="w-full bg-white/5 rounded-full h-3">
              <div
                className="h-full rounded-full transition-all relative"
                style={{ width: `${shipment.progress}%`, backgroundColor: progressColor }}
              >
                {/* Ship icon at progress point */}
                <div className="absolute -right-2 -top-1 w-5 h-5 rounded-full bg-navy-900 border-2 flex items-center justify-center"
                  style={{ borderColor: progressColor }}>
                  <Ship className="w-2.5 h-2.5" style={{ color: progressColor }} />
                </div>
              </div>
            </div>
          </div>
          <div className="text-xs text-navy-300 w-20 truncate">{shipment.destPort}</div>
        </div>

        {/* Route Info */}
        <div className="flex items-center justify-between text-xs text-navy-500 mt-1">
          <span>{shipment.origin}</span>
          <span>{shipment.progress}% complete</span>
          <span>{shipment.destination}</span>
        </div>
      </div>

      {/* Vessel Info */}
      {shipment.vessel && (
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-navy-400">
          <span className="flex items-center gap-1">
            <Ship className="w-3 h-3" />
            {shipment.vessel}
          </span>
          {shipment.voyageNumber && (
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {shipment.voyageNumber}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Truck className="w-3 h-3" />
            {shipment.carrier}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main Tracking Page ─────────────────────────────────────────

export default function TrackingPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = dashboardShipments.filter((s) => {
    const matchesSearch = search === "" ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.reference.toLowerCase().includes(search.toLowerCase()) ||
      s.origin.toLowerCase().includes(search.toLowerCase()) ||
      s.destination.toLowerCase().includes(search.toLowerCase()) ||
      s.carrier.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedShipment = selectedId ? dashboardShipments.find((s) => s.id === selectedId) : null;

  const statusCounts = dashboardShipments.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Shipment Tracking</h1>
          <p className="text-sm text-navy-400 mt-1">
            Real-time tracking for all active and completed shipments
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-500" />
          <input
            type="text"
            placeholder="Search by ID, reference, origin, destination, or carrier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-ocean-500/50 focus:bg-white/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 glass rounded-xl p-1 overflow-x-auto">
          {[
            { key: "all", label: "All", count: dashboardShipments.length },
            { key: "in-transit", label: "Transit", count: statusCounts["in-transit"] || 0 },
            { key: "at-port", label: "At Port", count: statusCounts["at-port"] || 0 },
            { key: "customs", label: "Customs", count: statusCounts["customs"] || 0 },
            { key: "delayed", label: "Delayed", count: statusCounts["delayed"] || 0 },
            { key: "delivered", label: "Done", count: statusCounts["delivered"] || 0 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as ShipmentStatus | "all")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                statusFilter === tab.key
                  ? "bg-ocean-500/30 text-ocean-300"
                  : "text-navy-400 hover:text-navy-200"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1 py-0.5 rounded ${
                statusFilter === tab.key ? "bg-ocean-500/30" : "bg-white/5"
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Shipment List */}
        <div className="lg:col-span-2 space-y-2">
          {filtered.length === 0 && (
            <div className="glass rounded-xl p-8 text-center">
              <Search className="w-8 h-8 text-navy-500 mx-auto mb-3" />
              <p className="text-sm text-navy-400">No shipments match your filters</p>
            </div>
          )}
          {filtered.map((shipment) => (
            <div
              key={shipment.id}
              onClick={() => setSelectedId(selectedId === shipment.id ? null : shipment.id)}
              className={`glass rounded-xl p-4 cursor-pointer transition-all ${
                selectedId === shipment.id
                  ? "border-ocean-500/40 bg-ocean-500/5"
                  : "glass-hover"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{shipment.id}</span>
                  {shipment.cargoType === "cold-chain" && (
                    <Thermometer className="w-3 h-3 text-blue-400" />
                  )}
                </div>
                <StatusBadge status={shipment.status} />
              </div>
              <div className="flex items-center gap-1 text-xs text-navy-400 mb-2">
                <MapPin className="w-3 h-3" />
                {shipment.origin}
                <ChevronRight className="w-3 h-3" />
                {shipment.destination}
              </div>

              {/* Mini progress bar */}
              <div className="w-full bg-white/5 rounded-full h-1 mb-2">
                <div
                  className={`h-full rounded-full ${
                    shipment.status === "delayed" ? "bg-red-500" :
                    shipment.status === "delivered" ? "bg-green-500" :
                    "bg-ocean-400"
                  }`}
                  style={{ width: `${shipment.progress}%` }}
                />
              </div>

              <div className="flex items-center gap-3 text-[10px] text-navy-500">
                <span>{shipment.carrier}</span>
                <span>{shipment.containers}x {shipment.containerType}</span>
                <span>ETA: {shipment.eta}</span>
              </div>

              {shipment.alerts.filter((a) => !a.resolved).length > 0 && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-red-300">
                  <AlertTriangle className="w-3 h-3" />
                  {shipment.alerts.filter((a) => !a.resolved).length} active alert{shipment.alerts.filter((a) => !a.resolved).length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-3 space-y-4">
          {!selectedShipment ? (
            <div className="glass rounded-xl p-12 text-center">
              <Ship className="w-12 h-12 text-navy-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-navy-300 mb-2">Select a Shipment</h3>
              <p className="text-sm text-navy-500">
                Click on a shipment from the list to view detailed tracking information,
                timeline, temperature data, and cost breakdown.
              </p>
            </div>
          ) : (
            <>
              {/* Shipment Header */}
              <div className="glass rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-white">{selectedShipment.id}</h2>
                      <StatusBadge status={selectedShipment.status} />
                    </div>
                    <div className="text-sm text-navy-400">
                      {selectedShipment.origin} → {selectedShipment.destination}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{selectedShipment.value}</div>
                    <div className="text-xs text-navy-500">{selectedShipment.weight}</div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Carrier", value: selectedShipment.carrier },
                    { label: "Container", value: `${selectedShipment.containers}x ${selectedShipment.containerType}` },
                    { label: "ETD", value: selectedShipment.etd },
                    { label: "ETA", value: selectedShipment.eta },
                    { label: "Vessel", value: selectedShipment.vessel || "—" },
                    { label: "Voyage", value: selectedShipment.voyageNumber || "—" },
                    { label: "Volume", value: selectedShipment.volume },
                    { label: "Reference", value: selectedShipment.reference },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/5 rounded-lg px-3 py-2">
                      <div className="text-[10px] text-navy-500">{item.label}</div>
                      <div className="text-xs font-medium text-white truncate">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Route Visualization */}
              <RouteVisualization shipment={selectedShipment} />

              {/* Temperature Monitor (cold chain only) */}
              <TemperatureMonitor shipment={selectedShipment} />

              {/* Alerts */}
              {selectedShipment.alerts.filter((a) => !a.resolved).length > 0 && (
                <div className="space-y-2">
                  {selectedShipment.alerts.filter((a) => !a.resolved).map((alert) => (
                    <div
                      key={alert.id}
                      className={`rounded-xl px-4 py-3 flex items-start gap-3 ${
                        alert.severity === "critical"
                          ? "bg-red-500/10 border border-red-500/20"
                          : alert.severity === "warning"
                          ? "bg-cargo-500/10 border border-cargo-500/20"
                          : "bg-ocean-500/10 border border-ocean-500/20"
                      }`}
                    >
                      <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        alert.severity === "critical" ? "text-red-400" :
                        alert.severity === "warning" ? "text-cargo-400" :
                        "text-ocean-400"
                      }`} />
                      <div>
                        <div className={`text-sm font-medium ${
                          alert.severity === "critical" ? "text-red-300" :
                          alert.severity === "warning" ? "text-cargo-300" :
                          "text-ocean-300"
                        }`}>
                          {alert.message}
                        </div>
                        <div className="text-[10px] text-navy-500 mt-1">{alert.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cost Summary */}
              <div className="glass rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-ocean-400" />
                  <h3 className="text-sm font-semibold text-white">Cost Summary</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Freight", value: selectedShipment.costs.freight, color: "text-ocean-400" },
                    { label: "Duty", value: selectedShipment.costs.duty, color: "text-cargo-400" },
                    { label: "Insurance", value: selectedShipment.costs.insurance, color: "text-blue-400" },
                    { label: "Drayage", value: selectedShipment.costs.drayage, color: "text-purple-400" },
                    { label: "Customs", value: selectedShipment.costs.customs, color: "text-pink-400" },
                    { label: "Storage", value: selectedShipment.costs.storage, color: "text-green-400" },
                  ].map((cost) => (
                    <div key={cost.label} className="bg-white/5 rounded-lg px-3 py-2">
                      <div className="text-[10px] text-navy-500">{cost.label}</div>
                      <div className={`text-sm font-medium ${cost.color}`}>
                        ${cost.value.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-3 border-t border-white/5">
                  <div className="flex-1">
                    <div className="text-[10px] text-navy-500">Total</div>
                    <div className="text-lg font-bold text-white">${selectedShipment.costs.total.toLocaleString()}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-navy-500">Per Unit</div>
                    <div className="text-lg font-bold text-ocean-300">${selectedShipment.costs.perUnit}</div>
                  </div>
                  <div className={`flex-1 ${
                    selectedShipment.costs.variance <= 0 ? "" : ""
                  }`}>
                    <div className="text-[10px] text-navy-500">vs Budget</div>
                    <div className={`text-lg font-bold ${
                      selectedShipment.costs.variance <= 0 ? "text-green-400" : "text-red-400"
                    }`}>
                      {selectedShipment.costs.variance > 0 ? "+" : ""}{selectedShipment.costs.variance.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="glass rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-ocean-400" />
                  <h3 className="text-sm font-semibold text-white">Shipment Timeline</h3>
                </div>
                <ShipmentTimeline shipment={selectedShipment} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
