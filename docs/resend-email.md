# Resend - konfiguracja powiadomień

Formularz zapisuje adres testera w bazie D1, a powiadomienie o nowym zgłoszeniu wysyła przez Resend. Wiadomość jest nadawana z `testy@naturide.app`, trafia do `mkwiatek.dev@gmail.com`, a odpowiedź z Gmaila kierowana jest na adres testera.

## Konfiguracja Resend

1. Utwórz konto na [resend.com](https://resend.com/).
2. W panelu Resend otwórz **Domains → Add Domain** i dodaj `naturide.app`.
3. Resend pokaże rekordy DNS do weryfikacji domeny. Dodaj je w Cloudflare → `naturide.app` → **DNS → Records**, przepisując dokładnie nazwy i wartości podane przez Resend.
   - Nie usuwaj istniejących rekordów DNS.
   - Jeśli istnieje już rekord SPF, nie twórz drugiego; połącz podane wartości SPF zgodnie z instrukcją Resend.
   - Po dodaniu wróć do Resend i poczekaj, aż domena otrzyma status **Verified**.
4. W Resend przejdź do **API Keys → Create API Key**. Ustaw uprawnienie **Sending access** i ogranicz klucz do `naturide.app`. Skopiuj go od razu — później nie będzie można go ponownie wyświetlić.
5. W Cloudflare otwórz **Workers & Pages → naturide-web → Settings → Variables and Secrets**. W środowisku **Production** dodaj zaszyfrowany secret `RESEND_API_KEY` z wartością skopiowaną z Resend.

Klucza API nie wklejaj do kodu, zwykłych zmiennych ani rozmowy.

## Koszt

Aktualny plan Resend Free obejmuje do 3 000 e-maili miesięcznie i maksymalnie 100 dziennie. Szczegóły mogą się zmienić — sprawdź [aktualny cennik Resend](https://resend.com/pricing).

## Wdrożenie i sprawdzenie

Po dodaniu sekretu wdroż kod z repozytorium. `https://naturide.app/api/debug` pokaże jedynie, czy `RESEND_API_KEY` jest skonfigurowany; nie wysyła testowej wiadomości. Następnie wyślij jedno próbne zgłoszenie i sprawdź skrzynkę oraz folder spam.

Usuń stare sekrety `WEB3FORMS_ACCESS_KEY`, `CLOUDFLARE_ACCOUNT_ID` i `CLOUDFLARE_EMAIL_API_TOKEN` z ustawień Pages dopiero po potwierdzeniu, że powiadomienie dotarło przez Resend.
