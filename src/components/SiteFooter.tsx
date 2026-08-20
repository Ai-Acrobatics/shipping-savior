import Link from "next/link";

/**
 * Legal footer rendered on every layout that isn't the marketing homepage
 * (AI-8780). Procurement reviews check that policy documents are reachable
 * from every surface a user can land on, not just the landing page — so the
 * auth and platform shells get this too.
 *
 * The homepage has its own bespoke footer; it links the same five documents.
 */

export const LEGAL_LINKS: { href: string; label: string }[] = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/dpa", label: "DPA" },
  { href: "/sub-processors", label: "Sub-processors" },
  { href: "/security", label: "Security" },
];

export default function SiteFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`border-t border-navy-100 bg-white/60 px-6 py-6 ${className}`.trim()}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-xs text-navy-500 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} Shipping Savior. All rights reserved.</p>
        <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-ocean-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
