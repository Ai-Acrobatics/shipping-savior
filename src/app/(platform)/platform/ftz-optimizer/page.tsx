import type { Metadata } from "next";
import { Warehouse } from "lucide-react";
import FTZOptimizerAgent from "@/components/platform/FTZOptimizerAgent";

export const metadata: Metadata = {
  title: "FTZ Optimizer Agent",
  description:
    "Detect inverted tariffs, choose between Privileged and Non-Privileged Foreign status, and see whether a Foreign Trade Zone pays for itself over five years.",
};

export default function FtzOptimizerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 shrink-0 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center">
          <Warehouse className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">FTZ Optimizer Agent</h1>
          <p className="text-navy-500 text-sm mt-0.5">
            Find the inverted tariff, make the PF/NPF election, and check the zone actually pays
            for itself over five years.
          </p>
        </div>
      </div>

      <FTZOptimizerAgent />
    </div>
  );
}
