// Server component — gates between demo and real-data dashboard based on
// the caller's organization `is_demo` flag.
//
// AI-8779: replaces the always-on hardcoded mock dashboard so that real
// signups land on an empty state with a CTA to import their shipments,
// while demo orgs continue to see the rich seeded experience.

import { auth } from "@/lib/auth";
import { getOrgDemoFlag, getShipmentsByOrg } from "@/lib/db/queries/shipments";
import DashboardDemoView from "./DashboardDemoView";
import DashboardEmptyState from "./DashboardEmptyState";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  // Unauthenticated visitors get the demo so the public-marketing dashboard
  // tour keeps working. Authenticated users get gated below.
  if (!session?.user) {
    return <DashboardDemoView />;
  }

  const orgId = session.user.orgId;
  if (!orgId) {
    return <DashboardEmptyState />;
  }

  const org = await getOrgDemoFlag(orgId);
  if (org?.isDemo) {
    return <DashboardDemoView />;
  }

  const shipments = await getShipmentsByOrg(orgId);
  if (shipments.length === 0) {
    return <DashboardEmptyState />;
  }

  // Real org with imported data — render the demo view as a placeholder
  // until the DB-backed real dashboard view ships in a follow-up. The
  // shipments query result is intentionally not yet rendered here; the
  // schema + query foundation enables that next PR.
  return <DashboardDemoView />;
}
