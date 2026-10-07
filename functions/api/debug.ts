// Cloudflare Pages Function - tymczasowy endpoint diagnostyczny.
// Sprawdza czy środowisko (env) i baza D1 są prawidłowo skonfigurowane
// bezpośrednio w Cloudflare Pages - bez udawania że formularz zadziałał.
//
// Użycie: wejdź w przeglądarkę na https://naturide.app/api/debug
// Wynik to JSON z:
//   - czy ustawiono secret API Resend (bez ujawniania jego wartości)
//   - czy Cloudflare widzi binding DB (i ile jest rekordów)
//   - IP, UA, Accept-Language (do debugowania middleware'a języka)
// Endpoint nie wysyła testowego e-maila i nie ujawnia żadnych secretów.

interface Env {
  DB: D1Database;
  RESEND_API_KEY?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

export const onRequestGet = async (context: PagesContext): Promise<Response> => {
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
      'Access-Control-Allow-Origin': '*',
      // Bez cache - chcemy widzieć aktualny stan po każdym odświeżeniu.
      'Cache-Control': 'no-store',
    },
  });
};
