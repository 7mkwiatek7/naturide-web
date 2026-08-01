// Cloudflare Pages Function - obsługa formularza "Usuń moje dane".
// Usuwa email z bazy D1. Honeypot (bot-field) walidowany jak w notify.

interface Env {
  DB: D1Database;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const formData = await context.request.formData();

    // Honeypot - cichy sukces dla botów.
    const botField = formData.get('bot-field');
    if (typeof botField === 'string' && botField.length > 0) {
      return jsonResponse({ ok: true });
    }

    const email = String(formData.get('email') || '').trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ ok: false, error: 'invalid_email' }, 400);
    }

    // Usuń z bazy. Jeśli nie ma - zwracamy sukces bez błędu
    // (bo użytkownik powinien widzieć potwierdzenie nawet jak email
    // nie był zapisany).
    const result = await context.env.DB
      .prepare('DELETE FROM notify_subscribers WHERE email = ?')
      .bind(email)
      .run();

    // Sprawdzamy czy był taki wpis (użytkownik dostaje info w odpowiedzi).
    const deleted = result.meta?.changes ?? 0;

    return jsonResponse({ ok: true, removed: deleted > 0 });
  } catch (err) {
    console.error('remove error', err);
    return jsonResponse({ ok: false, error: 'server' }, 500);
  }
};

export const onRequestGet = async () => {
  return new Response('Use POST to remove.', { status: 405 });
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

// CORS preflight
export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
