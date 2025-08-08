const { generateBadgeUnified } = require('../../../lib/generateBadgeUnified');

const { createClient } = require('@supabase/supabase-js');
const supabaseServiceRole = createClient(
  'https://otmttpiqeehfquoqycol.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM'
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
  
  // 1. D'abord chercher dans la table whatsapp
  let { data: contact, error: fetchError } = await supabaseServiceRole
    .from('whatsapp')
    .select('*')
    .eq('id', id)
    .single();
  
  let source = 'whatsapp';
  
  // 2. Si pas trouvé dans whatsapp, chercher dans inscription
  if (fetchError || !contact) {
    console.log('[whatsapp/generate-badge] Contact non trouvé dans whatsapp, recherche dans inscription...');
    
    const { data: inscriptionContact, error: inscriptionError } = await supabaseServiceRole
      .from('inscription')
      .select('*')
      .eq('id', id)
      .single();
    
    if (inscriptionError || !inscriptionContact) {
      console.error('[whatsapp/generate-badge] Contact introuvable dans whatsapp ET inscription', { whatsappError: fetchError?.message, inscriptionError: inscriptionError?.message });
      
      // Vérifier si l'ID existe dans une plage proche (whatsapp)
      const { data: nearbyWhatsapp } = await supabaseServiceRole
        .from('whatsapp')
        .select('id, nom, prenom, email, telephone')
        .gte('id', parseInt(id) - 5)
        .lte('id', parseInt(id) + 5)
        .order('id');
      
      // Vérifier si l'ID existe dans une plage proche (inscription)
      const { data: nearbyInscription } = await supabaseServiceRole
        .from('inscription')
        .select('id, nom, prenom, email, telephone')
        .gte('id', parseInt(id) - 5)
        .lte('id', parseInt(id) + 5)
        .order('id');
      
      if (nearbyWhatsapp && nearbyWhatsapp.length > 0) {
        console.log('[whatsapp/generate-badge] IDs proches trouvés dans whatsapp:', nearbyWhatsapp.map(c => `${c.id}: ${c.nom} ${c.prenom}`));
      }
      
      if (nearbyInscription && nearbyInscription.length > 0) {
        console.log('[whatsapp/generate-badge] IDs proches trouvés dans inscription:', nearbyInscription.map(c => `${c.id}: ${c.nom} ${c.prenom}`));
      }
      
      // Vérifier les derniers IDs
      const { data: lastWhatsappId } = await supabaseServiceRole
        .from('whatsapp')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      
      const { data: lastInscriptionId } = await supabaseServiceRole
        .from('inscription')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      
      console.log('[whatsapp/generate-badge] Derniers IDs - WhatsApp:', lastWhatsappId?.[0]?.id || 'Aucun', 'Inscription:', lastInscriptionId?.[0]?.id || 'Aucun');
      
      return res.status(404).json({ 
        success: false, 
        message: `Contact introuvable (ID: ${id}) dans whatsapp ET inscription`, 
        error: `WhatsApp: ${fetchError?.message}, Inscription: ${inscriptionError?.message}`,
        lastWhatsappId: lastWhatsappId?.[0]?.id,
        lastInscriptionId: lastInscriptionId?.[0]?.id,
        nearbyWhatsappIds: nearbyWhatsapp?.map(c => c.id) || [],
        nearbyInscriptionIds: nearbyInscription?.map(c => c.id) || []
      });
    }
    
    // Contact trouvé dans inscription
    contact = inscriptionContact;
    source = 'inscription';
    console.log('[whatsapp/generate-badge] Contact trouvé dans inscription:', contact);
  } else {
    console.log('[whatsapp/generate-badge] Contact trouvé dans whatsapp:', contact);
  }

  // Générer ou récupérer le code badge au bon format
  let badgeCode = contact.identifiant_badge;
  if (!badgeCode || !/^[0-9]{3}[A-Z]{3}$/.test(badgeCode)) {
    badgeCode = generateBadgeCode();
    // Mettre à jour la table appropriée avec ce code
    const tableName = source === 'whatsapp' ? 'whatsapp' : 'inscription';
    await supabaseServiceRole
      .from(tableName)
      .update({ identifiant_badge: badgeCode })
      .eq('id', id);
    console.log(`[whatsapp/generate-badge] Nouveau code badge généré et stocké dans ${tableName}:`, badgeCode);
  } else {
    console.log('[whatsapp/generate-badge] Code badge existant et valide:', badgeCode);
  }

  // Générer le badge PDF
  let pdfBuffer;
  try {
    const userData = {
      prenom: contact.prenom || '',
      nom: contact.nom || '',
      function: contact.fonction || '',
      city: contact.ville || '',
      email: contact.email || '',
      userId: contact.telephone || '',
      badgeCode: badgeCode,
      date: '10 OCT. 2025',
      heure: '09H00',
      dateFin: '12 OCT. 2025',
      heureFin: '18H00',
      lieu: 'Centre de conférences Fm6education - Av. Allal Al Fassi RABAT'
    };
    console.log('[whatsapp/generate-badge] Données pour generateBadgeUnified', userData);
    pdfBuffer = await generateBadgeUnified(userData);
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

  // Met à jour le statut du contact dans la table appropriée
  try {
    const tableName = source === 'whatsapp' ? 'whatsapp' : 'inscription';
    let updateData;
    
    if (source === 'whatsapp') {
      updateData = { badge_envoye: true, badge_url: badgeUrl, valide: true };
    } else {
      // Pour inscription, on utilise seulement valide (pas de badge_envoye ni badge_url)
      updateData = { valide: true };
    }
    
    const { error } = await supabaseServiceRole
      .from(tableName)
      .update(updateData)
      .eq('id', id);
    if (error) {
      console.error(`[whatsapp/generate-badge] Erreur update ${tableName}`, error);
      return res.status(500).json({ success: false, message: `Erreur lors de la validation dans ${tableName}`, error: error.message });
    }
    console.log(`[whatsapp/generate-badge] Update ${tableName} OK`);
  } catch (e) {
    console.error('[whatsapp/generate-badge] Exception update', e);
    return res.status(500).json({ success: false, message: 'Exception update', error: e.message });
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

  res.status(200).json({ success: true, badgeUrl, badgeCode, source });

} 


