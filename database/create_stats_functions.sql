-- Database functions for statistics

-- Stats by city
CREATE OR REPLACE FUNCTION get_stats_by_ville()
RETURNS TABLE(ville text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(s.ville, 'Non renseigné') as ville,
    COUNT(*) as count
  FROM statistiques_participants s
  GROUP BY COALESCE(s.ville, 'Non renseigné')
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Stats by function
CREATE OR REPLACE FUNCTION get_stats_by_fonction()
RETURNS TABLE(fonction text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(s.fonction, 'Non renseigné') as fonction,
    COUNT(*) as count
  FROM statistiques_participants s
  GROUP BY COALESCE(s.fonction, 'Non renseigné')
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Stats by day
CREATE OR REPLACE FUNCTION get_stats_by_day()
RETURNS TABLE(jour text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_char(s.date_injection, 'YYYY-MM-DD') as jour,
    COUNT(*) as count
  FROM statistiques_participants s
  GROUP BY to_char(s.date_injection, 'YYYY-MM-DD')
  ORDER BY jour;
END;
$$ LANGUAGE plpgsql;

-- Stats by week
CREATE OR REPLACE FUNCTION get_stats_by_week()
RETURNS TABLE(semaine text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_char(s.date_injection, 'IYYY-IW') as semaine,
    COUNT(*) as count
  FROM statistiques_participants s
  GROUP BY to_char(s.date_injection, 'IYYY-IW')
  ORDER BY semaine;
END;
$$ LANGUAGE plpgsql;

-- Stats by month
CREATE OR REPLACE FUNCTION get_stats_by_month()
RETURNS TABLE(mois text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_char(s.date_injection, 'YYYY-MM') as mois,
    COUNT(*) as count
  FROM statistiques_participants s
  GROUP BY to_char(s.date_injection, 'YYYY-MM')
  ORDER BY mois;
END;
$$ LANGUAGE plpgsql;

-- Exhibitors ranking
CREATE OR REPLACE FUNCTION get_classement_exposants()
RETURNS TABLE(exposant_id bigint, nom text, prenom text, qualite_sponsoring text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.exposant_id,
    e.nom,
    e.prenom,
    e.qualite_sponsoring,
    COUNT(l.visiteur_id) as count
  FROM leads l
  JOIN exposants e ON l.exposant_id = e.id
  GROUP BY l.exposant_id, e.nom, e.prenom, e.qualite_sponsoring
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;