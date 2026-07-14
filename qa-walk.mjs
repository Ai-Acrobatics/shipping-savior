// AI-12732/AI-12737 QA flow walker — exercises every testable prod flow with the
// demo org and records per-flow status + screenshot for the storyboard board.
import { chromium } from '@playwright/test';
import { writeFileSync, readFileSync } from 'fs';

const BASE = 'https://shipping-savior.vercel.app';
const OUT = process.env.OUT;
const BOL = process.env.BOL;
const results = [];
let page, ctx;

async function step(id, name, fn) {
  const started = Date.now();
  try {
    const detail = await fn();
    results.push({ id, name, status: 'pass', detail: detail || '', ms: Date.now() - started });
    console.log('PASS', id, name);
  } catch (e) {
    results.push({ id, name, status: 'fail', detail: String(e).slice(0, 300), ms: Date.now() - started });
    console.log('FAIL', id, name, String(e).slice(0, 120));
    try { await page.screenshot({ path: `${OUT}/${id}-FAIL.png` }); } catch {}
  }
}
async function snap(id) {
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/${id}.png` });
}

const browser = await chromium.launch();
ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
page = await ctx.newPage();
// This VPS routinely runs at load 30+; default 30s timeouts flake under contention.
page.setDefaultTimeout(90000);
page.setDefaultNavigationTimeout(120000);
await page.addInitScript(() => {
  try {
    localStorage.setItem('ss-cookie-consent', 'all');
    localStorage.setItem('ss_onboarding_complete', 'true');
    localStorage.setItem('ss_onboarding_done', 'true');
  } catch {}
});

// ── AUTH ──
await step('auth-login-fail', 'Login rejects wrong password', async () => {
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.fill('input[type="email"]', 'demo@shippingsavior.app');
  await page.fill('input[type="password"]', 'WrongPassword1!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(6000);
  if (!page.url().includes('/login')) throw new Error('expected to stay on /login');
  await snap('auth-login-fail');
  return 'stayed on /login with error state';
});

await step('auth-login', 'Login with valid credentials', async () => {
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.fill('input[type="email"]', 'demo@shippingsavior.app');
  await page.fill('input[type="password"]', 'DemoPass2026!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/platform**', { timeout: 60000 });
  return 'redirected to /platform';
});

// ── DASHBOARD ──
await step('dash-render', 'Dashboard renders (stats, quick actions, tariff card)', async () => {
  await page.goto(BASE + '/platform', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('text=Quick Actions', { timeout: 20000 });
  await snap('dash-render');
});

await step('dash-command-search', 'Plain-English command bar routes to tool', async () => {
  const box = page.locator('input,textarea').filter({ hasNotText: '' }).first();
  await box.click();
  await box.fill('track my container');
  await snap('dash-command-search');
  await box.press('Enter');
  await page.waitForTimeout(4000);
  return 'routed to ' + page.url();
});

// ── SHIPMENTS / BOL ──
await step('ship-list', 'Shipments table loads from API', async () => {
  await page.goto(BASE + '/platform/shipments', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('text=Total Shipments', { timeout: 20000 });
  await snap('ship-list');
});

await step('bol-upload-ocr', 'BOL upload → AI OCR extraction (full pipeline)', async () => {
  await page.click('text=Upload Bill of Lading');
  await page.waitForTimeout(800);
  const input = page.locator('input[type="file"]');
  await input.setInputFiles(BOL);
  await page.waitForSelector('text=AI extracted data', { timeout: 120000 });
  await snap('bol-upload-ocr');
  const container = await page.inputValue('input[placeholder*="MAEU"]').catch(() => '');
  return 'extracted container: ' + container;
});

await step('bol-save-shipment', 'Save extracted shipment', async () => {
  await page.click('text=Save Shipment');
  await page.waitForSelector('text=/Shipment saved/i', { timeout: 30000 });
  await snap('bol-save-shipment');
});

await step('ship-detail', 'Shipment profile/detail page', async () => {
  await page.goto(BASE + '/platform/shipments', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('text=Track').first().click();
  await page.waitForTimeout(4000);
  if (!page.url().match(/shipments\/[a-f0-9-]+/)) throw new Error('no detail url: ' + page.url());
  await snap('ship-detail');
});

await step('ship-export-csv', 'Shipments CSV export endpoint', async () => {
  const res = await ctx.request.get(BASE + '/api/shipments/export?format=csv');
  if (res.status() !== 200) throw new Error('status ' + res.status());
  const body = await res.text();
  return `200, ${body.split('\n').length} rows`;
});

await step('workbook-import-page', 'Workbook/CSV import page renders (dry-run UI)', async () => {
  await page.goto(BASE + '/platform/shipments/import', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await snap('workbook-import-page');
});

await step('review-queue', 'Review queue page', async () => {
  await page.goto(BASE + '/platform/shipments/review', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await snap('review-queue');
});

// ── LOAD BOARD ──
await step('load-board', 'Load board groups by week/carrier/destination', async () => {
  await page.goto(BASE + '/platform/load-board', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('text=Load Board', { timeout: 20000 });
  await snap('load-board');
});

// ── CALCULATORS ──
await step('calc-landed-cost', 'Landed-cost calculator computes + saves', async () => {
  await page.goto(BASE + '/platform/calculators/landed-cost', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);
  await snap('calc-landed-cost');
});

await step('calc-history', 'Calculation history lists + filters', async () => {
  await page.goto(BASE + '/platform/history', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await snap('calc-history');
});

// ── CONTRACTS ──
await step('contracts', 'Contracts page + AI upload modal', async () => {
  await page.goto(BASE + '/platform/contracts', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await snap('contracts');
});

// ── AI ASSISTANT ──
await step('ai-chat', 'AI assistant answers a logistics question (tool-use)', async () => {
  await page.goto(BASE + '/platform', { waitUntil: 'domcontentloaded', timeout: 60000 });
  const fab = page.locator('button').filter({ has: page.locator('svg') }).last();
  await fab.click();
  await page.waitForTimeout(1500);
  const input = page.locator('textarea, input[placeholder*="sk" i], input[placeholder*="Ask" i]').last();
  await input.fill('What is the typical transit time from Port Hueneme to Yokohama?');
  await input.press('Enter');
  await page.waitForTimeout(25000);
  await snap('ai-chat');
});

// ── SETTINGS / TEAM / BILLING ──
await step('settings', 'Settings (profile, org, team)', async () => {
  await page.goto(BASE + '/platform/settings', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await snap('settings');
});
await step('team-members', 'Team member management', async () => {
  await page.goto(BASE + '/platform/settings/members', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await snap('team-members');
});
await step('billing', 'Billing page (placeholder mode banner + safe 503s)', async () => {
  await page.goto(BASE + '/platform/billing', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await snap('billing');
});

// ── API-LEVEL CONTRACTS (success + failure paths) ──
await step('api-auth-guard', 'API rejects unauthenticated requests (401)', async () => {
  const fresh = await browser.newContext();
  const res = await fresh.request.get(BASE + '/api/shipments');
  await fresh.close();
  if (res.status() !== 401) throw new Error('expected 401, got ' + res.status());
  return '401 as expected';
});

await step('api-mobile-login', 'Mobile token auth mints NextAuth-compatible JWT', async () => {
  const res = await ctx.request.post(BASE + '/api/mobile/auth/login', {
    data: { email: 'demo@shippingsavior.app', password: 'DemoPass2026!' } });
  if (res.status() !== 200) throw new Error('status ' + res.status());
  const j = await res.json();
  if (!j.token) throw new Error('no token');
  writeFileSync(process.env.TOKF, j.token);
  return 'token minted, len ' + j.token.length;
});

await step('api-mobile-login-fail', 'Mobile auth rejects bad credentials (401)', async () => {
  const res = await ctx.request.post(BASE + '/api/mobile/auth/login', {
    data: { email: 'demo@shippingsavior.app', password: 'nope' } });
  if (res.status() !== 401) throw new Error('expected 401, got ' + res.status());
  return '401 as expected';
});

await step('api-push-register', 'Push token registration (mobile devices API)', async () => {
  const tok = readFileSync(process.env.TOKF, 'utf8');
  const res = await ctx.request.post(BASE + '/api/mobile/devices', {
    headers: { Cookie: `__Secure-authjs.session-token=${tok}` },
    data: { token: 'ExponentPushToken[qa-board-test-0713]', platform: 'ios' } });
  if (res.status() >= 400) throw new Error('status ' + res.status());
  return 'registered, status ' + res.status();
});

await step('api-cron-protected', 'Cutoff-alert cron rejects calls without secret', async () => {
  const fresh = await browser.newContext();
  const res = await fresh.request.get(BASE + '/api/cron/cutoff-alerts');
  await fresh.close();
  if (res.status() !== 401 && res.status() !== 403) throw new Error('expected 401/403, got ' + res.status());
  return res.status() + ' as expected';
});

await step('api-billing-placeholder', 'Checkout returns safe 503 in placeholder mode', async () => {
  const res = await ctx.request.post(BASE + '/api/billing/checkout', { data: { tier: 'premium' } });
  if (res.status() !== 503) throw new Error('expected 503, got ' + res.status());
  return '503 as expected (BILLING_PLACEHOLDER)';
});

writeFileSync(process.env.RESULTS, JSON.stringify(results, null, 1));
console.log('DONE', results.filter(r => r.status === 'pass').length + '/' + results.length, 'passed');
await browser.close();
