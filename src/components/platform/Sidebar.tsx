'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebarStore } from '@/lib/store';
import {
  LayoutDashboard,
  Calculator,
  Ship,
  Route,
  Warehouse,
  Bot,
  ShieldCheck,
  FileText,
  BookOpen,
  Settings,
  X,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Calculators', href: '/calculators', icon: Calculator },
  { label: 'Shipments', href: '/shipments', icon: Ship },
  { label: 'Routes', href: '/routes', icon: Route },
  { label: 'FTZ', href: '/ftz', icon: Warehouse },
  { label: 'AI Agents', href: '/ai', icon: Bot },
  { label: 'Compliance', href: '/compliance', icon: ShieldCheck },
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'Knowledge Base', href: '/knowledge', icon: BookOpen },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebarStore();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-navy-900/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-navy-200/60
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-navy-200/60">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-ocean-500 to-indigo-500 flex items-center justify-center">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-navy-900">Shipping Savior</span>
          </Link>
          <button onClick={close} className="lg:hidden p-1 text-navy-400 hover:text-navy-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="px-3 py-4 space-y-1 overflow-y-auto h-[calc(100%-65px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-ocean-50 text-ocean-700 border border-ocean-200/60'
                      : 'text-navy-600 hover:bg-navy-50 hover:text-navy-800 border border-transparent'
                  }
                `}
              >
                <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-ocean-600' : 'text-navy-400 group-hover:text-navy-600'}`} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 text-ocean-400" />}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
