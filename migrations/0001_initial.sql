-- Schemat bazy D1 dla formularza zapisów Naturide.
-- Jedna tabela: notify_subscribers.
--
-- Jak uruchomić (po stworzeniu bazy w dashboardzie Cloudflare):
--   wrangler d1 execute naturide-subscribers --file=migrations/0001_initial.sql --remote
--
-- Lokalnie (wrangler dev):
--   wrangler d1 execute naturide-subscribers --file=migrations/0001_initial.sql

CREATE TABLE IF NOT EXISTS notify_subscribers (
  -- Unikalny identyfikator (unikatowy dla każdego zapisu).
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Adres email - zawsze lowercase, bez spacji.
  email TEXT NOT NULL UNIQUE,

  -- Język przeglądarki użytkownika ('pl' albo 'en'), do późniejszej segmentacji.
  lang TEXT NOT NULL DEFAULT 'pl',

  -- IP użytkownika (z nagłówka cf-connecting-ip).
  -- NULL nie jest dozwolone przez CHECK, więc domyślnie '' (pusty string).
  ip_address TEXT NOT NULL DEFAULT '',

  -- User agent - do wykrywania spamu jeśli kiedyś trzeba będzie.
  user_agent TEXT NOT NULL DEFAULT '',

  -- Kiedy się zapisał - format ISO 8601.
  created_at TEXT NOT NULL
);

-- Indeks po email - już UNIQUE automatycznie tworzy indeks w SQLite.
-- Indeks po dacie przydaje się do sortowania (np. nowi subskrybenci na górze).
CREATE INDEX IF NOT EXISTS idx_notify_created_at ON notify_subscribers (created_at DESC);
