import Link from "next/link";

export const metadata = {
  title: "Security | Shipping Savior",
  description:
    "How Shipping Savior protects customer data: encryption, access control, audit logging, vulnerability management, and our current compliance posture.",
  openGraph: {
    title: "Security | Shipping Savior",
    description:
      "Encryption, access control, audit logging, and incident response at Shipping Savior — written for vendor security reviews.",
    type: "article",
  },
};

/**
 * Controls we actually operate today. Everything on this page must be true as
 * written — a vendor security questionnaire is a contractual representation, so
 * aspirations belong in the "Roadmap" section below, never in this table.
 */
const CONTROLS: { area: string; control: string; detail: string }[] = [
  {
    area: "Encryption in transit",
    control: "TLS 1.2+ everywhere",
    detail:
      "All traffic is served over HTTPS through our hosting provider's edge network. Plaintext HTTP requests are redirected, never served.",
  },
  {
    area: "Encryption at rest",
    control: "Provider-managed AES-256",
    detail:
      "Database storage and uploaded document blobs are encrypted at rest by our hosting sub-processors (Neon/Supabase for Postgres, Vercel Blob for files).",
  },
  {
    area: "Credential storage",
    control: "bcrypt password hashing",
    detail:
      "Passwords are hashed with bcrypt and a per-user salt. Plaintext passwords are never stored, logged, or included in data exports.",
  },
  {
    area: "Authentication",
    control: "Session-based auth with OAuth options",
    detail:
      "Email/password plus Google and GitHub OAuth. Sessions are signed JWTs; email verification and password-reset tokens are single-use and time-limited.",
  },
  {
    area: "Authorization",
    control: "Role-based access control",
    detail:
      "Owner / admin / member / viewer roles scope what a user can read and change. Every application query is scoped to the requesting organization, so cross-tenant reads are prevented at the API layer.",
  },
  {
    area: "Audit logging",
    control: "Append-only audit log",
    detail:
      "Logins, failed logins, invites, and data-changing events are written to an append-only audit log with actor, IP, and timestamp. Customers can export their own audit trail at any time.",
  },
  {
    area: "Monitoring",
    control: "Error and performance monitoring",
    detail:
      "Application errors and performance regressions are captured in Sentry with alerting to the on-call engineer.",
  },
  {
    area: "Backups",
    control: "Automated point-in-time backups",
    detail:
      "Our database provider takes continuous backups with point-in-time restore. Backups inherit the same encryption controls as production.",
  },
  {
    area: "Least privilege",
    control: "Scoped production access",
    detail:
      "Production access is limited to authorized personnel on a need-to-know basis. Service credentials are scoped to the minimum permissions required and are stored in a managed secret store, never in source control.",
  },
  {
    area: "Dependency management",
    control: "Automated dependency and secret scanning",
    detail:
      "Dependency vulnerability alerts and push-protection secret scanning run on every change to the repository; security patches are prioritized over feature work.",
  },
  {
    area: "Data segregation",
    control: "Logical multi-tenancy",
    detail:
      "Each customer organization is a separate tenant in a shared database, enforced by organization-scoped queries. Dedicated-instance deployment is available on enterprise agreements.",
  },
  {
    area: "Data subject rights",
    control: "Self-service export and deletion",
    detail:
      "Authenticated users can export all of their data as a machine-readable archive and can irreversibly delete their account and organization data from the platform.",
  },
];

/**
 * Things a procurement checklist will ask about that we do NOT have yet.
 * Saying so plainly is what makes the rest of the page credible.
 */
const ROADMAP: { item: string; status: string }[] = [
  {
    item: "Third-party penetration test",
    status:
      "Committed annually once revenue justifies the engagement. Not yet performed — we will share the report and remediation summary with enterprise customers under NDA when it is.",
  },
  {
    item: "SOC 2 Type II",
    status:
      "Not certified. We operate the controls listed above but have not completed an audit. Enterprise customers can request a completed security questionnaire in the meantime.",
  },
  {
    item: "ISO 27001",
    status: "Not certified and not currently on the roadmap.",
  },
  {
    item: "Single sign-on (SAML/SCIM)",
    status:
      "OAuth (Google, GitHub) is available today. SAML SSO and SCIM provisioning are enterprise roadmap items — contact us if you need a date.",
  },
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-ocean-600 hover:text-ocean-700">
          ← Back to home
        </Link>
        <h1 className="mt-6 text-4xl font-bold text-navy-900">Security</h1>
        <p className="mt-2 text-sm text-navy-500">Last updated: August 20, 2026</p>

        <div className="prose prose-navy mt-10 max-w-none space-y-8 text-navy-700">
          <section>
            <p>
              Shipping Savior handles shipment records, commercial documents, and rate data
              — information that is commercially sensitive even when it is not personal
              data. This page describes the controls we operate today, and is written to be
              answerable against a standard vendor security review. Where we do not have a
              control, we say so rather than implying we do.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">Controls in place</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-navy-200 text-left text-navy-900">
                    <th className="py-2 pr-4 font-semibold">Area</th>
                    <th className="py-2 pr-4 font-semibold">Control</th>
                    <th className="py-2 font-semibold">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {CONTROLS.map((c) => (
                    <tr key={c.area} className="border-b border-navy-100 align-top">
                      <td className="py-2 pr-4 font-medium text-navy-900">{c.area}</td>
                      <td className="py-2 pr-4">{c.control}</td>
                      <td className="py-2">{c.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">
              Incident response
            </h2>
            <p className="mt-2">
              Suspected incidents are triaged by the engineering on-call within one business
              day. Where a personal-data breach is confirmed, we notify affected controllers
              without undue delay and in any case within 72 hours of becoming aware, with the
              information required by Article 33 of the GDPR. Our{" "}
              <Link href="/dpa" className="text-ocean-600 hover:text-ocean-700">
                DPA
              </Link>{" "}
              sets out the contractual version of this commitment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">Data retention</h2>
            <p className="mt-2">
              Customer platform data is retained for the life of the account. Audit log
              entries are retained for up to 12 months under a separate retention policy so
              that a security investigation survives an account deletion. When an account is
              deleted, platform data is removed irreversibly; see{" "}
              <Link href="/privacy" className="text-ocean-600 hover:text-ocean-700">
                Privacy Policy
              </Link>{" "}
              for the full picture.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">
              Not yet in place
            </h2>
            <div className="mt-4 space-y-3">
              {ROADMAP.map((r) => (
                <div key={r.item}>
                  <p className="font-medium text-navy-900">{r.item}</p>
                  <p className="text-sm">{r.status}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">
              Reporting a vulnerability
            </h2>
            <p className="mt-2">
              Email{" "}
              <a href="mailto:security@shippingsavior.com" className="text-ocean-600">
                security@shippingsavior.com
              </a>{" "}
              with reproduction steps. We acknowledge reports within two business days and
              will not pursue legal action against good-faith research that avoids privacy
              violations, service degradation, and access to data that is not your own.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">Related documents</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <Link href="/privacy" className="text-ocean-600 hover:text-ocean-700">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-ocean-600 hover:text-ocean-700">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/dpa" className="text-ocean-600 hover:text-ocean-700">
                  Data Processing Agreement
                </Link>
              </li>
              <li>
                <Link
                  href="/sub-processors"
                  className="text-ocean-600 hover:text-ocean-700"
                >
                  Sub-processors
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
