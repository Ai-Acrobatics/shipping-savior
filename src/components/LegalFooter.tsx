import Link from "next/link";

/**
 * Compact footer with legal/compliance links. Mounted in the marketing site
 * footer, the auth layout, the dashboard layout, and every legal page.
 *
 * If you add a legal page, add it here in ONE place and it propagates to
 * every layout that imports this component.
 */
export const LEGAL_LINKS: Array<{ href: string; label: string }> = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/dpa", label: "DPA" },
  { href: "/sub-processors", label: "Sub-processors" },
  { href: "/security", label: "Security" },
];

interface LegalFooterProps {
  /** Render only the link list (no surrounding container) — useful when
   * embedding inside an existing footer that already has its own padding. */
  inline?: boolean;
  className?: string;
}

export default function LegalFooter({ inline = false, className = "" }: LegalFooterProps) {
  const links = (
    <ul
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-navy-500 ${className}`}
    >
      {LEGAL_LINKS.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="hover:text-ocean-600 transition-colors"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  if (inline) {
    return links;
  }

  return (
    <footer className="border-t border-navy-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-xs text-navy-400">
          © {new Date().getFullYear()} Shipping Savior
        </div>
        {links}
      </div>
    </footer>
  );
}
