"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/platform/Sidebar";
import UserMenu from "@/components/platform/UserMenu";
import MobileNav from "@/components/platform/MobileNav";
import { UpgradePromptHost } from "@/components/billing/UpgradePrompt";
import { Bell } from "lucide-react";

const SIDEBAR_KEY = "shipping-savior-sidebar-collapsed";

interface PlatformShellProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  planTier?: "free" | "premium" | "enterprise";
  children: React.ReactNode;
}

export default function PlatformShell({ user, planTier, children }: PlatformShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Hydrate sidebar state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_KEY);
      if (stored === "true") setCollapsed(true);
    } catch {}
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_KEY, String(next)); } catch {}
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Desktop Sidebar — visibility handled inside Sidebar component (hidden lg:flex) */}
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        user={user}
        planTier={planTier}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-navy-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <MobileNav user={user} />
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell (placeholder) */}
            <button
              className="p-2 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded-lg transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* User Avatar (desktop top bar) */}
            <div className="hidden lg:block">
              <UserMenu user={user} collapsed={false} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* Tier limit upgrade prompt — listens for window CustomEvent (AI-8778) */}
      <UpgradePromptHost />
    </div>
  );
}
