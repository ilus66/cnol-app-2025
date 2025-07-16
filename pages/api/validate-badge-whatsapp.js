import { generateBadge } from '../../lib/generateBadge';

const { createClient } = require('@supabase/supabase-js');
const supabaseServiceRole = createClient(
  'https://otmttpiqeehfquoqycol.supabase.co', // même URL que dans validate.js
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  console.log('[validate-badge-whatsapp] Handler called');
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { id } = req.body; // ou telephone, selon ta clé primaire
  if (!id) {
    return res.status(400).json({ message: 'ID requis' });
  }

  console.log('[validate-badge-whatsapp] Recherche user WhatsApp id:', id);
  // Récupérer le participant WhatsApp
  const { data: user, error: fetchError } = await supabaseServiceRole
    .from('whatsapp')
    .select('*')
    .eq('id', id)
    .single();
  if (fetchError || !user) {
    console.error('[validate-badge-whatsapp] User not found', fetchError);
    return res.status(404).json({ message: 'Participant WhatsApp non trouvé', error: fetchError?.message });
  }
  console.log('[validate-badge-whatsapp] User trouvé', user);

  // Générer le badge PDF
  let pdfBuffer;
  try {
    console.log('[validate-badge-whatsapp] Données pour generateBadge', {
      name: user.nom,
      function: user.fonction || '',
      city: user.ville || '',
      email: user.email || '',
      userId: user.id,
      identifiant_badge: user.identifiant_badge || '',
    });
    pdfBuffer = await generateBadge({
      name: user.nom,
      function: user.fonction || '',
      city: user.ville || '',
      email: user.email || '',
      userId: user.id,
      identifiant_badge: user.identifiant_badge || '',
    });
    console.log('[validate-badge-whatsapp] PDF généré (buffer) OK');
  } catch (err) {
    console.error('[validate-badge-whatsapp] Erreur génération badge', err);
    return res.status(500).json({ message: 'Erreur génération badge PDF', error: err.message });
  }

  // Construire le nom de fichier safe
  const safeName = (user.nom || '').toLowerCase().normalize('NFD').replace(/[^a-zA-Z0-9]/g, '-');
  const fileName = `badge-cnol2025-${safeName}.pdf`;

  // Upload dans le bucket 'logos' avec le client service_role
  try {
    console.log('[validate-badge-whatsapp] Tentative upload dans logos:', fileName);
    const { data: uploadData, error: uploadError } = await supabaseServiceRole.storage
      .from('logos')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });
    if (uploadError) {
      console.error('[validate-badge-whatsapp] Erreur upload badge', uploadError);
      return res.status(500).json({ message: 'Erreur upload badge PDF', error: uploadError.message });
    }
    console.log('[validate-badge-whatsapp] Upload OK', uploadData);
  } catch (e) {
    console.error('[validate-badge-whatsapp] Exception upload badge', e);
    return res.status(500).json({ message: 'Exception upload badge PDF', error: e.message });
  }

  // Récupérer l'URL publique
  let badgeUrl = null;
  try {
    const { data: publicUrlData } = supabaseServiceRole.storage.from('logos').getPublicUrl(fileName);
    badgeUrl = publicUrlData?.publicUrl;
    console.log('[validate-badge-whatsapp] URL publique:', badgeUrl);
  } catch (e) {
    console.error('[validate-badge-whatsapp] Erreur récupération URL publique', e);
  }

  // Met à jour le statut du participant WhatsApp dans la table 'whatsapp'
  try {
    const { error } = await supabaseServiceRole
      .from('whatsapp')
      .update({ badge_envoye: true, badge_url: badgeUrl })
      .eq('id', id);
    if (error) {
      console.error('[validate-badge-whatsapp] Erreur update whatsapp', error);
      return res.status(500).json({ message: 'Erreur lors de la validation', error: error.message });
    }
    console.log('[validate-badge-whatsapp] Update whatsapp OK');
  } catch (e) {
    console.error('[validate-badge-whatsapp] Exception update whatsapp', e);
    return res.status(500).json({ message: 'Exception update whatsapp', error: e.message });
  }

  // Envoi WhatsApp avec le badge
  try {
    const whatsappText = `Bonjour ${user.nom},\n\nVoici votre badge nominatif CNOL 2025 en pièce jointe (PDF).\nVous pouvez aussi le télécharger ici : ${badgeUrl}\n\nMerci d'imprimer ce badge et de l'apporter le jour de l'événement.`;
    console.log('[validate-badge-whatsapp] Envoi WhatsApp', { to: user.telephone, fileName, badgeUrl });
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: user.telephone,
        text: whatsappText,
        documentUrl: badgeUrl,
        fileName
      })
    });
    console.log('[validate-badge-whatsapp] WhatsApp envoyé');
  } catch (e) {
    // On ne bloque pas la validation si l'envoi WhatsApp échoue
    console.error('[validate-badge-whatsapp] Erreur envoi WhatsApp badge:', e);
  }

  res.status(200).json({ success: true, badgeUrl });
} 