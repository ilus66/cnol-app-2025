import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Méthode non autorisée' })

  const { search = '', sort = 'desc', page = 1, pageSize = 10 } = req.query
  const pageInt = parseInt(page, 10) || 1
  const pageSizeInt = parseInt(pageSize, 10) || 10
  const from = (pageInt - 1) * pageSizeInt
  const to = from + pageSizeInt - 1

  let query = supabase
    .from('entrees')
    .select('scanned_at, inscription (nom, prenom, email)', { count: 'exact' })

  if (search) {
    query = query.or(`inscription.nom.ilike.%${search}%,inscription.prenom.ilike.%${search}%,inscription.email.ilike.%${search}%`)
  }

  query = query.order('scanned_at', { ascending: sort === 'asc' })
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) return res.status(500).json({ message: 'Erreur chargement entrées', error })

  return res.status(200).json({ entrees: data, total: count })
} 