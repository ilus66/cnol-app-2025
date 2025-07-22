// pages/api/generatedbadge.js
import { supabase } from '../../lib/supabaseClient'
// import { generateBadge } from '../../lib/generateBadge'
import { generateBadgeUnified } from '../../lib/generateBadgeUnified'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { identifiant_badge } = req.query
  if (!identifiant_badge) {
    return res.status(400).json({ message: 'Paramètre identifiant_badge manquant' })
  }

  // Récupérer l'inscrit dans inscription, puis dans whatsapp si non trouvé
  let { data: inscrit, error } = await supabase
    .from('inscription')
    .select('*')
    .eq('identifiant_badge', identifiant_badge)
    .single();
  let source = 'inscription';
  if (error || !inscrit) {
    // Chercher dans whatsapp
    const { data: inscritW, error: errorW } = await supabase
      .from('whatsapp')
      .select('*')
      .eq('identifiant_badge', identifiant_badge)
      .single();
    if (errorW || !inscritW) {
      return res.status(404).json({ message: 'Inscrit non trouvé' });
    }
    inscrit = inscritW;
    source = 'whatsapp';
  }

  // Vérifier que l'inscription est validée (si champ existe)
  if (typeof inscrit.valide !== 'undefined' && inscrit.valide === false) {
    return res.status(403).json({ 
      message: 'Accès refusé : Votre inscription doit être validée par l\'administrateur avant de pouvoir télécharger votre badge.' 
    });
  }

  try {
    // Préparer les données pour le badge (format adapté à generateBadgeUnified)
    const userData = {
      prenom: inscrit.prenom,
      nom: inscrit.nom,
      function: inscrit.fonction,
      city: inscrit.ville,
      badgeCode: inscrit.identifiant_badge ? String(inscrit.identifiant_badge) : 'TEST123',
      date: '10 OCT. 2025',
      heure: inscrit.heure_debut || '09H00',
      dateFin: '12 OCT. 2025',
      heureFin: inscrit.heure_fin || '18H00',
      lieu: inscrit.lieu || 'Centre de conférences Fm6education - Av. Allal Al Fassi RABAT',
      userId: `cnol2025-${inscrit.id}`,
      organisation: inscrit.organisation,
      participant_type: inscrit.participant_type
    }
    // Ancienne version (en cas de rollback rapide)
    // const pdfBuffer = await generateBadge({
    //   name: (inscrit.prenom && inscrit.nom)
    //     ? `${inscrit.prenom} ${inscrit.nom}`
    //     : inscrit.nom || inscrit.prenom || 'Inconnu',
    //   function: inscrit.fonction,
    //   city: inscrit.ville,
    //   email: inscrit.email,
    //   userId: `cnol2025-${inscrit.id}`,
    //   identifiant_badge: inscrit.identifiant_badge,
    // })
    // Nouvelle version unifiée :
    const pdfBuffer = await generateBadgeUnified(userData)

    // Générer un nom de fichier robuste
    function toAscii(str) {
      return (str || '').normalize('NFD').replace(/[^\x00-\x7F]/g, '').replace(/[^a-zA-Z0-9-_]/g, '');
    }
    const prenom = inscrit.prenom || '';
    const nom = inscrit.nom || '';
    let filename = '';
    if (prenom && nom) {
      filename = `badge-${toAscii(prenom.toLowerCase())}-${toAscii(nom.toLowerCase())}.pdf`;
    } else if (!prenom && nom) {
      filename = `badge-${toAscii(nom.toLowerCase())}.pdf`;
    } else {
      filename = `badge-inconnu.pdf`;
    }
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${filename}"`
    )
    // IMPORTANT : use .end() to send raw buffer
    return res.status(200).end(pdfBuffer)
  } catch (err) {
    console.error('Erreur génération badge :', err)
    return res
      .status(500)
      .json({ message: 'Erreur serveur lors de la génération du badge' })
  }
}
