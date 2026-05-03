/**
 * /platform/scenarios/[id] — load a demo scenario into the dashboard.
 *
 * Linear: AI-8727
 *
 * Replaces the broken /dashboard?scenario=... links from the public /demo page.
 * - If the id matches a demoScenarios entry, redirect to
 *   /platform/dashboard?scenario=<id>&tour=true so ScenarioBanner pre-loads
 *   the lane data and GuidedTour activates.
 * - If the id is unknown, fall through to /platform/dashboard with no params.
 *
 * Auth is handled by the (platform) layout — unauthenticated users get bounced
 * to /login by that layout's `auth()` check before they reach the dashboard.
 * Per the public-demo flow, we want to land in the platform area regardless of
 * auth state; the layout will redirect to login when needed and the same
 * scenario querystring should be preserved by the login flow's callbackUrl.
 */

import { redirect } from "next/navigation";
import { getScenarioById } from "@/lib/data/demo-scenarios";

export const dynamic = "force-dynamic";

export default function ScenarioLoaderPage({
  params,
}: {
  params: { id: string };
}) {
  const scenario = getScenarioById(params.id);
  if (!scenario) {
    redirect("/platform/dashboard");
  }
  redirect(`/platform/dashboard?scenario=${encodeURIComponent(scenario.id)}&tour=true`);
}
