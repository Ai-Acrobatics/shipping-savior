// Dashboard demo data — re-export shim.
//
// As of AI-8779, the canonical mock/demo data lives in `./demo-data.ts`.
// This file is preserved as a backwards-compatible alias so existing
// imports (`@/lib/data/dashboard`) keep working while new code can opt
// into the explicit `@/lib/data/demo-data` path.
//
// Do not add new exports here. Add them to demo-data.ts.

export * from "./demo-data";
