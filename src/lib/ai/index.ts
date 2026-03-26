// ============================================================
// AI Agent Layer — Public Exports
// Sprint 4: AI Agent Layer
// ============================================================

export { classifyProduct } from "./tariff-classifier";
export type {
  ClassificationInput,
  ClassificationResult,
  ClassificationPrediction,
} from "./tariff-classifier";

export { checkCompliance } from "./compliance-monitor";
export type {
  ComplianceCheck,
  ComplianceResult,
  ComplianceAlert,
} from "./compliance-monitor";

export { optimizeRoute } from "./route-optimizer";
export type {
  RouteOptimizationInput,
  RouteRecommendation,
  RouteOption,
} from "./route-optimizer";

export { predictCost } from "./cost-predictor";
export type {
  CostPredictionInput,
  CostPredictionResult,
  RiskFactor,
} from "./cost-predictor";

export { analyzeFTZStrategy } from "./ftz-strategy";
export type {
  FTZStrategyInput,
  FTZStrategyResult,
  WithdrawalScenario,
  FTZZoneRecommendation,
} from "./ftz-strategy";

export {
  checkRateLimit,
  getUsageSummary,
} from "./client";
