import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Méthode non autorisée' })

  const { code } = req.body
  if (!code) return res.status(400).json({ message: 'Code QR manquant' })

  // 1. Chercher dans ancien_identifiant_badge
  let { data: user, error } = await supabase
    .from('inscription')
    .select('id, nom, prenom, email, identifiant_badge, ancien_identifiant_badge')
    .eq('ancien_identifiant_badge', code)
    .single()

  // 2. Si non trouvé et code de la forme cnol2025-XX, chercher dans id
  if ((!user || error) && /^cnol2025-(\d+)$/i.test(code)) {
    const id = parseInt(code.match(/^cnol2025-(\d+)$/i)[1], 10);
    let { data: userById, error: errorById } = await supabase
      .from('inscription')
      .select('id, nom, prenom, email, identifiant_badge, ancien_identifiant_badge')
      .eq('id', id)
      .single();
    if (userById && !errorById) {
      user = userById;
      error = null;
    }
  }

  if (error || !user) {
    return res.status(404).json({ message: 'Utilisateur introuvable' })
  }

  // Vérifier s'il a déjà été scanné
  const { data: existingEntry } = await supabase
    .from('entrees')
    .select('*')
    .or(`user_id.eq.${user.id},identifiant_badge.eq.${user.identifiant_badge}`)
    .single()

  if (existingEntry) {
    return res.status(200).json({ message: `Déjà scanné : ${user.nom} ${user.prenom}` })
  }

  // Sinon, enregistrer l’entrée
  const isAncien = code === user.ancien_identifiant_badge;
  const { error: insertError } = await supabase
    .from('entrees')
    .insert({ 
      user_id: user.id, 
      identifiant_badge: user.identifiant_badge,
      ancien_identifiant_badge: isAncien ? code : null
    })

  if (insertError) {
    return res.status(500).json({ message: 'Erreur lors de l’enregistrement' })
  }

  return res.status(200).json({ message: `Bienvenue ${user.prenom} ${user.nom} 👋` })
}
