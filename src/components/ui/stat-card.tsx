import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dense stat card (AI-12732).
 *
 * Stripe-style hierarchy: quiet uppercase label, large tabular-nums value,
 * subtle delta chip, optional muted icon and footer link. Replaces the
 * gradient-icon-chip cards that shipped on the dashboard/shipments pages.
 */
export interface StatCardProps {
  label: string;
  value: string | number;
  /** e.g. "+12% vs last month". Omit when there's no meaningful trend. */
  delta?: string;
  deltaPositive?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  /** Small footer link, e.g. "View shipments". */
  footer?: { label: string; href: string };
  /** Tint for the icon; defaults to muted navy. */
  tone?: "default" | "ocean" | "amber" | "emerald" | "red";
  className?: string;
}

const ICON_TONES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-navy-300",
  ocean: "text-ocean-500",
  amber: "text-amber-500",
  emerald: "text-emerald-500",
  red: "text-red-500",
};

export default function StatCard({
  label,
  value,
  delta,
  deltaPositive = true,
  icon: Icon,
  footer,
  tone = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group rounded-xl border border-navy-200/70 bg-white p-4 shadow-soft transition-shadow hover:shadow-card",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-navy-400">
          {label}
        </p>
        {Icon && <Icon className={cn("h-4 w-4 shrink-0", ICON_TONES[tone])} />}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-[26px] font-bold leading-none tracking-tight text-navy-900 tabular-nums">
          {value}
        </p>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
              deltaPositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            )}
          >
            {deltaPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {delta}
          </span>
        )}
      </div>
      {footer && (
        <Link
          href={footer.href}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-navy-400 transition-colors hover:text-ocean-600"
        >
          {footer.label}
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
