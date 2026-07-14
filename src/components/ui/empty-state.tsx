import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Illustrated empty state (AI-12732).
 *
 * One consistent empty-state treatment for the platform: a line-art
 * container-ship illustration (currentColor, so it adapts to dark mode),
 * a short title, one supporting sentence, and at most one primary action
 * plus one quiet secondary link.
 */

function ShipIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 96"
      fill="none"
      aria-hidden
      className={cn("h-24 w-40", className)}
    >
      {/* containers */}
      <g stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <rect x="46" y="26" width="20" height="12" rx="1" className="text-ocean-400" />
        <rect x="68" y="26" width="20" height="12" rx="1" className="text-navy-300" />
        <rect x="90" y="26" width="20" height="12" rx="1" className="text-ocean-300" />
        <rect x="57" y="12" width="20" height="12" rx="1" className="text-navy-300" />
        <rect x="79" y="12" width="20" height="12" rx="1" className="text-ocean-400" />
      </g>
      {/* hull */}
      <path
        d="M34 42h92l-10 20H46L34 42Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        className="text-navy-400"
      />
      {/* bridge */}
      <path
        d="M112 42V30h10v12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        className="text-navy-400"
      />
      {/* waves */}
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-ocean-300"
      >
        <path d="M22 72c6-5 12-5 18 0s12 5 18 0 12-5 18 0 12 5 18 0 12-5 18 0 12 5 18 0" />
        <path d="M36 84c6-5 12-5 18 0s12 5 18 0 12-5 18 0 12 5 18 0" opacity="0.5" />
      </g>
    </svg>
  );
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Primary call to action. `href` renders a Link, `onClick` a button. */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Quiet secondary link under the primary action. */
  secondary?: {
    label: string;
    href: string;
  };
  /** Swap the default ship illustration (e.g. a lucide icon block). */
  illustration?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  action,
  secondary,
  illustration,
  className,
}: EmptyStateProps) {
  const actionClasses =
    "inline-flex items-center gap-2 rounded-lg bg-ocean-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ocean-700";

  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 py-14 text-center",
        className
      )}
    >
      {illustration ?? <ShipIllustration className="text-navy-300" />}
      <h3 className="mt-5 text-base font-semibold text-navy-900">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-navy-500">
          {description}
        </p>
      )}
      {action &&
        (action.href ? (
          <Link href={action.href} className={cn(actionClasses, "mt-5")}>
            {action.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <button type="button" onClick={action.onClick} className={cn(actionClasses, "mt-5")}>
            {action.label}
          </button>
        ))}
      {secondary && (
        <Link
          href={secondary.href}
          className="mt-3 text-xs font-medium text-navy-400 underline-offset-2 hover:text-ocean-600 hover:underline"
        >
          {secondary.label}
        </Link>
      )}
    </div>
  );
}
