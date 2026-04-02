"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode, type MouseEvent } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
  hover?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  tilt = false,
  hover = true,
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), {
    stiffness: 150,
    damping: 15,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), {
    stiffness: 150,
    damping: 15,
  });

  function handleMouse(e: MouseEvent<HTMLDivElement>) {
    if (!tilt || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={tilt ? { rotateX, rotateY, transformPerspective: 800 } : undefined}
      whileHover={hover ? { y: -4, transition: { duration: 0.3 } } : undefined}
      className={`
        relative bg-white/80 backdrop-blur-2xl
        border border-white/50 rounded-2xl
        shadow-[0_8px_32px_rgba(37,99,235,0.08)]
        hover:shadow-[0_16px_48px_rgba(37,99,235,0.14)]
        transition-shadow duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
