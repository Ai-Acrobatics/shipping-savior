"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Ship, Menu, X, LayoutDashboard } from "lucide-react";

const navLinks = [
  { label: "Platform", href: "/#platform" },
  { label: "Calculators", href: "/#calculators" },
  { label: "Routes", href: "/#routes" },
  { label: "FTZ Strategy", href: "/#ftz" },
  { label: "Architecture", href: "/#architecture" },
  { label: "Roadmap", href: "/#roadmap" },
  { label: "Knowledge Base", href: "/knowledge-base" },
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
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
            <Ship className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-navy-900">
            Shipping<span className="gradient-text">Savior</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-navy-500 hover:text-ocean-600 transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          href="/dashboard"
          className="hidden md:inline-flex items-center gap-2 text-sm btn-primary px-4 py-2 rounded-xl"
        >
          <LayoutDashboard className="w-4 h-4" />
          Live Demo
        </Link>

        <button
          className="md:hidden text-navy-600"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border border-navy-100 shadow-card mt-2 mx-4 rounded-xl p-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-2.5 text-sm text-navy-600 hover:text-ocean-600 font-medium"
              onClick={() => setMobileOpen(false)}
            >
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
