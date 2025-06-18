import { supabase } from '../../lib/supabaseClient'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email } = req.body
  if (!email) return res.status(400).json({ message: 'Email requis' })

  // Vérifier que l'utilisateur existe
  const { data: user, error } = await supabase.from('inscription').select('*').eq('email', email).single()
  if (error || !user) {
    console.error('Utilisateur non trouvé ou erreur:', error)
    return res.status(404).json({ message: 'Utilisateur non trouvé' })
  }

  // Générer un token sécurisé
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 1000 * 60 * 30) // 30 min

  // Stocker le token et l'expiration dans la table inscription
  await supabase.from('inscription').update({ magic_token: token, magic_token_expires: expires.toISOString() }).eq('id', user.id)

  // Envoyer l'email
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const link = `${baseUrl}/mon-espace?token=${token}`

  // Configure ton transporteur mail ici (exemple avec Gmail ou SMTP)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Votre lien magique CNOL',
      html: `<p>Bonjour ${user.prenom},<br/>Voici votre <a href="${link}">lien magique</a> pour accéder à votre espace personnel CNOL.<br/><br/>Ce lien est valable 30 minutes.</p>`
    })
  } catch (err) {
    console.error('Erreur envoi mail:', err)
    return res.status(500).json({ message: 'Erreur envoi mail' })
  }

  return res.status(200).json({ success: true })
} 