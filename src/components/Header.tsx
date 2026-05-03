"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Ship, Menu, X, LayoutDashboard, ChevronDown } from "lucide-react";

const navLinks = [
  { label: "Calculators", href: "/calculators" },
  { label: "Demo", href: "/demo" },
  { label: "Pricing", href: "/pricing" },
  { label: "Dashboard", href: "/dashboard" },
];

// AI-8775: vertical landing pages — surfaced as a dedicated Industries dropdown
// so persona-specific buyers can self-serve into the funnel.
const industryLinks = [
  { label: "Cold-chain", href: "/industries/cold-chain" },
  { label: "Automotive", href: "/industries/automotive" },
  { label: "Personal care + beauty", href: "/industries/personal-care" },
];

const moreLinks = [
  { label: "Carriers", href: "/carrier-comparison" },
  { label: "FTZ Analyzer", href: "/ftz-analyzer" },
  { label: "Port Finder", href: "/port-finder" },
  { label: "Knowledge Base", href: "/knowledge-base" },
  { label: "Data Intelligence", href: "/data-intelligence" },
  { label: "Architecture", href: "/platform-architecture" },
  { label: "Project Phases", href: "/phases" },
  { label: "Six Sigma", href: "/six-sigma" },
  { label: "Monetization", href: "/monetization" },
  { label: "Tech Spec", href: "/tech-spec" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const industriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
      if (
        industriesRef.current &&
        !industriesRef.current.contains(e.target as Node)
      ) {
        setIndustriesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-white/90 header-frosted border-b border-navy-100 ${
        scrolled ? "shadow-soft py-3" : "py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-500 to-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
            <Ship className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-navy-900">
            Shipping<span className="gradient-text">Savior</span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-navy-500 hover:text-ocean-600 transition-colors group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-ocean-500 to-indigo-500 rounded-full transition-all duration-300 group-hover:w-full" />
            </a>
          ))}

          {/* Industries dropdown (AI-8775) */}
          <div ref={industriesRef} className="relative">
            <button
              onClick={() => setIndustriesOpen(!industriesOpen)}
              className="relative flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-ocean-600 transition-colors group"
            >
              Industries
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${industriesOpen ? "rotate-180" : ""}`}
              />
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-ocean-500 to-indigo-500 rounded-full transition-all duration-300 group-hover:w-full" />
            </button>
            {industriesOpen && (
              <div className="absolute top-full right-0 mt-3 w-56 bg-white border border-navy-100 rounded-xl shadow-card p-2 z-50">
                {industryLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 text-sm text-navy-600 hover:text-ocean-600 hover:bg-ocean-50 rounded-lg transition-colors"
                    onClick={() => setIndustriesOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* More dropdown */}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="relative flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-ocean-600 transition-colors group"
            >
              More
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} />
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-ocean-500 to-indigo-500 rounded-full transition-all duration-300 group-hover:w-full" />
            </button>
            {moreOpen && (
              <div className="absolute top-full right-0 mt-3 w-52 bg-white border border-navy-100 rounded-xl shadow-card p-2 z-50">
                {moreLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 text-sm text-navy-600 hover:text-ocean-600 hover:bg-ocean-50 rounded-lg transition-colors"
                    onClick={() => setMoreOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>

        <Link
          href="/dashboard"
          className="hidden lg:inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg"
          style={{
            background: "linear-gradient(135deg, #1a56db, #6366f1)",
            boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)",
          }}
        >
          <LayoutDashboard className="w-4 h-4" />
          Live Demo
        </Link>

        <button
          className="lg:hidden text-navy-600"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border border-navy-100 shadow-card mt-2 mx-4 rounded-xl p-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-2.5 text-sm font-medium text-navy-600 hover:text-ocean-600"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}

          {/* Mobile: Industries section (AI-8775) */}
          <div className="border-t border-navy-100 mt-2 pt-2">
            <p className="px-0 py-1.5 text-xs font-semibold text-navy-400 uppercase tracking-wider">
              Industries
            </p>
            {industryLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 text-sm text-navy-500 hover:text-ocean-600"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile: More section */}
          <div className="border-t border-navy-100 mt-2 pt-2">
            <p className="px-0 py-1.5 text-xs font-semibold text-navy-400 uppercase tracking-wider">
              More
            </p>
            {moreLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 text-sm text-navy-500 hover:text-ocean-600"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>

          <Link
            href="/dashboard"
            className="mt-3 flex items-center justify-center gap-2 text-sm btn-primary py-2.5 rounded-xl"
            onClick={() => setMobileOpen(false)}
          >
            <LayoutDashboard className="w-4 h-4" />
            Live Demo
          </Link>
        </div>
      )}
    </header>
  );
}
