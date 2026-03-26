"use client";

import { useState, useMemo } from "react";
import { Search, Globe, Info, ChevronDown, ChevronUp } from "lucide-react";

interface HTSCode {
  code: string;
  description: string;
  chapter: string;
  section: string;
  rates: Record<string, { rate: string; rateNum: number; program?: string }>;
  unit: string;
  notes?: string;
}

const COUNTRY_ORIGINS = [
  { code: "VN", label: "Vietnam", flag: "🇻🇳" },
  { code: "TH", label: "Thailand", flag: "🇹🇭" },
  { code: "ID", label: "Indonesia", flag: "🇮🇩" },
  { code: "KH", label: "Cambodia", flag: "🇰🇭" },
  { code: "CN", label: "China", flag: "🇨🇳" },
  { code: "IN", label: "India", flag: "🇮🇳" },
  { code: "MX", label: "Mexico", flag: "🇲🇽" },
  { code: "BD", label: "Bangladesh", flag: "🇧🇩" },
];

// Representative HTS codes for SE Asia consumer goods imports
// Rates based on publicly available USITC Schedule B data
const HTS_DATABASE: HTSCode[] = [
  {
    code: "6109.10.0012",
    description: "T-shirts, singlets, tank tops, knit cotton (men's, 340+ g/m²)",
    chapter: "61",
    section: "XI - Textiles and Textile Articles",
    unit: "doz",
    rates: {
      VN: { rate: "16.5%", rateNum: 16.5 },
      TH: { rate: "16.5%", rateNum: 16.5 },
      ID: { rate: "16.5%", rateNum: 16.5 },
      KH: { rate: "16.5%", rateNum: 16.5 },
      CN: { rate: "16.5% + 25%", rateNum: 41.5, program: "Section 301" },
      IN: { rate: "16.5%", rateNum: 16.5 },
      MX: { rate: "Free", rateNum: 0, program: "USMCA" },
      BD: { rate: "16.5%", rateNum: 16.5 },
    },
  },
  {
    code: "6403.91.6090",
    description: "Footwear, leather upper/rubber or plastic sole (other)",
    chapter: "64",
    section: "XII - Footwear, Headgear",
    unit: "prs",
    rates: {
      VN: { rate: "8.5%", rateNum: 8.5 },
      TH: { rate: "8.5%", rateNum: 8.5 },
      ID: { rate: "8.5%", rateNum: 8.5 },
      KH: { rate: "8.5%", rateNum: 8.5 },
      CN: { rate: "8.5% + 20%", rateNum: 28.5, program: "Section 301" },
      IN: { rate: "8.5%", rateNum: 8.5 },
      MX: { rate: "Free", rateNum: 0, program: "USMCA" },
      BD: { rate: "8.5%", rateNum: 8.5 },
    },
  },
  {
    code: "9403.20.0018",
    description: "Metal furniture for offices (other)",
    chapter: "94",
    section: "XX - Misc Manufactured Articles",
    unit: "No.",
    rates: {
      VN: { rate: "Free", rateNum: 0 },
      TH: { rate: "Free", rateNum: 0 },
      ID: { rate: "Free", rateNum: 0 },
      KH: { rate: "Free", rateNum: 0 },
      CN: { rate: "25%", rateNum: 25, program: "Section 301" },
      IN: { rate: "Free", rateNum: 0 },
      MX: { rate: "Free", rateNum: 0, program: "USMCA" },
      BD: { rate: "Free", rateNum: 0 },
    },
  },
  {
    code: "8517.13.0000",
    description: "Smartphones and cellular telephones",
    chapter: "85",
    section: "XVI - Machinery/Electronics",
    unit: "No.",
    rates: {
      VN: { rate: "Free", rateNum: 0 },
      TH: { rate: "Free", rateNum: 0 },
      ID: { rate: "Free", rateNum: 0 },
      KH: { rate: "Free", rateNum: 0 },
      CN: { rate: "20%", rateNum: 20, program: "Section 301" },
      IN: { rate: "Free", rateNum: 0 },
      MX: { rate: "Free", rateNum: 0, program: "USMCA" },
      BD: { rate: "Free", rateNum: 0 },
    },
    notes: "ITA agreement eliminates most tariffs for participating countries",
  },
  {
    code: "9503.00.0090",
    description: "Toys, puzzles, games (other than dolls or video game consoles)",
    chapter: "95",
    section: "XX - Misc Manufactured Articles",
    unit: "No.",
    rates: {
      VN: { rate: "Free", rateNum: 0 },
      TH: { rate: "Free", rateNum: 0 },
      ID: { rate: "Free", rateNum: 0 },
      KH: { rate: "Free", rateNum: 0 },
      CN: { rate: "Free + 7.5%", rateNum: 7.5, program: "Phase 1 Deal" },
      IN: { rate: "Free", rateNum: 0 },
      MX: { rate: "Free", rateNum: 0, program: "USMCA" },
      BD: { rate: "Free", rateNum: 0 },
    },
  },
  {
    code: "4202.92.3031",
    description: "Travel bags, backpacks (outer surface textile)",
    chapter: "42",
    section: "VIII - Leather/Travel Goods",
    unit: "No.",
    rates: {
      VN: { rate: "17.6%", rateNum: 17.6 },
      TH: { rate: "17.6%", rateNum: 17.6 },
      ID: { rate: "17.6%", rateNum: 17.6 },
      KH: { rate: "17.6%", rateNum: 17.6 },
      CN: { rate: "17.6% + 25%", rateNum: 42.6, program: "Section 301" },
      IN: { rate: "17.6%", rateNum: 17.6 },
      MX: { rate: "Free", rateNum: 0, program: "USMCA" },
      BD: { rate: "17.6%", rateNum: 17.6 },
    },
  },
  {
    code: "7323.99.9080",
    description: "Kitchenware, steel/iron articles for kitchen use (other)",
    chapter: "73",
    section: "XV - Base Metals",
    unit: "kg",
    rates: {
      VN: { rate: "3.4%", rateNum: 3.4 },
      TH: { rate: "3.4%", rateNum: 3.4 },
      ID: { rate: "3.4%", rateNum: 3.4 },
      KH: { rate: "3.4%", rateNum: 3.4 },
      CN: { rate: "3.4% + 25%", rateNum: 28.4, program: "Section 301" },
      IN: { rate: "3.4%", rateNum: 3.4 },
      MX: { rate: "Free", rateNum: 0, program: "USMCA" },
      BD: { rate: "3.4%", rateNum: 3.4 },
    },
  },
  {
    code: "6211.43.0060",
    description: "Women's/girls' track suits, training sets (man-made fibers)",
    chapter: "62",
    section: "XI - Textiles",
    unit: "doz",
    rates: {
      VN: { rate: "28.2%", rateNum: 28.2 },
      TH: { rate: "28.2%", rateNum: 28.2 },
      ID: { rate: "28.2%", rateNum: 28.2 },
      KH: { rate: "28.2%", rateNum: 28.2 },
      CN: { rate: "28.2% + 25%", rateNum: 53.2, program: "Section 301" },
      IN: { rate: "28.2%", rateNum: 28.2 },
      MX: { rate: "Free", rateNum: 0, program: "USMCA" },
      BD: { rate: "28.2%", rateNum: 28.2 },
    },
  },
  {
    code: "8543.70.9650",
    description: "Electric massagers, personal care electronics",
    chapter: "85",
    section: "XVI - Machinery/Electronics",
    unit: "No.",
    rates: {
      VN: { rate: "Free", rateNum: 0 },
      TH: { rate: "Free", rateNum: 0 },
      ID: { rate: "Free", rateNum: 0 },
      KH: { rate: "Free", rateNum: 0 },
      CN: { rate: "25%", rateNum: 25, program: "Section 301" },
      IN: { rate: "Free", rateNum: 0 },
      MX: { rate: "Free", rateNum: 0, program: "USMCA" },
      BD: { rate: "Free", rateNum: 0 },
    },
  },
  {
    code: "4016.99.6050",
    description: "Rubber/plastic household goods (other)",
    chapter: "40",
    section: "VII - Plastics/Rubber",
    unit: "kg",
    rates: {
      VN: { rate: "3.4%", rateNum: 3.4 },
      TH: { rate: "3.4%", rateNum: 3.4 },
      ID: { rate: "3.4%", rateNum: 3.4 },
      KH: { rate: "3.4%", rateNum: 3.4 },
      CN: { rate: "3.4% + 25%", rateNum: 28.4, program: "Section 301" },
      IN: { rate: "3.4%", rateNum: 3.4 },
      MX: { rate: "Free", rateNum: 0, program: "USMCA" },
      BD: { rate: "3.4%", rateNum: 3.4 },
    },
  },
];

interface Props {
  onSelectRate?: (htsCode: string, description: string, rate: number, country: string) => void;
}

export default function HTSCodeLookup({ onSelectRate }: Props) {
  const [query, setQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("VN");
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return HTS_DATABASE;
    return HTS_DATABASE.filter(
      (h) =>
        h.code.includes(q) ||
        h.description.toLowerCase().includes(q) ||
        h.section.toLowerCase().includes(q) ||
        h.chapter.includes(q)
    );
  }, [query]);

  const selectedCountryInfo = COUNTRY_ORIGINS.find((c) => c.code === selectedCountry);

  return (
    <div className="space-y-4">
      {/* Search + Country Filter */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-navy-400" />
          <input
            type="text"
            placeholder="Search HTS code or product description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ocean-500 bg-navy-900/60"
          />
        </div>
        <div className="relative">
          <Globe className="absolute left-3 top-2.5 w-4 h-4 text-navy-400" />
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="glass rounded-xl pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ocean-500 bg-navy-900/60 appearance-none cursor-pointer"
          >
            {COUNTRY_ORIGINS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Country context */}
      <div className="flex items-center gap-2 text-xs text-navy-400">
        <Info className="w-3 h-3" />
        <span>
          Showing duty rates for goods originating in{" "}
          <span className="text-ocean-300 font-medium">
            {selectedCountryInfo?.flag} {selectedCountryInfo?.label}
          </span>
          . Rates are MFN (Column 1) unless noted. Verify at{" "}
          <span className="text-ocean-400">hts.usitc.gov</span>.
        </span>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-navy-400 text-sm">
            No HTS codes found matching &quot;{query}&quot;
          </div>
        )}

        {filtered.map((item) => {
          const countryRate = item.rates[selectedCountry];
          const isExpanded = expandedCode === item.code;

          return (
            <div
              key={item.code}
              className="glass rounded-xl overflow-hidden"
            >
              {/* Main row */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedCode(isExpanded ? null : item.code)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-ocean-300 font-semibold">
                      {item.code}
                    </span>
                    <span className="text-xs text-navy-500 hidden sm:inline">
                      Ch. {item.chapter}
                    </span>
                    {countryRate?.program && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cargo-500/20 text-cargo-300">
                        {countryRate.program}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-navy-300 truncate">{item.description}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-lg font-bold ${
                        countryRate?.rateNum === 0
                          ? "text-green-400"
                          : countryRate?.rateNum > 20
                          ? "text-red-400"
                          : "text-cargo-300"
                      }`}
                    >
                      {countryRate?.rate ?? "N/A"}
                    </div>
                    <div className="text-xs text-navy-500">duty rate</div>
                  </div>

                  {onSelectRate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRate(
                          item.code,
                          item.description,
                          countryRate?.rateNum ?? 0,
                          selectedCountry
                        );
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-ocean-600/30 hover:bg-ocean-600/50 text-ocean-300 transition-colors"
                    >
                      Use Rate
                    </button>
                  )}

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-navy-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-navy-500" />
                  )}
                </div>
              </div>

              {/* Expanded: all country rates */}
              {isExpanded && (
                <div className="border-t border-white/5 p-4 bg-navy-950/30">
                  <div className="text-xs text-navy-400 mb-3 font-medium">
                    {item.section} · Unit: {item.unit}
                  </div>

                  {item.notes && (
                    <div className="flex items-start gap-2 text-xs text-cargo-300 bg-cargo-500/10 rounded-lg p-3 mb-3">
                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {item.notes}
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {COUNTRY_ORIGINS.map((country) => {
                      const rate = item.rates[country.code];
                      return (
                        <div
                          key={country.code}
                          className={`rounded-lg p-2 text-center ${
                            country.code === selectedCountry
                              ? "bg-ocean-600/20 border border-ocean-500/30"
                              : "bg-white/3"
                          }`}
                        >
                          <div className="text-sm mb-0.5">{country.flag}</div>
                          <div className="text-xs text-navy-400">{country.label}</div>
                          <div
                            className={`text-sm font-semibold mt-1 ${
                              rate?.rateNum === 0
                                ? "text-green-400"
                                : rate?.rateNum > 20
                                ? "text-red-400"
                                : "text-cargo-300"
                            }`}
                          >
                            {rate?.rate ?? "N/A"}
                          </div>
                          {rate?.program && (
                            <div className="text-xs text-navy-500 mt-0.5">{rate.program}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-xs text-navy-600 text-center">
        Sample HTS codes for SE Asia import categories. Full database: 100K+ codes at hts.usitc.gov
      </div>
    </div>
  );
}
