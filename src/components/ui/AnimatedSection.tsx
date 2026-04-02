"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  stagger?: boolean;
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

function getItemVariants(direction: string): Variants {
  const initial: Record<string, number> = { opacity: 0 };
  if (direction === "up") initial.y = 24;
  if (direction === "left") initial.x = -24;
  if (direction === "right") initial.x = 24;

  return {
    hidden: initial,
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
    },
  };
}

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
  stagger = false,
}: AnimatedSectionProps) {
  const variants = stagger ? containerVariants : getItemVariants(direction);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={variants}
      transition={!stagger ? { delay } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedItem({
  children,
  className = "",
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  direction?: "up" | "left" | "right" | "none";
}) {
  return (
    <motion.div variants={getItemVariants(direction)} className={className}>
      {children}
    </motion.div>
  );
}
