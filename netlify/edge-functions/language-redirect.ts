import type { Context } from "https://edge.netlify.com";

// Mapowanie polskich URL-i (bez prefiksu) na ich angielskie odpowiedniki.
const EN_EQUIVALENTS: Record<string, string> = {
  "/": "/en/",
  "/polityka-prywatnosci/": "/en/privacy-policy/",
};

// Wykrywanie botów/crawlerów - dla nich ZAWSZE serwujemy polską wersję,
// żeby Google nie widział zduplikowanej treści pod dwoma URL-ami.
const BOT_PATTERN = /bot|spider|crawler|facebookexternalhit|preview|slurp|bingpreview|whatsapp|telegram|discord/i;

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const pathname = url.pathname.endsWith("/") || url.pathname === ""
    ? url.pathname
    : url.pathname + "/";

  // 1) Nie ruszamy URL-i w wersji angielskiej.
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return;
  }

  // 2) Jeśli URL nie ma angielskiego odpowiednika, nie ruszamy.
  if (!(pathname in EN_EQUIVALENTS)) {
    return;
  }

  // 3) Boty/crawlery → zawsze polska wersja (żeby Google indeksował / jako PL).
  const userAgent = (request.headers.get("user-agent") || "").toLowerCase();
  if (BOT_PATTERN.test(userAgent)) {
    return;
  }

  // 4) Brak nagłówka Accept-Language = bot albo narzędzie.
  // Domyślnie serwujemy polską wersję - bezpieczne dla crawlera.
  const acceptLang = request.headers.get("accept-language");
  if (!acceptLang) {
    return;
  }

  // 5) Sprawdzamy język z nagłówka przeglądarki.
  const prefersPolish = acceptLang
    .toLowerCase()
    .split(",")
    .some((part) => {
      const lang = part.split(";")[0].trim();
      return lang === "pl" || lang.startsWith("pl-");
    });

  // 6) Polacy zostają na polskiej wersji. Pozostali dostają EN.
  if (prefersPolish) return;

  // Przepisz (rewrite - URL w przeglądarce zostaje /, ale treść serwowana z /en/).
  return context.rewrite(EN_EQUIVALENTS[pathname]);
};
