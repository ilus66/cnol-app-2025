import { generateBadgeUnified } from '../../../lib/generateBadgeUnified';

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

  try {
    const { id } = req.body;
    if (!id) {
      console.log('[whatsapp/generate-badge] ID manquant');
      return res.status(400).json({ success: false, message: 'ID requis' });
    }

    // Convertir l'ID en nombre si possible
    const numericId = Number(id);
    if (isNaN(numericId)) {
      console.error('[whatsapp/generate-badge] ID non numérique:', id);
      return res.status(400).json({ success: false, message: 'ID doit être numérique' });
    }

    console.log('[whatsapp/generate-badge] Recherche contact WhatsApp id:', numericId);
    // Récupérer le contact WhatsApp
    const { data: contact, error: fetchError } = await supabaseServiceRole
      .from('whatsapp')
      .select('*')
      .eq('id', numericId)
      .single();
  if (fetchError || !contact) {
    console.error('[whatsapp/generate-badge] Contact WhatsApp introuvable', fetchError);
    return res.status(404).json({ success: false, message: 'Contact WhatsApp introuvable', error: fetchError?.message });
  }
  console.log('[whatsapp/generate-badge] Contact trouvé', contact);

  // Vérifier que le contact a les informations minimales requises
  if (!contact.nom) {
    console.error('[whatsapp/generate-badge] Données de contact incomplètes - nom manquant');
    return res.status(400).json({ success: false, message: 'Données de contact incomplètes - nom manquant' });
  }

  if (!contact.telephone) {
    console.error('[whatsapp/generate-badge] Données de contact incomplètes - téléphone manquant');
    return res.status(400).json({ success: false, message: 'Données de contact incomplètes - téléphone manquant' });
  }

  // Générer ou récupérer le code badge au bon format
  let badgeCode = contact.identifiant_badge;
  if (!badgeCode || !/^[0-9]{3}[A-Z]{3}$/.test(badgeCode)) {
    badgeCode = generateBadgeCode();
    // Mettre à jour la table whatsapp avec ce code
    const { error: updateError } = await supabaseServiceRole
      .from('whatsapp')
      .update({ identifiant_badge: badgeCode })
      .eq('id', numericId);
      
    if (updateError) {
      console.error('[whatsapp/generate-badge] Erreur mise à jour code badge', updateError);
      return res.status(500).json({ success: false, message: 'Erreur mise à jour code badge', error: updateError.message });
    }
    console.log('[whatsapp/generate-badge] Nouveau code badge généré et stocké:', badgeCode);
  } else {
    console.log('[whatsapp/generate-badge] Code badge existant et valide:', badgeCode);
  }

  // Générer le badge PDF
  let pdfBuffer;
  try {
    // S'assurer que tous les champs requis sont présents et au bon format
    const userData = {
      // Champs obligatoires avec valeurs par défaut si manquantes
      prenom: contact.prenom || '',
      nom: contact.nom || '',
      function: contact.fonction || 'Participant',
      city: contact.ville || '',
      email: contact.email || '',
      // Utiliser l'ID comme userId si le téléphone est manquant
      userId: contact.telephone || `wa_${numericId}`,
      // Utiliser le code badge généré
      badgeCode: badgeCode,
      // Informations sur l'événement
      date: '10 OCT. 2025',
      heure: '09H00',
      dateFin: '12 OCT. 2025',
      heureFin: '18H00',
      lieu: 'Centre de conférences Fm6education - Av. Allal Al Fassi RABAT',
      // Ajouter le champ name pour compatibilité avec l'ancienne version
      name: `${contact.prenom || ''} ${contact.nom || ''}`.trim(),
      // Ajouter identifiant_badge pour compatibilité avec l'ancienne version
      identifiant_badge: badgeCode
    };
    
    console.log('[whatsapp/generate-badge] Données pour generateBadgeUnified', userData);
    
    try {
      pdfBuffer = await generateBadgeUnified(userData);
      console.log('[whatsapp/generate-badge] PDF généré (buffer) OK');
    } catch (badgeErr) {
      console.error('[whatsapp/generate-badge] Erreur détaillée génération badge', badgeErr);
      throw new Error(`Erreur génération badge: ${badgeErr.message}`);
    }
  } catch (err) {
    console.error('[whatsapp/generate-badge] Erreur génération badge', err);
    return res.status(500).json({ success: false, message: 'Erreur génération badge PDF', error: err.message });
  }

  // Construire le nom de fichier safe (nom-prenom)
  const safeNom = (contact.nom || '').toLowerCase().normalize('NFD').replace(/[^a-zA-Z0-9]/g, '-');
  const safePrenom = (contact.prenom || '').toLowerCase().normalize('NFD').replace(/[^a-zA-Z0-9]/g, '-');
  const fileName = `badge-cnol2025-${safeNom}-${safePrenom}.pdf`;

  // Upload dans le bucket 'logos' avec le client service_role
  let badgeUrl = null;
  try {
    console.log('[whatsapp/generate-badge] Tentative upload dans logos:', fileName);
    
    // Vérifier que le buffer PDF est valide
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Buffer PDF invalide ou vide');
    }
    
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
    
    // Récupérer l'URL publique
    try {
      const { data: publicUrlData } = supabaseServiceRole.storage.from('logos').getPublicUrl(fileName);
      badgeUrl = publicUrlData?.publicUrl;
      
      if (!badgeUrl) {
        throw new Error('URL publique non disponible');
      }
      
      console.log('[whatsapp/generate-badge] URL publique:', badgeUrl);
    } catch (urlError) {
      console.error('[whatsapp/generate-badge] Erreur récupération URL publique', urlError);
      throw new Error(`Erreur récupération URL publique: ${urlError.message}`);
    }
  } catch (e) {
    console.error('[whatsapp/generate-badge] Exception upload badge', e);
    return res.status(500).json({ success: false, message: 'Exception upload badge PDF', error: e.message });
  }

  // Met à jour le statut du contact WhatsApp dans la table 'whatsapp'
  try {
    // Préparer les données de mise à jour
    const updateData = {
      badge_envoye: true,
      badge_url: badgeUrl,
      valide: true,  // Ajout de la validation automatique
      updated_at: new Date().toISOString() // Ajouter un timestamp de mise à jour
    };
    
    console.log('[whatsapp/generate-badge] Mise à jour whatsapp avec données:', updateData);
    
    const { error } = await supabaseServiceRole
      .from('whatsapp')
      .update(updateData)
      .eq('id', numericId); // Utiliser numericId au lieu de id
      
    if (error) {
      console.error('[whatsapp/generate-badge] Erreur update whatsapp', error);
      return res.status(500).json({ success: false, message: 'Erreur lors de la validation', error: error.message });
    }
    
    // Vérifier que la mise à jour a bien été effectuée
    const { data: updatedContact, error: checkError } = await supabaseServiceRole
      .from('whatsapp')
      .select('*')
      .eq('id', numericId)
      .single();
      
    if (checkError) {
      console.error('[whatsapp/generate-badge] Erreur vérification mise à jour', checkError);
      // Ne pas bloquer le processus, mais logger l'erreur
    } else if (!updatedContact.badge_envoye) {
      console.error('[whatsapp/generate-badge] La mise à jour n\'a pas été appliquée correctement');
      // Ne pas bloquer le processus, mais logger l'erreur
    } else {
      console.log('[whatsapp/generate-badge] Update whatsapp OK, contact mis à jour:', updatedContact);
    }
  } catch (e) {
    console.error('[whatsapp/generate-badge] Exception update whatsapp', e);
    return res.status(500).json({ success: false, message: 'Exception update whatsapp', error: e.message });
  }

  // Envoi WhatsApp avec le badge (nouveau message complet)
  try {
    // Vérifier que nous avons un numéro de téléphone valide
    if (!contact.telephone) {
      throw new Error('Numéro de téléphone manquant pour l\'envoi WhatsApp');
    }
    
    // Vérifier que nous avons une URL de badge valide
    if (!badgeUrl) {
      throw new Error('URL du badge manquante pour l\'envoi WhatsApp');
    }
    
    const whatsappText = `Bonjour ${contact.nom?.toUpperCase()} ${contact.prenom ? contact.prenom.toUpperCase() : ''},\n\nVotre nouveau badge nominatif CNOL 2025 est en pièce jointe (PDF).\n\nVous pouvez également le télécharger ici :\n${badgeUrl}\n\nNous vous rappelons vos identifiants d'accès à l'application CNOL 2025 (programme, notifications, espace personnel...) :\n\nSite web : https://www.app.cnol.ma\nTéléphone : ${contact.telephone}\nCode badge : ${badgeCode}\n\nMerci d'imprimer ce badge et de l'apporter le jour de l'événement.\n\nÀ bientôt !\n\nSuivez CNOL sur Instagram @cnol_maroc`;
    
    console.log('[whatsapp/generate-badge] Envoi WhatsApp', { to: contact.telephone, fileName, badgeUrl, badgeCode });
    
    const whatsappRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: contact.telephone,
        text: whatsappText,
        documentUrl: badgeUrl,
        fileName
      })
    });
    
    if (!whatsappRes.ok) {
      const errorText = await whatsappRes.text();
      console.error('[whatsapp/generate-badge] Erreur API WhatsApp:', errorText);
      // Ne pas bloquer le processus, mais logger l'erreur
    } else {
      console.log('[whatsapp/generate-badge] WhatsApp envoyé avec succès');
    }
  } catch (e) {
    console.error('[whatsapp/generate-badge] Erreur envoi WhatsApp badge:', e);
    // Ne pas bloquer le processus, mais logger l'erreur
  }

  res.status(200).json({ success: true, badgeUrl, badgeCode });

  } catch (error) {
    console.error('[whatsapp/generate-badge] Erreur globale:', error);
    // Éviter de renvoyer une réponse si une a déjà été envoyée
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la génération du badge',
        error: error.message
      });
    }
  }
}


