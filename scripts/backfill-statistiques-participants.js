// Script de backfill pour statistiques_participants
// Synchronise tous les inscrits (inscription + whatsapp) dans statistiques_participants

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM'; // Remplacer par la vraie clé service_role
const supabase = createClient(supabaseUrl, supabaseKey);

function normalizePhone(phone) {
  if (!phone) return '';
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('212')) p = '+' + p;
  else if (p.startsWith('0')) p = '+212' + p.slice(1);
  else if (p.startsWith('6') || p.startsWith('7')) p = '+212' + p;
  else if (!p.startsWith('+')) p = '+' + p;
  return p;
}

async function syncAll() {
  // 1. Inscriptions classiques
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;
  let total = 0;
  while (hasMore) {
    const { data: inscriptions, error } = await supabase
      .from('inscription')
      .select('*')
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!inscriptions || inscriptions.length === 0) break;
    for (const user of inscriptions) {
      const identifiant = user.email?.toLowerCase().trim() || normalizePhone(user.telephone);
      await supabase.from('statistiques_participants').upsert([{
        identifiant,
        email: user.email,
        telephone: user.telephone,
        nom: user.nom,
        prenom: user.prenom,
        fonction: user.fonction || 'Opticien',
        ville: user.ville,
        source: 'inscription',
        statut: user.status || user.valide || 'inconnu',
        date_injection: user.created_at || new Date().toISOString()
      }], { onConflict: 'identifiant' });
      total++;
    }
    from += pageSize;
    hasMore = inscriptions.length === pageSize;
  }
  // 2. Inscriptions WhatsApp
  from = 0;
  hasMore = true;
  while (hasMore) {
    const { data: whatsapp, error } = await supabase
      .from('whatsapp')
      .select('*')
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!whatsapp || whatsapp.length === 0) break;
    for (const user of whatsapp) {
      const identifiant = user.email?.toLowerCase().trim() || normalizePhone(user.telephone);
      await supabase.from('statistiques_participants').upsert([{
        identifiant,
        email: user.email,
        telephone: user.telephone,
        nom: user.nom,
        prenom: user.prenom,
        fonction: user.fonction || 'Opticien',
        ville: user.ville,
        source: 'whatsapp',
        statut: user.status || user.valide || 'inconnu',
        date_injection: user.date_import || new Date().toISOString()
      }], { onConflict: 'identifiant' });
      total++;
    }
    from += pageSize;
    hasMore = whatsapp.length === pageSize;
  }
  console.log(`✅ Synchro terminée. Total synchronisés : ${total}`);
}

syncAll().catch(e => { console.error('❌ Erreur synchro:', e); process.exit(1); }); 