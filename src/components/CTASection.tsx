"use client";

import { ArrowRight, Ship, Calendar, MessageSquare } from "lucide-react";

export default function CTASection() {
  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-ocean-700 via-ocean-600 to-ocean-800" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,200,26,0.1),transparent_60%)]" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-cargo-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

      <div className="relative px-8 py-16 md:px-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/10">
            <Ship className="w-4 h-4 text-white" />
            <span className="text-sm text-white/90 font-medium">
              Ready to Systematize Your Operations?
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Turn Manual Freight Brokerage into{" "}
            <span className="text-cargo-300">Data-Driven Operations</span>
          </h2>

          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Get the complete logistics toolkit — calculators, FTZ strategy, route
            comparison, and real-time tracking. Built for operators who want to
            scale without scaling complexity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a
              href="mailto:hello@aiacrobatics.com?subject=Shipping%20Savior%20-%20Schedule%20Demo"
              className="inline-flex items-center justify-center gap-2 bg-white text-ocean-800 font-semibold px-8 py-4 rounded-xl transition-all hover:bg-white/90 hover:scale-105 shadow-lg shadow-black/20"
            >
              <Calendar className="w-5 h-5" />
              Schedule a Demo
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="mailto:hello@aiacrobatics.com?subject=Shipping%20Savior%20-%20Question"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:bg-white/20 hover:scale-105"
            >
              <MessageSquare className="w-5 h-5" />
              Contact Sales
            </a>
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: "14 days", label: "Free trial" },
              { value: "No card", label: "Required to start" },
              { value: "< 24h", label: "Setup time" },
            ].map((signal) => (
              <div key={signal.label} className="text-center">
                <div className="text-lg font-bold text-white">
                  {signal.value}
                </div>
                <div className="text-xs text-white/50">{signal.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
