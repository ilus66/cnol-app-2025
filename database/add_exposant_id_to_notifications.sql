-- Ajouter le champ exposant_id à la table notifications
ALTER TABLE notifications
ADD COLUMN exposant_id integer REFERENCES exposants(id);

-- Index pour améliorer les performances des requêtes par exposant
CREATE INDEX IF NOT EXISTS idx_notifications_exposant_id ON notifications(exposant_id); 