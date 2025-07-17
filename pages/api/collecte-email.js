import { supabase } from '../../lib/supabaseClient';
const cookie = require('cookie');

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
    .eq('identifiant_badge', code_identification);

  if (updateError) {
    return res.status(500).json({ success: false, message: "Erreur lors de la mise à jour de l'email dans WhatsApp." });
  }

  // 2. Créer l'entrée dans inscription (si non existante)
  const { data: existing, error: existError } = await supabase
    .from('inscription')
    .select('*')
    .eq('email', email)
    .single();

  let userId = null;
  if (!existing) {
    const { data: inserted, error: insertError } = await supabase
      .from('inscription')
      .insert({
        nom,
        prenom,
        telephone,
        email,
        identifiant_badge: code_identification,
        origine: 'whatsapp'
      })
      .select('id')
      .single();
    if (insertError) {
      return res.status(500).json({ success: false, message: "Erreur lors de la création dans inscription.", details: insertError.message, code: insertError.code });
    }
    userId = inserted.id;
  } else {
    userId = existing.id;
  }

  // 3. Créer directement la session (comme /api/login)
  const sessionData = {
    id: userId,
    email: email,
    prenom: prenom,
    valide: true, // Par défaut pour les utilisateurs WhatsApp
    participant_type: 'opticien', // Par défaut
  };

  const sessionCookie = cookie.serialize('cnol-session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'none',
  });

  res.setHeader('Set-Cookie', sessionCookie);
  return res.status(200).json({ success: true, message: 'Email enregistré et session créée.' });
} 