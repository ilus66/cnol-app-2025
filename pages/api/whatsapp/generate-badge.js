import { createClient } from '@supabase/supabase-js';
import { generateBadge } from '../../../lib/generateBadge';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { id } = req.body;
  if (!id) {
    console.log('[generate-badge] ID manquant');
    return res.status(400).json({ success: false, message: 'ID requis' });
  }

  // Récupérer le contact WhatsApp
  const { data: contact, error } = await supabase
    .from('whatsapp')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !contact) {
    console.log('[generate-badge] Contact WhatsApp introuvable', error);
    return res.status(404).json({ success: false, message: 'Contact WhatsApp introuvable' });
  }
  console.log('[generate-badge] Contact trouvé', contact);

  try {
    // Générer le PDF du badge
    const userData = {
      name: contact.prenom ? `${contact.prenom} ${contact.nom}` : contact.nom,
      function: '',
      city: '',
      email: '',
      userId: contact.telephone,
      identifiant_badge: contact.code_badge || contact.telephone,
    };
    console.log('[generate-badge] Données pour generateBadge', userData);
    const pdfBuffer = await generateBadge(userData);
    console.log('[generate-badge] PDF généré (buffer)', pdfBuffer ? 'OK' : 'NOK');
    const fileName = `badge-whatsapp-${contact.telephone}.pdf`;
    // Uploader dans le bucket Supabase Storage (ex: 'badges')
    const { error: uploadError } = await supabase.storage
      .from('badges')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });
    if (uploadError) {
      console.log('[generate-badge] Erreur upload badge', uploadError);
      return res.status(500).json({ success: false, message: 'Erreur upload badge', error: uploadError.message });
    }
    // Générer l’URL publique
    const { publicURL } = supabase.storage.from('badges').getPublicUrl(fileName);
    console.log('[generate-badge] URL publique générée', publicURL);
    return res.status(200).json({ success: true, badgeUrl: publicURL });
  } catch (e) {
    console.log('[generate-badge] Erreur catch', e);
    return res.status(500).json({ success: false, message: 'Erreur génération badge', error: e.message });
  }
} 