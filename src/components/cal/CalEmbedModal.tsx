"use client";

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";

// TODO: Julian — set NEXT_PUBLIC_CAL_LINK in Vercel env once /julian-bradley/shipping-savior-demo
// event type exists on cal.com. Default below is the conventional path.
const DEFAULT_CAL_LINK = "julian-bradley/shipping-savior-demo";

interface CalEmbedModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * Optional override for the Cal link path (e.g. "team-handle/event-slug").
   * Falls back to NEXT_PUBLIC_CAL_LINK env var, then to the default.
   */
  calLink?: string;
  /** Title shown above the embed. */
  title?: string;
}

/**
 * Modal wrapper that embeds a Cal.com booking flow. Pre-fills name + email
 * from the authenticated next-auth session when available.
 *
 * Cal.com docs: https://cal.com/docs/embed
 */
export default function CalEmbedModal({
  open,
  onClose,
  calLink,
  title = "Schedule a Demo",
}: CalEmbedModalProps) {
  const { data: session } = useSession();
  const link =
    calLink ||
    process.env.NEXT_PUBLIC_CAL_LINK ||
    DEFAULT_CAL_LINK;

  // Initialize Cal namespace once per mount (recommended pattern).
  useEffect(() => {
    if (!open) return;
    (async () => {
      const cal = await getCalApi({ namespace: "shipping-savior-demo" });
      cal("ui", {
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, [open]);

  // Esc to close + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const prefill: Record<string, string> = {};
  if (session?.user?.name) prefill.name = session.user.name;
  if (session?.user?.email) prefill.email = session.user.email;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="relative w-full max-w-5xl h-[85vh] rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100 bg-white">
          <h2 className="text-lg font-semibold text-navy-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-navy-500 hover:text-navy-900 hover:bg-navy-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="h-[calc(85vh-64px)] overflow-auto">
          <Cal
            namespace="shipping-savior-demo"
            calLink={link}
            style={{ width: "100%", height: "100%", overflow: "scroll" }}
            config={{
              layout: "month_view",
              ...prefill,
            }}
          />
        </div>
      </div>
    </div>
  );
}
