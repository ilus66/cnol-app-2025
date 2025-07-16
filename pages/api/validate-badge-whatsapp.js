import { generateBadge } from '../../lib/generateBadge';

const { createClient } = require('@supabase/supabase-js');
const supabaseServiceRole = createClient(
  'https://otmttpiqeehfquoqycol.supabase.co', // même URL que dans validate.js
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { id } = req.body; // ou telephone, selon ta clé primaire
  if (!id) {
    return res.status(400).json({ message: 'ID requis' });
  }

  // Récupérer le participant WhatsApp
  const { data: user, error: fetchError } = await supabaseServiceRole
    .from('whatsapp')
    .select('*')
    .eq('id', id)
    .single();
  if (fetchError || !user) {
    return res.status(404).json({ message: 'Participant WhatsApp non trouvé', error: fetchError?.message });
  }

  // Générer le badge PDF
  let pdfBuffer;
  try {
    pdfBuffer = await generateBadge({
      name: user.nom,
      function: user.fonction || '',
      city: user.ville || '',
      email: user.email || '',
      userId: user.id,
      identifiant_badge: user.identifiant_badge || '',
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur génération badge PDF', error: err.message });
  }

  // Construire le nom de fichier safe
  const safeName = (user.nom || '').toLowerCase().normalize('NFD').replace(/[^a-zA-Z0-9]/g, '-');
  const fileName = `badge-cnol2025-${safeName}.pdf`;

  // Upload dans le bucket 'logos' avec le client service_role
  const { data: uploadData, error: uploadError } = await supabaseServiceRole.storage
    .from('logos')
    .upload(fileName, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true
    });
  if (uploadError) {
    return res.status(500).json({ message: 'Erreur upload badge PDF', error: uploadError.message });
  }

  // Récupérer l'URL publique
  const { data: publicUrlData } = supabaseServiceRole.storage.from('logos').getPublicUrl(fileName);
  const badgeUrl = publicUrlData?.publicUrl;

  // Met à jour le statut du participant WhatsApp dans la table 'whatsapp'
  const { error } = await supabaseServiceRole
    .from('whatsapp')
    .update({ badge_envoye: true, badge_url: badgeUrl })
    .eq('id', id);
  if (error) {
    return res.status(500).json({ message: 'Erreur lors de la validation', error: error.message });
  }

  // Envoi WhatsApp avec le badge
  try {
    const whatsappText = `Bonjour ${user.nom},\n\nVoici votre badge nominatif CNOL 2025 en pièce jointe (PDF).\nVous pouvez aussi le télécharger ici : ${badgeUrl}\n\nMerci d'imprimer ce badge et de l'apporter le jour de l'événement.`;
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
  } catch (e) {
    // On ne bloque pas la validation si l'envoi WhatsApp échoue
    console.error('Erreur envoi WhatsApp badge:', e);
  }

  res.status(200).json({ success: true, badgeUrl });
} 