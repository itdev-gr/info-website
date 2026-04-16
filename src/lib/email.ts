import { Resend } from 'resend';

const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@example.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendIntakeInvite(opts: { to: string; clientName: string; intakeUrl: string }) {
  const resend = getResend();
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping email');
    return { data: null, error: null };
  }
  return resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Welcome, ${opts.clientName} — your intake form`,
    html: `
      <p>Hi ${escapeHtml(opts.clientName)},</p>
      <p>To kick off our work together, please fill in the intake form below:</p>
      <p><a href="${opts.intakeUrl}">${opts.intakeUrl}</a></p>
      <p>This link is valid for 7 days and can only be used once.</p>
    `,
  });
}

export async function sendSubmissionAlert(opts: { to: string[]; clientName: string; clientId: string }) {
  const resend = getResend();
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping email');
    return { data: null, error: null };
  }
  const url = `${APP_URL}/dashboard/clients/${opts.clientId}`;
  return resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Intake submitted: ${opts.clientName}`,
    html: `
      <p>The client <strong>${escapeHtml(opts.clientName)}</strong> has submitted their intake form.</p>
      <p><a href="${url}">Open client in dashboard</a></p>
    `,
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}
