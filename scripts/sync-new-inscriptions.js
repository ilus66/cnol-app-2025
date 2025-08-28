// Script de synchronisation incrémentale des nouvelles inscriptions
// Ajoute seulement les nouvelles inscriptions sans vider la table

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

// LOGIQUE MÉTIER POUR LA GÉOLOCALISATION (simplifiée)
const cityMapping = {
  // RABAT
  'RABAT': 'RABAT',
  'RABAT AGDAL': 'RABAT',
  'RABAT HASSAN': 'RABAT',
  'RABAT SOUISSI': 'RABAT',
  
  // SALÉ
  'SALÉ': 'SALÉ',
  'SALE': 'SALÉ',
  'SALÉ TABRIA': 'SALÉ',
  'SALÉ BETTANA': 'SALÉ',
  
  // SALA AL JADIDA
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

async function syncNewInscriptions() {
  console.log('🔄 Synchronisation incrémentale des nouvelles inscriptions...\n');
  
  let totalNew = 0;
  let totalUpdated = 0;
  let errors = 0;
  
  try {
    // 1. Vérifier l'état actuel
    console.log('📊 Vérification de l\'état actuel...');
    const [
      { count: inscriptionsCount },
      { count: whatsappCount },
      { count: statsCount }
    ] = await Promise.all([
      supabase.from('inscription').select('*', { count: 'exact', head: true }),
      supabase.from('whatsapp').select('*', { count: 'exact', head: true }),
      supabase.from('statistiques_participants').select('*', { count: 'exact', head: true })
    ]);
    
    console.log(`   Inscriptions: ${inscriptionsCount}`);
    console.log(`   WhatsApp: ${whatsappCount}`);
    console.log(`   Statistiques: ${statsCount}`);
    
    const totalSource = (inscriptionsCount || 0) + (whatsappCount || 0);
    const difference = totalSource - (statsCount || 0);
    
    if (difference <= 0) {
      console.log('\n✅ Synchronisation déjà à jour !');
      return;
    }
    
    console.log(`\n🔄 ${difference} nouvelles inscriptions à synchroniser...\n`);
    
    // 2. Synchroniser les inscriptions classiques
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
          
          // Vérifier si l'utilisateur existe déjà
          const { data: existingUser } = await supabase
            .from('statistiques_participants')
            .select('id')
            .eq('identifiant', identifiant)
            .single();
          
          if (existingUser) {
            // Mettre à jour l'utilisateur existant
            const { error: updateError } = await supabase
              .from('statistiques_participants')
              .update({
                email: user.email,
                telephone: user.telephone,
                nom: user.nom,
                prenom: user.prenom,
                fonction: user.fonction || 'Opticien',
                ville: villeNormalisee,
                source: 'inscription',
                date_injection: user.created_at || new Date().toISOString()
              })
              .eq('identifiant', identifiant);
            
            if (updateError) {
              console.error(`❌ Erreur mise à jour ${user.id}:`, updateError.message);
              errors++;
            } else {
              totalUpdated++;
            }
          } else {
            // Ajouter le nouvel utilisateur
            const { error: insertError } = await supabase
              .from('statistiques_participants')
              .insert([{
                identifiant,
                email: user.email,
                telephone: user.telephone,
                nom: user.nom,
                prenom: user.prenom,
                fonction: user.fonction || 'Opticien',
                ville: villeNormalisee,
                source: 'inscription',
                date_injection: user.created_at || new Date().toISOString()
              }]);
            
            if (insertError) {
              console.error(`❌ Erreur insertion ${user.id}:`, insertError.message);
              errors++;
            } else {
              totalNew++;
            }
          }
        } catch (e) {
          console.error(`❌ Erreur traitement inscription ${user.id}:`, e.message);
          errors++;
        }
      }
      
      from += pageSize;
      hasMore = inscriptions.length === pageSize;
    }

    // 3. Synchroniser les WhatsApp
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
          
          // Vérifier si l'utilisateur existe déjà
          const { data: existingUser } = await supabase
            .from('statistiques_participants')
            .select('id')
            .eq('identifiant', identifiant)
            .single();
          
          if (existingUser) {
            // Mettre à jour l'utilisateur existant
            const { error: updateError } = await supabase
              .from('statistiques_participants')
              .update({
                email: user.email,
                telephone: user.telephone,
                nom: user.nom,
                prenom: user.prenom,
                fonction: user.fonction || 'Opticien',
                ville: villeNormalisee,
                source: 'whatsapp',
                date_injection: user.date_import || new Date().toISOString()
              })
              .eq('identifiant', identifiant);
            
            if (updateError) {
              console.error(`❌ Erreur mise à jour WhatsApp ${user.id}:`, updateError.message);
              errors++;
            } else {
              totalUpdated++;
            }
          } else {
            // Ajouter le nouvel utilisateur
            const { error: insertError } = await supabase
              .from('statistiques_participants')
              .insert([{
                identifiant,
                email: user.email,
                telephone: user.telephone,
                nom: user.nom,
                prenom: user.prenom,
                fonction: user.fonction || 'Opticien',
                ville: villeNormalisee,
                source: 'whatsapp',
                date_injection: user.date_import || new Date().toISOString()
              }]);
            
            if (insertError) {
              console.error(`❌ Erreur insertion WhatsApp ${user.id}:`, insertError.message);
              errors++;
            } else {
              totalNew++;
            }
          }
        } catch (e) {
          console.error(`❌ Erreur traitement WhatsApp ${user.id}:`, e.message);
          errors++;
        }
      }
      
      from += pageSize;
      hasMore = whatsapp.length === pageSize;
    }

    // 4. Vérification finale
    console.log('\n🔍 Vérification finale...');
    const { count: finalStatsCount } = await supabase
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
    
    console.log('\n📊 Top 10 villes après synchronisation:');
    Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([city, count]) => {
        console.log(`   ${city}: ${count}`);
      });
    
    console.log(`\n🎉 Synchronisation terminée !`);
    console.log(`📊 Résumé:`);
    console.log(`   - Nouveaux ajoutés: ${totalNew}`);
    console.log(`   - Mis à jour: ${totalUpdated}`);
    console.log(`   - Erreurs: ${errors}`);
    console.log(`   - Total final dans stats: ${finalStatsCount}`);
    
    if (errors > 0) {
      console.log(`⚠️  ${errors} erreurs rencontrées. Vérifiez les logs ci-dessus.`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

syncNewInscriptions();
