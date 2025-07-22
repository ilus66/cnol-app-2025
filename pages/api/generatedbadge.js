// pages/api/generatedbadge.js
import { supabase } from '../../lib/supabaseClient'
import { generateBadgeUnified } from '../../lib/generateBadgeUnified'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { identifiant_badge, id } = req.query

  // Prioriser identifiant_badge, sinon utiliser id
  if (!identifiant_badge && !id) {
    return res.status(400).json({ 
      message: 'Paramètre identifiant_badge ou id manquant' 
    })
  }

  let inscrit = null;
  let source = null;

  try {
    // Stratégie 1: Chercher par identifiant_badge (recommandé)
    if (identifiant_badge) {
      // Chercher dans inscription
      let { data: inscritInscription, error: errorInscription } = await supabase
        .from('inscription')
        .select('*')
        .eq('identifiant_badge', identifiant_badge)
        .single();

      if (!errorInscription && inscritInscription) {
        inscrit = inscritInscription;
        source = 'inscription';
      } else {
        // Chercher dans whatsapp
        const { data: inscritWhatsapp, error: errorWhatsapp } = await supabase
          .from('whatsapp')
          .select('*')
          .eq('identifiant_badge', identifiant_badge)
          .single();

        if (!errorWhatsapp && inscritWhatsapp) {
          inscrit = inscritWhatsapp;
          source = 'whatsapp';
        }
      }
    }

    // Stratégie 2: Si pas trouvé par identifiant_badge, chercher par id (fallback)
    if (!inscrit && id) {
      // Chercher dans inscription
      let { data: inscritInscription, error: errorInscription } = await supabase
        .from('inscription')
        .select('*')
        .eq('id', id)
        .single();

      if (!errorInscription && inscritInscription) {
        inscrit = inscritInscription;
        source = 'inscription';
      } else {
        // Chercher dans whatsapp
        const { data: inscritWhatsapp, error: errorWhatsapp } = await supabase
          .from('whatsapp')
          .select('*')
          .eq('id', id)
          .single();

        if (!errorWhatsapp && inscritWhatsapp) {
          inscrit = inscritWhatsapp;
          source = 'whatsapp';
        }
      }
    }

    // Si toujours pas trouvé
    if (!inscrit) {
      const criteriaUsed = identifiant_badge ? `identifiant_badge: ${identifiant_badge}` : `id: ${id}`;
      return res.status(404).json({ 
        message: `Inscrit non trouvé avec le critère ${criteriaUsed}` 
      });
    }

  } catch (dbError) {
    console.error('Erreur base de données:', dbError);
    return res.status(500).json({ 
      message: 'Erreur lors de la recherche en base de données' 
    });
  }

  // Vérifier que l'inscription est validée (si champ existe)
  if (typeof inscrit.valide !== 'undefined' && inscrit.valide === false) {
    return res.status(403).json({ 
      message: 'Accès refusé : Votre inscription doit être validée par l\'administrateur avant de pouvoir télécharger votre badge.' 
    });
  }

  try {
    // Préparer les données pour le badge
    const userData = {
      prenom: inscrit.prenom,
      nom: inscrit.nom,
      function: inscrit.fonction,
      city: inscrit.ville,
      badgeCode: inscrit.identifiant_badge ? String(inscrit.identifiant_badge) : `${source}-${inscrit.id}`,
      date: '10 OCT. 2025',
      heure: inscrit.heure_debut || '09H00',
      dateFin: '12 OCT. 2025',
      heureFin: inscrit.heure_fin || '18H00',
      lieu: inscrit.lieu || 'Centre de conférences Fm6education - Av. Allal Al Fassi RABAT',
      userId: `cnol2025-${source}-${inscrit.id}`, // Inclure la source pour éviter les conflits
      organisation: inscrit.organisation,
      participant_type: inscrit.participant_type
    }

    // Générer le PDF
    const pdfBuffer = await generateBadgeUnified(userData)

    // Générer un nom de fichier robuste
    function toAscii(str) {
      return (str || '').normalize('NFD').replace(/[^\x00-\x7F]/g, '').replace(/[^a-zA-Z0-9-_]/g, '');
    }

    const prenom = inscrit.prenom || '';
    const nom = inscrit.nom || '';
    const identifiantBadge = inscrit.identifiant_badge || `${source}-${inscrit.id}`;
    
    let filename = '';
    if (prenom && nom) {
      filename = `badge-${toAscii(prenom.toLowerCase())}-${toAscii(nom.toLowerCase())}-${identifiantBadge}.pdf`;
    } else if (!prenom && nom) {
      filename = `badge-${toAscii(nom.toLowerCase())}-${identifiantBadge}.pdf`;
    } else {
      filename = `badge-${identifiantBadge}.pdf`;
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${filename}"`
    )

    // Ajouter des headers pour debug (optionnel, à supprimer en production)
    res.setHeader('X-Debug-Source', source)
    res.setHeader('X-Debug-ID', inscrit.id)
    res.setHeader('X-Debug-Badge-ID', inscrit.identifiant_badge || 'none')

    return res.status(200).end(pdfBuffer)

  } catch (err) {
    console.error('Erreur génération badge :', err)
    return res.status(500).json({ 
      message: 'Erreur serveur lors de la génération du badge' 
    })
  }
}
