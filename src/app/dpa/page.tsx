import Link from "next/link";

export const metadata = {
  title: "Data Processing Agreement | Shipping Savior",
  description:
    "Data Processing Agreement (DPA) governing Shipping Savior's processing of customer personal data under GDPR.",
};

// Mirrors the sub-processor list on /privacy — keep the two in sync.
const SUBPROCESSORS = [
  ["Vercel", "Application hosting, edge network, file storage (uploaded documents)", "United States"],
  ["Supabase / Neon", "PostgreSQL database hosting", "United States"],
  ["Stripe", "Payment processing and subscription billing", "United States"],
  ["Resend", "Transactional email (verification, password reset, invites)", "United States"],
  ["Sentry", "Error monitoring and diagnostics", "United States"],
  ["PostHog", "Product analytics", "United States / EU"],
  ["Anthropic", "AI document extraction and assistant features (Claude)", "United States"],
  ["Google", "OAuth sign-in; AI document extraction fallback (Gemini)", "United States"],
  ["GitHub", "OAuth sign-in", "United States"],
  ["Moonshot AI", "AI document extraction fallback (Kimi)", "International"],
];

const TOMS = [
  ["Encryption in transit", "All traffic is served over TLS 1.2+; plaintext HTTP is not accepted."],
  ["Encryption at rest", "Database storage and uploaded document blobs are encrypted at rest by our hosting sub-processors."],
  ["Credential protection", "Passwords are hashed with bcrypt; plaintext passwords are never stored or logged."],
  ["Access control (RBAC)", "Role-based access control (owner / admin / member / viewer) restricts data access within each organization."],
  ["Audit logging", "Security-relevant events (logins, failed logins, invites, data changes) are written to an append-only audit log retained up to 12 months."],
  ["Least privilege", "Production access is limited to authorized personnel on a need-to-know basis; service credentials are scoped to the minimum required permissions."],
  ["Tenant isolation", "All application queries are scoped to the requesting organization; cross-tenant access is prevented at the API layer."],
  ["Backups & recovery", "Automated backups roll off within 35 days and are protected with the same encryption controls as production data."],
];

export default function DpaPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-ocean-600 hover:text-ocean-700">
          ← Back to home
        </Link>
        <h1 className="mt-6 text-4xl font-bold text-navy-900">Data Processing Agreement</h1>
        <p className="mt-2 text-sm text-navy-500">Last updated: June 12, 2026</p>

        <div className="prose prose-navy mt-10 max-w-none space-y-8 text-navy-700">
          <section>
            <h2 className="text-xl font-semibold text-navy-900">1. Parties</h2>
            <p className="mt-2">
              This Data Processing Agreement (&quot;DPA&quot;) forms part of the agreement
              between <strong>Shipping Savior</strong> (the &quot;Processor&quot;) and the
              customer organization that accepts the{" "}
              <Link href="/terms" className="text-ocean-600 hover:text-ocean-700">
                Terms of Service
              </Link>{" "}
              (the &quot;Controller&quot;). It governs the processing of personal data the
              Controller submits to the platform, as required by Article 28 of the GDPR and
              equivalent laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">2. Subject matter and duration</h2>
            <p className="mt-2">
              The subject matter of processing is the personal data contained in the
              Controller&apos;s account, team, shipment, and document data processed through
              the Shipping Savior platform. Processing continues for the duration of the
              Controller&apos;s subscription and ends when the account is deleted, after which
              data is removed in line with the retention terms of the{" "}
              <Link href="/privacy" className="text-ocean-600 hover:text-ocean-700">
                Privacy Policy
              </Link>{" "}
              (backups roll off within 35 days).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">3. Nature and purpose of processing</h2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Hosting and storing data the Controller submits (accounts, shipments, uploaded documents).</li>
              <li>Extracting structured data from uploaded logistics documents using AI sub-processors.</li>
              <li>Running freight calculators, dashboards, and analytics over the Controller&apos;s data.</li>
              <li>Sending transactional email (verification, password reset, team invites, configured alerts).</li>
              <li>Processing subscription payments and managing billing state.</li>
              <li>Securing the service: authentication, rate limiting, error monitoring, audit logging.</li>
            </ul>
            <p className="mt-2">
              The Processor acts only on the Controller&apos;s documented instructions, does not
              sell personal data, and does not use the Controller&apos;s documents to train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">4. Categories of data and data subjects</h2>
            <p className="mt-2"><strong>Categories of personal data:</strong></p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Account data: name, email address, hashed password, organization name and role.</li>
              <li>Billing data: subscription plan and payment status (card details are held by Stripe).</li>
              <li>Shipment and document data: names and contact details of shippers, consignees, and notify parties appearing in uploaded documents.</li>
              <li>Usage data: pages visited, features used, device/browser information, IP address.</li>
            </ul>
            <p className="mt-4"><strong>Categories of data subjects:</strong></p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>The Controller&apos;s personnel who use the platform (account holders, invited team members).</li>
              <li>The Controller&apos;s business contacts appearing in uploaded logistics documents (shippers, consignees, carriers, notify parties).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">5. Authorized sub-processors</h2>
            <p className="mt-2">
              The Controller grants general authorization for the sub-processors below. The
              Processor will notify the Controller of intended changes and remains fully
              liable for sub-processor performance.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm border border-navy-100">
                <thead className="bg-navy-50 text-left">
                  <tr>
                    <th className="px-3 py-2 font-semibold text-navy-900">Provider</th>
                    <th className="px-3 py-2 font-semibold text-navy-900">Purpose</th>
                    <th className="px-3 py-2 font-semibold text-navy-900">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBPROCESSORS.map(([name, purpose, location]) => (
                    <tr key={name} className="border-t border-navy-100">
                      <td className="px-3 py-2 font-medium text-navy-800">{name}</td>
                      <td className="px-3 py-2">{purpose}</td>
                      <td className="px-3 py-2">{location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">6. International transfers</h2>
            <p className="mt-2">
              Where personal data originating in the EU/EEA, UK, or Switzerland is transferred
              to a country without an adequacy decision (including the United States), the
              parties rely on the European Commission&apos;s Standard Contractual Clauses
              (SCCs, Module 2: Controller → Processor), which are incorporated into this DPA by
              reference, supplemented by the technical and organizational measures in the
              Annex. Sub-processor transfers are covered by SCCs or equivalent safeguards in
              the Processor&apos;s agreements with each sub-processor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">7. Assistance, breach notice, and deletion</h2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>The Processor assists the Controller with data subject requests (access, export, deletion are also self-service in-app) and with Articles 32–36 obligations.</li>
              <li>The Processor notifies the Controller without undue delay after becoming aware of a personal data breach affecting the Controller&apos;s data.</li>
              <li>Personnel processing personal data are bound by confidentiality obligations.</li>
              <li>On termination, the Processor deletes the Controller&apos;s personal data in line with the retention terms above, unless retention is required by law.</li>
              <li>The Processor makes available information reasonably necessary to demonstrate compliance and allows audits as described in the Terms of Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">Annex: Technical and organizational measures</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm border border-navy-100">
                <thead className="bg-navy-50 text-left">
                  <tr>
                    <th className="px-3 py-2 font-semibold text-navy-900">Measure</th>
                    <th className="px-3 py-2 font-semibold text-navy-900">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {TOMS.map(([measure, description]) => (
                    <tr key={measure} className="border-t border-navy-100">
                      <td className="px-3 py-2 font-medium text-navy-800">{measure}</td>
                      <td className="px-3 py-2">{description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">Execution</h2>
            <p className="mt-2">
              This DPA is effective upon the Controller&apos;s acceptance of the Terms of
              Service. To request a countersigned copy or to negotiate enterprise terms,
              contact{" "}
              <a href="mailto:legal@shippingsavior.com" className="text-ocean-600">
                legal@shippingsavior.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
