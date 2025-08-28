import { supabase } from '../../../lib/supabaseClient';
import sendBadgeEmail from '../../../lib/sendBadgeEmail';
import { generateBadgeUnified } from '../../../lib/generateBadgeUnified';

function generateStaffBadgeCode() {
  const digits = Math.floor(100 + Math.random() * 900); // 3 chiffres
  const letters = Array(3).fill(0).map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
  return `${digits}${letters}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { nom, prenom, email, telephone, fonction, exposant_id, organisation } = req.body;
  if (!nom || !prenom || !email || !fonction || !exposant_id || !organisation) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }
  // Générer un identifiant badge unique (4 chiffres + 4 lettres, sans préfixe)
  const badgeCode = generateStaffBadgeCode();

  // 1. Ajout dans la base
  const { data, error } = await supabase.from('inscription').insert({
    nom,
    prenom,
    email,
    telephone,
    participant_type: 'staff',
    organisation,
    exposant_id,
    identifiant_badge: badgeCode,
    valide: true,
    created_at: new Date().toISOString(),
    fonction,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });

  // 2. Générer le PDF du badge
  let pdfBuffer;
  try {
    const userData = {
      prenom,
      nom,
      function: fonction,
      city: '',
      badgeCode: badgeCode,
      date: '10 OCT. 2025',
      heure: '09H00',
      dateFin: '12 OCT. 2025',
      heureFin: '18H00',
      lieu: organisation || '',
      userId: badgeCode
    };
    pdfBuffer = await generateBadgeUnified(userData);
  } catch (err) {
    return res.status(500).json({ error: "Erreur lors de la génération du badge PDF : " + err.message });
  }

  // 3. Upload du badge sur Cloudflare R2
  let badgeUrl = null;
  try {
    const { uploadToR2 } = require('../../../lib/uploadToR2');
    
    // Construire le nom de fichier safe
    const safeNom = nom.toLowerCase().normalize('NFD').replace(/[^a-zA-Z0-9]/g, '-');
    const safePrenom = prenom.toLowerCase().normalize('NFD').replace(/[^a-zA-Z0-9]/g, '-');
    const fileName = `badge-cnol2025-staff-${safePrenom}-${safeNom}.pdf`;
    
    const { success, publicUrl, error: uploadError } = await uploadToR2(
      fileName,
      pdfBuffer,
      'application/pdf'
    );

    if (!success) {
      console.error('Erreur upload badge staff sur R2:', uploadError);
      return res.status(500).json({ error: 'Erreur upload badge PDF sur R2' });
    }

    badgeUrl = publicUrl;
    console.log('Upload badge staff R2 OK:', badgeUrl);
    
    // 4. Mettre à jour l'URL du badge en base
    await supabase
      .from('inscription')
      .update({ badge_url: badgeUrl })
      .eq('id', data.id);
      
  } catch (error) {
    console.error('Exception upload badge staff R2:', error);
    return res.status(500).json({ error: 'Exception upload badge PDF sur R2' });
  }

  // 5. Envoi du badge par email
  try {
    await sendBadgeEmail(
      email,
      `${prenom} ${nom}`,
      pdfBuffer,
      badgeCode
    );
  } catch (err) {
    console.error('Erreur envoi email badge staff:', err);
    // Ne pas bloquer si l'email échoue
  }

  // 6. Envoi WhatsApp si téléphone disponible
  if (telephone) {
    try {
      const whatsappText = `Bonjour ${prenom} ${nom},\n\nVotre badge nominatif CNOL 2025 (Staff) est en pièce jointe (PDF) et vous a aussi été envoyé par email à : ${email}.\n\nVous pouvez également le télécharger ici :\n${badgeUrl}\n\nPour accéder à l'application CNOL 2025 (programme, notifications, espace personnel...), téléchargez-la ici :\nhttps://www.app.cnol.ma\n\nVos identifiants d'accès :\nEmail : ${email}\nCode badge : ${badgeCode}\nFonction : ${fonction}\nOrganisation : ${organisation}\n\nMerci d'imprimer ce badge et de l'apporter le jour de l'événement.\n\nÀ bientôt !\n\nSuivez CNOL sur Instagram @cnol_maroc`;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: telephone,
          text: whatsappText,
          documentUrl: badgeUrl,
          fileName: `badge-cnol2025-staff-${prenom}-${nom}.pdf`
        })
      });
      
      if (response.ok) {
        console.log('WhatsApp badge staff envoyé avec succès');
      } else {
        console.error('Erreur envoi WhatsApp badge staff');
      }
    } catch (whatsappError) {
      console.error('Erreur envoi WhatsApp badge staff:', whatsappError);
      // Ne pas bloquer si WhatsApp échoue
    }
  }

  return res.status(200).json({ 
    success: true, 
    badgeCode, 
    badgeUrl,
    message: `Staff ${prenom} ${nom} ajouté avec succès. Badge généré et envoyé.`
  });
} 