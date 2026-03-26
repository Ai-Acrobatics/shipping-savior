"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Info,
  DollarSign,
  Calendar,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PFNPFInputs {
  currentDutyRate: number;         // % at time of FTZ entry (the "locked" rate)
  futureDutyRate: number;          // % at time of withdrawal (market rate)
  monthlyImportVolume: number;     // $ per month
  storageDurationMonths: number;   // how many months goods stay in FTZ
  storagePerMonth: number;         // $ storage cost per month
}

interface WithdrawalRow {
  month: number;
  withdrawalValue: number;
  pfDuty: number;
  npfDuty: number;
  pfCumulative: number;
  npfCumulative: number;
  storageCumulative: number;
  pfNetSavingsVsLump: number;
  npfNetSavingsVsLump: number;
}

interface PFNPFResult {
  totalValue: number;
  pfTotalDuty: number;
  npfTotalDuty: number;
  lumpSumDutyAtCurrent: number;
  pfSavingsVsNoFTZ: number;
  npfSavingsVsNoFTZ: number;
  winner: "PF" | "NPF" | "TIE";
  netDiff: number;                 // positive = NPF wins, negative = PF wins
  breakEvenMonth: number | null;
  totalStorageCost: number;
  pfNetAfterStorage: number;
  npfNetAfterStorage: number;
  withdrawalTable: WithdrawalRow[];
}

interface TariffScenario {
  label: string;
  rateOffset: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Calculation
// ─────────────────────────────────────────────────────────────────────────────

function calculatePFNPF(inputs: PFNPFInputs): PFNPFResult {
  const {
    currentDutyRate,
    futureDutyRate,
    monthlyImportVolume,
    storageDurationMonths,
    storagePerMonth,
  } = inputs;

  const months = Math.max(1, Math.round(storageDurationMonths));
  const totalValue = monthlyImportVolume * months;

  // PF: always uses the locked (entry) rate
  const pfEffectiveRate = currentDutyRate;
  // NPF: uses whichever is lower — locked rate or future market rate
  const npfEffectiveRate = Math.min(currentDutyRate, futureDutyRate);

  const pfTotalDuty = totalValue * (pfEffectiveRate / 100);
  const npfTotalDuty = totalValue * (npfEffectiveRate / 100);

  // Without FTZ: pay full duty at future (current market) rate upfront
  const lumpSumDutyAtCurrent = totalValue * (futureDutyRate / 100);

  const pfSavingsVsNoFTZ = lumpSumDutyAtCurrent - pfTotalDuty;
  const npfSavingsVsNoFTZ = lumpSumDutyAtCurrent - npfTotalDuty;

  const netDiff = npfSavingsVsNoFTZ - pfSavingsVsNoFTZ; // positive = NPF is better
  const winner: "PF" | "NPF" | "TIE" =
    Math.abs(netDiff) < 0.01 ? "TIE" : netDiff > 0 ? "NPF" : "PF";

  // Build withdrawal table — monthly incremental withdrawals
  const withdrawalTable: WithdrawalRow[] = [];
  let pfCumulative = 0;
  let npfCumulative = 0;
  let storageCumulative = 0;
  let breakEvenMonth: number | null = null;

  for (let m = 1; m <= months; m++) {
    const withdrawalValue = monthlyImportVolume;
    const pfDuty = withdrawalValue * (pfEffectiveRate / 100);
    const npfDuty = withdrawalValue * (npfEffectiveRate / 100);
    const storage = storagePerMonth;

    pfCumulative += pfDuty;
    npfCumulative += npfDuty;
    storageCumulative += storage;

    // Net savings vs lump sum (without FTZ) — including storage
    const lumpSoFar = withdrawalValue * m * (futureDutyRate / 100);
    const pfNetSavingsVsLump = lumpSoFar - pfCumulative - storageCumulative;
    const npfNetSavingsVsLump = lumpSoFar - npfCumulative - storageCumulative;

    // Break-even: first month where PF net savings turns positive
    if (breakEvenMonth === null && pfNetSavingsVsLump > 0) {
      breakEvenMonth = m;
    }

    withdrawalTable.push({
      month: m,
      withdrawalValue,
      pfDuty,
      npfDuty,
      pfCumulative,
      npfCumulative,
      storageCumulative,
      pfNetSavingsVsLump,
      npfNetSavingsVsLump,
    });
  }

  const totalStorageCost = storagePerMonth * months;
  const pfNetAfterStorage = pfSavingsVsNoFTZ - totalStorageCost;
  const npfNetAfterStorage = npfSavingsVsNoFTZ - totalStorageCost;

  return {
    totalValue,
    pfTotalDuty,
    npfTotalDuty,
    lumpSumDutyAtCurrent,
    pfSavingsVsNoFTZ,
    npfSavingsVsNoFTZ,
    winner,
    netDiff,
    breakEvenMonth,
    totalStorageCost,
    pfNetAfterStorage,
    npfNetAfterStorage,
    withdrawalTable,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function fmtSigned(n: number): string {
  return (n >= 0 ? "+" : "") + "$" + fmt(Math.abs(n));
}

// ─────────────────────────────────────────────────────────────────────────────
// Tariff scenarios config
// ─────────────────────────────────────────────────────────────────────────────

const TARIFF_SCENARIOS: TariffScenario[] = [
  {
    label: "Current Rate",
    rateOffset: 0,
    color: "text-navy-700",
    bgColor: "bg-white",
    borderColor: "border-navy-200",
  },
  {
    label: "+10% Increase",
    rateOffset: 10,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    label: "+25% Increase",
    rateOffset: 25,
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    label: "−5% Decrease",
    rateOffset: -5,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PFNPFCalculator() {
  const [currentDutyRate, setCurrentDutyRate] = useState(6.5);
  const [futureDutyRate, setFutureDutyRate] = useState(12.0);
  const [monthlyImportVolume, setMonthlyImportVolume] = useState(50000);
  const [storageDurationMonths, setStorageDurationMonths] = useState(6);
  const [storagePerMonth, setStoragePerMonth] = useState(500);
  const [activeTab, setActiveTab] = useState<"pfnpf" | "scenarios" | "schedule">("pfnpf");

  const inputs: PFNPFInputs = {
    currentDutyRate,
    futureDutyRate,
    monthlyImportVolume,
    storageDurationMonths,
    storagePerMonth,
  };

  const result = useMemo(() => calculatePFNPF(inputs), [
    currentDutyRate,
    futureDutyRate,
    monthlyImportVolume,
    storageDurationMonths,
    storagePerMonth,
  ]);

  return (
    <div className="space-y-6">
      {/* Disclaimer banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed">
          <strong>Informational only.</strong> Zone status elections (PF/NPF) are{" "}
          <strong>irrevocable</strong> once made. Consult a licensed customs broker before electing.
          Tariff rates are subject to change by executive order or legislation.{" "}
          <a
            href="https://hts.usitc.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline font-medium"
          >
            Verify current rates at hts.usitc.gov
          </a>
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-navy-50 border border-navy-200 rounded-xl p-1 w-fit">
        {(
          [
            { key: "pfnpf", label: "PF vs NPF Comparison" },
            { key: "scenarios", label: "Tariff Scenarios" },
            { key: "schedule", label: "Withdrawal Schedule" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white border border-navy-200 shadow-soft text-navy-900"
                : "text-navy-500 hover:text-navy-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Shared Input Panel ── */}
      <div className="bg-white border border-navy-100 rounded-2xl p-5 shadow-soft">
        <h3 className="text-sm font-semibold text-navy-700 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-ocean-600" />
          Inputs (shared across all tabs)
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-navy-500 block mb-1">
              Current Duty Rate at FTZ Entry (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={currentDutyRate}
              onChange={(e) => setCurrentDutyRate(parseFloat(e.target.value) || 0)}
              className="input-light border-emerald-200 focus:border-emerald-500"
            />
            <p className="text-xs text-navy-400 mt-1">Rate locked on FTZ admission date</p>
          </div>

          <div>
            <label className="text-xs text-navy-500 block mb-1">
              Expected Future Rate at Withdrawal (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={futureDutyRate}
              onChange={(e) => setFutureDutyRate(parseFloat(e.target.value) || 0)}
              className="input-light border-amber-200 focus:border-amber-500"
            />
            <p className="text-xs text-navy-400 mt-1">Projected rate when goods leave FTZ</p>
          </div>

          <div>
            <label className="text-xs text-navy-500 block mb-1">
              Monthly Import Volume ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
              <input
                type="number"
                step="1000"
                min="0"
                value={monthlyImportVolume}
                onChange={(e) => setMonthlyImportVolume(parseFloat(e.target.value) || 0)}
                className="input-light pl-7"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-navy-500 block mb-1">
              Average Storage Duration (months)
            </label>
            <input
              type="range"
              min="1"
              max="24"
              value={storageDurationMonths}
              onChange={(e) => setStorageDurationMonths(parseInt(e.target.value))}
              className="w-full accent-ocean-500 mt-1"
            />
            <div className="flex justify-between text-xs text-navy-400 mt-1">
              <span>1 mo</span>
              <span className="font-medium text-navy-700">{storageDurationMonths} months</span>
              <span>24 mo</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-navy-500 block mb-1">
              Storage Cost per Month ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
              <input
                type="number"
                step="50"
                min="0"
                value={storagePerMonth}
                onChange={(e) => setStoragePerMonth(parseFloat(e.target.value) || 0)}
                className="input-light pl-7"
              />
            </div>
          </div>

          <div className="flex items-end">
            <div className="bg-navy-50 border border-navy-200 rounded-xl p-3 w-full text-xs text-navy-600 leading-relaxed">
              <strong className="text-navy-800 block mb-1">Total shipment value</strong>
              <span className="text-lg font-bold text-navy-900">
                ${fmt(result.totalValue)}
              </span>
              <span className="text-navy-400 ml-1">
                ({storageDurationMonths} mo × ${fmt(monthlyImportVolume)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: PF vs NPF Comparison
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "pfnpf" && (
        <div className="space-y-5">
          {/* Winner badge */}
          <div
            className={`flex items-center gap-3 rounded-2xl px-5 py-4 border ${
              result.winner === "NPF"
                ? "bg-emerald-50 border-emerald-200"
                : result.winner === "PF"
                ? "bg-ocean-50 border-ocean-200"
                : "bg-navy-50 border-navy-200"
            }`}
          >
            {result.winner === "TIE" ? (
              <ArrowRightLeft className="w-6 h-6 text-navy-500" />
            ) : result.winner === "NPF" ? (
              <TrendingDown className="w-6 h-6 text-emerald-600" />
            ) : (
              <Shield className="w-6 h-6 text-ocean-600" />
            )}
            <div>
              <div
                className={`text-base font-bold ${
                  result.winner === "NPF"
                    ? "text-emerald-700"
                    : result.winner === "PF"
                    ? "text-ocean-700"
                    : "text-navy-700"
                }`}
              >
                {result.winner === "TIE"
                  ? "PF and NPF are equivalent at these rates"
                  : result.winner === "NPF"
                  ? "NPF Status Wins — rate may decrease, stay flexible"
                  : "PF Status Wins — lock in the lower current rate now"}
              </div>
              <div className="text-xs text-navy-500 mt-0.5">
                {result.winner !== "TIE" && (
                  <>
                    Net advantage:{" "}
                    <strong>${fmt(Math.abs(result.netDiff))}</strong> in favor of{" "}
                    {result.winner}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <div className="bg-white border border-navy-100 rounded-2xl overflow-hidden shadow-soft">
            <div className="grid grid-cols-3 text-xs font-semibold text-navy-500 bg-navy-50 border-b border-navy-100 px-5 py-3">
              <span>Metric</span>
              <span className="text-center text-ocean-600">PF (Privileged Foreign)</span>
              <span className="text-center text-emerald-600">NPF (Non-Privileged Foreign)</span>
            </div>

            {[
              {
                label: "Effective Duty Rate",
                pf: `${currentDutyRate.toFixed(1)}% (locked at entry)`,
                npf: `${Math.min(currentDutyRate, futureDutyRate).toFixed(1)}% (lower of entry/exit)`,
                pfColor: "text-ocean-700",
                npfColor: "text-emerald-700",
              },
              {
                label: "Total Duty Owed",
                pf: `$${fmt(result.pfTotalDuty)}`,
                npf: `$${fmt(result.npfTotalDuty)}`,
                pfColor: "text-navy-900 font-semibold",
                npfColor: "text-navy-900 font-semibold",
              },
              {
                label: "Duty Without FTZ (lump sum)",
                pf: `$${fmt(result.lumpSumDutyAtCurrent)}`,
                npf: `$${fmt(result.lumpSumDutyAtCurrent)}`,
                pfColor: "text-red-600",
                npfColor: "text-red-600",
              },
              {
                label: "Gross Savings vs No-FTZ",
                pf: `$${fmt(result.pfSavingsVsNoFTZ)}`,
                npf: `$${fmt(result.npfSavingsVsNoFTZ)}`,
                pfColor: result.pfSavingsVsNoFTZ >= 0 ? "text-emerald-600 font-bold" : "text-red-600 font-bold",
                npfColor: result.npfSavingsVsNoFTZ >= 0 ? "text-emerald-600 font-bold" : "text-red-600 font-bold",
              },
              {
                label: "Total Storage Cost",
                pf: `$${fmt(result.totalStorageCost)}`,
                npf: `$${fmt(result.totalStorageCost)}`,
                pfColor: "text-amber-600",
                npfColor: "text-amber-600",
              },
              {
                label: "Net Savings (after storage)",
                pf: fmtSigned(result.pfNetAfterStorage),
                npf: fmtSigned(result.npfNetAfterStorage),
                pfColor: result.pfNetAfterStorage >= 0 ? "text-emerald-600 font-bold text-base" : "text-red-600 font-bold text-base",
                npfColor: result.npfNetAfterStorage >= 0 ? "text-emerald-600 font-bold text-base" : "text-red-600 font-bold text-base",
              },
            ].map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-3 px-5 py-3.5 border-b border-navy-50 text-sm ${
                  i % 2 === 0 ? "bg-white" : "bg-navy-50/30"
                }`}
              >
                <span className="text-navy-500 text-xs self-center">{row.label}</span>
                <span className={`text-center text-xs ${row.pfColor} self-center`}>{row.pf}</span>
                <span className={`text-center text-xs ${row.npfColor} self-center`}>{row.npf}</span>
              </div>
            ))}
          </div>

          {/* PF / NPF explainer cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-ocean-50 border border-ocean-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-ocean-600" />
                <span className="font-semibold text-ocean-800">PF — Privileged Foreign</span>
              </div>
              <ul className="text-xs text-navy-700 space-y-1.5 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-ocean-500 flex-shrink-0 mt-0.5" />
                  Locks tariff classification AND rate at time of admission
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-ocean-500 flex-shrink-0 mt-0.5" />
                  Best when rates are expected to <strong>increase</strong>
                </li>
                <li className="flex items-start gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                  Cannot benefit if rates <strong>decrease</strong> after entry
                </li>
                <li className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  Election is <strong>irrevocable</strong> — choose carefully
                </li>
              </ul>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-800">NPF — Non-Privileged Foreign</span>
              </div>
              <ul className="text-xs text-navy-700 space-y-1.5 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  Pays the <strong>lower</strong> of rate at admission OR withdrawal
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  Best when rates are expected to <strong>decrease</strong>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  Also benefits if rates increase — still pays admission rate
                </li>
                <li className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  Election is <strong>irrevocable</strong> — consult customs broker
                </li>
              </ul>
            </div>
          </div>

          {/* Warning messages */}
          {result.pfNetAfterStorage < 0 && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-800">
                <strong>Warning:</strong> At these parameters, FTZ storage costs exceed duty savings.
                Consider shortening the storage duration or increasing import volume to improve ROI.
              </p>
            </div>
          )}

          {currentDutyRate >= futureDutyRate && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                <strong>No rate locking advantage:</strong> The current (entry) rate is equal to or
                higher than the expected future rate. FTZ cash-flow benefits still apply — pay duties
                incrementally instead of all upfront.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: Tariff Scenarios
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "scenarios" && (
        <div className="space-y-5">
          <p className="text-sm text-navy-500">
            How does the same monthly shipment perform under different tariff levels? All scenarios
            use the same volume and storage duration from your inputs above.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {TARIFF_SCENARIOS.map((scenario) => {
              const scenarioRate = Math.max(0, currentDutyRate + scenario.rateOffset);
              const dutyPaid = monthlyImportVolume * storageDurationMonths * (scenarioRate / 100);
              const savingsVsBaseline =
                scenario.rateOffset === 0
                  ? 0
                  : monthlyImportVolume *
                    storageDurationMonths *
                    ((currentDutyRate - scenarioRate) / 100);
              const ftzDuty =
                monthlyImportVolume * storageDurationMonths * (currentDutyRate / 100);
              const ftzSavings = dutyPaid - ftzDuty;

              return (
                <div
                  key={scenario.label}
                  className={`${scenario.bgColor} border ${scenario.borderColor} rounded-2xl p-5`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-semibold ${scenario.color}`}>
                      {scenario.label}
                    </span>
                    <span
                      className={`text-lg font-bold ${scenario.color}`}
                    >
                      {scenarioRate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-navy-500">Total duty (no FTZ)</span>
                      <span className="font-semibold text-red-600">${fmt(dutyPaid)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-navy-500">Duty with FTZ (locked rate)</span>
                      <span className="font-semibold text-emerald-600">${fmt(ftzDuty)}</span>
                    </div>
                    <div className="border-t border-current border-opacity-20 pt-2.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-navy-500">FTZ saves you</span>
                        <span
                          className={`font-bold text-sm ${
                            ftzSavings > 0 ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {ftzSavings >= 0 ? "+" : ""}${fmt(ftzSavings)}
                        </span>
                      </div>
                    </div>
                    {scenario.rateOffset !== 0 && (
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-navy-500">vs. Current scenario</span>
                        <span
                          className={`font-semibold ${
                            savingsVsBaseline > 0 ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {savingsVsBaseline >= 0 ? "save " : "extra cost "}$
                          {fmt(Math.abs(savingsVsBaseline))}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Simple duty bar */}
                  <div className="mt-3">
                    <div className="text-xs text-navy-400 mb-1">Duty as % of shipment value</div>
                    <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          scenario.rateOffset > 0
                            ? "bg-red-400"
                            : scenario.rateOffset < 0
                            ? "bg-emerald-400"
                            : "bg-ocean-400"
                        }`}
                        style={{
                          width: `${Math.min(100, (scenarioRate / 50) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-navy-500 mt-1 text-right">
                      {scenarioRate.toFixed(1)}% of FOB value
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scenarios comparison summary */}
          <div className="bg-white border border-navy-100 rounded-2xl p-5 shadow-soft">
            <h4 className="text-sm font-semibold text-navy-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-ocean-600" />
              Side-by-Side Duty Comparison
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-navy-100">
                    <th className="text-left text-navy-500 pb-2 pr-4 font-medium">Scenario</th>
                    <th className="text-right text-navy-500 pb-2 px-3 font-medium">Rate</th>
                    <th className="text-right text-navy-500 pb-2 px-3 font-medium">Duty (No FTZ)</th>
                    <th className="text-right text-navy-500 pb-2 px-3 font-medium">Duty (w/ FTZ)</th>
                    <th className="text-right text-navy-500 pb-2 pl-3 font-medium">FTZ Saves</th>
                  </tr>
                </thead>
                <tbody>
                  {TARIFF_SCENARIOS.map((scenario) => {
                    const scenarioRate = Math.max(0, currentDutyRate + scenario.rateOffset);
                    const dutyPaid =
                      monthlyImportVolume * storageDurationMonths * (scenarioRate / 100);
                    const ftzDuty =
                      monthlyImportVolume * storageDurationMonths * (currentDutyRate / 100);
                    const ftzSavings = dutyPaid - ftzDuty;

                    return (
                      <tr key={scenario.label} className="border-b border-navy-50">
                        <td className={`py-2.5 pr-4 font-medium ${scenario.color}`}>
                          {scenario.label}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-semibold ${scenario.color}`}>
                          {scenarioRate.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-right text-red-600 font-medium">
                          ${fmt(dutyPaid)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-600 font-medium">
                          ${fmt(ftzDuty)}
                        </td>
                        <td
                          className={`py-2.5 pl-3 text-right font-bold ${
                            ftzSavings > 0 ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {ftzSavings >= 0 ? "+" : ""}${fmt(ftzSavings)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-navy-400 mt-3">
              FTZ duty is always calculated at the locked entry rate ({currentDutyRate.toFixed(1)}%).
              The higher the future tariff, the more valuable your FTZ rate lock.
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: Incremental Withdrawal Table
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "schedule" && (
        <div className="space-y-5">
          <p className="text-sm text-navy-500">
            Monthly withdrawal schedule comparing PF vs NPF duty payments and cumulative net savings
            versus paying all duty upfront at the current market rate.
          </p>

          {/* Summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                icon: DollarSign,
                label: "Lump-Sum (No FTZ)",
                value: `$${fmt(result.lumpSumDutyAtCurrent)}`,
                color: "text-red-600",
                bg: "bg-red-50",
                border: "border-red-100",
              },
              {
                icon: Shield,
                label: "Total PF Duty",
                value: `$${fmt(result.pfTotalDuty)}`,
                color: "text-ocean-600",
                bg: "bg-ocean-50",
                border: "border-ocean-100",
              },
              {
                icon: TrendingDown,
                label: "Total NPF Duty",
                value: `$${fmt(result.npfTotalDuty)}`,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                border: "border-emerald-100",
              },
              {
                icon: Calendar,
                label: "Break-Even Month",
                value:
                  result.breakEvenMonth !== null
                    ? `Month ${result.breakEvenMonth}`
                    : "Never",
                color:
                  result.breakEvenMonth !== null ? "text-navy-700" : "text-red-600",
                bg: "bg-navy-50",
                border: "border-navy-100",
              },
            ].map((card) => (
              <div
                key={card.label}
                className={`${card.bg} border ${card.border} rounded-xl p-4`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                  <span className="text-xs text-navy-500">{card.label}</span>
                </div>
                <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white border border-navy-100 rounded-2xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-navy-50 border-b border-navy-100 z-10">
                  <tr>
                    <th className="text-left text-navy-500 px-4 py-3 font-medium">Month</th>
                    <th className="text-right text-navy-500 px-3 py-3 font-medium">
                      Withdrawal Value
                    </th>
                    <th className="text-right text-ocean-600 px-3 py-3 font-medium">PF Duty</th>
                    <th className="text-right text-emerald-600 px-3 py-3 font-medium">NPF Duty</th>
                    <th className="text-right text-navy-500 px-3 py-3 font-medium">Storage</th>
                    <th className="text-right text-ocean-700 px-3 py-3 font-medium">
                      PF Cum. Net Savings
                    </th>
                    <th className="text-right text-emerald-700 px-4 py-3 font-medium">
                      NPF Cum. Net Savings
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.withdrawalTable.map((row, i) => (
                    <tr
                      key={row.month}
                      className={`border-b border-navy-50 hover:bg-navy-50/50 transition-colors ${
                        i % 2 === 0 ? "bg-white" : "bg-navy-50/20"
                      }`}
                    >
                      <td className="px-4 py-2.5 font-medium text-navy-700">
                        Month {row.month}
                      </td>
                      <td className="px-3 py-2.5 text-right text-navy-600">
                        ${fmt(row.withdrawalValue)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-ocean-600 font-medium">
                        ${fmt(row.pfDuty)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-emerald-600 font-medium">
                        ${fmt(row.npfDuty)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-amber-600">
                        ${fmt(storagePerMonth)}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-right font-semibold ${
                          row.pfNetSavingsVsLump >= 0 ? "text-ocean-700" : "text-red-500"
                        }`}
                      >
                        {fmtSigned(row.pfNetSavingsVsLump)}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right font-semibold ${
                          row.npfNetSavingsVsLump >= 0 ? "text-emerald-700" : "text-red-500"
                        }`}
                      >
                        {fmtSigned(row.npfNetSavingsVsLump)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-navy-50 border-t border-navy-200">
                  <tr>
                    <td className="px-4 py-3 font-bold text-navy-700" colSpan={2}>
                      Totals
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-ocean-700">
                      ${fmt(result.pfTotalDuty)}
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-emerald-700">
                      ${fmt(result.npfTotalDuty)}
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-amber-600">
                      ${fmt(result.totalStorageCost)}
                    </td>
                    <td
                      className={`px-3 py-3 text-right font-bold ${
                        result.pfNetAfterStorage >= 0 ? "text-ocean-700" : "text-red-600"
                      }`}
                    >
                      {fmtSigned(result.pfNetAfterStorage)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-bold ${
                        result.npfNetAfterStorage >= 0 ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {fmtSigned(result.npfNetAfterStorage)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="bg-navy-50 border border-navy-200 rounded-xl px-4 py-3">
            <p className="text-xs text-navy-500 leading-relaxed">
              <strong className="text-navy-700">How to read this table:</strong> Each month you
              withdraw goods worth{" "}
              <strong>${fmt(monthlyImportVolume)}</strong>. PF duty is charged at the locked entry
              rate ({currentDutyRate.toFixed(1)}%). NPF duty uses the lower of the entry rate or
              future rate ({Math.min(currentDutyRate, futureDutyRate).toFixed(1)}%). Cumulative net
              savings compares against paying all duty at {futureDutyRate.toFixed(1)}% upfront with
              no FTZ, minus storage costs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
