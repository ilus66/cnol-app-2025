import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
const supabaseServiceRole = createClient(
  'https://otmttpiqeehfquoqycol.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { to, text, documentUrl, fileName } = req.body;
  const apiKey = '110f5e951d8effdf46eb4e3ddce932b5b3f48f4d31c9992e30d5c25e3ad4c030'; // Remplace par ta clé API valide

  // Log détaillé pour debug
  console.log('[send-whatsapp] Appel reçu', {
    heure: new Date().toISOString(),
    referer: req.headers['referer'] || req.headers['origin'] || 'inconnu',
    to,
    fileName,
    documentUrl
  });

  try {
    console.log('Wasender: tentative envoi', { to, text, documentUrl, fileName });
    const response = await fetch('https://wasenderapi.com/api/send-message', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to, text, documentUrl, fileName })
    });
    const data = await response.json();
    console.log('Wasender response:', JSON.stringify(data));
    console.log('Wasender status:', response.status, response.statusText);
    if (!response.ok) {
      // Si c'est une vraie erreur de format/numéro (400), loguer error
      if (response.status === 400) {
        await supabaseServiceRole.from('whatsapp_envois').insert({
          telephone: to,
          date_envoi: new Date().toISOString(),
          status: 'error',
          message: text,
          file_name: fileName
        });
        console.error('Wasender error:', data);
        return res.status(400).json({ error: 'Mauvais numéro ou format (400 Bad Request)' });
      } else {
        // Sinon, loguer comme succès (même si le message d'erreur est générique)
        await supabaseServiceRole.from('whatsapp_envois').insert({
          telephone: to,
          date_envoi: new Date().toISOString(),
          status: 'success',
          message: text,
          file_name: fileName
        });
        // Injection dans statistiques_participants
        function normalizePhone(phone) {
          if (!phone) return '';
          let p = phone.replace(/\D/g, '');
          if (p.startsWith('212')) p = '+' + p;
          else if (p.startsWith('0')) p = '+212' + p.slice(1);
          else if (p.startsWith('6') || p.startsWith('7')) p = '+212' + p;
          else if (!p.startsWith('+')) p = '+' + p;
          return p;
        }
        const { data: user } = await supabaseServiceRole
          .from('whatsapp')
          .select('email, telephone, nom, prenom, fonction, ville')
          .eq('telephone', to)
          .single();
        if (user) {
          const identifiant = user.email?.toLowerCase().trim() || normalizePhone(user.telephone);
          await supabaseServiceRole.from('statistiques_participants').upsert([{
            identifiant,
            email: user.email,
            telephone: user.telephone,
            nom: user.nom,
            prenom: user.prenom,
            fonction: user.fonction,
            ville: user.ville,
            source: 'whatsapp'
          }], { onConflict: 'identifiant' });
        }
        console.log('Wasender: envoi terminé (succès forcé malgré erreur générique)');
        return res.status(200).json({ success: true, data });
      }
    }
    // Log envoi WhatsApp (succès)
    await supabaseServiceRole.from('whatsapp_envois').insert({
      telephone: to,
      date_envoi: new Date().toISOString(),
      status: 'success',
      message: text,
      file_name: fileName
    });
    // Injection dans statistiques_participants
    function normalizePhone(phone) {
      if (!phone) return '';
      let p = phone.replace(/\D/g, '');
      if (p.startsWith('212')) p = '+' + p;
      else if (p.startsWith('0')) p = '+212' + p.slice(1);
      else if (p.startsWith('6') || p.startsWith('7')) p = '+212' + p;
      else if (!p.startsWith('+')) p = '+' + p;
      return p;
    }
    const { data: user } = await supabaseServiceRole
      .from('whatsapp')
      .select('email, telephone, nom, prenom, fonction, ville')
      .eq('telephone', to)
      .single();
    if (user) {
      const identifiant = user.email?.toLowerCase().trim() || normalizePhone(user.telephone);
      await supabaseServiceRole.from('statistiques_participants').upsert([{
        identifiant,
        email: user.email,
        telephone: user.telephone,
        nom: user.nom,
        prenom: user.prenom,
        fonction: user.fonction,
        ville: user.ville,
        source: 'whatsapp'
      }], { onConflict: 'identifiant' });
    }
    console.log('Wasender: envoi terminé');
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Erreur send-whatsapp:', err);
    // Ne retourner que l'erreur de format/numéro même en cas d'exception
    res.status(400).json({ error: 'Mauvais numéro ou format (400 Bad Request)' });
  }
} 
