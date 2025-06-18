import { supabase } from '../../lib/supabaseClient'
import { sendMail } from '../../lib/mailer'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  const user = req.body

  // Validation côté backend
  if (!user.email || !user.telephone) {
    return res.status(400).json({ message: "L'email et le téléphone sont obligatoires." })
  }

  try {
    // Générer un token magique et son expiration
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 1000 * 60 * 30) // 30 min

    // Insert dans Supabase avec le token
    const { error } = await supabase.from('inscription').insert([{ ...user, magic_token: token, magic_token_expires: expires.toISOString() }])
    if (error) throw error

    // Préparer le lien magique
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const link = `${baseUrl}/mon-espace?token=${token}`
    console.log('Lien magique généré :', link)

    // Envoi email à l'utilisateur
    await sendMail({
      to: user.email,
      subject: "Confirmation d'inscription - CNOL 2025",
      text: `Bonjour ${user.prenom},\n\nMerci pour votre inscription au CNOL 2025 !\nVotre inscription est bien reçue et sera validée par notre équipe.\n\nAccédez à votre espace personnel ici : ${link}\n\nUne fois validée, votre badge vous sera envoyé par email.\n\nÀ très bientôt !\nL'équipe CNOL 2025`,
      html: `<div style="font-family: Arial, sans-serif; color: #333; line-height:1.6; max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:8px;">
        <h2 style="color: #0070f3;">Bonjour ${user.prenom},</h2>
        <p>Merci pour votre inscription au <strong>CNOL 2025</strong> !</p>
        <p>Votre inscription est bien reçue et sera <strong>validée par notre équipe</strong>.</p>
        <p><a href="${link}" style="color:#0070f3;font-weight:bold;">Accéder à mon espace personnel</a></p>
        <p><strong>Une fois validée, votre badge vous sera envoyé par email.</strong></p>
        <p>Nous avons hâte de vous accueillir lors de cet événement incontournable de l'optique au Maroc.</p>
        <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />
        <p style="font-size: 0.9em; color: #666;">
          Pour toute question, contactez-nous à <a href="mailto:cnol.maroc@gmail.com">cnol.maroc@gmail.com</a><br />
          &copy; 2025 CNOL. Tous droits réservés.
        </p>
      </div>`
    })

    // Envoi email à l'organisateur
    await sendMail({
      to: 'cnol.badge@gmail.com',
      subject: `📥 Nouvelle inscription - ${user.prenom} ${user.nom}`,
      text: `Nouvelle inscription reçue :

Nom : ${user.nom}
Prénom : ${user.prenom}
Email : ${user.email}
Téléphone : ${user.telephone}
Fonction : ${user.fonction}
Ville : ${user.ville}
Date : ${new Date().toLocaleString()}`,
      html: `<div style="font-family: Arial, sans-serif; color: #333; max-width:600px; margin:auto; padding:25px; border:1px solid #ddd; border-radius:10px; background:#ffffff;">
        <h2 style="color:#0070f3;">📥 Nouvelle inscription reçue</h2>
        <table style="width:100%; border-collapse:collapse; margin-top:15px;">
          <tr><td style="padding:8px; font-weight:bold;">Nom :</td><td style="padding:8px;">${user.nom}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Prénom :</td><td style="padding:8px;">${user.prenom}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Email :</td><td style="padding:8px;">${user.email}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Téléphone :</td><td style="padding:8px;">${user.telephone}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Fonction :</td><td style="padding:8px;">${user.fonction}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Ville :</td><td style="padding:8px;">${user.ville}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Date :</td><td style="padding:8px;">${new Date().toLocaleString()}</td></tr>
        </table>
      </div>`
    })

    res.status(200).json({ message: 'Inscription enregistrée et emails envoyés' })
  } catch (err) {
    console.error('Erreur API /register:', err)
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' })
  }
}
