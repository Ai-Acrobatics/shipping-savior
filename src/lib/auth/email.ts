import { Resend } from 'resend';

// Lazy singleton — only instantiate when an API key is configured. Calling
// Resend constructor with an empty key would throw at import time and break
// builds in environments where transactional email isn't wired yet.
let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

function getFromAddress(): string {
  // Default to Resend's shared sender for projects that haven't verified a
  // domain yet. Override via EMAIL_FROM once the domain is verified.
  return process.env.EMAIL_FROM || 'ShippingSavior <onboarding@resend.dev>';
}

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(args: SendArgs): Promise<{
  ok: boolean;
  id?: string;
  error?: string;
  skipped?: boolean;
}> {
  const resend = getResend();
  if (!resend) {
    // Soft-fail in environments without Resend configured. We log so the
    // missing config is visible but we don't break the auth flow — the API
    // routes still return 200 to prevent enumeration attacks.
    console.warn(
      '[email] RESEND_API_KEY not set — skipping send to',
      args.to,
      'subject:',
      args.subject
    );
    return { ok: false, skipped: true };
  }
  try {
    const result = await resend.emails.send({
      from: getFromAddress(),
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
    });
    if ((result as { error?: { message?: string } }).error) {
      const err = (result as { error: { message?: string } }).error;
      console.error('[email] resend returned error:', err);
      return { ok: false, error: err.message || 'send_failed' };
    }
    const id = (result as { data?: { id?: string } }).data?.id;
    return { ok: true, id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown_error';
    console.error('[email] send threw:', message);
    return { ok: false, error: message };
  }
}

// ────────────────────────────────────────────────────────
// Templates
// ────────────────────────────────────────────────────────

function baseTemplate(opts: {
  preview: string;
  heading: string;
  body: string;
  cta: { url: string; label: string };
  footerNote?: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${opts.heading}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${opts.preview}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
  <tr>
    <td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 1px 3px rgba(15,23,42,0.08);overflow:hidden;">
        <tr>
          <td style="padding:24px 32px;border-bottom:1px solid #e2e8f0;">
            <div style="font-size:18px;font-weight:700;color:#0f172a;">
              Shipping<span style="background:linear-gradient(90deg,#0ea5e9,#1e40af);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Savior</span>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 16px 0;font-size:20px;font-weight:600;color:#0f172a;">${opts.heading}</h1>
            <div style="font-size:14px;line-height:1.6;color:#334155;">${opts.body}</div>
            <div style="margin:28px 0;">
              <a href="${opts.cta.url}" style="display:inline-block;background:#0284c7;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;">${opts.cta.label}</a>
            </div>
            <p style="font-size:12px;color:#64748b;line-height:1.6;margin:24px 0 0 0;">If the button doesn't work, copy and paste this URL into your browser:<br/><a href="${opts.cta.url}" style="color:#0284c7;word-break:break-all;">${opts.cta.url}</a></p>
            ${opts.footerNote ? `<p style="font-size:12px;color:#94a3b8;margin:16px 0 0 0;">${opts.footerNote}</p>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;">
            ShippingSavior - International logistics platform
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export function renderPasswordResetEmail(args: {
  resetUrl: string;
  expiresInMinutes: number;
}): { subject: string; html: string; text: string } {
  const subject = 'Reset your ShippingSavior password';
  const html = baseTemplate({
    preview: 'Click to reset your ShippingSavior password',
    heading: 'Reset your password',
    body: `<p>We received a request to reset the password on your ShippingSavior account. Click the button below to choose a new password.</p>`,
    cta: { url: args.resetUrl, label: 'Reset password' },
    footerNote: `This link expires in ${args.expiresInMinutes} minutes. If you didn't request a reset, you can safely ignore this email.`,
  });
  const text = `Reset your ShippingSavior password\n\n${args.resetUrl}\n\nThis link expires in ${args.expiresInMinutes} minutes. If you didn't request a reset, you can safely ignore this email.`;
  return { subject, html, text };
}

export function renderEmailVerificationEmail(args: {
  verifyUrl: string;
  expiresInHours: number;
}): { subject: string; html: string; text: string } {
  const subject = 'Verify your ShippingSavior email';
  const html = baseTemplate({
    preview: 'Confirm your ShippingSavior email address',
    heading: 'Confirm your email',
    body: `<p>Welcome to ShippingSavior. Click the button below to confirm your email address and finish setting up your account.</p>`,
    cta: { url: args.verifyUrl, label: 'Verify email' },
    footerNote: `This link expires in ${args.expiresInHours} hours.`,
  });
  const text = `Confirm your ShippingSavior email\n\n${args.verifyUrl}\n\nThis link expires in ${args.expiresInHours} hours.`;
  return { subject, html, text };
}
