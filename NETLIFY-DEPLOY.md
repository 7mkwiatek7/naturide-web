# Deploy strony Naturide na Netlify

Instrukcja krok po kroku: od projektu na dysku do działającej strony na **naturide.app**.

## Część A - Wrzucenie kodu na GitHub (5 min)

### Krok 1 - Stwórz repo na GitHubie

1. Wejdź na https://github.com i zaloguj się
2. Kliknij zielony przycisk **"New"** (lub "+" → "New repository")
3. Wypełnij:
   - **Repository name:** `naturide-web`
   - **Description:** `Strona wizytówkowa aplikacji Naturide`
   - **Public** ✅ (dzięki temu Netlify darmowo deployuje)
   - **NIE zaznaczaj** "Add a README file" (mamy już pliki)
4. Kliknij **"Create repository"**

### Krok 2 - Wgraj kod z PowerShell

GitHub pokaże Ci komendy - **ale użyj tych poniżej** (są uproszczone):

Otwórz PowerShell w folderze projektu (`L:\Users\m\Projects\naturide-web`):

```powershell
git init
git add .
git commit -m "Initial commit - Naturide web"
```

Teraz podepnij swoje konto GitHub (zastąp `TWOJ-USER` swoim loginiem na GitHubie):

```powershell
git remote add origin https://github.com/TWOJ-USER/naturide-web.git
git branch -M main
git push -u origin main
```

**Co się dzieje:** przy `git push` otworzy się okno logowania GitHub. Zaloguj się (przez przeglądarkę albo token - GitHub sam podpowie).

**Sprawdź:** wejdź na https://github.com/TWOJ-USER/naturide-web - powinieneś widzieć swoje pliki.

> 💡 **Przyszłe aktualizacje:** po każdej zmianie w plikach wystarczy:
> ```powershell
> git add .
> git commit -m "opis co zmieniłem"
> git push
> ```
> Netlify automatycznie zauważy zmiany i zaktualizuje stronę.

## Część B - Podpięcie Netlify (5 min)

### Krok 3 - Załóż konto na Netlify (jeśli nie masz)

1. Wejdź na https://app.netlify.com/signup
2. **Zarejestruj się przez GitHub** (kliknij przycisk "Sign up with GitHub") - to najszybsze i bezpieczne
3. Potwierdź autoryzację

### Krok 4 - Utwórz nową stronę

1. Na dashboardzie Netlify kliknij **"Add new site"** → **"Import an existing project"**
2. Kliknij **"Deploy with GitHub"**
3. Wybierz repozytorium **naturide-web** z listy
4. Netlify pokaże ekran konfiguracji - **nic nie zmieniaj**, wszystko jest ustawione dobrze:
   - Branch to deploy: `main`
   - Build command: `npm run build` ✅
   - Publish directory: `dist` ✅
5. Kliknij **"Deploy site"**

**Co się dzieje:** Netlify pobiera Twój kod, buduje stronę (~2 minuty), publikuje ją pod losowym adresem typu `naturide-web-abc123.netlify.app`.

**Sprawdź:** kliknij w link - zobaczysz swoją stronę. 🎉

### Krok 5 - Podepnij domenę naturide.app

1. W panelu Netlify przejdź do: **Site configuration** → **Domains** (lub **Site settings** → **Domain management**)
2. Kliknij **"Add a domain"** → **"Add a domain you already own"**
3. Wpisz: `naturide.app` → kliknij **"Verify"**
4. Netlify pokaże Ci **rekordy DNS**, które musisz dodać w panelu rejestratora domeny (tam gdzie kupiłeś `naturide.app`)

**Rekordy, które dodasz u rejestratora domeny** (najczęściej 4 rekordy):

| Typ | Nazwa | Wartość |
|---|---|---|
| A | @ | `75.2.60.5` |
| CNAME | www | `<twoj-site>.netlify.app` |

> Netlify może pokazać inne IP - **wpisz dokładnie to, co Netlify Ci pokaże**, nie moje przykłady.

5. Wejdź do panelu **rejestratora domeny** (tam gdzie kupiłeś `naturide.app`):
   - Znajdź sekcję "DNS" / "Strefa DNS" / "Zarządzanie DNS"
   - Dodaj te rekordy (A i CNAME)
   - Zapisz

6. Wróć do Netlify i kliknij **"Check DNS"** - to potrwa od kilku minut do 24h (zwykle 10-30 min).

7. Gdy Netlify potwierdzi, że domena jest podpięta:
   - Automatycznie wystawi certyfikat SSL (Let's Encrypt) - **za darmo**
   - Twoja strona działa pod `https://naturide.app` 🎉

### Krok 6 - Sprawdź czy formularz "Powiadom mnie" działa

Na działającej stronie wejdź w sekcję "Powiadom mnie o premierze" i wpisz swój email testowy.

**Sprawdź czy dostałeś powiadomienie:**
1. W Netlify przejdź do: **Site overview** → **Forms** (lub **Site settings** → **Forms**)
2. Powinieneś zobaczyć formularz "notify" z Twoim wpisem

> 💡 Netlify Forms są darmowe do 100 zgłoszeń/miesiąc - dla wizytówki w zupełności wystarczy.

## Co dalej

- **Aktualizacje** - edytuj pliki lokalnie, `git push`, Netlify automatycznie deployuje
- **Sprawdzanie ruchu** - Netlify pokazuje statystyki odwiedzin
- **Dodawanie mapy w przyszłości** - kiedy będziesz gotowy, mów - dodam podstronę `/map` z MapLibre GL JS

## Najczęstsze problemy

**Build się nie powiódł ("Build failed"):**
- Sprawdź logi w Netlify (kliknij w ostatni deploy)
- Najczęstsza przyczyna: literówka w `package.json` albo brak `node_modules` w repo (mamy `.gitignore` więc to nie problem)
- Wklej mi błąd tutaj

**"Domain already exists on another Netlify site":**
- Ktoś mógł wcześniej podpiąć tę domenę. Skontaktuj się ze wsparciem Netlify - szybko to rozwiążą (kliknij "Support" w panelu).

**Strona działa pod `www.naturide.app` ale nie pod `naturide.app` (bez www):**
- W Netlify → Domains → kliknij w domenę → "Set as primary domain" - ustaw `naturide.app` jako główną

**SSL się nie wystawia:**
- Poczekaj 30-60 minut po podpięciu DNS
- W Netlify → Domains → "Verify DNS" - sprawdź status
- Jak dalej nie działa, pisz do mnie
