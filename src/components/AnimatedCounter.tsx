"use client";

import { useEffect, useRef, useState } from "react";

export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1500,
}: {
  value: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(prefix + "0" + suffix);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.unobserve(el);

          // Extract numeric part
          const numericStr = value.replace(/[^0-9.]/g, "");
          const target = parseFloat(numericStr) || 0;
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * eased);

            // Reconstruct the display value with formatting
            if (value.includes(",")) {
              setDisplay(prefix + current.toLocaleString() + suffix);
            } else if (value.includes("K")) {
              setDisplay(prefix + (current) + "K" + suffix);
            } else {
              setDisplay(prefix + current + suffix);
            }

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplay(prefix + value + suffix);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, prefix, suffix, duration, hasAnimated]);

  return <span ref={ref}>{display}</span>;
}
