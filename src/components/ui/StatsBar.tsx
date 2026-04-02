"use client";

import { motion } from "framer-motion";
import type { ElementType } from "react";

interface Stat {
  label: string;
  value: string;
  icon: ElementType;
}

interface StatsBarProps {
  stats: Stat[];
}

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
          className="group relative bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-5 text-center
                     shadow-[0_4px_20px_rgba(37,99,235,0.06)]
                     hover:shadow-[0_8px_30px_rgba(37,99,235,0.12)]
                     hover:-translate-y-0.5 transition-all duration-300"
        >
          <stat.icon className="w-5 h-5 text-ocean-500 mx-auto mb-2" />
          <div className="text-2xl md:text-3xl font-bold text-navy-900 tracking-tight">
            {stat.value}
          </div>
          <div className="text-xs font-medium text-navy-400 mt-1 uppercase tracking-wider">
            {stat.label}
          </div>
          <div className="mt-3 h-0.5 w-8 mx-auto rounded-full bg-gradient-to-r from-ocean-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      ))}
    </div>
  );
}
