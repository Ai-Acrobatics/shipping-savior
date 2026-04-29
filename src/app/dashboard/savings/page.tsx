// Server component — gates between demo data and real data based on the
// caller's organization `is_demo` flag.
//
// AI-8779: replaces hardcoded mock view with a DB-backed empty state.

import { auth } from "@/lib/auth";
import { getOrgDemoFlag, getShipmentsByOrg } from "@/lib/db/queries/shipments";
import SavingsDemoView from "./SavingsDemoView";
import SavingsEmptyState from "./SavingsEmptyState";

export const dynamic = "force-dynamic";

export default async function SavingsPage() {
  const session = await auth();

  // Unauthenticated visitors get the demo so the public marketing dashboard
  // tour stays coherent (mirrors dashboard/page.tsx).
  if (!session?.user) {
    return <SavingsDemoView />;
  }

  const orgId = session.user.orgId;
  if (!orgId) {
    // No org membership — fall through to empty state
    return <SavingsEmptyState />;
  }

  const org = await getOrgDemoFlag(orgId);

  // Demo orgs see the rich mock dashboard
  if (org?.isDemo) {
    return <SavingsDemoView />;
  }

  // Real orgs: query DB. Empty result -> CTA to import CSV.
  const shipments = await getShipmentsByOrg(orgId);
  if (shipments.length === 0) {
    return <SavingsEmptyState />;
  }

  // Real org with real data — for now, render the demo view as a placeholder
  // shape until the real savings analytics queries are built (follow-up).
  // The data hand-off contract is: SavingsDemoView is mock-only; a future
  // SavingsRealView component will accept shipments[] and aggregate.
  return <SavingsDemoView />;
}
