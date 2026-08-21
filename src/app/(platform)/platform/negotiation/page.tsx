import type { Metadata } from "next";
import { Handshake } from "lucide-react";
import RateNegotiationAgent from "@/components/platform/RateNegotiationAgent";

export const metadata: Metadata = {
  title: "Rate Negotiation Agent",
  description:
    "Score carrier quotes against FBX market benchmarks and generate counter-offers with a ready-to-send negotiation script.",
};

export default function RateNegotiationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 shrink-0 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center">
          <Handshake className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Rate Negotiation Agent</h1>
          <p className="text-navy-500 text-sm mt-0.5">
            Benchmark a carrier quote against the FBX market index, then get the counter-offer
            ladder and the script to close it.
          </p>
        </div>
      </div>

      <RateNegotiationAgent />
    </div>
  );
}
