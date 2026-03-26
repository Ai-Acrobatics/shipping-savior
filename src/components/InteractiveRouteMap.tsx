"use client";

import { useState, useMemo } from "react";
import { Ship, Anchor, MapPin, Navigation } from "lucide-react";
import { ROUTES, getRoutePorts, type RouteSegment } from "@/lib/data/routes";
import { PORTS } from "@/lib/data/ports";
import type { Port } from "@/lib/types";

// ─── Mercator Projection ─────────────────────────────────────
// Convert lat/lng to SVG coordinates on a 1000x500 viewBox

function toSVG(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * 1000;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = 250 - (mercN / Math.PI) * 250;
  return { x, y };
}

// Great circle midpoint (simplified — use bezier control for visual arc)
function arcControl(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): { x: number; y: number } {
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  const dx = Math.abs(p2.x - p1.x);
  // Arc curves upward more for longer routes
  const arcHeight = Math.min(dx * 0.2, 80);
  return { x: midX, y: midY - arcHeight };
}

// ─── Port marker colors ──────────────────────────────────────

const roleColors: Record<string, string> = {
  origin: "#ffc81a",
  destination: "#00bcd4",
  transshipment: "#a855f7",
  both: "#22c55e",
};

const roleLabels: Record<string, string> = {
  origin: "Origin",
  destination: "Destination",
  transshipment: "Transshipment Hub",
  both: "Origin/Hub",
};

// ─── Route colors by carrier ─────────────────────────────────

const carrierColors: Record<string, string> = {
  Evergreen: "#22c55e",
  MSC: "#3b82f6",
  COSCO: "#ef4444",
  Maersk: "#00bcd4",
  ONE: "#f97316",
  "Yang Ming": "#a855f7",
};

function getCarrierColor(carrier: string): string {
  return carrierColors[carrier] || "#6b7280";
}

// ─── Component ───────────────────────────────────────────────

interface Props {
  className?: string;
}

export default function InteractiveRouteMap({ className = "" }: Props) {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [hoveredPort, setHoveredPort] = useState<string | null>(null);
  const [filterCarrier, setFilterCarrier] = useState<string | null>(null);
  const [filterDest, setFilterDest] = useState<string | null>(null);

  // Only show seaports relevant to our routes
  const relevantPorts = useMemo(() => {
    const codes = new Set<string>();
    ROUTES.forEach((r) => {
      codes.add(r.originCode);
      codes.add(r.destCode);
      if (r.transshipmentCode) codes.add(r.transshipmentCode);
    });
    return PORTS.filter((p) => codes.has(p.unlocode) && p.type === "seaport");
  }, []);

  const filteredRoutes = useMemo(() => {
    return ROUTES.filter((r) => {
      if (filterCarrier && r.carrier !== filterCarrier) return false;
      if (filterDest && r.destCode !== filterDest) return false;
      return true;
    });
  }, [filterCarrier, filterDest]);

  const carriers = useMemo(
    () => Array.from(new Set(ROUTES.map((r) => r.carrier))).sort(),
    []
  );

  const destPorts = useMemo(
    () =>
      Array.from(new Set(ROUTES.map((r) => r.destCode)))
        .map((code) => PORTS.find((p) => p.unlocode === code))
        .filter(Boolean) as Port[],
    []
  );

  const activeRoute = selectedRoute
    ? ROUTES.find((r) => r.id === selectedRoute)
    : null;

  // Viewport: focus on Pacific (roughly -130 to 130 lng, -10 to 55 lat)
  // We'll use a custom viewport clipping
  const viewMinX = toSVG(0, -140).x;
  const viewMaxX = toSVG(0, 135).x;
  const viewMinY = toSVG(55, 0).y;
  const viewMaxY = toSVG(-15, 0).y;
  const vw = viewMaxX - viewMinX;
  const vh = viewMaxY - viewMinY;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header + Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-navy-100 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-ocean-400" />
          Global Shipping Routes
        </h3>
        <div className="flex items-center gap-4 text-xs text-navy-400">
          {Object.entries(roleLabels).map(([role, label]) => (
            <div key={role} className="flex items-center gap-1.5">
              <div
                className="rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  background: roleColors[role],
                }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {/* Carrier filter */}
        <button
          onClick={() => {
            setFilterCarrier(null);
            setSelectedRoute(null);
          }}
          className={`text-xs px-3 py-1.5 rounded-full transition-all ${
            !filterCarrier
              ? "bg-ocean-600 text-white"
              : "glass text-navy-300 hover:text-white"
          }`}
        >
          All Carriers
        </button>
        {carriers.map((c) => (
          <button
            key={c}
            onClick={() => {
              setFilterCarrier(filterCarrier === c ? null : c);
              setSelectedRoute(null);
            }}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              filterCarrier === c
                ? "text-white"
                : "glass text-navy-300 hover:text-white"
            }`}
            style={
              filterCarrier === c
                ? {
                    backgroundColor: getCarrierColor(c) + "30",
                    border: `1px solid ${getCarrierColor(c)}`,
                  }
                : {}
            }
          >
            {c}
          </button>
        ))}

        <div className="w-px bg-white/10 mx-1" />

        {/* Destination filter */}
        <button
          onClick={() => {
            setFilterDest(null);
            setSelectedRoute(null);
          }}
          className={`text-xs px-3 py-1.5 rounded-full transition-all ${
            !filterDest
              ? "bg-cargo-600 text-white"
              : "glass text-navy-300 hover:text-white"
          }`}
        >
          All Destinations
        </button>
        {destPorts.map((p) => (
          <button
            key={p.unlocode}
            onClick={() => {
              setFilterDest(filterDest === p.unlocode ? null : p.unlocode);
              setSelectedRoute(null);
            }}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              filterDest === p.unlocode
                ? "bg-ocean-500/30 text-ocean-300 border border-ocean-500/40"
                : "glass text-navy-300 hover:text-white"
            }`}
          >
            {p.city}
          </button>
        ))}
      </div>

      {/* SVG Map */}
      <div
        className="relative w-full overflow-hidden rounded-xl"
        style={{ paddingBottom: `${(vh / vw) * 100}%` }}
      >
        <svg
          viewBox={`${viewMinX} ${viewMinY} ${vw} ${vh}`}
          className="absolute inset-0 w-full h-full"
          style={{
            background:
              "linear-gradient(135deg, #020a17 0%, #04132b 50%, #020a17 100%)",
          }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="mapGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#003b5c" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#020a17" stopOpacity="0" />
            </radialGradient>
            <filter id="portGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="lineGlow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect
            x={viewMinX}
            y={viewMinY}
            width={vw}
            height={vh}
            fill="url(#mapGlow)"
          />

          {/* Grid lines */}
          {Array.from({ length: 20 }, (_, i) => {
            const lng = -140 + i * 15;
            const { x } = toSVG(0, lng);
            return (
              <line
                key={`vg${i}`}
                x1={x}
                y1={viewMinY}
                x2={x}
                y2={viewMaxY}
                stroke="#ffffff"
                strokeOpacity="0.03"
                strokeWidth="0.5"
              />
            );
          })}
          {Array.from({ length: 8 }, (_, i) => {
            const lat = -10 + i * 10;
            const { y } = toSVG(lat, 0);
            return (
              <line
                key={`hg${i}`}
                x1={viewMinX}
                y1={y}
                x2={viewMaxX}
                y2={y}
                stroke="#ffffff"
                strokeOpacity="0.03"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Simplified continent shapes */}
          {/* North America (west coast outline) */}
          <path
            d={`M ${toSVG(60, -140).x} ${toSVG(60, -140).y}
                L ${toSVG(48, -125).x} ${toSVG(48, -125).y}
                L ${toSVG(42, -124).x} ${toSVG(42, -124).y}
                L ${toSVG(35, -120).x} ${toSVG(35, -120).y}
                L ${toSVG(32, -117).x} ${toSVG(32, -117).y}
                L ${toSVG(25, -110).x} ${toSVG(25, -110).y}
                L ${toSVG(20, -105).x} ${toSVG(20, -105).y}
                L ${toSVG(25, -80).x} ${toSVG(25, -80).y}
                L ${toSVG(30, -81).x} ${toSVG(30, -81).y}
                L ${toSVG(35, -75).x} ${toSVG(35, -75).y}
                L ${toSVG(40, -74).x} ${toSVG(40, -74).y}
                L ${toSVG(45, -67).x} ${toSVG(45, -67).y}
                L ${toSVG(60, -60).x} ${toSVG(60, -60).y}
                L ${toSVG(60, -140).x} ${toSVG(60, -140).y} Z`}
            fill="#1a2744"
            opacity="0.6"
          />
          {/* East Asia outline */}
          <path
            d={`M ${toSVG(55, 100).x} ${toSVG(55, 100).y}
                L ${toSVG(50, 130).x} ${toSVG(50, 130).y}
                L ${toSVG(40, 125).x} ${toSVG(40, 125).y}
                L ${toSVG(35, 120).x} ${toSVG(35, 120).y}
                L ${toSVG(25, 120).x} ${toSVG(25, 120).y}
                L ${toSVG(22, 115).x} ${toSVG(22, 115).y}
                L ${toSVG(20, 110).x} ${toSVG(20, 110).y}
                L ${toSVG(12, 105).x} ${toSVG(12, 105).y}
                L ${toSVG(1, 104).x} ${toSVG(1, 104).y}
                L ${toSVG(-6, 107).x} ${toSVG(-6, 107).y}
                L ${toSVG(-8, 115).x} ${toSVG(-8, 115).y}
                L ${toSVG(-8, 135).x} ${toSVG(-8, 135).y}
                L ${toSVG(55, 135).x} ${toSVG(55, 135).y}
                L ${toSVG(55, 100).x} ${toSVG(55, 100).y} Z`}
            fill="#1a2744"
            opacity="0.6"
          />

          {/* Route lines */}
          {filteredRoutes.map((route) => {
            const { origin, dest, transshipment } = getRoutePorts(route);
            if (!origin || !dest) return null;

            const p1 = toSVG(origin.lat, origin.lng);
            const p2 = toSVG(dest.lat, dest.lng);

            // Handle Pacific crossing (wrap-around)
            // If origin is in Asia (lng > 0) and dest in Americas (lng < 0),
            // route goes eastward across Pacific — we need to handle the wrap
            const isActive =
              selectedRoute === null || selectedRoute === route.id;
            const opacity = isActive ? (selectedRoute === route.id ? 1 : 0.6) : 0.1;
            const color = getCarrierColor(route.carrier);
            const strokeW = selectedRoute === route.id ? 2.5 : 1.2;

            if (transshipment) {
              // Two-segment route via transshipment
              const pT = toSVG(transshipment.lat, transshipment.lng);
              const ctrl1 = arcControl(p1, pT);
              const ctrl2 = arcControl(pT, p2);
              return (
                <g key={route.id} opacity={opacity}>
                  <path
                    d={`M ${p1.x} ${p1.y} Q ${ctrl1.x} ${ctrl1.y} ${pT.x} ${pT.y}`}
                    stroke={color}
                    strokeWidth={strokeW}
                    fill="none"
                    strokeDasharray="6,3"
                    filter="url(#lineGlow)"
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedRoute(
                        selectedRoute === route.id ? null : route.id
                      )
                    }
                  />
                  <path
                    d={`M ${pT.x} ${pT.y} Q ${ctrl2.x} ${ctrl2.y} ${p2.x} ${p2.y}`}
                    stroke={color}
                    strokeWidth={strokeW}
                    fill="none"
                    strokeDasharray="6,3"
                    filter="url(#lineGlow)"
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedRoute(
                        selectedRoute === route.id ? null : route.id
                      )
                    }
                  />
                  {selectedRoute === route.id && (
                    <>
                      <circle r="4" fill={color} opacity="0.9">
                        <animateMotion
                          dur="3s"
                          repeatCount="indefinite"
                          path={`M ${p1.x} ${p1.y} Q ${ctrl1.x} ${ctrl1.y} ${pT.x} ${pT.y}`}
                        />
                      </circle>
                      <circle r="4" fill={color} opacity="0.9">
                        <animateMotion
                          dur="4s"
                          repeatCount="indefinite"
                          path={`M ${pT.x} ${pT.y} Q ${ctrl2.x} ${ctrl2.y} ${p2.x} ${p2.y}`}
                        />
                      </circle>
                    </>
                  )}
                </g>
              );
            }

            const ctrl = arcControl(p1, p2);
            return (
              <g key={route.id} opacity={opacity}>
                <path
                  d={`M ${p1.x} ${p1.y} Q ${ctrl.x} ${ctrl.y} ${p2.x} ${p2.y}`}
                  stroke={color}
                  strokeWidth={strokeW}
                  fill="none"
                  filter="url(#lineGlow)"
                  className="cursor-pointer"
                  onClick={() =>
                    setSelectedRoute(
                      selectedRoute === route.id ? null : route.id
                    )
                  }
                />
                {selectedRoute === route.id && (
                  <circle r="4" fill={color} opacity="0.9">
                    <animateMotion
                      dur="5s"
                      repeatCount="indefinite"
                      path={`M ${p1.x} ${p1.y} Q ${ctrl.x} ${ctrl.y} ${p2.x} ${p2.y}`}
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Port markers */}
          {relevantPorts.map((port) => {
            const pos = toSVG(port.lat, port.lng);
            const color = roleColors[port.role] || "#6b7280";
            const isHovered = hoveredPort === port.unlocode;
            const r = port.tier === 1 ? 5 : port.tier === 2 ? 4 : 3;

            return (
              <g
                key={port.unlocode}
                onMouseEnter={() => setHoveredPort(port.unlocode)}
                onMouseLeave={() => setHoveredPort(null)}
                className="cursor-pointer"
              >
                {isHovered && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={r + 6}
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    opacity="0.4"
                  >
                    <animate
                      attributeName="r"
                      from={r + 3}
                      to={r + 10}
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.4"
                      to="0"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r}
                  fill={color}
                  opacity={isHovered ? 1 : 0.85}
                  filter="url(#portGlow)"
                />
                <text
                  x={pos.x}
                  y={pos.y - r - 4}
                  textAnchor="middle"
                  fontSize="8"
                  fill="white"
                  opacity="0.6"
                  style={{ pointerEvents: "none" }}
                >
                  {port.city}
                </text>
              </g>
            );
          })}

          {/* Port tooltip */}
          {hoveredPort &&
            (() => {
              const port = PORTS.find((p) => p.unlocode === hoveredPort);
              if (!port) return null;
              const pos = toSVG(port.lat, port.lng);
              const color = roleColors[port.role] || "#6b7280";
              const tooltipW = 130;
              const tooltipX =
                pos.x > (viewMinX + vw / 2) ? pos.x - tooltipW - 10 : pos.x + 10;
              return (
                <g style={{ pointerEvents: "none" }}>
                  <rect
                    x={tooltipX}
                    y={pos.y - 30}
                    width={tooltipW}
                    height="42"
                    rx="4"
                    fill="#04132b"
                    stroke={color}
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text
                    x={tooltipX + 6}
                    y={pos.y - 14}
                    fontSize="9"
                    fill={color}
                    fontWeight="bold"
                  >
                    {port.name.length > 22
                      ? port.name.slice(0, 22) + "..."
                      : port.name}
                  </text>
                  <text
                    x={tooltipX + 6}
                    y={pos.y - 2}
                    fontSize="8"
                    fill="#90b3ff"
                  >
                    {roleLabels[port.role] || port.role} | Tier {port.tier}
                  </text>
                  <text
                    x={tooltipX + 6}
                    y={pos.y + 9}
                    fontSize="7"
                    fill="#5c8dff"
                  >
                    {port.congestionLevel} congestion | {port.freeDays} free
                    days
                  </text>
                </g>
              );
            })()}

          {/* Ocean labels */}
          <text
            x={(toSVG(0, -180).x + toSVG(0, 180).x) / 2}
            y={toSVG(20, 0).y}
            textAnchor="middle"
            fontSize="14"
            fill="#ffffff"
            opacity="0.08"
            fontStyle="italic"
          >
            Pacific Ocean
          </text>
        </svg>
      </div>

      {/* Selected route detail card */}
      {activeRoute && (() => {
        const { origin, dest, transshipment } = getRoutePorts(activeRoute);
        const color = getCarrierColor(activeRoute.carrier);
        return (
          <div
            className="glass rounded-xl p-5 border"
            style={{ borderColor: color + "40" }}
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: color }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {origin?.city} → {dest?.city}
                    </span>
                    {!activeRoute.direct && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                        via {transshipment?.city}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-navy-400 mt-0.5">
                    {activeRoute.carrier} — {activeRoute.serviceRoute} |{" "}
                    {activeRoute.frequency}
                  </div>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className="text-xs text-navy-400">Transit</div>
                  <div className="font-semibold text-ocean-300">
                    {activeRoute.transitDays.min}–{activeRoute.transitDays.max} days
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-navy-400">Cost/TEU</div>
                  <div className="font-semibold text-cargo-300">
                    ${activeRoute.costPerTEU.toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-navy-400">Reliability</div>
                  <div
                    className={`font-semibold ${
                      activeRoute.reliability >= 90
                        ? "text-green-400"
                        : activeRoute.reliability >= 85
                        ? "text-yellow-300"
                        : "text-red-400"
                    }`}
                  >
                    {activeRoute.reliability}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-navy-400">Backhaul</div>
                  <div className="font-semibold text-purple-300">
                    {activeRoute.backhaulDiscount}% off
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Route list */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredRoutes.map((route) => {
          const { origin, dest } = getRoutePorts(route);
          const color = getCarrierColor(route.carrier);
          const isSelected = selectedRoute === route.id;

          return (
            <button
              key={route.id}
              onClick={() =>
                setSelectedRoute(isSelected ? null : route.id)
              }
              className={`glass rounded-xl p-3 text-left transition-all ${
                isSelected
                  ? "bg-white/5 border-white/20"
                  : "glass-hover"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: color }}
                />
                <span className="text-xs font-medium text-white truncate">
                  {origin?.city} → {dest?.city}
                </span>
                {!route.direct && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    TS
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-navy-400">
                <span style={{ color }}>{route.carrier}</span>
                <div className="flex gap-3">
                  <span>{route.transitDays.min}–{route.transitDays.max}d</span>
                  <span className="text-cargo-400">
                    ${route.costPerTEU.toLocaleString()}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-navy-500 text-center">
        {filteredRoutes.length} routes shown. Click routes on the map or cards
        to view details. Rates are indicative spot-market averages.
      </p>
    </div>
  );
}
