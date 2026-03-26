"use client";

import { useState } from "react";
import { Ship, Anchor, MapPin } from "lucide-react";

interface Port {
  id: string;
  name: string;
  city: string;
  country: string;
  type: "origin" | "transshipment" | "destination" | "ftz";
  x: number; // SVG percentage
  y: number;
}

interface Route {
  id: string;
  from: string;
  to: string;
  label: string;
  transitDays: number;
  costPerTEU: number;
  type: "direct" | "transship";
  color: string;
}

const ports: Port[] = [
  // SE Asia Origins
  { id: "sgn", name: "Ho Chi Minh", city: "Ho Chi Minh", country: "Vietnam", type: "origin", x: 72, y: 54 },
  { id: "bkk", name: "Bangkok", city: "Bangkok", country: "Thailand", type: "origin", x: 68, y: 52 },
  { id: "cgk", name: "Jakarta", city: "Jakarta", country: "Indonesia", type: "origin", x: 74, y: 64 },
  { id: "pnh", name: "Phnom Penh", city: "Phnom Penh", country: "Cambodia", type: "origin", x: 70, y: 53 },

  // Transshipment Hubs
  { id: "sin", name: "Singapore", city: "Singapore", country: "Singapore", type: "transshipment", x: 72, y: 62 },
  { id: "por", name: "Port Klang", city: "Port Klang", country: "Malaysia", type: "transshipment", x: 70, y: 60 },

  // US Destinations
  { id: "lax", name: "Los Angeles", city: "Los Angeles", country: "USA", type: "destination", x: 16, y: 42 },
  { id: "lbc", name: "Long Beach", city: "Long Beach", country: "USA", type: "destination", x: 16, y: 44 },
  { id: "sea", name: "Seattle", city: "Seattle", country: "USA", type: "destination", x: 14, y: 36 },
  { id: "hou", name: "Houston", city: "Houston", country: "USA", type: "destination", x: 22, y: 46 },

  // FTZ Markers
  { id: "ftz_la", name: "FTZ #202", city: "Los Angeles", country: "USA", type: "ftz", x: 17, y: 42 },
  { id: "ftz_sea", name: "FTZ #86", city: "Seattle", country: "USA", type: "ftz", x: 15, y: 36 },
];

const routes: Route[] = [
  {
    id: "sgn-lax",
    from: "sgn",
    to: "lax",
    label: "SGN → LAX",
    transitDays: 24,
    costPerTEU: 2800,
    type: "direct",
    color: "#00bcd4",
  },
  {
    id: "bkk-lbc",
    from: "bkk",
    to: "lbc",
    label: "BKK → LBC",
    transitDays: 22,
    costPerTEU: 2600,
    type: "direct",
    color: "#1adbff",
  },
  {
    id: "cgk-sin-lax",
    from: "cgk",
    to: "lax",
    label: "CGK → SIN → LAX",
    transitDays: 28,
    costPerTEU: 3100,
    type: "transship",
    color: "#ffc81a",
  },
  {
    id: "sgn-sea",
    from: "sgn",
    to: "sea",
    label: "SGN → SEA",
    transitDays: 20,
    costPerTEU: 2500,
    type: "direct",
    color: "#4de3ff",
  },
];

function getPortById(id: string): Port | undefined {
  return ports.find((p) => p.id === id);
}

export default function ShippingRouteMap() {
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  const [hoveredPort, setHoveredPort] = useState<string | null>(null);

  const activeRouteData = activeRoute ? routes.find((r) => r.id === activeRoute) : null;

  const portTypeConfig = {
    origin: { color: "#ffc81a", label: "Origin Port", size: 8 },
    transshipment: { color: "#a855f7", label: "Transshipment Hub", size: 7 },
    destination: { color: "#00bcd4", label: "US Destination Port", size: 8 },
    ftz: { color: "#22c55e", label: "FTZ Zone", size: 5 },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-navy-100 flex items-center gap-2">
          <Ship className="w-5 h-5 text-ocean-400" />
          SE Asia → US Shipping Routes
        </h3>
        <div className="flex items-center gap-4 text-xs text-navy-400">
          {Object.entries(portTypeConfig).map(([type, cfg]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div
                className="rounded-full"
                style={{ width: 8, height: 8, background: cfg.color }}
              />
              <span>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Route selector */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveRoute(null)}
          className={`text-xs px-3 py-1.5 rounded-full transition-all ${
            activeRoute === null
              ? "bg-ocean-600 text-white"
              : "glass text-navy-300 hover:text-white"
          }`}
        >
          All Routes
        </button>
        {routes.map((route) => (
          <button
            key={route.id}
            onClick={() => setActiveRoute(activeRoute === route.id ? null : route.id)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              activeRoute === route.id
                ? "text-white"
                : "glass text-navy-300 hover:text-white"
            }`}
            style={
              activeRoute === route.id
                ? { backgroundColor: route.color + "33", borderColor: route.color, border: "1px solid" }
                : {}
            }
          >
            {route.label}
            {route.type === "transship" && (
              <span className="ml-1 text-yellow-400">⟳</span>
            )}
          </button>
        ))}
      </div>

      {/* SVG Map */}
      <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: "52%" }}>
        <svg
          viewBox="0 0 100 52"
          className="absolute inset-0 w-full h-full"
          style={{ background: "linear-gradient(135deg, #020a17 0%, #04132b 50%, #020a17 100%)" }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Ocean / background texture */}
          <defs>
            <radialGradient id="pacificGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#003b5c" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#020a17" stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="0.3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Pacific glow */}
          <rect x="0" y="0" width="100" height="52" fill="url(#pacificGlow)" />

          {/* Grid lines (latitude/longitude) */}
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="52" stroke="#ffffff" strokeOpacity="0.03" strokeWidth="0.1" />
          ))}
          {[10, 20, 30, 40, 50].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="#ffffff" strokeOpacity="0.03" strokeWidth="0.1" />
          ))}

          {/* Continent shapes (simplified) */}
          {/* North America west coast */}
          <path
            d="M 8 20 L 10 25 L 11 30 L 13 35 L 14 40 L 15 45 L 18 48 L 20 50 L 15 52 L 0 52 L 0 20 Z"
            fill="#1a2744"
            opacity="0.7"
          />
          {/* Asia east coast (simplified) */}
          <path
            d="M 100 0 L 100 52 L 80 52 L 78 48 L 75 45 L 73 40 L 70 35 L 68 30 L 65 25 L 67 20 L 70 15 L 75 10 L 80 5 L 85 0 Z"
            fill="#1a2744"
            opacity="0.7"
          />

          {/* Route lines */}
          {routes.map((route) => {
            const from = getPortById(route.from);
            const to = getPortById(route.to);
            if (!from || !to) return null;

            const isActive = activeRoute === null || activeRoute === route.id;
            const opacity = isActive ? 1 : 0.15;

            // Curve path across Pacific (arc)
            const midX = (from.x + to.x) / 2;
            const midY = Math.min(from.y, to.y) - 12; // arc upward

            return (
              <g key={route.id} opacity={opacity}>
                <path
                  d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
                  stroke={route.color}
                  strokeWidth={activeRoute === route.id ? "0.6" : "0.3"}
                  fill="none"
                  strokeDasharray={route.type === "transship" ? "1,0.5" : "none"}
                  filter="url(#glow)"
                />
                {/* Animated ship dot */}
                {activeRoute === route.id && (
                  <circle r="0.8" fill={route.color} opacity="0.9">
                    <animateMotion
                      dur="4s"
                      repeatCount="indefinite"
                      path={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Port markers */}
          {ports.map((port) => {
            const cfg = portTypeConfig[port.type];
            const isHovered = hoveredPort === port.id;

            return (
              <g
                key={port.id}
                onMouseEnter={() => setHoveredPort(port.id)}
                onMouseLeave={() => setHoveredPort(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Pulse ring on hover */}
                {isHovered && (
                  <circle
                    cx={port.x}
                    cy={port.y}
                    r={cfg.size * 0.14 + 1.5}
                    fill="none"
                    stroke={cfg.color}
                    strokeWidth="0.2"
                    opacity="0.5"
                  />
                )}
                <circle
                  cx={port.x}
                  cy={port.y}
                  r={cfg.size * 0.1}
                  fill={cfg.color}
                  opacity={isHovered ? 1 : 0.8}
                  filter="url(#glow)"
                />
                {/* Label */}
                {port.type !== "ftz" && (
                  <text
                    x={port.x}
                    y={port.y - 1.2}
                    textAnchor="middle"
                    fontSize="1.2"
                    fill="white"
                    opacity="0.7"
                    style={{ pointerEvents: "none" }}
                  >
                    {port.id.toUpperCase()}
                  </text>
                )}
              </g>
            );
          })}

          {/* Hovered port tooltip */}
          {hoveredPort && (() => {
            const port = getPortById(hoveredPort);
            if (!port) return null;
            const cfg = portTypeConfig[port.type];
            const tooltipX = port.x > 50 ? port.x - 20 : port.x + 2;
            return (
              <g>
                <rect
                  x={tooltipX}
                  y={port.y - 6}
                  width="18"
                  height="6"
                  rx="0.5"
                  fill="#04132b"
                  stroke={cfg.color}
                  strokeWidth="0.15"
                  opacity="0.95"
                />
                <text x={tooltipX + 1} y={port.y - 3.5} fontSize="1.4" fill={cfg.color} fontWeight="bold">
                  {port.name}
                </text>
                <text x={tooltipX + 1} y={port.y - 1.5} fontSize="1.1" fill="#90b3ff">
                  {port.country} — {cfg.label}
                </text>
              </g>
            );
          })()}

          {/* Labels */}
          <text x="44" y="28" textAnchor="middle" fontSize="2" fill="#ffffff" opacity="0.12" fontStyle="italic">
            Pacific Ocean
          </text>
          <text x="15" y="33" textAnchor="middle" fontSize="1.5" fill="#ffffff" opacity="0.15">
            USA
          </text>
          <text x="73" y="45" textAnchor="middle" fontSize="1.5" fill="#ffffff" opacity="0.15">
            SE Asia
          </text>
        </svg>
      </div>

      {/* Active route details */}
      {activeRouteData && (
        <div
          className="glass rounded-xl p-4 border"
          style={{ borderColor: activeRouteData.color + "40" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ background: activeRouteData.color }} />
              <span className="font-semibold text-white">{activeRouteData.label}</span>
              {activeRouteData.type === "transship" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300">
                  Transshipment
                </span>
              )}
            </div>
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <div className="text-xs text-navy-400">Transit Time</div>
                <div className="font-semibold text-ocean-300">{activeRouteData.transitDays} days</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-navy-400">Cost/TEU</div>
                <div className="font-semibold text-cargo-300">${activeRouteData.costPerTEU.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-navy-500 text-center">
        Hover ports for details. Click routes to trace paths and view transit data. All rates indicative.
      </p>
    </div>
  );
}
