import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Méthode non autorisée' })

  const { code } = req.body
  if (!code) return res.status(400).json({ message: 'Code QR manquant' })

  // On suppose que le code scanné est l'ID ou l'email de la personne
  let { data: user, error } = await supabase
    .from('inscription')
    .select('id, nom, prenom, email')
    .or(`id.eq.${code},email.eq.${code}`)
    .single()

  if (error || !user) {
    return res.status(404).json({ message: 'Utilisateur introuvable' })
  }

  // Vérifier s'il a déjà été scanné
  const { data: existingEntry } = await supabase
  .from('entrees')
  .select('*')
  .eq('user_id', user.id)
  .single()

  if (existingEntry) {
    return res.status(200).json({ message: `Déjà scanné : ${user.nom} ${user.prenom}` })
  }

  // Sinon, enregistrer l’entrée
  const { error: insertError } = await supabase
  .from('entrees')
  .insert({ user_id: user.id })

  if (insertError) {
    return res.status(500).json({ message: 'Erreur lors de l’enregistrement' })
  }

  return res.status(200).json({ message: `Bienvenue ${user.prenom} ${user.nom} 👋` })
}
