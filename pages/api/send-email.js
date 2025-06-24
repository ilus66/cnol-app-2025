import { sendMail } from '../../lib/mailer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { to, subject, text, email, name } = req.body;

  try {
    // Si c'est un formulaire de contact (avec 'to' spécifié)
    if (to && subject && text) {
      await sendMail({
        to: to,
        subject: subject,
        text: text,
        html: text.replace(/\n/g, '<br>'),
      });
    } else {
      // Ancien format pour les inscriptions
      await sendMail({
        to: email,
        subject: `Bienvenue ${name} au CNOL 2025`,
        text: `Bonjour ${name}, votre inscription est confirmée.`,
        html: `<h2>Bonjour ${name},</h2><p>Votre inscription au CNOL 2025 est bien confirmée.</p>`,
      });
    }

    res.status(200).json({ success: true, message: 'Email envoyé avec succès !' });
  } catch (err) {
    console.error('Erreur envoi email :', err);
    res.status(500).json({ success: false, message: 'Erreur envoi email' });
  }
}
