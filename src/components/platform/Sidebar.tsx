"use client";

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
} from "lucide-react";
import UserMenu from "./UserMenu";

const navLinks = [
  { label: "Dashboard", href: "/platform", icon: LayoutDashboard },
  { label: "Calculators", href: "/platform/calculators", icon: Calculator },
  { label: "History", href: "/platform/history", icon: Clock },
  { label: "Settings", href: "/platform/settings", icon: Settings },
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

  const isActive = (href: string) => {
    if (href === "/platform") return pathname === "/platform";
    return pathname.startsWith(href);
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
            ShippingSavior
          </span>
        )}
      </Link>

      {/* Nav Links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const active = isActive(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-ocean-500/15 text-ocean-400"
                  : "text-navy-400 hover:bg-navy-800/50 hover:text-navy-200"
              }`}
              title={collapsed ? link.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
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
