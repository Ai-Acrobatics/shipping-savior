import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Shipping Savior",
  description:
    "Transparent pricing for international logistics intelligence. Free for small importers, Premium for growing brokerages, Enterprise for large shippers. Per-user bundles up to 8, 20, or unlimited.",
  openGraph: {
    title: "Pricing | Shipping Savior",
    description:
      "Free, Premium, and Enterprise tiers. Value-based pricing — if the decisions we help you make save $100K, we're worth $5K.",
    type: "website",
    url: "https://shipping-savior.vercel.app/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
