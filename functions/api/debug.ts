// Cloudflare Pages Function - tymczasowy endpoint diagnostyczny.
// Sprawdza konfigurację środowiska i bazy D1 bez wysyłania wiadomości.
//
// Dostęp wymaga sekretu DEBUG_TOKEN w nagłówku autoryzacji.

interface Env {
  DB: D1Database;
  RESEND_API_KEY?: string;
  DEBUG_TOKEN?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

export const onRequestGet = async (context: PagesContext): Promise<Response> => {
  if (!isAuthorized(context.request, context.env.DEBUG_TOKEN)) {
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        'Cache-Control': 'no-store',
        'WWW-Authenticate': 'Bearer',
      },
    });
  }

  const url = new URL(context.request.url);
  const resendApiKeyConfigured = Boolean(context.env.RESEND_API_KEY?.trim());

  // Czy DB jest zbindowany i odpowiada.
  let dbInfo: { status: string; count?: number; error?: string } = {
    status: 'unknown',
  };
  try {
    if (!context.env.DB) {
      dbInfo = { status: 'binding missing - DB nie jest skonfigurowane' };
    } else {
      const row = await context.env.DB
        .prepare('SELECT COUNT(*) AS c FROM notify_subscribers')
        .first<{ c: number }>();
      dbInfo = { status: 'ok', count: row?.c ?? 0 };
    }
  } catch (e) {
    dbInfo = { status: 'error', error: String((e as Error).message ?? e) };
  }

  const data = {
    timestamp: new Date().toISOString(),
    url: url.toString(),

    request: {
      ip: context.request.headers.get('cf-connecting-ip') ?? '(none)',
      userAgent: context.request.headers.get('user-agent')?.slice(0, 100) ?? '(none)',
      acceptLanguage: context.request.headers.get('accept-language')?.slice(0, 80) ?? '(none)',
    },

    resend: {
      apiKeyConfigured: resendApiKeyConfigured,
      hint:
        resendApiKeyConfigured
          ? 'Klucz jest ustawiony. Ten endpoint nie wysyła testowego e-maila.'
          : 'Dodaj secret RESEND_API_KEY w ustawieniach projektu Cloudflare Pages.',
    },

    database: dbInfo,

    bindings: {
      hasDB: !!context.env.DB,
      hasResendApiKey: resendApiKeyConfigured,
    },
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Bez cache - chcemy widzieć aktualny stan po każdym odświeżeniu.
      'Cache-Control': 'no-store',
    },
  });
};

function isAuthorized(request: Request, expectedToken: string | undefined): boolean {
  const token = expectedToken?.trim();
  if (!token) return false;

  const authorization = request.headers.get('Authorization') || '';
  const prefix = 'Bearer ';
  if (!authorization.startsWith(prefix)) return false;

  return authorization.slice(prefix.length).trim() === token;
}
