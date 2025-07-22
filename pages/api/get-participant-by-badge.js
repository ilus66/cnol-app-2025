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
    let user = null;
    let error = null;

    // 1. Check for prefixed ID
    if (badge_code.startsWith('ins_') || badge_code.startsWith('wa_')) {
      const parts = badge_code.split('_');
      const prefix = parts[0];
      const id = parts[1];
      const tableName = prefix === 'ins' ? 'inscription' : 'whatsapp';
      
      const { data, err } = await supabaseAdmin
        .from(tableName)
        .select('nom, prenom, email, telephone, fonction, ville, identifiant_badge')
        .eq('id', id)
        .single();
      
      if (data && !err) {
        user = data;
      }
      error = err;
    } else {
      // 2. Fallback for non-prefixed IDs
      // a. Check inscription table
      const { data: inscUser, error: inscError } = await supabaseAdmin
        .from('inscription')
        .select('nom, prenom, email, telephone, fonction, ville, identifiant_badge')
        .eq('identifiant_badge', badge_code)
        .single();

      if (inscUser && !inscError) {
        user = inscUser;
      } else {
        // b. Check whatsapp table
        const { data: waUser, error: waError } = await supabaseAdmin
          .from('whatsapp')
          .select('nom, prenom, email, telephone, fonction, ville, identifiant_badge')
          .eq('identifiant_badge', badge_code)
          .single();
        
        if (waUser && !waError) {
          user = waUser;
        }
      }
    }

    // 3. If still not found, check legacy formats
    if (!user) {
      // a. Chercher dans ancien_identifiant_badge
      let { data: legacyUser, error: legacyError } = await supabaseAdmin
        .from('inscription')
        .select('nom, prenom, email, telephone, fonction, ville, identifiant_badge')
        .eq('ancien_identifiant_badge', badge_code)
        .single();
      
      if (legacyUser && !legacyError) {
        user = legacyUser;
      }
    }
    
    if (!user && /^cnol2025-(\d+)$/i.test(badge_code)) {
      const id = parseInt(badge_code.match(/^cnol2025-(\d+)$/i)[1], 10);
      let { data: userById, error: errorById } = await supabaseAdmin
        .from('inscription')
        .select('nom, prenom, email, telephone, fonction, ville, identifiant_badge')
        .eq('id', id)
        .single();
      if (userById && !errorById) {
        user = userById;
      }
    }

    if (!user) {
      console.error('Erreur Supabase Admin (recherche badge):', error);
      return res.status(404).json({ message: 'Participant non trouvé.' });
    }

    return res.status(200).json(user);

  } catch (err) {
    console.error('Erreur API get-participant-by-badge:', err);
    return res.status(500).json({ message: "Erreur serveur interne." });
  }
} 