"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

const OPTIONS = [
  { key: "light", icon: Sun, label: "Light" },
  { key: "system", icon: Monitor, label: "System" },
  { key: "dark", icon: Moon, label: "Dark" },
] as const;

/**
 * Compact three-way theme switch (Light / System / Dark). Renders a stable
 * placeholder until mounted to avoid a hydration mismatch on `theme`.
 */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-navy-200 dark:border-navy-800 bg-navy-50 dark:bg-navy-900 p-0.5">
      {OPTIONS.map(({ key, icon: Icon, label }) => {
        const active = mounted && theme === key;
        return (
          <button
            key={key}
            type="button"
            aria-label={`${label} theme`}
            aria-pressed={active}
            onClick={() => setTheme(key)}
            className={`inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
              active
                ? "bg-white dark:bg-navy-700 text-ocean-600 dark:text-ocean-300 shadow-sm"
                : "text-navy-500 hover:text-navy-800 dark:text-navy-400 dark:hover:text-navy-200"
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
