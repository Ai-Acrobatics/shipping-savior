"use client";

import { motion } from "framer-motion";
import type { ElementType } from "react";

interface HowItWorksStepProps {
  number: number;
  title: string;
  description: string;
  icon: ElementType;
  isLast?: boolean;
}

export default function HowItWorksStep({
  number,
  title,
  description,
  icon: Icon,
  isLast = false,
}: HowItWorksStepProps) {
  return (
    <div className="flex flex-col items-center text-center relative">
      {/* Connecting line (hidden on mobile and last item) */}
      {!isLast && (
        <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="h-full bg-gradient-to-r from-ocean-300 to-ocean-200 origin-left"
          />
        </div>
      )}

      {/* Step circle */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="relative w-20 h-20 rounded-full bg-gradient-to-br from-ocean-500 to-indigo-600 flex items-center justify-center mb-5 shadow-[0_4px_20px_rgba(37,99,235,0.3)]"
      >
        <Icon className="w-8 h-8 text-white" />
        <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white text-ocean-600 text-xs font-bold flex items-center justify-center shadow-md border border-ocean-100">
          {number}
        </span>
      </motion.div>

      <h3 className="text-lg font-bold text-navy-900 mb-2">{title}</h3>
      <p className="text-sm text-navy-500 leading-relaxed max-w-[220px]">
        {description}
      </p>
    </div>
  );
}
