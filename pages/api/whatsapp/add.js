import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Ajoute ce contrôle
if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL ou SUPABASE_KEY manquantes', { supabaseUrl, supabaseKey });
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (!supabaseUrl || !supabaseKey) {
    res.status(500).json({ error: 'Variables SUPABASE_URL ou SUPABASE_KEY manquantes.' });
    return;
  }
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
