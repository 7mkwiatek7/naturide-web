-- Uruchom jednorazowo na istniejącej bazie przed wdrożeniem funkcji
-- korzystających ze statusu powiadomień:
--   npx wrangler d1 execute naturide-subscribers --file=migrations/0002_notification_status.sql --remote

ALTER TABLE notify_subscribers
  ADD COLUMN notification_status TEXT NOT NULL DEFAULT 'unknown'
  CHECK (notification_status IN ('unknown', 'pending', 'sent', 'failed'));

ALTER TABLE notify_subscribers
  ADD COLUMN notification_last_attempt_at TEXT;
