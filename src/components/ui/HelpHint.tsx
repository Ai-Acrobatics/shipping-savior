"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle } from "lucide-react";

interface HelpHintProps {
  /** KB article slug to link to (renders /knowledge-base/[slug]) */
  articleSlug: string;
  /** Tooltip label shown on hover/focus */
  label: string;
  /** Optional className for the trigger button */
  className?: string;
}

/**
 * Contextual help icon. Hovering or focusing reveals a tooltip; clicking
 * navigates to the matching Knowledge Base article.
 */
export default function HelpHint({ articleSlug, label, className = "" }: HelpHintProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <Link
        href={`/knowledge-base/${articleSlug}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label={label}
        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-navy-400 hover:text-ocean-600 hover:bg-ocean-50 focus:outline-none focus:ring-2 focus:ring-ocean-500 transition-colors"
      >
        <HelpCircle className="w-4 h-4" />
      </Link>
      {open && (
        <span
          role="tooltip"
          className="absolute right-0 top-full mt-2 w-64 z-40 bg-navy-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none"
        >
          {label}
          <span className="block text-ocean-300 mt-1 text-[10px] uppercase tracking-wider font-semibold">
            Click to read &rarr;
          </span>
        </span>
      )}
    </span>
  );
}
