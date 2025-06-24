import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  // Vérifier la session utilisateur
  const sessionCookie = req.cookies['cnol-session'];
  if (!sessionCookie) return res.status(401).json({ error: 'Non authentifié' });
  let sessionData;
  try {
    sessionData = JSON.parse(decodeURIComponent(sessionCookie));
  } catch {
    return res.status(400).json({ error: 'Session invalide' });
  }
  const userId = sessionData.id;
  if (!userId) return res.status(400).json({ error: 'Session invalide' });

  // Anonymiser l'utilisateur (RGPD)
  const { error: err1 } = await supabase.from('inscription').update({
    nom: 'Utilisateur supprimé',
    prenom: '',
    email: `deleted_${userId}_${Date.now()}@deleted.com`,
    telephone: '',
    fonction: '',
    participant_type: '',
    valide: false,
    identifiant_badge: null
  }).eq('id', userId);

  // Supprimer les réservations, contacts, notifications liées
  await supabase.from('reservations_ateliers').delete().eq('user_id', userId);
  await supabase.from('reservations_masterclass').delete().eq('user_id', userId);
  await supabase.from('notifications').delete().eq('user_id', userId);
  await supabase.from('contacts').delete().eq('collector_id', userId);

  // Invalider la session côté client
  res.setHeader('Set-Cookie', 'cnol-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');

  if (err1) return res.status(500).json({ error: 'Erreur lors de la suppression' });
  return res.status(200).json({ success: true });
} 