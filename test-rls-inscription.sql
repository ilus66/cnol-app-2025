-- Test RLS sur table inscription uniquement
-- À exécuter en premier pour vérifier que tout fonctionne

-- 1. Activer RLS sur inscription
ALTER TABLE public.inscription ENABLE ROW LEVEL SECURITY;

-- 2. Créer les politiques nécessaires
CREATE POLICY "public_select_on_inscription" ON public.inscription
    FOR SELECT USING (true);

CREATE POLICY "allow_insert_on_inscription" ON public.inscription
    FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_update_on_inscription" ON public.inscription
    FOR UPDATE USING (true) WITH CHECK (true);

-- 3. Vérifier que RLS est activé
SELECT 
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS Activé ✅'
        ELSE 'RLS Désactivé ❌'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'inscription'; 