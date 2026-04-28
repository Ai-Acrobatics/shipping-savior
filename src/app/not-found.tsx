import Link from "next/link";
import { Ship, Compass, ArrowRight } from "lucide-react";

const suggestions = [
  { label: "Live Demo", href: "/demo", desc: "Walk through 4 real-world scenarios" },
  { label: "Calculators", href: "/calculators", desc: "Landed cost, FTZ savings, and more" },
  { label: "Pricing", href: "/pricing", desc: "Free, Premium, and Enterprise tiers" },
  { label: "Dashboard", href: "/dashboard", desc: "Operations overview" },
];

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-white via-ocean-50/30 to-white">
      <header className="border-b border-navy-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center shadow-sm">
              <Ship className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-navy-900">
              Shipping<span className="gradient-text">Savior</span>
            </span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 glass-premium rounded-full px-5 py-2.5 mb-6 shadow-soft">
            <Compass className="w-4 h-4 text-ocean-600" />
            <span className="text-sm font-medium text-navy-700">404 — Off course</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-navy-900 mb-4 tracking-tight">
            Page not found
          </h1>
          <p className="text-lg text-navy-600 mb-10 max-w-lg mx-auto">
            The container you&apos;re looking for isn&apos;t in this port. Try one of these instead.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 max-w-xl mx-auto mb-8">
            {suggestions.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group bg-white border border-navy-100 hover:border-ocean-200 rounded-xl p-4 text-left shadow-soft hover:shadow-card transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-navy-900 group-hover:text-ocean-700 transition-colors">
                    {s.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-navy-400 group-hover:text-ocean-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-xs text-navy-500">{s.desc}</span>
              </Link>
            ))}
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-ocean-600 hover:text-ocean-700"
          >
            Or head home
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
