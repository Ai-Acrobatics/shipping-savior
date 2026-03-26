"use client";

import { useEffect, useRef, ReactNode } from "react";

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("visible"), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const directionStyles: Record<string, string> = {
    up: "",
    left: "translate-x-[-30px]",
    right: "translate-x-[30px]",
    scale: "scale-95",
  };

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${className}`}
      style={{
        ...(direction !== "up" ? { transform: directionStyles[direction] } : {}),
      }}
    >
      {children}
    </div>
  );
}
