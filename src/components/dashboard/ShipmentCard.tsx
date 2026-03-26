"use client";

import {
  Ship, Package, Clock, DollarSign, MapPin, ChevronRight,
  AlertTriangle, CheckCircle2, Thermometer, Box, Anchor,
  Shield, Calendar, BarChart3, Download,
} from "lucide-react";
import type { DashboardShipment, ShipmentStatus, CargoType } from "@/lib/data/dashboard";

// ─── Sub-components ─────────────────────────────────────────

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
    status === "booked" ? "bg-purple-500" :
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

// ─── Main ShipmentCard ──────────────────────────────────────

export default function ShipmentCard({
  shipment,
  selected,
  onSelect,
  compact = false,
}: {
  shipment: DashboardShipment;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  return (
    <div
      onClick={onSelect}
      className={`glass rounded-xl p-5 cursor-pointer transition-all ${
        selected
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
          <span>{(shipment as any).currentLocation}</span>
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

      {/* Temperature (cold chain) */}
      {shipment.temperature && !compact && (
        <div className="mt-3 flex items-center gap-3 text-xs bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
          <Thermometer className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span className="text-blue-300 font-medium">{shipment.temperature.current}°{shipment.temperature.unit}</span>
          <span className="text-navy-500">Set: {shipment.temperature.setPoint}°{shipment.temperature.unit}</span>
          <span className="text-navy-500">Updated: {shipment.temperature.lastUpdated}</span>
        </div>
      )}

      {/* Alerts */}
      {shipment.alerts.filter((a) => !a.resolved).map((alert) => (
        <div
          key={alert.id}
          className={`mt-3 flex items-center gap-2 text-xs rounded-lg px-3 py-2 ${
            alert.severity === "critical"
              ? "bg-red-500/10 text-red-300 border border-red-500/20"
              : alert.severity === "warning"
              ? "bg-cargo-500/10 text-cargo-300 border border-cargo-500/20"
              : "bg-ocean-500/10 text-ocean-300 border border-ocean-500/20"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {alert.message}
        </div>
      ))}

      {/* Expanded Detail */}
      {selected && !compact && (
        <div className="mt-4 pt-4 border-t border-white/5">
          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { label: "Reference", value: shipment.reference },
              { label: "Weight", value: shipment.weight },
              { label: "Volume", value: shipment.volume },
              { label: "Container", value: `${shipment.containers}x ${shipment.containerType}` },
              { label: "Vessel", value: shipment.vessel || "—" },
              { label: "Voyage", value: shipment.voyageNumber || "—" },
              { label: "ETD", value: shipment.etd },
              { label: "Total Cost", value: `$${shipment.costs.total.toLocaleString()}` },
            ].map((detail) => (
              <div key={detail.label}>
                <div className="text-xs text-navy-500 mb-1">{detail.label}</div>
                <div className="text-sm font-medium text-white">{detail.value}</div>
              </div>
            ))}
          </div>

          {/* Cost Variance */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 bg-white/5 rounded-lg px-3 py-2">
              <div className="text-[10px] text-navy-500">Budget</div>
              <div className="text-sm font-medium text-white">${(shipment.costs.budgeted ?? shipment.costs.total).toLocaleString()}</div>
            </div>
            <div className="flex-1 bg-white/5 rounded-lg px-3 py-2">
              <div className="text-[10px] text-navy-500">Actual</div>
              <div className="text-sm font-medium text-white">${shipment.costs.total.toLocaleString()}</div>
            </div>
            <div className={`flex-1 rounded-lg px-3 py-2 ${
              shipment.costs.variance <= 0
                ? "bg-green-500/10 border border-green-500/20"
                : "bg-red-500/10 border border-red-500/20"
            }`}>
              <div className="text-[10px] text-navy-500">Variance</div>
              <div className={`text-sm font-medium ${
                shipment.costs.variance <= 0 ? "text-green-400" : "text-red-400"
              }`}>
                {shipment.costs.variance > 0 ? "+" : ""}{shipment.costs.variance.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
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
  );
}

export { StatusBadge, CargoBadge, ProgressBar };
