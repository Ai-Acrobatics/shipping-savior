"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { CalculatorType } from "@/lib/types/calculations";

export function useLoadCalculation(calculatorType: CalculatorType) {
  const searchParams = useSearchParams();
  const [loadedInputs, setLoadedInputs] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadId = searchParams.get("loadId");
    if (!loadId) return;

    setIsLoading(true);
    fetch(`/api/calculations/${loadId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        if (data.calculation.calculatorType !== calculatorType) {
          console.warn("Calculator type mismatch — expected", calculatorType, "got", data.calculation.calculatorType);
          return;
        }
        setLoadedInputs(data.calculation.inputs as Record<string, unknown>);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [searchParams, calculatorType]);

  return { loadedInputs, isLoading };
}
