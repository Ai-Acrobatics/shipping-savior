import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Demo | Shipping Savior",
  description:
    "Walk through real-world logistics scenarios — Qingdao to LA, West Coast cross-dock, multi-modal routing, FTZ strategy, and contract intelligence. 20-minute guided product tour.",
  openGraph: {
    title: "Live Demo | Shipping Savior",
    description:
      "See real-world logistics scenarios in action. Carrier comparison, FTZ savings modeling, and contract intelligence — no slides.",
    type: "website",
    url: "https://shipping-savior.vercel.app/demo",
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
