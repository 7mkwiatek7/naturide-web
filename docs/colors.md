# Kolory projektu Naturide

Cheat sheet z paletą i miejscami użycia. Wszystkie kolory pochodzą z `tailwind.config.mjs`.

## Palety brandowe

| Paleta | Odcienie | Przeznaczenie |
|---|---|---|
| `forest` | 50–950 | **Zieleń** – kolor główny (CTA, ciemne tła, linki, obramowania) |
| `sand` | 50–900 | **Ciepły beż** – kolor akcentowy (tekst na ciemnym, jasne przyciski, tła jasne) |

Nie ma tu żadnych "Tailwindowych" `gray-*`, `slate-*`, `red-*` – wszystko brandowe.

## Definicje kolorów

`tailwind.config.mjs` → `theme.extend.colors`:

- **forest**: 50 (#f1f7f0) → 950 (#0f1f0e), kolejno jaśniejsze i ciemniejsze zielenie
- **sand**: 50 (#fbf9f4) → 900 (#5a4127), kolejno jaśniejsze i ciemniejsze beże

## Mechanizm jasny / ciemny (Tryb dzień / noc)

Cały projekt trzyma się jednej zasady:

- **Tryb jasny** → "las za dnia": jasne tła (`sand-50`), ciemne teksty (`forest-700`, `forest-900`)
- **Tryb ciemny** → "noc w lesie": ciemne tła (`forest-700` do `forest-950`), jasne teksty (`sand-50`, `sand-100`, `sand-200`)

Przełącznik motywu działa przez klasę `.dark` na `<html>` (Tailwind `darkMode: 'class'`).

## Użycie per sekcja

| Sekcja | Tło (light → dark) | Tekst (light → dark) | Gdzie plik |
|---|---|---|---|
| **Header** (pasek górny) | `bg-sand-50/80` → `dark:bg-forest-900/80` | `text-forest-700` → `dark:text-sand-100` | `src/components/Header.astro` |
| **Hero** (pierwsza sekcja) | nocne zdjęcie + overlay `forest-950` (zawsze ciemne) | zawsze jasne: `text-sand-50/100/200` | `src/components/Hero.astro` |
| **Screens** (zrzuty ekranu) | gradient `from-sand-50 to-forest-50` → `dark:from-forest-950 dark:to-forest-900` | `text-forest-900` → `dark:text-sand-50` | `src/components/Screens.astro` |
| **Features** (karty) | `bg-sand-50` → `dark:bg-forest-900` | `text-forest-900` → `dark:text-sand-50` | `src/components/Features.astro` |
| **ComingSoon** (formularz powiadomienia) | `bg-forest-700` → `dark:bg-forest-950` | `text-sand-50/100` | `src/components/ComingSoon.astro` |
| **Footer** (stopka kontakt) | `bg-forest-900` → `dark:bg-forest-950` | `text-sand-100/200/300/400` | `src/components/Footer.astro` |
| **Polityka prywatności** | `bg-sand-50` → `dark:bg-forest-900` | `text-forest-900` → `dark:text-sand-50` | `src/pages/polityka-prywatnosci.astro` i `src/pages/en/privacy-policy.astro` |
| **Strona usuwania danych** | `bg-sand-50` → `dark:bg-forest-900` | `text-forest-900` → `dark:text-sand-50` | `src/components/RemoveForm.astro` |

## Kolor bazowy body i media

W `src/styles/global.css` ⇒ `@layer base`:

```css
body {
  background-color: #fbf9f4;  /* sand-50 */
  color: #223a20;              /* forest-900 */
}
.dark body {
  background-color: #223a20;   /* forest-900 */
  color: #fbf9f4;              /* sand-50 */
}
```

Tego NIE ruszaj, chyba że świadomie zmieniasz "kolor bazowy strony".

## Globale klasy w `global.css`

- **`.btn-primary`** – zielony przycisk CTA: `bg-forest-600 text-white hover:bg-forest-700`
- **`.btn-secondary`** – obramowany: `border-forest-600 text-forest-700 dark:border-sand-300 dark:text-sand-100`
- **`.badge`** – zielona pill: `bg-forest-100 text-forest-700 dark:bg-forest-800 dark:text-sand-100`
- **`.container-narrow`** / **`.container-wide`** – kontenery (nie kolory)

## Co gdzie zmieniać

| Chcesz zmienić... | Edytuj... |
|---|---|
| Odcień zieleni w całej aplikacji | `tailwind.config.mjs` → `forest` |
| Odcień beżu w całej aplikacji | `tailwind.config.mjs` → `sand` |
| Kolor bazowy (tło body, tekst body) | `src/styles/global.css` → `@layer base` |
| Kolor tła jednej sekcji | odpowiedni komponent w `src/components/` |
| Kolor tekstu w jednej sekcji | odpowiedni komponent w `src/components/` |
| Przycisk CTA w całej aplikacji | `src/styles/global.css` → `.btn-primary` |
| Badge pill | `src/styles/global.css` → `.badge` |

## Częste pułapki

1. **Nie używaj `gray-*` ani `slate-*`** – nie ma ich w `tailwind.config.mjs`, więc klasa `bg-gray-200` po prostu nie zadziała. Użyj `sand-*` zamiast szarego.
2. **Nie hardcode kolorów** – zawsze przez klasy Tailwinda. Wyjątek: `src/styles/global.css` (gdzie są jawne kolory) i schemat JSON-LD.
3. **Tryb ciemny wymaga wariantu `dark:`** – klasa bez `dark:` w dark mode zostaje taka jak w light. Pamiętaj o `dark:bg-*`, `dark:text-*` itd. dla każdego elementu.
4. **`@apply` w `global.css`** – używaj tylko dla klas, które są faktycznie w markup-ie. PostCSS ostrzega jeśli klasa jest używana tylko przez `@apply` w tym samym pliku.
