// Cloudflare Pages Function - obsługa formularza "Powiadom mnie o premierze".
// Zapisuje emaila do bazy D1. Waliduje honeypot (pole bot-field).
// Bez Netlify - wszystko robi sam Worker.

interface Env {
  // D1 database - powiązanie z bazą naturide-subscribers
  // Setup: dashboard Cloudflare → Workers & Pages → D1 → Create database
  DB: D1Database;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const formData = await context.request.formData();

    // Honeypot - jeśli bot wypełnił ukryte pole, udajemy sukces
    // żeby boty nie wiedziały że zostały złapane.
    const botField = formData.get('bot-field');
    if (typeof botField === 'string' && botField.length > 0) {
      return jsonResponse({ ok: true });
    }

    const email = String(formData.get('email') || '').trim().toLowerCase();
    const lang = String(formData.get('lang') || 'pl').slice(0, 2);

    // Prosta walidacja emaila (robi to też przeglądarka przez type="email",
    // ale sprawdzamy też po stronie serwera na wypadek obejścia).
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ ok: false, error: 'invalid_email' }, 400);
    }

    // Sprawdź czy email już jest - jeśli tak, zwracamy sukces bez dublowania.
    const existing = await context.env.DB
      .prepare('SELECT id FROM notify_subscribers WHERE email = ?')
      .bind(email)
      .first();

    if (existing) {
      return jsonResponse({ ok: true, already: true });
    }

    // Zapisz email z informacją o języku i czasie.
    // user_agent przydaje się do wykrywania spamu.
    const userAgent = context.request.headers.get('user-agent') || '';
    const ip = context.request.headers.get('cf-connecting-ip') || '';

    await context.env.DB
      .prepare(
        'INSERT INTO notify_subscribers (email, lang, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(email, lang, ip, userAgent, new Date().toISOString())
      .run();

    return jsonResponse({ ok: true });
  } catch (err) {
    // Logujemy błąd na konsolę Cloudflare (widoczne w dashboardzie → Logs).
    console.error('notify error', err);
    return jsonResponse({ ok: false, error: 'server' }, 500);
  }
};

// GET - zwraca stronę z pustym komunikatem, gdyby ktoś wszedł tu z paska adresu.
export const onRequestGet = async () => {
  return new Response('Use POST to subscribe.', { status: 405 });
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      // CORS - formularz może być submitowany z innego origin (np. preview).
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
