import { supabase } from '../../lib/supabaseClient';
import { generateBadge } from '../../lib/generateBadge';
import sendBadgeEmail from '../../lib/sendBadgeEmail';

// Fonction pour faire un nom safe (à copier aussi dans generateBadge.js)
function makeSafeFileName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID manquant' });
  }

  try {
    // id exemple: 'cnol2025-jean-barnard'
    // Extraire prénom-nom
    const prefix = 'cnol2025-';
    if (!id.startsWith(prefix)) {
      return res.status(400).json({ message: 'Format d\'ID invalide' });
    }

    const safeName = id.slice(prefix.length); // 'jean-barnard'

    // Rechercher inscription via prénom et nom "safe"
    // Comme la base a les colonnes prenom, nom, on doit retrouver la ligne
    // Pour cela, on normalise aussi prenom+nom en safe et on compare

    // Récupérer toutes inscriptions non validées (ou mieux, indexer côté DB)
    const { data: inscrits, error } = await supabase
      .from('inscription')
      .select('*')
      .eq('valide', false);

    if (error) {
      return res.status(500).json({ message: 'Erreur DB' });
    }

    // Chercher l'inscription qui correspond au safeName
    const inscrit = inscrits.find(i => {
      const combinedName = `${i.prenom} ${i.nom}`;
      const safeCombined = makeSafeFileName(combinedName);
      return safeCombined === safeName;
    });

    if (!inscrit) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    // Mise à jour statut valide
    const { data: updated, error: updateError } = await supabase
      .from('inscription')
      .update({ valide: true })
      .eq('id', inscrit.id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ message: 'Erreur lors de la validation' });
    }

    // Générer badge avec userId = id reçu
    const pdfBuffer = await generateBadge({
      name: `${updated.prenom} ${updated.nom}`,
      function: updated.fonction,
      city: updated.ville,
      email: updated.email,
      userId: id,  // on garde l'id dans le QR tel quel
    });

    // Envoyer mail
    await sendBadgeEmail(updated.email, `${updated.prenom} ${updated.nom}`, pdfBuffer);

    return res.status(200).json({ message: 'Inscription validée et mail envoyé.' });
  } catch (error) {
    console.error('❌ Erreur API validate:', error);
    return res.status(500).json({ message: 'Erreur serveur interne.' });
  }
}
