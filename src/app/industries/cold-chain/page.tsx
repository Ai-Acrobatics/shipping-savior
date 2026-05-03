import IndustryPage, {
  type IndustryPageProps,
} from "@/components/marketing/IndustryPage";

export const metadata = {
  title: "Cold-Chain Logistics Intelligence | Shipping Savior",
  description:
    "Move temperature-sensitive freight without losing shelf life. Reefer carrier comparison, BOL OCR for refrigerated bills, FTZ savings, and contract intelligence for cold-chain importers.",
  openGraph: {
    title: "Cold-Chain Logistics Intelligence | Shipping Savior",
    description:
      "From premium produce importers to pharma distributors — surface the carrier, route, and contract that protects your margin AND your shelf life.",
    type: "website",
  },
};

const props: IndustryPageProps = {
  vertical: "cold-chain",
  hero: {
    eyebrow: "Built for cold-chain",
    h1: "Move temperature-sensitive freight without losing shelf life",
    subhead:
      "From premium produce importers to pharma distributors, Shipping Savior surfaces the carrier, route, and contract that protects your margin AND your shelf life.",
    primaryCTA: { label: "See a 2-minute demo", href: "/demo" },
    secondaryCTA: { label: "View pricing", href: "/pricing" },
  },
  problems: [
    {
      title: "Reefer rates change daily",
      body: "Carrier reefer pricing shifts week over week, and the BCO who quoted you Monday may not be competitive Friday.",
      icon: "snowflake",
    },
    {
      title: "Transit time = retail shelf life",
      body: "Every day in transit eats shelf life at the grocer. Two days saved on a Pacific crossing is real margin downstream.",
      icon: "clock",
    },
    {
      title: "Tariff exposure on perishables",
      body: "FTZ entry can lock duty rates and protect against in-transit hikes — but only if you can model it before booking.",
      icon: "shield",
    },
    {
      title: "Cold-chain certifications scattered across carriers",
      body: "Reefer monitoring, GDP, HACCP — every carrier reports compliance differently. We normalize it into one view.",
      icon: "filecheck",
    },
  ],
  features: [
    {
      title: "Reefer carrier comparison",
      body: "Compare Maersk, MSC, Matson, Pasha and 4 other reefer-equipped lines side by side with real reliability scores.",
      link: "/platform/calculators",
      icon: "ship",
    },
    {
      title: "BOL OCR for refrigerated bills",
      body: "Drag-drop a refrigerated BOL — Claude vision extracts carrier, dates, temp setpoints, and reefer container IDs in seconds.",
      link: "/platform/shipments",
      icon: "filecheck",
    },
    {
      title: "Contract IQ catches tariff bookings",
      body: "When a shipment gets booked at tariff rate but you have an active contract for that lane, we flag it before it ships.",
      link: "/platform/contracts",
      icon: "shield",
    },
    {
      title: "Shelf-life impact calculator",
      body: "Model how a route choice (fastest vs cheapest vs reliability) affects retail shelf life at the destination grocer.",
      link: "/platform/calculators",
      icon: "calculator",
    },
  ],
  quote: {
    text: "We rebuild the same shipment spreadsheet 4 times a quarter. This finally killed it.",
    author: "Operations Director",
    role: "Operations Director",
    company: "premium fresh-produce importer",
  },
  metrics: [
    { label: "More shelf life on Auckland → Honolulu via Matson", value: "21%" },
    { label: "Average FTZ savings per cold-chain entry", value: "$14,200" },
    { label: "Reliability for top 3 reefer carriers", value: "94%" },
    { label: "Minutes to compare 8 carriers", value: "5 min" },
  ],
  useCases: [
    {
      name: "Auckland → Honolulu produce",
      description:
        "Matson 14 days vs Pasha 17 days — the 3-day difference is shelf life on every pallet. We surface both with reliability scores and lane-specific reefer rates so you don't have to call two carriers to find out.",
    },
    {
      name: "Rotterdam → Long Beach cold-chain retail",
      description:
        "Contract IQ flagged a $42K tariff exposure on a refrigerated booking — the importer had an active contract for that lane and didn't realize it had been routed off-contract.",
    },
  ],
  cta: {
    headline: "Ready to protect your cold-chain margin?",
    subhead:
      "20-minute walkthrough of reefer comparison, contract intelligence, and FTZ modeling for your specific lanes. Zero slides — your shipments, our data.",
  },
};

export default function ColdChainIndustryPage() {
  return <IndustryPage {...props} />;
}
