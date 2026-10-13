import { t, type Lang } from '../../src/i18n/ui';

export type NotificationStatus = 'unknown' | 'pending' | 'sent' | 'failed';
export type ConfirmationStatus = 'pending' | 'confirmed';

export interface ResendEnv {
  RESEND_API_KEY?: string;
}

export interface Subscriber {
  id: number;
  email: string;
  lang: Lang;
  ip_address: string;
  created_at: string;
  notification_status: NotificationStatus;
  notification_last_attempt_at: string | null;
  confirmation_status: ConfirmationStatus;
  confirmation_token_hash: string | null;
  confirmation_expires_at: string | null;
  confirmation_last_sent_at: string | null;
  confirmed_at: string | null;
}

export interface EmailResult {
  emailSent: boolean;
  emailError: string | null;
}

interface ResendEmailResponse {
  id: string;
}

export const NOTIFICATION_RECIPIENT = 'mkwiatek.dev@gmail.com';
export const NOTIFICATION_SENDER = 'testy@naturide.app';
export const RETRY_COOLDOWN_MS = 5 * 60 * 1000;

export async function findSubscriber(
  db: D1Database,
  email: string
): Promise<Subscriber | null> {
  return db
    .prepare(
      `SELECT
        id,
        email,
        lang,
        ip_address,
        created_at,
        notification_status,
        notification_last_attempt_at,
        confirmation_status,
        confirmation_token_hash,
        confirmation_expires_at,
        confirmation_last_sent_at,
        confirmed_at
       FROM notify_subscribers
       WHERE email = ?`
    )
    .bind(email)
    .first<Subscriber>();
}

export async function findSubscriberByTokenHash(
  db: D1Database,
  tokenHash: string
): Promise<Subscriber | null> {
  return db
    .prepare(
      `SELECT
        id,
        email,
        lang,
        ip_address,
        created_at,
        notification_status,
        notification_last_attempt_at,
        confirmation_status,
        confirmation_token_hash,
        confirmation_expires_at,
        confirmation_last_sent_at,
        confirmed_at
       FROM notify_subscribers
       WHERE confirmation_token_hash = ?`
    )
    .bind(tokenHash)
    .first<Subscriber>();
}

export async function claimNotification(
  db: D1Database,
  subscriber: Subscriber,
  now: number
): Promise<string | null> {
  const attemptedAt = new Date(now).toISOString();
  const cutoff = new Date(now - RETRY_COOLDOWN_MS).toISOString();
  const claim = await db
    .prepare(
      `UPDATE notify_subscribers
       SET notification_status = 'pending', notification_last_attempt_at = ?
       WHERE id = ?
         AND confirmation_status = 'confirmed'
         AND notification_status IN ('unknown', 'failed')
         AND (notification_last_attempt_at IS NULL OR notification_last_attempt_at <= ?)`
    )
    .bind(attemptedAt, subscriber.id, cutoff)
    .run();

  return (claim.meta?.changes ?? 0) === 1 ? attemptedAt : null;
}

export async function updateNotificationStatus(
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

export function retryAfterSeconds(
  lastAttemptAt: string | null,
  now: number,
  cooldownMs = RETRY_COOLDOWN_MS
): number {
  if (!lastAttemptAt) return 0;

  const lastAttempt = Date.parse(lastAttemptAt);
  if (!Number.isFinite(lastAttempt)) return 0;

  return Math.max(0, Math.ceil((lastAttempt + cooldownMs - now) / 1000));
}

export function sendOwnerNotification(
  env: ResendEnv,
  subscriber: Pick<Subscriber, 'email' | 'lang' | 'ip_address' | 'created_at'>
): Promise<EmailResult> {
  return sendResendEmail(env, {
    to: subscriber.email,
    replyTo: subscriber.email,
    subject: `Naturide: nowe zgłoszenie do testów (${subscriber.email})`,
    text:
      `Nowe zgłoszenie do testów wewnętrznych Naturide.\n\n` +
      `Email: ${subscriber.email}\n` +
      `Język: ${subscriber.lang}\n` +
      `Czas: ${subscriber.created_at}\n` +
      `IP: ${subscriber.ip_address || '(nieznane)'}\n`,
  });
}

export function sendConfirmationEmail(
  env: ResendEnv,
  input: { email: string; lang: Lang; confirmationUrl: string }
): Promise<EmailResult> {
  return sendResendEmail(env, {
    to: input.email,
    replyTo: NOTIFICATION_RECIPIENT,
    subject: t(input.lang, 'email.confirmation.subject'),
    text:
      `${t(input.lang, 'email.confirmation.greeting')}\n\n` +
      `${t(input.lang, 'email.confirmation.instructions')}\n` +
      `${input.confirmationUrl}\n\n` +
      `${t(input.lang, 'email.confirmation.expires')}\n` +
      `${t(input.lang, 'email.confirmation.ignore')}\n`,
  });
}

async function sendResendEmail(
  env: ResendEnv,
  input: { to: string; subject: string; text: string; replyTo?: string }
): Promise<EmailResult> {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error('Resend API key is not configured');
    return { emailSent: false, emailError: 'resend_configuration_missing' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Naturide Testy <${NOTIFICATION_SENDER}>`,
        to: [input.to],
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
        subject: input.subject,
        text: input.text,
      }),
    });
    const responseBody: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      console.error('Resend email failed', response.status, resendErrorName(responseBody));
      return { emailSent: false, emailError: `resend_http_${response.status}` };
    }

    if (!isResendEmailResponse(responseBody)) {
      console.error('Resend returned an invalid response', resendErrorName(responseBody));
      return { emailSent: false, emailError: 'resend_rejected' };
    }

    return { emailSent: true, emailError: null };
  } catch (error) {
    console.error('Resend request failed', error);
    return { emailSent: false, emailError: 'resend_unreachable' };
  }
}

function isResendEmailResponse(value: unknown): value is ResendEmailResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    value.id.length > 0
  );
}

function resendErrorName(value: unknown): string | null {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('name' in value) ||
    typeof value.name !== 'string'
  ) {
    return null;
  }
  return value.name;
}
