import { supabase } from '../../lib/supabaseClient';
import { generateBadgeUnified } from '../../lib/generateBadgeUnified';
const { sendBadgeEmail } = require('../../lib/sendBadgeEmail');

// Fonction pour faire un nom safe (à copier aussi dans generateBadge.js)
function makeSafeFileName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  // Vérification basique d'authentification (optionnel)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Pour le moment, on autorise sans token pour la compatibilité
    console.log('API validate appelée sans token d\'authentification');
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID manquant' });
  }

  // S'assurer que id est une chaîne de caractères
  const idStr = String(id);

  try {
    // Extraire l'ID de la base de données (enlever le préfixe cnol2025-)
    const prefix = 'cnol2025-';
    if (!idStr.startsWith(prefix)) {
      return res.status(400).json({ message: 'Format d\'ID invalide' });
    }

    const dbId = idStr.slice(prefix.length);

    // Récupérer l'inscription
    const { data: inscrit, error } = await supabase
      .from('inscription')
      .select('*')
      .eq('id', dbId)
      .single();

    if (error || !inscrit) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    if (inscrit.valide) {
      return res.status(400).json({ message: 'Inscription déjà validée' });
    }

    // Mise à jour statut valide
    const { data: updated, error: updateError } = await supabase
      .from('inscription')
      .update({ valide: true })
      .eq('id', dbId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ message: 'Erreur lors de la validation' });
    }

    // Générer badge avec userId = id reçu
    const userData = {
      prenom: updated.prenom,
      nom: updated.nom,
      function: updated.fonction,
      city: updated.ville,
      badgeCode: updated.identifiant_badge ? String(updated.identifiant_badge) : 'TEST123',
      date: '10 OCT. 2025',
      heure: updated.heure_debut || '09H00',
      dateFin: '12 OCT. 2025',
      heureFin: updated.heure_fin || '18H00',
      lieu: updated.lieu || 'Centre de conférences Fm6education - Av. Allal Al Fassi RABAT',
      userId: idStr
    };
    const pdfBuffer = await generateBadgeUnified(userData);

    // Upload sur Cloudflare R2 au lieu de Supabase
    const safeName = `${updated.prenom} ${updated.nom}`.toLowerCase().normalize('NFD').replace(/[^a-zA-Z0-9]/g, '-');
    const fileName = `badge-cnol2025-${safeName}.pdf`;
    
    let badgeUrl = null;
    try {
      // Utiliser uploadToR2 au lieu de Supabase
      const { uploadToR2 } = require('../../lib/uploadToR2');
      
      const { success, publicUrl, error: uploadError } = await uploadToR2(
        fileName,
        pdfBuffer,
        'application/pdf'
      );

      if (!success) {
        console.error('Erreur upload badge PDF sur R2:', uploadError);
        return res.status(500).json({ message: 'Erreur upload badge PDF sur R2' });
      }

      badgeUrl = publicUrl;
      console.log('Upload badge R2 OK:', badgeUrl);
      
    } catch (error) {
      console.error('Exception upload badge R2:', error);
      return res.status(500).json({ message: 'Exception upload badge PDF sur R2' });
    }

    // Envoyer mail
    await sendBadgeEmail(updated.email, `${updated.prenom} ${updated.nom}`, pdfBuffer, updated.identifiant_badge);

    // Envoi WhatsApp (badge)
    try {
      const whatsappText = `Bonjour ${updated.prenom} ${updated.nom},\n\nVotre badge nominatif CNOL 2025 est en pièce jointe (PDF) et vous a aussi été envoyé par email à : ${updated.email}.\n\nVous pouvez également le télécharger ici : ${badgeUrl}\n\nPour accéder à l'application CNOL 2025 (programme, notifications, espace personnel…), téléchargez-la ici :\nhttps://www.app.cnol.ma\n\nVos identifiants d'accès :\nEmail : ${updated.email}\nCode badge : ${updated.identifiant_badge}\n\nMerci d'imprimer ce badge et de l'apporter le jour de l'événement.\n\nÀ bientôt !\n\nSuivez CNOL sur Instagram @cnol_maroc`;
      console.log('Appel à /api/send-whatsapp', {
        to: updated.telephone,
        text: whatsappText,
        documentUrl: badgeUrl,
        fileName
      });
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: updated.telephone,
          text: whatsappText,
          documentUrl: badgeUrl,
          fileName
        })
      });
      let resData = null;
      try {
        resData = await response.json();
      } catch (err) {
        resData = { error: 'Invalid JSON', raw: await response.text() };
      }
      console.log('Réponse fetch /api/send-whatsapp:', resData);
    } catch (e) {
      console.error('Erreur envoi WhatsApp badge:', e);
    }

    // Envoi notification push (et insertion en base)
    if (updated && updated.id) {
      await supabase.from('notifications').insert({
        user_id: updated.id,
        title: 'Validation inscription CNOL 2025',
        body: "Votre inscription a été validée ! Votre badge nominatif a été envoyé par email.",
        url: null
      });
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/push/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: updated.id,
            title: 'Validation inscription CNOL 2025',
            body: "Votre inscription a été validée ! Votre badge nominatif a été envoyé par email.",
            url: null
          })
        });
      } catch (e) {
        console.error('Erreur envoi notification push:', e);
      }
    }

    // Injection dans statistiques_participants
    function normalizePhone(phone) {
      if (!phone) return '';
      let p = phone.replace(/\D/g, '');
      if (p.startsWith('212')) p = '+' + p;
      else if (p.startsWith('0')) p = '+212' + p.slice(1);
      else if (p.startsWith('6') || p.startsWith('7')) p = '+212' + p;
      else if (!p.startsWith('+')) p = '+' + p;
      return p;
    }
    const identifiant = updated.email?.toLowerCase().trim() || normalizePhone(updated.telephone);
    console.log('[validate] Injection stats_participants', {
      identifiant,
      email: updated.email,
      telephone: updated.telephone,
      nom: updated.nom,
      prenom: updated.prenom,
      fonction: updated.fonction,
      ville: updated.ville
    });
    const { error: upsertError } = await supabase.from('statistiques_participants').upsert([{
      identifiant,
      email: updated.email,
      telephone: updated.telephone,
      nom: updated.nom,
      prenom: updated.prenom,
      fonction: updated.fonction,
      ville: updated.ville,
      source: 'inscription'
    }], { onConflict: 'identifiant' });
    if (upsertError) {
      console.error('[validate] Erreur upsert stats_participants', upsertError);
    } else {
      console.log('[validate] Upsert stats_participants OK');
    }

    return res.status(200).json({ message: 'Inscription validée et mail envoyé.' });
  } catch (error) {
    console.error('❌ Erreur API validate:', error);
    return res.status(500).json({ message: 'Erreur serveur interne.' });
  }
}
