"use client";

import GlassCard from "./GlassCard";
import { ArrowRight } from "lucide-react";
import type { ElementType } from "react";

interface FeatureCardProps {
  icon: ElementType;
  title: string;
  description: string;
  gradient: string;
  href?: string;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  href,
}: FeatureCardProps) {
  return (
    <GlassCard tilt className="p-7 h-full group cursor-pointer">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-lg font-bold text-navy-900 mb-2">{title}</h3>
      <p className="text-sm text-navy-500 leading-relaxed mb-4">{description}</p>
      {href && (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ocean-600 group-hover:gap-2.5 transition-all duration-300">
          Try It <ArrowRight className="w-4 h-4" />
        </span>
      )}
    </GlassCard>
  );
}
