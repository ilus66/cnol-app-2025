import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Utilisation du client Supabase avec la clé de service pour contourner RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (req.method === 'POST') {
    console.log('POST body reçu:', req.body);
  }

  // Note: Idéalement, cette route devrait être protégée pour s'assurer 
  // que seul un utilisateur authentifié peut l'appeler.

  const badge_code = req.method === 'POST'
    ? (req.body.badge_code || req.body.code || req.body.badge)
    : req.query.badge_code;

  if (!badge_code) {
    return res.status(400).json({ message: 'Le paramètre badge_code est manquant.' });
  }

  try {
    let query = supabaseAdmin
      .from('inscription')
      .select('nom, prenom, email, telephone, fonction, ville, identifiant_badge');

    // Recherche sur identifiant_badge OU ancien_identifiant_badge
    query = query.or(`identifiant_badge.eq.${badge_code},ancien_identifiant_badge.eq.${badge_code}`);

    const { data, error } = await query.single();

    if (error || !data) {
      console.error('Erreur Supabase Admin (recherche badge):', error);
      return res.status(404).json({ message: 'Participant non trouvé.' });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error('Erreur API get-participant-by-badge:', err);
    return res.status(500).json({ message: "Erreur serveur interne." });
  }
} 