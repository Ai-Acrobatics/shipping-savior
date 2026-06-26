"use client";

/**
 * CommandSearch — "Tell us what you're looking to do" (AI-8053)
 *
 * Blake's #1 ask from the 2026-04-16 meeting: a simple homepage with one
 * search bar where you type plain English ("track my container", "what does
 * it cost to import") and it takes you straight to the right tool.
 *
 * Design principle (Blake's words): "hand it to your grandmother and they'd
 * figure it out." One big input, plain-language suggestions, keyboard-driven,
 * no jargon required. Fuzzy matching via fuse.js (already a dependency) so
 * typos and partial phrases still land on the right action.
 */

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import {
  Search,
  DollarSign,
  Package,
  Compass,
  Map,
  MapPin,
  Upload,
  Shield,
  Box,
  BarChart3,
  Scale,
  FileText,
  Clock,
  CreditCard,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";

interface Action {
  label: string;
  hint: string;
  href: string;
  icon: LucideIcon;
  /** Plain-English phrases a non-expert might type. */
  keywords: string[];
  /** Surfaced as a default chip when the box is empty. */
  featured?: boolean;
}

// Ordered so the four most-common jobs are the default suggestions.
const ACTIONS: Action[] = [
  {
    label: "Track a shipment",
    hint: "See where your container is and when it arrives",
    href: "/platform/shipments",
    icon: Package,
    keywords: ["track", "where is my", "container", "status", "eta", "arrival", "find my shipment", "locate"],
    featured: true,
  },
  {
    label: "Calculate landed cost",
    hint: "Total cost to import — duties, freight, fees",
    href: "/platform/calculators/landed-cost",
    icon: DollarSign,
    keywords: ["cost", "how much", "landed", "duty", "duties", "total cost", "import cost", "price to ship", "tariff cost"],
    featured: true,
  },
  {
    label: "Compare port-to-port routes",
    hint: "Pick an origin and destination, see the best lanes",
    href: "/routes",
    icon: Map,
    keywords: ["route", "port to port", "lane", "from to", "sailing", "transit time", "shipping route", "ocean route", "best way to ship"],
    featured: true,
  },
  {
    label: "Find a carrier",
    hint: "See who can move your freight and how reliable they are",
    href: "/carrier-comparison",
    icon: Compass,
    keywords: ["carrier", "who can ship", "shipping line", "reliability", "on time", "vessel", "ocean carrier", "find a shipper"],
    featured: true,
  },
  {
    label: "Find a port",
    hint: "Look up a port or terminal",
    href: "/port-finder",
    icon: MapPin,
    keywords: ["port", "terminal", "nearest port", "harbor", "find port"],
  },
  {
    label: "Upload a Bill of Lading",
    hint: "Drop in a BOL and we'll read the details",
    href: "/platform/shipments/import",
    icon: Upload,
    keywords: ["bol", "bill of lading", "upload", "document", "import bol", "add shipment", "paperwork"],
  },
  {
    label: "FTZ savings",
    hint: "See if a Foreign Trade Zone saves you money",
    href: "/platform/calculators/ftz-savings",
    icon: Shield,
    keywords: ["ftz", "foreign trade zone", "defer duty", "duty savings", "save on duties"],
  },
  {
    label: "Container utilization",
    hint: "Will it fit? Check how full your container is",
    href: "/platform/calculators/container",
    icon: Box,
    keywords: ["container", "fit", "cbm", "fill", "cube", "how much fits", "space"],
  },
  {
    label: "Unit economics",
    hint: "Cost and margin per unit",
    href: "/platform/calculators/unit-economics",
    icon: BarChart3,
    keywords: ["unit", "margin", "per unit", "profit", "economics", "markup"],
  },
  {
    label: "PF vs NPF compare",
    hint: "Compare prior-fixing options",
    href: "/platform/calculators/pf-npf",
    icon: Scale,
    keywords: ["pf", "npf", "prior fixing", "compare pf"],
  },
  {
    label: "Tariff scenarios",
    hint: "What-if a tariff changes",
    href: "/platform/calculators/tariff-scenario",
    icon: FileText,
    keywords: ["tariff", "what if", "scenario", "tariff change", "duty change"],
  },
  {
    label: "Manage contracts",
    hint: "Your carrier rate agreements",
    href: "/platform/contracts",
    icon: FileText,
    keywords: ["contract", "rate agreement", "rates", "agreement"],
  },
  {
    label: "View history",
    hint: "Everything you've run before",
    href: "/platform/history",
    icon: Clock,
    keywords: ["history", "past", "previous", "recent", "what did i do"],
  },
  {
    label: "Billing & plan",
    hint: "Manage your subscription",
    href: "/platform/billing",
    icon: CreditCard,
    keywords: ["billing", "plan", "upgrade", "invoice", "subscription", "pay"],
  },
];

const MAX_RESULTS = 6;

export default function CommandSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(ACTIONS, {
        keys: [
          { name: "label", weight: 2 },
          { name: "keywords", weight: 1 },
          { name: "hint", weight: 0.5 },
        ],
        threshold: 0.45,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    []
  );

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return ACTIONS.filter((a) => a.featured);
    return fuse.search(q).slice(0, MAX_RESULTS).map((r) => r.item);
  }, [query, fuse]);

  // Reset highlight whenever the result set changes.
  useEffect(() => setHighlight(0), [query]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[highlight];
      if (target) go(target.href);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Close the dropdown on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full" data-tour-step="1">
      <label htmlFor="command-search" className="sr-only">
        Tell us what you're looking to do
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-ocean-500" />
        <input
          id="command-search"
          type="text"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Tell us what you're looking to do…"
          className="w-full h-16 pl-14 pr-5 text-lg text-navy-900 placeholder:text-navy-400 bg-white border-2 border-navy-200 rounded-2xl shadow-soft focus:outline-none focus:border-ocean-500 focus:ring-4 focus:ring-ocean-500/10 transition-all"
          aria-expanded={open}
          aria-controls="command-search-results"
          role="combobox"
          aria-autocomplete="list"
        />
      </div>

      {open && results.length > 0 && (
        <ul
          id="command-search-results"
          role="listbox"
          className="absolute z-40 mt-2 w-full bg-white border border-navy-200 rounded-2xl shadow-card overflow-hidden py-1"
        >
          {!query.trim() && (
            <li className="px-4 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-navy-400">
              Popular
            </li>
          )}
          {results.map((action, i) => {
            const Icon = action.icon;
            const active = i === highlight;
            return (
              <li key={action.href + action.label} role="option" aria-selected={active}>
                <button
                  type="button"
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => go(action.href)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    active ? "bg-ocean-50" : "hover:bg-navy-50"
                  }`}
                >
                  <span className="w-9 h-9 shrink-0 rounded-lg bg-ocean-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-ocean-600" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-navy-900 truncate">
                      {action.label}
                    </span>
                    <span className="block text-xs text-navy-500 truncate">{action.hint}</span>
                  </span>
                  {active && (
                    <CornerDownLeft className="w-4 h-4 text-ocean-400 shrink-0" aria-hidden />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {open && query.trim() && results.length === 0 && (
        <div className="absolute z-40 mt-2 w-full bg-white border border-navy-200 rounded-2xl shadow-card px-4 py-5 text-center">
          <p className="text-sm text-navy-600">
            No match for “{query.trim()}”.
          </p>
          <p className="text-xs text-navy-400 mt-1">
            Try “track”, “cost”, “route”, or “carrier”.
          </p>
        </div>
      )}
    </div>
  );
}
