"use client";

import { useState, useCallback, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { trackEvent } from "@/lib/analytics/posthog-client";

// Lazy load the modal — it pulls in @calcom/embed-react which isn't needed until the user clicks.
const CalEmbedModal = dynamic(() => import("./CalEmbedModal"), { ssr: false });

interface ScheduleDemoButtonProps {
  className?: string;
  children: ReactNode;
  /** Optional Cal link override; otherwise NEXT_PUBLIC_CAL_LINK or the default is used. */
  calLink?: string;
  /** Optional title for the modal header. */
  modalTitle?: string;
  /** Source label for analytics (e.g. "homepage_hero_cta"). */
  source?: string;
}

/**
 * Button that opens the Cal.com booking modal. Drop-in replacement for any
 * "Schedule Demo" / "Book a Demo" anchor across the site.
 */
export default function ScheduleDemoButton({
  className,
  children,
  calLink,
  modalTitle,
  source,
}: ScheduleDemoButtonProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
    // Stub event — actual PostHog send happens only if consent given + key set.
    trackEvent("demo_booked", { stage: "modal_opened", source: source || null });
  }, [source]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={className}
      >
        {children}
      </button>
      {open && (
        <CalEmbedModal
          open={open}
          onClose={() => setOpen(false)}
          calLink={calLink}
          title={modalTitle}
        />
      )}
    </>
  );
}
