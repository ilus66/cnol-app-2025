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
    return res.status(400).json({ success: false, message: 'ID requis' });
  }

  // Récupérer le contact WhatsApp
  const { data: contact, error } = await supabase
    .from('whatsapp')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !contact) {
    return res.status(404).json({ success: false, message: 'Contact WhatsApp introuvable' });
  }

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
    const pdfBuffer = await generateBadge(userData);
    const fileName = `badge-whatsapp-${contact.telephone}.pdf`;
    // Uploader dans le bucket Supabase Storage (ex: 'badges')
    const { error: uploadError } = await supabase.storage
      .from('badges')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });
    if (uploadError) {
      return res.status(500).json({ success: false, message: 'Erreur upload badge', error: uploadError.message });
    }
    // Générer l’URL publique
    const { publicURL } = supabase.storage.from('badges').getPublicUrl(fileName);
    return res.status(200).json({ success: true, badgeUrl: publicURL });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Erreur génération badge', error: e.message });
  }
} 