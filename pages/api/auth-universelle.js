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
  console.log('[AUTH-UNIVERSELLE] Recherche inscription:', { identifiant, code, isEmail, data, error });
  if (data && !error) {
    return res.status(200).json({ success: true, message: 'Connexion réussie.', user: { id: data.id, nom: data.nom, prenom: data.prenom } });
  }

  // Si non trouvé dans inscription et identifiant = téléphone, chercher dans whatsapp
  if (!isEmail) {
    try {
      const tel = identifiant.replace(/\D/g, '');
      const { data: whatsappRows, error: whatsappError } = await supabase
        .from('whatsapp')
        .select('*');
      if (whatsappError) {
        console.log('[AUTH-UNIVERSELLE] Erreur lecture WhatsApp:', whatsappError);
        return res.status(500).json({ success: false, message: 'Erreur lecture WhatsApp.' });
      }
      const codeNorm = (code || '').toString().trim().toLowerCase();
      const contact = (whatsappRows || []).find(r => {
        const telDb = (r.telephone || '').replace(/\D/g, '');
        const codeDb = (r.code_identification || '').toString().trim().toLowerCase();
        return telDb.endsWith(tel) && codeDb === codeNorm;
      });
      console.log('[AUTH-UNIVERSELLE] Recherche WhatsApp:', { tel, codeNorm, contact });
      if (contact) {
        if (!contact.email || contact.email.trim() === '') {
          return res.status(200).json({ success: false, needEmail: true, message: 'Email requis', contact: { nom: contact.nom, prenom: contact.prenom, telephone: contact.telephone, code_identification: contact.code_identification } });
        } else {
          return res.status(200).json({ success: true, fromWhatsapp: true, contact });
        }
      }
    } catch (e) {
      console.log('[AUTH-UNIVERSELLE] Exception WhatsApp:', e);
      return res.status(500).json({ success: false, message: 'Erreur lecture WhatsApp.' });
    }
  }
  return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
} 