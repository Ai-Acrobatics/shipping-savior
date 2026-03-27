"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Ship,
  Menu,
  X,
  LayoutDashboard,
  Calculator,
  Clock,
  Settings,
  LogOut,
} from "lucide-react";

const navLinks = [
  { label: "Dashboard", href: "/platform", icon: LayoutDashboard },
  { label: "Calculators", href: "/platform/calculators", icon: Calculator },
  { label: "History", href: "/platform/history", icon: Clock },
  { label: "Settings", href: "/platform/settings", icon: Settings },
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
                onClick={() => setOpen(false)}
                className="p-1 text-navy-400 hover:text-navy-200 transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
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
            </nav>

            {/* User Info */}
            <div className="px-4 py-4 border-t border-navy-800 space-y-3">
              <div className="flex items-center gap-3">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name ?? 'User'}
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
