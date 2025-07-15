import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Méthode non autorisée' });
  const { identifiant, code } = req.body;
  if (!identifiant || !code) return res.status(400).json({ message: 'Champs requis manquants.' });

  // Détecter si identifiant est un email ou un téléphone
  const isEmail = identifiant.includes('@');
  let query = supabase.from('inscription').select('*').eq('code_identification', code);
  if (isEmail) {
    query = query.eq('email', identifiant);
  } else {
    // Normaliser le téléphone (supprimer espaces, +, etc.)
    const tel = identifiant.replace(/\D/g, '');
    query = query.ilike('telephone', `%${tel}`);
  }
  const { data, error } = await query.single();
  if (error || !data) {
    return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
  }
  // Ici, tu peux ajouter une logique de session ou de redirection si besoin
  return res.status(200).json({ success: true, message: 'Connexion réussie.', user: { id: data.id, nom: data.nom, prenom: data.prenom } });
} 