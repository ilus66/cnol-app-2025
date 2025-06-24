import { generateBadge } from '../../lib/generateBadge';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
  try {
    const { nom, prenom, fonction, email, badge_code, exposant_nom } = req.body;
    // Adapter les champs pour generateBadge
    const userData = {
      name: `${prenom} ${nom}`,
      function: fonction || '',
      city: exposant_nom || '',
      email: email || '',
      userId: badge_code || '',
      identifiant_badge: badge_code || '',
    };
    const pdfBytes = await generateBadge(userData);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=badge-${prenom}-${nom}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la génération du badge' });
  }
} 