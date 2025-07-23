import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Méthode non autorisée' });
    return;
  }
  const { nom, prenom, telephone, email, fonction, ville } = req.body;
  if (!nom || !prenom || !telephone) {
    res.status(400).json({ error: 'Champs obligatoires manquants' });
    return;
  }
  const { error } = await supabase
    .from('whatsapp')
    .insert([{ nom, prenom, telephone, email, fonction, ville }]);
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(200).json({ success: true });
}
