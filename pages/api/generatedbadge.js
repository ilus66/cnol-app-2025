// pages/api/generatedbadge.js
import { supabase } from '../../lib/supabaseClient'
import { generateBadgeUnified } from '../../lib/generateBadgeUnified'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { identifiant_badge, id, source } = req.query

  // Vérifier les paramètres requis
  if (!identifiant_badge && !id) {
    return res.status(400).json({ 
      message: 'Paramètre identifiant_badge ou id manquant' 
    })
  }

  let inscrit = null;
  let tableSource = null;

  try {
    // Stratégie 1: Chercher par identifiant_badge (unique across tables)
    if (identifiant_badge) {
      // Chercher dans inscription
      let { data: inscritInscription, error: errorInscription } = await supabase
        .from('inscription')
        .select('*')
        .eq('identifiant_badge', identifiant_badge)
        .maybeSingle();

      if (!errorInscription && inscritInscription) {
        inscrit = inscritInscription;
        tableSource = 'inscription';
      } else {
        // Chercher dans whatsapp
        const { data: inscritWhatsapp, error: errorWhatsapp } = await supabase
          .from('whatsapp')
          .select('*')
          .eq('identifiant_badge', identifiant_badge)
          .maybeSingle();

        if (!errorWhatsapp && inscritWhatsapp) {
          inscrit = inscritWhatsapp;
          tableSource = 'whatsapp';
        }
      }
    }

    // Stratégie 2: Chercher par id
    if (!inscrit && id) {
      // Si source est spécifiée, chercher seulement dans cette table
      if (source) {
        if (!['inscription', 'whatsapp'].includes(source)) {
          return res.status(400).json({ 
            message: 'Paramètre source invalide. Valeurs acceptées: "inscription" ou "whatsapp"' 
          });
        }

        const { data: inscritData, error: errorData } = await supabase
          .from(source)
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!errorData && inscritData) {
          inscrit = inscritData;
          tableSource = source;
        }
      } else {
        // Pas de source spécifiée : chercher dans les deux tables
        // MAIS avec une logique pour éviter les conflits
        
        let candidats = [];
        
        // Chercher dans inscription
        const { data: inscritInscription, error: errorInscription } = await supabase
          .from('inscription')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!errorInscription && inscritInscription) {
          candidats.push({ data: inscritInscription, source: 'inscription' });
        }

        // Chercher dans whatsapp
        const { data: inscritWhatsapp, error: errorWhatsapp } = await supabase
          .from('whatsapp')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!errorWhatsapp && inscritWhatsapp) {
          candidats.push({ data: inscritWhatsapp, source: 'whatsapp' });
        }

        // Gestion des conflits
        if (candidats.length === 0) {
          // Aucun résultat trouvé
          inscrit = null;
        } else if (candidats.length === 1) {
          // Un seul résultat, parfait
          inscrit = candidats[0].data;
          tableSource = candidats[0].source;
        } else {
          // CONFLIT: Plusieurs résultats avec le même ID
          // Retourner une erreur explicite avec les options
          const details = candidats.map(c => ({
            table: c.source,
            nom: c.data.nom,
            prenom: c.data.prenom,
            identifiant_badge: c.data.identifiant_badge
          }));

          return res.status(409).json({ 
            message: `Conflit: ID ${id} trouvé dans plusieurs tables. Spécifiez le paramètre 'source' ou utilisez 'identifiant_badge'.`,
            conflits: details,
            solutions: [
              `?id=${id}&source=inscription`,
              `?id=${id}&source=whatsapp`,
              details[0].identifiant_badge ? `?identifiant_badge=${details[0].identifiant_badge}` : null,
              details[1].identifiant_badge ? `?identifiant_badge=${details[1].identifiant_badge}` : null,
            ].filter(Boolean)
          });
        }
      }
    }

    // Si toujours pas trouvé
    if (!inscrit) {
      let criteriaUsed = '';
      if (identifiant_badge) {
        criteriaUsed = `identifiant_badge: ${identifiant_badge}`;
      } else if (id && source) {
        criteriaUsed = `id: ${id} dans table: ${source}`;
      } else if (id) {
        criteriaUsed = `id: ${id}`;
      }
      
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
      badgeCode: inscrit.identifiant_badge ? String(inscrit.identifiant_badge) : `${tableSource}-${inscrit.id}`,
      date: '10 OCT. 2025',
      heure: inscrit.heure_debut || '09H00',
      dateFin: '12 OCT. 2025',
      heureFin: inscrit.heure_fin || '18H00',
      lieu: inscrit.lieu || 'Centre de conférences Fm6education - Av. Allal Al Fassi RABAT',
      userId: `cnol2025-${tableSource}-${inscrit.id}`,
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
    const identifiantBadge = inscrit.identifiant_badge || `${tableSource}-${inscrit.id}`;
    
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

    // Headers pour debug (optionnel, à supprimer en production)
    res.setHeader('X-Debug-Source', tableSource)
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
