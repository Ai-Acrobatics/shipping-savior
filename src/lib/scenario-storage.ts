// ============================================================
// Scenario Persistence — localStorage-backed save/load/compare
// ============================================================

export interface SavedTariffScenario {
  id: string;
  name: string;
  country: string;
  baseDutyRate: number;
  section301Rate: number;
  unitValue: number;
  annualUnits: number;
  color: string;
}

export interface SavedScenarioSet {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  scenarios: SavedTariffScenario[];
  // Optional FTZ parameters saved with the set
  ftzParams?: {
    totalUnits: number;
    unitValue: number;
    lockedRate: number;
    currentRate: number;
    totalMonths: number;
    withdrawalPattern: "uniform" | "front-loaded" | "back-loaded";
    storageCostPerUnitMonth: number;
  };
  tags: string[];
}

export interface TradePolicy {
  id: string;
  name: string;
  description: string;
  icon: string;
  scenarios: Omit<SavedTariffScenario, "id">[];
}

const STORAGE_KEY = "shipping-savior-scenarios";

// ─── CRUD Operations ──────────────────────────────────────

export function loadAllScenarioSets(): SavedScenarioSet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedScenarioSet[];
  } catch {
    return [];
  }
}

export function saveScenarioSet(set: SavedScenarioSet): SavedScenarioSet[] {
  const all = loadAllScenarioSets();
  const idx = all.findIndex((s) => s.id === set.id);
  if (idx >= 0) {
    all[idx] = { ...set, updatedAt: new Date().toISOString() };
  } else {
    all.push({ ...set, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all;
}

export function deleteScenarioSet(id: string): SavedScenarioSet[] {
  const all = loadAllScenarioSets().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all;
}

export function duplicateScenarioSet(id: string): SavedScenarioSet[] {
  const all = loadAllScenarioSets();
  const original = all.find((s) => s.id === id);
  if (!original) return all;
  const copy: SavedScenarioSet = {
    ...original,
    id: `set-${Date.now()}`,
    name: `${original.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scenarios: original.scenarios.map((s) => ({ ...s, id: `${s.id}-copy-${Date.now()}` })),
  };
  all.push(copy);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all;
}

// ─── Comparison Utilities ─────────────────────────────────

export interface ScenarioComparison {
  scenarioA: SavedTariffScenario;
  scenarioB: SavedTariffScenario;
  ratesDelta: number;
  annualCostDelta: number;
  perUnitDelta: number;
  recommendation: string;
}

export function compareScenarios(
  a: SavedTariffScenario,
  b: SavedTariffScenario
): ScenarioComparison {
  const rateA = a.baseDutyRate + a.section301Rate;
  const rateB = b.baseDutyRate + b.section301Rate;
  const costA = a.unitValue * (rateA / 100) * a.annualUnits;
  const costB = b.unitValue * (rateB / 100) * b.annualUnits;
  const perUnitA = a.unitValue * (rateA / 100);
  const perUnitB = b.unitValue * (rateB / 100);

  let recommendation = "";
  if (costA < costB) {
    const pctSaved = ((costB - costA) / costB) * 100;
    recommendation = `${a.name} saves ${pctSaved.toFixed(1)}% vs ${b.name} ($${(costB - costA).toLocaleString("en-US", { maximumFractionDigits: 0 })}/yr)`;
  } else if (costB < costA) {
    const pctSaved = ((costA - costB) / costA) * 100;
    recommendation = `${b.name} saves ${pctSaved.toFixed(1)}% vs ${a.name} ($${(costA - costB).toLocaleString("en-US", { maximumFractionDigits: 0 })}/yr)`;
  } else {
    recommendation = "Both scenarios have identical annual cost";
  }

  return {
    scenarioA: a,
    scenarioB: b,
    ratesDelta: rateA - rateB,
    annualCostDelta: costA - costB,
    perUnitDelta: perUnitA - perUnitB,
    recommendation,
  };
}

// ─── Trade Policy Presets ─────────────────────────────────

export const TRADE_POLICY_PRESETS: TradePolicy[] = [
  {
    id: "current-2026",
    name: "Current 2026 Rates",
    description: "Active tariff rates as of Q1 2026 including Section 301/302 adjustments",
    icon: "📋",
    scenarios: [
      {
        name: "Vietnam (Current)",
        country: "VN",
        baseDutyRate: 6.5,
        section301Rate: 0,
        unitValue: 0.5,
        annualUnits: 2000000,
        color: "ocean",
      },
      {
        name: "China (Section 301)",
        country: "CN",
        baseDutyRate: 6.5,
        section301Rate: 25,
        unitValue: 0.5,
        annualUnits: 2000000,
        color: "red",
      },
      {
        name: "Thailand (Current)",
        country: "TH",
        baseDutyRate: 6.5,
        section301Rate: 0,
        unitValue: 0.5,
        annualUnits: 2000000,
        color: "green",
      },
    ],
  },
  {
    id: "section-301-expansion",
    name: "Section 301 Expansion",
    description: "What if Section 301 tariffs expand to SE Asia countries at various rates",
    icon: "⚠️",
    scenarios: [
      {
        name: "Vietnam + 10% Tariff",
        country: "VN",
        baseDutyRate: 6.5,
        section301Rate: 10,
        unitValue: 0.5,
        annualUnits: 2000000,
        color: "ocean",
      },
      {
        name: "Thailand + 15% Tariff",
        country: "TH",
        baseDutyRate: 6.5,
        section301Rate: 15,
        unitValue: 0.5,
        annualUnits: 2000000,
        color: "cargo",
      },
      {
        name: "Indonesia + 10% Tariff",
        country: "ID",
        baseDutyRate: 6.5,
        section301Rate: 10,
        unitValue: 0.5,
        annualUnits: 2000000,
        color: "green",
      },
      {
        name: "Cambodia (Untouched)",
        country: "KH",
        baseDutyRate: 6.5,
        section301Rate: 0,
        unitValue: 0.5,
        annualUnits: 2000000,
        color: "purple",
      },
    ],
  },
  {
    id: "trade-war-escalation",
    name: "Full Trade War Escalation",
    description: "Worst-case scenario: broad tariff increases across all Asian sourcing countries",
    icon: "🔴",
    scenarios: [
      {
        name: "China + 50% Tariff",
        country: "CN",
        baseDutyRate: 6.5,
        section301Rate: 50,
        unitValue: 0.5,
        annualUnits: 2000000,
        color: "red",
      },
      {
        name: "Vietnam + 25% Tariff",
        country: "VN",
        baseDutyRate: 6.5,
        section301Rate: 25,
        unitValue: 0.5,
        annualUnits: 2000000,
        color: "ocean",
      },
      {
        name: "Thailand + 25% Tariff",
        country: "TH",
        baseDutyRate: 6.5,
        section301Rate: 25,
        unitValue: 0.5,
        annualUnits: 2000000,
        color: "cargo",
      },
      {
        name: "Mexico (USMCA Protected)",
        country: "MX",
        baseDutyRate: 0,
        section301Rate: 0,
        unitValue: 0.5,
        annualUnits: 2000000,
        color: "green",
      },
    ],
  },
  {
    id: "nearshoring-shift",
    name: "Nearshoring Strategy",
    description: "Compare moving supply chain from Asia to Western Hemisphere (Mexico, Colombia, etc.)",
    icon: "🌎",
    scenarios: [
      {
        name: "Vietnam (Status Quo)",
        country: "VN",
        baseDutyRate: 6.5,
        section301Rate: 0,
        unitValue: 0.5,
        annualUnits: 2000000,
        color: "ocean",
      },
      {
        name: "Mexico (USMCA)",
        country: "MX",
        baseDutyRate: 0,
        section301Rate: 0,
        unitValue: 0.65,
        annualUnits: 2000000,
        color: "green",
      },
      {
        name: "India (Diversification)",
        country: "IN",
        baseDutyRate: 6.5,
        section301Rate: 0,
        unitValue: 0.45,
        annualUnits: 2000000,
        color: "purple",
      },
    ],
  },
  {
    id: "textile-apparel",
    name: "Apparel/Textile Focus",
    description: "High-tariff textile rates (16-28%) across SE Asia sourcing countries",
    icon: "👕",
    scenarios: [
      {
        name: "Vietnam Apparel",
        country: "VN",
        baseDutyRate: 16.5,
        section301Rate: 0,
        unitValue: 2.5,
        annualUnits: 500000,
        color: "ocean",
      },
      {
        name: "Cambodia Apparel",
        country: "KH",
        baseDutyRate: 16.5,
        section301Rate: 0,
        unitValue: 2.0,
        annualUnits: 500000,
        color: "green",
      },
      {
        name: "Bangladesh Apparel",
        country: "BD",
        baseDutyRate: 16.5,
        section301Rate: 0,
        unitValue: 1.8,
        annualUnits: 500000,
        color: "cargo",
      },
      {
        name: "China Apparel (301)",
        country: "CN",
        baseDutyRate: 16.5,
        section301Rate: 25,
        unitValue: 3.0,
        annualUnits: 500000,
        color: "red",
      },
    ],
  },
];

export function createScenarioSetFromPreset(preset: TradePolicy): SavedScenarioSet {
  return {
    id: `set-${Date.now()}`,
    name: preset.name,
    description: preset.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scenarios: preset.scenarios.map((s, i) => ({
      ...s,
      id: `preset-${preset.id}-${i}-${Date.now()}`,
    })),
    tags: ["preset", preset.id],
  };
}
