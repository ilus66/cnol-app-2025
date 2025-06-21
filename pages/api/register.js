import { supabase } from '../../lib/supabaseClient'
import { sendMail } from '../../lib/mailer'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  const user = req.body

  // Log du payload reçu
  console.log('Payload reçu dans /register:', user)

  // Validation côté backend
  if (!user.email || !user.telephone) {
    return res.status(400).json({ message: "L'email et le téléphone sont obligatoires." })
  }

  try {
    // Liste des champs autorisés (ceux de la table inscription)
    const allowedFields = ['email', 'telephone', 'nom', 'prenom', 'fonction', 'ville', 'badge_code'];
    const userToInsert = {};
    for (const field of allowedFields) {
      if (user[field]) userToInsert[field] = user[field];
    }

    // Génération d'un code badge unique (3 chiffres + 3 lettres)
    function generateBadgeCode() {
      const digits = Math.floor(100 + Math.random() * 900); // 3 chiffres
      const letters = Array(3)
        .fill(0)
        .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
        .join('');
      return `${digits}${letters}`;
    }

    // Générer un code badge unique et vérifier unicité
    let badgeCode;
    let isUnique = false;
    while (!isUnique) {
      badgeCode = generateBadgeCode();
      const { data: exists } = await supabase
        .from('inscription')
        .select('id')
        .eq('identifiant_badge', badgeCode)
        .single();
      if (!exists) isUnique = true;
    }
    userToInsert.identifiant_badge = badgeCode;

    // Insert dans Supabase sans les champs parasites
    const { error } = await supabase.from('inscription').insert([userToInsert]);
    if (error) throw error

    // Envoi email à l'utilisateur
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    await sendMail({
      to: user.email,
      subject: "Confirmation d'inscription - CNOL 2025",
      text: `Bonjour ${user.prenom},\n\nMerci pour votre inscription au CNOL 2025 !\nVotre inscription est bien reçue et sera validée par notre équipe.\n\nVotre code d'identification est : ${badgeCode}\n\nUne fois validée, votre badge vous sera envoyé par email. Vous pourrez alors accéder à votre espace personnel.\n\nAccédez à votre espace personnel ici : ${baseUrl}/mon-espace\n\nÀ très bientôt !\nL'équipe CNOL 2025`,
      html: `<div style="font-family: Arial, sans-serif; color: #333; line-height:1.6; max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:8px;">
        <h2 style="color: #0070f3;">Bonjour ${user.prenom},</h2>
        <p>Merci pour votre inscription au <strong>CNOL 2025</strong> !</p>
        <p>Votre inscription est bien reçue et sera <strong>validée par notre équipe</strong>.</p>
        <p>Votre code d'identification personnel est : <strong style="font-size: 1.2em; color: #d32f2f;">${badgeCode}</strong>. Conservez-le précieusement.</p>
        <p><strong>Une fois votre inscription validée, votre badge vous sera envoyé par email.</strong> Vous pourrez utiliser ce code et votre email pour vous connecter à votre espace personnel.</p>
        <p style="text-align:center; margin: 25px 0;">
          <a href="${baseUrl}/mon-espace" style="background-color: #0070f3; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accéder à mon Espace Personnel</a>
        </p>
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
      text: `Nouvelle inscription reçue :\n\nNom : ${user.nom}\nPrénom : ${user.prenom}\nEmail : ${user.email}\nTéléphone : ${user.telephone}\nFonction : ${user.fonction}\nVille : ${user.ville}\nDate : ${new Date().toLocaleString()}`,
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

    // Envoi notification push (et insertion en base)
    // Chercher l'utilisateur nouvellement inscrit pour récupérer son id
    const { data: inscrit } = await supabase
      .from('inscription')
      .select('id, email')
      .eq('email', user.email)
      .single();
    if (inscrit && inscrit.id) {
      // Insérer la notification en base
      await supabase.from('notifications').insert({
        user_id: inscrit.id,
        title: 'Inscription CNOL 2025',
        body: "Merci pour votre inscription au CNOL 2025 ! Vous recevrez un email de confirmation.",
        url: null
      });
      // Appeler l'API push/send
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/push/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: inscrit.id,
            title: 'Inscription CNOL 2025',
            body: "Merci pour votre inscription au CNOL 2025 ! Vous recevrez un email de confirmation.",
            url: null
          })
        });
      } catch (e) {
        console.error('Erreur envoi notification push:', e);
      }
    }

    res.status(200).json({ message: 'Inscription enregistrée et emails envoyés' })
  } catch (err) {
    console.error('Erreur API /register:', err)
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' })
  }
}
