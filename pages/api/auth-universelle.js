import { supabase } from '../../lib/supabaseClient';
import fs from 'fs';
import path from 'path';
import { parse, stringify } from 'csv-parse/sync';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Méthode non autorisée' });
  const { identifiant, code } = req.body;
  if (!identifiant || !code) return res.status(400).json({ message: 'Champs requis manquants.' });

  const isEmail = identifiant.includes('@');
  let query = supabase.from('inscription').select('*').eq('code_identification', code);
  if (isEmail) {
    query = query.eq('email', identifiant);
  } else {
    // Normaliser le téléphone (supprimer espaces, +, etc.)
    const tel = identifiant.replace(/\D/g, '');
    query = query.ilike('telephone', `%${tel}`);
  }
  const { data, error } = await query.single();
  if (data && !error) {
    return res.status(200).json({ success: true, message: 'Connexion réussie.', user: { id: data.id, nom: data.nom, prenom: data.prenom } });
  }

  // Si non trouvé dans inscription et identifiant = téléphone, chercher dans whatsapp.csv
  if (!isEmail) {
    try {
      const whatsappPath = path.join(process.cwd(), 'whatsapp.csv');
      const csvContent = fs.readFileSync(whatsappPath, 'utf8');
      const records = parse(csvContent, { columns: true, skip_empty_lines: true });
      const tel = identifiant.replace(/\D/g, '');
      const contact = records.find(r => (r.telephone || '').replace(/\D/g, '').endsWith(tel) && r.code_identification === code);
      if (contact) {
        if (!contact.email || contact.email.trim() === '') {
          // Email manquant, demander la saisie
          return res.status(200).json({ success: false, needEmail: true, message: 'Email requis', contact: { nom: contact.nom, prenom: contact.prenom, telephone: contact.telephone, code_identification: contact.code_identification } });
        } else {
          // Email présent, prêt à créer dans inscription (à faire dans la suite du flux)
          return res.status(200).json({ success: true, fromWhatsapp: true, contact });
        }
      }
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Erreur lecture WhatsApp.' });
    }
  }
  return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
} 