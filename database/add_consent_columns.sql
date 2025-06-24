ALTER TABLE inscription
ADD COLUMN consent_notifications boolean DEFAULT false,
ADD COLUMN consent_emails boolean DEFAULT false,
ADD COLUMN consent_partners boolean DEFAULT false,
ADD COLUMN consent_stats boolean DEFAULT false; 