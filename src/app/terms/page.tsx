import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "@/components/LegalPageShell";
import { LEGAL_CONTACTS } from "@/lib/legal/last-updated";

export const metadata: Metadata = {
  title: "Terms of Service | Shipping Savior",
  description:
    "The terms governing your use of the Shipping Savior platform, including acceptable use, SLAs, and liability.",
};

/* eslint-disable react/no-unescaped-entities */
export default function TermsOfServicePage() {
  return (
    <LegalPageShell
      title="Terms of Service"
      subtitle="The contract between you and Shipping Savior."
    >
      {/* TODO: review — entire document is a working draft. Final wording
          must be approved by Julian and counsel before go-live. */}

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-2 mb-3">
          1. Agreement to terms
        </h2>
        <p>
          By creating an account or using the Shipping Savior platform
          ("Service") you agree to be bound by these Terms of Service
          ("Terms"). If you are entering into these Terms on behalf of an
          organization, you represent that you have authority to bind that
          organization. If you don't agree to these Terms, don't use the
          Service.
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          2. The Service
        </h2>
        <p>
          Shipping Savior provides software-as-a-service tools for
          international logistics, including landed-cost calculators,
          carrier and route comparison, shipment tracking, and AI-assisted
          document parsing. The Service evolves continuously; features may
          be added, removed, or changed.
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          3. Your account
        </h2>
        <p>
          You are responsible for keeping your account credentials secure
          and for all activity that occurs under your account. Notify us
          immediately at{" "}
          <a
            href={`mailto:${LEGAL_CONTACTS.security}`}
            className="text-ocean-600 underline"
          >
            {LEGAL_CONTACTS.security}
          </a>{" "}
          if you suspect unauthorized access. You must be at least 16 years
          old (or older where required by local law) to use the Service.
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          4. Acceptable use
        </h2>
        <p>You agree NOT to:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>
            Use the Service to scrape, harvest, or aggregate competitor data
            (including carrier-schedule data sourced through us).
          </li>
          <li>
            Resell, sublicense, or redistribute carrier schedule data, port
            data, or HTS data obtained through the Service to third parties
            outside of your organization, except as expressly permitted by a
            separate written agreement.
          </li>
          <li>
            Reverse engineer, decompile, or otherwise attempt to derive the
            source code or underlying models of the Service, except where
            local law expressly grants you that right.
          </li>
          <li>
            Use the Service to build a competing product or to train a
            competing AI model.
          </li>
          <li>
            Violate any applicable export-control, sanctions, customs, or
            anti-bribery laws when using the Service.
          </li>
          <li>
            Upload content you don't have the rights to upload, malware, or
            content that infringes a third party's rights.
          </li>
          <li>
            Probe, scan, or test the vulnerability of the Service except
            under a written authorization from us.
          </li>
        </ul>
      </section>

      <section>
        {/* TODO: review — SLAs and credit math need legal sign-off */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          5. Service-level agreement
        </h2>
        <p>
          Uptime targets and service credits depend on your plan:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>
            <strong>Free</strong> — provided as-is. No SLA. No service
            credits.
          </li>
          <li>
            <strong>Premium</strong> — 99.5% monthly uptime target. If
            actual uptime in a calendar month falls below 99.5%, you may
            request a service credit equal to 10% of that month's fees per
            full hour of downtime, up to 30% of that month's fees.
          </li>
          <li>
            <strong>Enterprise</strong> — 99.9% monthly uptime target. If
            actual uptime in a calendar month falls below 99.9%, service
            credits scale per the credit table in your order form (default:
            10% per full hour of downtime, up to 50% of that month's fees).
          </li>
        </ul>
        <p className="mt-2">
          Service credits are your sole and exclusive remedy for any
          unavailability of the Service. Credit requests must be submitted
          within 30 days of the incident.
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          6. Fees and billing
        </h2>
        <p>
          Paid plans are billed in advance, monthly or annually, through our
          payment sub-processor. Fees are non-refundable except where
          required by law or expressly stated. Past-due amounts may accrue
          interest at the lower of 1.5% per month or the maximum permitted
          by law. We may suspend or terminate your access for non-payment
          after 14 days' written notice.
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          7. Your data
        </h2>
        <p>
          You retain all rights, title, and interest in the data you upload
          to the Service ("Customer Data"). You grant us a limited, non-
          exclusive license to host, process, and display Customer Data
          solely for the purpose of operating the Service for you. We do
          not sell Customer Data and do not use it to train AI models. See
          our{" "}
          <Link href="/privacy" className="text-ocean-600 underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/dpa" className="text-ocean-600 underline">
            DPA
          </Link>{" "}
          for details.
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          8. Intellectual property
        </h2>
        <p>
          The Service, including software, designs, content (other than
          Customer Data), trademarks, and methodologies, is owned by
          Shipping Savior and its licensors. We grant you a limited, non-
          transferable, non-exclusive, revocable right to access and use
          the Service in accordance with these Terms. All rights not
          expressly granted are reserved.
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          9. Disclaimers
        </h2>
        <p>
          The Service is provided "as is" and "as available". To the
          maximum extent permitted by law, we disclaim all warranties,
          express or implied, including merchantability, fitness for a
          particular purpose, non-infringement, and any warranties arising
          from course of dealing or trade usage. Calculations, route
          recommendations, and AI-assisted document parsing are provided
          for informational purposes and are not legal, customs, or tax
          advice. You are responsible for verifying outputs against your
          own filings and counsel.
        </p>
      </section>

      <section>
        {/* TODO: review — liability cap is the standard 12-months-of-fees template */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          10. Limitation of liability
        </h2>
        <p>
          To the maximum extent permitted by law, our aggregate liability
          arising out of or relating to these Terms or the Service will not
          exceed the greater of (i) the fees you paid us in the 12 months
          preceding the event giving rise to the claim, or (ii) US$100. We
          will not be liable for any indirect, incidental, consequential,
          special, exemplary, or punitive damages, or for lost profits,
          revenue, goodwill, or data, even if advised of the possibility of
          such damages.
        </p>
        <p>
          Some jurisdictions don't allow these limitations. To the extent
          your jurisdiction doesn't, the limitations apply only to the
          maximum extent permitted.
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          11. Indemnification
        </h2>
        <p>
          You will defend, indemnify, and hold us harmless from third-party
          claims arising out of (a) your Customer Data, (b) your violation
          of these Terms or applicable law, or (c) your violation of a
          third party's rights, except to the extent such claim arises
          from our gross negligence or willful misconduct.
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          12. Termination
        </h2>
        <p>
          You may terminate your account at any time via{" "}
          <code className="bg-navy-50 px-1 rounded text-xs">
            POST /api/account/delete
          </code>
          {" "}or by contacting support. We may suspend or terminate your
          access if you materially breach these Terms and fail to cure the
          breach within 14 days of written notice, or immediately if your
          use poses a security or legal risk to us or other customers.
        </p>
        <p>
          On termination: (i) your right to use the Service ends, (ii)
          accrued fees remain payable, and (iii) you may export your
          Customer Data via{" "}
          <code className="bg-navy-50 px-1 rounded text-xs">
            GET /api/account/export
          </code>{" "}
          for up to 30 days, after which Customer Data is deleted per our
          retention policy.
        </p>
      </section>

      <section>
        {/* TODO: review — California governing law per Julian's San Diego base */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          13. Governing law and disputes
        </h2>
        <p>
          These Terms are governed by the laws of the State of California,
          USA, without regard to conflict-of-laws rules. The exclusive
          venue for any dispute is the state and federal courts located in
          San Diego County, California. The parties waive any right to a
          jury trial. Nothing in this section prevents either party from
          seeking injunctive relief in any court of competent jurisdiction.
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          14. Changes
        </h2>
        <p>
          We may update these Terms. Material changes will be announced
          via in-app notice or email at least 14 days before they take
          effect. Continued use of the Service after a change indicates
          acceptance.
        </p>
      </section>

      <section>
        {/* TODO: review */}
        <h2 className="text-xl font-semibold text-navy-900 mt-6 mb-3">
          15. Miscellaneous
        </h2>
        <p>
          These Terms, together with the Privacy Policy and any order form
          or DPA you've signed, are the entire agreement between you and us
          regarding the Service and supersede prior agreements on the same
          subject. If any provision is unenforceable, the rest remains in
          effect. We may assign these Terms in connection with a merger,
          acquisition, or sale of assets; you may not assign without our
          prior written consent.
        </p>
      </section>
    </LegalPageShell>
  );
}
