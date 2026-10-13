import {
  buildConfirmationRedirect,
  hashConfirmationToken,
  normalizeLang,
} from '../lib/confirmation';
import {
  claimNotification,
  findSubscriber,
  findSubscriberByTokenHash,
  sendOwnerNotification,
  updateNotificationStatus,
  type ResendEnv,
  type Subscriber,
} from '../lib/notifications';
import { t, type Lang } from '../../src/i18n/ui';

interface Env extends ResendEnv {
  DB: D1Database;
}

export const onRequestGet = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const url = new URL(context.request.url);
  const token = url.searchParams.get('token')?.trim() || '';
  const requestedLang = normalizeLang(url.searchParams.get('lang') || 'pl');

  if (!token) {
    return confirmationPage(requestedLang, null, true);
  }

  const subscriber = await findSubscriberByToken(context.env.DB, token);
  if (!subscriber) {
    return confirmationPage(requestedLang, null, true);
  }

  if (isExpired(subscriber.confirmation_expires_at, Date.now())) {
    return confirmationPage(subscriber.lang, null, true);
  }

  return confirmationPage(subscriber.lang, token, false);
};

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  let requestedLang: Lang = 'pl';
  try {
    const formData = await context.request.formData();
    const token = String(formData.get('token') || '').trim();
    requestedLang = normalizeLang(String(formData.get('lang') || 'pl'));

    if (!token) {
      return redirectToResult(context.request, requestedLang, 'invalid');
    }

    const tokenHash = await hashConfirmationToken(token);
    const subscriber = await findSubscriberByTokenHash(context.env.DB, tokenHash);
    if (!subscriber || isExpired(subscriber.confirmation_expires_at, Date.now())) {
      return redirectToResult(context.request, requestedLang, 'invalid');
    }

    return confirmSubscriber(context, subscriber, tokenHash);
  } catch (error) {
    console.error('confirmation error', error);
    return redirectToResult(
      context.request,
      requestedLang,
      'invalid'
    );
  }
};

async function findSubscriberByToken(
  db: D1Database,
  token: string
): Promise<Subscriber | null> {
  return findSubscriberByTokenHash(db, await hashConfirmationToken(token));
}

async function confirmSubscriber(
  context: { request: Request; env: Env },
  subscriber: Subscriber,
  tokenHash: string
): Promise<Response> {
  const now = Date.now();
  const confirmedAt = new Date(now).toISOString();
  const claim = await context.env.DB
    .prepare(
      `UPDATE notify_subscribers
       SET
         confirmation_status = 'confirmed',
         confirmation_token_hash = NULL,
         confirmation_expires_at = NULL,
         confirmed_at = ?
       WHERE id = ?
         AND confirmation_status = 'pending'
         AND confirmation_token_hash = ?
         AND confirmation_expires_at > ?`
    )
    .bind(confirmedAt, subscriber.id, tokenHash, confirmedAt)
    .run();

  if ((claim.meta?.changes ?? 0) !== 1) {
    const current = await findSubscriber(context.env.DB, subscriber.email);
    if (current?.confirmation_status === 'confirmed') {
      return redirectToResult(
        context.request,
        current.lang,
        'success',
        notificationState(current)
      );
    }
    return redirectToResult(context.request, subscriber.lang, 'invalid');
  }

  const confirmedSubscriber = await findSubscriber(
    context.env.DB,
    subscriber.email
  );
  if (!confirmedSubscriber) {
    throw new Error('confirmed_subscriber_missing');
  }

  const attemptedAt = await claimNotification(
    context.env.DB,
    confirmedSubscriber,
    now
  );
  if (!attemptedAt) {
    const current = await findSubscriber(
      context.env.DB,
      confirmedSubscriber.email
    );
    return redirectToResult(
      context.request,
      confirmedSubscriber.lang,
      'success',
      current ? notificationState(current) : undefined
    );
  }

  const result = await sendOwnerNotification(context.env, confirmedSubscriber);
  await updateNotificationStatus(
    context.env.DB,
    confirmedSubscriber.email,
    attemptedAt,
    result.emailSent
  );

  return redirectToResult(
    context.request,
    confirmedSubscriber.lang,
    'success',
    result.emailSent ? 'sent' : 'failed'
  );
}

function notificationState(
  subscriber: Subscriber
): 'sent' | 'failed' | undefined {
  if (subscriber.notification_status === 'sent') return 'sent';
  if (subscriber.notification_status === 'failed') return 'failed';
  return undefined;
}

function isExpired(expiresAt: string | null, now: number): boolean {
  if (!expiresAt) return true;
  const expires = Date.parse(expiresAt);
  return !Number.isFinite(expires) || expires <= now;
}

function redirectToResult(
  request: Request,
  lang: Lang,
  result: 'success' | 'invalid',
  notification?: 'sent' | 'failed'
): Response {
  return Response.redirect(
    buildConfirmationRedirect(request, lang, result, notification),
    303
  );
}

function confirmationPage(
  lang: Lang,
  token: string | null,
  invalid: boolean
): Response {
  const title = invalid
    ? t(lang, 'email.confirmation.invalidTitle')
    : t(lang, 'email.confirmation.pageTitle');
  const description = invalid
    ? t(lang, 'email.confirmation.invalidDescription')
    : t(lang, 'email.confirmation.pageDescription');
  const form = token
    ? `<form method="post" action="/api/confirm">
        <input type="hidden" name="token" value="${escapeHtml(token)}">
        <input type="hidden" name="lang" value="${lang}">
        <button type="submit">${escapeHtml(t(lang, 'email.confirmation.pageButton'))}</button>
      </form>`
    : '';

  const html = `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <style>
      :root { color-scheme: light; font-family: system-ui, sans-serif; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f7f7ef; color: #234e3b; }
      main { width: min(90vw, 34rem); padding: 2rem; border-radius: 1.5rem; background: #fff; box-shadow: 0 1rem 3rem rgb(35 78 59 / 15%); text-align: center; }
      h1 { margin-top: 0; }
      p { line-height: 1.6; }
      button { border: 0; border-radius: 999px; padding: .8rem 1.4rem; background: #234e3b; color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(description)}</p>
      ${form}
    </main>
  </body>
</html>`;

  return new Response(html, {
    status: invalid ? 410 : 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
    },
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
