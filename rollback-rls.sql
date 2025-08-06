-- Script de rollback RLS (en cas de problème)
-- Désactive RLS sur toutes les tables publiques

-- Désactiver RLS sur toutes les tables
ALTER TABLE public.inscription DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations_ateliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations_masterclass DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations_hotel DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.programme_general DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrees DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ateliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.masterclass DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts_collected DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges_a_traiter_csv DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_validate_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_envois DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistiques_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_exposant DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exposants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cnol_vitrine_annee DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cnol_opticien_annee DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.marques_produits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_restaure DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges_extraits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.revues DISABLE ROW LEVEL SECURITY;

-- Vérification
SELECT 
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS Activé ❌'
        ELSE 'RLS Désactivé ✅'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename; 