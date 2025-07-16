import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Utilise la clé service pour update
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { id } = req.body; // ou telephone, selon ta clé primaire
  if (!id) {
    return res.status(400).json({ message: 'ID requis' });
  }

  // Met à jour le statut du participant WhatsApp dans la table 'whatsapp'
  const { error } = await supabase
    .from('whatsapp')
    .update({ badge_envoye: true }) // ou { statut: 'validé' } si tu as un champ statut
    .eq('id', id);

  if (error) {
    return res.status(500).json({ message: 'Erreur lors de la validation', error: error.message });
  }

  res.status(200).json({ success: true });
} 