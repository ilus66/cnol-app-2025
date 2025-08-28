// Script de restauration complète des statistiques depuis les données originales
// VIDE la table statistiques_participants et la resynchronise avec une logique métier claire

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

// LOGIQUE MÉTIER POUR LA GÉOLOCALISATION
const cityMapping = {
  // RABAT (ville principale)
  'RABAT': 'RABAT',
  'RABAT AGDAL': 'RABAT',
  'RABAT HASSAN': 'RABAT',
  'RABAT SOUISSI': 'RABAT',
  
  // SALÉ (ville distincte, de l'autre côté du fleuve)
  'SALÉ': 'SALÉ',
  'SALE': 'SALÉ',
  'SALÉ TABRIA': 'SALÉ',
  'SALÉ BETTANA': 'SALÉ',
  
  // SALA AL JADIDA (ville distincte, près d'El Jadida)
  'SALA AL JADIDA': 'SALA AL JADIDA',
  'SALA AL JADID': 'SALA AL JADIDA',
  
  // CASABLANCA
  'CASABLANCA': 'CASABLANCA',
  'CASA': 'CASABLANCA',
  
  // MARRAKECH
  'MARRAKECH': 'MARRAKECH',
  'MARRAKESH': 'MARRAKECH',
  
  // AGADIR
  'AGADIR': 'AGADIR',
  
  // KENITRA
  'KENITRA': 'KENITRA',
  'KÉNITRA': 'KENITRA',
  
  // TEMARA
  'TEMARA': 'TEMARA',
  'SKHIRATE': 'TEMARA',
  'SKHIRATE-TÉMARA': 'TEMARA',
  
  // TANGER
  'TANGER': 'TANGER',
  'TANGA': 'TANGER',
  
  // FES
  'FES': 'FES',
  'FEZ': 'FES',
  
  // MEKNES
  'MEKNES': 'MEKNES',
  'MEKNÈS': 'MEKNES',
  
  // Valeurs NULL ou vides
  'NULL': null,
  '': null,
  'OPTICIEN': null,
  'ORTHOPTISTE': null
};

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

function normalizeCityName(cityName) {
  if (!cityName) return null;
  
  const normalized = cityName.trim().toUpperCase();
  return cityMapping[normalized] || normalized;
}

async function restoreFromOriginal() {
  console.log('🔄 RESTAURATION COMPLÈTE depuis les données originales...\n');
  console.log('⚠️  ATTENTION: Cette opération va VIDER la table statistiques_participants !\n');
  
  let totalSynced = 0;
  let errors = 0;
  
  try {
    // 1. VIDER la table statistiques_participants
    console.log('🗑️  Vidage de la table statistiques_participants...');
    const { error: deleteError } = await supabase
      .from('statistiques_participants')
      .delete()
      .neq('id', 0); // Supprime tout
    
    if (deleteError) {
      console.error('❌ Erreur vidage table:', deleteError.message);
      return;
    }
    
    console.log('   ✅ Table vidée avec succès\n');
    
    // 2. Inscriptions classiques
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
          const villeNormalisee = normalizeCityName(user.ville);
          
          const { error: upsertError } = await supabase
            .from('statistiques_participants')
            .upsert([{
              identifiant,
              email: user.email,
              telephone: user.telephone,
              nom: user.nom,
              prenom: user.prenom,
              fonction: user.fonction || 'Opticien',
              ville: villeNormalisee,
              source: 'inscription',
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

    // 3. Inscriptions WhatsApp
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
          const villeNormalisee = normalizeCityName(user.ville);
          
          const { error: upsertError } = await supabase
            .from('statistiques_participants')
            .upsert([{
              identifiant,
              email: user.email,
              telephone: user.telephone,
              nom: user.nom,
              prenom: user.prenom,
              fonction: user.fonction || 'Opticien',
              ville: villeNormalisee,
              source: 'whatsapp',
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

    // 4. Vérification finale
    console.log('\n🔍 Vérification finale...');
    const { count: finalCount } = await supabase
      .from('statistiques_participants')
      .select('*', { count: 'exact', head: true });
    
    // 5. Statistiques par ville
    const { data: villesData } = await supabase
      .from('statistiques_participants')
      .select('ville')
      .not('ville', 'is', null);
    
    const cityCounts = {};
    villesData.forEach(record => {
      const city = record.ville;
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });
    
    console.log('\n📊 Top 10 villes après restauration:');
    Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([city, count]) => {
        console.log(`   ${city}: ${count}`);
      });
    
    console.log(`\n🎉 RESTAURATION terminée !`);
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

restoreFromOriginal();
