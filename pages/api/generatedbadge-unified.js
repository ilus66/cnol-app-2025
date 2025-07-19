import { supabase } from '../../lib/supabaseClient'
const { generateBadgeUnified } = require('../../lib/generateBadgeUnified')

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { id } = req.query
  if (!id) {
    return res.status(400).json({ message: 'Paramètre id manquant' })
  }

  // Récupérer l'inscrit
  const { data: inscrit, error } = await supabase
    .from('inscription')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !inscrit) {
    return res.status(404).json({ message: 'Inscrit non trouvé' })
  }

  // Vérifier que l'inscription est validée
  if (!inscrit.valide) {
    return res.status(403).json({ 
      message: 'Accès refusé : Votre inscription doit être validée par l\'administrateur avant de pouvoir télécharger votre badge.' 
    })
  }

  try {
    // Préparer les données pour le badge (adapté pour test-badge)
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
      userId: `cnol2025-${inscrit.id}` // Ajout pour QR code
    }
    console.log('userData pour badge unified:', userData);

    // Générer le PDF (Buffer)
    const pdfBuffer = await generateBadgeUnified(userData)

    // Générer un nom de fichier robuste
    function toAscii(str) {
      return (str || '').normalize('NFD').replace(/[^\x00-\x7F]/g, '').replace(/[^a-zA-Z0-9-_]/g, '');
    }
    const prenom = inscrit.prenom || '';
    const nom = inscrit.nom || '';
    let filename = '';
    if (prenom && nom) {
      filename = `badge-unified-${toAscii(prenom.toLowerCase())}-${toAscii(nom.toLowerCase())}.pdf`;
    } else if (!prenom && nom) {
      filename = `badge-unified-${toAscii(nom.toLowerCase())}.pdf`;
    } else {
      filename = `badge-unified-inconnu.pdf`;
    }
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', pdfBuffer.length)
    res.send(Buffer.from(pdfBuffer))
  } catch (e) {
    res.status(500).json({ message: 'Erreur lors de la génération du badge', error: e.message })
  }
} 