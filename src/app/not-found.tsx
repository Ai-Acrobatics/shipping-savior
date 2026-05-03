import Link from "next/link";
import type { Metadata } from "next";
import { Ship, Anchor, ArrowRight, Home, Tag, Play } from "lucide-react";

export const metadata: Metadata = {
  title: "404 — Shipping Savior",
  description: "Page not found. The page may have moved or never existed.",
};

const suggestions = [
  {
    label: "Go home",
    href: "/",
    desc: "Back to the homepage",
    icon: Home,
  },
  {
    label: "Browse pricing",
    href: "/pricing",
    desc: "Free, Premium, and Enterprise tiers",
    icon: Tag,
  },
  {
    label: "See a demo",
    href: "/demo",
    desc: "Walk through 4 real-world scenarios",
    icon: Play,
  },
];

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-white via-ocean-50/40 to-white">
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
          {/* Lost cargo - stylized anchor SVG inside ocean badge */}
          <div className="relative mx-auto mb-8 w-32 h-32 sm:w-36 sm:h-36">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-ocean-100 via-cyan-50 to-white shadow-soft" />
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-ocean-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-ocean-500/30">
              <Anchor
                className="w-12 h-12 sm:w-14 sm:h-14 text-white"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 glass-premium rounded-full px-5 py-2.5 mb-5 shadow-soft">
            <span className="w-1.5 h-1.5 rounded-full bg-ocean-500 animate-pulse" />
            <span className="text-sm font-medium text-navy-700">
              404 — Off course
            </span>
          </div>

          <h1 className="text-7xl sm:text-8xl font-bold tracking-tighter mb-3">
            <span className="bg-gradient-to-br from-ocean-600 via-ocean-500 to-cyan-400 bg-clip-text text-transparent">
              404
            </span>
          </h1>

          <h2 className="text-2xl sm:text-3xl font-semibold text-navy-900 mb-4 tracking-tight">
            We can&apos;t find that shipment
          </h2>

          <p className="text-base sm:text-lg text-navy-600 mb-10 max-w-lg mx-auto leading-relaxed">
            The page may have moved or never existed. Try one of these:
          </p>

          <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-8">
            {suggestions.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group bg-white border border-navy-100 hover:border-ocean-200 rounded-xl p-5 text-left shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-ocean-50 group-hover:bg-gradient-to-br group-hover:from-ocean-500 group-hover:to-cyan-400 flex items-center justify-center transition-all">
                      <Icon className="w-4 h-4 text-ocean-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-semibold text-navy-900 group-hover:text-ocean-700 transition-colors">
                      {s.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto text-navy-300 group-hover:text-ocean-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <span className="text-xs text-navy-500 leading-relaxed">
                    {s.desc}
                  </span>
                </Link>
              );
            })}
          </div>

          <Link
            href="/knowledge-base"
            className="inline-flex items-center gap-2 text-sm font-medium text-ocean-600 hover:text-ocean-700 transition-colors"
          >
            Or browse the knowledge base
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
