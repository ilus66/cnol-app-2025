import { supabase } from '../../lib/supabaseClient'
import { generateTicket } from '../../lib/generateTicket'
import { sendTicketMail } from '../../lib/mailer'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Méthode non autorisée' })
  const { atelier_id, nom, prenom, email, telephone, type } = req.body
  if (!atelier_id || !nom || !prenom || !email || !telephone || !type) return res.status(400).json({ message: 'Champs manquants' })

  // Récupérer infos atelier
  const { data: atelier, error: errAtelier } = await supabase.from('ateliers').select('*').eq('id', atelier_id).single()
  if (errAtelier || !atelier) return res.status(404).json({ message: 'Atelier introuvable' })

  // Limite à 30 pour les externes
  if (type === 'externe') {
    const { count } = await supabase
      .from('reservations_atelier')
      .select('*', { count: 'exact', head: true })
      .eq('atelier_id', atelier_id)
      .eq('type', 'externe')
    if (count >= 30) {
      return res.status(400).json({ message: 'Complet : toutes les places externes sont réservées.' })
    }
  }

  // Insérer réservation
  const { data, error } = await supabase.from('reservations_ateliers').insert({
    atelier_id,
    nom,
    prenom,
    email,
    telephone,
    type
  }).select().single()
  if (error) return res.status(500).json({ message: 'Erreur insertion réservation' })

  // Générer ticket PDF
  const pdfBuffer = await generateTicket({
    nom,
    prenom,
    email,
    eventType: 'Atelier',
    eventTitle: atelier.titre,
    eventDate: atelier.date_heure,
    reservationId: data.id
  })

  // Envoyer mail avec ticket
  await sendTicketMail({
    to: email,
    nom,
    prenom,
    eventType: 'Atelier',
    eventTitle: atelier.titre,
    eventDate: atelier.date_heure,
    pdfBuffer
  })

  return res.status(200).json({ success: true })
} 