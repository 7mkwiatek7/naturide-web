# Naturide Web

Strona wizytówkowa aplikacji mobilnej Naturide (nawigacja rowerowa i planner tras offline).

## Stack

- [Astro 4](https://astro.build) - statyczny HTML, świetne SEO
- [Tailwind CSS 3](https://tailwindcss.com) - utility-first styling
- [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) - automatyczna mapa strony
- TypeScript

## Struktura

```
naturide-web/
├── src/
│   ├── components/      # Sekcje strony (Hero, Features, Screens, FAQ, ...)
│   ├── i18n/            # Tłumaczenia PL/EN
│   ├── layouts/         # BaseLayout (HTML shell, SEO, meta)
│   ├── pages/
│   │   ├── pl/          # Polska wersja + polityka prywatności
│   │   └── en/          # Angielska wersja + privacy policy
│   └── styles/          # Globalne style Tailwind
├── public/
│   ├── images/          # Logo, screeny, OpenGraph
│   ├── _redirects       # Reguły Netlify
│   └── robots.txt
├── astro.config.mjs
├── tailwind.config.mjs
├── netlify.toml
├── package.json
└── tsconfig.json
```

## Jak zacząć

1. **Pierwsze uruchomienie lokalnie** - zobacz [`LOCAL-SETUP.md`](./LOCAL-SETUP.md)
2. **Deploy na Netlify** - zobacz [`NETLIFY-DEPLOY.md`](./NETLIFY-DEPLOY.md)

## Dodawanie treści

- **Tłumaczenia** - edytuj `src/i18n/ui.ts` (klucze PL i EN są obok siebie)
- **Kolory marki** - edytuj `tailwind.config.mjs` (paleta `forest` i `sand`)
- **Screeny aplikacji** - podmień pliki w `public/images/screen-1.jpg` ... `screen-4.jpg`
- **Logo** - podmień `public/images/logo.png`

## Komendy

```bash
npm install     # instaluje zależności (raz)
npm run dev     # serwer developerski na http://localhost:4321
npm run build   # buduje wersję produkcyjną do dist/
npm run preview # podgląd wersji produkcyjnej lokalnie
```

## Licencja

Prywatny projekt - © Naturide
