"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * System-adaptive theming for the platform (AI-10777 web re-theme).
 * Applies a `dark` class on <html> — light default, follows the OS setting,
 * with a manual toggle (see ThemeToggle). Marketing pages are theme-agnostic
 * (they carry only light styles), so only the platform surfaces respond.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
