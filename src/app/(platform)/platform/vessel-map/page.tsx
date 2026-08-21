import { requireOrg } from "@/lib/auth/session";
import VesselMapClient from "./VesselMapClient";

export const metadata = {
  title: "Vessel Map | Shipping Savior",
  description: "Live vessel positions and route arcs for your active ocean lanes.",
};

// Positions are per-org and time-sensitive — never statically rendered.
export const dynamic = "force-dynamic";

/**
 * AI-12012 — MapLibre vessel map. Server component enforces the org gate; all
 * map rendering happens client-side because MapLibre needs a real DOM.
 */
export default async function VesselMapPage() {
  await requireOrg();
  return <VesselMapClient />;
}
