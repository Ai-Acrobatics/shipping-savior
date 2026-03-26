"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Settings, User } from "lucide-react";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  collapsed: boolean;
}

function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0]?.[0] ?? "U").toUpperCase();
}

export default function UserMenu({ user, collapsed }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div ref={menuRef} className="relative px-2 py-3 border-t border-navy-800">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-3 w-full rounded-lg px-2 py-2 hover:bg-navy-800/50 transition-colors ${
          collapsed ? "justify-center" : ""
        }`}
      >
        {/* Avatar */}
        {user.image ? (
          <img
            src={user.image}
            alt={user.name ?? 'User'}
            className="w-8 h-8 rounded-full shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-white">
              {getInitials(user.name)}
            </span>
          </div>
        )}

        {!collapsed && (
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-navy-200 truncate">
              {user.name}
            </p>
            <p className="text-xs text-navy-500 truncate">{user.email}</p>
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute z-50 bg-[#0a1929] border border-navy-700 rounded-lg shadow-xl py-1 min-w-[200px] ${
            collapsed ? "left-[68px] bottom-2" : "left-2 bottom-full mb-1"
          }`}
        >
          <div className="px-3 py-2 border-b border-navy-700">
            <p className="text-sm font-medium text-navy-200">{user.name}</p>
            <p className="text-xs text-navy-500">{user.email}</p>
          </div>
          <Link
            href="/platform/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-navy-300 hover:bg-navy-800/50 hover:text-navy-100 transition-colors"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          <Link
            href="/platform/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-navy-300 hover:bg-navy-800/50 hover:text-navy-100 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
