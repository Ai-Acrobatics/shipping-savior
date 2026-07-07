/**
 * Terminal49 + DCSA Container Tracking
 *
 * AI-12010: Exports for the Terminal49 live container tracking integration.
 *
 * Modules:
 *   - normalize: Maps Terminal49 webhook events → DCSA normalized format
 *   - handler:   Processes inbound webhooks end-to-end
 *   - queries:   DB queries for Terminal49 webhooks, shipment events, and ETA alerts
 *   - alerts:    ETA change detection and alert creation
 */

export * from "./normalize";
export * from "./handler";
export * from "./queries";
export * from "./alerts";
