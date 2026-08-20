import Link from "next/link";
import {
  SUBPROCESSORS,
  SUBPROCESSORS_LAST_UPDATED,
} from "@/lib/legal/subprocessors";

export const metadata = {
  title: "Sub-processors | Shipping Savior",
  description:
    "The complete register of third-party sub-processors Shipping Savior uses to deliver the platform, what each one processes, and where.",
  openGraph: {
    title: "Sub-processors | Shipping Savior",
    description:
      "Every third party that can process customer data on Shipping Savior's behalf, with purpose, location, and transfer mechanism.",
    type: "article",
  },
};

export default function SubProcessorsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Link href="/" className="text-sm text-ocean-600 hover:text-ocean-700">
          ← Back to home
        </Link>
        <h1 className="mt-6 text-4xl font-bold text-navy-900">Sub-processors</h1>
        <p className="mt-2 text-sm text-navy-500">
          Last updated: {SUBPROCESSORS_LAST_UPDATED}
        </p>

        <div className="prose prose-navy mt-10 max-w-none space-y-8 text-navy-700">
          <section>
            <p>
              To run Shipping Savior we rely on the third-party providers listed below.
              Each one is a &quot;sub-processor&quot; under Article 28 of the GDPR: it may
              process customer personal data on our behalf, only on our documented
              instructions, and only for the purpose stated in its row.
            </p>
            <p className="mt-4">
              This register is the authoritative list. It is maintained in the application
              itself, so the page you are reading always reflects the vendors currently in
              production — there is no separate spreadsheet that can drift out of date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">Current register</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-navy-200 text-left text-navy-900">
                    <th className="py-2 pr-4 font-semibold">Sub-processor</th>
                    <th className="py-2 pr-4 font-semibold">Purpose</th>
                    <th className="py-2 pr-4 font-semibold">Data categories</th>
                    <th className="py-2 pr-4 font-semibold">Location</th>
                    <th className="py-2 font-semibold">Transfer basis</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBPROCESSORS.map((s) => (
                    <tr key={s.name} className="border-b border-navy-100 align-top">
                      <td className="py-2 pr-4 font-medium text-navy-900">{s.name}</td>
                      <td className="py-2 pr-4">{s.purpose}</td>
                      <td className="py-2 pr-4">{s.dataCategories}</td>
                      <td className="py-2 pr-4">{s.location}</td>
                      <td className="py-2">{s.transferMechanism}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">
              International transfers
            </h2>
            <p className="mt-2">
              Where a sub-processor processes personal data outside the EEA or UK, the
              transfer is covered by the European Commission&apos;s Standard Contractual
              Clauses (SCCs) incorporated into our{" "}
              <Link href="/dpa" className="text-ocean-600 hover:text-ocean-700">
                Data Processing Agreement
              </Link>
              , together with the technical and organisational measures described there.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">
              Notice of changes
            </h2>
            <p className="mt-2">
              We will update this page before a new sub-processor begins processing
              customer personal data. Customers on an enterprise agreement can subscribe to
              change notices by emailing{" "}
              <a href="mailto:privacy@shippingsavior.com" className="text-ocean-600">
                privacy@shippingsavior.com
              </a>{" "}
              with the subject &quot;sub-processor notices&quot;; we will give at least 30
              days&apos; notice before the change takes effect, during which you may object
              in writing under the DPA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">Related documents</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <Link href="/privacy" className="text-ocean-600 hover:text-ocean-700">
                  Privacy Policy
                </Link>{" "}
                — what we collect and why
              </li>
              <li>
                <Link href="/dpa" className="text-ocean-600 hover:text-ocean-700">
                  Data Processing Agreement
                </Link>{" "}
                — Article 28 terms and SCCs
              </li>
              <li>
                <Link href="/security" className="text-ocean-600 hover:text-ocean-700">
                  Security
                </Link>{" "}
                — controls protecting the data these vendors handle
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
