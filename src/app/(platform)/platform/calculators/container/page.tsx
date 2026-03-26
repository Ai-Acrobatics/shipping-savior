"use client";

import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ContainerUtilCalculator from "@/components/ContainerUtilCalculator";

function ContainerContent() {
  return <ContainerUtilCalculator showSaveButton />;
}

export default function ContainerUtilizationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/platform/calculators"
          className="p-2 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Container Utilization</h1>
          <p className="text-navy-500 text-sm mt-0.5">
            Optimize container loading patterns and maximize space utilization.
          </p>
        </div>
      </div>

      <div className="bg-white border border-navy-200 rounded-xl p-6">
        <Suspense fallback={<div className="animate-pulse h-64 bg-navy-50 rounded-lg" />}>
          <ContainerContent />
        </Suspense>
      </div>
    </div>
  );
}
