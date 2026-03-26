"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Ship, Menu, X, LayoutDashboard, FileText } from "lucide-react";

const navLinks = [
  { label: "Platform", href: "/#platform" },
  { label: "Calculators", href: "/#calculators" },
  { label: "FTZ Strategy", href: "/#ftz" },
  { label: "Wireframes", href: "/#wireframes" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Knowledge Base", href: "/knowledge-base" },
  { label: "Data Intelligence", href: "/data-intelligence" },
  { label: "Phases", href: "/phases" },
  { label: "Proposal", href: "/agreement" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 header-frosted shadow-soft border-b border-navy-100 py-3"
          : "bg-transparent py-5"
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
              className={`relative text-sm font-medium transition-colors group ${
                link.label === "Proposal"
                  ? "text-ocean-600 hover:text-indigo-600"
                  : "text-navy-500 hover:text-ocean-600"
              }`}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-ocean-500 to-indigo-500 rounded-full transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
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
              className={`block py-2.5 text-sm font-medium ${
                link.label === "Proposal"
                  ? "text-ocean-600"
                  : "text-navy-600 hover:text-ocean-600"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label === "Proposal" && <FileText className="w-4 h-4 inline mr-2" />}
              {link.label}
            </a>
          ))}
          <Link
            href="/dashboard"
            className="mt-2 flex items-center justify-center gap-2 text-sm btn-primary py-2.5 rounded-xl"
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
