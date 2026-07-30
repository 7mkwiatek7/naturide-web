# Lokalne uruchomienie strony Naturide

Instrukcja krok po kroku - dla osoby, która pierwszy raz uruchamia projekt Astro.

## Co potrzebujesz

- ✅ Node.js (masz - `v24.14.1`)
- ✅ Git (masz - `v2.45.1`)
- 📁 Folder projektu (już utworzony: `L:\Users\m\Projects\naturide-web`)

## Krok 1 - Otwórz PowerShell w folderze projektu

1. Otwórz **Eksplorator plików** (Win + E)
2. Przejdź do `L:\Users\m\Projects\naturide-web`
3. Kliknij w pasek adresu na górze
4. Wpisz `powershell` i naciśnij Enter

Otworzy się okno PowerShell **już w tym folderze**. Będzie to wyglądać mniej więcej tak:

```
PS L:\Users\m\Projects\naturide-web>
```

## Krok 2 - Zainstaluj zależności

Wklej tę komendę i naciśnij Enter:

```powershell
npm install
```

**Co się dzieje:** Node.js pobiera z internetu paczki potrzebne do budowania strony (Astro, Tailwind itd.). Trwa 1-3 minuty. Na końcu zobaczysz coś w stylu `added 200 packages`.

**Jeśli wypluje błąd:** skopiuj błąd i wklej mi tutaj - pomogę.

## Krok 3 - Uruchom serwer developerski

```powershell
npm run dev
```

**Co się dzieje:** Astro startuje lokalny serwer. Po chwili zobaczysz:

```
  🚀 astro  v4.16.18 started
  ┃ Local    http://localhost:4321/
  ┃ Network  use --host to expose
```

## Krok 4 - Otwórz stronę w przeglądarce

1. Otwórz przeglądarkę (Chrome, Firefox, cokolwiek)
2. Wpisz w pasek adresu: **http://localhost:4321/pl/**
3. Powinieneś zobaczyć stronę Naturide po polsku
4. Wpisz **http://localhost:4321/en/** - wersja angielska

## Krok 5 - Co dalej

- **Edycja plików** - jak zmienisz cokolwiek w folderze `src/`, strona automatycznie się przeładuje w przeglądarce. To jest ten moment, w którym "widzisz efekty na żywo".
- **Dodawanie zdjęć** - wrzuć swoje screeny aplikacji do `public/images/` pod nazwami `screen-1.jpg`, `screen-2.jpg`, `screen-3.jpg`, `screen-4.jpg`. Logo do `public/images/logo.png`.
- **Edycja tekstów** - wszystkie teksty PL/EN są w pliku `src/i18n/ui.ts`. Otwórz go w dowolnym edytorze tekstu (polecam [VS Code](https://code.visualstudio.com/) - darmowy).

## Zatrzymywanie serwera

W oknie PowerShell naciśnij **Ctrl + C** - serwer się zatrzyma.

## Najczęstsze problemy

**"npm nie jest rozpoznane"** - Node.js nie jest zainstalowany lub PowerShell go nie widzi. Sprawdź `node --version`. Jeśli dalej nie działa, zrestartuj PowerShell po instalacji Node.js.

**"Port 4321 already in use"** - coś innego zajmuje ten port. Zatrzymaj tamten proces albo uruchom na innym: `npm run dev -- --port 3000`.

**"Cannot find module 'astro'"** - znaczy, że nie zainstalowały się zależności. Wróć do Kroku 2.

**Strona wyświetla błąd w przeglądarce** - sprawdź okno PowerShell, tam będą szczegóły błędu. Skopiuj i wklej mi.

## Gdy strona działa lokalnie

Idź do pliku `NETLIFY-DEPLOY.md` - tam jest krok po kroku, jak wrzucić stronę na internet pod domenę `naturide.app`.
