import { supabase } from '../../lib/supabaseClient';
const cookie = require('cookie');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Méthode non autorisée' });
  const { id, email } = req.body;
  if (!id && !email) return res.status(400).json({ message: 'ID ou email requis.' });

  // Récupérer l'utilisateur par id ou email
  let user = null;
  let error = null;
  if (id) {
    ({ data: user, error } = await supabase.from('inscription').select('*').eq('id', id).single());
  } else if (email) {
    ({ data: user, error } = await supabase.from('inscription').select('*').eq('email', email).single());
  }
  if (error || !user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé.' });
  }

  // Créer la session
  const sessionData = {
    id: user.id,
    email: user.email,
    prenom: user.prenom,
    valide: user.valide,
    participant_type: user.participant_type,
  };
  const sessionCookie = cookie.serialize('cnol-session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'none',
  });
  res.setHeader('Set-Cookie', sessionCookie);
  return res.status(200).json({ success: true, message: 'Session créée.' });
} 