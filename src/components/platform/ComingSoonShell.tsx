'use client';

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
  LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
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
};

interface ComingSoonShellProps {
  title: string;
  description: string;
  iconName: string;
  features?: string[];
}

export default function ComingSoonShell({ title, description, iconName, features }: ComingSoonShellProps) {
  const Icon = iconMap[iconName] || LayoutDashboard;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-500 to-indigo-500 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
        </div>
        <p className="text-navy-500">{description}</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white rounded-2xl border border-navy-200/60 shadow-card p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-ocean-50 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-ocean-500" />
        </div>
        <h2 className="text-xl font-semibold text-navy-800 mb-2">Coming Soon</h2>
        <p className="text-navy-500 mb-6 max-w-md mx-auto">
          We&apos;re building something powerful. This module is under active development and will be available soon.
        </p>

        {features && features.length > 0 && (
          <div className="text-left max-w-sm mx-auto">
            <p className="text-sm font-medium text-navy-700 mb-3">What to expect:</p>
            <ul className="space-y-2">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-navy-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-ocean-400 mt-1.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-navy-50 rounded-full text-xs font-medium text-navy-500">
          <span className="w-2 h-2 rounded-full bg-cargo-400 animate-pulse" />
          In Development
        </div>
      </div>
    </div>
  );
}
