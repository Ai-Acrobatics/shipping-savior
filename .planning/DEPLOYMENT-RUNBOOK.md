# Shipping Savior Deployment Runbook (AI-9199)

This document captures the post-Wave-2 Vercel environment configuration for `shipping-savior` and outlines what Julian still has to set up manually before the May 11 investor pitch.

Production URL: https://shipping-savior.vercel.app
Vercel project: `ai-acrobatics/shipping-savior`
Linear: AI-9199

---

## 1. Env vars set via this PR

All set across `production`, `preview`, and `development` unless otherwise noted.

| Variable | Source | Notes |
|---|---|---|
| `RESEND_API_KEY` | 1Password: `RESEND-global` (field `credential`) | Global Resend API key — works for all projects |
| `EMAIL_FROM` | literal | `Shipping Savior <onboarding@resend.dev>` — Resend's default fallback sender. Swap to `noreply@<verified-domain>` once a domain is verified in Resend. |
| `NEXT_PUBLIC_APP_URL` | literal | `https://shipping-savior.vercel.app` |
| `AUTH_URL` (preview + development only) | literal | `https://shipping-savior.vercel.app`. Production already had a value (set 37d ago) — left untouched. |
| `NEXT_PUBLIC_INVESTOR_BUILD` | literal | `true` — gates investor-only UI flags for the May 11 pitch (AI-8745). Flip to `false` post-pitch if needed. |
| `REQUIRE_EMAIL_VERIFICATION` | literal | `false` — soft-launch default. Flip to `true` once Resend sender is verified and the verify-email flow is QA'd end-to-end. |

### Pre-existing env vars (not modified)

These were already present in Vercel and were left alone:

- `ANTHROPIC_API_KEY` (production, preview)
- `KIMI_API_KEY`, `GEMINI_API_KEY` (all envs)
- `DATABASE_URL`, `DIRECT_DATABASE_URL` (all envs / production)
- `AUTH_SECRET`, `AUTH_URL` (production)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (production)

### Known data hygiene issue (out of scope for this PR)

Production `AUTH_URL` was stored as `"https://shipping-savior.vercel.app\n"` (trailing literal `\n`). This may or may not break NextAuth callback URL construction — flag for Julian to manually re-set if auth callbacks 404. Command:

```bash
VERCEL_TOKEN=$(op item get "VERCEL-API-Token" --fields credential --vault "API-Keys" --reveal)
npx vercel env rm AUTH_URL production --token "$VERCEL_TOKEN" --yes
echo -n "https://shipping-savior.vercel.app" | npx vercel env add AUTH_URL production --token "$VERCEL_TOKEN"
```

---

## 2. Env vars Julian MUST add manually (Stripe — AI-8777)

These cannot be populated automatically because the Stripe account / products / webhook do not exist yet.

| Variable | Source | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard > Developers > API keys | `sk_live_...` for production, `sk_test_...` for preview/dev |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard > Developers > Webhooks > [endpoint] > Signing secret | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard > Developers > API keys | `pk_live_...` / `pk_test_...` — safe to expose in browser |
| `STRIPE_PRICE_PREMIUM_MONTHLY` | Stripe Dashboard > Products > Premium > Pricing | `price_...` |
| `STRIPE_PRICE_ENTERPRISE_MONTHLY` | Stripe Dashboard > Products > Enterprise > Pricing | `price_...` |

### Stripe dashboard setup checklist

1. Create (or pick) a Stripe account.
2. Create Products:
   - **Premium** — $499/mo recurring (USD).
   - **Enterprise** — TBD/mo recurring (placeholder; confirm pricing with Julian).
3. Copy each Product's Price ID into the env vars above.
4. Add a webhook endpoint pointing at: `https://shipping-savior.vercel.app/api/billing/webhook`
5. Subscribe the webhook to these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
6. Copy the webhook's signing secret into `STRIPE_WEBHOOK_SECRET`.
7. Trigger a Vercel redeploy after all 5 vars are set.

---

## 3. OAuth credentials — Julian action required

### Google OAuth

**Status: NOT set in Vercel.** All `GOOGLE_OAUTH_CLIENT-*` items in 1Password are **desktop "installed" type** clients with `redirect_uris: ["http://localhost"]`. NextAuth needs a **Web application** OAuth client with redirect URI `https://shipping-savior.vercel.app/api/auth/callback/google`. They cannot be reused as-is.

**To fix:**
1. Open Google Cloud Console > APIs & Services > Credentials.
2. EITHER:
   - **Option A** (recommended — clean separation): Create a new OAuth 2.0 Client ID, application type **Web application**, name "Shipping Savior", with authorized redirect URI `https://shipping-savior.vercel.app/api/auth/callback/google` (and `http://localhost:3000/api/auth/callback/google` for dev).
   - **Option B**: Edit an existing Web client to add the redirect URI above. (None of the current 1P entries are Web clients, so this requires picking a project and editing in console.)
3. Save the new credential to 1Password as `GOOGLE_OAUTH_CLIENT-shipping-savior` (or similar).
4. Set in Vercel:
   ```bash
   VERCEL_TOKEN=$(op item get "VERCEL-API-Token" --fields credential --vault "API-Keys" --reveal)
   for ENV in production preview development; do
     echo -n "<client_id>.apps.googleusercontent.com" | npx vercel env add GOOGLE_CLIENT_ID $ENV --token "$VERCEL_TOKEN"
     echo -n "GOCSPX-..." | npx vercel env add GOOGLE_CLIENT_SECRET $ENV --token "$VERCEL_TOKEN"
   done
   ```

### GitHub OAuth

**Status: NOT set in Vercel.** The `github API Credentials for claude` 1P item is a **Personal Access Token** (`ghp_...`), not an OAuth App. NextAuth needs an OAuth App with client ID + secret.

**To fix:**
1. Open https://github.com/settings/developers > OAuth Apps > **New OAuth App**.
2. Name: "Shipping Savior"
3. Homepage URL: `https://shipping-savior.vercel.app`
4. Authorization callback URL: `https://shipping-savior.vercel.app/api/auth/callback/github`
5. Register the app, then **Generate a new client secret**.
6. Save as 1P item `GITHUB_OAUTH-shipping-savior` (or similar).
7. Set in Vercel:
   ```bash
   VERCEL_TOKEN=$(op item get "VERCEL-API-Token" --fields credential --vault "API-Keys" --reveal)
   for ENV in production preview development; do
     echo -n "<client_id>" | npx vercel env add GITHUB_CLIENT_ID $ENV --token "$VERCEL_TOKEN"
     echo -n "<client_secret>" | npx vercel env add GITHUB_CLIENT_SECRET $ENV --token "$VERCEL_TOKEN"
   done
   ```

---

## 4. Database migration

If W14 has not already applied migrations to the production Neon database, run:

```bash
DATABASE_URL=<neon-prod-url> npm run db:migrate
```

Pull `DATABASE_URL` via:
```bash
VERCEL_TOKEN=$(op item get "VERCEL-API-Token" --fields credential --vault "API-Keys" --reveal)
npx vercel env pull --environment=production .env.production --token "$VERCEL_TOKEN"
# DATABASE_URL is now in .env.production — DO NOT COMMIT this file
```

---

## 5. Smoke test sequence (post-deploy)

After all env vars are set and the app has redeployed:

1. **Login page renders OAuth buttons:** https://shipping-savior.vercel.app/login
   - Should show Google + GitHub buttons (after OAuth env vars are set; today they may be hidden or error).
2. **Forgot-password flow sends email:** https://shipping-savior.vercel.app/forgot-password
   - Submit a real email (your own), check that it arrives via Resend.
3. **Verify-email page loads:** https://shipping-savior.vercel.app/verify-email
   - Should render without 500 errors. (No-token state is fine — page should display "check your email" UI.)
4. **Stripe checkout flow** (after Stripe vars set):
   - Trigger from billing UI, complete a test card checkout, confirm webhook fires (Stripe dashboard > Webhooks > Logs).

---

## 6. Triggering a redeploy

Vercel typically redeploys automatically when env vars change for production. If it doesn't:

```bash
VERCEL_TOKEN=$(op item get "VERCEL-API-Token" --fields credential --vault "API-Keys" --reveal)
cd /opt/agency-workspace/shipping-savior
npx vercel deploy --prod --yes --scope ai-acrobatics --token "$VERCEL_TOKEN"
```

---

## 7. Repeat-the-flow helper for future sessions

To re-run env var operations without retyping:

```bash
export VERCEL_TOKEN=$(op item get "VERCEL-API-Token" --fields credential --vault "API-Keys" --reveal)
cd /opt/agency-workspace/shipping-savior
npx vercel env ls --token "$VERCEL_TOKEN"            # list
npx vercel env rm <NAME> <env> --token "$VERCEL_TOKEN" --yes   # remove
echo -n "<value>" | npx vercel env add <NAME> <env> --token "$VERCEL_TOKEN"   # add
npx vercel env pull --environment=production .env.production --token "$VERCEL_TOKEN"   # pull
```

Never commit `.env.local`, `.env.production`, or any file containing real secret values. Vercel's encrypted env storage IS the source of truth.
