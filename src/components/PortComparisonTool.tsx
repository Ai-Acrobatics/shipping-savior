"use client";

import { useState } from "react";
import { Anchor, Clock, DollarSign, TrendingUp, Info } from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface PortData {
  id: string;
  name: string;
  code: string;
  state: string;
  annualTEU: string;
  avgDwellDays: number;
  demurragePerDay: number;
  detentionPerDay: number;
  drayageCost: number;
  ftzNearby: boolean;
  ftzName: string;
  coldChain: boolean;
  congestionRisk: "Low" | "Medium" | "High";
  scores: {
    cost: number;
    speed: number;
    capacity: number;
    infrastructure: number;
    ftzAccess: number;
  };
}

const portsData: PortData[] = [
  {
    id: "lax",
    name: "Los Angeles",
    code: "LAX",
    state: "CA",
    annualTEU: "9.9M",
    avgDwellDays: 3.5,
    demurragePerDay: 325,
    detentionPerDay: 175,
    drayageCost: 550,
    ftzNearby: true,
    ftzName: "FTZ #202",
    coldChain: true,
    congestionRisk: "High",
    scores: { cost: 55, speed: 70, capacity: 95, infrastructure: 90, ftzAccess: 85 },
  },
  {
    id: "lbc",
    name: "Long Beach",
    code: "LBC",
    state: "CA",
    annualTEU: "8.1M",
    avgDwellDays: 3.2,
    demurragePerDay: 300,
    detentionPerDay: 160,
    drayageCost: 500,
    ftzNearby: true,
    ftzName: "FTZ #50",
    coldChain: true,
    congestionRisk: "High",
    scores: { cost: 60, speed: 75, capacity: 90, infrastructure: 88, ftzAccess: 88 },
  },
  {
    id: "sea",
    name: "Seattle/Tacoma",
    code: "SEA",
    state: "WA",
    annualTEU: "3.5M",
    avgDwellDays: 2.1,
    demurragePerDay: 210,
    detentionPerDay: 120,
    drayageCost: 380,
    ftzNearby: true,
    ftzName: "FTZ #86",
    coldChain: true,
    congestionRisk: "Low",
    scores: { cost: 80, speed: 90, capacity: 70, infrastructure: 80, ftzAccess: 90 },
  },
  {
    id: "hou",
    name: "Houston",
    code: "HOU",
    state: "TX",
    annualTEU: "2.9M",
    avgDwellDays: 2.4,
    demurragePerDay: 180,
    detentionPerDay: 110,
    drayageCost: 420,
    ftzNearby: true,
    ftzName: "FTZ #84",
    coldChain: false,
    congestionRisk: "Medium",
    scores: { cost: 85, speed: 85, capacity: 65, infrastructure: 72, ftzAccess: 80 },
  },
  {
    id: "sav",
    name: "Savannah",
    code: "SAV",
    state: "GA",
    annualTEU: "5.6M",
    avgDwellDays: 2.0,
    demurragePerDay: 200,
    detentionPerDay: 115,
    drayageCost: 360,
    ftzNearby: true,
    ftzName: "FTZ #144",
    coldChain: false,
    congestionRisk: "Medium",
    scores: { cost: 88, speed: 92, capacity: 75, infrastructure: 78, ftzAccess: 78 },
  },
];

const congestionColors = {
  Low: "text-green-400 bg-green-400/10",
  Medium: "text-yellow-400 bg-yellow-400/10",
  High: "text-red-400 bg-red-400/10",
};

interface RadarTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function RadarTooltip({ active, payload, label }: RadarTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg p-2 border border-white/20 text-xs">
      <div className="text-white font-medium">{label}</div>
      <div className="text-ocean-300">{payload[0].value}/100</div>
    </div>
  );
}

export default function PortComparisonTool() {
  const [selectedPorts, setSelectedPorts] = useState<string[]>(["sea", "lax"]);
  const [radarPort, setRadarPort] = useState<string>("sea");

  const togglePort = (id: string) => {
    setSelectedPorts((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((p) => p !== id)
          : prev
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
  };

  const selectedPortData = portsData.filter((p) => selectedPorts.includes(p.id));
  const radarPortData = portsData.find((p) => p.id === radarPort);

  const radarChartData = radarPortData
    ? Object.entries(radarPortData.scores).map(([key, value]) => ({
        subject:
          key === "ftzAccess"
            ? "FTZ Access"
            : key.charAt(0).toUpperCase() + key.slice(1),
        value,
        fullMark: 100,
      }))
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-navy-100 flex items-center gap-2">
          <Anchor className="w-5 h-5 text-ocean-400" />
          US Port Comparison Tool
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-navy-400">
          <Info className="w-3.5 h-3.5" />
          Select up to 3 ports to compare
        </div>
      </div>

      {/* Port selector */}
      <div className="flex flex-wrap gap-2">
        {portsData.map((port) => (
          <button
            key={port.id}
            onClick={() => togglePort(port.id)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              selectedPorts.includes(port.id)
                ? "bg-ocean-600 text-white border border-ocean-500"
                : "glass text-navy-300 hover:text-white"
            }`}
          >
            {port.code} — {port.name}
          </button>
        ))}
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-navy-400">
              <th className="text-left py-2 pr-4 font-medium">Metric</th>
              {selectedPortData.map((port) => (
                <th key={port.id} className="text-center py-2 px-3 font-medium text-white">
                  {port.code}
                  <div className="text-navy-400 font-normal text-[10px]">{port.state}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              {
                label: "Annual Volume",
                icon: TrendingUp,
                render: (p: PortData) => p.annualTEU + " TEU",
                highlight: false,
              },
              {
                label: "Avg Dwell Time",
                icon: Clock,
                render: (p: PortData) => `${p.avgDwellDays} days`,
                compare: (p: PortData) => p.avgDwellDays,
                lowerBetter: true,
              },
              {
                label: "Demurrage/Day",
                icon: DollarSign,
                render: (p: PortData) => `$${p.demurragePerDay}`,
                compare: (p: PortData) => p.demurragePerDay,
                lowerBetter: true,
              },
              {
                label: "Detention/Day",
                icon: DollarSign,
                render: (p: PortData) => `$${p.detentionPerDay}`,
                compare: (p: PortData) => p.detentionPerDay,
                lowerBetter: true,
              },
              {
                label: "Drayage Cost",
                icon: DollarSign,
                render: (p: PortData) => `$${p.drayageCost}`,
                compare: (p: PortData) => p.drayageCost,
                lowerBetter: true,
              },
              {
                label: "Congestion Risk",
                icon: TrendingUp,
                render: (p: PortData) => (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${congestionColors[p.congestionRisk]}`}>
                    {p.congestionRisk}
                  </span>
                ),
                highlight: false,
              },
              {
                label: "FTZ Nearby",
                icon: Anchor,
                render: (p: PortData) =>
                  p.ftzNearby ? (
                    <span className="text-green-400">{p.ftzName}</span>
                  ) : (
                    <span className="text-navy-500">None</span>
                  ),
                highlight: false,
              },
              {
                label: "Cold Chain",
                icon: Anchor,
                render: (p: PortData) =>
                  p.coldChain ? (
                    <span className="text-ocean-300">Available</span>
                  ) : (
                    <span className="text-navy-500">N/A</span>
                  ),
                highlight: false,
              },
            ].map((row) => {
              const values = "compare" in row && row.compare
                ? selectedPortData.map((p) => (row.compare as (p: PortData) => number)(p))
                : [];
              const best =
                values.length > 0
                  ? row.lowerBetter
                    ? Math.min(...values)
                    : Math.max(...values)
                  : null;

              return (
                <tr key={row.label} className="border-t border-white/5">
                  <td className="py-2 pr-4 text-navy-400">{row.label}</td>
                  {selectedPortData.map((port) => {
                    const val =
                      "compare" in row && row.compare ? (row.compare as (p: PortData) => number)(port) : null;
                    const isBest = val !== null && val === best;
                    return (
                      <td
                        key={port.id}
                        className={`py-2 px-3 text-center ${
                          isBest ? "text-green-400 font-semibold" : "text-navy-200"
                        }`}
                      >
                        {row.render(port)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Radar chart */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span className="text-sm font-medium text-navy-200">Port Performance Radar</span>
          <div className="flex gap-1 flex-wrap">
            {portsData.map((port) => (
              <button
                key={port.id}
                onClick={() => setRadarPort(port.id)}
                className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                  radarPort === port.id
                    ? "bg-ocean-600 text-white"
                    : "glass text-navy-300 hover:text-white"
                }`}
              >
                {port.code}
              </button>
            ))}
          </div>
        </div>

        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarChartData}>
              <PolarGrid stroke="#ffffff15" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#90b3ff", fontSize: 10 }}
              />
              <Radar
                name={radarPortData?.name}
                dataKey="value"
                stroke="#00bcd4"
                fill="#00bcd4"
                fillOpacity={0.25}
              />
              <Tooltip content={<RadarTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-navy-500 text-center mt-1">
          Scores are composite metrics (0–100). Higher = better for each dimension.
        </p>
      </div>
    </div>
  );
}
