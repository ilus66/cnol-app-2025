// Script de backfill V2 pour statistiques_participants
// Version améliorée avec gestion d'erreurs et logs détaillés

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

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

function normalizeEmail(email) {
  return (email || '').toLowerCase().trim();
}

async function syncAllV2() {
  console.log('🚀 Début de la synchro V2 statistiques_participants\n');

  let totalSynced = 0;
  let errors = 0;

  try {
    // 1. Inscriptions classiques
    console.log('📊 Synchronisation des inscriptions...');
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const { data: inscriptions, error } = await supabase
        .from('inscription')
        .select('*')
        .range(from, from + pageSize - 1);
      
      if (error) {
        console.error('❌ Erreur récupération inscriptions:', error.message);
        break;
      }
      
      if (!inscriptions || inscriptions.length === 0) break;
      
      for (const user of inscriptions) {
        try {
          const email = normalizeEmail(user.email);
          const phone = normalizePhone(user.telephone);
          const identifiant = email || phone || `inscription_${user.id}`;
          
          const { error: upsertError } = await supabase
            .from('statistiques_participants')
            .upsert([{
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
          
          if (upsertError) {
            console.error(`❌ Erreur upsert inscription ${user.id}:`, upsertError.message);
            errors++;
          } else {
            totalSynced++;
          }
        } catch (e) {
          console.error(`❌ Erreur traitement inscription ${user.id}:`, e.message);
          errors++;
        }
      }
      
      from += pageSize;
      hasMore = inscriptions.length === pageSize;
      console.log(`   ✅ ${totalSynced} inscriptions synchronisées...`);
    }

    // 2. Inscriptions WhatsApp
    console.log('\n📱 Synchronisation des WhatsApp...');
    from = 0;
    hasMore = true;
    
    while (hasMore) {
      const { data: whatsapp, error } = await supabase
        .from('whatsapp')
        .select('*')
        .range(from, from + pageSize - 1);
      
      if (error) {
        console.error('❌ Erreur récupération WhatsApp:', error.message);
        break;
      }
      
      if (!whatsapp || whatsapp.length === 0) break;
      
      for (const user of whatsapp) {
        try {
          const email = normalizeEmail(user.email);
          const phone = normalizePhone(user.telephone);
          const identifiant = email || phone || `whatsapp_${user.id}`;
          
          const { error: upsertError } = await supabase
            .from('statistiques_participants')
            .upsert([{
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
          
          if (upsertError) {
            console.error(`❌ Erreur upsert WhatsApp ${user.id}:`, upsertError.message);
            errors++;
          } else {
            totalSynced++;
          }
        } catch (e) {
          console.error(`❌ Erreur traitement WhatsApp ${user.id}:`, e.message);
          errors++;
        }
      }
      
      from += pageSize;
      hasMore = whatsapp.length === pageSize;
      console.log(`   ✅ ${totalSynced} WhatsApp synchronisés...`);
    }

    // 3. Vérification finale
    console.log('\n🔍 Vérification finale...');
    const { count: finalCount } = await supabase
      .from('statistiques_participants')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n🎉 Synchro V2 terminée !`);
    console.log(`📊 Résumé:`);
    console.log(`   - Total synchronisé: ${totalSynced}`);
    console.log(`   - Erreurs: ${errors}`);
    console.log(`   - Total final dans stats: ${finalCount}`);
    
    if (errors > 0) {
      console.log(`⚠️  ${errors} erreurs rencontrées. Vérifiez les logs ci-dessus.`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

syncAllV2(); 