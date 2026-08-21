import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import ComplianceScreeningAgent from "@/components/platform/ComplianceScreeningAgent";

export const metadata: Metadata = {
  title: "Compliance Screening Agent",
  description:
    "Screen a shipment before it sails: denied parties, sanctioned jurisdictions, Section 301, UFLPA forced-labour risk, and which federal agency owns the entry.",
};

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 shrink-0 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Compliance Screening Agent</h1>
          <p className="text-navy-500 text-sm mt-0.5">
            Catch the denied party, the forced-labour nexus and the missing agency filing while the
            container is still on the wrong side of the ocean.
          </p>
        </div>
      </div>

      <ComplianceScreeningAgent />
    </div>
  );
}
