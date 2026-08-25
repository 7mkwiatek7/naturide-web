// Cloudflare Pages Function - obsługa zgłoszeń do testów wewnętrznych.
// Zapisuje emaila do bazy D1 i wysyła maila z nowym zgłoszeniem.
// Maila wysyła przez Web3Forms (zewnętrzna usługa "form-to-email").
// Bez Netlify - wszystko robi sam Pages Function.

interface Env {
  // D1 database - powiązanie z bazą naturide-subscribers
  DB: D1Database;

  // WEB3FORMS_ACCESS_KEY - secret ustawiony przez wrangler CLI
  // (npx wrangler pages secret put WEB3FORMS_ACCESS_KEY)
  WEB3FORMS_ACCESS_KEY: string;
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
    const consent = formData.get('consent');

    // Prosta walidacja emaila (robi to też przeglądarka przez type="email",
    // ale sprawdzamy też po stronie serwera na wypadek obejścia).
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ ok: false, error: 'invalid_email' }, 400);
    }

    if (consent !== 'accepted') {
      return jsonResponse({ ok: false, error: 'invalid_consent' }, 400);
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

    // Wyślij maila z powiadomieniem (przez Web3Forms).
    // Web3Forms to zewnętrzna usługa "form-to-email" - wysyła maila
    // z ichniejszego serwera na adres związany z kontem Web3Forms.
    // Jeśli wysyłka się nie powiedzie - zapis do D1 już się udał,
    // więc uznajemy zapis za udany, ale w odpowiedzi zwracamy
    // emailSent: false żeby UI mógł to pokazać i właściciel wiedział.
    let emailSent = false;
    let emailError: string | null = null;
    try {
      const emailRes = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: context.env.WEB3FORMS_ACCESS_KEY,
          subject: `Naturide: nowe zgłoszenie do testów (${email})`,
          from_name: 'Naturide - testy wewnętrzne',
          replyto: email,
          message:
            `Nowe zgłoszenie do testów wewnętrznych Naturide.\n\n` +
            `Email: ${email}\n` +
            `Język: ${lang}\n` +
            `Czas: ${new Date().toISOString()}\n` +
            `IP: ${ip || '(nieznane)'}\n`,
        }),
      });
      if (!emailRes.ok) {
        const bodyText = await emailRes.text().catch(() => '');
        console.error('notify web3forms failed', emailRes.status, bodyText);
        emailError = `web3forms_${emailRes.status}`;
      } else {
        emailSent = true;
      }
    } catch (emailErr) {
      // Logujemy w Cloudflare Logs - email nadal jest zapisany w D1.
      console.error('notify email send failed', emailErr);
      emailError = 'web3forms_unreachable';
    }

    return jsonResponse({ ok: true, emailSent, emailError });
  } catch (err) {
    // Logujemy błąd na konsolę Cloudflare (widoczne w dashboardzie → Logs).
    console.error('notify error', err);
    return jsonResponse({ ok: false, error: 'server' }, 500);
  }
};

// GET - zwraca stronę z pustym komunikatem, gdyby ktoś wszedł tu z paska adresu.
export const onRequestGet = async () => {
  return new Response('Use POST to apply for testing.', { status: 405 });
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
