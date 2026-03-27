import { Suspense } from "react";
import type { Metadata } from "next";
import FTZAnalyzerPage from "./FTZAnalyzerPage";

export const metadata: Metadata = {
  title: "FTZ Analyzer + Tariff Scenarios | Shipping Savior",
  description:
    "Full FTZ savings modeler with tariff scenario analysis, HTS code lookup, and multi-scenario comparison. Lock duty rates, model incremental withdrawals, and run what-if tariff scenarios.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="animate-pulse h-screen bg-navy-50" />}>
      <FTZAnalyzerPage />
    </Suspense>
  );
}
