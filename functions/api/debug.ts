// Cloudflare Pages Function - tymczasowy endpoint diagnostyczny.
// Sprawdza czy środowisko (env) i baza D1 są prawidłowo skonfigurowane
// bezpośrednio w Cloudflare Pages - bez udawania że formularz zadziałał.
//
// Użycie: wejdź w przeglądarkę na https://naturide.app/api/debug
// Wynik to JSON z:
//   - czy jest ustawiony secret WEB3FORMS_ACCESS_KEY (tak/nie + długość + 4 pierwsze znaki)
//   - czy Cloudflare widzi binding DB (i ile jest rekordów)
//   - czy Web3Forms w ogóle odpowiada na request (czyli domena jest osiągalna)
//   - IP, UA, Accept-Language (do debugowania middleware'a języka)
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

  // Czy domena api.web3forms.com w ogóle działa - test z pustym (fałszywym) kluczem.
  // Web3Forms odpowiada błędem 4xx na zły klucz - ale to potwierdza że jesteśmy w stanie
  // do niego dostać. Gdyby fetch rzucił wyjątek (np. DNS / firewall), zobaczymy to.
  let web3Reach: { reachable: boolean; status?: number; body?: string; error?: string } = {
    reachable: false,
  };
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: 'diagnostic-test-key',
        subject: 'diagnostic',
        message: 'diagnostic - not a real submission',
      }),
    });
    const text = await res.text();
    web3Reach = {
      reachable: true,
      status: res.status,
      body: text.slice(0, 250),
    };
  } catch (e) {
    web3Reach = { reachable: false, error: String((e as Error).message ?? e) };
  }

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
      apiReachable: web3Reach,
      hint: keySet
        ? 'Klucz wygląda na ustawiony. Sprawdź na web3forms.com czy adres "To Email" jest ustawiony i czy konto nie jest zablokowane.'
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
