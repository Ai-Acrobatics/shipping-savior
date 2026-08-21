import type { Metadata } from "next";
import { FileStack } from "lucide-react";
import TradeDocumentOcr from "@/components/platform/TradeDocumentOcr";

export const metadata: Metadata = {
  title: "Trade Documents",
  description:
    "OCR and compliance-check the full export document set — commercial invoice, packing list, ISF, certificate of origin, phytosanitary certificate and FDA Prior Notice.",
};

export default function TradeDocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 shrink-0 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center">
          <FileStack className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Trade Documents</h1>
          <p className="text-navy-500 text-sm mt-0.5">
            Read every document in the paperwork set, check each one against the rules that
            govern it, and reconcile the set before anything is filed.
          </p>
        </div>
      </div>

      <TradeDocumentOcr />
    </div>
  );
}
