import type { Lang } from '../../src/i18n/ui';

export const CONFIRMATION_TTL_MS = 24 * 60 * 60 * 1000;

export function normalizeLang(value: string): Lang {
  return value === 'en' ? 'en' : 'pl';
}

export function createConfirmationToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashConfirmationToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(token)
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

export function buildConfirmationUrl(
  request: Request,
  lang: Lang,
  token: string
): string {
  const url = new URL('/api/confirm', request.url);
  url.searchParams.set('token', token);
  url.searchParams.set('lang', lang);
  return url.toString();
}

export function buildConfirmationRedirect(
  request: Request,
  lang: Lang,
  result: 'success' | 'invalid',
  notification: 'sent' | 'failed' | undefined = undefined
): string {
  const url = new URL(lang === 'en' ? '/en/' : '/', request.url);
  url.searchParams.set('confirmation', result);
  if (notification) url.searchParams.set('notification', notification);
  url.hash = 'join';
  return url.toString();
}
