import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { id } = req.body
  if (!id) return res.status(400).json({ message: 'ID manquant' })

  const { error } = await supabase.from('reservations_ateliers').delete().eq('id', id)
  if (error) return res.status(500).json({ message: 'Erreur lors de la suppression' })

  return res.status(200).json({ success: true })
} 