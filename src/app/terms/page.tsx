import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Shipping Savior",
  description: "The terms that govern use of the Shipping Savior platform.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-ocean-600 hover:text-ocean-700">
          ← Back to home
        </Link>
        <h1 className="mt-6 text-4xl font-bold text-navy-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-navy-500">Last updated: June 11, 2026</p>

        <div className="mt-10 max-w-none space-y-8 text-navy-700">
          <section>
            <h2 className="text-xl font-semibold text-navy-900">1. Agreement</h2>
            <p className="mt-2">
              These Terms govern your use of the Shipping Savior platform (the
              &quot;Service&quot;). By creating an account or using the Service you agree to
              these Terms on behalf of yourself and, if applicable, the organization you
              represent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">2. The Service</h2>
            <p className="mt-2">
              Shipping Savior provides logistics planning tools: landed-cost and FTZ
              calculators, document data extraction, contract rate analysis, shipment
              tracking, and AI-assisted recommendations. Outputs are{" "}
              <strong>estimates and decision support, not professional advice</strong>. Duty
              rates, tariffs, schedules, and compliance requirements change; always confirm
              with a licensed customs broker, freight forwarder, or counsel before acting.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">3. Accounts &amp; acceptable use</h2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Keep your credentials secure; you are responsible for activity under your account.</li>
              <li>Only upload documents and data you have the right to process.</li>
              <li>No scraping, bulk-extracting, or reselling Service data or outputs.</li>
              <li>No reverse-engineering, probing, or disrupting the Service.</li>
              <li>No use that violates export control, sanctions, or other applicable law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">4. Plans, billing, and trials</h2>
            <p className="mt-2">
              Paid plans are billed by Stripe on a recurring subscription basis. Usage limits
              for each plan are described on the{" "}
              <Link href="/pricing" className="text-ocean-600">pricing page</Link>. You can
              cancel anytime from the billing portal; access continues through the end of the
              paid period. Fees are non-refundable except where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">5. Your data</h2>
            <p className="mt-2">
              You retain all rights to data and documents you upload. You grant us a limited
              license to process them to operate the Service (including AI extraction as
              described in the{" "}
              <Link href="/privacy" className="text-ocean-600">Privacy Policy</Link>). We do
              not use your documents to train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">6. Availability</h2>
            <p className="mt-2">
              We target high availability but the Service is provided &quot;as is&quot; and
              &quot;as available&quot; without warranties of any kind, express or implied,
              including merchantability, fitness for a particular purpose, and
              non-infringement. Enterprise SLAs, where purchased, are defined in the
              applicable order form.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">7. Limitation of liability</h2>
            <p className="mt-2">
              To the maximum extent permitted by law, neither party is liable for indirect,
              incidental, special, consequential, or punitive damages, or lost profits or
              revenue. Our total liability under these Terms is limited to the amounts you
              paid for the Service in the 12 months before the claim arose. Nothing limits
              liability for willful misconduct or amounts that cannot be limited by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">8. Termination</h2>
            <p className="mt-2">
              You may close your account at any time. We may suspend or terminate accounts
              that violate these Terms, with notice where practicable. On termination you may
              export your data for 30 days, after which it is scheduled for deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">9. Governing law</h2>
            <p className="mt-2">
              These Terms are governed by the laws of the State of California, excluding its
              conflict-of-laws rules. Disputes will be resolved in the state or federal courts
              located in San Diego County, California.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">10. Changes</h2>
            <p className="mt-2">
              We may update these Terms; material changes will be announced by email or in-app
              notice at least 14 days before taking effect. Continued use after the effective
              date constitutes acceptance. Questions:{" "}
              <a href="mailto:legal@shippingsavior.com" className="text-ocean-600">
                legal@shippingsavior.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
