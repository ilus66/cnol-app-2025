-- Add indexes to the inscription table to improve query performance

CREATE INDEX IF NOT EXISTS idx_inscription_email ON public.inscription(email);
CREATE INDEX IF NOT EXISTS idx_inscription_nom ON public.inscription(nom);
CREATE INDEX IF NOT EXISTS idx_inscription_prenom ON public.inscription(prenom);