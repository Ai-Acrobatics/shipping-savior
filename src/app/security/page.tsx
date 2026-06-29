import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "@/components/LegalPageShell";
import { LEGAL_CONTACTS } from "@/lib/legal/last-updated";

export const metadata: Metadata = {
  title: "Security | Shipping Savior",
  description:
    "How Shipping Savior protects your data — encryption, authentication, monitoring, sub-processors, and our security commitments.",
};

export default function SecurityPage() {
  return (
    <LegalPageShell
      title="Security"
      subtitle="How we protect the data you trust us with."
      hideDraftBanner
    >
      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-2 mb-3">
          Encryption
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>In transit.</strong> All connections to the platform
            use TLS 1.2 or higher. HTTP requests are redirected to HTTPS
            and we set HSTS headers.
          </li>
          <li>
            <strong>At rest.</strong> Production databases (Neon
            PostgreSQL) and object storage (Vercel Blob) are encrypted at
            rest using AES-256 by our infrastructure providers.
          </li>
        </ul>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          Authentication and access control
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Passwords are hashed with bcrypt before storage. We never store
            plaintext passwords.
          </li>
          <li>
            Sessions use short-lived JSON Web Tokens with rotation on
            sensitive actions.
          </li>
          <li>
            Role-based access control (RBAC) gates every privileged action
            inside an organization (owner, admin, member, viewer).
          </li>
          <li>
            Internal access to production systems is restricted to a small
            on-call team and is reviewed quarterly.
          </li>
        </ul>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          Audit logging
        </h2>
        <p>
          Sign-ins, sign-outs, failed logins, invitations, calculation
          saves and deletions, and administrative actions are recorded in
          a tamper-evident audit log retained per the schedule in our{" "}
          <Link href="/privacy" className="text-ocean-600 underline">
            Privacy Policy
          </Link>
          . Account holders can export their own audit log via{" "}
          <code className="bg-navy-50 px-1 rounded text-xs">
            GET /api/account/export
          </code>
          .
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          Monitoring
        </h2>
        <p>
          Application errors and anomalies are tracked in Sentry.
          Infrastructure health is monitored 24/7. Material incidents are
          posted to our status page (coming soon) and notified to affected
          customers via email.
        </p>
      </section>

      <section>
        {/* TODO: review — public commitment, confirm Julian is OK with the bar */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          Penetration testing
        </h2>
        <p>
          We commit to engaging a qualified third-party firm for an annual
          penetration test once Shipping Savior crosses{" "}
          <strong>US$100,000 in annual recurring revenue</strong>.
          Executive summaries will be available under NDA to Enterprise
          customers on request. Until then, we run automated dependency
          scans, static analysis, and manual code review on every release.
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          Data residency
        </h2>
        <p>
          Production data is stored in the United States by default. EU
          residency is available on request for Enterprise customers.
          See{" "}
          <Link href="/sub-processors" className="text-ocean-600 underline">
            /sub-processors
          </Link>{" "}
          for the per-vendor processing region list.
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          Backups and disaster recovery
        </h2>
        <p>
          Production databases are backed up continuously by Neon with
          point-in-time recovery up to seven days. Recovery procedures are
          tested at least annually.
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          Vulnerability disclosure
        </h2>
        <p>
          If you believe you have found a security vulnerability, please
          report it to{" "}
          <a
            href={`mailto:${LEGAL_CONTACTS.security}`}
            className="text-ocean-600 underline"
          >
            {LEGAL_CONTACTS.security}
          </a>
          {". "}We acknowledge reports within two business days and will
          keep you updated as we investigate. We do not pursue legal action
          against good-faith security researchers who follow responsible
          disclosure practices.
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          Sub-processors
        </h2>
        <p>
          See the maintained list at{" "}
          <Link href="/sub-processors" className="text-ocean-600 underline">
            /sub-processors
          </Link>
          {". "}
          We notify customers of material changes at least 14 days in
          advance, where practicable.
        </p>
      </section>

      <section>
        {/* TODO: review — security@shippingsavior.com routing depends on AI-8784 */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          Contact
        </h2>
        <p>
          Security questions, audit requests, or vulnerability reports:{" "}
          <a
            href={`mailto:${LEGAL_CONTACTS.security}`}
            className="text-ocean-600 underline"
          >
            {LEGAL_CONTACTS.security}
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
