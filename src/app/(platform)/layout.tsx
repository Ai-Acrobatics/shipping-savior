import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import PlatformShell from "./PlatformShell";
import GuidedTour from "@/components/demo/GuidedTour";
import { getOrgPlan } from "@/lib/billing/limits";

export const metadata = {
  title: "Platform | Shipping Savior",
  description: "Shipping Savior logistics platform — calculators, analytics, and trade optimization.",
};

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    name: session.user.name ?? 'User',
    email: session.user.email ?? '',
    image: session.user.image ?? null,
  };

  // Org plan tier for the sidebar badge (AI-8778). Falls back to 'free' on missing org.
  const planTier = session.user.orgId ? await getOrgPlan(session.user.orgId) : 'free';

  return (
    <PlatformShell user={user} planTier={planTier}>
      {children}
      {/* AI-6542 — guided investor walkthrough; mounts itself only when ?tour=true */}
      <Suspense fallback={null}>
        <GuidedTour />
      </Suspense>
    </PlatformShell>
  );
}
