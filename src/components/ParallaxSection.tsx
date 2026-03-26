"use client";

import { useEffect, useRef, ReactNode } from "react";

export default function ParallaxSection({
  children,
  className = "",
  speed = 0.3,
  bgClassName = "",
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  bgClassName?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const scrolled = -rect.top * speed;
      bg.style.transform = `translateY(${scrolled}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return (
    <div ref={sectionRef} className={`relative overflow-hidden ${className}`}>
      <div
        ref={bgRef}
        className={`absolute inset-0 -top-20 -bottom-20 ${bgClassName}`}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
