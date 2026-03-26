'use client';

import { Settings, CreditCard, Users, Building2, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-500 to-indigo-500 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900">Settings</h1>
        </div>
        <p className="text-navy-500">Manage your account, team, and subscription.</p>
      </div>

      {/* Settings cards */}
      <div className="space-y-4">
        {[
          {
            icon: Building2,
            title: 'Organization',
            description: 'Company name, address, and business details',
          },
          {
            icon: Users,
            title: 'Team Members',
            description: 'Invite teammates and manage roles',
          },
          {
            icon: CreditCard,
            title: 'Billing & Subscription',
            description: 'Manage your plan, payment methods, and invoices',
            action: 'Manage Billing',
            onClick: async () => {
              const res = await fetch('/api/stripe/portal', { method: 'POST' });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            },
          },
          {
            icon: Shield,
            title: 'Security',
            description: 'Password, two-factor authentication, and sessions',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-navy-200/60 shadow-card p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-navy-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-800">{item.title}</h3>
                  <p className="text-sm text-navy-500">{item.description}</p>
                </div>
              </div>
              {item.action && (
                <button
                  onClick={item.onClick}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  {item.action}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
