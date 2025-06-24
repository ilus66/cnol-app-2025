-- Table des exposants
CREATE TABLE exposants (
  id serial PRIMARY KEY,
  nom varchar(255) NOT NULL,
  email_responsable varchar(255) NOT NULL,
  logo_url text,
  slogan varchar(255),
  site varchar(255),
  message_accueil text,
  description text,
  facebook varchar(255),
  linkedin varchar(255),
  instagram varchar(255),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Table du staff exposant
CREATE TABLE staff_exposant (
  id serial PRIMARY KEY,
  exposant_id integer REFERENCES exposants(id) ON DELETE CASCADE,
  nom varchar(255) NOT NULL,
  prenom varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  fonction varchar(255),
  badge_code varchar(255) UNIQUE,
  espace_staff_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- (Optionnel) Table users pour gestion des rôles
-- CREATE TABLE users (
--   id serial PRIMARY KEY,
--   email varchar(255) UNIQUE NOT NULL,
--   password_hash text,
--   role varchar(50) NOT NULL, -- admin, exposant, staff
--   exposant_id integer REFERENCES exposants(id),
--   staff_id integer REFERENCES staff_exposant(id),
--   created_at timestamp DEFAULT now()
-- ); 