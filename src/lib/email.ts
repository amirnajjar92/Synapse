import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://synapse-fit.vercel.app';

interface SendEventEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEventEmail({ to, subject, html }: SendEventEmailParams) {
  if (!resend) {
    console.warn('Resend not configured — skipping email to', to);
    return { sent: false };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error('Email send error:', err);
    return { sent: false };
  }
}

export function joinRequestEmail(opts: {
  creatorName: string;
  eventTitle: string;
  requesterName: string;
  eventDate: string;
  eventLocation: string;
  approveUrl: string;
}) {
  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#151515;color:#fff;border-radius:16px;">
      <h2 style="font-size:20px;font-weight:700;margin:0 0 8px;">New Join Request</h2>
      <p style="color:#a1a1aa;font-size:14px;margin:0 0 20px;">Hey ${opts.creatorName}, someone wants to join your event!</p>
      <div style="background:#ffffff0d;border:1px solid #ffffff1a;border-radius:12px;padding:16px;margin-bottom:20px;">
        <p style="font-size:16px;font-weight:600;margin:0 0 8px;">${opts.eventTitle}</p>
        <p style="color:#a1a1aa;font-size:13px;margin:0 0 4px;">📅 ${opts.eventDate}</p>
        ${opts.eventLocation ? `<p style="color:#a1a1aa;font-size:13px;margin:0;">📍 ${opts.eventLocation}</p>` : ''}
      </div>
      <p style="color:#a1a1aa;font-size:14px;margin:0 0 16px;">
        <strong style="color:#fff;">${opts.requesterName}</strong> has requested to join your event.
      </p>
      <a href="${opts.approveUrl}" style="display:inline-block;padding:12px 24px;background:#FC4C02;color:#fff;font-weight:600;font-size:14px;border-radius:10px;text-decoration:none;">
        Review Request
      </a>
      <p style="color:#52525b;font-size:12px;margin:24px 0 0;">Open Training Studio to approve or decline this request.</p>
    </div>
  `;
}

export function approvalEmail(opts: {
  eventTitle: string;
  status: 'APPROVED' | 'DECLINED';
  eventDate: string;
  eventLocation: string;
}) {
  const isApproved = opts.status === 'APPROVED';
  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#151515;color:#fff;border-radius:16px;">
      <h2 style="font-size:20px;font-weight:700;margin:0 0 8px;">
        ${isApproved ? 'You\'re In!' : 'Request Declined'}
      </h2>
      <p style="color:#a1a1aa;font-size:14px;margin:0 0 20px;">
        ${isApproved
          ? 'Great news! Your request to join has been approved.'
          : 'Unfortunately, your request to join was declined.'}
      </p>
      <div style="background:#ffffff0d;border:1px solid #ffffff1a;border-radius:12px;padding:16px;margin-bottom:20px;">
        <p style="font-size:16px;font-weight:600;margin:0 0 8px;">${opts.eventTitle}</p>
        <p style="color:#a1a1aa;font-size:13px;margin:0 0 4px;">📅 ${opts.eventDate}</p>
        ${opts.eventLocation ? `<p style="color:#a1a1aa;font-size:13px;margin:0;">📍 ${opts.eventLocation}</p>` : ''}
      </div>
      <a href="${APP_URL}/sport-events" style="display:inline-block;padding:12px 24px;background:${isApproved ? '#22c55e' : '#6b7280'};color:#fff;font-weight:600;font-size:14px;border-radius:10px;text-decoration:none;">
        ${isApproved ? 'View Event' : 'Browse Events'}
      </a>
    </div>
  `;
}
