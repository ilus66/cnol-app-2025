import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { data, error } = await supabase
    .from('whatsapp')
    .select('id, nom, prenom, telephone, badge_envoye')
    .or('badge_envoye.is.false,badge_envoye.is.null');

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json({ contacts: data });
} 