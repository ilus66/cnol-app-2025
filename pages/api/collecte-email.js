import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Méthode non autorisée' });
  const { nom, prenom, telephone, code_identification, email } = req.body;
  if (!nom || !telephone || !code_identification || !email) {
    return res.status(400).json({ success: false, message: 'Champs requis manquants.' });
  }

  // 1. Mettre à jour l'email dans la table WhatsApp
  const { error: updateError } = await supabase
    .from('whatsapp')
    .update({ email })
    .eq('telephone', telephone)
    .eq('code_identification', code_identification);

  if (updateError) {
    return res.status(500).json({ success: false, message: "Erreur lors de la mise à jour de l'email dans WhatsApp." });
  }

  // 2. Créer l'entrée dans inscription (si non existante)
  // On vérifie d'abord si l'email existe déjà
  const { data: existing, error: existError } = await supabase
    .from('inscription')
    .select('*')
    .eq('email', email)
    .single();

  if (!existing) {
    const { error: insertError } = await supabase
      .from('inscription')
      .insert({
        nom,
        prenom,
        telephone,
        email,
        code_identification,
        origine: 'whatsapp'
      });
    if (insertError) {
      return res.status(500).json({ success: false, message: "Erreur lors de la création dans inscription." });
    }
  }

  return res.status(200).json({ success: true, message: 'Email enregistré et utilisateur migré.' });
} 