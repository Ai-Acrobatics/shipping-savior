# Shipping Savior — AI Cost-per-Action & Pricing Model

_Last updated 2026-07-07. Grounded in current model pricing + the app's own
`model_comparison_logs` (every AI call already logs tokens + estimated cost)._

## 1. What actually costs money

Most of the product is **$0 marginal cost** — pure compute over local data:

| User action | AI call? | Marginal cost |
|---|---|---|
| Calculators (landed-cost, shelf-life, all 7) | No | **$0** |
| Port finder / carrier comparison / FTZ analyzer | No (local data) | **$0** |
| Shipments board / load board / review queue | No | **$0** |
| Cutoff alarms (hourly cron + push) | No | **~$0** (push only) |
| Workbook import → structured rows | No (parser) | **$0** |
| **BOL / document scan (OCR)** | **Yes — vision** | see below |
| **AI assistant message (tool-use chat)** | **Yes — tool-use** | see below |

So AI COGS is driven by exactly **two** actions: document scan and the assistant.

## 2. Current model pricing (per 1M tokens)

| Model | Input | Output | Notes |
|---|---|---|---|
| Claude Opus 4.8 | $5.00 | $25.00 | reasoning-heavy only |
| Claude Sonnet 4.6 | $3.00 | $15.00 | **current default in code** |
| Claude Haiku 4.5 | $1.00 | $5.00 | 3× cheaper than Sonnet |
| Gemini 2.5 Pro | $3.50 | $10.50 | current OCR fallback |
| Gemini 2.x Flash | ~$0.10 | ~$0.40 | **not yet used — 30× cheaper** |
| Kimi K2 | $0.15 | $2.50 | current 3rd OCR fallback |

**Prompt caching (Anthropic):** cache **reads ≈ 0.1×** input price; cache
**writes = 1.25×** (5-min) or 2× (1-hr). Reused prefixes (system prompt + tool
definitions) become ~10× cheaper on every turn after the first.

## 3. Cost per action (measured + modeled)

### BOL / document scan — ~1,115 input + 420 output tokens (one real logged call)
| Model | $/scan | vs Sonnet |
|---|---|---|
| Sonnet 4.6 | $0.0096 | 1× |
| Gemini 2.5 Pro (logged actual) | $0.0083 | 0.9× |
| Haiku 4.5 | $0.0032 | **0.33×** |
| Kimi K2 | $0.0012 | 0.13× |
| **Gemini Flash** | **$0.0003** | **0.03× (30× cheaper)** |

### AI assistant message — tool-use, ~7,700 input + 550 output tokens across ~2 API calls (tool call + answer)
| Model | $/msg (no cache) | $/msg (cached system+tools prefix) |
|---|---|---|
| Opus 4.8 | $0.052 | ~$0.026 |
| Sonnet 4.6 (current) | **$0.031** | **~$0.015** |
| Haiku 4.5 | $0.0105 | ~$0.005 |

The assistant is the real cost driver: the ~3K-token system prompt + 8 tool
schemas are re-sent **every turn**, and each user message is ~2 API round-trips.

## 4. Monthly COGS per active Premium user (assume 100 scans + 200 assistant msgs)

| Configuration | ~$/user/mo |
|---|---|
| Today: Sonnet everywhere, no caching | **~$7.20** |
| + prompt caching on chat | ~$4.20 |
| + Flash/Haiku OCR | ~$3.10 |
| + Haiku for routine chat (cached) | **~$1.03** |

**Optimization cuts AI COGS ~7× ($7.20 → $1.03) with no user-visible change**
for the caching piece and minimal quality risk for the OCR/model-routing piece.

## 5. Pricing implications

1. **Non-AI features are free to serve** → put them generously in the Free tier
   (calculators, boards, lookups, cutoff alarms). They drive adoption at ~$0 COGS.
2. **Only scan + assistant cost money.** At optimized ~$1–3/user/mo, a $49–$99
   Premium plan is **95–98% gross margin**.
3. **The risk is the heavy-user tail, not the average.** A power user at
   1,000 scans + 2,000 msgs/mo costs **~$70/mo unoptimized** (which *blows through*
   a $49 flat plan) vs **~$10 optimized**. Two mitigations:
   - **Optimize** (section 6) so the worst case is ~$10, not ~$70.
   - **Meter the two AI actions.** Premium includes e.g. _N scans + M assistant
     messages / month_; soft-cap or overage beyond. Everything else stays unlimited.
4. **Suggested tiers:**
   - **Free** — all calculators/boards/lookups + small AI quota (e.g. 10 scans, 30 msgs). COGS ≈ $0.15.
   - **Premium ($49–79)** — generous quota (e.g. 200 scans, 500 msgs). COGS ≈ $2–4.
   - **Enterprise ($299+ / seat or custom)** — high/unlimited quota + SLA. Price on value, COGS is noise.

## 6. Optimization backlog (ranked by $ impact ÷ risk)

1. **Prompt-cache the chat system prompt + tool definitions** — identical every
   turn, so mark them `cache_control`. ~50% off the assistant, **zero quality
   loss.** Highest value, lowest risk. _(AI-12xxx)_
2. **Cheaper OCR primary** — route scan/contract OCR to **Gemini Flash** (or
   Haiku 4.5) first; keep Sonnet/Gemini-Pro as the low-confidence fallback.
   3–30× off OCR. Validate field accuracy on a labeled sample before flipping.
3. **Tiered chat routing** — a lightweight classifier sends simple lookups
   (duty/HTS/port/one-tool answers) to **Haiku 4.5** and reserves Sonnet/Opus
   for genuine multi-step reasoning. ~3× off the routine majority.
4. **Trim the request** — cap assistant `max_tokens`, summarize old turns, and
   don't resend all 8 tool schemas when the intent is obviously one tool.
5. **Per-user cost telemetry** — the app already logs cost per call in
   `model_comparison_logs`; surface a per-user / per-action dashboard so pricing
   and quota decisions stay grounded in real usage, not this model.

## 7. Guardrail

Every AI call already writes `provider, input_tokens, output_tokens,
estimated_cost_usd, latency_ms, success` to `model_comparison_logs`. Keep that —
it's the source of truth that lets us re-price from actuals instead of estimates.
