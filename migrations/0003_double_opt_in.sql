-- Double opt-in dla nowych zgłoszeń do testów.
-- Istniejące wpisy są już potwierdzone, bo wcześniej otrzymały powiadomienie.
--
-- Uruchom jednorazowo na zdalnej bazie przed wdrożeniem nowej funkcji:
--   npx wrangler d1 execute naturide-subscribers --file=migrations/0003_double_opt_in.sql --remote

ALTER TABLE notify_subscribers
  ADD COLUMN confirmation_status TEXT NOT NULL DEFAULT 'confirmed'
  CHECK (confirmation_status IN ('pending', 'confirmed'));

ALTER TABLE notify_subscribers
  ADD COLUMN confirmation_token_hash TEXT;

ALTER TABLE notify_subscribers
  ADD COLUMN confirmation_expires_at TEXT;

ALTER TABLE notify_subscribers
  ADD COLUMN confirmation_last_sent_at TEXT;

ALTER TABLE notify_subscribers
  ADD COLUMN confirmed_at TEXT;

UPDATE notify_subscribers
SET confirmed_at = created_at
WHERE confirmation_status = 'confirmed'
  AND confirmed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notify_confirmation_token
  ON notify_subscribers (confirmation_token_hash);
