import type { Metadata } from "next";
import LegalPageShell from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Sub-processors | Shipping Savior",
  description:
    "The sub-processors Shipping Savior engages to deliver the platform, where they process data, and links to their privacy policies.",
};

interface Subprocessor {
  name: string;
  purpose: string;
  region: string;
  privacyUrl: string;
}

// TODO: review — keep this list synchronized with the sub-processor list in
// /privacy section 4 and any signed DPAs. Add new entries the same day a
// new sub-processor is engaged.
const SUBPROCESSORS: Subprocessor[] = [
  {
    name: "Neon",
    purpose: "Managed PostgreSQL hosting (primary database).",
    region: "United States (US-East)",
    privacyUrl: "https://neon.tech/privacy-policy",
  },
  {
    name: "Vercel",
    purpose: "Application hosting, edge network, and serverless functions.",
    region: "United States (global edge)",
    privacyUrl: "https://vercel.com/legal/privacy-policy",
  },
  {
    name: "Stripe",
    purpose: "Payment processing and billing.",
    region: "United States",
    privacyUrl: "https://stripe.com/privacy",
  },
  {
    name: "Resend",
    purpose: "Transactional email delivery.",
    region: "United States",
    privacyUrl: "https://resend.com/legal/privacy-policy",
  },
  {
    name: "Sentry",
    purpose: "Error monitoring and performance tracking.",
    region: "United States",
    privacyUrl: "https://sentry.io/privacy/",
  },
  {
    name: "PostHog",
    purpose:
      "Product analytics. Loaded only after user grants analytics cookie consent.",
    region: "United States / European Union (configurable)",
    privacyUrl: "https://posthog.com/privacy",
  },
  {
    name: "Anthropic (Claude)",
    purpose:
      "AI processing of uploaded Bills of Lading and contracts. Zero-retention configuration; data is not used for training.",
    region: "United States",
    privacyUrl: "https://www.anthropic.com/legal/privacy",
  },
  {
    name: "Google",
    purpose:
      "OAuth sign-in and (where applicable) Google Calendar / Workspace integrations.",
    region: "United States (global)",
    privacyUrl: "https://policies.google.com/privacy",
  },
];

export default function SubprocessorsPage() {
  return (
    <LegalPageShell
      title="Sub-processors"
      subtitle="Vendors that process data on our behalf to deliver the platform."
      hideDraftBanner
    >
      <section>
        <p>
          Shipping Savior uses the following sub-processors to provide the
          Service. Each sub-processor is bound by a written data processing
          agreement and is contractually required to apply appropriate
          technical and organizational measures to protect your data.
        </p>
        <p>
          We notify customers of material changes (additions or
          replacements) by email or in-app notice at least 14 days before
          the change takes effect, where practicable.
        </p>
      </section>

      <section className="not-prose">
        {/* TODO: review — confirm regions and links are still accurate at launch */}
        <div className="overflow-x-auto rounded-lg border border-navy-100">
          <table className="w-full text-sm">
            <thead className="bg-navy-50 text-navy-700">
              <tr>
                <th className="text-left font-semibold px-4 py-3">
                  Sub-processor
                </th>
                <th className="text-left font-semibold px-4 py-3">Purpose</th>
                <th className="text-left font-semibold px-4 py-3">
                  Processing region
                </th>
                <th className="text-left font-semibold px-4 py-3">
                  Privacy policy
                </th>
              </tr>
            </thead>
            <tbody>
              {SUBPROCESSORS.map((sp) => (
                <tr
                  key={sp.name}
                  className="border-t border-navy-100 align-top"
                >
                  <td className="px-4 py-3 font-medium text-navy-900">
                    {sp.name}
                  </td>
                  <td className="px-4 py-3 text-navy-600">{sp.purpose}</td>
                  <td className="px-4 py-3 text-navy-600">{sp.region}</td>
                  <td className="px-4 py-3">
                    <a
                      href={sp.privacyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ocean-600 underline"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </LegalPageShell>
  );
}
