import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Méthode non autorisée' })
  const { reservationId } = req.body
  if (!reservationId) return res.status(400).json({ message: 'ID de réservation manquant' })

  // Chercher dans reservations_ateliers
  let { data: resa, error } = await supabase.from('reservations_ateliers').select('*').eq('id', reservationId).single()
  let eventType = 'Atelier'
  let event = null
  if (!resa) {
    // Sinon, chercher dans reservations_masterclass
    eventType = 'Masterclass'
    const resamc = await supabase.from('reservations_masterclass').select('*').eq('id', reservationId).single()
    resa = resamc.data
    error = resamc.error
    if (!resa) return res.status(404).json({ message: 'Ticket inconnu' })
    // Récupérer la masterclass
    const { data: mc } = await supabase.from('masterclass').select('*').eq('id', resa.masterclass_id).single()
    event = mc
  } else {
    // Récupérer l'atelier
    const { data: at } = await supabase.from('ateliers').select('*').eq('id', resa.atelier_id).single()
    event = at
  }

  // Vérifier si déjà scanné
  if (resa.scanned) {
    return res.status(200).json({
      nom: resa.nom,
      prenom: resa.prenom,
      email: resa.email,
      eventType,
      eventTitle: event.titre,
      eventDate: event.date_heure,
      scanned: true
    })
  }

  // Marquer comme scanné
  await supabase
    .from(eventType === 'Atelier' ? 'reservations_ateliers' : 'reservations_masterclass')
    .update({ scanned: true, scanned_at: new Date().toISOString() })
    .eq('id', reservationId)

  return res.status(200).json({
    nom: resa.nom,
    prenom: resa.prenom,
    email: resa.email,
    eventType,
    eventTitle: event.titre,
    eventDate: event.date_heure,
    scanned: false
  })
} 