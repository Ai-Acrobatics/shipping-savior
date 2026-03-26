"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  MapPin,
  TrendingDown,
  Calendar,
  DollarSign,
  Warehouse,
  ArrowRight,
  Info,
  ChevronRight,
} from "lucide-react";

interface FTZLocation {
  id: number;
  name: string;
  state: string;
  port: string;
  nearbyPort: string;
  type: "general-purpose" | "subzone";
  operator?: string;
  distance?: string;
}

interface WithdrawalSchedule {
  month: number;
  label: string;
  units: number;
  dutyAtLockedRate: number;
  dutyAtCurrentRate: number;
  savings: number;
  cumulativeSavings: number;
  percentWithdrawn: number;
}

interface FTZAnalysis {
  totalUnits: number;
  totalValue: number;
  dutyWithoutFTZ: number;
  dutyWithFTZ: number;
  totalSavings: number;
  savingsPercent: number;
  breakEvenMonth: number;
  withdrawalSchedule: WithdrawalSchedule[];
  ftzStorageCost: number;
  netSavings: number;
}

// Sample of real FTZ locations (260+ exist nationwide via OFIS/trade.gov)
const FTZ_LOCATIONS: FTZLocation[] = [
  { id: 3, name: "San Francisco Bay Area FTZ", state: "CA", port: "San Francisco", nearbyPort: "Oakland", type: "general-purpose", distance: "0 mi from OAK" },
  { id: 26, name: "Atlanta FTZ", state: "GA", port: "Atlanta", nearbyPort: "Savannah", type: "general-purpose", distance: "~4 hrs from SAV" },
  { id: 32, name: "Miami FTZ", state: "FL", port: "Miami", nearbyPort: "Port of Miami", type: "general-purpose", distance: "Adjacent to PortMiami" },
  { id: 50, name: "Long Beach/Los Angeles FTZ", state: "CA", port: "Los Angeles", nearbyPort: "POLA/POLB", type: "general-purpose", distance: "Adjacent to ports" },
  { id: 61, name: "San Antonio FTZ", state: "TX", port: "Laredo", nearbyPort: "Houston/Laredo", type: "general-purpose", distance: "~3 hrs from Houston" },
  { id: 70, name: "Detroit FTZ", state: "MI", port: "Detroit", nearbyPort: "Port of Detroit", type: "general-purpose", distance: "Adjacent to port" },
  { id: 84, name: "Houston FTZ", state: "TX", port: "Houston", nearbyPort: "Port of Houston", type: "general-purpose", distance: "Adjacent to port" },
  { id: 90, name: "New York/Newark FTZ", state: "NY/NJ", port: "Port Authority", nearbyPort: "Port Newark/PNCT", type: "general-purpose", distance: "Adjacent to port" },
  { id: 114, name: "Shreveport FTZ", state: "LA", port: "Dallas/Ft Worth", nearbyPort: "New Orleans", type: "general-purpose" },
  { id: 134, name: "Chattanooga FTZ", state: "TN", port: "Chattanooga", nearbyPort: "Savannah/Charleston", type: "general-purpose" },
  { id: 158, name: "Vicksburg/Jackson FTZ", state: "MS", port: "Jackson", nearbyPort: "New Orleans", type: "general-purpose" },
  { id: 176, name: "Dorchester County FTZ", state: "SC", port: "Charleston", nearbyPort: "Port of Charleston", type: "general-purpose", distance: "Adjacent to port" },
  { id: 202, name: "Los Angeles Sub-Zone (Mattel)", state: "CA", port: "Los Angeles", nearbyPort: "POLA/POLB", type: "subzone", operator: "Mattel" },
  { id: 221, name: "Toledo FTZ", state: "OH", port: "Toledo", nearbyPort: "Port of Toledo", type: "general-purpose" },
  { id: 246, name: "Phoenix FTZ", state: "AZ", port: "Phoenix", nearbyPort: "Long Beach/LA", type: "general-purpose", distance: "~6 hrs from POLB" },
];

const MONTHS_MAP = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function buildWithdrawalSchedule(
  totalUnits: number,
  unitValue: number,
  lockedRate: number,
  currentRate: number,
  totalMonths: number,
  withdrawalPattern: "uniform" | "front-loaded" | "back-loaded"
): WithdrawalSchedule[] {
  const schedule: WithdrawalSchedule[] = [];
  let cumulativeSavings = 0;
  let unitsWithdrawn = 0;
  const startMonth = new Date().getMonth();

  // Generate pattern weights
  const weights: number[] = [];
  for (let i = 0; i < totalMonths; i++) {
    if (withdrawalPattern === "uniform") {
      weights.push(1);
    } else if (withdrawalPattern === "front-loaded") {
      weights.push(totalMonths - i);
    } else {
      weights.push(i + 1);
    }
  }
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  for (let m = 0; m < totalMonths; m++) {
    const monthUnits = Math.round((weights[m] / totalWeight) * totalUnits);
    const actualUnits = Math.min(monthUnits, totalUnits - unitsWithdrawn);
    if (actualUnits <= 0) break;

    unitsWithdrawn += actualUnits;
    const dutyAtLocked = actualUnits * unitValue * (lockedRate / 100);
    const dutyAtCurrent = actualUnits * unitValue * (currentRate / 100);
    const savings = dutyAtCurrent - dutyAtLocked;
    cumulativeSavings += savings;

    schedule.push({
      month: m + 1,
      label: MONTHS_MAP[(startMonth + m) % 12],
      units: actualUnits,
      dutyAtLockedRate: dutyAtLocked,
      dutyAtCurrentRate: dutyAtCurrent,
      savings,
      cumulativeSavings,
      percentWithdrawn: (unitsWithdrawn / totalUnits) * 100,
    });
  }

  return schedule;
}

function analyzeFTZ(
  totalUnits: number,
  unitValue: number,
  lockedRate: number,
  currentRate: number,
  totalMonths: number,
  withdrawalPattern: "uniform" | "front-loaded" | "back-loaded",
  storageCostPerUnitMonth: number
): FTZAnalysis {
  const schedule = buildWithdrawalSchedule(
    totalUnits, unitValue, lockedRate, currentRate, totalMonths, withdrawalPattern
  );

  const totalValue = totalUnits * unitValue;
  const dutyWithoutFTZ = totalValue * (currentRate / 100);
  const dutyWithFTZ = totalValue * (lockedRate / 100);
  const totalSavings = dutyWithoutFTZ - dutyWithFTZ;
  const savingsPercent = dutyWithoutFTZ > 0 ? (totalSavings / dutyWithoutFTZ) * 100 : 0;

  // Storage cost: units remaining in FTZ each month × storage rate
  let storageCost = 0;
  let remaining = totalUnits;
  for (const w of schedule) {
    storageCost += remaining * storageCostPerUnitMonth;
    remaining -= w.units;
  }

  const netSavings = totalSavings - storageCost;

  // Break-even month: when cumulative savings exceed storage cost
  let breakEvenMonth = totalMonths;
  let cumulativeStorage = 0;
  remaining = totalUnits;
  for (let i = 0; i < schedule.length; i++) {
    cumulativeStorage += remaining * storageCostPerUnitMonth;
    remaining -= schedule[i].units;
    if (schedule[i].cumulativeSavings >= cumulativeStorage) {
      breakEvenMonth = i + 1;
      break;
    }
  }

  return {
    totalUnits,
    totalValue,
    dutyWithoutFTZ,
    dutyWithFTZ,
    totalSavings,
    savingsPercent,
    breakEvenMonth,
    withdrawalSchedule: schedule,
    ftzStorageCost: storageCost,
    netSavings,
  };
}

interface Props {
  initialDutyRate?: number;
  initialCountry?: string;
}

export default function FTZAnalyzer({ initialDutyRate, initialCountry }: Props) {
  const [totalUnits, setTotalUnits] = useState(500000);
  const [unitValue, setUnitValue] = useState(0.5);
  const [lockedRate, setLockedRate] = useState(initialDutyRate ?? 6.5);
  const [currentRate, setCurrentRate] = useState((initialDutyRate ?? 6.5) + 5.5);
  const [totalMonths, setTotalMonths] = useState(8);
  const [withdrawalPattern, setWithdrawalPattern] = useState<"uniform" | "front-loaded" | "back-loaded">("uniform");
  const [storageCostPerUnitMonth, setStorageCostPerUnitMonth] = useState(0.005);
  const [selectedZone, setSelectedZone] = useState<FTZLocation | null>(null);
  const [zoneFilter, setZoneFilter] = useState("");
  const [activeSection, setActiveSection] = useState<"zones" | "model" | "schedule">("model");

  const analysis = useMemo(
    () =>
      analyzeFTZ(
        totalUnits,
        unitValue,
        lockedRate,
        currentRate,
        totalMonths,
        withdrawalPattern,
        storageCostPerUnitMonth
      ),
    [totalUnits, unitValue, lockedRate, currentRate, totalMonths, withdrawalPattern, storageCostPerUnitMonth]
  );

  const filteredZones = FTZ_LOCATIONS.filter(
    (z) =>
      !zoneFilter ||
      z.name.toLowerCase().includes(zoneFilter.toLowerCase()) ||
      z.state.toLowerCase().includes(zoneFilter.toLowerCase()) ||
      z.nearbyPort.toLowerCase().includes(zoneFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex gap-1 glass rounded-xl p-1 w-fit">
        {(["model", "zones", "schedule"] as const).map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeSection === section
                ? "bg-green-600 text-white"
                : "text-navy-300 hover:text-white"
            }`}
          >
            {section === "model"
              ? "FTZ Modeler"
              : section === "zones"
              ? "Zone Finder"
              : "Withdrawal Schedule"}
          </button>
        ))}
      </div>

      {/* FTZ MODELER */}
      {activeSection === "model" && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-navy-100 flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-green-400" />
              FTZ Parameters
            </h3>

            {initialCountry && (
              <div className="flex items-center gap-2 text-xs text-ocean-300 glass rounded-lg px-3 py-2">
                <Info className="w-3 h-3" />
                Pre-filled from tariff scenario: country {initialCountry}, rate {initialDutyRate?.toFixed(1)}%
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-navy-300 block mb-1">Total Units to Import</label>
                <input
                  type="number"
                  step="10000"
                  value={totalUnits}
                  onChange={(e) => setTotalUnits(parseInt(e.target.value) || 0)}
                  className="w-full glass rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-navy-900/50"
                />
              </div>

              <div>
                <label className="text-xs text-navy-300 block mb-1">Unit Value FOB ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={unitValue}
                    onChange={(e) => setUnitValue(parseFloat(e.target.value) || 0)}
                    className="w-full glass rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-navy-900/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-navy-300 block mb-1">
                  <span className="text-green-400 font-medium">Locked</span> Rate at FTZ Entry (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={lockedRate}
                  onChange={(e) => setLockedRate(parseFloat(e.target.value) || 0)}
                  className="w-full glass rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-navy-900/50 border border-green-500/30"
                />
              </div>

              <div>
                <label className="text-xs text-navy-300 block mb-1">
                  <span className="text-red-400 font-medium">Current</span> Market Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentRate}
                  onChange={(e) => setCurrentRate(parseFloat(e.target.value) || 0)}
                  className="w-full glass rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 bg-navy-900/50 border border-red-500/30"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-navy-300 block mb-2">
                <Calendar className="w-3 h-3 inline mr-1" />
                Withdrawal Period: {totalMonths} months
              </label>
              <input
                type="range"
                min="1"
                max="24"
                value={totalMonths}
                onChange={(e) => setTotalMonths(parseInt(e.target.value))}
                className="w-full accent-green-500"
              />
              <div className="flex justify-between text-xs text-navy-500 mt-1">
                <span>1 mo</span>
                <span>12 mo</span>
                <span>24 mo</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-navy-300 block mb-2">Withdrawal Pattern</label>
              <div className="grid grid-cols-3 gap-2">
                {(["uniform", "front-loaded", "back-loaded"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setWithdrawalPattern(p)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all capitalize ${
                      withdrawalPattern === p
                        ? "bg-green-600/40 border border-green-500/60 text-green-300"
                        : "glass text-navy-400 hover:text-navy-200"
                    }`}
                  >
                    {p.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-navy-300 block mb-1">
                FTZ Storage Cost ($/unit/month)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
                <input
                  type="number"
                  step="0.001"
                  value={storageCostPerUnitMonth}
                  onChange={(e) =>
                    setStorageCostPerUnitMonth(parseFloat(e.target.value) || 0)
                  }
                  className="w-full glass rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ocean-500 bg-navy-900/50"
                />
              </div>
              <div className="text-xs text-navy-500 mt-1">
                Typical: $0.003–0.010/unit/month for pallet storage
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-navy-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              FTZ Analysis Results
            </h3>

            {/* Main savings card */}
            <div className="glass rounded-2xl p-6 border border-green-500/30 bg-green-500/5">
              <div className="text-center mb-5">
                <div className="text-xs text-navy-400 mb-1">Gross Duty Savings</div>
                <div className="text-4xl font-bold text-green-400">
                  ${analysis.totalSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-green-300 mt-1">
                  {analysis.savingsPercent.toFixed(1)}% reduction
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                <div className="text-center">
                  <div className="text-xs text-red-300">Without FTZ</div>
                  <div className="text-base font-bold text-red-400">
                    ${analysis.dutyWithoutFTZ.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-green-300">With FTZ</div>
                  <div className="text-base font-bold text-green-400">
                    ${analysis.dutyWithFTZ.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-cargo-300">Storage Cost</div>
                  <div className="text-base font-bold text-cargo-400">
                    ${analysis.ftzStorageCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Net savings + break-even */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-xl p-4 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-navy-400">Net Savings</span>
                </div>
                <div
                  className={`text-2xl font-bold ${
                    analysis.netSavings >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  ${Math.abs(analysis.netSavings).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className="text-xs text-navy-500 mt-1">after FTZ storage fees</div>
              </div>

              <div className="glass rounded-xl p-4 border border-ocean-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-ocean-400" />
                  <span className="text-xs text-navy-400">Break-Even</span>
                </div>
                <div className="text-2xl font-bold text-ocean-300">
                  Month {analysis.breakEvenMonth}
                </div>
                <div className="text-xs text-navy-500 mt-1">savings exceed storage costs</div>
              </div>
            </div>

            {/* Shipment summary */}
            <div className="glass rounded-xl p-4 space-y-2">
              <div className="text-xs font-medium text-navy-300 mb-3">Shipment Summary</div>
              {[
                { label: "Total Units", value: analysis.totalUnits.toLocaleString() },
                {
                  label: "Total FOB Value",
                  value: `$${analysis.totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
                },
                {
                  label: "Locked Rate",
                  value: `${lockedRate}%`,
                  color: "text-green-400",
                },
                {
                  label: "Market Rate",
                  value: `${currentRate}%`,
                  color: "text-red-400",
                },
                {
                  label: "Rate Delta",
                  value: `${(currentRate - lockedRate).toFixed(1)}% saved per withdrawal`,
                  color: "text-cargo-300",
                },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-navy-400">{row.label}</span>
                  <span className={row.color ?? "text-white"}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Selected zone badge */}
            {selectedZone && (
              <div className="glass rounded-xl p-4 border border-green-500/20 bg-green-500/5">
                <div className="flex items-center gap-2 text-sm font-medium text-green-300 mb-1">
                  <MapPin className="w-4 h-4" />
                  Selected FTZ Zone
                </div>
                <div className="text-white font-semibold">{selectedZone.name}</div>
                <div className="text-xs text-navy-400">
                  FTZ #{selectedZone.id} · {selectedZone.state} · {selectedZone.nearbyPort}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ZONE FINDER */}
      {activeSection === "zones" && (
        <div className="space-y-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="Filter by zone name, state, or port..."
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-navy-900/60"
            />
          </div>

          <div className="text-xs text-navy-400 flex items-center gap-2">
            <Info className="w-3 h-3" />
            Showing {filteredZones.length} of 260+ OFIS-registered FTZ locations. Data from
            trade.gov.
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {filteredZones.map((zone) => (
              <div
                key={zone.id}
                onClick={() => {
                  setSelectedZone(zone);
                  setActiveSection("model");
                }}
                className={`glass glass-hover rounded-xl p-4 cursor-pointer transition-all ${
                  selectedZone?.id === zone.id
                    ? "border border-green-500/50 bg-green-500/5"
                    : "border border-transparent"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-ocean-400">FTZ #{zone.id}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          zone.type === "general-purpose"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-purple-500/20 text-purple-300"
                        }`}
                      >
                        {zone.type === "general-purpose" ? "General" : "Subzone"}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white truncate">{zone.name}</div>
                    <div className="text-xs text-navy-400 mt-0.5">
                      {zone.state} · Near: {zone.nearbyPort}
                    </div>
                    {zone.distance && (
                      <div className="text-xs text-ocean-400 mt-0.5">{zone.distance}</div>
                    )}
                    {zone.operator && (
                      <div className="text-xs text-cargo-400 mt-0.5">Operator: {zone.operator}</div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-navy-500 flex-shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WITHDRAWAL SCHEDULE */}
      {activeSection === "schedule" && (
        <div className="space-y-5">
          <div className="glass rounded-xl p-5 border border-green-500/20">
            <div className="text-sm font-medium text-navy-200 mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-green-400" />
              Month-by-Month Withdrawal Schedule
              <span className="text-xs text-navy-500">({withdrawalPattern} pattern)</span>
            </div>

            {/* Mini bar visualization */}
            <div className="flex gap-1 mb-4 h-20 items-end">
              {analysis.withdrawalSchedule.map((w) => {
                const maxUnits = Math.max(...analysis.withdrawalSchedule.map((x) => x.units));
                const height = (w.units / maxUnits) * 100;
                return (
                  <div key={w.month} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-green-500/60 rounded-t"
                      style={{ height: `${height}%` }}
                      title={`Month ${w.month}: ${w.units.toLocaleString()} units`}
                    />
                    <div className="text-xs text-navy-600 hidden sm:block">{w.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-5 gap-2 text-xs text-navy-500 px-2 mb-2 font-medium">
                <span>Month</span>
                <span className="text-right">Units</span>
                <span className="text-right text-green-400">FTZ Duty</span>
                <span className="text-right text-red-400">Market Duty</span>
                <span className="text-right text-cargo-300">Cum. Savings</span>
              </div>

              {analysis.withdrawalSchedule.map((w) => (
                <div
                  key={w.month}
                  className="grid grid-cols-5 gap-2 text-xs px-2 py-2 rounded-lg hover:bg-white/3 border-b border-white/5"
                >
                  <span className="text-navy-300">
                    {w.label} (M{w.month})
                  </span>
                  <span className="text-right text-navy-200">{w.units.toLocaleString()}</span>
                  <span className="text-right text-green-400">
                    ${w.dutyAtLockedRate.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-right text-red-400">
                    ${w.dutyAtCurrentRate.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-right text-cargo-300 font-medium">
                    $
                    {w.cumulativeSavings.toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cumulative savings progress */}
          <div className="glass rounded-xl p-5">
            <div className="text-sm font-medium text-navy-200 mb-3">Cumulative Savings Progress</div>
            <div className="space-y-2">
              {analysis.withdrawalSchedule.map((w) => {
                const progress = (w.cumulativeSavings / analysis.totalSavings) * 100;
                return (
                  <div key={w.month}>
                    <div className="flex justify-between text-xs text-navy-400 mb-1">
                      <span>{w.label}</span>
                      <span className="text-green-400">
                        ${w.cumulativeSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="h-1.5 glass rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500/70 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cash flow benefit */}
          <div className="glass rounded-xl p-5 border border-cargo-500/20">
            <div className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-cargo-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-cargo-300 mb-1">Cash Flow Benefit</div>
                <p className="text-xs text-navy-300 leading-relaxed">
                  Without FTZ, you pay{" "}
                  <strong className="text-red-400">
                    ${analysis.dutyWithoutFTZ.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </strong>{" "}
                  upfront at customs. With FTZ + {withdrawalPattern} withdrawal over {totalMonths}{" "}
                  months, you spread duty payments incrementally — improving cash flow while locking
                  the lower {lockedRate}% rate instead of {currentRate}%. Net benefit:{" "}
                  <strong className="text-green-400">
                    ${analysis.netSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </strong>{" "}
                  after all FTZ storage costs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
