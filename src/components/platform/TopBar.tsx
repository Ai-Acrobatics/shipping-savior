'use client';

import { useSidebarStore } from '@/lib/store';
import { Menu, Bell, User } from 'lucide-react';

export default function TopBar() {
  const { toggle } = useSidebarStore();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-navy-200/60">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left — hamburger + org name */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="lg:hidden p-2 rounded-lg text-navy-500 hover:bg-navy-50 hover:text-navy-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-navy-800">My Organization</p>
            <p className="text-xs text-navy-400">Starter Plan</p>
          </div>
        </div>

        {/* Right — notifications + avatar */}
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-lg text-navy-500 hover:bg-navy-50 hover:text-navy-700 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ocean-500 rounded-full" />
          </button>
          <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-navy-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-400 to-indigo-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
