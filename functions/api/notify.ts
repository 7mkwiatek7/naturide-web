// Cloudflare Pages Function - obsługa zgłoszeń do testów wewnętrznych.
// Nowe zgłoszenia wymagają potwierdzenia adresu przed powiadomieniem zespołu.

import {
  CONFIRMATION_TTL_MS,
  buildConfirmationUrl,
  createConfirmationToken,
  hashConfirmationToken,
  normalizeLang,
} from '../lib/confirmation';
import {
  RETRY_COOLDOWN_MS,
  claimNotification,
  findSubscriber,
  sendConfirmationEmail,
  sendOwnerNotification,
  retryAfterSeconds,
  type ResendEnv,
  type Subscriber,
  updateNotificationStatus,
} from '../lib/notifications';

interface Env extends ResendEnv {
  DB: D1Database;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const formData = await context.request.formData();

    const botField = formData.get('bot-field');
    if (typeof botField === 'string' && botField.length > 0) {
      return jsonResponse({ ok: true });
    }

    const email = String(formData.get('email') || '').trim().toLowerCase();
    const lang = normalizeLang(String(formData.get('lang') || 'pl').slice(0, 2));
    const consent = formData.get('consent');
    const retryRequested = formData.get('retry') === '1';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ ok: false, error: 'invalid_email' }, 400);
    }

    if (consent !== 'accepted') {
      return jsonResponse({ ok: false, error: 'invalid_consent' }, 400);
    }

    const db = context.env.DB;
    const now = Date.now();
    let subscriber = await findSubscriber(db, email);

    if (subscriber) {
      if (subscriber.confirmation_status === 'pending') {
        const retryAfter = retryAfterSeconds(
          subscriber.confirmation_last_sent_at,
          now
        );
        if (retryRequested || retryAfter === 0) {
          return resendConfirmation(context, subscriber, now);
        }
        return confirmationResponse(false, retryAfter);
      }

      return retryRequested
        ? retryNotification(context.env, subscriber, now)
        : duplicateResponse(subscriber, now);
    }

    const createdAt = new Date(now).toISOString();
    const confirmationToken = createConfirmationToken();
    const confirmationTokenHash = await hashConfirmationToken(confirmationToken);
    const confirmationExpiresAt = new Date(now + CONFIRMATION_TTL_MS).toISOString();
    const userAgent = context.request.headers.get('user-agent') || '';
    const ip = context.request.headers.get('cf-connecting-ip') || '';

    const insertResult = await db
      .prepare(
        `INSERT OR IGNORE INTO notify_subscribers
          (
            email,
            lang,
            ip_address,
            user_agent,
            created_at,
            notification_status,
            notification_last_attempt_at,
            confirmation_status,
            confirmation_token_hash,
            confirmation_expires_at,
            confirmation_last_sent_at
          )
         VALUES (?, ?, ?, ?, ?, 'unknown', NULL, 'pending', ?, ?, ?)`
      )
      .bind(
        email,
        lang,
        ip,
        userAgent,
        createdAt,
        confirmationTokenHash,
        confirmationExpiresAt,
        createdAt
      )
      .run();

    if ((insertResult.meta?.changes ?? 0) !== 1) {
      subscriber = await findSubscriber(db, email);
      if (!subscriber) throw new Error('notify_subscriber_insert_failed');

      if (subscriber.confirmation_status === 'pending') {
        return confirmationResponse(
          false,
          retryAfterSeconds(subscriber.confirmation_last_sent_at, Date.now())
        );
      }
      return duplicateResponse(subscriber, Date.now());
    }

    const result = await sendConfirmationEmail(context.env, {
      email,
      lang,
      confirmationUrl: buildConfirmationUrl(
        context.request,
        lang,
        confirmationToken
      ),
    });

    return jsonResponse({
      ok: true,
      confirmationPending: true,
      confirmationSent: result.emailSent,
      canRetry: !result.emailSent,
      retryAfterSeconds: result.emailSent
        ? 0
        : retryAfterSeconds(createdAt, Date.now()),
    });
  } catch (err) {
    console.error('notify error', err);
    return jsonResponse({ ok: false, error: 'server' }, 500);
  }
};

async function resendConfirmation(
  context: { request: Request; env: Env },
  subscriber: Subscriber,
  now: number
): Promise<Response> {
  const cutoff = new Date(now - RETRY_COOLDOWN_MS).toISOString();
  const attemptedAt = new Date(now).toISOString();
  const confirmationToken = createConfirmationToken();
  const confirmationTokenHash = await hashConfirmationToken(confirmationToken);
  const confirmationExpiresAt = new Date(now + CONFIRMATION_TTL_MS).toISOString();

  const claim = await context.env.DB
    .prepare(
      `UPDATE notify_subscribers
       SET
         confirmation_token_hash = ?,
         confirmation_expires_at = ?,
         confirmation_last_sent_at = ?
       WHERE id = ?
         AND confirmation_status = 'pending'
         AND (
           confirmation_last_sent_at IS NULL
           OR confirmation_last_sent_at <= ?
         )`
    )
    .bind(
      confirmationTokenHash,
      confirmationExpiresAt,
      attemptedAt,
      subscriber.id,
      cutoff
    )
    .run();

  if ((claim.meta?.changes ?? 0) !== 1) {
    const current = await findSubscriber(context.env.DB, subscriber.email);
    if (!current) throw new Error('notify_subscriber_missing');

    if (current.confirmation_status === 'pending') {
      return confirmationResponse(
        false,
        retryAfterSeconds(current.confirmation_last_sent_at, Date.now())
      );
    }
    return duplicateResponse(current, Date.now());
  }

  const result = await sendConfirmationEmail(context.env, {
    email: subscriber.email,
    lang: subscriber.lang,
    confirmationUrl: buildConfirmationUrl(
      context.request,
      subscriber.lang,
      confirmationToken
    ),
  });

  return confirmationResponse(
    result.emailSent,
    result.emailSent ? 0 : retryAfterSeconds(attemptedAt, Date.now())
  );
}

async function retryNotification(
  env: Env,
  subscriber: Subscriber,
  now: number
): Promise<Response> {
  if (subscriber.notification_status === 'sent') {
    return duplicateResponse(subscriber, now);
  }

  const retryAfter = retryAfterSeconds(
    subscriber.notification_last_attempt_at,
    now
  );
  if (retryAfter > 0) {
    return duplicateResponse(subscriber, now);
  }

  const attemptedAt = await claimNotification(env.DB, subscriber, now);
  if (!attemptedAt) {
    const current = await findSubscriber(env.DB, subscriber.email);
    if (!current) throw new Error('notify_subscriber_missing');
    return duplicateResponse(current, Date.now());
  }

  const result = await sendOwnerNotification(env, subscriber);
  await updateNotificationStatus(env.DB, subscriber.email, attemptedAt, result.emailSent);

  return jsonResponse({
    ok: true,
    already: true,
    confirmed: true,
    emailSent: result.emailSent,
    canRetry: !result.emailSent,
    retryAfterSeconds: result.emailSent
      ? 0
      : retryAfterSeconds(attemptedAt, Date.now()),
  });
}

function confirmationResponse(
  confirmationSent: boolean,
  retryAfter: number
): Response {
  return jsonResponse({
    ok: true,
    already: true,
    confirmationPending: true,
    confirmationSent,
    canRetry: true,
    retryAfterSeconds: retryAfter,
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
    confirmed: true,
    emailSent,
    canRetry,
    retryAfterSeconds: canRetry
      ? retryAfterSeconds(subscriber.notification_last_attempt_at, now)
      : 0,
  });
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
