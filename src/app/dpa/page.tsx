import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "@/components/LegalPageShell";
import { LEGAL_CONTACTS } from "@/lib/legal/last-updated";

export const metadata: Metadata = {
  title: "Data Processing Agreement | Shipping Savior",
  description:
    "Shipping Savior's Data Processing Agreement is available on request for Enterprise customers.",
};

export default function DataProcessingAgreementPage() {
  return (
    <LegalPageShell
      title="Data Processing Agreement (DPA)"
      subtitle="Available on request for Enterprise customers."
      hideDraftBanner
    >
      {/* TODO: review — placeholder pending lawyer review. The actual DPA is
          enterprise-only and must be drafted with counsel. */}
      <section>
        <p>
          Our Data Processing Agreement (DPA) supplements the{" "}
          <Link href="/terms" className="text-ocean-600 underline">
            Terms of Service
          </Link>{" "}
          and our{" "}
          <Link href="/privacy" className="text-ocean-600 underline">
            Privacy Policy
          </Link>
          {" "}for customers who, in connection with their use of the
          Service, are processing personal data subject to the GDPR, UK
          GDPR, the California Consumer Privacy Act, or similar privacy
          regulations.
        </p>

        <p className="mt-4">
          The DPA is currently available <strong>on request</strong> for
          customers on our Enterprise plan. It includes:
        </p>

        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Roles of the parties (controller / processor)</li>
          <li>Subject matter, duration, and purpose of processing</li>
          <li>Categories of data subjects and personal data</li>
          <li>Sub-processor list (kept current at{" "}
            <Link href="/sub-processors" className="text-ocean-600 underline">
              /sub-processors
            </Link>
            )
          </li>
          <li>Standard Contractual Clauses (SCCs) for international transfers</li>
          <li>Security measures (Annex II)</li>
          <li>Audit rights and incident notification timelines</li>
          <li>Data subject rights assistance and deletion procedures</li>
        </ul>

        <p className="mt-4">
          To request a DPA, please contact{" "}
          <a
            href={`mailto:${LEGAL_CONTACTS.sales}`}
            className="text-ocean-600 underline"
          >
            {LEGAL_CONTACTS.sales}
          </a>{" "}
          with your organization name and signing authority. We typically
          turn requests around within five business days.
        </p>

        <p className="mt-4 text-sm text-navy-500">
          {/* TODO: review — once AI-8782 contact form ships, point this CTA there */}
          You can also reach us through the contact form (coming soon).
        </p>
      </section>
    </LegalPageShell>
  );
}
