"use client";

import GlassCard from "./GlassCard";
import type { ElementType } from "react";

interface ProblemCardProps {
  icon: ElementType;
  title: string;
  description: string;
  index: number;
}

export default function ProblemCard({
  icon: Icon,
  title,
  description,
  index,
}: ProblemCardProps) {
  return (
    <GlassCard tilt className="p-7 h-full">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-navy-300 uppercase tracking-widest">
            Problem {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-lg font-bold text-navy-900 mt-1 mb-2">{title}</h3>
          <p className="text-sm text-navy-500 leading-relaxed">{description}</p>
        </div>
      </div>
    </GlassCard>
  );
}
