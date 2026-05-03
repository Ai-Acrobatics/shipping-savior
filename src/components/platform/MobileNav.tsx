"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Ship,
  Menu,
  X,
  LogOut,
  Calculator,
  Clock,
  DollarSign,
  BarChart3,
  Shield,
  Scale,
  Box,
  FileText,
  Package,
  BookOpen,
  Compass,
  Map,
  Activity,
  Bell,
  LayoutDashboard,
  Upload,
  Settings as SettingsIcon,
  Sparkles,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

/* ─────────── IA: PLAN / FIND / PRICE / OPERATE (AI-8775) ─────────── */
// Mirrors desktop Sidebar — same 4 sections, same routes.
const navSections: NavSection[] = [
  {
    title: "Plan",
    items: [
      { label: "Calculators", href: "/platform/calculators", icon: Calculator },
      { label: "Landed Cost", href: "/platform/calculators/landed-cost", icon: DollarSign },
      { label: "Unit Economics", href: "/platform/calculators/unit-economics", icon: BarChart3 },
      { label: "FTZ Analyzer", href: "/platform/calculators/ftz-savings", icon: Shield },
      { label: "PF/NPF Compare", href: "/platform/calculators/pf-npf", icon: Scale },
      { label: "Container Util", href: "/platform/calculators/container", icon: Box },
      { label: "Tariff Scenarios", href: "/platform/calculators/tariff-scenario", icon: FileText },
      { label: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
      { label: "Onboarding", href: "/platform/settings", icon: Sparkles },
    ],
  },
  {
    title: "Find",
    items: [
      { label: "Carrier Discovery", href: "/carrier-comparison", icon: Compass },
      { label: "Carrier Reliability", href: "/carrier-comparison", icon: Activity },
      { label: "Routes", href: "/routes", icon: Map },
    ],
  },
  {
    title: "Price",
    items: [
      { label: "Contracts", href: "/platform/contracts", icon: FileText },
      { label: "Tariff Alerts", href: "/platform/contracts", icon: Bell },
      { label: "Landed Cost Calculator", href: "/platform/calculators/landed-cost", icon: DollarSign },
    ],
  },
  {
    title: "Operate",
    items: [
      { label: "Dashboard", href: "/platform", icon: LayoutDashboard },
      { label: "Shipments", href: "/platform/shipments", icon: Package },
      { label: "BOL Upload", href: "/platform/shipments/import", icon: Upload },
      { label: "History", href: "/platform/history", icon: Clock },
      { label: "Settings", href: "/platform/settings", icon: SettingsIcon },
    ],
  },
];

interface MobileNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0]?.[0] ?? "U").toUpperCase();
}

export default function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/platform") return pathname === "/platform";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="lg:hidden">
      {/* Hamburger Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-2 text-navy-600 hover:text-navy-900 transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          {/* Sidebar Panel */}
          <div className="relative w-[280px] h-full bg-[#030d1a] flex flex-col animate-slide-in-left">
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-navy-800 shrink-0">
              <Link
                href="/platform"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center">
                  <Ship className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-semibold text-sm">
                  ShippingSavior
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 text-navy-400 hover:text-navy-200 transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sectioned Nav Links */}
            <nav className="flex-1 py-4 px-2 overflow-y-auto">
              {navSections.map((section, sIdx) => (
                <div
                  key={section.title}
                  className={
                    sIdx > 0 ? "mt-4 pt-4 border-t border-navy-800/60" : ""
                  }
                >
                  <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ocean-500/80">
                    {section.title}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map((link) => {
                      const active = isActive(link.href);
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href + link.label}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            active
                              ? "bg-ocean-500/15 text-ocean-400"
                              : "text-navy-400 hover:bg-navy-800/50 hover:text-navy-200"
                          }`}
                        >
                          <Icon className="w-5 h-5 shrink-0" />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* User Info */}
            <div className="px-4 py-4 border-t border-navy-800 space-y-3">
              <div className="flex items-center gap-3">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name ?? "User"}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {getInitials(user.name)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-200 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-navy-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
