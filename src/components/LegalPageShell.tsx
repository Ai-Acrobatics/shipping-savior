import Link from "next/link";
import { Ship } from "lucide-react";
import { LEGAL_LAST_UPDATED } from "@/lib/legal/last-updated";
import LegalFooter from "./LegalFooter";

interface LegalPageShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Override the global "last updated" date for this page. */
  lastUpdated?: string;
  /** Hide the prominent DRAFT banner (e.g. for /sub-processors and /security). */
  hideDraftBanner?: boolean;
}

/**
 * Minimal, accessible shell used by every legal page (/privacy, /terms,
 * /sub-processors, /security, /dpa). Keeps branding consistent without
 * pulling in the marketing Header (which is heavy and animation-driven).
 */
export default function LegalPageShell({
  title,
  subtitle,
  children,
  lastUpdated = LEGAL_LAST_UPDATED,
  hideDraftBanner = false,
}: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-white text-navy-900 flex flex-col">
      <header className="border-b border-navy-100 bg-white/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-cyan-400 flex items-center justify-center">
              <Ship className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">Shipping Savior</span>
          </Link>
          <Link
            href="/"
            className="text-xs text-navy-500 hover:text-ocean-600 transition-colors"
          >
            Back to site
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 py-12">
        <article className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-navy-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-navy-500 mt-2 text-base">{subtitle}</p>
            )}
            <p className="text-xs text-navy-400 mt-3">
              Last updated: {lastUpdated}
            </p>
          </div>

          {!hideDraftBanner && (
            <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <strong>Draft for review.</strong> This document is in
              human-review status pending legal sign-off. Material changes may
              still be made before launch.
            </div>
          )}

          <div className="legal-prose space-y-6 text-navy-700 leading-relaxed text-[15px]">
            {children}
          </div>
        </article>
      </main>

      <LegalFooter />
    </div>
  );
}
