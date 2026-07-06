# Shipping Savior — World-Class Feature Map

Last updated: 2026-06-12 (AI-10777). Synthesized from: full Fireflies transcripts (221 extracted requirements), Blake's real operating workbooks (204 shipments, Weeks 40–48), the 100-issue Linear backlog, docs/AI-AGENTS-PLAN.md, PRODUCT-ROADMAP-DETAILED.md, COMPETITOR-DEEP-DIVE.md, and the 2026-05-31 production-readiness audit.

**Positioning:** the operating system for refrigerated/perishable export — start where Blake's edge is (cold chain, cross-dock, Jones Act lanes), expand to the universal platform. Competitors (project44, FourKites, Flexport) own enterprise visibility; nobody owns the *mid-market reefer exporter's weekly operating board + AI copilot*.

## Tier 0 — Operate Blake's business end-to-end (now → 4 weeks)
The wedge: replace the Excel workbook entirely.

1. ✅ Workbook import + review queue + weekly load board *(shipped/in flight on AI-10777)*
2. **Cutoff alarm rail** — reefer cutoff & doc cutoff countdowns per shipment; email/push when <24h and unmet (pairs with PWA push)
3. **AES filing tracker** — the #1 review-queue gap in real data (64/204 rows); status per shipment (TBD → filed → accepted), CBP ACE deep links
4. **Cross-dock appointment board** — Port Hueneme/ANACAPA/KINGSCO DRAY appointment slots as a calendar lane (the audit's "cross-dock appointment/status queue")
5. **CSV/PDF export of the load board** — ops handoff artifact (audit MVP item)
6. **In-app workbook write-back** — edits in the app export a clean weekly .xlsx so Blake can still hand partners the sheet they expect
7. **Shelf-life calculator** *(agent in flight)* + temperature/vent presets per commodity on shipment records

## Tier 1 — Live visibility (4–10 weeks)
8. **Terminal49 container tracking** (rebuild lost AI-10404): webhook receiver, DCSA-normalized events, container timeline (gate-out → loaded → departed → arrived → available → picked up), ETA-changed alerts. Needs Terminal49 account.
9. **Vessel map** (AI-6538): MapLibre with route arcs + AIS positions (Blake's lanes first)
10. **Notification center**: in-app bell + email digests + PWA/native push (delay, cutoff, customs hold, demurrage risk); per-user alert rules (roadmap F-111)
11. **Demurrage/detention risk meter** per container (free-time clock from arrival event)
12. **Jones Act lane support** (transcript item missing from summaries): Matson/Pasha schedules, "domestic — no customs" flagging, AK/HI/PR lanes

## Tier 2 — Documents & compliance moat (8–16 weeks)
13. **Multi-document OCR**: beyond BOL — commercial invoice, packing list, ISF 10+2, certificate of origin, phytosanitary, FDA Prior Notice (roadmap F-105/F-205); cross-document validation (invoice vs BOL mismatch flags)
14. **Compliance screening agent**: OFAC SDN fuzzy match, Section 301/UFLPA flags, HTS→agency requirement mapping, per-shipment document checklist (AI-AGENTS Agent 3)
15. **Customs-broker handoff package**: validated doc set → ZIP + cover sheet + time-limited share link
16. **Contract IQ v2**: rate sheet → lanes (shipped) + booking-on-tariff detection emails (AI-6535), contract expiry alarms, blended savings report

## Tier 3 — Intelligence & revenue expansion (3–6 months)
17. **AI right-hand assistant** (rebuild lost AI-10401): chat-first route planning over live org data, confirmed write-actions, watch rules
18. **Rate intelligence**: FBX benchmark ingest, lane rate trend, counter-offer recommendations + negotiation scripts (Agent 1), backhaul finder (Agent 6 — Blake: "30–50% below market")
19. **FTZ optimizer agent** (Agent 2): PF/NPF election, inverted tariff detection, 5-yr NPV — upgrade existing calculator with AI narrative
20. **HTS classification agent** (F-201): description → ranked codes with GRI reasoning + confidence; feedback loop
21. **Predictive ETA + delay risk ML** once event history accumulates
22. **Customer read-only portal** (NVOCC/white-label — the 10,000-NVOCC TAM from the pitch): tracked-shipment portal per customer code (Blake's single-letter customers N/K/C/H/J become portal tenants)

## Tier 4 — Enterprise & platform (6–12 months)
23. SSO (SAML/OIDC), SCIM provisioning, enterprise RBAC + audit log UI
24. Public API + API keys + webhooks out (customers' TMS integrations)
25. EDI bridges (EDIFACT IFTSTA/COPARN) for carrier/forwarder interop
26. Multi-org/white-label theming; usage-based billing tier (credits — Julian's transcript idea)
27. SOC 2 Type II program (encrypted docs at rest already; needs policies + evidence automation)

## Mobile/native specifics (from this session's Capacitor base)
- Push notifications (cutoffs, delays) — also the App Store Guideline 4.2 strengthener
- Camera → BOL OCR capture; offline load-board cache (SW already scaffolded); FaceID unlock

## Data/ops debt to clear (from audits)
- DB-level unique index on (org_id, reference, container_number); Sentry events for intake failures; OpenRouter fallback envs; Stripe envs + webhook (AI-9859); Anthropic credits (AI-8506); apply migration 0004 to prod (backup first); RLS posture decision on Supabase
