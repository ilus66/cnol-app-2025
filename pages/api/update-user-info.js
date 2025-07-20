import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }
  const { id, telephone, email, ville, organisation, source } = req.body;
  if (!id || !email) {
    return res.status(400).json({ success: false, message: 'ID et email requis.' });
  }
  const table = source === 'whatsapp' ? 'whatsapp' : 'inscription';
  try {
    const { error } = await supabase
      .from(table)
      .update({ telephone, email, ville, organisation })
      .eq('id', id);
    if (error) throw error;
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
} 