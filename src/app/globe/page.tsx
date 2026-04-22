"use client";

import { GlobeFlights } from "@/components/ui/cobe-globe-flights";

export default function GlobeFlightsDemoPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-white p-8">
      <div className="w-full max-w-lg">
        <GlobeFlights />
      </div>
    </div>
  );
}
