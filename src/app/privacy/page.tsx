import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Shipping Savior",
  description: "How Shipping Savior collects, uses, and protects your data.",
};

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

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-ocean-600 hover:text-ocean-700">
          ← Back to home
        </Link>
        <h1 className="mt-6 text-4xl font-bold text-navy-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-navy-500">Last updated: June 11, 2026</p>

        <div className="prose prose-navy mt-10 max-w-none space-y-8 text-navy-700">
          <section>
            <h2 className="text-xl font-semibold text-navy-900">1. Who we are</h2>
            <p className="mt-2">
              Shipping Savior (&quot;we&quot;, &quot;us&quot;) provides a logistics intelligence
              platform for freight planning, document processing, and supply-chain analytics.
              This policy describes how we handle personal data when you use
              shipping-savior.vercel.app and related applications. For privacy questions or
              requests, contact{" "}
              <a href="mailto:privacy@shippingsavior.com" className="text-ocean-600">
                privacy@shippingsavior.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">2. Data we collect</h2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li><strong>Account data:</strong> name, email address, hashed password, organization name and role.</li>
              <li><strong>Billing data:</strong> subscription plan and payment status. Card details are processed by Stripe and never stored on our servers.</li>
              <li><strong>Shipment &amp; document data:</strong> documents you upload (bills of lading, rate sheets) and the structured data extracted from them — including shipper, consignee, and routing details contained in those documents.</li>
              <li><strong>Usage data:</strong> pages visited, features used, device/browser information, and IP address (for security and rate limiting).</li>
              <li><strong>Communications:</strong> support requests and emails you send us.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">3. How we use data</h2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Provide and operate the platform (authentication, calculators, document extraction, dashboards).</li>
              <li>Process payments and manage subscriptions.</li>
              <li>Send transactional emails (verification, password reset, team invites, alerts you configure).</li>
              <li>Monitor errors, secure the service, and prevent abuse.</li>
              <li>Improve the product through aggregated, de-identified analytics.</li>
            </ul>
            <p className="mt-2">
              We do <strong>not</strong> sell your personal data, and we do not use your uploaded
              documents to train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">4. AI processing</h2>
            <p className="mt-2">
              When you upload a document for extraction or use the AI assistant, the document
              content or your prompt is sent to our AI sub-processors (Anthropic, and as
              fallback Google or Moonshot AI) solely to generate the requested output. These
              providers process the data under their API terms, which prohibit using customer
              API content to train their models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">5. Sub-processors</h2>
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
            <h2 className="text-xl font-semibold text-navy-900">6. Retention</h2>
            <p className="mt-2">
              Account data is retained while your account is active. Uploaded documents and
              extracted shipment data are retained until you delete them or close your account.
              Audit and security logs are retained for up to 12 months. Backups roll off within
              35 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">7. Your rights</h2>
            <p className="mt-2">
              Depending on your jurisdiction (including GDPR and CCPA/CPRA), you may have the
              right to access, correct, export, or delete your personal data, and to object to
              or restrict certain processing. To exercise any of these rights, email{" "}
              <a href="mailto:privacy@shippingsavior.com" className="text-ocean-600">
                privacy@shippingsavior.com
              </a>{" "}
              from your account email. We respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">8. Security</h2>
            <p className="mt-2">
              Data is encrypted in transit (TLS) and at rest. Passwords are hashed with bcrypt.
              Access to production systems is limited to authorized personnel. No method of
              transmission or storage is 100% secure; we encourage strong, unique passwords.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">9. Children</h2>
            <p className="mt-2">
              The service is for business use and not directed to anyone under 16. We do not
              knowingly collect data from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">10. Changes</h2>
            <p className="mt-2">
              We will post any changes to this policy on this page and update the date above.
              Material changes will be announced by email or in-app notice.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
