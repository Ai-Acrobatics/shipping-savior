import IndustryPage, {
  type IndustryPageProps,
} from "@/components/marketing/IndustryPage";

export const metadata = {
  title: "Automotive Logistics Intelligence | Shipping Savior",
  description:
    "Track parts, vehicles, and drayage from port to plant. Multi-modal route comparison (ocean + rail + drayage), HTS classification for automotive parts, and contract IQ for OEM rate sheets.",
  openGraph: {
    title: "Automotive Logistics Intelligence | Shipping Savior",
    description:
      "Just-in-time supply chains can't tolerate guesswork. Wire carrier intelligence, contract management, and BOL OCR into a single picture.",
    type: "website",
  },
};

const props: IndustryPageProps = {
  vertical: "automotive",
  hero: {
    eyebrow: "Built for automotive",
    h1: "Track parts, vehicles, and drayage from port to plant",
    subhead:
      "Just-in-time supply chains can't tolerate guesswork. Shipping Savior wires carrier intelligence, contract management, and BOL OCR into a single picture for automotive importers.",
    primaryCTA: { label: "See a demo", href: "/demo" },
    secondaryCTA: { label: "View pricing", href: "/pricing" },
  },
  problems: [
    {
      title: "Parts arriving late stops the line",
      body: "A 48-hour vessel slip on a JIT part can idle a Detroit assembly line. The carrier rarely tells you in time to react.",
      icon: "clock",
    },
    {
      title: "Multi-modal shipments = 4 spreadsheets",
      body: "Ocean leg, rail intermodal, drayage to plant — three carriers, three trackers, one nightmare. We collapse it.",
      icon: "container",
    },
    {
      title: "Tariff classification disputes for automotive parts",
      body: "HTS codes for automotive components are dense, contested, and expensive to get wrong. We surface the right code before entry.",
      icon: "shield",
    },
  ],
  features: [
    {
      title: "Multi-modal route comparison (ocean + rail + drayage)",
      body: "Compare Yokohama → Long Beach → Detroit by rail vs Yokohama → Tacoma → Detroit in a single view with end-to-end transit time.",
      link: "/platform/calculators",
      icon: "route",
    },
    {
      title: "HTS classification for automotive parts",
      body: "Search 200+ HTS codes including auto components — wiring harnesses, transmissions, brake systems, engine assemblies — with duty rates and FTA eligibility.",
      link: "/platform/calculators",
      icon: "calculator",
    },
    {
      title: "Contract IQ for OEM rate sheets",
      body: "Drop your OEM contract PDFs — Claude parses lane rates, validity dates, and minimum-volume commitments. We flag bookings that fall off-contract.",
      link: "/platform/contracts",
      icon: "filecheck",
    },
  ],
  quote: {
    text: "When a vessel slips two days, I need to know in 60 seconds — not when the carrier remembers to call.",
    author: "Logistics Manager",
    role: "Logistics Manager",
    company: "North American auto-parts importer",
  },
  metrics: [
    { label: "HTS codes for automotive components", value: "200+" },
    { label: "Multi-modal: ocean + rail + drayage in one view", value: "1 view" },
    { label: "In tracked freight", value: "$2.4B" },
    { label: "Ports including major auto hubs", value: "3,700+" },
  ],
  useCases: [
    {
      name: "Yokohama → Long Beach → Detroit by rail (just-in-time parts)",
      description:
        "JIT wiring harnesses with a 4-day plant buffer. We benchmark Ocean Alliance vs THE Alliance for the Pacific leg, rail capacity at LA basin, and surface a single ETA at the plant gate that updates as conditions change.",
    },
    {
      name: "Hamburg → New York drayage to Pennsylvania assembly plant",
      description:
        "European OEM transmissions with HTS 8708.40 classification. Contract IQ caught that the booking had been routed off-contract by a freight forwarder — saved $11K on a single 40' high-cube.",
    },
  ],
  cta: {
    headline: "Ready to keep the line running?",
    subhead:
      "20-minute walkthrough of multi-modal routing, HTS classification, and contract intelligence for your specific OEM lanes.",
  },
};

export default function AutomotiveIndustryPage() {
  return <IndustryPage {...props} />;
}
