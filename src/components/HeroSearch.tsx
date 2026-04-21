"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, Truck, BarChart3, ArrowRight } from "lucide-react";

const quickLinks = [
  { icon: Package, label: "Track Shipment", hint: "SS-2024-...", href: "/dashboard" },
  { icon: Truck, label: "Find Carrier", hint: "COSCO, MSC...", href: "/dashboard" },
  { icon: BarChart3, label: "Compare Rates", hint: "LAX → Chicago", href: "/dashboard" },
];

export default function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    // Route to /dashboard with query — simple heuristic
    // Shipment ID pattern: SS-XXXX-XXXX
    if (/^SS-/i.test(trimmed) || /^\d{4,}/.test(trimmed)) {
      router.push(`/dashboard?track=${encodeURIComponent(trimmed)}`);
    } else if (/carrier|cosco|msc|evergreen|maersk|cma|hapag/i.test(trimmed)) {
      router.push(`/dashboard?carrier=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(`/dashboard?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 overflow-hidden group focus-within:ring-2 focus-within:ring-teal-400/50 transition-all duration-300">
          <div className="flex items-center pl-5 pr-3 flex-shrink-0">
            <Search className="w-5 h-5 text-navy-400 group-focus-within:text-ocean-500 transition-colors" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Track a shipment, find a carrier, or compare rates..."
            className="flex-1 py-4 pr-4 text-sm md:text-base text-navy-900 placeholder:text-navy-400 bg-transparent outline-none"
            autoComplete="off"
          />
          <button
            type="submit"
            className="flex items-center gap-2 m-2 px-5 py-3 bg-gradient-to-r from-ocean-600 to-indigo-600 hover:from-ocean-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-ocean-500/30 flex-shrink-0"
          >
            <span className="hidden sm:inline">Search</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Quick links */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
        {quickLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-white/80 hover:text-white transition-all duration-200 cursor-pointer"
          >
            <link.icon className="w-3.5 h-3.5 text-teal-300 flex-shrink-0" />
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
