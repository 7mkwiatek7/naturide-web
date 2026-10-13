# Resend - konfiguracja powiadomień

Formularz zapisuje zgłoszenie w bazie D1 i wysyła przez Resend wiadomość potwierdzającą na adres testera. Powiadomienie do `mkwiatek.dev@gmail.com` jest wysyłane dopiero po kliknięciu potwierdzenia. Wiadomości są nadawane z `testy@naturide.app`.

## Konfiguracja Resend

1. Utwórz konto na [resend.com](https://resend.com/).
2. W panelu Resend otwórz **Domains → Add Domain** i dodaj `naturide.app`.
3. Resend pokaże rekordy DNS do weryfikacji domeny. Dodaj je w Cloudflare → `naturide.app` → **DNS → Records**, przepisując dokładnie nazwy i wartości podane przez Resend.
   - Nie usuwaj istniejących rekordów DNS.
   - Jeśli istnieje już rekord SPF, nie twórz drugiego; połącz podane wartości SPF zgodnie z instrukcją Resend.
   - Po dodaniu wróć do Resend i poczekaj, aż domena otrzyma status **Verified**.
4. W Resend przejdź do **API Keys → Create API Key**. Ustaw uprawnienie **Sending access** i ogranicz klucz do `naturide.app`. Skopiuj go od razu — później nie będzie można go ponownie wyświetlić.
5. W Cloudflare otwórz **Workers & Pages → naturide-web → Settings → Variables and Secrets**. W środowisku **Production** dodaj zaszyfrowany secret `RESEND_API_KEY` z wartością skopiowaną z Resend.
6. W tym samym miejscu dodaj zaszyfrowany secret `DEBUG_TOKEN` z długą, losową wartością. Służy wyłącznie do zabezpieczenia tymczasowego endpointu diagnostycznego.

Sekretów `RESEND_API_KEY` i `DEBUG_TOKEN` nie wklejaj do kodu, zwykłych zmiennych ani rozmowy.

## Koszt

Aktualny plan Resend Free obejmuje do 3 000 e-maili miesięcznie i maksymalnie 100 dziennie. Szczegóły mogą się zmienić — sprawdź [aktualny cennik Resend](https://resend.com/pricing).

## Wdrożenie i sprawdzenie

Przed wdrożeniem nowej funkcji uruchom jednorazowo migrację `migrations/0003_double_opt_in.sql` na zdalnej bazie D1. W panelu Cloudflare otwórz **Storage & databases → D1 → naturide-subscribers → Console**, wklej zawartość pliku i wykonaj ją. Migracja oznacza istniejące wpisy jako potwierdzone, aby nie zmieniać ich dotychczasowego zachowania.

Po migracji i dodaniu sekretów wdroż kod z repozytorium. Nowe zgłoszenie zapisuje się jako oczekujące, a właściciel otrzymuje powiadomienie dopiero po potwierdzeniu adresu przez użytkownika.

Endpoint diagnostyczny nie jest dostępny bez tokena. Sprawdzisz go lokalnie w PowerShellu, zastępując `TWOJ_TOKEN` wartością ustawioną w Cloudflare:

```powershell
$token = Read-Host 'DEBUG_TOKEN'
curl.exe -H ("Authorization" + ": " + "Bearer " + $token) https://naturide.app/api/debug
```

Endpoint pokazuje jedynie, czy `RESEND_API_KEY` jest skonfigurowany, czy działa binding D1 i ile jest rekordów; nie wysyła testowej wiadomości. Tokena nie umieszczaj w adresie URL, repozytorium ani rozmowie.

Następnie wyślij jedno próbne zgłoszenie, sprawdź wiadomość potwierdzającą na podanym adresie i kliknij przycisk potwierdzenia. Dopiero wtedy sprawdź powiadomienie w skrzynce zespołu oraz folder spam.

Usuń stare sekrety `WEB3FORMS_ACCESS_KEY`, `CLOUDFLARE_ACCOUNT_ID` i `CLOUDFLARE_EMAIL_API_TOKEN` z ustawień Pages dopiero po potwierdzeniu, że powiadomienie dotarło przez Resend.
