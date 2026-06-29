import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "@/components/LegalPageShell";
import { LEGAL_CONTACTS } from "@/lib/legal/last-updated";

export const metadata: Metadata = {
  title: "Privacy Policy | Shipping Savior",
  description:
    "How Shipping Savior collects, uses, retains, and protects your data, and how you can exercise your rights as a data subject.",
};

/* eslint-disable react/no-unescaped-entities */
export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your data."
    >
      {/* TODO: review — entire document is a working draft. Final wording
          must be approved by Julian and counsel before go-live. Do NOT copy
          another company's policy verbatim. */}

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-2 mb-3">
          1. Who we are
        </h2>
        <p>
          Shipping Savior ("Shipping Savior", "we", "us", "our") is an
          international logistics intelligence platform that helps importers,
          exporters, freight forwarders, and brokers calculate landed cost,
          compare carriers, and manage shipments. This Privacy Policy
          describes how we handle personal data we receive about you when you
          use the platform at <Link href="/" className="text-ocean-600 underline">shippingsavior.com</Link> and any associated services.
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          2. Data we collect
        </h2>
        <p>
          We collect the following categories of personal data:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>
            <strong>Account information.</strong> Name, email address, hashed
            password, organization name, and role.
          </li>
          <li>
            <strong>Shipment data you upload.</strong> Bills of lading, CSVs,
            container numbers, vessel and port details, consignee/shipper
            names, cargo descriptions, weights, and any other content you
            choose to import. This data may include personal data about
            counterparties (e.g. consignees) where you have a lawful basis to
            share it with us.
          </li>
          <li>
            <strong>Calculation inputs and outputs.</strong> The values you
            enter into our calculators (landed cost, FTZ savings, unit
            economics, etc.) and the results we return.
          </li>
          <li>
            <strong>Usage analytics.</strong> Pages viewed, features used,
            approximate location derived from IP, device and browser
            metadata, and referral source. Subject to your cookie consent.
          </li>
          <li>
            <strong>Cookies and similar technologies.</strong> Essential
            cookies required to keep you signed in, plus analytics cookies
            that you may accept or reject via our consent banner.
          </li>
          <li>
            <strong>Communications.</strong> Support emails, in-app messages,
            and meeting notes you share with us.
          </li>
        </ul>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          3. Why we collect it
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Provide the platform.</strong> We need account and
            shipment data to deliver the calculators, dashboards, and
            tracking features you signed up for.
          </li>
          <li>
            <strong>Billing.</strong> We process payments through our
            sub-processor and need a minimum set of data (email, plan,
            invoice address) to do so.
          </li>
          <li>
            <strong>Customer support.</strong> Diagnosing issues and
            answering questions you submit through the platform or by email.
          </li>
          <li>
            <strong>Product improvement.</strong> Aggregated, de-identified
            usage analytics so we can fix friction points and prioritize
            features. You can opt out of analytics via the cookie banner.
          </li>
          <li>
            <strong>Legal compliance.</strong> Tax records, audit logs,
            sanctioned-party screening, and responding to lawful requests
            from regulators.
          </li>
          <li>
            <strong>AI-assisted features.</strong> When you upload a Bill of
            Lading or contract for OCR, the file is processed by our AI
            sub-processor (Anthropic) under a zero-retention configuration.
            We do not train models on your data.
          </li>
        </ul>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          4. Sub-processors
        </h2>
        <p>
          We rely on the following sub-processors to operate the platform.
          Each is bound by a written data processing agreement and is
          contractually required to apply appropriate technical and
          organizational measures to protect your data. The full,
          continuously-maintained list lives at{" "}
          <Link href="/sub-processors" className="text-ocean-600 underline">
            /sub-processors
          </Link>
          .
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>
            <strong>Neon</strong> — managed PostgreSQL hosting (database).
          </li>
          <li>
            <strong>Vercel</strong> — application hosting and edge network.
          </li>
          <li>
            <strong>Stripe</strong> — payment processing and billing.
          </li>
          <li>
            <strong>Resend</strong> — transactional email delivery.
          </li>
          <li>
            <strong>Sentry</strong> — error monitoring and performance
            tracking.
          </li>
          <li>
            <strong>PostHog</strong> — product analytics (subject to
            cookie consent).
          </li>
          <li>
            <strong>Anthropic (Claude)</strong> — AI processing of uploaded
            documents (zero-retention configuration).
          </li>
          <li>
            <strong>Google</strong> — OAuth sign-in and (where applicable)
            calendar integration.
          </li>
        </ul>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          5. Data retention
        </h2>
        <p>
          By default, we retain account data and shipment records for{" "}
          <strong>seven (7) years</strong> after account closure, to support
          customers' tax, customs, and audit obligations. Specific
          customers may negotiate a different retention window in their
          enterprise agreement. Audit logs (sign-ins, sign-outs, account
          changes) are retained for the same period for security and
          compliance purposes.
        </p>
        <p>
          When you delete your account, we hard-delete personal account data
          immediately, except for a minimal audit-log entry (your user ID,
          timestamp, and action) which we retain to detect abuse and
          satisfy our legal obligations. See section 7 for details.
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          6. Your rights
        </h2>
        <p>
          Subject to applicable law, you have the following rights with
          respect to your personal data:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>
            <strong>Access and portability.</strong> Download a copy of your
            data via{" "}
            <code className="bg-navy-50 px-1 rounded text-xs">
              GET /api/account/export
            </code>{" "}
            (returns a ZIP containing account.json, shipments.csv,
            calculations.json, and audit_log.csv).
          </li>
          <li>
            <strong>Deletion.</strong> Permanently delete your account via{" "}
            <code className="bg-navy-50 px-1 rounded text-xs">
              POST /api/account/delete
            </code>
            .
          </li>
          <li>
            <strong>Rectification.</strong> Correct inaccurate personal data
            from your account settings or by emailing us.
          </li>
          <li>
            <strong>Objection.</strong> Object to processing for product
            improvement (analytics) by rejecting non-essential cookies.
          </li>
          <li>
            <strong>Lodge a complaint.</strong> If you are in the EU/EEA or
            UK, you may complain to your local supervisory authority.
          </li>
        </ul>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          7. International transfers
        </h2>
        <p>
          Several of our sub-processors are headquartered in the United
          States. When we transfer data outside the EU/EEA, we rely on
          appropriate safeguards (Standard Contractual Clauses or, where
          applicable, the EU-US Data Privacy Framework).
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          8. Security
        </h2>
        <p>
          We protect your data with TLS in transit, encryption at rest,
          bcrypt password hashing, role-based access control, and audit
          logging. See our{" "}
          <Link href="/security" className="text-ocean-600 underline">
            Security
          </Link>{" "}
          page for details.
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          9. Children
        </h2>
        <p>
          The platform is not directed to anyone under 16. We do not
          knowingly collect personal data from children. If you believe we
          have, please contact us and we will delete it.
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          10. Changes to this policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. Material
          changes will be announced via in-app notice or email at least 14
          days before they take effect. Continued use of the platform after
          a change indicates acceptance.
        </p>
      </section>

      <section>
        {/* TODO: review — privacy@shippingsavior.com routing depends on AI-8784 */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          11. Contact our Data Protection Officer
        </h2>
        <p>
          Questions about this policy or your data? Email our DPO at{" "}
          <a
            href={`mailto:${LEGAL_CONTACTS.privacy}`}
            className="text-ocean-600 underline"
          >
            {LEGAL_CONTACTS.privacy}
          </a>
          {". "}
          For account or product questions, please use the in-app support
          channel.
        </p>
      </section>
    </LegalPageShell>
  );
}
