import { supabase } from '../../lib/supabaseClient';
import { generateBadgeUnified } from '../../lib/generateBadgeUnified';
import { sendBadgeEmail } from '../../lib/sendBadgeEmail';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
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

    // Récupérer l'inscription WhatsApp
    const { data: inscrit, error } = await supabase
      .from('whatsapp')
      .select('*')
      .eq('id', dbId)
      .single();

    if (error || !inscrit) {
      return res.status(404).json({ message: 'Inscription WhatsApp non trouvée' });
    }

    if (inscrit.valide) {
      return res.status(400).json({ message: 'Inscription WhatsApp déjà validée' });
    }

    // Mise à jour statut valide
    const { data: updated, error: updateError } = await supabase
      .from('whatsapp')
      .update({ valide: true })
      .eq('id', dbId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ message: 'Erreur lors de la validation' });
    }

    // Générer badge avec userId = id reçu
    const userData = {
      prenom: updated.prenom || '',
      nom: updated.nom,
      function: updated.fonction,
      city: updated.ville,
      badgeCode: updated.identifiant_badge ? String(updated.identifiant_badge) : 'TEST123',
      date: '10 OCT. 2025',
      heure: '09H00',
      dateFin: '12 OCT. 2025',
      heureFin: '18H00',
      lieu: 'Centre de conférences Fm6education - Av. Allal Al Fassi RABAT',
      userId: idStr
    };
    const pdfBuffer = await generateBadgeUnified(userData);

    // Test upload avec la clé service_role
    const { createClient } = require('@supabase/supabase-js');
    const supabaseServiceRole = createClient(
      'https://otmttpiqeehfquoqycol.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Upload PDF dans Supabase Storage (bucket 'logos') avec service_role
    const safeName = `${updated.prenom || ''} ${updated.nom}`.toLowerCase().normalize('NFD').replace(/[^a-zA-Z0-9]/g, '-');
    const fileName = `badge-cnol2025-${safeName}.pdf`;
    const { data: uploadData, error: uploadError } = await supabaseServiceRole.storage
      .from('logos')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });
    if (uploadError) {
      console.error('Erreur upload badge PDF Supabase (service_role):', uploadError);
      return res.status(500).json({ message: 'Erreur upload badge PDF (service_role)' });
    }
    // Générer l'URL publique du PDF
    const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName);
    const badgeUrl = publicUrlData.publicUrl;

    // Envoyer mail si email disponible
    if (updated.email) {
      await sendBadgeEmail(updated.email, `${updated.prenom || ''} ${updated.nom}`, pdfBuffer, updated.identifiant_badge);
    }

    // Envoi WhatsApp (badge)
    try {
      const whatsappText = `Bonjour ${updated.prenom || ''} ${updated.nom},\n\nVotre badge nominatif CNOL 2025 est en pièce jointe (PDF)${updated.email ? ` et vous a aussi été envoyé par email à : ${updated.email}` : ''}.\n\nVous pouvez également le télécharger ici : ${badgeUrl}\n\nPour accéder à l'application CNOL 2025 (programme, notifications, espace personnel…), téléchargez-la ici :\nhttps://www.app.cnol.ma\n\nVos identifiants d'accès :\n${updated.email ? `Email : ${updated.email}\n` : ''}Code badge : ${updated.identifiant_badge}\n\nMerci d'imprimer ce badge et de l'apporter le jour de l'événement.\n\nÀ bientôt !\n\nSuivez CNOL sur Instagram @cnol_maroc`;
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
      const whatsappResult = await response.json();
      if (!whatsappResult.success) {
        console.error('Erreur envoi WhatsApp:', whatsappResult);
      }
    } catch (whatsappError) {
      console.error('Erreur envoi WhatsApp:', whatsappError);
    }

    // Mettre à jour l'URL du badge dans la base de données
    await supabase
      .from('whatsapp')
      .update({ badge_url: badgeUrl, badge_envoye: true })
      .eq('id', dbId);

    res.status(200).json({ 
      message: `Inscription WhatsApp de ${updated.prenom || ''} ${updated.nom} validée avec succès. Badge généré et envoyé.`,
      badgeUrl 
    });

  } catch (error) {
    console.error('Erreur validation WhatsApp:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la validation' });
  }
} 