"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Ship, LayoutDashboard, MapPin, BarChart3, PiggyBank,
  Bell, Activity, ChevronLeft, ChevronRight, RefreshCw,
  Menu, X, Settings,
} from "lucide-react";
import { notifications as notifData } from "@/lib/data/dashboard";

const sidebarLinks = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tracking", href: "/dashboard/tracking", icon: MapPin },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Savings", href: "/dashboard/savings", icon: PiggyBank },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const unreadCount = notifData.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#020a17] flex">
      {/* Sidebar — Desktop */}
      <aside
        className={`hidden lg:flex flex-col border-r border-white/5 bg-[#030d1a] transition-all duration-300 sticky top-0 h-screen ${
          collapsed ? "w-[68px]" : "w-[240px]"
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center flex-shrink-0">
              <Ship className="w-4.5 h-4.5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-bold text-sm whitespace-nowrap">
                Shipping<span className="gradient-text">Savior</span>
              </span>
            )}
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                  isActive
                    ? "bg-ocean-500/20 text-ocean-300"
                    : "text-navy-400 hover:text-white hover:bg-white/5"
                }`}
                title={collapsed ? link.label : undefined}
              >
                <link.icon className="w-4.5 h-4.5 flex-shrink-0" />
                {!collapsed && <span>{link.label}</span>}
                {link.label === "Notifications" && unreadCount > 0 && (
                  <span className={`${collapsed ? "absolute -top-1 -right-1" : "ml-auto"} w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center`}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-navy-500 hover:text-navy-300 hover:bg-white/5 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="glass border-b border-white/5 px-4 sm:px-6 py-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu toggle */}
              <button
                className="lg:hidden p-2 rounded-lg glass glass-hover"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-4 h-4 text-navy-300" /> : <Menu className="w-4 h-4 text-navy-300" />}
              </button>

              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-ocean-400" />
                <span className="text-sm font-medium text-white hidden sm:inline">
                  {sidebarLinks.find((l) => l.href === pathname)?.label || "Dashboard"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/notifications"
                className="relative p-2 rounded-lg glass glass-hover"
              >
                <Bell className="w-4 h-4 text-navy-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <button className="flex items-center gap-2 text-xs glass glass-hover px-3 py-2 rounded-lg text-navy-300">
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Live</span>
              </button>

              <button className="p-2 rounded-lg glass glass-hover">
                <Settings className="w-4 h-4 text-navy-300" />
              </button>

              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-600 to-ocean-800 flex items-center justify-center text-xs font-bold text-white">
                JS
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50" onClick={() => setMobileOpen(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <div
              className="absolute left-0 top-0 bottom-0 w-[240px] bg-[#030d1a] border-r border-white/5 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center">
                  <Ship className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="font-bold text-sm">
                  Shipping<span className="gradient-text">Savior</span>
                </span>
              </div>
              <nav className="space-y-1">
                {sidebarLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-ocean-500/20 text-ocean-300"
                          : "text-navy-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <link.icon className="w-4.5 h-4.5" />
                      <span>{link.label}</span>
                      {link.label === "Notifications" && unreadCount > 0 && (
                        <span className="ml-auto w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
