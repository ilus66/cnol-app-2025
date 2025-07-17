import { supabase } from '../../lib/supabaseClient';
import fs from 'fs';
import path from 'path';
import { parse, stringify } from 'csv-parse/sync';
const cookie = require('cookie');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Méthode non autorisée' });
  const { identifiant, code } = req.body;
  if (!identifiant || !code) return res.status(400).json({ message: 'Champs requis manquants.' });

  const isEmail = identifiant.includes('@');
  let data = null;
  let error = null;
  if (isEmail) {
    // Recherche par email ET identifiant_badge (code)
    const { data: found, error: err } = await supabase
      .from('inscription')
      .select('*')
      .eq('email', identifiant)
      .eq('identifiant_badge', code);
    data = (found && found.length > 0) ? found[0] : null;
    error = err;
  } else {
    // Recherche par téléphone dans inscription
    let tel = identifiant.replace(/\D/g, '');
    if (tel.length === 10 && tel.startsWith('0')) {
      tel = '212' + tel.slice(1);
    }
    const { data: found, error: err } = await supabase
      .from('inscription')
      .select('*')
      .eq('telephone', '+' + tel)
      .eq('identifiant_badge', code);
    data = (found && found.length > 0) ? found[0] : null;
    error = err;
  }
  console.log('[AUTH-UNIVERSELLE] Recherche inscription:', { identifiant, code, isEmail, data, error });
  if (data && !error) {
    const sessionData = {
      id: data.id,
      email: data.email,
      prenom: data.prenom,
      valide: data.valide,
      participant_type: data.participant_type || 'opticien',
    };
    const sessionCookie = cookie.serialize('cnol-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'none',
    });
    res.setHeader('Set-Cookie', sessionCookie);
    return res.status(200).json({ success: true, message: 'Connexion réussie.', user: { id: data.id, nom: data.nom, prenom: data.prenom } });
  }

  // Si non trouvé dans inscription et identifiant = téléphone, chercher dans whatsapp
  if (!isEmail) {
    try {
      let tel = identifiant.replace(/\D/g, '');
      if (tel.length === 10 && tel.startsWith('0')) {
        tel = '212' + tel.slice(1);
      }
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
        const codeDb = (r.identifiant_badge || '').toString().trim().toLowerCase();
        return telDb.endsWith(tel) && codeDb === codeNorm;
      });
      console.log('[AUTH-UNIVERSELLE] Recherche WhatsApp:', { tel, codeNorm, contact });
      if (contact) {
        if (!contact.email || contact.email.trim() === '') {
          return res.status(200).json({ success: false, needEmail: true, message: 'Email requis', contact: { nom: contact.nom, prenom: contact.prenom, telephone: contact.telephone, identifiant_badge: contact.identifiant_badge } });
        } else {
          // Chercher l'utilisateur dans inscription par email
          const { data: inscrit, error: inscritError } = await supabase
            .from('inscription')
            .select('*')
            .eq('email', contact.email)
            .single();
          if (!inscrit || inscritError) {
            return res.status(401).json({ success: false, message: 'Utilisateur non trouvé dans inscription.' });
          }
          const sessionData = {
            id: inscrit.id,
            email: inscrit.email,
            prenom: inscrit.prenom,
            valide: inscrit.valide,
            participant_type: inscrit.participant_type || 'opticien',
          };
          const sessionCookie = cookie.serialize('cnol-session', JSON.stringify(sessionData), {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
            sameSite: 'none',
          });
          res.setHeader('Set-Cookie', sessionCookie);
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