// ============================================================
// Multi-modal route markers (AI-12015) — public surface
//
// Pure: data, derivations and filtering. The API route owns HTTP, the
// component owns rendering, and neither owns a routing decision.
// ============================================================

export * from "./types";
export { ROUTE_NODES, getNode, getNodesByKind, getInlandDestinations } from "./nodes";
export { INTERMODAL_ROUTES, getIntermodalRoute } from "./routes";
export {
  routeTotals,
  validateRoute,
  interchangeDwellDays,
  worstCaseStorage,
  modeSequence,
  routeOrigin,
  routeDestination,
  routeNodeCodes,
  legTransit,
  MODE_LABELS,
  MODE_SHORT,
} from "./totals";
export {
  filterIntermodalRoutes,
  rankIntermodalRoutes,
  intermodalDestinations,
  intermodalOrigins,
  type IntermodalQuery,
  type RankedRoute,
  type SortKey,
} from "./query";
