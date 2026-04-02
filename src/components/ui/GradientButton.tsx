"use client";

import { motion } from "framer-motion";
import type { ReactNode, ElementType } from "react";

interface GradientButtonProps {
  children: ReactNode;
  variant?: "primary" | "outline";
  href?: string;
  onClick?: () => void;
  className?: string;
  as?: ElementType;
}

export default function GradientButton({
  children,
  variant = "primary",
  href,
  onClick,
  className = "",
  as,
}: GradientButtonProps) {
  const Component = as || (href ? "a" : "button");

  if (variant === "outline") {
    return (
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
        <Component
          href={href}
          onClick={onClick}
          className={`
            inline-flex items-center gap-2 font-semibold
            px-8 py-4 rounded-full
            border-2 border-ocean-300 text-ocean-600
            bg-white/80 backdrop-blur-sm
            hover:border-ocean-400 hover:bg-ocean-50
            transition-all duration-300
            ${className}
          `}
        >
          {children}
        </Component>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
      <Component
        href={href}
        onClick={onClick}
        className={`
          inline-flex items-center gap-2 font-bold
          px-8 py-4 rounded-full text-white
          bg-gradient-to-r from-ocean-600 via-indigo-500 to-ocean-500
          shadow-[0_4px_24px_rgba(37,99,235,0.4)]
          hover:shadow-[0_8px_32px_rgba(37,99,235,0.55)]
          transition-all duration-300
          ${className}
        `}
      >
        {children}
      </Component>
    </motion.div>
  );
}
