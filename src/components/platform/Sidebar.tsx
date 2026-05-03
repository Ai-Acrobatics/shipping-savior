"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Ship,
  Calculator,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  DollarSign,
  BarChart3,
  Shield,
  Scale,
  Box,
  FileText,
  Users,
  Building2,
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
  CreditCard,
} from "lucide-react";
import UserMenu from "./UserMenu";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

/* ─────────── IA: PLAN / FIND / PRICE / OPERATE (AI-8775) ─────────── */
//
// Reorganization per Blake's product vision: 4 categorical sections that
// match the workflow a freight team actually executes — Plan the move,
// Find the carrier, Price the lane, Operate the shipment.
//
// All hrefs preserve existing routes — this is pure menu restructure,
// no routing changes.

const navSections: NavSection[] = [
  {
    title: "Plan",
    items: [
      {
        label: "Calculators",
        href: "/platform/calculators",
        icon: Calculator,
        children: [
          { label: "Landed Cost", href: "/platform/calculators/landed-cost", icon: DollarSign },
          { label: "Unit Economics", href: "/platform/calculators/unit-economics", icon: BarChart3 },
          { label: "FTZ Analyzer", href: "/platform/calculators/ftz-savings", icon: Shield },
          { label: "PF/NPF Compare", href: "/platform/calculators/pf-npf", icon: Scale },
          { label: "Container Util", href: "/platform/calculators/container", icon: Box },
          { label: "Tariff Scenarios", href: "/platform/calculators/tariff-scenario", icon: FileText },
        ],
      },
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
      { label: "Billing", href: "/platform/billing", icon: CreditCard },
      { label: "Settings", href: "/platform/settings", icon: SettingsIcon },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  planTier?: "free" | "premium" | "enterprise";
}

const PLAN_BADGE_STYLES: Record<string, string> = {
  free: "bg-slate-700/60 text-slate-200 border-slate-600",
  premium: "bg-ocean-500/15 text-ocean-300 border-ocean-500/40",
  enterprise:
    "bg-gradient-to-r from-amber-500/25 to-yellow-500/15 text-amber-200 border-amber-500/40",
};

export default function Sidebar({ collapsed, onToggle, user, planTier = "free" }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    "/platform/calculators": true,
  });
  // Sections collapsed/expanded state — all expanded by default for discoverability.
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const isActive = (href: string) => {
    if (href === "/platform") return pathname === "/platform";
    return pathname.startsWith(href);
  };

  const isExactActive = (href: string) => pathname === href;

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen sticky top-0 bg-[#030d1a] border-r border-navy-800 transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Logo */}
      <Link
        href="/platform"
        className="flex items-center gap-3 px-4 h-16 border-b border-navy-800 shrink-0"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center shrink-0">
          <Ship className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-white font-semibold text-sm whitespace-nowrap">
            Shipping Savior
          </span>
        )}
      </Link>

      {/* Sectioned Nav Links */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {navSections.map((section, sIdx) => {
          const sectionCollapsed = collapsedSections[section.title];
          return (
            <div
              key={section.title}
              className={
                sIdx > 0
                  ? "mt-4 pt-4 border-t border-navy-800/60"
                  : ""
              }
            >
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ocean-500/80 hover:text-ocean-400 transition-colors"
                  aria-expanded={!sectionCollapsed}
                >
                  <span>{section.title}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      sectionCollapsed ? "-rotate-90" : ""
                    }`}
                  />
                </button>
              )}
              {!sectionCollapsed && (
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    const hasChildren = !!item.children?.length;
                    const expanded = expandedItems[item.href];

                    return (
                      <div key={item.href + item.label}>
                        {/* Parent nav item */}
                        <div className="flex items-center">
                          <Link
                            href={item.href}
                            className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              active && !hasChildren
                                ? "bg-ocean-500/15 text-ocean-400 border-l-2 border-ocean-500"
                                : active && hasChildren
                                ? "text-ocean-400"
                                : "text-navy-400 hover:bg-navy-800/50 hover:text-navy-200"
                            }`}
                            title={collapsed ? item.label : undefined}
                          >
                            <Icon className="w-5 h-5 shrink-0" />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                          </Link>
                          {hasChildren && !collapsed && (
                            <button
                              type="button"
                              onClick={() => toggleExpanded(item.href)}
                              className="p-1 text-navy-500 hover:text-navy-300 transition-colors rounded"
                              aria-label={expanded ? "Collapse" : "Expand"}
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  expanded ? "" : "-rotate-90"
                                }`}
                              />
                            </button>
                          )}
                        </div>

                        {/* Children (sub-items) */}
                        {hasChildren && !collapsed && expanded && (
                          <div className="ml-4 pl-3 border-l border-navy-800 space-y-0.5 mt-0.5">
                            {item.children!.map((child) => {
                              const ChildIcon = child.icon;
                              const childActive =
                                isExactActive(child.href) ||
                                pathname.startsWith(child.href + "/");
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                    childActive
                                      ? "bg-ocean-500/10 text-ocean-400"
                                      : "text-navy-500 hover:bg-navy-800/40 hover:text-navy-300"
                                  }`}
                                >
                                  <ChildIcon className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">{child.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Menu */}
      {user && <UserMenu user={user} collapsed={collapsed} />}

      {/* Tier badge (AI-8778) */}
      {!collapsed && (
        <div className="px-3 pb-3 border-t border-navy-800 pt-3">
          <Link
            href="/platform/billing"
            title="Manage plan →"
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-opacity hover:opacity-90 ${
              PLAN_BADGE_STYLES[planTier] ?? PLAN_BADGE_STYLES.free
            }`}
          >
            {planTier}
          </Link>
        </div>
      )}
      {collapsed && (
        <div className="flex justify-center pb-3 border-t border-navy-800 pt-3">
          <Link
            href="/platform/billing"
            title={`${planTier.toUpperCase()} plan — manage`}
            className={`w-2 h-2 rounded-full ${
              planTier === "enterprise"
                ? "bg-amber-400"
                : planTier === "premium"
                  ? "bg-ocean-400"
                  : "bg-slate-400"
            }`}
            aria-label={`${planTier} plan`}
          />
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-center h-12 border-t border-navy-800 text-navy-400 hover:text-navy-200 hover:bg-navy-800/50 transition-colors shrink-0"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </aside>
  );
}
