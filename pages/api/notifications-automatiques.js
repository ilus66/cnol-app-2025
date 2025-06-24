import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    // Exécuter les vérifications automatiques
    await checkAdminNotifications();
    await checkExposantNotifications();
    await checkNewContacts();

    res.status(200).json({ message: 'Notifications automatiques traitées avec succès' });
  } catch (error) {
    console.error('Erreur notifications automatiques:', error);
    res.status(500).json({ message: 'Erreur lors du traitement des notifications' });
  }
}

// Fonction pour envoyer une notification
async function sendNotification({ userId, title, message, url }) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/push/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, body: message, url })
    });
    console.log(`✅ Notification envoyée à ${userId}: ${title}`);
  } catch (error) {
    console.error(`❌ Erreur envoi notification à ${userId}:`, error);
  }
}

// 1. Notifications pour l'admin (quotas atteints, inactivité)
async function checkAdminNotifications() {
  console.log('🔍 Vérification des notifications admin...');
  
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  
  // Exposants avec quota atteint
  const { data: exposantsQuota } = await supabaseAdmin
    .from('exposants')
    .select('*')
    .eq('quota_push_date', today)
    .gte('quota_push_utilise', 'quota_push_journalier');
  
  // Exposants inactifs (pas de scans depuis 24h)
  const { data: scansRecents } = await supabaseAdmin
    .from('leads')
    .select('exposant_id')
    .gte('created_at', yesterday);
  
  const exposantsActifs = [...new Set(scansRecents?.map(s => s.exposant_id) || [])];
  const { data: exposantsInactifs } = await supabaseAdmin
    .from('exposants')
    .select('*')
    .not('id', 'in', `(${exposantsActifs.join(',')})`);
  
  // Envoyer notifications à l'admin (user_id = 1 par exemple)
  if (exposantsQuota?.length > 0) {
    await sendNotification({
      userId: 1, // ID de l'admin
      title: 'Alertes quotas exposants',
      message: `${exposantsQuota.length} exposant(s) ont atteint leur quota de notifications`,
      url: '/admin/statistiques'
    });
  }
  
  if (exposantsInactifs?.length > 0) {
    await sendNotification({
      userId: 1,
      title: 'Exposants inactifs',
      message: `${exposantsInactifs.length} exposant(s) n'ont pas scanné depuis 24h`,
      url: '/admin/statistiques'
    });
  }
}

// 2. Notifications pour les exposants
async function checkExposantNotifications() {
  console.log('🔍 Vérification des notifications exposants...');
  
  const today = new Date().toISOString().slice(0, 10);
  
  // Exposants avec quota presque atteint (80% ou plus)
  const { data: exposantsQuota } = await supabaseAdmin
    .from('exposants')
    .select('*')
    .eq('quota_push_date', today)
    .gte('quota_push_utilise', 'quota_push_journalier * 0.8')
    .lt('quota_push_utilise', 'quota_push_journalier');
  
  for (const exp of exposantsQuota || []) {
    const restant = exp.quota_push_journalier - exp.quota_push_utilise;
    await sendNotification({
      userId: exp.id, // Ou l'ID du responsable exposant
      title: 'Quota notifications',
      message: `Il vous reste ${restant} notification(s) pour aujourd'hui`,
      url: `/envoyer-notification?exposant_id=${exp.id}`
    });
  }
}

// 3. Notifications de nouveaux contacts (optionnel)
async function checkNewContacts() {
  console.log('🔍 Vérification des nouveaux contacts...');
  
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  // Nouveaux scans par exposant
  const { data: nouveauxScans } = await supabaseAdmin
    .from('leads')
    .select(`
      exposant_id,
      exposants(nom, email_responsable)
    `)
    .gte('created_at', yesterday)
    .order('created_at', { ascending: false });
  
  // Grouper par exposant
  const scansParExposant = {};
  nouveauxScans?.forEach(scan => {
    if (!scansParExposant[scan.exposant_id]) {
      scansParExposant[scan.exposant_id] = {
        nom: scan.exposants.nom,
        count: 0
      };
    }
    scansParExposant[scan.exposant_id].count++;
  });
  
  // Notifier chaque exposant
  for (const [exposantId, data] of Object.entries(scansParExposant)) {
    if (data.count > 0) {
      await sendNotification({
        userId: parseInt(exposantId), // Ou l'ID du responsable
        title: 'Nouveaux contacts',
        message: `${data.count} nouveau(x) contact(s) scanné(s) aujourd'hui`,
        url: `/admin/exposant/${exposantId}`
      });
    }
  }
} 