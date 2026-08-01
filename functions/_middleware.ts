// Cloudflare Pages middleware - wykrywa język przeglądarki
// i serwuje polską albo angielską wersję strony.
// Dokładna logika przeniesiona z poprzedniego deployu na Netlify
// (plik netlify/edge-functions/language-redirect.ts).
//
// Zasady (identyczne jak poprzednio):
//   1) URL-e w wersji angielskiej (/en/...) nie są ruszane.
//   2) URL-e bez angielskiego odpowiednika nie są ruszane.
//   3) Boty/crawlery ZAWSZE widzą polską wersję
//      (żeby Google nie traktował / jako duplikatu /en/).
//   4) Brak nagłówka Accept-Language = domyślnie polska
//      (bezpieczne dla prostych klientów i narzędzi).
//   5) Polski → polska, pozostałe → angielska.
//   6) URL w przeglądarce zostaje `/` (rewrite), treść pochodzi z `/en/`.

// Mapowanie: polski URL → odpowiednik angielski.
const EN_EQUIVALENTS: Record<string, string> = {
  '/': '/en/',
  '/polityka-prywatnosci/': '/en/privacy-policy/',
  '/usun-dane/': '/en/remove-data/',
};

// Wykrywanie botów/crawlerów - dla nich serwujemy zawsze polską wersję.
// Dzięki temu Google indeksuje PL jako kanoniczną wersję pod `/`.
const BOT_PATTERN = /bot|spider|crawler|facebookexternalhit|preview|slurp|bingpreview|whatsapp|telegram|discord/i;

interface PagesContext {
  request: Request;
  next: () => Promise<Response>;
  env: {
    // ASSETS to specjalny binding Cloudflare Pages - czyta pliki z build output
    // (tutaj: `dist/`) bez ponownego przechodzenia przez middleware.
    ASSETS: Fetcher;
  };
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const url = new URL(context.request.url);

  // Normalizacja - upewnij się że path kończy się `/`.
  let pathname = url.pathname;
  if (pathname !== '' && !pathname.endsWith('/')) {
    pathname = pathname + '/';
  }

  // 1) Już w wersji angielskiej - nie ruszamy.
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return context.next();
  }

  // 2) Nie ma angielskiego odpowiednika - nie ruszamy.
  if (!(pathname in EN_EQUIVALENTS)) {
    return context.next();
  }

  // 3) Boty/crawlery - zawsze polska wersja.
  const userAgent = (context.request.headers.get('user-agent') || '').toLowerCase();
  if (BOT_PATTERN.test(userAgent)) {
    return context.next();
  }

  // 4) Brak nagłówka Accept-Language - domyślnie polska.
  const acceptLang = context.request.headers.get('accept-language');
  if (!acceptLang) {
    return context.next();
  }

  // 5) Sprawdzamy język z nagłówka.
  const prefersPolish = acceptLang
    .toLowerCase()
    .split(',')
    .some((part) => {
      const lang = part.split(';')[0].trim();
      return lang === 'pl' || lang.startsWith('pl-');
    });

  // 6) Polacy → polska wersja.
  if (prefersPolish) return context.next();

  // Pozostałe języki → EN (rewrite - URL zostaje `/`, treść z `/en/`).
  // ASSETS.fetch() czyta z build output (dist/) bez ponownego middleware,
  // więc nie ma ryzyka nieskończonej pętli.
  const enUrl = new URL(context.request.url);
  enUrl.pathname = EN_EQUIVALENTS[pathname];

  const enRequest = new Request(enUrl.toString(), {
    method: context.request.method,
    headers: context.request.headers,
  });

  return context.env.ASSETS.fetch(enRequest);
};
