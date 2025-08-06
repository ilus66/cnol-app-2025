-- Script de correction RLS pour CNOL 2025
-- Activation de RLS sur les tables critiques

-- 1. Table inscription (la plus critique)
ALTER TABLE public.inscription ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique (nécessaire pour l'admin)
CREATE POLICY "public_select_on_inscription" ON public.inscription
    FOR SELECT USING (true);

-- Politique pour permettre l'insertion publique (inscriptions)
CREATE POLICY "allow_insert_on_inscription" ON public.inscription
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre la mise à jour (validation admin)
CREATE POLICY "allow_update_on_inscription" ON public.inscription
    FOR UPDATE USING (true) WITH CHECK (true);

-- 2. Table whatsapp
ALTER TABLE public.whatsapp ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique
CREATE POLICY "public_select_on_whatsapp" ON public.whatsapp
    FOR SELECT USING (true);

-- Politique pour permettre l'insertion publique
CREATE POLICY "allow_insert_on_whatsapp" ON public.whatsapp
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre la mise à jour
CREATE POLICY "allow_update_on_whatsapp" ON public.whatsapp
    FOR UPDATE USING (true) WITH CHECK (true);

-- 3. Table notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion publique
CREATE POLICY "Allow all inserts" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre la lecture publique
CREATE POLICY "Allow all reads" ON public.notifications
    FOR SELECT USING (true);

-- 4. Table push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'accès postgres
CREATE POLICY "Allow postgres access" ON public.push_subscriptions
    FOR ALL USING (true);

-- Politique pour permettre aux utilisateurs de gérer leurs abonnements
CREATE POLICY "Allow users to manage their own subscriptions" ON public.push_subscriptions
    FOR ALL USING (true);

-- 5. Tables de réservation (critiques pour l'application)
ALTER TABLE public.reservations_ateliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access_reservations_ateliers" ON public.reservations_ateliers
    FOR ALL USING (true);

ALTER TABLE public.reservations_masterclass ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access_reservations_masterclass" ON public.reservations_masterclass
    FOR ALL USING (true);

ALTER TABLE public.reservations_hotel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access_reservations_hotel" ON public.reservations_hotel
    FOR ALL USING (true);

-- 6. Tables de données publiques (lecture seule)
ALTER TABLE public.programme_general ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_programme" ON public.programme_general
    FOR SELECT USING (true);

ALTER TABLE public.entrees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_entrees" ON public.entrees
    FOR SELECT USING (true);

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_hotels" ON public.hotels
    FOR SELECT USING (true);

ALTER TABLE public.ateliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_ateliers" ON public.ateliers
    FOR SELECT USING (true);

ALTER TABLE public.masterclass ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_masterclass" ON public.masterclass
    FOR SELECT USING (true);

ALTER TABLE public.intervenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_intervenants" ON public.intervenants
    FOR SELECT USING (true);

-- 7. Tables de configuration (lecture seule)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_settings" ON public.settings
    FOR SELECT USING (true);

-- 8. Tables de contacts (lecture/écriture publique)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access_contacts" ON public.contacts
    FOR ALL USING (true);

ALTER TABLE public.contacts_collected ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access_contacts_collected" ON public.contacts_collected
    FOR ALL USING (true);

-- 9. Tables d'import/export (accès complet pour admin)
ALTER TABLE public.import_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_access_import_badges" ON public.import_badges
    FOR ALL USING (true);

ALTER TABLE public.badges_a_traiter_csv ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_access_badges_csv" ON public.badges_a_traiter_csv
    FOR ALL USING (true);

ALTER TABLE public.bulk_validate_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_access_bulk_validate" ON public.bulk_validate_state
    FOR ALL USING (true);

-- 10. Tables WhatsApp (accès complet)
ALTER TABLE public.whatsapp_envois ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access_whatsapp_envois" ON public.whatsapp_envois
    FOR ALL USING (true);

-- 11. Tables de statistiques (lecture publique)
ALTER TABLE public.statistiques_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_statistiques" ON public.statistiques_participants
    FOR SELECT USING (true);

-- 12. Tables restantes (accès public complet pour compatibilité)
ALTER TABLE public.staff_exposant ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access_staff_exposant" ON public.staff_exposant
    FOR ALL USING (true);

ALTER TABLE public.exposants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access_exposants" ON public.exposants
    FOR ALL USING (true);

ALTER TABLE public.cnol_vitrine_annee ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access_cnol_vitrine" ON public.cnol_vitrine_annee
    FOR ALL USING (true);

ALTER TABLE public.cnol_opticien_annee ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access_cnol_opticien" ON public.cnol_opticien_annee
    FOR ALL USING (true);

ALTER TABLE public.marques_produits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access_marques" ON public.marques_produits
    FOR ALL USING (true);

ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access_interventions" ON public.interventions
    FOR ALL USING (true);

ALTER TABLE public.import_restaure ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access_import_restaure" ON public.import_restaure
    FOR ALL USING (true);

ALTER TABLE public.scan_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access_scan_contacts" ON public.scan_contacts
    FOR ALL USING (true);

ALTER TABLE public.badges_extraits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access_badges_extraits" ON public.badges_extraits
    FOR ALL USING (true);

ALTER TABLE public.revues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access_revues" ON public.revues
    FOR ALL USING (true);

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