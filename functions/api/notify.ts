// Cloudflare Pages Function - obsługa zgłoszeń do testów wewnętrznych.
// Zapisuje emaila do bazy D1 i wysyła maila z nowym zgłoszeniem.
// Nieudane powiadomienia można ponowić bez tworzenia kolejnego wpisu.

interface Env {
  DB: D1Database;
  WEB3FORMS_ACCESS_KEY: string;
}

type NotificationStatus = 'unknown' | 'pending' | 'sent' | 'failed';

interface Subscriber {
  id: number;
  email: string;
  lang: string;
  ip_address: string;
  created_at: string;
  notification_status: NotificationStatus;
  notification_last_attempt_at: string | null;
}

interface NotificationResult {
  emailSent: boolean;
  emailError: string | null;
}

const RETRY_COOLDOWN_MS = 5 * 60 * 1000;

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const formData = await context.request.formData();

    const botField = formData.get('bot-field');
    if (typeof botField === 'string' && botField.length > 0) {
      return jsonResponse({ ok: true });
    }

    const email = String(formData.get('email') || '').trim().toLowerCase();
    const lang = String(formData.get('lang') || 'pl').slice(0, 2);
    const consent = formData.get('consent');
    const retryRequested = formData.get('retry') === '1';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ ok: false, error: 'invalid_email' }, 400);
    }

    if (consent !== 'accepted') {
      return jsonResponse({ ok: false, error: 'invalid_consent' }, 400);
    }

    const db = context.env.DB;
    let subscriber = await findSubscriber(db, email);
    if (subscriber) {
      return retryRequested
        ? retryNotification(context.env, subscriber, Date.now())
        : duplicateResponse(subscriber, Date.now());
    }

    const createdAt = new Date().toISOString();
    const userAgent = context.request.headers.get('user-agent') || '';
    const ip = context.request.headers.get('cf-connecting-ip') || '';
    const insertResult = await db
      .prepare(
        `INSERT OR IGNORE INTO notify_subscribers
          (email, lang, ip_address, user_agent, created_at, notification_status, notification_last_attempt_at)
         VALUES (?, ?, ?, ?, ?, 'pending', ?)`
      )
      .bind(email, lang, ip, userAgent, createdAt, createdAt)
      .run();

    if ((insertResult.meta?.changes ?? 0) !== 1) {
      subscriber = await findSubscriber(db, email);
      if (!subscriber) throw new Error('notify_subscriber_insert_failed');
      return duplicateResponse(subscriber, Date.now());
    }

    const result = await sendNotification(context.env, {
      email,
      lang,
      ip_address: ip,
      created_at: createdAt,
    });
    await updateNotificationStatus(db, email, createdAt, result.emailSent);

    return jsonResponse({
      ok: true,
      emailSent: result.emailSent,
      emailError: result.emailError,
      canRetry: !result.emailSent,
      retryAfterSeconds: result.emailSent ? 0 : retryAfterSeconds(createdAt, Date.now()),
    });
  } catch (err) {
    console.error('notify error', err);
    return jsonResponse({ ok: false, error: 'server' }, 500);
  }
};

async function retryNotification(env: Env, subscriber: Subscriber, now: number): Promise<Response> {
  if (subscriber.notification_status === 'sent') {
    return duplicateResponse(subscriber, now);
  }

  if (retryAfterSeconds(subscriber.notification_last_attempt_at, now) > 0) {
    return duplicateResponse(subscriber, now);
  }

  const attemptedAt = new Date(now).toISOString();
  const cutoff = new Date(now - RETRY_COOLDOWN_MS).toISOString();
  const claim = await env.DB
    .prepare(
      `UPDATE notify_subscribers
       SET notification_status = 'pending', notification_last_attempt_at = ?
       WHERE id = ?
         AND notification_status IN ('unknown', 'failed', 'pending')
         AND (notification_last_attempt_at IS NULL OR notification_last_attempt_at <= ?)`
    )
    .bind(attemptedAt, subscriber.id, cutoff)
    .run();

  if ((claim.meta?.changes ?? 0) !== 1) {
    const current = await findSubscriber(env.DB, subscriber.email);
    if (!current) throw new Error('notify_subscriber_missing');
    return duplicateResponse(current, Date.now());
  }

  const result = await sendNotification(env, subscriber);
  await updateNotificationStatus(env.DB, subscriber.email, attemptedAt, result.emailSent);

  return jsonResponse({
    ok: true,
    already: true,
    emailSent: result.emailSent,
    emailError: result.emailError,
    canRetry: !result.emailSent,
    retryAfterSeconds: result.emailSent ? 0 : retryAfterSeconds(attemptedAt, Date.now()),
  });
}

function duplicateResponse(subscriber: Subscriber, now: number): Response {
  const canRetry = subscriber.notification_status !== 'sent';
  const emailSent =
    subscriber.notification_status === 'sent'
      ? true
      : subscriber.notification_status === 'failed'
        ? false
        : undefined;

  return jsonResponse({
    ok: true,
    already: true,
    emailSent,
    canRetry,
    retryAfterSeconds: canRetry
      ? retryAfterSeconds(subscriber.notification_last_attempt_at, now)
      : 0,
  });
}

async function findSubscriber(db: D1Database, email: string): Promise<Subscriber | null> {
  return db
    .prepare(
      `SELECT id, email, lang, ip_address, created_at, notification_status, notification_last_attempt_at
       FROM notify_subscribers
       WHERE email = ?`
    )
    .bind(email)
    .first<Subscriber>();
}

async function updateNotificationStatus(
  db: D1Database,
  email: string,
  attemptedAt: string,
  emailSent: boolean
): Promise<void> {
  const update = await db
    .prepare(
      `UPDATE notify_subscribers
       SET notification_status = ?
       WHERE email = ? AND notification_last_attempt_at = ? AND notification_status = 'pending'`
    )
    .bind(emailSent ? 'sent' : 'failed', email, attemptedAt)
    .run();

  if ((update.meta?.changes ?? 0) !== 1) {
    throw new Error('notify_status_update_failed');
  }
}

function retryAfterSeconds(lastAttemptAt: string | null, now: number): number {
  if (!lastAttemptAt) return 0;

  const lastAttempt = Date.parse(lastAttemptAt);
  if (!Number.isFinite(lastAttempt)) return 0;

  return Math.max(0, Math.ceil((lastAttempt + RETRY_COOLDOWN_MS - now) / 1000));
}

async function sendNotification(
  env: Env,
  subscriber: Pick<Subscriber, 'email' | 'lang' | 'ip_address' | 'created_at'>
): Promise<NotificationResult> {
  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: env.WEB3FORMS_ACCESS_KEY,
        subject: `Naturide: nowe zgłoszenie do testów (${subscriber.email})`,
        from_name: 'Naturide - testy wewnętrzne',
        replyto: subscriber.email,
        message:
          `Nowe zgłoszenie do testów wewnętrznych Naturide.\n\n` +
          `Email: ${subscriber.email}\n` +
          `Język: ${subscriber.lang}\n` +
          `Czas: ${subscriber.created_at}\n` +
          `IP: ${subscriber.ip_address || '(nieznane)'}\n`,
      }),
    });
    const responseBody: unknown = await response.json().catch(() => null);
    const accepted =
      response.ok &&
      typeof responseBody === 'object' &&
      responseBody !== null &&
      'success' in responseBody &&
      responseBody.success === true;

    if (!accepted) {
      const emailError = response.ok ? 'web3forms_rejected' : `web3forms_${response.status}`;
      console.error('notify web3forms failed', response.status, responseBody);
      return { emailSent: false, emailError };
    }

    return { emailSent: true, emailError: null };
  } catch (emailErr) {
    console.error('notify email send failed', emailErr);
    return { emailSent: false, emailError: 'web3forms_unreachable' };
  }
}

export const onRequestGet = async () => {
  return new Response('Use POST to apply for testing.', { status: 405 });
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
