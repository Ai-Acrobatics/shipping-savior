import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Suspense } from "react";
import PlatformShell from "./PlatformShell";
import GuidedTour from "@/components/demo/GuidedTour";
import { getOrgPlan } from "@/lib/billing/limits";

export const metadata = {
  title: "Platform | Shipping Savior",
  description: "Shipping Savior logistics platform — calculators, analytics, and trade optimization.",
};

/**
 * Validate a candidate callbackUrl is a same-origin relative path.
 * Rejects protocol-relative URLs (`//evil.com`), absolute URLs, and anything
 * that does not start with a single forward slash. Open-redirect protection
 * (AI-9199).
 */
function safeCallbackUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith('/')) return null;
  if (raw.startsWith('//')) return null;
  if (raw.startsWith('/\\')) return null;
  return raw;
}

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    // Defense-in-depth: middleware should have already redirected unauth
    // users with a callbackUrl. If the layout still runs (e.g. middleware
    // matcher gap or direct invocation), preserve the original path via the
    // x-pathname header set by middleware (AI-9199).
    const h = headers();
    const pathname = safeCallbackUrl(h.get('x-pathname'));
    const target = pathname
      ? `/login?callbackUrl=${encodeURIComponent(pathname)}`
      : '/login';
    redirect(target);
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
