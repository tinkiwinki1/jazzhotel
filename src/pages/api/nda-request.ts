import type { APIRoute } from 'astro';
import { z } from 'zod';

export const prerender = false;

const Body = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().min(5).max(40),
  consent: z.literal(true),
  companyWebsite: z.string().max(0).optional().or(z.literal('')),
  utm: z.record(z.string()).optional(),
  locale: z.enum(['ru', 'en']).optional(),
  eventId: z.string().max(100).optional(),
});

const buckets = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

function rateLimit(key: string): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (b.count >= RATE_LIMIT) return false;
  b.count += 1;
  return true;
}

async function sendTelegram(text: string) {
  const token = import.meta.env.TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
  } catch (e) {
    console.error('Telegram send failed:', e);
  }
}

async function sendResendEmail({
  apiKey,
  from,
  to,
  subject,
  text,
  replyTo,
}: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, text, reply_to: replyTo }),
  });
}

// SHA-256 hex — required normalization for Meta CAPI user_data fields.
async function sha256(value: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function getCookie(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

// Server-side Lead via Meta Conversions API. Mirrors the browser Pixel's
// `Lead` event using the same event_id so Meta dedupes to one. Sending it
// from the Netlify Function bypasses ad blockers / ITP that drop the
// browser-only event. No-op unless FB_CONVERSIONS_API_TOKEN is set.
async function sendMetaCapiLead({
  pixelId,
  token,
  eventId,
  email,
  phone,
  ip,
  userAgent,
  sourceUrl,
  fbp,
  fbc,
}: {
  pixelId: string;
  token: string;
  eventId: string;
  email: string;
  phone: string;
  ip: string;
  userAgent: string | null;
  sourceUrl: string | null;
  fbp?: string;
  fbc?: string;
}) {
  try {
    const userData: Record<string, unknown> = {
      em: [await sha256(email.trim().toLowerCase())],
      ph: [await sha256(phone.replace(/[^0-9]/g, ''))],
    };
    if (ip && ip !== 'unknown') userData.client_ip_address = ip;
    if (userAgent) userData.client_user_agent = userAgent;
    if (fbp) userData.fbp = fbp;
    if (fbc) userData.fbc = fbc;

    const event: Record<string, unknown> = {
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_id: eventId,
      user_data: userData,
    };
    if (sourceUrl) event.event_source_url = sourceUrl;

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [event] }),
      },
    );
    if (!res.ok) {
      console.error('Meta CAPI send failed:', res.status, await res.text());
    }
  } catch (e) {
    console.error('Meta CAPI send failed:', e);
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'validation_failed' }), { status: 400 });
  }

  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ ok: false, error: 'validation_failed' }), { status: 400 });
  }
  const data = parsed.data;

  if (data.companyWebsite) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const ip = clientAddress || request.headers.get('cf-connecting-ip') || 'unknown';
  if (!rateLimit(ip)) {
    return new Response(JSON.stringify({ ok: false, error: 'rate_limited' }), { status: 429 });
  }

  const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
  const SELLER_EMAIL = import.meta.env.SELLER_EMAIL || 'info@aurahomes.ge';
  const FROM_EMAIL = import.meta.env.FROM_EMAIL || 'nda@aurahomes.ge';
  // Read at runtime (process.env), NOT import.meta.env — the latter is inlined
  // at build time, so a Netlify-dashboard token would be missing from a locally
  // built bundle and the whole CAPI branch would be tree-shaken out. Accessed
  // via globalThis to stay typed without pulling in @types/node.
  const runtimeEnv =
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
  const FB_PIXEL_ID = runtimeEnv.FB_PIXEL_ID || '1716927566157782';
  const FB_CAPI_TOKEN = runtimeEnv.FB_CONVERSIONS_API_TOKEN;

  const phoneClean = data.phone.replace(/\s/g, '');
  const waLink = `https://wa.me/${phoneClean.replace(/^\+/, '')}`;
  const tgLink = `tel:${phoneClean}`;
  const utmStr = data.utm && Object.keys(data.utm).length ? JSON.stringify(data.utm) : '—';

  // Plain-text version for email + console
  const summaryText = `
Имя:     ${data.name}
Email:   ${data.email}
Телефон: ${data.phone}
Locale:  ${data.locale || '—'}
IP:      ${ip}
UTM:     ${utmStr}
`.trim();

  // HTML for Telegram (parse_mode: HTML)
  const summaryHtml = `<b>Новая заявка · Jazz Hotel</b>

<b>Имя:</b> ${data.name}
<b>Email:</b> <a href="mailto:${data.email}">${data.email}</a>
<b>Телефон:</b> <a href="${tgLink}">${data.phone}</a>
<b>WhatsApp:</b> <a href="${waLink}">открыть чат</a>

<i>Locale:</i> ${data.locale || '—'}
<i>IP:</i> ${ip}
<i>UTM:</i> ${utmStr}`;

  // Send Telegram notification
  await sendTelegram(summaryHtml);

  // Server-side Lead (Meta Conversions API) — deduped with the browser Pixel
  // via the shared eventId. Skipped silently if the token isn't configured.
  if (FB_CAPI_TOKEN) {
    const cookieHeader = request.headers.get('cookie');
    await sendMetaCapiLead({
      pixelId: FB_PIXEL_ID,
      token: FB_CAPI_TOKEN,
      eventId: data.eventId || crypto.randomUUID(),
      email: data.email,
      phone: data.phone,
      ip,
      userAgent: request.headers.get('user-agent'),
      sourceUrl: request.headers.get('referer'),
      fbp: getCookie(cookieHeader, '_fbp'),
      fbc: getCookie(cookieHeader, '_fbc'),
    });
  }

  // Send email (if Resend configured)
  if (RESEND_API_KEY) {
    try {
      await sendResendEmail({
        apiKey: RESEND_API_KEY,
        from: `Jazz Hotel NDA <${FROM_EMAIL}>`,
        to: SELLER_EMAIL,
        subject: `Новая заявка — ${data.name} (${data.phone})`,
        text: summaryText,
        replyTo: data.email,
      });

      const confirmText =
        data.locale === 'en'
          ? `Hello ${data.name},\n\nWe have received your offer request for the Jazz Hotel teaser. We will respond within 24 hours with the NDA, the Information Memorandum and the data room link.\n\n— Jazz Hotel team`
          : `Здравствуйте, ${data.name}.\n\nМы получили вашу заявку на оффер по тизеру Jazz Hotel. Свяжемся с вами в течение 24 часов — пришлём NDA, Information Memorandum и ссылку на data room.\n\n— Команда Jazz Hotel`;

      await sendResendEmail({
        apiKey: RESEND_API_KEY,
        from: `Jazz Hotel <${FROM_EMAIL}>`,
        to: data.email,
        subject:
          data.locale === 'en'
            ? 'Your offer request — Jazz Hotel'
            : 'Ваша заявка на оффер — Jazz Hotel',
        text: confirmText,
      });
    } catch (e) {
      console.error('Email send failed:', e);
    }
  } else {
    console.log('[NDA REQUEST]\n' + summaryText);
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
