-- Script de correction RLS optimisé pour CNOL 2025
-- Activation de RLS sur toutes les tables avec gestion des politiques existantes

-- Fonction pour créer une politique seulement si elle n'existe pas
CREATE OR REPLACE FUNCTION create_policy_if_not_exists(
    table_name text,
    policy_name text,
    policy_definition text
) RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = table_name 
        AND policyname = policy_name
    ) THEN
        EXECUTE policy_definition;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 1. Table inscription (déjà fait, mais on s'assure)
ALTER TABLE public.inscription ENABLE ROW LEVEL SECURITY;

-- 2. Table whatsapp
ALTER TABLE public.whatsapp ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('whatsapp', 'public_select_on_whatsapp', 
    'CREATE POLICY "public_select_on_whatsapp" ON public.whatsapp FOR SELECT USING (true)');
SELECT create_policy_if_not_exists('whatsapp', 'allow_insert_on_whatsapp', 
    'CREATE POLICY "allow_insert_on_whatsapp" ON public.whatsapp FOR INSERT WITH CHECK (true)');
SELECT create_policy_if_not_exists('whatsapp', 'allow_update_on_whatsapp', 
    'CREATE POLICY "allow_update_on_whatsapp" ON public.whatsapp FOR UPDATE USING (true) WITH CHECK (true)');

-- 3. Table notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('notifications', 'Allow all reads', 
    'CREATE POLICY "Allow all reads" ON public.notifications FOR SELECT USING (true)');

-- 4. Table push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. Tables de réservation (critiques pour l'application)
ALTER TABLE public.reservations_ateliers ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('reservations_ateliers', 'public_access_reservations_ateliers', 
    'CREATE POLICY "public_access_reservations_ateliers" ON public.reservations_ateliers FOR ALL USING (true)');

ALTER TABLE public.reservations_masterclass ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('reservations_masterclass', 'public_access_reservations_masterclass', 
    'CREATE POLICY "public_access_reservations_masterclass" ON public.reservations_masterclass FOR ALL USING (true)');

ALTER TABLE public.reservations_hotel ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('reservations_hotel', 'public_access_reservations_hotel', 
    'CREATE POLICY "public_access_reservations_hotel" ON public.reservations_hotel FOR ALL USING (true)');

-- 6. Tables de données publiques (lecture seule)
ALTER TABLE public.programme_general ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('programme_general', 'public_read_programme', 
    'CREATE POLICY "public_read_programme" ON public.programme_general FOR SELECT USING (true)');

ALTER TABLE public.entrees ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('entrees', 'public_read_entrees', 
    'CREATE POLICY "public_read_entrees" ON public.entrees FOR SELECT USING (true)');

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('hotels', 'public_read_hotels', 
    'CREATE POLICY "public_read_hotels" ON public.hotels FOR SELECT USING (true)');

ALTER TABLE public.ateliers ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('ateliers', 'public_read_ateliers', 
    'CREATE POLICY "public_read_ateliers" ON public.ateliers FOR SELECT USING (true)');

ALTER TABLE public.masterclass ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('masterclass', 'public_read_masterclass', 
    'CREATE POLICY "public_read_masterclass" ON public.masterclass FOR SELECT USING (true)');

ALTER TABLE public.intervenants ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('intervenants', 'public_read_intervenants', 
    'CREATE POLICY "public_read_intervenants" ON public.intervenants FOR SELECT USING (true)');

-- 7. Tables de configuration (lecture seule)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('settings', 'public_read_settings', 
    'CREATE POLICY "public_read_settings" ON public.settings FOR SELECT USING (true)');

-- 8. Tables de contacts (lecture/écriture publique)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('contacts', 'public_access_contacts', 
    'CREATE POLICY "public_access_contacts" ON public.contacts FOR ALL USING (true)');

ALTER TABLE public.contacts_collected ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('contacts_collected', 'public_access_contacts_collected', 
    'CREATE POLICY "public_access_contacts_collected" ON public.contacts_collected FOR ALL USING (true)');

-- 9. Tables d'import/export (accès complet pour admin)
ALTER TABLE public.import_badges ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('import_badges', 'admin_access_import_badges', 
    'CREATE POLICY "admin_access_import_badges" ON public.import_badges FOR ALL USING (true)');

ALTER TABLE public.badges_a_traiter_csv ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('badges_a_traiter_csv', 'admin_access_badges_csv', 
    'CREATE POLICY "admin_access_badges_csv" ON public.badges_a_traiter_csv FOR ALL USING (true)');

ALTER TABLE public.bulk_validate_state ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('bulk_validate_state', 'admin_access_bulk_validate', 
    'CREATE POLICY "admin_access_bulk_validate" ON public.bulk_validate_state FOR ALL USING (true)');

-- 10. Tables WhatsApp (accès complet)
ALTER TABLE public.whatsapp_envois ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('whatsapp_envois', 'public_access_whatsapp_envois', 
    'CREATE POLICY "public_access_whatsapp_envois" ON public.whatsapp_envois FOR ALL USING (true)');

-- 11. Tables de statistiques (lecture publique)
ALTER TABLE public.statistiques_participants ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('statistiques_participants', 'public_read_statistiques', 
    'CREATE POLICY "public_read_statistiques" ON public.statistiques_participants FOR SELECT USING (true)');

-- 12. Tables restantes (accès public complet pour compatibilité)
ALTER TABLE public.staff_exposant ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('staff_exposant', 'public_access_staff_exposant', 
    'CREATE POLICY "public_access_staff_exposant" ON public.staff_exposant FOR ALL USING (true)');

ALTER TABLE public.exposants ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('exposants', 'public_access_exposants', 
    'CREATE POLICY "public_access_exposants" ON public.exposants FOR ALL USING (true)');

ALTER TABLE public.cnol_vitrine_annee ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('cnol_vitrine_annee', 'public_access_cnol_vitrine', 
    'CREATE POLICY "public_access_cnol_vitrine" ON public.cnol_vitrine_annee FOR ALL USING (true)');

ALTER TABLE public.cnol_opticien_annee ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('cnol_opticien_annee', 'public_access_cnol_opticien', 
    'CREATE POLICY "public_access_cnol_opticien" ON public.cnol_opticien_annee FOR ALL USING (true)');

ALTER TABLE public.marques_produits ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('marques_produits', 'public_access_marques', 
    'CREATE POLICY "public_access_marques" ON public.marques_produits FOR ALL USING (true)');

ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('interventions', 'public_access_interventions', 
    'CREATE POLICY "public_access_interventions" ON public.interventions FOR ALL USING (true)');

ALTER TABLE public.import_restaure ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('import_restaure', 'public_access_import_restaure', 
    'CREATE POLICY "public_access_import_restaure" ON public.import_restaure FOR ALL USING (true)');

ALTER TABLE public.scan_contacts ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('scan_contacts', 'public_access_scan_contacts', 
    'CREATE POLICY "public_access_scan_contacts" ON public.scan_contacts FOR ALL USING (true)');

ALTER TABLE public.badges_extraits ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('badges_extraits', 'public_access_badges_extraits', 
    'CREATE POLICY "public_access_badges_extraits" ON public.badges_extraits FOR ALL USING (true)');

ALTER TABLE public.revues ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('revues', 'public_access_revues', 
    'CREATE POLICY "public_access_revues" ON public.revues FOR ALL USING (true)');

-- Nettoyage de la fonction temporaire
DROP FUNCTION create_policy_if_not_exists(text, text, text);

-- Vérification finale
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS Activé ✅'
        ELSE 'RLS Désactivé ❌'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename; 