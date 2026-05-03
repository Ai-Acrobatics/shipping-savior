import IndustryPage, {
  type IndustryPageProps,
} from "@/components/marketing/IndustryPage";

export const metadata = {
  title: "Personal Care + Beauty Logistics Intelligence | Shipping Savior",
  description:
    "Get cosmetics and personal-care goods to retail shelves on schedule. FTZ savings calculator, compliance doc storage, and carrier reliability scoring built for high-compliance brands.",
  openGraph: {
    title: "Personal Care + Beauty Logistics Intelligence | Shipping Savior",
    description:
      "Compliance-heavy goods with global supply chains. Compare carriers, manage contracts, and avoid customs surprises.",
    type: "website",
  },
};

const props: IndustryPageProps = {
  vertical: "personal care",
  hero: {
    eyebrow: "Built for personal care + beauty",
    h1: "Get cosmetics + personal care to retail shelves on schedule",
    subhead:
      "Compliance-heavy goods with global supply chains. Shipping Savior helps personal-care importers compare carriers, manage contracts, and avoid customs surprises.",
    primaryCTA: { label: "See a demo", href: "/demo" },
    secondaryCTA: { label: "View pricing", href: "/pricing" },
  },
  problems: [
    {
      title: "Cosmetic regulations vary by destination",
      body: "FDA, EU CPNP, Health Canada — every market has its own ingredient and labeling rules. Get one wrong and the whole container sits.",
      icon: "shield",
    },
    {
      title: "Compliance docs scattered across emails",
      body: "MSDS sheets, ingredient declarations, country-of-origin certs — buried in Outlook threads when customs asks for them.",
      icon: "filecheck",
    },
    {
      title: "FTZ savings unclear for high-volume importers",
      body: "Cosmetic ingredients pay different duty in different forms. FTZ entry can save 5-15% but you have to model it before you book.",
      icon: "calculator",
    },
  ],
  features: [
    {
      title: "FTZ savings calculator (260+ zones)",
      body: "Model duty savings by FTZ zone before you book. Lock rates at entry, schedule incremental withdrawals, and compare PF vs NPF status side by side.",
      link: "/platform/calculators",
      icon: "calculator",
    },
    {
      title: "Compliance doc storage on shipment records",
      body: "Attach MSDS, ingredient declarations, and CPNP certs directly to each shipment record. Never search Outlook for that one PDF again.",
      link: "/platform/shipments",
      icon: "filecheck",
    },
    {
      title: "Carrier reliability scoring",
      body: "Premium beauty doesn't ship at any cost — it ships reliably. Compare on-time performance, damage rates, and lane reliability for your top retail destinations.",
      link: "/platform/calculators",
      icon: "trending",
    },
  ],
  quote: {
    text: "We saved $14k on a single FTZ entry that would have gone full-duty without this.",
    author: "Trade Compliance Lead",
    role: "Trade Compliance Lead",
    company: "beauty brand importer",
  },
  metrics: [
    { label: "FTZ zones tracked", value: "260+" },
    { label: "HTS codes including cosmetic categories", value: "200+" },
    { label: "Average savings per FTZ entry", value: "$14k" },
    { label: "Destination ports", value: "3,700+" },
  ],
  useCases: [
    {
      name: "Shanghai → LA FTZ #50 (cosmetic ingredients, $640K declared value)",
      description:
        "Bulk cosmetic ingredients entering FTZ #50 at the Port of Long Beach. We modeled duty-lock at entry vs incremental withdrawal — the importer saved 11% on annual duty by switching to PF status before the next tariff schedule.",
    },
    {
      name: "Marseille → New York (luxury fragrance retail)",
      description:
        "Premium fragrance for prestige retail with a 14-day shelf-target window. Carrier reliability scoring surfaced that the cheaper option had a 71% on-time rate — the small premium for the more reliable lane was worth it for shelf-date guarantees.",
    },
  ],
  cta: {
    headline: "Ready to ship beauty on schedule?",
    subhead:
      "20-minute walkthrough of FTZ modeling, compliance doc storage, and carrier reliability scoring for your specific brand SKUs and lanes.",
  },
};

export default function PersonalCareIndustryPage() {
  return <IndustryPage {...props} />;
}
