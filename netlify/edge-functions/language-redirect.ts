import type { Context } from "https://edge.netlify.com";

// Mapowanie polskich URL-i (bez prefiksu) na ich angielskie odpowiedniki.
const EN_EQUIVALENTS: Record<string, string> = {
  "/": "/en/",
  "/polityka-prywatnosci/": "/en/privacy-policy/",
};

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const pathname = url.pathname.endsWith("/") || url.pathname === ""
    ? url.pathname
    : url.pathname + "/";

  // 1) Nie ruszamy URL-i w wersji angielskiej - user już wybrał EN.
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return; // przepuść bez zmian
  }

  // 2) Jeśli URL nie ma angielskiego odpowiednika, nie ruszamy.
  if (!(pathname in EN_EQUIVALENTS)) {
    return;
  }

  // 3) Sprawdzamy nagłówek Accept-Language z przeglądarki/urządzenia.
  const acceptLang = request.headers.get("accept-language") || "";
  const prefersPolish = acceptLang
    .toLowerCase()
    .split(",")
    .some((part) => {
      const lang = part.split(";")[0].trim();
      return lang === "pl" || lang.startsWith("pl-");
    });

  // 4) Polacy zostają na polskiej wersji. Pozostali dostają EN.
  if (prefersPolish) return;

  // Przepisz (rewrite - URL w przeglądarce zostaje /, ale treść serwowana z /en/).
  return context.rewrite(EN_EQUIVALENTS[pathname]);
};
