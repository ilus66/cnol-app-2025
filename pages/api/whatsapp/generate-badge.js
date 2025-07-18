import { generateBadge } from '../../../lib/generateBadge';

const { createClient } = require('@supabase/supabase-js');
const supabaseServiceRole = createClient(
  'https://otmttpiqeehfquoqycol.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generateBadgeCode() {
  const digits = Math.floor(100 + Math.random() * 900); // 3 chiffres
  const letters = Array(3).fill(0).map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
  return `${digits}${letters}`;
}

export default async function handler(req, res) {
  console.log('[whatsapp/generate-badge] Handler called');
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { id } = req.body;
  if (!id) {
    console.log('[whatsapp/generate-badge] ID manquant');
    return res.status(400).json({ success: false, message: 'ID requis' });
  }

  console.log('[whatsapp/generate-badge] Recherche contact WhatsApp id:', id);
  // Récupérer le contact WhatsApp
  const { data: contact, error: fetchError } = await supabaseServiceRole
    .from('whatsapp')
    .select('*')
    .eq('id', id)
    .single();
  if (fetchError || !contact) {
    console.error('[whatsapp/generate-badge] Contact WhatsApp introuvable', fetchError);
    return res.status(404).json({ success: false, message: 'Contact WhatsApp introuvable', error: fetchError?.message });
  }
  console.log('[whatsapp/generate-badge] Contact trouvé', contact);

  // Générer ou récupérer le code badge au bon format
  let badgeCode = contact.identifiant_badge;
  if (!badgeCode || !/^[0-9]{3}[A-Z]{3}$/.test(badgeCode)) {
    badgeCode = generateBadgeCode();
    // Mettre à jour la table whatsapp avec ce code
    await supabaseServiceRole
      .from('whatsapp')
      .update({ identifiant_badge: badgeCode })
      .eq('id', id);
    console.log('[whatsapp/generate-badge] Nouveau code badge généré et stocké:', badgeCode);
  } else {
    console.log('[whatsapp/generate-badge] Code badge existant et valide:', badgeCode);
  }

  // Générer le badge PDF
  let pdfBuffer;
  try {
    const userData = {
      name: (contact.prenom ? `${contact.prenom} ` : '') + (contact.nom || ''),
      function: contact.fonction || '',
      city: contact.ville || '',
      email: contact.email || '',
      userId: contact.telephone || '',
      identifiant_badge: badgeCode,
    };
    console.log('[whatsapp/generate-badge] Données pour generateBadge', userData);
    pdfBuffer = await generateBadge(userData);
    console.log('[whatsapp/generate-badge] PDF généré (buffer) OK');
  } catch (err) {
    console.error('[whatsapp/generate-badge] Erreur génération badge', err);
    return res.status(500).json({ success: false, message: 'Erreur génération badge PDF', error: err.message });
  }

  // Construire le nom de fichier safe (nom-prenom)
  const safeNom = (contact.nom || '').toLowerCase().normalize('NFD').replace(/[^a-zA-Z0-9]/g, '-');
  const safePrenom = (contact.prenom || '').toLowerCase().normalize('NFD').replace(/[^a-zA-Z0-9]/g, '-');
  const fileName = `badge-cnol2025-${safeNom}-${safePrenom}.pdf`;

  // Upload dans le bucket 'logos' avec le client service_role
  try {
    console.log('[whatsapp/generate-badge] Tentative upload dans logos:', fileName);
    const { data: uploadData, error: uploadError } = await supabaseServiceRole.storage
      .from('logos')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });
    if (uploadError) {
      console.error('[whatsapp/generate-badge] Erreur upload badge', uploadError);
      return res.status(500).json({ success: false, message: 'Erreur upload badge PDF', error: uploadError.message });
    }
    console.log('[whatsapp/generate-badge] Upload OK', uploadData);
  } catch (e) {
    console.error('[whatsapp/generate-badge] Exception upload badge', e);
    return res.status(500).json({ success: false, message: 'Exception upload badge PDF', error: e.message });
  }

  // Récupérer l'URL publique
  let badgeUrl = null;
  try {
    const { data: publicUrlData } = supabaseServiceRole.storage.from('logos').getPublicUrl(fileName);
    badgeUrl = publicUrlData?.publicUrl;
    console.log('[whatsapp/generate-badge] URL publique:', badgeUrl);
  } catch (e) {
    console.error('[whatsapp/generate-badge] Erreur récupération URL publique', e);
  }

  // Met à jour le statut du contact WhatsApp dans la table 'whatsapp'
  try {
    const { error } = await supabaseServiceRole
      .from('whatsapp')
      .update({ badge_envoye: true, badge_url: badgeUrl, valide: true }) // Ajout de la validation automatique
      .eq('id', id);
    if (error) {
      console.error('[whatsapp/generate-badge] Erreur update whatsapp', error);
      return res.status(500).json({ success: false, message: 'Erreur lors de la validation', error: error.message });
    }
    console.log('[whatsapp/generate-badge] Update whatsapp OK');
  } catch (e) {
    console.error('[whatsapp/generate-badge] Exception update whatsapp', e);
    return res.status(500).json({ success: false, message: 'Exception update whatsapp', error: e.message });
  }

  // Envoi WhatsApp avec le badge (nouveau message complet)
  try {
    const whatsappText = `Bonjour ${contact.nom?.toUpperCase()} ${contact.prenom ? contact.prenom.toUpperCase() : ''},\n\nVotre badge nominatif CNOL 2025 est en pièce jointe (PDF).\n\nVous pouvez également le télécharger ici :\n${badgeUrl}\n\nPour accéder à l'application CNOL 2025 (programme, notifications, espace personnel...), téléchargez-la ici :\nhttps://www.app.cnol.ma\n\nVos identifiants d'accès :\nTéléphone : ${contact.telephone}\nCode badge : ${badgeCode}\n\nMerci d'imprimer ce badge et de l'apporter le jour de l'événement.\n\nÀ bientôt !\n\nSuivez CNOL sur Instagram @cnol_maroc`;
    console.log('[whatsapp/generate-badge] Envoi WhatsApp', { to: contact.telephone, fileName, badgeUrl, badgeCode });
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: contact.telephone,
        text: whatsappText,
        documentUrl: badgeUrl,
        fileName
      })
    });
    console.log('[whatsapp/generate-badge] WhatsApp envoyé');
  } catch (e) {
    console.error('[whatsapp/generate-badge] Erreur envoi WhatsApp badge:', e);
  }

  res.status(200).json({ success: true, badgeUrl, badgeCode });

} 


