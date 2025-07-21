import { supabase } from '../../../lib/supabaseClient';
import sendBadgeEmail from '../../../lib/sendBadgeEmail';
import { generateBadgeUnified } from '../../../lib/generateBadgeUnified';

function generateStaffBadgeCode() {
  const digits = Math.floor(100 + Math.random() * 900); // 3 chiffres
  const letters = Array(3).fill(0).map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
  return `${digits}${letters}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { nom, prenom, email, telephone, fonction, exposant_id, organisation } = req.body;
  if (!nom || !prenom || !email || !fonction || !exposant_id || !organisation) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }
  // Générer un identifiant badge unique (4 chiffres + 4 lettres, sans préfixe)
  const badgeCode = generateStaffBadgeCode();

  // 1. Ajout dans la base
  const { data, error } = await supabase.from('inscription').insert({
    nom,
    prenom,
    email,
    telephone,
    participant_type: 'staff',
    organisation,
    exposant_id,
    identifiant_badge: badgeCode,
    valide: true,
    created_at: new Date().toISOString(),
    fonction,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });

  // 2. Générer le PDF du badge
  let pdfBuffer;
  try {
    const userData = {
      prenom,
      nom,
      function: fonction,
      city: '',
      badgeCode: badgeCode,
      date: '10 OCT. 2025',
      heure: '09H00',
      dateFin: '12 OCT. 2025',
      heureFin: '18H00',
      lieu: organisation || '',
      userId: badgeCode
    };
    pdfBuffer = await generateBadgeUnified(userData);
  } catch (err) {
    return res.status(500).json({ error: "Erreur lors de la génération du badge PDF : " + err.message });
  }

  // 3. Envoi du badge par email
  try {
    await sendBadgeEmail(
      email,
      `${prenom} ${nom}`,
      pdfBuffer,
      badgeCode
    );
  } catch (err) {
    return res.status(500).json({ error: "Erreur lors de l'envoi de l'email : " + err.message });
  }

  return res.status(200).json({ success: true, badgeCode });
} 