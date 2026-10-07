// Cloudflare Pages Function - tymczasowy endpoint diagnostyczny.
// Sprawdza czy środowisko (env) i baza D1 są prawidłowo skonfigurowane
// bezpośrednio w Cloudflare Pages - bez udawania że formularz zadziałał.
//
// Użycie: wejdź w przeglądarkę na https://naturide.app/api/debug
// Wynik to JSON z:
//   - czy jest ustawiony secret WEB3FORMS_ACCESS_KEY (tak/nie + długość + 4 pierwsze znaki)
//   - czy Cloudflare widzi binding DB (i ile jest rekordów)
//   - IP, UA, Accept-Language (do debugowania middleware'a języka)
// Endpoint nie wysyła testowego żądania do Web3Forms, żeby nie zużywać limitu API.
//
// Ten endpoint nie ujawnia pełnego klucza (tylko prefix), więc można go
// bezpiecznie udostępnić właścicielowi do sprawdzenia diagnostyki.

interface Env {
  DB: D1Database;
  WEB3FORMS_ACCESS_KEY?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

export const onRequestGet = async (context: PagesContext): Promise<Response> => {
  const url = new URL(context.request.url);

  const rawKey = context.env.WEB3FORMS_ACCESS_KEY;
  const keySet = typeof rawKey === 'string' && rawKey.length > 0;

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

  const web3Check = {
    performed: false,
    hint: 'Test API został wyłączony, żeby nie generować dodatkowych żądań do Web3Forms.',
  };

  const data = {
    timestamp: new Date().toISOString(),
    url: url.toString(),

    request: {
      ip: context.request.headers.get('cf-connecting-ip') ?? '(none)',
      userAgent: context.request.headers.get('user-agent')?.slice(0, 100) ?? '(none)',
      acceptLanguage: context.request.headers.get('accept-language')?.slice(0, 80) ?? '(none)',
    },

    web3forms: {
      keyConfigured: keySet,
      keyLength: keySet ? rawKey!.length : 0,
      keyPrefix: keySet ? rawKey!.slice(0, 4) + '...' : '(none)',
      apiCheck: web3Check,
      hint: keySet
        ? 'Klucz jest ustawiony. Ten endpoint nie testuje połączenia z Web3Forms; szczegóły rzeczywistych wysyłek sprawdź w Cloudflare Logs.'
        : 'Brak klucza WEB3FORMS_ACCESS_KEY. Dodaj go w terminalu komendą: npx wrangler pages secret put WEB3FORMS_ACCESS_KEY',
    },

    database: dbInfo,

    bindings: {
      hasDB: !!context.env.DB,
      hasKey: keySet,
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
