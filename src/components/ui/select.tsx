"use client";

import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Styled select (AI-12732).
 *
 * Wraps a native <select> — keyboard/screen-reader behavior stays native —
 * with the platform's input styling and a consistent chevron affordance.
 * Replaces the raw native selects that shipped on History / Load Board.
 */
export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Extra classes for the outer wrapper (width, flex behavior). */
  wrapperClassName?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, wrapperClassName, children, ...props }, ref) => (
    <div className={cn("relative", wrapperClassName)}>
      <select
        ref={ref}
        className={cn(
          "w-full appearance-none rounded-lg border border-navy-200 bg-white",
          "py-2 pl-3 pr-9 text-sm font-medium text-navy-700",
          "transition-all duration-200",
          "hover:border-navy-300",
          "focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
      />
    </div>
  )
);
Select.displayName = "Select";

export default Select;
