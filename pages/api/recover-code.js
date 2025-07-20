import { supabase } from '../../lib/supabaseClient';
import { sendMail } from '../../lib/mailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { email, telephone } = req.body;
  if (!email && !telephone) {
    return res.status(400).json({ message: 'Email ou téléphone requis.' });
  }

  // Recherche utilisateur
  let user = null;
  let source = null;
  function normalizePhone(phone, defaultCountryCode = '212') {
    if (!phone) return '';
    let p = phone.replace(/[^0-9]/g, ''); // garde uniquement les chiffres
    if (p.startsWith(defaultCountryCode) && p.length > 8) {
      return '+' + p;
    }
    if (p.length === 9 && p.startsWith('6')) {
      // Cas numéro marocain sans 0 ni indicatif
      return '+212' + p;
    }
    if (p.length === 10 && p.startsWith('0')) {
      // Cas numéro marocain avec 0 initial
      return '+212' + p.slice(1);
    }
    // Pour d'autres pays ou formats, ajoute le + devant
    return '+' + p;
  }
  if (email) {
    let { data } = await supabase.from('inscription').select('*').eq('email', email.trim().toLowerCase()).single();
    if (data) { user = data; source = 'inscription'; }
    if (!user) {
      let { data: dataW } = await supabase.from('whatsapp').select('*').eq('email', email.trim().toLowerCase()).single();
      if (dataW) { user = dataW; source = 'whatsapp'; }
    }
  } else if (telephone) {
    const telNorm = normalizePhone(telephone.trim());
    const telRaw = telephone.trim();
    // Cherche avec et sans +212
    let { data } = await supabase.from('inscription').select('*').or(`telephone.eq.${telNorm},telephone.eq.${telRaw}`).single();
    if (data) { user = data; source = 'inscription'; }
    if (!user) {
      let { data: dataW } = await supabase.from('whatsapp').select('*').or(`telephone.eq.${telNorm},telephone.eq.${telRaw}`).single();
      if (dataW) { user = dataW; source = 'whatsapp'; }
    }
  }

  if (!user) {
    // Message générique pour ne pas révéler l'existence
    return res.status(200).json({ success: true, message: 'Si un compte existe, vous recevrez un message sous peu.' });
  }

  // Prépare le message
  const code = user.identifiant_badge || 'Code inconnu';
  const identifiant = user.email || user.telephone;
  const message = `Bonjour,\n\nVoici vos identifiants CNOL 2025 :\nEmail : ${user.email}\nCode badge : ${code}\n\nAccédez à votre espace : https://app.cnol.ma/mon-espace\n\nL'équipe CNOL`;

  // Envoi email ou WhatsApp
  if (email) {
    await sendMail({
      to: user.email,
      subject: 'Récupération de vos identifiants CNOL 2025',
      text: message,
      html: `<p>Bonjour,</p><p>Voici vos identifiants CNOL 2025 :</p><ul><li><b>Email :</b> ${user.email}</li><li><b>Code badge :</b> ${code}</li></ul><p><a href="https://app.cnol.ma/mon-espace">Accéder à mon espace</a></p><p>L'équipe CNOL</p>`
    });
  } else if (telephone) {
    // Envoi WhatsApp via l'API interne
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: user.telephone,
        text: message
      })
    });
  }

  return res.status(200).json({ success: true, message: 'Si un compte existe, vous recevrez un message sous peu.' });
} 