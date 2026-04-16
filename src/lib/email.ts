import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@example.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendIntakeInvite(opts: { to: string; clientName: string; intakeUrl: string }) {
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
