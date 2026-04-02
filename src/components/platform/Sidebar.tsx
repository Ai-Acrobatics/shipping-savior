"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Ship,
  LayoutDashboard,
  Calculator,
  Clock,
  Settings,
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

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/platform", icon: LayoutDashboard },
    ],
  },
  {
    title: "Tools",
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
    ],
  },
  {
    title: "Data",
    items: [
      { label: "History", href: "/platform/history", icon: Clock },
      { label: "Contracts", href: "/platform/contracts", icon: FileText },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Team Members", href: "/platform/settings", icon: Users },
      { label: "Organization", href: "/platform/settings", icon: Building2 },
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
}

export default function Sidebar({ collapsed, onToggle, user }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    "/platform/calculators": true,
  });

  const isActive = (href: string) => {
    if (href === "/platform") return pathname === "/platform";
    return pathname.startsWith(href);
  };

  const isExactActive = (href: string) => pathname === href;

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) => ({ ...prev, [href]: !prev[href] }));
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
        {navSections.map((section, sIdx) => (
          <div key={section.title} className={sIdx > 0 ? "mt-5" : ""}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-navy-600">
                {section.title}
              </p>
            )}
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
                          const childActive = isExactActive(child.href) || pathname.startsWith(child.href + "/");
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
          </div>
        ))}
      </nav>

      {/* User Menu */}
      {user && <UserMenu user={user} collapsed={collapsed} />}

      {/* Collapse Toggle */}
      <button
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
