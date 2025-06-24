import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { exposant_id } = req.body;
  if (!exposant_id) {
    return res.status(400).json({ message: 'exposant_id requis' });
  }

  try {
    // Récupérer les contacts de l'exposant
    const { data: contacts } = await supabase
      .from('leads')
      .select(`
        created_at,
        visiteur:inscription(nom, prenom, email, fonction, societe),
        staff:staff_exposant(prenom, nom),
        exposant:exposants(nom)
      `)
      .eq('exposant_id', exposant_id)
      .order('created_at', { ascending: false });

    if (!contacts || contacts.length === 0) {
      return res.status(404).json({ message: 'Aucun contact trouvé pour cet exposant' });
    }

    // Récupérer le nom de l'exposant
    const exposantNom = contacts[0].exposant?.nom || 'Exposant';

    // Générer le CSV
    const headers = ['Nom', 'Prénom', 'Email', 'Fonction', 'Société', 'Date de scan', 'Scanné par'];
    const csvRows = [headers.join(',')];

    contacts.forEach(contact => {
      const row = [
        contact.visiteur?.nom || '',
        contact.visiteur?.prenom || '',
        contact.visiteur?.email || '',
        contact.visiteur?.fonction || '',
        contact.visiteur?.societe || '',
        new Date(contact.created_at).toLocaleDateString('fr-FR'),
        contact.staff ? `${contact.staff.prenom} ${contact.staff.nom}` : 'Exposant principal'
      ].map(field => `"${field}"`).join(',');
      
      csvRows.push(row);
    });

    const csvContent = csvRows.join('\n');
    const buffer = Buffer.from(csvContent, 'utf-8');

    // En-têtes pour le téléchargement
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="contacts-${exposantNom}-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);

  } catch (error) {
    console.error('Erreur export contacts:', error);
    res.status(500).json({ message: 'Erreur lors de l\'export des contacts' });
  }
} 