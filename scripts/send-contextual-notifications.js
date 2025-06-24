// Script Node.js pour envoi de notifications contextuelles (rappels)
// Usage : node scripts/send-contextual-notifications.js

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_PUSH_SEND = process.env.API_PUSH_SEND || 'http://localhost:3000/api/push/send';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const MINUTES_BEFORE = 10; // Rappel X minutes avant

function isWithinMinutes(dateStr, minutes) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = (date - now) / 60000;
  return diff > 0 && diff <= minutes;
}

async function sendNotification({ userId, title, message, url }) {
  await fetch(API_PUSH_SEND, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, title, body: message, url })
  });
}

async function main() {
  // 1. Rappels programme général (à tous)
  const { data: sessions } = await supabase.from('programme_general').select('*');
  for (const session of sessions) {
    // On suppose que session.heure est de la forme "HH:MM" ou "HHHMM – HH:MM"
    // On prend la première heure
    const heureDebut = session.heure.split('–')[0].trim();
    const dateStr = `${session.jour} ${heureDebut}`;
    const sessionDate = new Date(`${dateStr}`);
    if (isWithinMinutes(sessionDate, MINUTES_BEFORE)) {
      // Notif à tous les users ayant activé le push
      const { data: users } = await supabase.from('inscription').select('id');
      for (const user of users) {
        await sendNotification({
          userId: user.id,
          title: `Rappel : ${session.titre}`,
          message: `La session "${session.titre}" commence à ${heureDebut} en salle ${session.salle}.`,
          url: '/programme'
        });
      }
    }
  }

  // 2. Rappels ateliers réservés
  const { data: reservationsAteliers } = await supabase
    .from('reservations_ateliers')
    .select('id, user_id, ateliers(date_heure, titre, intervenant)');
  for (const res of reservationsAteliers) {
    if (res.ateliers && isWithinMinutes(res.ateliers.date_heure, MINUTES_BEFORE)) {
      await sendNotification({
        userId: res.user_id,
        title: `Rappel : Atelier "${res.ateliers.titre}"`,
        message: `Votre atelier "${res.ateliers.titre}" commence à ${new Date(res.ateliers.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`,
        url: '/reservation-ateliers'
      });
    }
  }

  // 3. Rappels masterclass réservées
  const { data: reservationsMaster } = await supabase
    .from('reservations_masterclass')
    .select('id, user_id, masterclasses:masterclass(date_heure, titre, intervenant)');
  for (const res of reservationsMaster) {
    if (res.masterclasses && isWithinMinutes(res.masterclasses.date_heure, MINUTES_BEFORE)) {
      await sendNotification({
        userId: res.user_id,
        title: `Rappel : Masterclass "${res.masterclasses.titre}"`,
        message: `Votre masterclass "${res.masterclasses.titre}" commence à ${new Date(res.masterclasses.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`,
        url: '/reservation-masterclass'
      });
    }
  }

  console.log('Notifications contextuelles envoyées (si sessions à venir)');
}

main(); 