import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import PlatformShell from "./PlatformShell";
import GuidedTour from "@/components/demo/GuidedTour";

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

  return (
    <PlatformShell user={user}>
      {children}
      {/* AI-6542 — guided investor walkthrough; mounts itself only when ?tour=true */}
      <Suspense fallback={null}>
        <GuidedTour />
      </Suspense>
    </PlatformShell>
  );
}
