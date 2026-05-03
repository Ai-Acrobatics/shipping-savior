import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CheckCircle2, AlertTriangle, CreditCard } from "lucide-react";
import BillingActions from "./BillingActions";

/**
 * /platform/billing (AI-8777)
 *
 * Server component that shows the org's current billing state and renders the
 * client-side action button for portal/upgrade.
 */
export const metadata = {
  title: "Billing | Shipping Savior",
};

export const dynamic = "force-dynamic";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  premium: "Premium",
  enterprise: "Enterprise",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  trialing: "In trial",
  past_due: "Past due",
  canceled: "Canceled",
  incomplete: "Incomplete",
  incomplete_expired: "Expired",
  unpaid: "Unpaid",
  paused: "Paused",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { success?: string; session_id?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orgId = session.user.orgId;
  if (!orgId) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Billing</h1>
        <p className="text-navy-400">
          No organization is associated with your account. Contact support.
        </p>
      </div>
    );
  }

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!org) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Billing</h1>
        <p className="text-navy-400">Organization not found.</p>
      </div>
    );
  }

  const planTier = org.planTier ?? "free";
  const planLabel = PLAN_LABELS[planTier] ?? planTier;
  const statusLabel = org.subscriptionStatus
    ? STATUS_LABELS[org.subscriptionStatus] ?? org.subscriptionStatus
    : null;
  const periodEnd = org.currentPeriodEnd
    ? new Date(org.currentPeriodEnd).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const hasActiveSubscription =
    !!org.stripeSubscriptionId &&
    (org.subscriptionStatus === "active" || org.subscriptionStatus === "trialing");

  const justSucceeded = searchParams?.success === "1";

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white">Billing</h1>
        <p className="text-navy-400 mt-1">
          Manage your Shipping Savior subscription.
        </p>
      </header>

      {justSucceeded && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-300">
              Subscription started.
            </p>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Your plan will reflect the new tier as soon as Stripe sends the
              confirmation webhook (usually a few seconds).
            </p>
          </div>
        </div>
      )}

      {/* Current plan card */}
      <div className="rounded-2xl border border-navy-800 bg-[#0d1230]/80 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-ocean-500/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-ocean-400" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-navy-500 font-semibold">
              Current plan
            </p>
            <p className="text-xl font-bold text-white">{planLabel}</p>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <dt className="text-xs uppercase tracking-wider text-navy-500 mb-0.5">
              Status
            </dt>
            <dd className="text-sm text-white">
              {statusLabel ?? <span className="text-navy-400">No subscription</span>}
              {org.subscriptionStatus === "past_due" && (
                <AlertTriangle className="w-4 h-4 text-amber-400 inline-block ml-2 align-text-bottom" />
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-navy-500 mb-0.5">
              {org.subscriptionStatus === "canceled" ? "Ended" : "Renews"}
            </dt>
            <dd className="text-sm text-white">
              {periodEnd ?? <span className="text-navy-400">—</span>}
            </dd>
          </div>
        </dl>

        <BillingActions
          hasActiveSubscription={hasActiveSubscription}
          premiumPriceId={process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? ""}
        />
      </div>

      {/* Plan reference card */}
      <div className="rounded-2xl border border-navy-800 bg-[#0d1230]/40 p-6">
        <h2 className="text-sm font-semibold text-navy-200 mb-2">Need to compare plans?</h2>
        <p className="text-sm text-navy-400 mb-3">
          See the full feature breakdown on the public pricing page.
        </p>
        <a
          href="/pricing"
          className="text-sm text-ocean-400 hover:text-ocean-300 font-semibold inline-flex items-center gap-1.5"
        >
          View pricing →
        </a>
      </div>
    </div>
  );
}
