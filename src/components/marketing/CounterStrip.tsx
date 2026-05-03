"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CounterStrip — animated metrics row that counts up from 0 when the
 * strip enters the viewport. Uses IntersectionObserver to fire once,
 * then requestAnimationFrame with an easeOutQuart curve to count up
 * smoothly over ~1.5 seconds.
 *
 * Mounted on the home page below the LogoMarquee, above the 3D globe.
 *
 * Numbers are large (text-5xl font-bold text-blue-600), labels are
 * small uppercase tracking-wider in slate-500.
 */

interface Stat {
  /** The numeric value to count up to. */
  value: number;
  /** Prefix (e.g. "$"). Optional. */
  prefix?: string;
  /** Suffix (e.g. "+", "B"). Optional. */
  suffix?: string;
  /** Label shown below the number. */
  label: string;
  /** Format hint — "compact" formats large numbers with a B/M suffix. */
  format?: "default" | "compact";
}

const DEFAULT_STATS: Stat[] = [
  { value: 3700, suffix: "+", label: "Ports" },
  { value: 200, suffix: "+", label: "HTS Codes" },
  { value: 260, suffix: "+", label: "FTZ Zones" },
  { value: 2.4, prefix: "$", suffix: "B", label: "Tracked Freight", format: "compact" },
];

const DURATION_MS = 1500;

/** easeOutQuart — smooth deceleration */
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function formatNumber(current: number, target: number, format?: string): string {
  if (format === "compact") {
    // Show one decimal place for compact (e.g. 2.4) so it doesn't look truncated mid-animation
    return current.toFixed(1);
  }
  // Whole number with thousands separator
  return Math.floor(current).toLocaleString("en-US");
}

function CounterCell({ stat, start }: { stat: Stat; start: boolean }) {
  const [display, setDisplay] = useState<string>(
    stat.format === "compact" ? "0.0" : "0"
  );
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;

    const startTs = performance.now();
    const target = stat.value;

    const tick = (now: number) => {
      const elapsed = now - startTs;
      const t = Math.min(elapsed / DURATION_MS, 1);
      const eased = easeOutQuart(t);
      const current = target * eased;
      setDisplay(formatNumber(current, target, stat.format));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Snap to final value to avoid sub-pixel drift
        setDisplay(formatNumber(target, target, stat.format));
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [start, stat.value, stat.format]);

  return (
    <div className="flex flex-col items-center text-center px-4 py-6">
      <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-600 tracking-tight tabular-nums">
        {stat.prefix ?? ""}
        {display}
        {stat.suffix ?? ""}
      </div>
      <div className="mt-3 text-[11px] sm:text-xs uppercase tracking-[0.18em] text-slate-500 font-medium">
        {stat.label}
      </div>
    </div>
  );
}

interface CounterStripProps {
  /** Override the default 4 stats. */
  stats?: Stat[];
  /** Optional className appended to the outer wrapper. */
  className?: string;
}

export function CounterStrip({ stats = DEFAULT_STATS, className }: CounterStripProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Respect reduced motion — show final values immediately, no animation.
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      setHasStarted(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasStarted(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Platform coverage by the numbers"
      className={`relative py-14 md:py-20 bg-white border-b border-slate-100 ${className ?? ""}`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, i) => (
            <CounterCell key={`${stat.label}-${i}`} stat={stat} start={hasStarted} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CounterStrip;
