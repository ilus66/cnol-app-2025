ALTER TABLE reservations_ateliers
ADD COLUMN annulation_demandee boolean DEFAULT false,
ADD COLUMN annulation_validee boolean DEFAULT false,
ADD COLUMN annulation_date timestamp,
ADD COLUMN annulation_motif text;

ALTER TABLE reservations_masterclass
ADD COLUMN annulation_demandee boolean DEFAULT false,
ADD COLUMN annulation_validee boolean DEFAULT false,
ADD COLUMN annulation_date timestamp,
ADD COLUMN annulation_motif text;

-- Ajout colonne organisation pour exposant
ALTER TABLE inscription ADD COLUMN IF NOT EXISTS organisation VARCHAR(255); 