ALTER TABLE exposants
ADD COLUMN quota_push_journalier integer DEFAULT 0,
ADD COLUMN quota_push_utilise integer DEFAULT 0,
ADD COLUMN quota_push_date date; 